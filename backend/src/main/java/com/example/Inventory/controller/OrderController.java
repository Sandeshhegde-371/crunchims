package com.example.Inventory.controller;

import com.example.Inventory.dto.CreateOrderRequest;
import com.example.Inventory.model.Order;
import com.example.Inventory.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/order")
    public Order createOrder(
            @RequestBody CreateOrderRequest request,
            Authentication authentication
    ) {

        String customerEmail = authentication.getName();

        return orderService.createOrder(request, customerEmail);
    }
}