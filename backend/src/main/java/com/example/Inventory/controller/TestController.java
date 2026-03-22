package com.example.Inventory.controller;

import com.example.Inventory.model.Account;
import com.example.Inventory.service.AccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import com.example.Inventory.security.JwtService;
import java.util.Optional;

@RestController
@RequestMapping("/test")
@RequiredArgsConstructor
public class TestController {

    private final AccountService accountService;
    private final JwtService jwtService;
    @GetMapping("/admin")
    public Optional<Account> getAdmin() {
        return accountService.findByEmail("admin@inventory.com");
    }
    @GetMapping("/token")
    public String generateToken() {
        return jwtService.generateToken("admin@inventory.com");
    }
    @GetMapping("/secure")

    public String secureEndpoint() {
        return "JWT authentication working";
    }
}