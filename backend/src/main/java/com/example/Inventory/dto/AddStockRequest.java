package com.example.Inventory.dto;

import lombok.Data;

@Data
public class AddStockRequest {

    private String productName;
    private int quantity;

}