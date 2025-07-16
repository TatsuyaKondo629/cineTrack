package com.cinetrack.controller;

import com.cinetrack.dto.WishlistDto;
import com.cinetrack.entity.User;
import com.cinetrack.service.UserService;
import com.cinetrack.service.WishlistService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import com.cinetrack.config.TestSecurityConfig;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(WishlistController.class)
@Import(TestSecurityConfig.class)
@ActiveProfiles("test")
class WishlistControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private WishlistService wishlistService;

    @MockBean
    private UserService userService;

    @Autowired
    private ObjectMapper objectMapper;

    private User testUser;
    private WishlistDto testWishlistItem;
    private List<WishlistDto> testWishlist;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");

        testWishlistItem = new WishlistDto();
        testWishlistItem.setId(1L);
        testWishlistItem.setTmdbMovieId(123L);
        testWishlistItem.setMovieTitle("Test Movie");
        testWishlistItem.setMoviePosterPath("/poster.jpg");
        testWishlistItem.setMovieOverview("Test overview");
        testWishlistItem.setMovieReleaseDate("2024-01-01");
        testWishlistItem.setMovieVoteAverage(8.5);
        testWishlistItem.setCreatedAt(LocalDateTime.now());

        testWishlist = Arrays.asList(testWishlistItem);
    }

    @Test
    @WithMockUser(username = "testuser")
    void getUserWishlist_ShouldReturnWishlist() throws Exception {
        // Given
        when(userService.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(wishlistService.getUserWishlist(testUser)).thenReturn(testWishlist);

        // When & Then
        mockMvc.perform(get("/wishlist"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Wishlist retrieved successfully"))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].id").value(1))
                .andExpect(jsonPath("$.data[0].tmdbMovieId").value(123))
                .andExpect(jsonPath("$.data[0].movieTitle").value("Test Movie"));

        verify(userService).findByUsername("testuser");
        verify(wishlistService).getUserWishlist(testUser);
    }

    @Test
    @WithMockUser(username = "testuser")
    void getUserWishlist_WithUserNotFound_ShouldReturnError() throws Exception {
        // Given
        when(userService.findByUsername("testuser")).thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(get("/wishlist"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Failed to retrieve wishlist: User not found"));

        verify(userService).findByUsername("testuser");
        verify(wishlistService, never()).getUserWishlist(any(User.class));
    }

    @Test
    @WithMockUser(username = "testuser")
    void addToWishlist_ShouldAddMovieToWishlist() throws Exception {
        // Given
        Map<String, Object> request = new HashMap<>();
        request.put("tmdbMovieId", 123L);
        request.put("movieTitle", "Test Movie");
        request.put("moviePosterPath", "/poster.jpg");
        request.put("movieOverview", "Test overview");
        request.put("movieReleaseDate", "2024-01-01");
        request.put("movieVoteAverage", 8.5);

        when(userService.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(wishlistService.addToWishlist(
                eq(testUser), eq(123L), eq("Test Movie"), 
                eq("/poster.jpg"), eq("Test overview"), 
                eq("2024-01-01"), eq(8.5)
        )).thenReturn(testWishlistItem);

        // When & Then
        mockMvc.perform(post("/wishlist/add")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Movie added to wishlist successfully"))
                .andExpect(jsonPath("$.data.tmdbMovieId").value(123))
                .andExpect(jsonPath("$.data.movieTitle").value("Test Movie"));

        verify(userService).findByUsername("testuser");
        verify(wishlistService).addToWishlist(
                testUser, 123L, "Test Movie", "/poster.jpg", 
                "Test overview", "2024-01-01", 8.5
        );
    }

    @Test
    @WithMockUser(username = "testuser")
    void addToWishlist_WithDuplicateMovie_ShouldReturnBadRequest() throws Exception {
        // Given
        Map<String, Object> request = new HashMap<>();
        request.put("tmdbMovieId", 123L);
        request.put("movieTitle", "Test Movie");
        request.put("moviePosterPath", "/poster.jpg");
        request.put("movieOverview", "Test overview");
        request.put("movieReleaseDate", "2024-01-01");
        request.put("movieVoteAverage", 8.5);

        when(userService.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(wishlistService.addToWishlist(
                eq(testUser), eq(123L), eq("Test Movie"), 
                eq("/poster.jpg"), eq("Test overview"), 
                eq("2024-01-01"), eq(8.5)
        )).thenThrow(new IllegalArgumentException("Movie is already in wishlist"));

        // When & Then
        mockMvc.perform(post("/wishlist/add")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Movie is already in wishlist"));

        verify(userService).findByUsername("testuser");
        verify(wishlistService).addToWishlist(
                testUser, 123L, "Test Movie", "/poster.jpg", 
                "Test overview", "2024-01-01", 8.5
        );
    }

    @Test
    @WithMockUser(username = "testuser")
    void removeFromWishlist_ShouldRemoveMovie() throws Exception {
        // Given
        when(userService.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        doNothing().when(wishlistService).removeFromWishlist(testUser, 123L);

        // When & Then
        mockMvc.perform(delete("/wishlist/remove/123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Movie removed from wishlist successfully"));

        verify(userService).findByUsername("testuser");
        verify(wishlistService).removeFromWishlist(testUser, 123L);
    }

    @Test
    @WithMockUser(username = "testuser")
    void removeFromWishlist_WithMovieNotFound_ShouldReturnBadRequest() throws Exception {
        // Given
        when(userService.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        doThrow(new IllegalArgumentException("Movie not found in wishlist"))
                .when(wishlistService).removeFromWishlist(testUser, 123L);

        // When & Then
        mockMvc.perform(delete("/wishlist/remove/123"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Movie not found in wishlist"));

        verify(userService).findByUsername("testuser");
        verify(wishlistService).removeFromWishlist(testUser, 123L);
    }

    @Test
    @WithMockUser(username = "testuser")
    void checkInWishlist_WithMovieInWishlist_ShouldReturnTrue() throws Exception {
        // Given
        when(userService.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(wishlistService.isInWishlist(testUser, 123L)).thenReturn(true);

        // When & Then
        mockMvc.perform(get("/wishlist/check/123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Wishlist check completed"))
                .andExpect(jsonPath("$.data").value(true));

        verify(userService).findByUsername("testuser");
        verify(wishlistService).isInWishlist(testUser, 123L);
    }

    @Test
    @WithMockUser(username = "testuser")
    void checkInWishlist_WithMovieNotInWishlist_ShouldReturnFalse() throws Exception {
        // Given
        when(userService.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(wishlistService.isInWishlist(testUser, 123L)).thenReturn(false);

        // When & Then
        mockMvc.perform(get("/wishlist/check/123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Wishlist check completed"))
                .andExpect(jsonPath("$.data").value(false));

        verify(userService).findByUsername("testuser");
        verify(wishlistService).isInWishlist(testUser, 123L);
    }

    @Test
    @WithMockUser(username = "testuser")
    void getWishlistCount_ShouldReturnCount() throws Exception {
        // Given
        when(userService.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(wishlistService.getWishlistCount(testUser)).thenReturn(5L);

        // When & Then
        mockMvc.perform(get("/wishlist/count"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Wishlist count retrieved successfully"))
                .andExpect(jsonPath("$.data").value(5));

        verify(userService).findByUsername("testuser");
        verify(wishlistService).getWishlistCount(testUser);
    }

    @Test
    @WithMockUser(username = "testuser")
    void clearWishlist_ShouldClearAllItems() throws Exception {
        // Given
        when(userService.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        doNothing().when(wishlistService).clearWishlist(testUser);

        // When & Then
        mockMvc.perform(delete("/wishlist/clear"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Wishlist cleared successfully"));

        verify(userService).findByUsername("testuser");
        verify(wishlistService).clearWishlist(testUser);
    }

    @Test
    @WithMockUser(username = "testuser")
    void addToWishlist_WithServiceException_ShouldReturnInternalServerError() throws Exception {
        // Given
        Map<String, Object> request = new HashMap<>();
        request.put("tmdbMovieId", 123L);
        request.put("movieTitle", "Test Movie");
        request.put("moviePosterPath", "/poster.jpg");
        request.put("movieOverview", "Test overview");
        request.put("movieReleaseDate", "2024-01-01");
        request.put("movieVoteAverage", 8.5);

        when(userService.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(wishlistService.addToWishlist(
                eq(testUser), eq(123L), eq("Test Movie"), 
                eq("/poster.jpg"), eq("Test overview"), 
                eq("2024-01-01"), eq(8.5)
        )).thenThrow(new RuntimeException("Database error"));

        // When & Then
        mockMvc.perform(post("/wishlist/add")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Failed to add movie to wishlist: Database error"));

        verify(userService).findByUsername("testuser");
        verify(wishlistService).addToWishlist(
                testUser, 123L, "Test Movie", "/poster.jpg", 
                "Test overview", "2024-01-01", 8.5
        );
    }

    @Test
    @WithMockUser(username = "testuser")
    void checkInWishlist_WithServiceException_ShouldReturnInternalServerError() throws Exception {
        // Given
        when(userService.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(wishlistService.isInWishlist(testUser, 123L))
                .thenThrow(new RuntimeException("Database error"));

        // When & Then
        mockMvc.perform(get("/wishlist/check/123"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Failed to check wishlist: Database error"));

        verify(userService).findByUsername("testuser");
        verify(wishlistService).isInWishlist(testUser, 123L);
    }

    @Test
    @WithMockUser(username = "testuser")
    void addToWishlist_WithUserNotFound_ShouldReturnInternalServerError() throws Exception {
        // Given
        Map<String, Object> request = new HashMap<>();
        request.put("tmdbMovieId", 123L);
        request.put("movieTitle", "Test Movie");
        request.put("moviePosterPath", "/poster.jpg");
        request.put("movieOverview", "Test overview");
        request.put("movieReleaseDate", "2024-01-01");
        request.put("movieVoteAverage", 8.5);

        when(userService.findByUsername("testuser")).thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(post("/wishlist/add")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Failed to add movie to wishlist: User not found"));

        verify(userService).findByUsername("testuser");
        verify(wishlistService, never()).addToWishlist(any(), any(), any(), any(), any(), any(), any());
    }

    @Test
    @WithMockUser(username = "testuser")
    void removeFromWishlist_WithUserNotFound_ShouldReturnInternalServerError() throws Exception {
        // Given
        when(userService.findByUsername("testuser")).thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(delete("/wishlist/remove/123"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Failed to remove movie from wishlist: User not found"));

        verify(userService).findByUsername("testuser");
        verify(wishlistService, never()).removeFromWishlist(any(), any());
    }

    @Test
    @WithMockUser(username = "testuser")
    void removeFromWishlist_WithServiceException_ShouldReturnInternalServerError() throws Exception {
        // Given
        when(userService.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        doThrow(new RuntimeException("Database error"))
                .when(wishlistService).removeFromWishlist(testUser, 123L);

        // When & Then
        mockMvc.perform(delete("/wishlist/remove/123"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Failed to remove movie from wishlist: Database error"));

        verify(userService).findByUsername("testuser");
        verify(wishlistService).removeFromWishlist(testUser, 123L);
    }

    @Test
    @WithMockUser(username = "testuser")
    void checkInWishlist_WithUserNotFound_ShouldReturnInternalServerError() throws Exception {
        // Given
        when(userService.findByUsername("testuser")).thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(get("/wishlist/check/123"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Failed to check wishlist: User not found"));

        verify(userService).findByUsername("testuser");
        verify(wishlistService, never()).isInWishlist(any(), any());
    }

    @Test
    @WithMockUser(username = "testuser")
    void getWishlistCount_WithUserNotFound_ShouldReturnInternalServerError() throws Exception {
        // Given
        when(userService.findByUsername("testuser")).thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(get("/wishlist/count"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Failed to get wishlist count: User not found"));

        verify(userService).findByUsername("testuser");
        verify(wishlistService, never()).getWishlistCount(any());
    }

    @Test
    @WithMockUser(username = "testuser")
    void getWishlistCount_WithServiceException_ShouldReturnInternalServerError() throws Exception {
        // Given
        when(userService.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(wishlistService.getWishlistCount(testUser))
                .thenThrow(new RuntimeException("Database error"));

        // When & Then
        mockMvc.perform(get("/wishlist/count"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Failed to get wishlist count: Database error"));

        verify(userService).findByUsername("testuser");
        verify(wishlistService).getWishlistCount(testUser);
    }

    @Test
    @WithMockUser(username = "testuser")
    void clearWishlist_WithUserNotFound_ShouldReturnInternalServerError() throws Exception {
        // Given
        when(userService.findByUsername("testuser")).thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(delete("/wishlist/clear"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Failed to clear wishlist: User not found"));

        verify(userService).findByUsername("testuser");
        verify(wishlistService, never()).clearWishlist(any());
    }

    @Test
    @WithMockUser(username = "testuser")
    void clearWishlist_WithServiceException_ShouldReturnInternalServerError() throws Exception {
        // Given
        when(userService.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        doThrow(new RuntimeException("Database error"))
                .when(wishlistService).clearWishlist(testUser);

        // When & Then
        mockMvc.perform(delete("/wishlist/clear"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Failed to clear wishlist: Database error"));

        verify(userService).findByUsername("testuser");
        verify(wishlistService).clearWishlist(testUser);
    }

    @Test
    @WithMockUser(username = "testuser")
    void addToWishlist_WithNullMovieVoteAverage_ShouldAddMovieToWishlist() throws Exception {
        // Given - movieVoteAverage is null to cover the null branch
        Map<String, Object> request = new HashMap<>();
        request.put("tmdbMovieId", 123L);
        request.put("movieTitle", "Test Movie");
        request.put("moviePosterPath", "/poster.jpg");
        request.put("movieOverview", "Test overview");
        request.put("movieReleaseDate", "2024-01-01");
        request.put("movieVoteAverage", null); // This triggers the null branch

        when(userService.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(wishlistService.addToWishlist(
                eq(testUser), eq(123L), eq("Test Movie"), 
                eq("/poster.jpg"), eq("Test overview"), 
                eq("2024-01-01"), eq(null) // null movieVoteAverage
        )).thenReturn(testWishlistItem);

        // When & Then
        mockMvc.perform(post("/wishlist/add")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Movie added to wishlist successfully"));

        verify(userService).findByUsername("testuser");
        verify(wishlistService).addToWishlist(
                testUser, 123L, "Test Movie", "/poster.jpg", 
                "Test overview", "2024-01-01", null
        );
    }
}