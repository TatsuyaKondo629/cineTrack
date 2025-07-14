package com.cinetrack.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public class StatsDto {
    
    public static class MonthlyStats {
        private String month;
        private long count;
        
        public MonthlyStats() {}
        
        public MonthlyStats(String month, long count) {
            this.month = month;
            this.count = count;
        }
        
        public String getMonth() { return month; }
        public void setMonth(String month) { this.month = month; }
        public long getCount() { return count; }
        public void setCount(long count) { this.count = count; }
    }
    
    public static class GenreStats {
        private String genre;
        private long count;
        private double percentage;
        
        public GenreStats() {}
        
        public GenreStats(String genre, long count, double percentage) {
            this.genre = genre;
            this.count = count;
            this.percentage = percentage;
        }
        
        public String getGenre() { return genre; }
        public void setGenre(String genre) { this.genre = genre; }
        public long getCount() { return count; }
        public void setCount(long count) { this.count = count; }
        public double getPercentage() { return percentage; }
        public void setPercentage(double percentage) { this.percentage = percentage; }
    }
    
    public static class RatingDistribution {
        private double rating;
        private long count;
        
        public RatingDistribution() {}
        
        public RatingDistribution(double rating, long count) {
            this.rating = rating;
            this.count = count;
        }
        
        public double getRating() { return rating; }
        public void setRating(double rating) { this.rating = rating; }
        public long getCount() { return count; }
        public void setCount(long count) { this.count = count; }
    }
    
    public static class OverallStats {
        private long totalMovies;
        private double averageRating;
        private LocalDate firstViewingDate;
        private LocalDate lastViewingDate;
        private int viewingDays;
        private String favoriteGenre;
        private double moviesPerMonth;
        
        public OverallStats() {}
        
        public long getTotalMovies() { return totalMovies; }
        public void setTotalMovies(long totalMovies) { this.totalMovies = totalMovies; }
        public double getAverageRating() { return averageRating; }
        public void setAverageRating(double averageRating) { this.averageRating = averageRating; }
        public LocalDate getFirstViewingDate() { return firstViewingDate; }
        public void setFirstViewingDate(LocalDate firstViewingDate) { this.firstViewingDate = firstViewingDate; }
        public LocalDate getLastViewingDate() { return lastViewingDate; }
        public void setLastViewingDate(LocalDate lastViewingDate) { this.lastViewingDate = lastViewingDate; }
        public int getViewingDays() { return viewingDays; }
        public void setViewingDays(int viewingDays) { this.viewingDays = viewingDays; }
        public String getFavoriteGenre() { return favoriteGenre; }
        public void setFavoriteGenre(String favoriteGenre) { this.favoriteGenre = favoriteGenre; }
        public double getMoviesPerMonth() { return moviesPerMonth; }
        public void setMoviesPerMonth(double moviesPerMonth) { this.moviesPerMonth = moviesPerMonth; }
    }
}