package com.devtools.dto;

import java.util.List;
import java.util.Map;

public class DashboardStats {
    private long totalSnippets;
    private String systemStatus;
    private String databaseSize;
    private List<Map<String, Object>> usageHistory;
    private List<Map<String, String>> articles;

    public DashboardStats(long totalSnippets, String systemStatus, String databaseSize, List<Map<String, Object>> usageHistory, List<Map<String, String>> articles) {
        this.totalSnippets = totalSnippets;
        this.systemStatus = systemStatus;
        this.databaseSize = databaseSize;
        this.usageHistory = usageHistory;
        this.articles = articles;
    }

    public long getTotalSnippets() {
        return totalSnippets;
    }

    public String getSystemStatus() {
        return systemStatus;
    }

    public String getDatabaseSize() {
        return databaseSize;
    }

    public List<Map<String, Object>> getUsageHistory() {
        return usageHistory;
    }

    public List<Map<String, String>> getArticles() {
        return articles;
    }
}
