package com.edumetric.backend.students;

import com.edumetric.backend.students.domain.Student;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface StudentRepository extends JpaRepository<Student, Long> {

    Optional<Student> findByUserId(Long userId);

    Page<Student> findAllByGroupId(Long groupId, Pageable pageable);

    long countByGroupId(Long groupId);

    @Query(value = """
            SELECT DISTINCT s FROM Student s
            WHERE s.group.id IN (
                SELECT DISTINCT l.group.id FROM Lesson l
                WHERE l.teacher.user.id = :teacherUserId
            )
            """,
            countQuery = """
            SELECT COUNT(DISTINCT s) FROM Student s
            WHERE s.group.id IN (
                SELECT DISTINCT l.group.id FROM Lesson l
                WHERE l.teacher.user.id = :teacherUserId
            )
            """)
    Page<Student> findAllByTeacherUserId(@Param("teacherUserId") Long teacherUserId, Pageable pageable);
}
