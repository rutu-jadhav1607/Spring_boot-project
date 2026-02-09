package com.example.taskmanager.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import com.example.taskmanager.service.AuthService;
import com.example.taskmanager.dto.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public String register(@RequestBody RegisterRequest req) {
        return authService.register(req);
    }

    @PostMapping("/login") // chnage
    public JwtResponse login(@RequestBody LoginRequest req) {
        return authService.login(req);
    }

    @PostMapping("/forgot-password")
    public String sendOtp(@RequestParam String email) {
        return authService.sendOtp(email);
    }
}
