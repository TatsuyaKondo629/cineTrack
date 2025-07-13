package com.cinetrack.dto.tmdb;

public class TmdbGenreDto {
    
    private Integer id;
    private String name;
    
    public TmdbGenreDto() {}
    
    public TmdbGenreDto(Integer id, String name) {
        this.id = id;
        this.name = name;
    }
    
    public Integer getId() {
        return id;
    }
    
    public void setId(Integer id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
}