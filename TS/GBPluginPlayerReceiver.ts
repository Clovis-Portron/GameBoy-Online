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
        //console.log(e);
        //return;
        console.log(JSON.parse(e.data));        
        let player : NPC = JSON.parse(e.data);
        if((<any>window).NPCInjector.npcsAdded.length <= 0)
        {
            (<any>window).NPCInjector.registerNPC(player);
        }
        else 
        {
            (<any>window).NPCInjector.npcsAdded[0].reset(player);
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