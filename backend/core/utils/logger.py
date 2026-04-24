from datetime import datetime


def _print(message: str, level: str = "INFO") -> None:
    """Print formatted log message with timestamp and level."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] [{level}] {message}")


def info(message: str) -> None:
    """Log info message."""
    _print(message, "INFO")


def success(message: str) -> None:
    """Log success message."""
    _print(message, "SUCCESS")


def warning(message: str) -> None:
    """Log warning message."""
    _print(message, "WARNING")


def error(message: str) -> None:
    """Log error message."""
    _print(message, "ERROR")


def debug(message: str) -> None:
    """Log debug message."""
    _print(message, "DEBUG")
