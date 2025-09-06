// 攻击功能
// 攻击冷却时间戳
let playerAttackCooldownUntil = 0;
let playerMeleeCooldownUntil = 0;
let playerBurstCooldownUntil = 0;

// 攻击功能
function attack() {
    const now = Date.now();
    if (now < playerAttackCooldownUntil) return; // 冷却中不可攻击
    if (isDefending) return; // 防御状态下不可攻击
    
    // 检查必要的变量和元素是否存在
    if (typeof character === 'undefined' || !character || typeof npc === 'undefined' || !npc || typeof boundary === 'undefined' || !boundary) {
        console.error('攻击系统：缺少必要的游戏元素');
        return;
    }
    
    // 取消距离限制，允许在任何距离攻击
    
    isAttacking = true;
    character.classList.add('attacking');
    // 播放攻击音效（使用更稳健的函数，支持快速连击）
    if (typeof playAttackSound === 'function') {
        playAttackSound();
    }
    
    // 创建增强远程攻击元素
    const projectile = document.createElement('div');
    projectile.classList.add('projectile', 'has-trail', 'trail-blue', 'enhanced-projectile');
    projectile.style.cssText = `
        width: 12px;
        height: 12px;
        background: radial-gradient(circle, #ffffff 0%, #60a5fa 40%, #3b82f6 100%);
        border: 2px solid #1d4ed8;
        border-radius: 50%;
        box-shadow: 0 0 15px #60a5fa, 0 0 25px #3b82f6, inset 0 0 8px #ffffff;
        z-index: 100;
        position: absolute;
        pointer-events: none;
        transform: scale(1);
        animation: projectilePulse 0.1s ease-in-out infinite alternate;
    `;
    
    // 获取角色和边界位置信息
    const boundaryRect = boundary.getBoundingClientRect();
    
    // 获取角色位置信息
    const characterRect = character.getBoundingClientRect();
    
    // 判断角色朝向（新增逻辑）
    const isFacingLeft = character.classList.contains('facing-left');
    
    // 设置攻击物初始位置（根据朝向调整）
    if (isFacingLeft) {
        // 面向左：从角色左侧中间发出
        projectile.style.left = (characterRect.left - boundaryRect.left) + 'px';
    } else {
        // 面向右：从角色右侧中间发出（原逻辑）
        projectile.style.left = (characterRect.left - boundaryRect.left + characterRect.width) + 'px';
    }
    projectile.style.top = (characterRect.top - boundaryRect.top + characterRect.height / 2) + 'px';
    
    // 添加到游戏边界中
    boundary.appendChild(projectile);
    
    // 远程攻击移动逻辑（根据朝向调整方向）
    const moveSpeed = isFacingLeft ? -10 : 10; // 向左为负速度，向右为正速度
    const moveInterval = setInterval(() => {
        const currentLeft = parseInt(projectile.style.left);
        
        // 碰撞检测 - 主角的攻击物检测与NPC的碰撞
        const npcRectNow = npc.getBoundingClientRect();
        const projectileRect = projectile.getBoundingClientRect();
        
        if (isColliding(projectileRect, npcRectNow)) {
            // 主角攻击命中NPC：对NPC施加击退并扣血
            if (typeof damageNpc === 'function') {
                damageNpc(10);
            }
            if (typeof applyKnockback === 'function') {
                applyKnockback(npc, isFacingLeft ? 'left' : 'right', 100, 160);
            }
            clearInterval(moveInterval);
            if (projectile.parentNode === boundary) {
                boundary.removeChild(projectile);
            }
            return;
        }
        
        // 超出边界时移除攻击物
        if ((isFacingLeft && currentLeft < 0) || (!isFacingLeft && currentLeft > boundaryRect.width)) {
            clearInterval(moveInterval);
            if (projectile.parentNode === boundary) {
                boundary.removeChild(projectile);
            }
            return;
        }
        
        // 移动攻击物
        projectile.style.left = (currentLeft + moveSpeed) + 'px';
        
        // 创建增强尾迹特效
        createEnhancedTrailEffect(currentLeft + moveSpeed, parseInt(projectile.style.top), moveSpeed);
        
    }, 16);
    // 攻击持续200ms后恢复
    setTimeout(() => {
        isAttacking = false;
        character.classList.remove('attacking');
    }, 200);
    
    // 设置攻击冷却（800ms）
    playerAttackCooldownUntil = now + 800;
    
    console.log('攻击执行成功！');
}

// 主角近战攻击：贴身时造成击退与较高伤害
function playerMeleeAttack() {
    const now = Date.now();
    if (now < playerMeleeCooldownUntil) return; // 冷却中不可攻击
    if (isAttacking) return;
    if (isDefending) return; // 防御状态下不可攻击
    
    // 检查必要的变量和元素是否存在
    if (typeof character === 'undefined' || !character || typeof npc === 'undefined' || !npc || typeof boundary === 'undefined' || !boundary) {
        console.error('近战攻击系统：缺少必要的游戏元素');
        return;
    }
    
    isAttacking = true;
    character.classList.add('attacking');
    
    const characterRect = character.getBoundingClientRect();
    const npcRect = npc.getBoundingClientRect();
    const boundaryRect = boundary.getBoundingClientRect();
    const characterCenterX = characterRect.left + characterRect.width / 2;
    const npcCenterX = npcRect.left + npcRect.width / 2;
    const facingRight = characterCenterX <= npcCenterX;
    
    // 取消距离限制，允许在任何距离进行近战攻击
    if (typeof damageNpc === 'function') damageNpc(15);
    if (typeof applyKnockback === 'function') {
        applyKnockback(npc, facingRight ? 'right' : 'left', 120, 180);
    }
    
    setTimeout(() => {
        isAttacking = false;
        character.classList.remove('attacking');
    }, 220);
    
    playerMeleeCooldownUntil = now + 100; // 近战攻击冷却100ms
    console.log('近战攻击执行成功！');
}

