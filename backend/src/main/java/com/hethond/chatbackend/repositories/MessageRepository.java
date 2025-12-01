package com.hethond.chatbackend.repositories;

import com.hethond.chatbackend.entities.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByChannelId(long channelId);
    Page<Message> findByChannelId(long channelId, Pageable pageable);
}
