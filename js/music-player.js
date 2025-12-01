// 修复版本的音乐播放器 - 解决自动播放和兼容性问题
document.addEventListener('DOMContentLoaded', function() {
    console.log('音乐播放器初始化开始...');
    createMusicPlayer();
    initMusicPlayer();
});

/**
 * 检测浏览器对音频格式的支持
 */
function checkAudioFormatSupport() {
    const audio = document.createElement('audio');
    const formats = {
        'm4a': 'audio/mp4; codecs="mp4a.40.2"',
        'mp3': 'audio/mpeg',
        'ogg': 'audio/ogg; codecs="vorbis"',
        'wav': 'audio/wav'
    };
    
    const supportedFormats = {};
    for (const [format, type] of Object.entries(formats)) {
        supportedFormats[format] = audio.canPlayType(type) !== '';
    }
    
    console.log('音频格式支持情况:', supportedFormats);
    return supportedFormats;
}

/**
 * 获取音乐文件列表
 */
function getMusicFiles() {
    const supportedFormats = checkAudioFormatSupport();
    
    const musicFiles = [
        {
            name: '多少个这样的清晨',
            filename: '多少个这样的清晨.m4a',
            path: 'index_resource/background_music/多少个这样的清晨.m4a',
            format: 'm4a',
            supported: supportedFormats.m4a
        }
    ];
    
    const filteredFiles = musicFiles.filter(track => track.supported);
    console.log('可用的音乐文件:', filteredFiles);
    return filteredFiles;
}

/**
 * 创建音乐播放器DOM元素
 */
function createMusicPlayer() {
    const musicFiles = getMusicFiles();
    
    // 创建音乐播放器容器
    const musicPlayer = document.createElement('div');
    musicPlayer.id = 'music-player';
    musicPlayer.className = 'music-player minimized';
    
    // 创建播放器面板
    const playerPanel = document.createElement('div');
    playerPanel.className = 'player-panel';
    
    // 创建播放器头部
    const playerHeader = document.createElement('div');
    playerHeader.className = 'player-header';
    playerHeader.innerHTML = `
        <span class="player-title">背景音乐播放器</span>
        <button class="toggle-button" id="toggle-player">︽</button>
    `;
    
    // 创建音乐选择器选项
    let trackOptions = '<option value="">选择音乐</option>';
    musicFiles.forEach((track, index) => {
        trackOptions += `<option value="track${index + 1}">${track.name}</option>`;
    });
    
    if (musicFiles.length === 0) {
        trackOptions = '<option value="">无可用音乐</option>';
    }
    
    // 创建播放器主体内容
    const playerBody = document.createElement('div');
    playerBody.className = 'player-body';
    playerBody.innerHTML = `
        <div class="track-info">
            <div class="track-name" id="current-track">${musicFiles.length > 0 ? '未选择音乐' : '无可用音乐文件'}</div>
            <div class="progress-container">
                <div class="progress-bar" id="progress-bar">
                    <div class="progress-fill" id="progress-fill"></div>
                </div>
                <div class="time-info">
                    <span id="current-time">00:00</span> / <span id="total-time">00:00</span>
                </div>
            </div>
        </div>
        
        <div class="controls">
            <button class="control-btn" id="prev-btn" title="上一首" ${musicFiles.length === 0 ? 'disabled' : ''}>⏮</button>
            <button class="control-btn play-pause" id="play-pause-btn" title="播放/暂停" ${musicFiles.length === 0 ? 'disabled' : ''}>▶</button>
            <button class="control-btn" id="next-btn" title="下一首" ${musicFiles.length === 0 ? 'disabled' : ''}>⏭</button>
        </div>
        
        <div class="volume-control">
            <span class="volume-icon">🔊</span>
            <input type="range" id="volume-slider" class="volume-slider" min="0" max="100" value="50" ${musicFiles.length === 0 ? 'disabled' : ''}>
        </div>
        
        <div class="track-selector">
            <select id="track-select" class="track-select" ${musicFiles.length === 0 ? 'disabled' : ''}>
                ${trackOptions}
            </select>
        </div>
    `;
    
    // 组装播放器
    playerPanel.appendChild(playerHeader);
    playerPanel.appendChild(playerBody);
    musicPlayer.appendChild(playerPanel);
    document.body.appendChild(musicPlayer);
    
    // 创建音频元素
    const audioElement = document.createElement('audio');
    audioElement.id = 'background-music';
    audioElement.loop = true;
    audioElement.preload = 'metadata'; // 改为metadata减少加载时间
    document.body.appendChild(audioElement);
}

/**
 * 初始化音乐播放器功能
 */
