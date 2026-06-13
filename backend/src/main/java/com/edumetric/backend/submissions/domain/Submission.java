package com.edumetric.backend.submissions.domain;

import com.edumetric.backend.courses.domain.Course;
import com.edumetric.backend.grades.domain.Assignment;
import com.edumetric.backend.quizzes.domain.Quiz;
import com.edumetric.backend.students.domain.Student;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

/**
 * Canonical, type-agnostic record that a student submitted work for a gradable
 * thing — unifying the previously separate {@code homework_submissions} and
 * {@code quiz_attempts} surfaces into one row per (student, gradable). Exactly
 * one of {@code assignment}/{@code quiz} is set, per {@link #kind}. For quizzes
 * the row carries the student's <em>best</em> attempt's score; for homework the
 * mark still lives on the {@code Grade} and is mirrored here once posted.
 *
 * <p>This is a synchronized header written transactionally alongside each source
 * write; the source tables keep their type-specific detail (uploaded files, quiz
 * answers). It lets the gradebook read every mark from a single table instead of
 * unioning the two surfaces at read time.
 */
@Entity
@Table(name = "submissions")
@Getter
@Setter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@EntityListeners(AuditingEntityListener.class)
public class Submission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private SubmissionKind kind;

    /** Set when {@link #kind} is {@code HOMEWORK}; null otherwise. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignment_id")
    private Assignment assignment;

    /** Set when {@link #kind} is {@code QUIZ}; null otherwise. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id")
    private Quiz quiz;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private SubmissionStatus status;

    /** Awarded points; null for an ungraded homework submission. */
    @Column(precision = 10, scale = 2)
    private BigDecimal score;

    /** Total possible points; null until graded. */
    @Column(name = "max_score", precision = 10, scale = 2)
    private BigDecimal maxScore;

    /** Homework (re)submission count, or number of quiz attempts taken. */
    @Column(name = "attempt_count", nullable = false)
    private int attemptCount;

    @Column(name = "submitted_at", nullable = false)
    private Instant submittedAt;

    @Column(name = "graded_at")
    private Instant gradedAt;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
