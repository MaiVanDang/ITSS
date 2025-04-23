package com.example.backend.repository;

import com.example.backend.entities.GroupMemberEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GroupMemberRepository extends JpaRepository<GroupMemberEntity, Integer> {
    List<GroupMemberEntity> findByGroupId(Integer groupId);
    List<GroupMemberEntity> findByUserId(Integer memberId);
    GroupMemberEntity findByGroupIdAndUserId(Integer groupId,Integer userId);

}
