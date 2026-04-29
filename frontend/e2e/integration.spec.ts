import { test, expect, Page } from '@playwright/test';
import dayjs from 'dayjs';
import 'dayjs/locale/ru.js';

dayjs.locale('ru');

const API = 'http://localhost:8000';

async function selectDate(page: Page, isoDate: string): Promise<void> {
  const label = dayjs(isoDate).format('D MMMM YYYY');
  await page.getByRole('button', { name: label }).click();
}

async function selectFirstSlot(page: Page): Promise<string> {
  await expect(page.getByText('Доступные слоты', { exact: false })).toBeVisible();
  const slotBtn = page.locator('button').filter({ hasText: /^\d{2}:\d{2}$/ }).first();
  await expect(slotBtn).toBeVisible();
  const label = (await slotBtn.textContent()) ?? '';
  await slotBtn.click();
  return label;
}

async function selectDateWithSlots(page: Page): Promise<void> {
  const dateBtns = page.locator('table button:not([disabled])');
  const count = await dateBtns.count();
  for (let i = 0; i < count; i++) {
    await dateBtns.nth(i).click();
    const noSlots = page.getByText('Нет доступных слотов', { exact: false });
    const hasSlots = page.locator('button').filter({ hasText: /^\d{2}:\d{2}$/ }).first();
    const result = await Promise.race([
      noSlots.waitFor({ timeout: 2000 }).then(() => 'empty'),
      hasSlots.waitFor({ timeout: 2000 }).then(() => 'found'),
    ]).catch(() => 'found');
    if (result === 'found') return;
  }
}

// --- Тесты ---

test('лендинг: отображает профиль и типы событий из бэкенда', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText('Иван Петров')).toBeVisible();
  await expect(page.getByText('Типы встреч')).toBeVisible();
  await expect(page.getByText('Консультация 30 мин')).toBeVisible();
  await expect(page.getByText('Стратегическая сессия')).toBeVisible();
});

test('полный флоу: бронирование от лендинга до страницы подтверждения', async ({ page }) => {
  await page.goto('/');

  await page.getByText('Консультация 30 мин').click();
  await expect(page).toHaveURL(/\/book\/et-1/);
  await expect(page.getByText('Выберите дату')).toBeVisible();

  // Выбираем первую доступную дату со слотами и выбираем слот
  await selectDateWithSlots(page);
  const slotTime = await selectFirstSlot(page);

  // Заполняем форму
  await expect(page.getByText('Ваши данные', { exact: false })).toBeVisible();
  await page.getByLabel('Ваше имя').fill('Интеграционный Тест');
  await page.getByLabel('Email').fill('integration@test.com');
  await page.getByRole('button', { name: 'Забронировать' }).click();

  // Проверяем страницу подтверждения
  await expect(page).toHaveURL(/\/booking\/.+/);
  await expect(page.getByText('Встреча забронирована!')).toBeVisible();
  await expect(page.getByText('Консультация 30 мин')).toBeVisible();
  await expect(page.getByText('Интеграционный Тест')).toBeVisible();
  await expect(page.getByText('integration@test.com')).toBeVisible();
  await expect(page.getByText(slotTime, { exact: false })).toBeVisible();
});

test('забронированный слот исчезает из доступных', async ({ page }) => {
  // Получаем первый доступный слот через API
  const slotsRes = await page.request.get(`${API}/api/event-types/et-1/slots`);
  expect(slotsRes.status()).toBe(200);
  const slots = await slotsRes.json();
  const targetSlot = slots[0];

  // Бронируем его напрямую через API
  const bookRes = await page.request.post(`${API}/api/bookings`, {
    data: {
      eventTypeId: 'et-1',
      startTime: targetSlot.startTime,
      guestName: 'Другой пользователь',
      guestEmail: 'other@test.com',
    },
  });
  expect(bookRes.status()).toBe(201);

  // Проверяем через UI: идём на страницу бронирования, выбираем ту же дату
  await page.goto('/book/et-1');
  await selectDate(page, targetSlot.startTime);
  await expect(page.getByText('Доступные слоты', { exact: false })).toBeVisible();

  // Забронированный слот не должен отображаться
  const bookedTimeLabel = dayjs(targetSlot.startTime).format('HH:mm');
  const slotButtons = page.locator('button').filter({ hasText: /^\d{2}:\d{2}$/ });
  const visibleTimes = await slotButtons.allTextContents();
  expect(visibleTimes).not.toContain(bookedTimeLabel);
});
