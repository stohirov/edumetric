package com.edumetric.backend.students;

import com.edumetric.backend.auth.EmailVerificationService;
import com.edumetric.backend.common.exception.ConflictException;
import com.edumetric.backend.common.exception.ResourceNotFoundException;
import com.edumetric.backend.groups.GroupRepository;
import com.edumetric.backend.groups.domain.Group;
import com.edumetric.backend.students.domain.Student;
import com.edumetric.backend.students.dto.CreateStudentRequest;
import com.edumetric.backend.students.dto.StudentDto;
import com.edumetric.backend.students.dto.UpdateStudentRequest;
import com.edumetric.backend.users.UserRepository;
import com.edumetric.backend.users.domain.Role;
import com.edumetric.backend.users.domain.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final GroupRepository groupRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailVerificationService emailVerificationService;

    @Transactional(readOnly = true)
    public Page<StudentDto> list(Pageable pageable) {
        return studentRepository.findAll(pageable).map(StudentDto::from);
    }

    @Transactional(readOnly = true)
    public StudentDto get(Long id) {
        return studentRepository.findById(id).map(StudentDto::from)
                .orElseThrow(() -> ResourceNotFoundException.of("Student", id));
    }

    @Transactional(readOnly = true)
    public StudentDto getByUserId(Long userId) {
        return studentRepository.findByUserId(userId).map(StudentDto::from)
                .orElseThrow(() -> ResourceNotFoundException.of("Student (for user)", userId));
    }

    @Transactional(readOnly = true)
    public Long getIdByUserId(Long userId) {
        return studentRepository.findByUserId(userId)
                .map(Student::getId)
                .orElseThrow(() -> ResourceNotFoundException.of("Student (for user)", userId));
    }

    @Transactional
    public StudentDto create(CreateStudentRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ConflictException("Email already in use: " + request.email());
        }
        Group group = groupRepository.findById(request.groupId())
                .orElseThrow(() -> ResourceNotFoundException.of("Group", request.groupId()));

        User user = userRepository.save(User.builder()
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .fullName(request.fullName())
                .role(Role.STUDENT)
                .mustChangePassword(true)
                .build());
        emailVerificationService.issueForNewUser(user);

        Student student = Student.builder()
                .user(user)
                .group(group)
                .enrolledAt(request.enrolledAt())
                .build();
        return StudentDto.from(studentRepository.save(student));
    }

    @Transactional
    public StudentDto update(Long id, UpdateStudentRequest request) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Student", id));

        if (StringUtils.hasText(request.fullName())) {
            student.getUser().setFullName(request.fullName());
        }
        if (request.groupId() != null) {
            Group group = groupRepository.findById(request.groupId())
                    .orElseThrow(() -> ResourceNotFoundException.of("Group", request.groupId()));
            student.setGroup(group);
        }
        if (request.enrolledAt() != null) {
            student.setEnrolledAt(request.enrolledAt());
        }
        return StudentDto.from(student);
    }

    @Transactional
    public void delete(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Student", id));
        studentRepository.delete(student);
        userRepository.delete(student.getUser());
    }
}
