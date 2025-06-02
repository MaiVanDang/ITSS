package com.example.backend.controller;

import com.example.backend.dtos.FridgeDto;
import com.example.backend.dtos.StoreDto;
import com.example.backend.service.FridgeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
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

    @GetMapping("/fridge/user/{userId}")
    public FridgeDto getAllFridgeByUser(@PathVariable Integer userId) {
        return fridgeService.getDetailUserFridge(userId);
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

    @PostMapping("/fridge/store/ingredients")
    public String addNewIngredientFromStore(@RequestBody Map<String, Object> request) {

        System.out.println("Received request: " + request);

        // Extract and validate each field individually
        Object fridgeIdObj = request.get("fridgeId");
        Object ingredientsIdObj = request.get("ingredientsId");
        Object ingredientNameObj = request.get("ingredientName");
        Object ingredientImageObj = request.get("ingredientImage");
        Object ingredientStatusObj = request.get("ingredientStatus");
        Object quantityObj = request.get("quantity");
        Object measureObj = request.get("measure");
        Object expridedObj = request.get("exprided");
        Object buyAtObject = request.get("buyAt");

        Integer fridgeId = (fridgeIdObj instanceof Number) ? ((Number) fridgeIdObj).intValue() : null;
        Integer ingredientId = (ingredientsIdObj instanceof Number) ? ((Number) ingredientsIdObj).intValue() : null;
        String ingredientName = (ingredientNameObj instanceof String) ? (String) ingredientNameObj : null;
        String ingredientImage = (ingredientImageObj instanceof String) ? (String) ingredientImageObj : null;
        String ingredientStatus = (ingredientStatusObj instanceof String) ? (String) ingredientStatusObj : null;
        BigDecimal quantity = (quantityObj instanceof Number) ? BigDecimal.valueOf(((Number) quantityObj).doubleValue())
                : null;
        String measure = (measureObj instanceof String) ? (String) measureObj : null;
        LocalDate expridedWhenShopping = (expridedObj instanceof String) ? LocalDate.parse((String) expridedObj) : null;
        LocalDate buyAt = (buyAtObject instanceof String) ? LocalDate.parse((String) buyAtObject) : null;

        StoreDto storeDto = new StoreDto();
        storeDto.setIngredientsId(ingredientId);
        storeDto.setIngredientName(ingredientName);
        storeDto.setIngredientImage(ingredientImage);
        storeDto.setIngredientStatus(ingredientStatus);
        storeDto.setQuantity(quantity);
        storeDto.setMeasure(measure);
        storeDto.setExpridedAt(expridedWhenShopping);
        storeDto.setBuyAt(buyAt);

        fridgeService.addIngredientsFromStore(storeDto, fridgeId);
        return "success";
    }

    @PostMapping("/fridge/ingredients")
    public String addIngredientToFridge(@RequestBody Map<String, Object> request) {
        fridgeService.addIngredientToFridge(request);
        return "success";
    }

    @DeleteMapping("/fridge/ingredients/{id}")
    public String autoDeleteIngredient(@PathVariable Integer id) {
        fridgeService.autoDeleteIngredient(id);
        return "success";
    }
}
