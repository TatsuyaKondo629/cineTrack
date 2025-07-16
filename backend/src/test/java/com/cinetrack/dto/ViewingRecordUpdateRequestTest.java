package com.cinetrack.dto;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class ViewingRecordUpdateRequestTest {

    @Test
    void testDefaultConstructor() {
        ViewingRecordUpdateRequest request = new ViewingRecordUpdateRequest();
        
        assertNull(request.getViewingDate());
        assertNull(request.getRating());
        assertNull(request.getTheater());
        assertNull(request.getTheaterId());
        assertNull(request.getScreeningFormat());
        assertNull(request.getReview());
    }

    @Test
    void testGettersAndSetters() {
        ViewingRecordUpdateRequest request = new ViewingRecordUpdateRequest();
        LocalDateTime now = LocalDateTime.now();
        
        request.setViewingDate(now);
        request.setRating(4.2);
        request.setTheater("Updated Theater");
        request.setTheaterId(3L);
        request.setScreeningFormat("Dolby Atmos");
        request.setReview("Updated review");
        
        assertEquals(now, request.getViewingDate());
        assertEquals(4.2, request.getRating());
        assertEquals("Updated Theater", request.getTheater());
        assertEquals(3L, request.getTheaterId());
        assertEquals("Dolby Atmos", request.getScreeningFormat());
        assertEquals("Updated review", request.getReview());
    }
}