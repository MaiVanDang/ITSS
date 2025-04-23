package com.example.backend.dtos;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;
@Data
public class DishDto {
    private Integer id;
    private String image;
    private String name;
    private String descriptions;
    private Integer status;
    private String type;
    private String recipeDes;
    private LocalDate createAt;
    private LocalDate updateAt;
    private Integer favorite;
    private List<DishIngredientsDto>  ingredients;


}
