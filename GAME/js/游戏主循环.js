function gameLoop() {
            // 检查游戏是否暂停
            if (typeof isPaused === 'function' && isPaused()) {
                return; // 如果游戏暂停，停止循环
            }
            
            // 处理左右移动
            let dx = 0;
            if (keys.a) dx -= 20;  // 增加移动速度从15到20
            if (keys.d) dx += 20;  // 增加移动速度从15到20
            if (dx !== 0) {
                moveHorizontal(dx);
            }
            
            // 处理重力和跳跃物理
            if (isJumping) {
                applyGravity();
            }
            
            // NPC重力和规避逻辑
            if (typeof npcDead === 'undefined' || !npcDead) {
                applyNpcGravity();
            }
            
            // 更新血条相对位置（头顶跟随）
            updateHeadBarsPosition();
            requestAnimationFrame(gameLoop);
        }
        
        // 启动游戏循环