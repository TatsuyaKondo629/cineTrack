package com.cinetrack.dto;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class ViewingRecordDtoTest {

    @Test
    void testDefaultConstructor() {
        ViewingRecordDto dto = new ViewingRecordDto();
        
        assertNull(dto.getId());
        assertNull(dto.getTmdbMovieId());
        assertNull(dto.getMovieTitle());
        assertNull(dto.getMoviePosterPath());
        assertNull(dto.getViewingDate());
        assertNull(dto.getRating());
        assertNull(dto.getTheater());
        assertNull(dto.getTheaterId());
        assertNull(dto.getTheaterInfo());
        assertNull(dto.getScreeningFormat());
        assertNull(dto.getReview());
        assertNull(dto.getCreatedAt());
        assertNull(dto.getUpdatedAt());
    }

    @Test
    void testParameterizedConstructor() {
        LocalDateTime now = LocalDateTime.now();
        ViewingRecordDto dto = new ViewingRecordDto(
                1L, 123L, "Test Movie", "/poster.jpg", now, 4.5, "Test Theater", 
                1L, "IMAX", "Great movie!", now, now
        );
        
        assertEquals(1L, dto.getId());
        assertEquals(123L, dto.getTmdbMovieId());
        assertEquals("Test Movie", dto.getMovieTitle());
        assertEquals("/poster.jpg", dto.getMoviePosterPath());
        assertEquals(now, dto.getViewingDate());
        assertEquals(4.5, dto.getRating());
        assertEquals("Test Theater", dto.getTheater());
        assertEquals(1L, dto.getTheaterId());
        assertEquals("IMAX", dto.getScreeningFormat());
        assertEquals("Great movie!", dto.getReview());
        assertEquals(now, dto.getCreatedAt());
        assertEquals(now, dto.getUpdatedAt());
    }

    @Test
    void testGettersAndSetters() {
        ViewingRecordDto dto = new ViewingRecordDto();
        LocalDateTime now = LocalDateTime.now();
        TheaterDto theaterInfo = new TheaterDto();
        
        dto.setId(2L);
        dto.setTmdbMovieId(456L);
        dto.setMovieTitle("Another Movie");
        dto.setMoviePosterPath("/another-poster.jpg");
        dto.setViewingDate(now);
        dto.setRating(3.8);
        dto.setTheater("Another Theater");
        dto.setTheaterId(2L);
        dto.setTheaterInfo(theaterInfo);
        dto.setScreeningFormat("4DX");
        dto.setReview("Not bad");
        dto.setCreatedAt(now);
        dto.setUpdatedAt(now);
        
        assertEquals(2L, dto.getId());
        assertEquals(456L, dto.getTmdbMovieId());
        assertEquals("Another Movie", dto.getMovieTitle());
        assertEquals("/another-poster.jpg", dto.getMoviePosterPath());
        assertEquals(now, dto.getViewingDate());
        assertEquals(3.8, dto.getRating());
        assertEquals("Another Theater", dto.getTheater());
        assertEquals(2L, dto.getTheaterId());
        assertEquals(theaterInfo, dto.getTheaterInfo());
        assertEquals("4DX", dto.getScreeningFormat());
        assertEquals("Not bad", dto.getReview());
        assertEquals(now, dto.getCreatedAt());
        assertEquals(now, dto.getUpdatedAt());
    }
}