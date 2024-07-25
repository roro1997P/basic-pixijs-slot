import { GameState } from "./GameState";
import { State } from "./State";

type StateEntry = {
    state: State;
};

type TransitionEntry = {
    fromState: GameState;
    toState: GameState;
    transition: State;
};

export class StateMachine {
    private states: Map<GameState, StateEntry[]>;
    private transitions: Map<string, TransitionEntry>;
    private waitForCompletionState: Map<GameState, boolean>;
    private stateInstances: Map<string, State>;
    private currentState: GameState | null;
    private stateQueue: GameState[];

    constructor() {
        this.states = new Map<GameState, StateEntry[]>();
        this.transitions = new Map<string, TransitionEntry>();
        this.waitForCompletionState = new Map<GameState, boolean>();
        this.stateInstances = new Map<string, State>();
        this.currentState = null;
        this.stateQueue = [];
        State.setStateMachine(this);
    }

    addState(stateType: GameState, stateSequence: State[], waitForCompletion: boolean = false) {
        const stateEntries = stateSequence.map(state => {
            const id = state.constructor.name;
            this.stateInstances.set(id, state);
            return {state}
        });

        this.stateQueue.push(stateType);

        this.states.set(stateType, stateEntries);
        this.waitForCompletionState.set(stateType, waitForCompletion);
    }

    addTransitionOut(fromState: GameState, toState: GameState, transition: State) {
        const key = `${fromState}-${toState}`;
        this.transitions.set(key, { fromState, toState, transition });
    }

    async changeState(stateType: GameState) {
        if (this.currentState !== null) {

            // Wait for transition to finish
            const key = `${this.currentState}-${stateType}`;
            const transitionEntry = this.transitions.get(key);

            if (transitionEntry) {
                console.log(`Transitioning from ${GameState[transitionEntry.fromState]} to ${GameState[transitionEntry.toState]}`);
                await new Promise<void>(resolve => transitionEntry.transition.execute(resolve));
            }

            const currentEntries = this.states.get(this.currentState);
            if (currentEntries) {
                for (const entry of currentEntries) {
                    entry.state.destroy();
                }
            }
        }

        this.currentState = stateType;

        const stateEntries = this.states.get(stateType);
        const waitForCompletion = this.waitForCompletionState.get(stateType);

        if (stateEntries && waitForCompletion) {
            // Handle sync instances execution
            for (const entry of stateEntries) {
                await new Promise<void>(resolve => entry.state.execute(resolve));
            }

            // this.processQueue();
            // this.changeState(stateType);
        } else if (stateEntries) {
            // Handle async instances execution
            for (const entry of stateEntries) {
               entry.state.execute(null);
            }
        }
    }

    // async processQueue() {
    //     if (this.stateQueue.length > 0) {
    //         const nextState = this.stateQueue.shift();
    //         if (nextState !== undefined) {
    //             await this.changeState(nextState);
    //         }
    //     }
    // }

    getInstance<T extends State>(stateClass: new () => T): T | undefined {
        return Array.from(this.stateInstances.values()).find(instance => instance instanceof stateClass) as T;
    }
}
