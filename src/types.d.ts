export type TextSegment = {
    type: 'text';
    text: string;
    children: never[];
    path: string;
};
export type TagSegment = {
    type: 'tag';
    name: string;
    parent: TagSegment | RootSegment;
    children: (TagSegment | TextSegment)[];
    attributes: {
        [key: string]: string | undefined;
    };
    path: string;
};
export type RootSegment = {
    type: 'root';
    children: (TagSegment | TextSegment)[];
    path: '';
    isNormalized: boolean;
};
export type Segment = TextSegment | TagSegment | RootSegment;
