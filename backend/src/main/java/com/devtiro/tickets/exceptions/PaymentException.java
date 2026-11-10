package com.devtiro.tickets.exceptions;

public class PaymentException extends EventTicketException {

  public PaymentException(String message) {
    super(message);
  }

  public PaymentException(String message, Throwable cause) {
    super(message, cause);
  }
}
