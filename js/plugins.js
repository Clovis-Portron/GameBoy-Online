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
}());
// Exportation
window.GBPluginScheduler = GBPluginScheduler;
/// <reference path="GBPluginScheduler.ts" />
var GBPluginLink = /** @class */ (function (_super) {
    __extends(GBPluginLink, _super);
    function GBPluginLink() {
        var _this = _super.call(this) || this;
        _this.sendBuffer = null;
        _this.receiveBuffer = 170;
        _this.counterInterval = 0;
        return _this;
    }
    GBPluginLink.prototype.run = function (emulator) {
        _super.prototype.run.call(this, emulator);
        var communicating = (emulator.memoryRead(GBPluginLink.LINKSTAT) & 1) == 1;
        var data = emulator.memoryRead(GBPluginLink.LINKDATA);
        if (communicating == false)
            return;
        console.log("Stat: " + emulator.memoryRead(GBPluginLink.LINKSTAT).toString(2));
        console.log("Data: " + data.toString(2));
        this.sendBuffer = data;
        emulator.memoryWrite(GBPluginLink.LINKDATA, this.receiveBuffer);
        //TODO: faire la logique de l'envoi/reception
        var events = emulator.memoryRead(GBPluginLink.EVENT) | 16;
        emulator.memoryWrite(GBPluginLink.EVENT, events);
    };
    GBPluginLink.LINKSTAT = 0xFF02;
    GBPluginLink.LINKDATA = 0xFF01;
    GBPluginLink.EVENT = 0xFF0F;
    return GBPluginLink;
}(GBPlugin));
GBPluginScheduler.GetInstance().registerPluginRun(new GBPluginLink());

},{}]},{},[1]);