// 工具：创建主角子弹，支持竖直速度与自定义伤害
function createPlayerProjectileWithDamage(vx, vy, damage) {
    const now = Date.now();
    if (now < playerBurstCooldownUntil) return; // 冷却中不可攻击
    if (isDefending) return; // 防御状态下不可攻击
    
    const projectile = document.createElement('div');
    projectile.classList.add('projectile', 'has-trail', 'trail-green', 'enhanced-projectile');
    projectile.style.cssText = `
        width: 10px;
        height: 10px;
        background: radial-gradient(circle, #ffffff 0%, #10b981 40%, #059669 100%);
        border: 2px solid #047857;
        border-radius: 50%;
        box-shadow: 0 0 12px #10b981, 0 0 20px #059669, inset 0 0 6px #ffffff;
        z-index: 100;
        position: absolute;
        pointer-events: none;
        transform: scale(1);
        animation: projectilePulse 0.1s ease-in-out infinite alternate;
    `;
    
    const characterRect = character.getBoundingClientRect();
    const boundaryRect = boundary.getBoundingClientRect();
    const isFacingLeft = vx < 0;
    if (isFacingLeft) {
        projectile.style.left = (characterRect.left - boundaryRect.left) + 'px';
    } else {
        projectile.style.left = (characterRect.left - boundaryRect.left + characterRect.width) + 'px';
    }
    projectile.style.top = (characterRect.top - boundaryRect.top + characterRect.height / 2) + 'px';
    boundary.appendChild(projectile);

    const moveInterval = setInterval(() => {
        const currentLeft = parseInt(projectile.style.left);
        const currentTop = parseInt(projectile.style.top);
        const nextLeft = currentLeft + vx;
        const nextTop = currentTop + vy;
        projectile.style.left = nextLeft + 'px';
        projectile.style.top = nextTop + 'px';

        // 创建增强尾迹粒子
        createEnhancedTrailParticle(nextLeft, nextTop, vx, vy);

        const npcRect = npc.getBoundingClientRect();
        const projectileRect = projectile.getBoundingClientRect();
        if (isColliding(projectileRect, npcRect)) {
            if (typeof damageNpc === 'function') damageNpc(Math.max(1, damage || 8));
            applyKnockback(npc, vx > 0 ? 'right' : 'left', 100, 160);
            clearInterval(moveInterval);
            if (projectile.parentNode === boundary) boundary.removeChild(projectile);
            return;
        }

        if (nextLeft < 0 || nextLeft > boundaryRect.width || nextTop < 0 || nextTop > boundaryRect.height) {
            clearInterval(moveInterval);
            if (projectile.parentNode === boundary) boundary.removeChild(projectile);
            return;
        }
    }, 16);
    playerBurstCooldownUntil = now + 100; // 三连散射冷却100ms
}

// 兼容旧接口
function createPlayerProjectile(vx, vy) {
    return createPlayerProjectileWithDamage(vx, vy, 8);
}

// 主角散弹技能：发射多个子弹形成扇形攻击
let scatterShotCooldownUntil = 0;

function playerScatterShotAttack() {
    const now = Date.now();
    if (now < scatterShotCooldownUntil) return; // 冷却中不可使用
    if (isAttacking) return;
    if (isDefending) return; // 防御状态下不可使用
    
    isAttacking = true;
    character.classList.add('attacking', 'scatter-shot-attack');
    
    // 执行散弹攻击
    executeScatterShot();
    
    setTimeout(() => {
        isAttacking = false;
        character.classList.remove('attacking', 'scatter-shot-attack');
    }, 500);
    
    scatterShotCooldownUntil = now + 1000; // 散弹技能冷却1秒
    console.log('散弹技能激活成功！');
}

// 执行散弹攻击
function executeScatterShot() {
    if (!boundary || !character || !npc) return;
    
    const characterRect = character.getBoundingClientRect();
    const boundaryRect = boundary.getBoundingClientRect();
    const isFacingLeft = character.classList.contains('facing-left');
    
    // 散弹配置
    const bulletCount = 7; // 发射7发子弹
    const spreadAngle = 60; // 扇形角度60度
    const baseSpeed = 12; // 基础速度
    const bulletDamage = 8; // 每发子弹伤害
    
    // 计算发射角度范围
    const baseAngle = isFacingLeft ? 180 : 0; // 基础角度（左180度，右0度）
    const angleStep = spreadAngle / (bulletCount - 1); // 角度步长
    const startAngle = baseAngle - spreadAngle / 2; // 起始角度
    
    // 发射每发子弹
    for (let i = 0; i < bulletCount; i++) {
        setTimeout(() => {
            const angle = startAngle + i * angleStep;
            const radians = (angle * Math.PI) / 180;
            
            // 计算子弹速度分量
            const vx = Math.cos(radians) * baseSpeed;
            const vy = Math.sin(radians) * baseSpeed;
            
            // 创建散弹子弹
            createScatterBullet(
                characterRect, 
                boundaryRect, 
                vx, 
                vy, 
                bulletDamage, 
                i,
                isFacingLeft
            );
        }, i * 80); // 每发子弹间隔80ms
    }
    
    // 创建散弹发射特效
    createScatterShotEffect(characterRect, boundaryRect, isFacingLeft);
}

// 创建散弹子弹
function createScatterBullet(characterRect, boundaryRect, vx, vy, damage, bulletIndex, isFacingLeft) {
    if (!boundary) return;
    
    // 创建散弹子弹元素
    const bullet = document.createElement('div');
    bullet.className = 'scatter-bullet';
    bullet.style.cssText = `
        position: absolute;
        width: 8px;
        height: 8px;
        background: radial-gradient(circle, #ffffff 0%, #ff6b6b 40%, #ee5a52 100%);
        border: 2px solid #dc2626;
        border-radius: 50%;
        box-shadow: 0 0 10px #ff6b6b, 0 0 15px #ee5a52, inset 0 0 4px #ffffff;
        pointer-events: none;
        z-index: 120;
        transform: scale(1);
        animation: scatterBulletPulse 0.1s ease-in-out infinite alternate;
    `;
    
    // 设置初始位置
    const startX = isFacingLeft ? 
        (characterRect.left - boundaryRect.left - 20) : 
        (characterRect.left - boundaryRect.left + characterRect.width + 20);
    const startY = characterRect.top - boundaryRect.top + characterRect.height / 2;
    
    bullet.style.left = startX + 'px';
    bullet.style.top = startY + 'px';
    
    boundary.appendChild(bullet);
    
    // 子弹移动逻辑
    const moveInterval = setInterval(() => {
        if (!bullet.parentNode) {
            clearInterval(moveInterval);
            return;
        }
        
        const currentLeft = parseInt(bullet.style.left);
        const currentTop = parseInt(bullet.style.top);
        const nextLeft = currentLeft + vx;
        const nextTop = currentTop + vy;
        
        bullet.style.left = nextLeft + 'px';
        bullet.style.top = nextTop + 'px';
        
        // 创建散弹尾迹特效
        createScatterTrailEffect(nextLeft, nextTop, bulletIndex);
        
        // 检测碰撞
        const npcRect = npc.getBoundingClientRect();
        const bulletRect = bullet.getBoundingClientRect();
        if (isColliding(bulletRect, npcRect)) {
            if (typeof damageNpc === 'function') {
                damageNpc(damage);
            }
            if (typeof applyKnockback === 'function') {
                applyKnockback(npc, vx > 0 ? 'right' : 'left', 80, 200);
            }
            createScatterHitEffect(nextLeft, nextTop);
            clearInterval(moveInterval);
            if (bullet.parentNode === boundary) boundary.removeChild(bullet);
            return;
        }
        
        // 超出边界移除
        if (nextLeft < 0 || nextLeft > boundaryRect.width || nextTop < 0 || nextTop > boundaryRect.height) {
            clearInterval(moveInterval);
            if (bullet.parentNode === boundary) boundary.removeChild(bullet);
        }
    }, 16);
}

