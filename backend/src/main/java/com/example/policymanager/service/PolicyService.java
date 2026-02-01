package com.example.policymanager.service;

import com.example.policymanager.beans.PolicyRequest;
import com.example.policymanager.beans.PolicyResponse;
import com.example.policymanager.beans.PolicyStatsResponse;
import com.example.policymanager.exception.PolicyAlreadyExistsException;
import com.example.policymanager.exception.PolicyNotFoundException;
import com.example.policymanager.repository.UserPolicyRepository;
import com.example.policymanager.tables.UserPolicyDetails;
import com.example.status.PolicyStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.Random;

@Service
public class PolicyService {

    @Autowired
    private UserPolicyRepository policyRepository;

    /**
     * Create New Policy
     */
    public PolicyResponse createPolicy(PolicyRequest request) {

        if (policyRepository.existsById(request.getPolicyNumber())) {
            throw new PolicyAlreadyExistsException(
                    "Policy number " + request.getPolicyNumber() + " already exists");
        }

        String uniqueGroupCode = generateUniqueGroupCode();

        UserPolicyDetails policy = mapToEntity(request);
        if (policy.getGroupCode() == null || policy.getGroupCode().isEmpty()) {
            policy.setGroupCode(uniqueGroupCode);
        }
        UserPolicyDetails saved = policyRepository.save(policy);

        return mapToResponse(saved);
    }

    /**
     * Update Policy / FUP
     */
    public PolicyResponse updatePolicy(String policyNumber, PolicyRequest request) {

        UserPolicyDetails existing = policyRepository.findById(Long.valueOf(policyNumber))
                .orElseThrow(() -> new PolicyNotFoundException("Policy not found: " + policyNumber));

        // Update fields
        if (request.getPersonName() != null) {
            existing.setPolicyHolder(request.getPersonName());
        }
        if (request.getGroupCode() != null) {
            existing.setGroupCode(request.getGroupCode());
        }
        if (request.getFup() != null) {
            existing.setFup(request.getFup());
        }
        if (request.getMaturityDate() != null) {
            existing.setMaturityDate(request.getMaturityDate());
        }
        if (request.getPremium() != null) {
            existing.setPremium(request.getPremium());
        }
        if (request.getTerm() != null) {
            existing.setTerm(request.getTerm());
        }
        if (request.getDob() != null) {
            existing.setDob(request.getDob());
        }
        if (request.getAddress() != null) {
            existing.setAddress(request.getAddress());
        }
        if (request.getMode() != null) {
            existing.setMode(request.getMode());
        }
        if (request.getProduct() != null) {
            existing.setProduct(request.getProduct());
        }
        if (request.getCommencementDate() != null) {
            existing.setCommencementDate(request.getCommencementDate());
        }
        if (request.getSumAssured() != null) {
            existing.setSumAssured(request.getSumAssured());
        }

        UserPolicyDetails updated = policyRepository.save(existing);
        return mapToResponse(updated);
    }

    /**
     * Get Maturity List
     */
    public Page<PolicyResponse> getMaturityPolicies(LocalDate maturityFrom, LocalDate maturityTo, Pageable pageable) {

        Page<UserPolicyDetails> policies;

        if (maturityFrom == null) {
            if (maturityTo != null) {
                policies = policyRepository.findByMaturityDateBefore(maturityTo, pageable);
            } else {
                policies = Page.empty(pageable);
            }
        } else {
            if (maturityTo != null) {
                policies = policyRepository.findByMaturityDateBetween(maturityFrom, maturityTo, pageable);
            } else {
                policies = policyRepository.findByMaturityDateAfter(maturityFrom, pageable);
            }
        }

        return policies.map(this::mapToResponse);
    }

    /**
     * Search Policy
     */
    public Page<PolicyResponse> searchPolicy(String policyNumber,
            String personName,
            String groupCode, Pageable pageable) {

        if (policyNumber != null) {
            // prefix search on policy number (numeric) by casting to string in repository
            Page<UserPolicyDetails> page = policyRepository.findByPolicyNoStartingWith(policyNumber, pageable);
            return page.map(this::mapToResponse);
        }

        if (personName != null) {
            // allow prefix search on person name
            Page<UserPolicyDetails> page = policyRepository
                    .findByPolicyHolderStartingWithIgnoreCase(personName, pageable);
            return page.map(this::mapToResponse);
        }

        if (groupCode != null) {
            // allow prefix search on group code
            Page<UserPolicyDetails> page = policyRepository
                    .findByGroupCodeStartingWithIgnoreCase(groupCode, pageable);
            return page.map(this::mapToResponse);
        }

        return Page.empty(pageable);
    }

