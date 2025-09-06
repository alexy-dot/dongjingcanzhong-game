 function jump() {
            // 防御状态下无法跳跃
            if (typeof isDefending !== 'undefined' && isDefending) {
                return;
            }
            
            if (isOnGround && !isJumping) {
                isJumping = true;
                isOnGround = false;
                verticalVelocity = jumpForce;  // 使用增大后的跳跃力度
                // 记录起跳时的地面高度，用于限制最高点
                try {
                    const groundY = getGroundPosition();
                    playerJumpStartY = groundY; // 角色落地位置作为基准
                } catch (e) { playerJumpStartY = parseInt(window.getComputedStyle(character).top) || 0; }
                character.classList.add('jumping');
                character.classList.remove('landing');
            }
        }