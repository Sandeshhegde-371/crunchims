package com.example.Inventory.service;

import com.example.Inventory.dto.AddStockRequest;
import com.example.Inventory.dto.CreateProductRequest;
import com.example.Inventory.dto.ProductResponse;
import com.example.Inventory.model.ActivityLog;
import com.example.Inventory.model.Category;
import com.example.Inventory.model.Product;
import com.example.Inventory.repository.ActivityLogRepository;
import com.example.Inventory.repository.CategoryRepository;
import com.example.Inventory.repository.ProductRepository;
import com.example.Inventory.repository.AccountRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ActivityLogRepository activityLogRepository;
    private final CategoryRepository categoryRepository;
    private final AccountRepository accountRepository;
    private final EmailService emailService;

    // ✅ GET ALL PRODUCTS
    @Override
    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll()
                .stream()
                .map(p -> ProductResponse.builder()
                        .id(p.getId())
                        .name(p.getName())
                        .category(p.getCategory().getName())
                        .price(p.getPrice())
                        .quantity(p.getQuantity())
                        .build()
                )
                .collect(Collectors.toList());
    }

    // ✅ ADD NEW PRODUCT
    @Override
    public Product createProduct(CreateProductRequest request, String employeeEmail) {

        Category category = categoryRepository
                .findByName(request.getCategory().toUpperCase())
                .orElseThrow(() -> new RuntimeException("Invalid category"));

        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .quantity(request.getQuantity())
                .category(category)
                .createdAt(LocalDateTime.now())
                .build();

        Product saved = productRepository.save(product);

        activityLogRepository.save(ActivityLog.builder()
                .action("Employee added product: " + product.getName())
                .performedBy(employeeEmail)
                .createdAt(LocalDateTime.now())
                .build());

        // 🚨 LOW STOCK CHECK
        checkAndSendLowStockAlert(null, saved, employeeEmail);

        return saved;
    }

    // ✅ ADD STOCK
    @Override
    public Product addStock(AddStockRequest request, String employeeEmail) {

        Product product = productRepository
                .findByName(request.getProductName())
                .orElseThrow(() -> new RuntimeException("Invalid product"));

        int oldQuantity = product.getQuantity();

        product.setQuantity(product.getQuantity() + request.getQuantity());

        Product saved = productRepository.save(product);

        activityLogRepository.save(ActivityLog.builder()
                .action("Stock added for " + product.getName())
                .performedBy(employeeEmail)
                .createdAt(LocalDateTime.now())
                .build());

        // 🚨 LOW STOCK CHECK
        checkAndSendLowStockAlert(oldQuantity, saved, employeeEmail);

        return saved;
    }

    // ✅ REDUCE STOCK
    @Override
    public Product reduceStock(AddStockRequest request, String employeeEmail) {

        Product product = productRepository
                .findByName(request.getProductName())
                .orElseThrow(() -> new RuntimeException("Invalid product"));

        if (product.getQuantity() < request.getQuantity()) {
            throw new RuntimeException("Not enough stock");
        }

        int oldQuantity = product.getQuantity();

        product.setQuantity(product.getQuantity() - request.getQuantity());

        Product saved = productRepository.save(product);

        activityLogRepository.save(ActivityLog.builder()
                .action("Stock reduced for " + product.getName())
                .performedBy(employeeEmail)
                .createdAt(LocalDateTime.now())
                .build());

        // 🚨 LOW STOCK CHECK
        checkAndSendLowStockAlert(oldQuantity, saved, employeeEmail);

        return saved;
    }

    // 🚨 LOW STOCK ALERT (SMART VERSION)
    private void checkAndSendLowStockAlert(Integer oldQty, Product product, String employeeEmail) {

        int newQty = product.getQuantity();

        // ✅ Trigger ONLY when crossing threshold (>=4 → <4)
        if ((oldQty == null || oldQty >= 4) && newQty < 4) {

            List<String> emails = accountRepository.findAllEmployeeAndAdminEmails();

            for (String email : emails) {

                emailService.sendMail(
                        email,
                        "⚠ Low Stock Alert",
                        "Product: " + product.getName() +
                                "\nRemaining Quantity: " + newQty +
                                "\nUpdated By: " + employeeEmail +
                                "\nTime: " + LocalDateTime.now()
                );
            }
        }
    }
}