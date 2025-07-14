package com.cinetrack.service;

import com.cinetrack.dto.WishlistDto;
import com.cinetrack.entity.User;
import com.cinetrack.entity.Wishlist;
import com.cinetrack.repository.WishlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class WishlistService {
    
    @Autowired
    private WishlistRepository wishlistRepository;
    
    /**
     * ユーザーのウィッシュリストを取得
     */
    public List<WishlistDto> getUserWishlist(User user) {
        List<Wishlist> wishlistItems = wishlistRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        return wishlistItems.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    /**
     * ウィッシュリストに映画を追加
     */
    public WishlistDto addToWishlist(User user, Long tmdbMovieId, String movieTitle, 
                                    String moviePosterPath, String movieOverview, 
                                    String movieReleaseDate, Double movieVoteAverage) {
        
        // 既に存在する場合は追加しない
        if (wishlistRepository.existsByUserIdAndTmdbMovieId(user.getId(), tmdbMovieId)) {
            throw new IllegalArgumentException("Movie is already in wishlist");
        }
        
        Wishlist wishlistItem = new Wishlist(user, tmdbMovieId, movieTitle, moviePosterPath, 
                                           movieOverview, movieReleaseDate, movieVoteAverage);
        
        Wishlist savedItem = wishlistRepository.save(wishlistItem);
        return convertToDto(savedItem);
    }
    
    /**
     * ウィッシュリストから映画を削除
     */
    public void removeFromWishlist(User user, Long tmdbMovieId) {
        Optional<Wishlist> wishlistItem = wishlistRepository.findByUserIdAndTmdbMovieId(user.getId(), tmdbMovieId);
        
        if (wishlistItem.isPresent()) {
            wishlistRepository.delete(wishlistItem.get());
        } else {
            throw new IllegalArgumentException("Movie not found in wishlist");
        }
    }
    
    /**
     * 映画がウィッシュリストに存在するかチェック
     */
    public boolean isInWishlist(User user, Long tmdbMovieId) {
        return wishlistRepository.existsByUserIdAndTmdbMovieId(user.getId(), tmdbMovieId);
    }
    
    /**
     * ウィッシュリストの件数を取得
     */
    public long getWishlistCount(User user) {
        return wishlistRepository.countByUserId(user.getId());
    }
    
    /**
     * ウィッシュリストをクリア
     */
    public void clearWishlist(User user) {
        List<Wishlist> wishlistItems = wishlistRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        wishlistRepository.deleteAll(wishlistItems);
    }
    
    /**
     * WishlistエンティティをDTOに変換
     */
    private WishlistDto convertToDto(Wishlist wishlist) {
        return new WishlistDto(
            wishlist.getId(),
            wishlist.getTmdbMovieId(),
            wishlist.getMovieTitle(),
            wishlist.getMoviePosterPath(),
            wishlist.getMovieOverview(),
            wishlist.getMovieReleaseDate(),
            wishlist.getMovieVoteAverage(),
            wishlist.getCreatedAt()
        );
    }
}