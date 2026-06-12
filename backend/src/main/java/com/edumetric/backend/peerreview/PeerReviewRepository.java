package com.edumetric.backend.peerreview;

import com.edumetric.backend.peerreview.domain.PeerReview;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PeerReviewRepository extends JpaRepository<PeerReview, Long> {

    List<PeerReview> findAllByAssignmentIdOrderByIdAsc(Long assignmentId);

    List<PeerReview> findAllByReviewerStudentIdOrderByCreatedAtDesc(Long reviewerStudentId);

    Optional<PeerReview> findOneById(Long id);

    boolean existsByAssignmentIdAndReviewerStudentIdAndRevieweeStudentId(
            Long assignmentId, Long reviewerStudentId, Long revieweeStudentId);
}
