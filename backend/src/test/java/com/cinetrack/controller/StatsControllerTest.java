package com.cinetrack.controller;

import com.cinetrack.dto.StatsDto;
import com.cinetrack.entity.User;
import com.cinetrack.service.StatsService;
import com.cinetrack.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.core.Authentication;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import com.cinetrack.config.TestSecurityConfig;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(StatsController.class)
@Import(TestSecurityConfig.class)
@ActiveProfiles("test")
class StatsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private StatsService statsService;

    @MockBean
    private UserService userService;

    @Autowired
    private ObjectMapper objectMapper;

    private User testUser;
    private List<StatsDto.MonthlyStats> monthlyStats;
    private List<StatsDto.GenreStats> genreStats;
    private List<StatsDto.RatingDistribution> ratingDistribution;
    private StatsDto.OverallStats overallStats;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");

        // Mock monthly stats
        monthlyStats = Arrays.asList(
            new StatsDto.MonthlyStats("2024-01", 5L),
            new StatsDto.MonthlyStats("2024-02", 3L)
        );

        // Mock genre stats
        genreStats = Arrays.asList(
            new StatsDto.GenreStats("アクション", 10L, 50.0),
            new StatsDto.GenreStats("コメディ", 5L, 25.0)
        );

        // Mock rating distribution
        ratingDistribution = Arrays.asList(
            new StatsDto.RatingDistribution(4.0, 8L),
            new StatsDto.RatingDistribution(5.0, 12L)
        );

        // Mock overall stats
        overallStats = new StatsDto.OverallStats();
        overallStats.setTotalMovies(20L);
        overallStats.setAverageRating(4.2);
        overallStats.setFirstViewingDate(LocalDate.of(2024, 1, 1));
        overallStats.setLastViewingDate(LocalDate.of(2024, 3, 1));
        overallStats.setViewingDays(60);
        overallStats.setFavoriteGenre("アクション");
        overallStats.setMoviesPerMonth(6.7);
    }

    @Test
    @WithMockUser(username = "testuser")
    void getMonthlyStats_ShouldReturnMonthlyStats() throws Exception {
        // Given
        when(userService.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(statsService.getMonthlyStats(testUser)).thenReturn(monthlyStats);

        // When & Then
        mockMvc.perform(get("/stats/monthly"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("月別統計を取得しました"))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].month").value("2024-01"))
                .andExpect(jsonPath("$.data[0].count").value(5))
                .andExpect(jsonPath("$.data[1].month").value("2024-02"))
                .andExpect(jsonPath("$.data[1].count").value(3));

        verify(userService).findByUsername("testuser");
        verify(statsService).getMonthlyStats(testUser);
    }

    @Test
    @WithMockUser(username = "testuser")
    void getMonthlyStats_WithUserNotFound_ShouldReturnError() throws Exception {
        // Given
        when(userService.findByUsername("testuser")).thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(get("/stats/monthly"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("月別統計の取得に失敗しました: User not found"));

        verify(userService).findByUsername("testuser");
        verify(statsService, never()).getMonthlyStats(any(User.class));
    }

    @Test
    @WithMockUser(username = "testuser")
    void getGenreStats_ShouldReturnGenreStats() throws Exception {
        // Given
        when(userService.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(statsService.getGenreStats(testUser)).thenReturn(genreStats);

        // When & Then
        mockMvc.perform(get("/stats/genres"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("ジャンル統計を取得しました"))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].genre").value("アクション"))
                .andExpect(jsonPath("$.data[0].count").value(10))
                .andExpect(jsonPath("$.data[0].percentage").value(50.0))
                .andExpect(jsonPath("$.data[1].genre").value("コメディ"))
                .andExpect(jsonPath("$.data[1].count").value(5))
                .andExpect(jsonPath("$.data[1].percentage").value(25.0));

        verify(userService).findByUsername("testuser");
        verify(statsService).getGenreStats(testUser);
    }

    @Test
    @WithMockUser(username = "testuser")
    void getRatingDistribution_ShouldReturnRatingStats() throws Exception {
        // Given
        when(userService.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(statsService.getRatingDistribution(testUser)).thenReturn(ratingDistribution);

        // When & Then
        mockMvc.perform(get("/stats/ratings"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("評価分布を取得しました"))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].rating").value(4.0))
                .andExpect(jsonPath("$.data[0].count").value(8))
                .andExpect(jsonPath("$.data[1].rating").value(5.0))
                .andExpect(jsonPath("$.data[1].count").value(12));

        verify(userService).findByUsername("testuser");
        verify(statsService).getRatingDistribution(testUser);
    }

    @Test
    @WithMockUser(username = "testuser")
    void getOverallStats_ShouldReturnOverallStats() throws Exception {
        // Given
        when(userService.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(statsService.getOverallStats(testUser)).thenReturn(overallStats);

        // When & Then
        mockMvc.perform(get("/stats/overall"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("全体統計を取得しました"))
                .andExpect(jsonPath("$.data.totalMovies").value(20))
                .andExpect(jsonPath("$.data.averageRating").value(4.2))
                .andExpect(jsonPath("$.data.firstViewingDate").value("2024-01-01"))
                .andExpect(jsonPath("$.data.lastViewingDate").value("2024-03-01"))
                .andExpect(jsonPath("$.data.viewingDays").value(60))
                .andExpect(jsonPath("$.data.favoriteGenre").value("アクション"))
                .andExpect(jsonPath("$.data.moviesPerMonth").value(6.7));

        verify(userService).findByUsername("testuser");
        verify(statsService).getOverallStats(testUser);
    }

    @Test
    @WithMockUser(username = "testuser")
    void getStatsSummary_ShouldReturnAllStats() throws Exception {
        // Given
        when(userService.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(statsService.getOverallStats(testUser)).thenReturn(overallStats);
        when(statsService.getMonthlyStats(testUser)).thenReturn(monthlyStats);
        when(statsService.getGenreStats(testUser)).thenReturn(genreStats);
        when(statsService.getRatingDistribution(testUser)).thenReturn(ratingDistribution);

        // When & Then
        mockMvc.perform(get("/stats/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("統計サマリーを取得しました"))
                .andExpect(jsonPath("$.data.overall").exists())
                .andExpect(jsonPath("$.data.monthly").isArray())
                .andExpect(jsonPath("$.data.genres").isArray())
                .andExpect(jsonPath("$.data.ratings").isArray())
                .andExpect(jsonPath("$.data.overall.totalMovies").value(20))
                .andExpect(jsonPath("$.data.monthly[0].month").value("2024-01"))
                .andExpect(jsonPath("$.data.genres[0].genre").value("アクション"))
                .andExpect(jsonPath("$.data.ratings[0].rating").value(4.0));

        verify(userService).findByUsername("testuser");
        verify(statsService).getOverallStats(testUser);
        verify(statsService).getMonthlyStats(testUser);
        verify(statsService).getGenreStats(testUser);
        verify(statsService).getRatingDistribution(testUser);
    }

    @Test
    @WithMockUser(username = "testuser")
    void getGenreStats_WithServiceException_ShouldReturnError() throws Exception {
        // Given
        when(userService.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(statsService.getGenreStats(testUser)).thenThrow(new RuntimeException("Service error"));

        // When & Then
        mockMvc.perform(get("/stats/genres"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("ジャンル統計の取得に失敗しました: Service error"));

        verify(userService).findByUsername("testuser");
        verify(statsService).getGenreStats(testUser);
    }

    @Test
    @WithMockUser(username = "testuser")
    void getRatingDistribution_WithServiceException_ShouldReturnError() throws Exception {
        // Given
        when(userService.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(statsService.getRatingDistribution(testUser)).thenThrow(new RuntimeException("Service error"));

        // When & Then
        mockMvc.perform(get("/stats/ratings"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("評価分布の取得に失敗しました: Service error"));

        verify(userService).findByUsername("testuser");
        verify(statsService).getRatingDistribution(testUser);
    }

    @Test
    @WithMockUser(username = "testuser")
    void getOverallStats_WithServiceException_ShouldReturnError() throws Exception {
        // Given
        when(userService.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(statsService.getOverallStats(testUser)).thenThrow(new RuntimeException("Service error"));

        // When & Then
        mockMvc.perform(get("/stats/overall"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("全体統計の取得に失敗しました: Service error"));

        verify(userService).findByUsername("testuser");
        verify(statsService).getOverallStats(testUser);
    }

    @Test
    @WithMockUser(username = "testuser")
    void getStatsSummary_WithServiceException_ShouldReturnError() throws Exception {
        // Given
        when(userService.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(statsService.getOverallStats(testUser)).thenThrow(new RuntimeException("Service error"));

        // When & Then
        mockMvc.perform(get("/stats/summary"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("統計サマリーの取得に失敗しました: Service error"));

        verify(userService).findByUsername("testuser");
        verify(statsService).getOverallStats(testUser);
    }

    @Test
    @WithMockUser(username = "testuser")
    void getGenreStats_WithUserNotFound_ShouldReturnError() throws Exception {
        // Given
        when(userService.findByUsername("testuser")).thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(get("/stats/genres"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("ジャンル統計の取得に失敗しました: User not found"));

        verify(userService).findByUsername("testuser");
        verify(statsService, never()).getGenreStats(any(User.class));
    }

    @Test
    @WithMockUser(username = "testuser")
    void getRatingDistribution_WithUserNotFound_ShouldReturnError() throws Exception {
        // Given
        when(userService.findByUsername("testuser")).thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(get("/stats/ratings"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("評価分布の取得に失敗しました: User not found"));

        verify(userService).findByUsername("testuser");
        verify(statsService, never()).getRatingDistribution(any(User.class));
    }

    @Test
    @WithMockUser(username = "testuser")
    void getOverallStats_WithUserNotFound_ShouldReturnError() throws Exception {
        // Given
        when(userService.findByUsername("testuser")).thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(get("/stats/overall"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("全体統計の取得に失敗しました: User not found"));

        verify(userService).findByUsername("testuser");
        verify(statsService, never()).getOverallStats(any(User.class));
    }

    @Test
    @WithMockUser(username = "testuser")
    void getStatsSummary_WithUserNotFound_ShouldReturnError() throws Exception {
        // Given
        when(userService.findByUsername("testuser")).thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(get("/stats/summary"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("統計サマリーの取得に失敗しました: User not found"));

        verify(userService).findByUsername("testuser");
        verify(statsService, never()).getOverallStats(any(User.class));
        verify(statsService, never()).getMonthlyStats(any(User.class));
        verify(statsService, never()).getGenreStats(any(User.class));
        verify(statsService, never()).getRatingDistribution(any(User.class));
    }
}