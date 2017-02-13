import * as psTree from 'ps-tree'; 

export default function killProcessTree(
  pid: number,
  signal: string = 'SIGKILL'
) {
  psTree(pid, (err, children) =>
    [pid]
      .concat(children.map(({PID}) => PID))
      .forEach((tpid: number) => {
        // console.log(`[killProcessTree] gonna kill ${tpid} !!! (${signal})`);
        try { 
          process.kill(tpid, signal); 
        } catch (e) { 
          console.log(`[killProcessTree] ERROR killing PID: ${tpid} ERR: ${e}`); 
        }
      })
  );
};
