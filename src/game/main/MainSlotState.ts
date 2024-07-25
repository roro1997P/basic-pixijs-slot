import { Container } from 'pixi.js';
import { Signal } from 'signals';

import { Task } from '../tasks/Task';
import { FakeResponse } from '../../utils/FakeResponse';
import { ReelsModel } from './ReelsModel';
import { DeserializerManager } from '../../deserializer/DeserializerManager';
import { Reel } from './Reel';
import { ShowAllWinningSymbolsTask } from '../tasks/scoring/ShowAllWinningSymbolsTask';
import { ShowLineByLineTask } from '../tasks/scoring/ShowLineByLineTask';
import { State } from '../../state/State';
import { Application } from '../../application/Application';


type ScoringParams = {
    reels: Reel[],
    reelsContainer: Container,
    frontLayerContainer: Container,
    totalWinContainer: Container,
}

export class MainSlotState extends State {
    private spinButtonSignal: Signal;
    private onServerResponse: Signal;
    private canSpin: boolean;

    private idleSequence: Task[];
    private scoringSequence: Task[];
    private activeTasks: Task[];
    private reels: Reel[] = [];
    private reelsContainer: Container = null;
    private frontLayerContainer: Container = null;
    private totalWinContainer: Container = null;
    

    constructor() {
        super();
    }

    execute(): void {
        this.spinButtonSignal = new Signal();
        this.onServerResponse = new Signal();
        this.canSpin = true;

        this.idleSequence = [];
        this.scoringSequence = [];
        this.activeTasks = [];

        this.addTasks();
    }

    destroy(): void {
        this.cleanupActiveTasks();
        this.idleSequence = [];
        this.scoringSequence = [];
        this.activeTasks = [];
    }

    public setReels(reels: Reel[]): void {
        this.reels = reels;
    }

    public setReelsContainer(container: Container): void {
        this.reelsContainer = container;
    }

    public setFrontLayerContainer(container: Container): void {
        this.frontLayerContainer = container;
    }

    public setTotalWinContainer(container: Container): void {
        this.totalWinContainer = container;
    }

    public getSpinButtonSignal(): Signal {
        return this.spinButtonSignal;
    }

    public getOnServerResponseSignal(): Signal {
        return this.onServerResponse;
    }

    public canUserSpin(): boolean {
        return this.canSpin;
    }

    public userSpin(): void {
        if (this.canSpin) {
            this.cleanupActiveTasks();
            this.spinButtonSignal.dispatch();
            this.canSpin = false;

            // Simulate spin action
            this.generateFakeResponse();
        }
    }

    public resetSpin(): void {
        this.canSpin = true;
    }

    public addIdleTask(task: Task): void {
        this.idleSequence.push(task);
    }

    public addScoringTask(task: Task): void {
        this.scoringSequence.push(task);
    }

    public startScoringSequence(): void {
        this.runSequence(this.scoringSequence, () => {
            console.log("SCORING FINISHED");
            this.runSequence(this.idleSequence);
        }, { 
            reels: this.reels,
            reelsContainer: this.reelsContainer,
            frontLayerContainer: this.frontLayerContainer,
            totalWinContainer: this.totalWinContainer
        });
    }

    private generateFakeResponse(): void {
        Application.setTimeout(() => {
            const { stopPoints, totalWin, winningLines } = FakeResponse.generateSpinResult(ReelsModel.totalReels, ReelsModel.totalRows);
            
            // Deserialize the generated data
            const deserializerManager = DeserializerManager.getInstance();
            deserializerManager.deserializeSpin({
                lines: winningLines,
                stopPoints: stopPoints,
                totalWin: totalWin,
            });

            this.resetSpin();
            this.onServerResponse.dispatch();
            this.startScoringSequence();
        }, 500);
    }

    private async runSequence(sequence: Task[], onComplete: () => void = null, params: ScoringParams = null): Promise<void> {
        this.cleanupActiveTasks();
        this.activeTasks = sequence.slice();
        for (const task of sequence) {
            await new Promise<void>(resolve => task.execute(resolve, params));
        }
        this.activeTasks = [];
        
        if (onComplete) onComplete();
    }

    private cleanupActiveTasks(): void {
        for (const task of this.activeTasks) {
            task.destroy();
        }
        this.activeTasks = [];
    }

    private addTasks(): void {
        this.addScoringTask(new ShowAllWinningSymbolsTask());
        this.addScoringTask(new ShowLineByLineTask());
    }
}
