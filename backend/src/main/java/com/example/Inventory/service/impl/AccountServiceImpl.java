package com.example.Inventory.service.impl;

import com.example.Inventory.dto.CreateEmployeeRequest;
import com.example.Inventory.dto.UpdateEmployeeRequest;
import com.example.Inventory.model.Account;
import com.example.Inventory.model.ActivityLog;
import com.example.Inventory.repository.AccountRepository;
import com.example.Inventory.repository.ActivityLogRepository;

import com.example.Inventory.service.AccountService;
import lombok.RequiredArgsConstructor;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AccountServiceImpl implements AccountService {

    private final AccountRepository accountRepository;
    private final ActivityLogRepository activityLogRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public Optional<Account> findByEmail(String email) {
        return accountRepository.findByEmail(email);
    }

    @Override
    public Account save(Account account) {
        return accountRepository.save(account);
    }

    // ✅ CREATE EMPLOYEE
    @Override
    public Account createEmployee(CreateEmployeeRequest request, String adminEmail) {

        Account employee = Account.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role("EMPLOYEE")
                .createdAt(LocalDateTime.now())
                .build();

        Account savedEmployee = accountRepository.save(employee);

        ActivityLog log = ActivityLog.builder()
                .action("Created employee: " + request.getEmail())
                .performedBy(adminEmail)
                .createdAt(LocalDateTime.now())
                .build();

        activityLogRepository.save(log);

        return savedEmployee;
    }

    // 👥 GET ALL EMPLOYEES
    @Override
    public List<Account> getAllEmployees() {
        return accountRepository.findAllEmployees();
    }

    // ✏️ UPDATE EMPLOYEE
    @Override
    public Account updateEmployee(String employeeId, UpdateEmployeeRequest request, String adminEmail) {

        Account employee = accountRepository.findById(UUID.fromString(employeeId))
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        if (!"EMPLOYEE".equals(employee.getRole())) {
            throw new RuntimeException("Only employees can be updated");
        }

        // update fields
        if (request.getFullName() != null) {
            employee.setFullName(request.getFullName());
        }

        if (request.getEmail() != null) {
            employee.setEmail(request.getEmail());
        }

        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            employee.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }

        Account updatedEmployee = accountRepository.save(employee);

        // 📝 log
        ActivityLog log = ActivityLog.builder()
                .action("Updated employee: " + employee.getEmail())
                .performedBy(adminEmail)
                .createdAt(LocalDateTime.now())
                .build();

        activityLogRepository.save(log);

        return updatedEmployee;
    }

    // ❌ DELETE EMPLOYEE
    @Override
    public void deleteEmployee(String employeeId, String adminEmail) {

        Account employee = accountRepository.findById(UUID.fromString(employeeId))
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        if (!"EMPLOYEE".equals(employee.getRole())) {
            throw new RuntimeException("Only employees can be deleted");
        }

        // ✅ SOFT DELETE
        employee.setIsActive(false);
        accountRepository.save(employee);

        ActivityLog log = ActivityLog.builder()
                .action("Deactivated employee: " + employee.getEmail())
                .performedBy(adminEmail)
                .createdAt(LocalDateTime.now())
                .build();

        activityLogRepository.save(log);
    }
}