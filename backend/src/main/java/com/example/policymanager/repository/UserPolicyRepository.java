package com.example.policymanager.repository;

import com.example.policymanager.tables.UserPolicyDetails;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserPolicyRepository extends JpaRepository<UserPolicyDetails, Long> {

    // Search by policy number
    UserPolicyDetails findByPolicyNo(Long policyNo);

    // Search by policy holder
    Page<UserPolicyDetails> findByPolicyHolderContainingIgnoreCase(String policyHolder, Pageable pageable);

    // Search by group code
    Page<UserPolicyDetails> findByGroupCode(String groupCode, Pageable pageable);

    boolean existsByGroupCode(String groupCode);

    // Maturity list (example)
    Page<UserPolicyDetails> findByMaturityDateBefore(java.time.LocalDate date, Pageable pageable);

    Page<UserPolicyDetails> findByMaturityDateBetween(java.time.LocalDate start, java.time.LocalDate end,
            Pageable pageable);

    Page<UserPolicyDetails> findByMaturityDateAfter(java.time.LocalDate date, Pageable pageable);
}
