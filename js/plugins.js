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
var NPC = (function () {
    function NPC() {
        this.u = 0x3C;
        this.script = 0x00;
        this.sprite = 0x60;
        this.initBehavior = 0x03;
        this.uu = 0x00;
        this.uuu = 0x00;
        this.color = 0x01;
        this.uuuu = 0x00;
        this.frame = 0x0C;
        this.behavior = 0x03;
        this.animationCounter = 0x00;
        this.uuuuu = 0x00;
        this.uuuuuu = 0x00;
        this.uuuuuuu = 0x00;
        this.uuuuuuuu = 0x00;
        this.boundsXstart = 0x0A;
        this.boundsYstart = 0x0A;
        this.boundsXend = 0x0A;
        this.boundsYend = 0x0A;
        this.boundsxuuu = 0x0A;
        this.boundsyuuu = 0x0A;
        this.uuuuuuuuuu = 0x00;
        this.spriteX = 0x0A;
        this.spriteY = 0x0A;
    }
    return NPC;
})();
var GBPluginNPCInjector = (function (_super) {
    __extends(GBPluginNPCInjector, _super);
    function GBPluginNPCInjector() {
        _super.call(this);
        this.npcsToAdd = [];
        this.npcsAdded = [];
    }
    GBPluginNPCInjector.prototype.run = function (emulator) {
        if (this.canRun() == false)
            return;
        if (this.npcsToAdd.length <= 0)
            return;
        var freeSlot = this.searchFreeNPCSlot(emulator);
        if (freeSlot == null)
            return;
        this.addNPC(emulator, freeSlot, this.npcsToAdd.shift());
    };
    GBPluginNPCInjector.prototype.searchFreeNPCSlot = function (emulator) {
        var current = GBPluginNPCInjector.NPCBLOCKSTART;
        while (emulator.memoryRead(current) != 0x0 && current < 0xD720) {
            current = current + 0x28;
        }
        if (current < 0xD720)
            return current;
        else
            return null;
    };
    GBPluginNPCInjector.prototype.addNPC = function (emulator, slot, npc) {
        var raw = [];
        for (var i = 0; i < Object.keys(npc).length; i++) {
            raw.push(npc[Object.keys(npc)[i]]);
        }
        console.log(raw);
        for (var i = 0; i < raw.length; i++) {
            emulator.memoryWrite(slot, raw[i]);
            slot = slot + 0x01;
        }
        this.npcsAdded.push(npc);
    };
    GBPluginNPCInjector.NPCBLOCKSTART = 0xD4D6;
    return GBPluginNPCInjector;
})(GBPlugin);
// Injection
window.GBPluginScheduler.GetInstance().registerPluginRun(new GBPluginNPCInjector());
//# sourceMappingURL=plugins.js.map