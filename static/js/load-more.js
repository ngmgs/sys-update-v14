document.addEventListener("DOMContentLoaded", function() {
    let nextLink = document.querySelector('.pagination a.next');
    const pagination = document.querySelector('.pagination');
    const main = document.querySelector('.main'); // 記事コンテナ

    if (!nextLink || !main) return;

    // 1. 既存のページネーションを隠す
    if (pagination) pagination.style.display = 'none';

    // 2. 監視用パーツ（センチネル）を作成
    // 画面の一番下に透明な線を引いて、これが見えたら次を読み込む仕組み
    const sentinel = document.createElement('div');
    sentinel.className = 'infinite-scroll-sentinel';
    sentinel.textContent = '読み込み中...';
    sentinel.style.cssText = 'text-align:center; padding:20px; color:#666; font-size:14px;';
    
    // mainの直後に配置
    main.parentNode.insertBefore(sentinel, main.nextSibling);

    let isLoading = false;

    // 3. 監視API（IntersectionObserver）の設定
    const observer = new IntersectionObserver((entries) => {
        // 「読み込み中...」の文字が画面に入った かつ まだ読み込んでいないなら実行
        if (entries[0].isIntersecting && !isLoading && nextLink) {
            loadNextPage();
        }
    }, { rootMargin: '200px' }); // 画面の下200px手前で読み込み開始（早めに読み込む）

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

                // 次のページがあるか確認
                const newNextLink = doc.querySelector('.pagination a.next');
                if (newNextLink) {
                    nextLink = newNextLink;
                    isLoading = false; // ロック解除
                } else {
                    // もう記事がない場合
                    nextLink = null;
                    sentinel.textContent = 'すべての記事を表示しました';
                    observer.disconnect(); // 監視終了
                }
            })
            .catch(err => {
                console.error('Failed to load:', err);
                sentinel.textContent = '読み込みエラー';
                isLoading = false;
            });
    }
});
