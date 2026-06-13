package com.edumetric.backend.seed;

import javax.sql.DataSource;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.stereotype.Component;

/**
 * Applies the demo dataset on dev startup by executing the single source of
 * truth, {@code db/seed/demo-seed.sql}.
 *
 * <p>The script is idempotent ({@code ON CONFLICT DO NOTHING} / {@code WHERE NOT
 * EXISTS} on every statement, plus trailing {@code setval} on each serial
 * sequence), so re-applying it never errors. We still guard on a sentinel row
 * so the append-only {@code INSERT .. SELECT} blocks (grades, attendance,
 * behavior/activity records — tables without a natural unique key) don't
 * accumulate duplicate rows across restarts.
 */
@Component
@Profile("dev")
@RequiredArgsConstructor
public class DemoSeedRunner implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DemoSeedRunner.class);
    private static final String SEED_SCRIPT = "db/seed/demo-seed.sql";
    private static final String SENTINEL_EMAIL = "admin@edumetric.io";

    private final DataSource dataSource;

    @Override
    public void run(String... args) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        Integer existing = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM users WHERE email = ?", Integer.class, SENTINEL_EMAIL);
        if (existing != null && existing > 0) {
            log.info("Demo seed already present, skipping");
            return;
        }
        log.info("Applying demo seed from {}", SEED_SCRIPT);
        ResourceDatabasePopulator populator = new ResourceDatabasePopulator();
        populator.addScript(new ClassPathResource(SEED_SCRIPT));
        populator.execute(dataSource);
        log.info("Demo seed applied");
    }
}
