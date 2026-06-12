package com.edumetric.backend.organization;

import com.edumetric.backend.audit.AuditLogService;
import com.edumetric.backend.common.exception.ConflictException;
import com.edumetric.backend.common.exception.ResourceNotFoundException;
import com.edumetric.backend.organization.domain.Department;
import com.edumetric.backend.organization.dto.CreateDepartmentRequest;
import com.edumetric.backend.organization.dto.DepartmentDto;
import com.edumetric.backend.organization.dto.UpdateDepartmentRequest;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public List<DepartmentDto> list() {
        return departmentRepository.findAll(Sort.by(Sort.Direction.ASC, "name")).stream()
                .map(DepartmentDto::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public DepartmentDto get(Long id) {
        return departmentRepository.findById(id).map(DepartmentDto::from)
                .orElseThrow(() -> ResourceNotFoundException.of("Department", id));
    }

    @Transactional
    public DepartmentDto create(CreateDepartmentRequest request, Long actorUserId) {
        if (departmentRepository.existsByCode(request.code())) {
            throw new ConflictException("Department code already exists: " + request.code());
        }
        Department department = Department.builder()
                .name(request.name())
                .code(request.code())
                .description(request.description())
                .build();
        Department saved = departmentRepository.save(department);
        auditLogService.log("Department", saved.getId(), "DEPARTMENT_CREATE", actorUserId,
                Map.of("name", saved.getName(), "code", saved.getCode()));
        return DepartmentDto.from(saved);
    }

    @Transactional
    public DepartmentDto update(Long id, UpdateDepartmentRequest request, Long actorUserId) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Department", id));
        if (StringUtils.hasText(request.name())) {
            department.setName(request.name());
        }
        if (StringUtils.hasText(request.code()) && !request.code().equals(department.getCode())) {
            if (departmentRepository.existsByCode(request.code())) {
                throw new ConflictException("Department code already exists: " + request.code());
            }
            department.setCode(request.code());
        }
        if (request.description() != null) {
            department.setDescription(request.description());
        }
        auditLogService.log("Department", department.getId(), "DEPARTMENT_UPDATE", actorUserId,
                Map.of("name", department.getName(), "code", department.getCode()));
        return DepartmentDto.from(department);
    }

    @Transactional
    public void delete(Long id, Long actorUserId) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Department", id));
        departmentRepository.delete(department);
        auditLogService.log("Department", id, "DEPARTMENT_DELETE", actorUserId,
                Map.of("code", department.getCode()));
    }
}
