package com.edumetric.backend.quizzes;

import com.edumetric.backend.quizzes.domain.Quiz;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuizRepository extends JpaRepository<Quiz, Long> {

    List<Quiz> findAllByCourseIdOrderByIdDesc(Long courseId);

    List<Quiz> findAllByCourseIdAndPublishedTrueOrderByIdDesc(Long courseId);
}
