import { Container, Text } from "pixi.js";
import { DeserializerManager } from "../../../deserializer/DeserializerManager";
import { SpinResultVO } from "../../../deserializer/vo/SpinResultVO";
import { SymbolState, SymbolView } from "../../../utils/SymbolView";
import { Reel } from "../../main/Reel";
import { ReelsModel } from "../../main/ReelsModel";
import { Task } from "../Task";
import { Application } from "../../../application/Application";


export class ShowAllWinningSymbolsTask extends Task {

    private timer: NodeJS.Timeout = null;
    private reels: Reel[] = [];
    private frontLayerContainer: Container;
    private totalWinContainer: Container;
    private totalWinText: Text;

    execute(sendComplete: () => void, params: { reels: Reel[], frontLayerContainer: Container, totalWinContainer: Container }): void {
        
        const spinResultVO: SpinResultVO = DeserializerManager.getInstance().getLastVoResponse(SpinResultVO);
        
        if (params) {
            this.reels = params.reels;
            this.frontLayerContainer = params.frontLayerContainer;
            this.totalWinContainer = params.totalWinContainer;
            this.totalWinText = this.totalWinContainer.getChildByName("totalText");
            this.totalWinText.alpha = 0;
        }

        
        if (spinResultVO) {
            this.showWinnings(spinResultVO);

            if (spinResultVO.totalWin > 0) {
                this.totalWinText.text = "TOTAL WIN: " + spinResultVO.totalWin;
                this.totalWinText.pivot.set(this.totalWinText.width * 0.5, this.totalWinText.height * 0.5);
                this.totalWinText.alpha = 1;
            }
        }

        this.timer = Application.setTimeout(() => {
            this.returnSymbolsToNormal();
            sendComplete();
        }, 1000);
    }

    destroy(): void {
        if (this.timer !== null) {
            Application.clearTimeout(this.timer);
            this.returnSymbolsToNormal();
        }
    }

    private showWinnings(spinResultVO: SpinResultVO): void {
        if (spinResultVO.lines && spinResultVO.lines.length > 0) {
            this.hideNonWinningSymbols();
            this.highlightWinningSymbols(spinResultVO);
        }
    }

    private hideNonWinningSymbols(): void {
        this.reels.forEach(reel => {
            reel.getAllVisibleReelSymbols().forEach(symbol => {
                symbol.setState(SymbolState.OBSCURE);
            });
        });
    }

    private highlightWinningSymbols(spinResultVO: SpinResultVO): void {
        spinResultVO.lines.forEach(line => {
            if (line.winningLine) {
                line.winningLine.forEach(winSymPosition => {
                    const reelIndex = ReelsModel.getIndexToReelIndex(winSymPosition);
                    const reel = this.reels[reelIndex];

                    if (reelIndex < line.symQuantity) {
                        const symbol = reel.getSymbolAt(winSymPosition);
    
                        // Show winning symbol in front of the mask
                        symbol.moveSymbolToFront(symbol, this.frontLayerContainer);
                        symbol.setState(SymbolState.WIN);
                    }
                });
            }
        });
    }

    private returnSymbolsToNormal(): void {
        this.reels.forEach(reel => {
            reel.getAllVisibleReelSymbols().forEach(symbol => {

                // Return symbols behind the mask
                symbol.moveSymbolBehind(symbol, reel, this.frontLayerContainer);
                symbol.setState(SymbolState.NORMAL);
            });
        });
    }
}