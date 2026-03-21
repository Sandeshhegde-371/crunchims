package com.example.Inventory.service;

import com.example.Inventory.dto.CreateOrderRequest;
import com.example.Inventory.model.Order;

import java.util.List;

public interface OrderService {

    // ✅ existing
    Order createOrder(CreateOrderRequest request, String customerEmail);

    // ✅ NEW - get user orders
    List<Order> getOrdersByCustomer(String email);

    // ✅ NEW - return item
    void returnItem(Long orderItemId, String userEmail);
}