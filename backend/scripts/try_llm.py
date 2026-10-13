import os
import sys

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.llm import generate, LLMError


def main():
    print("Testing Gemini LLM connection...")
    try:
        response = generate("Say hello in one sentence.")
        print("\nResponse from Gemini:")
        print(response)
        print("\nSuccess! Your Gemini API key is working correctly.")
    except RuntimeError as e:
        print(f"\nConfiguration Error: {e}")
        sys.exit(1)
    except LLMError as e:
        print(f"\nLLM Service Error: {e.message}")
        sys.exit(1)
    except Exception as e:
        print(f"\nUnexpected Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
