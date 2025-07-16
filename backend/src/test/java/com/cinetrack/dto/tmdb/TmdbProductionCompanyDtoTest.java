package com.cinetrack.dto.tmdb;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class TmdbProductionCompanyDtoTest {

    @Test
    void testDefaultConstructor() {
        TmdbProductionCompanyDto dto = new TmdbProductionCompanyDto();
        
        assertNull(dto.getId());
        assertNull(dto.getName());
        assertNull(dto.getLogoPath());
        assertNull(dto.getOriginCountry());
    }

    @Test
    void testGettersAndSetters() {
        TmdbProductionCompanyDto dto = new TmdbProductionCompanyDto();
        
        dto.setId(123);
        dto.setName("Marvel Studios");
        dto.setLogoPath("/logo.png");
        dto.setOriginCountry("US");
        
        assertEquals(123, dto.getId());
        assertEquals("Marvel Studios", dto.getName());
        assertEquals("/logo.png", dto.getLogoPath());
        assertEquals("US", dto.getOriginCountry());
    }
}