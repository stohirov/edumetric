package com.edumetric.backend.settings.domain;

/**
 * How grades are presented institution-wide.
 */
public enum GradingScale {
    /** 0–100 percentage. */
    PERCENT,
    /** A–F letter grades. */
    LETTER,
    /** 0.0–4.0 grade-point average. */
    GPA_4
}
