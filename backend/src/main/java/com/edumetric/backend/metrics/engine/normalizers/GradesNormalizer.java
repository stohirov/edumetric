package com.edumetric.backend.metrics.engine.normalizers;

import com.edumetric.backend.metrics.engine.ComputeContext.GradeInput;
import java.util.List;

public final class GradesNormalizer {

    private GradesNormalizer() {}

    public static double normalize(List<GradeInput> grades) {
        if (grades == null || grades.isEmpty()) {
            return 50.0;
        }
        double weighted = 0;
        double weightSum = 0;
        for (GradeInput g : grades) {
            if (g.maxValue() <= 0) continue;
            double pct = (g.value() / g.maxValue()) * 100.0;
            double w = Math.max(0, g.weight());
            weighted += pct * w;
            weightSum += w;
        }
        if (weightSum <= 0) {
            return 50.0;
        }
        return clamp(weighted / weightSum);
    }

    private static double clamp(double v) {
        return Math.max(0, Math.min(100, v));
    }
}
