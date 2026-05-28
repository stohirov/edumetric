package com.edumetric.backend.seed;

import com.edumetric.backend.attendance.AttendanceRepository;
import com.edumetric.backend.attendance.domain.Attendance;
import com.edumetric.backend.attendance.domain.AttendanceStatus;
import com.edumetric.backend.behavior.ActivityRecordRepository;
import com.edumetric.backend.behavior.BehaviorRecordRepository;
import com.edumetric.backend.behavior.domain.ActivityRecord;
import com.edumetric.backend.behavior.domain.BehaviorRecord;
import com.edumetric.backend.courses.CourseRepository;
import com.edumetric.backend.courses.domain.Course;
import com.edumetric.backend.grades.AssignmentRepository;
import com.edumetric.backend.grades.GradeRepository;
import com.edumetric.backend.grades.domain.Assignment;
import com.edumetric.backend.grades.domain.AssignmentType;
import com.edumetric.backend.grades.domain.Grade;
import com.edumetric.backend.groups.GroupRepository;
import com.edumetric.backend.groups.domain.Group;
import com.edumetric.backend.lessons.LessonRepository;
import com.edumetric.backend.lessons.domain.Lesson;
import com.edumetric.backend.metrics.MetricSnapshotRepository;
import com.edumetric.backend.metrics.MetricsService;
import com.edumetric.backend.metrics.domain.MetricSnapshot;
import com.edumetric.backend.students.StudentRepository;
import com.edumetric.backend.students.domain.Student;
import com.edumetric.backend.teachers.TeacherRepository;
import com.edumetric.backend.teachers.domain.Teacher;
import com.edumetric.backend.users.UserRepository;
import com.edumetric.backend.users.domain.Role;
import com.edumetric.backend.users.domain.User;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Profile("dev")
@RequiredArgsConstructor
public class DemoSeedRunner implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DemoSeedRunner.class);

    private static final String ADMIN_EMAIL = "admin@edumetric.io";
    private static final String TEACHER_EMAIL = "teacher@edumetric.io";
    private static final String STUDENT_EMAIL = "student@edumetric.io";
    private static final String DEFAULT_PASSWORD = "Demo2026!";

    private final UserRepository userRepository;
    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;
    private final GroupRepository groupRepository;
    private final LessonRepository lessonRepository;
    private final AssignmentRepository assignmentRepository;
    private final GradeRepository gradeRepository;
    private final AttendanceRepository attendanceRepository;
    private final BehaviorRecordRepository behaviorRepository;
    private final ActivityRecordRepository activityRepository;
    private final MetricSnapshotRepository snapshotRepository;
    private final MetricsService metricsService;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.existsByEmail(ADMIN_EMAIL)) {
            log.info("Demo seed already present, skipping");
            return;
        }
        log.info("Seeding demo data");

        User admin = createUser(ADMIN_EMAIL, "Aziza Karimova", Role.ADMIN);
        User teacherUser = createUser(TEACHER_EMAIL, "Bekhzod Ismailov", Role.TEACHER);
        User studentUser = createUser(STUDENT_EMAIL, "Madina Yusupova", Role.STUDENT);

        Teacher teacher = teacherRepository.save(Teacher.builder()
                .user(teacherUser).department("Web Development").build());

        Course course = courseRepository.save(Course.builder()
                .name("Full-Stack JavaScript")
                .code("FSJS-2026")
                .description("Modern Node.js and React engineering")
                .build());

        Group groupA = groupRepository.save(Group.builder()
                .name("FSJS-A26").course(course)
                .startDate(LocalDate.of(2026, 1, 6))
                .endDate(LocalDate.of(2026, 7, 6)).build());

        Student demoStudent = studentRepository.save(Student.builder()
                .user(studentUser).group(groupA)
                .enrolledAt(LocalDate.of(2026, 1, 6)).build());

        List<String[]> peers = List.of(
                new String[]{"laziz@edumetric.io", "Laziz Tursunov"},
                new String[]{"shahzoda@edumetric.io", "Shahzoda Rakhimova"},
                new String[]{"diyor@edumetric.io", "Diyor Komilov"},
                new String[]{"nigora@edumetric.io", "Nigora Sobirova"},
                new String[]{"anvar@edumetric.io", "Anvar Tashkentov"},
                new String[]{"farangiz@edumetric.io", "Farangiz Olimova"},
                new String[]{"sergey@edumetric.io", "Sergey Petrov"},
                new String[]{"elena@edumetric.io", "Elena Voronova"});

        List<Student> students = new ArrayList<>();
        students.add(demoStudent);
        for (String[] p : peers) {
            User u = createUser(p[0], p[1], Role.STUDENT);
            Student s = studentRepository.save(Student.builder()
                    .user(u).group(groupA)
                    .enrolledAt(LocalDate.of(2026, 1, 6)).build());
            students.add(s);
        }

        OffsetDateTime base = OffsetDateTime.now(ZoneOffset.UTC).withHour(10).withMinute(0).withSecond(0).withNano(0);
        List<Lesson> lessons = new ArrayList<>();
        String[] topics = {
                "Intro to JS", "ES Modules", "Async patterns", "REST APIs",
                "PostgreSQL basics", "React fundamentals", "State management",
                "Forms & validation", "Testing", "Deployment"
        };
        for (int i = 0; i < topics.length; i++) {
            Lesson l = lessonRepository.save(Lesson.builder()
                    .group(groupA).course(course).teacher(teacher).topic(topics[i])
                    .scheduledAt(base.minusDays((topics.length - i) * 3L))
                    .build());
            lessons.add(l);
        }

        List<Assignment> assignments = new ArrayList<>();
        assignments.add(saveAssignment(course, "Quiz 1", AssignmentType.THEORY, 100, "1.0"));
        assignments.add(saveAssignment(course, "Quiz 2", AssignmentType.THEORY, 100, "1.0"));
        assignments.add(saveAssignment(course, "Lab: Async", AssignmentType.PRACTICAL, 100, "1.5"));
        assignments.add(saveAssignment(course, "Lab: API", AssignmentType.PRACTICAL, 100, "1.5"));
        assignments.add(saveAssignment(course, "Midterm Exam", AssignmentType.EXAM, 100, "2.0"));
        assignments.add(saveAssignment(course, "Capstone Project", AssignmentType.PROJECT, 100, "3.0"));

        Random rng = new Random(42);
        Instant gradingStart = Instant.now().minus(java.time.Duration.ofDays(6));
        for (int i = 0; i < students.size(); i++) {
            Student s = students.get(i);
            int profile = profileFor(i);
            for (int aIdx = 0; aIdx < assignments.size(); aIdx++) {
                Assignment a = assignments.get(aIdx);
                int val = Math.max(20, Math.min(100, profile + rng.nextInt(21) - 10));
                long offsetSeconds =
                        (long) ((aIdx + i * 0.3) * (6 * 24 * 60 * 60.0 / Math.max(1, assignments.size())));
                Instant gradedAt = gradingStart.plus(java.time.Duration.ofSeconds(offsetSeconds));
                gradeRepository.save(Grade.builder()
                        .student(s).assignment(a)
                        .value(BigDecimal.valueOf(val))
                        .gradedBy(teacherUser)
                        .gradedAt(gradedAt)
                        .build());
            }
            for (Lesson l : lessons) {
                AttendanceStatus status = pickAttendance(profile, rng);
                attendanceRepository.save(Attendance.builder()
                        .student(s).lesson(l).status(status)
                        .markedBy(teacherUser).markedAt(l.getScheduledAt().toInstant())
                        .build());
            }
            for (int w = 0; w < 4; w++) {
                LocalDate start = LocalDate.now().minusWeeks(4L - w);
                LocalDate end = start.plusDays(6);
                int behavior = ratingFor(profile, rng);
                int activity = ratingFor(profile, rng);
                behaviorRepository.save(BehaviorRecord.builder()
                        .student(s).teacher(teacher)
                        .periodStart(start).periodEnd(end)
                        .value((short) behavior).build());
                activityRepository.save(ActivityRecord.builder()
                        .student(s).teacher(teacher)
                        .periodStart(start).periodEnd(end)
                        .value((short) activity).build());
            }
        }

        for (Student s : students) {
            metricsService.recompute(s.getId());
        }

        seedHistoricSnapshots(students, rng);

        for (Student s : students) {
            metricsService.recompute(s.getId());
        }

        log.info("Demo seed complete: {} students, {} lessons, {} assignments",
                students.size(), lessons.size(), assignments.size());
    }

    private User createUser(String email, String fullName, Role role) {
        return userRepository.save(User.builder()
                .email(email).fullName(fullName)
                .passwordHash(passwordEncoder.encode(DEFAULT_PASSWORD))
                .role(role).build());
    }

    private Assignment saveAssignment(Course course, String name, AssignmentType type,
                                      int maxValue, String weight) {
        return assignmentRepository.save(Assignment.builder()
                .course(course).name(name).type(type)
                .maxValue(BigDecimal.valueOf(maxValue))
                .weight(new BigDecimal(weight))
                .dueDate(LocalDate.now().minusDays(7))
                .build());
    }

    private int profileFor(int idx) {
        return switch (idx) {
            case 0 -> 78;
            case 1 -> 92;
            case 2 -> 45;
            case 3 -> 70;
            case 4 -> 60;
            case 5 -> 85;
            case 6 -> 55;
            case 7 -> 35;
            case 8 -> 75;
            default -> 65;
        };
    }

    private AttendanceStatus pickAttendance(int profile, Random rng) {
        int roll = rng.nextInt(100);
        if (profile >= 80) return roll < 90 ? AttendanceStatus.PRESENT
                : (roll < 96 ? AttendanceStatus.LATE : AttendanceStatus.ABSENT);
        if (profile >= 60) return roll < 75 ? AttendanceStatus.PRESENT
                : (roll < 88 ? AttendanceStatus.LATE : AttendanceStatus.ABSENT);
        return roll < 55 ? AttendanceStatus.PRESENT
                : (roll < 70 ? AttendanceStatus.LATE
                : (roll < 92 ? AttendanceStatus.ABSENT : AttendanceStatus.EXCUSED));
    }

    private int ratingFor(int profile, Random rng) {
        if (profile >= 80) return 4 + rng.nextInt(2);
        if (profile >= 60) return 3 + rng.nextInt(2);
        return 1 + rng.nextInt(3);
    }

    private void seedHistoricSnapshots(List<Student> students, Random rng) {
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        int totalWeeks = 26;
        for (int i = 0; i < students.size(); i++) {
            Student s = students.get(i);
            double trajectory = profileFor(i);
            for (int week = totalWeeks; week >= 1; week--) {
                LocalDate date = today.minusWeeks(week);
                double noise = (rng.nextDouble() - 0.5) * 6;
                double drift = (totalWeeks - week) * 0.25;
                double score = clamp(trajectory + drift + noise);
                snapshotRepository.save(MetricSnapshot.builder()
                        .student(s).snapshotDate(date)
                        .compositeScore(BigDecimal.valueOf(score))
                        .gradesNorm(BigDecimal.valueOf(clamp(score + (rng.nextDouble() - 0.5) * 8)))
                        .attendanceNorm(BigDecimal.valueOf(clamp(score + (rng.nextDouble() - 0.5) * 12)))
                        .practicalNorm(BigDecimal.valueOf(clamp(score + (rng.nextDouble() - 0.5) * 10)))
                        .behaviorNorm(BigDecimal.valueOf(clamp(score + (rng.nextDouble() - 0.5) * 10)))
                        .activityNorm(BigDecimal.valueOf(clamp(score + (rng.nextDouble() - 0.5) * 10)))
                        .build());
            }
        }
    }

    private static double clamp(double v) {
        return Math.max(0, Math.min(100, Math.round(v * 100.0) / 100.0));
    }
}
