package com.edumetric.backend.bulkimport;

import com.edumetric.backend.bulkimport.BulkImportResultDto.RowError;
import com.edumetric.backend.common.exception.BadRequestException;
import com.edumetric.backend.students.StudentService;
import com.edumetric.backend.students.dto.CreateStudentRequest;
import com.edumetric.backend.teachers.TeacherService;
import com.edumetric.backend.teachers.dto.CreateTeacherRequest;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class BulkImportService {

    private static final String[] STUDENT_HEADER = {"email", "fullName", "password", "groupId", "enrolledAt"};
    private static final String[] TEACHER_HEADER = {"email", "fullName", "password", "department"};
    private static final SecureRandom RANDOM = new SecureRandom();

    private final StudentService studentService;
    private final TeacherService teacherService;

    public BulkImportResultDto importStudents(MultipartFile file) {
        List<String[]> rows = parse(file, STUDENT_HEADER);
        List<RowError> errors = new ArrayList<>();
        int created = 0;
        int total = rows.size();

        for (int i = 0; i < total; i++) {
            String[] cells = rows.get(i);
            int rowNumber = i + 2; // header is line 1
            String email = cell(cells, 0);
            try {
                String fullName = cell(cells, 1);
                String password = cell(cells, 2);
                String groupIdRaw = cell(cells, 3);
                String enrolledAtRaw = cell(cells, 4);

                if (email.isEmpty() || fullName.isEmpty() || groupIdRaw.isEmpty()) {
                    throw new BadRequestException("email, fullName and groupId are required");
                }
                Long groupId = parseLong(groupIdRaw, "groupId");
                LocalDate enrolledAt = parseDate(enrolledAtRaw);
                if (password.isEmpty()) {
                    password = generatePassword();
                }

                studentService.create(new CreateStudentRequest(email, password, fullName, groupId, enrolledAt));
                created++;
            } catch (Exception ex) {
                errors.add(new RowError(rowNumber, email, message(ex)));
            }
        }
        return new BulkImportResultDto(total, created, errors.size(), errors);
    }

    public BulkImportResultDto importTeachers(MultipartFile file) {
        List<String[]> rows = parse(file, TEACHER_HEADER);
        List<RowError> errors = new ArrayList<>();
        int created = 0;
        int total = rows.size();

        for (int i = 0; i < total; i++) {
            String[] cells = rows.get(i);
            int rowNumber = i + 2;
            String email = cell(cells, 0);
            try {
                String fullName = cell(cells, 1);
                String password = cell(cells, 2);
                String department = cell(cells, 3);

                if (email.isEmpty() || fullName.isEmpty()) {
                    throw new BadRequestException("email and fullName are required");
                }
                if (password.isEmpty()) {
                    password = generatePassword();
                }

                teacherService.create(new CreateTeacherRequest(
                        email, password, fullName, department.isEmpty() ? null : department));
                created++;
            } catch (Exception ex) {
                errors.add(new RowError(rowNumber, email, message(ex)));
            }
        }
        return new BulkImportResultDto(total, created, errors.size(), errors);
    }

    /**
     * Reads the CSV, validates the header against the expected column order and returns the data rows
     * (header excluded, fully-blank lines skipped). Each row is split into its raw cells; missing
     * trailing cells are tolerated and treated as blank.
     */
    private List<String[]> parse(MultipartFile file, String[] expectedHeader) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Uploaded file is empty");
        }

        List<String[]> dataRows = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {

            String headerLine = nextNonBlankLine(reader);
            if (headerLine == null) {
                throw new BadRequestException("CSV file has no header row");
            }
            validateHeader(headerLine, expectedHeader);

            String line;
            while ((line = reader.readLine()) != null) {
                if (line.strip().isEmpty()) {
                    continue; // skip fully-blank lines / trailing newline
                }
                dataRows.add(splitCells(line));
            }
        } catch (IOException ex) {
            throw new BadRequestException("Failed to read uploaded file: " + ex.getMessage());
        }
        return dataRows;
    }

    private String nextNonBlankLine(BufferedReader reader) throws IOException {
        String line;
        while ((line = reader.readLine()) != null) {
            if (!line.strip().isEmpty()) {
                return line;
            }
        }
        return null;
    }

    private void validateHeader(String headerLine, String[] expectedHeader) {
        String[] actual = splitCells(stripBom(headerLine));
        if (actual.length < expectedHeader.length) {
            throw new BadRequestException(
                    "Malformed CSV header. Expected columns: " + String.join(",", expectedHeader));
        }
        for (int i = 0; i < expectedHeader.length; i++) {
            if (!actual[i].equalsIgnoreCase(expectedHeader[i])) {
                throw new BadRequestException(
                        "Malformed CSV header. Expected columns: " + String.join(",", expectedHeader));
            }
        }
    }

    private String[] splitCells(String line) {
        String[] raw = line.split(",", -1);
        String[] trimmed = new String[raw.length];
        for (int i = 0; i < raw.length; i++) {
            trimmed[i] = raw[i].strip();
        }
        return trimmed;
    }

    private String cell(String[] cells, int index) {
        return index < cells.length ? cells[index] : "";
    }

    private Long parseLong(String value, String field) {
        try {
            return Long.parseLong(value);
        } catch (NumberFormatException ex) {
            throw new BadRequestException("Invalid " + field + ": " + value);
        }
    }

    private LocalDate parseDate(String value) {
        if (value == null || value.isEmpty()) {
            return null;
        }
        try {
            return LocalDate.parse(value);
        } catch (DateTimeParseException ex) {
            throw new BadRequestException("Invalid enrolledAt (expected ISO date yyyy-MM-dd): " + value);
        }
    }

    private String generatePassword() {
        // 16 chars, satisfies the @Size(min = 8) constraint on the create requests.
        String alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
        StringBuilder sb = new StringBuilder(16);
        for (int i = 0; i < 16; i++) {
            sb.append(alphabet.charAt(RANDOM.nextInt(alphabet.length())));
        }
        return sb.toString();
    }

    private String stripBom(String line) {
        if (!line.isEmpty() && line.charAt(0) == '﻿') {
            return line.substring(1);
        }
        return line;
    }

    private String message(Exception ex) {
        return ex.getMessage() != null ? ex.getMessage() : ex.getClass().getSimpleName();
    }
}
