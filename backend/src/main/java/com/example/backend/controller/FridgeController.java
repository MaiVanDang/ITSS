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
        Double quantityUsed = ((Number) request.get("quantityUsed")).doubleValue();
        String unit = (String) request.get("unit");
        fridgeService.useIngredient(id, quantityUsed, unit);
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

        // Extract and validate each field individually
        Object storeIdObj = request.get("id");
        Object userIdObj = request.get("userId");
        Object ingredientsIdObj = request.get("ingredientsId");
        Object ingredientNameObj = request.get("ingredientName");
        Object ingredientImageObj = request.get("ingredientImage");
        Object ingredientStatusObj = request.get("ingredientStatus");
        Object quantityObj = request.get("quantity");
        Object userNameBuyObj = request.get("userBuyName");
        Object measureObj = request.get("measure");
        Object expridedObj = request.get("exprided");
        Object buyAtObject = request.get("buyAt");

        Integer storeId = (storeIdObj instanceof Number) ? ((Number) storeIdObj).intValue() : null;
        Integer userId = (userIdObj instanceof Number) ? ((Number) userIdObj).intValue() : null;
        Integer ingredientId = (ingredientsIdObj instanceof Number) ? ((Number) ingredientsIdObj).intValue() : null;
        String ingredientName = (ingredientNameObj instanceof String) ? (String) ingredientNameObj : null;
        String ingredientImage = (ingredientImageObj instanceof String) ? (String) ingredientImageObj : null;
        String userNameBuy = (userNameBuyObj instanceof String) ? (String) userNameBuyObj : null;
        String ingredientStatus = (ingredientStatusObj instanceof String) ? (String) ingredientStatusObj : null;
        BigDecimal quantity = (quantityObj instanceof Number) ? BigDecimal.valueOf(((Number) quantityObj).doubleValue())
                : null;
        String measure = (measureObj instanceof String) ? (String) measureObj : null;
        LocalDate expridedWhenShopping = (expridedObj instanceof String) ? LocalDate.parse((String) expridedObj) : null;
        LocalDate buyAt = (buyAtObject instanceof String) ? LocalDate.parse((String) buyAtObject) : null;

        StoreDto storeDto = new StoreDto();
        storeDto.setStoreId(storeId);
        storeDto.setIngredientsId(ingredientId);
        storeDto.setIngredientName(ingredientName);
        storeDto.setIngredientImage(ingredientImage);
        storeDto.setIngredientStatus(ingredientStatus);
        storeDto.setQuantity(quantity);
        storeDto.setMeasure(measure);
        storeDto.setExpridedAt(expridedWhenShopping);
        storeDto.setUserNameBuy(userNameBuy);
        storeDto.setBuyAt(buyAt);

        fridgeService.addIngredientsFromStore(storeDto, userId);
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
