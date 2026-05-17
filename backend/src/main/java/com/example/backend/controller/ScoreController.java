package com.example.backend.controller;

import com.example.backend.model.Score;
import com.example.backend.service.ScoreService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/scores")
@CrossOrigin("*")
public class ScoreController {

    // Thêm một đối tượng Logger để ghi log
    private static final Logger LOGGER = LoggerFactory.getLogger(ScoreController.class);

    @Autowired
    private ScoreService scoreService;

    @PostMapping
    public ResponseEntity<Score> createScore(@RequestBody Score score) {
        LOGGER.info("Received request to create score for player: {}", score.getPlayerName());
        try {
            score.setId(null);
            Score savedScore = scoreService.saveScore(score);
            LOGGER.info("Successfully saved score {} for player {}", savedScore.getScore(), savedScore.getPlayerName());
            return ResponseEntity.ok(savedScore);
        } catch (Exception e) {
            LOGGER.error("Error saving score", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/top")
    public ResponseEntity<List<Score>> getTopScores() {
        // Log ngay khi nhận được yêu cầu
        LOGGER.info("Received request to get top scores (/api/scores/top)");
        try {
            List<Score> topScores = scoreService.getTopScores();
            // Log kết quả trả về
            LOGGER.info("Returning {} top scores.", topScores.size());
            return ResponseEntity.ok(topScores);
        } catch (Exception e) {
            // Nếu có lỗi trong quá trình truy vấn DB, log lỗi đó ra
            LOGGER.error("Error fetching top scores from database", e);
            // Trả về lỗi 500 cho frontend
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}