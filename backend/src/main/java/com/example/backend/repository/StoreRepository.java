package com.example.backend.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.backend.entities.StoreEntity;

public interface StoreRepository extends JpaRepository<StoreEntity, Integer> {

        List<StoreEntity> findByUserId(Integer userId);

        List<StoreEntity> findByIngredientsId(Long ingredientsId);

        StoreEntity findByIngredientsIdAndBuyAtAndExpridedAt(
                        Integer ingredientsId,
                        LocalDate buyAt,
                        LocalDate expiredAt);

        StoreEntity findByIngredientsIdAndExpridedAt(
                        Integer ingredientsId,
                        LocalDate expiredAt);

        List<StoreEntity> findByUserIdAndIngredientId(
                        Integer userId,
                        Integer ingredientId);

}
