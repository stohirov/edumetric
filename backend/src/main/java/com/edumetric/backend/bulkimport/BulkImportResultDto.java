package com.edumetric.backend.bulkimport;

import java.util.List;

public record BulkImportResultDto(int total, int created, int failed, List<RowError> errors) {

    public record RowError(int row, String email, String message) {
    }
}
