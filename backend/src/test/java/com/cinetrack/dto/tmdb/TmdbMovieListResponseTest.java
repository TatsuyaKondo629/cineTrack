package com.cinetrack.dto.tmdb;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class TmdbMovieListResponseTest {

    @Test
    void testDefaultConstructor() {
        TmdbMovieListResponse response = new TmdbMovieListResponse();
        
        assertNull(response.getPage());
        assertNull(response.getResults());
        assertNull(response.getTotalPages());
        assertNull(response.getTotalResults());
    }

    @Test
    void testGettersAndSetters() {
        TmdbMovieListResponse response = new TmdbMovieListResponse();
        
        List<TmdbMovieDto> results = List.of(
            new TmdbMovieDto(),
            new TmdbMovieDto()
        );
        
        response.setPage(1);
        response.setResults(results);
        response.setTotalPages(10);
        response.setTotalResults(200);
        
        assertEquals(1, response.getPage());
        assertEquals(results, response.getResults());
        assertEquals(10, response.getTotalPages());
        assertEquals(200, response.getTotalResults());
    }
}