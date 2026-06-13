package com.edumetric.backend.config;

import java.time.Duration;
import java.util.Map;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;

/**
 * Caching for the expensive analytics aggregations (admin / teacher / cohort dashboards),
 * which re-scan every {@code student_metrics} row on each request.
 *
 * <p>The architecture's default stance is "the denormalized {@code student_metrics} table is
 * the cache" (see {@code ARCHITECTURE.md} §1). These dashboards sit a layer above that — they
 * aggregate across all rows — so a short-TTL cache in front of them is a clear win without
 * affecting the live per-student recompute demo (the <em>student</em> dashboard is never cached).
 *
 * <p>Backed by Redis when {@code app.cache.redis.enabled=true} (prod). Otherwise an in-process
 * {@link ConcurrentMapCacheManager} keeps the {@code @Cacheable} annotations working so dev and
 * test boot without a Redis server. Either way staleness is bounded — Redis by per-cache TTL,
 * and both by explicit eviction on a full recompute / formula change (see {@link AnalyticsCacheEvictor}).
 */
@Configuration
@EnableCaching
public class CacheConfig {

    public static final String ADMIN_DASHBOARD = "adminDashboard";
    public static final String TEACHER_DASHBOARD = "teacherDashboard";
    public static final String COHORT_COMPARISON = "cohortComparison";

    /** Redis-backed cache manager (prod). TTL bounds staleness if an eviction is ever missed. */
    @Bean
    @ConditionalOnProperty(name = "app.cache.redis.enabled", havingValue = "true")
    public RedisCacheManager redisCacheManager(RedisConnectionFactory connectionFactory) {
        RedisCacheConfiguration base = RedisCacheConfiguration.defaultCacheConfig()
                .disableCachingNullValues()
                .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(
                        new GenericJackson2JsonRedisSerializer()));

        Map<String, RedisCacheConfiguration> perCache = Map.of(
                ADMIN_DASHBOARD, base.entryTtl(Duration.ofMinutes(1)),
                TEACHER_DASHBOARD, base.entryTtl(Duration.ofMinutes(1)),
                COHORT_COMPARISON, base.entryTtl(Duration.ofMinutes(5)));

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(base.entryTtl(Duration.ofMinutes(1)))
                .withInitialCacheConfigurations(perCache)
                .build();
    }

    /** In-process fallback when Redis is disabled — no external server required. */
    @Bean
    @ConditionalOnMissingBean(CacheManager.class)
    public CacheManager simpleCacheManager() {
        return new ConcurrentMapCacheManager(ADMIN_DASHBOARD, TEACHER_DASHBOARD, COHORT_COMPARISON);
    }
}
