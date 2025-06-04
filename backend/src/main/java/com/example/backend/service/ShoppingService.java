package com.example.backend.service;

import com.example.backend.dtos.*;
import com.example.backend.entities.*;
import com.example.backend.exception.DuplicateException;
import com.example.backend.exception.NotFoundException;
import com.example.backend.repository.*;
import lombok.RequiredArgsConstructor;

import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static java.time.LocalDate.now;

@Service
@RequiredArgsConstructor
public class ShoppingService {
    private static final Logger logger = LoggerFactory.getLogger(ShoppingService.class);
    private final ShoppingRepository shoppingRepository;
    private final StoreRepository storeRepository;
    private final DishIngredientsRepository dishIngredientsRepository;
    private final ShoppingAttributeRepository attributeRepository;
    private final DishAttributeRepository dishAttributeRepository;
    private final ModelMapper shoppingModelMapper;
    private final IngredientsRepository ingredientsRepository;
    private final GroupShoppingRepository groupShoppingRepository;
    private final UserRepository userRepository;
    private final DishRepository dishRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final FridgeRepository fridgeRepository;
    private final FridgeIngredientsRepository fridgeIngredientsRepository;

    public List<ShoppingDto> getAllShoppings() {
        List<ShoppingDto> dtos = new ArrayList<ShoppingDto>();
        List<ShoppingEntity> entities = shoppingRepository.findAll();
        dtos = Arrays.asList(shoppingModelMapper.map(entities, ShoppingDto[].class));
        return dtos;
    }

    public ShoppingDto getDetailShoppingById(Integer orderId) {
        // Get shopping entity with proper error handling
        ShoppingEntity entity = shoppingRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Shopping record with ID " + orderId + " not found"));

        // Get user entity with proper error handling
        UserEntity userShopping = userRepository.findById(entity.getUserId())
                .orElseThrow(() -> new NotFoundException("User with ID " + entity.getUserId() + " not found"));

        // Map entities to DTOs
        UserDto userShoppingDto = shoppingModelMapper.map(userShopping, UserDto.class);
        ShoppingDto shoppingDto = shoppingModelMapper.map(entity, ShoppingDto.class);
        shoppingDto.setUser(userShoppingDto);

        // Process shopping attributes
        List<ShoppingAttributeDto> attributeDtos = new ArrayList<>();
        List<ShoppingAttributeEntity> attributes = attributeRepository.findByShoppingId(entity.getId());

        for (ShoppingAttributeEntity attribute : attributes) {
            try {
                ShoppingAttributeDto attributeDto = shoppingModelMapper.map(attribute, ShoppingAttributeDto.class);

                // Get ingredient status with error handling
                String status = ingredientsRepository.findById(attributeDto.getIngredients().getId())
                        .map(ingredient -> ingredient.getIngredientStatus())
                        .orElse("UNKNOWN"); // Default status if ingredient not found
                attributeDto.setIngredientStatus(status);

                // Get user with error handling
                UserEntity user = userRepository.findById(attribute.getUserId())
                        .orElseThrow(() -> new NotFoundException(
                                "User with ID " + attribute.getUserId() + " not found"));
                UserDto userDto = shoppingModelMapper.map(user, UserDto.class);

                // Get ingredients with error handling
                IngredientsEntity ingredientsEntity = ingredientsRepository.findById(attribute.getIngredientsId())
                        .orElseThrow(() -> new NotFoundException(
                                "Ingredient with ID " + attribute.getIngredientsId() + " not found"));
                IngredientsDto ingredientsDto = shoppingModelMapper.map(ingredientsEntity, IngredientsDto.class);

                attributeDto.setUser(userDto);
                attributeDto.setIngredients(ingredientsDto);

                attributeDto.setCheckQuantity(checkQuantityIngredient(user.getId(),
                        attribute.getIngredientsId(), attribute.getQuantity().doubleValue(), attribute.getMeasure()));

                attributeDtos.add(attributeDto);
            } catch (Exception e) {
                // Log the error but continue processing other attributes
                System.err.println("Error processing attribute ID " + attribute.getId() + ": " + e.getMessage());
                // Optionally skip this attribute or add a default one
            }
        }

        // Process dish attributes
        List<DishAttributeDto> dishAttributeDtos = new ArrayList<>();
        List<DishAttributeEntity> dishAttributes = dishAttributeRepository.findByShoppingId(orderId);

        for (DishAttributeEntity dishAttribute : dishAttributes) {
            try {
                DishAttributeDto dishAttributeDto = shoppingModelMapper.map(dishAttribute, DishAttributeDto.class);

                // Get dish with error handling
                DishEntity dish = dishRepository.findById(dishAttribute.getDishId())
                        .orElseThrow(() -> new NotFoundException(
                                "Dish with ID " + dishAttribute.getDishId() + " not found"));
                DishDto dishDto = shoppingModelMapper.map(dish, DishDto.class);

                dishAttributeDto.setDish(dishDto);
                dishAttributeDtos.add(dishAttributeDto);
            } catch (Exception e) {
                // Log the error but continue processing other dishes
                System.err
                        .println("Error processing dish attribute ID " + dishAttribute.getId() + ": " + e.getMessage());
                // Optionally skip this dish or add a default one
            }
        }

        shoppingDto.setDishes(dishAttributeDtos);
        shoppingDto.setAttributes(attributeDtos);

        return shoppingDto;
    }

