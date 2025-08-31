// 공통: CSRF, 좋아요/댓글 로직
(function () {
  function getCookie(name) {
    if (!document.cookie) return null;
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const c = cookie.trim();
      if (c.startsWith(name + '=')) {
        return decodeURIComponent(c.substring(name.length + 1));
      }
    }
    return null;
  }

  window.SA = {
    csrfToken: getCookie('csrftoken'),

    // 좋아요: sessionStorage 사용 → 새로고침 유지, 재접속시 초기화
    isLiked(bandId) {
      try {
        return sessionStorage.getItem(`band:${bandId}:liked`) === '1';
      } catch { return false; }
    },
    setLiked(bandId, liked) {
      try {
        if (liked) sessionStorage.setItem(`band:${bandId}:liked`, '1');
        else sessionStorage.removeItem(`band:${bandId}:liked`);
      } catch {}
    },

    async toggleLike(bandId, nextLiked) {
      const action = nextLiked ? 'like' : 'unlike';
      const res = await fetch(`/bands/${bandId}/like/`, {
        method: 'POST',
        headers: {
          'X-CSRFToken': SA.csrfToken || '',
          'X-Requested-With': 'XMLHttpRequest',
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        },
        body: new URLSearchParams({ action })
      });
      if (!res.ok) throw new Error('like api error');
      return res.json();
    },

    async fetchStats(bandId) {
      const res = await fetch(`/bands/${bandId}/stats/`, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      });
      if (!res.ok) return null;
      return res.json();
    },

    // 내가 쓴 댓글 기록 (localStorage → 재접속해도 유지)
    addMyComment(id) {
      try {
        const arr = JSON.parse(localStorage.getItem('my-comments') || '[]');
        if (!arr.includes(id)) {
          arr.push(id);
          localStorage.setItem('my-comments', JSON.stringify(arr));
        }
      } catch {}
    },
    isMyComment(id) {
      try {
        const arr = JSON.parse(localStorage.getItem('my-comments') || '[]');
        return arr.includes(id);
      } catch { return false; }
    },
    removeMyComment(id) {
      try {
        let arr = JSON.parse(localStorage.getItem('my-comments') || '[]');
        arr = arr.filter(x => x !== id);
        localStorage.setItem('my-comments', JSON.stringify(arr));
      } catch {}
    }
  };
})();
