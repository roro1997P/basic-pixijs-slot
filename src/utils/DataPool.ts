

export class DataPool {
    private static dataMap: Map<string, any> = new Map();

    public static add(key: string, data: any): void {
        DataPool.dataMap.set(key, data);
    }

    public static get(key: string): any {
        return DataPool.dataMap.get(key);
    }
}
