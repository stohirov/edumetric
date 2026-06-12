package com.edumetric.backend.attendance;

import com.edumetric.backend.attendance.domain.Attendance;
import com.edumetric.backend.attendance.domain.AttendancePolicy;
import com.edumetric.backend.attendance.domain.AttendanceStatus;
import com.edumetric.backend.attendance.dto.AttendanceReportDto;
import com.edumetric.backend.attendance.dto.GroupAttendanceReportDto;
import com.edumetric.backend.common.exception.ResourceNotFoundException;
import com.edumetric.backend.groups.GroupRepository;
import com.edumetric.backend.groups.domain.Group;
import com.edumetric.backend.security.AuthenticatedUser;
import com.edumetric.backend.security.TeacherScope;
import com.edumetric.backend.students.StudentRepository;
import com.edumetric.backend.students.domain.Student;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Builds per-student and per-group attendance summaries with attendance percentages and an
 * at-risk flag derived from the institution-wide attendance policy.
 */
@Service
@RequiredArgsConstructor
public class AttendanceReportService {

    private final AttendanceRepository attendanceRepository;
    private final StudentRepository studentRepository;
    private final GroupRepository groupRepository;
    private final AttendancePolicyService attendancePolicyService;
    private final TeacherScope teacherScope;

    /** Teacher/admin: attendance summary for a single student (scope-checked). */
    @Transactional(readOnly = true)
    public AttendanceReportDto studentReport(Long studentId, AuthenticatedUser actor) {
        teacherScope.assertCanWriteFor(actor, studentId);
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> ResourceNotFoundException.of("Student", studentId));
        return buildReport(student, minPercent());
    }

    /** Student: attendance summary for the calling user. */
    @Transactional(readOnly = true)
    public AttendanceReportDto myReport(AuthenticatedUser actor) {
        Student student = studentRepository.findByUserId(actor.id())
                .orElseThrow(() -> ResourceNotFoundException.of("Student for user", actor.id()));
        return buildReport(student, minPercent());
    }

    /** Teacher/admin: attendance summaries for every student in a group plus the group average. */
    @Transactional(readOnly = true)
    public GroupAttendanceReportDto groupReport(Long groupId, AuthenticatedUser actor) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> ResourceNotFoundException.of("Group", groupId));
        teacherScope.assertTeachesCourse(actor, group.getCourse().getId());

        double minPercent = minPercent();
        List<Student> students =
                studentRepository.findAllByGroupId(groupId, Pageable.unpaged()).getContent();

        List<AttendanceReportDto> reports = students.stream()
                .map(student -> buildReport(student, minPercent))
                .toList();

        Double groupAverage = reports.stream()
                .map(AttendanceReportDto::attendancePercent)
                .filter(p -> p != null)
                .mapToDouble(Double::doubleValue)
                .average()
                .stream()
                .mapToObj(AttendanceReportService::round1)
                .findFirst()
                .orElse(null);

        return new GroupAttendanceReportDto(group.getId(), group.getName(), groupAverage, reports);
    }

    private double minPercent() {
        AttendancePolicy policy = attendancePolicyService.current();
        return policy.getMinAttendancePercent().doubleValue();
    }

    private AttendanceReportDto buildReport(Student student, double minPercent) {
        List<Attendance> records = attendanceRepository.findAllByStudentId(student.getId());

        int present = 0;
        int late = 0;
        int absent = 0;
        int excused = 0;
        for (Attendance record : records) {
            AttendanceStatus status = record.getStatus();
            switch (status) {
                case PRESENT -> present++;
                case LATE -> late++;
                case ABSENT -> absent++;
                case EXCUSED -> excused++;
            }
        }

        int total = present + late + absent + excused;
        int attendedFavorably = present + late + excused;
        Double attendancePercent =
                total == 0 ? null : round1((double) attendedFavorably / total * 100);
        boolean atRisk = attendancePercent != null && attendancePercent < minPercent;

        return new AttendanceReportDto(
                student.getId(),
                student.getUser().getFullName(),
                present,
                late,
                absent,
                excused,
                total,
                attendancePercent,
                atRisk,
                minPercent);
    }

    private static double round1(double value) {
        return Math.round(value * 10.0) / 10.0;
    }
}
