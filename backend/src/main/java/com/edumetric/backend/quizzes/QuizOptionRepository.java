package com.edumetric.backend.quizzes;

import com.edumetric.backend.quizzes.domain.QuizOption;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuizOptionRepository extends JpaRepository<QuizOption, Long> {

    List<QuizOption> findAllByQuestionIdOrderByPositionAscIdAsc(Long questionId);

    List<QuizOption> findAllByQuestionIdInOrderByPositionAscIdAsc(List<Long> questionIds);

    void deleteAllByQuestionIdIn(List<Long> questionIds);
}
