package com.cinetrack.dto.tmdb;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class TmdbGenreDtoTest {

    @Test
    void testDefaultConstructor() {
        TmdbGenreDto dto = new TmdbGenreDto();
        
        assertNull(dto.getId());
        assertNull(dto.getName());
    }

    @Test
    void testParameterizedConstructor() {
        TmdbGenreDto dto = new TmdbGenreDto(1, "Action");
        
        assertEquals(1, dto.getId());
        assertEquals("Action", dto.getName());
    }

    @Test
    void testGettersAndSetters() {
        TmdbGenreDto dto = new TmdbGenreDto();
        
        dto.setId(2);
        dto.setName("Drama");
        
        assertEquals(2, dto.getId());
        assertEquals("Drama", dto.getName());
    }
}