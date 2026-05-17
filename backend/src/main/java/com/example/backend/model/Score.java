package com.example.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Data // Lombok tự tạo getters, setters, toString, ...
@Table(name = "scores")
public class Score {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String playerName;

    @Column(nullable = false)
    private int score;

    @CreationTimestamp // Tự động gán ngày giờ tạo
    @Column(updatable = false)
    private LocalDateTime createdAt;
}