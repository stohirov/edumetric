package com.edumetric.backend.gradebook;

import com.edumetric.backend.settings.domain.GradingScale;

/**
 * Presents a 0–100 course percentage in the institution's configured
 * {@link GradingScale}. The underlying percentage is always computed the same
 * way (weighted across graded assignments); only the display representation
 * changes, so a single number drives the percent bar, the letter, and the GPA.
 */
public final class GradeScale {

    private GradeScale() {}

    /** A–F letter for a percentage, using the conventional 90/80/70/60 cutoffs. */
    public static String letter(double percent) {
        if (percent >= 90) return "A";
        if (percent >= 80) return "B";
        if (percent >= 70) return "C";
        if (percent >= 60) return "D";
        return "F";
    }

    /** 0.0–4.0 grade point for a percentage, on a standard 10-point-per-grade ramp. */
    public static double gpa(double percent) {
        if (percent >= 93) return 4.0;
        if (percent >= 90) return 3.7;
        if (percent >= 87) return 3.3;
        if (percent >= 83) return 3.0;
        if (percent >= 80) return 2.7;
        if (percent >= 77) return 2.3;
        if (percent >= 73) return 2.0;
        if (percent >= 70) return 1.7;
        if (percent >= 67) return 1.3;
        if (percent >= 63) return 1.0;
        if (percent >= 60) return 0.7;
        return 0.0;
    }

    /** Human-readable label for a percentage under the given scale (null when ungraded). */
    public static String display(Double percent, GradingScale scale) {
        if (percent == null) {
            return null;
        }
        return switch (scale) {
            case PERCENT -> Math.round(percent) + "%";
            case LETTER -> letter(percent);
            case GPA_4 -> String.format("%.1f", gpa(percent));
        };
    }
}
