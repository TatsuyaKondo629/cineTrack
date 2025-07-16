package com.cinetrack.dto;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class LoginRequestTest {

    @Test
    void testDefaultConstructor() {
        LoginRequest request = new LoginRequest();
        
        assertNull(request.getEmail());
        assertNull(request.getPassword());
    }

    @Test
    void testParameterizedConstructor() {
        LoginRequest request = new LoginRequest("test@example.com", "password123");
        
        assertEquals("test@example.com", request.getEmail());
        assertEquals("password123", request.getPassword());
    }

    @Test
    void testGettersAndSetters() {
        LoginRequest request = new LoginRequest();
        
        request.setEmail("new@example.com");
        request.setPassword("newpassword");
        
        assertEquals("new@example.com", request.getEmail());
        assertEquals("newpassword", request.getPassword());
    }
}