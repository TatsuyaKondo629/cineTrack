package com.cinetrack.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

public class ViewingRecordCreateRequest {
    
    @NotNull(message = "TMDb movie ID is required")
    private Long tmdbMovieId;
    
    @NotBlank(message = "Movie title is required")
    @Size(max = 255, message = "Movie title must be less than 255 characters")
    private String movieTitle;
    
    private String moviePosterPath;
    
    @NotNull(message = "Viewing date is required")
    private LocalDateTime viewingDate;
    
    @NotNull(message = "Rating is required")
    @DecimalMin(value = "0.5", message = "Rating must be at least 0.5")
    @DecimalMax(value = "5.0", message = "Rating must be at most 5.0")
    private Double rating;
    
    @Size(max = 255, message = "Theater name must be less than 255 characters")
    private String theater;
    
    private Long theaterId;
    
    @Size(max = 50, message = "Screening format must be less than 50 characters")
    private String screeningFormat;
    
    @Size(max = 2000, message = "Review must be less than 2000 characters")
    private String review;

    // Constructors
    public ViewingRecordCreateRequest() {}

    // Getters and Setters
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

    public Long getTheaterId() {
        return theaterId;
    }

    public void setTheaterId(Long theaterId) {
        this.theaterId = theaterId;
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
}