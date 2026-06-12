package com.edumetric.backend.plagiarism.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.util.List;

/** A teacher's batch of text submissions for one assignment to run a pairwise similarity check on. */
public record CheckPlagiarismRequest(
        @NotNull Long assignmentId,
        @NotNull @Valid List<SubmissionText> submissions) {}
