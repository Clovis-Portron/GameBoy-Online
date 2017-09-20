var GBPlugin = (function () {
    function GBPlugin() {
        this.counter = 0;
        this.counterInterval = 30;
    }
    GBPlugin.prototype.canRun = function () {
        this.counter++;
        if (this.counter > this.counterInterval) {
            this.counter = 0;
            return true;
        }
        return false;
    };
    GBPlugin.prototype.run = function () {
        if (this.canRun() == false)
            return;
    };
    return GBPlugin;
})();
var GBPluginScheduler = (function () {
    function GBPluginScheduler() {
        this.plugins = [];
    }
    GBPluginScheduler.GetInstance = function () {
        return this.Instance;
    };
    GBPluginScheduler.prototype.run = function () {
        console.log("ok");
        this.plugins.forEach(function (plugin) {
            plugin.run();
        });
    };
    GBPluginScheduler.prototype.registerPlugin = function (plugin) {
        this.plugins.push(plugin);
    };
    GBPluginScheduler.Instance = new GBPluginScheduler();
    return GBPluginScheduler;
})();
// Exportation
window.GBPluginScheduler = GBPluginScheduler;
//# sourceMappingURL=plugins.js.map