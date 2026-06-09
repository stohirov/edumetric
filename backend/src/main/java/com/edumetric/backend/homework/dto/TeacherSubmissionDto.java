package com.edumetric.backend.homework.dto;

import com.edumetric.backend.grades.domain.Grade;
import com.edumetric.backend.homework.domain.HomeworkSubmission;
import java.math.BigDecimal;
import java.time.Instant;

/**
 * One student's submission for an assignment, as the teacher sees it in the
 * submissions list (includes the grade if one has been recorded).
 */
public record TeacherSubmissionDto(
        Long submissionId,
        Long studentId,
        String studentName,
        Instant submittedAt,
        boolean hasFile,
        String fileName,
        Long fileSize,
        String comment,
        boolean graded,
        BigDecimal gradeValue) {

    public static TeacherSubmissionDto of(HomeworkSubmission submission, Grade grade) {
        return new TeacherSubmissionDto(
                submission.getId(),
                submission.getStudent().getId(),
                submission.getStudent().getUser().getFullName(),
                submission.getSubmittedAt(),
                submission.hasFile(),
                submission.getFileName(),
                submission.getFileSize(),
                submission.getComment(),
                grade != null,
                grade != null ? grade.getValue() : null);
    }
}
