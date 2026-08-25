"""
Global pytest fixtures for QueryCraft backend test suite.
Provides TestClient, mocked LLM clients, mocked databases (psycopg2, pymongo), and sample schemas.
Ensures zero live database connections or paid LLM API calls occur during testing.
"""

import pytest
from unittest.mock import MagicMock, AsyncMock, patch
from fastapi.testclient import TestClient
from app.main import app

SAMPLE_POSTGRES_SCHEMA = """-- Cloud PostgreSQL Schema
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100),
    role VARCHAR(50) DEFAULT 'customer',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    total_amount NUMERIC(12, 2) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
"""

SAMPLE_MONGODB_SCHEMA = """-- MongoDB Introspected Cluster Schema
Collection: db.getSiblingDB('ecommerce').customers {
  _id: ObjectId,
  email: String,
  name: String,
  orders_count: Integer
}
Collection: db.getSiblingDB('ecommerce').orders {
  _id: ObjectId,
  customer_id: ObjectId,
  total_amount: Double,
  status: String,
  items: Array<Object>
}
"""

@pytest.fixture
def client():
    """FastAPI synchronous TestClient fixture."""
    with TestClient(app) as test_client:
        yield test_client

@pytest.fixture
def sample_pg_schema():
    """Provides standard sample PostgreSQL schema DDL."""
    return SAMPLE_POSTGRES_SCHEMA

@pytest.fixture
def sample_mongo_schema():
    """Provides standard sample MongoDB introspected schema."""
    return SAMPLE_MONGODB_SCHEMA

@pytest.fixture
def mock_llm_clarify_ambiguous():
    """Mocks LLM intent evaluation returning a needs_clarification JSON response."""
    return {
        "status": "needs_clarification",
        "message": "Which time window and order status would you like to filter by?",
        "extracted_data": None
    }

@pytest.fixture
def mock_llm_complete_sql():
    """Mocks LLM intent evaluation returning a complete SQL response."""
    return {
        "status": "complete",
        "message": "Here is the query for completed orders from the last 7 days.",
        "extracted_data": {
            "sql_query": "SELECT * FROM orders WHERE status = 'completed' AND created_at >= NOW() - INTERVAL '7 days' LIMIT 50;",
            "tables_identified": ["orders"],
            "explanation": "Filters for completed orders placed within the last 7 days."
        }
    }

@pytest.fixture
def mock_psycopg2_conn():
    """Mocks a psycopg2 database connection and cursor."""
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_conn.cursor.return_value = mock_cursor
    mock_cursor.fetchall.return_value = [("users",), ("orders",)]
    mock_cursor.description = [("id",), ("name",), ("email",)]
    return mock_conn, mock_cursor

@pytest.fixture
def mock_pymongo_client():
    """Mocks a pymongo MongoClient instance."""
    mock_cli = MagicMock()
    mock_cli.list_database_names.return_value = ["ecommerce", "analytics"]
    mock_db = MagicMock()
    mock_db.list_collection_names.return_value = ["customers", "orders"]
    mock_cli.__getitem__.return_value = mock_db
    mock_col = MagicMock()
    mock_col.find.return_value.limit.return_value = [
        {"_id": "60d5ec49f1b2c8b1f8e4e1a1", "email": "test@example.com", "total": 120.50}
    ]
    mock_db.__getitem__.return_value = mock_col
    return mock_cli
