package com.example.backend.dtos;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter
@Setter
public class StoreDto {
    private Long id;
    private Long ingredientsId;
    private Long userId;
    private BigDecimal quantity;
    private LocalDateTime buyAt;
    private LocalDateTime expiredAt;
    private String measure;
    private String ingredientName;
    private String userName;
}
