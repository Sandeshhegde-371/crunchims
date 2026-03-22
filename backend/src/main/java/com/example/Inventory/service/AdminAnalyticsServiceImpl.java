package com.example.Inventory.service;

import com.example.Inventory.dto.AdminAnalyticsResponse;
import com.example.Inventory.dto.CategoryAnalyticsResponse;
import com.example.Inventory.model.Category;
import com.example.Inventory.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminAnalyticsServiceImpl implements AdminAnalyticsService {

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CategoryRepository categoryRepository;

    // ✅ OVERALL ANALYTICS
    @Override
    public AdminAnalyticsResponse getOverallAnalytics() {

        return new AdminAnalyticsResponse(
                productRepository.count(), // total products
                productRepository.countLowStockProducts(), // low stock
                orderItemRepository.getActualRevenue(), // ✅ FIXED revenue
                orderRepository.count(), // total orders
                orderItemRepository.getTotalUnitsSold() // units sold
        );
    }

    // ✅ CATEGORY ANALYTICS
    @Override
    public List<CategoryAnalyticsResponse> getCategoryAnalytics() {

        List<Category> categories = categoryRepository.findAll();

        return categories.stream().map(category -> {

            long totalProducts = productRepository.countByCategory(category.getId());
            long lowStock = productRepository.countLowStockByCategory(category.getId());
            long unitsSold = orderItemRepository.getUnitsSoldByCategory(category.getId());

            return new CategoryAnalyticsResponse(
                    category.getName(),
                    totalProducts,
                    lowStock,
                    BigDecimal.ZERO, // optional (can be improved later)
                    0, // optional (orders per category)
                    unitsSold
            );

        }).collect(Collectors.toList());
    }

    // ✅ DATE-BASED ANALYTICS (daily / weekly / monthly)
    @Override
    public AdminAnalyticsResponse getAnalyticsByDateRange(String type) {

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime start;

        switch (type.toLowerCase()) {
            case "daily":
                start = now.minusDays(1);
                break;
            case "weekly":
                start = now.minusWeeks(1);
                break;
            case "monthly":
                start = now.minusMonths(1);
                break;
            default:
                throw new RuntimeException("Invalid type");
        }

        return new AdminAnalyticsResponse(
                productRepository.count(),
                productRepository.countLowStockProducts(),
                orderItemRepository.getRevenueByDateRange(start, now), // ✅ FIXED
                orderRepository.countByDateRange(start, now),
                orderItemRepository.getUnitsSoldByDateRange(start, now)
        );
    }
}