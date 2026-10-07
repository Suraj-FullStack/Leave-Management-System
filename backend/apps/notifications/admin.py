from django.contrib import admin
from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("recipient", "message_short", "is_read", "created_at")
    list_filter = ("is_read", "created_at")
    search_fields = ("recipient__email", "recipient__first_name", "message")
    ordering = ("-created_at",)
    readonly_fields = ("created_at",)
    date_hierarchy = "created_at"
    actions = ["mark_as_read", "mark_as_unread"]

    def message_short(self, obj):
        return obj.message[:80] + ("…" if len(obj.message) > 80 else "")
    message_short.short_description = "Message"

    @admin.action(description="Mark selected notifications as read")
    def mark_as_read(self, request, queryset):
        updated = queryset.update(is_read=True)
        self.message_user(request, f"{updated} notification(s) marked as read.")

    @admin.action(description="Mark selected notifications as unread")
    def mark_as_unread(self, request, queryset):
        updated = queryset.update(is_read=False)
        self.message_user(request, f"{updated} notification(s) marked as unread.")
