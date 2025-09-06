// 新建GAME/js/npc行为.js

// 实时更新NPC朝向函数
function updateNpcFacing() {
    const npcRect = npc.getBoundingClientRect();
    const characterRect = character.getBoundingClientRect();
    const npcCenterX = npcRect.left + npcRect.width / 2;
    const characterCenterX = characterRect.left + characterRect.width / 2;
    
    // 判断角色是否在NPC右侧
    const shouldFaceRight = characterCenterX >= npcCenterX;
    
    if (shouldFaceRight !== npcFacingRight) {
        npcFacingRight = shouldFaceRight;
        
        // 更新CSS类以切换壁虎图片
        if (npcFacingRight) {
            npc.classList.remove('facing-left');
            npc.classList.add('facing-right');
        } else {
            npc.classList.remove('facing-right');
            npc.classList.add('facing-left');
        }
    }
}

// NPC移动函数
function moveNpcHorizontal(dx) {
    const boundaryRect = boundary.getBoundingClientRect();
    let currentLeft = parseInt(window.getComputedStyle(npc).left) || 0;
    
    // 冰冻减速效果：如果NPC被冰冻，移动速度减半
    let actualDx = dx;
    if (npc.classList.contains('frozen')) {
        actualDx = dx * 0.5;
        console.log('NPC被冰冻，移动速度减半');
    }
    
    let newLeft = currentLeft + actualDx;

    // 限制在边界内
    if (newLeft < 0) newLeft = 0;
    if (newLeft > boundaryRect.width - 100) newLeft = boundaryRect.width - 100;

    npc.style.left = newLeft + 'px';
    
    // 更新朝向
    if (dx > 0) {
        npc.classList.remove('facing-left');
        npc.classList.add('facing-right');
        npcFacingRight = true;
    } else if (dx < 0) {
        npc.classList.remove('facing-right');
        npc.classList.add('facing-left');
        npcFacingRight = false;
    }
}

// NPC跳跃函数
function npcJump() {
    if (isNpcOnGround && !isNpcJumping) {
        isNpcJumping = true;
        isNpcOnGround = false;
        npcVerticalVelocity = jumpForce; // 使用与主角相同的跳跃力
        // 记录跳跃起始位置
        npcJumpStartY = parseInt(window.getComputedStyle(npc).top) || 0;
        npc.classList.add('jumping');
        npc.classList.remove('landing');
    }
}

// NPC跳跃高度限制
let npcMaxJumpHeight = 200; // NPC最大跳跃高度（像素）- 增加到200px以有效躲避子弹
let npcJumpStartY = 0; // NPC跳跃起始位置

// 规避冷却时间戳（毫秒）
let npcLastEvadeTime = 0;
// 空中小跳冷却
let npcLastHopTime = 0;

// 生成带速度的NPC子弹（含碰撞与边界处理）
function createNpcProjectile(vx, vy) {
    const npcRect = npc.getBoundingClientRect();
    const boundaryRect = boundary.getBoundingClientRect();
    const projectile = document.createElement('div');
    projectile.classList.add('projectile', 'npc-projectile', 'has-trail');
    if (npcFacingRight) {
        projectile.style.left = (npcRect.left - boundaryRect.left + npcRect.width) + 'px';
    } else {
        projectile.style.left = (npcRect.left - boundaryRect.left) + 'px';
    }
    projectile.style.top = (npcRect.top - boundaryRect.top + npcRect.height / 2) + 'px';
    boundary.appendChild(projectile);

    const intervalId = setInterval(() => {
        const currentLeft = parseInt(projectile.style.left);
        const currentTop = parseInt(projectile.style.top);
        const nextLeft = currentLeft + vx;
        const nextTop = currentTop + vy;
        projectile.style.left = nextLeft + 'px';
        projectile.style.top = nextTop + 'px';

        // NPC 子弹动态尾迹（青色）
        try {
            const dot = document.createElement('div');
            dot.className = 'trail-dot trail-cyan-dot';
            dot.style.left = nextLeft + 'px';
            dot.style.top = nextTop + 'px';
            boundary.appendChild(dot);
            setTimeout(() => { if (dot.parentNode === boundary) boundary.removeChild(dot); }, 480);
        } catch (e) {}

        const projectileRect = projectile.getBoundingClientRect();
        const characterRectNow = character.getBoundingClientRect();

        if (isColliding(projectileRect, characterRectNow)) {
            const feetOverlap = characterRectNow.bottom - projectileRect.top;
            if (!(isJumping && feetOverlap >= 0 && feetOverlap < 15)) {
                if (!isDefending) {
                    if (typeof damagePlayer === 'function') {
                        damagePlayer(10);
                    }
                    applyKnockback(character, vx > 0 ? 'right' : 'left', 100, 160);
                }
                clearInterval(intervalId);
                if (projectile.parentNode === boundary) boundary.removeChild(projectile);
                return;
            }
        }

        // 边界移除
        if (nextLeft < 0 || nextLeft > boundaryRect.width || nextTop < 0 || nextTop > boundaryRect.height) {
            clearInterval(intervalId);
            if (projectile.parentNode === boundary) boundary.removeChild(projectile);
            return;
        }
    }, 16);
}

// 近战攻击：近距离直接击退与伤害
function npcMeleeAttack() {
    if (isNpcAttacking) return;
    isNpcAttacking = true;
    npc.classList.add('attacking');

    const npcRect = npc.getBoundingClientRect();
    const characterRect = character.getBoundingClientRect();
    const npcCenterX = npcRect.left + npcRect.width / 2;
    const characterCenterX = characterRect.left + characterRect.width / 2;
    npcFacingRight = characterCenterX >= npcCenterX;
    if (npcFacingRight) { npc.classList.remove('facing-left'); npc.classList.add('facing-right'); }
    else { npc.classList.remove('facing-right'); npc.classList.add('facing-left'); }

    const horizontalDist = Math.abs(characterCenterX - npcCenterX);
    const verticalOverlap = Math.abs((npcRect.top + npcRect.height / 2) - (characterRect.top + characterRect.height / 2));
    if (horizontalDist < 90 && verticalOverlap < 80) {
        if (!isDefending) {
            if (typeof damagePlayer === 'function') damagePlayer(15);
            applyKnockback(character, npcFacingRight ? 'right' : 'left', 120, 180);
        }
    }

    // 冰冻减速效果：如果NPC被冰冻，攻击冷却时间延长
    let attackDuration = 250;
    if (npc.classList.contains('frozen')) {
        attackDuration = 500; // 冰冻状态下攻击冷却时间翻倍
        console.log('NPC被冰冻，攻击冷却时间延长');
    }

    setTimeout(() => {
        isNpcAttacking = false;
        npc.classList.remove('attacking');
    }, attackDuration);
}

