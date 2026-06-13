package com.edumetric.backend.config;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Component;

/**
 * Clears the analytics dashboard caches when the underlying metrics change wholesale
 * (a full recompute or a formula-weights change). Per-student writes are left to the
 * short TTL — only bulk changes, where stale aggregates would be visibly wrong, evict
 * eagerly. Kept as a separate bean so the metrics slice can depend on it without pulling
 * in the whole analytics service (and to keep the cache annotations on a public proxy).
 */
@Component
public class AnalyticsCacheEvictor {

    @Caching(evict = {
            @CacheEvict(cacheNames = CacheConfig.ADMIN_DASHBOARD, allEntries = true),
            @CacheEvict(cacheNames = CacheConfig.TEACHER_DASHBOARD, allEntries = true),
            @CacheEvict(cacheNames = CacheConfig.COHORT_COMPARISON, allEntries = true),
    })
    public void evictAll() {
        // Annotation-driven; body intentionally empty.
    }
}
