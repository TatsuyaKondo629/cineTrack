package com.cinetrack.service;

import com.cinetrack.dto.ViewingRecordDto;
import com.cinetrack.dto.TheaterDto;
import com.cinetrack.entity.User;
import com.cinetrack.entity.ViewingRecord;
import com.cinetrack.entity.Theater;
import com.cinetrack.repository.UserRepository;
import com.cinetrack.repository.ViewingRecordRepository;
import com.cinetrack.repository.TheaterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class ViewingRecordService {
    
    @Autowired
    private ViewingRecordRepository viewingRecordRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private TheaterRepository theaterRepository;
    
    @Autowired
    private TheaterService theaterService;
    
    public ViewingRecord createViewingRecord(UserDetails currentUser, ViewingRecord viewingRecord) {
        User user = userRepository.findByUsername(currentUser.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (viewingRecordRepository.existsByUserIdAndTmdbMovieId(user.getId(), viewingRecord.getTmdbMovieId())) {
            throw new RuntimeException("Viewing record for this movie already exists");
        }
        
        viewingRecord.setUser(user);
        return viewingRecordRepository.save(viewingRecord);
    }
    
    public Page<ViewingRecord> getUserViewingRecords(UserDetails currentUser, Pageable pageable) {
        User user = userRepository.findByUsername(currentUser.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return viewingRecordRepository.findByUserIdOrderByViewingDateDesc(user.getId(), pageable);
    }
    
    public List<ViewingRecord> getUserViewingRecords(UserDetails currentUser) {
        User user = userRepository.findByUsername(currentUser.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return viewingRecordRepository.findByUserIdOrderByViewingDateDesc(user.getId());
    }
    
    public Optional<ViewingRecord> getViewingRecordById(UserDetails currentUser, Long recordId) {
        User user = userRepository.findByUsername(currentUser.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Optional<ViewingRecord> record = viewingRecordRepository.findById(recordId);
        
        if (record.isPresent() && !record.get().getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied to this viewing record");
        }
        
        return record;
    }
    
    public ViewingRecord updateViewingRecord(UserDetails currentUser, Long recordId, ViewingRecord updatedRecord) {
        User user = userRepository.findByUsername(currentUser.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        ViewingRecord existingRecord = viewingRecordRepository.findById(recordId)
                .orElseThrow(() -> new RuntimeException("Viewing record not found"));
        
        if (!existingRecord.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied to this viewing record");
        }
        
        existingRecord.setRating(updatedRecord.getRating());
        existingRecord.setViewingDate(updatedRecord.getViewingDate());
        existingRecord.setTheater(updatedRecord.getTheater());
        existingRecord.setTheaterEntity(updatedRecord.getTheaterEntity());
        existingRecord.setScreeningFormat(updatedRecord.getScreeningFormat());
        existingRecord.setReview(updatedRecord.getReview());
        
        return viewingRecordRepository.save(existingRecord);
    }
    
    public void deleteViewingRecord(UserDetails currentUser, Long recordId) {
        User user = userRepository.findByUsername(currentUser.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        ViewingRecord record = viewingRecordRepository.findById(recordId)
                .orElseThrow(() -> new RuntimeException("Viewing record not found"));
        
        if (!record.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied to this viewing record");
        }
        
        viewingRecordRepository.delete(record);
    }
    
    public List<ViewingRecord> searchUserViewingRecords(UserDetails currentUser, String movieTitle) {
        User user = userRepository.findByUsername(currentUser.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return viewingRecordRepository.findByUserIdAndMovieTitleContainingIgnoreCase(user.getId(), movieTitle);
    }
    
    public List<ViewingRecord> getUserViewingRecordsByRating(UserDetails currentUser, Double minRating) {
        User user = userRepository.findByUsername(currentUser.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return viewingRecordRepository.findByUserIdAndRatingGreaterThanEqual(user.getId(), minRating);
    }
    
    public List<ViewingRecord> getUserViewingRecordsByDateRange(UserDetails currentUser, LocalDateTime startDate, LocalDateTime endDate) {
        User user = userRepository.findByUsername(currentUser.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return viewingRecordRepository.findByUserIdAndViewingDateBetween(user.getId(), startDate, endDate);
    }
    
    public Long getUserTotalMovieCount(UserDetails currentUser) {
        User user = userRepository.findByUsername(currentUser.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return viewingRecordRepository.countByUserId(user.getId());
    }
    
    public Double getUserAverageRating(UserDetails currentUser) {
        User user = userRepository.findByUsername(currentUser.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return viewingRecordRepository.findAverageRatingByUserId(user.getId());
    }
    
    public boolean hasUserWatchedMovie(UserDetails currentUser, Long tmdbMovieId) {
        User user = userRepository.findByUsername(currentUser.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return viewingRecordRepository.existsByUserIdAndTmdbMovieId(user.getId(), tmdbMovieId);
    }
    
    // DTO-based methods
    
    public ViewingRecordDto createViewingRecordFromDto(UserDetails currentUser, ViewingRecordDto dto) {
        User user = userRepository.findByUsername(currentUser.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (viewingRecordRepository.existsByUserIdAndTmdbMovieId(user.getId(), dto.getTmdbMovieId())) {
            throw new RuntimeException("Viewing record for this movie already exists");
        }
        
        ViewingRecord viewingRecord = convertToEntity(dto);
        viewingRecord.setUser(user);
        
        // Handle theater relationship
        if (dto.getTheaterId() != null) {
            Theater theater = theaterRepository.findById(dto.getTheaterId())
                    .orElseThrow(() -> new RuntimeException("Theater not found"));
            viewingRecord.setTheaterEntity(theater);
            viewingRecord.setTheater(theater.getName()); // Also set the string field
        }
        
        ViewingRecord savedRecord = viewingRecordRepository.save(viewingRecord);
        return convertToDto(savedRecord);
    }
    
    public ViewingRecordDto updateViewingRecordFromDto(UserDetails currentUser, Long recordId, ViewingRecordDto dto) {
        User user = userRepository.findByUsername(currentUser.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        ViewingRecord existingRecord = viewingRecordRepository.findById(recordId)
                .orElseThrow(() -> new RuntimeException("Viewing record not found"));
        
        if (!existingRecord.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied to this viewing record");
        }
        
        updateEntityFromDto(existingRecord, dto);
        
        // Handle theater relationship
        if (dto.getTheaterId() != null) {
            Theater theater = theaterRepository.findById(dto.getTheaterId())
                    .orElseThrow(() -> new RuntimeException("Theater not found"));
            existingRecord.setTheaterEntity(theater);
            existingRecord.setTheater(theater.getName()); // Also set the string field
        } else {
            existingRecord.setTheaterEntity(null);
        }
        
        ViewingRecord savedRecord = viewingRecordRepository.save(existingRecord);
        return convertToDto(savedRecord);
    }
    
    public List<ViewingRecordDto> getUserViewingRecordsDto(UserDetails currentUser) {
        User user = userRepository.findByUsername(currentUser.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return viewingRecordRepository.findByUserIdOrderByViewingDateDesc(user.getId())
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public Optional<ViewingRecordDto> getViewingRecordDtoById(UserDetails currentUser, Long recordId) {
        User user = userRepository.findByUsername(currentUser.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Optional<ViewingRecord> record = viewingRecordRepository.findById(recordId);
        
        if (record.isPresent() && !record.get().getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied to this viewing record");
        }
        
        return record.map(this::convertToDto);
    }
    
    // Private helper methods for DTO conversion
    
    private ViewingRecordDto convertToDto(ViewingRecord entity) {
        ViewingRecordDto dto = new ViewingRecordDto();
        dto.setId(entity.getId());
        dto.setTmdbMovieId(entity.getTmdbMovieId());
        dto.setMovieTitle(entity.getMovieTitle());
        dto.setMoviePosterPath(entity.getMoviePosterPath());
        dto.setViewingDate(entity.getViewingDate());
        dto.setRating(entity.getRating());
        dto.setTheater(entity.getTheater());
        dto.setScreeningFormat(entity.getScreeningFormat());
        dto.setReview(entity.getReview());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        
        // Set theater information if available
        if (entity.getTheaterEntity() != null) {
            dto.setTheaterId(entity.getTheaterEntity().getId());
            dto.setTheaterInfo(theaterService.getTheaterById(entity.getTheaterEntity().getId()).orElse(null));
        }
        
        return dto;
    }
    
    private ViewingRecord convertToEntity(ViewingRecordDto dto) {
        ViewingRecord entity = new ViewingRecord();
        updateEntityFromDto(entity, dto);
        return entity;
    }
    
    private void updateEntityFromDto(ViewingRecord entity, ViewingRecordDto dto) {
        entity.setTmdbMovieId(dto.getTmdbMovieId());
        entity.setMovieTitle(dto.getMovieTitle());
        entity.setMoviePosterPath(dto.getMoviePosterPath());
        entity.setViewingDate(dto.getViewingDate());
        entity.setRating(dto.getRating());
        entity.setTheater(dto.getTheater());
        entity.setScreeningFormat(dto.getScreeningFormat());
        entity.setReview(dto.getReview());
    }
}