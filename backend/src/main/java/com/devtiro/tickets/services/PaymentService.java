package com.devtiro.tickets.services;

import com.devtiro.tickets.domain.dtos.CreatePaymentIntentResponseDto;
import com.devtiro.tickets.domain.entities.Ticket;
import java.util.UUID;

public interface PaymentService {

  CreatePaymentIntentResponseDto createPaymentIntent(UUID userId, UUID ticketTypeId);

  Ticket confirmPayment(UUID userId, String paymentIntentId);
}
