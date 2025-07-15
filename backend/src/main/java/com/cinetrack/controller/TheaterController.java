package com.cinetrack.controller;

import com.cinetrack.dto.ApiResponse;
import com.cinetrack.dto.TheaterDto;
import com.cinetrack.service.TheaterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/theaters")
@CrossOrigin(origins = "*")
public class TheaterController {
    
    @Autowired
    private TheaterService theaterService;
    
    /**
     * 全ての映画館を取得
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<TheaterDto>>> getAllTheaters() {
        try {
            List<TheaterDto> theaters = theaterService.getAllActiveTheaters();
            return ResponseEntity.ok(ApiResponse.success("映画館一覧を取得しました", theaters));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("映画館一覧の取得に失敗しました: " + e.getMessage()));
        }
    }
    
    /**
     * 映画館を検索
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<TheaterDto>>> searchTheaters(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String prefecture,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String chain,
            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) Double longitude,
            @RequestParam(required = false, defaultValue = "10") Double radius) {
        try {
            List<TheaterDto> theaters;
            
            // 位置情報による検索
            if (latitude != null && longitude != null) {
                theaters = theaterService.getNearbyTheaters(latitude, longitude, radius);
            }
            // 複合検索（複数の条件を組み合わせ）
            else {
                theaters = theaterService.searchTheatersByMultipleCriteria(query, prefecture, city, chain);
            }
            
            return ResponseEntity.ok(ApiResponse.success("映画館検索が完了しました", theaters));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("映画館検索に失敗しました: " + e.getMessage()));
        }
    }
    
    /**
     * 特定の映画館の詳細を取得
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TheaterDto>> getTheaterById(@PathVariable Long id) {
        try {
            Optional<TheaterDto> theater = theaterService.getTheaterById(id);
            if (theater.isPresent()) {
                return ResponseEntity.ok(ApiResponse.success("映画館詳細を取得しました", theater.get()));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("映画館詳細の取得に失敗しました: " + e.getMessage()));
        }
    }
    
    /**
     * 都道府県一覧を取得
     */
    @GetMapping("/prefectures")
    public ResponseEntity<ApiResponse<List<String>>> getAllPrefectures() {
        try {
            List<String> prefectures = theaterService.getAllPrefectures();
            return ResponseEntity.ok(ApiResponse.success("都道府県一覧を取得しました", prefectures));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("都道府県一覧の取得に失敗しました: " + e.getMessage()));
        }
    }
    
    /**
     * 指定した都道府県の市区町村一覧を取得
     */
    @GetMapping("/cities")
    public ResponseEntity<ApiResponse<List<String>>> getCitiesByPrefecture(
            @RequestParam String prefecture) {
        try {
            List<String> cities = theaterService.getCitiesByPrefecture(prefecture);
            return ResponseEntity.ok(ApiResponse.success("市区町村一覧を取得しました", cities));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("市区町村一覧の取得に失敗しました: " + e.getMessage()));
        }
    }
    
    /**
     * チェーン一覧を取得
     */
    @GetMapping("/chains")
    public ResponseEntity<ApiResponse<List<String>>> getAllChains() {
        try {
            List<String> chains = theaterService.getAllChains();
            return ResponseEntity.ok(ApiResponse.success("チェーン一覧を取得しました", chains));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("チェーン一覧の取得に失敗しました: " + e.getMessage()));
        }
    }
    
    /**
     * デモデータを作成（開発用）
     */
    @PostMapping("/demo-data")
    public ResponseEntity<ApiResponse<String>> createDemoData() {
        try {
            theaterService.createDemoData();
            return ResponseEntity.ok(ApiResponse.success("デモデータを作成しました", null));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("デモデータの作成に失敗しました: " + e.getMessage()));
        }
    }
    
    // 管理者用エンドポイント（将来の拡張用）
    
    /**
     * 映画館を新規作成（管理者用）
     */
    @PostMapping
    public ResponseEntity<ApiResponse<TheaterDto>> createTheater(@RequestBody TheaterDto theaterDto) {
        try {
            TheaterDto createdTheater = theaterService.createTheater(theaterDto);
            return ResponseEntity.ok(ApiResponse.success("映画館を作成しました", createdTheater));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("映画館の作成に失敗しました: " + e.getMessage()));
        }
    }
    
    /**
     * 映画館情報を更新（管理者用）
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TheaterDto>> updateTheater(
            @PathVariable Long id, @RequestBody TheaterDto theaterDto) {
        try {
            Optional<TheaterDto> updatedTheater = theaterService.updateTheater(id, theaterDto);
            if (updatedTheater.isPresent()) {
                return ResponseEntity.ok(ApiResponse.success("映画館を更新しました", updatedTheater.get()));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("映画館の更新に失敗しました: " + e.getMessage()));
        }
    }
    
    /**
     * 映画館を無効化（管理者用）
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deactivateTheater(@PathVariable Long id) {
        try {
            boolean success = theaterService.deactivateTheater(id);
            if (success) {
                return ResponseEntity.ok(ApiResponse.success("映画館を無効化しました", null));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("映画館の無効化に失敗しました: " + e.getMessage()));
        }
    }
}