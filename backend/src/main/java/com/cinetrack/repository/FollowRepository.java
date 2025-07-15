package com.cinetrack.repository;

import com.cinetrack.entity.Follow;
import com.cinetrack.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FollowRepository extends JpaRepository<Follow, Long> {
    
    // フォロー関係の存在確認
    boolean existsByFollowerIdAndFollowingId(Long followerId, Long followingId);
    
    // 特定のフォロー関係を取得
    Optional<Follow> findByFollowerIdAndFollowingId(Long followerId, Long followingId);
    
    // フォロー関係を削除
    void deleteByFollowerIdAndFollowingId(Long followerId, Long followingId);
    
    // ユーザーがフォローしている人のリストを取得
    @Query("SELECT f.following FROM Follow f WHERE f.follower.id = :userId ORDER BY f.createdAt DESC")
    List<User> findFollowingByUserId(@Param("userId") Long userId);
    
    // ユーザーをフォローしている人のリストを取得
    @Query("SELECT f.follower FROM Follow f WHERE f.following.id = :userId ORDER BY f.createdAt DESC")
    List<User> findFollowersByUserId(@Param("userId") Long userId);
    
    // フォロー数を取得
    @Query("SELECT COUNT(f) FROM Follow f WHERE f.follower.id = :userId")
    Long countFollowingByUserId(@Param("userId") Long userId);
    
    // フォロワー数を取得
    @Query("SELECT COUNT(f) FROM Follow f WHERE f.following.id = :userId")
    Long countFollowersByUserId(@Param("userId") Long userId);
    
    // 相互フォロー関係を確認
    @Query("SELECT CASE WHEN COUNT(f1) > 0 AND COUNT(f2) > 0 THEN true ELSE false END " +
           "FROM Follow f1 LEFT JOIN Follow f2 ON f1.follower.id = f2.following.id AND f1.following.id = f2.follower.id " +
           "WHERE f1.follower.id = :userId1 AND f1.following.id = :userId2")
    Boolean isMutualFollow(@Param("userId1") Long userId1, @Param("userId2") Long userId2);
    
    // ユーザーの最近のフォロー活動を取得（アクティビティフィード用）
    @Query("SELECT f FROM Follow f WHERE f.follower.id IN :userIds ORDER BY f.createdAt DESC")
    List<Follow> findRecentFollowsByUserIds(@Param("userIds") List<Long> userIds);
}