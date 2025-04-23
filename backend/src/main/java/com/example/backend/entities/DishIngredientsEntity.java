package com.example.backend.entities;
import lombok.Data;

import jakarta.persistence.*;

@Entity
@Data
@Table(name = "dish_ingredients")
public class DishIngredientsEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @Column
    private Integer dishId;
    @Column
    private Integer ingredientsId;
    @Column
    private Integer quantity;
    @Column
    private String measure;
}
