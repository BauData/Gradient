'use strict';
var ATUtil = require('atutil');

var randomShaderFunctions = {

    randomFunction: function() {
        return this.getRandomFunction();
    },
    randomColorFunction: function(channel) {
        var res;
        var factor = ATUtil.randomRange(.0, .2);
        if (factor >= .0 && factor < .1) {
            res = this.getRandomFunction();
        }
        else {
            res = "pct." + channel;
        }
        return res;
    },
    getArgument: function() {
        return this.getRandomSpace() +
        " * " +  this.getRandomTrigonometry() +
        "(u_time * " + Math.random() + ")";
    },
    getRandomFunction: function() {
        var res;
        var factor = ATUtil.randomRange(.0, .6);
        if (factor >= .0 && factor < .1) {
            res = Math.random();
        }
        else if (factor >= .1 && factor < .2) {
            res = this.getRandomSpace();
        }
        else if (factor >= .2 && factor < .3) {
            res = this.getArgument(); 
        }
        else if (factor >= .3 && factor < .4) {
            res = this.randomOneArgFunction(); 
        }
        else if (factor >= .4 && factor < .5) {
            res = this.randomTwoArgFunction(); 
        }
        else {
            res = this.randomThreeArgFunction(); 
        }
        return res;
    },
    getRandomSpace: function() {
        var res;
        var factor = ATUtil.randomRange(.0, .3);
        if (factor >= .0 && factor < .1) {
            res = "st.x";
        }
        else if (factor >= .1 && factor < .2) {
            res = "st.y";
        }
        else {
            res = "1."; 
        }
        return res;
    },
    getRandomTrigonometry: function() {
        var res;
        var factor = ATUtil.randomRange(.0, .3);
        if (factor >= .0 && factor < .1) {
            res = "sin";
        }
        else if (factor >= .1 && factor < .2) {
            res = "cos"; 
        }
        else {
            res = "tan"; 
        }
        return res;
    },
    randomOneArgFunction: function() {
        var res;
        var factor = ATUtil.randomRange(.0, 1.2);
        if (factor >= .0 && factor < .1) {
            res = "abs";
        }
        else if (factor >= .1 && factor < .2) {
            res = "sign"; 
        }
        else if (factor >= .2 && factor < .3) {
            res = "floor"; 
        }
        else if (factor >= .3 && factor < .4) {
            res = "ceil"; 
        }
        else if (factor >= .4 && factor < .5) {
            res = "fract"; 
        }
        else if (factor >= .5 && factor < .6) {
            res = "exp"; 
        }
        else if (factor >= .6 && factor < .7) {
            res = "exp2"; 
        }
        else if (factor >= .7 && factor < .8) {
            res = "sqrt"; 
        }
        else if (factor >= .8 && factor < .9) {
            res = "inversesqrt"; 
        }
        else if (factor >= .9 && factor < 1.) {
            res = "length"; 
        }
        else if (factor >= 1. && factor < 1.1) {
            res = "log"; 
        }
        else {
            res = "1. * "; 
        }
        res += "(";
        res +=  this.getRandomFunction();
        res += ")";
        return res;
    },
    randomTwoArgFunction: function() {
        var res;
        var factor = ATUtil.randomRange(.0, .9);
        if (factor >= .0 && factor < .1) {
            res = "pow";
        }
        else if (factor >= .1 && factor < .2) {
            res = "mod"; 
        }
        else if (factor >= .2 && factor < .3) {
            res = "min"; 
        }
        else if (factor >= .3 && factor < .4) {
            res = "max"; 
        }
        else if (factor >= .4 && factor < .5) {
            res = "step"; 
        }
        else if (factor >= .5 && factor < .6) {
            res = "distance"; 
        }
        else if (factor >= .6 && factor < .7) {
            res = "dot"; 
        }
        else if (factor >= .7 && factor < .8) {
            res = "reflect"; 
        }
        else {
            res = "1. * "; 
        }
        res += "(";
        res +=  this.getRandomFunction();
        res += ", ";
        res +=  this.getRandomFunction();
        res +=  ")";
        return res;
    },
    randomThreeArgFunction: function() {
        var res;
        var factor = ATUtil.randomRange(.0, .5);
        if (factor >= .0 && factor < .1) {
            res = "refract";
        }
        else if (factor >= .1 && factor < .2) {
            res = "clamp"; 
        }
        else if (factor >= .2 && factor < .3) {
            res = "mix"; 
        }
        else if (factor >= .3 && factor < .4) {
            res = "smoothstep"; 
        }
        else {
            res = "1. * "; 
        }
        res += "(";
        res +=  this.getRandomFunction();
        res += ", ";
        res +=  this.getRandomFunction();
        res += ", ";
        res +=  this.getRandomFunction();
        res +=  ")";
        return res;
    }
};