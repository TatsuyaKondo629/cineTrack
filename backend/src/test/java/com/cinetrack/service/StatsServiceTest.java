package com.cinetrack.service;

import com.cinetrack.dto.StatsDto;
import com.cinetrack.entity.User;
import com.cinetrack.entity.ViewingRecord;
import com.cinetrack.repository.ViewingRecordRepository;
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

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
class StatsServiceTest {

    @Mock
    private ViewingRecordRepository viewingRecordRepository;

    @InjectMocks
    private StatsService statsService;

    private User testUser;
    private ViewingRecord record1;
    private ViewingRecord record2;
    private ViewingRecord record3;
    private List<ViewingRecord> testRecords;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");

        record1 = new ViewingRecord();
        record1.setId(1L);
        record1.setUser(testUser);
        record1.setTmdbMovieId(123456L);
        record1.setMovieTitle("Test Movie 1");
        record1.setViewingDate(LocalDateTime.of(2024, 1, 15, 20, 0));
        record1.setRating(4.0);

        record2 = new ViewingRecord();
        record2.setId(2L);
        record2.setUser(testUser);
        record2.setTmdbMovieId(789012L);
        record2.setMovieTitle("Test Movie 2");
        record2.setViewingDate(LocalDateTime.of(2024, 1, 20, 19, 30));
        record2.setRating(5.0);

        record3 = new ViewingRecord();
        record3.setId(3L);
        record3.setUser(testUser);
        record3.setTmdbMovieId(345678L);
        record3.setMovieTitle("Test Movie 3");
        record3.setViewingDate(LocalDateTime.of(2024, 2, 10, 21, 0));
        record3.setRating(3.5);

