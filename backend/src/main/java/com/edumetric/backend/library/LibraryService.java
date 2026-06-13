package com.edumetric.backend.library;

import com.edumetric.backend.library.dto.LibraryItemDto;
import com.edumetric.backend.security.AuthenticatedUser;
import com.edumetric.backend.students.StudentRepository;
import com.edumetric.backend.students.domain.Student;
import com.edumetric.backend.users.domain.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Builds the cross-course Resource Library: a flat, role-scoped list of all downloadable
 * FILE materials.
 *
 * <p>Scoping is intentionally a <em>shared</em> library:
 * <ul>
 *   <li>ADMIN / TEACHER — every published FILE material across all courses.</li>
 *   <li>STUDENT — only files belonging to their own course (via their group).</li>
 * </ul>
 *
 * <p>Listing only — actual downloads reuse the existing content endpoints
 * ({@code GET /api/content/materials/{id}/file} for students,
 * {@code GET /api/materials/{id}/file} for teachers/admins).
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LibraryService {

    private final LibraryRepository libraryRepository;
    private final StudentRepository studentRepository;

    public Page<LibraryItemDto> listFor(AuthenticatedUser actor, Pageable pageable) {
        Page<com.edumetric.backend.content.domain.CourseMaterial> materials =
                actor.role() == Role.STUDENT
                        ? findForStudent(actor, pageable)
                        : libraryRepository.findAllPublishedFiles(pageable);
        return materials.map(LibraryItemDto::from);
    }

    private Page<com.edumetric.backend.content.domain.CourseMaterial> findForStudent(
            AuthenticatedUser actor, Pageable pageable) {
        return studentRepository.findByUserId(actor.id())
                .map(Student::getGroup)
                .map(group -> group.getCourse().getId())
                .map(courseId -> libraryRepository.findPublishedFilesForCourse(courseId, pageable))
                .orElseGet(() -> new PageImpl<>(java.util.List.of(), pageable, 0));
    }
}
