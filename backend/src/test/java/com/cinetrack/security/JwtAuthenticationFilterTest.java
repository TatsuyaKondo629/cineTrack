package com.cinetrack.security;

import com.cinetrack.service.UserService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.context.ActiveProfiles;

import java.io.IOException;
import java.util.ArrayList;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
class JwtAuthenticationFilterTest {

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private UserService userService;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @Mock
    private FilterChain filterChain;

    @Mock
    private UserDetails userDetails;

    @InjectMocks
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void doFilterInternal_WithValidBearerToken_ShouldSetAuthentication() throws ServletException, IOException {
        // Given
        String token = "valid.jwt.token";
        String username = "testuser";
        
        when(request.getHeader("Authorization")).thenReturn("Bearer " + token);
        when(jwtUtil.extractUsername(token)).thenReturn(username);
        when(userService.loadUserByUsername(username)).thenReturn(userDetails);
        lenient().when(userDetails.getUsername()).thenReturn(username);
        lenient().when(userDetails.getAuthorities()).thenReturn(new ArrayList<>());
        when(jwtUtil.validateToken(token, userDetails)).thenReturn(true);

        // When
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        // Then
        assertNotNull(SecurityContextHolder.getContext().getAuthentication());
        assertTrue(SecurityContextHolder.getContext().getAuthentication() instanceof UsernamePasswordAuthenticationToken);
        assertEquals(userDetails, SecurityContextHolder.getContext().getAuthentication().getPrincipal());
        
        verify(filterChain).doFilter(request, response);
        verify(jwtUtil).extractUsername(token);
        verify(userService).loadUserByUsername(username);
        verify(jwtUtil).validateToken(eq(token), eq(userDetails));
    }

    @Test
    void doFilterInternal_WithInvalidBearerToken_ShouldNotSetAuthentication() throws ServletException, IOException {
        // Given
        String token = "invalid.jwt.token";
        String username = "testuser";
        
        when(request.getHeader("Authorization")).thenReturn("Bearer " + token);
        when(jwtUtil.extractUsername(token)).thenReturn(username);
        when(userService.loadUserByUsername(username)).thenReturn(userDetails);
        when(jwtUtil.validateToken(token, userDetails)).thenReturn(false);

        // When
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        // Then
        assertNull(SecurityContextHolder.getContext().getAuthentication());
        
        verify(filterChain).doFilter(request, response);
        verify(jwtUtil).extractUsername(token);
        verify(userService).loadUserByUsername(username);
        verify(jwtUtil).validateToken(eq(token), eq(userDetails));
    }

    @Test
    void doFilterInternal_WithMalformedToken_ShouldNotSetAuthentication() throws ServletException, IOException {
        // Given
        String token = "malformed.token";
        
        when(request.getHeader("Authorization")).thenReturn("Bearer " + token);
        when(jwtUtil.extractUsername(token)).thenThrow(new RuntimeException("Malformed JWT token"));

        // When
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        // Then
        assertNull(SecurityContextHolder.getContext().getAuthentication());
        
        verify(filterChain).doFilter(request, response);
        verify(jwtUtil).extractUsername(token);
        verify(userService, never()).loadUserByUsername(any());
        verify(jwtUtil, never()).validateToken(any(String.class), any(UserDetails.class));
    }

    @Test
    void doFilterInternal_WithNoAuthorizationHeader_ShouldNotSetAuthentication() throws ServletException, IOException {
        // Given
        when(request.getHeader("Authorization")).thenReturn(null);

        // When
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        // Then
        assertNull(SecurityContextHolder.getContext().getAuthentication());
        
        verify(filterChain).doFilter(request, response);
        verify(jwtUtil, never()).extractUsername(any());
        verify(userService, never()).loadUserByUsername(any());
        verify(jwtUtil, never()).validateToken(any(String.class), any(UserDetails.class));
    }

    @Test
    void doFilterInternal_WithInvalidAuthorizationHeaderFormat_ShouldNotSetAuthentication() throws ServletException, IOException {
        // Given
        when(request.getHeader("Authorization")).thenReturn("Invalid format");

        // When
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        // Then
        assertNull(SecurityContextHolder.getContext().getAuthentication());
        
        verify(filterChain).doFilter(request, response);
        verify(jwtUtil, never()).extractUsername(any());
        verify(userService, never()).loadUserByUsername(any());
        verify(jwtUtil, never()).validateToken(any(String.class), any(UserDetails.class));
    }

