package com.example.backend.dtos;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Getter
@Setter
public class ShoppingAttributeDto {
    private Integer id;
    UserDto user;
    IngredientsDto ingredients;
    private LocalDate exprided;

    private int status;
    private String measure;
    private LocalDate buyAt;
    private BigDecimal quantity;
    private String ingredientStatus;

}
