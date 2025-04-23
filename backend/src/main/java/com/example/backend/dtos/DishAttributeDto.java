package com.example.backend.dtos;

import lombok.Data;

import java.time.LocalDate;

@Data
public class DishAttributeDto {
    private Integer id;
    DishDto dish;

    private LocalDate expride;
    private String cook_status;
    private LocalDate cookDate;
    private Integer quantity;
    private LocalDate createAt;
    private LocalDate updateAt;
}
