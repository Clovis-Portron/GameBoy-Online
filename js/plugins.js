(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var GBPlugin = /** @class */ (function () {
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
    GBPlugin.prototype.start = function (emulator) {
    };
    GBPlugin.prototype.link = function (emulator) {
    };
    GBPlugin.prototype.run = function (emulator) {
        if (this.canRun() == false)
            return;
    };
    return GBPlugin;
}());
var GBPluginScheduler = /** @class */ (function () {
    function GBPluginScheduler() {
        this.pluginsRun = [];
        this.pluginsStart = [];
        this.pluginsLink = [];
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
            plugin.start(emulator);
        });
    };
    GBPluginScheduler.prototype.link = function (emulator) {
        this.pluginsLink.forEach(function (plugin) {
            plugin.link(emulator);
        });
    };
    GBPluginScheduler.prototype.registerPluginRun = function (plugin) {
        this.pluginsRun.push(plugin);
    };
    GBPluginScheduler.prototype.registerPluginStart = function (plugin) {
        this.pluginsStart.push(plugin);
    };
    GBPluginScheduler.prototype.registerPluginLink = function (plugin) {
        this.pluginsLink.push(plugin);
    };
    GBPluginScheduler.Instance = new GBPluginScheduler();
    return GBPluginScheduler;
}());
// Exportation
window.GBPluginScheduler = GBPluginScheduler;
/// <reference path="GBPluginScheduler.ts" />
var GBPluginLink = /** @class */ (function (_super) {
    __extends(GBPluginLink, _super);
    function GBPluginLink() {
        var _this = _super.call(this) || this;
        _this.transfering = false;
        _this.master = false;
        _this.buffer = null;
        _this.inputBuffer = 0x02;
        _this.receivedData = 0x02;
        _this.transferCounter = 0;
        _this.lastShift = null;
        _this.counterInterval = 0;
        return _this;
    }
    GBPluginLink.prototype.link = function (emulator) {
        if (this.transfering == true && this.lastShift != null && Date.now() - this.lastShift > 1000) {
            console.log("Reseting transfer.");
            this.transfering = false;
        }
        if (this.transfering == false)
            this.initTransfer(emulator);
        var bit = (this.inputBuffer & 0x80) >> 7;
        this.buffer = ((this.buffer << 1) & 0xFE) | bit;
        this.inputBuffer = this.inputBuffer << 1;
        emulator.memoryWrite(GBPluginLink.LINKDATA, this.buffer);
        console.log(this.buffer.toString(16) + " " + this.transferCounter + "/7");
        this.transferCounter++;
        this.lastShift = Date.now();
        if (this.transferCounter >= 8) {
            this.endTransfer(emulator);
        }
    };
    GBPluginLink.prototype.transfer = function (emulator) {
        console.log("Sending " + emulator.memoryRead(GBPluginLink.LINKDATA).toString(16) + " as " + this.master);
        //TODO: faire la logique de l'envoi/reception
        if (this.master == false) {
            this.receivedData = 0x01;
        }
        if (this.buffer == 0x01) {
            this.receivedData = 0x02;
        }
        console.log("Received " + this.receivedData.toString(16));
    };
    GBPluginLink.prototype.initTransfer = function (emulator) {
        var data = emulator.memoryRead(GBPluginLink.LINKDATA);
        this.buffer = data;
        var role = "master";
        if (this.master == false)
            role = "slave";
        this.transfer(emulator);
        this.inputBuffer = this.receivedData;
        this.transferCounter = 0;
        this.transfering = true;
    };
    GBPluginLink.prototype.endTransfer = function (emulator) {
        this.transfering = false;
        console.log("Ending transfer with " + this.buffer.toString(16));
    };
    GBPluginLink.LINKSTAT = 0xFF02;
    GBPluginLink.LINKDATA = 0xFF01;
    GBPluginLink.EVENT = 0xFF0F;
    return GBPluginLink;
}(GBPlugin));
var link = new GBPluginLink();
GBPluginScheduler.GetInstance().registerPluginLink(link);

},{}]},{},[1]);
