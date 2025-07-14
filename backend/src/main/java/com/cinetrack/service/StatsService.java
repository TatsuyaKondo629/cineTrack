package com.cinetrack.service;

import com.cinetrack.dto.StatsDto;
import com.cinetrack.entity.User;
import com.cinetrack.entity.ViewingRecord;
import com.cinetrack.repository.ViewingRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class StatsService {
    
    @Autowired
    private ViewingRecordRepository viewingRecordRepository;
    
    public List<StatsDto.MonthlyStats> getMonthlyStats(User user) {
        List<ViewingRecord> records = viewingRecordRepository.findByUserIdOrderByViewingDateDesc(user.getId());
        
        Map<String, Long> monthlyCount = records.stream()
            .collect(Collectors.groupingBy(
                record -> record.getViewingDate().toLocalDate().format(DateTimeFormatter.ofPattern("yyyy-MM")),
                Collectors.counting()
            ));
        
        return monthlyCount.entrySet().stream()
            .map(entry -> new StatsDto.MonthlyStats(entry.getKey(), entry.getValue()))
            .sorted((a, b) -> a.getMonth().compareTo(b.getMonth()))
            .collect(Collectors.toList());
    }
    
    public List<StatsDto.GenreStats> getGenreStats(User user) {
        List<ViewingRecord> records = viewingRecordRepository.findByUserIdOrderByViewingDateDesc(user.getId());
        long totalRecords = records.size();
        
        if (totalRecords == 0) {
            return new ArrayList<>();
        }
        
        // TMDBジャンルマッピング（簡略版）
        Map<String, String> genreMap = createGenreMap();
        
        Map<String, Long> genreCount = new HashMap<>();
        
        // 各映画のIDをベースにした固定的なジャンル取得（実際はTMDB APIから取得）
        List<String> genres = Arrays.asList("アクション", "コメディ", "ドラマ", "ホラー", "SF", "ロマンス", "スリラー", "アニメ");
        
        for (ViewingRecord record : records) {
            // 映画IDをベースにして常に同じジャンルを取得（一番先頭のジャンル想定）
            Long movieId = record.getTmdbMovieId();
            int genreIndex = (int) (movieId % genres.size());
            String genre = genres.get(genreIndex);
            genreCount.merge(genre, 1L, Long::sum);
        }
        
        return genreCount.entrySet().stream()
            .map(entry -> new StatsDto.GenreStats(
                entry.getKey(), 
                entry.getValue(),
                (double) entry.getValue() / totalRecords * 100
            ))
            .sorted((a, b) -> Long.compare(b.getCount(), a.getCount()))
            .collect(Collectors.toList());
    }
    
    public List<StatsDto.RatingDistribution> getRatingDistribution(User user) {
        List<ViewingRecord> records = viewingRecordRepository.findByUserIdOrderByViewingDateDesc(user.getId());
        
        Map<Double, Long> ratingCount = records.stream()
            .collect(Collectors.groupingBy(
                ViewingRecord::getRating,
                Collectors.counting()
            ));
        
        return ratingCount.entrySet().stream()
            .map(entry -> new StatsDto.RatingDistribution(entry.getKey(), entry.getValue()))
            .sorted((a, b) -> Double.compare(a.getRating(), b.getRating()))
            .collect(Collectors.toList());
    }
    
    public StatsDto.OverallStats getOverallStats(User user) {
        List<ViewingRecord> records = viewingRecordRepository.findByUserIdOrderByViewingDateDesc(user.getId());
        
        StatsDto.OverallStats stats = new StatsDto.OverallStats();
        
        if (records.isEmpty()) {
            stats.setTotalMovies(0);
            stats.setAverageRating(0.0);
            stats.setViewingDays(0);
            stats.setMoviesPerMonth(0.0);
            return stats;
        }
        
        // 基本統計
        stats.setTotalMovies(records.size());
        stats.setAverageRating(records.stream()
            .mapToDouble(ViewingRecord::getRating)
            .average()
            .orElse(0.0));
        
        // 日付関連統計
        LocalDateTime firstDateTime = records.stream()
            .map(ViewingRecord::getViewingDate)
            .min(LocalDateTime::compareTo)
            .orElse(LocalDateTime.now());
        LocalDate firstDate = firstDateTime.toLocalDate();
        
        LocalDateTime lastDateTime = records.stream()
            .map(ViewingRecord::getViewingDate)
            .max(LocalDateTime::compareTo)
            .orElse(LocalDateTime.now());
        LocalDate lastDate = lastDateTime.toLocalDate();
        
        stats.setFirstViewingDate(firstDate);
        stats.setLastViewingDate(lastDate);
        
        long daysBetween = ChronoUnit.DAYS.between(firstDate, lastDate);
        stats.setViewingDays((int) daysBetween + 1);
        
        // 月あたりの視聴数
        long monthsBetween = ChronoUnit.MONTHS.between(firstDate, lastDate) + 1;
        stats.setMoviesPerMonth((double) records.size() / monthsBetween);
        
        // お気に入りジャンル（仮データ）
        List<StatsDto.GenreStats> genreStats = getGenreStats(user);
        if (!genreStats.isEmpty()) {
            stats.setFavoriteGenre(genreStats.get(0).getGenre());
        }
        
        return stats;
    }
    
    private Map<String, String> createGenreMap() {
        Map<String, String> genreMap = new HashMap<>();
        genreMap.put("28", "アクション");
        genreMap.put("12", "アドベンチャー");
        genreMap.put("16", "アニメ");
        genreMap.put("35", "コメディ");
        genreMap.put("80", "クライム");
        genreMap.put("99", "ドキュメンタリー");
        genreMap.put("18", "ドラマ");
        genreMap.put("10751", "ファミリー");
        genreMap.put("14", "ファンタジー");
        genreMap.put("36", "ヒストリー");
        genreMap.put("27", "ホラー");
        genreMap.put("10402", "ミュージック");
        genreMap.put("9648", "ミステリー");
        genreMap.put("10749", "ロマンス");
        genreMap.put("878", "SF");
        genreMap.put("10770", "テレビ映画");
        genreMap.put("53", "スリラー");
        genreMap.put("10752", "戦争");
        genreMap.put("37", "西部劇");
        return genreMap;
    }
}