/// <reference path="GBPluginScheduler.ts" />
/// <reference path="GBPluginNPCInjector.ts" />

class GBPluginPlayerSender extends GBPlugin
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
        this.dataChannel = this.connection.createDataChannel("SendTrainer");

        this.connection.onicecandidate = function (evt) {
            this.dataChannel.send(JSON.stringify({ "candidate": evt.candidate }));
        };

        this.dataChannel.onerror = function (error) {
            console.log("Data Channel Error:", error);
          };
          
          this.dataChannel.onmessage = function (event) {
            console.log("Got Data Channel Message:", event.data);
          };
          
          this.dataChannel.onopen = () => {
            this.dataChannel.send("Hello World!");
          };
          
          this.dataChannel.onclose = function () {
            console.log("The Data Channel is Closed");
          };


        console.log("STARTING NETWORK");
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

new GBPluginPlayerSender();