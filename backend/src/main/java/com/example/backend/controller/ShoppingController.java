package com.example.backend.controller;

import com.example.backend.dtos.ShoppingDto;
import com.example.backend.service.ShoppingService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;

@RestController
@Validated
@RequestMapping("admin")
@CrossOrigin(origins = "http://localhost:3000")
public class ShoppingController {
    @Autowired
    private ShoppingService shoppingService;

    @GetMapping("/market/user/{id}")
    public List<ShoppingDto> getShoppingById(@PathVariable Integer id) {
        List<ShoppingDto> response = shoppingService.getShoppingByUserId(id);
        return response;
    }

    @GetMapping("/market/show/detail/{id}")
    public ShoppingDto getDetailShoppingById(@PathVariable Integer id) {
        ShoppingDto response = shoppingService.getDetailShoppingById(id);
        return response;
    }

    @GetMapping("/market/filter/{userId}")
    public List<ShoppingDto> getShoppingByAttributeId(
            @PathVariable Integer userId,
            @RequestParam(name = "code", required = false) String code,
            @RequestParam(name = "status", required = false) Integer status,
            @RequestParam(name = "minCreateAt", required = false) String minCreateAt,
            @RequestParam(name = "maxCreateAt", required = false) String maxCreateAt) {
        List<ShoppingDto> response = shoppingService.getByFilter(userId, code, status, minCreateAt, maxCreateAt);
        return response;
    }

    @GetMapping("/market/group/{id}")
    public List<ShoppingDto> getShoppingsByGroup(@PathVariable Integer id) {
        return shoppingService.getShoppingByGroupId(id);
    }

    @GetMapping("/market/attribute/measures")
    public List<String> getAllMeasures() {
        return shoppingService.getAllIngredientsMeasure();
    }

    @PostMapping("/market")
    public String addShopping(@RequestBody ShoppingDto shoppingDto) {
        shoppingService.addShopping(shoppingDto);
        return "success";
    }

    @PutMapping("/market/update")
    public String updateShopping(@RequestBody ShoppingDto shoppingDto) {
        shoppingService.updateShopping(shoppingDto);
        return "success";
    }

    @PutMapping("/market/active")
    public ResponseEntity<String> updateShoppingAttribute(
            @RequestBody Map<String, Object> request) {
        try {
            // Validate required fields
            if (!request.containsKey("id") || request.get("id") == null) {
                return ResponseEntity.badRequest().body("Missing required field: id");
            }
            if (!request.containsKey("attributeId") || request.get("attributeId") == null) {
                return ResponseEntity.badRequest().body("Missing required field: attributeId");
            }

            Integer id = (Integer) request.get("id");
            Integer attributeId = (Integer) request.get("attributeId");
            String measure = (String) request.get("measure");
            Integer quantity = (Integer) request.get("quantity");

            // Safe date parsing with null checks
            LocalDate buyAt = null;
            LocalDate exprided = null;

            String buyAtStr = (String) request.get("buyAt");
            if (buyAtStr != null && !buyAtStr.trim().isEmpty()) {
                buyAt = LocalDate.parse(buyAtStr);
            }

            String expridedStr = (String) request.get("exprided");
            if (expridedStr != null && !expridedStr.trim().isEmpty()) {
                exprided = LocalDate.parse(expridedStr);
            }

            shoppingService.updateShoppingAttribute(id, attributeId, measure, quantity, buyAt, exprided);
            return ResponseEntity.ok("success");

        } catch (DateTimeParseException e) {
            return ResponseEntity.badRequest().body("Invalid date format. Use YYYY-MM-DD format.");
        } catch (ClassCastException e) {
            return ResponseEntity.badRequest().body("Invalid data type in request.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred while updating shopping attribute.");
        }
    }

    @DeleteMapping("/market/{orderId}")
    public String deleteShopping(@PathVariable Integer orderId) {
        shoppingService.deleteShopping(orderId);
        return "success";
    }

    @GetMapping("/market/purchased-items/{id}")
    public List<ShoppingDto> getAllShoppingByUser(@PathVariable Integer id) {
        List<ShoppingDto> response = shoppingService.getDetailUserStore(id);

        return response;
    }
}
