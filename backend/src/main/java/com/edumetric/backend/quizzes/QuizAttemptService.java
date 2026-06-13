package com.edumetric.backend.quizzes;

import com.edumetric.backend.common.exception.BadRequestException;
import com.edumetric.backend.common.exception.ResourceNotFoundException;
import com.edumetric.backend.quizzes.domain.QuestionType;
import com.edumetric.backend.quizzes.domain.Quiz;
import com.edumetric.backend.quizzes.domain.QuizAttempt;
import com.edumetric.backend.quizzes.domain.QuizAttemptAnswer;
import com.edumetric.backend.quizzes.domain.QuizOption;
import com.edumetric.backend.quizzes.domain.QuizQuestion;
import com.edumetric.backend.quizzes.dto.AnswerSubmission;
import com.edumetric.backend.quizzes.dto.AttemptResultDto;
import com.edumetric.backend.quizzes.dto.QuestionResultDto;
import com.edumetric.backend.quizzes.dto.StudentQuizDto;
import com.edumetric.backend.quizzes.dto.SubmitAttemptRequest;
import com.edumetric.backend.quizzes.dto.TakeOptionDto;
import com.edumetric.backend.quizzes.dto.TakeQuestionDto;
import com.edumetric.backend.quizzes.dto.TakeQuizDto;
import com.edumetric.backend.security.AuthenticatedUser;
import com.edumetric.backend.students.StudentRepository;
import com.edumetric.backend.students.domain.Student;
import com.edumetric.backend.submissions.SubmissionService;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Student-facing quiz taking with automatic grading on submit. */
@Service
@RequiredArgsConstructor
public class QuizAttemptService {

    private static final BigDecimal HUNDRED = BigDecimal.valueOf(100);

    private final QuizRepository quizRepository;
    private final QuizQuestionRepository questionRepository;
    private final QuizOptionRepository optionRepository;
    private final QuizAttemptRepository attemptRepository;
    private final QuizAttemptAnswerRepository answerRepository;
    private final StudentRepository studentRepository;
    private final SubmissionService submissionService;

    @Transactional(readOnly = true)
    public List<StudentQuizDto> listForStudent(AuthenticatedUser actor) {
        Student student = resolveStudent(actor);
        if (student.getGroup() == null || student.getGroup().getCourse() == null) {
            return List.of();
        }
        Long courseId = student.getGroup().getCourse().getId();
        return quizRepository.findAllByCourseIdAndPublishedTrueOrderByIdDesc(courseId).stream()
                .map(quiz -> toStudentSummary(quiz, student.getId()))
                .toList();
    }

    @Transactional(readOnly = true)
    public TakeQuizDto getQuizToTake(Long quizId, AuthenticatedUser actor) {
        Student student = resolveStudent(actor);
        Quiz quiz = loadPublishedQuizInCourse(quizId, student);
        int attemptsUsed = (int) attemptRepository.countByQuizIdAndStudentId(quizId, student.getId());
        if (quiz.getMaxAttempts() != null && attemptsUsed >= quiz.getMaxAttempts()) {
            throw new BadRequestException("No attempts remaining for this quiz");
        }
        List<QuizQuestion> questions = questionRepository.findAllByQuizIdOrderByPositionAscIdAsc(quizId);
        if (questions.isEmpty()) {
            throw new BadRequestException("This quiz has no questions yet");
        }
        Map<Long, List<QuizOption>> optionsByQuestion = optionsByQuestion(questions);
        List<TakeQuestionDto> takeQuestions = questions.stream()
                .map(q -> new TakeQuestionDto(
                        q.getId(),
                        q.getText(),
                        q.getType(),
                        q.getPoints(),
                        // Short-answer questions are free text — never expose accepted answers.
                        q.getType() == QuestionType.SHORT_ANSWER
                                ? List.of()
                                : optionsByQuestion.getOrDefault(q.getId(), List.of()).stream()
                                        .map(TakeOptionDto::from)
                                        .toList()))
                .toList();
        return new TakeQuizDto(
                quiz.getId(),
                quiz.getTitle(),
                quiz.getDescription(),
                quiz.getTimeLimitMinutes(),
                quiz.getMaxAttempts(),
                attemptsUsed,
                takeQuestions);
    }