// 远程直线攻击
function npcRangedAttack() {
    if (isNpcAttacking) return;
    isNpcAttacking = true;
    npc.classList.add('attacking');

    const npcRect = npc.getBoundingClientRect();
    const characterRect = character.getBoundingClientRect();
    const npcCenterX = npcRect.left + npcRect.width / 2;
    const characterCenterX = characterRect.left + characterRect.width / 2;
    npcFacingRight = characterCenterX >= npcCenterX;
    if (npcFacingRight) { npc.classList.remove('facing-left'); npc.classList.add('facing-right'); }
    else { npc.classList.remove('facing-right'); npc.classList.add('facing-left'); }

    const vx = npcFacingRight ? 10 : -10;
    createNpcProjectile(vx, 0);

    // 冰冻减速效果：如果NPC被冰冻，攻击冷却时间延长
    let attackDuration = 200;
    if (npc.classList.contains('frozen')) {
        attackDuration = 400; // 冰冻状态下攻击冷却时间翻倍
        console.log('NPC被冰冻，远程攻击冷却时间延长');
    }

    setTimeout(() => {
        isNpcAttacking = false;
        npc.classList.remove('attacking');
    }, attackDuration);
}

// 三连散射（上/中/下）
function npcBurstAttack() {
    if (isNpcAttacking) return;
    isNpcAttacking = true;
    npc.classList.add('attacking');

    const npcRect = npc.getBoundingClientRect();
    const characterRect = character.getBoundingClientRect();
    const npcCenterX = npcRect.left + npcRect.width / 2;
    const characterCenterX = characterRect.left + characterRect.width / 2;
    npcFacingRight = characterCenterX >= npcCenterX;
    if (npcFacingRight) { npc.classList.remove('facing-left'); npc.classList.add('facing-right'); }
    else { npc.classList.remove('facing-right'); npc.classList.add('facing-left'); }

    const baseVx = npcFacingRight ? 9 : -9;
    createNpcProjectile(baseVx, -2);
    setTimeout(() => createNpcProjectile(baseVx, 0), 60);
    setTimeout(() => createNpcProjectile(baseVx, 2), 120);

    // 冰冻减速效果：如果NPC被冰冻，攻击冷却时间延长
    let attackDuration = 260;
    if (npc.classList.contains('frozen')) {
        attackDuration = 520; // 冰冻状态下攻击冷却时间翻倍
        console.log('NPC被冰冻，三连散射冷却时间延长');
    }

    setTimeout(() => {
        isNpcAttacking = false;
        npc.classList.remove('attacking');
    }, attackDuration);
}

// 之字形能量弹（水平移动 + 竖直摆动）
function npcZigzagAttack() {
    if (isNpcAttacking) return;
    isNpcAttacking = true;
    npc.classList.add('attacking');

    const npcRect = npc.getBoundingClientRect();
    const characterRect = character.getBoundingClientRect();
    const npcCenterX = npcRect.left + npcRect.width / 2;
    const characterCenterX = characterRect.left + characterRect.width / 2;
    npcFacingRight = characterCenterX >= npcCenterX;
    if (npcFacingRight) { npc.classList.remove('facing-left'); npc.classList.add('facing-right'); }
    else { npc.classList.remove('facing-right'); npc.classList.add('facing-left'); }

    const vx = npcFacingRight ? 8 : -8;
    const boundaryRect = boundary.getBoundingClientRect();
    const projectile = document.createElement('div');
    projectile.classList.add('projectile', 'npc-projectile', 'has-trail');
    projectile.style.left = (npcFacingRight ? (npcRect.left - boundaryRect.left + npcRect.width) : (npcRect.left - boundaryRect.left)) + 'px';
    projectile.style.top = (npcRect.top - boundaryRect.top + npcRect.height / 2) + 'px';
    boundary.appendChild(projectile);

    let t = 0; // 时间步，控制上下摆动
    const intervalId = setInterval(() => {
        t += 0.15;
        const currentLeft = parseInt(projectile.style.left);
        const baseTop = parseInt(projectile.style.top);
        const nextLeft = currentLeft + vx;
        const nextTop = baseTop + Math.round(Math.sin(t) * 6);
        projectile.style.left = nextLeft + 'px';
        projectile.style.top = nextTop + 'px';

        // NPC 之字形尾迹
        try {
            const dot = document.createElement('div');
            dot.className = 'trail-dot trail-cyan-dot';
            dot.style.left = nextLeft + 'px';
            dot.style.top = nextTop + 'px';
            boundary.appendChild(dot);
            setTimeout(() => { if (dot.parentNode === boundary) boundary.removeChild(dot); }, 480);
        } catch (e) {}

        const projectileRect = projectile.getBoundingClientRect();
        const characterRectNow = character.getBoundingClientRect();
        if (isColliding(projectileRect, characterRectNow)) {
            const feetOverlap = characterRectNow.bottom - projectileRect.top;
            if (!(isJumping && feetOverlap >= 0 && feetOverlap < 15)) {
                if (!isDefending) {
                    if (typeof damagePlayer === 'function') damagePlayer(12);
                    applyKnockback(character, vx > 0 ? 'right' : 'left', 110, 170);
                }
                clearInterval(intervalId);
                if (projectile.parentNode === boundary) boundary.removeChild(projectile);
                return;
            }
        }

        if (nextLeft < 0 || nextLeft > boundaryRect.width || nextTop < 0 || nextTop > boundaryRect.height) {
            clearInterval(intervalId);
            if (projectile.parentNode === boundary) boundary.removeChild(projectile);
            return;
        }
    }, 16);

    setTimeout(() => {
        isNpcAttacking = false;
        npc.classList.remove('attacking');
    }, 320);
}

