package com.example.backend.dtos;


import lombok.Data;


import java.math.BigDecimal;
import java.time.LocalDate;
@Data
public class ShoppingAttributeDto {
    private Integer id;
    UserDto user;
    IngredientsDto ingredients;
    private LocalDate exprided;

    private int status;
    private String measure;
    private LocalDate buyAt;
    private BigDecimal quantity;


}
