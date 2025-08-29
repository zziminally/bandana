# apps/bands/forms.py
from django import forms
from .models import Comment

class CommentForm(forms.ModelForm):
    class Meta:
        model = Comment
        fields = ['text']
        widgets = {
            'text': forms.Textarea(attrs={
                'rows': 2,
                'placeholder': '멤버들에게 응원의 메시지를 남겨주세요!',
                'style': 'resize:none;'
            })
        }
