package com.edumetric.backend.content;

import com.edumetric.backend.common.exception.BadRequestException;
import com.edumetric.backend.common.exception.ResourceNotFoundException;
import com.edumetric.backend.content.domain.CourseMaterial;
import com.edumetric.backend.content.domain.CourseModule;
import com.edumetric.backend.content.domain.MaterialCompletion;
import com.edumetric.backend.content.domain.MaterialType;
import com.edumetric.backend.content.dto.CourseContentDto;
import com.edumetric.backend.content.dto.CreateMaterialRequest;
import com.edumetric.backend.content.dto.CreateModuleRequest;
import com.edumetric.backend.content.dto.MaterialDto;
import com.edumetric.backend.content.dto.ModuleDto;
import com.edumetric.backend.content.dto.StudentMaterialDto;
import com.edumetric.backend.content.dto.StudentModuleDto;
import com.edumetric.backend.content.dto.UpdateMaterialRequest;
import com.edumetric.backend.content.dto.UpdateModuleRequest;
import com.edumetric.backend.courses.CourseRepository;
import com.edumetric.backend.courses.domain.Course;
import com.edumetric.backend.homework.FileStorageService;
import com.edumetric.backend.security.AuthenticatedUser;
import com.edumetric.backend.security.TeacherScope;
import com.edumetric.backend.students.StudentRepository;
import com.edumetric.backend.students.domain.Student;
import java.io.InputStream;
import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

/**
 * Authoring and consumption of course content: modules, materials, and a
 * student's per-material completion state. Teachers/admins author content for
 * courses they own; students read the published curriculum of their own course.
 */
@Service
@RequiredArgsConstructor
public class ContentService {

    /** Max material upload accepted by the application layer (multipart also caps this). */
    private static final long MAX_FILE_BYTES = 50L * 1024 * 1024;

    /** Extensions rejected outright as they are commonly used to deliver malware. */
    private static final Set<String> BLOCKED_EXTENSIONS = Set.of(
            "exe", "bat", "cmd", "com", "msi", "scr", "pif", "cpl",
            "sh", "bash", "ps1", "psm1", "vbs", "vbe", "js", "jse", "jar",
            "app", "dmg", "deb", "rpm", "dll", "so");

    private final CourseModuleRepository moduleRepository;
    private final CourseMaterialRepository materialRepository;
    private final MaterialCompletionRepository completionRepository;
    private final CourseRepository courseRepository;
    private final StudentRepository studentRepository;
    private final FileStorageService fileStorage;
    private final TeacherScope teacherScope;

    // ----- Teacher / admin authoring -------------------------------------------------

    @Transactional(readOnly = true)
    public List<ModuleDto> listModules(Long courseId, AuthenticatedUser actor) {
        teacherScope.assertTeachesCourse(actor, courseId);
        return moduleRepository.findAllByCourseIdOrderByPositionAscIdAsc(courseId).stream()
                .map(m -> ModuleDto.from(m,
                        materialRepository.findAllByModuleIdOrderByPositionAscIdAsc(m.getId())))
                .toList();
    }

    @Transactional
    public ModuleDto createModule(CreateModuleRequest request, AuthenticatedUser actor) {
        teacherScope.assertTeachesCourse(actor, request.courseId());
        Course course = courseRepository.findById(request.courseId())
                .orElseThrow(() -> ResourceNotFoundException.of("Course", request.courseId()));
        int position = request.position() != null
                ? request.position()
                : moduleRepository.findAllByCourseIdOrderByPositionAscIdAsc(course.getId()).size();
        CourseModule module = CourseModule.builder()
                .course(course)
                .title(request.title().trim())
                .summary(trimToNull(request.summary()))
                .position(position)
                .published(Boolean.TRUE.equals(request.published()))
                .build();
        return ModuleDto.from(moduleRepository.save(module), List.of());
    }

    @Transactional
    public ModuleDto updateModule(Long id, UpdateModuleRequest request, AuthenticatedUser actor) {
        CourseModule module = loadModule(id);
        teacherScope.assertTeachesCourse(actor, module.getCourse().getId());
        if (request.title() != null && !request.title().isBlank()) {
            module.setTitle(request.title().trim());
        }
        if (request.summary() != null) {
            module.setSummary(trimToNull(request.summary()));
        }
        if (request.position() != null) {
            module.setPosition(request.position());
        }
        if (request.published() != null) {
            module.setPublished(request.published());
        }
        return ModuleDto.from(module,
                materialRepository.findAllByModuleIdOrderByPositionAscIdAsc(module.getId()));
    }

