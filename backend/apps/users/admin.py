from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ("email", "username", "full_name", "role", "department", "is_active", "date_joined")
    list_filter = ("role", "is_active", "is_staff", "department")
    search_fields = ("email", "username", "first_name", "last_name", "department")
    ordering = ("-date_joined",)
    readonly_fields = ("id", "date_joined", "last_login")

    fieldsets = (
        (None, {"fields": ("id", "email", "username", "password")}),
        ("Personal Info", {"fields": ("first_name", "last_name")}),
        ("Work Info", {"fields": ("role", "department", "manager")}),
        ("Permissions", {
            "fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions"),
            "classes": ("collapse",),
        }),
        ("Important Dates", {"fields": ("last_login", "date_joined"), "classes": ("collapse",)}),
    )

    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "username", "first_name", "last_name", "role", "department", "manager", "password1", "password2"),
        }),
    )

    def full_name(self, obj):
        return obj.get_full_name() or "—"
    full_name.short_description = "Full Name"
