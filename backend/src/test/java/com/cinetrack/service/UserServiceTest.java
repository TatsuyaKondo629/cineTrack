package com.cinetrack.service;

import com.cinetrack.entity.User;
import com.cinetrack.repository.UserRepository;
import com.cinetrack.dto.UserUpdateRequest;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
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
import org.springframework.test.context.ActiveProfiles;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
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

    @Test
    void loadUserByUsername_WithExistingUsername_ShouldReturnUserDetails() {
        // Given
        String username = "testuser";
        when(userRepository.findByUsername(username)).thenReturn(Optional.of(testUser));

        // When
        UserDetails result = userService.loadUserByUsername(username);

        // Then
        assertNotNull(result);
        assertEquals(testUser.getUsername(), result.getUsername());
        verify(userRepository).findByUsername(username);
    }

    @Test
    void loadUserByUsername_WithNonExistingUsername_ShouldThrowException() {
        // Given
        String username = "nonexistent";
        when(userRepository.findByUsername(username)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(UsernameNotFoundException.class, () -> {
            userService.loadUserByUsername(username);
        });
        verify(userRepository).findByUsername(username);
    }

    @Test
    void createUser_WithExistingUsername_ShouldThrowException() {
        // Given
        String username = "existinguser";
        String email = "new@example.com";
        String password = "password123";
        
        when(userRepository.existsByUsername(username)).thenReturn(true);

        // When & Then
        assertThrows(RuntimeException.class, () -> {
            userService.createUser(username, email, password);
        });
        verify(userRepository).existsByUsername(username);
        verify(userRepository, never()).existsByEmail(anyString());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void createUser_WithExistingEmail_ShouldThrowException() {
        // Given
        String username = "newuser";
        String email = "existing@example.com";
        String password = "password123";
        
        when(userRepository.existsByUsername(username)).thenReturn(false);
        when(userRepository.existsByEmail(email)).thenReturn(true);

        // When & Then
        assertThrows(RuntimeException.class, () -> {
            userService.createUser(username, email, password);
        });
        verify(userRepository).existsByUsername(username);
        verify(userRepository).existsByEmail(email);
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void existsByEmail_WithNonExistingEmail_ShouldReturnFalse() {
        // Given
        String email = "nonexistent@example.com";
        when(userRepository.existsByEmail(email)).thenReturn(false);

        // When
        boolean result = userService.existsByEmail(email);

        // Then
        assertFalse(result);
        verify(userRepository).existsByEmail(email);
    }

    @Test
    void existsByUsername_WithNonExistingUsername_ShouldReturnFalse() {
        // Given
        String username = "nonexistent";
        when(userRepository.existsByUsername(username)).thenReturn(false);

        // When
        boolean result = userService.existsByUsername(username);

        // Then
        assertFalse(result);
        verify(userRepository).existsByUsername(username);
    }

    @Test
    void updateUserProfile_WithValidData_ShouldUpdateAndReturnUser() {
        // Given
        String username = "testuser";
        UserUpdateRequest updateRequest = new UserUpdateRequest();
        updateRequest.setUsername("updateduser");
        updateRequest.setEmail("updated@example.com");
        updateRequest.setDisplayName("Updated Name");
        updateRequest.setBio("Updated bio");
        updateRequest.setAvatarUrl("https://example.com/avatar.jpg");
        
        when(userRepository.findByUsername(username)).thenReturn(Optional.of(testUser));
        when(userRepository.existsByUsername("updateduser")).thenReturn(false);
        when(userRepository.existsByEmail("updated@example.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // When
        User result = userService.updateUserProfile(username, updateRequest);

        // Then
        assertNotNull(result);
        verify(userRepository).findByUsername(username);
        verify(userRepository).existsByUsername("updateduser");
        verify(userRepository).existsByEmail("updated@example.com");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void updateUserProfile_WithUserNotFound_ShouldThrowException() {
        // Given
        String username = "nonexistent";
        UserUpdateRequest updateRequest = new UserUpdateRequest();
        
        when(userRepository.findByUsername(username)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(RuntimeException.class, () -> {
            userService.updateUserProfile(username, updateRequest);
        });
        verify(userRepository).findByUsername(username);
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void updateUserProfile_WithExistingUsername_ShouldThrowException() {
        // Given
        String username = "testuser";
        UserUpdateRequest updateRequest = new UserUpdateRequest();
        updateRequest.setUsername("existinguser");
        
        when(userRepository.findByUsername(username)).thenReturn(Optional.of(testUser));
        when(userRepository.existsByUsername("existinguser")).thenReturn(true);

        // When & Then
        assertThrows(RuntimeException.class, () -> {
            userService.updateUserProfile(username, updateRequest);
        });
        verify(userRepository).findByUsername(username);
        verify(userRepository).existsByUsername("existinguser");
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void updateUserProfile_WithExistingEmail_ShouldThrowException() {
        // Given
        String username = "testuser";
        UserUpdateRequest updateRequest = new UserUpdateRequest();
        updateRequest.setEmail("existing@example.com");
        
        when(userRepository.findByUsername(username)).thenReturn(Optional.of(testUser));
        when(userRepository.existsByEmail("existing@example.com")).thenReturn(true);

        // When & Then
        assertThrows(RuntimeException.class, () -> {
            userService.updateUserProfile(username, updateRequest);
        });
        verify(userRepository).findByUsername(username);
        verify(userRepository).existsByEmail("existing@example.com");
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void updateUserProfile_WithPasswordUpdate_ShouldUpdatePassword() {
        // Given
        String username = "testuser";
        UserUpdateRequest updateRequest = new UserUpdateRequest();
        updateRequest.setCurrentPassword("currentPassword");
        updateRequest.setNewPassword("newPassword");
        
        when(userRepository.findByUsername(username)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("currentPassword", testUser.getPassword())).thenReturn(true);
        when(passwordEncoder.encode("newPassword")).thenReturn("encodedNewPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // When
        User result = userService.updateUserProfile(username, updateRequest);

        // Then
        assertNotNull(result);
        verify(userRepository).findByUsername(username);
        verify(passwordEncoder).matches("currentPassword", "encodedPassword");
        verify(passwordEncoder).encode("newPassword");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void updateUserProfile_WithPasswordUpdateButNoCurrentPassword_ShouldThrowException() {
        // Given
        String username = "testuser";
        UserUpdateRequest updateRequest = new UserUpdateRequest();
        updateRequest.setNewPassword("newPassword");
        // currentPassword is null
        
        when(userRepository.findByUsername(username)).thenReturn(Optional.of(testUser));

        // When & Then
        assertThrows(RuntimeException.class, () -> {
            userService.updateUserProfile(username, updateRequest);
        });
        verify(userRepository).findByUsername(username);
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void updateUserProfile_WithPasswordUpdateButEmptyCurrentPassword_ShouldThrowException() {
        // Given
        String username = "testuser";
        UserUpdateRequest updateRequest = new UserUpdateRequest();
        updateRequest.setCurrentPassword("");
        updateRequest.setNewPassword("newPassword");
        
        when(userRepository.findByUsername(username)).thenReturn(Optional.of(testUser));

        // When & Then
        assertThrows(RuntimeException.class, () -> {
            userService.updateUserProfile(username, updateRequest);
        });
        verify(userRepository).findByUsername(username);
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void updateUserProfile_WithIncorrectCurrentPassword_ShouldThrowException() {
        // Given
        String username = "testuser";
        UserUpdateRequest updateRequest = new UserUpdateRequest();
        updateRequest.setCurrentPassword("wrongPassword");
        updateRequest.setNewPassword("newPassword");
        
        when(userRepository.findByUsername(username)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("wrongPassword", testUser.getPassword())).thenReturn(false);

        // When & Then
        assertThrows(RuntimeException.class, () -> {
            userService.updateUserProfile(username, updateRequest);
        });
        verify(userRepository).findByUsername(username);
        verify(passwordEncoder).matches("wrongPassword", testUser.getPassword());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void updateUserProfile_WithSameUsernameAndEmail_ShouldNotCheckDuplicates() {
        // Given
        String username = "testuser";
        UserUpdateRequest updateRequest = new UserUpdateRequest();
        updateRequest.setUsername("testuser"); // Same username
        updateRequest.setEmail("test@example.com"); // Same email
        updateRequest.setDisplayName("Updated Name");
        
        when(userRepository.findByUsername(username)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // When
        User result = userService.updateUserProfile(username, updateRequest);

        // Then
        assertNotNull(result);
        verify(userRepository).findByUsername(username);
        verify(userRepository, never()).existsByUsername(anyString());
        verify(userRepository, never()).existsByEmail(anyString());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void findByUsername_WithNonExistingUsername_ShouldReturnEmpty() {
        // Given
        String username = "nonexistent";
        when(userRepository.findByUsername(username)).thenReturn(Optional.empty());

        // When
        Optional<User> result = userService.findByUsername(username);

        // Then
        assertFalse(result.isPresent());
        verify(userRepository).findByUsername(username);
    }

    @Test
    void updateUserProfile_WithEmptyNewPassword_ShouldNotUpdatePassword() {
        // Given
        String username = "testuser";
        UserUpdateRequest updateRequest = new UserUpdateRequest();
        updateRequest.setNewPassword(""); // Empty password
        updateRequest.setDisplayName("Updated Name");
        
        when(userRepository.findByUsername(username)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // When
        User result = userService.updateUserProfile(username, updateRequest);

        // Then
        assertNotNull(result);
        verify(userRepository).findByUsername(username);
        verify(passwordEncoder, never()).matches(anyString(), anyString());
        verify(passwordEncoder, never()).encode(anyString());
        verify(userRepository).save(any(User.class));
    }
}