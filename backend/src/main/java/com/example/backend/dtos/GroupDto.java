package com.example.backend.dtos;


import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class GroupDto {
    private Integer id;
    private String name;
    UserDto leader;
    private String image;
    private LocalDate createAt;
    private LocalDate updateAt;
    List<UserDto> groupMembers;
    List<ShoppingDto> shoppings;
}
