package com.example.taskmanager.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.taskmanager.dto.JwtResponse;
import com.example.taskmanager.dto.LoginRequest;
import com.example.taskmanager.dto.RegisterRequest;
import com.example.taskmanager.model.Role;
import com.example.taskmanager.model.User;
import com.example.taskmanager.repository.UserRepository;
import com.example.taskmanager.util.JwtUtil;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    // 🔹 REGISTER USER
    public String register(RegisterRequest req) {

        if (userRepository.findByEmail(req.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }

        User user = new User();
        user.setName(req.getName());
        user.setEmail(req.getEmail());

        // 🔐 Encrypt password
        user.setPassword(passwordEncoder.encode(req.getPassword()));

        user.setRole(Role.USER);
        user.setProvider("LOCAL");
        user.setEnabled(true);

        userRepository.save(user);

        return "User Registered Successfully";
    }

    // 🔹 LOGIN USER
    public JwtResponse login(LoginRequest req) {
        // 🛡️ SPECIAL ADMIN CHECK
        if ("admin@jobhook.com".equals(req.getEmail()) &&
                ("admin".equals(req.getPassword()) || "Admin".equals(req.getPassword()))) {
            String token = jwtUtil.generateToken("admin@jobhook.com", Role.ADMIN.name());
            return new JwtResponse(token, Role.ADMIN.name(), "Admin", "admin@jobhook.com");
        }

        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 🔍 Check password
        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        // 🎟 Generate JWT token
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

        return new JwtResponse(token, user.getRole().name(), user.getName(), user.getEmail());
    }

    // 🔹 OTP (we'll build later)
    public String sendOtp(String email) {
        return "OTP sent to email";
    }
}
