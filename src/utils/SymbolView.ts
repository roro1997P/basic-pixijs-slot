import { Container, Sprite, Point } from "pixi.js";
import { gsap } from "gsap";
import { Reel } from "../game/main/Reel";
import { ReelsModel } from "../game/main/ReelsModel";

export enum SymbolState {
    NORMAL,
    OBSCURE,
    WIN
}

export class SymbolView extends Container {
    private readonly suffix = "_symbol";
    private symbolScale: Point;
    private symbol: Sprite;
    private index: number;
    private indexInReel: number;
    
    
    private timeline: gsap.core.Timeline = null;
    private gsapAnims: gsap.core.Tween[] = [];
    
    isOffset: boolean = false;

    constructor(symbolName: string, i: number, index: number) {
        super();

        this.symbol = Sprite.from(symbolName + this.suffix);
        this.index = index;
        this.indexInReel = i;
        this.symbol.width = ReelsModel.symbolWidth;
        this.symbol.height = ReelsModel.symbolHeight;
        this.symbolScale = this.symbol.scale.clone();
    }

    setState(state: SymbolState): void {
        if (state === SymbolState.WIN) {
            this.winAnimation();
        } else if (state === SymbolState.OBSCURE) {
            this.obscureSymbol();
        } else if (state === SymbolState.NORMAL) {
            this.setToNormal();
        }
    }

    setSymbol(symbolName: string): boolean {
        let isNew = false;
        this.symbol = Sprite.from(symbolName + this.suffix);

        if (this.children.length === 0) {
            this.addChild(this.symbol);
            isNew = true;
            this.pivot.set(this.width * 0.5, this.height * 0.5);
            this.scale = this.symbolScale.clone();
        } else {
            this.removeChildren();
            this.addChild(this.symbol);
            isNew = false;
        }

        return isNew;
    }

    getSymbol(): Sprite {
        return this.symbol;
    }

    getIndex(): number {
        return this.index;
    }

    moveSymbolToFront(symbol: SymbolView, toContainer: Container): void {
        const globalPosition = symbol.getGlobalPosition();
        const localInFront = toContainer.toLocal(globalPosition);
        symbol.parent.removeChild(symbol);
        toContainer.addChild(symbol);
        symbol.position = localInFront;
    }

    moveSymbolBehind(symbol: SymbolView, reel: Reel, fromContainer: Container): void {
        if (symbol.parent.name !== "reel") {
            const reelContainer = reel.getContainer();

            fromContainer.removeChild(symbol);
            reelContainer.addChild(symbol);
            symbol.position.x = 0
            symbol.position.y = ReelsModel.symbolHeight * this.indexInReel;
        }
    }

    private setToNormal(): void {
        if (this.timeline) this.timeline.kill();
        if (this.gsapAnims.length > 0) {
            this.gsapAnims.forEach(anim => {
                anim.kill();
            });
        }
        this.alpha = 1;
        this.rotation = 0;
        this.scale = this.symbolScale.clone();
        this.gsapAnims = [];
    }

    private obscureSymbol(): void {
        this.alpha = 0.5;
    }

    private winAnimation(): void {
        this.alpha = 1;
        const initialScale = this.symbolScale.clone();
        this.gsapAnims.push(gsap.to(this.scale, {
            x: initialScale.x + 0.05,
            y: initialScale.y + 0.05,
            duration: 0.5
        }));

        this.gsapAnims.push(gsap.to(this.scale, {
            x: initialScale.x,
            y: initialScale.y,
            delay: 0.5,
            duration: 0.5
        }));

        this.timeline = gsap.timeline();
        this.timeline.to(this, {
            rotation: 0.2,
            duration: 0.1
        });

        this.timeline.to(this, {
            rotation: -0.2,
            duration: 0.2
        });

        this.timeline.to(this, {
            rotation: 0,
            duration: 0.1
        });

        this.timeline.play();
    }
}