package com.example.Inventory.dto;

import lombok.Data;

@Data
public class OrderItemRequest {

    private String productName;
    private int quantity;

}