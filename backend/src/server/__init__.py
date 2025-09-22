"""Django project package (configuration)."""
# Enable PyMySQL as MySQLdb (Windows-friendly) if available
try:
    import pymysql  # type: ignore

    pymysql.install_as_MySQLdb()
except Exception:
    # If PyMySQL isn't installed, Django will use mysqlclient when available.
    pass
