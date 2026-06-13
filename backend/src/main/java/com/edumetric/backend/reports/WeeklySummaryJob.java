package com.edumetric.backend.reports;

import com.edumetric.backend.email.EmailSender;
import com.edumetric.backend.metrics.StudentMetricsRepository;
import com.edumetric.backend.metrics.domain.StudentMetrics;
import com.edumetric.backend.users.domain.User;
import java.math.BigDecimal;
import java.math.RoundingMode;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Weekly progress-summary email to each student. Runs Monday 06:00 UTC and reads the
 * denormalized {@code student_metrics} row (one fetch-join query, no per-student N+1),
 * emailing every student whose global email preference is on.
 *
 * <p><b>Why a {@code @Scheduled} job and not a queue:</b> delivery is a once-a-week batch with
 * one producer and no fan-in — exactly the workload {@code ARCHITECTURE.md} §1/§6 keep on the
 * in-process scheduler. A message broker would add operational surface (a queue to run, monitor
 * and drain) for no throughput or reliability gain at this scale. If volume ever outgrows a single
 * run, the natural next step is chunked paging within this job, still broker-free.
 */
@Component
@RequiredArgsConstructor
public class WeeklySummaryJob {

    private static final Logger log = LoggerFactory.getLogger(WeeklySummaryJob.class);

    private final StudentMetricsRepository studentMetricsRepository;
    private final EmailSender emailSender;

    @Scheduled(cron = "0 0 6 * * MON")
    @Transactional(readOnly = true)
    public void sendWeeklySummaries() {
        int sent = 0;
        for (StudentMetrics m : studentMetricsRepository.findAllWithStudent()) {
            // No composite yet → nothing meaningful to summarize; skip to avoid noise.
            if (m.getCompositeScore() == null) {
                continue;
            }
            User user = m.getStudent().getUser();
            if (user == null || !user.isNotifyEmail() || user.getEmail() == null || user.getEmail().isBlank()) {
                continue;
            }
            emailSender.send(user.getEmail(), "Your weekly progress summary", body(user, m));
            sent++;
        }
        log.info("Weekly summary job emailed {} students", sent);
    }

    private String body(User user, StudentMetrics m) {
        return String.format(
                "Hi %s,%n%n"
                        + "Here is your progress for the past week:%n"
                        + "  • Composite score: %s%n"
                        + "  • Attendance: %s%n"
                        + "  • Grades: %s%n%n"
                        + "Open EduMetric to see the full breakdown and trends.%n",
                user.getFullName(),
                pct(m.getCompositeScore()),
                pct(m.getAttendanceNorm()),
                pct(m.getGradesNorm()));
    }

    /** Formats a 0–100 metric as a rounded percentage, or "—" when not yet available. */
    private static String pct(BigDecimal value) {
        if (value == null) {
            return "—";
        }
        return value.setScale(0, RoundingMode.HALF_UP) + "%";
    }
}
