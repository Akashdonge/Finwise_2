package com.finwise.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false, length = 255)
    private String password;

    @Column(name = "first_name", nullable = false, length = 50)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 50)
    private String lastName;

    @Column(name = "created_date", nullable = false, updatable = false)
    private LocalDateTime createdDate = LocalDateTime.now();

    @Column(name = "last_updated_date")
    private LocalDateTime lastUpdatedDate = LocalDateTime.now();

    @Column(length = 20)
    private String role = "USER";

    @Column(name = "account_non_expired")
    private boolean accountNonExpired = true;

    @Column(name = "account_non_locked")
    private boolean accountNonLocked = true;

    @Column(name = "credentials_non_expired")
    private boolean credentialsNonExpired = true;

    @Column(name = "enabled")
    private boolean enabled = true;

    @Column(name = "image_url")
    private String image_url;

    @Column(name = "is_new_user")
    private boolean newUser;

    @PreUpdate
    public void setLastUpdate() {
        this.lastUpdatedDate = LocalDateTime.now();
    }

    @OneToOne(mappedBy = "user")
    private FamilyProfile profile;
    @OneToMany(mappedBy = "usernoti")
    private List<Notification> notifications;
}
