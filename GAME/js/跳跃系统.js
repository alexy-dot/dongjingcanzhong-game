let isJumping = false;
let isOnGround = true;
let verticalVelocity = 0;
const gravity = 0.8;        // 重力保持不变
const jumpForce = -60;
// 最大跳跃高度（像素），以及起跳时的地面高度记录
let maxJumpHeight = 180;
let playerJumpStartY = 0;
// 生命值（百分比 0-100）
let playerHp = 100;
let npcHp = 1000; // 降低NPC血量到1000
let playerDead = false;
let npcDead = false;
// 监听键盘事件,按键记录
const keys = {
    a: false,
    d: false,
    j: false,  // 攻击键
    k: false   // 防御键
};
// 攻击防御状态
let isAttacking = false;
let isDefending = false;
// 在GAME/js/跳跃系统.js中添加NPC状态变量
// NPC状态变量
let npc = document.getElementById('npc');
let isNpcJumping = false;
let isNpcOnGround = true;
let npcVerticalVelocity = 0;
let npcFacingRight = true; // NPC初始朝向
let isNpcAttacking = false;

// 扣减主角生命并更新血条
function damagePlayer(amount) {
    const delta = Math.max(0, amount || 0);
    if (playerDead) return;
    
    // 防御状态伤害减免40%
    let finalDamage = delta;
    if (typeof isDefending !== 'undefined' && isDefending) {
        finalDamage = Math.round(delta * 0.6); // 受到60%伤害，即减免40%
        console.log(`防御状态：原始伤害${delta}，减免后伤害${finalDamage}`);
    }
    
    playerHp = Math.max(0, Math.min(100, playerHp - finalDamage));
    const bar = document.getElementById('player-hp-bar');
    if (bar) {
        bar.style.width = playerHp + '%';
    }
    if (playerHp <= 0) {
        handleCharacterDeath('player');
    }
}

// 扣减NPC生命并更新血条
function damageNpc(amount) {
    const delta = Math.max(0, amount || 0);
    if (npcDead) return;
    npcHp = Math.max(0, npcHp - delta);  // 移除100的限制，允许血量超过100
    const bar = document.getElementById('npc-hp-bar');
    if (bar) {
        // 计算血条百分比：当前血量 / 最大血量 * 100
        const maxHp = 1000;  // NPC最大血量
        const hpPercentage = Math.min(100, Math.max(0, (npcHp / maxHp) * 100));
        bar.style.width = hpPercentage + '%';
    }
    if (npcHp <= 0) {
        handleCharacterDeath('npc');
    }
}

// 每帧更新头顶血条位置（相对 boundary 内元素）
function updateHeadBarsPosition() {
    const boundaryRect = boundary.getBoundingClientRect();
    const characterRect = character.getBoundingClientRect();
    const npcRect = npc.getBoundingClientRect();

    const playerHpEl = document.getElementById('player-hp');
    const npcHpEl = document.getElementById('npc-hp');

    if (playerHpEl) {
        // 让血条容器相对角色元素定位（已在 HTML 中使用绝对定位及 transform）
        // 若需精细偏移，可调整 top/left 或增加 margin
    }
    if (npcHpEl) {
        // 同上，血条已作为子元素定位
    }
}

// 生成传送门并隐藏对应角色
function handleCharacterDeath(who) {
    if (who === 'player' && playerDead) return;
    if (who === 'npc' && npcDead) return;

    const targetEl = who === 'player' ? character : npc;
    const bRect = boundary.getBoundingClientRect();
    const tRect = targetEl.getBoundingClientRect();

    if (who === 'npc') {
        // 仅 NPC 死亡时生成传送门
        const portal = document.createElement('div');
        portal.className = 'portal';
        portal.style.left = (tRect.left - bRect.left + tRect.width / 2) + 'px';
        portal.style.top = (tRect.top - bRect.top + tRect.height) + 'px';
        boundary.appendChild(portal);
        npcDead = true;
    } else {
        // 主角死亡生成墓碑
        const grave = document.createElement('div');
        grave.className = 'grave';
        grave.style.left = (tRect.left - bRect.left + tRect.width / 2) + 'px';
        grave.style.top = (tRect.top - bRect.top + tRect.height) + 'px';
        boundary.appendChild(grave);
        playerDead = true;
        // 弹出失败画面
        showDefeat();
        // 停止背景音乐
        if (typeof window !== 'undefined' && window.stopBgm) {
            window.stopBgm();
        }
    }

    // 隐藏目标（保留占位以便可能的复活/复位）
    targetEl.style.display = 'none';
}

