package com.hethond.chatbackend.services;

import com.hethond.chatbackend.exceptions.ApiException;
import com.hethond.chatbackend.entities.Channel;
import com.hethond.chatbackend.entities.Message;
import com.hethond.chatbackend.entities.User;
import com.hethond.chatbackend.repositories.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class MessageService {
    private final MessageRepository messageRepository;

    // TODO -- Find out if it might be better to use services here
    private final UserService userService;
    private final ChannelService channelService;

    @Autowired
    public MessageService(MessageRepository messageRepository,
                          UserService userService,
                          ChannelService channelService) {
        this.messageRepository = messageRepository;
        this.userService = userService;
        this.channelService = channelService;
    }

    public Message createMessage(UUID userId, long channelId, String content) {
        User author = userService.findUserById(userId);
        Channel channel = channelService.findChannelById(channelId);
        return messageRepository.save(new Message(author, channel, content));
    }

    public Message saveMessage(Message message) {
        return messageRepository.save(message);
    }

    public Message findMessageById(long id) {
        Optional<Message> message = messageRepository.findById(id);
        return message.orElseThrow(() ->new ApiException(HttpStatus.NOT_FOUND.value(), "Message not found"));
    }

    public List<Message> findAllMessagesByChannelId(long channelId) {
        // Check if channel exists
        channelService.findChannelById(channelId);
        return messageRepository.findByChannelId(channelId);
    }

    public Page<Message> findMessagesByChannelId(long channelId, Pageable pageable) {
        // Check if channel exists
        channelService.findChannelById(channelId);
        return messageRepository.findByChannelId(channelId, pageable);
    }
}
