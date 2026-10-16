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


def _extract_json_substring(text: str) -> str:
    """Extracts JSON payload from text, stripping markdown code fences or conversational preambles."""
    text = text.strip()
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text, re.IGNORECASE)
    if match:
        return match.group(1).strip()

    bracket_pos = text.find("[")
    brace_pos = text.find("{")

    start_idx = -1
    if bracket_pos != -1 and brace_pos != -1:
        start_idx = min(bracket_pos, brace_pos)
    elif bracket_pos != -1:
        start_idx = bracket_pos
    elif brace_pos != -1:
        start_idx = brace_pos

    if start_idx != -1:
        end_bracket = text.rfind("]")
        end_brace = text.rfind("}")
        end_idx = max(end_bracket, end_brace)
        if end_idx > start_idx:
            return text[start_idx : end_idx + 1].strip()

    return text



def _get_candidate_models(primary_model: str) -> List[str]:
    candidates = [primary_model] if primary_model else []
    fallbacks = [
        "gemini-3.1-flash-lite",
        "gemini-3.5-flash-lite",
        "gemini-flash-lite-latest",
        "gemini-3.5-flash",
        "gemini-3.8-flash",
    ]
    for fb in fallbacks:
        if fb not in candidates:
            candidates.append(fb)
    return candidates


def generate(
    prompt: str,
    system_instruction: Optional[str] = None,
    temperature: float = 0.2,
) -> str:
    """Calls Gemini LLM to generate a text response with automatic model fallback."""
    settings = get_settings()
    client = _get_client()

    config = types.GenerateContentConfig(
        temperature=temperature,
        system_instruction=system_instruction if system_instruction else None,
    )

    models_to_try = _get_candidate_models(settings.LLM_MODEL)
    last_error: Optional[Exception] = None

    for model_name in models_to_try:
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=config,
            )
            if response and response.text:
                return response.text.strip()
        except APIError as e:
            last_error = e
            err_msg = str(e)
            if "503" in err_msg or "429" in err_msg or "404" in err_msg or "UNAVAILABLE" in err_msg:
                logger.warning(
                    "Model %s unavailable/overloaded (%s). Attempting fallback...",
                    model_name,
                    err_msg[:120],
                )
                continue
            logger.error("Gemini API error during text generation: %s", str(e), exc_info=True)
            raise LLMError(f"Gemini API error: {str(e)}", status_code=502) from e
        except RuntimeError:
            raise
        except Exception as e:
            last_error = e
            logger.warning("Error with model %s: %s. Attempting fallback...", model_name, str(e))
            continue

    logger.error("All candidate models failed during text generation: %s", str(last_error))
    raise LLMError(f"Gemini API error across all models: {str(last_error)}", status_code=502)


def generate_json(
    prompt: str,
    system_instruction: Optional[str] = None,
) -> Union[Dict[str, Any], List[Any]]:
    """
    Calls Gemini asking for strict JSON output, strips markdown fences, parses JSON,
    and retries with automatic model fallback.
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

    models_to_try = _get_candidate_models(settings.LLM_MODEL)
    last_error: Optional[Exception] = None

    for model_name in models_to_try:
        for attempt in range(2):
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=json_prompt,
                    config=config,
                )
                raw_text = response.text or ""
                cleaned = _extract_json_substring(raw_text)
                parsed = json.loads(cleaned)
                return parsed
            except (json.JSONDecodeError, ValueError) as parse_err:
                last_error = parse_err
                logger.warning(
                    "JSON decode failed with %s on attempt %d: %s.",
                    model_name,
                    attempt + 1,
                    str(parse_err),
                )
            except APIError as e:
                last_error = e
                err_msg = str(e)
                if "503" in err_msg or "429" in err_msg or "404" in err_msg or "UNAVAILABLE" in err_msg:
                    logger.warning(
                        "Model %s unavailable (%s). Moving to next model candidate...",
                        model_name,
                        err_msg[:120],
                    )
                    break
                logger.error("Gemini API error during JSON generation: %s", str(e), exc_info=True)
                raise LLMError(f"Gemini API error: {str(e)}", status_code=502) from e
            except RuntimeError:
                raise
            except Exception as e:
                last_error = e
                break

    raise LLMError(f"Failed to generate valid JSON across model candidates: {str(last_error)}")

