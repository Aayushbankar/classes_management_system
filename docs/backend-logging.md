# Server-Side Logging Strategy

For a production environment like Render, a robust logging strategy is essential for monitoring financial transactions and debugging system errors.

## 1. Django Configuration

Add the following to your `backend/config/settings.py` to enable structured logging.

```python
import os

# Create logs directory if it doesn't exist
LOGS_DIR = BASE_DIR / 'logs'
if not os.path.exists(LOGS_DIR):
    os.makedirs(LOGS_DIR)

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'standard': {
            'format': '%(asctime)s [%(levelname)s] %(name)s: %(message)s'
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'standard',
        },
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': LOGS_DIR / 'eklavya.log',
            'formatter': 'standard',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': True,
        },
        'finance': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}
```

## 2. Key Logging Points

### A. Authentication
Log login attempts and failures in `authentication/views.py`.
```python
logger = logging.getLogger('django')
logger.warning(f"Failed login attempt for username: {username}")
```

### B. Financial Transactions
Log every fee payment record in `finance/views.py`.
```python
logger = logging.getLogger('finance')
logger.info(f"Payment Created: {payment.id} | Student: {payment.student.name} | Amount: {payment.amount}")
```

### C. PDF Generation
Log errors during PDF rendering in `finance/utils.py`.
```python
if pdf.err:
    logger.error(f"PDF Rendering Error: {pdf.err}")
```

## 3. Production Monitoring (Render)
When deploying to Render, the `console` handler is the most important as Render captures everything sent to `stdout`/`stderr`. You can view these logs in the Render Dashboard under the "Logs" tab.
