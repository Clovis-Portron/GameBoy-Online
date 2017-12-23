/// <reference path="GBPluginScheduler.ts" />
class GBPluginLink extends GBPlugin
{
    private static LINKSTAT = 0xFF02;
    private static LINKDATA = 0xFF01;
    private static EVENT = 0xFF0F;

    private sendBuffer : number = null;
    private receiveBuffer : number = 0b10101010;

    constructor()
    {
        super();
        this.counterInterval = 0;
    }

    public run(emulator : Emulator) : void 
    {
        super.run(emulator);
        let communicating : boolean = (emulator.memoryRead(GBPluginLink.LINKSTAT) & 0b00000001) == 0b00000001;
        let data : number = emulator.memoryRead(GBPluginLink.LINKDATA);
        if(communicating == false)
            return;
        console.log("Stat: "+emulator.memoryRead(GBPluginLink.LINKSTAT).toString(2));
        console.log("Data: "+data.toString(2));
        this.sendBuffer = data;
        emulator.memoryWrite(GBPluginLink.LINKDATA, this.receiveBuffer);
        //TODO: faire la logique de l'envoi/reception

        let events : number = emulator.memoryRead(GBPluginLink.EVENT) | 0b00010000;
        emulator.memoryWrite(GBPluginLink.EVENT, events);
    }
}

GBPluginScheduler.GetInstance().registerPluginRun(new GBPluginLink());

