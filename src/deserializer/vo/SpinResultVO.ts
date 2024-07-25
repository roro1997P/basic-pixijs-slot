import { IResultVO } from "./IResultVO";

export class SpinResultVO implements IResultVO {
    lines: {
        winningLine: number[];
        creditsWon: number;
        symbolWin: string;
        symQuantity: number;
        lineIndex: number;
    }[];
    stopPoints: number[];
    totalWin: number;
}