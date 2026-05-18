package com.edumetric.backend.security;

import com.edumetric.backend.students.StudentRepository;
import com.edumetric.backend.users.domain.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component("studentSelfScope")
@RequiredArgsConstructor
public class StudentSelfScope {

    private final StudentRepository studentRepository;

    public boolean isSelf(AuthenticatedUser user, Long studentId) {
        if (user == null || studentId == null) return false;
        if (user.role() != Role.STUDENT) return false;
        return studentRepository.findByUserId(user.id())
                .map(s -> s.getId().equals(studentId))
                .orElse(false);
    }
}
