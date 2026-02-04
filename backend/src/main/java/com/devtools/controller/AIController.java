package com.devtools.controller;

import com.devtools.dto.ChatRequest;
import com.devtools.dto.TextRequest;
import com.devtools.service.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AIController {

    @Autowired
    private GeminiService geminiService;

    @PostMapping("/summarize")
    public Mono<Map<String, String>> summarize(@RequestBody TextRequest request) {
        return geminiService.summarize(request.getText())
                .map(content -> Map.of("result", content));
    }

    @PostMapping("/resume")
    public Mono<Map<String, String>> analyzeResume(@RequestBody TextRequest request) {
        return geminiService.analyzeResume(request.getText())
                .map(content -> Map.of("result", content));
    }

    @PostMapping("/chat")
    public Mono<Map<String, String>> chat(@RequestBody ChatRequest request) {
        return geminiService.chat(request.getMessages())
                .map(content -> Map.of("result", content));
    }

    @PostMapping("/convert-to-json")
    public Mono<Map<String, String>> convertToJson(@RequestBody TextRequest request) {
        return geminiService.convertToJson(request.getText())
                .map(content -> Map.of("result", content));
    }
}
