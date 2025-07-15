package com.cinetrack.dto;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

public class UserDto {
    
    private Long id;
    private String username;
    private String email;
    private String displayName; // 表示名（将来的に追加予定）
    private String bio; // プロフィール（将来的に追加予定）
    private String avatarUrl; // アバター画像URL（将来的に追加予定）
    
    // フォロー関連の情報
    private Long followerCount;
    private Long followingCount;
    private Boolean isFollowing; // 現在のユーザーがこのユーザーをフォローしているか
    private Boolean isFollowedBy; // このユーザーが現在のユーザーをフォローしているか
    private Boolean isMutualFollow; // 相互フォローか
    
    // 統計情報
    private Long totalMovieCount;
    private Double averageRating;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime lastActiveAt;
    
    // Constructors
    public UserDto() {}
    
    public UserDto(Long id, String username, String email) {
        this.id = id;
        this.username = username;
        this.email = email;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }
    
    public String getBio() {
        return bio;
    }
    
    public void setBio(String bio) {
        this.bio = bio;
    }
    
    public String getAvatarUrl() {
        return avatarUrl;
    }
    
    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }
    
    public Long getFollowerCount() {
        return followerCount;
    }
    
    public void setFollowerCount(Long followerCount) {
        this.followerCount = followerCount;
    }
    
    public Long getFollowingCount() {
        return followingCount;
    }
    
    public void setFollowingCount(Long followingCount) {
        this.followingCount = followingCount;
    }
    
    public Boolean getIsFollowing() {
        return isFollowing;
    }
    
    public void setIsFollowing(Boolean isFollowing) {
        this.isFollowing = isFollowing;
    }
    
    public Boolean getIsFollowedBy() {
        return isFollowedBy;
    }
    
    public void setIsFollowedBy(Boolean isFollowedBy) {
        this.isFollowedBy = isFollowedBy;
    }
    
    public Boolean getIsMutualFollow() {
        return isMutualFollow;
    }
    
    public void setIsMutualFollow(Boolean isMutualFollow) {
        this.isMutualFollow = isMutualFollow;
    }
    
    public Long getTotalMovieCount() {
        return totalMovieCount;
    }
    
    public void setTotalMovieCount(Long totalMovieCount) {
        this.totalMovieCount = totalMovieCount;
    }
    
    public Double getAverageRating() {
        return averageRating;
    }
    
    public void setAverageRating(Double averageRating) {
        this.averageRating = averageRating;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getLastActiveAt() {
        return lastActiveAt;
    }
    
    public void setLastActiveAt(LocalDateTime lastActiveAt) {
        this.lastActiveAt = lastActiveAt;
    }
}