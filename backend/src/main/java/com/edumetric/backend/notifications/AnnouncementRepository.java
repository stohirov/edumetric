package com.edumetric.backend.notifications;

import com.edumetric.backend.notifications.domain.Announcement;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {

    List<Announcement> findTop50ByOrderByCreatedAtDesc();

    /** Paginated feed for staff (admins/teachers), newest first. */
    Page<Announcement> findAllByOrderByCreatedAtDesc(Pageable pageable);

    /** Announcements visible to a student: institution-wide plus the student's own group. */
    @Query("""
            SELECT a FROM Announcement a
            WHERE a.scope = com.edumetric.backend.notifications.domain.AnnouncementScope.ALL
               OR a.group.id = :groupId
            ORDER BY a.createdAt DESC
            """)
    List<Announcement> findVisibleToGroup(@Param("groupId") Long groupId);

    /** Paginated variant of {@link #findVisibleToGroup}. */
    @Query(value = """
            SELECT a FROM Announcement a
            WHERE a.scope = com.edumetric.backend.notifications.domain.AnnouncementScope.ALL
               OR a.group.id = :groupId
            ORDER BY a.createdAt DESC
            """,
            countQuery = """
            SELECT COUNT(a) FROM Announcement a
            WHERE a.scope = com.edumetric.backend.notifications.domain.AnnouncementScope.ALL
               OR a.group.id = :groupId
            """)
    Page<Announcement> findVisibleToGroup(@Param("groupId") Long groupId, Pageable pageable);
}
