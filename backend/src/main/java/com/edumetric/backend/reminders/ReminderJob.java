package com.edumetric.backend.reminders;

import com.edumetric.backend.grades.AssignmentRepository;
import com.edumetric.backend.grades.domain.Assignment;
import com.edumetric.backend.lessons.LessonRepository;
import com.edumetric.backend.lessons.domain.Lesson;
import com.edumetric.backend.notifications.NotificationService;
import com.edumetric.backend.notifications.domain.NotificationType;
import com.edumetric.backend.reminders.domain.ReminderLog;
import com.edumetric.backend.reminders.domain.ReminderType;
import com.edumetric.backend.students.StudentRepository;
import com.edumetric.backend.students.domain.Student;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Nightly reminders for the next day's lessons and assignments due tomorrow. Each (reminder,
 * recipient) pair is recorded in {@code reminder_log}, so overlapping runs never double-notify.
 * Reminders fan out through {@link NotificationService}, so they inherit each student's in-app/
 * email channel preferences for the {@code REMINDER} event.
 */
@Component
@RequiredArgsConstructor
public class ReminderJob {

    private static final Logger log = LoggerFactory.getLogger(ReminderJob.class);

    private final LessonRepository lessonRepository;
    private final AssignmentRepository assignmentRepository;
    private final StudentRepository studentRepository;
    private final ReminderLogRepository reminderLogRepository;
    private final NotificationService notificationService;

    @Scheduled(cron = "0 0 7 * * *")
    @Transactional
    public void sendReminders() {
        int sent = remindUpcomingLessons() + remindAssignmentsDue();
        log.info("Reminder job sent {} reminders", sent);
    }

    private int remindUpcomingLessons() {
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        OffsetDateTime until = now.plusHours(24);
        int sent = 0;
        for (Lesson lesson : lessonRepository.findAllByScheduledAtBetweenOrderByScheduledAt(now, until)) {
            String title = "Upcoming lesson tomorrow";
            String body = String.format("\"%s\" (%s) is scheduled for %s.",
                    lesson.getTopic(), lesson.getCourse().getName(),
                    lesson.getScheduledAt().toLocalDate());
            for (Long userId : studentRepository.findUserIdsByGroupId(lesson.getGroup().getId())) {
                if (record(ReminderType.UPCOMING_LESSON, lesson.getId(), userId)) {
                    notificationService.notifyUser(
                            userId, NotificationType.REMINDER, title, body, "/student/attendance");
                    sent++;
                }
            }
        }
        return sent;
    }

    private int remindAssignmentsDue() {
        LocalDate tomorrow = LocalDate.now(ZoneOffset.UTC).plusDays(1);
        int sent = 0;
        for (Assignment assignment : assignmentRepository.findAllByDueDate(tomorrow)) {
            String title = "Assignment due tomorrow";
            String body = String.format("\"%s\" (%s) is due %s.",
                    assignment.getName(), assignment.getCourse().getName(), tomorrow);
            for (Student student : studentRepository.findAllForCourse(assignment.getCourse().getId())) {
                Long userId = student.getUser().getId();
                if (record(ReminderType.ASSIGNMENT_DUE, assignment.getId(), userId)) {
                    notificationService.notifyUser(
                            userId, NotificationType.REMINDER, title, body, "/student/homework");
                    sent++;
                }
            }
        }
        return sent;
    }

    /** Returns true if this is the first time we're reminding {@code userId} about {@code refId}. */
    private boolean record(ReminderType type, Long refId, Long userId) {
        if (reminderLogRepository.existsByReminderTypeAndRefIdAndUserId(type, refId, userId)) {
            return false;
        }
        reminderLogRepository.save(ReminderLog.builder()
                .reminderType(type)
                .refId(refId)
                .userId(userId)
                .build());
        return true;
    }
}
