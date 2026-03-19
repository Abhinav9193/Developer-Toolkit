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
        // Use configured URL or a safe fallback to 1.5-flash
        String urlRoot = (apiUrl != null && !apiUrl.isEmpty() && !apiUrl.startsWith("${")) 
                        ? apiUrl.split("\\?")[0] 
                        : "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

        return webClient.post()
                .uri(urlRoot + "?key=" + apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(body)
                .retrieve()
                .onStatus(status -> status.isError(),
                        clientResponse -> clientResponse.bodyToMono(String.class)
                                .flatMap(errorBody -> {
                                    System.err.println("Gemini API Error (" + clientResponse.statusCode() + "): " + errorBody);
                                    return Mono.error(new RuntimeException("Gemini API Error: " + errorBody));
                                }))
                .bodyToMono(JsonNode.class)
                .map(jsonNode -> {
                    try {
                        JsonNode textNode = jsonNode.path("candidates")
                                .get(0)
                                .path("content")
                                .path("parts")
                                .get(0)
                                .path("text");
                        
                        if (textNode.isMissingNode()) {
                            // Check if blocked
                            JsonNode finishReason = jsonNode.path("candidates").get(0).path("finishReason");
                            if (!finishReason.isMissingNode()) {
                                return "AI service blocked the response. Reason: " + finishReason.asText();
                            }
                            return "AI service returned an empty response. (Response Structure Error)";
                        }
                        return textNode.asText();
                    } catch (Exception e) {
                        System.err.println("Error parsing Gemini response: " + e.getMessage());
                        return "AI service: Error parsing response. Status: " + jsonNode.toString();
                    }
                })
                .onErrorResume(e -> {
                    System.err.println("CRITICAL: Error calling Gemini: " + e.getMessage());
                    return Mono.just("API Error: " + e.getMessage());
                });
    }
}