// 创建散弹发射特效
function createScatterShotEffect(characterRect, boundaryRect, isFacingLeft) {
    if (!boundary) return;
    
    // 创建发射闪光特效
    const flashEffect = document.createElement('div');
    flashEffect.className = 'scatter-shot-flash';
    flashEffect.style.cssText = `
        position: absolute;
        width: 100px;
        height: 60px;
        background: radial-gradient(ellipse, rgba(255, 255, 255, 0.9), rgba(255, 107, 107, 0.7), transparent);
        border-radius: 50%;
        pointer-events: none;
        z-index: 110;
        left: ${isFacingLeft ? (characterRect.left - boundaryRect.left - 80) : (characterRect.left - boundaryRect.left + characterRect.width - 20)}px;
        top: ${characterRect.top - boundaryRect.top + characterRect.height / 2 - 30}px;
        animation: scatterShotFlash 0.3s ease-out forwards;
    `;
    
    boundary.appendChild(flashEffect);
    
    // 0.3秒后移除
    setTimeout(() => {
        if (flashEffect.parentNode) {
            flashEffect.parentNode.removeChild(flashEffect);
        }
    }, 300);
}

// 创建散弹尾迹特效
function createScatterTrailEffect(x, y, bulletIndex) {
    if (!boundary) return;
    
    // 根据子弹索引创建不同颜色的尾迹
    const colors = ['#ff6b6b', '#ff8e8e', '#ffb1b1', '#ffd4d4', '#ff6b6b', '#ff8e8e', '#ffb1b1'];
    const color = colors[bulletIndex % colors.length];
    
    const trailParticle = document.createElement('div');
    trailParticle.className = 'scatter-trail-particle';
    trailParticle.style.cssText = `
        position: absolute;
        width: 4px;
        height: 4px;
        background: radial-gradient(circle, #ffffff, ${color});
        border-radius: 50%;
        box-shadow: 0 0 6px ${color};
        pointer-events: none;
        z-index: 115;
        left: ${x}px;
        top: ${y}px;
        animation: scatterTrailFade 0.5s ease-out forwards;
    `;
    
    boundary.appendChild(trailParticle);
    
    // 0.5秒后移除
    setTimeout(() => {
        if (trailParticle.parentNode) {
            trailParticle.parentNode.removeChild(trailParticle);
        }
    }, 500);
}

// 创建散弹击中特效
function createScatterHitEffect(x, y) {
    if (!boundary) return;
    
    const hitEffect = document.createElement('div');
    hitEffect.className = 'scatter-hit-effect';
    hitEffect.style.cssText = `
        position: absolute;
        left: ${x}px;
        top: ${y}px;
        width: 40px;
        height: 40px;
        background: radial-gradient(circle, #ff0000, #ff6600, transparent);
        border-radius: 50%;
        pointer-events: none;
        z-index: 125;
        transform: translate(-50%, -50%);
        animation: scatterHitFade 0.3s ease-out forwards;
    `;
    
    boundary.appendChild(hitEffect);
    
    // 0.3秒后移除
    setTimeout(() => {
        if (hitEffect.parentNode) {
            hitEffect.parentNode.removeChild(hitEffect);
        }
    }, 300);
}



// 创建增强尾迹特效
function createEnhancedTrailEffect(x, y, direction) {
    if (!boundary) return;
    
    // 创建主尾迹粒子
    const trailParticle = document.createElement('div');
    trailParticle.className = 'enhanced-trail-particle';
    trailParticle.style.cssText = `
        position: absolute;
        width: 6px;
        height: 6px;
        background: radial-gradient(circle, #60a5fa, #3b82f6);
        border-radius: 50%;
        box-shadow: 0 0 8px #60a5fa;
        pointer-events: none;
        z-index: 95;
        left: ${x}px;
        top: ${y}px;
        animation: enhancedTrailFade 0.6s ease-out forwards;
    `;
    
    boundary.appendChild(trailParticle);
    
    // 创建扩散粒子
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            const spreadParticle = document.createElement('div');
            spreadParticle.className = 'spread-trail-particle';
            spreadParticle.style.cssText = `
                position: absolute;
                width: 3px;
                height: 3px;
                background: radial-gradient(circle, #93c5fd, #60a5fa);
                border-radius: 50%;
                box-shadow: 0 0 6px #93c5fd;
                pointer-events: none;
                z-index: 94;
                left: ${x + (Math.random() - 0.5) * 20}px;
                top: ${y + (Math.random() - 0.5) * 20}px;
                animation: spreadTrailFade 0.8s ease-out forwards;
            `;
            
            boundary.appendChild(spreadParticle);
            
            setTimeout(() => {
                if (spreadParticle.parentNode) {
                    spreadParticle.parentNode.removeChild(spreadParticle);
                }
            }, 800);
        }, i * 50);
    }
    
    // 0.6秒后移除主尾迹
    setTimeout(() => {
        if (trailParticle.parentNode) {
            trailParticle.parentNode.removeChild(trailParticle);
        }
    }, 600);
}

// 创建增强尾迹粒子
function createEnhancedTrailParticle(x, y, vx, vy) {
    if (!boundary) return;
    
    // 根据弹幕类型选择颜色
    let color, shadowColor;
    if (vx < 0) { // 向左
        color = '#10b981';
        shadowColor = '#059669';
    } else { // 向右
        color = '#60a5fa';
        shadowColor = '#3b82f6';
    }
    
    // 创建主尾迹
    const trailParticle = document.createElement('div');
    trailParticle.className = 'enhanced-trail-particle';
    trailParticle.style.cssText = `
        position: absolute;
        width: 5px;
        height: 5px;
        background: radial-gradient(circle, #ffffff, ${color});
        border-radius: 50%;
        box-shadow: 0 0 8px ${color}, 0 0 12px ${shadowColor};
        pointer-events: none;
        z-index: 95;
        left: ${x}px;
        top: ${y}px;
        animation: enhancedTrailFade 0.7s ease-out forwards;
    `;
    
    boundary.appendChild(trailParticle);
    
    // 创建扩散粒子
    for (let i = 0; i < 2; i++) {
        setTimeout(() => {
            const spreadParticle = document.createElement('div');
            spreadParticle.className = 'spread-trail-particle';
            spreadParticle.style.cssText = `
                position: absolute;
                width: 3px;
                height: 3px;
                background: radial-gradient(circle, #ffffff, ${color});
                border-radius: 50%;
                box-shadow: 0 0 6px ${color};
                pointer-events: none;
                z-index: 94;
                left: ${x + (Math.random() - 0.5) * 15}px;
                top: ${y + (Math.random() - 0.5) * 15}px;
                animation: spreadTrailFade 0.9s ease-out forwards;
            `;
            
            boundary.appendChild(spreadParticle);
            
            setTimeout(() => {
                if (spreadParticle.parentNode) {
                    spreadParticle.parentNode.removeChild(spreadParticle);
                }
            }, 900);
        }, i * 60);
    }
    
    // 0.7秒后移除主尾迹
    setTimeout(() => {
        if (trailParticle.parentNode) {
            trailParticle.parentNode.removeChild(trailParticle);
        }
    }, 700);
}

