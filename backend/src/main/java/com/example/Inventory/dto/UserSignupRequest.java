package com.example.Inventory.dto;

import lombok.Data;

@Data
public class UserSignupRequest {

    private String fullName;
    private String email;
    private String password;

}