    public void addShopping(ShoppingDto shoppingDto) {

        // Code xử lý chính
        if (shoppingRepository.findByCode(shoppingDto.getCode()) != null) {
            System.out.println("LỖI: Mã đi chợ trùng lặp - " + shoppingDto.getCode());
            throw new DuplicateException("Mã đi chợ trùng lặp");
        } else {
            ShoppingEntity entity = shoppingModelMapper.map(shoppingDto, ShoppingEntity.class);
            entity.setUserId(shoppingDto.getUser().getId());
            entity.setCreateAt(now());
            entity.setStatus(0);

            entity = shoppingRepository.save(entity);

            List<DishIngredientsEntity> dishShoppingList = new ArrayList<DishIngredientsEntity>();

            for (DishAttributeDto dishAttributeDto : shoppingDto.getDishes()) {
                DishAttributeEntity dishAttribute = new DishAttributeEntity();
                dishAttribute = shoppingModelMapper.map(dishAttributeDto, DishAttributeEntity.class);
                dishAttribute.setShoppingId(entity.getId());
                dishAttribute.setDishId(dishAttributeDto.getDish().getId());
                dishAttribute.setQuantity(dishAttributeDto.getQuantity());
                dishAttribute.setCookStatus(0);
                dishAttribute.setCreateAt(now());

                dishAttributeRepository.save(dishAttribute);

                List<DishIngredientsEntity> dishDto = dishIngredientsRepository.findByDishId(dishAttribute.getDishId());
                dishShoppingList.addAll(dishDto);

                for (DishIngredientsEntity dishShopping : dishDto) {
                    ShoppingAttributeEntity oldAttribute = attributeRepository
                            .findByShoppingIdAndIngredientsIdAndMeasure(
                                    entity.getId(), dishShopping.getIngredientsId(), dishShopping.getMeasure());

                    if (oldAttribute != null) {
                        oldAttribute.setQuantity(
                                (oldAttribute.getQuantity()).add(BigDecimal.valueOf(dishShopping.getQuantity())));
                        attributeRepository.save(oldAttribute);
                    } else {
                        ShoppingAttributeEntity attribute = new ShoppingAttributeEntity();
                        attribute.setShoppingId(entity.getId());
                        attribute.setStatus(0);
                        attribute.setUserId(entity.getUserId());
                        attribute.setIngredientsId(dishShopping.getIngredientsId());
                        BigDecimal newQuantity = BigDecimal
                                .valueOf(dishShopping.getQuantity() * dishAttribute.getQuantity());
                        attribute.setQuantity(newQuantity);
                        attribute.setMeasure(dishShopping.getMeasure());

                        attributeRepository.save(attribute);
                    }
                }
            }

            for (ShoppingAttributeDto attributeDto : shoppingDto.getAttributes()) {
                ShoppingAttributeEntity oldAttribute = attributeRepository.findByShoppingIdAndIngredientsIdAndMeasure(
                        entity.getId(), attributeDto.getIngredients().getId(), attributeDto.getMeasure());

                if (oldAttribute != null) {
                    oldAttribute.setQuantity(oldAttribute.getQuantity().add(attributeDto.getQuantity()));
                    attributeRepository.save(oldAttribute);
                } else {
                    ShoppingAttributeEntity attribute = new ShoppingAttributeEntity();
                    attribute = shoppingModelMapper.map(attributeDto, ShoppingAttributeEntity.class);
                    attribute.setShoppingId(entity.getId());
                    attribute.setUserId(attributeDto.getUser().getId());
                    attribute.setStatus(0);
                    attribute.setIngredientsId(attributeDto.getIngredients().getId());
                    attributeRepository.save(attribute);
                }
            }

        }
    }

