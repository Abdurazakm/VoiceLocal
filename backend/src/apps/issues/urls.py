"""Issues app URL routing using DRF routers (including nested comments)."""

from __future__ import annotations

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested.routers import NestedDefaultRouter

from .views import CategoryViewSet, IssueViewSet, CommentViewSet


router = DefaultRouter()
router.register(r"categories", CategoryViewSet, basename="category")
router.register(r"issues", IssueViewSet, basename="issue")

issues_router = NestedDefaultRouter(router, r"issues", lookup="issue")
issues_router.register(r"comments", CommentViewSet, basename="issue-comments")


urlpatterns = [
    path("", include(router.urls)),
    path("", include(issues_router.urls)),
]
