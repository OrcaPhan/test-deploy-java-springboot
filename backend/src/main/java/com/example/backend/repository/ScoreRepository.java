package com.example.backend.repository;

import com.example.backend.model.Score;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScoreRepository extends JpaRepository<Score, Long> {

    // Spring Data JPA tự hiểu phương thức này:
    // Tìm 5 bản ghi (Top5) và sắp xếp theo trường 'score' giảm dần (OrderByScoreDesc)
    List<Score> findTop5ByOrderByScoreDesc();
}