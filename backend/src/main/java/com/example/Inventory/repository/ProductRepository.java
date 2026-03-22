package com.example.Inventory.repository;

import com.example.Inventory.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    // 🔍 Find product by name
    Optional<Product> findByName(String name);

    // 📦 Total products (already available via count(), no need to override)

    // ⚠️ Low stock products (< 4)
    @Query("SELECT COUNT(p) FROM Product p WHERE p.quantity < 4")
    long countLowStockProducts();

    // 📂 Total products per category
    @Query("SELECT COUNT(p) FROM Product p WHERE p.category.id = :categoryId")
    long countByCategory(@Param("categoryId") Long categoryId);

    // ⚠️ Low stock per category
    @Query("SELECT COUNT(p) FROM Product p WHERE p.category.id = :categoryId AND p.quantity < 4")
    long countLowStockByCategory(@Param("categoryId") Long categoryId);

    @Query("SELECT p FROM Product p WHERE p.isActive = true")
    List<Product> findAllActiveProducts();

}