package com.cinetrack.controller;

import com.cinetrack.dto.ApiResponse;
import com.cinetrack.entity.ViewingRecord;
import com.cinetrack.service.ViewingRecordService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/viewing-records")
@CrossOrigin(origins = "*")
public class ViewingRecordController {
    
    @Autowired
    private ViewingRecordService viewingRecordService;
    
    @PostMapping
    public ResponseEntity<ApiResponse<ViewingRecord>> createViewingRecord(
            @AuthenticationPrincipal UserDetails currentUser,
            @Valid @RequestBody ViewingRecord viewingRecord) {
        
        try {
            ViewingRecord createdRecord = viewingRecordService.createViewingRecord(currentUser, viewingRecord);
            return ResponseEntity.ok(ApiResponse.success("Viewing record created successfully", createdRecord));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @GetMapping
    public ResponseEntity<ApiResponse<Page<ViewingRecord>>> getUserViewingRecords(
            @AuthenticationPrincipal UserDetails currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<ViewingRecord> records = viewingRecordService.getUserViewingRecords(currentUser, pageable);
            return ResponseEntity.ok(ApiResponse.success("Viewing records retrieved successfully", records));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<ViewingRecord>>> getAllUserViewingRecords(
            @AuthenticationPrincipal UserDetails currentUser) {
        
        try {
            List<ViewingRecord> records = viewingRecordService.getUserViewingRecords(currentUser);
            return ResponseEntity.ok(ApiResponse.success("All viewing records retrieved successfully", records));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @GetMapping("/{recordId}")
    public ResponseEntity<ApiResponse<ViewingRecord>> getViewingRecordById(
            @AuthenticationPrincipal UserDetails currentUser,
            @PathVariable Long recordId) {
        
        try {
            Optional<ViewingRecord> record = viewingRecordService.getViewingRecordById(currentUser, recordId);
            if (record.isPresent()) {
                return ResponseEntity.ok(ApiResponse.success("Viewing record retrieved successfully", record.get()));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @PutMapping("/{recordId}")
    public ResponseEntity<ApiResponse<ViewingRecord>> updateViewingRecord(
            @AuthenticationPrincipal UserDetails currentUser,
            @PathVariable Long recordId,
            @Valid @RequestBody ViewingRecord updatedRecord) {
        
        try {
            ViewingRecord record = viewingRecordService.updateViewingRecord(currentUser, recordId, updatedRecord);
            return ResponseEntity.ok(ApiResponse.success("Viewing record updated successfully", record));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @DeleteMapping("/{recordId}")
    public ResponseEntity<ApiResponse<String>> deleteViewingRecord(
            @AuthenticationPrincipal UserDetails currentUser,
            @PathVariable Long recordId) {
        
        try {
            viewingRecordService.deleteViewingRecord(currentUser, recordId);
            return ResponseEntity.ok(ApiResponse.success("Viewing record deleted successfully", null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<ViewingRecord>>> searchViewingRecords(
            @AuthenticationPrincipal UserDetails currentUser,
            @RequestParam String movieTitle) {
        
        try {
            if (movieTitle == null || movieTitle.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Movie title cannot be empty"));
            }
            
            List<ViewingRecord> records = viewingRecordService.searchUserViewingRecords(currentUser, movieTitle.trim());
            return ResponseEntity.ok(ApiResponse.success("Viewing records search completed successfully", records));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @GetMapping("/by-rating")
    public ResponseEntity<ApiResponse<List<ViewingRecord>>> getViewingRecordsByRating(
            @AuthenticationPrincipal UserDetails currentUser,
            @RequestParam Double minRating) {
        
        try {
            if (minRating < 0.5 || minRating > 5.0) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Rating must be between 0.5 and 5.0"));
            }
            
            List<ViewingRecord> records = viewingRecordService.getUserViewingRecordsByRating(currentUser, minRating);
            return ResponseEntity.ok(ApiResponse.success("Viewing records by rating retrieved successfully", records));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @GetMapping("/by-date-range")
    public ResponseEntity<ApiResponse<List<ViewingRecord>>> getViewingRecordsByDateRange(
            @AuthenticationPrincipal UserDetails currentUser,
            @RequestParam String startDate,
            @RequestParam String endDate) {
        
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
            LocalDateTime start = LocalDateTime.parse(startDate, formatter);
            LocalDateTime end = LocalDateTime.parse(endDate, formatter);
            
            if (start.isAfter(end)) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Start date must be before end date"));
            }
            
            List<ViewingRecord> records = viewingRecordService.getUserViewingRecordsByDateRange(currentUser, start, end);
            return ResponseEntity.ok(ApiResponse.success("Viewing records by date range retrieved successfully", records));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid date format. Use yyyy-MM-dd HH:mm:ss"));
        }
    }
    
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Object>> getUserMovieStats(
            @AuthenticationPrincipal UserDetails currentUser) {
        
        try {
            Long totalCount = viewingRecordService.getUserTotalMovieCount(currentUser);
            Double averageRating = viewingRecordService.getUserAverageRating(currentUser);
            
            java.util.Map<String, Object> stats = new java.util.HashMap<>();
            stats.put("totalMovies", totalCount);
            stats.put("averageRating", averageRating != null ? Math.round(averageRating * 100.0) / 100.0 : null);
            
            return ResponseEntity.ok(ApiResponse.success("User movie statistics retrieved successfully", stats));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @GetMapping("/check-watched/{tmdbMovieId}")
    public ResponseEntity<ApiResponse<Object>> checkIfMovieWatched(
            @AuthenticationPrincipal UserDetails currentUser,
            @PathVariable Long tmdbMovieId) {
        
        try {
            boolean hasWatched = viewingRecordService.hasUserWatchedMovie(currentUser, tmdbMovieId);
            
            java.util.Map<String, Object> result = new java.util.HashMap<>();
            result.put("hasWatched", hasWatched);
            result.put("movieId", tmdbMovieId);
            
            return ResponseEntity.ok(ApiResponse.success("Movie watch status checked successfully", result));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}