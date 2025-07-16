package com.cinetrack.entity;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class WishlistTest {

    @Test
    void testDefaultConstructor() {
        Wishlist wishlist = new Wishlist();
        
        assertNull(wishlist.getId());
        assertNull(wishlist.getUser());
        assertNull(wishlist.getTmdbMovieId());
        assertNull(wishlist.getMovieTitle());
        assertNull(wishlist.getMoviePosterPath());
        assertNull(wishlist.getMovieOverview());
        assertNull(wishlist.getMovieReleaseDate());
        assertNull(wishlist.getMovieVoteAverage());
        assertNull(wishlist.getCreatedAt());
        assertNull(wishlist.getUpdatedAt());
    }
    
    @Test
    void testParameterizedConstructor() {
        User user = new User();
        user.setId(1L);
        user.setUsername("testuser");
        
        Long tmdbMovieId = 12345L;
        String movieTitle = "Test Movie";
        String moviePosterPath = "/path/to/poster.jpg";
        String movieOverview = "Test overview";
        String movieReleaseDate = "2024-01-01";
        Double movieVoteAverage = 8.5;
        
        Wishlist wishlist = new Wishlist(user, tmdbMovieId, movieTitle, moviePosterPath, 
                                       movieOverview, movieReleaseDate, movieVoteAverage);
        
        assertEquals(user, wishlist.getUser());
        assertEquals(tmdbMovieId, wishlist.getTmdbMovieId());
        assertEquals(movieTitle, wishlist.getMovieTitle());
        assertEquals(moviePosterPath, wishlist.getMoviePosterPath());
        assertEquals(movieOverview, wishlist.getMovieOverview());
        assertEquals(movieReleaseDate, wishlist.getMovieReleaseDate());
        assertEquals(movieVoteAverage, wishlist.getMovieVoteAverage());
    }
    
    @Test
    void testGettersAndSetters() {
        Wishlist wishlist = new Wishlist();
        User user = new User();
        LocalDateTime now = LocalDateTime.now();
        
        wishlist.setId(1L);
        wishlist.setUser(user);
        wishlist.setTmdbMovieId(12345L);
        wishlist.setMovieTitle("Test Movie");
        wishlist.setMoviePosterPath("/path/to/poster.jpg");
        wishlist.setMovieOverview("Test overview");
        wishlist.setMovieReleaseDate("2024-01-01");
        wishlist.setMovieVoteAverage(8.5);
        wishlist.setCreatedAt(now);
        wishlist.setUpdatedAt(now);
        
        assertEquals(1L, wishlist.getId());
        assertEquals(user, wishlist.getUser());
        assertEquals(12345L, wishlist.getTmdbMovieId());
        assertEquals("Test Movie", wishlist.getMovieTitle());
        assertEquals("/path/to/poster.jpg", wishlist.getMoviePosterPath());
        assertEquals("Test overview", wishlist.getMovieOverview());
        assertEquals("2024-01-01", wishlist.getMovieReleaseDate());
        assertEquals(8.5, wishlist.getMovieVoteAverage());
        assertEquals(now, wishlist.getCreatedAt());
        assertEquals(now, wishlist.getUpdatedAt());
    }
    
    @Test
    void testOnCreateCallback() {
        Wishlist wishlist = new Wishlist();
        wishlist.onCreate();
        
        assertNotNull(wishlist.getCreatedAt());
        assertNotNull(wishlist.getUpdatedAt());
        // Check that both timestamps are very close (within 1 second)
        assertTrue(Math.abs(wishlist.getCreatedAt().getNano() - wishlist.getUpdatedAt().getNano()) < 1000000);
    }
    
    @Test
    void testOnUpdateCallback() {
        Wishlist wishlist = new Wishlist();
        LocalDateTime originalTime = LocalDateTime.now().minusDays(1);
        wishlist.setCreatedAt(originalTime);
        wishlist.setUpdatedAt(originalTime);
        
        wishlist.onUpdate();
        
        assertEquals(originalTime, wishlist.getCreatedAt());
        assertTrue(wishlist.getUpdatedAt().isAfter(originalTime));
    }
}