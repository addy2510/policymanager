package com.example.policymanager.repository;

import com.example.policymanager.tables.UserPolicyDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserPolicyRepository extends JpaRepository<UserPolicyDetails, Long> {

    // Search by policy number
    UserPolicyDetails findByPolicyNo(Long policyNo);

    // Search by policy holder
    List<UserPolicyDetails> findByPolicyHolderContainingIgnoreCase(String policyHolder);

    // Search by group code
    List<UserPolicyDetails> findByGroupCode(String groupCode);

    // Maturity list (example)
    List<UserPolicyDetails> findByMaturityDateBefore(java.time.LocalDate date);

    List<UserPolicyDetails> findByMaturityDateBetween(java.time.LocalDate start, java.time.LocalDate end);

    List<UserPolicyDetails> findByMaturityDateAfter(java.time.LocalDate date);
}
