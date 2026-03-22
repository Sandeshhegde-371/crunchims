package com.example.Inventory.service;

import com.example.Inventory.dto.AddStockRequest;
import com.example.Inventory.dto.CreateProductRequest;
import com.example.Inventory.dto.ProductResponse;
import com.example.Inventory.model.Product;

import java.util.List;

public interface ProductService {

    Product addStock(AddStockRequest request, String employeeEmail);

    List<ProductResponse> getAllProducts();

    Product createProduct(CreateProductRequest request, String employeeEmail);

    Product reduceStock(AddStockRequest request, String employeeEmail);

    void deleteProduct(Long productId, String employeeEmail);
}