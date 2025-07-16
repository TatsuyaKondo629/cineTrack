package com.cinetrack.entity;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class ViewingRecordTest {

    @Test
    void testDefaultConstructor() {
        ViewingRecord record = new ViewingRecord();
        
        assertNull(record.getId());
        assertNull(record.getUser());
        assertNull(record.getTmdbMovieId());
        assertNull(record.getMovieTitle());
        assertNull(record.getMoviePosterPath());
        assertNull(record.getViewingDate());
        assertNull(record.getRating());
        assertNull(record.getTheater());
        assertNull(record.getTheaterEntity());
        assertNull(record.getScreeningFormat());
        assertNull(record.getReview());
        assertNull(record.getCreatedAt());
        assertNull(record.getUpdatedAt());
    }
    
    @Test
    void testParameterizedConstructor() {
        User user = new User();
        user.setId(1L);
        user.setUsername("testuser");
        
        Long tmdbMovieId = 12345L;
        String movieTitle = "Test Movie";
        LocalDateTime viewingDate = LocalDateTime.now();
        Double rating = 4.5;
        
        ViewingRecord record = new ViewingRecord(user, tmdbMovieId, movieTitle, viewingDate, rating);
        
        assertEquals(user, record.getUser());
        assertEquals(tmdbMovieId, record.getTmdbMovieId());
        assertEquals(movieTitle, record.getMovieTitle());
        assertEquals(viewingDate, record.getViewingDate());
        assertEquals(rating, record.getRating());
    }
    
    @Test
    void testGettersAndSetters() {
        ViewingRecord record = new ViewingRecord();
        User user = new User();
        Theater theater = new Theater();
        LocalDateTime now = LocalDateTime.now();
        
        record.setId(1L);
        record.setUser(user);
        record.setTmdbMovieId(12345L);
        record.setMovieTitle("Test Movie");
        record.setMoviePosterPath("/path/to/poster.jpg");
        record.setViewingDate(now);
        record.setRating(4.5);
        record.setTheater("Test Theater");
        record.setTheaterEntity(theater);
        record.setScreeningFormat("IMAX");
        record.setReview("Great movie!");
        record.setCreatedAt(now);
        record.setUpdatedAt(now);
        
        assertEquals(1L, record.getId());
        assertEquals(user, record.getUser());
        assertEquals(12345L, record.getTmdbMovieId());
        assertEquals("Test Movie", record.getMovieTitle());
        assertEquals("/path/to/poster.jpg", record.getMoviePosterPath());
        assertEquals(now, record.getViewingDate());
        assertEquals(4.5, record.getRating());
        assertEquals("Test Theater", record.getTheater());
        assertEquals(theater, record.getTheaterEntity());
        assertEquals("IMAX", record.getScreeningFormat());
        assertEquals("Great movie!", record.getReview());
        assertEquals(now, record.getCreatedAt());
        assertEquals(now, record.getUpdatedAt());
    }
    
    @Test
    void testOnCreateCallback() {
        ViewingRecord record = new ViewingRecord();
        record.onCreate();
        
        assertNotNull(record.getCreatedAt());
        assertNotNull(record.getUpdatedAt());
        // Check that both timestamps are very close (within 1 second)
        assertTrue(Math.abs(record.getCreatedAt().getNano() - record.getUpdatedAt().getNano()) < 1000000);
    }
    
    @Test
    void testOnUpdateCallback() {
        ViewingRecord record = new ViewingRecord();
        LocalDateTime originalTime = LocalDateTime.now().minusDays(1);
        record.setCreatedAt(originalTime);
        record.setUpdatedAt(originalTime);
        
        record.onUpdate();
        
        assertEquals(originalTime, record.getCreatedAt());
        assertTrue(record.getUpdatedAt().isAfter(originalTime));
    }
}