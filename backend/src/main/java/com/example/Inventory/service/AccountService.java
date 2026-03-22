package com.example.Inventory.service;

import com.example.Inventory.dto.CreateEmployeeRequest;
import com.example.Inventory.model.Account;
import com.example.Inventory.dto.UpdateEmployeeRequest;
import java.util.List;
import java.util.Optional;

public interface AccountService {

    Optional<Account> findByEmail(String email);

    Account save(Account account);

    Account createEmployee(CreateEmployeeRequest request, String adminEmail);

    // 👥 NEW METHOD (for admin)
    List<Account> getAllEmployees();

    // ✏️ UPDATE EMPLOYEE
    // ✏️ UPDATE EMPLOYEE
    Account updateEmployee(String employeeId, UpdateEmployeeRequest request, String adminEmail);

    // ❌ DELETE EMPLOYEE
    void deleteEmployee(String employeeId, String adminEmail);
}