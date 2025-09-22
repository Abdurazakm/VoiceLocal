from .base import *  # noqa

DEBUG = False
# Expect ALLOWED_HOSTS via env in base.py; add production hardening here if needed
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
