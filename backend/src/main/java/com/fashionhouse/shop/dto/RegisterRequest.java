package com.fashionhouse.shop.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Data
public class RegisterRequest {
    @NotBlank
    private String name;
    
    @NotBlank
    @Size(min = 10, max = 15)
    private String mobileNumber;
    
    private String email;
    
    @NotBlank
    @Size(min = 6)
    private String password;
    
    private String address;
}
