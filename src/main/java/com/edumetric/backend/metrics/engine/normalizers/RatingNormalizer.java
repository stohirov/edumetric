package com.edumetric.backend.metrics.engine.normalizers;

import com.edumetric.backend.metrics.engine.ComputeContext.RatingInput;
import java.util.List;

public final class RatingNormalizer {

    private RatingNormalizer() {}

    public static double normalize(List<RatingInput> records) {
        if (records == null || records.isEmpty()) {
            return 50.0;
        }
        double sum = 0;
        int n = 0;
        for (RatingInput r : records) {
            int v = Math.max(1, Math.min(5, r.value()));
            sum += v;
            n++;
        }
        double avg = sum / n;
        return clamp(((avg - 1.0) / 4.0) * 100.0);
    }

    private static double clamp(double v) {
        return Math.max(0, Math.min(100, v));
    }
}
