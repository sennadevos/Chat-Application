package com.hethond.chatbackend.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
public class StatusController {

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        // perform lightweight checks (DB reachable, Redis ping, etc.) if needed
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "timestamp", Instant.now().toString()
        ));
    }

    @GetMapping("/info")
    public ResponseEntity<Map<String, Object>> info() {
        // return build/version metadata (could be populated from application.properties or git.properties)
        return ResponseEntity.ok(Map.of(
            "app", "ChatBackend",
            "version", "0.1.0",
            "buildTime", "2025-11-30T15:00:00Z"
        ));
    }

    // Optional combined endpoint
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> status() {
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "version", "0.1.0",
            "timestamp", Instant.now().toString()
        ));
    }
}
