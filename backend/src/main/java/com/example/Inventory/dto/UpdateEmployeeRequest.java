package com.example.Inventory.dto;

import lombok.Data;

@Data
public class UpdateEmployeeRequest {

    private String fullName;
    private String email;
    private String password; // optional
}