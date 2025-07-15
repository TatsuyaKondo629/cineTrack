package com.cinetrack.dto;

import java.time.LocalDateTime;

public class TheaterDto {
    private Long id;
    private String name;
    private String chain;
    private String location;
    private String address;
    private String phone;
    private String website;
    private String prefecture;
    private String city;
    private Double latitude;
    private Double longitude;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // デフォルトコンストラクタ
    public TheaterDto() {}
    
    // 全フィールドコンストラクタ
    public TheaterDto(Long id, String name, String chain, String location, String address, 
                     String phone, String website, String prefecture, String city, 
                     Double latitude, Double longitude, Boolean isActive, 
                     LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.chain = chain;
        this.location = location;
        this.address = address;
        this.phone = phone;
        this.website = website;
        this.prefecture = prefecture;
        this.city = city;
        this.latitude = latitude;
        this.longitude = longitude;
        this.isActive = isActive;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    
    // ゲッターとセッター
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getChain() {
        return chain;
    }
    
    public void setChain(String chain) {
        this.chain = chain;
    }
    
    public String getLocation() {
        return location;
    }
    
    public void setLocation(String location) {
        this.location = location;
    }
    
    public String getAddress() {
        return address;
    }
    
    public void setAddress(String address) {
        this.address = address;
    }
    
    public String getPhone() {
        return phone;
    }
    
    public void setPhone(String phone) {
        this.phone = phone;
    }
    
    public String getWebsite() {
        return website;
    }
    
    public void setWebsite(String website) {
        this.website = website;
    }
    
    public String getPrefecture() {
        return prefecture;
    }
    
    public void setPrefecture(String prefecture) {
        this.prefecture = prefecture;
    }
    
    public String getCity() {
        return city;
    }
    
    public void setCity(String city) {
        this.city = city;
    }
    
    public Double getLatitude() {
        return latitude;
    }
    
    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }
    
    public Double getLongitude() {
        return longitude;
    }
    
    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }
    
    public Boolean getIsActive() {
        return isActive;
    }
    
    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    // 表示用の完全な名前を生成（チェーン名 + 場所）
    public String getDisplayName() {
        if (chain != null && location != null) {
            return chain + " " + location;
        } else if (name != null) {
            return name;
        }
        return "未知の映画館";
    }
    
    // 簡単な住所表示（都道府県 + 市区町村）
    public String getShortAddress() {
        if (prefecture != null && city != null) {
            return prefecture + " " + city;
        } else if (prefecture != null) {
            return prefecture;
        } else if (city != null) {
            return city;
        }
        return null;
    }
}