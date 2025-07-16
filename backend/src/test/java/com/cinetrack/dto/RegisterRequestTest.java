package com.cinetrack.dto;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class RegisterRequestTest {

    @Test
    void testDefaultConstructor() {
        RegisterRequest request = new RegisterRequest();
        
        assertNull(request.getUsername());
        assertNull(request.getEmail());
        assertNull(request.getPassword());
    }

    @Test
    void testParameterizedConstructor() {
        RegisterRequest request = new RegisterRequest("testuser", "test@example.com", "password123");
        
        assertEquals("testuser", request.getUsername());
        assertEquals("test@example.com", request.getEmail());
        assertEquals("password123", request.getPassword());
    }

    @Test
    void testGettersAndSetters() {
        RegisterRequest request = new RegisterRequest();
        
        request.setUsername("newuser");
        request.setEmail("new@example.com");
        request.setPassword("newpassword");
        
        assertEquals("newuser", request.getUsername());
        assertEquals("new@example.com", request.getEmail());
        assertEquals("newpassword", request.getPassword());
    }
}