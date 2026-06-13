package com.edumetric.backend.metrics;

import com.edumetric.backend.attendance.AttendanceRepository;
import com.edumetric.backend.attendance.domain.Attendance;
import com.edumetric.backend.behavior.ActivityRecordRepository;
import com.edumetric.backend.behavior.BehaviorRecordRepository;
import com.edumetric.backend.behavior.domain.ActivityRecord;
import com.edumetric.backend.behavior.domain.BehaviorRecord;
import com.edumetric.backend.common.exception.ResourceNotFoundException;
import com.edumetric.backend.config.AnalyticsCacheEvictor;
import com.edumetric.backend.grades.GradeRepository;
import com.edumetric.backend.grades.domain.Grade;
import com.edumetric.backend.metrics.domain.FormulaConfig;
import com.edumetric.backend.metrics.domain.StudentMetrics;
import com.edumetric.backend.metrics.dto.FormulaPreviewDto;
import com.edumetric.backend.metrics.engine.ComputeContext;
import com.edumetric.backend.metrics.engine.ComputeContext.AssignmentKind;
import com.edumetric.backend.metrics.engine.ComputeContext.AttendanceInput;
import com.edumetric.backend.metrics.engine.ComputeContext.AttendanceMark;
import com.edumetric.backend.metrics.engine.ComputeContext.GradeInput;
import com.edumetric.backend.metrics.engine.ComputeContext.RatingInput;
import com.edumetric.backend.metrics.engine.ComputeContext.SnapshotInput;
import com.edumetric.backend.metrics.engine.ComputedMetrics;
import com.edumetric.backend.metrics.engine.MetricsEngine;
import com.edumetric.backend.metrics.engine.ScoreFormula;
import com.edumetric.backend.students.StudentRepository;
import com.edumetric.backend.students.domain.Student;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MetricsService {

    private static final int RECOMPUTE_BATCH_SIZE = 1000;

    private final StudentRepository studentRepository;
    private final StudentMetricsRepository studentMetricsRepository;
    private final MetricSnapshotRepository metricSnapshotRepository;
    private final FormulaConfigRepository formulaConfigRepository;
    private final GradeRepository gradeRepository;
    private final AttendanceRepository attendanceRepository;
    private final BehaviorRecordRepository behaviorRepository;
    private final ActivityRecordRepository activityRepository;
    private final AnalyticsCacheEvictor analyticsCacheEvictor;

    @Transactional(readOnly = true)
    public FormulaConfig activeFormula() {
        return formulaConfigRepository.findFirstByActiveTrueOrderByCreatedAtDesc()
                .orElseThrow(() -> new IllegalStateException("No active formula configured"));
    }

    @Transactional
    public void recompute(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> ResourceNotFoundException.of("Student", studentId));
        recomputeStudent(student, activeFormula());
    }

    @Transactional
    public void recomputeAll(Collection<Long> studentIds) {
        FormulaConfig formula = activeFormula();
        for (Long id : studentIds) {
            studentRepository.findById(id).ifPresent(s -> recomputeStudent(s, formula));
        }
        analyticsCacheEvictor.evictAll();
    }

    @Transactional
    public int recomputeAll() {
        FormulaConfig formula = activeFormula();
        int page = 0;
        int total = 0;
        while (true) {
            var batch = studentRepository.findAll(PageRequest.of(page, RECOMPUTE_BATCH_SIZE));
            for (Student s : batch.getContent()) {
                recomputeStudent(s, formula);
                total++;
            }
            if (!batch.hasNext()) break;
            page++;
        }
        analyticsCacheEvictor.evictAll();
        return total;
    }

    /**
     * Simulates {@code proposed} against every student and reports the impact without persisting
     * anything — the audit/preview step before an admin activates a new formula.
     */
    @Transactional(readOnly = true)
    public FormulaPreviewDto previewFormula(ScoreFormula proposed) {
        validateWeights(proposed);
        LocalDate now = LocalDate.now(ZoneOffset.UTC);

        int comparable = 0;
        int affected = 0;
        int increased = 0;
        int decreased = 0;
        double sumDelta = 0;
        double maxIncrease = 0;
        double maxDecrease = 0;
        double currentSum = 0;
        double projectedSum = 0;
        List<FormulaPreviewDto.Mover> movers = new ArrayList<>();

        int page = 0;
        while (true) {
            var batch = studentRepository.findAll(PageRequest.of(page, RECOMPUTE_BATCH_SIZE));
            for (Student student : batch.getContent()) {
                Double currentScore = studentMetricsRepository.findByStudentId(student.getId())
                        .map(StudentMetrics::getCompositeScore)
                        .map(BigDecimal::doubleValue)
                        .orElse(null);
                ComputeContext ctx = loadContext(student.getId(), proposed);
                ComputedMetrics result = MetricsEngine.compute(ctx, now);
                Double projectedScore = result.compositeScore() == null ? null
                        : BigDecimal.valueOf(result.compositeScore())
                                .setScale(2, RoundingMode.HALF_UP).doubleValue();

                if (currentScore == null || projectedScore == null) {
                    continue;
                }
                comparable++;
                currentSum += currentScore;
                projectedSum += projectedScore;
                double delta = BigDecimal.valueOf(projectedScore - currentScore)
                        .setScale(2, RoundingMode.HALF_UP).doubleValue();
                if (delta != 0) {
                    affected++;
                    if (delta > 0) increased++; else decreased++;
                    sumDelta += delta;
                    maxIncrease = Math.max(maxIncrease, delta);
                    maxDecrease = Math.min(maxDecrease, delta);
                    movers.add(new FormulaPreviewDto.Mover(
                            student.getId(), student.getUser().getFullName(),
                            currentScore, projectedScore, delta));
                }
            }
            if (!batch.hasNext()) break;
            page++;
        }

        movers.sort(Comparator.comparingDouble(
                (FormulaPreviewDto.Mover mv) -> Math.abs(mv.delta())).reversed());
        List<FormulaPreviewDto.Mover> topMovers = movers.stream().limit(10).toList();

        return new FormulaPreviewDto(
                comparable,
                affected,
                increased,
                decreased,
                affected == 0 ? 0 : round2(sumDelta / affected),
                round2(maxIncrease),
                round2(maxDecrease),
                comparable == 0 ? null : round2(currentSum / comparable),
                comparable == 0 ? null : round2(projectedSum / comparable),
                topMovers);
    }

    private static double round2(double v) {
        return BigDecimal.valueOf(v).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }

    @Transactional
    public FormulaConfig updateFormula(ScoreFormula incoming) {
        validateWeights(incoming);
        formulaConfigRepository.findFirstByActiveTrueOrderByCreatedAtDesc().ifPresent(current -> {
            current.setActive(false);
            formulaConfigRepository.save(current);
        });
        FormulaConfig saved = formulaConfigRepository.save(FormulaConfig.builder()
                .version(incoming.version())
                .weightGrades(BigDecimal.valueOf(incoming.grades()))
                .weightAttendance(BigDecimal.valueOf(incoming.attendance()))
                .weightPractical(BigDecimal.valueOf(incoming.practical()))
                .weightBehavior(BigDecimal.valueOf(incoming.behavior()))
                .weightActivity(BigDecimal.valueOf(incoming.activity()))
                .weightGrowth(BigDecimal.valueOf(incoming.growth()))
                .weightConsistency(BigDecimal.valueOf(incoming.consistency()))
                .active(true)
                .createdAt(Instant.now())
                .build());
        return saved;
    }

    private void validateWeights(ScoreFormula f) {
        double sum = f.grades() + f.attendance() + f.practical() + f.behavior()
                + f.activity() + f.growth() + f.consistency();
        if (Math.abs(sum - 1.0) > 0.0001) {
            throw new IllegalArgumentException("Formula weights must sum to 1.0, got " + sum);
        }
    }

    private void recomputeStudent(Student student, FormulaConfig formulaConfig) {
        ScoreFormula formula = toFormula(formulaConfig);
        ComputeContext ctx = loadContext(student.getId(), formula);
        LocalDate now = LocalDate.now(ZoneOffset.UTC);
        ComputedMetrics result = MetricsEngine.compute(ctx, now);

        StudentMetrics metrics = studentMetricsRepository.findByStudentId(student.getId())
                .orElseGet(() -> StudentMetrics.builder().student(student).build());

        metrics.setCompositeScore(result.compositeScore() == null
                ? null : BigDecimal.valueOf(result.compositeScore()).setScale(2, RoundingMode.HALF_UP));
        metrics.setGradesNorm(scale(result.gradesNorm()));
        metrics.setAttendanceNorm(scale(result.attendanceNorm()));
        metrics.setPracticalNorm(scale(result.practicalNorm()));
        metrics.setBehaviorNorm(scale(result.behaviorNorm()));
        metrics.setActivityNorm(scale(result.activityNorm()));
        metrics.setGrowthBonus(scale(result.growthBonus()));
        metrics.setConsistencyBonus(scale(result.consistencyBonus()));
        metrics.setFormulaVersion(formulaConfig.getVersion());
        metrics.setSampleSize(result.sampleSize());
        metrics.setLowConfidence(result.lowConfidence());
        metrics.setComputedAt(Instant.now());
        studentMetricsRepository.save(metrics);
    }

    private ComputeContext loadContext(Long studentId, ScoreFormula formula) {
        List<GradeInput> grades = gradeRepository.findAllByStudentId(studentId).stream()
                .map(MetricsService::toGradeInput)
                .toList();
        List<AttendanceInput> attendance = attendanceRepository.findAllByStudentId(studentId).stream()
                .map(MetricsService::toAttendanceInput)
                .toList();
        List<RatingInput> behavior = behaviorRepository.findAllByStudentId(studentId).stream()
                .map(MetricsService::toBehaviorInput)
                .toList();
        List<RatingInput> activity = activityRepository.findAllByStudentId(studentId).stream()
                .map(MetricsService::toActivityInput)
                .toList();
        List<SnapshotInput> snapshots = metricSnapshotRepository
                .findAllByStudentIdOrderBySnapshotDateAsc(studentId).stream()
                .filter(s -> s.getCompositeScore() != null)
                .map(s -> new SnapshotInput(s.getSnapshotDate(), s.getCompositeScore().doubleValue()))
                .toList();
        return new ComputeContext(formula, grades, attendance, behavior, activity, snapshots);
    }

    private static GradeInput toGradeInput(Grade g) {
        AssignmentKind kind = AssignmentKind.valueOf(g.getAssignment().getType().name());
        return new GradeInput(
                kind,
                g.getValue().doubleValue(),
                g.getAssignment().getMaxValue().doubleValue(),
                g.getAssignment().getWeight().doubleValue());
    }

    private static AttendanceInput toAttendanceInput(Attendance a) {
        return new AttendanceInput(AttendanceMark.valueOf(a.getStatus().name()));
    }

    private static RatingInput toBehaviorInput(BehaviorRecord r) {
        return new RatingInput(r.getValue());
    }

    private static RatingInput toActivityInput(ActivityRecord r) {
        return new RatingInput(r.getValue());
    }

    private static BigDecimal scale(double v) {
        return BigDecimal.valueOf(v).setScale(2, RoundingMode.HALF_UP);
    }

    public static ScoreFormula toFormula(FormulaConfig config) {
        return new ScoreFormula(
                config.getVersion(),
                config.getWeightGrades().doubleValue(),
                config.getWeightAttendance().doubleValue(),
                config.getWeightPractical().doubleValue(),
                config.getWeightBehavior().doubleValue(),
                config.getWeightActivity().doubleValue(),
                config.getWeightGrowth().doubleValue(),
                config.getWeightConsistency().doubleValue());
    }
}
