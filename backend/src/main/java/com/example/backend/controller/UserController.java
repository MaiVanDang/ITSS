package com.example.backend.controller;

import com.example.backend.dtos.Login;
import com.example.backend.dtos.Register;
import com.example.backend.dtos.UserDto;
import com.example.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@Validated
@RequestMapping("admin")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {
    @Autowired
    private UserService userService;
    @PostMapping("/login")
    public UserDto login(@RequestBody Login user) {
        UserDto userDto = userService.login(user);
        return userDto;
    }

    @PostMapping("/register")
    public String register(@RequestBody Register user) {
        userService.register(user);
        return "success";
    }
    @PutMapping("/user")
    public String updateInfor(@RequestBody UserDto userDto) {
        userService.updateInfor(userDto);
        return "success";
    }


}
