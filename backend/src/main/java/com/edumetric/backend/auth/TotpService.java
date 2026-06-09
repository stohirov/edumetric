package com.edumetric.backend.auth;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.stereotype.Service;

/**
 * Self-contained RFC 6238 TOTP (HMAC-SHA1, 6 digits, 30s step) plus a small
 * RFC 4648 Base32 codec. Implemented in-house to avoid pulling in an extra
 * dependency for a handful of primitives. Secrets are Base32 strings compatible
 * with Google Authenticator, Authy, 1Password, etc.
 */
@Service
public class TotpService {

    private static final String BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    private static final int SECRET_BYTES = 20; // 160-bit secret, the RFC 4226 recommendation.
    private static final int DIGITS = 6;
    private static final long TIME_STEP_SECONDS = 30;
    // Accept the previous/next step too, tolerating clock skew between server and device.
    private static final int WINDOW = 1;
    private static final SecureRandom RANDOM = new SecureRandom();

    /** Generates a fresh Base32 TOTP secret. */
    public String generateSecret() {
        byte[] bytes = new byte[SECRET_BYTES];
        RANDOM.nextBytes(bytes);
        return base32Encode(bytes);
    }

    /**
     * Builds the {@code otpauth://} provisioning URI rendered as a QR code by the
     * authenticator app. {@code issuer} and {@code account} label the entry.
     */
    public String provisioningUri(String secret, String issuer, String account) {
        String label = URLEncoder.encode(issuer + ":" + account, StandardCharsets.UTF_8);
        String enc = URLEncoder.encode(issuer, StandardCharsets.UTF_8);
        return "otpauth://totp/" + label
                + "?secret=" + secret
                + "&issuer=" + enc
                + "&algorithm=SHA1&digits=" + DIGITS + "&period=" + TIME_STEP_SECONDS;
    }

    /** Verifies a 6-digit code against the secret, allowing a ±1 step window. */
    public boolean verifyCode(String secret, String code) {
        if (secret == null || code == null) {
            return false;
        }
        String normalized = code.trim().replaceAll("\\s", "");
        if (normalized.length() != DIGITS || !normalized.chars().allMatch(Character::isDigit)) {
            return false;
        }
        int target;
        try {
            target = Integer.parseInt(normalized);
        } catch (NumberFormatException e) {
            return false;
        }
        byte[] key = base32Decode(secret);
        long counter = System.currentTimeMillis() / 1000L / TIME_STEP_SECONDS;
        for (int offset = -WINDOW; offset <= WINDOW; offset++) {
            if (generateCode(key, counter + offset) == target) {
                return true;
            }
        }
        return false;
    }

    private int generateCode(byte[] key, long counter) {
        byte[] data = new byte[8];
        long value = counter;
        for (int i = 7; i >= 0; i--) {
            data[i] = (byte) (value & 0xFF);
            value >>>= 8;
        }
        try {
            Mac mac = Mac.getInstance("HmacSHA1");
            mac.init(new SecretKeySpec(key, "HmacSHA1"));
            byte[] hash = mac.doFinal(data);
            int offset = hash[hash.length - 1] & 0x0F;
            int binary = ((hash[offset] & 0x7F) << 24)
                    | ((hash[offset + 1] & 0xFF) << 16)
                    | ((hash[offset + 2] & 0xFF) << 8)
                    | (hash[offset + 3] & 0xFF);
            return binary % (int) Math.pow(10, DIGITS);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to compute TOTP", e);
        }
    }

    private static String base32Encode(byte[] data) {
        StringBuilder result = new StringBuilder();
        int buffer = 0;
        int bitsLeft = 0;
        for (byte b : data) {
            buffer = (buffer << 8) | (b & 0xFF);
            bitsLeft += 8;
            while (bitsLeft >= 5) {
                int index = (buffer >> (bitsLeft - 5)) & 0x1F;
                bitsLeft -= 5;
                result.append(BASE32_ALPHABET.charAt(index));
            }
        }
        if (bitsLeft > 0) {
            int index = (buffer << (5 - bitsLeft)) & 0x1F;
            result.append(BASE32_ALPHABET.charAt(index));
        }
        return result.toString();
    }

    private static byte[] base32Decode(String encoded) {
        String clean = encoded.trim().replace("=", "").toUpperCase();
        int outLength = clean.length() * 5 / 8;
        byte[] result = new byte[outLength];
        int buffer = 0;
        int bitsLeft = 0;
        int index = 0;
        for (int i = 0; i < clean.length(); i++) {
            int val = BASE32_ALPHABET.indexOf(clean.charAt(i));
            if (val < 0) {
                continue;
            }
            buffer = (buffer << 5) | val;
            bitsLeft += 5;
            if (bitsLeft >= 8) {
                result[index++] = (byte) ((buffer >> (bitsLeft - 8)) & 0xFF);
                bitsLeft -= 8;
            }
        }
        return result;
    }
}
