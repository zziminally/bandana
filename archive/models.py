from django.db import models
from django.utils import timezone

class Band(models.Model):
    PROFILE_IMAGE_CHOICES = [
        ('bands/images/blue_profile.png', '파란 프로필'),
        ('bands/images/undefined66_profile.jpg', 'Undefined66 프로필'),
        ('bands/images/what4ever_profile.png', 'WHAT4EVER 프로필'),
        ('bands/images/release_profile.png', '릴리즈 프로필'),
        ('bands/images/jazzpeople_profile.jpg', '재찾사 프로필'),
        ('bands/images/firstint_profile.png', '초심 프로필'),
        ('bands/images/rhythm_profile.png', '리듬군단 프로필'),
        ('bands/images/entrophy_profile.png', '엔트로피 프로필'),
    ]
    DES_IMAGE_CHOICES = [
        ('bands/images/undefined66_des.jpg', 'Undefined66 소개'),
        ('bands/images/what4ever_des.jpeg', 'WHAT4EVER 소개'),
        ('bands/images/rhythm_des.jpeg', '리듬군단 소개'),
        ('bands/images/release_des.jpeg', '릴리즈 소개'),
        ('bands/images/baedangjoo_des.jpg', '배당주 소개'),
        ('bands/images/entrophy_des.jpeg', '엔트로피 소개'),
        ('bands/images/jazzpeople_des.jpeg', '재찾사 소개'),
        ('bands/images/firstint_des.jpg', '초심 소개'),
        ('bands/images/blue_des.png', '파란 소개'),
        ('bands/images/hathow9y_des.jpg', '해쏘웨이 소개'),
    ]
    name = models.CharField(max_length=200)
    profile_image = models.CharField(max_length=200, choices=PROFILE_IMAGE_CHOICES, blank=True, null=True)
    description_image = models.CharField(max_length=200, choices=DES_IMAGE_CHOICES, blank=True, null=True)
    playlist_url = models.URLField(blank=True, null=True)  # "플레이리스트 들으러 가기" 링크
    likes_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['id']

    def __str__(self):
        return self.name


class Member(models.Model):
    band = models.ForeignKey(Band, on_delete=models.CASCADE, related_name='members')
    #name = models.CharField(max_length=150)          # 멤버 이름
    role = models.CharField(max_length=100, blank=True)  # 역할 (ex. Vocal)
    #affiliation = models.CharField(max_length=200, blank=True)  # 소속(대학/학과)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.role}"


class SetListItem(models.Model):
    band = models.ForeignKey(Band, on_delete=models.CASCADE, related_name='setlist')
    title = models.CharField(max_length=250)   # 노래 제목
    artist = models.CharField(max_length=200, blank=True)  # 가수
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.title} — {self.artist}"


class Comment(models.Model):
    band = models.ForeignKey(Band, on_delete=models.CASCADE, related_name='comments')
    text = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-created_at']  # 최신 댓글 먼저 보여줌

    def __str__(self):
        return f"Comment #{self.pk} on {self.band.name}"
