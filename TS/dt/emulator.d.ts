interface Emulator
{
    CPUStopped : boolean;
    stopEmulator : number;
    serialTimer : number;
    memoryRead(slot : number) : number;
    memoryWrite(slot : number, value : number) : void;
}