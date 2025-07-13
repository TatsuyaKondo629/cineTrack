package com.cinetrack.dto.tmdb;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public class TmdbMovieListResponse {
    
    private Integer page;
    
    private List<TmdbMovieDto> results;
    
    @JsonProperty("total_pages")
    private Integer totalPages;
    
    @JsonProperty("total_results")
    private Integer totalResults;
    
    public TmdbMovieListResponse() {}
    
    public Integer getPage() {
        return page;
    }
    
    public void setPage(Integer page) {
        this.page = page;
    }
    
    public List<TmdbMovieDto> getResults() {
        return results;
    }
    
    public void setResults(List<TmdbMovieDto> results) {
        this.results = results;
    }
    
    public Integer getTotalPages() {
        return totalPages;
    }
    
    public void setTotalPages(Integer totalPages) {
        this.totalPages = totalPages;
    }
    
    public Integer getTotalResults() {
        return totalResults;
    }
    
    public void setTotalResults(Integer totalResults) {
        this.totalResults = totalResults;
    }
}