/// <reference path="GBPluginScheduler.ts" />
/// <reference path="GBPluginNPCInjector.ts" />

class GBPluginPlayerReceiver extends GBPlugin
{
    private connection : any;
    private channel : any;
    private iceCandidates : Array<RTCIceCandidate>;
    private connected :  boolean = false;

    constructor()
    {
        super();
        (<any>window).GBPluginScheduler.GetInstance().registerPluginRun(this);
        this.iceCandidates = [];
        this.connection = new RTCPeerConnection({
            "iceServers": [{
                "urls" : "stun:stun.l.google.com:19302",
            }]
        });
        this.connection.onicecandidate = (event) => {this.onIceCandidate(event)};
        this.connection.ondatachannel = (channel) => { this.onDataChannel(channel);};
        console.log("Waiting for offer");
    }

    public setCandidates(candidates) {
        for (var i = 0; i < candidates.length; i++) {
            this.connection.addIceCandidate(new RTCIceCandidate(candidates[i]));
        }
        console.log("window.Server.setCandidates(JSON.parse('" + JSON.stringify(this.iceCandidates).replace(/\\/g, "\\\\") + "'));")
        
    }

    public receiveOffer(offerSdp) {
    
        this.connection.setRemoteDescription(offerSdp);
        this.connection.createAnswer().then((answer) => { 
            this.connection.setLocalDescription(answer);
            console.log('window.Server.setRemoteDescription(new RTCSessionDescription(JSON.parse(\'' + JSON.stringify(answer).replace(/\\/g, "\\\\") + '\')));');
        }).catch(function(error){});
    }

    private onIceCandidate(event)
    {
        if (event.candidate) {
            this.iceCandidates.push(event.candidate);
        }
    }

    private onDataChannel(event)
    {
        this.channel = event.channel;
        this.channel.onmessage = (e) => { this.onMessage(e); };
        this.channel.onopen = (e) => { this.onOpen(e); };
        this.channel.onclose =(e) => { this.onClose(e); };
    }

    private onOpen(e)
    {
        console.log("New Connection");
        this.connected = true;
    }

    private onClose(e)
    {
        console.log("Close Connection");
        this.connected = false;
        
    }


    private onError(e)
    {
        console.log(e);
        this.connected = false;
    }

    private onMessage(e)
    {
        //console.log(JSON.parse(e.data));
        let other : NPC = JSON.parse(e.data);
        if((<any>window).NPCInfo.npcs.length < 1)
            return;
        let clone : NPC = null;
        if((<any>window).NPCInjector.npcsAdded.length <= 0)
        {
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
            clone.OBJECT_MAP_X = other.OBJECT_MAP_X;
            clone.OBJECT_MAP_Y = other.OBJECT_MAP_Y;
            clone.OBJECT_NEXT_MAP_X = other.OBJECT_NEXT_MAP_X;
            clone.OBJECT_NEXT_MAP_Y = other.OBJECT_NEXT_MAP_Y;
            clone.OBJECT_PALETTE = 2;
            clone.OBJECT_SPRITE_X = other.OBJECT_SPRITE_X;
            clone.OBJECT_SPRITE_Y = other.OBJECT_SPRITE_Y;
            clone.OBJECT_FACING = other.OBJECT_FACING;
            clone.OBJECT_FACING_STEP = other.OBJECT_FACING_STEP;
            (<any>window).NPCInjector.npcsAdded[0].reset(clone);
        }
        
    }




    public run(emulator : any) : void 
    {
        if(this.canRun() == false)
            return;
        if(this.connected == false)
        {
            return;
        }
        if((<any>window).NPCInfo.npcs <= 0)
            return;
        let player : NPC = (<any>window).NPCInfo.npcs[0];
        this.channel.send(JSON.stringify(player));
    }
}

(<any>window).Client = new GBPluginPlayerReceiver();