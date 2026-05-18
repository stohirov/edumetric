package com.edumetric.backend.metrics.engine;

import com.edumetric.backend.metrics.engine.ComputeContext.SnapshotInput;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

public final class ConsistencyBonus {

    private ConsistencyBonus() {}

    public static double compute(List<SnapshotInput> snapshots) {
        if (snapshots == null || snapshots.size() < 3) {
            return 50.0;
        }
        List<SnapshotInput> sorted = new ArrayList<>(snapshots);
        sorted.sort(Comparator.comparing(SnapshotInput::date).reversed());
        List<SnapshotInput> last8 = sorted.subList(0, Math.min(8, sorted.size()));

        double sum = 0;
        for (SnapshotInput s : last8) sum += s.compositeScore();
        double mean = sum / last8.size();

        double sq = 0;
        for (SnapshotInput s : last8) {
            double d = s.compositeScore() - mean;
            sq += d * d;
        }
        double stddev = Math.sqrt(sq / last8.size());

        return Math.max(0, Math.min(100, 100.0 - stddev * 5.0));
    }
}
