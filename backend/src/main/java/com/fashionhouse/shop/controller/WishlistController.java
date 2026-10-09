package com.fashionhouse.shop.controller;

import com.fashionhouse.shop.entity.Product;
import com.fashionhouse.shop.entity.User;
import com.fashionhouse.shop.entity.Wishlist;
import com.fashionhouse.shop.repository.ProductRepository;
import com.fashionhouse.shop.repository.UserRepository;
import com.fashionhouse.shop.repository.WishlistRepository;
import com.fashionhouse.shop.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Optional;

@RestController
@RequestMapping("/api/wishlist")
@PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
public class WishlistController {

    @Autowired
    private WishlistRepository wishlistRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    private User getCurrentUser() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userRepository.findById(userDetails.getId()).orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public ResponseEntity<Wishlist> getWishlist() {
        User user = getCurrentUser();
        Wishlist wishlist = wishlistRepository.findByUser(user).orElseGet(() -> {
            Wishlist newWishlist = new Wishlist();
            newWishlist.setUser(user);
            newWishlist.setProducts(new ArrayList<>());
            return wishlistRepository.save(newWishlist);
        });
        return ResponseEntity.ok(wishlist);
    }

    @PostMapping("/{productId}")
    public ResponseEntity<?> addProductToWishlist(@PathVariable Long productId) {
        User user = getCurrentUser();
        Product product = productRepository.findById(productId).orElseThrow(() -> new RuntimeException("Product not found"));
        
        Wishlist wishlist = wishlistRepository.findByUser(user).orElseGet(() -> {
            Wishlist newWishlist = new Wishlist();
            newWishlist.setUser(user);
            newWishlist.setProducts(new ArrayList<>());
            return newWishlist;
        });

        if (!wishlist.getProducts().contains(product)) {
            wishlist.getProducts().add(product);
            wishlistRepository.save(wishlist);
        }
        
        return ResponseEntity.ok(wishlist);
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<?> removeProductFromWishlist(@PathVariable Long productId) {
        User user = getCurrentUser();
        Product product = productRepository.findById(productId).orElseThrow(() -> new RuntimeException("Product not found"));
        
        Optional<Wishlist> wishlistOpt = wishlistRepository.findByUser(user);
        if (wishlistOpt.isPresent()) {
            Wishlist wishlist = wishlistOpt.get();
            wishlist.getProducts().remove(product);
            wishlistRepository.save(wishlist);
            return ResponseEntity.ok(wishlist);
        }
        
        return ResponseEntity.notFound().build();
    }
}