// 创建蓄力攻击尾迹粒子
function createChargedTrailParticle(x, y, chargeRatio) {
    if (!boundary) return;
    
    // 根据蓄力程度动态调整粒子大小、数量和扩散范围
    const baseSize = 4;
    const sizeMultiplier = 1 + chargeRatio * 3; // 1-4倍大小
    const particleSize = Math.floor(baseSize * sizeMultiplier);
    
    const baseCount = 3;
    const countMultiplier = 1 + chargeRatio * 2; // 1-3倍数量
    const particleCount = Math.floor(baseCount * countMultiplier);
    
    const baseSpread = 20;
    const spreadMultiplier = 1 + chargeRatio * 2; // 1-3倍扩散范围
    const spreadRadius = Math.floor(baseSpread * spreadMultiplier);
    
    // 根据蓄力程度调整发光强度
    const baseGlow = 10;
    const glowMultiplier = 1 + chargeRatio * 2; // 1-3倍发光强度
    const glowIntensity = Math.floor(baseGlow * glowMultiplier);
    
    for (let i = 0; i < particleCount; i++) {
        setTimeout(() => {
            const chargedParticle = document.createElement('div');
            chargedParticle.className = 'charged-trail-particle';
            chargedParticle.style.cssText = `
                position: absolute;
                width: ${particleSize}px;
                height: ${particleSize}px;
                background: radial-gradient(circle, #ffffff, #a855f7, #7c3aed);
                border-radius: 50%;
                box-shadow: 0 0 ${glowIntensity}px #a855f7, 0 0 ${glowIntensity + 5}px #7c3aed;
                pointer-events: none;
                z-index: 96;
                left: ${x + (Math.random() - 0.5) * spreadRadius}px;
                top: ${y + (Math.random() - 0.5) * spreadRadius}px;
                animation: chargedTrailFade 0.8s ease-out forwards;
            `;
            
            boundary.appendChild(chargedParticle);
            
            setTimeout(() => {
                if (chargedParticle.parentNode) {
                    chargedParticle.parentNode.removeChild(chargedParticle);
                }
            }, 800);
        }, i * 40);
    }
}

// 检查散弹技能是否可用
function isScatterShotReady() {
    return Date.now() >= scatterShotCooldownUntil;
}

// 蓄力攻击（H 按下开始，松开发射）
let playerIsCharging = false;
let playerChargeStart = 0;
let playerChargeCooldownUntil = 0;

function startChargeAttack() {
    const now = Date.now();
    if (playerIsCharging) return;
    if (now < playerChargeCooldownUntil) return; // 冷却中不可再次蓄力
    if (isDefending) return; // 防御状态下不可攻击
    
    playerIsCharging = true;
    playerChargeStart = Date.now();
    character.classList.add('charging');
}

function releaseChargeAttack() {
    if (!playerIsCharging) return;
    if (isDefending) return; // 防御状态下不可攻击
    
    playerIsCharging = false;
    character.classList.remove('charging');
    const elapsed = Math.min(2000, Math.max(200, Date.now() - playerChargeStart));
    // 伤害与速度按蓄力时间线性缩放
    const ratio = elapsed / 2000; // 0.1~1.0
    const isFacingLeft = character.classList.contains('facing-left');
    const baseV = 10;
    const vx = (isFacingLeft ? -1 : 1) * Math.round(baseV + 10 * ratio);
    const damage = Math.round(12 + 18 * ratio); // 12~30
    // 创建增强蓄力子弹
    const projectile = document.createElement('div');
    projectile.classList.add('projectile', 'projectile--charged', 'has-trail', 'trail-violet', 'enhanced-projectile');
    
    // 根据蓄力程度动态调整子弹大小
    const baseSize = 16;
    const sizeMultiplier = 1 + ratio * 16; // 1-4倍大小
    const finalSize = Math.floor(baseSize * sizeMultiplier);
    
    // 根据蓄力程度调整边框宽度
    const borderWidth = Math.max(2, Math.floor(3 * sizeMultiplier)); // 2-12px边框
    
    // 根据蓄力程度调整发光强度
    const glowIntensity = Math.floor(20 + ratio * 60); // 20-80px发光强度
    const innerGlow = Math.floor(10 + ratio * 30); // 10-40px内部发光
    
    projectile.style.cssText = `
        width: ${finalSize}px;
        height: ${finalSize}px;
        background: radial-gradient(circle, #ffffff 0%, #a855f7 30%, #7c3aed 70%, #5b21b6 100%);
        border: ${borderWidth}px solid #4c1d95;
        border-radius: 50%;
        box-shadow: 0 0 ${glowIntensity}px #a855f7, 0 0 ${glowIntensity + 15}px #7c3aed, 0 0 ${glowIntensity + 30}px #5b21b6, inset 0 0 ${innerGlow}px #ffffff;
        z-index: 100;
        position: absolute;
        pointer-events: none;
        transform: scale(1);
        animation: chargedProjectilePulse 0.08s ease-in-out infinite alternate;
    `;
    const characterRect = character.getBoundingClientRect();
    const boundaryRect = boundary.getBoundingClientRect();
    projectile.style.left = (isFacingLeft ? (characterRect.left - boundaryRect.left) : (characterRect.left - boundaryRect.left + characterRect.width)) + 'px';
    projectile.style.top = (characterRect.top - boundaryRect.top + characterRect.height / 2) + 'px';
    boundary.appendChild(projectile);
    console.log('蓄力攻击执行成功！');

    const moveInterval = setInterval(() => {
        const currentLeft = parseInt(projectile.style.left);
        const nextLeft = currentLeft + vx;
        projectile.style.left = nextLeft + 'px';

        // 创建增强蓄力尾迹粒子
        createChargedTrailParticle(nextLeft, parseInt(projectile.style.top), ratio);

        const npcRect = npc.getBoundingClientRect();
        const projectileRect = projectile.getBoundingClientRect();
        if (isColliding(projectileRect, npcRect)) {
            if (typeof damageNpc === 'function') damageNpc(damage);
            
            // 根据蓄力程度调整击退效果
            const baseKnockback = 140;
            const knockbackMultiplier = 1 + ratio * 2; // 1-3倍击退
            const finalKnockback = Math.floor(baseKnockback * knockbackMultiplier);
            
            applyKnockback(npc, vx > 0 ? 'right' : 'left', finalKnockback, 200);
            clearInterval(moveInterval);
            if (projectile.parentNode === boundary) boundary.removeChild(projectile);
            return;
        }

        if (nextLeft < 0 || nextLeft > boundaryRect.width) {
            clearInterval(moveInterval);
            if (projectile.parentNode === boundary) boundary.removeChild(projectile);
            return;
        }
        }, 16);
    
    // 设置冷却：根据蓄力时长决定冷却时间（最短400ms，最长1200ms）
    const cooldown = Math.round(400 + (elapsed / 2000) * 800);
    playerChargeCooldownUntil = Date.now() + cooldown;
}

