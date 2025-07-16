package com.cinetrack.controller;

import com.cinetrack.dto.ApiResponse;
import com.cinetrack.entity.User;
import com.cinetrack.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.util.Collections;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@ActiveProfiles("test")
class AuthControllerIntegrationTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext context;

    @MockBean
    private UserService userService;

    @Autowired
    private ObjectMapper objectMapper;

    private User testUser;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setPassword("encodedPassword");
    }

    @Test
    @WithMockUser(username = "testuser")
    void getCurrentUser_WithValidAuthentication_ShouldReturnUser() throws Exception {
        // Given
        when(userService.findByUsername("testuser")).thenReturn(Optional.of(testUser));

        // When & Then
        mockMvc.perform(get("/auth/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.username").value("testuser"))
                .andExpect(jsonPath("$.data.email").value("test@example.com"))
                .andExpect(jsonPath("$.data.password").doesNotExist()); // Password should be null

        verify(userService).findByUsername("testuser");
    }

    @Test
    void getCurrentUser_WithNullAuthentication_ShouldReturnUnauthorized() throws Exception {
        // When & Then - No authentication provided
        mockMvc.perform(get("/auth/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getCurrentUser_WithUnauthenticatedUser_ShouldReturnUnauthorized() throws Exception {
        // Given - create unauthenticated token
        Authentication unauthenticatedAuth = new UsernamePasswordAuthenticationToken(
                "testuser", "password", Collections.emptyList());
        // Explicitly set authenticated to false
        ((UsernamePasswordAuthenticationToken) unauthenticatedAuth).setAuthenticated(false);

        // When & Then
        mockMvc.perform(get("/auth/me")
                .with(authentication(unauthenticatedAuth)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getCurrentUser_WithExplicitNullAuthentication_ShouldReturnUnauthorized() throws Exception {
        // When & Then - pass explicit null authentication
        mockMvc.perform(get("/auth/me")
                .with(authentication(null)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getCurrentUser_WithAnonymousAuthentication_ShouldReturnUnauthorized() throws Exception {
        // Given - create anonymous authentication (not authenticated)
        Authentication anonymousAuth = new UsernamePasswordAuthenticationToken(
                null, null, Collections.emptyList());
        
        // When & Then
        mockMvc.perform(get("/auth/me")
                .with(authentication(anonymousAuth)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "nonexistentuser")
    void getCurrentUser_WithUserNotFound_ShouldReturnNotFound() throws Exception {
        // Given
        when(userService.findByUsername("nonexistentuser")).thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(get("/auth/me"))
                .andExpect(status().isNotFound());

        verify(userService).findByUsername("nonexistentuser");
    }

    @Test
    @WithMockUser(username = "testuser")
    void getCurrentUser_WithServiceException_ShouldReturnInternalServerError() throws Exception {
        // Given
        when(userService.findByUsername("testuser"))
                .thenThrow(new RuntimeException("Database connection error"));

        // When & Then
        mockMvc.perform(get("/auth/me"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Failed to get user: Database connection error"));

        verify(userService).findByUsername("testuser");
    }
}