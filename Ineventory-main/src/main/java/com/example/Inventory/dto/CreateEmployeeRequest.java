package com.example.Inventory.dto;

import lombok.Data;

@Data
public class CreateEmployeeRequest {

    private String fullName;
    private String email;
    private String password;

}