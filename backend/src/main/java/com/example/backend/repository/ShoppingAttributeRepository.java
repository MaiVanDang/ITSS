package com.example.backend.repository;

import com.example.backend.entities.IngredientsEntity;
import com.example.backend.entities.ShoppingAttributeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShoppingAttributeRepository extends JpaRepository<ShoppingAttributeEntity, Integer> {
    List<ShoppingAttributeEntity> findByShoppingId(Integer id);
    ShoppingAttributeEntity findByShoppingIdAndIngredientsIdAndMeasure(Integer id, Integer ingredientsId,String measure);

    @Query("SELECT DISTINCT p.measure FROM ShoppingAttributeEntity p")
    List<String> findDistinctMeasure();
}
