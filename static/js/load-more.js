document.addEventListener("DOMContentLoaded", function() {
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
                    
                    console.log('[load-more] 新しいnextLink取得:', newNextLink.href);
                    
                    // paginationを一時的に表示して更新
                    const paginationElement = document.querySelector('.pagination');
                    if (paginationElement) {
                        paginationElement.style.display = 'block'; // 一時的に表示
                    }
                    
                    const currentPaginationLink = document.querySelector('.pagination a.next');
                    console.log('[load-more] 現在のDOM上のnextLink:', currentPaginationLink?.href);
                    
                    if (currentPaginationLink) {
                        currentPaginationLink.href = newNextLink.href;
                        console.log('[load-more] DOM上のnextLinkを更新:', newNextLink.href);
                    } else {
                        console.log('[load-more] DOM上のnextLinkが見つかりません！');
                    }
                    
                    if (paginationElement) {
                        paginationElement.style.display = 'none'; // 再度非表示
                    }
                    
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
});