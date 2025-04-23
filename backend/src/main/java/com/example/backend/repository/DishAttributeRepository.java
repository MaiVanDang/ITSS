package com.example.backend.repository;

import com.example.backend.entities.DishAttributeEntity;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DishAttributeRepository extends JpaRepository<DishAttributeEntity, Integer> {
    List<DishAttributeEntity> findByDishId(Integer id);
    List<DishAttributeEntity> findByShoppingId(Integer ids);

    @Modifying
    @Transactional
    @Query(" DELETE FROM DishAttributeEntity d WHERE d.shoppingId = :shoppingId ")
    void deleteByShoppingId(@Param("shoppingId") Integer shoppingId);
}
