package com.cinetrack.service;

import com.cinetrack.entity.User;
import com.cinetrack.entity.ViewingRecord;
import com.cinetrack.repository.UserRepository;
import com.cinetrack.repository.ViewingRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ViewingRecordService {
    
    @Autowired
    private ViewingRecordRepository viewingRecordRepository;
    
    @Autowired
    private UserRepository userRepository;
    
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
}