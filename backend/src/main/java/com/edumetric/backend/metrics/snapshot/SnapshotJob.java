package com.edumetric.backend.metrics.snapshot;

import com.edumetric.backend.metrics.MetricSnapshotRepository;
import com.edumetric.backend.metrics.StudentMetricsRepository;
import com.edumetric.backend.metrics.domain.MetricSnapshot;
import com.edumetric.backend.metrics.domain.StudentMetrics;
import java.time.LocalDate;
import java.time.ZoneOffset;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class SnapshotJob {

    private static final Logger log = LoggerFactory.getLogger(SnapshotJob.class);

    private final StudentMetricsRepository studentMetricsRepository;
    private final MetricSnapshotRepository metricSnapshotRepository;

    /**
     * Guarantees one snapshot per student per day. Runs nightly at 02:00 UTC; the per-date
     * dedup makes it idempotent, so a manual mid-day trigger (or a restart-and-rerun) never
     * double-writes. This is what keeps the growth/consistency trends continuous rather than
     * only capturing whatever days happened to have an on-demand recompute.
     */
    @Scheduled(cron = "0 0 2 * * *")
    @Transactional
    public void dailySnapshot() {
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        int written = 0;
        for (StudentMetrics m : studentMetricsRepository.findAll()) {
            if (metricSnapshotRepository
                    .findByStudentIdAndSnapshotDate(m.getStudent().getId(), today).isPresent()) {
                continue;
            }
            metricSnapshotRepository.save(MetricSnapshot.builder()
                    .student(m.getStudent())
                    .snapshotDate(today)
                    .compositeScore(m.getCompositeScore())
                    .gradesNorm(m.getGradesNorm())
                    .attendanceNorm(m.getAttendanceNorm())
                    .practicalNorm(m.getPracticalNorm())
                    .behaviorNorm(m.getBehaviorNorm())
                    .activityNorm(m.getActivityNorm())
                    .growthBonus(m.getGrowthBonus())
                    .consistencyBonus(m.getConsistencyBonus())
                    .build());
            written++;
        }
        log.info("Daily snapshot written: {} rows on {}", written, today);
    }
}
