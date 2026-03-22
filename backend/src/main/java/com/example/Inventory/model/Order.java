package com.example.Inventory.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    @Id
    @GeneratedValue
    private UUID id;

    private BigDecimal totalAmount;

    private LocalDateTime createdAt;

    // 👤 Customer
    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Account customer;

    // 📦 Order Items (VERY IMPORTANT)
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<OrderItem> items;
}