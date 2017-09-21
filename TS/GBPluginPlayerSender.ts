
class GBPluginPlayerSender extends GBPlugin
{
    private socket : webkitRTCPeerConnection;

    constructor()
    {
        super();
        (<any>window).GBPluginScheduler.GetInstance().register(this);
        let conf : RTCConfiguration = {

        };
        this.socket = new RTCPeerConnection(null);
    
        this.socket.onicecandidate = function (evt) {
            console.log(evt);
        };
        console.log("STARTING NETWORK");
    }

    public run(emulator : any) : void 
    {
        if(this.canRun() == false)
            return;
    }
}

new GBPluginPlayerSender();