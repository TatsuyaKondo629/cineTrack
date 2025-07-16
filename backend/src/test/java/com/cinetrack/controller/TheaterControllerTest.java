package com.cinetrack.controller;

import com.cinetrack.dto.TheaterDto;
import com.cinetrack.service.TheaterService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = TheaterController.class, excludeAutoConfiguration = {
    org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class,
    org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration.class
}, excludeFilters = @org.springframework.context.annotation.ComponentScan.Filter(
    type = org.springframework.context.annotation.FilterType.ASSIGNABLE_TYPE, 
    classes = {com.cinetrack.security.JwtAuthenticationFilter.class}
))
@ActiveProfiles("test")
class TheaterControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TheaterService theaterService;

    @Autowired
    private ObjectMapper objectMapper;

    private TheaterDto testTheater;
    private List<TheaterDto> testTheaters;
    private List<String> testPrefectures;
    private List<String> testCities;
    private List<String> testChains;

    @BeforeEach
    void setUp() {
        testTheater = new TheaterDto();
        testTheater.setId(1L);
        testTheater.setName("テスト映画館");
        testTheater.setChain("TOHOシネマズ");
        testTheater.setLocation("新宿");
        testTheater.setAddress("東京都新宿区テスト1-1-1");
        testTheater.setPhone("03-1234-5678");
        testTheater.setWebsite("https://test-theater.com");
        testTheater.setPrefecture("東京都");
        testTheater.setCity("新宿区");
        testTheater.setLatitude(35.6895);
        testTheater.setLongitude(139.6917);
        testTheater.setIsActive(true);
        testTheater.setCreatedAt(LocalDateTime.now());
        testTheater.setUpdatedAt(LocalDateTime.now());

        testTheaters = Arrays.asList(testTheater);
        testPrefectures = Arrays.asList("東京都", "大阪府", "神奈川県");
        testCities = Arrays.asList("新宿区", "渋谷区", "港区");
        testChains = Arrays.asList("TOHOシネマズ", "イオンシネマ", "ユナイテッド・シネマ");
    }

    @Test
    void getAllTheaters_ShouldReturnTheaterList() throws Exception {
        // Given
        when(theaterService.getAllActiveTheaters()).thenReturn(testTheaters);

        // When & Then
        mockMvc.perform(get("/theaters"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("映画館一覧を取得しました"))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].id").value(1))
                .andExpect(jsonPath("$.data[0].name").value("テスト映画館"))
                .andExpect(jsonPath("$.data[0].chain").value("TOHOシネマズ"));

        verify(theaterService).getAllActiveTheaters();
    }

    @Test
    void getAllTheaters_WithServiceException_ShouldReturnError() throws Exception {
        // Given
        when(theaterService.getAllActiveTheaters()).thenThrow(new RuntimeException("Database error"));

        // When & Then
        mockMvc.perform(get("/theaters"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("映画館一覧の取得に失敗しました: Database error"));

        verify(theaterService).getAllActiveTheaters();
    }

    @Test
    void searchTheaters_ByLocation_ShouldReturnNearbyTheaters() throws Exception {
        // Given
        when(theaterService.getNearbyTheaters(35.6895, 139.6917, 10.0)).thenReturn(testTheaters);

        // When & Then
        mockMvc.perform(get("/theaters/search")
                        .param("latitude", "35.6895")
                        .param("longitude", "139.6917")
                        .param("radius", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("映画館検索が完了しました"))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].id").value(1));

        verify(theaterService).getNearbyTheaters(35.6895, 139.6917, 10.0);
        verify(theaterService, never()).searchTheatersByMultipleCriteria(anyString(), anyString(), anyString(), anyString());
    }

    @Test
    void searchTheaters_ByMultipleCriteria_ShouldReturnFilteredTheaters() throws Exception {
        // Given
        when(theaterService.searchTheatersByMultipleCriteria("新宿", "東京都", "新宿区", "TOHOシネマズ"))
                .thenReturn(testTheaters);

        // When & Then
        mockMvc.perform(get("/theaters/search")
                        .param("query", "新宿")
                        .param("prefecture", "東京都")
                        .param("city", "新宿区")
                        .param("chain", "TOHOシネマズ"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("映画館検索が完了しました"))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].name").value("テスト映画館"));

        verify(theaterService).searchTheatersByMultipleCriteria("新宿", "東京都", "新宿区", "TOHOシネマズ");
        verify(theaterService, never()).getNearbyTheaters(anyDouble(), anyDouble(), anyDouble());
    }

    @Test
    void searchTheaters_WithoutParameters_ShouldReturnFilteredTheaters() throws Exception {
        // Given
        when(theaterService.searchTheatersByMultipleCriteria(null, null, null, null))
                .thenReturn(testTheaters);

        // When & Then
        mockMvc.perform(get("/theaters/search"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("映画館検索が完了しました"));

        verify(theaterService).searchTheatersByMultipleCriteria(null, null, null, null);
    }

    @Test
    void searchTheaters_WithOnlyLatitude_ShouldUseMultipleCriteria() throws Exception {
        // Given
        when(theaterService.searchTheatersByMultipleCriteria(null, null, null, null))
                .thenReturn(testTheaters);

        // When & Then
        mockMvc.perform(get("/theaters/search")
                        .param("latitude", "35.6895"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("映画館検索が完了しました"));

        verify(theaterService).searchTheatersByMultipleCriteria(null, null, null, null);
        verify(theaterService, never()).getNearbyTheaters(anyDouble(), anyDouble(), anyDouble());
    }

    @Test
    void searchTheaters_WithOnlyLongitude_ShouldUseMultipleCriteria() throws Exception {
        // Given
        when(theaterService.searchTheatersByMultipleCriteria(null, null, null, null))
                .thenReturn(testTheaters);

        // When & Then
        mockMvc.perform(get("/theaters/search")
                        .param("longitude", "139.6917"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("映画館検索が完了しました"));

        verify(theaterService).searchTheatersByMultipleCriteria(null, null, null, null);
        verify(theaterService, never()).getNearbyTheaters(anyDouble(), anyDouble(), anyDouble());
    }

    @Test
    void getTheaterById_WithExistingId_ShouldReturnTheater() throws Exception {
        // Given
        when(theaterService.getTheaterById(1L)).thenReturn(Optional.of(testTheater));

        // When & Then
        mockMvc.perform(get("/theaters/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("映画館詳細を取得しました"))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.name").value("テスト映画館"));

        verify(theaterService).getTheaterById(1L);
    }

    @Test
    void getTheaterById_WithNonExistingId_ShouldReturnNotFound() throws Exception {
        // Given
        when(theaterService.getTheaterById(999L)).thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(get("/theaters/999"))
                .andExpect(status().isNotFound());

        verify(theaterService).getTheaterById(999L);
    }

    @Test
    void getTheaterById_WithServiceException_ShouldReturnError() throws Exception {
        // Given
        when(theaterService.getTheaterById(1L)).thenThrow(new RuntimeException("Database error"));

        // When & Then
        mockMvc.perform(get("/theaters/1"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("映画館詳細の取得に失敗しました: Database error"));

        verify(theaterService).getTheaterById(1L);
    }

    @Test
    void getAllPrefectures_ShouldReturnPrefectureList() throws Exception {
        // Given
        when(theaterService.getAllPrefectures()).thenReturn(testPrefectures);

        // When & Then
        mockMvc.perform(get("/theaters/prefectures"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("都道府県一覧を取得しました"))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0]").value("東京都"))
                .andExpect(jsonPath("$.data[1]").value("大阪府"));

        verify(theaterService).getAllPrefectures();
    }

    @Test
    void getCitiesByPrefecture_ShouldReturnCityList() throws Exception {
        // Given
        when(theaterService.getCitiesByPrefecture("東京都")).thenReturn(testCities);

        // When & Then
        mockMvc.perform(get("/theaters/cities")
                        .param("prefecture", "東京都"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("市区町村一覧を取得しました"))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0]").value("新宿区"));

        verify(theaterService).getCitiesByPrefecture("東京都");
    }

    @Test
    void getAllChains_ShouldReturnChainList() throws Exception {
        // Given
        when(theaterService.getAllChains()).thenReturn(testChains);

        // When & Then
        mockMvc.perform(get("/theaters/chains"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("チェーン一覧を取得しました"))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0]").value("TOHOシネマズ"));

        verify(theaterService).getAllChains();
    }

    @Test
    void createDemoData_ShouldCreateData() throws Exception {
        // Given
        doNothing().when(theaterService).createDemoData();

        // When & Then
        mockMvc.perform(post("/theaters/demo-data"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("デモデータを作成しました"));

        verify(theaterService).createDemoData();
    }

    @Test
    void createTheater_ShouldCreateNewTheater() throws Exception {
        // Given
        TheaterDto newTheater = new TheaterDto();
        newTheater.setName("新しい映画館");
        newTheater.setChain("新しいチェーン");
        newTheater.setPrefecture("大阪府");

        when(theaterService.createTheater(any(TheaterDto.class))).thenReturn(testTheater);

        // When & Then
        mockMvc.perform(post("/theaters")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newTheater)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("映画館を作成しました"))
                .andExpect(jsonPath("$.data.id").value(1));

        verify(theaterService).createTheater(any(TheaterDto.class));
    }

    @Test
    void updateTheater_WithExistingId_ShouldUpdateTheater() throws Exception {
        // Given
        TheaterDto updateTheater = new TheaterDto();
        updateTheater.setName("更新された映画館");
        
        when(theaterService.updateTheater(eq(1L), any(TheaterDto.class))).thenReturn(Optional.of(testTheater));

        // When & Then
        mockMvc.perform(put("/theaters/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateTheater)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("映画館を更新しました"))
                .andExpect(jsonPath("$.data.id").value(1));

        verify(theaterService).updateTheater(eq(1L), any(TheaterDto.class));
    }

    @Test
    void updateTheater_WithNonExistingId_ShouldReturnNotFound() throws Exception {
        // Given
        TheaterDto updateTheater = new TheaterDto();
        updateTheater.setName("更新された映画館");
        
        when(theaterService.updateTheater(eq(999L), any(TheaterDto.class))).thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(put("/theaters/999")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateTheater)))
                .andExpect(status().isNotFound());

        verify(theaterService).updateTheater(eq(999L), any(TheaterDto.class));
    }

    @Test
    void deactivateTheater_WithExistingId_ShouldDeactivateTheater() throws Exception {
        // Given
        when(theaterService.deactivateTheater(1L)).thenReturn(true);

        // When & Then
        mockMvc.perform(delete("/theaters/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("映画館を無効化しました"));

        verify(theaterService).deactivateTheater(1L);
    }

    @Test
    void deactivateTheater_WithNonExistingId_ShouldReturnNotFound() throws Exception {
        // Given
        when(theaterService.deactivateTheater(999L)).thenReturn(false);

        // When & Then
        mockMvc.perform(delete("/theaters/999"))
                .andExpect(status().isNotFound());

        verify(theaterService).deactivateTheater(999L);
    }

    @Test
    void searchTheaters_WithServiceException_ShouldReturnError() throws Exception {
        // Given
        when(theaterService.searchTheatersByMultipleCriteria("テスト", null, null, null))
                .thenThrow(new RuntimeException("Search error"));

        // When & Then
        mockMvc.perform(get("/theaters/search")
                        .param("query", "テスト"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("映画館検索に失敗しました: Search error"));

        verify(theaterService).searchTheatersByMultipleCriteria("テスト", null, null, null);
    }

    @Test
    void getAllPrefectures_WithServiceException_ShouldReturnError() throws Exception {
        // Given
        when(theaterService.getAllPrefectures()).thenThrow(new RuntimeException("Database error"));

        // When & Then
        mockMvc.perform(get("/theaters/prefectures"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("都道府県一覧の取得に失敗しました: Database error"));

        verify(theaterService).getAllPrefectures();
    }

    @Test
    void getCitiesByPrefecture_WithServiceException_ShouldReturnError() throws Exception {
        // Given
        when(theaterService.getCitiesByPrefecture("東京都")).thenThrow(new RuntimeException("Database error"));

        // When & Then
        mockMvc.perform(get("/theaters/cities")
                        .param("prefecture", "東京都"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("市区町村一覧の取得に失敗しました: Database error"));

        verify(theaterService).getCitiesByPrefecture("東京都");
    }

    @Test
    void getAllChains_WithServiceException_ShouldReturnError() throws Exception {
        // Given
        when(theaterService.getAllChains()).thenThrow(new RuntimeException("Database error"));

        // When & Then
        mockMvc.perform(get("/theaters/chains"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("チェーン一覧の取得に失敗しました: Database error"));

        verify(theaterService).getAllChains();
    }

    @Test
    void createDemoData_WithServiceException_ShouldReturnError() throws Exception {
        // Given
        doThrow(new RuntimeException("Demo data error")).when(theaterService).createDemoData();

        // When & Then
        mockMvc.perform(post("/theaters/demo-data"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("デモデータの作成に失敗しました: Demo data error"));

        verify(theaterService).createDemoData();
    }

    @Test
    void createTheater_WithServiceException_ShouldReturnError() throws Exception {
        // Given
        TheaterDto newTheater = new TheaterDto();
        newTheater.setName("新しい映画館");

        when(theaterService.createTheater(any(TheaterDto.class)))
                .thenThrow(new RuntimeException("Creation error"));

        // When & Then
        mockMvc.perform(post("/theaters")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newTheater)))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("映画館の作成に失敗しました: Creation error"));

        verify(theaterService).createTheater(any(TheaterDto.class));
    }

    @Test
    void updateTheater_WithServiceException_ShouldReturnError() throws Exception {
        // Given
        TheaterDto updateTheater = new TheaterDto();
        updateTheater.setName("更新された映画館");

        when(theaterService.updateTheater(eq(1L), any(TheaterDto.class)))
                .thenThrow(new RuntimeException("Update error"));

        // When & Then
        mockMvc.perform(put("/theaters/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateTheater)))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("映画館の更新に失敗しました: Update error"));

        verify(theaterService).updateTheater(eq(1L), any(TheaterDto.class));
    }

    @Test
    void deactivateTheater_WithServiceException_ShouldReturnError() throws Exception {
        // Given
        when(theaterService.deactivateTheater(1L)).thenThrow(new RuntimeException("Deactivation error"));

        // When & Then
        mockMvc.perform(delete("/theaters/1"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("映画館の無効化に失敗しました: Deactivation error"));

        verify(theaterService).deactivateTheater(1L);
    }
}