// 防御功能（保持不变）
function defend(isDefend) {
    isDefending = isDefend;
    if (isDefend) {
        character.classList.add('defending');
    } else {
        character.classList.remove('defending');
    }
}

// ========== 新增攻击形态 ==========

// 元素攻击系统
let currentElement = 'fire'; // 默认火元素

// 切换元素
function switchElement() {
    const elements = ['fire', 'ice', 'lightning', 'earth'];
    const elementNames = ['火', '冰', '雷', '土'];
    const elementColors = ['#ff4444', '#44aaff', '#ffff44', '#44ff44'];
    
    const currentIndex = elements.indexOf(currentElement);
    const nextIndex = (currentIndex + 1) % elements.length;
    currentElement = elements[nextIndex];
    
    // 更新显示的元素名称和颜色
    const elementDisplay = document.getElementById('current-element');
    if (elementDisplay) {
        elementDisplay.textContent = elementNames[nextIndex];
        elementDisplay.style.color = elementColors[nextIndex];
    }
    
    // 显示元素切换提示
    showElementSwitchEffect(currentElement);
    
    console.log(`切换到${currentElement}元素`);
}

// 显示元素切换特效
function showElementSwitchEffect(element) {
    const effect = document.createElement('div');
    effect.classList.add('element-switch-effect');
    effect.style.position = 'absolute';
    effect.style.left = '50%';
    effect.style.top = '20%';
    effect.style.transform = 'translate(-50%, -50%)';
    effect.style.fontSize = '32px';
    effect.style.fontWeight = 'bold';
    effect.style.color = getElementColor(element);
    effect.style.textShadow = '3px 3px 6px rgba(0,0,0,0.9)';
    effect.style.zIndex = '300';
    effect.textContent = `${element.toUpperCase()} ELEMENT`;
    
    document.body.appendChild(effect);
    
    // 元素切换动画
    let opacity = 1;
    let scale = 1;
    const switchInterval = setInterval(() => {
        opacity -= 0.02;
        scale += 0.02;
        effect.style.opacity = opacity;
        effect.style.transform = `translate(-50%, -50%) scale(${scale})`;
        
        if (opacity <= 0) {
            clearInterval(switchInterval);
            if (effect.parentNode === document.body) {
                document.body.removeChild(effect);
            }
        }
    }, 50);
}

// 获取元素颜色
function getElementColor(element) {
    const colors = {
        fire: '#ff4444',
        ice: '#44aaff',
        lightning: '#ffff44',
        earth: '#44ff44'
    };
    return colors[element] || '#ffffff';
}

// 播放元素攻击音效
function playElementAttackSound(element) {
    // 创建音效提示（使用Web Audio API创建简单的音调）
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        // 根据元素设置不同的音调和音量
        const elementSounds = {
            fire: { frequency: 440, duration: 0.2, volume: 0.3 },      // 火元素：A音
            ice: { frequency: 523, duration: 0.3, volume: 0.25 },      // 冰元素：C音
            lightning: { frequency: 659, duration: 0.1, volume: 0.4 }, // 雷元素：E音
            earth: { frequency: 349, duration: 0.4, volume: 0.35 }     // 土元素：F音
        };
        
        const sound = elementSounds[element] || elementSounds.fire;
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(sound.frequency, audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(sound.volume, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + sound.duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + sound.duration);
        
        console.log(`播放${element}元素攻击音效`);
    } catch (e) {
        console.log('元素音效播放失败:', e);
        // 如果Web Audio API不可用，回退到普通攻击音效
        if (typeof playAttackSound === 'function') {
            playAttackSound();
        }
    }
}

