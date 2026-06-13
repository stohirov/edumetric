package com.edumetric.backend.peerreview;

import com.edumetric.backend.peerreview.domain.PeerReview;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PeerReviewRepository extends JpaRepository<PeerReview, Long> {

    Page<PeerReview> findAllByAssignmentIdOrderByIdAsc(Long assignmentId, Pageable pageable);

    Page<PeerReview> findAllByReviewerIdOrderByCreatedAtDesc(Long reviewerId, Pageable pageable);

    Optional<PeerReview> findOneById(Long id);

    boolean existsByAssignmentIdAndReviewerIdAndRevieweeId(
            Long assignmentId, Long reviewerId, Long revieweeId);
}
