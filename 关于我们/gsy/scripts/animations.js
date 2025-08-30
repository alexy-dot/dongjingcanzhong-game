// 动画相关的JavaScript功能
class AnimationManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupPageTransitions();
        this.setupScrollAnimations();
        this.setupHoverEffects();
        this.setupTypingEffect();
    }

    setupPageTransitions() {
        // 页面切换时的淡入淡出效果
        const pages = document.querySelectorAll('.page');
        pages.forEach(page => {
            page.addEventListener('transitionend', () => {
                if (page.classList.contains('active')) {
                    this.animatePageElements(page);
                }
            });
        });
    }

    animatePageElements(page) {
        // 为页面内的元素添加进入动画
        const elements = page.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right, .fade-in-scale');
        elements.forEach((el, index) => {
            setTimeout(() => {
                el.classList.add('animate');
            }, index * 100);
        });
    }

    setupScrollAnimations() {
        // 滚动触发的动画
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.triggerElementAnimation(entry.target);
                }
            });
        }, observerOptions);

        // 观察所有需要动画的元素
        document.querySelectorAll('[class*="fade-in"], [class*="slide-in"]').forEach(el => {
            observer.observe(el);
        });
    }

    triggerElementAnimation(element) {
        // 根据元素的类名触发相应的动画
        if (element.classList.contains('fade-in-up')) {
            element.classList.add('animate');
        } else if (element.classList.contains('fade-in-left')) {
            element.classList.add('animate');
        } else if (element.classList.contains('fade-in-right')) {
            element.classList.add('animate');
        } else if (element.classList.contains('fade-in-scale')) {
            element.classList.add('animate');
        } else if (element.classList.contains('slide-in-left')) {
            element.classList.add('animate');
        } else if (element.classList.contains('slide-in-right')) {
            element.classList.add('animate');
        } else if (element.classList.contains('slide-in-up')) {
            element.classList.add('animate');
        } else if (element.classList.contains('slide-in-down')) {
            element.classList.add('animate');
        }
    }

    setupHoverEffects() {
        // 为卡片添加悬停效果
        document.querySelectorAll('.blog-card, .category-card, .hobby-card, .friend-card, .contact-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                this.addHoverEffect(card);
            });

            card.addEventListener('mouseleave', () => {
                this.removeHoverEffect(card);
            });
        });
    }

    addHoverEffect(element) {
        // 添加悬停时的动画效果
        element.style.transform = 'translateY(-8px) scale(1.02)';
        element.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
    }

    removeHoverEffect(element) {
        // 移除悬停效果
        element.style.transform = '';
        element.style.boxShadow = '';
    }

    setupTypingEffect() {
        // 为标题添加打字机效果
        const titles = document.querySelectorAll('.hero-title, .page-title');
        titles.forEach(title => {
            if (title.textContent.length > 10) {
                this.createTypingEffect(title);
            }
        });
    }

    createTypingEffect(element) {
        const text = element.textContent;
        element.textContent = '';
        element.classList.add('typewriter');

        let i = 0;
        const typeInterval = setInterval(() => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
            } else {
                clearInterval(typeInterval);
                element.classList.remove('typewriter');
            }
        }, 100);
    }

    // 创建粒子效果
    createParticles(container, count = 20) {
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 6 + 's';
            particle.style.animationDuration = (Math.random() * 3 + 3) + 's';
            container.appendChild(particle);
        }
    }

    // 创建波浪效果
    createWaveEffect(element) {
        const wave = document.createElement('div');
        wave.className = 'wave-effect';
        wave.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(45deg, transparent 30%, rgba(99, 102, 241, 0.1) 50%, transparent 70%);
            animation: wave 2s ease-in-out infinite;
            pointer-events: none;
        `;
        element.style.position = 'relative';
        element.appendChild(wave);
    }

    // 创建霓虹灯效果
    createNeonEffect(element) {
        element.classList.add('neon');
        element.style.textShadow = `
            0 0 5px var(--primary-color),
            0 0 10px var(--primary-color),
            0 0 15px var(--primary-color),
            0 0 20px var(--primary-color)
        `;
    }

    // 创建3D翻转效果
    createFlipEffect(element) {
        element.classList.add('flip-card');
        const inner = document.createElement('div');
        inner.className = 'flip-card-inner';
        
        // 移动原有内容到内部
        while (element.firstChild) {
            inner.appendChild(element.firstChild);
        }
        
        element.appendChild(inner);
    }

    // 创建进度条动画
    animateProgressBar(progressBar, targetWidth) {
        progressBar.style.width = '0%';
        setTimeout(() => {
            progressBar.style.width = targetWidth + '%';
        }, 100);
    }

    // 创建加载动画
    createLoadingAnimation(container) {
        const loader = document.createElement('div');
        loader.className = 'loading-dots';
        loader.textContent = '加载中';
        container.appendChild(loader);
        
        return loader;
    }

    // 创建彩虹文字效果
    createRainbowText(element) {
        element.classList.add('rainbow-text');
    }

    // 创建呼吸效果
    createBreathingEffect(element) {
        element.classList.add('breathe');
    }

    // 创建摇摆效果
    createWiggleEffect(element) {
        element.classList.add('wiggle');
    }

    // 创建弹跳效果
    createBounceEffect(element) {
        element.classList.add('bounce');
    }

    // 创建闪烁效果
    createBlinkEffect(element) {
        element.classList.add('blink');
    }

    // 创建脉冲效果
    createPulseEffect(element) {
        element.classList.add('pulse');
    }

    // 创建渐变背景动画
    createGradientAnimation(element) {
        element.classList.add('gradient-shift');
    }

    // 创建3D悬停效果
    create3DHoverEffect(element) {
        element.classList.add('card-3d');
    }

    // 页面加载完成后的动画序列
    playPageLoadAnimation() {
        const heroSection = document.querySelector('.hero-section');
        if (heroSection) {
            // 创建粒子效果
            this.createParticles(heroSection);
            
            // 为浮动图标添加动画
            const floatingIcons = heroSection.querySelectorAll('.floating-icon');
            floatingIcons.forEach((icon, index) => {
                setTimeout(() => {
                    icon.style.opacity = '0.3';
                    icon.style.transform = 'translateY(-20px) rotate(180deg)';
                }, index * 500);
            });

            // 为头像添加发光效果
            const avatar = heroSection.querySelector('.avatar-glow');
            if (avatar) {
                setTimeout(() => {
                    avatar.style.animation = 'glow 2s ease-in-out infinite alternate';
                }, 1000);
            }
        }
    }

    // 创建滚动视差效果
    createParallaxEffect() {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('.parallax');
            
            parallaxElements.forEach(element => {
                const speed = element.dataset.speed || 0.5;
                const yPos = -(scrolled * speed);
                element.style.transform = `translateY(${yPos}px)`;
            });
        });
    }

    // 创建鼠标跟随效果
    createMouseFollowEffect() {
        const cursor = document.createElement('div');
        cursor.className = 'custom-cursor';
        cursor.style.cssText = `
            position: fixed;
            width: 20px;
            height: 20px;
            background: var(--primary-color);
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            transition: transform 0.1s ease;
        `;
        document.body.appendChild(cursor);

        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX - 10 + 'px';
            cursor.style.top = e.clientY - 10 + 'px';
        });

        // 悬停时放大光标
        document.querySelectorAll('a, button, .hoverable').forEach(element => {
            element.addEventListener('mouseenter', () => {
                cursor.style.transform = 'scale(1.5)';
            });
            
            element.addEventListener('mouseleave', () => {
                cursor.style.transform = 'scale(1)';
            });
        });
    }
}

// 页面加载完成后初始化动画管理器
document.addEventListener('DOMContentLoaded', () => {
    const animationManager = new AnimationManager();
    
    // 播放页面加载动画
    setTimeout(() => {
        animationManager.playPageLoadAnimation();
    }, 500);

    // 创建视差效果
    animationManager.createParallaxEffect();

    // 创建鼠标跟随效果
    animationManager.createMouseFollowEffect();
});

// 导出动画管理器类供其他脚本使用
window.AnimationManager = AnimationManager;
