/// <reference path="GBPluginScheduler.ts" />
/// <reference path="GBPluginNetwork.ts" />
/// <reference path="OnlineManager.ts" />

class GBPluginNetworkSender extends GBPluginNetwork
{

    constructor()
    {
        super();
        (<any>window).GBPluginScheduler.GetInstance().registerPluginRun(this);        
        this.connection.onicecandidate = (event) => {this.OnIceCandidate(event)};
        this.channel = this.connection.createDataChannel('PlayerExchange', {
        });
        this.channel.onmessage = (e) => { this.onMessage(e); };
        this.channel.onopen = (e) => { this.onOpen(e); };
        this.channel.onclose =(e) => { this.onClose(e); };
        this.connection.createOffer().then((offer) => { 
            this.connection.setLocalDescription(offer);
            this.localDescription = JSON.stringify(offer).replace(/\\/g, "\\\\");
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
        this.candidates = JSON.stringify(this.iceCandidates).replace(/\\/g, "\\\\");
        console.log("window.Client.setCandidates(JSON.parse('" + JSON.stringify(this.iceCandidates).replace(/\\/g, "\\\\") + "'));")
        
    }

    private OnIceCandidate(event)
    {
        if (event.candidate) {
            this.iceCandidates.push(event.candidate);
        }
    }
}

(<any>window).Server = new GBPluginNetworkSender();