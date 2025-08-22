from django.urls import path
from . import views

urlpatterns = [
    path('', views.band_list, name='band_list'),
    path('band/<int:band_id>/', views.band_detail, name='band_detail'),
    path('band/<int:band_id>/like/', views.like_band, name='like_band'),
]
