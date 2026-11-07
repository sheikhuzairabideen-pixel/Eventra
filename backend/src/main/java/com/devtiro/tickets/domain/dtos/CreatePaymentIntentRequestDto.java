package com.devtiro.tickets.domain.dtos;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreatePaymentIntentRequestDto {

  @NotNull(message = "Ticket type ID is required")
  private UUID ticketTypeId;
}
