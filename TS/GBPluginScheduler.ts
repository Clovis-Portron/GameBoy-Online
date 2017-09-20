class GBPluginScheduler
{
    private static Instance : GBPluginScheduler = new GBPluginScheduler();

    public static GetInstance() : GBPluginScheduler
    {
        return this.Instance;
    }


    private pluginsRun : Array<GBPlugin>;
    private pluginsStart : Array<GBPlugin>;
    constructor()
    {
        this.pluginsRun = [];
        this.pluginsStart = [];
    }

    public run(emulator : any) : void 
    {

        this.pluginsRun.forEach(function(plugin){ 
            console.log("Running "+(<any>plugin.constructor).name);
            plugin.run(emulator);
        });
    }

    public start(emulator : any) : void 
    {
        console.log("START");
        this.pluginsStart.forEach(function(plugin){ 
            console.log("Running "+(<any>plugin.constructor).name);
            plugin.run(emulator);
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
}

// Exportation
(<any>window).GBPluginScheduler = GBPluginScheduler; 