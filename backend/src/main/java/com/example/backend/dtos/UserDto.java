package com.example.backend.dtos;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;
@Data
public class UserDto {
    private String name;
    private Integer id;
    private Integer status;
    private String avatar;
    private String gender;
    private String email;
    private Integer fridgeId;
    private LocalDate createAt;
    private String address;
    List<GroupDto> groups;
}