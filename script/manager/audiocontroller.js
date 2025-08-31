/**
 * 音频控制器 - 专门用于主页音频控制
 */
class AudioController {
    constructor() {
        this.audio = null;
        this.isPlaying = false;
        this.volume = 0.5;
        this.currentTrackIndex = 0;
        this.playlist = [
            {
                name: 'Unravel',
                src: 'assets/audios/bgms/unravel.mp3',
                artist: 'TK from 凛として時雨'
            }
        ];
        
        this.init();
    }
    
    init() {
        this.createAudioElement();
        this.bindEvents();
        this.setVolume(this.volume);
        console.log('AudioController初始化完成');
    }
    
    createAudioElement() {
        // 创建音频元素
        this.audio = new Audio();
        this.audio.preload = 'auto';
        this.audio.loop = true;
        this.audio.volume = this.volume;
        
        // 设置默认音频源
        this.loadTrack(this.currentTrackIndex);
        
        // 音频事件监听
        this.audio.addEventListener('ended', () => this.handleEnded());
        this.audio.addEventListener('error', (e) => this.handleError(e));
        this.audio.addEventListener('loadeddata', () => this.handleLoaded());
    }
    
    bindEvents() {
        // 绑定控制按钮事件
        const playBtn = document.getElementById('playBGM');
        const stopBtn = document.getElementById('stopBGM');
        const nextBtn = document.getElementById('nextBGM');
        const volumeUpBtn = document.getElementById('volumeUp');
        const volumeDownBtn = document.getElementById('volumeDown');
        const musicControl = document.getElementById('musicControl');
        
        if (playBtn) playBtn.addEventListener('click', () => this.play());
        if (stopBtn) stopBtn.addEventListener('click', () => this.stop());
        if (nextBtn) nextBtn.addEventListener('click', () => this.nextTrack());
        if (volumeUpBtn) volumeUpBtn.addEventListener('click', () => this.adjustVolume(0.1));
        if (volumeDownBtn) volumeDownBtn.addEventListener('click', () => this.adjustVolume(-0.1));
        if (musicControl) musicControl.addEventListener('click', () => this.togglePlay());
        
        // 页面点击自动播放（浏览器限制）
        document.addEventListener('click', () => {
            if (!this.isPlaying) {
                this.play();
            }
        }, { once: true });
    }
    
    loadTrack(index) {
        if (this.playlist[index]) {
            this.audio.src = this.playlist[index].src;
            this.currentTrackIndex = index;
            console.log('加载音频:', this.playlist[index].name);
        }
    }
    
    async play() {
        try {
            await this.audio.play();
            this.isPlaying = true;
            this.updateIcon(true);
            this.updatePlayButton(true);
            console.log('音乐开始播放:', this.playlist[this.currentTrackIndex].name);
        } catch (error) {
            console.error('播放失败:', error);
            this.isPlaying = false;
            this.updateIcon(false);
            this.updatePlayButton(false);
            
            if (error.name === 'NotAllowedError') {
                alert('请点击页面任意位置来播放音乐（浏览器限制自动播放）');
            }
        }
    }
    
    pause() {
        this.audio.pause();
        this.isPlaying = false;
        this.updateIcon(false);
        this.updatePlayButton(false);
        console.log('音乐已暂停');
    }
    
    stop() {
        this.audio.pause();
        this.audio.currentTime = 0;
        this.isPlaying = false;
        this.updateIcon(false);
        this.updatePlayButton(false);
        console.log('音乐已停止');
    }
    
