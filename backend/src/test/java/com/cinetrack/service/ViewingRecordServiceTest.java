package com.cinetrack.service;

import com.cinetrack.entity.User;
import com.cinetrack.entity.ViewingRecord;
import com.cinetrack.repository.UserRepository;
import com.cinetrack.repository.ViewingRecordRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ViewingRecordServiceTest {

    @Mock
    private ViewingRecordRepository viewingRecordRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ViewingRecordService viewingRecordService;

    private User testUser;
    private ViewingRecord testRecord;
    private UserDetails mockUserDetails;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");

        mockUserDetails = mock(UserDetails.class);
        when(mockUserDetails.getUsername()).thenReturn("testuser");

        testRecord = new ViewingRecord();
        testRecord.setId(1L);
        testRecord.setUser(testUser);
        testRecord.setTmdbMovieId(123456L);
        testRecord.setMovieTitle("Test Movie");
        testRecord.setMoviePosterPath("/test.jpg");
        testRecord.setViewingDate(LocalDateTime.now());
        testRecord.setRating(4.5);
        testRecord.setTheater("Test Theater");
        testRecord.setScreeningFormat("IMAX");
        testRecord.setReview("Great movie!");
    }

    @Test
    void createViewingRecord_WithValidData_ShouldReturnSavedRecord() {
        // Given
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(viewingRecordRepository.existsByUserIdAndTmdbMovieId(1L, 123456L)).thenReturn(false);
        when(viewingRecordRepository.save(any(ViewingRecord.class))).thenReturn(testRecord);

        // When
        ViewingRecord result = viewingRecordService.createViewingRecord(mockUserDetails, testRecord);

        // Then
        assertNotNull(result);
        assertEquals(testRecord.getId(), result.getId());
        assertEquals(testRecord.getMovieTitle(), result.getMovieTitle());
        verify(userRepository).findByUsername("testuser");
        verify(viewingRecordRepository).existsByUserIdAndTmdbMovieId(1L, 123456L);
        verify(viewingRecordRepository).save(any(ViewingRecord.class));
    }

    @Test
    void createViewingRecord_WithDuplicateMovie_ShouldThrowException() {
        // Given
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(viewingRecordRepository.existsByUserIdAndTmdbMovieId(1L, 123456L)).thenReturn(true);

        // When & Then
        assertThrows(RuntimeException.class, () -> {
            viewingRecordService.createViewingRecord(mockUserDetails, testRecord);
        });

        verify(userRepository).findByUsername("testuser");
        verify(viewingRecordRepository).existsByUserIdAndTmdbMovieId(1L, 123456L);
        verify(viewingRecordRepository, never()).save(any(ViewingRecord.class));
    }

    @Test
    void getUserViewingRecords_WithValidUser_ShouldReturnPagedRecords() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        List<ViewingRecord> records = Arrays.asList(testRecord);
        Page<ViewingRecord> page = new PageImpl<>(records, pageable, 1);
        
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(viewingRecordRepository.findByUserIdOrderByViewingDateDesc(1L, pageable)).thenReturn(page);

        // When
        Page<ViewingRecord> result = viewingRecordService.getUserViewingRecords(mockUserDetails, pageable);

        // Then
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals(testRecord.getMovieTitle(), result.getContent().get(0).getMovieTitle());
        verify(userRepository).findByUsername("testuser");
        verify(viewingRecordRepository).findByUserIdOrderByViewingDateDesc(1L, pageable);
    }

    @Test
    void getViewingRecordById_WithExistingId_ShouldReturnRecord() {
        // Given
        Long recordId = 1L;
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(viewingRecordRepository.findById(recordId)).thenReturn(Optional.of(testRecord));

        // When
        Optional<ViewingRecord> result = viewingRecordService.getViewingRecordById(mockUserDetails, recordId);

        // Then
        assertTrue(result.isPresent());
        assertEquals(testRecord.getId(), result.get().getId());
        verify(userRepository).findByUsername("testuser");
        verify(viewingRecordRepository).findById(recordId);
    }

    @Test
    void getViewingRecordById_WithWrongUser_ShouldThrowException() {
        // Given
        Long recordId = 1L;
        User otherUser = new User();
        otherUser.setId(2L);
        otherUser.setUsername("otheruser");
        
        ViewingRecord otherRecord = new ViewingRecord();
        otherRecord.setId(1L);
        otherRecord.setUser(otherUser);
        
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(viewingRecordRepository.findById(recordId)).thenReturn(Optional.of(otherRecord));

        // When & Then
        assertThrows(RuntimeException.class, () -> {
            viewingRecordService.getViewingRecordById(mockUserDetails, recordId);
        });

        verify(userRepository).findByUsername("testuser");
        verify(viewingRecordRepository).findById(recordId);
    }

    @Test
    void updateViewingRecord_WithValidData_ShouldReturnUpdatedRecord() {
        // Given
        Long recordId = 1L;
        ViewingRecord updatedRecord = new ViewingRecord();
        updatedRecord.setRating(5.0);
        updatedRecord.setReview("Amazing movie!");
        
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(viewingRecordRepository.findById(recordId)).thenReturn(Optional.of(testRecord));
        when(viewingRecordRepository.save(any(ViewingRecord.class))).thenReturn(testRecord);

        // When
        ViewingRecord result = viewingRecordService.updateViewingRecord(mockUserDetails, recordId, updatedRecord);

        // Then
        assertNotNull(result);
        verify(userRepository).findByUsername("testuser");
        verify(viewingRecordRepository).findById(recordId);
        verify(viewingRecordRepository).save(any(ViewingRecord.class));
    }

    @Test
    void deleteViewingRecord_WithValidId_ShouldDeleteRecord() {
        // Given
        Long recordId = 1L;
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(viewingRecordRepository.findById(recordId)).thenReturn(Optional.of(testRecord));

        // When
        viewingRecordService.deleteViewingRecord(mockUserDetails, recordId);

        // Then
        verify(userRepository).findByUsername("testuser");
        verify(viewingRecordRepository).findById(recordId);
        verify(viewingRecordRepository).delete(testRecord);
    }

    @Test
    void getUserTotalMovieCount_WithValidUser_ShouldReturnCount() {
        // Given
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(viewingRecordRepository.countByUserId(1L)).thenReturn(10L);

        // When
        Long count = viewingRecordService.getUserTotalMovieCount(mockUserDetails);

        // Then
        assertEquals(10L, count);
        verify(userRepository).findByUsername("testuser");
        verify(viewingRecordRepository).countByUserId(1L);
    }

    @Test
    void getUserAverageRating_WithValidUser_ShouldReturnAverage() {
        // Given
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(viewingRecordRepository.findAverageRatingByUserId(1L)).thenReturn(4.2);

        // When
        Double average = viewingRecordService.getUserAverageRating(mockUserDetails);

        // Then
        assertEquals(4.2, average);
        verify(userRepository).findByUsername("testuser");
        verify(viewingRecordRepository).findAverageRatingByUserId(1L);
    }

    @Test
    void hasUserWatchedMovie_WithWatchedMovie_ShouldReturnTrue() {
        // Given
        Long tmdbMovieId = 123456L;
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(viewingRecordRepository.existsByUserIdAndTmdbMovieId(1L, tmdbMovieId)).thenReturn(true);

        // When
        boolean hasWatched = viewingRecordService.hasUserWatchedMovie(mockUserDetails, tmdbMovieId);

        // Then
        assertTrue(hasWatched);
        verify(userRepository).findByUsername("testuser");
        verify(viewingRecordRepository).existsByUserIdAndTmdbMovieId(1L, tmdbMovieId);
    }
}