function showDefeat() {
    const mask = document.createElement('div');
    mask.style.position = 'fixed';
    mask.style.inset = '0';
    mask.style.background = 'rgba(0,0,0,0.65)';
    mask.style.display = 'flex';
    mask.style.alignItems = 'center';
    mask.style.justifyContent = 'center';
    mask.style.zIndex = '9999';

    const panel = document.createElement('div');
    panel.style.minWidth = '400px';
    panel.style.minHeight = '300px';
    panel.style.padding = '24px 32px';
    panel.style.borderRadius = '12px';
            panel.style.background = 'url("./背景板.jpg") 0 0 / 100% 100% no-repeat';
    panel.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5), inset 0 0 22px rgba(0,0,0,0.3)';
    panel.style.border = '2px solid rgba(255,255,255,0.3)';
    panel.style.color = '#ffffff';
    panel.style.textAlign = 'center';
    panel.style.position = 'relative';

    const title = document.createElement('div');
    title.textContent = '失败…';
    title.style.fontSize = '28px';
    title.style.letterSpacing = '4px';
    title.style.marginBottom = '10px';
    title.style.background = 'rgba(0,0,0,0.7)';
    title.style.padding = '10px 20px';
    title.style.borderRadius = '8px';
    title.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';

    const subtitle = document.createElement('div');
    subtitle.textContent = '金木已阵亡';
    subtitle.style.opacity = '0.9';
    subtitle.style.fontSize = '14px';
    subtitle.style.background = 'rgba(0,0,0,0.7)';
    subtitle.style.padding = '8px 16px';
    subtitle.style.borderRadius = '6px';
    subtitle.style.textShadow = '1px 1px 3px rgba(0,0,0,0.8)';
    subtitle.style.marginBottom = '20px';

    // 创建重新开始按钮
    const restartButton = document.createElement('button');
    restartButton.textContent = '重新开始';
    restartButton.style.padding = '12px 24px';
    restartButton.style.fontSize = '16px';
    restartButton.style.fontWeight = 'bold';
    restartButton.style.color = '#ffffff';
    restartButton.style.background = 'linear-gradient(180deg, #3b82f6, #1d4ed8)';
    restartButton.style.border = '2px solid rgba(255, 255, 255, 0.3)';
    restartButton.style.borderRadius = '8px';
    restartButton.style.cursor = 'pointer';
    restartButton.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
    restartButton.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.5)';
    restartButton.style.transition = 'all 0.3s ease';
    restartButton.style.marginTop = '10px';

    // 按钮悬停效果
    restartButton.addEventListener('mouseenter', function() {
        this.style.background = 'linear-gradient(180deg, #60a5fa, #3b82f6)';
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.5), 0 4px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)';
        this.style.borderColor = 'rgba(255, 255, 255, 0.5)';
    });

    restartButton.addEventListener('mouseleave', function() {
        this.style.background = 'linear-gradient(180deg, #3b82f6, #1d4ed8)';
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
        this.style.borderColor = 'rgba(255, 255, 255, 0.3)';
    });

    // 点击重新开始游戏
    restartButton.addEventListener('click', function() {
        // 移除结算面板
        if (mask.parentNode) {
            mask.parentNode.removeChild(mask);
        }
        // 调用重新开始游戏函数
        if (typeof restartGame === 'function') {
            restartGame();
        } else {
            // 如果没有restartGame函数，则刷新页面
            location.reload();
        }
    });

    panel.appendChild(title);
    panel.appendChild(subtitle);
    panel.appendChild(restartButton);
    mask.appendChild(panel);
    document.body.appendChild(mask);
}

