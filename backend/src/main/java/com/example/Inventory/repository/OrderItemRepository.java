package com.example.Inventory.repository;

import com.example.Inventory.model.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    // ✅ Total units sold (ONLY ORDERED)
    @Query("SELECT COALESCE(SUM(oi.quantity), 0) FROM OrderItem oi WHERE oi.status = 'ORDERED'")
    long getTotalUnitsSold();

    // ✅ Category-wise units sold
    @Query("""
        SELECT COALESCE(SUM(oi.quantity), 0)
        FROM OrderItem oi
        WHERE oi.product.category.id = :categoryId
        AND oi.status = 'ORDERED'
    """)
    long getUnitsSoldByCategory(@Param("categoryId") Long categoryId);

    // 💰 ✅ NEW: Category-wise revenue
    @Query("""
        SELECT COALESCE(SUM(oi.unitPrice * oi.quantity), 0)
        FROM OrderItem oi
        WHERE oi.product.category.id = :categoryId
        AND oi.status = 'ORDERED'
    """)
    BigDecimal getRevenueByCategory(@Param("categoryId") Long categoryId);

    // ✅ Units sold in date range
    @Query("""
        SELECT COALESCE(SUM(oi.quantity), 0)
        FROM OrderItem oi
        WHERE oi.status = 'ORDERED'
        AND oi.order.createdAt BETWEEN :start AND :end
    """)
    long getUnitsSoldByDateRange(@Param("start") LocalDateTime start,
                                 @Param("end") LocalDateTime end);

    // 💰 REAL REVENUE
    @Query("""
        SELECT COALESCE(SUM(oi.unitPrice * oi.quantity), 0)
        FROM OrderItem oi
        WHERE oi.status = 'ORDERED'
    """)
    BigDecimal getActualRevenue();

    // 💰 Revenue by date
    @Query("""
        SELECT COALESCE(SUM(oi.unitPrice * oi.quantity), 0)
        FROM OrderItem oi
        WHERE oi.status = 'ORDERED'
        AND oi.order.createdAt BETWEEN :start AND :end
    """)
    BigDecimal getRevenueByDateRange(@Param("start") LocalDateTime start,
                                     @Param("end") LocalDateTime end);
}