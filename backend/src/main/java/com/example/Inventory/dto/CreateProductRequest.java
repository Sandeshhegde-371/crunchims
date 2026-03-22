package com.example.Inventory.dto;

import lombok.Data;

@Data
public class CreateProductRequest {

    private String name;
    private String description;
    private double price;
    private int quantity;
    private String category;

}