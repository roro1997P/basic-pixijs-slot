import * as PIXI from 'pixi.js';

import { Application } from '../../application/Application';
import { ButtonFactory } from '../../utils/ButtonFactory';
import { LayoutEnum } from '../../resources/layouts/LayoutEnum';
import { MainSlotState } from './MainSlotState';
import { State } from '../../state/State';


export class UI extends State {
    private spinButtonContainer: PIXI.Container;
    private totalWinContainer: PIXI.Container;
    private button: PIXI.Sprite;

    constructor() {
        super();
    }

    execute(): void {
        this.spinButtonContainer = new PIXI.Container();
        this.totalWinContainer = new PIXI.Container();
        const totalText = new PIXI.Text("TOTAL WIN: XXX");
        totalText.pivot.set(totalText.width * 0.5, totalText.height * 0.5);
        totalText.name = "totalText";
        totalText.alpha = 0;
        this.totalWinContainer.addChild(totalText);
        
        this.button = PIXI.Sprite.from("spin_button");

        this.spinButtonContainer.addChild(this.button);
        this.spinButtonContainer.name = "spinButton";
        this.totalWinContainer.name = "totalWinContainer";

        ButtonFactory.createButton(this.spinButtonContainer, this.onButtonClick.bind(this));

        Application.stage.addChild(this.spinButtonContainer);
        Application.stage.addChild(this.totalWinContainer);

        this.addListeners();
        this.configureLayouts();

        const mainSlotState = this.getInstance(MainSlotState);
        if (mainSlotState) {
            mainSlotState.setTotalWinContainer(this.totalWinContainer);
        }
    }

    destroy(): void {
        this.removeListeners();
        ButtonFactory.removeButton(this.spinButtonContainer);
        Application.stage.removeChild(this.spinButtonContainer);
        this.spinButtonContainer.destroy();
    }

    private configureLayouts(): void {
        const layoutsConfig = [
            { id: "uiLandscapeNormalLayout", ratio: LayoutEnum.LANDSCAPE },
            { id: "uiLandscape4_3Layout", ratio: LayoutEnum.LANDSCAPE_4_3 },
            { id: "uiPortraitNormalLayout", ratio: LayoutEnum.PORTRAIT },
            { id: "uiPortrait4_3Layout", ratio: LayoutEnum.PORTRAIT_4_3 }
        ];

        this.applyLayouts(layoutsConfig, this.spinButtonContainer);
        this.applyLayouts(layoutsConfig, this.totalWinContainer);
    }

    private addListeners(): void {
        Application.onResize.add(this.configureLayouts, this);

        const mainSlotState = this.getInstance(MainSlotState);
        if (mainSlotState) {
            mainSlotState.getSpinButtonSignal().add(this.onSpin, this);
            mainSlotState.getOnServerResponseSignal().add(this.onServerResponse, this);
        }
    }

    private removeListeners(): void {
        Application.onResize.remove(this.configureLayouts, this);

        const mainSlotState = this.getInstance(MainSlotState);
        if (mainSlotState) {
            mainSlotState.getSpinButtonSignal().remove(this.onSpin, this);
            mainSlotState.getOnServerResponseSignal().remove(this.onServerResponse, this);
        }
    }

    private onButtonClick(): void {
        const mainSlotState = this.getInstance(MainSlotState);
        if (mainSlotState?.canUserSpin()) {
            mainSlotState.userSpin();
            console.log('Spin activated');
        } else {
            console.log('Cannot spin yet');
        }
    }

    private onSpin(): void {
        this.spinButtonContainer.eventMode = 'none';
        this.spinButtonContainer.alpha = 0.5;
    }

    private onServerResponse(): void {
        this.spinButtonContainer.eventMode = 'static';
        this.spinButtonContainer.alpha = 1;
    }
}
