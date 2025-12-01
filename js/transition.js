// 页面切换动画
document.addEventListener('DOMContentLoaded', function() {
    // 获取所有导航链接
    const links = document.querySelectorAll('nav a');
    
    // 为每个链接添加点击事件监听器
    links.forEach(link => {
        // 检查链接是否指向当前域名下的页面
        if (link.hostname === window.location.hostname) {
            link.addEventListener('click', function(e) {
                // 阻止默认跳转行为
                e.preventDefault();
                
                // 获取目标页面URL
                const targetUrl = this.href;
                
                // 添加离开动画类（兼容Safari）
                document.body.classList.add('page-transition-out');
                document.body.classList.add('webkit-page-transition-out');
                
                // 延迟跳转以播放动画
                setTimeout(() => {
                    window.location.href = targetUrl;
                }, 300); // 与CSS动画持续时间匹配
            });
        }
    });
    
    // 页面加载完成后添加进入动画类（兼容Safari）
    document.body.classList.add('page-transition-in');
    document.body.classList.add('webkit-page-transition-in');
    
    // 修复Safari中的动画问题
    if (/Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)) {
        document.body.classList.add('safari');
    }
});

// 处理浏览器前进/后退按钮
window.addEventListener('pageshow', function(event) {
    if (event.persisted) {
        // 如果页面是从缓存中加载的，移除过渡类
        document.body.classList.remove('page-transition-out');
        document.body.classList.remove('webkit-page-transition-out');
        document.body.classList.add('page-transition-in');
        document.body.classList.add('webkit-page-transition-in');
    }
});