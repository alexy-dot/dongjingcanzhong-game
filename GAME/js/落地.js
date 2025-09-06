          // 应用重力
        function applyGravity() {
            const groundY = getGroundPosition();
            let currentTop = parseInt(window.getComputedStyle(character).top) || 0;
            
                    // 安全检查：如果主角位置异常，强制重置到地面
        if (currentTop > groundY + 1000 || currentTop < -1000) {
            console.warn('主角位置异常，强制重置到地面');
            currentTop = groundY;
            verticalVelocity = 0;
            isJumping = false;
            isOnGround = true;
            character.style.top = groundY + 'px';
            return;
        }
        
        // 黑洞效果后的特殊处理：确保主角能正确落地
        if (currentTop > groundY + 200 && verticalVelocity > -2) {
            // 如果主角在高处且下落速度过慢，强制加速下落
            verticalVelocity = Math.max(verticalVelocity, -8);
        }
        
        // 检查是否刚从黑洞效果中恢复
        if (typeof isPlayerInBlackHole !== 'undefined' && !isPlayerInBlackHole && currentTop > groundY + 100) {
            // 如果主角刚从黑洞效果中恢复且在高处，强制加速下落
            verticalVelocity = Math.max(verticalVelocity, -10);
        }
            
            // 应用重力加速度
            verticalVelocity += gravity;
            
            // 计算新位置
            let newTop = currentTop + verticalVelocity;
            // 跳跃高度上限：当上升到达上限时，限制继续上升
            if (isJumping) {
                const highestAllowedTop = Math.max(0, playerJumpStartY - maxJumpHeight);
                if (newTop < highestAllowedTop) {
                    newTop = highestAllowedTop;
                    // 触顶后开始下落
                    verticalVelocity = 0.5; // 轻微向下，避免卡顶
                }
            }
            
            // 检测是否落地
            if (newTop >= groundY) {
                newTop = groundY;
                verticalVelocity = 0;
                isJumping = false;
                isOnGround = true;
                
                // 落地反馈
                character.classList.remove('jumping');
                character.classList.add('landing');
                setTimeout(() => {
                    character.classList.remove('landing');
                }, 100);
            }
            
            character.style.top = newTop + 'px';
        }
        