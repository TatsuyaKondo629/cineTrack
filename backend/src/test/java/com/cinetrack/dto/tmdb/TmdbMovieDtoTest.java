package com.cinetrack.dto.tmdb;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class TmdbMovieDtoTest {

    @Test
    void testDefaultConstructor() {
        TmdbMovieDto dto = new TmdbMovieDto();
        
        assertNull(dto.getId());
        assertNull(dto.getTitle());
        assertNull(dto.getOriginalTitle());
        assertNull(dto.getOverview());
        assertNull(dto.getReleaseDate());
        assertNull(dto.getPosterPath());
        assertNull(dto.getBackdropPath());
        assertNull(dto.getVoteAverage());
        assertNull(dto.getVoteCount());
        assertNull(dto.getAdult());
        assertNull(dto.getGenreIds());
        assertNull(dto.getPopularity());
        assertNull(dto.getOriginalLanguage());
        assertNull(dto.getRuntime());
        assertNull(dto.getGenres());
        assertNull(dto.getProductionCompanies());
    }

    @Test
    void testGettersAndSetters() {
        TmdbMovieDto dto = new TmdbMovieDto();
        
        List<Integer> genreIds = List.of(1, 2, 3);
        List<TmdbGenreDto> genres = List.of(new TmdbGenreDto(1, "Action"));
        List<TmdbProductionCompanyDto> productionCompanies = List.of(new TmdbProductionCompanyDto());
        
        dto.setId(123L);
        dto.setTitle("Test Movie");
        dto.setOriginalTitle("Original Test Movie");
        dto.setOverview("This is a test movie");
        dto.setReleaseDate("2024-01-01");
        dto.setPosterPath("/poster.jpg");
        dto.setBackdropPath("/backdrop.jpg");
        dto.setVoteAverage(8.5);
        dto.setVoteCount(1000);
        dto.setAdult(false);
        dto.setGenreIds(genreIds);
        dto.setPopularity(100.0);
        dto.setOriginalLanguage("en");
        dto.setRuntime(120);
        dto.setGenres(genres);
        dto.setProductionCompanies(productionCompanies);
        
        assertEquals(123L, dto.getId());
        assertEquals("Test Movie", dto.getTitle());
        assertEquals("Original Test Movie", dto.getOriginalTitle());
        assertEquals("This is a test movie", dto.getOverview());
        assertEquals("2024-01-01", dto.getReleaseDate());
        assertEquals("/poster.jpg", dto.getPosterPath());
        assertEquals("/backdrop.jpg", dto.getBackdropPath());
        assertEquals(8.5, dto.getVoteAverage());
        assertEquals(1000, dto.getVoteCount());
        assertFalse(dto.getAdult());
        assertEquals(genreIds, dto.getGenreIds());
        assertEquals(100.0, dto.getPopularity());
        assertEquals("en", dto.getOriginalLanguage());
        assertEquals(120, dto.getRuntime());
        assertEquals(genres, dto.getGenres());
        assertEquals(productionCompanies, dto.getProductionCompanies());
    }
}