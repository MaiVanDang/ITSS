package com.example.backend.repository;

import com.example.backend.entities.GroupShoppingEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.transaction.Transactional;
import java.util.List;

@Repository
public interface GroupShoppingRepository extends JpaRepository<GroupShoppingEntity, Integer> {
    GroupShoppingEntity findByShoppingIdAndGroupId(Integer shoppingId, Integer groupId);
    List<GroupShoppingEntity> findByGroupId(Integer id);

    @Modifying
    @Transactional
    @Query("DELETE FROM GroupShoppingEntity g WHERE g.shoppingId = :shoppingId")
    void deleteByShoppingId(@Param("shoppingId") Integer shoppingId);
}