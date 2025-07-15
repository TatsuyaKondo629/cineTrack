package com.cinetrack.repository;

import com.cinetrack.entity.Theater;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TheaterRepository extends JpaRepository<Theater, Long> {
    
    // アクティブな映画館のみを取得
    List<Theater> findByIsActiveTrue();
    
    // 名前で検索（部分一致、大文字小文字区別なし）
    @Query("SELECT t FROM Theater t WHERE t.isActive = true AND " +
           "(LOWER(t.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(t.chain) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(t.location) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Theater> findByNameContainingIgnoreCase(@Param("query") String query);
    
    // 都道府県で検索
    List<Theater> findByPrefectureAndIsActiveTrueOrderByNameAsc(String prefecture);
    
    // 市区町村で検索
    List<Theater> findByCityAndIsActiveTrueOrderByNameAsc(String city);
    
    // チェーンで検索
    List<Theater> findByChainAndIsActiveTrueOrderByLocationAsc(String chain);
    
    // 都道府県と市区町村で検索
    List<Theater> findByPrefectureAndCityAndIsActiveTrueOrderByNameAsc(String prefecture, String city);
    
    // 位置情報による近隣検索（緯度経度の範囲指定）
    @Query("SELECT t FROM Theater t WHERE t.isActive = true AND " +
           "t.latitude BETWEEN :minLat AND :maxLat AND " +
           "t.longitude BETWEEN :minLng AND :maxLng " +
           "ORDER BY t.name")
    List<Theater> findNearbyTheaters(@Param("minLat") Double minLatitude, 
                                   @Param("maxLat") Double maxLatitude,
                                   @Param("minLng") Double minLongitude, 
                                   @Param("maxLng") Double maxLongitude);
    
    // 都道府県一覧を取得（重複なし）
    @Query("SELECT DISTINCT t.prefecture FROM Theater t WHERE t.isActive = true AND t.prefecture IS NOT NULL ORDER BY t.prefecture")
    List<String> findDistinctPrefectures();
    
    // 指定した都道府県の市区町村一覧を取得（重複なし）
    @Query("SELECT DISTINCT t.city FROM Theater t WHERE t.isActive = true AND t.prefecture = :prefecture AND t.city IS NOT NULL ORDER BY t.city")
    List<String> findDistinctCitiesByPrefecture(@Param("prefecture") String prefecture);
    
    // チェーン一覧を取得（重複なし）
    @Query("SELECT DISTINCT t.chain FROM Theater t WHERE t.isActive = true AND t.chain IS NOT NULL ORDER BY t.chain")
    List<String> findDistinctChains();
    
    // 複数の条件で検索
    @Query("SELECT t FROM Theater t WHERE t.isActive = true " +
           "AND (:query IS NULL OR :query = '' OR " +
           "LOWER(t.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(t.chain) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(t.location) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "AND (:prefecture IS NULL OR :prefecture = '' OR t.prefecture = :prefecture) " +
           "AND (:city IS NULL OR :city = '' OR t.city = :city) " +
           "AND (:chain IS NULL OR :chain = '' OR t.chain = :chain) " +
           "ORDER BY t.name")
    List<Theater> findByMultipleCriteria(@Param("query") String query, 
                                       @Param("prefecture") String prefecture,
                                       @Param("city") String city,
                                       @Param("chain") String chain);
}