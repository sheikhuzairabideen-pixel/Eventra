package com.devtiro.tickets.services.impl;

import com.devtiro.tickets.domain.dtos.EventAnalyticsResponseDto;
import com.devtiro.tickets.domain.dtos.EventAnalyticsResponseDto.DailySalesDto;
import com.devtiro.tickets.domain.dtos.EventAnalyticsResponseDto.HourlyCheckInDto;
import com.devtiro.tickets.domain.dtos.EventAnalyticsResponseDto.TicketTypeBreakdownDto;
import com.devtiro.tickets.domain.entities.Event;
import com.devtiro.tickets.domain.entities.TicketType;
import com.devtiro.tickets.domain.entities.TicketValidationStatusEnum;
import com.devtiro.tickets.exceptions.EventNotFoundException;
import com.devtiro.tickets.repositories.EventRepository;
import com.devtiro.tickets.repositories.TicketRepository;
import com.devtiro.tickets.repositories.TicketTypeRepository;
import com.devtiro.tickets.repositories.TicketValidationRepository;
import com.devtiro.tickets.services.EventAnalyticsService;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class EventAnalyticsServiceImpl implements EventAnalyticsService {

  private final EventRepository eventRepository;
  private final TicketRepository ticketRepository;
  private final TicketValidationRepository ticketValidationRepository;
  private final TicketTypeRepository ticketTypeRepository;

  @Override
  @Transactional(readOnly = true)
  public EventAnalyticsResponseDto getAnalyticsForEvent(UUID organizerId, UUID eventId) {
    Event event = eventRepository.findByIdAndOrganizerId(eventId, organizerId)
        .orElseThrow(() -> new EventNotFoundException(
            "Event not found or you don't have access to it"));

    // --- sold tickets per ticket-type ---
    Map<UUID, Long> soldByType = new HashMap<>();
    for (Object[] row : ticketRepository.countSoldByTicketTypeForEvent(eventId)) {
      UUID ttId = (UUID) row[0];
      Long count = ((Number) row[1]).longValue();
      soldByType.put(ttId, count);
    }

    // --- valid check-ins per ticket-type ---
    Map<UUID, Long> checkedInByType = new HashMap<>();
    for (Object[] row : ticketValidationRepository
        .countValidByTicketTypeForEvent(eventId, TicketValidationStatusEnum.VALID)) {
      UUID ttId = (UUID) row[0];
      Long count = ((Number) row[1]).longValue();
      checkedInByType.put(ttId, count);
    }

    // --- build per-type breakdown ---
    List<TicketType> ticketTypes = new ArrayList<>(event.getTicketTypes());
    List<TicketTypeBreakdownDto> breakdown = new ArrayList<>();
    long totalCapacity = 0;
    long totalSold = 0;
    double totalRevenue = 0;
    long totalCheckedIn = 0;

    for (TicketType tt : ticketTypes) {
      long sold = soldByType.getOrDefault(tt.getId(), 0L);
      long checkedIn = checkedInByType.getOrDefault(tt.getId(), 0L);
      int available = tt.getTotalAvailable() == null ? 0 : tt.getTotalAvailable();
      double price = tt.getPrice() == null ? 0.0 : tt.getPrice();
      double revenue = sold * price;
      double fillRate = available > 0 ? (sold * 100.0) / available : 0;

      breakdown.add(TicketTypeBreakdownDto.builder()
          .ticketTypeId(tt.getId())
          .name(tt.getName())
          .price(price)
          .totalAvailable(available)
          .sold(sold)
          .checkedIn(checkedIn)
          .revenue(revenue)
          .fillRate(Math.round(fillRate * 10.0) / 10.0)
          .build());

      totalCapacity += available;
      totalSold += sold;
      totalRevenue += revenue;
      totalCheckedIn += checkedIn;
    }

    // --- occupancy and check-in rate ---
    double occupancyRate = totalCapacity > 0 ? (totalSold * 100.0) / totalCapacity : 0;
    long checkInRate = totalSold > 0 ? (totalCheckedIn * 100L) / totalSold : 0;

    // --- daily sales (last 60 days) ---
    LocalDateTime since = LocalDateTime.now().minusDays(60);
    List<DailySalesDto> dailySales = new ArrayList<>();
    for (Object[] row : ticketRepository.dailySalesForEvent(eventId, since)) {
      String date = row[0].toString();
      long count = ((Number) row[1]).longValue();
      double rev = ((Number) row[2]).doubleValue();
      dailySales.add(DailySalesDto.builder()
          .date(date)
          .ticketsSold(count)
          .revenue(Math.round(rev * 100.0) / 100.0)
          .build());
    }

    // --- hourly check-ins ---
    List<HourlyCheckInDto> hourlyCheckIns = new ArrayList<>();
    for (Object[] row : ticketValidationRepository.hourlyCheckInsForEvent(eventId)) {
      int hour = ((Number) row[0]).intValue();
      long count = ((Number) row[1]).longValue();
      hourlyCheckIns.add(HourlyCheckInDto.builder()
          .hour(String.format("%02d:00", hour))
          .checkIns(count)
          .build());
    }

    return EventAnalyticsResponseDto.builder()
        .eventId(event.getId())
        .eventName(event.getName())
        .eventVenue(event.getVenue())
        .eventStatus(event.getStatus().name())
        .totalTicketsSold(totalSold)
        .totalCapacity(totalCapacity)
        .occupancyRate(Math.round(occupancyRate * 10.0) / 10.0)
        .totalRevenue(Math.round(totalRevenue * 100.0) / 100.0)
        .totalCheckedIn(totalCheckedIn)
        .checkInRate(checkInRate)
        .ticketTypeBreakdown(breakdown)
        .dailySales(dailySales)
        .hourlyCheckIns(hourlyCheckIns)
        .build();
  }
}
