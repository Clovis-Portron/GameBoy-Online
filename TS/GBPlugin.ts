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

    run(emulator : any) : void
    {
        if(this.canRun() == false)
            return;
    }
}