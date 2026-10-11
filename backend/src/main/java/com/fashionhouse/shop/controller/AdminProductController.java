package com.fashionhouse.shop.controller;

import com.fashionhouse.shop.dto.ProductRequest;
import com.fashionhouse.shop.entity.Category;
import com.fashionhouse.shop.entity.Product;
import com.fashionhouse.shop.repository.CategoryRepository;
import com.fashionhouse.shop.repository.ProductRepository;
import com.fashionhouse.shop.service.FileStorageService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Optional;


@RestController
@RequestMapping("/api/admin/products")
@PreAuthorize("hasRole('ADMIN')")
public class AdminProductController {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @PostMapping
    public ResponseEntity<?> createProduct(
            @RequestParam("product") String productStr,
            @RequestParam(value = "image", required = false) MultipartFile file) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            ProductRequest productReq = mapper.readValue(productStr, ProductRequest.class);

            Product product = new Product();
            product.setName(productReq.getName());
            product.setDescription(productReq.getDescription());
            product.setPrice(productReq.getPrice());
            product.setStockQuantity(productReq.getStockQuantity());
            product.setAvailable(productReq.getAvailable() != null ? productReq.getAvailable() : true);
            product.setAvailableSizes(productReq.getAvailableSizes());
            product.setAvailableColors(productReq.getAvailableColors());

            if (productReq.getCategoryId() != null) {
                Category category = categoryRepository.findById(productReq.getCategoryId())
                        .orElseThrow(() -> new RuntimeException("Category not found"));
                product.setCategory(category);
            }

            if (file != null && !file.isEmpty()) {
                String fileName = fileStorageService.storeFile(file);
                product.setImageUrl("/uploads/" + fileName);
            } else if (productReq.getImageUrl() != null && !productReq.getImageUrl().trim().isEmpty()) {
                product.setImageUrl(productReq.getImageUrl().trim());
            }

            Product savedProduct = productRepository.save(product);
            return ResponseEntity.ok(savedProduct);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(
            @PathVariable Long id,
            @RequestParam("product") String productStr,
            @RequestParam(value = "image", required = false) MultipartFile file) {
        try {
            Optional<Product> existingProduct = productRepository.findById(id);
            if (!existingProduct.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            Product product = existingProduct.get();
            ObjectMapper mapper = new ObjectMapper();
            ProductRequest productReq = mapper.readValue(productStr, ProductRequest.class);

            product.setName(productReq.getName());
            product.setDescription(productReq.getDescription());
            product.setPrice(productReq.getPrice());
            product.setStockQuantity(productReq.getStockQuantity());
            product.setAvailable(productReq.getAvailable() != null ? productReq.getAvailable() : true);
            product.setAvailableSizes(productReq.getAvailableSizes());
            product.setAvailableColors(productReq.getAvailableColors());

            if (productReq.getCategoryId() != null) {
                Category category = categoryRepository.findById(productReq.getCategoryId())
                        .orElseThrow(() -> new RuntimeException("Category not found"));
                product.setCategory(category);
            }

            if (file != null && !file.isEmpty()) {
                String fileName = fileStorageService.storeFile(file);
                product.setImageUrl("/uploads/" + fileName);
            } else if (productReq.getImageUrl() != null && !productReq.getImageUrl().trim().isEmpty()) {
                product.setImageUrl(productReq.getImageUrl().trim());
            }

            return ResponseEntity.ok(productRepository.save(product));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        if (!productRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        productRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
