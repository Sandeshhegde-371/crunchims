package com.example.Inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class CategoryAnalyticsResponse {

    private String categoryName;
    private long totalProducts;
    private long lowStockProducts;
    private BigDecimal totalRevenue;
    private long totalOrders;
    private long totalUnitsSold;

}