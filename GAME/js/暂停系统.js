// 暂停系统
let isGamePaused = false;
let gameLoopRunning = false;
let gameStartTime = Date.now();
let totalPauseTime = 0;
let lastPauseTime = 0;

// 初始化暂停系统
function initPauseSystem() {
    // 添加ESC键监听器
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            event.preventDefault();
            togglePause();
        }
    });
    
    console.log('暂停系统已初始化');
}

// 切换暂停状态
function togglePause() {
    if (isGamePaused) {
        resumeGame();
    } else {
        pauseGame();
    }
}

// 暂停游戏
function pauseGame() {
    if (isGamePaused) return;
    
    isGamePaused = true;
    document.body.classList.add('game-paused');
    
    // 显示暂停界面
    const pauseOverlay = document.getElementById('pause-overlay');
    const pausePanel = pauseOverlay.querySelector('.pause-panel');
    
    if (pauseOverlay && pausePanel) {
        pauseOverlay.style.display = 'flex';
        
        // 更新游戏时间显示
        const gameTimeDisplay = document.getElementById('game-time-display');
        if (gameTimeDisplay) {
            const gameTime = getGameTime();
            gameTimeDisplay.textContent = `游戏时间: ${formatGameTime(gameTime)}`;
        }
        
        // 延迟显示动画效果
        setTimeout(() => {
            pausePanel.classList.add('show');
        }, 10);
    }
    
    // 暂停背景音乐
    if (typeof backgroundMusic !== 'undefined' && backgroundMusic) {
        backgroundMusic.pause();
    }
    
    // 暂停游戏循环
    pauseGameLoop();
    
    // 记录暂停开始时间
    lastPauseTime = Date.now();
    
    // 添加暂停时的特殊效果
    addPauseEffects();
    
    console.log('游戏已暂停');
}

// 继续游戏
function resumeGame() {
    if (!isGamePaused) return;
    
    isGamePaused = false;
    document.body.classList.remove('game-paused');
    
    // 隐藏暂停界面
    const pauseOverlay = document.getElementById('pause-overlay');
    const pausePanel = pauseOverlay.querySelector('.pause-panel');
    
    if (pauseOverlay && pausePanel) {
        pausePanel.classList.remove('show');
        setTimeout(() => {
            pauseOverlay.style.display = 'none';
        }, 300);
    }
    
    // 恢复背景音乐
    if (typeof backgroundMusic !== 'undefined' && backgroundMusic && musicStarted) {
        backgroundMusic.play().catch(e => console.log('恢复背景音乐失败:', e));
    }
    
    // 恢复游戏循环
    resumeGameLoop();
    
    // 计算总暂停时间
    if (lastPauseTime > 0) {
        totalPauseTime += Date.now() - lastPauseTime;
        lastPauseTime = 0;
    }
    
    // 移除暂停时的特殊效果
    removePauseEffects();
    
    console.log('游戏已继续');
}

// 暂停游戏循环
function pauseGameLoop() {
    gameLoopRunning = false;
    // 这里可以添加更多暂停逻辑
}

// 恢复游戏循环
function resumeGameLoop() {
    if (!gameLoopRunning) {
        gameLoopRunning = true;
        // 重新启动游戏循环
        if (typeof gameLoop === 'function') {
            gameLoop();
        }
    }
}

// 重新开始游戏
function restartGame() {
    if (confirm('确定要重新开始游戏吗？当前进度将丢失。')) {
        // 重置游戏状态
        resetGameState();
        
        // 继续游戏
        resumeGame();
        
        // 重新加载页面
        setTimeout(() => {
            location.reload();
        }, 500);
    }
}

// 退出游戏
function quitGame() {
    if (confirm('确定要退出游戏吗？')) {
        // 可以在这里添加退出逻辑
        // 比如跳转到主菜单页面
        alert('感谢游玩！');
        
        // 如果是在iframe中，可以关闭
        if (window.parent !== window) {
            window.parent.postMessage('closeGame', '*');
        }
    }
}

