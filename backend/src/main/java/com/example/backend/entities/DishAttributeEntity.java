package com.example.backend.entities;
import lombok.Data;


import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Data

@Table(name = "dish_attribute")
public class DishAttributeEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @Column
    private Integer dishId;
    @Column
    private Integer quantity;
    @Column
    private Integer shoppingId;
    @Column
    private LocalDate expride;
    @Column
    private Integer cookStatus;
    @Column
    private LocalDate cookDate;
    @Column
    private LocalDate createAt;
    @Column
    private LocalDate updateAt;

}
