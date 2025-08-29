// 공통: CSRF, 좋아요 토글 상태 로컬 저장 (band 단위)

(function () {
  // CSRF 가져오기 (Django)
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

    // 로컬스토리지에 '좋아요 상태' 저장 (페이지간 UI 일치)
    isLiked(bandId) {
      try {
        return localStorage.getItem(`band:${bandId}:liked`) === '1';
      } catch { return false; }
    },
    setLiked(bandId, liked) {
      try {
        if (liked) localStorage.setItem(`band:${bandId}:liked`, '1');
        else localStorage.removeItem(`band:${bandId}:liked`);
      } catch {}
    },

    // 서버에 좋아요/해제 요청
    async toggleLike(bandId, likedNow) {
      const action = likedNow ? 'like' : 'unlike';
      const res = await fetch(`/bands/${bandId}/like/`, {
        method: 'POST',
        headers: {
          'X-CSRFToken': SA.csrfToken || '',
          'X-Requested-With': 'XMLHttpRequest',
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        },
        body: new URLSearchParams({ action })
      });
      if (!res.ok) {
        throw new Error('like api error');
      }
      return res.json(); // {likes_count}
    },

    // 현재 카운트 동기화 (상세에서 특히)
    async fetchStats(bandId) {
      const res = await fetch(`/bands/${bandId}/stats/`, { headers: { 'X-Requested-With': 'XMLHttpRequest' }});
      if (!res.ok) return null;
      return res.json(); // {id, likes_count}
    }
  };
})();
