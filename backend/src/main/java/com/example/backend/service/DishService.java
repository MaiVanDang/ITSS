package com.example.backend.service;

import com.example.backend.dtos.DishDto;
import com.example.backend.dtos.DishIngredientsDto;
import com.example.backend.dtos.IngredientsDto;
import com.example.backend.dtos.SupportDishDto;
import com.example.backend.entities.DishEntity;
import com.example.backend.entities.DishIngredientsEntity;
import com.example.backend.entities.FridgeEntity;
import com.example.backend.entities.FridgeIngredientsEntity;
import com.example.backend.entities.GroupEntity;
import com.example.backend.entities.GroupMemberEntity;
import com.example.backend.entities.IngredientsEntity;
import com.example.backend.entities.StoreEntity;
import com.example.backend.exception.DuplicateException;
import com.example.backend.repository.*;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

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
    private final GroupMemberRepository groupMemberRepository;
    private final GroupRepository groupRepository;

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

    private boolean isExpridedAt(LocalDate expiredAt) {
        // Kiểm tra xem ngày hết hạn đã qua chưa
        return expiredAt.isBefore(now());
    }

    private Double convertMeasureToQuantityResponse(String measure, int quantity) {
        double quantityDouble = (double) quantity;

        if (measure.equals("kg")) {
            // Chuyển đổi gram sang kg
            quantityDouble = (double) quantity / 1000;
        } else if (measure.equals("lít")) {
            // Chuyển đổi ml sang lít
            quantityDouble = (double) quantity / 1000;
        } else if (measure.equals("chai")) {
            // Giả sử chai là 1000ml
            quantityDouble = ((double) quantity) / 1000;
        } else {
            // Giả sử các đơn vị khác không cần chuyển đổi
            quantityDouble = (double) quantity;
        }
        return quantityDouble;
    }

    public DishDto getDetailDishById(Integer dishId, Integer userId) {
        // Tìm dish và throw custom exception thay vì RuntimeException
        DishEntity dishEntity = dishRepository.findById(dishId)
                .orElseThrow(() -> new EntityNotFoundException("Dish not found with id: " + dishId));

        DishDto dto = dishModelMapper.map(dishEntity, DishDto.class);

        // Lấy tất cả ingredients của dish một lần
        List<DishIngredientsEntity> ingredients = dishIngredientRepository.findByDishId(dishEntity.getId());
        if (ingredients.isEmpty()) {
            dto.setIngredients(new ArrayList<>());
            return dto;
        }

        // Lấy tất cả ingredient IDs để query batch
        Set<Integer> ingredientIds = ingredients.stream()
                .map(DishIngredientsEntity::getIngredientsId)
                .collect(Collectors.toSet());

        // Batch query ingredients thay vì query từng cái một
        Map<Integer, IngredientsEntity> ingredientsMap = ingredientsRepository
                .findAllById(ingredientIds)
                .stream()
                .collect(Collectors.toMap(IngredientsEntity::getId, Function.identity()));

        // Lấy group memberships một lần thay vì query nhiều lần
        List<GroupMemberEntity> userGroups = groupMemberRepository.findByUserId(userId);
        Set<Integer> groupIds = userGroups.stream()
                .map(GroupMemberEntity::getGroupId)
                .collect(Collectors.toSet());

        List<DishIngredientsDto> ingredientsDtos = new ArrayList<>();

        for (DishIngredientsEntity ingredient : ingredients) {
            IngredientsEntity ingredientsEntity = ingredientsMap.get(ingredient.getIngredientsId());
            if (ingredientsEntity == null) {
                throw new EntityNotFoundException("Ingredient not found with id: " + ingredient.getIngredientsId());
            }

            IngredientsDto ingredientDto = dishModelMapper.map(ingredientsEntity, IngredientsDto.class);
            DishIngredientsDto dishIngredientsDto = new DishIngredientsDto();
            dishIngredientsDto.setIngredient(ingredientDto);
            dishIngredientsDto.setQuantity(ingredient.getQuantity());
            dishIngredientsDto.setMeasure(ingredient.getMeasure());

            int checkQuantity = checkQuantityIngredient(userId, ingredient.getIngredientsId(),
                    ingredient.getQuantity(), ingredient.getMeasure(), true);
            dishIngredientsDto.setCheckQuantity(checkQuantity);

            if (checkQuantity == 0) {
                dishIngredientsDto.setSupportDishDto(null);
            } else {
                List<SupportDishDto> supportDishDtos = buildSupportDishDtos(userId, groupIds,
                        ingredient.getIngredientsId());
                dishIngredientsDto.setSupportDishDto(supportDishDtos);
            }

            ingredientsDtos.add(dishIngredientsDto);
        }

        dto.setIngredients(ingredientsDtos);
        return dto;
    }

    // Tách logic phức tạp thành method riêng
    private List<SupportDishDto> buildSupportDishDtos(Integer userId, Set<Integer> groupIds, Integer ingredientId) {
        List<SupportDishDto> supportDishDtos = new ArrayList<>();

        // Xử lý store cá nhân
        addPersonalStoreSupport(userId, ingredientId, supportDishDtos);

        // Xử lý store nhóm
        addGroupStoreSupport(groupIds, ingredientId, supportDishDtos);

        // Xử lý fridge cá nhân
        addPersonalFridgeSupport(userId, ingredientId, supportDishDtos);

        // Xử lý fridge nhóm
        addGroupFridgeSupport(groupIds, ingredientId, supportDishDtos);

        return supportDishDtos;
    }

    private void addPersonalStoreSupport(Integer userId, Integer ingredientId, List<SupportDishDto> supportDishDtos) {
        List<StoreEntity> storeEntities = storeRepository.findByUserIdAndIngredientId(userId, ingredientId);
        if (storeEntities != null && !storeEntities.isEmpty()) {
            double quantityPresent = 0.0;
            String measure = null;

            for (StoreEntity store : storeEntities) {
                if (!isExpridedAt(store.getExpridedAt()) && store.getGroupId() == null) {
                    quantityPresent += convertMeasureToQuantityResponse(store.getMeasure(),
                            store.getQuantity().intValue());
                    if (measure == null) {
                        measure = store.getMeasure();
                    }
                }
            }

            if (quantityPresent > 0) {
                SupportDishDto supportDishDto = new SupportDishDto();
                supportDishDto.setQuantityDoublePresent(quantityPresent);
                supportDishDto.setMeasure(measure);
                supportDishDto.setPositionName("Kho cá nhân");
                supportDishDtos.add(supportDishDto);
            }
        }
    }

    private void addGroupStoreSupport(Set<Integer> groupIds, Integer ingredientId,
            List<SupportDishDto> supportDishDtos) {
        for (Integer groupId : groupIds) {
            List<StoreEntity> storeEntities = storeRepository.findByGroupIdAndIngredientId(groupId, ingredientId);
            if (storeEntities != null && !storeEntities.isEmpty()) {
                double quantityPresent = 0.0;
                String measure = null;

                for (StoreEntity store : storeEntities) {
                    if (!isExpridedAt(store.getExpridedAt())) {
                        quantityPresent += convertMeasureToQuantityResponse(store.getMeasure(),
                                store.getQuantity().intValue());
                        if (measure == null) {
                            measure = store.getMeasure();
                        }
                    }
                }

                if (quantityPresent > 0) {
                    SupportDishDto supportDishDto = new SupportDishDto();
                    supportDishDto.setQuantityDoublePresent(quantityPresent);
                    supportDishDto.setMeasure(measure);

                    // Cache group information nếu cần thiết
                    GroupEntity group = groupRepository.findById(groupId)
                            .orElseThrow(() -> new EntityNotFoundException("Group not found with id: " + groupId));
                    supportDishDto.setPositionName(group.getName());
                    supportDishDtos.add(supportDishDto);
                }
            }
        }
    }

    private void addPersonalFridgeSupport(Integer userId, Integer ingredientId, List<SupportDishDto> supportDishDtos) {
        List<FridgeEntity> fridgeEntities = fridgeRepository.findByUserId(userId);

        // Tìm personal fridge
        Optional<FridgeEntity> personalFridge = fridgeEntities.stream()
                .filter(fridge -> fridge.getGroupId() == null || fridge.getGroupId() == 0)
                .findFirst();

        if (personalFridge.isPresent()) {
            List<FridgeIngredientsEntity> fridgeIngredients = fridgeIngredientsRepository
                    .findByFridgeIdAndIngredientsId(personalFridge.get().getId(), ingredientId);

            if (fridgeIngredients != null && !fridgeIngredients.isEmpty()) {
                double quantityPresent = 0.0;
                String measure = null;

                for (FridgeIngredientsEntity fridgeIngredient : fridgeIngredients) {
                    if (!isExpridedAt(fridgeIngredient.getExprided())) {
                        quantityPresent += convertMeasureToQuantityResponse(fridgeIngredient.getMeasure(),
                                fridgeIngredient.getQuantity().intValue());
                        if (measure == null) {
                            measure = fridgeIngredient.getMeasure();
                        }
                    }
                }

                if (quantityPresent > 0) {
                    SupportDishDto supportDishDto = new SupportDishDto();
                    supportDishDto.setQuantityDoublePresent(quantityPresent);
                    supportDishDto.setMeasure(measure);
                    supportDishDto.setPositionName("Tủ lạnh cá nhân");
                    supportDishDtos.add(supportDishDto);
                }
            }
        }
    }

    private void addGroupFridgeSupport(Set<Integer> groupIds, Integer ingredientId,
            List<SupportDishDto> supportDishDtos) {
        for (Integer groupId : groupIds) {
            try {
                FridgeEntity groupFridge = fridgeRepository.findByGroupId(groupId);
                if (groupFridge == null)
                    continue;

                List<FridgeIngredientsEntity> fridgeIngredients = fridgeIngredientsRepository
                        .findByFridgeIdAndIngredientsId(groupFridge.getId(), ingredientId);

                if (fridgeIngredients != null && !fridgeIngredients.isEmpty()) {
                    double quantityPresent = 0.0;
                    String measure = null;

                    for (FridgeIngredientsEntity fridgeIngredient : fridgeIngredients) {
                        if (!isExpridedAt(fridgeIngredient.getExprided())) {
                            quantityPresent += convertMeasureToQuantityResponse(fridgeIngredient.getMeasure(),
                                    fridgeIngredient.getQuantity().intValue());
                            if (measure == null) {
                                measure = fridgeIngredient.getMeasure();
                            }
                        }
                    }

                    if (quantityPresent > 0) {
                        SupportDishDto supportDishDto = new SupportDishDto();
                        supportDishDto.setQuantityDoublePresent(quantityPresent);
                        supportDishDto.setMeasure(measure);

                        GroupEntity group = groupRepository.findById(groupId)
                                .orElseThrow(() -> new EntityNotFoundException("Group not found with id: " + groupId));
                        supportDishDto.setPositionName(group.getName());
                        supportDishDtos.add(supportDishDto);
                    }
                }
            } catch (Exception e) {
                // Log lỗi và tiếp tục với group khác - có thể dùng System.out hoặc logger
                // framework
                System.err.println("Error processing group fridge for groupId: " + groupId + ", ingredientId: "
                        + ingredientId + " - " + e.getMessage());
                // Hoặc throw exception nếu muốn fail fast
                // throw new RuntimeException("Error processing group fridge", e);
            }
        }
    }

    public int checkQuantityIngredient(Integer userId, Integer ingredientId, int quantity, String measure,
            boolean isGroupContext) {
        quantity = convertMeasureToQuantity(measure, quantity);

        if (!isGroupContext) {
            // TH1: Chỉ xét cá nhân
            return checkPersonalQuantity(userId, ingredientId, quantity);
        } else {
            // TH2: Xét theo nhóm
            return checkGroupQuantity(userId, ingredientId, quantity);
        }
    }

    private int checkPersonalQuantity(Integer userId, Integer ingredientId, int requiredQuantity) {
        int totalPersonalQuantity = 0;

        // Tính tổng số lượng trong kho cá nhân
        totalPersonalQuantity += getPersonalStoreQuantity(userId, ingredientId);

        // Tính tổng số lượng trong tủ lạnh cá nhân
        totalPersonalQuantity += getPersonalFridgeQuantity(userId, ingredientId);

        return totalPersonalQuantity >= requiredQuantity ? 1 : 0;
    }

    private int checkGroupQuantity(Integer userId, Integer ingredientId, int requiredQuantity) {
        List<GroupMemberEntity> groupMemberEntities = groupMemberRepository.findByUserId(userId);

        if (groupMemberEntities == null || groupMemberEntities.isEmpty()) {
            // Nếu không có nhóm thì check cá nhân
            return checkPersonalQuantity(userId, ingredientId, requiredQuantity);
        }

        // Kiểm tra từng nhóm riêng biệt
        for (GroupMemberEntity groupMemberEntity : groupMemberEntities) {
            int groupId = groupMemberEntity.getGroupId();
            int totalGroupQuantity = 0;

            // Tính tổng số lượng trong kho nhóm
            totalGroupQuantity += getGroupStoreQuantity(groupId, ingredientId);

            // Tính tổng số lượng trong tủ lạnh nhóm
            totalGroupQuantity += getGroupFridgeQuantity(groupId, ingredientId);

            // Nếu nhóm đủ số lượng thì trả về 1
            if (totalGroupQuantity >= requiredQuantity) {
                return 1;
            }

            // Nếu nhóm thiếu, cộng thêm số lượng cá nhân
            int totalPersonalQuantity = getPersonalStoreQuantity(userId, ingredientId) +
                    getPersonalFridgeQuantity(userId, ingredientId);

            if (totalGroupQuantity + totalPersonalQuantity >= requiredQuantity) {
                return 1;
            }
        }

        return 0; // Không có nhóm nào đủ số lượng
    }

    private int getPersonalStoreQuantity(Integer userId, Integer ingredientId) {
        int totalQuantity = 0;
        List<StoreEntity> storeEntities = storeRepository.findByUserIdAndIngredientId(userId, ingredientId);

        if (storeEntities != null && !storeEntities.isEmpty()) {
            for (StoreEntity store : storeEntities) {
                if (!isExpridedAt(store.getExpridedAt()) && store.getGroupId() == null) {
                    int convertedQuantity = convertMeasureToQuantity(store.getMeasure(),
                            store.getQuantity().intValue());
                    totalQuantity += convertedQuantity;
                }
            }
        }
        return totalQuantity;
    }

    private int getPersonalFridgeQuantity(Integer userId, Integer ingredientId) {
        int totalQuantity = 0;
        List<FridgeEntity> fridgeEntities = fridgeRepository.findByUserId(userId);

        // Tìm personal fridge
        Optional<FridgeEntity> personalFridge = fridgeEntities.stream()
                .filter(fridge -> fridge.getGroupId() == null || fridge.getGroupId() == 0)
                .findFirst();

        if (personalFridge.isPresent()) {
            List<FridgeIngredientsEntity> fridgeIngredients = fridgeIngredientsRepository
                    .findByFridgeIdAndIngredientsId(personalFridge.get().getId(), ingredientId);

            if (fridgeIngredients != null && !fridgeIngredients.isEmpty()) {
                for (FridgeIngredientsEntity fridgeIngredient : fridgeIngredients) {
                    if (!isExpridedAt(fridgeIngredient.getExprided())) {
                        int convertedQuantity = convertMeasureToQuantity(fridgeIngredient.getMeasure(),
                                fridgeIngredient.getQuantity());
                        totalQuantity += convertedQuantity;
                    }
                }
            }
        }
        return totalQuantity;
    }

    private int getGroupStoreQuantity(Integer groupId, Integer ingredientId) {
        int totalQuantity = 0;
        List<StoreEntity> storeEntities = storeRepository.findByGroupIdAndIngredientId(groupId, ingredientId);

        if (storeEntities != null && !storeEntities.isEmpty()) {
            for (StoreEntity store : storeEntities) {
                if (!isExpridedAt(store.getExpridedAt())) {
                    int convertedQuantity = convertMeasureToQuantity(store.getMeasure(),
                            store.getQuantity().intValue());
                    totalQuantity += convertedQuantity;
                }
            }
        }
        return totalQuantity;
    }

    private int getGroupFridgeQuantity(Integer groupId, Integer ingredientId) {
        int totalQuantity = 0;

        try {
            FridgeEntity groupFridge = fridgeRepository.findByGroupId(groupId);
            if (groupFridge != null) {
                List<FridgeIngredientsEntity> fridgeIngredients = fridgeIngredientsRepository
                        .findByFridgeIdAndIngredientsId(groupFridge.getId(), ingredientId);

                if (fridgeIngredients != null && !fridgeIngredients.isEmpty()) {
                    for (FridgeIngredientsEntity fridgeIngredient : fridgeIngredients) {
                        if (!isExpridedAt(fridgeIngredient.getExprided())) {
                            int convertedQuantity = convertMeasureToQuantity(fridgeIngredient.getMeasure(),
                                    fridgeIngredient.getQuantity());
                            totalQuantity += convertedQuantity;
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Error getting group fridge quantity for groupId: " + groupId +
                    ", ingredientId: " + ingredientId + " - " + e.getMessage());
        }

        return totalQuantity;
    }

}
