package com.example.policymanager.controller;

import com.example.policymanager.auth.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    public Map<String, String> login(
            @RequestParam String username,
            @RequestParam String password) {

        // TEMP validation (replace with DB later)
        if ("admin".equals(username) && "admin123".equals(password)) {
            String token = jwtUtil.generateToken(username);
            return Map.of("token", token);
        }

        throw new RuntimeException("Invalid Credentials");
    }
}

