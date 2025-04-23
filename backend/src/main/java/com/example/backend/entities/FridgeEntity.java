package com.example.backend.entities;

import lombok.Data;


import jakarta.persistence.*;

@Entity
@Data
@Table(name = "fridge")
public class FridgeEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @Column
    private String name;
    @Column
    private Integer groupId;
    @Column
    private Integer userId;
    @Column
    private Integer type;


}
