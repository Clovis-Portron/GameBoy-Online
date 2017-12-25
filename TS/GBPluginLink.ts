/// <reference path="GBPluginScheduler.ts" />
class GBPluginLink extends GBPlugin
{
    private static LINKSTAT = 0xFF02;
    private static LINKDATA = 0xFF01;
    private static EVENT = 0xFF0F;

    private transfering : boolean = false;
    private master : boolean = false;
    private buffer : number = null;
    private inputBuffer : number = 0x02;
    private receivedData : number = 0x02;
    private transferCounter : number = 0;
    private lastShift : number = null;

    constructor()
    {
        super();
        this.counterInterval = 0;
    }

    public link(emulator : Emulator) : void 
    {
        if(this.transfering == true && this.lastShift != null && Date.now() - this.lastShift > 1000)
        {
            console.log("Reseting transfer.");
            this.transfering = false;
        }
        if(this.transfering == false)
            this.initTransfer(emulator);
        let bit = (this.inputBuffer & 0x80) >> 7;
        this.buffer = ((this.buffer << 1) & 0xFE) | bit;
        this.inputBuffer = this.inputBuffer << 1;
        emulator.memoryWrite(GBPluginLink.LINKDATA, this.buffer);
        console.log(this.buffer.toString(16)+" "+this.transferCounter+"/7");
        this.transferCounter++;
        this.lastShift = Date.now();
        if(this.transferCounter >= 8)
        {
            this.endTransfer(emulator);
        }
    }


    public transfer(emulator : Emulator)
    {

        console.log("Sending "+emulator.memoryRead(GBPluginLink.LINKDATA).toString(16)+" as "+this.master);
        
        //TODO: faire la logique de l'envoi/reception
        if(this.master == false)
        {
            this.receivedData = 0x01;
        }
        if(this.buffer == 0x01)
        {
            this.receivedData = 0x02;
        }

        console.log("Received "+this.receivedData.toString(16));
    }

    public initTransfer(emulator : Emulator) : void 
    {
        let data : number = emulator.memoryRead(GBPluginLink.LINKDATA);
        this.buffer = data;

        let role = "master";
        if(this.master == false)
            role = "slave";

        this.transfer(emulator);        

        this.inputBuffer = this.receivedData; 
        this.transferCounter = 0; 
        this.transfering = true;     
    }

    public endTransfer(emulator : Emulator) : void 
    {
        this.transfering = false;
        console.log("Ending transfer with "+this.buffer.toString(16));
    }

}
let link = new GBPluginLink();
GBPluginScheduler.GetInstance().registerPluginLink(link);

