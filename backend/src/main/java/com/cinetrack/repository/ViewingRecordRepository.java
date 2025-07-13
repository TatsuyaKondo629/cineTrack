package com.cinetrack.repository;

import com.cinetrack.entity.ViewingRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ViewingRecordRepository extends JpaRepository<ViewingRecord, Long> {
    
    Page<ViewingRecord> findByUserIdOrderByViewingDateDesc(Long userId, Pageable pageable);
    
    List<ViewingRecord> findByUserIdOrderByViewingDateDesc(Long userId);
    
    boolean existsByUserIdAndTmdbMovieId(Long userId, Long tmdbMovieId);
    
    @Query("SELECT vr FROM ViewingRecord vr WHERE vr.user.id = :userId AND vr.rating >= :minRating ORDER BY vr.viewingDate DESC")
    List<ViewingRecord> findByUserIdAndRatingGreaterThanEqual(@Param("userId") Long userId, @Param("minRating") Double minRating);
    
    @Query("SELECT vr FROM ViewingRecord vr WHERE vr.user.id = :userId AND vr.viewingDate BETWEEN :startDate AND :endDate ORDER BY vr.viewingDate DESC")
    List<ViewingRecord> findByUserIdAndViewingDateBetween(@Param("userId") Long userId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT vr FROM ViewingRecord vr WHERE vr.user.id = :userId AND LOWER(vr.movieTitle) LIKE LOWER(CONCAT('%', :title, '%')) ORDER BY vr.viewingDate DESC")
    List<ViewingRecord> findByUserIdAndMovieTitleContainingIgnoreCase(@Param("userId") Long userId, @Param("title") String title);
    
    @Query("SELECT COUNT(vr) FROM ViewingRecord vr WHERE vr.user.id = :userId")
    Long countByUserId(@Param("userId") Long userId);
    
    @Query("SELECT AVG(vr.rating) FROM ViewingRecord vr WHERE vr.user.id = :userId")
    Double findAverageRatingByUserId(@Param("userId") Long userId);
    
    @Query("SELECT vr FROM ViewingRecord vr WHERE vr.user.id = :userId AND vr.theater IS NOT NULL AND vr.theater != '' ORDER BY vr.viewingDate DESC")
    List<ViewingRecord> findByUserIdWithTheater(@Param("userId") Long userId);
}