package com.edumetric.backend.content.dto;

import com.edumetric.backend.content.domain.CourseMaterial;
import com.edumetric.backend.content.domain.MaterialType;

/** A published material as seen by a student, with their completion state. */
public record StudentMaterialDto(
        Long id,
        String title,
        MaterialType type,
        String content,
        String url,
        boolean hasFile,
        String fileName,
        Long fileSize,
        String contentType,
        int position,
        boolean completed) {

    public static StudentMaterialDto of(CourseMaterial m, boolean completed) {
        return new StudentMaterialDto(
                m.getId(),
                m.getTitle(),
                m.getType(),
                m.getContent(),
                m.getUrl(),
                m.hasFile(),
                m.getFileName(),
                m.getFileSize(),
                m.getContentType(),
                m.getPosition(),
                completed);
    }
}
