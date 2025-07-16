package com.cinetrack.service;

import com.cinetrack.dto.ViewingRecordDto;
import com.cinetrack.dto.TheaterDto;
import com.cinetrack.entity.User;
import com.cinetrack.entity.ViewingRecord;
import com.cinetrack.entity.Theater;
import com.cinetrack.repository.UserRepository;
import com.cinetrack.repository.ViewingRecordRepository;
import com.cinetrack.repository.TheaterRepository;
import com.cinetrack.service.TheaterService;
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
import org.springframework.test.context.ActiveProfiles;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
class ViewingRecordServiceTest {

    @Mock
    private ViewingRecordRepository viewingRecordRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private TheaterRepository theaterRepository;

    @Mock
    private TheaterService theaterService;

    @InjectMocks
    private ViewingRecordService viewingRecordService;

    private User testUser;
    private ViewingRecord testRecord;
    private UserDetails mockUserDetails;
    private Theater testTheater;
    private ViewingRecordDto testDto;

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
        
        testTheater = new Theater();
        testTheater.setId(1L);
        testTheater.setName("Test Theater");
        testTheater.setAddress("123 Test St");
        testTheater.setLatitude(35.6762);
        testTheater.setLongitude(139.6503);
        
        testDto = new ViewingRecordDto();
        testDto.setId(1L);
        testDto.setTmdbMovieId(123456L);
        testDto.setMovieTitle("Test Movie");
        testDto.setMoviePosterPath("/test.jpg");
        testDto.setViewingDate(LocalDateTime.now());
        testDto.setRating(4.5);
        testDto.setTheater("Test Theater");
        testDto.setScreeningFormat("IMAX");
        testDto.setReview("Great movie!");
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

