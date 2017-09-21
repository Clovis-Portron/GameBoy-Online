/// <reference path="GBPluginScheduler.ts" />
/// <reference path="GBPluginNPCInjector.ts" />

class GBPluginPlayerSender extends GBPlugin
{
    private connection : RTCPeerConnection;
    private channel : any;
    private iceCandidates : Array<RTCIceCandidate>;

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

    private OnIceCandidate(event)
    {
        if (event.candidate) {
            this.iceCandidates.push(event.candidate);
        }
    }

    private onOpen(e)
    {
        console.log("New Connection");
    }

    private onClose(e)
    {
        console.log("Close Connection");
        
    }


    private onError(e)
    {
        console.log(e);
    }

    private onMessage(e)
    {

    }




    public run(emulator : any) : void 
    {
        if(this.canRun() == false)
            return;
    }
}

(<any>window).Server = new GBPluginPlayerSender();