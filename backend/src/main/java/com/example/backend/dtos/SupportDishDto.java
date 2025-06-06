package com.example.backend.dtos;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter
@Setter
public class SupportDishDto {
    private String positionName;
    private Double quantityDoublePresent;
    private String measure;
}
