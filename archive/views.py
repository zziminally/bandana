from django.shortcuts import get_object_or_404
from django.views.generic import ListView, DetailView
from django.http import JsonResponse, HttpResponseBadRequest
from django.views.decorators.http import require_POST, require_GET
from django.db import transaction
from django.db.models import F
from .models import Band
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
    band = get_object_or_404(Band, pk=pk)
    form = CommentForm(request.POST)
    if form.is_valid():
        c = form.save(commit=False)
        c.band = band
        c.save()
        return JsonResponse({
            'id': c.id,
            'text': c.text,
            'created_at': c.created_at.strftime('%Y-%m-%d %H:%M'),
        })
    return JsonResponse({'errors': form.errors}, status=400)

@require_GET
def band_stats(request, pk):
    band = get_object_or_404(Band, pk=pk)
    return JsonResponse({'id': band.id, 'likes_count': band.likes_count})

@require_GET
def comments_list(request, pk):
    band = get_object_or_404(Band, pk=pk)
    data = [{
        'id': c.id,
        'text': c.text,
        'created_at': c.created_at.strftime('%Y-%m-%d %H:%M'),
    } for c in band.comments.all()[:100]]
    return JsonResponse({'comments': data})
