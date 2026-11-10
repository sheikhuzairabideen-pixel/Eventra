package com.devtiro.tickets.controllers;

import static com.devtiro.tickets.util.JwtUtil.parseUserId;

import com.devtiro.tickets.domain.dtos.EventAnalyticsResponseDto;
import com.devtiro.tickets.services.EventAnalyticsService;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/events/{eventId}/analytics")
@RequiredArgsConstructor
public class EventAnalyticsController {

  private final EventAnalyticsService eventAnalyticsService;

  @GetMapping
  public ResponseEntity<EventAnalyticsResponseDto> getEventAnalytics(
      @AuthenticationPrincipal Jwt jwt,
      @PathVariable UUID eventId
  ) {
    return ResponseEntity.ok(
        eventAnalyticsService.getAnalyticsForEvent(parseUserId(jwt), eventId)
    );
  }
}
