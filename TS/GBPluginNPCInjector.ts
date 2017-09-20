/// <reference path="GBPluginScheduler.ts" />

class NPC 
{
     u  : number  = 0x3C;
     script  : number  = 0x00;
     sprite  : number  = 0x60;
     initBehavior  : number  = 0x03;
     uu  : number  = 0x00;
     uuu  : number  = 0x00;
     color  : number  = 0x01;
     uuuu  : number  = 0x00;
     frame  : number  = 0x0C;
     behavior  : number  = 0x03;
     animationCounter  : number  = 0x00;
     uuuuu  : number  = 0x00;
     uuuuuu  : number  = 0x00;
     uuuuuuu  : number  = 0x00;
     uuuuuuuu  : number  = 0x00;
     uuuuuuuuu  : number  = 0x00;     
     boundsXstart  : number  = 0x0A;
     boundsYstart  : number  = 0x0A;
     boundsXend  : number  = 0x0A;
     boundsYend  : number  = 0x0A;
     boundsxuuu  : number  = 0x0A;
     boundsyuuu  : number  = 0x0A;
     uuuuuuuuuuu  : number  = 0x00;
     spriteX  : number  = 0x0A;
     spriteY  : number  = 0x0A;
}

class GBPluginNPCInjector extends GBPlugin
{
    private static NPCBLOCKSTART = 0xD4D6;

    private npcsToAdd : Array<NPC>;
    private npcsAdded : Array<NPC>;

    constructor()
    {
        super();
        this.npcsToAdd = [];
        this.npcsAdded = [];
    }

    public run(emulator : any) : void 
    {
        if(this.canRun() == false)
            return;
        
        if(this.npcsToAdd.length <= 0)
            return;
        console.log("try to addnpc");
        let freeSlot = this.searchFreeNPCSlot(emulator);
        if(freeSlot == null)
            return;
        this.addNPC(emulator, freeSlot, this.npcsToAdd.shift());
        
    }

    public registerNPC(npc : NPC)
    {
        this.npcsToAdd.push(npc);
    }

    private searchFreeNPCSlot(emulator : any) : number 
    {
        let current = GBPluginNPCInjector.NPCBLOCKSTART;
        while(emulator.memoryRead(current) != 0x0 && current < 0xD720)
        {
            current = current + 0x28;
        }
        if(current < 0xD720)
            return current;
        else 
            return null;
    }

    private addNPC(emulator : any, slot : number, npc : NPC) : void 
    {
        let raw = [];
        for(let i = 0; i < Object.keys(npc).length; i++)
        {
            raw.push(npc[Object.keys(npc)[i]]);
        }
        console.log(raw);
        for(let i = 0; i < raw.length; i++)
        {
            emulator.memoryWrite(slot, raw[i]);
            slot = slot + 0x01;
        }
        this.npcsAdded.push(npc);
    }


}

// Injection
let hh = new GBPluginNPCInjector();
(<any>window).GBPluginScheduler.GetInstance().registerPluginRun(hh);
(<any>window).NPC = NPC;
(<any>window).INPC = new NPC();
(<any>window).injectNPC = function(npc)
{
    hh.registerNPC(npc);
}