package com.example.policymanager.repository;

import com.example.policymanager.tables.UserPolicyDetails;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface UserPolicyRepository extends JpaRepository<UserPolicyDetails, Long> {

    // Search by policy number (exact)
    UserPolicyDetails findByPolicyNo(Long policyNo);

    // Search by policy holder (contains)
    Page<UserPolicyDetails> findByPolicyHolderContainingIgnoreCase(String policyHolder, Pageable pageable);

    // Search by group code (exact)
    Page<UserPolicyDetails> findByGroupCode(String groupCode, Pageable pageable);

    // Prefix search: group code starts with (case-insensitive)
    Page<UserPolicyDetails> findByGroupCodeStartingWithIgnoreCase(String groupCode, Pageable pageable);

    // Prefix search: policy holder starts with (case-insensitive)
    Page<UserPolicyDetails> findByPolicyHolderStartingWithIgnoreCase(String policyHolder, Pageable pageable);

    // Prefix search on numeric policy_no by casting to CHAR in a native query
    @Query(value = "SELECT * FROM user_policy_details u WHERE CAST(u.policy_no AS CHAR) LIKE CONCAT(:prefix, '%')", nativeQuery = true)
    Page<UserPolicyDetails> findByPolicyNoStartingWith(@Param("prefix") String prefix, Pageable pageable);

    boolean existsByGroupCode(String groupCode);

    // Maturity list (example)
    Page<UserPolicyDetails> findByMaturityDateBefore(java.time.LocalDate date, Pageable pageable);

    Page<UserPolicyDetails> findByMaturityDateBetween(java.time.LocalDate start, java.time.LocalDate end,
            Pageable pageable);

    Page<UserPolicyDetails> findByMaturityDateAfter(java.time.LocalDate date, Pageable pageable);

    long countByMaturityDateBefore(java.time.LocalDate date);
}
