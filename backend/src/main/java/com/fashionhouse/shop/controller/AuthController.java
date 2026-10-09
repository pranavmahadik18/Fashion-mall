package com.fashionhouse.shop.controller;

import com.fashionhouse.shop.dto.AuthRequest;
import com.fashionhouse.shop.dto.AuthResponse;
import com.fashionhouse.shop.dto.RegisterRequest;
import com.fashionhouse.shop.entity.Role;
import com.fashionhouse.shop.entity.User;
import com.fashionhouse.shop.repository.UserRepository;
import com.fashionhouse.shop.security.JwtUtils;
import com.fashionhouse.shop.security.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody AuthRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getMobileNumber(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);
        
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();    
        User user = userRepository.findById(userDetails.getId()).get();

        return ResponseEntity.ok(new AuthResponse(jwt, userDetails.getId(), user.getName(), user.getRole()));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest signUpRequest) {
        if (userRepository.findByMobileNumber(signUpRequest.getMobileNumber()).isPresent()) {
            return ResponseEntity.badRequest().body("Error: Mobile number is already in use!");
        }

        User user = new User();
        user.setName(signUpRequest.getName());
        user.setMobileNumber(signUpRequest.getMobileNumber());
        user.setEmail(signUpRequest.getEmail());
        user.setPassword(encoder.encode(signUpRequest.getPassword()));
        user.setRole(Role.CUSTOMER);
        user.setAddress(signUpRequest.getAddress());

        userRepository.save(user);

        return ResponseEntity.ok("User registered successfully!");
    }
}
