package com.example.Inventory.service;

import com.example.Inventory.dto.CreateOrderRequest;
import com.example.Inventory.dto.OrderItemRequest;
import com.example.Inventory.model.*;
import com.example.Inventory.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final AccountRepository accountRepository;
    private final ActivityLogRepository activityLogRepository;
    private final EmailService emailService; // ✅ NEW

    // ✅ CREATE ORDER
    @Override
    public Order createOrder(CreateOrderRequest request, String customerEmail) {

        Account customer = accountRepository
                .findByEmail(customerEmail)
                .orElseThrow();

        Order order = Order.builder()
                .customer(customer)
                .createdAt(LocalDateTime.now())
                .totalAmount(BigDecimal.ZERO)
                .build();

        order = orderRepository.save(order);

        BigDecimal total = BigDecimal.ZERO;

        StringBuilder mailBody = new StringBuilder();
        mailBody.append("Order Details:\n\n");

        for (OrderItemRequest itemRequest : request.getItems()) {

            Product product = productRepository
                    .findByName(itemRequest.getProductName())
                    .orElseThrow();

            if (product.getQuantity() < itemRequest.getQuantity()) {
                throw new RuntimeException("Not enough stock");
            }

            // 🔻 reduce stock
            product.setQuantity(product.getQuantity() - itemRequest.getQuantity());
            productRepository.save(product);

            BigDecimal price = BigDecimal.valueOf(product.getPrice());

            OrderItem item = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(itemRequest.getQuantity())
                    .unitPrice(price)
                    .status("ORDERED")
                    .build();

            orderItemRepository.save(item);

            // 📩 Build email content
            mailBody.append("Product: ").append(product.getName())
                    .append("\nQuantity: ").append(itemRequest.getQuantity())
                    .append("\n\n");

            total = total.add(
                    price.multiply(BigDecimal.valueOf(itemRequest.getQuantity()))
            );
        }

        order.setTotalAmount(total);
        orderRepository.save(order);

        // 📩 Add total to mail
        mailBody.append("Total Amount: ").append(total);

        // 📧 SEND EMAIL
        emailService.sendMail(
                customerEmail,
                "Order Confirmation",
                mailBody.toString()
        );

        // 📝 Activity log
        ActivityLog log = ActivityLog.builder()
                .action("CUSTOMER_PURCHASE")
                .performedBy(customerEmail)
                .createdAt(LocalDateTime.now())
                .build();

        activityLogRepository.save(log);

        return order;
    }

    // ✅ GET USER ORDERS
    @Override
    public List<Order> getOrdersByCustomer(String email) {
        return orderRepository.findByCustomerEmail(email);
    }

    // ✅ RETURN ITEM
    @Override
    public void returnItem(Long orderItemId, String userEmail) {

        OrderItem item = orderItemRepository.findById(orderItemId)
                .orElseThrow(() -> new RuntimeException("Order item not found"));

        // ❌ prevent double return
        if ("RETURNED".equals(item.getStatus())) {
            throw new RuntimeException("Item already returned");
        }

        Product product = item.getProduct();

        // 🔄 increase stock
        product.setQuantity(product.getQuantity() + item.getQuantity());
        productRepository.save(product);

        // 🔁 mark as returned
        item.setStatus("RETURNED");
        orderItemRepository.save(item);

        // 📧 SEND RETURN EMAIL
        emailService.sendMail(
                userEmail,
                "Return Successful",
                "Returned Product: " + product.getName() +
                        "\nQuantity: " + item.getQuantity()
        );

        // 📝 log activity
        ActivityLog log = ActivityLog.builder()
                .action("RETURNED product: " + product.getName())
                .performedBy(userEmail)
                .createdAt(LocalDateTime.now())
                .build();

        activityLogRepository.save(log);
    }
}