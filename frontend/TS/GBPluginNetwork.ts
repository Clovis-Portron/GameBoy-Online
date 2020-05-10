/// <reference path="GBPluginScheduler.ts" />

abstract class GBPluginNetwork extends GBPlugin
{
    protected connection : any;
    protected channel : any;
    protected iceCandidates : Array<RTCIceCandidate>;
    protected connected :  boolean = false;
	protected emulator : any = null;
    protected messages : Array<any> = null;
    protected callbacks : Array<Function> = null;

    private last_sign : string  = null;

    public candidates : string = null;
    public localDescription : string = null;

    constructor()
    {
        super();
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
        let msg : Message = JSON.parse(e.data);
        if(this.callbacks[msg.type] != null)
            this.callbacks[msg.type](msg);
    }

    public sendMessage(e : Message) :  void 
    {
        if(this.connected == false)
            return;
        this.channel.send(JSON.stringify(e));
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
    }
}
