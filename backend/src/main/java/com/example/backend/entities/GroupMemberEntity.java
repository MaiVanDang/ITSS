package com.example.backend.entities;

import lombok.Data;

import jakarta.persistence.*;

@Entity
@Data
@Table(name = "group_member")
public class GroupMemberEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @Column
    private Integer groupId;
    @Column
    private Integer userId;
}
