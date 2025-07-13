package com.cinetrack.service;

import com.cinetrack.dto.tmdb.TmdbMovieDto;
import com.cinetrack.dto.tmdb.TmdbMovieListResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
public class TmdbService {
    
    @Autowired
    @Qualifier("tmdbWebClient")
    private WebClient tmdbWebClient;
    
    @Value("${tmdb.api-key}")
    private String apiKey;
    
    public Mono<TmdbMovieListResponse> getTrendingMovies(String timeWindow, Integer page) {
        return tmdbWebClient
                .get()
                .uri(uriBuilder -> uriBuilder
                        .path("/trending/movie/{time_window}")
                        .queryParam("api_key", apiKey)
                        .queryParam("page", page != null ? page : 1)
                        .queryParam("language", "ja-JP")
                        .build(timeWindow))
                .retrieve()
                .bodyToMono(TmdbMovieListResponse.class);
    }
    
    public Mono<TmdbMovieDto> getMovieDetails(Long movieId) {
        return tmdbWebClient
                .get()
                .uri(uriBuilder -> uriBuilder
                        .path("/movie/{movie_id}")
                        .queryParam("api_key", apiKey)
                        .queryParam("language", "ja-JP")
                        .build(movieId))
                .retrieve()
                .bodyToMono(TmdbMovieDto.class);
    }
    
    public Mono<TmdbMovieListResponse> searchMovies(String query, Integer page) {
        return tmdbWebClient
                .get()
                .uri(uriBuilder -> uriBuilder
                        .path("/search/movie")
                        .queryParam("api_key", apiKey)
                        .queryParam("query", query)
                        .queryParam("page", page != null ? page : 1)
                        .queryParam("language", "ja-JP")
                        .queryParam("include_adult", false)
                        .build())
                .retrieve()
                .bodyToMono(TmdbMovieListResponse.class);
    }
    
    public Mono<TmdbMovieListResponse> getPopularMovies(Integer page) {
        return tmdbWebClient
                .get()
                .uri(uriBuilder -> uriBuilder
                        .path("/movie/popular")
                        .queryParam("api_key", apiKey)
                        .queryParam("page", page != null ? page : 1)
                        .queryParam("language", "ja-JP")
                        .build())
                .retrieve()
                .bodyToMono(TmdbMovieListResponse.class);
    }
    
    public Mono<TmdbMovieListResponse> getNowPlayingMovies(Integer page) {
        return tmdbWebClient
                .get()
                .uri(uriBuilder -> uriBuilder
                        .path("/movie/now_playing")
                        .queryParam("api_key", apiKey)
                        .queryParam("page", page != null ? page : 1)
                        .queryParam("language", "ja-JP")
                        .queryParam("region", "JP")
                        .build())
                .retrieve()
                .bodyToMono(TmdbMovieListResponse.class);
    }
    
    public String getImageUrl(String imagePath, String size) {
        if (imagePath == null || imagePath.isEmpty()) {
            return null;
        }
        return "https://image.tmdb.org/t/p/" + size + imagePath;
    }
    
    public String getPosterUrl(String posterPath) {
        return getImageUrl(posterPath, "w500");
    }
    
    public String getBackdropUrl(String backdropPath) {
        return getImageUrl(backdropPath, "w1280");
    }
}