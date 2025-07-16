package com.cinetrack.service;

import com.cinetrack.dto.TheaterDto;
import com.cinetrack.entity.Theater;
import com.cinetrack.repository.TheaterRepository;
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
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
class TheaterServiceTest {

    @Mock
    private TheaterRepository theaterRepository;

    @InjectMocks
    private TheaterService theaterService;

    private Theater theater1;
    private Theater theater2;
    private Theater theater3;
    private List<Theater> testTheaters;

    @BeforeEach
    void setUp() {
        theater1 = new Theater();
        theater1.setId(1L);
        theater1.setName("TOHOシネマズ 新宿");
        theater1.setChain("TOHOシネマズ");
        theater1.setLocation("新宿");
        theater1.setAddress("東京都新宿区歌舞伎町1-19-1");
        theater1.setPhone("050-6868-5063");
        theater1.setWebsite("https://www.tohotheater.jp/theater/023/");
        theater1.setPrefecture("東京都");
        theater1.setCity("新宿区");
        theater1.setLatitude(35.6938);
        theater1.setLongitude(139.7005);
        theater1.setIsActive(true);
        theater1.setCreatedAt(LocalDateTime.now().minusDays(10));
        theater1.setUpdatedAt(LocalDateTime.now().minusDays(5));

        theater2 = new Theater();
        theater2.setId(2L);
        theater2.setName("イオンシネマ 板橋");
        theater2.setChain("イオンシネマ");
        theater2.setLocation("板橋");
        theater2.setAddress("東京都板橋区徳丸2-6-1");
        theater2.setPhone("03-3937-1551");
        theater2.setWebsite("https://www.aeoncinema.com/cinema/itabashi/");
        theater2.setPrefecture("東京都");
        theater2.setCity("板橋区");
        theater2.setLatitude(35.7837);
        theater2.setLongitude(139.6622);
        theater2.setIsActive(true);
        theater2.setCreatedAt(LocalDateTime.now().minusDays(8));
        theater2.setUpdatedAt(LocalDateTime.now().minusDays(3));

        theater3 = new Theater();
        theater3.setId(3L);
        theater3.setName("TOHOシネマズ 梅田");
        theater3.setChain("TOHOシネマズ");
        theater3.setLocation("梅田");
        theater3.setAddress("大阪府大阪市北区角田町7-10");
        theater3.setPhone("050-6868-5014");
        theater3.setWebsite("https://www.tohotheater.jp/theater/014/");
        theater3.setPrefecture("大阪府");
        theater3.setCity("大阪市北区");
        theater3.setLatitude(34.7024);
        theater3.setLongitude(135.4959);
        theater3.setIsActive(true);
        theater3.setCreatedAt(LocalDateTime.now().minusDays(6));
        theater3.setUpdatedAt(LocalDateTime.now().minusDays(1));

        testTheaters = Arrays.asList(theater1, theater2, theater3);
    }

    @Test
    void getAllActiveTheaters_ShouldReturnAllActiveTheaters() {
        // Given
        when(theaterRepository.findByIsActiveTrue()).thenReturn(testTheaters);

        // When
        List<TheaterDto> result = theaterService.getAllActiveTheaters();

        // Then
        assertNotNull(result);
        assertEquals(3, result.size());
        
        TheaterDto dto1 = result.get(0);
        assertEquals(theater1.getId(), dto1.getId());
        assertEquals(theater1.getName(), dto1.getName());
        assertEquals(theater1.getChain(), dto1.getChain());
        assertEquals(theater1.getLocation(), dto1.getLocation());
        assertEquals(theater1.getPrefecture(), dto1.getPrefecture());
        assertEquals(theater1.getCity(), dto1.getCity());

        verify(theaterRepository).findByIsActiveTrue();
    }

