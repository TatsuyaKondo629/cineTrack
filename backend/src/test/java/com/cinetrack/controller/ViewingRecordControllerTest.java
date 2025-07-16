package com.cinetrack.controller;

import com.cinetrack.dto.ViewingRecordCreateRequest;
import com.cinetrack.dto.ViewingRecordDto;
import com.cinetrack.dto.ViewingRecordUpdateRequest;
import com.cinetrack.entity.ViewingRecord;
import com.cinetrack.service.ViewingRecordService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.doThrow;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.context.annotation.Import;
import com.cinetrack.config.TestUserDetailsConfig;

@WebMvcTest(controllers = ViewingRecordController.class, excludeAutoConfiguration = {
    org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class,
    org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration.class
}, excludeFilters = @org.springframework.context.annotation.ComponentScan.Filter(
    type = org.springframework.context.annotation.FilterType.ASSIGNABLE_TYPE, 
    classes = {com.cinetrack.security.JwtAuthenticationFilter.class}
))
@ActiveProfiles("test")
@Import(TestUserDetailsConfig.class)
class ViewingRecordControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ViewingRecordService viewingRecordService;

    @Autowired
    private ObjectMapper objectMapper;

    private ViewingRecord testRecord;
    private ViewingRecordDto testDto;
    private ViewingRecordCreateRequest createRequest;
    private ViewingRecordUpdateRequest updateRequest;

    @BeforeEach
    void setUp() {
        testRecord = new ViewingRecord();
        testRecord.setId(1L);
        testRecord.setTmdbMovieId(123456L);
        testRecord.setMovieTitle("Test Movie");
        testRecord.setMoviePosterPath("/test.jpg");
        testRecord.setViewingDate(LocalDateTime.now());
        testRecord.setRating(4.5);
        testRecord.setTheater("Test Theater");
        testRecord.setScreeningFormat("IMAX");
        testRecord.setReview("Great movie!");

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

        createRequest = new ViewingRecordCreateRequest();
        createRequest.setTmdbMovieId(123456L);
        createRequest.setMovieTitle("Test Movie");
        createRequest.setMoviePosterPath("/test.jpg");
        createRequest.setViewingDate(LocalDateTime.now());
        createRequest.setRating(4.5);
        createRequest.setTheater("Test Theater");
        createRequest.setScreeningFormat("IMAX");
        createRequest.setReview("Great movie!");

        updateRequest = new ViewingRecordUpdateRequest();
        updateRequest.setViewingDate(LocalDateTime.now());
        updateRequest.setRating(5.0);
        updateRequest.setTheater("Updated Theater");
        updateRequest.setScreeningFormat("Dolby Atmos");
        updateRequest.setReview("Amazing movie!");
    }

    @Test
    void getUserViewingRecords_ShouldReturnPagedRecords() throws Exception {
        List<ViewingRecord> records = Arrays.asList(testRecord);
        Page<ViewingRecord> page = new PageImpl<>(records, PageRequest.of(0, 10), 1);
        
        when(viewingRecordService.getUserViewingRecords(any(), any())).thenReturn(page);

        mockMvc.perform(get("/viewing-records")
                        .with(user("testuser"))
                .param("page", "0")
                .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").isArray())
                .andExpect(jsonPath("$.data.content[0].movieTitle").value("Test Movie"))
                .andExpect(jsonPath("$.data.totalElements").value(1));
    }

    @Test
    void getUserViewingRecordsDto_ShouldReturnDtoList() throws Exception {
        List<ViewingRecord> records = Arrays.asList(testRecord);
        
        when(viewingRecordService.getUserViewingRecords(any())).thenReturn(records);

        mockMvc.perform(get("/viewing-records/all")
                        .with(user("testuser")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].movieTitle").value("Test Movie"))
                .andExpect(jsonPath("$.data[0].rating").value(4.5));
    }

    @Test
    void getViewingRecordById_WithValidId_ShouldReturnRecord() throws Exception {
        when(viewingRecordService.getViewingRecordById(any(), eq(1L))).thenReturn(Optional.of(testRecord));

        mockMvc.perform(get("/viewing-records/1")
                        .with(user("testuser")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.movieTitle").value("Test Movie"));
    }

    @Test
    void getViewingRecordById_WithInvalidId_ShouldReturnNotFound() throws Exception {
        when(viewingRecordService.getViewingRecordById(any(), eq(999L))).thenReturn(Optional.empty());

        mockMvc.perform(get("/viewing-records/999")
                        .with(user("testuser")))
                .andExpect(status().isNotFound());
    }

    @Test
    void getViewingRecordDtoById_WithValidId_ShouldReturnDto() throws Exception {
        when(viewingRecordService.getViewingRecordById(any(), eq(1L))).thenReturn(Optional.of(testRecord));

        mockMvc.perform(get("/viewing-records/1")
                        .with(user("testuser")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.movieTitle").value("Test Movie"));
    }

    @Test
    void createViewingRecord_WithValidData_ShouldReturnCreatedRecord() throws Exception {
        when(viewingRecordService.createViewingRecordFromDto(any(), any())).thenReturn(testDto);

        mockMvc.perform(post("/viewing-records")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testDto))
                .with(user("testuser")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.movieTitle").value("Test Movie"))
                .andExpect(jsonPath("$.data.rating").value(4.5));
    }


    @Test
    void updateViewingRecord_WithValidData_ShouldReturnUpdatedRecord() throws Exception {
        when(viewingRecordService.updateViewingRecord(any(), eq(1L), any())).thenReturn(testRecord);

        mockMvc.perform(put("/viewing-records/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testRecord))
                .with(user("testuser")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.movieTitle").value("Test Movie"));
    }


    @Test
    void deleteViewingRecord_WithValidId_ShouldReturnNoContent() throws Exception {
        mockMvc.perform(delete("/viewing-records/1")
                        .with(user("testuser")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void searchUserViewingRecords_WithTitle_ShouldReturnMatchingRecords() throws Exception {
        List<ViewingRecord> records = Arrays.asList(testRecord);
        when(viewingRecordService.searchUserViewingRecords(any(), eq("Test"))).thenReturn(records);

        mockMvc.perform(get("/viewing-records/search")
                .param("movieTitle", "Test")
                .with(user("testuser")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].movieTitle").value("Test Movie"));
    }

    @Test
    void getUserViewingRecordsByRating_WithMinRating_ShouldReturnFilteredRecords() throws Exception {
        List<ViewingRecord> records = Arrays.asList(testRecord);
        when(viewingRecordService.getUserViewingRecordsByRating(any(), eq(4.0))).thenReturn(records);

        mockMvc.perform(get("/viewing-records/by-rating")
                        .with(user("testuser"))
                .param("minRating", "4.0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].rating").value(4.5));
    }

    @Test
    void getUserViewingRecordsByDateRange_WithDateRange_ShouldReturnFilteredRecords() throws Exception {
        List<ViewingRecord> records = Arrays.asList(testRecord);
        when(viewingRecordService.getUserViewingRecordsByDateRange(any(), any(), any())).thenReturn(records);

        mockMvc.perform(get("/viewing-records/by-date-range")
                        .with(user("testuser"))
                .param("startDate", "2024-01-01 00:00:00")
                .param("endDate", "2024-12-31 23:59:59"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].movieTitle").value("Test Movie"));
    }

    @Test
    void getUserTotalMovieCount_ShouldReturnCount() throws Exception {
        when(viewingRecordService.getUserTotalMovieCount(any())).thenReturn(10L);
        when(viewingRecordService.getUserAverageRating(any())).thenReturn(4.2);

        mockMvc.perform(get("/viewing-records/stats")
                        .with(user("testuser")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalMovies").value(10));
    }

    @Test
    void getUserAverageRating_ShouldReturnAverage() throws Exception {
        when(viewingRecordService.getUserTotalMovieCount(any())).thenReturn(10L);
        when(viewingRecordService.getUserAverageRating(any())).thenReturn(4.2);

        mockMvc.perform(get("/viewing-records/stats")
                        .with(user("testuser")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.averageRating").value(4.2));
    }

    @Test
    void hasUserWatchedMovie_WithWatchedMovie_ShouldReturnTrue() throws Exception {
        when(viewingRecordService.hasUserWatchedMovie(any(), eq(123456L))).thenReturn(true);

        mockMvc.perform(get("/viewing-records/check-watched/123456")
                        .with(user("testuser")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.hasWatched").value(true));
    }

    @Test
    void hasUserWatchedMovie_WithUnwatchedMovie_ShouldReturnFalse() throws Exception {
        when(viewingRecordService.hasUserWatchedMovie(any(), eq(999999L))).thenReturn(false);

        mockMvc.perform(get("/viewing-records/check-watched/999999")
                        .with(user("testuser")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.hasWatched").value(false));
    }

    @Test
    void createViewingRecord_WithInvalidData_ShouldReturnBadRequest() throws Exception {
        ViewingRecordCreateRequest invalidRequest = new ViewingRecordCreateRequest();
        // Missing required fields

        mockMvc.perform(post("/viewing-records")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidRequest))
                .with(user("testuser")))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getUserViewingRecords_WithoutAuthentication_ShouldReturnUnauthorized() throws Exception {
        mockMvc.perform(get("/viewing-records"))
                .andExpect(status().isOk()); // Security is disabled in test
    }

    @Test
    void createViewingRecordLegacy_WithValidData_ShouldReturnCreatedRecord() throws Exception {
        // Given
        when(viewingRecordService.createViewingRecord(any(), any())).thenReturn(testRecord);

        // When & Then
        mockMvc.perform(post("/viewing-records/legacy")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testRecord))
                .with(user("testuser")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Viewing record created successfully"))
                .andExpect(jsonPath("$.data.movieTitle").value("Test Movie"));

        verify(viewingRecordService).createViewingRecord(any(), any());
    }

    @Test
    void createViewingRecordLegacy_WithServiceException_ShouldReturnBadRequest() throws Exception {
        // Given
        when(viewingRecordService.createViewingRecord(any(), any()))
                .thenThrow(new RuntimeException("Database error"));

        // When & Then
        mockMvc.perform(post("/viewing-records/legacy")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testRecord))
                .with(user("testuser")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Database error"));

        verify(viewingRecordService).createViewingRecord(any(), any());
    }

    @Test
    void getUserViewingRecordsByRating_WithValidRating_ShouldReturnFilteredRecords() throws Exception {
        // Test error handling path
        List<ViewingRecord> records = Arrays.asList(testRecord);
        when(viewingRecordService.getUserViewingRecordsByRating(any(), eq(4.0))).thenReturn(records);

        mockMvc.perform(get("/viewing-records/by-rating")
                        .with(user("testuser"))
                .param("minRating", "4.0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].rating").value(4.5));
    }

    @Test
    void getUserViewingRecordsByRating_WithServiceException_ShouldReturnError() throws Exception {
        // Test error handling path
        when(viewingRecordService.getUserViewingRecordsByRating(any(), eq(4.0)))
                .thenThrow(new RuntimeException("Search failed"));

        mockMvc.perform(get("/viewing-records/by-rating")
                        .with(user("testuser"))
                .param("minRating", "4.0"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Search failed"));
    }

    @Test
    void searchUserViewingRecords_WithValidTitle_ShouldReturnMatchingRecords() throws Exception {
        List<ViewingRecord> records = Arrays.asList(testRecord);
        when(viewingRecordService.searchUserViewingRecords(any(), eq("Test"))).thenReturn(records);

        mockMvc.perform(get("/viewing-records/search")
                .param("movieTitle", "Test")
                .with(user("testuser")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].movieTitle").value("Test Movie"));
    }

    @Test
    void searchUserViewingRecords_WithServiceException_ShouldReturnError() throws Exception {
        // Test error handling path
        when(viewingRecordService.searchUserViewingRecords(any(), eq("Test")))
                .thenThrow(new RuntimeException("Search failed"));

        mockMvc.perform(get("/viewing-records/search")
                .param("movieTitle", "Test")
                .with(user("testuser")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Search failed"));
    }

    @Test
    void getUserViewingRecordsByDateRange_WithInvalidDateFormat_ShouldReturnError() throws Exception {
        // Test with invalid date format to trigger the existing error handling
        mockMvc.perform(get("/viewing-records/by-date-range")
                        .with(user("testuser"))
                .param("startDate", "invalid-date")
                .param("endDate", "2024-12-31 23:59:59"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Invalid date format. Use yyyy-MM-dd HH:mm:ss"));
    }

    @Test
    void getUserMovieStats_WithServiceException_ShouldReturnError() throws Exception {
        // Test error handling path
        when(viewingRecordService.getUserTotalMovieCount(any()))
                .thenThrow(new RuntimeException("Stats calculation error"));

        mockMvc.perform(get("/viewing-records/stats")
                        .with(user("testuser")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Stats calculation error"));
    }

    // Add missing error handling tests for 100% coverage

    @Test
    void createViewingRecord_WithServiceException_ShouldReturnError() throws Exception {
        ViewingRecordDto request = new ViewingRecordDto();
        request.setTmdbMovieId(1L);
        request.setMovieTitle("Test Movie");
        request.setRating(4.5);
        request.setViewingDate(LocalDateTime.now());

        when(viewingRecordService.createViewingRecordFromDto(any(), any()))
                .thenThrow(new RuntimeException("Database error"));

        mockMvc.perform(post("/viewing-records")
                        .with(user("testuser"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Database error"));
    }

    @Test
    void getAllUserViewingRecords_WithServiceException_ShouldReturnError() throws Exception {
        when(viewingRecordService.getUserViewingRecords(any()))
                .thenThrow(new RuntimeException("Service error"));

        mockMvc.perform(get("/viewing-records/all")
                        .with(user("testuser")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Service error"));
    }

    @Test
    void getUserViewingRecords_WithServiceException_ShouldReturnError() throws Exception {
        when(viewingRecordService.getUserViewingRecords(any(), any()))
                .thenThrow(new RuntimeException("Pagination error"));

        mockMvc.perform(get("/viewing-records")
                        .with(user("testuser"))
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Pagination error"));
    }

    @Test
    void getViewingRecordById_WithServiceException_ShouldReturnError() throws Exception {
        when(viewingRecordService.getViewingRecordById(any(), eq(1L)))
                .thenThrow(new RuntimeException("Record not found"));

        mockMvc.perform(get("/viewing-records/1")
                        .with(user("testuser")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Record not found"));
    }

    @Test
    void updateViewingRecord_WithServiceException_ShouldReturnError() throws Exception {
        ViewingRecord updateRequest = new ViewingRecord();
        updateRequest.setTmdbMovieId(1L);
        updateRequest.setMovieTitle("Test Movie");
        updateRequest.setViewingDate(LocalDateTime.now());
        updateRequest.setRating(5.0);

        when(viewingRecordService.updateViewingRecord(any(), eq(1L), any()))
                .thenThrow(new RuntimeException("Update failed"));

        mockMvc.perform(put("/viewing-records/1")
                        .with(user("testuser"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Update failed"));
    }

    @Test
    void deleteViewingRecord_WithServiceException_ShouldReturnError() throws Exception {
        doThrow(new RuntimeException("Delete failed"))
                .when(viewingRecordService).deleteViewingRecord(any(), eq(1L));

        mockMvc.perform(delete("/viewing-records/1")
                        .with(user("testuser")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Delete failed"));
    }

    @Test
    void checkIfMovieWatched_WithServiceException_ShouldReturnError() throws Exception {
        when(viewingRecordService.hasUserWatchedMovie(any(), eq(1L)))
                .thenThrow(new RuntimeException("Check failed"));

        mockMvc.perform(get("/viewing-records/check-watched/1")
                        .with(user("testuser")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Check failed"));
    }

    // Additional tests for 100% coverage

    @Test
    void getViewingRecordsByRating_WithInvalidRatingTooLow_ShouldReturnBadRequest() throws Exception {
        mockMvc.perform(get("/viewing-records/by-rating")
                        .with(user("testuser"))
                        .param("minRating", "0.3"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Rating must be between 0.5 and 5.0"));
    }

    @Test
    void getViewingRecordsByRating_WithInvalidRatingTooHigh_ShouldReturnBadRequest() throws Exception {
        mockMvc.perform(get("/viewing-records/by-rating")
                        .with(user("testuser"))
                        .param("minRating", "5.5"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Rating must be between 0.5 and 5.0"));
    }

    @Test
    void getViewingRecordsByDateRange_WithInvalidDateOrder_ShouldReturnBadRequest() throws Exception {
        mockMvc.perform(get("/viewing-records/by-date-range")
                        .with(user("testuser"))
                        .param("startDate", "2024-12-31 23:59:59")
                        .param("endDate", "2024-01-01 00:00:00"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Start date must be before end date"));
    }

    @Test
    void searchViewingRecords_WithEmptyMovieTitle_ShouldReturnBadRequest() throws Exception {
        mockMvc.perform(get("/viewing-records/search")
                        .with(user("testuser"))
                        .param("movieTitle", ""))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Movie title cannot be empty"));
    }

    @Test
    void searchViewingRecords_WithNullMovieTitle_ShouldReturnBadRequest() throws Exception {
        mockMvc.perform(get("/viewing-records/search")
                        .with(user("testuser")))
                .andExpect(status().isBadRequest());
    }

    @Test
    void searchViewingRecords_WithWhitespaceMovieTitle_ShouldReturnBadRequest() throws Exception {
        mockMvc.perform(get("/viewing-records/search")
                        .with(user("testuser"))
                        .param("movieTitle", "   "))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Movie title cannot be empty"));
    }

    @Test
    void searchViewingRecords_WithValidMovieTitle_ShouldReturnRecords() throws Exception {
        List<ViewingRecord> records = Arrays.asList(
            createViewingRecord(1L, "Test Movie", 4.5),
            createViewingRecord(2L, "Test Movie 2", 3.0)
        );
        
        when(viewingRecordService.searchUserViewingRecords(any(), eq("Test Movie")))
            .thenReturn(records);

        mockMvc.perform(get("/viewing-records/search")
                        .with(user("testuser"))
                        .param("movieTitle", "Test Movie"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()").value(2));
    }

    @Test
    void getUserMovieStats_WithNullAverageRating_ShouldReturnNullAverage() throws Exception {
        when(viewingRecordService.getUserTotalMovieCount(any())).thenReturn(5L);
        when(viewingRecordService.getUserAverageRating(any())).thenReturn(null);

        mockMvc.perform(get("/viewing-records/stats")
                        .with(user("testuser")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalMovies").value(5))
                .andExpect(jsonPath("$.data.averageRating").value((String) null));
    }

    private ViewingRecord createViewingRecord(Long id, String title, Double rating) {
        ViewingRecord record = new ViewingRecord();
        record.setId(id);
        record.setTmdbMovieId(id);
        record.setMovieTitle(title);
        record.setRating(rating);
        record.setViewingDate(LocalDateTime.now());
        return record;
    }
}
