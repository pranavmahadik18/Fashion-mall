package com.fashionhouse.shop.dto;

import lombok.Data;
import java.math.BigDecimal;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class ProductRequest {
    @NotBlank
    private String name;
    private String description;
    
    @NotNull
    @Min(0)
    private BigDecimal price;
    
    @NotNull
    @Min(0)
    private Integer stockQuantity;
    
    private Boolean available;
    private Long categoryId;
    private String availableSizes;
    private String availableColors;
    private String imageUrl;
}
