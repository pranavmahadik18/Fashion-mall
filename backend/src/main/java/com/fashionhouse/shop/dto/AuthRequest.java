package com.fashionhouse.shop.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

@Data
public class AuthRequest {
    @NotBlank
    private String mobileNumber;
    
    @NotBlank
    private String password;
}
