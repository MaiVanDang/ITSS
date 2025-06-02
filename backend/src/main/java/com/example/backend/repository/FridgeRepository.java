package com.example.backend.repository;

import com.example.backend.entities.FridgeEntity;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FridgeRepository extends JpaRepository<FridgeEntity, Integer> {
    FridgeEntity findByGroupId(Integer groupId);

    List<FridgeEntity> findByUserId(Integer userId);

}
