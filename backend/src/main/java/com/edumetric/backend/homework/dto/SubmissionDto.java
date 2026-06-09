package com.edumetric.backend.homework.dto;

import com.edumetric.backend.homework.domain.HomeworkSubmission;
import java.time.Instant;

/** Result returned to the student after a successful submit. */
public record SubmissionDto(
        Long id,
        Long assignmentId,
        String assignmentName,
        String comment,
        boolean hasFile,
        String fileName,
        Long fileSize,
        String contentType,
        Instant submittedAt) {

    public static SubmissionDto from(HomeworkSubmission submission) {
        return new SubmissionDto(
                submission.getId(),
                submission.getAssignment().getId(),
                submission.getAssignment().getName(),
                submission.getComment(),
                submission.hasFile(),
                submission.getFileName(),
                submission.getFileSize(),
                submission.getContentType(),
                submission.getSubmittedAt());
    }
}
