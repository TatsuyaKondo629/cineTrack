package com.cinetrack.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import com.fasterxml.jackson.annotation.JsonBackReference;

import java.time.LocalDateTime;

@Entity
@Table(name = "viewing_records")
public class ViewingRecord {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonBackReference
    private User user;
    
    @Column(name = "tmdb_movie_id", nullable = false)
    @NotNull(message = "Movie ID is required")
    private Long tmdbMovieId;
    
    @Column(name = "movie_title", nullable = false)
    @NotBlank(message = "Movie title is required")
    @Size(max = 255, message = "Movie title must be less than 255 characters")
    private String movieTitle;
    
    @Column(name = "movie_poster_path")
    private String moviePosterPath;
    
    @Column(name = "viewing_date", nullable = false)
    @NotNull(message = "Viewing date is required")
    private LocalDateTime viewingDate;
    
    @Column(name = "rating", nullable = false)
    @NotNull(message = "Rating is required")
    @DecimalMin(value = "0.5", message = "Rating must be at least 0.5")
    @DecimalMax(value = "5.0", message = "Rating must be at most 5.0")
    private Double rating;
    
    @Column(name = "theater")
    @Size(max = 255, message = "Theater name must be less than 255 characters")
    private String theater;
    
    @Column(name = "screening_format")
    @Size(max = 50, message = "Screening format must be less than 50 characters")
    private String screeningFormat;
    
    @Column(name = "review", columnDefinition = "TEXT")
    @Size(max = 2000, message = "Review must be less than 2000 characters")
    private String review;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public ViewingRecord() {}
    
    public ViewingRecord(User user, Long tmdbMovieId, String movieTitle, LocalDateTime viewingDate, Double rating) {
        this.user = user;
        this.tmdbMovieId = tmdbMovieId;
        this.movieTitle = movieTitle;
        this.viewingDate = viewingDate;
        this.rating = rating;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
    
    public Long getTmdbMovieId() {
        return tmdbMovieId;
    }
    
    public void setTmdbMovieId(Long tmdbMovieId) {
        this.tmdbMovieId = tmdbMovieId;
    }
    
    public String getMovieTitle() {
        return movieTitle;
    }
    
    public void setMovieTitle(String movieTitle) {
        this.movieTitle = movieTitle;
    }
    
    public String getMoviePosterPath() {
        return moviePosterPath;
    }
    
    public void setMoviePosterPath(String moviePosterPath) {
        this.moviePosterPath = moviePosterPath;
    }
    
    public LocalDateTime getViewingDate() {
        return viewingDate;
    }
    
    public void setViewingDate(LocalDateTime viewingDate) {
        this.viewingDate = viewingDate;
    }
    
    public Double getRating() {
        return rating;
    }
    
    public void setRating(Double rating) {
        this.rating = rating;
    }
    
    public String getTheater() {
        return theater;
    }
    
    public void setTheater(String theater) {
        this.theater = theater;
    }
    
    public String getScreeningFormat() {
        return screeningFormat;
    }
    
    public void setScreeningFormat(String screeningFormat) {
        this.screeningFormat = screeningFormat;
    }
    
    public String getReview() {
        return review;
    }
    
    public void setReview(String review) {
        this.review = review;
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
}