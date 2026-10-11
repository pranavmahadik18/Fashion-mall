package com.fashionhouse.shop.controller;

import com.fashionhouse.shop.entity.Cart;
import com.fashionhouse.shop.entity.CartItem;
import com.fashionhouse.shop.entity.Product;
import com.fashionhouse.shop.entity.User;
import com.fashionhouse.shop.repository.CartRepository;
import com.fashionhouse.shop.repository.ProductRepository;
import com.fashionhouse.shop.repository.UserRepository;
import com.fashionhouse.shop.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;


@RestController
@RequestMapping("/api/cart")
@PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
public class CartController {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    private User getCurrentUser() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userRepository.findById(userDetails.getId()).orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public ResponseEntity<Cart> getCart() {
        User user = getCurrentUser();
        Cart cart = cartRepository.findByUser(user).orElseGet(() -> {
            Cart newCart = new Cart();
            newCart.setUser(user);
            return cartRepository.save(newCart);
        });
        return ResponseEntity.ok(cart);
    }

    @PostMapping("/add/{productId}")
    public ResponseEntity<?> addToCart(
            @PathVariable Long productId, 
            @RequestParam(defaultValue = "1") Integer quantity, 
            @RequestParam(required = false) String size,
            @RequestParam(required = false) String color) {
        User user = getCurrentUser();
        Cart cart = cartRepository.findByUser(user).orElseGet(() -> {
            Cart newCart = new Cart();
            newCart.setUser(user);
            return cartRepository.save(newCart);
        });

        Product product = productRepository.findById(productId).orElseThrow(() -> new RuntimeException("Product not found"));

        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(productId) &&
                        java.util.Objects.equals(item.getSelectedSize(), size) &&
                        java.util.Objects.equals(item.getSelectedColor(), color))
                .findFirst();

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + quantity);
        } else {
            CartItem newItem = new CartItem();
            newItem.setCart(cart);
            newItem.setProduct(product);
            newItem.setQuantity(quantity);
            newItem.setSelectedSize(size);
            newItem.setSelectedColor(color);
            cart.getItems().add(newItem);
        }

        return ResponseEntity.ok(cartRepository.save(cart));
    }

    @DeleteMapping("/remove/{itemId}")
    public ResponseEntity<?> removeFromCart(@PathVariable Long itemId) {
        User user = getCurrentUser();
        Cart cart = cartRepository.findByUser(user).orElseThrow(() -> new RuntimeException("Cart not found"));

        cart.getItems().removeIf(item -> item.getId().equals(itemId));
        return ResponseEntity.ok(cartRepository.save(cart));
    }
    
    @PutMapping("/update/{itemId}")
    public ResponseEntity<?> updateCartQuantity(@PathVariable Long itemId, @RequestParam Integer quantity) {
        User user = getCurrentUser();
        Cart cart = cartRepository.findByUser(user).orElseThrow(() -> new RuntimeException("Cart not found"));

        if (quantity <= 0) {
            cart.getItems().removeIf(item -> item.getId().equals(itemId));
        } else {
            cart.getItems().stream()
                .filter(item -> item.getId().equals(itemId))
                .findFirst()
                .ifPresent(item -> item.setQuantity(quantity));
        }
        
        return ResponseEntity.ok(cartRepository.save(cart));
    }
}
