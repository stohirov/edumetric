package com.edumetric.backend.parents;

import com.edumetric.backend.audit.AuditLogService;
import com.edumetric.backend.common.exception.BadRequestException;
import com.edumetric.backend.common.exception.ConflictException;
import com.edumetric.backend.common.exception.ForbiddenException;
import com.edumetric.backend.common.exception.ResourceNotFoundException;
import com.edumetric.backend.parents.domain.ParentLink;
import com.edumetric.backend.parents.dto.ChildSummaryDto;
import com.edumetric.backend.parents.dto.CreateParentLinkRequest;
import com.edumetric.backend.parents.dto.ParentLinkDto;
import com.edumetric.backend.students.StudentDashboardService;
import com.edumetric.backend.students.StudentRepository;
import com.edumetric.backend.students.domain.Student;
import com.edumetric.backend.students.dto.StudentDashboardDto;
import com.edumetric.backend.users.UserRepository;
import com.edumetric.backend.users.domain.Role;
import com.edumetric.backend.users.domain.User;
import java.time.Instant;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ParentService {

    private final ParentLinkRepository parentLinkRepository;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final StudentDashboardService studentDashboardService;
    private final AuditLogService auditLogService;

    // ----- ADMIN management -----

    @Transactional
    public ParentLinkDto createLink(CreateParentLinkRequest request, Long actorUserId) {
        User parent = userRepository.findById(request.parentUserId())
                .orElseThrow(() -> ResourceNotFoundException.of("User", request.parentUserId()));
        if (parent.getRole() != Role.PARENT) {
            throw new BadRequestException("User " + request.parentUserId() + " is not a PARENT");
        }
        Student student = studentRepository.findById(request.studentId())
                .orElseThrow(() -> ResourceNotFoundException.of("Student", request.studentId()));

        if (parentLinkRepository.existsByParentUserIdAndStudentId(parent.getId(), student.getId())) {
            throw new ConflictException(
                    "Parent " + parent.getId() + " is already linked to student " + student.getId());
        }

        ParentLink link = parentLinkRepository.save(ParentLink.builder()
                .parent(parent)
                .student(student)
                .relationship(request.relationship())
                .createdAt(Instant.now())
                .build());

        ParentLinkDto dto = ParentLinkDto.from(link);
        auditLogService.log("ParentLink", link.getId(), "PARENT_LINK_CREATE", actorUserId, dto);
        return dto;
    }

    @Transactional(readOnly = true)
    public List<ParentLinkDto> listLinks(Long parentUserId, Long studentId) {
        List<ParentLink> links;
        if (parentUserId != null) {
            links = parentLinkRepository.findAllByParentUserId(parentUserId);
        } else if (studentId != null) {
            links = parentLinkRepository.findAllByStudentId(studentId);
        } else {
            throw new BadRequestException("Either parentUserId or studentId must be provided");
        }
        return links.stream().map(ParentLinkDto::from).toList();
    }

    @Transactional
    public void deleteLink(Long id, Long actorUserId) {
        ParentLink link = parentLinkRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("ParentLink", id));
        parentLinkRepository.delete(link);
        auditLogService.log("ParentLink", id, "PARENT_LINK_DELETE", actorUserId, null);
    }

    // ----- PARENT self-service -----

    @Transactional(readOnly = true)
    public List<ChildSummaryDto> listChildren(Long parentUserId) {
        return parentLinkRepository.findAllByParentUserId(parentUserId).stream()
                .map(ParentLink::getStudent)
                .map(ChildSummaryDto::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public StudentDashboardDto childDashboard(Long parentUserId, Long studentId) {
        if (!parentLinkRepository.existsByParentUserIdAndStudentId(parentUserId, studentId)) {
            throw new ForbiddenException(
                    "Student " + studentId + " is not linked to the current parent");
        }
        return studentDashboardService.dashboard(studentId);
    }
}
