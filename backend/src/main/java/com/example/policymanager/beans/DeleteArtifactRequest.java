package com.example.policymanager.beans;

public class DeleteArtifactRequest {
    private Long artifactId;

    public DeleteArtifactRequest() {
    }

    public DeleteArtifactRequest(Long artifactId) {
        this.artifactId = artifactId;
    }

    public Long getArtifactId() {
        return artifactId;
    }

    public void setArtifactId(Long artifactId) {
        this.artifactId = artifactId;
    }
}
