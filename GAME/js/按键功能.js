document.addEventListener('keydown', (e) => {
    // 检查游戏是否暂停，如果暂停则只响应ESC键
    if (typeof isPaused === 'function' && isPaused()) {
        if (e.key === 'Escape') {
            e.preventDefault();
            togglePause();
        }
        return;
    }
    
    switch(e.key) {
        case 'a':
        case 'A':
            keys.a = true;
            break;
        case 'd':
        case 'D':
            keys.d = true;
            break;
        case ' ':
            e.preventDefault();
            jump();
            break;
        case 'j':
        case 'J':
            e.preventDefault();
            if (!isAttacking) {  // 防止连续攻击
                // 使用普通攻击
                attack();
            }
            break;
        case 'u':
        case 'U':
            e.preventDefault();
            if (!isAttacking) {
                playerMeleeAttack();
            }
            break;
        case 'i':
        case 'I':
            e.preventDefault();
            if (!isAttacking) {
                playerScatterShotAttack();
            }
            break;
        case 'h':
        case 'H':
            e.preventDefault();
            startChargeAttack();
            break;
        case 's':
        case 'S':
            // 尝试触发传送门交互（胜利）
            if (typeof tryActivatePortal === 'function') {
                tryActivatePortal();
            }
            break;
        case 'k':
        case 'K':
            e.preventDefault();
            if (!isDefending) {  // 防止持续防御
                defend(true);
            }
            break;
        case 'q':
        case 'Q':
            e.preventDefault();
            // 元素攻击
            if (!isAttacking && typeof elementAttack === 'function') {
                elementAttack();
            }
            break;

        case 'r':
        case 'R':
            e.preventDefault();
            // 切换元素
            if (typeof switchElement === 'function') {
                switchElement();
            }
            break;
    }
});

document.addEventListener('keyup', (e) => {
    switch(e.key) {
        case 'a':
        case 'A':
            keys.a = false;
            break;
        case 'd':
        case 'D':
            keys.d = false;
            break;
        case 'k':
        case 'K':
            defend(false);
            break;
        case 'h':
        case 'H':
            // 松开 H 发射蓄力弹
            releaseChargeAttack();
            break;
    }
});