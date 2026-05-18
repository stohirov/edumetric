package com.edumetric.backend.metrics.engine;

import static org.assertj.core.api.Assertions.assertThat;

import com.edumetric.backend.metrics.engine.ComputeContext.AssignmentKind;
import com.edumetric.backend.metrics.engine.ComputeContext.AttendanceInput;
import com.edumetric.backend.metrics.engine.ComputeContext.AttendanceMark;
import com.edumetric.backend.metrics.engine.ComputeContext.GradeInput;
import com.edumetric.backend.metrics.engine.ComputeContext.RatingInput;
import com.edumetric.backend.metrics.engine.ComputeContext.SnapshotInput;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Test;

class MetricsEngineTest {

    private static final LocalDate NOW = LocalDate.of(2026, 5, 18);

    private static final ScoreFormula DEFAULT_FORMULA = new ScoreFormula(
            "v1.0", 0.25, 0.15, 0.25, 0.10, 0.10, 0.10, 0.05);

    @Test
    void emptyDataYieldsNeutralButInsufficient() {
        ComputeContext ctx = ctx(List.of(), List.of(), List.of(), List.of(), List.of());
        ComputedMetrics out = MetricsEngine.compute(ctx, NOW);

        assertThat(out.compositeScore()).isNull();
        assertThat(out.insufficientData()).isTrue();
        assertThat(out.gradesNorm()).isEqualTo(50.0);
        assertThat(out.attendanceNorm()).isEqualTo(50.0);
        assertThat(out.growthBonus()).isEqualTo(50.0);
        assertThat(out.consistencyBonus()).isEqualTo(50.0);
    }

    @Test
    void fewerThanFiveGradesIsInsufficient() {
        List<GradeInput> grades = List.of(
                grade(AssignmentKind.THEORY, 80, 100, 1),
                grade(AssignmentKind.THEORY, 90, 100, 1),
                grade(AssignmentKind.PRACTICAL, 85, 100, 1.5));
        ComputeContext ctx = ctx(grades, List.of(), List.of(), List.of(), List.of());

        ComputedMetrics out = MetricsEngine.compute(ctx, NOW);
        assertThat(out.compositeScore()).isNull();
        assertThat(out.insufficientData()).isTrue();
    }

    @Test
    void exactlyFiveGradesProducesComposite() {
        List<GradeInput> grades = new ArrayList<>();
        for (int i = 0; i < 5; i++) grades.add(grade(AssignmentKind.THEORY, 80, 100, 1));
        ComputeContext ctx = ctx(grades, List.of(), List.of(), List.of(), List.of());

        ComputedMetrics out = MetricsEngine.compute(ctx, NOW);
        assertThat(out.insufficientData()).isFalse();
        assertThat(out.compositeScore()).isNotNull();
        assertThat(out.gradesNorm()).isEqualTo(80.0);
    }

    @Test
    void allDimensionsAtFullProduceHighComposite() {
        List<GradeInput> grades = new ArrayList<>();
        for (int i = 0; i < 6; i++) grades.add(grade(AssignmentKind.PRACTICAL, 100, 100, 1));
        List<AttendanceInput> att = List.of(
                att(AttendanceMark.PRESENT), att(AttendanceMark.PRESENT), att(AttendanceMark.PRESENT));
        List<RatingInput> rating = List.of(new RatingInput(5), new RatingInput(5));

        ComputeContext ctx = ctx(grades, att, rating, rating, List.of());
        ComputedMetrics out = MetricsEngine.compute(ctx, NOW);

        assertThat(out.gradesNorm()).isEqualTo(100.0);
        assertThat(out.attendanceNorm()).isEqualTo(100.0);
        assertThat(out.practicalNorm()).isEqualTo(100.0);
        assertThat(out.behaviorNorm()).isEqualTo(100.0);
        assertThat(out.activityNorm()).isEqualTo(100.0);
        assertThat(out.compositeScore()).isGreaterThan(80.0);
    }

    @Test
    void allDimensionsAtZeroProduceLowComposite() {
        List<GradeInput> grades = new ArrayList<>();
        for (int i = 0; i < 6; i++) grades.add(grade(AssignmentKind.PRACTICAL, 0, 100, 1));
        List<AttendanceInput> att = List.of(att(AttendanceMark.ABSENT), att(AttendanceMark.ABSENT));
        List<RatingInput> rating = List.of(new RatingInput(1), new RatingInput(1));

        ComputeContext ctx = ctx(grades, att, rating, rating, List.of());
        ComputedMetrics out = MetricsEngine.compute(ctx, NOW);

        assertThat(out.gradesNorm()).isEqualTo(0.0);
        assertThat(out.attendanceNorm()).isEqualTo(0.0);
        assertThat(out.behaviorNorm()).isEqualTo(0.0);
        assertThat(out.compositeScore()).isLessThan(20.0);
    }

    @Test
    void excusedAttendanceIsExcludedFromDenominator() {
        List<AttendanceInput> records = List.of(
                att(AttendanceMark.PRESENT), att(AttendanceMark.PRESENT),
                att(AttendanceMark.EXCUSED), att(AttendanceMark.EXCUSED));
        ComputeContext ctx = ctx(fiveGrades(), records, List.of(), List.of(), List.of());

        ComputedMetrics out = MetricsEngine.compute(ctx, NOW);
        assertThat(out.attendanceNorm()).isEqualTo(100.0);
    }

