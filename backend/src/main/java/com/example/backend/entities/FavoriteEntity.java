package com.example.backend.entities;
import lombok.Data;


import jakarta.persistence.*;

@Entity
@Data
@Table(name = "favorite")
public class FavoriteEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @Column
    private Integer userId;
    @Column
    private Integer recipeId;
}
