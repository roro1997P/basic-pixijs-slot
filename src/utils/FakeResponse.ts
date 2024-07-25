import { WinningLine } from "../deserializer/DeserializerManager";
import { DataPool } from "./DataPool";
import { Paylines } from "./Paylines";
import { Paytable } from "./Paytable";


declare const FORCE_WIN: boolean;

export class FakeResponse {

    private static getRandomStopPoint(stripes: string[]): number {
        return Math.floor(Math.random() * stripes.length);
    }
    
    private static getFakeStopPoints(reelCount: number, stripes: string[][]): number[] {
        const stopPoints: number[] = [];
        for (let i = 0; i < reelCount; i++) {
            stopPoints.push(FakeResponse.getRandomStopPoint(stripes[i]));
        }
        return stopPoints;
    }

    private static getSymbolsInView(stopPoints: number[], stripes: string[][], totalReels: number, totalRows: number): string[] {
        const symbolsInView: string[] = [];

        for (let reelIndex = 0; reelIndex < totalReels; reelIndex++) {
            const stripe = stripes[reelIndex];
            const stopPoint = stopPoints[reelIndex];
    
            for (let rowIndex = 0; rowIndex < totalRows; rowIndex++) {
                const symbolIndex = (stopPoint + rowIndex) % stripe.length;
                symbolsInView.push(stripe[symbolIndex]);
            }
        }
    
        return symbolsInView;
    }

    private static getForcedSymbolsInView(totalReels: number, totalRows: number): string[] {
        const symbolsInView: string[] = [];

        for (let reelIndex = 0; reelIndex < totalReels; reelIndex++) {

            for (let rowIndex = 0; rowIndex < totalRows; rowIndex++) {
                symbolsInView.push("hv1");
            }
        }
    
        return symbolsInView;
    }

    private static getWinningLinesAndTotalWin(symbolsInView: string[]): { winningLines: WinningLine[], totalWin: number } {
        const paylines = [...Paylines.linesData];
        const payTable = Paytable.paytableData;
        const winningLines: WinningLine[] = [];
        let totalWin = 0;

        paylines.forEach((payline, lineIndex) => {

            const firstLineSymbol = symbolsInView[payline[0]];

            let matchCount = 1;

            for (let i = 1; i < payline.length; i++) {
                const symbol = symbolsInView[payline[i]];
                if (symbol === firstLineSymbol) {
                    matchCount++;
                }
            }

            if (matchCount >= 3 && payTable[firstLineSymbol] && payTable[firstLineSymbol][matchCount]) {
                const creditsWon = payTable[firstLineSymbol][matchCount];
                totalWin += creditsWon;
                winningLines.push({
                    winningLine: payline,
                    creditsWon,
                    symbolWin: firstLineSymbol,
                    symQuantity: matchCount,
                    lineIndex: lineIndex + 1,
                });
            }
        });
        return { winningLines, totalWin }
    }

    static generateSpinResult(totalReels: number, totalRows: number): any {
        const safeLayout = DataPool.get("game").safeLayout;
        const reelsSet = safeLayout.stripes;
        
        const stopPoints = FakeResponse.getFakeStopPoints(totalReels, reelsSet);
        let visibleSymbols = [];
        if (FORCE_WIN) {
            visibleSymbols = FakeResponse.getForcedSymbolsInView(totalReels, totalRows);
        } else {
            visibleSymbols = FakeResponse.getSymbolsInView(stopPoints, reelsSet, totalReels, totalRows);
        }

        const { winningLines, totalWin } = FakeResponse.getWinningLinesAndTotalWin(visibleSymbols);
        

        return { stopPoints, totalWin, winningLines }
    }
}