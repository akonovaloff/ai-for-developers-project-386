import "@typespec/http";

using TypeSpec.Http;

namespace CalBook;

@route("/admin")
interface AdminApi {
  // ── Event Types ────────────────────────────────────────────────

  /** Список всех типов событий */
  @get
  @route("/event-types")
  listEventTypes(): EventType[];

  /** Создать новый тип события */
  @post
  @route("/event-types")
  createEventType(@body body: EventTypeInput):
    | { @statusCode _: 201; @body eventType: EventType };

  /** Обновить тип события */
  @put
  @route("/event-types/{id}")
  updateEventType(
    @path id: string,
    @body body: EventTypeInput,
  ): EventType | NotFoundResponse;

  /** Удалить тип события */
  @delete
  @route("/event-types/{id}")
  deleteEventType(@path id: string): NoContentResponse | NotFoundResponse;

  // ── Bookings ───────────────────────────────────────────────────

  /**
   * Список бронирований.
   * from/to — фильтр по дате (ISO YYYY-MM-DD).
   * По умолчанию возвращает предстоящие бронирования.
   */
  @get
  @route("/bookings")
  listBookings(
    @query from?: plainDate,
    @query to?: plainDate,
  ): Booking[];

  /** Отменить бронирование */
  @delete
  @route("/bookings/{id}")
  cancelBooking(@path id: string): NoContentResponse | NotFoundResponse;
}
