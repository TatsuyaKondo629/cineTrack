package com.cinetrack.controller;

import com.cinetrack.dto.ApiResponse;
import com.cinetrack.dto.tmdb.TmdbMovieDto;
import com.cinetrack.dto.tmdb.TmdbMovieListResponse;
import com.cinetrack.service.TmdbService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/movies")
@CrossOrigin(origins = "*")
public class MovieController {
    
    @Autowired
    private TmdbService tmdbService;
    
    @GetMapping("/trending")
    public Mono<ResponseEntity<ApiResponse<TmdbMovieListResponse>>> getTrendingMovies(
            @RequestParam(defaultValue = "day") String timeWindow,
            @RequestParam(defaultValue = "1") Integer page) {
        
        return tmdbService.getTrendingMovies(timeWindow, page)
                .map(movies -> ResponseEntity.ok(
                    ApiResponse.success("Trending movies retrieved successfully", movies)
                ))
                .onErrorReturn(ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to fetch trending movies")));
    }
    
    @GetMapping("/popular")
    public Mono<ResponseEntity<ApiResponse<TmdbMovieListResponse>>> getPopularMovies(
            @RequestParam(defaultValue = "1") Integer page) {
        
        return tmdbService.getPopularMovies(page)
                .map(movies -> ResponseEntity.ok(
                    ApiResponse.success("Popular movies retrieved successfully", movies)
                ))
                .onErrorReturn(ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to fetch popular movies")));
    }
    
    @GetMapping("/now-playing")
    public Mono<ResponseEntity<ApiResponse<TmdbMovieListResponse>>> getNowPlayingMovies(
            @RequestParam(defaultValue = "1") Integer page) {
        
        return tmdbService.getNowPlayingMovies(page)
                .map(movies -> ResponseEntity.ok(
                    ApiResponse.success("Now playing movies retrieved successfully", movies)
                ))
                .onErrorReturn(ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to fetch now playing movies")));
    }
    
    @GetMapping("/search")
    public Mono<ResponseEntity<ApiResponse<TmdbMovieListResponse>>> searchMovies(
            @RequestParam String query,
            @RequestParam(defaultValue = "1") Integer page) {
        
        if (query == null || query.trim().isEmpty()) {
            return Mono.just(ResponseEntity.badRequest()
                .body(ApiResponse.error("Search query cannot be empty")));
        }
        
        return tmdbService.searchMovies(query.trim(), page)
                .map(movies -> ResponseEntity.ok(
                    ApiResponse.success("Movies search completed successfully", movies)
                ))
                .onErrorReturn(ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to search movies")));
    }
    
    @GetMapping("/{movieId}")
    public Mono<ResponseEntity<ApiResponse<TmdbMovieDto>>> getMovieDetails(
            @PathVariable Long movieId) {
        
        return tmdbService.getMovieDetails(movieId)
                .map(movie -> ResponseEntity.ok(
                    ApiResponse.success("Movie details retrieved successfully", movie)
                ))
                .onErrorReturn(ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to fetch movie details")));
    }
}