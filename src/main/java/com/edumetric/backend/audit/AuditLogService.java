package com.edumetric.backend.audit;

import com.edumetric.backend.audit.domain.AuditLog;
import com.edumetric.backend.users.UserRepository;
import com.edumetric.backend.users.domain.User;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.json.JsonMapper;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private static final Logger log = LoggerFactory.getLogger(AuditLogService.class);

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;
    private final JsonMapper jsonMapper;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(String entityType, Long entityId, String action, Long actorUserId, Object payload) {
        String payloadJson = serialize(payload);
        User actor = actorUserId != null ? userRepository.findById(actorUserId).orElse(null) : null;
        auditLogRepository.save(AuditLog.builder()
                .entityType(entityType)
                .entityId(entityId)
                .action(action)
                .actor(actor)
                .payload(payloadJson)
                .createdAt(Instant.now())
                .build());
    }

    private String serialize(Object payload) {
        if (payload == null) {
            return null;
        }
        try {
            return jsonMapper.writeValueAsString(payload);
        } catch (JsonProcessingException ex) {
            log.warn("Failed to serialize audit payload: {}", ex.getMessage());
            return null;
        }
    }
}
