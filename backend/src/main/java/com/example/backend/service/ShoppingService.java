package com.example.backend.service;

import com.example.backend.dtos.*;
import com.example.backend.entities.*;
import com.example.backend.exception.DuplicateException;
import com.example.backend.exception.NotCanDoException;
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
    private final DishIngredientsRepository dishIngredientsRepository;
    private final ShoppingAttributeRepository attributeRepository;
    private final DishAttributeRepository dishAttributeRepository;
    private final ModelMapper shoppingModelMapper;
    private final IngredientsRepository ingredientsRepository;
    private final GroupShoppingRepository groupShoppingRepository;
    private final UserRepository userRepository;
    private final DishRepository dishRepository;
    private final GroupMemberRepository groupMemberRepository;

    public List<ShoppingDto> getAllShoppings() {
        List<ShoppingDto> dtos = new ArrayList<ShoppingDto>();
        List<ShoppingEntity> entities = shoppingRepository.findAll();
        dtos = Arrays.asList(shoppingModelMapper.map(entities, ShoppingDto[].class));
        return dtos;
    }

    public ShoppingDto getDetailShoppingById(Integer id) {
        ShoppingDto shoppingDto = new ShoppingDto();
        ShoppingEntity entity = shoppingRepository.findById(id).get();
        UserEntity userShopping = userRepository.findById(entity.getUserId()).get();
        UserDto userShoppingDto = shoppingModelMapper.map(userShopping, UserDto.class);
        shoppingDto = shoppingModelMapper.map(entity, ShoppingDto.class);
        shoppingDto.setUser(userShoppingDto);
        List<ShoppingAttributeDto> attributeDtos = new ArrayList<ShoppingAttributeDto>();
        List<ShoppingAttributeEntity> attributes = attributeRepository.findByShoppingId(entity.getId());
        for (ShoppingAttributeEntity attribute : attributes) {
            ShoppingAttributeDto attributeDto = new ShoppingAttributeDto();
            attributeDto = shoppingModelMapper.map(attribute, ShoppingAttributeDto.class);
            String status = ingredientsRepository.findById(attributeDto.getIngredients().getId()).get()
                    .getIngredientStatus();
            attributeDto.setIngredientStatus(status);
            UserDto userDto = new UserDto();
            UserEntity user = userRepository.findById(attribute.getUserId()).get();
            if (user != null) {
                userDto = shoppingModelMapper.map(user, UserDto.class);
            }
            IngredientsEntity ingredientsEntity = ingredientsRepository.findById(attribute.getIngredientsId()).get();
            IngredientsDto ingredientsDto = shoppingModelMapper.map(ingredientsEntity, IngredientsDto.class);

            attributeDto.setUser(userDto);
            attributeDto.setIngredients(ingredientsDto);
            attributeDtos.add(attributeDto);

        }
        List<DishAttributeDto> dishAttributeDtos = new ArrayList<DishAttributeDto>();
        List<DishAttributeEntity> dishAttributes = dishAttributeRepository.findByShoppingId(id);
        for (DishAttributeEntity dishAttribute : dishAttributes) {
            DishAttributeDto dishAttributeDto = shoppingModelMapper.map(dishAttribute, DishAttributeDto.class);
            DishEntity dish = dishRepository.findById(dishAttribute.getDishId()).get();
            DishDto dishDto = shoppingModelMapper.map(dish, DishDto.class);
            dishAttributeDto.setDish(dishDto);
            dishAttributeDtos.add(dishAttributeDto);
        }
        shoppingDto.setDishes(dishAttributeDtos);
        shoppingDto.setAttributes(attributeDtos);

        return shoppingDto;
    }

    public void addShopping(ShoppingDto shoppingDto) {

        if (shoppingDto.getDishes() != null && !shoppingDto.getDishes().isEmpty()) {
            for (int i = 0; i < shoppingDto.getDishes().size(); i++) {
                DishAttributeDto dish = shoppingDto.getDishes().get(i);
            }
        }

        // In thông tin nguyên liệu bổ sung
        if (shoppingDto.getAttributes() != null && !shoppingDto.getAttributes().isEmpty()) {
            for (int i = 0; i < shoppingDto.getAttributes().size(); i++) {
                ShoppingAttributeDto attr = shoppingDto.getAttributes().get(i);
            }
        }

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

    public void deleteShopping(Integer id) {
        List<ShoppingAttributeEntity> shoppingAttributes = attributeRepository.findByShoppingId(id);
        for (ShoppingAttributeEntity shoppingAttribute : shoppingAttributes) {
            if (shoppingAttribute.getStatus() == 1) {
                throw new NotCanDoException("Đơn hàng đang thực hiện, không thể xóa");
            }
        }
        // Xóa dữ liệu trong bảng GroupShopping trước
        groupShoppingRepository.deleteByShoppingId(id);
        // Xóa dữ liệu trong bảng Dish_Attribute
        dishAttributeRepository.deleteByShoppingId(id);
        // Cuối cùng mới xóa được
        shoppingRepository.deleteById(id);
    }

    public void updateShoppingAttribute(Integer id, Integer attributeId, String measure) {
        if (attributeRepository.findById(id) == null) {
            throw new NotFoundException("Không tìm thấy đơn đi chợ với mã đơn : " + id);
        } else {
            ShoppingEntity shopping = shoppingRepository.findById(id).get();
            ShoppingAttributeEntity attributeEntity = attributeRepository.findByShoppingIdAndIngredientsIdAndMeasure(id,
                    attributeId, measure);
            IngredientsEntity ingredientEntity = ingredientsRepository.findById(attributeEntity.getIngredientsId())
                    .get();

            attributeEntity.setBuyAt(now());
            attributeEntity.setExprided(now().plusDays(ingredientEntity.getDueDate()));
            attributeEntity.setStatus(1);
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

    public void removeUpdateShoppingAttribute(Integer id, Integer attributeId, String measure) {
        if (attributeRepository.findByShoppingId(id) == null) {
            throw new NotFoundException("Không tìm thấy đơn đi chợ với mã đơn : " + id);
        } else {
            ShoppingAttributeEntity attributeEntity = attributeRepository.findByShoppingIdAndIngredientsIdAndMeasure(id,
                    attributeId, measure);
            IngredientsEntity ingredientEntity = ingredientsRepository.findById(attributeEntity.getIngredientsId())
                    .get();

            attributeEntity.setBuyAt(null);
            attributeEntity.setExprided(null);
            attributeEntity.setStatus(0);
            ShoppingEntity shopping = shoppingRepository.findById(attributeEntity.getShoppingId()).get();
            shopping.setStatus(0);
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

    // public void addBuyMember()
    public List<String> getAllIngredientsMeasure() {
        return attributeRepository.findDistinctMeasure();
    }

}
