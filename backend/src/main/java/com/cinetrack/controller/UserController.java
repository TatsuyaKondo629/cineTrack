package com.cinetrack.controller;

import com.cinetrack.dto.ApiResponse;
import com.cinetrack.dto.UserDto;
import com.cinetrack.dto.UserUpdateRequest;
import com.cinetrack.entity.User;
import com.cinetrack.service.UserService;
import com.cinetrack.service.SocialService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "*")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private SocialService socialService;
    
    /**
     * 現在のユーザープロフィールを取得
     */
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserDto>> getCurrentUserProfile(
            @AuthenticationPrincipal UserDetails currentUser) {
        
        try {
            User user = userService.findByUsername(currentUser.getUsername())
                    .orElseThrow(() -> new RuntimeException("ユーザーが見つかりません"));
            
            UserDto userProfile = socialService.getUserById(user.getId(), currentUser)
                    .orElseThrow(() -> new RuntimeException("プロフィール情報の取得に失敗しました"));
            
            return ResponseEntity.ok(ApiResponse.success("プロフィールを取得しました", userProfile));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * ユーザープロフィールを更新
     */
    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserDto>> updateUserProfile(
            @Valid @RequestBody UserUpdateRequest updateRequest,
            @AuthenticationPrincipal UserDetails currentUser) {
        
        try {
            User updatedUser = userService.updateUserProfile(currentUser.getUsername(), updateRequest);
            
            UserDto userProfile = socialService.getUserById(updatedUser.getId(), currentUser)
                    .orElseThrow(() -> new RuntimeException("更新後のプロフィール情報の取得に失敗しました"));
            
            return ResponseEntity.ok(ApiResponse.success("プロフィールを更新しました", userProfile));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}