package app.app.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Endpoint de healthcheck consumido pelo CAE e pelo ELB.
 * O CAE chama isso periodicamente pra decidir se a instancia esta saudavel.
 * Manter leve: sem queries no banco, sem chamadas externas.
 */
@RestController
@RequestMapping("/api")
public class HealthController {

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "UP");
    }
}
