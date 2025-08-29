(function () {
  const cards = document.querySelectorAll('.band-card');

  cards.forEach(card => {
    const bandId = Number(card.dataset.bandId);
    const heartBtn = card.querySelector('.heart-btn');
    const heartIcon = heartBtn.querySelector('.heart-icon');
    const countEl = card.querySelector('.like-count');
    const nameLink = card.querySelector('.band-name');
    const thumbLink = card.querySelector('.band-thumb-link');

    // 링크 클릭 시 기본 동작
    [nameLink, thumbLink].forEach(a => {
      a && a.addEventListener('click', e => {
        // 하트 클릭 시에는 카드 링크가 눌리지 않도록 처리 (아래서 stopPropagation)
      });
    });

    // 초기 liked UI
    const liked = SA.isLiked(bandId);
    setHeartUI(liked);

    // 최신 카운트 동기화 (페이지 열릴 때 서버 수치 반영)
    SA.fetchStats(bandId).then(data => {
      if (data && typeof data.likes_count === 'number') {
        countEl.textContent = data.likes_count;
      }
    });

    // 클릭 핸들러
    heartBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      const currentlyLiked = heartBtn.dataset.liked === 'true';
      const nextLiked = !currentlyLiked;

      try {
        const data = await SA.toggleLike(bandId, nextLiked);
        countEl.textContent = data.likes_count;
        setHeartUI(nextLiked);
        SA.setLiked(bandId, nextLiked);
      } catch (err) {
        console.error(err);
        // 실패 시 UI 원복
        setHeartUI(currentlyLiked);
      }
    });

    function setHeartUI(liked) {
      heartBtn.dataset.liked = liked ? 'true' : 'false';
      heartIcon.src = liked
        ? '/static/bands/images/home_heart_red.svg'
        : '/static/bands/images/home_heart_blank.svg';
    }
  });
})();
