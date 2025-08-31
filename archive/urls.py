from django.urls import path
from . import views

app_name = 'archive'

urlpatterns = [
    path('', views.BandListView.as_view(), name='home'),
    path('bands/<int:pk>/', views.BandDetailView.as_view(), name='detail'),
    path('bands/<int:pk>/like/', views.like_band, name='like'),
    path('bands/<int:pk>/comments/add/', views.add_comment, name='add_comment'),
    path('bands/<int:pk>/comments/', views.comments_list, name='comments_list'),
    path('bands/<int:pk>/comments/<int:cid>/edit/', views.edit_comment, name='edit_comment'),
    path('bands/<int:pk>/comments/<int:cid>/delete/', views.delete_comment, name='delete_comment'),
    path('bands/<int:pk>/stats/', views.band_stats, name='band_stats'),
]
