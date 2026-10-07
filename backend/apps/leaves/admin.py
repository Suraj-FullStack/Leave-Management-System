from django.contrib import admin
from .models import LeaveType, LeaveBalance, LeaveRequest


@admin.register(LeaveType)
class LeaveTypeAdmin(admin.ModelAdmin):
    list_display = ("name", "max_days_per_year", "requires_approval", "is_active")
    list_filter = ("requires_approval", "is_active")
    search_fields = ("name",)
    ordering = ("name",)


@admin.register(LeaveBalance)
class LeaveBalanceAdmin(admin.ModelAdmin):
    list_display = ("employee", "leave_type", "year", "total_days", "days_taken", "days_pending", "days_available")
    list_filter = ("year", "leave_type")
    search_fields = ("employee__email", "employee__first_name", "employee__last_name")
    ordering = ("-year", "employee__email")
    readonly_fields = ("days_available",)

    def days_available(self, obj):
        return obj.days_available
    days_available.short_description = "Days Available"


@admin.register(LeaveRequest)
class LeaveRequestAdmin(admin.ModelAdmin):
    list_display = (
        "id_short", "employee", "leave_type", "start_date", "end_date",
        "num_days", "status", "applied_on", "reviewed_by",
    )
    list_filter = ("status", "leave_type", "start_date")
    search_fields = (
        "employee__email", "employee__first_name", "employee__last_name",
        "reason", "manager_comment",
    )
    ordering = ("-applied_on",)
    readonly_fields = ("id", "applied_on", "num_days")
    date_hierarchy = "applied_on"

    fieldsets = (
        ("Request", {"fields": ("id", "employee", "leave_type", "start_date", "end_date", "num_days", "reason", "applied_on")}),
        ("Review", {"fields": ("status", "reviewed_by", "reviewed_on", "manager_comment")}),
    )

    def id_short(self, obj):
        return str(obj.id)[:8] + "…"
    id_short.short_description = "ID"
