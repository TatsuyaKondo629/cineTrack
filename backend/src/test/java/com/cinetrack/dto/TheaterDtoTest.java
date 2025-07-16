package com.cinetrack.dto;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class TheaterDtoTest {

    @Test
    void testDefaultConstructor() {
        TheaterDto dto = new TheaterDto();
        
        assertNull(dto.getId());
        assertNull(dto.getName());
        assertNull(dto.getChain());
        assertNull(dto.getLocation());
        assertNull(dto.getAddress());
        assertNull(dto.getPhone());
        assertNull(dto.getWebsite());
        assertNull(dto.getPrefecture());
        assertNull(dto.getCity());
        assertNull(dto.getLatitude());
        assertNull(dto.getLongitude());
        assertNull(dto.getIsActive());
        assertNull(dto.getCreatedAt());
        assertNull(dto.getUpdatedAt());
    }

    @Test
    void testParameterizedConstructor() {
        LocalDateTime now = LocalDateTime.now();
        TheaterDto dto = new TheaterDto(1L, "Test Theater", "Test Chain", "Test Location", 
                                       "Test Address", "123-456-7890", "http://test.com", 
                                       "Test Prefecture", "Test City", 35.6762, 139.6503, 
                                       true, now, now);
        
        assertEquals(1L, dto.getId());
        assertEquals("Test Theater", dto.getName());
        assertEquals("Test Chain", dto.getChain());
        assertEquals("Test Location", dto.getLocation());
        assertEquals("Test Address", dto.getAddress());
        assertEquals("123-456-7890", dto.getPhone());
        assertEquals("http://test.com", dto.getWebsite());
        assertEquals("Test Prefecture", dto.getPrefecture());
        assertEquals("Test City", dto.getCity());
        assertEquals(35.6762, dto.getLatitude());
        assertEquals(139.6503, dto.getLongitude());
        assertTrue(dto.getIsActive());
        assertEquals(now, dto.getCreatedAt());
        assertEquals(now, dto.getUpdatedAt());
    }

    @Test
    void testGettersAndSetters() {
        TheaterDto dto = new TheaterDto();
        LocalDateTime now = LocalDateTime.now();
        
        dto.setId(2L);
        dto.setName("Updated Theater");
        dto.setChain("Updated Chain");
        dto.setLocation("Updated Location");
        dto.setAddress("Updated Address");
        dto.setPhone("098-765-4321");
        dto.setWebsite("http://updated.com");
        dto.setPrefecture("Updated Prefecture");
        dto.setCity("Updated City");
        dto.setLatitude(34.0522);
        dto.setLongitude(118.2437);
        dto.setIsActive(false);
        dto.setCreatedAt(now);
        dto.setUpdatedAt(now);
        
        assertEquals(2L, dto.getId());
        assertEquals("Updated Theater", dto.getName());
        assertEquals("Updated Chain", dto.getChain());
        assertEquals("Updated Location", dto.getLocation());
        assertEquals("Updated Address", dto.getAddress());
        assertEquals("098-765-4321", dto.getPhone());
        assertEquals("http://updated.com", dto.getWebsite());
        assertEquals("Updated Prefecture", dto.getPrefecture());
        assertEquals("Updated City", dto.getCity());
        assertEquals(34.0522, dto.getLatitude());
        assertEquals(118.2437, dto.getLongitude());
        assertFalse(dto.getIsActive());
        assertEquals(now, dto.getCreatedAt());
        assertEquals(now, dto.getUpdatedAt());
    }

    @Test
    void testGetDisplayName() {
        TheaterDto dto = new TheaterDto();
        
        // Test with chain and location
        dto.setChain("TOHO");
        dto.setLocation("Shibuya");
        assertEquals("TOHO Shibuya", dto.getDisplayName());
        
        // Test with only name
        dto.setChain(null);
        dto.setLocation(null);
        dto.setName("Test Theater");
        assertEquals("Test Theater", dto.getDisplayName());
        
        // Test with no chain, location, or name
        dto.setName(null);
        assertEquals("未知の映画館", dto.getDisplayName());
    }

    @Test
    void testGetShortAddress() {
        TheaterDto dto = new TheaterDto();
        
        // Test with prefecture and city
        dto.setPrefecture("Tokyo");
        dto.setCity("Shibuya");
        assertEquals("Tokyo Shibuya", dto.getShortAddress());
        
        // Test with only prefecture
        dto.setCity(null);
        assertEquals("Tokyo", dto.getShortAddress());
        
        // Test with only city
        dto.setPrefecture(null);
        dto.setCity("Shibuya");
        assertEquals("Shibuya", dto.getShortAddress());
        
        // Test with no prefecture or city
        dto.setCity(null);
        assertNull(dto.getShortAddress());
    }
}