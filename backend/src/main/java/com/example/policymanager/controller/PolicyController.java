package com.example.policymanager.controller;

import com.example.policymanager.beans.PolicyRequest;
import com.example.policymanager.beans.PolicyResponse;
import com.example.policymanager.service.PolicyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
    @RequestMapping("/api/v1/policy")
    public class PolicyController {

        @Autowired
        private PolicyService policyService;

        @PostMapping
        public PolicyResponse createPolicy(@RequestBody PolicyRequest request) {
            return policyService.createPolicy(request);
        }

        @PutMapping("/{policyNumber}")
        public PolicyResponse updatePolicy(
                @PathVariable String policyNumber,
                @RequestBody PolicyRequest request) {

            return policyService.updatePolicy(policyNumber, request);
        }

        @GetMapping("/maturity")
        public List<PolicyResponse> getMaturityList() {
            return policyService.getMaturityPolicies();
        }

        @GetMapping("/search")
        public List<PolicyResponse> searchPolicy(
                @RequestParam(required = false) String policyNumber,
                @RequestParam(required = false) String personName,
                @RequestParam(required = false) String groupCode
        ) {
            return policyService.searchPolicy(policyNumber, personName, groupCode);
        }
    }

