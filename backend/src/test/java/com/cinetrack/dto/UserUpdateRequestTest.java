package com.cinetrack.dto;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class UserUpdateRequestTest {

    @Test
    void testDefaultConstructor() {
        UserUpdateRequest request = new UserUpdateRequest();
        
        assertNull(request.getUsername());
        assertNull(request.getEmail());
        assertNull(request.getDisplayName());
        assertNull(request.getBio());
        assertNull(request.getAvatarUrl());
        assertNull(request.getNewPassword());
        assertNull(request.getCurrentPassword());
    }

    @Test
    void testGettersAndSetters() {
        UserUpdateRequest request = new UserUpdateRequest();
        
        request.setUsername("updateduser");
        request.setEmail("updated@example.com");
        request.setDisplayName("Updated User");
        request.setBio("Updated bio");
        request.setAvatarUrl("http://example.com/updated-avatar.jpg");
        request.setNewPassword("newpassword123");
        request.setCurrentPassword("currentpassword123");
        
        assertEquals("updateduser", request.getUsername());
        assertEquals("updated@example.com", request.getEmail());
        assertEquals("Updated User", request.getDisplayName());
        assertEquals("Updated bio", request.getBio());
        assertEquals("http://example.com/updated-avatar.jpg", request.getAvatarUrl());
        assertEquals("newpassword123", request.getNewPassword());
        assertEquals("currentpassword123", request.getCurrentPassword());
    }
}