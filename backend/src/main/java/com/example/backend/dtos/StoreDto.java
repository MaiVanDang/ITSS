package com.example.backend.dtos;

import java.math.BigDecimal;
import java.time.LocalDate;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter
@Setter
public class StoreDto {
    private Integer storeId;
    private Integer ingredientsId;
    private Integer userId;
    private BigDecimal quantity;
    private LocalDate buyAt;
    private LocalDate expridedAt;
    private String measure;
    private String ingredientName;
    private String userName;
    private String ingredientImage;
    private String ingredientStatus;
}
