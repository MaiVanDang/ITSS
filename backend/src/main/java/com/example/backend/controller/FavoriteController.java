package com.example.backend.controller;

import com.example.backend.dtos.DishDto;
import com.example.backend.service.FavoriteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@Validated
@RequestMapping("admin")
@CrossOrigin(origins = "http://localhost:3000")
public class FavoriteController {
    @Autowired
    FavoriteService favoriteService;
    @GetMapping("/favorite/{id}")
    public List<DishDto> getFavoriteDishesByUser(@PathVariable Integer id) {
        return favoriteService.getFavoriteDishesByUser(id);
    }
    @PostMapping("/favorite")
    public String addFavoriteDish(@RequestBody Map<String,Object> request) {
        Integer userId = (Integer) request.get("userId");
        Integer dishId = (Integer) request.get("dishId");
        favoriteService.addDishFavorite(userId, dishId);
        return "success";
    }
    @DeleteMapping("/favorite")
    public String removeFavoriteDish(@RequestBody Map<String,Object> request) {
        Integer userId = (Integer) request.get("userId");
        Integer dishId = (Integer) request.get("dishId");
        favoriteService.removeFavoriteDish(userId, dishId);
        return "success";
    }
    @GetMapping("/favorite/search")
    public List<DishDto> getDishFavoriteBySearch(@RequestBody Map<String,Object> request) {
        String findString = (String) request.get("findString");
        Integer userId = (Integer) request.get("userId");
        return favoriteService.findDish(findString, userId);

    }
}
