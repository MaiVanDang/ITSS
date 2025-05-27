package com.example.backend.service;

import com.example.backend.dtos.*;
import com.example.backend.entities.*;
import com.example.backend.exception.NotCanDoException;
import com.example.backend.repository.*;

import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

import static java.time.LocalDate.now;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class FridgeService {
    private final GroupRepository groupRepository;
    private final FridgeRepository fridgeRepository;
    private final StoreRepository storeRepository;
    private final UserRepository userRepository;
    private final FridgeIngredientsRepository fridgeIngredientsRepository;
    private final IngredientsRepository ingredientRepository;
    private final ShoppingAttributeRepository shoppingAttributeRepository;
    private final ModelMapper modelMapper;

    public FridgeDto getDetailGroupFridge(Integer id) {

        FridgeEntity entity = fridgeRepository.findByGroupId(id);
        FridgeDto dto = new FridgeDto();
        dto = modelMapper.map(entity, FridgeDto.class);
        if (entity.getGroupId() != null) {

            GroupEntity groupEntity = groupRepository.findById(entity.getGroupId()).get();
            GroupDto groupDto = modelMapper.map(groupEntity, GroupDto.class);
            UserEntity leader = userRepository.findById(groupEntity.getLeader()).get();
            UserDto userDto = modelMapper.map(leader, UserDto.class);
            groupDto.setLeader(userDto);
            dto.setGroup(groupDto);
        } else {
            UserEntity user = userRepository.findById(entity.getUserId()).get();
            UserDto userDto = modelMapper.map(user, UserDto.class);
            dto.setUser(userDto);
        }

        List<FridgeIngredientsDto> ingredientsDtos = new ArrayList<FridgeIngredientsDto>();
        List<FridgeIngredientsEntity> ingredients = fridgeIngredientsRepository.findByFridgeId(entity.getId());
        for (FridgeIngredientsEntity ingredientFridge : ingredients) {
            IngredientsEntity ingredient = ingredientRepository.findById(ingredientFridge.getIngredientsId()).get();
            IngredientsDto ingredientsDto = modelMapper.map(ingredient, IngredientsDto.class);
            FridgeIngredientsDto fridgeDto = modelMapper.map(ingredientFridge, FridgeIngredientsDto.class);
            fridgeDto.setIngredient(ingredientsDto);
            ingredientsDtos.add(fridgeDto);
        }
        dto.setIngredients(ingredientsDtos);
        return dto;
    }

    public FridgeDto getDetailUserFridge(Integer id) {

        // Tìm entity tủ lạnh
        FridgeEntity entity = fridgeRepository.findByUserId(id);

        // Map sang DTO
        FridgeDto dto = new FridgeDto();
        dto = modelMapper.map(entity, FridgeDto.class);
        if (entity.getGroupId() != null) {
            GroupEntity groupEntity = groupRepository.findById(entity.getGroupId()).get();
            GroupDto groupDto = modelMapper.map(groupEntity, GroupDto.class);
            UserEntity leader = userRepository.findById(groupEntity.getLeader()).get();
            UserDto userDto = modelMapper.map(leader, UserDto.class);
            groupDto.setLeader(userDto);
            dto.setGroup(groupDto);
        } else {
            UserEntity user = userRepository.findById(entity.getUserId()).get();
            UserDto userDto = modelMapper.map(user, UserDto.class);
            dto.setUser(userDto);
        }

        List<FridgeIngredientsDto> ingredientsDtos = new ArrayList<FridgeIngredientsDto>();
        List<FridgeIngredientsEntity> ingredients = fridgeIngredientsRepository.findByFridgeId(entity.getId());

        for (FridgeIngredientsEntity ingredientFridge : ingredients) {
            IngredientsEntity ingredient = ingredientRepository.findById(ingredientFridge.getIngredientsId()).get();
            IngredientsDto ingredientsDto = modelMapper.map(ingredient, IngredientsDto.class);
            FridgeIngredientsDto fridgeDto = modelMapper.map(ingredientFridge, FridgeIngredientsDto.class);
            fridgeDto.setIngredient(ingredientsDto);
            ingredientsDtos.add(fridgeDto);
        }

        dto.setIngredients(ingredientsDtos);
        return dto;
    }

    public void useIngredient(Integer fridgeIngredientId, Integer quantityUsed) {
        FridgeIngredientsEntity entity = fridgeIngredientsRepository.findById(fridgeIngredientId).get();
        if (entity.getQuantity() < quantityUsed) {
            throw new NotCanDoException("Trong tủ lạnh chỉ còn " + entity.getQuantity() + " " + entity.getMeasure());
        }
        entity.setQuantity(entity.getQuantity() - quantityUsed);
        fridgeIngredientsRepository.save(entity);
    }

    public void deleteFridge(Integer id) {
        fridgeRepository.deleteById(id);
    }

    public void addNewFridge(FridgeDto newFridge) {
        FridgeEntity newFridgeEntity = modelMapper.map(newFridge, FridgeEntity.class);
        if (newFridge.getUser() != null) {
            newFridgeEntity.setUserId(newFridge.getUser().getId());
        } else {
            newFridgeEntity.setGroupId(newFridge.getGroup().getId());
        }
        fridgeRepository.save(newFridgeEntity);
    }

    public void addIngredientsFromStore(StoreDto storeDto, Integer fridgeId) {

        IngredientsEntity ingredient = ingredientRepository.findById(storeDto.getIngredientsId()).get();
        LocalDate newExpridedAt = calculateNewExpiryDate(storeDto.getExpridedAt(), ingredient);
        FridgeIngredientsEntity oldFridgeIngredientsEntity = fridgeIngredientsRepository
                .findByExpridedAndFridgeIdAndIngredientsId(newExpridedAt, fridgeId, storeDto.getIngredientsId());
        if (oldFridgeIngredientsEntity != null) {
            // Nếu nguyên liệu đã tồn tại trong tủ lạnh, cộng dồn số lượng
            oldFridgeIngredientsEntity
                    .setQuantity(oldFridgeIngredientsEntity.getQuantity() + storeDto.getQuantity().intValue());
            fridgeIngredientsRepository.save(oldFridgeIngredientsEntity);
        } else {
            // Nếu nguyên liệu chưa tồn tại, tạo mới
            FridgeIngredientsEntity newFridgeIngredient = new FridgeIngredientsEntity();
            newFridgeIngredient.setIngredientsId(storeDto.getIngredientsId());
            newFridgeIngredient.setFridgeId(fridgeId);
            newFridgeIngredient.setQuantity(storeDto.getQuantity().intValue());
            newFridgeIngredient.setMeasure(storeDto.getMeasure());
            newFridgeIngredient.setExprided(newExpridedAt);
            newFridgeIngredient.setCreateAt(now());
            fridgeIngredientsRepository.save(newFridgeIngredient);
        }
        // Cập nhật số lượng trong kho
        StoreEntity storeEntity = storeRepository.findByIngredientsIdAndBuyAtAndExpridedAt(
                storeDto.getIngredientsId(),
                storeDto.getBuyAt(),
                storeDto.getExpridedAt());

        storeRepository.delete(storeEntity);

    }

    public void addIngredientToFridge(Map<String, Object> request) {
        // Extract and validate each field individually
        Object fridgeIdObj = request.get("fridgeId");
        Object ingredientsIdObj = request.get("ingredientId");
        Object quantityObj = request.get("quantity");
        Object measureObj = request.get("measure");
        Object expridedObj = request.get("exprided");
        Object ingredientObj = request.get("ingredient");
        Object shoppingAttributeIdObj = request.get("shoppingAttributeId");

        Integer fridgeId = (fridgeIdObj instanceof Number) ? ((Number) fridgeIdObj).intValue() : null;
        Integer ingredientId = (ingredientsIdObj instanceof Number) ? ((Number) ingredientsIdObj).intValue() : null;
        Integer quantity = (quantityObj instanceof Number) ? ((Number) quantityObj).intValue() : null;
        String measure = (measureObj instanceof String) ? (String) measureObj : null;
        LocalDate exprided = (expridedObj instanceof String) ? LocalDate.parse((String) expridedObj) : null;
        IngredientsEntity ingredient = (ingredientObj instanceof Map)
                ? modelMapper.map(ingredientObj, IngredientsEntity.class)
                : null;
        LocalDate newExpridedAt = calculateNewExpiryDate(exprided, ingredient);
        Integer shoppingAttributeId = (shoppingAttributeIdObj instanceof Number)
                ? ((Number) shoppingAttributeIdObj).intValue()
                : null;

        FridgeIngredientsEntity oldFridgeIngredientsEntity = fridgeIngredientsRepository
                .findByExpridedAndFridgeIdAndIngredientsId(newExpridedAt, fridgeId, ingredientId);
        if (oldFridgeIngredientsEntity != null) {
            // Nếu nguyên liệu đã tồn tại trong tủ lạnh, cộng dồn số lượng
            oldFridgeIngredientsEntity.setQuantity(oldFridgeIngredientsEntity.getQuantity() + quantity);
            fridgeIngredientsRepository.save(oldFridgeIngredientsEntity);
        } else {
            // Nếu nguyên liệu chưa tồn tại, tạo mới
            FridgeIngredientsEntity newFridgeIngredient = new FridgeIngredientsEntity();
            newFridgeIngredient.setIngredientsId(ingredientId);
            newFridgeIngredient.setFridgeId(fridgeId);
            newFridgeIngredient.setQuantity(quantity);
            newFridgeIngredient.setMeasure(measure);
            newFridgeIngredient.setExprided(newExpridedAt);
            newFridgeIngredient.setCreateAt(now());
            fridgeIngredientsRepository.save(newFridgeIngredient);
        }
        // Cập nhật số lượng trong kho
        StoreEntity storeEntity = storeRepository.findByIngredientsIdAndExpridedAt(
                ingredientId,
                exprided);
        if (storeEntity != null) {
            storeEntity.setQuantity(storeEntity.getQuantity().subtract(BigDecimal.valueOf(quantity)));
            if (storeEntity.getQuantity().compareTo(BigDecimal.ZERO) <= 0) {
                storeRepository.delete(storeEntity);
            } else {
                storeRepository.save(storeEntity);
            }
        } else {
            throw new NotCanDoException("Nguyên liệu không có trong kho");
        }
        ShoppingAttributeEntity shoppingAttribute = shoppingAttributeRepository
                .findById(shoppingAttributeId).get();
        if (shoppingAttribute != null) {
            // Cập nhật shopping attribute nếu có
            shoppingAttribute.setStatusstore(false);
            shoppingAttributeRepository.save(shoppingAttribute);
        } else {
            throw new NotCanDoException("Shopping attribute không tồn tại");
        }
    }

    /**
     * Tính toán hạn sử dụng mới cho nguyên liệu khi đưa vào tủ lạnh
     * Quy tắc:
     * - Đồ tươi sắp hết hạn (0-2 ngày): thêm 2 ngày
     * - Đồ tươi còn hạn (>=3 ngày): thêm 7 ngày
     * - Nguyên liệu khô: luôn thêm 30 ngày
     */
    private LocalDate calculateNewExpiryDate(LocalDate originalExpiry, IngredientsEntity ingredient) {

        // Tính số ngày còn lại đến hạn sử dụng
        long daysUntilExpiry = ChronoUnit.DAYS.between(LocalDate.now(), originalExpiry);

        // Kiểm tra loại nguyên liệu
        boolean isDryIngredient = "DRY_INGREDIENT".equalsIgnoreCase(ingredient.getIngredientStatus());
        if (isDryIngredient) {
            // Nguyên liệu khô: luôn thêm 30 ngày
            return originalExpiry.plusDays(30);
        } else {
            // Nguyên liệu tươi
            System.out.println(ingredient.getIngredientStatus());
            System.out.println(daysUntilExpiry);
            System.out.println(originalExpiry);
            System.out.println(LocalDate.now());
            if (daysUntilExpiry >= 0 && daysUntilExpiry <= 2) {
                // Sắp hết hạn (0-2 ngày): thêm 2 ngày
                return originalExpiry.plusDays(2);
            } else {
                // Còn hạn (>=3 ngày): thêm 1 tuần
                return originalExpiry.plusDays(7);
            }
        }
    }

    public void addNewIngredientToFridge(Integer ingredientId, Integer fridgeId, Integer quantity, String measure) {
        IngredientsEntity ingredientsEntity = ingredientRepository.findById(ingredientId).get();

        FridgeIngredientsEntity ingredientEntity = new FridgeIngredientsEntity();
        ingredientEntity.setIngredientsId(ingredientId);
        ingredientEntity.setFridgeId(fridgeId);
        ingredientEntity.setQuantity(quantity);
        ingredientEntity.setMeasure(measure);
        ingredientEntity.setCreateAt(now());
        ingredientEntity.setExprided(now().plusDays(ingredientsEntity.getDueDate() * 3));
        fridgeIngredientsRepository.save(ingredientEntity);
    }

    public void autoDeleteIngredient(Integer id) {
        FridgeIngredientsEntity entity = fridgeIngredientsRepository.findById(id).get();
        if (entity.getQuantity() == 0) {
            fridgeIngredientsRepository.deleteById(entity.getId());
        }
    }
}
