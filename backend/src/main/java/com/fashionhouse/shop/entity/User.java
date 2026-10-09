package com.fashionhouse.shop.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    
    @Column(unique = true)
    private String mobileNumber;
    
    private String email;
    private String password;
    
    // Address fields
    private String address; // Kept for backward compatibility
    private String house;
    private String street;
    private String city;
    private String district;
    private String state;
    private String pinCode;

    @Enumerated(EnumType.STRING)
    private Role role;
}
