import { Assets } from 'pixi.js';
import { LoaderTextState } from './LoaderTextState';
import { DataPool } from '../../utils/DataPool';
import { State } from '../../state/State';
import { GameState } from '../../state/GameState';
import { Application } from '../../application/Application';



export class IntroLoaderState extends State {
    private assetsPaths = [
        { id: "assets", src: "assets/assets.json" },
        { id: "layouts", src: "assets/layouts.json" },
        { id: "game", src: "assets/game.json" }
    ];

    constructor() {
        super();
    }

    async execute(sendComplete: () => void): Promise<void> {
        try {
            const manifests = await this.loadAllJsons();
            const dataIds = this.addAllAssets(manifests);
            await this.loadAllAssets(dataIds);
            Application.setTimeout(() => {
                sendComplete();
                this.switchStateById(GameState.MAIN);
            }, 1000);
        } catch (error) {
            console.error("Error loading assets:", error);
            sendComplete();
        }
    }

    private async loadAllJsons(): Promise<any[]> {
        const manifests = [];
        const jsonsIds = [];
        for (const path of this.assetsPaths) {
            jsonsIds.push(path.id);
            Assets.add({ alias: path.id, src: path.src });
        }

        const response = await Assets.load(jsonsIds);

        Object.keys(response).forEach(key => {
            const element = response[key];
            if (element.manifest) {
                manifests.push(element.manifest);
            } else {
                DataPool.add(key, element);
            }
        });

        return manifests;
    }

    private addAllAssets(manifests: any[][]): string[] {
        const dataIds = [];
        manifests.forEach(manifest => {
            manifest.forEach(asset => {
                const dataId = asset.id;
                Assets.add({ alias: dataId, src: asset.src });
                dataIds.push(dataId);
            });
        });

        return dataIds;
    }

    private async loadAllAssets(dataIds: string[]): Promise<void> {
        await Assets.load(dataIds, this.onProgress.bind(this));
    }

    private onProgress(progress: number): void {
        this.getInstance(LoaderTextState)?.updateProgress(progress);
    }

    destroy(): void {
        
    }
}
