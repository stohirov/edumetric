package com.edumetric.backend.email;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * Dev/default email sender — logs the message rather than dispatching it. Keeps the email channel
 * fully wired end-to-end (preferences, fan-out, audit) so that enabling real delivery later is a
 * one-class change, while never sending anything in environments without an SMTP provider.
 */
@Component
public class LoggingEmailSender implements EmailSender {

    private static final Logger log = LoggerFactory.getLogger(LoggingEmailSender.class);

    @Override
    public void send(String to, String subject, String body) {
        if (to == null || to.isBlank()) {
            return;
        }
        log.info("[email] to={} subject=\"{}\" body=\"{}\"", to, subject, body);
    }
}
