package com.edumetric.backend.email;

/**
 * Outbound email abstraction. The only implementation today is {@link LoggingEmailSender}, which
 * writes messages to the application log — matching how the rest of the app handles "email not
 * yet wired" dev delivery (password-reset / verification tokens are logged the same way). Swapping
 * in a real SMTP/provider-backed sender is a drop-in replacement: implement this interface and
 * mark it {@code @Primary}.
 */
public interface EmailSender {

    void send(String to, String subject, String body);
}
