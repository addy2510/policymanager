package com.example.policymanager.beans;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PolicyRequest {

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
    private String groupHead;

}