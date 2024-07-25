import * as PIXI from 'pixi.js';
import { Application } from '../../application/Application';
import { State } from '../../state/State';

export class LoaderTextState extends State {
    private progressText: PIXI.Text;

    constructor() {
        super();

        this.createText();
        this.centerText();
        Application.stage.addChild(this.progressText);

        this.addListeners();
    }

    async execute(sendComplete: () => void): Promise<void> {
        this.progressText.text = 'Loading: 0%';
        sendComplete();
    }

    private addListeners(): void {
        Application.onResize.add(this.centerText, this);
    }

    private removeListeners(): void {
        Application.onResize.remove(this.centerText, this);
    }

    private createText(): void {
        this.progressText = new PIXI.Text('Loading: 0%', {
            fontFamily: 'Arial',
            fontSize: 36,
            fill: 0xffffff,
            align: 'center'
        });
    }

    private centerText(): void {
        this.progressText.anchor.set(0.5);
        this.progressText.x = window.innerWidth / 2;
        this.progressText.y = window.innerHeight / 2;
    }

    public updateProgress(progress: number): void {
        this.progressText.text = `Loading: ${(progress * 100).toFixed(2)}%`;
    }

    destroy(): void {
        this.progressText.destroy();
        this.removeListeners();
    }
}
