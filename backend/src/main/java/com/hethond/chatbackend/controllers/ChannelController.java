package com.hethond.chatbackend.controllers;

import com.hethond.chatbackend.response.ApiResponse;
import com.hethond.chatbackend.entities.Channel;
import com.hethond.chatbackend.entities.dto.ChannelWithUsersDto;
import com.hethond.chatbackend.services.ChannelService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/channels")
public class ChannelController {
    private final ChannelService channelService;

    @Autowired
    public ChannelController(ChannelService channelService) {
        this.channelService = channelService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ChannelWithUsersDto>> getChannel(@PathVariable long id) {
        Channel channel = channelService.findChannelById(id);
        return ResponseEntity.ok(ApiResponse.success(ChannelWithUsersDto.fromChannel(channel)));
    }

    public record AddMemberRequest(String userId) {}

    @PostMapping("/{id}/members")
    public ResponseEntity<ApiResponse<ChannelWithUsersDto>> addMember(
            @PathVariable long id,
            @RequestBody AddMemberRequest request) {
        Channel channel = channelService.addMemberToChannel(id, java.util.UUID.fromString(request.userId()));
        return ResponseEntity.ok(ApiResponse.success(ChannelWithUsersDto.fromChannel(channel)));
    }

    @DeleteMapping("/{id}/members/{userId}")
    public ResponseEntity<ApiResponse<ChannelWithUsersDto>> removeMember(
            @PathVariable long id,
            @PathVariable String userId) {
        Channel channel = channelService.removeMemberFromChannel(id, java.util.UUID.fromString(userId));
        return ResponseEntity.ok(ApiResponse.success(ChannelWithUsersDto.fromChannel(channel)));
    }
}
