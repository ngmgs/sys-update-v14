document.addEventListener("DOMContentLoaded", function() {
    // 復元中は無限スクロールを起動しない
    if (window.infiniteScrollRestoring) {
        console.log('[無限スクロール] 復元中のため待機');
        const checkRestore = setInterval(() => {
            if (!window.infiniteScrollRestoring) {
                clearInterval(checkRestore);
                console.log('[無限スクロール] 復元完了、再開');
                initInfiniteScroll();
            }
        }, 100);
        return;
    }
    
    initInfiniteScroll();
});

function initInfiniteScroll() {
    let nextLink = document.querySelector('.pagination a.next');
    const pagination = document.querySelector('.pagination');
    const main = document.querySelector('.main');

    if (!nextLink || !main) return;

    if (pagination) pagination.style.display = 'none';

    const sentinel = document.createElement('div');
    sentinel.className = 'infinite-scroll-sentinel';
    sentinel.textContent = '読み込み中...';
    sentinel.style.cssText = 'text-align:center; padding:20px; color:#666; font-size:14px;';
    
    main.parentNode.insertBefore(sentinel, main.nextSibling);

    let isLoading = false;

    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !isLoading && nextLink) {
            loadNextPage();
        }
    }, { rootMargin: '200px' });

    observer.observe(sentinel);

    function loadNextPage() {
        isLoading = true;

        fetch(nextLink.href)
            .then(response => response.text())
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');

                const newPosts = doc.querySelectorAll('.post-entry');
                newPosts.forEach(post => {
                    main.appendChild(post);
                });

                const newNextLink = doc.querySelector('.pagination a.next');
                if (newNextLink) {
                    nextLink = newNextLink;
                    isLoading = false;
                } else {
                    nextLink = null;
                    sentinel.textContent = 'すべての記事を表示しました';
                    observer.disconnect();
                }
            })
            .catch(err => {
                console.error('Failed to load:', err);
                sentinel.textContent = '読み込みエラー';
                isLoading = false;
            });
    }
}