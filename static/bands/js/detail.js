(function () {
  const wrap = document.querySelector('.detail-wrap');
  if (!wrap) return;

  const colors = ["#FFB3BA", "#FFDFBA", "#FFFFBA", "#BAFFC9", "#BAE1FF", "#CBAEFF", "#FFB3F0", "#FFD6E0", "#D6FFB3", "#B3FFF5", "#87CEB8"];
  function darkenColor(hex, percent) {
    let num = parseInt(hex.slice(1), 16),
        r = (num >> 16) - (255 * percent),
        g = ((num >> 8) & 0x00FF) - (255 * percent),
        b = (num & 0x0000FF) - (255 * percent);
    return `rgb(${Math.max(0, r)}, ${Math.max(0, g)}, ${Math.max(0, b)})`;
  }
  document.querySelectorAll(".role-pill").forEach(el => {
    const bg = colors[Math.floor(Math.random() * colors.length)];
    el.style.backgroundColor = bg;
    el.style.borderColor = darkenColor(bg, 0.2);
  });

  const bandId = Number(wrap.dataset.bandId);

  // 좋아요
  const likeArea = wrap.querySelector('.detail-like');
  const heartBtn = likeArea.querySelector('.heart-btn');
  const heartIcon = heartBtn.querySelector('.heart-icon');
  const countEl = likeArea.querySelector('.like-count');

  if (heartBtn && heartIcon && countEl) {
    const liked = SA.isLiked(bandId);
    setHeartUI(liked); // [CHANGED] dataset 초기화 포함

    SA.fetchStats(bandId).then(data => {
      if (data && typeof data.likes_count === 'number') {
        countEl.textContent = data.likes_count;
      }
    });

    heartBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation(); // [CHANGED] 혹시 모를 전파 차단
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
  }

  function setHeartUI(liked) {
    if (!heartBtn || !heartIcon) return;
    heartBtn.dataset.liked = liked ? 'true' : 'false'; // [CHANGED] 클릭 판정의 기준
    heartIcon.src = liked
      ? '/static/bands/images/detail_heart_red.svg'
      : '/static/bands/images/detail_heart_blank.svg';
  }

  // 댓글
  const form = document.getElementById('comment-form');
  const textarea = document.getElementById('comment-text');
  const list = document.getElementById('comment-list');

  async function renderComments() {
    const res = await fetch(`/bands/${bandId}/comments/`, {
      headers: { 'X-Requested-With': 'XMLHttpRequest' }
    });
    if (!res.ok) return;
    const data = await res.json();
    list.innerHTML = '';
    if (!data.comments || data.comments.length === 0) {
      list.innerHTML = '<li class="comment-item empty-text">아직 댓글이 없습니다.</li>';
    } else {
      data.comments.forEach(c => {
        // localStorage 기반 "내 댓글 여부"도 같이 반영
        c.is_mine = c.is_mine || SA.isMyComment(c.id);
        addCommentDOM(c);
      });
    }
  }


  function addCommentDOM(c) {
    
    const emptyMsg = list.querySelector('.empty-text');
    if (emptyMsg) {
      emptyMsg.remove();
    }

    const li = document.createElement('li');
    li.className = 'comment-item';
    li.dataset.id = c.id;
    li.innerHTML = `
      <div class="comment-header">
        <div class="comment-text">${c.text}</div>
        ${c.is_mine ? `
          <div class="comment-actions">
            <img src="/static/bands/images/revise.svg" alt="수정하기" class="action-icon edit-btn">
            <img src="/static/bands/images/section.svg" alt="구분선" class="section-icon">
            <img src="/static/bands/images/delete.svg" alt="삭제하기" class="action-icon del-btn">
          </div>
        ` : ''}
      </div>
      <div class="comment-meta">${c.created_at}</div>
    `;
    li.querySelector('.comment-text').textContent = c.text;
    li.querySelector('.comment-meta').textContent = c.created_at;
    list.appendChild(li);
  }

  if (form && textarea && list) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();      // [CHANGED] 기본 제출 차단
      e.stopPropagation();     // [CHANGED] 전파 차단

      const text = textarea.value.trim();
      if (!text) return;

      const action = form.getAttribute('action'); // 서버 URL
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

      // 내가 쓴 댓글 로컬에 기록 (재진입 시에도 is_mine 유지)
      if (data.id) SA.addMyComment(data.id);

      addCommentDOM({ ...data, is_mine: true });
    });

    // 수정/삭제 버튼 위임
    list.addEventListener('click', async (e) => {
      const li = e.target.closest('.comment-item');
      if (!li) return;
      const cid = Number(li.dataset.id);

      if (e.target.classList.contains('edit-btn')) {
        const current = li.querySelector('.comment-text').textContent;
        const newText = prompt('새 댓글 내용:', current);
        if (newText == null) return; // 취소
        const text = newText.trim();
        if (!text) return;

        const res = await fetch(`/bands/${bandId}/comments/${cid}/edit/`, {
          method: 'POST',
          headers: {
            'X-CSRFToken': SA.csrfToken || '',
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
          },
          body: new URLSearchParams({ text })
        });
        if (res.ok) {
          const data = await res.json();
          li.querySelector('.comment-text').textContent = data.text;
          li.querySelector('.comment-meta').textContent = data.created_at;
        } else {
          alert('수정 권한이 없거나 오류가 발생했습니다.');
        }
      }

      if (e.target.classList.contains('del-btn')) {
        if (!confirm('정말 삭제하시겠습니까?')) return;
        const res = await fetch(`/bands/${bandId}/comments/${cid}/delete/`, {
          method: 'POST',
          headers: {
            'X-CSRFToken': SA.csrfToken || '',
            'X-Requested-With': 'XMLHttpRequest',
          }
        });
        if (res.ok) {
          li.remove();
          SA.removeMyComment(cid);
        } else {
          alert('삭제 권한이 없거나 오류가 발생했습니다.');
        }
        if (list.children.length === 0) {
          list.innerHTML = '<li class="comment-item empty-text">아직 댓글이 없습니다.</li>';
        }
      }
    });

    // 페이지 최초 진입 시 댓글 목록 불러오기
    renderComments();
  }
})();