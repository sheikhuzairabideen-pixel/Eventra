package com.devtiro.tickets.domain.dtos;

import java.util.List;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class EventAnalyticsResponseDto {

  private UUID eventId;
  private String eventName;
  private String eventVenue;
  private String eventStatus;

  // --- KPI Headline Numbers ---
  private long totalTicketsSold;
  private long totalCapacity;
  private double occupancyRate;         // 0-100 %
  private double totalRevenue;
  private long totalCheckedIn;          // validated attendees
  private long checkInRate;             // % of sold tickets that checked in

  // --- Per-ticket-type breakdown ---
  private List<TicketTypeBreakdownDto> ticketTypeBreakdown;

  // --- Daily sales over time (last 30 days or since on-sale) ---
  private List<DailySalesDto> dailySales;

  // --- Validation timeline (check-ins per hour on event day) ---
  private List<HourlyCheckInDto> hourlyCheckIns;

  @Data
  @AllArgsConstructor
  @NoArgsConstructor
  @Builder
  public static class TicketTypeBreakdownDto {
    private UUID ticketTypeId;
    private String name;
    private double price;
    private int totalAvailable;
    private long sold;
    private long checkedIn;
    private double revenue;
    private double fillRate;            // 0-100 %
  }

  @Data
  @AllArgsConstructor
  @NoArgsConstructor
  @Builder
  public static class DailySalesDto {
    private String date;                // "YYYY-MM-DD"
    private long ticketsSold;
    private double revenue;
  }

  @Data
  @AllArgsConstructor
  @NoArgsConstructor
  @Builder
  public static class HourlyCheckInDto {
    private String hour;                // "HH:00"
    private long checkIns;
  }
}