        testRecords = Arrays.asList(record1, record2, record3);
    }

    @Test
    void getMonthlyStats_WithRecords_ShouldReturnMonthlyStats() {
        // Given
        when(viewingRecordRepository.findByUserIdOrderByViewingDateDesc(1L)).thenReturn(testRecords);

        // When
        List<StatsDto.MonthlyStats> result = statsService.getMonthlyStats(testUser);

        // Then
        assertNotNull(result);
        assertEquals(2, result.size());
        
        StatsDto.MonthlyStats janStats = result.stream()
            .filter(stats -> stats.getMonth().equals("2024-01"))
            .findFirst()
            .orElse(null);
        assertNotNull(janStats);
        assertEquals(2, janStats.getCount());

        StatsDto.MonthlyStats febStats = result.stream()
            .filter(stats -> stats.getMonth().equals("2024-02"))
            .findFirst()
            .orElse(null);
        assertNotNull(febStats);
        assertEquals(1, febStats.getCount());

        verify(viewingRecordRepository).findByUserIdOrderByViewingDateDesc(1L);
    }

    @Test
    void getMonthlyStats_WithEmptyRecords_ShouldReturnEmptyList() {
        // Given
        when(viewingRecordRepository.findByUserIdOrderByViewingDateDesc(1L)).thenReturn(List.of());

        // When
        List<StatsDto.MonthlyStats> result = statsService.getMonthlyStats(testUser);

        // Then
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(viewingRecordRepository).findByUserIdOrderByViewingDateDesc(1L);
    }

    @Test
    void getGenreStats_WithRecords_ShouldReturnGenreStats() {
        // Given
        when(viewingRecordRepository.findByUserIdOrderByViewingDateDesc(1L)).thenReturn(testRecords);

        // When
        List<StatsDto.GenreStats> result = statsService.getGenreStats(testUser);

        // Then
        assertNotNull(result);
        assertFalse(result.isEmpty());
        
        // 各映画のジャンル分布を確認
        long totalCount = result.stream().mapToLong(StatsDto.GenreStats::getCount).sum();
        assertEquals(3, totalCount);
        
        // パーセンテージの合計が100%であることを確認
        double totalPercentage = result.stream().mapToDouble(StatsDto.GenreStats::getPercentage).sum();
        assertEquals(100.0, totalPercentage, 0.01);

        verify(viewingRecordRepository).findByUserIdOrderByViewingDateDesc(1L);
    }

    @Test
    void getGenreStats_WithEmptyRecords_ShouldReturnEmptyList() {
        // Given
        when(viewingRecordRepository.findByUserIdOrderByViewingDateDesc(1L)).thenReturn(List.of());

        // When
        List<StatsDto.GenreStats> result = statsService.getGenreStats(testUser);

        // Then
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(viewingRecordRepository).findByUserIdOrderByViewingDateDesc(1L);
    }

    @Test
    void getRatingDistribution_WithRecords_ShouldReturnRatingDistribution() {
        // Given
        when(viewingRecordRepository.findByUserIdOrderByViewingDateDesc(1L)).thenReturn(testRecords);

        // When
        List<StatsDto.RatingDistribution> result = statsService.getRatingDistribution(testUser);

        // Then
        assertNotNull(result);
        assertEquals(3, result.size());
        
        // 評価順にソートされていることを確認
        assertEquals(3.5, result.get(0).getRating());
        assertEquals(4.0, result.get(1).getRating());
        assertEquals(5.0, result.get(2).getRating());
        
        // 各評価の回数を確認
        assertEquals(1, result.get(0).getCount());
        assertEquals(1, result.get(1).getCount());
        assertEquals(1, result.get(2).getCount());

        verify(viewingRecordRepository).findByUserIdOrderByViewingDateDesc(1L);
    }

    @Test
    void getRatingDistribution_WithEmptyRecords_ShouldReturnEmptyList() {
        // Given
        when(viewingRecordRepository.findByUserIdOrderByViewingDateDesc(1L)).thenReturn(List.of());

        // When
        List<StatsDto.RatingDistribution> result = statsService.getRatingDistribution(testUser);

        // Then
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(viewingRecordRepository).findByUserIdOrderByViewingDateDesc(1L);
    }

    @Test
    void getOverallStats_WithRecords_ShouldReturnOverallStats() {
        // Given
        when(viewingRecordRepository.findByUserIdOrderByViewingDateDesc(1L)).thenReturn(testRecords);

        // When
        StatsDto.OverallStats result = statsService.getOverallStats(testUser);

        // Then
        assertNotNull(result);
        assertEquals(3, result.getTotalMovies());
        assertEquals(4.17, result.getAverageRating(), 0.01); // (4.0 + 5.0 + 3.5) / 3
        assertEquals(LocalDateTime.of(2024, 1, 15, 20, 0).toLocalDate(), result.getFirstViewingDate());
        assertEquals(LocalDateTime.of(2024, 2, 10, 21, 0).toLocalDate(), result.getLastViewingDate());
        assertEquals(27, result.getViewingDays()); // 1/15 - 2/10 + 1
        assertTrue(result.getMoviesPerMonth() > 0);
        assertNotNull(result.getFavoriteGenre());

        verify(viewingRecordRepository, times(2)).findByUserIdOrderByViewingDateDesc(1L);
    }

    @Test
    void getOverallStats_WithEmptyRecords_ShouldReturnEmptyStats() {
        // Given
        when(viewingRecordRepository.findByUserIdOrderByViewingDateDesc(1L)).thenReturn(List.of());

        // When
        StatsDto.OverallStats result = statsService.getOverallStats(testUser);

        // Then
        assertNotNull(result);
        assertEquals(0, result.getTotalMovies());
        assertEquals(0.0, result.getAverageRating());
        assertEquals(0, result.getViewingDays());
        assertEquals(0.0, result.getMoviesPerMonth());
        assertNull(result.getFavoriteGenre());

        verify(viewingRecordRepository, times(1)).findByUserIdOrderByViewingDateDesc(1L);
    }

    @Test
    void getOverallStats_WithSingleRecord_ShouldReturnCorrectStats() {
        // Given
        List<ViewingRecord> singleRecord = Arrays.asList(record1);
        when(viewingRecordRepository.findByUserIdOrderByViewingDateDesc(1L)).thenReturn(singleRecord);

        // When
        StatsDto.OverallStats result = statsService.getOverallStats(testUser);

        // Then
        assertNotNull(result);
        assertEquals(1, result.getTotalMovies());
        assertEquals(4.0, result.getAverageRating());
        assertEquals(LocalDateTime.of(2024, 1, 15, 20, 0).toLocalDate(), result.getFirstViewingDate());
        assertEquals(LocalDateTime.of(2024, 1, 15, 20, 0).toLocalDate(), result.getLastViewingDate());
        assertEquals(1, result.getViewingDays());
        assertEquals(1.0, result.getMoviesPerMonth());
        assertNotNull(result.getFavoriteGenre());

        verify(viewingRecordRepository, times(2)).findByUserIdOrderByViewingDateDesc(1L);
    }

}