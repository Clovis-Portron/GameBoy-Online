/// <reference path="GBPluginScheduler.ts" />
/// <reference path="GBPluginNetwork.ts" />

class GBPluginNetworkReceiver extends GBPluginNetwork
{
    constructor()
    {
        super();
        (<any>window).GBPluginScheduler.GetInstance().registerPluginRun(this);
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
}

(<any>window).Client = new GBPluginNetworkReceiver();