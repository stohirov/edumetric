package com.edumetric.backend.common.api;

import java.util.List;

public record ApiResponse<T>(T data, String error, List<String> details) {

    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(data, null, null);
    }

    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(null, message, null);
    }

    public static <T> ApiResponse<T> error(String message, List<String> details) {
        return new ApiResponse<>(null, message, details);
    }
}
