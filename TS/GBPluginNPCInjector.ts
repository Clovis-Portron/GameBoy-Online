/// <reference path="GBPluginScheduler.ts" />

class GBPluginNPCInjector extends GBPlugin
{
    private static NPCBLOCKSTART = 0xD4D6;

    constructor()
    {
        super();
    }

    public run(emulator : any) : void 
    {
        if(this.canRun() == false)
            return;
        

        let freeSlot = this.searchFreeNPCSlot(emulator);
        if(freeSlot == null)
            return;
        console.log(freeSlot);
        
    }

    private searchFreeNPCSlot(emulator : any) : number 
    {
        let current = GBPluginNPCInjector.NPCBLOCKSTART;
        while(current != 0x0 && current < 0xD720)
        {
            current = current + 0x28;
        }
        if(current < 0xD720)
            return current;
        else 
            return null;
    }


}

// Injection
(<any>window).GBPluginScheduler.GetInstance().registerPluginRun(new GBPluginNPCInjector());