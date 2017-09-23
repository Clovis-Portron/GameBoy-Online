/// <reference path="GBPluginScheduler.ts" />
/// <reference path="NPC.ts" />

abstract class GBPluginNetwork extends GBPlugin
{
    protected connection : any;
    protected channel : any;
    protected iceCandidates : Array<RTCIceCandidate>;
    protected connected :  boolean = false;
	protected emulator : any = null;
    protected messages : Array<any> = null;

    private last_sign : string  = null;

    private local_clone : NPCWatcher = null;

    constructor()
    {
        super();
        this.messages = [];
        this.counterInterval = 0;
        this.iceCandidates = [];
        this.connection = new RTCPeerConnection({
           "iceServers": [{
               "urls" :"stun:stun.l.google.com:19302",
            }]
        });
    }

    protected onOpen(e)
    {
        console.log("New Connection");
        this.connected = true;
    }

    protected onClose(e)
    {
        console.log("Close Connection");
        this.connected = false;
        
    }

    protected onError(e)
    {
        console.log(e);
        this.connected = false;
    }

    protected onMessage(e)
    {
        this.messages.push(e);
    }

    protected executeMessage(e) : boolean
    {
        //console.log(JSON.parse(e.data));
        let other : NPC = JSON.parse(e.data);
        if((<any>window).NPCInfo.npcs.length < 1)
            return true;
		
		if(this.emulator == null) return true;
        
        let sign = other.OBJECT_MAP_X+""+other.OBJECT_MAP_Y;

		var mapIndex = this.emulator.memoryRead(0xDCB6);
		var mapBank = this.emulator.memoryRead(0xDCB5);					

        if(this.local_clone == null)
        {
            if(other.MAP_INDEX != mapIndex || other.MAP_BANK != mapBank) return true;
            
            this.local_clone = new NPCWatcher(this.emulator, 0xD5C6, (<any>window).NPCInfo.npcs[0]);
            this.local_clone.set("OBJECT_MAP_X", other.OBJECT_MAP_X);
            this.local_clone.set("OBJECT_MAP_Y", other.OBJECT_MAP_Y);
            this.local_clone.set("OBJECT_NEXT_MAP_X", other.OBJECT_NEXT_MAP_X);
            this.local_clone.set("OBJECT_NEXT_MAP_Y", other.OBJECT_NEXT_MAP_Y);
            this.local_clone.set("OBJECT_INIT_X", other.OBJECT_MAP_X);
            this.local_clone.set("OBJECT_INIT_Y", other.OBJECT_MAP_Y);
            this.local_clone.set("OBJECT_PALETTE", 1);
            this.local_clone.set("OBJECT_SPRITE_X", other.OBJECT_SPRITE_X);
            this.local_clone.set("OBJECT_SPRITE_Y", other.OBJECT_SPRITE_Y);
            this.local_clone.set("OBJECT_FACING", other.OBJECT_FACING);
            this.local_clone.set("OBJECT_FACING_STEP", other.OBJECT_FACING_STEP);
            this.local_clone.set("OBJECT_SPRITE", 0x3C);
            this.local_clone.set("OBJECT_SPRITE_TILE", 0x00);
            this.local_clone.set("OBJECT_MOVEMENTTYPE",0x00);
            this.local_clone.set("OBJECT_STEP_DURATION",0);
            this.local_clone.set("OBJECT_NEXT_TILE",0);
            this.local_clone.set("OBJECT_STEP_TYPE",3);
            this.local_clone.set("OBJECT_MAP_OBJECT_INDEX", 0x03);
            this.local_clone.set("OBJECT_RADIUS",0);
            this.local_clone.set("OBJECT_STEP_FRAME",0);
            this.local_clone.set("OBJECT_MOVEMENT_BYTE_INDEX", 0);
            this.local_clone.set("OBJECT_DIRECTION_WALKING",0xFF);        
            this.local_clone.set("OBJECT_STEP_TYPE",0x03);   
            this.local_clone.set("OBJECT_STEP_DURATION",0);
            this.local_clone.update();
            this.local_clone.resetSprite();
            
        }
        else 
        {        
			if(other.MAP_INDEX != mapIndex || other.MAP_BANK != mapBank)
			{
                this.local_clone.free();
				this.local_clone = null;
				return true;
			}
            if(this.local_clone.npc.OBJECT_DIRECTION_WALKING != 0xFF)
            {
                if(this.last_sign === sign)
                    return true;
                else 
                    return false;
                
            }
            if(other.OBJECT_MAP_X > this.local_clone.npc.OBJECT_MAP_X)
            {
                this.local_clone.resetSprite();
                this.local_clone.walk(NPCWatcher.DIRECTION.RIGHT);
            }
            else if(other.OBJECT_MAP_X < this.local_clone.npc.OBJECT_MAP_X)
            {
                this.local_clone.resetSprite();
                
                this.local_clone.walk(NPCWatcher.DIRECTION.LEFT);
            }
            else if(other.OBJECT_MAP_Y > this.local_clone.npc.OBJECT_MAP_Y)
            {
                this.local_clone.resetSprite();
                
                this.local_clone.walk(NPCWatcher.DIRECTION.DOWN);
            }
            else if(other.OBJECT_MAP_Y < this.local_clone.npc.OBJECT_MAP_Y)
            {
                this.local_clone.resetSprite();
                
                this.local_clone.walk(NPCWatcher.DIRECTION.UP);
            }
        }
        this.last_sign = sign;
        return true;
    }

    public run(emulator : any) : void 
    {
		this.emulator = emulator;        
        if(this.canRun() == false)
            return;
        if(this.connected == false)
        {
            return;
        }
        if(this.local_clone != null)
            this.local_clone.update();

        if(this.messages.length > 0)
        {
            if(this.messages.length > 1)
                this.messages = [this.messages[this.messages.length - 1]];
            if(this.executeMessage(this.messages[0]) == true)
            {
                this.messages.shift();
            }
        }

        if((<any>window).NPCInfo.npcs <= 0)
            return;
        let player : NPC = (<any>window).NPCInfo.npcs[0];
        player.MAP_INDEX = this.emulator.memoryRead(0xDCB6);
        player.MAP_BANK = this.emulator.memoryRead(0xDCB5);        
        this.channel.send(JSON.stringify(player));
    }
}
