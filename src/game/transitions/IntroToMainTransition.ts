import { State } from '../../state/State';

export class IntroToMainTransition extends State {
    constructor() {
        super();
    }

    execute(sendComplete: () => void): void {
        sendComplete();
    }

    destroy(): void {
        
    }
}
