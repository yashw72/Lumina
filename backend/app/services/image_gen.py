import os
import uuid
import urllib.parse
import random
import logging
from typing import Optional, Dict, Any
import httpx

from app.core.config import get_settings

logger = logging.getLogger("documentor.image_gen")


def enhance_prompt(prompt: str, context: Optional[str] = None) -> str:
    """Creates a clear, educational image generation prompt tailored for learning aids."""
    clean = prompt.strip()
    # Strip common prefixes like "generate an image of", "draw a diagram of", "/image"
    lowered = clean.lower()
    for prefix in [
        "/image",
        "generate an image of",
        "generate image of",
        "create an image of",
        "draw a diagram of",
        "draw a flowchart of",
        "visualize",
        "show an image of",
        "draw",
    ]:
        if lowered.startswith(prefix):
            clean = clean[len(prefix):].strip(" :,-")
            break

    if not clean:
        clean = "educational concept diagram"

    # Add stylistic modifiers for educational diagrams and textbook-quality infographics
    enhanced = f"educational schematic diagram illustrating {clean}, clear labels, clean vector style, modern academic infographic, high resolution, minimalist technical aesthetic"
    return enhanced


def generate_study_image(prompt: str, context: Optional[str] = None) -> Dict[str, Any]:
    """
    Generates an educational study image / diagram.
    Saves the image locally in data/generated_images and returns the relative URL.
    Falls back to direct image URL if local download encounters network issues.
    """
    settings = get_settings()
    os.makedirs(settings.IMAGES_DIR, exist_ok=True)

    enhanced = enhance_prompt(prompt, context)
    encoded_prompt = urllib.parse.quote(enhanced[:300])
    seed = random.randint(1000, 999999)
    image_service_url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=1024&height=768&nologo=true&seed={seed}"

    filename = f"study_img_{uuid.uuid4().hex[:12]}.jpg"
    local_path = os.path.join(settings.IMAGES_DIR, filename)
    relative_url = f"/api/images/{filename}"

    try:
        # Download and store locally for offline persistence and fast loading
        with httpx.Client(timeout=25.0, follow_redirects=True) as client:
            resp = client.get(image_service_url)
            if resp.status_code == 200 and len(resp.content) > 1000:
                with open(local_path, "wb") as f:
                    f.write(resp.content)
                logger.info("Saved generated image locally: %s (%d bytes)", local_path, len(resp.content))
                return {
                    "image_url": relative_url,
                    "prompt": prompt,
                    "enhanced_prompt": enhanced,
                }
            else:
                logger.warning("Image download returned status %d. Falling back to direct URL.", resp.status_code)
    except Exception as e:
        logger.warning("Failed to save image locally (%s). Falling back to direct URL.", str(e))

    # Fallback to direct service URL if local download timed out
    return {
        "image_url": image_service_url,
        "prompt": prompt,
        "enhanced_prompt": enhanced,
    }
