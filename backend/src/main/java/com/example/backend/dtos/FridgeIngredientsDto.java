package com.example.backend.dtos;

import lombok.Data;

import jakarta.persistence.Column;
import java.time.LocalDate;

@Data
public class FridgeIngredientsDto {
    Integer id;
    IngredientsDto ingredient;
    private Integer quantity;
    private LocalDate exprided;
    private String measure;
    private LocalDate createAt;
}
