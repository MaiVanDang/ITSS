package com.example.backend.dtos;

import java.util.List;

import lombok.Data;

@Data
public class DishIngredientsDto {
    IngredientsDto ingredient;
    private Integer quantity;
    private String measure;
    private Integer checkQuantity;
    List<SupportDishDto> SupportDishDto;
}
