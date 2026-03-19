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

    public Mono<String> summarize(String text) {
        if (isKeyInvalid())
            return Mono.just("AI error: API Key is missing or empty.");
        String prompt = "Summarize the following text briefly and clearly:\n\n" + text;
        return callGemini(prompt, false);
    }

    public Mono<String> analyzeResume(String text) {
        if (isKeyInvalid())
            return Mono.just("AI error: API Key is missing or empty.");
        String prompt = "You are a professional HR recruiter. Please analyze this resume content. Provide a score out of 100 based on modern industry standards, and exactly 5 specific, actionable suggestions for improvement. Format the entire response using Markdown.\n\n"
                + text;
        return callGemini(prompt, false);
    }

    public Mono<String> chat(List<ChatRequest.Message> messages) {
        if (isKeyInvalid())
            return Mono.just("AI error: API Key is missing or empty.");

        ObjectNode root = objectMapper.createObjectNode();
        ArrayNode contentsArray = root.putArray("contents");

        for (ChatRequest.Message msg : messages) {
            ObjectNode contentNode = contentsArray.addObject();
            // Gemini uses "user" and "model" roles. "assistant" should be mapped to "model".
            String role = msg.getRole().equalsIgnoreCase("user") ? "user" : "model";
            contentNode.put("role", role);
            ArrayNode partsArray = contentNode.putArray("parts");
            partsArray.addObject().put("text", msg.getContent());
        }

        return executeRequest(root);
    }

    public Mono<String> convertToJson(String text) {
        if (isKeyInvalid())
            return Mono.just("AI error: API Key is missing or empty.");
        
        String prompt = "Convert the following unstructured text into a well-structured JSON format. Extract all relevant entities and data points. Return ONLY the JSON object.\n\nText: "
                + text;
        
        // Using response_mime_type since we now use gemini-1.5-flash by default in properties or code
        ObjectNode root = objectMapper.createObjectNode();
        ArrayNode contentsArray = root.putArray("contents");
        ObjectNode contentNode = contentsArray.addObject();
        contentNode.putArray("parts").addObject().put("text", prompt);

        ObjectNode generationConfig = root.putObject("generationConfig");
        generationConfig.put("responseMimeType", "application/json");

        return executeRequest(root);
    }

    private boolean isKeyInvalid() {
        return apiKey == null || apiKey.trim().isEmpty() || apiKey.startsWith("${");
    }

    private Mono<String> callGemini(String prompt, boolean isJson) {
        ObjectNode root = objectMapper.createObjectNode();
        ArrayNode contentsArray = root.putArray("contents");
        ObjectNode contentNode = contentsArray.addObject();
        contentNode.putArray("parts").addObject().put("text", prompt);

        if (isJson) {
            ObjectNode generationConfig = root.putObject("generationConfig");
            generationConfig.put("responseMimeType", "application/json");
        }

        return executeRequest(root);
    }

    private Mono<String> executeRequest(ObjectNode body) {
        // Use a perfectly formatted v1beta URL as it handles Flash models most reliably currently
        String finalUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey;

        return webClient.post()
                .uri(finalUrl)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(body)
                .retrieve()
                .onStatus(status -> status.isError(),
                        clientResponse -> clientResponse.bodyToMono(String.class)
                                .flatMap(errorBody -> {
                                    String userError = "Gemini API Error (" + clientResponse.statusCode() + ")";
                                    if (errorBody.contains("leaked") || errorBody.contains("reported")) {
                                        userError = "API Key error: Key is leaked. Please update GEMINI_API_KEY in Render.";
                                    } else if (clientResponse.statusCode().value() == 404) {
                                        // If flash fails, let's try a second request with gemini-pro (fallback logic)
                                        return Mono.error(new RuntimeException("MODEL_NOT_FOUND"));
                                    }
                                    return Mono.error(new RuntimeException(userError + " | Raw: " + errorBody));
                                }))
                .bodyToMono(JsonNode.class)
                .map(this::parseGeminiResponse)
                .onErrorResume(e -> {
                    if ("MODEL_NOT_FOUND".equals(e.getMessage())) {
                        // FALLBACK to gemini-pro if gemini-1.5-flash is not available for this key
                        String fallbackUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + apiKey;
                        return webClient.post()
                                .uri(fallbackUrl)
                                .contentType(MediaType.APPLICATION_JSON)
                                .bodyValue(body)
                                .retrieve()
                                .bodyToMono(JsonNode.class)
                                .map(this::parseGeminiResponse)
                                .onErrorResume(e2 -> Mono.just("AI Service Error: Both Flash and Pro models failed. Please check your API key and region."));
                    }
                    return Mono.just("Service unreachable: " + e.getMessage());
                });
    }

    private String parseGeminiResponse(JsonNode jsonNode) {
        try {
            JsonNode candidates = jsonNode.path("candidates");
            if (candidates.isArray() && candidates.size() > 0) {
                JsonNode textNode = candidates.get(0)
                        .path("content")
                        .path("parts")
                        .get(0)
                        .path("text");
                
                if (!textNode.isMissingNode()) {
                    return textNode.asText();
                }
            }

            if (candidates.isArray() && candidates.size() > 0) {
                String reason = candidates.get(0).path("finishReason").asText();
                if ("SAFETY".equals(reason)) return "AI response blocked by safety filters.";
            }

            return "AI service error: Empty response. " + jsonNode.toString();
        } catch (Exception e) {
            return "AI parsing error. Raw: " + jsonNode.toString();
        }
    }
}




