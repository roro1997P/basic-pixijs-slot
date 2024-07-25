

export class ReelsModel {
    public static readonly totalReels: number = 5;
    public static readonly totalRows: number = 3;

    public static symbolHeight: number = 127;
    public static symbolWidth: number = 127;


    public static getIndexToReelIndex(index: number): number {
        if (index < 0 || index >= ReelsModel.totalReels * ReelsModel.totalRows) {
            console.warn("symbol index ${index} out of bounds");
            return null;
        }

        return index % ReelsModel.totalReels;
    }
}