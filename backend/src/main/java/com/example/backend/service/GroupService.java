package com.example.backend.service;

import com.example.backend.dtos.GroupDto;
import com.example.backend.dtos.ShoppingDto;
import com.example.backend.dtos.UserDto;
import com.example.backend.entities.*;
import com.example.backend.exception.DuplicateException;
import com.example.backend.exception.NotCanDoException;
import com.example.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.apache.catalina.User;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static java.time.LocalDate.now;

@Service
@RequiredArgsConstructor
public class GroupService {
    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;

    private final UserRepository userRepository;
    private final ShoppingAttributeRepository attributeRepository;
    private final GroupShoppingRepository groupShoppingRepository;
    private final ShoppingRepository shoppingRepository;
    private final FridgeRepository fridgeRepository;
    private final FridgeIngredientsRepository ingredientsRepository;
    private final ModelMapper modelMapper;
    public List<GroupDto> getAllGroups() {
        List<GroupEntity> entities = groupRepository.findAll();
        List<GroupDto> dtos = new ArrayList<GroupDto>();
        dtos = Arrays.asList(modelMapper.map(entities,GroupDto[].class));
        for (int i = 0; i < dtos.size(); i++) {
            GroupDto dto = dtos.get(i);
            GroupEntity entity = entities.get(i);
            UserEntity user = userRepository.findById(entity.getLeader()).get();
            UserDto userDto = modelMapper.map(user,UserDto.class);
            dto.setLeader(userDto);

        }
        return dtos;

    }
    public List<GroupDto> getGroupByMember(Integer id) {
        List<GroupMemberEntity> entities = groupMemberRepository.findByUserId(id);
        List<GroupEntity> groupEntities = new ArrayList<GroupEntity>();
        for(GroupMemberEntity member : entities) {
            GroupEntity groupEntity = groupRepository.findById(member.getGroupId()).get();
            groupEntities.add(groupEntity);
        }
        List<GroupDto> dtos = new ArrayList<GroupDto>();
        dtos = Arrays.asList(modelMapper.map(groupEntities,GroupDto[].class));
        for (int i = 0; i < dtos.size(); i++) {
            GroupDto dto = dtos.get(i);
            GroupEntity entity = groupEntities.get(i);
            UserEntity user = userRepository.findById(entity.getLeader()).get();
            UserDto userDto = modelMapper.map(user,UserDto.class);
            dto.setLeader(userDto);

        }
        return dtos;
    }
    public List<GroupDto> getGroupByLeader(Integer id) {
        List<GroupEntity> entities = groupRepository.findByLeader(id);
        List<GroupDto> dtos = new ArrayList<GroupDto>();
        dtos = Arrays.asList(modelMapper.map(entities, GroupDto[].class));
        for (int i = 0; i < dtos.size(); i++) {
            GroupDto dto = dtos.get(i);
            GroupEntity entity = entities.get(i);
            UserEntity user = userRepository.findById(entity.getLeader()).get();
            UserDto userDto = modelMapper.map(user,UserDto.class);
            dto.setLeader(userDto);

        }
        return dtos;
    }
    public void shareShopping (Integer shoppingId, Integer groupId) {
        ShoppingEntity shoppingEntity = shoppingRepository.findById(shoppingId).get();
        GroupEntity groupEntity = groupRepository. findById(groupId).get();
        GroupShoppingEntity groupShoppingEntity = groupShoppingRepository.findByShoppingIdAndGroupId(shoppingId,groupId);
        if ( groupShoppingEntity != null ) {
            throw new DuplicateException("Đã có đơn đi chợ "+ shoppingEntity.getCode() +" trong group " + groupEntity.getName());

        }
        else {
            GroupShoppingEntity newGroupShoppingEntity = new GroupShoppingEntity();
            newGroupShoppingEntity.setShoppingId(shoppingId);
            newGroupShoppingEntity.setGroupId(groupId);
            groupShoppingRepository.save(newGroupShoppingEntity);
        }
    }
    public GroupDto getDetailGroup(Integer id) {
        GroupEntity groupEntity = groupRepository.findById(id).get();
        GroupDto groupDto = new GroupDto();
        groupDto = modelMapper.map(groupEntity, GroupDto.class);
        UserEntity leader = userRepository.findById(groupEntity.getLeader()).get();
        UserDto userDto = modelMapper.map(leader, UserDto.class);
        groupDto.setLeader(userDto);
        List<GroupMemberEntity> members = groupMemberRepository.findByGroupId(id);
        List<UserDto> users = new ArrayList<UserDto>();
        for(GroupMemberEntity member : members) {
            UserEntity user = userRepository.findById(member.getUserId()).get();
            UserDto dto = modelMapper.map(user, UserDto.class);
            users.add(dto);

        }
        groupDto.setGroupMembers(users);

        return groupDto;
    }
    public void deleteMember(Integer groupId,Integer userId) {
        GroupMemberEntity member = groupMemberRepository.findByGroupIdAndUserId(groupId, userId);
        groupMemberRepository.deleteById(member.getId());
    }
    public void addMember(Integer groupId,Integer userId) {
        System.out.println(groupId);
        System.out.println(userId);

        GroupMemberEntity member = groupMemberRepository.findByGroupIdAndUserId(groupId, userId);
        if(member != null) {
            throw new DuplicateException("Đã có thành viên này trong group");
        } else {
            GroupMemberEntity newMember = new GroupMemberEntity();
            newMember.setGroupId(groupId);
            newMember.setUserId(userId);
            groupMemberRepository.save(newMember);
        }
    }
    public void addBuyUser(Integer attributeId, Integer userId) {
        ShoppingAttributeEntity shoppingAttribute = attributeRepository.findById(attributeId).get();
        shoppingAttribute.setUserId(userId);
        attributeRepository.save(shoppingAttribute);

    }
    public List<UserDto> getUserByGroup(Integer id) {
        GroupEntity group  = groupRepository.findById(id).get();
        List <GroupMemberEntity> groups = groupMemberRepository.findByGroupId(id);
        GroupMemberEntity groupMemberEntity = groupMemberRepository.findByGroupIdAndUserId(id, group.getLeader());
        groups.remove(groupMemberEntity);

        List<UserDto> members = new ArrayList<UserDto>();
        for(GroupMemberEntity groupMember : groups) {
            UserEntity use = userRepository.findById(groupMember.getUserId()).get();
            UserDto dto = modelMapper.map(use, UserDto.class);
            members.add(dto);
        }
        return members;

    }
    public List<UserDto> getUsersNotInGroup(Integer groupId) {
        List<UserEntity> users = userRepository.findAll();
        GroupEntity group  = groupRepository.findById(groupId).get();
        List <GroupMemberEntity> groups = groupMemberRepository.findByGroupId(groupId);

        for(GroupMemberEntity groupMember : groups) {
            UserEntity user = userRepository.findById(groupMember.getUserId()).get();
            users.remove(user);
        }
        List<UserDto> dtos = Arrays.asList(modelMapper.map(users,UserDto[].class));
        return dtos;

    }
    public void addGroup(GroupDto groupDto) {
        GroupEntity entity = new GroupEntity();
        entity.setName(groupDto.getName());
        entity.setImage(groupDto.getImage());
        entity.setLeader(groupDto.getLeader().getId());
        entity.setCreateAt(now());
        entity = groupRepository.save(entity);
        GroupMemberEntity groupMember = new GroupMemberEntity();
        groupMember.setGroupId(entity.getId());
        groupMember.setUserId(entity.getLeader());
        groupMemberRepository.save(groupMember);
        FridgeEntity newFridge = new FridgeEntity ();
        newFridge.setName("Tủ lạng của " + groupDto.getName());
        newFridge.setType(1);
        newFridge.setUserId(entity.getLeader());
        newFridge.setGroupId(entity.getId());
        fridgeRepository.save(newFridge);
    }
    public void deleteGroup (Integer groupId) {
        List<GroupShoppingEntity> shoppings = groupShoppingRepository.findByGroupId(groupId);
        if(shoppings != null) {
            for(GroupShoppingEntity shopping : shoppings) {
                ShoppingEntity entity = shoppingRepository.findById(shopping.getShoppingId()).get();
                if(entity.getStatus() == 0) {
                    throw new NotCanDoException("Vui lòng hoàn thành nốt đơn đi chợ trước khi xóa nhóm");
                }
            }
        }
        FridgeEntity fridge = fridgeRepository.findByGroupId(groupId);
        List<FridgeIngredientsEntity> ingredients = ingredientsRepository.findByFridgeId(fridge.getId());

        if (ingredients.size() != 0) {
            throw new NotCanDoException("Vui lòng dùng hết nguyên liệu trong tủ lạnh trước khi xóa nhóm");
        }
        groupRepository.deleteById(groupId);
    }
    public void updateGroup(GroupDto groupDto) {
        GroupEntity entity = groupRepository.findById(groupDto.getId()).get();
        String updateName = entity.getName();
        String updateImage = entity.getImage();
        if(groupDto.getName() != "") {
            updateName = groupDto.getName();
        }
        if(groupDto.getImage() != "") {
            updateImage = groupDto.getImage();
        }
        entity.setName(updateName);
        entity.setImage(updateImage);
        entity.setUpdateAt(now());
        groupRepository.save(entity);
    }


}

