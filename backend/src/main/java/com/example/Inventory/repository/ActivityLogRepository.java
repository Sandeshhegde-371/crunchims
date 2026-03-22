package com.example.Inventory.repository;

import com.example.Inventory.model.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {

    // 📜 Get all logs sorted (latest first)
    List<ActivityLog> findAllByOrderByCreatedAtDesc();

}