package com.edumetric.backend.homework.dto;

import com.edumetric.backend.grades.domain.Assignment;
import com.edumetric.backend.grades.domain.AssignmentType;
import com.edumetric.backend.grades.domain.Grade;
import com.edumetric.backend.homework.domain.HomeworkStatus;
import com.edumetric.backend.homework.domain.HomeworkSubmission;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

/**
 * One assignment as it appears in the student's homework list, enriched with the
 * student's own submission state and grade (if any).
 */
public record HomeworkAssignmentDto(
        Long assignmentId,
        String name,
        AssignmentType type,
        BigDecimal maxValue,
        LocalDate dueDate,
        String courseName,
        HomeworkStatus status,
        boolean overdue,
        boolean submitted,
        Instant submittedAt,
        boolean hasFile,
        String fileName,
        String comment,
        boolean graded,
        BigDecimal gradeValue) {

    public static HomeworkAssignmentDto of(
            Assignment assignment, HomeworkSubmission submission, Grade grade, String courseName, LocalDate today) {
        boolean submitted = submission != null;
        boolean graded = grade != null;
        HomeworkStatus status = graded
                ? HomeworkStatus.GRADED
                : submitted ? HomeworkStatus.SUBMITTED : HomeworkStatus.PENDING;
        boolean overdue = !submitted
                && !graded
                && assignment.getDueDate() != null
                && assignment.getDueDate().isBefore(today);
        return new HomeworkAssignmentDto(
                assignment.getId(),
                assignment.getName(),
                assignment.getType(),
                assignment.getMaxValue(),
                assignment.getDueDate(),
                courseName,
                status,
                overdue,
                submitted,
                submitted ? submission.getSubmittedAt() : null,
                submitted && submission.hasFile(),
                submitted ? submission.getFileName() : null,
                submitted ? submission.getComment() : null,
                graded,
                graded ? grade.getValue() : null);
    }
}
