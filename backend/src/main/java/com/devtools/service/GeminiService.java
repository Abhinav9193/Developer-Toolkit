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
        // Safe fallback if apiUrl is not set properly. Defaulting to v1 for flash stability.
        String urlRoot = (apiUrl != null && !apiUrl.isEmpty() && !apiUrl.contains("${")) 
                        ? apiUrl.split("\\?")[0] 
                        : "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent";

        String finalUrl = urlRoot + "?key=" + apiKey;

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
                                        userError = "API Key error: The Gemini API key has been reported as leaked and is disabled. Please update it in Render/Vercel environment variables.";
                                    } else if (clientResponse.statusCode().value() == 404) {
                                        userError = "Gemini Model Not Found (404). Current URL: " + urlRoot + ". Please ensure the model exists for this API key.";
                                    } else if (clientResponse.statusCode().value() == 429) {
                                        userError = "API Limit Reached: Too many requests. Please wait a bit.";
                                    }
                                    System.err.println(userError + " | URL: " + urlRoot + " | Raw: " + errorBody);
                                    return Mono.error(new RuntimeException(userError));
                                }))
                .bodyToMono(JsonNode.class)
                .map(jsonNode -> {
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

                        // Check Finish Reason
                        if (candidates.isArray() && candidates.size() > 0) {
                            String reason = candidates.get(0).path("finishReason").asText();
                            if ("SAFETY".equals(reason)) return "AI response blocked by safety filters.";
                            if ("BLOCKED".equals(reason)) return "AI response blocked by content policy.";
                        }

                        return "AI service error: Empty or blocked response. (" + jsonNode.toString() + ")";
                    } catch (Exception e) {
                        return "AI response parsing error. Raw: " + jsonNode.toString();
                    }
                })
                .onErrorResume(e -> {
                    String msg = e.getMessage();
                    if (msg == null) msg = "Connection error";
                    return Mono.just("Service unreachable: " + msg);
                });
    }
}



