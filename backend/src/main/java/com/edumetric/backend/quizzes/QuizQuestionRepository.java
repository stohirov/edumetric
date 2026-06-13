package com.edumetric.backend.quizzes;

import com.edumetric.backend.quizzes.domain.QuizQuestion;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuizQuestionRepository extends JpaRepository<QuizQuestion, Long> {

    List<QuizQuestion> findAllByQuizIdOrderByPositionAscIdAsc(Long quizId);

    /** Questions for a set of quizzes — used to total each quiz's max points for the gradebook. */
    List<QuizQuestion> findAllByQuizIdIn(Collection<Long> quizIds);

    void deleteAllByQuizId(Long quizId);
}
