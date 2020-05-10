(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
class GBPlugin {
    constructor() {
        this.counter = 0;
        this.counterInterval = 30;
    }
    canRun() {
        this.counter++;
        if (this.counter > this.counterInterval) {
            this.counter = 0;
            return true;
        }
        return false;
    }
    start(emulator) {
    }
    link(emulator) {
    }
    run(emulator) {
        if (this.canRun() == false)
            return;
    }
}
class GBPluginScheduler {
    constructor() {
        this.pluginsRun = [];
        this.pluginsStart = [];
        this.pluginsLink = [];
    }
    static GetInstance() {
        return this.Instance;
    }
    run(emulator) {
        this.pluginsRun.forEach(function (plugin) {
            //console.log("Running "+(<any>plugin.constructor).name);
            plugin.run(emulator);
        });
    }
    start(emulator) {
        console.log("START");
        this.pluginsStart.forEach(function (plugin) {
            console.log("Running " + plugin.constructor.name);
            plugin.start(emulator);
        });
    }
    link(emulator) {
        this.pluginsLink.forEach(function (plugin) {
            plugin.link(emulator);
        });
    }
    registerPluginRun(plugin) {
        this.pluginsRun.push(plugin);
    }
    registerPluginStart(plugin) {
        this.pluginsStart.push(plugin);
    }
    registerPluginLink(plugin) {
        this.pluginsLink.push(plugin);
    }
}
GBPluginScheduler.Instance = new GBPluginScheduler();
// Exportation
window.GBPluginScheduler = GBPluginScheduler;
/// <reference path="GBPluginScheduler.ts" />
class GBPluginLink extends GBPlugin {
    constructor() {
        super();
        this.inputBuffer = null;
        this.outputBuffer = null;
        this.lastState = false;
        this.transfering = false;
        this.emulator = null;
        this.timeout = null;
        this.waitForCable = false;
        this.counterInterval = 0;
        /*let self = this;
        (<any>window).Server.registerCallback("LINK", function(e : Message){
            self.receive(e);
        });
        (<any>window).Client.registerCallback("LINK", function(e : Message){
            self.receive(e);
        });*/
    }
    cable() {
        //console.log("CABLE");
        this.waitForCable = false;
    }
    cancel() {
        //console.log("TIMEOUT");
        this.outputBuffer = null;
        //this.inputBuffer = null;
        this.emulator.memoryWrite(GBPluginLink.LINKDATA, 0xFF);
        this.emulator.stopEmulator = 1;
        this.emulator.CPUStopped = false;
        this.waitForCable = true;
        this.timeout = setTimeout(() => {
            this.cable();
        }, 5000);
    }
    receive(e) {
        //console.log("input buffer loaded with "+e.data.toString(16));
        this.inputBuffer = e.data;
        clearTimeout(this.timeout);
        this.timeout = null;
        this.cable();
        this.swap();
    }
    send() {
        this.outputBuffer = this.emulator.memoryRead(GBPluginLink.LINKDATA);
        //console.log("Output buffer loaded with "+this.outputBuffer.toString(16));
        window.Server.sendMessage({
            "type": "LINK",
            "data": this.outputBuffer
        });
        window.Client.sendMessage({
            "type": "LINK",
            "data": this.outputBuffer
        });
        this.emulator.stopEmulator |= 2;
        this.emulator.CPUStopped = true;
        this.timeout = setTimeout(() => {
            this.cancel();
        }, 5000);
        this.swap();
    }
    swap() {
        if (this.outputBuffer != null && this.inputBuffer != null) {
            this.emulator.memoryWrite(GBPluginLink.LINKDATA, this.inputBuffer);
            this.outputBuffer = null;
            this.inputBuffer = null;
            //console.log("SWAP = "+this.emulator.memoryRead(GBPluginLink.LINKDATA).toString(16));
            this.emulator.stopEmulator = 1;
            this.emulator.CPUStopped = false;
            clearTimeout(this.timeout);
            this.timeout = null;
        }
    }
    link(emulator) {
        console.log('link');
        return;
        this.emulator = emulator;
        let state = (emulator.memoryRead(GBPluginLink.LINKSTAT) & 0x80) == 0x80;
        if (state == true && this.lastState == false) {
            if (this.waitForCable) {
                this.emulator.memoryWrite(GBPluginLink.LINKDATA, 0xFF);
                return;
            }
            //console.log("Start of exchange");
            this.send();
            this.transfering = true;
        }
        else if (state == false && this.lastState == true) {
            //console.log("End of exchange");
            this.transfering = false;
        }
        this.lastState = state;
        /* console.log(emulator.memoryRead(GBPluginLink.LINKSTAT).toString(16));
         console.log(emulator.memoryRead(GBPluginLink.LINKDATA).toString(16));*/
        /*if(emulator.serialTimer > this.lastState)
        {
            this.transfer(emulator);
        }
        //let bit = (this.inputBuffer & 0x80) >> 7;
        //emulator.memoryWrite(GBPluginLink.LINKDATA, (((emulator.memoryRead(GBPluginLink.LINKDATA) << 1) & 0xFE) | bit));
        emulator.memoryWrite(GBPluginLink.LINKDATA, this.inputBuffer);
        console.log(emulator.memoryRead(GBPluginLink.LINKDATA).toString(16));
        this.lastState = emulator.serialTimer;*/
    }
}
GBPluginLink.LINKSTAT = 0xFF02;
GBPluginLink.LINKDATA = 0xFF01;
GBPluginLink.EVENT = 0xFF0F;
let link = new GBPluginLink();
GBPluginScheduler.GetInstance().registerPluginLink(link);
/// <reference path="GBPluginScheduler.ts" />
class GBPluginNetwork extends GBPlugin {
    constructor() {
        super();
        this.connected = false;
        this.emulator = null;
        this.messages = null;
        this.callbacks = null;
        this.last_sign = null;
        this.candidates = null;
        this.localDescription = null;
    }
    onOpen(e) {
        console.log("New Connection");
        this.connected = true;
    }
    onClose(e) {
        console.log("Close Connection");
        this.connected = false;
    }
    onError(e) {
        console.log(e);
        this.connected = false;
    }
    onMessage(e) {
        this.messages.push(e);
        let msg = JSON.parse(e.data);
        if (this.callbacks[msg.type] != null)
            this.callbacks[msg.type](msg);
    }
    sendMessage(e) {
        if (this.connected == false)
            return;
        this.channel.send(JSON.stringify(e));
    }
    run(emulator) {
        this.emulator = emulator;
        if (this.canRun() == false)
            return;
        if (this.connected == false) {
            return;
        }
    }
}
class SaveGUI {
    constructor() {
    }
    buildGUI() {
        if (SaveGUI.GUI != null)
            return;
        let ui = document.createElement("template");
        ui.innerHTML =
            `<nav>
        <input id="save"  value="SAVE" onclick="SaveManager.save();" type="button"/>
        <input id="load"  value="LOAD" onclick="SaveManager.load();" type="button"/>
		<input id="save"  value="SAVE LOCAL" onclick="SaveManager.saveLocal();" type="button"/>
        <input id="save"  value="LOAD LOCAL" onchange="SaveManager.loadLocal(event);" type="file"/>
        </nav>`;
        SaveGUI.GUI = ui.firstChild;
        document.appendChild(SaveGUI.GUI);
    }
}
SaveGUI.GUI = null;
class SaveManager {
    static initializeSystem() {
        var desiredCapacity = 10 * 1024 * 1024;
        window.storage = new window.LargeLocalStorage({ size: desiredCapacity, name: 'saves' });
        window.storage.initialized.then(function (grantedCapacity) { });
        window.start(window.fullscreenCanvas, window.base64_decode(window.romb641));
        window.fullscreenPlayer();
    }
    static save() {
        try {
            var s1 = window.gameboy.saveState(), done = [false, false];
            window.storage.setContents('pokemulti', JSON.stringify(s1)).then(function () {
                done[0] = true;
            });
        }
        catch (e) {
            alert("Error when trying to save. Error message : \n" + e);
        }
    }
    static load() {
        try {
            var saves = [], done = [false, false];
            window.storage.getContents('pokemulti').then(function (s1) {
                if (s1)
                    saves[0] = JSON.parse(s1);
                done[0] = true;
                checkDone();
            });
            function checkDone() {
                if (done[0] /*&& done[1]*/) {
                    if (saves[0] /*&& saves[1]*/) {
                        window.clearLastEmulation();
                        window.gameboy = new window.GameBoyCore(window.fullscreenCanvas, "");
                        if (!window.inFullscreen)
                            window.fullscreenPlayer();
                        window.gameboy.savedStateFileName = "SAVE STATE POKEMULTI";
                        window.gameboy.returnFromState(saves[0]);
                        window.run();
                    }
                }
            }
        }
        catch (e) {
            alert("Error when trying to load. Error message :\n " + e);
        }
    }
    static saveLocal() {
        try {
            window.storage.getContents('pokemulti').then(function (s1) {
                var element = document.createElement('a');
                element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(s1));
                element.setAttribute('download', "ModdableGB.rawsave");
                element.style.display = 'none';
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
            });
        }
        catch (e) {
            alert("Error when trying to save. Error message : \n" + e);
        }
    }
    static loadLocal(ev) {
        let input = ev.target;
        if (input.files.length < 1)
            return;
        let file = input.files[0];
        let reader = new FileReader();
        reader.onload = function (e) {
            var saves = [], done = [false, false];
            let s1 = e.target.result;
            if (s1)
                saves[0] = JSON.parse(s1);
            done[0] = true;
            checkDone();
            function checkDone() {
                if (done[0] /*&& done[1]*/) {
                    if (saves[0] /*&& saves[1]*/) {
                        window.clearLastEmulation();
                        window.gameboy = new window.GameBoyCore(window.fullscreenCanvas, "");
                        if (!window.inFullscreen)
                            window.fullscreenPlayer();
                        window.gameboy.savedStateFileName = "SAVE STATE POKEMULTI";
                        window.gameboy.returnFromState(saves[0]);
                        window.run();
                    }
                }
            }
        };
        reader.readAsText(file);
    }
}
window.SaveManager = SaveManager;

},{}]},{},[1]);
