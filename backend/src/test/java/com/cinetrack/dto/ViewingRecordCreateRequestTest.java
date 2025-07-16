package com.cinetrack.dto;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class ViewingRecordCreateRequestTest {

    @Test
    void testDefaultConstructor() {
        ViewingRecordCreateRequest request = new ViewingRecordCreateRequest();
        
        assertNull(request.getTmdbMovieId());
        assertNull(request.getMovieTitle());
        assertNull(request.getMoviePosterPath());
        assertNull(request.getViewingDate());
        assertNull(request.getRating());
        assertNull(request.getTheater());
        assertNull(request.getTheaterId());
        assertNull(request.getScreeningFormat());
        assertNull(request.getReview());
    }

    @Test
    void testGettersAndSetters() {
        ViewingRecordCreateRequest request = new ViewingRecordCreateRequest();
        LocalDateTime now = LocalDateTime.now();
        
        request.setTmdbMovieId(123L);
        request.setMovieTitle("Test Movie");
        request.setMoviePosterPath("/poster.jpg");
        request.setViewingDate(now);
        request.setRating(4.5);
        request.setTheater("Test Theater");
        request.setTheaterId(1L);
        request.setScreeningFormat("IMAX");
        request.setReview("Great movie!");
        
        assertEquals(123L, request.getTmdbMovieId());
        assertEquals("Test Movie", request.getMovieTitle());
        assertEquals("/poster.jpg", request.getMoviePosterPath());
        assertEquals(now, request.getViewingDate());
        assertEquals(4.5, request.getRating());
        assertEquals("Test Theater", request.getTheater());
        assertEquals(1L, request.getTheaterId());
        assertEquals("IMAX", request.getScreeningFormat());
        assertEquals("Great movie!", request.getReview());
    }
}