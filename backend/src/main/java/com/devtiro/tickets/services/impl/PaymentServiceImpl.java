package com.devtiro.tickets.services.impl;

import com.devtiro.tickets.domain.dtos.CreatePaymentIntentResponseDto;
import com.devtiro.tickets.domain.entities.Ticket;
import com.devtiro.tickets.domain.entities.TicketType;
import com.devtiro.tickets.exceptions.PaymentException;
import com.devtiro.tickets.exceptions.TicketTypeNotFoundException;
import com.devtiro.tickets.exceptions.TicketsSoldOutException;
import com.devtiro.tickets.repositories.TicketRepository;
import com.devtiro.tickets.repositories.TicketTypeRepository;
import com.devtiro.tickets.services.PaymentService;
import com.devtiro.tickets.services.TicketTypeService;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import jakarta.annotation.PostConstruct;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {

  @Value("${stripe.secret-key:}")
  private String stripeSecretKey;

  @Value("${stripe.publishable-key:}")
  private String stripePublishableKey;

  private final TicketTypeRepository ticketTypeRepository;
  private final TicketRepository ticketRepository;
  private final TicketTypeService ticketTypeService;

  @PostConstruct
  public void init() {
    if (stripeSecretKey != null && !stripeSecretKey.isBlank()) {
      Stripe.apiKey = stripeSecretKey;
    }
  }

  @Override
  public CreatePaymentIntentResponseDto createPaymentIntent(UUID userId, UUID ticketTypeId) {
    if (stripeSecretKey == null || stripeSecretKey.isBlank()) {
      throw new PaymentException("Stripe secret key is not configured. Please set STRIPE_SECRET_KEY in your .env file or environment variables.");
    }
    TicketType ticketType = ticketTypeRepository.findById(ticketTypeId)
        .orElseThrow(() -> new TicketTypeNotFoundException(
            String.format("Ticket type with ID %s was not found", ticketTypeId)
        ));

    int purchasedTickets = ticketRepository.countByTicketTypeId(ticketType.getId());
    Integer totalAvailable = ticketType.getTotalAvailable();
    if (totalAvailable != null && purchasedTickets >= totalAvailable) {
      throw new TicketsSoldOutException();
    }

    long amountInCents = 50L;
    if (ticketType.getPrice() != null && ticketType.getPrice() > 0) {
      amountInCents = Math.round(ticketType.getPrice() * 100);
      if (amountInCents < 50) {
        amountInCents = 50L;
      }
    }

    try {
      PaymentIntentCreateParams.Builder paramsBuilder = PaymentIntentCreateParams.builder()
          .setAmount(amountInCents)
          .setCurrency("usd")
          .putMetadata("userId", userId.toString())
          .putMetadata("ticketTypeId", ticketTypeId.toString())
          .setAutomaticPaymentMethods(
              PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                  .setEnabled(true)
                  .build()
          );

      if (ticketType.getEvent() != null) {
        paramsBuilder.putMetadata("eventId", ticketType.getEvent().getId().toString());
      }

      PaymentIntent paymentIntent = PaymentIntent.create(paramsBuilder.build());

      return CreatePaymentIntentResponseDto.builder()
          .clientSecret(paymentIntent.getClientSecret())
          .paymentIntentId(paymentIntent.getId())
          .publishableKey(stripePublishableKey)
          .amount(amountInCents)
          .currency("usd")
          .ticketTypeId(ticketType.getId())
          .ticketTypeName(ticketType.getName())
          .eventId(ticketType.getEvent() != null ? ticketType.getEvent().getId() : null)
          .eventName(ticketType.getEvent() != null ? ticketType.getEvent().getName() : null)
          .build();

    } catch (StripeException e) {
      log.error("Failed to create Stripe payment intent", e);
      throw new PaymentException(
          e.getUserMessage() != null ? e.getUserMessage() : e.getMessage(),
          e
      );
    }
  }

  @Override
  public Ticket confirmPayment(UUID userId, String paymentIntentId) {
    try {
      PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);

      if (!"succeeded".equalsIgnoreCase(paymentIntent.getStatus())) {
        throw new PaymentException("Payment has not succeeded. Current status: " + paymentIntent.getStatus());
      }

      String metaUserId = paymentIntent.getMetadata().get("userId");
      if (metaUserId == null || !metaUserId.equals(userId.toString())) {
        throw new PaymentException("Payment does not belong to the current authenticated user");
      }

      String metaTicketTypeId = paymentIntent.getMetadata().get("ticketTypeId");
      if (metaTicketTypeId == null) {
        throw new PaymentException("Payment intent metadata missing ticketTypeId");
      }

      UUID ticketTypeId = UUID.fromString(metaTicketTypeId);
      return ticketTypeService.purchaseTicket(userId, ticketTypeId, paymentIntentId);

    } catch (StripeException e) {
      log.error("Failed to retrieve or confirm Stripe payment intent", e);
      throw new PaymentException(
          e.getUserMessage() != null ? e.getUserMessage() : e.getMessage(),
          e
      );
    }
  }
}
