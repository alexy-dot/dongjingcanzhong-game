 function getGroundPosition() {
            const rect = boundary.getBoundingClientRect();
            const charRect = character.getBoundingClientRect();
            return rect.height - charRect.height;
        }
        