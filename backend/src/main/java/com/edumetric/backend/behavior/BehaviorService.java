package com.edumetric.backend.behavior;

import com.edumetric.backend.behavior.domain.ActivityRecord;
import com.edumetric.backend.behavior.domain.BehaviorRecord;
import com.edumetric.backend.behavior.dto.BehaviorRecordRequest;
import com.edumetric.backend.common.exception.ForbiddenException;
import com.edumetric.backend.common.exception.ResourceNotFoundException;
import com.edumetric.backend.metrics.MetricsService;
import com.edumetric.backend.security.AuthenticatedUser;
import com.edumetric.backend.security.TeacherScope;
import com.edumetric.backend.students.StudentRepository;
import com.edumetric.backend.students.domain.Student;
import com.edumetric.backend.teachers.TeacherRepository;
import com.edumetric.backend.teachers.domain.Teacher;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BehaviorService {

    private final BehaviorRecordRepository behaviorRepository;
    private final ActivityRecordRepository activityRepository;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final TeacherScope teacherScope;
    private final MetricsService metricsService;

    @Transactional
    public Set<Long> createBehavior(List<BehaviorRecordRequest> entries, AuthenticatedUser actor) {
        Teacher teacher = resolveTeacher(actor);
        Set<Long> affected = new HashSet<>();
        for (BehaviorRecordRequest entry : entries) {
            teacherScope.assertCanWriteFor(actor, entry.studentId());
            Student student = studentRepository.findById(entry.studentId())
                    .orElseThrow(() -> ResourceNotFoundException.of("Student", entry.studentId()));
            BehaviorRecord record = BehaviorRecord.builder()
                    .student(student)
                    .teacher(teacher)
                    .periodStart(entry.periodStart())
                    .periodEnd(entry.periodEnd())
                    .value(entry.value())
                    .comment(entry.comment())
                    .build();
            behaviorRepository.save(record);
            affected.add(student.getId());
        }
        metricsService.recomputeAll(affected);
        return affected;
    }

    @Transactional
    public Set<Long> createActivity(List<BehaviorRecordRequest> entries, AuthenticatedUser actor) {
        Teacher teacher = resolveTeacher(actor);
        Set<Long> affected = new HashSet<>();
        for (BehaviorRecordRequest entry : entries) {
            teacherScope.assertCanWriteFor(actor, entry.studentId());
            Student student = studentRepository.findById(entry.studentId())
                    .orElseThrow(() -> ResourceNotFoundException.of("Student", entry.studentId()));
            ActivityRecord record = ActivityRecord.builder()
                    .student(student)
                    .teacher(teacher)
                    .periodStart(entry.periodStart())
                    .periodEnd(entry.periodEnd())
                    .value(entry.value())
                    .comment(entry.comment())
                    .build();
            activityRepository.save(record);
            affected.add(student.getId());
        }
        metricsService.recomputeAll(affected);
        return affected;
    }

    private Teacher resolveTeacher(AuthenticatedUser actor) {
        return teacherRepository.findByUserId(actor.id())
                .orElseThrow(() -> new ForbiddenException("Only teachers can record behavior or activity"));
    }
}
