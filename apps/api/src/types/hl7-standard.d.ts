declare module 'hl7-standard' {
  export class hl7 {
    constructor(data: string);
    transform(): void;
    get(path: string): string;
    getSegments(segmentName: string): any[];
    build(): string;
  }
}
