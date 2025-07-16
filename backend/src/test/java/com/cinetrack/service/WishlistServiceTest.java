package com.cinetrack.service;

import com.cinetrack.dto.WishlistDto;
import com.cinetrack.entity.User;
import com.cinetrack.entity.Wishlist;
import com.cinetrack.repository.WishlistRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
class WishlistServiceTest {

    @Mock
    private WishlistRepository wishlistRepository;

    @InjectMocks
    private WishlistService wishlistService;

    private User testUser;
    private Wishlist wishlistItem1;
    private Wishlist wishlistItem2;
    private List<Wishlist> testWishlistItems;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");

        wishlistItem1 = new Wishlist();
        wishlistItem1.setId(1L);
        wishlistItem1.setUser(testUser);
        wishlistItem1.setTmdbMovieId(123456L);
        wishlistItem1.setMovieTitle("Test Movie 1");
        wishlistItem1.setMoviePosterPath("/test1.jpg");
        wishlistItem1.setMovieOverview("This is a test movie 1");
        wishlistItem1.setMovieReleaseDate("2024-01-01");
        wishlistItem1.setMovieVoteAverage(8.5);
        wishlistItem1.setCreatedAt(LocalDateTime.now().minusDays(2));

        wishlistItem2 = new Wishlist();
        wishlistItem2.setId(2L);
        wishlistItem2.setUser(testUser);
        wishlistItem2.setTmdbMovieId(789012L);
        wishlistItem2.setMovieTitle("Test Movie 2");
        wishlistItem2.setMoviePosterPath("/test2.jpg");
        wishlistItem2.setMovieOverview("This is a test movie 2");
        wishlistItem2.setMovieReleaseDate("2024-02-01");
        wishlistItem2.setMovieVoteAverage(7.8);
        wishlistItem2.setCreatedAt(LocalDateTime.now().minusDays(1));

