import pytest
from starlette.testclient import TestClient

import store
from main import app


@pytest.fixture(autouse=True)
def reset_store():
    store.reset()
    yield
    store.reset()


@pytest.fixture
def client():
    return TestClient(app)
