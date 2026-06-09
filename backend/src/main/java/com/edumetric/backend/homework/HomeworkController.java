package com.edumetric.backend.homework;

import com.edumetric.backend.common.api.ApiResponse;
import com.edumetric.backend.homework.HomeworkService.DownloadedFile;
import com.edumetric.backend.homework.dto.HomeworkAssignmentDto;
import com.edumetric.backend.homework.dto.SubmissionDto;
import com.edumetric.backend.homework.dto.TeacherSubmissionDto;
import com.edumetric.backend.security.AuthenticatedUser;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

@RestController
@RequestMapping("/api/homework")
@RequiredArgsConstructor
public class HomeworkController {

    private final HomeworkService homeworkService;

    @GetMapping("/me")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<List<HomeworkAssignmentDto>>> myHomework(
            @AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(ApiResponse.ok(homeworkService.listForCurrentStudent(principal)));
    }

    @PostMapping(path = "/{assignmentId}/submit", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<SubmissionDto>> submit(
            @PathVariable Long assignmentId,
            @RequestParam(value = "comment", required = false) String comment,
            @RequestParam(value = "file", required = false) org.springframework.web.multipart.MultipartFile file,
            @AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(
                ApiResponse.ok(homeworkService.submit(assignmentId, comment, file, principal)));
    }

    @GetMapping("/{assignmentId}/file")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<StreamingResponseBody> downloadFile(
            @PathVariable Long assignmentId,
            @AuthenticationPrincipal AuthenticatedUser principal) {
        return streamFile(homeworkService.download(assignmentId, principal));
    }

    @GetMapping("/assignments/{assignmentId}/submissions")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<TeacherSubmissionDto>>> submissions(
            @PathVariable Long assignmentId,
            @AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(
                ApiResponse.ok(homeworkService.listSubmissions(assignmentId, principal)));
    }

    @GetMapping("/submissions/{submissionId}/file")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<StreamingResponseBody> downloadSubmissionFile(
            @PathVariable Long submissionId,
            @AuthenticationPrincipal AuthenticatedUser principal) {
        return streamFile(homeworkService.downloadForTeacher(submissionId, principal));
    }

    private static ResponseEntity<StreamingResponseBody> streamFile(DownloadedFile file) {
        MediaType mediaType = file.contentType() != null
                ? MediaType.parseMediaType(file.contentType())
                : MediaType.APPLICATION_OCTET_STREAM;
        StreamingResponseBody body = output -> {
            try (var in = file.stream()) {
                in.transferTo(output);
            }
        };
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + file.fileName() + "\"")
                .contentType(mediaType)
                .body(body);
    }
}
