package com.example.backend.repository;

import com.example.backend.entities.FavoriteEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FavoriteRepository extends JpaRepository<FavoriteEntity, Integer> {
    List<FavoriteEntity> findByUserId (Integer id);
    FavoriteEntity findByUserIdAndRecipeId(Integer userId, Integer recipeId);
}
