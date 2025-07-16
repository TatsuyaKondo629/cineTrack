package com.cinetrack.dto;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class UserDtoTest {

    @Test
    void testDefaultConstructor() {
        UserDto dto = new UserDto();
        
        assertNull(dto.getId());
        assertNull(dto.getUsername());
        assertNull(dto.getEmail());
        assertNull(dto.getDisplayName());
        assertNull(dto.getBio());
        assertNull(dto.getAvatarUrl());
        assertNull(dto.getFollowerCount());
        assertNull(dto.getFollowingCount());
        assertNull(dto.getIsFollowing());
        assertNull(dto.getIsFollowedBy());
        assertNull(dto.getIsMutualFollow());
        assertNull(dto.getTotalMovieCount());
        assertNull(dto.getAverageRating());
        assertNull(dto.getCreatedAt());
        assertNull(dto.getLastActiveAt());
    }

    @Test
    void testParameterizedConstructor() {
        UserDto dto = new UserDto(1L, "testuser", "test@example.com");
        
        assertEquals(1L, dto.getId());
        assertEquals("testuser", dto.getUsername());
        assertEquals("test@example.com", dto.getEmail());
    }

    @Test
    void testGettersAndSetters() {
        UserDto dto = new UserDto();
        LocalDateTime now = LocalDateTime.now();
        
        dto.setId(2L);
        dto.setUsername("newuser");
        dto.setEmail("new@example.com");
        dto.setDisplayName("New User");
        dto.setBio("This is a bio");
        dto.setAvatarUrl("http://example.com/avatar.jpg");
        dto.setFollowerCount(100L);
        dto.setFollowingCount(50L);
        dto.setIsFollowing(true);
        dto.setIsFollowedBy(false);
        dto.setIsMutualFollow(true);
        dto.setTotalMovieCount(200L);
        dto.setAverageRating(4.3);
        dto.setCreatedAt(now);
        dto.setLastActiveAt(now);
        
        assertEquals(2L, dto.getId());
        assertEquals("newuser", dto.getUsername());
        assertEquals("new@example.com", dto.getEmail());
        assertEquals("New User", dto.getDisplayName());
        assertEquals("This is a bio", dto.getBio());
        assertEquals("http://example.com/avatar.jpg", dto.getAvatarUrl());
        assertEquals(100L, dto.getFollowerCount());
        assertEquals(50L, dto.getFollowingCount());
        assertTrue(dto.getIsFollowing());
        assertFalse(dto.getIsFollowedBy());
        assertTrue(dto.getIsMutualFollow());
        assertEquals(200L, dto.getTotalMovieCount());
        assertEquals(4.3, dto.getAverageRating());
        assertEquals(now, dto.getCreatedAt());
        assertEquals(now, dto.getLastActiveAt());
    }
}