import {Server} from 'net';

interface DServer extends Server {
  destroy(): Promise<void | Error>;
  destroy(cb: Function): void;
}

declare namespace destroyEnhancer {
  export function destroy(): Promise<void | Error>;
  export function destroy(cb: Function): void;
  export type DestroyableServer = DServer
}
declare function destroyEnhancer(server: Server): DServer

export = destroyEnhancer;
