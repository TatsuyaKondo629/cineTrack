package com.cinetrack.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "theaters")
public class Theater {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "name", nullable = false)
    @NotBlank(message = "Theater name is required")
    private String name;
    
    @Column(name = "chain")
    private String chain; // TOHOシネマズ、イオンシネマ、109シネマズなど
    
    @Column(name = "location")
    private String location; // 新宿、渋谷、池袋など
    
    @Column(name = "address")
    private String address; // 詳細住所
    
    @Column(name = "phone")
    private String phone;
    
    @Column(name = "website")
    private String website;
    
    @Column(name = "prefecture")
    private String prefecture; // 都道府県
    
    @Column(name = "city")
    private String city; // 市区町村
    
    @Column(name = "latitude")
    private Double latitude; // 緯度
    
    @Column(name = "longitude")
    private Double longitude; // 経度
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // デフォルトコンストラクタ
    public Theater() {}
    
    // 作成日時と更新日時を自動設定
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
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
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Theater)) return false;
        Theater theater = (Theater) o;
        return Objects.equals(id, theater.id);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
    
    @Override
    public String toString() {
        return "Theater{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", chain='" + chain + '\'' +
                ", location='" + location + '\'' +
                ", prefecture='" + prefecture + '\'' +
                ", city='" + city + '\'' +
                '}';
    }
}