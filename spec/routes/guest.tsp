import "@typespec/http";

using TypeSpec.Http;

namespace CalBook;

@route("/api")
interface GuestApi {
  /** Профиль владельца */
  @get
  @route("/profile")
  getProfile(): OwnerProfile | NotFoundResponse;

  /** Список всех типов событий */
  @get
  @route("/event-types")
  listEventTypes(): EventType[];

  /** Один тип события по ID */
  @get
  @route("/event-types/{id}")
  getEventType(@path id: string): EventType | NotFoundResponse;

  /**
   * Свободные слоты для типа события.
   * startDate — начало 14-дневного окна (по умолчанию сегодня).
   * Слот занят, если существует бронирование с тем же startTime
   * вне зависимости от типа события.
   */
  @get
  @route("/event-types/{id}/slots")
  getAvailableSlots(
    @path id: string,
    @query startDate?: plainDate,
  ): TimeSlot[] | NotFoundResponse;

  /**
   * Создать бронирование.
   * 409 Conflict — слот уже занят.
   * 400 Bad Request — невалидные данные (прошедшее время, за пределами 14 дней).
   */
  @post
  @route("/bookings")
  createBooking(@body body: BookingInput):
    | { @statusCode _: 201; @body booking: Booking }
    | { @statusCode _: 409; @body error: ApiError }
    | BadRequestResponse;

  /** Получить бронирование по ID (страница подтверждения) */
  @get
  @route("/bookings/{id}")
  getBooking(@path id: string): Booking | NotFoundResponse;
}
