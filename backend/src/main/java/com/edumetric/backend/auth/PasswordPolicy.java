package com.edumetric.backend.auth;

import com.edumetric.backend.common.exception.BadRequestException;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Component;

/**
 * Central password-strength policy. Enforced wherever a user-supplied password
 * is set: admin user create/update, self-service profile change, and password
 * reset. Seeded/demo passwords bypass this (they are written directly).
 */
@Component
public class PasswordPolicy {

    static final int MIN_LENGTH = 8;
    static final int MAX_LENGTH = 200;

    /** Validates the raw password, throwing {@link BadRequestException} describing every unmet rule. */
    public void validate(String password) {
        List<String> requirements = new ArrayList<>();
        if (password == null || password.length() < MIN_LENGTH) {
            requirements.add("at least " + MIN_LENGTH + " characters");
        }
        if (password != null && password.length() > MAX_LENGTH) {
            requirements.add("at most " + MAX_LENGTH + " characters");
        }
        if (password == null || password.chars().noneMatch(Character::isUpperCase)) {
            requirements.add("an uppercase letter");
        }
        if (password == null || password.chars().noneMatch(Character::isLowerCase)) {
            requirements.add("a lowercase letter");
        }
        if (password == null || password.chars().noneMatch(Character::isDigit)) {
            requirements.add("a digit");
        }
        if (!requirements.isEmpty()) {
            throw new BadRequestException("Password must contain " + String.join(", ", requirements) + ".");
        }
    }
}
