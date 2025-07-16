package com.cinetrack.entity;

import org.junit.jupiter.api.Test;
import org.springframework.security.core.GrantedAuthority;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class UserTest {

    @Test
    void testUserCreation() {
        User user = new User();
        user.setId(1L);
        user.setUsername("testuser");
        user.setEmail("test@example.com");
        user.setPassword("password123");
        user.setDisplayName("Test User");
        user.setBio("Test bio");
        user.setAvatarUrl("http://example.com/avatar.jpg");
        
        LocalDateTime now = LocalDateTime.now();
        user.setCreatedAt(now);
        user.setUpdatedAt(now);
        
        assertEquals(1L, user.getId());
        assertEquals("testuser", user.getUsername());
        assertEquals("test@example.com", user.getEmail());
        assertEquals("password123", user.getPassword());
        assertEquals("Test User", user.getDisplayName());
        assertEquals("Test bio", user.getBio());
        assertEquals("http://example.com/avatar.jpg", user.getAvatarUrl());
        assertEquals(now, user.getCreatedAt());
        assertEquals(now, user.getUpdatedAt());
    }
    
    @Test
    void testUserDetailsImplementation() {
        User user = new User();
        user.setUsername("testuser");
        user.setPassword("password123");
        
        // Test UserDetails methods
        Collection<? extends GrantedAuthority> authorities = user.getAuthorities();
        assertTrue(authorities.isEmpty());
        
        assertTrue(user.isAccountNonExpired());
        assertTrue(user.isAccountNonLocked());
        assertTrue(user.isCredentialsNonExpired());
        assertTrue(user.isEnabled());
        
        assertEquals("testuser", user.getUsername());
        assertEquals("password123", user.getPassword());
    }
    
    @Test
    void testViewingRecords() {
        User user = new User();
        List<ViewingRecord> records = List.of(new ViewingRecord());
        user.setViewingRecords(records);
        
        assertEquals(records, user.getViewingRecords());
    }
    
    @Test
    void testOnCreateCallback() {
        User user = new User();
        user.onCreate();
        
        assertNotNull(user.getCreatedAt());
        assertNotNull(user.getUpdatedAt());
        // Check that both timestamps are very close (within 1 second)
        assertTrue(Math.abs(user.getCreatedAt().getNano() - user.getUpdatedAt().getNano()) < 1000000);
    }
    
    @Test
    void testOnUpdateCallback() {
        User user = new User();
        LocalDateTime originalTime = LocalDateTime.now().minusDays(1);
        user.setCreatedAt(originalTime);
        user.setUpdatedAt(originalTime);
        
        user.onUpdate();
        
        assertEquals(originalTime, user.getCreatedAt());
        assertTrue(user.getUpdatedAt().isAfter(originalTime));
    }
    
    @Test
    void testNullValues() {
        User user = new User();
        
        assertNull(user.getId());
        assertNull(user.getUsername());
        assertNull(user.getEmail());
        assertNull(user.getPassword());
        assertNull(user.getDisplayName());
        assertNull(user.getBio());
        assertNull(user.getAvatarUrl());
        assertNull(user.getCreatedAt());
        assertNull(user.getUpdatedAt());
        assertNull(user.getViewingRecords());
    }
}