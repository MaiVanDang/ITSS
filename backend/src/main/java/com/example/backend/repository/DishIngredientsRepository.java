package com.example.backend.repository;

import com.example.backend.entities.DishIngredientsEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DishIngredientsRepository extends JpaRepository<DishIngredientsEntity, Integer> {
    List<DishIngredientsEntity> findByDishId(Integer id);
    DishIngredientsEntity findByDishIdAndIngredientsId(Integer dishId,Integer ingredientsId);

}
