package com.edumetric.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/** Object-storage (MinIO / S3-compatible) settings, bound from {@code app.minio.*}. */
@ConfigurationProperties("app.minio")
public record MinioProperties(
        String endpoint,
        String accessKey,
        String secretKey,
        String bucket
) {
}