// 重置游戏状态
function resetGameState() {
    // 重置玩家状态
    if (typeof playerHp !== 'undefined') {
        playerHp = 100;
    }
    if (typeof npcHp !== 'undefined') {
        npcHp = 1000;
    }
    if (typeof playerDead !== 'undefined') {
        playerDead = false;
    }
    if (typeof npcDead !== 'undefined') {
        npcDead = false;
    }
    
    // 重置角色位置
    if (typeof character !== 'undefined' && character) {
        character.style.display = 'block';
        character.style.left = '50px';
        character.style.top = '300px';
    }
    
    if (typeof npc !== 'undefined' && npc) {
        npc.style.display = 'block';
        npc.style.left = '400px';
        npc.style.top = '300px';
    }
    
    // 重置血条
    const playerBar = document.getElementById('player-hp-bar');
    const npcBar = document.getElementById('npc-hp-bar');
    if (playerBar) playerBar.style.width = '100%';
    if (npcBar) npcBar.style.width = '100%';
    
    // 清除所有子弹和特效
    const projectiles = document.querySelectorAll('.projectile');
    projectiles.forEach(proj => {
        if (proj.parentNode) {
            proj.parentNode.removeChild(proj);
        }
    });
    
    const effects = document.querySelectorAll('.fire-effect, .ice-effect, .lightning-effect, .earth-effect');
    effects.forEach(effect => {
        if (effect.parentNode) {
            effect.parentNode.removeChild(effect);
        }
    });
    
    console.log('游戏状态已重置');
}

// 检查游戏是否暂停
function isPaused() {
    return isGamePaused;
}

// 添加暂停时的特殊效果
function addPauseEffects() {
    // 为所有移动的元素添加暂停动画
    const movingElements = document.querySelectorAll('#character, #npc, .projectile, .trail-dot');
    movingElements.forEach(element => {
        if (element.style.animation) {
            element.style.animationPlayState = 'paused';
        }
    });
    
    // 添加暂停时的视觉提示
    const pauseIndicator = document.createElement('div');
    pauseIndicator.id = 'pause-indicator';
    pauseIndicator.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(59, 130, 246, 0.9);
        color: white;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 14px;
        font-weight: bold;
        z-index: 10001;
        animation: pulse 2s infinite;
    `;
    pauseIndicator.textContent = '已暂停';
    document.body.appendChild(pauseIndicator);
    
    // 添加脉冲动画样式
    if (!document.getElementById('pause-animation-style')) {
        const style = document.createElement('style');
        style.id = 'pause-animation-style';
        style.textContent = `
            @keyframes pulse {
                0% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.7; transform: scale(1.1); }
                100% { opacity: 1; transform: scale(1); }
            }
        `;
        document.head.appendChild(style);
    }
}

// 移除暂停时的特殊效果
function removePauseEffects() {
    // 恢复所有移动元素的动画
    const movingElements = document.querySelectorAll('#character, #npc, .projectile, .trail-dot');
    movingElements.forEach(element => {
        if (element.style.animation) {
            element.style.animationPlayState = 'running';
        }
    });
    
    // 移除暂停指示器
    const pauseIndicator = document.getElementById('pause-indicator');
    if (pauseIndicator) {
        pauseIndicator.remove();
    }
}

// 获取游戏运行时间（不包括暂停时间）
function getGameTime() {
    const currentTime = Date.now();
    const actualGameTime = currentTime - gameStartTime - totalPauseTime;
    return Math.max(0, actualGameTime);
}

// 格式化游戏时间
function formatGameTime(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
        return `${hours}:${String(minutes % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
    } else {
        return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
    }
}

// 在页面加载完成后初始化暂停系统
document.addEventListener('DOMContentLoaded', function() {
    initPauseSystem();
});

// 导出函数供其他文件使用
window.pauseGame = pauseGame;
window.resumeGame = resumeGame;
window.restartGame = restartGame;
window.quitGame = quitGame;
window.isPaused = isPaused;
window.togglePause = togglePause;
window.getGameTime = getGameTime;
window.formatGameTime = formatGameTime;
