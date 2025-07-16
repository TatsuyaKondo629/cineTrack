package com.cinetrack.service;

import com.cinetrack.dto.tmdb.TmdbMovieDto;
import com.cinetrack.dto.tmdb.TmdbMovieListResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import org.springframework.test.context.ActiveProfiles;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
class TmdbServiceTest {

    @Mock
    private WebClient tmdbWebClient;

    @Mock
    private WebClient.RequestHeadersUriSpec requestHeadersUriSpec;

    @Mock
    private WebClient.RequestHeadersSpec requestHeadersSpec;

    @Mock
    private WebClient.ResponseSpec responseSpec;

    private TmdbService tmdbService;

    @BeforeEach
    void setUp() {
        tmdbService = new TmdbService();
        ReflectionTestUtils.setField(tmdbService, "tmdbWebClient", tmdbWebClient);
    }

    @Test
    void getTrendingMovies_WithValidApiKey_ShouldReturnRealData() {
        // Given
        ReflectionTestUtils.setField(tmdbService, "apiKey", "valid-api-key");
        
        TmdbMovieListResponse mockResponse = new TmdbMovieListResponse();
        mockResponse.setPage(1);
        mockResponse.setTotalPages(1);
        mockResponse.setTotalResults(1);

        when(tmdbWebClient.get()).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.uri(any(java.util.function.Function.class))).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(TmdbMovieListResponse.class)).thenReturn(Mono.just(mockResponse));

        // When
        Mono<TmdbMovieListResponse> result = tmdbService.getTrendingMovies("day", 1);

        // Then
        StepVerifier.create(result)
                .expectNext(mockResponse)
                .verifyComplete();

        verify(tmdbWebClient).get();
    }

    @Test
    void getTrendingMovies_WithInvalidApiKey_ShouldReturnDemoData() {
        // Given
        ReflectionTestUtils.setField(tmdbService, "apiKey", "demo_api_key_please_replace_with_actual_key");

        // When
        Mono<TmdbMovieListResponse> result = tmdbService.getTrendingMovies("day", 1);

        // Then
        StepVerifier.create(result)
                .assertNext(response -> {
                    assertThat(response.getPage()).isEqualTo(1);
                    assertThat(response.getTotalPages()).isEqualTo(1);
                    assertThat(response.getTotalResults()).isEqualTo(3);
                    assertThat(response.getResults()).hasSize(3);
                    assertThat(response.getResults().get(0).getTitle()).isEqualTo("アベンジャーズ/エンドゲーム");
                })
                .verifyComplete();

        verify(tmdbWebClient, never()).get();
    }

    @Test
    void getTrendingMovies_WithNullApiKey_ShouldReturnDemoData() {
        // Given
        ReflectionTestUtils.setField(tmdbService, "apiKey", null);

        // When
        Mono<TmdbMovieListResponse> result = tmdbService.getTrendingMovies("day", 1);

        // Then
        StepVerifier.create(result)
                .assertNext(response -> {
                    assertThat(response.getPage()).isEqualTo(1);
                    assertThat(response.getResults()).hasSize(3);
                })
                .verifyComplete();

        verify(tmdbWebClient, never()).get();
    }

    @Test
    void getTrendingMovies_WithEmptyApiKey_ShouldReturnDemoData() {
        // Given
        ReflectionTestUtils.setField(tmdbService, "apiKey", "");

        // When
        Mono<TmdbMovieListResponse> result = tmdbService.getTrendingMovies("day", 1);

        // Then
        StepVerifier.create(result)
                .assertNext(response -> {
                    assertThat(response.getPage()).isEqualTo(1);
                    assertThat(response.getResults()).hasSize(3);
                })
                .verifyComplete();

        verify(tmdbWebClient, never()).get();
    }

    @Test
    void getMovieDetails_WithValidApiKey_ShouldReturnRealData() {
        // Given
        ReflectionTestUtils.setField(tmdbService, "apiKey", "valid-api-key");
        
        TmdbMovieDto mockMovie = new TmdbMovieDto();
        mockMovie.setId(123L);
        mockMovie.setTitle("Test Movie");

        when(tmdbWebClient.get()).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.uri(any(java.util.function.Function.class))).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(TmdbMovieDto.class)).thenReturn(Mono.just(mockMovie));

        // When
        Mono<TmdbMovieDto> result = tmdbService.getMovieDetails(123L);

        // Then
        StepVerifier.create(result)
                .expectNext(mockMovie)
                .verifyComplete();

        verify(tmdbWebClient).get();
    }

    @Test
    void getMovieDetails_WithInvalidApiKey_ShouldReturnDemoData() {
        // Given
        ReflectionTestUtils.setField(tmdbService, "apiKey", "demo_api_key_please_replace_with_actual_key");

        // When
        Mono<TmdbMovieDto> result = tmdbService.getMovieDetails(123L);

        // Then
        StepVerifier.create(result)
                .assertNext(movie -> {
                    assertThat(movie.getId()).isEqualTo(123L);
                    assertThat(movie.getTitle()).isEqualTo("アベンジャーズ/エンドゲーム");
                    assertThat(movie.getVoteAverage()).isEqualTo(8.4);
                })
                .verifyComplete();

        verify(tmdbWebClient, never()).get();
    }

    @Test
    void getPosterUrl_WithValidPath_ShouldReturnFullUrl() {
        // Given
        String posterPath = "/test-poster.jpg";

        // When
        String result = tmdbService.getPosterUrl(posterPath);

        // Then
        assertThat(result).isEqualTo("https://image.tmdb.org/t/p/w500/test-poster.jpg");
    }

    @Test
    void getPosterUrl_WithNullPath_ShouldReturnNull() {
        // When
        String result = tmdbService.getPosterUrl(null);

        // Then
        assertThat(result).isNull();
    }

    @Test
    void getPosterUrl_WithEmptyPath_ShouldReturnNull() {
        // When
        String result = tmdbService.getPosterUrl("");

        // Then
        assertThat(result).isNull();
    }

    @Test
    void getBackdropUrl_WithValidPath_ShouldReturnFullUrl() {
        // Given
        String backdropPath = "/test-backdrop.jpg";

        // When
        String result = tmdbService.getBackdropUrl(backdropPath);

        // Then
        assertThat(result).isEqualTo("https://image.tmdb.org/t/p/w1280/test-backdrop.jpg");
    }

    @Test
    void searchMovies_WithValidQuery_ShouldCallWebClient() {
        // Given
        ReflectionTestUtils.setField(tmdbService, "apiKey", "valid-api-key");
        
        TmdbMovieListResponse mockResponse = new TmdbMovieListResponse();
        mockResponse.setPage(1);

        when(tmdbWebClient.get()).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.uri(any(java.util.function.Function.class))).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(TmdbMovieListResponse.class)).thenReturn(Mono.just(mockResponse));

        // When
        Mono<TmdbMovieListResponse> result = tmdbService.searchMovies("test query", 1);

        // Then
        StepVerifier.create(result)
                .expectNext(mockResponse)
                .verifyComplete();

        verify(tmdbWebClient).get();
    }

    @Test
    void getPopularMovies_WithValidApiKey_ShouldCallWebClient() {
        // Given
        ReflectionTestUtils.setField(tmdbService, "apiKey", "valid-api-key");
        
        TmdbMovieListResponse mockResponse = new TmdbMovieListResponse();
        mockResponse.setPage(1);

        when(tmdbWebClient.get()).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.uri(any(java.util.function.Function.class))).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(TmdbMovieListResponse.class)).thenReturn(Mono.just(mockResponse));

        // When
        Mono<TmdbMovieListResponse> result = tmdbService.getPopularMovies(1);

        // Then
        StepVerifier.create(result)
                .expectNext(mockResponse)
                .verifyComplete();

        verify(tmdbWebClient).get();
    }

    @Test
    void getNowPlayingMovies_WithValidApiKey_ShouldCallWebClient() {
        // Given
        ReflectionTestUtils.setField(tmdbService, "apiKey", "valid-api-key");
        
        TmdbMovieListResponse mockResponse = new TmdbMovieListResponse();
        mockResponse.setPage(1);

        when(tmdbWebClient.get()).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.uri(any(java.util.function.Function.class))).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(TmdbMovieListResponse.class)).thenReturn(Mono.just(mockResponse));

        // When
        Mono<TmdbMovieListResponse> result = tmdbService.getNowPlayingMovies(1);

        // Then
        StepVerifier.create(result)
                .expectNext(mockResponse)
                .verifyComplete();

        verify(tmdbWebClient).get();
    }

    @Test
    void getNowPlayingMovies_WithInvalidApiKey_ShouldReturnDemoData() {
        // Given
        ReflectionTestUtils.setField(tmdbService, "apiKey", "demo_api_key_please_replace_with_actual_key");

        // When
        Mono<TmdbMovieListResponse> result = tmdbService.getNowPlayingMovies(1);

        // Then
        StepVerifier.create(result)
                .assertNext(response -> {
                    assertThat(response.getPage()).isEqualTo(1);
                    assertThat(response.getResults()).hasSize(3);
                    assertThat(response.getResults().get(0).getTitle()).isEqualTo("アベンジャーズ/エンドゲーム");
                })
                .verifyComplete();

        verify(tmdbWebClient, never()).get();
    }

    @Test
    void getPopularMovies_WithInvalidApiKey_ShouldReturnDemoData() {
        // Given
        ReflectionTestUtils.setField(tmdbService, "apiKey", "demo_api_key_please_replace_with_actual_key");

        // When
        Mono<TmdbMovieListResponse> result = tmdbService.getPopularMovies(1);

        // Then
        StepVerifier.create(result)
                .assertNext(response -> {
                    assertThat(response.getPage()).isEqualTo(1);
                    assertThat(response.getResults()).hasSize(3);
                    assertThat(response.getResults().get(0).getTitle()).isEqualTo("アベンジャーズ/エンドゲーム");
                })
                .verifyComplete();

        verify(tmdbWebClient, never()).get();
    }

    @Test
    void searchMovies_WithInvalidApiKey_ShouldReturnDemoData() {
        // Given
        ReflectionTestUtils.setField(tmdbService, "apiKey", "demo_api_key_please_replace_with_actual_key");

        // When
        Mono<TmdbMovieListResponse> result = tmdbService.searchMovies("test query", 1);

        // Then
        StepVerifier.create(result)
                .assertNext(response -> {
                    assertThat(response.getPage()).isEqualTo(1);
                    assertThat(response.getResults()).hasSize(3);
                    assertThat(response.getResults().get(0).getTitle()).isEqualTo("アベンジャーズ/エンドゲーム");
                })
                .verifyComplete();

        verify(tmdbWebClient, never()).get();
    }

    @Test
    void getMovieDetails_WithNullApiKey_ShouldReturnDemoData() {
        // Given
        ReflectionTestUtils.setField(tmdbService, "apiKey", null);

        // When
        Mono<TmdbMovieDto> result = tmdbService.getMovieDetails(123L);

        // Then
        StepVerifier.create(result)
                .assertNext(movie -> {
                    assertThat(movie.getId()).isEqualTo(123L);
                    assertThat(movie.getTitle()).isEqualTo("アベンジャーズ/エンドゲーム");
                    assertThat(movie.getVoteAverage()).isEqualTo(8.4);
                })
                .verifyComplete();

        verify(tmdbWebClient, never()).get();
    }

    @Test
    void getMovieDetails_WithEmptyApiKey_ShouldReturnDemoData() {
        // Given
        ReflectionTestUtils.setField(tmdbService, "apiKey", "");

        // When
        Mono<TmdbMovieDto> result = tmdbService.getMovieDetails(123L);

        // Then
        StepVerifier.create(result)
                .assertNext(movie -> {
                    assertThat(movie.getId()).isEqualTo(123L);
                    assertThat(movie.getTitle()).isEqualTo("アベンジャーズ/エンドゲーム");
                    assertThat(movie.getVoteAverage()).isEqualTo(8.4);
                })
                .verifyComplete();

        verify(tmdbWebClient, never()).get();
    }

    @Test
    void getBackdropUrl_WithNullPath_ShouldReturnNull() {
        // When
        String result = tmdbService.getBackdropUrl(null);

        // Then
        assertThat(result).isNull();
    }

    @Test
    void getBackdropUrl_WithEmptyPath_ShouldReturnNull() {
        // When
        String result = tmdbService.getBackdropUrl("");

        // Then
        assertThat(result).isNull();
    }

    @Test
    void getImageUrl_WithValidPath_ShouldReturnFullUrl() {
        // Given
        String imagePath = "/test-image.jpg";
        String size = "w500";

        // When
        String result = tmdbService.getImageUrl(imagePath, size);

        // Then
        assertThat(result).isEqualTo("https://image.tmdb.org/t/p/w500/test-image.jpg");
    }

    @Test
    void getImageUrl_WithNullPath_ShouldReturnNull() {
        // When
        String result = tmdbService.getImageUrl(null, "w500");

        // Then
        assertThat(result).isNull();
    }

    @Test
    void getImageUrl_WithEmptyPath_ShouldReturnNull() {
        // When
        String result = tmdbService.getImageUrl("", "w500");

        // Then
        assertThat(result).isNull();
    }

    @Test
    void getImageUrl_WithBlankPath_ShouldReturnNull() {
        // When
        String result = tmdbService.getImageUrl("   ", "w500");

        // Then
        assertThat(result).isNull();
    }

    @Test
    void searchMovies_WithNullApiKey_ShouldReturnDemoData() {
        // Given
        ReflectionTestUtils.setField(tmdbService, "apiKey", null);

        // When
        Mono<TmdbMovieListResponse> result = tmdbService.searchMovies("test query", 1);

        // Then
        StepVerifier.create(result)
                .assertNext(response -> {
                    assertThat(response.getPage()).isEqualTo(1);
                    assertThat(response.getResults()).hasSize(3);
                    assertThat(response.getResults().get(0).getTitle()).isEqualTo("アベンジャーズ/エンドゲーム");
                })
                .verifyComplete();

        verify(tmdbWebClient, never()).get();
    }

    @Test
    void searchMovies_WithEmptyApiKey_ShouldReturnDemoData() {
        // Given
        ReflectionTestUtils.setField(tmdbService, "apiKey", "");

        // When
        Mono<TmdbMovieListResponse> result = tmdbService.searchMovies("test query", 1);

        // Then
        StepVerifier.create(result)
                .assertNext(response -> {
                    assertThat(response.getPage()).isEqualTo(1);
                    assertThat(response.getResults()).hasSize(3);
                    assertThat(response.getResults().get(0).getTitle()).isEqualTo("アベンジャーズ/エンドゲーム");
                })
                .verifyComplete();

        verify(tmdbWebClient, never()).get();
    }

    @Test
    void getPopularMovies_WithNullApiKey_ShouldReturnDemoData() {
        // Given
        ReflectionTestUtils.setField(tmdbService, "apiKey", null);

        // When
        Mono<TmdbMovieListResponse> result = tmdbService.getPopularMovies(1);

        // Then
        StepVerifier.create(result)
                .assertNext(response -> {
                    assertThat(response.getPage()).isEqualTo(1);
                    assertThat(response.getResults()).hasSize(3);
                    assertThat(response.getResults().get(0).getTitle()).isEqualTo("アベンジャーズ/エンドゲーム");
                })
                .verifyComplete();

        verify(tmdbWebClient, never()).get();
    }

    @Test
    void getPopularMovies_WithEmptyApiKey_ShouldReturnDemoData() {
        // Given
        ReflectionTestUtils.setField(tmdbService, "apiKey", "");

        // When
        Mono<TmdbMovieListResponse> result = tmdbService.getPopularMovies(1);

        // Then
        StepVerifier.create(result)
                .assertNext(response -> {
                    assertThat(response.getPage()).isEqualTo(1);
                    assertThat(response.getResults()).hasSize(3);
                    assertThat(response.getResults().get(0).getTitle()).isEqualTo("アベンジャーズ/エンドゲーム");
                })
                .verifyComplete();

        verify(tmdbWebClient, never()).get();
    }

    @Test
    void getNowPlayingMovies_WithNullApiKey_ShouldReturnDemoData() {
        // Given
        ReflectionTestUtils.setField(tmdbService, "apiKey", null);

        // When
        Mono<TmdbMovieListResponse> result = tmdbService.getNowPlayingMovies(1);

        // Then
        StepVerifier.create(result)
                .assertNext(response -> {
                    assertThat(response.getPage()).isEqualTo(1);
                    assertThat(response.getResults()).hasSize(3);
                    assertThat(response.getResults().get(0).getTitle()).isEqualTo("アベンジャーズ/エンドゲーム");
                })
                .verifyComplete();

        verify(tmdbWebClient, never()).get();
    }

    @Test
    void getNowPlayingMovies_WithEmptyApiKey_ShouldReturnDemoData() {
        // Given
        ReflectionTestUtils.setField(tmdbService, "apiKey", "");

        // When
        Mono<TmdbMovieListResponse> result = tmdbService.getNowPlayingMovies(1);

        // Then
        StepVerifier.create(result)
                .assertNext(response -> {
                    assertThat(response.getPage()).isEqualTo(1);
                    assertThat(response.getResults()).hasSize(3);
                    assertThat(response.getResults().get(0).getTitle()).isEqualTo("アベンジャーズ/エンドゲーム");
                })
                .verifyComplete();

        verify(tmdbWebClient, never()).get();
    }

    @Test
    void getTrendingMovies_WithNullPage_ShouldCallWebClient() {
        // Given
        ReflectionTestUtils.setField(tmdbService, "apiKey", "valid-api-key");
        
        TmdbMovieListResponse mockResponse = new TmdbMovieListResponse();
        mockResponse.setPage(1);

        when(tmdbWebClient.get()).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.uri(any(java.util.function.Function.class))).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(TmdbMovieListResponse.class)).thenReturn(Mono.just(mockResponse));

        // When
        Mono<TmdbMovieListResponse> result = tmdbService.getTrendingMovies("day", null);

        // Then
        StepVerifier.create(result)
                .expectNext(mockResponse)
                .verifyComplete();

        verify(tmdbWebClient).get();
    }

    @Test
    void searchMovies_WithNullPage_ShouldCallWebClient() {
        // Given
        ReflectionTestUtils.setField(tmdbService, "apiKey", "valid-api-key");
        
        TmdbMovieListResponse mockResponse = new TmdbMovieListResponse();
        mockResponse.setPage(1);

        when(tmdbWebClient.get()).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.uri(any(java.util.function.Function.class))).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(TmdbMovieListResponse.class)).thenReturn(Mono.just(mockResponse));

        // When
        Mono<TmdbMovieListResponse> result = tmdbService.searchMovies("test", null);

        // Then
        StepVerifier.create(result)
                .expectNext(mockResponse)
                .verifyComplete();

        verify(tmdbWebClient).get();
    }

    @Test
    void getPopularMovies_WithNullPage_ShouldCallWebClient() {
        // Given
        ReflectionTestUtils.setField(tmdbService, "apiKey", "valid-api-key");
        
        TmdbMovieListResponse mockResponse = new TmdbMovieListResponse();
        mockResponse.setPage(1);

        when(tmdbWebClient.get()).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.uri(any(java.util.function.Function.class))).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(TmdbMovieListResponse.class)).thenReturn(Mono.just(mockResponse));

        // When
        Mono<TmdbMovieListResponse> result = tmdbService.getPopularMovies(null);

        // Then
        StepVerifier.create(result)
                .expectNext(mockResponse)
                .verifyComplete();

        verify(tmdbWebClient).get();
    }

    @Test
    void getNowPlayingMovies_WithNullPage_ShouldCallWebClient() {
        // Given
        ReflectionTestUtils.setField(tmdbService, "apiKey", "valid-api-key");
        
        TmdbMovieListResponse mockResponse = new TmdbMovieListResponse();
        mockResponse.setPage(1);

        when(tmdbWebClient.get()).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.uri(any(java.util.function.Function.class))).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(TmdbMovieListResponse.class)).thenReturn(Mono.just(mockResponse));

        // When
        Mono<TmdbMovieListResponse> result = tmdbService.getNowPlayingMovies(null);

        // Then
        StepVerifier.create(result)
                .expectNext(mockResponse)
                .verifyComplete();

        verify(tmdbWebClient).get();
    }
}