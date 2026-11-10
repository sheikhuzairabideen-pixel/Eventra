package com.devtiro.tickets.domain.dtos;

import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CreatePaymentIntentResponseDto {

  private String clientSecret;
  private String paymentIntentId;
  private String publishableKey;
  private Long amount;
  private String currency;
  private UUID ticketTypeId;
  private String ticketTypeName;
  private UUID eventId;
  private String eventName;
}
