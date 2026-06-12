package com.edumetric.backend.library.dto;

import com.edumetric.backend.content.domain.CourseMaterial;

/** A single downloadable file entry in the cross-course Resource Library. */
public record LibraryItemDto(
        Long materialId,
        String title,
        Long courseId,
        String courseName,
        String moduleTitle,
        String fileName,
        Long fileSize,
        String contentType) {

    public static LibraryItemDto from(CourseMaterial material) {
        var module = material.getModule();
        var course = module.getCourse();
        return new LibraryItemDto(
                material.getId(),
                material.getTitle(),
                course.getId(),
                course.getName(),
                module.getTitle(),
                material.getFileName(),
                material.getFileSize(),
                material.getContentType());
    }
}
