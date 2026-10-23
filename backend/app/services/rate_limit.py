import time
import threading
from typing import Dict, List, Tuple


class LoginRateLimiter:
    """
    In-memory rate limiter for failed login attempts.
    Keyed by (client_ip, email).
    Thread-safe via threading.Lock.
    
    Note: This in-memory limiter is per-process and suitable for single-instance deployments.
    """

    def __init__(self):
        self._lock = threading.Lock()
        self._failures: Dict[Tuple[str, str], List[float]] = {}

    def _normalize_key(self, ip: str, email: str) -> Tuple[str, str]:
        return ((ip or "").strip(), (email or "").strip().lower())

    def is_blocked(self, ip: str, email: str, max_attempts: int, window_minutes: int) -> bool:
        """Checks if the given IP + email combination has exceeded max allowed failed attempts."""
        key = self._normalize_key(ip, email)
        window_seconds = window_minutes * 60
        now = time.time()

        with self._lock:
            attempts = self._failures.get(key, [])
            valid_attempts = [t for t in attempts if (now - t) < window_seconds]
            if len(valid_attempts) != len(attempts):
                if valid_attempts:
                    self._failures[key] = valid_attempts
                else:
                    self._failures.pop(key, None)
            return len(valid_attempts) >= max_attempts

    def record_failure(self, ip: str, email: str, window_minutes: int) -> None:
        """Records a failed login attempt with the current timestamp."""
        key = self._normalize_key(ip, email)
        window_seconds = window_minutes * 60
        now = time.time()

        with self._lock:
            attempts = self._failures.get(key, [])
            valid_attempts = [t for t in attempts if (now - t) < window_seconds]
            valid_attempts.append(now)
            self._failures[key] = valid_attempts

    def clear(self, ip: str, email: str) -> None:
        """Clears failed attempts counter after a successful login."""
        key = self._normalize_key(ip, email)
        with self._lock:
            self._failures.pop(key, None)

    def cleanup_old_entries(self, window_minutes: int = 60) -> None:
        """Prunes stale rate limiting records older than the specified retention window."""
        window_seconds = window_minutes * 60
        now = time.time()

        with self._lock:
            stale_keys = []
            for key, attempts in self._failures.items():
                valid = [t for t in attempts if (now - t) < window_seconds]
                if not valid:
                    stale_keys.append(key)
                else:
                    self._failures[key] = valid
            for k in stale_keys:
                self._failures.pop(k, None)


login_rate_limiter = LoginRateLimiter()
