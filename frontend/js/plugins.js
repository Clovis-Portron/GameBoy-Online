(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
class GBPluginNetwork extends GBPlugin {
    constructor() {
        super();
        this.connected = false;
        this.emulator = null;
        this.messages = null;
        this.callbacks = null;
        this.last_sign = null;
        this.callbacks = [];
        this.messages = [];
        this.counterInterval = 0;
        this.iceCandidates = [];
        this.connection = new RTCPeerConnection({
            "iceServers": [
                {
                    urls: 'turn:numb.viagenie.ca',
                    credential: '0662240307',
                    username: 'chaipokoi@gmail.com'
                },
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' },
            ]
        });
    }
    registerCallback(type, fn) {
        this.callbacks[type] = fn;
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
    executeMessage(e) {
        if (this.emulator == null)
            return true;
        return true;
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
/// <reference path="GBPluginScheduler.ts" />
/// <reference path="GBPluginNetwork.ts" />
class GBPluginNetworkSender extends GBPluginNetwork {
    constructor() {
        super();
        window.GBPluginScheduler.GetInstance().registerPluginRun(this);
        this.connection.onicecandidate = (event) => { this.OnIceCandidate(event); };
        this.channel = this.connection.createDataChannel('PlayerExchange', {});
        this.channel.onmessage = (e) => { this.onMessage(e); };
        this.channel.onopen = (e) => { this.onOpen(e); };
        this.channel.onclose = (e) => { this.onClose(e); };
        this.connection.createOffer().then((offer) => {
            this.connection.setLocalDescription(offer);
            console.log('window.Client.receiveOffer(new RTCSessionDescription(JSON.parse(\'' + JSON.stringify(offer).replace(/\\/g, "\\\\") + '\')));');
        }).catch(function (error) {
        });
        console.log("STARTING NETWORK");
    }
    setCandidates(candidates) {
        for (var i = 0; i < candidates.length; i++) {
            this.connection.addIceCandidate(new RTCIceCandidate(candidates[i]));
        }
    }
    setRemoteDescription(desc) {
        this.connection.setRemoteDescription(desc);
        console.log("window.Client.setCandidates(JSON.parse('" + JSON.stringify(this.iceCandidates).replace(/\\/g, "\\\\") + "'));");
    }
    OnIceCandidate(event) {
        if (event.candidate) {
            this.iceCandidates.push(event.candidate);
        }
    }
}
window.Server = new GBPluginNetworkSender();
/// <reference path="GBPluginScheduler.ts" />
/// <reference path="GBPluginNetwork.ts" />
class GBPluginNetworkReceiver extends GBPluginNetwork {
    constructor() {
        super();
        window.GBPluginScheduler.GetInstance().registerPluginRun(this);
        this.connection.onicecandidate = (event) => { this.onIceCandidate(event); };
        this.connection.ondatachannel = (channel) => { this.onDataChannel(channel); };
        console.log("Waiting for offer");
    }
    setCandidates(candidates) {
        for (var i = 0; i < candidates.length; i++) {
            this.connection.addIceCandidate(new RTCIceCandidate(candidates[i]));
        }
        console.log("window.Server.setCandidates(JSON.parse('" + JSON.stringify(this.iceCandidates).replace(/\\/g, "\\\\") + "'));");
    }
    receiveOffer(offerSdp) {
        this.connection.setRemoteDescription(offerSdp);
        this.connection.createAnswer().then((answer) => {
            this.connection.setLocalDescription(answer);
            console.log('window.Server.setRemoteDescription(new RTCSessionDescription(JSON.parse(\'' + JSON.stringify(answer).replace(/\\/g, "\\\\") + '\')));');
        }).catch(function (error) { });
    }
    onIceCandidate(event) {
        if (event.candidate) {
            this.iceCandidates.push(event.candidate);
        }
    }
    onDataChannel(event) {
        this.channel = event.channel;
        this.channel.onmessage = (e) => { this.onMessage(e); };
        this.channel.onopen = (e) => { this.onOpen(e); };
        this.channel.onclose = (e) => { this.onClose(e); };
    }
}
window.Client = new GBPluginNetworkReceiver();
/// <reference path="GBPluginScheduler.ts" />
/// <reference path="GBPluginNetworkSender.ts" />
/// <reference path="GBPluginNetworkReceiver.ts" />
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
        let self = this;
        window.Server.registerCallback("LINK", function (e) {
            self.receive(e);
        });
        window.Client.registerCallback("LINK", function (e) {
            self.receive(e);
        });
    }
    cable() {
        console.log("CABLE");
        this.waitForCable = false;
    }
    cancel() {
        console.log("TIMEOUT");
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
        console.log("input buffer loaded with " + e.data.toString(16));
        this.inputBuffer = e.data;
        clearTimeout(this.timeout);
        this.timeout = null;
        this.cable();
        this.swap();
    }
    send() {
        this.outputBuffer = this.emulator.memoryRead(GBPluginLink.LINKDATA);
        console.log("Output buffer loaded with " + this.outputBuffer.toString(16));
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
            console.log("SWAP = " + this.emulator.memoryRead(GBPluginLink.LINKDATA).toString(16));
            this.emulator.stopEmulator = 1;
            this.emulator.CPUStopped = false;
            clearTimeout(this.timeout);
            this.timeout = null;
        }
    }
    link(emulator) {
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

},{}]},{},[1]);
