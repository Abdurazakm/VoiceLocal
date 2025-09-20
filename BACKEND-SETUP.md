# VoiceLocal Backend: Step-by-Step Setup → Deployment (Django + MySQL)

This guide walks you through setting up a production-ready Django REST API backed by MySQL for VoiceLocal, integrating with the existing React/Vite frontend, and deploying with Docker Compose.

Sections
- 0) Overview and goals
- 1) Prerequisites (Windows)
- 2) Project layout and environment variables
- 3) Create virtual environment and install dependencies
- 4) Initialize Django project & app
- 5) Configure Django settings (DB, CORS, DRF, JWT)
- 6) Define database models
- 7) Serializers (DRF)
- 8) Views & Routers (DRF ViewSets, nested)
- 9) URL routing
- 10) Migrations & superuser
- 11) Local run
- 12) Frontend integration
- 13) Optional seeding
- 14) Deployment with Docker Compose (Django + MySQL + Nginx)
- 15) Security hardening checklist
- 16) Maintenance & troubleshooting


0) Overview and goals
- Replace mock contexts with a real REST API.
- Authenticate with JWT.
- Persist issues, comments, votes, categories, and users.
- Provide admin moderation capabilities.

Data model (high-level)
- User (role: user/admin/moderator, profile fields)
- Category
- Issue (status, priority, category, author, soft delete, timestamps, imageUrl)
- Vote (unique per user/issue; type: up|down)
- Comment (issue, author, content)


1) Prerequisites (Windows)
- Python 3.11+
- Node.js 18+ (for frontend; already present)
- MySQL Server 8.x (or Docker Desktop if you will run MySQL via compose)
- PowerShell (pwsh) – you are using 5.1
- Optional: Docker Desktop (for containerized deployment)


2) Project layout and environment variables
Recommended layout (your repo already has backend/ and frontend/):

```text path=null start=null
VoiceLocal/
  backend/
  frontend/
  BACKEND.md
  BACKEND-SETUP.md
```

Create environment file for backend (do not commit):
```ini path=null start=null
# backend/.env
DJANGO_SECRET_KEY={{generate_a_strong_secret}}
DJANGO_DEBUG=True
DB_NAME=voicelocal
DB_USER=voicelocal_user
DB_PASSWORD={{VOICELocal_DB_PASSWORD}}
DB_HOST=127.0.0.1
DB_PORT=3306
CORS_ALLOWED_ORIGINS=http://localhost:5173
```


3) Create virtual environment and install dependencies
```powershell path=null start=null
# From project root
py -m venv backend\.venv
backend\.venv\Scripts\Activate.ps1

pip install --upgrade pip wheel
pip install Django djangorestframework djangorestframework-simplejwt django-cors-headers django-filter python-dotenv drf-nested-routers

# MySQL driver (preferred):
pip install mysqlclient
# If mysqlclient fails on Windows due to build tools, fallback to PyMySQL:
# pip install PyMySQL
```


4) Initialize Django project & app
```powershell path=null start=null
cd backend
# Create Django project in current folder
django-admin startproject server .
# Create app for domain models and APIs
python manage.py startapp issues
```


5) Configure Django settings (DB, CORS, DRF, JWT)
Edit server/settings.py:
```python path=null start=null
from pathlib import Path
import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()
BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv("DJANGO_SECRET_KEY")
DEBUG = os.getenv("DJANGO_DEBUG", "False").lower() == "true"
ALLOWED_HOSTS = ["*"]  # tighten for prod

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Third-party
    "rest_framework",
    "corsheaders",
    "django_filters",
    # Local
    "issues",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "server.urls"
TEMPLATES = [{
    "BACKEND": "django.template.backends.django.DjangoTemplates",
    "DIRS": [],
    "APP_DIRS": True,
    "OPTIONS": {
        "context_processors": [
            "django.template.context_processors.debug",
            "django.template.context_processors.request",
            "django.contrib.auth.context_processors.auth",
            "django.contrib.messages.context_processors.messages",
        ],
    },
}]
WSGI_APPLICATION = "server.wsgi.application"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.mysql",
        "NAME": os.getenv("DB_NAME"),
        "USER": os.getenv("DB_USER"),
        "PASSWORD": os.getenv("DB_PASSWORD"),
        "HOST": os.getenv("DB_HOST", "127.0.0.1"),
        "PORT": os.getenv("DB_PORT", "3306"),
        "OPTIONS": {"charset": "utf8mb4"},
    }
}

# If using PyMySQL instead of mysqlclient, add to server/__init__.py:
# import pymysql
# pymysql.install_as_MySQLdb()

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.OrderingFilter",
        "rest_framework.filters.SearchFilter",
    ],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 10,
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "AUTH_HEADER_TYPES": ("Bearer",),
}

CORS_ALLOWED_ORIGINS = os.getenv("CORS_ALLOWED_ORIGINS", "").split()
STATIC_URL = "static/"
```

