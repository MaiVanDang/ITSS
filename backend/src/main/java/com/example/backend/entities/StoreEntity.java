package com.example.backend.entities;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Data
@Table(name = "store")
public class StoreEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "ingredients_id")
    private Integer ingredientsId;

    @Column(name = "user_id")
    private Integer userId;

    @Column(precision = 10, scale = 2)
    private BigDecimal quantity;

    @Column(name = "buy_at")
    private LocalDate buyAt;

    @Column(name = "expired_at")
    private LocalDate expridedAt;

    @Column(length = 10)
    private String measure;

    // Relationships (optional)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ingredients_id", insertable = false, updatable = false)
    private IngredientsEntity ingredient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private UserEntity user;
}