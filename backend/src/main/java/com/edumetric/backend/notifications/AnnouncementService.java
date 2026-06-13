package com.edumetric.backend.notifications;

import com.edumetric.backend.audit.AuditLogService;
import com.edumetric.backend.common.exception.BadRequestException;
import com.edumetric.backend.common.exception.ForbiddenException;
import com.edumetric.backend.common.exception.ResourceNotFoundException;
import com.edumetric.backend.groups.GroupRepository;
import com.edumetric.backend.groups.domain.Group;
import com.edumetric.backend.lessons.LessonRepository;
import com.edumetric.backend.notifications.domain.Announcement;
import com.edumetric.backend.notifications.domain.AnnouncementScope;
import com.edumetric.backend.notifications.domain.NotificationType;
import com.edumetric.backend.notifications.dto.AnnouncementDto;
import com.edumetric.backend.notifications.dto.CreateAnnouncementRequest;
import com.edumetric.backend.security.AuthenticatedUser;
import com.edumetric.backend.students.StudentRepository;
import com.edumetric.backend.students.domain.Student;
import com.edumetric.backend.users.UserRepository;
import com.edumetric.backend.users.domain.Role;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final NotificationService notificationService;
    private final LessonRepository lessonRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final GroupRepository groupRepository;
    private final AuditLogService auditLogService;

    @Transactional
    public AnnouncementDto create(CreateAnnouncementRequest request, AuthenticatedUser actor) {
        Group group = null;
        if (request.scope() == AnnouncementScope.GROUP) {
            if (request.groupId() == null) {
                throw new BadRequestException("groupId is required for a GROUP announcement");
            }
            group = groupRepository.findById(request.groupId())
                    .orElseThrow(() -> ResourceNotFoundException.of("Group", request.groupId()));
            if (actor.role() == Role.TEACHER
                    && !lessonRepository.findGroupIdsForTeacherUser(actor.id()).contains(group.getId())) {
                throw new ForbiddenException("Not authorized for group " + group.getId());
            }
        } else if (actor.role() != Role.ADMIN) {
            // Only admins may broadcast institution-wide.
            throw new ForbiddenException("Only an admin can post an institution-wide announcement");
        }

        Announcement announcement = announcementRepository.save(Announcement.builder()
                .author(userRepository.getReferenceById(actor.id()))
                .scope(request.scope())
                .group(group)
                .title(request.title())
                .body(request.body())
                .build());

        List<Long> recipients = request.scope() == AnnouncementScope.ALL
                ? userRepository.findAllIds()
                : studentRepository.findUserIdsByGroupId(group.getId());
        recipients.removeIf(id -> id.equals(actor.id()));
        notificationService.notifyUsers(
                recipients, NotificationType.ANNOUNCEMENT, request.title(), request.body(), "/notifications");

        AnnouncementDto dto = AnnouncementDto.from(announcement);
        auditLogService.log("Announcement", announcement.getId(), "CREATED", actor.id(), dto);
        return dto;
    }

    @Transactional(readOnly = true)
    public Page<AnnouncementDto> list(AuthenticatedUser actor, Pageable pageable) {
        Page<Announcement> announcements;
        if (actor.role() == Role.STUDENT) {
            Long groupId = studentRepository.findByUserId(actor.id())
                    .map(Student::getGroup)
                    .map(Group::getId)
                    .orElse(null);
            announcements = announcementRepository.findVisibleToGroup(groupId, pageable);
        } else {
            announcements = announcementRepository.findAllByOrderByCreatedAtDesc(pageable);
        }
        return announcements.map(AnnouncementDto::from);
    }
}
