package com.cinetrack.controller;

import com.cinetrack.dto.tmdb.TmdbMovieDto;
import com.cinetrack.dto.tmdb.TmdbMovieListResponse;
import com.cinetrack.service.TmdbService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import reactor.core.publisher.Mono;

import java.util.Arrays;
import java.util.Collections;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.asyncDispatch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import org.springframework.test.context.ActiveProfiles;

@WebMvcTest(controllers = MovieController.class, excludeAutoConfiguration = {
    org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class,
    org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration.class
}, excludeFilters = @org.springframework.context.annotation.ComponentScan.Filter(
    type = org.springframework.context.annotation.FilterType.ASSIGNABLE_TYPE, 
    classes = {com.cinetrack.security.JwtAuthenticationFilter.class}
))
@ActiveProfiles("test")
class MovieControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TmdbService tmdbService;

    private TmdbMovieListResponse mockMovieListResponse;
    private TmdbMovieDto mockMovie;

    @BeforeEach
    void setUp() {
        mockMovie = new TmdbMovieDto();
        mockMovie.setId(123L);
        mockMovie.setTitle("Test Movie");
        mockMovie.setOverview("Test Overview");
        mockMovie.setReleaseDate("2024-01-01");
        mockMovie.setVoteAverage(8.5);
        mockMovie.setPosterPath("/test-poster.jpg");

        mockMovieListResponse = new TmdbMovieListResponse();
        mockMovieListResponse.setPage(1);
        mockMovieListResponse.setTotalPages(1);
        mockMovieListResponse.setTotalResults(1);
        mockMovieListResponse.setResults(Arrays.asList(mockMovie));
    }

    @Test
    void getTrendingMovies_WithValidParameters_ShouldReturnMovies() throws Exception {
        // Given
        when(tmdbService.getTrendingMovies("day", 1)).thenReturn(Mono.just(mockMovieListResponse));

        // When & Then
        MvcResult result = mockMvc.perform(get("/movies/trending")
                .param("timeWindow", "day")
                .param("page", "1"))
                .andExpect(request().asyncStarted())
                .andReturn();
                
        mockMvc.perform(asyncDispatch(result))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Trending movies retrieved successfully"))
                .andExpect(jsonPath("$.data.page").value(1))
                .andExpect(jsonPath("$.data.results").isArray())
                .andExpect(jsonPath("$.data.results[0].id").value(123))
                .andExpect(jsonPath("$.data.results[0].title").value("Test Movie"));
    }

    @Test
    void getTrendingMovies_WithDefaultParameters_ShouldReturnMovies() throws Exception {
        // Given
        when(tmdbService.getTrendingMovies("day", 1)).thenReturn(Mono.just(mockMovieListResponse));

        // When & Then
        MvcResult result = mockMvc.perform(get("/movies/trending"))
                .andExpect(request().asyncStarted())
                .andReturn();
                
        mockMvc.perform(asyncDispatch(result))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.page").value(1));
    }

    @Test
    void getPopularMovies_WithValidParameters_ShouldReturnMovies() throws Exception {
        // Given
        when(tmdbService.getPopularMovies(1)).thenReturn(Mono.just(mockMovieListResponse));

        // When & Then
        MvcResult result = mockMvc.perform(get("/movies/popular")
                .param("page", "1"))
                .andExpect(request().asyncStarted())
                .andReturn();
                
        mockMvc.perform(asyncDispatch(result))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Popular movies retrieved successfully"))
                .andExpect(jsonPath("$.data.results[0].title").value("Test Movie"));
    }

    @Test
    void getNowPlayingMovies_WithValidParameters_ShouldReturnMovies() throws Exception {
        // Given
        when(tmdbService.getNowPlayingMovies(1)).thenReturn(Mono.just(mockMovieListResponse));

        // When & Then
        MvcResult result = mockMvc.perform(get("/movies/now-playing")
                .param("page", "1"))
                .andExpect(request().asyncStarted())
                .andReturn();
                
        mockMvc.perform(asyncDispatch(result))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Now playing movies retrieved successfully"))
                .andExpect(jsonPath("$.data.results[0].title").value("Test Movie"));
    }

    @Test
    void getMovieDetails_WithValidId_ShouldReturnMovie() throws Exception {
        // Given
        when(tmdbService.getMovieDetails(123L)).thenReturn(Mono.just(mockMovie));

        // When & Then
        MvcResult result = mockMvc.perform(get("/movies/123"))
                .andExpect(request().asyncStarted())
                .andReturn();
                
        mockMvc.perform(asyncDispatch(result))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Movie details retrieved successfully"))
                .andExpect(jsonPath("$.data.id").value(123))
                .andExpect(jsonPath("$.data.title").value("Test Movie"))
                .andExpect(jsonPath("$.data.overview").value("Test Overview"));
    }

    @Test
    void searchMovies_WithValidQuery_ShouldReturnMovies() throws Exception {
        // Given
        when(tmdbService.searchMovies("test query", 1)).thenReturn(Mono.just(mockMovieListResponse));

        // When & Then
        MvcResult result = mockMvc.perform(get("/movies/search")
                .param("query", "test query")
                .param("page", "1"))
                .andExpect(request().asyncStarted())
                .andReturn();
                
        mockMvc.perform(asyncDispatch(result))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Movies search completed successfully"))
                .andExpect(jsonPath("$.data.results[0].title").value("Test Movie"));
    }

    @Test
    void searchMovies_WithEmptyQuery_ShouldReturnBadRequest() throws Exception {
        // When & Then
        MvcResult result = mockMvc.perform(get("/movies/search")
                .param("query", "")
                .param("page", "1"))
                .andExpect(request().asyncStarted())
                .andReturn();
                
        mockMvc.perform(asyncDispatch(result))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Search query cannot be empty"));
    }

    @Test
    void searchMovies_WithWhitespaceQuery_ShouldReturnBadRequest() throws Exception {
        // When & Then
        MvcResult result = mockMvc.perform(get("/movies/search")
                .param("query", "   ")
                .param("page", "1"))
                .andExpect(request().asyncStarted())
                .andReturn();
                
        mockMvc.perform(asyncDispatch(result))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Search query cannot be empty"));
    }

    @Test
    void searchMovies_WithoutQuery_ShouldReturnBadRequest() throws Exception {
        // When & Then
        mockMvc.perform(get("/movies/search")
                .param("page", "1"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void searchMovies_WithError_ShouldReturnInternalServerError() throws Exception {
        // Given
        when(tmdbService.searchMovies("test query", 1)).thenReturn(Mono.error(new RuntimeException("API Error")));

        // When & Then
        MvcResult result = mockMvc.perform(get("/movies/search")
                .param("query", "test query")
                .param("page", "1"))
                .andExpect(request().asyncStarted())
                .andReturn();
                
        mockMvc.perform(asyncDispatch(result))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Failed to search movies"));
    }

    @Test
    void getTrendingMovies_WithEmptyResults_ShouldReturnEmptyArray() throws Exception {
        // Given
        TmdbMovieListResponse emptyResponse = new TmdbMovieListResponse();
        emptyResponse.setPage(1);
        emptyResponse.setTotalPages(1);
        emptyResponse.setTotalResults(0);
        emptyResponse.setResults(Collections.emptyList());
        
        when(tmdbService.getTrendingMovies("day", 1)).thenReturn(Mono.just(emptyResponse));

        // When & Then
        MvcResult result = mockMvc.perform(get("/movies/trending"))
                .andExpect(request().asyncStarted())
                .andReturn();
                
        mockMvc.perform(asyncDispatch(result))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.results").isEmpty());
    }

    @Test
    void getTrendingMovies_WithError_ShouldReturnInternalServerError() throws Exception {
        // Given
        when(tmdbService.getTrendingMovies("day", 1)).thenReturn(Mono.error(new RuntimeException("API Error")));

        // When & Then
        MvcResult result = mockMvc.perform(get("/movies/trending"))
                .andExpect(request().asyncStarted())
                .andReturn();
                
        mockMvc.perform(asyncDispatch(result))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Failed to fetch trending movies"));
    }

    @Test
    void getMovieDetails_WithError_ShouldReturnInternalServerError() throws Exception {
        // Given
        when(tmdbService.getMovieDetails(123L)).thenReturn(Mono.error(new RuntimeException("API Error")));

        // When & Then
        MvcResult result = mockMvc.perform(get("/movies/123"))
                .andExpect(request().asyncStarted())
                .andReturn();
                
        mockMvc.perform(asyncDispatch(result))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Failed to fetch movie details"));
    }
}