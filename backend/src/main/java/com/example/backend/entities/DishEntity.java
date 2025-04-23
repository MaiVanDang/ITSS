package com.example.backend.entities;
import lombok.Data;

import jakarta.persistence.*;

@Entity
@Data
@Table(name = "dish")
public class DishEntity extends BaseEntity {
    @Column
    private String image;
    @Column
    private String descriptions;
    @Column
    private String recipeDes;
    @Column
    private Integer status;
    @Column
    private String type;

}
