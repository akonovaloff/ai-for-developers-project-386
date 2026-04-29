import { test, expect } from '@playwright/test';
import dayjs from 'dayjs';
import 'dayjs/locale/ru.js';

dayjs.locale('ru');

const tomorrow = dayjs().add(1, 'day');
const tomorrowLabel = tomorrow.format('D MMMM YYYY');
const SLOT_START = `${tomorrow.format('YYYY-MM-DD')}T10:00:00`;
const SLOT_END = `${tomorrow.format('YYYY-MM-DD')}T10:30:00`;

const PROFILE = {
  id: 'owner-1',
  name: 'Иван Петров',
  bio: 'Консультант по карьере',
  timezone: 'Europe/Moscow',
};

const EVENT_TYPE = {
  id: 'et-1',
  name: 'Консультация 30 мин',
  description: 'Разбор карьерных вопросов',
  durationMinutes: 30,
};

const BOOKING = {
  id: 'booking-1',
  eventTypeId: 'et-1',
  eventTypeName: 'Консультация 30 мин',
  durationMinutes: 30,
  startTime: SLOT_START,
  endTime: SLOT_END,
  guestName: 'Тест Тестов',
  guestEmail: 'test@example.com',
  createdAt: new Date().toISOString(),
};

test.beforeEach(async ({ page }) => {
  await page.route('**/api/profile', route => route.fulfill({ json: PROFILE }));
  await page.route('**/api/event-types', route => route.fulfill({ json: [EVENT_TYPE] }));
  await page.route('**/api/event-types/et-1', route => route.fulfill({ json: EVENT_TYPE }));
  await page.route('**/api/event-types/et-1/slots*', route =>
    route.fulfill({ json: [{ startTime: SLOT_START, endTime: SLOT_END }] }),
  );
  await page.route('**/api/bookings', route => route.fulfill({ status: 201, json: BOOKING }));
  await page.route('**/api/bookings/**', route => route.fulfill({ json: BOOKING }));
});

test('лендинг: показывает профиль владельца и типы встреч', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText('Иван Петров')).toBeVisible();
  await expect(page.getByText('Консультант по карьере')).toBeVisible();
  await expect(page.getByText('Типы встреч')).toBeVisible();
  await expect(page.getByText('Консультация 30 мин')).toBeVisible();
});

test('лендинг: клик по карточке типа встречи открывает страницу бронирования', async ({ page }) => {
  await page.goto('/');

  await page.getByText('Консультация 30 мин').click();

  await expect(page).toHaveURL(/\/book\/et-1/);
  await expect(page.getByText('Выберите дату')).toBeVisible();
});

test('полный флоу: дата → слот → форма → подтверждение', async ({ page }) => {
  await page.goto('/book/et-1');

  await expect(page.getByRole('heading', { name: 'Консультация 30 мин' })).toBeVisible();
  await expect(page.getByText('30 мин', { exact: true }).first()).toBeVisible();

  await page.getByRole('button', { name: tomorrowLabel }).click();

  await expect(page.getByText('Доступные слоты', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: '10:00' }).click();

  await expect(page.getByText('Ваши данные', { exact: false })).toBeVisible();
  await page.getByLabel('Ваше имя').fill('Тест Тестов');
  await page.getByLabel('Email').fill('test@example.com');
  await page.getByRole('button', { name: 'Забронировать' }).click();

  await expect(page).toHaveURL(/\/booking\/booking-1/);
  await expect(page.getByText('Встреча забронирована!')).toBeVisible();
  await expect(page.getByText('Консультация 30 мин')).toBeVisible();
  await expect(page.getByText('Тест Тестов')).toBeVisible();
  await expect(page.getByText('test@example.com')).toBeVisible();
});

test('форма валидирует пустые поля', async ({ page }) => {
  await page.goto('/book/et-1');

  await page.getByRole('button', { name: tomorrowLabel }).click();
  await expect(page.getByRole('button', { name: '10:00' })).toBeVisible();
  await page.getByRole('button', { name: '10:00' }).click();
  await expect(page.getByRole('button', { name: 'Забронировать' })).toBeVisible();
  await page.getByRole('button', { name: 'Забронировать' }).click();

  await expect(page.getByText('Введите имя')).toBeVisible();
  await expect(page.getByText('Введите корректный email')).toBeVisible();
});

test('страница подтверждения: кнопка "На главную" возвращает на лендинг', async ({ page }) => {
  await page.goto('/booking/booking-1');

  await expect(page.getByText('Встреча забронирована!')).toBeVisible();
  await page.getByRole('button', { name: 'На главную' }).click();

  await expect(page).toHaveURL('/');
  await expect(page.getByText('Типы встреч')).toBeVisible();
});
