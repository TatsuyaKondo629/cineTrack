package com.cinetrack.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public class UserUpdateRequest {
    
    @Size(min = 3, max = 20, message = "ユーザー名は3文字以上20文字以下で入力してください")
    private String username;
    
    @Email(message = "有効なメールアドレスを入力してください")
    private String email;
    
    @Size(max = 50, message = "表示名は50文字以下で入力してください")
    private String displayName;
    
    @Size(max = 500, message = "プロフィールは500文字以下で入力してください")
    private String bio;
    
    private String avatarUrl;
    
    @Size(min = 6, message = "パスワードは6文字以上で入力してください")
    private String newPassword;
    
    private String currentPassword;
    
    // Constructors
    public UserUpdateRequest() {}
    
    // Getters and Setters
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
    
    public String getNewPassword() {
        return newPassword;
    }
    
    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
    
    public String getCurrentPassword() {
        return currentPassword;
    }
    
    public void setCurrentPassword(String currentPassword) {
        this.currentPassword = currentPassword;
    }
}