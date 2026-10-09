package com.fashionhouse.shop.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

@Data
public class OrderRequest {
    @NotBlank
    private String paymentMethod;
    private String upiTransactionId;
}
