package com.cinetrack.dto;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class WishlistDtoTest {

    @Test
    void testDefaultConstructor() {
        WishlistDto dto = new WishlistDto();
        
        assertNull(dto.getId());
        assertNull(dto.getTmdbMovieId());
        assertNull(dto.getMovieTitle());
        assertNull(dto.getMoviePosterPath());
        assertNull(dto.getMovieOverview());
        assertNull(dto.getMovieReleaseDate());
        assertNull(dto.getMovieVoteAverage());
        assertNull(dto.getCreatedAt());
    }

    @Test
    void testParameterizedConstructor() {
        LocalDateTime now = LocalDateTime.now();
        WishlistDto dto = new WishlistDto(1L, 123L, "Test Movie", "/poster.jpg", 
                                         "Test overview", "2024-01-01", 8.5, now);
        
        assertEquals(1L, dto.getId());
        assertEquals(123L, dto.getTmdbMovieId());
        assertEquals("Test Movie", dto.getMovieTitle());
        assertEquals("/poster.jpg", dto.getMoviePosterPath());
        assertEquals("Test overview", dto.getMovieOverview());
        assertEquals("2024-01-01", dto.getMovieReleaseDate());
        assertEquals(8.5, dto.getMovieVoteAverage());
        assertEquals(now, dto.getCreatedAt());
    }

    @Test
    void testGettersAndSetters() {
        WishlistDto dto = new WishlistDto();
        LocalDateTime now = LocalDateTime.now();
        
        dto.setId(2L);
        dto.setTmdbMovieId(456L);
        dto.setMovieTitle("Another Movie");
        dto.setMoviePosterPath("/another-poster.jpg");
        dto.setMovieOverview("Another overview");
        dto.setMovieReleaseDate("2024-02-01");
        dto.setMovieVoteAverage(7.8);
        dto.setCreatedAt(now);
        
        assertEquals(2L, dto.getId());
        assertEquals(456L, dto.getTmdbMovieId());
        assertEquals("Another Movie", dto.getMovieTitle());
        assertEquals("/another-poster.jpg", dto.getMoviePosterPath());
        assertEquals("Another overview", dto.getMovieOverview());
        assertEquals("2024-02-01", dto.getMovieReleaseDate());
        assertEquals(7.8, dto.getMovieVoteAverage());
        assertEquals(now, dto.getCreatedAt());
    }
}