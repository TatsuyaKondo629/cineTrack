package com.cinetrack.service;

import com.cinetrack.dto.TheaterDto;
import com.cinetrack.entity.Theater;
import com.cinetrack.repository.TheaterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class TheaterService {
    
    @Autowired
    private TheaterRepository theaterRepository;
    
    /**
     * 全ての映画館を取得（アクティブのみ）
     */
    public List<TheaterDto> getAllActiveTheaters() {
        return theaterRepository.findByIsActiveTrue()
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    /**
     * 映画館を検索（名前、チェーン、場所で部分一致検索）
     */
    public List<TheaterDto> searchTheaters(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAllActiveTheaters();
        }
        
        return theaterRepository.findByNameContainingIgnoreCase(query.trim())
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    /**
     * 複数の条件で映画館を検索
     */
    public List<TheaterDto> searchTheatersByMultipleCriteria(String query, String prefecture, String city, String chain) {
        return theaterRepository.findByMultipleCriteria(query, prefecture, city, chain)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    /**
     * 都道府県で映画館を検索
     */
    public List<TheaterDto> getTheatersByPrefecture(String prefecture) {
        return theaterRepository.findByPrefectureAndIsActiveTrueOrderByNameAsc(prefecture)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    /**
     * 市区町村で映画館を検索
     */
    public List<TheaterDto> getTheatersByCity(String city) {
        return theaterRepository.findByCityAndIsActiveTrueOrderByNameAsc(city)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    /**
     * チェーンで映画館を検索
     */
    public List<TheaterDto> getTheatersByChain(String chain) {
        return theaterRepository.findByChainAndIsActiveTrueOrderByLocationAsc(chain)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    /**
     * 都道府県と市区町村で映画館を検索
     */
    public List<TheaterDto> getTheatersByPrefectureAndCity(String prefecture, String city) {
        return theaterRepository.findByPrefectureAndCityAndIsActiveTrueOrderByNameAsc(prefecture, city)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    /**
     * 近隣の映画館を検索（緯度経度を中心とした範囲検索）
     */
    public List<TheaterDto> getNearbyTheaters(Double latitude, Double longitude, Double radiusKm) {
        if (latitude == null || longitude == null || radiusKm == null) {
            return getAllActiveTheaters();
        }
        
        // 1度あたりの距離（おおよそ）
        double latDegreeKm = 111.0; // 緯度1度 ≈ 111km
        double lngDegreeKm = 111.0 * Math.cos(Math.toRadians(latitude)); // 経度1度（緯度による補正）
        
        double latRadius = radiusKm / latDegreeKm;
        double lngRadius = radiusKm / lngDegreeKm;
        
        double minLat = latitude - latRadius;
        double maxLat = latitude + latRadius;
        double minLng = longitude - lngRadius;
        double maxLng = longitude + lngRadius;
        
        return theaterRepository.findNearbyTheaters(minLat, maxLat, minLng, maxLng)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    /**
     * IDで映画館を取得
     */
    public Optional<TheaterDto> getTheaterById(Long id) {
        return theaterRepository.findById(id)
                .map(this::convertToDto);
    }
    
    /**
     * 都道府県一覧を取得
     */
    public List<String> getAllPrefectures() {
        return theaterRepository.findDistinctPrefectures();
    }
    
    /**
     * 指定した都道府県の市区町村一覧を取得
     */
    public List<String> getCitiesByPrefecture(String prefecture) {
        return theaterRepository.findDistinctCitiesByPrefecture(prefecture);
    }
    
    /**
     * チェーン一覧を取得
     */
    public List<String> getAllChains() {
        return theaterRepository.findDistinctChains();
    }
    
    /**
     * 映画館を新規作成（管理者用）
     */
    public TheaterDto createTheater(TheaterDto theaterDto) {
        Theater theater = convertToEntity(theaterDto);
        theater.setIsActive(true);
        Theater savedTheater = theaterRepository.save(theater);
        return convertToDto(savedTheater);
    }
    
    /**
     * 映画館情報を更新（管理者用）
     */
    public Optional<TheaterDto> updateTheater(Long id, TheaterDto theaterDto) {
        return theaterRepository.findById(id)
                .map(existingTheater -> {
                    updateTheaterFromDto(existingTheater, theaterDto);
                    Theater savedTheater = theaterRepository.save(existingTheater);
                    return convertToDto(savedTheater);
                });
    }
    
    /**
     * 映画館を無効化（物理削除はしない）
     */
    public boolean deactivateTheater(Long id) {
        return theaterRepository.findById(id)
                .map(theater -> {
                    theater.setIsActive(false);
                    theaterRepository.save(theater);
                    return true;
                })
                .orElse(false);
    }
    
    /**
     * デモデータを作成（初期化用）
     */
    public void createDemoData() {
        if (theaterRepository.count() == 0) {
            createDemoTheaters();
        }
    }
    
    // プライベートメソッド
    
    private TheaterDto convertToDto(Theater theater) {
        return new TheaterDto(
                theater.getId(),
                theater.getName(),
                theater.getChain(),
                theater.getLocation(),
                theater.getAddress(),
                theater.getPhone(),
                theater.getWebsite(),
                theater.getPrefecture(),
                theater.getCity(),
                theater.getLatitude(),
                theater.getLongitude(),
                theater.getIsActive(),
                theater.getCreatedAt(),
                theater.getUpdatedAt()
        );
    }
    
    private Theater convertToEntity(TheaterDto dto) {
        Theater theater = new Theater();
        updateTheaterFromDto(theater, dto);
        return theater;
    }
    
    private void updateTheaterFromDto(Theater theater, TheaterDto dto) {
        theater.setName(dto.getName());
        theater.setChain(dto.getChain());
        theater.setLocation(dto.getLocation());
        theater.setAddress(dto.getAddress());
        theater.setPhone(dto.getPhone());
        theater.setWebsite(dto.getWebsite());
        theater.setPrefecture(dto.getPrefecture());
        theater.setCity(dto.getCity());
        theater.setLatitude(dto.getLatitude());
        theater.setLongitude(dto.getLongitude());
    }
    
    private void createDemoTheaters() {
        // 主要な映画館チェーンのデモデータを作成
        Theater[] demoTheaters = {
            createTheater("TOHOシネマズ", "新宿", "東京都", "新宿区", "東京都新宿区歌舞伎町1-19-1 新宿東宝ビル3～5F", "050-6868-5063", "https://www.tohotheater.jp/theater/023/", 35.6938, 139.7005),
            createTheater("TOHOシネマズ", "渋谷", "東京都", "渋谷区", "東京都渋谷区道玄坂2-6-17", "050-6868-5002", "https://www.tohotheater.jp/theater/002/", 35.6581, 139.6956),
            createTheater("TOHOシネマズ", "六本木ヒルズ", "東京都", "港区", "東京都港区六本木6-10-2 六本木ヒルズけやき坂コンプレックス内", "050-6868-5024", "https://www.tohotheater.jp/theater/024/", 35.6627, 139.7291),
            createTheater("イオンシネマ", "板橋", "東京都", "板橋区", "東京都板橋区徳丸2-6-1 イオン板橋店4F", "03-3937-1551", "https://www.aeoncinema.com/cinema/itabashi/", 35.7837, 139.6622),
            createTheater("109シネマズ", "二子玉川", "東京都", "世田谷区", "東京都世田谷区玉川1-14-1 二子玉川ライズ・ショッピングセンター 5F", "0570-077-109", "https://109cinemas.net/futakotamagawa/", 35.6124, 139.6286),
            createTheater("ユナイテッド・シネマ", "豊洲", "東京都", "江東区", "東京都江東区豊洲2-4-9 アーバンドックららぽーと豊洲1 3F", "0570-783-804", "https://www.unitedcinemas.jp/toyosu/", 35.6548, 139.7885),
            createTheater("T・ジョイ", "PRINCE品川", "東京都", "港区", "東京都港区高輪4-10-30 品川プリンスホテル アネックスタワー3F", "03-5421-1113", "https://www.t-joy.net/site_top/prince_shinagawa/", 35.6284, 139.7386),
            createTheater("新宿ピカデリー", null, "東京都", "新宿区", "東京都新宿区新宿3-15-15", "050-6861-3011", "https://www.smt-cinema.com/site/shinjuku/", 35.6902, 139.7043),
            createTheater("丸の内ピカデリー", null, "東京都", "千代田区", "東京都千代田区有楽町2-5-1 有楽町マリオン9F", "050-6875-0075", "https://www.smt-cinema.com/site/marunouchi/", 35.6732, 139.7633),
            createTheater("TOHOシネマズ", "梅田", "大阪府", "大阪市北区", "大阪府大阪市北区角田町7-10 HEP NAVIO 7F・8F", "050-6868-5014", "https://www.tohotheater.jp/theater/014/", 34.7024, 135.4959)
        };
        
        for (Theater theater : demoTheaters) {
            theaterRepository.save(theater);
        }
    }
    
    private Theater createTheater(String chain, String location, String prefecture, String city, 
                                String address, String phone, String website, Double lat, Double lng) {
        Theater theater = new Theater();
        
        // 名前を生成（チェーン + 場所、または単独名）
        if (chain != null && location != null) {
            theater.setName(chain + " " + location);
            theater.setChain(chain);
            theater.setLocation(location);
        } else if (location != null) {
            theater.setName(location);
            theater.setChain(chain);
        } else {
            theater.setName(chain);
        }
        
        theater.setPrefecture(prefecture);
        theater.setCity(city);
        theater.setAddress(address);
        theater.setPhone(phone);
        theater.setWebsite(website);
        theater.setLatitude(lat);
        theater.setLongitude(lng);
        theater.setIsActive(true);
        
        return theater;
    }
}