If using PyMySQL, create server/__init__.py:
```python path=null start=null
import pymysql
pymysql.install_as_MySQLdb()
```


6) Define database models
Create issues/models.py:
```python path=null start=null
from django.db import models
from django.contrib.auth.models import User

class Profile(models.Model):
    ROLE_CHOICES = [("user", "User"), ("admin", "Admin"), ("moderator", "Moderator")]
    STATUS_CHOICES = [("Active", "Active"), ("Inactive", "Inactive"), ("Suspended", "Suspended")]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    role = models.CharField(max_length=16, choices=ROLE_CHOICES, default="user")
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default="Active")
    avatar = models.URLField(null=True, blank=True)
    location = models.CharField(max_length=255, null=True, blank=True)
    bio = models.TextField(null=True, blank=True)
    joined_at = models.DateTimeField(auto_now_add=True)

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.CharField(max_length=255, blank=True)
    color = models.CharField(max_length=9, default="#3B82F6")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Issue(models.Model):
    STATUS_CHOICES = [("open","Open"),("in-progress","In Progress"),("resolved","Resolved"),("rejected","Rejected")]
    PRIORITY_CHOICES = [("low","Low"),("medium","Medium"),("high","High")]

    title = models.CharField(max_length=255)
    description = models.TextField()
    location = models.CharField(max_length=255)
    image_url = models.URLField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="open")
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default="medium")
    category = models.ForeignKey(Category, null=True, blank=True, on_delete=models.SET_NULL, related_name="issues")

    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="issues")
    is_deleted = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Vote(models.Model):
    VOTE_CHOICES = [("up","Up"),("down","Down")]
    issue = models.ForeignKey(Issue, related_name="votes", on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    type = models.CharField(max_length=10, choices=VOTE_CHOICES)
    class Meta:
        unique_together = ("issue","user")

class Comment(models.Model):
    issue = models.ForeignKey(Issue, related_name="comments", on_delete=models.CASCADE)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(null=True, blank=True)
```

Signals to auto-create Profile on user creation (optional):
```python path=null start=null
# issues/apps.py
from django.apps import AppConfig

class IssuesConfig(AppConfig):
    name = "issues"

    def ready(self):
        from django.db.models.signals import post_save
        from django.contrib.auth.models import User
        from .models import Profile

        def create_profile(sender, instance, created, **kwargs):
            if created:
                Profile.objects.create(user=instance)
        post_save.connect(create_profile, sender=User)
```

Register the app config in issues/__init__.py:
```python path=null start=null
default_app_config = "issues.apps.IssuesConfig"
```


7) Serializers (DRF)
```python path=null start=null
# issues/serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Issue, Comment, Vote, Category, Profile

class UserSerializer(serializers.ModelSerializer):
    role = serializers.CharField(source="profile.role", read_only=True)
    status = serializers.CharField(source="profile.status", read_only=True)
    avatar = serializers.CharField(source="profile.avatar", read_only=True)
    location = serializers.CharField(source="profile.location", read_only=True)
    bio = serializers.CharField(source="profile.bio", read_only=True)
    joinedAt = serializers.DateTimeField(source="profile.joined_at", read_only=True)

    class Meta:
        model = User
        fields = ["id","username","email","first_name","last_name","role","status","avatar","location","bio","joinedAt"]

class CommentSerializer(serializers.ModelSerializer):
    authorName = serializers.SerializerMethodField()
    authorId = serializers.IntegerField(source="author.id", read_only=True)

    class Meta:
        model = Comment
        fields = ["id","authorId","authorName","content","created_at","updated_at"]
        read_only_fields = ["id","authorId","authorName","created_at","updated_at"]

    def get_authorName(self, obj):
        full = f"{obj.author.first_name} {obj.author.last_name}".strip()
        return full or obj.author.username

class IssueSerializer(serializers.ModelSerializer):
    upvotes = serializers.IntegerField(read_only=True)
    downvotes = serializers.IntegerField(read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    author = serializers.SerializerMethodField()
    authorId = serializers.IntegerField(source="author.id", read_only=True)
    categoryName = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = Issue
        fields = [
            "id","title","description","location","image_url","status","category","categoryName",
            "priority","upvotes","downvotes","comments","author","authorId","created_at","updated_at","is_deleted"
        ]
        read_only_fields = ["id","upvotes","downvotes","comments","author","authorId","created_at","updated_at"]

    def get_author(self, obj):
        full = f"{obj.author.first_name} {obj.author.last_name}".strip()
        return full or obj.author.username
```


