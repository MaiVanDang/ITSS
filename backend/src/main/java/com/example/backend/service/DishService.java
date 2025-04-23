package com.example.backend.service;

import com.example.backend.dtos.DishAttributeDto;
import com.example.backend.dtos.DishDto;
import com.example.backend.dtos.DishIngredientsDto;
import com.example.backend.dtos.IngredientsDto;
import com.example.backend.entities.DishEntity;
import com.example.backend.entities.DishIngredientsEntity;
import com.example.backend.entities.IngredientsEntity;
import com.example.backend.exception.DuplicateException;
import com.example.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.*;

import static java.time.LocalDate.now;

@Service
@RequiredArgsConstructor
public class DishService {
    private final DishRepository dishRepository;
    private final DishAttributeRepository attributeRepository;
    private final DishIngredientsRepository dishIngredientRepository;
    private final ModelMapper dishModelMapper;
    private final FavoriteRepository favoriteRepository;
    private final IngredientsRepository ingredientsRepository;
    public List<DishDto> getAllDishes(Integer userId) {
        List<DishDto> dtos = new ArrayList<DishDto>();
        List<DishEntity> entities = dishRepository.findAll();


        dtos = Arrays.asList(dishModelMapper.map(entities,DishDto[].class));
        for(DishDto dto : dtos) {
            if(favoriteRepository.findByUserIdAndRecipeId(userId, dto.getId()) != null) {
                dto.setFavorite(1);
            } else {
                dto.setFavorite(0);
            }
        }
        dtos.sort(Comparator.comparing(DishDto::getFavorite).reversed());
        return dtos;
    }
    public DishDto getDishDetailById(Integer id) {
        DishEntity entity = dishRepository.findById(id).get();
        DishDto dto = new DishDto();
        List<DishIngredientsDto> ingredientsDtos = new ArrayList<DishIngredientsDto>();
        List<DishAttributeDto> attributeDtos = new ArrayList<DishAttributeDto>();
        dto = dishModelMapper.map(entity, DishDto.class);
        List<DishIngredientsEntity> ingredients = dishIngredientRepository.findByDishId(entity.getId());
        for(DishIngredientsEntity ingredient : ingredients) {
            DishIngredientsDto dishIngredientsDto = new DishIngredientsDto();
            IngredientsEntity ingredientsEntity = ingredientsRepository.findById(ingredient.getIngredientsId()).get();
            IngredientsDto ingredientDto = new IngredientsDto();
            ingredientDto = dishModelMapper.map(ingredientsEntity, IngredientsDto.class);
            dishIngredientsDto.setIngredient(ingredientDto);
            dishIngredientsDto.setQuantity(ingredient.getQuantity());
            dishIngredientsDto.setMeasure(ingredient.getMeasure());
            ingredientsDtos.add(dishIngredientsDto);
        }


        dto.setIngredients(ingredientsDtos);
        return dto;
    }
    public List<DishDto> getDishByFilter(String name, Integer status,String type,Integer userId) {
        List<DishDto> dtos = new ArrayList<DishDto>();
        List<DishEntity> entities = new ArrayList<DishEntity>();
        Integer filterStatus = null;
        if(status == 0 || status == 1) {
            filterStatus = status;
        }
        if(type == "") {
            entities = dishRepository.findByFilters(name,filterStatus,null);
        } else {
            entities = dishRepository.findByFilters(name,filterStatus,type);
        }


        dtos = Arrays.asList(dishModelMapper.map(entities,DishDto[].class));
        for(DishDto dto : dtos) {
            if(favoriteRepository.findByUserIdAndRecipeId(userId, dto.getId()) != null) {
                dto.setFavorite(1);
            } else {
                dto.setFavorite(0);
            }
        }
        dtos.sort(Comparator.comparing(DishDto::getFavorite).reversed());
        return dtos;
    }

    public void save(DishDto dishDto) {
        if(dishRepository.findByName(dishDto.getName()) != null) {
            throw new DuplicateException("Đã có món ăn này ");
        }
        DishEntity entity = dishModelMapper.map(dishDto, DishEntity.class);
        entity.setCreateAt(now());
        entity = dishRepository.save(entity);
        for(DishIngredientsDto ingredient : dishDto.getIngredients()) {

            DishIngredientsEntity dishIngredient = new DishIngredientsEntity();
            dishIngredient.setDishId(entity.getId());
            dishIngredient.setIngredientsId(ingredient.getIngredient().getId());
            dishIngredient.setQuantity(ingredient.getQuantity());
            dishIngredient.setMeasure(ingredient.getMeasure());
            dishIngredientRepository.save(dishIngredient);
        }
    }
    public List<String> getAllDishTypes() {
        return dishRepository.findDistinctType();
    }
    public void addIngredientId(Integer dishId,Integer ingredientId,Integer quantity, String measure) {
        DishIngredientsEntity dishIngredient = new DishIngredientsEntity();
        if(dishIngredientRepository.findByDishIdAndIngredientsId(dishId, ingredientId) != null) {
            throw new DuplicateException("Đã có nguyên liệu này ");
        } else {
            dishIngredient.setDishId(dishId);
            dishIngredient.setIngredientsId(ingredientId);
            dishIngredient.setQuantity(quantity);
            dishIngredient.setMeasure(measure);
            dishIngredientRepository.save(dishIngredient);
        }

    }
    public void deleteDishIngredient(Integer id,Integer ingredientId) {
        DishIngredientsEntity dishIngredient = new DishIngredientsEntity();
        dishIngredient = dishIngredientRepository.findByDishIdAndIngredientsId(id, ingredientId);
        dishIngredientRepository.delete(dishIngredient);

    }
    public void deleteDish(Integer id) {
        DishEntity entity = dishRepository.findById(id).get();
        entity.setStatus(0);
        dishRepository.save(entity);
    }
    public List<DishDto> findDishs(String search) {
        List<DishDto> dtos = new ArrayList<DishDto>();
        List<DishEntity> entities = dishRepository.findByNameContaining(search);
        dtos = Arrays.asList(dishModelMapper.map(entities,DishDto[].class));
        return dtos;
    }
    public void activeDish(Integer id) {
        DishEntity entity = dishRepository.findById(id).get();
        entity.setUpdateAt(now());
        entity.setStatus(1);
        dishRepository.save(entity);
    }


}
