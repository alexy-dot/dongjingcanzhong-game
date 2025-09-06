/* 修改GAME/js/模拟重力.js中的moveHorizontal函数 */
function moveHorizontal(dx) {
    // 防御状态下无法移动
    if (typeof isDefending !== 'undefined' && isDefending) {
        return;
    }
    
    let currentLeft = parseInt(window.getComputedStyle(character).left) || 0;
    let newLeft = currentLeft + dx;
    character.style.left = newLeft + 'px';
    
    // 根据移动方向设置朝向
    if (dx > 0) {
        // 向右移动，朝右
        character.classList.remove('facing-left');
        character.classList.add('facing-right');
    } else if (dx < 0) {
        // 向左移动，朝左
        character.classList.remove('facing-right');
        character.classList.add('facing-left');
    }
}