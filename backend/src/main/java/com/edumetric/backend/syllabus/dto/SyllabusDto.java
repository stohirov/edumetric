package com.edumetric.backend.syllabus.dto;

import com.edumetric.backend.syllabus.domain.Syllabus;

/** A course syllabus for teacher/admin authoring or student consumption. */
public record SyllabusDto(
        Long id,
        Long courseId,
        String courseName,
        String objectives,
        String outline,
        boolean published) {

    public static SyllabusDto from(Syllabus syllabus) {
        return new SyllabusDto(
                syllabus.getId(),
                syllabus.getCourse().getId(),
                syllabus.getCourse().getName(),
                syllabus.getObjectives(),
                syllabus.getOutline(),
                syllabus.isPublished());
    }
}
