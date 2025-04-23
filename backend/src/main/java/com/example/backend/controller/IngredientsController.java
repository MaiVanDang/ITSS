package com.example.backend.controller;

import com.example.backend.dtos.IngredientsDto;
import com.example.backend.service.IngredientsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@Validated
@RequestMapping("admin")
@CrossOrigin(origins = "http://localhost:3000")
public class IngredientsController {
    @Autowired
    IngredientsService ingredientsService;
    @GetMapping("/ingredients")
    public List<IngredientsDto> getAllIngredients() {
        return ingredientsService.getAllIngredients();
    }
    @GetMapping("/ingredient/search")
    public List<IngredientsDto> getIngredientByFilter(
            @RequestParam(name = "name", required = false) String name,
            @RequestParam(name = "status", required = false) Integer status
    ) {
        return ingredientsService.getIngredientByFilter(name,status);
    }

    @PostMapping("/ingredient")
    public String addIngredient(@RequestBody IngredientsDto ingredientsDto) {
        ingredientsService.addIngredient(ingredientsDto);
        return "success";
    }

    @PutMapping("/ingredient/{id}")
    public String activeIngredient(@PathVariable Integer id) {
        ingredientsService.activeIngredient(id);
        return "success";
    }
    @PutMapping("/ingredient/update/{id}")
    public String updateIngredient(
            @PathVariable Integer id,
            @RequestBody IngredientsDto ingredientsDto) {
        ingredientsService.updateIngredient(id,ingredientsDto);
        return "success";
    }
    @DeleteMapping("/ingredient/{id}")
    public String deleteIngredient(@PathVariable Integer id) {
        ingredientsService.deleteIngredient(id);
        return "success";
    }
}
