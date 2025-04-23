package com.example.backend.dtos;

import lombok.Data;

@Data
public class DishIngredientsDto {
    IngredientsDto ingredient;
    private Integer quantity;
    private String measure;
}
