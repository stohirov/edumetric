package com.edumetric.backend.messaging;

import com.edumetric.backend.common.api.ApiResponse;
import com.edumetric.backend.common.api.PageResponse;
import com.edumetric.backend.messaging.dto.ContactDto;
import com.edumetric.backend.messaging.dto.ConversationDto;
import com.edumetric.backend.messaging.dto.MessageDto;
import com.edumetric.backend.messaging.dto.SendMessageRequest;
import com.edumetric.backend.messaging.dto.StartConversationRequest;
import com.edumetric.backend.security.AuthenticatedUser;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessagingController {

    private final MessagingService messagingService;

    @GetMapping("/conversations")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PageResponse<ConversationDto>>> listConversations(
            @AuthenticationPrincipal AuthenticatedUser principal,
            Pageable pageable) {
        return ResponseEntity.ok(
                ApiResponse.ok(PageResponse.of(messagingService.listConversations(principal, pageable))));
    }

    @PostMapping("/conversations")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ConversationDto>> startConversation(
            @Valid @RequestBody StartConversationRequest request,
            @AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(ApiResponse.ok(messagingService.startOrGet(principal, request.userId())));
    }

    @GetMapping("/conversations/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PageResponse<MessageDto>>> messages(
            @PathVariable Long id,
            @AuthenticationPrincipal AuthenticatedUser principal,
            Pageable pageable) {
        return ResponseEntity.ok(
                ApiResponse.ok(PageResponse.of(messagingService.messages(principal, id, pageable))));
    }

    @PostMapping("/conversations/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<MessageDto>> send(
            @PathVariable Long id,
            @Valid @RequestBody SendMessageRequest request,
            @AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(ApiResponse.ok(messagingService.send(principal, id, request.body())));
    }

    @GetMapping("/contacts")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<ContactDto>>> contacts(
            @AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(ApiResponse.ok(messagingService.contacts(principal)));
    }
}
