package com.example.policymanager.repository;

import com.example.policymanager.tables.UserPolicyArtifact;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ArtifactRepository extends JpaRepository<UserPolicyArtifact, Long> {
    Page<UserPolicyArtifact> findByPolicyNo(Long policyNo, Pageable pageable);
}
