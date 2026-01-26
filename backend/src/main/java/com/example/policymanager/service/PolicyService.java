package com.example.policymanager.service;

import com.example.policymanager.beans.PolicyRequest;
import com.example.policymanager.beans.PolicyResponse;
import com.example.policymanager.beans.PolicyStatsResponse;
import com.example.policymanager.repository.UserPolicyRepository;
import com.example.policymanager.tables.UserPolicyDetails;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Random;

@Service
public class PolicyService {

    @Autowired
    private UserPolicyRepository policyRepository;

    /**
     * Create New Policy
     */
    public PolicyResponse createPolicy(PolicyRequest request) {

        if (policyRepository.existsById(request.getPolicyNumber())) {
            throw new RuntimeException("Policy number already exists");
        }

        String uniqueGroupCode = generateUniqueGroupCode();

        UserPolicyDetails policy = mapToEntity(request);
        policy.setGroupCode(uniqueGroupCode);
        UserPolicyDetails saved = policyRepository.save(policy);

        return mapToResponse(saved);
    }

    /**
     * Update Policy / FUP
     */
    public PolicyResponse updatePolicy(String policyNumber, PolicyRequest request) {

        UserPolicyDetails existing = policyRepository.findById(Long.valueOf(policyNumber))
                .orElseThrow(() -> new RuntimeException("Policy not found"));

        // Update fields
        if (request.getPersonName() != null) {
            existing.setPolicyHolder(request.getPersonName());
        }
        if (request.getGroupCode() != null) {
            existing.setGroupCode(request.getGroupCode());
        }
        if (request.getFup() != null) {
            existing.setFup(request.getFup());
        }
        if (request.getMaturityDate() != null) {
            existing.setMaturityDate(request.getMaturityDate());
        }
        if (request.getPremium() != null) {
            existing.setPremium(request.getPremium());
        }
        if (request.getTerm() != null) {
            existing.setTerm(request.getTerm());
        }
        if (request.getDob() != null) {
            existing.setDob(request.getDob());
        }
        if (request.getAddress() != null) {
            existing.setAddress(request.getAddress());
        }
        if (request.getMode() != null) {
            existing.setMode(request.getMode());
        }
        if (request.getProduct() != null) {
            existing.setProduct(request.getProduct());
        }
        if (request.getCommencementDate() != null) {
            existing.setCommencementDate(request.getCommencementDate());
        }
        if (request.getSumAssured() != null) {
            existing.setSumAssured(request.getSumAssured());
        }

        UserPolicyDetails updated = policyRepository.save(existing);
        return mapToResponse(updated);
    }

    /**
     * Get Maturity List
     */
    public Page<PolicyResponse> getMaturityPolicies(LocalDate maturityFrom, LocalDate maturityTo, Pageable pageable) {

        Page<UserPolicyDetails> policies;

        if (maturityFrom == null) {
            if (maturityTo != null) {
                policies = policyRepository.findByMaturityDateBefore(maturityTo, pageable);
            } else {
                policies = Page.empty(pageable);
            }
        } else {
            if (maturityTo != null) {
                policies = policyRepository.findByMaturityDateBetween(maturityFrom, maturityTo, pageable);
            } else {
                policies = policyRepository.findByMaturityDateAfter(maturityFrom, pageable);
            }
        }

        return policies.map(this::mapToResponse);
    }

    /**
     * Search Policy
     */
    public Page<PolicyResponse> searchPolicy(String policyNumber,
            String personName,
            String groupCode, Pageable pageable) {

        if (policyNumber != null) {
            Optional<UserPolicyDetails> policy = policyRepository.findById(Long.valueOf(policyNumber));

            List<PolicyResponse> content = policy
                    .map(p -> List.of(mapToResponse(p)))
                    .orElse(List.of());
            return new PageImpl<>(content, pageable, content.size());
        }

        if (personName != null) {
            Page<UserPolicyDetails> page = policyRepository
                    .findByPolicyHolderContainingIgnoreCase(personName, pageable);
            return page.map(this::mapToResponse);
        }

        if (groupCode != null) {
            Page<UserPolicyDetails> page = policyRepository
                    .findByGroupCode(groupCode, pageable);
            return page.map(this::mapToResponse);
        }

        return Page.empty(pageable);
    }

    /**
     * Get All Policies
     */
    public Page<PolicyResponse> getAllPolicies(Pageable pageable) {
        return policyRepository.findAll(pageable).map(this::mapToResponse);
    }

    /**
     * Get Policy Stats
     */
    public PolicyStatsResponse getPolicyStats() {
        long total = policyRepository.count();
        long matured = policyRepository.countByMaturityDateBefore(LocalDate.now());
        long active = total - matured;
        return new PolicyStatsResponse(total, matured, active);
    }

    // -------------------- UTILS --------------------

    private String generateUniqueGroupCode() {
        Random random = new Random();
        String code;
        do {
            int num = 100000 + random.nextInt(900000); // Generates 100000 to 999999
            code = String.valueOf(num);
        } while (policyRepository.existsByGroupCode(code));
        return code;
    }

    // -------------------- MAPPERS --------------------

    private UserPolicyDetails mapToEntity(PolicyRequest request) {
        UserPolicyDetails entity = new UserPolicyDetails();

        entity.setPolicyNo(Long.valueOf(request.getPolicyNumber()));
        entity.setGroupCode(request.getGroupCode());
        entity.setGroupHead(request.getPersonName());
        entity.setFup(request.getFup());
        entity.setDob(request.getDob());
        entity.setAddress(request.getAddress());
        entity.setTerm(request.getTerm());
        entity.setMode(request.getMode());
        entity.setProduct(request.getProduct());
        entity.setCommencementDate(request.getCommencementDate());
        entity.setMaturityDate(request.getMaturityDate());
        entity.setSumAssured(request.getSumAssured());
        entity.setPremium(request.getPremium());
        entity.setPolicyHolder(request.getPersonName());

        return entity;
    }

    private PolicyResponse mapToResponse(UserPolicyDetails entity) {
        PolicyResponse response = new PolicyResponse();

        response.setPolicyNumber(entity.getPolicyNo());
        response.setPersonName(entity.getPolicyHolder());
        response.setGroupCode(entity.getGroupCode());
        response.setFup(entity.getFup());
        response.setMaturityDate(entity.getMaturityDate());
        response.setPremium(entity.getPremium());

        return response;
    }
}