    @Transactional
    public void deleteModule(Long id, AuthenticatedUser actor) {
        CourseModule module = loadModule(id);
        teacherScope.assertTeachesCourse(actor, module.getCourse().getId());
        List<CourseMaterial> materials =
                materialRepository.findAllByModuleIdOrderByPositionAscIdAsc(module.getId());
        for (CourseMaterial material : materials) {
            completionRepository.deleteAllByMaterialId(material.getId());
        }
        materialRepository.deleteAll(materials);
        moduleRepository.delete(module);
    }

    @Transactional
    public MaterialDto createMaterial(Long moduleId, CreateMaterialRequest request, AuthenticatedUser actor) {
        CourseModule module = loadModule(moduleId);
        teacherScope.assertTeachesCourse(actor, module.getCourse().getId());
        validateMaterialPayload(request.type(), request.url());
        int position = request.position() != null
                ? request.position()
                : materialRepository.findAllByModuleIdOrderByPositionAscIdAsc(moduleId).size();
        CourseMaterial material = CourseMaterial.builder()
                .module(module)
                .title(request.title().trim())
                .type(request.type())
                .content(trimToNull(request.content()))
                .url(trimToNull(request.url()))
                .position(position)
                .published(Boolean.TRUE.equals(request.published()))
                .build();
        return MaterialDto.from(materialRepository.save(material));
    }

    @Transactional
    public MaterialDto updateMaterial(Long id, UpdateMaterialRequest request, AuthenticatedUser actor) {
        CourseMaterial material = loadMaterial(id);
        teacherScope.assertTeachesCourse(actor, material.getModule().getCourse().getId());
        if (request.title() != null && !request.title().isBlank()) {
            material.setTitle(request.title().trim());
        }
        if (request.type() != null) {
            material.setType(request.type());
        }
        if (request.content() != null) {
            material.setContent(trimToNull(request.content()));
        }
        if (request.url() != null) {
            material.setUrl(trimToNull(request.url()));
        }
        if (request.position() != null) {
            material.setPosition(request.position());
        }
        if (request.published() != null) {
            material.setPublished(request.published());
        }
        validateMaterialPayload(material.getType(), material.getUrl());
        return MaterialDto.from(material);
    }

    @Transactional
    public void deleteMaterial(Long id, AuthenticatedUser actor) {
        CourseMaterial material = loadMaterial(id);
        teacherScope.assertTeachesCourse(actor, material.getModule().getCourse().getId());
        completionRepository.deleteAllByMaterialId(material.getId());
        materialRepository.delete(material);
    }

