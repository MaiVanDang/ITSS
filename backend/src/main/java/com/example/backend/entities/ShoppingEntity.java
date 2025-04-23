package com.example.backend.entities;

import lombok.Data;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Data
@Table(name = "shopping")
public class ShoppingEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @Column
    private String code;
    @Column
    private Integer status;
    @Column
    private Integer userId;
    @Column
    private LocalDate createAt;
}
