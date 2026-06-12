package com.edumetric.backend.transcripts.domain;

import com.edumetric.backend.courses.domain.Course;
import com.edumetric.backend.organization.domain.AcademicTerm;
import com.edumetric.backend.students.domain.Student;
import com.edumetric.backend.users.domain.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
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
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

/**
 * A finalized course grade for one student in one academic term. Snapshots the
 * weighted course percentage at finalize time together with its derived letter
 * and 4.0-scale GPA, so a transcript stays stable even as later grades change.
 * Unique per (student, course, term); re-finalizing upserts the existing row.
 */
@Entity
@Table(
        name = "term_grades",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_term_grades_student_course_term",
                columnNames = {"student_id", "course_id", "term_id"}))
@Getter
@Setter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@EntityListeners(AuditingEntityListener.class)
public class TermGrade {

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

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "term_id", nullable = false)
    private AcademicTerm term;

    /** Weighted course percentage (0–100) at finalize time; null when the student had no grades. */
    @Column(name = "final_percent", precision = 6, scale = 2)
    private BigDecimal finalPercent;

    /** Display letter for the percentage under the institution's grading scale. */
    @Column(length = 8)
    private String letter;

    /** Derived 4.0-scale grade point for the percentage. */
    @Column(precision = 4, scale = 2)
    private BigDecimal gpa;

    /** The teacher/admin who finalized this grade; optional. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "finalized_by_user_id")
    private User finalizedBy;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
