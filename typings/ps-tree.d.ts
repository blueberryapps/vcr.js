declare namespace psTree {}
declare function psTree(pid: number, cb: (err: Error, children: any[]) => void): void

export = psTree;