    @Test
    void getUserViewingRecords_WithoutPageable_ShouldReturnAllRecords() {
        // Given
        List<ViewingRecord> records = Arrays.asList(testRecord);
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(viewingRecordRepository.findByUserIdOrderByViewingDateDesc(1L)).thenReturn(records);

        // When
        List<ViewingRecord> result = viewingRecordService.getUserViewingRecords(mockUserDetails);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testRecord.getMovieTitle(), result.get(0).getMovieTitle());
        verify(userRepository).findByUsername("testuser");
        verify(viewingRecordRepository).findByUserIdOrderByViewingDateDesc(1L);
    }

    @Test
    void searchUserViewingRecords_WithValidQuery_ShouldReturnMatchingRecords() {
        // Given
        String searchQuery = "Test";
        List<ViewingRecord> records = Arrays.asList(testRecord);
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(viewingRecordRepository.findByUserIdAndMovieTitleContainingIgnoreCase(1L, searchQuery)).thenReturn(records);

        // When
        List<ViewingRecord> result = viewingRecordService.searchUserViewingRecords(mockUserDetails, searchQuery);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testRecord.getMovieTitle(), result.get(0).getMovieTitle());
        verify(userRepository).findByUsername("testuser");
        verify(viewingRecordRepository).findByUserIdAndMovieTitleContainingIgnoreCase(1L, searchQuery);
    }

    @Test
    void getUserViewingRecordsByRating_WithValidRating_ShouldReturnFilteredRecords() {
        // Given
        Double minRating = 4.0;
        List<ViewingRecord> records = Arrays.asList(testRecord);
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(viewingRecordRepository.findByUserIdAndRatingGreaterThanEqual(1L, minRating)).thenReturn(records);

        // When
        List<ViewingRecord> result = viewingRecordService.getUserViewingRecordsByRating(mockUserDetails, minRating);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testRecord.getRating(), result.get(0).getRating());
        verify(userRepository).findByUsername("testuser");
        verify(viewingRecordRepository).findByUserIdAndRatingGreaterThanEqual(1L, minRating);
    }

    @Test
    void getUserViewingRecordsByDateRange_WithValidDateRange_ShouldReturnFilteredRecords() {
        // Given
        LocalDateTime startDate = LocalDateTime.now().minusDays(30);
        LocalDateTime endDate = LocalDateTime.now();
        List<ViewingRecord> records = Arrays.asList(testRecord);
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(viewingRecordRepository.findByUserIdAndViewingDateBetween(1L, startDate, endDate)).thenReturn(records);

        // When
        List<ViewingRecord> result = viewingRecordService.getUserViewingRecordsByDateRange(mockUserDetails, startDate, endDate);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testRecord.getMovieTitle(), result.get(0).getMovieTitle());
        verify(userRepository).findByUsername("testuser");
        verify(viewingRecordRepository).findByUserIdAndViewingDateBetween(1L, startDate, endDate);
    }

    @Test
    void createViewingRecordFromDto_WithValidDto_ShouldReturnDto() {
        // Given
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(viewingRecordRepository.existsByUserIdAndTmdbMovieId(1L, 123456L)).thenReturn(false);
        when(viewingRecordRepository.save(any(ViewingRecord.class))).thenReturn(testRecord);

        // When
        ViewingRecordDto result = viewingRecordService.createViewingRecordFromDto(mockUserDetails, testDto);

        // Then
        assertNotNull(result);
        assertEquals(testDto.getMovieTitle(), result.getMovieTitle());
        verify(userRepository).findByUsername("testuser");
        verify(viewingRecordRepository).existsByUserIdAndTmdbMovieId(1L, 123456L);
        verify(viewingRecordRepository).save(any(ViewingRecord.class));
    }

    @Test
    void createViewingRecordFromDto_WithTheater_ShouldSetTheaterEntity() {
        // Given
        testDto.setTheaterId(1L);
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(viewingRecordRepository.existsByUserIdAndTmdbMovieId(1L, 123456L)).thenReturn(false);
        when(theaterRepository.findById(1L)).thenReturn(Optional.of(testTheater));
        when(viewingRecordRepository.save(any(ViewingRecord.class))).thenReturn(testRecord);

        // When
        ViewingRecordDto result = viewingRecordService.createViewingRecordFromDto(mockUserDetails, testDto);

        // Then
        assertNotNull(result);
        verify(theaterRepository).findById(1L);
        verify(viewingRecordRepository).save(any(ViewingRecord.class));
    }

    @Test
    void createViewingRecordFromDto_WithDuplicateMovie_ShouldThrowException() {
        // Given
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(viewingRecordRepository.existsByUserIdAndTmdbMovieId(1L, 123456L)).thenReturn(true);

        // When & Then
        assertThrows(RuntimeException.class, () -> {
            viewingRecordService.createViewingRecordFromDto(mockUserDetails, testDto);
        });
    }

    @Test
    void updateViewingRecordFromDto_WithValidDto_ShouldReturnUpdatedDto() {
        // Given
        Long recordId = 1L;
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(viewingRecordRepository.findById(recordId)).thenReturn(Optional.of(testRecord));
        when(viewingRecordRepository.save(any(ViewingRecord.class))).thenReturn(testRecord);

        // When
        ViewingRecordDto result = viewingRecordService.updateViewingRecordFromDto(mockUserDetails, recordId, testDto);

        // Then
        assertNotNull(result);
        verify(userRepository).findByUsername("testuser");
        verify(viewingRecordRepository).findById(recordId);
        verify(viewingRecordRepository).save(any(ViewingRecord.class));
    }

    @Test
    void updateViewingRecordFromDto_WithTheater_ShouldUpdateTheaterEntity() {
        // Given
        Long recordId = 1L;
        testDto.setTheaterId(1L);
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(viewingRecordRepository.findById(recordId)).thenReturn(Optional.of(testRecord));
        when(theaterRepository.findById(1L)).thenReturn(Optional.of(testTheater));
        when(viewingRecordRepository.save(any(ViewingRecord.class))).thenReturn(testRecord);

        // When
        ViewingRecordDto result = viewingRecordService.updateViewingRecordFromDto(mockUserDetails, recordId, testDto);

        // Then
        assertNotNull(result);
        verify(theaterRepository).findById(1L);
        verify(viewingRecordRepository).save(any(ViewingRecord.class));
    }

    @Test
    void updateViewingRecordFromDto_WithoutTheater_ShouldSetTheaterEntityToNull() {
        // Given
        Long recordId = 1L;
        testDto.setTheaterId(null);
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(viewingRecordRepository.findById(recordId)).thenReturn(Optional.of(testRecord));
        when(viewingRecordRepository.save(any(ViewingRecord.class))).thenReturn(testRecord);

        // When
        ViewingRecordDto result = viewingRecordService.updateViewingRecordFromDto(mockUserDetails, recordId, testDto);

        // Then
        assertNotNull(result);
        verify(viewingRecordRepository).save(any(ViewingRecord.class));
    }

    @Test
    void updateViewingRecordFromDto_WithWrongUser_ShouldThrowException() {
        // Given
        Long recordId = 1L;
        User otherUser = new User();
        otherUser.setId(2L);
        ViewingRecord otherRecord = new ViewingRecord();
        otherRecord.setUser(otherUser);
        
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(viewingRecordRepository.findById(recordId)).thenReturn(Optional.of(otherRecord));

        // When & Then
        assertThrows(RuntimeException.class, () -> {
            viewingRecordService.updateViewingRecordFromDto(mockUserDetails, recordId, testDto);
        });
    }

    @Test
    void getUserViewingRecordsDto_WithValidUser_ShouldReturnDtoList() {
        // Given
        List<ViewingRecord> records = Arrays.asList(testRecord);
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(viewingRecordRepository.findByUserIdOrderByViewingDateDesc(1L)).thenReturn(records);

        // When
        List<ViewingRecordDto> result = viewingRecordService.getUserViewingRecordsDto(mockUserDetails);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testRecord.getMovieTitle(), result.get(0).getMovieTitle());
        verify(userRepository).findByUsername("testuser");
        verify(viewingRecordRepository).findByUserIdOrderByViewingDateDesc(1L);
    }

    @Test
    void getViewingRecordDtoById_WithValidId_ShouldReturnDto() {
        // Given
        Long recordId = 1L;
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(viewingRecordRepository.findById(recordId)).thenReturn(Optional.of(testRecord));

        // When
        Optional<ViewingRecordDto> result = viewingRecordService.getViewingRecordDtoById(mockUserDetails, recordId);

        // Then
        assertTrue(result.isPresent());
        assertEquals(testRecord.getMovieTitle(), result.get().getMovieTitle());
        verify(userRepository).findByUsername("testuser");
        verify(viewingRecordRepository).findById(recordId);
    }

    @Test
    void getViewingRecordDtoById_WithNotFound_ShouldReturnEmpty() {
        // Given
        Long recordId = 999L;
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(viewingRecordRepository.findById(recordId)).thenReturn(Optional.empty());

        // When
        Optional<ViewingRecordDto> result = viewingRecordService.getViewingRecordDtoById(mockUserDetails, recordId);

        // Then
        assertFalse(result.isPresent());
        verify(userRepository).findByUsername("testuser");
        verify(viewingRecordRepository).findById(recordId);
    }

    @Test
    void getViewingRecordDtoById_WithWrongUser_ShouldThrowException() {
        // Given
        Long recordId = 1L;
        User otherUser = new User();
        otherUser.setId(2L);
        ViewingRecord otherRecord = new ViewingRecord();
        otherRecord.setUser(otherUser);
        
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(viewingRecordRepository.findById(recordId)).thenReturn(Optional.of(otherRecord));

        // When & Then
        assertThrows(RuntimeException.class, () -> {
            viewingRecordService.getViewingRecordDtoById(mockUserDetails, recordId);
        });
    }

    @Test
    void updateViewingRecord_WithWrongUser_ShouldThrowException() {
        // Given
        Long recordId = 1L;
        User otherUser = new User();
        otherUser.setId(2L);
        ViewingRecord otherRecord = new ViewingRecord();
        otherRecord.setUser(otherUser);
        
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(viewingRecordRepository.findById(recordId)).thenReturn(Optional.of(otherRecord));

        // When & Then
        assertThrows(RuntimeException.class, () -> {
            viewingRecordService.updateViewingRecord(mockUserDetails, recordId, testRecord);
        });
    }

    @Test
    void deleteViewingRecord_WithWrongUser_ShouldThrowException() {
        // Given
        Long recordId = 1L;
        User otherUser = new User();
        otherUser.setId(2L);
        ViewingRecord otherRecord = new ViewingRecord();
        otherRecord.setUser(otherUser);
        
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(viewingRecordRepository.findById(recordId)).thenReturn(Optional.of(otherRecord));

        // When & Then
        assertThrows(RuntimeException.class, () -> {
            viewingRecordService.deleteViewingRecord(mockUserDetails, recordId);
        });
    }

    @Test
    void hasUserWatchedMovie_WithNotWatchedMovie_ShouldReturnFalse() {
        // Given
        Long tmdbMovieId = 123456L;
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(viewingRecordRepository.existsByUserIdAndTmdbMovieId(1L, tmdbMovieId)).thenReturn(false);

        // When
        boolean hasWatched = viewingRecordService.hasUserWatchedMovie(mockUserDetails, tmdbMovieId);

        // Then
        assertFalse(hasWatched);
        verify(userRepository).findByUsername("testuser");
        verify(viewingRecordRepository).existsByUserIdAndTmdbMovieId(1L, tmdbMovieId);
    }

    // Test exception scenarios for user not found
    @Test
    void getUserViewingRecords_WithUserNotFound_ShouldThrowException() {
        // Given
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.empty());

        // When & Then
        assertThrows(RuntimeException.class, () -> {
            viewingRecordService.getUserViewingRecords(mockUserDetails);
        });
    }

    @Test
    void searchUserViewingRecords_WithUserNotFound_ShouldThrowException() {
        // Given
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.empty());

        // When & Then
        assertThrows(RuntimeException.class, () -> {
            viewingRecordService.searchUserViewingRecords(mockUserDetails, "query");
        });
    }

    @Test
    void getUserViewingRecordsByRating_WithUserNotFound_ShouldThrowException() {
        // Given
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.empty());

        // When & Then
        assertThrows(RuntimeException.class, () -> {
            viewingRecordService.getUserViewingRecordsByRating(mockUserDetails, 4.0);
        });
    }

    @Test
    void getUserViewingRecordsByDateRange_WithUserNotFound_ShouldThrowException() {
        // Given
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.empty());

        // When & Then
        assertThrows(RuntimeException.class, () -> {
            viewingRecordService.getUserViewingRecordsByDateRange(mockUserDetails, LocalDateTime.now(), LocalDateTime.now());
        });
    }

    @Test
    void createViewingRecordFromDto_WithTheaterNotFound_ShouldThrowException() {
        // Given
        testDto.setTheaterId(999L);
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(viewingRecordRepository.existsByUserIdAndTmdbMovieId(1L, 123456L)).thenReturn(false);
        when(theaterRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(RuntimeException.class, () -> {
            viewingRecordService.createViewingRecordFromDto(mockUserDetails, testDto);
        });
    }

    @Test
    void updateViewingRecordFromDto_WithTheaterNotFound_ShouldThrowException() {
        // Given
        Long recordId = 1L;
        testDto.setTheaterId(999L);
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(viewingRecordRepository.findById(recordId)).thenReturn(Optional.of(testRecord));
        when(theaterRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(RuntimeException.class, () -> {
            viewingRecordService.updateViewingRecordFromDto(mockUserDetails, recordId, testDto);
        });
    }

    @Test
    void updateViewingRecordFromDto_WithRecordNotFound_ShouldThrowException() {
        // Given
        Long recordId = 999L;
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(viewingRecordRepository.findById(recordId)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(RuntimeException.class, () -> {
            viewingRecordService.updateViewingRecordFromDto(mockUserDetails, recordId, testDto);
        });
    }

    @Test
    void updateViewingRecord_WithRecordNotFound_ShouldThrowException() {
        // Given
        Long recordId = 999L;
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(viewingRecordRepository.findById(recordId)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(RuntimeException.class, () -> {
            viewingRecordService.updateViewingRecord(mockUserDetails, recordId, testRecord);
        });
    }

    @Test
    void deleteViewingRecord_WithRecordNotFound_ShouldThrowException() {
        // Given
        Long recordId = 999L;
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(viewingRecordRepository.findById(recordId)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(RuntimeException.class, () -> {
            viewingRecordService.deleteViewingRecord(mockUserDetails, recordId);
        });
    }

    @Test
    void createViewingRecord_WithUserNotFound_ShouldThrowException() {
        // Given
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.empty());

        // When & Then
        assertThrows(RuntimeException.class, () -> {
            viewingRecordService.createViewingRecord(mockUserDetails, testRecord);
        });
    }

    @Test
    void getViewingRecordById_WithUserNotFound_ShouldThrowException() {
        // Given
        Long recordId = 1L;
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.empty());

        // When & Then
        assertThrows(RuntimeException.class, () -> {
            viewingRecordService.getViewingRecordById(mockUserDetails, recordId);
        });
    }

    @Test
    void getViewingRecordById_WithAccessDenied_ShouldThrowException() {
        // Given
        Long recordId = 1L;
        User otherUser = new User();
        otherUser.setId(999L);
        otherUser.setUsername("otheruser");
        
        ViewingRecord otherRecord = new ViewingRecord();
        otherRecord.setId(recordId);
        otherRecord.setUser(otherUser);
        
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(viewingRecordRepository.findById(recordId)).thenReturn(Optional.of(otherRecord));

        // When & Then
        assertThrows(RuntimeException.class, () -> {
            viewingRecordService.getViewingRecordById(mockUserDetails, recordId);
        });
    }

    @Test
    void updateViewingRecord_WithUserNotFound_ShouldThrowException() {
        // Given
        Long recordId = 1L;
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.empty());

        // When & Then
        assertThrows(RuntimeException.class, () -> {
            viewingRecordService.updateViewingRecord(mockUserDetails, recordId, testRecord);
        });
    }

    @Test
    void deleteViewingRecord_WithUserNotFound_ShouldThrowException() {
        // Given
        Long recordId = 1L;
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.empty());

        // When & Then
        assertThrows(RuntimeException.class, () -> {
            viewingRecordService.deleteViewingRecord(mockUserDetails, recordId);
        });
    }

    @Test
    void getUserTotalMovieCount_WithUserNotFound_ShouldThrowException() {
        // Given
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.empty());

        // When & Then
        assertThrows(RuntimeException.class, () -> {
            viewingRecordService.getUserTotalMovieCount(mockUserDetails);
        });
    }

    @Test
    void getUserAverageRating_WithUserNotFound_ShouldThrowException() {
        // Given
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.empty());

        // When & Then
        assertThrows(RuntimeException.class, () -> {
            viewingRecordService.getUserAverageRating(mockUserDetails);
        });
    }

    @Test
    void hasUserWatchedMovie_WithUserNotFound_ShouldThrowException() {
        // Given
        Long movieId = 123456L;
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.empty());

        // When & Then
        assertThrows(RuntimeException.class, () -> {
            viewingRecordService.hasUserWatchedMovie(mockUserDetails, movieId);
        });
    }

    @Test
    void createViewingRecordFromDto_WithUserNotFound_ShouldThrowException() {
        // Given
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.empty());

        // When & Then
        assertThrows(RuntimeException.class, () -> {
            viewingRecordService.createViewingRecordFromDto(mockUserDetails, testDto);
        });
    }

    @Test
    void updateViewingRecordFromDto_WithUserNotFound_ShouldThrowException() {
        // Given
        Long recordId = 1L;
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.empty());

        // When & Then
        assertThrows(RuntimeException.class, () -> {
            viewingRecordService.updateViewingRecordFromDto(mockUserDetails, recordId, testDto);
        });
    }

    @Test
    void getUserViewingRecordsDto_WithUserNotFound_ShouldThrowException() {
        // Given
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.empty());

        // When & Then
        assertThrows(RuntimeException.class, () -> {
            viewingRecordService.getUserViewingRecordsDto(mockUserDetails);
        });
    }

    @Test
    void getViewingRecordDtoById_WithUserNotFound_ShouldThrowException() {
        // Given
        Long recordId = 1L;
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.empty());

        // When & Then
        assertThrows(RuntimeException.class, () -> {
            viewingRecordService.getViewingRecordDtoById(mockUserDetails, recordId);
        });
    }

    @Test
    void getViewingRecordById_WithRecordNotFound_ShouldReturnEmpty() {
        // Given
        Long recordId = 999L;
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(viewingRecordRepository.findById(recordId)).thenReturn(Optional.empty());

        // When
        Optional<ViewingRecord> result = viewingRecordService.getViewingRecordById(mockUserDetails, recordId);

        // Then
        assertFalse(result.isPresent());
    }

    @Test
    void getUserViewingRecords_WithPageable_AndUserNotFound_ShouldThrowException() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.empty());

        // When & Then
        assertThrows(RuntimeException.class, () -> {
            viewingRecordService.getUserViewingRecords(mockUserDetails, pageable);
        });
    }
}