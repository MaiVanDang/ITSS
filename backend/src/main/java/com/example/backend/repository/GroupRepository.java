package com.example.backend.repository;

import com.example.backend.entities.GroupEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GroupRepository extends JpaRepository<GroupEntity, Integer> {
    List<GroupEntity> findByLeader(Integer id);
}
