package com.devtiro.tickets.repositories;

import com.devtiro.tickets.domain.entities.TicketValidation;
import com.devtiro.tickets.domain.entities.TicketValidationStatusEnum;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TicketValidationRepository extends JpaRepository<TicketValidation, UUID> {

  /** Count valid check-ins per ticket-type for an event. */
  @Query("""
      SELECT tt.id, COUNT(tv)
      FROM TicketValidation tv
      JOIN tv.ticket t
      JOIN t.ticketType tt
      WHERE tt.event.id = :eventId AND tv.status = :status
      GROUP BY tt.id
      """)
  List<Object[]> countValidByTicketTypeForEvent(
      @Param("eventId") UUID eventId,
      @Param("status") TicketValidationStatusEnum status);

  /** Hourly check-in distribution for an event. */
  @Query(value = """
      SELECT DATE_PART('hour', tv.created_at) AS hr, COUNT(*) AS cnt
      FROM ticket_validations tv
      JOIN tickets t ON tv.ticket_id = t.id
      JOIN ticket_types tt ON t.ticket_type_id = tt.id
      WHERE tt.event_id = :eventId
        AND tv.status = 'VALID'
      GROUP BY DATE_PART('hour', tv.created_at)
      ORDER BY hr
      """, nativeQuery = true)
  List<Object[]> hourlyCheckInsForEvent(@Param("eventId") UUID eventId);
}

