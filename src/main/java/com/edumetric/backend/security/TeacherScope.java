package com.edumetric.backend.security;

import com.edumetric.backend.common.exception.ForbiddenException;
import com.edumetric.backend.lessons.LessonRepository;
import com.edumetric.backend.users.domain.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TeacherScope {

    private final LessonRepository lessonRepository;

    public void assertCanWriteFor(AuthenticatedUser actor, Long studentId) {
        if (actor.role() == Role.ADMIN) {
            return;
        }
        if (actor.role() != Role.TEACHER
                || !lessonRepository.teacherUserTeachesStudent(actor.id(), studentId)) {
            throw new ForbiddenException("Not authorized for student " + studentId);
        }
    }
}
