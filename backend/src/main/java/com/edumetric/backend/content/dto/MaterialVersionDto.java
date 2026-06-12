package com.edumetric.backend.content.dto;

import com.edumetric.backend.content.domain.MaterialType;
import com.edumetric.backend.content.domain.MaterialVersion;
import java.time.Instant;

/** A historical snapshot of a material's editable fields. */
public record MaterialVersionDto(
        Long id,
        Long materialId,
        int versionNo,
        String title,
        MaterialType type,
        String content,
        String url,
        Instant createdAt,
        Long createdByUserId) {

    public static MaterialVersionDto from(MaterialVersion v) {
        return new MaterialVersionDto(
                v.getId(),
                v.getMaterial().getId(),
                v.getVersionNo(),
                v.getTitle(),
                v.getType(),
                v.getContent(),
                v.getUrl(),
                v.getCreatedAt(),
                v.getCreatedByUserId());
    }
}
