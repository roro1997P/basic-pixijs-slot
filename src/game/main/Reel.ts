import * as PIXI from 'pixi.js';
import { ReelsModel } from './ReelsModel';
import { SymbolView } from '../../utils/SymbolView';

export class Reel {
    private container: PIXI.Container;
    private reelSymbols: SymbolView[] = [];

    constructor(private reelIndex: number) {
        this.createReel();
    }

    getAllVisibleReelSymbols(): SymbolView[] {
        return this.reelSymbols.filter(sym => !sym.isOffset);
    }

    getSymbolAt(index: number): SymbolView {
        return this.reelSymbols.find(sym => sym.getIndex() === index);
    }

    setSymbols(stripe: string[], stopPoint: number = 0): void {
        this.setOffsetSymbol(stripe, stopPoint - 1);
        this.setVisibleSymbols(stripe, stopPoint);
    }

    setSymbolAt(index: number, newSymbol: string): void {
        const symbol = this.reelSymbols.find(sym => sym.getIndex() === index);
        if (symbol) {
            symbol.setSymbol(newSymbol);
            symbol.addChild(new PIXI.Text("WINNING"));
        }
    }

    getContainer(): PIXI.Container {
        return this.container;
    }

    private createReel() {
        this.container = new PIXI.Container();
        this.container.name = "reel";
    }

    private setOffsetSymbol(stripe: string[], stopPoint: number): void {
        const startIndex = (stopPoint + stripe.length) % stripe.length;
        const name = stripe[startIndex];
        const oldSymbol = this.reelSymbols.length > 0 && this.reelSymbols.find(sym => sym.isOffset);
        const offsetSymbol = oldSymbol ? oldSymbol : new SymbolView(name, null, null);
        offsetSymbol.isOffset = true;

        const isNew = offsetSymbol.setSymbol(name);

        if (isNew) {
            offsetSymbol.y = -ReelsModel.symbolHeight; // Position above the visible area
            this.container.addChild(offsetSymbol);
            this.reelSymbols.push(offsetSymbol);
        }
        offsetSymbol.name = `sym_${name}_offset`;
    }

    private setVisibleSymbols(stripe: string[], stopPoint: number): void {
        const startIndex = stopPoint % stripe.length;

        for (let i = 0; i < ReelsModel.totalRows; i++) {
            let isNew = false;
            const index = (startIndex + i) % stripe.length;
            const name = stripe[index];
            const symbolIndex = (i * ReelsModel.totalReels) + this.reelIndex;

            const newSymbol = this.reelSymbols.length > 0 && this.reelSymbols[i + 1] ? this.reelSymbols[i + 1] : new SymbolView(name, i, symbolIndex);

            isNew = newSymbol.setSymbol(name);
            
            if (isNew) {
                newSymbol.y = i * ReelsModel.symbolHeight;
                this.container.addChild(newSymbol);
                this.reelSymbols.push(newSymbol);
            }
            newSymbol.name = `sym_${symbolIndex}`;
        }
    }
}
