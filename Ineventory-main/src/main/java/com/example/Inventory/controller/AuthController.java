package com.example.Inventory.controller;

import com.example.Inventory.dto.AuthResponse;
import com.example.Inventory.dto.LoginRequest;
import com.example.Inventory.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        String token = jwtService.generateToken(request.getEmail());

        return new AuthResponse(token);
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