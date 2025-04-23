package com.example.backend.repository;

import com.example.backend.entities.DishEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DishRepository extends JpaRepository<DishEntity, Integer> {
    DishEntity findByName(String name);
    List<DishEntity> findByNameContaining(String name);
    @Query("SELECT e FROM DishEntity e WHERE (:name IS NULL OR e.name LIKE %:name%) " +
            "AND (:status IS NULL  OR e.status = :status) " +
            "AND (:type IS NULL  OR e.type LIKE :type )"
    )
    List<DishEntity> findByFilters(@Param("name") String name,
                                   @Param("status") Integer status,
                                   @Param("type") String type);
    @Query("SELECT DISTINCT p.type FROM DishEntity p")

    List<String> findDistinctType();
}

