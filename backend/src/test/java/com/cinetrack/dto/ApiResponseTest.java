package com.cinetrack.dto;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ApiResponseTest {

    @Test
    void testDefaultConstructor() {
        ApiResponse<String> response = new ApiResponse<>();
        
        assertFalse(response.isSuccess());
        assertNull(response.getMessage());
        assertNull(response.getData());
    }

    @Test
    void testParameterizedConstructorWithoutData() {
        ApiResponse<String> response = new ApiResponse<>(true, "Operation successful");
        
        assertTrue(response.isSuccess());
        assertEquals("Operation successful", response.getMessage());
        assertNull(response.getData());
    }

    @Test
    void testParameterizedConstructorWithData() {
        String data = "test data";
        ApiResponse<String> response = new ApiResponse<>(true, "Operation successful", data);
        
        assertTrue(response.isSuccess());
        assertEquals("Operation successful", response.getMessage());
        assertEquals(data, response.getData());
    }

    @Test
    void testSuccessWithData() {
        String data = "result data";
        ApiResponse<String> response = ApiResponse.success("Success message", data);
        
        assertTrue(response.isSuccess());
        assertEquals("Success message", response.getMessage());
        assertEquals(data, response.getData());
    }

    @Test
    void testSuccessWithoutData() {
        ApiResponse<String> response = ApiResponse.success("Success message");
        
        assertTrue(response.isSuccess());
        assertEquals("Success message", response.getMessage());
        assertNull(response.getData());
    }

    @Test
    void testError() {
        ApiResponse<String> response = ApiResponse.error("Error message");
        
        assertFalse(response.isSuccess());
        assertEquals("Error message", response.getMessage());
        assertNull(response.getData());
    }

    @Test
    void testGettersAndSetters() {
        ApiResponse<String> response = new ApiResponse<>();
        
        response.setSuccess(true);
        response.setMessage("Test message");
        response.setData("Test data");
        
        assertTrue(response.isSuccess());
        assertEquals("Test message", response.getMessage());
        assertEquals("Test data", response.getData());
    }
}