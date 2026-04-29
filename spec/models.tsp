import "@typespec/http";

using TypeSpec.Http;

namespace CalBook;

/** Захардкоженный профиль владельца */
model OwnerProfile {
  id: string;
  name: string;
  bio: string;
  avatarUrl?: url;
  timezone: string;
}

/** Тип события (встречи), создаётся владельцем */
model EventType {
  id: string;
  name: string;
  description: string;
  durationMinutes: int32;
}

/** Данные для создания/обновления типа события */
model EventTypeInput {
  name: string;
  description: string;
  durationMinutes: int32;
}

/** Доступный временной слот (вычисляется сервером) */
model TimeSlot {
  startTime: utcDateTime;
  endTime: utcDateTime;
}

/** Подтверждённое бронирование */
model Booking {
  id: string;
  eventTypeId: string;
  eventTypeName: string;
  durationMinutes: int32;
  startTime: utcDateTime;
  endTime: utcDateTime;
  guestName: string;
  guestEmail: string;
  notes?: string;
  createdAt: utcDateTime;
}

/** Данные для создания бронирования (от гостя) */
model BookingInput {
  eventTypeId: string;
  startTime: utcDateTime;
  guestName: string;
  guestEmail: string;
  notes?: string;
}

@error
model ApiError {
  message: string;
  code?: string;
}
