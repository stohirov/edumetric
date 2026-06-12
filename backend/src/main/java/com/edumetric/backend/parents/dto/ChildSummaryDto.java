package com.edumetric.backend.parents.dto;

import com.edumetric.backend.students.domain.Student;

public record ChildSummaryDto(
        Long studentId,
        String studentName,
        String groupName) {

    public static ChildSummaryDto from(Student student) {
        return new ChildSummaryDto(
                student.getId(),
                student.getUser().getFullName(),
                student.getGroup() != null ? student.getGroup().getName() : null);
    }
}
