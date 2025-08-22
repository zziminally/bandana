from django.shortcuts import render, get_object_or_404, redirect
from .models import Band, Member, Song, Like, Comment
from .forms import CommentForm

def band_list(request):
    bands = Band.objects.all()
    return render(request, 'bands/band_list.html', {'bands': bands})

def band_detail(request, band_id):
    band = get_object_or_404(Band, id=band_id)
    members = Member.objects.filter(band=band)
    songs = Song.objects.filter(band=band)
    comments = Comment.objects.filter(band=band).order_by('-created_at')

    session_key = request.session.session_key
    if not session_key:
        request.session.save()
        session_key = request.session.session_key
    liked = Like.objects.filter(band=band, session_key=session_key).exists()

    if request.method == 'POST':
        form = CommentForm(request.POST)
        if form.is_valid():
            comment = form.save(commit=False)
            comment.band = band
            comment.save()
            return redirect('band_detail', band_id=band.id)
    else:
        form = CommentForm()

    return render(request, 'bands/band_detail.html', {
        'band': band,
        'members': members,
        'songs': songs,
        'comments': comments,
        'liked': liked,
        'form': form,
    })

def like_band(request, band_id):
    band = get_object_or_404(Band, id=band_id)
    session_key = request.session.session_key
    if not session_key:
        request.session.save()
        session_key = request.session.session_key
    if not Like.objects.filter(band=band, session_key=session_key).exists():
        Like.objects.create(band=band, session_key=session_key)
    return redirect('band_detail', band_id=band.id)
