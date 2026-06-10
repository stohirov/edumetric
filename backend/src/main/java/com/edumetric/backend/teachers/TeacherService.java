package com.edumetric.backend.teachers;

import com.edumetric.backend.auth.EmailVerificationService;
import com.edumetric.backend.common.exception.ConflictException;
import com.edumetric.backend.common.exception.ResourceNotFoundException;
import com.edumetric.backend.groups.GroupRepository;
import com.edumetric.backend.groups.dto.GroupDto;
import com.edumetric.backend.lessons.LessonRepository;
import com.edumetric.backend.students.StudentRepository;
import com.edumetric.backend.students.dto.StudentDto;
import com.edumetric.backend.teachers.domain.Teacher;
import com.edumetric.backend.teachers.dto.CreateTeacherRequest;
import com.edumetric.backend.teachers.dto.TeacherDto;
import com.edumetric.backend.teachers.dto.UpdateTeacherRequest;
import com.edumetric.backend.users.UserRepository;
import com.edumetric.backend.users.domain.Role;
import com.edumetric.backend.users.domain.User;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class TeacherService {

    private final TeacherRepository teacherRepository;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final GroupRepository groupRepository;
    private final LessonRepository lessonRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailVerificationService emailVerificationService;

    @Transactional(readOnly = true)
    public Page<TeacherDto> list(Pageable pageable) {
        return teacherRepository.findAll(pageable).map(TeacherDto::from);
    }

    @Transactional(readOnly = true)
    public TeacherDto get(Long id) {
        return teacherRepository.findById(id).map(TeacherDto::from)
                .orElseThrow(() -> ResourceNotFoundException.of("Teacher", id));
    }

    @Transactional(readOnly = true)
    public Page<StudentDto> listMyStudents(Long teacherUserId, Pageable pageable) {
        return studentRepository.findAllByTeacherUserId(teacherUserId, pageable).map(StudentDto::from);
    }

    @Transactional(readOnly = true)
    public List<GroupDto> listMyGroups(Long teacherUserId) {
        List<Long> ids = lessonRepository.findGroupIdsForTeacherUser(teacherUserId);
        if (ids.isEmpty()) return List.of();
        return groupRepository.findAllById(ids).stream().map(GroupDto::from).toList();
    }

    @Transactional
    public TeacherDto create(CreateTeacherRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ConflictException("Email already in use: " + request.email());
        }
        User user = userRepository.save(User.builder()
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .fullName(request.fullName())
                .role(Role.TEACHER)
                .build());
        emailVerificationService.issueForNewUser(user);

        Teacher teacher = Teacher.builder()
                .user(user)
                .department(request.department())
                .build();
        return TeacherDto.from(teacherRepository.save(teacher));
    }

    @Transactional
    public TeacherDto update(Long id, UpdateTeacherRequest request) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Teacher", id));

        if (StringUtils.hasText(request.fullName())) {
            teacher.getUser().setFullName(request.fullName());
        }
        if (request.department() != null) {
            teacher.setDepartment(request.department());
        }
        return TeacherDto.from(teacher);
    }

    @Transactional
    public void delete(Long id) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Teacher", id));
        teacherRepository.delete(teacher);
        userRepository.delete(teacher.getUser());
    }
}
