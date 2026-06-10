package com.edumetric.backend.quizzes;

import com.edumetric.backend.quizzes.domain.QuizQuestion;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuizQuestionRepository extends JpaRepository<QuizQuestion, Long> {

    List<QuizQuestion> findAllByQuizIdOrderByPositionAscIdAsc(Long quizId);

    void deleteAllByQuizId(Long quizId);
}