    public void updateShopping(ShoppingDto shoppingDto) {
        if (shoppingRepository.findByCode(shoppingDto.getCode()) == null) {
            throw new NotFoundException("Không tìm thấy đơn đi chợ với mã đơn : " + shoppingDto.getCode());
        } else {
            ShoppingEntity entity = shoppingModelMapper.map(shoppingDto, ShoppingEntity.class);
            entity.setCreateAt(now());
            entity.setStatus(0);
            shoppingRepository.save(entity);
            for (ShoppingAttributeDto attributeDto : shoppingDto.getAttributes()) {
                ShoppingAttributeEntity attribute = new ShoppingAttributeEntity();
                attribute = shoppingModelMapper.map(attributeDto, ShoppingAttributeEntity.class);
                attribute.setShoppingId(shoppingDto.getId());
                attribute.setUserId(attributeDto.getUser().getId());
                attribute.setStatus(0);
                attribute.setIngredientsId(attributeDto.getIngredients().getId());
                attributeRepository.save(attribute);
            }
            for (DishAttributeDto dishAttributeDto : shoppingDto.getDishes()) {
                DishAttributeEntity dishAttribute = new DishAttributeEntity();
                dishAttribute = shoppingModelMapper.map(dishAttributeDto, DishAttributeEntity.class);
                dishAttribute.setShoppingId(entity.getId());
                dishAttribute.setDishId(dishAttributeDto.getDish().getId());
                dishAttribute.setCookStatus(0);
                dishAttribute.setCreateAt(now());
                dishAttributeRepository.save(dishAttribute);
            }
        }
    }

    public List<ShoppingDto> getShoppingByUserId(Integer userId) {
        List<ShoppingEntity> shoppingList = shoppingRepository.findByUserId(userId);
        List<GroupMemberEntity> groups = groupMemberRepository.findByUserId(userId);
        for (GroupMemberEntity group : groups) {

            List<GroupShoppingEntity> groupShopping = groupShoppingRepository.findByGroupId(group.getGroupId());
            for (GroupShoppingEntity groupShoppingEntity : groupShopping) {
                ShoppingEntity entity = shoppingRepository.findById(groupShoppingEntity.getShoppingId()).get();
                if (entity != null) {
                    System.out.println("anvjdssdfsd");
                    shoppingList.remove(entity);
                }

            }
        }
        List<ShoppingDto> shoppingDtos = new ArrayList<ShoppingDto>();

        for (ShoppingEntity entity : shoppingList) {
            ShoppingDto dto = new ShoppingDto();
            dto = shoppingModelMapper.map(entity, ShoppingDto.class);
            UserEntity user = userRepository.findById(entity.getUserId()).get();
            UserDto userDto = shoppingModelMapper.map(user, UserDto.class);
            dto.setUser(userDto);
            shoppingDtos.add(dto);
        }
        return shoppingDtos;
    }

    public void deleteShopping(Integer orderId) {

        // Xóa dữ liệu trong bảng GroupShopping trước
        groupShoppingRepository.deleteByShoppingId(orderId);
        // Xóa dữ liệu trong bảng Dish_Attribute
        dishAttributeRepository.deleteByShoppingId(orderId);
        // Cuối cùng mới xóa được
        shoppingRepository.deleteById(orderId);
    }

    public void updateShoppingAttribute(Integer id, Integer attributeId, String measure, Integer quantity,
            LocalDate buyAt) {

        if (attributeRepository.findById(id) == null) {
            throw new NotFoundException("Không tìm thấy đơn đi chợ với mã đơn : " + id);
        } else {
            ShoppingEntity shopping = shoppingRepository.findById(id).get();
            ShoppingAttributeEntity attributeEntity = attributeRepository.findByShoppingIdAndIngredientsIdAndMeasure(id,
                    attributeId, measure);

            IngredientsEntity ingredientEntity = ingredientsRepository.findById(attributeEntity.getIngredientsId())
                    .get();
            LocalDate exprided = buyAt.plusDays(ingredientEntity.getDueDate());
            StoreEntity oldStore = storeRepository.findByIngredientsIdAndBuyAtAndExpridedAt(
                    attributeEntity.getIngredientsId(),
                    buyAt,
                    exprided);
            if (oldStore != null) {
                // Nếu đã có trong bảng store, cập nhật số lượng
                oldStore.setQuantity(oldStore.getQuantity()
                        .add(BigDecimal.valueOf(convertMeasureToQuantity(measure, Double.valueOf(quantity)))));
                storeRepository.save(oldStore);
            } else {
                // Nếu chưa có trong bảng store, tạo mới
                StoreEntity storeEntity = new StoreEntity(); // Đổi từ StoreDto sang StoreEntity
                storeEntity.setIngredientsId(attributeEntity.getIngredientsId());
                storeEntity.setUserId(shopping.getUserId()); // Lấy userId từ shopping
                storeEntity
                        .setQuantity(BigDecimal.valueOf(convertMeasureToQuantity(measure, Double.valueOf(quantity))));
                storeEntity.setBuyAt(buyAt);
                storeEntity.setExpridedAt(exprided);
                storeEntity.setMeasure(measure);
                storeRepository.save(storeEntity);
            }

            attributeEntity.setBuyAt(now());
            attributeEntity.setExprided(now().plusDays(ingredientEntity.getDueDate()));
            attributeEntity.setStatus(1);
            attributeEntity.setStatusbuy(true);
            attributeEntity.setStatusstore(true);
            attributeRepository.save(attributeEntity);
            List<ShoppingAttributeEntity> attributes = attributeRepository.findByShoppingId(id);
            Integer check = 1;
            for (ShoppingAttributeEntity shoppingAttribute : attributes) {
                if (shoppingAttribute.getStatus() == 0) {
                    check = 0;
                }
            }
            shopping.setStatus(check);
            shoppingRepository.save(shopping);
        }
    }