// 元素攻击
function elementAttack() {
    const now = Date.now();
    if (now < playerAttackCooldownUntil) return;
    if (isDefending) return;
    
    isAttacking = true;
    character.classList.add('attacking', 'element-attack');
    
    // 播放元素攻击音效提示
    playElementAttackSound(currentElement);
    
    const characterRect = character.getBoundingClientRect();
    const boundaryRect = boundary.getBoundingClientRect();
    const isFacingLeft = character.classList.contains('facing-left');
    
    // 创建元素攻击物
    const elementProjectile = document.createElement('div');
    elementProjectile.classList.add('projectile', 'element-projectile', `element-${currentElement}`);
    elementProjectile.style.width = '28px';
    elementProjectile.style.height = '28px';
    elementProjectile.style.borderRadius = '50%';
    elementProjectile.style.background = getElementColor(currentElement);
    elementProjectile.style.boxShadow = `0 0 20px ${getElementColor(currentElement)}, 0 0 40px ${getElementColor(currentElement)}`;
    
    // 为不同元素添加特殊视觉效果
    switch (currentElement) {
        case 'fire':
            elementProjectile.style.background = 'radial-gradient(circle, #ff6600, #ff3300, #ff0000)';
            elementProjectile.style.border = '2px solid #ffaa00';
            break;
        case 'ice':
            elementProjectile.style.background = 'radial-gradient(circle, #87ceeb, #4682b4, #1e90ff)';
            elementProjectile.style.border = '2px solid #ffffff';
            break;
        case 'lightning':
            elementProjectile.style.background = 'radial-gradient(circle, #ffff00, #ffaa00, #ff8800)';
            elementProjectile.style.border = '2px solid #ffffff';
            break;
        case 'earth':
            elementProjectile.style.background = 'radial-gradient(circle, #8b4513, #a0522d, #cd853f)';
            elementProjectile.style.border = '2px solid #d2b48c';
            break;
    }
    
    // 设置攻击物位置
    if (isFacingLeft) {
        elementProjectile.style.left = (characterRect.left - boundaryRect.left - 12) + 'px';
    } else {
        elementProjectile.style.left = (characterRect.left - boundaryRect.left + characterRect.width) + 'px';
    }
    elementProjectile.style.top = (characterRect.top - boundaryRect.top + characterRect.height / 2 - 12) + 'px';
    
    boundary.appendChild(elementProjectile);
    
    // 元素攻击移动和特效
    const moveSpeed = isFacingLeft ? -12 : 12;
    const moveInterval = setInterval(() => {
        const currentLeft = parseInt(elementProjectile.style.left);
        const nextLeft = currentLeft + moveSpeed;
        elementProjectile.style.left = nextLeft + 'px';
        
        // 元素尾迹特效
        createElementTrail(currentElement, nextLeft, parseInt(elementProjectile.style.top));
        
        // 碰撞检测
        const npcRect = npc.getBoundingClientRect();
        const projectileRect = elementProjectile.getBoundingClientRect();
        
        if (isColliding(projectileRect, npcRect)) {
            // 元素攻击命中
            const damage = getElementDamage(currentElement);
            const effect = getElementEffect(currentElement);
            
            if (typeof damageNpc === 'function') {
                damageNpc(damage);
            }
            
            // 应用元素效果
            applyElementEffect(currentElement, npc);
            
            if (typeof applyKnockback === 'function') {
                applyKnockback(npc, isFacingLeft ? 'left' : 'right', 120, 180);
            }
            
            clearInterval(moveInterval);
            if (elementProjectile.parentNode === boundary) {
                boundary.removeChild(elementProjectile);
            }
            return;
        }
        
        // 边界检查
        if (nextLeft < 0 || nextLeft > boundaryRect.width) {
            clearInterval(moveInterval);
            if (elementProjectile.parentNode === boundary) {
                boundary.removeChild(elementProjectile);
            }
            return;
        }
    }, 16);
    
    // 攻击状态恢复
    setTimeout(() => {
        isAttacking = false;
        character.classList.remove('attacking', 'element-attack');
    }, 300);
    
    // 设置冷却
    playerAttackCooldownUntil = now + 600;
}

// 获取元素伤害
function getElementDamage(element) {
    const damages = {
        fire: 15,
        ice: 12,
        lightning: 18,
        earth: 14
    };
    return damages[element] || 10;
}

// 获取元素效果
function getElementEffect(element) {
    const effects = {
        fire: 'burn',
        ice: 'freeze',
        lightning: 'stun',
        earth: 'slow'
    };
    return effects[element] || 'none';
}

// 创建元素尾迹
function createElementTrail(element, x, y) {
    const trail = document.createElement('div');
    trail.classList.add('element-trail', `trail-${element}`);
    trail.style.position = 'absolute';
    trail.style.left = x + 'px';
    trail.style.top = y + 'px';
    trail.style.width = '8px';
    trail.style.height = '8px';
    trail.style.borderRadius = '50%';
    trail.style.background = getElementColor(element);
    trail.style.opacity = '0.6';
    
    boundary.appendChild(trail);
    
    // 尾迹消失动画
    setTimeout(() => {
        if (trail.parentNode === boundary) {
            boundary.removeChild(trail);
        }
    }, 300);
}

// 应用元素效果
function applyElementEffect(element, target) {
    switch (element) {
        case 'fire':
            // 火元素：持续伤害
            applyFireEffect(target);
            break;
        case 'ice':
            // 冰元素：减速效果
            applyIceEffect(target);
            break;
        case 'lightning':
            // 雷元素：眩晕效果
            applyLightningEffect(target);
            break;
        case 'earth':
            // 土元素：击退增强
            applyEarthEffect(target);
            break;
    }
}

// 火元素效果：持续燃烧伤害 + 火焰特效
function applyFireEffect(target) {
    // 创建火焰燃烧特效
    const fireEffect = document.createElement('div');
    fireEffect.classList.add('fire-effect');
    fireEffect.style.position = 'absolute';
    fireEffect.style.width = '60px';
    fireEffect.style.height = '60px';
    fireEffect.style.borderRadius = '50%';
    fireEffect.style.background = 'radial-gradient(circle, #ff6600, #ff3300, #ff0000)';
    fireEffect.style.boxShadow = '0 0 20px #ff6600, 0 0 40px #ff3300';
    fireEffect.style.zIndex = '200';
    
    // 将火焰效果附加到NPC上
    const npcRect = target.getBoundingClientRect();
    const boundaryRect = boundary.getBoundingClientRect();
    fireEffect.style.left = (npcRect.left - boundaryRect.left + npcRect.width/2 - 30) + 'px';
    fireEffect.style.top = (npcRect.top - boundaryRect.top + npcRect.height/2 - 30) + 'px';
    
    boundary.appendChild(fireEffect);
    
    // 火焰动画效果
    let scale = 1;
    let opacity = 1;
    const fireInterval = setInterval(() => {
        scale = 0.8 + Math.random() * 0.4; // 随机缩放
        fireEffect.style.transform = `scale(${scale})`;
        fireEffect.style.opacity = opacity;
    }, 100);
    
    // 持续燃烧伤害
    let burnTicks = 0;
    const maxBurnTicks = 6; // 减少燃烧持续时间
    const burnInterval = setInterval(() => {
        burnTicks++;
        if (typeof damageNpc === 'function') {
            damageNpc(3); // 每tick造成3点伤害（降低）
        }
        
        // 创建火焰粒子效果
        createFireParticle(npcRect, boundaryRect);
        
        if (burnTicks >= maxBurnTicks) {
            clearInterval(burnInterval);
            clearInterval(fireInterval);
            if (fireEffect.parentNode === boundary) {
                boundary.removeChild(fireEffect);
            }
        }
    }, 500); // 增加伤害间隔，降低伤害频率
    
    // 6秒后自动移除火焰效果
    setTimeout(() => {
        clearInterval(burnInterval);
        clearInterval(fireInterval);
        if (fireEffect.parentNode === boundary) {
            boundary.removeChild(fireEffect);
        }
    }, 6000);
}

