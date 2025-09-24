"""Django models for Category, Issue, Comment, Vote.

These models reflect the frontend's current expectations and the ERD:
- Category: name (unique), color (hex), description
- Issue: title, description, location, image_url, status, priority, category, author (FK to auth.User), soft delete, timestamps
- Comment: issue FK, author FK, content, timestamps, soft delete
- Vote: unique per (issue, user), value in {up, down}

Aggregates (up/down counts) will be computed via annotations in the API layer.
"""

from __future__ import annotations

from django.conf import settings
from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=64, unique=True)
    color = models.CharField(max_length=7, blank=True, help_text="#RRGGBB")
    description = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:  # pragma: no cover - trivial
        return self.name


class Issue(models.Model):
    class Status(models.TextChoices):
        OPEN = "open", "Open"
        IN_PROGRESS = "in-progress", "In Progress"
        RESOLVED = "resolved", "Resolved"
        REJECTED = "rejected", "Rejected"

    class Priority(models.TextChoices):
        LOW = "low", "Low"
        MEDIUM = "medium", "Medium"
        HIGH = "high", "High"

    title = models.CharField(max_length=200)
    description = models.TextField()
    location = models.CharField(max_length=200, blank=True)
    image_url = models.URLField(blank=True)

    status = models.CharField(max_length=12, choices=Status.choices, default=Status.OPEN)
    priority = models.CharField(max_length=6, choices=Priority.choices, blank=True)

    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name="issues")
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="issues")

    is_deleted = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["status"]),
            models.Index(fields=["priority"]),
            models.Index(fields=["created_at"]),
        ]
        ordering = ["-created_at"]

    def __str__(self) -> str:  # pragma: no cover - trivial
        return f"{self.title}"


class Comment(models.Model):
    issue = models.ForeignKey(Issue, on_delete=models.CASCADE, related_name="comments")
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="comments")
    content = models.TextField()
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["created_at"]


class Vote(models.Model):
    class VoteType(models.TextChoices):
        UP = "up", "Upvote"
        DOWN = "down", "Downvote"

    issue = models.ForeignKey(Issue, on_delete=models.CASCADE, related_name="votes")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="votes")
    type = models.CharField(max_length=4, choices=VoteType.choices)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("issue", "user")
        indexes = [models.Index(fields=["issue", "user"])]