    public void removeUpdateShoppingAttribute(Integer id, Integer attributeId, String measure, Integer quantity) {
        if (attributeRepository.findByShoppingId(id) == null) {
            throw new NotFoundException("Không tìm thấy đơn đi chợ với mã đơn : " + id);
        } else {
            ShoppingEntity shopping = shoppingRepository.findById(id).get();
            ShoppingAttributeEntity attributeEntity = attributeRepository.findByShoppingIdAndIngredientsIdAndMeasure(id,
                    attributeId, measure);

            attributeEntity.setBuyAt(null);
            attributeEntity.setExprided(null);
            attributeEntity.setStatus(0);
            attributeEntity.setStatusbuy(false);
            attributeEntity.setStatusstore(false);

            shopping.setStatus(0);
            shoppingRepository.save(shopping);
            attributeRepository.save(attributeEntity);
        }
    }

    public List<ShoppingDto> getByFilter(Integer userId, String code, Integer status, String minCreateAt,
            String maxCreateAt) {
        // Xử lý code
        String filterCode = (code != null && !code.trim().isEmpty()) ? code : null;

        // Xử lý status
        Integer filterStatus = (status != null && (status == 0 || status == 1)) ? status : null;

        // Xử lý ngày tạo
        LocalDate filterMinCreateAt = null;
        LocalDate filterMaxCreateAt = null;

        try {
            if (minCreateAt != null && !minCreateAt.trim().isEmpty()) {
                filterMinCreateAt = LocalDate.parse(minCreateAt);
            }

            if (maxCreateAt != null && !maxCreateAt.trim().isEmpty()) {
                filterMaxCreateAt = LocalDate.parse(maxCreateAt);
            }
        } catch (DateTimeParseException e) {
            // Log lỗi và xử lý phù hợp với yêu cầu của ứng dụng
            logger.error("Invalid date format: {}", e.getMessage());
            // Có thể trả về danh sách rỗng hoặc ném exception tùy thuộc vào yêu cầu
        }

        List<ShoppingEntity> shoppingList;

        if (filterCode != null) {
            // Truy vấn dữ liệu khi code not NULL
            shoppingList = shoppingRepository.findByFiltersForCodeNotNull(
                    filterCode, filterStatus, filterMinCreateAt, filterMaxCreateAt, userId);
        } else {
            // Truy vấn dữ liệu khi code is NULL
            shoppingList = shoppingRepository.findByFiltersForCodeIsNull(
                    filterStatus, filterMinCreateAt, filterMaxCreateAt, userId);
        }

        // Chuyển đổi sang DTO
        List<ShoppingDto> shoppingDtos = new ArrayList<>();

        for (ShoppingEntity entity : shoppingList) {
            try {
                ShoppingDto dto = shoppingModelMapper.map(entity, ShoppingDto.class);

                // Tìm thông tin user và xử lý null
                userRepository.findById(entity.getUserId())
                        .ifPresent(user -> {
                            UserDto userDto = shoppingModelMapper.map(user, UserDto.class);
                            dto.setUser(userDto);
                        });

                shoppingDtos.add(dto);
            } catch (Exception e) {
                logger.error("Error mapping shopping entity to DTO: {}", e.getMessage());
                // Có thể bỏ qua item này hoặc xử lý phù hợp
            }
        }

        return shoppingDtos;
    }

