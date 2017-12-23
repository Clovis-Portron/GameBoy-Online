interface Emulator
{
    memoryRead(slot : number) : number;
    memoryWrite(slot : number, value : number) : void;
}