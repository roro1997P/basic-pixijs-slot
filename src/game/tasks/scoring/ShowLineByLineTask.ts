import { Container, Text } from "pixi.js";
import { Reel } from "../../main/Reel";
import { Task } from "../Task"
import { SpinResultVO } from "../../../deserializer/vo/SpinResultVO";
import { DeserializerManager, WinningLine } from "../../../deserializer/DeserializerManager";
import { ReelsModel } from "../../main/ReelsModel";
import { SymbolState } from "../../../utils/SymbolView";
import { Application } from "../../../application/Application";

export class ShowLineByLineTask extends Task {
    private interval: NodeJS.Timeout = null;
    private reels: Reel[] = [];
    private allLines: any[] = [];

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
        }

        if (spinResultVO && spinResultVO.lines) {
            this.allLines = [...spinResultVO.lines];
            this.startShowingLines(sendComplete);
        } else {
            sendComplete();
        }
    }

    private startShowingLines(sendComplete: () => void): void {
        this.interval = Application.setInterval(() => {
            if (this.allLines.length > 0) {
                const line = this.allLines.shift();
                this.processLine(line);
            } else {
                Application.clearInterval(this.interval);
                this.returnSymbolsToNormal();
                sendComplete();
            }
        }, 1500);
    }

    private processLine(line: WinningLine): void {
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

            this.totalWinText.alpha = 1;
            this.totalWinText.text += `\npayline ${line.lineIndex}, ${line.symbolWin}, ${line.symQuantity}, ${line.creditsWon}`;
        }
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

    destroy(): void {
        if (this.interval !== null) {
            Application.clearInterval(this.interval);
        }
        this.returnSymbolsToNormal();
    }
}
