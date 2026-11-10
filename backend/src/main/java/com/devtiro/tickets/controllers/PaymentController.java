package com.devtiro.tickets.controllers;

import static com.devtiro.tickets.util.JwtUtil.parseUserId;

import com.devtiro.tickets.domain.dtos.ConfirmPaymentRequestDto;
import com.devtiro.tickets.domain.dtos.CreatePaymentIntentRequestDto;
import com.devtiro.tickets.domain.dtos.CreatePaymentIntentResponseDto;
import com.devtiro.tickets.domain.dtos.GetTicketResponseDto;
import com.devtiro.tickets.domain.entities.Ticket;
import com.devtiro.tickets.mappers.TicketMapper;
import com.devtiro.tickets.services.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

  private final PaymentService paymentService;
  private final TicketMapper ticketMapper;

  @PostMapping("/create-intent")
  public ResponseEntity<CreatePaymentIntentResponseDto> createPaymentIntent(
      @AuthenticationPrincipal Jwt jwt,
      @Valid @RequestBody CreatePaymentIntentRequestDto requestDto
  ) {
    CreatePaymentIntentResponseDto response = paymentService.createPaymentIntent(
        parseUserId(jwt),
        requestDto.getTicketTypeId()
    );
    return ResponseEntity.ok(response);
  }

  @PostMapping("/confirm")
  public ResponseEntity<GetTicketResponseDto> confirmPayment(
      @AuthenticationPrincipal Jwt jwt,
      @Valid @RequestBody ConfirmPaymentRequestDto requestDto
  ) {
    Ticket ticket = paymentService.confirmPayment(
        parseUserId(jwt),
        requestDto.getPaymentIntentId()
    );
    return ResponseEntity.ok(ticketMapper.toGetTicketResponseDto(ticket));
  }
}
