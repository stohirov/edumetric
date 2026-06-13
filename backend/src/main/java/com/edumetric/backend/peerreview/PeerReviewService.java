package com.edumetric.backend.peerreview;

import com.edumetric.backend.audit.AuditLogService;
import com.edumetric.backend.common.exception.BadRequestException;
import com.edumetric.backend.common.exception.ConflictException;
import com.edumetric.backend.common.exception.ForbiddenException;
import com.edumetric.backend.common.exception.ResourceNotFoundException;
import com.edumetric.backend.grades.AssignmentRepository;
import com.edumetric.backend.grades.domain.Assignment;
import com.edumetric.backend.peerreview.domain.PeerReview;
import com.edumetric.backend.peerreview.domain.PeerReviewStatus;
import com.edumetric.backend.peerreview.dto.AssignPeerReviewRequest;
import com.edumetric.backend.peerreview.dto.PeerReviewDto;
import com.edumetric.backend.peerreview.dto.SubmitPeerReviewRequest;
import com.edumetric.backend.security.AuthenticatedUser;
import com.edumetric.backend.security.TeacherScope;
import com.edumetric.backend.students.StudentRepository;
import com.edumetric.backend.students.domain.Student;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PeerReviewService {

    private final PeerReviewRepository peerReviewRepository;
    private final AssignmentRepository assignmentRepository;
    private final StudentRepository studentRepository;
    private final TeacherScope teacherScope;
    private final AuditLogService auditLogService;

    @Transactional
    public PeerReviewDto assign(AssignPeerReviewRequest request, AuthenticatedUser actor) {
        Assignment assignment = assignmentRepository.findById(request.assignmentId())
                .orElseThrow(() -> ResourceNotFoundException.of("Assignment", request.assignmentId()));
        teacherScope.assertTeachesCourse(actor, assignment.getCourse().getId());

        if (request.reviewerStudentId().equals(request.revieweeStudentId())) {
            throw new BadRequestException("Reviewer and reviewee must be different students");
        }
        if (peerReviewRepository.existsByAssignmentIdAndReviewerIdAndRevieweeId(
                request.assignmentId(), request.reviewerStudentId(), request.revieweeStudentId())) {
            throw new ConflictException("Peer review already assigned for this reviewer and reviewee");
        }

        Student reviewer = studentRepository.findById(request.reviewerStudentId())
                .orElseThrow(() -> ResourceNotFoundException.of("Student", request.reviewerStudentId()));
        Student reviewee = studentRepository.findById(request.revieweeStudentId())
                .orElseThrow(() -> ResourceNotFoundException.of("Student", request.revieweeStudentId()));

        PeerReview review = peerReviewRepository.save(PeerReview.builder()
                .assignment(assignment)
                .reviewer(reviewer)
                .reviewee(reviewee)
                .status(PeerReviewStatus.ASSIGNED)
                .createdAt(Instant.now())
                .build());

        auditLogService.log("PeerReview", review.getId(), "PEER_REVIEW_ASSIGN", actor.id(), request);
        return PeerReviewDto.from(review);
    }

    @Transactional(readOnly = true)
    public Page<PeerReviewDto> listForAssignment(Long assignmentId, AuthenticatedUser actor, Pageable pageable) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> ResourceNotFoundException.of("Assignment", assignmentId));
        teacherScope.assertTeachesCourse(actor, assignment.getCourse().getId());
        return peerReviewRepository.findAllByAssignmentIdOrderByIdAsc(assignmentId, pageable)
                .map(PeerReviewDto::from);
    }

    @Transactional(readOnly = true)
    public Page<PeerReviewDto> myReviews(AuthenticatedUser actor, Pageable pageable) {
        Student student = studentRepository.findByUserId(actor.id())
                .orElseThrow(() -> ResourceNotFoundException.of("Student for user", actor.id()));
        return peerReviewRepository.findAllByReviewerIdOrderByCreatedAtDesc(student.getId(), pageable)
                .map(PeerReviewDto::from);
    }

    @Transactional
    public PeerReviewDto submit(Long id, SubmitPeerReviewRequest request, AuthenticatedUser actor) {
        PeerReview review = peerReviewRepository.findOneById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("PeerReview", id));
        Student student = studentRepository.findByUserId(actor.id())
                .orElseThrow(() -> ResourceNotFoundException.of("Student for user", actor.id()));
        if (!review.getReviewer().getId().equals(student.getId())) {
            throw new ForbiddenException("Not the assigned reviewer for peer review " + id);
        }

        review.setScore(request.score());
        review.setComments(request.comments());
        review.setStatus(PeerReviewStatus.SUBMITTED);
        review.setSubmittedAt(Instant.now());

        auditLogService.log("PeerReview", review.getId(), "PEER_REVIEW_SUBMIT", actor.id(), request);
        return PeerReviewDto.from(review);
    }
}
