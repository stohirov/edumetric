package com.edumetric.backend.reports;

import com.edumetric.backend.attendance.AttendanceRepository;
import com.edumetric.backend.attendance.domain.Attendance;
import com.edumetric.backend.attendance.domain.AttendanceStatus;
import com.edumetric.backend.common.exception.ForbiddenException;
import com.edumetric.backend.common.exception.ResourceNotFoundException;
import com.edumetric.backend.grades.GradeRepository;
import com.edumetric.backend.grades.domain.Grade;
import com.edumetric.backend.groups.domain.Group;
import com.edumetric.backend.lessons.LessonRepository;
import com.edumetric.backend.metrics.MetricSnapshotRepository;
import com.edumetric.backend.metrics.StudentMetricsRepository;
import com.edumetric.backend.metrics.domain.StudentMetrics;
import com.edumetric.backend.security.AuthenticatedUser;
import com.edumetric.backend.security.TeacherScope;
import com.edumetric.backend.students.StudentRepository;
import com.edumetric.backend.students.domain.Student;
import com.edumetric.backend.users.domain.Role;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReportsService {

    private final StudentMetricsRepository studentMetricsRepository;
    private final MetricSnapshotRepository metricSnapshotRepository;
    private final StudentRepository studentRepository;
    private final GradeRepository gradeRepository;
    private final AttendanceRepository attendanceRepository;
    private final LessonRepository lessonRepository;
    private final TeacherScope teacherScope;

    @Transactional(readOnly = true)
    public ProgressReportDto progressReport(AuthenticatedUser actor, Long studentId) {
        authorizeStudentAccess(actor, studentId);
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> ResourceNotFoundException.of("Student", studentId));

        ProgressReportDto.MetricsSummary metrics = studentMetricsRepository.findByStudentId(studentId)
                .map(this::toMetricsSummary)
                .orElse(null);

        List<ProgressReportDto.TrendPointDto> trend = metricSnapshotRepository
                .findAllByStudentIdOrderBySnapshotDateAsc(studentId)
                .stream()
                .map(s -> new ProgressReportDto.TrendPointDto(s.getSnapshotDate(), s.getCompositeScore()))
                .toList();

        List<Attendance> records = attendanceRepository.findAllByStudentId(studentId);
        ProgressReportDto.AttendanceSummary attendance = toAttendanceSummary(records);

        List<ProgressReportDto.GradeRowDto> grades = gradeRepository.findAllByStudentId(studentId)
                .stream()
                .map(this::toGradeRow)
                .toList();

        Group group = student.getGroup();
        return new ProgressReportDto(
                student.getId(),
                student.getUser().getFullName(),
                student.getUser().getEmail(),
                group != null ? group.getId() : null,
                group != null ? group.getName() : null,
                metrics,
                trend,
                attendance,
                grades);
    }

    @Transactional(readOnly = true)
    public ProgressReportDto myProgressReport(AuthenticatedUser actor) {
        Student student = studentRepository.findByUserId(actor.id())
                .orElseThrow(() -> ResourceNotFoundException.of("Student", actor.id()));
        return progressReport(actor, student.getId());
    }

    @Transactional(readOnly = true)
    public String metricsRosterCsv(AuthenticatedUser actor) {
        List<StudentMetrics> rows;
        if (actor.role() == Role.ADMIN) {
            rows = studentMetricsRepository.findAll();
        } else {
            List<Long> groupIds = lessonRepository.findGroupIdsForTeacherUser(actor.id());
            rows = groupIds.isEmpty()
                    ? List.of()
                    : studentMetricsRepository.findAllByStudentGroupIdIn(groupIds);
        }

        StringBuilder sb = new StringBuilder();
        appendCsvRow(sb, "studentId", "name", "group", "composite", "grades", "attendance",
                "practical", "behavior", "activity", "sampleSize", "computedAt");
        for (StudentMetrics m : rows) {
            Student student = m.getStudent();
            Group group = student.getGroup();
            appendCsvRow(sb,
                    str(student.getId()),
                    student.getUser().getFullName(),
                    group != null ? group.getName() : "",
                    str(m.getCompositeScore()),
                    str(m.getGradesNorm()),
                    str(m.getAttendanceNorm()),
                    str(m.getPracticalNorm()),
                    str(m.getBehaviorNorm()),
                    str(m.getActivityNorm()),
                    String.valueOf(m.getSampleSize()),
                    str(m.getComputedAt()));
        }
        return sb.toString();
    }

    @Transactional(readOnly = true)
    public String studentGradesCsv(AuthenticatedUser actor, Long studentId) {
        authorizeStudentAccess(actor, studentId);
        List<Grade> grades = gradeRepository.findAllByStudentId(studentId);

        StringBuilder sb = new StringBuilder();
        appendCsvRow(sb, "assignment", "value", "max", "gradedAt");
        for (Grade g : grades) {
            appendCsvRow(sb,
                    g.getAssignment().getName(),
                    str(g.getValue()),
                    str(g.getAssignment().getMaxValue()),
                    str(g.getGradedAt()));
        }
        return sb.toString();
    }

    private void authorizeStudentAccess(AuthenticatedUser actor, Long studentId) {
        switch (actor.role()) {
            case ADMIN -> {
                // any
            }
            case TEACHER -> teacherScope.assertCanWriteFor(actor, studentId);
            case STUDENT -> {
                Student self = studentRepository.findByUserId(actor.id())
                        .orElseThrow(() -> new ForbiddenException("Not authorized for student " + studentId));
                if (!self.getId().equals(studentId)) {
                    throw new ForbiddenException("Not authorized for student " + studentId);
                }
            }
            default -> throw new ForbiddenException("Not authorized for student " + studentId);
        }
    }

    private ProgressReportDto.MetricsSummary toMetricsSummary(StudentMetrics m) {
        return new ProgressReportDto.MetricsSummary(
                m.getCompositeScore(),
                m.getGradesNorm(),
                m.getAttendanceNorm(),
                m.getPracticalNorm(),
                m.getBehaviorNorm(),
                m.getActivityNorm(),
                m.getGrowthBonus(),
                m.getConsistencyBonus(),
                m.getSampleSize(),
                m.getFormulaVersion(),
                m.getComputedAt(),
                m.getCompositeScore() == null);
    }

    private ProgressReportDto.AttendanceSummary toAttendanceSummary(List<Attendance> records) {
        long present = count(records, AttendanceStatus.PRESENT);
        long absent = count(records, AttendanceStatus.ABSENT);
        long late = count(records, AttendanceStatus.LATE);
        long excused = count(records, AttendanceStatus.EXCUSED);
        long total = records.size();
        BigDecimal percent = total == 0
                ? BigDecimal.ZERO
                : BigDecimal.valueOf(present + late)
                        .multiply(BigDecimal.valueOf(100))
                        .divide(BigDecimal.valueOf(total), 2, RoundingMode.HALF_UP);
        return new ProgressReportDto.AttendanceSummary(present, absent, late, excused, percent);
    }

    private ProgressReportDto.GradeRowDto toGradeRow(Grade g) {
        return new ProgressReportDto.GradeRowDto(
                g.getAssignment().getName(),
                g.getValue(),
                g.getAssignment().getMaxValue(),
                g.getGradedAt());
    }

    private long count(List<Attendance> records, AttendanceStatus status) {
        return records.stream().filter(a -> a.getStatus() == status).count();
    }

    private static String str(Object value) {
        return value == null ? "" : value.toString();
    }

    private static void appendCsvRow(StringBuilder sb, String... fields) {
        for (int i = 0; i < fields.length; i++) {
            if (i > 0) {
                sb.append(',');
            }
            sb.append(quote(fields[i]));
        }
        sb.append('\n');
    }

    private static String quote(String field) {
        String value = field == null ? "" : field;
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return '"' + value.replace("\"", "\"\"") + '"';
        }
        return value;
    }
}
