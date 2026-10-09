package com.fashionhouse.shop.dto;

import com.fashionhouse.shop.entity.OrderStatus;
import lombok.Data;

@Data
public class OrderStatusUpdateRequest {
    private OrderStatus status;
    private String estimatedDeliveryDate;
}
