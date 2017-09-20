/// <reference path="GBPluginScheduler.ts" />

class NPC 
{
    OBJECT_SPRITE  : number  = 0x3C;
    OBJECT_MAP_OBJECT_INDEX  : number  = 0x00;
    OBJECT_SPRITE_TILE  : number  = 0x60;
    OBJECT_MOVEMENTTYPE    : number  = 0x03; //0: regard direction, 1 : rien, 2 : marche libre ,3: turn, 4: Marche aléatoire verticale, 5: marcher r4 H, 6: retour position originale
    OBJECT_FLAGS1  : number  = 0x00;
    OBJECT_FLAGS2  : number  = 0x00;
    OBJECT_PALETTE  : number  = 0x01;
    OBJECT_DIRECTION_WALKING  : number  = 0x00; // 1: haut, 2: bas,3: droite
    OBJECT_FACING  : number  = 0x00; //0: bas, 8: gauche , 0x0C: droite, 4: haut
    OBJECT_STEP_TYPE  : number  = 0x03; // 3: wait, 1: turn, 7: walk
    OBJECT_STEP_DURATION  : number  = 0x00;
    OBJECT_ACTION  : number  = 0x00; //1: rien, 2: walk, 3: run, 4: turn
    OBJECT_STEP_FRAME  : number  = 0x00;
    OBJECT_FACING_STEP  : number  = 0x00;
    OBJECT_NEXT_TILE  : number  = 0x00;
    OBJECT_STANDING_TILE  : number  = 0x00;     
    OBJECT_NEXT_MAP_X  : number  = 0x0A;
    OBJECT_NEXT_MAP_Y  : number  = 0x0A;
    OBJECT_MAP_X : number  = 0x0A;
    OBJECT_MAP_Y : number  = 0x0A;
    OBJECT_INIT_X  : number  = 0x0A;
    OBJECT_INIT_Y  : number  = 0x0A;
    OBJECT_RADIUS  : number  = 0x00;
    OBJECT_SPRITE_X   : number  = 0x0A;
    OBJECT_SPRITE_Y  : number  = 0x0A;
    OBJECT_SPRITE_X_OFFSET : number = 0;
    OBJECT_SPRITE_Y_OFFSET : number = 0;
    OBJECT_MOVEMENT_BYTE_INDEX : number = 0;
    u1 : number = 0;
    u2 : number = 0;
    u3 : number = 0;
    u4 : number = 0;
    OBJECT_RANGE : number = 0;
}

class NPCWatcher
{
    public npc : NPC;
    private mustUpdate = false;
    private slot : number;
    private emulator : any;
    private valuesToUpdate : Array<boolean> = [];
    private created = false;

    constructor(emulator,slot,npc: NPC)
    {
        this.npc = npc;
        this.slot = slot;
        this.emulator = emulator;
        this.mustUpdate = true;
        for(let i = 0; i < Object.keys(this.npc).length; i++)
        {
            this.valuesToUpdate[Object.keys(this.npc)[i]] = true;
        }
    }

    public set(property : string, value : number)
    {
        this.npc[property] = value;
        this.valuesToUpdate[property] = true;
        this.mustUpdate = true;
    }

    public update()
    {
        if(this.emulator.memoryRead(this.slot) == 0 && this.created == true)
        {
            // Il a été supprimé, on le réalloue
            return false;
        }
        if(this.created == false)
            this.created = true;
        if(this.mustUpdate == false)
            return true;
        let cell = this.slot;        
        for(let i = 0; i < Object.keys(this.npc).length; i++)
        {
            /*if(this.valuesToUpdate[Object.keys(this.npc)[i]] == true)
            {
                this.emulator.memoryWrite(cell, this.npc[Object.keys(this.npc)[i]]);
                this.valuesToUpdate[Object.keys(this.npc)[i]] = false;
            }
            else 
                this.npc[Object.keys(this.npc)[i]] = this.emulator.memoryRead(cell);*/
            this.emulator.memoryWrite(cell, this.npc[Object.keys(this.npc)[i]]);    
            cell = cell + 0x01;    
        }
        this.mustUpdate = false;
        return true;
    }
}

class GBPluginNPCInjector extends GBPlugin
{
    private static NPCBLOCKSTART = 0xD4D6;

    private npcsToAdd : Array<NPC>;
    private npcsAdded : Array<NPCWatcher>;

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

        for(let i = 0; i < this.npcsAdded.length;)
        {
            if(this.npcsAdded[i].update() == false)
            {
                //this.npcsToAdd.push(this.npcsAdded[i].npc);
                this.npcsAdded.splice(i, 1);
            }
            else 
                i++;
        }
        
        if(this.npcsToAdd.length <= 0)
            return;
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
        let p = new NPCWatcher(emulator, slot, npc);
        p.update();
        this.npcsAdded.push(p);
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