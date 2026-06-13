package com.edumetric.backend.students;

import com.edumetric.backend.students.domain.Student;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface StudentRepository extends JpaRepository<Student, Long> {

    Optional<Student> findByUserId(Long userId);

    /**
     * All students enrolled in a course (i.e. whose group is mapped to that course),
     * eager-loading user + group to avoid N+1 when building the gradebook matrix.
     */
    @Query("""
            SELECT s FROM Student s
            JOIN FETCH s.user
            JOIN FETCH s.group g
            WHERE g.course.id = :courseId
            """)
    List<Student> findAllForCourse(@Param("courseId") Long courseId);

    Page<Student> findAllByGroupId(Long groupId, Pageable pageable);

    /** User ids of the students in a group — used to fan out group announcements. */
    @Query("SELECT s.user.id FROM Student s WHERE s.group.id = :groupId")
    List<Long> findUserIdsByGroupId(@Param("groupId") Long groupId);

    long countByGroupId(Long groupId);

    /**
     * Student counts for several groups in a single query — returns {@code [groupId, count]}
     * rows. Replaces a per-group {@link #countByGroupId} call inside dashboard loops.
     */
    @Query("SELECT s.group.id, COUNT(s) FROM Student s WHERE s.group.id IN :groupIds GROUP BY s.group.id")
    List<Object[]> countByGroupIdIn(@Param("groupIds") List<Long> groupIds);

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