// 追踪弹攻击：子弹会追踪主角位置
function npcTrackingAttack() {
    if (isNpcAttacking) return;
    isNpcAttacking = true;
    npc.classList.add('attacking');

    const npcRect = npc.getBoundingClientRect();
    const characterRect = character.getBoundingClientRect();
    const npcCenterX = npcRect.left + npcRect.width / 2;
    const characterCenterX = characterRect.left + characterRect.width / 2;
    npcFacingRight = characterCenterX >= npcCenterX;
    if (npcFacingRight) { npc.classList.remove('facing-left'); npc.classList.add('facing-right'); }
    else { npc.classList.remove('facing-right'); npc.classList.add('facing-left'); }

    const boundaryRect = boundary.getBoundingClientRect();
    const projectile = document.createElement('div');
    projectile.classList.add('projectile', 'npc-projectile', 'has-trail', 'projectile--tracking');
    projectile.style.left = (npcFacingRight ? (npcRect.left - boundaryRect.left + npcRect.width) : (npcRect.left - boundaryRect.left)) + 'px';
    projectile.style.top = (npcRect.top - boundaryRect.top + npcRect.height / 2) + 'px';
    boundary.appendChild(projectile);

    const intervalId = setInterval(() => {
        const currentLeft = parseInt(projectile.style.left);
        const currentTop = parseInt(projectile.style.top);
        
        // 获取主角当前位置
        const characterRectNow = character.getBoundingClientRect();
        const targetX = characterRectNow.left - boundaryRect.left + characterRectNow.width / 2;
        const targetY = characterRectNow.top - boundaryRect.top + characterRectNow.height / 2;
        
        // 计算追踪方向
        const dx = targetX - currentLeft;
        const dy = targetY - currentTop;
        const distance = Math.max(1, Math.hypot(dx, dy));
        const speed = 6;
        
        const nextLeft = currentLeft + (dx / distance) * speed;
        const nextTop = currentTop + (dy / distance) * speed;
        
        projectile.style.left = nextLeft + 'px';
        projectile.style.top = nextTop + 'px';

        // 追踪弹尾迹（红色）
        try {
            const dot = document.createElement('div');
            dot.className = 'trail-dot trail-red-dot';
            dot.style.left = nextLeft + 'px';
            dot.style.top = nextTop + 'px';
            boundary.appendChild(dot);
            setTimeout(() => { if (dot.parentNode === boundary) boundary.removeChild(dot); }, 600);
        } catch (e) {}

        const projectileRect = projectile.getBoundingClientRect();
        if (isColliding(projectileRect, characterRectNow)) {
            const feetOverlap = characterRectNow.bottom - projectileRect.top;
            if (!(isJumping && feetOverlap >= 0 && feetOverlap < 15)) {
                if (!isDefending) {
                    if (typeof damagePlayer === 'function') damagePlayer(18);
                    applyKnockback(character, dx > 0 ? 'right' : 'left', 130, 190);
                }
                clearInterval(intervalId);
                if (projectile.parentNode === boundary) boundary.removeChild(projectile);
                return;
            }
        }

        if (nextLeft < 0 || nextLeft > boundaryRect.width || nextTop < 0 || nextTop > boundaryRect.height) {
            clearInterval(intervalId);
            if (projectile.parentNode === boundary) boundary.removeChild(projectile);
            return;
        }
    }, 16);

    setTimeout(() => {
        isNpcAttacking = false;
        npc.classList.remove('attacking');
    }, 400);
}

// 多重弹幕攻击：发射多个子弹形成弹幕
function npcBarrageAttack() {
    if (isNpcAttacking) return;
    isNpcAttacking = true;
    npc.classList.add('attacking');

    const npcRect = npc.getBoundingClientRect();
    const characterRect = character.getBoundingClientRect();
    const npcCenterX = npcRect.left + npcRect.width / 2;
    const characterCenterX = characterRect.left + characterRect.width / 2;
    npcFacingRight = characterCenterX >= npcCenterX;
    if (npcFacingRight) { npc.classList.remove('facing-left'); npc.classList.add('facing-right'); }
    else { npc.classList.remove('facing-right'); npc.classList.add('facing-left'); }

    const boundaryRect = boundary.getBoundingClientRect();
    const baseVx = npcFacingRight ? 7 : -7;
    
    // 发射多个子弹
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            const projectile = document.createElement('div');
            projectile.classList.add('projectile', 'npc-projectile', 'has-trail', 'projectile--barrage');
            projectile.style.left = (npcFacingRight ? (npcRect.left - boundaryRect.left + npcRect.width) : (npcRect.left - boundaryRect.left)) + 'px';
            projectile.style.top = (npcRect.top - boundaryRect.top + npcRect.height / 2 + (i - 2) * 15) + 'px';
            boundary.appendChild(projectile);

            const intervalId = setInterval(() => {
                const currentLeft = parseInt(projectile.style.left);
                const currentTop = parseInt(projectile.style.top);
                const nextLeft = currentLeft + baseVx;
                const nextTop = currentTop + (i - 2) * 0.5; // 轻微垂直移动
                
                projectile.style.left = nextLeft + 'px';
                projectile.style.top = nextTop + 'px';

                // 弹幕尾迹（黄色）
                try {
                    const dot = document.createElement('div');
                    dot.className = 'trail-dot trail-yellow-dot';
                    dot.style.left = nextLeft + 'px';
                    dot.style.top = nextTop + 'px';
                    boundary.appendChild(dot);
                    setTimeout(() => { if (dot.parentNode === boundary) boundary.removeChild(dot); }, 400);
                } catch (e) {}

                const projectileRect = projectile.getBoundingClientRect();
                const characterRectNow = character.getBoundingClientRect();
                if (isColliding(projectileRect, characterRectNow)) {
                    const feetOverlap = characterRectNow.bottom - projectileRect.top;
                    if (!(isJumping && feetOverlap >= 0 && feetOverlap < 15)) {
                        if (!isDefending) {
                            if (typeof damagePlayer === 'function') damagePlayer(8);
                            applyKnockback(character, baseVx > 0 ? 'right' : 'left', 90, 150);
                        }
                        clearInterval(intervalId);
                        if (projectile.parentNode === boundary) boundary.removeChild(projectile);
                        return;
                    }
                }

                if (nextLeft < 0 || nextLeft > boundaryRect.width || nextTop < 0 || nextTop > boundaryRect.height) {
                    clearInterval(intervalId);
                    if (projectile.parentNode === boundary) boundary.removeChild(projectile);
                    return;
                }
            }, 16);
        }, i * 80); // 每80ms发射一颗
    }

    setTimeout(() => {
        isNpcAttacking = false;
        npc.classList.remove('attacking');
    }, 600);
}

