"""
Unit tests for database introspection, engine type detection, safe execution, and sampling (services/db_service.py).
Mocks psycopg2 and pymongo to verify database abstraction layers without real network connections.
"""

import pytest
from unittest.mock import MagicMock, patch
from app.services.db_service import (
    detect_engine_type,
    parse_connection_info,
    introspect_cloud_database,
    execute_read_only_query,
    sample_table_data,
)


class TestDatabaseService:
    """Test suite for db_service.py utilities and execution guards."""

    @pytest.mark.parametrize(
        "uri,expected_engine",
        [
            ("postgres://user:pass@ep-cool-db.us-east-1.aws.neon.tech/neondb", "postgres"),
            ("postgresql://postgres:pass@db.supabase.co:5432/postgres", "postgres"),
            ("mongodb://sample_user:sample_pass@sample-mongodb.internal:27017/test?retryWrites=true", "mongodb"),
            ("mongodb://localhost:27017/analytics", "mongodb"),
            ("redis://default:token@fly-redis.upstash.io:6379", "redis"),
            ("mysql://root:pass@127.0.0.1:3306/shop", "mysql"),
            ("", "postgres"),
            ("invalid_uri_string", "postgres"),
        ],
    )
    def test_detect_engine_type(self, uri, expected_engine):
        """Engine type detection correctly maps URI schemes to database drivers."""
        assert detect_engine_type(uri) == expected_engine

    def test_parse_connection_info(self):
        """Safe connection metadata parser strips credentials and extracts host/database/user."""
        uri = "postgres://app_user:secret_password@db.supabase.co:5432/production_db"
        info = parse_connection_info(uri)
        assert info["host"] == "db.supabase.co"
        assert info["port"] == "5432"
        assert info["user"] == "app_user"
        assert info["database"] == "production_db"
        assert "secret_password" not in str(info.values())

    def test_introspect_postgres_database(self, mock_psycopg2_conn):
        """PostgreSQL introspection queries Information Schema and formats synthetic DDL."""
        mock_conn, mock_cursor = mock_psycopg2_conn

        # Mock RealDictCursor introspection query rows
        mock_cursor.fetchall.return_value = [
            {
                "table_name": "users",
                "column_name": "id",
                "data_type": "uuid",
                "udt_name": "uuid",
                "is_nullable": "NO",
                "column_default": None,
                "is_primary_key": True,
                "foreign_table_name": None,
                "foreign_column_name": None,
            },
            {
                "table_name": "users",
                "column_name": "email",
                "data_type": "character varying",
                "udt_name": "varchar",
                "is_nullable": "NO",
                "column_default": None,
                "is_primary_key": False,
                "foreign_table_name": None,
                "foreign_column_name": None,
            },
        ]

        with patch("psycopg2.connect", return_value=mock_conn):
            tables, ddl_text = introspect_cloud_database("postgresql://user:pass@localhost:5432/db")

        assert len(tables) > 0
        assert "CREATE TABLE users" in ddl_text
        assert "id UUID PRIMARY KEY" in ddl_text

    def test_introspect_mongodb_database(self, mock_pymongo_client):
        """MongoDB introspection discovers cluster databases, collections, and samples document schemas."""
        with patch("pymongo.MongoClient", return_value=mock_pymongo_client):
            tables, ddl_text = introspect_cloud_database("mongodb://sample_user:sample_pass@sample-mongodb.internal:27017/test")

        assert len(tables) > 0
        assert "Collection:" in ddl_text
        assert "ecommerce" in ddl_text or "customers" in ddl_text

    def test_execute_read_only_postgres_query(self, mock_psycopg2_conn):
        """execute_read_only_query executes SELECT queries within a read-only transaction."""
        mock_conn, mock_cursor = mock_psycopg2_conn
        mock_cursor.description = [("id",), ("email",), ("role",)]
        mock_cursor.fetchmany.return_value = [
            {"id": "u-1", "email": "alice@example.com", "role": "admin"},
            {"id": "u-2", "email": "bob@example.com", "role": "customer"},
        ]

        with patch("psycopg2.connect", return_value=mock_conn):
            result = execute_read_only_query(
                connection_uri="postgresql://user:pass@localhost:5432/test",
                sql_query="SELECT id, email, role FROM users LIMIT 2;",
                limit=50,
                auto_heal=False
            )

        assert result["status"] == "success"
        assert "email" in result["columns"]
        assert len(result["rows"]) == 2
        assert result["row_count"] == 2
        assert result["rows"][0]["email"] == "alice@example.com"

    def test_sample_table_data_computes_column_profiles(self, mock_psycopg2_conn):
        """sample_table_data returns 5 sample rows and column value distributions."""
        mock_conn, mock_cursor = mock_psycopg2_conn
        mock_cursor.description = [("id",), ("status",), ("amount",)]
        mock_cursor.fetchall.side_effect = [
            # 1. First fetchall for sample rows
            [
                {"id": "o-1", "status": "completed", "amount": 100.0},
                {"id": "o-2", "status": "completed", "amount": 150.0},
                {"id": "o-3", "status": "pending", "amount": 80.0},
            ],
            # 2. Second fetchall for distinct status values
            [
                {"status": "completed"},
                {"status": "pending"},
            ]
        ]

        with patch("psycopg2.connect", return_value=mock_conn):
            sample_res = sample_table_data(
                connection_uri="postgresql://user:pass@localhost:5432/test",
                table_name="orders",
                limit=5
            )

        assert sample_res["table_name"] == "orders"
        assert len(sample_res["rows"]) == 3
        assert "column_profiles" in sample_res
        assert isinstance(sample_res["column_profiles"], list)
        status_profile = next((p for p in sample_res["column_profiles"] if p["name"] == "status"), None)
        assert status_profile is not None
        assert "completed" in status_profile["distinct_values"]
