/// <reference path="GBPluginScheduler.ts" />
/// <reference path="GBPluginNPCInjector.ts" />

abstract class GBPluginNetwork extends GBPlugin
{
    protected connection : any;
    protected channel : any;
    protected iceCandidates : Array<RTCIceCandidate>;
    protected connected :  boolean = false;
	protected emulator : any = null;
    protected messages : Array<any> = null;

    constructor()
    {
        super();
        this.messages = [];
        this.counterInterval = 10;
        this.iceCandidates = [];
        this.connection = new RTCPeerConnection({
            "iceServers": [{
                "urls" : "stun:stun.l.google.com:19302",
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
        

		var mapIndex = this.emulator.memoryRead(0xDCB6);
		var mapBank = this.emulator.memoryRead(0xDCB5);					
		
        let clone : NPC = null;
        if((<any>window).NPCInjector.npcsAdded.length <= 0)
        {
			if(other.MAP_INDEX != mapIndex || other.MAP_BANK != mapBank) return true;
            clone = (<any>window).NPCInfo.npcs[0];
            clone.OBJECT_MAP_X = other.OBJECT_MAP_X;
            clone.OBJECT_MAP_Y = other.OBJECT_MAP_Y;
            clone.OBJECT_NEXT_MAP_X = other.OBJECT_NEXT_MAP_X;
            clone.OBJECT_NEXT_MAP_Y = other.OBJECT_NEXT_MAP_Y;
            clone.OBJECT_PALETTE = 2;
            clone.OBJECT_SPRITE_X = other.OBJECT_SPRITE_X;
            clone.OBJECT_SPRITE_Y = other.OBJECT_SPRITE_Y;
            clone.OBJECT_FACING = other.OBJECT_FACING;
            clone.OBJECT_FACING_STEP = other.OBJECT_FACING_STEP;
            (<any>window).NPCInjector.registerNPC(clone);
        }
        else 
        {
            clone = (<any>window).NPCInjector.npcsAdded[0].npc;
			if(other.MAP_INDEX != mapIndex || other.MAP_BANK != mapBank)
			{
				(<any>window).NPCInjector.npcsAdded[0].mustDelete = true;
				return true;
			}
    
            if(clone.OBJECT_DIRECTION_WALKING != 0xFF)
                return false;
            if(clone.OBJECT_SPRITE_X % 16 != 0)
            {
                (<any>window).NPCInjector.npcsAdded[0].set("OBJECT_SPRITE_X", Math.round(clone.OBJECT_SPRITE_X / 16) * 16);
            }
            if(clone.OBJECT_SPRITE_Y % 16 != 0)
            {
                (<any>window).NPCInjector.npcsAdded[0].set("OBJECT_SPRITE_Y", Math.round(clone.OBJECT_SPRITE_Y / 16) * 16);
            }
            
            if(other.OBJECT_MAP_X > clone.OBJECT_MAP_X)
            {
                (<any>window).NPCInjector.npcsAdded[0].walk(NPCWatcher.DIRECTION.RIGHT);
            }
            else if(other.OBJECT_MAP_X < clone.OBJECT_MAP_X)
            {
                (<any>window).NPCInjector.npcsAdded[0].walk(NPCWatcher.DIRECTION.LEFT);
            }
            else if(other.OBJECT_MAP_Y > clone.OBJECT_MAP_Y)
            {
                (<any>window).NPCInjector.npcsAdded[0].walk(NPCWatcher.DIRECTION.DOWN);
            }
            else if(other.OBJECT_MAP_Y < clone.OBJECT_MAP_Y)
            {
                (<any>window).NPCInjector.npcsAdded[0].walk(NPCWatcher.DIRECTION.UP);
            }

            if(other.OBJECT_MAP_X == clone.OBJECT_MAP_X)
            {
                (<any>window).NPCInjector.npcsAdded[0].set("OBJECT_SPRITE_X", other.OBJECT_SPRITE_X);
            }
            if(other.OBJECT_MAP_Y == clone.OBJECT_MAP_Y)
            {
                (<any>window).NPCInjector.npcsAdded[0].set("OBJECT_SPRITE_Y", other.OBJECT_SPRITE_Y);
            }
        
        }
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

        if(this.messages.length > 0)
        {
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
