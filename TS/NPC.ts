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

    private static NPCBLOCKSTART = 0xD4D6;
    
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
        this.npc = new NPC();
        this.slot = slot;
        this.emulator = emulator;
        this.mustUpdate = true;
        for(let i = 0; i < Object.keys(this.npc).length; i++)
        {
            this.valuesToUpdate[Object.keys(this.npc)[i]] = true;
            this.npc[Object.keys(this.npc)[i]] = npc[Object.keys(this.npc)[i]];
        }
    }

    public set(property : string, value : number)
    {
        this.npc[property] = value;
        this.valuesToUpdate[property] = true;
        this.mustUpdate = true;
    }

    public stop()
    {
        this.set("OBJECT_STEP_FRAME",0);
        this.set("OBJECT_MOVEMENT_BYTE_INDEX", 0);
        this.set("OBJECT_DIRECTION_WALKING",0xFF);        
        this.set("OBJECT_STEP_TYPE",0x03);   
        this.set("OBJECT_STEP_DURATION",0);
    }

    public resetSprite()
    {
        let y = this.npc.OBJECT_MAP_Y;
        y = (256+ y - this.emulator.memoryRead(0xDCB7))%256;
        y = (256 + y & 0x0F)%256;
        y = (256+ y << 4)%256; // bon sens ? 
        y = (256 + y -  this.emulator.memoryRead(0xD14D))%256;
        y = (256 + y) % 256;
        this.set("OBJECT_SPRITE_Y", y);

        let x = this.npc.OBJECT_MAP_X;
        x = (256+ x - this.emulator.memoryRead(0xDCB8))%256;
        x = (256 + x & 0x0F)%256;
        x = (256+ x << 4)%256; // bon sens ? 
        x = (256 + x -  this.emulator.memoryRead(0xD14C))%256;
        x = (256 + x) % 256;
        this.set("OBJECT_SPRITE_X", x);

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

    public free()
    {
        let cell = this.slot;        
        for(let i = 0; i < Object.keys(this.npc).length; i++)
        {
            this.emulator.memoryWrite(cell, 0);
            cell = cell + 0x01;    
        }   
    }

    public update()
    {
        /*if((this.emulator.memoryRead(this.slot) == 0 && this.created == true) || this.mustDelete)
        {
            // Il a été supprimé, on le réalloue
            return false;
        }
        if(this.created == false)
            this.created = true;
		*/
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
            cell = cell + 0x01;    
        }
        return true;
    }
}
