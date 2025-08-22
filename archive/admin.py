from django.contrib import admin
from .models import Band, Member, Song, Like, Comment

@admin.register(Band)
class BandAdmin(admin.ModelAdmin):
    list_display = ('name', 'genre')
    search_fields = ('name', 'genre')

@admin.register(Member)
class MemberAdmin(admin.ModelAdmin):
    list_display = ('name', 'role', 'band')
    list_filter = ('band',)
    search_fields = ('name', 'role')

@admin.register(Song)
class SongAdmin(admin.ModelAdmin):
    list_display = ('title', 'band')
    list_filter = ('band',)
    search_fields = ('title',)

@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display = ('band', 'session_key')

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('band', 'content', 'created_at')
    list_filter = ('band', 'created_at')
    search_fields = ('content',)
