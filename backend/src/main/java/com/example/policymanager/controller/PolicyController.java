package com.example.policymanager.controller;

import com.example.policymanager.beans.PolicyRequest;
import com.example.policymanager.beans.PolicyResponse;
import com.example.policymanager.beans.PolicyStatsResponse;
import com.example.policymanager.service.PolicyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/v1/policy")
public class PolicyController {

    @Autowired
    private PolicyService policyService;

    @PostMapping("/createPolicy")
    public PolicyResponse createPolicy(@RequestBody PolicyRequest request) {
        return policyService.createPolicy(request);
    }

    @PutMapping("/update/{policyNumber}")
    public PolicyResponse updatePolicy(
            @PathVariable String policyNumber,
            @RequestBody PolicyRequest request) {

        return policyService.updatePolicy(policyNumber, request);
    }

    @GetMapping("/maturity")
    public Page<PolicyResponse> getMaturityList(
            @RequestParam(required = false) java.time.LocalDate maturityFrom,
            @RequestParam(required = false) java.time.LocalDate maturityTo,
            @PageableDefault(size = 5) Pageable pageable) {
        return policyService.getMaturityPolicies(maturityFrom, maturityTo, pageable);
    }

    @GetMapping("/search")
    public Page<PolicyResponse> searchPolicy(
            @RequestParam(required = false) String policyNumber,
            @RequestParam(required = false) String personName,
            @RequestParam(required = false) String groupCode,
            @PageableDefault(size = 5) Pageable pageable) {
        return policyService.searchPolicy(policyNumber, personName, groupCode, pageable);
    }

    @GetMapping("/all")
    public Page<PolicyResponse> getAllPolicies(@PageableDefault(size = 10) Pageable pageable) {
        return policyService.getAllPolicies(pageable);
    }

    @GetMapping("/stats")
    public PolicyStatsResponse getPolicyStats() {
        return policyService.getPolicyStats();
    }

    @PostMapping("/download-excel")
    public ResponseEntity<byte[]> downloadExcel(@RequestBody PolicyRequest request) throws IOException {
        ByteArrayOutputStream excelFile = policyService.generateExcelReport(request);

        HttpHeaders headers = new HttpHeaders();
        headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"policy-report.xlsx\"");
        headers.set(HttpHeaders.CONTENT_TYPE, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

        return new ResponseEntity<>(excelFile.toByteArray(), headers, HttpStatus.OK);
    }

    @PostMapping("/download-all-policies-excel")
    public ResponseEntity<byte[]> downloadAllPoliciesExcel(@RequestBody List<PolicyRequest> requests)
            throws IOException {
        ByteArrayOutputStream excelFile = policyService.generateAllPoliciesExcel(requests);

        HttpHeaders headers = new HttpHeaders();
        headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"policies.xlsx\"");
        headers.set(HttpHeaders.CONTENT_TYPE, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

        return new ResponseEntity<>(excelFile.toByteArray(), headers, HttpStatus.OK);
    }
}
