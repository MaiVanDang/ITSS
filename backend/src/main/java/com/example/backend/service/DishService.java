package com.example.backend.service;

import com.example.backend.dtos.DishDto;
import com.example.backend.dtos.DishIngredientsDto;
import com.example.backend.dtos.IngredientsDto;
import com.example.backend.entities.DishEntity;
import com.example.backend.entities.DishIngredientsEntity;
import com.example.backend.entities.FridgeEntity;
import com.example.backend.entities.FridgeIngredientsEntity;
import com.example.backend.entities.IngredientsEntity;
import com.example.backend.entities.StoreEntity;
import com.example.backend.exception.DuplicateException;
import com.example.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.*;

import static java.time.LocalDate.now;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class DishService {
    private final DishRepository dishRepository;
    private final DishIngredientsRepository dishIngredientRepository;
    private final ModelMapper dishModelMapper;
    private final FavoriteRepository favoriteRepository;
    private final IngredientsRepository ingredientsRepository;
    private final StoreRepository storeRepository;
    private final FridgeRepository fridgeRepository;
    private final FridgeIngredientsRepository fridgeIngredientsRepository;

    public List<DishDto> getAllDishes(Integer userId) {
        List<DishDto> dtos = new ArrayList<DishDto>();
        List<DishEntity> entities = dishRepository.findAll();

        dtos = Arrays.asList(dishModelMapper.map(entities, DishDto[].class));
        for (DishDto dto : dtos) {
            if (favoriteRepository.findByUserIdAndRecipeId(userId, dto.getId()) != null) {
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
        dto = dishModelMapper.map(entity, DishDto.class);
        List<DishIngredientsEntity> ingredients = dishIngredientRepository.findByDishId(entity.getId());
        for (DishIngredientsEntity ingredient : ingredients) {
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

    public DishDto getDetailDishById(Integer dishId, Integer userId) {
        DishEntity dishEntity = dishRepository.findById(dishId)
                .orElseThrow(() -> new RuntimeException("Dish not found"));
        DishDto dto = dishModelMapper.map(dishEntity, DishDto.class);
        List<DishIngredientsEntity> ingredients = dishIngredientRepository.findByDishId(dishEntity.getId());
        List<DishIngredientsDto> ingredientsDtos = new ArrayList<>();

        for (DishIngredientsEntity ingredient : ingredients) {
            IngredientsEntity ingredientsEntity = ingredientsRepository.findById(ingredient.getIngredientsId())
                    .orElseThrow(() -> new RuntimeException("Ingredient not found"));
            IngredientsDto ingredientDto = dishModelMapper.map(ingredientsEntity, IngredientsDto.class);
            DishIngredientsDto dishIngredientsDto = new DishIngredientsDto();
            dishIngredientsDto.setIngredient(ingredientDto);
            dishIngredientsDto.setQuantity(ingredient.getQuantity());
            dishIngredientsDto.setMeasure(ingredient.getMeasure());
            int checkQuantity = checkQuantityIngredient(userId, ingredient.getIngredientsId(),
                    ingredient.getQuantity(), ingredient.getMeasure());
            dishIngredientsDto.setCheckQuantity(checkQuantity);
            ingredientsDtos.add(dishIngredientsDto);
        }
        dto.setIngredients(ingredientsDtos);
        return dto;
    }

    public List<DishDto> getDishByFilter(String name, Integer status, String type, Integer userId) {
        List<DishDto> dtos = new ArrayList<DishDto>();
        List<DishEntity> entities = new ArrayList<DishEntity>();
        Integer filterStatus = null;
        if (status == 0 || status == 1) {
            filterStatus = status;
        }
        if (type == "") {
            entities = dishRepository.findByFilters(name, filterStatus, null);
        } else {
            entities = dishRepository.findByFilters(name, filterStatus, type);
        }

        dtos = Arrays.asList(dishModelMapper.map(entities, DishDto[].class));
        for (DishDto dto : dtos) {
            if (favoriteRepository.findByUserIdAndRecipeId(userId, dto.getId()) != null) {
                dto.setFavorite(1);
            } else {
                dto.setFavorite(0);
            }
        }
        dtos.sort(Comparator.comparing(DishDto::getFavorite).reversed());
        return dtos;
    }

    public void save(DishDto dishDto) {
        if (dishRepository.findByName(dishDto.getName()) != null) {
            throw new DuplicateException("Đã có món ăn này ");
        }
        DishEntity entity = dishModelMapper.map(dishDto, DishEntity.class);
        entity.setCreateAt(now());
        entity = dishRepository.save(entity);
        for (DishIngredientsDto ingredient : dishDto.getIngredients()) {

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

    public void addIngredientId(Integer dishId, Integer ingredientId, Integer quantity, String measure) {
        DishIngredientsEntity dishIngredient = new DishIngredientsEntity();
        if (dishIngredientRepository.findByDishIdAndIngredientsId(dishId, ingredientId) != null) {
            throw new DuplicateException("Đã có nguyên liệu này ");
        } else {
            dishIngredient.setDishId(dishId);
            dishIngredient.setIngredientsId(ingredientId);
            dishIngredient.setQuantity(quantity);
            dishIngredient.setMeasure(measure);
            dishIngredientRepository.save(dishIngredient);
        }

    }

    public void deleteDishIngredient(Integer id, Integer ingredientId) {
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
        dtos = Arrays.asList(dishModelMapper.map(entities, DishDto[].class));
        return dtos;
    }

    public void activeDish(Integer id) {
        DishEntity entity = dishRepository.findById(id).get();
        entity.setUpdateAt(now());
        entity.setStatus(1);
        dishRepository.save(entity);
    }

    public int checkQuantityIngredient(Integer userId, Integer ingredientId, int quantity, String measure) {
        int chekck = 0;
        boolean isStore = false;
        boolean isFridge = false;
        // Kiểm tra trong nhà kho theo cá nhân
        List<StoreEntity> storeEntity = storeRepository.findByUserIdAndIngredientId(userId, ingredientId);
        if (storeEntity != null && !storeEntity.isEmpty()) {
            for (StoreEntity store : storeEntity) {
                // Chuyển đổi đơn vị đo lường nếu cần
                int convertedQuantity = convertMeasureToQuantity(store.getMeasure(), store.getQuantity().intValue());
                quantity = convertMeasureToQuantity(measure, quantity);
                if (convertedQuantity >= quantity && !isExpridedAt(store.getExpridedAt())) {
                    // Nếu số lượng trong kho đủ và chưa hết hạn
                    isStore = true; // Tồn tại đủ số lượng trong kho
                    break;
                }
            }
        }

        List<FridgeEntity> fridgeEntity = fridgeRepository.findByUserId(userId);
        int newFridgeId = 0;
        for (FridgeEntity fridge : fridgeEntity) {
            if (fridge.getGroupId() == null || fridge.getGroupId() == 0) {
                newFridgeId = fridge.getId();
                break;
            }
        }
        List<FridgeIngredientsEntity> fridgeIngredients = fridgeIngredientsRepository
                .findByFridgeIdAndIngredientsId(newFridgeId, ingredientId);
        if (fridgeIngredients != null && !fridgeIngredients.isEmpty()) {
            for (FridgeIngredientsEntity fridgeIngredient : fridgeIngredients) {
                // Chuyển đổi đơn vị đo lường nếu cần
                int convertedQuantity = convertMeasureToQuantity(fridgeIngredient.getMeasure(),
                        fridgeIngredient.getQuantity());
                quantity = convertMeasureToQuantity(measure, quantity);
                if (convertedQuantity >= quantity && !isExpridedAt(fridgeIngredient.getExprided())) {
                    // Nếu số lượng trong tủ lạnh đủ và chưa hết hạn
                    isFridge = true; // Tồn tại đủ số lượng trong tủ lạnh
                    break;
                }
            }
        }
        // Nếu tồn tại ở cả 2 nơi theo cá nhân
        if (isStore && isFridge) {
            chekck = 3; // Tồn tại đủ số lượng trong cả kho và tủ lạnh
        } else if (isFridge) {
            chekck = 2; // Tồn tại đủ số lượng trong tủ lạnh
        } else if (isStore) {
            chekck = 1; // Tồn tại đủ số lượng trong tủ kho
        } else {
            chekck = 0; // Không tồn tại đủ số lượng trong cả kho và tủ lạnh
        }
        return chekck;
    }

    private int convertMeasureToQuantity(String measure, int quantity) {
        // Chuyển đổi đơn vị đo lường
        // Ví dụ: từ gram sang kg, từ ml sang lít, v.v.
        if (measure.equals("kg")) {
            // Chuyển đổi gram sang kg
            quantity = quantity * 1000; // Ví dụ chuyển đổi gram sang g
        } else if (measure.equals("tấn")) {
            // Chuyển đổi tấn sang kg
            quantity = quantity * 1000000; // Ví dụ chuyển đổi tấn sang g
        } else if (measure.equals("tạ")) {
            // Chuyển đổi tạ sang kg
            quantity = quantity * 100000; // Ví dụ chuyển đổi tạ sang g
        } else if (measure.equals("yến")) {
            // Giữ nguyên nếu là gam
            quantity = quantity * 10000; // Ví dụ chuyển đổi yến sang g
        } else if (measure.equals("lít")) {
            quantity = quantity * 1000; // Ví dụ chuyển đổi lít sang ml
        } else if (measure.equals("cốc")) {
            // Giả sử 1 cốc = 240 ml
            quantity = quantity * 240; // Ví dụ chuyển đổi cốc sang ml
        } else if (measure.equals("thìa")) {
            // Giả sử 1 thìa = 15 ml
            quantity = quantity * 15; // Ví dụ chuyển đổi thìa sang ml
        } else if (measure.equals("muỗng")) {
            // Giả sử 1 muỗng = 10 ml
            quantity = quantity * 10; // Ví dụ chuyển đổi muỗng sang ml
        } else if (measure.equals("chai")) {
            quantity = quantity * 1000; // Giả sử 1 chai = 1000 ml
        }
        // Trả về số lượng tương ứng với đơn vị đo lường đã chuyển đổi
        return quantity; // Placeholder, cần implement logic chuyển đổi thực tế
    }

    private Double convertMeasureToQuantityResponse(String measure, int quantity) {
        // Chuyển đổi đơn vị đo lường cho phản hồi
        // Ví dụ: từ gram sang kg, từ ml sang lít, v.v.
        double quantityDouble = (double) quantity;

        if (measure.equals("kg")) {
            // Giữ nguyên nếu là kg
            quantityDouble = (double) quantity; // Không cần chuyển đổi
        } else if (measure.equals("g")) {
            // Chuyển đổi gram sang kg
            quantityDouble = ((double) quantity) / 1000; // Ví dụ chuyển đổi g sang kg
        } else if (measure.equals("lít")) {
            // Giữ nguyên nếu là lít
            quantityDouble = (double) quantity; // Không cần chuyển đổi
        } else if (measure.equals("ml")) {
            // Chuyển đổi ml sang lít
            quantityDouble = ((double) quantity) / 1000; // Ví dụ chuyển đổi ml sang lít
        } else if (measure.equals("cốc")) {
            // Giả sử 1 cốc = 240 ml
            quantityDouble = ((double) quantity) / 240; // Ví dụ chuyển đổi cốc sang lít
        } else if (measure.equals("chai")) {
            quantityDouble = ((double) quantity) / 1000; // Giả sử 1 chai = 1000 ml
        }
        // Trả về số lượng tương ứng với đơn vị đo lường đã chuyển đổi
        return quantityDouble; // Placeholder, cần implement logic chuyển đổi thực tế
    }

    private boolean isExpridedAt(LocalDate expiredAt) {
        // Kiểm tra xem ngày hết hạn đã qua chưa
        return expiredAt.isBefore(now());
    }

}
