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
    OBJECT_DIRECTION_WALKING  : number  = 0x00; // 01 -> haut , 00 ->  bas , 10 -> gauche, 11 -> droite
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
    MAP_INDEX : number = 0; // Pas utilisé à l'origine
    MAP_BANK : number = 0; // Pas utilisé à l'origine
    u3 : number = 0;
    u4 : number = 0;
    OBJECT_RANGE : number = 0;
}

class NPCWatcher
{
    public static DIRECTION = {
        "UP" : 0,
        "DOWN" : 1,
        "LEFT" :  2,
        "RIGHT" : 3
    };

    public npc : NPC;
    public mustUpdate = false;
    private slot : number;
    private emulator : any;
    private valuesToUpdate : Array<boolean> = [];
    private created = false;
    public mustDelete = false;

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

    public walk(direction : number)
    {
        this.set("OBJECT_MOVEMENTTYPE",0x00);
        this.set("OBJECT_STEP_DURATION",16);
        this.set("OBJECT_NEXT_TILE",0);
        this.set("OBJECT_ACTION",2);
        this.set("OBJECT_STEP_TYPE",7);
        this.set("OBJECT_MAP_OBJECT_INDEX", 0x03);
        this.set("OBJECT_RADIUS",0);
        
        

        switch(direction)
        {
            case NPCWatcher.DIRECTION.UP:
                this.set("OBJECT_DIRECTION_WALKING",0b01);
                this.set("OBJECT_FACING",4);
                this.set("OBJECT_NEXT_MAP_X",this.npc.OBJECT_MAP_X);
                this.set("OBJECT_NEXT_MAP_Y",this.npc.OBJECT_MAP_Y - 1);
            break;
            case NPCWatcher.DIRECTION.DOWN:
                this.set("OBJECT_DIRECTION_WALKING",0b00);
                this.set("OBJECT_FACING",0);
                this.set("OBJECT_NEXT_MAP_X",this.npc.OBJECT_MAP_X);
                this.set("OBJECT_NEXT_MAP_Y",this.npc.OBJECT_MAP_Y + 1);
            break;
            case NPCWatcher.DIRECTION.LEFT:
                this.set("OBJECT_DIRECTION_WALKING",0b10);
                this.set("OBJECT_FACING",8);
                this.set("OBJECT_NEXT_MAP_X",this.npc.OBJECT_MAP_X - 1);
                this.set("OBJECT_NEXT_MAP_Y",this.npc.OBJECT_MAP_Y);
            break;
            case NPCWatcher.DIRECTION.RIGHT:
                this.set("OBJECT_DIRECTION_WALKING",0b11);
                this.set("OBJECT_FACING",0x0C);
                this.set("OBJECT_NEXT_MAP_X",this.npc.OBJECT_MAP_X + 1);
                this.set("OBJECT_NEXT_MAP_Y",this.npc.OBJECT_MAP_Y);
            break;

        }
    }

    public reset(npc : NPC)
    {
        this.npc = npc;
        this.mustUpdate = true;
        this.created = false;
        for(let i = 0; i < Object.keys(this.npc).length; i++)
        {
            this.valuesToUpdate[Object.keys(this.npc)[i]] = true;
        }
    }

    public update()
    {
        if((this.emulator.memoryRead(this.slot) == 0 && this.created == true) || this.mustDelete)
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
            if(this.valuesToUpdate[Object.keys(this.npc)[i]] == true)
            {
                this.emulator.memoryWrite(cell, this.npc[Object.keys(this.npc)[i]]);
                this.valuesToUpdate[Object.keys(this.npc)[i]] = false;
            }
            else 
                this.npc[Object.keys(this.npc)[i]] = this.emulator.memoryRead(cell);
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
    //private npcsAdded : Array<NPCWatcher>;
    public npcsAdded : Array<NPCWatcher>;

    constructor()
    {
        super();
        this.npcsToAdd = [];
        this.npcsAdded = [];
        (<any>window).GBPluginScheduler.GetInstance().registerPluginRun(this);        
    }

    public run(emulator : any) : void 
    {
        if(this.canRun() == false)
            return;

        for(let i = 0; i < this.npcsAdded.length;)
        {
            if(this.npcsAdded[i].update() == false)
            {
                if(this.npcsAdded[i].mustDelete == false)
                    this.npcsToAdd.push(this.npcsAdded[i].npc);
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
(<any>window).NPCInjector = new GBPluginNPCInjector();