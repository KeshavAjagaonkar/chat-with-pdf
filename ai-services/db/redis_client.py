import os
import redis
import logging

logger = logging.getLogger(__name__)

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

try:
    # Initialize connection pool for high-performance Redis socket re-use
    redis_pool = redis.ConnectionPool.from_url(REDIS_URL, decode_responses=True)
    redis_client = redis.Redis(connection_pool=redis_pool)
    logger.info("Redis Connection Pool initialized successfully")
except Exception as e:
    logger.error(f"Failed to connect to Redis: {e}")
    redis_client = None # Graceful fallback if Redis is down
