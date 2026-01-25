package com.example.policymanager.tables;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Data
@Table(name = "user_policy_details")
public class UserPolicyDetails {

    @Id
    @Column(name = "policy_no")
    private Long policyNo;

    @Column(name = "group_code", length = 10)
    private String groupCode;

    @Column(name = "group_head", length = 100)
    private String groupHead;

    @Column(name = "fup", length = 10)
    private String fup;

    @Column(name = "dob")
    private LocalDate dob;

    @Column(name = "address", columnDefinition = "TEXT")
    private String address;

    @Column(name = "term", length = 20)
    private String term;

    @Column(name = "mode", length = 1)
    private String mode;

    @Column(name = "product", length = 100)
    private String product;

    @Column(name = "commencement_date")
    private LocalDate commencementDate;

    @Column(name = "maturity_date")
    private LocalDate maturityDate;

    @Column(name = "sum_assured", precision = 12, scale = 2)
    private BigDecimal sumAssured;

    @Column(name = "premium", precision = 10, scale = 2)
    private BigDecimal premium;

    @Column(name = "policy_holder", length = 100)
    private String policyHolder;
}