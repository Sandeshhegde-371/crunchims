package com.example.Inventory.service;

import com.example.Inventory.dto.CreateEmployeeRequest;
import com.example.Inventory.model.Account;
import com.example.Inventory.model.ActivityLog;
import com.example.Inventory.repository.AccountRepository;
import com.example.Inventory.repository.ActivityLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

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

    // 👥 NEW METHOD (for admin endpoint)
    @Override
    public List<Account> getAllEmployees() {
        return accountRepository.findAllEmployees();
    }
}