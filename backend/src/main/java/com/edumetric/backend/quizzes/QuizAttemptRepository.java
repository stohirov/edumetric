package com.edumetric.backend.quizzes;

import com.edumetric.backend.quizzes.domain.QuizAttempt;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {

    List<QuizAttempt> findAllByQuizIdAndStudentIdOrderByIdDesc(Long quizId, Long studentId);

    /** All attempts for a set of quizzes — used by the gradebook to fold quizzes into the matrix. */
    List<QuizAttempt> findAllByQuizIdIn(Collection<Long> quizIds);

    List<QuizAttempt> findAllByStudentId(Long studentId);

    List<QuizAttempt> findAllByQuizId(Long quizId);

    long countByQuizIdAndStudentId(Long quizId, Long studentId);

    long countByQuizId(Long quizId);
}
