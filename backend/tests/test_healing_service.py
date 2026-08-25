"""
Unit tests for SQL Doctor error diagnosis, SQLSTATE code extraction, and Critic Self-Healing (services/healing_service.py).
"""

import json
import pytest
from unittest.mock import MagicMock, patch
from app.services.healing_service import (
    extract_pg_error_code,
    heal_sql_with_critic,
    diagnose_and_heal_error,
)
from app.Models.schema import DiagnoseErrorResponse


class TestHealingService:
    """Test suite for SQLSTATE error code extraction and Critic agent query repair."""

    @pytest.mark.parametrize(
        "error_msg,expected_sqlstate",
        [
            ('column "user_email" does not exist in table users', "42703"),
            ('relation "customers" does not exist', "42P01"),
            ('invalid input syntax for type uuid: "abc-123"', "22P02"),
            ('column "users.name" must appear in the GROUP BY clause or be used in an aggregate function', "42803"),
            ('syntax error at or near "WHER"', "42601"),
            ('permission denied for table secret_keys', "42501"),
            ('deadlock detected with transaction 1234', "40P01"),
            ('Unknown miscellaneous database fault', "42000"),
        ],
    )
    def test_extract_pg_error_code_mapping(self, error_msg, expected_sqlstate):
        """extract_pg_error_code accurately detects SQLSTATE error codes from error traces."""
        assert extract_pg_error_code(error_msg) == expected_sqlstate

    def test_heal_sql_with_critic_successful(self, sample_pg_schema):
        """heal_sql_with_critic invokes Llama 3.1 Critic and returns fixed SQL and diagnosis."""
        mock_llm_client = MagicMock()
        mock_response = MagicMock()
        mock_response.choices = [
            MagicMock(
                message=MagicMock(
                    content=json.dumps({
                        "healed_sql": "SELECT id, email FROM users LIMIT 50;",
                        "diagnosis": "Replaced non-existent column user_email with email."
                    })
                )
            )
        ]
        mock_llm_client.chat.completions.create.return_value = mock_response

        failing_sql = "SELECT id, user_email FROM users;"
        error_msg = 'column "user_email" does not exist'

        healed_sql, diagnosis = heal_sql_with_critic(
            failing_sql=failing_sql,
            error_message=error_msg,
            live_schema=sample_pg_schema,
            llm_client=mock_llm_client
        )

        assert healed_sql == "SELECT id, email FROM users LIMIT 50;"
        assert "Replaced non-existent column" in diagnosis

    def test_heal_sql_with_critic_fallback_on_exception(self, sample_pg_schema):
        """If Critic LLM fails, heal_sql_with_critic returns original query and error explanation."""
        mock_llm_client = MagicMock()
        mock_llm_client.chat.completions.create.side_effect = RuntimeError("API Connection Timeout")

        failing_sql = "SELECT * FROM broken_table;"
        healed_sql, diagnosis = heal_sql_with_critic(
            failing_sql=failing_sql,
            error_message="relation does not exist",
            live_schema=sample_pg_schema,
            llm_client=mock_llm_client
        )

        assert healed_sql == failing_sql
        assert "Healing attempt failed" in diagnosis

    def test_diagnose_and_heal_error_contract(self, sample_pg_schema):
        """diagnose_and_heal_error returns a valid DiagnoseErrorResponse structure."""
        mock_client = MagicMock()
        mock_client.chat.completions.create.return_value = MagicMock(
            choices=[
                MagicMock(
                    message=MagicMock(
                        content=json.dumps({
                            "error_code": "42703",
                            "root_cause": "Undefined Column: user_email does not exist in table users.",
                            "healed_sql": "SELECT id, email FROM users LIMIT 50;",
                            "affected_entities": ["users", "email"],
                            "explanation": "Fixed column user_email -> email."
                        })
                    )
                )
            ]
        )

        res = diagnose_and_heal_error(
            error_message='column "user_email" does not exist',
            failing_sql="SELECT user_email FROM users;",
            live_schema=sample_pg_schema,
            user_prompt="Get user emails",
            llm_client=mock_client
        )

        assert isinstance(res, dict)
        validated = DiagnoseErrorResponse(**res)
        assert validated.error_code == "42703"
        assert validated.healed_sql == "SELECT id, email FROM users LIMIT 50;"
        assert "Undefined Column" in validated.root_cause
        assert "users" in validated.affected_entities
