package com.fashionhouse.shop.config;

import com.fashionhouse.shop.entity.Role;
import com.fashionhouse.shop.entity.User;
import com.fashionhouse.shop.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import com.fashionhouse.shop.repository.CategoryRepository;
import com.fashionhouse.shop.entity.Category;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (categoryRepository.count() == 0) {
            List<String> categories = Arrays.asList("Men's Clothing", "Women's Clothing", "Kids' Clothing", "Accessories", "Footwear");
            for (String catName : categories) {
                Category cat = new Category();
                cat.setName(catName);
                categoryRepository.save(cat);
            }
            System.out.println("Categories initialized successfully.");
        }

        User admin = userRepository.findByMobileNumber("8468874900").orElse(new User());
        admin.setName("Pranav Mahadik");
        admin.setMobileNumber("8468874900");
        admin.setEmail("admin@fashionhouse.com");
        admin.setPassword(passwordEncoder.encode("admin123")); // Default password
        admin.setRole(Role.ADMIN);
        admin.setAddress("Koparde, Maharashtra, India");
        userRepository.save(admin);
        System.out.println("Admin account initialized successfully.");
    }
}
