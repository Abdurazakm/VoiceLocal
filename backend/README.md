# Backend Structure (Scaffold)

This backend is organized with a src/ layout, split settings, and app namespaces for maintainability.

Directory tree (initial scaffold)

backend/
  README.md
  .env.example
  requirements.txt
  manage.py                  # placeholder; will be finalized after Django init
  src/
    server/                  # Django project package (config)
      __init__.py
      settings/
        __init__.py
        base.py              # common settings (placeholder)
        dev.py               # dev overrides (placeholder)
        prod.py              # prod overrides (placeholder)
      urls.py                # placeholder
      asgi.py                # placeholder
      wsgi.py                # placeholder
    apps/
      __init__.py
      common/                # cross-app utilities (placeholder)
        __init__.py
      accounts/              # auth/profile (placeholder)
        __init__.py
      issues/                # core domain app (placeholder)
        __init__.py
        models.py
        serializers.py
        views.py
        urls.py
        admin.py
        apps.py
  tests/
    __init__.py
    test_smoke.py            # placeholder
  scripts/
    README.md
  static/
    .gitkeep
  media/
    .gitkeep

Next steps
- Follow BACKEND-SETUP.md to initialize Django, configure settings, and start implementing apps.
- Update manage.py to point DJANGO_SETTINGS_MODULE to server.settings.dev once ready.
