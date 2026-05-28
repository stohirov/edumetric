package com.edumetric.backend.behavior.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record BulkBehaviorRequest(@NotEmpty @Valid List<BehaviorRecordRequest> entries) {
}