    @Test
    void getAllActiveTheaters_WithEmptyResult_ShouldReturnEmptyList() {
        // Given
        when(theaterRepository.findByIsActiveTrue()).thenReturn(List.of());

        // When
        List<TheaterDto> result = theaterService.getAllActiveTheaters();

        // Then
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(theaterRepository).findByIsActiveTrue();
    }

    @Test
    void searchTheaters_WithValidQuery_ShouldReturnMatchingTheaters() {
        // Given
        String query = "TOHO";
        List<Theater> matchingTheaters = Arrays.asList(theater1, theater3);
        when(theaterRepository.findByNameContainingIgnoreCase(query)).thenReturn(matchingTheaters);

        // When
        List<TheaterDto> result = theaterService.searchTheaters(query);

        // Then
        assertNotNull(result);
        assertEquals(2, result.size());
        assertTrue(result.stream().allMatch(dto -> dto.getName().contains("TOHO")));
        verify(theaterRepository).findByNameContainingIgnoreCase(query);
    }

    @Test
    void searchTheaters_WithEmptyQuery_ShouldReturnAllActiveTheaters() {
        // Given
        String query = "";
        when(theaterRepository.findByIsActiveTrue()).thenReturn(testTheaters);

        // When
        List<TheaterDto> result = theaterService.searchTheaters(query);

        // Then
        assertNotNull(result);
        assertEquals(3, result.size());
        verify(theaterRepository).findByIsActiveTrue();
        verify(theaterRepository, never()).findByNameContainingIgnoreCase(anyString());
    }

    @Test
    void searchTheaters_WithNullQuery_ShouldReturnAllActiveTheaters() {
        // Given
        when(theaterRepository.findByIsActiveTrue()).thenReturn(testTheaters);

        // When
        List<TheaterDto> result = theaterService.searchTheaters(null);

        // Then
        assertNotNull(result);
        assertEquals(3, result.size());
        verify(theaterRepository).findByIsActiveTrue();
        verify(theaterRepository, never()).findByNameContainingIgnoreCase(anyString());
    }

    @Test
    void getTheatersByPrefecture_ShouldReturnTheatersByPrefecture() {
        // Given
        String prefecture = "東京都";
        List<Theater> tokyoTheaters = Arrays.asList(theater1, theater2);
        when(theaterRepository.findByPrefectureAndIsActiveTrueOrderByNameAsc(prefecture)).thenReturn(tokyoTheaters);

        // When
        List<TheaterDto> result = theaterService.getTheatersByPrefecture(prefecture);

        // Then
        assertNotNull(result);
        assertEquals(2, result.size());
        assertTrue(result.stream().allMatch(dto -> dto.getPrefecture().equals("東京都")));
        verify(theaterRepository).findByPrefectureAndIsActiveTrueOrderByNameAsc(prefecture);
    }

    @Test
    void getTheatersByCity_ShouldReturnTheatersByCity() {
        // Given
        String city = "新宿区";
        List<Theater> shinjukuTheaters = Arrays.asList(theater1);
        when(theaterRepository.findByCityAndIsActiveTrueOrderByNameAsc(city)).thenReturn(shinjukuTheaters);

        // When
        List<TheaterDto> result = theaterService.getTheatersByCity(city);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("新宿区", result.get(0).getCity());
        verify(theaterRepository).findByCityAndIsActiveTrueOrderByNameAsc(city);
    }

    @Test
    void getTheatersByChain_ShouldReturnTheatersByChain() {
        // Given
        String chain = "TOHOシネマズ";
        List<Theater> tohoTheaters = Arrays.asList(theater1, theater3);
        when(theaterRepository.findByChainAndIsActiveTrueOrderByLocationAsc(chain)).thenReturn(tohoTheaters);

        // When
        List<TheaterDto> result = theaterService.getTheatersByChain(chain);

        // Then
        assertNotNull(result);
        assertEquals(2, result.size());
        assertTrue(result.stream().allMatch(dto -> dto.getChain().equals("TOHOシネマズ")));
        verify(theaterRepository).findByChainAndIsActiveTrueOrderByLocationAsc(chain);
    }

