package com.example.Inventory.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProductResponse {

    private Long id;
    private String name;
    private String category;
    private double price;
    private int quantity;
}