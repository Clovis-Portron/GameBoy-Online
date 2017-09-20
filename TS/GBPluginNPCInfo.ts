/// <reference path="GBPluginScheduler.ts" />
/// <reference path="GBPluginNPCInjector.ts" />


class GBPluginNPCInfo extends GBPlugin
{
    private static NPCBLOCKSTART = 0xD4D6;

    public npcs : Array<NPC> = [];

    public run(emulator : any) : void 
    {
        if(this.canRun() == false)
            return;
        //console.log("NPC INFO");
        this.npcs = this.searchNPCS(emulator);
    }

    private searchNPCS(emulator : any) : Array<NPC>
    {
        let results = [];
        let current = GBPluginNPCInfo.NPCBLOCKSTART;
        while(current < 0xD720)
        {
            if(emulator.memoryRead(current) != 0x0)
                results.push(this.generateNPCFromRAM(emulator, current));
            current = current + 0x28;
        }
        return results;
    }

    private generateNPCFromRAM(emulator : any, slot : number) : NPC
    {
        let npc : NPC = new NPC();
        let raw = [];
        for(let i = 0; i < Object.keys(npc).length; i++)
        {
            npc[Object.keys(npc)[i]] = emulator.memoryRead(slot);
            raw.push(emulator.memoryRead(slot));
            slot = slot + 0x01;
        }
        //console.log(raw);
        return npc;
    }


}

let hhh= new GBPluginNPCInfo();
(<any>window).GBPluginScheduler.GetInstance().registerPluginRun(hhh);
(<any>window).dumpNPC = function()
{
    return hhh.npcs;
}