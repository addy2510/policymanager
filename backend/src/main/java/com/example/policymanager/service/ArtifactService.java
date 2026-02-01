package com.example.policymanager.service;

import com.example.policymanager.beans.ArtifactResponse;
import com.example.policymanager.repository.ArtifactRepository;
import com.example.policymanager.tables.UserPolicyArtifact;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ArtifactService {

    @Value("${FILE_UPLOAD_DIR:uploads}")
    private String uploadDir;

    @Value("${FILE_MAX_SIZE_BYTES:1048576}")
    private Long maxFileSizeBytes;

    @Autowired
    private ArtifactRepository artifactRepository;

    public ArtifactResponse storeArtifact(Long policyNo, MultipartFile file) throws IOException {
        validateContentType(file.getContentType());
        if (file.getSize() > maxFileSizeBytes) {
            throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE,
                    "File exceeds maximum allowed size of " + maxFileSizeBytes + " bytes");
        }

        Path policyDir = Path.of(uploadDir, String.valueOf(policyNo));
        Files.createDirectories(policyDir);

        String filename = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path target = policyDir.resolve(filename).normalize();

        try (var in = file.getInputStream()) {
            Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
        }

        UserPolicyArtifact a = new UserPolicyArtifact();
        a.setPolicyNo(policyNo);
        a.setFileName(file.getOriginalFilename());
        a.setContentType(file.getContentType());
        a.setSize(file.getSize());
        a.setFilePath(target.toString());
        a.setUploadedAt(LocalDateTime.now());

        UserPolicyArtifact saved = artifactRepository.save(a);
        return mapToResponse(saved);
    }

    public Page<ArtifactResponse> listArtifacts(Long policyNo, Pageable pageable) {
        Page<UserPolicyArtifact> page = artifactRepository.findByPolicyNo(policyNo, pageable);
        List<ArtifactResponse> content = page.stream().map(this::mapToResponse).collect(Collectors.toList());
        return new PageImpl<>(content, pageable, page.getTotalElements());
    }

    public Path getArtifactPath(Long id) {
        return artifactRepository.findById(id)
                .map(a -> Path.of(a.getFilePath()))
                .orElse(null);
    }

    private void validateContentType(String contentType) {
        if (contentType == null) {
            throw new IllegalArgumentException("Unsupported file type");
        }
        if (contentType.equalsIgnoreCase("application/pdf"))
            return;
        if (contentType.toLowerCase().startsWith("image/"))
            return;
        throw new IllegalArgumentException("Only PDF or image files are allowed");
    }

    private ArtifactResponse mapToResponse(UserPolicyArtifact a) {
        ArtifactResponse r = new ArtifactResponse();
        r.setId(a.getId());
        r.setPolicyNumber(a.getPolicyNo());
        r.setFileName(a.getFileName());
        r.setContentType(a.getContentType());
        r.setSize(a.getSize());
        r.setPath(a.getFilePath());
        r.setUploadedAt(a.getUploadedAt());
        return r;
    }
}
