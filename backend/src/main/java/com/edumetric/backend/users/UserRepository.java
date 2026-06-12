package com.edumetric.backend.users;

import com.edumetric.backend.users.domain.Role;
import com.edumetric.backend.users.domain.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Page<User> findAllByRole(Role role, Pageable pageable);

    /** Ids of all active (non-deleted) users — used to fan out institution-wide notifications. */
    @Query("SELECT u.id FROM User u")
    List<Long> findAllIds();
}
