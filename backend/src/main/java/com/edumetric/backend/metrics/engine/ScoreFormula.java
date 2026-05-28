package com.edumetric.backend.metrics.engine;

public record ScoreFormula(
        String version,
        double grades,
        double attendance,
        double practical,
        double behavior,
        double activity,
        double growth,
        double consistency) {

    public double apply(
            double gradesNorm,
            double attendanceNorm,
            double practicalNorm,
            double behaviorNorm,
            double activityNorm,
            double growthBonus,
            double consistencyBonus) {
        return grades * gradesNorm
                + attendance * attendanceNorm
                + practical * practicalNorm
                + behavior * behaviorNorm
                + activity * activityNorm
                + growth * growthBonus
                + consistency * consistencyBonus;
    }
}
