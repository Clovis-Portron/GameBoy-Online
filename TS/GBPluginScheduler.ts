class GBPluginScheduler
{
    private static Instance : GBPluginScheduler = new GBPluginScheduler();

    public static GetInstance() : GBPluginScheduler
    {
        return this.Instance;
    }


    private pluginsRun : Array<GBPlugin>;
    private pluginsStart : Array<GBPlugin>;
    private pluginsLink : Array<GBPlugin>;
    constructor()
    {
        this.pluginsRun = [];
        this.pluginsStart = [];
        this.pluginsLink = [];
    }

    public run(emulator : any) : void 
    {

        this.pluginsRun.forEach(function(plugin){ 
            //console.log("Running "+(<any>plugin.constructor).name);
            plugin.run(emulator);
        });
    }

    public start(emulator : any) : void 
    {
        console.log("START");
        this.pluginsStart.forEach(function(plugin){ 
            console.log("Running "+(<any>plugin.constructor).name);
            plugin.start(emulator);
        }); 
    }

    public link(emulator : Emulator) : void 
    {
        this.pluginsLink.forEach(function(plugin){
            plugin.link(emulator);
        });
    }

    public registerPluginRun(plugin : GBPlugin) : void 
    {
        this.pluginsRun.push(plugin);
    }

    public registerPluginStart(plugin : GBPlugin) : void 
    {
        this.pluginsStart.push(plugin);
    }

    public registerPluginLink(plugin : GBPlugin) : void 
    {
        this.pluginsLink.push(plugin);
    }
}

// Exportation
(<any>window).GBPluginScheduler = GBPluginScheduler; 