package com.example.backend.entities;

import lombok.Data;


import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Data
@Table(name = "shopping_attribute")
public class ShoppingAttributeEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @Column
    private Integer shoppingId;
    @Column
    private Integer userId;
    @Column
    private Integer ingredientsId;
    @Column
    private LocalDate buyAt;
    @Column
    private Integer status;
    @Column
    private String measure;
    @Column
    private LocalDate exprided;
    @Column
    private BigDecimal quantity;
}
