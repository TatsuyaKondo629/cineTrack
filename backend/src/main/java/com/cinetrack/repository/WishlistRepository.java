package com.cinetrack.repository;

import com.cinetrack.entity.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, Long> {
    
    /**
     * ユーザーのウィッシュリストを取得（作成日時の降順）
     */
    List<Wishlist> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    /**
     * ユーザーの特定の映画がウィッシュリストに存在するかチェック
     */
    boolean existsByUserIdAndTmdbMovieId(Long userId, Long tmdbMovieId);
    
    /**
     * ユーザーの特定の映画をウィッシュリストから取得
     */
    Optional<Wishlist> findByUserIdAndTmdbMovieId(Long userId, Long tmdbMovieId);
    
    /**
     * ユーザーのウィッシュリストの件数を取得
     */
    @Query("SELECT COUNT(w) FROM Wishlist w WHERE w.user.id = :userId")
    long countByUserId(@Param("userId") Long userId);
    
    /**
     * ユーザーのウィッシュリストから特定の映画を削除
     */
    void deleteByUserIdAndTmdbMovieId(Long userId, Long tmdbMovieId);
    
    /**
     * ユーザーのウィッシュリストをページネーション付きで取得
     */
    @Query("SELECT w FROM Wishlist w WHERE w.user.id = :userId ORDER BY w.createdAt DESC")
    List<Wishlist> findByUserIdWithPagination(@Param("userId") Long userId);
    
    /**
     * アクティビティフィード用：最新10件のウィッシュリストを取得
     */
    List<Wishlist> findTop10ByUserIdOrderByCreatedAtDesc(Long userId);
}