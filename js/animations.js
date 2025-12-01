// 细雨特效和动画增强脚本

document.addEventListener('DOMContentLoaded', function() {
    // 创建细雨特效
    createRainEffect();
    
    // 初始化页面元素动画
    initPageAnimations();
    
    // 初始化自定义鼠标效果
    initCustomCursor();
    
    // 添加性能监控
    initPerformanceMonitoring();
});

/**
 * 创建细雨特效
 */
function createRainEffect() {
    const raindropCount = getWindowBasedRaindropCount();
    
    // 使用文档片段批量添加雨滴以提高性能
    const fragment = document.createDocumentFragment();
    
    // 根据屏幕尺寸调整雨滴数量
    for (let i = 0; i < raindropCount; i++) {
        setTimeout(() => {
            createSingleRaindrop(fragment);
        }, i * 100); // 错开创建时间
    }
    
    // 批量添加到DOM
    document.body.appendChild(fragment);
    
    // 监听窗口大小变化，动态调整雨滴数量（使用节流优化）
    window.addEventListener('resize', throttle(function() {
        adjustRaindrops();
    }, 300));
}

/**
 * 根据窗口大小确定雨滴数量
 * @returns {number} 雨滴数量
 */
function getWindowBasedRaindropCount() {
    const width = window.innerWidth;
    if (width > 1200) return 150;  // 大屏幕
    if (width > 768) return 100;   // 中等屏幕
    return 50;                     // 小屏幕
}

/**
 * 创建单个雨滴
 */
function createSingleRaindrop(fragment) {
    const raindrop = document.createElement('div');
    raindrop.className = 'raindrop';
    
    // 随机位置和动画持续时间
    const startPosition = Math.random() * 100;
    const duration = 2 + Math.random() * 3; // 2-5秒
    const delay = Math.random() * 5; // 0-5秒延迟
    
    raindrop.style.left = `${startPosition}%`;
    raindrop.style.animationDuration = `${duration}s`;
    raindrop.style.animationDelay = `${delay}s`;
    
    fragment.appendChild(raindrop);
    
    // 雨滴动画结束后移除元素
    setTimeout(() => {
        if (raindrop.parentNode) {
            raindrop.parentNode.removeChild(raindrop);
        }
    }, duration * 1000);
}

/**
 * 调整雨滴数量
 */
function adjustRaindrops() {
    // 清除现有雨滴
    const raindrops = document.querySelectorAll('.raindrop');
    raindrops.forEach(drop => drop.remove());
    
    // 重新创建适当数量的雨滴
    createRainEffect();
}

/**
 * 防抖函数
 * @param {Function} func - 要防抖的函数
 * @param {number} wait - 等待时间(ms)
 * @returns {Function} 防抖后的函数
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * 节流函数
 * @param {Function} func - 要节流的函数
 * @param {number} limit - 时间限制(ms)
 * @returns {Function} 节流后的函数
 */
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

/**
 * 初始化页面元素动画
 */
function initPageAnimations() {
    // 为卡片添加交错动画
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
        // 使用requestAnimationFrame优化动画性能
        requestAnimationFrame(() => {
            card.style.animationDelay = `${0.2 + index * 0.1}s`;
        });
    });
    
    // 为资源项添加交错动画
    const resourceItems = document.querySelectorAll('.resource-item');
    resourceItems.forEach((item, index) => {
        // 使用requestAnimationFrame优化动画性能
        requestAnimationFrame(() => {
            item.style.animationDelay = `${0.3 + index * 0.1}s`;
        });
    });
    
    // 为页脚添加淡入动画
    const footer = document.querySelector('footer');
    if (footer) {
        footer.style.opacity = '0';
        footer.style.transform = 'translateY(20px)';
        footer.style.transition = 'all 0.6s ease-out';
        
        // 使用requestAnimationFrame优化动画性能
        requestAnimationFrame(() => {
            setTimeout(() => {
                footer.style.opacity = '1';
                footer.style.transform = 'translateY(0)';
            }, 800);
        });
    }
}

/**
 * 初始化自定义鼠标效果
 */
