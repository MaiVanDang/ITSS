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

    public FridgeDto getDetailGroupFridge(Integer groupId) {

        FridgeEntity entity = fridgeRepository.findByGroupId(groupId);
        FridgeDto dto = new FridgeDto();
        dto = modelMapper.map(entity, FridgeDto.class);

        GroupEntity groupEntity = groupRepository.findById(entity.getGroupId()).get();
        GroupDto groupDto = modelMapper.map(groupEntity, GroupDto.class);

        UserEntity userLeader = userRepository.findById(entity.getUserId()).get();
        UserDto userLeaderDto = modelMapper.map(userLeader, UserDto.class);

        groupDto.setLeader(userLeaderDto);
        dto.setGroup(groupDto);

        List<FridgeIngredientsDto> ingredientsDtos = new ArrayList<FridgeIngredientsDto>();
        List<FridgeIngredientsEntity> ingredients = fridgeIngredientsRepository.findByFridgeId(entity.getId());
        for (FridgeIngredientsEntity ingredientFridge : ingredients) {
            IngredientsEntity ingredient = ingredientRepository.findById(ingredientFridge.getIngredientsId()).get();
            IngredientsDto ingredientsDto = modelMapper.map(ingredient, IngredientsDto.class);
            FridgeIngredientsDto fridgeDto = modelMapper.map(ingredientFridge, FridgeIngredientsDto.class);
            // Chuyển đổi đơn vị đo lường sang số lượng
            fridgeDto.setQuantityDouble(convertMeasureToQuantityResponse(ingredientFridge.getMeasure(),
                    ingredientFridge.getQuantity()));
            fridgeDto.setIngredient(ingredientsDto);

            if (ingredientFridge.getUserbuyid() != null) {
                UserEntity userBuy = userRepository.findById(ingredientFridge.getUserbuyid()).get();
                UserDto userBuyDto = modelMapper.map(userBuy, UserDto.class);
                fridgeDto.setUseBuy(userBuyDto);
                fridgeDto.setUserBuyName(userBuyDto.getName());
            }

            ingredientsDtos.add(fridgeDto);
        }
        dto.setIngredients(ingredientsDtos);
        return dto;
    }

    public FridgeDto getDetailUserFridge(Integer id) {

        // Tìm entity tủ lạnh
        List<FridgeEntity> fridgeEntity = fridgeRepository.findByUserId(id);
        FridgeEntity entity = null;
        for (FridgeEntity fridge : fridgeEntity) {
            if (fridge.getType() == 0) {
                entity = fridge;
                break;
            }
        }

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
            // Chuyển đổi đơn vị đo lường sang số lượng
            fridgeDto.setQuantityDouble(convertMeasureToQuantityResponse(ingredientFridge.getMeasure(),
                    ingredientFridge.getQuantity()));
            fridgeDto.setIngredient(ingredientsDto);
            ingredientsDtos.add(fridgeDto);
        }

        dto.setIngredients(ingredientsDtos);
        return dto;
    }

    public void useIngredient(Integer fridgeIngredientId, Double quantityDouble, String unit) {
        FridgeIngredientsEntity entity = fridgeIngredientsRepository.findById(fridgeIngredientId).get();
        // Chuyển đổi đơn vị đo lường
        Integer quantity = convertMeasureToQuantity(unit, quantityDouble);
        // Kiểm tra số lượng có đủ không
        if (entity.getQuantity() < quantity) {
            throw new NotCanDoException("Số lượng nguyên liệu không đủ");
        }
        // Cập nhật số lượng
        if (entity.getQuantity() - quantity == 0) {
            fridgeIngredientsRepository.delete(entity);
        }
        entity.setQuantity(entity.getQuantity() - quantity);
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

    public void addIngredientsFromStore(StoreDto storeDto, Integer userId) {

        StoreEntity storeEntity = storeRepository.findById(storeDto.getStoreId()).get();
        List<FridgeEntity> fridgeEntities = fridgeRepository.findByUserId(userId);

        if (storeEntity.getGroupId() == null) {
            IngredientsEntity ingredient = ingredientRepository.findById(storeDto.getIngredientsId()).get();
            LocalDate newExpridedAt = calculateNewExpiryDate(storeDto.getExpridedAt(), ingredient);
            FridgeEntity entity = new FridgeEntity();
            for (FridgeEntity fridgeEntity : fridgeEntities) {
                if (fridgeEntity.getGroupId() == null) {
                    entity = fridgeEntity;
                    break;
                }
            }
            FridgeIngredientsEntity oldFridgeIngredientsEntity = fridgeIngredientsRepository
                    .findByExpridedAndFridgeIdAndIngredientsId(newExpridedAt, entity.getId(),
                            storeDto.getIngredientsId());
            if (oldFridgeIngredientsEntity != null) {
                // Nếu nguyên liệu đã tồn tại trong tủ lạnh, cộng dồn số lượng
                oldFridgeIngredientsEntity
                        .setQuantity(oldFridgeIngredientsEntity.getQuantity() + storeDto.getQuantity().intValue());
                fridgeIngredientsRepository.save(oldFridgeIngredientsEntity);
            } else {
                // Nếu nguyên liệu chưa tồn tại, tạo mới
                FridgeIngredientsEntity newFridgeIngredient = new FridgeIngredientsEntity();
                newFridgeIngredient.setIngredientsId(storeDto.getIngredientsId());
                newFridgeIngredient.setFridgeId(entity.getId());
                newFridgeIngredient.setQuantity(storeDto.getQuantity().intValue());
                newFridgeIngredient.setMeasure(storeDto.getMeasure());
                newFridgeIngredient.setExprided(newExpridedAt);
                newFridgeIngredient.setCreateAt(now());
                fridgeIngredientsRepository.save(newFridgeIngredient);
            }
            // Cập nhật số lượng trong kho
            storeRepository.delete(storeEntity);
        } else {
            FridgeEntity fridgeEntity = fridgeRepository.findByGroupId(storeEntity.getGroupId());
            IngredientsEntity ingredient = ingredientRepository.findById(storeDto.getIngredientsId()).get();
            LocalDate newExpridedAt = calculateNewExpiryDate(storeDto.getExpridedAt(), ingredient);
            FridgeIngredientsEntity oldFridgeIngredientsEntity = fridgeIngredientsRepository
                    .findByExpridedAndFridgeIdAndIngredientsId(newExpridedAt, fridgeEntity.getId(),
                            storeDto.getIngredientsId());
            if (oldFridgeIngredientsEntity != null) {
                // Nếu nguyên liệu đã tồn tại trong tủ lạnh, cộng dồn số lượng
                oldFridgeIngredientsEntity
                        .setQuantity(oldFridgeIngredientsEntity.getQuantity() + storeDto.getQuantity().intValue());
                fridgeIngredientsRepository.save(oldFridgeIngredientsEntity);
            } else {
                // Nếu nguyên liệu chưa tồn tại, tạo mới
                FridgeIngredientsEntity newFridgeIngredient = new FridgeIngredientsEntity();
                newFridgeIngredient.setIngredientsId(storeDto.getIngredientsId());
                newFridgeIngredient.setFridgeId(fridgeEntity.getId());
                newFridgeIngredient.setQuantity(storeDto.getQuantity().intValue());
                newFridgeIngredient.setMeasure(storeDto.getMeasure());
                newFridgeIngredient.setExprided(newExpridedAt);
                newFridgeIngredient.setCreateAt(now());
                fridgeIngredientsRepository.save(newFridgeIngredient);
            }
            // Cập nhật số lượng trong kho
            storeRepository.delete(storeEntity);
        }

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
            oldFridgeIngredientsEntity.setQuantity(
                    oldFridgeIngredientsEntity.getQuantity() + convertMeasureToQuantity(measure, (double) quantity));
            fridgeIngredientsRepository.save(oldFridgeIngredientsEntity);
        } else {
            // Nếu nguyên liệu chưa tồn tại, tạo mới
            FridgeIngredientsEntity newFridgeIngredient = new FridgeIngredientsEntity();
            newFridgeIngredient.setIngredientsId(ingredientId);
            newFridgeIngredient.setFridgeId(fridgeId);
            newFridgeIngredient.setQuantity(convertMeasureToQuantity(measure, (double) quantity));
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
            storeEntity.setQuantity(storeEntity.getQuantity()
                    .subtract(BigDecimal.valueOf(convertMeasureToQuantity(measure, (double) quantity))));
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

    private int convertMeasureToQuantity(String measure, Double quantityDouble) {
        int quantity = 0;
        // Chuyển đổi đơn vị đo lường
        // Ví dụ: từ gram sang kg, từ ml sang lít, v.v.
        if (measure.equals("kg")) {
            // Chuyển đổi gram sang kg
            quantity = (int) (quantityDouble * 1000); // Ví dụ chuyển đổi gram sang g
        } else if (measure.equals("tấn")) {
            // Chuyển đổi tấn sang kg
            quantity = (int) (quantityDouble * 1000000); // Ví dụ chuyển đổi tấn sang g
        } else if (measure.equals("tạ")) {
            // Chuyển đổi tạ sang kg
            quantity = (int) (quantityDouble * 100000); // Ví dụ chuyển đổi tạ sang g
        } else if (measure.equals("yến")) {
            // Chuyển đổi yến sang kg
            quantity = (int) (quantityDouble * 10000); // Ví dụ chuyển đổi yến sang g
        } else if (measure.equals("lít")) {
            // Chuyển đổi từ lít sang ml
            quantity = (int) (quantityDouble * 1000); // Ví dụ chuyển đổi lít sang ml
        } else if (measure.equals("cốc")) {
            // Giả sử 1 cốc = 240 ml
            quantity = (int) (quantityDouble * 240); // Ví dụ chuyển đổi cốc sang ml
        } else if (measure.equals("thìa")) {
            // Giả sử 1 thìa = 15 ml
            quantity = (int) (quantityDouble * 15); // Ví dụ chuyển đổi thìa sang ml
        } else if (measure.equals("muỗng")) {
            // Giả sử 1 muỗng = 10 ml
            quantity = (int) (quantityDouble * 10); // Ví dụ chuyển đổi muỗng sang ml
        } else if (measure.equals("chai")) {
            // Giả sử 1 chai = 1000 ml
            quantity = (int) (quantityDouble * 1000); // Ví dụ chuyển đổi chai sang ml
        } else {
            // Giả sử các đơn vị khác không cần chuyển đổi
            quantity = (int) Math.round(quantityDouble); // Làm tròn về số nguyên
        }
        // Trả về số lượng tương ứng với đơn vị đo lường đã chuyển đổi
        return quantity; // Placeholder, cần implement logic chuyển đổi thực tế
    }

}