function initMusicPlayer() {
    const musicFiles = getMusicFiles();
    
    // 如果没有可用的音乐文件，显示警告并返回
    if (musicFiles.length === 0) {
        console.error('没有可用的音乐文件，播放器功能已禁用');
        showPlayerError('没有可用的音乐文件，请检查音频文件格式和路径');
        return;
    }
    
    const musicPlayer = document.getElementById('music-player');
    const audioElement = document.getElementById('background-music');
    const toggleButton = document.getElementById('toggle-player');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const volumeSlider = document.getElementById('volume-slider');
    const trackSelect = document.getElementById('track-select');
    const progressBar = document.getElementById('progress-bar');
    const progressFill = document.getElementById('progress-fill');
    const currentTimeEl = document.getElementById('current-time');
    const totalTimeEl = document.getElementById('total-time');
    const currentTrackEl = document.getElementById('current-track');
    
    let isPlaying = false;
    let isMinimized = true;
    let currentTrackIndex = -1;
    
    // 切换播放器显示状态
    toggleButton.addEventListener('click', function() {
        isMinimized = !isMinimized;
        musicPlayer.classList.toggle('minimized', isMinimized);
        toggleButton.textContent = isMinimized ? '︽' : '⇂';
    });
    
    // 播放/暂停按钮事件
    playPauseBtn.addEventListener('click', function() {
        if (isPlaying) {
            audioElement.pause();
            playPauseBtn.textContent = '▶';
            isPlaying = false;
        } else {
            if (audioElement.src && audioElement.src !== '') {
                playAudio();
            } else {
                // 如果没有选择音乐，自动选择第一首
                selectTrack(0);
                playAudio();
            }
        }
    });
    
    // 播放音频函数
    function playAudio() {
        audioElement.play().then(() => {
            playPauseBtn.textContent = '⏸';
            isPlaying = true;
            console.log('音频播放成功');
        }).catch(error => {
            console.error('音频播放失败:', error);
            handlePlaybackError(error);
        });
    }
    
    // 处理播放错误
    function handlePlaybackError(error) {
        let errorMessage = '播放失败: ';
        
        if (error.name === 'NotSupportedError') {
            errorMessage += '音频格式不受支持';
        } else if (error.name === 'NetworkError') {
            errorMessage += '网络错误，请检查音频文件路径';
        } else if (error.name === 'NotAllowedError') {
            errorMessage += '自动播放被浏览器阻止，请手动点击播放';
        } else {
            errorMessage += '未知错误，请刷新页面重试';
        }
        
        alert(errorMessage);
        playPauseBtn.textContent = '▶';
        isPlaying = false;
    }
    
    // 音量控制
    volumeSlider.addEventListener('input', function() {
        audioElement.volume = this.value / 100;
    });
    
    // 音乐选择
    trackSelect.addEventListener('change', function() {
        const selectedIndex = this.selectedIndex - 1;
        if (selectedIndex >= 0 && selectedIndex < musicFiles.length) {
            selectTrack(selectedIndex);
            if (isPlaying) {
                playAudio();
            }
        }
    });
    
    // 选择特定曲目
    function selectTrack(index) {
        if (index >= 0 && index < musicFiles.length) {
            const track = musicFiles[index];
            audioElement.src = track.path;
            currentTrackEl.textContent = track.name;
            currentTrackIndex = index;
            trackSelect.selectedIndex = index + 1;
            
            // 添加错误监听
            audioElement.onerror = function() {
                console.error('音频加载错误:', audioElement.error);
                handlePlaybackError(audioElement.error || new Error('音频加载失败'));
            };
        }
    }
    
    // 上一首/下一首
    prevBtn.addEventListener('click', function() {
        changeTrack(-1);
    });
    
    nextBtn.addEventListener('click', function() {
        changeTrack(1);
    });
    
    // 切换音乐曲目
    function changeTrack(direction) {
        if (musicFiles.length === 0) return;
        
        let newIndex;
        if (currentTrackIndex === -1) {
            newIndex = 0;
        } else {
            newIndex = currentTrackIndex + direction;
            if (newIndex >= musicFiles.length) {
                newIndex = 0;
            } else if (newIndex < 0) {
                newIndex = musicFiles.length - 1;
            }
        }
        
        selectTrack(newIndex);
        if (isPlaying) {
            playAudio();
        }
    }
    
    // 进度条点击事件
    progressBar.addEventListener('click', function(e) {
        if (!audioElement.duration) return;
        
        const rect = progressBar.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        audioElement.currentTime = pos * audioElement.duration;
    });
    
    // 音频事件监听
    audioElement.addEventListener('timeupdate', function() {
        if (audioElement.duration) {
            const percent = (audioElement.currentTime / audioElement.duration) * 100;
            progressFill.style.width = `${percent}%`;
            currentTimeEl.textContent = formatTime(audioElement.currentTime);
        }
    });
    
    audioElement.addEventListener('loadedmetadata', function() {
        if (audioElement.duration && !isNaN(audioElement.duration)) {
            totalTimeEl.textContent = formatTime(audioElement.duration);
        }
    });
    
    audioElement.addEventListener('ended', function() {
        playPauseBtn.textContent = '▶';
        isPlaying = false;
        changeTrack(1);
    });
    
    // 格式化时间
    function formatTime(seconds) {
        if (isNaN(seconds)) return '00:00';
        
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60);
        return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    }
    
    // 显示播放器错误
    function showPlayerError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'player-error';
        errorDiv.style.cssText = 'background: #ff6b6b; color: white; padding: 10px; margin: 10px; border-radius: 4px; text-align: center;';
        errorDiv.textContent = message;
        
        const playerBody = document.querySelector('.player-body');
        if (playerBody) {
            playerBody.insertBefore(errorDiv, playerBody.firstChild);
        }
    }
    
    // 拖拽功能
    let isDragging = false;
    let currentX, currentY, initialX, initialY;
    let xOffset = 0, yOffset = 0;
    
    const playerPanel = musicPlayer.querySelector('.player-panel');
    
    playerPanel.addEventListener('mousedown', function(e) {
        if (e.target.closest('.player-header')) {
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
            isDragging = true;
        }
    });
    
    document.addEventListener('mouseup', function() {
        isDragging = false;
    });
    
    document.addEventListener('mousemove', function(e) {
        if (isDragging) {
            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
            xOffset = currentX;
            yOffset = currentY;
            playerPanel.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
        }
    });
}