    togglePlay() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }
    
    nextTrack() {
        this.currentTrackIndex = (this.currentTrackIndex + 1) % this.playlist.length;
        this.loadTrack(this.currentTrackIndex);
        
        if (this.isPlaying) {
            this.play();
        }
        
        console.log('切换到下一首:', this.playlist[this.currentTrackIndex].name);
    }
    
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        this.audio.volume = this.volume;
        console.log('音量设置为:', Math.round(this.volume * 100) + '%');
    }
    
    adjustVolume(delta) {
        this.setVolume(this.volume + delta);
    }
    
    getVolume() {
        return this.volume;
    }
    
    isPlaying() {
        return this.isPlaying;
    }
    
    updateIcon(playing) {
        const musicIcon = document.getElementById('musicIcon');
        if (!musicIcon) return;
        
        if (playing) {
            // 播放图标
            musicIcon.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyQzIgMTcuNTIgNi40OCAyMiAxMiAyMkMxNy41MiAyMiAyMiAxNy41MiAyMiAxMkMyMiA2LjQ4IDE3LjUyIDIgMTIgMloiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik02IDlIMThWMTVINlY5WiIgZmlsbD0iYmxhY2siLz4KPC9zdmc+Cg==";
        } else {
            // 暂停图标
            musicIcon.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyQzIgMTcuNTIgNi40OCAyMiAxMiAyMkMxNy41MiAyMiAyMiAxNy41MiAyMiAxMkMyMiA2LjQ4IDE3LjUyIDIgMTIgMloiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xMCAxNkMxMCAxNy4xIDkuMSAxOCA4IDE4QzYuOSAxOCA2IDE3LjEgNiAxNkM2IDE0LjkgNi45IDE0IDggMTRDOS4xIDE0IDEwIDE0LjkgMTAgMTZaIiBmaWxsPSJibGFjayIvPgo8cGF0aCBkPSJNMTYgMTRDMTYgMTUuMSAxNS4xIDE2IDE0IDE2QzEyLjkgMTYgMTIgMTUuMSAxMiAxNEMxMiAxMi45IDEyLjkgMTIgMTQgMTJDMTUuMSAxMiAxNiAxMi45IDE2IDE0WiIgZmlsbD0iYmxhY2siLz4KPHBhdGggZD0iTTEwIDhDMTAgOS4xIDkuMSAxMCA4IDEwQzYuOSAxMCA2IDkuMSA2IDhDNiA2LjkgNi45IDYgOCA2QzkuMSA2IDEwIDYuOSAxMCA4WiIgZmlsbD0iYmxhY2siLz4KPHBhdGggZD0iTTE2IDZDNiAxNiA2IDE2IDE2IDZaIiBmaWxsPSJibGFjayIvPgo8L3N2Zz4K";
        }
    }
    
    updatePlayButton(playing) {
        const playBtn = document.getElementById('playBGM');
        if (!playBtn) return;
        
        if (playing) {
            playBtn.textContent = '暂停BGM';
        } else {
            playBtn.textContent = '播放BGM';
        }
    }
    
    handleEnded() {
        if (this.audio.loop) {
            console.log('音乐循环播放');
        } else {
            this.nextTrack();
        }
    }
    
    handleError(error) {
        console.error('音频加载错误:', error);
        this.isPlaying = false;
        this.updateIcon(false);
        this.updatePlayButton(false);
        alert('音频文件加载失败，请检查文件路径');
    }
    
    handleLoaded() {
        console.log('音频文件加载完成');
    }
    
    // 获取当前播放信息
    getCurrentTrackInfo() {
        if (this.playlist[this.currentTrackIndex]) {
            return {
                name: this.playlist[this.currentTrackIndex].name,
                artist: this.playlist[this.currentTrackIndex].artist,
                src: this.playlist[this.currentTrackIndex].src,
                currentTime: this.audio.currentTime,
                duration: this.audio.duration,
                volume: this.volume,
                isPlaying: this.isPlaying
            };
        }
        return null;
    }
    
    // 销毁控制器
    destroy() {
        if (this.audio) {
            this.audio.pause();
            this.audio.src = '';
            this.audio = null;
        }
        this.isPlaying = false;
        console.log('AudioController已销毁');
    }
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioController;
} else if (typeof window !== 'undefined') {
    window.AudioController = AudioController;
}