    @Transactional
    public AttemptResultDto submit(Long quizId, SubmitAttemptRequest request, AuthenticatedUser actor) {
        Student student = resolveStudent(actor);
        Quiz quiz = loadPublishedQuizInCourse(quizId, student);
        int attemptsUsed = (int) attemptRepository.countByQuizIdAndStudentId(quizId, student.getId());
        if (quiz.getMaxAttempts() != null && attemptsUsed >= quiz.getMaxAttempts()) {
            throw new BadRequestException("No attempts remaining for this quiz");
        }
        List<QuizQuestion> questions = questionRepository.findAllByQuizIdOrderByPositionAscIdAsc(quizId);
        if (questions.isEmpty()) {
            throw new BadRequestException("This quiz has no questions yet");
        }
        Map<Long, List<QuizOption>> optionsByQuestion = optionsByQuestion(questions);
        Map<Long, AnswerSubmission> submitted = request.answers() == null
                ? Map.of()
                : request.answers().stream()
                        .collect(Collectors.toMap(AnswerSubmission::questionId, Function.identity(), (a, b) -> b));

        Instant now = Instant.now();
        QuizAttempt attempt = attemptRepository.save(QuizAttempt.builder()
                .quiz(quiz)
                .student(student)
                .startedAt(now)
                .submittedAt(now)
                .build());

        BigDecimal score = BigDecimal.ZERO;
        BigDecimal maxScore = BigDecimal.ZERO;
        List<QuestionResultDto> results = new ArrayList<>();
        for (QuizQuestion question : questions) {
            List<QuizOption> options = optionsByQuestion.getOrDefault(question.getId(), List.of());
            AnswerSubmission answer = submitted.get(question.getId());
            boolean correct = grade(question, options, answer);
            BigDecimal awarded = correct ? question.getPoints() : BigDecimal.ZERO;
            score = score.add(awarded);
            maxScore = maxScore.add(question.getPoints());

            answerRepository.save(QuizAttemptAnswer.builder()
                    .attempt(attempt)
                    .question(question)
                    .selectedOptionIds(joinOptionIds(answer))
                    .textAnswer(answer != null ? trimToNull(answer.textAnswer()) : null)
                    .pointsAwarded(awarded)
                    .correct(correct)
                    .build());
            results.add(new QuestionResultDto(question.getId(), awarded, question.getPoints(), correct));
        }

        Boolean passed = computePassed(quiz, score, maxScore);
        attempt.setScore(score);
        attempt.setMaxScore(maxScore);
        attempt.setPassed(passed);
        // Mirror the best attempt into the unified submission table.
        submissionService.recordQuizAttempt(student, quiz, attempt);

        return new AttemptResultDto(attempt.getId(), quiz.getId(), score, maxScore, passed, now, results);
    }

    // ----- Grading -------------------------------------------------------------------

    private static boolean grade(QuizQuestion question, List<QuizOption> options, AnswerSubmission answer) {
        if (answer == null) {
            return false;
        }
        return switch (question.getType()) {
            case SHORT_ANSWER -> {
                String given = answer.textAnswer() == null ? "" : normalize(answer.textAnswer());
                if (given.isEmpty()) {
                    yield false;
                }
                yield options.stream().anyMatch(o -> normalize(o.getText()).equals(given));
            }
            case SINGLE_CHOICE, MULTIPLE_CHOICE, TRUE_FALSE -> {
                Set<Long> selected = answer.selectedOptionIds() == null
                        ? Set.of()
                        : new LinkedHashSet<>(answer.selectedOptionIds());
                Set<Long> correctIds = options.stream()
                        .filter(QuizOption::isCorrect)
                        .map(QuizOption::getId)
                        .collect(Collectors.toSet());
                yield !correctIds.isEmpty() && selected.equals(correctIds);
            }
        };
    }

    private static Boolean computePassed(Quiz quiz, BigDecimal score, BigDecimal maxScore) {
        if (quiz.getPassScore() == null) {
            return null;
        }
        if (maxScore.signum() <= 0) {
            return false;
        }
        BigDecimal percent = score.multiply(HUNDRED).divide(maxScore, 2, RoundingMode.HALF_UP);
        return percent.compareTo(quiz.getPassScore()) >= 0;
    }

    // ----- Helpers -------------------------------------------------------------------

    private StudentQuizDto toStudentSummary(Quiz quiz, Long studentId) {
        List<QuizQuestion> questions = questionRepository.findAllByQuizIdOrderByPositionAscIdAsc(quiz.getId());
        BigDecimal totalPoints = questions.stream()
                .map(QuizQuestion::getPoints)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        List<QuizAttempt> attempts = attemptRepository.findAllByQuizIdAndStudentIdOrderByIdDesc(quiz.getId(), studentId);
        BigDecimal best = attempts.stream()
                .map(QuizAttempt::getScore)
                .filter(s -> s != null)
                .max(Comparator.naturalOrder())
                .orElse(null);
        Boolean lastPassed = attempts.isEmpty() ? null : attempts.get(0).getPassed();
        return new StudentQuizDto(
                quiz.getId(),
                quiz.getTitle(),
                quiz.getDescription(),
                quiz.getTimeLimitMinutes(),
                quiz.getMaxAttempts(),
                quiz.getPassScore(),
                questions.size(),
                totalPoints,
                attempts.size(),
                best,
                lastPassed);
    }

    private Map<Long, List<QuizOption>> optionsByQuestion(List<QuizQuestion> questions) {
        List<Long> questionIds = questions.stream().map(QuizQuestion::getId).toList();
        if (questionIds.isEmpty()) {
            return Map.of();
        }
        return optionRepository.findAllByQuestionIdInOrderByPositionAscIdAsc(questionIds).stream()
                .collect(Collectors.groupingBy(o -> o.getQuestion().getId()));
    }

    private Quiz loadPublishedQuizInCourse(Long quizId, Student student) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> ResourceNotFoundException.of("Quiz", quizId));
        boolean sameCourse = student.getGroup() != null
                && student.getGroup().getCourse() != null
                && student.getGroup().getCourse().getId().equals(quiz.getCourse().getId());
        if (!quiz.isPublished() || !sameCourse) {
            throw new BadRequestException("Quiz is not available");
        }
        return quiz;
    }

    private Student resolveStudent(AuthenticatedUser actor) {
        return studentRepository.findByUserId(actor.id())
                .orElseThrow(() -> ResourceNotFoundException.of("Student", actor.id()));
    }

    private static String joinOptionIds(AnswerSubmission answer) {
        if (answer == null || answer.selectedOptionIds() == null || answer.selectedOptionIds().isEmpty()) {
            return null;
        }
        return answer.selectedOptionIds().stream()
                .map(String::valueOf)
                .collect(Collectors.joining(","));
    }

    private static String normalize(String value) {
        return value.trim().toLowerCase(Locale.ROOT).replaceAll("\\s+", " ");
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
