package com.example.backend.repository;

import com.example.backend.entities.IngredientsEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IngredientsRepository extends JpaRepository<IngredientsEntity, Integer> {
    IngredientsEntity findByName(String name);
    @Query("SELECT e FROM IngredientsEntity e WHERE (:name IS NULL OR e.name LIKE %:name%) " +
            "AND (:status IS NULL  OR e.status = :status) "
    )
    List<IngredientsEntity> findByFilters(@Param("name") String name,
                                          @Param("status") Integer status);

}
