package com.example.backend.controller;

import com.example.backend.model.Score;
import com.example.backend.service.ScoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/scores")
@CrossOrigin("*") // Cho phép tất cả các domain gọi API (quan trọng cho local dev)
public class ScoreController {

    @Autowired
    private ScoreService scoreService;

    @PostMapping
    public ResponseEntity<Score> createScore(@RequestBody Score score) {
        // Đảm bảo không có ID được gửi từ client
        score.setId(null);
        Score savedScore = scoreService.saveScore(score);
        return ResponseEntity.ok(savedScore);
    }

    @GetMapping("/top")
    public ResponseEntity<List<Score>> getTopScores() {
        List<Score> topScores = scoreService.getTopScores();
        return ResponseEntity.ok(topScores);
    }
}