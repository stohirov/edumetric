package com.edumetric.backend.groups;

import com.edumetric.backend.common.exception.ResourceNotFoundException;
import com.edumetric.backend.courses.CourseRepository;
import com.edumetric.backend.courses.domain.Course;
import com.edumetric.backend.groups.domain.Group;
import com.edumetric.backend.groups.dto.CreateGroupRequest;
import com.edumetric.backend.groups.dto.GroupDto;
import com.edumetric.backend.groups.dto.UpdateGroupRequest;
import com.edumetric.backend.students.StudentRepository;
import com.edumetric.backend.students.dto.StudentDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class GroupService {

    private final GroupRepository groupRepository;
    private final CourseRepository courseRepository;
    private final StudentRepository studentRepository;

    @Transactional(readOnly = true)
    public Page<GroupDto> list(Pageable pageable) {
        return groupRepository.findAll(pageable).map(GroupDto::from);
    }

    @Transactional(readOnly = true)
    public GroupDto get(Long id) {
        return groupRepository.findById(id).map(GroupDto::from)
                .orElseThrow(() -> ResourceNotFoundException.of("Group", id));
    }

    @Transactional(readOnly = true)
    public Page<StudentDto> listStudents(Long groupId, Pageable pageable) {
        if (!groupRepository.existsById(groupId)) {
            throw ResourceNotFoundException.of("Group", groupId);
        }
        return studentRepository.findAllByGroupId(groupId, pageable).map(StudentDto::from);
    }

    @Transactional
    public GroupDto create(CreateGroupRequest request) {
        Course course = courseRepository.findById(request.courseId())
                .orElseThrow(() -> ResourceNotFoundException.of("Course", request.courseId()));
        Group group = Group.builder()
                .name(request.name())
                .course(course)
                .startDate(request.startDate())
                .endDate(request.endDate())
                .build();
        return GroupDto.from(groupRepository.save(group));
    }

    @Transactional
    public GroupDto update(Long id, UpdateGroupRequest request) {
        Group group = groupRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Group", id));
        if (StringUtils.hasText(request.name())) {
            group.setName(request.name());
        }
        if (request.courseId() != null) {
            Course course = courseRepository.findById(request.courseId())
                    .orElseThrow(() -> ResourceNotFoundException.of("Course", request.courseId()));
            group.setCourse(course);
        }
        if (request.startDate() != null) {
            group.setStartDate(request.startDate());
        }
        if (request.endDate() != null) {
            group.setEndDate(request.endDate());
        }
        return GroupDto.from(group);
    }

    @Transactional
    public void delete(Long id) {
        Group group = groupRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Group", id));
        groupRepository.delete(group);
    }
}
