package com.example.policymanager.beans;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
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

}