package com.edumetric.backend.metrics.engine;

public record ComputedMetrics(
        Double compositeScore,
        double gradesNorm,
        double attendanceNorm,
        double practicalNorm,
        double behaviorNorm,
        double activityNorm,
        double growthBonus,
        double consistencyBonus,
        int sampleSize,
        boolean insufficientData,
        boolean lowConfidence) {
}
