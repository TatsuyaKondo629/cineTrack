package com.cinetrack.service;

import com.cinetrack.dto.UserDto;
import com.cinetrack.dto.ViewingRecordDto;
import com.cinetrack.dto.ActivityDto;
import com.cinetrack.entity.User;
import com.cinetrack.entity.Follow;
import com.cinetrack.entity.ViewingRecord;
import com.cinetrack.entity.Wishlist;
import com.cinetrack.repository.UserRepository;
import com.cinetrack.repository.FollowRepository;
import com.cinetrack.repository.ViewingRecordRepository;
import com.cinetrack.repository.WishlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.ArrayList;

@Service
@Transactional
public class SocialService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private FollowRepository followRepository;
    
    @Autowired
    private ViewingRecordRepository viewingRecordRepository;
    
    @Autowired
    private WishlistRepository wishlistRepository;
    
    /**
     * ユーザー名でユーザーを検索
     */
    public Page<UserDto> searchUsers(String query, UserDetails currentUser, Pageable pageable) {
        User user = getCurrentUser(currentUser);
        
        Page<User> usersPage;
        if (query == null || query.trim().isEmpty()) {
            // 全ユーザーを取得（自分以外）
            usersPage = userRepository.findByIdNotOrderByUsernameAsc(user.getId(), pageable);
        } else {
            // ユーザー名で検索（自分以外）
            usersPage = userRepository.findByUsernameContainingIgnoreCaseAndIdNotOrderByUsernameAsc(
                query.trim(), user.getId(), pageable);
        }
        
        List<UserDto> userDtos = usersPage.getContent().stream()
                .map(u -> convertToDto(u, user))
                .collect(Collectors.toList());
        
        return new PageImpl<>(userDtos, pageable, usersPage.getTotalElements());
    }
    
    /**
     * ユーザーIDでユーザー詳細を取得
     */
    public Optional<UserDto> getUserById(Long userId, UserDetails currentUser) {
        User user = getCurrentUser(currentUser);
        
        return userRepository.findById(userId)
                .map(targetUser -> convertToDto(targetUser, user));
    }
    
    /**
     * ユーザーをフォローする
     */
    public boolean followUser(Long targetUserId, UserDetails currentUser) {
        User user = getCurrentUser(currentUser);
        
        if (user.getId().equals(targetUserId)) {
            throw new RuntimeException("自分自身をフォローすることはできません");
        }
        
        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new RuntimeException("ユーザーが見つかりません"));
        
        // 既にフォローしているかチェック
        if (followRepository.existsByFollowerIdAndFollowingId(user.getId(), targetUserId)) {
            return false; // 既にフォロー済み
        }
        
        Follow follow = new Follow(user, targetUser);
        followRepository.save(follow);
        return true;
    }
    
    /**
     * ユーザーのフォローを解除する
     */
    public boolean unfollowUser(Long targetUserId, UserDetails currentUser) {
        User user = getCurrentUser(currentUser);
        
        if (!followRepository.existsByFollowerIdAndFollowingId(user.getId(), targetUserId)) {
            return false; // フォローしていない
        }
        
        followRepository.deleteByFollowerIdAndFollowingId(user.getId(), targetUserId);
        return true;
    }
    
    /**
     * ユーザーがフォローしている人のリストを取得
     */
    public List<UserDto> getFollowing(Long userId, UserDetails currentUser) {
        User user = getCurrentUser(currentUser);
        
        List<User> followingUsers = followRepository.findFollowingByUserId(userId);
        return followingUsers.stream()
                .map(u -> convertToDto(u, user))
                .collect(Collectors.toList());
    }
    
    /**
     * ユーザーのフォロワーリストを取得
     */
    public List<UserDto> getFollowers(Long userId, UserDetails currentUser) {
        User user = getCurrentUser(currentUser);
        
        List<User> followers = followRepository.findFollowersByUserId(userId);
        return followers.stream()
                .map(u -> convertToDto(u, user))
                .collect(Collectors.toList());
    }
    
    /**
     * ユーザーのフォロー統計を取得
     */
    public UserDto getUserStats(Long userId, UserDetails currentUser) {
        User user = getCurrentUser(currentUser);
        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("ユーザーが見つかりません"));
        
        return convertToDto(targetUser, user);
    }
    
    // プライベートメソッド
    
    private User getCurrentUser(UserDetails currentUser) {
        return userRepository.findByUsername(currentUser.getUsername())
                .orElseThrow(() -> new RuntimeException("ユーザーが見つかりません"));
    }
    
    /**
     * ユーザーの視聴記録を取得（フォロー中のユーザーのみ閲覧可能）
     */
    public Page<ViewingRecordDto> getUserViewingRecords(Long userId, UserDetails currentUser, Pageable pageable) {
        User user = getCurrentUser(currentUser);
        
        // 自分自身の記録は閲覧可能
        if (!user.getId().equals(userId)) {
            // 他のユーザーの記録はフォロー中の場合のみ閲覧可能
            if (!followRepository.existsByFollowerIdAndFollowingId(user.getId(), userId)) {
                throw new RuntimeException("このユーザーの視聴記録を閲覧する権限がありません");
            }
        }
        
        Page<ViewingRecord> viewingRecords = viewingRecordRepository.findByUserIdOrderByViewingDateDesc(userId, pageable);
        
        return viewingRecords.map(this::convertViewingRecordToDto);
    }
    
    /**
     * アクティビティフィードを取得（フォロー中ユーザーの活動）
     */
    public Page<ActivityDto> getActivityFeed(UserDetails currentUser, Pageable pageable) {
        User user = getCurrentUser(currentUser);
        
        // フォロー中のユーザーIDリストを取得
        List<User> followingUsers = followRepository.findFollowingByUserId(user.getId());
        List<Long> followingUserIds = followingUsers.stream()
                .map(User::getId)
                .collect(Collectors.toList());
        
        // 自分も含める
        followingUserIds.add(user.getId());
        
        List<ActivityDto> allActivities = new ArrayList<>();
        
        // 視聴記録からアクティビティを取得
        for (Long userId : followingUserIds) {
            List<ViewingRecord> recentRecords = viewingRecordRepository
                    .findTop20ByUserIdOrderByCreatedAtDesc(userId);
            
            for (ViewingRecord record : recentRecords) {
                ActivityDto activity = new ActivityDto();
                activity.setActivityType("VIEW_MOVIE");
                activity.setUserId(record.getUser().getId());
                activity.setUsername(record.getUser().getUsername());
                activity.setDisplayName(record.getUser().getDisplayName());
                activity.setAvatarUrl(record.getUser().getAvatarUrl());
                activity.setMovieId(record.getTmdbMovieId());
                activity.setMovieTitle(record.getMovieTitle());
                activity.setMoviePoster(record.getMoviePosterPath());
                activity.setRating(record.getRating());
                activity.setReview(record.getReview());
                activity.setCreatedAt(record.getCreatedAt());
                
                // 説明文を生成
                String displayName = record.getUser().getDisplayName() != null 
                    ? record.getUser().getDisplayName() 
                    : record.getUser().getUsername();
                activity.setDescription(String.format("%s が「%s」を視聴しました", 
                    displayName, record.getMovieTitle()));
                
                allActivities.add(activity);
            }
        }
        
        // ウィッシュリストからアクティビティを取得
        for (Long userId : followingUserIds) {
            List<Wishlist> recentWishlists = wishlistRepository
                    .findTop10ByUserIdOrderByCreatedAtDesc(userId);
            
            for (Wishlist wishlist : recentWishlists) {
                ActivityDto activity = new ActivityDto();
                activity.setActivityType("ADD_TO_WISHLIST");
                activity.setUserId(wishlist.getUser().getId());
                activity.setUsername(wishlist.getUser().getUsername());
                activity.setDisplayName(wishlist.getUser().getDisplayName());
                activity.setAvatarUrl(wishlist.getUser().getAvatarUrl());
                activity.setMovieId(wishlist.getTmdbMovieId());
                activity.setMovieTitle(wishlist.getMovieTitle());
                activity.setMoviePoster(wishlist.getMoviePosterPath());
                activity.setCreatedAt(wishlist.getCreatedAt());
                
                // 説明文を生成
                String displayName = wishlist.getUser().getDisplayName() != null 
                    ? wishlist.getUser().getDisplayName() 
                    : wishlist.getUser().getUsername();
                activity.setDescription(String.format("%s が「%s」をウィッシュリストに追加しました", 
                    displayName, wishlist.getMovieTitle()));
                
                allActivities.add(activity);
            }
        }
        
        // 時間順でソート
        allActivities.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));
        
        // ページング処理
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), allActivities.size());
        
        List<ActivityDto> pageContent = start >= allActivities.size() 
            ? new ArrayList<>() 
            : allActivities.subList(start, end);
        
        return new PageImpl<>(pageContent, pageable, allActivities.size());
    }
    
    private UserDto convertToDto(User targetUser, User currentUser) {
        UserDto dto = new UserDto();
        dto.setId(targetUser.getId());
        dto.setUsername(targetUser.getUsername());
        dto.setEmail(targetUser.getEmail());
        dto.setCreatedAt(targetUser.getCreatedAt());
        dto.setDisplayName(targetUser.getDisplayName() != null ? targetUser.getDisplayName() : targetUser.getUsername());
        dto.setBio(targetUser.getBio());
        dto.setAvatarUrl(targetUser.getAvatarUrl());
        
        // フォロー関連の情報を設定
        dto.setFollowerCount(followRepository.countFollowersByUserId(targetUser.getId()));
        dto.setFollowingCount(followRepository.countFollowingByUserId(targetUser.getId()));
        
        if (!currentUser.getId().equals(targetUser.getId())) {
            dto.setIsFollowing(followRepository.existsByFollowerIdAndFollowingId(
                currentUser.getId(), targetUser.getId()));
            dto.setIsFollowedBy(followRepository.existsByFollowerIdAndFollowingId(
                targetUser.getId(), currentUser.getId()));
            dto.setIsMutualFollow(followRepository.isMutualFollow(
                currentUser.getId(), targetUser.getId()));
        } else {
            dto.setIsFollowing(null);
            dto.setIsFollowedBy(null);
            dto.setIsMutualFollow(null);
        }
        
        // 統計情報を設定
        dto.setTotalMovieCount(viewingRecordRepository.countByUserId(targetUser.getId()));
        dto.setAverageRating(viewingRecordRepository.findAverageRatingByUserId(targetUser.getId()));
        
        return dto;
    }
    
    private ViewingRecordDto convertViewingRecordToDto(ViewingRecord viewingRecord) {
        ViewingRecordDto dto = new ViewingRecordDto();
        dto.setId(viewingRecord.getId());
        dto.setTmdbMovieId(viewingRecord.getTmdbMovieId());
        dto.setMovieTitle(viewingRecord.getMovieTitle());
        dto.setMoviePosterPath(viewingRecord.getMoviePosterPath());
        dto.setRating(viewingRecord.getRating());
        dto.setReview(viewingRecord.getReview());
        dto.setViewingDate(viewingRecord.getViewingDate());
        dto.setTheater(viewingRecord.getTheater());
        dto.setScreeningFormat(viewingRecord.getScreeningFormat());
        dto.setCreatedAt(viewingRecord.getCreatedAt());
        dto.setUpdatedAt(viewingRecord.getUpdatedAt());
        return dto;
    }
}