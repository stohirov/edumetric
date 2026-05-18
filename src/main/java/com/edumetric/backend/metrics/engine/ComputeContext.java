package com.edumetric.backend.metrics.engine;

import java.util.List;

public record ComputeContext(
        ScoreFormula formula,
        List<GradeInput> grades,
        List<AttendanceInput> attendance,
        List<RatingInput> behavior,
        List<RatingInput> activity,
        List<SnapshotInput> snapshots) {

    public enum AttendanceMark { PRESENT, LATE, ABSENT, EXCUSED }

    public enum AssignmentKind { THEORY, PRACTICAL, PROJECT, EXAM }

    public record GradeInput(AssignmentKind kind, double value, double maxValue, double weight) {}

    public record AttendanceInput(AttendanceMark mark) {}

    public record RatingInput(int value) {}

    public record SnapshotInput(java.time.LocalDate date, double compositeScore) {}
}