// 主角靠近传送门并按下 S：胜利
function tryActivatePortal() {
    if (playerDead) return; // 主角死亡后不可触发胜利
    const portals = boundary.getElementsByClassName('portal');
    if (!portals || portals.length === 0) return;
    const cRect = character.getBoundingClientRect();
    for (let i = 0; i < portals.length; i++) {
        const pRect = portals[i].getBoundingClientRect();
        const overlap = !(cRect.right < pRect.left || cRect.left > pRect.right || cRect.bottom < pRect.top || cRect.top > pRect.bottom);
        if (overlap) { showVictory(); return; }
        // 距离判定（中心点距离阈值）
        const cx = (cRect.left + cRect.right) / 2;
        const cy = (cRect.top + cRect.bottom) / 2;
        const px = (pRect.left + pRect.right) / 2;
        const py = (pRect.top + pRect.bottom) / 2;
        const dx = cx - px;
        const dy = cy - py;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 60) { showVictory(); return; }
    }
}

function showVictory() {
    // 简易胜利遮罩
    const mask = document.createElement('div');
    mask.style.position = 'fixed';
    mask.style.inset = '0';
    mask.style.background = 'rgba(0,0,0,0.6)';
    mask.style.display = 'flex';
    mask.style.alignItems = 'center';
    mask.style.justifyContent = 'center';
    mask.style.zIndex = '9999';

    const panel = document.createElement('div');
    panel.style.minWidth = '400px';
    panel.style.minHeight = '300px';
    panel.style.padding = '24px 32px';
    panel.style.borderRadius = '12px';
    panel.style.background = 'url("./结算.jpg") 0 0 / 100% 100% no-repeat';
    panel.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5), inset 0 0 22px rgba(0,0,0,0.3)';
    panel.style.border = '2px solid rgba(255,255,255,0.3)';
    panel.style.color = '#ffffff';
    panel.style.textAlign = 'center';
    panel.style.position = 'relative';

    const title = document.createElement('div');
    title.textContent = '金木胜利！';
    title.style.fontSize = '28px';
    title.style.letterSpacing = '4px';
    title.style.marginBottom = '10px';
    title.style.background = 'rgba(0,0,0,0.7)';
    title.style.padding = '10px 20px';
    title.style.borderRadius = '8px';
    title.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';

    const subtitle = document.createElement('div');
    subtitle.textContent = '你已经击败了壁虎';
    subtitle.style.opacity = '0.9';
    subtitle.style.fontSize = '14px';
    subtitle.style.marginBottom = '20px';
    subtitle.style.background = 'rgba(0,0,0,0.7)';
    subtitle.style.padding = '8px 16px';
    subtitle.style.borderRadius = '6px';
    subtitle.style.textShadow = '1px 1px 3px rgba(0,0,0,0.8)';

    // 创建继续按钮
    const continueButton = document.createElement('button');
    continueButton.textContent = '继续';
    continueButton.style.padding = '12px 24px';
    continueButton.style.fontSize = '16px';
    continueButton.style.fontWeight = 'bold';
    continueButton.style.color = '#ffffff';
    continueButton.style.background = 'linear-gradient(180deg, #3b82f6, #1d4ed8)';
    continueButton.style.border = 'none';
    continueButton.style.borderRadius = '8px';
    continueButton.style.cursor = 'pointer';
    continueButton.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
    continueButton.style.transition = 'all 0.2s ease';
    
    // 按钮悬停效果
    continueButton.addEventListener('mouseenter', function() {
        this.style.background = 'linear-gradient(180deg, #60a5fa, #3b82f6)';
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.6)';
    });
    
    continueButton.addEventListener('mouseleave', function() {
        this.style.background = 'linear-gradient(180deg, #3b82f6, #1d4ed8)';
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
    });
    
    // 按钮点击事件
    continueButton.addEventListener('click', function() {
        // 跳转到结局视频页面
        window.location.href = '../video2.html';
    });

    panel.appendChild(title);
    panel.appendChild(subtitle);
    panel.appendChild(continueButton);
    mask.appendChild(panel);
    document.body.appendChild(mask);
}