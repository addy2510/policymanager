package com.example.policymanager.service;

import com.example.policymanager.beans.PolicyRequest;
import com.example.policymanager.beans.PolicyResponse;
import com.example.policymanager.repository.UserPolicyRepository;
import com.example.policymanager.tables.UserPolicyDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PolicyService {

    @Autowired
    private UserPolicyRepository policyRepository;

    /**
     * Create New Policy
     */
    public PolicyResponse createPolicy(PolicyRequest request) {

        UserPolicyDetails policy = mapToEntity(request);
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
        existing.setFup(request.getFup());
        existing.setPremium(request.getPremium());
        existing.setMaturityDate(request.getMaturityDate());
        existing.setTerm(request.getTerm());

        UserPolicyDetails updated = policyRepository.save(existing);
        return mapToResponse(updated);
    }

    /**
     * Get Maturity List
     */
    public List<PolicyResponse> getMaturityPolicies() {

        List<UserPolicyDetails> policies =
                policyRepository.findByMaturityDateBefore(LocalDate.now());

        return policies.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Search Policy
     */
    public List<PolicyResponse> searchPolicy(String policyNumber,
                                             String personName,
                                             String groupCode) {

        if (policyNumber != null) {
            Optional<UserPolicyDetails> policy =
                    policyRepository.findById(Long.valueOf(policyNumber));

            return policy
                    .map(p -> List.of(mapToResponse(p)))
                    .orElse(List.of());
        }

        if (personName != null) {
            return policyRepository
                    .findByPolicyHolderContainingIgnoreCase(personName)
                    .stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        }

        if (groupCode != null) {
            return policyRepository
                    .findByGroupCode(groupCode)
                    .stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        }

        return List.of();
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