package com.example.backend.service;

import com.example.backend.model.Score;
import com.example.backend.repository.ScoreRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ScoreService {

    @Autowired
    private ScoreRepository scoreRepository;

    public Score saveScore(Score score) {
        return scoreRepository.save(score);
    }

    public List<Score> getTopScores() {
        return scoreRepository.findTop5ByOrderByScoreDesc();
    }
}