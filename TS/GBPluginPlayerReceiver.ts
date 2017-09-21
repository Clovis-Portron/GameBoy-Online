/// <reference path="GBPluginScheduler.ts" />
/// <reference path="GBPluginNPCInjector.ts" />

class GBPluginPlayerReceiver extends GBPlugin
{
    private connection : any;
    private dataChannel : any;

    constructor()
    {
        super();
        (<any>window).GBPluginScheduler.GetInstance().registerPluginRun(this);
        let conf : RTCConfiguration = {
		
        };
        this.connection = new RTCPeerConnection(null);
		this.connection.ondatachannel = this.channelCallback;
		this.connection.onicecandidate = function(e)
		{
			
		}

        console.log("STARTING NETWORK");
    }

	private channelCallback()
	{
		
	}

    private onError()
    {

    }

    private onOpen()
    {

    }

    private onClose()
    {

    }

    private onMessage()
    {

    }




    public run(emulator : any) : void 
    {
        if(this.canRun() == false)
            return;
    }
}

new GBPluginPlayerReceiver();