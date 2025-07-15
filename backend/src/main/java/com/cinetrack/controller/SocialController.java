package com.cinetrack.controller;

import com.cinetrack.dto.ApiResponse;
import com.cinetrack.dto.UserDto;
import com.cinetrack.dto.ViewingRecordDto;
import com.cinetrack.dto.ActivityDto;
import com.cinetrack.service.SocialService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/social")
@CrossOrigin(origins = "*")
public class SocialController {
    
    @Autowired
    private SocialService socialService;
    
    /**
     * ユーザー検索
     */
    @GetMapping("/users/search")
    public ResponseEntity<ApiResponse<Page<UserDto>>> searchUsers(
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal UserDetails currentUser) {
        
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<UserDto> users = socialService.searchUsers(query, currentUser, pageable);
            return ResponseEntity.ok(ApiResponse.success("ユーザー検索が完了しました", users));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * ユーザー詳細取得
     */
    @GetMapping("/users/{userId}")
    public ResponseEntity<ApiResponse<UserDto>> getUserById(
            @PathVariable Long userId,
            @AuthenticationPrincipal UserDetails currentUser) {
        
        try {
            Optional<UserDto> user = socialService.getUserById(userId, currentUser);
            if (user.isPresent()) {
                return ResponseEntity.ok(ApiResponse.success("ユーザー詳細を取得しました", user.get()));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * ユーザーをフォローする
     */
    @PostMapping("/users/{userId}/follow")
    public ResponseEntity<ApiResponse<String>> followUser(
            @PathVariable Long userId,
            @AuthenticationPrincipal UserDetails currentUser) {
        
        try {
            boolean success = socialService.followUser(userId, currentUser);
            if (success) {
                return ResponseEntity.ok(ApiResponse.success("フォローしました", null));
            } else {
                return ResponseEntity.badRequest().body(ApiResponse.error("既にフォローしています"));
            }
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * ユーザーのフォローを解除する
     */
    @DeleteMapping("/users/{userId}/follow")
    public ResponseEntity<ApiResponse<String>> unfollowUser(
            @PathVariable Long userId,
            @AuthenticationPrincipal UserDetails currentUser) {
        
        try {
            boolean success = socialService.unfollowUser(userId, currentUser);
            if (success) {
                return ResponseEntity.ok(ApiResponse.success("フォローを解除しました", null));
            } else {
                return ResponseEntity.badRequest().body(ApiResponse.error("フォローしていません"));
            }
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * ユーザーがフォローしている人のリスト
     */
    @GetMapping("/users/{userId}/following")
    public ResponseEntity<ApiResponse<List<UserDto>>> getFollowing(
            @PathVariable Long userId,
            @AuthenticationPrincipal UserDetails currentUser) {
        
        try {
            List<UserDto> following = socialService.getFollowing(userId, currentUser);
            return ResponseEntity.ok(ApiResponse.success("フォロー中のユーザーを取得しました", following));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * ユーザーのフォロワーリスト
     */
    @GetMapping("/users/{userId}/followers")
    public ResponseEntity<ApiResponse<List<UserDto>>> getFollowers(
            @PathVariable Long userId,
            @AuthenticationPrincipal UserDetails currentUser) {
        
        try {
            List<UserDto> followers = socialService.getFollowers(userId, currentUser);
            return ResponseEntity.ok(ApiResponse.success("フォロワーを取得しました", followers));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * ユーザーの統計情報
     */
    @GetMapping("/users/{userId}/stats")
    public ResponseEntity<ApiResponse<UserDto>> getUserStats(
            @PathVariable Long userId,
            @AuthenticationPrincipal UserDetails currentUser) {
        
        try {
            UserDto userStats = socialService.getUserStats(userId, currentUser);
            return ResponseEntity.ok(ApiResponse.success("ユーザー統計を取得しました", userStats));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * ユーザーの視聴記録を取得（フォロー中のユーザーのみ閲覧可能）
     */
    @GetMapping("/users/{userId}/viewing-records")
    public ResponseEntity<ApiResponse<Page<ViewingRecordDto>>> getUserViewingRecords(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal UserDetails currentUser) {
        
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<ViewingRecordDto> viewingRecords = socialService.getUserViewingRecords(userId, currentUser, pageable);
            return ResponseEntity.ok(ApiResponse.success("視聴記録を取得しました", viewingRecords));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * アクティビティフィードを取得（フォロー中ユーザーの活動）
     */
    @GetMapping("/activities")
    public ResponseEntity<ApiResponse<Page<ActivityDto>>> getActivityFeed(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal UserDetails currentUser) {
        
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<ActivityDto> activities = socialService.getActivityFeed(currentUser, pageable);
            return ResponseEntity.ok(ApiResponse.success("アクティビティフィードを取得しました", activities));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}