    /**
     * Get All Policies
     */
    public Page<PolicyResponse> getAllPolicies(Pageable pageable) {
        return policyRepository.findAll(pageable).map(this::mapToResponse);
    }

    /**
     * Get Policy Stats
     */
    public PolicyStatsResponse getPolicyStats() {
        long total = policyRepository.count();
        long matured = policyRepository.countByMaturityDateBefore(LocalDate.now());
        long active = total - matured;
        return new PolicyStatsResponse(total, matured, active);
    }

    /**
     * Generate Excel Report for Policy Request
     */
    public ByteArrayOutputStream generateExcelReport(PolicyRequest request) throws IOException {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Policy Details");

        // Create header style
        CellStyle headerStyle = workbook.createCellStyle();
        Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerFont.setFontHeightInPoints((short) 12);
        headerStyle.setFont(headerFont);
        headerStyle.setAlignment(HorizontalAlignment.CENTER);
        headerStyle.setFillForegroundColor(IndexedColors.LIGHT_BLUE.getIndex());
        headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

        // Create data style
        CellStyle dataStyle = workbook.createCellStyle();
        dataStyle.setAlignment(HorizontalAlignment.LEFT);

        // Set column widths
        sheet.setColumnWidth(0, 25 * 256);
        sheet.setColumnWidth(1, 30 * 256);

        // Create header row
        Row headerRow = sheet.createRow(0);
        String[] headers = { "Field", "Value" };
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        // Add data rows
        int rowNum = 1;
        rowNum = addRow(sheet, rowNum, "Policy Number", String.valueOf(request.getPolicyNumber()), dataStyle);
        rowNum = addRow(sheet, rowNum, "Person Name", request.getPersonName(), dataStyle);
        rowNum = addRow(sheet, rowNum, "Group Code", request.getGroupCode(), dataStyle);
        rowNum = addRow(sheet, rowNum, "FUP", request.getFup(), dataStyle);
        rowNum = addRow(sheet, rowNum, "Maturity Date", String.valueOf(request.getMaturityDate()), dataStyle);
        rowNum = addRow(sheet, rowNum, "Premium", String.valueOf(request.getPremium()), dataStyle);
        rowNum = addRow(sheet, rowNum, "Term", request.getTerm(), dataStyle);
        rowNum = addRow(sheet, rowNum, "Date of Birth", String.valueOf(request.getDob()), dataStyle);
        rowNum = addRow(sheet, rowNum, "Address", request.getAddress(), dataStyle);
        rowNum = addRow(sheet, rowNum, "Mode", request.getMode(), dataStyle);
        rowNum = addRow(sheet, rowNum, "Product", request.getProduct(), dataStyle);
        rowNum = addRow(sheet, rowNum, "Commencement Date", String.valueOf(request.getCommencementDate()), dataStyle);
        rowNum = addRow(sheet, rowNum, "Sum Assured", String.valueOf(request.getSumAssured()), dataStyle);
        rowNum = addRow(sheet, rowNum, "Group Head", request.getGroupHead(), dataStyle);

        // Write to ByteArrayOutputStream
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        workbook.write(outputStream);
        workbook.close();

        return outputStream;
    }

    private int addRow(Sheet sheet, int rowNum, String fieldName, String value, CellStyle style) {
        Row row = sheet.createRow(rowNum);
        Cell cell1 = row.createCell(0);
        cell1.setCellValue(fieldName);
        cell1.setCellStyle(style);

        Cell cell2 = row.createCell(1);
        cell2.setCellValue(value != null ? value : "");
        cell2.setCellStyle(style);
        return rowNum + 1;
    }

