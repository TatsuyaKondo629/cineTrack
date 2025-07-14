package com.cinetrack.controller;

import com.cinetrack.dto.ApiResponse;
import com.cinetrack.dto.WishlistDto;
import com.cinetrack.entity.User;
import com.cinetrack.service.UserService;
import com.cinetrack.service.WishlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/wishlist")
@CrossOrigin(origins = "*")
public class WishlistController {
    
    @Autowired
    private WishlistService wishlistService;
    
    @Autowired
    private UserService userService;
    
    /**
     * ユーザーのウィッシュリストを取得
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<WishlistDto>>> getUserWishlist(Authentication authentication) {
        try {
            User user = userService.findByUsername(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            List<WishlistDto> wishlist = wishlistService.getUserWishlist(user);
            
            return ResponseEntity.ok(ApiResponse.success("Wishlist retrieved successfully", wishlist));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to retrieve wishlist: " + e.getMessage()));
        }
    }
    
    /**
     * ウィッシュリストに映画を追加
     */
    @PostMapping("/add")
    public ResponseEntity<ApiResponse<WishlistDto>> addToWishlist(
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        try {
            User user = userService.findByUsername(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            Long tmdbMovieId = Long.valueOf(request.get("tmdbMovieId").toString());
            String movieTitle = (String) request.get("movieTitle");
            String moviePosterPath = (String) request.get("moviePosterPath");
            String movieOverview = (String) request.get("movieOverview");
            String movieReleaseDate = (String) request.get("movieReleaseDate");
            Double movieVoteAverage = request.get("movieVoteAverage") != null ? 
                Double.valueOf(request.get("movieVoteAverage").toString()) : null;
            
            WishlistDto wishlistItem = wishlistService.addToWishlist(
                user, tmdbMovieId, movieTitle, moviePosterPath, 
                movieOverview, movieReleaseDate, movieVoteAverage
            );
            
            return ResponseEntity.ok(ApiResponse.success("Movie added to wishlist successfully", wishlistItem));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to add movie to wishlist: " + e.getMessage()));
        }
    }
    
    /**
     * ウィッシュリストから映画を削除
     */
    @DeleteMapping("/remove/{tmdbMovieId}")
    public ResponseEntity<ApiResponse<String>> removeFromWishlist(
            @PathVariable Long tmdbMovieId,
            Authentication authentication) {
        try {
            User user = userService.findByUsername(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            wishlistService.removeFromWishlist(user, tmdbMovieId);
            
            return ResponseEntity.ok(ApiResponse.success("Movie removed from wishlist successfully", null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to remove movie from wishlist: " + e.getMessage()));
        }
    }
    
    /**
     * 映画がウィッシュリストに存在するかチェック
     */
    @GetMapping("/check/{tmdbMovieId}")
    public ResponseEntity<ApiResponse<Boolean>> checkInWishlist(
            @PathVariable Long tmdbMovieId,
            Authentication authentication) {
        try {
            User user = userService.findByUsername(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            boolean isInWishlist = wishlistService.isInWishlist(user, tmdbMovieId);
            
            return ResponseEntity.ok(ApiResponse.success("Wishlist check completed", isInWishlist));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to check wishlist: " + e.getMessage()));
        }
    }
    
    /**
     * ウィッシュリストの件数を取得
     */
    @GetMapping("/count")
    public ResponseEntity<ApiResponse<Long>> getWishlistCount(Authentication authentication) {
        try {
            User user = userService.findByUsername(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            long count = wishlistService.getWishlistCount(user);
            
            return ResponseEntity.ok(ApiResponse.success("Wishlist count retrieved successfully", count));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to get wishlist count: " + e.getMessage()));
        }
    }
    
    /**
     * ウィッシュリストをクリア
     */
    @DeleteMapping("/clear")
    public ResponseEntity<ApiResponse<String>> clearWishlist(Authentication authentication) {
        try {
            User user = userService.findByUsername(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            wishlistService.clearWishlist(user);
            
            return ResponseEntity.ok(ApiResponse.success("Wishlist cleared successfully", null));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to clear wishlist: " + e.getMessage()));
        }
    }
}