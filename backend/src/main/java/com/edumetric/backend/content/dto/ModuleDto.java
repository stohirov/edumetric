package com.edumetric.backend.content.dto;

import com.edumetric.backend.content.domain.CourseMaterial;
import com.edumetric.backend.content.domain.CourseModule;
import java.util.List;

/** A course module with its ordered materials, for teacher/admin authoring. */
public record ModuleDto(
        Long id,
        Long courseId,
        String courseName,
        String title,
        String summary,
        int position,
        boolean published,
        Long prerequisiteModuleId,
        List<MaterialDto> materials) {

    public static ModuleDto from(CourseModule module, List<CourseMaterial> materials) {
        return new ModuleDto(
                module.getId(),
                module.getCourse().getId(),
                module.getCourse().getName(),
                module.getTitle(),
                module.getSummary(),
                module.getPosition(),
                module.isPublished(),
                module.getPrerequisite() != null ? module.getPrerequisite().getId() : null,
                materials.stream().map(MaterialDto::from).toList());
    }
}
