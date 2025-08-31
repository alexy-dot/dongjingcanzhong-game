class SoundManager {
    constructor() {
        this.bgmsFormal = [
            new Audio("./assets/audios/bgms/unravel.mp3")
        ];
        this.backgroundMusic = null;
        this.isPlaying = false;
        this.volume = 0.5;
        this.init();
    }

    playBGM(name = null) {
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
        }
        
        if (name && this.bgms[name]) {
            this.backgroundMusic = this.bgms[name];
        } else {
            this.backgroundMusic = this.bgmsFormal[Math.floor(Math.random() * this.bgmsFormal.length)];
        }
        
        if (this.backgroundMusic) {
            this.backgroundMusic.currentTime = 0;
            this.backgroundMusic.volume = this.volume;
            this.backgroundMusic.loop = true;
            
            this.backgroundMusic.play().then(() => {
                this.isPlaying = true;
                console.log('BGM开始播放:', this.backgroundMusic.src);
            }).catch(error => {
                console.error('BGM播放失败:', error);
                this.isPlaying = false;
            });
        }
    }

    stopBGM() {
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
            this.backgroundMusic.currentTime = 0;
            this.isPlaying = false;
            console.log('BGM已停止');
        }
    }

    pauseBGM() {
        if (this.backgroundMusic && this.isPlaying) {
            this.backgroundMusic.pause();
            this.isPlaying = false;
            console.log('BGM已暂停');
        }
    }

    resumeBGM() {
        if (this.backgroundMusic && !this.isPlaying) {
            this.backgroundMusic.play().then(() => {
                this.isPlaying = true;
                console.log('BGM已恢复播放');
            }).catch(error => {
                console.error('BGM恢复播放失败:', error);
            });
        }
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        if (this.backgroundMusic) {
            this.backgroundMusic.volume = this.volume;
        }
        console.log('音量设置为:', Math.round(this.volume * 100) + '%');
    }

    getVolume() {
        return this.volume;
    }

    isBGMPlaying() {
        return this.isPlaying;
    }

    init() {
        // 初始化时不需要自动播放，等待用户交互
        console.log('SoundManager初始化完成');
    }

    async load() {
        try {
            this.sounds = {};
            this.soundsURL = await window.$game.dataManager.loadJSON("./assets/audios/Sounds.json");
            
            Object.keys(this.soundsURL).forEach((kind) => {
                this.sounds[kind] = {};
                Object.keys(this.soundsURL[kind]).forEach((id) => {
                    const audio = new Audio(this.soundsURL[kind][id]);
                    audio.loop = false;
                    audio.volume = this.volume;
                    this.sounds[kind][id] = audio;
                });
            });

            this.bgms = {};
            this.bgmsURL = await window.$game.dataManager.loadJSON("./assets/audios/BGMs.json");
            
            Object.keys(this.bgmsURL).forEach((id) => {
                const audio = new Audio(this.bgmsURL[id]);
                audio.loop = true;
                audio.volume = this.volume;
                this.bgms[id] = audio;
            });
            
            console.log('音频资源加载完成');
        } catch (error) {
            console.error('音频资源加载失败:', error);
        }
    }

    async playSound(kind, id = 0) {
        const sound = this.sounds[kind] && this.sounds[kind][id];
        if (sound) {
            if (!sound.paused) {
                if (kind === "walk") {
                    return;
                }
                const copy = sound.cloneNode();
                copy.currentTime = 0;
                copy.volume = this.volume;
                copy.play().catch(error => {
                    console.error(`播放音效失败: ${kind}${id}`, error);
                });
            } else {
                sound.volume = this.volume;
                sound.play().catch(error => {
                    console.error(`播放音效失败: ${kind}${id}`, error);
                });
            }
        } else {
            console.warn(`音效未找到: ${kind}${id}`);
        }
    }

    // 获取当前播放的BGM信息
    getCurrentBGM() {
        if (this.backgroundMusic) {
            return {
                src: this.backgroundMusic.src,
                currentTime: this.backgroundMusic.currentTime,
                duration: this.backgroundMusic.duration,
                volume: this.backgroundMusic.volume,
                isPlaying: this.isPlaying
            };
        }
        return null;
    }
}

// 如果不在游戏环境中，创建一个全局实例
if (typeof window !== 'undefined' && !window.$game) {
    window.soundManager = new SoundManager();
}
