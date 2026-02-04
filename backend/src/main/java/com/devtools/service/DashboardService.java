package com.devtools.service;

import com.devtools.dto.DashboardStats;
import com.devtools.repository.SnippetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardService {

    @Autowired
    private SnippetRepository snippetRepository;

    public DashboardStats getStats() {
        long snippetCount = snippetRepository.count();
        
        // Data for global web developer growth (approximate in millions)
        List<Map<String, Object>> growthHistory = new ArrayList<>();
        int[] years = {2018, 2019, 2020, 2021, 2022, 2023, 2024};
        double[] developers = {13.8, 14.4, 15.0, 15.6, 16.2, 16.8, 17.4}; // millions

        for (int i = 0; i < years.length; i++) {
            Map<String, Object> yearData = new HashMap<>();
            yearData.put("name", String.valueOf(years[i]));
            yearData.put("developers", developers[i]);
            growthHistory.add(yearData);
        }

        // Realistic web development articles
        List<Map<String, String>> articles = new ArrayList<>();
        articles.add(createArticle("The Evolution of Frontend Frameworks", "Exploring the shift from jQuery to React and beyond.", "Feb 04, 2024", "https://picsum.photos/seed/code/400/250"));
        articles.add(createArticle("Mastering Modern CSS: Flexbox vs Grid", "A deep dive into the best layouts for 2024.", "Jan 28, 2024", "https://picsum.photos/seed/design/400/250"));
        articles.add(createArticle("AI-Powered Development Tools", "How LLMs are changing the way we write code.", "Jan 15, 2024", "https://picsum.photos/seed/ai/400/250"));
        articles.add(createArticle("The State of Web Security", "Protecting your applications in an increasingly complex world.", "Dec 20, 2023", "https://picsum.photos/seed/security/400/250"));

        return new DashboardStats(
                snippetCount,
                "Stable",
                "1.42 GB",
                growthHistory,
                articles
        );
    }

    private Map<String, String> createArticle(String title, String summary, String date, String imageUrl) {
        Map<String, String> article = new HashMap<>();
        article.put("title", title);
        article.put("summary", summary);
        article.put("date", date);
        article.put("imageUrl", imageUrl);
        return article;
    }
}
