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
        // Models to try in order of preference. We add the one from properties first if available.
        List<String> preferredModels = new java.util.ArrayList<>();
        
        if (apiUrl != null && !apiUrl.isEmpty() && !apiUrl.contains("${")) {
            // Extract model name from the full URL if possible
            // expected: .../models/MODEL_NAME:generateContent
            try {
                String modelPart = apiUrl.split("/models/")[1].split(":")[0];
                preferredModels.add(modelPart);
            } catch (Exception e) {
                // Ignore if parsing fails
            }
        }
        
        // Add standard fallbacks if not already there
        for (String m : List.of("gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-pro", "gemini-1.0-pro")) {
            if (!preferredModels.contains(m)) preferredModels.add(m);
        }
        
        return tryModelsSequentially(body, preferredModels, 0);
    }

    private Mono<String> tryModelsSequentially(ObjectNode body, List<String> models, int index) {
        if (index >= models.size()) {
            return Mono.just("AI Service Error: All available models failed (404). This usually means the API key is restricted or the region is unsupported. Please check Google AI Studio.");
        }

        String modelName = models.get(index);
        String finalUrl = "https://generativelanguage.googleapis.com/v1beta/models/" + modelName + ":generateContent?key=" + apiKey;

        return webClient.post()
                .uri(finalUrl)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(body)
                .retrieve()
                .onStatus(status -> status.isError(),
                        clientResponse -> clientResponse.bodyToMono(String.class)
                                .flatMap(errorBody -> {
                                    if (clientResponse.statusCode().value() == 404) {
                                        return Mono.error(new RuntimeException("MODEL_NOT_FOUND"));
                                    }
                                    if (errorBody.contains("leaked") || errorBody.contains("reported")) {
                                        return Mono.error(new RuntimeException("API_KEY_LEAKED"));
                                    }
                                    return Mono.error(new RuntimeException("API_ERROR: " + clientResponse.statusCode() + " | " + errorBody));
                                }))
                .bodyToMono(JsonNode.class)
                .map(this::parseGeminiResponse)
                .onErrorResume(e -> {
                    if ("MODEL_NOT_FOUND".equals(e.getMessage())) {
                        System.err.println("Model " + modelName + " not found, trying next...");
                        return tryModelsSequentially(body, models, index + 1);
                    }
                    if ("API_KEY_LEAKED".equals(e.getMessage())) {
                        return Mono.just("API Key error: Your key is leaked and disabled. Please generate a new one in AI Studio.");
                    }
                    return Mono.just("AI Service Error: " + e.getMessage());
                });
    }

    private String parseGeminiResponse(JsonNode jsonNode) {
        try {
            JsonNode candidates = jsonNode.path("candidates");
            if (candidates.isArray() && candidates.size() > 0) {
                JsonNode firstCandidate = candidates.get(0);
                
                // Check if blocked
                if (!firstCandidate.path("finishReason").isMissingNode()) {
                    String reason = firstCandidate.path("finishReason").asText();
                    if ("SAFETY".equals(reason)) return "AI response blocked by safety filters.";
                }

                JsonNode textNode = firstCandidate
                        .path("content")
                        .path("parts")
                        .get(0)
                        .path("text");
                
                if (!textNode.isMissingNode()) {
                    return textNode.asText();
                }
            }
            return "AI service error: No valid response parts. Raw: " + jsonNode.toString();
        } catch (Exception e) {
            return "AI parsing error. Raw: " + jsonNode.toString();
        }
    }
}





