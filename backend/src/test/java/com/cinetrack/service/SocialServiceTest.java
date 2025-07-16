package com.cinetrack.service;

import com.cinetrack.dto.ActivityDto;
import com.cinetrack.dto.UserDto;
import com.cinetrack.dto.ViewingRecordDto;
import com.cinetrack.entity.Follow;
import com.cinetrack.entity.User;
import com.cinetrack.entity.ViewingRecord;
import com.cinetrack.entity.Wishlist;
import com.cinetrack.repository.FollowRepository;
import com.cinetrack.repository.UserRepository;
import com.cinetrack.repository.ViewingRecordRepository;
import com.cinetrack.repository.WishlistRepository;
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
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
class SocialServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private FollowRepository followRepository;

    @Mock
    private ViewingRecordRepository viewingRecordRepository;

    @Mock
    private WishlistRepository wishlistRepository;

    @InjectMocks
    private SocialService socialService;

    private User currentUser;
    private User targetUser;
    private User otherUser;
    private UserDetails mockUserDetails;
    private ViewingRecord viewingRecord;
    private Wishlist wishlistItem;

    @BeforeEach
    void setUp() {
        currentUser = new User();
        currentUser.setId(1L);
        currentUser.setUsername("currentuser");
        currentUser.setEmail("current@example.com");
        currentUser.setDisplayName("Current User");
        currentUser.setBio("Current user bio");
        currentUser.setCreatedAt(LocalDateTime.now().minusYears(1));

        targetUser = new User();
        targetUser.setId(2L);
        targetUser.setUsername("targetuser");
        targetUser.setEmail("target@example.com");
        targetUser.setDisplayName("Target User");
        targetUser.setBio("Target user bio");
        targetUser.setCreatedAt(LocalDateTime.now().minusMonths(6));

        otherUser = new User();
        otherUser.setId(3L);
        otherUser.setUsername("otheruser");
        otherUser.setEmail("other@example.com");
        otherUser.setDisplayName("Other User");
        otherUser.setCreatedAt(LocalDateTime.now().minusMonths(3));

        mockUserDetails = mock(UserDetails.class);
        when(mockUserDetails.getUsername()).thenReturn("currentuser");

        viewingRecord = new ViewingRecord();
        viewingRecord.setId(1L);
        viewingRecord.setUser(targetUser);
        viewingRecord.setTmdbMovieId(123456L);
        viewingRecord.setMovieTitle("Test Movie");
        viewingRecord.setMoviePosterPath("/test.jpg");
        viewingRecord.setRating(4.5);
        viewingRecord.setReview("Great movie!");
        viewingRecord.setViewingDate(LocalDateTime.now().minusDays(1));
        viewingRecord.setCreatedAt(LocalDateTime.now().minusDays(1));

        wishlistItem = new Wishlist();
        wishlistItem.setId(1L);
        wishlistItem.setUser(targetUser);
        wishlistItem.setTmdbMovieId(789012L);
        wishlistItem.setMovieTitle("Wishlist Movie");
        wishlistItem.setMoviePosterPath("/wishlist.jpg");
        wishlistItem.setCreatedAt(LocalDateTime.now().minusDays(2));
    }

    @Test
    void searchUsers_WithValidQuery_ShouldReturnMatchingUsers() {
        // Given
        String query = "target";
        Pageable pageable = PageRequest.of(0, 10);
        when(userRepository.findByUsername("currentuser")).thenReturn(Optional.of(currentUser));
        when(userRepository.findByUsernameContainingIgnoreCaseAndIdNotOrderByUsernameAsc(query, currentUser.getId(), pageable))
                .thenReturn(new PageImpl<>(List.of(targetUser)));

        // When
        Page<UserDto> result = socialService.searchUsers(query, mockUserDetails, pageable);

        // Then
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("targetuser", result.getContent().get(0).getUsername());

        verify(userRepository).findByUsername("currentuser");
        verify(userRepository).findByUsernameContainingIgnoreCaseAndIdNotOrderByUsernameAsc(query, currentUser.getId(), pageable);
    }

    @Test
    void searchUsers_WithNullQuery_ShouldReturnAllUsers() {
        // Given
        String query = null;
        Pageable pageable = PageRequest.of(0, 10);
        when(userRepository.findByUsername("currentuser")).thenReturn(Optional.of(currentUser));
        when(userRepository.findByIdNotOrderByUsernameAsc(currentUser.getId(), pageable))
                .thenReturn(new PageImpl<>(List.of(targetUser)));

        // When
        Page<UserDto> result = socialService.searchUsers(query, mockUserDetails, pageable);

        // Then
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        verify(userRepository).findByIdNotOrderByUsernameAsc(currentUser.getId(), pageable);
    }

    @Test
    void getUserById_WithValidId_ShouldReturnUser() {
        // Given
        Long userId = 2L;
        when(userRepository.findByUsername("currentuser")).thenReturn(Optional.of(currentUser));
        when(userRepository.findById(userId)).thenReturn(Optional.of(targetUser));

        // When
        Optional<UserDto> result = socialService.getUserById(userId, mockUserDetails);

        // Then
        assertTrue(result.isPresent());
        assertEquals("targetuser", result.get().getUsername());
        assertEquals("target@example.com", result.get().getEmail());

        verify(userRepository).findByUsername("currentuser");
        verify(userRepository).findById(userId);
    }

    @Test
    void getUserById_WithNonExistingId_ShouldReturnEmpty() {
        // Given
        Long userId = 999L;
        when(userRepository.findByUsername("currentuser")).thenReturn(Optional.of(currentUser));
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        // When
        Optional<UserDto> result = socialService.getUserById(userId, mockUserDetails);

        // Then
        assertFalse(result.isPresent());
        verify(userRepository).findByUsername("currentuser");
        verify(userRepository).findById(userId);
    }

    @Test
    void followUser_WithValidUserId_ShouldCreateFollowRelationship() {
        // Given
        Long targetUserId = 2L;
        when(userRepository.findByUsername("currentuser")).thenReturn(Optional.of(currentUser));
        when(userRepository.findById(targetUserId)).thenReturn(Optional.of(targetUser));
        when(followRepository.existsByFollowerIdAndFollowingId(currentUser.getId(), targetUserId)).thenReturn(false);

        // When
        boolean result = socialService.followUser(targetUserId, mockUserDetails);

        // Then
        assertTrue(result);
        verify(userRepository).findByUsername("currentuser");
        verify(userRepository).findById(targetUserId);
        verify(followRepository).existsByFollowerIdAndFollowingId(currentUser.getId(), targetUserId);
        verify(followRepository).save(any(Follow.class));
    }

    @Test
    void followUser_WithAlreadyFollowedUser_ShouldReturnFalse() {
        // Given
        Long targetUserId = 2L;
        when(userRepository.findByUsername("currentuser")).thenReturn(Optional.of(currentUser));
        when(userRepository.findById(targetUserId)).thenReturn(Optional.of(targetUser));
        when(followRepository.existsByFollowerIdAndFollowingId(currentUser.getId(), targetUserId)).thenReturn(true);

        // When
        boolean result = socialService.followUser(targetUserId, mockUserDetails);

        // Then
        assertFalse(result);
        verify(userRepository).findByUsername("currentuser");
        verify(userRepository).findById(targetUserId);
        verify(followRepository).existsByFollowerIdAndFollowingId(currentUser.getId(), targetUserId);
        verify(followRepository, never()).save(any(Follow.class));
    }

    @Test
    void followUser_WithSelfId_ShouldThrowException() {
        // Given
        Long targetUserId = 1L; // Same as current user
        when(userRepository.findByUsername("currentuser")).thenReturn(Optional.of(currentUser));

        // When & Then
        assertThrows(RuntimeException.class, () -> {
            socialService.followUser(targetUserId, mockUserDetails);
        });
        verify(userRepository).findByUsername("currentuser");
        verify(userRepository, never()).findById(anyLong());
    }

    @Test
    void followUser_WithNonExistingUser_ShouldThrowException() {
        // Given
        Long targetUserId = 999L;
        when(userRepository.findByUsername("currentuser")).thenReturn(Optional.of(currentUser));
        when(userRepository.findById(targetUserId)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(RuntimeException.class, () -> {
            socialService.followUser(targetUserId, mockUserDetails);
        });
        verify(userRepository).findByUsername("currentuser");
        verify(userRepository).findById(targetUserId);
    }

    @Test
    void unfollowUser_WithValidUserId_ShouldRemoveFollowRelationship() {
        // Given
        Long targetUserId = 2L;
        when(userRepository.findByUsername("currentuser")).thenReturn(Optional.of(currentUser));
        when(followRepository.existsByFollowerIdAndFollowingId(currentUser.getId(), targetUserId)).thenReturn(true);

        // When
        boolean result = socialService.unfollowUser(targetUserId, mockUserDetails);

        // Then
        assertTrue(result);
        verify(userRepository).findByUsername("currentuser");
        verify(followRepository).existsByFollowerIdAndFollowingId(currentUser.getId(), targetUserId);
        verify(followRepository).deleteByFollowerIdAndFollowingId(currentUser.getId(), targetUserId);
    }

    @Test
    void unfollowUser_WithNotFollowedUser_ShouldReturnFalse() {
        // Given
        Long targetUserId = 2L;
        when(userRepository.findByUsername("currentuser")).thenReturn(Optional.of(currentUser));
        when(followRepository.existsByFollowerIdAndFollowingId(currentUser.getId(), targetUserId)).thenReturn(false);

        // When
        boolean result = socialService.unfollowUser(targetUserId, mockUserDetails);

        // Then
        assertFalse(result);
        verify(userRepository).findByUsername("currentuser");
        verify(followRepository).existsByFollowerIdAndFollowingId(currentUser.getId(), targetUserId);
        verify(followRepository, never()).deleteByFollowerIdAndFollowingId(anyLong(), anyLong());
    }

    @Test
    void getFollowing_WithValidUserId_ShouldReturnFollowingUsers() {
        // Given
        Long userId = 1L;
        when(userRepository.findByUsername("currentuser")).thenReturn(Optional.of(currentUser));
        when(followRepository.findFollowingByUserId(userId)).thenReturn(List.of(targetUser));

        // When
        List<UserDto> result = socialService.getFollowing(userId, mockUserDetails);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("targetuser", result.get(0).getUsername());

        verify(userRepository).findByUsername("currentuser");
        verify(followRepository).findFollowingByUserId(userId);
    }

    @Test
    void getFollowers_WithValidUserId_ShouldReturnFollowerUsers() {
        // Given
        Long userId = 1L;
        when(userRepository.findByUsername("currentuser")).thenReturn(Optional.of(currentUser));
        when(followRepository.findFollowersByUserId(userId)).thenReturn(List.of(targetUser));

        // When
        List<UserDto> result = socialService.getFollowers(userId, mockUserDetails);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("targetuser", result.get(0).getUsername());

        verify(userRepository).findByUsername("currentuser");
        verify(followRepository).findFollowersByUserId(userId);
    }

    @Test
    void getUserStats_WithValidUserId_ShouldReturnUserStats() {
        // Given
        Long userId = 2L;
        when(userRepository.findByUsername("currentuser")).thenReturn(Optional.of(currentUser));
        when(userRepository.findById(userId)).thenReturn(Optional.of(targetUser));

        // When
        UserDto result = socialService.getUserStats(userId, mockUserDetails);

        // Then
        assertNotNull(result);
        assertEquals("targetuser", result.getUsername());
        assertEquals("target@example.com", result.getEmail());

        verify(userRepository).findByUsername("currentuser");
        verify(userRepository).findById(userId);
    }

    @Test
    void getUserStats_WithUserNotFound_ShouldThrowException() {
        // Given
        Long userId = 999L;
        when(userRepository.findByUsername("currentuser")).thenReturn(Optional.of(currentUser));
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(RuntimeException.class, () -> {
            socialService.getUserStats(userId, mockUserDetails);
        });
        verify(userRepository).findByUsername("currentuser");
        verify(userRepository).findById(userId);
    }

    @Test
    void searchUsers_WithEmptyQuery_ShouldReturnAllUsers() {
        // Given
        String query = "";
        Pageable pageable = PageRequest.of(0, 10);
        when(userRepository.findByUsername("currentuser")).thenReturn(Optional.of(currentUser));
        when(userRepository.findByIdNotOrderByUsernameAsc(currentUser.getId(), pageable))
                .thenReturn(new PageImpl<>(List.of(targetUser)));

        // When
        Page<UserDto> result = socialService.searchUsers(query, mockUserDetails, pageable);

        // Then
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        verify(userRepository).findByIdNotOrderByUsernameAsc(currentUser.getId(), pageable);
    }

    @Test
    void searchUsers_WithCurrentUserNotFound_ShouldThrowException() {
        // Given
        String query = "test";
        Pageable pageable = PageRequest.of(0, 10);
        when(userRepository.findByUsername("currentuser")).thenReturn(Optional.empty());

        // When & Then
        assertThrows(RuntimeException.class, () -> {
            socialService.searchUsers(query, mockUserDetails, pageable);
        });
        verify(userRepository).findByUsername("currentuser");
    }

    @Test
    void getUserViewingRecords_WithSameUserId_ShouldReturnViewingRecords() {
        // Given
        Long userId = 1L; // Same as current user
        Pageable pageable = PageRequest.of(0, 10);
        when(userRepository.findByUsername("currentuser")).thenReturn(Optional.of(currentUser));
        when(viewingRecordRepository.findByUserIdOrderByViewingDateDesc(userId, pageable))
                .thenReturn(new PageImpl<>(List.of(viewingRecord)));

        // When
        Page<ViewingRecordDto> result = socialService.getUserViewingRecords(userId, mockUserDetails, pageable);

        // Then
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("Test Movie", result.getContent().get(0).getMovieTitle());

        verify(userRepository).findByUsername("currentuser");
        verify(viewingRecordRepository).findByUserIdOrderByViewingDateDesc(userId, pageable);
    }

    @Test
    void getUserViewingRecords_WithFollowedUser_ShouldReturnViewingRecords() {
        // Given
        Long userId = 2L;
        Pageable pageable = PageRequest.of(0, 10);
        when(userRepository.findByUsername("currentuser")).thenReturn(Optional.of(currentUser));
        when(followRepository.existsByFollowerIdAndFollowingId(currentUser.getId(), userId)).thenReturn(true);
        when(viewingRecordRepository.findByUserIdOrderByViewingDateDesc(userId, pageable))
                .thenReturn(new PageImpl<>(List.of(viewingRecord)));

        // When
        Page<ViewingRecordDto> result = socialService.getUserViewingRecords(userId, mockUserDetails, pageable);

        // Then
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("Test Movie", result.getContent().get(0).getMovieTitle());

        verify(userRepository).findByUsername("currentuser");
        verify(followRepository).existsByFollowerIdAndFollowingId(currentUser.getId(), userId);
        verify(viewingRecordRepository).findByUserIdOrderByViewingDateDesc(userId, pageable);
    }

    @Test
    void getUserViewingRecords_WithNonFollowedUser_ShouldThrowException() {
        // Given
        Long userId = 2L;
        Pageable pageable = PageRequest.of(0, 10);
        when(userRepository.findByUsername("currentuser")).thenReturn(Optional.of(currentUser));
        when(followRepository.existsByFollowerIdAndFollowingId(currentUser.getId(), userId)).thenReturn(false);

        // When & Then
        assertThrows(RuntimeException.class, () -> {
            socialService.getUserViewingRecords(userId, mockUserDetails, pageable);
        });
        verify(userRepository).findByUsername("currentuser");
        verify(followRepository).existsByFollowerIdAndFollowingId(currentUser.getId(), userId);
    }

    @Test
    void getActivityFeed_WithValidUser_ShouldReturnActivityFeed() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        when(userRepository.findByUsername("currentuser")).thenReturn(Optional.of(currentUser));
        when(followRepository.findFollowingByUserId(1L)).thenReturn(List.of(targetUser, otherUser));
        when(viewingRecordRepository.findTop20ByUserIdOrderByCreatedAtDesc(2L)).thenReturn(List.of(viewingRecord));
        when(viewingRecordRepository.findTop20ByUserIdOrderByCreatedAtDesc(3L)).thenReturn(List.of());
        when(viewingRecordRepository.findTop20ByUserIdOrderByCreatedAtDesc(1L)).thenReturn(List.of());
        when(wishlistRepository.findTop10ByUserIdOrderByCreatedAtDesc(2L)).thenReturn(List.of(wishlistItem));
        when(wishlistRepository.findTop10ByUserIdOrderByCreatedAtDesc(3L)).thenReturn(List.of());
        when(wishlistRepository.findTop10ByUserIdOrderByCreatedAtDesc(1L)).thenReturn(List.of());

        // When
        Page<ActivityDto> result = socialService.getActivityFeed(mockUserDetails, pageable);

        // Then
        assertNotNull(result);
        assertTrue(result.getTotalElements() >= 2);

        verify(userRepository).findByUsername("currentuser");
        verify(followRepository).findFollowingByUserId(1L);
        verify(viewingRecordRepository, times(3)).findTop20ByUserIdOrderByCreatedAtDesc(anyLong());
        verify(wishlistRepository, times(3)).findTop10ByUserIdOrderByCreatedAtDesc(anyLong());
    }

    @Test
    void getActivityFeed_WithUserNotFound_ShouldThrowException() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        when(userRepository.findByUsername("currentuser")).thenReturn(Optional.empty());

        // When & Then
        assertThrows(RuntimeException.class, () -> {
            socialService.getActivityFeed(mockUserDetails, pageable);
        });
        verify(userRepository).findByUsername("currentuser");
    }

    @Test
    void getActivityFeed_WithNoFollowedUsers_ShouldReturnEmptyPage() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        when(userRepository.findByUsername("currentuser")).thenReturn(Optional.of(currentUser));
        when(followRepository.findFollowingByUserId(1L)).thenReturn(List.of());
        when(viewingRecordRepository.findTop20ByUserIdOrderByCreatedAtDesc(1L)).thenReturn(List.of());
        when(wishlistRepository.findTop10ByUserIdOrderByCreatedAtDesc(1L)).thenReturn(List.of());

        // When
        Page<ActivityDto> result = socialService.getActivityFeed(mockUserDetails, pageable);

        // Then
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(followRepository).findFollowingByUserId(1L);
    }

    @Test
    void getActivityFeed_WithUsersWithoutDisplayName_ShouldUseUsername() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        User userWithoutDisplayName = new User();
        userWithoutDisplayName.setId(4L);
        userWithoutDisplayName.setUsername("nondisplayuser");
        userWithoutDisplayName.setDisplayName(null);

        ViewingRecord recordWithoutDisplayName = new ViewingRecord();
        recordWithoutDisplayName.setId(2L);
        recordWithoutDisplayName.setUser(userWithoutDisplayName);
        recordWithoutDisplayName.setTmdbMovieId(999L);
        recordWithoutDisplayName.setMovieTitle("Test Movie");
        recordWithoutDisplayName.setCreatedAt(LocalDateTime.now());

        Wishlist wishlistWithoutDisplayName = new Wishlist();
        wishlistWithoutDisplayName.setId(2L);
        wishlistWithoutDisplayName.setUser(userWithoutDisplayName);
        wishlistWithoutDisplayName.setTmdbMovieId(888L);
        wishlistWithoutDisplayName.setMovieTitle("Wishlist Movie");
        wishlistWithoutDisplayName.setCreatedAt(LocalDateTime.now());

        when(userRepository.findByUsername("currentuser")).thenReturn(Optional.of(currentUser));
        when(followRepository.findFollowingByUserId(1L)).thenReturn(List.of(userWithoutDisplayName));
        when(viewingRecordRepository.findTop20ByUserIdOrderByCreatedAtDesc(1L)).thenReturn(List.of());
        when(viewingRecordRepository.findTop20ByUserIdOrderByCreatedAtDesc(4L)).thenReturn(List.of(recordWithoutDisplayName));
        when(wishlistRepository.findTop10ByUserIdOrderByCreatedAtDesc(1L)).thenReturn(List.of());
        when(wishlistRepository.findTop10ByUserIdOrderByCreatedAtDesc(4L)).thenReturn(List.of(wishlistWithoutDisplayName));

        // When
        Page<ActivityDto> result = socialService.getActivityFeed(mockUserDetails, pageable);

        // Then
        assertNotNull(result);
        assertEquals(2, result.getTotalElements());
        boolean hasViewingActivity = result.getContent().stream()
                .anyMatch(activity -> activity.getActivityType().equals("VIEW_MOVIE") && 
                         activity.getDescription().contains("nondisplayuser"));
        boolean hasWishlistActivity = result.getContent().stream()
                .anyMatch(activity -> activity.getActivityType().equals("ADD_TO_WISHLIST") && 
                         activity.getDescription().contains("nondisplayuser"));
        assertTrue(hasViewingActivity);
        assertTrue(hasWishlistActivity);
    }

    @Test
    void getActivityFeed_WithLargeOffset_ShouldReturnEmptyPage() {
        // Given
        Pageable pageable = PageRequest.of(10, 10); // Large offset
        when(userRepository.findByUsername("currentuser")).thenReturn(Optional.of(currentUser));
        when(followRepository.findFollowingByUserId(1L)).thenReturn(List.of());
        when(viewingRecordRepository.findTop20ByUserIdOrderByCreatedAtDesc(1L)).thenReturn(List.of());
        when(wishlistRepository.findTop10ByUserIdOrderByCreatedAtDesc(1L)).thenReturn(List.of());

        // When
        Page<ActivityDto> result = socialService.getActivityFeed(mockUserDetails, pageable);

        // Then
        assertNotNull(result);
        assertTrue(result.isEmpty());
        assertEquals(0, result.getTotalElements());
    }

    @Test
    void convertToDto_WithSameUserAsCurrent_ShouldSetFollowingFieldsToNull() {
        // Given
        when(userRepository.findByUsername("currentuser")).thenReturn(Optional.of(currentUser));
        when(userRepository.findById(1L)).thenReturn(Optional.of(currentUser));
        when(followRepository.countFollowersByUserId(1L)).thenReturn(5L);
        when(followRepository.countFollowingByUserId(1L)).thenReturn(3L);
        when(viewingRecordRepository.countByUserId(1L)).thenReturn(10L);
        when(viewingRecordRepository.findAverageRatingByUserId(1L)).thenReturn(4.2);

        // When
        Optional<UserDto> result = socialService.getUserById(1L, mockUserDetails);

        // Then
        assertTrue(result.isPresent());
        UserDto dto = result.get();
        assertNull(dto.getIsFollowing());
        assertNull(dto.getIsFollowedBy());
        assertNull(dto.getIsMutualFollow());
        assertEquals(5L, dto.getFollowerCount());
        assertEquals(3L, dto.getFollowingCount());
    }

    @Test
    void convertToDto_WithUserWithoutDisplayName_ShouldUseUsername() {
        // Given
        User userWithoutDisplayName = new User();
        userWithoutDisplayName.setId(5L);
        userWithoutDisplayName.setUsername("nodisplayuser");
        userWithoutDisplayName.setDisplayName(null);
        userWithoutDisplayName.setEmail("nodisplay@example.com");
        userWithoutDisplayName.setCreatedAt(LocalDateTime.now());

        when(userRepository.findByUsername("currentuser")).thenReturn(Optional.of(currentUser));
        when(userRepository.findById(5L)).thenReturn(Optional.of(userWithoutDisplayName));
        when(followRepository.countFollowersByUserId(5L)).thenReturn(0L);
        when(followRepository.countFollowingByUserId(5L)).thenReturn(0L);
        when(followRepository.existsByFollowerIdAndFollowingId(1L, 5L)).thenReturn(false);
        when(followRepository.existsByFollowerIdAndFollowingId(5L, 1L)).thenReturn(false);
        when(followRepository.isMutualFollow(1L, 5L)).thenReturn(false);
        when(viewingRecordRepository.countByUserId(5L)).thenReturn(0L);
        when(viewingRecordRepository.findAverageRatingByUserId(5L)).thenReturn(null);

        // When
        Optional<UserDto> result = socialService.getUserById(5L, mockUserDetails);

        // Then
        assertTrue(result.isPresent());
        UserDto dto = result.get();
        assertEquals("nodisplayuser", dto.getDisplayName());
        assertEquals("nodisplayuser", dto.getUsername());
    }
}