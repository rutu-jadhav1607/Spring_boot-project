package com.example.taskmanager.dto;

public class JwtResponse {
    private String token;
    private String role;
    private String name;
    private String email;

    public JwtResponse(String token, String role, String name, String email) {
        this.token = token;
        this.role = role;
        this.name = name;
        this.email = email;
    }

    public String getToken() {
        return token;
    }

    public String getRole() {
        return role;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }
}
