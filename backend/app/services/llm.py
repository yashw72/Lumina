import json
import logging
import re
from typing import Optional, Union, Dict, Any, List
from google import genai
from google.genai import types
from google.genai.errors import APIError

from app.core.config import get_settings

logger = logging.getLogger("documentor.llm")


class LLMError(Exception):
    """Custom exception raised when an LLM API error or unrecoverable response occurs."""

    def __init__(self, message: str, status_code: int = 502):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


def _get_client() -> genai.Client:
    settings = get_settings()
    api_key = settings.GEMINI_API_KEY
    if not api_key or api_key.strip() in {"", "your_key_here"}:
        raise RuntimeError(
            "GEMINI_API_KEY is missing. Please set your Gemini API key in backend/.env."
        )
    return genai.Client(api_key=api_key)


def _strip_json_fences(text: str) -> str:
    text = text.strip()
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
    if match:
        return match.group(1).strip()
    return text


def generate(
    prompt: str,
    system_instruction: Optional[str] = None,
    temperature: float = 0.2,
) -> str:
    """Calls Gemini LLM to generate a text response."""
    settings = get_settings()
    client = _get_client()

    config = types.GenerateContentConfig(
        temperature=temperature,
        system_instruction=system_instruction if system_instruction else None,
    )

    try:
        response = client.models.generate_content(
            model=settings.LLM_MODEL,
            contents=prompt,
            config=config,
        )
        if not response or not response.text:
            raise LLMError("LLM returned an empty response.")
        return response.text.strip()
    except APIError as e:
        logger.error("Gemini API error during text generation: %s", str(e), exc_info=True)
        raise LLMError(f"Gemini API error: {str(e)}", status_code=502) from e
    except RuntimeError:
        raise
    except Exception as e:
        logger.error("Unexpected error during text generation: %s", str(e), exc_info=True)
        raise LLMError(f"Failed to generate LLM response: {str(e)}", status_code=500) from e


def generate_json(
    prompt: str,
    system_instruction: Optional[str] = None,
) -> Union[Dict[str, Any], List[Any]]:
    """
    Calls Gemini asking for strict JSON output, strips markdown fences, parses JSON,
    and retries once if parsing fails.
    """
    settings = get_settings()
    client = _get_client()

    json_prompt = (
        f"{prompt}\n\nIMPORTANT: Return ONLY valid, raw JSON. Do not include introductory or concluding text."
    )

    config = types.GenerateContentConfig(
        temperature=0.1,
        response_mime_type="application/json",
        system_instruction=system_instruction if system_instruction else None,
    )

    last_error: Optional[Exception] = None

    for attempt in range(2):
        try:
            response = client.models.generate_content(
                model=settings.LLM_MODEL,
                contents=json_prompt,
                config=config,
            )
            raw_text = response.text or ""
            cleaned = _strip_json_fences(raw_text)
            parsed = json.loads(cleaned)
            return parsed
        except (json.JSONDecodeError, ValueError) as parse_err:
            last_error = parse_err
            logger.warning(
                "JSON decode failed on attempt %d: %s. Raw text: %s",
                attempt + 1,
                str(parse_err),
                raw_text if 'raw_text' in locals() else 'None',
            )
        except APIError as e:
            logger.error("Gemini API error during JSON generation: %s", str(e), exc_info=True)
            raise LLMError(f"Gemini API error: {str(e)}", status_code=502) from e
        except RuntimeError:
            raise
        except Exception as e:
            logger.error("Unexpected error during JSON generation: %s", str(e), exc_info=True)
            raise LLMError(f"Failed to generate JSON response: {str(e)}", status_code=500) from e

    raise LLMError(f"Failed to parse valid JSON from LLM after retry: {str(last_error)}")