    public List<ShoppingDto> getShoppingByGroupId(Integer groupId) {
        List<GroupShoppingEntity> entities = groupShoppingRepository.findByGroupId(groupId);
        List<ShoppingDto> shoppingDtos = new ArrayList<ShoppingDto>();
        for (GroupShoppingEntity entity : entities) {
            ShoppingEntity shoppingEntity = shoppingRepository.findById(entity.getShoppingId()).get();
            UserEntity userCreate = userRepository.findById(shoppingEntity.getUserId()).get();
            UserDto userDto = shoppingModelMapper.map(userCreate, UserDto.class);
            ShoppingDto dto = shoppingModelMapper.map(shoppingEntity, ShoppingDto.class);
            dto.setUser(userDto);
            shoppingDtos.add(dto);
        }
        return shoppingDtos;
    }

    public List<String> getAllIngredientsMeasure() {
        return attributeRepository.findDistinctMeasure();
    }

    public List<StoreDto> getDetailUserStore(Integer userId) {
        List<StoreEntity> storeEntities = storeRepository.findByUserId(userId);
        List<StoreDto> storeDtos = new ArrayList<>();

        for (StoreEntity storeEntity : storeEntities) {
            StoreDto storeDto = new StoreDto();

            storeDto.setStoreId(storeEntity.getId());
            storeDto.setUserId(storeEntity.getUserId());
            storeDto.setQuantity(storeEntity.getQuantity());
            storeDto.setQuantityDouble(convertMeasureToQuantityResponse(storeEntity.getMeasure(),
                    storeEntity.getQuantity().intValue()));
            storeDto.setExpridedAt(storeEntity.getExpridedAt());
            storeDto.setBuyAt(storeEntity.getBuyAt());
            storeDto.setMeasure(storeEntity.getMeasure());
            storeDto.setIngredientsId(storeEntity.getIngredientsId());

            IngredientsEntity ingredientsEntity = ingredientsRepository.findById(storeEntity.getIngredient().getId())
                    .orElseThrow(() -> new RuntimeException("Ingredient not found"));
            storeDto.setIngredientName(ingredientsEntity.getName());
            storeDto.setIngredientStatus(ingredientsEntity.getIngredientStatus());
            storeDto.setIngredientImage(ingredientsEntity.getImage());

            UserEntity userEntity = userRepository.findById(storeEntity.getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            storeDto.setUserName(userEntity.getName());

            storeDtos.add(storeDto);
        }
        return storeDtos;
    }

    public void deleteStoreByUser(Integer StoreId, Double quantityDouble, String unit) {
        StoreEntity storeEntities = storeRepository.findById(StoreId)
                .orElseThrow(
                        () -> new NotFoundException("Không tìm thấy dữ liệu trong bảng Store với StoreId: " + StoreId));
        // Chuyển đổi đơn vị đo lường
        Integer quantity = convertMeasureToQuantity(unit, quantityDouble);
        if (storeEntities.getQuantity().compareTo(BigDecimal.valueOf(quantity)) < 0) {
            throw new NotFoundException("Số lượng trong kho không đủ để xóa: " + storeEntities.getQuantity());
        }
        // Giảm số lượng trong kho
        storeEntities.setQuantity(storeEntities.getQuantity().subtract(BigDecimal.valueOf(quantity)));
        // Nếu số lượng sau khi giảm là 0, xóa khỏi kho
        if (storeEntities.getQuantity().compareTo(BigDecimal.ZERO) <= 0) {
            storeRepository.deleteById(StoreId);
        } else {
            storeRepository.save(storeEntities);
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

    private boolean isExpridedAt(LocalDate expiredAt) {
        // Kiểm tra xem ngày hết hạn đã qua chưa
        return expiredAt.isBefore(now());
    }

    public int checkQuantityIngredient(Integer userId, Integer ingredientId, Double quantityDouble, String measure) {
        int chekck = 0;
        boolean isStore = false;
        boolean isFridge = false;
        int quantityInt = 0;
        // Kiểm tra trong nhà kho theo cá nhân
        List<StoreEntity> storeEntity = storeRepository.findByUserIdAndIngredientId(userId, ingredientId);
        if (storeEntity != null && !storeEntity.isEmpty()) {
            for (StoreEntity store : storeEntity) {
                // Chuyển đổi đơn vị đo lường nếu cần
                quantityInt = convertMeasureToQuantity(measure, quantityDouble);
                if (store.getQuantity().intValue() >= quantityInt && !isExpridedAt(store.getExpridedAt())) {
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
                quantityInt = convertMeasureToQuantity(measure, quantityDouble);
                if (fridgeIngredient.getQuantity() >= quantityInt && !isExpridedAt(fridgeIngredient.getExprided())) {
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

}
