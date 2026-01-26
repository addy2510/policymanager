package com.example.policymanager.beans;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.example.status.PolicyStatus;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PolicyResponse {

    private Long policyNumber;
    private String personName;
    private String groupCode;
    private String fup;
    private LocalDate maturityDate;
    private BigDecimal premium;
    private String term;
    private LocalDate Dob;
    private String address;
    private String mode;
    private String product;
    private LocalDate commencementDate;
    private BigDecimal sumAssured;
    private PolicyStatus status;
    private String groupHead;

    public void setStatus(PolicyStatus status) {
        this.status = status;
    }
}