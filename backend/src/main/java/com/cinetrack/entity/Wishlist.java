package com.cinetrack.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import com.fasterxml.jackson.annotation.JsonBackReference;

import java.time.LocalDateTime;

@Entity
@Table(name = "wishlist", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "tmdb_movie_id"})
})
public class Wishlist {
    
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
    
    @Column(name = "movie_overview", columnDefinition = "TEXT")
    private String movieOverview;
    
    @Column(name = "movie_release_date")
    private String movieReleaseDate;
    
    @Column(name = "movie_vote_average")
    private Double movieVoteAverage;
    
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
    
    public Wishlist() {}
    
    public Wishlist(User user, Long tmdbMovieId, String movieTitle, String moviePosterPath, 
                   String movieOverview, String movieReleaseDate, Double movieVoteAverage) {
        this.user = user;
        this.tmdbMovieId = tmdbMovieId;
        this.movieTitle = movieTitle;
        this.moviePosterPath = moviePosterPath;
        this.movieOverview = movieOverview;
        this.movieReleaseDate = movieReleaseDate;
        this.movieVoteAverage = movieVoteAverage;
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
    
    public String getMovieOverview() {
        return movieOverview;
    }
    
    public void setMovieOverview(String movieOverview) {
        this.movieOverview = movieOverview;
    }
    
    public String getMovieReleaseDate() {
        return movieReleaseDate;
    }
    
    public void setMovieReleaseDate(String movieReleaseDate) {
        this.movieReleaseDate = movieReleaseDate;
    }
    
    public Double getMovieVoteAverage() {
        return movieVoteAverage;
    }
    
    public void setMovieVoteAverage(Double movieVoteAverage) {
        this.movieVoteAverage = movieVoteAverage;
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