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
            //console.log("Running "+(<any>plugin.constructor).name);
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
        this.uuuuuuuuu = 0x00;
        this.boundsXstart = 0x0A;
        this.boundsYstart = 0x0A;
        this.boundsXend = 0x0A;
        this.boundsYend = 0x0A;
        this.boundsxuuu = 0x0A;
        this.boundsyuuu = 0x0A;
        this.uuuuuuuuuuu = 0x00;
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
        console.log("try to addnpc");
        var freeSlot = this.searchFreeNPCSlot(emulator);
        if (freeSlot == null)
            return;
        this.addNPC(emulator, freeSlot, this.npcsToAdd.shift());
    };
    GBPluginNPCInjector.prototype.registerNPC = function (npc) {
        this.npcsToAdd.push(npc);
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
var hh = new GBPluginNPCInjector();
window.GBPluginScheduler.GetInstance().registerPluginRun(hh);
window.NPC = NPC;
window.INPC = new NPC();
window.injectNPC = function (npc) {
    hh.registerNPC(npc);
};
/// <reference path="GBPluginScheduler.ts" />
/// <reference path="GBPluginNPCInjector.ts" />
var GBPluginNPCInfo = (function (_super) {
    __extends(GBPluginNPCInfo, _super);
    function GBPluginNPCInfo() {
        _super.apply(this, arguments);
        this.npcs = [];
    }
    GBPluginNPCInfo.prototype.run = function (emulator) {
        if (this.canRun() == false)
            return;
        //console.log("NPC INFO");
        this.npcs = this.searchNPCS(emulator);
    };
    GBPluginNPCInfo.prototype.searchNPCS = function (emulator) {
        var results = [];
        var current = GBPluginNPCInfo.NPCBLOCKSTART;
        while (current < 0xD720) {
            if (emulator.memoryRead(current) != 0x0)
                results.push(this.generateNPCFromRAM(emulator, current));
            current = current + 0x28;
        }
        return results;
    };
    GBPluginNPCInfo.prototype.generateNPCFromRAM = function (emulator, slot) {
        var npc = new NPC();
        var raw = [];
        for (var i = 0; i < Object.keys(npc).length; i++) {
            npc[Object.keys(npc)[i]] = emulator.memoryRead(slot);
            raw.push(emulator.memoryRead(slot));
            slot = slot + 0x01;
        }
        //console.log(raw);
        return npc;
    };
    GBPluginNPCInfo.NPCBLOCKSTART = 0xD4D6;
    return GBPluginNPCInfo;
})(GBPlugin);
var hhh = new GBPluginNPCInfo();
window.GBPluginScheduler.GetInstance().registerPluginRun(hhh);
window.dumpNPC = function () {
    return hhh.npcs;
};
//# sourceMappingURL=plugins.js.map