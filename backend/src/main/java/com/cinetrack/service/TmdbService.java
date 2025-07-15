package com.cinetrack.service;

import com.cinetrack.dto.tmdb.TmdbMovieDto;
import com.cinetrack.dto.tmdb.TmdbMovieListResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class TmdbService {
    
    private static final Logger logger = LoggerFactory.getLogger(TmdbService.class);
    
    @Autowired
    @Qualifier("tmdbWebClient")
    private WebClient tmdbWebClient;
    
    @Value("${tmdb.api-key}")
    private String apiKey;
    
    public Mono<TmdbMovieListResponse> getTrendingMovies(String timeWindow, Integer page) {
        logger.debug("TMDb API Key: {}", apiKey);
        // If no valid API key, return demo data
        if (apiKey == null || apiKey.isEmpty() || apiKey.equals("demo_api_key_please_replace_with_actual_key")) {
            logger.warn("Invalid API key detected, returning demo data");
            return Mono.just(createDemoMovieResponse());
        }
        
        return tmdbWebClient
                .get()
                .uri(uriBuilder -> uriBuilder
                        .path("/trending/movie/{time_window}")
                        .queryParam("api_key", apiKey)
                        .queryParam("page", page != null ? page : 1)
                        .queryParam("language", "ja-JP")
                        .build(timeWindow))
                .retrieve()
                .bodyToMono(TmdbMovieListResponse.class)
                .onErrorReturn(createDemoMovieResponse());
    }
    
    public Mono<TmdbMovieDto> getMovieDetails(Long movieId) {
        // If no valid API key, return demo data
        if (apiKey == null || apiKey.isEmpty() || apiKey.equals("demo_api_key_please_replace_with_actual_key")) {
            return Mono.just(createDemoMovieDto(movieId));
        }
        
        return tmdbWebClient
                .get()
                .uri(uriBuilder -> uriBuilder
                        .path("/movie/{movie_id}")
                        .queryParam("api_key", apiKey)
                        .queryParam("language", "ja-JP")
                        .build(movieId))
                .retrieve()
                .bodyToMono(TmdbMovieDto.class)
                .onErrorReturn(createDemoMovieDto(movieId));
    }
    
    public Mono<TmdbMovieListResponse> searchMovies(String query, Integer page) {
        // If no valid API key, return demo data
        if (apiKey == null || apiKey.isEmpty() || apiKey.equals("demo_api_key_please_replace_with_actual_key")) {
            return Mono.just(createDemoMovieResponse());
        }
        
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
                .bodyToMono(TmdbMovieListResponse.class)
                .onErrorReturn(createDemoMovieResponse());
    }
    
    public Mono<TmdbMovieListResponse> getPopularMovies(Integer page) {
        // If no valid API key, return demo data
        if (apiKey == null || apiKey.isEmpty() || apiKey.equals("demo_api_key_please_replace_with_actual_key")) {
            return Mono.just(createDemoMovieResponse());
        }
        
        return tmdbWebClient
                .get()
                .uri(uriBuilder -> uriBuilder
                        .path("/movie/popular")
                        .queryParam("api_key", apiKey)
                        .queryParam("page", page != null ? page : 1)
                        .queryParam("language", "ja-JP")
                        .build())
                .retrieve()
                .bodyToMono(TmdbMovieListResponse.class)
                .onErrorReturn(createDemoMovieResponse());
    }
    
    public Mono<TmdbMovieListResponse> getNowPlayingMovies(Integer page) {
        // If no valid API key, return demo data
        if (apiKey == null || apiKey.isEmpty() || apiKey.equals("demo_api_key_please_replace_with_actual_key")) {
            return Mono.just(createDemoMovieResponse());
        }
        
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
                .bodyToMono(TmdbMovieListResponse.class)
                .onErrorReturn(createDemoMovieResponse());
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
    
    private TmdbMovieListResponse createDemoMovieResponse() {
        TmdbMovieListResponse response = new TmdbMovieListResponse();
        response.setPage(1);
        response.setTotalPages(1);
        response.setTotalResults(3);
        
        // Create demo movies
        TmdbMovieDto movie1 = new TmdbMovieDto();
        movie1.setId(1L);
        movie1.setTitle("アベンジャーズ/エンドゲーム");
        movie1.setOverview("マーベル・シネマティック・ユニバースの集大成となる作品");
        movie1.setReleaseDate("2019-04-26");
        movie1.setVoteAverage(8.4);
        movie1.setPosterPath("/or06FN3Dka5tukK1e9sl16pB3iy.jpg");
        
        TmdbMovieDto movie2 = new TmdbMovieDto();
        movie2.setId(2L);
        movie2.setTitle("君の名は。");
        movie2.setOverview("新海誠監督による青春アニメーション映画");
        movie2.setReleaseDate("2016-08-26");
        movie2.setVoteAverage(8.2);
        movie2.setPosterPath("/q719jXXEzOoYaps6babgKnONONX.jpg");
        
        TmdbMovieDto movie3 = new TmdbMovieDto();
        movie3.setId(3L);
        movie3.setTitle("千と千尋の神隠し");
        movie3.setOverview("宮崎駿監督による長編アニメーション映画");
        movie3.setReleaseDate("2001-07-20");
        movie3.setVoteAverage(9.3);
        movie3.setPosterPath("/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg");
        
        response.setResults(java.util.Arrays.asList(movie1, movie2, movie3));
        return response;
    }
    
    private TmdbMovieDto createDemoMovieDto(Long movieId) {
        // Return first demo movie for any ID
        TmdbMovieDto movie = new TmdbMovieDto();
        movie.setId(movieId);
        movie.setTitle("アベンジャーズ/エンドゲーム");
        movie.setOverview("マーベル・シネマティック・ユニバースの集大成となる作品。サノスとの最終決戦が始まる。");
        movie.setReleaseDate("2019-04-26");
        movie.setVoteAverage(8.4);
        movie.setPosterPath("/or06FN3Dka5tukK1e9sl16pB3iy.jpg");
        movie.setBackdropPath("/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg");
        movie.setAdult(false);
        movie.setOriginalLanguage("en");
        movie.setOriginalTitle("Avengers: Endgame");
        movie.setPopularity(100.0);
        movie.setVoteCount(20000);
        return movie;
    }
}