// 创建火焰粒子效果
function createFireParticle(npcRect, boundaryRect) {
    const particle = document.createElement('div');
    particle.style.position = 'absolute';
    particle.style.width = '4px';
    particle.style.height = '4px';
    particle.style.borderRadius = '50%';
    particle.style.background = '#ffaa00';
    particle.style.boxShadow = '0 0 8px #ffaa00';
    
    // 随机位置
    const x = npcRect.left - boundaryRect.left + Math.random() * npcRect.width;
    const y = npcRect.top - boundaryRect.top + Math.random() * npcRect.height;
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    
    boundary.appendChild(particle);
    
    // 粒子上升动画
    let particleY = y;
    const particleInterval = setInterval(() => {
        particleY -= 2;
        particle.style.top = particleY + 'px';
        particle.style.opacity = parseFloat(particle.style.opacity || 1) - 0.02;
        
        if (particleY < -10 || parseFloat(particle.style.opacity || 1) <= 0) {
            clearInterval(particleInterval);
            if (particle.parentNode === boundary) {
                boundary.removeChild(particle);
            }
        }
    }, 50);
}

// 冰元素效果：冰冻减速 + 冰霜特效
function applyIceEffect(target) {
    // 创建冰霜特效
    const iceEffect = document.createElement('div');
    iceEffect.classList.add('ice-effect');
    iceEffect.style.position = 'absolute';
    iceEffect.style.width = '80px';
    iceEffect.style.height = '80px';
    iceEffect.style.borderRadius = '50%';
    iceEffect.style.background = 'radial-gradient(circle, rgba(135,206,235,0.8), rgba(70,130,180,0.6), transparent)';
    iceEffect.style.border = '3px solid rgba(135,206,235,0.9)';
    iceEffect.style.boxShadow = '0 0 25px rgba(135,206,235,0.8), inset 0 0 15px rgba(255,255,255,0.3)';
    iceEffect.style.zIndex = '200';
    
    // 将冰霜效果附加到NPC上
    const npcRect = target.getBoundingClientRect();
    const boundaryRect = boundary.getBoundingClientRect();
    iceEffect.style.left = (npcRect.left - boundaryRect.left + npcRect.width/2 - 40) + 'px';
    iceEffect.style.top = (npcRect.top - boundaryRect.top + npcRect.height/2 - 40) + 'px';
    
    boundary.appendChild(iceEffect);
    
    // 冰霜扩散动画
    let scale = 0.5;
    let opacity = 1;
    const iceInterval = setInterval(() => {
        scale += 0.1;
        iceEffect.style.transform = `scale(${scale})`;
        
        if (scale >= 1.2) {
            clearInterval(iceInterval);
        }
    }, 100);
    
    // 冰冻减速效果：降低NPC移动和攻击速度
    if (typeof target.style !== 'undefined') {
        target.style.filter = 'hue-rotate(180deg) brightness(0.8)'; // 视觉上的冰冻效果
        target.classList.add('frozen'); // 添加冰冻状态标记
    }
    
    // 创建冰晶粒子
    for (let i = 0; i < 6; i++) {
        setTimeout(() => {
            createIceCrystal(npcRect, boundaryRect);
        }, i * 200);
    }
    
    // 6秒后移除冰冻效果
    setTimeout(() => {
        if (iceEffect.parentNode === boundary) {
            boundary.removeChild(iceEffect);
        }
        if (typeof target.style !== 'undefined') {
            target.style.filter = ''; // 恢复正常
        }
    }, 6000);
}

// 创建冰晶粒子
function createIceCrystal(npcRect, boundaryRect) {
    const crystal = document.createElement('div');
    crystal.style.position = 'absolute';
    crystal.style.width = '6px';
    crystal.style.height = '6px';
    crystal.style.background = 'linear-gradient(45deg, #87ceeb, #ffffff)';
    crystal.style.borderRadius = '2px';
    crystal.style.boxShadow = '0 0 8px #87ceeb';
    
    // 随机位置
    const x = npcRect.left - boundaryRect.left + Math.random() * npcRect.width;
    const y = npcRect.top - boundaryRect.top + Math.random() * npcRect.height;
    crystal.style.left = x + 'px';
    crystal.style.top = y + 'px';
    
    boundary.appendChild(crystal);
    
    // 冰晶闪烁动画
    let opacity = 1;
    const crystalInterval = setInterval(() => {
        opacity = opacity > 0.5 ? 0.3 : 1;
        crystal.style.opacity = opacity;
    }, 300);
    
    // 5秒后移除冰晶
    setTimeout(() => {
        clearInterval(crystalInterval);
        if (crystal.parentNode === boundary) {
            boundary.removeChild(crystal);
        }
    }, 5000);
}

// 雷元素效果：眩晕 + 雷电特效
function applyLightningEffect(target) {
    // 创建雷电眩晕特效
    const lightningEffect = document.createElement('div');
    lightningEffect.classList.add('lightning-effect');
    lightningEffect.style.position = 'absolute';
    lightningEffect.style.width = '100px';
    lightningEffect.style.height = '100px';
    lightningEffect.style.borderRadius = '50%';
    lightningEffect.style.background = 'radial-gradient(circle, rgba(255,255,0,0.8), rgba(255,215,0,0.6), transparent)';
    lightningEffect.style.border = '4px solid rgba(255,255,0,0.9)';
    lightningEffect.style.boxShadow = '0 0 30px rgba(255,255,0,0.8), inset 0 0 20px rgba(255,255,255,0.4)';
    lightningEffect.style.zIndex = '200';
    
    // 将雷电效果附加到NPC上
    const npcRect = target.getBoundingClientRect();
    const boundaryRect = boundary.getBoundingClientRect();
    lightningEffect.style.left = (npcRect.left - boundaryRect.left + npcRect.width/2 - 50) + 'px';
    lightningEffect.style.top = (npcRect.top - boundaryRect.top + npcRect.height/2 - 50) + 'px';
    
    boundary.appendChild(lightningEffect);
    
    // 雷电闪烁动画
    let opacity = 1;
    const lightningInterval = setInterval(() => {
        opacity = opacity > 0.6 ? 0.3 : 1;
        lightningEffect.style.opacity = opacity;
        lightningEffect.style.transform = `scale(${0.9 + Math.random() * 0.2})`;
    }, 150);
    
    // 创建雷电链效果
    for (let i = 0; i < 4; i++) {
        setTimeout(() => {
            createLightningChain(npcRect, boundaryRect);
        }, i * 300);
    }
    
    // 眩晕效果：暂时禁用NPC攻击
    if (typeof target.classList !== 'undefined') {
        target.classList.add('stunned');
        target.style.filter = 'brightness(1.5) saturate(1.5)'; // 视觉上的眩晕效果
    }
    
    // 4秒后移除眩晕效果
    setTimeout(() => {
        if (lightningEffect.parentNode === boundary) {
            boundary.removeChild(lightningEffect);
        }
        if (typeof target.classList !== 'undefined') {
            target.classList.remove('stunned');
        }
        if (typeof target.style !== 'undefined') {
            target.style.filter = ''; // 恢复正常
        }
        clearInterval(lightningInterval);
    }, 4000);
}

