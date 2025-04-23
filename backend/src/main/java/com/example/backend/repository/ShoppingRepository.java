package com.example.backend.repository;

import com.example.backend.entities.ShoppingEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ShoppingRepository extends JpaRepository<ShoppingEntity, Integer> {
    ShoppingEntity findByCode(String code);
    List<ShoppingEntity> findByUserId(int userId);
    @Query("SELECT e FROM ShoppingEntity e WHERE (:code IS NULL OR LOWER(e.code) LIKE LOWER(CONCAT('%', :code, '%') )) " +
            "AND (:status IS NULL  OR e.status = :status) " +
            "AND (:minCreateAt IS NULL OR :maxCreateAt IS NULL OR e.createAt BETWEEN :minCreateAt AND :maxCreateAt) " +
            "AND (e.userId = :userId)"

    )

    List<ShoppingEntity> findByFiltersForCodeNotNull(@Param("code") String code,
                                       @Param("status") Integer status,
                                       @Param("minCreateAt") LocalDate minCreateAt,
                                       @Param("maxCreateAt") LocalDate maxCreateAt,
                                       @Param("userId") Integer userId
    );
    @Query("SELECT e FROM ShoppingEntity e WHERE (:status IS NULL  OR e.status = :status) " +
            "AND (:minCreateAt IS NULL OR :maxCreateAt IS NULL OR e.createAt BETWEEN :minCreateAt AND :maxCreateAt) " +
            "AND (e.userId = :userId)"

    )

    List<ShoppingEntity> findByFiltersForCodeIsNull(@Param("status") Integer status,
                                                     @Param("minCreateAt") LocalDate minCreateAt,
                                                     @Param("maxCreateAt") LocalDate maxCreateAt,
                                                     @Param("userId") Integer userId
    );

}
