package com.example.Inventory.controller;

import com.example.Inventory.dto.*;
import com.example.Inventory.model.ActivityLog;
import com.example.Inventory.model.Account;
import com.example.Inventory.model.Product;
import com.example.Inventory.repository.ActivityLogRepository;
import com.example.Inventory.service.AccountService;
import com.example.Inventory.service.AdminAnalyticsService;
import com.example.Inventory.service.ProductService;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AccountService accountService;
    private final AdminAnalyticsService analyticsService;
    private final ActivityLogRepository activityLogRepository;

    // ✅ NEW: Product Service (for inventory management)
    private final ProductService productService;

    // ================= EMPLOYEE MANAGEMENT =================

    // ✅ CREATE EMPLOYEE
    @PostMapping("/create-employee")
    public Account createEmployee(@RequestBody CreateEmployeeRequest request,
                                  Authentication authentication) {

        return accountService.createEmployee(request, authentication.getName());
    }

    // ✅ GET ALL EMPLOYEES
    @GetMapping("/employees")
    public List<Account> getAllEmployees() {
        return accountService.getAllEmployees();
    }

    // ✏️ UPDATE EMPLOYEE
    @PutMapping("/employee/{id}")
    public Account updateEmployee(@PathVariable String id,
                                  @RequestBody UpdateEmployeeRequest request,
                                  Authentication authentication) {

        return accountService.updateEmployee(id, request, authentication.getName());
    }

    // ❌ DELETE EMPLOYEE (SOFT DELETE)
    @DeleteMapping("/employee/{id}")
    public String deleteEmployee(@PathVariable String id,
                                 Authentication authentication) {

        accountService.deleteEmployee(id, authentication.getName());
        return "Employee deleted successfully";
    }

    // ================= INVENTORY MANAGEMENT =================

    // 📦 GET ALL PRODUCTS
    @GetMapping("/products")
    public List<ProductResponse> getProducts() {
        return productService.getAllProducts();
    }

    // ➕ ADD PRODUCT
    @PostMapping("/add-product")
    public Product addProduct(@RequestBody CreateProductRequest request,
                              Authentication authentication) {

        return productService.createProduct(request, authentication.getName());
    }

    // ➕ ADD STOCK
    @PostMapping("/add-stock")
    public Product addStock(@RequestBody AddStockRequest request,
                            Authentication authentication) {

        return productService.addStock(request, authentication.getName());
    }

    // ➖ REDUCE STOCK
    @PostMapping("/reduce-stock")
    public Product reduceStock(@RequestBody AddStockRequest request,
                               Authentication authentication) {

        return productService.reduceStock(request, authentication.getName());
    }

    // ❌ DELETE PRODUCT (SOFT DELETE)
    @DeleteMapping("/product/{id}")
    public String deleteProduct(@PathVariable Long id,
                                Authentication authentication) {

        productService.deleteProduct(id, authentication.getName());
        return "Product deleted successfully";
    }

    // ================= ANALYTICS =================

    // ✅ OVERALL ANALYTICS
    @GetMapping("/analytics")
    public AdminAnalyticsResponse getAnalytics() {
        return analyticsService.getOverallAnalytics();
    }

    // ✅ CATEGORY ANALYTICS
    @GetMapping("/analytics/category")
    public List<CategoryAnalyticsResponse> getCategoryAnalytics() {
        return analyticsService.getCategoryAnalytics();
    }

    // ✅ DAILY / WEEKLY / MONTHLY ANALYTICS
    @GetMapping("/analytics/{type}")
    public AdminAnalyticsResponse getAnalyticsByType(@PathVariable String type) {
        return analyticsService.getAnalyticsByDateRange(type);
    }

    // ================= ACTIVITY LOGS =================

    // ✅ ACTIVITY LOGS
    @GetMapping("/activity-logs")
    public List<ActivityLog> getLogs() {
        return activityLogRepository.findAllByOrderByCreatedAtDesc();
    }
}