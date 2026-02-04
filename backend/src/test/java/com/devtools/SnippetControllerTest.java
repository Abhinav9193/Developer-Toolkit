package com.devtools;

import com.devtools.controller.SnippetController;
import com.devtools.entity.Snippet;
import com.devtools.service.SnippetService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(SnippetController.class)
public class SnippetControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private SnippetService snippetService;

    @Test
    public void getAllSnippets_ShouldReturnList() throws Exception {
        Snippet s1 = new Snippet(1L, "Test 1", "Java", "System.out.println();", LocalDateTime.now());
        Snippet s2 = new Snippet(2L, "Test 2", "Python", "print()", LocalDateTime.now());
        List<Snippet> snippets = Arrays.asList(s1, s2);

        Mockito.when(snippetService.getAllSnippets()).thenReturn(snippets);

        mockMvc.perform(get("/api/snippets")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].title", is("Test 1")));
    }

    @Test
    public void createSnippet_ShouldReturnCreated() throws Exception {
        Snippet input = new Snippet();
        input.setTitle("New Snippet");
        input.setLanguage("JS");
        input.setCode("console.log()");

        Snippet saved = new Snippet(1L, "New Snippet", "JS", "console.log()", LocalDateTime.now());

        Mockito.when(snippetService.createSnippet(any(Snippet.class))).thenReturn(saved);

        ObjectMapper mapper = new ObjectMapper();
        
        mockMvc.perform(post("/api/snippets")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(input)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.title", is("New Snippet")));
    }
}
