package com.fashionhouse.shop.repository;

import com.fashionhouse.shop.entity.CustomerOrder;
import com.fashionhouse.shop.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderRepository extends JpaRepository<CustomerOrder, Long> {
    List<CustomerOrder> findByUserOrderByOrderDateDesc(User user);
    List<CustomerOrder> findAllByOrderByOrderDateDesc();
}