8) Views & Routers (DRF ViewSets, nested)
```python path=null start=null
# issues/views.py
from django.db.models import Count, Q
from rest_framework import viewsets, permissions, decorators, response, status
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from .models import Issue, Comment, Vote, Category
from .serializers import IssueSerializer, CommentSerializer, UserSerializer

class IsAuthorOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        # Issue and Comment share `author` ownership
        author_id = getattr(obj, "author_id", None)
        return author_id == request.user.id or request.user.is_staff

class IssueViewSet(viewsets.ModelViewSet):
    serializer_class = IssueSerializer
    permission_classes = [IsAuthenticated & IsAuthorOrReadOnly]
    filterset_fields = ["status","category","priority","is_deleted"]
    search_fields = ["title","description","location","author__username"]
    ordering_fields = ["created_at","updated_at"]

    def get_queryset(self):
        return (
            Issue.objects
            .filter()
            .annotate(
                upvotes=Count("votes", filter=Q(votes__type="up")),
                downvotes=Count("votes", filter=Q(votes__type="down"))
            )
        )

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    @decorators.action(methods=["post"], detail=True, permission_classes=[IsAuthenticated])
    def vote(self, request, pk=None):
        issue = self.get_object()
        vote_type = request.data.get("type")
        if vote_type not in ["up","down"]:
            return response.Response({"detail":"Invalid vote"}, status=400)
        Vote.objects.update_or_create(issue=issue, user=request.user, defaults={"type": vote_type})
        return response.Response(status=status.HTTP_204_NO_CONTENT)

    @decorators.action(methods=["post"], detail=True, permission_classes=[IsAuthenticated])
    def restore(self, request, pk=None):
        issue = self.get_object()
        issue.is_deleted = False
        issue.save(update_fields=["is_deleted"])
        return response.Response(status=204)

class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated & IsAuthorOrReadOnly]

    def get_queryset(self):
        return Comment.objects.filter(issue_id=self.kwargs["issue_pk"]).select_related("author")

    def perform_create(self, serializer):
        serializer.save(author=self.request.user, issue_id=self.kwargs["issue_pk"])

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    permission_classes = [IsAuthenticated]
    serializer_class = serializers.ModelSerializer  # or create a dedicated serializer

class MeViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):  # GET /api/me/
        return response.Response(UserSerializer(request.user).data)
```


9) URL routing
```python path=null start=null
# server/urls.py
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested.routers import NestedSimpleRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from issues.views import IssueViewSet, CommentViewSet, CategoryViewSet, MeViewSet

router = DefaultRouter()
router.register(r"issues", IssueViewSet, basename="issues")
router.register(r"categories", CategoryViewSet, basename="categories")
router.register(r"me", MeViewSet, basename="me")

nested = NestedSimpleRouter(router, r"issues", lookup="issue")
nested.register(r"comments", CommentViewSet, basename="issue-comments")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/", include(router.urls)),
    path("api/", include(nested.urls)),
]
```


10) Migrations & superuser
```powershell path=null start=null
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```


11) Local run
```powershell path=null start=null
# Ensure backend venv is active
python manage.py runserver 0.0.0.0:8000
```
- Add `http://localhost:5173` to `CORS_ALLOWED_ORIGINS` if not already.


