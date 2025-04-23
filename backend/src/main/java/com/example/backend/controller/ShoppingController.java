package com.example.backend.controller;

import com.example.backend.dtos.ShoppingDto;
import com.example.backend.entities.ShoppingEntity;
import com.example.backend.service.ShoppingService;
import org.springframework.beans.factory.annotation.Autowired;
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

    @GetMapping("/market/show/detail/{id}")
    public ShoppingDto getDetailShoppingById(@PathVariable Integer id) {
        ShoppingDto response = shoppingService.getDetailShoppingById(id);
        return response;
    }

    @GetMapping("/market/filter/{userId}")
    public List<ShoppingDto> getShoppingByAttributeId(
            @PathVariable Integer userId,
            @RequestParam(name = "code",required = false) String code,
            @RequestParam(name = "status",required = false) Integer status,
            @RequestParam(name = "minCreateAt",required = false) String minCreateAt,
            @RequestParam(name = "maxCreateAt",required = false) String maxCreateAt
    ) {
        List<ShoppingDto> response = shoppingService.getByFilter(userId,code,status,minCreateAt,maxCreateAt);
        return response;
    }
    @GetMapping("/market/group/{id}")
    public List<ShoppingDto> getShoppingsByGroup(@PathVariable Integer id)  {
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
    public String updateShoppingAttribute(
            @RequestBody Map<String, Object> request
    ) {
        Integer id = (Integer) request.get("id");
        Integer attributeId = (Integer) request.get("attributeId");
        String measure = (String) request.get("measure");
        shoppingService.updateShoppingAttribute(id, attributeId, measure);
        return "success";
    }
    @PutMapping("/market/remove")
    public String removeShoppingAttribute(
            @RequestBody Map<String , Object>  request
    ) {
        Integer id = (Integer) request.get("id");
        Integer attributeId = (Integer) request.get("attributeId");
        String measure = (String) request.get("measure");
        shoppingService.removeUpdateShoppingAttribute(id, attributeId, measure);
        return "success";
    }
    @DeleteMapping("/market/{id}")
    public String deleteShopping(@PathVariable Integer id) {
        shoppingService.deleteShopping(id);
        return "success";
    }
}
