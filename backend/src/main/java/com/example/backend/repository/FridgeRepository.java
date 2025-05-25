package com.example.backend.repository;

import com.example.backend.entities.FridgeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FridgeRepository extends JpaRepository<FridgeEntity, Integer> {
    FridgeEntity findByGroupId(Integer groupId);

    FridgeEntity findByUserId(Integer userId);
}
