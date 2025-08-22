from django.db import models

class Band(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    genre = models.CharField(max_length=50)

    def __str__(self):
        return self.name

class Member(models.Model):
    band = models.ForeignKey(Band, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    role = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.name} ({self.role})"

class Song(models.Model):
    band = models.ForeignKey(Band, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)

    def __str__(self):
        return self.title

class Like(models.Model):
    band = models.ForeignKey(Band, on_delete=models.CASCADE)
    session_key = models.CharField(max_length=100)

class Comment(models.Model):
    band = models.ForeignKey(Band, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