    @Test
    void doFilterInternal_WithEmptyAuthorizationHeader_ShouldNotSetAuthentication() throws ServletException, IOException {
        // Given
        when(request.getHeader("Authorization")).thenReturn("");

        // When
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        // Then
        assertNull(SecurityContextHolder.getContext().getAuthentication());
        
        verify(filterChain).doFilter(request, response);
        verify(jwtUtil, never()).extractUsername(any());
        verify(userService, never()).loadUserByUsername(any());
        verify(jwtUtil, never()).validateToken(any(String.class), any(UserDetails.class));
    }

    @Test
    void doFilterInternal_WithBearerButNoToken_ShouldNotSetAuthentication() throws ServletException, IOException {
        // Given
        when(request.getHeader("Authorization")).thenReturn("Bearer ");
        when(jwtUtil.extractUsername("")).thenThrow(new RuntimeException("Empty token"));

        // When
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        // Then
        assertNull(SecurityContextHolder.getContext().getAuthentication());
        
        verify(filterChain).doFilter(request, response);
        verify(jwtUtil).extractUsername("");
        verify(userService, never()).loadUserByUsername(any());
        verify(jwtUtil, never()).validateToken(any(String.class), any(UserDetails.class));
    }

    @Test
    void doFilterInternal_WithExistingAuthentication_ShouldNotOverrideAuthentication() throws ServletException, IOException {
        // Given
        String token = "valid.jwt.token";
        String username = "testuser";
        
        // Set existing authentication
        UsernamePasswordAuthenticationToken existingAuth = 
            new UsernamePasswordAuthenticationToken("existinguser", null, new ArrayList<>());
        SecurityContextHolder.getContext().setAuthentication(existingAuth);
        
        when(request.getHeader("Authorization")).thenReturn("Bearer " + token);
        when(jwtUtil.extractUsername(token)).thenReturn(username);

        // When
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        // Then
        assertEquals(existingAuth, SecurityContextHolder.getContext().getAuthentication());
        assertEquals("existinguser", SecurityContextHolder.getContext().getAuthentication().getPrincipal());
        
        verify(filterChain).doFilter(request, response);
        verify(jwtUtil).extractUsername(token);
        verify(userService, never()).loadUserByUsername(any());
        verify(jwtUtil, never()).validateToken(any(String.class), any(UserDetails.class));
    }

    @Test
    void doFilterInternal_WithNullUsernameFromToken_ShouldNotSetAuthentication() throws ServletException, IOException {
        // Given
        String token = "valid.jwt.token";
        
        when(request.getHeader("Authorization")).thenReturn("Bearer " + token);
        when(jwtUtil.extractUsername(token)).thenReturn(null);

        // When
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        // Then
        assertNull(SecurityContextHolder.getContext().getAuthentication());
        
        verify(filterChain).doFilter(request, response);
        verify(jwtUtil).extractUsername(token);
        verify(userService, never()).loadUserByUsername(any());
        verify(jwtUtil, never()).validateToken(any(String.class), any(UserDetails.class));
    }

    @Test
    void doFilterInternal_WithEmptyUsernameFromToken_ShouldNotSetAuthentication() throws ServletException, IOException {
        // Given
        String token = "valid.jwt.token";
        
        when(request.getHeader("Authorization")).thenReturn("Bearer " + token);
        when(jwtUtil.extractUsername(token)).thenReturn("");
        when(userService.loadUserByUsername("")).thenThrow(new RuntimeException("User not found"));

        // When
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        // Then
        assertNull(SecurityContextHolder.getContext().getAuthentication());
        
        verify(filterChain).doFilter(request, response);
        verify(jwtUtil).extractUsername(token);
        verify(userService).loadUserByUsername("");
        verify(jwtUtil, never()).validateToken(any(String.class), any(UserDetails.class));
    }

    @Test
    void doFilterInternal_WithValidTokenButUserNotFound_ShouldNotSetAuthentication() throws ServletException, IOException {
        // Given
        String token = "valid.jwt.token";
        String username = "nonexistentuser";
        
        when(request.getHeader("Authorization")).thenReturn("Bearer " + token);
        when(jwtUtil.extractUsername(token)).thenReturn(username);
        when(userService.loadUserByUsername(username)).thenThrow(new RuntimeException("User not found"));

        // When
        // The exception should be caught and logged, not thrown to the caller
        assertDoesNotThrow(() -> {
            jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);
        });

        // Then
        assertNull(SecurityContextHolder.getContext().getAuthentication());
        
        verify(filterChain).doFilter(request, response);
        verify(jwtUtil).extractUsername(token);
        verify(userService).loadUserByUsername(username);
        verify(jwtUtil, never()).validateToken(any(String.class), any(UserDetails.class));
    }

    @Test
    void doFilterInternal_AlwaysCallsFilterChain() throws ServletException, IOException {
        // Given
        when(request.getHeader("Authorization")).thenReturn(null);

        // When
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        // Then
        verify(filterChain).doFilter(request, response);
    }
}