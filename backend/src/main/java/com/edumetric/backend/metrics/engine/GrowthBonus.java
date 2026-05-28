package com.edumetric.backend.metrics.engine;

import com.edumetric.backend.metrics.engine.ComputeContext.SnapshotInput;
import java.time.LocalDate;
import java.util.List;

public final class GrowthBonus {

    private GrowthBonus() {}

    public static double compute(List<SnapshotInput> snapshots, LocalDate now) {
        if (snapshots == null || snapshots.size() < 2) {
            return 50.0;
        }
        LocalDate recentCutoff = now.minusWeeks(4);
        LocalDate prevCutoff = now.minusWeeks(8);

        double recentSum = 0;
        int recentN = 0;
        double prevSum = 0;
        int prevN = 0;
        for (SnapshotInput s : snapshots) {
            if (!s.date().isBefore(recentCutoff)) {
                recentSum += s.compositeScore();
                recentN++;
            } else if (!s.date().isBefore(prevCutoff)) {
                prevSum += s.compositeScore();
                prevN++;
            }
        }
        if (recentN == 0 || prevN == 0) {
            return 50.0;
        }
        double delta = (recentSum / recentN) - (prevSum / prevN);
        return clamp(50.0 + delta * 5.0);
    }

    private static double clamp(double v) {
        return Math.max(0, Math.min(100, v));
    }
}
