package com.edumetric.backend.quizzes;

import com.edumetric.backend.common.exception.BadRequestException;
import com.edumetric.backend.common.exception.ResourceNotFoundException;
import com.edumetric.backend.content.CourseModuleRepository;
import com.edumetric.backend.content.domain.CourseModule;
import com.edumetric.backend.courses.CourseRepository;
import com.edumetric.backend.courses.domain.Course;
import com.edumetric.backend.quizzes.domain.QuestionType;
import com.edumetric.backend.quizzes.domain.Quiz;
import com.edumetric.backend.quizzes.domain.QuizOption;
import com.edumetric.backend.quizzes.domain.QuizQuestion;
import com.edumetric.backend.quizzes.dto.CreateQuizRequest;
import com.edumetric.backend.quizzes.dto.OptionRequest;
import com.edumetric.backend.quizzes.dto.QuestionDto;
import com.edumetric.backend.quizzes.dto.QuestionRequest;
import com.edumetric.backend.quizzes.dto.QuizDetailDto;
import com.edumetric.backend.quizzes.dto.QuizDto;
import com.edumetric.backend.quizzes.dto.ReplaceQuestionsRequest;
import com.edumetric.backend.quizzes.dto.UpdateQuizRequest;
import com.edumetric.backend.security.AuthenticatedUser;
import com.edumetric.backend.security.TeacherScope;
import java.math.BigDecimal;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Teacher/admin authoring of quizzes, their questions, and options. */
@Service
@RequiredArgsConstructor
public class QuizService {

    private static final BigDecimal DEFAULT_POINTS = BigDecimal.ONE;

    private final QuizRepository quizRepository;
    private final QuizQuestionRepository questionRepository;
    private final QuizOptionRepository optionRepository;
    private final QuizAttemptRepository attemptRepository;
    private final QuizAttemptAnswerRepository answerRepository;
    private final CourseRepository courseRepository;
    private final CourseModuleRepository moduleRepository;
    private final TeacherScope teacherScope;

    @Transactional(readOnly = true)
    public List<QuizDto> listByCourse(Long courseId, AuthenticatedUser actor) {
        teacherScope.assertTeachesCourse(actor, courseId);
        return quizRepository.findAllByCourseIdOrderByIdDesc(courseId).stream()
                .map(this::toSummary)
                .toList();
    }

    @Transactional(readOnly = true)
    public QuizDetailDto get(Long id, AuthenticatedUser actor) {
        Quiz quiz = loadQuiz(id);
        teacherScope.assertTeachesCourse(actor, quiz.getCourse().getId());
        return toDetail(quiz);
    }

    @Transactional
    public QuizDto create(CreateQuizRequest request, AuthenticatedUser actor) {
        teacherScope.assertTeachesCourse(actor, request.courseId());
        Course course = courseRepository.findById(request.courseId())
                .orElseThrow(() -> ResourceNotFoundException.of("Course", request.courseId()));
        Quiz quiz = Quiz.builder()
                .course(course)
                .module(resolveModule(request.moduleId(), course.getId()))
                .title(request.title().trim())
                .description(trimToNull(request.description()))
                .timeLimitMinutes(request.timeLimitMinutes())
                .maxAttempts(request.maxAttempts())
                .passScore(request.passScore())
                .shuffleQuestions(Boolean.TRUE.equals(request.shuffleQuestions()))
                .published(Boolean.TRUE.equals(request.published()))
                .build();
        return toSummary(quizRepository.save(quiz));
    }

    @Transactional
    public QuizDto update(Long id, UpdateQuizRequest request, AuthenticatedUser actor) {
        Quiz quiz = loadQuiz(id);
        teacherScope.assertTeachesCourse(actor, quiz.getCourse().getId());
        if (request.moduleId() != null) {
            quiz.setModule(resolveModule(request.moduleId(), quiz.getCourse().getId()));
        }
        if (request.title() != null && !request.title().isBlank()) {
            quiz.setTitle(request.title().trim());
        }
        if (request.description() != null) {
            quiz.setDescription(trimToNull(request.description()));
        }
        if (request.timeLimitMinutes() != null) {
            quiz.setTimeLimitMinutes(request.timeLimitMinutes());
        }
        if (request.maxAttempts() != null) {
            quiz.setMaxAttempts(request.maxAttempts());
        }
        if (request.passScore() != null) {
            quiz.setPassScore(request.passScore());
        }
        if (request.shuffleQuestions() != null) {
            quiz.setShuffleQuestions(request.shuffleQuestions());
        }
        if (request.published() != null) {
            quiz.setPublished(request.published());
        }
        return toSummary(quiz);
    }

    @Transactional
    public void delete(Long id, AuthenticatedUser actor) {
        Quiz quiz = loadQuiz(id);
        teacherScope.assertTeachesCourse(actor, quiz.getCourse().getId());
        List<Long> attemptIds = attemptRepository.findAllByQuizId(id).stream()
                .map(a -> a.getId())
                .toList();
        if (!attemptIds.isEmpty()) {
            answerRepository.deleteAllByAttemptIdIn(attemptIds);
            attemptRepository.deleteAllById(attemptIds);
        }
        deleteQuestionsAndOptions(id);
        quizRepository.delete(quiz);
    }

