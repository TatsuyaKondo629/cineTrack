package com.cinetrack.controller;

import com.cinetrack.dto.ActivityDto;
import com.cinetrack.dto.UserDto;
import com.cinetrack.dto.ViewingRecordDto;
import com.cinetrack.service.SocialService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.context.annotation.Import;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import com.cinetrack.config.TestUserDetailsConfig;

@WebMvcTest(controllers = SocialController.class, excludeAutoConfiguration = {
    org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class,
    org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration.class
}, excludeFilters = @org.springframework.context.annotation.ComponentScan.Filter(
    type = org.springframework.context.annotation.FilterType.ASSIGNABLE_TYPE, 
    classes = {com.cinetrack.security.JwtAuthenticationFilter.class}
))
@ActiveProfiles("test")
@Import(TestUserDetailsConfig.class)
class SocialControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private SocialService socialService;

    @Autowired
    private ObjectMapper objectMapper;

    private UserDto testUser;
    private List<UserDto> testUsers;
    private Page<UserDto> testUserPage;
    private Page<ViewingRecordDto> testViewingRecordsPage;
    private Page<ActivityDto> testActivitiesPage;

    @BeforeEach
    void setUp() {
        testUser = new UserDto();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");

        testUsers = Arrays.asList(testUser);
        testUserPage = new PageImpl<>(testUsers, PageRequest.of(0, 20), 1);
        testViewingRecordsPage = new PageImpl<>(Arrays.asList(), PageRequest.of(0, 20), 0);
        testActivitiesPage = new PageImpl<>(Arrays.asList(), PageRequest.of(0, 20), 0);
    }

    @Test
    void searchUsers_ShouldReturnUserList() throws Exception {
        // Given
        when(socialService.searchUsers(eq("test"), any(UserDetails.class), any(Pageable.class)))
                .thenReturn(testUserPage);

        // When & Then
        mockMvc.perform(get("/social/users/search")
                        .param("query", "test")
                        .param("page", "0")
                        .param("size", "20")
                        .with(user("testuser")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("ユーザー検索が完了しました"))
                .andExpect(jsonPath("$.data.content").isArray())
                .andExpect(jsonPath("$.data.totalElements").value(1));

        verify(socialService).searchUsers(eq("test"), any(UserDetails.class), any(Pageable.class));
    }

    @Test
    void searchUsers_WithoutQuery_ShouldReturnAllUsers() throws Exception {
        // Given
        when(socialService.searchUsers(isNull(), any(UserDetails.class), any(Pageable.class)))
                .thenReturn(testUserPage);

        // When & Then
        mockMvc.perform(get("/social/users/search")
                        .with(user("testuser")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("ユーザー検索が完了しました"));

        verify(socialService).searchUsers(isNull(), any(UserDetails.class), any(Pageable.class));
    }

    @Test
    void searchUsers_WithServiceException_ShouldReturnError() throws Exception {
        // Given
        when(socialService.searchUsers(anyString(), any(UserDetails.class), any(Pageable.class)))
                .thenThrow(new RuntimeException("Search error"));

        // When & Then
        mockMvc.perform(get("/social/users/search")
                        .param("query", "test")
                        .with(user("testuser")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Search error"));

        verify(socialService).searchUsers(eq("test"), any(UserDetails.class), any(Pageable.class));
    }

    @Test
    void getUserById_WithExistingUser_ShouldReturnUser() throws Exception {
        // Given
        when(socialService.getUserById(eq(1L), any(UserDetails.class)))
                .thenReturn(Optional.of(testUser));

        // When & Then
        mockMvc.perform(get("/social/users/1")
                        .with(user("testuser")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("ユーザー詳細を取得しました"))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.username").value("testuser"));

        verify(socialService).getUserById(eq(1L), any(UserDetails.class));
    }

    @Test
    void getUserById_WithNonExistingUser_ShouldReturnNotFound() throws Exception {
        // Given
        when(socialService.getUserById(eq(999L), any(UserDetails.class)))
                .thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(get("/social/users/999")
                        .with(user("testuser")))
                .andExpect(status().isNotFound());

        verify(socialService).getUserById(eq(999L), any(UserDetails.class));
    }

    @Test
    void followUser_ShouldFollowUser() throws Exception {
        // Given
        when(socialService.followUser(eq(1L), any(UserDetails.class)))
                .thenReturn(true);

        // When & Then
        mockMvc.perform(post("/social/users/1/follow")
                        .with(user("testuser")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("フォローしました"));

        verify(socialService).followUser(eq(1L), any(UserDetails.class));
    }

    @Test
    void followUser_AlreadyFollowing_ShouldReturnBadRequest() throws Exception {
        // Given
        when(socialService.followUser(eq(1L), any(UserDetails.class)))
                .thenReturn(false);

        // When & Then
        mockMvc.perform(post("/social/users/1/follow")
                        .with(user("testuser")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("既にフォローしています"));

        verify(socialService).followUser(eq(1L), any(UserDetails.class));
    }

    @Test
    void unfollowUser_ShouldUnfollowUser() throws Exception {
        // Given
        when(socialService.unfollowUser(eq(1L), any(UserDetails.class)))
                .thenReturn(true);

        // When & Then
        mockMvc.perform(delete("/social/users/1/follow")
                        .with(user("testuser")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("フォローを解除しました"));

        verify(socialService).unfollowUser(eq(1L), any(UserDetails.class));
    }

    @Test
    void unfollowUser_NotFollowing_ShouldReturnBadRequest() throws Exception {
        // Given
        when(socialService.unfollowUser(eq(1L), any(UserDetails.class)))
                .thenReturn(false);

        // When & Then
        mockMvc.perform(delete("/social/users/1/follow")
                        .with(user("testuser")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("フォローしていません"));

        verify(socialService).unfollowUser(eq(1L), any(UserDetails.class));
    }

    @Test
    void getFollowing_ShouldReturnFollowingList() throws Exception {
        // Given
        when(socialService.getFollowing(eq(1L), any(UserDetails.class)))
                .thenReturn(testUsers);

        // When & Then
        mockMvc.perform(get("/social/users/1/following")
                        .with(user("testuser")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("フォロー中のユーザーを取得しました"))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].id").value(1));

        verify(socialService).getFollowing(eq(1L), any(UserDetails.class));
    }

    @Test
    void getFollowers_ShouldReturnFollowersList() throws Exception {
        // Given
        when(socialService.getFollowers(eq(1L), any(UserDetails.class)))
                .thenReturn(testUsers);

        // When & Then
        mockMvc.perform(get("/social/users/1/followers")
                        .with(user("testuser")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("フォロワーを取得しました"))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].id").value(1));

        verify(socialService).getFollowers(eq(1L), any(UserDetails.class));
    }

    @Test
    void getUserStats_ShouldReturnUserStats() throws Exception {
        // Given
        when(socialService.getUserStats(eq(1L), any(UserDetails.class)))
                .thenReturn(testUser);

        // When & Then
        mockMvc.perform(get("/social/users/1/stats")
                        .with(user("testuser")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("ユーザー統計を取得しました"))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.username").value("testuser"));

        verify(socialService).getUserStats(eq(1L), any(UserDetails.class));
    }

    @Test
    void getUserViewingRecords_ShouldReturnViewingRecords() throws Exception {
        // Given
        when(socialService.getUserViewingRecords(eq(1L), any(UserDetails.class), any(Pageable.class)))
                .thenReturn(testViewingRecordsPage);

        // When & Then
        mockMvc.perform(get("/social/users/1/viewing-records")
                        .param("page", "0")
                        .param("size", "20")
                        .with(user("testuser")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("視聴記録を取得しました"))
                .andExpect(jsonPath("$.data.content").isArray());

        verify(socialService).getUserViewingRecords(eq(1L), any(UserDetails.class), any(Pageable.class));
    }

    @Test
    void getActivityFeed_ShouldReturnActivityFeed() throws Exception {
        // Given
        when(socialService.getActivityFeed(any(UserDetails.class), any(Pageable.class)))
                .thenReturn(testActivitiesPage);

        // When & Then
        mockMvc.perform(get("/social/activities")
                        .param("page", "0")
                        .param("size", "20")
                        .with(user("testuser")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("アクティビティフィードを取得しました"))
                .andExpect(jsonPath("$.data.content").isArray());

        verify(socialService).getActivityFeed(any(UserDetails.class), any(Pageable.class));
    }

    @Test
    void followUser_WithServiceException_ShouldReturnError() throws Exception {
        // Given
        when(socialService.followUser(eq(1L), any(UserDetails.class)))
                .thenThrow(new RuntimeException("Follow error"));

        // When & Then
        mockMvc.perform(post("/social/users/1/follow")
                        .with(user("testuser")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Follow error"));

        verify(socialService).followUser(eq(1L), any(UserDetails.class));
    }

    @Test
    void unfollowUser_WithServiceException_ShouldReturnError() throws Exception {
        // Given
        when(socialService.unfollowUser(eq(1L), any(UserDetails.class)))
                .thenThrow(new RuntimeException("Unfollow error"));

        // When & Then
        mockMvc.perform(delete("/social/users/1/follow")
                        .with(user("testuser")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Unfollow error"));

        verify(socialService).unfollowUser(eq(1L), any(UserDetails.class));
    }

    @Test
    void getUserById_WithServiceException_ShouldReturnError() throws Exception {
        // Given
        when(socialService.getUserById(eq(1L), any(UserDetails.class)))
                .thenThrow(new RuntimeException("User not found"));

        // When & Then
        mockMvc.perform(get("/social/users/1")
                        .with(user("testuser")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("User not found"));

        verify(socialService).getUserById(eq(1L), any(UserDetails.class));
    }

    @Test
    void getFollowing_WithServiceException_ShouldReturnError() throws Exception {
        // Given
        when(socialService.getFollowing(eq(1L), any(UserDetails.class)))
                .thenThrow(new RuntimeException("Access denied"));

        // When & Then
        mockMvc.perform(get("/social/users/1/following")
                        .with(user("testuser")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Access denied"));

        verify(socialService).getFollowing(eq(1L), any(UserDetails.class));
    }

    @Test
    void getFollowers_WithServiceException_ShouldReturnError() throws Exception {
        // Given
        when(socialService.getFollowers(eq(1L), any(UserDetails.class)))
                .thenThrow(new RuntimeException("Access denied"));

        // When & Then
        mockMvc.perform(get("/social/users/1/followers")
                        .with(user("testuser")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Access denied"));

        verify(socialService).getFollowers(eq(1L), any(UserDetails.class));
    }

    @Test
    void getUserStats_WithServiceException_ShouldReturnError() throws Exception {
        // Given
        when(socialService.getUserStats(eq(1L), any(UserDetails.class)))
                .thenThrow(new RuntimeException("Stats error"));

        // When & Then
        mockMvc.perform(get("/social/users/1/stats")
                        .with(user("testuser")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Stats error"));

        verify(socialService).getUserStats(eq(1L), any(UserDetails.class));
    }

    @Test
    void getUserViewingRecords_WithServiceException_ShouldReturnError() throws Exception {
        // Given
        when(socialService.getUserViewingRecords(eq(1L), any(UserDetails.class), any(Pageable.class)))
                .thenThrow(new RuntimeException("Access denied"));

        // When & Then
        mockMvc.perform(get("/social/users/1/viewing-records")
                        .with(user("testuser")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Access denied"));

        verify(socialService).getUserViewingRecords(eq(1L), any(UserDetails.class), any(Pageable.class));
    }

    @Test
    void getActivityFeed_WithServiceException_ShouldReturnError() throws Exception {
        // Given
        when(socialService.getActivityFeed(any(UserDetails.class), any(Pageable.class)))
                .thenThrow(new RuntimeException("Feed error"));

        // When & Then
        mockMvc.perform(get("/social/activities")
                        .with(user("testuser")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Feed error"));

        verify(socialService).getActivityFeed(any(UserDetails.class), any(Pageable.class));
    }
}