// 爆炸攻击：发射会爆炸的子弹，爆炸时造成范围伤害
function npcExplosiveAttack() {
    if (isNpcAttacking) return;
    isNpcAttacking = true;
    npc.classList.add('attacking');

    const npcRect = npc.getBoundingClientRect();
    const characterRect = character.getBoundingClientRect();
    const npcCenterX = npcRect.left + npcRect.width / 2;
    const characterCenterX = characterRect.left + characterRect.width / 2;
    npcFacingRight = characterCenterX >= npcCenterX;
    if (npcFacingRight) { npc.classList.remove('facing-left'); npc.classList.add('facing-right'); }
    else { npc.classList.remove('facing-right'); npc.classList.add('facing-left'); }

    const boundaryRect = boundary.getBoundingClientRect();
    const projectile = document.createElement('div');
    projectile.classList.add('projectile', 'npc-projectile', 'has-trail', 'projectile--explosive');
    projectile.style.width = '20px';
    projectile.style.height = '20px';
    projectile.style.borderRadius = '50%';
    projectile.style.left = (npcFacingRight ? (npcRect.left - boundaryRect.left + npcRect.width) : (npcRect.left - boundaryRect.left)) + 'px';
    projectile.style.top = (npcRect.top - boundaryRect.top + npcRect.height / 2) + 'px';
    boundary.appendChild(projectile);

    const vx = npcFacingRight ? 6 : -6;
    const intervalId = setInterval(() => {
        const currentLeft = parseInt(projectile.style.left);
        const currentTop = parseInt(projectile.style.top);
        const nextLeft = currentLeft + vx;
        
        projectile.style.left = nextLeft + 'px';

        // 爆炸弹尾迹（橙色）
        try {
            const dot = document.createElement('div');
            dot.className = 'trail-dot trail-orange-dot';
            dot.style.left = nextLeft + 'px';
            dot.style.top = currentTop + 'px';
            boundary.appendChild(dot);
            setTimeout(() => { if (dot.parentNode === boundary) boundary.removeChild(dot); }, 500);
        } catch (e) {}

        const projectileRect = projectile.getBoundingClientRect();
        const characterRectNow = character.getBoundingClientRect();
        if (isColliding(projectileRect, characterRectNow)) {
            // 爆炸效果
            createExplosion(nextLeft, currentTop);
            if (!isDefending) {
                if (typeof damagePlayer === 'function') damagePlayer(25);
                applyKnockback(character, vx > 0 ? 'right' : 'left', 150, 220);
            }
            clearInterval(intervalId);
            if (projectile.parentNode === boundary) boundary.removeChild(projectile);
            return;
        }

        if (nextLeft < 0 || nextLeft > boundaryRect.width) {
            clearInterval(intervalId);
            if (projectile.parentNode === boundary) boundary.removeChild(projectile);
            return;
        }
    }, 16);

    setTimeout(() => {
        isNpcAttacking = false;
        npc.classList.remove('attacking');
    }, 500);
}

// 激光攻击：发射直线激光
function npcLaserAttack() {
    if (isNpcAttacking) return;
    isNpcAttacking = true;
    npc.classList.add('attacking');

    // 直接发射激光，无预警
    const laser = document.createElement('div');
    laser.classList.add('projectile', 'npc-projectile', 'projectile--laser');
    laser.style.width = '10px';
    laser.style.height = '120px';
    laser.style.background = 'linear-gradient(to bottom, #ff0000, #ff4444, #ff0000)';
    laser.style.boxShadow = '0 0 25px #ff0000, 0 0 50px #ff0000, 0 0 75px #ff0000';
    laser.style.position = 'absolute';
    laser.style.left = (npcLeft + 50) + 'px';
    laser.style.top = (npcTop + 40) + 'px';
    laser.style.zIndex = '1000';
    boundary.appendChild(laser);

    // 激光持续伤害
    let damageTicks = 0;
    const maxDamageTicks = 10;
    const damageInterval = setInterval(() => {
        damageTicks++;
        
        // 检测与玩家的碰撞
        if (isColliding(laser, character)) {
            if (!isDefending) {
                if (typeof damagePlayer === 'function') damagePlayer(1);
                if (typeof applyKnockback === 'function') {
                    applyKnockback(character, 15, isFacingLeft ? 1 : -1);
                }
            }
        }
        
        if (damageTicks >= maxDamageTicks) {
            clearInterval(damageInterval);
        }
    }, 100);

    // 激光持续时间：1秒
    setTimeout(() => {
        clearInterval(damageInterval);
        if (laser.parentNode === boundary) boundary.removeChild(laser);
    }, 1000);

    // 攻击结束
    setTimeout(() => {
        isNpcAttacking = false;
        npc.classList.remove('attacking');
    }, 1000);
}

// 创建爆炸效果
function createExplosion(x, y) {
    const explosion = document.createElement('div');
    explosion.classList.add('explosion');
    explosion.style.position = 'absolute';
    explosion.style.left = x + 'px';
    explosion.style.top = y + 'px';
    explosion.style.width = '60px';
    explosion.style.height = '60px';
    explosion.style.borderRadius = '50%';
    explosion.style.background = 'radial-gradient(circle, #ff6600, #ff3300, #ff0000)';
    explosion.style.boxShadow = '0 0 20px #ff6600';
    explosion.style.animation = 'explosion-animation 0.6s ease-out forwards';
    boundary.appendChild(explosion);

    // 爆炸粒子效果
    for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        particle.classList.add('explosion-particle');
        particle.style.position = 'absolute';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.width = '4px';
        particle.style.height = '4px';
        particle.style.background = '#ffaa00';
        particle.style.borderRadius = '50%';
        particle.style.animation = `particle-animation-${i} 0.8s ease-out forwards`;
        boundary.appendChild(particle);
        
        setTimeout(() => {
            if (particle.parentNode === boundary) boundary.removeChild(particle);
        }, 800);
    }

    setTimeout(() => {
        if (explosion.parentNode === boundary) boundary.removeChild(explosion);
    }, 600);
}

// ========== 新增NPC攻击形态 ==========

// 时间炸弹攻击：发射会延迟爆炸的炸弹
function npcTimeBombAttack() {
    if (isNpcAttacking) return;
    isNpcAttacking = true;
    npc.classList.add('attacking');

    const npcRect = npc.getBoundingClientRect();
    const characterRect = character.getBoundingClientRect();
    const npcCenterX = npcRect.left + npcRect.width / 2;
    const characterCenterX = characterRect.left + characterRect.width / 2;
    npcFacingRight = characterCenterX >= npcCenterX;
    if (npcFacingRight) { npc.classList.remove('facing-left'); npc.classList.add('facing-right'); }
    else { npc.classList.remove('facing-right'); npc.classList.add('facing-left'); }

    const boundaryRect = boundary.getBoundingClientRect();
    const bomb = document.createElement('div');
    bomb.classList.add('projectile', 'npc-projectile', 'projectile--timebomb');
    bomb.style.width = '16px';
    bomb.style.height = '16px';
    bomb.style.borderRadius = '50%';
    bomb.style.background = 'radial-gradient(circle, #8e44ad, #9b59b6)';
    bomb.style.border = '2px solid #2c3e50';
    bomb.style.boxShadow = '0 0 10px #8e44ad';
    
    // 设置炸弹位置
    if (npcFacingRight) {
        bomb.style.left = (npcRect.left - boundaryRect.left + npcRect.width) + 'px';
    } else {
        bomb.style.left = (npcRect.left - boundaryRect.left) + 'px';
    }
    bomb.style.top = (npcRect.top - boundaryRect.top + npcRect.height / 2) + 'px';
    
    boundary.appendChild(bomb);

    // 时间炸弹移动
    const vx = npcFacingRight ? 8 : -8;
    const vy = -3; // 轻微向上
    let currentLeft = parseInt(bomb.style.left);
    let currentTop = parseInt(bomb.style.top);
    
    const moveInterval = setInterval(() => {
        currentLeft += vx;
        currentTop += vy;
        vy += 0.2; // 重力
        
        bomb.style.left = currentLeft + 'px';
        bomb.style.top = currentTop + 'px';
        
        // 时间炸弹闪烁效果
        bomb.style.opacity = Math.random() > 0.5 ? '1' : '0.7';
        
        // 边界检查
        if (currentLeft < 0 || currentLeft > boundaryRect.width || currentTop > boundaryRect.height) {
            clearInterval(moveInterval);
            if (bomb.parentNode === boundary) boundary.removeChild(bomb);
            return;
        }
    }, 16);
    
    // 3秒后爆炸
    setTimeout(() => {
        if (bomb.parentNode === boundary) {
            // 创建大范围爆炸
            createTimeBombExplosion(currentLeft, currentTop);
            
            // 检测范围内的玩家
            const bombRect = bomb.getBoundingClientRect();
            const playerRect = character.getBoundingClientRect();
            const distance = Math.hypot(
                bombRect.left + bombRect.width/2 - (playerRect.left + playerRect.width/2),
                bombRect.top + bombRect.height/2 - (playerRect.top + playerRect.height/2)
            );
            
            if (distance < 100) { // 爆炸范围100px
                if (!isDefending) {
                    if (typeof damagePlayer === 'function') damagePlayer(30);
                    applyKnockback(character, currentLeft > playerRect.left ? 'right' : 'left', 200, 250);
                }
            }
            
            boundary.removeChild(bomb);
        }
    }, 3000);
    
    setTimeout(() => {
        isNpcAttacking = false;
        npc.classList.remove('attacking');
    }, 800);
}

