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
import java.util.Random;
import java.util.stream.Collectors;

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
    public List<PolicyResponse> getMaturityPolicies(LocalDate maturityFrom, LocalDate maturityTo) {

        List<UserPolicyDetails> policies;

        if (maturityFrom == null) {
            if (maturityTo != null) {
                policies = policyRepository.findByMaturityDateBefore(maturityTo);
            } else {
                policies = List.of(); // or handle as needed
            }
        } else {
            if (maturityTo != null) {
                policies = policyRepository.findByMaturityDateBetween(maturityFrom, maturityTo);
            } else {
                policies = policyRepository.findByMaturityDateAfter(maturityFrom); // assuming you want from now on, but
                                                                                   // adjust
            }
        }

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
            Optional<UserPolicyDetails> policy = policyRepository.findById(Long.valueOf(policyNumber));

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

    // -------------------- UTILS --------------------

    private String generateUniqueGroupCode() {
        Random random = new Random();
        String code;
        do {
            int num = 100000 + random.nextInt(900000); // Generates 100000 to 999999
            code = String.valueOf(num);
        } while (!policyRepository.findByGroupCode(code).isEmpty());
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