    @Transactional
    public MaterialDto uploadMaterialFile(Long id, MultipartFile file, AuthenticatedUser actor) {
        CourseMaterial material = loadMaterial(id);
        teacherScope.assertTeachesCourse(actor, material.getModule().getCourse().getId());
        if (material.getType() != MaterialType.FILE) {
            throw new BadRequestException("Only FILE materials can hold an upload");
        }
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("No file provided");
        }
        validateFile(file);
        String objectKey = "materials/%d/%s".formatted(material.getId(), sanitizeFileName(file.getOriginalFilename()));
        fileStorage.upload(objectKey, file);
        material.setFileObjectKey(objectKey);
        material.setFileName(file.getOriginalFilename());
        material.setFileSize(file.getSize());
        material.setContentType(file.getContentType());
        return MaterialDto.from(material);
    }

    @Transactional(readOnly = true)
    public DownloadedFile downloadForTeacher(Long materialId, AuthenticatedUser actor) {
        CourseMaterial material = loadMaterial(materialId);
        teacherScope.assertTeachesCourse(actor, material.getModule().getCourse().getId());
        return openFile(material);
    }

    // ----- Student consumption -------------------------------------------------------

    @Transactional(readOnly = true)
    public CourseContentDto getContentForStudent(AuthenticatedUser actor) {
        Student student = resolveStudent(actor);
        if (student.getGroup() == null || student.getGroup().getCourse() == null) {
            return new CourseContentDto(null, null, 0, 0, List.of());
        }
        Long courseId = student.getGroup().getCourse().getId();
        String courseName = student.getGroup().getCourse().getName();

        Set<Long> completedIds = completionRepository.findAllByStudentId(student.getId()).stream()
                .map(c -> c.getMaterial().getId())
                .collect(Collectors.toSet());

        int total = 0;
        int completed = 0;
        List<StudentModuleDto> modules = new java.util.ArrayList<>();
        for (CourseModule module : moduleRepository
                .findAllByCourseIdAndPublishedTrueOrderByPositionAscIdAsc(courseId)) {
            List<StudentMaterialDto> materials = new java.util.ArrayList<>();
            for (CourseMaterial m : materialRepository
                    .findAllByModuleIdAndPublishedTrueOrderByPositionAscIdAsc(module.getId())) {
                boolean done = completedIds.contains(m.getId());
                total++;
                if (done) {
                    completed++;
                }
                materials.add(StudentMaterialDto.of(m, done));
            }
            modules.add(new StudentModuleDto(
                    module.getId(), module.getTitle(), module.getSummary(), module.getPosition(), materials));
        }
        return new CourseContentDto(courseId, courseName, total, completed, modules);
    }

    @Transactional
    public void markComplete(Long materialId, AuthenticatedUser actor) {
        Student student = resolveStudent(actor);
        CourseMaterial material = loadMaterial(materialId);
        assertVisibleToStudent(material, student);
        if (completionRepository.findByStudentIdAndMaterialId(student.getId(), materialId).isEmpty()) {
            completionRepository.save(MaterialCompletion.builder()
                    .student(student)
                    .material(material)
                    .completedAt(Instant.now())
                    .build());
        }
    }

    @Transactional
    public void unmarkComplete(Long materialId, AuthenticatedUser actor) {
        Student student = resolveStudent(actor);
        completionRepository.deleteByStudentIdAndMaterialId(student.getId(), materialId);
    }

    @Transactional(readOnly = true)
    public DownloadedFile downloadForStudent(Long materialId, AuthenticatedUser actor) {
        Student student = resolveStudent(actor);
        CourseMaterial material = loadMaterial(materialId);
        assertVisibleToStudent(material, student);
        return openFile(material);
    }

    // ----- Helpers -------------------------------------------------------------------

    private DownloadedFile openFile(CourseMaterial material) {
        if (!material.hasFile()) {
            throw ResourceNotFoundException.of("Material file", material.getId());
        }
        return new DownloadedFile(
                fileStorage.download(material.getFileObjectKey()),
                material.getFileName(),
                material.getContentType(),
                material.getFileSize());
    }

    private CourseModule loadModule(Long id) {
        return moduleRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Module", id));
    }

    private CourseMaterial loadMaterial(Long id) {
        return materialRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Material", id));
    }

    private Student resolveStudent(AuthenticatedUser actor) {
        return studentRepository.findByUserId(actor.id())
                .orElseThrow(() -> ResourceNotFoundException.of("Student", actor.id()));
    }

    /** A material is visible to a student only if published (with its module) and in their course. */
    private void assertVisibleToStudent(CourseMaterial material, Student student) {
        boolean sameCourse = student.getGroup() != null
                && student.getGroup().getCourse() != null
                && student.getGroup().getCourse().getId()
                        .equals(material.getModule().getCourse().getId());
        if (!sameCourse || !material.isPublished() || !material.getModule().isPublished()) {
            throw new BadRequestException("Material is not available");
        }
    }

    private static void validateMaterialPayload(MaterialType type, String url) {
        if ((type == MaterialType.LINK || type == MaterialType.VIDEO)
                && (url == null || url.isBlank())) {
            throw new BadRequestException(type + " materials require a URL");
        }
    }

    private static void validateFile(MultipartFile file) {
        if (file.getSize() > MAX_FILE_BYTES) {
            throw new BadRequestException("File exceeds the 50 MB limit");
        }
        String name = file.getOriginalFilename();
        if (name != null) {
            int dot = name.lastIndexOf('.');
            if (dot >= 0 && dot < name.length() - 1) {
                String ext = name.substring(dot + 1).toLowerCase(Locale.ROOT);
                if (BLOCKED_EXTENSIONS.contains(ext)) {
                    throw new BadRequestException("File type ." + ext + " is not allowed");
                }
            }
        }
    }

    private static String sanitizeFileName(String original) {
        if (original == null || original.isBlank()) {
            return "upload";
        }
        String stripped = original.replaceAll(".*[/\\\\]", "");
        return stripped.replaceAll("[^A-Za-z0-9._-]", "_");
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    /** A file ready to be streamed back to the client. */
    public record DownloadedFile(InputStream stream, String fileName, String contentType, Long size) {
    }
}
