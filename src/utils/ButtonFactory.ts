import * as PIXI from 'pixi.js';

export class ButtonFactory {
    private static keydownHandlers: Map<PIXI.Container, (event: KeyboardEvent) => void> = new Map();

    public static createButton(container: PIXI.Container, callback: () => void): void {
        container.eventMode = "static";
        container.cursor = "pointer";

        container.on('pointerdown', callback);

        const keydownHandler = (event: KeyboardEvent) => {
            if (event.code === 'Space') {
                callback();
            }
        };

        window.addEventListener('keydown', keydownHandler);
        this.keydownHandlers.set(container, keydownHandler);
    }

    public static removeButton(container: PIXI.Container): void {
        const keydownHandler = this.keydownHandlers.get(container);
        if (keydownHandler) {
            window.removeEventListener('keydown', keydownHandler);
            this.keydownHandlers.delete(container);
        }
        container.off('pointerdown');
    }
}
