package com.cinetrack.dto.tmdb;

import com.fasterxml.jackson.annotation.JsonProperty;

public class TmdbProductionCompanyDto {
    
    private Integer id;
    private String name;
    
    @JsonProperty("logo_path")
    private String logoPath;
    
    @JsonProperty("origin_country")
    private String originCountry;
    
    public TmdbProductionCompanyDto() {}
    
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
    
    public String getLogoPath() {
        return logoPath;
    }
    
    public void setLogoPath(String logoPath) {
        this.logoPath = logoPath;
    }
    
    public String getOriginCountry() {
        return originCountry;
    }
    
    public void setOriginCountry(String originCountry) {
        this.originCountry = originCountry;
    }
}