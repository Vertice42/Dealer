import { sleep } from "./functions";
import { resolve } from "bluebird";

export class Observer {
    private Observation: () => Promise<any>;
    public WaitingTime: number;
    public OnWatch = (_result: any) => { };
    private PromiseToStop: () => any;
  
    IsStop = false;
  
    async stop() {
      if (!this.IsStop) {
        this.IsStop = true;
        return new Promise((resolve, reject) => {
          this.PromiseToStop = () => { resolve() };
        });
      }
    }
  
    async start() {
      if (this.IsStop) {
        this.IsStop = false;
        this.OnWatch(await this.Observation()
          .catch(async () => {
            await sleep(1000);
            return resolve();
          }));
        this.watch();
      }
    }
  
  
    watch = async () => {
      setTimeout(async () => {
        if (this.IsStop) {
          this.PromiseToStop();
        } else {
          this.OnWatch(await this.Observation());
          this.watch();
        }
      }, this.WaitingTime);
    }
  
    constructor(Observation: () => Promise<any>, WaitingTime = 100) {
      this.Observation = Observation;
      this.WaitingTime = WaitingTime;
  
      this.watch();
    }
  }