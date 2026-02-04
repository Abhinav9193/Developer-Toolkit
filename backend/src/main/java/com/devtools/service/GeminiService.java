package com.devtools.service;

import com.devtools.dto.ChatRequest;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    public GeminiService(WebClient.Builder webClientBuilder, ObjectMapper objectMapper) {
        this.webClient = webClientBuilder.build();
        this.objectMapper = objectMapper;
    }

    public String generateResponse(String prompt) {
        return callGemini(prompt).block();
    }

    public Mono<String> summarize(String text) {
        if (isKeyInvalid()) return Mono.just("AI service temporarily unavailable");
        String prompt = "Please summarize the following text:\n\n" + text;
        return callGemini(prompt);
    }

    public Mono<String> analyzeResume(String text) {
        if (isKeyInvalid()) return Mono.just("AI service temporarily unavailable");
        String prompt = "Please analyze this resume content. Provide a score out of 100, and 3-5 specific suggestions for improvement. Format as Markdown.\n\n" + text;
        return callGemini(prompt);
    }

    public Mono<String> chat(List<ChatRequest.Message> messages) {
        if (isKeyInvalid()) return Mono.just("AI service temporarily unavailable");
        
        // Simple simplification for chat: merge all history into one prompt for Gemini
        // Gemini has a specific chat structure but for this task we use the generation endpoint
        StringBuilder prompt = new StringBuilder();
        for (ChatRequest.Message msg : messages) {
            prompt.append(msg.getRole().toUpperCase()).append(": ").append(msg.getContent()).append("\n");
        }
        prompt.append("ASSISTANT: ");
        
        return callGemini(prompt.toString());
    }

    public Mono<String> convertToJson(String text) {
        if (isKeyInvalid()) return Mono.just("AI service temporarily unavailable");
        String prompt = "Convert the following random text into a well-structured JSON format. Only return the JSON object, nothing else.\n\nText: " + text;
        return callGemini(prompt);
    }

    private boolean isKeyInvalid() {
        return apiKey == null || apiKey.trim().isEmpty() || apiKey.contains("${");
    }

    private Mono<String> callGemini(String prompt) {
        ObjectNode root = objectMapper.createObjectNode();
        ArrayNode contentsArray = root.putArray("contents");
        ObjectNode contentNode = contentsArray.addObject();
        ArrayNode partsArray = contentNode.putArray("parts");
        partsArray.addObject().put("text", prompt);

        return webClient.post()
                .uri(apiUrl + apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(root)
                .retrieve()
                .onStatus(status -> status.isError(),
                        clientResponse -> clientResponse.bodyToMono(String.class)
                                .flatMap(errorBody -> {
                                    System.err.println("Gemini API Error (" + clientResponse.statusCode() + "): " + errorBody);
                                    return Mono.error(new RuntimeException("Gemini API Error"));
                                }))
                .bodyToMono(JsonNode.class)
                .map(jsonNode -> {
                    try {
                        return jsonNode.path("candidates")
                                .get(0)
                                .path("content")
                                .path("parts")
                                .get(0)
                                .path("text")
                                .asText();
                    } catch (Exception e) {
                        System.err.println("Error parsing Gemini response: " + e.getMessage());
                        return "AI service temporarily unavailable";
                    }
                })
                .onErrorResume(e -> {
                    System.err.println("Error calling Gemini: " + e.getMessage());
                    return Mono.just("AI service temporarily unavailable");
                });
    }
}
