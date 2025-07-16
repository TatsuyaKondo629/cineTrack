package com.cinetrack.dto;

import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

class StatsDtoTest {

    @Test
    void testMonthlyStatsDefaultConstructor() {
        StatsDto.MonthlyStats stats = new StatsDto.MonthlyStats();
        assertNull(stats.getMonth());
        assertEquals(0, stats.getCount());
    }

    @Test
    void testMonthlyStatsParameterizedConstructor() {
        StatsDto.MonthlyStats stats = new StatsDto.MonthlyStats("2024-01", 10);
        assertEquals("2024-01", stats.getMonth());
        assertEquals(10, stats.getCount());
    }

    @Test
    void testMonthlyStatsSetters() {
        StatsDto.MonthlyStats stats = new StatsDto.MonthlyStats();
        stats.setMonth("2024-02");
        stats.setCount(15);
        
        assertEquals("2024-02", stats.getMonth());
        assertEquals(15, stats.getCount());
    }

    @Test
    void testGenreStatsDefaultConstructor() {
        StatsDto.GenreStats stats = new StatsDto.GenreStats();
        assertNull(stats.getGenre());
        assertEquals(0, stats.getCount());
        assertEquals(0.0, stats.getPercentage());
    }

    @Test
    void testGenreStatsParameterizedConstructor() {
        StatsDto.GenreStats stats = new StatsDto.GenreStats("Action", 25, 50.0);
        assertEquals("Action", stats.getGenre());
        assertEquals(25, stats.getCount());
        assertEquals(50.0, stats.getPercentage());
    }

    @Test
    void testGenreStatsSetters() {
        StatsDto.GenreStats stats = new StatsDto.GenreStats();
        stats.setGenre("Drama");
        stats.setCount(30);
        stats.setPercentage(60.0);
        
        assertEquals("Drama", stats.getGenre());
        assertEquals(30, stats.getCount());
        assertEquals(60.0, stats.getPercentage());
    }

    @Test
    void testRatingDistributionDefaultConstructor() {
        StatsDto.RatingDistribution stats = new StatsDto.RatingDistribution();
        assertEquals(0.0, stats.getRating());
        assertEquals(0, stats.getCount());
    }

    @Test
    void testRatingDistributionParameterizedConstructor() {
        StatsDto.RatingDistribution stats = new StatsDto.RatingDistribution(4.5, 20);
        assertEquals(4.5, stats.getRating());
        assertEquals(20, stats.getCount());
    }

    @Test
    void testRatingDistributionSetters() {
        StatsDto.RatingDistribution stats = new StatsDto.RatingDistribution();
        stats.setRating(3.8);
        stats.setCount(12);
        
        assertEquals(3.8, stats.getRating());
        assertEquals(12, stats.getCount());
    }

    @Test
    void testOverallStatsDefaultConstructor() {
        StatsDto.OverallStats stats = new StatsDto.OverallStats();
        assertEquals(0, stats.getTotalMovies());
        assertEquals(0.0, stats.getAverageRating());
        assertNull(stats.getFirstViewingDate());
        assertNull(stats.getLastViewingDate());
        assertEquals(0, stats.getViewingDays());
        assertNull(stats.getFavoriteGenre());
        assertEquals(0.0, stats.getMoviesPerMonth());
    }

    @Test
    void testOverallStatsSetters() {
        StatsDto.OverallStats stats = new StatsDto.OverallStats();
        LocalDate firstDate = LocalDate.of(2024, 1, 1);
        LocalDate lastDate = LocalDate.of(2024, 12, 31);
        
        stats.setTotalMovies(100);
        stats.setAverageRating(4.2);
        stats.setFirstViewingDate(firstDate);
        stats.setLastViewingDate(lastDate);
        stats.setViewingDays(365);
        stats.setFavoriteGenre("Sci-Fi");
        stats.setMoviesPerMonth(8.3);
        
        assertEquals(100, stats.getTotalMovies());
        assertEquals(4.2, stats.getAverageRating());
        assertEquals(firstDate, stats.getFirstViewingDate());
        assertEquals(lastDate, stats.getLastViewingDate());
        assertEquals(365, stats.getViewingDays());
        assertEquals("Sci-Fi", stats.getFavoriteGenre());
        assertEquals(8.3, stats.getMoviesPerMonth());
    }
}