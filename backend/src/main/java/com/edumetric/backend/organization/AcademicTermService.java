package com.edumetric.backend.organization;

import com.edumetric.backend.audit.AuditLogService;
import com.edumetric.backend.common.exception.BadRequestException;
import com.edumetric.backend.common.exception.ResourceNotFoundException;
import com.edumetric.backend.organization.domain.AcademicTerm;
import com.edumetric.backend.organization.dto.AcademicTermDto;
import com.edumetric.backend.organization.dto.CreateAcademicTermRequest;
import com.edumetric.backend.organization.dto.UpdateAcademicTermRequest;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class AcademicTermService {

    private final AcademicTermRepository academicTermRepository;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public List<AcademicTermDto> list() {
        return academicTermRepository.findAll(Sort.by(Sort.Direction.DESC, "startDate")).stream()
                .map(AcademicTermDto::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public AcademicTermDto get(Long id) {
        return academicTermRepository.findById(id).map(AcademicTermDto::from)
                .orElseThrow(() -> ResourceNotFoundException.of("AcademicTerm", id));
    }

    @Transactional
    public AcademicTermDto create(CreateAcademicTermRequest request, Long actorUserId) {
        if (!request.endDate().isAfter(request.startDate())) {
            throw new BadRequestException("endDate must be after startDate.");
        }
        boolean current = Boolean.TRUE.equals(request.current());
        if (current) {
            clearCurrentTerms();
        }
        AcademicTerm term = AcademicTerm.builder()
                .name(request.name())
                .startDate(request.startDate())
                .endDate(request.endDate())
                .current(current)
                .build();
        AcademicTerm saved = academicTermRepository.save(term);
        auditLogService.log("AcademicTerm", saved.getId(), "ACADEMIC_TERM_CREATE", actorUserId,
                Map.of("name", saved.getName(), "current", saved.isCurrent()));
        return AcademicTermDto.from(saved);
    }

    @Transactional
    public AcademicTermDto update(Long id, UpdateAcademicTermRequest request, Long actorUserId) {
        AcademicTerm term = academicTermRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("AcademicTerm", id));
        LocalDate effectiveStart = request.startDate() != null ? request.startDate() : term.getStartDate();
        LocalDate effectiveEnd = request.endDate() != null ? request.endDate() : term.getEndDate();
        if (!effectiveEnd.isAfter(effectiveStart)) {
            throw new BadRequestException("endDate must be after startDate.");
        }
        if (StringUtils.hasText(request.name())) {
            term.setName(request.name());
        }
        if (request.startDate() != null) {
            term.setStartDate(request.startDate());
        }
        if (request.endDate() != null) {
            term.setEndDate(request.endDate());
        }
        if (request.current() != null) {
            if (request.current() && !term.isCurrent()) {
                clearCurrentTerms();
            }
            term.setCurrent(request.current());
        }
        auditLogService.log("AcademicTerm", term.getId(), "ACADEMIC_TERM_UPDATE", actorUserId,
                Map.of("name", term.getName(), "current", term.isCurrent()));
        return AcademicTermDto.from(term);
    }

    @Transactional
    public void delete(Long id, Long actorUserId) {
        AcademicTerm term = academicTermRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("AcademicTerm", id));
        academicTermRepository.delete(term);
        auditLogService.log("AcademicTerm", id, "ACADEMIC_TERM_DELETE", actorUserId,
                Map.of("name", term.getName()));
    }

    /** Ensures only one term can be marked current by clearing the flag on all others. */
    private void clearCurrentTerms() {
        List<AcademicTerm> currentTerms = academicTermRepository.findAllByCurrentTrue();
        for (AcademicTerm existing : currentTerms) {
            existing.setCurrent(false);
        }
    }
}
