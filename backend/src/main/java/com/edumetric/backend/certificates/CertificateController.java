package com.edumetric.backend.certificates;

import com.edumetric.backend.certificates.dto.CertificateDto;
import com.edumetric.backend.certificates.dto.CertificateVerificationDto;
import com.edumetric.backend.common.api.ApiResponse;
import com.edumetric.backend.security.AuthenticatedUser;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/certificates")
@RequiredArgsConstructor
public class CertificateController {

    private final CertificateService certificateService;

    @PostMapping("/claim")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<CertificateDto>> claim(
            @AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(ApiResponse.ok(certificateService.claim(principal)));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<List<CertificateDto>>> myCertificates(
            @AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(ApiResponse.ok(certificateService.myCertificates(principal)));
    }

    /** PUBLIC — permitAll is configured in SecurityConfig; intentionally no @PreAuthorize. */
    @GetMapping("/verify/{code}")
    public ResponseEntity<ApiResponse<CertificateVerificationDto>> verify(@PathVariable String code) {
        return ResponseEntity.ok(ApiResponse.ok(certificateService.verify(code)));
    }
}
