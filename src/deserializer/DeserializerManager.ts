import { IResultVO } from "./vo/IResultVO";
import { SpinResultVO } from "./vo/SpinResultVO";

type SpinData = {
    lines: WinningLine[];
    stopPoints: number[];
    totalWin: number;
}

export type WinningLine = {
    winningLine: number[];
    creditsWon: number;
    symbolWin: string;
    symQuantity: number;
    lineIndex: number;
}

export class DeserializerManager {
    private static instance: DeserializerManager;
    private voMap: Map<string, IResultVO>;

    constructor() {
        this.voMap = new Map<string, IResultVO>();
    }

    public static getInstance(): DeserializerManager {
        if (!DeserializerManager.instance) {
            DeserializerManager.instance = new DeserializerManager();
        }
        return DeserializerManager.instance;
    }

    public deserializeSpin(data: SpinData): void {
        const spinResultVO = new SpinResultVO();

        if (data.lines && data.lines.length) {
            spinResultVO.lines = [];
            data.lines.forEach(line => {
                spinResultVO.lines.push({
                    creditsWon: line.creditsWon,
                    symQuantity: line.symQuantity,
                    symbolWin: line.symbolWin,
                    winningLine: line.winningLine,
                    lineIndex: line.lineIndex
                })
            });
        }
        
        spinResultVO.totalWin = data.totalWin;
        spinResultVO.stopPoints = data.stopPoints;
        this.addValueObjects(spinResultVO, SpinResultVO);
    }

    public getLastVoResponse<T extends IResultVO>(voType: new () => T): T | undefined {
        const key = voType.name;
        return this.voMap.get(key) as T;
    }

    private addValueObjects<T extends IResultVO>(valueObject: T, voType: new () => T): void {
        const key = voType.name;
        this.voMap.set(key, valueObject);
    }
}
