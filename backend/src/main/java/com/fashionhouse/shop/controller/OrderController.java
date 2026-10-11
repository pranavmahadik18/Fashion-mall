package com.fashionhouse.shop.controller;

import com.fashionhouse.shop.dto.OrderStatusUpdateRequest;
import com.fashionhouse.shop.entity.Cart;
import com.fashionhouse.shop.entity.CustomerOrder;
import com.fashionhouse.shop.entity.OrderItem;
import com.fashionhouse.shop.entity.OrderStatus;
import com.fashionhouse.shop.entity.OrderStatusHistory;
import com.fashionhouse.shop.entity.User;
import com.fashionhouse.shop.repository.CartRepository;
import com.fashionhouse.shop.repository.OrderRepository;
import com.fashionhouse.shop.repository.OrderStatusHistoryRepository;
import com.fashionhouse.shop.repository.UserRepository;
import com.fashionhouse.shop.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;


@RestController
@RequestMapping("/api")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private OrderStatusHistoryRepository historyRepository;

    private User getCurrentUser() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userRepository.findById(userDetails.getId()).orElseThrow(() -> new RuntimeException("User not found"));
    }

    // Customer places an order
    @PostMapping("/orders")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<?> placeOrder(@RequestBody com.fashionhouse.shop.dto.OrderRequest request) {
        User user = getCurrentUser();
        Optional<Cart> optionalCart = cartRepository.findByUser(user);

        if (!optionalCart.isPresent() || optionalCart.get().getItems().isEmpty()) {
            return ResponseEntity.badRequest().body("Cart is empty");
        }

        Cart cart = optionalCart.get();

        CustomerOrder order = new CustomerOrder();
        order.setUser(user);
        order.setCustomerName(user.getName());
        order.setCustomerMobile(user.getMobileNumber());
        order.setCustomerAddress(user.getAddress());
        order.setOrderDate(LocalDateTime.now());
        order.setStatus(OrderStatus.PENDING);
        
        order.setPaymentMethod(request.getPaymentMethod());
        order.setPaymentStatus("PENDING");
        order.setUpiTransactionId(request.getUpiTransactionId());
        order.setEstimatedDeliveryDate("To be updated by Admin");

        BigDecimal total = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (var cartItem : cart.getItems()) {
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(cartItem.getProduct());
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPrice(cartItem.getProduct().getPrice());
            orderItem.setSelectedSize(cartItem.getSelectedSize());
            orderItem.setSelectedColor(cartItem.getSelectedColor());
            
            total = total.add(orderItem.getPrice().multiply(new BigDecimal(orderItem.getQuantity())));
            orderItems.add(orderItem);
        }

        order.setItems(orderItems);
        order.setTotalAmount(total);

        orderRepository.save(order);

        OrderStatusHistory history = new OrderStatusHistory();
        history.setOrder(order);
        history.setStatus(OrderStatus.PENDING);
        history.setTimestamp(LocalDateTime.now());
        history.setMessage("Your order has been placed.");
        historyRepository.save(history);

        // Clear cart
        cart.getItems().clear();
        cartRepository.save(cart);

        return ResponseEntity.ok(order);
    }

    // Customer views their own orders
    @GetMapping("/orders/my")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<List<CustomerOrder>> getMyOrders() {
        User user = getCurrentUser();
        List<CustomerOrder> orders = orderRepository.findByUserOrderByOrderDateDesc(user);
        return ResponseEntity.ok(orders);
    }

    // Admin views all orders
    @GetMapping("/admin/orders")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CustomerOrder>> getAllOrders() {
        return ResponseEntity.ok(orderRepository.findAllByOrderByOrderDateDesc());
    }
    
    // Admin updates order status
    @PutMapping("/admin/orders/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id, @RequestBody OrderStatusUpdateRequest request) {
        Optional<CustomerOrder> optionalOrder = orderRepository.findById(id);
        if (!optionalOrder.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        
        CustomerOrder order = optionalOrder.get();
        order.setStatus(request.getStatus());
        if (request.getEstimatedDeliveryDate() != null) {
            order.setEstimatedDeliveryDate(request.getEstimatedDeliveryDate());
        }
        orderRepository.save(order);

        OrderStatusHistory history = new OrderStatusHistory();
        history.setOrder(order);
        history.setStatus(request.getStatus());
        history.setTimestamp(LocalDateTime.now());
        history.setMessage("Order status updated to " + request.getStatus());
        historyRepository.save(history);

        return ResponseEntity.ok(order);
    }
    
    // Admin views customers
    @GetMapping("/admin/customers")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getCustomers() {
        List<User> customers = userRepository.findAll().stream()
                .filter(u -> u.getRole() == com.fashionhouse.shop.entity.Role.CUSTOMER)
                .collect(Collectors.toList());
        return ResponseEntity.ok(customers);
    }
}
