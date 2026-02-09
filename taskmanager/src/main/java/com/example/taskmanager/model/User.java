package com.example.taskmanager.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true)
    private String email;

    private String password;

    // 👇 THIS STORES USER ROLE AS TEXT (ADMIN / USER)
    @Enumerated(EnumType.STRING)
    private Role role;

    private String provider; // GOOGLE / FACEBOOK / LOCAL

    private boolean enabled;
}