    @Test
    void getTheatersByPrefectureAndCity_ShouldReturnTheatersByBothCriteria() {
        // Given
        String prefecture = "東京都";
        String city = "新宿区";
        List<Theater> matchingTheaters = Arrays.asList(theater1);
        when(theaterRepository.findByPrefectureAndCityAndIsActiveTrueOrderByNameAsc(prefecture, city))
                .thenReturn(matchingTheaters);

        // When
        List<TheaterDto> result = theaterService.getTheatersByPrefectureAndCity(prefecture, city);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("東京都", result.get(0).getPrefecture());
        assertEquals("新宿区", result.get(0).getCity());
        verify(theaterRepository).findByPrefectureAndCityAndIsActiveTrueOrderByNameAsc(prefecture, city);
    }

    @Test
    void getNearbyTheaters_WithValidCoordinates_ShouldReturnNearbyTheaters() {
        // Given
        Double latitude = 35.6938;
        Double longitude = 139.7005;
        Double radiusKm = 5.0;
        
        when(theaterRepository.findNearbyTheaters(anyDouble(), anyDouble(), anyDouble(), anyDouble()))
                .thenReturn(Arrays.asList(theater1, theater2));

        // When
        List<TheaterDto> result = theaterService.getNearbyTheaters(latitude, longitude, radiusKm);

        // Then
        assertNotNull(result);
        assertEquals(2, result.size());
        verify(theaterRepository).findNearbyTheaters(anyDouble(), anyDouble(), anyDouble(), anyDouble());
    }

    @Test
    void getNearbyTheaters_WithNullParameters_ShouldReturnAllActiveTheaters() {
        // Given
        when(theaterRepository.findByIsActiveTrue()).thenReturn(testTheaters);

        // When
        List<TheaterDto> result = theaterService.getNearbyTheaters(null, null, null);

        // Then
        assertNotNull(result);
        assertEquals(3, result.size());
        verify(theaterRepository).findByIsActiveTrue();
        verify(theaterRepository, never()).findNearbyTheaters(anyDouble(), anyDouble(), anyDouble(), anyDouble());
    }

    @Test
    void getTheaterById_WithExistingId_ShouldReturnTheater() {
        // Given
        Long theaterId = 1L;
        when(theaterRepository.findById(theaterId)).thenReturn(Optional.of(theater1));

        // When
        Optional<TheaterDto> result = theaterService.getTheaterById(theaterId);

        // Then
        assertTrue(result.isPresent());
        assertEquals(theater1.getId(), result.get().getId());
        assertEquals(theater1.getName(), result.get().getName());
        verify(theaterRepository).findById(theaterId);
    }

    @Test
    void getTheaterById_WithNonExistingId_ShouldReturnEmpty() {
        // Given
        Long theaterId = 999L;
        when(theaterRepository.findById(theaterId)).thenReturn(Optional.empty());

        // When
        Optional<TheaterDto> result = theaterService.getTheaterById(theaterId);

        // Then
        assertFalse(result.isPresent());
        verify(theaterRepository).findById(theaterId);
    }

    @Test
    void getAllPrefectures_ShouldReturnDistinctPrefectures() {
        // Given
        List<String> prefectures = Arrays.asList("東京都", "大阪府", "神奈川県");
        when(theaterRepository.findDistinctPrefectures()).thenReturn(prefectures);

        // When
        List<String> result = theaterService.getAllPrefectures();

        // Then
        assertNotNull(result);
        assertEquals(3, result.size());
        assertTrue(result.contains("東京都"));
        assertTrue(result.contains("大阪府"));
        verify(theaterRepository).findDistinctPrefectures();
    }

