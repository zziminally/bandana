(function () {
  const wrap = document.querySelector('.detail-wrap');
  if (!wrap) return;

  const bandId = Number(wrap.dataset.bandId);

  // 좋아요
  const likeArea = wrap.querySelector('.detail-like');
  const heartBtn = likeArea.querySelector('.heart-btn');
  const heartIcon = heartBtn.querySelector('.heart-icon');
  const countEl = likeArea.querySelector('.like-count');

  // 초기 liked UI
  const liked = SA.isLiked(bandId);
  setHeartUI(liked);

  // 서버 카운트 동기화
  SA.fetchStats(bandId).then(data => {
    if (data && typeof data.likes_count === 'number') {
      countEl.textContent = data.likes_count;
    }
  });

  heartBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const currentlyLiked = heartBtn.dataset.liked === 'true';
    const nextLiked = !currentlyLiked;
    try {
      const data = await SA.toggleLike(bandId, nextLiked);
      countEl.textContent = data.likes_count;
      setHeartUI(nextLiked);
      SA.setLiked(bandId, nextLiked);
    } catch (err) {
      console.error(err);
      setHeartUI(currentlyLiked);
    }
  });

  function setHeartUI(liked) {
    heartBtn.dataset.liked = liked ? 'true' : 'false';
    heartIcon.src = liked
      ? '/static/bands/images/detail_heart_red.svg'
      : '/static/bands/images/detail_heart_blank.svg';
  }

  // 댓글
  const form = document.getElementById('comment-form');
  const textarea = document.getElementById('comment-text');
  const list = document.getElementById('comment-list');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = textarea.value.trim();
    if (!text) return;

    const action = form.getAttribute('action');

    const res = await fetch(action, {
      method: 'POST',
      headers: {
        'X-CSRFToken': SA.csrfToken || '',
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      body: new URLSearchParams({ text })
    });

    if (!res.ok) {
      console.error('comment error');
      return;
    }
    const data = await res.json();
    textarea.value = '';

    // 비어있던 안내 문구 제거
    const first = list.querySelector('.empty-text');
    if (first) first.remove();

    // 새 댓글 DOM 추가
    const li = document.createElement('li');
    li.className = 'comment-item';
    li.innerHTML = `
      <div class="comment-text"></div>
      <div class="comment-meta"></div>
    `;
    li.querySelector('.comment-text').textContent = data.text;
    li.querySelector('.comment-meta').textContent = data.created_at;

    // 최신순(모델이 최신부터)이므로 맨 앞에 삽입
    list.insertBefore(li, list.firstChild);
  });
})();
