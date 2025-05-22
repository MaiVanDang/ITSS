package com.example.backend.repository;

import com.example.backend.entities.FridgeIngredientsEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface FridgeIngredientsRepository extends JpaRepository<FridgeIngredientsEntity, Integer> {
    List<FridgeIngredientsEntity> findByIngredientsId(Integer id);

    List<FridgeIngredientsEntity> findByFridgeId(Integer id);

    FridgeIngredientsEntity findByFridgeIdAndIngredientsId(Integer fridgeId, Integer ingredientsId);

    FridgeIngredientsEntity findByExpridedAndFridgeIdAndIngredientsId(
            LocalDate exprided, Integer fridgeId, Integer ingredientsId);

}
