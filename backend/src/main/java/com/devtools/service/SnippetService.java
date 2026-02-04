package com.devtools.service;

import com.devtools.entity.Snippet;
import com.devtools.repository.SnippetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SnippetService {

    @Autowired
    private SnippetRepository snippetRepository;

    public List<Snippet> getAllSnippets() {
        return snippetRepository.findAll();
    }

    public Snippet createSnippet(Snippet snippet) {
        return snippetRepository.save(snippet);
    }

    public void deleteSnippet(Long id) {
        snippetRepository.deleteById(id);
    }
}
