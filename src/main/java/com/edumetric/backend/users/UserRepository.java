package com.edumetric.backend.users;

import com.edumetric.backend.users.domain.Role;
import com.edumetric.backend.users.domain.User;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Page<User> findAllByRole(Role role, Pageable pageable);
}