    @Test
    void lateCountsAs70Percent() {
        List<AttendanceInput> records = List.of(
                att(AttendanceMark.LATE), att(AttendanceMark.LATE));
        ComputeContext ctx = ctx(fiveGrades(), records, List.of(), List.of(), List.of());
        ComputedMetrics out = MetricsEngine.compute(ctx, NOW);

        assertThat(out.attendanceNorm()).isEqualTo(70.0);
    }

    @Test
    void practicalNormalizerOnlyIncludesPracticalAndProject() {
        List<GradeInput> grades = List.of(
                grade(AssignmentKind.THEORY, 0, 100, 1),
                grade(AssignmentKind.THEORY, 0, 100, 1),
                grade(AssignmentKind.PRACTICAL, 90, 100, 1),
                grade(AssignmentKind.PROJECT, 80, 100, 1),
                grade(AssignmentKind.EXAM, 0, 100, 1));
        ComputeContext ctx = ctx(grades, List.of(), List.of(), List.of(), List.of());
        ComputedMetrics out = MetricsEngine.compute(ctx, NOW);

        assertThat(out.practicalNorm()).isEqualTo(85.0);
    }

    @Test
    void behaviorAverageOfThreeMapsTo50() {
        List<RatingInput> behavior = List.of(new RatingInput(3), new RatingInput(3));
        ComputeContext ctx = ctx(fiveGrades(), List.of(), behavior, List.of(), List.of());
        ComputedMetrics out = MetricsEngine.compute(ctx, NOW);

        assertThat(out.behaviorNorm()).isEqualTo(50.0);
    }

    @Test
    void growthBonusReflectsImprovement() {
        List<SnapshotInput> snapshots = List.of(
                new SnapshotInput(NOW.minusWeeks(7), 60),
                new SnapshotInput(NOW.minusWeeks(6), 62),
                new SnapshotInput(NOW.minusWeeks(2), 80),
                new SnapshotInput(NOW.minusWeeks(1), 82));
        ComputeContext ctx = ctx(fiveGrades(), List.of(), List.of(), List.of(), snapshots);
        ComputedMetrics out = MetricsEngine.compute(ctx, NOW);

        assertThat(out.growthBonus()).isGreaterThan(50.0);
    }

    @Test
    void consistencyBonusHighWhenSnapshotsStable() {
        List<SnapshotInput> stable = new ArrayList<>();
        for (int i = 0; i < 8; i++) stable.add(new SnapshotInput(NOW.minusWeeks(i + 1), 70.0));
        ComputeContext ctx = ctx(fiveGrades(), List.of(), List.of(), List.of(), stable);
        ComputedMetrics out = MetricsEngine.compute(ctx, NOW);

        assertThat(out.consistencyBonus()).isEqualTo(100.0);
    }

    @Test
    void consistencyBonusLowWhenSnapshotsVolatile() {
        List<SnapshotInput> volatileSnaps = List.of(
                new SnapshotInput(NOW.minusWeeks(8), 20),
                new SnapshotInput(NOW.minusWeeks(7), 95),
                new SnapshotInput(NOW.minusWeeks(6), 30),
                new SnapshotInput(NOW.minusWeeks(5), 88),
                new SnapshotInput(NOW.minusWeeks(4), 25),
                new SnapshotInput(NOW.minusWeeks(3), 90),
                new SnapshotInput(NOW.minusWeeks(2), 35),
                new SnapshotInput(NOW.minusWeeks(1), 92));
        ComputeContext ctx = ctx(fiveGrades(), List.of(), List.of(), List.of(), volatileSnaps);
        ComputedMetrics out = MetricsEngine.compute(ctx, NOW);

        assertThat(out.consistencyBonus()).isLessThan(50.0);
    }

    @Test
    void compositeAlwaysClampedToZeroHundred() {
        ScoreFormula extreme = new ScoreFormula("test", 2.0, 0, 0, 0, 0, -0.5, -0.5);
        List<GradeInput> grades = new ArrayList<>();
        for (int i = 0; i < 5; i++) grades.add(grade(AssignmentKind.THEORY, 100, 100, 1));
        ComputeContext ctx = new ComputeContext(extreme, grades, List.of(), List.of(), List.of(), List.of());
        ComputedMetrics out = MetricsEngine.compute(ctx, NOW);

        assertThat(out.compositeScore()).isBetween(0.0, 100.0);
    }

    private static ComputeContext ctx(
            List<GradeInput> grades,
            List<AttendanceInput> attendance,
            List<RatingInput> behavior,
            List<RatingInput> activity,
            List<SnapshotInput> snapshots) {
        return new ComputeContext(DEFAULT_FORMULA, grades, attendance, behavior, activity, snapshots);
    }

    private static List<GradeInput> fiveGrades() {
        List<GradeInput> out = new ArrayList<>();
        for (int i = 0; i < 5; i++) out.add(grade(AssignmentKind.THEORY, 70, 100, 1));
        return out;
    }

    private static GradeInput grade(AssignmentKind kind, double value, double max, double weight) {
        return new GradeInput(kind, value, max, weight);
    }

    private static AttendanceInput att(AttendanceMark m) {
        return new AttendanceInput(m);
    }
}
