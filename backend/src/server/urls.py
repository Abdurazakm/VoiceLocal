from django.contrib import admin
from django.http import JsonResponse
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from django.contrib.auth import get_user_model
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


def health(_request):
    return JsonResponse({"status": "ok"})

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    User = get_user_model()
    user: User = request.user
    data = {
        "id": user.id,
        "username": user.username,
        "email": getattr(user, "email", ""),
        "firstName": getattr(user, "first_name", ""),
        "lastName": getattr(user, "last_name", ""),
        "isActive": user.is_active,
    }
    return Response(data)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("health/", health, name="health"),
    # Auth (JWT)
    path("api/auth/login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    # Current user endpoint
    path("api/me/", me, name="api_me"),
    # App APIs
    path("api/", include("apps.issues.urls")),
]
