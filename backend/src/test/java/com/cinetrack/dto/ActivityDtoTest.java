package com.cinetrack.dto;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class ActivityDtoTest {

    @Test
    void testDefaultConstructor() {
        ActivityDto dto = new ActivityDto();
        
        assertNull(dto.getId());
        assertNull(dto.getActivityType());
        assertNull(dto.getUserId());
        assertNull(dto.getUsername());
        assertNull(dto.getDisplayName());
        assertNull(dto.getAvatarUrl());
        assertNull(dto.getMovieId());
        assertNull(dto.getMovieTitle());
        assertNull(dto.getMoviePoster());
        assertNull(dto.getRating());
        assertNull(dto.getReview());
        assertNull(dto.getDescription());
        assertNull(dto.getCreatedAt());
    }

    @Test
    void testParameterizedConstructor() {
        LocalDateTime now = LocalDateTime.now();
        ActivityDto dto = new ActivityDto("VIEW_MOVIE", 1L, "testuser", "Test User", 
                                        123L, "Test Movie", now);
        
        assertEquals("VIEW_MOVIE", dto.getActivityType());
        assertEquals(1L, dto.getUserId());
        assertEquals("testuser", dto.getUsername());
        assertEquals("Test User", dto.getDisplayName());
        assertEquals(123L, dto.getMovieId());
        assertEquals("Test Movie", dto.getMovieTitle());
        assertEquals(now, dto.getCreatedAt());
    }

    @Test
    void testGettersAndSetters() {
        ActivityDto dto = new ActivityDto();
        LocalDateTime now = LocalDateTime.now();
        
        dto.setId(1L);
        dto.setActivityType("ADD_TO_WISHLIST");
        dto.setUserId(2L);
        dto.setUsername("user123");
        dto.setDisplayName("User 123");
        dto.setAvatarUrl("http://example.com/avatar.jpg");
        dto.setMovieId(456L);
        dto.setMovieTitle("Another Movie");
        dto.setMoviePoster("http://example.com/poster.jpg");
        dto.setRating(4.5);
        dto.setReview("Great movie!");
        dto.setDescription("User added movie to wishlist");
        dto.setCreatedAt(now);
        
        assertEquals(1L, dto.getId());
        assertEquals("ADD_TO_WISHLIST", dto.getActivityType());
        assertEquals(2L, dto.getUserId());
        assertEquals("user123", dto.getUsername());
        assertEquals("User 123", dto.getDisplayName());
        assertEquals("http://example.com/avatar.jpg", dto.getAvatarUrl());
        assertEquals(456L, dto.getMovieId());
        assertEquals("Another Movie", dto.getMovieTitle());
        assertEquals("http://example.com/poster.jpg", dto.getMoviePoster());
        assertEquals(4.5, dto.getRating());
        assertEquals("Great movie!", dto.getReview());
        assertEquals("User added movie to wishlist", dto.getDescription());
        assertEquals(now, dto.getCreatedAt());
    }
}