12) Frontend integration
- Frontend env: create `frontend/.env.local`:
```ini path=null start=null
VITE_API_BASE_URL=http://localhost:8000/api
```
- Replace mock contexts incrementally (see BACKEND.md for contracts):
  - AuthContext: POST /api/token/, store tokens, GET /api/me/
  - IssueContext: GET/POST/PATCH/DELETE /issues/, vote, nested comments


13) Optional seeding
Create a simple management command or use Django admin to add Categories (Infrastructure, Safety, Parks, Transportation) so filters work meaningfully.


14) Deployment with Docker Compose (Django + MySQL + Nginx)

Dockerfile (backend/Dockerfile):
```dockerfile path=null start=null
FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /app

RUN apt-get update && apt-get install -y build-essential default-libmysqlclient-dev && rm -rf /var/lib/apt/lists/*
COPY backend/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

COPY backend /app

# Collect static if you have any (optional)
# RUN python manage.py collectstatic --noinput

CMD ["gunicorn", "server.wsgi:application", "--bind", "0.0.0.0:8000"]
```

Generate backend/requirements.txt from your venv:
```powershell path=null start=null
pip freeze > backend\requirements.txt
```

docker-compose.yml (root):
```yaml path=null start=null
version: "3.9"
services:
  db:
    image: mysql:8.0
    restart: always
    environment:
      MYSQL_DATABASE: voicelocal
      MYSQL_USER: voicelocal_user
      MYSQL_PASSWORD: ${DB_PASSWORD}
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
    ports:
      - "3306:3306"
    volumes:
      - db_data:/var/lib/mysql
    command: ["--default-authentication-plugin=mysql_native_password", "--character-set-server=utf8mb4", "--collation-server=utf8mb4_unicode_ci"]

  backend:
    build:
      context: .
      dockerfile: backend/Dockerfile
    env_file:
      - backend/.env
    environment:
      DJANGO_DEBUG: "False"
      DB_HOST: db
    depends_on:
      - db
    ports:
      - "8000:8000"

  # Optional: nginx reverse proxy for production
  nginx:
    image: nginx:stable
    depends_on:
      - backend
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro

volumes:
  db_data:
```

Nginx config (nginx.conf):
```nginx path=null start=null
server {
  listen 80;
  server_name _;

  location /api/ {
    proxy_pass http://backend:8000/api/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

Bring up stack:
```powershell path=null start=null
# Ensure Docker Desktop is running
# In project root
$env:DB_PASSWORD = "{{VOICELocal_DB_PASSWORD}}"
$env:DB_ROOT_PASSWORD = "{{MYSQL_ROOT_PASSWORD}}"
docker compose up -d --build

# Initialize DB (inside backend container)
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py createsuperuser
```


15) Security hardening checklist
- Set `DJANGO_DEBUG=False` in production.
- Set `ALLOWED_HOSTS` explicitly (domain/IP).
- Generate strong `DJANGO_SECRET_KEY` and keep it secret.
- Use HTTPS/SSL at the reverse proxy (Nginx/Cloud provider).
- Restrict CORS to trusted origins only.
- Rotate JWT lifetimes appropriately; consider refresh token rotation.
- Create admin users sparingly; enforce strong passwords.
- Back up MySQL regularly; enforce non-root DB user for app.


16) Maintenance & troubleshooting
- Migrations
```powershell path=null start=null
python manage.py makemigrations
python manage.py migrate
```
- Creating initial data (admin)
```powershell path=null start=null
python manage.py shell
```
```python path=null start=null
from issues.models import Category
Category.objects.get_or_create(name="Infrastructure", defaults={"color":"#3B82F6"})
```
- mysqlclient build issues on Windows
  - Install Microsoft C++ Build Tools, or fallback to `PyMySQL` with the `server/__init__.py` shim shown above.
- CORS errors
  - Ensure `CORS_ALLOWED_ORIGINS` includes your frontend origin, and that you are using the correct `VITE_API_BASE_URL`.
- 502/Bad Gateway behind Nginx
  - Confirm backend container name/port matches `proxy_pass` URL.

---
You can now point your frontend to `VITE_API_BASE_URL=http://localhost:8000/api` locally, and to your deployed domain in production. Follow BACKEND.md for precise data contracts and this document for execution steps.
