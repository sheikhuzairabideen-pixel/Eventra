package com.devtiro.tickets.domain.dtos;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ConfirmPaymentRequestDto {

  @NotBlank(message = "Payment intent ID is required")
  private String paymentIntentId;
}
