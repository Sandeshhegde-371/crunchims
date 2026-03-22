package com.example.Inventory.repository;

import com.example.Inventory.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<Order, UUID> {

    // ✅ Orders by user
    @Query("SELECT o FROM Order o WHERE o.customer.email = :email ORDER BY o.createdAt DESC")
    List<Order> findByCustomerEmail(@Param("email") String email);

    // ✅ Orders count (date)
    @Query("SELECT COUNT(o) FROM Order o WHERE o.createdAt BETWEEN :start AND :end")
    long countByDateRange(@Param("start") LocalDateTime start,
                          @Param("end") LocalDateTime end);

}