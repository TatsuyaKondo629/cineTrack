package com.cinetrack.dto;

import java.time.LocalDateTime;

public class WishlistDto {
    private Long id;
    private Long tmdbMovieId;
    private String movieTitle;
    private String moviePosterPath;
    private String movieOverview;
    private String movieReleaseDate;
    private Double movieVoteAverage;
    private LocalDateTime createdAt;
    
    public WishlistDto() {}
    
    public WishlistDto(Long id, Long tmdbMovieId, String movieTitle, String moviePosterPath, 
                      String movieOverview, String movieReleaseDate, Double movieVoteAverage, 
                      LocalDateTime createdAt) {
        this.id = id;
        this.tmdbMovieId = tmdbMovieId;
        this.movieTitle = movieTitle;
        this.moviePosterPath = moviePosterPath;
        this.movieOverview = movieOverview;
        this.movieReleaseDate = movieReleaseDate;
        this.movieVoteAverage = movieVoteAverage;
        this.createdAt = createdAt;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
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
}