package com.example.backend.controller;

import com.example.backend.dtos.GroupDto;
import com.example.backend.dtos.UserDto;
import com.example.backend.service.GroupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@Validated
@RequestMapping("admin")
@CrossOrigin(origins = "http://localhost:3000")
public class GroupController {
    @Autowired
    GroupService groupService;
    @GetMapping("/groups")
    public List<GroupDto> getAllGroups() {
        List<GroupDto> response = groupService.getAllGroups();
        return response;
    }
    @GetMapping("/user/groups/{id}")
    public List<GroupDto> getGroupsByUser(@PathVariable("id") Integer id) {
        List<GroupDto> response = groupService.getGroupByMember(id);
        return response;
    }
    @GetMapping("/user/leader/{id}")
    public List<GroupDto> getGroupByLeader(@PathVariable Integer id) {
        List<GroupDto> response = groupService.getGroupByLeader(id);
        return  response;
    }
    @GetMapping("/group-user/{id}")
    public List<UserDto> getUserByGroup(@PathVariable Integer id) {
        return groupService.getUserByGroup(id);
    }
    @GetMapping("/group-users/{id}")
    public List<UserDto> getUserNotInGroup(@PathVariable Integer id) {
        return groupService.getUsersNotInGroup(id);
    }
    @PostMapping("/group/share")
    public String shareShoppingToGroup(
            @RequestBody Map<String, Object> request
    ) {
        Integer shoppingId = (Integer) request.get("shoppingId");
        Integer groupId = (Integer) request.get("groupId");
        groupService.shareShopping(shoppingId, groupId);
        return "success";
    }
    @GetMapping("/group/{id}")
    public GroupDto getGroupDetail( @PathVariable("id") Integer id) {
        return groupService.getDetailGroup(id);
    }
    @DeleteMapping("/group/member")
    public String deleteMember(
            @RequestBody Map<String, Object> request

    ){
        Integer groupId = (Integer) request.get("groupId");
        Integer memberId = (Integer) request.get("memberId");
        groupService.deleteMember(groupId, memberId);
        return "success";
    }
    @PostMapping("/group/adding")
    public String addGroupMember(
            @RequestBody Map<String , Object> request

    ) {
        Integer id = (Integer) request.get("id");
        Integer memberId = (Integer) request.get("memberId");
        groupService.addMember(id, memberId);
        return "Success";
    }
    @PutMapping("/group/attribute")
    public String addBuyUser(
            @RequestBody Map<String , Object> request
    ) {
        Integer id = (Integer) request.get("id");
        Integer userId = (Integer) request.get("userId");
        groupService.addBuyUser(id, userId);
        return "Success";
    }
    @PostMapping("/group")
    public String addGroup(@RequestBody GroupDto groupDto) {
        groupService.addGroup(groupDto);
        return "Success";
    }

    @DeleteMapping("/group/{id}")
    public String removeGroup(@PathVariable Integer id) {
        groupService.deleteGroup(id);
        return "Success";

    }
    @PutMapping("/group")
    public String updateGroup(@RequestBody GroupDto groupDto) {
        groupService.updateGroup(groupDto);
        return "Success";
    }
}
