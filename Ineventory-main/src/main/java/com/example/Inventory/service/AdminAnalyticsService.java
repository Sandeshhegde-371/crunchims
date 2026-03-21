package com.example.Inventory.service;

import com.example.Inventory.dto.AdminAnalyticsResponse;
import com.example.Inventory.dto.CategoryAnalyticsResponse;

import java.util.List;

public interface AdminAnalyticsService {

    AdminAnalyticsResponse getOverallAnalytics();

    List<CategoryAnalyticsResponse> getCategoryAnalytics();

    AdminAnalyticsResponse getAnalyticsByDateRange(String type);

}