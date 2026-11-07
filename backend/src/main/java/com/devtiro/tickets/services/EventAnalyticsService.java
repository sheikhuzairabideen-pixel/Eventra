package com.devtiro.tickets.services;

import com.devtiro.tickets.domain.dtos.EventAnalyticsResponseDto;
import java.util.UUID;

public interface EventAnalyticsService {
  EventAnalyticsResponseDto getAnalyticsForEvent(UUID organizerId, UUID eventId);
}
