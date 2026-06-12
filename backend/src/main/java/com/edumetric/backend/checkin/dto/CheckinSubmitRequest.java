package com.edumetric.backend.checkin.dto;

import jakarta.validation.constraints.NotBlank;

public record CheckinSubmitRequest(@NotBlank String code) {
}
