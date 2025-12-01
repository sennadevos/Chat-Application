package com.hethond.chatbackend.entities;

import jakarta.persistence.*;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "channels")
public class Channel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @ManyToMany
    @JoinTable(name = "channel_members",
            joinColumns = @JoinColumn(name = "channel_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id"))
    private Set<User> members = new HashSet<>();

    public Channel() { }

    public Channel(String name) {
        this.name = name;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Set<User> getMembers() {
        return members;
    }

    public void setMembers(Set<User> members) {
        this.members = members;
    }

    public boolean hasMemberWithId(UUID userId) {
        for (User member : members) {
            if (member.getId().equals(userId))
                return true;
        }
        return false;
    }

    public void addMember(User user) {
        members.add(user);
        user.getChannels().add(this);
    }

    public void removeMember(User user) {
        members.remove(user);
        user.getChannels().remove(this);
    }
}