// 创建雷电链效果
function createLightningChain(npcRect, boundaryRect) {
    const chain = document.createElement('div');
    chain.style.position = 'absolute';
    chain.style.width = '3px';
    chain.style.height = '40px';
    chain.style.background = 'linear-gradient(to bottom, #ffff00, #ffaa00)';
    chain.style.boxShadow = '0 0 15px #ffff00';
    chain.style.borderRadius = '2px';
    
    // 随机位置
    const x = npcRect.left - boundaryRect.left + Math.random() * npcRect.width;
    const y = npcRect.top - boundaryRect.top + Math.random() * npcRect.height;
    chain.style.left = x + 'px';
    chain.style.top = y + 'px';
    
    boundary.appendChild(chain);
    
    // 雷电链闪烁动画
    let opacity = 1;
    const chainInterval = setInterval(() => {
        opacity = opacity > 0.7 ? 0.4 : 1;
        chain.style.opacity = opacity;
    }, 100);
    
    // 3秒后移除雷电链
    setTimeout(() => {
        clearInterval(chainInterval);
        if (chain.parentNode === boundary) {
            boundary.removeChild(chain);
        }
    }, 3000);
}

// 土元素效果：击退增强 + 岩石特效
function applyEarthEffect(target) {
    // 创建岩石击退特效
    const earthEffect = document.createElement('div');
    earthEffect.classList.add('earth-effect');
    earthEffect.style.position = 'absolute';
    earthEffect.style.width = '70px';
    earthEffect.style.height = '70px';
    earthEffect.style.borderRadius = '50%';
    earthEffect.style.background = 'radial-gradient(circle, rgba(139,69,19,0.8), rgba(160,82,45,0.6), transparent)';
    earthEffect.style.border = '3px solid rgba(139,69,19,0.9)';
    earthEffect.style.boxShadow = '0 0 25px rgba(139,69,19,0.8), inset 0 0 15px rgba(255,255,255,0.2)';
    earthEffect.style.zIndex = '200';
    
    // 将岩石效果附加到NPC上
    const npcRect = target.getBoundingClientRect();
    const boundaryRect = boundary.getBoundingClientRect();
    earthEffect.style.left = (npcRect.left - boundaryRect.left + npcRect.width/2 - 35) + 'px';
    earthEffect.style.top = (npcRect.top - boundaryRect.top + npcRect.height/2 - 35) + 'px';
    
    boundary.appendChild(earthEffect);
    
    // 岩石扩散动画
    let scale = 0.5;
    const earthInterval = setInterval(() => {
        scale += 0.1;
        earthEffect.style.transform = `scale(${scale})`;
        
        if (scale >= 1.1) {
            clearInterval(earthInterval);
        }
    }, 100);
    
    // 创建岩石碎片效果
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            createRockFragment(npcRect, boundaryRect);
        }, i * 150);
    }
    
    // 击退增强：对NPC造成额外击退
        if (typeof applyKnockback === 'function') {
        // 延迟执行击退，让玩家看到岩石特效
        setTimeout(() => {
            applyKnockback(target, 'right', 200, 250); // 增强击退距离和持续时间
        }, 200);
    }
    
    // 5秒后移除岩石效果
    setTimeout(() => {
        if (earthEffect.parentNode === boundary) {
            boundary.removeChild(earthEffect);
        }
    }, 5000);
}

// 创建岩石碎片效果
function createRockFragment(npcRect, boundaryRect) {
    const fragment = document.createElement('div');
    fragment.style.position = 'absolute';
    fragment.style.width = '8px';
    fragment.style.height = '8px';
    fragment.style.background = 'linear-gradient(45deg, #8b4513, #a0522d)';
    fragment.style.borderRadius = '2px';
    fragment.style.boxShadow = '0 0 8px rgba(139,69,19,0.8)';
    
    // 随机位置
    const x = npcRect.left - boundaryRect.left + Math.random() * npcRect.width;
    const y = npcRect.top - boundaryRect.top + Math.random() * npcRect.height;
    fragment.style.left = x + 'px';
    fragment.style.top = y + 'px';
    
    boundary.appendChild(fragment);
    
    // 岩石碎片飞散动画
    const dx = (Math.random() - 0.5) * 10;
    const dy = (Math.random() - 0.5) * 10;
    let fragmentX = x;
    let fragmentY = y;
    
    const fragmentInterval = setInterval(() => {
        fragmentX += dx;
        fragmentY += dy;
        fragment.style.left = fragmentX + 'px';
        fragment.style.top = fragmentY + 'px';
        fragment.style.opacity = parseFloat(fragment.style.opacity || 1) - 0.02;
        
        if (fragmentX < -20 || fragmentX > boundaryRect.width + 20 || 
            fragmentY < -20 || fragmentY > boundaryRect.height + 20 || 
            parseFloat(fragment.style.opacity || 1) <= 0) {
            clearInterval(fragmentInterval);
            if (fragment.parentNode === boundary) {
                boundary.removeChild(fragment);
            }
        }
    }, 50);
}



// 碰撞检测辅助函数
function isColliding(rect1, rect2) {
    return rect1.left < rect2.right &&
           rect1.right > rect2.left &&
           rect1.top < rect2.bottom &&
           rect1.bottom > rect2.top;
}

// 击退效果：将目标在短时间内沿方向位移一段距离（带边界限制）
function applyKnockback(targetElement, direction, forcePx, durationMs) {
    const force = typeof forcePx === 'number' ? forcePx : 100;
    const duration = typeof durationMs === 'number' ? durationMs : 160;
    const steps = Math.max(1, Math.floor(duration / 16));
    const boundaryRect = boundary.getBoundingClientRect();
    const elementRect = targetElement.getBoundingClientRect();

    const currentLeft = parseFloat(window.getComputedStyle(targetElement).left) || 0;
    const maxLeft = boundaryRect.width - elementRect.width;
    const rawTargetLeft = currentLeft + (direction === 'left' ? -force : force);
    const targetLeft = Math.max(0, Math.min(maxLeft, rawTargetLeft));
    const delta = (targetLeft - currentLeft) / steps;

    let tick = 0;
    const intervalId = setInterval(() => {
        tick++;
        const leftNow = parseFloat(window.getComputedStyle(targetElement).left) || 0;
        let nextLeft = leftNow + delta;
        // 边界夹取
        const nextClamped = Math.max(0, Math.min(maxLeft, nextLeft));
        targetElement.style.left = nextClamped + 'px';
        if (tick >= steps) {
            clearInterval(intervalId);
        }
    }, 16);
}