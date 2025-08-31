from django.shortcuts import get_object_or_404
from django.views.generic import ListView, DetailView
from django.http import JsonResponse, HttpResponseBadRequest
from django.views.decorators.http import require_POST, require_GET
from django.db import transaction
from django.db.models import F
from .models import Band, Comment
from .forms import CommentForm

class BandListView(ListView):
    model = Band
    template_name = 'bands/home.html'
    context_object_name = 'bands'
    queryset = Band.objects.all().prefetch_related('members', 'setlist')

class BandDetailView(DetailView):
    model = Band
    template_name = 'bands/detail.html'
    context_object_name = 'band'

@require_POST
@transaction.atomic
def like_band(request, pk):
    band = get_object_or_404(Band, pk=pk)
    action = request.POST.get('action')
    if action == 'like':
        Band.objects.filter(pk=pk).update(likes_count=F('likes_count') + 1)
    elif action == 'unlike':
        Band.objects.filter(pk=pk, likes_count__gt=0).update(likes_count=F('likes_count') - 1)
    else:
        return HttpResponseBadRequest('invalid action')
    band.refresh_from_db(fields=['likes_count'])
    return JsonResponse({'likes_count': band.likes_count})

@require_POST
def add_comment(request, pk):
    # [CHANGED] 세션에 '내 댓글' 기록 + is_mine 반환
    text = request.POST.get("text", "").strip()
    if not text:
        return JsonResponse({"error": "invalid"}, status=400)

    c = Comment.objects.create(band_id=pk, text=text)

    my_comments = request.session.get('my_comments', [])
    if c.id not in my_comments:
        my_comments.append(c.id)
        request.session['my_comments'] = my_comments

    return JsonResponse({
        "id": c.id,
        "text": c.text,
        "created_at": c.created_at.strftime("%Y-%m-%d %H:%M"),
        "is_mine": True,  # 내가 방금 작성
    })

@require_POST
def edit_comment(request, pk, cid):  # [CHANGED] urls.py와 시그니처 맞춤
    # [CHANGED] 세션 권한 체크
    comment = get_object_or_404(Comment, pk=cid, band_id=pk)
    my_comments = request.session.get('my_comments', [])
    if comment.id not in my_comments:
        return JsonResponse({'error': '권한 없음'}, status=403)

    text = request.POST.get("text", "").strip()
    if not text:
        return JsonResponse({'error': '내용 없음'}, status=400)

    comment.text = text
    comment.save()
    return JsonResponse({
        "id": comment.id,
        "text": comment.text,
        "created_at": comment.created_at.strftime("%Y-%m-%d %H:%M"),
        "is_mine": True,
    })

@require_POST
def delete_comment(request, pk, cid):  # [CHANGED] urls.py와 시그니처 맞춤
    # [CHANGED] 세션 권한 체크
    comment = get_object_or_404(Comment, pk=cid, band_id=pk)
    my_comments = request.session.get('my_comments', [])
    if comment.id not in my_comments:
        return JsonResponse({'error': '권한 없음'}, status=403)

    comment.delete()
    return JsonResponse({"id": cid, "deleted": True})

'''
def delete_comment(request, comment_id):
    if request.method == "POST":
        try:
            Comment.objects.get(id=comment_id).delete()
            return JsonResponse({"ok": True})
        except Comment.DoesNotExist:
            pass
    return JsonResponse({"ok": False})
'''

@require_GET
def band_stats(request, pk):
    band = get_object_or_404(Band, pk=pk)
    return JsonResponse({'id': band.id, 'likes_count': band.likes_count})

@require_GET
def comments_list(request, pk):
    band = get_object_or_404(Band, pk=pk)
    my_comments = request.session.get('my_comments', [])
    data = [{
        'id': c.id,
        'text': c.text,
        'created_at': c.created_at.strftime('%Y-%m-%d %H:%M'),
        'is_mine': c.id in my_comments,
    } for c in band.comments.all().order_by('-created_at')[:100]]
    return JsonResponse({'comments': data})