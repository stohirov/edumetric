package com.edumetric.backend.parents.dto;

import com.edumetric.backend.parents.domain.ParentLink;

public record ParentLinkDto(
        Long id,
        Long parentUserId,
        String parentName,
        Long studentId,
        String studentName,
        String relationship) {

    public static ParentLinkDto from(ParentLink link) {
        return new ParentLinkDto(
                link.getId(),
                link.getParent().getId(),
                link.getParent().getFullName(),
                link.getStudent().getId(),
                link.getStudent().getUser().getFullName(),
                link.getRelationship());
    }
}
