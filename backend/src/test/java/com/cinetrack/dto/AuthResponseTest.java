package com.cinetrack.dto;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class AuthResponseTest {

    @Test
    void testDefaultConstructor() {
        AuthResponse response = new AuthResponse();
        
        assertNull(response.getToken());
        assertEquals("Bearer", response.getType());
        assertNull(response.getUsername());
        assertNull(response.getEmail());
    }

    @Test
    void testParameterizedConstructor() {
        AuthResponse response = new AuthResponse("jwt-token", "testuser", "test@example.com");
        
        assertEquals("jwt-token", response.getToken());
        assertEquals("Bearer", response.getType());
        assertEquals("testuser", response.getUsername());
        assertEquals("test@example.com", response.getEmail());
    }

    @Test
    void testGettersAndSetters() {
        AuthResponse response = new AuthResponse();
        
        response.setToken("new-token");
        response.setType("Custom");
        response.setUsername("newuser");
        response.setEmail("new@example.com");
        
        assertEquals("new-token", response.getToken());
        assertEquals("Custom", response.getType());
        assertEquals("newuser", response.getUsername());
        assertEquals("new@example.com", response.getEmail());
    }
}