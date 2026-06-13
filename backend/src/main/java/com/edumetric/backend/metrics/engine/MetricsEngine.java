package com.edumetric.backend.metrics.engine;

import com.edumetric.backend.metrics.engine.normalizers.AttendanceNormalizer;
import com.edumetric.backend.metrics.engine.normalizers.GradesNormalizer;
import com.edumetric.backend.metrics.engine.normalizers.PracticalNormalizer;
import com.edumetric.backend.metrics.engine.normalizers.RatingNormalizer;
import java.time.LocalDate;

public final class MetricsEngine {

    private static final int MIN_GRADES_FOR_SCORE = 5;

    /**
     * Below this many total signals (grades + attendance + behavior + activity) a composite score
     * is still produced, but it rests on too thin a sample to be reliable — we flag it as
     * low-confidence so dashboards can caveat it rather than presenting it as settled.
     */
    private static final int MIN_RELIABLE_SAMPLE = 12;

    private MetricsEngine() {}

    public static ComputedMetrics compute(ComputeContext ctx, LocalDate now) {
        double gradesNorm = GradesNormalizer.normalize(ctx.grades());
        double attendanceNorm = AttendanceNormalizer.normalize(ctx.attendance());
        double practicalNorm = PracticalNormalizer.normalize(ctx.grades());
        double behaviorNorm = RatingNormalizer.normalize(ctx.behavior());
        double activityNorm = RatingNormalizer.normalize(ctx.activity());
        double growthBonus = GrowthBonus.compute(ctx.snapshots(), now);
        double consistencyBonus = ConsistencyBonus.compute(ctx.snapshots());

        int sampleSize = (ctx.grades() == null ? 0 : ctx.grades().size())
                + (ctx.attendance() == null ? 0 : ctx.attendance().size())
                + (ctx.behavior() == null ? 0 : ctx.behavior().size())
                + (ctx.activity() == null ? 0 : ctx.activity().size());

        int gradeCount = ctx.grades() == null ? 0 : ctx.grades().size();
        boolean insufficient = gradeCount < MIN_GRADES_FOR_SCORE;
        boolean lowConfidence = !insufficient && sampleSize < MIN_RELIABLE_SAMPLE;

        Double composite = insufficient ? null : clamp(ctx.formula().apply(
                gradesNorm,
                attendanceNorm,
                practicalNorm,
                behaviorNorm,
                activityNorm,
                growthBonus,
                consistencyBonus));

        return new ComputedMetrics(
                composite,
                gradesNorm,
                attendanceNorm,
                practicalNorm,
                behaviorNorm,
                activityNorm,
                growthBonus,
                consistencyBonus,
                sampleSize,
                insufficient,
                lowConfidence);
    }

    private static double clamp(double v) {
        return Math.max(0, Math.min(100, v));
    }
}
