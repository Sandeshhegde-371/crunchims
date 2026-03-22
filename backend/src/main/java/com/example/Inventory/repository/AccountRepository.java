package com.example.Inventory.repository;

import com.example.Inventory.model.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AccountRepository extends JpaRepository<Account, UUID> {

    // 🔍 Find by email (existing)
    Optional<Account> findByEmail(String email);

    // 👥 Get all employees
    @Query("SELECT a FROM Account a WHERE a.role = 'EMPLOYEE'")
    List<Account> findAllEmployees();

    // 👥 Count employees (used in analytics)
    @Query("SELECT COUNT(a) FROM Account a WHERE a.role = 'EMPLOYEE'")
    long countEmployees();

    @Query("SELECT a.email FROM Account a WHERE a.role IN ('EMPLOYEE','ADMIN')")
    List<String> findAllEmployeeAndAdminEmails();
}