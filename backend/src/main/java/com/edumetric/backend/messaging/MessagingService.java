package com.edumetric.backend.messaging;

import com.edumetric.backend.common.exception.BadRequestException;
import com.edumetric.backend.common.exception.ForbiddenException;
import com.edumetric.backend.common.exception.ResourceNotFoundException;
import com.edumetric.backend.messaging.domain.Conversation;
import com.edumetric.backend.messaging.domain.Message;
import com.edumetric.backend.messaging.dto.ContactDto;
import com.edumetric.backend.messaging.dto.ConversationDto;
import com.edumetric.backend.messaging.dto.MessageDto;
import com.edumetric.backend.notifications.NotificationService;
import com.edumetric.backend.notifications.domain.NotificationType;
import com.edumetric.backend.security.AuthenticatedUser;
import com.edumetric.backend.users.UserRepository;
import com.edumetric.backend.users.domain.Role;
import com.edumetric.backend.users.domain.User;
import java.time.Instant;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MessagingService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional
    public ConversationDto startOrGet(AuthenticatedUser actor, Long otherUserId) {
        if (otherUserId == null || otherUserId.equals(actor.id())) {
            throw new BadRequestException("Cannot start a conversation with yourself");
        }
        User other = userRepository.findById(otherUserId)
                .orElseThrow(() -> ResourceNotFoundException.of("User", otherUserId));
        User self = userRepository.findById(actor.id())
                .orElseThrow(() -> ResourceNotFoundException.of("User", actor.id()));

        User userA = self.getId() < other.getId() ? self : other;
        User userB = self.getId() < other.getId() ? other : self;

        Conversation conversation = conversationRepository
                .findByPair(userA.getId(), userB.getId())
                .orElseGet(() -> conversationRepository.save(Conversation.builder()
                        .userA(userA)
                        .userB(userB)
                        .createdAt(Instant.now())
                        .build()));

        return ConversationDto.from(conversation, other, 0L);
    }

    @Transactional(readOnly = true)
    public Page<ConversationDto> listConversations(AuthenticatedUser actor, Pageable pageable) {
        return conversationRepository.findAllForUser(actor.id(), pageable)
                .map(conversation -> {
                    User other = conversation.getUserA().getId().equals(actor.id())
                            ? conversation.getUserB()
                            : conversation.getUserA();
                    long unread = messageRepository.countByConversationIdAndSenderIdNotAndReadAtIsNull(
                            conversation.getId(), actor.id());
                    return ConversationDto.from(conversation, other, unread);
                });
    }

    @Transactional
    public Page<MessageDto> messages(AuthenticatedUser actor, Long conversationId, Pageable pageable) {
        loadParticipantConversation(actor, conversationId);
        messageRepository.markRead(conversationId, actor.id(), Instant.now());
        return messageRepository.findAllByConversationIdOrderByCreatedAtAsc(conversationId, pageable)
                .map(message -> MessageDto.from(message, actor.id()));
    }

    @Transactional
    public MessageDto send(AuthenticatedUser actor, Long conversationId, String body) {
        Conversation conversation = loadParticipantConversation(actor, conversationId);
        User sender = userRepository.findById(actor.id())
                .orElseThrow(() -> ResourceNotFoundException.of("User", actor.id()));

        Message message = messageRepository.save(Message.builder()
                .conversation(conversation)
                .sender(sender)
                .body(body)
                .createdAt(Instant.now())
                .build());
        conversation.setLastMessageAt(message.getCreatedAt());

        User recipient = conversation.getUserA().getId().equals(actor.id())
                ? conversation.getUserB()
                : conversation.getUserA();
        String preview = body.length() > 120 ? body.substring(0, 120) : body;
        notificationService.notifyUser(
                recipient.getId(),
                NotificationType.MESSAGE_RECEIVED,
                "New message from " + sender.getFullName(),
                preview,
                "/" + roleSegment(recipient.getRole()) + "/messages");

        return MessageDto.from(message, actor.id());
    }

    @Transactional(readOnly = true)
    public List<ContactDto> contacts(AuthenticatedUser actor) {
        Set<Role> allowed = allowedContactRoles(actor.role());
        return userRepository.findAll().stream()
                .filter(user -> !user.getId().equals(actor.id()))
                .filter(user -> allowed.contains(user.getRole()))
                .map(ContactDto::from)
                .toList();
    }

    private Conversation loadParticipantConversation(AuthenticatedUser actor, Long conversationId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> ResourceNotFoundException.of("Conversation", conversationId));
        if (!conversation.getUserA().getId().equals(actor.id())
                && !conversation.getUserB().getId().equals(actor.id())) {
            throw new ForbiddenException("Not a participant in conversation " + conversationId);
        }
        return conversation;
    }

    private Set<Role> allowedContactRoles(Role role) {
        return switch (role) {
            case TEACHER, ADMIN -> EnumSet.of(Role.STUDENT, Role.PARENT, Role.TEACHER);
            case STUDENT, PARENT -> EnumSet.of(Role.TEACHER, Role.ADMIN);
        };
    }

    private String roleSegment(Role role) {
        return switch (role) {
            case STUDENT -> "student";
            case TEACHER -> "teacher";
            case ADMIN -> "admin";
            case PARENT -> "parent";
        };
    }
}
