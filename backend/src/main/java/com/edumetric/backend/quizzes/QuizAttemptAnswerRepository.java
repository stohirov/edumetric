package com.edumetric.backend.quizzes;

import com.edumetric.backend.quizzes.domain.QuizAttemptAnswer;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuizAttemptAnswerRepository extends JpaRepository<QuizAttemptAnswer, Long> {

    List<QuizAttemptAnswer> findAllByAttemptId(Long attemptId);

    void deleteAllByAttemptIdIn(List<Long> attemptIds);
}
