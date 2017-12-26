abstract class GBPlugin
{
    counter : number = 0;
    counterInterval : number = 30;

    canRun() : boolean
    {
        this.counter++;
        if(this.counter > this.counterInterval)
        {
            this.counter = 0;
            return true;
        }
        return false;
    }

    start(emulator : any) : void {
        
    }

    link(emulator : any) : void
    {
    }

    run(emulator : any) : void
    {
        if(this.canRun() == false)
            return;
    }
}