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
    GBPlugin.prototype.run = function (emulator) {
        if (this.canRun() == false)
            return;
    };
    return GBPlugin;
})();
var GBPluginScheduler = (function () {
    function GBPluginScheduler() {
        this.pluginsRun = [];
        this.pluginsStart = [];
    }
    GBPluginScheduler.GetInstance = function () {
        return this.Instance;
    };
    GBPluginScheduler.prototype.run = function (emulator) {
        this.pluginsRun.forEach(function (plugin) {
            console.log("Running " + plugin.constructor.name);
            plugin.run(emulator);
        });
    };
    GBPluginScheduler.prototype.start = function (emulator) {
        console.log("START");
        this.pluginsStart.forEach(function (plugin) {
            console.log("Running " + plugin.constructor.name);
            plugin.run(emulator);
        });
    };
    GBPluginScheduler.prototype.registerPluginRun = function (plugin) {
        this.pluginsRun.push(plugin);
    };
    GBPluginScheduler.prototype.registerPluginStart = function (plugin) {
        this.pluginsStart.push(plugin);
    };
    GBPluginScheduler.Instance = new GBPluginScheduler();
    return GBPluginScheduler;
})();
// Exportation
window.GBPluginScheduler = GBPluginScheduler;
/// <reference path="GBPluginScheduler.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var GBPluginNPCInjector = (function (_super) {
    __extends(GBPluginNPCInjector, _super);
    function GBPluginNPCInjector() {
        _super.call(this);
    }
    GBPluginNPCInjector.prototype.run = function (emulator) {
        if (this.canRun() == false)
            return;
        var freeSlot = this.searchFreeNPCSlot(emulator);
        if (freeSlot == null)
            return;
        console.log(freeSlot);
    };
    GBPluginNPCInjector.prototype.searchFreeNPCSlot = function (emulator) {
        var current = GBPluginNPCInjector.NPCBLOCKSTART;
        while (current != 0x0 && current < 0xD720) {
            current = current + 0x28;
        }
        if (current < 0xD720)
            return current;
        else
            return null;
    };
    GBPluginNPCInjector.NPCBLOCKSTART = 0xD4D6;
    return GBPluginNPCInjector;
})(GBPlugin);
// Injection
window.GBPluginScheduler.GetInstance().registerPluginRun(new GBPluginNPCInjector());
//# sourceMappingURL=plugins.js.map