package com.hethond.chatbackend.services;

import com.hethond.chatbackend.exceptions.ApiException;
import com.hethond.chatbackend.entities.Channel;
import com.hethond.chatbackend.entities.User;
import com.hethond.chatbackend.repositories.ChannelRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
public class ChannelService {
    private final ChannelRepository channelRepository;
    private final UserService userService;

    @Autowired
    public ChannelService(ChannelRepository channelRepository, UserService userService) {
        this.channelRepository = channelRepository;
        this.userService = userService;
    }

    public Channel findChannelById(long id) {
        Optional<Channel> channel = channelRepository.findById(id);
        return channel.orElseThrow(() -> ApiException.notFound("Channel not found"));
    }

    @Transactional
    public Channel saveChannel(Channel channel) {
        return channelRepository.save(channel);
    }

    @Transactional
    public Channel addMemberToChannel(long channelId, UUID userId) {
        Channel channel = findChannelById(channelId);
        User user = userService.findUserById(userId);
        channel.addMember(user);
        return channelRepository.save(channel);
    }

    @Transactional
    public Channel removeMemberFromChannel(long channelId, UUID userId) {
        Channel channel = findChannelById(channelId);
        User user = userService.findUserById(userId);
        channel.removeMember(user);
        return channelRepository.save(channel);
    }
}
