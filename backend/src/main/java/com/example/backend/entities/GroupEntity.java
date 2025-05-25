package com.example.backend.entities;

import lombok.Data;

import jakarta.persistence.*;

@Entity
@Data
@Table(name = "group_table")
public class GroupEntity extends BaseEntity {
    @Column
    private Integer leader;
    @Column
    private String image;
}
