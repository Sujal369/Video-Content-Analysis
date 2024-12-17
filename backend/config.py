# backend/config.py

import os

class Config:
    # Configuring MongoDB URI (adjust according to your MongoDB setup)
    MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/your_database_name')

    # Secret key for session management (e.g., for login sessions, CSRF protection)
    SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-here')
