package com.edumetric.backend.lessons;

import com.edumetric.backend.lessons.domain.Lesson;
import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface LessonRepository extends JpaRepository<Lesson, Long> {

    List<Lesson> findAllByTeacherIdAndScheduledAtBetweenOrderByScheduledAt(
            Long teacherId, OffsetDateTime from, OffsetDateTime to);

    List<Lesson> findAllByScheduledAtBetweenOrderByScheduledAt(OffsetDateTime from, OffsetDateTime to);

    @Query("""
            SELECT CASE WHEN COUNT(l) > 0 THEN TRUE ELSE FALSE END
            FROM Lesson l
            WHERE l.teacher.user.id = :teacherUserId
              AND l.group.id = (SELECT s.group.id FROM Student s WHERE s.id = :studentId)
            """)
    boolean teacherUserTeachesStudent(
            @Param("teacherUserId") Long teacherUserId, @Param("studentId") Long studentId);

    @Query("SELECT DISTINCT l.group.id FROM Lesson l WHERE l.teacher.user.id = :teacherUserId")
    List<Long> findGroupIdsForTeacherUser(@Param("teacherUserId") Long teacherUserId);

    @Query("SELECT DISTINCT l.group.course.id FROM Lesson l WHERE l.teacher.user.id = :teacherUserId")
    List<Long> findCourseIdsForTeacherUser(@Param("teacherUserId") Long teacherUserId);

    @Query("""
            SELECT CASE WHEN COUNT(l) > 0 THEN TRUE ELSE FALSE END
            FROM Lesson l
            WHERE l.teacher.user.id = :teacherUserId
              AND l.group.course.id = :courseId
            """)
    boolean teacherUserTeachesCourse(
            @Param("teacherUserId") Long teacherUserId, @Param("courseId") Long courseId);
}