        testWishlistItems = Arrays.asList(wishlistItem1, wishlistItem2);
    }

    @Test
    void getUserWishlist_WithWishlistItems_ShouldReturnWishlistDtoList() {
        // Given
        when(wishlistRepository.findByUserIdOrderByCreatedAtDesc(1L)).thenReturn(testWishlistItems);

        // When
        List<WishlistDto> result = wishlistService.getUserWishlist(testUser);

        // Then
        assertNotNull(result);
        assertEquals(2, result.size());
        
        WishlistDto dto1 = result.get(0);
        assertEquals(wishlistItem1.getId(), dto1.getId());
        assertEquals(wishlistItem1.getTmdbMovieId(), dto1.getTmdbMovieId());
        assertEquals(wishlistItem1.getMovieTitle(), dto1.getMovieTitle());
        assertEquals(wishlistItem1.getMoviePosterPath(), dto1.getMoviePosterPath());
        assertEquals(wishlistItem1.getMovieOverview(), dto1.getMovieOverview());
        assertEquals(wishlistItem1.getMovieReleaseDate(), dto1.getMovieReleaseDate());
        assertEquals(wishlistItem1.getMovieVoteAverage(), dto1.getMovieVoteAverage());
        assertEquals(wishlistItem1.getCreatedAt(), dto1.getCreatedAt());

        verify(wishlistRepository).findByUserIdOrderByCreatedAtDesc(1L);
    }

    @Test
    void getUserWishlist_WithEmptyWishlist_ShouldReturnEmptyList() {
        // Given
        when(wishlistRepository.findByUserIdOrderByCreatedAtDesc(1L)).thenReturn(List.of());

        // When
        List<WishlistDto> result = wishlistService.getUserWishlist(testUser);

        // Then
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(wishlistRepository).findByUserIdOrderByCreatedAtDesc(1L);
    }

    @Test
    void addToWishlist_WithNewMovie_ShouldReturnWishlistDto() {
        // Given
        Long tmdbMovieId = 999999L;
        String movieTitle = "New Movie";
        String posterPath = "/new.jpg";
        String overview = "New movie overview";
        String releaseDate = "2024-03-01";
        Double voteAverage = 9.0;

        when(wishlistRepository.existsByUserIdAndTmdbMovieId(1L, tmdbMovieId)).thenReturn(false);
        when(wishlistRepository.save(any(Wishlist.class))).thenAnswer(invocation -> {
            Wishlist saved = invocation.getArgument(0);
            saved.setId(3L);
            saved.setCreatedAt(LocalDateTime.now());
            return saved;
        });

        // When
        WishlistDto result = wishlistService.addToWishlist(testUser, tmdbMovieId, movieTitle, 
                                                          posterPath, overview, releaseDate, voteAverage);

        // Then
        assertNotNull(result);
        assertEquals(3L, result.getId());
        assertEquals(tmdbMovieId, result.getTmdbMovieId());
        assertEquals(movieTitle, result.getMovieTitle());
        assertEquals(posterPath, result.getMoviePosterPath());
        assertEquals(overview, result.getMovieOverview());
        assertEquals(releaseDate, result.getMovieReleaseDate());
        assertEquals(voteAverage, result.getMovieVoteAverage());
        assertNotNull(result.getCreatedAt());

        verify(wishlistRepository).existsByUserIdAndTmdbMovieId(1L, tmdbMovieId);
        verify(wishlistRepository).save(any(Wishlist.class));
    }

    @Test
    void addToWishlist_WithExistingMovie_ShouldThrowException() {
        // Given
        Long tmdbMovieId = 123456L;
        String movieTitle = "Existing Movie";
        when(wishlistRepository.existsByUserIdAndTmdbMovieId(1L, tmdbMovieId)).thenReturn(true);

        // When & Then
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            wishlistService.addToWishlist(testUser, tmdbMovieId, movieTitle, null, null, null, null);
        });

        assertEquals("Movie is already in wishlist", exception.getMessage());
        verify(wishlistRepository).existsByUserIdAndTmdbMovieId(1L, tmdbMovieId);
        verify(wishlistRepository, never()).save(any(Wishlist.class));
    }

    @Test
    void removeFromWishlist_WithExistingMovie_ShouldDeleteMovie() {
        // Given
        Long tmdbMovieId = 123456L;
        when(wishlistRepository.findByUserIdAndTmdbMovieId(1L, tmdbMovieId)).thenReturn(Optional.of(wishlistItem1));

        // When
        wishlistService.removeFromWishlist(testUser, tmdbMovieId);

        // Then
        verify(wishlistRepository).findByUserIdAndTmdbMovieId(1L, tmdbMovieId);
        verify(wishlistRepository).delete(wishlistItem1);
    }

    @Test
    void removeFromWishlist_WithNonExistingMovie_ShouldThrowException() {
        // Given
        Long tmdbMovieId = 999999L;
        when(wishlistRepository.findByUserIdAndTmdbMovieId(1L, tmdbMovieId)).thenReturn(Optional.empty());

        // When & Then
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            wishlistService.removeFromWishlist(testUser, tmdbMovieId);
        });

        assertEquals("Movie not found in wishlist", exception.getMessage());
        verify(wishlistRepository).findByUserIdAndTmdbMovieId(1L, tmdbMovieId);
        verify(wishlistRepository, never()).delete(any(Wishlist.class));
    }

    @Test
    void isInWishlist_WithExistingMovie_ShouldReturnTrue() {
        // Given
        Long tmdbMovieId = 123456L;
        when(wishlistRepository.existsByUserIdAndTmdbMovieId(1L, tmdbMovieId)).thenReturn(true);

        // When
        boolean result = wishlistService.isInWishlist(testUser, tmdbMovieId);

        // Then
        assertTrue(result);
        verify(wishlistRepository).existsByUserIdAndTmdbMovieId(1L, tmdbMovieId);
    }

    @Test
    void isInWishlist_WithNonExistingMovie_ShouldReturnFalse() {
        // Given
        Long tmdbMovieId = 999999L;
        when(wishlistRepository.existsByUserIdAndTmdbMovieId(1L, tmdbMovieId)).thenReturn(false);

        // When
        boolean result = wishlistService.isInWishlist(testUser, tmdbMovieId);

        // Then
        assertFalse(result);
        verify(wishlistRepository).existsByUserIdAndTmdbMovieId(1L, tmdbMovieId);
    }

    @Test
    void getWishlistCount_WithWishlistItems_ShouldReturnCount() {
        // Given
        when(wishlistRepository.countByUserId(1L)).thenReturn(5L);

        // When
        long result = wishlistService.getWishlistCount(testUser);

        // Then
        assertEquals(5L, result);
        verify(wishlistRepository).countByUserId(1L);
    }

    @Test
    void getWishlistCount_WithEmptyWishlist_ShouldReturnZero() {
        // Given
        when(wishlistRepository.countByUserId(1L)).thenReturn(0L);

        // When
        long result = wishlistService.getWishlistCount(testUser);

        // Then
        assertEquals(0L, result);
        verify(wishlistRepository).countByUserId(1L);
    }

    @Test
    void clearWishlist_WithWishlistItems_ShouldDeleteAllItems() {
        // Given
        when(wishlistRepository.findByUserIdOrderByCreatedAtDesc(1L)).thenReturn(testWishlistItems);

        // When
        wishlistService.clearWishlist(testUser);

        // Then
        verify(wishlistRepository).findByUserIdOrderByCreatedAtDesc(1L);
        verify(wishlistRepository).deleteAll(testWishlistItems);
    }

    @Test
    void clearWishlist_WithEmptyWishlist_ShouldCallDeleteAll() {
        // Given
        List<Wishlist> emptyList = List.of();
        when(wishlistRepository.findByUserIdOrderByCreatedAtDesc(1L)).thenReturn(emptyList);

        // When
        wishlistService.clearWishlist(testUser);

        // Then
        verify(wishlistRepository).findByUserIdOrderByCreatedAtDesc(1L);
        verify(wishlistRepository).deleteAll(emptyList);
    }
}