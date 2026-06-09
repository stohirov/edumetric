package com.edumetric.backend.homework;

import com.edumetric.backend.config.MinioProperties;
import io.minio.BucketExistsArgs;
import io.minio.GetObjectArgs;
import io.minio.GetObjectResponse;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import java.io.InputStream;
import java.util.concurrent.atomic.AtomicBoolean;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/**
 * Thin wrapper over MinIO for uploading and streaming homework files.
 * The target bucket is created lazily on first use so the application still
 * boots when MinIO is temporarily unavailable.
 */
@Service
@RequiredArgsConstructor
public class FileStorageService {

    private static final Logger log = LoggerFactory.getLogger(FileStorageService.class);

    private final MinioClient minioClient;
    private final MinioProperties properties;
    private final AtomicBoolean bucketReady = new AtomicBoolean(false);

    /** Uploads the multipart file under {@code objectKey} and returns that key. */
    public String upload(String objectKey, MultipartFile file) {
        ensureBucket();
        try (InputStream stream = file.getInputStream()) {
            minioClient.putObject(PutObjectArgs.builder()
                    .bucket(properties.bucket())
                    .object(objectKey)
                    .stream(stream, file.getSize(), -1)
                    .contentType(file.getContentType() != null
                            ? file.getContentType()
                            : "application/octet-stream")
                    .build());
            return objectKey;
        } catch (Exception e) {
            throw new FileStorageException("Failed to upload file: " + e.getMessage(), e);
        }
    }

    /** Opens a stream to the stored object. Caller must close it. */
    public GetObjectResponse download(String objectKey) {
        try {
            return minioClient.getObject(GetObjectArgs.builder()
                    .bucket(properties.bucket())
                    .object(objectKey)
                    .build());
        } catch (Exception e) {
            throw new FileStorageException("Failed to download file: " + e.getMessage(), e);
        }
    }

    private void ensureBucket() {
        if (bucketReady.get()) {
            return;
        }
        try {
            boolean exists = minioClient.bucketExists(
                    BucketExistsArgs.builder().bucket(properties.bucket()).build());
            if (!exists) {
                minioClient.makeBucket(MakeBucketArgs.builder().bucket(properties.bucket()).build());
                log.info("Created MinIO bucket '{}'", properties.bucket());
            }
            bucketReady.set(true);
        } catch (Exception e) {
            throw new FileStorageException("Object storage unavailable: " + e.getMessage(), e);
        }
    }

    /** Raised when the object store cannot satisfy a request (maps to HTTP 500). */
    public static class FileStorageException extends RuntimeException {
        public FileStorageException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}
