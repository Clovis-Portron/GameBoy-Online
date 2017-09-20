class GBPluginScheduler
{
    private static Instance : GBPluginScheduler = new GBPluginScheduler();

    public static GetInstance() : GBPluginScheduler
    {
        return this.Instance;
    }


    private plugins : Array<GBPlugin>;

    constructor()
    {
        this.plugins = [];
    }

    public run() : void 
    {
        this.plugins.forEach(function(plugin){ 
            plugin.run();
        });
    }

    public registerPlugin(plugin : GBPlugin) : void 
    {
        this.plugins.push(plugin);
    }
}

// Exportation
(<any>window).GBPluginScheduler = GBPluginScheduler; 