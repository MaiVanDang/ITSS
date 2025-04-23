package com.example.backend.entities;
import lombok.Data;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Data
@Table(name = "users")
public class UserEntity extends BaseEntity{
    @Column
    private String username;
    @Column
    private String password;
    @Column
    private LocalDate verifiedTime;
    @Column
    private String email;
    @Column
    private Integer status;
    @Column
    private String avatar;
    @Column
    private String gender;
    @Column
    private String address;
}