    /**
     * Generate Excel Report for List of Policy Requests
     */
    public ByteArrayOutputStream generateAllPoliciesExcel(List<PolicyRequest> requests) throws IOException {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Policies");

        // Create header style
        CellStyle headerStyle = workbook.createCellStyle();
        Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerFont.setFontHeightInPoints((short) 11);
        headerStyle.setFont(headerFont);
        headerStyle.setAlignment(HorizontalAlignment.CENTER);
        headerStyle.setFillForegroundColor(IndexedColors.LIGHT_GREEN.getIndex());
        headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

        // Create data style
        CellStyle dataStyle = workbook.createCellStyle();
        dataStyle.setAlignment(HorizontalAlignment.LEFT);

        // Define column headers
        String[] columnHeaders = { "Policy Number", "Person Name", "Group Code", "FUP", "Maturity Date",
                "Premium", "Term", "Date of Birth", "Address", "Mode", "Product",
                "Commencement Date", "Sum Assured", "Group Head" };

        // Create header row
        Row headerRow = sheet.createRow(0);
        for (int i = 0; i < columnHeaders.length; i++) {
            sheet.setColumnWidth(i, 18 * 256);
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(columnHeaders[i]);
            cell.setCellStyle(headerStyle);
        }

        // Add data rows from the list of requests
        int rowNum = 1;
        for (PolicyRequest request : requests) {
            Row dataRow = sheet.createRow(rowNum++);

            dataRow.createCell(0)
                    .setCellValue(request.getPolicyNumber() != null ? request.getPolicyNumber().toString() : "");
            dataRow.createCell(1).setCellValue(request.getPersonName() != null ? request.getPersonName() : "");
            dataRow.createCell(2).setCellValue(request.getGroupCode() != null ? request.getGroupCode() : "");
            dataRow.createCell(3).setCellValue(request.getFup() != null ? request.getFup() : "");
            dataRow.createCell(4)
                    .setCellValue(request.getMaturityDate() != null ? request.getMaturityDate().toString() : "");
            dataRow.createCell(5).setCellValue(request.getPremium() != null ? request.getPremium().doubleValue() : 0);
            dataRow.createCell(6).setCellValue(request.getTerm() != null ? request.getTerm() : "");
            dataRow.createCell(7).setCellValue(request.getDob() != null ? request.getDob().toString() : "");
            dataRow.createCell(8).setCellValue(request.getAddress() != null ? request.getAddress() : "");
            dataRow.createCell(9).setCellValue(request.getMode() != null ? request.getMode() : "");
            dataRow.createCell(10).setCellValue(request.getProduct() != null ? request.getProduct() : "");
            dataRow.createCell(11).setCellValue(
                    request.getCommencementDate() != null ? request.getCommencementDate().toString() : "");
            dataRow.createCell(12)
                    .setCellValue(request.getSumAssured() != null ? request.getSumAssured().doubleValue() : 0);
            dataRow.createCell(13).setCellValue(request.getGroupHead() != null ? request.getGroupHead() : "");

            for (Cell cell : dataRow) {
                cell.setCellStyle(dataStyle);
            }
        }

        // Write to ByteArrayOutputStream
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        workbook.write(outputStream);
        workbook.close();

        return outputStream;
    }

    // -------------------- UTILS --------------------

    private String generateUniqueGroupCode() {
        Random random = new Random();
        String code;
        do {
            int num = 100000 + random.nextInt(900000); // Generates 100000 to 999999
            code = String.valueOf(num);
        } while (policyRepository.existsByGroupCode(code));
        return code;
    }

    // -------------------- MAPPERS --------------------

    private UserPolicyDetails mapToEntity(PolicyRequest request) {
        UserPolicyDetails entity = new UserPolicyDetails();

        entity.setPolicyNo(Long.valueOf(request.getPolicyNumber()));
        entity.setGroupCode(request.getGroupCode());
        entity.setGroupHead(request.getPersonName());
        entity.setFup(request.getFup());
        entity.setDob(request.getDob());
        entity.setAddress(request.getAddress());
        entity.setTerm(request.getTerm());
        entity.setMode(request.getMode());
        entity.setProduct(request.getProduct());
        entity.setCommencementDate(request.getCommencementDate());
        entity.setMaturityDate(request.getMaturityDate());
        entity.setSumAssured(request.getSumAssured());
        entity.setPremium(request.getPremium());
        entity.setPolicyHolder(request.getPersonName());

        return entity;
    }

    private PolicyResponse mapToResponse(UserPolicyDetails entity) {
        PolicyResponse response = new PolicyResponse();

        response.setPolicyNumber(entity.getPolicyNo());
        response.setPersonName(entity.getPolicyHolder());
        response.setGroupCode(entity.getGroupCode());
        response.setFup(entity.getFup());
        response.setMaturityDate(entity.getMaturityDate());
        response.setPremium(entity.getPremium());
        response.setTerm(entity.getTerm());
        response.setDob(entity.getDob());
        response.setAddress(entity.getAddress());
        response.setMode(entity.getMode());
        response.setProduct(entity.getProduct());
        response.setCommencementDate(entity.getCommencementDate());
        response.setSumAssured(entity.getSumAssured());
        response.setGroupHead(entity.getGroupHead());

        // Set status based on maturity date (null-safe)
        if (entity.getMaturityDate() != null) {
            if (entity.getMaturityDate().isAfter(LocalDate.now())) {
                response.setStatus(PolicyStatus.ACTIVE);
            } else {
                response.setStatus(PolicyStatus.MATURED);
            }
        } else {
            response.setStatus(PolicyStatus.ACTIVE);
        }

        return response;
    }
}