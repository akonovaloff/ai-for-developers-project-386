.PHONY: install install-backend install-frontend \
        dev-backend dev-frontend \
        test test-backend test-e2e test-integration \
        build

NODE = bash -c "source ~/.nvm/nvm.sh 2>/dev/null; $$*" --

# ── Установка зависимостей ───────────────────────────────────────────────────

install: install-backend install-frontend

install-backend:
	uv sync --directory backend

install-frontend:
	$(NODE) npm ci --prefix frontend

# ── Разработка ───────────────────────────────────────────────────────────────

dev-backend:
	uv run --directory backend uvicorn main:app --port 8000 --reload

dev-frontend:
	$(NODE) npm run dev --prefix frontend

# ── Тесты ────────────────────────────────────────────────────────────────────

test: test-backend test-e2e test-integration

test-backend:
	uv run --directory backend pytest tests/ -v

test-e2e:
	$(NODE) npx playwright test --config frontend/playwright.config.ts --project chromium

test-integration:
	$(NODE) npx playwright test --config frontend/playwright.integration.config.ts

# ── Сборка ───────────────────────────────────────────────────────────────────

build:
	$(NODE) npm run build --prefix frontend
