import os
import logging
from psycopg2.pool import ThreadedConnectionPool
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is missing")

try:
    # Initialize connection pool: min=2, max=20 active connections
    connection_pool = ThreadedConnectionPool(
        minconn=2,
        maxconn=20,
        dsn=DATABASE_URL
    )
    logger.info("PostgreSQL ThreadedConnectionPool initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize PostgreSQL connection pool: {e}")
    raise e
