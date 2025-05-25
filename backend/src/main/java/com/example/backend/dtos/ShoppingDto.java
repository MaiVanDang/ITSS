package com.example.backend.dtos;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Data
@Setter
@Getter

public class ShoppingDto {
    private Integer id;
    private String code;
    private LocalDate createAt;
    UserDto user;
    private Integer status;
    List<ShoppingAttributeDto> attributes;
    List<DishAttributeDto> dishes;
    private Boolean statusbuy;
    private Boolean statusstore;
    private Integer quantitystore;

    private String image;
    private String name;
}
