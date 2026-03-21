package com.example.Inventory.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int quantity;

    private BigDecimal unitPrice;

    private String status; // ORDERED / RETURNED

    @ManyToOne
    @JoinColumn(name = "order_id")
    @JsonIgnore // ✅ prevents infinite loop
    private Order order;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;
}