package com.example.backend.controller;

import com.example.backend.dtos.ShoppingDto;
import com.example.backend.dtos.StoreDto;
import com.example.backend.service.ShoppingService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
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

    @GetMapping("/market/show/detail/{orderId}")
    public ShoppingDto getDetailShoppingById(@PathVariable Integer orderId) {
        ShoppingDto response = shoppingService.getDetailShoppingById(orderId);
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

        Integer id = (Integer) request.get("id");
        Integer attributeId = (Integer) request.get("attributeId");
        String measure = (String) request.get("measure");
        Integer quantity = (Integer) request.get("quantity");
        String buyAtStr = (String) request.get("buyAt");
        Integer leaderId = (Integer) request.get("leaderId");
        List<?> rawListMember = (List<?>) request.get("listMember");
        List<Integer> listMember = rawListMember != null
                ? rawListMember.stream()
                        .map(item -> item instanceof Integer ? (Integer) item : Integer.parseInt(item.toString()))
                        .toList()
                : null;
        Integer userBuyId = (Integer) request.get("userId");

        LocalDate buyAt = LocalDate.parse(buyAtStr);
        shoppingService.updateShoppingAttribute(id, attributeId, measure, quantity, buyAt, leaderId, listMember,
                userBuyId);
        return ResponseEntity.ok("success");
    }

    @DeleteMapping("/market/{orderId}")
    public String deleteShopping(@PathVariable Integer orderId) {
        shoppingService.deleteShopping(orderId);
        return "success";
    }

    @GetMapping("/market/purchased-items/{userId}")
    public List<StoreDto> getAllShoppingByUser(@PathVariable Integer userId) {
        List<StoreDto> response = shoppingService.getDetailUserStore(userId);
        return response;
    }

    @DeleteMapping("/market/purchased-items/{storeId}")
    public ResponseEntity<String> deletePurchasedItem(
            @PathVariable Integer storeId,
            @RequestBody Map<String, Object> requestBody) {

        try {
            // Lấy quantity và unit từ request body
            Number quantity = (Number) requestBody.get("quantity");
            String unit = (String) requestBody.get("unit");

            // Kiểm tra dữ liệu hợp lệ
            if (quantity == null || unit == null) {
                return ResponseEntity.badRequest().body("Thiếu thông tin quantity hoặc unit");
            }

            shoppingService.deleteStoreByUser(storeId, quantity.doubleValue(), unit);
            return ResponseEntity.ok("Đã sử dụng " + quantity + " " + unit + " thành công");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Lỗi khi xử lý: " + e.getMessage());
        }
    }

}
