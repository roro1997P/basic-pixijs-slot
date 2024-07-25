import * as PIXI from 'pixi.js';
import { Signal } from 'signals';


export class Application {
    private static _app: PIXI.Application;
    public static onTick: Signal;
    public static onResize: Signal;

    constructor(selectorContainerForCanvas: string) {
        Application.onTick = new Signal();
        Application.onResize = new Signal();

        Application._app = new PIXI.Application({
            width: window.innerWidth,
            height: window.innerHeight,
            autoDensity: true,
            resolution: window.devicePixelRatio || 1,
            backgroundColor: 0x90EE90,
        });

        globalThis.__PIXI_APP__ = Application._app;

        document.querySelector(selectorContainerForCanvas)?.appendChild(Application._app.view as HTMLCanvasElement);

        window.addEventListener('resize', Application.handleResize);
        Application.handleResize();

        this.start();
    }

    private start(): void {
        Application._app.ticker.add(() => {
            Application.onTick.dispatch();
        });
    }

    private static handleResize(): void {
        Application._app.renderer.resize(window.innerWidth, window.innerHeight);
        Application.onResize.dispatch();
    }

    public static generarteGraphicRectangle(width: number, height: number, x: number = 0, y: number = 0, color: number = 0): PIXI.Graphics {
        var graphics: PIXI.Graphics = new PIXI.Graphics();
        graphics.beginFill(color, 1);
        graphics.drawRect(x, y, width, height);
        graphics.endFill();
        return graphics;
    }

    public static setTimeout(callback: () => any, time: number): NodeJS.Timeout {
        return setTimeout(callback, time);
    }

    public static setInterval(callback: () => any, time: number): NodeJS.Timeout {
        return setInterval(callback, time);
    }

    public static clearTimeout(timer: NodeJS.Timeout): void {
        if (timer) {
            clearTimeout(timer);
        }
    }

    public static clearInterval(timer: NodeJS.Timeout): void {
        if (timer) {
            clearInterval(timer);
        }
    }

    public static get stage(): PIXI.Container {
        return Application._app.stage;
    }

    public static get renderer(): PIXI.IRenderer {
        return Application._app.renderer;
    }
}
