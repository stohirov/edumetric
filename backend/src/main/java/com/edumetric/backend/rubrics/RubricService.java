package com.edumetric.backend.rubrics;

import com.edumetric.backend.audit.AuditLogService;
import com.edumetric.backend.common.exception.BadRequestException;
import com.edumetric.backend.common.exception.ResourceNotFoundException;
import com.edumetric.backend.grades.AssignmentRepository;
import com.edumetric.backend.grades.GradeService;
import com.edumetric.backend.grades.domain.Assignment;
import com.edumetric.backend.grades.dto.CreateGradeRequest;
import com.edumetric.backend.rubrics.domain.Rubric;
import com.edumetric.backend.rubrics.domain.RubricCriterion;
import com.edumetric.backend.rubrics.domain.RubricScore;
import com.edumetric.backend.rubrics.dto.RubricDto;
import com.edumetric.backend.rubrics.dto.RubricScoreDto;
import com.edumetric.backend.rubrics.dto.RubricScoreInput;
import com.edumetric.backend.rubrics.dto.ScoreRubricRequest;
import com.edumetric.backend.rubrics.dto.ScoreRubricResult;
import com.edumetric.backend.rubrics.dto.UpsertRubricRequest;
import com.edumetric.backend.security.AuthenticatedUser;
import com.edumetric.backend.security.TeacherScope;
import com.edumetric.backend.students.StudentRepository;
import com.edumetric.backend.students.domain.Student;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RubricService {

    private final RubricRepository rubricRepository;
    private final RubricCriterionRepository criterionRepository;
    private final RubricScoreRepository scoreRepository;
    private final AssignmentRepository assignmentRepository;
    private final StudentRepository studentRepository;
    private final GradeService gradeService;
    private final TeacherScope teacherScope;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public RubricDto getRubric(Long assignmentId, AuthenticatedUser actor) {
        Assignment assignment = loadAssignment(assignmentId);
        teacherScope.assertTeachesCourse(actor, assignment.getCourse().getId());
        Rubric rubric = rubricRepository.findByAssignmentId(assignmentId).orElse(null);
        if (rubric == null) {
            return null;
        }
        List<RubricCriterion> criteria =
                criterionRepository.findAllByRubricIdOrderByPositionAscIdAsc(rubric.getId());
        return RubricDto.from(rubric, criteria);
    }

    @Transactional
    public RubricDto upsertRubric(UpsertRubricRequest request, AuthenticatedUser actor) {
        Assignment assignment = loadAssignment(request.assignmentId());
        teacherScope.assertTeachesCourse(actor, assignment.getCourse().getId());
        if (request.criteria().isEmpty()) {
            throw new BadRequestException("A rubric must have at least one criterion");
        }

        Rubric rubric = rubricRepository.findByAssignmentId(request.assignmentId())
                .orElseGet(() -> Rubric.builder().assignment(assignment).build());
        rubric.setName(request.name());
        Rubric savedRubric = rubricRepository.save(rubric);

        // Replace existing criteria (and their scores) wholesale.
        List<RubricCriterion> existing =
                criterionRepository.findAllByRubricIdOrderByPositionAscIdAsc(savedRubric.getId());
        if (!existing.isEmpty()) {
            List<Long> existingIds = existing.stream().map(RubricCriterion::getId).toList();
            scoreRepository.deleteAllByCriterionIdIn(existingIds);
            criterionRepository.deleteAllByRubricId(savedRubric.getId());
            criterionRepository.flush();
        }

        List<RubricCriterion> created = new ArrayList<>();
        int fallbackPosition = 0;
        for (UpsertRubricRequest.CriterionInput input : request.criteria()) {
            int position = input.position() != null ? input.position() : fallbackPosition;
            RubricCriterion criterion = RubricCriterion.builder()
                    .rubric(savedRubric)
                    .label(input.label())
                    .maxPoints(input.maxPoints())
                    .position(position)
                    .build();
            created.add(criterionRepository.save(criterion));
            fallbackPosition++;
        }

        auditLogService.log(
                "Rubric", savedRubric.getId(), "RUBRIC_UPSERT", actor.id(), request);

        List<RubricCriterion> ordered =
                criterionRepository.findAllByRubricIdOrderByPositionAscIdAsc(savedRubric.getId());
        return RubricDto.from(savedRubric, ordered.isEmpty() ? created : ordered);
    }

    @Transactional(readOnly = true)
    public List<RubricScoreDto> getScores(Long assignmentId, Long studentId, AuthenticatedUser actor) {
        Assignment assignment = loadAssignment(assignmentId);
        teacherScope.assertTeachesCourse(actor, assignment.getCourse().getId());
        Rubric rubric = rubricRepository.findByAssignmentId(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No rubric defined for assignment " + assignmentId));
        return scoreRepository.findAllByRubricIdAndStudentId(rubric.getId(), studentId).stream()
                .map(RubricScoreDto::from)
                .toList();
    }

    @Transactional
    public ScoreRubricResult score(ScoreRubricRequest request, AuthenticatedUser actor) {
        Assignment assignment = loadAssignment(request.assignmentId());
        teacherScope.assertTeachesCourse(actor, assignment.getCourse().getId());

        Student student = studentRepository.findById(request.studentId())
                .orElseThrow(() -> ResourceNotFoundException.of("Student", request.studentId()));
        teacherScope.assertCanWriteFor(actor, student.getId());

        Rubric rubric = rubricRepository.findByAssignmentId(request.assignmentId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No rubric defined for assignment " + request.assignmentId()));

        if (request.scores().isEmpty()) {
            throw new BadRequestException("At least one score is required");
        }

        Map<Long, RubricCriterion> criteriaById =
                criterionRepository.findAllByRubricIdOrderByPositionAscIdAsc(rubric.getId()).stream()
                        .collect(Collectors.toMap(RubricCriterion::getId, Function.identity()));

        List<RubricScoreDto> savedDtos = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;
        for (RubricScoreInput input : request.scores()) {
            RubricCriterion criterion = criteriaById.get(input.criterionId());
            if (criterion == null) {
                throw new BadRequestException(
                        "Criterion " + input.criterionId()
                                + " does not belong to the rubric for assignment "
                                + request.assignmentId());
            }
            if (input.points().compareTo(BigDecimal.ZERO) < 0
                    || input.points().compareTo(criterion.getMaxPoints()) > 0) {
                throw new BadRequestException(
                        "Points " + input.points() + " out of range [0, "
                                + criterion.getMaxPoints() + "] for criterion " + criterion.getId());
            }

            RubricScore scoreEntity = scoreRepository
                    .findByCriterionIdAndStudentId(criterion.getId(), student.getId())
                    .orElseGet(() -> RubricScore.builder()
                            .criterion(criterion)
                            .student(student)
                            .build());
            scoreEntity.setPoints(input.points());
            scoreEntity.setComment(input.comment());
            RubricScore saved = scoreRepository.save(scoreEntity);
            savedDtos.add(RubricScoreDto.from(saved));
            total = total.add(input.points());
        }

        // Reflect the rubric total into the gradebook via GradeService.
        gradeService.create(
                new CreateGradeRequest(
                        student.getId(),
                        assignment.getId(),
                        total,
                        "Rubric: " + rubric.getName()),
                actor);

        auditLogService.log(
                "Rubric", rubric.getId(), "RUBRIC_SCORE", actor.id(), request);

        return new ScoreRubricResult(assignment.getId(), student.getId(), total, savedDtos);
    }

    private Assignment loadAssignment(Long assignmentId) {
        return assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> ResourceNotFoundException.of("Assignment", assignmentId));
    }
}
