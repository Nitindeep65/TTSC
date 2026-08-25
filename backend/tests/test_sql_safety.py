"""
Unit tests for SQL and NoSQL safety validation and guardrails.
Ensures destructive DDL/DML operations are strictly rejected and read-only constraints are enforced.
"""

import pytest
from app.services.llm_services import validate_and_enforce_sql_safety


class TestSqlSafetyValidation:
    """Test suite for validate_and_enforce_sql_safety guardrails."""

    @pytest.mark.parametrize(
        "query,expected_substring",
        [
            ("SELECT id, name FROM users", "LIMIT 50;"),
            ("SELECT * FROM orders WHERE status = 'completed';", "LIMIT 50;"),
            ("WITH top_users AS (SELECT id FROM users) SELECT * FROM top_users", "LIMIT 50;"),
            ("select name, email from customers where active = true", "LIMIT 50;"),
        ],
    )
    def test_valid_select_queries_append_limit(self, query, expected_substring):
        """Valid unbounded SELECT queries should have LIMIT 50 safely appended."""
        safe_query = validate_and_enforce_sql_safety(query)
        assert expected_substring in safe_query
        assert safe_query.startswith("SELECT") or safe_query.startswith("WITH") or safe_query.startswith("select")

    def test_existing_limit_is_preserved(self):
        """Queries that already specify a LIMIT clause should remain unmodified."""
        query = "SELECT id, email FROM users ORDER BY created_at DESC LIMIT 10;"
        safe_query = validate_and_enforce_sql_safety(query)
        assert "LIMIT 10" in safe_query
        assert "LIMIT 50" not in safe_query

    def test_pure_scalar_aggregation_exempt_from_limit(self):
        """Scalar aggregate functions without GROUP BY do not require LIMIT 50."""
        query = "SELECT COUNT(*) FROM users;"
        safe_query = validate_and_enforce_sql_safety(query)
        assert "LIMIT 50" not in safe_query
        assert "SELECT COUNT(*)" in safe_query

    @pytest.mark.parametrize(
        "valid_nosql",
        [
            "db.orders.aggregate([{ \"$match\": { \"status\": \"completed\" } }])",
            "db.users.find({ \"is_active\": true })",
            "GET user:session:1001",
            "HGETALL user:profile:1001",
            "SCAN 0 MATCH user:* COUNT 100",
            "SMEMBERS active_cohorts",
        ],
    )
    def test_valid_nosql_and_redis_queries_pass(self, valid_nosql):
        """Valid read-only NoSQL and Redis commands should pass inspection."""
        safe_query = validate_and_enforce_sql_safety(valid_nosql)
        assert safe_query == valid_nosql

    @pytest.mark.parametrize(
        "destructive_query,blocked_keyword",
        [
            ("DROP TABLE users;", "DROP"),
            ("DROP DATABASE production;", "DROP"),
            ("DELETE FROM orders WHERE total_amount = 0;", "DELETE"),
            ("UPDATE users SET is_active = FALSE WHERE email = 'test';", "UPDATE"),
            ("INSERT INTO users (id, email) VALUES ('123', 'evil@hacker.com');", "INSERT"),
            ("ALTER TABLE users ADD COLUMN token VARCHAR(255);", "ALTER"),
            ("TRUNCATE TABLE system_logs;", "TRUNCATE"),
            ("GRANT ALL PRIVILEGES ON ALL TABLES TO PUBLIC;", "GRANT"),
            ("REVOKE ALL PRIVILEGES FROM PUBLIC;", "REVOKE"),
            ("EXEC xp_cmdshell 'dir';", "EXEC"),
            ("EXECUTE immediate 'DROP TABLE orders';", "EXECUTE"),
        ],
    )
    def test_destructive_sql_operations_raise_value_error(self, destructive_query, blocked_keyword):
        """Any destructive DDL or DML statements must raise a ValueError."""
        with pytest.raises(ValueError) as exc_info:
            validate_and_enforce_sql_safety(destructive_query)
        assert "Dangerous operation detected" in str(exc_info.value) or "Only read-only queries are permitted" in str(exc_info.value)

    @pytest.mark.parametrize(
        "destructive_nosql",
        [
            "db.orders.aggregate([{ \"$match\": {} }, { \"$out\": \"backup_collection\" }])",
            "db.orders.aggregate([{ \"$merge\": { \"into\": \"other_collection\" } }])",
            "db.users.insertOne({ name: 'evil' })",
            "db.users.insertMany([{ name: 'evil1' }, { name: 'evil2' }])",
            "db.users.updateOne({ _id: 1 }, { $set: { is_active: false } })",
            "db.users.updateMany({}, { $set: { deleted: true } })",
            "db.users.deleteOne({ _id: 1 })",
            "db.users.deleteMany({})",
            "db.users.drop()",
            "FLUSHALL",
            "FLUSHDB",
        ],
    )
    def test_destructive_nosql_and_redis_raise_value_error(self, destructive_nosql):
        """Destructive MongoDB pipelines ($out/$merge) or mutations (.insertOne/.drop) must be blocked."""
        with pytest.raises(ValueError) as exc_info:
            validate_and_enforce_sql_safety(destructive_nosql)
        assert "Dangerous operation detected" in str(exc_info.value)

    def test_invalid_arbitrary_text_raises_value_error(self):
        """Random natural language text without SELECT or NoSQL prefixes must be rejected."""
        with pytest.raises(ValueError) as exc_info:
            validate_and_enforce_sql_safety("Give me all orders from last week")
        assert "not a valid read-only SELECT" in str(exc_info.value)
