import * as PIXI from 'pixi.js';

import { Reel } from './Reel';
import { Application } from '../../application/Application';
import { LayoutEnum } from '../../resources/layouts/LayoutEnum';
import { ReelsModel } from './ReelsModel';
import { DataPool } from '../../utils/DataPool';
import { SymbolView } from '../../utils/SymbolView';
import { MainSlotState } from './MainSlotState';
import { SpinResultVO } from '../../deserializer/vo/SpinResultVO';
import { DeserializerManager } from '../../deserializer/DeserializerManager';
import { State } from '../../state/State';

export class MainReelViewState extends State {
    private reels: Reel[] = [];
    private reelContainer: PIXI.Container;
    private frontLayerContainer: PIXI.Container;
    private mask: PIXI.Graphics;

    constructor() {
        super();
        this.reelContainer = new PIXI.Container();
        this.frontLayerContainer = new PIXI.Container();

        this.reelContainer.name = "reelContainer";
        this.frontLayerContainer.name = "frontLayerContainer";

        Application.stage.addChild(this.reelContainer);
        Application.stage.addChildAt(this.frontLayerContainer, 0);
    }

    execute(): void {
        this.createReels();
        this.createFrontLayerPlaceholder();
        this.addListeners();
        this.configureLayouts();
        this.createMask();

        const mainSlotState = this.getInstance(MainSlotState);
        if (mainSlotState) {
            mainSlotState.setReels(this.reels);
            mainSlotState.setReelsContainer(this.reelContainer);
            mainSlotState.setFrontLayerContainer(this.frontLayerContainer);
        }
    }

    getSymbolAt(index: number): SymbolView {
        for (const reel of this.reels) {
            const symbol = reel.getSymbolAt(index);
            if (symbol) {
                return symbol;
            }
        }
        return null;
    }

    destroy(): void {
        this.removeListeners();
        this.reels.forEach(reel => {
            this.reelContainer.removeChild(reel.getContainer());
        });
        this.reelContainer.parent.removeChild(this.mask);
        Application.stage.removeChild(this.reelContainer);
        Application.stage.removeChild(this.frontLayerContainer);
        Application.stage.removeChild(this.mask);
        this.reelContainer.destroy();
        this.mask.destroy();
    }

    private createFrontLayerPlaceholder(): void {
        const width = ReelsModel.symbolWidth * ReelsModel.totalReels;
        const height = ReelsModel.symbolHeight * ReelsModel.totalRows;

        const graphic = Application.generarteGraphicRectangle(width, height);
        graphic.pivot.set(67, 130);
        graphic.alpha = 0.01;
        this.frontLayerContainer.addChild(graphic);
    }

    private createMask(): void {
        const width = (ReelsModel.symbolWidth * ReelsModel.totalReels) + 4;
        const height = (ReelsModel.symbolHeight * ReelsModel.totalRows) + 2;

        this.mask = Application.generarteGraphicRectangle(width, height);
        this.mask.pivot.set(67, 65);
        this.reelContainer.addChild(this.mask);
        this.reelContainer.mask = this.mask;
    }

    private configureLayouts(): void {
        const layoutsConfig = [
            { id: "reelLandscapeNormalLayout", ratio: LayoutEnum.LANDSCAPE },
            { id: "reelLandscape4_3Layout", ratio: LayoutEnum.LANDSCAPE_4_3 },
            { id: "reelPortraitNormalLayout", ratio: LayoutEnum.PORTRAIT },
            { id: "reelPortrait4_3Layout", ratio: LayoutEnum.PORTRAIT_4_3 }
        ];

        this.applyLayouts(layoutsConfig, this.reelContainer);
        this.applyLayouts(layoutsConfig, this.frontLayerContainer);
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

    private onSpin(): void {
        // Animate reels
    }

    private onServerResponse(): void {
        // Update reels
        const spinResultVO: SpinResultVO = DeserializerManager.getInstance().getLastVoResponse(SpinResultVO);
        console.log(spinResultVO);
        this.updateReels(spinResultVO);
    }

    private createReels() {
        const safeLayout = DataPool.get("game").safeLayout;
        const reelSet = safeLayout.stripes;
        const stopPoints = safeLayout.stopPoints;

        for (let i = 0; i < ReelsModel.totalReels; i++) {
            const reel = new Reel(i);
            reel.setSymbols(reelSet[i], stopPoints[i]);
            reel.getContainer().x = i * ReelsModel.symbolWidth;
            this.reelContainer.addChild(reel.getContainer());
            this.reels.push(reel);
        }
    }

    private updateReels(spinResultVO: SpinResultVO): void {
        const safeLayout = DataPool.get("game").safeLayout;
        const reelSet = safeLayout.stripes;

        this.reels.forEach((reel, index) => {
            reel.setSymbols(reelSet[index], spinResultVO.stopPoints[index]);
        });

        this.setWinningSymbols(spinResultVO);

        const mainSlotState = this.getInstance(MainSlotState);
        if (mainSlotState) {
            mainSlotState.setReels(this.reels);
        }
    }

    private setWinningSymbols(spinResultVO: SpinResultVO): void {
        if (spinResultVO.lines && spinResultVO.lines.length > 0) {
            spinResultVO.lines.forEach(line => {
                if (line.winningLine) {
                    line.winningLine.forEach(winSymPosition => {
                        const reelIndex = ReelsModel.getIndexToReelIndex(winSymPosition);
                        const reel = this.reels[reelIndex];
                        if (reelIndex < line.symQuantity) {
                            reel.setSymbolAt(winSymPosition, line.symbolWin);
                        }
                    });
                }
            });
        }
    }
}
