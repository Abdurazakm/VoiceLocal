"""DRF viewsets and endpoints for issues, comments, votes, categories."""

from __future__ import annotations

from django.db.models import Count, Q
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Category, Issue, Comment, Vote
from .serializers import CategorySerializer, IssueSerializer, CommentSerializer, VoteSerializer


class IsAuthorOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):  # type: ignore[override]
        if request.method in permissions.SAFE_METHODS:
            return True
        author = getattr(obj, "author", None)
        return author == request.user or request.user.is_staff


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filterset_fields = ["name", "created_at"]
    ordering_fields = ["name", "created_at"]
    search_fields = ["name", "description"]


class IssueViewSet(viewsets.ModelViewSet):
    serializer_class = IssueSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsAuthorOrReadOnly]
    filterset_fields = ["status", "priority", "category", "author"]
    ordering_fields = ["created_at", "updated_at", "title"]
    search_fields = ["title", "description", "location"]

    def get_queryset(self):
        base = (
            Issue.objects.select_related("category", "author")
            .prefetch_related("comments")
            .filter(is_deleted=False)
        )
        # Annotate vote counts
        base = base.annotate(
            upvotes=Count("votes", filter=Q(votes__type=Vote.VoteType.UP)),
            downvotes=Count("votes", filter=Q(votes__type=Vote.VoteType.DOWN)),
        )
        return base

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def perform_destroy(self, instance):
        instance.is_deleted = True
        instance.save(update_fields=["is_deleted"])

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def vote(self, request, pk=None):
        issue = self.get_object()
        vote_type = request.data.get("type")
        if vote_type not in (Vote.VoteType.UP, Vote.VoteType.DOWN):
            return Response({"detail": "Invalid vote type"}, status=status.HTTP_400_BAD_REQUEST)

        vote, created = Vote.objects.get_or_create(issue=issue, user=request.user, defaults={"type": vote_type})
        if not created:
            if vote.type == vote_type:
                # toggling off
                vote.delete()
            else:
                vote.type = vote_type
                vote.save(update_fields=["type"])

        # Return updated counts
        counts = Issue.objects.filter(pk=issue.pk).annotate(
            upvotes=Count("votes", filter=Q(votes__type=Vote.VoteType.UP)),
            downvotes=Count("votes", filter=Q(votes__type=Vote.VoteType.DOWN)),
        ).values("upvotes", "downvotes").first()
        return Response(counts)


class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsAuthorOrReadOnly]
    filterset_fields = ["author"]
    ordering_fields = ["created_at", "updated_at"]
    search_fields = ["content"]

    def get_queryset(self):
        return Comment.objects.filter(issue_id=self.kwargs["issue_pk"], is_deleted=False).select_related("author")

    def perform_create(self, serializer):
        issue = Issue.objects.get(pk=self.kwargs["issue_pk"])  # will 404 via DRF if missing
        serializer.save(author=self.request.user, issue=issue)

    def perform_destroy(self, instance):
        instance.is_deleted = True
        instance.save(update_fields=["is_deleted"])
