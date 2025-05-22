package com.example.backend.controller;

import com.example.backend.dtos.FridgeDto;
import com.example.backend.service.FridgeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Map;

@RestController
@Validated
@RequestMapping("admin")
@CrossOrigin(origins = "http://localhost:3000")
public class FridgeController {
    @Autowired
    FridgeService fridgeService;

    @GetMapping("/fridge/group/{id}")
    public FridgeDto getAllFridgeByGroup(@PathVariable Integer id) {
        return fridgeService.getDetailGroupFridge(id);
    }

    @GetMapping("/fridge/user/{id}")
    public FridgeDto getAllFridgeByUser(@PathVariable Integer id) {
        return fridgeService.getDetailUserFridge(id);
    }

    @PutMapping("fridge/use-ingredient")
    public String useIngredient(@RequestBody Map<String, Object> request) {
        Integer id = (Integer) request.get("id");
        Integer quantityUsed = (Integer) request.get("quantityUsed");
        fridgeService.useIngredient(id, quantityUsed);
        return "success";
    }

    @DeleteMapping("fridge/{id}")
    public String deleteDetailFridge(@PathVariable Integer id) {
        fridgeService.deleteFridge(id);
        return "success";
    }

    @PostMapping("/fridge")
    public String addNewFridge(@RequestBody FridgeDto newFridge) {
        fridgeService.addNewFridge(newFridge);
        return "success";

    }

    @PostMapping("/fridge/ingredients")
    public String addNewIngredient(@RequestBody Map<String, Object> request) {

        // Extract and validate each field individually
        Object fridgeIdObj = request.get("fridgeId");
        Object ingredientIdObj = request.get("ingredientId");
        Object quantityObj = request.get("quantity");
        Object measureObj = request.get("measure");
        Object expridedObj = request.get("exprided");

        Integer fridgeId = (fridgeIdObj instanceof Number) ? ((Number) fridgeIdObj).intValue() : null;
        Integer ingredientId = (ingredientIdObj instanceof Number) ? ((Number) ingredientIdObj).intValue() : null;
        Integer quantity = (quantityObj instanceof Number) ? ((Number) quantityObj).intValue() : null;
        String measure = (measureObj instanceof String) ? (String) measureObj : null;

        // Special handling for date
        LocalDate expridedWhenShopping = LocalDate.parse(expridedObj.toString());

        fridgeService.addIngredients(ingredientId, fridgeId, quantity, measure, expridedWhenShopping);
        return "success";
    }

    @DeleteMapping("/fridge/ingredients/{id}")
    public String autoDeleteIngredient(@PathVariable Integer id) {
        fridgeService.autoDeleteIngredient(id);
        return "success";
    }
}