    /** Replaces a quiz's entire question set. Rejected once students have attempted it. */
    @Transactional
    public QuizDetailDto replaceQuestions(Long quizId, ReplaceQuestionsRequest request, AuthenticatedUser actor) {
        Quiz quiz = loadQuiz(quizId);
        teacherScope.assertTeachesCourse(actor, quiz.getCourse().getId());
        if (attemptRepository.countByQuizId(quizId) > 0) {
            throw new BadRequestException("Questions cannot be edited after students have attempted the quiz");
        }
        deleteQuestionsAndOptions(quizId);

        int position = 0;
        for (QuestionRequest qr : request.questions()) {
            validateQuestion(qr);
            QuizQuestion question = questionRepository.save(QuizQuestion.builder()
                    .quiz(quiz)
                    .text(qr.text().trim())
                    .type(qr.type())
                    .points(qr.points() != null ? qr.points() : DEFAULT_POINTS)
                    .position(position++)
                    .build());
            int optionPosition = 0;
            for (OptionRequest or : qr.options()) {
                boolean correct = qr.type() == QuestionType.SHORT_ANSWER || or.correct();
                optionRepository.save(QuizOption.builder()
                        .question(question)
                        .text(or.text().trim())
                        .correct(correct)
                        .position(optionPosition++)
                        .build());
            }
        }
        return toDetail(quiz);
    }

    // ----- Helpers -------------------------------------------------------------------

    private void deleteQuestionsAndOptions(Long quizId) {
        List<Long> questionIds = questionRepository.findAllByQuizIdOrderByPositionAscIdAsc(quizId).stream()
                .map(q -> q.getId())
                .toList();
        if (!questionIds.isEmpty()) {
            optionRepository.deleteAllByQuestionIdIn(questionIds);
            questionRepository.deleteAllByQuizId(quizId);
        }
    }

    private CourseModule resolveModule(Long moduleId, Long courseId) {
        if (moduleId == null) {
            return null;
        }
        CourseModule module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> ResourceNotFoundException.of("Module", moduleId));
        if (!module.getCourse().getId().equals(courseId)) {
            throw new BadRequestException("Module does not belong to the quiz's course");
        }
        return module;
    }

    private QuizDto toSummary(Quiz quiz) {
        List<QuizQuestion> questions = questionRepository.findAllByQuizIdOrderByPositionAscIdAsc(quiz.getId());
        return new QuizDto(
                quiz.getId(),
                quiz.getCourse().getId(),
                quiz.getCourse().getName(),
                quiz.getModule() != null ? quiz.getModule().getId() : null,
                quiz.getTitle(),
                quiz.getDescription(),
                quiz.getTimeLimitMinutes(),
                quiz.getMaxAttempts(),
                quiz.getPassScore(),
                quiz.isShuffleQuestions(),
                quiz.isPublished(),
                questions.size(),
                totalPoints(questions));
    }

    private QuizDetailDto toDetail(Quiz quiz) {
        List<QuizQuestion> questions = questionRepository.findAllByQuizIdOrderByPositionAscIdAsc(quiz.getId());
        List<QuestionDto> questionDtos = questions.stream()
                .map(q -> QuestionDto.from(q,
                        optionRepository.findAllByQuestionIdOrderByPositionAscIdAsc(q.getId())))
                .toList();
        return new QuizDetailDto(
                quiz.getId(),
                quiz.getCourse().getId(),
                quiz.getCourse().getName(),
                quiz.getModule() != null ? quiz.getModule().getId() : null,
                quiz.getTitle(),
                quiz.getDescription(),
                quiz.getTimeLimitMinutes(),
                quiz.getMaxAttempts(),
                quiz.getPassScore(),
                quiz.isShuffleQuestions(),
                quiz.isPublished(),
                questionDtos);
    }

    private static BigDecimal totalPoints(List<QuizQuestion> questions) {
        return questions.stream()
                .map(QuizQuestion::getPoints)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private static void validateQuestion(QuestionRequest qr) {
        List<OptionRequest> options = qr.options();
        if (options == null || options.isEmpty()) {
            throw new BadRequestException("Question '" + qr.text() + "' needs at least one option");
        }
        switch (qr.type()) {
            case SINGLE_CHOICE, TRUE_FALSE -> {
                if (options.size() < 2) {
                    throw new BadRequestException("Choice question '" + qr.text() + "' needs at least two options");
                }
                long correct = options.stream().filter(OptionRequest::correct).count();
                if (correct != 1) {
                    throw new BadRequestException("Question '" + qr.text() + "' must have exactly one correct option");
                }
            }
            case MULTIPLE_CHOICE -> {
                if (options.size() < 2) {
                    throw new BadRequestException("Choice question '" + qr.text() + "' needs at least two options");
                }
                if (options.stream().noneMatch(OptionRequest::correct)) {
                    throw new BadRequestException("Question '" + qr.text() + "' needs at least one correct option");
                }
            }
            case SHORT_ANSWER -> {
                // Every provided option is treated as an accepted answer; nothing else to enforce.
            }
        }
    }

    private Quiz loadQuiz(Long id) {
        return quizRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Quiz", id));
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
