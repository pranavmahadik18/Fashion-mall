package com.fashionhouse.shop.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Entity
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;
    private BigDecimal price;
    private Integer stockQuantity;
    private Boolean available;
    private String imageUrl;
    private String availableSizes;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;
}