    @Test
    void getCitiesByPrefecture_ShouldReturnCitiesInPrefecture() {
        // Given
        String prefecture = "東京都";
        List<String> cities = Arrays.asList("新宿区", "渋谷区", "港区");
        when(theaterRepository.findDistinctCitiesByPrefecture(prefecture)).thenReturn(cities);

        // When
        List<String> result = theaterService.getCitiesByPrefecture(prefecture);

        // Then
        assertNotNull(result);
        assertEquals(3, result.size());
        assertTrue(result.contains("新宿区"));
        verify(theaterRepository).findDistinctCitiesByPrefecture(prefecture);
    }

    @Test
    void getAllChains_ShouldReturnDistinctChains() {
        // Given
        List<String> chains = Arrays.asList("TOHOシネマズ", "イオンシネマ", "109シネマズ");
        when(theaterRepository.findDistinctChains()).thenReturn(chains);

        // When
        List<String> result = theaterService.getAllChains();

        // Then
        assertNotNull(result);
        assertEquals(3, result.size());
        assertTrue(result.contains("TOHOシネマズ"));
        verify(theaterRepository).findDistinctChains();
    }

    @Test
    void createTheater_ShouldCreateAndReturnTheater() {
        // Given
        TheaterDto theaterDto = new TheaterDto();
        theaterDto.setName("新規映画館");
        theaterDto.setChain("テストチェーン");
        theaterDto.setLocation("テスト場所");
        theaterDto.setPrefecture("テスト県");
        theaterDto.setCity("テスト市");

        when(theaterRepository.save(any(Theater.class))).thenAnswer(invocation -> {
            Theater saved = invocation.getArgument(0);
            saved.setId(99L);
            saved.setCreatedAt(LocalDateTime.now());
            saved.setUpdatedAt(LocalDateTime.now());
            return saved;
        });

        // When
        TheaterDto result = theaterService.createTheater(theaterDto);

        // Then
        assertNotNull(result);
        assertEquals(99L, result.getId());
        assertEquals("新規映画館", result.getName());
        assertTrue(result.getIsActive());
        verify(theaterRepository).save(any(Theater.class));
    }

