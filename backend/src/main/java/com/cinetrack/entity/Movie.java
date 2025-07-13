package com.cinetrack.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "movies")
public class Movie {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "tmdb_id", unique = true)
    private Long tmdbId;
    
    @Column(nullable = false)
    private String title;
    
    @Column(name = "original_title")
    private String originalTitle;
    
    @Column(columnDefinition = "TEXT")
    private String overview;
    
    @Column(name = "release_date")
    private LocalDate releaseDate;
    
    @Column(name = "poster_path")
    private String posterPath;
    
    @Column(name = "backdrop_path")
    private String backdropPath;
    
    @Column(name = "vote_average")
    private Double voteAverage;
    
    @Column(name = "vote_count")
    private Integer voteCount;
    
    private String genre;
    
    private Integer runtime;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "movie", cascade = CascadeType.ALL)
    private List<ViewingRecord> viewingRecords;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getTmdbId() {
        return tmdbId;
    }
    
    public void setTmdbId(Long tmdbId) {
        this.tmdbId = tmdbId;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getOriginalTitle() {
        return originalTitle;
    }
    
    public void setOriginalTitle(String originalTitle) {
        this.originalTitle = originalTitle;
    }
    
    public String getOverview() {
        return overview;
    }
    
    public void setOverview(String overview) {
        this.overview = overview;
    }
    
    public LocalDate getReleaseDate() {
        return releaseDate;
    }
    
    public void setReleaseDate(LocalDate releaseDate) {
        this.releaseDate = releaseDate;
    }
    
    public String getPosterPath() {
        return posterPath;
    }
    
    public void setPosterPath(String posterPath) {
        this.posterPath = posterPath;
    }
    
    public String getBackdropPath() {
        return backdropPath;
    }
    
    public void setBackdropPath(String backdropPath) {
        this.backdropPath = backdropPath;
    }
    
    public Double getVoteAverage() {
        return voteAverage;
    }
    
    public void setVoteAverage(Double voteAverage) {
        this.voteAverage = voteAverage;
    }
    
    public Integer getVoteCount() {
        return voteCount;
    }
    
    public void setVoteCount(Integer voteCount) {
        this.voteCount = voteCount;
    }
    
    public String getGenre() {
        return genre;
    }
    
    public void setGenre(String genre) {
        this.genre = genre;
    }
    
    public Integer getRuntime() {
        return runtime;
    }
    
    public void setRuntime(Integer runtime) {
        this.runtime = runtime;
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
    
    public List<ViewingRecord> getViewingRecords() {
        return viewingRecords;
    }
    
    public void setViewingRecords(List<ViewingRecord> viewingRecords) {
        this.viewingRecords = viewingRecords;
    }
}