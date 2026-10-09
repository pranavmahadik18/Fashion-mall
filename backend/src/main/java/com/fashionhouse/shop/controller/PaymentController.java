package com.fashionhouse.shop.controller;

import com.fashionhouse.shop.entity.CustomerOrder;
import com.fashionhouse.shop.entity.OrderStatus;
import com.fashionhouse.shop.entity.OrderStatusHistory;
import com.fashionhouse.shop.repository.OrderRepository;
import com.fashionhouse.shop.repository.OrderStatusHistoryRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Value("${razorpay.key_id}")
    private String keyId;

    @Value("${razorpay.key_secret}")
    private String keySecret;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderStatusHistoryRepository historyRepository;

    @PostMapping("/create-order")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<?> createRazorpayOrder(@RequestBody Map<String, Object> data) {
        try {
            Long orderId = Long.valueOf(data.get("orderId").toString());
            Optional<CustomerOrder> optionalOrder = orderRepository.findById(orderId);
            
            if (optionalOrder.isEmpty()) {
                return ResponseEntity.badRequest().body("Order not found");
            }

            CustomerOrder order = optionalOrder.get();
            
            // Convert to paise
            int amount = order.getTotalAmount().multiply(new BigDecimal(100)).intValue();

            RazorpayClient client = new RazorpayClient(keyId, keySecret);

            JSONObject ob = new JSONObject();
            ob.put("amount", amount);
            ob.put("currency", "INR");
            ob.put("receipt", "txn_" + orderId);

            Order razorpayOrder = client.orders.create(ob);

            order.setRazorpayOrderId(razorpayOrder.get("id"));
            orderRepository.save(order);

            return ResponseEntity.ok(razorpayOrder.toString());

        } catch (RazorpayException e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error creating Razorpay Order: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Server error");
        }
    }

    @PostMapping("/verify")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<?> verifyPayment(@RequestBody Map<String, Object> data) {
        try {
            String razorpayOrderId = data.get("razorpay_order_id").toString();
            String razorpayPaymentId = data.get("razorpay_payment_id").toString();
            String razorpaySignature = data.get("razorpay_signature").toString();

            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", razorpayOrderId);
            options.put("razorpay_payment_id", razorpayPaymentId);
            options.put("razorpay_signature", razorpaySignature);

            boolean isValid = Utils.verifyPaymentSignature(options, keySecret);

            if (isValid) {
                // Find order
                CustomerOrder order = orderRepository.findAll().stream()
                        .filter(o -> razorpayOrderId.equals(o.getRazorpayOrderId()))
                        .findFirst()
                        .orElse(null);

                if (order != null) {
                    order.setPaymentStatus("SUCCESS");
                    order.setStatus(OrderStatus.CONFIRMED);
                    order.setRazorpayPaymentId(razorpayPaymentId);
                    orderRepository.save(order);

                    // Add history
                    OrderStatusHistory history = new OrderStatusHistory();
                    history.setOrder(order);
                    history.setStatus(OrderStatus.CONFIRMED);
                    history.setTimestamp(LocalDateTime.now());
                    history.setMessage("Payment successful. Order confirmed.");
                    historyRepository.save(history);

                    return ResponseEntity.ok(Map.of("message", "Payment Verified"));
                } else {
                    return ResponseEntity.badRequest().body("Order not found for verified payment");
                }
            } else {
                return ResponseEntity.badRequest().body("Signature Verification Failed");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error verifying payment");
        }
    }
}
