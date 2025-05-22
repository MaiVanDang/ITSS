package com.example.backend.dtos;

import lombok.Data;
import lombok.Getter;

import java.time.LocalDate;

@Data
@Getter
public class IngredientsDto {
    private Integer id;
    private String name;
    private String image;
    private String description;
    private Integer status;
    private Integer dueDate;
    private LocalDate createAt;
    private LocalDate updateAt;
    private String ingredientStatus;
}