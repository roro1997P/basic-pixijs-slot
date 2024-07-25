import { Application } from "./application/Application";
import { IntroLoaderState } from "./game/intro/IntroLoaderState";
import { LoaderTextState } from "./game/intro/LoaderTextState";
import { MainReelViewState } from "./game/main/MainReelViewState";
import { MainSlotState } from "./game/main/MainSlotState";
import { UI } from "./game/main/UI";
import { IntroToMainTransition } from "./game/transitions/IntroToMainTransition";
import { GameState } from "./state/GameState";
import { StateMachine } from "./state/StateMachine";


export class Main {
    private stateMachine: StateMachine;
    private app: Application;

    constructor() {
        this.app = new Application("#canvasContainerSetup");
        this.initializeStateMachine();
    }

    private initializeStateMachine(): void {
        this.stateMachine = new StateMachine();

        this.stateMachine.addState(GameState.INTRO, [
            new LoaderTextState(),
            new IntroLoaderState(),
        ], true);

        this.stateMachine.addState(GameState.MAIN, [
            new MainSlotState(),
            new MainReelViewState(),
            new UI(),
        ], false);

        this.stateMachine.addTransitionOut(GameState.INTRO, GameState.MAIN, new IntroToMainTransition());
        
        this.start();
    }

    private start() {
        this.stateMachine.changeState(GameState.INTRO);
    }
}

new Main();