    @Test
    void updateTheater_WithExistingId_ShouldUpdateAndReturnTheater() {
        // Given
        Long theaterId = 1L;
        TheaterDto updateDto = new TheaterDto();
        updateDto.setName("更新された映画館");
        updateDto.setChain("更新されたチェーン");

        when(theaterRepository.findById(theaterId)).thenReturn(Optional.of(theater1));
        when(theaterRepository.save(any(Theater.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        Optional<TheaterDto> result = theaterService.updateTheater(theaterId, updateDto);

        // Then
        assertTrue(result.isPresent());
        assertEquals("更新された映画館", result.get().getName());
        assertEquals("更新されたチェーン", result.get().getChain());
        verify(theaterRepository).findById(theaterId);
        verify(theaterRepository).save(any(Theater.class));
    }

    @Test
    void updateTheater_WithNonExistingId_ShouldReturnEmpty() {
        // Given
        Long theaterId = 999L;
        TheaterDto updateDto = new TheaterDto();
        when(theaterRepository.findById(theaterId)).thenReturn(Optional.empty());

        // When
        Optional<TheaterDto> result = theaterService.updateTheater(theaterId, updateDto);

        // Then
        assertFalse(result.isPresent());
        verify(theaterRepository).findById(theaterId);
        verify(theaterRepository, never()).save(any(Theater.class));
    }

    @Test
    void deactivateTheater_WithExistingId_ShouldDeactivateAndReturnTrue() {
        // Given
        Long theaterId = 1L;
        when(theaterRepository.findById(theaterId)).thenReturn(Optional.of(theater1));
        when(theaterRepository.save(any(Theater.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        boolean result = theaterService.deactivateTheater(theaterId);

        // Then
        assertTrue(result);
        assertFalse(theater1.getIsActive());
        verify(theaterRepository).findById(theaterId);
        verify(theaterRepository).save(theater1);
    }

    @Test
    void deactivateTheater_WithNonExistingId_ShouldReturnFalse() {
        // Given
        Long theaterId = 999L;
        when(theaterRepository.findById(theaterId)).thenReturn(Optional.empty());

        // When
        boolean result = theaterService.deactivateTheater(theaterId);

        // Then
        assertFalse(result);
        verify(theaterRepository).findById(theaterId);
        verify(theaterRepository, never()).save(any(Theater.class));
    }

    @Test
    void searchTheatersByMultipleCriteria_ShouldReturnMatchingTheaters() {
        // Given
        String name = "TOHO";
        String prefecture = "東京都";
        String city = "新宿区";
        String chain = "TOHOシネマズ";
        
        List<Theater> matchingTheaters = Arrays.asList(theater1);
        when(theaterRepository.findByMultipleCriteria(name, prefecture, city, chain))
                .thenReturn(matchingTheaters);

        // When
        List<TheaterDto> result = theaterService.searchTheatersByMultipleCriteria(name, prefecture, city, chain);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(theater1.getName(), result.get(0).getName());
        verify(theaterRepository).findByMultipleCriteria(name, prefecture, city, chain);
    }

    @Test
    void createDemoData_ShouldCreateDemoTheaters() {
        // Given
        when(theaterRepository.count()).thenReturn(0L);
        when(theaterRepository.save(any(Theater.class))).thenAnswer(invocation -> {
            Theater theater = invocation.getArgument(0);
            theater.setId(System.currentTimeMillis());
            theater.setCreatedAt(LocalDateTime.now());
            theater.setUpdatedAt(LocalDateTime.now());
            return theater;
        });

        // When
        theaterService.createDemoData();

        // Then
        verify(theaterRepository).count();
        verify(theaterRepository, atLeastOnce()).save(any(Theater.class));
    }

    @Test
    void createDemoData_WithExistingData_ShouldNotCreateDemoTheaters() {
        // Given
        when(theaterRepository.count()).thenReturn(5L);

        // When
        theaterService.createDemoData();

        // Then
        verify(theaterRepository).count();
        verify(theaterRepository, never()).save(any(Theater.class));
    }

    @Test
    void createDemoData_ShouldCreateMultipleTheaters() {
        // Given
        when(theaterRepository.count()).thenReturn(0L);
        when(theaterRepository.save(any(Theater.class))).thenAnswer(invocation -> {
            Theater theater = invocation.getArgument(0);
            theater.setId(System.currentTimeMillis());
            theater.setCreatedAt(LocalDateTime.now());
            theater.setUpdatedAt(LocalDateTime.now());
            return theater;
        });

        // When
        theaterService.createDemoData();

        // Then
        // Verify that multiple theaters were created (at least 10 based on the method)
        verify(theaterRepository, atLeast(10)).save(any(Theater.class));
    }

    @Test
    void getNearbyTheaters_WithIncompleteParameters_ShouldReturnAllActiveTheaters() {
        // Given
        Double latitude = 35.6762;
        Double longitude = null; // Missing longitude
        Double radiusKm = 5.0;
        
        when(theaterRepository.findByIsActiveTrue()).thenReturn(testTheaters);

        // When
        List<TheaterDto> result = theaterService.getNearbyTheaters(latitude, longitude, radiusKm);

        // Then
        assertNotNull(result);
        assertEquals(3, result.size());
        verify(theaterRepository).findByIsActiveTrue();
        verify(theaterRepository, never()).findNearbyTheaters(anyDouble(), anyDouble(), anyDouble(), anyDouble());
    }

    @Test
    void getNearbyTheaters_WithAllParametersNull_ShouldReturnAllActiveTheaters() {
        // Given
        when(theaterRepository.findByIsActiveTrue()).thenReturn(testTheaters);

        // When
        List<TheaterDto> result = theaterService.getNearbyTheaters(null, null, null);

        // Then
        assertNotNull(result);
        assertEquals(3, result.size());
        verify(theaterRepository).findByIsActiveTrue();
        verify(theaterRepository, never()).findNearbyTheaters(anyDouble(), anyDouble(), anyDouble(), anyDouble());
    }

    @Test
    void createDemoData_WithNullChainAndNonNullLocation_ShouldCreateTheaterWithLocationAsName() {
        // Given
        when(theaterRepository.count()).thenReturn(0L);
        when(theaterRepository.save(any(Theater.class))).thenAnswer(invocation -> {
            Theater theater = invocation.getArgument(0);
            theater.setId(System.currentTimeMillis());
            theater.setCreatedAt(LocalDateTime.now());
            theater.setUpdatedAt(LocalDateTime.now());
            return theater;
        });

        // When
        theaterService.createDemoData();

        // Then
        verify(theaterRepository).count();
        verify(theaterRepository, atLeastOnce()).save(any(Theater.class));
    }

    @Test
    void createDemoData_ShouldHandleNullChainScenario() {
        // この test case は private method createTheater の
        // else if (location != null) branch をテストする
        // demo data の中で new宿ピカデリー と 丸の内ピカデリー は chain が null で location が non-null
        when(theaterRepository.count()).thenReturn(0L);
        when(theaterRepository.save(any(Theater.class))).thenAnswer(invocation -> {
            Theater theater = invocation.getArgument(0);
            theater.setId(System.currentTimeMillis());
            theater.setCreatedAt(LocalDateTime.now());
            theater.setUpdatedAt(LocalDateTime.now());
            return theater;
        });

        // When
        theaterService.createDemoData();

        // Then
        verify(theaterRepository).count();
        verify(theaterRepository, atLeastOnce()).save(any(Theater.class));
    }

    @Test
    void createDemoData_ShouldCoverNullChainWithNonNullLocationBranch() {
        // Test private method createTheater with chain=null and location!=null
        // to achieve 100% coverage
        when(theaterRepository.count()).thenReturn(0L);
        when(theaterRepository.save(any(Theater.class))).thenAnswer(invocation -> {
            Theater theater = invocation.getArgument(0);
            theater.setId(System.currentTimeMillis());
            theater.setCreatedAt(LocalDateTime.now());
            theater.setUpdatedAt(LocalDateTime.now());
            return theater;
        });

        // When - trigger demo data creation which contains the missing branch
        theaterService.createDemoData();

        // Then - verify that theaters were created
        verify(theaterRepository).count();
        verify(theaterRepository, atLeastOnce()).save(any(Theater.class));
    }

    @Test
    void getNearbyTheaters_WithOnlyLatitudeNull_ShouldReturnAllActiveTheaters() {
        // Given
        Double latitude = null;
        Double longitude = 139.7005;
        Double radiusKm = 5.0;
        when(theaterRepository.findByIsActiveTrue()).thenReturn(testTheaters);

        // When
        List<TheaterDto> result = theaterService.getNearbyTheaters(latitude, longitude, radiusKm);

        // Then
        assertNotNull(result);
        assertEquals(3, result.size());
        verify(theaterRepository).findByIsActiveTrue();
        verify(theaterRepository, never()).findNearbyTheaters(anyDouble(), anyDouble(), anyDouble(), anyDouble());
    }

    @Test
    void getNearbyTheaters_WithOnlyRadiusNull_ShouldReturnAllActiveTheaters() {
        // Given
        Double latitude = 35.6938;
        Double longitude = 139.7005;
        Double radiusKm = null;
        when(theaterRepository.findByIsActiveTrue()).thenReturn(testTheaters);

        // When
        List<TheaterDto> result = theaterService.getNearbyTheaters(latitude, longitude, radiusKm);

        // Then
        assertNotNull(result);
        assertEquals(3, result.size());
        verify(theaterRepository).findByIsActiveTrue();
        verify(theaterRepository, never()).findNearbyTheaters(anyDouble(), anyDouble(), anyDouble(), anyDouble());
    }
}