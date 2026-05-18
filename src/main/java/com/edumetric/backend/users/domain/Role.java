package com.edumetric.backend.users.domain;

public enum Role {
    ADMIN,
    TEACHER,
    STUDENT;

    public String authority() {
        return "ROLE_" + name();
    }
}
