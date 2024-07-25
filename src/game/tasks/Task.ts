export abstract class Task {
    abstract execute(sendComplete: () => void, params: any): void;
    abstract destroy(): void;
}