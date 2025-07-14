package com.cinetrack.controller;

import com.cinetrack.dto.ApiResponse;
import com.cinetrack.dto.StatsDto;
import com.cinetrack.entity.User;
import com.cinetrack.service.StatsService;
import com.cinetrack.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/stats")
@CrossOrigin(origins = "http://localhost:3000")
public class StatsController {
    
    @Autowired
    private StatsService statsService;
    
    @Autowired
    private UserService userService;
    
    @GetMapping("/monthly")
    public ResponseEntity<ApiResponse<List<StatsDto.MonthlyStats>>> getMonthlyStats(Authentication authentication) {
        try {
            User user = userService.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            List<StatsDto.MonthlyStats> monthlyStats = statsService.getMonthlyStats(user);
            
            return ResponseEntity.ok(ApiResponse.success("月別統計を取得しました", monthlyStats));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("月別統計の取得に失敗しました: " + e.getMessage()));
        }
    }
    
    @GetMapping("/genres")
    public ResponseEntity<ApiResponse<List<StatsDto.GenreStats>>> getGenreStats(Authentication authentication) {
        try {
            User user = userService.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            List<StatsDto.GenreStats> genreStats = statsService.getGenreStats(user);
            
            return ResponseEntity.ok(ApiResponse.success("ジャンル統計を取得しました", genreStats));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("ジャンル統計の取得に失敗しました: " + e.getMessage()));
        }
    }
    
    @GetMapping("/ratings")
    public ResponseEntity<ApiResponse<List<StatsDto.RatingDistribution>>> getRatingDistribution(Authentication authentication) {
        try {
            User user = userService.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            List<StatsDto.RatingDistribution> ratingStats = statsService.getRatingDistribution(user);
            
            return ResponseEntity.ok(ApiResponse.success("評価分布を取得しました", ratingStats));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("評価分布の取得に失敗しました: " + e.getMessage()));
        }
    }
    
    @GetMapping("/overall")
    public ResponseEntity<ApiResponse<StatsDto.OverallStats>> getOverallStats(Authentication authentication) {
        try {
            User user = userService.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            StatsDto.OverallStats overallStats = statsService.getOverallStats(user);
            
            return ResponseEntity.ok(ApiResponse.success("全体統計を取得しました", overallStats));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("全体統計の取得に失敗しました: " + e.getMessage()));
        }
    }
    
    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStatsSummary(Authentication authentication) {
        try {
            User user = userService.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            Map<String, Object> summary = new HashMap<>();
            summary.put("overall", statsService.getOverallStats(user));
            summary.put("monthly", statsService.getMonthlyStats(user));
            summary.put("genres", statsService.getGenreStats(user));
            summary.put("ratings", statsService.getRatingDistribution(user));
            
            return ResponseEntity.ok(ApiResponse.success("統計サマリーを取得しました", summary));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("統計サマリーの取得に失敗しました: " + e.getMessage()));
        }
    }
}