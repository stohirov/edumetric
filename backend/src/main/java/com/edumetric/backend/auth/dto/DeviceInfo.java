package com.edumetric.backend.auth.dto;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.util.StringUtils;

/**
 * Lightweight snapshot of the device/agent that obtained a refresh token, stored
 * alongside the token so users can recognise and revoke their sessions.
 */
public record DeviceInfo(String userAgent, String ipAddress) {

    private static final int MAX_USER_AGENT = 512;

    /** Extracts the agent and originating IP from an inbound request. */
    public static DeviceInfo from(HttpServletRequest request) {
        if (request == null) {
            return new DeviceInfo(null, null);
        }
        return new DeviceInfo(truncate(request.getHeader("User-Agent")), clientIp(request));
    }

    private static String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (StringUtils.hasText(forwarded)) {
            // First hop is the originating client when behind a trusted proxy.
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private static String truncate(String value) {
        if (value == null) {
            return null;
        }
        return value.length() > MAX_USER_AGENT ? value.substring(0, MAX_USER_AGENT) : value;
    }
}
