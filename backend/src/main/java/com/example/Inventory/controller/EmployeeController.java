package com.example.Inventory.controller;

import com.example.Inventory.dto.AddStockRequest;
import com.example.Inventory.dto.CreateProductRequest;
import com.example.Inventory.dto.ProductResponse;
import com.example.Inventory.model.Product;
import com.example.Inventory.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/employee")
@RequiredArgsConstructor
public class EmployeeController {

    private final ProductService productService;

    // ✅ GET ALL PRODUCTS
    @GetMapping("/products")
    public List<ProductResponse> getProducts() {
        return productService.getAllProducts();
    }

    // ✅ ADD STOCK
    @PostMapping("/add-stock")
    public Product addStock(@RequestBody AddStockRequest request,
                            Authentication authentication) {

        return productService.addStock(request, authentication.getName());
    }

    // ✅ REDUCE STOCK
    @PostMapping("/reduce-stock")
    public Product reduceStock(@RequestBody AddStockRequest request,
                               Authentication authentication) {

        return productService.reduceStock(request, authentication.getName());
    }

    // ✅ ADD PRODUCT
    @PostMapping("/add-product")
    public Product addProduct(@RequestBody CreateProductRequest request,
                              Authentication authentication) {

        return productService.createProduct(request, authentication.getName());
    }
    @DeleteMapping("/product/{id}")
    public String deleteProduct(@PathVariable Long id,
                                Authentication authentication) {

        productService.deleteProduct(id, authentication.getName());
        return "Product deleted successfully";
    }
}