// 创建时间炸弹爆炸效果
function createTimeBombExplosion(x, y) {
    const explosion = document.createElement('div');
    explosion.classList.add('time-bomb-explosion');
    explosion.style.position = 'absolute';
    explosion.style.left = (x - 50) + 'px';
    explosion.style.top = (y - 50) + 'px';
    explosion.style.width = '100px';
    explosion.style.height = '100px';
    explosion.style.borderRadius = '50%';
    explosion.style.background = 'radial-gradient(circle, #8e44ad, #9b59b6, #2c3e50)';
    explosion.style.boxShadow = '0 0 30px #8e44ad';
    explosion.style.zIndex = '200';
    
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

// 黑洞攻击：创建吸引玩家的黑洞
let lastBlackHoleTime = 0; // 黑洞攻击冷却时间
let isPlayerInBlackHole = false; // 全局黑洞状态标记
function npcBlackHoleAttack() {
    const now = Date.now();
    if (isNpcAttacking) return;
    
    // 黑洞攻击冷却时间：5秒
    if (now - lastBlackHoleTime < 5000) {
        console.log('黑洞攻击冷却中');
        return;
    }
    
    isNpcAttacking = true;
    npc.classList.add('attacking');
    lastBlackHoleTime = now;

    const npcRect = npc.getBoundingClientRect();
    const characterRect = character.getBoundingClientRect();
    const npcCenterX = npcRect.left + npcRect.width / 2;
    const characterCenterX = characterRect.left + characterRect.width / 2;
    npcFacingRight = characterCenterX >= npcCenterX;
    
    const boundaryRect = boundary.getBoundingClientRect();
    
    // 在玩家附近创建黑洞
    const blackHoleX = characterCenterX - boundaryRect.left;
    const blackHoleY = characterRect.top - boundaryRect.top + characterRect.height / 2;
    
    const blackHole = document.createElement('div');
    blackHole.classList.add('black-hole');
    blackHole.style.position = 'absolute';
    blackHole.style.left = (blackHoleX - 30) + 'px';
    blackHole.style.top = (blackHoleY - 30) + 'px';
    blackHole.style.width = '60px';
    blackHole.style.height = '60px';
    blackHole.style.borderRadius = '50%';
    blackHole.style.background = 'radial-gradient(circle, #000000, #2c3e50, #34495e)';
    blackHole.style.boxShadow = '0 0 20px #000000, inset 0 0 20px #2c3e50';
    blackHole.style.zIndex = '150';
    
    boundary.appendChild(blackHole);
    
    // 黑洞旋转动画
    let rotation = 0;
    const rotationInterval = setInterval(() => {
        rotation += 10;
        blackHole.style.transform = `rotate(${rotation}deg)`;
    }, 50);
    
    // 黑洞吸引效果
    let attractTicks = 0;
    const maxAttractTicks = 20;
    let isPlayerAffected = false; // 标记玩家是否被黑洞影响
    
    const attractInterval = setInterval(() => {
        attractTicks++;
        
        // 计算玩家到黑洞的距离
        const playerRect = character.getBoundingClientRect();
        const holeRect = blackHole.getBoundingClientRect();
        const dx = (holeRect.left + holeRect.width/2) - (playerRect.left + playerRect.width/2);
        const dy = (holeRect.top + holeRect.height/2) - (playerRect.top + playerRect.height/2);
        const distance = Math.hypot(dx, dy);
        
        if (distance < 150 && distance > 10) { // 吸引范围150px，最小距离10px
            isPlayerAffected = true;
            isPlayerInBlackHole = true; // 设置全局黑洞状态
            
            // 计算吸引力度
            const force = Math.min(6, 150 / distance); // 减少吸引力度，避免过度干扰
            const moveX = (dx / distance) * force;
            const moveY = (dy / distance) * force;
            
            // 使用moveHorizontal函数进行水平移动，保持与重力系统的兼容性
            if (Math.abs(moveX) > 1) {
                moveHorizontal(moveX);
            }
            
            // 对于垂直移动，我们使用一个更安全的方法
            // 不直接修改style.top，而是通过调整垂直速度
            if (typeof verticalVelocity !== 'undefined') {
                // 轻微调整垂直速度，让重力系统自然处理
                verticalVelocity += moveY * 0.05; // 进一步减少干扰
                // 限制垂直速度，避免过度干扰
                verticalVelocity = Math.max(-12, Math.min(12, verticalVelocity));
                
                // 如果玩家被黑洞影响，确保跳跃状态正确
                if (typeof isJumping !== 'undefined' && !isJumping) {
                    isJumping = true;
                    isOnGround = false;
                }
                
                // 确保垂直速度不会过度干扰重力系统
                if (Math.abs(verticalVelocity) > 10) {
                    verticalVelocity = verticalVelocity > 0 ? 10 : -10;
                }
            }
            
            // 黑洞伤害
            if (attractTicks % 5 === 0 && !isDefending) {
                if (typeof damagePlayer === 'function') damagePlayer(5);
            }
        } else {
            isPlayerAffected = false;
        }
        
        if (attractTicks >= maxAttractTicks) {
            clearInterval(attractInterval);
            clearInterval(rotationInterval);
            
            // 黑洞效果结束后，确保玩家状态正常
            if (isPlayerAffected) {
                // 重置玩家的异常状态
                resetPlayerStateAfterBlackHole();
                
                // 显示黑洞效果结束提示
                showBlackHoleEndEffect();
                
                // 清除全局黑洞状态
                isPlayerInBlackHole = false;
            }
            
            if (blackHole.parentNode === boundary) boundary.removeChild(blackHole);
        }
    }, 100);
    
    setTimeout(() => {
        isNpcAttacking = false;
        npc.classList.remove('attacking');
    }, 2000);
}

// 黑洞效果结束后重置玩家状态
function resetPlayerStateAfterBlackHole() {
    // 强制重置玩家状态，确保能正确落地
    if (typeof isJumping !== 'undefined') {
        isJumping = true;
        isOnGround = false;
    }
    
    // 重置垂直速度，让重力系统自然处理
    if (typeof verticalVelocity !== 'undefined') {
        // 设置一个向下的速度，确保开始下落
        verticalVelocity = Math.max(0.5, Math.min(verticalVelocity, 5));
    }
    
    // 确保角色可见
    if (character) {
        character.style.display = 'block';
    }
    
    // 强制触发重力系统检查
    if (typeof applyGravity === 'function') {
        // 延迟一帧后强制应用重力，确保状态同步
        setTimeout(() => {
            if (typeof applyGravity === 'function') {
                applyGravity();
            }
        }, 16);
    }
    
    // 添加额外的安全检查，确保主角不会卡在空中
    setTimeout(() => {
        if (character && typeof getGroundPosition === 'function') {
            const currentTop = parseInt(window.getComputedStyle(character).top) || 0;
            const groundY = getGroundPosition();
            
            // 如果主角位置异常，强制重置到地面
            if (currentTop > groundY + 500 || currentTop < -500) {
                console.warn('黑洞效果后主角位置异常，强制重置到地面');
                character.style.top = groundY + 'px';
                if (typeof verticalVelocity !== 'undefined') {
                    verticalVelocity = 0;
                }
                if (typeof isJumping !== 'undefined') {
                    isJumping = false;
                    isOnGround = true;
                }
            }
        }
    }, 100);
    
    console.log('黑洞效果结束，玩家状态已重置，重力系统已激活');
}

// 显示黑洞效果结束的视觉提示
function showBlackHoleEndEffect() {
    if (!character) return;
    
    // 创建效果结束提示
    const endEffect = document.createElement('div');
    endEffect.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: #ffffff;
        font-size: 24px;
        font-weight: bold;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
        z-index: 1000;
        pointer-events: none;
        animation: fadeOutUp 1s ease-out forwards;
    `;
    endEffect.textContent = '黑洞效果结束';
    
    // 添加到body
    document.body.appendChild(endEffect);
    
    // 添加动画样式
    if (!document.getElementById('blackhole-end-animation')) {
        const style = document.createElement('style');
        style.id = 'blackhole-end-animation';
        style.textContent = `
            @keyframes fadeOutUp {
                0% { opacity: 1; transform: translate(-50%, -50%); }
                100% { opacity: 0; transform: translate(-50%, -100%); }
            }
        `;
        document.head.appendChild(style);
    }
    
    // 1秒后移除提示
    setTimeout(() => {
        if (endEffect.parentNode) {
            endEffect.parentNode.removeChild(endEffect);
        }
    }, 1000);
}

// 闪电链攻击：发射会跳跃的闪电
function npcChainLightningAttack() {
    if (isNpcAttacking) return;
    isNpcAttacking = true;
    npc.classList.add('attacking');

    const npcRect = npc.getBoundingClientRect();
    const characterRect = character.getBoundingClientRect();
    const npcCenterX = npcRect.left + npcRect.width / 2;
    const characterCenterX = characterRect.left + characterRect.width / 2;
    npcFacingRight = characterCenterX >= npcCenterX;
    
    const boundaryRect = boundary.getBoundingClientRect();
    
    // 创建闪电
    const lightning = document.createElement('div');
    lightning.classList.add('chain-lightning');
    lightning.style.position = 'absolute';
    lightning.style.width = '6px';
    lightning.style.height = '6px';
    lightning.style.borderRadius = '50%';
    lightning.style.background = '#ffff00';
    lightning.style.boxShadow = '0 0 15px #ffff00';
    
    // 设置闪电初始位置
    if (npcFacingRight) {
        lightning.style.left = (npcRect.left - boundaryRect.left + npcRect.width) + 'px';
    } else {
        lightning.style.left = (npcRect.left - boundaryRect.left) + 'px';
    }
    lightning.style.top = (npcRect.top - boundaryRect.top + npcRect.height / 2) + 'px';
    
    boundary.appendChild(lightning);
    
    // 闪电链跳跃逻辑
    let currentTarget = character;
    let jumpCount = 0;
    const maxJumps = 3;
    
    const lightningInterval = setInterval(() => {
        if (jumpCount >= maxJumps) {
            clearInterval(lightningInterval);
            if (lightning.parentNode === boundary) boundary.removeChild(lightning);
            return;
        }
        
        // 获取当前目标位置
        const targetRect = currentTarget.getBoundingClientRect();
        const lightningRect = lightning.getBoundingClientRect();
        
        // 移动到目标
        lightning.style.left = (targetRect.left - boundaryRect.left + targetRect.width/2) + 'px';
        lightning.style.top = (targetRect.top - boundaryRect.top + targetRect.height/2) + 'px';
        
        // 造成伤害
        if (currentTarget === character && !isDefending) {
            if (typeof damagePlayer === 'function') damagePlayer(15);
            applyKnockback(character, npcFacingRight ? 'right' : 'left', 100, 150);
        }
        
        // 创建闪电连接线
        createLightningConnection(lightningRect, targetRect, boundaryRect);
        
        jumpCount++;
        
        // 寻找下一个目标（这里简化为随机位置）
        if (jumpCount < maxJumps) {
            const randomX = Math.random() * boundaryRect.width;
            const randomY = Math.random() * boundaryRect.height;
            lightning.style.left = randomX + 'px';
            lightning.style.top = randomY + 'px';
        }
    }, 300);
    
    setTimeout(() => {
        isNpcAttacking = false;
        npc.classList.remove('attacking');
    }, 1200);
}

// 创建闪电连接线
function createLightningConnection(fromRect, toRect, boundaryRect) {
    const connection = document.createElement('div');
    connection.classList.add('lightning-connection');
    connection.style.position = 'absolute';
    connection.style.height = '3px';
    connection.style.background = 'linear-gradient(to right, #ffff00, #ffaa00)';
    connection.style.boxShadow = '0 0 10px #ffff00';
    
    // 计算连接线位置和角度
    const fromX = fromRect.left - boundaryRect.left + fromRect.width/2;
    const fromY = fromRect.top - boundaryRect.top + fromRect.height/2;
    const toX = toRect.left - boundaryRect.left + toRect.width/2;
    const toY = toRect.top - boundaryRect.top + toRect.height/2;
    
    const length = Math.hypot(toX - fromX, toY - fromY);
    const angle = Math.atan2(toY - fromY, toX - fromX) * 180 / Math.PI;
    
    connection.style.left = fromX + 'px';
    connection.style.top = fromY + 'px';
    connection.style.width = length + 'px';
    connection.style.transform = `rotate(${angle}deg)`;
    connection.style.transformOrigin = '0 50%';
    
    boundary.appendChild(connection);
    
    // 闪电连接线消失
    setTimeout(() => {
        if (connection.parentNode === boundary) boundary.removeChild(connection);
    }, 200);
}

// 冰霜新星攻击：释放冰冻冲击波
function npcFrostNovaAttack() {
    if (isNpcAttacking) return;
    isNpcAttacking = true;
    npc.classList.add('attacking');

    const npcRect = npc.getBoundingClientRect();
    const boundaryRect = boundary.getBoundingClientRect();
    
    // 创建冰霜新星
    const frostNova = document.createElement('div');
    frostNova.classList.add('frost-nova');
    frostNova.style.position = 'absolute';
    frostNova.style.left = (npcRect.left - boundaryRect.left - 50) + 'px';
    frostNova.style.top = (npcRect.top - boundaryRect.top - 50) + 'px';
    frostNova.style.width = (npcRect.width + 100) + 'px';
    frostNova.style.height = (npcRect.height + 100) + 'px';
    frostNova.style.borderRadius = '50%';
    frostNova.style.background = 'radial-gradient(circle, rgba(173,216,230,0.8), rgba(135,206,235,0.4), transparent)';
    frostNova.style.border = '3px solid rgba(135,206,235,0.8)';
    frostNova.style.boxShadow = '0 0 30px rgba(135,206,235,0.6)';
    frostNova.style.zIndex = '100';
    
    boundary.appendChild(frostNova);
    
    // 冰霜新星扩散动画
    let scale = 0.5;
    let opacity = 1;
    const novaInterval = setInterval(() => {
        scale += 0.1;
        opacity -= 0.03;
        frostNova.style.transform = `scale(${scale})`;
        frostNova.style.opacity = opacity;
        
        if (scale >= 2.5 || opacity <= 0) {
            clearInterval(novaInterval);
            if (frostNova.parentNode === boundary) boundary.removeChild(frostNova);
        }
    }, 50);
    
    // 检测范围内的玩家
    const playerRect = character.getBoundingClientRect();
    const novaRect = frostNova.getBoundingClientRect();
    
    if (isColliding(novaRect, playerRect)) {
        if (!isDefending) {
            if (typeof damagePlayer === 'function') damagePlayer(20);
            applyKnockback(character, 'right', 120, 180);
        }
        
        // 冰冻减速效果（这里可以添加减速逻辑）
        console.log('玩家被冰冻减速');
    }
    
    setTimeout(() => {
        isNpcAttacking = false;
        npc.classList.remove('attacking');
    }, 1500);
}

// 毒雾攻击：释放持续伤害的毒雾
function npcPoisonMistAttack() {
    if (isNpcAttacking) return;
    isNpcAttacking = true;
    npc.classList.add('attacking');

    const npcRect = npc.getBoundingClientRect();
    const characterRect = character.getBoundingClientRect();
    const npcCenterX = npcRect.left + npcRect.width / 2;
    const characterCenterX = characterRect.left + characterRect.width / 2;
    npcFacingRight = characterCenterX >= npcCenterX;
    
    const boundaryRect = boundary.getBoundingClientRect();
    
    // 在玩家位置创建毒雾
    const poisonMist = document.createElement('div');
    poisonMist.classList.add('poison-mist');
    poisonMist.style.position = 'absolute';
    poisonMist.style.left = (characterRect.left - boundaryRect.left - 40) + 'px';
    poisonMist.style.top = (characterRect.top - boundaryRect.top - 40) + 'px';
    poisonMist.style.width = (characterRect.width + 80) + 'px';
    poisonMist.style.height = (characterRect.height + 80) + 'px';
    poisonMist.style.borderRadius = '50%';
    poisonMist.style.background = 'radial-gradient(circle, rgba(0,255,0,0.6), rgba(0,128,0,0.3), transparent)';
    poisonMist.style.border = '2px solid rgba(0,255,0,0.8)';
    poisonMist.style.boxShadow = '0 0 20px rgba(0,255,0,0.5)';
    poisonMist.style.zIndex = '80';
    
    boundary.appendChild(poisonMist);
    
    // 毒雾持续伤害
    let poisonTicks = 0;
    const maxPoisonTicks = 15;
    const poisonInterval = setInterval(() => {
        poisonTicks++;
        
        // 检测玩家是否在毒雾中
        const mistRect = poisonMist.getBoundingClientRect();
        const playerRectNow = character.getBoundingClientRect();
        
        if (isColliding(mistRect, playerRectNow) && !isDefending) {
            if (typeof damagePlayer === 'function') damagePlayer(4); // 每tick造成4点伤害
        }
        
        if (poisonTicks >= maxPoisonTicks) {
            clearInterval(poisonInterval);
            if (poisonMist.parentNode === boundary) boundary.removeChild(poisonMist);
        }
    }, 200);
    
    // 毒雾消散动画
    let opacity = 0.6;
    const fadeInterval = setInterval(() => {
        opacity -= 0.02;
        poisonMist.style.opacity = opacity;
        
        if (opacity <= 0) {
            clearInterval(fadeInterval);
        }
    }, 200);
    
    setTimeout(() => {
        isNpcAttacking = false;
        npc.classList.remove('attacking');
    }, 3000);
}

// NPC攻击函数：依据距离与概率选择多种手段
function npcAttack() {
    // 检查是否处于眩晕状态
    if (npc.classList.contains('stunned')) {
        console.log('NPC处于眩晕状态，无法攻击');
        return;
    }
    
    const npcRect = npc.getBoundingClientRect();
    const characterRect = character.getBoundingClientRect();
    const npcCenterX = npcRect.left + npcRect.width / 2;
    const characterCenterX = characterRect.left + characterRect.width / 2;
    const dist = Math.abs(characterCenterX - npcCenterX);

    if (dist < 120 && Math.random() < 0.6) {
        npcMeleeAttack();
        return;
    }
    
    const roll = Math.random();
    // 根据距离和概率选择攻击方式
    if (dist < 200) {
        // 近距离攻击选择
        if (roll < 0.2) {
            npcMeleeAttack();
        } else if (roll < 0.35) {
            npcBurstAttack();
        } else if (roll < 0.5) {
            npcTrackingAttack(); // 追踪弹
        } else if (roll < 0.65) {
            npcExplosiveAttack(); // 爆炸攻击
        } else if (roll < 0.8) {
            npcLaserAttack(); // 激光攻击
        } else if (roll < 0.9) {
            npcFrostNovaAttack(); // 冰霜新星
        } else {
            npcPoisonMistAttack(); // 毒雾攻击
        }
    } else {
        // 远距离攻击选择
        if (roll < 0.15) {
            npcRangedAttack();
        } else if (roll < 0.3) {
            npcZigzagAttack();
        } else if (roll < 0.45) {
            npcBarrageAttack(); // 多重弹幕
        } else if (roll < 0.6) {
            npcTrackingAttack(); // 追踪弹
        } else if (roll < 0.75) {
            npcExplosiveAttack(); // 爆炸攻击
        } else if (roll < 0.85) {
            npcTimeBombAttack(); // 时间炸弹
        } else if (roll < 0.95) {
            npcBlackHoleAttack(); // 黑洞攻击
        } else {
            npcChainLightningAttack(); // 闪电链
        }
    }
}

// NPC重力应用
function applyNpcGravity() {
    const groundY = getGroundPosition();
    let currentTop = parseInt(window.getComputedStyle(npc).top) || 0;
    
    npcVerticalVelocity += gravity; // 使用与主角相同的重力
    let newTop = currentTop + npcVerticalVelocity;
    
    // 限制NPC跳跃高度
    if (isNpcJumping && newTop < npcJumpStartY - npcMaxJumpHeight) {
        newTop = npcJumpStartY - npcMaxJumpHeight;
        npcVerticalVelocity = 0; // 达到最大高度时停止上升
    }
    
    if (newTop >= groundY) {
        newTop = groundY;
        npcVerticalVelocity = 0;
        isNpcJumping = false;
        isNpcOnGround = true;
        
        npc.classList.remove('jumping');
        npc.classList.add('landing');
        setTimeout(() => {
            npc.classList.remove('landing');
        }, 100);
    }
    
    npc.style.top = newTop + 'px';
}

// NPC随机行为控制器
function npcRandomAction() {
    if (isNpcAttacking) return;
    if (typeof npcDead !== 'undefined' && npcDead) return;
    
    // 检查是否处于眩晕状态
    if (npc.classList.contains('stunned')) {
        console.log('NPC处于眩晕状态，行为受限');
        return;
    }
    
    const action = Math.random();
    
    // 获取主角和NPC位置信息
    const npcRect = npc.getBoundingClientRect();
    const characterRect = character.getBoundingClientRect();
    const npcCenterX = npcRect.left + npcRect.width / 2;
    const characterCenterX = characterRect.left + characterRect.width / 2;
    const distanceToPlayer = Math.abs(characterCenterX - npcCenterX);
    
    // 40%概率主动向主角靠近
    if (action < 0.4) {
        if (distanceToPlayer > 150) { // 距离主角较远时主动靠近
            const moveDir = characterCenterX > npcCenterX ? 12 : -12; // 增加移动速度从8到12
            moveNpcHorizontal(moveDir);
            console.log('NPC主动靠近主角:', {distance: distanceToPlayer, direction: moveDir > 0 ? 'right' : 'left'});
        } else {
            // 距离较近时随机移动
            const moveDir = Math.random() > 0.5 ? 10 : -10; // 增加移动速度从6到10
            moveNpcHorizontal(moveDir);
        }
    }
    // 25%概率随机移动
    else if (action < 0.65) {
        const moveDir = Math.random() > 0.5 ? 12 : -12; // 增加移动速度从8到12
        moveNpcHorizontal(moveDir);
    }
    // 20%概率跳跃
    else if (action < 0.85) {
        npcJump();
    }
    // 15%概率攻击
    else {
        npcAttack();
    }
}

// 每1-3秒随机执行一个动作
setInterval(() => {
    // 检查游戏是否暂停
    if (typeof isPaused === 'function' && isPaused()) {
        return;
    }
    npcRandomAction();
}, Math.random() * 500 + 100);

// NPC规避主角攻击物：检测接近的子弹并规避
function npcEvadeLoop() {
    if (typeof npcDead !== 'undefined' && npcDead) return;
    if (isNpcAttacking) return; // 攻击时不规避
    const now = Date.now();
    if (now - npcLastEvadeTime < 150) return; // 进一步缩短冷却，提高反应频率

    const npcRect = npc.getBoundingClientRect();
    const npcCenterX = npcRect.left + npcRect.width / 2;
    const npcCenterY = npcRect.top + npcRect.height / 2;

    const projectiles = boundary.querySelectorAll('.projectile');
    let dangerFound = false;
    projectiles.forEach((el) => {
        if (el.classList.contains('npc-projectile')) return; // 忽略NPC自己的弹
        const rect = el.getBoundingClientRect();
        const projCenterX = rect.left + rect.width / 2;
        const projCenterY = rect.top + rect.height / 2;
        const dx = npcCenterX - projCenterX;
        const dy = npcCenterY - projCenterY;
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);

        // 简化威胁检测：只要子弹在NPC附近且朝向NPC方向就视为威胁
        const isApproaching = (projCenterX < npcCenterX && projCenterX > npcCenterX - 200) || 
                              (projCenterX > npcCenterX && projCenterX < npcCenterX + 200);
        if (!isApproaching) return;

        if (absDx < 250 && absDy < 60) { // 调整威胁判定范围
            dangerFound = true;
            // 根据子弹位置决定规避方向
            const moveDir = dx > 0 ? 18 : -18; // 大幅提高规避移动速度从12到18
            if (isNpcOnGround) {
                npcJump();
                moveNpcHorizontal(moveDir);
            } else {
                moveNpcHorizontal(moveDir * 1.5); // 空中规避速度也相应提升
                // 空中小跳辅助规避
                if (now - npcLastHopTime > 300) {
                    npcVerticalVelocity = Math.min(npcVerticalVelocity, 0) + jumpForce * 0.4;
                    npcLastHopTime = now;
                }
            }
            console.log('NPC规避触发:', {dx, dy, moveDir, isOnGround: isNpcOnGround}); // 调试信息
        }
    });

    if (dangerFound) {
        npcLastEvadeTime = now;
        console.log('NPC规避成功'); // 调试信息
    }
}

// 更高频规避检测（约16次/秒）
setInterval(() => {
    // 检查游戏是否暂停
    if (typeof isPaused === 'function' && isPaused()) {
        return;
    }
    npcEvadeLoop();
}, 60);

// 实时更新NPC朝向（约60次/秒）
setInterval(() => {
    // 检查游戏是否暂停
    if (typeof isPaused === 'function' && isPaused()) {
        return;
    }
    updateNpcFacing();
}, 16);