function initCustomCursor() {
    // 创建自定义光标元素
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    document.body.appendChild(cursor);
    
    // 创建光标尾迹元素
    const cursorTrail = document.createElement('div');
    cursorTrail.className = 'cursor-trail';
    document.body.appendChild(cursorTrail);
    
    // 使用节流优化鼠标移动事件处理
    let mouseX = 0;
    let mouseY = 0;
    let trailX = 0;
    let trailY = 0;
    
    // 鼠标移动时更新光标位置
    document.addEventListener('mousemove', throttle(function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // 使用requestAnimationFrame优化更新频率
        requestAnimationFrame(updateCursorPosition);
    }, 16)); // 约60fps
    
    // 更新光标位置的函数
    function updateCursorPosition() {
        // 更新主光标位置
        cursor.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
        
        // 平滑更新尾迹位置
        trailX += (mouseX - trailX) * 0.3;
        trailY += (mouseY - trailY) * 0.3;
        cursorTrail.style.transform = `translate(${trailX}px, ${trailY}px) translate(-50%, -50%)`;
    }
    
    // 鼠标按下时的效果
    document.addEventListener('mousedown', function() {
        cursor.style.transform = `translate(${mouseX}px, ${mouseY}px) scale(0.8) translate(-50%, -50%)`;
        cursor.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
    });
    
    // 鼠标释放时的效果
    document.addEventListener('mouseup', function() {
        cursor.style.transform = `translate(${mouseX}px, ${mouseY}px) scale(1) translate(-50%, -50%)`;
        cursor.style.backgroundColor = 'rgba(0, 255, 255, 0.6)';
    });
    
    // 链接悬停时的效果
    const links = document.querySelectorAll('a');
    links.forEach(link => {
        link.addEventListener('mouseenter', function() {
            cursor.style.transform = `translate(${mouseX}px, ${mouseY}px) scale(1.5) translate(-50%, -50%)`;
            cursor.style.backgroundColor = 'rgba(0, 255, 255, 0.8)';
            cursor.style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.8)';
        });
        
        link.addEventListener('mouseleave', function() {
            cursor.style.transform = `translate(${mouseX}px, ${mouseY}px) scale(1) translate(-50%, -50%)`;
            cursor.style.backgroundColor = 'rgba(0, 255, 255, 0.6)';
            cursor.style.boxShadow = '0 0 10px rgba(0, 255, 255, 0.6)';
        });
    });
}

/**
 * 平滑滚动到页面顶部
 */
function smoothScrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
        // 使用smooth behavior而不是手动动画以获得更好的性能
    });
}

// 页面滚动时的额外效果（使用节流优化）
window.addEventListener('scroll', throttle(function() {
    const scrollPosition = window.scrollY;
    const header = document.querySelector('header');
    
    // 滚动时调整header透明度
    if (header) {
        const opacity = Math.max(0.7, 1 - scrollPosition / 500);
        header.style.opacity = opacity;
    }
}, 16)); // 约60fps

/**
 * 初始化性能监控
 */
function initPerformanceMonitoring() {
    // 检测页面加载性能
    window.addEventListener('load', function() {
        // 只在开发环境中输出性能信息
        if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
            console.log('页面加载完成，性能指标：');
            console.log('加载时间：', performance.now(), 'ms');
            
            // 如果浏览器支持Performance API
            if ('performance' in window) {
                const perfData = performance.getEntriesByType('navigation')[0];
                console.log('DNS查询时间：', perfData.domainLookupEnd - perfData.domainLookupStart, 'ms');
                console.log('TCP连接时间：', perfData.connectEnd - perfData.connectStart, 'ms');
                console.log('请求响应时间：', perfData.responseEnd - perfData.requestStart, 'ms');
                console.log('DOM解析时间：', perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart, 'ms');
            }
        }
    });
}

/**
 * 懒加载图片功能
 */
function lazyLoadImages() {
    // 检查浏览器是否支持Intersection Observer
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver(function(entries, observer) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        const lazyImages = document.querySelectorAll('img.lazy');
        lazyImages.forEach(function(img) {
            imageObserver.observe(img);
        });
    }
}

// 当页面内容加载完成后初始化懒加载
document.addEventListener('DOMContentLoaded', function() {
    lazyLoadImages();
});