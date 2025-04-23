package com.example.backend.dtos;

import lombok.Data;

import java.util.List;

@Data
public class FridgeDto {
    private Integer id;
    private String name;
    GroupDto group;
    UserDto user;

    private Integer type;
    private List<FridgeIngredientsDto> ingredients;

}
