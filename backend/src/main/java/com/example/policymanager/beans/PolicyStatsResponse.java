package com.example.policymanager.beans;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PolicyStatsResponse {
    private long totalPolicies;
    private long maturedPolicies;
    private long activePolicies;
}