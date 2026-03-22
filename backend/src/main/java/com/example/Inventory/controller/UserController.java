package com.example.Inventory.controller;

import com.example.Inventory.dto.UserSignupRequest;
import com.example.Inventory.dto.CreateOrderRequest;
import com.example.Inventory.model.Account;
import com.example.Inventory.model.Order;
import com.example.Inventory.service.AccountService;
import com.example.Inventory.service.OrderService;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {

    private final AccountService accountService;
    private final OrderService orderService;
    private final PasswordEncoder passwordEncoder;

    // ✅ SIGNUP (NO JWT REQUIRED)
    @PostMapping("/signup")
    public Account signup(@RequestBody UserSignupRequest request) {

        Account account = Account.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role("CUSTOMER")
                .createdAt(LocalDateTime.now())
                .build();

        return accountService.save(account);
    }

    // ✅ GET USER ORDERS (JWT BASED)
    @GetMapping("/orders")
    public List<Order> getMyOrders(Authentication authentication) {

        String email = authentication.getName(); // ✅ from JWT
        return orderService.getOrdersByCustomer(email);
    }

    // ✅ CREATE ORDER (JWT BASED)
    @PostMapping("/orders")
    public Order createOrder(
            @RequestBody CreateOrderRequest request,
            Authentication authentication) {

        String email = authentication.getName(); // ✅ secure
        return orderService.createOrder(request, email);
    }

    // ✅ RETURN ITEM (JWT BASED)
    @PostMapping("/return/{orderItemId}")
    public String returnItem(
            @PathVariable Long orderItemId,
            Authentication authentication) {

        String email = authentication.getName(); // ✅ secure
        orderService.returnItem(orderItemId, email);

        return "Item returned successfully";
    }
}