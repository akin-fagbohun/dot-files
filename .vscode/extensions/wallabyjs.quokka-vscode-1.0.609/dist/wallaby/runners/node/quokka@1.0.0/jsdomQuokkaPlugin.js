/*
 * Wallaby.js - v1.0.1514
 * https://wallabyjs.com
 * Copyright (c) 2014-2023 Wallaby.js - All Rights Reserved.
 *
 * This source code file is a part of Wallaby.js and is a proprietary (closed source) software.

 * IMPORTANT:
 * Wallaby.js is a tool made by software developers for software developers with passion and love for what we do.
 * Pirating the tool is not only illegal and just morally wrong,
 * it is also unfair to other fellow programmers who are using it legally,
 * and very harmful for the tool and its future.
 */
const fs=require("fs"),path=require("path");module.exports={before:(e,o)=>{memo.jsdom=e("jsdom"),memo.config=o,memo.supportedProperties=supportedProperties.filter(e=>void 0===global[e]);var e=memo.config.jsdom||{},o=e.config||{},o=e.file||o.file,t=memo.config.filePath.replace(/\.[^.]+$/,".html"),r=path.join(path.dirname(memo.config.filePath),"index.html");memo.fileName=fs.existsSync(o)?o:e.html?void 0:fs.existsSync(t)?t:fs.existsSync(r)?r:void 0},beforeEach:()=>{var e=memo.config.jsdom||{},o=Object.assign({pretendToBeVisual:!0,runScripts:"dangerously"},e.config||{}),t=(o.url=o.url||"http://localhost/",(memo.fileName?fs.readFileSync(memo.fileName).toString():"")||e.html||'<!doctype html><html><head><meta charset="utf-8"></head><body><div id="root"></div></body></html>');const r=new memo.jsdom.JSDOM(t,o).window.document;memo.supportedProperties.forEach(e=>{"root"!==e&&(global[e]=r.defaultView[e])}),global.navigator||(global.navigator={userAgent:e.userAgent||"quokka.js"}),global.localStorage||(global.localStorage=createLocalStorage()),global.sessionStorage||(global.sessionStorage=createSessionStorage()),console.debug||(console.debug=console.log)}};var supportedProperties=require("./jsdomSupportedProperties"),memo={},createLocalStorage=()=>{const t={};return{setItem:function(e,o){t[e]=o},getItem:function(e){return e in t?t[e]:null},removeItem:function(e){return delete t[e]}}},createSessionStorage=()=>{let t={};return{setItem:function(e,o){t[e]=o+""},getItem:function(e){return e in t?t[e]:null},removeItem:function(e){return delete t[e]},clear:function(){t={}}}};