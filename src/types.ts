export interface KeySound {
    name: string;
    key: string;
    sound: string;
    label: string;
}

export interface RecordedKey {
    key: string;
    sound: string;
    time: number;
}

export interface HistoryEntry {
    id: number;
    keys: RecordedKey[];
    index: number;
    name: string;
}
