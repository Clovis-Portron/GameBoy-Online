/// <reference path="GBPluginScheduler.ts" />
/// <reference path="GBPluginNPCInjector.ts" />

class GBPluginPlayerSender extends GBPlugin
{
    private connection : any;
    private channel : any;
    private iceCandidates : Array<RTCIceCandidate>;
    private connected : boolean = false;

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
        this.connection.onicecandidate = (event) => {this.OnIceCandidate(event)};
        this.channel = this.connection.createDataChannel('PlayerExchange', {
        });
        this.channel.onmessage = (e) => { this.onMessage(e); };
        this.channel.onopen = (e) => { this.onOpen(e); };
        this.channel.onclose =(e) => { this.onClose(e); };
        this.connection.createOffer().then((offer) => { 
            this.connection.setLocalDescription(offer);
            console.log('window.Client.receiveOffer(new RTCSessionDescription(JSON.parse(\'' + JSON.stringify(offer).replace(/\\/g, "\\\\") + '\')));')
        }).catch(function(error){ 

        });
        console.log("STARTING NETWORK");
    }

    public setCandidates(candidates) {
        for (var i = 0; i < candidates.length; i++) {
            this.connection.addIceCandidate(new RTCIceCandidate(candidates[i]));
        }
    }

    public setRemoteDescription(desc) {
        this.connection.setRemoteDescription(desc);
        console.log("window.Client.setCandidates(JSON.parse('" + JSON.stringify(this.iceCandidates).replace(/\\/g, "\\\\") + "'));")
        
    }

    private OnIceCandidate(event)
    {
        if (event.candidate) {
            this.iceCandidates.push(event.candidate);
        }
    }

    private onOpen(e)
    {
        this.connected = true;
    }

    private onClose(e)
    {
        this.connected = false;
    }


    private onError(e)
    {
        this.connected = false;
    }

    private onMessage(e)
    {
        console.log(JSON.parse(e.data));
        
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

(<any>window).Server = new GBPluginPlayerSender();