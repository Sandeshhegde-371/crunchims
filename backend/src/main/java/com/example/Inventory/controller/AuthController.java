package com.example.Inventory.controller;

import com.example.Inventory.dto.AuthResponse;
import com.example.Inventory.dto.LoginRequest;
import com.example.Inventory.model.Account;
import com.example.Inventory.security.JwtService;
import com.example.Inventory.service.AccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final AccountService accountService;

    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        Account account = accountService.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = jwtService.generateToken(request.getEmail());

        return new AuthResponse(token, account.getEmail(), account.getRole());
    }

    @GetMapping("/test-login")
    public String testLogin() {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        "admin@inventory.com",
                        "password"
                )
        );

        return jwtService.generateToken("admin@inventory.com");
    }
}