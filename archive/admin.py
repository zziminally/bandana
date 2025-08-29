from django.contrib import admin
from django.utils.html import format_html
from .models import Band, Member, SetListItem, Comment


class MemberInline(admin.TabularInline):
    model = Member
    extra = 1


class SetListInline(admin.TabularInline):
    model = SetListItem
    extra = 1


@admin.register(Band)
class BandAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'likes_count', 'profile_thumbnail', 'playlist_url')
    readonly_fields = ('likes_count',)
    inlines = [MemberInline, SetListInline]
    search_fields = ('name',)

    def profile_thumbnail(self, obj):
        if obj.profile_image:
            return format_html(
                '<img src="{}" style="height:48px;width:48px;border-radius:50%;object-fit:cover;" />',
                obj.profile_image.url
            )
        return "-"
    profile_thumbnail.short_description = "프로필"


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('id', 'band', 'short_text', 'created_at')
    list_filter = ('band', 'created_at')
    readonly_fields = ('created_at',)

    def short_text(self, obj):
        return obj.text[:60]
    short_text.short_description = "내용"
