package com.cinetrack.service;

import com.cinetrack.entity.User;
import com.cinetrack.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setPassword("encodedPassword");
    }

    @Test
    void createUser_WithValidData_ShouldReturnSavedUser() {
        // Given
        String username = "newuser";
        String email = "new@example.com";
        String rawPassword = "password123";
        String encodedPassword = "encodedPassword123";

        when(userRepository.existsByUsername(username)).thenReturn(false);
        when(userRepository.existsByEmail(email)).thenReturn(false);
        when(passwordEncoder.encode(rawPassword)).thenReturn(encodedPassword);
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // When
        User result = userService.createUser(username, email, rawPassword);

        // Then
        assertNotNull(result);
        verify(userRepository).existsByUsername(username);
        verify(userRepository).existsByEmail(email);
        verify(passwordEncoder).encode(rawPassword);
        verify(userRepository).save(any(User.class));
    }

    @Test
    void findByEmail_WithExistingEmail_ShouldReturnUser() {
        // Given
        String email = "test@example.com";
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(testUser));

        // When
        Optional<User> result = userService.findByEmail(email);

        // Then
        assertTrue(result.isPresent());
        assertEquals(testUser.getEmail(), result.get().getEmail());
        verify(userRepository).findByEmail(email);
    }

    @Test
    void findByEmail_WithNonExistingEmail_ShouldReturnEmpty() {
        // Given
        String email = "nonexistent@example.com";
        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());

        // When
        Optional<User> result = userService.findByEmail(email);

        // Then
        assertFalse(result.isPresent());
        verify(userRepository).findByEmail(email);
    }

    @Test
    void findByUsername_WithExistingUsername_ShouldReturnUser() {
        // Given
        String username = "testuser";
        when(userRepository.findByUsername(username)).thenReturn(Optional.of(testUser));

        // When
        Optional<User> result = userService.findByUsername(username);

        // Then
        assertTrue(result.isPresent());
        assertEquals(testUser.getUsername(), result.get().getUsername());
        verify(userRepository).findByUsername(username);
    }

    @Test
    void existsByEmail_WithExistingEmail_ShouldReturnTrue() {
        // Given
        String email = "test@example.com";
        when(userRepository.existsByEmail(email)).thenReturn(true);

        // When
        boolean result = userService.existsByEmail(email);

        // Then
        assertTrue(result);
        verify(userRepository).existsByEmail(email);
    }

    @Test
    void existsByUsername_WithExistingUsername_ShouldReturnTrue() {
        // Given
        String username = "testuser";
        when(userRepository.existsByUsername(username)).thenReturn(true);

        // When
        boolean result = userService.existsByUsername(username);

        // Then
        assertTrue(result);
        verify(userRepository).existsByUsername(username);
    }
}