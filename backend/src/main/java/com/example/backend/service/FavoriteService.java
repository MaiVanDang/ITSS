package com.example.backend.service;

import com.example.backend.dtos.DishDto;
import com.example.backend.entities.DishEntity;
import com.example.backend.entities.FavoriteEntity;
import com.example.backend.exception.DuplicateException;
import com.example.backend.exception.NotFoundException;
import com.example.backend.repository.DishRepository;
import com.example.backend.repository.FavoriteRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FavoriteService {
    private final DishRepository dishRepository;
    private final FavoriteRepository favoriteRepository;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;
    public List<DishDto> getFavoriteDishesByUser(Integer userId) {
        List<FavoriteEntity> favorites = favoriteRepository.findByUserId(userId);
        List<DishDto> favoriteDishes = new ArrayList<DishDto>();
        for(FavoriteEntity favorite : favorites) {
            DishEntity dish = dishRepository.findById(favorite.getRecipeId()).get();
            DishDto favoriteDish = modelMapper.map(dish, DishDto.class);
            favoriteDish.setFavorite(1);
            favoriteDishes.add(favoriteDish);
        }
        return favoriteDishes;

    }
    public void addDishFavorite(Integer userId, Integer dishId) {
        FavoriteEntity entity = new FavoriteEntity();
        if(favoriteRepository.findByUserIdAndRecipeId(userId, dishId) != null) {
            throw new DuplicateException("Đã thích món ăn này");
        } else {
            entity.setRecipeId(dishId);
            entity.setUserId(userId);
            favoriteRepository.save(entity);
        }

    }
    public void removeFavoriteDish(Integer userId, Integer dishId) {
        FavoriteEntity entity = favoriteRepository.findByUserIdAndRecipeId(userId, dishId);
        if(entity == null) {
            throw new NotFoundException("Không thấy món ăn này trong danh sách yêu thích");
        } else {

            favoriteRepository.deleteById(entity.getId());
        }
    }
    public List<DishDto> findDish(String findString,Integer userId) {
        List<DishEntity> entities = dishRepository.findByFilters(findString,null,null);
        for(DishEntity entity : entities) {
            if(favoriteRepository.findByUserIdAndRecipeId(userId,entity.getId()) == null) {
                entities.remove(entity);
            }
        }
        List<DishDto> entitiesDto = Arrays.asList(modelMapper.map(entities, DishDto[].class));
        return entitiesDto;
    }

}
