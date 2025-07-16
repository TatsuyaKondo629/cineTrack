package com.cinetrack.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.SignatureException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.Mockito.lenient;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
class JwtUtilTest {

    private JwtUtil jwtUtil;
    private UserDetails userDetails;
    private final String TEST_SECRET = "test-secret-key-that-is-long-enough-for-hmac-sha256-algorithm";
    private final Long TEST_EXPIRATION = 86400L; // 24 hours

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "secretKey", TEST_SECRET);
        ReflectionTestUtils.setField(jwtUtil, "jwtExpiration", TEST_EXPIRATION);

        userDetails = mock(UserDetails.class);
        lenient().when(userDetails.getUsername()).thenReturn("testuser");
    }

    @Test
    void generateToken_WithUserDetails_ShouldReturnValidToken() {
        // When
        String token = jwtUtil.generateToken(userDetails);

        // Then
        assertNotNull(token);
        assertTrue(token.length() > 0);
        
        // Verify token structure (JWT has 3 parts separated by dots)
        String[] parts = token.split("\\.");
        assertEquals(3, parts.length);
    }

    @Test
    void generateToken_WithUsername_ShouldReturnValidToken() {
        // Given
        String username = "testuser";

        // When
        String token = jwtUtil.generateToken(username);

        // Then
        assertNotNull(token);
        assertTrue(token.length() > 0);
        
        // Verify token structure
        String[] parts = token.split("\\.");
        assertEquals(3, parts.length);
    }

    @Test
    void extractUsername_WithValidToken_ShouldReturnUsername() {
        // Given
        String token = jwtUtil.generateToken(userDetails);

        // When
        String extractedUsername = jwtUtil.extractUsername(token);

        // Then
        assertEquals("testuser", extractedUsername);
    }

    @Test
    void extractUsername_WithInvalidToken_ShouldThrowException() {
        // Given
        String invalidToken = "invalid.token.here";

        // When & Then
        assertThrows(MalformedJwtException.class, () -> {
            jwtUtil.extractUsername(invalidToken);
        });
    }

    @Test
    void extractExpiration_WithValidToken_ShouldReturnExpirationDate() {
        // Given
        String token = jwtUtil.generateToken(userDetails);

        // When
        Date expiration = jwtUtil.extractExpiration(token);

        // Then
        assertNotNull(expiration);
        assertTrue(expiration.after(new Date()));
    }

    @Test
    void extractClaim_WithValidToken_ShouldReturnClaim() {
        // Given
        String token = jwtUtil.generateToken(userDetails);

        // When
        String subject = jwtUtil.extractClaim(token, Claims::getSubject);

        // Then
        assertEquals("testuser", subject);
    }

    @Test
    void isTokenExpired_WithValidToken_ShouldReturnFalse() {
        // Given
        String token = jwtUtil.generateToken(userDetails);

        // When
        Boolean isExpired = jwtUtil.isTokenExpired(token);

        // Then
        assertFalse(isExpired);
    }

    @Test
    void isTokenExpired_WithExpiredToken_ShouldReturnTrue() {
        // Given - Create token with very short expiration
        ReflectionTestUtils.setField(jwtUtil, "jwtExpiration", -1L);
        String token = jwtUtil.generateToken(userDetails);

        // When & Then
        assertThrows(ExpiredJwtException.class, () -> {
            jwtUtil.isTokenExpired(token);
        });
    }

    @Test
    void validateToken_WithValidTokenAndUserDetails_ShouldReturnTrue() {
        // Given
        String token = jwtUtil.generateToken(userDetails);

        // When
        Boolean isValid = jwtUtil.validateToken(token, userDetails);

        // Then
        assertTrue(isValid);
    }

    @Test
    void validateToken_WithValidTokenAndUsername_ShouldReturnTrue() {
        // Given
        String username = "testuser";
        String token = jwtUtil.generateToken(username);

        // When
        Boolean isValid = jwtUtil.validateToken(token, username);

        // Then
        assertTrue(isValid);
    }

    @Test
    void validateToken_WithDifferentUsername_ShouldReturnFalse() {
        // Given
        String token = jwtUtil.generateToken("testuser");

        // When
        Boolean isValid = jwtUtil.validateToken(token, "differentuser");

        // Then
        assertFalse(isValid);
    }

    @Test
    void validateToken_WithExpiredToken_ShouldThrowException() {
        // Given - Create token with very short expiration
        ReflectionTestUtils.setField(jwtUtil, "jwtExpiration", -1L);
        String token = jwtUtil.generateToken(userDetails);

        // When & Then
        assertThrows(ExpiredJwtException.class, () -> {
            jwtUtil.validateToken(token, userDetails);
        });
    }

    @Test
    void validateToken_WithInvalidToken_ShouldThrowException() {
        // Given
        String invalidToken = "invalid.token.here";

        // When & Then
        assertThrows(MalformedJwtException.class, () -> {
            jwtUtil.validateToken(invalidToken, userDetails);
        });
    }

    @Test
    void validateToken_WithWrongSignature_ShouldThrowException() {
        // Given
        String token = jwtUtil.generateToken(userDetails);
        
        // Change the secret key to make signature invalid
        ReflectionTestUtils.setField(jwtUtil, "secretKey", "different-secret-key-that-is-long-enough-for-hmac-sha256");

        // When & Then
        assertThrows(SignatureException.class, () -> {
            jwtUtil.validateToken(token, userDetails);
        });
    }

    @Test
    void extractUsername_WithExpiredToken_ShouldThrowExpiredJwtException() {
        // Given - Create token with very short expiration
        ReflectionTestUtils.setField(jwtUtil, "jwtExpiration", -1L);
        String token = jwtUtil.generateToken(userDetails);

        // When & Then
        assertThrows(ExpiredJwtException.class, () -> {
            jwtUtil.extractUsername(token);
        });
    }

    @Test
    void extractExpiration_WithExpiredToken_ShouldThrowExpiredJwtException() {
        // Given - Create token with very short expiration
        ReflectionTestUtils.setField(jwtUtil, "jwtExpiration", -1L);
        String token = jwtUtil.generateToken(userDetails);

        // When & Then
        assertThrows(ExpiredJwtException.class, () -> {
            jwtUtil.extractExpiration(token);
        });
    }

    @Test
    void extractClaim_WithExpiredToken_ShouldThrowExpiredJwtException() {
        // Given - Create token with very short expiration
        ReflectionTestUtils.setField(jwtUtil, "jwtExpiration", -1L);
        String token = jwtUtil.generateToken(userDetails);

        // When & Then
        assertThrows(ExpiredJwtException.class, () -> {
            jwtUtil.extractClaim(token, Claims::getSubject);
        });
    }

    @Test
    void generateToken_WithDifferentUserDetails_ShouldGenerateDifferentTokens() {
        // Given
        UserDetails userDetails1 = mock(UserDetails.class);
        when(userDetails1.getUsername()).thenReturn("user1");
        
        UserDetails userDetails2 = mock(UserDetails.class);
        when(userDetails2.getUsername()).thenReturn("user2");

        // When
        String token1 = jwtUtil.generateToken(userDetails1);
        String token2 = jwtUtil.generateToken(userDetails2);

        // Then
        assertNotEquals(token1, token2);
        assertEquals("user1", jwtUtil.extractUsername(token1));
        assertEquals("user2", jwtUtil.extractUsername(token2));
    }

    @Test
    void generateToken_CalledTwiceWithSameUser_ShouldGenerateDifferentTokens() throws InterruptedException {
        // Given
        String username = "testuser";

        // When
        String token1 = jwtUtil.generateToken(username);
        Thread.sleep(1000); // 1 second delay to ensure different timestamps
        String token2 = jwtUtil.generateToken(username);

        // Then
        assertNotEquals(token1, token2); // Different because of different issued time
        assertEquals(username, jwtUtil.extractUsername(token1));
        assertEquals(username, jwtUtil.extractUsername(token2));
    }
}