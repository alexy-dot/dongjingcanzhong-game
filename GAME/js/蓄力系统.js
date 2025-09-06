// 蓄力系统
let isCharging = false;
let chargeLevel = 0;
let maxChargeLevel = 100;
let chargeSpeed = 2; // 每帧增加的蓄力值
let chargeInterval = null;

// 蓄力条元素
const chargeBarContainer = document.getElementById('charge-bar-container');
const chargeBarFill = document.getElementById('charge-bar-fill');
const chargeText = document.getElementById('charge-text');

// 开始蓄力
function startCharging() {
    if (isCharging) return;
    
    isCharging = true;
    chargeLevel = 0;
    
    // 显示蓄力条
    chargeBarContainer.style.display = 'block';
    
    // 开始蓄力动画
    chargeBarFill.classList.add('charging');
    
    // 蓄力循环
    chargeInterval = setInterval(() => {
        chargeLevel += chargeSpeed;
        
        if (chargeLevel >= maxChargeLevel) {
            chargeLevel = maxChargeLevel;
            // 蓄力完成，显示特殊效果
            chargeBarFill.classList.remove('charging');
            chargeBarFill.classList.add('fully-charged');
        }
        
        // 更新蓄力条显示
        updateChargeBar();
    }, 16); // 约60FPS
}

// 停止蓄力并发动攻击
function stopCharging() {
    if (!isCharging) return;
    
    isCharging = false;
    clearInterval(chargeInterval);
    
    // 隐藏蓄力条
    chargeBarContainer.style.display = 'none';
    
    // 移除动画类
    chargeBarFill.classList.remove('charging', 'fully-charged');
    
    // 根据蓄力等级发动攻击
    if (chargeLevel > 0) {
        launchChargedAttack(chargeLevel);
    }
    
    // 重置蓄力值
    chargeLevel = 0;
    updateChargeBar();
}

// 更新蓄力条显示
function updateChargeBar() {
    const percentage = Math.min(100, Math.round((chargeLevel / maxChargeLevel) * 100));
    chargeBarFill.style.width = percentage + '%';
    chargeText.textContent = percentage + '%';
}

// 发动蓄力攻击
function launchChargedAttack(chargeLevel) {
    const characterRect = character.getBoundingClientRect();
    const boundaryRect = boundary.getBoundingClientRect();
    
    // 计算攻击强度
    const damage = Math.floor(chargeLevel / 10) + 10; // 基础10点伤害，每10点蓄力增加1点
    const projectileSize = Math.min(50, 20 + chargeLevel / 2); // 子弹大小随蓄力增加
    const projectileSpeed = 8 + chargeLevel / 20; // 子弹速度随蓄力增加
    
    // 创建蓄力子弹
    const projectile = document.createElement('div');
    projectile.classList.add('projectile', 'charged-projectile');
    projectile.style.width = projectileSize + 'px';
    projectile.style.height = projectileSize + 'px';
    projectile.style.borderRadius = '50%';
    projectile.style.background = 'radial-gradient(circle, #a855f7, #7c3aed, #5b21b6)';
    projectile.style.boxShadow = '0 0 20px #a855f7, 0 0 35px #7c3aed, 0 0 50px #5b21b6';
    
    // 设置子弹位置
    if (isFacingLeft) {
        projectile.style.left = (characterRect.left - boundaryRect.left - projectileSize) + 'px';
    } else {
        projectile.style.left = (characterRect.left - boundaryRect.left + characterRect.width) + 'px';
    }
    projectile.style.top = (characterRect.top - boundaryRect.top + characterRect.height / 2 - projectileSize / 2) + 'px';
    
    boundary.appendChild(projectile);
    
    // 子弹移动
    const vx = isFacingLeft ? -projectileSpeed : projectileSpeed;
    const intervalId = setInterval(() => {
        const currentLeft = parseInt(projectile.style.left);
        const nextLeft = currentLeft + vx;
        projectile.style.left = nextLeft + 'px';
        
        // 创建尾迹粒子
        createChargedTrailParticle(nextLeft, parseInt(projectile.style.top), chargeLevel);
        
        // 检测与NPC的碰撞
        const projectileRect = projectile.getBoundingClientRect();
        const npcRect = npc.getBoundingClientRect();
        
        if (isColliding(projectileRect, npcRect)) {
            // 造成伤害
            if (typeof damageNpc === 'function') {
                damageNpc(damage);
            }
            
            // 击退效果
            if (typeof applyKnockback === 'function') {
                const knockbackDirection = vx > 0 ? 'right' : 'left';
                const knockbackForce = Math.min(300, 150 + chargeLevel);
                applyKnockback(npc, knockbackDirection, knockbackForce, 200);
            }
            
            // 创建爆炸效果
            createChargedExplosion(nextLeft, parseInt(projectile.style.top), chargeLevel);
            
            clearInterval(intervalId);
            if (projectile.parentNode === boundary) boundary.removeChild(projectile);
            return;
        }
        
        // 边界检查
        if (nextLeft < -100 || nextLeft > boundaryRect.width + 100) {
            clearInterval(intervalId);
            if (projectile.parentNode === boundary) boundary.removeChild(projectile);
        }
    }, 16);
    
    // 播放攻击音效
    if (typeof playAttackSound === 'function') {
        playAttackSound();
    }
    
    console.log(`蓄力攻击发动！蓄力等级: ${chargeLevel}, 伤害: ${damage}`);
}

