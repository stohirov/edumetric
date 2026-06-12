package com.edumetric.backend.parents.dto;

import jakarta.validation.constraints.NotNull;

public record CreateParentLinkRequest(
        @NotNull Long parentUserId,
        @NotNull Long studentId,
        String relationship) {
}
