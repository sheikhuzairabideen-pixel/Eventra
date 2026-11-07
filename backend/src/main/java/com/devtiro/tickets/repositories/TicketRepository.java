package com.devtiro.tickets.repositories;

import com.devtiro.tickets.domain.entities.Ticket;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, UUID> {

  int countByTicketTypeId(UUID ticketTypeId);

  Page<Ticket> findByPurchaserId(UUID purchaserId, Pageable pageable);

  Optional<Ticket> findByIdAndPurchaserId(UUID id, UUID purchaserId);

  Optional<Ticket> findByPaymentIntentId(String paymentIntentId);

  /** Count tickets sold for each ticket-type of an event. */
  @Query("SELECT tt.id, COUNT(t) FROM Ticket t JOIN t.ticketType tt WHERE tt.event.id = :eventId GROUP BY tt.id")
  List<Object[]> countSoldByTicketTypeForEvent(@Param("eventId") UUID eventId);

  /** Daily ticket sales for an event (last N days). */
  @Query(value = """
      SELECT DATE(t.created_at) AS sale_date, COUNT(*) AS cnt, SUM(tt.price) AS rev
      FROM tickets t
      JOIN ticket_types tt ON t.ticket_type_id = tt.id
      WHERE tt.event_id = :eventId
        AND t.created_at >= :since
      GROUP BY DATE(t.created_at)
      ORDER BY DATE(t.created_at)
      """, nativeQuery = true)
  List<Object[]> dailySalesForEvent(@Param("eventId") UUID eventId, @Param("since") LocalDateTime since);

  /** All tickets for an event (to compute totals). */
  @Query("SELECT t FROM Ticket t JOIN t.ticketType tt WHERE tt.event.id = :eventId")
  List<Ticket> findAllByEventId(@Param("eventId") UUID eventId);
}