// 创建蓄力攻击尾迹粒子
function createChargedTrailParticle(x, y, chargeLevel) {
    const particle = document.createElement('div');
    particle.classList.add('charged-trail-particle');
    particle.style.position = 'absolute';
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    particle.style.width = '4px';
    particle.style.height = '4px';
    particle.style.borderRadius = '50%';
    particle.style.background = `hsl(${280 + chargeLevel / 2}, 70%, 60%)`;
    particle.style.boxShadow = `0 0 8px hsl(${280 + chargeLevel / 2}, 70%, 60%)`;
    
    boundary.appendChild(particle);
    
    // 粒子消失动画
    setTimeout(() => {
        if (particle.parentNode === boundary) boundary.removeChild(particle);
    }, 800);
}

// 创建蓄力攻击爆炸效果
function createChargedExplosion(x, y, chargeLevel) {
    const explosionSize = Math.min(120, 60 + chargeLevel);
    const explosion = document.createElement('div');
    explosion.style.position = 'absolute';
    explosion.style.left = (x - explosionSize / 2) + 'px';
    explosion.style.top = (y - explosionSize / 2) + 'px';
    explosion.style.width = explosionSize + 'px';
    explosion.style.height = explosionSize + 'px';
    explosion.style.borderRadius = '50%';
    explosion.style.background = 'radial-gradient(circle, #a855f7, #7c3aed, #5b21b6)';
    explosion.style.boxShadow = '0 0 30px #a855f7';
    explosion.style.zIndex = '1000';
    
    boundary.appendChild(explosion);
    
    // 爆炸动画
    let scale = 0.5;
    let opacity = 1;
    const explosionInterval = setInterval(() => {
        scale += 0.1;
        opacity -= 0.05;
        explosion.style.transform = `scale(${scale})`;
        explosion.style.opacity = opacity;
        
        if (scale >= 2 || opacity <= 0) {
            clearInterval(explosionInterval);
            if (explosion.parentNode === boundary) boundary.removeChild(explosion);
        }
    }, 50);
}

// 键盘事件监听
document.addEventListener('keydown', (e) => {
    if (e.key === 'h' || e.key === 'H') {
        if (!isCharging) {
            startCharging();
        }
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'h' || e.key === 'H') {
        if (isCharging) {
            stopCharging();
        }
    }
});

// 初始化蓄力条
function initChargeBar() {
    updateChargeBar();
    chargeBarContainer.style.display = 'none';
}

// 页面加载完成后初始化
window.addEventListener('load', initChargeBar);
