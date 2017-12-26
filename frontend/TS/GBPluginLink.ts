/// <reference path="GBPluginScheduler.ts" />
/// <reference path="GBPluginNetworkSender.ts" />
/// <reference path="GBPluginNetworkReceiver.ts" />

class GBPluginLink extends GBPlugin
{
    private static LINKSTAT = 0xFF02;
    private static LINKDATA = 0xFF01;
    private static EVENT = 0xFF0F;

    private inputBuffer : number = null;
    private outputBuffer : number = null;
    private lastState = false;
    private transfering = false;
    private emulator : Emulator = null;
    private timeout : any = null;
    private waitForCable : boolean = false;

    constructor()
    {
        super();
        this.counterInterval = 0;
        let self = this;
        (<any>window).Server.registerCallback("LINK", function(e : Message){
            self.receive(e);
        });
        (<any>window).Client.registerCallback("LINK", function(e : Message){
            self.receive(e);
        });
    }

    private cable()
    {
        //console.log("CABLE");
        this.waitForCable = false;
    }

    private cancel()
    {
        //console.log("TIMEOUT");
        this.outputBuffer = null;
        //this.inputBuffer = null;
        this.emulator.memoryWrite(GBPluginLink.LINKDATA, 0xFF);
        this.emulator.stopEmulator = 1;
        this.emulator.CPUStopped = false; 
        this.waitForCable = true;
        this.timeout =  setTimeout(() => {
            this.cable();
        }, 5000);
    }

    private receive(e : Message)
    {
        //console.log("input buffer loaded with "+e.data.toString(16));
        this.inputBuffer = e.data;
        clearTimeout(this.timeout);
        this.timeout = null;
        this.cable();
        this.swap();        
    }

    private send()
    {
        this.outputBuffer = this.emulator.memoryRead(GBPluginLink.LINKDATA);
        //console.log("Output buffer loaded with "+this.outputBuffer.toString(16));
        (<any>window).Server.sendMessage({
            "type" : "LINK", 
            "data" : this.outputBuffer
        });
        (<any>window).Client.sendMessage({
            "type" : "LINK", 
            "data" : this.outputBuffer
        });
        this.emulator.stopEmulator |= 2;
        this.emulator.CPUStopped = true;
        this.timeout = setTimeout(() => {
            this.cancel();   
        }, 5000);
        this.swap();
    }

    private swap()
    {
        if(this.outputBuffer != null && this.inputBuffer != null)
        {
            this.emulator.memoryWrite(GBPluginLink.LINKDATA, this.inputBuffer);
            this.outputBuffer = null;
            this.inputBuffer = null;
            //console.log("SWAP = "+this.emulator.memoryRead(GBPluginLink.LINKDATA).toString(16));
            this.emulator.stopEmulator = 1;
            this.emulator.CPUStopped = false;   
            clearTimeout(this.timeout);
            this.timeout = null;     
        }
    }



    public link(emulator : Emulator) : void 
    {
        this.emulator = emulator;
        let state = (emulator.memoryRead(GBPluginLink.LINKSTAT) & 0x80) == 0x80;
        if(state == true && this.lastState == false)
        {
            if(this.waitForCable)
            {
                this.emulator.memoryWrite(GBPluginLink.LINKDATA, 0xFF);
                return;
            }
            //console.log("Start of exchange");
            this.send();
            this.transfering = true;
        }
        else if(state == false && this.lastState == true)
        {
            //console.log("End of exchange");
            this.transfering = false;
        }
        this.lastState = state;

       /* console.log(emulator.memoryRead(GBPluginLink.LINKSTAT).toString(16));
        console.log(emulator.memoryRead(GBPluginLink.LINKDATA).toString(16));*/
        
        /*if(emulator.serialTimer > this.lastState)
        {
            this.transfer(emulator);
        }
        //let bit = (this.inputBuffer & 0x80) >> 7;
        //emulator.memoryWrite(GBPluginLink.LINKDATA, (((emulator.memoryRead(GBPluginLink.LINKDATA) << 1) & 0xFE) | bit));
        emulator.memoryWrite(GBPluginLink.LINKDATA, this.inputBuffer);
        console.log(emulator.memoryRead(GBPluginLink.LINKDATA).toString(16));
        this.lastState = emulator.serialTimer;*/
        
    }

}
let link = new GBPluginLink();
GBPluginScheduler.GetInstance().registerPluginLink(link);

