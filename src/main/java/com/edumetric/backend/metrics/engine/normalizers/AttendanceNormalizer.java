package com.edumetric.backend.metrics.engine.normalizers;

import com.edumetric.backend.metrics.engine.ComputeContext.AttendanceInput;
import com.edumetric.backend.metrics.engine.ComputeContext.AttendanceMark;
import java.util.List;

public final class AttendanceNormalizer {

    private AttendanceNormalizer() {}

    public static double normalize(List<AttendanceInput> records) {
        if (records == null || records.isEmpty()) {
            return 50.0;
        }
        double sum = 0;
        int counted = 0;
        for (AttendanceInput r : records) {
            if (r.mark() == AttendanceMark.EXCUSED) continue;
            sum += weight(r.mark());
            counted++;
        }
        if (counted == 0) {
            return 50.0;
        }
        return clamp((sum / counted) * 100.0);
    }

    private static double weight(AttendanceMark mark) {
        return switch (mark) {
            case PRESENT -> 1.0;
            case LATE -> 0.7;
            case ABSENT -> 0.0;
            case EXCUSED -> 0.0;
        };
    }

    private static double clamp(double v) {
        return Math.max(0, Math.min(100, v));
    }
}
