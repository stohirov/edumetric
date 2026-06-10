package com.edumetric.backend.content.dto;

import com.edumetric.backend.content.domain.CourseMaterial;
import com.edumetric.backend.content.domain.MaterialType;

/** A learning material as exposed to teachers/admins (authoring view). */
public record MaterialDto(
        Long id,
        Long moduleId,
        String title,
        MaterialType type,
        String content,
        String url,
        boolean hasFile,
        String fileName,
        Long fileSize,
        String contentType,
        int position,
        boolean published) {

    public static MaterialDto from(CourseMaterial m) {
        return new MaterialDto(
                m.getId(),
                m.getModule().getId(),
                m.getTitle(),
                m.getType(),
                m.getContent(),
                m.getUrl(),
                m.hasFile(),
                m.getFileName(),
                m.getFileSize(),
                m.getContentType(),
                m.getPosition(),
                m.isPublished());
    }
}
