"""DRF serializers for Issue, Comment, Vote, Category."""

from __future__ import annotations

from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Category, Issue, Comment, Vote


class UserBriefSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ("id", "username", "first_name", "last_name")


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ("id", "name", "color", "description", "created_at", "updated_at")
        read_only_fields = ("id", "created_at", "updated_at")


class CommentSerializer(serializers.ModelSerializer):
    author = UserBriefSerializer(read_only=True)
    authorId = serializers.PrimaryKeyRelatedField(
        source="author", queryset=get_user_model().objects.all(), write_only=True
    )

    class Meta:
        model = Comment
        fields = (
            "id",
            "author",
            "authorId",
            "content",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at", "author")


class IssueSerializer(serializers.ModelSerializer):
    author = UserBriefSerializer(read_only=True)
    authorId = serializers.PrimaryKeyRelatedField(
        source="author", queryset=get_user_model().objects.all(), write_only=True, required=False
    )
    category = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), allow_null=True, required=False
    )
    imageUrl = serializers.URLField(source="image_url", allow_blank=True, required=False)
    isDeleted = serializers.BooleanField(source="is_deleted", required=False)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    updatedAt = serializers.DateTimeField(source="updated_at", read_only=True)
    upvotes = serializers.IntegerField(read_only=True)
    downvotes = serializers.IntegerField(read_only=True)

    comments = CommentSerializer(many=True, read_only=True)

    class Meta:
        model = Issue
        fields = (
            "id",
            "title",
            "description",
            "location",
            "imageUrl",
            "status",
            "priority",
            "category",
            "author",
            "authorId",
            "isDeleted",
            "createdAt",
            "updatedAt",
            "upvotes",
            "downvotes",
            "comments",
        )
        read_only_fields = ("id", "author", "createdAt", "updatedAt", "upvotes", "downvotes", "comments")


class VoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vote
        fields = ("id", "issue", "user", "type", "created_at")
        read_only_fields = ("id", "created_at")
