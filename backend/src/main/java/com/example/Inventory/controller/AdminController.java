package com.example.Inventory.controller;

import com.example.Inventory.dto.*;
import com.example.Inventory.model.ActivityLog;
import com.example.Inventory.service.AccountService;
import com.example.Inventory.service.AdminAnalyticsService;
import com.example.Inventory.repository.ActivityLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import com.example.Inventory.model.Account;

import java.util.List;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AccountService accountService;
    private final AdminAnalyticsService analyticsService;
    private final ActivityLogRepository activityLogRepository;

    @PostMapping("/create-employee")
    public Object createEmployee(@RequestBody CreateEmployeeRequest request) {
        return accountService.createEmployee(request, "admin@inventory.com");
    }

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

    // ✅ DAILY / WEEKLY / MONTHLY
    @GetMapping("/analytics/{type}")
    public AdminAnalyticsResponse getAnalyticsByType(@PathVariable String type) {
        return analyticsService.getAnalyticsByDateRange(type);
    }

    @GetMapping("/employees")
    public List<Account> getAllEmployees() {
        return accountService.getAllEmployees();
    }
    // ✅ ACTIVITY LOGS
    @GetMapping("/activity-logs")
    public List<ActivityLog> getLogs() {
        return activityLogRepository.findAllByOrderByCreatedAtDesc();
    }
}