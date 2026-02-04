package com.devtools.controller;

import com.devtools.entity.Snippet;
import com.devtools.service.SnippetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/snippets")
public class SnippetController {

    @Autowired
    private SnippetService snippetService;

    @GetMapping
    public List<Snippet> getAllSnippets() {
        return snippetService.getAllSnippets();
    }

    @PostMapping
    public Snippet createSnippet(@RequestBody Snippet snippet) {
        return snippetService.createSnippet(snippet);
    }

    @DeleteMapping("/{id}")
    public void deleteSnippet(@PathVariable Long id) {
        snippetService.deleteSnippet(id);
    }
}
