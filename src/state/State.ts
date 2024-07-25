import { Assets, Container, Point } from 'pixi.js';
import { Application } from "../application/Application";
import { StateMachine } from "./StateMachine";
import { LayoutEnum } from '../resources/layouts/LayoutEnum';
import { GameState } from './GameState';

export abstract class State {
    private static stateMachine: StateMachine | null = null;

    static setStateMachine(machine: StateMachine) {
        State.stateMachine = machine;
    }

    protected switchStateById(state: GameState): void {
        State.stateMachine.changeState(state);
    }

    protected getInstance<T extends State>(stateClass: new () => T): T | undefined {
        return State.stateMachine?.getInstance(stateClass);
    }

    protected applyLayouts(layoutsConfig: { id: string, ratio: string }[], container: Container) {
        const currentRatio = this.getCurrentRatio();

        const layoutConfig = layoutsConfig.find(config => config.ratio === currentRatio);
        if (!layoutConfig) {
            console.warn(`No layout config found for ratio: ${currentRatio}`);
            return;
        }

        const layoutData = Assets.get(layoutConfig.id);
        const containerConfig = layoutData.children.find(node => node.pathToContent === container.name);

        if (containerConfig) {
            this.applyContainerConfig(containerConfig, container, layoutData);
        } else {
            console.warn(`No container config found for ${container.name} in layout: ${layoutConfig.id}`);
        }
    }

    private applyContainerConfig(containerConfig: any, container: Container, layoutData: any): void {
        // Adjust scale proportionally to fit the window
        const scale = this.getContentScale(layoutData, containerConfig);
        container.scale = scale.clone();

        // Apply configuration
        container.x = containerConfig.x;
        container.y = containerConfig.y;
        this.setAlignment(containerConfig.horizontalAlign, containerConfig.verticalAlign, container, scale);
        
        container.pivot.set(containerConfig.pivotX, containerConfig.pivotY);
    }

    private getContentScale(layout: any, config: any): Point {
        const width = window.innerWidth;
        const height = window.innerHeight;

        const logicWidth: number = layout.scaleWidthRef 
        const logicHeight: number = layout.scaleHeightRef 

        const logicRatio: number = logicWidth / logicHeight;
        const boxRatio: number = width / height;

        let ratio = logicRatio / boxRatio;
        if (logicRatio <= boxRatio) {
            ratio = height / logicHeight;
        } else if (logicRatio >= boxRatio) {
            ratio = width / logicWidth;
        }

        return new Point(ratio * config.scaleX, ratio * config.scaleY);
    }

    private setAlignment(horizontalAlign: string, verticalAlign: string, container: Container, scale: Point): void {
        const innerWidth = window.innerWidth;
        const innerHeight = window.innerHeight;

        // Apply horizontal alignment
        switch (horizontalAlign) {
            case "LEFT":
                container.x = 0;
                break;
            case "CENTER":
                container.x = (innerWidth - scale.x) / 2;
                break;
            case "RIGHT":
                container.x = innerWidth - scale.x;
                break;
            default:
                break;
        }

        // Apply vertical alignment
        switch (verticalAlign) {
            case "TOP":
                container.y = 0;
                break;
            case "MIDDLE":
                container.y = (innerHeight - scale.y) / 2;
                break;
            case "BOTTOM":
                container.y = innerHeight - scale.y;
                break;
            default:
                break;
        }
    }

    private getCurrentRatio(): string {
        const width = Application.renderer.width;
        const height = Application.renderer.height;
        const ratio = width / height;
    
        if (ratio > 1) {
            if (Math.abs(ratio - 16 / 9) < Math.abs(ratio - 4 / 3)) {
                return LayoutEnum.LANDSCAPE;
            } else {
                return LayoutEnum.LANDSCAPE_4_3;
            }
        } else {
            if (Math.abs(ratio - 9 / 16) < Math.abs(ratio - 3 / 4)) {
                return LayoutEnum.PORTRAIT;
            } else {
                return LayoutEnum.PORTRAIT_4_3;
            }
        }
    }

    abstract execute(sendComplete: () => void | null): void;
    abstract destroy(): void;
}
