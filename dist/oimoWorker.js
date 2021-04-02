(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
module.exports = {
  parse: function (cmd) {
    let words = cmd.split(" ")
    let args = []
    for (let word of words) {
      if (word) {
        try {
          args.push(JSON.parse(word))
        } catch (error) {
          if (word !== "=")
            args.push(word)
        }
      }
    }
    return args
  },
  stringifyParam: function (val) {
    return JSON.stringify(val).replaceAll(" ", "\\u0020").replaceAll("\"_", "\"")
  }
}
},{}],2:[function(require,module,exports){
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
      (global = global || self, factory(global.OIMO = {}));
}(this, function (exports) {
  'use strict';

  // Polyfills

  if (Number.EPSILON === undefined) {

    Number.EPSILON = Math.pow(2, - 52);

  }

  //

  if (Math.sign === undefined) {

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/sign

    Math.sign = function (x) {

      return (x < 0) ? - 1 : (x > 0) ? 1 : + x;

    };

  }

  if (Function.prototype.name === undefined) {

    // Missing in IE9-11.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/name

    Object.defineProperty(Function.prototype, 'name', {

      get: function () {

        return this.toString().match(/^\s*function\s*([^\(\s]*)/)[1];

      }

    });

  }

  if (Object.assign === undefined) {

    // Missing in IE.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign

    (function () {

      Object.assign = function (target) {

        if (target === undefined || target === null) {

          throw new TypeError('Cannot convert undefined or null to object');

        }

        var output = Object(target);

        for (var index = 1; index < arguments.length; index++) {

          var source = arguments[index];

          if (source !== undefined && source !== null) {

            for (var nextKey in source) {

              if (Object.prototype.hasOwnProperty.call(source, nextKey)) {

                output[nextKey] = source[nextKey];

              }

            }

          }

        }

        return output;

      };

    })();

  }

  /*
   * A list of constants built-in for
   * the physics engine.
   */

  var REVISION = '1.0.9';

  // BroadPhase
  var BR_NULL = 0;
  var BR_BRUTE_FORCE = 1;
  var BR_SWEEP_AND_PRUNE = 2;
  var BR_BOUNDING_VOLUME_TREE = 3;

  // Body type
  var BODY_NULL = 0;
  var BODY_DYNAMIC = 1;
  var BODY_STATIC = 2;
  var BODY_KINEMATIC = 3;
  var BODY_GHOST = 4;

  // Shape type
  var SHAPE_NULL = 0;
  var SHAPE_SPHERE = 1;
  var SHAPE_BOX = 2;
  var SHAPE_CYLINDER = 3;
  var SHAPE_PLANE = 4;
  var SHAPE_PARTICLE = 5;
  var SHAPE_TETRA = 6;

  // Joint type
  var JOINT_NULL = 0;
  var JOINT_DISTANCE = 1;
  var JOINT_BALL_AND_SOCKET = 2;
  var JOINT_HINGE = 3;
  var JOINT_WHEEL = 4;
  var JOINT_SLIDER = 5;
  var JOINT_PRISMATIC = 6;

  // AABB aproximation
  var AABB_PROX = 0.005;

  var _Math = {

    sqrt: Math.sqrt,
    abs: Math.abs,
    floor: Math.floor,
    cos: Math.cos,
    sin: Math.sin,
    acos: Math.acos,
    asin: Math.asin,
    atan2: Math.atan2,
    round: Math.round,
    pow: Math.pow,
    max: Math.max,
    min: Math.min,
    random: Math.random,

    degtorad: 0.0174532925199432957,
    radtodeg: 57.295779513082320876,
    PI: 3.141592653589793,
    TwoPI: 6.283185307179586,
    PI90: 1.570796326794896,
    PI270: 4.712388980384689,

    INF: Infinity,
    EPZ: 0.00001,
    EPZ2: 0.000001,

    lerp: function (x, y, t) {

      return (1 - t) * x + t * y;

    },

    randInt: function (low, high) {

      return low + _Math.floor(_Math.random() * (high - low + 1));

    },

    rand: function (low, high) {

      return low + _Math.random() * (high - low);

    },

    generateUUID: function () {

      // http://www.broofa.com/Tools/Math.uuid.htm

      var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
      var uuid = new Array(36);
      var rnd = 0, r;

      return function generateUUID() {

        for (var i = 0; i < 36; i++) {

          if (i === 8 || i === 13 || i === 18 || i === 23) {

            uuid[i] = '-';

          } else if (i === 14) {

            uuid[i] = '4';

          } else {

            if (rnd <= 0x02) rnd = 0x2000000 + (Math.random() * 0x1000000) | 0;
            r = rnd & 0xf;
            rnd = rnd >> 4;
            uuid[i] = chars[(i === 19) ? (r & 0x3) | 0x8 : r];

          }

        }

        return uuid.join('');

      };

    }(),

    int: function (x) {

      return _Math.floor(x);

    },

    fix: function (x, n) {

      return x.toFixed(n || 3, 10);

    },

    clamp: function (value, min, max) {

      return _Math.max(min, _Math.min(max, value));

    },

    //clamp: function ( x, a, b ) { return ( x < a ) ? a : ( ( x > b ) ? b : x ); },



    distance: function (p1, p2) {

      var xd = p2[0] - p1[0];
      var yd = p2[1] - p1[1];
      var zd = p2[2] - p1[2];
      return _Math.sqrt(xd * xd + yd * yd + zd * zd);

    },

    /*unwrapDegrees: function ( r ) {

        r = r % 360;
        if (r > 180) r -= 360;
        if (r < -180) r += 360;
        return r;

    },

    unwrapRadian: function( r ){

        r = r % _Math.TwoPI;
        if (r > _Math.PI) r -= _Math.TwoPI;
        if (r < -_Math.PI) r += _Math.TwoPI;
        return r;

    },*/

    acosClamp: function (cos) {

      if (cos > 1) return 0;
      else if (cos < -1) return _Math.PI;
      else return _Math.acos(cos);

    },

    distanceVector: function (v1, v2) {

      var xd = v1.x - v2.x;
      var yd = v1.y - v2.y;
      var zd = v1.z - v2.z;
      return xd * xd + yd * yd + zd * zd;

    },

    dotVectors: function (a, b) {

      return a.x * b.x + a.y * b.y + a.z * b.z;

    },

  };

  function printError(clazz, msg) {
    console.error("[OIMO] " + clazz + ": " + msg);
  }

  // A performance evaluator

  function InfoDisplay(world) {

    this.parent = world;

    this.infos = new Float32Array(13);
    this.f = [0, 0, 0];

    this.times = [0, 0, 0, 0];

    this.broadPhase = this.parent.broadPhaseType;

    this.version = REVISION;

    this.fps = 0;

    this.tt = 0;

    this.broadPhaseTime = 0;
    this.narrowPhaseTime = 0;
    this.solvingTime = 0;
    this.totalTime = 0;
    this.updateTime = 0;

    this.MaxBroadPhaseTime = 0;
    this.MaxNarrowPhaseTime = 0;
    this.MaxSolvingTime = 0;
    this.MaxTotalTime = 0;
    this.MaxUpdateTime = 0;
  }
  Object.assign(InfoDisplay.prototype, {

    setTime: function (n) {
      this.times[n || 0] = performance.now();
    },

    resetMax: function () {

      this.MaxBroadPhaseTime = 0;
      this.MaxNarrowPhaseTime = 0;
      this.MaxSolvingTime = 0;
      this.MaxTotalTime = 0;
      this.MaxUpdateTime = 0;

    },

    calcBroadPhase: function () {

      this.setTime(2);
      this.broadPhaseTime = this.times[2] - this.times[1];

    },

    calcNarrowPhase: function () {

      this.setTime(3);
      this.narrowPhaseTime = this.times[3] - this.times[2];

    },

    calcEnd: function () {

      this.setTime(2);
      this.solvingTime = this.times[2] - this.times[1];
      this.totalTime = this.times[2] - this.times[0];
      this.updateTime = this.totalTime - (this.broadPhaseTime + this.narrowPhaseTime + this.solvingTime);

      if (this.tt === 100) this.resetMax();

      if (this.tt > 100) {
        if (this.broadPhaseTime > this.MaxBroadPhaseTime) this.MaxBroadPhaseTime = this.broadPhaseTime;
        if (this.narrowPhaseTime > this.MaxNarrowPhaseTime) this.MaxNarrowPhaseTime = this.narrowPhaseTime;
        if (this.solvingTime > this.MaxSolvingTime) this.MaxSolvingTime = this.solvingTime;
        if (this.totalTime > this.MaxTotalTime) this.MaxTotalTime = this.totalTime;
        if (this.updateTime > this.MaxUpdateTime) this.MaxUpdateTime = this.updateTime;
      }


      this.upfps();

      this.tt++;
      if (this.tt > 500) this.tt = 0;

    },


    upfps: function () {
      this.f[1] = Date.now();
      if (this.f[1] - 1000 > this.f[0]) { this.f[0] = this.f[1]; this.fps = this.f[2]; this.f[2] = 0; } this.f[2]++;
    },

    show: function () {
      var info = [
        "Oimo.js " + this.version + "<br>",
        this.broadPhase + "<br><br>",
        "FPS: " + this.fps + " fps<br><br>",
        "rigidbody " + this.parent.numRigidBodies + "<br>",
        "contact &nbsp;&nbsp;" + this.parent.numContacts + "<br>",
        "ct-point &nbsp;" + this.parent.numContactPoints + "<br>",
        "paircheck " + this.parent.broadPhase.numPairChecks + "<br>",
        "island &nbsp;&nbsp;&nbsp;" + this.parent.numIslands + "<br><br>",
        "Time in milliseconds<br><br>",
        "broadphase &nbsp;" + _Math.fix(this.broadPhaseTime) + " | " + _Math.fix(this.MaxBroadPhaseTime) + "<br>",
        "narrowphase " + _Math.fix(this.narrowPhaseTime) + " | " + _Math.fix(this.MaxNarrowPhaseTime) + "<br>",
        "solving &nbsp;&nbsp;&nbsp;&nbsp;" + _Math.fix(this.solvingTime) + " | " + _Math.fix(this.MaxSolvingTime) + "<br>",
        "total &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + _Math.fix(this.totalTime) + " | " + _Math.fix(this.MaxTotalTime) + "<br>",
        "updating &nbsp;&nbsp;&nbsp;" + _Math.fix(this.updateTime) + " | " + _Math.fix(this.MaxUpdateTime) + "<br>"
      ].join("\n");
      return info;
    },

    toArray: function () {
      this.infos[0] = this.parent.broadPhase.types;
      this.infos[1] = this.parent.numRigidBodies;
      this.infos[2] = this.parent.numContacts;
      this.infos[3] = this.parent.broadPhase.numPairChecks;
      this.infos[4] = this.parent.numContactPoints;
      this.infos[5] = this.parent.numIslands;
      this.infos[6] = this.broadPhaseTime;
      this.infos[7] = this.narrowPhaseTime;
      this.infos[8] = this.solvingTime;
      this.infos[9] = this.updateTime;
      this.infos[10] = this.totalTime;
      this.infos[11] = this.fps;
      return this.infos;
    }

  });

  function Vec3(x, y, z) {

    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;

  }

  Object.assign(Vec3.prototype, {

    Vec3: true,

    set: function (x, y, z) {

      this.x = x;
      this.y = y;
      this.z = z;
      return this;

    },

    add: function (a, b) {

      if (b !== undefined) return this.addVectors(a, b);

      this.x += a.x;
      this.y += a.y;
      this.z += a.z;
      return this;

    },

    addVectors: function (a, b) {

      this.x = a.x + b.x;
      this.y = a.y + b.y;
      this.z = a.z + b.z;
      return this;

    },

    addEqual: function (v) {

      this.x += v.x;
      this.y += v.y;
      this.z += v.z;
      return this;

    },

    sub: function (a, b) {

      if (b !== undefined) return this.subVectors(a, b);

      this.x -= a.x;
      this.y -= a.y;
      this.z -= a.z;
      return this;

    },

    subVectors: function (a, b) {

      this.x = a.x - b.x;
      this.y = a.y - b.y;
      this.z = a.z - b.z;
      return this;

    },

    subEqual: function (v) {

      this.x -= v.x;
      this.y -= v.y;
      this.z -= v.z;
      return this;

    },

    scale: function (v, s) {

      this.x = v.x * s;
      this.y = v.y * s;
      this.z = v.z * s;
      return this;

    },

    scaleEqual: function (s) {

      this.x *= s;
      this.y *= s;
      this.z *= s;
      return this;

    },

    multiply: function (v) {

      this.x *= v.x;
      this.y *= v.y;
      this.z *= v.z;
      return this;

    },

    /*scaleV: function( v ){

        this.x *= v.x;
        this.y *= v.y;
        this.z *= v.z;
        return this;

    },

    scaleVectorEqual: function( v ){

        this.x *= v.x;
        this.y *= v.y;
        this.z *= v.z;
        return this;

    },*/

    addScaledVector: function (v, s) {

      this.x += v.x * s;
      this.y += v.y * s;
      this.z += v.z * s;

      return this;

    },

    subScaledVector: function (v, s) {

      this.x -= v.x * s;
      this.y -= v.y * s;
      this.z -= v.z * s;

      return this;

    },

    /*addTime: function ( v, t ) {

        this.x += v.x * t;
        this.y += v.y * t;
        this.z += v.z * t;
        return this;

    },
    
    addScale: function ( v, s ) {

        this.x += v.x * s;
        this.y += v.y * s;
        this.z += v.z * s;
        return this;

    },

    subScale: function ( v, s ) {

        this.x -= v.x * s;
        this.y -= v.y * s;
        this.z -= v.z * s;
        return this;

    },*/

    cross: function (a, b) {

      if (b !== undefined) return this.crossVectors(a, b);

      var x = this.x, y = this.y, z = this.z;

      this.x = y * a.z - z * a.y;
      this.y = z * a.x - x * a.z;
      this.z = x * a.y - y * a.x;

      return this;

    },

    crossVectors: function (a, b) {

      var ax = a.x, ay = a.y, az = a.z;
      var bx = b.x, by = b.y, bz = b.z;

      this.x = ay * bz - az * by;
      this.y = az * bx - ax * bz;
      this.z = ax * by - ay * bx;

      return this;

    },

    tangent: function (a) {

      var ax = a.x, ay = a.y, az = a.z;

      this.x = ay * ax - az * az;
      this.y = - az * ay - ax * ax;
      this.z = ax * az + ay * ay;

      return this;

    },





    invert: function (v) {

      this.x = -v.x;
      this.y = -v.y;
      this.z = -v.z;
      return this;

    },

    negate: function () {

      this.x = - this.x;
      this.y = - this.y;
      this.z = - this.z;

      return this;

    },

    dot: function (v) {

      return this.x * v.x + this.y * v.y + this.z * v.z;

    },

    addition: function () {

      return this.x + this.y + this.z;

    },

    lengthSq: function () {

      return this.x * this.x + this.y * this.y + this.z * this.z;

    },

    length: function () {

      return _Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);

    },

    copy: function (v) {

      this.x = v.x;
      this.y = v.y;
      this.z = v.z;
      return this;

    },

    /*mul: function( b, a, m ){

        return this.mulMat( m, a ).add( b );

    },

    mulMat: function( m, a ){

        var e = m.elements;
        var x = a.x, y = a.y, z = a.z;

        this.x = e[ 0 ] * x + e[ 1 ] * y + e[ 2 ] * z;
        this.y = e[ 3 ] * x + e[ 4 ] * y + e[ 5 ] * z;
        this.z = e[ 6 ] * x + e[ 7 ] * y + e[ 8 ] * z;
        return this;

    },*/

    applyMatrix3: function (m, transpose) {

      //if( transpose ) m = m.clone().transpose();
      var x = this.x, y = this.y, z = this.z;
      var e = m.elements;

      if (transpose) {

        this.x = e[0] * x + e[1] * y + e[2] * z;
        this.y = e[3] * x + e[4] * y + e[5] * z;
        this.z = e[6] * x + e[7] * y + e[8] * z;

      } else {

        this.x = e[0] * x + e[3] * y + e[6] * z;
        this.y = e[1] * x + e[4] * y + e[7] * z;
        this.z = e[2] * x + e[5] * y + e[8] * z;
      }

      return this;

    },

    applyQuaternion: function (q) {

      var x = this.x;
      var y = this.y;
      var z = this.z;

      var qx = q.x;
      var qy = q.y;
      var qz = q.z;
      var qw = q.w;

      // calculate quat * vector

      var ix = qw * x + qy * z - qz * y;
      var iy = qw * y + qz * x - qx * z;
      var iz = qw * z + qx * y - qy * x;
      var iw = - qx * x - qy * y - qz * z;

      // calculate result * inverse quat

      this.x = ix * qw + iw * - qx + iy * - qz - iz * - qy;
      this.y = iy * qw + iw * - qy + iz * - qx - ix * - qz;
      this.z = iz * qw + iw * - qz + ix * - qy - iy * - qx;

      return this;

    },

    testZero: function () {

      if (this.x !== 0 || this.y !== 0 || this.z !== 0) return true;
      else return false;

    },

    testDiff: function (v) {

      return this.equals(v) ? false : true;

    },

    equals: function (v) {

      return v.x === this.x && v.y === this.y && v.z === this.z;

    },

    clone: function () {

      return new this.constructor(this.x, this.y, this.z);

    },

    toString: function () {

      return "Vec3[" + this.x.toFixed(4) + ", " + this.y.toFixed(4) + ", " + this.z.toFixed(4) + "]";

    },

    multiplyScalar: function (scalar) {

      if (isFinite(scalar)) {
        this.x *= scalar;
        this.y *= scalar;
        this.z *= scalar;
      } else {
        this.x = 0;
        this.y = 0;
        this.z = 0;
      }

      return this;

    },

    divideScalar: function (scalar) {

      return this.multiplyScalar(1 / scalar);

    },

    normalize: function () {

      return this.divideScalar(this.length());

    },

    toArray: function (array, offset) {

      if (offset === undefined) offset = 0;

      array[offset] = this.x;
      array[offset + 1] = this.y;
      array[offset + 2] = this.z;

    },

    fromArray: function (array, offset) {

      if (offset === undefined) offset = 0;

      this.x = array[offset];
      this.y = array[offset + 1];
      this.z = array[offset + 2];
      return this;

    },


  });

  function Quat(x, y, z, w) {

    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
    this.w = (w !== undefined) ? w : 1;

  }

  Object.assign(Quat.prototype, {

    Quat: true,

    set: function (x, y, z, w) {


      this.x = x;
      this.y = y;
      this.z = z;
      this.w = w;

      return this;

    },

    addTime: function (v, t) {

      var ax = v.x, ay = v.y, az = v.z;
      var qw = this.w, qx = this.x, qy = this.y, qz = this.z;
      t *= 0.5;
      this.x += t * (ax * qw + ay * qz - az * qy);
      this.y += t * (ay * qw + az * qx - ax * qz);
      this.z += t * (az * qw + ax * qy - ay * qx);
      this.w += t * (-ax * qx - ay * qy - az * qz);
      this.normalize();
      return this;

    },

    /*mul: function( q1, q2 ){

        var ax = q1.x, ay = q1.y, az = q1.z, as = q1.w,
        bx = q2.x, by = q2.y, bz = q2.z, bs = q2.w;
        this.x = ax * bs + as * bx + ay * bz - az * by;
        this.y = ay * bs + as * by + az * bx - ax * bz;
        this.z = az * bs + as * bz + ax * by - ay * bx;
        this.w = as * bs - ax * bx - ay * by - az * bz;
        return this;

    },*/

    multiply: function (q, p) {

      if (p !== undefined) return this.multiplyQuaternions(q, p);
      return this.multiplyQuaternions(this, q);

    },

    multiplyQuaternions: function (a, b) {

      var qax = a.x, qay = a.y, qaz = a.z, qaw = a.w;
      var qbx = b.x, qby = b.y, qbz = b.z, qbw = b.w;

      this.x = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
      this.y = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
      this.z = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
      this.w = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;
      return this;

    },

    setFromUnitVectors: function (v1, v2) {

      var vx = new Vec3();
      var r = v1.dot(v2) + 1;

      if (r < _Math.EPS2) {

        r = 0;
        if (_Math.abs(v1.x) > _Math.abs(v1.z)) vx.set(- v1.y, v1.x, 0);
        else vx.set(0, - v1.z, v1.y);

      } else {

        vx.crossVectors(v1, v2);

      }

      this._x = vx.x;
      this._y = vx.y;
      this._z = vx.z;
      this._w = r;

      return this.normalize();

    },

    arc: function (v1, v2) {

      var x1 = v1.x;
      var y1 = v1.y;
      var z1 = v1.z;
      var x2 = v2.x;
      var y2 = v2.y;
      var z2 = v2.z;
      var d = x1 * x2 + y1 * y2 + z1 * z2;
      if (d == -1) {
        x2 = y1 * x1 - z1 * z1;
        y2 = -z1 * y1 - x1 * x1;
        z2 = x1 * z1 + y1 * y1;
        d = 1 / _Math.sqrt(x2 * x2 + y2 * y2 + z2 * z2);
        this.w = 0;
        this.x = x2 * d;
        this.y = y2 * d;
        this.z = z2 * d;
        return this;
      }
      var cx = y1 * z2 - z1 * y2;
      var cy = z1 * x2 - x1 * z2;
      var cz = x1 * y2 - y1 * x2;
      this.w = _Math.sqrt((1 + d) * 0.5);
      d = 0.5 / this.w;
      this.x = cx * d;
      this.y = cy * d;
      this.z = cz * d;
      return this;

    },

    normalize: function () {

      var l = this.length();
      if (l === 0) {
        this.set(0, 0, 0, 1);
      } else {
        l = 1 / l;
        this.x = this.x * l;
        this.y = this.y * l;
        this.z = this.z * l;
        this.w = this.w * l;
      }
      return this;

    },

    inverse: function () {

      return this.conjugate().normalize();

    },

    invert: function (q) {

      this.x = q.x;
      this.y = q.y;
      this.z = q.z;
      this.w = q.w;
      this.conjugate().normalize();
      return this;

    },

    conjugate: function () {

      this.x *= - 1;
      this.y *= - 1;
      this.z *= - 1;
      return this;

    },

    length: function () {

      return _Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);

    },

    lengthSq: function () {

      return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;

    },

    copy: function (q) {

      this.x = q.x;
      this.y = q.y;
      this.z = q.z;
      this.w = q.w;
      return this;

    },

    clone: function (q) {

      return new Quat(this.x, this.y, this.z, this.w);

    },

    testDiff: function (q) {

      return this.equals(q) ? false : true;

    },

    equals: function (q) {

      return this.x === q.x && this.y === q.y && this.z === q.z && this.w === q.w;

    },

    toString: function () {

      return "Quat[" + this.x.toFixed(4) + ", (" + this.y.toFixed(4) + ", " + this.z.toFixed(4) + ", " + this.w.toFixed(4) + ")]";

    },

    setFromEuler: function (x, y, z) {

      var c1 = Math.cos(x * 0.5);
      var c2 = Math.cos(y * 0.5);
      var c3 = Math.cos(z * 0.5);
      var s1 = Math.sin(x * 0.5);
      var s2 = Math.sin(y * 0.5);
      var s3 = Math.sin(z * 0.5);

      // XYZ
      this.x = s1 * c2 * c3 + c1 * s2 * s3;
      this.y = c1 * s2 * c3 - s1 * c2 * s3;
      this.z = c1 * c2 * s3 + s1 * s2 * c3;
      this.w = c1 * c2 * c3 - s1 * s2 * s3;

      return this;

    },

    setFromAxis: function (axis, rad) {

      axis.normalize();
      rad = rad * 0.5;
      var s = _Math.sin(rad);
      this.x = s * axis.x;
      this.y = s * axis.y;
      this.z = s * axis.z;
      this.w = _Math.cos(rad);
      return this;

    },

    setFromMat33: function (m) {

      var trace = m[0] + m[4] + m[8];
      var s;

      if (trace > 0) {

        s = _Math.sqrt(trace + 1.0);
        this.w = 0.5 / s;
        s = 0.5 / s;
        this.x = (m[5] - m[7]) * s;
        this.y = (m[6] - m[2]) * s;
        this.z = (m[1] - m[3]) * s;

      } else {

        var out = [];
        var i = 0;
        if (m[4] > m[0]) i = 1;
        if (m[8] > m[i * 3 + i]) i = 2;

        var j = (i + 1) % 3;
        var k = (i + 2) % 3;

        s = _Math.sqrt(m[i * 3 + i] - m[j * 3 + j] - m[k * 3 + k] + 1.0);
        out[i] = 0.5 * fRoot;
        s = 0.5 / fRoot;
        this.w = (m[j * 3 + k] - m[k * 3 + j]) * s;
        out[j] = (m[j * 3 + i] + m[i * 3 + j]) * s;
        out[k] = (m[k * 3 + i] + m[i * 3 + k]) * s;

        this.x = out[1];
        this.y = out[2];
        this.z = out[3];

      }

      return this;

    },

    toArray: function (array, offset) {

      offset = offset || 0;

      array[offset] = this.x;
      array[offset + 1] = this.y;
      array[offset + 2] = this.z;
      array[offset + 3] = this.w;

    },

    fromArray: function (array, offset) {

      offset = offset || 0;
      this.set(array[offset], array[offset + 1], array[offset + 2], array[offset + 3]);
      return this;

    }

  });

  function Mat33(e00, e01, e02, e10, e11, e12, e20, e21, e22) {

    this.elements = [
      1, 0, 0,
      0, 1, 0,
      0, 0, 1
    ];

    if (arguments.length > 0) {

      console.error('OIMO.Mat33: the constructor no longer reads arguments. use .set() instead.');

    }

  }

  Object.assign(Mat33.prototype, {

    Mat33: true,

    set: function (e00, e01, e02, e10, e11, e12, e20, e21, e22) {

      var te = this.elements;
      te[0] = e00; te[1] = e01; te[2] = e02;
      te[3] = e10; te[4] = e11; te[5] = e12;
      te[6] = e20; te[7] = e21; te[8] = e22;
      return this;

    },

    add: function (a, b) {

      if (b !== undefined) return this.addMatrixs(a, b);

      var e = this.elements, te = a.elements;
      e[0] += te[0]; e[1] += te[1]; e[2] += te[2];
      e[3] += te[3]; e[4] += te[4]; e[5] += te[5];
      e[6] += te[6]; e[7] += te[7]; e[8] += te[8];
      return this;

    },

    addMatrixs: function (a, b) {

      var te = this.elements, tem1 = a.elements, tem2 = b.elements;
      te[0] = tem1[0] + tem2[0]; te[1] = tem1[1] + tem2[1]; te[2] = tem1[2] + tem2[2];
      te[3] = tem1[3] + tem2[3]; te[4] = tem1[4] + tem2[4]; te[5] = tem1[5] + tem2[5];
      te[6] = tem1[6] + tem2[6]; te[7] = tem1[7] + tem2[7]; te[8] = tem1[8] + tem2[8];
      return this;

    },

    addEqual: function (m) {

      var te = this.elements, tem = m.elements;
      te[0] += tem[0]; te[1] += tem[1]; te[2] += tem[2];
      te[3] += tem[3]; te[4] += tem[4]; te[5] += tem[5];
      te[6] += tem[6]; te[7] += tem[7]; te[8] += tem[8];
      return this;

    },

    sub: function (a, b) {

      if (b !== undefined) return this.subMatrixs(a, b);

      var e = this.elements, te = a.elements;
      e[0] -= te[0]; e[1] -= te[1]; e[2] -= te[2];
      e[3] -= te[3]; e[4] -= te[4]; e[5] -= te[5];
      e[6] -= te[6]; e[7] -= te[7]; e[8] -= te[8];
      return this;

    },

    subMatrixs: function (a, b) {

      var te = this.elements, tem1 = a.elements, tem2 = b.elements;
      te[0] = tem1[0] - tem2[0]; te[1] = tem1[1] - tem2[1]; te[2] = tem1[2] - tem2[2];
      te[3] = tem1[3] - tem2[3]; te[4] = tem1[4] - tem2[4]; te[5] = tem1[5] - tem2[5];
      te[6] = tem1[6] - tem2[6]; te[7] = tem1[7] - tem2[7]; te[8] = tem1[8] - tem2[8];
      return this;

    },

    subEqual: function (m) {

      var te = this.elements, tem = m.elements;
      te[0] -= tem[0]; te[1] -= tem[1]; te[2] -= tem[2];
      te[3] -= tem[3]; te[4] -= tem[4]; te[5] -= tem[5];
      te[6] -= tem[6]; te[7] -= tem[7]; te[8] -= tem[8];
      return this;

    },

    scale: function (m, s) {

      var te = this.elements, tm = m.elements;
      te[0] = tm[0] * s; te[1] = tm[1] * s; te[2] = tm[2] * s;
      te[3] = tm[3] * s; te[4] = tm[4] * s; te[5] = tm[5] * s;
      te[6] = tm[6] * s; te[7] = tm[7] * s; te[8] = tm[8] * s;
      return this;

    },

    scaleEqual: function (s) {// multiplyScalar

      var te = this.elements;
      te[0] *= s; te[1] *= s; te[2] *= s;
      te[3] *= s; te[4] *= s; te[5] *= s;
      te[6] *= s; te[7] *= s; te[8] *= s;
      return this;

    },

    multiplyMatrices: function (m1, m2, transpose) {

      if (transpose) m2 = m2.clone().transpose();

      var te = this.elements;
      var tm1 = m1.elements;
      var tm2 = m2.elements;

      var a0 = tm1[0], a3 = tm1[3], a6 = tm1[6];
      var a1 = tm1[1], a4 = tm1[4], a7 = tm1[7];
      var a2 = tm1[2], a5 = tm1[5], a8 = tm1[8];

      var b0 = tm2[0], b3 = tm2[3], b6 = tm2[6];
      var b1 = tm2[1], b4 = tm2[4], b7 = tm2[7];
      var b2 = tm2[2], b5 = tm2[5], b8 = tm2[8];

      te[0] = a0 * b0 + a1 * b3 + a2 * b6;
      te[1] = a0 * b1 + a1 * b4 + a2 * b7;
      te[2] = a0 * b2 + a1 * b5 + a2 * b8;
      te[3] = a3 * b0 + a4 * b3 + a5 * b6;
      te[4] = a3 * b1 + a4 * b4 + a5 * b7;
      te[5] = a3 * b2 + a4 * b5 + a5 * b8;
      te[6] = a6 * b0 + a7 * b3 + a8 * b6;
      te[7] = a6 * b1 + a7 * b4 + a8 * b7;
      te[8] = a6 * b2 + a7 * b5 + a8 * b8;

      return this;

    },

    /*mul: function ( m1, m2, transpose ) {

        if( transpose ) m2 = m2.clone().transpose();

        var te = this.elements;
        var tm1 = m1.elements;
        var tm2 = m2.elements;
        //var tmp;

        var a0 = tm1[0], a3 = tm1[3], a6 = tm1[6];
        var a1 = tm1[1], a4 = tm1[4], a7 = tm1[7];
        var a2 = tm1[2], a5 = tm1[5], a8 = tm1[8];

        var b0 = tm2[0], b3 = tm2[3], b6 = tm2[6];
        var b1 = tm2[1], b4 = tm2[4], b7 = tm2[7];
        var b2 = tm2[2], b5 = tm2[5], b8 = tm2[8];

        /*if( transpose ){

            tmp = b1; b1 = b3; b3 = tmp;
            tmp = b2; b2 = b6; b6 = tmp;
            tmp = b5; b5 = b7; b7 = tmp;

        }

        te[0] = a0*b0 + a1*b3 + a2*b6;
        te[1] = a0*b1 + a1*b4 + a2*b7;
        te[2] = a0*b2 + a1*b5 + a2*b8;
        te[3] = a3*b0 + a4*b3 + a5*b6;
        te[4] = a3*b1 + a4*b4 + a5*b7;
        te[5] = a3*b2 + a4*b5 + a5*b8;
        te[6] = a6*b0 + a7*b3 + a8*b6;
        te[7] = a6*b1 + a7*b4 + a8*b7;
        te[8] = a6*b2 + a7*b5 + a8*b8;

        return this;

    },*/

    transpose: function (m) {

      if (m !== undefined) {
        var a = m.elements;
        this.set(a[0], a[3], a[6], a[1], a[4], a[7], a[2], a[5], a[8]);
        return this;
      }

      var te = this.elements;
      var a01 = te[1], a02 = te[2], a12 = te[5];
      te[1] = te[3];
      te[2] = te[6];
      te[3] = a01;
      te[5] = te[7];
      te[6] = a02;
      te[7] = a12;
      return this;

    },



    /*mulScale: function ( m, sx, sy, sz, Prepend ) {

        var prepend = Prepend || false;
        var te = this.elements, tm = m.elements;
        if(prepend){
            te[0] = sx*tm[0]; te[1] = sx*tm[1]; te[2] = sx*tm[2];
            te[3] = sy*tm[3]; te[4] = sy*tm[4]; te[5] = sy*tm[5];
            te[6] = sz*tm[6]; te[7] = sz*tm[7]; te[8] = sz*tm[8];
        }else{
            te[0] = tm[0]*sx; te[1] = tm[1]*sy; te[2] = tm[2]*sz;
            te[3] = tm[3]*sx; te[4] = tm[4]*sy; te[5] = tm[5]*sz;
            te[6] = tm[6]*sx; te[7] = tm[7]*sy; te[8] = tm[8]*sz;
        }
        return this;

    },

    transpose: function ( m ) {

        var te = this.elements, tm = m.elements;
        te[0] = tm[0]; te[1] = tm[3]; te[2] = tm[6];
        te[3] = tm[1]; te[4] = tm[4]; te[5] = tm[7];
        te[6] = tm[2]; te[7] = tm[5]; te[8] = tm[8];
        return this;

    },*/

    setQuat: function (q) {

      var te = this.elements;
      var x = q.x, y = q.y, z = q.z, w = q.w;
      var x2 = x + x, y2 = y + y, z2 = z + z;
      var xx = x * x2, xy = x * y2, xz = x * z2;
      var yy = y * y2, yz = y * z2, zz = z * z2;
      var wx = w * x2, wy = w * y2, wz = w * z2;

      te[0] = 1 - (yy + zz);
      te[1] = xy - wz;
      te[2] = xz + wy;

      te[3] = xy + wz;
      te[4] = 1 - (xx + zz);
      te[5] = yz - wx;

      te[6] = xz - wy;
      te[7] = yz + wx;
      te[8] = 1 - (xx + yy);

      return this;

    },

    invert: function (m) {

      var te = this.elements, tm = m.elements,
        a00 = tm[0], a10 = tm[3], a20 = tm[6],
        a01 = tm[1], a11 = tm[4], a21 = tm[7],
        a02 = tm[2], a12 = tm[5], a22 = tm[8],
        b01 = a22 * a11 - a12 * a21,
        b11 = -a22 * a10 + a12 * a20,
        b21 = a21 * a10 - a11 * a20,
        det = a00 * b01 + a01 * b11 + a02 * b21;

      if (det === 0) {
        console.log("can't invert matrix, determinant is 0");
        return this.identity();
      }

      det = 1.0 / det;
      te[0] = b01 * det;
      te[1] = (-a22 * a01 + a02 * a21) * det;
      te[2] = (a12 * a01 - a02 * a11) * det;
      te[3] = b11 * det;
      te[4] = (a22 * a00 - a02 * a20) * det;
      te[5] = (-a12 * a00 + a02 * a10) * det;
      te[6] = b21 * det;
      te[7] = (-a21 * a00 + a01 * a20) * det;
      te[8] = (a11 * a00 - a01 * a10) * det;
      return this;

    },

    addOffset: function (m, v) {

      var relX = v.x;
      var relY = v.y;
      var relZ = v.z;

      var te = this.elements;
      te[0] += m * (relY * relY + relZ * relZ);
      te[4] += m * (relX * relX + relZ * relZ);
      te[8] += m * (relX * relX + relY * relY);
      var xy = m * relX * relY;
      var yz = m * relY * relZ;
      var zx = m * relZ * relX;
      te[1] -= xy;
      te[3] -= xy;
      te[2] -= yz;
      te[6] -= yz;
      te[5] -= zx;
      te[7] -= zx;
      return this;

    },

    subOffset: function (m, v) {

      var relX = v.x;
      var relY = v.y;
      var relZ = v.z;

      var te = this.elements;
      te[0] -= m * (relY * relY + relZ * relZ);
      te[4] -= m * (relX * relX + relZ * relZ);
      te[8] -= m * (relX * relX + relY * relY);
      var xy = m * relX * relY;
      var yz = m * relY * relZ;
      var zx = m * relZ * relX;
      te[1] += xy;
      te[3] += xy;
      te[2] += yz;
      te[6] += yz;
      te[5] += zx;
      te[7] += zx;
      return this;

    },

    // OK 

    multiplyScalar: function (s) {

      var te = this.elements;

      te[0] *= s; te[3] *= s; te[6] *= s;
      te[1] *= s; te[4] *= s; te[7] *= s;
      te[2] *= s; te[5] *= s; te[8] *= s;

      return this;

    },

    identity: function () {

      this.set(1, 0, 0, 0, 1, 0, 0, 0, 1);
      return this;

    },


    clone: function () {

      return new Mat33().fromArray(this.elements);

    },

    copy: function (m) {

      for (var i = 0; i < 9; i++) this.elements[i] = m.elements[i];
      return this;

    },

    determinant: function () {

      var te = this.elements;
      var a = te[0], b = te[1], c = te[2],
        d = te[3], e = te[4], f = te[5],
        g = te[6], h = te[7], i = te[8];

      return a * e * i - a * f * h - b * d * i + b * f * g + c * d * h - c * e * g;

    },

    fromArray: function (array, offset) {

      if (offset === undefined) offset = 0;

      for (var i = 0; i < 9; i++) {

        this.elements[i] = array[i + offset];

      }

      return this;

    },

    toArray: function (array, offset) {

      if (array === undefined) array = [];
      if (offset === undefined) offset = 0;

      var te = this.elements;

      array[offset] = te[0];
      array[offset + 1] = te[1];
      array[offset + 2] = te[2];

      array[offset + 3] = te[3];
      array[offset + 4] = te[4];
      array[offset + 5] = te[5];

      array[offset + 6] = te[6];
      array[offset + 7] = te[7];
      array[offset + 8] = te[8];

      return array;

    }


  });

  /**
   * An axis-aligned bounding box.
   *
   * @author saharan
   * @author lo-th
   */

  function AABB(minX, maxX, minY, maxY, minZ, maxZ) {

    this.elements = new Float32Array(6);
    var te = this.elements;

    te[0] = minX || 0; te[1] = minY || 0; te[2] = minZ || 0;
    te[3] = maxX || 0; te[4] = maxY || 0; te[5] = maxZ || 0;

  }
  Object.assign(AABB.prototype, {

    AABB: true,

    set: function (minX, maxX, minY, maxY, minZ, maxZ) {

      var te = this.elements;
      te[0] = minX;
      te[3] = maxX;
      te[1] = minY;
      te[4] = maxY;
      te[2] = minZ;
      te[5] = maxZ;
      return this;
    },

    intersectTest: function (aabb) {

      var te = this.elements;
      var ue = aabb.elements;
      return te[0] > ue[3] || te[1] > ue[4] || te[2] > ue[5] || te[3] < ue[0] || te[4] < ue[1] || te[5] < ue[2] ? true : false;

    },

    intersectTestTwo: function (aabb) {

      var te = this.elements;
      var ue = aabb.elements;
      return te[0] < ue[0] || te[1] < ue[1] || te[2] < ue[2] || te[3] > ue[3] || te[4] > ue[4] || te[5] > ue[5] ? true : false;

    },

    clone: function () {

      return new this.constructor().fromArray(this.elements);

    },

    copy: function (aabb, margin) {

      var m = margin || 0;
      var me = aabb.elements;
      this.set(me[0] - m, me[3] + m, me[1] - m, me[4] + m, me[2] - m, me[5] + m);
      return this;

    },

    fromArray: function (array) {

      this.elements.set(array);
      return this;

    },

    // Set this AABB to the combined AABB of aabb1 and aabb2.

    combine: function (aabb1, aabb2) {

      var a = aabb1.elements;
      var b = aabb2.elements;
      var te = this.elements;

      te[0] = a[0] < b[0] ? a[0] : b[0];
      te[1] = a[1] < b[1] ? a[1] : b[1];
      te[2] = a[2] < b[2] ? a[2] : b[2];

      te[3] = a[3] > b[3] ? a[3] : b[3];
      te[4] = a[4] > b[4] ? a[4] : b[4];
      te[5] = a[5] > b[5] ? a[5] : b[5];

      return this;

    },


    // Get the surface area.

    surfaceArea: function () {

      var te = this.elements;
      var a = te[3] - te[0];
      var h = te[4] - te[1];
      var d = te[5] - te[2];
      return 2 * (a * (h + d) + h * d);

    },


    // Get whether the AABB intersects with the point or not.

    intersectsWithPoint: function (x, y, z) {

      var te = this.elements;
      return x >= te[0] && x <= te[3] && y >= te[1] && y <= te[4] && z >= te[2] && z <= te[5];

    },

    /**
     * Set the AABB from an array
     * of vertices. From THREE.
     * @author WestLangley
     * @author xprogram
     */

    setFromPoints: function (arr) {
      this.makeEmpty();
      for (var i = 0; i < arr.length; i++) {
        this.expandByPoint(arr[i]);
      }
    },

    makeEmpty: function () {
      this.set(-Infinity, -Infinity, -Infinity, Infinity, Infinity, Infinity);
    },

    expandByPoint: function (pt) {
      var te = this.elements;
      this.set(
        _Math.min(te[0], pt.x), _Math.min(te[1], pt.y), _Math.min(te[2], pt.z),
        _Math.max(te[3], pt.x), _Math.max(te[4], pt.y), _Math.max(te[5], pt.z)
      );
    },

    expandByScalar: function (s) {

      var te = this.elements;
      te[0] += -s;
      te[1] += -s;
      te[2] += -s;
      te[3] += s;
      te[4] += s;
      te[5] += s;
    }

  });

  var count = 0;
  function ShapeIdCount() { return count++; }

  /**
   * A shape is used to detect collisions of rigid bodies.
   *
   * @author saharan
   * @author lo-th
   */

  function Shape(config) {

    this.type = SHAPE_NULL;

    // global identification of the shape should be unique to the shape.
    this.id = ShapeIdCount();

    // previous shape in parent rigid body. Used for fast interations.
    this.prev = null;

    // next shape in parent rigid body. Used for fast interations.
    this.next = null;

    // proxy of the shape used for broad-phase collision detection.
    this.proxy = null;

    // parent rigid body of the shape.
    this.parent = null;

    // linked list of the contacts with the shape.
    this.contactLink = null;

    // number of the contacts with the shape.
    this.numContacts = 0;

    // center of gravity of the shape in world coordinate system.
    this.position = new Vec3();

    // rotation matrix of the shape in world coordinate system.
    this.rotation = new Mat33();

    // position of the shape in parent's coordinate system.
    this.relativePosition = new Vec3().copy(config.relativePosition);

    // rotation matrix of the shape in parent's coordinate system.
    this.relativeRotation = new Mat33().copy(config.relativeRotation);

    // axis-aligned bounding box of the shape.
    this.aabb = new AABB();

    // density of the shape.
    this.density = config.density;

    // coefficient of friction of the shape.
    this.friction = config.friction;

    // coefficient of restitution of the shape.
    this.restitution = config.restitution;

    // bits of the collision groups to which the shape belongs.
    this.belongsTo = config.belongsTo;

    // bits of the collision groups with which the shape collides.
    this.collidesWith = config.collidesWith;

  }
  Object.assign(Shape.prototype, {

    Shape: true,

    // Calculate the mass information of the shape.

    calculateMassInfo: function (out) {

      printError("Shape", "Inheritance error.");

    },

    // Update the proxy of the shape.

    updateProxy: function () {

      printError("Shape", "Inheritance error.");

    }

  });

  /**
   * Box shape.
   * @author saharan
   * @author lo-th
   */

  function Box(config, Width, Height, Depth) {

    Shape.call(this, config);

    this.type = SHAPE_BOX;

    this.width = Width;
    this.height = Height;
    this.depth = Depth;

    this.halfWidth = Width * 0.5;
    this.halfHeight = Height * 0.5;
    this.halfDepth = Depth * 0.5;

    this.dimentions = new Float32Array(18);
    this.elements = new Float32Array(24);

  }
  Box.prototype = Object.assign(Object.create(Shape.prototype), {

    constructor: Box,

    calculateMassInfo: function (out) {

      var mass = this.width * this.height * this.depth * this.density;
      var divid = 1 / 12;
      out.mass = mass;
      out.inertia.set(
        mass * (this.height * this.height + this.depth * this.depth) * divid, 0, 0,
        0, mass * (this.width * this.width + this.depth * this.depth) * divid, 0,
        0, 0, mass * (this.width * this.width + this.height * this.height) * divid
      );

    },

    updateProxy: function () {

      var te = this.rotation.elements;
      var di = this.dimentions;
      // Width
      di[0] = te[0];
      di[1] = te[3];
      di[2] = te[6];
      // Height
      di[3] = te[1];
      di[4] = te[4];
      di[5] = te[7];
      // Depth
      di[6] = te[2];
      di[7] = te[5];
      di[8] = te[8];
      // half Width
      di[9] = te[0] * this.halfWidth;
      di[10] = te[3] * this.halfWidth;
      di[11] = te[6] * this.halfWidth;
      // half Height
      di[12] = te[1] * this.halfHeight;
      di[13] = te[4] * this.halfHeight;
      di[14] = te[7] * this.halfHeight;
      // half Depth
      di[15] = te[2] * this.halfDepth;
      di[16] = te[5] * this.halfDepth;
      di[17] = te[8] * this.halfDepth;

      var wx = di[9];
      var wy = di[10];
      var wz = di[11];
      var hx = di[12];
      var hy = di[13];
      var hz = di[14];
      var dx = di[15];
      var dy = di[16];
      var dz = di[17];

      var x = this.position.x;
      var y = this.position.y;
      var z = this.position.z;

      var v = this.elements;
      //v1
      v[0] = x + wx + hx + dx;
      v[1] = y + wy + hy + dy;
      v[2] = z + wz + hz + dz;
      //v2
      v[3] = x + wx + hx - dx;
      v[4] = y + wy + hy - dy;
      v[5] = z + wz + hz - dz;
      //v3
      v[6] = x + wx - hx + dx;
      v[7] = y + wy - hy + dy;
      v[8] = z + wz - hz + dz;
      //v4
      v[9] = x + wx - hx - dx;
      v[10] = y + wy - hy - dy;
      v[11] = z + wz - hz - dz;
      //v5
      v[12] = x - wx + hx + dx;
      v[13] = y - wy + hy + dy;
      v[14] = z - wz + hz + dz;
      //v6
      v[15] = x - wx + hx - dx;
      v[16] = y - wy + hy - dy;
      v[17] = z - wz + hz - dz;
      //v7
      v[18] = x - wx - hx + dx;
      v[19] = y - wy - hy + dy;
      v[20] = z - wz - hz + dz;
      //v8
      v[21] = x - wx - hx - dx;
      v[22] = y - wy - hy - dy;
      v[23] = z - wz - hz - dz;

      var w = di[9] < 0 ? -di[9] : di[9];
      var h = di[10] < 0 ? -di[10] : di[10];
      var d = di[11] < 0 ? -di[11] : di[11];

      w = di[12] < 0 ? w - di[12] : w + di[12];
      h = di[13] < 0 ? h - di[13] : h + di[13];
      d = di[14] < 0 ? d - di[14] : d + di[14];

      w = di[15] < 0 ? w - di[15] : w + di[15];
      h = di[16] < 0 ? h - di[16] : h + di[16];
      d = di[17] < 0 ? d - di[17] : d + di[17];

      var p = AABB_PROX;

      this.aabb.set(
        this.position.x - w - p, this.position.x + w + p,
        this.position.y - h - p, this.position.y + h + p,
        this.position.z - d - p, this.position.z + d + p
      );

      if (this.proxy != null) this.proxy.update();

    }
  });

  /**
   * Sphere shape
   * @author saharan
   * @author lo-th
   */

  function Sphere(config, radius) {

    Shape.call(this, config);

    this.type = SHAPE_SPHERE;

    // radius of the shape.
    this.radius = radius;

  }
  Sphere.prototype = Object.assign(Object.create(Shape.prototype), {

    constructor: Sphere,

    volume: function () {

      return _Math.PI * this.radius * 1.333333;

    },

    calculateMassInfo: function (out) {

      var mass = this.volume() * this.radius * this.radius * this.density; //1.333 * _Math.PI * this.radius * this.radius * this.radius * this.density;
      out.mass = mass;
      var inertia = mass * this.radius * this.radius * 0.4;
      out.inertia.set(inertia, 0, 0, 0, inertia, 0, 0, 0, inertia);

    },

    updateProxy: function () {

      var p = AABB_PROX;

      this.aabb.set(
        this.position.x - this.radius - p, this.position.x + this.radius + p,
        this.position.y - this.radius - p, this.position.y + this.radius + p,
        this.position.z - this.radius - p, this.position.z + this.radius + p
      );

      if (this.proxy != null) this.proxy.update();

    }

  });

  /**
   * Cylinder shape
   * @author saharan
   * @author lo-th
   */

  function Cylinder(config, radius, height) {

    Shape.call(this, config);

    this.type = SHAPE_CYLINDER;

    this.radius = radius;
    this.height = height;
    this.halfHeight = height * 0.5;

    this.normalDirection = new Vec3();
    this.halfDirection = new Vec3();

  }
  Cylinder.prototype = Object.assign(Object.create(Shape.prototype), {

    constructor: Cylinder,

    calculateMassInfo: function (out) {

      var rsq = this.radius * this.radius;
      var mass = _Math.PI * rsq * this.height * this.density;
      var inertiaXZ = ((0.25 * rsq) + (0.0833 * this.height * this.height)) * mass;
      var inertiaY = 0.5 * rsq;
      out.mass = mass;
      out.inertia.set(inertiaXZ, 0, 0, 0, inertiaY, 0, 0, 0, inertiaXZ);

    },

    updateProxy: function () {

      var te = this.rotation.elements;
      var len, wx, hy, dz, xx, yy, zz, w, h, d, p;

      xx = te[1] * te[1];
      yy = te[4] * te[4];
      zz = te[7] * te[7];

      this.normalDirection.set(te[1], te[4], te[7]);
      this.halfDirection.scale(this.normalDirection, this.halfHeight);

      wx = 1 - xx;
      len = _Math.sqrt(wx * wx + xx * yy + xx * zz);
      if (len > 0) len = this.radius / len;
      wx *= len;
      hy = 1 - yy;
      len = _Math.sqrt(yy * xx + hy * hy + yy * zz);
      if (len > 0) len = this.radius / len;
      hy *= len;
      dz = 1 - zz;
      len = _Math.sqrt(zz * xx + zz * yy + dz * dz);
      if (len > 0) len = this.radius / len;
      dz *= len;

      w = this.halfDirection.x < 0 ? -this.halfDirection.x : this.halfDirection.x;
      h = this.halfDirection.y < 0 ? -this.halfDirection.y : this.halfDirection.y;
      d = this.halfDirection.z < 0 ? -this.halfDirection.z : this.halfDirection.z;

      w = wx < 0 ? w - wx : w + wx;
      h = hy < 0 ? h - hy : h + hy;
      d = dz < 0 ? d - dz : d + dz;

      p = AABB_PROX;

      this.aabb.set(
        this.position.x - w - p, this.position.x + w + p,
        this.position.y - h - p, this.position.y + h + p,
        this.position.z - d - p, this.position.z + d + p
      );

      if (this.proxy != null) this.proxy.update();

    }

  });

  /**
   * Plane shape.
   * @author lo-th
   */

  function Plane(config, normal) {

    Shape.call(this, config);

    this.type = SHAPE_PLANE;

    // radius of the shape.
    this.normal = new Vec3(0, 1, 0);

  }
  Plane.prototype = Object.assign(Object.create(Shape.prototype), {

    constructor: Plane,

    volume: function () {

      return Number.MAX_VALUE;

    },

    calculateMassInfo: function (out) {

      out.mass = this.density;//0.0001;
      var inertia = 1;
      out.inertia.set(inertia, 0, 0, 0, inertia, 0, 0, 0, inertia);

    },

    updateProxy: function () {

      var p = AABB_PROX;

      var min = -_Math.INF;
      var max = _Math.INF;
      var n = this.normal;
      // The plane AABB is infinite, except if the normal is pointing along any axis
      this.aabb.set(
        n.x === -1 ? this.position.x - p : min, n.x === 1 ? this.position.x + p : max,
        n.y === -1 ? this.position.y - p : min, n.y === 1 ? this.position.y + p : max,
        n.z === -1 ? this.position.z - p : min, n.z === 1 ? this.position.z + p : max
      );

      if (this.proxy != null) this.proxy.update();

    }

  });

  /**
   * A Particule shape
   * @author lo-th
   */

  function Particle(config, normal) {

    Shape.call(this, config);

    this.type = SHAPE_PARTICLE;

  }
  Particle.prototype = Object.assign(Object.create(Shape.prototype), {

    constructor: Particle,

    volume: function () {

      return Number.MAX_VALUE;

    },

    calculateMassInfo: function (out) {

      var inertia = 0;
      out.inertia.set(inertia, 0, 0, 0, inertia, 0, 0, 0, inertia);

    },

    updateProxy: function () {

      var p = 0;//AABB_PROX;

      this.aabb.set(
        this.position.x - p, this.position.x + p,
        this.position.y - p, this.position.y + p,
        this.position.z - p, this.position.z + p
      );

      if (this.proxy != null) this.proxy.update();

    }

  });

  /**
   * A shape configuration holds common configuration data for constructing a shape.
   * These configurations can be reused safely.
   *
   * @author saharan
   * @author lo-th
   */

  function ShapeConfig() {

    // position of the shape in parent's coordinate system.
    this.relativePosition = new Vec3();
    // rotation matrix of the shape in parent's coordinate system.
    this.relativeRotation = new Mat33();
    // coefficient of friction of the shape.
    this.friction = 0.2; // 0.4
    // coefficient of restitution of the shape.
    this.restitution = 0.2;
    // density of the shape.
    this.density = 1;
    // bits of the collision groups to which the shape belongs.
    this.belongsTo = 1;
    // bits of the collision groups with which the shape collides.
    this.collidesWith = 0xffffffff;

  }

  /**
  * An information of limit and motor.
  *
  * @author saharan
  */

  function LimitMotor(axis, fixed) {

    fixed = fixed || false;
    // The axis of the constraint.
    this.axis = axis;
    // The current angle for rotational constraints.
    this.angle = 0;
    // The lower limit. Set lower > upper to disable
    this.lowerLimit = fixed ? 0 : 1;

    //  The upper limit. Set lower > upper to disable.
    this.upperLimit = 0;
    // The target motor speed.
    this.motorSpeed = 0;
    // The maximum motor force or torque. Set 0 to disable.
    this.maxMotorForce = 0;
    // The frequency of the spring. Set 0 to disable.
    this.frequency = 0;
    // The damping ratio of the spring. Set 0 for no damping, 1 for critical damping.
    this.dampingRatio = 0;

  }
  Object.assign(LimitMotor.prototype, {

    LimitMotor: true,

    // Set limit data into this constraint.
    setLimit: function (lowerLimit, upperLimit) {

      this.lowerLimit = lowerLimit;
      this.upperLimit = upperLimit;

    },

    // Set motor data into this constraint.
    setMotor: function (motorSpeed, maxMotorForce) {

      this.motorSpeed = motorSpeed;
      this.maxMotorForce = maxMotorForce;

    },

    // Set spring data into this constraint.
    setSpring: function (frequency, dampingRatio) {

      this.frequency = frequency;
      this.dampingRatio = dampingRatio;

    }

  });

  /**
   * The base class of all type of the constraints.
   *
   * @author saharan
   * @author lo-th
   */

  function Constraint() {

    // parent world of the constraint.
    this.parent = null;

    // first body of the constraint.
    this.body1 = null;

    // second body of the constraint.
    this.body2 = null;

    // Internal
    this.addedToIsland = false;

  }

  Object.assign(Constraint.prototype, {

    Constraint: true,

    // Prepare for solving the constraint
    preSolve: function (timeStep, invTimeStep) {

      printError("Constraint", "Inheritance error.");

    },

    // Solve the constraint. This is usually called iteratively.
    solve: function () {

      printError("Constraint", "Inheritance error.");

    },

    // Do the post-processing.
    postSolve: function () {

      printError("Constraint", "Inheritance error.");

    }

  });

  function JointLink(joint) {

    // The previous joint link.
    this.prev = null;
    // The next joint link.
    this.next = null;
    // The other rigid body connected to the joint.
    this.body = null;
    // The joint of the link.
    this.joint = joint;

  }

  /**
   * Joints are used to constrain the motion between two rigid bodies.
   *
   * @author saharan
   * @author lo-th
   */

  function Joint(config) {

    Constraint.call(this);

    this.scale = 1;
    this.invScale = 1;

    // joint name
    this.name = "";
    this.id = NaN;

    // The type of the joint.
    this.type = JOINT_NULL;
    //  The previous joint in the world.
    this.prev = null;
    // The next joint in the world.
    this.next = null;

    this.body1 = config.body1;
    this.body2 = config.body2;

    // anchor point on the first rigid body in local coordinate system.
    this.localAnchorPoint1 = new Vec3().copy(config.localAnchorPoint1);
    // anchor point on the second rigid body in local coordinate system.
    this.localAnchorPoint2 = new Vec3().copy(config.localAnchorPoint2);
    // anchor point on the first rigid body in world coordinate system relative to the body's origin.
    this.relativeAnchorPoint1 = new Vec3();
    // anchor point on the second rigid body in world coordinate system relative to the body's origin.
    this.relativeAnchorPoint2 = new Vec3();
    //  anchor point on the first rigid body in world coordinate system.
    this.anchorPoint1 = new Vec3();
    // anchor point on the second rigid body in world coordinate system.
    this.anchorPoint2 = new Vec3();
    // Whether allow collision between connected rigid bodies or not.
    this.allowCollision = config.allowCollision;

    this.b1Link = new JointLink(this);
    this.b2Link = new JointLink(this);

  }
  Joint.prototype = Object.assign(Object.create(Constraint.prototype), {

    constructor: Joint,

    setId: function (n) {

      this.id = i;

    },

    setParent: function (world) {

      this.parent = world;
      this.scale = this.parent.scale;
      this.invScale = this.parent.invScale;
      this.id = this.parent.numJoints;
      if (!this.name) this.name = 'J' + this.id;

    },

    // Update all the anchor points.

    updateAnchorPoints: function () {

      this.relativeAnchorPoint1.copy(this.localAnchorPoint1).applyMatrix3(this.body1.rotation, true);
      this.relativeAnchorPoint2.copy(this.localAnchorPoint2).applyMatrix3(this.body2.rotation, true);

      this.anchorPoint1.add(this.relativeAnchorPoint1, this.body1.position);
      this.anchorPoint2.add(this.relativeAnchorPoint2, this.body2.position);

    },

    // Attach the joint from the bodies.

    attach: function (isX) {

      this.b1Link.body = this.body2;
      this.b2Link.body = this.body1;

      if (isX) {

        this.body1.jointLink.push(this.b1Link);
        this.body2.jointLink.push(this.b2Link);
      } else {

        if (this.body1.jointLink != null) (this.b1Link.next = this.body1.jointLink).prev = this.b1Link;
        else this.b1Link.next = null;
        this.body1.jointLink = this.b1Link;
        this.body1.numJoints++;
        if (this.body2.jointLink != null) (this.b2Link.next = this.body2.jointLink).prev = this.b2Link;
        else this.b2Link.next = null;
        this.body2.jointLink = this.b2Link;
        this.body2.numJoints++;

      }

    },

    // Detach the joint from the bodies.

    detach: function (isX) {

      if (isX) {

        this.body1.jointLink.splice(this.body1.jointLink.indexOf(this.b1Link), 1);
        this.body2.jointLink.splice(this.body2.jointLink.indexOf(this.b2Link), 1);

      } else {

        var prev = this.b1Link.prev;
        var next = this.b1Link.next;
        if (prev != null) prev.next = next;
        if (next != null) next.prev = prev;
        if (this.body1.jointLink == this.b1Link) this.body1.jointLink = next;
        this.b1Link.prev = null;
        this.b1Link.next = null;
        this.b1Link.body = null;
        this.body1.numJoints--;

        prev = this.b2Link.prev;
        next = this.b2Link.next;
        if (prev != null) prev.next = next;
        if (next != null) next.prev = prev;
        if (this.body2.jointLink == this.b2Link) this.body2.jointLink = next;
        this.b2Link.prev = null;
        this.b2Link.next = null;
        this.b2Link.body = null;
        this.body2.numJoints--;

      }

      this.b1Link.body = null;
      this.b2Link.body = null;

    },


    // Awake the bodies.

    awake: function () {

      this.body1.awake();
      this.body2.awake();

    },

    // calculation function

    preSolve: function (timeStep, invTimeStep) {

    },

    solve: function () {

    },

    postSolve: function () {

    },

    // Delete process

    remove: function () {

      this.dispose();

    },

    dispose: function () {

      this.parent.removeJoint(this);

    },


    // Three js add

    getPosition: function () {

      var p1 = new Vec3().scale(this.anchorPoint1, this.scale);
      var p2 = new Vec3().scale(this.anchorPoint2, this.scale);
      return [p1, p2];

    }

  });

  /**
  * A linear constraint for all axes for various joints.
  * @author saharan
  */
  function LinearConstraint(joint) {

    this.m1 = NaN;
    this.m2 = NaN;

    this.ii1 = null;
    this.ii2 = null;
    this.dd = null;

    this.r1x = NaN;
    this.r1y = NaN;
    this.r1z = NaN;

    this.r2x = NaN;
    this.r2y = NaN;
    this.r2z = NaN;

    this.ax1x = NaN;
    this.ax1y = NaN;
    this.ax1z = NaN;
    this.ay1x = NaN;
    this.ay1y = NaN;
    this.ay1z = NaN;
    this.az1x = NaN;
    this.az1y = NaN;
    this.az1z = NaN;

    this.ax2x = NaN;
    this.ax2y = NaN;
    this.ax2z = NaN;
    this.ay2x = NaN;
    this.ay2y = NaN;
    this.ay2z = NaN;
    this.az2x = NaN;
    this.az2y = NaN;
    this.az2z = NaN;

    this.vel = NaN;
    this.velx = NaN;
    this.vely = NaN;
    this.velz = NaN;


    this.joint = joint;
    this.r1 = joint.relativeAnchorPoint1;
    this.r2 = joint.relativeAnchorPoint2;
    this.p1 = joint.anchorPoint1;
    this.p2 = joint.anchorPoint2;
    this.b1 = joint.body1;
    this.b2 = joint.body2;
    this.l1 = this.b1.linearVelocity;
    this.l2 = this.b2.linearVelocity;
    this.a1 = this.b1.angularVelocity;
    this.a2 = this.b2.angularVelocity;
    this.i1 = this.b1.inverseInertia;
    this.i2 = this.b2.inverseInertia;
    this.impx = 0;
    this.impy = 0;
    this.impz = 0;

  }

  Object.assign(LinearConstraint.prototype, {

    LinearConstraint: true,

    preSolve: function (timeStep, invTimeStep) {

      this.r1x = this.r1.x;
      this.r1y = this.r1.y;
      this.r1z = this.r1.z;

      this.r2x = this.r2.x;
      this.r2y = this.r2.y;
      this.r2z = this.r2.z;

      this.m1 = this.b1.inverseMass;
      this.m2 = this.b2.inverseMass;

      this.ii1 = this.i1.clone();
      this.ii2 = this.i2.clone();

      var ii1 = this.ii1.elements;
      var ii2 = this.ii2.elements;

      this.ax1x = this.r1z * ii1[1] + -this.r1y * ii1[2];
      this.ax1y = this.r1z * ii1[4] + -this.r1y * ii1[5];
      this.ax1z = this.r1z * ii1[7] + -this.r1y * ii1[8];
      this.ay1x = -this.r1z * ii1[0] + this.r1x * ii1[2];
      this.ay1y = -this.r1z * ii1[3] + this.r1x * ii1[5];
      this.ay1z = -this.r1z * ii1[6] + this.r1x * ii1[8];
      this.az1x = this.r1y * ii1[0] + -this.r1x * ii1[1];
      this.az1y = this.r1y * ii1[3] + -this.r1x * ii1[4];
      this.az1z = this.r1y * ii1[6] + -this.r1x * ii1[7];
      this.ax2x = this.r2z * ii2[1] + -this.r2y * ii2[2];
      this.ax2y = this.r2z * ii2[4] + -this.r2y * ii2[5];
      this.ax2z = this.r2z * ii2[7] + -this.r2y * ii2[8];
      this.ay2x = -this.r2z * ii2[0] + this.r2x * ii2[2];
      this.ay2y = -this.r2z * ii2[3] + this.r2x * ii2[5];
      this.ay2z = -this.r2z * ii2[6] + this.r2x * ii2[8];
      this.az2x = this.r2y * ii2[0] + -this.r2x * ii2[1];
      this.az2y = this.r2y * ii2[3] + -this.r2x * ii2[4];
      this.az2z = this.r2y * ii2[6] + -this.r2x * ii2[7];

      // calculate point-to-point mass matrix
      // from impulse equation
      // 
      // M = ([/m] - [r^][/I][r^]) ^ -1
      // 
      // where
      // 
      // [/m] = |1/m, 0, 0|
      //        |0, 1/m, 0|
      //        |0, 0, 1/m|
      // 
      // [r^] = |0, -rz, ry|
      //        |rz, 0, -rx|
      //        |-ry, rx, 0|
      // 
      // [/I] = Inverted moment inertia

      var rxx = this.m1 + this.m2;

      var kk = new Mat33().set(rxx, 0, 0, 0, rxx, 0, 0, 0, rxx);
      var k = kk.elements;

      k[0] += ii1[4] * this.r1z * this.r1z - (ii1[7] + ii1[5]) * this.r1y * this.r1z + ii1[8] * this.r1y * this.r1y;
      k[1] += (ii1[6] * this.r1y + ii1[5] * this.r1x) * this.r1z - ii1[3] * this.r1z * this.r1z - ii1[8] * this.r1x * this.r1y;
      k[2] += (ii1[3] * this.r1y - ii1[4] * this.r1x) * this.r1z - ii1[6] * this.r1y * this.r1y + ii1[7] * this.r1x * this.r1y;
      k[3] += (ii1[2] * this.r1y + ii1[7] * this.r1x) * this.r1z - ii1[1] * this.r1z * this.r1z - ii1[8] * this.r1x * this.r1y;
      k[4] += ii1[0] * this.r1z * this.r1z - (ii1[6] + ii1[2]) * this.r1x * this.r1z + ii1[8] * this.r1x * this.r1x;
      k[5] += (ii1[1] * this.r1x - ii1[0] * this.r1y) * this.r1z - ii1[7] * this.r1x * this.r1x + ii1[6] * this.r1x * this.r1y;
      k[6] += (ii1[1] * this.r1y - ii1[4] * this.r1x) * this.r1z - ii1[2] * this.r1y * this.r1y + ii1[5] * this.r1x * this.r1y;
      k[7] += (ii1[3] * this.r1x - ii1[0] * this.r1y) * this.r1z - ii1[5] * this.r1x * this.r1x + ii1[2] * this.r1x * this.r1y;
      k[8] += ii1[0] * this.r1y * this.r1y - (ii1[3] + ii1[1]) * this.r1x * this.r1y + ii1[4] * this.r1x * this.r1x;

      k[0] += ii2[4] * this.r2z * this.r2z - (ii2[7] + ii2[5]) * this.r2y * this.r2z + ii2[8] * this.r2y * this.r2y;
      k[1] += (ii2[6] * this.r2y + ii2[5] * this.r2x) * this.r2z - ii2[3] * this.r2z * this.r2z - ii2[8] * this.r2x * this.r2y;
      k[2] += (ii2[3] * this.r2y - ii2[4] * this.r2x) * this.r2z - ii2[6] * this.r2y * this.r2y + ii2[7] * this.r2x * this.r2y;
      k[3] += (ii2[2] * this.r2y + ii2[7] * this.r2x) * this.r2z - ii2[1] * this.r2z * this.r2z - ii2[8] * this.r2x * this.r2y;
      k[4] += ii2[0] * this.r2z * this.r2z - (ii2[6] + ii2[2]) * this.r2x * this.r2z + ii2[8] * this.r2x * this.r2x;
      k[5] += (ii2[1] * this.r2x - ii2[0] * this.r2y) * this.r2z - ii2[7] * this.r2x * this.r2x + ii2[6] * this.r2x * this.r2y;
      k[6] += (ii2[1] * this.r2y - ii2[4] * this.r2x) * this.r2z - ii2[2] * this.r2y * this.r2y + ii2[5] * this.r2x * this.r2y;
      k[7] += (ii2[3] * this.r2x - ii2[0] * this.r2y) * this.r2z - ii2[5] * this.r2x * this.r2x + ii2[2] * this.r2x * this.r2y;
      k[8] += ii2[0] * this.r2y * this.r2y - (ii2[3] + ii2[1]) * this.r2x * this.r2y + ii2[4] * this.r2x * this.r2x;

      var inv = 1 / (k[0] * (k[4] * k[8] - k[7] * k[5]) + k[3] * (k[7] * k[2] - k[1] * k[8]) + k[6] * (k[1] * k[5] - k[4] * k[2]));
      this.dd = new Mat33().set(
        k[4] * k[8] - k[5] * k[7], k[2] * k[7] - k[1] * k[8], k[1] * k[5] - k[2] * k[4],
        k[5] * k[6] - k[3] * k[8], k[0] * k[8] - k[2] * k[6], k[2] * k[3] - k[0] * k[5],
        k[3] * k[7] - k[4] * k[6], k[1] * k[6] - k[0] * k[7], k[0] * k[4] - k[1] * k[3]
      ).scaleEqual(inv);

      this.velx = this.p2.x - this.p1.x;
      this.vely = this.p2.y - this.p1.y;
      this.velz = this.p2.z - this.p1.z;
      var len = _Math.sqrt(this.velx * this.velx + this.vely * this.vely + this.velz * this.velz);
      if (len > 0.005) {
        len = (0.005 - len) / len * invTimeStep * 0.05;
        this.velx *= len;
        this.vely *= len;
        this.velz *= len;
      } else {
        this.velx = 0;
        this.vely = 0;
        this.velz = 0;
      }

      this.impx *= 0.95;
      this.impy *= 0.95;
      this.impz *= 0.95;

      this.l1.x += this.impx * this.m1;
      this.l1.y += this.impy * this.m1;
      this.l1.z += this.impz * this.m1;
      this.a1.x += this.impx * this.ax1x + this.impy * this.ay1x + this.impz * this.az1x;
      this.a1.y += this.impx * this.ax1y + this.impy * this.ay1y + this.impz * this.az1y;
      this.a1.z += this.impx * this.ax1z + this.impy * this.ay1z + this.impz * this.az1z;
      this.l2.x -= this.impx * this.m2;
      this.l2.y -= this.impy * this.m2;
      this.l2.z -= this.impz * this.m2;
      this.a2.x -= this.impx * this.ax2x + this.impy * this.ay2x + this.impz * this.az2x;
      this.a2.y -= this.impx * this.ax2y + this.impy * this.ay2y + this.impz * this.az2y;
      this.a2.z -= this.impx * this.ax2z + this.impy * this.ay2z + this.impz * this.az2z;
    },

    solve: function () {

      var d = this.dd.elements;
      var rvx = this.l2.x - this.l1.x + this.a2.y * this.r2z - this.a2.z * this.r2y - this.a1.y * this.r1z + this.a1.z * this.r1y - this.velx;
      var rvy = this.l2.y - this.l1.y + this.a2.z * this.r2x - this.a2.x * this.r2z - this.a1.z * this.r1x + this.a1.x * this.r1z - this.vely;
      var rvz = this.l2.z - this.l1.z + this.a2.x * this.r2y - this.a2.y * this.r2x - this.a1.x * this.r1y + this.a1.y * this.r1x - this.velz;
      var nimpx = rvx * d[0] + rvy * d[1] + rvz * d[2];
      var nimpy = rvx * d[3] + rvy * d[4] + rvz * d[5];
      var nimpz = rvx * d[6] + rvy * d[7] + rvz * d[8];
      this.impx += nimpx;
      this.impy += nimpy;
      this.impz += nimpz;
      this.l1.x += nimpx * this.m1;
      this.l1.y += nimpy * this.m1;
      this.l1.z += nimpz * this.m1;
      this.a1.x += nimpx * this.ax1x + nimpy * this.ay1x + nimpz * this.az1x;
      this.a1.y += nimpx * this.ax1y + nimpy * this.ay1y + nimpz * this.az1y;
      this.a1.z += nimpx * this.ax1z + nimpy * this.ay1z + nimpz * this.az1z;
      this.l2.x -= nimpx * this.m2;
      this.l2.y -= nimpy * this.m2;
      this.l2.z -= nimpz * this.m2;
      this.a2.x -= nimpx * this.ax2x + nimpy * this.ay2x + nimpz * this.az2x;
      this.a2.y -= nimpx * this.ax2y + nimpy * this.ay2y + nimpz * this.az2y;
      this.a2.z -= nimpx * this.ax2z + nimpy * this.ay2z + nimpz * this.az2z;

    }

  });

  /**
  * A three-axis rotational constraint for various joints.
  * @author saharan
  */

  function Rotational3Constraint(joint, limitMotor1, limitMotor2, limitMotor3) {

    this.cfm1 = NaN;
    this.cfm2 = NaN;
    this.cfm3 = NaN;
    this.i1e00 = NaN;
    this.i1e01 = NaN;
    this.i1e02 = NaN;
    this.i1e10 = NaN;
    this.i1e11 = NaN;
    this.i1e12 = NaN;
    this.i1e20 = NaN;
    this.i1e21 = NaN;
    this.i1e22 = NaN;
    this.i2e00 = NaN;
    this.i2e01 = NaN;
    this.i2e02 = NaN;
    this.i2e10 = NaN;
    this.i2e11 = NaN;
    this.i2e12 = NaN;
    this.i2e20 = NaN;
    this.i2e21 = NaN;
    this.i2e22 = NaN;
    this.ax1 = NaN;
    this.ay1 = NaN;
    this.az1 = NaN;
    this.ax2 = NaN;
    this.ay2 = NaN;
    this.az2 = NaN;
    this.ax3 = NaN;
    this.ay3 = NaN;
    this.az3 = NaN;

    this.a1x1 = NaN; // jacoians
    this.a1y1 = NaN;
    this.a1z1 = NaN;
    this.a2x1 = NaN;
    this.a2y1 = NaN;
    this.a2z1 = NaN;
    this.a1x2 = NaN;
    this.a1y2 = NaN;
    this.a1z2 = NaN;
    this.a2x2 = NaN;
    this.a2y2 = NaN;
    this.a2z2 = NaN;
    this.a1x3 = NaN;
    this.a1y3 = NaN;
    this.a1z3 = NaN;
    this.a2x3 = NaN;
    this.a2y3 = NaN;
    this.a2z3 = NaN;

    this.lowerLimit1 = NaN;
    this.upperLimit1 = NaN;
    this.limitVelocity1 = NaN;
    this.limitState1 = 0; // -1: at lower, 0: locked, 1: at upper, 2: free
    this.enableMotor1 = false;
    this.motorSpeed1 = NaN;
    this.maxMotorForce1 = NaN;
    this.maxMotorImpulse1 = NaN;
    this.lowerLimit2 = NaN;
    this.upperLimit2 = NaN;
    this.limitVelocity2 = NaN;
    this.limitState2 = 0; // -1: at lower, 0: locked, 1: at upper, 2: free
    this.enableMotor2 = false;
    this.motorSpeed2 = NaN;
    this.maxMotorForce2 = NaN;
    this.maxMotorImpulse2 = NaN;
    this.lowerLimit3 = NaN;
    this.upperLimit3 = NaN;
    this.limitVelocity3 = NaN;
    this.limitState3 = 0; // -1: at lower, 0: locked, 1: at upper, 2: free
    this.enableMotor3 = false;
    this.motorSpeed3 = NaN;
    this.maxMotorForce3 = NaN;
    this.maxMotorImpulse3 = NaN;

    this.k00 = NaN; // K = J*M*JT
    this.k01 = NaN;
    this.k02 = NaN;
    this.k10 = NaN;
    this.k11 = NaN;
    this.k12 = NaN;
    this.k20 = NaN;
    this.k21 = NaN;
    this.k22 = NaN;

    this.kv00 = NaN; // diagonals without CFMs
    this.kv11 = NaN;
    this.kv22 = NaN;

    this.dv00 = NaN; // ...inverted
    this.dv11 = NaN;
    this.dv22 = NaN;

    this.d00 = NaN;  // K^-1
    this.d01 = NaN;
    this.d02 = NaN;
    this.d10 = NaN;
    this.d11 = NaN;
    this.d12 = NaN;
    this.d20 = NaN;
    this.d21 = NaN;
    this.d22 = NaN;

    this.limitMotor1 = limitMotor1;
    this.limitMotor2 = limitMotor2;
    this.limitMotor3 = limitMotor3;
    this.b1 = joint.body1;
    this.b2 = joint.body2;
    this.a1 = this.b1.angularVelocity;
    this.a2 = this.b2.angularVelocity;
    this.i1 = this.b1.inverseInertia;
    this.i2 = this.b2.inverseInertia;
    this.limitImpulse1 = 0;
    this.motorImpulse1 = 0;
    this.limitImpulse2 = 0;
    this.motorImpulse2 = 0;
    this.limitImpulse3 = 0;
    this.motorImpulse3 = 0;

  }

  Object.assign(Rotational3Constraint.prototype, {

    Rotational3Constraint: true,

    preSolve: function (timeStep, invTimeStep) {

      this.ax1 = this.limitMotor1.axis.x;
      this.ay1 = this.limitMotor1.axis.y;
      this.az1 = this.limitMotor1.axis.z;
      this.ax2 = this.limitMotor2.axis.x;
      this.ay2 = this.limitMotor2.axis.y;
      this.az2 = this.limitMotor2.axis.z;
      this.ax3 = this.limitMotor3.axis.x;
      this.ay3 = this.limitMotor3.axis.y;
      this.az3 = this.limitMotor3.axis.z;
      this.lowerLimit1 = this.limitMotor1.lowerLimit;
      this.upperLimit1 = this.limitMotor1.upperLimit;
      this.motorSpeed1 = this.limitMotor1.motorSpeed;
      this.maxMotorForce1 = this.limitMotor1.maxMotorForce;
      this.enableMotor1 = this.maxMotorForce1 > 0;
      this.lowerLimit2 = this.limitMotor2.lowerLimit;
      this.upperLimit2 = this.limitMotor2.upperLimit;
      this.motorSpeed2 = this.limitMotor2.motorSpeed;
      this.maxMotorForce2 = this.limitMotor2.maxMotorForce;
      this.enableMotor2 = this.maxMotorForce2 > 0;
      this.lowerLimit3 = this.limitMotor3.lowerLimit;
      this.upperLimit3 = this.limitMotor3.upperLimit;
      this.motorSpeed3 = this.limitMotor3.motorSpeed;
      this.maxMotorForce3 = this.limitMotor3.maxMotorForce;
      this.enableMotor3 = this.maxMotorForce3 > 0;

      var ti1 = this.i1.elements;
      var ti2 = this.i2.elements;
      this.i1e00 = ti1[0];
      this.i1e01 = ti1[1];
      this.i1e02 = ti1[2];
      this.i1e10 = ti1[3];
      this.i1e11 = ti1[4];
      this.i1e12 = ti1[5];
      this.i1e20 = ti1[6];
      this.i1e21 = ti1[7];
      this.i1e22 = ti1[8];

      this.i2e00 = ti2[0];
      this.i2e01 = ti2[1];
      this.i2e02 = ti2[2];
      this.i2e10 = ti2[3];
      this.i2e11 = ti2[4];
      this.i2e12 = ti2[5];
      this.i2e20 = ti2[6];
      this.i2e21 = ti2[7];
      this.i2e22 = ti2[8];

      var frequency1 = this.limitMotor1.frequency;
      var frequency2 = this.limitMotor2.frequency;
      var frequency3 = this.limitMotor3.frequency;
      var enableSpring1 = frequency1 > 0;
      var enableSpring2 = frequency2 > 0;
      var enableSpring3 = frequency3 > 0;
      var enableLimit1 = this.lowerLimit1 <= this.upperLimit1;
      var enableLimit2 = this.lowerLimit2 <= this.upperLimit2;
      var enableLimit3 = this.lowerLimit3 <= this.upperLimit3;
      var angle1 = this.limitMotor1.angle;
      if (enableLimit1) {
        if (this.lowerLimit1 == this.upperLimit1) {
          if (this.limitState1 != 0) {
            this.limitState1 = 0;
            this.limitImpulse1 = 0;
          }
          this.limitVelocity1 = this.lowerLimit1 - angle1;
        } else if (angle1 < this.lowerLimit1) {
          if (this.limitState1 != -1) {
            this.limitState1 = -1;
            this.limitImpulse1 = 0;
          }
          this.limitVelocity1 = this.lowerLimit1 - angle1;
        } else if (angle1 > this.upperLimit1) {
          if (this.limitState1 != 1) {
            this.limitState1 = 1;
            this.limitImpulse1 = 0;
          }
          this.limitVelocity1 = this.upperLimit1 - angle1;
        } else {
          this.limitState1 = 2;
          this.limitImpulse1 = 0;
          this.limitVelocity1 = 0;
        }
        if (!enableSpring1) {
          if (this.limitVelocity1 > 0.02) this.limitVelocity1 -= 0.02;
          else if (this.limitVelocity1 < -0.02) this.limitVelocity1 += 0.02;
          else this.limitVelocity1 = 0;
        }
      } else {
        this.limitState1 = 2;
        this.limitImpulse1 = 0;
      }

      var angle2 = this.limitMotor2.angle;
      if (enableLimit2) {
        if (this.lowerLimit2 == this.upperLimit2) {
          if (this.limitState2 != 0) {
            this.limitState2 = 0;
            this.limitImpulse2 = 0;
          }
          this.limitVelocity2 = this.lowerLimit2 - angle2;
        } else if (angle2 < this.lowerLimit2) {
          if (this.limitState2 != -1) {
            this.limitState2 = -1;
            this.limitImpulse2 = 0;
          }
          this.limitVelocity2 = this.lowerLimit2 - angle2;
        } else if (angle2 > this.upperLimit2) {
          if (this.limitState2 != 1) {
            this.limitState2 = 1;
            this.limitImpulse2 = 0;
          }
          this.limitVelocity2 = this.upperLimit2 - angle2;
        } else {
          this.limitState2 = 2;
          this.limitImpulse2 = 0;
          this.limitVelocity2 = 0;
        }
        if (!enableSpring2) {
          if (this.limitVelocity2 > 0.02) this.limitVelocity2 -= 0.02;
          else if (this.limitVelocity2 < -0.02) this.limitVelocity2 += 0.02;
          else this.limitVelocity2 = 0;
        }
      } else {
        this.limitState2 = 2;
        this.limitImpulse2 = 0;
      }

      var angle3 = this.limitMotor3.angle;
      if (enableLimit3) {
        if (this.lowerLimit3 == this.upperLimit3) {
          if (this.limitState3 != 0) {
            this.limitState3 = 0;
            this.limitImpulse3 = 0;
          }
          this.limitVelocity3 = this.lowerLimit3 - angle3;
        } else if (angle3 < this.lowerLimit3) {
          if (this.limitState3 != -1) {
            this.limitState3 = -1;
            this.limitImpulse3 = 0;
          }
          this.limitVelocity3 = this.lowerLimit3 - angle3;
        } else if (angle3 > this.upperLimit3) {
          if (this.limitState3 != 1) {
            this.limitState3 = 1;
            this.limitImpulse3 = 0;
          }
          this.limitVelocity3 = this.upperLimit3 - angle3;
        } else {
          this.limitState3 = 2;
          this.limitImpulse3 = 0;
          this.limitVelocity3 = 0;
        }
        if (!enableSpring3) {
          if (this.limitVelocity3 > 0.02) this.limitVelocity3 -= 0.02;
          else if (this.limitVelocity3 < -0.02) this.limitVelocity3 += 0.02;
          else this.limitVelocity3 = 0;
        }
      } else {
        this.limitState3 = 2;
        this.limitImpulse3 = 0;
      }

      if (this.enableMotor1 && (this.limitState1 != 0 || enableSpring1)) {
        this.maxMotorImpulse1 = this.maxMotorForce1 * timeStep;
      } else {
        this.motorImpulse1 = 0;
        this.maxMotorImpulse1 = 0;
      }
      if (this.enableMotor2 && (this.limitState2 != 0 || enableSpring2)) {
        this.maxMotorImpulse2 = this.maxMotorForce2 * timeStep;
      } else {
        this.motorImpulse2 = 0;
        this.maxMotorImpulse2 = 0;
      }
      if (this.enableMotor3 && (this.limitState3 != 0 || enableSpring3)) {
        this.maxMotorImpulse3 = this.maxMotorForce3 * timeStep;
      } else {
        this.motorImpulse3 = 0;
        this.maxMotorImpulse3 = 0;
      }

      // build jacobians
      this.a1x1 = this.ax1 * this.i1e00 + this.ay1 * this.i1e01 + this.az1 * this.i1e02;
      this.a1y1 = this.ax1 * this.i1e10 + this.ay1 * this.i1e11 + this.az1 * this.i1e12;
      this.a1z1 = this.ax1 * this.i1e20 + this.ay1 * this.i1e21 + this.az1 * this.i1e22;
      this.a2x1 = this.ax1 * this.i2e00 + this.ay1 * this.i2e01 + this.az1 * this.i2e02;
      this.a2y1 = this.ax1 * this.i2e10 + this.ay1 * this.i2e11 + this.az1 * this.i2e12;
      this.a2z1 = this.ax1 * this.i2e20 + this.ay1 * this.i2e21 + this.az1 * this.i2e22;

      this.a1x2 = this.ax2 * this.i1e00 + this.ay2 * this.i1e01 + this.az2 * this.i1e02;
      this.a1y2 = this.ax2 * this.i1e10 + this.ay2 * this.i1e11 + this.az2 * this.i1e12;
      this.a1z2 = this.ax2 * this.i1e20 + this.ay2 * this.i1e21 + this.az2 * this.i1e22;
      this.a2x2 = this.ax2 * this.i2e00 + this.ay2 * this.i2e01 + this.az2 * this.i2e02;
      this.a2y2 = this.ax2 * this.i2e10 + this.ay2 * this.i2e11 + this.az2 * this.i2e12;
      this.a2z2 = this.ax2 * this.i2e20 + this.ay2 * this.i2e21 + this.az2 * this.i2e22;

      this.a1x3 = this.ax3 * this.i1e00 + this.ay3 * this.i1e01 + this.az3 * this.i1e02;
      this.a1y3 = this.ax3 * this.i1e10 + this.ay3 * this.i1e11 + this.az3 * this.i1e12;
      this.a1z3 = this.ax3 * this.i1e20 + this.ay3 * this.i1e21 + this.az3 * this.i1e22;
      this.a2x3 = this.ax3 * this.i2e00 + this.ay3 * this.i2e01 + this.az3 * this.i2e02;
      this.a2y3 = this.ax3 * this.i2e10 + this.ay3 * this.i2e11 + this.az3 * this.i2e12;
      this.a2z3 = this.ax3 * this.i2e20 + this.ay3 * this.i2e21 + this.az3 * this.i2e22;

      // build an impulse matrix
      this.k00 = this.ax1 * (this.a1x1 + this.a2x1) + this.ay1 * (this.a1y1 + this.a2y1) + this.az1 * (this.a1z1 + this.a2z1);
      this.k01 = this.ax1 * (this.a1x2 + this.a2x2) + this.ay1 * (this.a1y2 + this.a2y2) + this.az1 * (this.a1z2 + this.a2z2);
      this.k02 = this.ax1 * (this.a1x3 + this.a2x3) + this.ay1 * (this.a1y3 + this.a2y3) + this.az1 * (this.a1z3 + this.a2z3);
      this.k10 = this.ax2 * (this.a1x1 + this.a2x1) + this.ay2 * (this.a1y1 + this.a2y1) + this.az2 * (this.a1z1 + this.a2z1);
      this.k11 = this.ax2 * (this.a1x2 + this.a2x2) + this.ay2 * (this.a1y2 + this.a2y2) + this.az2 * (this.a1z2 + this.a2z2);
      this.k12 = this.ax2 * (this.a1x3 + this.a2x3) + this.ay2 * (this.a1y3 + this.a2y3) + this.az2 * (this.a1z3 + this.a2z3);
      this.k20 = this.ax3 * (this.a1x1 + this.a2x1) + this.ay3 * (this.a1y1 + this.a2y1) + this.az3 * (this.a1z1 + this.a2z1);
      this.k21 = this.ax3 * (this.a1x2 + this.a2x2) + this.ay3 * (this.a1y2 + this.a2y2) + this.az3 * (this.a1z2 + this.a2z2);
      this.k22 = this.ax3 * (this.a1x3 + this.a2x3) + this.ay3 * (this.a1y3 + this.a2y3) + this.az3 * (this.a1z3 + this.a2z3);

      this.kv00 = this.k00;
      this.kv11 = this.k11;
      this.kv22 = this.k22;
      this.dv00 = 1 / this.kv00;
      this.dv11 = 1 / this.kv11;
      this.dv22 = 1 / this.kv22;

      if (enableSpring1 && this.limitState1 != 2) {
        var omega = 6.2831853 * frequency1;
        var k = omega * omega * timeStep;
        var dmp = invTimeStep / (k + 2 * this.limitMotor1.dampingRatio * omega);
        this.cfm1 = this.kv00 * dmp;
        this.limitVelocity1 *= k * dmp;
      } else {
        this.cfm1 = 0;
        this.limitVelocity1 *= invTimeStep * 0.05;
      }

      if (enableSpring2 && this.limitState2 != 2) {
        omega = 6.2831853 * frequency2;
        k = omega * omega * timeStep;
        dmp = invTimeStep / (k + 2 * this.limitMotor2.dampingRatio * omega);
        this.cfm2 = this.kv11 * dmp;
        this.limitVelocity2 *= k * dmp;
      } else {
        this.cfm2 = 0;
        this.limitVelocity2 *= invTimeStep * 0.05;
      }

      if (enableSpring3 && this.limitState3 != 2) {
        omega = 6.2831853 * frequency3;
        k = omega * omega * timeStep;
        dmp = invTimeStep / (k + 2 * this.limitMotor3.dampingRatio * omega);
        this.cfm3 = this.kv22 * dmp;
        this.limitVelocity3 *= k * dmp;
      } else {
        this.cfm3 = 0;
        this.limitVelocity3 *= invTimeStep * 0.05;
      }

      this.k00 += this.cfm1;
      this.k11 += this.cfm2;
      this.k22 += this.cfm3;

      var inv = 1 / (
        this.k00 * (this.k11 * this.k22 - this.k21 * this.k12) +
        this.k10 * (this.k21 * this.k02 - this.k01 * this.k22) +
        this.k20 * (this.k01 * this.k12 - this.k11 * this.k02)
      );
      this.d00 = (this.k11 * this.k22 - this.k12 * this.k21) * inv;
      this.d01 = (this.k02 * this.k21 - this.k01 * this.k22) * inv;
      this.d02 = (this.k01 * this.k12 - this.k02 * this.k11) * inv;
      this.d10 = (this.k12 * this.k20 - this.k10 * this.k22) * inv;
      this.d11 = (this.k00 * this.k22 - this.k02 * this.k20) * inv;
      this.d12 = (this.k02 * this.k10 - this.k00 * this.k12) * inv;
      this.d20 = (this.k10 * this.k21 - this.k11 * this.k20) * inv;
      this.d21 = (this.k01 * this.k20 - this.k00 * this.k21) * inv;
      this.d22 = (this.k00 * this.k11 - this.k01 * this.k10) * inv;

      this.limitImpulse1 *= 0.95;
      this.motorImpulse1 *= 0.95;
      this.limitImpulse2 *= 0.95;
      this.motorImpulse2 *= 0.95;
      this.limitImpulse3 *= 0.95;
      this.motorImpulse3 *= 0.95;
      var totalImpulse1 = this.limitImpulse1 + this.motorImpulse1;
      var totalImpulse2 = this.limitImpulse2 + this.motorImpulse2;
      var totalImpulse3 = this.limitImpulse3 + this.motorImpulse3;
      this.a1.x += totalImpulse1 * this.a1x1 + totalImpulse2 * this.a1x2 + totalImpulse3 * this.a1x3;
      this.a1.y += totalImpulse1 * this.a1y1 + totalImpulse2 * this.a1y2 + totalImpulse3 * this.a1y3;
      this.a1.z += totalImpulse1 * this.a1z1 + totalImpulse2 * this.a1z2 + totalImpulse3 * this.a1z3;
      this.a2.x -= totalImpulse1 * this.a2x1 + totalImpulse2 * this.a2x2 + totalImpulse3 * this.a2x3;
      this.a2.y -= totalImpulse1 * this.a2y1 + totalImpulse2 * this.a2y2 + totalImpulse3 * this.a2y3;
      this.a2.z -= totalImpulse1 * this.a2z1 + totalImpulse2 * this.a2z2 + totalImpulse3 * this.a2z3;
    },
    solve_: function () {

      var rvx = this.a2.x - this.a1.x;
      var rvy = this.a2.y - this.a1.y;
      var rvz = this.a2.z - this.a1.z;

      this.limitVelocity3 = 30;
      var rvn1 = rvx * this.ax1 + rvy * this.ay1 + rvz * this.az1 - this.limitVelocity1;
      var rvn2 = rvx * this.ax2 + rvy * this.ay2 + rvz * this.az2 - this.limitVelocity2;
      var rvn3 = rvx * this.ax3 + rvy * this.ay3 + rvz * this.az3 - this.limitVelocity3;

      var dLimitImpulse1 = rvn1 * this.d00 + rvn2 * this.d01 + rvn3 * this.d02;
      var dLimitImpulse2 = rvn1 * this.d10 + rvn2 * this.d11 + rvn3 * this.d12;
      var dLimitImpulse3 = rvn1 * this.d20 + rvn2 * this.d21 + rvn3 * this.d22;

      this.limitImpulse1 += dLimitImpulse1;
      this.limitImpulse2 += dLimitImpulse2;
      this.limitImpulse3 += dLimitImpulse3;

      this.a1.x += dLimitImpulse1 * this.a1x1 + dLimitImpulse2 * this.a1x2 + dLimitImpulse3 * this.a1x3;
      this.a1.y += dLimitImpulse1 * this.a1y1 + dLimitImpulse2 * this.a1y2 + dLimitImpulse3 * this.a1y3;
      this.a1.z += dLimitImpulse1 * this.a1z1 + dLimitImpulse2 * this.a1z2 + dLimitImpulse3 * this.a1z3;
      this.a2.x -= dLimitImpulse1 * this.a2x1 + dLimitImpulse2 * this.a2x2 + dLimitImpulse3 * this.a2x3;
      this.a2.y -= dLimitImpulse1 * this.a2y1 + dLimitImpulse2 * this.a2y2 + dLimitImpulse3 * this.a2y3;
      this.a2.z -= dLimitImpulse1 * this.a2z1 + dLimitImpulse2 * this.a2z2 + dLimitImpulse3 * this.a2z3;
    },
    solve: function () {

      var rvx = this.a2.x - this.a1.x;
      var rvy = this.a2.y - this.a1.y;
      var rvz = this.a2.z - this.a1.z;

      var rvn1 = rvx * this.ax1 + rvy * this.ay1 + rvz * this.az1;
      var rvn2 = rvx * this.ax2 + rvy * this.ay2 + rvz * this.az2;
      var rvn3 = rvx * this.ax3 + rvy * this.ay3 + rvz * this.az3;

      var oldMotorImpulse1 = this.motorImpulse1;
      var oldMotorImpulse2 = this.motorImpulse2;
      var oldMotorImpulse3 = this.motorImpulse3;

      var dMotorImpulse1 = 0;
      var dMotorImpulse2 = 0;
      var dMotorImpulse3 = 0;

      if (this.enableMotor1) {
        dMotorImpulse1 = (rvn1 - this.motorSpeed1) * this.dv00;
        this.motorImpulse1 += dMotorImpulse1;
        if (this.motorImpulse1 > this.maxMotorImpulse1) { // clamp motor impulse
          this.motorImpulse1 = this.maxMotorImpulse1;
        } else if (this.motorImpulse1 < -this.maxMotorImpulse1) {
          this.motorImpulse1 = -this.maxMotorImpulse1;
        }
        dMotorImpulse1 = this.motorImpulse1 - oldMotorImpulse1;
      }
      if (this.enableMotor2) {
        dMotorImpulse2 = (rvn2 - this.motorSpeed2) * this.dv11;
        this.motorImpulse2 += dMotorImpulse2;
        if (this.motorImpulse2 > this.maxMotorImpulse2) { // clamp motor impulse
          this.motorImpulse2 = this.maxMotorImpulse2;
        } else if (this.motorImpulse2 < -this.maxMotorImpulse2) {
          this.motorImpulse2 = -this.maxMotorImpulse2;
        }
        dMotorImpulse2 = this.motorImpulse2 - oldMotorImpulse2;
      }
      if (this.enableMotor3) {
        dMotorImpulse3 = (rvn3 - this.motorSpeed3) * this.dv22;
        this.motorImpulse3 += dMotorImpulse3;
        if (this.motorImpulse3 > this.maxMotorImpulse3) { // clamp motor impulse
          this.motorImpulse3 = this.maxMotorImpulse3;
        } else if (this.motorImpulse3 < -this.maxMotorImpulse3) {
          this.motorImpulse3 = -this.maxMotorImpulse3;
        }
        dMotorImpulse3 = this.motorImpulse3 - oldMotorImpulse3;
      }

      // apply motor impulse to relative velocity
      rvn1 += dMotorImpulse1 * this.kv00 + dMotorImpulse2 * this.k01 + dMotorImpulse3 * this.k02;
      rvn2 += dMotorImpulse1 * this.k10 + dMotorImpulse2 * this.kv11 + dMotorImpulse3 * this.k12;
      rvn3 += dMotorImpulse1 * this.k20 + dMotorImpulse2 * this.k21 + dMotorImpulse3 * this.kv22;

      // subtract target velocity and applied impulse
      rvn1 -= this.limitVelocity1 + this.limitImpulse1 * this.cfm1;
      rvn2 -= this.limitVelocity2 + this.limitImpulse2 * this.cfm2;
      rvn3 -= this.limitVelocity3 + this.limitImpulse3 * this.cfm3;

      var oldLimitImpulse1 = this.limitImpulse1;
      var oldLimitImpulse2 = this.limitImpulse2;
      var oldLimitImpulse3 = this.limitImpulse3;

      var dLimitImpulse1 = rvn1 * this.d00 + rvn2 * this.d01 + rvn3 * this.d02;
      var dLimitImpulse2 = rvn1 * this.d10 + rvn2 * this.d11 + rvn3 * this.d12;
      var dLimitImpulse3 = rvn1 * this.d20 + rvn2 * this.d21 + rvn3 * this.d22;

      this.limitImpulse1 += dLimitImpulse1;
      this.limitImpulse2 += dLimitImpulse2;
      this.limitImpulse3 += dLimitImpulse3;

      // clamp
      var clampState = 0;
      if (this.limitState1 == 2 || this.limitImpulse1 * this.limitState1 < 0) {
        dLimitImpulse1 = -oldLimitImpulse1;
        rvn2 += dLimitImpulse1 * this.k10;
        rvn3 += dLimitImpulse1 * this.k20;
        clampState |= 1;
      }
      if (this.limitState2 == 2 || this.limitImpulse2 * this.limitState2 < 0) {
        dLimitImpulse2 = -oldLimitImpulse2;
        rvn1 += dLimitImpulse2 * this.k01;
        rvn3 += dLimitImpulse2 * this.k21;
        clampState |= 2;
      }
      if (this.limitState3 == 2 || this.limitImpulse3 * this.limitState3 < 0) {
        dLimitImpulse3 = -oldLimitImpulse3;
        rvn1 += dLimitImpulse3 * this.k02;
        rvn2 += dLimitImpulse3 * this.k12;
        clampState |= 4;
      }

      // update un-clamped impulse
      // TODO: isolate division
      var det;
      switch (clampState) {
        case 1: // update 2 3
          det = 1 / (this.k11 * this.k22 - this.k12 * this.k21);
          dLimitImpulse2 = (this.k22 * rvn2 + -this.k12 * rvn3) * det;
          dLimitImpulse3 = (-this.k21 * rvn2 + this.k11 * rvn3) * det;
          break;
        case 2: // update 1 3
          det = 1 / (this.k00 * this.k22 - this.k02 * this.k20);
          dLimitImpulse1 = (this.k22 * rvn1 + -this.k02 * rvn3) * det;
          dLimitImpulse3 = (-this.k20 * rvn1 + this.k00 * rvn3) * det;
          break;
        case 3: // update 3
          dLimitImpulse3 = rvn3 / this.k22;
          break;
        case 4: // update 1 2
          det = 1 / (this.k00 * this.k11 - this.k01 * this.k10);
          dLimitImpulse1 = (this.k11 * rvn1 + -this.k01 * rvn2) * det;
          dLimitImpulse2 = (-this.k10 * rvn1 + this.k00 * rvn2) * det;
          break;
        case 5: // update 2
          dLimitImpulse2 = rvn2 / this.k11;
          break;
        case 6: // update 1
          dLimitImpulse1 = rvn1 / this.k00;
          break;
      }

      this.limitImpulse1 = dLimitImpulse1 + oldLimitImpulse1;
      this.limitImpulse2 = dLimitImpulse2 + oldLimitImpulse2;
      this.limitImpulse3 = dLimitImpulse3 + oldLimitImpulse3;

      var dImpulse1 = dMotorImpulse1 + dLimitImpulse1;
      var dImpulse2 = dMotorImpulse2 + dLimitImpulse2;
      var dImpulse3 = dMotorImpulse3 + dLimitImpulse3;

      // apply impulse
      this.a1.x += dImpulse1 * this.a1x1 + dImpulse2 * this.a1x2 + dImpulse3 * this.a1x3;
      this.a1.y += dImpulse1 * this.a1y1 + dImpulse2 * this.a1y2 + dImpulse3 * this.a1y3;
      this.a1.z += dImpulse1 * this.a1z1 + dImpulse2 * this.a1z2 + dImpulse3 * this.a1z3;
      this.a2.x -= dImpulse1 * this.a2x1 + dImpulse2 * this.a2x2 + dImpulse3 * this.a2x3;
      this.a2.y -= dImpulse1 * this.a2y1 + dImpulse2 * this.a2y2 + dImpulse3 * this.a2y3;
      this.a2.z -= dImpulse1 * this.a2z1 + dImpulse2 * this.a2z2 + dImpulse3 * this.a2z3;
      rvx = this.a2.x - this.a1.x;
      rvy = this.a2.y - this.a1.y;
      rvz = this.a2.z - this.a1.z;

      rvn2 = rvx * this.ax2 + rvy * this.ay2 + rvz * this.az2;
    }

  });

  /**
   * A hinge joint allows only for relative rotation of rigid bodies along the axis.
   *
   * @author saharan
   * @author lo-th
   */

  function HingeJoint(config, lowerAngleLimit, upperAngleLimit) {

    Joint.call(this, config);

    this.type = JOINT_HINGE;

    // The axis in the first body's coordinate system.
    this.localAxis1 = config.localAxis1.clone().normalize();
    // The axis in the second body's coordinate system.
    this.localAxis2 = config.localAxis2.clone().normalize();

    // make angle axis
    var arc = new Mat33().setQuat(new Quat().setFromUnitVectors(this.localAxis1, this.localAxis2));
    this.localAngle1 = new Vec3().tangent(this.localAxis1).normalize();
    this.localAngle2 = this.localAngle1.clone().applyMatrix3(arc, true);

    this.ax1 = new Vec3();
    this.ax2 = new Vec3();
    this.an1 = new Vec3();
    this.an2 = new Vec3();

    this.tmp = new Vec3();

    this.nor = new Vec3();
    this.tan = new Vec3();
    this.bin = new Vec3();

    // The rotational limit and motor information of the joint.
    this.limitMotor = new LimitMotor(this.nor, false);
    this.limitMotor.lowerLimit = lowerAngleLimit;
    this.limitMotor.upperLimit = upperAngleLimit;

    this.lc = new LinearConstraint(this);
    this.r3 = new Rotational3Constraint(this, this.limitMotor, new LimitMotor(this.tan, true), new LimitMotor(this.bin, true));
  }
  HingeJoint.prototype = Object.assign(Object.create(Joint.prototype), {

    constructor: HingeJoint,


    preSolve: function (timeStep, invTimeStep) {

      this.updateAnchorPoints();

      this.ax1.copy(this.localAxis1).applyMatrix3(this.body1.rotation, true);
      this.ax2.copy(this.localAxis2).applyMatrix3(this.body2.rotation, true);

      this.an1.copy(this.localAngle1).applyMatrix3(this.body1.rotation, true);
      this.an2.copy(this.localAngle2).applyMatrix3(this.body2.rotation, true);

      // normal tangent binormal

      this.nor.set(
        this.ax1.x * this.body2.inverseMass + this.ax2.x * this.body1.inverseMass,
        this.ax1.y * this.body2.inverseMass + this.ax2.y * this.body1.inverseMass,
        this.ax1.z * this.body2.inverseMass + this.ax2.z * this.body1.inverseMass
      ).normalize();

      this.tan.tangent(this.nor).normalize();

      this.bin.crossVectors(this.nor, this.tan);

      // calculate hinge angle

      var limite = _Math.acosClamp(_Math.dotVectors(this.an1, this.an2));

      this.tmp.crossVectors(this.an1, this.an2);

      if (_Math.dotVectors(this.nor, this.tmp) < 0) this.limitMotor.angle = -limite;
      else this.limitMotor.angle = limite;

      this.tmp.crossVectors(this.ax1, this.ax2);

      this.r3.limitMotor2.angle = _Math.dotVectors(this.tan, this.tmp);
      this.r3.limitMotor3.angle = _Math.dotVectors(this.bin, this.tmp);

      // preSolve

      this.r3.preSolve(timeStep, invTimeStep);
      this.lc.preSolve(timeStep, invTimeStep);

    },

    solve: function () {

      this.r3.solve();
      this.lc.solve();

    },

    postSolve: function () {

    }

  });

  /**
   * A ball-and-socket joint limits relative translation on two anchor points on rigid bodies.
   *
   * @author saharan
   * @author lo-th
   */

  function BallAndSocketJoint(config) {

    Joint.call(this, config);

    this.type = JOINT_BALL_AND_SOCKET;

    this.lc = new LinearConstraint(this);

  }
  BallAndSocketJoint.prototype = Object.assign(Object.create(Joint.prototype), {

    constructor: BallAndSocketJoint,

    preSolve: function (timeStep, invTimeStep) {

      this.updateAnchorPoints();

      // preSolve

      this.lc.preSolve(timeStep, invTimeStep);

    },

    solve: function () {

      this.lc.solve();

    },

    postSolve: function () {

    }

  });

  /**
  * A translational constraint for various joints.
  * @author saharan
  */
  function TranslationalConstraint(joint, limitMotor) {
    this.cfm = NaN;
    this.m1 = NaN;
    this.m2 = NaN;
    this.i1e00 = NaN;
    this.i1e01 = NaN;
    this.i1e02 = NaN;
    this.i1e10 = NaN;
    this.i1e11 = NaN;
    this.i1e12 = NaN;
    this.i1e20 = NaN;
    this.i1e21 = NaN;
    this.i1e22 = NaN;
    this.i2e00 = NaN;
    this.i2e01 = NaN;
    this.i2e02 = NaN;
    this.i2e10 = NaN;
    this.i2e11 = NaN;
    this.i2e12 = NaN;
    this.i2e20 = NaN;
    this.i2e21 = NaN;
    this.i2e22 = NaN;
    this.motorDenom = NaN;
    this.invMotorDenom = NaN;
    this.invDenom = NaN;
    this.ax = NaN;
    this.ay = NaN;
    this.az = NaN;
    this.r1x = NaN;
    this.r1y = NaN;
    this.r1z = NaN;
    this.r2x = NaN;
    this.r2y = NaN;
    this.r2z = NaN;
    this.t1x = NaN;
    this.t1y = NaN;
    this.t1z = NaN;
    this.t2x = NaN;
    this.t2y = NaN;
    this.t2z = NaN;
    this.l1x = NaN;
    this.l1y = NaN;
    this.l1z = NaN;
    this.l2x = NaN;
    this.l2y = NaN;
    this.l2z = NaN;
    this.a1x = NaN;
    this.a1y = NaN;
    this.a1z = NaN;
    this.a2x = NaN;
    this.a2y = NaN;
    this.a2z = NaN;
    this.lowerLimit = NaN;
    this.upperLimit = NaN;
    this.limitVelocity = NaN;
    this.limitState = 0; // -1: at lower, 0: locked, 1: at upper, 2: free
    this.enableMotor = false;
    this.motorSpeed = NaN;
    this.maxMotorForce = NaN;
    this.maxMotorImpulse = NaN;

    this.limitMotor = limitMotor;
    this.b1 = joint.body1;
    this.b2 = joint.body2;
    this.p1 = joint.anchorPoint1;
    this.p2 = joint.anchorPoint2;
    this.r1 = joint.relativeAnchorPoint1;
    this.r2 = joint.relativeAnchorPoint2;
    this.l1 = this.b1.linearVelocity;
    this.l2 = this.b2.linearVelocity;
    this.a1 = this.b1.angularVelocity;
    this.a2 = this.b2.angularVelocity;
    this.i1 = this.b1.inverseInertia;
    this.i2 = this.b2.inverseInertia;
    this.limitImpulse = 0;
    this.motorImpulse = 0;
  }

  Object.assign(TranslationalConstraint.prototype, {

    TranslationalConstraint: true,

    preSolve: function (timeStep, invTimeStep) {
      this.ax = this.limitMotor.axis.x;
      this.ay = this.limitMotor.axis.y;
      this.az = this.limitMotor.axis.z;
      this.lowerLimit = this.limitMotor.lowerLimit;
      this.upperLimit = this.limitMotor.upperLimit;
      this.motorSpeed = this.limitMotor.motorSpeed;
      this.maxMotorForce = this.limitMotor.maxMotorForce;
      this.enableMotor = this.maxMotorForce > 0;
      this.m1 = this.b1.inverseMass;
      this.m2 = this.b2.inverseMass;

      var ti1 = this.i1.elements;
      var ti2 = this.i2.elements;
      this.i1e00 = ti1[0];
      this.i1e01 = ti1[1];
      this.i1e02 = ti1[2];
      this.i1e10 = ti1[3];
      this.i1e11 = ti1[4];
      this.i1e12 = ti1[5];
      this.i1e20 = ti1[6];
      this.i1e21 = ti1[7];
      this.i1e22 = ti1[8];

      this.i2e00 = ti2[0];
      this.i2e01 = ti2[1];
      this.i2e02 = ti2[2];
      this.i2e10 = ti2[3];
      this.i2e11 = ti2[4];
      this.i2e12 = ti2[5];
      this.i2e20 = ti2[6];
      this.i2e21 = ti2[7];
      this.i2e22 = ti2[8];

      var dx = this.p2.x - this.p1.x;
      var dy = this.p2.y - this.p1.y;
      var dz = this.p2.z - this.p1.z;
      var d = dx * this.ax + dy * this.ay + dz * this.az;
      var frequency = this.limitMotor.frequency;
      var enableSpring = frequency > 0;
      var enableLimit = this.lowerLimit <= this.upperLimit;
      if (enableSpring && d > 20 || d < -20) {
        enableSpring = false;
      }

      if (enableLimit) {
        if (this.lowerLimit == this.upperLimit) {
          if (this.limitState != 0) {
            this.limitState = 0;
            this.limitImpulse = 0;
          }
          this.limitVelocity = this.lowerLimit - d;
          if (!enableSpring) d = this.lowerLimit;
        } else if (d < this.lowerLimit) {
          if (this.limitState != -1) {
            this.limitState = -1;
            this.limitImpulse = 0;
          }
          this.limitVelocity = this.lowerLimit - d;
          if (!enableSpring) d = this.lowerLimit;
        } else if (d > this.upperLimit) {
          if (this.limitState != 1) {
            this.limitState = 1;
            this.limitImpulse = 0;
          }
          this.limitVelocity = this.upperLimit - d;
          if (!enableSpring) d = this.upperLimit;
        } else {
          this.limitState = 2;
          this.limitImpulse = 0;
          this.limitVelocity = 0;
        }
        if (!enableSpring) {
          if (this.limitVelocity > 0.005) this.limitVelocity -= 0.005;
          else if (this.limitVelocity < -0.005) this.limitVelocity += 0.005;
          else this.limitVelocity = 0;
        }
      } else {
        this.limitState = 2;
        this.limitImpulse = 0;
      }

      if (this.enableMotor && (this.limitState != 0 || enableSpring)) {
        this.maxMotorImpulse = this.maxMotorForce * timeStep;
      } else {
        this.motorImpulse = 0;
        this.maxMotorImpulse = 0;
      }

      var rdx = d * this.ax;
      var rdy = d * this.ay;
      var rdz = d * this.az;
      var w1 = this.m1 / (this.m1 + this.m2);
      var w2 = 1 - w1;
      this.r1x = this.r1.x + rdx * w1;
      this.r1y = this.r1.y + rdy * w1;
      this.r1z = this.r1.z + rdz * w1;
      this.r2x = this.r2.x - rdx * w2;
      this.r2y = this.r2.y - rdy * w2;
      this.r2z = this.r2.z - rdz * w2;

      this.t1x = this.r1y * this.az - this.r1z * this.ay;
      this.t1y = this.r1z * this.ax - this.r1x * this.az;
      this.t1z = this.r1x * this.ay - this.r1y * this.ax;
      this.t2x = this.r2y * this.az - this.r2z * this.ay;
      this.t2y = this.r2z * this.ax - this.r2x * this.az;
      this.t2z = this.r2x * this.ay - this.r2y * this.ax;
      this.l1x = this.ax * this.m1;
      this.l1y = this.ay * this.m1;
      this.l1z = this.az * this.m1;
      this.l2x = this.ax * this.m2;
      this.l2y = this.ay * this.m2;
      this.l2z = this.az * this.m2;
      this.a1x = this.t1x * this.i1e00 + this.t1y * this.i1e01 + this.t1z * this.i1e02;
      this.a1y = this.t1x * this.i1e10 + this.t1y * this.i1e11 + this.t1z * this.i1e12;
      this.a1z = this.t1x * this.i1e20 + this.t1y * this.i1e21 + this.t1z * this.i1e22;
      this.a2x = this.t2x * this.i2e00 + this.t2y * this.i2e01 + this.t2z * this.i2e02;
      this.a2y = this.t2x * this.i2e10 + this.t2y * this.i2e11 + this.t2z * this.i2e12;
      this.a2z = this.t2x * this.i2e20 + this.t2y * this.i2e21 + this.t2z * this.i2e22;
      this.motorDenom =
        this.m1 + this.m2 +
        this.ax * (this.a1y * this.r1z - this.a1z * this.r1y + this.a2y * this.r2z - this.a2z * this.r2y) +
        this.ay * (this.a1z * this.r1x - this.a1x * this.r1z + this.a2z * this.r2x - this.a2x * this.r2z) +
        this.az * (this.a1x * this.r1y - this.a1y * this.r1x + this.a2x * this.r2y - this.a2y * this.r2x);

      this.invMotorDenom = 1 / this.motorDenom;

      if (enableSpring && this.limitState != 2) {
        var omega = 6.2831853 * frequency;
        var k = omega * omega * timeStep;
        var dmp = invTimeStep / (k + 2 * this.limitMotor.dampingRatio * omega);
        this.cfm = this.motorDenom * dmp;
        this.limitVelocity *= k * dmp;
      } else {
        this.cfm = 0;
        this.limitVelocity *= invTimeStep * 0.05;
      }

      this.invDenom = 1 / (this.motorDenom + this.cfm);

      var totalImpulse = this.limitImpulse + this.motorImpulse;
      this.l1.x += totalImpulse * this.l1x;
      this.l1.y += totalImpulse * this.l1y;
      this.l1.z += totalImpulse * this.l1z;
      this.a1.x += totalImpulse * this.a1x;
      this.a1.y += totalImpulse * this.a1y;
      this.a1.z += totalImpulse * this.a1z;
      this.l2.x -= totalImpulse * this.l2x;
      this.l2.y -= totalImpulse * this.l2y;
      this.l2.z -= totalImpulse * this.l2z;
      this.a2.x -= totalImpulse * this.a2x;
      this.a2.y -= totalImpulse * this.a2y;
      this.a2.z -= totalImpulse * this.a2z;
    },
    solve: function () {
      var rvn =
        this.ax * (this.l2.x - this.l1.x) + this.ay * (this.l2.y - this.l1.y) + this.az * (this.l2.z - this.l1.z) +
        this.t2x * this.a2.x - this.t1x * this.a1.x + this.t2y * this.a2.y - this.t1y * this.a1.y + this.t2z * this.a2.z - this.t1z * this.a1.z;

      // motor part
      var newMotorImpulse;
      if (this.enableMotor) {
        newMotorImpulse = (rvn - this.motorSpeed) * this.invMotorDenom;
        var oldMotorImpulse = this.motorImpulse;
        this.motorImpulse += newMotorImpulse;
        if (this.motorImpulse > this.maxMotorImpulse) this.motorImpulse = this.maxMotorImpulse;
        else if (this.motorImpulse < -this.maxMotorImpulse) this.motorImpulse = -this.maxMotorImpulse;
        newMotorImpulse = this.motorImpulse - oldMotorImpulse;
        rvn -= newMotorImpulse * this.motorDenom;
      } else newMotorImpulse = 0;

      // limit part
      var newLimitImpulse;
      if (this.limitState != 2) {
        newLimitImpulse = (rvn - this.limitVelocity - this.limitImpulse * this.cfm) * this.invDenom;
        var oldLimitImpulse = this.limitImpulse;
        this.limitImpulse += newLimitImpulse;
        if (this.limitImpulse * this.limitState < 0) this.limitImpulse = 0;
        newLimitImpulse = this.limitImpulse - oldLimitImpulse;
      } else newLimitImpulse = 0;

      var totalImpulse = newLimitImpulse + newMotorImpulse;
      this.l1.x += totalImpulse * this.l1x;
      this.l1.y += totalImpulse * this.l1y;
      this.l1.z += totalImpulse * this.l1z;
      this.a1.x += totalImpulse * this.a1x;
      this.a1.y += totalImpulse * this.a1y;
      this.a1.z += totalImpulse * this.a1z;
      this.l2.x -= totalImpulse * this.l2x;
      this.l2.y -= totalImpulse * this.l2y;
      this.l2.z -= totalImpulse * this.l2z;
      this.a2.x -= totalImpulse * this.a2x;
      this.a2.y -= totalImpulse * this.a2y;
      this.a2.z -= totalImpulse * this.a2z;
    }
  });

  /**
   * A distance joint limits the distance between two anchor points on rigid bodies.
   *
   * @author saharan
   * @author lo-th
   */

  function DistanceJoint(config, minDistance, maxDistance) {

    Joint.call(this, config);

    this.type = JOINT_DISTANCE;

    this.nor = new Vec3();

    // The limit and motor information of the joint.
    this.limitMotor = new LimitMotor(this.nor, true);
    this.limitMotor.lowerLimit = minDistance;
    this.limitMotor.upperLimit = maxDistance;

    this.t = new TranslationalConstraint(this, this.limitMotor);

  }
  DistanceJoint.prototype = Object.assign(Object.create(Joint.prototype), {

    constructor: DistanceJoint,

    preSolve: function (timeStep, invTimeStep) {

      this.updateAnchorPoints();

      this.nor.sub(this.anchorPoint2, this.anchorPoint1).normalize();

      // preSolve

      this.t.preSolve(timeStep, invTimeStep);

    },

    solve: function () {

      this.t.solve();

    },

    postSolve: function () {

    }

  });

  /**
  * An angular constraint for all axes for various joints.
  * @author saharan
  */

  function AngularConstraint(joint, targetOrientation) {

    this.joint = joint;

    this.targetOrientation = new Quat().invert(targetOrientation);

    this.relativeOrientation = new Quat();

    this.ii1 = null;
    this.ii2 = null;
    this.dd = null;

    this.vel = new Vec3();
    this.imp = new Vec3();

    this.rn0 = new Vec3();
    this.rn1 = new Vec3();
    this.rn2 = new Vec3();

    this.b1 = joint.body1;
    this.b2 = joint.body2;
    this.a1 = this.b1.angularVelocity;
    this.a2 = this.b2.angularVelocity;
    this.i1 = this.b1.inverseInertia;
    this.i2 = this.b2.inverseInertia;

  }
  Object.assign(AngularConstraint.prototype, {

    AngularConstraint: true,

    preSolve: function (timeStep, invTimeStep) {

      var inv, len, v;

      this.ii1 = this.i1.clone();
      this.ii2 = this.i2.clone();

      v = new Mat33().add(this.ii1, this.ii2).elements;
      inv = 1 / (v[0] * (v[4] * v[8] - v[7] * v[5]) + v[3] * (v[7] * v[2] - v[1] * v[8]) + v[6] * (v[1] * v[5] - v[4] * v[2]));
      this.dd = new Mat33().set(
        v[4] * v[8] - v[5] * v[7], v[2] * v[7] - v[1] * v[8], v[1] * v[5] - v[2] * v[4],
        v[5] * v[6] - v[3] * v[8], v[0] * v[8] - v[2] * v[6], v[2] * v[3] - v[0] * v[5],
        v[3] * v[7] - v[4] * v[6], v[1] * v[6] - v[0] * v[7], v[0] * v[4] - v[1] * v[3]
      ).multiplyScalar(inv);

      this.relativeOrientation.invert(this.b1.orientation).multiply(this.targetOrientation).multiply(this.b2.orientation);

      inv = this.relativeOrientation.w * 2;

      this.vel.copy(this.relativeOrientation).multiplyScalar(inv);

      len = this.vel.length();

      if (len > 0.02) {
        len = (0.02 - len) / len * invTimeStep * 0.05;
        this.vel.multiplyScalar(len);
      } else {
        this.vel.set(0, 0, 0);
      }

      this.rn1.copy(this.imp).applyMatrix3(this.ii1, true);
      this.rn2.copy(this.imp).applyMatrix3(this.ii2, true);

      this.a1.add(this.rn1);
      this.a2.sub(this.rn2);

    },

    solve: function () {

      var r = this.a2.clone().sub(this.a1).sub(this.vel);

      this.rn0.copy(r).applyMatrix3(this.dd, true);
      this.rn1.copy(this.rn0).applyMatrix3(this.ii1, true);
      this.rn2.copy(this.rn0).applyMatrix3(this.ii2, true);

      this.imp.add(this.rn0);
      this.a1.add(this.rn1);
      this.a2.sub(this.rn2);

    }

  });

  /**
  * A three-axis translational constraint for various joints.
  * @author saharan
  */
  function Translational3Constraint(joint, limitMotor1, limitMotor2, limitMotor3) {

    this.m1 = NaN;
    this.m2 = NaN;
    this.i1e00 = NaN;
    this.i1e01 = NaN;
    this.i1e02 = NaN;
    this.i1e10 = NaN;
    this.i1e11 = NaN;
    this.i1e12 = NaN;
    this.i1e20 = NaN;
    this.i1e21 = NaN;
    this.i1e22 = NaN;
    this.i2e00 = NaN;
    this.i2e01 = NaN;
    this.i2e02 = NaN;
    this.i2e10 = NaN;
    this.i2e11 = NaN;
    this.i2e12 = NaN;
    this.i2e20 = NaN;
    this.i2e21 = NaN;
    this.i2e22 = NaN;
    this.ax1 = NaN;
    this.ay1 = NaN;
    this.az1 = NaN;
    this.ax2 = NaN;
    this.ay2 = NaN;
    this.az2 = NaN;
    this.ax3 = NaN;
    this.ay3 = NaN;
    this.az3 = NaN;
    this.r1x = NaN;
    this.r1y = NaN;
    this.r1z = NaN;
    this.r2x = NaN;
    this.r2y = NaN;
    this.r2z = NaN;
    this.t1x1 = NaN;// jacobians
    this.t1y1 = NaN;
    this.t1z1 = NaN;
    this.t2x1 = NaN;
    this.t2y1 = NaN;
    this.t2z1 = NaN;
    this.l1x1 = NaN;
    this.l1y1 = NaN;
    this.l1z1 = NaN;
    this.l2x1 = NaN;
    this.l2y1 = NaN;
    this.l2z1 = NaN;
    this.a1x1 = NaN;
    this.a1y1 = NaN;
    this.a1z1 = NaN;
    this.a2x1 = NaN;
    this.a2y1 = NaN;
    this.a2z1 = NaN;
    this.t1x2 = NaN;
    this.t1y2 = NaN;
    this.t1z2 = NaN;
    this.t2x2 = NaN;
    this.t2y2 = NaN;
    this.t2z2 = NaN;
    this.l1x2 = NaN;
    this.l1y2 = NaN;
    this.l1z2 = NaN;
    this.l2x2 = NaN;
    this.l2y2 = NaN;
    this.l2z2 = NaN;
    this.a1x2 = NaN;
    this.a1y2 = NaN;
    this.a1z2 = NaN;
    this.a2x2 = NaN;
    this.a2y2 = NaN;
    this.a2z2 = NaN;
    this.t1x3 = NaN;
    this.t1y3 = NaN;
    this.t1z3 = NaN;
    this.t2x3 = NaN;
    this.t2y3 = NaN;
    this.t2z3 = NaN;
    this.l1x3 = NaN;
    this.l1y3 = NaN;
    this.l1z3 = NaN;
    this.l2x3 = NaN;
    this.l2y3 = NaN;
    this.l2z3 = NaN;
    this.a1x3 = NaN;
    this.a1y3 = NaN;
    this.a1z3 = NaN;
    this.a2x3 = NaN;
    this.a2y3 = NaN;
    this.a2z3 = NaN;
    this.lowerLimit1 = NaN;
    this.upperLimit1 = NaN;
    this.limitVelocity1 = NaN;
    this.limitState1 = 0; // -1: at lower, 0: locked, 1: at upper, 2: unlimited
    this.enableMotor1 = false;
    this.motorSpeed1 = NaN;
    this.maxMotorForce1 = NaN;
    this.maxMotorImpulse1 = NaN;
    this.lowerLimit2 = NaN;
    this.upperLimit2 = NaN;
    this.limitVelocity2 = NaN;
    this.limitState2 = 0; // -1: at lower, 0: locked, 1: at upper, 2: unlimited
    this.enableMotor2 = false;
    this.motorSpeed2 = NaN;
    this.maxMotorForce2 = NaN;
    this.maxMotorImpulse2 = NaN;
    this.lowerLimit3 = NaN;
    this.upperLimit3 = NaN;
    this.limitVelocity3 = NaN;
    this.limitState3 = 0; // -1: at lower, 0: locked, 1: at upper, 2: unlimited
    this.enableMotor3 = false;
    this.motorSpeed3 = NaN;
    this.maxMotorForce3 = NaN;
    this.maxMotorImpulse3 = NaN;
    this.k00 = NaN; // K = J*M*JT
    this.k01 = NaN;
    this.k02 = NaN;
    this.k10 = NaN;
    this.k11 = NaN;
    this.k12 = NaN;
    this.k20 = NaN;
    this.k21 = NaN;
    this.k22 = NaN;
    this.kv00 = NaN; // diagonals without CFMs
    this.kv11 = NaN;
    this.kv22 = NaN;
    this.dv00 = NaN; // ...inverted
    this.dv11 = NaN;
    this.dv22 = NaN;
    this.d00 = NaN; // K^-1
    this.d01 = NaN;
    this.d02 = NaN;
    this.d10 = NaN;
    this.d11 = NaN;
    this.d12 = NaN;
    this.d20 = NaN;
    this.d21 = NaN;
    this.d22 = NaN;

    this.limitMotor1 = limitMotor1;
    this.limitMotor2 = limitMotor2;
    this.limitMotor3 = limitMotor3;
    this.b1 = joint.body1;
    this.b2 = joint.body2;
    this.p1 = joint.anchorPoint1;
    this.p2 = joint.anchorPoint2;
    this.r1 = joint.relativeAnchorPoint1;
    this.r2 = joint.relativeAnchorPoint2;
    this.l1 = this.b1.linearVelocity;
    this.l2 = this.b2.linearVelocity;
    this.a1 = this.b1.angularVelocity;
    this.a2 = this.b2.angularVelocity;
    this.i1 = this.b1.inverseInertia;
    this.i2 = this.b2.inverseInertia;
    this.limitImpulse1 = 0;
    this.motorImpulse1 = 0;
    this.limitImpulse2 = 0;
    this.motorImpulse2 = 0;
    this.limitImpulse3 = 0;
    this.motorImpulse3 = 0;
    this.cfm1 = 0;// Constraint Force Mixing
    this.cfm2 = 0;
    this.cfm3 = 0;
    this.weight = -1;
  }

  Object.assign(Translational3Constraint.prototype, {

    Translational3Constraint: true,

    preSolve: function (timeStep, invTimeStep) {
      this.ax1 = this.limitMotor1.axis.x;
      this.ay1 = this.limitMotor1.axis.y;
      this.az1 = this.limitMotor1.axis.z;
      this.ax2 = this.limitMotor2.axis.x;
      this.ay2 = this.limitMotor2.axis.y;
      this.az2 = this.limitMotor2.axis.z;
      this.ax3 = this.limitMotor3.axis.x;
      this.ay3 = this.limitMotor3.axis.y;
      this.az3 = this.limitMotor3.axis.z;
      this.lowerLimit1 = this.limitMotor1.lowerLimit;
      this.upperLimit1 = this.limitMotor1.upperLimit;
      this.motorSpeed1 = this.limitMotor1.motorSpeed;
      this.maxMotorForce1 = this.limitMotor1.maxMotorForce;
      this.enableMotor1 = this.maxMotorForce1 > 0;
      this.lowerLimit2 = this.limitMotor2.lowerLimit;
      this.upperLimit2 = this.limitMotor2.upperLimit;
      this.motorSpeed2 = this.limitMotor2.motorSpeed;
      this.maxMotorForce2 = this.limitMotor2.maxMotorForce;
      this.enableMotor2 = this.maxMotorForce2 > 0;
      this.lowerLimit3 = this.limitMotor3.lowerLimit;
      this.upperLimit3 = this.limitMotor3.upperLimit;
      this.motorSpeed3 = this.limitMotor3.motorSpeed;
      this.maxMotorForce3 = this.limitMotor3.maxMotorForce;
      this.enableMotor3 = this.maxMotorForce3 > 0;
      this.m1 = this.b1.inverseMass;
      this.m2 = this.b2.inverseMass;

      var ti1 = this.i1.elements;
      var ti2 = this.i2.elements;
      this.i1e00 = ti1[0];
      this.i1e01 = ti1[1];
      this.i1e02 = ti1[2];
      this.i1e10 = ti1[3];
      this.i1e11 = ti1[4];
      this.i1e12 = ti1[5];
      this.i1e20 = ti1[6];
      this.i1e21 = ti1[7];
      this.i1e22 = ti1[8];

      this.i2e00 = ti2[0];
      this.i2e01 = ti2[1];
      this.i2e02 = ti2[2];
      this.i2e10 = ti2[3];
      this.i2e11 = ti2[4];
      this.i2e12 = ti2[5];
      this.i2e20 = ti2[6];
      this.i2e21 = ti2[7];
      this.i2e22 = ti2[8];

      var dx = this.p2.x - this.p1.x;
      var dy = this.p2.y - this.p1.y;
      var dz = this.p2.z - this.p1.z;
      var d1 = dx * this.ax1 + dy * this.ay1 + dz * this.az1;
      var d2 = dx * this.ax2 + dy * this.ay2 + dz * this.az2;
      var d3 = dx * this.ax3 + dy * this.ay3 + dz * this.az3;
      var frequency1 = this.limitMotor1.frequency;
      var frequency2 = this.limitMotor2.frequency;
      var frequency3 = this.limitMotor3.frequency;
      var enableSpring1 = frequency1 > 0;
      var enableSpring2 = frequency2 > 0;
      var enableSpring3 = frequency3 > 0;
      var enableLimit1 = this.lowerLimit1 <= this.upperLimit1;
      var enableLimit2 = this.lowerLimit2 <= this.upperLimit2;
      var enableLimit3 = this.lowerLimit3 <= this.upperLimit3;

      // for stability
      if (enableSpring1 && d1 > 20 || d1 < -20) {
        enableSpring1 = false;
      }
      if (enableSpring2 && d2 > 20 || d2 < -20) {
        enableSpring2 = false;
      }
      if (enableSpring3 && d3 > 20 || d3 < -20) {
        enableSpring3 = false;
      }

      if (enableLimit1) {
        if (this.lowerLimit1 == this.upperLimit1) {
          if (this.limitState1 != 0) {
            this.limitState1 = 0;
            this.limitImpulse1 = 0;
          }
          this.limitVelocity1 = this.lowerLimit1 - d1;
          if (!enableSpring1) d1 = this.lowerLimit1;
        } else if (d1 < this.lowerLimit1) {
          if (this.limitState1 != -1) {
            this.limitState1 = -1;
            this.limitImpulse1 = 0;
          }
          this.limitVelocity1 = this.lowerLimit1 - d1;
          if (!enableSpring1) d1 = this.lowerLimit1;
        } else if (d1 > this.upperLimit1) {
          if (this.limitState1 != 1) {
            this.limitState1 = 1;
            this.limitImpulse1 = 0;
          }
          this.limitVelocity1 = this.upperLimit1 - d1;
          if (!enableSpring1) d1 = this.upperLimit1;
        } else {
          this.limitState1 = 2;
          this.limitImpulse1 = 0;
          this.limitVelocity1 = 0;
        }
        if (!enableSpring1) {
          if (this.limitVelocity1 > 0.005) this.limitVelocity1 -= 0.005;
          else if (this.limitVelocity1 < -0.005) this.limitVelocity1 += 0.005;
          else this.limitVelocity1 = 0;
        }
      } else {
        this.limitState1 = 2;
        this.limitImpulse1 = 0;
      }

      if (enableLimit2) {
        if (this.lowerLimit2 == this.upperLimit2) {
          if (this.limitState2 != 0) {
            this.limitState2 = 0;
            this.limitImpulse2 = 0;
          }
          this.limitVelocity2 = this.lowerLimit2 - d2;
          if (!enableSpring2) d2 = this.lowerLimit2;
        } else if (d2 < this.lowerLimit2) {
          if (this.limitState2 != -1) {
            this.limitState2 = -1;
            this.limitImpulse2 = 0;
          }
          this.limitVelocity2 = this.lowerLimit2 - d2;
          if (!enableSpring2) d2 = this.lowerLimit2;
        } else if (d2 > this.upperLimit2) {
          if (this.limitState2 != 1) {
            this.limitState2 = 1;
            this.limitImpulse2 = 0;
          }
          this.limitVelocity2 = this.upperLimit2 - d2;
          if (!enableSpring2) d2 = this.upperLimit2;
        } else {
          this.limitState2 = 2;
          this.limitImpulse2 = 0;
          this.limitVelocity2 = 0;
        }
        if (!enableSpring2) {
          if (this.limitVelocity2 > 0.005) this.limitVelocity2 -= 0.005;
          else if (this.limitVelocity2 < -0.005) this.limitVelocity2 += 0.005;
          else this.limitVelocity2 = 0;
        }
      } else {
        this.limitState2 = 2;
        this.limitImpulse2 = 0;
      }

      if (enableLimit3) {
        if (this.lowerLimit3 == this.upperLimit3) {
          if (this.limitState3 != 0) {
            this.limitState3 = 0;
            this.limitImpulse3 = 0;
          }
          this.limitVelocity3 = this.lowerLimit3 - d3;
          if (!enableSpring3) d3 = this.lowerLimit3;
        } else if (d3 < this.lowerLimit3) {
          if (this.limitState3 != -1) {
            this.limitState3 = -1;
            this.limitImpulse3 = 0;
          }
          this.limitVelocity3 = this.lowerLimit3 - d3;
          if (!enableSpring3) d3 = this.lowerLimit3;
        } else if (d3 > this.upperLimit3) {
          if (this.limitState3 != 1) {
            this.limitState3 = 1;
            this.limitImpulse3 = 0;
          }
          this.limitVelocity3 = this.upperLimit3 - d3;
          if (!enableSpring3) d3 = this.upperLimit3;
        } else {
          this.limitState3 = 2;
          this.limitImpulse3 = 0;
          this.limitVelocity3 = 0;
        }
        if (!enableSpring3) {
          if (this.limitVelocity3 > 0.005) this.limitVelocity3 -= 0.005;
          else if (this.limitVelocity3 < -0.005) this.limitVelocity3 += 0.005;
          else this.limitVelocity3 = 0;
        }
      } else {
        this.limitState3 = 2;
        this.limitImpulse3 = 0;
      }

      if (this.enableMotor1 && (this.limitState1 != 0 || enableSpring1)) {
        this.maxMotorImpulse1 = this.maxMotorForce1 * timeStep;
      } else {
        this.motorImpulse1 = 0;
        this.maxMotorImpulse1 = 0;
      }

      if (this.enableMotor2 && (this.limitState2 != 0 || enableSpring2)) {
        this.maxMotorImpulse2 = this.maxMotorForce2 * timeStep;
      } else {
        this.motorImpulse2 = 0;
        this.maxMotorImpulse2 = 0;
      }

      if (this.enableMotor3 && (this.limitState3 != 0 || enableSpring3)) {
        this.maxMotorImpulse3 = this.maxMotorForce3 * timeStep;
      } else {
        this.motorImpulse3 = 0;
        this.maxMotorImpulse3 = 0;
      }

      var rdx = d1 * this.ax1 + d2 * this.ax2 + d3 * this.ax2;
      var rdy = d1 * this.ay1 + d2 * this.ay2 + d3 * this.ay2;
      var rdz = d1 * this.az1 + d2 * this.az2 + d3 * this.az2;
      var w1 = this.m2 / (this.m1 + this.m2);
      if (this.weight >= 0) w1 = this.weight; // use given weight
      var w2 = 1 - w1;
      this.r1x = this.r1.x + rdx * w1;
      this.r1y = this.r1.y + rdy * w1;
      this.r1z = this.r1.z + rdz * w1;
      this.r2x = this.r2.x - rdx * w2;
      this.r2y = this.r2.y - rdy * w2;
      this.r2z = this.r2.z - rdz * w2;

      // build jacobians
      this.t1x1 = this.r1y * this.az1 - this.r1z * this.ay1;
      this.t1y1 = this.r1z * this.ax1 - this.r1x * this.az1;
      this.t1z1 = this.r1x * this.ay1 - this.r1y * this.ax1;
      this.t2x1 = this.r2y * this.az1 - this.r2z * this.ay1;
      this.t2y1 = this.r2z * this.ax1 - this.r2x * this.az1;
      this.t2z1 = this.r2x * this.ay1 - this.r2y * this.ax1;
      this.l1x1 = this.ax1 * this.m1;
      this.l1y1 = this.ay1 * this.m1;
      this.l1z1 = this.az1 * this.m1;
      this.l2x1 = this.ax1 * this.m2;
      this.l2y1 = this.ay1 * this.m2;
      this.l2z1 = this.az1 * this.m2;
      this.a1x1 = this.t1x1 * this.i1e00 + this.t1y1 * this.i1e01 + this.t1z1 * this.i1e02;
      this.a1y1 = this.t1x1 * this.i1e10 + this.t1y1 * this.i1e11 + this.t1z1 * this.i1e12;
      this.a1z1 = this.t1x1 * this.i1e20 + this.t1y1 * this.i1e21 + this.t1z1 * this.i1e22;
      this.a2x1 = this.t2x1 * this.i2e00 + this.t2y1 * this.i2e01 + this.t2z1 * this.i2e02;
      this.a2y1 = this.t2x1 * this.i2e10 + this.t2y1 * this.i2e11 + this.t2z1 * this.i2e12;
      this.a2z1 = this.t2x1 * this.i2e20 + this.t2y1 * this.i2e21 + this.t2z1 * this.i2e22;

      this.t1x2 = this.r1y * this.az2 - this.r1z * this.ay2;
      this.t1y2 = this.r1z * this.ax2 - this.r1x * this.az2;
      this.t1z2 = this.r1x * this.ay2 - this.r1y * this.ax2;
      this.t2x2 = this.r2y * this.az2 - this.r2z * this.ay2;
      this.t2y2 = this.r2z * this.ax2 - this.r2x * this.az2;
      this.t2z2 = this.r2x * this.ay2 - this.r2y * this.ax2;
      this.l1x2 = this.ax2 * this.m1;
      this.l1y2 = this.ay2 * this.m1;
      this.l1z2 = this.az2 * this.m1;
      this.l2x2 = this.ax2 * this.m2;
      this.l2y2 = this.ay2 * this.m2;
      this.l2z2 = this.az2 * this.m2;
      this.a1x2 = this.t1x2 * this.i1e00 + this.t1y2 * this.i1e01 + this.t1z2 * this.i1e02;
      this.a1y2 = this.t1x2 * this.i1e10 + this.t1y2 * this.i1e11 + this.t1z2 * this.i1e12;
      this.a1z2 = this.t1x2 * this.i1e20 + this.t1y2 * this.i1e21 + this.t1z2 * this.i1e22;
      this.a2x2 = this.t2x2 * this.i2e00 + this.t2y2 * this.i2e01 + this.t2z2 * this.i2e02;
      this.a2y2 = this.t2x2 * this.i2e10 + this.t2y2 * this.i2e11 + this.t2z2 * this.i2e12;
      this.a2z2 = this.t2x2 * this.i2e20 + this.t2y2 * this.i2e21 + this.t2z2 * this.i2e22;

      this.t1x3 = this.r1y * this.az3 - this.r1z * this.ay3;
      this.t1y3 = this.r1z * this.ax3 - this.r1x * this.az3;
      this.t1z3 = this.r1x * this.ay3 - this.r1y * this.ax3;
      this.t2x3 = this.r2y * this.az3 - this.r2z * this.ay3;
      this.t2y3 = this.r2z * this.ax3 - this.r2x * this.az3;
      this.t2z3 = this.r2x * this.ay3 - this.r2y * this.ax3;
      this.l1x3 = this.ax3 * this.m1;
      this.l1y3 = this.ay3 * this.m1;
      this.l1z3 = this.az3 * this.m1;
      this.l2x3 = this.ax3 * this.m2;
      this.l2y3 = this.ay3 * this.m2;
      this.l2z3 = this.az3 * this.m2;
      this.a1x3 = this.t1x3 * this.i1e00 + this.t1y3 * this.i1e01 + this.t1z3 * this.i1e02;
      this.a1y3 = this.t1x3 * this.i1e10 + this.t1y3 * this.i1e11 + this.t1z3 * this.i1e12;
      this.a1z3 = this.t1x3 * this.i1e20 + this.t1y3 * this.i1e21 + this.t1z3 * this.i1e22;
      this.a2x3 = this.t2x3 * this.i2e00 + this.t2y3 * this.i2e01 + this.t2z3 * this.i2e02;
      this.a2y3 = this.t2x3 * this.i2e10 + this.t2y3 * this.i2e11 + this.t2z3 * this.i2e12;
      this.a2z3 = this.t2x3 * this.i2e20 + this.t2y3 * this.i2e21 + this.t2z3 * this.i2e22;

      // build an impulse matrix
      var m12 = this.m1 + this.m2;
      this.k00 = (this.ax1 * this.ax1 + this.ay1 * this.ay1 + this.az1 * this.az1) * m12;
      this.k01 = (this.ax1 * this.ax2 + this.ay1 * this.ay2 + this.az1 * this.az2) * m12;
      this.k02 = (this.ax1 * this.ax3 + this.ay1 * this.ay3 + this.az1 * this.az3) * m12;
      this.k10 = (this.ax2 * this.ax1 + this.ay2 * this.ay1 + this.az2 * this.az1) * m12;
      this.k11 = (this.ax2 * this.ax2 + this.ay2 * this.ay2 + this.az2 * this.az2) * m12;
      this.k12 = (this.ax2 * this.ax3 + this.ay2 * this.ay3 + this.az2 * this.az3) * m12;
      this.k20 = (this.ax3 * this.ax1 + this.ay3 * this.ay1 + this.az3 * this.az1) * m12;
      this.k21 = (this.ax3 * this.ax2 + this.ay3 * this.ay2 + this.az3 * this.az2) * m12;
      this.k22 = (this.ax3 * this.ax3 + this.ay3 * this.ay3 + this.az3 * this.az3) * m12;

      this.k00 += this.t1x1 * this.a1x1 + this.t1y1 * this.a1y1 + this.t1z1 * this.a1z1;
      this.k01 += this.t1x1 * this.a1x2 + this.t1y1 * this.a1y2 + this.t1z1 * this.a1z2;
      this.k02 += this.t1x1 * this.a1x3 + this.t1y1 * this.a1y3 + this.t1z1 * this.a1z3;
      this.k10 += this.t1x2 * this.a1x1 + this.t1y2 * this.a1y1 + this.t1z2 * this.a1z1;
      this.k11 += this.t1x2 * this.a1x2 + this.t1y2 * this.a1y2 + this.t1z2 * this.a1z2;
      this.k12 += this.t1x2 * this.a1x3 + this.t1y2 * this.a1y3 + this.t1z2 * this.a1z3;
      this.k20 += this.t1x3 * this.a1x1 + this.t1y3 * this.a1y1 + this.t1z3 * this.a1z1;
      this.k21 += this.t1x3 * this.a1x2 + this.t1y3 * this.a1y2 + this.t1z3 * this.a1z2;
      this.k22 += this.t1x3 * this.a1x3 + this.t1y3 * this.a1y3 + this.t1z3 * this.a1z3;

      this.k00 += this.t2x1 * this.a2x1 + this.t2y1 * this.a2y1 + this.t2z1 * this.a2z1;
      this.k01 += this.t2x1 * this.a2x2 + this.t2y1 * this.a2y2 + this.t2z1 * this.a2z2;
      this.k02 += this.t2x1 * this.a2x3 + this.t2y1 * this.a2y3 + this.t2z1 * this.a2z3;
      this.k10 += this.t2x2 * this.a2x1 + this.t2y2 * this.a2y1 + this.t2z2 * this.a2z1;
      this.k11 += this.t2x2 * this.a2x2 + this.t2y2 * this.a2y2 + this.t2z2 * this.a2z2;
      this.k12 += this.t2x2 * this.a2x3 + this.t2y2 * this.a2y3 + this.t2z2 * this.a2z3;
      this.k20 += this.t2x3 * this.a2x1 + this.t2y3 * this.a2y1 + this.t2z3 * this.a2z1;
      this.k21 += this.t2x3 * this.a2x2 + this.t2y3 * this.a2y2 + this.t2z3 * this.a2z2;
      this.k22 += this.t2x3 * this.a2x3 + this.t2y3 * this.a2y3 + this.t2z3 * this.a2z3;

      this.kv00 = this.k00;
      this.kv11 = this.k11;
      this.kv22 = this.k22;

      this.dv00 = 1 / this.kv00;
      this.dv11 = 1 / this.kv11;
      this.dv22 = 1 / this.kv22;

      if (enableSpring1 && this.limitState1 != 2) {
        var omega = 6.2831853 * frequency1;
        var k = omega * omega * timeStep;
        var dmp = invTimeStep / (k + 2 * this.limitMotor1.dampingRatio * omega);
        this.cfm1 = this.kv00 * dmp;
        this.limitVelocity1 *= k * dmp;
      } else {
        this.cfm1 = 0;
        this.limitVelocity1 *= invTimeStep * 0.05;
      }
      if (enableSpring2 && this.limitState2 != 2) {
        omega = 6.2831853 * frequency2;
        k = omega * omega * timeStep;
        dmp = invTimeStep / (k + 2 * this.limitMotor2.dampingRatio * omega);
        this.cfm2 = this.kv11 * dmp;
        this.limitVelocity2 *= k * dmp;
      } else {
        this.cfm2 = 0;
        this.limitVelocity2 *= invTimeStep * 0.05;
      }
      if (enableSpring3 && this.limitState3 != 2) {
        omega = 6.2831853 * frequency3;
        k = omega * omega * timeStep;
        dmp = invTimeStep / (k + 2 * this.limitMotor3.dampingRatio * omega);
        this.cfm3 = this.kv22 * dmp;
        this.limitVelocity3 *= k * dmp;
      } else {
        this.cfm3 = 0;
        this.limitVelocity3 *= invTimeStep * 0.05;
      }
      this.k00 += this.cfm1;
      this.k11 += this.cfm2;
      this.k22 += this.cfm3;

      var inv = 1 / (
        this.k00 * (this.k11 * this.k22 - this.k21 * this.k12) +
        this.k10 * (this.k21 * this.k02 - this.k01 * this.k22) +
        this.k20 * (this.k01 * this.k12 - this.k11 * this.k02)
      );
      this.d00 = (this.k11 * this.k22 - this.k12 * this.k21) * inv;
      this.d01 = (this.k02 * this.k21 - this.k01 * this.k22) * inv;
      this.d02 = (this.k01 * this.k12 - this.k02 * this.k11) * inv;
      this.d10 = (this.k12 * this.k20 - this.k10 * this.k22) * inv;
      this.d11 = (this.k00 * this.k22 - this.k02 * this.k20) * inv;
      this.d12 = (this.k02 * this.k10 - this.k00 * this.k12) * inv;
      this.d20 = (this.k10 * this.k21 - this.k11 * this.k20) * inv;
      this.d21 = (this.k01 * this.k20 - this.k00 * this.k21) * inv;
      this.d22 = (this.k00 * this.k11 - this.k01 * this.k10) * inv;

      // warm starting
      var totalImpulse1 = this.limitImpulse1 + this.motorImpulse1;
      var totalImpulse2 = this.limitImpulse2 + this.motorImpulse2;
      var totalImpulse3 = this.limitImpulse3 + this.motorImpulse3;
      this.l1.x += totalImpulse1 * this.l1x1 + totalImpulse2 * this.l1x2 + totalImpulse3 * this.l1x3;
      this.l1.y += totalImpulse1 * this.l1y1 + totalImpulse2 * this.l1y2 + totalImpulse3 * this.l1y3;
      this.l1.z += totalImpulse1 * this.l1z1 + totalImpulse2 * this.l1z2 + totalImpulse3 * this.l1z3;
      this.a1.x += totalImpulse1 * this.a1x1 + totalImpulse2 * this.a1x2 + totalImpulse3 * this.a1x3;
      this.a1.y += totalImpulse1 * this.a1y1 + totalImpulse2 * this.a1y2 + totalImpulse3 * this.a1y3;
      this.a1.z += totalImpulse1 * this.a1z1 + totalImpulse2 * this.a1z2 + totalImpulse3 * this.a1z3;
      this.l2.x -= totalImpulse1 * this.l2x1 + totalImpulse2 * this.l2x2 + totalImpulse3 * this.l2x3;
      this.l2.y -= totalImpulse1 * this.l2y1 + totalImpulse2 * this.l2y2 + totalImpulse3 * this.l2y3;
      this.l2.z -= totalImpulse1 * this.l2z1 + totalImpulse2 * this.l2z2 + totalImpulse3 * this.l2z3;
      this.a2.x -= totalImpulse1 * this.a2x1 + totalImpulse2 * this.a2x2 + totalImpulse3 * this.a2x3;
      this.a2.y -= totalImpulse1 * this.a2y1 + totalImpulse2 * this.a2y2 + totalImpulse3 * this.a2y3;
      this.a2.z -= totalImpulse1 * this.a2z1 + totalImpulse2 * this.a2z2 + totalImpulse3 * this.a2z3;
    },

    solve: function () {
      var rvx = this.l2.x - this.l1.x + this.a2.y * this.r2z - this.a2.z * this.r2y - this.a1.y * this.r1z + this.a1.z * this.r1y;
      var rvy = this.l2.y - this.l1.y + this.a2.z * this.r2x - this.a2.x * this.r2z - this.a1.z * this.r1x + this.a1.x * this.r1z;
      var rvz = this.l2.z - this.l1.z + this.a2.x * this.r2y - this.a2.y * this.r2x - this.a1.x * this.r1y + this.a1.y * this.r1x;
      var rvn1 = rvx * this.ax1 + rvy * this.ay1 + rvz * this.az1;
      var rvn2 = rvx * this.ax2 + rvy * this.ay2 + rvz * this.az2;
      var rvn3 = rvx * this.ax3 + rvy * this.ay3 + rvz * this.az3;
      var oldMotorImpulse1 = this.motorImpulse1;
      var oldMotorImpulse2 = this.motorImpulse2;
      var oldMotorImpulse3 = this.motorImpulse3;
      var dMotorImpulse1 = 0;
      var dMotorImpulse2 = 0;
      var dMotorImpulse3 = 0;
      if (this.enableMotor1) {
        dMotorImpulse1 = (rvn1 - this.motorSpeed1) * this.dv00;
        this.motorImpulse1 += dMotorImpulse1;
        if (this.motorImpulse1 > this.maxMotorImpulse1) { // clamp motor impulse
          this.motorImpulse1 = this.maxMotorImpulse1;
        } else if (this.motorImpulse1 < -this.maxMotorImpulse1) {
          this.motorImpulse1 = -this.maxMotorImpulse1;
        }
        dMotorImpulse1 = this.motorImpulse1 - oldMotorImpulse1;
      }
      if (this.enableMotor2) {
        dMotorImpulse2 = (rvn2 - this.motorSpeed2) * this.dv11;
        this.motorImpulse2 += dMotorImpulse2;
        if (this.motorImpulse2 > this.maxMotorImpulse2) { // clamp motor impulse
          this.motorImpulse2 = this.maxMotorImpulse2;
        } else if (this.motorImpulse2 < -this.maxMotorImpulse2) {
          this.motorImpulse2 = -this.maxMotorImpulse2;
        }
        dMotorImpulse2 = this.motorImpulse2 - oldMotorImpulse2;
      }
      if (this.enableMotor3) {
        dMotorImpulse3 = (rvn3 - this.motorSpeed3) * this.dv22;
        this.motorImpulse3 += dMotorImpulse3;
        if (this.motorImpulse3 > this.maxMotorImpulse3) { // clamp motor impulse
          this.motorImpulse3 = this.maxMotorImpulse3;
        } else if (this.motorImpulse3 < -this.maxMotorImpulse3) {
          this.motorImpulse3 = -this.maxMotorImpulse3;
        }
        dMotorImpulse3 = this.motorImpulse3 - oldMotorImpulse3;
      }

      // apply motor impulse to relative velocity
      rvn1 += dMotorImpulse1 * this.kv00 + dMotorImpulse2 * this.k01 + dMotorImpulse3 * this.k02;
      rvn2 += dMotorImpulse1 * this.k10 + dMotorImpulse2 * this.kv11 + dMotorImpulse3 * this.k12;
      rvn3 += dMotorImpulse1 * this.k20 + dMotorImpulse2 * this.k21 + dMotorImpulse3 * this.kv22;

      // subtract target velocity and applied impulse
      rvn1 -= this.limitVelocity1 + this.limitImpulse1 * this.cfm1;
      rvn2 -= this.limitVelocity2 + this.limitImpulse2 * this.cfm2;
      rvn3 -= this.limitVelocity3 + this.limitImpulse3 * this.cfm3;

      var oldLimitImpulse1 = this.limitImpulse1;
      var oldLimitImpulse2 = this.limitImpulse2;
      var oldLimitImpulse3 = this.limitImpulse3;

      var dLimitImpulse1 = rvn1 * this.d00 + rvn2 * this.d01 + rvn3 * this.d02;
      var dLimitImpulse2 = rvn1 * this.d10 + rvn2 * this.d11 + rvn3 * this.d12;
      var dLimitImpulse3 = rvn1 * this.d20 + rvn2 * this.d21 + rvn3 * this.d22;

      this.limitImpulse1 += dLimitImpulse1;
      this.limitImpulse2 += dLimitImpulse2;
      this.limitImpulse3 += dLimitImpulse3;

      // clamp
      var clampState = 0;
      if (this.limitState1 == 2 || this.limitImpulse1 * this.limitState1 < 0) {
        dLimitImpulse1 = -oldLimitImpulse1;
        rvn2 += dLimitImpulse1 * this.k10;
        rvn3 += dLimitImpulse1 * this.k20;
        clampState |= 1;
      }
      if (this.limitState2 == 2 || this.limitImpulse2 * this.limitState2 < 0) {
        dLimitImpulse2 = -oldLimitImpulse2;
        rvn1 += dLimitImpulse2 * this.k01;
        rvn3 += dLimitImpulse2 * this.k21;
        clampState |= 2;
      }
      if (this.limitState3 == 2 || this.limitImpulse3 * this.limitState3 < 0) {
        dLimitImpulse3 = -oldLimitImpulse3;
        rvn1 += dLimitImpulse3 * this.k02;
        rvn2 += dLimitImpulse3 * this.k12;
        clampState |= 4;
      }

      // update un-clamped impulse
      // TODO: isolate division
      var det;
      switch (clampState) {
        case 1:// update 2 3
          det = 1 / (this.k11 * this.k22 - this.k12 * this.k21);
          dLimitImpulse2 = (this.k22 * rvn2 + -this.k12 * rvn3) * det;
          dLimitImpulse3 = (-this.k21 * rvn2 + this.k11 * rvn3) * det;
          break;
        case 2:// update 1 3
          det = 1 / (this.k00 * this.k22 - this.k02 * this.k20);
          dLimitImpulse1 = (this.k22 * rvn1 + -this.k02 * rvn3) * det;
          dLimitImpulse3 = (-this.k20 * rvn1 + this.k00 * rvn3) * det;
          break;
        case 3:// update 3
          dLimitImpulse3 = rvn3 / this.k22;
          break;
        case 4:// update 1 2
          det = 1 / (this.k00 * this.k11 - this.k01 * this.k10);
          dLimitImpulse1 = (this.k11 * rvn1 + -this.k01 * rvn2) * det;
          dLimitImpulse2 = (-this.k10 * rvn1 + this.k00 * rvn2) * det;
          break;
        case 5:// update 2
          dLimitImpulse2 = rvn2 / this.k11;
          break;
        case 6:// update 1
          dLimitImpulse1 = rvn1 / this.k00;
          break;
      }

      this.limitImpulse1 = oldLimitImpulse1 + dLimitImpulse1;
      this.limitImpulse2 = oldLimitImpulse2 + dLimitImpulse2;
      this.limitImpulse3 = oldLimitImpulse3 + dLimitImpulse3;

      var dImpulse1 = dMotorImpulse1 + dLimitImpulse1;
      var dImpulse2 = dMotorImpulse2 + dLimitImpulse2;
      var dImpulse3 = dMotorImpulse3 + dLimitImpulse3;

      // apply impulse
      this.l1.x += dImpulse1 * this.l1x1 + dImpulse2 * this.l1x2 + dImpulse3 * this.l1x3;
      this.l1.y += dImpulse1 * this.l1y1 + dImpulse2 * this.l1y2 + dImpulse3 * this.l1y3;
      this.l1.z += dImpulse1 * this.l1z1 + dImpulse2 * this.l1z2 + dImpulse3 * this.l1z3;
      this.a1.x += dImpulse1 * this.a1x1 + dImpulse2 * this.a1x2 + dImpulse3 * this.a1x3;
      this.a1.y += dImpulse1 * this.a1y1 + dImpulse2 * this.a1y2 + dImpulse3 * this.a1y3;
      this.a1.z += dImpulse1 * this.a1z1 + dImpulse2 * this.a1z2 + dImpulse3 * this.a1z3;
      this.l2.x -= dImpulse1 * this.l2x1 + dImpulse2 * this.l2x2 + dImpulse3 * this.l2x3;
      this.l2.y -= dImpulse1 * this.l2y1 + dImpulse2 * this.l2y2 + dImpulse3 * this.l2y3;
      this.l2.z -= dImpulse1 * this.l2z1 + dImpulse2 * this.l2z2 + dImpulse3 * this.l2z3;
      this.a2.x -= dImpulse1 * this.a2x1 + dImpulse2 * this.a2x2 + dImpulse3 * this.a2x3;
      this.a2.y -= dImpulse1 * this.a2y1 + dImpulse2 * this.a2y2 + dImpulse3 * this.a2y3;
      this.a2.z -= dImpulse1 * this.a2z1 + dImpulse2 * this.a2z2 + dImpulse3 * this.a2z3;
    }

  });

  /**
   * A prismatic joint allows only for relative translation of rigid bodies along the axis.
   *
   * @author saharan
   * @author lo-th
   */

  function PrismaticJoint(config, lowerTranslation, upperTranslation) {

    Joint.call(this, config);

    this.type = JOINT_PRISMATIC;

    // The axis in the first body's coordinate system.
    this.localAxis1 = config.localAxis1.clone().normalize();
    // The axis in the second body's coordinate system.
    this.localAxis2 = config.localAxis2.clone().normalize();

    this.ax1 = new Vec3();
    this.ax2 = new Vec3();

    this.nor = new Vec3();
    this.tan = new Vec3();
    this.bin = new Vec3();

    this.ac = new AngularConstraint(this, new Quat().setFromUnitVectors(this.localAxis1, this.localAxis2));

    // The translational limit and motor information of the joint.
    this.limitMotor = new LimitMotor(this.nor, true);
    this.limitMotor.lowerLimit = lowerTranslation;
    this.limitMotor.upperLimit = upperTranslation;
    this.t3 = new Translational3Constraint(this, this.limitMotor, new LimitMotor(this.tan, true), new LimitMotor(this.bin, true));

  }
  PrismaticJoint.prototype = Object.assign(Object.create(Joint.prototype), {

    constructor: PrismaticJoint,

    preSolve: function (timeStep, invTimeStep) {

      this.updateAnchorPoints();

      this.ax1.copy(this.localAxis1).applyMatrix3(this.body1.rotation, true);
      this.ax2.copy(this.localAxis2).applyMatrix3(this.body2.rotation, true);

      // normal tangent binormal

      this.nor.set(
        this.ax1.x * this.body2.inverseMass + this.ax2.x * this.body1.inverseMass,
        this.ax1.y * this.body2.inverseMass + this.ax2.y * this.body1.inverseMass,
        this.ax1.z * this.body2.inverseMass + this.ax2.z * this.body1.inverseMass
      ).normalize();
      this.tan.tangent(this.nor).normalize();
      this.bin.crossVectors(this.nor, this.tan);

      // preSolve

      this.ac.preSolve(timeStep, invTimeStep);
      this.t3.preSolve(timeStep, invTimeStep);

    },

    solve: function () {

      this.ac.solve();
      this.t3.solve();

    },

    postSolve: function () {

    }

  });

  /**
   * A slider joint allows for relative translation and relative rotation between two rigid bodies along the axis.
   *
   * @author saharan
   * @author lo-th
   */

  function SliderJoint(config, lowerTranslation, upperTranslation) {

    Joint.call(this, config);

    this.type = JOINT_SLIDER;

    // The axis in the first body's coordinate system.
    this.localAxis1 = config.localAxis1.clone().normalize();
    // The axis in the second body's coordinate system.
    this.localAxis2 = config.localAxis2.clone().normalize();

    // make angle axis
    var arc = new Mat33().setQuat(new Quat().setFromUnitVectors(this.localAxis1, this.localAxis2));
    this.localAngle1 = new Vec3().tangent(this.localAxis1).normalize();
    this.localAngle2 = this.localAngle1.clone().applyMatrix3(arc, true);

    this.ax1 = new Vec3();
    this.ax2 = new Vec3();
    this.an1 = new Vec3();
    this.an2 = new Vec3();

    this.tmp = new Vec3();

    this.nor = new Vec3();
    this.tan = new Vec3();
    this.bin = new Vec3();

    // The limit and motor for the rotation
    this.rotationalLimitMotor = new LimitMotor(this.nor, false);
    this.r3 = new Rotational3Constraint(this, this.rotationalLimitMotor, new LimitMotor(this.tan, true), new LimitMotor(this.bin, true));

    // The limit and motor for the translation.
    this.translationalLimitMotor = new LimitMotor(this.nor, true);
    this.translationalLimitMotor.lowerLimit = lowerTranslation;
    this.translationalLimitMotor.upperLimit = upperTranslation;
    this.t3 = new Translational3Constraint(this, this.translationalLimitMotor, new LimitMotor(this.tan, true), new LimitMotor(this.bin, true));

  }
  SliderJoint.prototype = Object.assign(Object.create(Joint.prototype), {

    constructor: SliderJoint,

    preSolve: function (timeStep, invTimeStep) {

      this.updateAnchorPoints();

      this.ax1.copy(this.localAxis1).applyMatrix3(this.body1.rotation, true);
      this.an1.copy(this.localAngle1).applyMatrix3(this.body1.rotation, true);

      this.ax2.copy(this.localAxis2).applyMatrix3(this.body2.rotation, true);
      this.an2.copy(this.localAngle2).applyMatrix3(this.body2.rotation, true);

      // normal tangent binormal

      this.nor.set(
        this.ax1.x * this.body2.inverseMass + this.ax2.x * this.body1.inverseMass,
        this.ax1.y * this.body2.inverseMass + this.ax2.y * this.body1.inverseMass,
        this.ax1.z * this.body2.inverseMass + this.ax2.z * this.body1.inverseMass
      ).normalize();
      this.tan.tangent(this.nor).normalize();
      this.bin.crossVectors(this.nor, this.tan);

      // calculate hinge angle

      this.tmp.crossVectors(this.an1, this.an2);

      var limite = _Math.acosClamp(_Math.dotVectors(this.an1, this.an2));

      if (_Math.dotVectors(this.nor, this.tmp) < 0) this.rotationalLimitMotor.angle = -limite;
      else this.rotationalLimitMotor.angle = limite;

      // angular error

      this.tmp.crossVectors(this.ax1, this.ax2);
      this.r3.limitMotor2.angle = _Math.dotVectors(this.tan, this.tmp);
      this.r3.limitMotor3.angle = _Math.dotVectors(this.bin, this.tmp);

      // preSolve

      this.r3.preSolve(timeStep, invTimeStep);
      this.t3.preSolve(timeStep, invTimeStep);

    },

    solve: function () {

      this.r3.solve();
      this.t3.solve();

    },

    postSolve: function () {

    }

  });

  /**
   * A wheel joint allows for relative rotation between two rigid bodies along two axes.
   * The wheel joint also allows for relative translation for the suspension.
   *
   * @author saharan
   * @author lo-th
   */

  function WheelJoint(config) {

    Joint.call(this, config);

    this.type = JOINT_WHEEL;

    // The axis in the first body's coordinate system.
    this.localAxis1 = config.localAxis1.clone().normalize();
    // The axis in the second body's coordinate system.
    this.localAxis2 = config.localAxis2.clone().normalize();

    this.localAngle1 = new Vec3();
    this.localAngle2 = new Vec3();

    var dot = _Math.dotVectors(this.localAxis1, this.localAxis2);

    if (dot > -1 && dot < 1) {

      this.localAngle1.set(
        this.localAxis2.x - dot * this.localAxis1.x,
        this.localAxis2.y - dot * this.localAxis1.y,
        this.localAxis2.z - dot * this.localAxis1.z
      ).normalize();

      this.localAngle2.set(
        this.localAxis1.x - dot * this.localAxis2.x,
        this.localAxis1.y - dot * this.localAxis2.y,
        this.localAxis1.z - dot * this.localAxis2.z
      ).normalize();

    } else {

      var arc = new Mat33().setQuat(new Quat().setFromUnitVectors(this.localAxis1, this.localAxis2));
      this.localAngle1.tangent(this.localAxis1).normalize();
      this.localAngle2 = this.localAngle1.clone().applyMatrix3(arc, true);

    }

    this.ax1 = new Vec3();
    this.ax2 = new Vec3();
    this.an1 = new Vec3();
    this.an2 = new Vec3();

    this.tmp = new Vec3();

    this.nor = new Vec3();
    this.tan = new Vec3();
    this.bin = new Vec3();

    // The translational limit and motor information of the joint.
    this.translationalLimitMotor = new LimitMotor(this.tan, true);
    this.translationalLimitMotor.frequency = 8;
    this.translationalLimitMotor.dampingRatio = 1;
    // The first rotational limit and motor information of the joint.
    this.rotationalLimitMotor1 = new LimitMotor(this.tan, false);
    // The second rotational limit and motor information of the joint.
    this.rotationalLimitMotor2 = new LimitMotor(this.bin, false);

    this.t3 = new Translational3Constraint(this, new LimitMotor(this.nor, true), this.translationalLimitMotor, new LimitMotor(this.bin, true));
    this.t3.weight = 1;
    this.r3 = new Rotational3Constraint(this, new LimitMotor(this.nor, true), this.rotationalLimitMotor1, this.rotationalLimitMotor2);

  }
  WheelJoint.prototype = Object.assign(Object.create(Joint.prototype), {

    constructor: WheelJoint,

    preSolve: function (timeStep, invTimeStep) {

      this.updateAnchorPoints();

      this.ax1.copy(this.localAxis1).applyMatrix3(this.body1.rotation, true);
      this.an1.copy(this.localAngle1).applyMatrix3(this.body1.rotation, true);

      this.ax2.copy(this.localAxis2).applyMatrix3(this.body2.rotation, true);
      this.an2.copy(this.localAngle2).applyMatrix3(this.body2.rotation, true);

      this.r3.limitMotor1.angle = _Math.dotVectors(this.ax1, this.ax2);

      var limite = _Math.dotVectors(this.an1, this.ax2);

      if (_Math.dotVectors(this.ax1, this.tmp.crossVectors(this.an1, this.ax2)) < 0) this.rotationalLimitMotor1.angle = -limite;
      else this.rotationalLimitMotor1.angle = limite;

      limite = _Math.dotVectors(this.an2, this.ax1);

      if (_Math.dotVectors(this.ax2, this.tmp.crossVectors(this.an2, this.ax1)) < 0) this.rotationalLimitMotor2.angle = -limite;
      else this.rotationalLimitMotor2.angle = limite;

      this.nor.crossVectors(this.ax1, this.ax2).normalize();
      this.tan.crossVectors(this.nor, this.ax2).normalize();
      this.bin.crossVectors(this.nor, this.ax1).normalize();

      this.r3.preSolve(timeStep, invTimeStep);
      this.t3.preSolve(timeStep, invTimeStep);

    },

    solve: function () {

      this.r3.solve();
      this.t3.solve();

    },

    postSolve: function () {

    }

  });

  function JointConfig() {

    this.scale = 1;
    this.invScale = 1;

    // The first rigid body of the joint.
    this.body1 = null;
    // The second rigid body of the joint.
    this.body2 = null;
    // The anchor point on the first rigid body in local coordinate system.
    this.localAnchorPoint1 = new Vec3();
    //  The anchor point on the second rigid body in local coordinate system.
    this.localAnchorPoint2 = new Vec3();
    // The axis in the first body's coordinate system.
    // his property is available in some joints.
    this.localAxis1 = new Vec3();
    // The axis in the second body's coordinate system.
    // This property is available in some joints.
    this.localAxis2 = new Vec3();
    //  Whether allow collision between connected rigid bodies or not.
    this.allowCollision = false;

  }

  /**
   * This class holds mass information of a shape.
   * @author lo-th
   * @author saharan
   */

  function MassInfo() {

    // Mass of the shape.
    this.mass = 0;

    // The moment inertia of the shape.
    this.inertia = new Mat33();

  }

  /**
  * A link list of contacts.
  * @author saharan
  */
  function ContactLink(contact) {

    // The previous contact link.
    this.prev = null;
    // The next contact link.
    this.next = null;
    // The shape of the contact.
    this.shape = null;
    // The other rigid body.
    this.body = null;
    // The contact of the link.
    this.contact = contact;

  }

  function ImpulseDataBuffer() {

    this.lp1X = NaN;
    this.lp1Y = NaN;
    this.lp1Z = NaN;
    this.lp2X = NaN;
    this.lp2Y = NaN;
    this.lp2Z = NaN;
    this.impulse = NaN;

  }

  /**
  * The class holds details of the contact point.
  * @author saharan
  */

  function ManifoldPoint() {

    // Whether this manifold point is persisting or not.
    this.warmStarted = false;
    //  The position of this manifold point.
    this.position = new Vec3();
    // The position in the first shape's coordinate.
    this.localPoint1 = new Vec3();
    //  The position in the second shape's coordinate.
    this.localPoint2 = new Vec3();
    // The normal vector of this manifold point.
    this.normal = new Vec3();
    // The tangent vector of this manifold point.
    this.tangent = new Vec3();
    // The binormal vector of this manifold point.
    this.binormal = new Vec3();
    // The impulse in normal direction.
    this.normalImpulse = 0;
    // The impulse in tangent direction.
    this.tangentImpulse = 0;
    // The impulse in binormal direction.
    this.binormalImpulse = 0;
    // The denominator in normal direction.
    this.normalDenominator = 0;
    // The denominator in tangent direction.
    this.tangentDenominator = 0;
    // The denominator in binormal direction.
    this.binormalDenominator = 0;
    // The depth of penetration.
    this.penetration = 0;

  }

  /**
  * A contact manifold between two shapes.
  * @author saharan
  * @author lo-th
  */

  function ContactManifold() {

    // The first rigid body.
    this.body1 = null;
    // The second rigid body.
    this.body2 = null;
    // The number of manifold points.
    this.numPoints = 0;
    // The manifold points.
    this.points = [
      new ManifoldPoint(),
      new ManifoldPoint(),
      new ManifoldPoint(),
      new ManifoldPoint()
    ];

  }

  ContactManifold.prototype = {

    constructor: ContactManifold,

    //Reset the manifold.
    reset: function (shape1, shape2) {

      this.body1 = shape1.parent;
      this.body2 = shape2.parent;
      this.numPoints = 0;

    },

    //  Add a point into this manifold.
    addPointVec: function (pos, norm, penetration, flip) {

      var p = this.points[this.numPoints++];

      p.position.copy(pos);
      p.localPoint1.sub(pos, this.body1.position).applyMatrix3(this.body1.rotation);
      p.localPoint2.sub(pos, this.body2.position).applyMatrix3(this.body2.rotation);

      p.normal.copy(norm);
      if (flip) p.normal.negate();

      p.normalImpulse = 0;
      p.penetration = penetration;
      p.warmStarted = false;

    },

    //  Add a point into this manifold.
    addPoint: function (x, y, z, nx, ny, nz, penetration, flip) {

      var p = this.points[this.numPoints++];

      p.position.set(x, y, z);
      p.localPoint1.sub(p.position, this.body1.position).applyMatrix3(this.body1.rotation);
      p.localPoint2.sub(p.position, this.body2.position).applyMatrix3(this.body2.rotation);

      p.normalImpulse = 0;

      p.normal.set(nx, ny, nz);
      if (flip) p.normal.negate();

      p.penetration = penetration;
      p.warmStarted = false;

    }
  };

  function ContactPointDataBuffer() {

    this.nor = new Vec3();
    this.tan = new Vec3();
    this.bin = new Vec3();

    this.norU1 = new Vec3();
    this.tanU1 = new Vec3();
    this.binU1 = new Vec3();

    this.norU2 = new Vec3();
    this.tanU2 = new Vec3();
    this.binU2 = new Vec3();

    this.norT1 = new Vec3();
    this.tanT1 = new Vec3();
    this.binT1 = new Vec3();

    this.norT2 = new Vec3();
    this.tanT2 = new Vec3();
    this.binT2 = new Vec3();

    this.norTU1 = new Vec3();
    this.tanTU1 = new Vec3();
    this.binTU1 = new Vec3();

    this.norTU2 = new Vec3();
    this.tanTU2 = new Vec3();
    this.binTU2 = new Vec3();

    this.norImp = 0;
    this.tanImp = 0;
    this.binImp = 0;

    this.norDen = 0;
    this.tanDen = 0;
    this.binDen = 0;

    this.norTar = 0;

    this.next = null;
    this.last = false;

  }

  /**
  * ...
  * @author saharan
  */
  function ContactConstraint(manifold) {

    Constraint.call(this);
    // The contact manifold of the constraint.
    this.manifold = manifold;
    // The coefficient of restitution of the constraint.
    this.restitution = NaN;
    // The coefficient of friction of the constraint.
    this.friction = NaN;
    this.p1 = null;
    this.p2 = null;
    this.lv1 = null;
    this.lv2 = null;
    this.av1 = null;
    this.av2 = null;
    this.i1 = null;
    this.i2 = null;

    //this.ii1 = null;
    //this.ii2 = null;

    this.tmp = new Vec3();
    this.tmpC1 = new Vec3();
    this.tmpC2 = new Vec3();

    this.tmpP1 = new Vec3();
    this.tmpP2 = new Vec3();

    this.tmplv1 = new Vec3();
    this.tmplv2 = new Vec3();
    this.tmpav1 = new Vec3();
    this.tmpav2 = new Vec3();

    this.m1 = NaN;
    this.m2 = NaN;
    this.num = 0;

    this.ps = manifold.points;
    this.cs = new ContactPointDataBuffer();
    this.cs.next = new ContactPointDataBuffer();
    this.cs.next.next = new ContactPointDataBuffer();
    this.cs.next.next.next = new ContactPointDataBuffer();
  }

  ContactConstraint.prototype = Object.assign(Object.create(Constraint.prototype), {

    constructor: ContactConstraint,

    // Attach the constraint to the bodies.
    attach: function () {

      this.p1 = this.body1.position;
      this.p2 = this.body2.position;
      this.lv1 = this.body1.linearVelocity;
      this.av1 = this.body1.angularVelocity;
      this.lv2 = this.body2.linearVelocity;
      this.av2 = this.body2.angularVelocity;
      this.i1 = this.body1.inverseInertia;
      this.i2 = this.body2.inverseInertia;

    },

    // Detach the constraint from the bodies.
    detach: function () {

      this.p1 = null;
      this.p2 = null;
      this.lv1 = null;
      this.lv2 = null;
      this.av1 = null;
      this.av2 = null;
      this.i1 = null;
      this.i2 = null;

    },

    preSolve: function (timeStep, invTimeStep) {

      this.m1 = this.body1.inverseMass;
      this.m2 = this.body2.inverseMass;

      var m1m2 = this.m1 + this.m2;

      this.num = this.manifold.numPoints;

      var c = this.cs;
      var p, rvn, len, norImp, norTar, sepV, i1, i2;
      for (var i = 0; i < this.num; i++) {

        p = this.ps[i];

        this.tmpP1.sub(p.position, this.p1);
        this.tmpP2.sub(p.position, this.p2);

        this.tmpC1.crossVectors(this.av1, this.tmpP1);
        this.tmpC2.crossVectors(this.av2, this.tmpP2);

        c.norImp = p.normalImpulse;
        c.tanImp = p.tangentImpulse;
        c.binImp = p.binormalImpulse;

        c.nor.copy(p.normal);

        this.tmp.set(

          (this.lv2.x + this.tmpC2.x) - (this.lv1.x + this.tmpC1.x),
          (this.lv2.y + this.tmpC2.y) - (this.lv1.y + this.tmpC1.y),
          (this.lv2.z + this.tmpC2.z) - (this.lv1.z + this.tmpC1.z)

        );

        rvn = _Math.dotVectors(c.nor, this.tmp);

        c.tan.set(
          this.tmp.x - rvn * c.nor.x,
          this.tmp.y - rvn * c.nor.y,
          this.tmp.z - rvn * c.nor.z
        );

        len = _Math.dotVectors(c.tan, c.tan);

        if (len <= 0.04) {
          c.tan.tangent(c.nor);
        }

        c.tan.normalize();

        c.bin.crossVectors(c.nor, c.tan);

        c.norU1.scale(c.nor, this.m1);
        c.norU2.scale(c.nor, this.m2);

        c.tanU1.scale(c.tan, this.m1);
        c.tanU2.scale(c.tan, this.m2);

        c.binU1.scale(c.bin, this.m1);
        c.binU2.scale(c.bin, this.m2);

        c.norT1.crossVectors(this.tmpP1, c.nor);
        c.tanT1.crossVectors(this.tmpP1, c.tan);
        c.binT1.crossVectors(this.tmpP1, c.bin);

        c.norT2.crossVectors(this.tmpP2, c.nor);
        c.tanT2.crossVectors(this.tmpP2, c.tan);
        c.binT2.crossVectors(this.tmpP2, c.bin);

        i1 = this.i1;
        i2 = this.i2;

        c.norTU1.copy(c.norT1).applyMatrix3(i1, true);
        c.tanTU1.copy(c.tanT1).applyMatrix3(i1, true);
        c.binTU1.copy(c.binT1).applyMatrix3(i1, true);

        c.norTU2.copy(c.norT2).applyMatrix3(i2, true);
        c.tanTU2.copy(c.tanT2).applyMatrix3(i2, true);
        c.binTU2.copy(c.binT2).applyMatrix3(i2, true);

        /*c.norTU1.mulMat( this.i1, c.norT1 );
        c.tanTU1.mulMat( this.i1, c.tanT1 );
        c.binTU1.mulMat( this.i1, c.binT1 );

        c.norTU2.mulMat( this.i2, c.norT2 );
        c.tanTU2.mulMat( this.i2, c.tanT2 );
        c.binTU2.mulMat( this.i2, c.binT2 );*/

        this.tmpC1.crossVectors(c.norTU1, this.tmpP1);
        this.tmpC2.crossVectors(c.norTU2, this.tmpP2);
        this.tmp.add(this.tmpC1, this.tmpC2);
        c.norDen = 1 / (m1m2 + _Math.dotVectors(c.nor, this.tmp));

        this.tmpC1.crossVectors(c.tanTU1, this.tmpP1);
        this.tmpC2.crossVectors(c.tanTU2, this.tmpP2);
        this.tmp.add(this.tmpC1, this.tmpC2);
        c.tanDen = 1 / (m1m2 + _Math.dotVectors(c.tan, this.tmp));

        this.tmpC1.crossVectors(c.binTU1, this.tmpP1);
        this.tmpC2.crossVectors(c.binTU2, this.tmpP2);
        this.tmp.add(this.tmpC1, this.tmpC2);
        c.binDen = 1 / (m1m2 + _Math.dotVectors(c.bin, this.tmp));

        if (p.warmStarted) {

          norImp = p.normalImpulse;

          this.lv1.addScaledVector(c.norU1, norImp);
          this.av1.addScaledVector(c.norTU1, norImp);

          this.lv2.subScaledVector(c.norU2, norImp);
          this.av2.subScaledVector(c.norTU2, norImp);

          c.norImp = norImp;
          c.tanImp = 0;
          c.binImp = 0;
          rvn = 0; // disable bouncing

        } else {

          c.norImp = 0;
          c.tanImp = 0;
          c.binImp = 0;

        }


        if (rvn > -1) rvn = 0; // disable bouncing

        norTar = this.restitution * -rvn;
        sepV = -(p.penetration + 0.005) * invTimeStep * 0.05; // allow 0.5cm error
        if (norTar < sepV) norTar = sepV;
        c.norTar = norTar;
        c.last = i == this.num - 1;
        c = c.next;
      }
    },

    solve: function () {

      this.tmplv1.copy(this.lv1);
      this.tmplv2.copy(this.lv2);
      this.tmpav1.copy(this.av1);
      this.tmpav2.copy(this.av2);

      var oldImp1, newImp1, oldImp2, newImp2, rvn, norImp, tanImp, binImp, max, len;

      var c = this.cs;

      while (true) {

        norImp = c.norImp;
        tanImp = c.tanImp;
        binImp = c.binImp;
        max = -norImp * this.friction;

        this.tmp.sub(this.tmplv2, this.tmplv1);

        rvn = _Math.dotVectors(this.tmp, c.tan) + _Math.dotVectors(this.tmpav2, c.tanT2) - _Math.dotVectors(this.tmpav1, c.tanT1);

        oldImp1 = tanImp;
        newImp1 = rvn * c.tanDen;
        tanImp += newImp1;

        rvn = _Math.dotVectors(this.tmp, c.bin) + _Math.dotVectors(this.tmpav2, c.binT2) - _Math.dotVectors(this.tmpav1, c.binT1);

        oldImp2 = binImp;
        newImp2 = rvn * c.binDen;
        binImp += newImp2;

        // cone friction clamp
        len = tanImp * tanImp + binImp * binImp;
        if (len > max * max) {
          len = max / _Math.sqrt(len);
          tanImp *= len;
          binImp *= len;
        }

        newImp1 = tanImp - oldImp1;
        newImp2 = binImp - oldImp2;

        //

        this.tmp.set(
          c.tanU1.x * newImp1 + c.binU1.x * newImp2,
          c.tanU1.y * newImp1 + c.binU1.y * newImp2,
          c.tanU1.z * newImp1 + c.binU1.z * newImp2
        );

        this.tmplv1.addEqual(this.tmp);

        this.tmp.set(
          c.tanTU1.x * newImp1 + c.binTU1.x * newImp2,
          c.tanTU1.y * newImp1 + c.binTU1.y * newImp2,
          c.tanTU1.z * newImp1 + c.binTU1.z * newImp2
        );

        this.tmpav1.addEqual(this.tmp);

        this.tmp.set(
          c.tanU2.x * newImp1 + c.binU2.x * newImp2,
          c.tanU2.y * newImp1 + c.binU2.y * newImp2,
          c.tanU2.z * newImp1 + c.binU2.z * newImp2
        );

        this.tmplv2.subEqual(this.tmp);

        this.tmp.set(
          c.tanTU2.x * newImp1 + c.binTU2.x * newImp2,
          c.tanTU2.y * newImp1 + c.binTU2.y * newImp2,
          c.tanTU2.z * newImp1 + c.binTU2.z * newImp2
        );

        this.tmpav2.subEqual(this.tmp);

        // restitution part

        this.tmp.sub(this.tmplv2, this.tmplv1);

        rvn = _Math.dotVectors(this.tmp, c.nor) + _Math.dotVectors(this.tmpav2, c.norT2) - _Math.dotVectors(this.tmpav1, c.norT1);

        oldImp1 = norImp;
        newImp1 = (rvn - c.norTar) * c.norDen;
        norImp += newImp1;
        if (norImp > 0) norImp = 0;

        newImp1 = norImp - oldImp1;

        this.tmplv1.addScaledVector(c.norU1, newImp1);
        this.tmpav1.addScaledVector(c.norTU1, newImp1);
        this.tmplv2.subScaledVector(c.norU2, newImp1);
        this.tmpav2.subScaledVector(c.norTU2, newImp1);

        c.norImp = norImp;
        c.tanImp = tanImp;
        c.binImp = binImp;

        if (c.last) break;
        c = c.next;
      }

      this.lv1.copy(this.tmplv1);
      this.lv2.copy(this.tmplv2);
      this.av1.copy(this.tmpav1);
      this.av2.copy(this.tmpav2);

    },

    postSolve: function () {

      var c = this.cs, p;
      var i = this.num;
      while (i--) {
        //for(var i=0;i<this.num;i++){
        p = this.ps[i];
        p.normal.copy(c.nor);
        p.tangent.copy(c.tan);
        p.binormal.copy(c.bin);

        p.normalImpulse = c.norImp;
        p.tangentImpulse = c.tanImp;
        p.binormalImpulse = c.binImp;
        p.normalDenominator = c.norDen;
        p.tangentDenominator = c.tanDen;
        p.binormalDenominator = c.binDen;
        c = c.next;
      }
    }

  });

  /**
  * A contact is a pair of shapes whose axis-aligned bounding boxes are overlapping.
  * @author saharan
  */

  function Contact() {

    // The first shape.
    this.shape1 = null;
    // The second shape.
    this.shape2 = null;
    // The first rigid body.
    this.body1 = null;
    // The second rigid body.
    this.body2 = null;
    // The previous contact in the world.
    this.prev = null;
    // The next contact in the world.
    this.next = null;
    // Internal
    this.persisting = false;
    // Whether both the rigid bodies are sleeping or not.
    this.sleeping = false;
    // The collision detector between two shapes.
    this.detector = null;
    // The contact constraint of the contact.
    this.constraint = null;
    // Whether the shapes are touching or not.
    this.touching = false;
    // shapes is very close and touching 
    this.close = false;

    this.dist = _Math.INF;

    this.b1Link = new ContactLink(this);
    this.b2Link = new ContactLink(this);
    this.s1Link = new ContactLink(this);
    this.s2Link = new ContactLink(this);

    // The contact manifold of the contact.
    this.manifold = new ContactManifold();

    this.buffer = [

      new ImpulseDataBuffer(),
      new ImpulseDataBuffer(),
      new ImpulseDataBuffer(),
      new ImpulseDataBuffer()

    ];

    this.points = this.manifold.points;
    this.constraint = new ContactConstraint(this.manifold);

  }

  Object.assign(Contact.prototype, {

    Contact: true,

    mixRestitution: function (restitution1, restitution2) {

      return _Math.sqrt(restitution1 * restitution2);

    },
    mixFriction: function (friction1, friction2) {

      return _Math.sqrt(friction1 * friction2);

    },

    /**
    * Update the contact manifold.
    */
    updateManifold: function () {

      this.constraint.restitution = this.mixRestitution(this.shape1.restitution, this.shape2.restitution);
      this.constraint.friction = this.mixFriction(this.shape1.friction, this.shape2.friction);
      var numBuffers = this.manifold.numPoints;
      var i = numBuffers;
      while (i--) {
        //for(var i=0;i<numBuffers;i++){
        var b = this.buffer[i];
        var p = this.points[i];
        b.lp1X = p.localPoint1.x;
        b.lp1Y = p.localPoint1.y;
        b.lp1Z = p.localPoint1.z;
        b.lp2X = p.localPoint2.x;
        b.lp2Y = p.localPoint2.y;
        b.lp2Z = p.localPoint2.z;
        b.impulse = p.normalImpulse;
      }
      this.manifold.numPoints = 0;
      this.detector.detectCollision(this.shape1, this.shape2, this.manifold);
      var num = this.manifold.numPoints;
      if (num == 0) {
        this.touching = false;
        this.close = false;
        this.dist = _Math.INF;
        return;
      }

      if (this.touching || this.dist < 0.001) this.close = true;
      this.touching = true;
      i = num;
      while (i--) {
        //for(i=0; i<num; i++){
        p = this.points[i];
        var lp1x = p.localPoint1.x;
        var lp1y = p.localPoint1.y;
        var lp1z = p.localPoint1.z;
        var lp2x = p.localPoint2.x;
        var lp2y = p.localPoint2.y;
        var lp2z = p.localPoint2.z;
        var index = -1;
        var minDistance = 0.0004;
        var j = numBuffers;
        while (j--) {
          //for(var j=0;j<numBuffers;j++){
          b = this.buffer[j];
          var dx = b.lp1X - lp1x;
          var dy = b.lp1Y - lp1y;
          var dz = b.lp1Z - lp1z;
          var distance1 = dx * dx + dy * dy + dz * dz;
          dx = b.lp2X - lp2x;
          dy = b.lp2Y - lp2y;
          dz = b.lp2Z - lp2z;
          var distance2 = dx * dx + dy * dy + dz * dz;
          if (distance1 < distance2) {
            if (distance1 < minDistance) {
              minDistance = distance1;
              index = j;
            }
          } else {
            if (distance2 < minDistance) {
              minDistance = distance2;
              index = j;
            }
          }

          if (minDistance < this.dist) this.dist = minDistance;

        }
        if (index != -1) {
          var tmp = this.buffer[index];
          this.buffer[index] = this.buffer[--numBuffers];
          this.buffer[numBuffers] = tmp;
          p.normalImpulse = tmp.impulse;
          p.warmStarted = true;
        } else {
          p.normalImpulse = 0;
          p.warmStarted = false;
        }
      }
    },
    /**
    * Attach the contact to the shapes.
    * @param   shape1
    * @param   shape2
    */
    attach: function (shape1, shape2) {
      this.shape1 = shape1;
      this.shape2 = shape2;
      this.body1 = shape1.parent;
      this.body2 = shape2.parent;

      this.manifold.body1 = this.body1;
      this.manifold.body2 = this.body2;
      this.constraint.body1 = this.body1;
      this.constraint.body2 = this.body2;
      this.constraint.attach();

      this.s1Link.shape = shape2;
      this.s1Link.body = this.body2;
      this.s2Link.shape = shape1;
      this.s2Link.body = this.body1;

      if (shape1.contactLink != null) (this.s1Link.next = shape1.contactLink).prev = this.s1Link;
      else this.s1Link.next = null;
      shape1.contactLink = this.s1Link;
      shape1.numContacts++;

      if (shape2.contactLink != null) (this.s2Link.next = shape2.contactLink).prev = this.s2Link;
      else this.s2Link.next = null;
      shape2.contactLink = this.s2Link;
      shape2.numContacts++;

      this.b1Link.shape = shape2;
      this.b1Link.body = this.body2;
      this.b2Link.shape = shape1;
      this.b2Link.body = this.body1;

      if (this.body1.contactLink != null) (this.b1Link.next = this.body1.contactLink).prev = this.b1Link;
      else this.b1Link.next = null;
      this.body1.contactLink = this.b1Link;
      this.body1.numContacts++;

      if (this.body2.contactLink != null) (this.b2Link.next = this.body2.contactLink).prev = this.b2Link;
      else this.b2Link.next = null;
      this.body2.contactLink = this.b2Link;
      this.body2.numContacts++;

      this.prev = null;
      this.next = null;

      this.persisting = true;
      this.sleeping = this.body1.sleeping && this.body2.sleeping;
      this.manifold.numPoints = 0;
    },
    /**
    * Detach the contact from the shapes.
    */
    detach: function () {
      var prev = this.s1Link.prev;
      var next = this.s1Link.next;
      if (prev !== null) prev.next = next;
      if (next !== null) next.prev = prev;
      if (this.shape1.contactLink == this.s1Link) this.shape1.contactLink = next;
      this.s1Link.prev = null;
      this.s1Link.next = null;
      this.s1Link.shape = null;
      this.s1Link.body = null;
      this.shape1.numContacts--;

      prev = this.s2Link.prev;
      next = this.s2Link.next;
      if (prev !== null) prev.next = next;
      if (next !== null) next.prev = prev;
      if (this.shape2.contactLink == this.s2Link) this.shape2.contactLink = next;
      this.s2Link.prev = null;
      this.s2Link.next = null;
      this.s2Link.shape = null;
      this.s2Link.body = null;
      this.shape2.numContacts--;

      prev = this.b1Link.prev;
      next = this.b1Link.next;
      if (prev !== null) prev.next = next;
      if (next !== null) next.prev = prev;
      if (this.body1.contactLink == this.b1Link) this.body1.contactLink = next;
      this.b1Link.prev = null;
      this.b1Link.next = null;
      this.b1Link.shape = null;
      this.b1Link.body = null;
      this.body1.numContacts--;

      prev = this.b2Link.prev;
      next = this.b2Link.next;
      if (prev !== null) prev.next = next;
      if (next !== null) next.prev = prev;
      if (this.body2.contactLink == this.b2Link) this.body2.contactLink = next;
      this.b2Link.prev = null;
      this.b2Link.next = null;
      this.b2Link.shape = null;
      this.b2Link.body = null;
      this.body2.numContacts--;

      this.manifold.body1 = null;
      this.manifold.body2 = null;
      this.constraint.body1 = null;
      this.constraint.body2 = null;
      this.constraint.detach();

      this.shape1 = null;
      this.shape2 = null;
      this.body1 = null;
      this.body2 = null;
    }

  });

  /**
  * The class of rigid body.
  * Rigid body has the shape of a single or multiple collision processing,
  * I can set the parameters individually.
  * @author saharan
  * @author lo-th
  */

  function RigidBody(Position, Rotation) {

    this.position = Position || new Vec3();
    this.orientation = Rotation || new Quat();

    this.scale = 1;
    this.invScale = 1;

    // possible link to three Mesh;
    this.mesh = null;

    this.id = NaN;
    this.name = "";
    // The maximum number of shapes that can be added to a one rigid.
    //this.MAX_SHAPES = 64;//64;

    this.prev = null;
    this.next = null;

    // I represent the kind of rigid body.
    // Please do not change from the outside this variable.
    // If you want to change the type of rigid body, always
    // Please specify the type you want to set the arguments of setupMass method.
    this.type = BODY_NULL;

    this.massInfo = new MassInfo();

    this.newPosition = new Vec3();
    this.controlPos = false;
    this.newOrientation = new Quat();
    this.newRotation = new Vec3();
    this.currentRotation = new Vec3();
    this.controlRot = false;
    this.controlRotInTime = false;

    this.quaternion = new Quat();
    this.pos = new Vec3();



    // Is the translational velocity.
    this.linearVelocity = new Vec3();
    // Is the angular velocity.
    this.angularVelocity = new Vec3();

    //--------------------------------------------
    //  Please do not change from the outside this variables.
    //--------------------------------------------

    // It is a world that rigid body has been added.
    this.parent = null;
    this.contactLink = null;
    this.numContacts = 0;

    // An array of shapes that are included in the rigid body.
    this.shapes = null;
    // The number of shapes that are included in the rigid body.
    this.numShapes = 0;

    // It is the link array of joint that is connected to the rigid body.
    this.jointLink = null;
    // The number of joints that are connected to the rigid body.
    this.numJoints = 0;

    // It is the world coordinate of the center of gravity in the sleep just before.
    this.sleepPosition = new Vec3();
    // It is a quaternion that represents the attitude of sleep just before.
    this.sleepOrientation = new Quat();
    // I will show this rigid body to determine whether it is a rigid body static.
    this.isStatic = false;
    // I indicates that this rigid body to determine whether it is a rigid body dynamic.
    this.isDynamic = false;

    this.isKinematic = false;

    // It is a rotation matrix representing the orientation.
    this.rotation = new Mat33();

    //--------------------------------------------
    // It will be recalculated automatically from the shape, which is included.
    //--------------------------------------------

    // This is the weight.
    this.mass = 0;
    // It is the reciprocal of the mass.
    this.inverseMass = 0;
    // It is the inverse of the inertia tensor in the world system.
    this.inverseInertia = new Mat33();
    // It is the inertia tensor in the initial state.
    this.localInertia = new Mat33();
    // It is the inverse of the inertia tensor in the initial state.
    this.inverseLocalInertia = new Mat33();

    this.tmpInertia = new Mat33();


    // I indicates rigid body whether it has been added to the simulation Island.
    this.addedToIsland = false;
    // It shows how to sleep rigid body.
    this.allowSleep = true;
    // This is the time from when the rigid body at rest.
    this.sleepTime = 0;
    // I shows rigid body to determine whether it is a sleep state.
    this.sleeping = false;

  }

  Object.assign(RigidBody.prototype, {

    setParent: function (world) {

      this.parent = world;
      this.scale = this.parent.scale;
      this.invScale = this.parent.invScale;
      this.id = this.parent.numRigidBodies;
      if (!this.name) this.name = this.id;

      this.updateMesh();

    },

    /**
     * I'll add a shape to rigid body.
     * If you add a shape, please call the setupMass method to step up to the start of the next.
     * @param   shape shape to Add
     */
    addShape: function (shape) {

      if (shape.parent) {
        printError("RigidBody", "It is not possible that you add a shape which already has an associated body.");
      }

      if (this.shapes != null) (this.shapes.prev = shape).next = this.shapes;
      this.shapes = shape;
      shape.parent = this;
      if (this.parent) this.parent.addShape(shape);
      this.numShapes++;

    },
    /**
     * I will delete the shape from the rigid body.
     * If you delete a shape, please call the setupMass method to step up to the start of the next.
     * @param shape {Shape} to delete
     * @return void
     */
    removeShape: function (shape) {

      var remove = shape;
      if (remove.parent != this) return;
      var prev = remove.prev;
      var next = remove.next;
      if (prev != null) prev.next = next;
      if (next != null) next.prev = prev;
      if (this.shapes == remove) this.shapes = next;
      remove.prev = null;
      remove.next = null;
      remove.parent = null;
      if (this.parent) this.parent.removeShape(remove);
      this.numShapes--;

    },

    remove: function () {

      this.dispose();

    },

    dispose: function () {

      this.parent.removeRigidBody(this);

    },

    checkContact: function (name) {

      this.parent.checkContact(this.name, name);

    },

    /**
     * Calulates mass datas(center of gravity, mass, moment inertia, etc...).
     * If the parameter type is set to BODY_STATIC, the rigid body will be fixed to the space.
     * If the parameter adjustPosition is set to true, the shapes' relative positions and
     * the rigid body's position will be adjusted to the center of gravity.
     * @param type
     * @param adjustPosition
     * @return void
     */
    setupMass: function (type, AdjustPosition) {

      var adjustPosition = (AdjustPosition !== undefined) ? AdjustPosition : true;

      this.type = type || BODY_STATIC;
      this.isDynamic = this.type === BODY_DYNAMIC;
      this.isStatic = this.type === BODY_STATIC;

      this.mass = 0;
      this.localInertia.set(0, 0, 0, 0, 0, 0, 0, 0, 0);


      var tmpM = new Mat33();
      var tmpV = new Vec3();

      for (var shape = this.shapes; shape !== null; shape = shape.next) {

        shape.calculateMassInfo(this.massInfo);
        var shapeMass = this.massInfo.mass;
        tmpV.addScaledVector(shape.relativePosition, shapeMass);
        this.mass += shapeMass;
        this.rotateInertia(shape.relativeRotation, this.massInfo.inertia, tmpM);
        this.localInertia.add(tmpM);

        // add offset inertia
        this.localInertia.addOffset(shapeMass, shape.relativePosition);

      }

      this.inverseMass = 1 / this.mass;
      tmpV.scaleEqual(this.inverseMass);

      if (adjustPosition) {
        this.position.add(tmpV);
        for (shape = this.shapes; shape !== null; shape = shape.next) {
          shape.relativePosition.subEqual(tmpV);
        }

        // subtract offset inertia
        this.localInertia.subOffset(this.mass, tmpV);

      }

      this.inverseLocalInertia.invert(this.localInertia);

      //}

      if (this.type === BODY_STATIC) {
        this.inverseMass = 0;
        this.inverseLocalInertia.set(0, 0, 0, 0, 0, 0, 0, 0, 0);
      }

      this.syncShapes();
      this.awake();

    },
    /**
     * Awake the rigid body.
     */
    awake: function () {

      if (!this.allowSleep || !this.sleeping) return;
      this.sleeping = false;
      this.sleepTime = 0;
      // awake connected constraints
      var cs = this.contactLink;
      while (cs != null) {
        cs.body.sleepTime = 0;
        cs.body.sleeping = false;
        cs = cs.next;
      }
      var js = this.jointLink;
      while (js != null) {
        js.body.sleepTime = 0;
        js.body.sleeping = false;
        js = js.next;
      }
      for (var shape = this.shapes; shape != null; shape = shape.next) {
        shape.updateProxy();
      }

    },
    /**
     * Sleep the rigid body.
     */
    sleep: function () {

      if (!this.allowSleep || this.sleeping) return;

      this.linearVelocity.set(0, 0, 0);
      this.angularVelocity.set(0, 0, 0);
      this.sleepPosition.copy(this.position);
      this.sleepOrientation.copy(this.orientation);

      this.sleepTime = 0;
      this.sleeping = true;
      for (var shape = this.shapes; shape != null; shape = shape.next) {
        shape.updateProxy();
      }
    },

    testWakeUp: function () {

      if (this.linearVelocity.testZero() || this.angularVelocity.testZero() || this.position.testDiff(this.sleepPosition) || this.orientation.testDiff(this.sleepOrientation)) this.awake(); // awake the body

    },

    /**
     * Get whether the rigid body has not any connection with others.
     * @return {void}
     */
    isLonely: function () {
      return this.numJoints == 0 && this.numContacts == 0;
    },

    /**
     * The time integration of the motion of a rigid body, you can update the information such as the shape.
     * This method is invoked automatically when calling the step of the World,
     * There is no need to call from outside usually.
     * @param  timeStep time
     * @return {void}
     */

    updatePosition: function (timeStep) {
      switch (this.type) {
        case BODY_STATIC:
          this.linearVelocity.set(0, 0, 0);
          this.angularVelocity.set(0, 0, 0);

          // ONLY FOR TEST
          if (this.controlPos) {
            this.position.copy(this.newPosition);
            this.controlPos = false;
          }
          if (this.controlRot) {
            this.orientation.copy(this.newOrientation);
            this.controlRot = false;
          }
          /*this.linearVelocity.x=0;
          this.linearVelocity.y=0;
          this.linearVelocity.z=0;
          this.angularVelocity.x=0;
          this.angularVelocity.y=0;
          this.angularVelocity.z=0;*/
          break;
        case BODY_DYNAMIC:

          if (this.isKinematic) {

            this.linearVelocity.set(0, 0, 0);
            this.angularVelocity.set(0, 0, 0);

          }

          if (this.controlPos) {

            this.linearVelocity.subVectors(this.newPosition, this.position).multiplyScalar(1 / timeStep);
            this.controlPos = false;

          }
          if (this.controlRot) {

            this.angularVelocity.copy(this.getAxis());
            this.orientation.copy(this.newOrientation);
            this.controlRot = false;

          }

          this.position.addScaledVector(this.linearVelocity, timeStep);
          this.orientation.addTime(this.angularVelocity, timeStep);

          this.updateMesh();

          break;
        default: printError("RigidBody", "Invalid type.");
      }

      this.syncShapes();
      this.updateMesh();

    },

    getAxis: function () {

      return new Vec3(0, 1, 0).applyMatrix3(this.inverseLocalInertia, true).normalize();

    },

    rotateInertia: function (rot, inertia, out) {

      this.tmpInertia.multiplyMatrices(rot, inertia);
      out.multiplyMatrices(this.tmpInertia, rot, true);

    },

    syncShapes: function () {

      this.rotation.setQuat(this.orientation);
      this.rotateInertia(this.rotation, this.inverseLocalInertia, this.inverseInertia);

      for (var shape = this.shapes; shape != null; shape = shape.next) {

        shape.position.copy(shape.relativePosition).applyMatrix3(this.rotation, true).add(this.position);
        // add by QuaziKb
        shape.rotation.multiplyMatrices(this.rotation, shape.relativeRotation);
        shape.updateProxy();
      }
    },


    //---------------------------------------------
    // APPLY IMPULSE FORCE
    //---------------------------------------------

    applyImpulse: function (position, force) {
      this.linearVelocity.addScaledVector(force, this.inverseMass);
      var rel = new Vec3().copy(position).sub(this.position).cross(force).applyMatrix3(this.inverseInertia, true);
      this.angularVelocity.add(rel);
    },


    //---------------------------------------------
    // SET DYNAMIQUE POSITION AND ROTATION
    //---------------------------------------------

    setPosition: function (pos) {
      this.newPosition.copy(pos).multiplyScalar(this.invScale);
      this.controlPos = true;
      if (!this.isKinematic) this.isKinematic = true;
    },

    setQuaternion: function (q) {
      this.newOrientation.set(q.x, q.y, q.z, q.w);
      this.controlRot = true;
      if (!this.isKinematic) this.isKinematic = true;
    },

    setRotation: function (rot) {

      this.newOrientation = new Quat().setFromEuler(rot.x * _Math.degtorad, rot.y * _Math.degtorad, rot.z * _Math.degtorad);//this.rotationVectToQuad( rot );
      this.controlRot = true;

    },

    //---------------------------------------------
    // RESET DYNAMIQUE POSITION AND ROTATION
    //---------------------------------------------

    resetPosition: function (x, y, z) {

      this.linearVelocity.set(0, 0, 0);
      this.angularVelocity.set(0, 0, 0);
      this.position.set(x, y, z).multiplyScalar(this.invScale);
      //this.position.set( x*OIMO.WorldScale.invScale, y*OIMO.WorldScale.invScale, z*OIMO.WorldScale.invScale );
      this.awake();
    },

    resetQuaternion: function (q) {

      this.angularVelocity.set(0, 0, 0);
      this.orientation = new Quat(q.x, q.y, q.z, q.w);
      this.awake();

    },

    resetRotation: function (x, y, z) {

      this.angularVelocity.set(0, 0, 0);
      this.orientation = new Quat().setFromEuler(x * _Math.degtorad, y * _Math.degtorad, z * _Math.degtorad);//this.rotationVectToQuad( new Vec3(x,y,z) );
      this.awake();

    },

    //---------------------------------------------
    // GET POSITION AND ROTATION
    //---------------------------------------------

    getPosition: function () {

      return this.pos;

    },

    getQuaternion: function () {

      return this.quaternion;

    },

    //---------------------------------------------
    // AUTO UPDATE THREE MESH
    //---------------------------------------------

    connectMesh: function (mesh) {

      this.mesh = mesh;
      this.updateMesh();

    },

    updateMesh: function () {

      this.pos.scale(this.position, this.scale);
      this.quaternion.copy(this.orientation);

      if (this.mesh === null) return;

      this.mesh.position.copy(this.getPosition());
      this.mesh.quaternion.copy(this.getQuaternion());

    },

  });

  /**
  * A pair of shapes that may collide.
  * @author saharan
  */
  function Pair(s1, s2) {

    // The first shape.
    this.shape1 = s1 || null;
    // The second shape.
    this.shape2 = s2 || null;

  }

  /**
  * The broad-phase is used for collecting all possible pairs for collision.
  */

  function BroadPhase() {

    this.types = BR_NULL;
    this.numPairChecks = 0;
    this.numPairs = 0;
    this.pairs = [];

  }
  Object.assign(BroadPhase.prototype, {

    BroadPhase: true,

    // Create a new proxy.
    createProxy: function (shape) {

      printError("BroadPhase", "Inheritance error.");

    },

    // Add the proxy into the broad-phase.
    addProxy: function (proxy) {

      printError("BroadPhase", "Inheritance error.");
    },

    // Remove the proxy from the broad-phase.
    removeProxy: function (proxy) {

      printError("BroadPhase", "Inheritance error.");

    },

    // Returns whether the pair is available or not.
    isAvailablePair: function (s1, s2) {

      var b1 = s1.parent;
      var b2 = s2.parent;
      if (b1 == b2 || // same parents
        (!b1.isDynamic && !b2.isDynamic) || // static or kinematic object
        (s1.belongsTo & s2.collidesWith) == 0 ||
        (s2.belongsTo & s1.collidesWith) == 0 // collision filtering
      ) { return false; }
      var js;
      if (b1.numJoints < b2.numJoints) js = b1.jointLink;
      else js = b2.jointLink;
      while (js !== null) {
        var joint = js.joint;
        if (!joint.allowCollision && ((joint.body1 == b1 && joint.body2 == b2) || (joint.body1 == b2 && joint.body2 == b1))) { return false; }
        js = js.next;
      }

      return true;

    },

    // Detect overlapping pairs.
    detectPairs: function () {

      // clear old
      this.pairs = [];
      this.numPairs = 0;
      this.numPairChecks = 0;
      this.collectPairs();

    },

    collectPairs: function () {

    },

    addPair: function (s1, s2) {

      var pair = new Pair(s1, s2);
      this.pairs.push(pair);
      this.numPairs++;

    }

  });

  var count$1 = 0;
  function ProxyIdCount() { return count$1++; }

  /**
   * A proxy is used for broad-phase collecting pairs that can be colliding.
   *
   * @author lo-th
   */

  function Proxy(shape) {

    //The parent shape.
    this.shape = shape;

    //The axis-aligned bounding box.
    this.aabb = shape.aabb;

  }
  Object.assign(Proxy.prototype, {

    Proxy: true,

    // Update the proxy. Must be inherited by a child.

    update: function () {

      printError("Proxy", "Inheritance error.");

    }

  });

  /**
  * A basic implementation of proxies.
  *
  * @author saharan
  */

  function BasicProxy(shape) {

    Proxy.call(this, shape);

    this.id = ProxyIdCount();

  }
  BasicProxy.prototype = Object.assign(Object.create(Proxy.prototype), {

    constructor: BasicProxy,

    update: function () {

    }

  });

  /**
  * A broad-phase algorithm with brute-force search.
  * This always checks for all possible pairs.
  */

  function BruteForceBroadPhase() {

    BroadPhase.call(this);
    this.types = BR_BRUTE_FORCE;
    //this.numProxies=0;
    ///this.maxProxies = 256;
    this.proxies = [];
    //this.proxies.length = 256;

  }

  BruteForceBroadPhase.prototype = Object.assign(Object.create(BroadPhase.prototype), {

    constructor: BruteForceBroadPhase,

    createProxy: function (shape) {

      return new BasicProxy(shape);

    },

    addProxy: function (proxy) {

      /*if(this.numProxies==this.maxProxies){
          //this.maxProxies<<=1;
          this.maxProxies*=2;
          var newProxies=[];
          newProxies.length = this.maxProxies;
          var i = this.numProxies;
          while(i--){
          //for(var i=0, l=this.numProxies;i<l;i++){
              newProxies[i]=this.proxies[i];
          }
          this.proxies=newProxies;
      }*/
      //this.proxies[this.numProxies++] = proxy;
      this.proxies.push(proxy);
      //this.numProxies++;

    },

    removeProxy: function (proxy) {

      var n = this.proxies.indexOf(proxy);
      if (n > -1) {
        this.proxies.splice(n, 1);
        //this.numProxies--;
      }

      /*var i = this.numProxies;
      while(i--){
      //for(var i=0, l=this.numProxies;i<l;i++){
          if(this.proxies[i] == proxy){
              this.proxies[i] = this.proxies[--this.numProxies];
              this.proxies[this.numProxies] = null;
              return;
          }
      }*/

    },

    collectPairs: function () {

      var i = 0, j, p1, p2;

      var px = this.proxies;
      var l = px.length;//this.numProxies;
      //var ar1 = [];
      //var ar2 = [];

      //for( i = px.length ; i-- ; ar1[ i ] = px[ i ] ){};
      //for( i = px.length ; i-- ; ar2[ i ] = px[ i ] ){};

      //var ar1 = JSON.parse(JSON.stringify(this.proxies))
      //var ar2 = JSON.parse(JSON.stringify(this.proxies))

      this.numPairChecks = l * (l - 1) >> 1;
      //this.numPairChecks=this.numProxies*(this.numProxies-1)*0.5;

      while (i < l) {
        p1 = px[i++];
        j = i + 1;
        while (j < l) {
          p2 = px[j++];
          if (p1.aabb.intersectTest(p2.aabb) || !this.isAvailablePair(p1.shape, p2.shape)) continue;
          this.addPair(p1.shape, p2.shape);
        }
      }

    }

  });

  /**
   * A projection axis for sweep and prune broad-phase.
   * @author saharan
   */

  function SAPAxis() {

    this.numElements = 0;
    this.bufferSize = 256;
    this.elements = [];
    this.elements.length = this.bufferSize;
    this.stack = new Float32Array(64);

  }

  Object.assign(SAPAxis.prototype, {

    SAPAxis: true,

    addElements: function (min, max) {

      if (this.numElements + 2 >= this.bufferSize) {
        //this.bufferSize<<=1;
        this.bufferSize *= 2;
        var newElements = [];
        var i = this.numElements;
        while (i--) {
          //for(var i=0, l=this.numElements; i<l; i++){
          newElements[i] = this.elements[i];
        }
      }
      this.elements[this.numElements++] = min;
      this.elements[this.numElements++] = max;

    },

    removeElements: function (min, max) {

      var minIndex = -1;
      var maxIndex = -1;
      for (var i = 0, l = this.numElements; i < l; i++) {
        var e = this.elements[i];
        if (e == min || e == max) {
          if (minIndex == -1) {
            minIndex = i;
          } else {
            maxIndex = i;
            break;
          }
        }
      }
      for (i = minIndex + 1, l = maxIndex; i < l; i++) {
        this.elements[i - 1] = this.elements[i];
      }
      for (i = maxIndex + 1, l = this.numElements; i < l; i++) {
        this.elements[i - 2] = this.elements[i];
      }

      this.elements[--this.numElements] = null;
      this.elements[--this.numElements] = null;

    },

    sort: function () {

      var count = 0;
      var threshold = 1;
      while ((this.numElements >> threshold) != 0) threshold++;
      threshold = threshold * this.numElements >> 2;
      count = 0;

      var giveup = false;
      var elements = this.elements;
      for (var i = 1, l = this.numElements; i < l; i++) { // try insertion sort
        var tmp = elements[i];
        var pivot = tmp.value;
        var tmp2 = elements[i - 1];
        if (tmp2.value > pivot) {
          var j = i;
          do {
            elements[j] = tmp2;
            if (--j == 0) break;
            tmp2 = elements[j - 1];
          } while (tmp2.value > pivot);
          elements[j] = tmp;
          count += i - j;
          if (count > threshold) {
            giveup = true; // stop and use quick sort
            break;
          }
        }
      }
      if (!giveup) return;
      count = 2; var stack = this.stack;
      stack[0] = 0;
      stack[1] = this.numElements - 1;
      while (count > 0) {
        var right = stack[--count];
        var left = stack[--count];
        var diff = right - left;
        if (diff > 16) {  // quick sort
          //var mid=left+(diff>>1);
          var mid = left + (_Math.floor(diff * 0.5));
          tmp = elements[mid];
          elements[mid] = elements[right];
          elements[right] = tmp;
          pivot = tmp.value;
          i = left - 1;
          j = right;
          while (true) {
            var ei;
            var ej;
            do { ei = elements[++i]; } while (ei.value < pivot);
            do { ej = elements[--j]; } while (pivot < ej.value && j != left);
            if (i >= j) break;
            elements[i] = ej;
            elements[j] = ei;
          }

          elements[right] = elements[i];
          elements[i] = tmp;
          if (i - left > right - i) {
            stack[count++] = left;
            stack[count++] = i - 1;
            stack[count++] = i + 1;
            stack[count++] = right;
          } else {
            stack[count++] = i + 1;
            stack[count++] = right;
            stack[count++] = left;
            stack[count++] = i - 1;
          }
        } else {
          for (i = left + 1; i <= right; i++) {
            tmp = elements[i];
            pivot = tmp.value;
            tmp2 = elements[i - 1];
            if (tmp2.value > pivot) {
              j = i;
              do {
                elements[j] = tmp2;
                if (--j == 0) break;
                tmp2 = elements[j - 1];
              } while (tmp2.value > pivot);
              elements[j] = tmp;
            }
          }
        }
      }

    },

    calculateTestCount: function () {

      var num = 1;
      var sum = 0;
      for (var i = 1, l = this.numElements; i < l; i++) {
        if (this.elements[i].max) {
          num--;
        } else {
          sum += num;
          num++;
        }
      }
      return sum;

    }

  });

  /**
   * An element of proxies.
   * @author saharan
   */

  function SAPElement(proxy, max) {

    // The parent proxy
    this.proxy = proxy;
    // The pair element.
    this.pair = null;
    // The minimum element on other axis.
    this.min1 = null;
    // The maximum element on other axis.
    this.max1 = null;
    // The minimum element on other axis.
    this.min2 = null;
    // The maximum element on other axis.
    this.max2 = null;
    // Whether the element has maximum value or not.
    this.max = max;
    // The value of the element.
    this.value = 0;

  }

  /**
   * A proxy for sweep and prune broad-phase.
   * @author saharan
   * @author lo-th
   */

  function SAPProxy(sap, shape) {

    Proxy.call(this, shape);
    // Type of the axis to which the proxy belongs to. [0:none, 1:dynamic, 2:static]
    this.belongsTo = 0;
    // The maximum elements on each axis.
    this.max = [];
    // The minimum elements on each axis.
    this.min = [];

    this.sap = sap;
    this.min[0] = new SAPElement(this, false);
    this.max[0] = new SAPElement(this, true);
    this.min[1] = new SAPElement(this, false);
    this.max[1] = new SAPElement(this, true);
    this.min[2] = new SAPElement(this, false);
    this.max[2] = new SAPElement(this, true);
    this.max[0].pair = this.min[0];
    this.max[1].pair = this.min[1];
    this.max[2].pair = this.min[2];
    this.min[0].min1 = this.min[1];
    this.min[0].max1 = this.max[1];
    this.min[0].min2 = this.min[2];
    this.min[0].max2 = this.max[2];
    this.min[1].min1 = this.min[0];
    this.min[1].max1 = this.max[0];
    this.min[1].min2 = this.min[2];
    this.min[1].max2 = this.max[2];
    this.min[2].min1 = this.min[0];
    this.min[2].max1 = this.max[0];
    this.min[2].min2 = this.min[1];
    this.min[2].max2 = this.max[1];

  }
  SAPProxy.prototype = Object.assign(Object.create(Proxy.prototype), {

    constructor: SAPProxy,


    // Returns whether the proxy is dynamic or not.
    isDynamic: function () {

      var body = this.shape.parent;
      return body.isDynamic && !body.sleeping;

    },

    update: function () {

      var te = this.aabb.elements;
      this.min[0].value = te[0];
      this.min[1].value = te[1];
      this.min[2].value = te[2];
      this.max[0].value = te[3];
      this.max[1].value = te[4];
      this.max[2].value = te[5];

      if (this.belongsTo == 1 && !this.isDynamic() || this.belongsTo == 2 && this.isDynamic()) {
        this.sap.removeProxy(this);
        this.sap.addProxy(this);
      }

    }

  });

  /**
   * A broad-phase collision detection algorithm using sweep and prune.
   * @author saharan
   * @author lo-th
   */

  function SAPBroadPhase() {

    BroadPhase.call(this);
    this.types = BR_SWEEP_AND_PRUNE;

    this.numElementsD = 0;
    this.numElementsS = 0;
    // dynamic proxies
    this.axesD = [
      new SAPAxis(),
      new SAPAxis(),
      new SAPAxis()
    ];
    // static or sleeping proxies
    this.axesS = [
      new SAPAxis(),
      new SAPAxis(),
      new SAPAxis()
    ];

    this.index1 = 0;
    this.index2 = 1;

  }
  SAPBroadPhase.prototype = Object.assign(Object.create(BroadPhase.prototype), {

    constructor: SAPBroadPhase,

    createProxy: function (shape) {

      return new SAPProxy(this, shape);

    },

    addProxy: function (proxy) {

      var p = proxy;
      if (p.isDynamic()) {
        this.axesD[0].addElements(p.min[0], p.max[0]);
        this.axesD[1].addElements(p.min[1], p.max[1]);
        this.axesD[2].addElements(p.min[2], p.max[2]);
        p.belongsTo = 1;
        this.numElementsD += 2;
      } else {
        this.axesS[0].addElements(p.min[0], p.max[0]);
        this.axesS[1].addElements(p.min[1], p.max[1]);
        this.axesS[2].addElements(p.min[2], p.max[2]);
        p.belongsTo = 2;
        this.numElementsS += 2;
      }

    },

    removeProxy: function (proxy) {

      var p = proxy;
      if (p.belongsTo == 0) return;

      /*else if ( p.belongsTo == 1 ) {
          this.axesD[0].removeElements( p.min[0], p.max[0] );
          this.axesD[1].removeElements( p.min[1], p.max[1] );
          this.axesD[2].removeElements( p.min[2], p.max[2] );
          this.numElementsD -= 2;
      } else if ( p.belongsTo == 2 ) {
          this.axesS[0].removeElements( p.min[0], p.max[0] );
          this.axesS[1].removeElements( p.min[1], p.max[1] );
          this.axesS[2].removeElements( p.min[2], p.max[2] );
          this.numElementsS -= 2;
      }*/

      switch (p.belongsTo) {
        case 1:
          this.axesD[0].removeElements(p.min[0], p.max[0]);
          this.axesD[1].removeElements(p.min[1], p.max[1]);
          this.axesD[2].removeElements(p.min[2], p.max[2]);
          this.numElementsD -= 2;
          break;
        case 2:
          this.axesS[0].removeElements(p.min[0], p.max[0]);
          this.axesS[1].removeElements(p.min[1], p.max[1]);
          this.axesS[2].removeElements(p.min[2], p.max[2]);
          this.numElementsS -= 2;
          break;
      }

      p.belongsTo = 0;

    },

    collectPairs: function () {

      if (this.numElementsD == 0) return;

      var axis1 = this.axesD[this.index1];
      var axis2 = this.axesD[this.index2];

      axis1.sort();
      axis2.sort();

      var count1 = axis1.calculateTestCount();
      var count2 = axis2.calculateTestCount();
      var elementsD;
      var elementsS;
      if (count1 <= count2) {// select the best axis
        axis2 = this.axesS[this.index1];
        axis2.sort();
        elementsD = axis1.elements;
        elementsS = axis2.elements;
      } else {
        axis1 = this.axesS[this.index2];
        axis1.sort();
        elementsD = axis2.elements;
        elementsS = axis1.elements;
        this.index1 ^= this.index2;
        this.index2 ^= this.index1;
        this.index1 ^= this.index2;
      }
      var activeD;
      var activeS;
      var p = 0;
      var q = 0;
      while (p < this.numElementsD) {
        var e1;
        var dyn;
        if (q == this.numElementsS) {
          e1 = elementsD[p];
          dyn = true;
          p++;
        } else {
          var d = elementsD[p];
          var s = elementsS[q];
          if (d.value < s.value) {
            e1 = d;
            dyn = true;
            p++;
          } else {
            e1 = s;
            dyn = false;
            q++;
          }
        }
        if (!e1.max) {
          var s1 = e1.proxy.shape;
          var min1 = e1.min1.value;
          var max1 = e1.max1.value;
          var min2 = e1.min2.value;
          var max2 = e1.max2.value;

          for (var e2 = activeD; e2 != null; e2 = e2.pair) {// test for dynamic
            var s2 = e2.proxy.shape;

            this.numPairChecks++;
            if (min1 > e2.max1.value || max1 < e2.min1.value || min2 > e2.max2.value || max2 < e2.min2.value || !this.isAvailablePair(s1, s2)) continue;
            this.addPair(s1, s2);
          }
          if (dyn) {
            for (e2 = activeS; e2 != null; e2 = e2.pair) {// test for static
              s2 = e2.proxy.shape;

              this.numPairChecks++;

              if (min1 > e2.max1.value || max1 < e2.min1.value || min2 > e2.max2.value || max2 < e2.min2.value || !this.isAvailablePair(s1, s2)) continue;
              this.addPair(s1, s2);
            }
            e1.pair = activeD;
            activeD = e1;
          } else {
            e1.pair = activeS;
            activeS = e1;
          }
        } else {
          var min = e1.pair;
          if (dyn) {
            if (min == activeD) {
              activeD = activeD.pair;
              continue;
            } else {
              e1 = activeD;
            }
          } else {
            if (min == activeS) {
              activeS = activeS.pair;
              continue;
            } else {
              e1 = activeS;
            }
          }
          while (e1) {
            e2 = e1.pair;
            if (e2 == min) {
              e1.pair = e2.pair;
              break;
            }
            e1 = e2;
          }
        }
      }
      this.index2 = (this.index1 | this.index2) ^ 3;

    }

  });

  /**
  * A node of the dynamic bounding volume tree.
  * @author saharan
  */

  function DBVTNode() {

    // The first child node of this node.
    this.child1 = null;
    // The second child node of this node.
    this.child2 = null;
    //  The parent node of this tree.
    this.parent = null;
    // The proxy of this node. This has no value if this node is not leaf.
    this.proxy = null;
    // The maximum distance from leaf nodes.
    this.height = 0;
    // The AABB of this node.
    this.aabb = new AABB();

  }

  /**
   * A dynamic bounding volume tree for the broad-phase algorithm.
   *
   * @author saharan
   * @author lo-th
   */

  function DBVT() {

    // The root of the tree.
    this.root = null;
    this.freeNodes = [];
    this.freeNodes.length = 16384;
    this.numFreeNodes = 0;
    this.aabb = new AABB();

  }
  Object.assign(DBVT.prototype, {

    DBVT: true,

    moveLeaf: function (leaf) {

      this.deleteLeaf(leaf);
      this.insertLeaf(leaf);

    },

    insertLeaf: function (leaf) {

      if (this.root == null) {
        this.root = leaf;
        return;
      }
      var lb = leaf.aabb;
      var sibling = this.root;
      var oldArea;
      var newArea;
      while (sibling.proxy == null) { // descend the node to search the best pair
        var c1 = sibling.child1;
        var c2 = sibling.child2;
        var b = sibling.aabb;
        var c1b = c1.aabb;
        var c2b = c2.aabb;
        oldArea = b.surfaceArea();
        this.aabb.combine(lb, b);
        newArea = this.aabb.surfaceArea();
        var creatingCost = newArea * 2;
        var incrementalCost = (newArea - oldArea) * 2; // cost of creating a new pair with the node
        var discendingCost1 = incrementalCost;
        this.aabb.combine(lb, c1b);
        if (c1.proxy != null) {
          // leaf cost = area(combined aabb)
          discendingCost1 += this.aabb.surfaceArea();
        } else {
          // node cost = area(combined aabb) - area(old aabb)
          discendingCost1 += this.aabb.surfaceArea() - c1b.surfaceArea();
        }
        var discendingCost2 = incrementalCost;
        this.aabb.combine(lb, c2b);
        if (c2.proxy != null) {
          // leaf cost = area(combined aabb)
          discendingCost2 += this.aabb.surfaceArea();
        } else {
          // node cost = area(combined aabb) - area(old aabb)
          discendingCost2 += this.aabb.surfaceArea() - c2b.surfaceArea();
        }
        if (discendingCost1 < discendingCost2) {
          if (creatingCost < discendingCost1) {
            break;// stop descending
          } else {
            sibling = c1;// descend into first child
          }
        } else {
          if (creatingCost < discendingCost2) {
            break;// stop descending
          } else {
            sibling = c2;// descend into second child
          }
        }
      }
      var oldParent = sibling.parent;
      var newParent;
      if (this.numFreeNodes > 0) {
        newParent = this.freeNodes[--this.numFreeNodes];
      } else {
        newParent = new DBVTNode();
      }

      newParent.parent = oldParent;
      newParent.child1 = leaf;
      newParent.child2 = sibling;
      newParent.aabb.combine(leaf.aabb, sibling.aabb);
      newParent.height = sibling.height + 1;
      sibling.parent = newParent;
      leaf.parent = newParent;
      if (sibling == this.root) {
        // replace root
        this.root = newParent;
      } else {
        // replace child
        if (oldParent.child1 == sibling) {
          oldParent.child1 = newParent;
        } else {
          oldParent.child2 = newParent;
        }
      }
      // update whole tree
      do {
        newParent = this.balance(newParent);
        this.fix(newParent);
        newParent = newParent.parent;
      } while (newParent != null);
    },

    getBalance: function (node) {

      if (node.proxy != null) return 0;
      return node.child1.height - node.child2.height;

    },

    deleteLeaf: function (leaf) {

      if (leaf == this.root) {
        this.root = null;
        return;
      }
      var parent = leaf.parent;
      var sibling;
      if (parent.child1 == leaf) {
        sibling = parent.child2;
      } else {
        sibling = parent.child1;
      }
      if (parent == this.root) {
        this.root = sibling;
        sibling.parent = null;
        return;
      }
      var grandParent = parent.parent;
      sibling.parent = grandParent;
      if (grandParent.child1 == parent) {
        grandParent.child1 = sibling;
      } else {
        grandParent.child2 = sibling;
      }
      if (this.numFreeNodes < 16384) {
        this.freeNodes[this.numFreeNodes++] = parent;
      }
      do {
        grandParent = this.balance(grandParent);
        this.fix(grandParent);
        grandParent = grandParent.parent;
      } while (grandParent != null);

    },

    balance: function (node) {

      var nh = node.height;
      if (nh < 2) {
        return node;
      }
      var p = node.parent;
      var l = node.child1;
      var r = node.child2;
      var lh = l.height;
      var rh = r.height;
      var balance = lh - rh;
      var t;// for bit operation

      //          [ N ]
      //         /     \
      //    [ L ]       [ R ]
      //     / \         / \
      // [L-L] [L-R] [R-L] [R-R]

      // Is the tree balanced?
      if (balance > 1) {
        var ll = l.child1;
        var lr = l.child2;
        var llh = ll.height;
        var lrh = lr.height;

        // Is L-L higher than L-R?
        if (llh > lrh) {
          // set N to L-R
          l.child2 = node;
          node.parent = l;

          //          [ L ]
          //         /     \
          //    [L-L]       [ N ]
          //     / \         / \
          // [...] [...] [ L ] [ R ]

          // set L-R
          node.child1 = lr;
          lr.parent = node;

          //          [ L ]
          //         /     \
          //    [L-L]       [ N ]
          //     / \         / \
          // [...] [...] [L-R] [ R ]

          // fix bounds and heights
          node.aabb.combine(lr.aabb, r.aabb);
          t = lrh - rh;
          node.height = lrh - (t & t >> 31) + 1;
          l.aabb.combine(ll.aabb, node.aabb);
          t = llh - nh;
          l.height = llh - (t & t >> 31) + 1;
        } else {
          // set N to L-L
          l.child1 = node;
          node.parent = l;

          //          [ L ]
          //         /     \
          //    [ N ]       [L-R]
          //     / \         / \
          // [ L ] [ R ] [...] [...]

          // set L-L
          node.child1 = ll;
          ll.parent = node;

          //          [ L ]
          //         /     \
          //    [ N ]       [L-R]
          //     / \         / \
          // [L-L] [ R ] [...] [...]

          // fix bounds and heights
          node.aabb.combine(ll.aabb, r.aabb);
          t = llh - rh;
          node.height = llh - (t & t >> 31) + 1;

          l.aabb.combine(node.aabb, lr.aabb);
          t = nh - lrh;
          l.height = nh - (t & t >> 31) + 1;
        }
        // set new parent of L
        if (p != null) {
          if (p.child1 == node) {
            p.child1 = l;
          } else {
            p.child2 = l;
          }
        } else {
          this.root = l;
        }
        l.parent = p;
        return l;
      } else if (balance < -1) {
        var rl = r.child1;
        var rr = r.child2;
        var rlh = rl.height;
        var rrh = rr.height;

        // Is R-L higher than R-R?
        if (rlh > rrh) {
          // set N to R-R
          r.child2 = node;
          node.parent = r;

          //          [ R ]
          //         /     \
          //    [R-L]       [ N ]
          //     / \         / \
          // [...] [...] [ L ] [ R ]

          // set R-R
          node.child2 = rr;
          rr.parent = node;

          //          [ R ]
          //         /     \
          //    [R-L]       [ N ]
          //     / \         / \
          // [...] [...] [ L ] [R-R]

          // fix bounds and heights
          node.aabb.combine(l.aabb, rr.aabb);
          t = lh - rrh;
          node.height = lh - (t & t >> 31) + 1;
          r.aabb.combine(rl.aabb, node.aabb);
          t = rlh - nh;
          r.height = rlh - (t & t >> 31) + 1;
        } else {
          // set N to R-L
          r.child1 = node;
          node.parent = r;
          //          [ R ]
          //         /     \
          //    [ N ]       [R-R]
          //     / \         / \
          // [ L ] [ R ] [...] [...]

          // set R-L
          node.child2 = rl;
          rl.parent = node;

          //          [ R ]
          //         /     \
          //    [ N ]       [R-R]
          //     / \         / \
          // [ L ] [R-L] [...] [...]

          // fix bounds and heights
          node.aabb.combine(l.aabb, rl.aabb);
          t = lh - rlh;
          node.height = lh - (t & t >> 31) + 1;
          r.aabb.combine(node.aabb, rr.aabb);
          t = nh - rrh;
          r.height = nh - (t & t >> 31) + 1;
        }
        // set new parent of R
        if (p != null) {
          if (p.child1 == node) {
            p.child1 = r;
          } else {
            p.child2 = r;
          }
        } else {
          this.root = r;
        }
        r.parent = p;
        return r;
      }
      return node;
    },

    fix: function (node) {

      var c1 = node.child1;
      var c2 = node.child2;
      node.aabb.combine(c1.aabb, c2.aabb);
      node.height = c1.height < c2.height ? c2.height + 1 : c1.height + 1;

    }

  });

  /**
  * A proxy for dynamic bounding volume tree broad-phase.
  * @author saharan
  */

  function DBVTProxy(shape) {

    Proxy.call(this, shape);
    // The leaf of the proxy.
    this.leaf = new DBVTNode();
    this.leaf.proxy = this;

  }
  DBVTProxy.prototype = Object.assign(Object.create(Proxy.prototype), {

    constructor: DBVTProxy,

    update: function () {

    }

  });

  /**
   * A broad-phase algorithm using dynamic bounding volume tree.
   *
   * @author saharan
   * @author lo-th
   */

  function DBVTBroadPhase() {

    BroadPhase.call(this);

    this.types = BR_BOUNDING_VOLUME_TREE;

    this.tree = new DBVT();
    this.stack = [];
    this.leaves = [];
    this.numLeaves = 0;

  }
  DBVTBroadPhase.prototype = Object.assign(Object.create(BroadPhase.prototype), {

    constructor: DBVTBroadPhase,

    createProxy: function (shape) {

      return new DBVTProxy(shape);

    },

    addProxy: function (proxy) {

      this.tree.insertLeaf(proxy.leaf);
      this.leaves.push(proxy.leaf);
      this.numLeaves++;

    },

    removeProxy: function (proxy) {

      this.tree.deleteLeaf(proxy.leaf);
      var n = this.leaves.indexOf(proxy.leaf);
      if (n > -1) {
        this.leaves.splice(n, 1);
        this.numLeaves--;
      }

    },

    collectPairs: function () {

      if (this.numLeaves < 2) return;

      var leaf, margin = 0.1, i = this.numLeaves;

      while (i--) {

        leaf = this.leaves[i];

        if (leaf.proxy.aabb.intersectTestTwo(leaf.aabb)) {

          leaf.aabb.copy(leaf.proxy.aabb, margin);
          this.tree.deleteLeaf(leaf);
          this.tree.insertLeaf(leaf);
          this.collide(leaf, this.tree.root);

        }
      }

    },

    collide: function (node1, node2) {

      var stackCount = 2;
      var s1, s2, n1, n2, l1, l2;
      this.stack[0] = node1;
      this.stack[1] = node2;

      while (stackCount > 0) {

        n1 = this.stack[--stackCount];
        n2 = this.stack[--stackCount];
        l1 = n1.proxy != null;
        l2 = n2.proxy != null;

        this.numPairChecks++;

        if (l1 && l2) {
          s1 = n1.proxy.shape;
          s2 = n2.proxy.shape;
          if (s1 == s2 || s1.aabb.intersectTest(s2.aabb) || !this.isAvailablePair(s1, s2)) continue;

          this.addPair(s1, s2);

        } else {

          if (n1.aabb.intersectTest(n2.aabb)) continue;

          /*if(stackCount+4>=this.maxStack){// expand the stack
              //this.maxStack<<=1;
              this.maxStack*=2;
              var newStack = [];// vector
              newStack.length = this.maxStack;
              for(var i=0;i<stackCount;i++){
                  newStack[i] = this.stack[i];
              }
              this.stack = newStack;
          }*/

          if (l2 || !l1 && (n1.aabb.surfaceArea() > n2.aabb.surfaceArea())) {
            this.stack[stackCount++] = n1.child1;
            this.stack[stackCount++] = n2;
            this.stack[stackCount++] = n1.child2;
            this.stack[stackCount++] = n2;
          } else {
            this.stack[stackCount++] = n1;
            this.stack[stackCount++] = n2.child1;
            this.stack[stackCount++] = n1;
            this.stack[stackCount++] = n2.child2;
          }
        }
      }

    }

  });

  function CollisionDetector() {

    this.flip = false;

  }
  Object.assign(CollisionDetector.prototype, {

    CollisionDetector: true,

    detectCollision: function (shape1, shape2, manifold) {

      printError("CollisionDetector", "Inheritance error.");

    }

  });

  /**
   * A collision detector which detects collisions between two boxes.
   * @author saharan
   */
  function BoxBoxCollisionDetector() {

    CollisionDetector.call(this);
    this.clipVertices1 = new Float32Array(24); // 8 vertices x,y,z
    this.clipVertices2 = new Float32Array(24);
    this.used = new Float32Array(8);

    this.INF = 1 / 0;

  }
  BoxBoxCollisionDetector.prototype = Object.assign(Object.create(CollisionDetector.prototype), {

    constructor: BoxBoxCollisionDetector,

    detectCollision: function (shape1, shape2, manifold) {
      // What you are doing 
      // · I to prepare a separate axis of the fifteen 
      //-Six in each of three normal vectors of the xyz direction of the box both 
      // · Remaining nine 3x3 a vector perpendicular to the side of the box 2 and the side of the box 1 
      // · Calculate the depth to the separation axis 

      // Calculates the distance using the inner product and put the amount of embedment 
      // · However a vertical separation axis and side to weight a little to avoid vibration 
      // And end when there is a separate axis that is remote even one 
      // · I look for separation axis with little to dent most 
      // Men and if separation axis of the first six - end collision 
      // Heng If it separate axis of nine other - side collision 
      // Heng - case of a side collision 
      // · Find points of two sides on which you made ​​the separation axis 

      // Calculates the point of closest approach of a straight line consisting of separate axis points obtained, and the collision point 
      //-Surface - the case of the plane crash 
      //-Box A, box B and the other a box of better made ​​a separate axis 
      // • The surface A and the plane that made the separation axis of the box A, and B to the surface the face of the box B close in the opposite direction to the most isolated axis 

      // When viewed from the front surface A, and the cut part exceeding the area of the surface A is a surface B 
      //-Plane B becomes the 3-8 triangle, I a candidate for the collision point the vertex of surface B 
      // • If more than one candidate 5 exists, scraping up to four 

      // For potential collision points of all, to examine the distance between the surface A 
      // • If you were on the inside surface of A, and the collision point

      var b1;
      var b2;
      if (shape1.id < shape2.id) {
        b1 = (shape1);
        b2 = (shape2);
      } else {
        b1 = (shape2);
        b2 = (shape1);
      }
      var V1 = b1.elements;
      var V2 = b2.elements;

      var D1 = b1.dimentions;
      var D2 = b2.dimentions;

      var p1 = b1.position;
      var p2 = b2.position;
      var p1x = p1.x;
      var p1y = p1.y;
      var p1z = p1.z;
      var p2x = p2.x;
      var p2y = p2.y;
      var p2z = p2.z;
      // diff
      var dx = p2x - p1x;
      var dy = p2y - p1y;
      var dz = p2z - p1z;
      // distance
      var w1 = b1.halfWidth;
      var h1 = b1.halfHeight;
      var d1 = b1.halfDepth;
      var w2 = b2.halfWidth;
      var h2 = b2.halfHeight;
      var d2 = b2.halfDepth;
      // direction

      // ----------------------------
      // 15 separating axes
      // 1~6: face
      // 7~f: edge
      // http://marupeke296.com/COL_3D_No13_OBBvsOBB.html
      // ----------------------------

      var a1x = D1[0];
      var a1y = D1[1];
      var a1z = D1[2];
      var a2x = D1[3];
      var a2y = D1[4];
      var a2z = D1[5];
      var a3x = D1[6];
      var a3y = D1[7];
      var a3z = D1[8];
      var d1x = D1[9];
      var d1y = D1[10];
      var d1z = D1[11];
      var d2x = D1[12];
      var d2y = D1[13];
      var d2z = D1[14];
      var d3x = D1[15];
      var d3y = D1[16];
      var d3z = D1[17];

      var a4x = D2[0];
      var a4y = D2[1];
      var a4z = D2[2];
      var a5x = D2[3];
      var a5y = D2[4];
      var a5z = D2[5];
      var a6x = D2[6];
      var a6y = D2[7];
      var a6z = D2[8];
      var d4x = D2[9];
      var d4y = D2[10];
      var d4z = D2[11];
      var d5x = D2[12];
      var d5y = D2[13];
      var d5z = D2[14];
      var d6x = D2[15];
      var d6y = D2[16];
      var d6z = D2[17];

      var a7x = a1y * a4z - a1z * a4y;
      var a7y = a1z * a4x - a1x * a4z;
      var a7z = a1x * a4y - a1y * a4x;
      var a8x = a1y * a5z - a1z * a5y;
      var a8y = a1z * a5x - a1x * a5z;
      var a8z = a1x * a5y - a1y * a5x;
      var a9x = a1y * a6z - a1z * a6y;
      var a9y = a1z * a6x - a1x * a6z;
      var a9z = a1x * a6y - a1y * a6x;
      var aax = a2y * a4z - a2z * a4y;
      var aay = a2z * a4x - a2x * a4z;
      var aaz = a2x * a4y - a2y * a4x;
      var abx = a2y * a5z - a2z * a5y;
      var aby = a2z * a5x - a2x * a5z;
      var abz = a2x * a5y - a2y * a5x;
      var acx = a2y * a6z - a2z * a6y;
      var acy = a2z * a6x - a2x * a6z;
      var acz = a2x * a6y - a2y * a6x;
      var adx = a3y * a4z - a3z * a4y;
      var ady = a3z * a4x - a3x * a4z;
      var adz = a3x * a4y - a3y * a4x;
      var aex = a3y * a5z - a3z * a5y;
      var aey = a3z * a5x - a3x * a5z;
      var aez = a3x * a5y - a3y * a5x;
      var afx = a3y * a6z - a3z * a6y;
      var afy = a3z * a6x - a3x * a6z;
      var afz = a3x * a6y - a3y * a6x;
      // right or left flags
      var right1;
      var right2;
      var right3;
      var right4;
      var right5;
      var right6;
      var right7;
      var right8;
      var right9;
      var righta;
      var rightb;
      var rightc;
      var rightd;
      var righte;
      var rightf;
      // overlapping distances
      var overlap1;
      var overlap2;
      var overlap3;
      var overlap4;
      var overlap5;
      var overlap6;
      var overlap7;
      var overlap8;
      var overlap9;
      var overlapa;
      var overlapb;
      var overlapc;
      var overlapd;
      var overlape;
      var overlapf;
      // invalid flags
      var invalid7 = false;
      var invalid8 = false;
      var invalid9 = false;
      var invalida = false;
      var invalidb = false;
      var invalidc = false;
      var invalidd = false;
      var invalide = false;
      var invalidf = false;
      // temporary variables
      var len;
      var len1;
      var len2;
      var dot1;
      var dot2;
      var dot3;
      // try axis 1
      len = a1x * dx + a1y * dy + a1z * dz;
      right1 = len > 0;
      if (!right1) len = -len;
      len1 = w1;
      dot1 = a1x * a4x + a1y * a4y + a1z * a4z;
      dot2 = a1x * a5x + a1y * a5y + a1z * a5z;
      dot3 = a1x * a6x + a1y * a6y + a1z * a6z;
      if (dot1 < 0) dot1 = -dot1;
      if (dot2 < 0) dot2 = -dot2;
      if (dot3 < 0) dot3 = -dot3;
      len2 = dot1 * w2 + dot2 * h2 + dot3 * d2;
      overlap1 = len - len1 - len2;
      if (overlap1 > 0) return;
      // try axis 2
      len = a2x * dx + a2y * dy + a2z * dz;
      right2 = len > 0;
      if (!right2) len = -len;
      len1 = h1;
      dot1 = a2x * a4x + a2y * a4y + a2z * a4z;
      dot2 = a2x * a5x + a2y * a5y + a2z * a5z;
      dot3 = a2x * a6x + a2y * a6y + a2z * a6z;
      if (dot1 < 0) dot1 = -dot1;
      if (dot2 < 0) dot2 = -dot2;
      if (dot3 < 0) dot3 = -dot3;
      len2 = dot1 * w2 + dot2 * h2 + dot3 * d2;
      overlap2 = len - len1 - len2;
      if (overlap2 > 0) return;
      // try axis 3
      len = a3x * dx + a3y * dy + a3z * dz;
      right3 = len > 0;
      if (!right3) len = -len;
      len1 = d1;
      dot1 = a3x * a4x + a3y * a4y + a3z * a4z;
      dot2 = a3x * a5x + a3y * a5y + a3z * a5z;
      dot3 = a3x * a6x + a3y * a6y + a3z * a6z;
      if (dot1 < 0) dot1 = -dot1;
      if (dot2 < 0) dot2 = -dot2;
      if (dot3 < 0) dot3 = -dot3;
      len2 = dot1 * w2 + dot2 * h2 + dot3 * d2;
      overlap3 = len - len1 - len2;
      if (overlap3 > 0) return;
      // try axis 4
      len = a4x * dx + a4y * dy + a4z * dz;
      right4 = len > 0;
      if (!right4) len = -len;
      dot1 = a4x * a1x + a4y * a1y + a4z * a1z;
      dot2 = a4x * a2x + a4y * a2y + a4z * a2z;
      dot3 = a4x * a3x + a4y * a3y + a4z * a3z;
      if (dot1 < 0) dot1 = -dot1;
      if (dot2 < 0) dot2 = -dot2;
      if (dot3 < 0) dot3 = -dot3;
      len1 = dot1 * w1 + dot2 * h1 + dot3 * d1;
      len2 = w2;
      overlap4 = (len - len1 - len2) * 1.0;
      if (overlap4 > 0) return;
      // try axis 5
      len = a5x * dx + a5y * dy + a5z * dz;
      right5 = len > 0;
      if (!right5) len = -len;
      dot1 = a5x * a1x + a5y * a1y + a5z * a1z;
      dot2 = a5x * a2x + a5y * a2y + a5z * a2z;
      dot3 = a5x * a3x + a5y * a3y + a5z * a3z;
      if (dot1 < 0) dot1 = -dot1;
      if (dot2 < 0) dot2 = -dot2;
      if (dot3 < 0) dot3 = -dot3;
      len1 = dot1 * w1 + dot2 * h1 + dot3 * d1;
      len2 = h2;
      overlap5 = (len - len1 - len2) * 1.0;
      if (overlap5 > 0) return;
      // try axis 6
      len = a6x * dx + a6y * dy + a6z * dz;
      right6 = len > 0;
      if (!right6) len = -len;
      dot1 = a6x * a1x + a6y * a1y + a6z * a1z;
      dot2 = a6x * a2x + a6y * a2y + a6z * a2z;
      dot3 = a6x * a3x + a6y * a3y + a6z * a3z;
      if (dot1 < 0) dot1 = -dot1;
      if (dot2 < 0) dot2 = -dot2;
      if (dot3 < 0) dot3 = -dot3;
      len1 = dot1 * w1 + dot2 * h1 + dot3 * d1;
      len2 = d2;
      overlap6 = (len - len1 - len2) * 1.0;
      if (overlap6 > 0) return;
      // try axis 7
      len = a7x * a7x + a7y * a7y + a7z * a7z;
      if (len > 1e-5) {
        len = 1 / _Math.sqrt(len);
        a7x *= len;
        a7y *= len;
        a7z *= len;
        len = a7x * dx + a7y * dy + a7z * dz;
        right7 = len > 0;
        if (!right7) len = -len;
        dot1 = a7x * a2x + a7y * a2y + a7z * a2z;
        dot2 = a7x * a3x + a7y * a3y + a7z * a3z;
        if (dot1 < 0) dot1 = -dot1;
        if (dot2 < 0) dot2 = -dot2;
        len1 = dot1 * h1 + dot2 * d1;
        dot1 = a7x * a5x + a7y * a5y + a7z * a5z;
        dot2 = a7x * a6x + a7y * a6y + a7z * a6z;
        if (dot1 < 0) dot1 = -dot1;
        if (dot2 < 0) dot2 = -dot2;
        len2 = dot1 * h2 + dot2 * d2;
        overlap7 = len - len1 - len2;
        if (overlap7 > 0) return;
      } else {
        right7 = false;
        overlap7 = 0;
        invalid7 = true;
      }
      // try axis 8
      len = a8x * a8x + a8y * a8y + a8z * a8z;
      if (len > 1e-5) {
        len = 1 / _Math.sqrt(len);
        a8x *= len;
        a8y *= len;
        a8z *= len;
        len = a8x * dx + a8y * dy + a8z * dz;
        right8 = len > 0;
        if (!right8) len = -len;
        dot1 = a8x * a2x + a8y * a2y + a8z * a2z;
        dot2 = a8x * a3x + a8y * a3y + a8z * a3z;
        if (dot1 < 0) dot1 = -dot1;
        if (dot2 < 0) dot2 = -dot2;
        len1 = dot1 * h1 + dot2 * d1;
        dot1 = a8x * a4x + a8y * a4y + a8z * a4z;
        dot2 = a8x * a6x + a8y * a6y + a8z * a6z;
        if (dot1 < 0) dot1 = -dot1;
        if (dot2 < 0) dot2 = -dot2;
        len2 = dot1 * w2 + dot2 * d2;
        overlap8 = len - len1 - len2;
        if (overlap8 > 0) return;
      } else {
        right8 = false;
        overlap8 = 0;
        invalid8 = true;
      }
      // try axis 9
      len = a9x * a9x + a9y * a9y + a9z * a9z;
      if (len > 1e-5) {
        len = 1 / _Math.sqrt(len);
        a9x *= len;
        a9y *= len;
        a9z *= len;
        len = a9x * dx + a9y * dy + a9z * dz;
        right9 = len > 0;
        if (!right9) len = -len;
        dot1 = a9x * a2x + a9y * a2y + a9z * a2z;
        dot2 = a9x * a3x + a9y * a3y + a9z * a3z;
        if (dot1 < 0) dot1 = -dot1;
        if (dot2 < 0) dot2 = -dot2;
        len1 = dot1 * h1 + dot2 * d1;
        dot1 = a9x * a4x + a9y * a4y + a9z * a4z;
        dot2 = a9x * a5x + a9y * a5y + a9z * a5z;
        if (dot1 < 0) dot1 = -dot1;
        if (dot2 < 0) dot2 = -dot2;
        len2 = dot1 * w2 + dot2 * h2;
        overlap9 = len - len1 - len2;
        if (overlap9 > 0) return;
      } else {
        right9 = false;
        overlap9 = 0;
        invalid9 = true;
      }
      // try axis 10
      len = aax * aax + aay * aay + aaz * aaz;
      if (len > 1e-5) {
        len = 1 / _Math.sqrt(len);
        aax *= len;
        aay *= len;
        aaz *= len;
        len = aax * dx + aay * dy + aaz * dz;
        righta = len > 0;
        if (!righta) len = -len;
        dot1 = aax * a1x + aay * a1y + aaz * a1z;
        dot2 = aax * a3x + aay * a3y + aaz * a3z;
        if (dot1 < 0) dot1 = -dot1;
        if (dot2 < 0) dot2 = -dot2;
        len1 = dot1 * w1 + dot2 * d1;
        dot1 = aax * a5x + aay * a5y + aaz * a5z;
        dot2 = aax * a6x + aay * a6y + aaz * a6z;
        if (dot1 < 0) dot1 = -dot1;
        if (dot2 < 0) dot2 = -dot2;
        len2 = dot1 * h2 + dot2 * d2;
        overlapa = len - len1 - len2;
        if (overlapa > 0) return;
      } else {
        righta = false;
        overlapa = 0;
        invalida = true;
      }
      // try axis 11
      len = abx * abx + aby * aby + abz * abz;
      if (len > 1e-5) {
        len = 1 / _Math.sqrt(len);
        abx *= len;
        aby *= len;
        abz *= len;
        len = abx * dx + aby * dy + abz * dz;
        rightb = len > 0;
        if (!rightb) len = -len;
        dot1 = abx * a1x + aby * a1y + abz * a1z;
        dot2 = abx * a3x + aby * a3y + abz * a3z;
        if (dot1 < 0) dot1 = -dot1;
        if (dot2 < 0) dot2 = -dot2;
        len1 = dot1 * w1 + dot2 * d1;
        dot1 = abx * a4x + aby * a4y + abz * a4z;
        dot2 = abx * a6x + aby * a6y + abz * a6z;
        if (dot1 < 0) dot1 = -dot1;
        if (dot2 < 0) dot2 = -dot2;
        len2 = dot1 * w2 + dot2 * d2;
        overlapb = len - len1 - len2;
        if (overlapb > 0) return;
      } else {
        rightb = false;
        overlapb = 0;
        invalidb = true;
      }
      // try axis 12
      len = acx * acx + acy * acy + acz * acz;
      if (len > 1e-5) {
        len = 1 / _Math.sqrt(len);
        acx *= len;
        acy *= len;
        acz *= len;
        len = acx * dx + acy * dy + acz * dz;
        rightc = len > 0;
        if (!rightc) len = -len;
        dot1 = acx * a1x + acy * a1y + acz * a1z;
        dot2 = acx * a3x + acy * a3y + acz * a3z;
        if (dot1 < 0) dot1 = -dot1;
        if (dot2 < 0) dot2 = -dot2;
        len1 = dot1 * w1 + dot2 * d1;
        dot1 = acx * a4x + acy * a4y + acz * a4z;
        dot2 = acx * a5x + acy * a5y + acz * a5z;
        if (dot1 < 0) dot1 = -dot1;
        if (dot2 < 0) dot2 = -dot2;
        len2 = dot1 * w2 + dot2 * h2;
        overlapc = len - len1 - len2;
        if (overlapc > 0) return;
      } else {
        rightc = false;
        overlapc = 0;
        invalidc = true;
      }
      // try axis 13
      len = adx * adx + ady * ady + adz * adz;
      if (len > 1e-5) {
        len = 1 / _Math.sqrt(len);
        adx *= len;
        ady *= len;
        adz *= len;
        len = adx * dx + ady * dy + adz * dz;
        rightd = len > 0;
        if (!rightd) len = -len;
        dot1 = adx * a1x + ady * a1y + adz * a1z;
        dot2 = adx * a2x + ady * a2y + adz * a2z;
        if (dot1 < 0) dot1 = -dot1;
        if (dot2 < 0) dot2 = -dot2;
        len1 = dot1 * w1 + dot2 * h1;
        dot1 = adx * a5x + ady * a5y + adz * a5z;
        dot2 = adx * a6x + ady * a6y + adz * a6z;
        if (dot1 < 0) dot1 = -dot1;
        if (dot2 < 0) dot2 = -dot2;
        len2 = dot1 * h2 + dot2 * d2;
        overlapd = len - len1 - len2;
        if (overlapd > 0) return;
      } else {
        rightd = false;
        overlapd = 0;
        invalidd = true;
      }
      // try axis 14
      len = aex * aex + aey * aey + aez * aez;
      if (len > 1e-5) {
        len = 1 / _Math.sqrt(len);
        aex *= len;
        aey *= len;
        aez *= len;
        len = aex * dx + aey * dy + aez * dz;
        righte = len > 0;
        if (!righte) len = -len;
        dot1 = aex * a1x + aey * a1y + aez * a1z;
        dot2 = aex * a2x + aey * a2y + aez * a2z;
        if (dot1 < 0) dot1 = -dot1;
        if (dot2 < 0) dot2 = -dot2;
        len1 = dot1 * w1 + dot2 * h1;
        dot1 = aex * a4x + aey * a4y + aez * a4z;
        dot2 = aex * a6x + aey * a6y + aez * a6z;
        if (dot1 < 0) dot1 = -dot1;
        if (dot2 < 0) dot2 = -dot2;
        len2 = dot1 * w2 + dot2 * d2;
        overlape = len - len1 - len2;
        if (overlape > 0) return;
      } else {
        righte = false;
        overlape = 0;
        invalide = true;
      }
      // try axis 15
      len = afx * afx + afy * afy + afz * afz;
      if (len > 1e-5) {
        len = 1 / _Math.sqrt(len);
        afx *= len;
        afy *= len;
        afz *= len;
        len = afx * dx + afy * dy + afz * dz;
        rightf = len > 0;
        if (!rightf) len = -len;
        dot1 = afx * a1x + afy * a1y + afz * a1z;
        dot2 = afx * a2x + afy * a2y + afz * a2z;
        if (dot1 < 0) dot1 = -dot1;
        if (dot2 < 0) dot2 = -dot2;
        len1 = dot1 * w1 + dot2 * h1;
        dot1 = afx * a4x + afy * a4y + afz * a4z;
        dot2 = afx * a5x + afy * a5y + afz * a5z;
        if (dot1 < 0) dot1 = -dot1;
        if (dot2 < 0) dot2 = -dot2;
        len2 = dot1 * w2 + dot2 * h2;
        overlapf = len - len1 - len2;
        if (overlapf > 0) return;
      } else {
        rightf = false;
        overlapf = 0;
        invalidf = true;
      }
      // boxes are overlapping
      var depth = overlap1;
      var depth2 = overlap1;
      var minIndex = 0;
      var right = right1;
      if (overlap2 > depth2) {
        depth = overlap2;
        depth2 = overlap2;
        minIndex = 1;
        right = right2;
      }
      if (overlap3 > depth2) {
        depth = overlap3;
        depth2 = overlap3;
        minIndex = 2;
        right = right3;
      }
      if (overlap4 > depth2) {
        depth = overlap4;
        depth2 = overlap4;
        minIndex = 3;
        right = right4;
      }
      if (overlap5 > depth2) {
        depth = overlap5;
        depth2 = overlap5;
        minIndex = 4;
        right = right5;
      }
      if (overlap6 > depth2) {
        depth = overlap6;
        depth2 = overlap6;
        minIndex = 5;
        right = right6;
      }
      if (overlap7 - 0.01 > depth2 && !invalid7) {
        depth = overlap7;
        depth2 = overlap7 - 0.01;
        minIndex = 6;
        right = right7;
      }
      if (overlap8 - 0.01 > depth2 && !invalid8) {
        depth = overlap8;
        depth2 = overlap8 - 0.01;
        minIndex = 7;
        right = right8;
      }
      if (overlap9 - 0.01 > depth2 && !invalid9) {
        depth = overlap9;
        depth2 = overlap9 - 0.01;
        minIndex = 8;
        right = right9;
      }
      if (overlapa - 0.01 > depth2 && !invalida) {
        depth = overlapa;
        depth2 = overlapa - 0.01;
        minIndex = 9;
        right = righta;
      }
      if (overlapb - 0.01 > depth2 && !invalidb) {
        depth = overlapb;
        depth2 = overlapb - 0.01;
        minIndex = 10;
        right = rightb;
      }
      if (overlapc - 0.01 > depth2 && !invalidc) {
        depth = overlapc;
        depth2 = overlapc - 0.01;
        minIndex = 11;
        right = rightc;
      }
      if (overlapd - 0.01 > depth2 && !invalidd) {
        depth = overlapd;
        depth2 = overlapd - 0.01;
        minIndex = 12;
        right = rightd;
      }
      if (overlape - 0.01 > depth2 && !invalide) {
        depth = overlape;
        depth2 = overlape - 0.01;
        minIndex = 13;
        right = righte;
      }
      if (overlapf - 0.01 > depth2 && !invalidf) {
        depth = overlapf;
        minIndex = 14;
        right = rightf;
      }
      // normal
      var nx = 0;
      var ny = 0;
      var nz = 0;
      // edge line or face side normal
      var n1x = 0;
      var n1y = 0;
      var n1z = 0;
      var n2x = 0;
      var n2y = 0;
      var n2z = 0;
      // center of current face
      var cx = 0;
      var cy = 0;
      var cz = 0;
      // face side
      var s1x = 0;
      var s1y = 0;
      var s1z = 0;
      var s2x = 0;
      var s2y = 0;
      var s2z = 0;
      // swap b1 b2
      var swap = false;

      //_______________________________________

      if (minIndex == 0) {// b1.x * b2
        if (right) {
          cx = p1x + d1x; cy = p1y + d1y; cz = p1z + d1z;
          nx = a1x; ny = a1y; nz = a1z;
        } else {
          cx = p1x - d1x; cy = p1y - d1y; cz = p1z - d1z;
          nx = -a1x; ny = -a1y; nz = -a1z;
        }
        s1x = d2x; s1y = d2y; s1z = d2z;
        n1x = -a2x; n1y = -a2y; n1z = -a2z;
        s2x = d3x; s2y = d3y; s2z = d3z;
        n2x = -a3x; n2y = -a3y; n2z = -a3z;
      }
      else if (minIndex == 1) {// b1.y * b2
        if (right) {
          cx = p1x + d2x; cy = p1y + d2y; cz = p1z + d2z;
          nx = a2x; ny = a2y; nz = a2z;
        } else {
          cx = p1x - d2x; cy = p1y - d2y; cz = p1z - d2z;
          nx = -a2x; ny = -a2y; nz = -a2z;
        }
        s1x = d1x; s1y = d1y; s1z = d1z;
        n1x = -a1x; n1y = -a1y; n1z = -a1z;
        s2x = d3x; s2y = d3y; s2z = d3z;
        n2x = -a3x; n2y = -a3y; n2z = -a3z;
      }
      else if (minIndex == 2) {// b1.z * b2
        if (right) {
          cx = p1x + d3x; cy = p1y + d3y; cz = p1z + d3z;
          nx = a3x; ny = a3y; nz = a3z;
        } else {
          cx = p1x - d3x; cy = p1y - d3y; cz = p1z - d3z;
          nx = -a3x; ny = -a3y; nz = -a3z;
        }
        s1x = d1x; s1y = d1y; s1z = d1z;
        n1x = -a1x; n1y = -a1y; n1z = -a1z;
        s2x = d2x; s2y = d2y; s2z = d2z;
        n2x = -a2x; n2y = -a2y; n2z = -a2z;
      }
      else if (minIndex == 3) {// b2.x * b1
        swap = true;
        if (!right) {
          cx = p2x + d4x; cy = p2y + d4y; cz = p2z + d4z;
          nx = a4x; ny = a4y; nz = a4z;
        } else {
          cx = p2x - d4x; cy = p2y - d4y; cz = p2z - d4z;
          nx = -a4x; ny = -a4y; nz = -a4z;
        }
        s1x = d5x; s1y = d5y; s1z = d5z;
        n1x = -a5x; n1y = -a5y; n1z = -a5z;
        s2x = d6x; s2y = d6y; s2z = d6z;
        n2x = -a6x; n2y = -a6y; n2z = -a6z;
      }
      else if (minIndex == 4) {// b2.y * b1
        swap = true;
        if (!right) {
          cx = p2x + d5x; cy = p2y + d5y; cz = p2z + d5z;
          nx = a5x; ny = a5y; nz = a5z;
        } else {
          cx = p2x - d5x; cy = p2y - d5y; cz = p2z - d5z;
          nx = -a5x; ny = -a5y; nz = -a5z;
        }
        s1x = d4x; s1y = d4y; s1z = d4z;
        n1x = -a4x; n1y = -a4y; n1z = -a4z;
        s2x = d6x; s2y = d6y; s2z = d6z;
        n2x = -a6x; n2y = -a6y; n2z = -a6z;
      }
      else if (minIndex == 5) {// b2.z * b1
        swap = true;
        if (!right) {
          cx = p2x + d6x; cy = p2y + d6y; cz = p2z + d6z;
          nx = a6x; ny = a6y; nz = a6z;
        } else {
          cx = p2x - d6x; cy = p2y - d6y; cz = p2z - d6z;
          nx = -a6x; ny = -a6y; nz = -a6z;
        }
        s1x = d4x; s1y = d4y; s1z = d4z;
        n1x = -a4x; n1y = -a4y; n1z = -a4z;
        s2x = d5x; s2y = d5y; s2z = d5z;
        n2x = -a5x; n2y = -a5y; n2z = -a5z;
      }
      else if (minIndex == 6) {// b1.x * b2.x
        nx = a7x; ny = a7y; nz = a7z;
        n1x = a1x; n1y = a1y; n1z = a1z;
        n2x = a4x; n2y = a4y; n2z = a4z;
      }
      else if (minIndex == 7) {// b1.x * b2.y
        nx = a8x; ny = a8y; nz = a8z;
        n1x = a1x; n1y = a1y; n1z = a1z;
        n2x = a5x; n2y = a5y; n2z = a5z;
      }
      else if (minIndex == 8) {// b1.x * b2.z
        nx = a9x; ny = a9y; nz = a9z;
        n1x = a1x; n1y = a1y; n1z = a1z;
        n2x = a6x; n2y = a6y; n2z = a6z;
      }
      else if (minIndex == 9) {// b1.y * b2.x
        nx = aax; ny = aay; nz = aaz;
        n1x = a2x; n1y = a2y; n1z = a2z;
        n2x = a4x; n2y = a4y; n2z = a4z;
      }
      else if (minIndex == 10) {// b1.y * b2.y
        nx = abx; ny = aby; nz = abz;
        n1x = a2x; n1y = a2y; n1z = a2z;
        n2x = a5x; n2y = a5y; n2z = a5z;
      }
      else if (minIndex == 11) {// b1.y * b2.z
        nx = acx; ny = acy; nz = acz;
        n1x = a2x; n1y = a2y; n1z = a2z;
        n2x = a6x; n2y = a6y; n2z = a6z;
      }
      else if (minIndex == 12) {// b1.z * b2.x
        nx = adx; ny = ady; nz = adz;
        n1x = a3x; n1y = a3y; n1z = a3z;
        n2x = a4x; n2y = a4y; n2z = a4z;
      }
      else if (minIndex == 13) {// b1.z * b2.y
        nx = aex; ny = aey; nz = aez;
        n1x = a3x; n1y = a3y; n1z = a3z;
        n2x = a5x; n2y = a5y; n2z = a5z;
      }
      else if (minIndex == 14) {// b1.z * b2.z
        nx = afx; ny = afy; nz = afz;
        n1x = a3x; n1y = a3y; n1z = a3z;
        n2x = a6x; n2y = a6y; n2z = a6z;
      }

      //__________________________________________

      //var v;
      if (minIndex > 5) {
        if (!right) {
          nx = -nx; ny = -ny; nz = -nz;
        }
        var distance;
        var maxDistance;
        var vx;
        var vy;
        var vz;
        var v1x;
        var v1y;
        var v1z;
        var v2x;
        var v2y;
        var v2z;
        //vertex1;
        v1x = V1[0]; v1y = V1[1]; v1z = V1[2];
        maxDistance = nx * v1x + ny * v1y + nz * v1z;
        //vertex2;
        vx = V1[3]; vy = V1[4]; vz = V1[5];
        distance = nx * vx + ny * vy + nz * vz;
        if (distance > maxDistance) {
          maxDistance = distance;
          v1x = vx; v1y = vy; v1z = vz;
        }
        //vertex3;
        vx = V1[6]; vy = V1[7]; vz = V1[8];
        distance = nx * vx + ny * vy + nz * vz;
        if (distance > maxDistance) {
          maxDistance = distance;
          v1x = vx; v1y = vy; v1z = vz;
        }
        //vertex4;
        vx = V1[9]; vy = V1[10]; vz = V1[11];
        distance = nx * vx + ny * vy + nz * vz;
        if (distance > maxDistance) {
          maxDistance = distance;
          v1x = vx; v1y = vy; v1z = vz;
        }
        //vertex5;
        vx = V1[12]; vy = V1[13]; vz = V1[14];
        distance = nx * vx + ny * vy + nz * vz;
        if (distance > maxDistance) {
          maxDistance = distance;
          v1x = vx; v1y = vy; v1z = vz;
        }
        //vertex6;
        vx = V1[15]; vy = V1[16]; vz = V1[17];
        distance = nx * vx + ny * vy + nz * vz;
        if (distance > maxDistance) {
          maxDistance = distance;
          v1x = vx; v1y = vy; v1z = vz;
        }
        //vertex7;
        vx = V1[18]; vy = V1[19]; vz = V1[20];
        distance = nx * vx + ny * vy + nz * vz;
        if (distance > maxDistance) {
          maxDistance = distance;
          v1x = vx; v1y = vy; v1z = vz;
        }
        //vertex8;
        vx = V1[21]; vy = V1[22]; vz = V1[23];
        distance = nx * vx + ny * vy + nz * vz;
        if (distance > maxDistance) {
          maxDistance = distance;
          v1x = vx; v1y = vy; v1z = vz;
        }
        //vertex1;
        v2x = V2[0]; v2y = V2[1]; v2z = V2[2];
        maxDistance = nx * v2x + ny * v2y + nz * v2z;
        //vertex2;
        vx = V2[3]; vy = V2[4]; vz = V2[5];
        distance = nx * vx + ny * vy + nz * vz;
        if (distance < maxDistance) {
          maxDistance = distance;
          v2x = vx; v2y = vy; v2z = vz;
        }
        //vertex3;
        vx = V2[6]; vy = V2[7]; vz = V2[8];
        distance = nx * vx + ny * vy + nz * vz;
        if (distance < maxDistance) {
          maxDistance = distance;
          v2x = vx; v2y = vy; v2z = vz;
        }
        //vertex4;
        vx = V2[9]; vy = V2[10]; vz = V2[11];
        distance = nx * vx + ny * vy + nz * vz;
        if (distance < maxDistance) {
          maxDistance = distance;
          v2x = vx; v2y = vy; v2z = vz;
        }
        //vertex5;
        vx = V2[12]; vy = V2[13]; vz = V2[14];
        distance = nx * vx + ny * vy + nz * vz;
        if (distance < maxDistance) {
          maxDistance = distance;
          v2x = vx; v2y = vy; v2z = vz;
        }
        //vertex6;
        vx = V2[15]; vy = V2[16]; vz = V2[17];
        distance = nx * vx + ny * vy + nz * vz;
        if (distance < maxDistance) {
          maxDistance = distance;
          v2x = vx; v2y = vy; v2z = vz;
        }
        //vertex7;
        vx = V2[18]; vy = V2[19]; vz = V2[20];
        distance = nx * vx + ny * vy + nz * vz;
        if (distance < maxDistance) {
          maxDistance = distance;
          v2x = vx; v2y = vy; v2z = vz;
        }
        //vertex8;
        vx = V2[21]; vy = V2[22]; vz = V2[23];
        distance = nx * vx + ny * vy + nz * vz;
        if (distance < maxDistance) {
          maxDistance = distance;
          v2x = vx; v2y = vy; v2z = vz;
        }
        vx = v2x - v1x; vy = v2y - v1y; vz = v2z - v1z;
        dot1 = n1x * n2x + n1y * n2y + n1z * n2z;
        var t = (vx * (n1x - n2x * dot1) + vy * (n1y - n2y * dot1) + vz * (n1z - n2z * dot1)) / (1 - dot1 * dot1);
        manifold.addPoint(v1x + n1x * t + nx * depth * 0.5, v1y + n1y * t + ny * depth * 0.5, v1z + n1z * t + nz * depth * 0.5, nx, ny, nz, depth, false);
        return;
      }
      // now detect face-face collision...
      // target quad
      var q1x;
      var q1y;
      var q1z;
      var q2x;
      var q2y;
      var q2z;
      var q3x;
      var q3y;
      var q3z;
      var q4x;
      var q4y;
      var q4z;
      // search support face and vertex
      var minDot = 1;
      var dot = 0;
      var minDotIndex = 0;
      if (swap) {
        dot = a1x * nx + a1y * ny + a1z * nz;
        if (dot < minDot) {
          minDot = dot;
          minDotIndex = 0;
        }
        if (-dot < minDot) {
          minDot = -dot;
          minDotIndex = 1;
        }
        dot = a2x * nx + a2y * ny + a2z * nz;
        if (dot < minDot) {
          minDot = dot;
          minDotIndex = 2;
        }
        if (-dot < minDot) {
          minDot = -dot;
          minDotIndex = 3;
        }
        dot = a3x * nx + a3y * ny + a3z * nz;
        if (dot < minDot) {
          minDot = dot;
          minDotIndex = 4;
        }
        if (-dot < minDot) {
          minDot = -dot;
          minDotIndex = 5;
        }

        if (minDotIndex == 0) {// x+ face
          q1x = V1[0]; q1y = V1[1]; q1z = V1[2];//vertex1
          q2x = V1[6]; q2y = V1[7]; q2z = V1[8];//vertex3
          q3x = V1[9]; q3y = V1[10]; q3z = V1[11];//vertex4
          q4x = V1[3]; q4y = V1[4]; q4z = V1[5];//vertex2
        }
        else if (minDotIndex == 1) {// x- face
          q1x = V1[15]; q1y = V1[16]; q1z = V1[17];//vertex6
          q2x = V1[21]; q2y = V1[22]; q2z = V1[23];//vertex8
          q3x = V1[18]; q3y = V1[19]; q3z = V1[20];//vertex7
          q4x = V1[12]; q4y = V1[13]; q4z = V1[14];//vertex5
        }
        else if (minDotIndex == 2) {// y+ face
          q1x = V1[12]; q1y = V1[13]; q1z = V1[14];//vertex5
          q2x = V1[0]; q2y = V1[1]; q2z = V1[2];//vertex1
          q3x = V1[3]; q3y = V1[4]; q3z = V1[5];//vertex2
          q4x = V1[15]; q4y = V1[16]; q4z = V1[17];//vertex6
        }
        else if (minDotIndex == 3) {// y- face
          q1x = V1[21]; q1y = V1[22]; q1z = V1[23];//vertex8
          q2x = V1[9]; q2y = V1[10]; q2z = V1[11];//vertex4
          q3x = V1[6]; q3y = V1[7]; q3z = V1[8];//vertex3
          q4x = V1[18]; q4y = V1[19]; q4z = V1[20];//vertex7
        }
        else if (minDotIndex == 4) {// z+ face
          q1x = V1[12]; q1y = V1[13]; q1z = V1[14];//vertex5
          q2x = V1[18]; q2y = V1[19]; q2z = V1[20];//vertex7
          q3x = V1[6]; q3y = V1[7]; q3z = V1[8];//vertex3
          q4x = V1[0]; q4y = V1[1]; q4z = V1[2];//vertex1
        }
        else if (minDotIndex == 5) {// z- face
          q1x = V1[3]; q1y = V1[4]; q1z = V1[5];//vertex2
          //2x=V1[6]; q2y=V1[7]; q2z=V1[8];//vertex4 !!!
          q2x = V2[9]; q2y = V2[10]; q2z = V2[11];//vertex4
          q3x = V1[21]; q3y = V1[22]; q3z = V1[23];//vertex8
          q4x = V1[15]; q4y = V1[16]; q4z = V1[17];//vertex6
        }

      } else {
        dot = a4x * nx + a4y * ny + a4z * nz;
        if (dot < minDot) {
          minDot = dot;
          minDotIndex = 0;
        }
        if (-dot < minDot) {
          minDot = -dot;
          minDotIndex = 1;
        }
        dot = a5x * nx + a5y * ny + a5z * nz;
        if (dot < minDot) {
          minDot = dot;
          minDotIndex = 2;
        }
        if (-dot < minDot) {
          minDot = -dot;
          minDotIndex = 3;
        }
        dot = a6x * nx + a6y * ny + a6z * nz;
        if (dot < minDot) {
          minDot = dot;
          minDotIndex = 4;
        }
        if (-dot < minDot) {
          minDot = -dot;
          minDotIndex = 5;
        }

        //______________________________________________________

        if (minDotIndex == 0) {// x+ face
          q1x = V2[0]; q1y = V2[1]; q1z = V2[2];//vertex1
          q2x = V2[6]; q2y = V2[7]; q2z = V2[8];//vertex3
          q3x = V2[9]; q3y = V2[10]; q3z = V2[11];//vertex4
          q4x = V2[3]; q4y = V2[4]; q4z = V2[5];//vertex2
        }
        else if (minDotIndex == 1) {// x- face
          q1x = V2[15]; q1y = V2[16]; q1z = V2[17];//vertex6
          q2x = V2[21]; q2y = V2[22]; q2z = V2[23]; //vertex8
          q3x = V2[18]; q3y = V2[19]; q3z = V2[20];//vertex7
          q4x = V2[12]; q4y = V2[13]; q4z = V2[14];//vertex5
        }
        else if (minDotIndex == 2) {// y+ face
          q1x = V2[12]; q1y = V2[13]; q1z = V2[14];//vertex5
          q2x = V2[0]; q2y = V2[1]; q2z = V2[2];//vertex1
          q3x = V2[3]; q3y = V2[4]; q3z = V2[5];//vertex2
          q4x = V2[15]; q4y = V2[16]; q4z = V2[17];//vertex6
        }
        else if (minDotIndex == 3) {// y- face
          q1x = V2[21]; q1y = V2[22]; q1z = V2[23];//vertex8
          q2x = V2[9]; q2y = V2[10]; q2z = V2[11];//vertex4
          q3x = V2[6]; q3y = V2[7]; q3z = V2[8];//vertex3
          q4x = V2[18]; q4y = V2[19]; q4z = V2[20];//vertex7
        }
        else if (minDotIndex == 4) {// z+ face
          q1x = V2[12]; q1y = V2[13]; q1z = V2[14];//vertex5
          q2x = V2[18]; q2y = V2[19]; q2z = V2[20];//vertex7
          q3x = V2[6]; q3y = V2[7]; q3z = V2[8];//vertex3
          q4x = V2[0]; q4y = V2[1]; q4z = V2[2];//vertex1
        }
        else if (minDotIndex == 5) {// z- face
          q1x = V2[3]; q1y = V2[4]; q1z = V2[5];//vertex2
          q2x = V2[9]; q2y = V2[10]; q2z = V2[11];//vertex4
          q3x = V2[21]; q3y = V2[22]; q3z = V2[23];//vertex8
          q4x = V2[15]; q4y = V2[16]; q4z = V2[17];//vertex6
        }

      }
      // clip vertices
      var numClipVertices;
      var numAddedClipVertices;
      var index;
      var x1;
      var y1;
      var z1;
      var x2;
      var y2;
      var z2;
      this.clipVertices1[0] = q1x;
      this.clipVertices1[1] = q1y;
      this.clipVertices1[2] = q1z;
      this.clipVertices1[3] = q2x;
      this.clipVertices1[4] = q2y;
      this.clipVertices1[5] = q2z;
      this.clipVertices1[6] = q3x;
      this.clipVertices1[7] = q3y;
      this.clipVertices1[8] = q3z;
      this.clipVertices1[9] = q4x;
      this.clipVertices1[10] = q4y;
      this.clipVertices1[11] = q4z;
      numAddedClipVertices = 0;
      x1 = this.clipVertices1[9];
      y1 = this.clipVertices1[10];
      z1 = this.clipVertices1[11];
      dot1 = (x1 - cx - s1x) * n1x + (y1 - cy - s1y) * n1y + (z1 - cz - s1z) * n1z;

      //var i = 4;
      //while(i--){
      for (var i = 0; i < 4; i++) {
        index = i * 3;
        x2 = this.clipVertices1[index];
        y2 = this.clipVertices1[index + 1];
        z2 = this.clipVertices1[index + 2];
        dot2 = (x2 - cx - s1x) * n1x + (y2 - cy - s1y) * n1y + (z2 - cz - s1z) * n1z;
        if (dot1 > 0) {
          if (dot2 > 0) {
            index = numAddedClipVertices * 3;
            numAddedClipVertices++;
            this.clipVertices2[index] = x2;
            this.clipVertices2[index + 1] = y2;
            this.clipVertices2[index + 2] = z2;
          } else {
            index = numAddedClipVertices * 3;
            numAddedClipVertices++;
            t = dot1 / (dot1 - dot2);
            this.clipVertices2[index] = x1 + (x2 - x1) * t;
            this.clipVertices2[index + 1] = y1 + (y2 - y1) * t;
            this.clipVertices2[index + 2] = z1 + (z2 - z1) * t;
          }
        } else {
          if (dot2 > 0) {
            index = numAddedClipVertices * 3;
            numAddedClipVertices++;
            t = dot1 / (dot1 - dot2);
            this.clipVertices2[index] = x1 + (x2 - x1) * t;
            this.clipVertices2[index + 1] = y1 + (y2 - y1) * t;
            this.clipVertices2[index + 2] = z1 + (z2 - z1) * t;
            index = numAddedClipVertices * 3;
            numAddedClipVertices++;
            this.clipVertices2[index] = x2;
            this.clipVertices2[index + 1] = y2;
            this.clipVertices2[index + 2] = z2;
          }
        }
        x1 = x2;
        y1 = y2;
        z1 = z2;
        dot1 = dot2;
      }

      numClipVertices = numAddedClipVertices;
      if (numClipVertices == 0) return;
      numAddedClipVertices = 0;
      index = (numClipVertices - 1) * 3;
      x1 = this.clipVertices2[index];
      y1 = this.clipVertices2[index + 1];
      z1 = this.clipVertices2[index + 2];
      dot1 = (x1 - cx - s2x) * n2x + (y1 - cy - s2y) * n2y + (z1 - cz - s2z) * n2z;

      //i = numClipVertices;
      //while(i--){
      for (i = 0; i < numClipVertices; i++) {
        index = i * 3;
        x2 = this.clipVertices2[index];
        y2 = this.clipVertices2[index + 1];
        z2 = this.clipVertices2[index + 2];
        dot2 = (x2 - cx - s2x) * n2x + (y2 - cy - s2y) * n2y + (z2 - cz - s2z) * n2z;
        if (dot1 > 0) {
          if (dot2 > 0) {
            index = numAddedClipVertices * 3;
            numAddedClipVertices++;
            this.clipVertices1[index] = x2;
            this.clipVertices1[index + 1] = y2;
            this.clipVertices1[index + 2] = z2;
          } else {
            index = numAddedClipVertices * 3;
            numAddedClipVertices++;
            t = dot1 / (dot1 - dot2);
            this.clipVertices1[index] = x1 + (x2 - x1) * t;
            this.clipVertices1[index + 1] = y1 + (y2 - y1) * t;
            this.clipVertices1[index + 2] = z1 + (z2 - z1) * t;
          }
        } else {
          if (dot2 > 0) {
            index = numAddedClipVertices * 3;
            numAddedClipVertices++;
            t = dot1 / (dot1 - dot2);
            this.clipVertices1[index] = x1 + (x2 - x1) * t;
            this.clipVertices1[index + 1] = y1 + (y2 - y1) * t;
            this.clipVertices1[index + 2] = z1 + (z2 - z1) * t;
            index = numAddedClipVertices * 3;
            numAddedClipVertices++;
            this.clipVertices1[index] = x2;
            this.clipVertices1[index + 1] = y2;
            this.clipVertices1[index + 2] = z2;
          }
        }
        x1 = x2;
        y1 = y2;
        z1 = z2;
        dot1 = dot2;
      }

      numClipVertices = numAddedClipVertices;
      if (numClipVertices == 0) return;
      numAddedClipVertices = 0;
      index = (numClipVertices - 1) * 3;
      x1 = this.clipVertices1[index];
      y1 = this.clipVertices1[index + 1];
      z1 = this.clipVertices1[index + 2];
      dot1 = (x1 - cx + s1x) * -n1x + (y1 - cy + s1y) * -n1y + (z1 - cz + s1z) * -n1z;

      //i = numClipVertices;
      //while(i--){
      for (i = 0; i < numClipVertices; i++) {
        index = i * 3;
        x2 = this.clipVertices1[index];
        y2 = this.clipVertices1[index + 1];
        z2 = this.clipVertices1[index + 2];
        dot2 = (x2 - cx + s1x) * -n1x + (y2 - cy + s1y) * -n1y + (z2 - cz + s1z) * -n1z;
        if (dot1 > 0) {
          if (dot2 > 0) {
            index = numAddedClipVertices * 3;
            numAddedClipVertices++;
            this.clipVertices2[index] = x2;
            this.clipVertices2[index + 1] = y2;
            this.clipVertices2[index + 2] = z2;
          } else {
            index = numAddedClipVertices * 3;
            numAddedClipVertices++;
            t = dot1 / (dot1 - dot2);
            this.clipVertices2[index] = x1 + (x2 - x1) * t;
            this.clipVertices2[index + 1] = y1 + (y2 - y1) * t;
            this.clipVertices2[index + 2] = z1 + (z2 - z1) * t;
          }
        } else {
          if (dot2 > 0) {
            index = numAddedClipVertices * 3;
            numAddedClipVertices++;
            t = dot1 / (dot1 - dot2);
            this.clipVertices2[index] = x1 + (x2 - x1) * t;
            this.clipVertices2[index + 1] = y1 + (y2 - y1) * t;
            this.clipVertices2[index + 2] = z1 + (z2 - z1) * t;
            index = numAddedClipVertices * 3;
            numAddedClipVertices++;
            this.clipVertices2[index] = x2;
            this.clipVertices2[index + 1] = y2;
            this.clipVertices2[index + 2] = z2;
          }
        }
        x1 = x2;
        y1 = y2;
        z1 = z2;
        dot1 = dot2;
      }

      numClipVertices = numAddedClipVertices;
      if (numClipVertices == 0) return;
      numAddedClipVertices = 0;
      index = (numClipVertices - 1) * 3;
      x1 = this.clipVertices2[index];
      y1 = this.clipVertices2[index + 1];
      z1 = this.clipVertices2[index + 2];
      dot1 = (x1 - cx + s2x) * -n2x + (y1 - cy + s2y) * -n2y + (z1 - cz + s2z) * -n2z;

      //i = numClipVertices;
      //while(i--){
      for (i = 0; i < numClipVertices; i++) {
        index = i * 3;
        x2 = this.clipVertices2[index];
        y2 = this.clipVertices2[index + 1];
        z2 = this.clipVertices2[index + 2];
        dot2 = (x2 - cx + s2x) * -n2x + (y2 - cy + s2y) * -n2y + (z2 - cz + s2z) * -n2z;
        if (dot1 > 0) {
          if (dot2 > 0) {
            index = numAddedClipVertices * 3;
            numAddedClipVertices++;
            this.clipVertices1[index] = x2;
            this.clipVertices1[index + 1] = y2;
            this.clipVertices1[index + 2] = z2;
          } else {
            index = numAddedClipVertices * 3;
            numAddedClipVertices++;
            t = dot1 / (dot1 - dot2);
            this.clipVertices1[index] = x1 + (x2 - x1) * t;
            this.clipVertices1[index + 1] = y1 + (y2 - y1) * t;
            this.clipVertices1[index + 2] = z1 + (z2 - z1) * t;
          }
        } else {
          if (dot2 > 0) {
            index = numAddedClipVertices * 3;
            numAddedClipVertices++;
            t = dot1 / (dot1 - dot2);
            this.clipVertices1[index] = x1 + (x2 - x1) * t;
            this.clipVertices1[index + 1] = y1 + (y2 - y1) * t;
            this.clipVertices1[index + 2] = z1 + (z2 - z1) * t;
            index = numAddedClipVertices * 3;
            numAddedClipVertices++;
            this.clipVertices1[index] = x2;
            this.clipVertices1[index + 1] = y2;
            this.clipVertices1[index + 2] = z2;
          }
        }
        x1 = x2;
        y1 = y2;
        z1 = z2;
        dot1 = dot2;
      }

      numClipVertices = numAddedClipVertices;
      if (swap) {
        var tb = b1;
        b1 = b2;
        b2 = tb;
      }
      if (numClipVertices == 0) return;
      var flipped = b1 != shape1;
      if (numClipVertices > 4) {
        x1 = (q1x + q2x + q3x + q4x) * 0.25;
        y1 = (q1y + q2y + q3y + q4y) * 0.25;
        z1 = (q1z + q2z + q3z + q4z) * 0.25;
        n1x = q1x - x1;
        n1y = q1y - y1;
        n1z = q1z - z1;
        n2x = q2x - x1;
        n2y = q2y - y1;
        n2z = q2z - z1;
        var index1 = 0;
        var index2 = 0;
        var index3 = 0;
        var index4 = 0;
        var maxDot = -this.INF;
        minDot = this.INF;

        //i = numClipVertices;
        //while(i--){
        for (i = 0; i < numClipVertices; i++) {
          this.used[i] = false;
          index = i * 3;
          x1 = this.clipVertices1[index];
          y1 = this.clipVertices1[index + 1];
          z1 = this.clipVertices1[index + 2];
          dot = x1 * n1x + y1 * n1y + z1 * n1z;
          if (dot < minDot) {
            minDot = dot;
            index1 = i;
          }
          if (dot > maxDot) {
            maxDot = dot;
            index3 = i;
          }
        }

        this.used[index1] = true;
        this.used[index3] = true;
        maxDot = -this.INF;
        minDot = this.INF;

        //i = numClipVertices;
        //while(i--){
        for (i = 0; i < numClipVertices; i++) {
          if (this.used[i]) continue;
          index = i * 3;
          x1 = this.clipVertices1[index];
          y1 = this.clipVertices1[index + 1];
          z1 = this.clipVertices1[index + 2];
          dot = x1 * n2x + y1 * n2y + z1 * n2z;
          if (dot < minDot) {
            minDot = dot;
            index2 = i;
          }
          if (dot > maxDot) {
            maxDot = dot;
            index4 = i;
          }
        }

        index = index1 * 3;
        x1 = this.clipVertices1[index];
        y1 = this.clipVertices1[index + 1];
        z1 = this.clipVertices1[index + 2];
        dot = (x1 - cx) * nx + (y1 - cy) * ny + (z1 - cz) * nz;
        if (dot < 0) manifold.addPoint(x1, y1, z1, nx, ny, nz, dot, flipped);

        index = index2 * 3;
        x1 = this.clipVertices1[index];
        y1 = this.clipVertices1[index + 1];
        z1 = this.clipVertices1[index + 2];
        dot = (x1 - cx) * nx + (y1 - cy) * ny + (z1 - cz) * nz;
        if (dot < 0) manifold.addPoint(x1, y1, z1, nx, ny, nz, dot, flipped);

        index = index3 * 3;
        x1 = this.clipVertices1[index];
        y1 = this.clipVertices1[index + 1];
        z1 = this.clipVertices1[index + 2];
        dot = (x1 - cx) * nx + (y1 - cy) * ny + (z1 - cz) * nz;
        if (dot < 0) manifold.addPoint(x1, y1, z1, nx, ny, nz, dot, flipped);

        index = index4 * 3;
        x1 = this.clipVertices1[index];
        y1 = this.clipVertices1[index + 1];
        z1 = this.clipVertices1[index + 2];
        dot = (x1 - cx) * nx + (y1 - cy) * ny + (z1 - cz) * nz;
        if (dot < 0) manifold.addPoint(x1, y1, z1, nx, ny, nz, dot, flipped);

      } else {
        //i = numClipVertices;
        //while(i--){
        for (i = 0; i < numClipVertices; i++) {
          index = i * 3;
          x1 = this.clipVertices1[index];
          y1 = this.clipVertices1[index + 1];
          z1 = this.clipVertices1[index + 2];
          dot = (x1 - cx) * nx + (y1 - cy) * ny + (z1 - cz) * nz;
          if (dot < 0) manifold.addPoint(x1, y1, z1, nx, ny, nz, dot, flipped);
        }
      }

    }

  });

  function BoxCylinderCollisionDetector(flip) {

    CollisionDetector.call(this);
    this.flip = flip;

  }
  BoxCylinderCollisionDetector.prototype = Object.assign(Object.create(CollisionDetector.prototype), {

    constructor: BoxCylinderCollisionDetector,

    getSep: function (c1, c2, sep, pos, dep) {

      var t1x;
      var t1y;
      var t1z;
      var t2x;
      var t2y;
      var t2z;
      var sup = new Vec3();
      var len;
      var p1x;
      var p1y;
      var p1z;
      var p2x;
      var p2y;
      var p2z;
      var v01x = c1.position.x;
      var v01y = c1.position.y;
      var v01z = c1.position.z;
      var v02x = c2.position.x;
      var v02y = c2.position.y;
      var v02z = c2.position.z;
      var v0x = v02x - v01x;
      var v0y = v02y - v01y;
      var v0z = v02z - v01z;
      if (v0x * v0x + v0y * v0y + v0z * v0z == 0) v0y = 0.001;
      var nx = -v0x;
      var ny = -v0y;
      var nz = -v0z;
      this.supportPointB(c1, -nx, -ny, -nz, sup);
      var v11x = sup.x;
      var v11y = sup.y;
      var v11z = sup.z;
      this.supportPointC(c2, nx, ny, nz, sup);
      var v12x = sup.x;
      var v12y = sup.y;
      var v12z = sup.z;
      var v1x = v12x - v11x;
      var v1y = v12y - v11y;
      var v1z = v12z - v11z;
      if (v1x * nx + v1y * ny + v1z * nz <= 0) {
        return false;
      }
      nx = v1y * v0z - v1z * v0y;
      ny = v1z * v0x - v1x * v0z;
      nz = v1x * v0y - v1y * v0x;
      if (nx * nx + ny * ny + nz * nz == 0) {
        sep.set(v1x - v0x, v1y - v0y, v1z - v0z).normalize();
        pos.set((v11x + v12x) * 0.5, (v11y + v12y) * 0.5, (v11z + v12z) * 0.5);
        return true;
      }
      this.supportPointB(c1, -nx, -ny, -nz, sup);
      var v21x = sup.x;
      var v21y = sup.y;
      var v21z = sup.z;
      this.supportPointC(c2, nx, ny, nz, sup);
      var v22x = sup.x;
      var v22y = sup.y;
      var v22z = sup.z;
      var v2x = v22x - v21x;
      var v2y = v22y - v21y;
      var v2z = v22z - v21z;
      if (v2x * nx + v2y * ny + v2z * nz <= 0) {
        return false;
      }
      t1x = v1x - v0x;
      t1y = v1y - v0y;
      t1z = v1z - v0z;
      t2x = v2x - v0x;
      t2y = v2y - v0y;
      t2z = v2z - v0z;
      nx = t1y * t2z - t1z * t2y;
      ny = t1z * t2x - t1x * t2z;
      nz = t1x * t2y - t1y * t2x;
      if (nx * v0x + ny * v0y + nz * v0z > 0) {
        t1x = v1x;
        t1y = v1y;
        t1z = v1z;
        v1x = v2x;
        v1y = v2y;
        v1z = v2z;
        v2x = t1x;
        v2y = t1y;
        v2z = t1z;
        t1x = v11x;
        t1y = v11y;
        t1z = v11z;
        v11x = v21x;
        v11y = v21y;
        v11z = v21z;
        v21x = t1x;
        v21y = t1y;
        v21z = t1z;
        t1x = v12x;
        t1y = v12y;
        t1z = v12z;
        v12x = v22x;
        v12y = v22y;
        v12z = v22z;
        v22x = t1x;
        v22y = t1y;
        v22z = t1z;
        nx = -nx;
        ny = -ny;
        nz = -nz;
      }
      var iterations = 0;
      while (true) {
        if (++iterations > 100) {
          return false;
        }
        this.supportPointB(c1, -nx, -ny, -nz, sup);
        var v31x = sup.x;
        var v31y = sup.y;
        var v31z = sup.z;
        this.supportPointC(c2, nx, ny, nz, sup);
        var v32x = sup.x;
        var v32y = sup.y;
        var v32z = sup.z;
        var v3x = v32x - v31x;
        var v3y = v32y - v31y;
        var v3z = v32z - v31z;
        if (v3x * nx + v3y * ny + v3z * nz <= 0) {
          return false;
        }
        if ((v1y * v3z - v1z * v3y) * v0x + (v1z * v3x - v1x * v3z) * v0y + (v1x * v3y - v1y * v3x) * v0z < 0) {
          v2x = v3x;
          v2y = v3y;
          v2z = v3z;
          v21x = v31x;
          v21y = v31y;
          v21z = v31z;
          v22x = v32x;
          v22y = v32y;
          v22z = v32z;
          t1x = v1x - v0x;
          t1y = v1y - v0y;
          t1z = v1z - v0z;
          t2x = v3x - v0x;
          t2y = v3y - v0y;
          t2z = v3z - v0z;
          nx = t1y * t2z - t1z * t2y;
          ny = t1z * t2x - t1x * t2z;
          nz = t1x * t2y - t1y * t2x;
          continue;
        }
        if ((v3y * v2z - v3z * v2y) * v0x + (v3z * v2x - v3x * v2z) * v0y + (v3x * v2y - v3y * v2x) * v0z < 0) {
          v1x = v3x;
          v1y = v3y;
          v1z = v3z;
          v11x = v31x;
          v11y = v31y;
          v11z = v31z;
          v12x = v32x;
          v12y = v32y;
          v12z = v32z;
          t1x = v3x - v0x;
          t1y = v3y - v0y;
          t1z = v3z - v0z;
          t2x = v2x - v0x;
          t2y = v2y - v0y;
          t2z = v2z - v0z;
          nx = t1y * t2z - t1z * t2y;
          ny = t1z * t2x - t1x * t2z;
          nz = t1x * t2y - t1y * t2x;
          continue;
        }
        var hit = false;
        while (true) {
          t1x = v2x - v1x;
          t1y = v2y - v1y;
          t1z = v2z - v1z;
          t2x = v3x - v1x;
          t2y = v3y - v1y;
          t2z = v3z - v1z;
          nx = t1y * t2z - t1z * t2y;
          ny = t1z * t2x - t1x * t2z;
          nz = t1x * t2y - t1y * t2x;
          len = 1 / _Math.sqrt(nx * nx + ny * ny + nz * nz);
          nx *= len;
          ny *= len;
          nz *= len;
          if (nx * v1x + ny * v1y + nz * v1z >= 0 && !hit) {
            var b0 = (v1y * v2z - v1z * v2y) * v3x + (v1z * v2x - v1x * v2z) * v3y + (v1x * v2y - v1y * v2x) * v3z;
            var b1 = (v3y * v2z - v3z * v2y) * v0x + (v3z * v2x - v3x * v2z) * v0y + (v3x * v2y - v3y * v2x) * v0z;
            var b2 = (v0y * v1z - v0z * v1y) * v3x + (v0z * v1x - v0x * v1z) * v3y + (v0x * v1y - v0y * v1x) * v3z;
            var b3 = (v2y * v1z - v2z * v1y) * v0x + (v2z * v1x - v2x * v1z) * v0y + (v2x * v1y - v2y * v1x) * v0z;
            var sum = b0 + b1 + b2 + b3;
            if (sum <= 0) {
              b0 = 0;
              b1 = (v2y * v3z - v2z * v3y) * nx + (v2z * v3x - v2x * v3z) * ny + (v2x * v3y - v2y * v3x) * nz;
              b2 = (v3y * v2z - v3z * v2y) * nx + (v3z * v2x - v3x * v2z) * ny + (v3x * v2y - v3y * v2x) * nz;
              b3 = (v1y * v2z - v1z * v2y) * nx + (v1z * v2x - v1x * v2z) * ny + (v1x * v2y - v1y * v2x) * nz;
              sum = b1 + b2 + b3;
            }
            var inv = 1 / sum;
            p1x = (v01x * b0 + v11x * b1 + v21x * b2 + v31x * b3) * inv;
            p1y = (v01y * b0 + v11y * b1 + v21y * b2 + v31y * b3) * inv;
            p1z = (v01z * b0 + v11z * b1 + v21z * b2 + v31z * b3) * inv;
            p2x = (v02x * b0 + v12x * b1 + v22x * b2 + v32x * b3) * inv;
            p2y = (v02y * b0 + v12y * b1 + v22y * b2 + v32y * b3) * inv;
            p2z = (v02z * b0 + v12z * b1 + v22z * b2 + v32z * b3) * inv;
            hit = true;
          }
          this.supportPointB(c1, -nx, -ny, -nz, sup);
          var v41x = sup.x;
          var v41y = sup.y;
          var v41z = sup.z;
          this.supportPointC(c2, nx, ny, nz, sup);
          var v42x = sup.x;
          var v42y = sup.y;
          var v42z = sup.z;
          var v4x = v42x - v41x;
          var v4y = v42y - v41y;
          var v4z = v42z - v41z;
          var separation = -(v4x * nx + v4y * ny + v4z * nz);
          if ((v4x - v3x) * nx + (v4y - v3y) * ny + (v4z - v3z) * nz <= 0.01 || separation >= 0) {
            if (hit) {
              sep.set(-nx, -ny, -nz);
              pos.set((p1x + p2x) * 0.5, (p1y + p2y) * 0.5, (p1z + p2z) * 0.5);
              dep.x = separation;
              return true;
            }
            return false;
          }
          if (
            (v4y * v1z - v4z * v1y) * v0x +
            (v4z * v1x - v4x * v1z) * v0y +
            (v4x * v1y - v4y * v1x) * v0z < 0
          ) {
            if (
              (v4y * v2z - v4z * v2y) * v0x +
              (v4z * v2x - v4x * v2z) * v0y +
              (v4x * v2y - v4y * v2x) * v0z < 0
            ) {
              v1x = v4x;
              v1y = v4y;
              v1z = v4z;
              v11x = v41x;
              v11y = v41y;
              v11z = v41z;
              v12x = v42x;
              v12y = v42y;
              v12z = v42z;
            } else {
              v3x = v4x;
              v3y = v4y;
              v3z = v4z;
              v31x = v41x;
              v31y = v41y;
              v31z = v41z;
              v32x = v42x;
              v32y = v42y;
              v32z = v42z;
            }
          } else {
            if (
              (v4y * v3z - v4z * v3y) * v0x +
              (v4z * v3x - v4x * v3z) * v0y +
              (v4x * v3y - v4y * v3x) * v0z < 0
            ) {
              v2x = v4x;
              v2y = v4y;
              v2z = v4z;
              v21x = v41x;
              v21y = v41y;
              v21z = v41z;
              v22x = v42x;
              v22y = v42y;
              v22z = v42z;
            } else {
              v1x = v4x;
              v1y = v4y;
              v1z = v4z;
              v11x = v41x;
              v11y = v41y;
              v11z = v41z;
              v12x = v42x;
              v12y = v42y;
              v12z = v42z;
            }
          }
        }
      }
      //return false;
    },

    supportPointB: function (c, dx, dy, dz, out) {

      var rot = c.rotation.elements;
      var ldx = rot[0] * dx + rot[3] * dy + rot[6] * dz;
      var ldy = rot[1] * dx + rot[4] * dy + rot[7] * dz;
      var ldz = rot[2] * dx + rot[5] * dy + rot[8] * dz;
      var w = c.halfWidth;
      var h = c.halfHeight;
      var d = c.halfDepth;
      var ox;
      var oy;
      var oz;
      if (ldx < 0) ox = -w;
      else ox = w;
      if (ldy < 0) oy = -h;
      else oy = h;
      if (ldz < 0) oz = -d;
      else oz = d;
      ldx = rot[0] * ox + rot[1] * oy + rot[2] * oz + c.position.x;
      ldy = rot[3] * ox + rot[4] * oy + rot[5] * oz + c.position.y;
      ldz = rot[6] * ox + rot[7] * oy + rot[8] * oz + c.position.z;
      out.set(ldx, ldy, ldz);

    },

    supportPointC: function (c, dx, dy, dz, out) {

      var rot = c.rotation.elements;
      var ldx = rot[0] * dx + rot[3] * dy + rot[6] * dz;
      var ldy = rot[1] * dx + rot[4] * dy + rot[7] * dz;
      var ldz = rot[2] * dx + rot[5] * dy + rot[8] * dz;
      var radx = ldx;
      var radz = ldz;
      var len = radx * radx + radz * radz;
      var rad = c.radius;
      var hh = c.halfHeight;
      var ox;
      var oy;
      var oz;
      if (len == 0) {
        if (ldy < 0) {
          ox = rad;
          oy = -hh;
          oz = 0;
        } else {
          ox = rad;
          oy = hh;
          oz = 0;
        }
      } else {
        len = c.radius / _Math.sqrt(len);
        if (ldy < 0) {
          ox = radx * len;
          oy = -hh;
          oz = radz * len;
        } else {
          ox = radx * len;
          oy = hh;
          oz = radz * len;
        }
      }
      ldx = rot[0] * ox + rot[1] * oy + rot[2] * oz + c.position.x;
      ldy = rot[3] * ox + rot[4] * oy + rot[5] * oz + c.position.y;
      ldz = rot[6] * ox + rot[7] * oy + rot[8] * oz + c.position.z;
      out.set(ldx, ldy, ldz);

    },

    detectCollision: function (shape1, shape2, manifold) {

      var b;
      var c;
      if (this.flip) {
        b = shape2;
        c = shape1;
      } else {
        b = shape1;
        c = shape2;
      }
      var sep = new Vec3();
      var pos = new Vec3();
      var dep = new Vec3();

      if (!this.getSep(b, c, sep, pos, dep)) return;
      var pbx = b.position.x;
      var pby = b.position.y;
      var pbz = b.position.z;
      var pcx = c.position.x;
      var pcy = c.position.y;
      var pcz = c.position.z;
      var bw = b.halfWidth;
      var bh = b.halfHeight;
      var bd = b.halfDepth;
      var ch = c.halfHeight;
      var r = c.radius;

      var D = b.dimentions;

      var nwx = D[0];//b.normalDirectionWidth.x;
      var nwy = D[1];//b.normalDirectionWidth.y;
      var nwz = D[2];//b.normalDirectionWidth.z;
      var nhx = D[3];//b.normalDirectionHeight.x;
      var nhy = D[4];//b.normalDirectionHeight.y;
      var nhz = D[5];//b.normalDirectionHeight.z;
      var ndx = D[6];//b.normalDirectionDepth.x;
      var ndy = D[7];//b.normalDirectionDepth.y;
      var ndz = D[8];//b.normalDirectionDepth.z;

      var dwx = D[9];//b.halfDirectionWidth.x;
      var dwy = D[10];//b.halfDirectionWidth.y;
      var dwz = D[11];//b.halfDirectionWidth.z;
      var dhx = D[12];//b.halfDirectionHeight.x;
      var dhy = D[13];//b.halfDirectionHeight.y;
      var dhz = D[14];//b.halfDirectionHeight.z;
      var ddx = D[15];//b.halfDirectionDepth.x;
      var ddy = D[16];//b.halfDirectionDepth.y;
      var ddz = D[17];//b.halfDirectionDepth.z;

      var ncx = c.normalDirection.x;
      var ncy = c.normalDirection.y;
      var ncz = c.normalDirection.z;
      var dcx = c.halfDirection.x;
      var dcy = c.halfDirection.y;
      var dcz = c.halfDirection.z;
      var nx = sep.x;
      var ny = sep.y;
      var nz = sep.z;
      var dotw = nx * nwx + ny * nwy + nz * nwz;
      var doth = nx * nhx + ny * nhy + nz * nhz;
      var dotd = nx * ndx + ny * ndy + nz * ndz;
      var dotc = nx * ncx + ny * ncy + nz * ncz;
      var right1 = dotw > 0;
      var right2 = doth > 0;
      var right3 = dotd > 0;
      var right4 = dotc > 0;
      if (!right1) dotw = -dotw;
      if (!right2) doth = -doth;
      if (!right3) dotd = -dotd;
      if (!right4) dotc = -dotc;
      var state = 0;
      if (dotc > 0.999) {
        if (dotw > 0.999) {
          if (dotw > dotc) state = 1;
          else state = 4;
        } else if (doth > 0.999) {
          if (doth > dotc) state = 2;
          else state = 4;
        } else if (dotd > 0.999) {
          if (dotd > dotc) state = 3;
          else state = 4;
        } else state = 4;
      } else {
        if (dotw > 0.999) state = 1;
        else if (doth > 0.999) state = 2;
        else if (dotd > 0.999) state = 3;
      }
      var cbx;
      var cby;
      var cbz;
      var ccx;
      var ccy;
      var ccz;
      var r00;
      var r01;
      var r02;
      var r10;
      var r11;
      var r12;
      var r20;
      var r21;
      var r22;
      var px;
      var py;
      var pz;
      var pd;
      var dot;
      var len;
      var tx;
      var ty;
      var tz;
      var td;
      var dx;
      var dy;
      var dz;
      var d1x;
      var d1y;
      var d1z;
      var d2x;
      var d2y;
      var d2z;
      var sx;
      var sy;
      var sz;
      var sd;
      var ex;
      var ey;
      var ez;
      var ed;
      var dot1;
      var dot2;
      var t1;
      var dir1x;
      var dir1y;
      var dir1z;
      var dir2x;
      var dir2y;
      var dir2z;
      var dir1l;
      var dir2l;
      if (state == 0) {
        //manifold.addPoint(pos.x,pos.y,pos.z,nx,ny,nz,dep.x,b,c,0,0,false);
        manifold.addPoint(pos.x, pos.y, pos.z, nx, ny, nz, dep.x, this.flip);
      } else if (state == 4) {
        if (right4) {
          ccx = pcx - dcx;
          ccy = pcy - dcy;
          ccz = pcz - dcz;
          nx = -ncx;
          ny = -ncy;
          nz = -ncz;
        } else {
          ccx = pcx + dcx;
          ccy = pcy + dcy;
          ccz = pcz + dcz;
          nx = ncx;
          ny = ncy;
          nz = ncz;
        }
        var v1x;
        var v1y;
        var v1z;
        var v2x;
        var v2y;
        var v2z;
        var v3x;
        var v3y;
        var v3z;
        var v4x;
        var v4y;
        var v4z;

        dot = 1;
        state = 0;
        dot1 = nwx * nx + nwy * ny + nwz * nz;
        if (dot1 < dot) {
          dot = dot1;
          state = 0;
        }
        if (-dot1 < dot) {
          dot = -dot1;
          state = 1;
        }
        dot1 = nhx * nx + nhy * ny + nhz * nz;
        if (dot1 < dot) {
          dot = dot1;
          state = 2;
        }
        if (-dot1 < dot) {
          dot = -dot1;
          state = 3;
        }
        dot1 = ndx * nx + ndy * ny + ndz * nz;
        if (dot1 < dot) {
          dot = dot1;
          state = 4;
        }
        if (-dot1 < dot) {
          dot = -dot1;
          state = 5;
        }
        var v = b.elements;
        switch (state) {
          case 0:
            //v=b.vertex1;
            v1x = v[0];//v.x;
            v1y = v[1];//v.y;
            v1z = v[2];//v.z;
            //v=b.vertex3;
            v2x = v[6];//v.x;
            v2y = v[7];//v.y;
            v2z = v[8];//v.z;
            //v=b.vertex4;
            v3x = v[9];//v.x;
            v3y = v[10];//v.y;
            v3z = v[11];//v.z;
            //v=b.vertex2;
            v4x = v[3];//v.x;
            v4y = v[4];//v.y;
            v4z = v[5];//v.z;
            break;
          case 1:
            //v=b.vertex6;
            v1x = v[15];//v.x;
            v1y = v[16];//v.y;
            v1z = v[17];//v.z;
            //v=b.vertex8;
            v2x = v[21];//v.x;
            v2y = v[22];//v.y;
            v2z = v[23];//v.z;
            //v=b.vertex7;
            v3x = v[18];//v.x;
            v3y = v[19];//v.y;
            v3z = v[20];//v.z;
            //v=b.vertex5;
            v4x = v[12];//v.x;
            v4y = v[13];//v.y;
            v4z = v[14];//v.z;
            break;
          case 2:
            //v=b.vertex5;
            v1x = v[12];//v.x;
            v1y = v[13];//v.y;
            v1z = v[14];//v.z;
            //v=b.vertex1;
            v2x = v[0];//v.x;
            v2y = v[1];//v.y;
            v2z = v[2];//v.z;
            //v=b.vertex2;
            v3x = v[3];//v.x;
            v3y = v[4];//v.y;
            v3z = v[5];//v.z;
            //v=b.vertex6;
            v4x = v[15];//v.x;
            v4y = v[16];//v.y;
            v4z = v[17];//v.z;
            break;
          case 3:
            //v=b.vertex8;
            v1x = v[21];//v.x;
            v1y = v[22];//v.y;
            v1z = v[23];//v.z;
            //v=b.vertex4;
            v2x = v[9];//v.x;
            v2y = v[10];//v.y;
            v2z = v[11];//v.z;
            //v=b.vertex3;
            v3x = v[6];//v.x;
            v3y = v[7];//v.y;
            v3z = v[8];//v.z;
            //v=b.vertex7;
            v4x = v[18];//v.x;
            v4y = v[19];//v.y;
            v4z = v[20];//v.z;
            break;
          case 4:
            //v=b.vertex5;
            v1x = v[12];//v.x;
            v1y = v[13];//v.y;
            v1z = v[14];//v.z;
            //v=b.vertex7;
            v2x = v[18];//v.x;
            v2y = v[19];//v.y;
            v2z = v[20];//v.z;
            //v=b.vertex3;
            v3x = v[6];//v.x;
            v3y = v[7];//v.y;
            v3z = v[8];//v.z;
            //v=b.vertex1;
            v4x = v[0];//v.x;
            v4y = v[1];//v.y;
            v4z = v[2];//v.z;
            break;
          case 5:
            //v=b.vertex2;
            v1x = v[3];//v.x;
            v1y = v[4];//v.y;
            v1z = v[5];//v.z;
            //v=b.vertex4;
            v2x = v[9];//v.x;
            v2y = v[10];//v.y;
            v2z = v[11];//v.z;
            //v=b.vertex8;
            v3x = v[21];//v.x;
            v3y = v[22];//v.y;
            v3z = v[23];//v.z;
            //v=b.vertex6;
            v4x = v[15];//v.x;
            v4y = v[16];//v.y;
            v4z = v[17];//v.z;
            break;
        }
        pd = nx * (v1x - ccx) + ny * (v1y - ccy) + nz * (v1z - ccz);
        if (pd <= 0) manifold.addPoint(v1x, v1y, v1z, -nx, -ny, -nz, pd, this.flip);
        pd = nx * (v2x - ccx) + ny * (v2y - ccy) + nz * (v2z - ccz);
        if (pd <= 0) manifold.addPoint(v2x, v2y, v2z, -nx, -ny, -nz, pd, this.flip);
        pd = nx * (v3x - ccx) + ny * (v3y - ccy) + nz * (v3z - ccz);
        if (pd <= 0) manifold.addPoint(v3x, v3y, v3z, -nx, -ny, -nz, pd, this.flip);
        pd = nx * (v4x - ccx) + ny * (v4y - ccy) + nz * (v4z - ccz);
        if (pd <= 0) manifold.addPoint(v4x, v4y, v4z, -nx, -ny, -nz, pd, this.flip);
      } else {
        switch (state) {
          case 1:
            if (right1) {
              cbx = pbx + dwx;
              cby = pby + dwy;
              cbz = pbz + dwz;
              nx = nwx;
              ny = nwy;
              nz = nwz;
            } else {
              cbx = pbx - dwx;
              cby = pby - dwy;
              cbz = pbz - dwz;
              nx = -nwx;
              ny = -nwy;
              nz = -nwz;
            }
            dir1x = nhx;
            dir1y = nhy;
            dir1z = nhz;
            dir1l = bh;
            dir2x = ndx;
            dir2y = ndy;
            dir2z = ndz;
            dir2l = bd;
            break;
          case 2:
            if (right2) {
              cbx = pbx + dhx;
              cby = pby + dhy;
              cbz = pbz + dhz;
              nx = nhx;
              ny = nhy;
              nz = nhz;
            } else {
              cbx = pbx - dhx;
              cby = pby - dhy;
              cbz = pbz - dhz;
              nx = -nhx;
              ny = -nhy;
              nz = -nhz;
            }
            dir1x = nwx;
            dir1y = nwy;
            dir1z = nwz;
            dir1l = bw;
            dir2x = ndx;
            dir2y = ndy;
            dir2z = ndz;
            dir2l = bd;
            break;
          case 3:
            if (right3) {
              cbx = pbx + ddx;
              cby = pby + ddy;
              cbz = pbz + ddz;
              nx = ndx;
              ny = ndy;
              nz = ndz;
            } else {
              cbx = pbx - ddx;
              cby = pby - ddy;
              cbz = pbz - ddz;
              nx = -ndx;
              ny = -ndy;
              nz = -ndz;
            }
            dir1x = nwx;
            dir1y = nwy;
            dir1z = nwz;
            dir1l = bw;
            dir2x = nhx;
            dir2y = nhy;
            dir2z = nhz;
            dir2l = bh;
            break;
        }
        dot = nx * ncx + ny * ncy + nz * ncz;
        if (dot < 0) len = ch;
        else len = -ch;
        ccx = pcx + len * ncx;
        ccy = pcy + len * ncy;
        ccz = pcz + len * ncz;
        if (dotc >= 0.999999) {
          tx = -ny;
          ty = nz;
          tz = nx;
        } else {
          tx = nx;
          ty = ny;
          tz = nz;
        }
        len = tx * ncx + ty * ncy + tz * ncz;
        dx = len * ncx - tx;
        dy = len * ncy - ty;
        dz = len * ncz - tz;
        len = _Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (len == 0) return;
        len = r / len;
        dx *= len;
        dy *= len;
        dz *= len;
        tx = ccx + dx;
        ty = ccy + dy;
        tz = ccz + dz;
        if (dot < -0.96 || dot > 0.96) {
          r00 = ncx * ncx * 1.5 - 0.5;
          r01 = ncx * ncy * 1.5 - ncz * 0.866025403;
          r02 = ncx * ncz * 1.5 + ncy * 0.866025403;
          r10 = ncy * ncx * 1.5 + ncz * 0.866025403;
          r11 = ncy * ncy * 1.5 - 0.5;
          r12 = ncy * ncz * 1.5 - ncx * 0.866025403;
          r20 = ncz * ncx * 1.5 - ncy * 0.866025403;
          r21 = ncz * ncy * 1.5 + ncx * 0.866025403;
          r22 = ncz * ncz * 1.5 - 0.5;
          px = tx;
          py = ty;
          pz = tz;
          pd = nx * (px - cbx) + ny * (py - cby) + nz * (pz - cbz);
          tx = px - pd * nx - cbx;
          ty = py - pd * ny - cby;
          tz = pz - pd * nz - cbz;
          sd = dir1x * tx + dir1y * ty + dir1z * tz;
          ed = dir2x * tx + dir2y * ty + dir2z * tz;
          if (sd < -dir1l) sd = -dir1l;
          else if (sd > dir1l) sd = dir1l;
          if (ed < -dir2l) ed = -dir2l;
          else if (ed > dir2l) ed = dir2l;
          tx = sd * dir1x + ed * dir2x;
          ty = sd * dir1y + ed * dir2y;
          tz = sd * dir1z + ed * dir2z;
          px = cbx + tx;
          py = cby + ty;
          pz = cbz + tz;
          manifold.addPoint(px, py, pz, nx, ny, nz, pd, this.flip);
          px = dx * r00 + dy * r01 + dz * r02;
          py = dx * r10 + dy * r11 + dz * r12;
          pz = dx * r20 + dy * r21 + dz * r22;
          px = (dx = px) + ccx;
          py = (dy = py) + ccy;
          pz = (dz = pz) + ccz;
          pd = nx * (px - cbx) + ny * (py - cby) + nz * (pz - cbz);
          if (pd <= 0) {
            tx = px - pd * nx - cbx;
            ty = py - pd * ny - cby;
            tz = pz - pd * nz - cbz;
            sd = dir1x * tx + dir1y * ty + dir1z * tz;
            ed = dir2x * tx + dir2y * ty + dir2z * tz;
            if (sd < -dir1l) sd = -dir1l;
            else if (sd > dir1l) sd = dir1l;
            if (ed < -dir2l) ed = -dir2l;
            else if (ed > dir2l) ed = dir2l;
            tx = sd * dir1x + ed * dir2x;
            ty = sd * dir1y + ed * dir2y;
            tz = sd * dir1z + ed * dir2z;
            px = cbx + tx;
            py = cby + ty;
            pz = cbz + tz;
            //manifold.addPoint(px,py,pz,nx,ny,nz,pd,b,c,2,0,false);
            manifold.addPoint(px, py, pz, nx, ny, nz, pd, this.flip);
          }
          px = dx * r00 + dy * r01 + dz * r02;
          py = dx * r10 + dy * r11 + dz * r12;
          pz = dx * r20 + dy * r21 + dz * r22;
          px = (dx = px) + ccx;
          py = (dy = py) + ccy;
          pz = (dz = pz) + ccz;
          pd = nx * (px - cbx) + ny * (py - cby) + nz * (pz - cbz);
          if (pd <= 0) {
            tx = px - pd * nx - cbx;
            ty = py - pd * ny - cby;
            tz = pz - pd * nz - cbz;
            sd = dir1x * tx + dir1y * ty + dir1z * tz;
            ed = dir2x * tx + dir2y * ty + dir2z * tz;
            if (sd < -dir1l) sd = -dir1l;
            else if (sd > dir1l) sd = dir1l;
            if (ed < -dir2l) ed = -dir2l;
            else if (ed > dir2l) ed = dir2l;
            tx = sd * dir1x + ed * dir2x;
            ty = sd * dir1y + ed * dir2y;
            tz = sd * dir1z + ed * dir2z;
            px = cbx + tx;
            py = cby + ty;
            pz = cbz + tz;
            //manifold.addPoint(px,py,pz,nx,ny,nz,pd,b,c,3,0,false);
            manifold.addPoint(px, py, pz, nx, ny, nz, pd, this.flip);
          }
        } else {
          sx = tx;
          sy = ty;
          sz = tz;
          sd = nx * (sx - cbx) + ny * (sy - cby) + nz * (sz - cbz);
          sx -= sd * nx;
          sy -= sd * ny;
          sz -= sd * nz;
          if (dot > 0) {
            ex = tx + dcx * 2;
            ey = ty + dcy * 2;
            ez = tz + dcz * 2;
          } else {
            ex = tx - dcx * 2;
            ey = ty - dcy * 2;
            ez = tz - dcz * 2;
          }
          ed = nx * (ex - cbx) + ny * (ey - cby) + nz * (ez - cbz);
          ex -= ed * nx;
          ey -= ed * ny;
          ez -= ed * nz;
          d1x = sx - cbx;
          d1y = sy - cby;
          d1z = sz - cbz;
          d2x = ex - cbx;
          d2y = ey - cby;
          d2z = ez - cbz;
          tx = ex - sx;
          ty = ey - sy;
          tz = ez - sz;
          td = ed - sd;
          dotw = d1x * dir1x + d1y * dir1y + d1z * dir1z;
          doth = d2x * dir1x + d2y * dir1y + d2z * dir1z;
          dot1 = dotw - dir1l;
          dot2 = doth - dir1l;
          if (dot1 > 0) {
            if (dot2 > 0) return;
            t1 = dot1 / (dot1 - dot2);
            sx = sx + tx * t1;
            sy = sy + ty * t1;
            sz = sz + tz * t1;
            sd = sd + td * t1;
            d1x = sx - cbx;
            d1y = sy - cby;
            d1z = sz - cbz;
            dotw = d1x * dir1x + d1y * dir1y + d1z * dir1z;
            tx = ex - sx;
            ty = ey - sy;
            tz = ez - sz;
            td = ed - sd;
          } else if (dot2 > 0) {
            t1 = dot1 / (dot1 - dot2);
            ex = sx + tx * t1;
            ey = sy + ty * t1;
            ez = sz + tz * t1;
            ed = sd + td * t1;
            d2x = ex - cbx;
            d2y = ey - cby;
            d2z = ez - cbz;
            doth = d2x * dir1x + d2y * dir1y + d2z * dir1z;
            tx = ex - sx;
            ty = ey - sy;
            tz = ez - sz;
            td = ed - sd;
          }
          dot1 = dotw + dir1l;
          dot2 = doth + dir1l;
          if (dot1 < 0) {
            if (dot2 < 0) return;
            t1 = dot1 / (dot1 - dot2);
            sx = sx + tx * t1;
            sy = sy + ty * t1;
            sz = sz + tz * t1;
            sd = sd + td * t1;
            d1x = sx - cbx;
            d1y = sy - cby;
            d1z = sz - cbz;
            tx = ex - sx;
            ty = ey - sy;
            tz = ez - sz;
            td = ed - sd;
          } else if (dot2 < 0) {
            t1 = dot1 / (dot1 - dot2);
            ex = sx + tx * t1;
            ey = sy + ty * t1;
            ez = sz + tz * t1;
            ed = sd + td * t1;
            d2x = ex - cbx;
            d2y = ey - cby;
            d2z = ez - cbz;
            tx = ex - sx;
            ty = ey - sy;
            tz = ez - sz;
            td = ed - sd;
          }
          dotw = d1x * dir2x + d1y * dir2y + d1z * dir2z;
          doth = d2x * dir2x + d2y * dir2y + d2z * dir2z;
          dot1 = dotw - dir2l;
          dot2 = doth - dir2l;
          if (dot1 > 0) {
            if (dot2 > 0) return;
            t1 = dot1 / (dot1 - dot2);
            sx = sx + tx * t1;
            sy = sy + ty * t1;
            sz = sz + tz * t1;
            sd = sd + td * t1;
            d1x = sx - cbx;
            d1y = sy - cby;
            d1z = sz - cbz;
            dotw = d1x * dir2x + d1y * dir2y + d1z * dir2z;
            tx = ex - sx;
            ty = ey - sy;
            tz = ez - sz;
            td = ed - sd;
          } else if (dot2 > 0) {
            t1 = dot1 / (dot1 - dot2);
            ex = sx + tx * t1;
            ey = sy + ty * t1;
            ez = sz + tz * t1;
            ed = sd + td * t1;
            d2x = ex - cbx;
            d2y = ey - cby;
            d2z = ez - cbz;
            doth = d2x * dir2x + d2y * dir2y + d2z * dir2z;
            tx = ex - sx;
            ty = ey - sy;
            tz = ez - sz;
            td = ed - sd;
          }
          dot1 = dotw + dir2l;
          dot2 = doth + dir2l;
          if (dot1 < 0) {
            if (dot2 < 0) return;
            t1 = dot1 / (dot1 - dot2);
            sx = sx + tx * t1;
            sy = sy + ty * t1;
            sz = sz + tz * t1;
            sd = sd + td * t1;
          } else if (dot2 < 0) {
            t1 = dot1 / (dot1 - dot2);
            ex = sx + tx * t1;
            ey = sy + ty * t1;
            ez = sz + tz * t1;
            ed = sd + td * t1;
          }
          if (sd < 0) {
            //manifold.addPoint(sx,sy,sz,nx,ny,nz,sd,b,c,1,0,false);
            manifold.addPoint(sx, sy, sz, nx, ny, nz, sd, this.flip);
          }
          if (ed < 0) {
            //manifold.addPoint(ex,ey,ez,nx,ny,nz,ed,b,c,4,0,false);
            manifold.addPoint(ex, ey, ez, nx, ny, nz, ed, this.flip);
          }
        }
      }

    }

  });

  function CylinderCylinderCollisionDetector() {

    CollisionDetector.call(this);

  }
  CylinderCylinderCollisionDetector.prototype = Object.assign(Object.create(CollisionDetector.prototype), {

    constructor: CylinderCylinderCollisionDetector,


    getSep: function (c1, c2, sep, pos, dep) {

      var t1x;
      var t1y;
      var t1z;
      var t2x;
      var t2y;
      var t2z;
      var sup = new Vec3();
      var len;
      var p1x;
      var p1y;
      var p1z;
      var p2x;
      var p2y;
      var p2z;
      var v01x = c1.position.x;
      var v01y = c1.position.y;
      var v01z = c1.position.z;
      var v02x = c2.position.x;
      var v02y = c2.position.y;
      var v02z = c2.position.z;
      var v0x = v02x - v01x;
      var v0y = v02y - v01y;
      var v0z = v02z - v01z;
      if (v0x * v0x + v0y * v0y + v0z * v0z == 0) v0y = 0.001;
      var nx = -v0x;
      var ny = -v0y;
      var nz = -v0z;
      this.supportPoint(c1, -nx, -ny, -nz, sup);
      var v11x = sup.x;
      var v11y = sup.y;
      var v11z = sup.z;
      this.supportPoint(c2, nx, ny, nz, sup);
      var v12x = sup.x;
      var v12y = sup.y;
      var v12z = sup.z;
      var v1x = v12x - v11x;
      var v1y = v12y - v11y;
      var v1z = v12z - v11z;
      if (v1x * nx + v1y * ny + v1z * nz <= 0) {
        return false;
      }
      nx = v1y * v0z - v1z * v0y;
      ny = v1z * v0x - v1x * v0z;
      nz = v1x * v0y - v1y * v0x;
      if (nx * nx + ny * ny + nz * nz == 0) {
        sep.set(v1x - v0x, v1y - v0y, v1z - v0z).normalize();
        pos.set((v11x + v12x) * 0.5, (v11y + v12y) * 0.5, (v11z + v12z) * 0.5);
        return true;
      }
      this.supportPoint(c1, -nx, -ny, -nz, sup);
      var v21x = sup.x;
      var v21y = sup.y;
      var v21z = sup.z;
      this.supportPoint(c2, nx, ny, nz, sup);
      var v22x = sup.x;
      var v22y = sup.y;
      var v22z = sup.z;
      var v2x = v22x - v21x;
      var v2y = v22y - v21y;
      var v2z = v22z - v21z;
      if (v2x * nx + v2y * ny + v2z * nz <= 0) {
        return false;
      }
      t1x = v1x - v0x;
      t1y = v1y - v0y;
      t1z = v1z - v0z;
      t2x = v2x - v0x;
      t2y = v2y - v0y;
      t2z = v2z - v0z;
      nx = t1y * t2z - t1z * t2y;
      ny = t1z * t2x - t1x * t2z;
      nz = t1x * t2y - t1y * t2x;
      if (nx * v0x + ny * v0y + nz * v0z > 0) {
        t1x = v1x;
        t1y = v1y;
        t1z = v1z;
        v1x = v2x;
        v1y = v2y;
        v1z = v2z;
        v2x = t1x;
        v2y = t1y;
        v2z = t1z;
        t1x = v11x;
        t1y = v11y;
        t1z = v11z;
        v11x = v21x;
        v11y = v21y;
        v11z = v21z;
        v21x = t1x;
        v21y = t1y;
        v21z = t1z;
        t1x = v12x;
        t1y = v12y;
        t1z = v12z;
        v12x = v22x;
        v12y = v22y;
        v12z = v22z;
        v22x = t1x;
        v22y = t1y;
        v22z = t1z;
        nx = -nx;
        ny = -ny;
        nz = -nz;
      }
      var iterations = 0;
      while (true) {
        if (++iterations > 100) {
          return false;
        }
        this.supportPoint(c1, -nx, -ny, -nz, sup);
        var v31x = sup.x;
        var v31y = sup.y;
        var v31z = sup.z;
        this.supportPoint(c2, nx, ny, nz, sup);
        var v32x = sup.x;
        var v32y = sup.y;
        var v32z = sup.z;
        var v3x = v32x - v31x;
        var v3y = v32y - v31y;
        var v3z = v32z - v31z;
        if (v3x * nx + v3y * ny + v3z * nz <= 0) {
          return false;
        }
        if ((v1y * v3z - v1z * v3y) * v0x + (v1z * v3x - v1x * v3z) * v0y + (v1x * v3y - v1y * v3x) * v0z < 0) {
          v2x = v3x;
          v2y = v3y;
          v2z = v3z;
          v21x = v31x;
          v21y = v31y;
          v21z = v31z;
          v22x = v32x;
          v22y = v32y;
          v22z = v32z;
          t1x = v1x - v0x;
          t1y = v1y - v0y;
          t1z = v1z - v0z;
          t2x = v3x - v0x;
          t2y = v3y - v0y;
          t2z = v3z - v0z;
          nx = t1y * t2z - t1z * t2y;
          ny = t1z * t2x - t1x * t2z;
          nz = t1x * t2y - t1y * t2x;
          continue;
        }
        if ((v3y * v2z - v3z * v2y) * v0x + (v3z * v2x - v3x * v2z) * v0y + (v3x * v2y - v3y * v2x) * v0z < 0) {
          v1x = v3x;
          v1y = v3y;
          v1z = v3z;
          v11x = v31x;
          v11y = v31y;
          v11z = v31z;
          v12x = v32x;
          v12y = v32y;
          v12z = v32z;
          t1x = v3x - v0x;
          t1y = v3y - v0y;
          t1z = v3z - v0z;
          t2x = v2x - v0x;
          t2y = v2y - v0y;
          t2z = v2z - v0z;
          nx = t1y * t2z - t1z * t2y;
          ny = t1z * t2x - t1x * t2z;
          nz = t1x * t2y - t1y * t2x;
          continue;
        }
        var hit = false;
        while (true) {
          t1x = v2x - v1x;
          t1y = v2y - v1y;
          t1z = v2z - v1z;
          t2x = v3x - v1x;
          t2y = v3y - v1y;
          t2z = v3z - v1z;
          nx = t1y * t2z - t1z * t2y;
          ny = t1z * t2x - t1x * t2z;
          nz = t1x * t2y - t1y * t2x;
          len = 1 / _Math.sqrt(nx * nx + ny * ny + nz * nz);
          nx *= len;
          ny *= len;
          nz *= len;
          if (nx * v1x + ny * v1y + nz * v1z >= 0 && !hit) {
            var b0 = (v1y * v2z - v1z * v2y) * v3x + (v1z * v2x - v1x * v2z) * v3y + (v1x * v2y - v1y * v2x) * v3z;
            var b1 = (v3y * v2z - v3z * v2y) * v0x + (v3z * v2x - v3x * v2z) * v0y + (v3x * v2y - v3y * v2x) * v0z;
            var b2 = (v0y * v1z - v0z * v1y) * v3x + (v0z * v1x - v0x * v1z) * v3y + (v0x * v1y - v0y * v1x) * v3z;
            var b3 = (v2y * v1z - v2z * v1y) * v0x + (v2z * v1x - v2x * v1z) * v0y + (v2x * v1y - v2y * v1x) * v0z;
            var sum = b0 + b1 + b2 + b3;
            if (sum <= 0) {
              b0 = 0;
              b1 = (v2y * v3z - v2z * v3y) * nx + (v2z * v3x - v2x * v3z) * ny + (v2x * v3y - v2y * v3x) * nz;
              b2 = (v3y * v2z - v3z * v2y) * nx + (v3z * v2x - v3x * v2z) * ny + (v3x * v2y - v3y * v2x) * nz;
              b3 = (v1y * v2z - v1z * v2y) * nx + (v1z * v2x - v1x * v2z) * ny + (v1x * v2y - v1y * v2x) * nz;
              sum = b1 + b2 + b3;
            }
            var inv = 1 / sum;
            p1x = (v01x * b0 + v11x * b1 + v21x * b2 + v31x * b3) * inv;
            p1y = (v01y * b0 + v11y * b1 + v21y * b2 + v31y * b3) * inv;
            p1z = (v01z * b0 + v11z * b1 + v21z * b2 + v31z * b3) * inv;
            p2x = (v02x * b0 + v12x * b1 + v22x * b2 + v32x * b3) * inv;
            p2y = (v02y * b0 + v12y * b1 + v22y * b2 + v32y * b3) * inv;
            p2z = (v02z * b0 + v12z * b1 + v22z * b2 + v32z * b3) * inv;
            hit = true;
          }
          this.supportPoint(c1, -nx, -ny, -nz, sup);
          var v41x = sup.x;
          var v41y = sup.y;
          var v41z = sup.z;
          this.supportPoint(c2, nx, ny, nz, sup);
          var v42x = sup.x;
          var v42y = sup.y;
          var v42z = sup.z;
          var v4x = v42x - v41x;
          var v4y = v42y - v41y;
          var v4z = v42z - v41z;
          var separation = -(v4x * nx + v4y * ny + v4z * nz);
          if ((v4x - v3x) * nx + (v4y - v3y) * ny + (v4z - v3z) * nz <= 0.01 || separation >= 0) {
            if (hit) {
              sep.set(-nx, -ny, -nz);
              pos.set((p1x + p2x) * 0.5, (p1y + p2y) * 0.5, (p1z + p2z) * 0.5);
              dep.x = separation;
              return true;
            }
            return false;
          }
          if (
            (v4y * v1z - v4z * v1y) * v0x +
            (v4z * v1x - v4x * v1z) * v0y +
            (v4x * v1y - v4y * v1x) * v0z < 0
          ) {
            if (
              (v4y * v2z - v4z * v2y) * v0x +
              (v4z * v2x - v4x * v2z) * v0y +
              (v4x * v2y - v4y * v2x) * v0z < 0
            ) {
              v1x = v4x;
              v1y = v4y;
              v1z = v4z;
              v11x = v41x;
              v11y = v41y;
              v11z = v41z;
              v12x = v42x;
              v12y = v42y;
              v12z = v42z;
            } else {
              v3x = v4x;
              v3y = v4y;
              v3z = v4z;
              v31x = v41x;
              v31y = v41y;
              v31z = v41z;
              v32x = v42x;
              v32y = v42y;
              v32z = v42z;
            }
          } else {
            if (
              (v4y * v3z - v4z * v3y) * v0x +
              (v4z * v3x - v4x * v3z) * v0y +
              (v4x * v3y - v4y * v3x) * v0z < 0
            ) {
              v2x = v4x;
              v2y = v4y;
              v2z = v4z;
              v21x = v41x;
              v21y = v41y;
              v21z = v41z;
              v22x = v42x;
              v22y = v42y;
              v22z = v42z;
            } else {
              v1x = v4x;
              v1y = v4y;
              v1z = v4z;
              v11x = v41x;
              v11y = v41y;
              v11z = v41z;
              v12x = v42x;
              v12y = v42y;
              v12z = v42z;
            }
          }
        }
      }
      //return false;
    },

    supportPoint: function (c, dx, dy, dz, out) {

      var rot = c.rotation.elements;
      var ldx = rot[0] * dx + rot[3] * dy + rot[6] * dz;
      var ldy = rot[1] * dx + rot[4] * dy + rot[7] * dz;
      var ldz = rot[2] * dx + rot[5] * dy + rot[8] * dz;
      var radx = ldx;
      var radz = ldz;
      var len = radx * radx + radz * radz;
      var rad = c.radius;
      var hh = c.halfHeight;
      var ox;
      var oy;
      var oz;
      if (len == 0) {
        if (ldy < 0) {
          ox = rad;
          oy = -hh;
          oz = 0;
        } else {
          ox = rad;
          oy = hh;
          oz = 0;
        }
      } else {
        len = c.radius / _Math.sqrt(len);
        if (ldy < 0) {
          ox = radx * len;
          oy = -hh;
          oz = radz * len;
        } else {
          ox = radx * len;
          oy = hh;
          oz = radz * len;
        }
      }
      ldx = rot[0] * ox + rot[1] * oy + rot[2] * oz + c.position.x;
      ldy = rot[3] * ox + rot[4] * oy + rot[5] * oz + c.position.y;
      ldz = rot[6] * ox + rot[7] * oy + rot[8] * oz + c.position.z;
      out.set(ldx, ldy, ldz);

    },

    detectCollision: function (shape1, shape2, manifold) {

      var c1;
      var c2;
      if (shape1.id < shape2.id) {
        c1 = shape1;
        c2 = shape2;
      } else {
        c1 = shape2;
        c2 = shape1;
      }
      var p1 = c1.position;
      var p2 = c2.position;
      var p1x = p1.x;
      var p1y = p1.y;
      var p1z = p1.z;
      var p2x = p2.x;
      var p2y = p2.y;
      var p2z = p2.z;
      var h1 = c1.halfHeight;
      var h2 = c2.halfHeight;
      var n1 = c1.normalDirection;
      var n2 = c2.normalDirection;
      var d1 = c1.halfDirection;
      var d2 = c2.halfDirection;
      var r1 = c1.radius;
      var r2 = c2.radius;
      var n1x = n1.x;
      var n1y = n1.y;
      var n1z = n1.z;
      var n2x = n2.x;
      var n2y = n2.y;
      var n2z = n2.z;
      var d1x = d1.x;
      var d1y = d1.y;
      var d1z = d1.z;
      var d2x = d2.x;
      var d2y = d2.y;
      var d2z = d2.z;
      var dx = p1x - p2x;
      var dy = p1y - p2y;
      var dz = p1z - p2z;
      var len;
      var c1x;
      var c1y;
      var c1z;
      var c2x;
      var c2y;
      var c2z;
      var tx;
      var ty;
      var tz;
      var sx;
      var sy;
      var sz;
      var ex;
      var ey;
      var ez;
      var depth1;
      var depth2;
      var dot;
      var t1;
      var t2;
      var sep = new Vec3();
      var pos = new Vec3();
      var dep = new Vec3();
      if (!this.getSep(c1, c2, sep, pos, dep)) return;
      var dot1 = sep.x * n1x + sep.y * n1y + sep.z * n1z;
      var dot2 = sep.x * n2x + sep.y * n2y + sep.z * n2z;
      var right1 = dot1 > 0;
      var right2 = dot2 > 0;
      if (!right1) dot1 = -dot1;
      if (!right2) dot2 = -dot2;
      var state = 0;
      if (dot1 > 0.999 || dot2 > 0.999) {
        if (dot1 > dot2) state = 1;
        else state = 2;
      }
      var nx;
      var ny;
      var nz;
      var depth = dep.x;
      var r00;
      var r01;
      var r02;
      var r10;
      var r11;
      var r12;
      var r20;
      var r21;
      var r22;
      var px;
      var py;
      var pz;
      var pd;
      var a;
      var b;
      var e;
      var f;
      nx = sep.x;
      ny = sep.y;
      nz = sep.z;
      switch (state) {
        case 0:
          manifold.addPoint(pos.x, pos.y, pos.z, nx, ny, nz, depth, false);
          break;
        case 1:
          if (right1) {
            c1x = p1x + d1x;
            c1y = p1y + d1y;
            c1z = p1z + d1z;
            nx = n1x;
            ny = n1y;
            nz = n1z;
          } else {
            c1x = p1x - d1x;
            c1y = p1y - d1y;
            c1z = p1z - d1z;
            nx = -n1x;
            ny = -n1y;
            nz = -n1z;
          }
          dot = nx * n2x + ny * n2y + nz * n2z;
          if (dot < 0) len = h2;
          else len = -h2;
          c2x = p2x + len * n2x;
          c2y = p2y + len * n2y;
          c2z = p2z + len * n2z;
          if (dot2 >= 0.999999) {
            tx = -ny;
            ty = nz;
            tz = nx;
          } else {
            tx = nx;
            ty = ny;
            tz = nz;
          }
          len = tx * n2x + ty * n2y + tz * n2z;
          dx = len * n2x - tx;
          dy = len * n2y - ty;
          dz = len * n2z - tz;
          len = _Math.sqrt(dx * dx + dy * dy + dz * dz);
          if (len == 0) break;
          len = r2 / len;
          dx *= len;
          dy *= len;
          dz *= len;
          tx = c2x + dx;
          ty = c2y + dy;
          tz = c2z + dz;
          if (dot < -0.96 || dot > 0.96) {
            r00 = n2x * n2x * 1.5 - 0.5;
            r01 = n2x * n2y * 1.5 - n2z * 0.866025403;
            r02 = n2x * n2z * 1.5 + n2y * 0.866025403;
            r10 = n2y * n2x * 1.5 + n2z * 0.866025403;
            r11 = n2y * n2y * 1.5 - 0.5;
            r12 = n2y * n2z * 1.5 - n2x * 0.866025403;
            r20 = n2z * n2x * 1.5 - n2y * 0.866025403;
            r21 = n2z * n2y * 1.5 + n2x * 0.866025403;
            r22 = n2z * n2z * 1.5 - 0.5;
            px = tx;
            py = ty;
            pz = tz;
            pd = nx * (px - c1x) + ny * (py - c1y) + nz * (pz - c1z);
            tx = px - pd * nx - c1x;
            ty = py - pd * ny - c1y;
            tz = pz - pd * nz - c1z;
            len = tx * tx + ty * ty + tz * tz;
            if (len > r1 * r1) {
              len = r1 / _Math.sqrt(len);
              tx *= len;
              ty *= len;
              tz *= len;
            }
            px = c1x + tx;
            py = c1y + ty;
            pz = c1z + tz;
            manifold.addPoint(px, py, pz, nx, ny, nz, pd, false);
            px = dx * r00 + dy * r01 + dz * r02;
            py = dx * r10 + dy * r11 + dz * r12;
            pz = dx * r20 + dy * r21 + dz * r22;
            px = (dx = px) + c2x;
            py = (dy = py) + c2y;
            pz = (dz = pz) + c2z;
            pd = nx * (px - c1x) + ny * (py - c1y) + nz * (pz - c1z);
            if (pd <= 0) {
              tx = px - pd * nx - c1x;
              ty = py - pd * ny - c1y;
              tz = pz - pd * nz - c1z;
              len = tx * tx + ty * ty + tz * tz;
              if (len > r1 * r1) {
                len = r1 / _Math.sqrt(len);
                tx *= len;
                ty *= len;
                tz *= len;
              }
              px = c1x + tx;
              py = c1y + ty;
              pz = c1z + tz;
              manifold.addPoint(px, py, pz, nx, ny, nz, pd, false);
            }
            px = dx * r00 + dy * r01 + dz * r02;
            py = dx * r10 + dy * r11 + dz * r12;
            pz = dx * r20 + dy * r21 + dz * r22;
            px = (dx = px) + c2x;
            py = (dy = py) + c2y;
            pz = (dz = pz) + c2z;
            pd = nx * (px - c1x) + ny * (py - c1y) + nz * (pz - c1z);
            if (pd <= 0) {
              tx = px - pd * nx - c1x;
              ty = py - pd * ny - c1y;
              tz = pz - pd * nz - c1z;
              len = tx * tx + ty * ty + tz * tz;
              if (len > r1 * r1) {
                len = r1 / _Math.sqrt(len);
                tx *= len;
                ty *= len;
                tz *= len;
              }
              px = c1x + tx;
              py = c1y + ty;
              pz = c1z + tz;
              manifold.addPoint(px, py, pz, nx, ny, nz, pd, false);
            }
          } else {
            sx = tx;
            sy = ty;
            sz = tz;
            depth1 = nx * (sx - c1x) + ny * (sy - c1y) + nz * (sz - c1z);
            sx -= depth1 * nx;
            sy -= depth1 * ny;
            sz -= depth1 * nz;
            if (dot > 0) {
              ex = tx + n2x * h2 * 2;
              ey = ty + n2y * h2 * 2;
              ez = tz + n2z * h2 * 2;
            } else {
              ex = tx - n2x * h2 * 2;
              ey = ty - n2y * h2 * 2;
              ez = tz - n2z * h2 * 2;
            }
            depth2 = nx * (ex - c1x) + ny * (ey - c1y) + nz * (ez - c1z);
            ex -= depth2 * nx;
            ey -= depth2 * ny;
            ez -= depth2 * nz;
            dx = c1x - sx;
            dy = c1y - sy;
            dz = c1z - sz;
            tx = ex - sx;
            ty = ey - sy;
            tz = ez - sz;
            a = dx * dx + dy * dy + dz * dz;
            b = dx * tx + dy * ty + dz * tz;
            e = tx * tx + ty * ty + tz * tz;
            f = b * b - e * (a - r1 * r1);
            if (f < 0) break;
            f = _Math.sqrt(f);
            t1 = (b + f) / e;
            t2 = (b - f) / e;
            if (t2 < t1) {
              len = t1;
              t1 = t2;
              t2 = len;
            }
            if (t2 > 1) t2 = 1;
            if (t1 < 0) t1 = 0;
            tx = sx + (ex - sx) * t1;
            ty = sy + (ey - sy) * t1;
            tz = sz + (ez - sz) * t1;
            ex = sx + (ex - sx) * t2;
            ey = sy + (ey - sy) * t2;
            ez = sz + (ez - sz) * t2;
            sx = tx;
            sy = ty;
            sz = tz;
            len = depth1 + (depth2 - depth1) * t1;
            depth2 = depth1 + (depth2 - depth1) * t2;
            depth1 = len;
            if (depth1 < 0) manifold.addPoint(sx, sy, sz, nx, ny, nz, pd, false);
            if (depth2 < 0) manifold.addPoint(ex, ey, ez, nx, ny, nz, pd, false);

          }
          break;
        case 2:
          if (right2) {
            c2x = p2x - d2x;
            c2y = p2y - d2y;
            c2z = p2z - d2z;
            nx = -n2x;
            ny = -n2y;
            nz = -n2z;
          } else {
            c2x = p2x + d2x;
            c2y = p2y + d2y;
            c2z = p2z + d2z;
            nx = n2x;
            ny = n2y;
            nz = n2z;
          }
          dot = nx * n1x + ny * n1y + nz * n1z;
          if (dot < 0) len = h1;
          else len = -h1;
          c1x = p1x + len * n1x;
          c1y = p1y + len * n1y;
          c1z = p1z + len * n1z;
          if (dot1 >= 0.999999) {
            tx = -ny;
            ty = nz;
            tz = nx;
          } else {
            tx = nx;
            ty = ny;
            tz = nz;
          }
          len = tx * n1x + ty * n1y + tz * n1z;
          dx = len * n1x - tx;
          dy = len * n1y - ty;
          dz = len * n1z - tz;
          len = _Math.sqrt(dx * dx + dy * dy + dz * dz);
          if (len == 0) break;
          len = r1 / len;
          dx *= len;
          dy *= len;
          dz *= len;
          tx = c1x + dx;
          ty = c1y + dy;
          tz = c1z + dz;
          if (dot < -0.96 || dot > 0.96) {
            r00 = n1x * n1x * 1.5 - 0.5;
            r01 = n1x * n1y * 1.5 - n1z * 0.866025403;
            r02 = n1x * n1z * 1.5 + n1y * 0.866025403;
            r10 = n1y * n1x * 1.5 + n1z * 0.866025403;
            r11 = n1y * n1y * 1.5 - 0.5;
            r12 = n1y * n1z * 1.5 - n1x * 0.866025403;
            r20 = n1z * n1x * 1.5 - n1y * 0.866025403;
            r21 = n1z * n1y * 1.5 + n1x * 0.866025403;
            r22 = n1z * n1z * 1.5 - 0.5;
            px = tx;
            py = ty;
            pz = tz;
            pd = nx * (px - c2x) + ny * (py - c2y) + nz * (pz - c2z);
            tx = px - pd * nx - c2x;
            ty = py - pd * ny - c2y;
            tz = pz - pd * nz - c2z;
            len = tx * tx + ty * ty + tz * tz;
            if (len > r2 * r2) {
              len = r2 / _Math.sqrt(len);
              tx *= len;
              ty *= len;
              tz *= len;
            }
            px = c2x + tx;
            py = c2y + ty;
            pz = c2z + tz;
            manifold.addPoint(px, py, pz, -nx, -ny, -nz, pd, false);
            px = dx * r00 + dy * r01 + dz * r02;
            py = dx * r10 + dy * r11 + dz * r12;
            pz = dx * r20 + dy * r21 + dz * r22;
            px = (dx = px) + c1x;
            py = (dy = py) + c1y;
            pz = (dz = pz) + c1z;
            pd = nx * (px - c2x) + ny * (py - c2y) + nz * (pz - c2z);
            if (pd <= 0) {
              tx = px - pd * nx - c2x;
              ty = py - pd * ny - c2y;
              tz = pz - pd * nz - c2z;
              len = tx * tx + ty * ty + tz * tz;
              if (len > r2 * r2) {
                len = r2 / _Math.sqrt(len);
                tx *= len;
                ty *= len;
                tz *= len;
              }
              px = c2x + tx;
              py = c2y + ty;
              pz = c2z + tz;
              manifold.addPoint(px, py, pz, -nx, -ny, -nz, pd, false);
            }
            px = dx * r00 + dy * r01 + dz * r02;
            py = dx * r10 + dy * r11 + dz * r12;
            pz = dx * r20 + dy * r21 + dz * r22;
            px = (dx = px) + c1x;
            py = (dy = py) + c1y;
            pz = (dz = pz) + c1z;
            pd = nx * (px - c2x) + ny * (py - c2y) + nz * (pz - c2z);
            if (pd <= 0) {
              tx = px - pd * nx - c2x;
              ty = py - pd * ny - c2y;
              tz = pz - pd * nz - c2z;
              len = tx * tx + ty * ty + tz * tz;
              if (len > r2 * r2) {
                len = r2 / _Math.sqrt(len);
                tx *= len;
                ty *= len;
                tz *= len;
              }
              px = c2x + tx;
              py = c2y + ty;
              pz = c2z + tz;
              manifold.addPoint(px, py, pz, -nx, -ny, -nz, pd, false);
            }
          } else {
            sx = tx;
            sy = ty;
            sz = tz;
            depth1 = nx * (sx - c2x) + ny * (sy - c2y) + nz * (sz - c2z);
            sx -= depth1 * nx;
            sy -= depth1 * ny;
            sz -= depth1 * nz;
            if (dot > 0) {
              ex = tx + n1x * h1 * 2;
              ey = ty + n1y * h1 * 2;
              ez = tz + n1z * h1 * 2;
            } else {
              ex = tx - n1x * h1 * 2;
              ey = ty - n1y * h1 * 2;
              ez = tz - n1z * h1 * 2;
            }
            depth2 = nx * (ex - c2x) + ny * (ey - c2y) + nz * (ez - c2z);
            ex -= depth2 * nx;
            ey -= depth2 * ny;
            ez -= depth2 * nz;
            dx = c2x - sx;
            dy = c2y - sy;
            dz = c2z - sz;
            tx = ex - sx;
            ty = ey - sy;
            tz = ez - sz;
            a = dx * dx + dy * dy + dz * dz;
            b = dx * tx + dy * ty + dz * tz;
            e = tx * tx + ty * ty + tz * tz;
            f = b * b - e * (a - r2 * r2);
            if (f < 0) break;
            f = _Math.sqrt(f);
            t1 = (b + f) / e;
            t2 = (b - f) / e;
            if (t2 < t1) {
              len = t1;
              t1 = t2;
              t2 = len;
            }
            if (t2 > 1) t2 = 1;
            if (t1 < 0) t1 = 0;
            tx = sx + (ex - sx) * t1;
            ty = sy + (ey - sy) * t1;
            tz = sz + (ez - sz) * t1;
            ex = sx + (ex - sx) * t2;
            ey = sy + (ey - sy) * t2;
            ez = sz + (ez - sz) * t2;
            sx = tx;
            sy = ty;
            sz = tz;
            len = depth1 + (depth2 - depth1) * t1;
            depth2 = depth1 + (depth2 - depth1) * t2;
            depth1 = len;
            if (depth1 < 0) {
              manifold.addPoint(sx, sy, sz, -nx, -ny, -nz, depth1, false);
            }
            if (depth2 < 0) {
              manifold.addPoint(ex, ey, ez, -nx, -ny, -nz, depth2, false);
            }
          }
          break;
      }

    }

  });

  /**
   * A collision detector which detects collisions between sphere and box.
   * @author saharan
   */
  function SphereBoxCollisionDetector(flip) {

    CollisionDetector.call(this);
    this.flip = flip;

  }
  SphereBoxCollisionDetector.prototype = Object.assign(Object.create(CollisionDetector.prototype), {

    constructor: SphereBoxCollisionDetector,

    detectCollision: function (shape1, shape2, manifold) {

      var s;
      var b;
      if (this.flip) {
        s = (shape2);
        b = (shape1);
      } else {
        s = (shape1);
        b = (shape2);
      }

      var D = b.dimentions;

      var ps = s.position;
      var psx = ps.x;
      var psy = ps.y;
      var psz = ps.z;
      var pb = b.position;
      var pbx = pb.x;
      var pby = pb.y;
      var pbz = pb.z;
      var rad = s.radius;

      var hw = b.halfWidth;
      var hh = b.halfHeight;
      var hd = b.halfDepth;

      var dx = psx - pbx;
      var dy = psy - pby;
      var dz = psz - pbz;
      var sx = D[0] * dx + D[1] * dy + D[2] * dz;
      var sy = D[3] * dx + D[4] * dy + D[5] * dz;
      var sz = D[6] * dx + D[7] * dy + D[8] * dz;
      var cx;
      var cy;
      var cz;
      var len;
      var invLen;
      var overlap = 0;
      if (sx > hw) {
        sx = hw;
      } else if (sx < -hw) {
        sx = -hw;
      } else {
        overlap = 1;
      }
      if (sy > hh) {
        sy = hh;
      } else if (sy < -hh) {
        sy = -hh;
      } else {
        overlap |= 2;
      }
      if (sz > hd) {
        sz = hd;
      } else if (sz < -hd) {
        sz = -hd;
      } else {
        overlap |= 4;
      }
      if (overlap == 7) {
        // center of sphere is in the box
        if (sx < 0) {
          dx = hw + sx;
        } else {
          dx = hw - sx;
        }
        if (sy < 0) {
          dy = hh + sy;
        } else {
          dy = hh - sy;
        }
        if (sz < 0) {
          dz = hd + sz;
        } else {
          dz = hd - sz;
        }
        if (dx < dy) {
          if (dx < dz) {
            len = dx - hw;
            if (sx < 0) {
              sx = -hw;
              dx = D[0];
              dy = D[1];
              dz = D[2];
            } else {
              sx = hw;
              dx = -D[0];
              dy = -D[1];
              dz = -D[2];
            }
          } else {
            len = dz - hd;
            if (sz < 0) {
              sz = -hd;
              dx = D[6];
              dy = D[7];
              dz = D[8];
            } else {
              sz = hd;
              dx = -D[6];
              dy = -D[7];
              dz = -D[8];
            }
          }
        } else {
          if (dy < dz) {
            len = dy - hh;
            if (sy < 0) {
              sy = -hh;
              dx = D[3];
              dy = D[4];
              dz = D[5];
            } else {
              sy = hh;
              dx = -D[3];
              dy = -D[4];
              dz = -D[5];
            }
          } else {
            len = dz - hd;
            if (sz < 0) {
              sz = -hd;
              dx = D[6];
              dy = D[7];
              dz = D[8];
            } else {
              sz = hd;
              dx = -D[6];
              dy = -D[7];
              dz = -D[8];
            }
          }
        }
        cx = pbx + sx * D[0] + sy * D[3] + sz * D[6];
        cy = pby + sx * D[1] + sy * D[4] + sz * D[7];
        cz = pbz + sx * D[2] + sy * D[5] + sz * D[8];
        manifold.addPoint(psx + rad * dx, psy + rad * dy, psz + rad * dz, dx, dy, dz, len - rad, this.flip);
      } else {
        cx = pbx + sx * D[0] + sy * D[3] + sz * D[6];
        cy = pby + sx * D[1] + sy * D[4] + sz * D[7];
        cz = pbz + sx * D[2] + sy * D[5] + sz * D[8];
        dx = cx - ps.x;
        dy = cy - ps.y;
        dz = cz - ps.z;
        len = dx * dx + dy * dy + dz * dz;
        if (len > 0 && len < rad * rad) {
          len = _Math.sqrt(len);
          invLen = 1 / len;
          dx *= invLen;
          dy *= invLen;
          dz *= invLen;
          manifold.addPoint(psx + rad * dx, psy + rad * dy, psz + rad * dz, dx, dy, dz, len - rad, this.flip);
        }
      }

    }

  });

  function SphereCylinderCollisionDetector(flip) {

    CollisionDetector.call(this);
    this.flip = flip;

  }
  SphereCylinderCollisionDetector.prototype = Object.assign(Object.create(CollisionDetector.prototype), {

    constructor: SphereCylinderCollisionDetector,

    detectCollision: function (shape1, shape2, manifold) {

      var s;
      var c;
      if (this.flip) {
        s = shape2;
        c = shape1;
      } else {
        s = shape1;
        c = shape2;
      }
      var ps = s.position;
      var psx = ps.x;
      var psy = ps.y;
      var psz = ps.z;
      var pc = c.position;
      var pcx = pc.x;
      var pcy = pc.y;
      var pcz = pc.z;
      var dirx = c.normalDirection.x;
      var diry = c.normalDirection.y;
      var dirz = c.normalDirection.z;
      var rads = s.radius;
      var radc = c.radius;
      var rad2 = rads + radc;
      var halfh = c.halfHeight;
      var dx = psx - pcx;
      var dy = psy - pcy;
      var dz = psz - pcz;
      var dot = dx * dirx + dy * diry + dz * dirz;
      if (dot < -halfh - rads || dot > halfh + rads) return;
      var cx = pcx + dot * dirx;
      var cy = pcy + dot * diry;
      var cz = pcz + dot * dirz;
      var d2x = psx - cx;
      var d2y = psy - cy;
      var d2z = psz - cz;
      var len = d2x * d2x + d2y * d2y + d2z * d2z;
      if (len > rad2 * rad2) return;
      if (len > radc * radc) {
        len = radc / _Math.sqrt(len);
        d2x *= len;
        d2y *= len;
        d2z *= len;
      }
      if (dot < -halfh) dot = -halfh;
      else if (dot > halfh) dot = halfh;
      cx = pcx + dot * dirx + d2x;
      cy = pcy + dot * diry + d2y;
      cz = pcz + dot * dirz + d2z;
      dx = cx - psx;
      dy = cy - psy;
      dz = cz - psz;
      len = dx * dx + dy * dy + dz * dz;
      var invLen;
      if (len > 0 && len < rads * rads) {
        len = _Math.sqrt(len);
        invLen = 1 / len;
        dx *= invLen;
        dy *= invLen;
        dz *= invLen;
        ///result.addContactInfo(psx+dx*rads,psy+dy*rads,psz+dz*rads,dx,dy,dz,len-rads,s,c,0,0,false);
        manifold.addPoint(psx + dx * rads, psy + dy * rads, psz + dz * rads, dx, dy, dz, len - rads, this.flip);
      }

    }


  });

  /**
   * A collision detector which detects collisions between two spheres.
   * @author saharan
   */

  function SphereSphereCollisionDetector() {

    CollisionDetector.call(this);

  }
  SphereSphereCollisionDetector.prototype = Object.assign(Object.create(CollisionDetector.prototype), {

    constructor: SphereSphereCollisionDetector,

    detectCollision: function (shape1, shape2, manifold) {

      var s1 = shape1;
      var s2 = shape2;
      var p1 = s1.position;
      var p2 = s2.position;
      var dx = p2.x - p1.x;
      var dy = p2.y - p1.y;
      var dz = p2.z - p1.z;
      var len = dx * dx + dy * dy + dz * dz;
      var r1 = s1.radius;
      var r2 = s2.radius;
      var rad = r1 + r2;
      if (len > 0 && len < rad * rad) {
        len = _Math.sqrt(len);
        var invLen = 1 / len;
        dx *= invLen;
        dy *= invLen;
        dz *= invLen;
        manifold.addPoint(p1.x + dx * r1, p1.y + dy * r1, p1.z + dz * r1, dx, dy, dz, len - rad, false);
      }

    }

  });

  /**
   * A collision detector which detects collisions between two spheres.
   * @author saharan 
   * @author lo-th
   */

  function SpherePlaneCollisionDetector(flip) {

    CollisionDetector.call(this);

    this.flip = flip;

    this.n = new Vec3();
    this.p = new Vec3();

  }
  SpherePlaneCollisionDetector.prototype = Object.assign(Object.create(CollisionDetector.prototype), {

    constructor: SpherePlaneCollisionDetector,

    detectCollision: function (shape1, shape2, manifold) {

      var n = this.n;
      var p = this.p;

      var s = this.flip ? shape2 : shape1;
      var pn = this.flip ? shape1 : shape2;
      var rad = s.radius;
      var len;

      n.sub(s.position, pn.position);
      //var h = _Math.dotVectors( pn.normal, n );

      n.x *= pn.normal.x;//+ rad;
      n.y *= pn.normal.y;
      n.z *= pn.normal.z;//+ rad;


      var len = n.lengthSq();

      if (len > 0 && len < rad * rad) {//&& h > rad*rad ){


        len = _Math.sqrt(len);
        //len = _Math.sqrt( h );
        n.copy(pn.normal).negate();
        //n.scaleEqual( 1/len );

        //(0, -1, 0)

        //n.normalize();
        p.copy(s.position).addScaledVector(n, rad);
        manifold.addPointVec(p, n, len - rad, this.flip);

      }

    }

  });

  /**
   * A collision detector which detects collisions between two spheres.
   * @author saharan 
   * @author lo-th
   */

  function BoxPlaneCollisionDetector(flip) {

    CollisionDetector.call(this);

    this.flip = flip;

    this.n = new Vec3();
    this.p = new Vec3();

    this.dix = new Vec3();
    this.diy = new Vec3();
    this.diz = new Vec3();

    this.cc = new Vec3();
    this.cc2 = new Vec3();

  }
  BoxPlaneCollisionDetector.prototype = Object.assign(Object.create(CollisionDetector.prototype), {

    constructor: BoxPlaneCollisionDetector,

    detectCollision: function (shape1, shape2, manifold) {

      var n = this.n;
      var p = this.p;
      var cc = this.cc;

      var b = this.flip ? shape2 : shape1;
      var pn = this.flip ? shape1 : shape2;

      var D = b.dimentions;
      var hw = b.halfWidth;
      var hh = b.halfHeight;
      var hd = b.halfDepth;
      var len;
      var overlap = 0;

      this.dix.set(D[0], D[1], D[2]);
      this.diy.set(D[3], D[4], D[5]);
      this.diz.set(D[6], D[7], D[8]);

      n.sub(b.position, pn.position);

      n.x *= pn.normal.x;//+ rad;
      n.y *= pn.normal.y;
      n.z *= pn.normal.z;//+ rad;

      cc.set(
        _Math.dotVectors(this.dix, n),
        _Math.dotVectors(this.diy, n),
        _Math.dotVectors(this.diz, n)
      );


      if (cc.x > hw) cc.x = hw;
      else if (cc.x < -hw) cc.x = -hw;
      else overlap = 1;

      if (cc.y > hh) cc.y = hh;
      else if (cc.y < -hh) cc.y = -hh;
      else overlap |= 2;

      if (cc.z > hd) cc.z = hd;
      else if (cc.z < -hd) cc.z = -hd;
      else overlap |= 4;



      if (overlap === 7) {

        // center of sphere is in the box

        n.set(
          cc.x < 0 ? hw + cc.x : hw - cc.x,
          cc.y < 0 ? hh + cc.y : hh - cc.y,
          cc.z < 0 ? hd + cc.z : hd - cc.z
        );

        if (n.x < n.y) {
          if (n.x < n.z) {
            len = n.x - hw;
            if (cc.x < 0) {
              cc.x = -hw;
              n.copy(this.dix);
            } else {
              cc.x = hw;
              n.subEqual(this.dix);
            }
          } else {
            len = n.z - hd;
            if (cc.z < 0) {
              cc.z = -hd;
              n.copy(this.diz);
            } else {
              cc.z = hd;
              n.subEqual(this.diz);
            }
          }
        } else {
          if (n.y < n.z) {
            len = n.y - hh;
            if (cc.y < 0) {
              cc.y = -hh;
              n.copy(this.diy);
            } else {
              cc.y = hh;
              n.subEqual(this.diy);
            }
          } else {
            len = n.z - hd;
            if (cc.z < 0) {
              cc.z = -hd;
              n.copy(this.diz);
            } else {
              cc.z = hd;
              n.subEqual(this.diz);
            }
          }
        }

        p.copy(pn.position).addScaledVector(n, 1);
        manifold.addPointVec(p, n, len, this.flip);

      }

    }

  });

  /**
   * The class of physical computing world.
   * You must be added to the world physical all computing objects
   *
   * @author saharan
   * @author lo-th
   */

  // timestep, broadphase, iterations, worldscale, random, stat

  function World(o) {

    if (!(o instanceof Object)) o = {};

    // this world scale defaut is 0.1 to 10 meters max for dynamique body
    this.scale = o.worldscale || 1;
    this.invScale = 1 / this.scale;

    // The time between each step
    this.timeStep = o.timestep || 0.01666; // 1/60;
    this.timerate = this.timeStep * 1000;
    this.timer = null;

    this.preLoop = null;//function(){};
    this.postLoop = null;//function(){};

    // The number of iterations for constraint solvers.
    this.numIterations = o.iterations || 8;

    // It is a wide-area collision judgment that is used in order to reduce as much as possible a detailed collision judgment.
    switch (o.broadphase || 2) {
      case 1: this.broadPhase = new BruteForceBroadPhase(); break;
      case 2: default: this.broadPhase = new SAPBroadPhase(); break;
      case 3: this.broadPhase = new DBVTBroadPhase(); break;
    }

    this.Btypes = ['None', 'BruteForce', 'Sweep & Prune', 'Bounding Volume Tree'];
    this.broadPhaseType = this.Btypes[o.broadphase || 2];

    // This is the detailed information of the performance.
    this.performance = null;
    this.isStat = o.info === undefined ? false : o.info;
    if (this.isStat) this.performance = new InfoDisplay(this);

    /**
     * Whether the constraints randomizer is enabled or not.
     *
     * @property enableRandomizer
     * @type {Boolean}
     */
    this.enableRandomizer = o.random !== undefined ? o.random : true;

    // The rigid body list
    this.rigidBodies = null;
    // number of rigid body
    this.numRigidBodies = 0;
    // The contact list
    this.contacts = null;
    this.unusedContacts = null;
    // The number of contact
    this.numContacts = 0;
    // The number of contact points
    this.numContactPoints = 0;
    //  The joint list
    this.joints = null;
    // The number of joints.
    this.numJoints = 0;
    // The number of simulation islands.
    this.numIslands = 0;


    // The gravity in the world.
    this.gravity = new Vec3(0, -9.8, 0);
    if (o.gravity !== undefined) this.gravity.fromArray(o.gravity);



    var numShapeTypes = 5;//4;//3;
    this.detectors = [];
    this.detectors.length = numShapeTypes;
    var i = numShapeTypes;
    while (i--) {
      this.detectors[i] = [];
      this.detectors[i].length = numShapeTypes;
    }

    this.detectors[SHAPE_SPHERE][SHAPE_SPHERE] = new SphereSphereCollisionDetector();
    this.detectors[SHAPE_SPHERE][SHAPE_BOX] = new SphereBoxCollisionDetector(false);
    this.detectors[SHAPE_BOX][SHAPE_SPHERE] = new SphereBoxCollisionDetector(true);
    this.detectors[SHAPE_BOX][SHAPE_BOX] = new BoxBoxCollisionDetector();

    // CYLINDER add
    this.detectors[SHAPE_CYLINDER][SHAPE_CYLINDER] = new CylinderCylinderCollisionDetector();

    this.detectors[SHAPE_CYLINDER][SHAPE_BOX] = new BoxCylinderCollisionDetector(true);
    this.detectors[SHAPE_BOX][SHAPE_CYLINDER] = new BoxCylinderCollisionDetector(false);

    this.detectors[SHAPE_CYLINDER][SHAPE_SPHERE] = new SphereCylinderCollisionDetector(true);
    this.detectors[SHAPE_SPHERE][SHAPE_CYLINDER] = new SphereCylinderCollisionDetector(false);

    // PLANE add

    this.detectors[SHAPE_PLANE][SHAPE_SPHERE] = new SpherePlaneCollisionDetector(true);
    this.detectors[SHAPE_SPHERE][SHAPE_PLANE] = new SpherePlaneCollisionDetector(false);

    this.detectors[SHAPE_PLANE][SHAPE_BOX] = new BoxPlaneCollisionDetector(true);
    this.detectors[SHAPE_BOX][SHAPE_PLANE] = new BoxPlaneCollisionDetector(false);

    // TETRA add
    //this.detectors[SHAPE_TETRA][SHAPE_TETRA] = new TetraTetraCollisionDetector();


    this.randX = 65535;
    this.randA = 98765;
    this.randB = 123456789;

    this.islandRigidBodies = [];
    this.islandStack = [];
    this.islandConstraints = [];

  }

  Object.assign(World.prototype, {

    World: true,

    play: function () {

      if (this.timer !== null) return;

      var _this = this;
      this.timer = setInterval(function () { _this.step(); }, this.timerate);
      //this.timer = setInterval( this.loop.bind(this) , this.timerate );

    },

    stop: function () {

      if (this.timer === null) return;

      clearInterval(this.timer);
      this.timer = null;

    },

    setGravity: function (ar) {

      this.gravity.fromArray(ar);

    },

    getInfo: function () {

      return this.isStat ? this.performance.show() : '';

    },

    // Reset the world and remove all rigid bodies, shapes, joints and any object from the world.
    clear: function () {

      this.stop();
      this.preLoop = null;
      this.postLoop = null;

      this.randX = 65535;

      while (this.joints !== null) {
        this.removeJoint(this.joints);
      }
      while (this.contacts !== null) {
        this.removeContact(this.contacts);
      }
      while (this.rigidBodies !== null) {
        this.removeRigidBody(this.rigidBodies);
      }

    },
    /**
    * I'll add a rigid body to the world.
    * Rigid body that has been added will be the operands of each step.
    * @param  rigidBody  Rigid body that you want to add
    */
    addRigidBody: function (rigidBody) {

      if (rigidBody.parent) {
        printError("World", "It is not possible to be added to more than one world one of the rigid body");
      }

      rigidBody.setParent(this);
      //rigidBody.awake();

      for (var shape = rigidBody.shapes; shape !== null; shape = shape.next) {
        this.addShape(shape);
      }
      if (this.rigidBodies !== null) (this.rigidBodies.prev = rigidBody).next = this.rigidBodies;
      this.rigidBodies = rigidBody;
      this.numRigidBodies++;

    },
    /**
    * I will remove the rigid body from the world.
    * Rigid body that has been deleted is excluded from the calculation on a step-by-step basis.
    * @param  rigidBody  Rigid body to be removed
    */
    removeRigidBody: function (rigidBody) {

      var remove = rigidBody;
      if (remove.parent !== this) return;
      remove.awake();
      var js = remove.jointLink;
      while (js != null) {
        var joint = js.joint;
        js = js.next;
        this.removeJoint(joint);
      }
      for (var shape = rigidBody.shapes; shape !== null; shape = shape.next) {
        this.removeShape(shape);
      }
      var prev = remove.prev;
      var next = remove.next;
      if (prev !== null) prev.next = next;
      if (next !== null) next.prev = prev;
      if (this.rigidBodies == remove) this.rigidBodies = next;
      remove.prev = null;
      remove.next = null;
      remove.parent = null;
      this.numRigidBodies--;

    },

    getByName: function (name) {

      var body = this.rigidBodies;
      while (body !== null) {
        if (body.name === name) return body;
        body = body.next;
      }

      var joint = this.joints;
      while (joint !== null) {
        if (joint.name === name) return joint;
        joint = joint.next;
      }

      return null;

    },

    /**
    * I'll add a shape to the world..
    * Add to the rigid world, and if you add a shape to a rigid body that has been added to the world,
    * Shape will be added to the world automatically, please do not call from outside this method.
    * @param  shape  Shape you want to add
    */
    addShape: function (shape) {

      if (!shape.parent || !shape.parent.parent) {
        printError("World", "It is not possible to be added alone to shape world");
      }

      shape.proxy = this.broadPhase.createProxy(shape);
      shape.updateProxy();
      this.broadPhase.addProxy(shape.proxy);

    },

    /**
    * I will remove the shape from the world.
    * Add to the rigid world, and if you add a shape to a rigid body that has been added to the world,
    * Shape will be added to the world automatically, please do not call from outside this method.
    * @param  shape  Shape you want to delete
    */
    removeShape: function (shape) {

      this.broadPhase.removeProxy(shape.proxy);
      shape.proxy = null;

    },

    /**
    * I'll add a joint to the world.
    * Joint that has been added will be the operands of each step.
    * @param  shape Joint to be added
    */
    addJoint: function (joint) {

      if (joint.parent) {
        printError("World", "It is not possible to be added to more than one world one of the joint");
      }
      if (this.joints != null) (this.joints.prev = joint).next = this.joints;
      this.joints = joint;
      joint.setParent(this);
      this.numJoints++;
      joint.awake();
      joint.attach();

    },

    /**
    * I will remove the joint from the world.
    * Joint that has been added will be the operands of each step.
    * @param  shape Joint to be deleted
    */
    removeJoint: function (joint) {

      var remove = joint;
      var prev = remove.prev;
      var next = remove.next;
      if (prev !== null) prev.next = next;
      if (next !== null) next.prev = prev;
      if (this.joints == remove) this.joints = next;
      remove.prev = null;
      remove.next = null;
      this.numJoints--;
      remove.awake();
      remove.detach();
      remove.parent = null;

    },

    addContact: function (s1, s2) {

      var newContact;
      if (this.unusedContacts !== null) {
        newContact = this.unusedContacts;
        this.unusedContacts = this.unusedContacts.next;
      } else {
        newContact = new Contact();
      }
      newContact.attach(s1, s2);
      newContact.detector = this.detectors[s1.type][s2.type];
      if (this.contacts) (this.contacts.prev = newContact).next = this.contacts;
      this.contacts = newContact;
      this.numContacts++;

    },

    removeContact: function (contact) {

      var prev = contact.prev;
      var next = contact.next;
      if (next) next.prev = prev;
      if (prev) prev.next = next;
      if (this.contacts == contact) this.contacts = next;
      contact.prev = null;
      contact.next = null;
      contact.detach();
      contact.next = this.unusedContacts;
      this.unusedContacts = contact;
      this.numContacts--;

    },

    getContact: function (b1, b2) {

      b1 = b1.constructor === RigidBody ? b1.name : b1;
      b2 = b2.constructor === RigidBody ? b2.name : b2;

      var n1, n2;
      var contact = this.contacts;
      while (contact !== null) {
        n1 = contact.body1.name;
        n2 = contact.body2.name;
        if ((n1 === b1 && n2 === b2) || (n2 === b1 && n1 === b2)) { if (contact.touching) return contact; else return null; }
        else contact = contact.next;
      }
      return null;

    },

    checkContact: function (name1, name2) {

      var n1, n2;
      var contact = this.contacts;
      while (contact !== null) {
        n1 = contact.body1.name || ' ';
        n2 = contact.body2.name || ' ';
        if ((n1 == name1 && n2 == name2) || (n2 == name1 && n1 == name2)) { if (contact.touching) return true; else return false; }
        else contact = contact.next;
      }
      //return false;

    },

    callSleep: function (body) {

      if (!body.allowSleep) return false;
      if (body.linearVelocity.lengthSq() > 0.04) return false;
      if (body.angularVelocity.lengthSq() > 0.25) return false;
      return true;

    },

    /**
    * I will proceed only time step seconds time of World.
    */
    step: function () {

      var stat = this.isStat;

      if (stat) this.performance.setTime(0);

      var body = this.rigidBodies;

      while (body !== null) {

        body.addedToIsland = false;

        if (body.sleeping) body.testWakeUp();

        body = body.next;

      }



      //------------------------------------------------------
      //   UPDATE BROADPHASE CONTACT
      //------------------------------------------------------

      if (stat) this.performance.setTime(1);

      this.broadPhase.detectPairs();

      var pairs = this.broadPhase.pairs;

      var i = this.broadPhase.numPairs;
      //do{
      while (i--) {
        //for(var i=0, l=numPairs; i<l; i++){
        var pair = pairs[i];
        var s1;
        var s2;
        if (pair.shape1.id < pair.shape2.id) {
          s1 = pair.shape1;
          s2 = pair.shape2;
        } else {
          s1 = pair.shape2;
          s2 = pair.shape1;
        }

        var link;
        if (s1.numContacts < s2.numContacts) link = s1.contactLink;
        else link = s2.contactLink;

        var exists = false;
        while (link) {
          var contact = link.contact;
          if (contact.shape1 == s1 && contact.shape2 == s2) {
            contact.persisting = true;
            exists = true;// contact already exists
            break;
          }
          link = link.next;
        }
        if (!exists) {
          this.addContact(s1, s2);
        }
      }// while(i-- >0);

      if (stat) this.performance.calcBroadPhase();

      //------------------------------------------------------
      //   UPDATE NARROWPHASE CONTACT
      //------------------------------------------------------

      // update & narrow phase
      this.numContactPoints = 0;
      contact = this.contacts;
      while (contact !== null) {
        if (!contact.persisting) {
          if (contact.shape1.aabb.intersectTest(contact.shape2.aabb)) {
            /*var aabb1=contact.shape1.aabb;
            var aabb2=contact.shape2.aabb;
            if(
              aabb1.minX>aabb2.maxX || aabb1.maxX<aabb2.minX ||
              aabb1.minY>aabb2.maxY || aabb1.maxY<aabb2.minY ||
              aabb1.minZ>aabb2.maxZ || aabb1.maxZ<aabb2.minZ
            ){*/
            var next = contact.next;
            this.removeContact(contact);
            contact = next;
            continue;
          }
        }
        var b1 = contact.body1;
        var b2 = contact.body2;

        if (b1.isDynamic && !b1.sleeping || b2.isDynamic && !b2.sleeping) contact.updateManifold();

        this.numContactPoints += contact.manifold.numPoints;
        contact.persisting = false;
        contact.constraint.addedToIsland = false;
        contact = contact.next;

      }

      if (stat) this.performance.calcNarrowPhase();

      //------------------------------------------------------
      //   SOLVE ISLANDS
      //------------------------------------------------------

      var invTimeStep = 1 / this.timeStep;
      var joint;
      var constraint;

      for (joint = this.joints; joint !== null; joint = joint.next) {
        joint.addedToIsland = false;
      }


      // clear old island array
      this.islandRigidBodies = [];
      this.islandConstraints = [];
      this.islandStack = [];

      if (stat) this.performance.setTime(1);

      this.numIslands = 0;

      // build and solve simulation islands

      for (var base = this.rigidBodies; base !== null; base = base.next) {

        if (base.addedToIsland || base.isStatic || base.sleeping) continue;// ignore

        if (base.isLonely()) {// update single body
          if (base.isDynamic) {
            base.linearVelocity.addScaledVector(this.gravity, this.timeStep);
            /*base.linearVelocity.x+=this.gravity.x*this.timeStep;
            base.linearVelocity.y+=this.gravity.y*this.timeStep;
            base.linearVelocity.z+=this.gravity.z*this.timeStep;*/
          }
          if (this.callSleep(base)) {
            base.sleepTime += this.timeStep;
            if (base.sleepTime > 0.5) base.sleep();
            else base.updatePosition(this.timeStep);
          } else {
            base.sleepTime = 0;
            base.updatePosition(this.timeStep);
          }
          this.numIslands++;
          continue;
        }

        var islandNumRigidBodies = 0;
        var islandNumConstraints = 0;
        var stackCount = 1;
        // add rigid body to stack
        this.islandStack[0] = base;
        base.addedToIsland = true;

        // build an island
        do {
          // get rigid body from stack
          body = this.islandStack[--stackCount];
          this.islandStack[stackCount] = null;
          body.sleeping = false;
          // add rigid body to the island
          this.islandRigidBodies[islandNumRigidBodies++] = body;
          if (body.isStatic) continue;

          // search connections
          for (var cs = body.contactLink; cs !== null; cs = cs.next) {
            var contact = cs.contact;
            constraint = contact.constraint;
            if (constraint.addedToIsland || !contact.touching) continue;// ignore

            // add constraint to the island
            this.islandConstraints[islandNumConstraints++] = constraint;
            constraint.addedToIsland = true;
            var next = cs.body;

            if (next.addedToIsland) continue;

            // add rigid body to stack
            this.islandStack[stackCount++] = next;
            next.addedToIsland = true;
          }
          for (var js = body.jointLink; js !== null; js = js.next) {
            constraint = js.joint;

            if (constraint.addedToIsland) continue;// ignore

            // add constraint to the island
            this.islandConstraints[islandNumConstraints++] = constraint;
            constraint.addedToIsland = true;
            next = js.body;
            if (next.addedToIsland || !next.isDynamic) continue;

            // add rigid body to stack
            this.islandStack[stackCount++] = next;
            next.addedToIsland = true;
          }
        } while (stackCount != 0);

        // update velocities
        var gVel = new Vec3().addScaledVector(this.gravity, this.timeStep);
        /*var gx=this.gravity.x*this.timeStep;
        var gy=this.gravity.y*this.timeStep;
        var gz=this.gravity.z*this.timeStep;*/
        var j = islandNumRigidBodies;
        while (j--) {
          //or(var j=0, l=islandNumRigidBodies; j<l; j++){
          body = this.islandRigidBodies[j];
          if (body.isDynamic) {
            body.linearVelocity.addEqual(gVel);
            /*body.linearVelocity.x+=gx;
            body.linearVelocity.y+=gy;
            body.linearVelocity.z+=gz;*/
          }
        }

        // randomizing order
        if (this.enableRandomizer) {
          //for(var j=1, l=islandNumConstraints; j<l; j++){
          j = islandNumConstraints;
          while (j--) {
            if (j !== 0) {
              var swap = (this.randX = (this.randX * this.randA + this.randB & 0x7fffffff)) / 2147483648.0 * j | 0;
              constraint = this.islandConstraints[j];
              this.islandConstraints[j] = this.islandConstraints[swap];
              this.islandConstraints[swap] = constraint;
            }
          }
        }

        // solve contraints

        j = islandNumConstraints;
        while (j--) {
          //for(j=0, l=islandNumConstraints; j<l; j++){
          this.islandConstraints[j].preSolve(this.timeStep, invTimeStep);// pre-solve
        }
        var k = this.numIterations;
        while (k--) {
          //for(var k=0, l=this.numIterations; k<l; k++){
          j = islandNumConstraints;
          while (j--) {
            //for(j=0, m=islandNumConstraints; j<m; j++){
            this.islandConstraints[j].solve();// main-solve
          }
        }
        j = islandNumConstraints;
        while (j--) {
          //for(j=0, l=islandNumConstraints; j<l; j++){
          this.islandConstraints[j].postSolve();// post-solve
          this.islandConstraints[j] = null;// gc
        }

        // sleeping check

        var sleepTime = 10;
        j = islandNumRigidBodies;
        while (j--) {
          //for(j=0, l=islandNumRigidBodies;j<l;j++){
          body = this.islandRigidBodies[j];
          if (this.callSleep(body)) {
            body.sleepTime += this.timeStep;
            if (body.sleepTime < sleepTime) sleepTime = body.sleepTime;
          } else {
            body.sleepTime = 0;
            sleepTime = 0;
            continue;
          }
        }
        if (sleepTime > 0.5) {
          // sleep the island
          j = islandNumRigidBodies;
          while (j--) {
            //for(j=0, l=islandNumRigidBodies;j<l;j++){
            this.islandRigidBodies[j].sleep();
            this.islandRigidBodies[j] = null;// gc
          }
        } else {
          // update positions
          j = islandNumRigidBodies;
          while (j--) {
            //for(j=0, l=islandNumRigidBodies;j<l;j++){
            this.islandRigidBodies[j].updatePosition(this.timeStep);
            this.islandRigidBodies[j] = null;// gc
          }
        }
        this.numIslands++;
      }

      //------------------------------------------------------
      //   END SIMULATION
      //------------------------------------------------------

      if (stat) this.performance.calcEnd();

      if (this.postLoop !== null) this.postLoop();

    },

    // remove someting to world

    remove: function (obj) {

    },

    // add someting to world

    add: function (o) {

      o = o || {};

      var type = o.type || "box";
      if (type.constructor === String) type = [type];
      var isJoint = type[0].substring(0, 5) === 'joint' ? true : false;

      if (isJoint) return this.initJoint(type[0], o);
      else return this.initBody(type, o);

    },

    initBody: function (type, o) {

      var invScale = this.invScale;

      // body dynamic or static
      var move = o.move || false;
      var kinematic = o.kinematic || false;

      // POSITION

      // body position
      var p = o.pos || [0, 0, 0];
      p = p.map(function (x) { return x * invScale; });

      // shape position
      var p2 = o.posShape || [0, 0, 0];
      p2 = p2.map(function (x) { return x * invScale; });

      // ROTATION

      // body rotation in degree
      var r = o.rot || [0, 0, 0];
      r = r.map(function (x) { return x * _Math.degtorad; });

      // shape rotation in degree
      var r2 = o.rotShape || [0, 0, 0];
      r2 = r.map(function (x) { return x * _Math.degtorad; });

      // SIZE

      // shape size
      var s = o.size === undefined ? [1, 1, 1] : o.size;
      if (s.length === 1) { s[1] = s[0]; }
      if (s.length === 2) { s[2] = s[0]; }
      s = s.map(function (x) { return x * invScale; });



      // body physics settings
      var sc = new ShapeConfig();
      // The density of the shape.
      if (o.density !== undefined) sc.density = o.density;
      // The coefficient of friction of the shape.
      if (o.friction !== undefined) sc.friction = o.friction;
      // The coefficient of restitution of the shape.
      if (o.restitution !== undefined) sc.restitution = o.restitution;
      // The bits of the collision groups to which the shape belongs.
      if (o.belongsTo !== undefined) sc.belongsTo = o.belongsTo;
      // The bits of the collision groups with which the shape collides.
      if (o.collidesWith !== undefined) sc.collidesWith = o.collidesWith;

      if (o.config !== undefined) {
        if (o.config[0] !== undefined) sc.density = o.config[0];
        if (o.config[1] !== undefined) sc.friction = o.config[1];
        if (o.config[2] !== undefined) sc.restitution = o.config[2];
        if (o.config[3] !== undefined) sc.belongsTo = o.config[3];
        if (o.config[4] !== undefined) sc.collidesWith = o.config[4];
      }


      /* if(o.massPos){
           o.massPos = o.massPos.map(function(x) { return x * invScale; });
           sc.relativePosition.set( o.massPos[0], o.massPos[1], o.massPos[2] );
       }
       if(o.massRot){
           o.massRot = o.massRot.map(function(x) { return x * _Math.degtorad; });
           var q = new Quat().setFromEuler( o.massRot[0], o.massRot[1], o.massRot[2] );
           sc.relativeRotation = new Mat33().setQuat( q );//_Math.EulerToMatrix( o.massRot[0], o.massRot[1], o.massRot[2] );
       }*/

      var position = new Vec3(p[0], p[1], p[2]);
      var rotation = new Quat().setFromEuler(r[0], r[1], r[2]);

      // rigidbody
      var body = new RigidBody(position, rotation);
      //var body = new RigidBody( p[0], p[1], p[2], r[0], r[1], r[2], r[3], this.scale, this.invScale );

      // SHAPES

      var shape, n;

      for (var i = 0; i < type.length; i++) {

        n = i * 3;

        if (p2[n] !== undefined) sc.relativePosition.set(p2[n], p2[n + 1], p2[n + 2]);
        if (r2[n] !== undefined) sc.relativeRotation.setQuat(new Quat().setFromEuler(r2[n], r2[n + 1], r2[n + 2]));

        switch (type[i]) {
          case "sphere": shape = new Sphere(sc, s[n]); break;
          case "cylinder": shape = new Cylinder(sc, s[n], s[n + 1]); break;
          case "box": shape = new Box(sc, s[n], s[n + 1], s[n + 2]); break;
          case "plane": shape = new Plane(sc); break
        }

        body.addShape(shape);

      }

      // body can sleep or not
      if (o.neverSleep || kinematic) body.allowSleep = false;
      else body.allowSleep = true;

      body.isKinematic = kinematic;

      // body static or dynamic
      if (move) {

        if (o.massPos || o.massRot) body.setupMass(BODY_DYNAMIC, false);
        else body.setupMass(BODY_DYNAMIC, true);

        // body can sleep or not
        //if( o.neverSleep ) body.allowSleep = false;
        //else body.allowSleep = true;

      } else {

        body.setupMass(BODY_STATIC);

      }

      if (o.name !== undefined) body.name = o.name;
      //else if( move ) body.name = this.numRigidBodies;

      // finaly add to physics world
      this.addRigidBody(body);

      // force sleep on not
      if (move) {
        if (o.sleep) body.sleep();
        else body.awake();
      }

      return body;


    },

    initJoint: function (type, o) {

      //var type = type;
      var invScale = this.invScale;

      var axe1 = o.axe1 || [1, 0, 0];
      var axe2 = o.axe2 || [1, 0, 0];
      var pos1 = o.pos1 || [0, 0, 0];
      var pos2 = o.pos2 || [0, 0, 0];

      pos1 = pos1.map(function (x) { return x * invScale; });
      pos2 = pos2.map(function (x) { return x * invScale; });

      var min, max;
      if (type === "jointDistance") {
        min = o.min || 0;
        max = o.max || 10;
        min = min * invScale;
        max = max * invScale;
      } else {
        min = o.min || 57.29578;
        max = o.max || 0;
        min = min * _Math.degtorad;
        max = max * _Math.degtorad;
      }

      var limit = o.limit || null;
      var spring = o.spring || null;
      var motor = o.motor || null;

      // joint setting
      var jc = new JointConfig();
      jc.scale = this.scale;
      jc.invScale = this.invScale;
      jc.allowCollision = o.collision || false;
      jc.localAxis1.set(axe1[0], axe1[1], axe1[2]);
      jc.localAxis2.set(axe2[0], axe2[1], axe2[2]);
      jc.localAnchorPoint1.set(pos1[0], pos1[1], pos1[2]);
      jc.localAnchorPoint2.set(pos2[0], pos2[1], pos2[2]);

      var b1 = null;
      var b2 = null;

      if (o.body1 === undefined || o.body2 === undefined) return printError('World', "Can't add joint if attach rigidbodys not define !");

      if (o.body1.constructor === String) { b1 = this.getByName(o.body1); }
      else if (o.body1.constructor === Number) { b1 = this.getByName(o.body1); }
      else if (o.body1.constructor === RigidBody) { b1 = o.body1; }

      if (o.body2.constructor === String) { b2 = this.getByName(o.body2); }
      else if (o.body2.constructor === Number) { b2 = this.getByName(o.body2); }
      else if (o.body2.constructor === RigidBody) { b2 = o.body2; }

      if (b1 === null || b2 === null) return printError('World', "Can't add joint attach rigidbodys not find !");

      jc.body1 = b1;
      jc.body2 = b2;

      var joint;
      switch (type) {
        case "jointDistance": joint = new DistanceJoint(jc, min, max);
          if (spring !== null) joint.limitMotor.setSpring(spring[0], spring[1]);
          if (motor !== null) joint.limitMotor.setMotor(motor[0], motor[1]);
          break;
        case "jointHinge": case "joint": joint = new HingeJoint(jc, min, max);
          if (spring !== null) joint.limitMotor.setSpring(spring[0], spring[1]);// soften the joint ex: 100, 0.2
          if (motor !== null) joint.limitMotor.setMotor(motor[0], motor[1]);
          break;
        case "jointPrisme": joint = new PrismaticJoint(jc, min, max); break;
        case "jointSlide": joint = new SliderJoint(jc, min, max); break;
        case "jointBall": joint = new BallAndSocketJoint(jc); break;
        case "jointWheel": joint = new WheelJoint(jc);
          if (limit !== null) joint.rotationalLimitMotor1.setLimit(limit[0], limit[1]);
          if (spring !== null) joint.rotationalLimitMotor1.setSpring(spring[0], spring[1]);
          if (motor !== null) joint.rotationalLimitMotor1.setMotor(motor[0], motor[1]);
          break;
      }

      joint.name = o.name || '';
      // finaly add to physics world
      this.addJoint(joint);

      return joint;

    },


  });

  // test version

  //export { RigidBody } from './core/RigidBody_X.js';
  //export { World } from './core/World_X.js';

  exports.Math = _Math;
  exports.Vec3 = Vec3;
  exports.Quat = Quat;
  exports.Mat33 = Mat33;
  exports.Shape = Shape;
  exports.Box = Box;
  exports.Sphere = Sphere;
  exports.Cylinder = Cylinder;
  exports.Plane = Plane;
  exports.Particle = Particle;
  exports.ShapeConfig = ShapeConfig;
  exports.LimitMotor = LimitMotor;
  exports.HingeJoint = HingeJoint;
  exports.BallAndSocketJoint = BallAndSocketJoint;
  exports.DistanceJoint = DistanceJoint;
  exports.PrismaticJoint = PrismaticJoint;
  exports.SliderJoint = SliderJoint;
  exports.WheelJoint = WheelJoint;
  exports.JointConfig = JointConfig;
  exports.RigidBody = RigidBody;
  exports.World = World;
  exports.REVISION = REVISION;
  exports.BR_NULL = BR_NULL;
  exports.BR_BRUTE_FORCE = BR_BRUTE_FORCE;
  exports.BR_SWEEP_AND_PRUNE = BR_SWEEP_AND_PRUNE;
  exports.BR_BOUNDING_VOLUME_TREE = BR_BOUNDING_VOLUME_TREE;
  exports.BODY_NULL = BODY_NULL;
  exports.BODY_DYNAMIC = BODY_DYNAMIC;
  exports.BODY_STATIC = BODY_STATIC;
  exports.BODY_KINEMATIC = BODY_KINEMATIC;
  exports.BODY_GHOST = BODY_GHOST;
  exports.SHAPE_NULL = SHAPE_NULL;
  exports.SHAPE_SPHERE = SHAPE_SPHERE;
  exports.SHAPE_BOX = SHAPE_BOX;
  exports.SHAPE_CYLINDER = SHAPE_CYLINDER;
  exports.SHAPE_PLANE = SHAPE_PLANE;
  exports.SHAPE_PARTICLE = SHAPE_PARTICLE;
  exports.SHAPE_TETRA = SHAPE_TETRA;
  exports.JOINT_NULL = JOINT_NULL;
  exports.JOINT_DISTANCE = JOINT_DISTANCE;
  exports.JOINT_BALL_AND_SOCKET = JOINT_BALL_AND_SOCKET;
  exports.JOINT_HINGE = JOINT_HINGE;
  exports.JOINT_WHEEL = JOINT_WHEEL;
  exports.JOINT_SLIDER = JOINT_SLIDER;
  exports.JOINT_PRISMATIC = JOINT_PRISMATIC;
  exports.AABB_PROX = AABB_PROX;
  exports.printError = printError;
  exports.InfoDisplay = InfoDisplay;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
},{}],3:[function(require,module,exports){
(function (global){(function (){
/* global AFRAME, THREE, OIMO */

const cmd = require("./libs/cmdCodec")

global.OIMO = require("./libs/oimo")
global.world = new OIMO.World()
global.bodies = []
global.movingBodies = []
global.joints = []

let vec = new OIMO.Vec3()
let quat = new OIMO.Quat()
let lastStep = 0
let nextStep = Date.now()

function init() {
  addEventListener("message", onMessage)
}

function onMessage(e) {
  if (typeof e.data === "string") {
    let command = cmd.parse(e.data)
    switch (command.shift()) {
      case "world":
        worldCommand(command)
        break
    }
  }
  else if (e.data instanceof Float64Array) {
    let buffer = e.data
    let now = Date.now()
    for (let mid = 0; mid < movingBodies.length; mid++) {
      let body = movingBodies[mid]
      let p = mid * 8
      if (!body) continue
      if (body.isKinematic) {
        vec.set(buffer[p++], buffer[p++], buffer[p++])
        body.setPosition(vec)
        buffer[p++] = body.sleeping
        quat.set(buffer[p++], buffer[p++], buffer[p++], buffer[p++])
        body.setQuaternion(quat)
      }
    }
    if (now - lastStep > 1024) nextStep = now
    let deadline = Date.now() + 256
    while (now > nextStep && Date.now() < deadline) {
      world.step()
      for (let mid = 0; mid < movingBodies.length; mid++) {
        let body = movingBodies[mid]
        if (!body) continue
        emitCollisions(body)
      }
      nextStep += world.timerate
    }
    for (let mid = 0; mid < movingBodies.length; mid++) {
      let body = movingBodies[mid]
      let p = mid * 8
      if (!body) continue
      if (!body.isKinematic) {
        buffer[p++] = body.pos.x
        buffer[p++] = body.pos.y
        buffer[p++] = body.pos.z
        buffer[p++] = body.sleeping
        buffer[p++] = body.quaternion.x
        buffer[p++] = body.quaternion.y
        buffer[p++] = body.quaternion.z
        buffer[p++] = body.quaternion.w
      }
    }
    postMessage(buffer, [buffer.buffer])
    lastStep = now
  }
}

function worldCommand(params) {
  if (typeof params[0] === "number") {
    params.shift()
  }
  switch (params.shift()) {
    case "body":
      bodyCommand(params)
      break
    case "joint":
      jointCommand(params)
      break
    case "gravity":
      world.gravity.copy(params[0])
      break
  }
}

function bodyCommand(params) {
  let id = params.shift()
  let body = bodies[id]
  switch (params.shift()) {
    case "shape":
      shapeCommand(body, params)
      break
    case "create":
      if (body) {
        world.removeRigidBody(body)
        if (body._mid_ !== null)
          movingBodies[body._mid_] = null
      }
      bodies[id] = body = world.add({
        move: params[0].type !== "static",
        kinematic: params[0].type === "kinematic",
      })
      body.resetPosition(params[0].position.x, params[0].position.y, params[0].position.z)
      body.resetQuaternion(params[0].quaternion)
      body._id_ = id
      body._mid_ = params[0].mid
      if (body._mid_ !== null)
        movingBodies[body._mid_] = body
      body._shapes_ = [body.shapes]
      break
    case "remove":
      world.removeRigidBody(body)
      bodies[id] = null
      if (body._mid_ !== null)
        movingBodies[body._mid_] = null
      break
    case "position":
      body.resetPosition(params[0].x, params[0].y, params[0].z)
      break
    case "quaternion":
      body.resetQuaternion(params[0])
      break
    case "type":
      body.move = params[0] !== "static"
      body.isKinematic = params[0] === "kinematic"

      // body can sleep or not
      if (body.isKinematic) body.allowSleep = false
      else body.allowSleep = true

      // body static or dynamic
      if (body.move) {
        body.setupMass(OIMO.BODY_DYNAMIC)
      } else {
        body.setupMass(OIMO.BODY_STATIC)
      }

      // force sleep on not
      if (body.move) {
        body.awake()
      }
      break
    case "belongsTo":
      body._belongsTo_ = params[0]
      body._shapes_.forEach(shape => { shape.belongsTo = params[0] })
      break
    case "collidesWith":
      body._collidesWith_ = params[0]
      body._shapes_.forEach(shape => { shape.collidesWith = params[0] })
      break
    case "emitsWith":
      body._emitsWith_ = params[0]
      break
    case "sleeping":
      if (params[0]) body.sleep()
      else body.awake()
      break
  }
}

function jointCommand(params) {
  let id = params.shift()
  let joint = joints[id]
  switch (params.shift()) {
    case "create":
      if (joint) {
        world.removeJoint(joint)
      }
      joints[id] = joint = world.add({
        move: params[0].type !== "static",
        kinematic: params[0].type === "kinematic",
      })
      joint.resetPosition(params[0].position.x, params[0].position.y, params[0].position.z)
      joint.resetQuaternion(params[0].quaternion)
      joint._id_ = id
      break
    case "remove":
      world.removeJoint(joint)
      joints[id] = null
      break
  }
}

function shapeCommand(body, params) {
  if (!body) return
  let id = params.shift()
  let shape = body._shapes_[id]
  switch (params.shift()) {
    case "create":
      if (shape)
        body.removeShape(shape)
      let sc = new OIMO.ShapeConfig()
      sc.relativePosition.copy(params[0].position)
      sc.relativeRotation.setQuat(quat.copy(params[0].quaternion))
      switch (params[0].type) {
        case "sphere": shape = new OIMO.Sphere(sc, params[0].size.x / 2); break
        case "cylinder": shape = new OIMO.Cylinder(sc, params[0].size.x / 2, params[0].size.y); break
        // case "plane": shape = new OIMO.Plane(sc); break
        default: shape = new OIMO.Box(sc, params[0].size.x, params[0].size.y, params[0].size.z)
      }
      shape._id_ = id
      shape.belongsTo = body._belongsTo_
      shape.collidesWith = body._collidesWith_
      // shape._emitsWith_ = body._emitsWith_
      body.addShape(body._shapes_[id] = shape)
      break
    case "remove":
      body.removeShape(shape)
      body._shapes_[id] = null
      break
  }
}


function emitCollisions(body) {
  if (!body._emitsWith_) return
  let b1, b2
  let contact = world.contacts
  while (contact !== null) {
    b1 = contact.body1
    b2 = contact.body2
    if ((b1 === body && (b2._belongsTo_ & b1._emitsWith_)) || (b2 === body && (b1._belongsTo_ & b2._emitsWith_))) {
      if (contact.touching && !contact.close) {
        let other = b1 === body ? b2 : b1
        let shape1 = b1 === body ? contact.shape1 : contact.shape2
        let shape2 = b1 === body ? contact.shape2 : contact.shape1
        let event = {
          event: "collision",
          body1: body._id_,
          body2: other._id_,
          shape1: shape1._id_,
          shape2: shape2._id_
        }
        postMessage("world body " + body._id_ + " emits " + cmd.stringifyParam(event))
      }
    }
    contact = contact.next
  }
}

init()
}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./libs/cmdCodec":1,"./libs/oimo":2}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvbGlicy9jbWRDb2RlYy5qcyIsInNyYy9saWJzL29pbW8uanMiLCJzcmMvb2ltb1dvcmtlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDMStYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIm1vZHVsZS5leHBvcnRzID0ge1xyXG4gIHBhcnNlOiBmdW5jdGlvbiAoY21kKSB7XHJcbiAgICBsZXQgd29yZHMgPSBjbWQuc3BsaXQoXCIgXCIpXHJcbiAgICBsZXQgYXJncyA9IFtdXHJcbiAgICBmb3IgKGxldCB3b3JkIG9mIHdvcmRzKSB7XHJcbiAgICAgIGlmICh3b3JkKSB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIGFyZ3MucHVzaChKU09OLnBhcnNlKHdvcmQpKVxyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICBpZiAod29yZCAhPT0gXCI9XCIpXHJcbiAgICAgICAgICAgIGFyZ3MucHVzaCh3b3JkKVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGFyZ3NcclxuICB9LFxyXG4gIHN0cmluZ2lmeVBhcmFtOiBmdW5jdGlvbiAodmFsKSB7XHJcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodmFsKS5yZXBsYWNlQWxsKFwiIFwiLCBcIlxcXFx1MDAyMFwiKS5yZXBsYWNlQWxsKFwiXFxcIl9cIiwgXCJcXFwiXCIpXHJcbiAgfVxyXG59IiwiKGZ1bmN0aW9uIChnbG9iYWwsIGZhY3RvcnkpIHtcbiAgdHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnID8gZmFjdG9yeShleHBvcnRzKSA6XG4gICAgdHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kID8gZGVmaW5lKFsnZXhwb3J0cyddLCBmYWN0b3J5KSA6XG4gICAgICAoZ2xvYmFsID0gZ2xvYmFsIHx8IHNlbGYsIGZhY3RvcnkoZ2xvYmFsLk9JTU8gPSB7fSkpO1xufSh0aGlzLCBmdW5jdGlvbiAoZXhwb3J0cykge1xuICAndXNlIHN0cmljdCc7XG5cbiAgLy8gUG9seWZpbGxzXG5cbiAgaWYgKE51bWJlci5FUFNJTE9OID09PSB1bmRlZmluZWQpIHtcblxuICAgIE51bWJlci5FUFNJTE9OID0gTWF0aC5wb3coMiwgLSA1Mik7XG5cbiAgfVxuXG4gIC8vXG5cbiAgaWYgKE1hdGguc2lnbiA9PT0gdW5kZWZpbmVkKSB7XG5cbiAgICAvLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9NYXRoL3NpZ25cblxuICAgIE1hdGguc2lnbiA9IGZ1bmN0aW9uICh4KSB7XG5cbiAgICAgIHJldHVybiAoeCA8IDApID8gLSAxIDogKHggPiAwKSA/IDEgOiArIHg7XG5cbiAgICB9O1xuXG4gIH1cblxuICBpZiAoRnVuY3Rpb24ucHJvdG90eXBlLm5hbWUgPT09IHVuZGVmaW5lZCkge1xuXG4gICAgLy8gTWlzc2luZyBpbiBJRTktMTEuXG4gICAgLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvRnVuY3Rpb24vbmFtZVxuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEZ1bmN0aW9uLnByb3RvdHlwZSwgJ25hbWUnLCB7XG5cbiAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuXG4gICAgICAgIHJldHVybiB0aGlzLnRvU3RyaW5nKCkubWF0Y2goL15cXHMqZnVuY3Rpb25cXHMqKFteXFwoXFxzXSopLylbMV07XG5cbiAgICAgIH1cblxuICAgIH0pO1xuXG4gIH1cblxuICBpZiAoT2JqZWN0LmFzc2lnbiA9PT0gdW5kZWZpbmVkKSB7XG5cbiAgICAvLyBNaXNzaW5nIGluIElFLlxuICAgIC8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL09iamVjdC9hc3NpZ25cblxuICAgIChmdW5jdGlvbiAoKSB7XG5cbiAgICAgIE9iamVjdC5hc3NpZ24gPSBmdW5jdGlvbiAodGFyZ2V0KSB7XG5cbiAgICAgICAgaWYgKHRhcmdldCA9PT0gdW5kZWZpbmVkIHx8IHRhcmdldCA9PT0gbnVsbCkge1xuXG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNvbnZlcnQgdW5kZWZpbmVkIG9yIG51bGwgdG8gb2JqZWN0Jyk7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBvdXRwdXQgPSBPYmplY3QodGFyZ2V0KTtcblxuICAgICAgICBmb3IgKHZhciBpbmRleCA9IDE7IGluZGV4IDwgYXJndW1lbnRzLmxlbmd0aDsgaW5kZXgrKykge1xuXG4gICAgICAgICAgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpbmRleF07XG5cbiAgICAgICAgICBpZiAoc291cmNlICE9PSB1bmRlZmluZWQgJiYgc291cmNlICE9PSBudWxsKSB7XG5cbiAgICAgICAgICAgIGZvciAodmFyIG5leHRLZXkgaW4gc291cmNlKSB7XG5cbiAgICAgICAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIG5leHRLZXkpKSB7XG5cbiAgICAgICAgICAgICAgICBvdXRwdXRbbmV4dEtleV0gPSBzb3VyY2VbbmV4dEtleV07XG5cbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBvdXRwdXQ7XG5cbiAgICAgIH07XG5cbiAgICB9KSgpO1xuXG4gIH1cblxuICAvKlxuICAgKiBBIGxpc3Qgb2YgY29uc3RhbnRzIGJ1aWx0LWluIGZvclxuICAgKiB0aGUgcGh5c2ljcyBlbmdpbmUuXG4gICAqL1xuXG4gIHZhciBSRVZJU0lPTiA9ICcxLjAuOSc7XG5cbiAgLy8gQnJvYWRQaGFzZVxuICB2YXIgQlJfTlVMTCA9IDA7XG4gIHZhciBCUl9CUlVURV9GT1JDRSA9IDE7XG4gIHZhciBCUl9TV0VFUF9BTkRfUFJVTkUgPSAyO1xuICB2YXIgQlJfQk9VTkRJTkdfVk9MVU1FX1RSRUUgPSAzO1xuXG4gIC8vIEJvZHkgdHlwZVxuICB2YXIgQk9EWV9OVUxMID0gMDtcbiAgdmFyIEJPRFlfRFlOQU1JQyA9IDE7XG4gIHZhciBCT0RZX1NUQVRJQyA9IDI7XG4gIHZhciBCT0RZX0tJTkVNQVRJQyA9IDM7XG4gIHZhciBCT0RZX0dIT1NUID0gNDtcblxuICAvLyBTaGFwZSB0eXBlXG4gIHZhciBTSEFQRV9OVUxMID0gMDtcbiAgdmFyIFNIQVBFX1NQSEVSRSA9IDE7XG4gIHZhciBTSEFQRV9CT1ggPSAyO1xuICB2YXIgU0hBUEVfQ1lMSU5ERVIgPSAzO1xuICB2YXIgU0hBUEVfUExBTkUgPSA0O1xuICB2YXIgU0hBUEVfUEFSVElDTEUgPSA1O1xuICB2YXIgU0hBUEVfVEVUUkEgPSA2O1xuXG4gIC8vIEpvaW50IHR5cGVcbiAgdmFyIEpPSU5UX05VTEwgPSAwO1xuICB2YXIgSk9JTlRfRElTVEFOQ0UgPSAxO1xuICB2YXIgSk9JTlRfQkFMTF9BTkRfU09DS0VUID0gMjtcbiAgdmFyIEpPSU5UX0hJTkdFID0gMztcbiAgdmFyIEpPSU5UX1dIRUVMID0gNDtcbiAgdmFyIEpPSU5UX1NMSURFUiA9IDU7XG4gIHZhciBKT0lOVF9QUklTTUFUSUMgPSA2O1xuXG4gIC8vIEFBQkIgYXByb3hpbWF0aW9uXG4gIHZhciBBQUJCX1BST1ggPSAwLjAwNTtcblxuICB2YXIgX01hdGggPSB7XG5cbiAgICBzcXJ0OiBNYXRoLnNxcnQsXG4gICAgYWJzOiBNYXRoLmFicyxcbiAgICBmbG9vcjogTWF0aC5mbG9vcixcbiAgICBjb3M6IE1hdGguY29zLFxuICAgIHNpbjogTWF0aC5zaW4sXG4gICAgYWNvczogTWF0aC5hY29zLFxuICAgIGFzaW46IE1hdGguYXNpbixcbiAgICBhdGFuMjogTWF0aC5hdGFuMixcbiAgICByb3VuZDogTWF0aC5yb3VuZCxcbiAgICBwb3c6IE1hdGgucG93LFxuICAgIG1heDogTWF0aC5tYXgsXG4gICAgbWluOiBNYXRoLm1pbixcbiAgICByYW5kb206IE1hdGgucmFuZG9tLFxuXG4gICAgZGVndG9yYWQ6IDAuMDE3NDUzMjkyNTE5OTQzMjk1NyxcbiAgICByYWR0b2RlZzogNTcuMjk1Nzc5NTEzMDgyMzIwODc2LFxuICAgIFBJOiAzLjE0MTU5MjY1MzU4OTc5MyxcbiAgICBUd29QSTogNi4yODMxODUzMDcxNzk1ODYsXG4gICAgUEk5MDogMS41NzA3OTYzMjY3OTQ4OTYsXG4gICAgUEkyNzA6IDQuNzEyMzg4OTgwMzg0Njg5LFxuXG4gICAgSU5GOiBJbmZpbml0eSxcbiAgICBFUFo6IDAuMDAwMDEsXG4gICAgRVBaMjogMC4wMDAwMDEsXG5cbiAgICBsZXJwOiBmdW5jdGlvbiAoeCwgeSwgdCkge1xuXG4gICAgICByZXR1cm4gKDEgLSB0KSAqIHggKyB0ICogeTtcblxuICAgIH0sXG5cbiAgICByYW5kSW50OiBmdW5jdGlvbiAobG93LCBoaWdoKSB7XG5cbiAgICAgIHJldHVybiBsb3cgKyBfTWF0aC5mbG9vcihfTWF0aC5yYW5kb20oKSAqIChoaWdoIC0gbG93ICsgMSkpO1xuXG4gICAgfSxcblxuICAgIHJhbmQ6IGZ1bmN0aW9uIChsb3csIGhpZ2gpIHtcblxuICAgICAgcmV0dXJuIGxvdyArIF9NYXRoLnJhbmRvbSgpICogKGhpZ2ggLSBsb3cpO1xuXG4gICAgfSxcblxuICAgIGdlbmVyYXRlVVVJRDogZnVuY3Rpb24gKCkge1xuXG4gICAgICAvLyBodHRwOi8vd3d3LmJyb29mYS5jb20vVG9vbHMvTWF0aC51dWlkLmh0bVxuXG4gICAgICB2YXIgY2hhcnMgPSAnMDEyMzQ1Njc4OUFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXonLnNwbGl0KCcnKTtcbiAgICAgIHZhciB1dWlkID0gbmV3IEFycmF5KDM2KTtcbiAgICAgIHZhciBybmQgPSAwLCByO1xuXG4gICAgICByZXR1cm4gZnVuY3Rpb24gZ2VuZXJhdGVVVUlEKCkge1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMzY7IGkrKykge1xuXG4gICAgICAgICAgaWYgKGkgPT09IDggfHwgaSA9PT0gMTMgfHwgaSA9PT0gMTggfHwgaSA9PT0gMjMpIHtcblxuICAgICAgICAgICAgdXVpZFtpXSA9ICctJztcblxuICAgICAgICAgIH0gZWxzZSBpZiAoaSA9PT0gMTQpIHtcblxuICAgICAgICAgICAgdXVpZFtpXSA9ICc0JztcblxuICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIGlmIChybmQgPD0gMHgwMikgcm5kID0gMHgyMDAwMDAwICsgKE1hdGgucmFuZG9tKCkgKiAweDEwMDAwMDApIHwgMDtcbiAgICAgICAgICAgIHIgPSBybmQgJiAweGY7XG4gICAgICAgICAgICBybmQgPSBybmQgPj4gNDtcbiAgICAgICAgICAgIHV1aWRbaV0gPSBjaGFyc1soaSA9PT0gMTkpID8gKHIgJiAweDMpIHwgMHg4IDogcl07XG5cbiAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB1dWlkLmpvaW4oJycpO1xuXG4gICAgICB9O1xuXG4gICAgfSgpLFxuXG4gICAgaW50OiBmdW5jdGlvbiAoeCkge1xuXG4gICAgICByZXR1cm4gX01hdGguZmxvb3IoeCk7XG5cbiAgICB9LFxuXG4gICAgZml4OiBmdW5jdGlvbiAoeCwgbikge1xuXG4gICAgICByZXR1cm4geC50b0ZpeGVkKG4gfHwgMywgMTApO1xuXG4gICAgfSxcblxuICAgIGNsYW1wOiBmdW5jdGlvbiAodmFsdWUsIG1pbiwgbWF4KSB7XG5cbiAgICAgIHJldHVybiBfTWF0aC5tYXgobWluLCBfTWF0aC5taW4obWF4LCB2YWx1ZSkpO1xuXG4gICAgfSxcblxuICAgIC8vY2xhbXA6IGZ1bmN0aW9uICggeCwgYSwgYiApIHsgcmV0dXJuICggeCA8IGEgKSA/IGEgOiAoICggeCA+IGIgKSA/IGIgOiB4ICk7IH0sXG5cblxuXG4gICAgZGlzdGFuY2U6IGZ1bmN0aW9uIChwMSwgcDIpIHtcblxuICAgICAgdmFyIHhkID0gcDJbMF0gLSBwMVswXTtcbiAgICAgIHZhciB5ZCA9IHAyWzFdIC0gcDFbMV07XG4gICAgICB2YXIgemQgPSBwMlsyXSAtIHAxWzJdO1xuICAgICAgcmV0dXJuIF9NYXRoLnNxcnQoeGQgKiB4ZCArIHlkICogeWQgKyB6ZCAqIHpkKTtcblxuICAgIH0sXG5cbiAgICAvKnVud3JhcERlZ3JlZXM6IGZ1bmN0aW9uICggciApIHtcblxuICAgICAgICByID0gciAlIDM2MDtcbiAgICAgICAgaWYgKHIgPiAxODApIHIgLT0gMzYwO1xuICAgICAgICBpZiAociA8IC0xODApIHIgKz0gMzYwO1xuICAgICAgICByZXR1cm4gcjtcblxuICAgIH0sXG5cbiAgICB1bndyYXBSYWRpYW46IGZ1bmN0aW9uKCByICl7XG5cbiAgICAgICAgciA9IHIgJSBfTWF0aC5Ud29QSTtcbiAgICAgICAgaWYgKHIgPiBfTWF0aC5QSSkgciAtPSBfTWF0aC5Ud29QSTtcbiAgICAgICAgaWYgKHIgPCAtX01hdGguUEkpIHIgKz0gX01hdGguVHdvUEk7XG4gICAgICAgIHJldHVybiByO1xuXG4gICAgfSwqL1xuXG4gICAgYWNvc0NsYW1wOiBmdW5jdGlvbiAoY29zKSB7XG5cbiAgICAgIGlmIChjb3MgPiAxKSByZXR1cm4gMDtcbiAgICAgIGVsc2UgaWYgKGNvcyA8IC0xKSByZXR1cm4gX01hdGguUEk7XG4gICAgICBlbHNlIHJldHVybiBfTWF0aC5hY29zKGNvcyk7XG5cbiAgICB9LFxuXG4gICAgZGlzdGFuY2VWZWN0b3I6IGZ1bmN0aW9uICh2MSwgdjIpIHtcblxuICAgICAgdmFyIHhkID0gdjEueCAtIHYyLng7XG4gICAgICB2YXIgeWQgPSB2MS55IC0gdjIueTtcbiAgICAgIHZhciB6ZCA9IHYxLnogLSB2Mi56O1xuICAgICAgcmV0dXJuIHhkICogeGQgKyB5ZCAqIHlkICsgemQgKiB6ZDtcblxuICAgIH0sXG5cbiAgICBkb3RWZWN0b3JzOiBmdW5jdGlvbiAoYSwgYikge1xuXG4gICAgICByZXR1cm4gYS54ICogYi54ICsgYS55ICogYi55ICsgYS56ICogYi56O1xuXG4gICAgfSxcblxuICB9O1xuXG4gIGZ1bmN0aW9uIHByaW50RXJyb3IoY2xhenosIG1zZykge1xuICAgIGNvbnNvbGUuZXJyb3IoXCJbT0lNT10gXCIgKyBjbGF6eiArIFwiOiBcIiArIG1zZyk7XG4gIH1cblxuICAvLyBBIHBlcmZvcm1hbmNlIGV2YWx1YXRvclxuXG4gIGZ1bmN0aW9uIEluZm9EaXNwbGF5KHdvcmxkKSB7XG5cbiAgICB0aGlzLnBhcmVudCA9IHdvcmxkO1xuXG4gICAgdGhpcy5pbmZvcyA9IG5ldyBGbG9hdDMyQXJyYXkoMTMpO1xuICAgIHRoaXMuZiA9IFswLCAwLCAwXTtcblxuICAgIHRoaXMudGltZXMgPSBbMCwgMCwgMCwgMF07XG5cbiAgICB0aGlzLmJyb2FkUGhhc2UgPSB0aGlzLnBhcmVudC5icm9hZFBoYXNlVHlwZTtcblxuICAgIHRoaXMudmVyc2lvbiA9IFJFVklTSU9OO1xuXG4gICAgdGhpcy5mcHMgPSAwO1xuXG4gICAgdGhpcy50dCA9IDA7XG5cbiAgICB0aGlzLmJyb2FkUGhhc2VUaW1lID0gMDtcbiAgICB0aGlzLm5hcnJvd1BoYXNlVGltZSA9IDA7XG4gICAgdGhpcy5zb2x2aW5nVGltZSA9IDA7XG4gICAgdGhpcy50b3RhbFRpbWUgPSAwO1xuICAgIHRoaXMudXBkYXRlVGltZSA9IDA7XG5cbiAgICB0aGlzLk1heEJyb2FkUGhhc2VUaW1lID0gMDtcbiAgICB0aGlzLk1heE5hcnJvd1BoYXNlVGltZSA9IDA7XG4gICAgdGhpcy5NYXhTb2x2aW5nVGltZSA9IDA7XG4gICAgdGhpcy5NYXhUb3RhbFRpbWUgPSAwO1xuICAgIHRoaXMuTWF4VXBkYXRlVGltZSA9IDA7XG4gIH1cbiAgT2JqZWN0LmFzc2lnbihJbmZvRGlzcGxheS5wcm90b3R5cGUsIHtcblxuICAgIHNldFRpbWU6IGZ1bmN0aW9uIChuKSB7XG4gICAgICB0aGlzLnRpbWVzW24gfHwgMF0gPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICB9LFxuXG4gICAgcmVzZXRNYXg6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgdGhpcy5NYXhCcm9hZFBoYXNlVGltZSA9IDA7XG4gICAgICB0aGlzLk1heE5hcnJvd1BoYXNlVGltZSA9IDA7XG4gICAgICB0aGlzLk1heFNvbHZpbmdUaW1lID0gMDtcbiAgICAgIHRoaXMuTWF4VG90YWxUaW1lID0gMDtcbiAgICAgIHRoaXMuTWF4VXBkYXRlVGltZSA9IDA7XG5cbiAgICB9LFxuXG4gICAgY2FsY0Jyb2FkUGhhc2U6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgdGhpcy5zZXRUaW1lKDIpO1xuICAgICAgdGhpcy5icm9hZFBoYXNlVGltZSA9IHRoaXMudGltZXNbMl0gLSB0aGlzLnRpbWVzWzFdO1xuXG4gICAgfSxcblxuICAgIGNhbGNOYXJyb3dQaGFzZTogZnVuY3Rpb24gKCkge1xuXG4gICAgICB0aGlzLnNldFRpbWUoMyk7XG4gICAgICB0aGlzLm5hcnJvd1BoYXNlVGltZSA9IHRoaXMudGltZXNbM10gLSB0aGlzLnRpbWVzWzJdO1xuXG4gICAgfSxcblxuICAgIGNhbGNFbmQ6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgdGhpcy5zZXRUaW1lKDIpO1xuICAgICAgdGhpcy5zb2x2aW5nVGltZSA9IHRoaXMudGltZXNbMl0gLSB0aGlzLnRpbWVzWzFdO1xuICAgICAgdGhpcy50b3RhbFRpbWUgPSB0aGlzLnRpbWVzWzJdIC0gdGhpcy50aW1lc1swXTtcbiAgICAgIHRoaXMudXBkYXRlVGltZSA9IHRoaXMudG90YWxUaW1lIC0gKHRoaXMuYnJvYWRQaGFzZVRpbWUgKyB0aGlzLm5hcnJvd1BoYXNlVGltZSArIHRoaXMuc29sdmluZ1RpbWUpO1xuXG4gICAgICBpZiAodGhpcy50dCA9PT0gMTAwKSB0aGlzLnJlc2V0TWF4KCk7XG5cbiAgICAgIGlmICh0aGlzLnR0ID4gMTAwKSB7XG4gICAgICAgIGlmICh0aGlzLmJyb2FkUGhhc2VUaW1lID4gdGhpcy5NYXhCcm9hZFBoYXNlVGltZSkgdGhpcy5NYXhCcm9hZFBoYXNlVGltZSA9IHRoaXMuYnJvYWRQaGFzZVRpbWU7XG4gICAgICAgIGlmICh0aGlzLm5hcnJvd1BoYXNlVGltZSA+IHRoaXMuTWF4TmFycm93UGhhc2VUaW1lKSB0aGlzLk1heE5hcnJvd1BoYXNlVGltZSA9IHRoaXMubmFycm93UGhhc2VUaW1lO1xuICAgICAgICBpZiAodGhpcy5zb2x2aW5nVGltZSA+IHRoaXMuTWF4U29sdmluZ1RpbWUpIHRoaXMuTWF4U29sdmluZ1RpbWUgPSB0aGlzLnNvbHZpbmdUaW1lO1xuICAgICAgICBpZiAodGhpcy50b3RhbFRpbWUgPiB0aGlzLk1heFRvdGFsVGltZSkgdGhpcy5NYXhUb3RhbFRpbWUgPSB0aGlzLnRvdGFsVGltZTtcbiAgICAgICAgaWYgKHRoaXMudXBkYXRlVGltZSA+IHRoaXMuTWF4VXBkYXRlVGltZSkgdGhpcy5NYXhVcGRhdGVUaW1lID0gdGhpcy51cGRhdGVUaW1lO1xuICAgICAgfVxuXG5cbiAgICAgIHRoaXMudXBmcHMoKTtcblxuICAgICAgdGhpcy50dCsrO1xuICAgICAgaWYgKHRoaXMudHQgPiA1MDApIHRoaXMudHQgPSAwO1xuXG4gICAgfSxcblxuXG4gICAgdXBmcHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuZlsxXSA9IERhdGUubm93KCk7XG4gICAgICBpZiAodGhpcy5mWzFdIC0gMTAwMCA+IHRoaXMuZlswXSkgeyB0aGlzLmZbMF0gPSB0aGlzLmZbMV07IHRoaXMuZnBzID0gdGhpcy5mWzJdOyB0aGlzLmZbMl0gPSAwOyB9IHRoaXMuZlsyXSsrO1xuICAgIH0sXG5cbiAgICBzaG93OiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgaW5mbyA9IFtcbiAgICAgICAgXCJPaW1vLmpzIFwiICsgdGhpcy52ZXJzaW9uICsgXCI8YnI+XCIsXG4gICAgICAgIHRoaXMuYnJvYWRQaGFzZSArIFwiPGJyPjxicj5cIixcbiAgICAgICAgXCJGUFM6IFwiICsgdGhpcy5mcHMgKyBcIiBmcHM8YnI+PGJyPlwiLFxuICAgICAgICBcInJpZ2lkYm9keSBcIiArIHRoaXMucGFyZW50Lm51bVJpZ2lkQm9kaWVzICsgXCI8YnI+XCIsXG4gICAgICAgIFwiY29udGFjdCAmbmJzcDsmbmJzcDtcIiArIHRoaXMucGFyZW50Lm51bUNvbnRhY3RzICsgXCI8YnI+XCIsXG4gICAgICAgIFwiY3QtcG9pbnQgJm5ic3A7XCIgKyB0aGlzLnBhcmVudC5udW1Db250YWN0UG9pbnRzICsgXCI8YnI+XCIsXG4gICAgICAgIFwicGFpcmNoZWNrIFwiICsgdGhpcy5wYXJlbnQuYnJvYWRQaGFzZS5udW1QYWlyQ2hlY2tzICsgXCI8YnI+XCIsXG4gICAgICAgIFwiaXNsYW5kICZuYnNwOyZuYnNwOyZuYnNwO1wiICsgdGhpcy5wYXJlbnQubnVtSXNsYW5kcyArIFwiPGJyPjxicj5cIixcbiAgICAgICAgXCJUaW1lIGluIG1pbGxpc2Vjb25kczxicj48YnI+XCIsXG4gICAgICAgIFwiYnJvYWRwaGFzZSAmbmJzcDtcIiArIF9NYXRoLmZpeCh0aGlzLmJyb2FkUGhhc2VUaW1lKSArIFwiIHwgXCIgKyBfTWF0aC5maXgodGhpcy5NYXhCcm9hZFBoYXNlVGltZSkgKyBcIjxicj5cIixcbiAgICAgICAgXCJuYXJyb3dwaGFzZSBcIiArIF9NYXRoLmZpeCh0aGlzLm5hcnJvd1BoYXNlVGltZSkgKyBcIiB8IFwiICsgX01hdGguZml4KHRoaXMuTWF4TmFycm93UGhhc2VUaW1lKSArIFwiPGJyPlwiLFxuICAgICAgICBcInNvbHZpbmcgJm5ic3A7Jm5ic3A7Jm5ic3A7Jm5ic3A7XCIgKyBfTWF0aC5maXgodGhpcy5zb2x2aW5nVGltZSkgKyBcIiB8IFwiICsgX01hdGguZml4KHRoaXMuTWF4U29sdmluZ1RpbWUpICsgXCI8YnI+XCIsXG4gICAgICAgIFwidG90YWwgJm5ic3A7Jm5ic3A7Jm5ic3A7Jm5ic3A7Jm5ic3A7Jm5ic3A7XCIgKyBfTWF0aC5maXgodGhpcy50b3RhbFRpbWUpICsgXCIgfCBcIiArIF9NYXRoLmZpeCh0aGlzLk1heFRvdGFsVGltZSkgKyBcIjxicj5cIixcbiAgICAgICAgXCJ1cGRhdGluZyAmbmJzcDsmbmJzcDsmbmJzcDtcIiArIF9NYXRoLmZpeCh0aGlzLnVwZGF0ZVRpbWUpICsgXCIgfCBcIiArIF9NYXRoLmZpeCh0aGlzLk1heFVwZGF0ZVRpbWUpICsgXCI8YnI+XCJcbiAgICAgIF0uam9pbihcIlxcblwiKTtcbiAgICAgIHJldHVybiBpbmZvO1xuICAgIH0sXG5cbiAgICB0b0FycmF5OiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLmluZm9zWzBdID0gdGhpcy5wYXJlbnQuYnJvYWRQaGFzZS50eXBlcztcbiAgICAgIHRoaXMuaW5mb3NbMV0gPSB0aGlzLnBhcmVudC5udW1SaWdpZEJvZGllcztcbiAgICAgIHRoaXMuaW5mb3NbMl0gPSB0aGlzLnBhcmVudC5udW1Db250YWN0cztcbiAgICAgIHRoaXMuaW5mb3NbM10gPSB0aGlzLnBhcmVudC5icm9hZFBoYXNlLm51bVBhaXJDaGVja3M7XG4gICAgICB0aGlzLmluZm9zWzRdID0gdGhpcy5wYXJlbnQubnVtQ29udGFjdFBvaW50cztcbiAgICAgIHRoaXMuaW5mb3NbNV0gPSB0aGlzLnBhcmVudC5udW1Jc2xhbmRzO1xuICAgICAgdGhpcy5pbmZvc1s2XSA9IHRoaXMuYnJvYWRQaGFzZVRpbWU7XG4gICAgICB0aGlzLmluZm9zWzddID0gdGhpcy5uYXJyb3dQaGFzZVRpbWU7XG4gICAgICB0aGlzLmluZm9zWzhdID0gdGhpcy5zb2x2aW5nVGltZTtcbiAgICAgIHRoaXMuaW5mb3NbOV0gPSB0aGlzLnVwZGF0ZVRpbWU7XG4gICAgICB0aGlzLmluZm9zWzEwXSA9IHRoaXMudG90YWxUaW1lO1xuICAgICAgdGhpcy5pbmZvc1sxMV0gPSB0aGlzLmZwcztcbiAgICAgIHJldHVybiB0aGlzLmluZm9zO1xuICAgIH1cblxuICB9KTtcblxuICBmdW5jdGlvbiBWZWMzKHgsIHksIHopIHtcblxuICAgIHRoaXMueCA9IHggfHwgMDtcbiAgICB0aGlzLnkgPSB5IHx8IDA7XG4gICAgdGhpcy56ID0geiB8fCAwO1xuXG4gIH1cblxuICBPYmplY3QuYXNzaWduKFZlYzMucHJvdG90eXBlLCB7XG5cbiAgICBWZWMzOiB0cnVlLFxuXG4gICAgc2V0OiBmdW5jdGlvbiAoeCwgeSwgeikge1xuXG4gICAgICB0aGlzLnggPSB4O1xuICAgICAgdGhpcy55ID0geTtcbiAgICAgIHRoaXMueiA9IHo7XG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIH0sXG5cbiAgICBhZGQ6IGZ1bmN0aW9uIChhLCBiKSB7XG5cbiAgICAgIGlmIChiICE9PSB1bmRlZmluZWQpIHJldHVybiB0aGlzLmFkZFZlY3RvcnMoYSwgYik7XG5cbiAgICAgIHRoaXMueCArPSBhLng7XG4gICAgICB0aGlzLnkgKz0gYS55O1xuICAgICAgdGhpcy56ICs9IGEuejtcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfSxcblxuICAgIGFkZFZlY3RvcnM6IGZ1bmN0aW9uIChhLCBiKSB7XG5cbiAgICAgIHRoaXMueCA9IGEueCArIGIueDtcbiAgICAgIHRoaXMueSA9IGEueSArIGIueTtcbiAgICAgIHRoaXMueiA9IGEueiArIGIuejtcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfSxcblxuICAgIGFkZEVxdWFsOiBmdW5jdGlvbiAodikge1xuXG4gICAgICB0aGlzLnggKz0gdi54O1xuICAgICAgdGhpcy55ICs9IHYueTtcbiAgICAgIHRoaXMueiArPSB2Lno7XG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIH0sXG5cbiAgICBzdWI6IGZ1bmN0aW9uIChhLCBiKSB7XG5cbiAgICAgIGlmIChiICE9PSB1bmRlZmluZWQpIHJldHVybiB0aGlzLnN1YlZlY3RvcnMoYSwgYik7XG5cbiAgICAgIHRoaXMueCAtPSBhLng7XG4gICAgICB0aGlzLnkgLT0gYS55O1xuICAgICAgdGhpcy56IC09IGEuejtcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfSxcblxuICAgIHN1YlZlY3RvcnM6IGZ1bmN0aW9uIChhLCBiKSB7XG5cbiAgICAgIHRoaXMueCA9IGEueCAtIGIueDtcbiAgICAgIHRoaXMueSA9IGEueSAtIGIueTtcbiAgICAgIHRoaXMueiA9IGEueiAtIGIuejtcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfSxcblxuICAgIHN1YkVxdWFsOiBmdW5jdGlvbiAodikge1xuXG4gICAgICB0aGlzLnggLT0gdi54O1xuICAgICAgdGhpcy55IC09IHYueTtcbiAgICAgIHRoaXMueiAtPSB2Lno7XG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIH0sXG5cbiAgICBzY2FsZTogZnVuY3Rpb24gKHYsIHMpIHtcblxuICAgICAgdGhpcy54ID0gdi54ICogcztcbiAgICAgIHRoaXMueSA9IHYueSAqIHM7XG4gICAgICB0aGlzLnogPSB2LnogKiBzO1xuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICB9LFxuXG4gICAgc2NhbGVFcXVhbDogZnVuY3Rpb24gKHMpIHtcblxuICAgICAgdGhpcy54ICo9IHM7XG4gICAgICB0aGlzLnkgKj0gcztcbiAgICAgIHRoaXMueiAqPSBzO1xuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICB9LFxuXG4gICAgbXVsdGlwbHk6IGZ1bmN0aW9uICh2KSB7XG5cbiAgICAgIHRoaXMueCAqPSB2Lng7XG4gICAgICB0aGlzLnkgKj0gdi55O1xuICAgICAgdGhpcy56ICo9IHYuejtcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfSxcblxuICAgIC8qc2NhbGVWOiBmdW5jdGlvbiggdiApe1xuXG4gICAgICAgIHRoaXMueCAqPSB2Lng7XG4gICAgICAgIHRoaXMueSAqPSB2Lnk7XG4gICAgICAgIHRoaXMueiAqPSB2Lno7XG4gICAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfSxcblxuICAgIHNjYWxlVmVjdG9yRXF1YWw6IGZ1bmN0aW9uKCB2ICl7XG5cbiAgICAgICAgdGhpcy54ICo9IHYueDtcbiAgICAgICAgdGhpcy55ICo9IHYueTtcbiAgICAgICAgdGhpcy56ICo9IHYuejtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICB9LCovXG5cbiAgICBhZGRTY2FsZWRWZWN0b3I6IGZ1bmN0aW9uICh2LCBzKSB7XG5cbiAgICAgIHRoaXMueCArPSB2LnggKiBzO1xuICAgICAgdGhpcy55ICs9IHYueSAqIHM7XG4gICAgICB0aGlzLnogKz0gdi56ICogcztcblxuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICB9LFxuXG4gICAgc3ViU2NhbGVkVmVjdG9yOiBmdW5jdGlvbiAodiwgcykge1xuXG4gICAgICB0aGlzLnggLT0gdi54ICogcztcbiAgICAgIHRoaXMueSAtPSB2LnkgKiBzO1xuICAgICAgdGhpcy56IC09IHYueiAqIHM7XG5cbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfSxcblxuICAgIC8qYWRkVGltZTogZnVuY3Rpb24gKCB2LCB0ICkge1xuXG4gICAgICAgIHRoaXMueCArPSB2LnggKiB0O1xuICAgICAgICB0aGlzLnkgKz0gdi55ICogdDtcbiAgICAgICAgdGhpcy56ICs9IHYueiAqIHQ7XG4gICAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfSxcbiAgICBcbiAgICBhZGRTY2FsZTogZnVuY3Rpb24gKCB2LCBzICkge1xuXG4gICAgICAgIHRoaXMueCArPSB2LnggKiBzO1xuICAgICAgICB0aGlzLnkgKz0gdi55ICogcztcbiAgICAgICAgdGhpcy56ICs9IHYueiAqIHM7XG4gICAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfSxcblxuICAgIHN1YlNjYWxlOiBmdW5jdGlvbiAoIHYsIHMgKSB7XG5cbiAgICAgICAgdGhpcy54IC09IHYueCAqIHM7XG4gICAgICAgIHRoaXMueSAtPSB2LnkgKiBzO1xuICAgICAgICB0aGlzLnogLT0gdi56ICogcztcbiAgICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICB9LCovXG5cbiAgICBjcm9zczogZnVuY3Rpb24gKGEsIGIpIHtcblxuICAgICAgaWYgKGIgIT09IHVuZGVmaW5lZCkgcmV0dXJuIHRoaXMuY3Jvc3NWZWN0b3JzKGEsIGIpO1xuXG4gICAgICB2YXIgeCA9IHRoaXMueCwgeSA9IHRoaXMueSwgeiA9IHRoaXMuejtcblxuICAgICAgdGhpcy54ID0geSAqIGEueiAtIHogKiBhLnk7XG4gICAgICB0aGlzLnkgPSB6ICogYS54IC0geCAqIGEuejtcbiAgICAgIHRoaXMueiA9IHggKiBhLnkgLSB5ICogYS54O1xuXG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIH0sXG5cbiAgICBjcm9zc1ZlY3RvcnM6IGZ1bmN0aW9uIChhLCBiKSB7XG5cbiAgICAgIHZhciBheCA9IGEueCwgYXkgPSBhLnksIGF6ID0gYS56O1xuICAgICAgdmFyIGJ4ID0gYi54LCBieSA9IGIueSwgYnogPSBiLno7XG5cbiAgICAgIHRoaXMueCA9IGF5ICogYnogLSBheiAqIGJ5O1xuICAgICAgdGhpcy55ID0gYXogKiBieCAtIGF4ICogYno7XG4gICAgICB0aGlzLnogPSBheCAqIGJ5IC0gYXkgKiBieDtcblxuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICB9LFxuXG4gICAgdGFuZ2VudDogZnVuY3Rpb24gKGEpIHtcblxuICAgICAgdmFyIGF4ID0gYS54LCBheSA9IGEueSwgYXogPSBhLno7XG5cbiAgICAgIHRoaXMueCA9IGF5ICogYXggLSBheiAqIGF6O1xuICAgICAgdGhpcy55ID0gLSBheiAqIGF5IC0gYXggKiBheDtcbiAgICAgIHRoaXMueiA9IGF4ICogYXogKyBheSAqIGF5O1xuXG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIH0sXG5cblxuXG5cblxuICAgIGludmVydDogZnVuY3Rpb24gKHYpIHtcblxuICAgICAgdGhpcy54ID0gLXYueDtcbiAgICAgIHRoaXMueSA9IC12Lnk7XG4gICAgICB0aGlzLnogPSAtdi56O1xuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICB9LFxuXG4gICAgbmVnYXRlOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHRoaXMueCA9IC0gdGhpcy54O1xuICAgICAgdGhpcy55ID0gLSB0aGlzLnk7XG4gICAgICB0aGlzLnogPSAtIHRoaXMuejtcblxuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICB9LFxuXG4gICAgZG90OiBmdW5jdGlvbiAodikge1xuXG4gICAgICByZXR1cm4gdGhpcy54ICogdi54ICsgdGhpcy55ICogdi55ICsgdGhpcy56ICogdi56O1xuXG4gICAgfSxcblxuICAgIGFkZGl0aW9uOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHJldHVybiB0aGlzLnggKyB0aGlzLnkgKyB0aGlzLno7XG5cbiAgICB9LFxuXG4gICAgbGVuZ3RoU3E6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgcmV0dXJuIHRoaXMueCAqIHRoaXMueCArIHRoaXMueSAqIHRoaXMueSArIHRoaXMueiAqIHRoaXMuejtcblxuICAgIH0sXG5cbiAgICBsZW5ndGg6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgcmV0dXJuIF9NYXRoLnNxcnQodGhpcy54ICogdGhpcy54ICsgdGhpcy55ICogdGhpcy55ICsgdGhpcy56ICogdGhpcy56KTtcblxuICAgIH0sXG5cbiAgICBjb3B5OiBmdW5jdGlvbiAodikge1xuXG4gICAgICB0aGlzLnggPSB2Lng7XG4gICAgICB0aGlzLnkgPSB2Lnk7XG4gICAgICB0aGlzLnogPSB2Lno7XG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIH0sXG5cbiAgICAvKm11bDogZnVuY3Rpb24oIGIsIGEsIG0gKXtcblxuICAgICAgICByZXR1cm4gdGhpcy5tdWxNYXQoIG0sIGEgKS5hZGQoIGIgKTtcblxuICAgIH0sXG5cbiAgICBtdWxNYXQ6IGZ1bmN0aW9uKCBtLCBhICl7XG5cbiAgICAgICAgdmFyIGUgPSBtLmVsZW1lbnRzO1xuICAgICAgICB2YXIgeCA9IGEueCwgeSA9IGEueSwgeiA9IGEuejtcblxuICAgICAgICB0aGlzLnggPSBlWyAwIF0gKiB4ICsgZVsgMSBdICogeSArIGVbIDIgXSAqIHo7XG4gICAgICAgIHRoaXMueSA9IGVbIDMgXSAqIHggKyBlWyA0IF0gKiB5ICsgZVsgNSBdICogejtcbiAgICAgICAgdGhpcy56ID0gZVsgNiBdICogeCArIGVbIDcgXSAqIHkgKyBlWyA4IF0gKiB6O1xuICAgICAgICByZXR1cm4gdGhpcztcblxuICAgIH0sKi9cblxuICAgIGFwcGx5TWF0cml4MzogZnVuY3Rpb24gKG0sIHRyYW5zcG9zZSkge1xuXG4gICAgICAvL2lmKCB0cmFuc3Bvc2UgKSBtID0gbS5jbG9uZSgpLnRyYW5zcG9zZSgpO1xuICAgICAgdmFyIHggPSB0aGlzLngsIHkgPSB0aGlzLnksIHogPSB0aGlzLno7XG4gICAgICB2YXIgZSA9IG0uZWxlbWVudHM7XG5cbiAgICAgIGlmICh0cmFuc3Bvc2UpIHtcblxuICAgICAgICB0aGlzLnggPSBlWzBdICogeCArIGVbMV0gKiB5ICsgZVsyXSAqIHo7XG4gICAgICAgIHRoaXMueSA9IGVbM10gKiB4ICsgZVs0XSAqIHkgKyBlWzVdICogejtcbiAgICAgICAgdGhpcy56ID0gZVs2XSAqIHggKyBlWzddICogeSArIGVbOF0gKiB6O1xuXG4gICAgICB9IGVsc2Uge1xuXG4gICAgICAgIHRoaXMueCA9IGVbMF0gKiB4ICsgZVszXSAqIHkgKyBlWzZdICogejtcbiAgICAgICAgdGhpcy55ID0gZVsxXSAqIHggKyBlWzRdICogeSArIGVbN10gKiB6O1xuICAgICAgICB0aGlzLnogPSBlWzJdICogeCArIGVbNV0gKiB5ICsgZVs4XSAqIHo7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfSxcblxuICAgIGFwcGx5UXVhdGVybmlvbjogZnVuY3Rpb24gKHEpIHtcblxuICAgICAgdmFyIHggPSB0aGlzLng7XG4gICAgICB2YXIgeSA9IHRoaXMueTtcbiAgICAgIHZhciB6ID0gdGhpcy56O1xuXG4gICAgICB2YXIgcXggPSBxLng7XG4gICAgICB2YXIgcXkgPSBxLnk7XG4gICAgICB2YXIgcXogPSBxLno7XG4gICAgICB2YXIgcXcgPSBxLnc7XG5cbiAgICAgIC8vIGNhbGN1bGF0ZSBxdWF0ICogdmVjdG9yXG5cbiAgICAgIHZhciBpeCA9IHF3ICogeCArIHF5ICogeiAtIHF6ICogeTtcbiAgICAgIHZhciBpeSA9IHF3ICogeSArIHF6ICogeCAtIHF4ICogejtcbiAgICAgIHZhciBpeiA9IHF3ICogeiArIHF4ICogeSAtIHF5ICogeDtcbiAgICAgIHZhciBpdyA9IC0gcXggKiB4IC0gcXkgKiB5IC0gcXogKiB6O1xuXG4gICAgICAvLyBjYWxjdWxhdGUgcmVzdWx0ICogaW52ZXJzZSBxdWF0XG5cbiAgICAgIHRoaXMueCA9IGl4ICogcXcgKyBpdyAqIC0gcXggKyBpeSAqIC0gcXogLSBpeiAqIC0gcXk7XG4gICAgICB0aGlzLnkgPSBpeSAqIHF3ICsgaXcgKiAtIHF5ICsgaXogKiAtIHF4IC0gaXggKiAtIHF6O1xuICAgICAgdGhpcy56ID0gaXogKiBxdyArIGl3ICogLSBxeiArIGl4ICogLSBxeSAtIGl5ICogLSBxeDtcblxuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICB9LFxuXG4gICAgdGVzdFplcm86IGZ1bmN0aW9uICgpIHtcblxuICAgICAgaWYgKHRoaXMueCAhPT0gMCB8fCB0aGlzLnkgIT09IDAgfHwgdGhpcy56ICE9PSAwKSByZXR1cm4gdHJ1ZTtcbiAgICAgIGVsc2UgcmV0dXJuIGZhbHNlO1xuXG4gICAgfSxcblxuICAgIHRlc3REaWZmOiBmdW5jdGlvbiAodikge1xuXG4gICAgICByZXR1cm4gdGhpcy5lcXVhbHModikgPyBmYWxzZSA6IHRydWU7XG5cbiAgICB9LFxuXG4gICAgZXF1YWxzOiBmdW5jdGlvbiAodikge1xuXG4gICAgICByZXR1cm4gdi54ID09PSB0aGlzLnggJiYgdi55ID09PSB0aGlzLnkgJiYgdi56ID09PSB0aGlzLno7XG5cbiAgICB9LFxuXG4gICAgY2xvbmU6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgcmV0dXJuIG5ldyB0aGlzLmNvbnN0cnVjdG9yKHRoaXMueCwgdGhpcy55LCB0aGlzLnopO1xuXG4gICAgfSxcblxuICAgIHRvU3RyaW5nOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHJldHVybiBcIlZlYzNbXCIgKyB0aGlzLngudG9GaXhlZCg0KSArIFwiLCBcIiArIHRoaXMueS50b0ZpeGVkKDQpICsgXCIsIFwiICsgdGhpcy56LnRvRml4ZWQoNCkgKyBcIl1cIjtcblxuICAgIH0sXG5cbiAgICBtdWx0aXBseVNjYWxhcjogZnVuY3Rpb24gKHNjYWxhcikge1xuXG4gICAgICBpZiAoaXNGaW5pdGUoc2NhbGFyKSkge1xuICAgICAgICB0aGlzLnggKj0gc2NhbGFyO1xuICAgICAgICB0aGlzLnkgKj0gc2NhbGFyO1xuICAgICAgICB0aGlzLnogKj0gc2NhbGFyO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy54ID0gMDtcbiAgICAgICAgdGhpcy55ID0gMDtcbiAgICAgICAgdGhpcy56ID0gMDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICB9LFxuXG4gICAgZGl2aWRlU2NhbGFyOiBmdW5jdGlvbiAoc2NhbGFyKSB7XG5cbiAgICAgIHJldHVybiB0aGlzLm11bHRpcGx5U2NhbGFyKDEgLyBzY2FsYXIpO1xuXG4gICAgfSxcblxuICAgIG5vcm1hbGl6ZTogZnVuY3Rpb24gKCkge1xuXG4gICAgICByZXR1cm4gdGhpcy5kaXZpZGVTY2FsYXIodGhpcy5sZW5ndGgoKSk7XG5cbiAgICB9LFxuXG4gICAgdG9BcnJheTogZnVuY3Rpb24gKGFycmF5LCBvZmZzZXQpIHtcblxuICAgICAgaWYgKG9mZnNldCA9PT0gdW5kZWZpbmVkKSBvZmZzZXQgPSAwO1xuXG4gICAgICBhcnJheVtvZmZzZXRdID0gdGhpcy54O1xuICAgICAgYXJyYXlbb2Zmc2V0ICsgMV0gPSB0aGlzLnk7XG4gICAgICBhcnJheVtvZmZzZXQgKyAyXSA9IHRoaXMuejtcblxuICAgIH0sXG5cbiAgICBmcm9tQXJyYXk6IGZ1bmN0aW9uIChhcnJheSwgb2Zmc2V0KSB7XG5cbiAgICAgIGlmIChvZmZzZXQgPT09IHVuZGVmaW5lZCkgb2Zmc2V0ID0gMDtcblxuICAgICAgdGhpcy54ID0gYXJyYXlbb2Zmc2V0XTtcbiAgICAgIHRoaXMueSA9IGFycmF5W29mZnNldCArIDFdO1xuICAgICAgdGhpcy56ID0gYXJyYXlbb2Zmc2V0ICsgMl07XG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIH0sXG5cblxuICB9KTtcblxuICBmdW5jdGlvbiBRdWF0KHgsIHksIHosIHcpIHtcblxuICAgIHRoaXMueCA9IHggfHwgMDtcbiAgICB0aGlzLnkgPSB5IHx8IDA7XG4gICAgdGhpcy56ID0geiB8fCAwO1xuICAgIHRoaXMudyA9ICh3ICE9PSB1bmRlZmluZWQpID8gdyA6IDE7XG5cbiAgfVxuXG4gIE9iamVjdC5hc3NpZ24oUXVhdC5wcm90b3R5cGUsIHtcblxuICAgIFF1YXQ6IHRydWUsXG5cbiAgICBzZXQ6IGZ1bmN0aW9uICh4LCB5LCB6LCB3KSB7XG5cblxuICAgICAgdGhpcy54ID0geDtcbiAgICAgIHRoaXMueSA9IHk7XG4gICAgICB0aGlzLnogPSB6O1xuICAgICAgdGhpcy53ID0gdztcblxuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICB9LFxuXG4gICAgYWRkVGltZTogZnVuY3Rpb24gKHYsIHQpIHtcblxuICAgICAgdmFyIGF4ID0gdi54LCBheSA9IHYueSwgYXogPSB2Lno7XG4gICAgICB2YXIgcXcgPSB0aGlzLncsIHF4ID0gdGhpcy54LCBxeSA9IHRoaXMueSwgcXogPSB0aGlzLno7XG4gICAgICB0ICo9IDAuNTtcbiAgICAgIHRoaXMueCArPSB0ICogKGF4ICogcXcgKyBheSAqIHF6IC0gYXogKiBxeSk7XG4gICAgICB0aGlzLnkgKz0gdCAqIChheSAqIHF3ICsgYXogKiBxeCAtIGF4ICogcXopO1xuICAgICAgdGhpcy56ICs9IHQgKiAoYXogKiBxdyArIGF4ICogcXkgLSBheSAqIHF4KTtcbiAgICAgIHRoaXMudyArPSB0ICogKC1heCAqIHF4IC0gYXkgKiBxeSAtIGF6ICogcXopO1xuICAgICAgdGhpcy5ub3JtYWxpemUoKTtcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfSxcblxuICAgIC8qbXVsOiBmdW5jdGlvbiggcTEsIHEyICl7XG5cbiAgICAgICAgdmFyIGF4ID0gcTEueCwgYXkgPSBxMS55LCBheiA9IHExLnosIGFzID0gcTEudyxcbiAgICAgICAgYnggPSBxMi54LCBieSA9IHEyLnksIGJ6ID0gcTIueiwgYnMgPSBxMi53O1xuICAgICAgICB0aGlzLnggPSBheCAqIGJzICsgYXMgKiBieCArIGF5ICogYnogLSBheiAqIGJ5O1xuICAgICAgICB0aGlzLnkgPSBheSAqIGJzICsgYXMgKiBieSArIGF6ICogYnggLSBheCAqIGJ6O1xuICAgICAgICB0aGlzLnogPSBheiAqIGJzICsgYXMgKiBieiArIGF4ICogYnkgLSBheSAqIGJ4O1xuICAgICAgICB0aGlzLncgPSBhcyAqIGJzIC0gYXggKiBieCAtIGF5ICogYnkgLSBheiAqIGJ6O1xuICAgICAgICByZXR1cm4gdGhpcztcblxuICAgIH0sKi9cblxuICAgIG11bHRpcGx5OiBmdW5jdGlvbiAocSwgcCkge1xuXG4gICAgICBpZiAocCAhPT0gdW5kZWZpbmVkKSByZXR1cm4gdGhpcy5tdWx0aXBseVF1YXRlcm5pb25zKHEsIHApO1xuICAgICAgcmV0dXJuIHRoaXMubXVsdGlwbHlRdWF0ZXJuaW9ucyh0aGlzLCBxKTtcblxuICAgIH0sXG5cbiAgICBtdWx0aXBseVF1YXRlcm5pb25zOiBmdW5jdGlvbiAoYSwgYikge1xuXG4gICAgICB2YXIgcWF4ID0gYS54LCBxYXkgPSBhLnksIHFheiA9IGEueiwgcWF3ID0gYS53O1xuICAgICAgdmFyIHFieCA9IGIueCwgcWJ5ID0gYi55LCBxYnogPSBiLnosIHFidyA9IGIudztcblxuICAgICAgdGhpcy54ID0gcWF4ICogcWJ3ICsgcWF3ICogcWJ4ICsgcWF5ICogcWJ6IC0gcWF6ICogcWJ5O1xuICAgICAgdGhpcy55ID0gcWF5ICogcWJ3ICsgcWF3ICogcWJ5ICsgcWF6ICogcWJ4IC0gcWF4ICogcWJ6O1xuICAgICAgdGhpcy56ID0gcWF6ICogcWJ3ICsgcWF3ICogcWJ6ICsgcWF4ICogcWJ5IC0gcWF5ICogcWJ4O1xuICAgICAgdGhpcy53ID0gcWF3ICogcWJ3IC0gcWF4ICogcWJ4IC0gcWF5ICogcWJ5IC0gcWF6ICogcWJ6O1xuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICB9LFxuXG4gICAgc2V0RnJvbVVuaXRWZWN0b3JzOiBmdW5jdGlvbiAodjEsIHYyKSB7XG5cbiAgICAgIHZhciB2eCA9IG5ldyBWZWMzKCk7XG4gICAgICB2YXIgciA9IHYxLmRvdCh2MikgKyAxO1xuXG4gICAgICBpZiAociA8IF9NYXRoLkVQUzIpIHtcblxuICAgICAgICByID0gMDtcbiAgICAgICAgaWYgKF9NYXRoLmFicyh2MS54KSA+IF9NYXRoLmFicyh2MS56KSkgdnguc2V0KC0gdjEueSwgdjEueCwgMCk7XG4gICAgICAgIGVsc2Ugdnguc2V0KDAsIC0gdjEueiwgdjEueSk7XG5cbiAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgdnguY3Jvc3NWZWN0b3JzKHYxLCB2Mik7XG5cbiAgICAgIH1cblxuICAgICAgdGhpcy5feCA9IHZ4Lng7XG4gICAgICB0aGlzLl95ID0gdngueTtcbiAgICAgIHRoaXMuX3ogPSB2eC56O1xuICAgICAgdGhpcy5fdyA9IHI7XG5cbiAgICAgIHJldHVybiB0aGlzLm5vcm1hbGl6ZSgpO1xuXG4gICAgfSxcblxuICAgIGFyYzogZnVuY3Rpb24gKHYxLCB2Mikge1xuXG4gICAgICB2YXIgeDEgPSB2MS54O1xuICAgICAgdmFyIHkxID0gdjEueTtcbiAgICAgIHZhciB6MSA9IHYxLno7XG4gICAgICB2YXIgeDIgPSB2Mi54O1xuICAgICAgdmFyIHkyID0gdjIueTtcbiAgICAgIHZhciB6MiA9IHYyLno7XG4gICAgICB2YXIgZCA9IHgxICogeDIgKyB5MSAqIHkyICsgejEgKiB6MjtcbiAgICAgIGlmIChkID09IC0xKSB7XG4gICAgICAgIHgyID0geTEgKiB4MSAtIHoxICogejE7XG4gICAgICAgIHkyID0gLXoxICogeTEgLSB4MSAqIHgxO1xuICAgICAgICB6MiA9IHgxICogejEgKyB5MSAqIHkxO1xuICAgICAgICBkID0gMSAvIF9NYXRoLnNxcnQoeDIgKiB4MiArIHkyICogeTIgKyB6MiAqIHoyKTtcbiAgICAgICAgdGhpcy53ID0gMDtcbiAgICAgICAgdGhpcy54ID0geDIgKiBkO1xuICAgICAgICB0aGlzLnkgPSB5MiAqIGQ7XG4gICAgICAgIHRoaXMueiA9IHoyICogZDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG4gICAgICB2YXIgY3ggPSB5MSAqIHoyIC0gejEgKiB5MjtcbiAgICAgIHZhciBjeSA9IHoxICogeDIgLSB4MSAqIHoyO1xuICAgICAgdmFyIGN6ID0geDEgKiB5MiAtIHkxICogeDI7XG4gICAgICB0aGlzLncgPSBfTWF0aC5zcXJ0KCgxICsgZCkgKiAwLjUpO1xuICAgICAgZCA9IDAuNSAvIHRoaXMudztcbiAgICAgIHRoaXMueCA9IGN4ICogZDtcbiAgICAgIHRoaXMueSA9IGN5ICogZDtcbiAgICAgIHRoaXMueiA9IGN6ICogZDtcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfSxcblxuICAgIG5vcm1hbGl6ZTogZnVuY3Rpb24gKCkge1xuXG4gICAgICB2YXIgbCA9IHRoaXMubGVuZ3RoKCk7XG4gICAgICBpZiAobCA9PT0gMCkge1xuICAgICAgICB0aGlzLnNldCgwLCAwLCAwLCAxKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGwgPSAxIC8gbDtcbiAgICAgICAgdGhpcy54ID0gdGhpcy54ICogbDtcbiAgICAgICAgdGhpcy55ID0gdGhpcy55ICogbDtcbiAgICAgICAgdGhpcy56ID0gdGhpcy56ICogbDtcbiAgICAgICAgdGhpcy53ID0gdGhpcy53ICogbDtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfSxcblxuICAgIGludmVyc2U6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgcmV0dXJuIHRoaXMuY29uanVnYXRlKCkubm9ybWFsaXplKCk7XG5cbiAgICB9LFxuXG4gICAgaW52ZXJ0OiBmdW5jdGlvbiAocSkge1xuXG4gICAgICB0aGlzLnggPSBxLng7XG4gICAgICB0aGlzLnkgPSBxLnk7XG4gICAgICB0aGlzLnogPSBxLno7XG4gICAgICB0aGlzLncgPSBxLnc7XG4gICAgICB0aGlzLmNvbmp1Z2F0ZSgpLm5vcm1hbGl6ZSgpO1xuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICB9LFxuXG4gICAgY29uanVnYXRlOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHRoaXMueCAqPSAtIDE7XG4gICAgICB0aGlzLnkgKj0gLSAxO1xuICAgICAgdGhpcy56ICo9IC0gMTtcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfSxcblxuICAgIGxlbmd0aDogZnVuY3Rpb24gKCkge1xuXG4gICAgICByZXR1cm4gX01hdGguc3FydCh0aGlzLnggKiB0aGlzLnggKyB0aGlzLnkgKiB0aGlzLnkgKyB0aGlzLnogKiB0aGlzLnogKyB0aGlzLncgKiB0aGlzLncpO1xuXG4gICAgfSxcblxuICAgIGxlbmd0aFNxOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHJldHVybiB0aGlzLnggKiB0aGlzLnggKyB0aGlzLnkgKiB0aGlzLnkgKyB0aGlzLnogKiB0aGlzLnogKyB0aGlzLncgKiB0aGlzLnc7XG5cbiAgICB9LFxuXG4gICAgY29weTogZnVuY3Rpb24gKHEpIHtcblxuICAgICAgdGhpcy54ID0gcS54O1xuICAgICAgdGhpcy55ID0gcS55O1xuICAgICAgdGhpcy56ID0gcS56O1xuICAgICAgdGhpcy53ID0gcS53O1xuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICB9LFxuXG4gICAgY2xvbmU6IGZ1bmN0aW9uIChxKSB7XG5cbiAgICAgIHJldHVybiBuZXcgUXVhdCh0aGlzLngsIHRoaXMueSwgdGhpcy56LCB0aGlzLncpO1xuXG4gICAgfSxcblxuICAgIHRlc3REaWZmOiBmdW5jdGlvbiAocSkge1xuXG4gICAgICByZXR1cm4gdGhpcy5lcXVhbHMocSkgPyBmYWxzZSA6IHRydWU7XG5cbiAgICB9LFxuXG4gICAgZXF1YWxzOiBmdW5jdGlvbiAocSkge1xuXG4gICAgICByZXR1cm4gdGhpcy54ID09PSBxLnggJiYgdGhpcy55ID09PSBxLnkgJiYgdGhpcy56ID09PSBxLnogJiYgdGhpcy53ID09PSBxLnc7XG5cbiAgICB9LFxuXG4gICAgdG9TdHJpbmc6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgcmV0dXJuIFwiUXVhdFtcIiArIHRoaXMueC50b0ZpeGVkKDQpICsgXCIsIChcIiArIHRoaXMueS50b0ZpeGVkKDQpICsgXCIsIFwiICsgdGhpcy56LnRvRml4ZWQoNCkgKyBcIiwgXCIgKyB0aGlzLncudG9GaXhlZCg0KSArIFwiKV1cIjtcblxuICAgIH0sXG5cbiAgICBzZXRGcm9tRXVsZXI6IGZ1bmN0aW9uICh4LCB5LCB6KSB7XG5cbiAgICAgIHZhciBjMSA9IE1hdGguY29zKHggKiAwLjUpO1xuICAgICAgdmFyIGMyID0gTWF0aC5jb3MoeSAqIDAuNSk7XG4gICAgICB2YXIgYzMgPSBNYXRoLmNvcyh6ICogMC41KTtcbiAgICAgIHZhciBzMSA9IE1hdGguc2luKHggKiAwLjUpO1xuICAgICAgdmFyIHMyID0gTWF0aC5zaW4oeSAqIDAuNSk7XG4gICAgICB2YXIgczMgPSBNYXRoLnNpbih6ICogMC41KTtcblxuICAgICAgLy8gWFlaXG4gICAgICB0aGlzLnggPSBzMSAqIGMyICogYzMgKyBjMSAqIHMyICogczM7XG4gICAgICB0aGlzLnkgPSBjMSAqIHMyICogYzMgLSBzMSAqIGMyICogczM7XG4gICAgICB0aGlzLnogPSBjMSAqIGMyICogczMgKyBzMSAqIHMyICogYzM7XG4gICAgICB0aGlzLncgPSBjMSAqIGMyICogYzMgLSBzMSAqIHMyICogczM7XG5cbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfSxcblxuICAgIHNldEZyb21BeGlzOiBmdW5jdGlvbiAoYXhpcywgcmFkKSB7XG5cbiAgICAgIGF4aXMubm9ybWFsaXplKCk7XG4gICAgICByYWQgPSByYWQgKiAwLjU7XG4gICAgICB2YXIgcyA9IF9NYXRoLnNpbihyYWQpO1xuICAgICAgdGhpcy54ID0gcyAqIGF4aXMueDtcbiAgICAgIHRoaXMueSA9IHMgKiBheGlzLnk7XG4gICAgICB0aGlzLnogPSBzICogYXhpcy56O1xuICAgICAgdGhpcy53ID0gX01hdGguY29zKHJhZCk7XG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIH0sXG5cbiAgICBzZXRGcm9tTWF0MzM6IGZ1bmN0aW9uIChtKSB7XG5cbiAgICAgIHZhciB0cmFjZSA9IG1bMF0gKyBtWzRdICsgbVs4XTtcbiAgICAgIHZhciBzO1xuXG4gICAgICBpZiAodHJhY2UgPiAwKSB7XG5cbiAgICAgICAgcyA9IF9NYXRoLnNxcnQodHJhY2UgKyAxLjApO1xuICAgICAgICB0aGlzLncgPSAwLjUgLyBzO1xuICAgICAgICBzID0gMC41IC8gcztcbiAgICAgICAgdGhpcy54ID0gKG1bNV0gLSBtWzddKSAqIHM7XG4gICAgICAgIHRoaXMueSA9IChtWzZdIC0gbVsyXSkgKiBzO1xuICAgICAgICB0aGlzLnogPSAobVsxXSAtIG1bM10pICogcztcblxuICAgICAgfSBlbHNlIHtcblxuICAgICAgICB2YXIgb3V0ID0gW107XG4gICAgICAgIHZhciBpID0gMDtcbiAgICAgICAgaWYgKG1bNF0gPiBtWzBdKSBpID0gMTtcbiAgICAgICAgaWYgKG1bOF0gPiBtW2kgKiAzICsgaV0pIGkgPSAyO1xuXG4gICAgICAgIHZhciBqID0gKGkgKyAxKSAlIDM7XG4gICAgICAgIHZhciBrID0gKGkgKyAyKSAlIDM7XG5cbiAgICAgICAgcyA9IF9NYXRoLnNxcnQobVtpICogMyArIGldIC0gbVtqICogMyArIGpdIC0gbVtrICogMyArIGtdICsgMS4wKTtcbiAgICAgICAgb3V0W2ldID0gMC41ICogZlJvb3Q7XG4gICAgICAgIHMgPSAwLjUgLyBmUm9vdDtcbiAgICAgICAgdGhpcy53ID0gKG1baiAqIDMgKyBrXSAtIG1bayAqIDMgKyBqXSkgKiBzO1xuICAgICAgICBvdXRbal0gPSAobVtqICogMyArIGldICsgbVtpICogMyArIGpdKSAqIHM7XG4gICAgICAgIG91dFtrXSA9IChtW2sgKiAzICsgaV0gKyBtW2kgKiAzICsga10pICogcztcblxuICAgICAgICB0aGlzLnggPSBvdXRbMV07XG4gICAgICAgIHRoaXMueSA9IG91dFsyXTtcbiAgICAgICAgdGhpcy56ID0gb3V0WzNdO1xuXG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfSxcblxuICAgIHRvQXJyYXk6IGZ1bmN0aW9uIChhcnJheSwgb2Zmc2V0KSB7XG5cbiAgICAgIG9mZnNldCA9IG9mZnNldCB8fCAwO1xuXG4gICAgICBhcnJheVtvZmZzZXRdID0gdGhpcy54O1xuICAgICAgYXJyYXlbb2Zmc2V0ICsgMV0gPSB0aGlzLnk7XG4gICAgICBhcnJheVtvZmZzZXQgKyAyXSA9IHRoaXMuejtcbiAgICAgIGFycmF5W29mZnNldCArIDNdID0gdGhpcy53O1xuXG4gICAgfSxcblxuICAgIGZyb21BcnJheTogZnVuY3Rpb24gKGFycmF5LCBvZmZzZXQpIHtcblxuICAgICAgb2Zmc2V0ID0gb2Zmc2V0IHx8IDA7XG4gICAgICB0aGlzLnNldChhcnJheVtvZmZzZXRdLCBhcnJheVtvZmZzZXQgKyAxXSwgYXJyYXlbb2Zmc2V0ICsgMl0sIGFycmF5W29mZnNldCArIDNdKTtcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfVxuXG4gIH0pO1xuXG4gIGZ1bmN0aW9uIE1hdDMzKGUwMCwgZTAxLCBlMDIsIGUxMCwgZTExLCBlMTIsIGUyMCwgZTIxLCBlMjIpIHtcblxuICAgIHRoaXMuZWxlbWVudHMgPSBbXG4gICAgICAxLCAwLCAwLFxuICAgICAgMCwgMSwgMCxcbiAgICAgIDAsIDAsIDFcbiAgICBdO1xuXG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAwKSB7XG5cbiAgICAgIGNvbnNvbGUuZXJyb3IoJ09JTU8uTWF0MzM6IHRoZSBjb25zdHJ1Y3RvciBubyBsb25nZXIgcmVhZHMgYXJndW1lbnRzLiB1c2UgLnNldCgpIGluc3RlYWQuJyk7XG5cbiAgICB9XG5cbiAgfVxuXG4gIE9iamVjdC5hc3NpZ24oTWF0MzMucHJvdG90eXBlLCB7XG5cbiAgICBNYXQzMzogdHJ1ZSxcblxuICAgIHNldDogZnVuY3Rpb24gKGUwMCwgZTAxLCBlMDIsIGUxMCwgZTExLCBlMTIsIGUyMCwgZTIxLCBlMjIpIHtcblxuICAgICAgdmFyIHRlID0gdGhpcy5lbGVtZW50cztcbiAgICAgIHRlWzBdID0gZTAwOyB0ZVsxXSA9IGUwMTsgdGVbMl0gPSBlMDI7XG4gICAgICB0ZVszXSA9IGUxMDsgdGVbNF0gPSBlMTE7IHRlWzVdID0gZTEyO1xuICAgICAgdGVbNl0gPSBlMjA7IHRlWzddID0gZTIxOyB0ZVs4XSA9IGUyMjtcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfSxcblxuICAgIGFkZDogZnVuY3Rpb24gKGEsIGIpIHtcblxuICAgICAgaWYgKGIgIT09IHVuZGVmaW5lZCkgcmV0dXJuIHRoaXMuYWRkTWF0cml4cyhhLCBiKTtcblxuICAgICAgdmFyIGUgPSB0aGlzLmVsZW1lbnRzLCB0ZSA9IGEuZWxlbWVudHM7XG4gICAgICBlWzBdICs9IHRlWzBdOyBlWzFdICs9IHRlWzFdOyBlWzJdICs9IHRlWzJdO1xuICAgICAgZVszXSArPSB0ZVszXTsgZVs0XSArPSB0ZVs0XTsgZVs1XSArPSB0ZVs1XTtcbiAgICAgIGVbNl0gKz0gdGVbNl07IGVbN10gKz0gdGVbN107IGVbOF0gKz0gdGVbOF07XG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIH0sXG5cbiAgICBhZGRNYXRyaXhzOiBmdW5jdGlvbiAoYSwgYikge1xuXG4gICAgICB2YXIgdGUgPSB0aGlzLmVsZW1lbnRzLCB0ZW0xID0gYS5lbGVtZW50cywgdGVtMiA9IGIuZWxlbWVudHM7XG4gICAgICB0ZVswXSA9IHRlbTFbMF0gKyB0ZW0yWzBdOyB0ZVsxXSA9IHRlbTFbMV0gKyB0ZW0yWzFdOyB0ZVsyXSA9IHRlbTFbMl0gKyB0ZW0yWzJdO1xuICAgICAgdGVbM10gPSB0ZW0xWzNdICsgdGVtMlszXTsgdGVbNF0gPSB0ZW0xWzRdICsgdGVtMls0XTsgdGVbNV0gPSB0ZW0xWzVdICsgdGVtMls1XTtcbiAgICAgIHRlWzZdID0gdGVtMVs2XSArIHRlbTJbNl07IHRlWzddID0gdGVtMVs3XSArIHRlbTJbN107IHRlWzhdID0gdGVtMVs4XSArIHRlbTJbOF07XG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIH0sXG5cbiAgICBhZGRFcXVhbDogZnVuY3Rpb24gKG0pIHtcblxuICAgICAgdmFyIHRlID0gdGhpcy5lbGVtZW50cywgdGVtID0gbS5lbGVtZW50cztcbiAgICAgIHRlWzBdICs9IHRlbVswXTsgdGVbMV0gKz0gdGVtWzFdOyB0ZVsyXSArPSB0ZW1bMl07XG4gICAgICB0ZVszXSArPSB0ZW1bM107IHRlWzRdICs9IHRlbVs0XTsgdGVbNV0gKz0gdGVtWzVdO1xuICAgICAgdGVbNl0gKz0gdGVtWzZdOyB0ZVs3XSArPSB0ZW1bN107IHRlWzhdICs9IHRlbVs4XTtcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfSxcblxuICAgIHN1YjogZnVuY3Rpb24gKGEsIGIpIHtcblxuICAgICAgaWYgKGIgIT09IHVuZGVmaW5lZCkgcmV0dXJuIHRoaXMuc3ViTWF0cml4cyhhLCBiKTtcblxuICAgICAgdmFyIGUgPSB0aGlzLmVsZW1lbnRzLCB0ZSA9IGEuZWxlbWVudHM7XG4gICAgICBlWzBdIC09IHRlWzBdOyBlWzFdIC09IHRlWzFdOyBlWzJdIC09IHRlWzJdO1xuICAgICAgZVszXSAtPSB0ZVszXTsgZVs0XSAtPSB0ZVs0XTsgZVs1XSAtPSB0ZVs1XTtcbiAgICAgIGVbNl0gLT0gdGVbNl07IGVbN10gLT0gdGVbN107IGVbOF0gLT0gdGVbOF07XG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIH0sXG5cbiAgICBzdWJNYXRyaXhzOiBmdW5jdGlvbiAoYSwgYikge1xuXG4gICAgICB2YXIgdGUgPSB0aGlzLmVsZW1lbnRzLCB0ZW0xID0gYS5lbGVtZW50cywgdGVtMiA9IGIuZWxlbWVudHM7XG4gICAgICB0ZVswXSA9IHRlbTFbMF0gLSB0ZW0yWzBdOyB0ZVsxXSA9IHRlbTFbMV0gLSB0ZW0yWzFdOyB0ZVsyXSA9IHRlbTFbMl0gLSB0ZW0yWzJdO1xuICAgICAgdGVbM10gPSB0ZW0xWzNdIC0gdGVtMlszXTsgdGVbNF0gPSB0ZW0xWzRdIC0gdGVtMls0XTsgdGVbNV0gPSB0ZW0xWzVdIC0gdGVtMls1XTtcbiAgICAgIHRlWzZdID0gdGVtMVs2XSAtIHRlbTJbNl07IHRlWzddID0gdGVtMVs3XSAtIHRlbTJbN107IHRlWzhdID0gdGVtMVs4XSAtIHRlbTJbOF07XG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIH0sXG5cbiAgICBzdWJFcXVhbDogZnVuY3Rpb24gKG0pIHtcblxuICAgICAgdmFyIHRlID0gdGhpcy5lbGVtZW50cywgdGVtID0gbS5lbGVtZW50cztcbiAgICAgIHRlWzBdIC09IHRlbVswXTsgdGVbMV0gLT0gdGVtWzFdOyB0ZVsyXSAtPSB0ZW1bMl07XG4gICAgICB0ZVszXSAtPSB0ZW1bM107IHRlWzRdIC09IHRlbVs0XTsgdGVbNV0gLT0gdGVtWzVdO1xuICAgICAgdGVbNl0gLT0gdGVtWzZdOyB0ZVs3XSAtPSB0ZW1bN107IHRlWzhdIC09IHRlbVs4XTtcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfSxcblxuICAgIHNjYWxlOiBmdW5jdGlvbiAobSwgcykge1xuXG4gICAgICB2YXIgdGUgPSB0aGlzLmVsZW1lbnRzLCB0bSA9IG0uZWxlbWVudHM7XG4gICAgICB0ZVswXSA9IHRtWzBdICogczsgdGVbMV0gPSB0bVsxXSAqIHM7IHRlWzJdID0gdG1bMl0gKiBzO1xuICAgICAgdGVbM10gPSB0bVszXSAqIHM7IHRlWzRdID0gdG1bNF0gKiBzOyB0ZVs1XSA9IHRtWzVdICogcztcbiAgICAgIHRlWzZdID0gdG1bNl0gKiBzOyB0ZVs3XSA9IHRtWzddICogczsgdGVbOF0gPSB0bVs4XSAqIHM7XG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIH0sXG5cbiAgICBzY2FsZUVxdWFsOiBmdW5jdGlvbiAocykgey8vIG11bHRpcGx5U2NhbGFyXG5cbiAgICAgIHZhciB0ZSA9IHRoaXMuZWxlbWVudHM7XG4gICAgICB0ZVswXSAqPSBzOyB0ZVsxXSAqPSBzOyB0ZVsyXSAqPSBzO1xuICAgICAgdGVbM10gKj0gczsgdGVbNF0gKj0gczsgdGVbNV0gKj0gcztcbiAgICAgIHRlWzZdICo9IHM7IHRlWzddICo9IHM7IHRlWzhdICo9IHM7XG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIH0sXG5cbiAgICBtdWx0aXBseU1hdHJpY2VzOiBmdW5jdGlvbiAobTEsIG0yLCB0cmFuc3Bvc2UpIHtcblxuICAgICAgaWYgKHRyYW5zcG9zZSkgbTIgPSBtMi5jbG9uZSgpLnRyYW5zcG9zZSgpO1xuXG4gICAgICB2YXIgdGUgPSB0aGlzLmVsZW1lbnRzO1xuICAgICAgdmFyIHRtMSA9IG0xLmVsZW1lbnRzO1xuICAgICAgdmFyIHRtMiA9IG0yLmVsZW1lbnRzO1xuXG4gICAgICB2YXIgYTAgPSB0bTFbMF0sIGEzID0gdG0xWzNdLCBhNiA9IHRtMVs2XTtcbiAgICAgIHZhciBhMSA9IHRtMVsxXSwgYTQgPSB0bTFbNF0sIGE3ID0gdG0xWzddO1xuICAgICAgdmFyIGEyID0gdG0xWzJdLCBhNSA9IHRtMVs1XSwgYTggPSB0bTFbOF07XG5cbiAgICAgIHZhciBiMCA9IHRtMlswXSwgYjMgPSB0bTJbM10sIGI2ID0gdG0yWzZdO1xuICAgICAgdmFyIGIxID0gdG0yWzFdLCBiNCA9IHRtMls0XSwgYjcgPSB0bTJbN107XG4gICAgICB2YXIgYjIgPSB0bTJbMl0sIGI1ID0gdG0yWzVdLCBiOCA9IHRtMls4XTtcblxuICAgICAgdGVbMF0gPSBhMCAqIGIwICsgYTEgKiBiMyArIGEyICogYjY7XG4gICAgICB0ZVsxXSA9IGEwICogYjEgKyBhMSAqIGI0ICsgYTIgKiBiNztcbiAgICAgIHRlWzJdID0gYTAgKiBiMiArIGExICogYjUgKyBhMiAqIGI4O1xuICAgICAgdGVbM10gPSBhMyAqIGIwICsgYTQgKiBiMyArIGE1ICogYjY7XG4gICAgICB0ZVs0XSA9IGEzICogYjEgKyBhNCAqIGI0ICsgYTUgKiBiNztcbiAgICAgIHRlWzVdID0gYTMgKiBiMiArIGE0ICogYjUgKyBhNSAqIGI4O1xuICAgICAgdGVbNl0gPSBhNiAqIGIwICsgYTcgKiBiMyArIGE4ICogYjY7XG4gICAgICB0ZVs3XSA9IGE2ICogYjEgKyBhNyAqIGI0ICsgYTggKiBiNztcbiAgICAgIHRlWzhdID0gYTYgKiBiMiArIGE3ICogYjUgKyBhOCAqIGI4O1xuXG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIH0sXG5cbiAgICAvKm11bDogZnVuY3Rpb24gKCBtMSwgbTIsIHRyYW5zcG9zZSApIHtcblxuICAgICAgICBpZiggdHJhbnNwb3NlICkgbTIgPSBtMi5jbG9uZSgpLnRyYW5zcG9zZSgpO1xuXG4gICAgICAgIHZhciB0ZSA9IHRoaXMuZWxlbWVudHM7XG4gICAgICAgIHZhciB0bTEgPSBtMS5lbGVtZW50cztcbiAgICAgICAgdmFyIHRtMiA9IG0yLmVsZW1lbnRzO1xuICAgICAgICAvL3ZhciB0bXA7XG5cbiAgICAgICAgdmFyIGEwID0gdG0xWzBdLCBhMyA9IHRtMVszXSwgYTYgPSB0bTFbNl07XG4gICAgICAgIHZhciBhMSA9IHRtMVsxXSwgYTQgPSB0bTFbNF0sIGE3ID0gdG0xWzddO1xuICAgICAgICB2YXIgYTIgPSB0bTFbMl0sIGE1ID0gdG0xWzVdLCBhOCA9IHRtMVs4XTtcblxuICAgICAgICB2YXIgYjAgPSB0bTJbMF0sIGIzID0gdG0yWzNdLCBiNiA9IHRtMls2XTtcbiAgICAgICAgdmFyIGIxID0gdG0yWzFdLCBiNCA9IHRtMls0XSwgYjcgPSB0bTJbN107XG4gICAgICAgIHZhciBiMiA9IHRtMlsyXSwgYjUgPSB0bTJbNV0sIGI4ID0gdG0yWzhdO1xuXG4gICAgICAgIC8qaWYoIHRyYW5zcG9zZSApe1xuXG4gICAgICAgICAgICB0bXAgPSBiMTsgYjEgPSBiMzsgYjMgPSB0bXA7XG4gICAgICAgICAgICB0bXAgPSBiMjsgYjIgPSBiNjsgYjYgPSB0bXA7XG4gICAgICAgICAgICB0bXAgPSBiNTsgYjUgPSBiNzsgYjcgPSB0bXA7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIHRlWzBdID0gYTAqYjAgKyBhMSpiMyArIGEyKmI2O1xuICAgICAgICB0ZVsxXSA9IGEwKmIxICsgYTEqYjQgKyBhMipiNztcbiAgICAgICAgdGVbMl0gPSBhMCpiMiArIGExKmI1ICsgYTIqYjg7XG4gICAgICAgIHRlWzNdID0gYTMqYjAgKyBhNCpiMyArIGE1KmI2O1xuICAgICAgICB0ZVs0XSA9IGEzKmIxICsgYTQqYjQgKyBhNSpiNztcbiAgICAgICAgdGVbNV0gPSBhMypiMiArIGE0KmI1ICsgYTUqYjg7XG4gICAgICAgIHRlWzZdID0gYTYqYjAgKyBhNypiMyArIGE4KmI2O1xuICAgICAgICB0ZVs3XSA9IGE2KmIxICsgYTcqYjQgKyBhOCpiNztcbiAgICAgICAgdGVbOF0gPSBhNipiMiArIGE3KmI1ICsgYTgqYjg7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICB9LCovXG5cbiAgICB0cmFuc3Bvc2U6IGZ1bmN0aW9uIChtKSB7XG5cbiAgICAgIGlmIChtICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdmFyIGEgPSBtLmVsZW1lbnRzO1xuICAgICAgICB0aGlzLnNldChhWzBdLCBhWzNdLCBhWzZdLCBhWzFdLCBhWzRdLCBhWzddLCBhWzJdLCBhWzVdLCBhWzhdKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG5cbiAgICAgIHZhciB0ZSA9IHRoaXMuZWxlbWVudHM7XG4gICAgICB2YXIgYTAxID0gdGVbMV0sIGEwMiA9IHRlWzJdLCBhMTIgPSB0ZVs1XTtcbiAgICAgIHRlWzFdID0gdGVbM107XG4gICAgICB0ZVsyXSA9IHRlWzZdO1xuICAgICAgdGVbM10gPSBhMDE7XG4gICAgICB0ZVs1XSA9IHRlWzddO1xuICAgICAgdGVbNl0gPSBhMDI7XG4gICAgICB0ZVs3XSA9IGExMjtcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfSxcblxuXG5cbiAgICAvKm11bFNjYWxlOiBmdW5jdGlvbiAoIG0sIHN4LCBzeSwgc3osIFByZXBlbmQgKSB7XG5cbiAgICAgICAgdmFyIHByZXBlbmQgPSBQcmVwZW5kIHx8IGZhbHNlO1xuICAgICAgICB2YXIgdGUgPSB0aGlzLmVsZW1lbnRzLCB0bSA9IG0uZWxlbWVudHM7XG4gICAgICAgIGlmKHByZXBlbmQpe1xuICAgICAgICAgICAgdGVbMF0gPSBzeCp0bVswXTsgdGVbMV0gPSBzeCp0bVsxXTsgdGVbMl0gPSBzeCp0bVsyXTtcbiAgICAgICAgICAgIHRlWzNdID0gc3kqdG1bM107IHRlWzRdID0gc3kqdG1bNF07IHRlWzVdID0gc3kqdG1bNV07XG4gICAgICAgICAgICB0ZVs2XSA9IHN6KnRtWzZdOyB0ZVs3XSA9IHN6KnRtWzddOyB0ZVs4XSA9IHN6KnRtWzhdO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHRlWzBdID0gdG1bMF0qc3g7IHRlWzFdID0gdG1bMV0qc3k7IHRlWzJdID0gdG1bMl0qc3o7XG4gICAgICAgICAgICB0ZVszXSA9IHRtWzNdKnN4OyB0ZVs0XSA9IHRtWzRdKnN5OyB0ZVs1XSA9IHRtWzVdKnN6O1xuICAgICAgICAgICAgdGVbNl0gPSB0bVs2XSpzeDsgdGVbN10gPSB0bVs3XSpzeTsgdGVbOF0gPSB0bVs4XSpzejtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcblxuICAgIH0sXG5cbiAgICB0cmFuc3Bvc2U6IGZ1bmN0aW9uICggbSApIHtcblxuICAgICAgICB2YXIgdGUgPSB0aGlzLmVsZW1lbnRzLCB0bSA9IG0uZWxlbWVudHM7XG4gICAgICAgIHRlWzBdID0gdG1bMF07IHRlWzFdID0gdG1bM107IHRlWzJdID0gdG1bNl07XG4gICAgICAgIHRlWzNdID0gdG1bMV07IHRlWzRdID0gdG1bNF07IHRlWzVdID0gdG1bN107XG4gICAgICAgIHRlWzZdID0gdG1bMl07IHRlWzddID0gdG1bNV07IHRlWzhdID0gdG1bOF07XG4gICAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfSwqL1xuXG4gICAgc2V0UXVhdDogZnVuY3Rpb24gKHEpIHtcblxuICAgICAgdmFyIHRlID0gdGhpcy5lbGVtZW50cztcbiAgICAgIHZhciB4ID0gcS54LCB5ID0gcS55LCB6ID0gcS56LCB3ID0gcS53O1xuICAgICAgdmFyIHgyID0geCArIHgsIHkyID0geSArIHksIHoyID0geiArIHo7XG4gICAgICB2YXIgeHggPSB4ICogeDIsIHh5ID0geCAqIHkyLCB4eiA9IHggKiB6MjtcbiAgICAgIHZhciB5eSA9IHkgKiB5MiwgeXogPSB5ICogejIsIHp6ID0geiAqIHoyO1xuICAgICAgdmFyIHd4ID0gdyAqIHgyLCB3eSA9IHcgKiB5Miwgd3ogPSB3ICogejI7XG5cbiAgICAgIHRlWzBdID0gMSAtICh5eSArIHp6KTtcbiAgICAgIHRlWzFdID0geHkgLSB3ejtcbiAgICAgIHRlWzJdID0geHogKyB3eTtcblxuICAgICAgdGVbM10gPSB4eSArIHd6O1xuICAgICAgdGVbNF0gPSAxIC0gKHh4ICsgenopO1xuICAgICAgdGVbNV0gPSB5eiAtIHd4O1xuXG4gICAgICB0ZVs2XSA9IHh6IC0gd3k7XG4gICAgICB0ZVs3XSA9IHl6ICsgd3g7XG4gICAgICB0ZVs4XSA9IDEgLSAoeHggKyB5eSk7XG5cbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfSxcblxuICAgIGludmVydDogZnVuY3Rpb24gKG0pIHtcblxuICAgICAgdmFyIHRlID0gdGhpcy5lbGVtZW50cywgdG0gPSBtLmVsZW1lbnRzLFxuICAgICAgICBhMDAgPSB0bVswXSwgYTEwID0gdG1bM10sIGEyMCA9IHRtWzZdLFxuICAgICAgICBhMDEgPSB0bVsxXSwgYTExID0gdG1bNF0sIGEyMSA9IHRtWzddLFxuICAgICAgICBhMDIgPSB0bVsyXSwgYTEyID0gdG1bNV0sIGEyMiA9IHRtWzhdLFxuICAgICAgICBiMDEgPSBhMjIgKiBhMTEgLSBhMTIgKiBhMjEsXG4gICAgICAgIGIxMSA9IC1hMjIgKiBhMTAgKyBhMTIgKiBhMjAsXG4gICAgICAgIGIyMSA9IGEyMSAqIGExMCAtIGExMSAqIGEyMCxcbiAgICAgICAgZGV0ID0gYTAwICogYjAxICsgYTAxICogYjExICsgYTAyICogYjIxO1xuXG4gICAgICBpZiAoZGV0ID09PSAwKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiY2FuJ3QgaW52ZXJ0IG1hdHJpeCwgZGV0ZXJtaW5hbnQgaXMgMFwiKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuaWRlbnRpdHkoKTtcbiAgICAgIH1cblxuICAgICAgZGV0ID0gMS4wIC8gZGV0O1xuICAgICAgdGVbMF0gPSBiMDEgKiBkZXQ7XG4gICAgICB0ZVsxXSA9ICgtYTIyICogYTAxICsgYTAyICogYTIxKSAqIGRldDtcbiAgICAgIHRlWzJdID0gKGExMiAqIGEwMSAtIGEwMiAqIGExMSkgKiBkZXQ7XG4gICAgICB0ZVszXSA9IGIxMSAqIGRldDtcbiAgICAgIHRlWzRdID0gKGEyMiAqIGEwMCAtIGEwMiAqIGEyMCkgKiBkZXQ7XG4gICAgICB0ZVs1XSA9ICgtYTEyICogYTAwICsgYTAyICogYTEwKSAqIGRldDtcbiAgICAgIHRlWzZdID0gYjIxICogZGV0O1xuICAgICAgdGVbN10gPSAoLWEyMSAqIGEwMCArIGEwMSAqIGEyMCkgKiBkZXQ7XG4gICAgICB0ZVs4XSA9IChhMTEgKiBhMDAgLSBhMDEgKiBhMTApICogZGV0O1xuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICB9LFxuXG4gICAgYWRkT2Zmc2V0OiBmdW5jdGlvbiAobSwgdikge1xuXG4gICAgICB2YXIgcmVsWCA9IHYueDtcbiAgICAgIHZhciByZWxZID0gdi55O1xuICAgICAgdmFyIHJlbFogPSB2Lno7XG5cbiAgICAgIHZhciB0ZSA9IHRoaXMuZWxlbWVudHM7XG4gICAgICB0ZVswXSArPSBtICogKHJlbFkgKiByZWxZICsgcmVsWiAqIHJlbFopO1xuICAgICAgdGVbNF0gKz0gbSAqIChyZWxYICogcmVsWCArIHJlbFogKiByZWxaKTtcbiAgICAgIHRlWzhdICs9IG0gKiAocmVsWCAqIHJlbFggKyByZWxZICogcmVsWSk7XG4gICAgICB2YXIgeHkgPSBtICogcmVsWCAqIHJlbFk7XG4gICAgICB2YXIgeXogPSBtICogcmVsWSAqIHJlbFo7XG4gICAgICB2YXIgenggPSBtICogcmVsWiAqIHJlbFg7XG4gICAgICB0ZVsxXSAtPSB4eTtcbiAgICAgIHRlWzNdIC09IHh5O1xuICAgICAgdGVbMl0gLT0geXo7XG4gICAgICB0ZVs2XSAtPSB5ejtcbiAgICAgIHRlWzVdIC09IHp4O1xuICAgICAgdGVbN10gLT0geng7XG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIH0sXG5cbiAgICBzdWJPZmZzZXQ6IGZ1bmN0aW9uIChtLCB2KSB7XG5cbiAgICAgIHZhciByZWxYID0gdi54O1xuICAgICAgdmFyIHJlbFkgPSB2Lnk7XG4gICAgICB2YXIgcmVsWiA9IHYuejtcblxuICAgICAgdmFyIHRlID0gdGhpcy5lbGVtZW50cztcbiAgICAgIHRlWzBdIC09IG0gKiAocmVsWSAqIHJlbFkgKyByZWxaICogcmVsWik7XG4gICAgICB0ZVs0XSAtPSBtICogKHJlbFggKiByZWxYICsgcmVsWiAqIHJlbFopO1xuICAgICAgdGVbOF0gLT0gbSAqIChyZWxYICogcmVsWCArIHJlbFkgKiByZWxZKTtcbiAgICAgIHZhciB4eSA9IG0gKiByZWxYICogcmVsWTtcbiAgICAgIHZhciB5eiA9IG0gKiByZWxZICogcmVsWjtcbiAgICAgIHZhciB6eCA9IG0gKiByZWxaICogcmVsWDtcbiAgICAgIHRlWzFdICs9IHh5O1xuICAgICAgdGVbM10gKz0geHk7XG4gICAgICB0ZVsyXSArPSB5ejtcbiAgICAgIHRlWzZdICs9IHl6O1xuICAgICAgdGVbNV0gKz0geng7XG4gICAgICB0ZVs3XSArPSB6eDtcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfSxcblxuICAgIC8vIE9LIFxuXG4gICAgbXVsdGlwbHlTY2FsYXI6IGZ1bmN0aW9uIChzKSB7XG5cbiAgICAgIHZhciB0ZSA9IHRoaXMuZWxlbWVudHM7XG5cbiAgICAgIHRlWzBdICo9IHM7IHRlWzNdICo9IHM7IHRlWzZdICo9IHM7XG4gICAgICB0ZVsxXSAqPSBzOyB0ZVs0XSAqPSBzOyB0ZVs3XSAqPSBzO1xuICAgICAgdGVbMl0gKj0gczsgdGVbNV0gKj0gczsgdGVbOF0gKj0gcztcblxuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICB9LFxuXG4gICAgaWRlbnRpdHk6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgdGhpcy5zZXQoMSwgMCwgMCwgMCwgMSwgMCwgMCwgMCwgMSk7XG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIH0sXG5cblxuICAgIGNsb25lOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHJldHVybiBuZXcgTWF0MzMoKS5mcm9tQXJyYXkodGhpcy5lbGVtZW50cyk7XG5cbiAgICB9LFxuXG4gICAgY29weTogZnVuY3Rpb24gKG0pIHtcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCA5OyBpKyspIHRoaXMuZWxlbWVudHNbaV0gPSBtLmVsZW1lbnRzW2ldO1xuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICB9LFxuXG4gICAgZGV0ZXJtaW5hbnQ6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgdmFyIHRlID0gdGhpcy5lbGVtZW50cztcbiAgICAgIHZhciBhID0gdGVbMF0sIGIgPSB0ZVsxXSwgYyA9IHRlWzJdLFxuICAgICAgICBkID0gdGVbM10sIGUgPSB0ZVs0XSwgZiA9IHRlWzVdLFxuICAgICAgICBnID0gdGVbNl0sIGggPSB0ZVs3XSwgaSA9IHRlWzhdO1xuXG4gICAgICByZXR1cm4gYSAqIGUgKiBpIC0gYSAqIGYgKiBoIC0gYiAqIGQgKiBpICsgYiAqIGYgKiBnICsgYyAqIGQgKiBoIC0gYyAqIGUgKiBnO1xuXG4gICAgfSxcblxuICAgIGZyb21BcnJheTogZnVuY3Rpb24gKGFycmF5LCBvZmZzZXQpIHtcblxuICAgICAgaWYgKG9mZnNldCA9PT0gdW5kZWZpbmVkKSBvZmZzZXQgPSAwO1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDk7IGkrKykge1xuXG4gICAgICAgIHRoaXMuZWxlbWVudHNbaV0gPSBhcnJheVtpICsgb2Zmc2V0XTtcblxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIH0sXG5cbiAgICB0b0FycmF5OiBmdW5jdGlvbiAoYXJyYXksIG9mZnNldCkge1xuXG4gICAgICBpZiAoYXJyYXkgPT09IHVuZGVmaW5lZCkgYXJyYXkgPSBbXTtcbiAgICAgIGlmIChvZmZzZXQgPT09IHVuZGVmaW5lZCkgb2Zmc2V0ID0gMDtcblxuICAgICAgdmFyIHRlID0gdGhpcy5lbGVtZW50cztcblxuICAgICAgYXJyYXlbb2Zmc2V0XSA9IHRlWzBdO1xuICAgICAgYXJyYXlbb2Zmc2V0ICsgMV0gPSB0ZVsxXTtcbiAgICAgIGFycmF5W29mZnNldCArIDJdID0gdGVbMl07XG5cbiAgICAgIGFycmF5W29mZnNldCArIDNdID0gdGVbM107XG4gICAgICBhcnJheVtvZmZzZXQgKyA0XSA9IHRlWzRdO1xuICAgICAgYXJyYXlbb2Zmc2V0ICsgNV0gPSB0ZVs1XTtcblxuICAgICAgYXJyYXlbb2Zmc2V0ICsgNl0gPSB0ZVs2XTtcbiAgICAgIGFycmF5W29mZnNldCArIDddID0gdGVbN107XG4gICAgICBhcnJheVtvZmZzZXQgKyA4XSA9IHRlWzhdO1xuXG4gICAgICByZXR1cm4gYXJyYXk7XG5cbiAgICB9XG5cblxuICB9KTtcblxuICAvKipcbiAgICogQW4gYXhpcy1hbGlnbmVkIGJvdW5kaW5nIGJveC5cbiAgICpcbiAgICogQGF1dGhvciBzYWhhcmFuXG4gICAqIEBhdXRob3IgbG8tdGhcbiAgICovXG5cbiAgZnVuY3Rpb24gQUFCQihtaW5YLCBtYXhYLCBtaW5ZLCBtYXhZLCBtaW5aLCBtYXhaKSB7XG5cbiAgICB0aGlzLmVsZW1lbnRzID0gbmV3IEZsb2F0MzJBcnJheSg2KTtcbiAgICB2YXIgdGUgPSB0aGlzLmVsZW1lbnRzO1xuXG4gICAgdGVbMF0gPSBtaW5YIHx8IDA7IHRlWzFdID0gbWluWSB8fCAwOyB0ZVsyXSA9IG1pblogfHwgMDtcbiAgICB0ZVszXSA9IG1heFggfHwgMDsgdGVbNF0gPSBtYXhZIHx8IDA7IHRlWzVdID0gbWF4WiB8fCAwO1xuXG4gIH1cbiAgT2JqZWN0LmFzc2lnbihBQUJCLnByb3RvdHlwZSwge1xuXG4gICAgQUFCQjogdHJ1ZSxcblxuICAgIHNldDogZnVuY3Rpb24gKG1pblgsIG1heFgsIG1pblksIG1heFksIG1pblosIG1heFopIHtcblxuICAgICAgdmFyIHRlID0gdGhpcy5lbGVtZW50cztcbiAgICAgIHRlWzBdID0gbWluWDtcbiAgICAgIHRlWzNdID0gbWF4WDtcbiAgICAgIHRlWzFdID0gbWluWTtcbiAgICAgIHRlWzRdID0gbWF4WTtcbiAgICAgIHRlWzJdID0gbWluWjtcbiAgICAgIHRlWzVdID0gbWF4WjtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICBpbnRlcnNlY3RUZXN0OiBmdW5jdGlvbiAoYWFiYikge1xuXG4gICAgICB2YXIgdGUgPSB0aGlzLmVsZW1lbnRzO1xuICAgICAgdmFyIHVlID0gYWFiYi5lbGVtZW50cztcbiAgICAgIHJldHVybiB0ZVswXSA+IHVlWzNdIHx8IHRlWzFdID4gdWVbNF0gfHwgdGVbMl0gPiB1ZVs1XSB8fCB0ZVszXSA8IHVlWzBdIHx8IHRlWzRdIDwgdWVbMV0gfHwgdGVbNV0gPCB1ZVsyXSA/IHRydWUgOiBmYWxzZTtcblxuICAgIH0sXG5cbiAgICBpbnRlcnNlY3RUZXN0VHdvOiBmdW5jdGlvbiAoYWFiYikge1xuXG4gICAgICB2YXIgdGUgPSB0aGlzLmVsZW1lbnRzO1xuICAgICAgdmFyIHVlID0gYWFiYi5lbGVtZW50cztcbiAgICAgIHJldHVybiB0ZVswXSA8IHVlWzBdIHx8IHRlWzFdIDwgdWVbMV0gfHwgdGVbMl0gPCB1ZVsyXSB8fCB0ZVszXSA+IHVlWzNdIHx8IHRlWzRdID4gdWVbNF0gfHwgdGVbNV0gPiB1ZVs1XSA/IHRydWUgOiBmYWxzZTtcblxuICAgIH0sXG5cbiAgICBjbG9uZTogZnVuY3Rpb24gKCkge1xuXG4gICAgICByZXR1cm4gbmV3IHRoaXMuY29uc3RydWN0b3IoKS5mcm9tQXJyYXkodGhpcy5lbGVtZW50cyk7XG5cbiAgICB9LFxuXG4gICAgY29weTogZnVuY3Rpb24gKGFhYmIsIG1hcmdpbikge1xuXG4gICAgICB2YXIgbSA9IG1hcmdpbiB8fCAwO1xuICAgICAgdmFyIG1lID0gYWFiYi5lbGVtZW50cztcbiAgICAgIHRoaXMuc2V0KG1lWzBdIC0gbSwgbWVbM10gKyBtLCBtZVsxXSAtIG0sIG1lWzRdICsgbSwgbWVbMl0gLSBtLCBtZVs1XSArIG0pO1xuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICB9LFxuXG4gICAgZnJvbUFycmF5OiBmdW5jdGlvbiAoYXJyYXkpIHtcblxuICAgICAgdGhpcy5lbGVtZW50cy5zZXQoYXJyYXkpO1xuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICB9LFxuXG4gICAgLy8gU2V0IHRoaXMgQUFCQiB0byB0aGUgY29tYmluZWQgQUFCQiBvZiBhYWJiMSBhbmQgYWFiYjIuXG5cbiAgICBjb21iaW5lOiBmdW5jdGlvbiAoYWFiYjEsIGFhYmIyKSB7XG5cbiAgICAgIHZhciBhID0gYWFiYjEuZWxlbWVudHM7XG4gICAgICB2YXIgYiA9IGFhYmIyLmVsZW1lbnRzO1xuICAgICAgdmFyIHRlID0gdGhpcy5lbGVtZW50cztcblxuICAgICAgdGVbMF0gPSBhWzBdIDwgYlswXSA/IGFbMF0gOiBiWzBdO1xuICAgICAgdGVbMV0gPSBhWzFdIDwgYlsxXSA/IGFbMV0gOiBiWzFdO1xuICAgICAgdGVbMl0gPSBhWzJdIDwgYlsyXSA/IGFbMl0gOiBiWzJdO1xuXG4gICAgICB0ZVszXSA9IGFbM10gPiBiWzNdID8gYVszXSA6IGJbM107XG4gICAgICB0ZVs0XSA9IGFbNF0gPiBiWzRdID8gYVs0XSA6IGJbNF07XG4gICAgICB0ZVs1XSA9IGFbNV0gPiBiWzVdID8gYVs1XSA6IGJbNV07XG5cbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfSxcblxuXG4gICAgLy8gR2V0IHRoZSBzdXJmYWNlIGFyZWEuXG5cbiAgICBzdXJmYWNlQXJlYTogZnVuY3Rpb24gKCkge1xuXG4gICAgICB2YXIgdGUgPSB0aGlzLmVsZW1lbnRzO1xuICAgICAgdmFyIGEgPSB0ZVszXSAtIHRlWzBdO1xuICAgICAgdmFyIGggPSB0ZVs0XSAtIHRlWzFdO1xuICAgICAgdmFyIGQgPSB0ZVs1XSAtIHRlWzJdO1xuICAgICAgcmV0dXJuIDIgKiAoYSAqIChoICsgZCkgKyBoICogZCk7XG5cbiAgICB9LFxuXG5cbiAgICAvLyBHZXQgd2hldGhlciB0aGUgQUFCQiBpbnRlcnNlY3RzIHdpdGggdGhlIHBvaW50IG9yIG5vdC5cblxuICAgIGludGVyc2VjdHNXaXRoUG9pbnQ6IGZ1bmN0aW9uICh4LCB5LCB6KSB7XG5cbiAgICAgIHZhciB0ZSA9IHRoaXMuZWxlbWVudHM7XG4gICAgICByZXR1cm4geCA+PSB0ZVswXSAmJiB4IDw9IHRlWzNdICYmIHkgPj0gdGVbMV0gJiYgeSA8PSB0ZVs0XSAmJiB6ID49IHRlWzJdICYmIHogPD0gdGVbNV07XG5cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IHRoZSBBQUJCIGZyb20gYW4gYXJyYXlcbiAgICAgKiBvZiB2ZXJ0aWNlcy4gRnJvbSBUSFJFRS5cbiAgICAgKiBAYXV0aG9yIFdlc3RMYW5nbGV5XG4gICAgICogQGF1dGhvciB4cHJvZ3JhbVxuICAgICAqL1xuXG4gICAgc2V0RnJvbVBvaW50czogZnVuY3Rpb24gKGFycikge1xuICAgICAgdGhpcy5tYWtlRW1wdHkoKTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHRoaXMuZXhwYW5kQnlQb2ludChhcnJbaV0pO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBtYWtlRW1wdHk6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuc2V0KC1JbmZpbml0eSwgLUluZmluaXR5LCAtSW5maW5pdHksIEluZmluaXR5LCBJbmZpbml0eSwgSW5maW5pdHkpO1xuICAgIH0sXG5cbiAgICBleHBhbmRCeVBvaW50OiBmdW5jdGlvbiAocHQpIHtcbiAgICAgIHZhciB0ZSA9IHRoaXMuZWxlbWVudHM7XG4gICAgICB0aGlzLnNldChcbiAgICAgICAgX01hdGgubWluKHRlWzBdLCBwdC54KSwgX01hdGgubWluKHRlWzFdLCBwdC55KSwgX01hdGgubWluKHRlWzJdLCBwdC56KSxcbiAgICAgICAgX01hdGgubWF4KHRlWzNdLCBwdC54KSwgX01hdGgubWF4KHRlWzRdLCBwdC55KSwgX01hdGgubWF4KHRlWzVdLCBwdC56KVxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgZXhwYW5kQnlTY2FsYXI6IGZ1bmN0aW9uIChzKSB7XG5cbiAgICAgIHZhciB0ZSA9IHRoaXMuZWxlbWVudHM7XG4gICAgICB0ZVswXSArPSAtcztcbiAgICAgIHRlWzFdICs9IC1zO1xuICAgICAgdGVbMl0gKz0gLXM7XG4gICAgICB0ZVszXSArPSBzO1xuICAgICAgdGVbNF0gKz0gcztcbiAgICAgIHRlWzVdICs9IHM7XG4gICAgfVxuXG4gIH0pO1xuXG4gIHZhciBjb3VudCA9IDA7XG4gIGZ1bmN0aW9uIFNoYXBlSWRDb3VudCgpIHsgcmV0dXJuIGNvdW50Kys7IH1cblxuICAvKipcbiAgICogQSBzaGFwZSBpcyB1c2VkIHRvIGRldGVjdCBjb2xsaXNpb25zIG9mIHJpZ2lkIGJvZGllcy5cbiAgICpcbiAgICogQGF1dGhvciBzYWhhcmFuXG4gICAqIEBhdXRob3IgbG8tdGhcbiAgICovXG5cbiAgZnVuY3Rpb24gU2hhcGUoY29uZmlnKSB7XG5cbiAgICB0aGlzLnR5cGUgPSBTSEFQRV9OVUxMO1xuXG4gICAgLy8gZ2xvYmFsIGlkZW50aWZpY2F0aW9uIG9mIHRoZSBzaGFwZSBzaG91bGQgYmUgdW5pcXVlIHRvIHRoZSBzaGFwZS5cbiAgICB0aGlzLmlkID0gU2hhcGVJZENvdW50KCk7XG5cbiAgICAvLyBwcmV2aW91cyBzaGFwZSBpbiBwYXJlbnQgcmlnaWQgYm9keS4gVXNlZCBmb3IgZmFzdCBpbnRlcmF0aW9ucy5cbiAgICB0aGlzLnByZXYgPSBudWxsO1xuXG4gICAgLy8gbmV4dCBzaGFwZSBpbiBwYXJlbnQgcmlnaWQgYm9keS4gVXNlZCBmb3IgZmFzdCBpbnRlcmF0aW9ucy5cbiAgICB0aGlzLm5leHQgPSBudWxsO1xuXG4gICAgLy8gcHJveHkgb2YgdGhlIHNoYXBlIHVzZWQgZm9yIGJyb2FkLXBoYXNlIGNvbGxpc2lvbiBkZXRlY3Rpb24uXG4gICAgdGhpcy5wcm94eSA9IG51bGw7XG5cbiAgICAvLyBwYXJlbnQgcmlnaWQgYm9keSBvZiB0aGUgc2hhcGUuXG4gICAgdGhpcy5wYXJlbnQgPSBudWxsO1xuXG4gICAgLy8gbGlua2VkIGxpc3Qgb2YgdGhlIGNvbnRhY3RzIHdpdGggdGhlIHNoYXBlLlxuICAgIHRoaXMuY29udGFjdExpbmsgPSBudWxsO1xuXG4gICAgLy8gbnVtYmVyIG9mIHRoZSBjb250YWN0cyB3aXRoIHRoZSBzaGFwZS5cbiAgICB0aGlzLm51bUNvbnRhY3RzID0gMDtcblxuICAgIC8vIGNlbnRlciBvZiBncmF2aXR5IG9mIHRoZSBzaGFwZSBpbiB3b3JsZCBjb29yZGluYXRlIHN5c3RlbS5cbiAgICB0aGlzLnBvc2l0aW9uID0gbmV3IFZlYzMoKTtcblxuICAgIC8vIHJvdGF0aW9uIG1hdHJpeCBvZiB0aGUgc2hhcGUgaW4gd29ybGQgY29vcmRpbmF0ZSBzeXN0ZW0uXG4gICAgdGhpcy5yb3RhdGlvbiA9IG5ldyBNYXQzMygpO1xuXG4gICAgLy8gcG9zaXRpb24gb2YgdGhlIHNoYXBlIGluIHBhcmVudCdzIGNvb3JkaW5hdGUgc3lzdGVtLlxuICAgIHRoaXMucmVsYXRpdmVQb3NpdGlvbiA9IG5ldyBWZWMzKCkuY29weShjb25maWcucmVsYXRpdmVQb3NpdGlvbik7XG5cbiAgICAvLyByb3RhdGlvbiBtYXRyaXggb2YgdGhlIHNoYXBlIGluIHBhcmVudCdzIGNvb3JkaW5hdGUgc3lzdGVtLlxuICAgIHRoaXMucmVsYXRpdmVSb3RhdGlvbiA9IG5ldyBNYXQzMygpLmNvcHkoY29uZmlnLnJlbGF0aXZlUm90YXRpb24pO1xuXG4gICAgLy8gYXhpcy1hbGlnbmVkIGJvdW5kaW5nIGJveCBvZiB0aGUgc2hhcGUuXG4gICAgdGhpcy5hYWJiID0gbmV3IEFBQkIoKTtcblxuICAgIC8vIGRlbnNpdHkgb2YgdGhlIHNoYXBlLlxuICAgIHRoaXMuZGVuc2l0eSA9IGNvbmZpZy5kZW5zaXR5O1xuXG4gICAgLy8gY29lZmZpY2llbnQgb2YgZnJpY3Rpb24gb2YgdGhlIHNoYXBlLlxuICAgIHRoaXMuZnJpY3Rpb24gPSBjb25maWcuZnJpY3Rpb247XG5cbiAgICAvLyBjb2VmZmljaWVudCBvZiByZXN0aXR1dGlvbiBvZiB0aGUgc2hhcGUuXG4gICAgdGhpcy5yZXN0aXR1dGlvbiA9IGNvbmZpZy5yZXN0aXR1dGlvbjtcblxuICAgIC8vIGJpdHMgb2YgdGhlIGNvbGxpc2lvbiBncm91cHMgdG8gd2hpY2ggdGhlIHNoYXBlIGJlbG9uZ3MuXG4gICAgdGhpcy5iZWxvbmdzVG8gPSBjb25maWcuYmVsb25nc1RvO1xuXG4gICAgLy8gYml0cyBvZiB0aGUgY29sbGlzaW9uIGdyb3VwcyB3aXRoIHdoaWNoIHRoZSBzaGFwZSBjb2xsaWRlcy5cbiAgICB0aGlzLmNvbGxpZGVzV2l0aCA9IGNvbmZpZy5jb2xsaWRlc1dpdGg7XG5cbiAgfVxuICBPYmplY3QuYXNzaWduKFNoYXBlLnByb3RvdHlwZSwge1xuXG4gICAgU2hhcGU6IHRydWUsXG5cbiAgICAvLyBDYWxjdWxhdGUgdGhlIG1hc3MgaW5mb3JtYXRpb24gb2YgdGhlIHNoYXBlLlxuXG4gICAgY2FsY3VsYXRlTWFzc0luZm86IGZ1bmN0aW9uIChvdXQpIHtcblxuICAgICAgcHJpbnRFcnJvcihcIlNoYXBlXCIsIFwiSW5oZXJpdGFuY2UgZXJyb3IuXCIpO1xuXG4gICAgfSxcblxuICAgIC8vIFVwZGF0ZSB0aGUgcHJveHkgb2YgdGhlIHNoYXBlLlxuXG4gICAgdXBkYXRlUHJveHk6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgcHJpbnRFcnJvcihcIlNoYXBlXCIsIFwiSW5oZXJpdGFuY2UgZXJyb3IuXCIpO1xuXG4gICAgfVxuXG4gIH0pO1xuXG4gIC8qKlxuICAgKiBCb3ggc2hhcGUuXG4gICAqIEBhdXRob3Igc2FoYXJhblxuICAgKiBAYXV0aG9yIGxvLXRoXG4gICAqL1xuXG4gIGZ1bmN0aW9uIEJveChjb25maWcsIFdpZHRoLCBIZWlnaHQsIERlcHRoKSB7XG5cbiAgICBTaGFwZS5jYWxsKHRoaXMsIGNvbmZpZyk7XG5cbiAgICB0aGlzLnR5cGUgPSBTSEFQRV9CT1g7XG5cbiAgICB0aGlzLndpZHRoID0gV2lkdGg7XG4gICAgdGhpcy5oZWlnaHQgPSBIZWlnaHQ7XG4gICAgdGhpcy5kZXB0aCA9IERlcHRoO1xuXG4gICAgdGhpcy5oYWxmV2lkdGggPSBXaWR0aCAqIDAuNTtcbiAgICB0aGlzLmhhbGZIZWlnaHQgPSBIZWlnaHQgKiAwLjU7XG4gICAgdGhpcy5oYWxmRGVwdGggPSBEZXB0aCAqIDAuNTtcblxuICAgIHRoaXMuZGltZW50aW9ucyA9IG5ldyBGbG9hdDMyQXJyYXkoMTgpO1xuICAgIHRoaXMuZWxlbWVudHMgPSBuZXcgRmxvYXQzMkFycmF5KDI0KTtcblxuICB9XG4gIEJveC5wcm90b3R5cGUgPSBPYmplY3QuYXNzaWduKE9iamVjdC5jcmVhdGUoU2hhcGUucHJvdG90eXBlKSwge1xuXG4gICAgY29uc3RydWN0b3I6IEJveCxcblxuICAgIGNhbGN1bGF0ZU1hc3NJbmZvOiBmdW5jdGlvbiAob3V0KSB7XG5cbiAgICAgIHZhciBtYXNzID0gdGhpcy53aWR0aCAqIHRoaXMuaGVpZ2h0ICogdGhpcy5kZXB0aCAqIHRoaXMuZGVuc2l0eTtcbiAgICAgIHZhciBkaXZpZCA9IDEgLyAxMjtcbiAgICAgIG91dC5tYXNzID0gbWFzcztcbiAgICAgIG91dC5pbmVydGlhLnNldChcbiAgICAgICAgbWFzcyAqICh0aGlzLmhlaWdodCAqIHRoaXMuaGVpZ2h0ICsgdGhpcy5kZXB0aCAqIHRoaXMuZGVwdGgpICogZGl2aWQsIDAsIDAsXG4gICAgICAgIDAsIG1hc3MgKiAodGhpcy53aWR0aCAqIHRoaXMud2lkdGggKyB0aGlzLmRlcHRoICogdGhpcy5kZXB0aCkgKiBkaXZpZCwgMCxcbiAgICAgICAgMCwgMCwgbWFzcyAqICh0aGlzLndpZHRoICogdGhpcy53aWR0aCArIHRoaXMuaGVpZ2h0ICogdGhpcy5oZWlnaHQpICogZGl2aWRcbiAgICAgICk7XG5cbiAgICB9LFxuXG4gICAgdXBkYXRlUHJveHk6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgdmFyIHRlID0gdGhpcy5yb3RhdGlvbi5lbGVtZW50cztcbiAgICAgIHZhciBkaSA9IHRoaXMuZGltZW50aW9ucztcbiAgICAgIC8vIFdpZHRoXG4gICAgICBkaVswXSA9IHRlWzBdO1xuICAgICAgZGlbMV0gPSB0ZVszXTtcbiAgICAgIGRpWzJdID0gdGVbNl07XG4gICAgICAvLyBIZWlnaHRcbiAgICAgIGRpWzNdID0gdGVbMV07XG4gICAgICBkaVs0XSA9IHRlWzRdO1xuICAgICAgZGlbNV0gPSB0ZVs3XTtcbiAgICAgIC8vIERlcHRoXG4gICAgICBkaVs2XSA9IHRlWzJdO1xuICAgICAgZGlbN10gPSB0ZVs1XTtcbiAgICAgIGRpWzhdID0gdGVbOF07XG4gICAgICAvLyBoYWxmIFdpZHRoXG4gICAgICBkaVs5XSA9IHRlWzBdICogdGhpcy5oYWxmV2lkdGg7XG4gICAgICBkaVsxMF0gPSB0ZVszXSAqIHRoaXMuaGFsZldpZHRoO1xuICAgICAgZGlbMTFdID0gdGVbNl0gKiB0aGlzLmhhbGZXaWR0aDtcbiAgICAgIC8vIGhhbGYgSGVpZ2h0XG4gICAgICBkaVsxMl0gPSB0ZVsxXSAqIHRoaXMuaGFsZkhlaWdodDtcbiAgICAgIGRpWzEzXSA9IHRlWzRdICogdGhpcy5oYWxmSGVpZ2h0O1xuICAgICAgZGlbMTRdID0gdGVbN10gKiB0aGlzLmhhbGZIZWlnaHQ7XG4gICAgICAvLyBoYWxmIERlcHRoXG4gICAgICBkaVsxNV0gPSB0ZVsyXSAqIHRoaXMuaGFsZkRlcHRoO1xuICAgICAgZGlbMTZdID0gdGVbNV0gKiB0aGlzLmhhbGZEZXB0aDtcbiAgICAgIGRpWzE3XSA9IHRlWzhdICogdGhpcy5oYWxmRGVwdGg7XG5cbiAgICAgIHZhciB3eCA9IGRpWzldO1xuICAgICAgdmFyIHd5ID0gZGlbMTBdO1xuICAgICAgdmFyIHd6ID0gZGlbMTFdO1xuICAgICAgdmFyIGh4ID0gZGlbMTJdO1xuICAgICAgdmFyIGh5ID0gZGlbMTNdO1xuICAgICAgdmFyIGh6ID0gZGlbMTRdO1xuICAgICAgdmFyIGR4ID0gZGlbMTVdO1xuICAgICAgdmFyIGR5ID0gZGlbMTZdO1xuICAgICAgdmFyIGR6ID0gZGlbMTddO1xuXG4gICAgICB2YXIgeCA9IHRoaXMucG9zaXRpb24ueDtcbiAgICAgIHZhciB5ID0gdGhpcy5wb3NpdGlvbi55O1xuICAgICAgdmFyIHogPSB0aGlzLnBvc2l0aW9uLno7XG5cbiAgICAgIHZhciB2ID0gdGhpcy5lbGVtZW50cztcbiAgICAgIC8vdjFcbiAgICAgIHZbMF0gPSB4ICsgd3ggKyBoeCArIGR4O1xuICAgICAgdlsxXSA9IHkgKyB3eSArIGh5ICsgZHk7XG4gICAgICB2WzJdID0geiArIHd6ICsgaHogKyBkejtcbiAgICAgIC8vdjJcbiAgICAgIHZbM10gPSB4ICsgd3ggKyBoeCAtIGR4O1xuICAgICAgdls0XSA9IHkgKyB3eSArIGh5IC0gZHk7XG4gICAgICB2WzVdID0geiArIHd6ICsgaHogLSBkejtcbiAgICAgIC8vdjNcbiAgICAgIHZbNl0gPSB4ICsgd3ggLSBoeCArIGR4O1xuICAgICAgdls3XSA9IHkgKyB3eSAtIGh5ICsgZHk7XG4gICAgICB2WzhdID0geiArIHd6IC0gaHogKyBkejtcbiAgICAgIC8vdjRcbiAgICAgIHZbOV0gPSB4ICsgd3ggLSBoeCAtIGR4O1xuICAgICAgdlsxMF0gPSB5ICsgd3kgLSBoeSAtIGR5O1xuICAgICAgdlsxMV0gPSB6ICsgd3ogLSBoeiAtIGR6O1xuICAgICAgLy92NVxuICAgICAgdlsxMl0gPSB4IC0gd3ggKyBoeCArIGR4O1xuICAgICAgdlsxM10gPSB5IC0gd3kgKyBoeSArIGR5O1xuICAgICAgdlsxNF0gPSB6IC0gd3ogKyBoeiArIGR6O1xuICAgICAgLy92NlxuICAgICAgdlsxNV0gPSB4IC0gd3ggKyBoeCAtIGR4O1xuICAgICAgdlsxNl0gPSB5IC0gd3kgKyBoeSAtIGR5O1xuICAgICAgdlsxN10gPSB6IC0gd3ogKyBoeiAtIGR6O1xuICAgICAgLy92N1xuICAgICAgdlsxOF0gPSB4IC0gd3ggLSBoeCArIGR4O1xuICAgICAgdlsxOV0gPSB5IC0gd3kgLSBoeSArIGR5O1xuICAgICAgdlsyMF0gPSB6IC0gd3ogLSBoeiArIGR6O1xuICAgICAgLy92OFxuICAgICAgdlsyMV0gPSB4IC0gd3ggLSBoeCAtIGR4O1xuICAgICAgdlsyMl0gPSB5IC0gd3kgLSBoeSAtIGR5O1xuICAgICAgdlsyM10gPSB6IC0gd3ogLSBoeiAtIGR6O1xuXG4gICAgICB2YXIgdyA9IGRpWzldIDwgMCA/IC1kaVs5XSA6IGRpWzldO1xuICAgICAgdmFyIGggPSBkaVsxMF0gPCAwID8gLWRpWzEwXSA6IGRpWzEwXTtcbiAgICAgIHZhciBkID0gZGlbMTFdIDwgMCA/IC1kaVsxMV0gOiBkaVsxMV07XG5cbiAgICAgIHcgPSBkaVsxMl0gPCAwID8gdyAtIGRpWzEyXSA6IHcgKyBkaVsxMl07XG4gICAgICBoID0gZGlbMTNdIDwgMCA/IGggLSBkaVsxM10gOiBoICsgZGlbMTNdO1xuICAgICAgZCA9IGRpWzE0XSA8IDAgPyBkIC0gZGlbMTRdIDogZCArIGRpWzE0XTtcblxuICAgICAgdyA9IGRpWzE1XSA8IDAgPyB3IC0gZGlbMTVdIDogdyArIGRpWzE1XTtcbiAgICAgIGggPSBkaVsxNl0gPCAwID8gaCAtIGRpWzE2XSA6IGggKyBkaVsxNl07XG4gICAgICBkID0gZGlbMTddIDwgMCA/IGQgLSBkaVsxN10gOiBkICsgZGlbMTddO1xuXG4gICAgICB2YXIgcCA9IEFBQkJfUFJPWDtcblxuICAgICAgdGhpcy5hYWJiLnNldChcbiAgICAgICAgdGhpcy5wb3NpdGlvbi54IC0gdyAtIHAsIHRoaXMucG9zaXRpb24ueCArIHcgKyBwLFxuICAgICAgICB0aGlzLnBvc2l0aW9uLnkgLSBoIC0gcCwgdGhpcy5wb3NpdGlvbi55ICsgaCArIHAsXG4gICAgICAgIHRoaXMucG9zaXRpb24ueiAtIGQgLSBwLCB0aGlzLnBvc2l0aW9uLnogKyBkICsgcFxuICAgICAgKTtcblxuICAgICAgaWYgKHRoaXMucHJveHkgIT0gbnVsbCkgdGhpcy5wcm94eS51cGRhdGUoKTtcblxuICAgIH1cbiAgfSk7XG5cbiAgLyoqXG4gICAqIFNwaGVyZSBzaGFwZVxuICAgKiBAYXV0aG9yIHNhaGFyYW5cbiAgICogQGF1dGhvciBsby10aFxuICAgKi9cblxuICBmdW5jdGlvbiBTcGhlcmUoY29uZmlnLCByYWRpdXMpIHtcblxuICAgIFNoYXBlLmNhbGwodGhpcywgY29uZmlnKTtcblxuICAgIHRoaXMudHlwZSA9IFNIQVBFX1NQSEVSRTtcblxuICAgIC8vIHJhZGl1cyBvZiB0aGUgc2hhcGUuXG4gICAgdGhpcy5yYWRpdXMgPSByYWRpdXM7XG5cbiAgfVxuICBTcGhlcmUucHJvdG90eXBlID0gT2JqZWN0LmFzc2lnbihPYmplY3QuY3JlYXRlKFNoYXBlLnByb3RvdHlwZSksIHtcblxuICAgIGNvbnN0cnVjdG9yOiBTcGhlcmUsXG5cbiAgICB2b2x1bWU6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgcmV0dXJuIF9NYXRoLlBJICogdGhpcy5yYWRpdXMgKiAxLjMzMzMzMztcblxuICAgIH0sXG5cbiAgICBjYWxjdWxhdGVNYXNzSW5mbzogZnVuY3Rpb24gKG91dCkge1xuXG4gICAgICB2YXIgbWFzcyA9IHRoaXMudm9sdW1lKCkgKiB0aGlzLnJhZGl1cyAqIHRoaXMucmFkaXVzICogdGhpcy5kZW5zaXR5OyAvLzEuMzMzICogX01hdGguUEkgKiB0aGlzLnJhZGl1cyAqIHRoaXMucmFkaXVzICogdGhpcy5yYWRpdXMgKiB0aGlzLmRlbnNpdHk7XG4gICAgICBvdXQubWFzcyA9IG1hc3M7XG4gICAgICB2YXIgaW5lcnRpYSA9IG1hc3MgKiB0aGlzLnJhZGl1cyAqIHRoaXMucmFkaXVzICogMC40O1xuICAgICAgb3V0LmluZXJ0aWEuc2V0KGluZXJ0aWEsIDAsIDAsIDAsIGluZXJ0aWEsIDAsIDAsIDAsIGluZXJ0aWEpO1xuXG4gICAgfSxcblxuICAgIHVwZGF0ZVByb3h5OiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHZhciBwID0gQUFCQl9QUk9YO1xuXG4gICAgICB0aGlzLmFhYmIuc2V0KFxuICAgICAgICB0aGlzLnBvc2l0aW9uLnggLSB0aGlzLnJhZGl1cyAtIHAsIHRoaXMucG9zaXRpb24ueCArIHRoaXMucmFkaXVzICsgcCxcbiAgICAgICAgdGhpcy5wb3NpdGlvbi55IC0gdGhpcy5yYWRpdXMgLSBwLCB0aGlzLnBvc2l0aW9uLnkgKyB0aGlzLnJhZGl1cyArIHAsXG4gICAgICAgIHRoaXMucG9zaXRpb24ueiAtIHRoaXMucmFkaXVzIC0gcCwgdGhpcy5wb3NpdGlvbi56ICsgdGhpcy5yYWRpdXMgKyBwXG4gICAgICApO1xuXG4gICAgICBpZiAodGhpcy5wcm94eSAhPSBudWxsKSB0aGlzLnByb3h5LnVwZGF0ZSgpO1xuXG4gICAgfVxuXG4gIH0pO1xuXG4gIC8qKlxuICAgKiBDeWxpbmRlciBzaGFwZVxuICAgKiBAYXV0aG9yIHNhaGFyYW5cbiAgICogQGF1dGhvciBsby10aFxuICAgKi9cblxuICBmdW5jdGlvbiBDeWxpbmRlcihjb25maWcsIHJhZGl1cywgaGVpZ2h0KSB7XG5cbiAgICBTaGFwZS5jYWxsKHRoaXMsIGNvbmZpZyk7XG5cbiAgICB0aGlzLnR5cGUgPSBTSEFQRV9DWUxJTkRFUjtcblxuICAgIHRoaXMucmFkaXVzID0gcmFkaXVzO1xuICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgIHRoaXMuaGFsZkhlaWdodCA9IGhlaWdodCAqIDAuNTtcblxuICAgIHRoaXMubm9ybWFsRGlyZWN0aW9uID0gbmV3IFZlYzMoKTtcbiAgICB0aGlzLmhhbGZEaXJlY3Rpb24gPSBuZXcgVmVjMygpO1xuXG4gIH1cbiAgQ3lsaW5kZXIucHJvdG90eXBlID0gT2JqZWN0LmFzc2lnbihPYmplY3QuY3JlYXRlKFNoYXBlLnByb3RvdHlwZSksIHtcblxuICAgIGNvbnN0cnVjdG9yOiBDeWxpbmRlcixcblxuICAgIGNhbGN1bGF0ZU1hc3NJbmZvOiBmdW5jdGlvbiAob3V0KSB7XG5cbiAgICAgIHZhciByc3EgPSB0aGlzLnJhZGl1cyAqIHRoaXMucmFkaXVzO1xuICAgICAgdmFyIG1hc3MgPSBfTWF0aC5QSSAqIHJzcSAqIHRoaXMuaGVpZ2h0ICogdGhpcy5kZW5zaXR5O1xuICAgICAgdmFyIGluZXJ0aWFYWiA9ICgoMC4yNSAqIHJzcSkgKyAoMC4wODMzICogdGhpcy5oZWlnaHQgKiB0aGlzLmhlaWdodCkpICogbWFzcztcbiAgICAgIHZhciBpbmVydGlhWSA9IDAuNSAqIHJzcTtcbiAgICAgIG91dC5tYXNzID0gbWFzcztcbiAgICAgIG91dC5pbmVydGlhLnNldChpbmVydGlhWFosIDAsIDAsIDAsIGluZXJ0aWFZLCAwLCAwLCAwLCBpbmVydGlhWFopO1xuXG4gICAgfSxcblxuICAgIHVwZGF0ZVByb3h5OiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHZhciB0ZSA9IHRoaXMucm90YXRpb24uZWxlbWVudHM7XG4gICAgICB2YXIgbGVuLCB3eCwgaHksIGR6LCB4eCwgeXksIHp6LCB3LCBoLCBkLCBwO1xuXG4gICAgICB4eCA9IHRlWzFdICogdGVbMV07XG4gICAgICB5eSA9IHRlWzRdICogdGVbNF07XG4gICAgICB6eiA9IHRlWzddICogdGVbN107XG5cbiAgICAgIHRoaXMubm9ybWFsRGlyZWN0aW9uLnNldCh0ZVsxXSwgdGVbNF0sIHRlWzddKTtcbiAgICAgIHRoaXMuaGFsZkRpcmVjdGlvbi5zY2FsZSh0aGlzLm5vcm1hbERpcmVjdGlvbiwgdGhpcy5oYWxmSGVpZ2h0KTtcblxuICAgICAgd3ggPSAxIC0geHg7XG4gICAgICBsZW4gPSBfTWF0aC5zcXJ0KHd4ICogd3ggKyB4eCAqIHl5ICsgeHggKiB6eik7XG4gICAgICBpZiAobGVuID4gMCkgbGVuID0gdGhpcy5yYWRpdXMgLyBsZW47XG4gICAgICB3eCAqPSBsZW47XG4gICAgICBoeSA9IDEgLSB5eTtcbiAgICAgIGxlbiA9IF9NYXRoLnNxcnQoeXkgKiB4eCArIGh5ICogaHkgKyB5eSAqIHp6KTtcbiAgICAgIGlmIChsZW4gPiAwKSBsZW4gPSB0aGlzLnJhZGl1cyAvIGxlbjtcbiAgICAgIGh5ICo9IGxlbjtcbiAgICAgIGR6ID0gMSAtIHp6O1xuICAgICAgbGVuID0gX01hdGguc3FydCh6eiAqIHh4ICsgenogKiB5eSArIGR6ICogZHopO1xuICAgICAgaWYgKGxlbiA+IDApIGxlbiA9IHRoaXMucmFkaXVzIC8gbGVuO1xuICAgICAgZHogKj0gbGVuO1xuXG4gICAgICB3ID0gdGhpcy5oYWxmRGlyZWN0aW9uLnggPCAwID8gLXRoaXMuaGFsZkRpcmVjdGlvbi54IDogdGhpcy5oYWxmRGlyZWN0aW9uLng7XG4gICAgICBoID0gdGhpcy5oYWxmRGlyZWN0aW9uLnkgPCAwID8gLXRoaXMuaGFsZkRpcmVjdGlvbi55IDogdGhpcy5oYWxmRGlyZWN0aW9uLnk7XG4gICAgICBkID0gdGhpcy5oYWxmRGlyZWN0aW9uLnogPCAwID8gLXRoaXMuaGFsZkRpcmVjdGlvbi56IDogdGhpcy5oYWxmRGlyZWN0aW9uLno7XG5cbiAgICAgIHcgPSB3eCA8IDAgPyB3IC0gd3ggOiB3ICsgd3g7XG4gICAgICBoID0gaHkgPCAwID8gaCAtIGh5IDogaCArIGh5O1xuICAgICAgZCA9IGR6IDwgMCA/IGQgLSBkeiA6IGQgKyBkejtcblxuICAgICAgcCA9IEFBQkJfUFJPWDtcblxuICAgICAgdGhpcy5hYWJiLnNldChcbiAgICAgICAgdGhpcy5wb3NpdGlvbi54IC0gdyAtIHAsIHRoaXMucG9zaXRpb24ueCArIHcgKyBwLFxuICAgICAgICB0aGlzLnBvc2l0aW9uLnkgLSBoIC0gcCwgdGhpcy5wb3NpdGlvbi55ICsgaCArIHAsXG4gICAgICAgIHRoaXMucG9zaXRpb24ueiAtIGQgLSBwLCB0aGlzLnBvc2l0aW9uLnogKyBkICsgcFxuICAgICAgKTtcblxuICAgICAgaWYgKHRoaXMucHJveHkgIT0gbnVsbCkgdGhpcy5wcm94eS51cGRhdGUoKTtcblxuICAgIH1cblxuICB9KTtcblxuICAvKipcbiAgICogUGxhbmUgc2hhcGUuXG4gICAqIEBhdXRob3IgbG8tdGhcbiAgICovXG5cbiAgZnVuY3Rpb24gUGxhbmUoY29uZmlnLCBub3JtYWwpIHtcblxuICAgIFNoYXBlLmNhbGwodGhpcywgY29uZmlnKTtcblxuICAgIHRoaXMudHlwZSA9IFNIQVBFX1BMQU5FO1xuXG4gICAgLy8gcmFkaXVzIG9mIHRoZSBzaGFwZS5cbiAgICB0aGlzLm5vcm1hbCA9IG5ldyBWZWMzKDAsIDEsIDApO1xuXG4gIH1cbiAgUGxhbmUucHJvdG90eXBlID0gT2JqZWN0LmFzc2lnbihPYmplY3QuY3JlYXRlKFNoYXBlLnByb3RvdHlwZSksIHtcblxuICAgIGNvbnN0cnVjdG9yOiBQbGFuZSxcblxuICAgIHZvbHVtZTogZnVuY3Rpb24gKCkge1xuXG4gICAgICByZXR1cm4gTnVtYmVyLk1BWF9WQUxVRTtcblxuICAgIH0sXG5cbiAgICBjYWxjdWxhdGVNYXNzSW5mbzogZnVuY3Rpb24gKG91dCkge1xuXG4gICAgICBvdXQubWFzcyA9IHRoaXMuZGVuc2l0eTsvLzAuMDAwMTtcbiAgICAgIHZhciBpbmVydGlhID0gMTtcbiAgICAgIG91dC5pbmVydGlhLnNldChpbmVydGlhLCAwLCAwLCAwLCBpbmVydGlhLCAwLCAwLCAwLCBpbmVydGlhKTtcblxuICAgIH0sXG5cbiAgICB1cGRhdGVQcm94eTogZnVuY3Rpb24gKCkge1xuXG4gICAgICB2YXIgcCA9IEFBQkJfUFJPWDtcblxuICAgICAgdmFyIG1pbiA9IC1fTWF0aC5JTkY7XG4gICAgICB2YXIgbWF4ID0gX01hdGguSU5GO1xuICAgICAgdmFyIG4gPSB0aGlzLm5vcm1hbDtcbiAgICAgIC8vIFRoZSBwbGFuZSBBQUJCIGlzIGluZmluaXRlLCBleGNlcHQgaWYgdGhlIG5vcm1hbCBpcyBwb2ludGluZyBhbG9uZyBhbnkgYXhpc1xuICAgICAgdGhpcy5hYWJiLnNldChcbiAgICAgICAgbi54ID09PSAtMSA/IHRoaXMucG9zaXRpb24ueCAtIHAgOiBtaW4sIG4ueCA9PT0gMSA/IHRoaXMucG9zaXRpb24ueCArIHAgOiBtYXgsXG4gICAgICAgIG4ueSA9PT0gLTEgPyB0aGlzLnBvc2l0aW9uLnkgLSBwIDogbWluLCBuLnkgPT09IDEgPyB0aGlzLnBvc2l0aW9uLnkgKyBwIDogbWF4LFxuICAgICAgICBuLnogPT09IC0xID8gdGhpcy5wb3NpdGlvbi56IC0gcCA6IG1pbiwgbi56ID09PSAxID8gdGhpcy5wb3NpdGlvbi56ICsgcCA6IG1heFxuICAgICAgKTtcblxuICAgICAgaWYgKHRoaXMucHJveHkgIT0gbnVsbCkgdGhpcy5wcm94eS51cGRhdGUoKTtcblxuICAgIH1cblxuICB9KTtcblxuICAvKipcbiAgICogQSBQYXJ0aWN1bGUgc2hhcGVcbiAgICogQGF1dGhvciBsby10aFxuICAgKi9cblxuICBmdW5jdGlvbiBQYXJ0aWNsZShjb25maWcsIG5vcm1hbCkge1xuXG4gICAgU2hhcGUuY2FsbCh0aGlzLCBjb25maWcpO1xuXG4gICAgdGhpcy50eXBlID0gU0hBUEVfUEFSVElDTEU7XG5cbiAgfVxuICBQYXJ0aWNsZS5wcm90b3R5cGUgPSBPYmplY3QuYXNzaWduKE9iamVjdC5jcmVhdGUoU2hhcGUucHJvdG90eXBlKSwge1xuXG4gICAgY29uc3RydWN0b3I6IFBhcnRpY2xlLFxuXG4gICAgdm9sdW1lOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHJldHVybiBOdW1iZXIuTUFYX1ZBTFVFO1xuXG4gICAgfSxcblxuICAgIGNhbGN1bGF0ZU1hc3NJbmZvOiBmdW5jdGlvbiAob3V0KSB7XG5cbiAgICAgIHZhciBpbmVydGlhID0gMDtcbiAgICAgIG91dC5pbmVydGlhLnNldChpbmVydGlhLCAwLCAwLCAwLCBpbmVydGlhLCAwLCAwLCAwLCBpbmVydGlhKTtcblxuICAgIH0sXG5cbiAgICB1cGRhdGVQcm94eTogZnVuY3Rpb24gKCkge1xuXG4gICAgICB2YXIgcCA9IDA7Ly9BQUJCX1BST1g7XG5cbiAgICAgIHRoaXMuYWFiYi5zZXQoXG4gICAgICAgIHRoaXMucG9zaXRpb24ueCAtIHAsIHRoaXMucG9zaXRpb24ueCArIHAsXG4gICAgICAgIHRoaXMucG9zaXRpb24ueSAtIHAsIHRoaXMucG9zaXRpb24ueSArIHAsXG4gICAgICAgIHRoaXMucG9zaXRpb24ueiAtIHAsIHRoaXMucG9zaXRpb24ueiArIHBcbiAgICAgICk7XG5cbiAgICAgIGlmICh0aGlzLnByb3h5ICE9IG51bGwpIHRoaXMucHJveHkudXBkYXRlKCk7XG5cbiAgICB9XG5cbiAgfSk7XG5cbiAgLyoqXG4gICAqIEEgc2hhcGUgY29uZmlndXJhdGlvbiBob2xkcyBjb21tb24gY29uZmlndXJhdGlvbiBkYXRhIGZvciBjb25zdHJ1Y3RpbmcgYSBzaGFwZS5cbiAgICogVGhlc2UgY29uZmlndXJhdGlvbnMgY2FuIGJlIHJldXNlZCBzYWZlbHkuXG4gICAqXG4gICAqIEBhdXRob3Igc2FoYXJhblxuICAgKiBAYXV0aG9yIGxvLXRoXG4gICAqL1xuXG4gIGZ1bmN0aW9uIFNoYXBlQ29uZmlnKCkge1xuXG4gICAgLy8gcG9zaXRpb24gb2YgdGhlIHNoYXBlIGluIHBhcmVudCdzIGNvb3JkaW5hdGUgc3lzdGVtLlxuICAgIHRoaXMucmVsYXRpdmVQb3NpdGlvbiA9IG5ldyBWZWMzKCk7XG4gICAgLy8gcm90YXRpb24gbWF0cml4IG9mIHRoZSBzaGFwZSBpbiBwYXJlbnQncyBjb29yZGluYXRlIHN5c3RlbS5cbiAgICB0aGlzLnJlbGF0aXZlUm90YXRpb24gPSBuZXcgTWF0MzMoKTtcbiAgICAvLyBjb2VmZmljaWVudCBvZiBmcmljdGlvbiBvZiB0aGUgc2hhcGUuXG4gICAgdGhpcy5mcmljdGlvbiA9IDAuMjsgLy8gMC40XG4gICAgLy8gY29lZmZpY2llbnQgb2YgcmVzdGl0dXRpb24gb2YgdGhlIHNoYXBlLlxuICAgIHRoaXMucmVzdGl0dXRpb24gPSAwLjI7XG4gICAgLy8gZGVuc2l0eSBvZiB0aGUgc2hhcGUuXG4gICAgdGhpcy5kZW5zaXR5ID0gMTtcbiAgICAvLyBiaXRzIG9mIHRoZSBjb2xsaXNpb24gZ3JvdXBzIHRvIHdoaWNoIHRoZSBzaGFwZSBiZWxvbmdzLlxuICAgIHRoaXMuYmVsb25nc1RvID0gMTtcbiAgICAvLyBiaXRzIG9mIHRoZSBjb2xsaXNpb24gZ3JvdXBzIHdpdGggd2hpY2ggdGhlIHNoYXBlIGNvbGxpZGVzLlxuICAgIHRoaXMuY29sbGlkZXNXaXRoID0gMHhmZmZmZmZmZjtcblxuICB9XG5cbiAgLyoqXG4gICogQW4gaW5mb3JtYXRpb24gb2YgbGltaXQgYW5kIG1vdG9yLlxuICAqXG4gICogQGF1dGhvciBzYWhhcmFuXG4gICovXG5cbiAgZnVuY3Rpb24gTGltaXRNb3RvcihheGlzLCBmaXhlZCkge1xuXG4gICAgZml4ZWQgPSBmaXhlZCB8fCBmYWxzZTtcbiAgICAvLyBUaGUgYXhpcyBvZiB0aGUgY29uc3RyYWludC5cbiAgICB0aGlzLmF4aXMgPSBheGlzO1xuICAgIC8vIFRoZSBjdXJyZW50IGFuZ2xlIGZvciByb3RhdGlvbmFsIGNvbnN0cmFpbnRzLlxuICAgIHRoaXMuYW5nbGUgPSAwO1xuICAgIC8vIFRoZSBsb3dlciBsaW1pdC4gU2V0IGxvd2VyID4gdXBwZXIgdG8gZGlzYWJsZVxuICAgIHRoaXMubG93ZXJMaW1pdCA9IGZpeGVkID8gMCA6IDE7XG5cbiAgICAvLyAgVGhlIHVwcGVyIGxpbWl0LiBTZXQgbG93ZXIgPiB1cHBlciB0byBkaXNhYmxlLlxuICAgIHRoaXMudXBwZXJMaW1pdCA9IDA7XG4gICAgLy8gVGhlIHRhcmdldCBtb3RvciBzcGVlZC5cbiAgICB0aGlzLm1vdG9yU3BlZWQgPSAwO1xuICAgIC8vIFRoZSBtYXhpbXVtIG1vdG9yIGZvcmNlIG9yIHRvcnF1ZS4gU2V0IDAgdG8gZGlzYWJsZS5cbiAgICB0aGlzLm1heE1vdG9yRm9yY2UgPSAwO1xuICAgIC8vIFRoZSBmcmVxdWVuY3kgb2YgdGhlIHNwcmluZy4gU2V0IDAgdG8gZGlzYWJsZS5cbiAgICB0aGlzLmZyZXF1ZW5jeSA9IDA7XG4gICAgLy8gVGhlIGRhbXBpbmcgcmF0aW8gb2YgdGhlIHNwcmluZy4gU2V0IDAgZm9yIG5vIGRhbXBpbmcsIDEgZm9yIGNyaXRpY2FsIGRhbXBpbmcuXG4gICAgdGhpcy5kYW1waW5nUmF0aW8gPSAwO1xuXG4gIH1cbiAgT2JqZWN0LmFzc2lnbihMaW1pdE1vdG9yLnByb3RvdHlwZSwge1xuXG4gICAgTGltaXRNb3RvcjogdHJ1ZSxcblxuICAgIC8vIFNldCBsaW1pdCBkYXRhIGludG8gdGhpcyBjb25zdHJhaW50LlxuICAgIHNldExpbWl0OiBmdW5jdGlvbiAobG93ZXJMaW1pdCwgdXBwZXJMaW1pdCkge1xuXG4gICAgICB0aGlzLmxvd2VyTGltaXQgPSBsb3dlckxpbWl0O1xuICAgICAgdGhpcy51cHBlckxpbWl0ID0gdXBwZXJMaW1pdDtcblxuICAgIH0sXG5cbiAgICAvLyBTZXQgbW90b3IgZGF0YSBpbnRvIHRoaXMgY29uc3RyYWludC5cbiAgICBzZXRNb3RvcjogZnVuY3Rpb24gKG1vdG9yU3BlZWQsIG1heE1vdG9yRm9yY2UpIHtcblxuICAgICAgdGhpcy5tb3RvclNwZWVkID0gbW90b3JTcGVlZDtcbiAgICAgIHRoaXMubWF4TW90b3JGb3JjZSA9IG1heE1vdG9yRm9yY2U7XG5cbiAgICB9LFxuXG4gICAgLy8gU2V0IHNwcmluZyBkYXRhIGludG8gdGhpcyBjb25zdHJhaW50LlxuICAgIHNldFNwcmluZzogZnVuY3Rpb24gKGZyZXF1ZW5jeSwgZGFtcGluZ1JhdGlvKSB7XG5cbiAgICAgIHRoaXMuZnJlcXVlbmN5ID0gZnJlcXVlbmN5O1xuICAgICAgdGhpcy5kYW1waW5nUmF0aW8gPSBkYW1waW5nUmF0aW87XG5cbiAgICB9XG5cbiAgfSk7XG5cbiAgLyoqXG4gICAqIFRoZSBiYXNlIGNsYXNzIG9mIGFsbCB0eXBlIG9mIHRoZSBjb25zdHJhaW50cy5cbiAgICpcbiAgICogQGF1dGhvciBzYWhhcmFuXG4gICAqIEBhdXRob3IgbG8tdGhcbiAgICovXG5cbiAgZnVuY3Rpb24gQ29uc3RyYWludCgpIHtcblxuICAgIC8vIHBhcmVudCB3b3JsZCBvZiB0aGUgY29uc3RyYWludC5cbiAgICB0aGlzLnBhcmVudCA9IG51bGw7XG5cbiAgICAvLyBmaXJzdCBib2R5IG9mIHRoZSBjb25zdHJhaW50LlxuICAgIHRoaXMuYm9keTEgPSBudWxsO1xuXG4gICAgLy8gc2Vjb25kIGJvZHkgb2YgdGhlIGNvbnN0cmFpbnQuXG4gICAgdGhpcy5ib2R5MiA9IG51bGw7XG5cbiAgICAvLyBJbnRlcm5hbFxuICAgIHRoaXMuYWRkZWRUb0lzbGFuZCA9IGZhbHNlO1xuXG4gIH1cblxuICBPYmplY3QuYXNzaWduKENvbnN0cmFpbnQucHJvdG90eXBlLCB7XG5cbiAgICBDb25zdHJhaW50OiB0cnVlLFxuXG4gICAgLy8gUHJlcGFyZSBmb3Igc29sdmluZyB0aGUgY29uc3RyYWludFxuICAgIHByZVNvbHZlOiBmdW5jdGlvbiAodGltZVN0ZXAsIGludlRpbWVTdGVwKSB7XG5cbiAgICAgIHByaW50RXJyb3IoXCJDb25zdHJhaW50XCIsIFwiSW5oZXJpdGFuY2UgZXJyb3IuXCIpO1xuXG4gICAgfSxcblxuICAgIC8vIFNvbHZlIHRoZSBjb25zdHJhaW50LiBUaGlzIGlzIHVzdWFsbHkgY2FsbGVkIGl0ZXJhdGl2ZWx5LlxuICAgIHNvbHZlOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHByaW50RXJyb3IoXCJDb25zdHJhaW50XCIsIFwiSW5oZXJpdGFuY2UgZXJyb3IuXCIpO1xuXG4gICAgfSxcblxuICAgIC8vIERvIHRoZSBwb3N0LXByb2Nlc3NpbmcuXG4gICAgcG9zdFNvbHZlOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHByaW50RXJyb3IoXCJDb25zdHJhaW50XCIsIFwiSW5oZXJpdGFuY2UgZXJyb3IuXCIpO1xuXG4gICAgfVxuXG4gIH0pO1xuXG4gIGZ1bmN0aW9uIEpvaW50TGluayhqb2ludCkge1xuXG4gICAgLy8gVGhlIHByZXZpb3VzIGpvaW50IGxpbmsuXG4gICAgdGhpcy5wcmV2ID0gbnVsbDtcbiAgICAvLyBUaGUgbmV4dCBqb2ludCBsaW5rLlxuICAgIHRoaXMubmV4dCA9IG51bGw7XG4gICAgLy8gVGhlIG90aGVyIHJpZ2lkIGJvZHkgY29ubmVjdGVkIHRvIHRoZSBqb2ludC5cbiAgICB0aGlzLmJvZHkgPSBudWxsO1xuICAgIC8vIFRoZSBqb2ludCBvZiB0aGUgbGluay5cbiAgICB0aGlzLmpvaW50ID0gam9pbnQ7XG5cbiAgfVxuXG4gIC8qKlxuICAgKiBKb2ludHMgYXJlIHVzZWQgdG8gY29uc3RyYWluIHRoZSBtb3Rpb24gYmV0d2VlbiB0d28gcmlnaWQgYm9kaWVzLlxuICAgKlxuICAgKiBAYXV0aG9yIHNhaGFyYW5cbiAgICogQGF1dGhvciBsby10aFxuICAgKi9cblxuICBmdW5jdGlvbiBKb2ludChjb25maWcpIHtcblxuICAgIENvbnN0cmFpbnQuY2FsbCh0aGlzKTtcblxuICAgIHRoaXMuc2NhbGUgPSAxO1xuICAgIHRoaXMuaW52U2NhbGUgPSAxO1xuXG4gICAgLy8gam9pbnQgbmFtZVxuICAgIHRoaXMubmFtZSA9IFwiXCI7XG4gICAgdGhpcy5pZCA9IE5hTjtcblxuICAgIC8vIFRoZSB0eXBlIG9mIHRoZSBqb2ludC5cbiAgICB0aGlzLnR5cGUgPSBKT0lOVF9OVUxMO1xuICAgIC8vICBUaGUgcHJldmlvdXMgam9pbnQgaW4gdGhlIHdvcmxkLlxuICAgIHRoaXMucHJldiA9IG51bGw7XG4gICAgLy8gVGhlIG5leHQgam9pbnQgaW4gdGhlIHdvcmxkLlxuICAgIHRoaXMubmV4dCA9IG51bGw7XG5cbiAgICB0aGlzLmJvZHkxID0gY29uZmlnLmJvZHkxO1xuICAgIHRoaXMuYm9keTIgPSBjb25maWcuYm9keTI7XG5cbiAgICAvLyBhbmNob3IgcG9pbnQgb24gdGhlIGZpcnN0IHJpZ2lkIGJvZHkgaW4gbG9jYWwgY29vcmRpbmF0ZSBzeXN0ZW0uXG4gICAgdGhpcy5sb2NhbEFuY2hvclBvaW50MSA9IG5ldyBWZWMzKCkuY29weShjb25maWcubG9jYWxBbmNob3JQb2ludDEpO1xuICAgIC8vIGFuY2hvciBwb2ludCBvbiB0aGUgc2Vjb25kIHJpZ2lkIGJvZHkgaW4gbG9jYWwgY29vcmRpbmF0ZSBzeXN0ZW0uXG4gICAgdGhpcy5sb2NhbEFuY2hvclBvaW50MiA9IG5ldyBWZWMzKCkuY29weShjb25maWcubG9jYWxBbmNob3JQb2ludDIpO1xuICAgIC8vIGFuY2hvciBwb2ludCBvbiB0aGUgZmlyc3QgcmlnaWQgYm9keSBpbiB3b3JsZCBjb29yZGluYXRlIHN5c3RlbSByZWxhdGl2ZSB0byB0aGUgYm9keSdzIG9yaWdpbi5cbiAgICB0aGlzLnJlbGF0aXZlQW5jaG9yUG9pbnQxID0gbmV3IFZlYzMoKTtcbiAgICAvLyBhbmNob3IgcG9pbnQgb24gdGhlIHNlY29uZCByaWdpZCBib2R5IGluIHdvcmxkIGNvb3JkaW5hdGUgc3lzdGVtIHJlbGF0aXZlIHRvIHRoZSBib2R5J3Mgb3JpZ2luLlxuICAgIHRoaXMucmVsYXRpdmVBbmNob3JQb2ludDIgPSBuZXcgVmVjMygpO1xuICAgIC8vICBhbmNob3IgcG9pbnQgb24gdGhlIGZpcnN0IHJpZ2lkIGJvZHkgaW4gd29ybGQgY29vcmRpbmF0ZSBzeXN0ZW0uXG4gICAgdGhpcy5hbmNob3JQb2ludDEgPSBuZXcgVmVjMygpO1xuICAgIC8vIGFuY2hvciBwb2ludCBvbiB0aGUgc2Vjb25kIHJpZ2lkIGJvZHkgaW4gd29ybGQgY29vcmRpbmF0ZSBzeXN0ZW0uXG4gICAgdGhpcy5hbmNob3JQb2ludDIgPSBuZXcgVmVjMygpO1xuICAgIC8vIFdoZXRoZXIgYWxsb3cgY29sbGlzaW9uIGJldHdlZW4gY29ubmVjdGVkIHJpZ2lkIGJvZGllcyBvciBub3QuXG4gICAgdGhpcy5hbGxvd0NvbGxpc2lvbiA9IGNvbmZpZy5hbGxvd0NvbGxpc2lvbjtcblxuICAgIHRoaXMuYjFMaW5rID0gbmV3IEpvaW50TGluayh0aGlzKTtcbiAgICB0aGlzLmIyTGluayA9IG5ldyBKb2ludExpbmsodGhpcyk7XG5cbiAgfVxuICBKb2ludC5wcm90b3R5cGUgPSBPYmplY3QuYXNzaWduKE9iamVjdC5jcmVhdGUoQ29uc3RyYWludC5wcm90b3R5cGUpLCB7XG5cbiAgICBjb25zdHJ1Y3RvcjogSm9pbnQsXG5cbiAgICBzZXRJZDogZnVuY3Rpb24gKG4pIHtcblxuICAgICAgdGhpcy5pZCA9IGk7XG5cbiAgICB9LFxuXG4gICAgc2V0UGFyZW50OiBmdW5jdGlvbiAod29ybGQpIHtcblxuICAgICAgdGhpcy5wYXJlbnQgPSB3b3JsZDtcbiAgICAgIHRoaXMuc2NhbGUgPSB0aGlzLnBhcmVudC5zY2FsZTtcbiAgICAgIHRoaXMuaW52U2NhbGUgPSB0aGlzLnBhcmVudC5pbnZTY2FsZTtcbiAgICAgIHRoaXMuaWQgPSB0aGlzLnBhcmVudC5udW1Kb2ludHM7XG4gICAgICBpZiAoIXRoaXMubmFtZSkgdGhpcy5uYW1lID0gJ0onICsgdGhpcy5pZDtcblxuICAgIH0sXG5cbiAgICAvLyBVcGRhdGUgYWxsIHRoZSBhbmNob3IgcG9pbnRzLlxuXG4gICAgdXBkYXRlQW5jaG9yUG9pbnRzOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHRoaXMucmVsYXRpdmVBbmNob3JQb2ludDEuY29weSh0aGlzLmxvY2FsQW5jaG9yUG9pbnQxKS5hcHBseU1hdHJpeDModGhpcy5ib2R5MS5yb3RhdGlvbiwgdHJ1ZSk7XG4gICAgICB0aGlzLnJlbGF0aXZlQW5jaG9yUG9pbnQyLmNvcHkodGhpcy5sb2NhbEFuY2hvclBvaW50MikuYXBwbHlNYXRyaXgzKHRoaXMuYm9keTIucm90YXRpb24sIHRydWUpO1xuXG4gICAgICB0aGlzLmFuY2hvclBvaW50MS5hZGQodGhpcy5yZWxhdGl2ZUFuY2hvclBvaW50MSwgdGhpcy5ib2R5MS5wb3NpdGlvbik7XG4gICAgICB0aGlzLmFuY2hvclBvaW50Mi5hZGQodGhpcy5yZWxhdGl2ZUFuY2hvclBvaW50MiwgdGhpcy5ib2R5Mi5wb3NpdGlvbik7XG5cbiAgICB9LFxuXG4gICAgLy8gQXR0YWNoIHRoZSBqb2ludCBmcm9tIHRoZSBib2RpZXMuXG5cbiAgICBhdHRhY2g6IGZ1bmN0aW9uIChpc1gpIHtcblxuICAgICAgdGhpcy5iMUxpbmsuYm9keSA9IHRoaXMuYm9keTI7XG4gICAgICB0aGlzLmIyTGluay5ib2R5ID0gdGhpcy5ib2R5MTtcblxuICAgICAgaWYgKGlzWCkge1xuXG4gICAgICAgIHRoaXMuYm9keTEuam9pbnRMaW5rLnB1c2godGhpcy5iMUxpbmspO1xuICAgICAgICB0aGlzLmJvZHkyLmpvaW50TGluay5wdXNoKHRoaXMuYjJMaW5rKTtcbiAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgaWYgKHRoaXMuYm9keTEuam9pbnRMaW5rICE9IG51bGwpICh0aGlzLmIxTGluay5uZXh0ID0gdGhpcy5ib2R5MS5qb2ludExpbmspLnByZXYgPSB0aGlzLmIxTGluaztcbiAgICAgICAgZWxzZSB0aGlzLmIxTGluay5uZXh0ID0gbnVsbDtcbiAgICAgICAgdGhpcy5ib2R5MS5qb2ludExpbmsgPSB0aGlzLmIxTGluaztcbiAgICAgICAgdGhpcy5ib2R5MS5udW1Kb2ludHMrKztcbiAgICAgICAgaWYgKHRoaXMuYm9keTIuam9pbnRMaW5rICE9IG51bGwpICh0aGlzLmIyTGluay5uZXh0ID0gdGhpcy5ib2R5Mi5qb2ludExpbmspLnByZXYgPSB0aGlzLmIyTGluaztcbiAgICAgICAgZWxzZSB0aGlzLmIyTGluay5uZXh0ID0gbnVsbDtcbiAgICAgICAgdGhpcy5ib2R5Mi5qb2ludExpbmsgPSB0aGlzLmIyTGluaztcbiAgICAgICAgdGhpcy5ib2R5Mi5udW1Kb2ludHMrKztcblxuICAgICAgfVxuXG4gICAgfSxcblxuICAgIC8vIERldGFjaCB0aGUgam9pbnQgZnJvbSB0aGUgYm9kaWVzLlxuXG4gICAgZGV0YWNoOiBmdW5jdGlvbiAoaXNYKSB7XG5cbiAgICAgIGlmIChpc1gpIHtcblxuICAgICAgICB0aGlzLmJvZHkxLmpvaW50TGluay5zcGxpY2UodGhpcy5ib2R5MS5qb2ludExpbmsuaW5kZXhPZih0aGlzLmIxTGluayksIDEpO1xuICAgICAgICB0aGlzLmJvZHkyLmpvaW50TGluay5zcGxpY2UodGhpcy5ib2R5Mi5qb2ludExpbmsuaW5kZXhPZih0aGlzLmIyTGluayksIDEpO1xuXG4gICAgICB9IGVsc2Uge1xuXG4gICAgICAgIHZhciBwcmV2ID0gdGhpcy5iMUxpbmsucHJldjtcbiAgICAgICAgdmFyIG5leHQgPSB0aGlzLmIxTGluay5uZXh0O1xuICAgICAgICBpZiAocHJldiAhPSBudWxsKSBwcmV2Lm5leHQgPSBuZXh0O1xuICAgICAgICBpZiAobmV4dCAhPSBudWxsKSBuZXh0LnByZXYgPSBwcmV2O1xuICAgICAgICBpZiAodGhpcy5ib2R5MS5qb2ludExpbmsgPT0gdGhpcy5iMUxpbmspIHRoaXMuYm9keTEuam9pbnRMaW5rID0gbmV4dDtcbiAgICAgICAgdGhpcy5iMUxpbmsucHJldiA9IG51bGw7XG4gICAgICAgIHRoaXMuYjFMaW5rLm5leHQgPSBudWxsO1xuICAgICAgICB0aGlzLmIxTGluay5ib2R5ID0gbnVsbDtcbiAgICAgICAgdGhpcy5ib2R5MS5udW1Kb2ludHMtLTtcblxuICAgICAgICBwcmV2ID0gdGhpcy5iMkxpbmsucHJldjtcbiAgICAgICAgbmV4dCA9IHRoaXMuYjJMaW5rLm5leHQ7XG4gICAgICAgIGlmIChwcmV2ICE9IG51bGwpIHByZXYubmV4dCA9IG5leHQ7XG4gICAgICAgIGlmIChuZXh0ICE9IG51bGwpIG5leHQucHJldiA9IHByZXY7XG4gICAgICAgIGlmICh0aGlzLmJvZHkyLmpvaW50TGluayA9PSB0aGlzLmIyTGluaykgdGhpcy5ib2R5Mi5qb2ludExpbmsgPSBuZXh0O1xuICAgICAgICB0aGlzLmIyTGluay5wcmV2ID0gbnVsbDtcbiAgICAgICAgdGhpcy5iMkxpbmsubmV4dCA9IG51bGw7XG4gICAgICAgIHRoaXMuYjJMaW5rLmJvZHkgPSBudWxsO1xuICAgICAgICB0aGlzLmJvZHkyLm51bUpvaW50cy0tO1xuXG4gICAgICB9XG5cbiAgICAgIHRoaXMuYjFMaW5rLmJvZHkgPSBudWxsO1xuICAgICAgdGhpcy5iMkxpbmsuYm9keSA9IG51bGw7XG5cbiAgICB9LFxuXG5cbiAgICAvLyBBd2FrZSB0aGUgYm9kaWVzLlxuXG4gICAgYXdha2U6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgdGhpcy5ib2R5MS5hd2FrZSgpO1xuICAgICAgdGhpcy5ib2R5Mi5hd2FrZSgpO1xuXG4gICAgfSxcblxuICAgIC8vIGNhbGN1bGF0aW9uIGZ1bmN0aW9uXG5cbiAgICBwcmVTb2x2ZTogZnVuY3Rpb24gKHRpbWVTdGVwLCBpbnZUaW1lU3RlcCkge1xuXG4gICAgfSxcblxuICAgIHNvbHZlOiBmdW5jdGlvbiAoKSB7XG5cbiAgICB9LFxuXG4gICAgcG9zdFNvbHZlOiBmdW5jdGlvbiAoKSB7XG5cbiAgICB9LFxuXG4gICAgLy8gRGVsZXRlIHByb2Nlc3NcblxuICAgIHJlbW92ZTogZnVuY3Rpb24gKCkge1xuXG4gICAgICB0aGlzLmRpc3Bvc2UoKTtcblxuICAgIH0sXG5cbiAgICBkaXNwb3NlOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHRoaXMucGFyZW50LnJlbW92ZUpvaW50KHRoaXMpO1xuXG4gICAgfSxcblxuXG4gICAgLy8gVGhyZWUganMgYWRkXG5cbiAgICBnZXRQb3NpdGlvbjogZnVuY3Rpb24gKCkge1xuXG4gICAgICB2YXIgcDEgPSBuZXcgVmVjMygpLnNjYWxlKHRoaXMuYW5jaG9yUG9pbnQxLCB0aGlzLnNjYWxlKTtcbiAgICAgIHZhciBwMiA9IG5ldyBWZWMzKCkuc2NhbGUodGhpcy5hbmNob3JQb2ludDIsIHRoaXMuc2NhbGUpO1xuICAgICAgcmV0dXJuIFtwMSwgcDJdO1xuXG4gICAgfVxuXG4gIH0pO1xuXG4gIC8qKlxuICAqIEEgbGluZWFyIGNvbnN0cmFpbnQgZm9yIGFsbCBheGVzIGZvciB2YXJpb3VzIGpvaW50cy5cbiAgKiBAYXV0aG9yIHNhaGFyYW5cbiAgKi9cbiAgZnVuY3Rpb24gTGluZWFyQ29uc3RyYWludChqb2ludCkge1xuXG4gICAgdGhpcy5tMSA9IE5hTjtcbiAgICB0aGlzLm0yID0gTmFOO1xuXG4gICAgdGhpcy5paTEgPSBudWxsO1xuICAgIHRoaXMuaWkyID0gbnVsbDtcbiAgICB0aGlzLmRkID0gbnVsbDtcblxuICAgIHRoaXMucjF4ID0gTmFOO1xuICAgIHRoaXMucjF5ID0gTmFOO1xuICAgIHRoaXMucjF6ID0gTmFOO1xuXG4gICAgdGhpcy5yMnggPSBOYU47XG4gICAgdGhpcy5yMnkgPSBOYU47XG4gICAgdGhpcy5yMnogPSBOYU47XG5cbiAgICB0aGlzLmF4MXggPSBOYU47XG4gICAgdGhpcy5heDF5ID0gTmFOO1xuICAgIHRoaXMuYXgxeiA9IE5hTjtcbiAgICB0aGlzLmF5MXggPSBOYU47XG4gICAgdGhpcy5heTF5ID0gTmFOO1xuICAgIHRoaXMuYXkxeiA9IE5hTjtcbiAgICB0aGlzLmF6MXggPSBOYU47XG4gICAgdGhpcy5hejF5ID0gTmFOO1xuICAgIHRoaXMuYXoxeiA9IE5hTjtcblxuICAgIHRoaXMuYXgyeCA9IE5hTjtcbiAgICB0aGlzLmF4MnkgPSBOYU47XG4gICAgdGhpcy5heDJ6ID0gTmFOO1xuICAgIHRoaXMuYXkyeCA9IE5hTjtcbiAgICB0aGlzLmF5MnkgPSBOYU47XG4gICAgdGhpcy5heTJ6ID0gTmFOO1xuICAgIHRoaXMuYXoyeCA9IE5hTjtcbiAgICB0aGlzLmF6MnkgPSBOYU47XG4gICAgdGhpcy5hejJ6ID0gTmFOO1xuXG4gICAgdGhpcy52ZWwgPSBOYU47XG4gICAgdGhpcy52ZWx4ID0gTmFOO1xuICAgIHRoaXMudmVseSA9IE5hTjtcbiAgICB0aGlzLnZlbHogPSBOYU47XG5cblxuICAgIHRoaXMuam9pbnQgPSBqb2ludDtcbiAgICB0aGlzLnIxID0gam9pbnQucmVsYXRpdmVBbmNob3JQb2ludDE7XG4gICAgdGhpcy5yMiA9IGpvaW50LnJlbGF0aXZlQW5jaG9yUG9pbnQyO1xuICAgIHRoaXMucDEgPSBqb2ludC5hbmNob3JQb2ludDE7XG4gICAgdGhpcy5wMiA9IGpvaW50LmFuY2hvclBvaW50MjtcbiAgICB0aGlzLmIxID0gam9pbnQuYm9keTE7XG4gICAgdGhpcy5iMiA9IGpvaW50LmJvZHkyO1xuICAgIHRoaXMubDEgPSB0aGlzLmIxLmxpbmVhclZlbG9jaXR5O1xuICAgIHRoaXMubDIgPSB0aGlzLmIyLmxpbmVhclZlbG9jaXR5O1xuICAgIHRoaXMuYTEgPSB0aGlzLmIxLmFuZ3VsYXJWZWxvY2l0eTtcbiAgICB0aGlzLmEyID0gdGhpcy5iMi5hbmd1bGFyVmVsb2NpdHk7XG4gICAgdGhpcy5pMSA9IHRoaXMuYjEuaW52ZXJzZUluZXJ0aWE7XG4gICAgdGhpcy5pMiA9IHRoaXMuYjIuaW52ZXJzZUluZXJ0aWE7XG4gICAgdGhpcy5pbXB4ID0gMDtcbiAgICB0aGlzLmltcHkgPSAwO1xuICAgIHRoaXMuaW1weiA9IDA7XG5cbiAgfVxuXG4gIE9iamVjdC5hc3NpZ24oTGluZWFyQ29uc3RyYWludC5wcm90b3R5cGUsIHtcblxuICAgIExpbmVhckNvbnN0cmFpbnQ6IHRydWUsXG5cbiAgICBwcmVTb2x2ZTogZnVuY3Rpb24gKHRpbWVTdGVwLCBpbnZUaW1lU3RlcCkge1xuXG4gICAgICB0aGlzLnIxeCA9IHRoaXMucjEueDtcbiAgICAgIHRoaXMucjF5ID0gdGhpcy5yMS55O1xuICAgICAgdGhpcy5yMXogPSB0aGlzLnIxLno7XG5cbiAgICAgIHRoaXMucjJ4ID0gdGhpcy5yMi54O1xuICAgICAgdGhpcy5yMnkgPSB0aGlzLnIyLnk7XG4gICAgICB0aGlzLnIyeiA9IHRoaXMucjIuejtcblxuICAgICAgdGhpcy5tMSA9IHRoaXMuYjEuaW52ZXJzZU1hc3M7XG4gICAgICB0aGlzLm0yID0gdGhpcy5iMi5pbnZlcnNlTWFzcztcblxuICAgICAgdGhpcy5paTEgPSB0aGlzLmkxLmNsb25lKCk7XG4gICAgICB0aGlzLmlpMiA9IHRoaXMuaTIuY2xvbmUoKTtcblxuICAgICAgdmFyIGlpMSA9IHRoaXMuaWkxLmVsZW1lbnRzO1xuICAgICAgdmFyIGlpMiA9IHRoaXMuaWkyLmVsZW1lbnRzO1xuXG4gICAgICB0aGlzLmF4MXggPSB0aGlzLnIxeiAqIGlpMVsxXSArIC10aGlzLnIxeSAqIGlpMVsyXTtcbiAgICAgIHRoaXMuYXgxeSA9IHRoaXMucjF6ICogaWkxWzRdICsgLXRoaXMucjF5ICogaWkxWzVdO1xuICAgICAgdGhpcy5heDF6ID0gdGhpcy5yMXogKiBpaTFbN10gKyAtdGhpcy5yMXkgKiBpaTFbOF07XG4gICAgICB0aGlzLmF5MXggPSAtdGhpcy5yMXogKiBpaTFbMF0gKyB0aGlzLnIxeCAqIGlpMVsyXTtcbiAgICAgIHRoaXMuYXkxeSA9IC10aGlzLnIxeiAqIGlpMVszXSArIHRoaXMucjF4ICogaWkxWzVdO1xuICAgICAgdGhpcy5heTF6ID0gLXRoaXMucjF6ICogaWkxWzZdICsgdGhpcy5yMXggKiBpaTFbOF07XG4gICAgICB0aGlzLmF6MXggPSB0aGlzLnIxeSAqIGlpMVswXSArIC10aGlzLnIxeCAqIGlpMVsxXTtcbiAgICAgIHRoaXMuYXoxeSA9IHRoaXMucjF5ICogaWkxWzNdICsgLXRoaXMucjF4ICogaWkxWzRdO1xuICAgICAgdGhpcy5hejF6ID0gdGhpcy5yMXkgKiBpaTFbNl0gKyAtdGhpcy5yMXggKiBpaTFbN107XG4gICAgICB0aGlzLmF4MnggPSB0aGlzLnIyeiAqIGlpMlsxXSArIC10aGlzLnIyeSAqIGlpMlsyXTtcbiAgICAgIHRoaXMuYXgyeSA9IHRoaXMucjJ6ICogaWkyWzRdICsgLXRoaXMucjJ5ICogaWkyWzVdO1xuICAgICAgdGhpcy5heDJ6ID0gdGhpcy5yMnogKiBpaTJbN10gKyAtdGhpcy5yMnkgKiBpaTJbOF07XG4gICAgICB0aGlzLmF5MnggPSAtdGhpcy5yMnogKiBpaTJbMF0gKyB0aGlzLnIyeCAqIGlpMlsyXTtcbiAgICAgIHRoaXMuYXkyeSA9IC10aGlzLnIyeiAqIGlpMlszXSArIHRoaXMucjJ4ICogaWkyWzVdO1xuICAgICAgdGhpcy5heTJ6ID0gLXRoaXMucjJ6ICogaWkyWzZdICsgdGhpcy5yMnggKiBpaTJbOF07XG4gICAgICB0aGlzLmF6MnggPSB0aGlzLnIyeSAqIGlpMlswXSArIC10aGlzLnIyeCAqIGlpMlsxXTtcbiAgICAgIHRoaXMuYXoyeSA9IHRoaXMucjJ5ICogaWkyWzNdICsgLXRoaXMucjJ4ICogaWkyWzRdO1xuICAgICAgdGhpcy5hejJ6ID0gdGhpcy5yMnkgKiBpaTJbNl0gKyAtdGhpcy5yMnggKiBpaTJbN107XG5cbiAgICAgIC8vIGNhbGN1bGF0ZSBwb2ludC10by1wb2ludCBtYXNzIG1hdHJpeFxuICAgICAgLy8gZnJvbSBpbXB1bHNlIGVxdWF0aW9uXG4gICAgICAvLyBcbiAgICAgIC8vIE0gPSAoWy9tXSAtIFtyXl1bL0ldW3JeXSkgXiAtMVxuICAgICAgLy8gXG4gICAgICAvLyB3aGVyZVxuICAgICAgLy8gXG4gICAgICAvLyBbL21dID0gfDEvbSwgMCwgMHxcbiAgICAgIC8vICAgICAgICB8MCwgMS9tLCAwfFxuICAgICAgLy8gICAgICAgIHwwLCAwLCAxL218XG4gICAgICAvLyBcbiAgICAgIC8vIFtyXl0gPSB8MCwgLXJ6LCByeXxcbiAgICAgIC8vICAgICAgICB8cnosIDAsIC1yeHxcbiAgICAgIC8vICAgICAgICB8LXJ5LCByeCwgMHxcbiAgICAgIC8vIFxuICAgICAgLy8gWy9JXSA9IEludmVydGVkIG1vbWVudCBpbmVydGlhXG5cbiAgICAgIHZhciByeHggPSB0aGlzLm0xICsgdGhpcy5tMjtcblxuICAgICAgdmFyIGtrID0gbmV3IE1hdDMzKCkuc2V0KHJ4eCwgMCwgMCwgMCwgcnh4LCAwLCAwLCAwLCByeHgpO1xuICAgICAgdmFyIGsgPSBray5lbGVtZW50cztcblxuICAgICAga1swXSArPSBpaTFbNF0gKiB0aGlzLnIxeiAqIHRoaXMucjF6IC0gKGlpMVs3XSArIGlpMVs1XSkgKiB0aGlzLnIxeSAqIHRoaXMucjF6ICsgaWkxWzhdICogdGhpcy5yMXkgKiB0aGlzLnIxeTtcbiAgICAgIGtbMV0gKz0gKGlpMVs2XSAqIHRoaXMucjF5ICsgaWkxWzVdICogdGhpcy5yMXgpICogdGhpcy5yMXogLSBpaTFbM10gKiB0aGlzLnIxeiAqIHRoaXMucjF6IC0gaWkxWzhdICogdGhpcy5yMXggKiB0aGlzLnIxeTtcbiAgICAgIGtbMl0gKz0gKGlpMVszXSAqIHRoaXMucjF5IC0gaWkxWzRdICogdGhpcy5yMXgpICogdGhpcy5yMXogLSBpaTFbNl0gKiB0aGlzLnIxeSAqIHRoaXMucjF5ICsgaWkxWzddICogdGhpcy5yMXggKiB0aGlzLnIxeTtcbiAgICAgIGtbM10gKz0gKGlpMVsyXSAqIHRoaXMucjF5ICsgaWkxWzddICogdGhpcy5yMXgpICogdGhpcy5yMXogLSBpaTFbMV0gKiB0aGlzLnIxeiAqIHRoaXMucjF6IC0gaWkxWzhdICogdGhpcy5yMXggKiB0aGlzLnIxeTtcbiAgICAgIGtbNF0gKz0gaWkxWzBdICogdGhpcy5yMXogKiB0aGlzLnIxeiAtIChpaTFbNl0gKyBpaTFbMl0pICogdGhpcy5yMXggKiB0aGlzLnIxeiArIGlpMVs4XSAqIHRoaXMucjF4ICogdGhpcy5yMXg7XG4gICAgICBrWzVdICs9IChpaTFbMV0gKiB0aGlzLnIxeCAtIGlpMVswXSAqIHRoaXMucjF5KSAqIHRoaXMucjF6IC0gaWkxWzddICogdGhpcy5yMXggKiB0aGlzLnIxeCArIGlpMVs2XSAqIHRoaXMucjF4ICogdGhpcy5yMXk7XG4gICAgICBrWzZdICs9IChpaTFbMV0gKiB0aGlzLnIxeSAtIGlpMVs0XSAqIHRoaXMucjF4KSAqIHRoaXMucjF6IC0gaWkxWzJdICogdGhpcy5yMXkgKiB0aGlzLnIxeSArIGlpMVs1XSAqIHRoaXMucjF4ICogdGhpcy5yMXk7XG4gICAgICBrWzddICs9IChpaTFbM10gKiB0aGlzLnIxeCAtIGlpMVswXSAqIHRoaXMucjF5KSAqIHRoaXMucjF6IC0gaWkxWzVdICogdGhpcy5yMXggKiB0aGlzLnIxeCArIGlpMVsyXSAqIHRoaXMucjF4ICogdGhpcy5yMXk7XG4gICAgICBrWzhdICs9IGlpMVswXSAqIHRoaXMucjF5ICogdGhpcy5yMXkgLSAoaWkxWzNdICsgaWkxWzFdKSAqIHRoaXMucjF4ICogdGhpcy5yMXkgKyBpaTFbNF0gKiB0aGlzLnIxeCAqIHRoaXMucjF4O1xuXG4gICAgICBrWzBdICs9IGlpMls0XSAqIHRoaXMucjJ6ICogdGhpcy5yMnogLSAoaWkyWzddICsgaWkyWzVdKSAqIHRoaXMucjJ5ICogdGhpcy5yMnogKyBpaTJbOF0gKiB0aGlzLnIyeSAqIHRoaXMucjJ5O1xuICAgICAga1sxXSArPSAoaWkyWzZdICogdGhpcy5yMnkgKyBpaTJbNV0gKiB0aGlzLnIyeCkgKiB0aGlzLnIyeiAtIGlpMlszXSAqIHRoaXMucjJ6ICogdGhpcy5yMnogLSBpaTJbOF0gKiB0aGlzLnIyeCAqIHRoaXMucjJ5O1xuICAgICAga1syXSArPSAoaWkyWzNdICogdGhpcy5yMnkgLSBpaTJbNF0gKiB0aGlzLnIyeCkgKiB0aGlzLnIyeiAtIGlpMls2XSAqIHRoaXMucjJ5ICogdGhpcy5yMnkgKyBpaTJbN10gKiB0aGlzLnIyeCAqIHRoaXMucjJ5O1xuICAgICAga1szXSArPSAoaWkyWzJdICogdGhpcy5yMnkgKyBpaTJbN10gKiB0aGlzLnIyeCkgKiB0aGlzLnIyeiAtIGlpMlsxXSAqIHRoaXMucjJ6ICogdGhpcy5yMnogLSBpaTJbOF0gKiB0aGlzLnIyeCAqIHRoaXMucjJ5O1xuICAgICAga1s0XSArPSBpaTJbMF0gKiB0aGlzLnIyeiAqIHRoaXMucjJ6IC0gKGlpMls2XSArIGlpMlsyXSkgKiB0aGlzLnIyeCAqIHRoaXMucjJ6ICsgaWkyWzhdICogdGhpcy5yMnggKiB0aGlzLnIyeDtcbiAgICAgIGtbNV0gKz0gKGlpMlsxXSAqIHRoaXMucjJ4IC0gaWkyWzBdICogdGhpcy5yMnkpICogdGhpcy5yMnogLSBpaTJbN10gKiB0aGlzLnIyeCAqIHRoaXMucjJ4ICsgaWkyWzZdICogdGhpcy5yMnggKiB0aGlzLnIyeTtcbiAgICAgIGtbNl0gKz0gKGlpMlsxXSAqIHRoaXMucjJ5IC0gaWkyWzRdICogdGhpcy5yMngpICogdGhpcy5yMnogLSBpaTJbMl0gKiB0aGlzLnIyeSAqIHRoaXMucjJ5ICsgaWkyWzVdICogdGhpcy5yMnggKiB0aGlzLnIyeTtcbiAgICAgIGtbN10gKz0gKGlpMlszXSAqIHRoaXMucjJ4IC0gaWkyWzBdICogdGhpcy5yMnkpICogdGhpcy5yMnogLSBpaTJbNV0gKiB0aGlzLnIyeCAqIHRoaXMucjJ4ICsgaWkyWzJdICogdGhpcy5yMnggKiB0aGlzLnIyeTtcbiAgICAgIGtbOF0gKz0gaWkyWzBdICogdGhpcy5yMnkgKiB0aGlzLnIyeSAtIChpaTJbM10gKyBpaTJbMV0pICogdGhpcy5yMnggKiB0aGlzLnIyeSArIGlpMls0XSAqIHRoaXMucjJ4ICogdGhpcy5yMng7XG5cbiAgICAgIHZhciBpbnYgPSAxIC8gKGtbMF0gKiAoa1s0XSAqIGtbOF0gLSBrWzddICoga1s1XSkgKyBrWzNdICogKGtbN10gKiBrWzJdIC0ga1sxXSAqIGtbOF0pICsga1s2XSAqIChrWzFdICoga1s1XSAtIGtbNF0gKiBrWzJdKSk7XG4gICAgICB0aGlzLmRkID0gbmV3IE1hdDMzKCkuc2V0KFxuICAgICAgICBrWzRdICoga1s4XSAtIGtbNV0gKiBrWzddLCBrWzJdICoga1s3XSAtIGtbMV0gKiBrWzhdLCBrWzFdICoga1s1XSAtIGtbMl0gKiBrWzRdLFxuICAgICAgICBrWzVdICoga1s2XSAtIGtbM10gKiBrWzhdLCBrWzBdICoga1s4XSAtIGtbMl0gKiBrWzZdLCBrWzJdICoga1szXSAtIGtbMF0gKiBrWzVdLFxuICAgICAgICBrWzNdICoga1s3XSAtIGtbNF0gKiBrWzZdLCBrWzFdICoga1s2XSAtIGtbMF0gKiBrWzddLCBrWzBdICoga1s0XSAtIGtbMV0gKiBrWzNdXG4gICAgICApLnNjYWxlRXF1YWwoaW52KTtcblxuICAgICAgdGhpcy52ZWx4ID0gdGhpcy5wMi54IC0gdGhpcy5wMS54O1xuICAgICAgdGhpcy52ZWx5ID0gdGhpcy5wMi55IC0gdGhpcy5wMS55O1xuICAgICAgdGhpcy52ZWx6ID0gdGhpcy5wMi56IC0gdGhpcy5wMS56O1xuICAgICAgdmFyIGxlbiA9IF9NYXRoLnNxcnQodGhpcy52ZWx4ICogdGhpcy52ZWx4ICsgdGhpcy52ZWx5ICogdGhpcy52ZWx5ICsgdGhpcy52ZWx6ICogdGhpcy52ZWx6KTtcbiAgICAgIGlmIChsZW4gPiAwLjAwNSkge1xuICAgICAgICBsZW4gPSAoMC4wMDUgLSBsZW4pIC8gbGVuICogaW52VGltZVN0ZXAgKiAwLjA1O1xuICAgICAgICB0aGlzLnZlbHggKj0gbGVuO1xuICAgICAgICB0aGlzLnZlbHkgKj0gbGVuO1xuICAgICAgICB0aGlzLnZlbHogKj0gbGVuO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy52ZWx4ID0gMDtcbiAgICAgICAgdGhpcy52ZWx5ID0gMDtcbiAgICAgICAgdGhpcy52ZWx6ID0gMDtcbiAgICAgIH1cblxuICAgICAgdGhpcy5pbXB4ICo9IDAuOTU7XG4gICAgICB0aGlzLmltcHkgKj0gMC45NTtcbiAgICAgIHRoaXMuaW1weiAqPSAwLjk1O1xuXG4gICAgICB0aGlzLmwxLnggKz0gdGhpcy5pbXB4ICogdGhpcy5tMTtcbiAgICAgIHRoaXMubDEueSArPSB0aGlzLmltcHkgKiB0aGlzLm0xO1xuICAgICAgdGhpcy5sMS56ICs9IHRoaXMuaW1weiAqIHRoaXMubTE7XG4gICAgICB0aGlzLmExLnggKz0gdGhpcy5pbXB4ICogdGhpcy5heDF4ICsgdGhpcy5pbXB5ICogdGhpcy5heTF4ICsgdGhpcy5pbXB6ICogdGhpcy5hejF4O1xuICAgICAgdGhpcy5hMS55ICs9IHRoaXMuaW1weCAqIHRoaXMuYXgxeSArIHRoaXMuaW1weSAqIHRoaXMuYXkxeSArIHRoaXMuaW1weiAqIHRoaXMuYXoxeTtcbiAgICAgIHRoaXMuYTEueiArPSB0aGlzLmltcHggKiB0aGlzLmF4MXogKyB0aGlzLmltcHkgKiB0aGlzLmF5MXogKyB0aGlzLmltcHogKiB0aGlzLmF6MXo7XG4gICAgICB0aGlzLmwyLnggLT0gdGhpcy5pbXB4ICogdGhpcy5tMjtcbiAgICAgIHRoaXMubDIueSAtPSB0aGlzLmltcHkgKiB0aGlzLm0yO1xuICAgICAgdGhpcy5sMi56IC09IHRoaXMuaW1weiAqIHRoaXMubTI7XG4gICAgICB0aGlzLmEyLnggLT0gdGhpcy5pbXB4ICogdGhpcy5heDJ4ICsgdGhpcy5pbXB5ICogdGhpcy5heTJ4ICsgdGhpcy5pbXB6ICogdGhpcy5hejJ4O1xuICAgICAgdGhpcy5hMi55IC09IHRoaXMuaW1weCAqIHRoaXMuYXgyeSArIHRoaXMuaW1weSAqIHRoaXMuYXkyeSArIHRoaXMuaW1weiAqIHRoaXMuYXoyeTtcbiAgICAgIHRoaXMuYTIueiAtPSB0aGlzLmltcHggKiB0aGlzLmF4MnogKyB0aGlzLmltcHkgKiB0aGlzLmF5MnogKyB0aGlzLmltcHogKiB0aGlzLmF6Mno7XG4gICAgfSxcblxuICAgIHNvbHZlOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHZhciBkID0gdGhpcy5kZC5lbGVtZW50cztcbiAgICAgIHZhciBydnggPSB0aGlzLmwyLnggLSB0aGlzLmwxLnggKyB0aGlzLmEyLnkgKiB0aGlzLnIyeiAtIHRoaXMuYTIueiAqIHRoaXMucjJ5IC0gdGhpcy5hMS55ICogdGhpcy5yMXogKyB0aGlzLmExLnogKiB0aGlzLnIxeSAtIHRoaXMudmVseDtcbiAgICAgIHZhciBydnkgPSB0aGlzLmwyLnkgLSB0aGlzLmwxLnkgKyB0aGlzLmEyLnogKiB0aGlzLnIyeCAtIHRoaXMuYTIueCAqIHRoaXMucjJ6IC0gdGhpcy5hMS56ICogdGhpcy5yMXggKyB0aGlzLmExLnggKiB0aGlzLnIxeiAtIHRoaXMudmVseTtcbiAgICAgIHZhciBydnogPSB0aGlzLmwyLnogLSB0aGlzLmwxLnogKyB0aGlzLmEyLnggKiB0aGlzLnIyeSAtIHRoaXMuYTIueSAqIHRoaXMucjJ4IC0gdGhpcy5hMS54ICogdGhpcy5yMXkgKyB0aGlzLmExLnkgKiB0aGlzLnIxeCAtIHRoaXMudmVsejtcbiAgICAgIHZhciBuaW1weCA9IHJ2eCAqIGRbMF0gKyBydnkgKiBkWzFdICsgcnZ6ICogZFsyXTtcbiAgICAgIHZhciBuaW1weSA9IHJ2eCAqIGRbM10gKyBydnkgKiBkWzRdICsgcnZ6ICogZFs1XTtcbiAgICAgIHZhciBuaW1weiA9IHJ2eCAqIGRbNl0gKyBydnkgKiBkWzddICsgcnZ6ICogZFs4XTtcbiAgICAgIHRoaXMuaW1weCArPSBuaW1weDtcbiAgICAgIHRoaXMuaW1weSArPSBuaW1weTtcbiAgICAgIHRoaXMuaW1weiArPSBuaW1wejtcbiAgICAgIHRoaXMubDEueCArPSBuaW1weCAqIHRoaXMubTE7XG4gICAgICB0aGlzLmwxLnkgKz0gbmltcHkgKiB0aGlzLm0xO1xuICAgICAgdGhpcy5sMS56ICs9IG5pbXB6ICogdGhpcy5tMTtcbiAgICAgIHRoaXMuYTEueCArPSBuaW1weCAqIHRoaXMuYXgxeCArIG5pbXB5ICogdGhpcy5heTF4ICsgbmltcHogKiB0aGlzLmF6MXg7XG4gICAgICB0aGlzLmExLnkgKz0gbmltcHggKiB0aGlzLmF4MXkgKyBuaW1weSAqIHRoaXMuYXkxeSArIG5pbXB6ICogdGhpcy5hejF5O1xuICAgICAgdGhpcy5hMS56ICs9IG5pbXB4ICogdGhpcy5heDF6ICsgbmltcHkgKiB0aGlzLmF5MXogKyBuaW1weiAqIHRoaXMuYXoxejtcbiAgICAgIHRoaXMubDIueCAtPSBuaW1weCAqIHRoaXMubTI7XG4gICAgICB0aGlzLmwyLnkgLT0gbmltcHkgKiB0aGlzLm0yO1xuICAgICAgdGhpcy5sMi56IC09IG5pbXB6ICogdGhpcy5tMjtcbiAgICAgIHRoaXMuYTIueCAtPSBuaW1weCAqIHRoaXMuYXgyeCArIG5pbXB5ICogdGhpcy5heTJ4ICsgbmltcHogKiB0aGlzLmF6Mng7XG4gICAgICB0aGlzLmEyLnkgLT0gbmltcHggKiB0aGlzLmF4MnkgKyBuaW1weSAqIHRoaXMuYXkyeSArIG5pbXB6ICogdGhpcy5hejJ5O1xuICAgICAgdGhpcy5hMi56IC09IG5pbXB4ICogdGhpcy5heDJ6ICsgbmltcHkgKiB0aGlzLmF5MnogKyBuaW1weiAqIHRoaXMuYXoyejtcblxuICAgIH1cblxuICB9KTtcblxuICAvKipcbiAgKiBBIHRocmVlLWF4aXMgcm90YXRpb25hbCBjb25zdHJhaW50IGZvciB2YXJpb3VzIGpvaW50cy5cbiAgKiBAYXV0aG9yIHNhaGFyYW5cbiAgKi9cblxuICBmdW5jdGlvbiBSb3RhdGlvbmFsM0NvbnN0cmFpbnQoam9pbnQsIGxpbWl0TW90b3IxLCBsaW1pdE1vdG9yMiwgbGltaXRNb3RvcjMpIHtcblxuICAgIHRoaXMuY2ZtMSA9IE5hTjtcbiAgICB0aGlzLmNmbTIgPSBOYU47XG4gICAgdGhpcy5jZm0zID0gTmFOO1xuICAgIHRoaXMuaTFlMDAgPSBOYU47XG4gICAgdGhpcy5pMWUwMSA9IE5hTjtcbiAgICB0aGlzLmkxZTAyID0gTmFOO1xuICAgIHRoaXMuaTFlMTAgPSBOYU47XG4gICAgdGhpcy5pMWUxMSA9IE5hTjtcbiAgICB0aGlzLmkxZTEyID0gTmFOO1xuICAgIHRoaXMuaTFlMjAgPSBOYU47XG4gICAgdGhpcy5pMWUyMSA9IE5hTjtcbiAgICB0aGlzLmkxZTIyID0gTmFOO1xuICAgIHRoaXMuaTJlMDAgPSBOYU47XG4gICAgdGhpcy5pMmUwMSA9IE5hTjtcbiAgICB0aGlzLmkyZTAyID0gTmFOO1xuICAgIHRoaXMuaTJlMTAgPSBOYU47XG4gICAgdGhpcy5pMmUxMSA9IE5hTjtcbiAgICB0aGlzLmkyZTEyID0gTmFOO1xuICAgIHRoaXMuaTJlMjAgPSBOYU47XG4gICAgdGhpcy5pMmUyMSA9IE5hTjtcbiAgICB0aGlzLmkyZTIyID0gTmFOO1xuICAgIHRoaXMuYXgxID0gTmFOO1xuICAgIHRoaXMuYXkxID0gTmFOO1xuICAgIHRoaXMuYXoxID0gTmFOO1xuICAgIHRoaXMuYXgyID0gTmFOO1xuICAgIHRoaXMuYXkyID0gTmFOO1xuICAgIHRoaXMuYXoyID0gTmFOO1xuICAgIHRoaXMuYXgzID0gTmFOO1xuICAgIHRoaXMuYXkzID0gTmFOO1xuICAgIHRoaXMuYXozID0gTmFOO1xuXG4gICAgdGhpcy5hMXgxID0gTmFOOyAvLyBqYWNvaWFuc1xuICAgIHRoaXMuYTF5MSA9IE5hTjtcbiAgICB0aGlzLmExejEgPSBOYU47XG4gICAgdGhpcy5hMngxID0gTmFOO1xuICAgIHRoaXMuYTJ5MSA9IE5hTjtcbiAgICB0aGlzLmEyejEgPSBOYU47XG4gICAgdGhpcy5hMXgyID0gTmFOO1xuICAgIHRoaXMuYTF5MiA9IE5hTjtcbiAgICB0aGlzLmExejIgPSBOYU47XG4gICAgdGhpcy5hMngyID0gTmFOO1xuICAgIHRoaXMuYTJ5MiA9IE5hTjtcbiAgICB0aGlzLmEyejIgPSBOYU47XG4gICAgdGhpcy5hMXgzID0gTmFOO1xuICAgIHRoaXMuYTF5MyA9IE5hTjtcbiAgICB0aGlzLmExejMgPSBOYU47XG4gICAgdGhpcy5hMngzID0gTmFOO1xuICAgIHRoaXMuYTJ5MyA9IE5hTjtcbiAgICB0aGlzLmEyejMgPSBOYU47XG5cbiAgICB0aGlzLmxvd2VyTGltaXQxID0gTmFOO1xuICAgIHRoaXMudXBwZXJMaW1pdDEgPSBOYU47XG4gICAgdGhpcy5saW1pdFZlbG9jaXR5MSA9IE5hTjtcbiAgICB0aGlzLmxpbWl0U3RhdGUxID0gMDsgLy8gLTE6IGF0IGxvd2VyLCAwOiBsb2NrZWQsIDE6IGF0IHVwcGVyLCAyOiBmcmVlXG4gICAgdGhpcy5lbmFibGVNb3RvcjEgPSBmYWxzZTtcbiAgICB0aGlzLm1vdG9yU3BlZWQxID0gTmFOO1xuICAgIHRoaXMubWF4TW90b3JGb3JjZTEgPSBOYU47XG4gICAgdGhpcy5tYXhNb3RvckltcHVsc2UxID0gTmFOO1xuICAgIHRoaXMubG93ZXJMaW1pdDIgPSBOYU47XG4gICAgdGhpcy51cHBlckxpbWl0MiA9IE5hTjtcbiAgICB0aGlzLmxpbWl0VmVsb2NpdHkyID0gTmFOO1xuICAgIHRoaXMubGltaXRTdGF0ZTIgPSAwOyAvLyAtMTogYXQgbG93ZXIsIDA6IGxvY2tlZCwgMTogYXQgdXBwZXIsIDI6IGZyZWVcbiAgICB0aGlzLmVuYWJsZU1vdG9yMiA9IGZhbHNlO1xuICAgIHRoaXMubW90b3JTcGVlZDIgPSBOYU47XG4gICAgdGhpcy5tYXhNb3RvckZvcmNlMiA9IE5hTjtcbiAgICB0aGlzLm1heE1vdG9ySW1wdWxzZTIgPSBOYU47XG4gICAgdGhpcy5sb3dlckxpbWl0MyA9IE5hTjtcbiAgICB0aGlzLnVwcGVyTGltaXQzID0gTmFOO1xuICAgIHRoaXMubGltaXRWZWxvY2l0eTMgPSBOYU47XG4gICAgdGhpcy5saW1pdFN0YXRlMyA9IDA7IC8vIC0xOiBhdCBsb3dlciwgMDogbG9ja2VkLCAxOiBhdCB1cHBlciwgMjogZnJlZVxuICAgIHRoaXMuZW5hYmxlTW90b3IzID0gZmFsc2U7XG4gICAgdGhpcy5tb3RvclNwZWVkMyA9IE5hTjtcbiAgICB0aGlzLm1heE1vdG9yRm9yY2UzID0gTmFOO1xuICAgIHRoaXMubWF4TW90b3JJbXB1bHNlMyA9IE5hTjtcblxuICAgIHRoaXMuazAwID0gTmFOOyAvLyBLID0gSipNKkpUXG4gICAgdGhpcy5rMDEgPSBOYU47XG4gICAgdGhpcy5rMDIgPSBOYU47XG4gICAgdGhpcy5rMTAgPSBOYU47XG4gICAgdGhpcy5rMTEgPSBOYU47XG4gICAgdGhpcy5rMTIgPSBOYU47XG4gICAgdGhpcy5rMjAgPSBOYU47XG4gICAgdGhpcy5rMjEgPSBOYU47XG4gICAgdGhpcy5rMjIgPSBOYU47XG5cbiAgICB0aGlzLmt2MDAgPSBOYU47IC8vIGRpYWdvbmFscyB3aXRob3V0IENGTXNcbiAgICB0aGlzLmt2MTEgPSBOYU47XG4gICAgdGhpcy5rdjIyID0gTmFOO1xuXG4gICAgdGhpcy5kdjAwID0gTmFOOyAvLyAuLi5pbnZlcnRlZFxuICAgIHRoaXMuZHYxMSA9IE5hTjtcbiAgICB0aGlzLmR2MjIgPSBOYU47XG5cbiAgICB0aGlzLmQwMCA9IE5hTjsgIC8vIEteLTFcbiAgICB0aGlzLmQwMSA9IE5hTjtcbiAgICB0aGlzLmQwMiA9IE5hTjtcbiAgICB0aGlzLmQxMCA9IE5hTjtcbiAgICB0aGlzLmQxMSA9IE5hTjtcbiAgICB0aGlzLmQxMiA9IE5hTjtcbiAgICB0aGlzLmQyMCA9IE5hTjtcbiAgICB0aGlzLmQyMSA9IE5hTjtcbiAgICB0aGlzLmQyMiA9IE5hTjtcblxuICAgIHRoaXMubGltaXRNb3RvcjEgPSBsaW1pdE1vdG9yMTtcbiAgICB0aGlzLmxpbWl0TW90b3IyID0gbGltaXRNb3RvcjI7XG4gICAgdGhpcy5saW1pdE1vdG9yMyA9IGxpbWl0TW90b3IzO1xuICAgIHRoaXMuYjEgPSBqb2ludC5ib2R5MTtcbiAgICB0aGlzLmIyID0gam9pbnQuYm9keTI7XG4gICAgdGhpcy5hMSA9IHRoaXMuYjEuYW5ndWxhclZlbG9jaXR5O1xuICAgIHRoaXMuYTIgPSB0aGlzLmIyLmFuZ3VsYXJWZWxvY2l0eTtcbiAgICB0aGlzLmkxID0gdGhpcy5iMS5pbnZlcnNlSW5lcnRpYTtcbiAgICB0aGlzLmkyID0gdGhpcy5iMi5pbnZlcnNlSW5lcnRpYTtcbiAgICB0aGlzLmxpbWl0SW1wdWxzZTEgPSAwO1xuICAgIHRoaXMubW90b3JJbXB1bHNlMSA9IDA7XG4gICAgdGhpcy5saW1pdEltcHVsc2UyID0gMDtcbiAgICB0aGlzLm1vdG9ySW1wdWxzZTIgPSAwO1xuICAgIHRoaXMubGltaXRJbXB1bHNlMyA9IDA7XG4gICAgdGhpcy5tb3RvckltcHVsc2UzID0gMDtcblxuICB9XG5cbiAgT2JqZWN0LmFzc2lnbihSb3RhdGlvbmFsM0NvbnN0cmFpbnQucHJvdG90eXBlLCB7XG5cbiAgICBSb3RhdGlvbmFsM0NvbnN0cmFpbnQ6IHRydWUsXG5cbiAgICBwcmVTb2x2ZTogZnVuY3Rpb24gKHRpbWVTdGVwLCBpbnZUaW1lU3RlcCkge1xuXG4gICAgICB0aGlzLmF4MSA9IHRoaXMubGltaXRNb3RvcjEuYXhpcy54O1xuICAgICAgdGhpcy5heTEgPSB0aGlzLmxpbWl0TW90b3IxLmF4aXMueTtcbiAgICAgIHRoaXMuYXoxID0gdGhpcy5saW1pdE1vdG9yMS5heGlzLno7XG4gICAgICB0aGlzLmF4MiA9IHRoaXMubGltaXRNb3RvcjIuYXhpcy54O1xuICAgICAgdGhpcy5heTIgPSB0aGlzLmxpbWl0TW90b3IyLmF4aXMueTtcbiAgICAgIHRoaXMuYXoyID0gdGhpcy5saW1pdE1vdG9yMi5heGlzLno7XG4gICAgICB0aGlzLmF4MyA9IHRoaXMubGltaXRNb3RvcjMuYXhpcy54O1xuICAgICAgdGhpcy5heTMgPSB0aGlzLmxpbWl0TW90b3IzLmF4aXMueTtcbiAgICAgIHRoaXMuYXozID0gdGhpcy5saW1pdE1vdG9yMy5heGlzLno7XG4gICAgICB0aGlzLmxvd2VyTGltaXQxID0gdGhpcy5saW1pdE1vdG9yMS5sb3dlckxpbWl0O1xuICAgICAgdGhpcy51cHBlckxpbWl0MSA9IHRoaXMubGltaXRNb3RvcjEudXBwZXJMaW1pdDtcbiAgICAgIHRoaXMubW90b3JTcGVlZDEgPSB0aGlzLmxpbWl0TW90b3IxLm1vdG9yU3BlZWQ7XG4gICAgICB0aGlzLm1heE1vdG9yRm9yY2UxID0gdGhpcy5saW1pdE1vdG9yMS5tYXhNb3RvckZvcmNlO1xuICAgICAgdGhpcy5lbmFibGVNb3RvcjEgPSB0aGlzLm1heE1vdG9yRm9yY2UxID4gMDtcbiAgICAgIHRoaXMubG93ZXJMaW1pdDIgPSB0aGlzLmxpbWl0TW90b3IyLmxvd2VyTGltaXQ7XG4gICAgICB0aGlzLnVwcGVyTGltaXQyID0gdGhpcy5saW1pdE1vdG9yMi51cHBlckxpbWl0O1xuICAgICAgdGhpcy5tb3RvclNwZWVkMiA9IHRoaXMubGltaXRNb3RvcjIubW90b3JTcGVlZDtcbiAgICAgIHRoaXMubWF4TW90b3JGb3JjZTIgPSB0aGlzLmxpbWl0TW90b3IyLm1heE1vdG9yRm9yY2U7XG4gICAgICB0aGlzLmVuYWJsZU1vdG9yMiA9IHRoaXMubWF4TW90b3JGb3JjZTIgPiAwO1xuICAgICAgdGhpcy5sb3dlckxpbWl0MyA9IHRoaXMubGltaXRNb3RvcjMubG93ZXJMaW1pdDtcbiAgICAgIHRoaXMudXBwZXJMaW1pdDMgPSB0aGlzLmxpbWl0TW90b3IzLnVwcGVyTGltaXQ7XG4gICAgICB0aGlzLm1vdG9yU3BlZWQzID0gdGhpcy5saW1pdE1vdG9yMy5tb3RvclNwZWVkO1xuICAgICAgdGhpcy5tYXhNb3RvckZvcmNlMyA9IHRoaXMubGltaXRNb3RvcjMubWF4TW90b3JGb3JjZTtcbiAgICAgIHRoaXMuZW5hYmxlTW90b3IzID0gdGhpcy5tYXhNb3RvckZvcmNlMyA+IDA7XG5cbiAgICAgIHZhciB0aTEgPSB0aGlzLmkxLmVsZW1lbnRzO1xuICAgICAgdmFyIHRpMiA9IHRoaXMuaTIuZWxlbWVudHM7XG4gICAgICB0aGlzLmkxZTAwID0gdGkxWzBdO1xuICAgICAgdGhpcy5pMWUwMSA9IHRpMVsxXTtcbiAgICAgIHRoaXMuaTFlMDIgPSB0aTFbMl07XG4gICAgICB0aGlzLmkxZTEwID0gdGkxWzNdO1xuICAgICAgdGhpcy5pMWUxMSA9IHRpMVs0XTtcbiAgICAgIHRoaXMuaTFlMTIgPSB0aTFbNV07XG4gICAgICB0aGlzLmkxZTIwID0gdGkxWzZdO1xuICAgICAgdGhpcy5pMWUyMSA9IHRpMVs3XTtcbiAgICAgIHRoaXMuaTFlMjIgPSB0aTFbOF07XG5cbiAgICAgIHRoaXMuaTJlMDAgPSB0aTJbMF07XG4gICAgICB0aGlzLmkyZTAxID0gdGkyWzFdO1xuICAgICAgdGhpcy5pMmUwMiA9IHRpMlsyXTtcbiAgICAgIHRoaXMuaTJlMTAgPSB0aTJbM107XG4gICAgICB0aGlzLmkyZTExID0gdGkyWzRdO1xuICAgICAgdGhpcy5pMmUxMiA9IHRpMls1XTtcbiAgICAgIHRoaXMuaTJlMjAgPSB0aTJbNl07XG4gICAgICB0aGlzLmkyZTIxID0gdGkyWzddO1xuICAgICAgdGhpcy5pMmUyMiA9IHRpMls4XTtcblxuICAgICAgdmFyIGZyZXF1ZW5jeTEgPSB0aGlzLmxpbWl0TW90b3IxLmZyZXF1ZW5jeTtcbiAgICAgIHZhciBmcmVxdWVuY3kyID0gdGhpcy5saW1pdE1vdG9yMi5mcmVxdWVuY3k7XG4gICAgICB2YXIgZnJlcXVlbmN5MyA9IHRoaXMubGltaXRNb3RvcjMuZnJlcXVlbmN5O1xuICAgICAgdmFyIGVuYWJsZVNwcmluZzEgPSBmcmVxdWVuY3kxID4gMDtcbiAgICAgIHZhciBlbmFibGVTcHJpbmcyID0gZnJlcXVlbmN5MiA+IDA7XG4gICAgICB2YXIgZW5hYmxlU3ByaW5nMyA9IGZyZXF1ZW5jeTMgPiAwO1xuICAgICAgdmFyIGVuYWJsZUxpbWl0MSA9IHRoaXMubG93ZXJMaW1pdDEgPD0gdGhpcy51cHBlckxpbWl0MTtcbiAgICAgIHZhciBlbmFibGVMaW1pdDIgPSB0aGlzLmxvd2VyTGltaXQyIDw9IHRoaXMudXBwZXJMaW1pdDI7XG4gICAgICB2YXIgZW5hYmxlTGltaXQzID0gdGhpcy5sb3dlckxpbWl0MyA8PSB0aGlzLnVwcGVyTGltaXQzO1xuICAgICAgdmFyIGFuZ2xlMSA9IHRoaXMubGltaXRNb3RvcjEuYW5nbGU7XG4gICAgICBpZiAoZW5hYmxlTGltaXQxKSB7XG4gICAgICAgIGlmICh0aGlzLmxvd2VyTGltaXQxID09IHRoaXMudXBwZXJMaW1pdDEpIHtcbiAgICAgICAgICBpZiAodGhpcy5saW1pdFN0YXRlMSAhPSAwKSB7XG4gICAgICAgICAgICB0aGlzLmxpbWl0U3RhdGUxID0gMDtcbiAgICAgICAgICAgIHRoaXMubGltaXRJbXB1bHNlMSA9IDA7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMubGltaXRWZWxvY2l0eTEgPSB0aGlzLmxvd2VyTGltaXQxIC0gYW5nbGUxO1xuICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlMSA8IHRoaXMubG93ZXJMaW1pdDEpIHtcbiAgICAgICAgICBpZiAodGhpcy5saW1pdFN0YXRlMSAhPSAtMSkge1xuICAgICAgICAgICAgdGhpcy5saW1pdFN0YXRlMSA9IC0xO1xuICAgICAgICAgICAgdGhpcy5saW1pdEltcHVsc2UxID0gMDtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5saW1pdFZlbG9jaXR5MSA9IHRoaXMubG93ZXJMaW1pdDEgLSBhbmdsZTE7XG4gICAgICAgIH0gZWxzZSBpZiAoYW5nbGUxID4gdGhpcy51cHBlckxpbWl0MSkge1xuICAgICAgICAgIGlmICh0aGlzLmxpbWl0U3RhdGUxICE9IDEpIHtcbiAgICAgICAgICAgIHRoaXMubGltaXRTdGF0ZTEgPSAxO1xuICAgICAgICAgICAgdGhpcy5saW1pdEltcHVsc2UxID0gMDtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5saW1pdFZlbG9jaXR5MSA9IHRoaXMudXBwZXJMaW1pdDEgLSBhbmdsZTE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5saW1pdFN0YXRlMSA9IDI7XG4gICAgICAgICAgdGhpcy5saW1pdEltcHVsc2UxID0gMDtcbiAgICAgICAgICB0aGlzLmxpbWl0VmVsb2NpdHkxID0gMDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWVuYWJsZVNwcmluZzEpIHtcbiAgICAgICAgICBpZiAodGhpcy5saW1pdFZlbG9jaXR5MSA+IDAuMDIpIHRoaXMubGltaXRWZWxvY2l0eTEgLT0gMC4wMjtcbiAgICAgICAgICBlbHNlIGlmICh0aGlzLmxpbWl0VmVsb2NpdHkxIDwgLTAuMDIpIHRoaXMubGltaXRWZWxvY2l0eTEgKz0gMC4wMjtcbiAgICAgICAgICBlbHNlIHRoaXMubGltaXRWZWxvY2l0eTEgPSAwO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmxpbWl0U3RhdGUxID0gMjtcbiAgICAgICAgdGhpcy5saW1pdEltcHVsc2UxID0gMDtcbiAgICAgIH1cblxuICAgICAgdmFyIGFuZ2xlMiA9IHRoaXMubGltaXRNb3RvcjIuYW5nbGU7XG4gICAgICBpZiAoZW5hYmxlTGltaXQyKSB7XG4gICAgICAgIGlmICh0aGlzLmxvd2VyTGltaXQyID09IHRoaXMudXBwZXJMaW1pdDIpIHtcbiAgICAgICAgICBpZiAodGhpcy5saW1pdFN0YXRlMiAhPSAwKSB7XG4gICAgICAgICAgICB0aGlzLmxpbWl0U3RhdGUyID0gMDtcbiAgICAgICAgICAgIHRoaXMubGltaXRJbXB1bHNlMiA9IDA7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMubGltaXRWZWxvY2l0eTIgPSB0aGlzLmxvd2VyTGltaXQyIC0gYW5nbGUyO1xuICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlMiA8IHRoaXMubG93ZXJMaW1pdDIpIHtcbiAgICAgICAgICBpZiAodGhpcy5saW1pdFN0YXRlMiAhPSAtMSkge1xuICAgICAgICAgICAgdGhpcy5saW1pdFN0YXRlMiA9IC0xO1xuICAgICAgICAgICAgdGhpcy5saW1pdEltcHVsc2UyID0gMDtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5saW1pdFZlbG9jaXR5MiA9IHRoaXMubG93ZXJMaW1pdDIgLSBhbmdsZTI7XG4gICAgICAgIH0gZWxzZSBpZiAoYW5nbGUyID4gdGhpcy51cHBlckxpbWl0Mikge1xuICAgICAgICAgIGlmICh0aGlzLmxpbWl0U3RhdGUyICE9IDEpIHtcbiAgICAgICAgICAgIHRoaXMubGltaXRTdGF0ZTIgPSAxO1xuICAgICAgICAgICAgdGhpcy5saW1pdEltcHVsc2UyID0gMDtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5saW1pdFZlbG9jaXR5MiA9IHRoaXMudXBwZXJMaW1pdDIgLSBhbmdsZTI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5saW1pdFN0YXRlMiA9IDI7XG4gICAgICAgICAgdGhpcy5saW1pdEltcHVsc2UyID0gMDtcbiAgICAgICAgICB0aGlzLmxpbWl0VmVsb2NpdHkyID0gMDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWVuYWJsZVNwcmluZzIpIHtcbiAgICAgICAgICBpZiAodGhpcy5saW1pdFZlbG9jaXR5MiA+IDAuMDIpIHRoaXMubGltaXRWZWxvY2l0eTIgLT0gMC4wMjtcbiAgICAgICAgICBlbHNlIGlmICh0aGlzLmxpbWl0VmVsb2NpdHkyIDwgLTAuMDIpIHRoaXMubGltaXRWZWxvY2l0eTIgKz0gMC4wMjtcbiAgICAgICAgICBlbHNlIHRoaXMubGltaXRWZWxvY2l0eTIgPSAwO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmxpbWl0U3RhdGUyID0gMjtcbiAgICAgICAgdGhpcy5saW1pdEltcHVsc2UyID0gMDtcbiAgICAgIH1cblxuICAgICAgdmFyIGFuZ2xlMyA9IHRoaXMubGltaXRNb3RvcjMuYW5nbGU7XG4gICAgICBpZiAoZW5hYmxlTGltaXQzKSB7XG4gICAgICAgIGlmICh0aGlzLmxvd2VyTGltaXQzID09IHRoaXMudXBwZXJMaW1pdDMpIHtcbiAgICAgICAgICBpZiAodGhpcy5saW1pdFN0YXRlMyAhPSAwKSB7XG4gICAgICAgICAgICB0aGlzLmxpbWl0U3RhdGUzID0gMDtcbiAgICAgICAgICAgIHRoaXMubGltaXRJbXB1bHNlMyA9IDA7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMubGltaXRWZWxvY2l0eTMgPSB0aGlzLmxvd2VyTGltaXQzIC0gYW5nbGUzO1xuICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlMyA8IHRoaXMubG93ZXJMaW1pdDMpIHtcbiAgICAgICAgICBpZiAodGhpcy5saW1pdFN0YXRlMyAhPSAtMSkge1xuICAgICAgICAgICAgdGhpcy5saW1pdFN0YXRlMyA9IC0xO1xuICAgICAgICAgICAgdGhpcy5saW1pdEltcHVsc2UzID0gMDtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5saW1pdFZlbG9jaXR5MyA9IHRoaXMubG93ZXJMaW1pdDMgLSBhbmdsZTM7XG4gICAgICAgIH0gZWxzZSBpZiAoYW5nbGUzID4gdGhpcy51cHBlckxpbWl0Mykge1xuICAgICAgICAgIGlmICh0aGlzLmxpbWl0U3RhdGUzICE9IDEpIHtcbiAgICAgICAgICAgIHRoaXMubGltaXRTdGF0ZTMgPSAxO1xuICAgICAgICAgICAgdGhpcy5saW1pdEltcHVsc2UzID0gMDtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5saW1pdFZlbG9jaXR5MyA9IHRoaXMudXBwZXJMaW1pdDMgLSBhbmdsZTM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5saW1pdFN0YXRlMyA9IDI7XG4gICAgICAgICAgdGhpcy5saW1pdEltcHVsc2UzID0gMDtcbiAgICAgICAgICB0aGlzLmxpbWl0VmVsb2NpdHkzID0gMDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWVuYWJsZVNwcmluZzMpIHtcbiAgICAgICAgICBpZiAodGhpcy5saW1pdFZlbG9jaXR5MyA+IDAuMDIpIHRoaXMubGltaXRWZWxvY2l0eTMgLT0gMC4wMjtcbiAgICAgICAgICBlbHNlIGlmICh0aGlzLmxpbWl0VmVsb2NpdHkzIDwgLTAuMDIpIHRoaXMubGltaXRWZWxvY2l0eTMgKz0gMC4wMjtcbiAgICAgICAgICBlbHNlIHRoaXMubGltaXRWZWxvY2l0eTMgPSAwO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmxpbWl0U3RhdGUzID0gMjtcbiAgICAgICAgdGhpcy5saW1pdEltcHVsc2UzID0gMDtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuZW5hYmxlTW90b3IxICYmICh0aGlzLmxpbWl0U3RhdGUxICE9IDAgfHwgZW5hYmxlU3ByaW5nMSkpIHtcbiAgICAgICAgdGhpcy5tYXhNb3RvckltcHVsc2UxID0gdGhpcy5tYXhNb3RvckZvcmNlMSAqIHRpbWVTdGVwO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5tb3RvckltcHVsc2UxID0gMDtcbiAgICAgICAgdGhpcy5tYXhNb3RvckltcHVsc2UxID0gMDtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmVuYWJsZU1vdG9yMiAmJiAodGhpcy5saW1pdFN0YXRlMiAhPSAwIHx8IGVuYWJsZVNwcmluZzIpKSB7XG4gICAgICAgIHRoaXMubWF4TW90b3JJbXB1bHNlMiA9IHRoaXMubWF4TW90b3JGb3JjZTIgKiB0aW1lU3RlcDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMubW90b3JJbXB1bHNlMiA9IDA7XG4gICAgICAgIHRoaXMubWF4TW90b3JJbXB1bHNlMiA9IDA7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5lbmFibGVNb3RvcjMgJiYgKHRoaXMubGltaXRTdGF0ZTMgIT0gMCB8fCBlbmFibGVTcHJpbmczKSkge1xuICAgICAgICB0aGlzLm1heE1vdG9ySW1wdWxzZTMgPSB0aGlzLm1heE1vdG9yRm9yY2UzICogdGltZVN0ZXA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLm1vdG9ySW1wdWxzZTMgPSAwO1xuICAgICAgICB0aGlzLm1heE1vdG9ySW1wdWxzZTMgPSAwO1xuICAgICAgfVxuXG4gICAgICAvLyBidWlsZCBqYWNvYmlhbnNcbiAgICAgIHRoaXMuYTF4MSA9IHRoaXMuYXgxICogdGhpcy5pMWUwMCArIHRoaXMuYXkxICogdGhpcy5pMWUwMSArIHRoaXMuYXoxICogdGhpcy5pMWUwMjtcbiAgICAgIHRoaXMuYTF5MSA9IHRoaXMuYXgxICogdGhpcy5pMWUxMCArIHRoaXMuYXkxICogdGhpcy5pMWUxMSArIHRoaXMuYXoxICogdGhpcy5pMWUxMjtcbiAgICAgIHRoaXMuYTF6MSA9IHRoaXMuYXgxICogdGhpcy5pMWUyMCArIHRoaXMuYXkxICogdGhpcy5pMWUyMSArIHRoaXMuYXoxICogdGhpcy5pMWUyMjtcbiAgICAgIHRoaXMuYTJ4MSA9IHRoaXMuYXgxICogdGhpcy5pMmUwMCArIHRoaXMuYXkxICogdGhpcy5pMmUwMSArIHRoaXMuYXoxICogdGhpcy5pMmUwMjtcbiAgICAgIHRoaXMuYTJ5MSA9IHRoaXMuYXgxICogdGhpcy5pMmUxMCArIHRoaXMuYXkxICogdGhpcy5pMmUxMSArIHRoaXMuYXoxICogdGhpcy5pMmUxMjtcbiAgICAgIHRoaXMuYTJ6MSA9IHRoaXMuYXgxICogdGhpcy5pMmUyMCArIHRoaXMuYXkxICogdGhpcy5pMmUyMSArIHRoaXMuYXoxICogdGhpcy5pMmUyMjtcblxuICAgICAgdGhpcy5hMXgyID0gdGhpcy5heDIgKiB0aGlzLmkxZTAwICsgdGhpcy5heTIgKiB0aGlzLmkxZTAxICsgdGhpcy5hejIgKiB0aGlzLmkxZTAyO1xuICAgICAgdGhpcy5hMXkyID0gdGhpcy5heDIgKiB0aGlzLmkxZTEwICsgdGhpcy5heTIgKiB0aGlzLmkxZTExICsgdGhpcy5hejIgKiB0aGlzLmkxZTEyO1xuICAgICAgdGhpcy5hMXoyID0gdGhpcy5heDIgKiB0aGlzLmkxZTIwICsgdGhpcy5heTIgKiB0aGlzLmkxZTIxICsgdGhpcy5hejIgKiB0aGlzLmkxZTIyO1xuICAgICAgdGhpcy5hMngyID0gdGhpcy5heDIgKiB0aGlzLmkyZTAwICsgdGhpcy5heTIgKiB0aGlzLmkyZTAxICsgdGhpcy5hejIgKiB0aGlzLmkyZTAyO1xuICAgICAgdGhpcy5hMnkyID0gdGhpcy5heDIgKiB0aGlzLmkyZTEwICsgdGhpcy5heTIgKiB0aGlzLmkyZTExICsgdGhpcy5hejIgKiB0aGlzLmkyZTEyO1xuICAgICAgdGhpcy5hMnoyID0gdGhpcy5heDIgKiB0aGlzLmkyZTIwICsgdGhpcy5heTIgKiB0aGlzLmkyZTIxICsgdGhpcy5hejIgKiB0aGlzLmkyZTIyO1xuXG4gICAgICB0aGlzLmExeDMgPSB0aGlzLmF4MyAqIHRoaXMuaTFlMDAgKyB0aGlzLmF5MyAqIHRoaXMuaTFlMDEgKyB0aGlzLmF6MyAqIHRoaXMuaTFlMDI7XG4gICAgICB0aGlzLmExeTMgPSB0aGlzLmF4MyAqIHRoaXMuaTFlMTAgKyB0aGlzLmF5MyAqIHRoaXMuaTFlMTEgKyB0aGlzLmF6MyAqIHRoaXMuaTFlMTI7XG4gICAgICB0aGlzLmExejMgPSB0aGlzLmF4MyAqIHRoaXMuaTFlMjAgKyB0aGlzLmF5MyAqIHRoaXMuaTFlMjEgKyB0aGlzLmF6MyAqIHRoaXMuaTFlMjI7XG4gICAgICB0aGlzLmEyeDMgPSB0aGlzLmF4MyAqIHRoaXMuaTJlMDAgKyB0aGlzLmF5MyAqIHRoaXMuaTJlMDEgKyB0aGlzLmF6MyAqIHRoaXMuaTJlMDI7XG4gICAgICB0aGlzLmEyeTMgPSB0aGlzLmF4MyAqIHRoaXMuaTJlMTAgKyB0aGlzLmF5MyAqIHRoaXMuaTJlMTEgKyB0aGlzLmF6MyAqIHRoaXMuaTJlMTI7XG4gICAgICB0aGlzLmEyejMgPSB0aGlzLmF4MyAqIHRoaXMuaTJlMjAgKyB0aGlzLmF5MyAqIHRoaXMuaTJlMjEgKyB0aGlzLmF6MyAqIHRoaXMuaTJlMjI7XG5cbiAgICAgIC8vIGJ1aWxkIGFuIGltcHVsc2UgbWF0cml4XG4gICAgICB0aGlzLmswMCA9IHRoaXMuYXgxICogKHRoaXMuYTF4MSArIHRoaXMuYTJ4MSkgKyB0aGlzLmF5MSAqICh0aGlzLmExeTEgKyB0aGlzLmEyeTEpICsgdGhpcy5hejEgKiAodGhpcy5hMXoxICsgdGhpcy5hMnoxKTtcbiAgICAgIHRoaXMuazAxID0gdGhpcy5heDEgKiAodGhpcy5hMXgyICsgdGhpcy5hMngyKSArIHRoaXMuYXkxICogKHRoaXMuYTF5MiArIHRoaXMuYTJ5MikgKyB0aGlzLmF6MSAqICh0aGlzLmExejIgKyB0aGlzLmEyejIpO1xuICAgICAgdGhpcy5rMDIgPSB0aGlzLmF4MSAqICh0aGlzLmExeDMgKyB0aGlzLmEyeDMpICsgdGhpcy5heTEgKiAodGhpcy5hMXkzICsgdGhpcy5hMnkzKSArIHRoaXMuYXoxICogKHRoaXMuYTF6MyArIHRoaXMuYTJ6Myk7XG4gICAgICB0aGlzLmsxMCA9IHRoaXMuYXgyICogKHRoaXMuYTF4MSArIHRoaXMuYTJ4MSkgKyB0aGlzLmF5MiAqICh0aGlzLmExeTEgKyB0aGlzLmEyeTEpICsgdGhpcy5hejIgKiAodGhpcy5hMXoxICsgdGhpcy5hMnoxKTtcbiAgICAgIHRoaXMuazExID0gdGhpcy5heDIgKiAodGhpcy5hMXgyICsgdGhpcy5hMngyKSArIHRoaXMuYXkyICogKHRoaXMuYTF5MiArIHRoaXMuYTJ5MikgKyB0aGlzLmF6MiAqICh0aGlzLmExejIgKyB0aGlzLmEyejIpO1xuICAgICAgdGhpcy5rMTIgPSB0aGlzLmF4MiAqICh0aGlzLmExeDMgKyB0aGlzLmEyeDMpICsgdGhpcy5heTIgKiAodGhpcy5hMXkzICsgdGhpcy5hMnkzKSArIHRoaXMuYXoyICogKHRoaXMuYTF6MyArIHRoaXMuYTJ6Myk7XG4gICAgICB0aGlzLmsyMCA9IHRoaXMuYXgzICogKHRoaXMuYTF4MSArIHRoaXMuYTJ4MSkgKyB0aGlzLmF5MyAqICh0aGlzLmExeTEgKyB0aGlzLmEyeTEpICsgdGhpcy5hejMgKiAodGhpcy5hMXoxICsgdGhpcy5hMnoxKTtcbiAgICAgIHRoaXMuazIxID0gdGhpcy5heDMgKiAodGhpcy5hMXgyICsgdGhpcy5hMngyKSArIHRoaXMuYXkzICogKHRoaXMuYTF5MiArIHRoaXMuYTJ5MikgKyB0aGlzLmF6MyAqICh0aGlzLmExejIgKyB0aGlzLmEyejIpO1xuICAgICAgdGhpcy5rMjIgPSB0aGlzLmF4MyAqICh0aGlzLmExeDMgKyB0aGlzLmEyeDMpICsgdGhpcy5heTMgKiAodGhpcy5hMXkzICsgdGhpcy5hMnkzKSArIHRoaXMuYXozICogKHRoaXMuYTF6MyArIHRoaXMuYTJ6Myk7XG5cbiAgICAgIHRoaXMua3YwMCA9IHRoaXMuazAwO1xuICAgICAgdGhpcy5rdjExID0gdGhpcy5rMTE7XG4gICAgICB0aGlzLmt2MjIgPSB0aGlzLmsyMjtcbiAgICAgIHRoaXMuZHYwMCA9IDEgLyB0aGlzLmt2MDA7XG4gICAgICB0aGlzLmR2MTEgPSAxIC8gdGhpcy5rdjExO1xuICAgICAgdGhpcy5kdjIyID0gMSAvIHRoaXMua3YyMjtcblxuICAgICAgaWYgKGVuYWJsZVNwcmluZzEgJiYgdGhpcy5saW1pdFN0YXRlMSAhPSAyKSB7XG4gICAgICAgIHZhciBvbWVnYSA9IDYuMjgzMTg1MyAqIGZyZXF1ZW5jeTE7XG4gICAgICAgIHZhciBrID0gb21lZ2EgKiBvbWVnYSAqIHRpbWVTdGVwO1xuICAgICAgICB2YXIgZG1wID0gaW52VGltZVN0ZXAgLyAoayArIDIgKiB0aGlzLmxpbWl0TW90b3IxLmRhbXBpbmdSYXRpbyAqIG9tZWdhKTtcbiAgICAgICAgdGhpcy5jZm0xID0gdGhpcy5rdjAwICogZG1wO1xuICAgICAgICB0aGlzLmxpbWl0VmVsb2NpdHkxICo9IGsgKiBkbXA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmNmbTEgPSAwO1xuICAgICAgICB0aGlzLmxpbWl0VmVsb2NpdHkxICo9IGludlRpbWVTdGVwICogMC4wNTtcbiAgICAgIH1cblxuICAgICAgaWYgKGVuYWJsZVNwcmluZzIgJiYgdGhpcy5saW1pdFN0YXRlMiAhPSAyKSB7XG4gICAgICAgIG9tZWdhID0gNi4yODMxODUzICogZnJlcXVlbmN5MjtcbiAgICAgICAgayA9IG9tZWdhICogb21lZ2EgKiB0aW1lU3RlcDtcbiAgICAgICAgZG1wID0gaW52VGltZVN0ZXAgLyAoayArIDIgKiB0aGlzLmxpbWl0TW90b3IyLmRhbXBpbmdSYXRpbyAqIG9tZWdhKTtcbiAgICAgICAgdGhpcy5jZm0yID0gdGhpcy5rdjExICogZG1wO1xuICAgICAgICB0aGlzLmxpbWl0VmVsb2NpdHkyICo9IGsgKiBkbXA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmNmbTIgPSAwO1xuICAgICAgICB0aGlzLmxpbWl0VmVsb2NpdHkyICo9IGludlRpbWVTdGVwICogMC4wNTtcbiAgICAgIH1cblxuICAgICAgaWYgKGVuYWJsZVNwcmluZzMgJiYgdGhpcy5saW1pdFN0YXRlMyAhPSAyKSB7XG4gICAgICAgIG9tZWdhID0gNi4yODMxODUzICogZnJlcXVlbmN5MztcbiAgICAgICAgayA9IG9tZWdhICogb21lZ2EgKiB0aW1lU3RlcDtcbiAgICAgICAgZG1wID0gaW52VGltZVN0ZXAgLyAoayArIDIgKiB0aGlzLmxpbWl0TW90b3IzLmRhbXBpbmdSYXRpbyAqIG9tZWdhKTtcbiAgICAgICAgdGhpcy5jZm0zID0gdGhpcy5rdjIyICogZG1wO1xuICAgICAgICB0aGlzLmxpbWl0VmVsb2NpdHkzICo9IGsgKiBkbXA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmNmbTMgPSAwO1xuICAgICAgICB0aGlzLmxpbWl0VmVsb2NpdHkzICo9IGludlRpbWVTdGVwICogMC4wNTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5rMDAgKz0gdGhpcy5jZm0xO1xuICAgICAgdGhpcy5rMTEgKz0gdGhpcy5jZm0yO1xuICAgICAgdGhpcy5rMjIgKz0gdGhpcy5jZm0zO1xuXG4gICAgICB2YXIgaW52ID0gMSAvIChcbiAgICAgICAgdGhpcy5rMDAgKiAodGhpcy5rMTEgKiB0aGlzLmsyMiAtIHRoaXMuazIxICogdGhpcy5rMTIpICtcbiAgICAgICAgdGhpcy5rMTAgKiAodGhpcy5rMjEgKiB0aGlzLmswMiAtIHRoaXMuazAxICogdGhpcy5rMjIpICtcbiAgICAgICAgdGhpcy5rMjAgKiAodGhpcy5rMDEgKiB0aGlzLmsxMiAtIHRoaXMuazExICogdGhpcy5rMDIpXG4gICAgICApO1xuICAgICAgdGhpcy5kMDAgPSAodGhpcy5rMTEgKiB0aGlzLmsyMiAtIHRoaXMuazEyICogdGhpcy5rMjEpICogaW52O1xuICAgICAgdGhpcy5kMDEgPSAodGhpcy5rMDIgKiB0aGlzLmsyMSAtIHRoaXMuazAxICogdGhpcy5rMjIpICogaW52O1xuICAgICAgdGhpcy5kMDIgPSAodGhpcy5rMDEgKiB0aGlzLmsxMiAtIHRoaXMuazAyICogdGhpcy5rMTEpICogaW52O1xuICAgICAgdGhpcy5kMTAgPSAodGhpcy5rMTIgKiB0aGlzLmsyMCAtIHRoaXMuazEwICogdGhpcy5rMjIpICogaW52O1xuICAgICAgdGhpcy5kMTEgPSAodGhpcy5rMDAgKiB0aGlzLmsyMiAtIHRoaXMuazAyICogdGhpcy5rMjApICogaW52O1xuICAgICAgdGhpcy5kMTIgPSAodGhpcy5rMDIgKiB0aGlzLmsxMCAtIHRoaXMuazAwICogdGhpcy5rMTIpICogaW52O1xuICAgICAgdGhpcy5kMjAgPSAodGhpcy5rMTAgKiB0aGlzLmsyMSAtIHRoaXMuazExICogdGhpcy5rMjApICogaW52O1xuICAgICAgdGhpcy5kMjEgPSAodGhpcy5rMDEgKiB0aGlzLmsyMCAtIHRoaXMuazAwICogdGhpcy5rMjEpICogaW52O1xuICAgICAgdGhpcy5kMjIgPSAodGhpcy5rMDAgKiB0aGlzLmsxMSAtIHRoaXMuazAxICogdGhpcy5rMTApICogaW52O1xuXG4gICAgICB0aGlzLmxpbWl0SW1wdWxzZTEgKj0gMC45NTtcbiAgICAgIHRoaXMubW90b3JJbXB1bHNlMSAqPSAwLjk1O1xuICAgICAgdGhpcy5saW1pdEltcHVsc2UyICo9IDAuOTU7XG4gICAgICB0aGlzLm1vdG9ySW1wdWxzZTIgKj0gMC45NTtcbiAgICAgIHRoaXMubGltaXRJbXB1bHNlMyAqPSAwLjk1O1xuICAgICAgdGhpcy5tb3RvckltcHVsc2UzICo9IDAuOTU7XG4gICAgICB2YXIgdG90YWxJbXB1bHNlMSA9IHRoaXMubGltaXRJbXB1bHNlMSArIHRoaXMubW90b3JJbXB1bHNlMTtcbiAgICAgIHZhciB0b3RhbEltcHVsc2UyID0gdGhpcy5saW1pdEltcHVsc2UyICsgdGhpcy5tb3RvckltcHVsc2UyO1xuICAgICAgdmFyIHRvdGFsSW1wdWxzZTMgPSB0aGlzLmxpbWl0SW1wdWxzZTMgKyB0aGlzLm1vdG9ySW1wdWxzZTM7XG4gICAgICB0aGlzLmExLnggKz0gdG90YWxJbXB1bHNlMSAqIHRoaXMuYTF4MSArIHRvdGFsSW1wdWxzZTIgKiB0aGlzLmExeDIgKyB0b3RhbEltcHVsc2UzICogdGhpcy5hMXgzO1xuICAgICAgdGhpcy5hMS55ICs9IHRvdGFsSW1wdWxzZTEgKiB0aGlzLmExeTEgKyB0b3RhbEltcHVsc2UyICogdGhpcy5hMXkyICsgdG90YWxJbXB1bHNlMyAqIHRoaXMuYTF5MztcbiAgICAgIHRoaXMuYTEueiArPSB0b3RhbEltcHVsc2UxICogdGhpcy5hMXoxICsgdG90YWxJbXB1bHNlMiAqIHRoaXMuYTF6MiArIHRvdGFsSW1wdWxzZTMgKiB0aGlzLmExejM7XG4gICAgICB0aGlzLmEyLnggLT0gdG90YWxJbXB1bHNlMSAqIHRoaXMuYTJ4MSArIHRvdGFsSW1wdWxzZTIgKiB0aGlzLmEyeDIgKyB0b3RhbEltcHVsc2UzICogdGhpcy5hMngzO1xuICAgICAgdGhpcy5hMi55IC09IHRvdGFsSW1wdWxzZTEgKiB0aGlzLmEyeTEgKyB0b3RhbEltcHVsc2UyICogdGhpcy5hMnkyICsgdG90YWxJbXB1bHNlMyAqIHRoaXMuYTJ5MztcbiAgICAgIHRoaXMuYTIueiAtPSB0b3RhbEltcHVsc2UxICogdGhpcy5hMnoxICsgdG90YWxJbXB1bHNlMiAqIHRoaXMuYTJ6MiArIHRvdGFsSW1wdWxzZTMgKiB0aGlzLmEyejM7XG4gICAgfSxcbiAgICBzb2x2ZV86IGZ1bmN0aW9uICgpIHtcblxuICAgICAgdmFyIHJ2eCA9IHRoaXMuYTIueCAtIHRoaXMuYTEueDtcbiAgICAgIHZhciBydnkgPSB0aGlzLmEyLnkgLSB0aGlzLmExLnk7XG4gICAgICB2YXIgcnZ6ID0gdGhpcy5hMi56IC0gdGhpcy5hMS56O1xuXG4gICAgICB0aGlzLmxpbWl0VmVsb2NpdHkzID0gMzA7XG4gICAgICB2YXIgcnZuMSA9IHJ2eCAqIHRoaXMuYXgxICsgcnZ5ICogdGhpcy5heTEgKyBydnogKiB0aGlzLmF6MSAtIHRoaXMubGltaXRWZWxvY2l0eTE7XG4gICAgICB2YXIgcnZuMiA9IHJ2eCAqIHRoaXMuYXgyICsgcnZ5ICogdGhpcy5heTIgKyBydnogKiB0aGlzLmF6MiAtIHRoaXMubGltaXRWZWxvY2l0eTI7XG4gICAgICB2YXIgcnZuMyA9IHJ2eCAqIHRoaXMuYXgzICsgcnZ5ICogdGhpcy5heTMgKyBydnogKiB0aGlzLmF6MyAtIHRoaXMubGltaXRWZWxvY2l0eTM7XG5cbiAgICAgIHZhciBkTGltaXRJbXB1bHNlMSA9IHJ2bjEgKiB0aGlzLmQwMCArIHJ2bjIgKiB0aGlzLmQwMSArIHJ2bjMgKiB0aGlzLmQwMjtcbiAgICAgIHZhciBkTGltaXRJbXB1bHNlMiA9IHJ2bjEgKiB0aGlzLmQxMCArIHJ2bjIgKiB0aGlzLmQxMSArIHJ2bjMgKiB0aGlzLmQxMjtcbiAgICAgIHZhciBkTGltaXRJbXB1bHNlMyA9IHJ2bjEgKiB0aGlzLmQyMCArIHJ2bjIgKiB0aGlzLmQyMSArIHJ2bjMgKiB0aGlzLmQyMjtcblxuICAgICAgdGhpcy5saW1pdEltcHVsc2UxICs9IGRMaW1pdEltcHVsc2UxO1xuICAgICAgdGhpcy5saW1pdEltcHVsc2UyICs9IGRMaW1pdEltcHVsc2UyO1xuICAgICAgdGhpcy5saW1pdEltcHVsc2UzICs9IGRMaW1pdEltcHVsc2UzO1xuXG4gICAgICB0aGlzLmExLnggKz0gZExpbWl0SW1wdWxzZTEgKiB0aGlzLmExeDEgKyBkTGltaXRJbXB1bHNlMiAqIHRoaXMuYTF4MiArIGRMaW1pdEltcHVsc2UzICogdGhpcy5hMXgzO1xuICAgICAgdGhpcy5hMS55ICs9IGRMaW1pdEltcHVsc2UxICogdGhpcy5hMXkxICsgZExpbWl0SW1wdWxzZTIgKiB0aGlzLmExeTIgKyBkTGltaXRJbXB1bHNlMyAqIHRoaXMuYTF5MztcbiAgICAgIHRoaXMuYTEueiArPSBkTGltaXRJbXB1bHNlMSAqIHRoaXMuYTF6MSArIGRMaW1pdEltcHVsc2UyICogdGhpcy5hMXoyICsgZExpbWl0SW1wdWxzZTMgKiB0aGlzLmExejM7XG4gICAgICB0aGlzLmEyLnggLT0gZExpbWl0SW1wdWxzZTEgKiB0aGlzLmEyeDEgKyBkTGltaXRJbXB1bHNlMiAqIHRoaXMuYTJ4MiArIGRMaW1pdEltcHVsc2UzICogdGhpcy5hMngzO1xuICAgICAgdGhpcy5hMi55IC09IGRMaW1pdEltcHVsc2UxICogdGhpcy5hMnkxICsgZExpbWl0SW1wdWxzZTIgKiB0aGlzLmEyeTIgKyBkTGltaXRJbXB1bHNlMyAqIHRoaXMuYTJ5MztcbiAgICAgIHRoaXMuYTIueiAtPSBkTGltaXRJbXB1bHNlMSAqIHRoaXMuYTJ6MSArIGRMaW1pdEltcHVsc2UyICogdGhpcy5hMnoyICsgZExpbWl0SW1wdWxzZTMgKiB0aGlzLmEyejM7XG4gICAgfSxcbiAgICBzb2x2ZTogZnVuY3Rpb24gKCkge1xuXG4gICAgICB2YXIgcnZ4ID0gdGhpcy5hMi54IC0gdGhpcy5hMS54O1xuICAgICAgdmFyIHJ2eSA9IHRoaXMuYTIueSAtIHRoaXMuYTEueTtcbiAgICAgIHZhciBydnogPSB0aGlzLmEyLnogLSB0aGlzLmExLno7XG5cbiAgICAgIHZhciBydm4xID0gcnZ4ICogdGhpcy5heDEgKyBydnkgKiB0aGlzLmF5MSArIHJ2eiAqIHRoaXMuYXoxO1xuICAgICAgdmFyIHJ2bjIgPSBydnggKiB0aGlzLmF4MiArIHJ2eSAqIHRoaXMuYXkyICsgcnZ6ICogdGhpcy5hejI7XG4gICAgICB2YXIgcnZuMyA9IHJ2eCAqIHRoaXMuYXgzICsgcnZ5ICogdGhpcy5heTMgKyBydnogKiB0aGlzLmF6MztcblxuICAgICAgdmFyIG9sZE1vdG9ySW1wdWxzZTEgPSB0aGlzLm1vdG9ySW1wdWxzZTE7XG4gICAgICB2YXIgb2xkTW90b3JJbXB1bHNlMiA9IHRoaXMubW90b3JJbXB1bHNlMjtcbiAgICAgIHZhciBvbGRNb3RvckltcHVsc2UzID0gdGhpcy5tb3RvckltcHVsc2UzO1xuXG4gICAgICB2YXIgZE1vdG9ySW1wdWxzZTEgPSAwO1xuICAgICAgdmFyIGRNb3RvckltcHVsc2UyID0gMDtcbiAgICAgIHZhciBkTW90b3JJbXB1bHNlMyA9IDA7XG5cbiAgICAgIGlmICh0aGlzLmVuYWJsZU1vdG9yMSkge1xuICAgICAgICBkTW90b3JJbXB1bHNlMSA9IChydm4xIC0gdGhpcy5tb3RvclNwZWVkMSkgKiB0aGlzLmR2MDA7XG4gICAgICAgIHRoaXMubW90b3JJbXB1bHNlMSArPSBkTW90b3JJbXB1bHNlMTtcbiAgICAgICAgaWYgKHRoaXMubW90b3JJbXB1bHNlMSA+IHRoaXMubWF4TW90b3JJbXB1bHNlMSkgeyAvLyBjbGFtcCBtb3RvciBpbXB1bHNlXG4gICAgICAgICAgdGhpcy5tb3RvckltcHVsc2UxID0gdGhpcy5tYXhNb3RvckltcHVsc2UxO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMubW90b3JJbXB1bHNlMSA8IC10aGlzLm1heE1vdG9ySW1wdWxzZTEpIHtcbiAgICAgICAgICB0aGlzLm1vdG9ySW1wdWxzZTEgPSAtdGhpcy5tYXhNb3RvckltcHVsc2UxO1xuICAgICAgICB9XG4gICAgICAgIGRNb3RvckltcHVsc2UxID0gdGhpcy5tb3RvckltcHVsc2UxIC0gb2xkTW90b3JJbXB1bHNlMTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmVuYWJsZU1vdG9yMikge1xuICAgICAgICBkTW90b3JJbXB1bHNlMiA9IChydm4yIC0gdGhpcy5tb3RvclNwZWVkMikgKiB0aGlzLmR2MTE7XG4gICAgICAgIHRoaXMubW90b3JJbXB1bHNlMiArPSBkTW90b3JJbXB1bHNlMjtcbiAgICAgICAgaWYgKHRoaXMubW90b3JJbXB1bHNlMiA+IHRoaXMubWF4TW90b3JJbXB1bHNlMikgeyAvLyBjbGFtcCBtb3RvciBpbXB1bHNlXG4gICAgICAgICAgdGhpcy5tb3RvckltcHVsc2UyID0gdGhpcy5tYXhNb3RvckltcHVsc2UyO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMubW90b3JJbXB1bHNlMiA8IC10aGlzLm1heE1vdG9ySW1wdWxzZTIpIHtcbiAgICAgICAgICB0aGlzLm1vdG9ySW1wdWxzZTIgPSAtdGhpcy5tYXhNb3RvckltcHVsc2UyO1xuICAgICAgICB9XG4gICAgICAgIGRNb3RvckltcHVsc2UyID0gdGhpcy5tb3RvckltcHVsc2UyIC0gb2xkTW90b3JJbXB1bHNlMjtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmVuYWJsZU1vdG9yMykge1xuICAgICAgICBkTW90b3JJbXB1bHNlMyA9IChydm4zIC0gdGhpcy5tb3RvclNwZWVkMykgKiB0aGlzLmR2MjI7XG4gICAgICAgIHRoaXMubW90b3JJbXB1bHNlMyArPSBkTW90b3JJbXB1bHNlMztcbiAgICAgICAgaWYgKHRoaXMubW90b3JJbXB1bHNlMyA+IHRoaXMubWF4TW90b3JJbXB1bHNlMykgeyAvLyBjbGFtcCBtb3RvciBpbXB1bHNlXG4gICAgICAgICAgdGhpcy5tb3RvckltcHVsc2UzID0gdGhpcy5tYXhNb3RvckltcHVsc2UzO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMubW90b3JJbXB1bHNlMyA8IC10aGlzLm1heE1vdG9ySW1wdWxzZTMpIHtcbiAgICAgICAgICB0aGlzLm1vdG9ySW1wdWxzZTMgPSAtdGhpcy5tYXhNb3RvckltcHVsc2UzO1xuICAgICAgICB9XG4gICAgICAgIGRNb3RvckltcHVsc2UzID0gdGhpcy5tb3RvckltcHVsc2UzIC0gb2xkTW90b3JJbXB1bHNlMztcbiAgICAgIH1cblxuICAgICAgLy8gYXBwbHkgbW90b3IgaW1wdWxzZSB0byByZWxhdGl2ZSB2ZWxvY2l0eVxuICAgICAgcnZuMSArPSBkTW90b3JJbXB1bHNlMSAqIHRoaXMua3YwMCArIGRNb3RvckltcHVsc2UyICogdGhpcy5rMDEgKyBkTW90b3JJbXB1bHNlMyAqIHRoaXMuazAyO1xuICAgICAgcnZuMiArPSBkTW90b3JJbXB1bHNlMSAqIHRoaXMuazEwICsgZE1vdG9ySW1wdWxzZTIgKiB0aGlzLmt2MTEgKyBkTW90b3JJbXB1bHNlMyAqIHRoaXMuazEyO1xuICAgICAgcnZuMyArPSBkTW90b3JJbXB1bHNlMSAqIHRoaXMuazIwICsgZE1vdG9ySW1wdWxzZTIgKiB0aGlzLmsyMSArIGRNb3RvckltcHVsc2UzICogdGhpcy5rdjIyO1xuXG4gICAgICAvLyBzdWJ0cmFjdCB0YXJnZXQgdmVsb2NpdHkgYW5kIGFwcGxpZWQgaW1wdWxzZVxuICAgICAgcnZuMSAtPSB0aGlzLmxpbWl0VmVsb2NpdHkxICsgdGhpcy5saW1pdEltcHVsc2UxICogdGhpcy5jZm0xO1xuICAgICAgcnZuMiAtPSB0aGlzLmxpbWl0VmVsb2NpdHkyICsgdGhpcy5saW1pdEltcHVsc2UyICogdGhpcy5jZm0yO1xuICAgICAgcnZuMyAtPSB0aGlzLmxpbWl0VmVsb2NpdHkzICsgdGhpcy5saW1pdEltcHVsc2UzICogdGhpcy5jZm0zO1xuXG4gICAgICB2YXIgb2xkTGltaXRJbXB1bHNlMSA9IHRoaXMubGltaXRJbXB1bHNlMTtcbiAgICAgIHZhciBvbGRMaW1pdEltcHVsc2UyID0gdGhpcy5saW1pdEltcHVsc2UyO1xuICAgICAgdmFyIG9sZExpbWl0SW1wdWxzZTMgPSB0aGlzLmxpbWl0SW1wdWxzZTM7XG5cbiAgICAgIHZhciBkTGltaXRJbXB1bHNlMSA9IHJ2bjEgKiB0aGlzLmQwMCArIHJ2bjIgKiB0aGlzLmQwMSArIHJ2bjMgKiB0aGlzLmQwMjtcbiAgICAgIHZhciBkTGltaXRJbXB1bHNlMiA9IHJ2bjEgKiB0aGlzLmQxMCArIHJ2bjIgKiB0aGlzLmQxMSArIHJ2bjMgKiB0aGlzLmQxMjtcbiAgICAgIHZhciBkTGltaXRJbXB1bHNlMyA9IHJ2bjEgKiB0aGlzLmQyMCArIHJ2bjIgKiB0aGlzLmQyMSArIHJ2bjMgKiB0aGlzLmQyMjtcblxuICAgICAgdGhpcy5saW1pdEltcHVsc2UxICs9IGRMaW1pdEltcHVsc2UxO1xuICAgICAgdGhpcy5saW1pdEltcHVsc2UyICs9IGRMaW1pdEltcHVsc2UyO1xuICAgICAgdGhpcy5saW1pdEltcHVsc2UzICs9IGRMaW1pdEltcHVsc2UzO1xuXG4gICAgICAvLyBjbGFtcFxuICAgICAgdmFyIGNsYW1wU3RhdGUgPSAwO1xuICAgICAgaWYgKHRoaXMubGltaXRTdGF0ZTEgPT0gMiB8fCB0aGlzLmxpbWl0SW1wdWxzZTEgKiB0aGlzLmxpbWl0U3RhdGUxIDwgMCkge1xuICAgICAgICBkTGltaXRJbXB1bHNlMSA9IC1vbGRMaW1pdEltcHVsc2UxO1xuICAgICAgICBydm4yICs9IGRMaW1pdEltcHVsc2UxICogdGhpcy5rMTA7XG4gICAgICAgIHJ2bjMgKz0gZExpbWl0SW1wdWxzZTEgKiB0aGlzLmsyMDtcbiAgICAgICAgY2xhbXBTdGF0ZSB8PSAxO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMubGltaXRTdGF0ZTIgPT0gMiB8fCB0aGlzLmxpbWl0SW1wdWxzZTIgKiB0aGlzLmxpbWl0U3RhdGUyIDwgMCkge1xuICAgICAgICBkTGltaXRJbXB1bHNlMiA9IC1vbGRMaW1pdEltcHVsc2UyO1xuICAgICAgICBydm4xICs9IGRMaW1pdEltcHVsc2UyICogdGhpcy5rMDE7XG4gICAgICAgIHJ2bjMgKz0gZExpbWl0SW1wdWxzZTIgKiB0aGlzLmsyMTtcbiAgICAgICAgY2xhbXBTdGF0ZSB8PSAyO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMubGltaXRTdGF0ZTMgPT0gMiB8fCB0aGlzLmxpbWl0SW1wdWxzZTMgKiB0aGlzLmxpbWl0U3RhdGUzIDwgMCkge1xuICAgICAgICBkTGltaXRJbXB1bHNlMyA9IC1vbGRMaW1pdEltcHVsc2UzO1xuICAgICAgICBydm4xICs9IGRMaW1pdEltcHVsc2UzICogdGhpcy5rMDI7XG4gICAgICAgIHJ2bjIgKz0gZExpbWl0SW1wdWxzZTMgKiB0aGlzLmsxMjtcbiAgICAgICAgY2xhbXBTdGF0ZSB8PSA0O1xuICAgICAgfVxuXG4gICAgICAvLyB1cGRhdGUgdW4tY2xhbXBlZCBpbXB1bHNlXG4gICAgICAvLyBUT0RPOiBpc29sYXRlIGRpdmlzaW9uXG4gICAgICB2YXIgZGV0O1xuICAgICAgc3dpdGNoIChjbGFtcFN0YXRlKSB7XG4gICAgICAgIGNhc2UgMTogLy8gdXBkYXRlIDIgM1xuICAgICAgICAgIGRldCA9IDEgLyAodGhpcy5rMTEgKiB0aGlzLmsyMiAtIHRoaXMuazEyICogdGhpcy5rMjEpO1xuICAgICAgICAgIGRMaW1pdEltcHVsc2UyID0gKHRoaXMuazIyICogcnZuMiArIC10aGlzLmsxMiAqIHJ2bjMpICogZGV0O1xuICAgICAgICAgIGRMaW1pdEltcHVsc2UzID0gKC10aGlzLmsyMSAqIHJ2bjIgKyB0aGlzLmsxMSAqIHJ2bjMpICogZGV0O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDI6IC8vIHVwZGF0ZSAxIDNcbiAgICAgICAgICBkZXQgPSAxIC8gKHRoaXMuazAwICogdGhpcy5rMjIgLSB0aGlzLmswMiAqIHRoaXMuazIwKTtcbiAgICAgICAgICBkTGltaXRJbXB1bHNlMSA9ICh0aGlzLmsyMiAqIHJ2bjEgKyAtdGhpcy5rMDIgKiBydm4zKSAqIGRldDtcbiAgICAgICAgICBkTGltaXRJbXB1bHNlMyA9ICgtdGhpcy5rMjAgKiBydm4xICsgdGhpcy5rMDAgKiBydm4zKSAqIGRldDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAzOiAvLyB1cGRhdGUgM1xuICAgICAgICAgIGRMaW1pdEltcHVsc2UzID0gcnZuMyAvIHRoaXMuazIyO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDQ6IC8vIHVwZGF0ZSAxIDJcbiAgICAgICAgICBkZXQgPSAxIC8gKHRoaXMuazAwICogdGhpcy5rMTEgLSB0aGlzLmswMSAqIHRoaXMuazEwKTtcbiAgICAgICAgICBkTGltaXRJbXB1bHNlMSA9ICh0aGlzLmsxMSAqIHJ2bjEgKyAtdGhpcy5rMDEgKiBydm4yKSAqIGRldDtcbiAgICAgICAgICBkTGltaXRJbXB1bHNlMiA9ICgtdGhpcy5rMTAgKiBydm4xICsgdGhpcy5rMDAgKiBydm4yKSAqIGRldDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA1OiAvLyB1cGRhdGUgMlxuICAgICAgICAgIGRMaW1pdEltcHVsc2UyID0gcnZuMiAvIHRoaXMuazExO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDY6IC8vIHVwZGF0ZSAxXG4gICAgICAgICAgZExpbWl0SW1wdWxzZTEgPSBydm4xIC8gdGhpcy5rMDA7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIHRoaXMubGltaXRJbXB1bHNlMSA9IGRMaW1pdEltcHVsc2UxICsgb2xkTGltaXRJbXB1bHNlMTtcbiAgICAgIHRoaXMubGltaXRJbXB1bHNlMiA9IGRMaW1pdEltcHVsc2UyICsgb2xkTGltaXRJbXB1bHNlMjtcbiAgICAgIHRoaXMubGltaXRJbXB1bHNlMyA9IGRMaW1pdEltcHVsc2UzICsgb2xkTGltaXRJbXB1bHNlMztcblxuICAgICAgdmFyIGRJbXB1bHNlMSA9IGRNb3RvckltcHVsc2UxICsgZExpbWl0SW1wdWxzZTE7XG4gICAgICB2YXIgZEltcHVsc2UyID0gZE1vdG9ySW1wdWxzZTIgKyBkTGltaXRJbXB1bHNlMjtcbiAgICAgIHZhciBkSW1wdWxzZTMgPSBkTW90b3JJbXB1bHNlMyArIGRMaW1pdEltcHVsc2UzO1xuXG4gICAgICAvLyBhcHBseSBpbXB1bHNlXG4gICAgICB0aGlzLmExLnggKz0gZEltcHVsc2UxICogdGhpcy5hMXgxICsgZEltcHVsc2UyICogdGhpcy5hMXgyICsgZEltcHVsc2UzICogdGhpcy5hMXgzO1xuICAgICAgdGhpcy5hMS55ICs9IGRJbXB1bHNlMSAqIHRoaXMuYTF5MSArIGRJbXB1bHNlMiAqIHRoaXMuYTF5MiArIGRJbXB1bHNlMyAqIHRoaXMuYTF5MztcbiAgICAgIHRoaXMuYTEueiArPSBkSW1wdWxzZTEgKiB0aGlzLmExejEgKyBkSW1wdWxzZTIgKiB0aGlzLmExejIgKyBkSW1wdWxzZTMgKiB0aGlzLmExejM7XG4gICAgICB0aGlzLmEyLnggLT0gZEltcHVsc2UxICogdGhpcy5hMngxICsgZEltcHVsc2UyICogdGhpcy5hMngyICsgZEltcHVsc2UzICogdGhpcy5hMngzO1xuICAgICAgdGhpcy5hMi55IC09IGRJbXB1bHNlMSAqIHRoaXMuYTJ5MSArIGRJbXB1bHNlMiAqIHRoaXMuYTJ5MiArIGRJbXB1bHNlMyAqIHRoaXMuYTJ5MztcbiAgICAgIHRoaXMuYTIueiAtPSBkSW1wdWxzZTEgKiB0aGlzLmEyejEgKyBkSW1wdWxzZTIgKiB0aGlzLmEyejIgKyBkSW1wdWxzZTMgKiB0aGlzLmEyejM7XG4gICAgICBydnggPSB0aGlzLmEyLnggLSB0aGlzLmExLng7XG4gICAgICBydnkgPSB0aGlzLmEyLnkgLSB0aGlzLmExLnk7XG4gICAgICBydnogPSB0aGlzLmEyLnogLSB0aGlzLmExLno7XG5cbiAgICAgIHJ2bjIgPSBydnggKiB0aGlzLmF4MiArIHJ2eSAqIHRoaXMuYXkyICsgcnZ6ICogdGhpcy5hejI7XG4gICAgfVxuXG4gIH0pO1xuXG4gIC8qKlxuICAgKiBBIGhpbmdlIGpvaW50IGFsbG93cyBvbmx5IGZvciByZWxhdGl2ZSByb3RhdGlvbiBvZiByaWdpZCBib2RpZXMgYWxvbmcgdGhlIGF4aXMuXG4gICAqXG4gICAqIEBhdXRob3Igc2FoYXJhblxuICAgKiBAYXV0aG9yIGxvLXRoXG4gICAqL1xuXG4gIGZ1bmN0aW9uIEhpbmdlSm9pbnQoY29uZmlnLCBsb3dlckFuZ2xlTGltaXQsIHVwcGVyQW5nbGVMaW1pdCkge1xuXG4gICAgSm9pbnQuY2FsbCh0aGlzLCBjb25maWcpO1xuXG4gICAgdGhpcy50eXBlID0gSk9JTlRfSElOR0U7XG5cbiAgICAvLyBUaGUgYXhpcyBpbiB0aGUgZmlyc3QgYm9keSdzIGNvb3JkaW5hdGUgc3lzdGVtLlxuICAgIHRoaXMubG9jYWxBeGlzMSA9IGNvbmZpZy5sb2NhbEF4aXMxLmNsb25lKCkubm9ybWFsaXplKCk7XG4gICAgLy8gVGhlIGF4aXMgaW4gdGhlIHNlY29uZCBib2R5J3MgY29vcmRpbmF0ZSBzeXN0ZW0uXG4gICAgdGhpcy5sb2NhbEF4aXMyID0gY29uZmlnLmxvY2FsQXhpczIuY2xvbmUoKS5ub3JtYWxpemUoKTtcblxuICAgIC8vIG1ha2UgYW5nbGUgYXhpc1xuICAgIHZhciBhcmMgPSBuZXcgTWF0MzMoKS5zZXRRdWF0KG5ldyBRdWF0KCkuc2V0RnJvbVVuaXRWZWN0b3JzKHRoaXMubG9jYWxBeGlzMSwgdGhpcy5sb2NhbEF4aXMyKSk7XG4gICAgdGhpcy5sb2NhbEFuZ2xlMSA9IG5ldyBWZWMzKCkudGFuZ2VudCh0aGlzLmxvY2FsQXhpczEpLm5vcm1hbGl6ZSgpO1xuICAgIHRoaXMubG9jYWxBbmdsZTIgPSB0aGlzLmxvY2FsQW5nbGUxLmNsb25lKCkuYXBwbHlNYXRyaXgzKGFyYywgdHJ1ZSk7XG5cbiAgICB0aGlzLmF4MSA9IG5ldyBWZWMzKCk7XG4gICAgdGhpcy5heDIgPSBuZXcgVmVjMygpO1xuICAgIHRoaXMuYW4xID0gbmV3IFZlYzMoKTtcbiAgICB0aGlzLmFuMiA9IG5ldyBWZWMzKCk7XG5cbiAgICB0aGlzLnRtcCA9IG5ldyBWZWMzKCk7XG5cbiAgICB0aGlzLm5vciA9IG5ldyBWZWMzKCk7XG4gICAgdGhpcy50YW4gPSBuZXcgVmVjMygpO1xuICAgIHRoaXMuYmluID0gbmV3IFZlYzMoKTtcblxuICAgIC8vIFRoZSByb3RhdGlvbmFsIGxpbWl0IGFuZCBtb3RvciBpbmZvcm1hdGlvbiBvZiB0aGUgam9pbnQuXG4gICAgdGhpcy5saW1pdE1vdG9yID0gbmV3IExpbWl0TW90b3IodGhpcy5ub3IsIGZhbHNlKTtcbiAgICB0aGlzLmxpbWl0TW90b3IubG93ZXJMaW1pdCA9IGxvd2VyQW5nbGVMaW1pdDtcbiAgICB0aGlzLmxpbWl0TW90b3IudXBwZXJMaW1pdCA9IHVwcGVyQW5nbGVMaW1pdDtcblxuICAgIHRoaXMubGMgPSBuZXcgTGluZWFyQ29uc3RyYWludCh0aGlzKTtcbiAgICB0aGlzLnIzID0gbmV3IFJvdGF0aW9uYWwzQ29uc3RyYWludCh0aGlzLCB0aGlzLmxpbWl0TW90b3IsIG5ldyBMaW1pdE1vdG9yKHRoaXMudGFuLCB0cnVlKSwgbmV3IExpbWl0TW90b3IodGhpcy5iaW4sIHRydWUpKTtcbiAgfVxuICBIaW5nZUpvaW50LnByb3RvdHlwZSA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmNyZWF0ZShKb2ludC5wcm90b3R5cGUpLCB7XG5cbiAgICBjb25zdHJ1Y3RvcjogSGluZ2VKb2ludCxcblxuXG4gICAgcHJlU29sdmU6IGZ1bmN0aW9uICh0aW1lU3RlcCwgaW52VGltZVN0ZXApIHtcblxuICAgICAgdGhpcy51cGRhdGVBbmNob3JQb2ludHMoKTtcblxuICAgICAgdGhpcy5heDEuY29weSh0aGlzLmxvY2FsQXhpczEpLmFwcGx5TWF0cml4Myh0aGlzLmJvZHkxLnJvdGF0aW9uLCB0cnVlKTtcbiAgICAgIHRoaXMuYXgyLmNvcHkodGhpcy5sb2NhbEF4aXMyKS5hcHBseU1hdHJpeDModGhpcy5ib2R5Mi5yb3RhdGlvbiwgdHJ1ZSk7XG5cbiAgICAgIHRoaXMuYW4xLmNvcHkodGhpcy5sb2NhbEFuZ2xlMSkuYXBwbHlNYXRyaXgzKHRoaXMuYm9keTEucm90YXRpb24sIHRydWUpO1xuICAgICAgdGhpcy5hbjIuY29weSh0aGlzLmxvY2FsQW5nbGUyKS5hcHBseU1hdHJpeDModGhpcy5ib2R5Mi5yb3RhdGlvbiwgdHJ1ZSk7XG5cbiAgICAgIC8vIG5vcm1hbCB0YW5nZW50IGJpbm9ybWFsXG5cbiAgICAgIHRoaXMubm9yLnNldChcbiAgICAgICAgdGhpcy5heDEueCAqIHRoaXMuYm9keTIuaW52ZXJzZU1hc3MgKyB0aGlzLmF4Mi54ICogdGhpcy5ib2R5MS5pbnZlcnNlTWFzcyxcbiAgICAgICAgdGhpcy5heDEueSAqIHRoaXMuYm9keTIuaW52ZXJzZU1hc3MgKyB0aGlzLmF4Mi55ICogdGhpcy5ib2R5MS5pbnZlcnNlTWFzcyxcbiAgICAgICAgdGhpcy5heDEueiAqIHRoaXMuYm9keTIuaW52ZXJzZU1hc3MgKyB0aGlzLmF4Mi56ICogdGhpcy5ib2R5MS5pbnZlcnNlTWFzc1xuICAgICAgKS5ub3JtYWxpemUoKTtcblxuICAgICAgdGhpcy50YW4udGFuZ2VudCh0aGlzLm5vcikubm9ybWFsaXplKCk7XG5cbiAgICAgIHRoaXMuYmluLmNyb3NzVmVjdG9ycyh0aGlzLm5vciwgdGhpcy50YW4pO1xuXG4gICAgICAvLyBjYWxjdWxhdGUgaGluZ2UgYW5nbGVcblxuICAgICAgdmFyIGxpbWl0ZSA9IF9NYXRoLmFjb3NDbGFtcChfTWF0aC5kb3RWZWN0b3JzKHRoaXMuYW4xLCB0aGlzLmFuMikpO1xuXG4gICAgICB0aGlzLnRtcC5jcm9zc1ZlY3RvcnModGhpcy5hbjEsIHRoaXMuYW4yKTtcblxuICAgICAgaWYgKF9NYXRoLmRvdFZlY3RvcnModGhpcy5ub3IsIHRoaXMudG1wKSA8IDApIHRoaXMubGltaXRNb3Rvci5hbmdsZSA9IC1saW1pdGU7XG4gICAgICBlbHNlIHRoaXMubGltaXRNb3Rvci5hbmdsZSA9IGxpbWl0ZTtcblxuICAgICAgdGhpcy50bXAuY3Jvc3NWZWN0b3JzKHRoaXMuYXgxLCB0aGlzLmF4Mik7XG5cbiAgICAgIHRoaXMucjMubGltaXRNb3RvcjIuYW5nbGUgPSBfTWF0aC5kb3RWZWN0b3JzKHRoaXMudGFuLCB0aGlzLnRtcCk7XG4gICAgICB0aGlzLnIzLmxpbWl0TW90b3IzLmFuZ2xlID0gX01hdGguZG90VmVjdG9ycyh0aGlzLmJpbiwgdGhpcy50bXApO1xuXG4gICAgICAvLyBwcmVTb2x2ZVxuXG4gICAgICB0aGlzLnIzLnByZVNvbHZlKHRpbWVTdGVwLCBpbnZUaW1lU3RlcCk7XG4gICAgICB0aGlzLmxjLnByZVNvbHZlKHRpbWVTdGVwLCBpbnZUaW1lU3RlcCk7XG5cbiAgICB9LFxuXG4gICAgc29sdmU6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgdGhpcy5yMy5zb2x2ZSgpO1xuICAgICAgdGhpcy5sYy5zb2x2ZSgpO1xuXG4gICAgfSxcblxuICAgIHBvc3RTb2x2ZTogZnVuY3Rpb24gKCkge1xuXG4gICAgfVxuXG4gIH0pO1xuXG4gIC8qKlxuICAgKiBBIGJhbGwtYW5kLXNvY2tldCBqb2ludCBsaW1pdHMgcmVsYXRpdmUgdHJhbnNsYXRpb24gb24gdHdvIGFuY2hvciBwb2ludHMgb24gcmlnaWQgYm9kaWVzLlxuICAgKlxuICAgKiBAYXV0aG9yIHNhaGFyYW5cbiAgICogQGF1dGhvciBsby10aFxuICAgKi9cblxuICBmdW5jdGlvbiBCYWxsQW5kU29ja2V0Sm9pbnQoY29uZmlnKSB7XG5cbiAgICBKb2ludC5jYWxsKHRoaXMsIGNvbmZpZyk7XG5cbiAgICB0aGlzLnR5cGUgPSBKT0lOVF9CQUxMX0FORF9TT0NLRVQ7XG5cbiAgICB0aGlzLmxjID0gbmV3IExpbmVhckNvbnN0cmFpbnQodGhpcyk7XG5cbiAgfVxuICBCYWxsQW5kU29ja2V0Sm9pbnQucHJvdG90eXBlID0gT2JqZWN0LmFzc2lnbihPYmplY3QuY3JlYXRlKEpvaW50LnByb3RvdHlwZSksIHtcblxuICAgIGNvbnN0cnVjdG9yOiBCYWxsQW5kU29ja2V0Sm9pbnQsXG5cbiAgICBwcmVTb2x2ZTogZnVuY3Rpb24gKHRpbWVTdGVwLCBpbnZUaW1lU3RlcCkge1xuXG4gICAgICB0aGlzLnVwZGF0ZUFuY2hvclBvaW50cygpO1xuXG4gICAgICAvLyBwcmVTb2x2ZVxuXG4gICAgICB0aGlzLmxjLnByZVNvbHZlKHRpbWVTdGVwLCBpbnZUaW1lU3RlcCk7XG5cbiAgICB9LFxuXG4gICAgc29sdmU6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgdGhpcy5sYy5zb2x2ZSgpO1xuXG4gICAgfSxcblxuICAgIHBvc3RTb2x2ZTogZnVuY3Rpb24gKCkge1xuXG4gICAgfVxuXG4gIH0pO1xuXG4gIC8qKlxuICAqIEEgdHJhbnNsYXRpb25hbCBjb25zdHJhaW50IGZvciB2YXJpb3VzIGpvaW50cy5cbiAgKiBAYXV0aG9yIHNhaGFyYW5cbiAgKi9cbiAgZnVuY3Rpb24gVHJhbnNsYXRpb25hbENvbnN0cmFpbnQoam9pbnQsIGxpbWl0TW90b3IpIHtcbiAgICB0aGlzLmNmbSA9IE5hTjtcbiAgICB0aGlzLm0xID0gTmFOO1xuICAgIHRoaXMubTIgPSBOYU47XG4gICAgdGhpcy5pMWUwMCA9IE5hTjtcbiAgICB0aGlzLmkxZTAxID0gTmFOO1xuICAgIHRoaXMuaTFlMDIgPSBOYU47XG4gICAgdGhpcy5pMWUxMCA9IE5hTjtcbiAgICB0aGlzLmkxZTExID0gTmFOO1xuICAgIHRoaXMuaTFlMTIgPSBOYU47XG4gICAgdGhpcy5pMWUyMCA9IE5hTjtcbiAgICB0aGlzLmkxZTIxID0gTmFOO1xuICAgIHRoaXMuaTFlMjIgPSBOYU47XG4gICAgdGhpcy5pMmUwMCA9IE5hTjtcbiAgICB0aGlzLmkyZTAxID0gTmFOO1xuICAgIHRoaXMuaTJlMDIgPSBOYU47XG4gICAgdGhpcy5pMmUxMCA9IE5hTjtcbiAgICB0aGlzLmkyZTExID0gTmFOO1xuICAgIHRoaXMuaTJlMTIgPSBOYU47XG4gICAgdGhpcy5pMmUyMCA9IE5hTjtcbiAgICB0aGlzLmkyZTIxID0gTmFOO1xuICAgIHRoaXMuaTJlMjIgPSBOYU47XG4gICAgdGhpcy5tb3RvckRlbm9tID0gTmFOO1xuICAgIHRoaXMuaW52TW90b3JEZW5vbSA9IE5hTjtcbiAgICB0aGlzLmludkRlbm9tID0gTmFOO1xuICAgIHRoaXMuYXggPSBOYU47XG4gICAgdGhpcy5heSA9IE5hTjtcbiAgICB0aGlzLmF6ID0gTmFOO1xuICAgIHRoaXMucjF4ID0gTmFOO1xuICAgIHRoaXMucjF5ID0gTmFOO1xuICAgIHRoaXMucjF6ID0gTmFOO1xuICAgIHRoaXMucjJ4ID0gTmFOO1xuICAgIHRoaXMucjJ5ID0gTmFOO1xuICAgIHRoaXMucjJ6ID0gTmFOO1xuICAgIHRoaXMudDF4ID0gTmFOO1xuICAgIHRoaXMudDF5ID0gTmFOO1xuICAgIHRoaXMudDF6ID0gTmFOO1xuICAgIHRoaXMudDJ4ID0gTmFOO1xuICAgIHRoaXMudDJ5ID0gTmFOO1xuICAgIHRoaXMudDJ6ID0gTmFOO1xuICAgIHRoaXMubDF4ID0gTmFOO1xuICAgIHRoaXMubDF5ID0gTmFOO1xuICAgIHRoaXMubDF6ID0gTmFOO1xuICAgIHRoaXMubDJ4ID0gTmFOO1xuICAgIHRoaXMubDJ5ID0gTmFOO1xuICAgIHRoaXMubDJ6ID0gTmFOO1xuICAgIHRoaXMuYTF4ID0gTmFOO1xuICAgIHRoaXMuYTF5ID0gTmFOO1xuICAgIHRoaXMuYTF6ID0gTmFOO1xuICAgIHRoaXMuYTJ4ID0gTmFOO1xuICAgIHRoaXMuYTJ5ID0gTmFOO1xuICAgIHRoaXMuYTJ6ID0gTmFOO1xuICAgIHRoaXMubG93ZXJMaW1pdCA9IE5hTjtcbiAgICB0aGlzLnVwcGVyTGltaXQgPSBOYU47XG4gICAgdGhpcy5saW1pdFZlbG9jaXR5ID0gTmFOO1xuICAgIHRoaXMubGltaXRTdGF0ZSA9IDA7IC8vIC0xOiBhdCBsb3dlciwgMDogbG9ja2VkLCAxOiBhdCB1cHBlciwgMjogZnJlZVxuICAgIHRoaXMuZW5hYmxlTW90b3IgPSBmYWxzZTtcbiAgICB0aGlzLm1vdG9yU3BlZWQgPSBOYU47XG4gICAgdGhpcy5tYXhNb3RvckZvcmNlID0gTmFOO1xuICAgIHRoaXMubWF4TW90b3JJbXB1bHNlID0gTmFOO1xuXG4gICAgdGhpcy5saW1pdE1vdG9yID0gbGltaXRNb3RvcjtcbiAgICB0aGlzLmIxID0gam9pbnQuYm9keTE7XG4gICAgdGhpcy5iMiA9IGpvaW50LmJvZHkyO1xuICAgIHRoaXMucDEgPSBqb2ludC5hbmNob3JQb2ludDE7XG4gICAgdGhpcy5wMiA9IGpvaW50LmFuY2hvclBvaW50MjtcbiAgICB0aGlzLnIxID0gam9pbnQucmVsYXRpdmVBbmNob3JQb2ludDE7XG4gICAgdGhpcy5yMiA9IGpvaW50LnJlbGF0aXZlQW5jaG9yUG9pbnQyO1xuICAgIHRoaXMubDEgPSB0aGlzLmIxLmxpbmVhclZlbG9jaXR5O1xuICAgIHRoaXMubDIgPSB0aGlzLmIyLmxpbmVhclZlbG9jaXR5O1xuICAgIHRoaXMuYTEgPSB0aGlzLmIxLmFuZ3VsYXJWZWxvY2l0eTtcbiAgICB0aGlzLmEyID0gdGhpcy5iMi5hbmd1bGFyVmVsb2NpdHk7XG4gICAgdGhpcy5pMSA9IHRoaXMuYjEuaW52ZXJzZUluZXJ0aWE7XG4gICAgdGhpcy5pMiA9IHRoaXMuYjIuaW52ZXJzZUluZXJ0aWE7XG4gICAgdGhpcy5saW1pdEltcHVsc2UgPSAwO1xuICAgIHRoaXMubW90b3JJbXB1bHNlID0gMDtcbiAgfVxuXG4gIE9iamVjdC5hc3NpZ24oVHJhbnNsYXRpb25hbENvbnN0cmFpbnQucHJvdG90eXBlLCB7XG5cbiAgICBUcmFuc2xhdGlvbmFsQ29uc3RyYWludDogdHJ1ZSxcblxuICAgIHByZVNvbHZlOiBmdW5jdGlvbiAodGltZVN0ZXAsIGludlRpbWVTdGVwKSB7XG4gICAgICB0aGlzLmF4ID0gdGhpcy5saW1pdE1vdG9yLmF4aXMueDtcbiAgICAgIHRoaXMuYXkgPSB0aGlzLmxpbWl0TW90b3IuYXhpcy55O1xuICAgICAgdGhpcy5heiA9IHRoaXMubGltaXRNb3Rvci5heGlzLno7XG4gICAgICB0aGlzLmxvd2VyTGltaXQgPSB0aGlzLmxpbWl0TW90b3IubG93ZXJMaW1pdDtcbiAgICAgIHRoaXMudXBwZXJMaW1pdCA9IHRoaXMubGltaXRNb3Rvci51cHBlckxpbWl0O1xuICAgICAgdGhpcy5tb3RvclNwZWVkID0gdGhpcy5saW1pdE1vdG9yLm1vdG9yU3BlZWQ7XG4gICAgICB0aGlzLm1heE1vdG9yRm9yY2UgPSB0aGlzLmxpbWl0TW90b3IubWF4TW90b3JGb3JjZTtcbiAgICAgIHRoaXMuZW5hYmxlTW90b3IgPSB0aGlzLm1heE1vdG9yRm9yY2UgPiAwO1xuICAgICAgdGhpcy5tMSA9IHRoaXMuYjEuaW52ZXJzZU1hc3M7XG4gICAgICB0aGlzLm0yID0gdGhpcy5iMi5pbnZlcnNlTWFzcztcblxuICAgICAgdmFyIHRpMSA9IHRoaXMuaTEuZWxlbWVudHM7XG4gICAgICB2YXIgdGkyID0gdGhpcy5pMi5lbGVtZW50cztcbiAgICAgIHRoaXMuaTFlMDAgPSB0aTFbMF07XG4gICAgICB0aGlzLmkxZTAxID0gdGkxWzFdO1xuICAgICAgdGhpcy5pMWUwMiA9IHRpMVsyXTtcbiAgICAgIHRoaXMuaTFlMTAgPSB0aTFbM107XG4gICAgICB0aGlzLmkxZTExID0gdGkxWzRdO1xuICAgICAgdGhpcy5pMWUxMiA9IHRpMVs1XTtcbiAgICAgIHRoaXMuaTFlMjAgPSB0aTFbNl07XG4gICAgICB0aGlzLmkxZTIxID0gdGkxWzddO1xuICAgICAgdGhpcy5pMWUyMiA9IHRpMVs4XTtcblxuICAgICAgdGhpcy5pMmUwMCA9IHRpMlswXTtcbiAgICAgIHRoaXMuaTJlMDEgPSB0aTJbMV07XG4gICAgICB0aGlzLmkyZTAyID0gdGkyWzJdO1xuICAgICAgdGhpcy5pMmUxMCA9IHRpMlszXTtcbiAgICAgIHRoaXMuaTJlMTEgPSB0aTJbNF07XG4gICAgICB0aGlzLmkyZTEyID0gdGkyWzVdO1xuICAgICAgdGhpcy5pMmUyMCA9IHRpMls2XTtcbiAgICAgIHRoaXMuaTJlMjEgPSB0aTJbN107XG4gICAgICB0aGlzLmkyZTIyID0gdGkyWzhdO1xuXG4gICAgICB2YXIgZHggPSB0aGlzLnAyLnggLSB0aGlzLnAxLng7XG4gICAgICB2YXIgZHkgPSB0aGlzLnAyLnkgLSB0aGlzLnAxLnk7XG4gICAgICB2YXIgZHogPSB0aGlzLnAyLnogLSB0aGlzLnAxLno7XG4gICAgICB2YXIgZCA9IGR4ICogdGhpcy5heCArIGR5ICogdGhpcy5heSArIGR6ICogdGhpcy5hejtcbiAgICAgIHZhciBmcmVxdWVuY3kgPSB0aGlzLmxpbWl0TW90b3IuZnJlcXVlbmN5O1xuICAgICAgdmFyIGVuYWJsZVNwcmluZyA9IGZyZXF1ZW5jeSA+IDA7XG4gICAgICB2YXIgZW5hYmxlTGltaXQgPSB0aGlzLmxvd2VyTGltaXQgPD0gdGhpcy51cHBlckxpbWl0O1xuICAgICAgaWYgKGVuYWJsZVNwcmluZyAmJiBkID4gMjAgfHwgZCA8IC0yMCkge1xuICAgICAgICBlbmFibGVTcHJpbmcgPSBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgaWYgKGVuYWJsZUxpbWl0KSB7XG4gICAgICAgIGlmICh0aGlzLmxvd2VyTGltaXQgPT0gdGhpcy51cHBlckxpbWl0KSB7XG4gICAgICAgICAgaWYgKHRoaXMubGltaXRTdGF0ZSAhPSAwKSB7XG4gICAgICAgICAgICB0aGlzLmxpbWl0U3RhdGUgPSAwO1xuICAgICAgICAgICAgdGhpcy5saW1pdEltcHVsc2UgPSAwO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLmxpbWl0VmVsb2NpdHkgPSB0aGlzLmxvd2VyTGltaXQgLSBkO1xuICAgICAgICAgIGlmICghZW5hYmxlU3ByaW5nKSBkID0gdGhpcy5sb3dlckxpbWl0O1xuICAgICAgICB9IGVsc2UgaWYgKGQgPCB0aGlzLmxvd2VyTGltaXQpIHtcbiAgICAgICAgICBpZiAodGhpcy5saW1pdFN0YXRlICE9IC0xKSB7XG4gICAgICAgICAgICB0aGlzLmxpbWl0U3RhdGUgPSAtMTtcbiAgICAgICAgICAgIHRoaXMubGltaXRJbXB1bHNlID0gMDtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5saW1pdFZlbG9jaXR5ID0gdGhpcy5sb3dlckxpbWl0IC0gZDtcbiAgICAgICAgICBpZiAoIWVuYWJsZVNwcmluZykgZCA9IHRoaXMubG93ZXJMaW1pdDtcbiAgICAgICAgfSBlbHNlIGlmIChkID4gdGhpcy51cHBlckxpbWl0KSB7XG4gICAgICAgICAgaWYgKHRoaXMubGltaXRTdGF0ZSAhPSAxKSB7XG4gICAgICAgICAgICB0aGlzLmxpbWl0U3RhdGUgPSAxO1xuICAgICAgICAgICAgdGhpcy5saW1pdEltcHVsc2UgPSAwO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLmxpbWl0VmVsb2NpdHkgPSB0aGlzLnVwcGVyTGltaXQgLSBkO1xuICAgICAgICAgIGlmICghZW5hYmxlU3ByaW5nKSBkID0gdGhpcy51cHBlckxpbWl0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMubGltaXRTdGF0ZSA9IDI7XG4gICAgICAgICAgdGhpcy5saW1pdEltcHVsc2UgPSAwO1xuICAgICAgICAgIHRoaXMubGltaXRWZWxvY2l0eSA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFlbmFibGVTcHJpbmcpIHtcbiAgICAgICAgICBpZiAodGhpcy5saW1pdFZlbG9jaXR5ID4gMC4wMDUpIHRoaXMubGltaXRWZWxvY2l0eSAtPSAwLjAwNTtcbiAgICAgICAgICBlbHNlIGlmICh0aGlzLmxpbWl0VmVsb2NpdHkgPCAtMC4wMDUpIHRoaXMubGltaXRWZWxvY2l0eSArPSAwLjAwNTtcbiAgICAgICAgICBlbHNlIHRoaXMubGltaXRWZWxvY2l0eSA9IDA7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMubGltaXRTdGF0ZSA9IDI7XG4gICAgICAgIHRoaXMubGltaXRJbXB1bHNlID0gMDtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuZW5hYmxlTW90b3IgJiYgKHRoaXMubGltaXRTdGF0ZSAhPSAwIHx8IGVuYWJsZVNwcmluZykpIHtcbiAgICAgICAgdGhpcy5tYXhNb3RvckltcHVsc2UgPSB0aGlzLm1heE1vdG9yRm9yY2UgKiB0aW1lU3RlcDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMubW90b3JJbXB1bHNlID0gMDtcbiAgICAgICAgdGhpcy5tYXhNb3RvckltcHVsc2UgPSAwO1xuICAgICAgfVxuXG4gICAgICB2YXIgcmR4ID0gZCAqIHRoaXMuYXg7XG4gICAgICB2YXIgcmR5ID0gZCAqIHRoaXMuYXk7XG4gICAgICB2YXIgcmR6ID0gZCAqIHRoaXMuYXo7XG4gICAgICB2YXIgdzEgPSB0aGlzLm0xIC8gKHRoaXMubTEgKyB0aGlzLm0yKTtcbiAgICAgIHZhciB3MiA9IDEgLSB3MTtcbiAgICAgIHRoaXMucjF4ID0gdGhpcy5yMS54ICsgcmR4ICogdzE7XG4gICAgICB0aGlzLnIxeSA9IHRoaXMucjEueSArIHJkeSAqIHcxO1xuICAgICAgdGhpcy5yMXogPSB0aGlzLnIxLnogKyByZHogKiB3MTtcbiAgICAgIHRoaXMucjJ4ID0gdGhpcy5yMi54IC0gcmR4ICogdzI7XG4gICAgICB0aGlzLnIyeSA9IHRoaXMucjIueSAtIHJkeSAqIHcyO1xuICAgICAgdGhpcy5yMnogPSB0aGlzLnIyLnogLSByZHogKiB3MjtcblxuICAgICAgdGhpcy50MXggPSB0aGlzLnIxeSAqIHRoaXMuYXogLSB0aGlzLnIxeiAqIHRoaXMuYXk7XG4gICAgICB0aGlzLnQxeSA9IHRoaXMucjF6ICogdGhpcy5heCAtIHRoaXMucjF4ICogdGhpcy5hejtcbiAgICAgIHRoaXMudDF6ID0gdGhpcy5yMXggKiB0aGlzLmF5IC0gdGhpcy5yMXkgKiB0aGlzLmF4O1xuICAgICAgdGhpcy50MnggPSB0aGlzLnIyeSAqIHRoaXMuYXogLSB0aGlzLnIyeiAqIHRoaXMuYXk7XG4gICAgICB0aGlzLnQyeSA9IHRoaXMucjJ6ICogdGhpcy5heCAtIHRoaXMucjJ4ICogdGhpcy5hejtcbiAgICAgIHRoaXMudDJ6ID0gdGhpcy5yMnggKiB0aGlzLmF5IC0gdGhpcy5yMnkgKiB0aGlzLmF4O1xuICAgICAgdGhpcy5sMXggPSB0aGlzLmF4ICogdGhpcy5tMTtcbiAgICAgIHRoaXMubDF5ID0gdGhpcy5heSAqIHRoaXMubTE7XG4gICAgICB0aGlzLmwxeiA9IHRoaXMuYXogKiB0aGlzLm0xO1xuICAgICAgdGhpcy5sMnggPSB0aGlzLmF4ICogdGhpcy5tMjtcbiAgICAgIHRoaXMubDJ5ID0gdGhpcy5heSAqIHRoaXMubTI7XG4gICAgICB0aGlzLmwyeiA9IHRoaXMuYXogKiB0aGlzLm0yO1xuICAgICAgdGhpcy5hMXggPSB0aGlzLnQxeCAqIHRoaXMuaTFlMDAgKyB0aGlzLnQxeSAqIHRoaXMuaTFlMDEgKyB0aGlzLnQxeiAqIHRoaXMuaTFlMDI7XG4gICAgICB0aGlzLmExeSA9IHRoaXMudDF4ICogdGhpcy5pMWUxMCArIHRoaXMudDF5ICogdGhpcy5pMWUxMSArIHRoaXMudDF6ICogdGhpcy5pMWUxMjtcbiAgICAgIHRoaXMuYTF6ID0gdGhpcy50MXggKiB0aGlzLmkxZTIwICsgdGhpcy50MXkgKiB0aGlzLmkxZTIxICsgdGhpcy50MXogKiB0aGlzLmkxZTIyO1xuICAgICAgdGhpcy5hMnggPSB0aGlzLnQyeCAqIHRoaXMuaTJlMDAgKyB0aGlzLnQyeSAqIHRoaXMuaTJlMDEgKyB0aGlzLnQyeiAqIHRoaXMuaTJlMDI7XG4gICAgICB0aGlzLmEyeSA9IHRoaXMudDJ4ICogdGhpcy5pMmUxMCArIHRoaXMudDJ5ICogdGhpcy5pMmUxMSArIHRoaXMudDJ6ICogdGhpcy5pMmUxMjtcbiAgICAgIHRoaXMuYTJ6ID0gdGhpcy50MnggKiB0aGlzLmkyZTIwICsgdGhpcy50MnkgKiB0aGlzLmkyZTIxICsgdGhpcy50MnogKiB0aGlzLmkyZTIyO1xuICAgICAgdGhpcy5tb3RvckRlbm9tID1cbiAgICAgICAgdGhpcy5tMSArIHRoaXMubTIgK1xuICAgICAgICB0aGlzLmF4ICogKHRoaXMuYTF5ICogdGhpcy5yMXogLSB0aGlzLmExeiAqIHRoaXMucjF5ICsgdGhpcy5hMnkgKiB0aGlzLnIyeiAtIHRoaXMuYTJ6ICogdGhpcy5yMnkpICtcbiAgICAgICAgdGhpcy5heSAqICh0aGlzLmExeiAqIHRoaXMucjF4IC0gdGhpcy5hMXggKiB0aGlzLnIxeiArIHRoaXMuYTJ6ICogdGhpcy5yMnggLSB0aGlzLmEyeCAqIHRoaXMucjJ6KSArXG4gICAgICAgIHRoaXMuYXogKiAodGhpcy5hMXggKiB0aGlzLnIxeSAtIHRoaXMuYTF5ICogdGhpcy5yMXggKyB0aGlzLmEyeCAqIHRoaXMucjJ5IC0gdGhpcy5hMnkgKiB0aGlzLnIyeCk7XG5cbiAgICAgIHRoaXMuaW52TW90b3JEZW5vbSA9IDEgLyB0aGlzLm1vdG9yRGVub207XG5cbiAgICAgIGlmIChlbmFibGVTcHJpbmcgJiYgdGhpcy5saW1pdFN0YXRlICE9IDIpIHtcbiAgICAgICAgdmFyIG9tZWdhID0gNi4yODMxODUzICogZnJlcXVlbmN5O1xuICAgICAgICB2YXIgayA9IG9tZWdhICogb21lZ2EgKiB0aW1lU3RlcDtcbiAgICAgICAgdmFyIGRtcCA9IGludlRpbWVTdGVwIC8gKGsgKyAyICogdGhpcy5saW1pdE1vdG9yLmRhbXBpbmdSYXRpbyAqIG9tZWdhKTtcbiAgICAgICAgdGhpcy5jZm0gPSB0aGlzLm1vdG9yRGVub20gKiBkbXA7XG4gICAgICAgIHRoaXMubGltaXRWZWxvY2l0eSAqPSBrICogZG1wO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5jZm0gPSAwO1xuICAgICAgICB0aGlzLmxpbWl0VmVsb2NpdHkgKj0gaW52VGltZVN0ZXAgKiAwLjA1O1xuICAgICAgfVxuXG4gICAgICB0aGlzLmludkRlbm9tID0gMSAvICh0aGlzLm1vdG9yRGVub20gKyB0aGlzLmNmbSk7XG5cbiAgICAgIHZhciB0b3RhbEltcHVsc2UgPSB0aGlzLmxpbWl0SW1wdWxzZSArIHRoaXMubW90b3JJbXB1bHNlO1xuICAgICAgdGhpcy5sMS54ICs9IHRvdGFsSW1wdWxzZSAqIHRoaXMubDF4O1xuICAgICAgdGhpcy5sMS55ICs9IHRvdGFsSW1wdWxzZSAqIHRoaXMubDF5O1xuICAgICAgdGhpcy5sMS56ICs9IHRvdGFsSW1wdWxzZSAqIHRoaXMubDF6O1xuICAgICAgdGhpcy5hMS54ICs9IHRvdGFsSW1wdWxzZSAqIHRoaXMuYTF4O1xuICAgICAgdGhpcy5hMS55ICs9IHRvdGFsSW1wdWxzZSAqIHRoaXMuYTF5O1xuICAgICAgdGhpcy5hMS56ICs9IHRvdGFsSW1wdWxzZSAqIHRoaXMuYTF6O1xuICAgICAgdGhpcy5sMi54IC09IHRvdGFsSW1wdWxzZSAqIHRoaXMubDJ4O1xuICAgICAgdGhpcy5sMi55IC09IHRvdGFsSW1wdWxzZSAqIHRoaXMubDJ5O1xuICAgICAgdGhpcy5sMi56IC09IHRvdGFsSW1wdWxzZSAqIHRoaXMubDJ6O1xuICAgICAgdGhpcy5hMi54IC09IHRvdGFsSW1wdWxzZSAqIHRoaXMuYTJ4O1xuICAgICAgdGhpcy5hMi55IC09IHRvdGFsSW1wdWxzZSAqIHRoaXMuYTJ5O1xuICAgICAgdGhpcy5hMi56IC09IHRvdGFsSW1wdWxzZSAqIHRoaXMuYTJ6O1xuICAgIH0sXG4gICAgc29sdmU6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBydm4gPVxuICAgICAgICB0aGlzLmF4ICogKHRoaXMubDIueCAtIHRoaXMubDEueCkgKyB0aGlzLmF5ICogKHRoaXMubDIueSAtIHRoaXMubDEueSkgKyB0aGlzLmF6ICogKHRoaXMubDIueiAtIHRoaXMubDEueikgK1xuICAgICAgICB0aGlzLnQyeCAqIHRoaXMuYTIueCAtIHRoaXMudDF4ICogdGhpcy5hMS54ICsgdGhpcy50MnkgKiB0aGlzLmEyLnkgLSB0aGlzLnQxeSAqIHRoaXMuYTEueSArIHRoaXMudDJ6ICogdGhpcy5hMi56IC0gdGhpcy50MXogKiB0aGlzLmExLno7XG5cbiAgICAgIC8vIG1vdG9yIHBhcnRcbiAgICAgIHZhciBuZXdNb3RvckltcHVsc2U7XG4gICAgICBpZiAodGhpcy5lbmFibGVNb3Rvcikge1xuICAgICAgICBuZXdNb3RvckltcHVsc2UgPSAocnZuIC0gdGhpcy5tb3RvclNwZWVkKSAqIHRoaXMuaW52TW90b3JEZW5vbTtcbiAgICAgICAgdmFyIG9sZE1vdG9ySW1wdWxzZSA9IHRoaXMubW90b3JJbXB1bHNlO1xuICAgICAgICB0aGlzLm1vdG9ySW1wdWxzZSArPSBuZXdNb3RvckltcHVsc2U7XG4gICAgICAgIGlmICh0aGlzLm1vdG9ySW1wdWxzZSA+IHRoaXMubWF4TW90b3JJbXB1bHNlKSB0aGlzLm1vdG9ySW1wdWxzZSA9IHRoaXMubWF4TW90b3JJbXB1bHNlO1xuICAgICAgICBlbHNlIGlmICh0aGlzLm1vdG9ySW1wdWxzZSA8IC10aGlzLm1heE1vdG9ySW1wdWxzZSkgdGhpcy5tb3RvckltcHVsc2UgPSAtdGhpcy5tYXhNb3RvckltcHVsc2U7XG4gICAgICAgIG5ld01vdG9ySW1wdWxzZSA9IHRoaXMubW90b3JJbXB1bHNlIC0gb2xkTW90b3JJbXB1bHNlO1xuICAgICAgICBydm4gLT0gbmV3TW90b3JJbXB1bHNlICogdGhpcy5tb3RvckRlbm9tO1xuICAgICAgfSBlbHNlIG5ld01vdG9ySW1wdWxzZSA9IDA7XG5cbiAgICAgIC8vIGxpbWl0IHBhcnRcbiAgICAgIHZhciBuZXdMaW1pdEltcHVsc2U7XG4gICAgICBpZiAodGhpcy5saW1pdFN0YXRlICE9IDIpIHtcbiAgICAgICAgbmV3TGltaXRJbXB1bHNlID0gKHJ2biAtIHRoaXMubGltaXRWZWxvY2l0eSAtIHRoaXMubGltaXRJbXB1bHNlICogdGhpcy5jZm0pICogdGhpcy5pbnZEZW5vbTtcbiAgICAgICAgdmFyIG9sZExpbWl0SW1wdWxzZSA9IHRoaXMubGltaXRJbXB1bHNlO1xuICAgICAgICB0aGlzLmxpbWl0SW1wdWxzZSArPSBuZXdMaW1pdEltcHVsc2U7XG4gICAgICAgIGlmICh0aGlzLmxpbWl0SW1wdWxzZSAqIHRoaXMubGltaXRTdGF0ZSA8IDApIHRoaXMubGltaXRJbXB1bHNlID0gMDtcbiAgICAgICAgbmV3TGltaXRJbXB1bHNlID0gdGhpcy5saW1pdEltcHVsc2UgLSBvbGRMaW1pdEltcHVsc2U7XG4gICAgICB9IGVsc2UgbmV3TGltaXRJbXB1bHNlID0gMDtcblxuICAgICAgdmFyIHRvdGFsSW1wdWxzZSA9IG5ld0xpbWl0SW1wdWxzZSArIG5ld01vdG9ySW1wdWxzZTtcbiAgICAgIHRoaXMubDEueCArPSB0b3RhbEltcHVsc2UgKiB0aGlzLmwxeDtcbiAgICAgIHRoaXMubDEueSArPSB0b3RhbEltcHVsc2UgKiB0aGlzLmwxeTtcbiAgICAgIHRoaXMubDEueiArPSB0b3RhbEltcHVsc2UgKiB0aGlzLmwxejtcbiAgICAgIHRoaXMuYTEueCArPSB0b3RhbEltcHVsc2UgKiB0aGlzLmExeDtcbiAgICAgIHRoaXMuYTEueSArPSB0b3RhbEltcHVsc2UgKiB0aGlzLmExeTtcbiAgICAgIHRoaXMuYTEueiArPSB0b3RhbEltcHVsc2UgKiB0aGlzLmExejtcbiAgICAgIHRoaXMubDIueCAtPSB0b3RhbEltcHVsc2UgKiB0aGlzLmwyeDtcbiAgICAgIHRoaXMubDIueSAtPSB0b3RhbEltcHVsc2UgKiB0aGlzLmwyeTtcbiAgICAgIHRoaXMubDIueiAtPSB0b3RhbEltcHVsc2UgKiB0aGlzLmwyejtcbiAgICAgIHRoaXMuYTIueCAtPSB0b3RhbEltcHVsc2UgKiB0aGlzLmEyeDtcbiAgICAgIHRoaXMuYTIueSAtPSB0b3RhbEltcHVsc2UgKiB0aGlzLmEyeTtcbiAgICAgIHRoaXMuYTIueiAtPSB0b3RhbEltcHVsc2UgKiB0aGlzLmEyejtcbiAgICB9XG4gIH0pO1xuXG4gIC8qKlxuICAgKiBBIGRpc3RhbmNlIGpvaW50IGxpbWl0cyB0aGUgZGlzdGFuY2UgYmV0d2VlbiB0d28gYW5jaG9yIHBvaW50cyBvbiByaWdpZCBib2RpZXMuXG4gICAqXG4gICAqIEBhdXRob3Igc2FoYXJhblxuICAgKiBAYXV0aG9yIGxvLXRoXG4gICAqL1xuXG4gIGZ1bmN0aW9uIERpc3RhbmNlSm9pbnQoY29uZmlnLCBtaW5EaXN0YW5jZSwgbWF4RGlzdGFuY2UpIHtcblxuICAgIEpvaW50LmNhbGwodGhpcywgY29uZmlnKTtcblxuICAgIHRoaXMudHlwZSA9IEpPSU5UX0RJU1RBTkNFO1xuXG4gICAgdGhpcy5ub3IgPSBuZXcgVmVjMygpO1xuXG4gICAgLy8gVGhlIGxpbWl0IGFuZCBtb3RvciBpbmZvcm1hdGlvbiBvZiB0aGUgam9pbnQuXG4gICAgdGhpcy5saW1pdE1vdG9yID0gbmV3IExpbWl0TW90b3IodGhpcy5ub3IsIHRydWUpO1xuICAgIHRoaXMubGltaXRNb3Rvci5sb3dlckxpbWl0ID0gbWluRGlzdGFuY2U7XG4gICAgdGhpcy5saW1pdE1vdG9yLnVwcGVyTGltaXQgPSBtYXhEaXN0YW5jZTtcblxuICAgIHRoaXMudCA9IG5ldyBUcmFuc2xhdGlvbmFsQ29uc3RyYWludCh0aGlzLCB0aGlzLmxpbWl0TW90b3IpO1xuXG4gIH1cbiAgRGlzdGFuY2VKb2ludC5wcm90b3R5cGUgPSBPYmplY3QuYXNzaWduKE9iamVjdC5jcmVhdGUoSm9pbnQucHJvdG90eXBlKSwge1xuXG4gICAgY29uc3RydWN0b3I6IERpc3RhbmNlSm9pbnQsXG5cbiAgICBwcmVTb2x2ZTogZnVuY3Rpb24gKHRpbWVTdGVwLCBpbnZUaW1lU3RlcCkge1xuXG4gICAgICB0aGlzLnVwZGF0ZUFuY2hvclBvaW50cygpO1xuXG4gICAgICB0aGlzLm5vci5zdWIodGhpcy5hbmNob3JQb2ludDIsIHRoaXMuYW5jaG9yUG9pbnQxKS5ub3JtYWxpemUoKTtcblxuICAgICAgLy8gcHJlU29sdmVcblxuICAgICAgdGhpcy50LnByZVNvbHZlKHRpbWVTdGVwLCBpbnZUaW1lU3RlcCk7XG5cbiAgICB9LFxuXG4gICAgc29sdmU6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgdGhpcy50LnNvbHZlKCk7XG5cbiAgICB9LFxuXG4gICAgcG9zdFNvbHZlOiBmdW5jdGlvbiAoKSB7XG5cbiAgICB9XG5cbiAgfSk7XG5cbiAgLyoqXG4gICogQW4gYW5ndWxhciBjb25zdHJhaW50IGZvciBhbGwgYXhlcyBmb3IgdmFyaW91cyBqb2ludHMuXG4gICogQGF1dGhvciBzYWhhcmFuXG4gICovXG5cbiAgZnVuY3Rpb24gQW5ndWxhckNvbnN0cmFpbnQoam9pbnQsIHRhcmdldE9yaWVudGF0aW9uKSB7XG5cbiAgICB0aGlzLmpvaW50ID0gam9pbnQ7XG5cbiAgICB0aGlzLnRhcmdldE9yaWVudGF0aW9uID0gbmV3IFF1YXQoKS5pbnZlcnQodGFyZ2V0T3JpZW50YXRpb24pO1xuXG4gICAgdGhpcy5yZWxhdGl2ZU9yaWVudGF0aW9uID0gbmV3IFF1YXQoKTtcblxuICAgIHRoaXMuaWkxID0gbnVsbDtcbiAgICB0aGlzLmlpMiA9IG51bGw7XG4gICAgdGhpcy5kZCA9IG51bGw7XG5cbiAgICB0aGlzLnZlbCA9IG5ldyBWZWMzKCk7XG4gICAgdGhpcy5pbXAgPSBuZXcgVmVjMygpO1xuXG4gICAgdGhpcy5ybjAgPSBuZXcgVmVjMygpO1xuICAgIHRoaXMucm4xID0gbmV3IFZlYzMoKTtcbiAgICB0aGlzLnJuMiA9IG5ldyBWZWMzKCk7XG5cbiAgICB0aGlzLmIxID0gam9pbnQuYm9keTE7XG4gICAgdGhpcy5iMiA9IGpvaW50LmJvZHkyO1xuICAgIHRoaXMuYTEgPSB0aGlzLmIxLmFuZ3VsYXJWZWxvY2l0eTtcbiAgICB0aGlzLmEyID0gdGhpcy5iMi5hbmd1bGFyVmVsb2NpdHk7XG4gICAgdGhpcy5pMSA9IHRoaXMuYjEuaW52ZXJzZUluZXJ0aWE7XG4gICAgdGhpcy5pMiA9IHRoaXMuYjIuaW52ZXJzZUluZXJ0aWE7XG5cbiAgfVxuICBPYmplY3QuYXNzaWduKEFuZ3VsYXJDb25zdHJhaW50LnByb3RvdHlwZSwge1xuXG4gICAgQW5ndWxhckNvbnN0cmFpbnQ6IHRydWUsXG5cbiAgICBwcmVTb2x2ZTogZnVuY3Rpb24gKHRpbWVTdGVwLCBpbnZUaW1lU3RlcCkge1xuXG4gICAgICB2YXIgaW52LCBsZW4sIHY7XG5cbiAgICAgIHRoaXMuaWkxID0gdGhpcy5pMS5jbG9uZSgpO1xuICAgICAgdGhpcy5paTIgPSB0aGlzLmkyLmNsb25lKCk7XG5cbiAgICAgIHYgPSBuZXcgTWF0MzMoKS5hZGQodGhpcy5paTEsIHRoaXMuaWkyKS5lbGVtZW50cztcbiAgICAgIGludiA9IDEgLyAodlswXSAqICh2WzRdICogdls4XSAtIHZbN10gKiB2WzVdKSArIHZbM10gKiAodls3XSAqIHZbMl0gLSB2WzFdICogdls4XSkgKyB2WzZdICogKHZbMV0gKiB2WzVdIC0gdls0XSAqIHZbMl0pKTtcbiAgICAgIHRoaXMuZGQgPSBuZXcgTWF0MzMoKS5zZXQoXG4gICAgICAgIHZbNF0gKiB2WzhdIC0gdls1XSAqIHZbN10sIHZbMl0gKiB2WzddIC0gdlsxXSAqIHZbOF0sIHZbMV0gKiB2WzVdIC0gdlsyXSAqIHZbNF0sXG4gICAgICAgIHZbNV0gKiB2WzZdIC0gdlszXSAqIHZbOF0sIHZbMF0gKiB2WzhdIC0gdlsyXSAqIHZbNl0sIHZbMl0gKiB2WzNdIC0gdlswXSAqIHZbNV0sXG4gICAgICAgIHZbM10gKiB2WzddIC0gdls0XSAqIHZbNl0sIHZbMV0gKiB2WzZdIC0gdlswXSAqIHZbN10sIHZbMF0gKiB2WzRdIC0gdlsxXSAqIHZbM11cbiAgICAgICkubXVsdGlwbHlTY2FsYXIoaW52KTtcblxuICAgICAgdGhpcy5yZWxhdGl2ZU9yaWVudGF0aW9uLmludmVydCh0aGlzLmIxLm9yaWVudGF0aW9uKS5tdWx0aXBseSh0aGlzLnRhcmdldE9yaWVudGF0aW9uKS5tdWx0aXBseSh0aGlzLmIyLm9yaWVudGF0aW9uKTtcblxuICAgICAgaW52ID0gdGhpcy5yZWxhdGl2ZU9yaWVudGF0aW9uLncgKiAyO1xuXG4gICAgICB0aGlzLnZlbC5jb3B5KHRoaXMucmVsYXRpdmVPcmllbnRhdGlvbikubXVsdGlwbHlTY2FsYXIoaW52KTtcblxuICAgICAgbGVuID0gdGhpcy52ZWwubGVuZ3RoKCk7XG5cbiAgICAgIGlmIChsZW4gPiAwLjAyKSB7XG4gICAgICAgIGxlbiA9ICgwLjAyIC0gbGVuKSAvIGxlbiAqIGludlRpbWVTdGVwICogMC4wNTtcbiAgICAgICAgdGhpcy52ZWwubXVsdGlwbHlTY2FsYXIobGVuKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMudmVsLnNldCgwLCAwLCAwKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5ybjEuY29weSh0aGlzLmltcCkuYXBwbHlNYXRyaXgzKHRoaXMuaWkxLCB0cnVlKTtcbiAgICAgIHRoaXMucm4yLmNvcHkodGhpcy5pbXApLmFwcGx5TWF0cml4Myh0aGlzLmlpMiwgdHJ1ZSk7XG5cbiAgICAgIHRoaXMuYTEuYWRkKHRoaXMucm4xKTtcbiAgICAgIHRoaXMuYTIuc3ViKHRoaXMucm4yKTtcblxuICAgIH0sXG5cbiAgICBzb2x2ZTogZnVuY3Rpb24gKCkge1xuXG4gICAgICB2YXIgciA9IHRoaXMuYTIuY2xvbmUoKS5zdWIodGhpcy5hMSkuc3ViKHRoaXMudmVsKTtcblxuICAgICAgdGhpcy5ybjAuY29weShyKS5hcHBseU1hdHJpeDModGhpcy5kZCwgdHJ1ZSk7XG4gICAgICB0aGlzLnJuMS5jb3B5KHRoaXMucm4wKS5hcHBseU1hdHJpeDModGhpcy5paTEsIHRydWUpO1xuICAgICAgdGhpcy5ybjIuY29weSh0aGlzLnJuMCkuYXBwbHlNYXRyaXgzKHRoaXMuaWkyLCB0cnVlKTtcblxuICAgICAgdGhpcy5pbXAuYWRkKHRoaXMucm4wKTtcbiAgICAgIHRoaXMuYTEuYWRkKHRoaXMucm4xKTtcbiAgICAgIHRoaXMuYTIuc3ViKHRoaXMucm4yKTtcblxuICAgIH1cblxuICB9KTtcblxuICAvKipcbiAgKiBBIHRocmVlLWF4aXMgdHJhbnNsYXRpb25hbCBjb25zdHJhaW50IGZvciB2YXJpb3VzIGpvaW50cy5cbiAgKiBAYXV0aG9yIHNhaGFyYW5cbiAgKi9cbiAgZnVuY3Rpb24gVHJhbnNsYXRpb25hbDNDb25zdHJhaW50KGpvaW50LCBsaW1pdE1vdG9yMSwgbGltaXRNb3RvcjIsIGxpbWl0TW90b3IzKSB7XG5cbiAgICB0aGlzLm0xID0gTmFOO1xuICAgIHRoaXMubTIgPSBOYU47XG4gICAgdGhpcy5pMWUwMCA9IE5hTjtcbiAgICB0aGlzLmkxZTAxID0gTmFOO1xuICAgIHRoaXMuaTFlMDIgPSBOYU47XG4gICAgdGhpcy5pMWUxMCA9IE5hTjtcbiAgICB0aGlzLmkxZTExID0gTmFOO1xuICAgIHRoaXMuaTFlMTIgPSBOYU47XG4gICAgdGhpcy5pMWUyMCA9IE5hTjtcbiAgICB0aGlzLmkxZTIxID0gTmFOO1xuICAgIHRoaXMuaTFlMjIgPSBOYU47XG4gICAgdGhpcy5pMmUwMCA9IE5hTjtcbiAgICB0aGlzLmkyZTAxID0gTmFOO1xuICAgIHRoaXMuaTJlMDIgPSBOYU47XG4gICAgdGhpcy5pMmUxMCA9IE5hTjtcbiAgICB0aGlzLmkyZTExID0gTmFOO1xuICAgIHRoaXMuaTJlMTIgPSBOYU47XG4gICAgdGhpcy5pMmUyMCA9IE5hTjtcbiAgICB0aGlzLmkyZTIxID0gTmFOO1xuICAgIHRoaXMuaTJlMjIgPSBOYU47XG4gICAgdGhpcy5heDEgPSBOYU47XG4gICAgdGhpcy5heTEgPSBOYU47XG4gICAgdGhpcy5hejEgPSBOYU47XG4gICAgdGhpcy5heDIgPSBOYU47XG4gICAgdGhpcy5heTIgPSBOYU47XG4gICAgdGhpcy5hejIgPSBOYU47XG4gICAgdGhpcy5heDMgPSBOYU47XG4gICAgdGhpcy5heTMgPSBOYU47XG4gICAgdGhpcy5hejMgPSBOYU47XG4gICAgdGhpcy5yMXggPSBOYU47XG4gICAgdGhpcy5yMXkgPSBOYU47XG4gICAgdGhpcy5yMXogPSBOYU47XG4gICAgdGhpcy5yMnggPSBOYU47XG4gICAgdGhpcy5yMnkgPSBOYU47XG4gICAgdGhpcy5yMnogPSBOYU47XG4gICAgdGhpcy50MXgxID0gTmFOOy8vIGphY29iaWFuc1xuICAgIHRoaXMudDF5MSA9IE5hTjtcbiAgICB0aGlzLnQxejEgPSBOYU47XG4gICAgdGhpcy50MngxID0gTmFOO1xuICAgIHRoaXMudDJ5MSA9IE5hTjtcbiAgICB0aGlzLnQyejEgPSBOYU47XG4gICAgdGhpcy5sMXgxID0gTmFOO1xuICAgIHRoaXMubDF5MSA9IE5hTjtcbiAgICB0aGlzLmwxejEgPSBOYU47XG4gICAgdGhpcy5sMngxID0gTmFOO1xuICAgIHRoaXMubDJ5MSA9IE5hTjtcbiAgICB0aGlzLmwyejEgPSBOYU47XG4gICAgdGhpcy5hMXgxID0gTmFOO1xuICAgIHRoaXMuYTF5MSA9IE5hTjtcbiAgICB0aGlzLmExejEgPSBOYU47XG4gICAgdGhpcy5hMngxID0gTmFOO1xuICAgIHRoaXMuYTJ5MSA9IE5hTjtcbiAgICB0aGlzLmEyejEgPSBOYU47XG4gICAgdGhpcy50MXgyID0gTmFOO1xuICAgIHRoaXMudDF5MiA9IE5hTjtcbiAgICB0aGlzLnQxejIgPSBOYU47XG4gICAgdGhpcy50MngyID0gTmFOO1xuICAgIHRoaXMudDJ5MiA9IE5hTjtcbiAgICB0aGlzLnQyejIgPSBOYU47XG4gICAgdGhpcy5sMXgyID0gTmFOO1xuICAgIHRoaXMubDF5MiA9IE5hTjtcbiAgICB0aGlzLmwxejIgPSBOYU47XG4gICAgdGhpcy5sMngyID0gTmFOO1xuICAgIHRoaXMubDJ5MiA9IE5hTjtcbiAgICB0aGlzLmwyejIgPSBOYU47XG4gICAgdGhpcy5hMXgyID0gTmFOO1xuICAgIHRoaXMuYTF5MiA9IE5hTjtcbiAgICB0aGlzLmExejIgPSBOYU47XG4gICAgdGhpcy5hMngyID0gTmFOO1xuICAgIHRoaXMuYTJ5MiA9IE5hTjtcbiAgICB0aGlzLmEyejIgPSBOYU47XG4gICAgdGhpcy50MXgzID0gTmFOO1xuICAgIHRoaXMudDF5MyA9IE5hTjtcbiAgICB0aGlzLnQxejMgPSBOYU47XG4gICAgdGhpcy50MngzID0gTmFOO1xuICAgIHRoaXMudDJ5MyA9IE5hTjtcbiAgICB0aGlzLnQyejMgPSBOYU47XG4gICAgdGhpcy5sMXgzID0gTmFOO1xuICAgIHRoaXMubDF5MyA9IE5hTjtcbiAgICB0aGlzLmwxejMgPSBOYU47XG4gICAgdGhpcy5sMngzID0gTmFOO1xuICAgIHRoaXMubDJ5MyA9IE5hTjtcbiAgICB0aGlzLmwyejMgPSBOYU47XG4gICAgdGhpcy5hMXgzID0gTmFOO1xuICAgIHRoaXMuYTF5MyA9IE5hTjtcbiAgICB0aGlzLmExejMgPSBOYU47XG4gICAgdGhpcy5hMngzID0gTmFOO1xuICAgIHRoaXMuYTJ5MyA9IE5hTjtcbiAgICB0aGlzLmEyejMgPSBOYU47XG4gICAgdGhpcy5sb3dlckxpbWl0MSA9IE5hTjtcbiAgICB0aGlzLnVwcGVyTGltaXQxID0gTmFOO1xuICAgIHRoaXMubGltaXRWZWxvY2l0eTEgPSBOYU47XG4gICAgdGhpcy5saW1pdFN0YXRlMSA9IDA7IC8vIC0xOiBhdCBsb3dlciwgMDogbG9ja2VkLCAxOiBhdCB1cHBlciwgMjogdW5saW1pdGVkXG4gICAgdGhpcy5lbmFibGVNb3RvcjEgPSBmYWxzZTtcbiAgICB0aGlzLm1vdG9yU3BlZWQxID0gTmFOO1xuICAgIHRoaXMubWF4TW90b3JGb3JjZTEgPSBOYU47XG4gICAgdGhpcy5tYXhNb3RvckltcHVsc2UxID0gTmFOO1xuICAgIHRoaXMubG93ZXJMaW1pdDIgPSBOYU47XG4gICAgdGhpcy51cHBlckxpbWl0MiA9IE5hTjtcbiAgICB0aGlzLmxpbWl0VmVsb2NpdHkyID0gTmFOO1xuICAgIHRoaXMubGltaXRTdGF0ZTIgPSAwOyAvLyAtMTogYXQgbG93ZXIsIDA6IGxvY2tlZCwgMTogYXQgdXBwZXIsIDI6IHVubGltaXRlZFxuICAgIHRoaXMuZW5hYmxlTW90b3IyID0gZmFsc2U7XG4gICAgdGhpcy5tb3RvclNwZWVkMiA9IE5hTjtcbiAgICB0aGlzLm1heE1vdG9yRm9yY2UyID0gTmFOO1xuICAgIHRoaXMubWF4TW90b3JJbXB1bHNlMiA9IE5hTjtcbiAgICB0aGlzLmxvd2VyTGltaXQzID0gTmFOO1xuICAgIHRoaXMudXBwZXJMaW1pdDMgPSBOYU47XG4gICAgdGhpcy5saW1pdFZlbG9jaXR5MyA9IE5hTjtcbiAgICB0aGlzLmxpbWl0U3RhdGUzID0gMDsgLy8gLTE6IGF0IGxvd2VyLCAwOiBsb2NrZWQsIDE6IGF0IHVwcGVyLCAyOiB1bmxpbWl0ZWRcbiAgICB0aGlzLmVuYWJsZU1vdG9yMyA9IGZhbHNlO1xuICAgIHRoaXMubW90b3JTcGVlZDMgPSBOYU47XG4gICAgdGhpcy5tYXhNb3RvckZvcmNlMyA9IE5hTjtcbiAgICB0aGlzLm1heE1vdG9ySW1wdWxzZTMgPSBOYU47XG4gICAgdGhpcy5rMDAgPSBOYU47IC8vIEsgPSBKKk0qSlRcbiAgICB0aGlzLmswMSA9IE5hTjtcbiAgICB0aGlzLmswMiA9IE5hTjtcbiAgICB0aGlzLmsxMCA9IE5hTjtcbiAgICB0aGlzLmsxMSA9IE5hTjtcbiAgICB0aGlzLmsxMiA9IE5hTjtcbiAgICB0aGlzLmsyMCA9IE5hTjtcbiAgICB0aGlzLmsyMSA9IE5hTjtcbiAgICB0aGlzLmsyMiA9IE5hTjtcbiAgICB0aGlzLmt2MDAgPSBOYU47IC8vIGRpYWdvbmFscyB3aXRob3V0IENGTXNcbiAgICB0aGlzLmt2MTEgPSBOYU47XG4gICAgdGhpcy5rdjIyID0gTmFOO1xuICAgIHRoaXMuZHYwMCA9IE5hTjsgLy8gLi4uaW52ZXJ0ZWRcbiAgICB0aGlzLmR2MTEgPSBOYU47XG4gICAgdGhpcy5kdjIyID0gTmFOO1xuICAgIHRoaXMuZDAwID0gTmFOOyAvLyBLXi0xXG4gICAgdGhpcy5kMDEgPSBOYU47XG4gICAgdGhpcy5kMDIgPSBOYU47XG4gICAgdGhpcy5kMTAgPSBOYU47XG4gICAgdGhpcy5kMTEgPSBOYU47XG4gICAgdGhpcy5kMTIgPSBOYU47XG4gICAgdGhpcy5kMjAgPSBOYU47XG4gICAgdGhpcy5kMjEgPSBOYU47XG4gICAgdGhpcy5kMjIgPSBOYU47XG5cbiAgICB0aGlzLmxpbWl0TW90b3IxID0gbGltaXRNb3RvcjE7XG4gICAgdGhpcy5saW1pdE1vdG9yMiA9IGxpbWl0TW90b3IyO1xuICAgIHRoaXMubGltaXRNb3RvcjMgPSBsaW1pdE1vdG9yMztcbiAgICB0aGlzLmIxID0gam9pbnQuYm9keTE7XG4gICAgdGhpcy5iMiA9IGpvaW50LmJvZHkyO1xuICAgIHRoaXMucDEgPSBqb2ludC5hbmNob3JQb2ludDE7XG4gICAgdGhpcy5wMiA9IGpvaW50LmFuY2hvclBvaW50MjtcbiAgICB0aGlzLnIxID0gam9pbnQucmVsYXRpdmVBbmNob3JQb2ludDE7XG4gICAgdGhpcy5yMiA9IGpvaW50LnJlbGF0aXZlQW5jaG9yUG9pbnQyO1xuICAgIHRoaXMubDEgPSB0aGlzLmIxLmxpbmVhclZlbG9jaXR5O1xuICAgIHRoaXMubDIgPSB0aGlzLmIyLmxpbmVhclZlbG9jaXR5O1xuICAgIHRoaXMuYTEgPSB0aGlzLmIxLmFuZ3VsYXJWZWxvY2l0eTtcbiAgICB0aGlzLmEyID0gdGhpcy5iMi5hbmd1bGFyVmVsb2NpdHk7XG4gICAgdGhpcy5pMSA9IHRoaXMuYjEuaW52ZXJzZUluZXJ0aWE7XG4gICAgdGhpcy5pMiA9IHRoaXMuYjIuaW52ZXJzZUluZXJ0aWE7XG4gICAgdGhpcy5saW1pdEltcHVsc2UxID0gMDtcbiAgICB0aGlzLm1vdG9ySW1wdWxzZTEgPSAwO1xuICAgIHRoaXMubGltaXRJbXB1bHNlMiA9IDA7XG4gICAgdGhpcy5tb3RvckltcHVsc2UyID0gMDtcbiAgICB0aGlzLmxpbWl0SW1wdWxzZTMgPSAwO1xuICAgIHRoaXMubW90b3JJbXB1bHNlMyA9IDA7XG4gICAgdGhpcy5jZm0xID0gMDsvLyBDb25zdHJhaW50IEZvcmNlIE1peGluZ1xuICAgIHRoaXMuY2ZtMiA9IDA7XG4gICAgdGhpcy5jZm0zID0gMDtcbiAgICB0aGlzLndlaWdodCA9IC0xO1xuICB9XG5cbiAgT2JqZWN0LmFzc2lnbihUcmFuc2xhdGlvbmFsM0NvbnN0cmFpbnQucHJvdG90eXBlLCB7XG5cbiAgICBUcmFuc2xhdGlvbmFsM0NvbnN0cmFpbnQ6IHRydWUsXG5cbiAgICBwcmVTb2x2ZTogZnVuY3Rpb24gKHRpbWVTdGVwLCBpbnZUaW1lU3RlcCkge1xuICAgICAgdGhpcy5heDEgPSB0aGlzLmxpbWl0TW90b3IxLmF4aXMueDtcbiAgICAgIHRoaXMuYXkxID0gdGhpcy5saW1pdE1vdG9yMS5heGlzLnk7XG4gICAgICB0aGlzLmF6MSA9IHRoaXMubGltaXRNb3RvcjEuYXhpcy56O1xuICAgICAgdGhpcy5heDIgPSB0aGlzLmxpbWl0TW90b3IyLmF4aXMueDtcbiAgICAgIHRoaXMuYXkyID0gdGhpcy5saW1pdE1vdG9yMi5heGlzLnk7XG4gICAgICB0aGlzLmF6MiA9IHRoaXMubGltaXRNb3RvcjIuYXhpcy56O1xuICAgICAgdGhpcy5heDMgPSB0aGlzLmxpbWl0TW90b3IzLmF4aXMueDtcbiAgICAgIHRoaXMuYXkzID0gdGhpcy5saW1pdE1vdG9yMy5heGlzLnk7XG4gICAgICB0aGlzLmF6MyA9IHRoaXMubGltaXRNb3RvcjMuYXhpcy56O1xuICAgICAgdGhpcy5sb3dlckxpbWl0MSA9IHRoaXMubGltaXRNb3RvcjEubG93ZXJMaW1pdDtcbiAgICAgIHRoaXMudXBwZXJMaW1pdDEgPSB0aGlzLmxpbWl0TW90b3IxLnVwcGVyTGltaXQ7XG4gICAgICB0aGlzLm1vdG9yU3BlZWQxID0gdGhpcy5saW1pdE1vdG9yMS5tb3RvclNwZWVkO1xuICAgICAgdGhpcy5tYXhNb3RvckZvcmNlMSA9IHRoaXMubGltaXRNb3RvcjEubWF4TW90b3JGb3JjZTtcbiAgICAgIHRoaXMuZW5hYmxlTW90b3IxID0gdGhpcy5tYXhNb3RvckZvcmNlMSA+IDA7XG4gICAgICB0aGlzLmxvd2VyTGltaXQyID0gdGhpcy5saW1pdE1vdG9yMi5sb3dlckxpbWl0O1xuICAgICAgdGhpcy51cHBlckxpbWl0MiA9IHRoaXMubGltaXRNb3RvcjIudXBwZXJMaW1pdDtcbiAgICAgIHRoaXMubW90b3JTcGVlZDIgPSB0aGlzLmxpbWl0TW90b3IyLm1vdG9yU3BlZWQ7XG4gICAgICB0aGlzLm1heE1vdG9yRm9yY2UyID0gdGhpcy5saW1pdE1vdG9yMi5tYXhNb3RvckZvcmNlO1xuICAgICAgdGhpcy5lbmFibGVNb3RvcjIgPSB0aGlzLm1heE1vdG9yRm9yY2UyID4gMDtcbiAgICAgIHRoaXMubG93ZXJMaW1pdDMgPSB0aGlzLmxpbWl0TW90b3IzLmxvd2VyTGltaXQ7XG4gICAgICB0aGlzLnVwcGVyTGltaXQzID0gdGhpcy5saW1pdE1vdG9yMy51cHBlckxpbWl0O1xuICAgICAgdGhpcy5tb3RvclNwZWVkMyA9IHRoaXMubGltaXRNb3RvcjMubW90b3JTcGVlZDtcbiAgICAgIHRoaXMubWF4TW90b3JGb3JjZTMgPSB0aGlzLmxpbWl0TW90b3IzLm1heE1vdG9yRm9yY2U7XG4gICAgICB0aGlzLmVuYWJsZU1vdG9yMyA9IHRoaXMubWF4TW90b3JGb3JjZTMgPiAwO1xuICAgICAgdGhpcy5tMSA9IHRoaXMuYjEuaW52ZXJzZU1hc3M7XG4gICAgICB0aGlzLm0yID0gdGhpcy5iMi5pbnZlcnNlTWFzcztcblxuICAgICAgdmFyIHRpMSA9IHRoaXMuaTEuZWxlbWVudHM7XG4gICAgICB2YXIgdGkyID0gdGhpcy5pMi5lbGVtZW50cztcbiAgICAgIHRoaXMuaTFlMDAgPSB0aTFbMF07XG4gICAgICB0aGlzLmkxZTAxID0gdGkxWzFdO1xuICAgICAgdGhpcy5pMWUwMiA9IHRpMVsyXTtcbiAgICAgIHRoaXMuaTFlMTAgPSB0aTFbM107XG4gICAgICB0aGlzLmkxZTExID0gdGkxWzRdO1xuICAgICAgdGhpcy5pMWUxMiA9IHRpMVs1XTtcbiAgICAgIHRoaXMuaTFlMjAgPSB0aTFbNl07XG4gICAgICB0aGlzLmkxZTIxID0gdGkxWzddO1xuICAgICAgdGhpcy5pMWUyMiA9IHRpMVs4XTtcblxuICAgICAgdGhpcy5pMmUwMCA9IHRpMlswXTtcbiAgICAgIHRoaXMuaTJlMDEgPSB0aTJbMV07XG4gICAgICB0aGlzLmkyZTAyID0gdGkyWzJdO1xuICAgICAgdGhpcy5pMmUxMCA9IHRpMlszXTtcbiAgICAgIHRoaXMuaTJlMTEgPSB0aTJbNF07XG4gICAgICB0aGlzLmkyZTEyID0gdGkyWzVdO1xuICAgICAgdGhpcy5pMmUyMCA9IHRpMls2XTtcbiAgICAgIHRoaXMuaTJlMjEgPSB0aTJbN107XG4gICAgICB0aGlzLmkyZTIyID0gdGkyWzhdO1xuXG4gICAgICB2YXIgZHggPSB0aGlzLnAyLnggLSB0aGlzLnAxLng7XG4gICAgICB2YXIgZHkgPSB0aGlzLnAyLnkgLSB0aGlzLnAxLnk7XG4gICAgICB2YXIgZHogPSB0aGlzLnAyLnogLSB0aGlzLnAxLno7XG4gICAgICB2YXIgZDEgPSBkeCAqIHRoaXMuYXgxICsgZHkgKiB0aGlzLmF5MSArIGR6ICogdGhpcy5hejE7XG4gICAgICB2YXIgZDIgPSBkeCAqIHRoaXMuYXgyICsgZHkgKiB0aGlzLmF5MiArIGR6ICogdGhpcy5hejI7XG4gICAgICB2YXIgZDMgPSBkeCAqIHRoaXMuYXgzICsgZHkgKiB0aGlzLmF5MyArIGR6ICogdGhpcy5hejM7XG4gICAgICB2YXIgZnJlcXVlbmN5MSA9IHRoaXMubGltaXRNb3RvcjEuZnJlcXVlbmN5O1xuICAgICAgdmFyIGZyZXF1ZW5jeTIgPSB0aGlzLmxpbWl0TW90b3IyLmZyZXF1ZW5jeTtcbiAgICAgIHZhciBmcmVxdWVuY3kzID0gdGhpcy5saW1pdE1vdG9yMy5mcmVxdWVuY3k7XG4gICAgICB2YXIgZW5hYmxlU3ByaW5nMSA9IGZyZXF1ZW5jeTEgPiAwO1xuICAgICAgdmFyIGVuYWJsZVNwcmluZzIgPSBmcmVxdWVuY3kyID4gMDtcbiAgICAgIHZhciBlbmFibGVTcHJpbmczID0gZnJlcXVlbmN5MyA+IDA7XG4gICAgICB2YXIgZW5hYmxlTGltaXQxID0gdGhpcy5sb3dlckxpbWl0MSA8PSB0aGlzLnVwcGVyTGltaXQxO1xuICAgICAgdmFyIGVuYWJsZUxpbWl0MiA9IHRoaXMubG93ZXJMaW1pdDIgPD0gdGhpcy51cHBlckxpbWl0MjtcbiAgICAgIHZhciBlbmFibGVMaW1pdDMgPSB0aGlzLmxvd2VyTGltaXQzIDw9IHRoaXMudXBwZXJMaW1pdDM7XG5cbiAgICAgIC8vIGZvciBzdGFiaWxpdHlcbiAgICAgIGlmIChlbmFibGVTcHJpbmcxICYmIGQxID4gMjAgfHwgZDEgPCAtMjApIHtcbiAgICAgICAgZW5hYmxlU3ByaW5nMSA9IGZhbHNlO1xuICAgICAgfVxuICAgICAgaWYgKGVuYWJsZVNwcmluZzIgJiYgZDIgPiAyMCB8fCBkMiA8IC0yMCkge1xuICAgICAgICBlbmFibGVTcHJpbmcyID0gZmFsc2U7XG4gICAgICB9XG4gICAgICBpZiAoZW5hYmxlU3ByaW5nMyAmJiBkMyA+IDIwIHx8IGQzIDwgLTIwKSB7XG4gICAgICAgIGVuYWJsZVNwcmluZzMgPSBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgaWYgKGVuYWJsZUxpbWl0MSkge1xuICAgICAgICBpZiAodGhpcy5sb3dlckxpbWl0MSA9PSB0aGlzLnVwcGVyTGltaXQxKSB7XG4gICAgICAgICAgaWYgKHRoaXMubGltaXRTdGF0ZTEgIT0gMCkge1xuICAgICAgICAgICAgdGhpcy5saW1pdFN0YXRlMSA9IDA7XG4gICAgICAgICAgICB0aGlzLmxpbWl0SW1wdWxzZTEgPSAwO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLmxpbWl0VmVsb2NpdHkxID0gdGhpcy5sb3dlckxpbWl0MSAtIGQxO1xuICAgICAgICAgIGlmICghZW5hYmxlU3ByaW5nMSkgZDEgPSB0aGlzLmxvd2VyTGltaXQxO1xuICAgICAgICB9IGVsc2UgaWYgKGQxIDwgdGhpcy5sb3dlckxpbWl0MSkge1xuICAgICAgICAgIGlmICh0aGlzLmxpbWl0U3RhdGUxICE9IC0xKSB7XG4gICAgICAgICAgICB0aGlzLmxpbWl0U3RhdGUxID0gLTE7XG4gICAgICAgICAgICB0aGlzLmxpbWl0SW1wdWxzZTEgPSAwO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLmxpbWl0VmVsb2NpdHkxID0gdGhpcy5sb3dlckxpbWl0MSAtIGQxO1xuICAgICAgICAgIGlmICghZW5hYmxlU3ByaW5nMSkgZDEgPSB0aGlzLmxvd2VyTGltaXQxO1xuICAgICAgICB9IGVsc2UgaWYgKGQxID4gdGhpcy51cHBlckxpbWl0MSkge1xuICAgICAgICAgIGlmICh0aGlzLmxpbWl0U3RhdGUxICE9IDEpIHtcbiAgICAgICAgICAgIHRoaXMubGltaXRTdGF0ZTEgPSAxO1xuICAgICAgICAgICAgdGhpcy5saW1pdEltcHVsc2UxID0gMDtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5saW1pdFZlbG9jaXR5MSA9IHRoaXMudXBwZXJMaW1pdDEgLSBkMTtcbiAgICAgICAgICBpZiAoIWVuYWJsZVNwcmluZzEpIGQxID0gdGhpcy51cHBlckxpbWl0MTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLmxpbWl0U3RhdGUxID0gMjtcbiAgICAgICAgICB0aGlzLmxpbWl0SW1wdWxzZTEgPSAwO1xuICAgICAgICAgIHRoaXMubGltaXRWZWxvY2l0eTEgPSAwO1xuICAgICAgICB9XG4gICAgICAgIGlmICghZW5hYmxlU3ByaW5nMSkge1xuICAgICAgICAgIGlmICh0aGlzLmxpbWl0VmVsb2NpdHkxID4gMC4wMDUpIHRoaXMubGltaXRWZWxvY2l0eTEgLT0gMC4wMDU7XG4gICAgICAgICAgZWxzZSBpZiAodGhpcy5saW1pdFZlbG9jaXR5MSA8IC0wLjAwNSkgdGhpcy5saW1pdFZlbG9jaXR5MSArPSAwLjAwNTtcbiAgICAgICAgICBlbHNlIHRoaXMubGltaXRWZWxvY2l0eTEgPSAwO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmxpbWl0U3RhdGUxID0gMjtcbiAgICAgICAgdGhpcy5saW1pdEltcHVsc2UxID0gMDtcbiAgICAgIH1cblxuICAgICAgaWYgKGVuYWJsZUxpbWl0Mikge1xuICAgICAgICBpZiAodGhpcy5sb3dlckxpbWl0MiA9PSB0aGlzLnVwcGVyTGltaXQyKSB7XG4gICAgICAgICAgaWYgKHRoaXMubGltaXRTdGF0ZTIgIT0gMCkge1xuICAgICAgICAgICAgdGhpcy5saW1pdFN0YXRlMiA9IDA7XG4gICAgICAgICAgICB0aGlzLmxpbWl0SW1wdWxzZTIgPSAwO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLmxpbWl0VmVsb2NpdHkyID0gdGhpcy5sb3dlckxpbWl0MiAtIGQyO1xuICAgICAgICAgIGlmICghZW5hYmxlU3ByaW5nMikgZDIgPSB0aGlzLmxvd2VyTGltaXQyO1xuICAgICAgICB9IGVsc2UgaWYgKGQyIDwgdGhpcy5sb3dlckxpbWl0Mikge1xuICAgICAgICAgIGlmICh0aGlzLmxpbWl0U3RhdGUyICE9IC0xKSB7XG4gICAgICAgICAgICB0aGlzLmxpbWl0U3RhdGUyID0gLTE7XG4gICAgICAgICAgICB0aGlzLmxpbWl0SW1wdWxzZTIgPSAwO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLmxpbWl0VmVsb2NpdHkyID0gdGhpcy5sb3dlckxpbWl0MiAtIGQyO1xuICAgICAgICAgIGlmICghZW5hYmxlU3ByaW5nMikgZDIgPSB0aGlzLmxvd2VyTGltaXQyO1xuICAgICAgICB9IGVsc2UgaWYgKGQyID4gdGhpcy51cHBlckxpbWl0Mikge1xuICAgICAgICAgIGlmICh0aGlzLmxpbWl0U3RhdGUyICE9IDEpIHtcbiAgICAgICAgICAgIHRoaXMubGltaXRTdGF0ZTIgPSAxO1xuICAgICAgICAgICAgdGhpcy5saW1pdEltcHVsc2UyID0gMDtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5saW1pdFZlbG9jaXR5MiA9IHRoaXMudXBwZXJMaW1pdDIgLSBkMjtcbiAgICAgICAgICBpZiAoIWVuYWJsZVNwcmluZzIpIGQyID0gdGhpcy51cHBlckxpbWl0MjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLmxpbWl0U3RhdGUyID0gMjtcbiAgICAgICAgICB0aGlzLmxpbWl0SW1wdWxzZTIgPSAwO1xuICAgICAgICAgIHRoaXMubGltaXRWZWxvY2l0eTIgPSAwO1xuICAgICAgICB9XG4gICAgICAgIGlmICghZW5hYmxlU3ByaW5nMikge1xuICAgICAgICAgIGlmICh0aGlzLmxpbWl0VmVsb2NpdHkyID4gMC4wMDUpIHRoaXMubGltaXRWZWxvY2l0eTIgLT0gMC4wMDU7XG4gICAgICAgICAgZWxzZSBpZiAodGhpcy5saW1pdFZlbG9jaXR5MiA8IC0wLjAwNSkgdGhpcy5saW1pdFZlbG9jaXR5MiArPSAwLjAwNTtcbiAgICAgICAgICBlbHNlIHRoaXMubGltaXRWZWxvY2l0eTIgPSAwO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmxpbWl0U3RhdGUyID0gMjtcbiAgICAgICAgdGhpcy5saW1pdEltcHVsc2UyID0gMDtcbiAgICAgIH1cblxuICAgICAgaWYgKGVuYWJsZUxpbWl0Mykge1xuICAgICAgICBpZiAodGhpcy5sb3dlckxpbWl0MyA9PSB0aGlzLnVwcGVyTGltaXQzKSB7XG4gICAgICAgICAgaWYgKHRoaXMubGltaXRTdGF0ZTMgIT0gMCkge1xuICAgICAgICAgICAgdGhpcy5saW1pdFN0YXRlMyA9IDA7XG4gICAgICAgICAgICB0aGlzLmxpbWl0SW1wdWxzZTMgPSAwO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLmxpbWl0VmVsb2NpdHkzID0gdGhpcy5sb3dlckxpbWl0MyAtIGQzO1xuICAgICAgICAgIGlmICghZW5hYmxlU3ByaW5nMykgZDMgPSB0aGlzLmxvd2VyTGltaXQzO1xuICAgICAgICB9IGVsc2UgaWYgKGQzIDwgdGhpcy5sb3dlckxpbWl0Mykge1xuICAgICAgICAgIGlmICh0aGlzLmxpbWl0U3RhdGUzICE9IC0xKSB7XG4gICAgICAgICAgICB0aGlzLmxpbWl0U3RhdGUzID0gLTE7XG4gICAgICAgICAgICB0aGlzLmxpbWl0SW1wdWxzZTMgPSAwO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLmxpbWl0VmVsb2NpdHkzID0gdGhpcy5sb3dlckxpbWl0MyAtIGQzO1xuICAgICAgICAgIGlmICghZW5hYmxlU3ByaW5nMykgZDMgPSB0aGlzLmxvd2VyTGltaXQzO1xuICAgICAgICB9IGVsc2UgaWYgKGQzID4gdGhpcy51cHBlckxpbWl0Mykge1xuICAgICAgICAgIGlmICh0aGlzLmxpbWl0U3RhdGUzICE9IDEpIHtcbiAgICAgICAgICAgIHRoaXMubGltaXRTdGF0ZTMgPSAxO1xuICAgICAgICAgICAgdGhpcy5saW1pdEltcHVsc2UzID0gMDtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5saW1pdFZlbG9jaXR5MyA9IHRoaXMudXBwZXJMaW1pdDMgLSBkMztcbiAgICAgICAgICBpZiAoIWVuYWJsZVNwcmluZzMpIGQzID0gdGhpcy51cHBlckxpbWl0MztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLmxpbWl0U3RhdGUzID0gMjtcbiAgICAgICAgICB0aGlzLmxpbWl0SW1wdWxzZTMgPSAwO1xuICAgICAgICAgIHRoaXMubGltaXRWZWxvY2l0eTMgPSAwO1xuICAgICAgICB9XG4gICAgICAgIGlmICghZW5hYmxlU3ByaW5nMykge1xuICAgICAgICAgIGlmICh0aGlzLmxpbWl0VmVsb2NpdHkzID4gMC4wMDUpIHRoaXMubGltaXRWZWxvY2l0eTMgLT0gMC4wMDU7XG4gICAgICAgICAgZWxzZSBpZiAodGhpcy5saW1pdFZlbG9jaXR5MyA8IC0wLjAwNSkgdGhpcy5saW1pdFZlbG9jaXR5MyArPSAwLjAwNTtcbiAgICAgICAgICBlbHNlIHRoaXMubGltaXRWZWxvY2l0eTMgPSAwO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmxpbWl0U3RhdGUzID0gMjtcbiAgICAgICAgdGhpcy5saW1pdEltcHVsc2UzID0gMDtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuZW5hYmxlTW90b3IxICYmICh0aGlzLmxpbWl0U3RhdGUxICE9IDAgfHwgZW5hYmxlU3ByaW5nMSkpIHtcbiAgICAgICAgdGhpcy5tYXhNb3RvckltcHVsc2UxID0gdGhpcy5tYXhNb3RvckZvcmNlMSAqIHRpbWVTdGVwO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5tb3RvckltcHVsc2UxID0gMDtcbiAgICAgICAgdGhpcy5tYXhNb3RvckltcHVsc2UxID0gMDtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuZW5hYmxlTW90b3IyICYmICh0aGlzLmxpbWl0U3RhdGUyICE9IDAgfHwgZW5hYmxlU3ByaW5nMikpIHtcbiAgICAgICAgdGhpcy5tYXhNb3RvckltcHVsc2UyID0gdGhpcy5tYXhNb3RvckZvcmNlMiAqIHRpbWVTdGVwO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5tb3RvckltcHVsc2UyID0gMDtcbiAgICAgICAgdGhpcy5tYXhNb3RvckltcHVsc2UyID0gMDtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuZW5hYmxlTW90b3IzICYmICh0aGlzLmxpbWl0U3RhdGUzICE9IDAgfHwgZW5hYmxlU3ByaW5nMykpIHtcbiAgICAgICAgdGhpcy5tYXhNb3RvckltcHVsc2UzID0gdGhpcy5tYXhNb3RvckZvcmNlMyAqIHRpbWVTdGVwO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5tb3RvckltcHVsc2UzID0gMDtcbiAgICAgICAgdGhpcy5tYXhNb3RvckltcHVsc2UzID0gMDtcbiAgICAgIH1cblxuICAgICAgdmFyIHJkeCA9IGQxICogdGhpcy5heDEgKyBkMiAqIHRoaXMuYXgyICsgZDMgKiB0aGlzLmF4MjtcbiAgICAgIHZhciByZHkgPSBkMSAqIHRoaXMuYXkxICsgZDIgKiB0aGlzLmF5MiArIGQzICogdGhpcy5heTI7XG4gICAgICB2YXIgcmR6ID0gZDEgKiB0aGlzLmF6MSArIGQyICogdGhpcy5hejIgKyBkMyAqIHRoaXMuYXoyO1xuICAgICAgdmFyIHcxID0gdGhpcy5tMiAvICh0aGlzLm0xICsgdGhpcy5tMik7XG4gICAgICBpZiAodGhpcy53ZWlnaHQgPj0gMCkgdzEgPSB0aGlzLndlaWdodDsgLy8gdXNlIGdpdmVuIHdlaWdodFxuICAgICAgdmFyIHcyID0gMSAtIHcxO1xuICAgICAgdGhpcy5yMXggPSB0aGlzLnIxLnggKyByZHggKiB3MTtcbiAgICAgIHRoaXMucjF5ID0gdGhpcy5yMS55ICsgcmR5ICogdzE7XG4gICAgICB0aGlzLnIxeiA9IHRoaXMucjEueiArIHJkeiAqIHcxO1xuICAgICAgdGhpcy5yMnggPSB0aGlzLnIyLnggLSByZHggKiB3MjtcbiAgICAgIHRoaXMucjJ5ID0gdGhpcy5yMi55IC0gcmR5ICogdzI7XG4gICAgICB0aGlzLnIyeiA9IHRoaXMucjIueiAtIHJkeiAqIHcyO1xuXG4gICAgICAvLyBidWlsZCBqYWNvYmlhbnNcbiAgICAgIHRoaXMudDF4MSA9IHRoaXMucjF5ICogdGhpcy5hejEgLSB0aGlzLnIxeiAqIHRoaXMuYXkxO1xuICAgICAgdGhpcy50MXkxID0gdGhpcy5yMXogKiB0aGlzLmF4MSAtIHRoaXMucjF4ICogdGhpcy5hejE7XG4gICAgICB0aGlzLnQxejEgPSB0aGlzLnIxeCAqIHRoaXMuYXkxIC0gdGhpcy5yMXkgKiB0aGlzLmF4MTtcbiAgICAgIHRoaXMudDJ4MSA9IHRoaXMucjJ5ICogdGhpcy5hejEgLSB0aGlzLnIyeiAqIHRoaXMuYXkxO1xuICAgICAgdGhpcy50MnkxID0gdGhpcy5yMnogKiB0aGlzLmF4MSAtIHRoaXMucjJ4ICogdGhpcy5hejE7XG4gICAgICB0aGlzLnQyejEgPSB0aGlzLnIyeCAqIHRoaXMuYXkxIC0gdGhpcy5yMnkgKiB0aGlzLmF4MTtcbiAgICAgIHRoaXMubDF4MSA9IHRoaXMuYXgxICogdGhpcy5tMTtcbiAgICAgIHRoaXMubDF5MSA9IHRoaXMuYXkxICogdGhpcy5tMTtcbiAgICAgIHRoaXMubDF6MSA9IHRoaXMuYXoxICogdGhpcy5tMTtcbiAgICAgIHRoaXMubDJ4MSA9IHRoaXMuYXgxICogdGhpcy5tMjtcbiAgICAgIHRoaXMubDJ5MSA9IHRoaXMuYXkxICogdGhpcy5tMjtcbiAgICAgIHRoaXMubDJ6MSA9IHRoaXMuYXoxICogdGhpcy5tMjtcbiAgICAgIHRoaXMuYTF4MSA9IHRoaXMudDF4MSAqIHRoaXMuaTFlMDAgKyB0aGlzLnQxeTEgKiB0aGlzLmkxZTAxICsgdGhpcy50MXoxICogdGhpcy5pMWUwMjtcbiAgICAgIHRoaXMuYTF5MSA9IHRoaXMudDF4MSAqIHRoaXMuaTFlMTAgKyB0aGlzLnQxeTEgKiB0aGlzLmkxZTExICsgdGhpcy50MXoxICogdGhpcy5pMWUxMjtcbiAgICAgIHRoaXMuYTF6MSA9IHRoaXMudDF4MSAqIHRoaXMuaTFlMjAgKyB0aGlzLnQxeTEgKiB0aGlzLmkxZTIxICsgdGhpcy50MXoxICogdGhpcy5pMWUyMjtcbiAgICAgIHRoaXMuYTJ4MSA9IHRoaXMudDJ4MSAqIHRoaXMuaTJlMDAgKyB0aGlzLnQyeTEgKiB0aGlzLmkyZTAxICsgdGhpcy50MnoxICogdGhpcy5pMmUwMjtcbiAgICAgIHRoaXMuYTJ5MSA9IHRoaXMudDJ4MSAqIHRoaXMuaTJlMTAgKyB0aGlzLnQyeTEgKiB0aGlzLmkyZTExICsgdGhpcy50MnoxICogdGhpcy5pMmUxMjtcbiAgICAgIHRoaXMuYTJ6MSA9IHRoaXMudDJ4MSAqIHRoaXMuaTJlMjAgKyB0aGlzLnQyeTEgKiB0aGlzLmkyZTIxICsgdGhpcy50MnoxICogdGhpcy5pMmUyMjtcblxuICAgICAgdGhpcy50MXgyID0gdGhpcy5yMXkgKiB0aGlzLmF6MiAtIHRoaXMucjF6ICogdGhpcy5heTI7XG4gICAgICB0aGlzLnQxeTIgPSB0aGlzLnIxeiAqIHRoaXMuYXgyIC0gdGhpcy5yMXggKiB0aGlzLmF6MjtcbiAgICAgIHRoaXMudDF6MiA9IHRoaXMucjF4ICogdGhpcy5heTIgLSB0aGlzLnIxeSAqIHRoaXMuYXgyO1xuICAgICAgdGhpcy50MngyID0gdGhpcy5yMnkgKiB0aGlzLmF6MiAtIHRoaXMucjJ6ICogdGhpcy5heTI7XG4gICAgICB0aGlzLnQyeTIgPSB0aGlzLnIyeiAqIHRoaXMuYXgyIC0gdGhpcy5yMnggKiB0aGlzLmF6MjtcbiAgICAgIHRoaXMudDJ6MiA9IHRoaXMucjJ4ICogdGhpcy5heTIgLSB0aGlzLnIyeSAqIHRoaXMuYXgyO1xuICAgICAgdGhpcy5sMXgyID0gdGhpcy5heDIgKiB0aGlzLm0xO1xuICAgICAgdGhpcy5sMXkyID0gdGhpcy5heTIgKiB0aGlzLm0xO1xuICAgICAgdGhpcy5sMXoyID0gdGhpcy5hejIgKiB0aGlzLm0xO1xuICAgICAgdGhpcy5sMngyID0gdGhpcy5heDIgKiB0aGlzLm0yO1xuICAgICAgdGhpcy5sMnkyID0gdGhpcy5heTIgKiB0aGlzLm0yO1xuICAgICAgdGhpcy5sMnoyID0gdGhpcy5hejIgKiB0aGlzLm0yO1xuICAgICAgdGhpcy5hMXgyID0gdGhpcy50MXgyICogdGhpcy5pMWUwMCArIHRoaXMudDF5MiAqIHRoaXMuaTFlMDEgKyB0aGlzLnQxejIgKiB0aGlzLmkxZTAyO1xuICAgICAgdGhpcy5hMXkyID0gdGhpcy50MXgyICogdGhpcy5pMWUxMCArIHRoaXMudDF5MiAqIHRoaXMuaTFlMTEgKyB0aGlzLnQxejIgKiB0aGlzLmkxZTEyO1xuICAgICAgdGhpcy5hMXoyID0gdGhpcy50MXgyICogdGhpcy5pMWUyMCArIHRoaXMudDF5MiAqIHRoaXMuaTFlMjEgKyB0aGlzLnQxejIgKiB0aGlzLmkxZTIyO1xuICAgICAgdGhpcy5hMngyID0gdGhpcy50MngyICogdGhpcy5pMmUwMCArIHRoaXMudDJ5MiAqIHRoaXMuaTJlMDEgKyB0aGlzLnQyejIgKiB0aGlzLmkyZTAyO1xuICAgICAgdGhpcy5hMnkyID0gdGhpcy50MngyICogdGhpcy5pMmUxMCArIHRoaXMudDJ5MiAqIHRoaXMuaTJlMTEgKyB0aGlzLnQyejIgKiB0aGlzLmkyZTEyO1xuICAgICAgdGhpcy5hMnoyID0gdGhpcy50MngyICogdGhpcy5pMmUyMCArIHRoaXMudDJ5MiAqIHRoaXMuaTJlMjEgKyB0aGlzLnQyejIgKiB0aGlzLmkyZTIyO1xuXG4gICAgICB0aGlzLnQxeDMgPSB0aGlzLnIxeSAqIHRoaXMuYXozIC0gdGhpcy5yMXogKiB0aGlzLmF5MztcbiAgICAgIHRoaXMudDF5MyA9IHRoaXMucjF6ICogdGhpcy5heDMgLSB0aGlzLnIxeCAqIHRoaXMuYXozO1xuICAgICAgdGhpcy50MXozID0gdGhpcy5yMXggKiB0aGlzLmF5MyAtIHRoaXMucjF5ICogdGhpcy5heDM7XG4gICAgICB0aGlzLnQyeDMgPSB0aGlzLnIyeSAqIHRoaXMuYXozIC0gdGhpcy5yMnogKiB0aGlzLmF5MztcbiAgICAgIHRoaXMudDJ5MyA9IHRoaXMucjJ6ICogdGhpcy5heDMgLSB0aGlzLnIyeCAqIHRoaXMuYXozO1xuICAgICAgdGhpcy50MnozID0gdGhpcy5yMnggKiB0aGlzLmF5MyAtIHRoaXMucjJ5ICogdGhpcy5heDM7XG4gICAgICB0aGlzLmwxeDMgPSB0aGlzLmF4MyAqIHRoaXMubTE7XG4gICAgICB0aGlzLmwxeTMgPSB0aGlzLmF5MyAqIHRoaXMubTE7XG4gICAgICB0aGlzLmwxejMgPSB0aGlzLmF6MyAqIHRoaXMubTE7XG4gICAgICB0aGlzLmwyeDMgPSB0aGlzLmF4MyAqIHRoaXMubTI7XG4gICAgICB0aGlzLmwyeTMgPSB0aGlzLmF5MyAqIHRoaXMubTI7XG4gICAgICB0aGlzLmwyejMgPSB0aGlzLmF6MyAqIHRoaXMubTI7XG4gICAgICB0aGlzLmExeDMgPSB0aGlzLnQxeDMgKiB0aGlzLmkxZTAwICsgdGhpcy50MXkzICogdGhpcy5pMWUwMSArIHRoaXMudDF6MyAqIHRoaXMuaTFlMDI7XG4gICAgICB0aGlzLmExeTMgPSB0aGlzLnQxeDMgKiB0aGlzLmkxZTEwICsgdGhpcy50MXkzICogdGhpcy5pMWUxMSArIHRoaXMudDF6MyAqIHRoaXMuaTFlMTI7XG4gICAgICB0aGlzLmExejMgPSB0aGlzLnQxeDMgKiB0aGlzLmkxZTIwICsgdGhpcy50MXkzICogdGhpcy5pMWUyMSArIHRoaXMudDF6MyAqIHRoaXMuaTFlMjI7XG4gICAgICB0aGlzLmEyeDMgPSB0aGlzLnQyeDMgKiB0aGlzLmkyZTAwICsgdGhpcy50MnkzICogdGhpcy5pMmUwMSArIHRoaXMudDJ6MyAqIHRoaXMuaTJlMDI7XG4gICAgICB0aGlzLmEyeTMgPSB0aGlzLnQyeDMgKiB0aGlzLmkyZTEwICsgdGhpcy50MnkzICogdGhpcy5pMmUxMSArIHRoaXMudDJ6MyAqIHRoaXMuaTJlMTI7XG4gICAgICB0aGlzLmEyejMgPSB0aGlzLnQyeDMgKiB0aGlzLmkyZTIwICsgdGhpcy50MnkzICogdGhpcy5pMmUyMSArIHRoaXMudDJ6MyAqIHRoaXMuaTJlMjI7XG5cbiAgICAgIC8vIGJ1aWxkIGFuIGltcHVsc2UgbWF0cml4XG4gICAgICB2YXIgbTEyID0gdGhpcy5tMSArIHRoaXMubTI7XG4gICAgICB0aGlzLmswMCA9ICh0aGlzLmF4MSAqIHRoaXMuYXgxICsgdGhpcy5heTEgKiB0aGlzLmF5MSArIHRoaXMuYXoxICogdGhpcy5hejEpICogbTEyO1xuICAgICAgdGhpcy5rMDEgPSAodGhpcy5heDEgKiB0aGlzLmF4MiArIHRoaXMuYXkxICogdGhpcy5heTIgKyB0aGlzLmF6MSAqIHRoaXMuYXoyKSAqIG0xMjtcbiAgICAgIHRoaXMuazAyID0gKHRoaXMuYXgxICogdGhpcy5heDMgKyB0aGlzLmF5MSAqIHRoaXMuYXkzICsgdGhpcy5hejEgKiB0aGlzLmF6MykgKiBtMTI7XG4gICAgICB0aGlzLmsxMCA9ICh0aGlzLmF4MiAqIHRoaXMuYXgxICsgdGhpcy5heTIgKiB0aGlzLmF5MSArIHRoaXMuYXoyICogdGhpcy5hejEpICogbTEyO1xuICAgICAgdGhpcy5rMTEgPSAodGhpcy5heDIgKiB0aGlzLmF4MiArIHRoaXMuYXkyICogdGhpcy5heTIgKyB0aGlzLmF6MiAqIHRoaXMuYXoyKSAqIG0xMjtcbiAgICAgIHRoaXMuazEyID0gKHRoaXMuYXgyICogdGhpcy5heDMgKyB0aGlzLmF5MiAqIHRoaXMuYXkzICsgdGhpcy5hejIgKiB0aGlzLmF6MykgKiBtMTI7XG4gICAgICB0aGlzLmsyMCA9ICh0aGlzLmF4MyAqIHRoaXMuYXgxICsgdGhpcy5heTMgKiB0aGlzLmF5MSArIHRoaXMuYXozICogdGhpcy5hejEpICogbTEyO1xuICAgICAgdGhpcy5rMjEgPSAodGhpcy5heDMgKiB0aGlzLmF4MiArIHRoaXMuYXkzICogdGhpcy5heTIgKyB0aGlzLmF6MyAqIHRoaXMuYXoyKSAqIG0xMjtcbiAgICAgIHRoaXMuazIyID0gKHRoaXMuYXgzICogdGhpcy5heDMgKyB0aGlzLmF5MyAqIHRoaXMuYXkzICsgdGhpcy5hejMgKiB0aGlzLmF6MykgKiBtMTI7XG5cbiAgICAgIHRoaXMuazAwICs9IHRoaXMudDF4MSAqIHRoaXMuYTF4MSArIHRoaXMudDF5MSAqIHRoaXMuYTF5MSArIHRoaXMudDF6MSAqIHRoaXMuYTF6MTtcbiAgICAgIHRoaXMuazAxICs9IHRoaXMudDF4MSAqIHRoaXMuYTF4MiArIHRoaXMudDF5MSAqIHRoaXMuYTF5MiArIHRoaXMudDF6MSAqIHRoaXMuYTF6MjtcbiAgICAgIHRoaXMuazAyICs9IHRoaXMudDF4MSAqIHRoaXMuYTF4MyArIHRoaXMudDF5MSAqIHRoaXMuYTF5MyArIHRoaXMudDF6MSAqIHRoaXMuYTF6MztcbiAgICAgIHRoaXMuazEwICs9IHRoaXMudDF4MiAqIHRoaXMuYTF4MSArIHRoaXMudDF5MiAqIHRoaXMuYTF5MSArIHRoaXMudDF6MiAqIHRoaXMuYTF6MTtcbiAgICAgIHRoaXMuazExICs9IHRoaXMudDF4MiAqIHRoaXMuYTF4MiArIHRoaXMudDF5MiAqIHRoaXMuYTF5MiArIHRoaXMudDF6MiAqIHRoaXMuYTF6MjtcbiAgICAgIHRoaXMuazEyICs9IHRoaXMudDF4MiAqIHRoaXMuYTF4MyArIHRoaXMudDF5MiAqIHRoaXMuYTF5MyArIHRoaXMudDF6MiAqIHRoaXMuYTF6MztcbiAgICAgIHRoaXMuazIwICs9IHRoaXMudDF4MyAqIHRoaXMuYTF4MSArIHRoaXMudDF5MyAqIHRoaXMuYTF5MSArIHRoaXMudDF6MyAqIHRoaXMuYTF6MTtcbiAgICAgIHRoaXMuazIxICs9IHRoaXMudDF4MyAqIHRoaXMuYTF4MiArIHRoaXMudDF5MyAqIHRoaXMuYTF5MiArIHRoaXMudDF6MyAqIHRoaXMuYTF6MjtcbiAgICAgIHRoaXMuazIyICs9IHRoaXMudDF4MyAqIHRoaXMuYTF4MyArIHRoaXMudDF5MyAqIHRoaXMuYTF5MyArIHRoaXMudDF6MyAqIHRoaXMuYTF6MztcblxuICAgICAgdGhpcy5rMDAgKz0gdGhpcy50MngxICogdGhpcy5hMngxICsgdGhpcy50MnkxICogdGhpcy5hMnkxICsgdGhpcy50MnoxICogdGhpcy5hMnoxO1xuICAgICAgdGhpcy5rMDEgKz0gdGhpcy50MngxICogdGhpcy5hMngyICsgdGhpcy50MnkxICogdGhpcy5hMnkyICsgdGhpcy50MnoxICogdGhpcy5hMnoyO1xuICAgICAgdGhpcy5rMDIgKz0gdGhpcy50MngxICogdGhpcy5hMngzICsgdGhpcy50MnkxICogdGhpcy5hMnkzICsgdGhpcy50MnoxICogdGhpcy5hMnozO1xuICAgICAgdGhpcy5rMTAgKz0gdGhpcy50MngyICogdGhpcy5hMngxICsgdGhpcy50MnkyICogdGhpcy5hMnkxICsgdGhpcy50MnoyICogdGhpcy5hMnoxO1xuICAgICAgdGhpcy5rMTEgKz0gdGhpcy50MngyICogdGhpcy5hMngyICsgdGhpcy50MnkyICogdGhpcy5hMnkyICsgdGhpcy50MnoyICogdGhpcy5hMnoyO1xuICAgICAgdGhpcy5rMTIgKz0gdGhpcy50MngyICogdGhpcy5hMngzICsgdGhpcy50MnkyICogdGhpcy5hMnkzICsgdGhpcy50MnoyICogdGhpcy5hMnozO1xuICAgICAgdGhpcy5rMjAgKz0gdGhpcy50MngzICogdGhpcy5hMngxICsgdGhpcy50MnkzICogdGhpcy5hMnkxICsgdGhpcy50MnozICogdGhpcy5hMnoxO1xuICAgICAgdGhpcy5rMjEgKz0gdGhpcy50MngzICogdGhpcy5hMngyICsgdGhpcy50MnkzICogdGhpcy5hMnkyICsgdGhpcy50MnozICogdGhpcy5hMnoyO1xuICAgICAgdGhpcy5rMjIgKz0gdGhpcy50MngzICogdGhpcy5hMngzICsgdGhpcy50MnkzICogdGhpcy5hMnkzICsgdGhpcy50MnozICogdGhpcy5hMnozO1xuXG4gICAgICB0aGlzLmt2MDAgPSB0aGlzLmswMDtcbiAgICAgIHRoaXMua3YxMSA9IHRoaXMuazExO1xuICAgICAgdGhpcy5rdjIyID0gdGhpcy5rMjI7XG5cbiAgICAgIHRoaXMuZHYwMCA9IDEgLyB0aGlzLmt2MDA7XG4gICAgICB0aGlzLmR2MTEgPSAxIC8gdGhpcy5rdjExO1xuICAgICAgdGhpcy5kdjIyID0gMSAvIHRoaXMua3YyMjtcblxuICAgICAgaWYgKGVuYWJsZVNwcmluZzEgJiYgdGhpcy5saW1pdFN0YXRlMSAhPSAyKSB7XG4gICAgICAgIHZhciBvbWVnYSA9IDYuMjgzMTg1MyAqIGZyZXF1ZW5jeTE7XG4gICAgICAgIHZhciBrID0gb21lZ2EgKiBvbWVnYSAqIHRpbWVTdGVwO1xuICAgICAgICB2YXIgZG1wID0gaW52VGltZVN0ZXAgLyAoayArIDIgKiB0aGlzLmxpbWl0TW90b3IxLmRhbXBpbmdSYXRpbyAqIG9tZWdhKTtcbiAgICAgICAgdGhpcy5jZm0xID0gdGhpcy5rdjAwICogZG1wO1xuICAgICAgICB0aGlzLmxpbWl0VmVsb2NpdHkxICo9IGsgKiBkbXA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmNmbTEgPSAwO1xuICAgICAgICB0aGlzLmxpbWl0VmVsb2NpdHkxICo9IGludlRpbWVTdGVwICogMC4wNTtcbiAgICAgIH1cbiAgICAgIGlmIChlbmFibGVTcHJpbmcyICYmIHRoaXMubGltaXRTdGF0ZTIgIT0gMikge1xuICAgICAgICBvbWVnYSA9IDYuMjgzMTg1MyAqIGZyZXF1ZW5jeTI7XG4gICAgICAgIGsgPSBvbWVnYSAqIG9tZWdhICogdGltZVN0ZXA7XG4gICAgICAgIGRtcCA9IGludlRpbWVTdGVwIC8gKGsgKyAyICogdGhpcy5saW1pdE1vdG9yMi5kYW1waW5nUmF0aW8gKiBvbWVnYSk7XG4gICAgICAgIHRoaXMuY2ZtMiA9IHRoaXMua3YxMSAqIGRtcDtcbiAgICAgICAgdGhpcy5saW1pdFZlbG9jaXR5MiAqPSBrICogZG1wO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5jZm0yID0gMDtcbiAgICAgICAgdGhpcy5saW1pdFZlbG9jaXR5MiAqPSBpbnZUaW1lU3RlcCAqIDAuMDU7XG4gICAgICB9XG4gICAgICBpZiAoZW5hYmxlU3ByaW5nMyAmJiB0aGlzLmxpbWl0U3RhdGUzICE9IDIpIHtcbiAgICAgICAgb21lZ2EgPSA2LjI4MzE4NTMgKiBmcmVxdWVuY3kzO1xuICAgICAgICBrID0gb21lZ2EgKiBvbWVnYSAqIHRpbWVTdGVwO1xuICAgICAgICBkbXAgPSBpbnZUaW1lU3RlcCAvIChrICsgMiAqIHRoaXMubGltaXRNb3RvcjMuZGFtcGluZ1JhdGlvICogb21lZ2EpO1xuICAgICAgICB0aGlzLmNmbTMgPSB0aGlzLmt2MjIgKiBkbXA7XG4gICAgICAgIHRoaXMubGltaXRWZWxvY2l0eTMgKj0gayAqIGRtcDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuY2ZtMyA9IDA7XG4gICAgICAgIHRoaXMubGltaXRWZWxvY2l0eTMgKj0gaW52VGltZVN0ZXAgKiAwLjA1O1xuICAgICAgfVxuICAgICAgdGhpcy5rMDAgKz0gdGhpcy5jZm0xO1xuICAgICAgdGhpcy5rMTEgKz0gdGhpcy5jZm0yO1xuICAgICAgdGhpcy5rMjIgKz0gdGhpcy5jZm0zO1xuXG4gICAgICB2YXIgaW52ID0gMSAvIChcbiAgICAgICAgdGhpcy5rMDAgKiAodGhpcy5rMTEgKiB0aGlzLmsyMiAtIHRoaXMuazIxICogdGhpcy5rMTIpICtcbiAgICAgICAgdGhpcy5rMTAgKiAodGhpcy5rMjEgKiB0aGlzLmswMiAtIHRoaXMuazAxICogdGhpcy5rMjIpICtcbiAgICAgICAgdGhpcy5rMjAgKiAodGhpcy5rMDEgKiB0aGlzLmsxMiAtIHRoaXMuazExICogdGhpcy5rMDIpXG4gICAgICApO1xuICAgICAgdGhpcy5kMDAgPSAodGhpcy5rMTEgKiB0aGlzLmsyMiAtIHRoaXMuazEyICogdGhpcy5rMjEpICogaW52O1xuICAgICAgdGhpcy5kMDEgPSAodGhpcy5rMDIgKiB0aGlzLmsyMSAtIHRoaXMuazAxICogdGhpcy5rMjIpICogaW52O1xuICAgICAgdGhpcy5kMDIgPSAodGhpcy5rMDEgKiB0aGlzLmsxMiAtIHRoaXMuazAyICogdGhpcy5rMTEpICogaW52O1xuICAgICAgdGhpcy5kMTAgPSAodGhpcy5rMTIgKiB0aGlzLmsyMCAtIHRoaXMuazEwICogdGhpcy5rMjIpICogaW52O1xuICAgICAgdGhpcy5kMTEgPSAodGhpcy5rMDAgKiB0aGlzLmsyMiAtIHRoaXMuazAyICogdGhpcy5rMjApICogaW52O1xuICAgICAgdGhpcy5kMTIgPSAodGhpcy5rMDIgKiB0aGlzLmsxMCAtIHRoaXMuazAwICogdGhpcy5rMTIpICogaW52O1xuICAgICAgdGhpcy5kMjAgPSAodGhpcy5rMTAgKiB0aGlzLmsyMSAtIHRoaXMuazExICogdGhpcy5rMjApICogaW52O1xuICAgICAgdGhpcy5kMjEgPSAodGhpcy5rMDEgKiB0aGlzLmsyMCAtIHRoaXMuazAwICogdGhpcy5rMjEpICogaW52O1xuICAgICAgdGhpcy5kMjIgPSAodGhpcy5rMDAgKiB0aGlzLmsxMSAtIHRoaXMuazAxICogdGhpcy5rMTApICogaW52O1xuXG4gICAgICAvLyB3YXJtIHN0YXJ0aW5nXG4gICAgICB2YXIgdG90YWxJbXB1bHNlMSA9IHRoaXMubGltaXRJbXB1bHNlMSArIHRoaXMubW90b3JJbXB1bHNlMTtcbiAgICAgIHZhciB0b3RhbEltcHVsc2UyID0gdGhpcy5saW1pdEltcHVsc2UyICsgdGhpcy5tb3RvckltcHVsc2UyO1xuICAgICAgdmFyIHRvdGFsSW1wdWxzZTMgPSB0aGlzLmxpbWl0SW1wdWxzZTMgKyB0aGlzLm1vdG9ySW1wdWxzZTM7XG4gICAgICB0aGlzLmwxLnggKz0gdG90YWxJbXB1bHNlMSAqIHRoaXMubDF4MSArIHRvdGFsSW1wdWxzZTIgKiB0aGlzLmwxeDIgKyB0b3RhbEltcHVsc2UzICogdGhpcy5sMXgzO1xuICAgICAgdGhpcy5sMS55ICs9IHRvdGFsSW1wdWxzZTEgKiB0aGlzLmwxeTEgKyB0b3RhbEltcHVsc2UyICogdGhpcy5sMXkyICsgdG90YWxJbXB1bHNlMyAqIHRoaXMubDF5MztcbiAgICAgIHRoaXMubDEueiArPSB0b3RhbEltcHVsc2UxICogdGhpcy5sMXoxICsgdG90YWxJbXB1bHNlMiAqIHRoaXMubDF6MiArIHRvdGFsSW1wdWxzZTMgKiB0aGlzLmwxejM7XG4gICAgICB0aGlzLmExLnggKz0gdG90YWxJbXB1bHNlMSAqIHRoaXMuYTF4MSArIHRvdGFsSW1wdWxzZTIgKiB0aGlzLmExeDIgKyB0b3RhbEltcHVsc2UzICogdGhpcy5hMXgzO1xuICAgICAgdGhpcy5hMS55ICs9IHRvdGFsSW1wdWxzZTEgKiB0aGlzLmExeTEgKyB0b3RhbEltcHVsc2UyICogdGhpcy5hMXkyICsgdG90YWxJbXB1bHNlMyAqIHRoaXMuYTF5MztcbiAgICAgIHRoaXMuYTEueiArPSB0b3RhbEltcHVsc2UxICogdGhpcy5hMXoxICsgdG90YWxJbXB1bHNlMiAqIHRoaXMuYTF6MiArIHRvdGFsSW1wdWxzZTMgKiB0aGlzLmExejM7XG4gICAgICB0aGlzLmwyLnggLT0gdG90YWxJbXB1bHNlMSAqIHRoaXMubDJ4MSArIHRvdGFsSW1wdWxzZTIgKiB0aGlzLmwyeDIgKyB0b3RhbEltcHVsc2UzICogdGhpcy5sMngzO1xuICAgICAgdGhpcy5sMi55IC09IHRvdGFsSW1wdWxzZTEgKiB0aGlzLmwyeTEgKyB0b3RhbEltcHVsc2UyICogdGhpcy5sMnkyICsgdG90YWxJbXB1bHNlMyAqIHRoaXMubDJ5MztcbiAgICAgIHRoaXMubDIueiAtPSB0b3RhbEltcHVsc2UxICogdGhpcy5sMnoxICsgdG90YWxJbXB1bHNlMiAqIHRoaXMubDJ6MiArIHRvdGFsSW1wdWxzZTMgKiB0aGlzLmwyejM7XG4gICAgICB0aGlzLmEyLnggLT0gdG90YWxJbXB1bHNlMSAqIHRoaXMuYTJ4MSArIHRvdGFsSW1wdWxzZTIgKiB0aGlzLmEyeDIgKyB0b3RhbEltcHVsc2UzICogdGhpcy5hMngzO1xuICAgICAgdGhpcy5hMi55IC09IHRvdGFsSW1wdWxzZTEgKiB0aGlzLmEyeTEgKyB0b3RhbEltcHVsc2UyICogdGhpcy5hMnkyICsgdG90YWxJbXB1bHNlMyAqIHRoaXMuYTJ5MztcbiAgICAgIHRoaXMuYTIueiAtPSB0b3RhbEltcHVsc2UxICogdGhpcy5hMnoxICsgdG90YWxJbXB1bHNlMiAqIHRoaXMuYTJ6MiArIHRvdGFsSW1wdWxzZTMgKiB0aGlzLmEyejM7XG4gICAgfSxcblxuICAgIHNvbHZlOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgcnZ4ID0gdGhpcy5sMi54IC0gdGhpcy5sMS54ICsgdGhpcy5hMi55ICogdGhpcy5yMnogLSB0aGlzLmEyLnogKiB0aGlzLnIyeSAtIHRoaXMuYTEueSAqIHRoaXMucjF6ICsgdGhpcy5hMS56ICogdGhpcy5yMXk7XG4gICAgICB2YXIgcnZ5ID0gdGhpcy5sMi55IC0gdGhpcy5sMS55ICsgdGhpcy5hMi56ICogdGhpcy5yMnggLSB0aGlzLmEyLnggKiB0aGlzLnIyeiAtIHRoaXMuYTEueiAqIHRoaXMucjF4ICsgdGhpcy5hMS54ICogdGhpcy5yMXo7XG4gICAgICB2YXIgcnZ6ID0gdGhpcy5sMi56IC0gdGhpcy5sMS56ICsgdGhpcy5hMi54ICogdGhpcy5yMnkgLSB0aGlzLmEyLnkgKiB0aGlzLnIyeCAtIHRoaXMuYTEueCAqIHRoaXMucjF5ICsgdGhpcy5hMS55ICogdGhpcy5yMXg7XG4gICAgICB2YXIgcnZuMSA9IHJ2eCAqIHRoaXMuYXgxICsgcnZ5ICogdGhpcy5heTEgKyBydnogKiB0aGlzLmF6MTtcbiAgICAgIHZhciBydm4yID0gcnZ4ICogdGhpcy5heDIgKyBydnkgKiB0aGlzLmF5MiArIHJ2eiAqIHRoaXMuYXoyO1xuICAgICAgdmFyIHJ2bjMgPSBydnggKiB0aGlzLmF4MyArIHJ2eSAqIHRoaXMuYXkzICsgcnZ6ICogdGhpcy5hejM7XG4gICAgICB2YXIgb2xkTW90b3JJbXB1bHNlMSA9IHRoaXMubW90b3JJbXB1bHNlMTtcbiAgICAgIHZhciBvbGRNb3RvckltcHVsc2UyID0gdGhpcy5tb3RvckltcHVsc2UyO1xuICAgICAgdmFyIG9sZE1vdG9ySW1wdWxzZTMgPSB0aGlzLm1vdG9ySW1wdWxzZTM7XG4gICAgICB2YXIgZE1vdG9ySW1wdWxzZTEgPSAwO1xuICAgICAgdmFyIGRNb3RvckltcHVsc2UyID0gMDtcbiAgICAgIHZhciBkTW90b3JJbXB1bHNlMyA9IDA7XG4gICAgICBpZiAodGhpcy5lbmFibGVNb3RvcjEpIHtcbiAgICAgICAgZE1vdG9ySW1wdWxzZTEgPSAocnZuMSAtIHRoaXMubW90b3JTcGVlZDEpICogdGhpcy5kdjAwO1xuICAgICAgICB0aGlzLm1vdG9ySW1wdWxzZTEgKz0gZE1vdG9ySW1wdWxzZTE7XG4gICAgICAgIGlmICh0aGlzLm1vdG9ySW1wdWxzZTEgPiB0aGlzLm1heE1vdG9ySW1wdWxzZTEpIHsgLy8gY2xhbXAgbW90b3IgaW1wdWxzZVxuICAgICAgICAgIHRoaXMubW90b3JJbXB1bHNlMSA9IHRoaXMubWF4TW90b3JJbXB1bHNlMTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLm1vdG9ySW1wdWxzZTEgPCAtdGhpcy5tYXhNb3RvckltcHVsc2UxKSB7XG4gICAgICAgICAgdGhpcy5tb3RvckltcHVsc2UxID0gLXRoaXMubWF4TW90b3JJbXB1bHNlMTtcbiAgICAgICAgfVxuICAgICAgICBkTW90b3JJbXB1bHNlMSA9IHRoaXMubW90b3JJbXB1bHNlMSAtIG9sZE1vdG9ySW1wdWxzZTE7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5lbmFibGVNb3RvcjIpIHtcbiAgICAgICAgZE1vdG9ySW1wdWxzZTIgPSAocnZuMiAtIHRoaXMubW90b3JTcGVlZDIpICogdGhpcy5kdjExO1xuICAgICAgICB0aGlzLm1vdG9ySW1wdWxzZTIgKz0gZE1vdG9ySW1wdWxzZTI7XG4gICAgICAgIGlmICh0aGlzLm1vdG9ySW1wdWxzZTIgPiB0aGlzLm1heE1vdG9ySW1wdWxzZTIpIHsgLy8gY2xhbXAgbW90b3IgaW1wdWxzZVxuICAgICAgICAgIHRoaXMubW90b3JJbXB1bHNlMiA9IHRoaXMubWF4TW90b3JJbXB1bHNlMjtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLm1vdG9ySW1wdWxzZTIgPCAtdGhpcy5tYXhNb3RvckltcHVsc2UyKSB7XG4gICAgICAgICAgdGhpcy5tb3RvckltcHVsc2UyID0gLXRoaXMubWF4TW90b3JJbXB1bHNlMjtcbiAgICAgICAgfVxuICAgICAgICBkTW90b3JJbXB1bHNlMiA9IHRoaXMubW90b3JJbXB1bHNlMiAtIG9sZE1vdG9ySW1wdWxzZTI7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5lbmFibGVNb3RvcjMpIHtcbiAgICAgICAgZE1vdG9ySW1wdWxzZTMgPSAocnZuMyAtIHRoaXMubW90b3JTcGVlZDMpICogdGhpcy5kdjIyO1xuICAgICAgICB0aGlzLm1vdG9ySW1wdWxzZTMgKz0gZE1vdG9ySW1wdWxzZTM7XG4gICAgICAgIGlmICh0aGlzLm1vdG9ySW1wdWxzZTMgPiB0aGlzLm1heE1vdG9ySW1wdWxzZTMpIHsgLy8gY2xhbXAgbW90b3IgaW1wdWxzZVxuICAgICAgICAgIHRoaXMubW90b3JJbXB1bHNlMyA9IHRoaXMubWF4TW90b3JJbXB1bHNlMztcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLm1vdG9ySW1wdWxzZTMgPCAtdGhpcy5tYXhNb3RvckltcHVsc2UzKSB7XG4gICAgICAgICAgdGhpcy5tb3RvckltcHVsc2UzID0gLXRoaXMubWF4TW90b3JJbXB1bHNlMztcbiAgICAgICAgfVxuICAgICAgICBkTW90b3JJbXB1bHNlMyA9IHRoaXMubW90b3JJbXB1bHNlMyAtIG9sZE1vdG9ySW1wdWxzZTM7XG4gICAgICB9XG5cbiAgICAgIC8vIGFwcGx5IG1vdG9yIGltcHVsc2UgdG8gcmVsYXRpdmUgdmVsb2NpdHlcbiAgICAgIHJ2bjEgKz0gZE1vdG9ySW1wdWxzZTEgKiB0aGlzLmt2MDAgKyBkTW90b3JJbXB1bHNlMiAqIHRoaXMuazAxICsgZE1vdG9ySW1wdWxzZTMgKiB0aGlzLmswMjtcbiAgICAgIHJ2bjIgKz0gZE1vdG9ySW1wdWxzZTEgKiB0aGlzLmsxMCArIGRNb3RvckltcHVsc2UyICogdGhpcy5rdjExICsgZE1vdG9ySW1wdWxzZTMgKiB0aGlzLmsxMjtcbiAgICAgIHJ2bjMgKz0gZE1vdG9ySW1wdWxzZTEgKiB0aGlzLmsyMCArIGRNb3RvckltcHVsc2UyICogdGhpcy5rMjEgKyBkTW90b3JJbXB1bHNlMyAqIHRoaXMua3YyMjtcblxuICAgICAgLy8gc3VidHJhY3QgdGFyZ2V0IHZlbG9jaXR5IGFuZCBhcHBsaWVkIGltcHVsc2VcbiAgICAgIHJ2bjEgLT0gdGhpcy5saW1pdFZlbG9jaXR5MSArIHRoaXMubGltaXRJbXB1bHNlMSAqIHRoaXMuY2ZtMTtcbiAgICAgIHJ2bjIgLT0gdGhpcy5saW1pdFZlbG9jaXR5MiArIHRoaXMubGltaXRJbXB1bHNlMiAqIHRoaXMuY2ZtMjtcbiAgICAgIHJ2bjMgLT0gdGhpcy5saW1pdFZlbG9jaXR5MyArIHRoaXMubGltaXRJbXB1bHNlMyAqIHRoaXMuY2ZtMztcblxuICAgICAgdmFyIG9sZExpbWl0SW1wdWxzZTEgPSB0aGlzLmxpbWl0SW1wdWxzZTE7XG4gICAgICB2YXIgb2xkTGltaXRJbXB1bHNlMiA9IHRoaXMubGltaXRJbXB1bHNlMjtcbiAgICAgIHZhciBvbGRMaW1pdEltcHVsc2UzID0gdGhpcy5saW1pdEltcHVsc2UzO1xuXG4gICAgICB2YXIgZExpbWl0SW1wdWxzZTEgPSBydm4xICogdGhpcy5kMDAgKyBydm4yICogdGhpcy5kMDEgKyBydm4zICogdGhpcy5kMDI7XG4gICAgICB2YXIgZExpbWl0SW1wdWxzZTIgPSBydm4xICogdGhpcy5kMTAgKyBydm4yICogdGhpcy5kMTEgKyBydm4zICogdGhpcy5kMTI7XG4gICAgICB2YXIgZExpbWl0SW1wdWxzZTMgPSBydm4xICogdGhpcy5kMjAgKyBydm4yICogdGhpcy5kMjEgKyBydm4zICogdGhpcy5kMjI7XG5cbiAgICAgIHRoaXMubGltaXRJbXB1bHNlMSArPSBkTGltaXRJbXB1bHNlMTtcbiAgICAgIHRoaXMubGltaXRJbXB1bHNlMiArPSBkTGltaXRJbXB1bHNlMjtcbiAgICAgIHRoaXMubGltaXRJbXB1bHNlMyArPSBkTGltaXRJbXB1bHNlMztcblxuICAgICAgLy8gY2xhbXBcbiAgICAgIHZhciBjbGFtcFN0YXRlID0gMDtcbiAgICAgIGlmICh0aGlzLmxpbWl0U3RhdGUxID09IDIgfHwgdGhpcy5saW1pdEltcHVsc2UxICogdGhpcy5saW1pdFN0YXRlMSA8IDApIHtcbiAgICAgICAgZExpbWl0SW1wdWxzZTEgPSAtb2xkTGltaXRJbXB1bHNlMTtcbiAgICAgICAgcnZuMiArPSBkTGltaXRJbXB1bHNlMSAqIHRoaXMuazEwO1xuICAgICAgICBydm4zICs9IGRMaW1pdEltcHVsc2UxICogdGhpcy5rMjA7XG4gICAgICAgIGNsYW1wU3RhdGUgfD0gMTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmxpbWl0U3RhdGUyID09IDIgfHwgdGhpcy5saW1pdEltcHVsc2UyICogdGhpcy5saW1pdFN0YXRlMiA8IDApIHtcbiAgICAgICAgZExpbWl0SW1wdWxzZTIgPSAtb2xkTGltaXRJbXB1bHNlMjtcbiAgICAgICAgcnZuMSArPSBkTGltaXRJbXB1bHNlMiAqIHRoaXMuazAxO1xuICAgICAgICBydm4zICs9IGRMaW1pdEltcHVsc2UyICogdGhpcy5rMjE7XG4gICAgICAgIGNsYW1wU3RhdGUgfD0gMjtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmxpbWl0U3RhdGUzID09IDIgfHwgdGhpcy5saW1pdEltcHVsc2UzICogdGhpcy5saW1pdFN0YXRlMyA8IDApIHtcbiAgICAgICAgZExpbWl0SW1wdWxzZTMgPSAtb2xkTGltaXRJbXB1bHNlMztcbiAgICAgICAgcnZuMSArPSBkTGltaXRJbXB1bHNlMyAqIHRoaXMuazAyO1xuICAgICAgICBydm4yICs9IGRMaW1pdEltcHVsc2UzICogdGhpcy5rMTI7XG4gICAgICAgIGNsYW1wU3RhdGUgfD0gNDtcbiAgICAgIH1cblxuICAgICAgLy8gdXBkYXRlIHVuLWNsYW1wZWQgaW1wdWxzZVxuICAgICAgLy8gVE9ETzogaXNvbGF0ZSBkaXZpc2lvblxuICAgICAgdmFyIGRldDtcbiAgICAgIHN3aXRjaCAoY2xhbXBTdGF0ZSkge1xuICAgICAgICBjYXNlIDE6Ly8gdXBkYXRlIDIgM1xuICAgICAgICAgIGRldCA9IDEgLyAodGhpcy5rMTEgKiB0aGlzLmsyMiAtIHRoaXMuazEyICogdGhpcy5rMjEpO1xuICAgICAgICAgIGRMaW1pdEltcHVsc2UyID0gKHRoaXMuazIyICogcnZuMiArIC10aGlzLmsxMiAqIHJ2bjMpICogZGV0O1xuICAgICAgICAgIGRMaW1pdEltcHVsc2UzID0gKC10aGlzLmsyMSAqIHJ2bjIgKyB0aGlzLmsxMSAqIHJ2bjMpICogZGV0O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDI6Ly8gdXBkYXRlIDEgM1xuICAgICAgICAgIGRldCA9IDEgLyAodGhpcy5rMDAgKiB0aGlzLmsyMiAtIHRoaXMuazAyICogdGhpcy5rMjApO1xuICAgICAgICAgIGRMaW1pdEltcHVsc2UxID0gKHRoaXMuazIyICogcnZuMSArIC10aGlzLmswMiAqIHJ2bjMpICogZGV0O1xuICAgICAgICAgIGRMaW1pdEltcHVsc2UzID0gKC10aGlzLmsyMCAqIHJ2bjEgKyB0aGlzLmswMCAqIHJ2bjMpICogZGV0O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDM6Ly8gdXBkYXRlIDNcbiAgICAgICAgICBkTGltaXRJbXB1bHNlMyA9IHJ2bjMgLyB0aGlzLmsyMjtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA0Oi8vIHVwZGF0ZSAxIDJcbiAgICAgICAgICBkZXQgPSAxIC8gKHRoaXMuazAwICogdGhpcy5rMTEgLSB0aGlzLmswMSAqIHRoaXMuazEwKTtcbiAgICAgICAgICBkTGltaXRJbXB1bHNlMSA9ICh0aGlzLmsxMSAqIHJ2bjEgKyAtdGhpcy5rMDEgKiBydm4yKSAqIGRldDtcbiAgICAgICAgICBkTGltaXRJbXB1bHNlMiA9ICgtdGhpcy5rMTAgKiBydm4xICsgdGhpcy5rMDAgKiBydm4yKSAqIGRldDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA1Oi8vIHVwZGF0ZSAyXG4gICAgICAgICAgZExpbWl0SW1wdWxzZTIgPSBydm4yIC8gdGhpcy5rMTE7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNjovLyB1cGRhdGUgMVxuICAgICAgICAgIGRMaW1pdEltcHVsc2UxID0gcnZuMSAvIHRoaXMuazAwO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmxpbWl0SW1wdWxzZTEgPSBvbGRMaW1pdEltcHVsc2UxICsgZExpbWl0SW1wdWxzZTE7XG4gICAgICB0aGlzLmxpbWl0SW1wdWxzZTIgPSBvbGRMaW1pdEltcHVsc2UyICsgZExpbWl0SW1wdWxzZTI7XG4gICAgICB0aGlzLmxpbWl0SW1wdWxzZTMgPSBvbGRMaW1pdEltcHVsc2UzICsgZExpbWl0SW1wdWxzZTM7XG5cbiAgICAgIHZhciBkSW1wdWxzZTEgPSBkTW90b3JJbXB1bHNlMSArIGRMaW1pdEltcHVsc2UxO1xuICAgICAgdmFyIGRJbXB1bHNlMiA9IGRNb3RvckltcHVsc2UyICsgZExpbWl0SW1wdWxzZTI7XG4gICAgICB2YXIgZEltcHVsc2UzID0gZE1vdG9ySW1wdWxzZTMgKyBkTGltaXRJbXB1bHNlMztcblxuICAgICAgLy8gYXBwbHkgaW1wdWxzZVxuICAgICAgdGhpcy5sMS54ICs9IGRJbXB1bHNlMSAqIHRoaXMubDF4MSArIGRJbXB1bHNlMiAqIHRoaXMubDF4MiArIGRJbXB1bHNlMyAqIHRoaXMubDF4MztcbiAgICAgIHRoaXMubDEueSArPSBkSW1wdWxzZTEgKiB0aGlzLmwxeTEgKyBkSW1wdWxzZTIgKiB0aGlzLmwxeTIgKyBkSW1wdWxzZTMgKiB0aGlzLmwxeTM7XG4gICAgICB0aGlzLmwxLnogKz0gZEltcHVsc2UxICogdGhpcy5sMXoxICsgZEltcHVsc2UyICogdGhpcy5sMXoyICsgZEltcHVsc2UzICogdGhpcy5sMXozO1xuICAgICAgdGhpcy5hMS54ICs9IGRJbXB1bHNlMSAqIHRoaXMuYTF4MSArIGRJbXB1bHNlMiAqIHRoaXMuYTF4MiArIGRJbXB1bHNlMyAqIHRoaXMuYTF4MztcbiAgICAgIHRoaXMuYTEueSArPSBkSW1wdWxzZTEgKiB0aGlzLmExeTEgKyBkSW1wdWxzZTIgKiB0aGlzLmExeTIgKyBkSW1wdWxzZTMgKiB0aGlzLmExeTM7XG4gICAgICB0aGlzLmExLnogKz0gZEltcHVsc2UxICogdGhpcy5hMXoxICsgZEltcHVsc2UyICogdGhpcy5hMXoyICsgZEltcHVsc2UzICogdGhpcy5hMXozO1xuICAgICAgdGhpcy5sMi54IC09IGRJbXB1bHNlMSAqIHRoaXMubDJ4MSArIGRJbXB1bHNlMiAqIHRoaXMubDJ4MiArIGRJbXB1bHNlMyAqIHRoaXMubDJ4MztcbiAgICAgIHRoaXMubDIueSAtPSBkSW1wdWxzZTEgKiB0aGlzLmwyeTEgKyBkSW1wdWxzZTIgKiB0aGlzLmwyeTIgKyBkSW1wdWxzZTMgKiB0aGlzLmwyeTM7XG4gICAgICB0aGlzLmwyLnogLT0gZEltcHVsc2UxICogdGhpcy5sMnoxICsgZEltcHVsc2UyICogdGhpcy5sMnoyICsgZEltcHVsc2UzICogdGhpcy5sMnozO1xuICAgICAgdGhpcy5hMi54IC09IGRJbXB1bHNlMSAqIHRoaXMuYTJ4MSArIGRJbXB1bHNlMiAqIHRoaXMuYTJ4MiArIGRJbXB1bHNlMyAqIHRoaXMuYTJ4MztcbiAgICAgIHRoaXMuYTIueSAtPSBkSW1wdWxzZTEgKiB0aGlzLmEyeTEgKyBkSW1wdWxzZTIgKiB0aGlzLmEyeTIgKyBkSW1wdWxzZTMgKiB0aGlzLmEyeTM7XG4gICAgICB0aGlzLmEyLnogLT0gZEltcHVsc2UxICogdGhpcy5hMnoxICsgZEltcHVsc2UyICogdGhpcy5hMnoyICsgZEltcHVsc2UzICogdGhpcy5hMnozO1xuICAgIH1cblxuICB9KTtcblxuICAvKipcbiAgICogQSBwcmlzbWF0aWMgam9pbnQgYWxsb3dzIG9ubHkgZm9yIHJlbGF0aXZlIHRyYW5zbGF0aW9uIG9mIHJpZ2lkIGJvZGllcyBhbG9uZyB0aGUgYXhpcy5cbiAgICpcbiAgICogQGF1dGhvciBzYWhhcmFuXG4gICAqIEBhdXRob3IgbG8tdGhcbiAgICovXG5cbiAgZnVuY3Rpb24gUHJpc21hdGljSm9pbnQoY29uZmlnLCBsb3dlclRyYW5zbGF0aW9uLCB1cHBlclRyYW5zbGF0aW9uKSB7XG5cbiAgICBKb2ludC5jYWxsKHRoaXMsIGNvbmZpZyk7XG5cbiAgICB0aGlzLnR5cGUgPSBKT0lOVF9QUklTTUFUSUM7XG5cbiAgICAvLyBUaGUgYXhpcyBpbiB0aGUgZmlyc3QgYm9keSdzIGNvb3JkaW5hdGUgc3lzdGVtLlxuICAgIHRoaXMubG9jYWxBeGlzMSA9IGNvbmZpZy5sb2NhbEF4aXMxLmNsb25lKCkubm9ybWFsaXplKCk7XG4gICAgLy8gVGhlIGF4aXMgaW4gdGhlIHNlY29uZCBib2R5J3MgY29vcmRpbmF0ZSBzeXN0ZW0uXG4gICAgdGhpcy5sb2NhbEF4aXMyID0gY29uZmlnLmxvY2FsQXhpczIuY2xvbmUoKS5ub3JtYWxpemUoKTtcblxuICAgIHRoaXMuYXgxID0gbmV3IFZlYzMoKTtcbiAgICB0aGlzLmF4MiA9IG5ldyBWZWMzKCk7XG5cbiAgICB0aGlzLm5vciA9IG5ldyBWZWMzKCk7XG4gICAgdGhpcy50YW4gPSBuZXcgVmVjMygpO1xuICAgIHRoaXMuYmluID0gbmV3IFZlYzMoKTtcblxuICAgIHRoaXMuYWMgPSBuZXcgQW5ndWxhckNvbnN0cmFpbnQodGhpcywgbmV3IFF1YXQoKS5zZXRGcm9tVW5pdFZlY3RvcnModGhpcy5sb2NhbEF4aXMxLCB0aGlzLmxvY2FsQXhpczIpKTtcblxuICAgIC8vIFRoZSB0cmFuc2xhdGlvbmFsIGxpbWl0IGFuZCBtb3RvciBpbmZvcm1hdGlvbiBvZiB0aGUgam9pbnQuXG4gICAgdGhpcy5saW1pdE1vdG9yID0gbmV3IExpbWl0TW90b3IodGhpcy5ub3IsIHRydWUpO1xuICAgIHRoaXMubGltaXRNb3Rvci5sb3dlckxpbWl0ID0gbG93ZXJUcmFuc2xhdGlvbjtcbiAgICB0aGlzLmxpbWl0TW90b3IudXBwZXJMaW1pdCA9IHVwcGVyVHJhbnNsYXRpb247XG4gICAgdGhpcy50MyA9IG5ldyBUcmFuc2xhdGlvbmFsM0NvbnN0cmFpbnQodGhpcywgdGhpcy5saW1pdE1vdG9yLCBuZXcgTGltaXRNb3Rvcih0aGlzLnRhbiwgdHJ1ZSksIG5ldyBMaW1pdE1vdG9yKHRoaXMuYmluLCB0cnVlKSk7XG5cbiAgfVxuICBQcmlzbWF0aWNKb2ludC5wcm90b3R5cGUgPSBPYmplY3QuYXNzaWduKE9iamVjdC5jcmVhdGUoSm9pbnQucHJvdG90eXBlKSwge1xuXG4gICAgY29uc3RydWN0b3I6IFByaXNtYXRpY0pvaW50LFxuXG4gICAgcHJlU29sdmU6IGZ1bmN0aW9uICh0aW1lU3RlcCwgaW52VGltZVN0ZXApIHtcblxuICAgICAgdGhpcy51cGRhdGVBbmNob3JQb2ludHMoKTtcblxuICAgICAgdGhpcy5heDEuY29weSh0aGlzLmxvY2FsQXhpczEpLmFwcGx5TWF0cml4Myh0aGlzLmJvZHkxLnJvdGF0aW9uLCB0cnVlKTtcbiAgICAgIHRoaXMuYXgyLmNvcHkodGhpcy5sb2NhbEF4aXMyKS5hcHBseU1hdHJpeDModGhpcy5ib2R5Mi5yb3RhdGlvbiwgdHJ1ZSk7XG5cbiAgICAgIC8vIG5vcm1hbCB0YW5nZW50IGJpbm9ybWFsXG5cbiAgICAgIHRoaXMubm9yLnNldChcbiAgICAgICAgdGhpcy5heDEueCAqIHRoaXMuYm9keTIuaW52ZXJzZU1hc3MgKyB0aGlzLmF4Mi54ICogdGhpcy5ib2R5MS5pbnZlcnNlTWFzcyxcbiAgICAgICAgdGhpcy5heDEueSAqIHRoaXMuYm9keTIuaW52ZXJzZU1hc3MgKyB0aGlzLmF4Mi55ICogdGhpcy5ib2R5MS5pbnZlcnNlTWFzcyxcbiAgICAgICAgdGhpcy5heDEueiAqIHRoaXMuYm9keTIuaW52ZXJzZU1hc3MgKyB0aGlzLmF4Mi56ICogdGhpcy5ib2R5MS5pbnZlcnNlTWFzc1xuICAgICAgKS5ub3JtYWxpemUoKTtcbiAgICAgIHRoaXMudGFuLnRhbmdlbnQodGhpcy5ub3IpLm5vcm1hbGl6ZSgpO1xuICAgICAgdGhpcy5iaW4uY3Jvc3NWZWN0b3JzKHRoaXMubm9yLCB0aGlzLnRhbik7XG5cbiAgICAgIC8vIHByZVNvbHZlXG5cbiAgICAgIHRoaXMuYWMucHJlU29sdmUodGltZVN0ZXAsIGludlRpbWVTdGVwKTtcbiAgICAgIHRoaXMudDMucHJlU29sdmUodGltZVN0ZXAsIGludlRpbWVTdGVwKTtcblxuICAgIH0sXG5cbiAgICBzb2x2ZTogZnVuY3Rpb24gKCkge1xuXG4gICAgICB0aGlzLmFjLnNvbHZlKCk7XG4gICAgICB0aGlzLnQzLnNvbHZlKCk7XG5cbiAgICB9LFxuXG4gICAgcG9zdFNvbHZlOiBmdW5jdGlvbiAoKSB7XG5cbiAgICB9XG5cbiAgfSk7XG5cbiAgLyoqXG4gICAqIEEgc2xpZGVyIGpvaW50IGFsbG93cyBmb3IgcmVsYXRpdmUgdHJhbnNsYXRpb24gYW5kIHJlbGF0aXZlIHJvdGF0aW9uIGJldHdlZW4gdHdvIHJpZ2lkIGJvZGllcyBhbG9uZyB0aGUgYXhpcy5cbiAgICpcbiAgICogQGF1dGhvciBzYWhhcmFuXG4gICAqIEBhdXRob3IgbG8tdGhcbiAgICovXG5cbiAgZnVuY3Rpb24gU2xpZGVySm9pbnQoY29uZmlnLCBsb3dlclRyYW5zbGF0aW9uLCB1cHBlclRyYW5zbGF0aW9uKSB7XG5cbiAgICBKb2ludC5jYWxsKHRoaXMsIGNvbmZpZyk7XG5cbiAgICB0aGlzLnR5cGUgPSBKT0lOVF9TTElERVI7XG5cbiAgICAvLyBUaGUgYXhpcyBpbiB0aGUgZmlyc3QgYm9keSdzIGNvb3JkaW5hdGUgc3lzdGVtLlxuICAgIHRoaXMubG9jYWxBeGlzMSA9IGNvbmZpZy5sb2NhbEF4aXMxLmNsb25lKCkubm9ybWFsaXplKCk7XG4gICAgLy8gVGhlIGF4aXMgaW4gdGhlIHNlY29uZCBib2R5J3MgY29vcmRpbmF0ZSBzeXN0ZW0uXG4gICAgdGhpcy5sb2NhbEF4aXMyID0gY29uZmlnLmxvY2FsQXhpczIuY2xvbmUoKS5ub3JtYWxpemUoKTtcblxuICAgIC8vIG1ha2UgYW5nbGUgYXhpc1xuICAgIHZhciBhcmMgPSBuZXcgTWF0MzMoKS5zZXRRdWF0KG5ldyBRdWF0KCkuc2V0RnJvbVVuaXRWZWN0b3JzKHRoaXMubG9jYWxBeGlzMSwgdGhpcy5sb2NhbEF4aXMyKSk7XG4gICAgdGhpcy5sb2NhbEFuZ2xlMSA9IG5ldyBWZWMzKCkudGFuZ2VudCh0aGlzLmxvY2FsQXhpczEpLm5vcm1hbGl6ZSgpO1xuICAgIHRoaXMubG9jYWxBbmdsZTIgPSB0aGlzLmxvY2FsQW5nbGUxLmNsb25lKCkuYXBwbHlNYXRyaXgzKGFyYywgdHJ1ZSk7XG5cbiAgICB0aGlzLmF4MSA9IG5ldyBWZWMzKCk7XG4gICAgdGhpcy5heDIgPSBuZXcgVmVjMygpO1xuICAgIHRoaXMuYW4xID0gbmV3IFZlYzMoKTtcbiAgICB0aGlzLmFuMiA9IG5ldyBWZWMzKCk7XG5cbiAgICB0aGlzLnRtcCA9IG5ldyBWZWMzKCk7XG5cbiAgICB0aGlzLm5vciA9IG5ldyBWZWMzKCk7XG4gICAgdGhpcy50YW4gPSBuZXcgVmVjMygpO1xuICAgIHRoaXMuYmluID0gbmV3IFZlYzMoKTtcblxuICAgIC8vIFRoZSBsaW1pdCBhbmQgbW90b3IgZm9yIHRoZSByb3RhdGlvblxuICAgIHRoaXMucm90YXRpb25hbExpbWl0TW90b3IgPSBuZXcgTGltaXRNb3Rvcih0aGlzLm5vciwgZmFsc2UpO1xuICAgIHRoaXMucjMgPSBuZXcgUm90YXRpb25hbDNDb25zdHJhaW50KHRoaXMsIHRoaXMucm90YXRpb25hbExpbWl0TW90b3IsIG5ldyBMaW1pdE1vdG9yKHRoaXMudGFuLCB0cnVlKSwgbmV3IExpbWl0TW90b3IodGhpcy5iaW4sIHRydWUpKTtcblxuICAgIC8vIFRoZSBsaW1pdCBhbmQgbW90b3IgZm9yIHRoZSB0cmFuc2xhdGlvbi5cbiAgICB0aGlzLnRyYW5zbGF0aW9uYWxMaW1pdE1vdG9yID0gbmV3IExpbWl0TW90b3IodGhpcy5ub3IsIHRydWUpO1xuICAgIHRoaXMudHJhbnNsYXRpb25hbExpbWl0TW90b3IubG93ZXJMaW1pdCA9IGxvd2VyVHJhbnNsYXRpb247XG4gICAgdGhpcy50cmFuc2xhdGlvbmFsTGltaXRNb3Rvci51cHBlckxpbWl0ID0gdXBwZXJUcmFuc2xhdGlvbjtcbiAgICB0aGlzLnQzID0gbmV3IFRyYW5zbGF0aW9uYWwzQ29uc3RyYWludCh0aGlzLCB0aGlzLnRyYW5zbGF0aW9uYWxMaW1pdE1vdG9yLCBuZXcgTGltaXRNb3Rvcih0aGlzLnRhbiwgdHJ1ZSksIG5ldyBMaW1pdE1vdG9yKHRoaXMuYmluLCB0cnVlKSk7XG5cbiAgfVxuICBTbGlkZXJKb2ludC5wcm90b3R5cGUgPSBPYmplY3QuYXNzaWduKE9iamVjdC5jcmVhdGUoSm9pbnQucHJvdG90eXBlKSwge1xuXG4gICAgY29uc3RydWN0b3I6IFNsaWRlckpvaW50LFxuXG4gICAgcHJlU29sdmU6IGZ1bmN0aW9uICh0aW1lU3RlcCwgaW52VGltZVN0ZXApIHtcblxuICAgICAgdGhpcy51cGRhdGVBbmNob3JQb2ludHMoKTtcblxuICAgICAgdGhpcy5heDEuY29weSh0aGlzLmxvY2FsQXhpczEpLmFwcGx5TWF0cml4Myh0aGlzLmJvZHkxLnJvdGF0aW9uLCB0cnVlKTtcbiAgICAgIHRoaXMuYW4xLmNvcHkodGhpcy5sb2NhbEFuZ2xlMSkuYXBwbHlNYXRyaXgzKHRoaXMuYm9keTEucm90YXRpb24sIHRydWUpO1xuXG4gICAgICB0aGlzLmF4Mi5jb3B5KHRoaXMubG9jYWxBeGlzMikuYXBwbHlNYXRyaXgzKHRoaXMuYm9keTIucm90YXRpb24sIHRydWUpO1xuICAgICAgdGhpcy5hbjIuY29weSh0aGlzLmxvY2FsQW5nbGUyKS5hcHBseU1hdHJpeDModGhpcy5ib2R5Mi5yb3RhdGlvbiwgdHJ1ZSk7XG5cbiAgICAgIC8vIG5vcm1hbCB0YW5nZW50IGJpbm9ybWFsXG5cbiAgICAgIHRoaXMubm9yLnNldChcbiAgICAgICAgdGhpcy5heDEueCAqIHRoaXMuYm9keTIuaW52ZXJzZU1hc3MgKyB0aGlzLmF4Mi54ICogdGhpcy5ib2R5MS5pbnZlcnNlTWFzcyxcbiAgICAgICAgdGhpcy5heDEueSAqIHRoaXMuYm9keTIuaW52ZXJzZU1hc3MgKyB0aGlzLmF4Mi55ICogdGhpcy5ib2R5MS5pbnZlcnNlTWFzcyxcbiAgICAgICAgdGhpcy5heDEueiAqIHRoaXMuYm9keTIuaW52ZXJzZU1hc3MgKyB0aGlzLmF4Mi56ICogdGhpcy5ib2R5MS5pbnZlcnNlTWFzc1xuICAgICAgKS5ub3JtYWxpemUoKTtcbiAgICAgIHRoaXMudGFuLnRhbmdlbnQodGhpcy5ub3IpLm5vcm1hbGl6ZSgpO1xuICAgICAgdGhpcy5iaW4uY3Jvc3NWZWN0b3JzKHRoaXMubm9yLCB0aGlzLnRhbik7XG5cbiAgICAgIC8vIGNhbGN1bGF0ZSBoaW5nZSBhbmdsZVxuXG4gICAgICB0aGlzLnRtcC5jcm9zc1ZlY3RvcnModGhpcy5hbjEsIHRoaXMuYW4yKTtcblxuICAgICAgdmFyIGxpbWl0ZSA9IF9NYXRoLmFjb3NDbGFtcChfTWF0aC5kb3RWZWN0b3JzKHRoaXMuYW4xLCB0aGlzLmFuMikpO1xuXG4gICAgICBpZiAoX01hdGguZG90VmVjdG9ycyh0aGlzLm5vciwgdGhpcy50bXApIDwgMCkgdGhpcy5yb3RhdGlvbmFsTGltaXRNb3Rvci5hbmdsZSA9IC1saW1pdGU7XG4gICAgICBlbHNlIHRoaXMucm90YXRpb25hbExpbWl0TW90b3IuYW5nbGUgPSBsaW1pdGU7XG5cbiAgICAgIC8vIGFuZ3VsYXIgZXJyb3JcblxuICAgICAgdGhpcy50bXAuY3Jvc3NWZWN0b3JzKHRoaXMuYXgxLCB0aGlzLmF4Mik7XG4gICAgICB0aGlzLnIzLmxpbWl0TW90b3IyLmFuZ2xlID0gX01hdGguZG90VmVjdG9ycyh0aGlzLnRhbiwgdGhpcy50bXApO1xuICAgICAgdGhpcy5yMy5saW1pdE1vdG9yMy5hbmdsZSA9IF9NYXRoLmRvdFZlY3RvcnModGhpcy5iaW4sIHRoaXMudG1wKTtcblxuICAgICAgLy8gcHJlU29sdmVcblxuICAgICAgdGhpcy5yMy5wcmVTb2x2ZSh0aW1lU3RlcCwgaW52VGltZVN0ZXApO1xuICAgICAgdGhpcy50My5wcmVTb2x2ZSh0aW1lU3RlcCwgaW52VGltZVN0ZXApO1xuXG4gICAgfSxcblxuICAgIHNvbHZlOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHRoaXMucjMuc29sdmUoKTtcbiAgICAgIHRoaXMudDMuc29sdmUoKTtcblxuICAgIH0sXG5cbiAgICBwb3N0U29sdmU6IGZ1bmN0aW9uICgpIHtcblxuICAgIH1cblxuICB9KTtcblxuICAvKipcbiAgICogQSB3aGVlbCBqb2ludCBhbGxvd3MgZm9yIHJlbGF0aXZlIHJvdGF0aW9uIGJldHdlZW4gdHdvIHJpZ2lkIGJvZGllcyBhbG9uZyB0d28gYXhlcy5cbiAgICogVGhlIHdoZWVsIGpvaW50IGFsc28gYWxsb3dzIGZvciByZWxhdGl2ZSB0cmFuc2xhdGlvbiBmb3IgdGhlIHN1c3BlbnNpb24uXG4gICAqXG4gICAqIEBhdXRob3Igc2FoYXJhblxuICAgKiBAYXV0aG9yIGxvLXRoXG4gICAqL1xuXG4gIGZ1bmN0aW9uIFdoZWVsSm9pbnQoY29uZmlnKSB7XG5cbiAgICBKb2ludC5jYWxsKHRoaXMsIGNvbmZpZyk7XG5cbiAgICB0aGlzLnR5cGUgPSBKT0lOVF9XSEVFTDtcblxuICAgIC8vIFRoZSBheGlzIGluIHRoZSBmaXJzdCBib2R5J3MgY29vcmRpbmF0ZSBzeXN0ZW0uXG4gICAgdGhpcy5sb2NhbEF4aXMxID0gY29uZmlnLmxvY2FsQXhpczEuY2xvbmUoKS5ub3JtYWxpemUoKTtcbiAgICAvLyBUaGUgYXhpcyBpbiB0aGUgc2Vjb25kIGJvZHkncyBjb29yZGluYXRlIHN5c3RlbS5cbiAgICB0aGlzLmxvY2FsQXhpczIgPSBjb25maWcubG9jYWxBeGlzMi5jbG9uZSgpLm5vcm1hbGl6ZSgpO1xuXG4gICAgdGhpcy5sb2NhbEFuZ2xlMSA9IG5ldyBWZWMzKCk7XG4gICAgdGhpcy5sb2NhbEFuZ2xlMiA9IG5ldyBWZWMzKCk7XG5cbiAgICB2YXIgZG90ID0gX01hdGguZG90VmVjdG9ycyh0aGlzLmxvY2FsQXhpczEsIHRoaXMubG9jYWxBeGlzMik7XG5cbiAgICBpZiAoZG90ID4gLTEgJiYgZG90IDwgMSkge1xuXG4gICAgICB0aGlzLmxvY2FsQW5nbGUxLnNldChcbiAgICAgICAgdGhpcy5sb2NhbEF4aXMyLnggLSBkb3QgKiB0aGlzLmxvY2FsQXhpczEueCxcbiAgICAgICAgdGhpcy5sb2NhbEF4aXMyLnkgLSBkb3QgKiB0aGlzLmxvY2FsQXhpczEueSxcbiAgICAgICAgdGhpcy5sb2NhbEF4aXMyLnogLSBkb3QgKiB0aGlzLmxvY2FsQXhpczEuelxuICAgICAgKS5ub3JtYWxpemUoKTtcblxuICAgICAgdGhpcy5sb2NhbEFuZ2xlMi5zZXQoXG4gICAgICAgIHRoaXMubG9jYWxBeGlzMS54IC0gZG90ICogdGhpcy5sb2NhbEF4aXMyLngsXG4gICAgICAgIHRoaXMubG9jYWxBeGlzMS55IC0gZG90ICogdGhpcy5sb2NhbEF4aXMyLnksXG4gICAgICAgIHRoaXMubG9jYWxBeGlzMS56IC0gZG90ICogdGhpcy5sb2NhbEF4aXMyLnpcbiAgICAgICkubm9ybWFsaXplKCk7XG5cbiAgICB9IGVsc2Uge1xuXG4gICAgICB2YXIgYXJjID0gbmV3IE1hdDMzKCkuc2V0UXVhdChuZXcgUXVhdCgpLnNldEZyb21Vbml0VmVjdG9ycyh0aGlzLmxvY2FsQXhpczEsIHRoaXMubG9jYWxBeGlzMikpO1xuICAgICAgdGhpcy5sb2NhbEFuZ2xlMS50YW5nZW50KHRoaXMubG9jYWxBeGlzMSkubm9ybWFsaXplKCk7XG4gICAgICB0aGlzLmxvY2FsQW5nbGUyID0gdGhpcy5sb2NhbEFuZ2xlMS5jbG9uZSgpLmFwcGx5TWF0cml4MyhhcmMsIHRydWUpO1xuXG4gICAgfVxuXG4gICAgdGhpcy5heDEgPSBuZXcgVmVjMygpO1xuICAgIHRoaXMuYXgyID0gbmV3IFZlYzMoKTtcbiAgICB0aGlzLmFuMSA9IG5ldyBWZWMzKCk7XG4gICAgdGhpcy5hbjIgPSBuZXcgVmVjMygpO1xuXG4gICAgdGhpcy50bXAgPSBuZXcgVmVjMygpO1xuXG4gICAgdGhpcy5ub3IgPSBuZXcgVmVjMygpO1xuICAgIHRoaXMudGFuID0gbmV3IFZlYzMoKTtcbiAgICB0aGlzLmJpbiA9IG5ldyBWZWMzKCk7XG5cbiAgICAvLyBUaGUgdHJhbnNsYXRpb25hbCBsaW1pdCBhbmQgbW90b3IgaW5mb3JtYXRpb24gb2YgdGhlIGpvaW50LlxuICAgIHRoaXMudHJhbnNsYXRpb25hbExpbWl0TW90b3IgPSBuZXcgTGltaXRNb3Rvcih0aGlzLnRhbiwgdHJ1ZSk7XG4gICAgdGhpcy50cmFuc2xhdGlvbmFsTGltaXRNb3Rvci5mcmVxdWVuY3kgPSA4O1xuICAgIHRoaXMudHJhbnNsYXRpb25hbExpbWl0TW90b3IuZGFtcGluZ1JhdGlvID0gMTtcbiAgICAvLyBUaGUgZmlyc3Qgcm90YXRpb25hbCBsaW1pdCBhbmQgbW90b3IgaW5mb3JtYXRpb24gb2YgdGhlIGpvaW50LlxuICAgIHRoaXMucm90YXRpb25hbExpbWl0TW90b3IxID0gbmV3IExpbWl0TW90b3IodGhpcy50YW4sIGZhbHNlKTtcbiAgICAvLyBUaGUgc2Vjb25kIHJvdGF0aW9uYWwgbGltaXQgYW5kIG1vdG9yIGluZm9ybWF0aW9uIG9mIHRoZSBqb2ludC5cbiAgICB0aGlzLnJvdGF0aW9uYWxMaW1pdE1vdG9yMiA9IG5ldyBMaW1pdE1vdG9yKHRoaXMuYmluLCBmYWxzZSk7XG5cbiAgICB0aGlzLnQzID0gbmV3IFRyYW5zbGF0aW9uYWwzQ29uc3RyYWludCh0aGlzLCBuZXcgTGltaXRNb3Rvcih0aGlzLm5vciwgdHJ1ZSksIHRoaXMudHJhbnNsYXRpb25hbExpbWl0TW90b3IsIG5ldyBMaW1pdE1vdG9yKHRoaXMuYmluLCB0cnVlKSk7XG4gICAgdGhpcy50My53ZWlnaHQgPSAxO1xuICAgIHRoaXMucjMgPSBuZXcgUm90YXRpb25hbDNDb25zdHJhaW50KHRoaXMsIG5ldyBMaW1pdE1vdG9yKHRoaXMubm9yLCB0cnVlKSwgdGhpcy5yb3RhdGlvbmFsTGltaXRNb3RvcjEsIHRoaXMucm90YXRpb25hbExpbWl0TW90b3IyKTtcblxuICB9XG4gIFdoZWVsSm9pbnQucHJvdG90eXBlID0gT2JqZWN0LmFzc2lnbihPYmplY3QuY3JlYXRlKEpvaW50LnByb3RvdHlwZSksIHtcblxuICAgIGNvbnN0cnVjdG9yOiBXaGVlbEpvaW50LFxuXG4gICAgcHJlU29sdmU6IGZ1bmN0aW9uICh0aW1lU3RlcCwgaW52VGltZVN0ZXApIHtcblxuICAgICAgdGhpcy51cGRhdGVBbmNob3JQb2ludHMoKTtcblxuICAgICAgdGhpcy5heDEuY29weSh0aGlzLmxvY2FsQXhpczEpLmFwcGx5TWF0cml4Myh0aGlzLmJvZHkxLnJvdGF0aW9uLCB0cnVlKTtcbiAgICAgIHRoaXMuYW4xLmNvcHkodGhpcy5sb2NhbEFuZ2xlMSkuYXBwbHlNYXRyaXgzKHRoaXMuYm9keTEucm90YXRpb24sIHRydWUpO1xuXG4gICAgICB0aGlzLmF4Mi5jb3B5KHRoaXMubG9jYWxBeGlzMikuYXBwbHlNYXRyaXgzKHRoaXMuYm9keTIucm90YXRpb24sIHRydWUpO1xuICAgICAgdGhpcy5hbjIuY29weSh0aGlzLmxvY2FsQW5nbGUyKS5hcHBseU1hdHJpeDModGhpcy5ib2R5Mi5yb3RhdGlvbiwgdHJ1ZSk7XG5cbiAgICAgIHRoaXMucjMubGltaXRNb3RvcjEuYW5nbGUgPSBfTWF0aC5kb3RWZWN0b3JzKHRoaXMuYXgxLCB0aGlzLmF4Mik7XG5cbiAgICAgIHZhciBsaW1pdGUgPSBfTWF0aC5kb3RWZWN0b3JzKHRoaXMuYW4xLCB0aGlzLmF4Mik7XG5cbiAgICAgIGlmIChfTWF0aC5kb3RWZWN0b3JzKHRoaXMuYXgxLCB0aGlzLnRtcC5jcm9zc1ZlY3RvcnModGhpcy5hbjEsIHRoaXMuYXgyKSkgPCAwKSB0aGlzLnJvdGF0aW9uYWxMaW1pdE1vdG9yMS5hbmdsZSA9IC1saW1pdGU7XG4gICAgICBlbHNlIHRoaXMucm90YXRpb25hbExpbWl0TW90b3IxLmFuZ2xlID0gbGltaXRlO1xuXG4gICAgICBsaW1pdGUgPSBfTWF0aC5kb3RWZWN0b3JzKHRoaXMuYW4yLCB0aGlzLmF4MSk7XG5cbiAgICAgIGlmIChfTWF0aC5kb3RWZWN0b3JzKHRoaXMuYXgyLCB0aGlzLnRtcC5jcm9zc1ZlY3RvcnModGhpcy5hbjIsIHRoaXMuYXgxKSkgPCAwKSB0aGlzLnJvdGF0aW9uYWxMaW1pdE1vdG9yMi5hbmdsZSA9IC1saW1pdGU7XG4gICAgICBlbHNlIHRoaXMucm90YXRpb25hbExpbWl0TW90b3IyLmFuZ2xlID0gbGltaXRlO1xuXG4gICAgICB0aGlzLm5vci5jcm9zc1ZlY3RvcnModGhpcy5heDEsIHRoaXMuYXgyKS5ub3JtYWxpemUoKTtcbiAgICAgIHRoaXMudGFuLmNyb3NzVmVjdG9ycyh0aGlzLm5vciwgdGhpcy5heDIpLm5vcm1hbGl6ZSgpO1xuICAgICAgdGhpcy5iaW4uY3Jvc3NWZWN0b3JzKHRoaXMubm9yLCB0aGlzLmF4MSkubm9ybWFsaXplKCk7XG5cbiAgICAgIHRoaXMucjMucHJlU29sdmUodGltZVN0ZXAsIGludlRpbWVTdGVwKTtcbiAgICAgIHRoaXMudDMucHJlU29sdmUodGltZVN0ZXAsIGludlRpbWVTdGVwKTtcblxuICAgIH0sXG5cbiAgICBzb2x2ZTogZnVuY3Rpb24gKCkge1xuXG4gICAgICB0aGlzLnIzLnNvbHZlKCk7XG4gICAgICB0aGlzLnQzLnNvbHZlKCk7XG5cbiAgICB9LFxuXG4gICAgcG9zdFNvbHZlOiBmdW5jdGlvbiAoKSB7XG5cbiAgICB9XG5cbiAgfSk7XG5cbiAgZnVuY3Rpb24gSm9pbnRDb25maWcoKSB7XG5cbiAgICB0aGlzLnNjYWxlID0gMTtcbiAgICB0aGlzLmludlNjYWxlID0gMTtcblxuICAgIC8vIFRoZSBmaXJzdCByaWdpZCBib2R5IG9mIHRoZSBqb2ludC5cbiAgICB0aGlzLmJvZHkxID0gbnVsbDtcbiAgICAvLyBUaGUgc2Vjb25kIHJpZ2lkIGJvZHkgb2YgdGhlIGpvaW50LlxuICAgIHRoaXMuYm9keTIgPSBudWxsO1xuICAgIC8vIFRoZSBhbmNob3IgcG9pbnQgb24gdGhlIGZpcnN0IHJpZ2lkIGJvZHkgaW4gbG9jYWwgY29vcmRpbmF0ZSBzeXN0ZW0uXG4gICAgdGhpcy5sb2NhbEFuY2hvclBvaW50MSA9IG5ldyBWZWMzKCk7XG4gICAgLy8gIFRoZSBhbmNob3IgcG9pbnQgb24gdGhlIHNlY29uZCByaWdpZCBib2R5IGluIGxvY2FsIGNvb3JkaW5hdGUgc3lzdGVtLlxuICAgIHRoaXMubG9jYWxBbmNob3JQb2ludDIgPSBuZXcgVmVjMygpO1xuICAgIC8vIFRoZSBheGlzIGluIHRoZSBmaXJzdCBib2R5J3MgY29vcmRpbmF0ZSBzeXN0ZW0uXG4gICAgLy8gaGlzIHByb3BlcnR5IGlzIGF2YWlsYWJsZSBpbiBzb21lIGpvaW50cy5cbiAgICB0aGlzLmxvY2FsQXhpczEgPSBuZXcgVmVjMygpO1xuICAgIC8vIFRoZSBheGlzIGluIHRoZSBzZWNvbmQgYm9keSdzIGNvb3JkaW5hdGUgc3lzdGVtLlxuICAgIC8vIFRoaXMgcHJvcGVydHkgaXMgYXZhaWxhYmxlIGluIHNvbWUgam9pbnRzLlxuICAgIHRoaXMubG9jYWxBeGlzMiA9IG5ldyBWZWMzKCk7XG4gICAgLy8gIFdoZXRoZXIgYWxsb3cgY29sbGlzaW9uIGJldHdlZW4gY29ubmVjdGVkIHJpZ2lkIGJvZGllcyBvciBub3QuXG4gICAgdGhpcy5hbGxvd0NvbGxpc2lvbiA9IGZhbHNlO1xuXG4gIH1cblxuICAvKipcbiAgICogVGhpcyBjbGFzcyBob2xkcyBtYXNzIGluZm9ybWF0aW9uIG9mIGEgc2hhcGUuXG4gICAqIEBhdXRob3IgbG8tdGhcbiAgICogQGF1dGhvciBzYWhhcmFuXG4gICAqL1xuXG4gIGZ1bmN0aW9uIE1hc3NJbmZvKCkge1xuXG4gICAgLy8gTWFzcyBvZiB0aGUgc2hhcGUuXG4gICAgdGhpcy5tYXNzID0gMDtcblxuICAgIC8vIFRoZSBtb21lbnQgaW5lcnRpYSBvZiB0aGUgc2hhcGUuXG4gICAgdGhpcy5pbmVydGlhID0gbmV3IE1hdDMzKCk7XG5cbiAgfVxuXG4gIC8qKlxuICAqIEEgbGluayBsaXN0IG9mIGNvbnRhY3RzLlxuICAqIEBhdXRob3Igc2FoYXJhblxuICAqL1xuICBmdW5jdGlvbiBDb250YWN0TGluayhjb250YWN0KSB7XG5cbiAgICAvLyBUaGUgcHJldmlvdXMgY29udGFjdCBsaW5rLlxuICAgIHRoaXMucHJldiA9IG51bGw7XG4gICAgLy8gVGhlIG5leHQgY29udGFjdCBsaW5rLlxuICAgIHRoaXMubmV4dCA9IG51bGw7XG4gICAgLy8gVGhlIHNoYXBlIG9mIHRoZSBjb250YWN0LlxuICAgIHRoaXMuc2hhcGUgPSBudWxsO1xuICAgIC8vIFRoZSBvdGhlciByaWdpZCBib2R5LlxuICAgIHRoaXMuYm9keSA9IG51bGw7XG4gICAgLy8gVGhlIGNvbnRhY3Qgb2YgdGhlIGxpbmsuXG4gICAgdGhpcy5jb250YWN0ID0gY29udGFjdDtcblxuICB9XG5cbiAgZnVuY3Rpb24gSW1wdWxzZURhdGFCdWZmZXIoKSB7XG5cbiAgICB0aGlzLmxwMVggPSBOYU47XG4gICAgdGhpcy5scDFZID0gTmFOO1xuICAgIHRoaXMubHAxWiA9IE5hTjtcbiAgICB0aGlzLmxwMlggPSBOYU47XG4gICAgdGhpcy5scDJZID0gTmFOO1xuICAgIHRoaXMubHAyWiA9IE5hTjtcbiAgICB0aGlzLmltcHVsc2UgPSBOYU47XG5cbiAgfVxuXG4gIC8qKlxuICAqIFRoZSBjbGFzcyBob2xkcyBkZXRhaWxzIG9mIHRoZSBjb250YWN0IHBvaW50LlxuICAqIEBhdXRob3Igc2FoYXJhblxuICAqL1xuXG4gIGZ1bmN0aW9uIE1hbmlmb2xkUG9pbnQoKSB7XG5cbiAgICAvLyBXaGV0aGVyIHRoaXMgbWFuaWZvbGQgcG9pbnQgaXMgcGVyc2lzdGluZyBvciBub3QuXG4gICAgdGhpcy53YXJtU3RhcnRlZCA9IGZhbHNlO1xuICAgIC8vICBUaGUgcG9zaXRpb24gb2YgdGhpcyBtYW5pZm9sZCBwb2ludC5cbiAgICB0aGlzLnBvc2l0aW9uID0gbmV3IFZlYzMoKTtcbiAgICAvLyBUaGUgcG9zaXRpb24gaW4gdGhlIGZpcnN0IHNoYXBlJ3MgY29vcmRpbmF0ZS5cbiAgICB0aGlzLmxvY2FsUG9pbnQxID0gbmV3IFZlYzMoKTtcbiAgICAvLyAgVGhlIHBvc2l0aW9uIGluIHRoZSBzZWNvbmQgc2hhcGUncyBjb29yZGluYXRlLlxuICAgIHRoaXMubG9jYWxQb2ludDIgPSBuZXcgVmVjMygpO1xuICAgIC8vIFRoZSBub3JtYWwgdmVjdG9yIG9mIHRoaXMgbWFuaWZvbGQgcG9pbnQuXG4gICAgdGhpcy5ub3JtYWwgPSBuZXcgVmVjMygpO1xuICAgIC8vIFRoZSB0YW5nZW50IHZlY3RvciBvZiB0aGlzIG1hbmlmb2xkIHBvaW50LlxuICAgIHRoaXMudGFuZ2VudCA9IG5ldyBWZWMzKCk7XG4gICAgLy8gVGhlIGJpbm9ybWFsIHZlY3RvciBvZiB0aGlzIG1hbmlmb2xkIHBvaW50LlxuICAgIHRoaXMuYmlub3JtYWwgPSBuZXcgVmVjMygpO1xuICAgIC8vIFRoZSBpbXB1bHNlIGluIG5vcm1hbCBkaXJlY3Rpb24uXG4gICAgdGhpcy5ub3JtYWxJbXB1bHNlID0gMDtcbiAgICAvLyBUaGUgaW1wdWxzZSBpbiB0YW5nZW50IGRpcmVjdGlvbi5cbiAgICB0aGlzLnRhbmdlbnRJbXB1bHNlID0gMDtcbiAgICAvLyBUaGUgaW1wdWxzZSBpbiBiaW5vcm1hbCBkaXJlY3Rpb24uXG4gICAgdGhpcy5iaW5vcm1hbEltcHVsc2UgPSAwO1xuICAgIC8vIFRoZSBkZW5vbWluYXRvciBpbiBub3JtYWwgZGlyZWN0aW9uLlxuICAgIHRoaXMubm9ybWFsRGVub21pbmF0b3IgPSAwO1xuICAgIC8vIFRoZSBkZW5vbWluYXRvciBpbiB0YW5nZW50IGRpcmVjdGlvbi5cbiAgICB0aGlzLnRhbmdlbnREZW5vbWluYXRvciA9IDA7XG4gICAgLy8gVGhlIGRlbm9taW5hdG9yIGluIGJpbm9ybWFsIGRpcmVjdGlvbi5cbiAgICB0aGlzLmJpbm9ybWFsRGVub21pbmF0b3IgPSAwO1xuICAgIC8vIFRoZSBkZXB0aCBvZiBwZW5ldHJhdGlvbi5cbiAgICB0aGlzLnBlbmV0cmF0aW9uID0gMDtcblxuICB9XG5cbiAgLyoqXG4gICogQSBjb250YWN0IG1hbmlmb2xkIGJldHdlZW4gdHdvIHNoYXBlcy5cbiAgKiBAYXV0aG9yIHNhaGFyYW5cbiAgKiBAYXV0aG9yIGxvLXRoXG4gICovXG5cbiAgZnVuY3Rpb24gQ29udGFjdE1hbmlmb2xkKCkge1xuXG4gICAgLy8gVGhlIGZpcnN0IHJpZ2lkIGJvZHkuXG4gICAgdGhpcy5ib2R5MSA9IG51bGw7XG4gICAgLy8gVGhlIHNlY29uZCByaWdpZCBib2R5LlxuICAgIHRoaXMuYm9keTIgPSBudWxsO1xuICAgIC8vIFRoZSBudW1iZXIgb2YgbWFuaWZvbGQgcG9pbnRzLlxuICAgIHRoaXMubnVtUG9pbnRzID0gMDtcbiAgICAvLyBUaGUgbWFuaWZvbGQgcG9pbnRzLlxuICAgIHRoaXMucG9pbnRzID0gW1xuICAgICAgbmV3IE1hbmlmb2xkUG9pbnQoKSxcbiAgICAgIG5ldyBNYW5pZm9sZFBvaW50KCksXG4gICAgICBuZXcgTWFuaWZvbGRQb2ludCgpLFxuICAgICAgbmV3IE1hbmlmb2xkUG9pbnQoKVxuICAgIF07XG5cbiAgfVxuXG4gIENvbnRhY3RNYW5pZm9sZC5wcm90b3R5cGUgPSB7XG5cbiAgICBjb25zdHJ1Y3RvcjogQ29udGFjdE1hbmlmb2xkLFxuXG4gICAgLy9SZXNldCB0aGUgbWFuaWZvbGQuXG4gICAgcmVzZXQ6IGZ1bmN0aW9uIChzaGFwZTEsIHNoYXBlMikge1xuXG4gICAgICB0aGlzLmJvZHkxID0gc2hhcGUxLnBhcmVudDtcbiAgICAgIHRoaXMuYm9keTIgPSBzaGFwZTIucGFyZW50O1xuICAgICAgdGhpcy5udW1Qb2ludHMgPSAwO1xuXG4gICAgfSxcblxuICAgIC8vICBBZGQgYSBwb2ludCBpbnRvIHRoaXMgbWFuaWZvbGQuXG4gICAgYWRkUG9pbnRWZWM6IGZ1bmN0aW9uIChwb3MsIG5vcm0sIHBlbmV0cmF0aW9uLCBmbGlwKSB7XG5cbiAgICAgIHZhciBwID0gdGhpcy5wb2ludHNbdGhpcy5udW1Qb2ludHMrK107XG5cbiAgICAgIHAucG9zaXRpb24uY29weShwb3MpO1xuICAgICAgcC5sb2NhbFBvaW50MS5zdWIocG9zLCB0aGlzLmJvZHkxLnBvc2l0aW9uKS5hcHBseU1hdHJpeDModGhpcy5ib2R5MS5yb3RhdGlvbik7XG4gICAgICBwLmxvY2FsUG9pbnQyLnN1Yihwb3MsIHRoaXMuYm9keTIucG9zaXRpb24pLmFwcGx5TWF0cml4Myh0aGlzLmJvZHkyLnJvdGF0aW9uKTtcblxuICAgICAgcC5ub3JtYWwuY29weShub3JtKTtcbiAgICAgIGlmIChmbGlwKSBwLm5vcm1hbC5uZWdhdGUoKTtcblxuICAgICAgcC5ub3JtYWxJbXB1bHNlID0gMDtcbiAgICAgIHAucGVuZXRyYXRpb24gPSBwZW5ldHJhdGlvbjtcbiAgICAgIHAud2FybVN0YXJ0ZWQgPSBmYWxzZTtcblxuICAgIH0sXG5cbiAgICAvLyAgQWRkIGEgcG9pbnQgaW50byB0aGlzIG1hbmlmb2xkLlxuICAgIGFkZFBvaW50OiBmdW5jdGlvbiAoeCwgeSwgeiwgbngsIG55LCBueiwgcGVuZXRyYXRpb24sIGZsaXApIHtcblxuICAgICAgdmFyIHAgPSB0aGlzLnBvaW50c1t0aGlzLm51bVBvaW50cysrXTtcblxuICAgICAgcC5wb3NpdGlvbi5zZXQoeCwgeSwgeik7XG4gICAgICBwLmxvY2FsUG9pbnQxLnN1YihwLnBvc2l0aW9uLCB0aGlzLmJvZHkxLnBvc2l0aW9uKS5hcHBseU1hdHJpeDModGhpcy5ib2R5MS5yb3RhdGlvbik7XG4gICAgICBwLmxvY2FsUG9pbnQyLnN1YihwLnBvc2l0aW9uLCB0aGlzLmJvZHkyLnBvc2l0aW9uKS5hcHBseU1hdHJpeDModGhpcy5ib2R5Mi5yb3RhdGlvbik7XG5cbiAgICAgIHAubm9ybWFsSW1wdWxzZSA9IDA7XG5cbiAgICAgIHAubm9ybWFsLnNldChueCwgbnksIG56KTtcbiAgICAgIGlmIChmbGlwKSBwLm5vcm1hbC5uZWdhdGUoKTtcblxuICAgICAgcC5wZW5ldHJhdGlvbiA9IHBlbmV0cmF0aW9uO1xuICAgICAgcC53YXJtU3RhcnRlZCA9IGZhbHNlO1xuXG4gICAgfVxuICB9O1xuXG4gIGZ1bmN0aW9uIENvbnRhY3RQb2ludERhdGFCdWZmZXIoKSB7XG5cbiAgICB0aGlzLm5vciA9IG5ldyBWZWMzKCk7XG4gICAgdGhpcy50YW4gPSBuZXcgVmVjMygpO1xuICAgIHRoaXMuYmluID0gbmV3IFZlYzMoKTtcblxuICAgIHRoaXMubm9yVTEgPSBuZXcgVmVjMygpO1xuICAgIHRoaXMudGFuVTEgPSBuZXcgVmVjMygpO1xuICAgIHRoaXMuYmluVTEgPSBuZXcgVmVjMygpO1xuXG4gICAgdGhpcy5ub3JVMiA9IG5ldyBWZWMzKCk7XG4gICAgdGhpcy50YW5VMiA9IG5ldyBWZWMzKCk7XG4gICAgdGhpcy5iaW5VMiA9IG5ldyBWZWMzKCk7XG5cbiAgICB0aGlzLm5vclQxID0gbmV3IFZlYzMoKTtcbiAgICB0aGlzLnRhblQxID0gbmV3IFZlYzMoKTtcbiAgICB0aGlzLmJpblQxID0gbmV3IFZlYzMoKTtcblxuICAgIHRoaXMubm9yVDIgPSBuZXcgVmVjMygpO1xuICAgIHRoaXMudGFuVDIgPSBuZXcgVmVjMygpO1xuICAgIHRoaXMuYmluVDIgPSBuZXcgVmVjMygpO1xuXG4gICAgdGhpcy5ub3JUVTEgPSBuZXcgVmVjMygpO1xuICAgIHRoaXMudGFuVFUxID0gbmV3IFZlYzMoKTtcbiAgICB0aGlzLmJpblRVMSA9IG5ldyBWZWMzKCk7XG5cbiAgICB0aGlzLm5vclRVMiA9IG5ldyBWZWMzKCk7XG4gICAgdGhpcy50YW5UVTIgPSBuZXcgVmVjMygpO1xuICAgIHRoaXMuYmluVFUyID0gbmV3IFZlYzMoKTtcblxuICAgIHRoaXMubm9ySW1wID0gMDtcbiAgICB0aGlzLnRhbkltcCA9IDA7XG4gICAgdGhpcy5iaW5JbXAgPSAwO1xuXG4gICAgdGhpcy5ub3JEZW4gPSAwO1xuICAgIHRoaXMudGFuRGVuID0gMDtcbiAgICB0aGlzLmJpbkRlbiA9IDA7XG5cbiAgICB0aGlzLm5vclRhciA9IDA7XG5cbiAgICB0aGlzLm5leHQgPSBudWxsO1xuICAgIHRoaXMubGFzdCA9IGZhbHNlO1xuXG4gIH1cblxuICAvKipcbiAgKiAuLi5cbiAgKiBAYXV0aG9yIHNhaGFyYW5cbiAgKi9cbiAgZnVuY3Rpb24gQ29udGFjdENvbnN0cmFpbnQobWFuaWZvbGQpIHtcblxuICAgIENvbnN0cmFpbnQuY2FsbCh0aGlzKTtcbiAgICAvLyBUaGUgY29udGFjdCBtYW5pZm9sZCBvZiB0aGUgY29uc3RyYWludC5cbiAgICB0aGlzLm1hbmlmb2xkID0gbWFuaWZvbGQ7XG4gICAgLy8gVGhlIGNvZWZmaWNpZW50IG9mIHJlc3RpdHV0aW9uIG9mIHRoZSBjb25zdHJhaW50LlxuICAgIHRoaXMucmVzdGl0dXRpb24gPSBOYU47XG4gICAgLy8gVGhlIGNvZWZmaWNpZW50IG9mIGZyaWN0aW9uIG9mIHRoZSBjb25zdHJhaW50LlxuICAgIHRoaXMuZnJpY3Rpb24gPSBOYU47XG4gICAgdGhpcy5wMSA9IG51bGw7XG4gICAgdGhpcy5wMiA9IG51bGw7XG4gICAgdGhpcy5sdjEgPSBudWxsO1xuICAgIHRoaXMubHYyID0gbnVsbDtcbiAgICB0aGlzLmF2MSA9IG51bGw7XG4gICAgdGhpcy5hdjIgPSBudWxsO1xuICAgIHRoaXMuaTEgPSBudWxsO1xuICAgIHRoaXMuaTIgPSBudWxsO1xuXG4gICAgLy90aGlzLmlpMSA9IG51bGw7XG4gICAgLy90aGlzLmlpMiA9IG51bGw7XG5cbiAgICB0aGlzLnRtcCA9IG5ldyBWZWMzKCk7XG4gICAgdGhpcy50bXBDMSA9IG5ldyBWZWMzKCk7XG4gICAgdGhpcy50bXBDMiA9IG5ldyBWZWMzKCk7XG5cbiAgICB0aGlzLnRtcFAxID0gbmV3IFZlYzMoKTtcbiAgICB0aGlzLnRtcFAyID0gbmV3IFZlYzMoKTtcblxuICAgIHRoaXMudG1wbHYxID0gbmV3IFZlYzMoKTtcbiAgICB0aGlzLnRtcGx2MiA9IG5ldyBWZWMzKCk7XG4gICAgdGhpcy50bXBhdjEgPSBuZXcgVmVjMygpO1xuICAgIHRoaXMudG1wYXYyID0gbmV3IFZlYzMoKTtcblxuICAgIHRoaXMubTEgPSBOYU47XG4gICAgdGhpcy5tMiA9IE5hTjtcbiAgICB0aGlzLm51bSA9IDA7XG5cbiAgICB0aGlzLnBzID0gbWFuaWZvbGQucG9pbnRzO1xuICAgIHRoaXMuY3MgPSBuZXcgQ29udGFjdFBvaW50RGF0YUJ1ZmZlcigpO1xuICAgIHRoaXMuY3MubmV4dCA9IG5ldyBDb250YWN0UG9pbnREYXRhQnVmZmVyKCk7XG4gICAgdGhpcy5jcy5uZXh0Lm5leHQgPSBuZXcgQ29udGFjdFBvaW50RGF0YUJ1ZmZlcigpO1xuICAgIHRoaXMuY3MubmV4dC5uZXh0Lm5leHQgPSBuZXcgQ29udGFjdFBvaW50RGF0YUJ1ZmZlcigpO1xuICB9XG5cbiAgQ29udGFjdENvbnN0cmFpbnQucHJvdG90eXBlID0gT2JqZWN0LmFzc2lnbihPYmplY3QuY3JlYXRlKENvbnN0cmFpbnQucHJvdG90eXBlKSwge1xuXG4gICAgY29uc3RydWN0b3I6IENvbnRhY3RDb25zdHJhaW50LFxuXG4gICAgLy8gQXR0YWNoIHRoZSBjb25zdHJhaW50IHRvIHRoZSBib2RpZXMuXG4gICAgYXR0YWNoOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHRoaXMucDEgPSB0aGlzLmJvZHkxLnBvc2l0aW9uO1xuICAgICAgdGhpcy5wMiA9IHRoaXMuYm9keTIucG9zaXRpb247XG4gICAgICB0aGlzLmx2MSA9IHRoaXMuYm9keTEubGluZWFyVmVsb2NpdHk7XG4gICAgICB0aGlzLmF2MSA9IHRoaXMuYm9keTEuYW5ndWxhclZlbG9jaXR5O1xuICAgICAgdGhpcy5sdjIgPSB0aGlzLmJvZHkyLmxpbmVhclZlbG9jaXR5O1xuICAgICAgdGhpcy5hdjIgPSB0aGlzLmJvZHkyLmFuZ3VsYXJWZWxvY2l0eTtcbiAgICAgIHRoaXMuaTEgPSB0aGlzLmJvZHkxLmludmVyc2VJbmVydGlhO1xuICAgICAgdGhpcy5pMiA9IHRoaXMuYm9keTIuaW52ZXJzZUluZXJ0aWE7XG5cbiAgICB9LFxuXG4gICAgLy8gRGV0YWNoIHRoZSBjb25zdHJhaW50IGZyb20gdGhlIGJvZGllcy5cbiAgICBkZXRhY2g6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgdGhpcy5wMSA9IG51bGw7XG4gICAgICB0aGlzLnAyID0gbnVsbDtcbiAgICAgIHRoaXMubHYxID0gbnVsbDtcbiAgICAgIHRoaXMubHYyID0gbnVsbDtcbiAgICAgIHRoaXMuYXYxID0gbnVsbDtcbiAgICAgIHRoaXMuYXYyID0gbnVsbDtcbiAgICAgIHRoaXMuaTEgPSBudWxsO1xuICAgICAgdGhpcy5pMiA9IG51bGw7XG5cbiAgICB9LFxuXG4gICAgcHJlU29sdmU6IGZ1bmN0aW9uICh0aW1lU3RlcCwgaW52VGltZVN0ZXApIHtcblxuICAgICAgdGhpcy5tMSA9IHRoaXMuYm9keTEuaW52ZXJzZU1hc3M7XG4gICAgICB0aGlzLm0yID0gdGhpcy5ib2R5Mi5pbnZlcnNlTWFzcztcblxuICAgICAgdmFyIG0xbTIgPSB0aGlzLm0xICsgdGhpcy5tMjtcblxuICAgICAgdGhpcy5udW0gPSB0aGlzLm1hbmlmb2xkLm51bVBvaW50cztcblxuICAgICAgdmFyIGMgPSB0aGlzLmNzO1xuICAgICAgdmFyIHAsIHJ2biwgbGVuLCBub3JJbXAsIG5vclRhciwgc2VwViwgaTEsIGkyO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm51bTsgaSsrKSB7XG5cbiAgICAgICAgcCA9IHRoaXMucHNbaV07XG5cbiAgICAgICAgdGhpcy50bXBQMS5zdWIocC5wb3NpdGlvbiwgdGhpcy5wMSk7XG4gICAgICAgIHRoaXMudG1wUDIuc3ViKHAucG9zaXRpb24sIHRoaXMucDIpO1xuXG4gICAgICAgIHRoaXMudG1wQzEuY3Jvc3NWZWN0b3JzKHRoaXMuYXYxLCB0aGlzLnRtcFAxKTtcbiAgICAgICAgdGhpcy50bXBDMi5jcm9zc1ZlY3RvcnModGhpcy5hdjIsIHRoaXMudG1wUDIpO1xuXG4gICAgICAgIGMubm9ySW1wID0gcC5ub3JtYWxJbXB1bHNlO1xuICAgICAgICBjLnRhbkltcCA9IHAudGFuZ2VudEltcHVsc2U7XG4gICAgICAgIGMuYmluSW1wID0gcC5iaW5vcm1hbEltcHVsc2U7XG5cbiAgICAgICAgYy5ub3IuY29weShwLm5vcm1hbCk7XG5cbiAgICAgICAgdGhpcy50bXAuc2V0KFxuXG4gICAgICAgICAgKHRoaXMubHYyLnggKyB0aGlzLnRtcEMyLngpIC0gKHRoaXMubHYxLnggKyB0aGlzLnRtcEMxLngpLFxuICAgICAgICAgICh0aGlzLmx2Mi55ICsgdGhpcy50bXBDMi55KSAtICh0aGlzLmx2MS55ICsgdGhpcy50bXBDMS55KSxcbiAgICAgICAgICAodGhpcy5sdjIueiArIHRoaXMudG1wQzIueikgLSAodGhpcy5sdjEueiArIHRoaXMudG1wQzEueilcblxuICAgICAgICApO1xuXG4gICAgICAgIHJ2biA9IF9NYXRoLmRvdFZlY3RvcnMoYy5ub3IsIHRoaXMudG1wKTtcblxuICAgICAgICBjLnRhbi5zZXQoXG4gICAgICAgICAgdGhpcy50bXAueCAtIHJ2biAqIGMubm9yLngsXG4gICAgICAgICAgdGhpcy50bXAueSAtIHJ2biAqIGMubm9yLnksXG4gICAgICAgICAgdGhpcy50bXAueiAtIHJ2biAqIGMubm9yLnpcbiAgICAgICAgKTtcblxuICAgICAgICBsZW4gPSBfTWF0aC5kb3RWZWN0b3JzKGMudGFuLCBjLnRhbik7XG5cbiAgICAgICAgaWYgKGxlbiA8PSAwLjA0KSB7XG4gICAgICAgICAgYy50YW4udGFuZ2VudChjLm5vcik7XG4gICAgICAgIH1cblxuICAgICAgICBjLnRhbi5ub3JtYWxpemUoKTtcblxuICAgICAgICBjLmJpbi5jcm9zc1ZlY3RvcnMoYy5ub3IsIGMudGFuKTtcblxuICAgICAgICBjLm5vclUxLnNjYWxlKGMubm9yLCB0aGlzLm0xKTtcbiAgICAgICAgYy5ub3JVMi5zY2FsZShjLm5vciwgdGhpcy5tMik7XG5cbiAgICAgICAgYy50YW5VMS5zY2FsZShjLnRhbiwgdGhpcy5tMSk7XG4gICAgICAgIGMudGFuVTIuc2NhbGUoYy50YW4sIHRoaXMubTIpO1xuXG4gICAgICAgIGMuYmluVTEuc2NhbGUoYy5iaW4sIHRoaXMubTEpO1xuICAgICAgICBjLmJpblUyLnNjYWxlKGMuYmluLCB0aGlzLm0yKTtcblxuICAgICAgICBjLm5vclQxLmNyb3NzVmVjdG9ycyh0aGlzLnRtcFAxLCBjLm5vcik7XG4gICAgICAgIGMudGFuVDEuY3Jvc3NWZWN0b3JzKHRoaXMudG1wUDEsIGMudGFuKTtcbiAgICAgICAgYy5iaW5UMS5jcm9zc1ZlY3RvcnModGhpcy50bXBQMSwgYy5iaW4pO1xuXG4gICAgICAgIGMubm9yVDIuY3Jvc3NWZWN0b3JzKHRoaXMudG1wUDIsIGMubm9yKTtcbiAgICAgICAgYy50YW5UMi5jcm9zc1ZlY3RvcnModGhpcy50bXBQMiwgYy50YW4pO1xuICAgICAgICBjLmJpblQyLmNyb3NzVmVjdG9ycyh0aGlzLnRtcFAyLCBjLmJpbik7XG5cbiAgICAgICAgaTEgPSB0aGlzLmkxO1xuICAgICAgICBpMiA9IHRoaXMuaTI7XG5cbiAgICAgICAgYy5ub3JUVTEuY29weShjLm5vclQxKS5hcHBseU1hdHJpeDMoaTEsIHRydWUpO1xuICAgICAgICBjLnRhblRVMS5jb3B5KGMudGFuVDEpLmFwcGx5TWF0cml4MyhpMSwgdHJ1ZSk7XG4gICAgICAgIGMuYmluVFUxLmNvcHkoYy5iaW5UMSkuYXBwbHlNYXRyaXgzKGkxLCB0cnVlKTtcblxuICAgICAgICBjLm5vclRVMi5jb3B5KGMubm9yVDIpLmFwcGx5TWF0cml4MyhpMiwgdHJ1ZSk7XG4gICAgICAgIGMudGFuVFUyLmNvcHkoYy50YW5UMikuYXBwbHlNYXRyaXgzKGkyLCB0cnVlKTtcbiAgICAgICAgYy5iaW5UVTIuY29weShjLmJpblQyKS5hcHBseU1hdHJpeDMoaTIsIHRydWUpO1xuXG4gICAgICAgIC8qYy5ub3JUVTEubXVsTWF0KCB0aGlzLmkxLCBjLm5vclQxICk7XG4gICAgICAgIGMudGFuVFUxLm11bE1hdCggdGhpcy5pMSwgYy50YW5UMSApO1xuICAgICAgICBjLmJpblRVMS5tdWxNYXQoIHRoaXMuaTEsIGMuYmluVDEgKTtcblxuICAgICAgICBjLm5vclRVMi5tdWxNYXQoIHRoaXMuaTIsIGMubm9yVDIgKTtcbiAgICAgICAgYy50YW5UVTIubXVsTWF0KCB0aGlzLmkyLCBjLnRhblQyICk7XG4gICAgICAgIGMuYmluVFUyLm11bE1hdCggdGhpcy5pMiwgYy5iaW5UMiApOyovXG5cbiAgICAgICAgdGhpcy50bXBDMS5jcm9zc1ZlY3RvcnMoYy5ub3JUVTEsIHRoaXMudG1wUDEpO1xuICAgICAgICB0aGlzLnRtcEMyLmNyb3NzVmVjdG9ycyhjLm5vclRVMiwgdGhpcy50bXBQMik7XG4gICAgICAgIHRoaXMudG1wLmFkZCh0aGlzLnRtcEMxLCB0aGlzLnRtcEMyKTtcbiAgICAgICAgYy5ub3JEZW4gPSAxIC8gKG0xbTIgKyBfTWF0aC5kb3RWZWN0b3JzKGMubm9yLCB0aGlzLnRtcCkpO1xuXG4gICAgICAgIHRoaXMudG1wQzEuY3Jvc3NWZWN0b3JzKGMudGFuVFUxLCB0aGlzLnRtcFAxKTtcbiAgICAgICAgdGhpcy50bXBDMi5jcm9zc1ZlY3RvcnMoYy50YW5UVTIsIHRoaXMudG1wUDIpO1xuICAgICAgICB0aGlzLnRtcC5hZGQodGhpcy50bXBDMSwgdGhpcy50bXBDMik7XG4gICAgICAgIGMudGFuRGVuID0gMSAvIChtMW0yICsgX01hdGguZG90VmVjdG9ycyhjLnRhbiwgdGhpcy50bXApKTtcblxuICAgICAgICB0aGlzLnRtcEMxLmNyb3NzVmVjdG9ycyhjLmJpblRVMSwgdGhpcy50bXBQMSk7XG4gICAgICAgIHRoaXMudG1wQzIuY3Jvc3NWZWN0b3JzKGMuYmluVFUyLCB0aGlzLnRtcFAyKTtcbiAgICAgICAgdGhpcy50bXAuYWRkKHRoaXMudG1wQzEsIHRoaXMudG1wQzIpO1xuICAgICAgICBjLmJpbkRlbiA9IDEgLyAobTFtMiArIF9NYXRoLmRvdFZlY3RvcnMoYy5iaW4sIHRoaXMudG1wKSk7XG5cbiAgICAgICAgaWYgKHAud2FybVN0YXJ0ZWQpIHtcblxuICAgICAgICAgIG5vckltcCA9IHAubm9ybWFsSW1wdWxzZTtcblxuICAgICAgICAgIHRoaXMubHYxLmFkZFNjYWxlZFZlY3RvcihjLm5vclUxLCBub3JJbXApO1xuICAgICAgICAgIHRoaXMuYXYxLmFkZFNjYWxlZFZlY3RvcihjLm5vclRVMSwgbm9ySW1wKTtcblxuICAgICAgICAgIHRoaXMubHYyLnN1YlNjYWxlZFZlY3RvcihjLm5vclUyLCBub3JJbXApO1xuICAgICAgICAgIHRoaXMuYXYyLnN1YlNjYWxlZFZlY3RvcihjLm5vclRVMiwgbm9ySW1wKTtcblxuICAgICAgICAgIGMubm9ySW1wID0gbm9ySW1wO1xuICAgICAgICAgIGMudGFuSW1wID0gMDtcbiAgICAgICAgICBjLmJpbkltcCA9IDA7XG4gICAgICAgICAgcnZuID0gMDsgLy8gZGlzYWJsZSBib3VuY2luZ1xuXG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICBjLm5vckltcCA9IDA7XG4gICAgICAgICAgYy50YW5JbXAgPSAwO1xuICAgICAgICAgIGMuYmluSW1wID0gMDtcblxuICAgICAgICB9XG5cblxuICAgICAgICBpZiAocnZuID4gLTEpIHJ2biA9IDA7IC8vIGRpc2FibGUgYm91bmNpbmdcblxuICAgICAgICBub3JUYXIgPSB0aGlzLnJlc3RpdHV0aW9uICogLXJ2bjtcbiAgICAgICAgc2VwViA9IC0ocC5wZW5ldHJhdGlvbiArIDAuMDA1KSAqIGludlRpbWVTdGVwICogMC4wNTsgLy8gYWxsb3cgMC41Y20gZXJyb3JcbiAgICAgICAgaWYgKG5vclRhciA8IHNlcFYpIG5vclRhciA9IHNlcFY7XG4gICAgICAgIGMubm9yVGFyID0gbm9yVGFyO1xuICAgICAgICBjLmxhc3QgPSBpID09IHRoaXMubnVtIC0gMTtcbiAgICAgICAgYyA9IGMubmV4dDtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgc29sdmU6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgdGhpcy50bXBsdjEuY29weSh0aGlzLmx2MSk7XG4gICAgICB0aGlzLnRtcGx2Mi5jb3B5KHRoaXMubHYyKTtcbiAgICAgIHRoaXMudG1wYXYxLmNvcHkodGhpcy5hdjEpO1xuICAgICAgdGhpcy50bXBhdjIuY29weSh0aGlzLmF2Mik7XG5cbiAgICAgIHZhciBvbGRJbXAxLCBuZXdJbXAxLCBvbGRJbXAyLCBuZXdJbXAyLCBydm4sIG5vckltcCwgdGFuSW1wLCBiaW5JbXAsIG1heCwgbGVuO1xuXG4gICAgICB2YXIgYyA9IHRoaXMuY3M7XG5cbiAgICAgIHdoaWxlICh0cnVlKSB7XG5cbiAgICAgICAgbm9ySW1wID0gYy5ub3JJbXA7XG4gICAgICAgIHRhbkltcCA9IGMudGFuSW1wO1xuICAgICAgICBiaW5JbXAgPSBjLmJpbkltcDtcbiAgICAgICAgbWF4ID0gLW5vckltcCAqIHRoaXMuZnJpY3Rpb247XG5cbiAgICAgICAgdGhpcy50bXAuc3ViKHRoaXMudG1wbHYyLCB0aGlzLnRtcGx2MSk7XG5cbiAgICAgICAgcnZuID0gX01hdGguZG90VmVjdG9ycyh0aGlzLnRtcCwgYy50YW4pICsgX01hdGguZG90VmVjdG9ycyh0aGlzLnRtcGF2MiwgYy50YW5UMikgLSBfTWF0aC5kb3RWZWN0b3JzKHRoaXMudG1wYXYxLCBjLnRhblQxKTtcblxuICAgICAgICBvbGRJbXAxID0gdGFuSW1wO1xuICAgICAgICBuZXdJbXAxID0gcnZuICogYy50YW5EZW47XG4gICAgICAgIHRhbkltcCArPSBuZXdJbXAxO1xuXG4gICAgICAgIHJ2biA9IF9NYXRoLmRvdFZlY3RvcnModGhpcy50bXAsIGMuYmluKSArIF9NYXRoLmRvdFZlY3RvcnModGhpcy50bXBhdjIsIGMuYmluVDIpIC0gX01hdGguZG90VmVjdG9ycyh0aGlzLnRtcGF2MSwgYy5iaW5UMSk7XG5cbiAgICAgICAgb2xkSW1wMiA9IGJpbkltcDtcbiAgICAgICAgbmV3SW1wMiA9IHJ2biAqIGMuYmluRGVuO1xuICAgICAgICBiaW5JbXAgKz0gbmV3SW1wMjtcblxuICAgICAgICAvLyBjb25lIGZyaWN0aW9uIGNsYW1wXG4gICAgICAgIGxlbiA9IHRhbkltcCAqIHRhbkltcCArIGJpbkltcCAqIGJpbkltcDtcbiAgICAgICAgaWYgKGxlbiA+IG1heCAqIG1heCkge1xuICAgICAgICAgIGxlbiA9IG1heCAvIF9NYXRoLnNxcnQobGVuKTtcbiAgICAgICAgICB0YW5JbXAgKj0gbGVuO1xuICAgICAgICAgIGJpbkltcCAqPSBsZW47XG4gICAgICAgIH1cblxuICAgICAgICBuZXdJbXAxID0gdGFuSW1wIC0gb2xkSW1wMTtcbiAgICAgICAgbmV3SW1wMiA9IGJpbkltcCAtIG9sZEltcDI7XG5cbiAgICAgICAgLy9cblxuICAgICAgICB0aGlzLnRtcC5zZXQoXG4gICAgICAgICAgYy50YW5VMS54ICogbmV3SW1wMSArIGMuYmluVTEueCAqIG5ld0ltcDIsXG4gICAgICAgICAgYy50YW5VMS55ICogbmV3SW1wMSArIGMuYmluVTEueSAqIG5ld0ltcDIsXG4gICAgICAgICAgYy50YW5VMS56ICogbmV3SW1wMSArIGMuYmluVTEueiAqIG5ld0ltcDJcbiAgICAgICAgKTtcblxuICAgICAgICB0aGlzLnRtcGx2MS5hZGRFcXVhbCh0aGlzLnRtcCk7XG5cbiAgICAgICAgdGhpcy50bXAuc2V0KFxuICAgICAgICAgIGMudGFuVFUxLnggKiBuZXdJbXAxICsgYy5iaW5UVTEueCAqIG5ld0ltcDIsXG4gICAgICAgICAgYy50YW5UVTEueSAqIG5ld0ltcDEgKyBjLmJpblRVMS55ICogbmV3SW1wMixcbiAgICAgICAgICBjLnRhblRVMS56ICogbmV3SW1wMSArIGMuYmluVFUxLnogKiBuZXdJbXAyXG4gICAgICAgICk7XG5cbiAgICAgICAgdGhpcy50bXBhdjEuYWRkRXF1YWwodGhpcy50bXApO1xuXG4gICAgICAgIHRoaXMudG1wLnNldChcbiAgICAgICAgICBjLnRhblUyLnggKiBuZXdJbXAxICsgYy5iaW5VMi54ICogbmV3SW1wMixcbiAgICAgICAgICBjLnRhblUyLnkgKiBuZXdJbXAxICsgYy5iaW5VMi55ICogbmV3SW1wMixcbiAgICAgICAgICBjLnRhblUyLnogKiBuZXdJbXAxICsgYy5iaW5VMi56ICogbmV3SW1wMlxuICAgICAgICApO1xuXG4gICAgICAgIHRoaXMudG1wbHYyLnN1YkVxdWFsKHRoaXMudG1wKTtcblxuICAgICAgICB0aGlzLnRtcC5zZXQoXG4gICAgICAgICAgYy50YW5UVTIueCAqIG5ld0ltcDEgKyBjLmJpblRVMi54ICogbmV3SW1wMixcbiAgICAgICAgICBjLnRhblRVMi55ICogbmV3SW1wMSArIGMuYmluVFUyLnkgKiBuZXdJbXAyLFxuICAgICAgICAgIGMudGFuVFUyLnogKiBuZXdJbXAxICsgYy5iaW5UVTIueiAqIG5ld0ltcDJcbiAgICAgICAgKTtcblxuICAgICAgICB0aGlzLnRtcGF2Mi5zdWJFcXVhbCh0aGlzLnRtcCk7XG5cbiAgICAgICAgLy8gcmVzdGl0dXRpb24gcGFydFxuXG4gICAgICAgIHRoaXMudG1wLnN1Yih0aGlzLnRtcGx2MiwgdGhpcy50bXBsdjEpO1xuXG4gICAgICAgIHJ2biA9IF9NYXRoLmRvdFZlY3RvcnModGhpcy50bXAsIGMubm9yKSArIF9NYXRoLmRvdFZlY3RvcnModGhpcy50bXBhdjIsIGMubm9yVDIpIC0gX01hdGguZG90VmVjdG9ycyh0aGlzLnRtcGF2MSwgYy5ub3JUMSk7XG5cbiAgICAgICAgb2xkSW1wMSA9IG5vckltcDtcbiAgICAgICAgbmV3SW1wMSA9IChydm4gLSBjLm5vclRhcikgKiBjLm5vckRlbjtcbiAgICAgICAgbm9ySW1wICs9IG5ld0ltcDE7XG4gICAgICAgIGlmIChub3JJbXAgPiAwKSBub3JJbXAgPSAwO1xuXG4gICAgICAgIG5ld0ltcDEgPSBub3JJbXAgLSBvbGRJbXAxO1xuXG4gICAgICAgIHRoaXMudG1wbHYxLmFkZFNjYWxlZFZlY3RvcihjLm5vclUxLCBuZXdJbXAxKTtcbiAgICAgICAgdGhpcy50bXBhdjEuYWRkU2NhbGVkVmVjdG9yKGMubm9yVFUxLCBuZXdJbXAxKTtcbiAgICAgICAgdGhpcy50bXBsdjIuc3ViU2NhbGVkVmVjdG9yKGMubm9yVTIsIG5ld0ltcDEpO1xuICAgICAgICB0aGlzLnRtcGF2Mi5zdWJTY2FsZWRWZWN0b3IoYy5ub3JUVTIsIG5ld0ltcDEpO1xuXG4gICAgICAgIGMubm9ySW1wID0gbm9ySW1wO1xuICAgICAgICBjLnRhbkltcCA9IHRhbkltcDtcbiAgICAgICAgYy5iaW5JbXAgPSBiaW5JbXA7XG5cbiAgICAgICAgaWYgKGMubGFzdCkgYnJlYWs7XG4gICAgICAgIGMgPSBjLm5leHQ7XG4gICAgICB9XG5cbiAgICAgIHRoaXMubHYxLmNvcHkodGhpcy50bXBsdjEpO1xuICAgICAgdGhpcy5sdjIuY29weSh0aGlzLnRtcGx2Mik7XG4gICAgICB0aGlzLmF2MS5jb3B5KHRoaXMudG1wYXYxKTtcbiAgICAgIHRoaXMuYXYyLmNvcHkodGhpcy50bXBhdjIpO1xuXG4gICAgfSxcblxuICAgIHBvc3RTb2x2ZTogZnVuY3Rpb24gKCkge1xuXG4gICAgICB2YXIgYyA9IHRoaXMuY3MsIHA7XG4gICAgICB2YXIgaSA9IHRoaXMubnVtO1xuICAgICAgd2hpbGUgKGktLSkge1xuICAgICAgICAvL2Zvcih2YXIgaT0wO2k8dGhpcy5udW07aSsrKXtcbiAgICAgICAgcCA9IHRoaXMucHNbaV07XG4gICAgICAgIHAubm9ybWFsLmNvcHkoYy5ub3IpO1xuICAgICAgICBwLnRhbmdlbnQuY29weShjLnRhbik7XG4gICAgICAgIHAuYmlub3JtYWwuY29weShjLmJpbik7XG5cbiAgICAgICAgcC5ub3JtYWxJbXB1bHNlID0gYy5ub3JJbXA7XG4gICAgICAgIHAudGFuZ2VudEltcHVsc2UgPSBjLnRhbkltcDtcbiAgICAgICAgcC5iaW5vcm1hbEltcHVsc2UgPSBjLmJpbkltcDtcbiAgICAgICAgcC5ub3JtYWxEZW5vbWluYXRvciA9IGMubm9yRGVuO1xuICAgICAgICBwLnRhbmdlbnREZW5vbWluYXRvciA9IGMudGFuRGVuO1xuICAgICAgICBwLmJpbm9ybWFsRGVub21pbmF0b3IgPSBjLmJpbkRlbjtcbiAgICAgICAgYyA9IGMubmV4dDtcbiAgICAgIH1cbiAgICB9XG5cbiAgfSk7XG5cbiAgLyoqXG4gICogQSBjb250YWN0IGlzIGEgcGFpciBvZiBzaGFwZXMgd2hvc2UgYXhpcy1hbGlnbmVkIGJvdW5kaW5nIGJveGVzIGFyZSBvdmVybGFwcGluZy5cbiAgKiBAYXV0aG9yIHNhaGFyYW5cbiAgKi9cblxuICBmdW5jdGlvbiBDb250YWN0KCkge1xuXG4gICAgLy8gVGhlIGZpcnN0IHNoYXBlLlxuICAgIHRoaXMuc2hhcGUxID0gbnVsbDtcbiAgICAvLyBUaGUgc2Vjb25kIHNoYXBlLlxuICAgIHRoaXMuc2hhcGUyID0gbnVsbDtcbiAgICAvLyBUaGUgZmlyc3QgcmlnaWQgYm9keS5cbiAgICB0aGlzLmJvZHkxID0gbnVsbDtcbiAgICAvLyBUaGUgc2Vjb25kIHJpZ2lkIGJvZHkuXG4gICAgdGhpcy5ib2R5MiA9IG51bGw7XG4gICAgLy8gVGhlIHByZXZpb3VzIGNvbnRhY3QgaW4gdGhlIHdvcmxkLlxuICAgIHRoaXMucHJldiA9IG51bGw7XG4gICAgLy8gVGhlIG5leHQgY29udGFjdCBpbiB0aGUgd29ybGQuXG4gICAgdGhpcy5uZXh0ID0gbnVsbDtcbiAgICAvLyBJbnRlcm5hbFxuICAgIHRoaXMucGVyc2lzdGluZyA9IGZhbHNlO1xuICAgIC8vIFdoZXRoZXIgYm90aCB0aGUgcmlnaWQgYm9kaWVzIGFyZSBzbGVlcGluZyBvciBub3QuXG4gICAgdGhpcy5zbGVlcGluZyA9IGZhbHNlO1xuICAgIC8vIFRoZSBjb2xsaXNpb24gZGV0ZWN0b3IgYmV0d2VlbiB0d28gc2hhcGVzLlxuICAgIHRoaXMuZGV0ZWN0b3IgPSBudWxsO1xuICAgIC8vIFRoZSBjb250YWN0IGNvbnN0cmFpbnQgb2YgdGhlIGNvbnRhY3QuXG4gICAgdGhpcy5jb25zdHJhaW50ID0gbnVsbDtcbiAgICAvLyBXaGV0aGVyIHRoZSBzaGFwZXMgYXJlIHRvdWNoaW5nIG9yIG5vdC5cbiAgICB0aGlzLnRvdWNoaW5nID0gZmFsc2U7XG4gICAgLy8gc2hhcGVzIGlzIHZlcnkgY2xvc2UgYW5kIHRvdWNoaW5nIFxuICAgIHRoaXMuY2xvc2UgPSBmYWxzZTtcblxuICAgIHRoaXMuZGlzdCA9IF9NYXRoLklORjtcblxuICAgIHRoaXMuYjFMaW5rID0gbmV3IENvbnRhY3RMaW5rKHRoaXMpO1xuICAgIHRoaXMuYjJMaW5rID0gbmV3IENvbnRhY3RMaW5rKHRoaXMpO1xuICAgIHRoaXMuczFMaW5rID0gbmV3IENvbnRhY3RMaW5rKHRoaXMpO1xuICAgIHRoaXMuczJMaW5rID0gbmV3IENvbnRhY3RMaW5rKHRoaXMpO1xuXG4gICAgLy8gVGhlIGNvbnRhY3QgbWFuaWZvbGQgb2YgdGhlIGNvbnRhY3QuXG4gICAgdGhpcy5tYW5pZm9sZCA9IG5ldyBDb250YWN0TWFuaWZvbGQoKTtcblxuICAgIHRoaXMuYnVmZmVyID0gW1xuXG4gICAgICBuZXcgSW1wdWxzZURhdGFCdWZmZXIoKSxcbiAgICAgIG5ldyBJbXB1bHNlRGF0YUJ1ZmZlcigpLFxuICAgICAgbmV3IEltcHVsc2VEYXRhQnVmZmVyKCksXG4gICAgICBuZXcgSW1wdWxzZURhdGFCdWZmZXIoKVxuXG4gICAgXTtcblxuICAgIHRoaXMucG9pbnRzID0gdGhpcy5tYW5pZm9sZC5wb2ludHM7XG4gICAgdGhpcy5jb25zdHJhaW50ID0gbmV3IENvbnRhY3RDb25zdHJhaW50KHRoaXMubWFuaWZvbGQpO1xuXG4gIH1cblxuICBPYmplY3QuYXNzaWduKENvbnRhY3QucHJvdG90eXBlLCB7XG5cbiAgICBDb250YWN0OiB0cnVlLFxuXG4gICAgbWl4UmVzdGl0dXRpb246IGZ1bmN0aW9uIChyZXN0aXR1dGlvbjEsIHJlc3RpdHV0aW9uMikge1xuXG4gICAgICByZXR1cm4gX01hdGguc3FydChyZXN0aXR1dGlvbjEgKiByZXN0aXR1dGlvbjIpO1xuXG4gICAgfSxcbiAgICBtaXhGcmljdGlvbjogZnVuY3Rpb24gKGZyaWN0aW9uMSwgZnJpY3Rpb24yKSB7XG5cbiAgICAgIHJldHVybiBfTWF0aC5zcXJ0KGZyaWN0aW9uMSAqIGZyaWN0aW9uMik7XG5cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgKiBVcGRhdGUgdGhlIGNvbnRhY3QgbWFuaWZvbGQuXG4gICAgKi9cbiAgICB1cGRhdGVNYW5pZm9sZDogZnVuY3Rpb24gKCkge1xuXG4gICAgICB0aGlzLmNvbnN0cmFpbnQucmVzdGl0dXRpb24gPSB0aGlzLm1peFJlc3RpdHV0aW9uKHRoaXMuc2hhcGUxLnJlc3RpdHV0aW9uLCB0aGlzLnNoYXBlMi5yZXN0aXR1dGlvbik7XG4gICAgICB0aGlzLmNvbnN0cmFpbnQuZnJpY3Rpb24gPSB0aGlzLm1peEZyaWN0aW9uKHRoaXMuc2hhcGUxLmZyaWN0aW9uLCB0aGlzLnNoYXBlMi5mcmljdGlvbik7XG4gICAgICB2YXIgbnVtQnVmZmVycyA9IHRoaXMubWFuaWZvbGQubnVtUG9pbnRzO1xuICAgICAgdmFyIGkgPSBudW1CdWZmZXJzO1xuICAgICAgd2hpbGUgKGktLSkge1xuICAgICAgICAvL2Zvcih2YXIgaT0wO2k8bnVtQnVmZmVycztpKyspe1xuICAgICAgICB2YXIgYiA9IHRoaXMuYnVmZmVyW2ldO1xuICAgICAgICB2YXIgcCA9IHRoaXMucG9pbnRzW2ldO1xuICAgICAgICBiLmxwMVggPSBwLmxvY2FsUG9pbnQxLng7XG4gICAgICAgIGIubHAxWSA9IHAubG9jYWxQb2ludDEueTtcbiAgICAgICAgYi5scDFaID0gcC5sb2NhbFBvaW50MS56O1xuICAgICAgICBiLmxwMlggPSBwLmxvY2FsUG9pbnQyLng7XG4gICAgICAgIGIubHAyWSA9IHAubG9jYWxQb2ludDIueTtcbiAgICAgICAgYi5scDJaID0gcC5sb2NhbFBvaW50Mi56O1xuICAgICAgICBiLmltcHVsc2UgPSBwLm5vcm1hbEltcHVsc2U7XG4gICAgICB9XG4gICAgICB0aGlzLm1hbmlmb2xkLm51bVBvaW50cyA9IDA7XG4gICAgICB0aGlzLmRldGVjdG9yLmRldGVjdENvbGxpc2lvbih0aGlzLnNoYXBlMSwgdGhpcy5zaGFwZTIsIHRoaXMubWFuaWZvbGQpO1xuICAgICAgdmFyIG51bSA9IHRoaXMubWFuaWZvbGQubnVtUG9pbnRzO1xuICAgICAgaWYgKG51bSA9PSAwKSB7XG4gICAgICAgIHRoaXMudG91Y2hpbmcgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5jbG9zZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLmRpc3QgPSBfTWF0aC5JTkY7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMudG91Y2hpbmcgfHwgdGhpcy5kaXN0IDwgMC4wMDEpIHRoaXMuY2xvc2UgPSB0cnVlO1xuICAgICAgdGhpcy50b3VjaGluZyA9IHRydWU7XG4gICAgICBpID0gbnVtO1xuICAgICAgd2hpbGUgKGktLSkge1xuICAgICAgICAvL2ZvcihpPTA7IGk8bnVtOyBpKyspe1xuICAgICAgICBwID0gdGhpcy5wb2ludHNbaV07XG4gICAgICAgIHZhciBscDF4ID0gcC5sb2NhbFBvaW50MS54O1xuICAgICAgICB2YXIgbHAxeSA9IHAubG9jYWxQb2ludDEueTtcbiAgICAgICAgdmFyIGxwMXogPSBwLmxvY2FsUG9pbnQxLno7XG4gICAgICAgIHZhciBscDJ4ID0gcC5sb2NhbFBvaW50Mi54O1xuICAgICAgICB2YXIgbHAyeSA9IHAubG9jYWxQb2ludDIueTtcbiAgICAgICAgdmFyIGxwMnogPSBwLmxvY2FsUG9pbnQyLno7XG4gICAgICAgIHZhciBpbmRleCA9IC0xO1xuICAgICAgICB2YXIgbWluRGlzdGFuY2UgPSAwLjAwMDQ7XG4gICAgICAgIHZhciBqID0gbnVtQnVmZmVycztcbiAgICAgICAgd2hpbGUgKGotLSkge1xuICAgICAgICAgIC8vZm9yKHZhciBqPTA7ajxudW1CdWZmZXJzO2orKyl7XG4gICAgICAgICAgYiA9IHRoaXMuYnVmZmVyW2pdO1xuICAgICAgICAgIHZhciBkeCA9IGIubHAxWCAtIGxwMXg7XG4gICAgICAgICAgdmFyIGR5ID0gYi5scDFZIC0gbHAxeTtcbiAgICAgICAgICB2YXIgZHogPSBiLmxwMVogLSBscDF6O1xuICAgICAgICAgIHZhciBkaXN0YW5jZTEgPSBkeCAqIGR4ICsgZHkgKiBkeSArIGR6ICogZHo7XG4gICAgICAgICAgZHggPSBiLmxwMlggLSBscDJ4O1xuICAgICAgICAgIGR5ID0gYi5scDJZIC0gbHAyeTtcbiAgICAgICAgICBkeiA9IGIubHAyWiAtIGxwMno7XG4gICAgICAgICAgdmFyIGRpc3RhbmNlMiA9IGR4ICogZHggKyBkeSAqIGR5ICsgZHogKiBkejtcbiAgICAgICAgICBpZiAoZGlzdGFuY2UxIDwgZGlzdGFuY2UyKSB7XG4gICAgICAgICAgICBpZiAoZGlzdGFuY2UxIDwgbWluRGlzdGFuY2UpIHtcbiAgICAgICAgICAgICAgbWluRGlzdGFuY2UgPSBkaXN0YW5jZTE7XG4gICAgICAgICAgICAgIGluZGV4ID0gajtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGRpc3RhbmNlMiA8IG1pbkRpc3RhbmNlKSB7XG4gICAgICAgICAgICAgIG1pbkRpc3RhbmNlID0gZGlzdGFuY2UyO1xuICAgICAgICAgICAgICBpbmRleCA9IGo7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKG1pbkRpc3RhbmNlIDwgdGhpcy5kaXN0KSB0aGlzLmRpc3QgPSBtaW5EaXN0YW5jZTtcblxuICAgICAgICB9XG4gICAgICAgIGlmIChpbmRleCAhPSAtMSkge1xuICAgICAgICAgIHZhciB0bXAgPSB0aGlzLmJ1ZmZlcltpbmRleF07XG4gICAgICAgICAgdGhpcy5idWZmZXJbaW5kZXhdID0gdGhpcy5idWZmZXJbLS1udW1CdWZmZXJzXTtcbiAgICAgICAgICB0aGlzLmJ1ZmZlcltudW1CdWZmZXJzXSA9IHRtcDtcbiAgICAgICAgICBwLm5vcm1hbEltcHVsc2UgPSB0bXAuaW1wdWxzZTtcbiAgICAgICAgICBwLndhcm1TdGFydGVkID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBwLm5vcm1hbEltcHVsc2UgPSAwO1xuICAgICAgICAgIHAud2FybVN0YXJ0ZWQgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgLyoqXG4gICAgKiBBdHRhY2ggdGhlIGNvbnRhY3QgdG8gdGhlIHNoYXBlcy5cbiAgICAqIEBwYXJhbSAgIHNoYXBlMVxuICAgICogQHBhcmFtICAgc2hhcGUyXG4gICAgKi9cbiAgICBhdHRhY2g6IGZ1bmN0aW9uIChzaGFwZTEsIHNoYXBlMikge1xuICAgICAgdGhpcy5zaGFwZTEgPSBzaGFwZTE7XG4gICAgICB0aGlzLnNoYXBlMiA9IHNoYXBlMjtcbiAgICAgIHRoaXMuYm9keTEgPSBzaGFwZTEucGFyZW50O1xuICAgICAgdGhpcy5ib2R5MiA9IHNoYXBlMi5wYXJlbnQ7XG5cbiAgICAgIHRoaXMubWFuaWZvbGQuYm9keTEgPSB0aGlzLmJvZHkxO1xuICAgICAgdGhpcy5tYW5pZm9sZC5ib2R5MiA9IHRoaXMuYm9keTI7XG4gICAgICB0aGlzLmNvbnN0cmFpbnQuYm9keTEgPSB0aGlzLmJvZHkxO1xuICAgICAgdGhpcy5jb25zdHJhaW50LmJvZHkyID0gdGhpcy5ib2R5MjtcbiAgICAgIHRoaXMuY29uc3RyYWludC5hdHRhY2goKTtcblxuICAgICAgdGhpcy5zMUxpbmsuc2hhcGUgPSBzaGFwZTI7XG4gICAgICB0aGlzLnMxTGluay5ib2R5ID0gdGhpcy5ib2R5MjtcbiAgICAgIHRoaXMuczJMaW5rLnNoYXBlID0gc2hhcGUxO1xuICAgICAgdGhpcy5zMkxpbmsuYm9keSA9IHRoaXMuYm9keTE7XG5cbiAgICAgIGlmIChzaGFwZTEuY29udGFjdExpbmsgIT0gbnVsbCkgKHRoaXMuczFMaW5rLm5leHQgPSBzaGFwZTEuY29udGFjdExpbmspLnByZXYgPSB0aGlzLnMxTGluaztcbiAgICAgIGVsc2UgdGhpcy5zMUxpbmsubmV4dCA9IG51bGw7XG4gICAgICBzaGFwZTEuY29udGFjdExpbmsgPSB0aGlzLnMxTGluaztcbiAgICAgIHNoYXBlMS5udW1Db250YWN0cysrO1xuXG4gICAgICBpZiAoc2hhcGUyLmNvbnRhY3RMaW5rICE9IG51bGwpICh0aGlzLnMyTGluay5uZXh0ID0gc2hhcGUyLmNvbnRhY3RMaW5rKS5wcmV2ID0gdGhpcy5zMkxpbms7XG4gICAgICBlbHNlIHRoaXMuczJMaW5rLm5leHQgPSBudWxsO1xuICAgICAgc2hhcGUyLmNvbnRhY3RMaW5rID0gdGhpcy5zMkxpbms7XG4gICAgICBzaGFwZTIubnVtQ29udGFjdHMrKztcblxuICAgICAgdGhpcy5iMUxpbmsuc2hhcGUgPSBzaGFwZTI7XG4gICAgICB0aGlzLmIxTGluay5ib2R5ID0gdGhpcy5ib2R5MjtcbiAgICAgIHRoaXMuYjJMaW5rLnNoYXBlID0gc2hhcGUxO1xuICAgICAgdGhpcy5iMkxpbmsuYm9keSA9IHRoaXMuYm9keTE7XG5cbiAgICAgIGlmICh0aGlzLmJvZHkxLmNvbnRhY3RMaW5rICE9IG51bGwpICh0aGlzLmIxTGluay5uZXh0ID0gdGhpcy5ib2R5MS5jb250YWN0TGluaykucHJldiA9IHRoaXMuYjFMaW5rO1xuICAgICAgZWxzZSB0aGlzLmIxTGluay5uZXh0ID0gbnVsbDtcbiAgICAgIHRoaXMuYm9keTEuY29udGFjdExpbmsgPSB0aGlzLmIxTGluaztcbiAgICAgIHRoaXMuYm9keTEubnVtQ29udGFjdHMrKztcblxuICAgICAgaWYgKHRoaXMuYm9keTIuY29udGFjdExpbmsgIT0gbnVsbCkgKHRoaXMuYjJMaW5rLm5leHQgPSB0aGlzLmJvZHkyLmNvbnRhY3RMaW5rKS5wcmV2ID0gdGhpcy5iMkxpbms7XG4gICAgICBlbHNlIHRoaXMuYjJMaW5rLm5leHQgPSBudWxsO1xuICAgICAgdGhpcy5ib2R5Mi5jb250YWN0TGluayA9IHRoaXMuYjJMaW5rO1xuICAgICAgdGhpcy5ib2R5Mi5udW1Db250YWN0cysrO1xuXG4gICAgICB0aGlzLnByZXYgPSBudWxsO1xuICAgICAgdGhpcy5uZXh0ID0gbnVsbDtcblxuICAgICAgdGhpcy5wZXJzaXN0aW5nID0gdHJ1ZTtcbiAgICAgIHRoaXMuc2xlZXBpbmcgPSB0aGlzLmJvZHkxLnNsZWVwaW5nICYmIHRoaXMuYm9keTIuc2xlZXBpbmc7XG4gICAgICB0aGlzLm1hbmlmb2xkLm51bVBvaW50cyA9IDA7XG4gICAgfSxcbiAgICAvKipcbiAgICAqIERldGFjaCB0aGUgY29udGFjdCBmcm9tIHRoZSBzaGFwZXMuXG4gICAgKi9cbiAgICBkZXRhY2g6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBwcmV2ID0gdGhpcy5zMUxpbmsucHJldjtcbiAgICAgIHZhciBuZXh0ID0gdGhpcy5zMUxpbmsubmV4dDtcbiAgICAgIGlmIChwcmV2ICE9PSBudWxsKSBwcmV2Lm5leHQgPSBuZXh0O1xuICAgICAgaWYgKG5leHQgIT09IG51bGwpIG5leHQucHJldiA9IHByZXY7XG4gICAgICBpZiAodGhpcy5zaGFwZTEuY29udGFjdExpbmsgPT0gdGhpcy5zMUxpbmspIHRoaXMuc2hhcGUxLmNvbnRhY3RMaW5rID0gbmV4dDtcbiAgICAgIHRoaXMuczFMaW5rLnByZXYgPSBudWxsO1xuICAgICAgdGhpcy5zMUxpbmsubmV4dCA9IG51bGw7XG4gICAgICB0aGlzLnMxTGluay5zaGFwZSA9IG51bGw7XG4gICAgICB0aGlzLnMxTGluay5ib2R5ID0gbnVsbDtcbiAgICAgIHRoaXMuc2hhcGUxLm51bUNvbnRhY3RzLS07XG5cbiAgICAgIHByZXYgPSB0aGlzLnMyTGluay5wcmV2O1xuICAgICAgbmV4dCA9IHRoaXMuczJMaW5rLm5leHQ7XG4gICAgICBpZiAocHJldiAhPT0gbnVsbCkgcHJldi5uZXh0ID0gbmV4dDtcbiAgICAgIGlmIChuZXh0ICE9PSBudWxsKSBuZXh0LnByZXYgPSBwcmV2O1xuICAgICAgaWYgKHRoaXMuc2hhcGUyLmNvbnRhY3RMaW5rID09IHRoaXMuczJMaW5rKSB0aGlzLnNoYXBlMi5jb250YWN0TGluayA9IG5leHQ7XG4gICAgICB0aGlzLnMyTGluay5wcmV2ID0gbnVsbDtcbiAgICAgIHRoaXMuczJMaW5rLm5leHQgPSBudWxsO1xuICAgICAgdGhpcy5zMkxpbmsuc2hhcGUgPSBudWxsO1xuICAgICAgdGhpcy5zMkxpbmsuYm9keSA9IG51bGw7XG4gICAgICB0aGlzLnNoYXBlMi5udW1Db250YWN0cy0tO1xuXG4gICAgICBwcmV2ID0gdGhpcy5iMUxpbmsucHJldjtcbiAgICAgIG5leHQgPSB0aGlzLmIxTGluay5uZXh0O1xuICAgICAgaWYgKHByZXYgIT09IG51bGwpIHByZXYubmV4dCA9IG5leHQ7XG4gICAgICBpZiAobmV4dCAhPT0gbnVsbCkgbmV4dC5wcmV2ID0gcHJldjtcbiAgICAgIGlmICh0aGlzLmJvZHkxLmNvbnRhY3RMaW5rID09IHRoaXMuYjFMaW5rKSB0aGlzLmJvZHkxLmNvbnRhY3RMaW5rID0gbmV4dDtcbiAgICAgIHRoaXMuYjFMaW5rLnByZXYgPSBudWxsO1xuICAgICAgdGhpcy5iMUxpbmsubmV4dCA9IG51bGw7XG4gICAgICB0aGlzLmIxTGluay5zaGFwZSA9IG51bGw7XG4gICAgICB0aGlzLmIxTGluay5ib2R5ID0gbnVsbDtcbiAgICAgIHRoaXMuYm9keTEubnVtQ29udGFjdHMtLTtcblxuICAgICAgcHJldiA9IHRoaXMuYjJMaW5rLnByZXY7XG4gICAgICBuZXh0ID0gdGhpcy5iMkxpbmsubmV4dDtcbiAgICAgIGlmIChwcmV2ICE9PSBudWxsKSBwcmV2Lm5leHQgPSBuZXh0O1xuICAgICAgaWYgKG5leHQgIT09IG51bGwpIG5leHQucHJldiA9IHByZXY7XG4gICAgICBpZiAodGhpcy5ib2R5Mi5jb250YWN0TGluayA9PSB0aGlzLmIyTGluaykgdGhpcy5ib2R5Mi5jb250YWN0TGluayA9IG5leHQ7XG4gICAgICB0aGlzLmIyTGluay5wcmV2ID0gbnVsbDtcbiAgICAgIHRoaXMuYjJMaW5rLm5leHQgPSBudWxsO1xuICAgICAgdGhpcy5iMkxpbmsuc2hhcGUgPSBudWxsO1xuICAgICAgdGhpcy5iMkxpbmsuYm9keSA9IG51bGw7XG4gICAgICB0aGlzLmJvZHkyLm51bUNvbnRhY3RzLS07XG5cbiAgICAgIHRoaXMubWFuaWZvbGQuYm9keTEgPSBudWxsO1xuICAgICAgdGhpcy5tYW5pZm9sZC5ib2R5MiA9IG51bGw7XG4gICAgICB0aGlzLmNvbnN0cmFpbnQuYm9keTEgPSBudWxsO1xuICAgICAgdGhpcy5jb25zdHJhaW50LmJvZHkyID0gbnVsbDtcbiAgICAgIHRoaXMuY29uc3RyYWludC5kZXRhY2goKTtcblxuICAgICAgdGhpcy5zaGFwZTEgPSBudWxsO1xuICAgICAgdGhpcy5zaGFwZTIgPSBudWxsO1xuICAgICAgdGhpcy5ib2R5MSA9IG51bGw7XG4gICAgICB0aGlzLmJvZHkyID0gbnVsbDtcbiAgICB9XG5cbiAgfSk7XG5cbiAgLyoqXG4gICogVGhlIGNsYXNzIG9mIHJpZ2lkIGJvZHkuXG4gICogUmlnaWQgYm9keSBoYXMgdGhlIHNoYXBlIG9mIGEgc2luZ2xlIG9yIG11bHRpcGxlIGNvbGxpc2lvbiBwcm9jZXNzaW5nLFxuICAqIEkgY2FuIHNldCB0aGUgcGFyYW1ldGVycyBpbmRpdmlkdWFsbHkuXG4gICogQGF1dGhvciBzYWhhcmFuXG4gICogQGF1dGhvciBsby10aFxuICAqL1xuXG4gIGZ1bmN0aW9uIFJpZ2lkQm9keShQb3NpdGlvbiwgUm90YXRpb24pIHtcblxuICAgIHRoaXMucG9zaXRpb24gPSBQb3NpdGlvbiB8fCBuZXcgVmVjMygpO1xuICAgIHRoaXMub3JpZW50YXRpb24gPSBSb3RhdGlvbiB8fCBuZXcgUXVhdCgpO1xuXG4gICAgdGhpcy5zY2FsZSA9IDE7XG4gICAgdGhpcy5pbnZTY2FsZSA9IDE7XG5cbiAgICAvLyBwb3NzaWJsZSBsaW5rIHRvIHRocmVlIE1lc2g7XG4gICAgdGhpcy5tZXNoID0gbnVsbDtcblxuICAgIHRoaXMuaWQgPSBOYU47XG4gICAgdGhpcy5uYW1lID0gXCJcIjtcbiAgICAvLyBUaGUgbWF4aW11bSBudW1iZXIgb2Ygc2hhcGVzIHRoYXQgY2FuIGJlIGFkZGVkIHRvIGEgb25lIHJpZ2lkLlxuICAgIC8vdGhpcy5NQVhfU0hBUEVTID0gNjQ7Ly82NDtcblxuICAgIHRoaXMucHJldiA9IG51bGw7XG4gICAgdGhpcy5uZXh0ID0gbnVsbDtcblxuICAgIC8vIEkgcmVwcmVzZW50IHRoZSBraW5kIG9mIHJpZ2lkIGJvZHkuXG4gICAgLy8gUGxlYXNlIGRvIG5vdCBjaGFuZ2UgZnJvbSB0aGUgb3V0c2lkZSB0aGlzIHZhcmlhYmxlLlxuICAgIC8vIElmIHlvdSB3YW50IHRvIGNoYW5nZSB0aGUgdHlwZSBvZiByaWdpZCBib2R5LCBhbHdheXNcbiAgICAvLyBQbGVhc2Ugc3BlY2lmeSB0aGUgdHlwZSB5b3Ugd2FudCB0byBzZXQgdGhlIGFyZ3VtZW50cyBvZiBzZXR1cE1hc3MgbWV0aG9kLlxuICAgIHRoaXMudHlwZSA9IEJPRFlfTlVMTDtcblxuICAgIHRoaXMubWFzc0luZm8gPSBuZXcgTWFzc0luZm8oKTtcblxuICAgIHRoaXMubmV3UG9zaXRpb24gPSBuZXcgVmVjMygpO1xuICAgIHRoaXMuY29udHJvbFBvcyA9IGZhbHNlO1xuICAgIHRoaXMubmV3T3JpZW50YXRpb24gPSBuZXcgUXVhdCgpO1xuICAgIHRoaXMubmV3Um90YXRpb24gPSBuZXcgVmVjMygpO1xuICAgIHRoaXMuY3VycmVudFJvdGF0aW9uID0gbmV3IFZlYzMoKTtcbiAgICB0aGlzLmNvbnRyb2xSb3QgPSBmYWxzZTtcbiAgICB0aGlzLmNvbnRyb2xSb3RJblRpbWUgPSBmYWxzZTtcblxuICAgIHRoaXMucXVhdGVybmlvbiA9IG5ldyBRdWF0KCk7XG4gICAgdGhpcy5wb3MgPSBuZXcgVmVjMygpO1xuXG5cblxuICAgIC8vIElzIHRoZSB0cmFuc2xhdGlvbmFsIHZlbG9jaXR5LlxuICAgIHRoaXMubGluZWFyVmVsb2NpdHkgPSBuZXcgVmVjMygpO1xuICAgIC8vIElzIHRoZSBhbmd1bGFyIHZlbG9jaXR5LlxuICAgIHRoaXMuYW5ndWxhclZlbG9jaXR5ID0gbmV3IFZlYzMoKTtcblxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAvLyAgUGxlYXNlIGRvIG5vdCBjaGFuZ2UgZnJvbSB0aGUgb3V0c2lkZSB0aGlzIHZhcmlhYmxlcy5cbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgICAvLyBJdCBpcyBhIHdvcmxkIHRoYXQgcmlnaWQgYm9keSBoYXMgYmVlbiBhZGRlZC5cbiAgICB0aGlzLnBhcmVudCA9IG51bGw7XG4gICAgdGhpcy5jb250YWN0TGluayA9IG51bGw7XG4gICAgdGhpcy5udW1Db250YWN0cyA9IDA7XG5cbiAgICAvLyBBbiBhcnJheSBvZiBzaGFwZXMgdGhhdCBhcmUgaW5jbHVkZWQgaW4gdGhlIHJpZ2lkIGJvZHkuXG4gICAgdGhpcy5zaGFwZXMgPSBudWxsO1xuICAgIC8vIFRoZSBudW1iZXIgb2Ygc2hhcGVzIHRoYXQgYXJlIGluY2x1ZGVkIGluIHRoZSByaWdpZCBib2R5LlxuICAgIHRoaXMubnVtU2hhcGVzID0gMDtcblxuICAgIC8vIEl0IGlzIHRoZSBsaW5rIGFycmF5IG9mIGpvaW50IHRoYXQgaXMgY29ubmVjdGVkIHRvIHRoZSByaWdpZCBib2R5LlxuICAgIHRoaXMuam9pbnRMaW5rID0gbnVsbDtcbiAgICAvLyBUaGUgbnVtYmVyIG9mIGpvaW50cyB0aGF0IGFyZSBjb25uZWN0ZWQgdG8gdGhlIHJpZ2lkIGJvZHkuXG4gICAgdGhpcy5udW1Kb2ludHMgPSAwO1xuXG4gICAgLy8gSXQgaXMgdGhlIHdvcmxkIGNvb3JkaW5hdGUgb2YgdGhlIGNlbnRlciBvZiBncmF2aXR5IGluIHRoZSBzbGVlcCBqdXN0IGJlZm9yZS5cbiAgICB0aGlzLnNsZWVwUG9zaXRpb24gPSBuZXcgVmVjMygpO1xuICAgIC8vIEl0IGlzIGEgcXVhdGVybmlvbiB0aGF0IHJlcHJlc2VudHMgdGhlIGF0dGl0dWRlIG9mIHNsZWVwIGp1c3QgYmVmb3JlLlxuICAgIHRoaXMuc2xlZXBPcmllbnRhdGlvbiA9IG5ldyBRdWF0KCk7XG4gICAgLy8gSSB3aWxsIHNob3cgdGhpcyByaWdpZCBib2R5IHRvIGRldGVybWluZSB3aGV0aGVyIGl0IGlzIGEgcmlnaWQgYm9keSBzdGF0aWMuXG4gICAgdGhpcy5pc1N0YXRpYyA9IGZhbHNlO1xuICAgIC8vIEkgaW5kaWNhdGVzIHRoYXQgdGhpcyByaWdpZCBib2R5IHRvIGRldGVybWluZSB3aGV0aGVyIGl0IGlzIGEgcmlnaWQgYm9keSBkeW5hbWljLlxuICAgIHRoaXMuaXNEeW5hbWljID0gZmFsc2U7XG5cbiAgICB0aGlzLmlzS2luZW1hdGljID0gZmFsc2U7XG5cbiAgICAvLyBJdCBpcyBhIHJvdGF0aW9uIG1hdHJpeCByZXByZXNlbnRpbmcgdGhlIG9yaWVudGF0aW9uLlxuICAgIHRoaXMucm90YXRpb24gPSBuZXcgTWF0MzMoKTtcblxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAvLyBJdCB3aWxsIGJlIHJlY2FsY3VsYXRlZCBhdXRvbWF0aWNhbGx5IGZyb20gdGhlIHNoYXBlLCB3aGljaCBpcyBpbmNsdWRlZC5cbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgICAvLyBUaGlzIGlzIHRoZSB3ZWlnaHQuXG4gICAgdGhpcy5tYXNzID0gMDtcbiAgICAvLyBJdCBpcyB0aGUgcmVjaXByb2NhbCBvZiB0aGUgbWFzcy5cbiAgICB0aGlzLmludmVyc2VNYXNzID0gMDtcbiAgICAvLyBJdCBpcyB0aGUgaW52ZXJzZSBvZiB0aGUgaW5lcnRpYSB0ZW5zb3IgaW4gdGhlIHdvcmxkIHN5c3RlbS5cbiAgICB0aGlzLmludmVyc2VJbmVydGlhID0gbmV3IE1hdDMzKCk7XG4gICAgLy8gSXQgaXMgdGhlIGluZXJ0aWEgdGVuc29yIGluIHRoZSBpbml0aWFsIHN0YXRlLlxuICAgIHRoaXMubG9jYWxJbmVydGlhID0gbmV3IE1hdDMzKCk7XG4gICAgLy8gSXQgaXMgdGhlIGludmVyc2Ugb2YgdGhlIGluZXJ0aWEgdGVuc29yIGluIHRoZSBpbml0aWFsIHN0YXRlLlxuICAgIHRoaXMuaW52ZXJzZUxvY2FsSW5lcnRpYSA9IG5ldyBNYXQzMygpO1xuXG4gICAgdGhpcy50bXBJbmVydGlhID0gbmV3IE1hdDMzKCk7XG5cblxuICAgIC8vIEkgaW5kaWNhdGVzIHJpZ2lkIGJvZHkgd2hldGhlciBpdCBoYXMgYmVlbiBhZGRlZCB0byB0aGUgc2ltdWxhdGlvbiBJc2xhbmQuXG4gICAgdGhpcy5hZGRlZFRvSXNsYW5kID0gZmFsc2U7XG4gICAgLy8gSXQgc2hvd3MgaG93IHRvIHNsZWVwIHJpZ2lkIGJvZHkuXG4gICAgdGhpcy5hbGxvd1NsZWVwID0gdHJ1ZTtcbiAgICAvLyBUaGlzIGlzIHRoZSB0aW1lIGZyb20gd2hlbiB0aGUgcmlnaWQgYm9keSBhdCByZXN0LlxuICAgIHRoaXMuc2xlZXBUaW1lID0gMDtcbiAgICAvLyBJIHNob3dzIHJpZ2lkIGJvZHkgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgaXQgaXMgYSBzbGVlcCBzdGF0ZS5cbiAgICB0aGlzLnNsZWVwaW5nID0gZmFsc2U7XG5cbiAgfVxuXG4gIE9iamVjdC5hc3NpZ24oUmlnaWRCb2R5LnByb3RvdHlwZSwge1xuXG4gICAgc2V0UGFyZW50OiBmdW5jdGlvbiAod29ybGQpIHtcblxuICAgICAgdGhpcy5wYXJlbnQgPSB3b3JsZDtcbiAgICAgIHRoaXMuc2NhbGUgPSB0aGlzLnBhcmVudC5zY2FsZTtcbiAgICAgIHRoaXMuaW52U2NhbGUgPSB0aGlzLnBhcmVudC5pbnZTY2FsZTtcbiAgICAgIHRoaXMuaWQgPSB0aGlzLnBhcmVudC5udW1SaWdpZEJvZGllcztcbiAgICAgIGlmICghdGhpcy5uYW1lKSB0aGlzLm5hbWUgPSB0aGlzLmlkO1xuXG4gICAgICB0aGlzLnVwZGF0ZU1lc2goKTtcblxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJJ2xsIGFkZCBhIHNoYXBlIHRvIHJpZ2lkIGJvZHkuXG4gICAgICogSWYgeW91IGFkZCBhIHNoYXBlLCBwbGVhc2UgY2FsbCB0aGUgc2V0dXBNYXNzIG1ldGhvZCB0byBzdGVwIHVwIHRvIHRoZSBzdGFydCBvZiB0aGUgbmV4dC5cbiAgICAgKiBAcGFyYW0gICBzaGFwZSBzaGFwZSB0byBBZGRcbiAgICAgKi9cbiAgICBhZGRTaGFwZTogZnVuY3Rpb24gKHNoYXBlKSB7XG5cbiAgICAgIGlmIChzaGFwZS5wYXJlbnQpIHtcbiAgICAgICAgcHJpbnRFcnJvcihcIlJpZ2lkQm9keVwiLCBcIkl0IGlzIG5vdCBwb3NzaWJsZSB0aGF0IHlvdSBhZGQgYSBzaGFwZSB3aGljaCBhbHJlYWR5IGhhcyBhbiBhc3NvY2lhdGVkIGJvZHkuXCIpO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5zaGFwZXMgIT0gbnVsbCkgKHRoaXMuc2hhcGVzLnByZXYgPSBzaGFwZSkubmV4dCA9IHRoaXMuc2hhcGVzO1xuICAgICAgdGhpcy5zaGFwZXMgPSBzaGFwZTtcbiAgICAgIHNoYXBlLnBhcmVudCA9IHRoaXM7XG4gICAgICBpZiAodGhpcy5wYXJlbnQpIHRoaXMucGFyZW50LmFkZFNoYXBlKHNoYXBlKTtcbiAgICAgIHRoaXMubnVtU2hhcGVzKys7XG5cbiAgICB9LFxuICAgIC8qKlxuICAgICAqIEkgd2lsbCBkZWxldGUgdGhlIHNoYXBlIGZyb20gdGhlIHJpZ2lkIGJvZHkuXG4gICAgICogSWYgeW91IGRlbGV0ZSBhIHNoYXBlLCBwbGVhc2UgY2FsbCB0aGUgc2V0dXBNYXNzIG1ldGhvZCB0byBzdGVwIHVwIHRvIHRoZSBzdGFydCBvZiB0aGUgbmV4dC5cbiAgICAgKiBAcGFyYW0gc2hhcGUge1NoYXBlfSB0byBkZWxldGVcbiAgICAgKiBAcmV0dXJuIHZvaWRcbiAgICAgKi9cbiAgICByZW1vdmVTaGFwZTogZnVuY3Rpb24gKHNoYXBlKSB7XG5cbiAgICAgIHZhciByZW1vdmUgPSBzaGFwZTtcbiAgICAgIGlmIChyZW1vdmUucGFyZW50ICE9IHRoaXMpIHJldHVybjtcbiAgICAgIHZhciBwcmV2ID0gcmVtb3ZlLnByZXY7XG4gICAgICB2YXIgbmV4dCA9IHJlbW92ZS5uZXh0O1xuICAgICAgaWYgKHByZXYgIT0gbnVsbCkgcHJldi5uZXh0ID0gbmV4dDtcbiAgICAgIGlmIChuZXh0ICE9IG51bGwpIG5leHQucHJldiA9IHByZXY7XG4gICAgICBpZiAodGhpcy5zaGFwZXMgPT0gcmVtb3ZlKSB0aGlzLnNoYXBlcyA9IG5leHQ7XG4gICAgICByZW1vdmUucHJldiA9IG51bGw7XG4gICAgICByZW1vdmUubmV4dCA9IG51bGw7XG4gICAgICByZW1vdmUucGFyZW50ID0gbnVsbDtcbiAgICAgIGlmICh0aGlzLnBhcmVudCkgdGhpcy5wYXJlbnQucmVtb3ZlU2hhcGUocmVtb3ZlKTtcbiAgICAgIHRoaXMubnVtU2hhcGVzLS07XG5cbiAgICB9LFxuXG4gICAgcmVtb3ZlOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHRoaXMuZGlzcG9zZSgpO1xuXG4gICAgfSxcblxuICAgIGRpc3Bvc2U6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgdGhpcy5wYXJlbnQucmVtb3ZlUmlnaWRCb2R5KHRoaXMpO1xuXG4gICAgfSxcblxuICAgIGNoZWNrQ29udGFjdDogZnVuY3Rpb24gKG5hbWUpIHtcblxuICAgICAgdGhpcy5wYXJlbnQuY2hlY2tDb250YWN0KHRoaXMubmFtZSwgbmFtZSk7XG5cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2FsdWxhdGVzIG1hc3MgZGF0YXMoY2VudGVyIG9mIGdyYXZpdHksIG1hc3MsIG1vbWVudCBpbmVydGlhLCBldGMuLi4pLlxuICAgICAqIElmIHRoZSBwYXJhbWV0ZXIgdHlwZSBpcyBzZXQgdG8gQk9EWV9TVEFUSUMsIHRoZSByaWdpZCBib2R5IHdpbGwgYmUgZml4ZWQgdG8gdGhlIHNwYWNlLlxuICAgICAqIElmIHRoZSBwYXJhbWV0ZXIgYWRqdXN0UG9zaXRpb24gaXMgc2V0IHRvIHRydWUsIHRoZSBzaGFwZXMnIHJlbGF0aXZlIHBvc2l0aW9ucyBhbmRcbiAgICAgKiB0aGUgcmlnaWQgYm9keSdzIHBvc2l0aW9uIHdpbGwgYmUgYWRqdXN0ZWQgdG8gdGhlIGNlbnRlciBvZiBncmF2aXR5LlxuICAgICAqIEBwYXJhbSB0eXBlXG4gICAgICogQHBhcmFtIGFkanVzdFBvc2l0aW9uXG4gICAgICogQHJldHVybiB2b2lkXG4gICAgICovXG4gICAgc2V0dXBNYXNzOiBmdW5jdGlvbiAodHlwZSwgQWRqdXN0UG9zaXRpb24pIHtcblxuICAgICAgdmFyIGFkanVzdFBvc2l0aW9uID0gKEFkanVzdFBvc2l0aW9uICE9PSB1bmRlZmluZWQpID8gQWRqdXN0UG9zaXRpb24gOiB0cnVlO1xuXG4gICAgICB0aGlzLnR5cGUgPSB0eXBlIHx8IEJPRFlfU1RBVElDO1xuICAgICAgdGhpcy5pc0R5bmFtaWMgPSB0aGlzLnR5cGUgPT09IEJPRFlfRFlOQU1JQztcbiAgICAgIHRoaXMuaXNTdGF0aWMgPSB0aGlzLnR5cGUgPT09IEJPRFlfU1RBVElDO1xuXG4gICAgICB0aGlzLm1hc3MgPSAwO1xuICAgICAgdGhpcy5sb2NhbEluZXJ0aWEuc2V0KDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDApO1xuXG5cbiAgICAgIHZhciB0bXBNID0gbmV3IE1hdDMzKCk7XG4gICAgICB2YXIgdG1wViA9IG5ldyBWZWMzKCk7XG5cbiAgICAgIGZvciAodmFyIHNoYXBlID0gdGhpcy5zaGFwZXM7IHNoYXBlICE9PSBudWxsOyBzaGFwZSA9IHNoYXBlLm5leHQpIHtcblxuICAgICAgICBzaGFwZS5jYWxjdWxhdGVNYXNzSW5mbyh0aGlzLm1hc3NJbmZvKTtcbiAgICAgICAgdmFyIHNoYXBlTWFzcyA9IHRoaXMubWFzc0luZm8ubWFzcztcbiAgICAgICAgdG1wVi5hZGRTY2FsZWRWZWN0b3Ioc2hhcGUucmVsYXRpdmVQb3NpdGlvbiwgc2hhcGVNYXNzKTtcbiAgICAgICAgdGhpcy5tYXNzICs9IHNoYXBlTWFzcztcbiAgICAgICAgdGhpcy5yb3RhdGVJbmVydGlhKHNoYXBlLnJlbGF0aXZlUm90YXRpb24sIHRoaXMubWFzc0luZm8uaW5lcnRpYSwgdG1wTSk7XG4gICAgICAgIHRoaXMubG9jYWxJbmVydGlhLmFkZCh0bXBNKTtcblxuICAgICAgICAvLyBhZGQgb2Zmc2V0IGluZXJ0aWFcbiAgICAgICAgdGhpcy5sb2NhbEluZXJ0aWEuYWRkT2Zmc2V0KHNoYXBlTWFzcywgc2hhcGUucmVsYXRpdmVQb3NpdGlvbik7XG5cbiAgICAgIH1cblxuICAgICAgdGhpcy5pbnZlcnNlTWFzcyA9IDEgLyB0aGlzLm1hc3M7XG4gICAgICB0bXBWLnNjYWxlRXF1YWwodGhpcy5pbnZlcnNlTWFzcyk7XG5cbiAgICAgIGlmIChhZGp1c3RQb3NpdGlvbikge1xuICAgICAgICB0aGlzLnBvc2l0aW9uLmFkZCh0bXBWKTtcbiAgICAgICAgZm9yIChzaGFwZSA9IHRoaXMuc2hhcGVzOyBzaGFwZSAhPT0gbnVsbDsgc2hhcGUgPSBzaGFwZS5uZXh0KSB7XG4gICAgICAgICAgc2hhcGUucmVsYXRpdmVQb3NpdGlvbi5zdWJFcXVhbCh0bXBWKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHN1YnRyYWN0IG9mZnNldCBpbmVydGlhXG4gICAgICAgIHRoaXMubG9jYWxJbmVydGlhLnN1Yk9mZnNldCh0aGlzLm1hc3MsIHRtcFYpO1xuXG4gICAgICB9XG5cbiAgICAgIHRoaXMuaW52ZXJzZUxvY2FsSW5lcnRpYS5pbnZlcnQodGhpcy5sb2NhbEluZXJ0aWEpO1xuXG4gICAgICAvL31cblxuICAgICAgaWYgKHRoaXMudHlwZSA9PT0gQk9EWV9TVEFUSUMpIHtcbiAgICAgICAgdGhpcy5pbnZlcnNlTWFzcyA9IDA7XG4gICAgICAgIHRoaXMuaW52ZXJzZUxvY2FsSW5lcnRpYS5zZXQoMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuc3luY1NoYXBlcygpO1xuICAgICAgdGhpcy5hd2FrZSgpO1xuXG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBBd2FrZSB0aGUgcmlnaWQgYm9keS5cbiAgICAgKi9cbiAgICBhd2FrZTogZnVuY3Rpb24gKCkge1xuXG4gICAgICBpZiAoIXRoaXMuYWxsb3dTbGVlcCB8fCAhdGhpcy5zbGVlcGluZykgcmV0dXJuO1xuICAgICAgdGhpcy5zbGVlcGluZyA9IGZhbHNlO1xuICAgICAgdGhpcy5zbGVlcFRpbWUgPSAwO1xuICAgICAgLy8gYXdha2UgY29ubmVjdGVkIGNvbnN0cmFpbnRzXG4gICAgICB2YXIgY3MgPSB0aGlzLmNvbnRhY3RMaW5rO1xuICAgICAgd2hpbGUgKGNzICE9IG51bGwpIHtcbiAgICAgICAgY3MuYm9keS5zbGVlcFRpbWUgPSAwO1xuICAgICAgICBjcy5ib2R5LnNsZWVwaW5nID0gZmFsc2U7XG4gICAgICAgIGNzID0gY3MubmV4dDtcbiAgICAgIH1cbiAgICAgIHZhciBqcyA9IHRoaXMuam9pbnRMaW5rO1xuICAgICAgd2hpbGUgKGpzICE9IG51bGwpIHtcbiAgICAgICAganMuYm9keS5zbGVlcFRpbWUgPSAwO1xuICAgICAgICBqcy5ib2R5LnNsZWVwaW5nID0gZmFsc2U7XG4gICAgICAgIGpzID0ganMubmV4dDtcbiAgICAgIH1cbiAgICAgIGZvciAodmFyIHNoYXBlID0gdGhpcy5zaGFwZXM7IHNoYXBlICE9IG51bGw7IHNoYXBlID0gc2hhcGUubmV4dCkge1xuICAgICAgICBzaGFwZS51cGRhdGVQcm94eSgpO1xuICAgICAgfVxuXG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBTbGVlcCB0aGUgcmlnaWQgYm9keS5cbiAgICAgKi9cbiAgICBzbGVlcDogZnVuY3Rpb24gKCkge1xuXG4gICAgICBpZiAoIXRoaXMuYWxsb3dTbGVlcCB8fCB0aGlzLnNsZWVwaW5nKSByZXR1cm47XG5cbiAgICAgIHRoaXMubGluZWFyVmVsb2NpdHkuc2V0KDAsIDAsIDApO1xuICAgICAgdGhpcy5hbmd1bGFyVmVsb2NpdHkuc2V0KDAsIDAsIDApO1xuICAgICAgdGhpcy5zbGVlcFBvc2l0aW9uLmNvcHkodGhpcy5wb3NpdGlvbik7XG4gICAgICB0aGlzLnNsZWVwT3JpZW50YXRpb24uY29weSh0aGlzLm9yaWVudGF0aW9uKTtcblxuICAgICAgdGhpcy5zbGVlcFRpbWUgPSAwO1xuICAgICAgdGhpcy5zbGVlcGluZyA9IHRydWU7XG4gICAgICBmb3IgKHZhciBzaGFwZSA9IHRoaXMuc2hhcGVzOyBzaGFwZSAhPSBudWxsOyBzaGFwZSA9IHNoYXBlLm5leHQpIHtcbiAgICAgICAgc2hhcGUudXBkYXRlUHJveHkoKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgdGVzdFdha2VVcDogZnVuY3Rpb24gKCkge1xuXG4gICAgICBpZiAodGhpcy5saW5lYXJWZWxvY2l0eS50ZXN0WmVybygpIHx8IHRoaXMuYW5ndWxhclZlbG9jaXR5LnRlc3RaZXJvKCkgfHwgdGhpcy5wb3NpdGlvbi50ZXN0RGlmZih0aGlzLnNsZWVwUG9zaXRpb24pIHx8IHRoaXMub3JpZW50YXRpb24udGVzdERpZmYodGhpcy5zbGVlcE9yaWVudGF0aW9uKSkgdGhpcy5hd2FrZSgpOyAvLyBhd2FrZSB0aGUgYm9keVxuXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCB3aGV0aGVyIHRoZSByaWdpZCBib2R5IGhhcyBub3QgYW55IGNvbm5lY3Rpb24gd2l0aCBvdGhlcnMuXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBpc0xvbmVseTogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHRoaXMubnVtSm9pbnRzID09IDAgJiYgdGhpcy5udW1Db250YWN0cyA9PSAwO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUaGUgdGltZSBpbnRlZ3JhdGlvbiBvZiB0aGUgbW90aW9uIG9mIGEgcmlnaWQgYm9keSwgeW91IGNhbiB1cGRhdGUgdGhlIGluZm9ybWF0aW9uIHN1Y2ggYXMgdGhlIHNoYXBlLlxuICAgICAqIFRoaXMgbWV0aG9kIGlzIGludm9rZWQgYXV0b21hdGljYWxseSB3aGVuIGNhbGxpbmcgdGhlIHN0ZXAgb2YgdGhlIFdvcmxkLFxuICAgICAqIFRoZXJlIGlzIG5vIG5lZWQgdG8gY2FsbCBmcm9tIG91dHNpZGUgdXN1YWxseS5cbiAgICAgKiBAcGFyYW0gIHRpbWVTdGVwIHRpbWVcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuXG4gICAgdXBkYXRlUG9zaXRpb246IGZ1bmN0aW9uICh0aW1lU3RlcCkge1xuICAgICAgc3dpdGNoICh0aGlzLnR5cGUpIHtcbiAgICAgICAgY2FzZSBCT0RZX1NUQVRJQzpcbiAgICAgICAgICB0aGlzLmxpbmVhclZlbG9jaXR5LnNldCgwLCAwLCAwKTtcbiAgICAgICAgICB0aGlzLmFuZ3VsYXJWZWxvY2l0eS5zZXQoMCwgMCwgMCk7XG5cbiAgICAgICAgICAvLyBPTkxZIEZPUiBURVNUXG4gICAgICAgICAgaWYgKHRoaXMuY29udHJvbFBvcykge1xuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbi5jb3B5KHRoaXMubmV3UG9zaXRpb24pO1xuICAgICAgICAgICAgdGhpcy5jb250cm9sUG9zID0gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICh0aGlzLmNvbnRyb2xSb3QpIHtcbiAgICAgICAgICAgIHRoaXMub3JpZW50YXRpb24uY29weSh0aGlzLm5ld09yaWVudGF0aW9uKTtcbiAgICAgICAgICAgIHRoaXMuY29udHJvbFJvdCA9IGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvKnRoaXMubGluZWFyVmVsb2NpdHkueD0wO1xuICAgICAgICAgIHRoaXMubGluZWFyVmVsb2NpdHkueT0wO1xuICAgICAgICAgIHRoaXMubGluZWFyVmVsb2NpdHkuej0wO1xuICAgICAgICAgIHRoaXMuYW5ndWxhclZlbG9jaXR5Lng9MDtcbiAgICAgICAgICB0aGlzLmFuZ3VsYXJWZWxvY2l0eS55PTA7XG4gICAgICAgICAgdGhpcy5hbmd1bGFyVmVsb2NpdHkuej0wOyovXG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgQk9EWV9EWU5BTUlDOlxuXG4gICAgICAgICAgaWYgKHRoaXMuaXNLaW5lbWF0aWMpIHtcblxuICAgICAgICAgICAgdGhpcy5saW5lYXJWZWxvY2l0eS5zZXQoMCwgMCwgMCk7XG4gICAgICAgICAgICB0aGlzLmFuZ3VsYXJWZWxvY2l0eS5zZXQoMCwgMCwgMCk7XG5cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAodGhpcy5jb250cm9sUG9zKSB7XG5cbiAgICAgICAgICAgIHRoaXMubGluZWFyVmVsb2NpdHkuc3ViVmVjdG9ycyh0aGlzLm5ld1Bvc2l0aW9uLCB0aGlzLnBvc2l0aW9uKS5tdWx0aXBseVNjYWxhcigxIC8gdGltZVN0ZXApO1xuICAgICAgICAgICAgdGhpcy5jb250cm9sUG9zID0gZmFsc2U7XG5cbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHRoaXMuY29udHJvbFJvdCkge1xuXG4gICAgICAgICAgICB0aGlzLmFuZ3VsYXJWZWxvY2l0eS5jb3B5KHRoaXMuZ2V0QXhpcygpKTtcbiAgICAgICAgICAgIHRoaXMub3JpZW50YXRpb24uY29weSh0aGlzLm5ld09yaWVudGF0aW9uKTtcbiAgICAgICAgICAgIHRoaXMuY29udHJvbFJvdCA9IGZhbHNlO1xuXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdGhpcy5wb3NpdGlvbi5hZGRTY2FsZWRWZWN0b3IodGhpcy5saW5lYXJWZWxvY2l0eSwgdGltZVN0ZXApO1xuICAgICAgICAgIHRoaXMub3JpZW50YXRpb24uYWRkVGltZSh0aGlzLmFuZ3VsYXJWZWxvY2l0eSwgdGltZVN0ZXApO1xuXG4gICAgICAgICAgdGhpcy51cGRhdGVNZXNoKCk7XG5cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDogcHJpbnRFcnJvcihcIlJpZ2lkQm9keVwiLCBcIkludmFsaWQgdHlwZS5cIik7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuc3luY1NoYXBlcygpO1xuICAgICAgdGhpcy51cGRhdGVNZXNoKCk7XG5cbiAgICB9LFxuXG4gICAgZ2V0QXhpczogZnVuY3Rpb24gKCkge1xuXG4gICAgICByZXR1cm4gbmV3IFZlYzMoMCwgMSwgMCkuYXBwbHlNYXRyaXgzKHRoaXMuaW52ZXJzZUxvY2FsSW5lcnRpYSwgdHJ1ZSkubm9ybWFsaXplKCk7XG5cbiAgICB9LFxuXG4gICAgcm90YXRlSW5lcnRpYTogZnVuY3Rpb24gKHJvdCwgaW5lcnRpYSwgb3V0KSB7XG5cbiAgICAgIHRoaXMudG1wSW5lcnRpYS5tdWx0aXBseU1hdHJpY2VzKHJvdCwgaW5lcnRpYSk7XG4gICAgICBvdXQubXVsdGlwbHlNYXRyaWNlcyh0aGlzLnRtcEluZXJ0aWEsIHJvdCwgdHJ1ZSk7XG5cbiAgICB9LFxuXG4gICAgc3luY1NoYXBlczogZnVuY3Rpb24gKCkge1xuXG4gICAgICB0aGlzLnJvdGF0aW9uLnNldFF1YXQodGhpcy5vcmllbnRhdGlvbik7XG4gICAgICB0aGlzLnJvdGF0ZUluZXJ0aWEodGhpcy5yb3RhdGlvbiwgdGhpcy5pbnZlcnNlTG9jYWxJbmVydGlhLCB0aGlzLmludmVyc2VJbmVydGlhKTtcblxuICAgICAgZm9yICh2YXIgc2hhcGUgPSB0aGlzLnNoYXBlczsgc2hhcGUgIT0gbnVsbDsgc2hhcGUgPSBzaGFwZS5uZXh0KSB7XG5cbiAgICAgICAgc2hhcGUucG9zaXRpb24uY29weShzaGFwZS5yZWxhdGl2ZVBvc2l0aW9uKS5hcHBseU1hdHJpeDModGhpcy5yb3RhdGlvbiwgdHJ1ZSkuYWRkKHRoaXMucG9zaXRpb24pO1xuICAgICAgICAvLyBhZGQgYnkgUXVhemlLYlxuICAgICAgICBzaGFwZS5yb3RhdGlvbi5tdWx0aXBseU1hdHJpY2VzKHRoaXMucm90YXRpb24sIHNoYXBlLnJlbGF0aXZlUm90YXRpb24pO1xuICAgICAgICBzaGFwZS51cGRhdGVQcm94eSgpO1xuICAgICAgfVxuICAgIH0sXG5cblxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gQVBQTFkgSU1QVUxTRSBGT1JDRVxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgICBhcHBseUltcHVsc2U6IGZ1bmN0aW9uIChwb3NpdGlvbiwgZm9yY2UpIHtcbiAgICAgIHRoaXMubGluZWFyVmVsb2NpdHkuYWRkU2NhbGVkVmVjdG9yKGZvcmNlLCB0aGlzLmludmVyc2VNYXNzKTtcbiAgICAgIHZhciByZWwgPSBuZXcgVmVjMygpLmNvcHkocG9zaXRpb24pLnN1Yih0aGlzLnBvc2l0aW9uKS5jcm9zcyhmb3JjZSkuYXBwbHlNYXRyaXgzKHRoaXMuaW52ZXJzZUluZXJ0aWEsIHRydWUpO1xuICAgICAgdGhpcy5hbmd1bGFyVmVsb2NpdHkuYWRkKHJlbCk7XG4gICAgfSxcblxuXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAvLyBTRVQgRFlOQU1JUVVFIFBPU0lUSU9OIEFORCBST1RBVElPTlxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgICBzZXRQb3NpdGlvbjogZnVuY3Rpb24gKHBvcykge1xuICAgICAgdGhpcy5uZXdQb3NpdGlvbi5jb3B5KHBvcykubXVsdGlwbHlTY2FsYXIodGhpcy5pbnZTY2FsZSk7XG4gICAgICB0aGlzLmNvbnRyb2xQb3MgPSB0cnVlO1xuICAgICAgaWYgKCF0aGlzLmlzS2luZW1hdGljKSB0aGlzLmlzS2luZW1hdGljID0gdHJ1ZTtcbiAgICB9LFxuXG4gICAgc2V0UXVhdGVybmlvbjogZnVuY3Rpb24gKHEpIHtcbiAgICAgIHRoaXMubmV3T3JpZW50YXRpb24uc2V0KHEueCwgcS55LCBxLnosIHEudyk7XG4gICAgICB0aGlzLmNvbnRyb2xSb3QgPSB0cnVlO1xuICAgICAgaWYgKCF0aGlzLmlzS2luZW1hdGljKSB0aGlzLmlzS2luZW1hdGljID0gdHJ1ZTtcbiAgICB9LFxuXG4gICAgc2V0Um90YXRpb246IGZ1bmN0aW9uIChyb3QpIHtcblxuICAgICAgdGhpcy5uZXdPcmllbnRhdGlvbiA9IG5ldyBRdWF0KCkuc2V0RnJvbUV1bGVyKHJvdC54ICogX01hdGguZGVndG9yYWQsIHJvdC55ICogX01hdGguZGVndG9yYWQsIHJvdC56ICogX01hdGguZGVndG9yYWQpOy8vdGhpcy5yb3RhdGlvblZlY3RUb1F1YWQoIHJvdCApO1xuICAgICAgdGhpcy5jb250cm9sUm90ID0gdHJ1ZTtcblxuICAgIH0sXG5cbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIC8vIFJFU0VUIERZTkFNSVFVRSBQT1NJVElPTiBBTkQgUk9UQVRJT05cbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICAgcmVzZXRQb3NpdGlvbjogZnVuY3Rpb24gKHgsIHksIHopIHtcblxuICAgICAgdGhpcy5saW5lYXJWZWxvY2l0eS5zZXQoMCwgMCwgMCk7XG4gICAgICB0aGlzLmFuZ3VsYXJWZWxvY2l0eS5zZXQoMCwgMCwgMCk7XG4gICAgICB0aGlzLnBvc2l0aW9uLnNldCh4LCB5LCB6KS5tdWx0aXBseVNjYWxhcih0aGlzLmludlNjYWxlKTtcbiAgICAgIC8vdGhpcy5wb3NpdGlvbi5zZXQoIHgqT0lNTy5Xb3JsZFNjYWxlLmludlNjYWxlLCB5Kk9JTU8uV29ybGRTY2FsZS5pbnZTY2FsZSwgeipPSU1PLldvcmxkU2NhbGUuaW52U2NhbGUgKTtcbiAgICAgIHRoaXMuYXdha2UoKTtcbiAgICB9LFxuXG4gICAgcmVzZXRRdWF0ZXJuaW9uOiBmdW5jdGlvbiAocSkge1xuXG4gICAgICB0aGlzLmFuZ3VsYXJWZWxvY2l0eS5zZXQoMCwgMCwgMCk7XG4gICAgICB0aGlzLm9yaWVudGF0aW9uID0gbmV3IFF1YXQocS54LCBxLnksIHEueiwgcS53KTtcbiAgICAgIHRoaXMuYXdha2UoKTtcblxuICAgIH0sXG5cbiAgICByZXNldFJvdGF0aW9uOiBmdW5jdGlvbiAoeCwgeSwgeikge1xuXG4gICAgICB0aGlzLmFuZ3VsYXJWZWxvY2l0eS5zZXQoMCwgMCwgMCk7XG4gICAgICB0aGlzLm9yaWVudGF0aW9uID0gbmV3IFF1YXQoKS5zZXRGcm9tRXVsZXIoeCAqIF9NYXRoLmRlZ3RvcmFkLCB5ICogX01hdGguZGVndG9yYWQsIHogKiBfTWF0aC5kZWd0b3JhZCk7Ly90aGlzLnJvdGF0aW9uVmVjdFRvUXVhZCggbmV3IFZlYzMoeCx5LHopICk7XG4gICAgICB0aGlzLmF3YWtlKCk7XG5cbiAgICB9LFxuXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAvLyBHRVQgUE9TSVRJT04gQU5EIFJPVEFUSU9OXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAgIGdldFBvc2l0aW9uOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHJldHVybiB0aGlzLnBvcztcblxuICAgIH0sXG5cbiAgICBnZXRRdWF0ZXJuaW9uOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHJldHVybiB0aGlzLnF1YXRlcm5pb247XG5cbiAgICB9LFxuXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAvLyBBVVRPIFVQREFURSBUSFJFRSBNRVNIXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAgIGNvbm5lY3RNZXNoOiBmdW5jdGlvbiAobWVzaCkge1xuXG4gICAgICB0aGlzLm1lc2ggPSBtZXNoO1xuICAgICAgdGhpcy51cGRhdGVNZXNoKCk7XG5cbiAgICB9LFxuXG4gICAgdXBkYXRlTWVzaDogZnVuY3Rpb24gKCkge1xuXG4gICAgICB0aGlzLnBvcy5zY2FsZSh0aGlzLnBvc2l0aW9uLCB0aGlzLnNjYWxlKTtcbiAgICAgIHRoaXMucXVhdGVybmlvbi5jb3B5KHRoaXMub3JpZW50YXRpb24pO1xuXG4gICAgICBpZiAodGhpcy5tZXNoID09PSBudWxsKSByZXR1cm47XG5cbiAgICAgIHRoaXMubWVzaC5wb3NpdGlvbi5jb3B5KHRoaXMuZ2V0UG9zaXRpb24oKSk7XG4gICAgICB0aGlzLm1lc2gucXVhdGVybmlvbi5jb3B5KHRoaXMuZ2V0UXVhdGVybmlvbigpKTtcblxuICAgIH0sXG5cbiAgfSk7XG5cbiAgLyoqXG4gICogQSBwYWlyIG9mIHNoYXBlcyB0aGF0IG1heSBjb2xsaWRlLlxuICAqIEBhdXRob3Igc2FoYXJhblxuICAqL1xuICBmdW5jdGlvbiBQYWlyKHMxLCBzMikge1xuXG4gICAgLy8gVGhlIGZpcnN0IHNoYXBlLlxuICAgIHRoaXMuc2hhcGUxID0gczEgfHwgbnVsbDtcbiAgICAvLyBUaGUgc2Vjb25kIHNoYXBlLlxuICAgIHRoaXMuc2hhcGUyID0gczIgfHwgbnVsbDtcblxuICB9XG5cbiAgLyoqXG4gICogVGhlIGJyb2FkLXBoYXNlIGlzIHVzZWQgZm9yIGNvbGxlY3RpbmcgYWxsIHBvc3NpYmxlIHBhaXJzIGZvciBjb2xsaXNpb24uXG4gICovXG5cbiAgZnVuY3Rpb24gQnJvYWRQaGFzZSgpIHtcblxuICAgIHRoaXMudHlwZXMgPSBCUl9OVUxMO1xuICAgIHRoaXMubnVtUGFpckNoZWNrcyA9IDA7XG4gICAgdGhpcy5udW1QYWlycyA9IDA7XG4gICAgdGhpcy5wYWlycyA9IFtdO1xuXG4gIH1cbiAgT2JqZWN0LmFzc2lnbihCcm9hZFBoYXNlLnByb3RvdHlwZSwge1xuXG4gICAgQnJvYWRQaGFzZTogdHJ1ZSxcblxuICAgIC8vIENyZWF0ZSBhIG5ldyBwcm94eS5cbiAgICBjcmVhdGVQcm94eTogZnVuY3Rpb24gKHNoYXBlKSB7XG5cbiAgICAgIHByaW50RXJyb3IoXCJCcm9hZFBoYXNlXCIsIFwiSW5oZXJpdGFuY2UgZXJyb3IuXCIpO1xuXG4gICAgfSxcblxuICAgIC8vIEFkZCB0aGUgcHJveHkgaW50byB0aGUgYnJvYWQtcGhhc2UuXG4gICAgYWRkUHJveHk6IGZ1bmN0aW9uIChwcm94eSkge1xuXG4gICAgICBwcmludEVycm9yKFwiQnJvYWRQaGFzZVwiLCBcIkluaGVyaXRhbmNlIGVycm9yLlwiKTtcbiAgICB9LFxuXG4gICAgLy8gUmVtb3ZlIHRoZSBwcm94eSBmcm9tIHRoZSBicm9hZC1waGFzZS5cbiAgICByZW1vdmVQcm94eTogZnVuY3Rpb24gKHByb3h5KSB7XG5cbiAgICAgIHByaW50RXJyb3IoXCJCcm9hZFBoYXNlXCIsIFwiSW5oZXJpdGFuY2UgZXJyb3IuXCIpO1xuXG4gICAgfSxcblxuICAgIC8vIFJldHVybnMgd2hldGhlciB0aGUgcGFpciBpcyBhdmFpbGFibGUgb3Igbm90LlxuICAgIGlzQXZhaWxhYmxlUGFpcjogZnVuY3Rpb24gKHMxLCBzMikge1xuXG4gICAgICB2YXIgYjEgPSBzMS5wYXJlbnQ7XG4gICAgICB2YXIgYjIgPSBzMi5wYXJlbnQ7XG4gICAgICBpZiAoYjEgPT0gYjIgfHwgLy8gc2FtZSBwYXJlbnRzXG4gICAgICAgICghYjEuaXNEeW5hbWljICYmICFiMi5pc0R5bmFtaWMpIHx8IC8vIHN0YXRpYyBvciBraW5lbWF0aWMgb2JqZWN0XG4gICAgICAgIChzMS5iZWxvbmdzVG8gJiBzMi5jb2xsaWRlc1dpdGgpID09IDAgfHxcbiAgICAgICAgKHMyLmJlbG9uZ3NUbyAmIHMxLmNvbGxpZGVzV2l0aCkgPT0gMCAvLyBjb2xsaXNpb24gZmlsdGVyaW5nXG4gICAgICApIHsgcmV0dXJuIGZhbHNlOyB9XG4gICAgICB2YXIganM7XG4gICAgICBpZiAoYjEubnVtSm9pbnRzIDwgYjIubnVtSm9pbnRzKSBqcyA9IGIxLmpvaW50TGluaztcbiAgICAgIGVsc2UganMgPSBiMi5qb2ludExpbms7XG4gICAgICB3aGlsZSAoanMgIT09IG51bGwpIHtcbiAgICAgICAgdmFyIGpvaW50ID0ganMuam9pbnQ7XG4gICAgICAgIGlmICgham9pbnQuYWxsb3dDb2xsaXNpb24gJiYgKChqb2ludC5ib2R5MSA9PSBiMSAmJiBqb2ludC5ib2R5MiA9PSBiMikgfHwgKGpvaW50LmJvZHkxID09IGIyICYmIGpvaW50LmJvZHkyID09IGIxKSkpIHsgcmV0dXJuIGZhbHNlOyB9XG4gICAgICAgIGpzID0ganMubmV4dDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRydWU7XG5cbiAgICB9LFxuXG4gICAgLy8gRGV0ZWN0IG92ZXJsYXBwaW5nIHBhaXJzLlxuICAgIGRldGVjdFBhaXJzOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIC8vIGNsZWFyIG9sZFxuICAgICAgdGhpcy5wYWlycyA9IFtdO1xuICAgICAgdGhpcy5udW1QYWlycyA9IDA7XG4gICAgICB0aGlzLm51bVBhaXJDaGVja3MgPSAwO1xuICAgICAgdGhpcy5jb2xsZWN0UGFpcnMoKTtcblxuICAgIH0sXG5cbiAgICBjb2xsZWN0UGFpcnM6IGZ1bmN0aW9uICgpIHtcblxuICAgIH0sXG5cbiAgICBhZGRQYWlyOiBmdW5jdGlvbiAoczEsIHMyKSB7XG5cbiAgICAgIHZhciBwYWlyID0gbmV3IFBhaXIoczEsIHMyKTtcbiAgICAgIHRoaXMucGFpcnMucHVzaChwYWlyKTtcbiAgICAgIHRoaXMubnVtUGFpcnMrKztcblxuICAgIH1cblxuICB9KTtcblxuICB2YXIgY291bnQkMSA9IDA7XG4gIGZ1bmN0aW9uIFByb3h5SWRDb3VudCgpIHsgcmV0dXJuIGNvdW50JDErKzsgfVxuXG4gIC8qKlxuICAgKiBBIHByb3h5IGlzIHVzZWQgZm9yIGJyb2FkLXBoYXNlIGNvbGxlY3RpbmcgcGFpcnMgdGhhdCBjYW4gYmUgY29sbGlkaW5nLlxuICAgKlxuICAgKiBAYXV0aG9yIGxvLXRoXG4gICAqL1xuXG4gIGZ1bmN0aW9uIFByb3h5KHNoYXBlKSB7XG5cbiAgICAvL1RoZSBwYXJlbnQgc2hhcGUuXG4gICAgdGhpcy5zaGFwZSA9IHNoYXBlO1xuXG4gICAgLy9UaGUgYXhpcy1hbGlnbmVkIGJvdW5kaW5nIGJveC5cbiAgICB0aGlzLmFhYmIgPSBzaGFwZS5hYWJiO1xuXG4gIH1cbiAgT2JqZWN0LmFzc2lnbihQcm94eS5wcm90b3R5cGUsIHtcblxuICAgIFByb3h5OiB0cnVlLFxuXG4gICAgLy8gVXBkYXRlIHRoZSBwcm94eS4gTXVzdCBiZSBpbmhlcml0ZWQgYnkgYSBjaGlsZC5cblxuICAgIHVwZGF0ZTogZnVuY3Rpb24gKCkge1xuXG4gICAgICBwcmludEVycm9yKFwiUHJveHlcIiwgXCJJbmhlcml0YW5jZSBlcnJvci5cIik7XG5cbiAgICB9XG5cbiAgfSk7XG5cbiAgLyoqXG4gICogQSBiYXNpYyBpbXBsZW1lbnRhdGlvbiBvZiBwcm94aWVzLlxuICAqXG4gICogQGF1dGhvciBzYWhhcmFuXG4gICovXG5cbiAgZnVuY3Rpb24gQmFzaWNQcm94eShzaGFwZSkge1xuXG4gICAgUHJveHkuY2FsbCh0aGlzLCBzaGFwZSk7XG5cbiAgICB0aGlzLmlkID0gUHJveHlJZENvdW50KCk7XG5cbiAgfVxuICBCYXNpY1Byb3h5LnByb3RvdHlwZSA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmNyZWF0ZShQcm94eS5wcm90b3R5cGUpLCB7XG5cbiAgICBjb25zdHJ1Y3RvcjogQmFzaWNQcm94eSxcblxuICAgIHVwZGF0ZTogZnVuY3Rpb24gKCkge1xuXG4gICAgfVxuXG4gIH0pO1xuXG4gIC8qKlxuICAqIEEgYnJvYWQtcGhhc2UgYWxnb3JpdGhtIHdpdGggYnJ1dGUtZm9yY2Ugc2VhcmNoLlxuICAqIFRoaXMgYWx3YXlzIGNoZWNrcyBmb3IgYWxsIHBvc3NpYmxlIHBhaXJzLlxuICAqL1xuXG4gIGZ1bmN0aW9uIEJydXRlRm9yY2VCcm9hZFBoYXNlKCkge1xuXG4gICAgQnJvYWRQaGFzZS5jYWxsKHRoaXMpO1xuICAgIHRoaXMudHlwZXMgPSBCUl9CUlVURV9GT1JDRTtcbiAgICAvL3RoaXMubnVtUHJveGllcz0wO1xuICAgIC8vL3RoaXMubWF4UHJveGllcyA9IDI1NjtcbiAgICB0aGlzLnByb3hpZXMgPSBbXTtcbiAgICAvL3RoaXMucHJveGllcy5sZW5ndGggPSAyNTY7XG5cbiAgfVxuXG4gIEJydXRlRm9yY2VCcm9hZFBoYXNlLnByb3RvdHlwZSA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmNyZWF0ZShCcm9hZFBoYXNlLnByb3RvdHlwZSksIHtcblxuICAgIGNvbnN0cnVjdG9yOiBCcnV0ZUZvcmNlQnJvYWRQaGFzZSxcblxuICAgIGNyZWF0ZVByb3h5OiBmdW5jdGlvbiAoc2hhcGUpIHtcblxuICAgICAgcmV0dXJuIG5ldyBCYXNpY1Byb3h5KHNoYXBlKTtcblxuICAgIH0sXG5cbiAgICBhZGRQcm94eTogZnVuY3Rpb24gKHByb3h5KSB7XG5cbiAgICAgIC8qaWYodGhpcy5udW1Qcm94aWVzPT10aGlzLm1heFByb3hpZXMpe1xuICAgICAgICAgIC8vdGhpcy5tYXhQcm94aWVzPDw9MTtcbiAgICAgICAgICB0aGlzLm1heFByb3hpZXMqPTI7XG4gICAgICAgICAgdmFyIG5ld1Byb3hpZXM9W107XG4gICAgICAgICAgbmV3UHJveGllcy5sZW5ndGggPSB0aGlzLm1heFByb3hpZXM7XG4gICAgICAgICAgdmFyIGkgPSB0aGlzLm51bVByb3hpZXM7XG4gICAgICAgICAgd2hpbGUoaS0tKXtcbiAgICAgICAgICAvL2Zvcih2YXIgaT0wLCBsPXRoaXMubnVtUHJveGllcztpPGw7aSsrKXtcbiAgICAgICAgICAgICAgbmV3UHJveGllc1tpXT10aGlzLnByb3hpZXNbaV07XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMucHJveGllcz1uZXdQcm94aWVzO1xuICAgICAgfSovXG4gICAgICAvL3RoaXMucHJveGllc1t0aGlzLm51bVByb3hpZXMrK10gPSBwcm94eTtcbiAgICAgIHRoaXMucHJveGllcy5wdXNoKHByb3h5KTtcbiAgICAgIC8vdGhpcy5udW1Qcm94aWVzKys7XG5cbiAgICB9LFxuXG4gICAgcmVtb3ZlUHJveHk6IGZ1bmN0aW9uIChwcm94eSkge1xuXG4gICAgICB2YXIgbiA9IHRoaXMucHJveGllcy5pbmRleE9mKHByb3h5KTtcbiAgICAgIGlmIChuID4gLTEpIHtcbiAgICAgICAgdGhpcy5wcm94aWVzLnNwbGljZShuLCAxKTtcbiAgICAgICAgLy90aGlzLm51bVByb3hpZXMtLTtcbiAgICAgIH1cblxuICAgICAgLyp2YXIgaSA9IHRoaXMubnVtUHJveGllcztcbiAgICAgIHdoaWxlKGktLSl7XG4gICAgICAvL2Zvcih2YXIgaT0wLCBsPXRoaXMubnVtUHJveGllcztpPGw7aSsrKXtcbiAgICAgICAgICBpZih0aGlzLnByb3hpZXNbaV0gPT0gcHJveHkpe1xuICAgICAgICAgICAgICB0aGlzLnByb3hpZXNbaV0gPSB0aGlzLnByb3hpZXNbLS10aGlzLm51bVByb3hpZXNdO1xuICAgICAgICAgICAgICB0aGlzLnByb3hpZXNbdGhpcy5udW1Qcm94aWVzXSA9IG51bGw7XG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICB9Ki9cblxuICAgIH0sXG5cbiAgICBjb2xsZWN0UGFpcnM6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgdmFyIGkgPSAwLCBqLCBwMSwgcDI7XG5cbiAgICAgIHZhciBweCA9IHRoaXMucHJveGllcztcbiAgICAgIHZhciBsID0gcHgubGVuZ3RoOy8vdGhpcy5udW1Qcm94aWVzO1xuICAgICAgLy92YXIgYXIxID0gW107XG4gICAgICAvL3ZhciBhcjIgPSBbXTtcblxuICAgICAgLy9mb3IoIGkgPSBweC5sZW5ndGggOyBpLS0gOyBhcjFbIGkgXSA9IHB4WyBpIF0gKXt9O1xuICAgICAgLy9mb3IoIGkgPSBweC5sZW5ndGggOyBpLS0gOyBhcjJbIGkgXSA9IHB4WyBpIF0gKXt9O1xuXG4gICAgICAvL3ZhciBhcjEgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoaXMucHJveGllcykpXG4gICAgICAvL3ZhciBhcjIgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoaXMucHJveGllcykpXG5cbiAgICAgIHRoaXMubnVtUGFpckNoZWNrcyA9IGwgKiAobCAtIDEpID4+IDE7XG4gICAgICAvL3RoaXMubnVtUGFpckNoZWNrcz10aGlzLm51bVByb3hpZXMqKHRoaXMubnVtUHJveGllcy0xKSowLjU7XG5cbiAgICAgIHdoaWxlIChpIDwgbCkge1xuICAgICAgICBwMSA9IHB4W2krK107XG4gICAgICAgIGogPSBpICsgMTtcbiAgICAgICAgd2hpbGUgKGogPCBsKSB7XG4gICAgICAgICAgcDIgPSBweFtqKytdO1xuICAgICAgICAgIGlmIChwMS5hYWJiLmludGVyc2VjdFRlc3QocDIuYWFiYikgfHwgIXRoaXMuaXNBdmFpbGFibGVQYWlyKHAxLnNoYXBlLCBwMi5zaGFwZSkpIGNvbnRpbnVlO1xuICAgICAgICAgIHRoaXMuYWRkUGFpcihwMS5zaGFwZSwgcDIuc2hhcGUpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICB9XG5cbiAgfSk7XG5cbiAgLyoqXG4gICAqIEEgcHJvamVjdGlvbiBheGlzIGZvciBzd2VlcCBhbmQgcHJ1bmUgYnJvYWQtcGhhc2UuXG4gICAqIEBhdXRob3Igc2FoYXJhblxuICAgKi9cblxuICBmdW5jdGlvbiBTQVBBeGlzKCkge1xuXG4gICAgdGhpcy5udW1FbGVtZW50cyA9IDA7XG4gICAgdGhpcy5idWZmZXJTaXplID0gMjU2O1xuICAgIHRoaXMuZWxlbWVudHMgPSBbXTtcbiAgICB0aGlzLmVsZW1lbnRzLmxlbmd0aCA9IHRoaXMuYnVmZmVyU2l6ZTtcbiAgICB0aGlzLnN0YWNrID0gbmV3IEZsb2F0MzJBcnJheSg2NCk7XG5cbiAgfVxuXG4gIE9iamVjdC5hc3NpZ24oU0FQQXhpcy5wcm90b3R5cGUsIHtcblxuICAgIFNBUEF4aXM6IHRydWUsXG5cbiAgICBhZGRFbGVtZW50czogZnVuY3Rpb24gKG1pbiwgbWF4KSB7XG5cbiAgICAgIGlmICh0aGlzLm51bUVsZW1lbnRzICsgMiA+PSB0aGlzLmJ1ZmZlclNpemUpIHtcbiAgICAgICAgLy90aGlzLmJ1ZmZlclNpemU8PD0xO1xuICAgICAgICB0aGlzLmJ1ZmZlclNpemUgKj0gMjtcbiAgICAgICAgdmFyIG5ld0VsZW1lbnRzID0gW107XG4gICAgICAgIHZhciBpID0gdGhpcy5udW1FbGVtZW50cztcbiAgICAgICAgd2hpbGUgKGktLSkge1xuICAgICAgICAgIC8vZm9yKHZhciBpPTAsIGw9dGhpcy5udW1FbGVtZW50czsgaTxsOyBpKyspe1xuICAgICAgICAgIG5ld0VsZW1lbnRzW2ldID0gdGhpcy5lbGVtZW50c1tpXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGhpcy5lbGVtZW50c1t0aGlzLm51bUVsZW1lbnRzKytdID0gbWluO1xuICAgICAgdGhpcy5lbGVtZW50c1t0aGlzLm51bUVsZW1lbnRzKytdID0gbWF4O1xuXG4gICAgfSxcblxuICAgIHJlbW92ZUVsZW1lbnRzOiBmdW5jdGlvbiAobWluLCBtYXgpIHtcblxuICAgICAgdmFyIG1pbkluZGV4ID0gLTE7XG4gICAgICB2YXIgbWF4SW5kZXggPSAtMTtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gdGhpcy5udW1FbGVtZW50czsgaSA8IGw7IGkrKykge1xuICAgICAgICB2YXIgZSA9IHRoaXMuZWxlbWVudHNbaV07XG4gICAgICAgIGlmIChlID09IG1pbiB8fCBlID09IG1heCkge1xuICAgICAgICAgIGlmIChtaW5JbmRleCA9PSAtMSkge1xuICAgICAgICAgICAgbWluSW5kZXggPSBpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBtYXhJbmRleCA9IGk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGZvciAoaSA9IG1pbkluZGV4ICsgMSwgbCA9IG1heEluZGV4OyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIHRoaXMuZWxlbWVudHNbaSAtIDFdID0gdGhpcy5lbGVtZW50c1tpXTtcbiAgICAgIH1cbiAgICAgIGZvciAoaSA9IG1heEluZGV4ICsgMSwgbCA9IHRoaXMubnVtRWxlbWVudHM7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgdGhpcy5lbGVtZW50c1tpIC0gMl0gPSB0aGlzLmVsZW1lbnRzW2ldO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmVsZW1lbnRzWy0tdGhpcy5udW1FbGVtZW50c10gPSBudWxsO1xuICAgICAgdGhpcy5lbGVtZW50c1stLXRoaXMubnVtRWxlbWVudHNdID0gbnVsbDtcblxuICAgIH0sXG5cbiAgICBzb3J0OiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHZhciBjb3VudCA9IDA7XG4gICAgICB2YXIgdGhyZXNob2xkID0gMTtcbiAgICAgIHdoaWxlICgodGhpcy5udW1FbGVtZW50cyA+PiB0aHJlc2hvbGQpICE9IDApIHRocmVzaG9sZCsrO1xuICAgICAgdGhyZXNob2xkID0gdGhyZXNob2xkICogdGhpcy5udW1FbGVtZW50cyA+PiAyO1xuICAgICAgY291bnQgPSAwO1xuXG4gICAgICB2YXIgZ2l2ZXVwID0gZmFsc2U7XG4gICAgICB2YXIgZWxlbWVudHMgPSB0aGlzLmVsZW1lbnRzO1xuICAgICAgZm9yICh2YXIgaSA9IDEsIGwgPSB0aGlzLm51bUVsZW1lbnRzOyBpIDwgbDsgaSsrKSB7IC8vIHRyeSBpbnNlcnRpb24gc29ydFxuICAgICAgICB2YXIgdG1wID0gZWxlbWVudHNbaV07XG4gICAgICAgIHZhciBwaXZvdCA9IHRtcC52YWx1ZTtcbiAgICAgICAgdmFyIHRtcDIgPSBlbGVtZW50c1tpIC0gMV07XG4gICAgICAgIGlmICh0bXAyLnZhbHVlID4gcGl2b3QpIHtcbiAgICAgICAgICB2YXIgaiA9IGk7XG4gICAgICAgICAgZG8ge1xuICAgICAgICAgICAgZWxlbWVudHNbal0gPSB0bXAyO1xuICAgICAgICAgICAgaWYgKC0taiA9PSAwKSBicmVhaztcbiAgICAgICAgICAgIHRtcDIgPSBlbGVtZW50c1tqIC0gMV07XG4gICAgICAgICAgfSB3aGlsZSAodG1wMi52YWx1ZSA+IHBpdm90KTtcbiAgICAgICAgICBlbGVtZW50c1tqXSA9IHRtcDtcbiAgICAgICAgICBjb3VudCArPSBpIC0gajtcbiAgICAgICAgICBpZiAoY291bnQgPiB0aHJlc2hvbGQpIHtcbiAgICAgICAgICAgIGdpdmV1cCA9IHRydWU7IC8vIHN0b3AgYW5kIHVzZSBxdWljayBzb3J0XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICghZ2l2ZXVwKSByZXR1cm47XG4gICAgICBjb3VudCA9IDI7IHZhciBzdGFjayA9IHRoaXMuc3RhY2s7XG4gICAgICBzdGFja1swXSA9IDA7XG4gICAgICBzdGFja1sxXSA9IHRoaXMubnVtRWxlbWVudHMgLSAxO1xuICAgICAgd2hpbGUgKGNvdW50ID4gMCkge1xuICAgICAgICB2YXIgcmlnaHQgPSBzdGFja1stLWNvdW50XTtcbiAgICAgICAgdmFyIGxlZnQgPSBzdGFja1stLWNvdW50XTtcbiAgICAgICAgdmFyIGRpZmYgPSByaWdodCAtIGxlZnQ7XG4gICAgICAgIGlmIChkaWZmID4gMTYpIHsgIC8vIHF1aWNrIHNvcnRcbiAgICAgICAgICAvL3ZhciBtaWQ9bGVmdCsoZGlmZj4+MSk7XG4gICAgICAgICAgdmFyIG1pZCA9IGxlZnQgKyAoX01hdGguZmxvb3IoZGlmZiAqIDAuNSkpO1xuICAgICAgICAgIHRtcCA9IGVsZW1lbnRzW21pZF07XG4gICAgICAgICAgZWxlbWVudHNbbWlkXSA9IGVsZW1lbnRzW3JpZ2h0XTtcbiAgICAgICAgICBlbGVtZW50c1tyaWdodF0gPSB0bXA7XG4gICAgICAgICAgcGl2b3QgPSB0bXAudmFsdWU7XG4gICAgICAgICAgaSA9IGxlZnQgLSAxO1xuICAgICAgICAgIGogPSByaWdodDtcbiAgICAgICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICAgICAgdmFyIGVpO1xuICAgICAgICAgICAgdmFyIGVqO1xuICAgICAgICAgICAgZG8geyBlaSA9IGVsZW1lbnRzWysraV07IH0gd2hpbGUgKGVpLnZhbHVlIDwgcGl2b3QpO1xuICAgICAgICAgICAgZG8geyBlaiA9IGVsZW1lbnRzWy0tal07IH0gd2hpbGUgKHBpdm90IDwgZWoudmFsdWUgJiYgaiAhPSBsZWZ0KTtcbiAgICAgICAgICAgIGlmIChpID49IGopIGJyZWFrO1xuICAgICAgICAgICAgZWxlbWVudHNbaV0gPSBlajtcbiAgICAgICAgICAgIGVsZW1lbnRzW2pdID0gZWk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgZWxlbWVudHNbcmlnaHRdID0gZWxlbWVudHNbaV07XG4gICAgICAgICAgZWxlbWVudHNbaV0gPSB0bXA7XG4gICAgICAgICAgaWYgKGkgLSBsZWZ0ID4gcmlnaHQgLSBpKSB7XG4gICAgICAgICAgICBzdGFja1tjb3VudCsrXSA9IGxlZnQ7XG4gICAgICAgICAgICBzdGFja1tjb3VudCsrXSA9IGkgLSAxO1xuICAgICAgICAgICAgc3RhY2tbY291bnQrK10gPSBpICsgMTtcbiAgICAgICAgICAgIHN0YWNrW2NvdW50KytdID0gcmlnaHQ7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0YWNrW2NvdW50KytdID0gaSArIDE7XG4gICAgICAgICAgICBzdGFja1tjb3VudCsrXSA9IHJpZ2h0O1xuICAgICAgICAgICAgc3RhY2tbY291bnQrK10gPSBsZWZ0O1xuICAgICAgICAgICAgc3RhY2tbY291bnQrK10gPSBpIC0gMTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZm9yIChpID0gbGVmdCArIDE7IGkgPD0gcmlnaHQ7IGkrKykge1xuICAgICAgICAgICAgdG1wID0gZWxlbWVudHNbaV07XG4gICAgICAgICAgICBwaXZvdCA9IHRtcC52YWx1ZTtcbiAgICAgICAgICAgIHRtcDIgPSBlbGVtZW50c1tpIC0gMV07XG4gICAgICAgICAgICBpZiAodG1wMi52YWx1ZSA+IHBpdm90KSB7XG4gICAgICAgICAgICAgIGogPSBpO1xuICAgICAgICAgICAgICBkbyB7XG4gICAgICAgICAgICAgICAgZWxlbWVudHNbal0gPSB0bXAyO1xuICAgICAgICAgICAgICAgIGlmICgtLWogPT0gMCkgYnJlYWs7XG4gICAgICAgICAgICAgICAgdG1wMiA9IGVsZW1lbnRzW2ogLSAxXTtcbiAgICAgICAgICAgICAgfSB3aGlsZSAodG1wMi52YWx1ZSA+IHBpdm90KTtcbiAgICAgICAgICAgICAgZWxlbWVudHNbal0gPSB0bXA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICB9LFxuXG4gICAgY2FsY3VsYXRlVGVzdENvdW50OiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHZhciBudW0gPSAxO1xuICAgICAgdmFyIHN1bSA9IDA7XG4gICAgICBmb3IgKHZhciBpID0gMSwgbCA9IHRoaXMubnVtRWxlbWVudHM7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgaWYgKHRoaXMuZWxlbWVudHNbaV0ubWF4KSB7XG4gICAgICAgICAgbnVtLS07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3VtICs9IG51bTtcbiAgICAgICAgICBudW0rKztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHN1bTtcblxuICAgIH1cblxuICB9KTtcblxuICAvKipcbiAgICogQW4gZWxlbWVudCBvZiBwcm94aWVzLlxuICAgKiBAYXV0aG9yIHNhaGFyYW5cbiAgICovXG5cbiAgZnVuY3Rpb24gU0FQRWxlbWVudChwcm94eSwgbWF4KSB7XG5cbiAgICAvLyBUaGUgcGFyZW50IHByb3h5XG4gICAgdGhpcy5wcm94eSA9IHByb3h5O1xuICAgIC8vIFRoZSBwYWlyIGVsZW1lbnQuXG4gICAgdGhpcy5wYWlyID0gbnVsbDtcbiAgICAvLyBUaGUgbWluaW11bSBlbGVtZW50IG9uIG90aGVyIGF4aXMuXG4gICAgdGhpcy5taW4xID0gbnVsbDtcbiAgICAvLyBUaGUgbWF4aW11bSBlbGVtZW50IG9uIG90aGVyIGF4aXMuXG4gICAgdGhpcy5tYXgxID0gbnVsbDtcbiAgICAvLyBUaGUgbWluaW11bSBlbGVtZW50IG9uIG90aGVyIGF4aXMuXG4gICAgdGhpcy5taW4yID0gbnVsbDtcbiAgICAvLyBUaGUgbWF4aW11bSBlbGVtZW50IG9uIG90aGVyIGF4aXMuXG4gICAgdGhpcy5tYXgyID0gbnVsbDtcbiAgICAvLyBXaGV0aGVyIHRoZSBlbGVtZW50IGhhcyBtYXhpbXVtIHZhbHVlIG9yIG5vdC5cbiAgICB0aGlzLm1heCA9IG1heDtcbiAgICAvLyBUaGUgdmFsdWUgb2YgdGhlIGVsZW1lbnQuXG4gICAgdGhpcy52YWx1ZSA9IDA7XG5cbiAgfVxuXG4gIC8qKlxuICAgKiBBIHByb3h5IGZvciBzd2VlcCBhbmQgcHJ1bmUgYnJvYWQtcGhhc2UuXG4gICAqIEBhdXRob3Igc2FoYXJhblxuICAgKiBAYXV0aG9yIGxvLXRoXG4gICAqL1xuXG4gIGZ1bmN0aW9uIFNBUFByb3h5KHNhcCwgc2hhcGUpIHtcblxuICAgIFByb3h5LmNhbGwodGhpcywgc2hhcGUpO1xuICAgIC8vIFR5cGUgb2YgdGhlIGF4aXMgdG8gd2hpY2ggdGhlIHByb3h5IGJlbG9uZ3MgdG8uIFswOm5vbmUsIDE6ZHluYW1pYywgMjpzdGF0aWNdXG4gICAgdGhpcy5iZWxvbmdzVG8gPSAwO1xuICAgIC8vIFRoZSBtYXhpbXVtIGVsZW1lbnRzIG9uIGVhY2ggYXhpcy5cbiAgICB0aGlzLm1heCA9IFtdO1xuICAgIC8vIFRoZSBtaW5pbXVtIGVsZW1lbnRzIG9uIGVhY2ggYXhpcy5cbiAgICB0aGlzLm1pbiA9IFtdO1xuXG4gICAgdGhpcy5zYXAgPSBzYXA7XG4gICAgdGhpcy5taW5bMF0gPSBuZXcgU0FQRWxlbWVudCh0aGlzLCBmYWxzZSk7XG4gICAgdGhpcy5tYXhbMF0gPSBuZXcgU0FQRWxlbWVudCh0aGlzLCB0cnVlKTtcbiAgICB0aGlzLm1pblsxXSA9IG5ldyBTQVBFbGVtZW50KHRoaXMsIGZhbHNlKTtcbiAgICB0aGlzLm1heFsxXSA9IG5ldyBTQVBFbGVtZW50KHRoaXMsIHRydWUpO1xuICAgIHRoaXMubWluWzJdID0gbmV3IFNBUEVsZW1lbnQodGhpcywgZmFsc2UpO1xuICAgIHRoaXMubWF4WzJdID0gbmV3IFNBUEVsZW1lbnQodGhpcywgdHJ1ZSk7XG4gICAgdGhpcy5tYXhbMF0ucGFpciA9IHRoaXMubWluWzBdO1xuICAgIHRoaXMubWF4WzFdLnBhaXIgPSB0aGlzLm1pblsxXTtcbiAgICB0aGlzLm1heFsyXS5wYWlyID0gdGhpcy5taW5bMl07XG4gICAgdGhpcy5taW5bMF0ubWluMSA9IHRoaXMubWluWzFdO1xuICAgIHRoaXMubWluWzBdLm1heDEgPSB0aGlzLm1heFsxXTtcbiAgICB0aGlzLm1pblswXS5taW4yID0gdGhpcy5taW5bMl07XG4gICAgdGhpcy5taW5bMF0ubWF4MiA9IHRoaXMubWF4WzJdO1xuICAgIHRoaXMubWluWzFdLm1pbjEgPSB0aGlzLm1pblswXTtcbiAgICB0aGlzLm1pblsxXS5tYXgxID0gdGhpcy5tYXhbMF07XG4gICAgdGhpcy5taW5bMV0ubWluMiA9IHRoaXMubWluWzJdO1xuICAgIHRoaXMubWluWzFdLm1heDIgPSB0aGlzLm1heFsyXTtcbiAgICB0aGlzLm1pblsyXS5taW4xID0gdGhpcy5taW5bMF07XG4gICAgdGhpcy5taW5bMl0ubWF4MSA9IHRoaXMubWF4WzBdO1xuICAgIHRoaXMubWluWzJdLm1pbjIgPSB0aGlzLm1pblsxXTtcbiAgICB0aGlzLm1pblsyXS5tYXgyID0gdGhpcy5tYXhbMV07XG5cbiAgfVxuICBTQVBQcm94eS5wcm90b3R5cGUgPSBPYmplY3QuYXNzaWduKE9iamVjdC5jcmVhdGUoUHJveHkucHJvdG90eXBlKSwge1xuXG4gICAgY29uc3RydWN0b3I6IFNBUFByb3h5LFxuXG5cbiAgICAvLyBSZXR1cm5zIHdoZXRoZXIgdGhlIHByb3h5IGlzIGR5bmFtaWMgb3Igbm90LlxuICAgIGlzRHluYW1pYzogZnVuY3Rpb24gKCkge1xuXG4gICAgICB2YXIgYm9keSA9IHRoaXMuc2hhcGUucGFyZW50O1xuICAgICAgcmV0dXJuIGJvZHkuaXNEeW5hbWljICYmICFib2R5LnNsZWVwaW5nO1xuXG4gICAgfSxcblxuICAgIHVwZGF0ZTogZnVuY3Rpb24gKCkge1xuXG4gICAgICB2YXIgdGUgPSB0aGlzLmFhYmIuZWxlbWVudHM7XG4gICAgICB0aGlzLm1pblswXS52YWx1ZSA9IHRlWzBdO1xuICAgICAgdGhpcy5taW5bMV0udmFsdWUgPSB0ZVsxXTtcbiAgICAgIHRoaXMubWluWzJdLnZhbHVlID0gdGVbMl07XG4gICAgICB0aGlzLm1heFswXS52YWx1ZSA9IHRlWzNdO1xuICAgICAgdGhpcy5tYXhbMV0udmFsdWUgPSB0ZVs0XTtcbiAgICAgIHRoaXMubWF4WzJdLnZhbHVlID0gdGVbNV07XG5cbiAgICAgIGlmICh0aGlzLmJlbG9uZ3NUbyA9PSAxICYmICF0aGlzLmlzRHluYW1pYygpIHx8IHRoaXMuYmVsb25nc1RvID09IDIgJiYgdGhpcy5pc0R5bmFtaWMoKSkge1xuICAgICAgICB0aGlzLnNhcC5yZW1vdmVQcm94eSh0aGlzKTtcbiAgICAgICAgdGhpcy5zYXAuYWRkUHJveHkodGhpcyk7XG4gICAgICB9XG5cbiAgICB9XG5cbiAgfSk7XG5cbiAgLyoqXG4gICAqIEEgYnJvYWQtcGhhc2UgY29sbGlzaW9uIGRldGVjdGlvbiBhbGdvcml0aG0gdXNpbmcgc3dlZXAgYW5kIHBydW5lLlxuICAgKiBAYXV0aG9yIHNhaGFyYW5cbiAgICogQGF1dGhvciBsby10aFxuICAgKi9cblxuICBmdW5jdGlvbiBTQVBCcm9hZFBoYXNlKCkge1xuXG4gICAgQnJvYWRQaGFzZS5jYWxsKHRoaXMpO1xuICAgIHRoaXMudHlwZXMgPSBCUl9TV0VFUF9BTkRfUFJVTkU7XG5cbiAgICB0aGlzLm51bUVsZW1lbnRzRCA9IDA7XG4gICAgdGhpcy5udW1FbGVtZW50c1MgPSAwO1xuICAgIC8vIGR5bmFtaWMgcHJveGllc1xuICAgIHRoaXMuYXhlc0QgPSBbXG4gICAgICBuZXcgU0FQQXhpcygpLFxuICAgICAgbmV3IFNBUEF4aXMoKSxcbiAgICAgIG5ldyBTQVBBeGlzKClcbiAgICBdO1xuICAgIC8vIHN0YXRpYyBvciBzbGVlcGluZyBwcm94aWVzXG4gICAgdGhpcy5heGVzUyA9IFtcbiAgICAgIG5ldyBTQVBBeGlzKCksXG4gICAgICBuZXcgU0FQQXhpcygpLFxuICAgICAgbmV3IFNBUEF4aXMoKVxuICAgIF07XG5cbiAgICB0aGlzLmluZGV4MSA9IDA7XG4gICAgdGhpcy5pbmRleDIgPSAxO1xuXG4gIH1cbiAgU0FQQnJvYWRQaGFzZS5wcm90b3R5cGUgPSBPYmplY3QuYXNzaWduKE9iamVjdC5jcmVhdGUoQnJvYWRQaGFzZS5wcm90b3R5cGUpLCB7XG5cbiAgICBjb25zdHJ1Y3RvcjogU0FQQnJvYWRQaGFzZSxcblxuICAgIGNyZWF0ZVByb3h5OiBmdW5jdGlvbiAoc2hhcGUpIHtcblxuICAgICAgcmV0dXJuIG5ldyBTQVBQcm94eSh0aGlzLCBzaGFwZSk7XG5cbiAgICB9LFxuXG4gICAgYWRkUHJveHk6IGZ1bmN0aW9uIChwcm94eSkge1xuXG4gICAgICB2YXIgcCA9IHByb3h5O1xuICAgICAgaWYgKHAuaXNEeW5hbWljKCkpIHtcbiAgICAgICAgdGhpcy5heGVzRFswXS5hZGRFbGVtZW50cyhwLm1pblswXSwgcC5tYXhbMF0pO1xuICAgICAgICB0aGlzLmF4ZXNEWzFdLmFkZEVsZW1lbnRzKHAubWluWzFdLCBwLm1heFsxXSk7XG4gICAgICAgIHRoaXMuYXhlc0RbMl0uYWRkRWxlbWVudHMocC5taW5bMl0sIHAubWF4WzJdKTtcbiAgICAgICAgcC5iZWxvbmdzVG8gPSAxO1xuICAgICAgICB0aGlzLm51bUVsZW1lbnRzRCArPSAyO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5heGVzU1swXS5hZGRFbGVtZW50cyhwLm1pblswXSwgcC5tYXhbMF0pO1xuICAgICAgICB0aGlzLmF4ZXNTWzFdLmFkZEVsZW1lbnRzKHAubWluWzFdLCBwLm1heFsxXSk7XG4gICAgICAgIHRoaXMuYXhlc1NbMl0uYWRkRWxlbWVudHMocC5taW5bMl0sIHAubWF4WzJdKTtcbiAgICAgICAgcC5iZWxvbmdzVG8gPSAyO1xuICAgICAgICB0aGlzLm51bUVsZW1lbnRzUyArPSAyO1xuICAgICAgfVxuXG4gICAgfSxcblxuICAgIHJlbW92ZVByb3h5OiBmdW5jdGlvbiAocHJveHkpIHtcblxuICAgICAgdmFyIHAgPSBwcm94eTtcbiAgICAgIGlmIChwLmJlbG9uZ3NUbyA9PSAwKSByZXR1cm47XG5cbiAgICAgIC8qZWxzZSBpZiAoIHAuYmVsb25nc1RvID09IDEgKSB7XG4gICAgICAgICAgdGhpcy5heGVzRFswXS5yZW1vdmVFbGVtZW50cyggcC5taW5bMF0sIHAubWF4WzBdICk7XG4gICAgICAgICAgdGhpcy5heGVzRFsxXS5yZW1vdmVFbGVtZW50cyggcC5taW5bMV0sIHAubWF4WzFdICk7XG4gICAgICAgICAgdGhpcy5heGVzRFsyXS5yZW1vdmVFbGVtZW50cyggcC5taW5bMl0sIHAubWF4WzJdICk7XG4gICAgICAgICAgdGhpcy5udW1FbGVtZW50c0QgLT0gMjtcbiAgICAgIH0gZWxzZSBpZiAoIHAuYmVsb25nc1RvID09IDIgKSB7XG4gICAgICAgICAgdGhpcy5heGVzU1swXS5yZW1vdmVFbGVtZW50cyggcC5taW5bMF0sIHAubWF4WzBdICk7XG4gICAgICAgICAgdGhpcy5heGVzU1sxXS5yZW1vdmVFbGVtZW50cyggcC5taW5bMV0sIHAubWF4WzFdICk7XG4gICAgICAgICAgdGhpcy5heGVzU1syXS5yZW1vdmVFbGVtZW50cyggcC5taW5bMl0sIHAubWF4WzJdICk7XG4gICAgICAgICAgdGhpcy5udW1FbGVtZW50c1MgLT0gMjtcbiAgICAgIH0qL1xuXG4gICAgICBzd2l0Y2ggKHAuYmVsb25nc1RvKSB7XG4gICAgICAgIGNhc2UgMTpcbiAgICAgICAgICB0aGlzLmF4ZXNEWzBdLnJlbW92ZUVsZW1lbnRzKHAubWluWzBdLCBwLm1heFswXSk7XG4gICAgICAgICAgdGhpcy5heGVzRFsxXS5yZW1vdmVFbGVtZW50cyhwLm1pblsxXSwgcC5tYXhbMV0pO1xuICAgICAgICAgIHRoaXMuYXhlc0RbMl0ucmVtb3ZlRWxlbWVudHMocC5taW5bMl0sIHAubWF4WzJdKTtcbiAgICAgICAgICB0aGlzLm51bUVsZW1lbnRzRCAtPSAyO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgdGhpcy5heGVzU1swXS5yZW1vdmVFbGVtZW50cyhwLm1pblswXSwgcC5tYXhbMF0pO1xuICAgICAgICAgIHRoaXMuYXhlc1NbMV0ucmVtb3ZlRWxlbWVudHMocC5taW5bMV0sIHAubWF4WzFdKTtcbiAgICAgICAgICB0aGlzLmF4ZXNTWzJdLnJlbW92ZUVsZW1lbnRzKHAubWluWzJdLCBwLm1heFsyXSk7XG4gICAgICAgICAgdGhpcy5udW1FbGVtZW50c1MgLT0gMjtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgcC5iZWxvbmdzVG8gPSAwO1xuXG4gICAgfSxcblxuICAgIGNvbGxlY3RQYWlyczogZnVuY3Rpb24gKCkge1xuXG4gICAgICBpZiAodGhpcy5udW1FbGVtZW50c0QgPT0gMCkgcmV0dXJuO1xuXG4gICAgICB2YXIgYXhpczEgPSB0aGlzLmF4ZXNEW3RoaXMuaW5kZXgxXTtcbiAgICAgIHZhciBheGlzMiA9IHRoaXMuYXhlc0RbdGhpcy5pbmRleDJdO1xuXG4gICAgICBheGlzMS5zb3J0KCk7XG4gICAgICBheGlzMi5zb3J0KCk7XG5cbiAgICAgIHZhciBjb3VudDEgPSBheGlzMS5jYWxjdWxhdGVUZXN0Q291bnQoKTtcbiAgICAgIHZhciBjb3VudDIgPSBheGlzMi5jYWxjdWxhdGVUZXN0Q291bnQoKTtcbiAgICAgIHZhciBlbGVtZW50c0Q7XG4gICAgICB2YXIgZWxlbWVudHNTO1xuICAgICAgaWYgKGNvdW50MSA8PSBjb3VudDIpIHsvLyBzZWxlY3QgdGhlIGJlc3QgYXhpc1xuICAgICAgICBheGlzMiA9IHRoaXMuYXhlc1NbdGhpcy5pbmRleDFdO1xuICAgICAgICBheGlzMi5zb3J0KCk7XG4gICAgICAgIGVsZW1lbnRzRCA9IGF4aXMxLmVsZW1lbnRzO1xuICAgICAgICBlbGVtZW50c1MgPSBheGlzMi5lbGVtZW50cztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGF4aXMxID0gdGhpcy5heGVzU1t0aGlzLmluZGV4Ml07XG4gICAgICAgIGF4aXMxLnNvcnQoKTtcbiAgICAgICAgZWxlbWVudHNEID0gYXhpczIuZWxlbWVudHM7XG4gICAgICAgIGVsZW1lbnRzUyA9IGF4aXMxLmVsZW1lbnRzO1xuICAgICAgICB0aGlzLmluZGV4MSBePSB0aGlzLmluZGV4MjtcbiAgICAgICAgdGhpcy5pbmRleDIgXj0gdGhpcy5pbmRleDE7XG4gICAgICAgIHRoaXMuaW5kZXgxIF49IHRoaXMuaW5kZXgyO1xuICAgICAgfVxuICAgICAgdmFyIGFjdGl2ZUQ7XG4gICAgICB2YXIgYWN0aXZlUztcbiAgICAgIHZhciBwID0gMDtcbiAgICAgIHZhciBxID0gMDtcbiAgICAgIHdoaWxlIChwIDwgdGhpcy5udW1FbGVtZW50c0QpIHtcbiAgICAgICAgdmFyIGUxO1xuICAgICAgICB2YXIgZHluO1xuICAgICAgICBpZiAocSA9PSB0aGlzLm51bUVsZW1lbnRzUykge1xuICAgICAgICAgIGUxID0gZWxlbWVudHNEW3BdO1xuICAgICAgICAgIGR5biA9IHRydWU7XG4gICAgICAgICAgcCsrO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhciBkID0gZWxlbWVudHNEW3BdO1xuICAgICAgICAgIHZhciBzID0gZWxlbWVudHNTW3FdO1xuICAgICAgICAgIGlmIChkLnZhbHVlIDwgcy52YWx1ZSkge1xuICAgICAgICAgICAgZTEgPSBkO1xuICAgICAgICAgICAgZHluID0gdHJ1ZTtcbiAgICAgICAgICAgIHArKztcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZTEgPSBzO1xuICAgICAgICAgICAgZHluID0gZmFsc2U7XG4gICAgICAgICAgICBxKys7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICghZTEubWF4KSB7XG4gICAgICAgICAgdmFyIHMxID0gZTEucHJveHkuc2hhcGU7XG4gICAgICAgICAgdmFyIG1pbjEgPSBlMS5taW4xLnZhbHVlO1xuICAgICAgICAgIHZhciBtYXgxID0gZTEubWF4MS52YWx1ZTtcbiAgICAgICAgICB2YXIgbWluMiA9IGUxLm1pbjIudmFsdWU7XG4gICAgICAgICAgdmFyIG1heDIgPSBlMS5tYXgyLnZhbHVlO1xuXG4gICAgICAgICAgZm9yICh2YXIgZTIgPSBhY3RpdmVEOyBlMiAhPSBudWxsOyBlMiA9IGUyLnBhaXIpIHsvLyB0ZXN0IGZvciBkeW5hbWljXG4gICAgICAgICAgICB2YXIgczIgPSBlMi5wcm94eS5zaGFwZTtcblxuICAgICAgICAgICAgdGhpcy5udW1QYWlyQ2hlY2tzKys7XG4gICAgICAgICAgICBpZiAobWluMSA+IGUyLm1heDEudmFsdWUgfHwgbWF4MSA8IGUyLm1pbjEudmFsdWUgfHwgbWluMiA+IGUyLm1heDIudmFsdWUgfHwgbWF4MiA8IGUyLm1pbjIudmFsdWUgfHwgIXRoaXMuaXNBdmFpbGFibGVQYWlyKHMxLCBzMikpIGNvbnRpbnVlO1xuICAgICAgICAgICAgdGhpcy5hZGRQYWlyKHMxLCBzMik7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChkeW4pIHtcbiAgICAgICAgICAgIGZvciAoZTIgPSBhY3RpdmVTOyBlMiAhPSBudWxsOyBlMiA9IGUyLnBhaXIpIHsvLyB0ZXN0IGZvciBzdGF0aWNcbiAgICAgICAgICAgICAgczIgPSBlMi5wcm94eS5zaGFwZTtcblxuICAgICAgICAgICAgICB0aGlzLm51bVBhaXJDaGVja3MrKztcblxuICAgICAgICAgICAgICBpZiAobWluMSA+IGUyLm1heDEudmFsdWUgfHwgbWF4MSA8IGUyLm1pbjEudmFsdWUgfHwgbWluMiA+IGUyLm1heDIudmFsdWUgfHwgbWF4MiA8IGUyLm1pbjIudmFsdWUgfHwgIXRoaXMuaXNBdmFpbGFibGVQYWlyKHMxLCBzMikpIGNvbnRpbnVlO1xuICAgICAgICAgICAgICB0aGlzLmFkZFBhaXIoczEsIHMyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGUxLnBhaXIgPSBhY3RpdmVEO1xuICAgICAgICAgICAgYWN0aXZlRCA9IGUxO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBlMS5wYWlyID0gYWN0aXZlUztcbiAgICAgICAgICAgIGFjdGl2ZVMgPSBlMTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFyIG1pbiA9IGUxLnBhaXI7XG4gICAgICAgICAgaWYgKGR5bikge1xuICAgICAgICAgICAgaWYgKG1pbiA9PSBhY3RpdmVEKSB7XG4gICAgICAgICAgICAgIGFjdGl2ZUQgPSBhY3RpdmVELnBhaXI7XG4gICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgZTEgPSBhY3RpdmVEO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAobWluID09IGFjdGl2ZVMpIHtcbiAgICAgICAgICAgICAgYWN0aXZlUyA9IGFjdGl2ZVMucGFpcjtcbiAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBlMSA9IGFjdGl2ZVM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHdoaWxlIChlMSkge1xuICAgICAgICAgICAgZTIgPSBlMS5wYWlyO1xuICAgICAgICAgICAgaWYgKGUyID09IG1pbikge1xuICAgICAgICAgICAgICBlMS5wYWlyID0gZTIucGFpcjtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlMSA9IGUyO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGhpcy5pbmRleDIgPSAodGhpcy5pbmRleDEgfCB0aGlzLmluZGV4MikgXiAzO1xuXG4gICAgfVxuXG4gIH0pO1xuXG4gIC8qKlxuICAqIEEgbm9kZSBvZiB0aGUgZHluYW1pYyBib3VuZGluZyB2b2x1bWUgdHJlZS5cbiAgKiBAYXV0aG9yIHNhaGFyYW5cbiAgKi9cblxuICBmdW5jdGlvbiBEQlZUTm9kZSgpIHtcblxuICAgIC8vIFRoZSBmaXJzdCBjaGlsZCBub2RlIG9mIHRoaXMgbm9kZS5cbiAgICB0aGlzLmNoaWxkMSA9IG51bGw7XG4gICAgLy8gVGhlIHNlY29uZCBjaGlsZCBub2RlIG9mIHRoaXMgbm9kZS5cbiAgICB0aGlzLmNoaWxkMiA9IG51bGw7XG4gICAgLy8gIFRoZSBwYXJlbnQgbm9kZSBvZiB0aGlzIHRyZWUuXG4gICAgdGhpcy5wYXJlbnQgPSBudWxsO1xuICAgIC8vIFRoZSBwcm94eSBvZiB0aGlzIG5vZGUuIFRoaXMgaGFzIG5vIHZhbHVlIGlmIHRoaXMgbm9kZSBpcyBub3QgbGVhZi5cbiAgICB0aGlzLnByb3h5ID0gbnVsbDtcbiAgICAvLyBUaGUgbWF4aW11bSBkaXN0YW5jZSBmcm9tIGxlYWYgbm9kZXMuXG4gICAgdGhpcy5oZWlnaHQgPSAwO1xuICAgIC8vIFRoZSBBQUJCIG9mIHRoaXMgbm9kZS5cbiAgICB0aGlzLmFhYmIgPSBuZXcgQUFCQigpO1xuXG4gIH1cblxuICAvKipcbiAgICogQSBkeW5hbWljIGJvdW5kaW5nIHZvbHVtZSB0cmVlIGZvciB0aGUgYnJvYWQtcGhhc2UgYWxnb3JpdGhtLlxuICAgKlxuICAgKiBAYXV0aG9yIHNhaGFyYW5cbiAgICogQGF1dGhvciBsby10aFxuICAgKi9cblxuICBmdW5jdGlvbiBEQlZUKCkge1xuXG4gICAgLy8gVGhlIHJvb3Qgb2YgdGhlIHRyZWUuXG4gICAgdGhpcy5yb290ID0gbnVsbDtcbiAgICB0aGlzLmZyZWVOb2RlcyA9IFtdO1xuICAgIHRoaXMuZnJlZU5vZGVzLmxlbmd0aCA9IDE2Mzg0O1xuICAgIHRoaXMubnVtRnJlZU5vZGVzID0gMDtcbiAgICB0aGlzLmFhYmIgPSBuZXcgQUFCQigpO1xuXG4gIH1cbiAgT2JqZWN0LmFzc2lnbihEQlZULnByb3RvdHlwZSwge1xuXG4gICAgREJWVDogdHJ1ZSxcblxuICAgIG1vdmVMZWFmOiBmdW5jdGlvbiAobGVhZikge1xuXG4gICAgICB0aGlzLmRlbGV0ZUxlYWYobGVhZik7XG4gICAgICB0aGlzLmluc2VydExlYWYobGVhZik7XG5cbiAgICB9LFxuXG4gICAgaW5zZXJ0TGVhZjogZnVuY3Rpb24gKGxlYWYpIHtcblxuICAgICAgaWYgKHRoaXMucm9vdCA9PSBudWxsKSB7XG4gICAgICAgIHRoaXMucm9vdCA9IGxlYWY7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHZhciBsYiA9IGxlYWYuYWFiYjtcbiAgICAgIHZhciBzaWJsaW5nID0gdGhpcy5yb290O1xuICAgICAgdmFyIG9sZEFyZWE7XG4gICAgICB2YXIgbmV3QXJlYTtcbiAgICAgIHdoaWxlIChzaWJsaW5nLnByb3h5ID09IG51bGwpIHsgLy8gZGVzY2VuZCB0aGUgbm9kZSB0byBzZWFyY2ggdGhlIGJlc3QgcGFpclxuICAgICAgICB2YXIgYzEgPSBzaWJsaW5nLmNoaWxkMTtcbiAgICAgICAgdmFyIGMyID0gc2libGluZy5jaGlsZDI7XG4gICAgICAgIHZhciBiID0gc2libGluZy5hYWJiO1xuICAgICAgICB2YXIgYzFiID0gYzEuYWFiYjtcbiAgICAgICAgdmFyIGMyYiA9IGMyLmFhYmI7XG4gICAgICAgIG9sZEFyZWEgPSBiLnN1cmZhY2VBcmVhKCk7XG4gICAgICAgIHRoaXMuYWFiYi5jb21iaW5lKGxiLCBiKTtcbiAgICAgICAgbmV3QXJlYSA9IHRoaXMuYWFiYi5zdXJmYWNlQXJlYSgpO1xuICAgICAgICB2YXIgY3JlYXRpbmdDb3N0ID0gbmV3QXJlYSAqIDI7XG4gICAgICAgIHZhciBpbmNyZW1lbnRhbENvc3QgPSAobmV3QXJlYSAtIG9sZEFyZWEpICogMjsgLy8gY29zdCBvZiBjcmVhdGluZyBhIG5ldyBwYWlyIHdpdGggdGhlIG5vZGVcbiAgICAgICAgdmFyIGRpc2NlbmRpbmdDb3N0MSA9IGluY3JlbWVudGFsQ29zdDtcbiAgICAgICAgdGhpcy5hYWJiLmNvbWJpbmUobGIsIGMxYik7XG4gICAgICAgIGlmIChjMS5wcm94eSAhPSBudWxsKSB7XG4gICAgICAgICAgLy8gbGVhZiBjb3N0ID0gYXJlYShjb21iaW5lZCBhYWJiKVxuICAgICAgICAgIGRpc2NlbmRpbmdDb3N0MSArPSB0aGlzLmFhYmIuc3VyZmFjZUFyZWEoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBub2RlIGNvc3QgPSBhcmVhKGNvbWJpbmVkIGFhYmIpIC0gYXJlYShvbGQgYWFiYilcbiAgICAgICAgICBkaXNjZW5kaW5nQ29zdDEgKz0gdGhpcy5hYWJiLnN1cmZhY2VBcmVhKCkgLSBjMWIuc3VyZmFjZUFyZWEoKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgZGlzY2VuZGluZ0Nvc3QyID0gaW5jcmVtZW50YWxDb3N0O1xuICAgICAgICB0aGlzLmFhYmIuY29tYmluZShsYiwgYzJiKTtcbiAgICAgICAgaWYgKGMyLnByb3h5ICE9IG51bGwpIHtcbiAgICAgICAgICAvLyBsZWFmIGNvc3QgPSBhcmVhKGNvbWJpbmVkIGFhYmIpXG4gICAgICAgICAgZGlzY2VuZGluZ0Nvc3QyICs9IHRoaXMuYWFiYi5zdXJmYWNlQXJlYSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIG5vZGUgY29zdCA9IGFyZWEoY29tYmluZWQgYWFiYikgLSBhcmVhKG9sZCBhYWJiKVxuICAgICAgICAgIGRpc2NlbmRpbmdDb3N0MiArPSB0aGlzLmFhYmIuc3VyZmFjZUFyZWEoKSAtIGMyYi5zdXJmYWNlQXJlYSgpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChkaXNjZW5kaW5nQ29zdDEgPCBkaXNjZW5kaW5nQ29zdDIpIHtcbiAgICAgICAgICBpZiAoY3JlYXRpbmdDb3N0IDwgZGlzY2VuZGluZ0Nvc3QxKSB7XG4gICAgICAgICAgICBicmVhazsvLyBzdG9wIGRlc2NlbmRpbmdcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2libGluZyA9IGMxOy8vIGRlc2NlbmQgaW50byBmaXJzdCBjaGlsZFxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoY3JlYXRpbmdDb3N0IDwgZGlzY2VuZGluZ0Nvc3QyKSB7XG4gICAgICAgICAgICBicmVhazsvLyBzdG9wIGRlc2NlbmRpbmdcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2libGluZyA9IGMyOy8vIGRlc2NlbmQgaW50byBzZWNvbmQgY2hpbGRcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHZhciBvbGRQYXJlbnQgPSBzaWJsaW5nLnBhcmVudDtcbiAgICAgIHZhciBuZXdQYXJlbnQ7XG4gICAgICBpZiAodGhpcy5udW1GcmVlTm9kZXMgPiAwKSB7XG4gICAgICAgIG5ld1BhcmVudCA9IHRoaXMuZnJlZU5vZGVzWy0tdGhpcy5udW1GcmVlTm9kZXNdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbmV3UGFyZW50ID0gbmV3IERCVlROb2RlKCk7XG4gICAgICB9XG5cbiAgICAgIG5ld1BhcmVudC5wYXJlbnQgPSBvbGRQYXJlbnQ7XG4gICAgICBuZXdQYXJlbnQuY2hpbGQxID0gbGVhZjtcbiAgICAgIG5ld1BhcmVudC5jaGlsZDIgPSBzaWJsaW5nO1xuICAgICAgbmV3UGFyZW50LmFhYmIuY29tYmluZShsZWFmLmFhYmIsIHNpYmxpbmcuYWFiYik7XG4gICAgICBuZXdQYXJlbnQuaGVpZ2h0ID0gc2libGluZy5oZWlnaHQgKyAxO1xuICAgICAgc2libGluZy5wYXJlbnQgPSBuZXdQYXJlbnQ7XG4gICAgICBsZWFmLnBhcmVudCA9IG5ld1BhcmVudDtcbiAgICAgIGlmIChzaWJsaW5nID09IHRoaXMucm9vdCkge1xuICAgICAgICAvLyByZXBsYWNlIHJvb3RcbiAgICAgICAgdGhpcy5yb290ID0gbmV3UGFyZW50O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gcmVwbGFjZSBjaGlsZFxuICAgICAgICBpZiAob2xkUGFyZW50LmNoaWxkMSA9PSBzaWJsaW5nKSB7XG4gICAgICAgICAgb2xkUGFyZW50LmNoaWxkMSA9IG5ld1BhcmVudDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBvbGRQYXJlbnQuY2hpbGQyID0gbmV3UGFyZW50O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyB1cGRhdGUgd2hvbGUgdHJlZVxuICAgICAgZG8ge1xuICAgICAgICBuZXdQYXJlbnQgPSB0aGlzLmJhbGFuY2UobmV3UGFyZW50KTtcbiAgICAgICAgdGhpcy5maXgobmV3UGFyZW50KTtcbiAgICAgICAgbmV3UGFyZW50ID0gbmV3UGFyZW50LnBhcmVudDtcbiAgICAgIH0gd2hpbGUgKG5ld1BhcmVudCAhPSBudWxsKTtcbiAgICB9LFxuXG4gICAgZ2V0QmFsYW5jZTogZnVuY3Rpb24gKG5vZGUpIHtcblxuICAgICAgaWYgKG5vZGUucHJveHkgIT0gbnVsbCkgcmV0dXJuIDA7XG4gICAgICByZXR1cm4gbm9kZS5jaGlsZDEuaGVpZ2h0IC0gbm9kZS5jaGlsZDIuaGVpZ2h0O1xuXG4gICAgfSxcblxuICAgIGRlbGV0ZUxlYWY6IGZ1bmN0aW9uIChsZWFmKSB7XG5cbiAgICAgIGlmIChsZWFmID09IHRoaXMucm9vdCkge1xuICAgICAgICB0aGlzLnJvb3QgPSBudWxsO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB2YXIgcGFyZW50ID0gbGVhZi5wYXJlbnQ7XG4gICAgICB2YXIgc2libGluZztcbiAgICAgIGlmIChwYXJlbnQuY2hpbGQxID09IGxlYWYpIHtcbiAgICAgICAgc2libGluZyA9IHBhcmVudC5jaGlsZDI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzaWJsaW5nID0gcGFyZW50LmNoaWxkMTtcbiAgICAgIH1cbiAgICAgIGlmIChwYXJlbnQgPT0gdGhpcy5yb290KSB7XG4gICAgICAgIHRoaXMucm9vdCA9IHNpYmxpbmc7XG4gICAgICAgIHNpYmxpbmcucGFyZW50ID0gbnVsbDtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdmFyIGdyYW5kUGFyZW50ID0gcGFyZW50LnBhcmVudDtcbiAgICAgIHNpYmxpbmcucGFyZW50ID0gZ3JhbmRQYXJlbnQ7XG4gICAgICBpZiAoZ3JhbmRQYXJlbnQuY2hpbGQxID09IHBhcmVudCkge1xuICAgICAgICBncmFuZFBhcmVudC5jaGlsZDEgPSBzaWJsaW5nO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZ3JhbmRQYXJlbnQuY2hpbGQyID0gc2libGluZztcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLm51bUZyZWVOb2RlcyA8IDE2Mzg0KSB7XG4gICAgICAgIHRoaXMuZnJlZU5vZGVzW3RoaXMubnVtRnJlZU5vZGVzKytdID0gcGFyZW50O1xuICAgICAgfVxuICAgICAgZG8ge1xuICAgICAgICBncmFuZFBhcmVudCA9IHRoaXMuYmFsYW5jZShncmFuZFBhcmVudCk7XG4gICAgICAgIHRoaXMuZml4KGdyYW5kUGFyZW50KTtcbiAgICAgICAgZ3JhbmRQYXJlbnQgPSBncmFuZFBhcmVudC5wYXJlbnQ7XG4gICAgICB9IHdoaWxlIChncmFuZFBhcmVudCAhPSBudWxsKTtcblxuICAgIH0sXG5cbiAgICBiYWxhbmNlOiBmdW5jdGlvbiAobm9kZSkge1xuXG4gICAgICB2YXIgbmggPSBub2RlLmhlaWdodDtcbiAgICAgIGlmIChuaCA8IDIpIHtcbiAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgICB9XG4gICAgICB2YXIgcCA9IG5vZGUucGFyZW50O1xuICAgICAgdmFyIGwgPSBub2RlLmNoaWxkMTtcbiAgICAgIHZhciByID0gbm9kZS5jaGlsZDI7XG4gICAgICB2YXIgbGggPSBsLmhlaWdodDtcbiAgICAgIHZhciByaCA9IHIuaGVpZ2h0O1xuICAgICAgdmFyIGJhbGFuY2UgPSBsaCAtIHJoO1xuICAgICAgdmFyIHQ7Ly8gZm9yIGJpdCBvcGVyYXRpb25cblxuICAgICAgLy8gICAgICAgICAgWyBOIF1cbiAgICAgIC8vICAgICAgICAgLyAgICAgXFxcbiAgICAgIC8vICAgIFsgTCBdICAgICAgIFsgUiBdXG4gICAgICAvLyAgICAgLyBcXCAgICAgICAgIC8gXFxcbiAgICAgIC8vIFtMLUxdIFtMLVJdIFtSLUxdIFtSLVJdXG5cbiAgICAgIC8vIElzIHRoZSB0cmVlIGJhbGFuY2VkP1xuICAgICAgaWYgKGJhbGFuY2UgPiAxKSB7XG4gICAgICAgIHZhciBsbCA9IGwuY2hpbGQxO1xuICAgICAgICB2YXIgbHIgPSBsLmNoaWxkMjtcbiAgICAgICAgdmFyIGxsaCA9IGxsLmhlaWdodDtcbiAgICAgICAgdmFyIGxyaCA9IGxyLmhlaWdodDtcblxuICAgICAgICAvLyBJcyBMLUwgaGlnaGVyIHRoYW4gTC1SP1xuICAgICAgICBpZiAobGxoID4gbHJoKSB7XG4gICAgICAgICAgLy8gc2V0IE4gdG8gTC1SXG4gICAgICAgICAgbC5jaGlsZDIgPSBub2RlO1xuICAgICAgICAgIG5vZGUucGFyZW50ID0gbDtcblxuICAgICAgICAgIC8vICAgICAgICAgIFsgTCBdXG4gICAgICAgICAgLy8gICAgICAgICAvICAgICBcXFxuICAgICAgICAgIC8vICAgIFtMLUxdICAgICAgIFsgTiBdXG4gICAgICAgICAgLy8gICAgIC8gXFwgICAgICAgICAvIFxcXG4gICAgICAgICAgLy8gWy4uLl0gWy4uLl0gWyBMIF0gWyBSIF1cblxuICAgICAgICAgIC8vIHNldCBMLVJcbiAgICAgICAgICBub2RlLmNoaWxkMSA9IGxyO1xuICAgICAgICAgIGxyLnBhcmVudCA9IG5vZGU7XG5cbiAgICAgICAgICAvLyAgICAgICAgICBbIEwgXVxuICAgICAgICAgIC8vICAgICAgICAgLyAgICAgXFxcbiAgICAgICAgICAvLyAgICBbTC1MXSAgICAgICBbIE4gXVxuICAgICAgICAgIC8vICAgICAvIFxcICAgICAgICAgLyBcXFxuICAgICAgICAgIC8vIFsuLi5dIFsuLi5dIFtMLVJdIFsgUiBdXG5cbiAgICAgICAgICAvLyBmaXggYm91bmRzIGFuZCBoZWlnaHRzXG4gICAgICAgICAgbm9kZS5hYWJiLmNvbWJpbmUobHIuYWFiYiwgci5hYWJiKTtcbiAgICAgICAgICB0ID0gbHJoIC0gcmg7XG4gICAgICAgICAgbm9kZS5oZWlnaHQgPSBscmggLSAodCAmIHQgPj4gMzEpICsgMTtcbiAgICAgICAgICBsLmFhYmIuY29tYmluZShsbC5hYWJiLCBub2RlLmFhYmIpO1xuICAgICAgICAgIHQgPSBsbGggLSBuaDtcbiAgICAgICAgICBsLmhlaWdodCA9IGxsaCAtICh0ICYgdCA+PiAzMSkgKyAxO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIHNldCBOIHRvIEwtTFxuICAgICAgICAgIGwuY2hpbGQxID0gbm9kZTtcbiAgICAgICAgICBub2RlLnBhcmVudCA9IGw7XG5cbiAgICAgICAgICAvLyAgICAgICAgICBbIEwgXVxuICAgICAgICAgIC8vICAgICAgICAgLyAgICAgXFxcbiAgICAgICAgICAvLyAgICBbIE4gXSAgICAgICBbTC1SXVxuICAgICAgICAgIC8vICAgICAvIFxcICAgICAgICAgLyBcXFxuICAgICAgICAgIC8vIFsgTCBdIFsgUiBdIFsuLi5dIFsuLi5dXG5cbiAgICAgICAgICAvLyBzZXQgTC1MXG4gICAgICAgICAgbm9kZS5jaGlsZDEgPSBsbDtcbiAgICAgICAgICBsbC5wYXJlbnQgPSBub2RlO1xuXG4gICAgICAgICAgLy8gICAgICAgICAgWyBMIF1cbiAgICAgICAgICAvLyAgICAgICAgIC8gICAgIFxcXG4gICAgICAgICAgLy8gICAgWyBOIF0gICAgICAgW0wtUl1cbiAgICAgICAgICAvLyAgICAgLyBcXCAgICAgICAgIC8gXFxcbiAgICAgICAgICAvLyBbTC1MXSBbIFIgXSBbLi4uXSBbLi4uXVxuXG4gICAgICAgICAgLy8gZml4IGJvdW5kcyBhbmQgaGVpZ2h0c1xuICAgICAgICAgIG5vZGUuYWFiYi5jb21iaW5lKGxsLmFhYmIsIHIuYWFiYik7XG4gICAgICAgICAgdCA9IGxsaCAtIHJoO1xuICAgICAgICAgIG5vZGUuaGVpZ2h0ID0gbGxoIC0gKHQgJiB0ID4+IDMxKSArIDE7XG5cbiAgICAgICAgICBsLmFhYmIuY29tYmluZShub2RlLmFhYmIsIGxyLmFhYmIpO1xuICAgICAgICAgIHQgPSBuaCAtIGxyaDtcbiAgICAgICAgICBsLmhlaWdodCA9IG5oIC0gKHQgJiB0ID4+IDMxKSArIDE7XG4gICAgICAgIH1cbiAgICAgICAgLy8gc2V0IG5ldyBwYXJlbnQgb2YgTFxuICAgICAgICBpZiAocCAhPSBudWxsKSB7XG4gICAgICAgICAgaWYgKHAuY2hpbGQxID09IG5vZGUpIHtcbiAgICAgICAgICAgIHAuY2hpbGQxID0gbDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcC5jaGlsZDIgPSBsO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnJvb3QgPSBsO1xuICAgICAgICB9XG4gICAgICAgIGwucGFyZW50ID0gcDtcbiAgICAgICAgcmV0dXJuIGw7XG4gICAgICB9IGVsc2UgaWYgKGJhbGFuY2UgPCAtMSkge1xuICAgICAgICB2YXIgcmwgPSByLmNoaWxkMTtcbiAgICAgICAgdmFyIHJyID0gci5jaGlsZDI7XG4gICAgICAgIHZhciBybGggPSBybC5oZWlnaHQ7XG4gICAgICAgIHZhciBycmggPSByci5oZWlnaHQ7XG5cbiAgICAgICAgLy8gSXMgUi1MIGhpZ2hlciB0aGFuIFItUj9cbiAgICAgICAgaWYgKHJsaCA+IHJyaCkge1xuICAgICAgICAgIC8vIHNldCBOIHRvIFItUlxuICAgICAgICAgIHIuY2hpbGQyID0gbm9kZTtcbiAgICAgICAgICBub2RlLnBhcmVudCA9IHI7XG5cbiAgICAgICAgICAvLyAgICAgICAgICBbIFIgXVxuICAgICAgICAgIC8vICAgICAgICAgLyAgICAgXFxcbiAgICAgICAgICAvLyAgICBbUi1MXSAgICAgICBbIE4gXVxuICAgICAgICAgIC8vICAgICAvIFxcICAgICAgICAgLyBcXFxuICAgICAgICAgIC8vIFsuLi5dIFsuLi5dIFsgTCBdIFsgUiBdXG5cbiAgICAgICAgICAvLyBzZXQgUi1SXG4gICAgICAgICAgbm9kZS5jaGlsZDIgPSBycjtcbiAgICAgICAgICByci5wYXJlbnQgPSBub2RlO1xuXG4gICAgICAgICAgLy8gICAgICAgICAgWyBSIF1cbiAgICAgICAgICAvLyAgICAgICAgIC8gICAgIFxcXG4gICAgICAgICAgLy8gICAgW1ItTF0gICAgICAgWyBOIF1cbiAgICAgICAgICAvLyAgICAgLyBcXCAgICAgICAgIC8gXFxcbiAgICAgICAgICAvLyBbLi4uXSBbLi4uXSBbIEwgXSBbUi1SXVxuXG4gICAgICAgICAgLy8gZml4IGJvdW5kcyBhbmQgaGVpZ2h0c1xuICAgICAgICAgIG5vZGUuYWFiYi5jb21iaW5lKGwuYWFiYiwgcnIuYWFiYik7XG4gICAgICAgICAgdCA9IGxoIC0gcnJoO1xuICAgICAgICAgIG5vZGUuaGVpZ2h0ID0gbGggLSAodCAmIHQgPj4gMzEpICsgMTtcbiAgICAgICAgICByLmFhYmIuY29tYmluZShybC5hYWJiLCBub2RlLmFhYmIpO1xuICAgICAgICAgIHQgPSBybGggLSBuaDtcbiAgICAgICAgICByLmhlaWdodCA9IHJsaCAtICh0ICYgdCA+PiAzMSkgKyAxO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIHNldCBOIHRvIFItTFxuICAgICAgICAgIHIuY2hpbGQxID0gbm9kZTtcbiAgICAgICAgICBub2RlLnBhcmVudCA9IHI7XG4gICAgICAgICAgLy8gICAgICAgICAgWyBSIF1cbiAgICAgICAgICAvLyAgICAgICAgIC8gICAgIFxcXG4gICAgICAgICAgLy8gICAgWyBOIF0gICAgICAgW1ItUl1cbiAgICAgICAgICAvLyAgICAgLyBcXCAgICAgICAgIC8gXFxcbiAgICAgICAgICAvLyBbIEwgXSBbIFIgXSBbLi4uXSBbLi4uXVxuXG4gICAgICAgICAgLy8gc2V0IFItTFxuICAgICAgICAgIG5vZGUuY2hpbGQyID0gcmw7XG4gICAgICAgICAgcmwucGFyZW50ID0gbm9kZTtcblxuICAgICAgICAgIC8vICAgICAgICAgIFsgUiBdXG4gICAgICAgICAgLy8gICAgICAgICAvICAgICBcXFxuICAgICAgICAgIC8vICAgIFsgTiBdICAgICAgIFtSLVJdXG4gICAgICAgICAgLy8gICAgIC8gXFwgICAgICAgICAvIFxcXG4gICAgICAgICAgLy8gWyBMIF0gW1ItTF0gWy4uLl0gWy4uLl1cblxuICAgICAgICAgIC8vIGZpeCBib3VuZHMgYW5kIGhlaWdodHNcbiAgICAgICAgICBub2RlLmFhYmIuY29tYmluZShsLmFhYmIsIHJsLmFhYmIpO1xuICAgICAgICAgIHQgPSBsaCAtIHJsaDtcbiAgICAgICAgICBub2RlLmhlaWdodCA9IGxoIC0gKHQgJiB0ID4+IDMxKSArIDE7XG4gICAgICAgICAgci5hYWJiLmNvbWJpbmUobm9kZS5hYWJiLCByci5hYWJiKTtcbiAgICAgICAgICB0ID0gbmggLSBycmg7XG4gICAgICAgICAgci5oZWlnaHQgPSBuaCAtICh0ICYgdCA+PiAzMSkgKyAxO1xuICAgICAgICB9XG4gICAgICAgIC8vIHNldCBuZXcgcGFyZW50IG9mIFJcbiAgICAgICAgaWYgKHAgIT0gbnVsbCkge1xuICAgICAgICAgIGlmIChwLmNoaWxkMSA9PSBub2RlKSB7XG4gICAgICAgICAgICBwLmNoaWxkMSA9IHI7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHAuY2hpbGQyID0gcjtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5yb290ID0gcjtcbiAgICAgICAgfVxuICAgICAgICByLnBhcmVudCA9IHA7XG4gICAgICAgIHJldHVybiByO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5vZGU7XG4gICAgfSxcblxuICAgIGZpeDogZnVuY3Rpb24gKG5vZGUpIHtcblxuICAgICAgdmFyIGMxID0gbm9kZS5jaGlsZDE7XG4gICAgICB2YXIgYzIgPSBub2RlLmNoaWxkMjtcbiAgICAgIG5vZGUuYWFiYi5jb21iaW5lKGMxLmFhYmIsIGMyLmFhYmIpO1xuICAgICAgbm9kZS5oZWlnaHQgPSBjMS5oZWlnaHQgPCBjMi5oZWlnaHQgPyBjMi5oZWlnaHQgKyAxIDogYzEuaGVpZ2h0ICsgMTtcblxuICAgIH1cblxuICB9KTtcblxuICAvKipcbiAgKiBBIHByb3h5IGZvciBkeW5hbWljIGJvdW5kaW5nIHZvbHVtZSB0cmVlIGJyb2FkLXBoYXNlLlxuICAqIEBhdXRob3Igc2FoYXJhblxuICAqL1xuXG4gIGZ1bmN0aW9uIERCVlRQcm94eShzaGFwZSkge1xuXG4gICAgUHJveHkuY2FsbCh0aGlzLCBzaGFwZSk7XG4gICAgLy8gVGhlIGxlYWYgb2YgdGhlIHByb3h5LlxuICAgIHRoaXMubGVhZiA9IG5ldyBEQlZUTm9kZSgpO1xuICAgIHRoaXMubGVhZi5wcm94eSA9IHRoaXM7XG5cbiAgfVxuICBEQlZUUHJveHkucHJvdG90eXBlID0gT2JqZWN0LmFzc2lnbihPYmplY3QuY3JlYXRlKFByb3h5LnByb3RvdHlwZSksIHtcblxuICAgIGNvbnN0cnVjdG9yOiBEQlZUUHJveHksXG5cbiAgICB1cGRhdGU6IGZ1bmN0aW9uICgpIHtcblxuICAgIH1cblxuICB9KTtcblxuICAvKipcbiAgICogQSBicm9hZC1waGFzZSBhbGdvcml0aG0gdXNpbmcgZHluYW1pYyBib3VuZGluZyB2b2x1bWUgdHJlZS5cbiAgICpcbiAgICogQGF1dGhvciBzYWhhcmFuXG4gICAqIEBhdXRob3IgbG8tdGhcbiAgICovXG5cbiAgZnVuY3Rpb24gREJWVEJyb2FkUGhhc2UoKSB7XG5cbiAgICBCcm9hZFBoYXNlLmNhbGwodGhpcyk7XG5cbiAgICB0aGlzLnR5cGVzID0gQlJfQk9VTkRJTkdfVk9MVU1FX1RSRUU7XG5cbiAgICB0aGlzLnRyZWUgPSBuZXcgREJWVCgpO1xuICAgIHRoaXMuc3RhY2sgPSBbXTtcbiAgICB0aGlzLmxlYXZlcyA9IFtdO1xuICAgIHRoaXMubnVtTGVhdmVzID0gMDtcblxuICB9XG4gIERCVlRCcm9hZFBoYXNlLnByb3RvdHlwZSA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmNyZWF0ZShCcm9hZFBoYXNlLnByb3RvdHlwZSksIHtcblxuICAgIGNvbnN0cnVjdG9yOiBEQlZUQnJvYWRQaGFzZSxcblxuICAgIGNyZWF0ZVByb3h5OiBmdW5jdGlvbiAoc2hhcGUpIHtcblxuICAgICAgcmV0dXJuIG5ldyBEQlZUUHJveHkoc2hhcGUpO1xuXG4gICAgfSxcblxuICAgIGFkZFByb3h5OiBmdW5jdGlvbiAocHJveHkpIHtcblxuICAgICAgdGhpcy50cmVlLmluc2VydExlYWYocHJveHkubGVhZik7XG4gICAgICB0aGlzLmxlYXZlcy5wdXNoKHByb3h5LmxlYWYpO1xuICAgICAgdGhpcy5udW1MZWF2ZXMrKztcblxuICAgIH0sXG5cbiAgICByZW1vdmVQcm94eTogZnVuY3Rpb24gKHByb3h5KSB7XG5cbiAgICAgIHRoaXMudHJlZS5kZWxldGVMZWFmKHByb3h5LmxlYWYpO1xuICAgICAgdmFyIG4gPSB0aGlzLmxlYXZlcy5pbmRleE9mKHByb3h5LmxlYWYpO1xuICAgICAgaWYgKG4gPiAtMSkge1xuICAgICAgICB0aGlzLmxlYXZlcy5zcGxpY2UobiwgMSk7XG4gICAgICAgIHRoaXMubnVtTGVhdmVzLS07XG4gICAgICB9XG5cbiAgICB9LFxuXG4gICAgY29sbGVjdFBhaXJzOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIGlmICh0aGlzLm51bUxlYXZlcyA8IDIpIHJldHVybjtcblxuICAgICAgdmFyIGxlYWYsIG1hcmdpbiA9IDAuMSwgaSA9IHRoaXMubnVtTGVhdmVzO1xuXG4gICAgICB3aGlsZSAoaS0tKSB7XG5cbiAgICAgICAgbGVhZiA9IHRoaXMubGVhdmVzW2ldO1xuXG4gICAgICAgIGlmIChsZWFmLnByb3h5LmFhYmIuaW50ZXJzZWN0VGVzdFR3byhsZWFmLmFhYmIpKSB7XG5cbiAgICAgICAgICBsZWFmLmFhYmIuY29weShsZWFmLnByb3h5LmFhYmIsIG1hcmdpbik7XG4gICAgICAgICAgdGhpcy50cmVlLmRlbGV0ZUxlYWYobGVhZik7XG4gICAgICAgICAgdGhpcy50cmVlLmluc2VydExlYWYobGVhZik7XG4gICAgICAgICAgdGhpcy5jb2xsaWRlKGxlYWYsIHRoaXMudHJlZS5yb290KTtcblxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICB9LFxuXG4gICAgY29sbGlkZTogZnVuY3Rpb24gKG5vZGUxLCBub2RlMikge1xuXG4gICAgICB2YXIgc3RhY2tDb3VudCA9IDI7XG4gICAgICB2YXIgczEsIHMyLCBuMSwgbjIsIGwxLCBsMjtcbiAgICAgIHRoaXMuc3RhY2tbMF0gPSBub2RlMTtcbiAgICAgIHRoaXMuc3RhY2tbMV0gPSBub2RlMjtcblxuICAgICAgd2hpbGUgKHN0YWNrQ291bnQgPiAwKSB7XG5cbiAgICAgICAgbjEgPSB0aGlzLnN0YWNrWy0tc3RhY2tDb3VudF07XG4gICAgICAgIG4yID0gdGhpcy5zdGFja1stLXN0YWNrQ291bnRdO1xuICAgICAgICBsMSA9IG4xLnByb3h5ICE9IG51bGw7XG4gICAgICAgIGwyID0gbjIucHJveHkgIT0gbnVsbDtcblxuICAgICAgICB0aGlzLm51bVBhaXJDaGVja3MrKztcblxuICAgICAgICBpZiAobDEgJiYgbDIpIHtcbiAgICAgICAgICBzMSA9IG4xLnByb3h5LnNoYXBlO1xuICAgICAgICAgIHMyID0gbjIucHJveHkuc2hhcGU7XG4gICAgICAgICAgaWYgKHMxID09IHMyIHx8IHMxLmFhYmIuaW50ZXJzZWN0VGVzdChzMi5hYWJiKSB8fCAhdGhpcy5pc0F2YWlsYWJsZVBhaXIoczEsIHMyKSkgY29udGludWU7XG5cbiAgICAgICAgICB0aGlzLmFkZFBhaXIoczEsIHMyKTtcblxuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgaWYgKG4xLmFhYmIuaW50ZXJzZWN0VGVzdChuMi5hYWJiKSkgY29udGludWU7XG5cbiAgICAgICAgICAvKmlmKHN0YWNrQ291bnQrND49dGhpcy5tYXhTdGFjayl7Ly8gZXhwYW5kIHRoZSBzdGFja1xuICAgICAgICAgICAgICAvL3RoaXMubWF4U3RhY2s8PD0xO1xuICAgICAgICAgICAgICB0aGlzLm1heFN0YWNrKj0yO1xuICAgICAgICAgICAgICB2YXIgbmV3U3RhY2sgPSBbXTsvLyB2ZWN0b3JcbiAgICAgICAgICAgICAgbmV3U3RhY2subGVuZ3RoID0gdGhpcy5tYXhTdGFjaztcbiAgICAgICAgICAgICAgZm9yKHZhciBpPTA7aTxzdGFja0NvdW50O2krKyl7XG4gICAgICAgICAgICAgICAgICBuZXdTdGFja1tpXSA9IHRoaXMuc3RhY2tbaV07XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgdGhpcy5zdGFjayA9IG5ld1N0YWNrO1xuICAgICAgICAgIH0qL1xuXG4gICAgICAgICAgaWYgKGwyIHx8ICFsMSAmJiAobjEuYWFiYi5zdXJmYWNlQXJlYSgpID4gbjIuYWFiYi5zdXJmYWNlQXJlYSgpKSkge1xuICAgICAgICAgICAgdGhpcy5zdGFja1tzdGFja0NvdW50KytdID0gbjEuY2hpbGQxO1xuICAgICAgICAgICAgdGhpcy5zdGFja1tzdGFja0NvdW50KytdID0gbjI7XG4gICAgICAgICAgICB0aGlzLnN0YWNrW3N0YWNrQ291bnQrK10gPSBuMS5jaGlsZDI7XG4gICAgICAgICAgICB0aGlzLnN0YWNrW3N0YWNrQ291bnQrK10gPSBuMjtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zdGFja1tzdGFja0NvdW50KytdID0gbjE7XG4gICAgICAgICAgICB0aGlzLnN0YWNrW3N0YWNrQ291bnQrK10gPSBuMi5jaGlsZDE7XG4gICAgICAgICAgICB0aGlzLnN0YWNrW3N0YWNrQ291bnQrK10gPSBuMTtcbiAgICAgICAgICAgIHRoaXMuc3RhY2tbc3RhY2tDb3VudCsrXSA9IG4yLmNoaWxkMjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgIH1cblxuICB9KTtcblxuICBmdW5jdGlvbiBDb2xsaXNpb25EZXRlY3RvcigpIHtcblxuICAgIHRoaXMuZmxpcCA9IGZhbHNlO1xuXG4gIH1cbiAgT2JqZWN0LmFzc2lnbihDb2xsaXNpb25EZXRlY3Rvci5wcm90b3R5cGUsIHtcblxuICAgIENvbGxpc2lvbkRldGVjdG9yOiB0cnVlLFxuXG4gICAgZGV0ZWN0Q29sbGlzaW9uOiBmdW5jdGlvbiAoc2hhcGUxLCBzaGFwZTIsIG1hbmlmb2xkKSB7XG5cbiAgICAgIHByaW50RXJyb3IoXCJDb2xsaXNpb25EZXRlY3RvclwiLCBcIkluaGVyaXRhbmNlIGVycm9yLlwiKTtcblxuICAgIH1cblxuICB9KTtcblxuICAvKipcbiAgICogQSBjb2xsaXNpb24gZGV0ZWN0b3Igd2hpY2ggZGV0ZWN0cyBjb2xsaXNpb25zIGJldHdlZW4gdHdvIGJveGVzLlxuICAgKiBAYXV0aG9yIHNhaGFyYW5cbiAgICovXG4gIGZ1bmN0aW9uIEJveEJveENvbGxpc2lvbkRldGVjdG9yKCkge1xuXG4gICAgQ29sbGlzaW9uRGV0ZWN0b3IuY2FsbCh0aGlzKTtcbiAgICB0aGlzLmNsaXBWZXJ0aWNlczEgPSBuZXcgRmxvYXQzMkFycmF5KDI0KTsgLy8gOCB2ZXJ0aWNlcyB4LHkselxuICAgIHRoaXMuY2xpcFZlcnRpY2VzMiA9IG5ldyBGbG9hdDMyQXJyYXkoMjQpO1xuICAgIHRoaXMudXNlZCA9IG5ldyBGbG9hdDMyQXJyYXkoOCk7XG5cbiAgICB0aGlzLklORiA9IDEgLyAwO1xuXG4gIH1cbiAgQm94Qm94Q29sbGlzaW9uRGV0ZWN0b3IucHJvdG90eXBlID0gT2JqZWN0LmFzc2lnbihPYmplY3QuY3JlYXRlKENvbGxpc2lvbkRldGVjdG9yLnByb3RvdHlwZSksIHtcblxuICAgIGNvbnN0cnVjdG9yOiBCb3hCb3hDb2xsaXNpb25EZXRlY3RvcixcblxuICAgIGRldGVjdENvbGxpc2lvbjogZnVuY3Rpb24gKHNoYXBlMSwgc2hhcGUyLCBtYW5pZm9sZCkge1xuICAgICAgLy8gV2hhdCB5b3UgYXJlIGRvaW5nIFxuICAgICAgLy8gwrcgSSB0byBwcmVwYXJlIGEgc2VwYXJhdGUgYXhpcyBvZiB0aGUgZmlmdGVlbiBcbiAgICAgIC8vLVNpeCBpbiBlYWNoIG9mIHRocmVlIG5vcm1hbCB2ZWN0b3JzIG9mIHRoZSB4eXogZGlyZWN0aW9uIG9mIHRoZSBib3ggYm90aCBcbiAgICAgIC8vIMK3IFJlbWFpbmluZyBuaW5lIDN4MyBhIHZlY3RvciBwZXJwZW5kaWN1bGFyIHRvIHRoZSBzaWRlIG9mIHRoZSBib3ggMiBhbmQgdGhlIHNpZGUgb2YgdGhlIGJveCAxIFxuICAgICAgLy8gwrcgQ2FsY3VsYXRlIHRoZSBkZXB0aCB0byB0aGUgc2VwYXJhdGlvbiBheGlzIFxuXG4gICAgICAvLyBDYWxjdWxhdGVzIHRoZSBkaXN0YW5jZSB1c2luZyB0aGUgaW5uZXIgcHJvZHVjdCBhbmQgcHV0IHRoZSBhbW91bnQgb2YgZW1iZWRtZW50IFxuICAgICAgLy8gwrcgSG93ZXZlciBhIHZlcnRpY2FsIHNlcGFyYXRpb24gYXhpcyBhbmQgc2lkZSB0byB3ZWlnaHQgYSBsaXR0bGUgdG8gYXZvaWQgdmlicmF0aW9uIFxuICAgICAgLy8gQW5kIGVuZCB3aGVuIHRoZXJlIGlzIGEgc2VwYXJhdGUgYXhpcyB0aGF0IGlzIHJlbW90ZSBldmVuIG9uZSBcbiAgICAgIC8vIMK3IEkgbG9vayBmb3Igc2VwYXJhdGlvbiBheGlzIHdpdGggbGl0dGxlIHRvIGRlbnQgbW9zdCBcbiAgICAgIC8vIE1lbiBhbmQgaWYgc2VwYXJhdGlvbiBheGlzIG9mIHRoZSBmaXJzdCBzaXggLSBlbmQgY29sbGlzaW9uIFxuICAgICAgLy8gSGVuZyBJZiBpdCBzZXBhcmF0ZSBheGlzIG9mIG5pbmUgb3RoZXIgLSBzaWRlIGNvbGxpc2lvbiBcbiAgICAgIC8vIEhlbmcgLSBjYXNlIG9mIGEgc2lkZSBjb2xsaXNpb24gXG4gICAgICAvLyDCtyBGaW5kIHBvaW50cyBvZiB0d28gc2lkZXMgb24gd2hpY2ggeW91IG1hZGUg4oCL4oCLdGhlIHNlcGFyYXRpb24gYXhpcyBcblxuICAgICAgLy8gQ2FsY3VsYXRlcyB0aGUgcG9pbnQgb2YgY2xvc2VzdCBhcHByb2FjaCBvZiBhIHN0cmFpZ2h0IGxpbmUgY29uc2lzdGluZyBvZiBzZXBhcmF0ZSBheGlzIHBvaW50cyBvYnRhaW5lZCwgYW5kIHRoZSBjb2xsaXNpb24gcG9pbnQgXG4gICAgICAvLy1TdXJmYWNlIC0gdGhlIGNhc2Ugb2YgdGhlIHBsYW5lIGNyYXNoIFxuICAgICAgLy8tQm94IEEsIGJveCBCIGFuZCB0aGUgb3RoZXIgYSBib3ggb2YgYmV0dGVyIG1hZGUg4oCL4oCLYSBzZXBhcmF0ZSBheGlzIFxuICAgICAgLy8g4oCiIFRoZSBzdXJmYWNlIEEgYW5kIHRoZSBwbGFuZSB0aGF0IG1hZGUgdGhlIHNlcGFyYXRpb24gYXhpcyBvZiB0aGUgYm94IEEsIGFuZCBCIHRvIHRoZSBzdXJmYWNlIHRoZSBmYWNlIG9mIHRoZSBib3ggQiBjbG9zZSBpbiB0aGUgb3Bwb3NpdGUgZGlyZWN0aW9uIHRvIHRoZSBtb3N0IGlzb2xhdGVkIGF4aXMgXG5cbiAgICAgIC8vIFdoZW4gdmlld2VkIGZyb20gdGhlIGZyb250IHN1cmZhY2UgQSwgYW5kIHRoZSBjdXQgcGFydCBleGNlZWRpbmcgdGhlIGFyZWEgb2YgdGhlIHN1cmZhY2UgQSBpcyBhIHN1cmZhY2UgQiBcbiAgICAgIC8vLVBsYW5lIEIgYmVjb21lcyB0aGUgMy04IHRyaWFuZ2xlLCBJIGEgY2FuZGlkYXRlIGZvciB0aGUgY29sbGlzaW9uIHBvaW50IHRoZSB2ZXJ0ZXggb2Ygc3VyZmFjZSBCIFxuICAgICAgLy8g4oCiIElmIG1vcmUgdGhhbiBvbmUgY2FuZGlkYXRlIDUgZXhpc3RzLCBzY3JhcGluZyB1cCB0byBmb3VyIFxuXG4gICAgICAvLyBGb3IgcG90ZW50aWFsIGNvbGxpc2lvbiBwb2ludHMgb2YgYWxsLCB0byBleGFtaW5lIHRoZSBkaXN0YW5jZSBiZXR3ZWVuIHRoZSBzdXJmYWNlIEEgXG4gICAgICAvLyDigKIgSWYgeW91IHdlcmUgb24gdGhlIGluc2lkZSBzdXJmYWNlIG9mIEEsIGFuZCB0aGUgY29sbGlzaW9uIHBvaW50XG5cbiAgICAgIHZhciBiMTtcbiAgICAgIHZhciBiMjtcbiAgICAgIGlmIChzaGFwZTEuaWQgPCBzaGFwZTIuaWQpIHtcbiAgICAgICAgYjEgPSAoc2hhcGUxKTtcbiAgICAgICAgYjIgPSAoc2hhcGUyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGIxID0gKHNoYXBlMik7XG4gICAgICAgIGIyID0gKHNoYXBlMSk7XG4gICAgICB9XG4gICAgICB2YXIgVjEgPSBiMS5lbGVtZW50cztcbiAgICAgIHZhciBWMiA9IGIyLmVsZW1lbnRzO1xuXG4gICAgICB2YXIgRDEgPSBiMS5kaW1lbnRpb25zO1xuICAgICAgdmFyIEQyID0gYjIuZGltZW50aW9ucztcblxuICAgICAgdmFyIHAxID0gYjEucG9zaXRpb247XG4gICAgICB2YXIgcDIgPSBiMi5wb3NpdGlvbjtcbiAgICAgIHZhciBwMXggPSBwMS54O1xuICAgICAgdmFyIHAxeSA9IHAxLnk7XG4gICAgICB2YXIgcDF6ID0gcDEuejtcbiAgICAgIHZhciBwMnggPSBwMi54O1xuICAgICAgdmFyIHAyeSA9IHAyLnk7XG4gICAgICB2YXIgcDJ6ID0gcDIuejtcbiAgICAgIC8vIGRpZmZcbiAgICAgIHZhciBkeCA9IHAyeCAtIHAxeDtcbiAgICAgIHZhciBkeSA9IHAyeSAtIHAxeTtcbiAgICAgIHZhciBkeiA9IHAyeiAtIHAxejtcbiAgICAgIC8vIGRpc3RhbmNlXG4gICAgICB2YXIgdzEgPSBiMS5oYWxmV2lkdGg7XG4gICAgICB2YXIgaDEgPSBiMS5oYWxmSGVpZ2h0O1xuICAgICAgdmFyIGQxID0gYjEuaGFsZkRlcHRoO1xuICAgICAgdmFyIHcyID0gYjIuaGFsZldpZHRoO1xuICAgICAgdmFyIGgyID0gYjIuaGFsZkhlaWdodDtcbiAgICAgIHZhciBkMiA9IGIyLmhhbGZEZXB0aDtcbiAgICAgIC8vIGRpcmVjdGlvblxuXG4gICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAvLyAxNSBzZXBhcmF0aW5nIGF4ZXNcbiAgICAgIC8vIDF+NjogZmFjZVxuICAgICAgLy8gN35mOiBlZGdlXG4gICAgICAvLyBodHRwOi8vbWFydXBla2UyOTYuY29tL0NPTF8zRF9ObzEzX09CQnZzT0JCLmh0bWxcbiAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAgICAgdmFyIGExeCA9IEQxWzBdO1xuICAgICAgdmFyIGExeSA9IEQxWzFdO1xuICAgICAgdmFyIGExeiA9IEQxWzJdO1xuICAgICAgdmFyIGEyeCA9IEQxWzNdO1xuICAgICAgdmFyIGEyeSA9IEQxWzRdO1xuICAgICAgdmFyIGEyeiA9IEQxWzVdO1xuICAgICAgdmFyIGEzeCA9IEQxWzZdO1xuICAgICAgdmFyIGEzeSA9IEQxWzddO1xuICAgICAgdmFyIGEzeiA9IEQxWzhdO1xuICAgICAgdmFyIGQxeCA9IEQxWzldO1xuICAgICAgdmFyIGQxeSA9IEQxWzEwXTtcbiAgICAgIHZhciBkMXogPSBEMVsxMV07XG4gICAgICB2YXIgZDJ4ID0gRDFbMTJdO1xuICAgICAgdmFyIGQyeSA9IEQxWzEzXTtcbiAgICAgIHZhciBkMnogPSBEMVsxNF07XG4gICAgICB2YXIgZDN4ID0gRDFbMTVdO1xuICAgICAgdmFyIGQzeSA9IEQxWzE2XTtcbiAgICAgIHZhciBkM3ogPSBEMVsxN107XG5cbiAgICAgIHZhciBhNHggPSBEMlswXTtcbiAgICAgIHZhciBhNHkgPSBEMlsxXTtcbiAgICAgIHZhciBhNHogPSBEMlsyXTtcbiAgICAgIHZhciBhNXggPSBEMlszXTtcbiAgICAgIHZhciBhNXkgPSBEMls0XTtcbiAgICAgIHZhciBhNXogPSBEMls1XTtcbiAgICAgIHZhciBhNnggPSBEMls2XTtcbiAgICAgIHZhciBhNnkgPSBEMls3XTtcbiAgICAgIHZhciBhNnogPSBEMls4XTtcbiAgICAgIHZhciBkNHggPSBEMls5XTtcbiAgICAgIHZhciBkNHkgPSBEMlsxMF07XG4gICAgICB2YXIgZDR6ID0gRDJbMTFdO1xuICAgICAgdmFyIGQ1eCA9IEQyWzEyXTtcbiAgICAgIHZhciBkNXkgPSBEMlsxM107XG4gICAgICB2YXIgZDV6ID0gRDJbMTRdO1xuICAgICAgdmFyIGQ2eCA9IEQyWzE1XTtcbiAgICAgIHZhciBkNnkgPSBEMlsxNl07XG4gICAgICB2YXIgZDZ6ID0gRDJbMTddO1xuXG4gICAgICB2YXIgYTd4ID0gYTF5ICogYTR6IC0gYTF6ICogYTR5O1xuICAgICAgdmFyIGE3eSA9IGExeiAqIGE0eCAtIGExeCAqIGE0ejtcbiAgICAgIHZhciBhN3ogPSBhMXggKiBhNHkgLSBhMXkgKiBhNHg7XG4gICAgICB2YXIgYTh4ID0gYTF5ICogYTV6IC0gYTF6ICogYTV5O1xuICAgICAgdmFyIGE4eSA9IGExeiAqIGE1eCAtIGExeCAqIGE1ejtcbiAgICAgIHZhciBhOHogPSBhMXggKiBhNXkgLSBhMXkgKiBhNXg7XG4gICAgICB2YXIgYTl4ID0gYTF5ICogYTZ6IC0gYTF6ICogYTZ5O1xuICAgICAgdmFyIGE5eSA9IGExeiAqIGE2eCAtIGExeCAqIGE2ejtcbiAgICAgIHZhciBhOXogPSBhMXggKiBhNnkgLSBhMXkgKiBhNng7XG4gICAgICB2YXIgYWF4ID0gYTJ5ICogYTR6IC0gYTJ6ICogYTR5O1xuICAgICAgdmFyIGFheSA9IGEyeiAqIGE0eCAtIGEyeCAqIGE0ejtcbiAgICAgIHZhciBhYXogPSBhMnggKiBhNHkgLSBhMnkgKiBhNHg7XG4gICAgICB2YXIgYWJ4ID0gYTJ5ICogYTV6IC0gYTJ6ICogYTV5O1xuICAgICAgdmFyIGFieSA9IGEyeiAqIGE1eCAtIGEyeCAqIGE1ejtcbiAgICAgIHZhciBhYnogPSBhMnggKiBhNXkgLSBhMnkgKiBhNXg7XG4gICAgICB2YXIgYWN4ID0gYTJ5ICogYTZ6IC0gYTJ6ICogYTZ5O1xuICAgICAgdmFyIGFjeSA9IGEyeiAqIGE2eCAtIGEyeCAqIGE2ejtcbiAgICAgIHZhciBhY3ogPSBhMnggKiBhNnkgLSBhMnkgKiBhNng7XG4gICAgICB2YXIgYWR4ID0gYTN5ICogYTR6IC0gYTN6ICogYTR5O1xuICAgICAgdmFyIGFkeSA9IGEzeiAqIGE0eCAtIGEzeCAqIGE0ejtcbiAgICAgIHZhciBhZHogPSBhM3ggKiBhNHkgLSBhM3kgKiBhNHg7XG4gICAgICB2YXIgYWV4ID0gYTN5ICogYTV6IC0gYTN6ICogYTV5O1xuICAgICAgdmFyIGFleSA9IGEzeiAqIGE1eCAtIGEzeCAqIGE1ejtcbiAgICAgIHZhciBhZXogPSBhM3ggKiBhNXkgLSBhM3kgKiBhNXg7XG4gICAgICB2YXIgYWZ4ID0gYTN5ICogYTZ6IC0gYTN6ICogYTZ5O1xuICAgICAgdmFyIGFmeSA9IGEzeiAqIGE2eCAtIGEzeCAqIGE2ejtcbiAgICAgIHZhciBhZnogPSBhM3ggKiBhNnkgLSBhM3kgKiBhNng7XG4gICAgICAvLyByaWdodCBvciBsZWZ0IGZsYWdzXG4gICAgICB2YXIgcmlnaHQxO1xuICAgICAgdmFyIHJpZ2h0MjtcbiAgICAgIHZhciByaWdodDM7XG4gICAgICB2YXIgcmlnaHQ0O1xuICAgICAgdmFyIHJpZ2h0NTtcbiAgICAgIHZhciByaWdodDY7XG4gICAgICB2YXIgcmlnaHQ3O1xuICAgICAgdmFyIHJpZ2h0ODtcbiAgICAgIHZhciByaWdodDk7XG4gICAgICB2YXIgcmlnaHRhO1xuICAgICAgdmFyIHJpZ2h0YjtcbiAgICAgIHZhciByaWdodGM7XG4gICAgICB2YXIgcmlnaHRkO1xuICAgICAgdmFyIHJpZ2h0ZTtcbiAgICAgIHZhciByaWdodGY7XG4gICAgICAvLyBvdmVybGFwcGluZyBkaXN0YW5jZXNcbiAgICAgIHZhciBvdmVybGFwMTtcbiAgICAgIHZhciBvdmVybGFwMjtcbiAgICAgIHZhciBvdmVybGFwMztcbiAgICAgIHZhciBvdmVybGFwNDtcbiAgICAgIHZhciBvdmVybGFwNTtcbiAgICAgIHZhciBvdmVybGFwNjtcbiAgICAgIHZhciBvdmVybGFwNztcbiAgICAgIHZhciBvdmVybGFwODtcbiAgICAgIHZhciBvdmVybGFwOTtcbiAgICAgIHZhciBvdmVybGFwYTtcbiAgICAgIHZhciBvdmVybGFwYjtcbiAgICAgIHZhciBvdmVybGFwYztcbiAgICAgIHZhciBvdmVybGFwZDtcbiAgICAgIHZhciBvdmVybGFwZTtcbiAgICAgIHZhciBvdmVybGFwZjtcbiAgICAgIC8vIGludmFsaWQgZmxhZ3NcbiAgICAgIHZhciBpbnZhbGlkNyA9IGZhbHNlO1xuICAgICAgdmFyIGludmFsaWQ4ID0gZmFsc2U7XG4gICAgICB2YXIgaW52YWxpZDkgPSBmYWxzZTtcbiAgICAgIHZhciBpbnZhbGlkYSA9IGZhbHNlO1xuICAgICAgdmFyIGludmFsaWRiID0gZmFsc2U7XG4gICAgICB2YXIgaW52YWxpZGMgPSBmYWxzZTtcbiAgICAgIHZhciBpbnZhbGlkZCA9IGZhbHNlO1xuICAgICAgdmFyIGludmFsaWRlID0gZmFsc2U7XG4gICAgICB2YXIgaW52YWxpZGYgPSBmYWxzZTtcbiAgICAgIC8vIHRlbXBvcmFyeSB2YXJpYWJsZXNcbiAgICAgIHZhciBsZW47XG4gICAgICB2YXIgbGVuMTtcbiAgICAgIHZhciBsZW4yO1xuICAgICAgdmFyIGRvdDE7XG4gICAgICB2YXIgZG90MjtcbiAgICAgIHZhciBkb3QzO1xuICAgICAgLy8gdHJ5IGF4aXMgMVxuICAgICAgbGVuID0gYTF4ICogZHggKyBhMXkgKiBkeSArIGExeiAqIGR6O1xuICAgICAgcmlnaHQxID0gbGVuID4gMDtcbiAgICAgIGlmICghcmlnaHQxKSBsZW4gPSAtbGVuO1xuICAgICAgbGVuMSA9IHcxO1xuICAgICAgZG90MSA9IGExeCAqIGE0eCArIGExeSAqIGE0eSArIGExeiAqIGE0ejtcbiAgICAgIGRvdDIgPSBhMXggKiBhNXggKyBhMXkgKiBhNXkgKyBhMXogKiBhNXo7XG4gICAgICBkb3QzID0gYTF4ICogYTZ4ICsgYTF5ICogYTZ5ICsgYTF6ICogYTZ6O1xuICAgICAgaWYgKGRvdDEgPCAwKSBkb3QxID0gLWRvdDE7XG4gICAgICBpZiAoZG90MiA8IDApIGRvdDIgPSAtZG90MjtcbiAgICAgIGlmIChkb3QzIDwgMCkgZG90MyA9IC1kb3QzO1xuICAgICAgbGVuMiA9IGRvdDEgKiB3MiArIGRvdDIgKiBoMiArIGRvdDMgKiBkMjtcbiAgICAgIG92ZXJsYXAxID0gbGVuIC0gbGVuMSAtIGxlbjI7XG4gICAgICBpZiAob3ZlcmxhcDEgPiAwKSByZXR1cm47XG4gICAgICAvLyB0cnkgYXhpcyAyXG4gICAgICBsZW4gPSBhMnggKiBkeCArIGEyeSAqIGR5ICsgYTJ6ICogZHo7XG4gICAgICByaWdodDIgPSBsZW4gPiAwO1xuICAgICAgaWYgKCFyaWdodDIpIGxlbiA9IC1sZW47XG4gICAgICBsZW4xID0gaDE7XG4gICAgICBkb3QxID0gYTJ4ICogYTR4ICsgYTJ5ICogYTR5ICsgYTJ6ICogYTR6O1xuICAgICAgZG90MiA9IGEyeCAqIGE1eCArIGEyeSAqIGE1eSArIGEyeiAqIGE1ejtcbiAgICAgIGRvdDMgPSBhMnggKiBhNnggKyBhMnkgKiBhNnkgKyBhMnogKiBhNno7XG4gICAgICBpZiAoZG90MSA8IDApIGRvdDEgPSAtZG90MTtcbiAgICAgIGlmIChkb3QyIDwgMCkgZG90MiA9IC1kb3QyO1xuICAgICAgaWYgKGRvdDMgPCAwKSBkb3QzID0gLWRvdDM7XG4gICAgICBsZW4yID0gZG90MSAqIHcyICsgZG90MiAqIGgyICsgZG90MyAqIGQyO1xuICAgICAgb3ZlcmxhcDIgPSBsZW4gLSBsZW4xIC0gbGVuMjtcbiAgICAgIGlmIChvdmVybGFwMiA+IDApIHJldHVybjtcbiAgICAgIC8vIHRyeSBheGlzIDNcbiAgICAgIGxlbiA9IGEzeCAqIGR4ICsgYTN5ICogZHkgKyBhM3ogKiBkejtcbiAgICAgIHJpZ2h0MyA9IGxlbiA+IDA7XG4gICAgICBpZiAoIXJpZ2h0MykgbGVuID0gLWxlbjtcbiAgICAgIGxlbjEgPSBkMTtcbiAgICAgIGRvdDEgPSBhM3ggKiBhNHggKyBhM3kgKiBhNHkgKyBhM3ogKiBhNHo7XG4gICAgICBkb3QyID0gYTN4ICogYTV4ICsgYTN5ICogYTV5ICsgYTN6ICogYTV6O1xuICAgICAgZG90MyA9IGEzeCAqIGE2eCArIGEzeSAqIGE2eSArIGEzeiAqIGE2ejtcbiAgICAgIGlmIChkb3QxIDwgMCkgZG90MSA9IC1kb3QxO1xuICAgICAgaWYgKGRvdDIgPCAwKSBkb3QyID0gLWRvdDI7XG4gICAgICBpZiAoZG90MyA8IDApIGRvdDMgPSAtZG90MztcbiAgICAgIGxlbjIgPSBkb3QxICogdzIgKyBkb3QyICogaDIgKyBkb3QzICogZDI7XG4gICAgICBvdmVybGFwMyA9IGxlbiAtIGxlbjEgLSBsZW4yO1xuICAgICAgaWYgKG92ZXJsYXAzID4gMCkgcmV0dXJuO1xuICAgICAgLy8gdHJ5IGF4aXMgNFxuICAgICAgbGVuID0gYTR4ICogZHggKyBhNHkgKiBkeSArIGE0eiAqIGR6O1xuICAgICAgcmlnaHQ0ID0gbGVuID4gMDtcbiAgICAgIGlmICghcmlnaHQ0KSBsZW4gPSAtbGVuO1xuICAgICAgZG90MSA9IGE0eCAqIGExeCArIGE0eSAqIGExeSArIGE0eiAqIGExejtcbiAgICAgIGRvdDIgPSBhNHggKiBhMnggKyBhNHkgKiBhMnkgKyBhNHogKiBhMno7XG4gICAgICBkb3QzID0gYTR4ICogYTN4ICsgYTR5ICogYTN5ICsgYTR6ICogYTN6O1xuICAgICAgaWYgKGRvdDEgPCAwKSBkb3QxID0gLWRvdDE7XG4gICAgICBpZiAoZG90MiA8IDApIGRvdDIgPSAtZG90MjtcbiAgICAgIGlmIChkb3QzIDwgMCkgZG90MyA9IC1kb3QzO1xuICAgICAgbGVuMSA9IGRvdDEgKiB3MSArIGRvdDIgKiBoMSArIGRvdDMgKiBkMTtcbiAgICAgIGxlbjIgPSB3MjtcbiAgICAgIG92ZXJsYXA0ID0gKGxlbiAtIGxlbjEgLSBsZW4yKSAqIDEuMDtcbiAgICAgIGlmIChvdmVybGFwNCA+IDApIHJldHVybjtcbiAgICAgIC8vIHRyeSBheGlzIDVcbiAgICAgIGxlbiA9IGE1eCAqIGR4ICsgYTV5ICogZHkgKyBhNXogKiBkejtcbiAgICAgIHJpZ2h0NSA9IGxlbiA+IDA7XG4gICAgICBpZiAoIXJpZ2h0NSkgbGVuID0gLWxlbjtcbiAgICAgIGRvdDEgPSBhNXggKiBhMXggKyBhNXkgKiBhMXkgKyBhNXogKiBhMXo7XG4gICAgICBkb3QyID0gYTV4ICogYTJ4ICsgYTV5ICogYTJ5ICsgYTV6ICogYTJ6O1xuICAgICAgZG90MyA9IGE1eCAqIGEzeCArIGE1eSAqIGEzeSArIGE1eiAqIGEzejtcbiAgICAgIGlmIChkb3QxIDwgMCkgZG90MSA9IC1kb3QxO1xuICAgICAgaWYgKGRvdDIgPCAwKSBkb3QyID0gLWRvdDI7XG4gICAgICBpZiAoZG90MyA8IDApIGRvdDMgPSAtZG90MztcbiAgICAgIGxlbjEgPSBkb3QxICogdzEgKyBkb3QyICogaDEgKyBkb3QzICogZDE7XG4gICAgICBsZW4yID0gaDI7XG4gICAgICBvdmVybGFwNSA9IChsZW4gLSBsZW4xIC0gbGVuMikgKiAxLjA7XG4gICAgICBpZiAob3ZlcmxhcDUgPiAwKSByZXR1cm47XG4gICAgICAvLyB0cnkgYXhpcyA2XG4gICAgICBsZW4gPSBhNnggKiBkeCArIGE2eSAqIGR5ICsgYTZ6ICogZHo7XG4gICAgICByaWdodDYgPSBsZW4gPiAwO1xuICAgICAgaWYgKCFyaWdodDYpIGxlbiA9IC1sZW47XG4gICAgICBkb3QxID0gYTZ4ICogYTF4ICsgYTZ5ICogYTF5ICsgYTZ6ICogYTF6O1xuICAgICAgZG90MiA9IGE2eCAqIGEyeCArIGE2eSAqIGEyeSArIGE2eiAqIGEyejtcbiAgICAgIGRvdDMgPSBhNnggKiBhM3ggKyBhNnkgKiBhM3kgKyBhNnogKiBhM3o7XG4gICAgICBpZiAoZG90MSA8IDApIGRvdDEgPSAtZG90MTtcbiAgICAgIGlmIChkb3QyIDwgMCkgZG90MiA9IC1kb3QyO1xuICAgICAgaWYgKGRvdDMgPCAwKSBkb3QzID0gLWRvdDM7XG4gICAgICBsZW4xID0gZG90MSAqIHcxICsgZG90MiAqIGgxICsgZG90MyAqIGQxO1xuICAgICAgbGVuMiA9IGQyO1xuICAgICAgb3ZlcmxhcDYgPSAobGVuIC0gbGVuMSAtIGxlbjIpICogMS4wO1xuICAgICAgaWYgKG92ZXJsYXA2ID4gMCkgcmV0dXJuO1xuICAgICAgLy8gdHJ5IGF4aXMgN1xuICAgICAgbGVuID0gYTd4ICogYTd4ICsgYTd5ICogYTd5ICsgYTd6ICogYTd6O1xuICAgICAgaWYgKGxlbiA+IDFlLTUpIHtcbiAgICAgICAgbGVuID0gMSAvIF9NYXRoLnNxcnQobGVuKTtcbiAgICAgICAgYTd4ICo9IGxlbjtcbiAgICAgICAgYTd5ICo9IGxlbjtcbiAgICAgICAgYTd6ICo9IGxlbjtcbiAgICAgICAgbGVuID0gYTd4ICogZHggKyBhN3kgKiBkeSArIGE3eiAqIGR6O1xuICAgICAgICByaWdodDcgPSBsZW4gPiAwO1xuICAgICAgICBpZiAoIXJpZ2h0NykgbGVuID0gLWxlbjtcbiAgICAgICAgZG90MSA9IGE3eCAqIGEyeCArIGE3eSAqIGEyeSArIGE3eiAqIGEyejtcbiAgICAgICAgZG90MiA9IGE3eCAqIGEzeCArIGE3eSAqIGEzeSArIGE3eiAqIGEzejtcbiAgICAgICAgaWYgKGRvdDEgPCAwKSBkb3QxID0gLWRvdDE7XG4gICAgICAgIGlmIChkb3QyIDwgMCkgZG90MiA9IC1kb3QyO1xuICAgICAgICBsZW4xID0gZG90MSAqIGgxICsgZG90MiAqIGQxO1xuICAgICAgICBkb3QxID0gYTd4ICogYTV4ICsgYTd5ICogYTV5ICsgYTd6ICogYTV6O1xuICAgICAgICBkb3QyID0gYTd4ICogYTZ4ICsgYTd5ICogYTZ5ICsgYTd6ICogYTZ6O1xuICAgICAgICBpZiAoZG90MSA8IDApIGRvdDEgPSAtZG90MTtcbiAgICAgICAgaWYgKGRvdDIgPCAwKSBkb3QyID0gLWRvdDI7XG4gICAgICAgIGxlbjIgPSBkb3QxICogaDIgKyBkb3QyICogZDI7XG4gICAgICAgIG92ZXJsYXA3ID0gbGVuIC0gbGVuMSAtIGxlbjI7XG4gICAgICAgIGlmIChvdmVybGFwNyA+IDApIHJldHVybjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJpZ2h0NyA9IGZhbHNlO1xuICAgICAgICBvdmVybGFwNyA9IDA7XG4gICAgICAgIGludmFsaWQ3ID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIC8vIHRyeSBheGlzIDhcbiAgICAgIGxlbiA9IGE4eCAqIGE4eCArIGE4eSAqIGE4eSArIGE4eiAqIGE4ejtcbiAgICAgIGlmIChsZW4gPiAxZS01KSB7XG4gICAgICAgIGxlbiA9IDEgLyBfTWF0aC5zcXJ0KGxlbik7XG4gICAgICAgIGE4eCAqPSBsZW47XG4gICAgICAgIGE4eSAqPSBsZW47XG4gICAgICAgIGE4eiAqPSBsZW47XG4gICAgICAgIGxlbiA9IGE4eCAqIGR4ICsgYTh5ICogZHkgKyBhOHogKiBkejtcbiAgICAgICAgcmlnaHQ4ID0gbGVuID4gMDtcbiAgICAgICAgaWYgKCFyaWdodDgpIGxlbiA9IC1sZW47XG4gICAgICAgIGRvdDEgPSBhOHggKiBhMnggKyBhOHkgKiBhMnkgKyBhOHogKiBhMno7XG4gICAgICAgIGRvdDIgPSBhOHggKiBhM3ggKyBhOHkgKiBhM3kgKyBhOHogKiBhM3o7XG4gICAgICAgIGlmIChkb3QxIDwgMCkgZG90MSA9IC1kb3QxO1xuICAgICAgICBpZiAoZG90MiA8IDApIGRvdDIgPSAtZG90MjtcbiAgICAgICAgbGVuMSA9IGRvdDEgKiBoMSArIGRvdDIgKiBkMTtcbiAgICAgICAgZG90MSA9IGE4eCAqIGE0eCArIGE4eSAqIGE0eSArIGE4eiAqIGE0ejtcbiAgICAgICAgZG90MiA9IGE4eCAqIGE2eCArIGE4eSAqIGE2eSArIGE4eiAqIGE2ejtcbiAgICAgICAgaWYgKGRvdDEgPCAwKSBkb3QxID0gLWRvdDE7XG4gICAgICAgIGlmIChkb3QyIDwgMCkgZG90MiA9IC1kb3QyO1xuICAgICAgICBsZW4yID0gZG90MSAqIHcyICsgZG90MiAqIGQyO1xuICAgICAgICBvdmVybGFwOCA9IGxlbiAtIGxlbjEgLSBsZW4yO1xuICAgICAgICBpZiAob3ZlcmxhcDggPiAwKSByZXR1cm47XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByaWdodDggPSBmYWxzZTtcbiAgICAgICAgb3ZlcmxhcDggPSAwO1xuICAgICAgICBpbnZhbGlkOCA9IHRydWU7XG4gICAgICB9XG4gICAgICAvLyB0cnkgYXhpcyA5XG4gICAgICBsZW4gPSBhOXggKiBhOXggKyBhOXkgKiBhOXkgKyBhOXogKiBhOXo7XG4gICAgICBpZiAobGVuID4gMWUtNSkge1xuICAgICAgICBsZW4gPSAxIC8gX01hdGguc3FydChsZW4pO1xuICAgICAgICBhOXggKj0gbGVuO1xuICAgICAgICBhOXkgKj0gbGVuO1xuICAgICAgICBhOXogKj0gbGVuO1xuICAgICAgICBsZW4gPSBhOXggKiBkeCArIGE5eSAqIGR5ICsgYTl6ICogZHo7XG4gICAgICAgIHJpZ2h0OSA9IGxlbiA+IDA7XG4gICAgICAgIGlmICghcmlnaHQ5KSBsZW4gPSAtbGVuO1xuICAgICAgICBkb3QxID0gYTl4ICogYTJ4ICsgYTl5ICogYTJ5ICsgYTl6ICogYTJ6O1xuICAgICAgICBkb3QyID0gYTl4ICogYTN4ICsgYTl5ICogYTN5ICsgYTl6ICogYTN6O1xuICAgICAgICBpZiAoZG90MSA8IDApIGRvdDEgPSAtZG90MTtcbiAgICAgICAgaWYgKGRvdDIgPCAwKSBkb3QyID0gLWRvdDI7XG4gICAgICAgIGxlbjEgPSBkb3QxICogaDEgKyBkb3QyICogZDE7XG4gICAgICAgIGRvdDEgPSBhOXggKiBhNHggKyBhOXkgKiBhNHkgKyBhOXogKiBhNHo7XG4gICAgICAgIGRvdDIgPSBhOXggKiBhNXggKyBhOXkgKiBhNXkgKyBhOXogKiBhNXo7XG4gICAgICAgIGlmIChkb3QxIDwgMCkgZG90MSA9IC1kb3QxO1xuICAgICAgICBpZiAoZG90MiA8IDApIGRvdDIgPSAtZG90MjtcbiAgICAgICAgbGVuMiA9IGRvdDEgKiB3MiArIGRvdDIgKiBoMjtcbiAgICAgICAgb3ZlcmxhcDkgPSBsZW4gLSBsZW4xIC0gbGVuMjtcbiAgICAgICAgaWYgKG92ZXJsYXA5ID4gMCkgcmV0dXJuO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmlnaHQ5ID0gZmFsc2U7XG4gICAgICAgIG92ZXJsYXA5ID0gMDtcbiAgICAgICAgaW52YWxpZDkgPSB0cnVlO1xuICAgICAgfVxuICAgICAgLy8gdHJ5IGF4aXMgMTBcbiAgICAgIGxlbiA9IGFheCAqIGFheCArIGFheSAqIGFheSArIGFheiAqIGFhejtcbiAgICAgIGlmIChsZW4gPiAxZS01KSB7XG4gICAgICAgIGxlbiA9IDEgLyBfTWF0aC5zcXJ0KGxlbik7XG4gICAgICAgIGFheCAqPSBsZW47XG4gICAgICAgIGFheSAqPSBsZW47XG4gICAgICAgIGFheiAqPSBsZW47XG4gICAgICAgIGxlbiA9IGFheCAqIGR4ICsgYWF5ICogZHkgKyBhYXogKiBkejtcbiAgICAgICAgcmlnaHRhID0gbGVuID4gMDtcbiAgICAgICAgaWYgKCFyaWdodGEpIGxlbiA9IC1sZW47XG4gICAgICAgIGRvdDEgPSBhYXggKiBhMXggKyBhYXkgKiBhMXkgKyBhYXogKiBhMXo7XG4gICAgICAgIGRvdDIgPSBhYXggKiBhM3ggKyBhYXkgKiBhM3kgKyBhYXogKiBhM3o7XG4gICAgICAgIGlmIChkb3QxIDwgMCkgZG90MSA9IC1kb3QxO1xuICAgICAgICBpZiAoZG90MiA8IDApIGRvdDIgPSAtZG90MjtcbiAgICAgICAgbGVuMSA9IGRvdDEgKiB3MSArIGRvdDIgKiBkMTtcbiAgICAgICAgZG90MSA9IGFheCAqIGE1eCArIGFheSAqIGE1eSArIGFheiAqIGE1ejtcbiAgICAgICAgZG90MiA9IGFheCAqIGE2eCArIGFheSAqIGE2eSArIGFheiAqIGE2ejtcbiAgICAgICAgaWYgKGRvdDEgPCAwKSBkb3QxID0gLWRvdDE7XG4gICAgICAgIGlmIChkb3QyIDwgMCkgZG90MiA9IC1kb3QyO1xuICAgICAgICBsZW4yID0gZG90MSAqIGgyICsgZG90MiAqIGQyO1xuICAgICAgICBvdmVybGFwYSA9IGxlbiAtIGxlbjEgLSBsZW4yO1xuICAgICAgICBpZiAob3ZlcmxhcGEgPiAwKSByZXR1cm47XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByaWdodGEgPSBmYWxzZTtcbiAgICAgICAgb3ZlcmxhcGEgPSAwO1xuICAgICAgICBpbnZhbGlkYSA9IHRydWU7XG4gICAgICB9XG4gICAgICAvLyB0cnkgYXhpcyAxMVxuICAgICAgbGVuID0gYWJ4ICogYWJ4ICsgYWJ5ICogYWJ5ICsgYWJ6ICogYWJ6O1xuICAgICAgaWYgKGxlbiA+IDFlLTUpIHtcbiAgICAgICAgbGVuID0gMSAvIF9NYXRoLnNxcnQobGVuKTtcbiAgICAgICAgYWJ4ICo9IGxlbjtcbiAgICAgICAgYWJ5ICo9IGxlbjtcbiAgICAgICAgYWJ6ICo9IGxlbjtcbiAgICAgICAgbGVuID0gYWJ4ICogZHggKyBhYnkgKiBkeSArIGFieiAqIGR6O1xuICAgICAgICByaWdodGIgPSBsZW4gPiAwO1xuICAgICAgICBpZiAoIXJpZ2h0YikgbGVuID0gLWxlbjtcbiAgICAgICAgZG90MSA9IGFieCAqIGExeCArIGFieSAqIGExeSArIGFieiAqIGExejtcbiAgICAgICAgZG90MiA9IGFieCAqIGEzeCArIGFieSAqIGEzeSArIGFieiAqIGEzejtcbiAgICAgICAgaWYgKGRvdDEgPCAwKSBkb3QxID0gLWRvdDE7XG4gICAgICAgIGlmIChkb3QyIDwgMCkgZG90MiA9IC1kb3QyO1xuICAgICAgICBsZW4xID0gZG90MSAqIHcxICsgZG90MiAqIGQxO1xuICAgICAgICBkb3QxID0gYWJ4ICogYTR4ICsgYWJ5ICogYTR5ICsgYWJ6ICogYTR6O1xuICAgICAgICBkb3QyID0gYWJ4ICogYTZ4ICsgYWJ5ICogYTZ5ICsgYWJ6ICogYTZ6O1xuICAgICAgICBpZiAoZG90MSA8IDApIGRvdDEgPSAtZG90MTtcbiAgICAgICAgaWYgKGRvdDIgPCAwKSBkb3QyID0gLWRvdDI7XG4gICAgICAgIGxlbjIgPSBkb3QxICogdzIgKyBkb3QyICogZDI7XG4gICAgICAgIG92ZXJsYXBiID0gbGVuIC0gbGVuMSAtIGxlbjI7XG4gICAgICAgIGlmIChvdmVybGFwYiA+IDApIHJldHVybjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJpZ2h0YiA9IGZhbHNlO1xuICAgICAgICBvdmVybGFwYiA9IDA7XG4gICAgICAgIGludmFsaWRiID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIC8vIHRyeSBheGlzIDEyXG4gICAgICBsZW4gPSBhY3ggKiBhY3ggKyBhY3kgKiBhY3kgKyBhY3ogKiBhY3o7XG4gICAgICBpZiAobGVuID4gMWUtNSkge1xuICAgICAgICBsZW4gPSAxIC8gX01hdGguc3FydChsZW4pO1xuICAgICAgICBhY3ggKj0gbGVuO1xuICAgICAgICBhY3kgKj0gbGVuO1xuICAgICAgICBhY3ogKj0gbGVuO1xuICAgICAgICBsZW4gPSBhY3ggKiBkeCArIGFjeSAqIGR5ICsgYWN6ICogZHo7XG4gICAgICAgIHJpZ2h0YyA9IGxlbiA+IDA7XG4gICAgICAgIGlmICghcmlnaHRjKSBsZW4gPSAtbGVuO1xuICAgICAgICBkb3QxID0gYWN4ICogYTF4ICsgYWN5ICogYTF5ICsgYWN6ICogYTF6O1xuICAgICAgICBkb3QyID0gYWN4ICogYTN4ICsgYWN5ICogYTN5ICsgYWN6ICogYTN6O1xuICAgICAgICBpZiAoZG90MSA8IDApIGRvdDEgPSAtZG90MTtcbiAgICAgICAgaWYgKGRvdDIgPCAwKSBkb3QyID0gLWRvdDI7XG4gICAgICAgIGxlbjEgPSBkb3QxICogdzEgKyBkb3QyICogZDE7XG4gICAgICAgIGRvdDEgPSBhY3ggKiBhNHggKyBhY3kgKiBhNHkgKyBhY3ogKiBhNHo7XG4gICAgICAgIGRvdDIgPSBhY3ggKiBhNXggKyBhY3kgKiBhNXkgKyBhY3ogKiBhNXo7XG4gICAgICAgIGlmIChkb3QxIDwgMCkgZG90MSA9IC1kb3QxO1xuICAgICAgICBpZiAoZG90MiA8IDApIGRvdDIgPSAtZG90MjtcbiAgICAgICAgbGVuMiA9IGRvdDEgKiB3MiArIGRvdDIgKiBoMjtcbiAgICAgICAgb3ZlcmxhcGMgPSBsZW4gLSBsZW4xIC0gbGVuMjtcbiAgICAgICAgaWYgKG92ZXJsYXBjID4gMCkgcmV0dXJuO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmlnaHRjID0gZmFsc2U7XG4gICAgICAgIG92ZXJsYXBjID0gMDtcbiAgICAgICAgaW52YWxpZGMgPSB0cnVlO1xuICAgICAgfVxuICAgICAgLy8gdHJ5IGF4aXMgMTNcbiAgICAgIGxlbiA9IGFkeCAqIGFkeCArIGFkeSAqIGFkeSArIGFkeiAqIGFkejtcbiAgICAgIGlmIChsZW4gPiAxZS01KSB7XG4gICAgICAgIGxlbiA9IDEgLyBfTWF0aC5zcXJ0KGxlbik7XG4gICAgICAgIGFkeCAqPSBsZW47XG4gICAgICAgIGFkeSAqPSBsZW47XG4gICAgICAgIGFkeiAqPSBsZW47XG4gICAgICAgIGxlbiA9IGFkeCAqIGR4ICsgYWR5ICogZHkgKyBhZHogKiBkejtcbiAgICAgICAgcmlnaHRkID0gbGVuID4gMDtcbiAgICAgICAgaWYgKCFyaWdodGQpIGxlbiA9IC1sZW47XG4gICAgICAgIGRvdDEgPSBhZHggKiBhMXggKyBhZHkgKiBhMXkgKyBhZHogKiBhMXo7XG4gICAgICAgIGRvdDIgPSBhZHggKiBhMnggKyBhZHkgKiBhMnkgKyBhZHogKiBhMno7XG4gICAgICAgIGlmIChkb3QxIDwgMCkgZG90MSA9IC1kb3QxO1xuICAgICAgICBpZiAoZG90MiA8IDApIGRvdDIgPSAtZG90MjtcbiAgICAgICAgbGVuMSA9IGRvdDEgKiB3MSArIGRvdDIgKiBoMTtcbiAgICAgICAgZG90MSA9IGFkeCAqIGE1eCArIGFkeSAqIGE1eSArIGFkeiAqIGE1ejtcbiAgICAgICAgZG90MiA9IGFkeCAqIGE2eCArIGFkeSAqIGE2eSArIGFkeiAqIGE2ejtcbiAgICAgICAgaWYgKGRvdDEgPCAwKSBkb3QxID0gLWRvdDE7XG4gICAgICAgIGlmIChkb3QyIDwgMCkgZG90MiA9IC1kb3QyO1xuICAgICAgICBsZW4yID0gZG90MSAqIGgyICsgZG90MiAqIGQyO1xuICAgICAgICBvdmVybGFwZCA9IGxlbiAtIGxlbjEgLSBsZW4yO1xuICAgICAgICBpZiAob3ZlcmxhcGQgPiAwKSByZXR1cm47XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByaWdodGQgPSBmYWxzZTtcbiAgICAgICAgb3ZlcmxhcGQgPSAwO1xuICAgICAgICBpbnZhbGlkZCA9IHRydWU7XG4gICAgICB9XG4gICAgICAvLyB0cnkgYXhpcyAxNFxuICAgICAgbGVuID0gYWV4ICogYWV4ICsgYWV5ICogYWV5ICsgYWV6ICogYWV6O1xuICAgICAgaWYgKGxlbiA+IDFlLTUpIHtcbiAgICAgICAgbGVuID0gMSAvIF9NYXRoLnNxcnQobGVuKTtcbiAgICAgICAgYWV4ICo9IGxlbjtcbiAgICAgICAgYWV5ICo9IGxlbjtcbiAgICAgICAgYWV6ICo9IGxlbjtcbiAgICAgICAgbGVuID0gYWV4ICogZHggKyBhZXkgKiBkeSArIGFleiAqIGR6O1xuICAgICAgICByaWdodGUgPSBsZW4gPiAwO1xuICAgICAgICBpZiAoIXJpZ2h0ZSkgbGVuID0gLWxlbjtcbiAgICAgICAgZG90MSA9IGFleCAqIGExeCArIGFleSAqIGExeSArIGFleiAqIGExejtcbiAgICAgICAgZG90MiA9IGFleCAqIGEyeCArIGFleSAqIGEyeSArIGFleiAqIGEyejtcbiAgICAgICAgaWYgKGRvdDEgPCAwKSBkb3QxID0gLWRvdDE7XG4gICAgICAgIGlmIChkb3QyIDwgMCkgZG90MiA9IC1kb3QyO1xuICAgICAgICBsZW4xID0gZG90MSAqIHcxICsgZG90MiAqIGgxO1xuICAgICAgICBkb3QxID0gYWV4ICogYTR4ICsgYWV5ICogYTR5ICsgYWV6ICogYTR6O1xuICAgICAgICBkb3QyID0gYWV4ICogYTZ4ICsgYWV5ICogYTZ5ICsgYWV6ICogYTZ6O1xuICAgICAgICBpZiAoZG90MSA8IDApIGRvdDEgPSAtZG90MTtcbiAgICAgICAgaWYgKGRvdDIgPCAwKSBkb3QyID0gLWRvdDI7XG4gICAgICAgIGxlbjIgPSBkb3QxICogdzIgKyBkb3QyICogZDI7XG4gICAgICAgIG92ZXJsYXBlID0gbGVuIC0gbGVuMSAtIGxlbjI7XG4gICAgICAgIGlmIChvdmVybGFwZSA+IDApIHJldHVybjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJpZ2h0ZSA9IGZhbHNlO1xuICAgICAgICBvdmVybGFwZSA9IDA7XG4gICAgICAgIGludmFsaWRlID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIC8vIHRyeSBheGlzIDE1XG4gICAgICBsZW4gPSBhZnggKiBhZnggKyBhZnkgKiBhZnkgKyBhZnogKiBhZno7XG4gICAgICBpZiAobGVuID4gMWUtNSkge1xuICAgICAgICBsZW4gPSAxIC8gX01hdGguc3FydChsZW4pO1xuICAgICAgICBhZnggKj0gbGVuO1xuICAgICAgICBhZnkgKj0gbGVuO1xuICAgICAgICBhZnogKj0gbGVuO1xuICAgICAgICBsZW4gPSBhZnggKiBkeCArIGFmeSAqIGR5ICsgYWZ6ICogZHo7XG4gICAgICAgIHJpZ2h0ZiA9IGxlbiA+IDA7XG4gICAgICAgIGlmICghcmlnaHRmKSBsZW4gPSAtbGVuO1xuICAgICAgICBkb3QxID0gYWZ4ICogYTF4ICsgYWZ5ICogYTF5ICsgYWZ6ICogYTF6O1xuICAgICAgICBkb3QyID0gYWZ4ICogYTJ4ICsgYWZ5ICogYTJ5ICsgYWZ6ICogYTJ6O1xuICAgICAgICBpZiAoZG90MSA8IDApIGRvdDEgPSAtZG90MTtcbiAgICAgICAgaWYgKGRvdDIgPCAwKSBkb3QyID0gLWRvdDI7XG4gICAgICAgIGxlbjEgPSBkb3QxICogdzEgKyBkb3QyICogaDE7XG4gICAgICAgIGRvdDEgPSBhZnggKiBhNHggKyBhZnkgKiBhNHkgKyBhZnogKiBhNHo7XG4gICAgICAgIGRvdDIgPSBhZnggKiBhNXggKyBhZnkgKiBhNXkgKyBhZnogKiBhNXo7XG4gICAgICAgIGlmIChkb3QxIDwgMCkgZG90MSA9IC1kb3QxO1xuICAgICAgICBpZiAoZG90MiA8IDApIGRvdDIgPSAtZG90MjtcbiAgICAgICAgbGVuMiA9IGRvdDEgKiB3MiArIGRvdDIgKiBoMjtcbiAgICAgICAgb3ZlcmxhcGYgPSBsZW4gLSBsZW4xIC0gbGVuMjtcbiAgICAgICAgaWYgKG92ZXJsYXBmID4gMCkgcmV0dXJuO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmlnaHRmID0gZmFsc2U7XG4gICAgICAgIG92ZXJsYXBmID0gMDtcbiAgICAgICAgaW52YWxpZGYgPSB0cnVlO1xuICAgICAgfVxuICAgICAgLy8gYm94ZXMgYXJlIG92ZXJsYXBwaW5nXG4gICAgICB2YXIgZGVwdGggPSBvdmVybGFwMTtcbiAgICAgIHZhciBkZXB0aDIgPSBvdmVybGFwMTtcbiAgICAgIHZhciBtaW5JbmRleCA9IDA7XG4gICAgICB2YXIgcmlnaHQgPSByaWdodDE7XG4gICAgICBpZiAob3ZlcmxhcDIgPiBkZXB0aDIpIHtcbiAgICAgICAgZGVwdGggPSBvdmVybGFwMjtcbiAgICAgICAgZGVwdGgyID0gb3ZlcmxhcDI7XG4gICAgICAgIG1pbkluZGV4ID0gMTtcbiAgICAgICAgcmlnaHQgPSByaWdodDI7XG4gICAgICB9XG4gICAgICBpZiAob3ZlcmxhcDMgPiBkZXB0aDIpIHtcbiAgICAgICAgZGVwdGggPSBvdmVybGFwMztcbiAgICAgICAgZGVwdGgyID0gb3ZlcmxhcDM7XG4gICAgICAgIG1pbkluZGV4ID0gMjtcbiAgICAgICAgcmlnaHQgPSByaWdodDM7XG4gICAgICB9XG4gICAgICBpZiAob3ZlcmxhcDQgPiBkZXB0aDIpIHtcbiAgICAgICAgZGVwdGggPSBvdmVybGFwNDtcbiAgICAgICAgZGVwdGgyID0gb3ZlcmxhcDQ7XG4gICAgICAgIG1pbkluZGV4ID0gMztcbiAgICAgICAgcmlnaHQgPSByaWdodDQ7XG4gICAgICB9XG4gICAgICBpZiAob3ZlcmxhcDUgPiBkZXB0aDIpIHtcbiAgICAgICAgZGVwdGggPSBvdmVybGFwNTtcbiAgICAgICAgZGVwdGgyID0gb3ZlcmxhcDU7XG4gICAgICAgIG1pbkluZGV4ID0gNDtcbiAgICAgICAgcmlnaHQgPSByaWdodDU7XG4gICAgICB9XG4gICAgICBpZiAob3ZlcmxhcDYgPiBkZXB0aDIpIHtcbiAgICAgICAgZGVwdGggPSBvdmVybGFwNjtcbiAgICAgICAgZGVwdGgyID0gb3ZlcmxhcDY7XG4gICAgICAgIG1pbkluZGV4ID0gNTtcbiAgICAgICAgcmlnaHQgPSByaWdodDY7XG4gICAgICB9XG4gICAgICBpZiAob3ZlcmxhcDcgLSAwLjAxID4gZGVwdGgyICYmICFpbnZhbGlkNykge1xuICAgICAgICBkZXB0aCA9IG92ZXJsYXA3O1xuICAgICAgICBkZXB0aDIgPSBvdmVybGFwNyAtIDAuMDE7XG4gICAgICAgIG1pbkluZGV4ID0gNjtcbiAgICAgICAgcmlnaHQgPSByaWdodDc7XG4gICAgICB9XG4gICAgICBpZiAob3ZlcmxhcDggLSAwLjAxID4gZGVwdGgyICYmICFpbnZhbGlkOCkge1xuICAgICAgICBkZXB0aCA9IG92ZXJsYXA4O1xuICAgICAgICBkZXB0aDIgPSBvdmVybGFwOCAtIDAuMDE7XG4gICAgICAgIG1pbkluZGV4ID0gNztcbiAgICAgICAgcmlnaHQgPSByaWdodDg7XG4gICAgICB9XG4gICAgICBpZiAob3ZlcmxhcDkgLSAwLjAxID4gZGVwdGgyICYmICFpbnZhbGlkOSkge1xuICAgICAgICBkZXB0aCA9IG92ZXJsYXA5O1xuICAgICAgICBkZXB0aDIgPSBvdmVybGFwOSAtIDAuMDE7XG4gICAgICAgIG1pbkluZGV4ID0gODtcbiAgICAgICAgcmlnaHQgPSByaWdodDk7XG4gICAgICB9XG4gICAgICBpZiAob3ZlcmxhcGEgLSAwLjAxID4gZGVwdGgyICYmICFpbnZhbGlkYSkge1xuICAgICAgICBkZXB0aCA9IG92ZXJsYXBhO1xuICAgICAgICBkZXB0aDIgPSBvdmVybGFwYSAtIDAuMDE7XG4gICAgICAgIG1pbkluZGV4ID0gOTtcbiAgICAgICAgcmlnaHQgPSByaWdodGE7XG4gICAgICB9XG4gICAgICBpZiAob3ZlcmxhcGIgLSAwLjAxID4gZGVwdGgyICYmICFpbnZhbGlkYikge1xuICAgICAgICBkZXB0aCA9IG92ZXJsYXBiO1xuICAgICAgICBkZXB0aDIgPSBvdmVybGFwYiAtIDAuMDE7XG4gICAgICAgIG1pbkluZGV4ID0gMTA7XG4gICAgICAgIHJpZ2h0ID0gcmlnaHRiO1xuICAgICAgfVxuICAgICAgaWYgKG92ZXJsYXBjIC0gMC4wMSA+IGRlcHRoMiAmJiAhaW52YWxpZGMpIHtcbiAgICAgICAgZGVwdGggPSBvdmVybGFwYztcbiAgICAgICAgZGVwdGgyID0gb3ZlcmxhcGMgLSAwLjAxO1xuICAgICAgICBtaW5JbmRleCA9IDExO1xuICAgICAgICByaWdodCA9IHJpZ2h0YztcbiAgICAgIH1cbiAgICAgIGlmIChvdmVybGFwZCAtIDAuMDEgPiBkZXB0aDIgJiYgIWludmFsaWRkKSB7XG4gICAgICAgIGRlcHRoID0gb3ZlcmxhcGQ7XG4gICAgICAgIGRlcHRoMiA9IG92ZXJsYXBkIC0gMC4wMTtcbiAgICAgICAgbWluSW5kZXggPSAxMjtcbiAgICAgICAgcmlnaHQgPSByaWdodGQ7XG4gICAgICB9XG4gICAgICBpZiAob3ZlcmxhcGUgLSAwLjAxID4gZGVwdGgyICYmICFpbnZhbGlkZSkge1xuICAgICAgICBkZXB0aCA9IG92ZXJsYXBlO1xuICAgICAgICBkZXB0aDIgPSBvdmVybGFwZSAtIDAuMDE7XG4gICAgICAgIG1pbkluZGV4ID0gMTM7XG4gICAgICAgIHJpZ2h0ID0gcmlnaHRlO1xuICAgICAgfVxuICAgICAgaWYgKG92ZXJsYXBmIC0gMC4wMSA+IGRlcHRoMiAmJiAhaW52YWxpZGYpIHtcbiAgICAgICAgZGVwdGggPSBvdmVybGFwZjtcbiAgICAgICAgbWluSW5kZXggPSAxNDtcbiAgICAgICAgcmlnaHQgPSByaWdodGY7XG4gICAgICB9XG4gICAgICAvLyBub3JtYWxcbiAgICAgIHZhciBueCA9IDA7XG4gICAgICB2YXIgbnkgPSAwO1xuICAgICAgdmFyIG56ID0gMDtcbiAgICAgIC8vIGVkZ2UgbGluZSBvciBmYWNlIHNpZGUgbm9ybWFsXG4gICAgICB2YXIgbjF4ID0gMDtcbiAgICAgIHZhciBuMXkgPSAwO1xuICAgICAgdmFyIG4xeiA9IDA7XG4gICAgICB2YXIgbjJ4ID0gMDtcbiAgICAgIHZhciBuMnkgPSAwO1xuICAgICAgdmFyIG4yeiA9IDA7XG4gICAgICAvLyBjZW50ZXIgb2YgY3VycmVudCBmYWNlXG4gICAgICB2YXIgY3ggPSAwO1xuICAgICAgdmFyIGN5ID0gMDtcbiAgICAgIHZhciBjeiA9IDA7XG4gICAgICAvLyBmYWNlIHNpZGVcbiAgICAgIHZhciBzMXggPSAwO1xuICAgICAgdmFyIHMxeSA9IDA7XG4gICAgICB2YXIgczF6ID0gMDtcbiAgICAgIHZhciBzMnggPSAwO1xuICAgICAgdmFyIHMyeSA9IDA7XG4gICAgICB2YXIgczJ6ID0gMDtcbiAgICAgIC8vIHN3YXAgYjEgYjJcbiAgICAgIHZhciBzd2FwID0gZmFsc2U7XG5cbiAgICAgIC8vX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fXG5cbiAgICAgIGlmIChtaW5JbmRleCA9PSAwKSB7Ly8gYjEueCAqIGIyXG4gICAgICAgIGlmIChyaWdodCkge1xuICAgICAgICAgIGN4ID0gcDF4ICsgZDF4OyBjeSA9IHAxeSArIGQxeTsgY3ogPSBwMXogKyBkMXo7XG4gICAgICAgICAgbnggPSBhMXg7IG55ID0gYTF5OyBueiA9IGExejtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjeCA9IHAxeCAtIGQxeDsgY3kgPSBwMXkgLSBkMXk7IGN6ID0gcDF6IC0gZDF6O1xuICAgICAgICAgIG54ID0gLWExeDsgbnkgPSAtYTF5OyBueiA9IC1hMXo7XG4gICAgICAgIH1cbiAgICAgICAgczF4ID0gZDJ4OyBzMXkgPSBkMnk7IHMxeiA9IGQyejtcbiAgICAgICAgbjF4ID0gLWEyeDsgbjF5ID0gLWEyeTsgbjF6ID0gLWEyejtcbiAgICAgICAgczJ4ID0gZDN4OyBzMnkgPSBkM3k7IHMyeiA9IGQzejtcbiAgICAgICAgbjJ4ID0gLWEzeDsgbjJ5ID0gLWEzeTsgbjJ6ID0gLWEzejtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKG1pbkluZGV4ID09IDEpIHsvLyBiMS55ICogYjJcbiAgICAgICAgaWYgKHJpZ2h0KSB7XG4gICAgICAgICAgY3ggPSBwMXggKyBkMng7IGN5ID0gcDF5ICsgZDJ5OyBjeiA9IHAxeiArIGQyejtcbiAgICAgICAgICBueCA9IGEyeDsgbnkgPSBhMnk7IG56ID0gYTJ6O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGN4ID0gcDF4IC0gZDJ4OyBjeSA9IHAxeSAtIGQyeTsgY3ogPSBwMXogLSBkMno7XG4gICAgICAgICAgbnggPSAtYTJ4OyBueSA9IC1hMnk7IG56ID0gLWEyejtcbiAgICAgICAgfVxuICAgICAgICBzMXggPSBkMXg7IHMxeSA9IGQxeTsgczF6ID0gZDF6O1xuICAgICAgICBuMXggPSAtYTF4OyBuMXkgPSAtYTF5OyBuMXogPSAtYTF6O1xuICAgICAgICBzMnggPSBkM3g7IHMyeSA9IGQzeTsgczJ6ID0gZDN6O1xuICAgICAgICBuMnggPSAtYTN4OyBuMnkgPSAtYTN5OyBuMnogPSAtYTN6O1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAobWluSW5kZXggPT0gMikgey8vIGIxLnogKiBiMlxuICAgICAgICBpZiAocmlnaHQpIHtcbiAgICAgICAgICBjeCA9IHAxeCArIGQzeDsgY3kgPSBwMXkgKyBkM3k7IGN6ID0gcDF6ICsgZDN6O1xuICAgICAgICAgIG54ID0gYTN4OyBueSA9IGEzeTsgbnogPSBhM3o7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY3ggPSBwMXggLSBkM3g7IGN5ID0gcDF5IC0gZDN5OyBjeiA9IHAxeiAtIGQzejtcbiAgICAgICAgICBueCA9IC1hM3g7IG55ID0gLWEzeTsgbnogPSAtYTN6O1xuICAgICAgICB9XG4gICAgICAgIHMxeCA9IGQxeDsgczF5ID0gZDF5OyBzMXogPSBkMXo7XG4gICAgICAgIG4xeCA9IC1hMXg7IG4xeSA9IC1hMXk7IG4xeiA9IC1hMXo7XG4gICAgICAgIHMyeCA9IGQyeDsgczJ5ID0gZDJ5OyBzMnogPSBkMno7XG4gICAgICAgIG4yeCA9IC1hMng7IG4yeSA9IC1hMnk7IG4yeiA9IC1hMno7XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChtaW5JbmRleCA9PSAzKSB7Ly8gYjIueCAqIGIxXG4gICAgICAgIHN3YXAgPSB0cnVlO1xuICAgICAgICBpZiAoIXJpZ2h0KSB7XG4gICAgICAgICAgY3ggPSBwMnggKyBkNHg7IGN5ID0gcDJ5ICsgZDR5OyBjeiA9IHAyeiArIGQ0ejtcbiAgICAgICAgICBueCA9IGE0eDsgbnkgPSBhNHk7IG56ID0gYTR6O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGN4ID0gcDJ4IC0gZDR4OyBjeSA9IHAyeSAtIGQ0eTsgY3ogPSBwMnogLSBkNHo7XG4gICAgICAgICAgbnggPSAtYTR4OyBueSA9IC1hNHk7IG56ID0gLWE0ejtcbiAgICAgICAgfVxuICAgICAgICBzMXggPSBkNXg7IHMxeSA9IGQ1eTsgczF6ID0gZDV6O1xuICAgICAgICBuMXggPSAtYTV4OyBuMXkgPSAtYTV5OyBuMXogPSAtYTV6O1xuICAgICAgICBzMnggPSBkNng7IHMyeSA9IGQ2eTsgczJ6ID0gZDZ6O1xuICAgICAgICBuMnggPSAtYTZ4OyBuMnkgPSAtYTZ5OyBuMnogPSAtYTZ6O1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAobWluSW5kZXggPT0gNCkgey8vIGIyLnkgKiBiMVxuICAgICAgICBzd2FwID0gdHJ1ZTtcbiAgICAgICAgaWYgKCFyaWdodCkge1xuICAgICAgICAgIGN4ID0gcDJ4ICsgZDV4OyBjeSA9IHAyeSArIGQ1eTsgY3ogPSBwMnogKyBkNXo7XG4gICAgICAgICAgbnggPSBhNXg7IG55ID0gYTV5OyBueiA9IGE1ejtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjeCA9IHAyeCAtIGQ1eDsgY3kgPSBwMnkgLSBkNXk7IGN6ID0gcDJ6IC0gZDV6O1xuICAgICAgICAgIG54ID0gLWE1eDsgbnkgPSAtYTV5OyBueiA9IC1hNXo7XG4gICAgICAgIH1cbiAgICAgICAgczF4ID0gZDR4OyBzMXkgPSBkNHk7IHMxeiA9IGQ0ejtcbiAgICAgICAgbjF4ID0gLWE0eDsgbjF5ID0gLWE0eTsgbjF6ID0gLWE0ejtcbiAgICAgICAgczJ4ID0gZDZ4OyBzMnkgPSBkNnk7IHMyeiA9IGQ2ejtcbiAgICAgICAgbjJ4ID0gLWE2eDsgbjJ5ID0gLWE2eTsgbjJ6ID0gLWE2ejtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKG1pbkluZGV4ID09IDUpIHsvLyBiMi56ICogYjFcbiAgICAgICAgc3dhcCA9IHRydWU7XG4gICAgICAgIGlmICghcmlnaHQpIHtcbiAgICAgICAgICBjeCA9IHAyeCArIGQ2eDsgY3kgPSBwMnkgKyBkNnk7IGN6ID0gcDJ6ICsgZDZ6O1xuICAgICAgICAgIG54ID0gYTZ4OyBueSA9IGE2eTsgbnogPSBhNno7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY3ggPSBwMnggLSBkNng7IGN5ID0gcDJ5IC0gZDZ5OyBjeiA9IHAyeiAtIGQ2ejtcbiAgICAgICAgICBueCA9IC1hNng7IG55ID0gLWE2eTsgbnogPSAtYTZ6O1xuICAgICAgICB9XG4gICAgICAgIHMxeCA9IGQ0eDsgczF5ID0gZDR5OyBzMXogPSBkNHo7XG4gICAgICAgIG4xeCA9IC1hNHg7IG4xeSA9IC1hNHk7IG4xeiA9IC1hNHo7XG4gICAgICAgIHMyeCA9IGQ1eDsgczJ5ID0gZDV5OyBzMnogPSBkNXo7XG4gICAgICAgIG4yeCA9IC1hNXg7IG4yeSA9IC1hNXk7IG4yeiA9IC1hNXo7XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChtaW5JbmRleCA9PSA2KSB7Ly8gYjEueCAqIGIyLnhcbiAgICAgICAgbnggPSBhN3g7IG55ID0gYTd5OyBueiA9IGE3ejtcbiAgICAgICAgbjF4ID0gYTF4OyBuMXkgPSBhMXk7IG4xeiA9IGExejtcbiAgICAgICAgbjJ4ID0gYTR4OyBuMnkgPSBhNHk7IG4yeiA9IGE0ejtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKG1pbkluZGV4ID09IDcpIHsvLyBiMS54ICogYjIueVxuICAgICAgICBueCA9IGE4eDsgbnkgPSBhOHk7IG56ID0gYTh6O1xuICAgICAgICBuMXggPSBhMXg7IG4xeSA9IGExeTsgbjF6ID0gYTF6O1xuICAgICAgICBuMnggPSBhNXg7IG4yeSA9IGE1eTsgbjJ6ID0gYTV6O1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAobWluSW5kZXggPT0gOCkgey8vIGIxLnggKiBiMi56XG4gICAgICAgIG54ID0gYTl4OyBueSA9IGE5eTsgbnogPSBhOXo7XG4gICAgICAgIG4xeCA9IGExeDsgbjF5ID0gYTF5OyBuMXogPSBhMXo7XG4gICAgICAgIG4yeCA9IGE2eDsgbjJ5ID0gYTZ5OyBuMnogPSBhNno7XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChtaW5JbmRleCA9PSA5KSB7Ly8gYjEueSAqIGIyLnhcbiAgICAgICAgbnggPSBhYXg7IG55ID0gYWF5OyBueiA9IGFhejtcbiAgICAgICAgbjF4ID0gYTJ4OyBuMXkgPSBhMnk7IG4xeiA9IGEyejtcbiAgICAgICAgbjJ4ID0gYTR4OyBuMnkgPSBhNHk7IG4yeiA9IGE0ejtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKG1pbkluZGV4ID09IDEwKSB7Ly8gYjEueSAqIGIyLnlcbiAgICAgICAgbnggPSBhYng7IG55ID0gYWJ5OyBueiA9IGFiejtcbiAgICAgICAgbjF4ID0gYTJ4OyBuMXkgPSBhMnk7IG4xeiA9IGEyejtcbiAgICAgICAgbjJ4ID0gYTV4OyBuMnkgPSBhNXk7IG4yeiA9IGE1ejtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKG1pbkluZGV4ID09IDExKSB7Ly8gYjEueSAqIGIyLnpcbiAgICAgICAgbnggPSBhY3g7IG55ID0gYWN5OyBueiA9IGFjejtcbiAgICAgICAgbjF4ID0gYTJ4OyBuMXkgPSBhMnk7IG4xeiA9IGEyejtcbiAgICAgICAgbjJ4ID0gYTZ4OyBuMnkgPSBhNnk7IG4yeiA9IGE2ejtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKG1pbkluZGV4ID09IDEyKSB7Ly8gYjEueiAqIGIyLnhcbiAgICAgICAgbnggPSBhZHg7IG55ID0gYWR5OyBueiA9IGFkejtcbiAgICAgICAgbjF4ID0gYTN4OyBuMXkgPSBhM3k7IG4xeiA9IGEzejtcbiAgICAgICAgbjJ4ID0gYTR4OyBuMnkgPSBhNHk7IG4yeiA9IGE0ejtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKG1pbkluZGV4ID09IDEzKSB7Ly8gYjEueiAqIGIyLnlcbiAgICAgICAgbnggPSBhZXg7IG55ID0gYWV5OyBueiA9IGFlejtcbiAgICAgICAgbjF4ID0gYTN4OyBuMXkgPSBhM3k7IG4xeiA9IGEzejtcbiAgICAgICAgbjJ4ID0gYTV4OyBuMnkgPSBhNXk7IG4yeiA9IGE1ejtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKG1pbkluZGV4ID09IDE0KSB7Ly8gYjEueiAqIGIyLnpcbiAgICAgICAgbnggPSBhZng7IG55ID0gYWZ5OyBueiA9IGFmejtcbiAgICAgICAgbjF4ID0gYTN4OyBuMXkgPSBhM3k7IG4xeiA9IGEzejtcbiAgICAgICAgbjJ4ID0gYTZ4OyBuMnkgPSBhNnk7IG4yeiA9IGE2ejtcbiAgICAgIH1cblxuICAgICAgLy9fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19cblxuICAgICAgLy92YXIgdjtcbiAgICAgIGlmIChtaW5JbmRleCA+IDUpIHtcbiAgICAgICAgaWYgKCFyaWdodCkge1xuICAgICAgICAgIG54ID0gLW54OyBueSA9IC1ueTsgbnogPSAtbno7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGRpc3RhbmNlO1xuICAgICAgICB2YXIgbWF4RGlzdGFuY2U7XG4gICAgICAgIHZhciB2eDtcbiAgICAgICAgdmFyIHZ5O1xuICAgICAgICB2YXIgdno7XG4gICAgICAgIHZhciB2MXg7XG4gICAgICAgIHZhciB2MXk7XG4gICAgICAgIHZhciB2MXo7XG4gICAgICAgIHZhciB2Mng7XG4gICAgICAgIHZhciB2Mnk7XG4gICAgICAgIHZhciB2Mno7XG4gICAgICAgIC8vdmVydGV4MTtcbiAgICAgICAgdjF4ID0gVjFbMF07IHYxeSA9IFYxWzFdOyB2MXogPSBWMVsyXTtcbiAgICAgICAgbWF4RGlzdGFuY2UgPSBueCAqIHYxeCArIG55ICogdjF5ICsgbnogKiB2MXo7XG4gICAgICAgIC8vdmVydGV4MjtcbiAgICAgICAgdnggPSBWMVszXTsgdnkgPSBWMVs0XTsgdnogPSBWMVs1XTtcbiAgICAgICAgZGlzdGFuY2UgPSBueCAqIHZ4ICsgbnkgKiB2eSArIG56ICogdno7XG4gICAgICAgIGlmIChkaXN0YW5jZSA+IG1heERpc3RhbmNlKSB7XG4gICAgICAgICAgbWF4RGlzdGFuY2UgPSBkaXN0YW5jZTtcbiAgICAgICAgICB2MXggPSB2eDsgdjF5ID0gdnk7IHYxeiA9IHZ6O1xuICAgICAgICB9XG4gICAgICAgIC8vdmVydGV4MztcbiAgICAgICAgdnggPSBWMVs2XTsgdnkgPSBWMVs3XTsgdnogPSBWMVs4XTtcbiAgICAgICAgZGlzdGFuY2UgPSBueCAqIHZ4ICsgbnkgKiB2eSArIG56ICogdno7XG4gICAgICAgIGlmIChkaXN0YW5jZSA+IG1heERpc3RhbmNlKSB7XG4gICAgICAgICAgbWF4RGlzdGFuY2UgPSBkaXN0YW5jZTtcbiAgICAgICAgICB2MXggPSB2eDsgdjF5ID0gdnk7IHYxeiA9IHZ6O1xuICAgICAgICB9XG4gICAgICAgIC8vdmVydGV4NDtcbiAgICAgICAgdnggPSBWMVs5XTsgdnkgPSBWMVsxMF07IHZ6ID0gVjFbMTFdO1xuICAgICAgICBkaXN0YW5jZSA9IG54ICogdnggKyBueSAqIHZ5ICsgbnogKiB2ejtcbiAgICAgICAgaWYgKGRpc3RhbmNlID4gbWF4RGlzdGFuY2UpIHtcbiAgICAgICAgICBtYXhEaXN0YW5jZSA9IGRpc3RhbmNlO1xuICAgICAgICAgIHYxeCA9IHZ4OyB2MXkgPSB2eTsgdjF6ID0gdno7XG4gICAgICAgIH1cbiAgICAgICAgLy92ZXJ0ZXg1O1xuICAgICAgICB2eCA9IFYxWzEyXTsgdnkgPSBWMVsxM107IHZ6ID0gVjFbMTRdO1xuICAgICAgICBkaXN0YW5jZSA9IG54ICogdnggKyBueSAqIHZ5ICsgbnogKiB2ejtcbiAgICAgICAgaWYgKGRpc3RhbmNlID4gbWF4RGlzdGFuY2UpIHtcbiAgICAgICAgICBtYXhEaXN0YW5jZSA9IGRpc3RhbmNlO1xuICAgICAgICAgIHYxeCA9IHZ4OyB2MXkgPSB2eTsgdjF6ID0gdno7XG4gICAgICAgIH1cbiAgICAgICAgLy92ZXJ0ZXg2O1xuICAgICAgICB2eCA9IFYxWzE1XTsgdnkgPSBWMVsxNl07IHZ6ID0gVjFbMTddO1xuICAgICAgICBkaXN0YW5jZSA9IG54ICogdnggKyBueSAqIHZ5ICsgbnogKiB2ejtcbiAgICAgICAgaWYgKGRpc3RhbmNlID4gbWF4RGlzdGFuY2UpIHtcbiAgICAgICAgICBtYXhEaXN0YW5jZSA9IGRpc3RhbmNlO1xuICAgICAgICAgIHYxeCA9IHZ4OyB2MXkgPSB2eTsgdjF6ID0gdno7XG4gICAgICAgIH1cbiAgICAgICAgLy92ZXJ0ZXg3O1xuICAgICAgICB2eCA9IFYxWzE4XTsgdnkgPSBWMVsxOV07IHZ6ID0gVjFbMjBdO1xuICAgICAgICBkaXN0YW5jZSA9IG54ICogdnggKyBueSAqIHZ5ICsgbnogKiB2ejtcbiAgICAgICAgaWYgKGRpc3RhbmNlID4gbWF4RGlzdGFuY2UpIHtcbiAgICAgICAgICBtYXhEaXN0YW5jZSA9IGRpc3RhbmNlO1xuICAgICAgICAgIHYxeCA9IHZ4OyB2MXkgPSB2eTsgdjF6ID0gdno7XG4gICAgICAgIH1cbiAgICAgICAgLy92ZXJ0ZXg4O1xuICAgICAgICB2eCA9IFYxWzIxXTsgdnkgPSBWMVsyMl07IHZ6ID0gVjFbMjNdO1xuICAgICAgICBkaXN0YW5jZSA9IG54ICogdnggKyBueSAqIHZ5ICsgbnogKiB2ejtcbiAgICAgICAgaWYgKGRpc3RhbmNlID4gbWF4RGlzdGFuY2UpIHtcbiAgICAgICAgICBtYXhEaXN0YW5jZSA9IGRpc3RhbmNlO1xuICAgICAgICAgIHYxeCA9IHZ4OyB2MXkgPSB2eTsgdjF6ID0gdno7XG4gICAgICAgIH1cbiAgICAgICAgLy92ZXJ0ZXgxO1xuICAgICAgICB2MnggPSBWMlswXTsgdjJ5ID0gVjJbMV07IHYyeiA9IFYyWzJdO1xuICAgICAgICBtYXhEaXN0YW5jZSA9IG54ICogdjJ4ICsgbnkgKiB2MnkgKyBueiAqIHYyejtcbiAgICAgICAgLy92ZXJ0ZXgyO1xuICAgICAgICB2eCA9IFYyWzNdOyB2eSA9IFYyWzRdOyB2eiA9IFYyWzVdO1xuICAgICAgICBkaXN0YW5jZSA9IG54ICogdnggKyBueSAqIHZ5ICsgbnogKiB2ejtcbiAgICAgICAgaWYgKGRpc3RhbmNlIDwgbWF4RGlzdGFuY2UpIHtcbiAgICAgICAgICBtYXhEaXN0YW5jZSA9IGRpc3RhbmNlO1xuICAgICAgICAgIHYyeCA9IHZ4OyB2MnkgPSB2eTsgdjJ6ID0gdno7XG4gICAgICAgIH1cbiAgICAgICAgLy92ZXJ0ZXgzO1xuICAgICAgICB2eCA9IFYyWzZdOyB2eSA9IFYyWzddOyB2eiA9IFYyWzhdO1xuICAgICAgICBkaXN0YW5jZSA9IG54ICogdnggKyBueSAqIHZ5ICsgbnogKiB2ejtcbiAgICAgICAgaWYgKGRpc3RhbmNlIDwgbWF4RGlzdGFuY2UpIHtcbiAgICAgICAgICBtYXhEaXN0YW5jZSA9IGRpc3RhbmNlO1xuICAgICAgICAgIHYyeCA9IHZ4OyB2MnkgPSB2eTsgdjJ6ID0gdno7XG4gICAgICAgIH1cbiAgICAgICAgLy92ZXJ0ZXg0O1xuICAgICAgICB2eCA9IFYyWzldOyB2eSA9IFYyWzEwXTsgdnogPSBWMlsxMV07XG4gICAgICAgIGRpc3RhbmNlID0gbnggKiB2eCArIG55ICogdnkgKyBueiAqIHZ6O1xuICAgICAgICBpZiAoZGlzdGFuY2UgPCBtYXhEaXN0YW5jZSkge1xuICAgICAgICAgIG1heERpc3RhbmNlID0gZGlzdGFuY2U7XG4gICAgICAgICAgdjJ4ID0gdng7IHYyeSA9IHZ5OyB2MnogPSB2ejtcbiAgICAgICAgfVxuICAgICAgICAvL3ZlcnRleDU7XG4gICAgICAgIHZ4ID0gVjJbMTJdOyB2eSA9IFYyWzEzXTsgdnogPSBWMlsxNF07XG4gICAgICAgIGRpc3RhbmNlID0gbnggKiB2eCArIG55ICogdnkgKyBueiAqIHZ6O1xuICAgICAgICBpZiAoZGlzdGFuY2UgPCBtYXhEaXN0YW5jZSkge1xuICAgICAgICAgIG1heERpc3RhbmNlID0gZGlzdGFuY2U7XG4gICAgICAgICAgdjJ4ID0gdng7IHYyeSA9IHZ5OyB2MnogPSB2ejtcbiAgICAgICAgfVxuICAgICAgICAvL3ZlcnRleDY7XG4gICAgICAgIHZ4ID0gVjJbMTVdOyB2eSA9IFYyWzE2XTsgdnogPSBWMlsxN107XG4gICAgICAgIGRpc3RhbmNlID0gbnggKiB2eCArIG55ICogdnkgKyBueiAqIHZ6O1xuICAgICAgICBpZiAoZGlzdGFuY2UgPCBtYXhEaXN0YW5jZSkge1xuICAgICAgICAgIG1heERpc3RhbmNlID0gZGlzdGFuY2U7XG4gICAgICAgICAgdjJ4ID0gdng7IHYyeSA9IHZ5OyB2MnogPSB2ejtcbiAgICAgICAgfVxuICAgICAgICAvL3ZlcnRleDc7XG4gICAgICAgIHZ4ID0gVjJbMThdOyB2eSA9IFYyWzE5XTsgdnogPSBWMlsyMF07XG4gICAgICAgIGRpc3RhbmNlID0gbnggKiB2eCArIG55ICogdnkgKyBueiAqIHZ6O1xuICAgICAgICBpZiAoZGlzdGFuY2UgPCBtYXhEaXN0YW5jZSkge1xuICAgICAgICAgIG1heERpc3RhbmNlID0gZGlzdGFuY2U7XG4gICAgICAgICAgdjJ4ID0gdng7IHYyeSA9IHZ5OyB2MnogPSB2ejtcbiAgICAgICAgfVxuICAgICAgICAvL3ZlcnRleDg7XG4gICAgICAgIHZ4ID0gVjJbMjFdOyB2eSA9IFYyWzIyXTsgdnogPSBWMlsyM107XG4gICAgICAgIGRpc3RhbmNlID0gbnggKiB2eCArIG55ICogdnkgKyBueiAqIHZ6O1xuICAgICAgICBpZiAoZGlzdGFuY2UgPCBtYXhEaXN0YW5jZSkge1xuICAgICAgICAgIG1heERpc3RhbmNlID0gZGlzdGFuY2U7XG4gICAgICAgICAgdjJ4ID0gdng7IHYyeSA9IHZ5OyB2MnogPSB2ejtcbiAgICAgICAgfVxuICAgICAgICB2eCA9IHYyeCAtIHYxeDsgdnkgPSB2MnkgLSB2MXk7IHZ6ID0gdjJ6IC0gdjF6O1xuICAgICAgICBkb3QxID0gbjF4ICogbjJ4ICsgbjF5ICogbjJ5ICsgbjF6ICogbjJ6O1xuICAgICAgICB2YXIgdCA9ICh2eCAqIChuMXggLSBuMnggKiBkb3QxKSArIHZ5ICogKG4xeSAtIG4yeSAqIGRvdDEpICsgdnogKiAobjF6IC0gbjJ6ICogZG90MSkpIC8gKDEgLSBkb3QxICogZG90MSk7XG4gICAgICAgIG1hbmlmb2xkLmFkZFBvaW50KHYxeCArIG4xeCAqIHQgKyBueCAqIGRlcHRoICogMC41LCB2MXkgKyBuMXkgKiB0ICsgbnkgKiBkZXB0aCAqIDAuNSwgdjF6ICsgbjF6ICogdCArIG56ICogZGVwdGggKiAwLjUsIG54LCBueSwgbnosIGRlcHRoLCBmYWxzZSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIC8vIG5vdyBkZXRlY3QgZmFjZS1mYWNlIGNvbGxpc2lvbi4uLlxuICAgICAgLy8gdGFyZ2V0IHF1YWRcbiAgICAgIHZhciBxMXg7XG4gICAgICB2YXIgcTF5O1xuICAgICAgdmFyIHExejtcbiAgICAgIHZhciBxMng7XG4gICAgICB2YXIgcTJ5O1xuICAgICAgdmFyIHEyejtcbiAgICAgIHZhciBxM3g7XG4gICAgICB2YXIgcTN5O1xuICAgICAgdmFyIHEzejtcbiAgICAgIHZhciBxNHg7XG4gICAgICB2YXIgcTR5O1xuICAgICAgdmFyIHE0ejtcbiAgICAgIC8vIHNlYXJjaCBzdXBwb3J0IGZhY2UgYW5kIHZlcnRleFxuICAgICAgdmFyIG1pbkRvdCA9IDE7XG4gICAgICB2YXIgZG90ID0gMDtcbiAgICAgIHZhciBtaW5Eb3RJbmRleCA9IDA7XG4gICAgICBpZiAoc3dhcCkge1xuICAgICAgICBkb3QgPSBhMXggKiBueCArIGExeSAqIG55ICsgYTF6ICogbno7XG4gICAgICAgIGlmIChkb3QgPCBtaW5Eb3QpIHtcbiAgICAgICAgICBtaW5Eb3QgPSBkb3Q7XG4gICAgICAgICAgbWluRG90SW5kZXggPSAwO1xuICAgICAgICB9XG4gICAgICAgIGlmICgtZG90IDwgbWluRG90KSB7XG4gICAgICAgICAgbWluRG90ID0gLWRvdDtcbiAgICAgICAgICBtaW5Eb3RJbmRleCA9IDE7XG4gICAgICAgIH1cbiAgICAgICAgZG90ID0gYTJ4ICogbnggKyBhMnkgKiBueSArIGEyeiAqIG56O1xuICAgICAgICBpZiAoZG90IDwgbWluRG90KSB7XG4gICAgICAgICAgbWluRG90ID0gZG90O1xuICAgICAgICAgIG1pbkRvdEluZGV4ID0gMjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoLWRvdCA8IG1pbkRvdCkge1xuICAgICAgICAgIG1pbkRvdCA9IC1kb3Q7XG4gICAgICAgICAgbWluRG90SW5kZXggPSAzO1xuICAgICAgICB9XG4gICAgICAgIGRvdCA9IGEzeCAqIG54ICsgYTN5ICogbnkgKyBhM3ogKiBuejtcbiAgICAgICAgaWYgKGRvdCA8IG1pbkRvdCkge1xuICAgICAgICAgIG1pbkRvdCA9IGRvdDtcbiAgICAgICAgICBtaW5Eb3RJbmRleCA9IDQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKC1kb3QgPCBtaW5Eb3QpIHtcbiAgICAgICAgICBtaW5Eb3QgPSAtZG90O1xuICAgICAgICAgIG1pbkRvdEluZGV4ID0gNTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChtaW5Eb3RJbmRleCA9PSAwKSB7Ly8geCsgZmFjZVxuICAgICAgICAgIHExeCA9IFYxWzBdOyBxMXkgPSBWMVsxXTsgcTF6ID0gVjFbMl07Ly92ZXJ0ZXgxXG4gICAgICAgICAgcTJ4ID0gVjFbNl07IHEyeSA9IFYxWzddOyBxMnogPSBWMVs4XTsvL3ZlcnRleDNcbiAgICAgICAgICBxM3ggPSBWMVs5XTsgcTN5ID0gVjFbMTBdOyBxM3ogPSBWMVsxMV07Ly92ZXJ0ZXg0XG4gICAgICAgICAgcTR4ID0gVjFbM107IHE0eSA9IFYxWzRdOyBxNHogPSBWMVs1XTsvL3ZlcnRleDJcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChtaW5Eb3RJbmRleCA9PSAxKSB7Ly8geC0gZmFjZVxuICAgICAgICAgIHExeCA9IFYxWzE1XTsgcTF5ID0gVjFbMTZdOyBxMXogPSBWMVsxN107Ly92ZXJ0ZXg2XG4gICAgICAgICAgcTJ4ID0gVjFbMjFdOyBxMnkgPSBWMVsyMl07IHEyeiA9IFYxWzIzXTsvL3ZlcnRleDhcbiAgICAgICAgICBxM3ggPSBWMVsxOF07IHEzeSA9IFYxWzE5XTsgcTN6ID0gVjFbMjBdOy8vdmVydGV4N1xuICAgICAgICAgIHE0eCA9IFYxWzEyXTsgcTR5ID0gVjFbMTNdOyBxNHogPSBWMVsxNF07Ly92ZXJ0ZXg1XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAobWluRG90SW5kZXggPT0gMikgey8vIHkrIGZhY2VcbiAgICAgICAgICBxMXggPSBWMVsxMl07IHExeSA9IFYxWzEzXTsgcTF6ID0gVjFbMTRdOy8vdmVydGV4NVxuICAgICAgICAgIHEyeCA9IFYxWzBdOyBxMnkgPSBWMVsxXTsgcTJ6ID0gVjFbMl07Ly92ZXJ0ZXgxXG4gICAgICAgICAgcTN4ID0gVjFbM107IHEzeSA9IFYxWzRdOyBxM3ogPSBWMVs1XTsvL3ZlcnRleDJcbiAgICAgICAgICBxNHggPSBWMVsxNV07IHE0eSA9IFYxWzE2XTsgcTR6ID0gVjFbMTddOy8vdmVydGV4NlxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG1pbkRvdEluZGV4ID09IDMpIHsvLyB5LSBmYWNlXG4gICAgICAgICAgcTF4ID0gVjFbMjFdOyBxMXkgPSBWMVsyMl07IHExeiA9IFYxWzIzXTsvL3ZlcnRleDhcbiAgICAgICAgICBxMnggPSBWMVs5XTsgcTJ5ID0gVjFbMTBdOyBxMnogPSBWMVsxMV07Ly92ZXJ0ZXg0XG4gICAgICAgICAgcTN4ID0gVjFbNl07IHEzeSA9IFYxWzddOyBxM3ogPSBWMVs4XTsvL3ZlcnRleDNcbiAgICAgICAgICBxNHggPSBWMVsxOF07IHE0eSA9IFYxWzE5XTsgcTR6ID0gVjFbMjBdOy8vdmVydGV4N1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG1pbkRvdEluZGV4ID09IDQpIHsvLyB6KyBmYWNlXG4gICAgICAgICAgcTF4ID0gVjFbMTJdOyBxMXkgPSBWMVsxM107IHExeiA9IFYxWzE0XTsvL3ZlcnRleDVcbiAgICAgICAgICBxMnggPSBWMVsxOF07IHEyeSA9IFYxWzE5XTsgcTJ6ID0gVjFbMjBdOy8vdmVydGV4N1xuICAgICAgICAgIHEzeCA9IFYxWzZdOyBxM3kgPSBWMVs3XTsgcTN6ID0gVjFbOF07Ly92ZXJ0ZXgzXG4gICAgICAgICAgcTR4ID0gVjFbMF07IHE0eSA9IFYxWzFdOyBxNHogPSBWMVsyXTsvL3ZlcnRleDFcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChtaW5Eb3RJbmRleCA9PSA1KSB7Ly8gei0gZmFjZVxuICAgICAgICAgIHExeCA9IFYxWzNdOyBxMXkgPSBWMVs0XTsgcTF6ID0gVjFbNV07Ly92ZXJ0ZXgyXG4gICAgICAgICAgLy8yeD1WMVs2XTsgcTJ5PVYxWzddOyBxMno9VjFbOF07Ly92ZXJ0ZXg0ICEhIVxuICAgICAgICAgIHEyeCA9IFYyWzldOyBxMnkgPSBWMlsxMF07IHEyeiA9IFYyWzExXTsvL3ZlcnRleDRcbiAgICAgICAgICBxM3ggPSBWMVsyMV07IHEzeSA9IFYxWzIyXTsgcTN6ID0gVjFbMjNdOy8vdmVydGV4OFxuICAgICAgICAgIHE0eCA9IFYxWzE1XTsgcTR5ID0gVjFbMTZdOyBxNHogPSBWMVsxN107Ly92ZXJ0ZXg2XG4gICAgICAgIH1cblxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZG90ID0gYTR4ICogbnggKyBhNHkgKiBueSArIGE0eiAqIG56O1xuICAgICAgICBpZiAoZG90IDwgbWluRG90KSB7XG4gICAgICAgICAgbWluRG90ID0gZG90O1xuICAgICAgICAgIG1pbkRvdEluZGV4ID0gMDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoLWRvdCA8IG1pbkRvdCkge1xuICAgICAgICAgIG1pbkRvdCA9IC1kb3Q7XG4gICAgICAgICAgbWluRG90SW5kZXggPSAxO1xuICAgICAgICB9XG4gICAgICAgIGRvdCA9IGE1eCAqIG54ICsgYTV5ICogbnkgKyBhNXogKiBuejtcbiAgICAgICAgaWYgKGRvdCA8IG1pbkRvdCkge1xuICAgICAgICAgIG1pbkRvdCA9IGRvdDtcbiAgICAgICAgICBtaW5Eb3RJbmRleCA9IDI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKC1kb3QgPCBtaW5Eb3QpIHtcbiAgICAgICAgICBtaW5Eb3QgPSAtZG90O1xuICAgICAgICAgIG1pbkRvdEluZGV4ID0gMztcbiAgICAgICAgfVxuICAgICAgICBkb3QgPSBhNnggKiBueCArIGE2eSAqIG55ICsgYTZ6ICogbno7XG4gICAgICAgIGlmIChkb3QgPCBtaW5Eb3QpIHtcbiAgICAgICAgICBtaW5Eb3QgPSBkb3Q7XG4gICAgICAgICAgbWluRG90SW5kZXggPSA0O1xuICAgICAgICB9XG4gICAgICAgIGlmICgtZG90IDwgbWluRG90KSB7XG4gICAgICAgICAgbWluRG90ID0gLWRvdDtcbiAgICAgICAgICBtaW5Eb3RJbmRleCA9IDU7XG4gICAgICAgIH1cblxuICAgICAgICAvL19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX1xuXG4gICAgICAgIGlmIChtaW5Eb3RJbmRleCA9PSAwKSB7Ly8geCsgZmFjZVxuICAgICAgICAgIHExeCA9IFYyWzBdOyBxMXkgPSBWMlsxXTsgcTF6ID0gVjJbMl07Ly92ZXJ0ZXgxXG4gICAgICAgICAgcTJ4ID0gVjJbNl07IHEyeSA9IFYyWzddOyBxMnogPSBWMls4XTsvL3ZlcnRleDNcbiAgICAgICAgICBxM3ggPSBWMls5XTsgcTN5ID0gVjJbMTBdOyBxM3ogPSBWMlsxMV07Ly92ZXJ0ZXg0XG4gICAgICAgICAgcTR4ID0gVjJbM107IHE0eSA9IFYyWzRdOyBxNHogPSBWMls1XTsvL3ZlcnRleDJcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChtaW5Eb3RJbmRleCA9PSAxKSB7Ly8geC0gZmFjZVxuICAgICAgICAgIHExeCA9IFYyWzE1XTsgcTF5ID0gVjJbMTZdOyBxMXogPSBWMlsxN107Ly92ZXJ0ZXg2XG4gICAgICAgICAgcTJ4ID0gVjJbMjFdOyBxMnkgPSBWMlsyMl07IHEyeiA9IFYyWzIzXTsgLy92ZXJ0ZXg4XG4gICAgICAgICAgcTN4ID0gVjJbMThdOyBxM3kgPSBWMlsxOV07IHEzeiA9IFYyWzIwXTsvL3ZlcnRleDdcbiAgICAgICAgICBxNHggPSBWMlsxMl07IHE0eSA9IFYyWzEzXTsgcTR6ID0gVjJbMTRdOy8vdmVydGV4NVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG1pbkRvdEluZGV4ID09IDIpIHsvLyB5KyBmYWNlXG4gICAgICAgICAgcTF4ID0gVjJbMTJdOyBxMXkgPSBWMlsxM107IHExeiA9IFYyWzE0XTsvL3ZlcnRleDVcbiAgICAgICAgICBxMnggPSBWMlswXTsgcTJ5ID0gVjJbMV07IHEyeiA9IFYyWzJdOy8vdmVydGV4MVxuICAgICAgICAgIHEzeCA9IFYyWzNdOyBxM3kgPSBWMls0XTsgcTN6ID0gVjJbNV07Ly92ZXJ0ZXgyXG4gICAgICAgICAgcTR4ID0gVjJbMTVdOyBxNHkgPSBWMlsxNl07IHE0eiA9IFYyWzE3XTsvL3ZlcnRleDZcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChtaW5Eb3RJbmRleCA9PSAzKSB7Ly8geS0gZmFjZVxuICAgICAgICAgIHExeCA9IFYyWzIxXTsgcTF5ID0gVjJbMjJdOyBxMXogPSBWMlsyM107Ly92ZXJ0ZXg4XG4gICAgICAgICAgcTJ4ID0gVjJbOV07IHEyeSA9IFYyWzEwXTsgcTJ6ID0gVjJbMTFdOy8vdmVydGV4NFxuICAgICAgICAgIHEzeCA9IFYyWzZdOyBxM3kgPSBWMls3XTsgcTN6ID0gVjJbOF07Ly92ZXJ0ZXgzXG4gICAgICAgICAgcTR4ID0gVjJbMThdOyBxNHkgPSBWMlsxOV07IHE0eiA9IFYyWzIwXTsvL3ZlcnRleDdcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChtaW5Eb3RJbmRleCA9PSA0KSB7Ly8geisgZmFjZVxuICAgICAgICAgIHExeCA9IFYyWzEyXTsgcTF5ID0gVjJbMTNdOyBxMXogPSBWMlsxNF07Ly92ZXJ0ZXg1XG4gICAgICAgICAgcTJ4ID0gVjJbMThdOyBxMnkgPSBWMlsxOV07IHEyeiA9IFYyWzIwXTsvL3ZlcnRleDdcbiAgICAgICAgICBxM3ggPSBWMls2XTsgcTN5ID0gVjJbN107IHEzeiA9IFYyWzhdOy8vdmVydGV4M1xuICAgICAgICAgIHE0eCA9IFYyWzBdOyBxNHkgPSBWMlsxXTsgcTR6ID0gVjJbMl07Ly92ZXJ0ZXgxXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAobWluRG90SW5kZXggPT0gNSkgey8vIHotIGZhY2VcbiAgICAgICAgICBxMXggPSBWMlszXTsgcTF5ID0gVjJbNF07IHExeiA9IFYyWzVdOy8vdmVydGV4MlxuICAgICAgICAgIHEyeCA9IFYyWzldOyBxMnkgPSBWMlsxMF07IHEyeiA9IFYyWzExXTsvL3ZlcnRleDRcbiAgICAgICAgICBxM3ggPSBWMlsyMV07IHEzeSA9IFYyWzIyXTsgcTN6ID0gVjJbMjNdOy8vdmVydGV4OFxuICAgICAgICAgIHE0eCA9IFYyWzE1XTsgcTR5ID0gVjJbMTZdOyBxNHogPSBWMlsxN107Ly92ZXJ0ZXg2XG4gICAgICAgIH1cblxuICAgICAgfVxuICAgICAgLy8gY2xpcCB2ZXJ0aWNlc1xuICAgICAgdmFyIG51bUNsaXBWZXJ0aWNlcztcbiAgICAgIHZhciBudW1BZGRlZENsaXBWZXJ0aWNlcztcbiAgICAgIHZhciBpbmRleDtcbiAgICAgIHZhciB4MTtcbiAgICAgIHZhciB5MTtcbiAgICAgIHZhciB6MTtcbiAgICAgIHZhciB4MjtcbiAgICAgIHZhciB5MjtcbiAgICAgIHZhciB6MjtcbiAgICAgIHRoaXMuY2xpcFZlcnRpY2VzMVswXSA9IHExeDtcbiAgICAgIHRoaXMuY2xpcFZlcnRpY2VzMVsxXSA9IHExeTtcbiAgICAgIHRoaXMuY2xpcFZlcnRpY2VzMVsyXSA9IHExejtcbiAgICAgIHRoaXMuY2xpcFZlcnRpY2VzMVszXSA9IHEyeDtcbiAgICAgIHRoaXMuY2xpcFZlcnRpY2VzMVs0XSA9IHEyeTtcbiAgICAgIHRoaXMuY2xpcFZlcnRpY2VzMVs1XSA9IHEyejtcbiAgICAgIHRoaXMuY2xpcFZlcnRpY2VzMVs2XSA9IHEzeDtcbiAgICAgIHRoaXMuY2xpcFZlcnRpY2VzMVs3XSA9IHEzeTtcbiAgICAgIHRoaXMuY2xpcFZlcnRpY2VzMVs4XSA9IHEzejtcbiAgICAgIHRoaXMuY2xpcFZlcnRpY2VzMVs5XSA9IHE0eDtcbiAgICAgIHRoaXMuY2xpcFZlcnRpY2VzMVsxMF0gPSBxNHk7XG4gICAgICB0aGlzLmNsaXBWZXJ0aWNlczFbMTFdID0gcTR6O1xuICAgICAgbnVtQWRkZWRDbGlwVmVydGljZXMgPSAwO1xuICAgICAgeDEgPSB0aGlzLmNsaXBWZXJ0aWNlczFbOV07XG4gICAgICB5MSA9IHRoaXMuY2xpcFZlcnRpY2VzMVsxMF07XG4gICAgICB6MSA9IHRoaXMuY2xpcFZlcnRpY2VzMVsxMV07XG4gICAgICBkb3QxID0gKHgxIC0gY3ggLSBzMXgpICogbjF4ICsgKHkxIC0gY3kgLSBzMXkpICogbjF5ICsgKHoxIC0gY3ogLSBzMXopICogbjF6O1xuXG4gICAgICAvL3ZhciBpID0gNDtcbiAgICAgIC8vd2hpbGUoaS0tKXtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNDsgaSsrKSB7XG4gICAgICAgIGluZGV4ID0gaSAqIDM7XG4gICAgICAgIHgyID0gdGhpcy5jbGlwVmVydGljZXMxW2luZGV4XTtcbiAgICAgICAgeTIgPSB0aGlzLmNsaXBWZXJ0aWNlczFbaW5kZXggKyAxXTtcbiAgICAgICAgejIgPSB0aGlzLmNsaXBWZXJ0aWNlczFbaW5kZXggKyAyXTtcbiAgICAgICAgZG90MiA9ICh4MiAtIGN4IC0gczF4KSAqIG4xeCArICh5MiAtIGN5IC0gczF5KSAqIG4xeSArICh6MiAtIGN6IC0gczF6KSAqIG4xejtcbiAgICAgICAgaWYgKGRvdDEgPiAwKSB7XG4gICAgICAgICAgaWYgKGRvdDIgPiAwKSB7XG4gICAgICAgICAgICBpbmRleCA9IG51bUFkZGVkQ2xpcFZlcnRpY2VzICogMztcbiAgICAgICAgICAgIG51bUFkZGVkQ2xpcFZlcnRpY2VzKys7XG4gICAgICAgICAgICB0aGlzLmNsaXBWZXJ0aWNlczJbaW5kZXhdID0geDI7XG4gICAgICAgICAgICB0aGlzLmNsaXBWZXJ0aWNlczJbaW5kZXggKyAxXSA9IHkyO1xuICAgICAgICAgICAgdGhpcy5jbGlwVmVydGljZXMyW2luZGV4ICsgMl0gPSB6MjtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaW5kZXggPSBudW1BZGRlZENsaXBWZXJ0aWNlcyAqIDM7XG4gICAgICAgICAgICBudW1BZGRlZENsaXBWZXJ0aWNlcysrO1xuICAgICAgICAgICAgdCA9IGRvdDEgLyAoZG90MSAtIGRvdDIpO1xuICAgICAgICAgICAgdGhpcy5jbGlwVmVydGljZXMyW2luZGV4XSA9IHgxICsgKHgyIC0geDEpICogdDtcbiAgICAgICAgICAgIHRoaXMuY2xpcFZlcnRpY2VzMltpbmRleCArIDFdID0geTEgKyAoeTIgLSB5MSkgKiB0O1xuICAgICAgICAgICAgdGhpcy5jbGlwVmVydGljZXMyW2luZGV4ICsgMl0gPSB6MSArICh6MiAtIHoxKSAqIHQ7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChkb3QyID4gMCkge1xuICAgICAgICAgICAgaW5kZXggPSBudW1BZGRlZENsaXBWZXJ0aWNlcyAqIDM7XG4gICAgICAgICAgICBudW1BZGRlZENsaXBWZXJ0aWNlcysrO1xuICAgICAgICAgICAgdCA9IGRvdDEgLyAoZG90MSAtIGRvdDIpO1xuICAgICAgICAgICAgdGhpcy5jbGlwVmVydGljZXMyW2luZGV4XSA9IHgxICsgKHgyIC0geDEpICogdDtcbiAgICAgICAgICAgIHRoaXMuY2xpcFZlcnRpY2VzMltpbmRleCArIDFdID0geTEgKyAoeTIgLSB5MSkgKiB0O1xuICAgICAgICAgICAgdGhpcy5jbGlwVmVydGljZXMyW2luZGV4ICsgMl0gPSB6MSArICh6MiAtIHoxKSAqIHQ7XG4gICAgICAgICAgICBpbmRleCA9IG51bUFkZGVkQ2xpcFZlcnRpY2VzICogMztcbiAgICAgICAgICAgIG51bUFkZGVkQ2xpcFZlcnRpY2VzKys7XG4gICAgICAgICAgICB0aGlzLmNsaXBWZXJ0aWNlczJbaW5kZXhdID0geDI7XG4gICAgICAgICAgICB0aGlzLmNsaXBWZXJ0aWNlczJbaW5kZXggKyAxXSA9IHkyO1xuICAgICAgICAgICAgdGhpcy5jbGlwVmVydGljZXMyW2luZGV4ICsgMl0gPSB6MjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgeDEgPSB4MjtcbiAgICAgICAgeTEgPSB5MjtcbiAgICAgICAgejEgPSB6MjtcbiAgICAgICAgZG90MSA9IGRvdDI7XG4gICAgICB9XG5cbiAgICAgIG51bUNsaXBWZXJ0aWNlcyA9IG51bUFkZGVkQ2xpcFZlcnRpY2VzO1xuICAgICAgaWYgKG51bUNsaXBWZXJ0aWNlcyA9PSAwKSByZXR1cm47XG4gICAgICBudW1BZGRlZENsaXBWZXJ0aWNlcyA9IDA7XG4gICAgICBpbmRleCA9IChudW1DbGlwVmVydGljZXMgLSAxKSAqIDM7XG4gICAgICB4MSA9IHRoaXMuY2xpcFZlcnRpY2VzMltpbmRleF07XG4gICAgICB5MSA9IHRoaXMuY2xpcFZlcnRpY2VzMltpbmRleCArIDFdO1xuICAgICAgejEgPSB0aGlzLmNsaXBWZXJ0aWNlczJbaW5kZXggKyAyXTtcbiAgICAgIGRvdDEgPSAoeDEgLSBjeCAtIHMyeCkgKiBuMnggKyAoeTEgLSBjeSAtIHMyeSkgKiBuMnkgKyAoejEgLSBjeiAtIHMyeikgKiBuMno7XG5cbiAgICAgIC8vaSA9IG51bUNsaXBWZXJ0aWNlcztcbiAgICAgIC8vd2hpbGUoaS0tKXtcbiAgICAgIGZvciAoaSA9IDA7IGkgPCBudW1DbGlwVmVydGljZXM7IGkrKykge1xuICAgICAgICBpbmRleCA9IGkgKiAzO1xuICAgICAgICB4MiA9IHRoaXMuY2xpcFZlcnRpY2VzMltpbmRleF07XG4gICAgICAgIHkyID0gdGhpcy5jbGlwVmVydGljZXMyW2luZGV4ICsgMV07XG4gICAgICAgIHoyID0gdGhpcy5jbGlwVmVydGljZXMyW2luZGV4ICsgMl07XG4gICAgICAgIGRvdDIgPSAoeDIgLSBjeCAtIHMyeCkgKiBuMnggKyAoeTIgLSBjeSAtIHMyeSkgKiBuMnkgKyAoejIgLSBjeiAtIHMyeikgKiBuMno7XG4gICAgICAgIGlmIChkb3QxID4gMCkge1xuICAgICAgICAgIGlmIChkb3QyID4gMCkge1xuICAgICAgICAgICAgaW5kZXggPSBudW1BZGRlZENsaXBWZXJ0aWNlcyAqIDM7XG4gICAgICAgICAgICBudW1BZGRlZENsaXBWZXJ0aWNlcysrO1xuICAgICAgICAgICAgdGhpcy5jbGlwVmVydGljZXMxW2luZGV4XSA9IHgyO1xuICAgICAgICAgICAgdGhpcy5jbGlwVmVydGljZXMxW2luZGV4ICsgMV0gPSB5MjtcbiAgICAgICAgICAgIHRoaXMuY2xpcFZlcnRpY2VzMVtpbmRleCArIDJdID0gejI7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGluZGV4ID0gbnVtQWRkZWRDbGlwVmVydGljZXMgKiAzO1xuICAgICAgICAgICAgbnVtQWRkZWRDbGlwVmVydGljZXMrKztcbiAgICAgICAgICAgIHQgPSBkb3QxIC8gKGRvdDEgLSBkb3QyKTtcbiAgICAgICAgICAgIHRoaXMuY2xpcFZlcnRpY2VzMVtpbmRleF0gPSB4MSArICh4MiAtIHgxKSAqIHQ7XG4gICAgICAgICAgICB0aGlzLmNsaXBWZXJ0aWNlczFbaW5kZXggKyAxXSA9IHkxICsgKHkyIC0geTEpICogdDtcbiAgICAgICAgICAgIHRoaXMuY2xpcFZlcnRpY2VzMVtpbmRleCArIDJdID0gejEgKyAoejIgLSB6MSkgKiB0O1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoZG90MiA+IDApIHtcbiAgICAgICAgICAgIGluZGV4ID0gbnVtQWRkZWRDbGlwVmVydGljZXMgKiAzO1xuICAgICAgICAgICAgbnVtQWRkZWRDbGlwVmVydGljZXMrKztcbiAgICAgICAgICAgIHQgPSBkb3QxIC8gKGRvdDEgLSBkb3QyKTtcbiAgICAgICAgICAgIHRoaXMuY2xpcFZlcnRpY2VzMVtpbmRleF0gPSB4MSArICh4MiAtIHgxKSAqIHQ7XG4gICAgICAgICAgICB0aGlzLmNsaXBWZXJ0aWNlczFbaW5kZXggKyAxXSA9IHkxICsgKHkyIC0geTEpICogdDtcbiAgICAgICAgICAgIHRoaXMuY2xpcFZlcnRpY2VzMVtpbmRleCArIDJdID0gejEgKyAoejIgLSB6MSkgKiB0O1xuICAgICAgICAgICAgaW5kZXggPSBudW1BZGRlZENsaXBWZXJ0aWNlcyAqIDM7XG4gICAgICAgICAgICBudW1BZGRlZENsaXBWZXJ0aWNlcysrO1xuICAgICAgICAgICAgdGhpcy5jbGlwVmVydGljZXMxW2luZGV4XSA9IHgyO1xuICAgICAgICAgICAgdGhpcy5jbGlwVmVydGljZXMxW2luZGV4ICsgMV0gPSB5MjtcbiAgICAgICAgICAgIHRoaXMuY2xpcFZlcnRpY2VzMVtpbmRleCArIDJdID0gejI7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHgxID0geDI7XG4gICAgICAgIHkxID0geTI7XG4gICAgICAgIHoxID0gejI7XG4gICAgICAgIGRvdDEgPSBkb3QyO1xuICAgICAgfVxuXG4gICAgICBudW1DbGlwVmVydGljZXMgPSBudW1BZGRlZENsaXBWZXJ0aWNlcztcbiAgICAgIGlmIChudW1DbGlwVmVydGljZXMgPT0gMCkgcmV0dXJuO1xuICAgICAgbnVtQWRkZWRDbGlwVmVydGljZXMgPSAwO1xuICAgICAgaW5kZXggPSAobnVtQ2xpcFZlcnRpY2VzIC0gMSkgKiAzO1xuICAgICAgeDEgPSB0aGlzLmNsaXBWZXJ0aWNlczFbaW5kZXhdO1xuICAgICAgeTEgPSB0aGlzLmNsaXBWZXJ0aWNlczFbaW5kZXggKyAxXTtcbiAgICAgIHoxID0gdGhpcy5jbGlwVmVydGljZXMxW2luZGV4ICsgMl07XG4gICAgICBkb3QxID0gKHgxIC0gY3ggKyBzMXgpICogLW4xeCArICh5MSAtIGN5ICsgczF5KSAqIC1uMXkgKyAoejEgLSBjeiArIHMxeikgKiAtbjF6O1xuXG4gICAgICAvL2kgPSBudW1DbGlwVmVydGljZXM7XG4gICAgICAvL3doaWxlKGktLSl7XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgbnVtQ2xpcFZlcnRpY2VzOyBpKyspIHtcbiAgICAgICAgaW5kZXggPSBpICogMztcbiAgICAgICAgeDIgPSB0aGlzLmNsaXBWZXJ0aWNlczFbaW5kZXhdO1xuICAgICAgICB5MiA9IHRoaXMuY2xpcFZlcnRpY2VzMVtpbmRleCArIDFdO1xuICAgICAgICB6MiA9IHRoaXMuY2xpcFZlcnRpY2VzMVtpbmRleCArIDJdO1xuICAgICAgICBkb3QyID0gKHgyIC0gY3ggKyBzMXgpICogLW4xeCArICh5MiAtIGN5ICsgczF5KSAqIC1uMXkgKyAoejIgLSBjeiArIHMxeikgKiAtbjF6O1xuICAgICAgICBpZiAoZG90MSA+IDApIHtcbiAgICAgICAgICBpZiAoZG90MiA+IDApIHtcbiAgICAgICAgICAgIGluZGV4ID0gbnVtQWRkZWRDbGlwVmVydGljZXMgKiAzO1xuICAgICAgICAgICAgbnVtQWRkZWRDbGlwVmVydGljZXMrKztcbiAgICAgICAgICAgIHRoaXMuY2xpcFZlcnRpY2VzMltpbmRleF0gPSB4MjtcbiAgICAgICAgICAgIHRoaXMuY2xpcFZlcnRpY2VzMltpbmRleCArIDFdID0geTI7XG4gICAgICAgICAgICB0aGlzLmNsaXBWZXJ0aWNlczJbaW5kZXggKyAyXSA9IHoyO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpbmRleCA9IG51bUFkZGVkQ2xpcFZlcnRpY2VzICogMztcbiAgICAgICAgICAgIG51bUFkZGVkQ2xpcFZlcnRpY2VzKys7XG4gICAgICAgICAgICB0ID0gZG90MSAvIChkb3QxIC0gZG90Mik7XG4gICAgICAgICAgICB0aGlzLmNsaXBWZXJ0aWNlczJbaW5kZXhdID0geDEgKyAoeDIgLSB4MSkgKiB0O1xuICAgICAgICAgICAgdGhpcy5jbGlwVmVydGljZXMyW2luZGV4ICsgMV0gPSB5MSArICh5MiAtIHkxKSAqIHQ7XG4gICAgICAgICAgICB0aGlzLmNsaXBWZXJ0aWNlczJbaW5kZXggKyAyXSA9IHoxICsgKHoyIC0gejEpICogdDtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKGRvdDIgPiAwKSB7XG4gICAgICAgICAgICBpbmRleCA9IG51bUFkZGVkQ2xpcFZlcnRpY2VzICogMztcbiAgICAgICAgICAgIG51bUFkZGVkQ2xpcFZlcnRpY2VzKys7XG4gICAgICAgICAgICB0ID0gZG90MSAvIChkb3QxIC0gZG90Mik7XG4gICAgICAgICAgICB0aGlzLmNsaXBWZXJ0aWNlczJbaW5kZXhdID0geDEgKyAoeDIgLSB4MSkgKiB0O1xuICAgICAgICAgICAgdGhpcy5jbGlwVmVydGljZXMyW2luZGV4ICsgMV0gPSB5MSArICh5MiAtIHkxKSAqIHQ7XG4gICAgICAgICAgICB0aGlzLmNsaXBWZXJ0aWNlczJbaW5kZXggKyAyXSA9IHoxICsgKHoyIC0gejEpICogdDtcbiAgICAgICAgICAgIGluZGV4ID0gbnVtQWRkZWRDbGlwVmVydGljZXMgKiAzO1xuICAgICAgICAgICAgbnVtQWRkZWRDbGlwVmVydGljZXMrKztcbiAgICAgICAgICAgIHRoaXMuY2xpcFZlcnRpY2VzMltpbmRleF0gPSB4MjtcbiAgICAgICAgICAgIHRoaXMuY2xpcFZlcnRpY2VzMltpbmRleCArIDFdID0geTI7XG4gICAgICAgICAgICB0aGlzLmNsaXBWZXJ0aWNlczJbaW5kZXggKyAyXSA9IHoyO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB4MSA9IHgyO1xuICAgICAgICB5MSA9IHkyO1xuICAgICAgICB6MSA9IHoyO1xuICAgICAgICBkb3QxID0gZG90MjtcbiAgICAgIH1cblxuICAgICAgbnVtQ2xpcFZlcnRpY2VzID0gbnVtQWRkZWRDbGlwVmVydGljZXM7XG4gICAgICBpZiAobnVtQ2xpcFZlcnRpY2VzID09IDApIHJldHVybjtcbiAgICAgIG51bUFkZGVkQ2xpcFZlcnRpY2VzID0gMDtcbiAgICAgIGluZGV4ID0gKG51bUNsaXBWZXJ0aWNlcyAtIDEpICogMztcbiAgICAgIHgxID0gdGhpcy5jbGlwVmVydGljZXMyW2luZGV4XTtcbiAgICAgIHkxID0gdGhpcy5jbGlwVmVydGljZXMyW2luZGV4ICsgMV07XG4gICAgICB6MSA9IHRoaXMuY2xpcFZlcnRpY2VzMltpbmRleCArIDJdO1xuICAgICAgZG90MSA9ICh4MSAtIGN4ICsgczJ4KSAqIC1uMnggKyAoeTEgLSBjeSArIHMyeSkgKiAtbjJ5ICsgKHoxIC0gY3ogKyBzMnopICogLW4yejtcblxuICAgICAgLy9pID0gbnVtQ2xpcFZlcnRpY2VzO1xuICAgICAgLy93aGlsZShpLS0pe1xuICAgICAgZm9yIChpID0gMDsgaSA8IG51bUNsaXBWZXJ0aWNlczsgaSsrKSB7XG4gICAgICAgIGluZGV4ID0gaSAqIDM7XG4gICAgICAgIHgyID0gdGhpcy5jbGlwVmVydGljZXMyW2luZGV4XTtcbiAgICAgICAgeTIgPSB0aGlzLmNsaXBWZXJ0aWNlczJbaW5kZXggKyAxXTtcbiAgICAgICAgejIgPSB0aGlzLmNsaXBWZXJ0aWNlczJbaW5kZXggKyAyXTtcbiAgICAgICAgZG90MiA9ICh4MiAtIGN4ICsgczJ4KSAqIC1uMnggKyAoeTIgLSBjeSArIHMyeSkgKiAtbjJ5ICsgKHoyIC0gY3ogKyBzMnopICogLW4yejtcbiAgICAgICAgaWYgKGRvdDEgPiAwKSB7XG4gICAgICAgICAgaWYgKGRvdDIgPiAwKSB7XG4gICAgICAgICAgICBpbmRleCA9IG51bUFkZGVkQ2xpcFZlcnRpY2VzICogMztcbiAgICAgICAgICAgIG51bUFkZGVkQ2xpcFZlcnRpY2VzKys7XG4gICAgICAgICAgICB0aGlzLmNsaXBWZXJ0aWNlczFbaW5kZXhdID0geDI7XG4gICAgICAgICAgICB0aGlzLmNsaXBWZXJ0aWNlczFbaW5kZXggKyAxXSA9IHkyO1xuICAgICAgICAgICAgdGhpcy5jbGlwVmVydGljZXMxW2luZGV4ICsgMl0gPSB6MjtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaW5kZXggPSBudW1BZGRlZENsaXBWZXJ0aWNlcyAqIDM7XG4gICAgICAgICAgICBudW1BZGRlZENsaXBWZXJ0aWNlcysrO1xuICAgICAgICAgICAgdCA9IGRvdDEgLyAoZG90MSAtIGRvdDIpO1xuICAgICAgICAgICAgdGhpcy5jbGlwVmVydGljZXMxW2luZGV4XSA9IHgxICsgKHgyIC0geDEpICogdDtcbiAgICAgICAgICAgIHRoaXMuY2xpcFZlcnRpY2VzMVtpbmRleCArIDFdID0geTEgKyAoeTIgLSB5MSkgKiB0O1xuICAgICAgICAgICAgdGhpcy5jbGlwVmVydGljZXMxW2luZGV4ICsgMl0gPSB6MSArICh6MiAtIHoxKSAqIHQ7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChkb3QyID4gMCkge1xuICAgICAgICAgICAgaW5kZXggPSBudW1BZGRlZENsaXBWZXJ0aWNlcyAqIDM7XG4gICAgICAgICAgICBudW1BZGRlZENsaXBWZXJ0aWNlcysrO1xuICAgICAgICAgICAgdCA9IGRvdDEgLyAoZG90MSAtIGRvdDIpO1xuICAgICAgICAgICAgdGhpcy5jbGlwVmVydGljZXMxW2luZGV4XSA9IHgxICsgKHgyIC0geDEpICogdDtcbiAgICAgICAgICAgIHRoaXMuY2xpcFZlcnRpY2VzMVtpbmRleCArIDFdID0geTEgKyAoeTIgLSB5MSkgKiB0O1xuICAgICAgICAgICAgdGhpcy5jbGlwVmVydGljZXMxW2luZGV4ICsgMl0gPSB6MSArICh6MiAtIHoxKSAqIHQ7XG4gICAgICAgICAgICBpbmRleCA9IG51bUFkZGVkQ2xpcFZlcnRpY2VzICogMztcbiAgICAgICAgICAgIG51bUFkZGVkQ2xpcFZlcnRpY2VzKys7XG4gICAgICAgICAgICB0aGlzLmNsaXBWZXJ0aWNlczFbaW5kZXhdID0geDI7XG4gICAgICAgICAgICB0aGlzLmNsaXBWZXJ0aWNlczFbaW5kZXggKyAxXSA9IHkyO1xuICAgICAgICAgICAgdGhpcy5jbGlwVmVydGljZXMxW2luZGV4ICsgMl0gPSB6MjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgeDEgPSB4MjtcbiAgICAgICAgeTEgPSB5MjtcbiAgICAgICAgejEgPSB6MjtcbiAgICAgICAgZG90MSA9IGRvdDI7XG4gICAgICB9XG5cbiAgICAgIG51bUNsaXBWZXJ0aWNlcyA9IG51bUFkZGVkQ2xpcFZlcnRpY2VzO1xuICAgICAgaWYgKHN3YXApIHtcbiAgICAgICAgdmFyIHRiID0gYjE7XG4gICAgICAgIGIxID0gYjI7XG4gICAgICAgIGIyID0gdGI7XG4gICAgICB9XG4gICAgICBpZiAobnVtQ2xpcFZlcnRpY2VzID09IDApIHJldHVybjtcbiAgICAgIHZhciBmbGlwcGVkID0gYjEgIT0gc2hhcGUxO1xuICAgICAgaWYgKG51bUNsaXBWZXJ0aWNlcyA+IDQpIHtcbiAgICAgICAgeDEgPSAocTF4ICsgcTJ4ICsgcTN4ICsgcTR4KSAqIDAuMjU7XG4gICAgICAgIHkxID0gKHExeSArIHEyeSArIHEzeSArIHE0eSkgKiAwLjI1O1xuICAgICAgICB6MSA9IChxMXogKyBxMnogKyBxM3ogKyBxNHopICogMC4yNTtcbiAgICAgICAgbjF4ID0gcTF4IC0geDE7XG4gICAgICAgIG4xeSA9IHExeSAtIHkxO1xuICAgICAgICBuMXogPSBxMXogLSB6MTtcbiAgICAgICAgbjJ4ID0gcTJ4IC0geDE7XG4gICAgICAgIG4yeSA9IHEyeSAtIHkxO1xuICAgICAgICBuMnogPSBxMnogLSB6MTtcbiAgICAgICAgdmFyIGluZGV4MSA9IDA7XG4gICAgICAgIHZhciBpbmRleDIgPSAwO1xuICAgICAgICB2YXIgaW5kZXgzID0gMDtcbiAgICAgICAgdmFyIGluZGV4NCA9IDA7XG4gICAgICAgIHZhciBtYXhEb3QgPSAtdGhpcy5JTkY7XG4gICAgICAgIG1pbkRvdCA9IHRoaXMuSU5GO1xuXG4gICAgICAgIC8vaSA9IG51bUNsaXBWZXJ0aWNlcztcbiAgICAgICAgLy93aGlsZShpLS0pe1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbnVtQ2xpcFZlcnRpY2VzOyBpKyspIHtcbiAgICAgICAgICB0aGlzLnVzZWRbaV0gPSBmYWxzZTtcbiAgICAgICAgICBpbmRleCA9IGkgKiAzO1xuICAgICAgICAgIHgxID0gdGhpcy5jbGlwVmVydGljZXMxW2luZGV4XTtcbiAgICAgICAgICB5MSA9IHRoaXMuY2xpcFZlcnRpY2VzMVtpbmRleCArIDFdO1xuICAgICAgICAgIHoxID0gdGhpcy5jbGlwVmVydGljZXMxW2luZGV4ICsgMl07XG4gICAgICAgICAgZG90ID0geDEgKiBuMXggKyB5MSAqIG4xeSArIHoxICogbjF6O1xuICAgICAgICAgIGlmIChkb3QgPCBtaW5Eb3QpIHtcbiAgICAgICAgICAgIG1pbkRvdCA9IGRvdDtcbiAgICAgICAgICAgIGluZGV4MSA9IGk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChkb3QgPiBtYXhEb3QpIHtcbiAgICAgICAgICAgIG1heERvdCA9IGRvdDtcbiAgICAgICAgICAgIGluZGV4MyA9IGk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy51c2VkW2luZGV4MV0gPSB0cnVlO1xuICAgICAgICB0aGlzLnVzZWRbaW5kZXgzXSA9IHRydWU7XG4gICAgICAgIG1heERvdCA9IC10aGlzLklORjtcbiAgICAgICAgbWluRG90ID0gdGhpcy5JTkY7XG5cbiAgICAgICAgLy9pID0gbnVtQ2xpcFZlcnRpY2VzO1xuICAgICAgICAvL3doaWxlKGktLSl7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBudW1DbGlwVmVydGljZXM7IGkrKykge1xuICAgICAgICAgIGlmICh0aGlzLnVzZWRbaV0pIGNvbnRpbnVlO1xuICAgICAgICAgIGluZGV4ID0gaSAqIDM7XG4gICAgICAgICAgeDEgPSB0aGlzLmNsaXBWZXJ0aWNlczFbaW5kZXhdO1xuICAgICAgICAgIHkxID0gdGhpcy5jbGlwVmVydGljZXMxW2luZGV4ICsgMV07XG4gICAgICAgICAgejEgPSB0aGlzLmNsaXBWZXJ0aWNlczFbaW5kZXggKyAyXTtcbiAgICAgICAgICBkb3QgPSB4MSAqIG4yeCArIHkxICogbjJ5ICsgejEgKiBuMno7XG4gICAgICAgICAgaWYgKGRvdCA8IG1pbkRvdCkge1xuICAgICAgICAgICAgbWluRG90ID0gZG90O1xuICAgICAgICAgICAgaW5kZXgyID0gaTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGRvdCA+IG1heERvdCkge1xuICAgICAgICAgICAgbWF4RG90ID0gZG90O1xuICAgICAgICAgICAgaW5kZXg0ID0gaTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpbmRleCA9IGluZGV4MSAqIDM7XG4gICAgICAgIHgxID0gdGhpcy5jbGlwVmVydGljZXMxW2luZGV4XTtcbiAgICAgICAgeTEgPSB0aGlzLmNsaXBWZXJ0aWNlczFbaW5kZXggKyAxXTtcbiAgICAgICAgejEgPSB0aGlzLmNsaXBWZXJ0aWNlczFbaW5kZXggKyAyXTtcbiAgICAgICAgZG90ID0gKHgxIC0gY3gpICogbnggKyAoeTEgLSBjeSkgKiBueSArICh6MSAtIGN6KSAqIG56O1xuICAgICAgICBpZiAoZG90IDwgMCkgbWFuaWZvbGQuYWRkUG9pbnQoeDEsIHkxLCB6MSwgbngsIG55LCBueiwgZG90LCBmbGlwcGVkKTtcblxuICAgICAgICBpbmRleCA9IGluZGV4MiAqIDM7XG4gICAgICAgIHgxID0gdGhpcy5jbGlwVmVydGljZXMxW2luZGV4XTtcbiAgICAgICAgeTEgPSB0aGlzLmNsaXBWZXJ0aWNlczFbaW5kZXggKyAxXTtcbiAgICAgICAgejEgPSB0aGlzLmNsaXBWZXJ0aWNlczFbaW5kZXggKyAyXTtcbiAgICAgICAgZG90ID0gKHgxIC0gY3gpICogbnggKyAoeTEgLSBjeSkgKiBueSArICh6MSAtIGN6KSAqIG56O1xuICAgICAgICBpZiAoZG90IDwgMCkgbWFuaWZvbGQuYWRkUG9pbnQoeDEsIHkxLCB6MSwgbngsIG55LCBueiwgZG90LCBmbGlwcGVkKTtcblxuICAgICAgICBpbmRleCA9IGluZGV4MyAqIDM7XG4gICAgICAgIHgxID0gdGhpcy5jbGlwVmVydGljZXMxW2luZGV4XTtcbiAgICAgICAgeTEgPSB0aGlzLmNsaXBWZXJ0aWNlczFbaW5kZXggKyAxXTtcbiAgICAgICAgejEgPSB0aGlzLmNsaXBWZXJ0aWNlczFbaW5kZXggKyAyXTtcbiAgICAgICAgZG90ID0gKHgxIC0gY3gpICogbnggKyAoeTEgLSBjeSkgKiBueSArICh6MSAtIGN6KSAqIG56O1xuICAgICAgICBpZiAoZG90IDwgMCkgbWFuaWZvbGQuYWRkUG9pbnQoeDEsIHkxLCB6MSwgbngsIG55LCBueiwgZG90LCBmbGlwcGVkKTtcblxuICAgICAgICBpbmRleCA9IGluZGV4NCAqIDM7XG4gICAgICAgIHgxID0gdGhpcy5jbGlwVmVydGljZXMxW2luZGV4XTtcbiAgICAgICAgeTEgPSB0aGlzLmNsaXBWZXJ0aWNlczFbaW5kZXggKyAxXTtcbiAgICAgICAgejEgPSB0aGlzLmNsaXBWZXJ0aWNlczFbaW5kZXggKyAyXTtcbiAgICAgICAgZG90ID0gKHgxIC0gY3gpICogbnggKyAoeTEgLSBjeSkgKiBueSArICh6MSAtIGN6KSAqIG56O1xuICAgICAgICBpZiAoZG90IDwgMCkgbWFuaWZvbGQuYWRkUG9pbnQoeDEsIHkxLCB6MSwgbngsIG55LCBueiwgZG90LCBmbGlwcGVkKTtcblxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy9pID0gbnVtQ2xpcFZlcnRpY2VzO1xuICAgICAgICAvL3doaWxlKGktLSl7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBudW1DbGlwVmVydGljZXM7IGkrKykge1xuICAgICAgICAgIGluZGV4ID0gaSAqIDM7XG4gICAgICAgICAgeDEgPSB0aGlzLmNsaXBWZXJ0aWNlczFbaW5kZXhdO1xuICAgICAgICAgIHkxID0gdGhpcy5jbGlwVmVydGljZXMxW2luZGV4ICsgMV07XG4gICAgICAgICAgejEgPSB0aGlzLmNsaXBWZXJ0aWNlczFbaW5kZXggKyAyXTtcbiAgICAgICAgICBkb3QgPSAoeDEgLSBjeCkgKiBueCArICh5MSAtIGN5KSAqIG55ICsgKHoxIC0gY3opICogbno7XG4gICAgICAgICAgaWYgKGRvdCA8IDApIG1hbmlmb2xkLmFkZFBvaW50KHgxLCB5MSwgejEsIG54LCBueSwgbnosIGRvdCwgZmxpcHBlZCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgIH1cblxuICB9KTtcblxuICBmdW5jdGlvbiBCb3hDeWxpbmRlckNvbGxpc2lvbkRldGVjdG9yKGZsaXApIHtcblxuICAgIENvbGxpc2lvbkRldGVjdG9yLmNhbGwodGhpcyk7XG4gICAgdGhpcy5mbGlwID0gZmxpcDtcblxuICB9XG4gIEJveEN5bGluZGVyQ29sbGlzaW9uRGV0ZWN0b3IucHJvdG90eXBlID0gT2JqZWN0LmFzc2lnbihPYmplY3QuY3JlYXRlKENvbGxpc2lvbkRldGVjdG9yLnByb3RvdHlwZSksIHtcblxuICAgIGNvbnN0cnVjdG9yOiBCb3hDeWxpbmRlckNvbGxpc2lvbkRldGVjdG9yLFxuXG4gICAgZ2V0U2VwOiBmdW5jdGlvbiAoYzEsIGMyLCBzZXAsIHBvcywgZGVwKSB7XG5cbiAgICAgIHZhciB0MXg7XG4gICAgICB2YXIgdDF5O1xuICAgICAgdmFyIHQxejtcbiAgICAgIHZhciB0Mng7XG4gICAgICB2YXIgdDJ5O1xuICAgICAgdmFyIHQyejtcbiAgICAgIHZhciBzdXAgPSBuZXcgVmVjMygpO1xuICAgICAgdmFyIGxlbjtcbiAgICAgIHZhciBwMXg7XG4gICAgICB2YXIgcDF5O1xuICAgICAgdmFyIHAxejtcbiAgICAgIHZhciBwMng7XG4gICAgICB2YXIgcDJ5O1xuICAgICAgdmFyIHAyejtcbiAgICAgIHZhciB2MDF4ID0gYzEucG9zaXRpb24ueDtcbiAgICAgIHZhciB2MDF5ID0gYzEucG9zaXRpb24ueTtcbiAgICAgIHZhciB2MDF6ID0gYzEucG9zaXRpb24uejtcbiAgICAgIHZhciB2MDJ4ID0gYzIucG9zaXRpb24ueDtcbiAgICAgIHZhciB2MDJ5ID0gYzIucG9zaXRpb24ueTtcbiAgICAgIHZhciB2MDJ6ID0gYzIucG9zaXRpb24uejtcbiAgICAgIHZhciB2MHggPSB2MDJ4IC0gdjAxeDtcbiAgICAgIHZhciB2MHkgPSB2MDJ5IC0gdjAxeTtcbiAgICAgIHZhciB2MHogPSB2MDJ6IC0gdjAxejtcbiAgICAgIGlmICh2MHggKiB2MHggKyB2MHkgKiB2MHkgKyB2MHogKiB2MHogPT0gMCkgdjB5ID0gMC4wMDE7XG4gICAgICB2YXIgbnggPSAtdjB4O1xuICAgICAgdmFyIG55ID0gLXYweTtcbiAgICAgIHZhciBueiA9IC12MHo7XG4gICAgICB0aGlzLnN1cHBvcnRQb2ludEIoYzEsIC1ueCwgLW55LCAtbnosIHN1cCk7XG4gICAgICB2YXIgdjExeCA9IHN1cC54O1xuICAgICAgdmFyIHYxMXkgPSBzdXAueTtcbiAgICAgIHZhciB2MTF6ID0gc3VwLno7XG4gICAgICB0aGlzLnN1cHBvcnRQb2ludEMoYzIsIG54LCBueSwgbnosIHN1cCk7XG4gICAgICB2YXIgdjEyeCA9IHN1cC54O1xuICAgICAgdmFyIHYxMnkgPSBzdXAueTtcbiAgICAgIHZhciB2MTJ6ID0gc3VwLno7XG4gICAgICB2YXIgdjF4ID0gdjEyeCAtIHYxMXg7XG4gICAgICB2YXIgdjF5ID0gdjEyeSAtIHYxMXk7XG4gICAgICB2YXIgdjF6ID0gdjEyeiAtIHYxMXo7XG4gICAgICBpZiAodjF4ICogbnggKyB2MXkgKiBueSArIHYxeiAqIG56IDw9IDApIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgbnggPSB2MXkgKiB2MHogLSB2MXogKiB2MHk7XG4gICAgICBueSA9IHYxeiAqIHYweCAtIHYxeCAqIHYwejtcbiAgICAgIG56ID0gdjF4ICogdjB5IC0gdjF5ICogdjB4O1xuICAgICAgaWYgKG54ICogbnggKyBueSAqIG55ICsgbnogKiBueiA9PSAwKSB7XG4gICAgICAgIHNlcC5zZXQodjF4IC0gdjB4LCB2MXkgLSB2MHksIHYxeiAtIHYweikubm9ybWFsaXplKCk7XG4gICAgICAgIHBvcy5zZXQoKHYxMXggKyB2MTJ4KSAqIDAuNSwgKHYxMXkgKyB2MTJ5KSAqIDAuNSwgKHYxMXogKyB2MTJ6KSAqIDAuNSk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgICAgdGhpcy5zdXBwb3J0UG9pbnRCKGMxLCAtbngsIC1ueSwgLW56LCBzdXApO1xuICAgICAgdmFyIHYyMXggPSBzdXAueDtcbiAgICAgIHZhciB2MjF5ID0gc3VwLnk7XG4gICAgICB2YXIgdjIxeiA9IHN1cC56O1xuICAgICAgdGhpcy5zdXBwb3J0UG9pbnRDKGMyLCBueCwgbnksIG56LCBzdXApO1xuICAgICAgdmFyIHYyMnggPSBzdXAueDtcbiAgICAgIHZhciB2MjJ5ID0gc3VwLnk7XG4gICAgICB2YXIgdjIyeiA9IHN1cC56O1xuICAgICAgdmFyIHYyeCA9IHYyMnggLSB2MjF4O1xuICAgICAgdmFyIHYyeSA9IHYyMnkgLSB2MjF5O1xuICAgICAgdmFyIHYyeiA9IHYyMnogLSB2MjF6O1xuICAgICAgaWYgKHYyeCAqIG54ICsgdjJ5ICogbnkgKyB2MnogKiBueiA8PSAwKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHQxeCA9IHYxeCAtIHYweDtcbiAgICAgIHQxeSA9IHYxeSAtIHYweTtcbiAgICAgIHQxeiA9IHYxeiAtIHYwejtcbiAgICAgIHQyeCA9IHYyeCAtIHYweDtcbiAgICAgIHQyeSA9IHYyeSAtIHYweTtcbiAgICAgIHQyeiA9IHYyeiAtIHYwejtcbiAgICAgIG54ID0gdDF5ICogdDJ6IC0gdDF6ICogdDJ5O1xuICAgICAgbnkgPSB0MXogKiB0MnggLSB0MXggKiB0Mno7XG4gICAgICBueiA9IHQxeCAqIHQyeSAtIHQxeSAqIHQyeDtcbiAgICAgIGlmIChueCAqIHYweCArIG55ICogdjB5ICsgbnogKiB2MHogPiAwKSB7XG4gICAgICAgIHQxeCA9IHYxeDtcbiAgICAgICAgdDF5ID0gdjF5O1xuICAgICAgICB0MXogPSB2MXo7XG4gICAgICAgIHYxeCA9IHYyeDtcbiAgICAgICAgdjF5ID0gdjJ5O1xuICAgICAgICB2MXogPSB2Mno7XG4gICAgICAgIHYyeCA9IHQxeDtcbiAgICAgICAgdjJ5ID0gdDF5O1xuICAgICAgICB2MnogPSB0MXo7XG4gICAgICAgIHQxeCA9IHYxMXg7XG4gICAgICAgIHQxeSA9IHYxMXk7XG4gICAgICAgIHQxeiA9IHYxMXo7XG4gICAgICAgIHYxMXggPSB2MjF4O1xuICAgICAgICB2MTF5ID0gdjIxeTtcbiAgICAgICAgdjExeiA9IHYyMXo7XG4gICAgICAgIHYyMXggPSB0MXg7XG4gICAgICAgIHYyMXkgPSB0MXk7XG4gICAgICAgIHYyMXogPSB0MXo7XG4gICAgICAgIHQxeCA9IHYxMng7XG4gICAgICAgIHQxeSA9IHYxMnk7XG4gICAgICAgIHQxeiA9IHYxMno7XG4gICAgICAgIHYxMnggPSB2MjJ4O1xuICAgICAgICB2MTJ5ID0gdjIyeTtcbiAgICAgICAgdjEyeiA9IHYyMno7XG4gICAgICAgIHYyMnggPSB0MXg7XG4gICAgICAgIHYyMnkgPSB0MXk7XG4gICAgICAgIHYyMnogPSB0MXo7XG4gICAgICAgIG54ID0gLW54O1xuICAgICAgICBueSA9IC1ueTtcbiAgICAgICAgbnogPSAtbno7XG4gICAgICB9XG4gICAgICB2YXIgaXRlcmF0aW9ucyA9IDA7XG4gICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICBpZiAoKytpdGVyYXRpb25zID4gMTAwKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc3VwcG9ydFBvaW50QihjMSwgLW54LCAtbnksIC1ueiwgc3VwKTtcbiAgICAgICAgdmFyIHYzMXggPSBzdXAueDtcbiAgICAgICAgdmFyIHYzMXkgPSBzdXAueTtcbiAgICAgICAgdmFyIHYzMXogPSBzdXAuejtcbiAgICAgICAgdGhpcy5zdXBwb3J0UG9pbnRDKGMyLCBueCwgbnksIG56LCBzdXApO1xuICAgICAgICB2YXIgdjMyeCA9IHN1cC54O1xuICAgICAgICB2YXIgdjMyeSA9IHN1cC55O1xuICAgICAgICB2YXIgdjMyeiA9IHN1cC56O1xuICAgICAgICB2YXIgdjN4ID0gdjMyeCAtIHYzMXg7XG4gICAgICAgIHZhciB2M3kgPSB2MzJ5IC0gdjMxeTtcbiAgICAgICAgdmFyIHYzeiA9IHYzMnogLSB2MzF6O1xuICAgICAgICBpZiAodjN4ICogbnggKyB2M3kgKiBueSArIHYzeiAqIG56IDw9IDApIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCh2MXkgKiB2M3ogLSB2MXogKiB2M3kpICogdjB4ICsgKHYxeiAqIHYzeCAtIHYxeCAqIHYzeikgKiB2MHkgKyAodjF4ICogdjN5IC0gdjF5ICogdjN4KSAqIHYweiA8IDApIHtcbiAgICAgICAgICB2MnggPSB2M3g7XG4gICAgICAgICAgdjJ5ID0gdjN5O1xuICAgICAgICAgIHYyeiA9IHYzejtcbiAgICAgICAgICB2MjF4ID0gdjMxeDtcbiAgICAgICAgICB2MjF5ID0gdjMxeTtcbiAgICAgICAgICB2MjF6ID0gdjMxejtcbiAgICAgICAgICB2MjJ4ID0gdjMyeDtcbiAgICAgICAgICB2MjJ5ID0gdjMyeTtcbiAgICAgICAgICB2MjJ6ID0gdjMyejtcbiAgICAgICAgICB0MXggPSB2MXggLSB2MHg7XG4gICAgICAgICAgdDF5ID0gdjF5IC0gdjB5O1xuICAgICAgICAgIHQxeiA9IHYxeiAtIHYwejtcbiAgICAgICAgICB0MnggPSB2M3ggLSB2MHg7XG4gICAgICAgICAgdDJ5ID0gdjN5IC0gdjB5O1xuICAgICAgICAgIHQyeiA9IHYzeiAtIHYwejtcbiAgICAgICAgICBueCA9IHQxeSAqIHQyeiAtIHQxeiAqIHQyeTtcbiAgICAgICAgICBueSA9IHQxeiAqIHQyeCAtIHQxeCAqIHQyejtcbiAgICAgICAgICBueiA9IHQxeCAqIHQyeSAtIHQxeSAqIHQyeDtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoKHYzeSAqIHYyeiAtIHYzeiAqIHYyeSkgKiB2MHggKyAodjN6ICogdjJ4IC0gdjN4ICogdjJ6KSAqIHYweSArICh2M3ggKiB2MnkgLSB2M3kgKiB2MngpICogdjB6IDwgMCkge1xuICAgICAgICAgIHYxeCA9IHYzeDtcbiAgICAgICAgICB2MXkgPSB2M3k7XG4gICAgICAgICAgdjF6ID0gdjN6O1xuICAgICAgICAgIHYxMXggPSB2MzF4O1xuICAgICAgICAgIHYxMXkgPSB2MzF5O1xuICAgICAgICAgIHYxMXogPSB2MzF6O1xuICAgICAgICAgIHYxMnggPSB2MzJ4O1xuICAgICAgICAgIHYxMnkgPSB2MzJ5O1xuICAgICAgICAgIHYxMnogPSB2MzJ6O1xuICAgICAgICAgIHQxeCA9IHYzeCAtIHYweDtcbiAgICAgICAgICB0MXkgPSB2M3kgLSB2MHk7XG4gICAgICAgICAgdDF6ID0gdjN6IC0gdjB6O1xuICAgICAgICAgIHQyeCA9IHYyeCAtIHYweDtcbiAgICAgICAgICB0MnkgPSB2MnkgLSB2MHk7XG4gICAgICAgICAgdDJ6ID0gdjJ6IC0gdjB6O1xuICAgICAgICAgIG54ID0gdDF5ICogdDJ6IC0gdDF6ICogdDJ5O1xuICAgICAgICAgIG55ID0gdDF6ICogdDJ4IC0gdDF4ICogdDJ6O1xuICAgICAgICAgIG56ID0gdDF4ICogdDJ5IC0gdDF5ICogdDJ4O1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIHZhciBoaXQgPSBmYWxzZTtcbiAgICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgICB0MXggPSB2MnggLSB2MXg7XG4gICAgICAgICAgdDF5ID0gdjJ5IC0gdjF5O1xuICAgICAgICAgIHQxeiA9IHYyeiAtIHYxejtcbiAgICAgICAgICB0MnggPSB2M3ggLSB2MXg7XG4gICAgICAgICAgdDJ5ID0gdjN5IC0gdjF5O1xuICAgICAgICAgIHQyeiA9IHYzeiAtIHYxejtcbiAgICAgICAgICBueCA9IHQxeSAqIHQyeiAtIHQxeiAqIHQyeTtcbiAgICAgICAgICBueSA9IHQxeiAqIHQyeCAtIHQxeCAqIHQyejtcbiAgICAgICAgICBueiA9IHQxeCAqIHQyeSAtIHQxeSAqIHQyeDtcbiAgICAgICAgICBsZW4gPSAxIC8gX01hdGguc3FydChueCAqIG54ICsgbnkgKiBueSArIG56ICogbnopO1xuICAgICAgICAgIG54ICo9IGxlbjtcbiAgICAgICAgICBueSAqPSBsZW47XG4gICAgICAgICAgbnogKj0gbGVuO1xuICAgICAgICAgIGlmIChueCAqIHYxeCArIG55ICogdjF5ICsgbnogKiB2MXogPj0gMCAmJiAhaGl0KSB7XG4gICAgICAgICAgICB2YXIgYjAgPSAodjF5ICogdjJ6IC0gdjF6ICogdjJ5KSAqIHYzeCArICh2MXogKiB2MnggLSB2MXggKiB2MnopICogdjN5ICsgKHYxeCAqIHYyeSAtIHYxeSAqIHYyeCkgKiB2M3o7XG4gICAgICAgICAgICB2YXIgYjEgPSAodjN5ICogdjJ6IC0gdjN6ICogdjJ5KSAqIHYweCArICh2M3ogKiB2MnggLSB2M3ggKiB2MnopICogdjB5ICsgKHYzeCAqIHYyeSAtIHYzeSAqIHYyeCkgKiB2MHo7XG4gICAgICAgICAgICB2YXIgYjIgPSAodjB5ICogdjF6IC0gdjB6ICogdjF5KSAqIHYzeCArICh2MHogKiB2MXggLSB2MHggKiB2MXopICogdjN5ICsgKHYweCAqIHYxeSAtIHYweSAqIHYxeCkgKiB2M3o7XG4gICAgICAgICAgICB2YXIgYjMgPSAodjJ5ICogdjF6IC0gdjJ6ICogdjF5KSAqIHYweCArICh2MnogKiB2MXggLSB2MnggKiB2MXopICogdjB5ICsgKHYyeCAqIHYxeSAtIHYyeSAqIHYxeCkgKiB2MHo7XG4gICAgICAgICAgICB2YXIgc3VtID0gYjAgKyBiMSArIGIyICsgYjM7XG4gICAgICAgICAgICBpZiAoc3VtIDw9IDApIHtcbiAgICAgICAgICAgICAgYjAgPSAwO1xuICAgICAgICAgICAgICBiMSA9ICh2MnkgKiB2M3ogLSB2MnogKiB2M3kpICogbnggKyAodjJ6ICogdjN4IC0gdjJ4ICogdjN6KSAqIG55ICsgKHYyeCAqIHYzeSAtIHYyeSAqIHYzeCkgKiBuejtcbiAgICAgICAgICAgICAgYjIgPSAodjN5ICogdjJ6IC0gdjN6ICogdjJ5KSAqIG54ICsgKHYzeiAqIHYyeCAtIHYzeCAqIHYyeikgKiBueSArICh2M3ggKiB2MnkgLSB2M3kgKiB2MngpICogbno7XG4gICAgICAgICAgICAgIGIzID0gKHYxeSAqIHYyeiAtIHYxeiAqIHYyeSkgKiBueCArICh2MXogKiB2MnggLSB2MXggKiB2MnopICogbnkgKyAodjF4ICogdjJ5IC0gdjF5ICogdjJ4KSAqIG56O1xuICAgICAgICAgICAgICBzdW0gPSBiMSArIGIyICsgYjM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgaW52ID0gMSAvIHN1bTtcbiAgICAgICAgICAgIHAxeCA9ICh2MDF4ICogYjAgKyB2MTF4ICogYjEgKyB2MjF4ICogYjIgKyB2MzF4ICogYjMpICogaW52O1xuICAgICAgICAgICAgcDF5ID0gKHYwMXkgKiBiMCArIHYxMXkgKiBiMSArIHYyMXkgKiBiMiArIHYzMXkgKiBiMykgKiBpbnY7XG4gICAgICAgICAgICBwMXogPSAodjAxeiAqIGIwICsgdjExeiAqIGIxICsgdjIxeiAqIGIyICsgdjMxeiAqIGIzKSAqIGludjtcbiAgICAgICAgICAgIHAyeCA9ICh2MDJ4ICogYjAgKyB2MTJ4ICogYjEgKyB2MjJ4ICogYjIgKyB2MzJ4ICogYjMpICogaW52O1xuICAgICAgICAgICAgcDJ5ID0gKHYwMnkgKiBiMCArIHYxMnkgKiBiMSArIHYyMnkgKiBiMiArIHYzMnkgKiBiMykgKiBpbnY7XG4gICAgICAgICAgICBwMnogPSAodjAyeiAqIGIwICsgdjEyeiAqIGIxICsgdjIyeiAqIGIyICsgdjMyeiAqIGIzKSAqIGludjtcbiAgICAgICAgICAgIGhpdCA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuc3VwcG9ydFBvaW50QihjMSwgLW54LCAtbnksIC1ueiwgc3VwKTtcbiAgICAgICAgICB2YXIgdjQxeCA9IHN1cC54O1xuICAgICAgICAgIHZhciB2NDF5ID0gc3VwLnk7XG4gICAgICAgICAgdmFyIHY0MXogPSBzdXAuejtcbiAgICAgICAgICB0aGlzLnN1cHBvcnRQb2ludEMoYzIsIG54LCBueSwgbnosIHN1cCk7XG4gICAgICAgICAgdmFyIHY0MnggPSBzdXAueDtcbiAgICAgICAgICB2YXIgdjQyeSA9IHN1cC55O1xuICAgICAgICAgIHZhciB2NDJ6ID0gc3VwLno7XG4gICAgICAgICAgdmFyIHY0eCA9IHY0MnggLSB2NDF4O1xuICAgICAgICAgIHZhciB2NHkgPSB2NDJ5IC0gdjQxeTtcbiAgICAgICAgICB2YXIgdjR6ID0gdjQyeiAtIHY0MXo7XG4gICAgICAgICAgdmFyIHNlcGFyYXRpb24gPSAtKHY0eCAqIG54ICsgdjR5ICogbnkgKyB2NHogKiBueik7XG4gICAgICAgICAgaWYgKCh2NHggLSB2M3gpICogbnggKyAodjR5IC0gdjN5KSAqIG55ICsgKHY0eiAtIHYzeikgKiBueiA8PSAwLjAxIHx8IHNlcGFyYXRpb24gPj0gMCkge1xuICAgICAgICAgICAgaWYgKGhpdCkge1xuICAgICAgICAgICAgICBzZXAuc2V0KC1ueCwgLW55LCAtbnopO1xuICAgICAgICAgICAgICBwb3Muc2V0KChwMXggKyBwMngpICogMC41LCAocDF5ICsgcDJ5KSAqIDAuNSwgKHAxeiArIHAyeikgKiAwLjUpO1xuICAgICAgICAgICAgICBkZXAueCA9IHNlcGFyYXRpb247XG4gICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAodjR5ICogdjF6IC0gdjR6ICogdjF5KSAqIHYweCArXG4gICAgICAgICAgICAodjR6ICogdjF4IC0gdjR4ICogdjF6KSAqIHYweSArXG4gICAgICAgICAgICAodjR4ICogdjF5IC0gdjR5ICogdjF4KSAqIHYweiA8IDBcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgKHY0eSAqIHYyeiAtIHY0eiAqIHYyeSkgKiB2MHggK1xuICAgICAgICAgICAgICAodjR6ICogdjJ4IC0gdjR4ICogdjJ6KSAqIHYweSArXG4gICAgICAgICAgICAgICh2NHggKiB2MnkgLSB2NHkgKiB2MngpICogdjB6IDwgMFxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgIHYxeCA9IHY0eDtcbiAgICAgICAgICAgICAgdjF5ID0gdjR5O1xuICAgICAgICAgICAgICB2MXogPSB2NHo7XG4gICAgICAgICAgICAgIHYxMXggPSB2NDF4O1xuICAgICAgICAgICAgICB2MTF5ID0gdjQxeTtcbiAgICAgICAgICAgICAgdjExeiA9IHY0MXo7XG4gICAgICAgICAgICAgIHYxMnggPSB2NDJ4O1xuICAgICAgICAgICAgICB2MTJ5ID0gdjQyeTtcbiAgICAgICAgICAgICAgdjEyeiA9IHY0Mno7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB2M3ggPSB2NHg7XG4gICAgICAgICAgICAgIHYzeSA9IHY0eTtcbiAgICAgICAgICAgICAgdjN6ID0gdjR6O1xuICAgICAgICAgICAgICB2MzF4ID0gdjQxeDtcbiAgICAgICAgICAgICAgdjMxeSA9IHY0MXk7XG4gICAgICAgICAgICAgIHYzMXogPSB2NDF6O1xuICAgICAgICAgICAgICB2MzJ4ID0gdjQyeDtcbiAgICAgICAgICAgICAgdjMyeSA9IHY0Mnk7XG4gICAgICAgICAgICAgIHYzMnogPSB2NDJ6O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICh2NHkgKiB2M3ogLSB2NHogKiB2M3kpICogdjB4ICtcbiAgICAgICAgICAgICAgKHY0eiAqIHYzeCAtIHY0eCAqIHYzeikgKiB2MHkgK1xuICAgICAgICAgICAgICAodjR4ICogdjN5IC0gdjR5ICogdjN4KSAqIHYweiA8IDBcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICB2MnggPSB2NHg7XG4gICAgICAgICAgICAgIHYyeSA9IHY0eTtcbiAgICAgICAgICAgICAgdjJ6ID0gdjR6O1xuICAgICAgICAgICAgICB2MjF4ID0gdjQxeDtcbiAgICAgICAgICAgICAgdjIxeSA9IHY0MXk7XG4gICAgICAgICAgICAgIHYyMXogPSB2NDF6O1xuICAgICAgICAgICAgICB2MjJ4ID0gdjQyeDtcbiAgICAgICAgICAgICAgdjIyeSA9IHY0Mnk7XG4gICAgICAgICAgICAgIHYyMnogPSB2NDJ6O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdjF4ID0gdjR4O1xuICAgICAgICAgICAgICB2MXkgPSB2NHk7XG4gICAgICAgICAgICAgIHYxeiA9IHY0ejtcbiAgICAgICAgICAgICAgdjExeCA9IHY0MXg7XG4gICAgICAgICAgICAgIHYxMXkgPSB2NDF5O1xuICAgICAgICAgICAgICB2MTF6ID0gdjQxejtcbiAgICAgICAgICAgICAgdjEyeCA9IHY0Mng7XG4gICAgICAgICAgICAgIHYxMnkgPSB2NDJ5O1xuICAgICAgICAgICAgICB2MTJ6ID0gdjQyejtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vcmV0dXJuIGZhbHNlO1xuICAgIH0sXG5cbiAgICBzdXBwb3J0UG9pbnRCOiBmdW5jdGlvbiAoYywgZHgsIGR5LCBkeiwgb3V0KSB7XG5cbiAgICAgIHZhciByb3QgPSBjLnJvdGF0aW9uLmVsZW1lbnRzO1xuICAgICAgdmFyIGxkeCA9IHJvdFswXSAqIGR4ICsgcm90WzNdICogZHkgKyByb3RbNl0gKiBkejtcbiAgICAgIHZhciBsZHkgPSByb3RbMV0gKiBkeCArIHJvdFs0XSAqIGR5ICsgcm90WzddICogZHo7XG4gICAgICB2YXIgbGR6ID0gcm90WzJdICogZHggKyByb3RbNV0gKiBkeSArIHJvdFs4XSAqIGR6O1xuICAgICAgdmFyIHcgPSBjLmhhbGZXaWR0aDtcbiAgICAgIHZhciBoID0gYy5oYWxmSGVpZ2h0O1xuICAgICAgdmFyIGQgPSBjLmhhbGZEZXB0aDtcbiAgICAgIHZhciBveDtcbiAgICAgIHZhciBveTtcbiAgICAgIHZhciBvejtcbiAgICAgIGlmIChsZHggPCAwKSBveCA9IC13O1xuICAgICAgZWxzZSBveCA9IHc7XG4gICAgICBpZiAobGR5IDwgMCkgb3kgPSAtaDtcbiAgICAgIGVsc2Ugb3kgPSBoO1xuICAgICAgaWYgKGxkeiA8IDApIG96ID0gLWQ7XG4gICAgICBlbHNlIG96ID0gZDtcbiAgICAgIGxkeCA9IHJvdFswXSAqIG94ICsgcm90WzFdICogb3kgKyByb3RbMl0gKiBveiArIGMucG9zaXRpb24ueDtcbiAgICAgIGxkeSA9IHJvdFszXSAqIG94ICsgcm90WzRdICogb3kgKyByb3RbNV0gKiBveiArIGMucG9zaXRpb24ueTtcbiAgICAgIGxkeiA9IHJvdFs2XSAqIG94ICsgcm90WzddICogb3kgKyByb3RbOF0gKiBveiArIGMucG9zaXRpb24uejtcbiAgICAgIG91dC5zZXQobGR4LCBsZHksIGxkeik7XG5cbiAgICB9LFxuXG4gICAgc3VwcG9ydFBvaW50QzogZnVuY3Rpb24gKGMsIGR4LCBkeSwgZHosIG91dCkge1xuXG4gICAgICB2YXIgcm90ID0gYy5yb3RhdGlvbi5lbGVtZW50cztcbiAgICAgIHZhciBsZHggPSByb3RbMF0gKiBkeCArIHJvdFszXSAqIGR5ICsgcm90WzZdICogZHo7XG4gICAgICB2YXIgbGR5ID0gcm90WzFdICogZHggKyByb3RbNF0gKiBkeSArIHJvdFs3XSAqIGR6O1xuICAgICAgdmFyIGxkeiA9IHJvdFsyXSAqIGR4ICsgcm90WzVdICogZHkgKyByb3RbOF0gKiBkejtcbiAgICAgIHZhciByYWR4ID0gbGR4O1xuICAgICAgdmFyIHJhZHogPSBsZHo7XG4gICAgICB2YXIgbGVuID0gcmFkeCAqIHJhZHggKyByYWR6ICogcmFkejtcbiAgICAgIHZhciByYWQgPSBjLnJhZGl1cztcbiAgICAgIHZhciBoaCA9IGMuaGFsZkhlaWdodDtcbiAgICAgIHZhciBveDtcbiAgICAgIHZhciBveTtcbiAgICAgIHZhciBvejtcbiAgICAgIGlmIChsZW4gPT0gMCkge1xuICAgICAgICBpZiAobGR5IDwgMCkge1xuICAgICAgICAgIG94ID0gcmFkO1xuICAgICAgICAgIG95ID0gLWhoO1xuICAgICAgICAgIG96ID0gMDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBveCA9IHJhZDtcbiAgICAgICAgICBveSA9IGhoO1xuICAgICAgICAgIG96ID0gMDtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGVuID0gYy5yYWRpdXMgLyBfTWF0aC5zcXJ0KGxlbik7XG4gICAgICAgIGlmIChsZHkgPCAwKSB7XG4gICAgICAgICAgb3ggPSByYWR4ICogbGVuO1xuICAgICAgICAgIG95ID0gLWhoO1xuICAgICAgICAgIG96ID0gcmFkeiAqIGxlbjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBveCA9IHJhZHggKiBsZW47XG4gICAgICAgICAgb3kgPSBoaDtcbiAgICAgICAgICBveiA9IHJhZHogKiBsZW47XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGxkeCA9IHJvdFswXSAqIG94ICsgcm90WzFdICogb3kgKyByb3RbMl0gKiBveiArIGMucG9zaXRpb24ueDtcbiAgICAgIGxkeSA9IHJvdFszXSAqIG94ICsgcm90WzRdICogb3kgKyByb3RbNV0gKiBveiArIGMucG9zaXRpb24ueTtcbiAgICAgIGxkeiA9IHJvdFs2XSAqIG94ICsgcm90WzddICogb3kgKyByb3RbOF0gKiBveiArIGMucG9zaXRpb24uejtcbiAgICAgIG91dC5zZXQobGR4LCBsZHksIGxkeik7XG5cbiAgICB9LFxuXG4gICAgZGV0ZWN0Q29sbGlzaW9uOiBmdW5jdGlvbiAoc2hhcGUxLCBzaGFwZTIsIG1hbmlmb2xkKSB7XG5cbiAgICAgIHZhciBiO1xuICAgICAgdmFyIGM7XG4gICAgICBpZiAodGhpcy5mbGlwKSB7XG4gICAgICAgIGIgPSBzaGFwZTI7XG4gICAgICAgIGMgPSBzaGFwZTE7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBiID0gc2hhcGUxO1xuICAgICAgICBjID0gc2hhcGUyO1xuICAgICAgfVxuICAgICAgdmFyIHNlcCA9IG5ldyBWZWMzKCk7XG4gICAgICB2YXIgcG9zID0gbmV3IFZlYzMoKTtcbiAgICAgIHZhciBkZXAgPSBuZXcgVmVjMygpO1xuXG4gICAgICBpZiAoIXRoaXMuZ2V0U2VwKGIsIGMsIHNlcCwgcG9zLCBkZXApKSByZXR1cm47XG4gICAgICB2YXIgcGJ4ID0gYi5wb3NpdGlvbi54O1xuICAgICAgdmFyIHBieSA9IGIucG9zaXRpb24ueTtcbiAgICAgIHZhciBwYnogPSBiLnBvc2l0aW9uLno7XG4gICAgICB2YXIgcGN4ID0gYy5wb3NpdGlvbi54O1xuICAgICAgdmFyIHBjeSA9IGMucG9zaXRpb24ueTtcbiAgICAgIHZhciBwY3ogPSBjLnBvc2l0aW9uLno7XG4gICAgICB2YXIgYncgPSBiLmhhbGZXaWR0aDtcbiAgICAgIHZhciBiaCA9IGIuaGFsZkhlaWdodDtcbiAgICAgIHZhciBiZCA9IGIuaGFsZkRlcHRoO1xuICAgICAgdmFyIGNoID0gYy5oYWxmSGVpZ2h0O1xuICAgICAgdmFyIHIgPSBjLnJhZGl1cztcblxuICAgICAgdmFyIEQgPSBiLmRpbWVudGlvbnM7XG5cbiAgICAgIHZhciBud3ggPSBEWzBdOy8vYi5ub3JtYWxEaXJlY3Rpb25XaWR0aC54O1xuICAgICAgdmFyIG53eSA9IERbMV07Ly9iLm5vcm1hbERpcmVjdGlvbldpZHRoLnk7XG4gICAgICB2YXIgbnd6ID0gRFsyXTsvL2Iubm9ybWFsRGlyZWN0aW9uV2lkdGguejtcbiAgICAgIHZhciBuaHggPSBEWzNdOy8vYi5ub3JtYWxEaXJlY3Rpb25IZWlnaHQueDtcbiAgICAgIHZhciBuaHkgPSBEWzRdOy8vYi5ub3JtYWxEaXJlY3Rpb25IZWlnaHQueTtcbiAgICAgIHZhciBuaHogPSBEWzVdOy8vYi5ub3JtYWxEaXJlY3Rpb25IZWlnaHQuejtcbiAgICAgIHZhciBuZHggPSBEWzZdOy8vYi5ub3JtYWxEaXJlY3Rpb25EZXB0aC54O1xuICAgICAgdmFyIG5keSA9IERbN107Ly9iLm5vcm1hbERpcmVjdGlvbkRlcHRoLnk7XG4gICAgICB2YXIgbmR6ID0gRFs4XTsvL2Iubm9ybWFsRGlyZWN0aW9uRGVwdGguejtcblxuICAgICAgdmFyIGR3eCA9IERbOV07Ly9iLmhhbGZEaXJlY3Rpb25XaWR0aC54O1xuICAgICAgdmFyIGR3eSA9IERbMTBdOy8vYi5oYWxmRGlyZWN0aW9uV2lkdGgueTtcbiAgICAgIHZhciBkd3ogPSBEWzExXTsvL2IuaGFsZkRpcmVjdGlvbldpZHRoLno7XG4gICAgICB2YXIgZGh4ID0gRFsxMl07Ly9iLmhhbGZEaXJlY3Rpb25IZWlnaHQueDtcbiAgICAgIHZhciBkaHkgPSBEWzEzXTsvL2IuaGFsZkRpcmVjdGlvbkhlaWdodC55O1xuICAgICAgdmFyIGRoeiA9IERbMTRdOy8vYi5oYWxmRGlyZWN0aW9uSGVpZ2h0Lno7XG4gICAgICB2YXIgZGR4ID0gRFsxNV07Ly9iLmhhbGZEaXJlY3Rpb25EZXB0aC54O1xuICAgICAgdmFyIGRkeSA9IERbMTZdOy8vYi5oYWxmRGlyZWN0aW9uRGVwdGgueTtcbiAgICAgIHZhciBkZHogPSBEWzE3XTsvL2IuaGFsZkRpcmVjdGlvbkRlcHRoLno7XG5cbiAgICAgIHZhciBuY3ggPSBjLm5vcm1hbERpcmVjdGlvbi54O1xuICAgICAgdmFyIG5jeSA9IGMubm9ybWFsRGlyZWN0aW9uLnk7XG4gICAgICB2YXIgbmN6ID0gYy5ub3JtYWxEaXJlY3Rpb24uejtcbiAgICAgIHZhciBkY3ggPSBjLmhhbGZEaXJlY3Rpb24ueDtcbiAgICAgIHZhciBkY3kgPSBjLmhhbGZEaXJlY3Rpb24ueTtcbiAgICAgIHZhciBkY3ogPSBjLmhhbGZEaXJlY3Rpb24uejtcbiAgICAgIHZhciBueCA9IHNlcC54O1xuICAgICAgdmFyIG55ID0gc2VwLnk7XG4gICAgICB2YXIgbnogPSBzZXAuejtcbiAgICAgIHZhciBkb3R3ID0gbnggKiBud3ggKyBueSAqIG53eSArIG56ICogbnd6O1xuICAgICAgdmFyIGRvdGggPSBueCAqIG5oeCArIG55ICogbmh5ICsgbnogKiBuaHo7XG4gICAgICB2YXIgZG90ZCA9IG54ICogbmR4ICsgbnkgKiBuZHkgKyBueiAqIG5kejtcbiAgICAgIHZhciBkb3RjID0gbnggKiBuY3ggKyBueSAqIG5jeSArIG56ICogbmN6O1xuICAgICAgdmFyIHJpZ2h0MSA9IGRvdHcgPiAwO1xuICAgICAgdmFyIHJpZ2h0MiA9IGRvdGggPiAwO1xuICAgICAgdmFyIHJpZ2h0MyA9IGRvdGQgPiAwO1xuICAgICAgdmFyIHJpZ2h0NCA9IGRvdGMgPiAwO1xuICAgICAgaWYgKCFyaWdodDEpIGRvdHcgPSAtZG90dztcbiAgICAgIGlmICghcmlnaHQyKSBkb3RoID0gLWRvdGg7XG4gICAgICBpZiAoIXJpZ2h0MykgZG90ZCA9IC1kb3RkO1xuICAgICAgaWYgKCFyaWdodDQpIGRvdGMgPSAtZG90YztcbiAgICAgIHZhciBzdGF0ZSA9IDA7XG4gICAgICBpZiAoZG90YyA+IDAuOTk5KSB7XG4gICAgICAgIGlmIChkb3R3ID4gMC45OTkpIHtcbiAgICAgICAgICBpZiAoZG90dyA+IGRvdGMpIHN0YXRlID0gMTtcbiAgICAgICAgICBlbHNlIHN0YXRlID0gNDtcbiAgICAgICAgfSBlbHNlIGlmIChkb3RoID4gMC45OTkpIHtcbiAgICAgICAgICBpZiAoZG90aCA+IGRvdGMpIHN0YXRlID0gMjtcbiAgICAgICAgICBlbHNlIHN0YXRlID0gNDtcbiAgICAgICAgfSBlbHNlIGlmIChkb3RkID4gMC45OTkpIHtcbiAgICAgICAgICBpZiAoZG90ZCA+IGRvdGMpIHN0YXRlID0gMztcbiAgICAgICAgICBlbHNlIHN0YXRlID0gNDtcbiAgICAgICAgfSBlbHNlIHN0YXRlID0gNDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChkb3R3ID4gMC45OTkpIHN0YXRlID0gMTtcbiAgICAgICAgZWxzZSBpZiAoZG90aCA+IDAuOTk5KSBzdGF0ZSA9IDI7XG4gICAgICAgIGVsc2UgaWYgKGRvdGQgPiAwLjk5OSkgc3RhdGUgPSAzO1xuICAgICAgfVxuICAgICAgdmFyIGNieDtcbiAgICAgIHZhciBjYnk7XG4gICAgICB2YXIgY2J6O1xuICAgICAgdmFyIGNjeDtcbiAgICAgIHZhciBjY3k7XG4gICAgICB2YXIgY2N6O1xuICAgICAgdmFyIHIwMDtcbiAgICAgIHZhciByMDE7XG4gICAgICB2YXIgcjAyO1xuICAgICAgdmFyIHIxMDtcbiAgICAgIHZhciByMTE7XG4gICAgICB2YXIgcjEyO1xuICAgICAgdmFyIHIyMDtcbiAgICAgIHZhciByMjE7XG4gICAgICB2YXIgcjIyO1xuICAgICAgdmFyIHB4O1xuICAgICAgdmFyIHB5O1xuICAgICAgdmFyIHB6O1xuICAgICAgdmFyIHBkO1xuICAgICAgdmFyIGRvdDtcbiAgICAgIHZhciBsZW47XG4gICAgICB2YXIgdHg7XG4gICAgICB2YXIgdHk7XG4gICAgICB2YXIgdHo7XG4gICAgICB2YXIgdGQ7XG4gICAgICB2YXIgZHg7XG4gICAgICB2YXIgZHk7XG4gICAgICB2YXIgZHo7XG4gICAgICB2YXIgZDF4O1xuICAgICAgdmFyIGQxeTtcbiAgICAgIHZhciBkMXo7XG4gICAgICB2YXIgZDJ4O1xuICAgICAgdmFyIGQyeTtcbiAgICAgIHZhciBkMno7XG4gICAgICB2YXIgc3g7XG4gICAgICB2YXIgc3k7XG4gICAgICB2YXIgc3o7XG4gICAgICB2YXIgc2Q7XG4gICAgICB2YXIgZXg7XG4gICAgICB2YXIgZXk7XG4gICAgICB2YXIgZXo7XG4gICAgICB2YXIgZWQ7XG4gICAgICB2YXIgZG90MTtcbiAgICAgIHZhciBkb3QyO1xuICAgICAgdmFyIHQxO1xuICAgICAgdmFyIGRpcjF4O1xuICAgICAgdmFyIGRpcjF5O1xuICAgICAgdmFyIGRpcjF6O1xuICAgICAgdmFyIGRpcjJ4O1xuICAgICAgdmFyIGRpcjJ5O1xuICAgICAgdmFyIGRpcjJ6O1xuICAgICAgdmFyIGRpcjFsO1xuICAgICAgdmFyIGRpcjJsO1xuICAgICAgaWYgKHN0YXRlID09IDApIHtcbiAgICAgICAgLy9tYW5pZm9sZC5hZGRQb2ludChwb3MueCxwb3MueSxwb3MueixueCxueSxueixkZXAueCxiLGMsMCwwLGZhbHNlKTtcbiAgICAgICAgbWFuaWZvbGQuYWRkUG9pbnQocG9zLngsIHBvcy55LCBwb3MueiwgbngsIG55LCBueiwgZGVwLngsIHRoaXMuZmxpcCk7XG4gICAgICB9IGVsc2UgaWYgKHN0YXRlID09IDQpIHtcbiAgICAgICAgaWYgKHJpZ2h0NCkge1xuICAgICAgICAgIGNjeCA9IHBjeCAtIGRjeDtcbiAgICAgICAgICBjY3kgPSBwY3kgLSBkY3k7XG4gICAgICAgICAgY2N6ID0gcGN6IC0gZGN6O1xuICAgICAgICAgIG54ID0gLW5jeDtcbiAgICAgICAgICBueSA9IC1uY3k7XG4gICAgICAgICAgbnogPSAtbmN6O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNjeCA9IHBjeCArIGRjeDtcbiAgICAgICAgICBjY3kgPSBwY3kgKyBkY3k7XG4gICAgICAgICAgY2N6ID0gcGN6ICsgZGN6O1xuICAgICAgICAgIG54ID0gbmN4O1xuICAgICAgICAgIG55ID0gbmN5O1xuICAgICAgICAgIG56ID0gbmN6O1xuICAgICAgICB9XG4gICAgICAgIHZhciB2MXg7XG4gICAgICAgIHZhciB2MXk7XG4gICAgICAgIHZhciB2MXo7XG4gICAgICAgIHZhciB2Mng7XG4gICAgICAgIHZhciB2Mnk7XG4gICAgICAgIHZhciB2Mno7XG4gICAgICAgIHZhciB2M3g7XG4gICAgICAgIHZhciB2M3k7XG4gICAgICAgIHZhciB2M3o7XG4gICAgICAgIHZhciB2NHg7XG4gICAgICAgIHZhciB2NHk7XG4gICAgICAgIHZhciB2NHo7XG5cbiAgICAgICAgZG90ID0gMTtcbiAgICAgICAgc3RhdGUgPSAwO1xuICAgICAgICBkb3QxID0gbnd4ICogbnggKyBud3kgKiBueSArIG53eiAqIG56O1xuICAgICAgICBpZiAoZG90MSA8IGRvdCkge1xuICAgICAgICAgIGRvdCA9IGRvdDE7XG4gICAgICAgICAgc3RhdGUgPSAwO1xuICAgICAgICB9XG4gICAgICAgIGlmICgtZG90MSA8IGRvdCkge1xuICAgICAgICAgIGRvdCA9IC1kb3QxO1xuICAgICAgICAgIHN0YXRlID0gMTtcbiAgICAgICAgfVxuICAgICAgICBkb3QxID0gbmh4ICogbnggKyBuaHkgKiBueSArIG5oeiAqIG56O1xuICAgICAgICBpZiAoZG90MSA8IGRvdCkge1xuICAgICAgICAgIGRvdCA9IGRvdDE7XG4gICAgICAgICAgc3RhdGUgPSAyO1xuICAgICAgICB9XG4gICAgICAgIGlmICgtZG90MSA8IGRvdCkge1xuICAgICAgICAgIGRvdCA9IC1kb3QxO1xuICAgICAgICAgIHN0YXRlID0gMztcbiAgICAgICAgfVxuICAgICAgICBkb3QxID0gbmR4ICogbnggKyBuZHkgKiBueSArIG5keiAqIG56O1xuICAgICAgICBpZiAoZG90MSA8IGRvdCkge1xuICAgICAgICAgIGRvdCA9IGRvdDE7XG4gICAgICAgICAgc3RhdGUgPSA0O1xuICAgICAgICB9XG4gICAgICAgIGlmICgtZG90MSA8IGRvdCkge1xuICAgICAgICAgIGRvdCA9IC1kb3QxO1xuICAgICAgICAgIHN0YXRlID0gNTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgdiA9IGIuZWxlbWVudHM7XG4gICAgICAgIHN3aXRjaCAoc3RhdGUpIHtcbiAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICAvL3Y9Yi52ZXJ0ZXgxO1xuICAgICAgICAgICAgdjF4ID0gdlswXTsvL3YueDtcbiAgICAgICAgICAgIHYxeSA9IHZbMV07Ly92Lnk7XG4gICAgICAgICAgICB2MXogPSB2WzJdOy8vdi56O1xuICAgICAgICAgICAgLy92PWIudmVydGV4MztcbiAgICAgICAgICAgIHYyeCA9IHZbNl07Ly92Lng7XG4gICAgICAgICAgICB2MnkgPSB2WzddOy8vdi55O1xuICAgICAgICAgICAgdjJ6ID0gdls4XTsvL3YuejtcbiAgICAgICAgICAgIC8vdj1iLnZlcnRleDQ7XG4gICAgICAgICAgICB2M3ggPSB2WzldOy8vdi54O1xuICAgICAgICAgICAgdjN5ID0gdlsxMF07Ly92Lnk7XG4gICAgICAgICAgICB2M3ogPSB2WzExXTsvL3YuejtcbiAgICAgICAgICAgIC8vdj1iLnZlcnRleDI7XG4gICAgICAgICAgICB2NHggPSB2WzNdOy8vdi54O1xuICAgICAgICAgICAgdjR5ID0gdls0XTsvL3YueTtcbiAgICAgICAgICAgIHY0eiA9IHZbNV07Ly92Lno7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAvL3Y9Yi52ZXJ0ZXg2O1xuICAgICAgICAgICAgdjF4ID0gdlsxNV07Ly92Lng7XG4gICAgICAgICAgICB2MXkgPSB2WzE2XTsvL3YueTtcbiAgICAgICAgICAgIHYxeiA9IHZbMTddOy8vdi56O1xuICAgICAgICAgICAgLy92PWIudmVydGV4ODtcbiAgICAgICAgICAgIHYyeCA9IHZbMjFdOy8vdi54O1xuICAgICAgICAgICAgdjJ5ID0gdlsyMl07Ly92Lnk7XG4gICAgICAgICAgICB2MnogPSB2WzIzXTsvL3YuejtcbiAgICAgICAgICAgIC8vdj1iLnZlcnRleDc7XG4gICAgICAgICAgICB2M3ggPSB2WzE4XTsvL3YueDtcbiAgICAgICAgICAgIHYzeSA9IHZbMTldOy8vdi55O1xuICAgICAgICAgICAgdjN6ID0gdlsyMF07Ly92Lno7XG4gICAgICAgICAgICAvL3Y9Yi52ZXJ0ZXg1O1xuICAgICAgICAgICAgdjR4ID0gdlsxMl07Ly92Lng7XG4gICAgICAgICAgICB2NHkgPSB2WzEzXTsvL3YueTtcbiAgICAgICAgICAgIHY0eiA9IHZbMTRdOy8vdi56O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgLy92PWIudmVydGV4NTtcbiAgICAgICAgICAgIHYxeCA9IHZbMTJdOy8vdi54O1xuICAgICAgICAgICAgdjF5ID0gdlsxM107Ly92Lnk7XG4gICAgICAgICAgICB2MXogPSB2WzE0XTsvL3YuejtcbiAgICAgICAgICAgIC8vdj1iLnZlcnRleDE7XG4gICAgICAgICAgICB2MnggPSB2WzBdOy8vdi54O1xuICAgICAgICAgICAgdjJ5ID0gdlsxXTsvL3YueTtcbiAgICAgICAgICAgIHYyeiA9IHZbMl07Ly92Lno7XG4gICAgICAgICAgICAvL3Y9Yi52ZXJ0ZXgyO1xuICAgICAgICAgICAgdjN4ID0gdlszXTsvL3YueDtcbiAgICAgICAgICAgIHYzeSA9IHZbNF07Ly92Lnk7XG4gICAgICAgICAgICB2M3ogPSB2WzVdOy8vdi56O1xuICAgICAgICAgICAgLy92PWIudmVydGV4NjtcbiAgICAgICAgICAgIHY0eCA9IHZbMTVdOy8vdi54O1xuICAgICAgICAgICAgdjR5ID0gdlsxNl07Ly92Lnk7XG4gICAgICAgICAgICB2NHogPSB2WzE3XTsvL3YuejtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgIC8vdj1iLnZlcnRleDg7XG4gICAgICAgICAgICB2MXggPSB2WzIxXTsvL3YueDtcbiAgICAgICAgICAgIHYxeSA9IHZbMjJdOy8vdi55O1xuICAgICAgICAgICAgdjF6ID0gdlsyM107Ly92Lno7XG4gICAgICAgICAgICAvL3Y9Yi52ZXJ0ZXg0O1xuICAgICAgICAgICAgdjJ4ID0gdls5XTsvL3YueDtcbiAgICAgICAgICAgIHYyeSA9IHZbMTBdOy8vdi55O1xuICAgICAgICAgICAgdjJ6ID0gdlsxMV07Ly92Lno7XG4gICAgICAgICAgICAvL3Y9Yi52ZXJ0ZXgzO1xuICAgICAgICAgICAgdjN4ID0gdls2XTsvL3YueDtcbiAgICAgICAgICAgIHYzeSA9IHZbN107Ly92Lnk7XG4gICAgICAgICAgICB2M3ogPSB2WzhdOy8vdi56O1xuICAgICAgICAgICAgLy92PWIudmVydGV4NztcbiAgICAgICAgICAgIHY0eCA9IHZbMThdOy8vdi54O1xuICAgICAgICAgICAgdjR5ID0gdlsxOV07Ly92Lnk7XG4gICAgICAgICAgICB2NHogPSB2WzIwXTsvL3YuejtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgIC8vdj1iLnZlcnRleDU7XG4gICAgICAgICAgICB2MXggPSB2WzEyXTsvL3YueDtcbiAgICAgICAgICAgIHYxeSA9IHZbMTNdOy8vdi55O1xuICAgICAgICAgICAgdjF6ID0gdlsxNF07Ly92Lno7XG4gICAgICAgICAgICAvL3Y9Yi52ZXJ0ZXg3O1xuICAgICAgICAgICAgdjJ4ID0gdlsxOF07Ly92Lng7XG4gICAgICAgICAgICB2MnkgPSB2WzE5XTsvL3YueTtcbiAgICAgICAgICAgIHYyeiA9IHZbMjBdOy8vdi56O1xuICAgICAgICAgICAgLy92PWIudmVydGV4MztcbiAgICAgICAgICAgIHYzeCA9IHZbNl07Ly92Lng7XG4gICAgICAgICAgICB2M3kgPSB2WzddOy8vdi55O1xuICAgICAgICAgICAgdjN6ID0gdls4XTsvL3YuejtcbiAgICAgICAgICAgIC8vdj1iLnZlcnRleDE7XG4gICAgICAgICAgICB2NHggPSB2WzBdOy8vdi54O1xuICAgICAgICAgICAgdjR5ID0gdlsxXTsvL3YueTtcbiAgICAgICAgICAgIHY0eiA9IHZbMl07Ly92Lno7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDU6XG4gICAgICAgICAgICAvL3Y9Yi52ZXJ0ZXgyO1xuICAgICAgICAgICAgdjF4ID0gdlszXTsvL3YueDtcbiAgICAgICAgICAgIHYxeSA9IHZbNF07Ly92Lnk7XG4gICAgICAgICAgICB2MXogPSB2WzVdOy8vdi56O1xuICAgICAgICAgICAgLy92PWIudmVydGV4NDtcbiAgICAgICAgICAgIHYyeCA9IHZbOV07Ly92Lng7XG4gICAgICAgICAgICB2MnkgPSB2WzEwXTsvL3YueTtcbiAgICAgICAgICAgIHYyeiA9IHZbMTFdOy8vdi56O1xuICAgICAgICAgICAgLy92PWIudmVydGV4ODtcbiAgICAgICAgICAgIHYzeCA9IHZbMjFdOy8vdi54O1xuICAgICAgICAgICAgdjN5ID0gdlsyMl07Ly92Lnk7XG4gICAgICAgICAgICB2M3ogPSB2WzIzXTsvL3YuejtcbiAgICAgICAgICAgIC8vdj1iLnZlcnRleDY7XG4gICAgICAgICAgICB2NHggPSB2WzE1XTsvL3YueDtcbiAgICAgICAgICAgIHY0eSA9IHZbMTZdOy8vdi55O1xuICAgICAgICAgICAgdjR6ID0gdlsxN107Ly92Lno7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBwZCA9IG54ICogKHYxeCAtIGNjeCkgKyBueSAqICh2MXkgLSBjY3kpICsgbnogKiAodjF6IC0gY2N6KTtcbiAgICAgICAgaWYgKHBkIDw9IDApIG1hbmlmb2xkLmFkZFBvaW50KHYxeCwgdjF5LCB2MXosIC1ueCwgLW55LCAtbnosIHBkLCB0aGlzLmZsaXApO1xuICAgICAgICBwZCA9IG54ICogKHYyeCAtIGNjeCkgKyBueSAqICh2MnkgLSBjY3kpICsgbnogKiAodjJ6IC0gY2N6KTtcbiAgICAgICAgaWYgKHBkIDw9IDApIG1hbmlmb2xkLmFkZFBvaW50KHYyeCwgdjJ5LCB2MnosIC1ueCwgLW55LCAtbnosIHBkLCB0aGlzLmZsaXApO1xuICAgICAgICBwZCA9IG54ICogKHYzeCAtIGNjeCkgKyBueSAqICh2M3kgLSBjY3kpICsgbnogKiAodjN6IC0gY2N6KTtcbiAgICAgICAgaWYgKHBkIDw9IDApIG1hbmlmb2xkLmFkZFBvaW50KHYzeCwgdjN5LCB2M3osIC1ueCwgLW55LCAtbnosIHBkLCB0aGlzLmZsaXApO1xuICAgICAgICBwZCA9IG54ICogKHY0eCAtIGNjeCkgKyBueSAqICh2NHkgLSBjY3kpICsgbnogKiAodjR6IC0gY2N6KTtcbiAgICAgICAgaWYgKHBkIDw9IDApIG1hbmlmb2xkLmFkZFBvaW50KHY0eCwgdjR5LCB2NHosIC1ueCwgLW55LCAtbnosIHBkLCB0aGlzLmZsaXApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3dpdGNoIChzdGF0ZSkge1xuICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgIGlmIChyaWdodDEpIHtcbiAgICAgICAgICAgICAgY2J4ID0gcGJ4ICsgZHd4O1xuICAgICAgICAgICAgICBjYnkgPSBwYnkgKyBkd3k7XG4gICAgICAgICAgICAgIGNieiA9IHBieiArIGR3ejtcbiAgICAgICAgICAgICAgbnggPSBud3g7XG4gICAgICAgICAgICAgIG55ID0gbnd5O1xuICAgICAgICAgICAgICBueiA9IG53ejtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGNieCA9IHBieCAtIGR3eDtcbiAgICAgICAgICAgICAgY2J5ID0gcGJ5IC0gZHd5O1xuICAgICAgICAgICAgICBjYnogPSBwYnogLSBkd3o7XG4gICAgICAgICAgICAgIG54ID0gLW53eDtcbiAgICAgICAgICAgICAgbnkgPSAtbnd5O1xuICAgICAgICAgICAgICBueiA9IC1ud3o7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkaXIxeCA9IG5oeDtcbiAgICAgICAgICAgIGRpcjF5ID0gbmh5O1xuICAgICAgICAgICAgZGlyMXogPSBuaHo7XG4gICAgICAgICAgICBkaXIxbCA9IGJoO1xuICAgICAgICAgICAgZGlyMnggPSBuZHg7XG4gICAgICAgICAgICBkaXIyeSA9IG5keTtcbiAgICAgICAgICAgIGRpcjJ6ID0gbmR6O1xuICAgICAgICAgICAgZGlyMmwgPSBiZDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIGlmIChyaWdodDIpIHtcbiAgICAgICAgICAgICAgY2J4ID0gcGJ4ICsgZGh4O1xuICAgICAgICAgICAgICBjYnkgPSBwYnkgKyBkaHk7XG4gICAgICAgICAgICAgIGNieiA9IHBieiArIGRoejtcbiAgICAgICAgICAgICAgbnggPSBuaHg7XG4gICAgICAgICAgICAgIG55ID0gbmh5O1xuICAgICAgICAgICAgICBueiA9IG5oejtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGNieCA9IHBieCAtIGRoeDtcbiAgICAgICAgICAgICAgY2J5ID0gcGJ5IC0gZGh5O1xuICAgICAgICAgICAgICBjYnogPSBwYnogLSBkaHo7XG4gICAgICAgICAgICAgIG54ID0gLW5oeDtcbiAgICAgICAgICAgICAgbnkgPSAtbmh5O1xuICAgICAgICAgICAgICBueiA9IC1uaHo7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkaXIxeCA9IG53eDtcbiAgICAgICAgICAgIGRpcjF5ID0gbnd5O1xuICAgICAgICAgICAgZGlyMXogPSBud3o7XG4gICAgICAgICAgICBkaXIxbCA9IGJ3O1xuICAgICAgICAgICAgZGlyMnggPSBuZHg7XG4gICAgICAgICAgICBkaXIyeSA9IG5keTtcbiAgICAgICAgICAgIGRpcjJ6ID0gbmR6O1xuICAgICAgICAgICAgZGlyMmwgPSBiZDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgIGlmIChyaWdodDMpIHtcbiAgICAgICAgICAgICAgY2J4ID0gcGJ4ICsgZGR4O1xuICAgICAgICAgICAgICBjYnkgPSBwYnkgKyBkZHk7XG4gICAgICAgICAgICAgIGNieiA9IHBieiArIGRkejtcbiAgICAgICAgICAgICAgbnggPSBuZHg7XG4gICAgICAgICAgICAgIG55ID0gbmR5O1xuICAgICAgICAgICAgICBueiA9IG5kejtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGNieCA9IHBieCAtIGRkeDtcbiAgICAgICAgICAgICAgY2J5ID0gcGJ5IC0gZGR5O1xuICAgICAgICAgICAgICBjYnogPSBwYnogLSBkZHo7XG4gICAgICAgICAgICAgIG54ID0gLW5keDtcbiAgICAgICAgICAgICAgbnkgPSAtbmR5O1xuICAgICAgICAgICAgICBueiA9IC1uZHo7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkaXIxeCA9IG53eDtcbiAgICAgICAgICAgIGRpcjF5ID0gbnd5O1xuICAgICAgICAgICAgZGlyMXogPSBud3o7XG4gICAgICAgICAgICBkaXIxbCA9IGJ3O1xuICAgICAgICAgICAgZGlyMnggPSBuaHg7XG4gICAgICAgICAgICBkaXIyeSA9IG5oeTtcbiAgICAgICAgICAgIGRpcjJ6ID0gbmh6O1xuICAgICAgICAgICAgZGlyMmwgPSBiaDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGRvdCA9IG54ICogbmN4ICsgbnkgKiBuY3kgKyBueiAqIG5jejtcbiAgICAgICAgaWYgKGRvdCA8IDApIGxlbiA9IGNoO1xuICAgICAgICBlbHNlIGxlbiA9IC1jaDtcbiAgICAgICAgY2N4ID0gcGN4ICsgbGVuICogbmN4O1xuICAgICAgICBjY3kgPSBwY3kgKyBsZW4gKiBuY3k7XG4gICAgICAgIGNjeiA9IHBjeiArIGxlbiAqIG5jejtcbiAgICAgICAgaWYgKGRvdGMgPj0gMC45OTk5OTkpIHtcbiAgICAgICAgICB0eCA9IC1ueTtcbiAgICAgICAgICB0eSA9IG56O1xuICAgICAgICAgIHR6ID0gbng7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdHggPSBueDtcbiAgICAgICAgICB0eSA9IG55O1xuICAgICAgICAgIHR6ID0gbno7XG4gICAgICAgIH1cbiAgICAgICAgbGVuID0gdHggKiBuY3ggKyB0eSAqIG5jeSArIHR6ICogbmN6O1xuICAgICAgICBkeCA9IGxlbiAqIG5jeCAtIHR4O1xuICAgICAgICBkeSA9IGxlbiAqIG5jeSAtIHR5O1xuICAgICAgICBkeiA9IGxlbiAqIG5jeiAtIHR6O1xuICAgICAgICBsZW4gPSBfTWF0aC5zcXJ0KGR4ICogZHggKyBkeSAqIGR5ICsgZHogKiBkeik7XG4gICAgICAgIGlmIChsZW4gPT0gMCkgcmV0dXJuO1xuICAgICAgICBsZW4gPSByIC8gbGVuO1xuICAgICAgICBkeCAqPSBsZW47XG4gICAgICAgIGR5ICo9IGxlbjtcbiAgICAgICAgZHogKj0gbGVuO1xuICAgICAgICB0eCA9IGNjeCArIGR4O1xuICAgICAgICB0eSA9IGNjeSArIGR5O1xuICAgICAgICB0eiA9IGNjeiArIGR6O1xuICAgICAgICBpZiAoZG90IDwgLTAuOTYgfHwgZG90ID4gMC45Nikge1xuICAgICAgICAgIHIwMCA9IG5jeCAqIG5jeCAqIDEuNSAtIDAuNTtcbiAgICAgICAgICByMDEgPSBuY3ggKiBuY3kgKiAxLjUgLSBuY3ogKiAwLjg2NjAyNTQwMztcbiAgICAgICAgICByMDIgPSBuY3ggKiBuY3ogKiAxLjUgKyBuY3kgKiAwLjg2NjAyNTQwMztcbiAgICAgICAgICByMTAgPSBuY3kgKiBuY3ggKiAxLjUgKyBuY3ogKiAwLjg2NjAyNTQwMztcbiAgICAgICAgICByMTEgPSBuY3kgKiBuY3kgKiAxLjUgLSAwLjU7XG4gICAgICAgICAgcjEyID0gbmN5ICogbmN6ICogMS41IC0gbmN4ICogMC44NjYwMjU0MDM7XG4gICAgICAgICAgcjIwID0gbmN6ICogbmN4ICogMS41IC0gbmN5ICogMC44NjYwMjU0MDM7XG4gICAgICAgICAgcjIxID0gbmN6ICogbmN5ICogMS41ICsgbmN4ICogMC44NjYwMjU0MDM7XG4gICAgICAgICAgcjIyID0gbmN6ICogbmN6ICogMS41IC0gMC41O1xuICAgICAgICAgIHB4ID0gdHg7XG4gICAgICAgICAgcHkgPSB0eTtcbiAgICAgICAgICBweiA9IHR6O1xuICAgICAgICAgIHBkID0gbnggKiAocHggLSBjYngpICsgbnkgKiAocHkgLSBjYnkpICsgbnogKiAocHogLSBjYnopO1xuICAgICAgICAgIHR4ID0gcHggLSBwZCAqIG54IC0gY2J4O1xuICAgICAgICAgIHR5ID0gcHkgLSBwZCAqIG55IC0gY2J5O1xuICAgICAgICAgIHR6ID0gcHogLSBwZCAqIG56IC0gY2J6O1xuICAgICAgICAgIHNkID0gZGlyMXggKiB0eCArIGRpcjF5ICogdHkgKyBkaXIxeiAqIHR6O1xuICAgICAgICAgIGVkID0gZGlyMnggKiB0eCArIGRpcjJ5ICogdHkgKyBkaXIyeiAqIHR6O1xuICAgICAgICAgIGlmIChzZCA8IC1kaXIxbCkgc2QgPSAtZGlyMWw7XG4gICAgICAgICAgZWxzZSBpZiAoc2QgPiBkaXIxbCkgc2QgPSBkaXIxbDtcbiAgICAgICAgICBpZiAoZWQgPCAtZGlyMmwpIGVkID0gLWRpcjJsO1xuICAgICAgICAgIGVsc2UgaWYgKGVkID4gZGlyMmwpIGVkID0gZGlyMmw7XG4gICAgICAgICAgdHggPSBzZCAqIGRpcjF4ICsgZWQgKiBkaXIyeDtcbiAgICAgICAgICB0eSA9IHNkICogZGlyMXkgKyBlZCAqIGRpcjJ5O1xuICAgICAgICAgIHR6ID0gc2QgKiBkaXIxeiArIGVkICogZGlyMno7XG4gICAgICAgICAgcHggPSBjYnggKyB0eDtcbiAgICAgICAgICBweSA9IGNieSArIHR5O1xuICAgICAgICAgIHB6ID0gY2J6ICsgdHo7XG4gICAgICAgICAgbWFuaWZvbGQuYWRkUG9pbnQocHgsIHB5LCBweiwgbngsIG55LCBueiwgcGQsIHRoaXMuZmxpcCk7XG4gICAgICAgICAgcHggPSBkeCAqIHIwMCArIGR5ICogcjAxICsgZHogKiByMDI7XG4gICAgICAgICAgcHkgPSBkeCAqIHIxMCArIGR5ICogcjExICsgZHogKiByMTI7XG4gICAgICAgICAgcHogPSBkeCAqIHIyMCArIGR5ICogcjIxICsgZHogKiByMjI7XG4gICAgICAgICAgcHggPSAoZHggPSBweCkgKyBjY3g7XG4gICAgICAgICAgcHkgPSAoZHkgPSBweSkgKyBjY3k7XG4gICAgICAgICAgcHogPSAoZHogPSBweikgKyBjY3o7XG4gICAgICAgICAgcGQgPSBueCAqIChweCAtIGNieCkgKyBueSAqIChweSAtIGNieSkgKyBueiAqIChweiAtIGNieik7XG4gICAgICAgICAgaWYgKHBkIDw9IDApIHtcbiAgICAgICAgICAgIHR4ID0gcHggLSBwZCAqIG54IC0gY2J4O1xuICAgICAgICAgICAgdHkgPSBweSAtIHBkICogbnkgLSBjYnk7XG4gICAgICAgICAgICB0eiA9IHB6IC0gcGQgKiBueiAtIGNiejtcbiAgICAgICAgICAgIHNkID0gZGlyMXggKiB0eCArIGRpcjF5ICogdHkgKyBkaXIxeiAqIHR6O1xuICAgICAgICAgICAgZWQgPSBkaXIyeCAqIHR4ICsgZGlyMnkgKiB0eSArIGRpcjJ6ICogdHo7XG4gICAgICAgICAgICBpZiAoc2QgPCAtZGlyMWwpIHNkID0gLWRpcjFsO1xuICAgICAgICAgICAgZWxzZSBpZiAoc2QgPiBkaXIxbCkgc2QgPSBkaXIxbDtcbiAgICAgICAgICAgIGlmIChlZCA8IC1kaXIybCkgZWQgPSAtZGlyMmw7XG4gICAgICAgICAgICBlbHNlIGlmIChlZCA+IGRpcjJsKSBlZCA9IGRpcjJsO1xuICAgICAgICAgICAgdHggPSBzZCAqIGRpcjF4ICsgZWQgKiBkaXIyeDtcbiAgICAgICAgICAgIHR5ID0gc2QgKiBkaXIxeSArIGVkICogZGlyMnk7XG4gICAgICAgICAgICB0eiA9IHNkICogZGlyMXogKyBlZCAqIGRpcjJ6O1xuICAgICAgICAgICAgcHggPSBjYnggKyB0eDtcbiAgICAgICAgICAgIHB5ID0gY2J5ICsgdHk7XG4gICAgICAgICAgICBweiA9IGNieiArIHR6O1xuICAgICAgICAgICAgLy9tYW5pZm9sZC5hZGRQb2ludChweCxweSxweixueCxueSxueixwZCxiLGMsMiwwLGZhbHNlKTtcbiAgICAgICAgICAgIG1hbmlmb2xkLmFkZFBvaW50KHB4LCBweSwgcHosIG54LCBueSwgbnosIHBkLCB0aGlzLmZsaXApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBweCA9IGR4ICogcjAwICsgZHkgKiByMDEgKyBkeiAqIHIwMjtcbiAgICAgICAgICBweSA9IGR4ICogcjEwICsgZHkgKiByMTEgKyBkeiAqIHIxMjtcbiAgICAgICAgICBweiA9IGR4ICogcjIwICsgZHkgKiByMjEgKyBkeiAqIHIyMjtcbiAgICAgICAgICBweCA9IChkeCA9IHB4KSArIGNjeDtcbiAgICAgICAgICBweSA9IChkeSA9IHB5KSArIGNjeTtcbiAgICAgICAgICBweiA9IChkeiA9IHB6KSArIGNjejtcbiAgICAgICAgICBwZCA9IG54ICogKHB4IC0gY2J4KSArIG55ICogKHB5IC0gY2J5KSArIG56ICogKHB6IC0gY2J6KTtcbiAgICAgICAgICBpZiAocGQgPD0gMCkge1xuICAgICAgICAgICAgdHggPSBweCAtIHBkICogbnggLSBjYng7XG4gICAgICAgICAgICB0eSA9IHB5IC0gcGQgKiBueSAtIGNieTtcbiAgICAgICAgICAgIHR6ID0gcHogLSBwZCAqIG56IC0gY2J6O1xuICAgICAgICAgICAgc2QgPSBkaXIxeCAqIHR4ICsgZGlyMXkgKiB0eSArIGRpcjF6ICogdHo7XG4gICAgICAgICAgICBlZCA9IGRpcjJ4ICogdHggKyBkaXIyeSAqIHR5ICsgZGlyMnogKiB0ejtcbiAgICAgICAgICAgIGlmIChzZCA8IC1kaXIxbCkgc2QgPSAtZGlyMWw7XG4gICAgICAgICAgICBlbHNlIGlmIChzZCA+IGRpcjFsKSBzZCA9IGRpcjFsO1xuICAgICAgICAgICAgaWYgKGVkIDwgLWRpcjJsKSBlZCA9IC1kaXIybDtcbiAgICAgICAgICAgIGVsc2UgaWYgKGVkID4gZGlyMmwpIGVkID0gZGlyMmw7XG4gICAgICAgICAgICB0eCA9IHNkICogZGlyMXggKyBlZCAqIGRpcjJ4O1xuICAgICAgICAgICAgdHkgPSBzZCAqIGRpcjF5ICsgZWQgKiBkaXIyeTtcbiAgICAgICAgICAgIHR6ID0gc2QgKiBkaXIxeiArIGVkICogZGlyMno7XG4gICAgICAgICAgICBweCA9IGNieCArIHR4O1xuICAgICAgICAgICAgcHkgPSBjYnkgKyB0eTtcbiAgICAgICAgICAgIHB6ID0gY2J6ICsgdHo7XG4gICAgICAgICAgICAvL21hbmlmb2xkLmFkZFBvaW50KHB4LHB5LHB6LG54LG55LG56LHBkLGIsYywzLDAsZmFsc2UpO1xuICAgICAgICAgICAgbWFuaWZvbGQuYWRkUG9pbnQocHgsIHB5LCBweiwgbngsIG55LCBueiwgcGQsIHRoaXMuZmxpcCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN4ID0gdHg7XG4gICAgICAgICAgc3kgPSB0eTtcbiAgICAgICAgICBzeiA9IHR6O1xuICAgICAgICAgIHNkID0gbnggKiAoc3ggLSBjYngpICsgbnkgKiAoc3kgLSBjYnkpICsgbnogKiAoc3ogLSBjYnopO1xuICAgICAgICAgIHN4IC09IHNkICogbng7XG4gICAgICAgICAgc3kgLT0gc2QgKiBueTtcbiAgICAgICAgICBzeiAtPSBzZCAqIG56O1xuICAgICAgICAgIGlmIChkb3QgPiAwKSB7XG4gICAgICAgICAgICBleCA9IHR4ICsgZGN4ICogMjtcbiAgICAgICAgICAgIGV5ID0gdHkgKyBkY3kgKiAyO1xuICAgICAgICAgICAgZXogPSB0eiArIGRjeiAqIDI7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGV4ID0gdHggLSBkY3ggKiAyO1xuICAgICAgICAgICAgZXkgPSB0eSAtIGRjeSAqIDI7XG4gICAgICAgICAgICBleiA9IHR6IC0gZGN6ICogMjtcbiAgICAgICAgICB9XG4gICAgICAgICAgZWQgPSBueCAqIChleCAtIGNieCkgKyBueSAqIChleSAtIGNieSkgKyBueiAqIChleiAtIGNieik7XG4gICAgICAgICAgZXggLT0gZWQgKiBueDtcbiAgICAgICAgICBleSAtPSBlZCAqIG55O1xuICAgICAgICAgIGV6IC09IGVkICogbno7XG4gICAgICAgICAgZDF4ID0gc3ggLSBjYng7XG4gICAgICAgICAgZDF5ID0gc3kgLSBjYnk7XG4gICAgICAgICAgZDF6ID0gc3ogLSBjYno7XG4gICAgICAgICAgZDJ4ID0gZXggLSBjYng7XG4gICAgICAgICAgZDJ5ID0gZXkgLSBjYnk7XG4gICAgICAgICAgZDJ6ID0gZXogLSBjYno7XG4gICAgICAgICAgdHggPSBleCAtIHN4O1xuICAgICAgICAgIHR5ID0gZXkgLSBzeTtcbiAgICAgICAgICB0eiA9IGV6IC0gc3o7XG4gICAgICAgICAgdGQgPSBlZCAtIHNkO1xuICAgICAgICAgIGRvdHcgPSBkMXggKiBkaXIxeCArIGQxeSAqIGRpcjF5ICsgZDF6ICogZGlyMXo7XG4gICAgICAgICAgZG90aCA9IGQyeCAqIGRpcjF4ICsgZDJ5ICogZGlyMXkgKyBkMnogKiBkaXIxejtcbiAgICAgICAgICBkb3QxID0gZG90dyAtIGRpcjFsO1xuICAgICAgICAgIGRvdDIgPSBkb3RoIC0gZGlyMWw7XG4gICAgICAgICAgaWYgKGRvdDEgPiAwKSB7XG4gICAgICAgICAgICBpZiAoZG90MiA+IDApIHJldHVybjtcbiAgICAgICAgICAgIHQxID0gZG90MSAvIChkb3QxIC0gZG90Mik7XG4gICAgICAgICAgICBzeCA9IHN4ICsgdHggKiB0MTtcbiAgICAgICAgICAgIHN5ID0gc3kgKyB0eSAqIHQxO1xuICAgICAgICAgICAgc3ogPSBzeiArIHR6ICogdDE7XG4gICAgICAgICAgICBzZCA9IHNkICsgdGQgKiB0MTtcbiAgICAgICAgICAgIGQxeCA9IHN4IC0gY2J4O1xuICAgICAgICAgICAgZDF5ID0gc3kgLSBjYnk7XG4gICAgICAgICAgICBkMXogPSBzeiAtIGNiejtcbiAgICAgICAgICAgIGRvdHcgPSBkMXggKiBkaXIxeCArIGQxeSAqIGRpcjF5ICsgZDF6ICogZGlyMXo7XG4gICAgICAgICAgICB0eCA9IGV4IC0gc3g7XG4gICAgICAgICAgICB0eSA9IGV5IC0gc3k7XG4gICAgICAgICAgICB0eiA9IGV6IC0gc3o7XG4gICAgICAgICAgICB0ZCA9IGVkIC0gc2Q7XG4gICAgICAgICAgfSBlbHNlIGlmIChkb3QyID4gMCkge1xuICAgICAgICAgICAgdDEgPSBkb3QxIC8gKGRvdDEgLSBkb3QyKTtcbiAgICAgICAgICAgIGV4ID0gc3ggKyB0eCAqIHQxO1xuICAgICAgICAgICAgZXkgPSBzeSArIHR5ICogdDE7XG4gICAgICAgICAgICBleiA9IHN6ICsgdHogKiB0MTtcbiAgICAgICAgICAgIGVkID0gc2QgKyB0ZCAqIHQxO1xuICAgICAgICAgICAgZDJ4ID0gZXggLSBjYng7XG4gICAgICAgICAgICBkMnkgPSBleSAtIGNieTtcbiAgICAgICAgICAgIGQyeiA9IGV6IC0gY2J6O1xuICAgICAgICAgICAgZG90aCA9IGQyeCAqIGRpcjF4ICsgZDJ5ICogZGlyMXkgKyBkMnogKiBkaXIxejtcbiAgICAgICAgICAgIHR4ID0gZXggLSBzeDtcbiAgICAgICAgICAgIHR5ID0gZXkgLSBzeTtcbiAgICAgICAgICAgIHR6ID0gZXogLSBzejtcbiAgICAgICAgICAgIHRkID0gZWQgLSBzZDtcbiAgICAgICAgICB9XG4gICAgICAgICAgZG90MSA9IGRvdHcgKyBkaXIxbDtcbiAgICAgICAgICBkb3QyID0gZG90aCArIGRpcjFsO1xuICAgICAgICAgIGlmIChkb3QxIDwgMCkge1xuICAgICAgICAgICAgaWYgKGRvdDIgPCAwKSByZXR1cm47XG4gICAgICAgICAgICB0MSA9IGRvdDEgLyAoZG90MSAtIGRvdDIpO1xuICAgICAgICAgICAgc3ggPSBzeCArIHR4ICogdDE7XG4gICAgICAgICAgICBzeSA9IHN5ICsgdHkgKiB0MTtcbiAgICAgICAgICAgIHN6ID0gc3ogKyB0eiAqIHQxO1xuICAgICAgICAgICAgc2QgPSBzZCArIHRkICogdDE7XG4gICAgICAgICAgICBkMXggPSBzeCAtIGNieDtcbiAgICAgICAgICAgIGQxeSA9IHN5IC0gY2J5O1xuICAgICAgICAgICAgZDF6ID0gc3ogLSBjYno7XG4gICAgICAgICAgICB0eCA9IGV4IC0gc3g7XG4gICAgICAgICAgICB0eSA9IGV5IC0gc3k7XG4gICAgICAgICAgICB0eiA9IGV6IC0gc3o7XG4gICAgICAgICAgICB0ZCA9IGVkIC0gc2Q7XG4gICAgICAgICAgfSBlbHNlIGlmIChkb3QyIDwgMCkge1xuICAgICAgICAgICAgdDEgPSBkb3QxIC8gKGRvdDEgLSBkb3QyKTtcbiAgICAgICAgICAgIGV4ID0gc3ggKyB0eCAqIHQxO1xuICAgICAgICAgICAgZXkgPSBzeSArIHR5ICogdDE7XG4gICAgICAgICAgICBleiA9IHN6ICsgdHogKiB0MTtcbiAgICAgICAgICAgIGVkID0gc2QgKyB0ZCAqIHQxO1xuICAgICAgICAgICAgZDJ4ID0gZXggLSBjYng7XG4gICAgICAgICAgICBkMnkgPSBleSAtIGNieTtcbiAgICAgICAgICAgIGQyeiA9IGV6IC0gY2J6O1xuICAgICAgICAgICAgdHggPSBleCAtIHN4O1xuICAgICAgICAgICAgdHkgPSBleSAtIHN5O1xuICAgICAgICAgICAgdHogPSBleiAtIHN6O1xuICAgICAgICAgICAgdGQgPSBlZCAtIHNkO1xuICAgICAgICAgIH1cbiAgICAgICAgICBkb3R3ID0gZDF4ICogZGlyMnggKyBkMXkgKiBkaXIyeSArIGQxeiAqIGRpcjJ6O1xuICAgICAgICAgIGRvdGggPSBkMnggKiBkaXIyeCArIGQyeSAqIGRpcjJ5ICsgZDJ6ICogZGlyMno7XG4gICAgICAgICAgZG90MSA9IGRvdHcgLSBkaXIybDtcbiAgICAgICAgICBkb3QyID0gZG90aCAtIGRpcjJsO1xuICAgICAgICAgIGlmIChkb3QxID4gMCkge1xuICAgICAgICAgICAgaWYgKGRvdDIgPiAwKSByZXR1cm47XG4gICAgICAgICAgICB0MSA9IGRvdDEgLyAoZG90MSAtIGRvdDIpO1xuICAgICAgICAgICAgc3ggPSBzeCArIHR4ICogdDE7XG4gICAgICAgICAgICBzeSA9IHN5ICsgdHkgKiB0MTtcbiAgICAgICAgICAgIHN6ID0gc3ogKyB0eiAqIHQxO1xuICAgICAgICAgICAgc2QgPSBzZCArIHRkICogdDE7XG4gICAgICAgICAgICBkMXggPSBzeCAtIGNieDtcbiAgICAgICAgICAgIGQxeSA9IHN5IC0gY2J5O1xuICAgICAgICAgICAgZDF6ID0gc3ogLSBjYno7XG4gICAgICAgICAgICBkb3R3ID0gZDF4ICogZGlyMnggKyBkMXkgKiBkaXIyeSArIGQxeiAqIGRpcjJ6O1xuICAgICAgICAgICAgdHggPSBleCAtIHN4O1xuICAgICAgICAgICAgdHkgPSBleSAtIHN5O1xuICAgICAgICAgICAgdHogPSBleiAtIHN6O1xuICAgICAgICAgICAgdGQgPSBlZCAtIHNkO1xuICAgICAgICAgIH0gZWxzZSBpZiAoZG90MiA+IDApIHtcbiAgICAgICAgICAgIHQxID0gZG90MSAvIChkb3QxIC0gZG90Mik7XG4gICAgICAgICAgICBleCA9IHN4ICsgdHggKiB0MTtcbiAgICAgICAgICAgIGV5ID0gc3kgKyB0eSAqIHQxO1xuICAgICAgICAgICAgZXogPSBzeiArIHR6ICogdDE7XG4gICAgICAgICAgICBlZCA9IHNkICsgdGQgKiB0MTtcbiAgICAgICAgICAgIGQyeCA9IGV4IC0gY2J4O1xuICAgICAgICAgICAgZDJ5ID0gZXkgLSBjYnk7XG4gICAgICAgICAgICBkMnogPSBleiAtIGNiejtcbiAgICAgICAgICAgIGRvdGggPSBkMnggKiBkaXIyeCArIGQyeSAqIGRpcjJ5ICsgZDJ6ICogZGlyMno7XG4gICAgICAgICAgICB0eCA9IGV4IC0gc3g7XG4gICAgICAgICAgICB0eSA9IGV5IC0gc3k7XG4gICAgICAgICAgICB0eiA9IGV6IC0gc3o7XG4gICAgICAgICAgICB0ZCA9IGVkIC0gc2Q7XG4gICAgICAgICAgfVxuICAgICAgICAgIGRvdDEgPSBkb3R3ICsgZGlyMmw7XG4gICAgICAgICAgZG90MiA9IGRvdGggKyBkaXIybDtcbiAgICAgICAgICBpZiAoZG90MSA8IDApIHtcbiAgICAgICAgICAgIGlmIChkb3QyIDwgMCkgcmV0dXJuO1xuICAgICAgICAgICAgdDEgPSBkb3QxIC8gKGRvdDEgLSBkb3QyKTtcbiAgICAgICAgICAgIHN4ID0gc3ggKyB0eCAqIHQxO1xuICAgICAgICAgICAgc3kgPSBzeSArIHR5ICogdDE7XG4gICAgICAgICAgICBzeiA9IHN6ICsgdHogKiB0MTtcbiAgICAgICAgICAgIHNkID0gc2QgKyB0ZCAqIHQxO1xuICAgICAgICAgIH0gZWxzZSBpZiAoZG90MiA8IDApIHtcbiAgICAgICAgICAgIHQxID0gZG90MSAvIChkb3QxIC0gZG90Mik7XG4gICAgICAgICAgICBleCA9IHN4ICsgdHggKiB0MTtcbiAgICAgICAgICAgIGV5ID0gc3kgKyB0eSAqIHQxO1xuICAgICAgICAgICAgZXogPSBzeiArIHR6ICogdDE7XG4gICAgICAgICAgICBlZCA9IHNkICsgdGQgKiB0MTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHNkIDwgMCkge1xuICAgICAgICAgICAgLy9tYW5pZm9sZC5hZGRQb2ludChzeCxzeSxzeixueCxueSxueixzZCxiLGMsMSwwLGZhbHNlKTtcbiAgICAgICAgICAgIG1hbmlmb2xkLmFkZFBvaW50KHN4LCBzeSwgc3osIG54LCBueSwgbnosIHNkLCB0aGlzLmZsaXApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoZWQgPCAwKSB7XG4gICAgICAgICAgICAvL21hbmlmb2xkLmFkZFBvaW50KGV4LGV5LGV6LG54LG55LG56LGVkLGIsYyw0LDAsZmFsc2UpO1xuICAgICAgICAgICAgbWFuaWZvbGQuYWRkUG9pbnQoZXgsIGV5LCBleiwgbngsIG55LCBueiwgZWQsIHRoaXMuZmxpcCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICB9XG5cbiAgfSk7XG5cbiAgZnVuY3Rpb24gQ3lsaW5kZXJDeWxpbmRlckNvbGxpc2lvbkRldGVjdG9yKCkge1xuXG4gICAgQ29sbGlzaW9uRGV0ZWN0b3IuY2FsbCh0aGlzKTtcblxuICB9XG4gIEN5bGluZGVyQ3lsaW5kZXJDb2xsaXNpb25EZXRlY3Rvci5wcm90b3R5cGUgPSBPYmplY3QuYXNzaWduKE9iamVjdC5jcmVhdGUoQ29sbGlzaW9uRGV0ZWN0b3IucHJvdG90eXBlKSwge1xuXG4gICAgY29uc3RydWN0b3I6IEN5bGluZGVyQ3lsaW5kZXJDb2xsaXNpb25EZXRlY3RvcixcblxuXG4gICAgZ2V0U2VwOiBmdW5jdGlvbiAoYzEsIGMyLCBzZXAsIHBvcywgZGVwKSB7XG5cbiAgICAgIHZhciB0MXg7XG4gICAgICB2YXIgdDF5O1xuICAgICAgdmFyIHQxejtcbiAgICAgIHZhciB0Mng7XG4gICAgICB2YXIgdDJ5O1xuICAgICAgdmFyIHQyejtcbiAgICAgIHZhciBzdXAgPSBuZXcgVmVjMygpO1xuICAgICAgdmFyIGxlbjtcbiAgICAgIHZhciBwMXg7XG4gICAgICB2YXIgcDF5O1xuICAgICAgdmFyIHAxejtcbiAgICAgIHZhciBwMng7XG4gICAgICB2YXIgcDJ5O1xuICAgICAgdmFyIHAyejtcbiAgICAgIHZhciB2MDF4ID0gYzEucG9zaXRpb24ueDtcbiAgICAgIHZhciB2MDF5ID0gYzEucG9zaXRpb24ueTtcbiAgICAgIHZhciB2MDF6ID0gYzEucG9zaXRpb24uejtcbiAgICAgIHZhciB2MDJ4ID0gYzIucG9zaXRpb24ueDtcbiAgICAgIHZhciB2MDJ5ID0gYzIucG9zaXRpb24ueTtcbiAgICAgIHZhciB2MDJ6ID0gYzIucG9zaXRpb24uejtcbiAgICAgIHZhciB2MHggPSB2MDJ4IC0gdjAxeDtcbiAgICAgIHZhciB2MHkgPSB2MDJ5IC0gdjAxeTtcbiAgICAgIHZhciB2MHogPSB2MDJ6IC0gdjAxejtcbiAgICAgIGlmICh2MHggKiB2MHggKyB2MHkgKiB2MHkgKyB2MHogKiB2MHogPT0gMCkgdjB5ID0gMC4wMDE7XG4gICAgICB2YXIgbnggPSAtdjB4O1xuICAgICAgdmFyIG55ID0gLXYweTtcbiAgICAgIHZhciBueiA9IC12MHo7XG4gICAgICB0aGlzLnN1cHBvcnRQb2ludChjMSwgLW54LCAtbnksIC1ueiwgc3VwKTtcbiAgICAgIHZhciB2MTF4ID0gc3VwLng7XG4gICAgICB2YXIgdjExeSA9IHN1cC55O1xuICAgICAgdmFyIHYxMXogPSBzdXAuejtcbiAgICAgIHRoaXMuc3VwcG9ydFBvaW50KGMyLCBueCwgbnksIG56LCBzdXApO1xuICAgICAgdmFyIHYxMnggPSBzdXAueDtcbiAgICAgIHZhciB2MTJ5ID0gc3VwLnk7XG4gICAgICB2YXIgdjEyeiA9IHN1cC56O1xuICAgICAgdmFyIHYxeCA9IHYxMnggLSB2MTF4O1xuICAgICAgdmFyIHYxeSA9IHYxMnkgLSB2MTF5O1xuICAgICAgdmFyIHYxeiA9IHYxMnogLSB2MTF6O1xuICAgICAgaWYgKHYxeCAqIG54ICsgdjF5ICogbnkgKyB2MXogKiBueiA8PSAwKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIG54ID0gdjF5ICogdjB6IC0gdjF6ICogdjB5O1xuICAgICAgbnkgPSB2MXogKiB2MHggLSB2MXggKiB2MHo7XG4gICAgICBueiA9IHYxeCAqIHYweSAtIHYxeSAqIHYweDtcbiAgICAgIGlmIChueCAqIG54ICsgbnkgKiBueSArIG56ICogbnogPT0gMCkge1xuICAgICAgICBzZXAuc2V0KHYxeCAtIHYweCwgdjF5IC0gdjB5LCB2MXogLSB2MHopLm5vcm1hbGl6ZSgpO1xuICAgICAgICBwb3Muc2V0KCh2MTF4ICsgdjEyeCkgKiAwLjUsICh2MTF5ICsgdjEyeSkgKiAwLjUsICh2MTF6ICsgdjEyeikgKiAwLjUpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIHRoaXMuc3VwcG9ydFBvaW50KGMxLCAtbngsIC1ueSwgLW56LCBzdXApO1xuICAgICAgdmFyIHYyMXggPSBzdXAueDtcbiAgICAgIHZhciB2MjF5ID0gc3VwLnk7XG4gICAgICB2YXIgdjIxeiA9IHN1cC56O1xuICAgICAgdGhpcy5zdXBwb3J0UG9pbnQoYzIsIG54LCBueSwgbnosIHN1cCk7XG4gICAgICB2YXIgdjIyeCA9IHN1cC54O1xuICAgICAgdmFyIHYyMnkgPSBzdXAueTtcbiAgICAgIHZhciB2MjJ6ID0gc3VwLno7XG4gICAgICB2YXIgdjJ4ID0gdjIyeCAtIHYyMXg7XG4gICAgICB2YXIgdjJ5ID0gdjIyeSAtIHYyMXk7XG4gICAgICB2YXIgdjJ6ID0gdjIyeiAtIHYyMXo7XG4gICAgICBpZiAodjJ4ICogbnggKyB2MnkgKiBueSArIHYyeiAqIG56IDw9IDApIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgdDF4ID0gdjF4IC0gdjB4O1xuICAgICAgdDF5ID0gdjF5IC0gdjB5O1xuICAgICAgdDF6ID0gdjF6IC0gdjB6O1xuICAgICAgdDJ4ID0gdjJ4IC0gdjB4O1xuICAgICAgdDJ5ID0gdjJ5IC0gdjB5O1xuICAgICAgdDJ6ID0gdjJ6IC0gdjB6O1xuICAgICAgbnggPSB0MXkgKiB0MnogLSB0MXogKiB0Mnk7XG4gICAgICBueSA9IHQxeiAqIHQyeCAtIHQxeCAqIHQyejtcbiAgICAgIG56ID0gdDF4ICogdDJ5IC0gdDF5ICogdDJ4O1xuICAgICAgaWYgKG54ICogdjB4ICsgbnkgKiB2MHkgKyBueiAqIHYweiA+IDApIHtcbiAgICAgICAgdDF4ID0gdjF4O1xuICAgICAgICB0MXkgPSB2MXk7XG4gICAgICAgIHQxeiA9IHYxejtcbiAgICAgICAgdjF4ID0gdjJ4O1xuICAgICAgICB2MXkgPSB2Mnk7XG4gICAgICAgIHYxeiA9IHYyejtcbiAgICAgICAgdjJ4ID0gdDF4O1xuICAgICAgICB2MnkgPSB0MXk7XG4gICAgICAgIHYyeiA9IHQxejtcbiAgICAgICAgdDF4ID0gdjExeDtcbiAgICAgICAgdDF5ID0gdjExeTtcbiAgICAgICAgdDF6ID0gdjExejtcbiAgICAgICAgdjExeCA9IHYyMXg7XG4gICAgICAgIHYxMXkgPSB2MjF5O1xuICAgICAgICB2MTF6ID0gdjIxejtcbiAgICAgICAgdjIxeCA9IHQxeDtcbiAgICAgICAgdjIxeSA9IHQxeTtcbiAgICAgICAgdjIxeiA9IHQxejtcbiAgICAgICAgdDF4ID0gdjEyeDtcbiAgICAgICAgdDF5ID0gdjEyeTtcbiAgICAgICAgdDF6ID0gdjEyejtcbiAgICAgICAgdjEyeCA9IHYyMng7XG4gICAgICAgIHYxMnkgPSB2MjJ5O1xuICAgICAgICB2MTJ6ID0gdjIyejtcbiAgICAgICAgdjIyeCA9IHQxeDtcbiAgICAgICAgdjIyeSA9IHQxeTtcbiAgICAgICAgdjIyeiA9IHQxejtcbiAgICAgICAgbnggPSAtbng7XG4gICAgICAgIG55ID0gLW55O1xuICAgICAgICBueiA9IC1uejtcbiAgICAgIH1cbiAgICAgIHZhciBpdGVyYXRpb25zID0gMDtcbiAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgIGlmICgrK2l0ZXJhdGlvbnMgPiAxMDApIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zdXBwb3J0UG9pbnQoYzEsIC1ueCwgLW55LCAtbnosIHN1cCk7XG4gICAgICAgIHZhciB2MzF4ID0gc3VwLng7XG4gICAgICAgIHZhciB2MzF5ID0gc3VwLnk7XG4gICAgICAgIHZhciB2MzF6ID0gc3VwLno7XG4gICAgICAgIHRoaXMuc3VwcG9ydFBvaW50KGMyLCBueCwgbnksIG56LCBzdXApO1xuICAgICAgICB2YXIgdjMyeCA9IHN1cC54O1xuICAgICAgICB2YXIgdjMyeSA9IHN1cC55O1xuICAgICAgICB2YXIgdjMyeiA9IHN1cC56O1xuICAgICAgICB2YXIgdjN4ID0gdjMyeCAtIHYzMXg7XG4gICAgICAgIHZhciB2M3kgPSB2MzJ5IC0gdjMxeTtcbiAgICAgICAgdmFyIHYzeiA9IHYzMnogLSB2MzF6O1xuICAgICAgICBpZiAodjN4ICogbnggKyB2M3kgKiBueSArIHYzeiAqIG56IDw9IDApIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCh2MXkgKiB2M3ogLSB2MXogKiB2M3kpICogdjB4ICsgKHYxeiAqIHYzeCAtIHYxeCAqIHYzeikgKiB2MHkgKyAodjF4ICogdjN5IC0gdjF5ICogdjN4KSAqIHYweiA8IDApIHtcbiAgICAgICAgICB2MnggPSB2M3g7XG4gICAgICAgICAgdjJ5ID0gdjN5O1xuICAgICAgICAgIHYyeiA9IHYzejtcbiAgICAgICAgICB2MjF4ID0gdjMxeDtcbiAgICAgICAgICB2MjF5ID0gdjMxeTtcbiAgICAgICAgICB2MjF6ID0gdjMxejtcbiAgICAgICAgICB2MjJ4ID0gdjMyeDtcbiAgICAgICAgICB2MjJ5ID0gdjMyeTtcbiAgICAgICAgICB2MjJ6ID0gdjMyejtcbiAgICAgICAgICB0MXggPSB2MXggLSB2MHg7XG4gICAgICAgICAgdDF5ID0gdjF5IC0gdjB5O1xuICAgICAgICAgIHQxeiA9IHYxeiAtIHYwejtcbiAgICAgICAgICB0MnggPSB2M3ggLSB2MHg7XG4gICAgICAgICAgdDJ5ID0gdjN5IC0gdjB5O1xuICAgICAgICAgIHQyeiA9IHYzeiAtIHYwejtcbiAgICAgICAgICBueCA9IHQxeSAqIHQyeiAtIHQxeiAqIHQyeTtcbiAgICAgICAgICBueSA9IHQxeiAqIHQyeCAtIHQxeCAqIHQyejtcbiAgICAgICAgICBueiA9IHQxeCAqIHQyeSAtIHQxeSAqIHQyeDtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoKHYzeSAqIHYyeiAtIHYzeiAqIHYyeSkgKiB2MHggKyAodjN6ICogdjJ4IC0gdjN4ICogdjJ6KSAqIHYweSArICh2M3ggKiB2MnkgLSB2M3kgKiB2MngpICogdjB6IDwgMCkge1xuICAgICAgICAgIHYxeCA9IHYzeDtcbiAgICAgICAgICB2MXkgPSB2M3k7XG4gICAgICAgICAgdjF6ID0gdjN6O1xuICAgICAgICAgIHYxMXggPSB2MzF4O1xuICAgICAgICAgIHYxMXkgPSB2MzF5O1xuICAgICAgICAgIHYxMXogPSB2MzF6O1xuICAgICAgICAgIHYxMnggPSB2MzJ4O1xuICAgICAgICAgIHYxMnkgPSB2MzJ5O1xuICAgICAgICAgIHYxMnogPSB2MzJ6O1xuICAgICAgICAgIHQxeCA9IHYzeCAtIHYweDtcbiAgICAgICAgICB0MXkgPSB2M3kgLSB2MHk7XG4gICAgICAgICAgdDF6ID0gdjN6IC0gdjB6O1xuICAgICAgICAgIHQyeCA9IHYyeCAtIHYweDtcbiAgICAgICAgICB0MnkgPSB2MnkgLSB2MHk7XG4gICAgICAgICAgdDJ6ID0gdjJ6IC0gdjB6O1xuICAgICAgICAgIG54ID0gdDF5ICogdDJ6IC0gdDF6ICogdDJ5O1xuICAgICAgICAgIG55ID0gdDF6ICogdDJ4IC0gdDF4ICogdDJ6O1xuICAgICAgICAgIG56ID0gdDF4ICogdDJ5IC0gdDF5ICogdDJ4O1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIHZhciBoaXQgPSBmYWxzZTtcbiAgICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgICB0MXggPSB2MnggLSB2MXg7XG4gICAgICAgICAgdDF5ID0gdjJ5IC0gdjF5O1xuICAgICAgICAgIHQxeiA9IHYyeiAtIHYxejtcbiAgICAgICAgICB0MnggPSB2M3ggLSB2MXg7XG4gICAgICAgICAgdDJ5ID0gdjN5IC0gdjF5O1xuICAgICAgICAgIHQyeiA9IHYzeiAtIHYxejtcbiAgICAgICAgICBueCA9IHQxeSAqIHQyeiAtIHQxeiAqIHQyeTtcbiAgICAgICAgICBueSA9IHQxeiAqIHQyeCAtIHQxeCAqIHQyejtcbiAgICAgICAgICBueiA9IHQxeCAqIHQyeSAtIHQxeSAqIHQyeDtcbiAgICAgICAgICBsZW4gPSAxIC8gX01hdGguc3FydChueCAqIG54ICsgbnkgKiBueSArIG56ICogbnopO1xuICAgICAgICAgIG54ICo9IGxlbjtcbiAgICAgICAgICBueSAqPSBsZW47XG4gICAgICAgICAgbnogKj0gbGVuO1xuICAgICAgICAgIGlmIChueCAqIHYxeCArIG55ICogdjF5ICsgbnogKiB2MXogPj0gMCAmJiAhaGl0KSB7XG4gICAgICAgICAgICB2YXIgYjAgPSAodjF5ICogdjJ6IC0gdjF6ICogdjJ5KSAqIHYzeCArICh2MXogKiB2MnggLSB2MXggKiB2MnopICogdjN5ICsgKHYxeCAqIHYyeSAtIHYxeSAqIHYyeCkgKiB2M3o7XG4gICAgICAgICAgICB2YXIgYjEgPSAodjN5ICogdjJ6IC0gdjN6ICogdjJ5KSAqIHYweCArICh2M3ogKiB2MnggLSB2M3ggKiB2MnopICogdjB5ICsgKHYzeCAqIHYyeSAtIHYzeSAqIHYyeCkgKiB2MHo7XG4gICAgICAgICAgICB2YXIgYjIgPSAodjB5ICogdjF6IC0gdjB6ICogdjF5KSAqIHYzeCArICh2MHogKiB2MXggLSB2MHggKiB2MXopICogdjN5ICsgKHYweCAqIHYxeSAtIHYweSAqIHYxeCkgKiB2M3o7XG4gICAgICAgICAgICB2YXIgYjMgPSAodjJ5ICogdjF6IC0gdjJ6ICogdjF5KSAqIHYweCArICh2MnogKiB2MXggLSB2MnggKiB2MXopICogdjB5ICsgKHYyeCAqIHYxeSAtIHYyeSAqIHYxeCkgKiB2MHo7XG4gICAgICAgICAgICB2YXIgc3VtID0gYjAgKyBiMSArIGIyICsgYjM7XG4gICAgICAgICAgICBpZiAoc3VtIDw9IDApIHtcbiAgICAgICAgICAgICAgYjAgPSAwO1xuICAgICAgICAgICAgICBiMSA9ICh2MnkgKiB2M3ogLSB2MnogKiB2M3kpICogbnggKyAodjJ6ICogdjN4IC0gdjJ4ICogdjN6KSAqIG55ICsgKHYyeCAqIHYzeSAtIHYyeSAqIHYzeCkgKiBuejtcbiAgICAgICAgICAgICAgYjIgPSAodjN5ICogdjJ6IC0gdjN6ICogdjJ5KSAqIG54ICsgKHYzeiAqIHYyeCAtIHYzeCAqIHYyeikgKiBueSArICh2M3ggKiB2MnkgLSB2M3kgKiB2MngpICogbno7XG4gICAgICAgICAgICAgIGIzID0gKHYxeSAqIHYyeiAtIHYxeiAqIHYyeSkgKiBueCArICh2MXogKiB2MnggLSB2MXggKiB2MnopICogbnkgKyAodjF4ICogdjJ5IC0gdjF5ICogdjJ4KSAqIG56O1xuICAgICAgICAgICAgICBzdW0gPSBiMSArIGIyICsgYjM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgaW52ID0gMSAvIHN1bTtcbiAgICAgICAgICAgIHAxeCA9ICh2MDF4ICogYjAgKyB2MTF4ICogYjEgKyB2MjF4ICogYjIgKyB2MzF4ICogYjMpICogaW52O1xuICAgICAgICAgICAgcDF5ID0gKHYwMXkgKiBiMCArIHYxMXkgKiBiMSArIHYyMXkgKiBiMiArIHYzMXkgKiBiMykgKiBpbnY7XG4gICAgICAgICAgICBwMXogPSAodjAxeiAqIGIwICsgdjExeiAqIGIxICsgdjIxeiAqIGIyICsgdjMxeiAqIGIzKSAqIGludjtcbiAgICAgICAgICAgIHAyeCA9ICh2MDJ4ICogYjAgKyB2MTJ4ICogYjEgKyB2MjJ4ICogYjIgKyB2MzJ4ICogYjMpICogaW52O1xuICAgICAgICAgICAgcDJ5ID0gKHYwMnkgKiBiMCArIHYxMnkgKiBiMSArIHYyMnkgKiBiMiArIHYzMnkgKiBiMykgKiBpbnY7XG4gICAgICAgICAgICBwMnogPSAodjAyeiAqIGIwICsgdjEyeiAqIGIxICsgdjIyeiAqIGIyICsgdjMyeiAqIGIzKSAqIGludjtcbiAgICAgICAgICAgIGhpdCA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuc3VwcG9ydFBvaW50KGMxLCAtbngsIC1ueSwgLW56LCBzdXApO1xuICAgICAgICAgIHZhciB2NDF4ID0gc3VwLng7XG4gICAgICAgICAgdmFyIHY0MXkgPSBzdXAueTtcbiAgICAgICAgICB2YXIgdjQxeiA9IHN1cC56O1xuICAgICAgICAgIHRoaXMuc3VwcG9ydFBvaW50KGMyLCBueCwgbnksIG56LCBzdXApO1xuICAgICAgICAgIHZhciB2NDJ4ID0gc3VwLng7XG4gICAgICAgICAgdmFyIHY0MnkgPSBzdXAueTtcbiAgICAgICAgICB2YXIgdjQyeiA9IHN1cC56O1xuICAgICAgICAgIHZhciB2NHggPSB2NDJ4IC0gdjQxeDtcbiAgICAgICAgICB2YXIgdjR5ID0gdjQyeSAtIHY0MXk7XG4gICAgICAgICAgdmFyIHY0eiA9IHY0MnogLSB2NDF6O1xuICAgICAgICAgIHZhciBzZXBhcmF0aW9uID0gLSh2NHggKiBueCArIHY0eSAqIG55ICsgdjR6ICogbnopO1xuICAgICAgICAgIGlmICgodjR4IC0gdjN4KSAqIG54ICsgKHY0eSAtIHYzeSkgKiBueSArICh2NHogLSB2M3opICogbnogPD0gMC4wMSB8fCBzZXBhcmF0aW9uID49IDApIHtcbiAgICAgICAgICAgIGlmIChoaXQpIHtcbiAgICAgICAgICAgICAgc2VwLnNldCgtbngsIC1ueSwgLW56KTtcbiAgICAgICAgICAgICAgcG9zLnNldCgocDF4ICsgcDJ4KSAqIDAuNSwgKHAxeSArIHAyeSkgKiAwLjUsIChwMXogKyBwMnopICogMC41KTtcbiAgICAgICAgICAgICAgZGVwLnggPSBzZXBhcmF0aW9uO1xuICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgKHY0eSAqIHYxeiAtIHY0eiAqIHYxeSkgKiB2MHggK1xuICAgICAgICAgICAgKHY0eiAqIHYxeCAtIHY0eCAqIHYxeikgKiB2MHkgK1xuICAgICAgICAgICAgKHY0eCAqIHYxeSAtIHY0eSAqIHYxeCkgKiB2MHogPCAwXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICh2NHkgKiB2MnogLSB2NHogKiB2MnkpICogdjB4ICtcbiAgICAgICAgICAgICAgKHY0eiAqIHYyeCAtIHY0eCAqIHYyeikgKiB2MHkgK1xuICAgICAgICAgICAgICAodjR4ICogdjJ5IC0gdjR5ICogdjJ4KSAqIHYweiA8IDBcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICB2MXggPSB2NHg7XG4gICAgICAgICAgICAgIHYxeSA9IHY0eTtcbiAgICAgICAgICAgICAgdjF6ID0gdjR6O1xuICAgICAgICAgICAgICB2MTF4ID0gdjQxeDtcbiAgICAgICAgICAgICAgdjExeSA9IHY0MXk7XG4gICAgICAgICAgICAgIHYxMXogPSB2NDF6O1xuICAgICAgICAgICAgICB2MTJ4ID0gdjQyeDtcbiAgICAgICAgICAgICAgdjEyeSA9IHY0Mnk7XG4gICAgICAgICAgICAgIHYxMnogPSB2NDJ6O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdjN4ID0gdjR4O1xuICAgICAgICAgICAgICB2M3kgPSB2NHk7XG4gICAgICAgICAgICAgIHYzeiA9IHY0ejtcbiAgICAgICAgICAgICAgdjMxeCA9IHY0MXg7XG4gICAgICAgICAgICAgIHYzMXkgPSB2NDF5O1xuICAgICAgICAgICAgICB2MzF6ID0gdjQxejtcbiAgICAgICAgICAgICAgdjMyeCA9IHY0Mng7XG4gICAgICAgICAgICAgIHYzMnkgPSB2NDJ5O1xuICAgICAgICAgICAgICB2MzJ6ID0gdjQyejtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAodjR5ICogdjN6IC0gdjR6ICogdjN5KSAqIHYweCArXG4gICAgICAgICAgICAgICh2NHogKiB2M3ggLSB2NHggKiB2M3opICogdjB5ICtcbiAgICAgICAgICAgICAgKHY0eCAqIHYzeSAtIHY0eSAqIHYzeCkgKiB2MHogPCAwXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgdjJ4ID0gdjR4O1xuICAgICAgICAgICAgICB2MnkgPSB2NHk7XG4gICAgICAgICAgICAgIHYyeiA9IHY0ejtcbiAgICAgICAgICAgICAgdjIxeCA9IHY0MXg7XG4gICAgICAgICAgICAgIHYyMXkgPSB2NDF5O1xuICAgICAgICAgICAgICB2MjF6ID0gdjQxejtcbiAgICAgICAgICAgICAgdjIyeCA9IHY0Mng7XG4gICAgICAgICAgICAgIHYyMnkgPSB2NDJ5O1xuICAgICAgICAgICAgICB2MjJ6ID0gdjQyejtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHYxeCA9IHY0eDtcbiAgICAgICAgICAgICAgdjF5ID0gdjR5O1xuICAgICAgICAgICAgICB2MXogPSB2NHo7XG4gICAgICAgICAgICAgIHYxMXggPSB2NDF4O1xuICAgICAgICAgICAgICB2MTF5ID0gdjQxeTtcbiAgICAgICAgICAgICAgdjExeiA9IHY0MXo7XG4gICAgICAgICAgICAgIHYxMnggPSB2NDJ4O1xuICAgICAgICAgICAgICB2MTJ5ID0gdjQyeTtcbiAgICAgICAgICAgICAgdjEyeiA9IHY0Mno7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvL3JldHVybiBmYWxzZTtcbiAgICB9LFxuXG4gICAgc3VwcG9ydFBvaW50OiBmdW5jdGlvbiAoYywgZHgsIGR5LCBkeiwgb3V0KSB7XG5cbiAgICAgIHZhciByb3QgPSBjLnJvdGF0aW9uLmVsZW1lbnRzO1xuICAgICAgdmFyIGxkeCA9IHJvdFswXSAqIGR4ICsgcm90WzNdICogZHkgKyByb3RbNl0gKiBkejtcbiAgICAgIHZhciBsZHkgPSByb3RbMV0gKiBkeCArIHJvdFs0XSAqIGR5ICsgcm90WzddICogZHo7XG4gICAgICB2YXIgbGR6ID0gcm90WzJdICogZHggKyByb3RbNV0gKiBkeSArIHJvdFs4XSAqIGR6O1xuICAgICAgdmFyIHJhZHggPSBsZHg7XG4gICAgICB2YXIgcmFkeiA9IGxkejtcbiAgICAgIHZhciBsZW4gPSByYWR4ICogcmFkeCArIHJhZHogKiByYWR6O1xuICAgICAgdmFyIHJhZCA9IGMucmFkaXVzO1xuICAgICAgdmFyIGhoID0gYy5oYWxmSGVpZ2h0O1xuICAgICAgdmFyIG94O1xuICAgICAgdmFyIG95O1xuICAgICAgdmFyIG96O1xuICAgICAgaWYgKGxlbiA9PSAwKSB7XG4gICAgICAgIGlmIChsZHkgPCAwKSB7XG4gICAgICAgICAgb3ggPSByYWQ7XG4gICAgICAgICAgb3kgPSAtaGg7XG4gICAgICAgICAgb3ogPSAwO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG94ID0gcmFkO1xuICAgICAgICAgIG95ID0gaGg7XG4gICAgICAgICAgb3ogPSAwO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsZW4gPSBjLnJhZGl1cyAvIF9NYXRoLnNxcnQobGVuKTtcbiAgICAgICAgaWYgKGxkeSA8IDApIHtcbiAgICAgICAgICBveCA9IHJhZHggKiBsZW47XG4gICAgICAgICAgb3kgPSAtaGg7XG4gICAgICAgICAgb3ogPSByYWR6ICogbGVuO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG94ID0gcmFkeCAqIGxlbjtcbiAgICAgICAgICBveSA9IGhoO1xuICAgICAgICAgIG96ID0gcmFkeiAqIGxlbjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgbGR4ID0gcm90WzBdICogb3ggKyByb3RbMV0gKiBveSArIHJvdFsyXSAqIG96ICsgYy5wb3NpdGlvbi54O1xuICAgICAgbGR5ID0gcm90WzNdICogb3ggKyByb3RbNF0gKiBveSArIHJvdFs1XSAqIG96ICsgYy5wb3NpdGlvbi55O1xuICAgICAgbGR6ID0gcm90WzZdICogb3ggKyByb3RbN10gKiBveSArIHJvdFs4XSAqIG96ICsgYy5wb3NpdGlvbi56O1xuICAgICAgb3V0LnNldChsZHgsIGxkeSwgbGR6KTtcblxuICAgIH0sXG5cbiAgICBkZXRlY3RDb2xsaXNpb246IGZ1bmN0aW9uIChzaGFwZTEsIHNoYXBlMiwgbWFuaWZvbGQpIHtcblxuICAgICAgdmFyIGMxO1xuICAgICAgdmFyIGMyO1xuICAgICAgaWYgKHNoYXBlMS5pZCA8IHNoYXBlMi5pZCkge1xuICAgICAgICBjMSA9IHNoYXBlMTtcbiAgICAgICAgYzIgPSBzaGFwZTI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjMSA9IHNoYXBlMjtcbiAgICAgICAgYzIgPSBzaGFwZTE7XG4gICAgICB9XG4gICAgICB2YXIgcDEgPSBjMS5wb3NpdGlvbjtcbiAgICAgIHZhciBwMiA9IGMyLnBvc2l0aW9uO1xuICAgICAgdmFyIHAxeCA9IHAxLng7XG4gICAgICB2YXIgcDF5ID0gcDEueTtcbiAgICAgIHZhciBwMXogPSBwMS56O1xuICAgICAgdmFyIHAyeCA9IHAyLng7XG4gICAgICB2YXIgcDJ5ID0gcDIueTtcbiAgICAgIHZhciBwMnogPSBwMi56O1xuICAgICAgdmFyIGgxID0gYzEuaGFsZkhlaWdodDtcbiAgICAgIHZhciBoMiA9IGMyLmhhbGZIZWlnaHQ7XG4gICAgICB2YXIgbjEgPSBjMS5ub3JtYWxEaXJlY3Rpb247XG4gICAgICB2YXIgbjIgPSBjMi5ub3JtYWxEaXJlY3Rpb247XG4gICAgICB2YXIgZDEgPSBjMS5oYWxmRGlyZWN0aW9uO1xuICAgICAgdmFyIGQyID0gYzIuaGFsZkRpcmVjdGlvbjtcbiAgICAgIHZhciByMSA9IGMxLnJhZGl1cztcbiAgICAgIHZhciByMiA9IGMyLnJhZGl1cztcbiAgICAgIHZhciBuMXggPSBuMS54O1xuICAgICAgdmFyIG4xeSA9IG4xLnk7XG4gICAgICB2YXIgbjF6ID0gbjEuejtcbiAgICAgIHZhciBuMnggPSBuMi54O1xuICAgICAgdmFyIG4yeSA9IG4yLnk7XG4gICAgICB2YXIgbjJ6ID0gbjIuejtcbiAgICAgIHZhciBkMXggPSBkMS54O1xuICAgICAgdmFyIGQxeSA9IGQxLnk7XG4gICAgICB2YXIgZDF6ID0gZDEuejtcbiAgICAgIHZhciBkMnggPSBkMi54O1xuICAgICAgdmFyIGQyeSA9IGQyLnk7XG4gICAgICB2YXIgZDJ6ID0gZDIuejtcbiAgICAgIHZhciBkeCA9IHAxeCAtIHAyeDtcbiAgICAgIHZhciBkeSA9IHAxeSAtIHAyeTtcbiAgICAgIHZhciBkeiA9IHAxeiAtIHAyejtcbiAgICAgIHZhciBsZW47XG4gICAgICB2YXIgYzF4O1xuICAgICAgdmFyIGMxeTtcbiAgICAgIHZhciBjMXo7XG4gICAgICB2YXIgYzJ4O1xuICAgICAgdmFyIGMyeTtcbiAgICAgIHZhciBjMno7XG4gICAgICB2YXIgdHg7XG4gICAgICB2YXIgdHk7XG4gICAgICB2YXIgdHo7XG4gICAgICB2YXIgc3g7XG4gICAgICB2YXIgc3k7XG4gICAgICB2YXIgc3o7XG4gICAgICB2YXIgZXg7XG4gICAgICB2YXIgZXk7XG4gICAgICB2YXIgZXo7XG4gICAgICB2YXIgZGVwdGgxO1xuICAgICAgdmFyIGRlcHRoMjtcbiAgICAgIHZhciBkb3Q7XG4gICAgICB2YXIgdDE7XG4gICAgICB2YXIgdDI7XG4gICAgICB2YXIgc2VwID0gbmV3IFZlYzMoKTtcbiAgICAgIHZhciBwb3MgPSBuZXcgVmVjMygpO1xuICAgICAgdmFyIGRlcCA9IG5ldyBWZWMzKCk7XG4gICAgICBpZiAoIXRoaXMuZ2V0U2VwKGMxLCBjMiwgc2VwLCBwb3MsIGRlcCkpIHJldHVybjtcbiAgICAgIHZhciBkb3QxID0gc2VwLnggKiBuMXggKyBzZXAueSAqIG4xeSArIHNlcC56ICogbjF6O1xuICAgICAgdmFyIGRvdDIgPSBzZXAueCAqIG4yeCArIHNlcC55ICogbjJ5ICsgc2VwLnogKiBuMno7XG4gICAgICB2YXIgcmlnaHQxID0gZG90MSA+IDA7XG4gICAgICB2YXIgcmlnaHQyID0gZG90MiA+IDA7XG4gICAgICBpZiAoIXJpZ2h0MSkgZG90MSA9IC1kb3QxO1xuICAgICAgaWYgKCFyaWdodDIpIGRvdDIgPSAtZG90MjtcbiAgICAgIHZhciBzdGF0ZSA9IDA7XG4gICAgICBpZiAoZG90MSA+IDAuOTk5IHx8IGRvdDIgPiAwLjk5OSkge1xuICAgICAgICBpZiAoZG90MSA+IGRvdDIpIHN0YXRlID0gMTtcbiAgICAgICAgZWxzZSBzdGF0ZSA9IDI7XG4gICAgICB9XG4gICAgICB2YXIgbng7XG4gICAgICB2YXIgbnk7XG4gICAgICB2YXIgbno7XG4gICAgICB2YXIgZGVwdGggPSBkZXAueDtcbiAgICAgIHZhciByMDA7XG4gICAgICB2YXIgcjAxO1xuICAgICAgdmFyIHIwMjtcbiAgICAgIHZhciByMTA7XG4gICAgICB2YXIgcjExO1xuICAgICAgdmFyIHIxMjtcbiAgICAgIHZhciByMjA7XG4gICAgICB2YXIgcjIxO1xuICAgICAgdmFyIHIyMjtcbiAgICAgIHZhciBweDtcbiAgICAgIHZhciBweTtcbiAgICAgIHZhciBwejtcbiAgICAgIHZhciBwZDtcbiAgICAgIHZhciBhO1xuICAgICAgdmFyIGI7XG4gICAgICB2YXIgZTtcbiAgICAgIHZhciBmO1xuICAgICAgbnggPSBzZXAueDtcbiAgICAgIG55ID0gc2VwLnk7XG4gICAgICBueiA9IHNlcC56O1xuICAgICAgc3dpdGNoIChzdGF0ZSkge1xuICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgbWFuaWZvbGQuYWRkUG9pbnQocG9zLngsIHBvcy55LCBwb3MueiwgbngsIG55LCBueiwgZGVwdGgsIGZhbHNlKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxOlxuICAgICAgICAgIGlmIChyaWdodDEpIHtcbiAgICAgICAgICAgIGMxeCA9IHAxeCArIGQxeDtcbiAgICAgICAgICAgIGMxeSA9IHAxeSArIGQxeTtcbiAgICAgICAgICAgIGMxeiA9IHAxeiArIGQxejtcbiAgICAgICAgICAgIG54ID0gbjF4O1xuICAgICAgICAgICAgbnkgPSBuMXk7XG4gICAgICAgICAgICBueiA9IG4xejtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYzF4ID0gcDF4IC0gZDF4O1xuICAgICAgICAgICAgYzF5ID0gcDF5IC0gZDF5O1xuICAgICAgICAgICAgYzF6ID0gcDF6IC0gZDF6O1xuICAgICAgICAgICAgbnggPSAtbjF4O1xuICAgICAgICAgICAgbnkgPSAtbjF5O1xuICAgICAgICAgICAgbnogPSAtbjF6O1xuICAgICAgICAgIH1cbiAgICAgICAgICBkb3QgPSBueCAqIG4yeCArIG55ICogbjJ5ICsgbnogKiBuMno7XG4gICAgICAgICAgaWYgKGRvdCA8IDApIGxlbiA9IGgyO1xuICAgICAgICAgIGVsc2UgbGVuID0gLWgyO1xuICAgICAgICAgIGMyeCA9IHAyeCArIGxlbiAqIG4yeDtcbiAgICAgICAgICBjMnkgPSBwMnkgKyBsZW4gKiBuMnk7XG4gICAgICAgICAgYzJ6ID0gcDJ6ICsgbGVuICogbjJ6O1xuICAgICAgICAgIGlmIChkb3QyID49IDAuOTk5OTk5KSB7XG4gICAgICAgICAgICB0eCA9IC1ueTtcbiAgICAgICAgICAgIHR5ID0gbno7XG4gICAgICAgICAgICB0eiA9IG54O1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0eCA9IG54O1xuICAgICAgICAgICAgdHkgPSBueTtcbiAgICAgICAgICAgIHR6ID0gbno7XG4gICAgICAgICAgfVxuICAgICAgICAgIGxlbiA9IHR4ICogbjJ4ICsgdHkgKiBuMnkgKyB0eiAqIG4yejtcbiAgICAgICAgICBkeCA9IGxlbiAqIG4yeCAtIHR4O1xuICAgICAgICAgIGR5ID0gbGVuICogbjJ5IC0gdHk7XG4gICAgICAgICAgZHogPSBsZW4gKiBuMnogLSB0ejtcbiAgICAgICAgICBsZW4gPSBfTWF0aC5zcXJ0KGR4ICogZHggKyBkeSAqIGR5ICsgZHogKiBkeik7XG4gICAgICAgICAgaWYgKGxlbiA9PSAwKSBicmVhaztcbiAgICAgICAgICBsZW4gPSByMiAvIGxlbjtcbiAgICAgICAgICBkeCAqPSBsZW47XG4gICAgICAgICAgZHkgKj0gbGVuO1xuICAgICAgICAgIGR6ICo9IGxlbjtcbiAgICAgICAgICB0eCA9IGMyeCArIGR4O1xuICAgICAgICAgIHR5ID0gYzJ5ICsgZHk7XG4gICAgICAgICAgdHogPSBjMnogKyBkejtcbiAgICAgICAgICBpZiAoZG90IDwgLTAuOTYgfHwgZG90ID4gMC45Nikge1xuICAgICAgICAgICAgcjAwID0gbjJ4ICogbjJ4ICogMS41IC0gMC41O1xuICAgICAgICAgICAgcjAxID0gbjJ4ICogbjJ5ICogMS41IC0gbjJ6ICogMC44NjYwMjU0MDM7XG4gICAgICAgICAgICByMDIgPSBuMnggKiBuMnogKiAxLjUgKyBuMnkgKiAwLjg2NjAyNTQwMztcbiAgICAgICAgICAgIHIxMCA9IG4yeSAqIG4yeCAqIDEuNSArIG4yeiAqIDAuODY2MDI1NDAzO1xuICAgICAgICAgICAgcjExID0gbjJ5ICogbjJ5ICogMS41IC0gMC41O1xuICAgICAgICAgICAgcjEyID0gbjJ5ICogbjJ6ICogMS41IC0gbjJ4ICogMC44NjYwMjU0MDM7XG4gICAgICAgICAgICByMjAgPSBuMnogKiBuMnggKiAxLjUgLSBuMnkgKiAwLjg2NjAyNTQwMztcbiAgICAgICAgICAgIHIyMSA9IG4yeiAqIG4yeSAqIDEuNSArIG4yeCAqIDAuODY2MDI1NDAzO1xuICAgICAgICAgICAgcjIyID0gbjJ6ICogbjJ6ICogMS41IC0gMC41O1xuICAgICAgICAgICAgcHggPSB0eDtcbiAgICAgICAgICAgIHB5ID0gdHk7XG4gICAgICAgICAgICBweiA9IHR6O1xuICAgICAgICAgICAgcGQgPSBueCAqIChweCAtIGMxeCkgKyBueSAqIChweSAtIGMxeSkgKyBueiAqIChweiAtIGMxeik7XG4gICAgICAgICAgICB0eCA9IHB4IC0gcGQgKiBueCAtIGMxeDtcbiAgICAgICAgICAgIHR5ID0gcHkgLSBwZCAqIG55IC0gYzF5O1xuICAgICAgICAgICAgdHogPSBweiAtIHBkICogbnogLSBjMXo7XG4gICAgICAgICAgICBsZW4gPSB0eCAqIHR4ICsgdHkgKiB0eSArIHR6ICogdHo7XG4gICAgICAgICAgICBpZiAobGVuID4gcjEgKiByMSkge1xuICAgICAgICAgICAgICBsZW4gPSByMSAvIF9NYXRoLnNxcnQobGVuKTtcbiAgICAgICAgICAgICAgdHggKj0gbGVuO1xuICAgICAgICAgICAgICB0eSAqPSBsZW47XG4gICAgICAgICAgICAgIHR6ICo9IGxlbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHB4ID0gYzF4ICsgdHg7XG4gICAgICAgICAgICBweSA9IGMxeSArIHR5O1xuICAgICAgICAgICAgcHogPSBjMXogKyB0ejtcbiAgICAgICAgICAgIG1hbmlmb2xkLmFkZFBvaW50KHB4LCBweSwgcHosIG54LCBueSwgbnosIHBkLCBmYWxzZSk7XG4gICAgICAgICAgICBweCA9IGR4ICogcjAwICsgZHkgKiByMDEgKyBkeiAqIHIwMjtcbiAgICAgICAgICAgIHB5ID0gZHggKiByMTAgKyBkeSAqIHIxMSArIGR6ICogcjEyO1xuICAgICAgICAgICAgcHogPSBkeCAqIHIyMCArIGR5ICogcjIxICsgZHogKiByMjI7XG4gICAgICAgICAgICBweCA9IChkeCA9IHB4KSArIGMyeDtcbiAgICAgICAgICAgIHB5ID0gKGR5ID0gcHkpICsgYzJ5O1xuICAgICAgICAgICAgcHogPSAoZHogPSBweikgKyBjMno7XG4gICAgICAgICAgICBwZCA9IG54ICogKHB4IC0gYzF4KSArIG55ICogKHB5IC0gYzF5KSArIG56ICogKHB6IC0gYzF6KTtcbiAgICAgICAgICAgIGlmIChwZCA8PSAwKSB7XG4gICAgICAgICAgICAgIHR4ID0gcHggLSBwZCAqIG54IC0gYzF4O1xuICAgICAgICAgICAgICB0eSA9IHB5IC0gcGQgKiBueSAtIGMxeTtcbiAgICAgICAgICAgICAgdHogPSBweiAtIHBkICogbnogLSBjMXo7XG4gICAgICAgICAgICAgIGxlbiA9IHR4ICogdHggKyB0eSAqIHR5ICsgdHogKiB0ejtcbiAgICAgICAgICAgICAgaWYgKGxlbiA+IHIxICogcjEpIHtcbiAgICAgICAgICAgICAgICBsZW4gPSByMSAvIF9NYXRoLnNxcnQobGVuKTtcbiAgICAgICAgICAgICAgICB0eCAqPSBsZW47XG4gICAgICAgICAgICAgICAgdHkgKj0gbGVuO1xuICAgICAgICAgICAgICAgIHR6ICo9IGxlbjtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBweCA9IGMxeCArIHR4O1xuICAgICAgICAgICAgICBweSA9IGMxeSArIHR5O1xuICAgICAgICAgICAgICBweiA9IGMxeiArIHR6O1xuICAgICAgICAgICAgICBtYW5pZm9sZC5hZGRQb2ludChweCwgcHksIHB6LCBueCwgbnksIG56LCBwZCwgZmFsc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcHggPSBkeCAqIHIwMCArIGR5ICogcjAxICsgZHogKiByMDI7XG4gICAgICAgICAgICBweSA9IGR4ICogcjEwICsgZHkgKiByMTEgKyBkeiAqIHIxMjtcbiAgICAgICAgICAgIHB6ID0gZHggKiByMjAgKyBkeSAqIHIyMSArIGR6ICogcjIyO1xuICAgICAgICAgICAgcHggPSAoZHggPSBweCkgKyBjMng7XG4gICAgICAgICAgICBweSA9IChkeSA9IHB5KSArIGMyeTtcbiAgICAgICAgICAgIHB6ID0gKGR6ID0gcHopICsgYzJ6O1xuICAgICAgICAgICAgcGQgPSBueCAqIChweCAtIGMxeCkgKyBueSAqIChweSAtIGMxeSkgKyBueiAqIChweiAtIGMxeik7XG4gICAgICAgICAgICBpZiAocGQgPD0gMCkge1xuICAgICAgICAgICAgICB0eCA9IHB4IC0gcGQgKiBueCAtIGMxeDtcbiAgICAgICAgICAgICAgdHkgPSBweSAtIHBkICogbnkgLSBjMXk7XG4gICAgICAgICAgICAgIHR6ID0gcHogLSBwZCAqIG56IC0gYzF6O1xuICAgICAgICAgICAgICBsZW4gPSB0eCAqIHR4ICsgdHkgKiB0eSArIHR6ICogdHo7XG4gICAgICAgICAgICAgIGlmIChsZW4gPiByMSAqIHIxKSB7XG4gICAgICAgICAgICAgICAgbGVuID0gcjEgLyBfTWF0aC5zcXJ0KGxlbik7XG4gICAgICAgICAgICAgICAgdHggKj0gbGVuO1xuICAgICAgICAgICAgICAgIHR5ICo9IGxlbjtcbiAgICAgICAgICAgICAgICB0eiAqPSBsZW47XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcHggPSBjMXggKyB0eDtcbiAgICAgICAgICAgICAgcHkgPSBjMXkgKyB0eTtcbiAgICAgICAgICAgICAgcHogPSBjMXogKyB0ejtcbiAgICAgICAgICAgICAgbWFuaWZvbGQuYWRkUG9pbnQocHgsIHB5LCBweiwgbngsIG55LCBueiwgcGQsIGZhbHNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3ggPSB0eDtcbiAgICAgICAgICAgIHN5ID0gdHk7XG4gICAgICAgICAgICBzeiA9IHR6O1xuICAgICAgICAgICAgZGVwdGgxID0gbnggKiAoc3ggLSBjMXgpICsgbnkgKiAoc3kgLSBjMXkpICsgbnogKiAoc3ogLSBjMXopO1xuICAgICAgICAgICAgc3ggLT0gZGVwdGgxICogbng7XG4gICAgICAgICAgICBzeSAtPSBkZXB0aDEgKiBueTtcbiAgICAgICAgICAgIHN6IC09IGRlcHRoMSAqIG56O1xuICAgICAgICAgICAgaWYgKGRvdCA+IDApIHtcbiAgICAgICAgICAgICAgZXggPSB0eCArIG4yeCAqIGgyICogMjtcbiAgICAgICAgICAgICAgZXkgPSB0eSArIG4yeSAqIGgyICogMjtcbiAgICAgICAgICAgICAgZXogPSB0eiArIG4yeiAqIGgyICogMjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGV4ID0gdHggLSBuMnggKiBoMiAqIDI7XG4gICAgICAgICAgICAgIGV5ID0gdHkgLSBuMnkgKiBoMiAqIDI7XG4gICAgICAgICAgICAgIGV6ID0gdHogLSBuMnogKiBoMiAqIDI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkZXB0aDIgPSBueCAqIChleCAtIGMxeCkgKyBueSAqIChleSAtIGMxeSkgKyBueiAqIChleiAtIGMxeik7XG4gICAgICAgICAgICBleCAtPSBkZXB0aDIgKiBueDtcbiAgICAgICAgICAgIGV5IC09IGRlcHRoMiAqIG55O1xuICAgICAgICAgICAgZXogLT0gZGVwdGgyICogbno7XG4gICAgICAgICAgICBkeCA9IGMxeCAtIHN4O1xuICAgICAgICAgICAgZHkgPSBjMXkgLSBzeTtcbiAgICAgICAgICAgIGR6ID0gYzF6IC0gc3o7XG4gICAgICAgICAgICB0eCA9IGV4IC0gc3g7XG4gICAgICAgICAgICB0eSA9IGV5IC0gc3k7XG4gICAgICAgICAgICB0eiA9IGV6IC0gc3o7XG4gICAgICAgICAgICBhID0gZHggKiBkeCArIGR5ICogZHkgKyBkeiAqIGR6O1xuICAgICAgICAgICAgYiA9IGR4ICogdHggKyBkeSAqIHR5ICsgZHogKiB0ejtcbiAgICAgICAgICAgIGUgPSB0eCAqIHR4ICsgdHkgKiB0eSArIHR6ICogdHo7XG4gICAgICAgICAgICBmID0gYiAqIGIgLSBlICogKGEgLSByMSAqIHIxKTtcbiAgICAgICAgICAgIGlmIChmIDwgMCkgYnJlYWs7XG4gICAgICAgICAgICBmID0gX01hdGguc3FydChmKTtcbiAgICAgICAgICAgIHQxID0gKGIgKyBmKSAvIGU7XG4gICAgICAgICAgICB0MiA9IChiIC0gZikgLyBlO1xuICAgICAgICAgICAgaWYgKHQyIDwgdDEpIHtcbiAgICAgICAgICAgICAgbGVuID0gdDE7XG4gICAgICAgICAgICAgIHQxID0gdDI7XG4gICAgICAgICAgICAgIHQyID0gbGVuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHQyID4gMSkgdDIgPSAxO1xuICAgICAgICAgICAgaWYgKHQxIDwgMCkgdDEgPSAwO1xuICAgICAgICAgICAgdHggPSBzeCArIChleCAtIHN4KSAqIHQxO1xuICAgICAgICAgICAgdHkgPSBzeSArIChleSAtIHN5KSAqIHQxO1xuICAgICAgICAgICAgdHogPSBzeiArIChleiAtIHN6KSAqIHQxO1xuICAgICAgICAgICAgZXggPSBzeCArIChleCAtIHN4KSAqIHQyO1xuICAgICAgICAgICAgZXkgPSBzeSArIChleSAtIHN5KSAqIHQyO1xuICAgICAgICAgICAgZXogPSBzeiArIChleiAtIHN6KSAqIHQyO1xuICAgICAgICAgICAgc3ggPSB0eDtcbiAgICAgICAgICAgIHN5ID0gdHk7XG4gICAgICAgICAgICBzeiA9IHR6O1xuICAgICAgICAgICAgbGVuID0gZGVwdGgxICsgKGRlcHRoMiAtIGRlcHRoMSkgKiB0MTtcbiAgICAgICAgICAgIGRlcHRoMiA9IGRlcHRoMSArIChkZXB0aDIgLSBkZXB0aDEpICogdDI7XG4gICAgICAgICAgICBkZXB0aDEgPSBsZW47XG4gICAgICAgICAgICBpZiAoZGVwdGgxIDwgMCkgbWFuaWZvbGQuYWRkUG9pbnQoc3gsIHN5LCBzeiwgbngsIG55LCBueiwgcGQsIGZhbHNlKTtcbiAgICAgICAgICAgIGlmIChkZXB0aDIgPCAwKSBtYW5pZm9sZC5hZGRQb2ludChleCwgZXksIGV6LCBueCwgbnksIG56LCBwZCwgZmFsc2UpO1xuXG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgaWYgKHJpZ2h0Mikge1xuICAgICAgICAgICAgYzJ4ID0gcDJ4IC0gZDJ4O1xuICAgICAgICAgICAgYzJ5ID0gcDJ5IC0gZDJ5O1xuICAgICAgICAgICAgYzJ6ID0gcDJ6IC0gZDJ6O1xuICAgICAgICAgICAgbnggPSAtbjJ4O1xuICAgICAgICAgICAgbnkgPSAtbjJ5O1xuICAgICAgICAgICAgbnogPSAtbjJ6O1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjMnggPSBwMnggKyBkMng7XG4gICAgICAgICAgICBjMnkgPSBwMnkgKyBkMnk7XG4gICAgICAgICAgICBjMnogPSBwMnogKyBkMno7XG4gICAgICAgICAgICBueCA9IG4yeDtcbiAgICAgICAgICAgIG55ID0gbjJ5O1xuICAgICAgICAgICAgbnogPSBuMno7XG4gICAgICAgICAgfVxuICAgICAgICAgIGRvdCA9IG54ICogbjF4ICsgbnkgKiBuMXkgKyBueiAqIG4xejtcbiAgICAgICAgICBpZiAoZG90IDwgMCkgbGVuID0gaDE7XG4gICAgICAgICAgZWxzZSBsZW4gPSAtaDE7XG4gICAgICAgICAgYzF4ID0gcDF4ICsgbGVuICogbjF4O1xuICAgICAgICAgIGMxeSA9IHAxeSArIGxlbiAqIG4xeTtcbiAgICAgICAgICBjMXogPSBwMXogKyBsZW4gKiBuMXo7XG4gICAgICAgICAgaWYgKGRvdDEgPj0gMC45OTk5OTkpIHtcbiAgICAgICAgICAgIHR4ID0gLW55O1xuICAgICAgICAgICAgdHkgPSBuejtcbiAgICAgICAgICAgIHR6ID0gbng7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHR4ID0gbng7XG4gICAgICAgICAgICB0eSA9IG55O1xuICAgICAgICAgICAgdHogPSBuejtcbiAgICAgICAgICB9XG4gICAgICAgICAgbGVuID0gdHggKiBuMXggKyB0eSAqIG4xeSArIHR6ICogbjF6O1xuICAgICAgICAgIGR4ID0gbGVuICogbjF4IC0gdHg7XG4gICAgICAgICAgZHkgPSBsZW4gKiBuMXkgLSB0eTtcbiAgICAgICAgICBkeiA9IGxlbiAqIG4xeiAtIHR6O1xuICAgICAgICAgIGxlbiA9IF9NYXRoLnNxcnQoZHggKiBkeCArIGR5ICogZHkgKyBkeiAqIGR6KTtcbiAgICAgICAgICBpZiAobGVuID09IDApIGJyZWFrO1xuICAgICAgICAgIGxlbiA9IHIxIC8gbGVuO1xuICAgICAgICAgIGR4ICo9IGxlbjtcbiAgICAgICAgICBkeSAqPSBsZW47XG4gICAgICAgICAgZHogKj0gbGVuO1xuICAgICAgICAgIHR4ID0gYzF4ICsgZHg7XG4gICAgICAgICAgdHkgPSBjMXkgKyBkeTtcbiAgICAgICAgICB0eiA9IGMxeiArIGR6O1xuICAgICAgICAgIGlmIChkb3QgPCAtMC45NiB8fCBkb3QgPiAwLjk2KSB7XG4gICAgICAgICAgICByMDAgPSBuMXggKiBuMXggKiAxLjUgLSAwLjU7XG4gICAgICAgICAgICByMDEgPSBuMXggKiBuMXkgKiAxLjUgLSBuMXogKiAwLjg2NjAyNTQwMztcbiAgICAgICAgICAgIHIwMiA9IG4xeCAqIG4xeiAqIDEuNSArIG4xeSAqIDAuODY2MDI1NDAzO1xuICAgICAgICAgICAgcjEwID0gbjF5ICogbjF4ICogMS41ICsgbjF6ICogMC44NjYwMjU0MDM7XG4gICAgICAgICAgICByMTEgPSBuMXkgKiBuMXkgKiAxLjUgLSAwLjU7XG4gICAgICAgICAgICByMTIgPSBuMXkgKiBuMXogKiAxLjUgLSBuMXggKiAwLjg2NjAyNTQwMztcbiAgICAgICAgICAgIHIyMCA9IG4xeiAqIG4xeCAqIDEuNSAtIG4xeSAqIDAuODY2MDI1NDAzO1xuICAgICAgICAgICAgcjIxID0gbjF6ICogbjF5ICogMS41ICsgbjF4ICogMC44NjYwMjU0MDM7XG4gICAgICAgICAgICByMjIgPSBuMXogKiBuMXogKiAxLjUgLSAwLjU7XG4gICAgICAgICAgICBweCA9IHR4O1xuICAgICAgICAgICAgcHkgPSB0eTtcbiAgICAgICAgICAgIHB6ID0gdHo7XG4gICAgICAgICAgICBwZCA9IG54ICogKHB4IC0gYzJ4KSArIG55ICogKHB5IC0gYzJ5KSArIG56ICogKHB6IC0gYzJ6KTtcbiAgICAgICAgICAgIHR4ID0gcHggLSBwZCAqIG54IC0gYzJ4O1xuICAgICAgICAgICAgdHkgPSBweSAtIHBkICogbnkgLSBjMnk7XG4gICAgICAgICAgICB0eiA9IHB6IC0gcGQgKiBueiAtIGMyejtcbiAgICAgICAgICAgIGxlbiA9IHR4ICogdHggKyB0eSAqIHR5ICsgdHogKiB0ejtcbiAgICAgICAgICAgIGlmIChsZW4gPiByMiAqIHIyKSB7XG4gICAgICAgICAgICAgIGxlbiA9IHIyIC8gX01hdGguc3FydChsZW4pO1xuICAgICAgICAgICAgICB0eCAqPSBsZW47XG4gICAgICAgICAgICAgIHR5ICo9IGxlbjtcbiAgICAgICAgICAgICAgdHogKj0gbGVuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcHggPSBjMnggKyB0eDtcbiAgICAgICAgICAgIHB5ID0gYzJ5ICsgdHk7XG4gICAgICAgICAgICBweiA9IGMyeiArIHR6O1xuICAgICAgICAgICAgbWFuaWZvbGQuYWRkUG9pbnQocHgsIHB5LCBweiwgLW54LCAtbnksIC1ueiwgcGQsIGZhbHNlKTtcbiAgICAgICAgICAgIHB4ID0gZHggKiByMDAgKyBkeSAqIHIwMSArIGR6ICogcjAyO1xuICAgICAgICAgICAgcHkgPSBkeCAqIHIxMCArIGR5ICogcjExICsgZHogKiByMTI7XG4gICAgICAgICAgICBweiA9IGR4ICogcjIwICsgZHkgKiByMjEgKyBkeiAqIHIyMjtcbiAgICAgICAgICAgIHB4ID0gKGR4ID0gcHgpICsgYzF4O1xuICAgICAgICAgICAgcHkgPSAoZHkgPSBweSkgKyBjMXk7XG4gICAgICAgICAgICBweiA9IChkeiA9IHB6KSArIGMxejtcbiAgICAgICAgICAgIHBkID0gbnggKiAocHggLSBjMngpICsgbnkgKiAocHkgLSBjMnkpICsgbnogKiAocHogLSBjMnopO1xuICAgICAgICAgICAgaWYgKHBkIDw9IDApIHtcbiAgICAgICAgICAgICAgdHggPSBweCAtIHBkICogbnggLSBjMng7XG4gICAgICAgICAgICAgIHR5ID0gcHkgLSBwZCAqIG55IC0gYzJ5O1xuICAgICAgICAgICAgICB0eiA9IHB6IC0gcGQgKiBueiAtIGMyejtcbiAgICAgICAgICAgICAgbGVuID0gdHggKiB0eCArIHR5ICogdHkgKyB0eiAqIHR6O1xuICAgICAgICAgICAgICBpZiAobGVuID4gcjIgKiByMikge1xuICAgICAgICAgICAgICAgIGxlbiA9IHIyIC8gX01hdGguc3FydChsZW4pO1xuICAgICAgICAgICAgICAgIHR4ICo9IGxlbjtcbiAgICAgICAgICAgICAgICB0eSAqPSBsZW47XG4gICAgICAgICAgICAgICAgdHogKj0gbGVuO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHB4ID0gYzJ4ICsgdHg7XG4gICAgICAgICAgICAgIHB5ID0gYzJ5ICsgdHk7XG4gICAgICAgICAgICAgIHB6ID0gYzJ6ICsgdHo7XG4gICAgICAgICAgICAgIG1hbmlmb2xkLmFkZFBvaW50KHB4LCBweSwgcHosIC1ueCwgLW55LCAtbnosIHBkLCBmYWxzZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBweCA9IGR4ICogcjAwICsgZHkgKiByMDEgKyBkeiAqIHIwMjtcbiAgICAgICAgICAgIHB5ID0gZHggKiByMTAgKyBkeSAqIHIxMSArIGR6ICogcjEyO1xuICAgICAgICAgICAgcHogPSBkeCAqIHIyMCArIGR5ICogcjIxICsgZHogKiByMjI7XG4gICAgICAgICAgICBweCA9IChkeCA9IHB4KSArIGMxeDtcbiAgICAgICAgICAgIHB5ID0gKGR5ID0gcHkpICsgYzF5O1xuICAgICAgICAgICAgcHogPSAoZHogPSBweikgKyBjMXo7XG4gICAgICAgICAgICBwZCA9IG54ICogKHB4IC0gYzJ4KSArIG55ICogKHB5IC0gYzJ5KSArIG56ICogKHB6IC0gYzJ6KTtcbiAgICAgICAgICAgIGlmIChwZCA8PSAwKSB7XG4gICAgICAgICAgICAgIHR4ID0gcHggLSBwZCAqIG54IC0gYzJ4O1xuICAgICAgICAgICAgICB0eSA9IHB5IC0gcGQgKiBueSAtIGMyeTtcbiAgICAgICAgICAgICAgdHogPSBweiAtIHBkICogbnogLSBjMno7XG4gICAgICAgICAgICAgIGxlbiA9IHR4ICogdHggKyB0eSAqIHR5ICsgdHogKiB0ejtcbiAgICAgICAgICAgICAgaWYgKGxlbiA+IHIyICogcjIpIHtcbiAgICAgICAgICAgICAgICBsZW4gPSByMiAvIF9NYXRoLnNxcnQobGVuKTtcbiAgICAgICAgICAgICAgICB0eCAqPSBsZW47XG4gICAgICAgICAgICAgICAgdHkgKj0gbGVuO1xuICAgICAgICAgICAgICAgIHR6ICo9IGxlbjtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBweCA9IGMyeCArIHR4O1xuICAgICAgICAgICAgICBweSA9IGMyeSArIHR5O1xuICAgICAgICAgICAgICBweiA9IGMyeiArIHR6O1xuICAgICAgICAgICAgICBtYW5pZm9sZC5hZGRQb2ludChweCwgcHksIHB6LCAtbngsIC1ueSwgLW56LCBwZCwgZmFsc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzeCA9IHR4O1xuICAgICAgICAgICAgc3kgPSB0eTtcbiAgICAgICAgICAgIHN6ID0gdHo7XG4gICAgICAgICAgICBkZXB0aDEgPSBueCAqIChzeCAtIGMyeCkgKyBueSAqIChzeSAtIGMyeSkgKyBueiAqIChzeiAtIGMyeik7XG4gICAgICAgICAgICBzeCAtPSBkZXB0aDEgKiBueDtcbiAgICAgICAgICAgIHN5IC09IGRlcHRoMSAqIG55O1xuICAgICAgICAgICAgc3ogLT0gZGVwdGgxICogbno7XG4gICAgICAgICAgICBpZiAoZG90ID4gMCkge1xuICAgICAgICAgICAgICBleCA9IHR4ICsgbjF4ICogaDEgKiAyO1xuICAgICAgICAgICAgICBleSA9IHR5ICsgbjF5ICogaDEgKiAyO1xuICAgICAgICAgICAgICBleiA9IHR6ICsgbjF6ICogaDEgKiAyO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgZXggPSB0eCAtIG4xeCAqIGgxICogMjtcbiAgICAgICAgICAgICAgZXkgPSB0eSAtIG4xeSAqIGgxICogMjtcbiAgICAgICAgICAgICAgZXogPSB0eiAtIG4xeiAqIGgxICogMjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRlcHRoMiA9IG54ICogKGV4IC0gYzJ4KSArIG55ICogKGV5IC0gYzJ5KSArIG56ICogKGV6IC0gYzJ6KTtcbiAgICAgICAgICAgIGV4IC09IGRlcHRoMiAqIG54O1xuICAgICAgICAgICAgZXkgLT0gZGVwdGgyICogbnk7XG4gICAgICAgICAgICBleiAtPSBkZXB0aDIgKiBuejtcbiAgICAgICAgICAgIGR4ID0gYzJ4IC0gc3g7XG4gICAgICAgICAgICBkeSA9IGMyeSAtIHN5O1xuICAgICAgICAgICAgZHogPSBjMnogLSBzejtcbiAgICAgICAgICAgIHR4ID0gZXggLSBzeDtcbiAgICAgICAgICAgIHR5ID0gZXkgLSBzeTtcbiAgICAgICAgICAgIHR6ID0gZXogLSBzejtcbiAgICAgICAgICAgIGEgPSBkeCAqIGR4ICsgZHkgKiBkeSArIGR6ICogZHo7XG4gICAgICAgICAgICBiID0gZHggKiB0eCArIGR5ICogdHkgKyBkeiAqIHR6O1xuICAgICAgICAgICAgZSA9IHR4ICogdHggKyB0eSAqIHR5ICsgdHogKiB0ejtcbiAgICAgICAgICAgIGYgPSBiICogYiAtIGUgKiAoYSAtIHIyICogcjIpO1xuICAgICAgICAgICAgaWYgKGYgPCAwKSBicmVhaztcbiAgICAgICAgICAgIGYgPSBfTWF0aC5zcXJ0KGYpO1xuICAgICAgICAgICAgdDEgPSAoYiArIGYpIC8gZTtcbiAgICAgICAgICAgIHQyID0gKGIgLSBmKSAvIGU7XG4gICAgICAgICAgICBpZiAodDIgPCB0MSkge1xuICAgICAgICAgICAgICBsZW4gPSB0MTtcbiAgICAgICAgICAgICAgdDEgPSB0MjtcbiAgICAgICAgICAgICAgdDIgPSBsZW47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodDIgPiAxKSB0MiA9IDE7XG4gICAgICAgICAgICBpZiAodDEgPCAwKSB0MSA9IDA7XG4gICAgICAgICAgICB0eCA9IHN4ICsgKGV4IC0gc3gpICogdDE7XG4gICAgICAgICAgICB0eSA9IHN5ICsgKGV5IC0gc3kpICogdDE7XG4gICAgICAgICAgICB0eiA9IHN6ICsgKGV6IC0gc3opICogdDE7XG4gICAgICAgICAgICBleCA9IHN4ICsgKGV4IC0gc3gpICogdDI7XG4gICAgICAgICAgICBleSA9IHN5ICsgKGV5IC0gc3kpICogdDI7XG4gICAgICAgICAgICBleiA9IHN6ICsgKGV6IC0gc3opICogdDI7XG4gICAgICAgICAgICBzeCA9IHR4O1xuICAgICAgICAgICAgc3kgPSB0eTtcbiAgICAgICAgICAgIHN6ID0gdHo7XG4gICAgICAgICAgICBsZW4gPSBkZXB0aDEgKyAoZGVwdGgyIC0gZGVwdGgxKSAqIHQxO1xuICAgICAgICAgICAgZGVwdGgyID0gZGVwdGgxICsgKGRlcHRoMiAtIGRlcHRoMSkgKiB0MjtcbiAgICAgICAgICAgIGRlcHRoMSA9IGxlbjtcbiAgICAgICAgICAgIGlmIChkZXB0aDEgPCAwKSB7XG4gICAgICAgICAgICAgIG1hbmlmb2xkLmFkZFBvaW50KHN4LCBzeSwgc3osIC1ueCwgLW55LCAtbnosIGRlcHRoMSwgZmFsc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGRlcHRoMiA8IDApIHtcbiAgICAgICAgICAgICAgbWFuaWZvbGQuYWRkUG9pbnQoZXgsIGV5LCBleiwgLW54LCAtbnksIC1ueiwgZGVwdGgyLCBmYWxzZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgfVxuXG4gIH0pO1xuXG4gIC8qKlxuICAgKiBBIGNvbGxpc2lvbiBkZXRlY3RvciB3aGljaCBkZXRlY3RzIGNvbGxpc2lvbnMgYmV0d2VlbiBzcGhlcmUgYW5kIGJveC5cbiAgICogQGF1dGhvciBzYWhhcmFuXG4gICAqL1xuICBmdW5jdGlvbiBTcGhlcmVCb3hDb2xsaXNpb25EZXRlY3RvcihmbGlwKSB7XG5cbiAgICBDb2xsaXNpb25EZXRlY3Rvci5jYWxsKHRoaXMpO1xuICAgIHRoaXMuZmxpcCA9IGZsaXA7XG5cbiAgfVxuICBTcGhlcmVCb3hDb2xsaXNpb25EZXRlY3Rvci5wcm90b3R5cGUgPSBPYmplY3QuYXNzaWduKE9iamVjdC5jcmVhdGUoQ29sbGlzaW9uRGV0ZWN0b3IucHJvdG90eXBlKSwge1xuXG4gICAgY29uc3RydWN0b3I6IFNwaGVyZUJveENvbGxpc2lvbkRldGVjdG9yLFxuXG4gICAgZGV0ZWN0Q29sbGlzaW9uOiBmdW5jdGlvbiAoc2hhcGUxLCBzaGFwZTIsIG1hbmlmb2xkKSB7XG5cbiAgICAgIHZhciBzO1xuICAgICAgdmFyIGI7XG4gICAgICBpZiAodGhpcy5mbGlwKSB7XG4gICAgICAgIHMgPSAoc2hhcGUyKTtcbiAgICAgICAgYiA9IChzaGFwZTEpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcyA9IChzaGFwZTEpO1xuICAgICAgICBiID0gKHNoYXBlMik7XG4gICAgICB9XG5cbiAgICAgIHZhciBEID0gYi5kaW1lbnRpb25zO1xuXG4gICAgICB2YXIgcHMgPSBzLnBvc2l0aW9uO1xuICAgICAgdmFyIHBzeCA9IHBzLng7XG4gICAgICB2YXIgcHN5ID0gcHMueTtcbiAgICAgIHZhciBwc3ogPSBwcy56O1xuICAgICAgdmFyIHBiID0gYi5wb3NpdGlvbjtcbiAgICAgIHZhciBwYnggPSBwYi54O1xuICAgICAgdmFyIHBieSA9IHBiLnk7XG4gICAgICB2YXIgcGJ6ID0gcGIuejtcbiAgICAgIHZhciByYWQgPSBzLnJhZGl1cztcblxuICAgICAgdmFyIGh3ID0gYi5oYWxmV2lkdGg7XG4gICAgICB2YXIgaGggPSBiLmhhbGZIZWlnaHQ7XG4gICAgICB2YXIgaGQgPSBiLmhhbGZEZXB0aDtcblxuICAgICAgdmFyIGR4ID0gcHN4IC0gcGJ4O1xuICAgICAgdmFyIGR5ID0gcHN5IC0gcGJ5O1xuICAgICAgdmFyIGR6ID0gcHN6IC0gcGJ6O1xuICAgICAgdmFyIHN4ID0gRFswXSAqIGR4ICsgRFsxXSAqIGR5ICsgRFsyXSAqIGR6O1xuICAgICAgdmFyIHN5ID0gRFszXSAqIGR4ICsgRFs0XSAqIGR5ICsgRFs1XSAqIGR6O1xuICAgICAgdmFyIHN6ID0gRFs2XSAqIGR4ICsgRFs3XSAqIGR5ICsgRFs4XSAqIGR6O1xuICAgICAgdmFyIGN4O1xuICAgICAgdmFyIGN5O1xuICAgICAgdmFyIGN6O1xuICAgICAgdmFyIGxlbjtcbiAgICAgIHZhciBpbnZMZW47XG4gICAgICB2YXIgb3ZlcmxhcCA9IDA7XG4gICAgICBpZiAoc3ggPiBodykge1xuICAgICAgICBzeCA9IGh3O1xuICAgICAgfSBlbHNlIGlmIChzeCA8IC1odykge1xuICAgICAgICBzeCA9IC1odztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG92ZXJsYXAgPSAxO1xuICAgICAgfVxuICAgICAgaWYgKHN5ID4gaGgpIHtcbiAgICAgICAgc3kgPSBoaDtcbiAgICAgIH0gZWxzZSBpZiAoc3kgPCAtaGgpIHtcbiAgICAgICAgc3kgPSAtaGg7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvdmVybGFwIHw9IDI7XG4gICAgICB9XG4gICAgICBpZiAoc3ogPiBoZCkge1xuICAgICAgICBzeiA9IGhkO1xuICAgICAgfSBlbHNlIGlmIChzeiA8IC1oZCkge1xuICAgICAgICBzeiA9IC1oZDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG92ZXJsYXAgfD0gNDtcbiAgICAgIH1cbiAgICAgIGlmIChvdmVybGFwID09IDcpIHtcbiAgICAgICAgLy8gY2VudGVyIG9mIHNwaGVyZSBpcyBpbiB0aGUgYm94XG4gICAgICAgIGlmIChzeCA8IDApIHtcbiAgICAgICAgICBkeCA9IGh3ICsgc3g7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZHggPSBodyAtIHN4O1xuICAgICAgICB9XG4gICAgICAgIGlmIChzeSA8IDApIHtcbiAgICAgICAgICBkeSA9IGhoICsgc3k7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZHkgPSBoaCAtIHN5O1xuICAgICAgICB9XG4gICAgICAgIGlmIChzeiA8IDApIHtcbiAgICAgICAgICBkeiA9IGhkICsgc3o7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZHogPSBoZCAtIHN6O1xuICAgICAgICB9XG4gICAgICAgIGlmIChkeCA8IGR5KSB7XG4gICAgICAgICAgaWYgKGR4IDwgZHopIHtcbiAgICAgICAgICAgIGxlbiA9IGR4IC0gaHc7XG4gICAgICAgICAgICBpZiAoc3ggPCAwKSB7XG4gICAgICAgICAgICAgIHN4ID0gLWh3O1xuICAgICAgICAgICAgICBkeCA9IERbMF07XG4gICAgICAgICAgICAgIGR5ID0gRFsxXTtcbiAgICAgICAgICAgICAgZHogPSBEWzJdO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgc3ggPSBodztcbiAgICAgICAgICAgICAgZHggPSAtRFswXTtcbiAgICAgICAgICAgICAgZHkgPSAtRFsxXTtcbiAgICAgICAgICAgICAgZHogPSAtRFsyXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGVuID0gZHogLSBoZDtcbiAgICAgICAgICAgIGlmIChzeiA8IDApIHtcbiAgICAgICAgICAgICAgc3ogPSAtaGQ7XG4gICAgICAgICAgICAgIGR4ID0gRFs2XTtcbiAgICAgICAgICAgICAgZHkgPSBEWzddO1xuICAgICAgICAgICAgICBkeiA9IERbOF07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBzeiA9IGhkO1xuICAgICAgICAgICAgICBkeCA9IC1EWzZdO1xuICAgICAgICAgICAgICBkeSA9IC1EWzddO1xuICAgICAgICAgICAgICBkeiA9IC1EWzhdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoZHkgPCBkeikge1xuICAgICAgICAgICAgbGVuID0gZHkgLSBoaDtcbiAgICAgICAgICAgIGlmIChzeSA8IDApIHtcbiAgICAgICAgICAgICAgc3kgPSAtaGg7XG4gICAgICAgICAgICAgIGR4ID0gRFszXTtcbiAgICAgICAgICAgICAgZHkgPSBEWzRdO1xuICAgICAgICAgICAgICBkeiA9IERbNV07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBzeSA9IGhoO1xuICAgICAgICAgICAgICBkeCA9IC1EWzNdO1xuICAgICAgICAgICAgICBkeSA9IC1EWzRdO1xuICAgICAgICAgICAgICBkeiA9IC1EWzVdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZW4gPSBkeiAtIGhkO1xuICAgICAgICAgICAgaWYgKHN6IDwgMCkge1xuICAgICAgICAgICAgICBzeiA9IC1oZDtcbiAgICAgICAgICAgICAgZHggPSBEWzZdO1xuICAgICAgICAgICAgICBkeSA9IERbN107XG4gICAgICAgICAgICAgIGR6ID0gRFs4XTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHN6ID0gaGQ7XG4gICAgICAgICAgICAgIGR4ID0gLURbNl07XG4gICAgICAgICAgICAgIGR5ID0gLURbN107XG4gICAgICAgICAgICAgIGR6ID0gLURbOF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGN4ID0gcGJ4ICsgc3ggKiBEWzBdICsgc3kgKiBEWzNdICsgc3ogKiBEWzZdO1xuICAgICAgICBjeSA9IHBieSArIHN4ICogRFsxXSArIHN5ICogRFs0XSArIHN6ICogRFs3XTtcbiAgICAgICAgY3ogPSBwYnogKyBzeCAqIERbMl0gKyBzeSAqIERbNV0gKyBzeiAqIERbOF07XG4gICAgICAgIG1hbmlmb2xkLmFkZFBvaW50KHBzeCArIHJhZCAqIGR4LCBwc3kgKyByYWQgKiBkeSwgcHN6ICsgcmFkICogZHosIGR4LCBkeSwgZHosIGxlbiAtIHJhZCwgdGhpcy5mbGlwKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGN4ID0gcGJ4ICsgc3ggKiBEWzBdICsgc3kgKiBEWzNdICsgc3ogKiBEWzZdO1xuICAgICAgICBjeSA9IHBieSArIHN4ICogRFsxXSArIHN5ICogRFs0XSArIHN6ICogRFs3XTtcbiAgICAgICAgY3ogPSBwYnogKyBzeCAqIERbMl0gKyBzeSAqIERbNV0gKyBzeiAqIERbOF07XG4gICAgICAgIGR4ID0gY3ggLSBwcy54O1xuICAgICAgICBkeSA9IGN5IC0gcHMueTtcbiAgICAgICAgZHogPSBjeiAtIHBzLno7XG4gICAgICAgIGxlbiA9IGR4ICogZHggKyBkeSAqIGR5ICsgZHogKiBkejtcbiAgICAgICAgaWYgKGxlbiA+IDAgJiYgbGVuIDwgcmFkICogcmFkKSB7XG4gICAgICAgICAgbGVuID0gX01hdGguc3FydChsZW4pO1xuICAgICAgICAgIGludkxlbiA9IDEgLyBsZW47XG4gICAgICAgICAgZHggKj0gaW52TGVuO1xuICAgICAgICAgIGR5ICo9IGludkxlbjtcbiAgICAgICAgICBkeiAqPSBpbnZMZW47XG4gICAgICAgICAgbWFuaWZvbGQuYWRkUG9pbnQocHN4ICsgcmFkICogZHgsIHBzeSArIHJhZCAqIGR5LCBwc3ogKyByYWQgKiBkeiwgZHgsIGR5LCBkeiwgbGVuIC0gcmFkLCB0aGlzLmZsaXApO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICB9XG5cbiAgfSk7XG5cbiAgZnVuY3Rpb24gU3BoZXJlQ3lsaW5kZXJDb2xsaXNpb25EZXRlY3RvcihmbGlwKSB7XG5cbiAgICBDb2xsaXNpb25EZXRlY3Rvci5jYWxsKHRoaXMpO1xuICAgIHRoaXMuZmxpcCA9IGZsaXA7XG5cbiAgfVxuICBTcGhlcmVDeWxpbmRlckNvbGxpc2lvbkRldGVjdG9yLnByb3RvdHlwZSA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmNyZWF0ZShDb2xsaXNpb25EZXRlY3Rvci5wcm90b3R5cGUpLCB7XG5cbiAgICBjb25zdHJ1Y3RvcjogU3BoZXJlQ3lsaW5kZXJDb2xsaXNpb25EZXRlY3RvcixcblxuICAgIGRldGVjdENvbGxpc2lvbjogZnVuY3Rpb24gKHNoYXBlMSwgc2hhcGUyLCBtYW5pZm9sZCkge1xuXG4gICAgICB2YXIgcztcbiAgICAgIHZhciBjO1xuICAgICAgaWYgKHRoaXMuZmxpcCkge1xuICAgICAgICBzID0gc2hhcGUyO1xuICAgICAgICBjID0gc2hhcGUxO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcyA9IHNoYXBlMTtcbiAgICAgICAgYyA9IHNoYXBlMjtcbiAgICAgIH1cbiAgICAgIHZhciBwcyA9IHMucG9zaXRpb247XG4gICAgICB2YXIgcHN4ID0gcHMueDtcbiAgICAgIHZhciBwc3kgPSBwcy55O1xuICAgICAgdmFyIHBzeiA9IHBzLno7XG4gICAgICB2YXIgcGMgPSBjLnBvc2l0aW9uO1xuICAgICAgdmFyIHBjeCA9IHBjLng7XG4gICAgICB2YXIgcGN5ID0gcGMueTtcbiAgICAgIHZhciBwY3ogPSBwYy56O1xuICAgICAgdmFyIGRpcnggPSBjLm5vcm1hbERpcmVjdGlvbi54O1xuICAgICAgdmFyIGRpcnkgPSBjLm5vcm1hbERpcmVjdGlvbi55O1xuICAgICAgdmFyIGRpcnogPSBjLm5vcm1hbERpcmVjdGlvbi56O1xuICAgICAgdmFyIHJhZHMgPSBzLnJhZGl1cztcbiAgICAgIHZhciByYWRjID0gYy5yYWRpdXM7XG4gICAgICB2YXIgcmFkMiA9IHJhZHMgKyByYWRjO1xuICAgICAgdmFyIGhhbGZoID0gYy5oYWxmSGVpZ2h0O1xuICAgICAgdmFyIGR4ID0gcHN4IC0gcGN4O1xuICAgICAgdmFyIGR5ID0gcHN5IC0gcGN5O1xuICAgICAgdmFyIGR6ID0gcHN6IC0gcGN6O1xuICAgICAgdmFyIGRvdCA9IGR4ICogZGlyeCArIGR5ICogZGlyeSArIGR6ICogZGlyejtcbiAgICAgIGlmIChkb3QgPCAtaGFsZmggLSByYWRzIHx8IGRvdCA+IGhhbGZoICsgcmFkcykgcmV0dXJuO1xuICAgICAgdmFyIGN4ID0gcGN4ICsgZG90ICogZGlyeDtcbiAgICAgIHZhciBjeSA9IHBjeSArIGRvdCAqIGRpcnk7XG4gICAgICB2YXIgY3ogPSBwY3ogKyBkb3QgKiBkaXJ6O1xuICAgICAgdmFyIGQyeCA9IHBzeCAtIGN4O1xuICAgICAgdmFyIGQyeSA9IHBzeSAtIGN5O1xuICAgICAgdmFyIGQyeiA9IHBzeiAtIGN6O1xuICAgICAgdmFyIGxlbiA9IGQyeCAqIGQyeCArIGQyeSAqIGQyeSArIGQyeiAqIGQyejtcbiAgICAgIGlmIChsZW4gPiByYWQyICogcmFkMikgcmV0dXJuO1xuICAgICAgaWYgKGxlbiA+IHJhZGMgKiByYWRjKSB7XG4gICAgICAgIGxlbiA9IHJhZGMgLyBfTWF0aC5zcXJ0KGxlbik7XG4gICAgICAgIGQyeCAqPSBsZW47XG4gICAgICAgIGQyeSAqPSBsZW47XG4gICAgICAgIGQyeiAqPSBsZW47XG4gICAgICB9XG4gICAgICBpZiAoZG90IDwgLWhhbGZoKSBkb3QgPSAtaGFsZmg7XG4gICAgICBlbHNlIGlmIChkb3QgPiBoYWxmaCkgZG90ID0gaGFsZmg7XG4gICAgICBjeCA9IHBjeCArIGRvdCAqIGRpcnggKyBkMng7XG4gICAgICBjeSA9IHBjeSArIGRvdCAqIGRpcnkgKyBkMnk7XG4gICAgICBjeiA9IHBjeiArIGRvdCAqIGRpcnogKyBkMno7XG4gICAgICBkeCA9IGN4IC0gcHN4O1xuICAgICAgZHkgPSBjeSAtIHBzeTtcbiAgICAgIGR6ID0gY3ogLSBwc3o7XG4gICAgICBsZW4gPSBkeCAqIGR4ICsgZHkgKiBkeSArIGR6ICogZHo7XG4gICAgICB2YXIgaW52TGVuO1xuICAgICAgaWYgKGxlbiA+IDAgJiYgbGVuIDwgcmFkcyAqIHJhZHMpIHtcbiAgICAgICAgbGVuID0gX01hdGguc3FydChsZW4pO1xuICAgICAgICBpbnZMZW4gPSAxIC8gbGVuO1xuICAgICAgICBkeCAqPSBpbnZMZW47XG4gICAgICAgIGR5ICo9IGludkxlbjtcbiAgICAgICAgZHogKj0gaW52TGVuO1xuICAgICAgICAvLy9yZXN1bHQuYWRkQ29udGFjdEluZm8ocHN4K2R4KnJhZHMscHN5K2R5KnJhZHMscHN6K2R6KnJhZHMsZHgsZHksZHosbGVuLXJhZHMscyxjLDAsMCxmYWxzZSk7XG4gICAgICAgIG1hbmlmb2xkLmFkZFBvaW50KHBzeCArIGR4ICogcmFkcywgcHN5ICsgZHkgKiByYWRzLCBwc3ogKyBkeiAqIHJhZHMsIGR4LCBkeSwgZHosIGxlbiAtIHJhZHMsIHRoaXMuZmxpcCk7XG4gICAgICB9XG5cbiAgICB9XG5cblxuICB9KTtcblxuICAvKipcbiAgICogQSBjb2xsaXNpb24gZGV0ZWN0b3Igd2hpY2ggZGV0ZWN0cyBjb2xsaXNpb25zIGJldHdlZW4gdHdvIHNwaGVyZXMuXG4gICAqIEBhdXRob3Igc2FoYXJhblxuICAgKi9cblxuICBmdW5jdGlvbiBTcGhlcmVTcGhlcmVDb2xsaXNpb25EZXRlY3RvcigpIHtcblxuICAgIENvbGxpc2lvbkRldGVjdG9yLmNhbGwodGhpcyk7XG5cbiAgfVxuICBTcGhlcmVTcGhlcmVDb2xsaXNpb25EZXRlY3Rvci5wcm90b3R5cGUgPSBPYmplY3QuYXNzaWduKE9iamVjdC5jcmVhdGUoQ29sbGlzaW9uRGV0ZWN0b3IucHJvdG90eXBlKSwge1xuXG4gICAgY29uc3RydWN0b3I6IFNwaGVyZVNwaGVyZUNvbGxpc2lvbkRldGVjdG9yLFxuXG4gICAgZGV0ZWN0Q29sbGlzaW9uOiBmdW5jdGlvbiAoc2hhcGUxLCBzaGFwZTIsIG1hbmlmb2xkKSB7XG5cbiAgICAgIHZhciBzMSA9IHNoYXBlMTtcbiAgICAgIHZhciBzMiA9IHNoYXBlMjtcbiAgICAgIHZhciBwMSA9IHMxLnBvc2l0aW9uO1xuICAgICAgdmFyIHAyID0gczIucG9zaXRpb247XG4gICAgICB2YXIgZHggPSBwMi54IC0gcDEueDtcbiAgICAgIHZhciBkeSA9IHAyLnkgLSBwMS55O1xuICAgICAgdmFyIGR6ID0gcDIueiAtIHAxLno7XG4gICAgICB2YXIgbGVuID0gZHggKiBkeCArIGR5ICogZHkgKyBkeiAqIGR6O1xuICAgICAgdmFyIHIxID0gczEucmFkaXVzO1xuICAgICAgdmFyIHIyID0gczIucmFkaXVzO1xuICAgICAgdmFyIHJhZCA9IHIxICsgcjI7XG4gICAgICBpZiAobGVuID4gMCAmJiBsZW4gPCByYWQgKiByYWQpIHtcbiAgICAgICAgbGVuID0gX01hdGguc3FydChsZW4pO1xuICAgICAgICB2YXIgaW52TGVuID0gMSAvIGxlbjtcbiAgICAgICAgZHggKj0gaW52TGVuO1xuICAgICAgICBkeSAqPSBpbnZMZW47XG4gICAgICAgIGR6ICo9IGludkxlbjtcbiAgICAgICAgbWFuaWZvbGQuYWRkUG9pbnQocDEueCArIGR4ICogcjEsIHAxLnkgKyBkeSAqIHIxLCBwMS56ICsgZHogKiByMSwgZHgsIGR5LCBkeiwgbGVuIC0gcmFkLCBmYWxzZSk7XG4gICAgICB9XG5cbiAgICB9XG5cbiAgfSk7XG5cbiAgLyoqXG4gICAqIEEgY29sbGlzaW9uIGRldGVjdG9yIHdoaWNoIGRldGVjdHMgY29sbGlzaW9ucyBiZXR3ZWVuIHR3byBzcGhlcmVzLlxuICAgKiBAYXV0aG9yIHNhaGFyYW4gXG4gICAqIEBhdXRob3IgbG8tdGhcbiAgICovXG5cbiAgZnVuY3Rpb24gU3BoZXJlUGxhbmVDb2xsaXNpb25EZXRlY3RvcihmbGlwKSB7XG5cbiAgICBDb2xsaXNpb25EZXRlY3Rvci5jYWxsKHRoaXMpO1xuXG4gICAgdGhpcy5mbGlwID0gZmxpcDtcblxuICAgIHRoaXMubiA9IG5ldyBWZWMzKCk7XG4gICAgdGhpcy5wID0gbmV3IFZlYzMoKTtcblxuICB9XG4gIFNwaGVyZVBsYW5lQ29sbGlzaW9uRGV0ZWN0b3IucHJvdG90eXBlID0gT2JqZWN0LmFzc2lnbihPYmplY3QuY3JlYXRlKENvbGxpc2lvbkRldGVjdG9yLnByb3RvdHlwZSksIHtcblxuICAgIGNvbnN0cnVjdG9yOiBTcGhlcmVQbGFuZUNvbGxpc2lvbkRldGVjdG9yLFxuXG4gICAgZGV0ZWN0Q29sbGlzaW9uOiBmdW5jdGlvbiAoc2hhcGUxLCBzaGFwZTIsIG1hbmlmb2xkKSB7XG5cbiAgICAgIHZhciBuID0gdGhpcy5uO1xuICAgICAgdmFyIHAgPSB0aGlzLnA7XG5cbiAgICAgIHZhciBzID0gdGhpcy5mbGlwID8gc2hhcGUyIDogc2hhcGUxO1xuICAgICAgdmFyIHBuID0gdGhpcy5mbGlwID8gc2hhcGUxIDogc2hhcGUyO1xuICAgICAgdmFyIHJhZCA9IHMucmFkaXVzO1xuICAgICAgdmFyIGxlbjtcblxuICAgICAgbi5zdWIocy5wb3NpdGlvbiwgcG4ucG9zaXRpb24pO1xuICAgICAgLy92YXIgaCA9IF9NYXRoLmRvdFZlY3RvcnMoIHBuLm5vcm1hbCwgbiApO1xuXG4gICAgICBuLnggKj0gcG4ubm9ybWFsLng7Ly8rIHJhZDtcbiAgICAgIG4ueSAqPSBwbi5ub3JtYWwueTtcbiAgICAgIG4ueiAqPSBwbi5ub3JtYWwuejsvLysgcmFkO1xuXG5cbiAgICAgIHZhciBsZW4gPSBuLmxlbmd0aFNxKCk7XG5cbiAgICAgIGlmIChsZW4gPiAwICYmIGxlbiA8IHJhZCAqIHJhZCkgey8vJiYgaCA+IHJhZCpyYWQgKXtcblxuXG4gICAgICAgIGxlbiA9IF9NYXRoLnNxcnQobGVuKTtcbiAgICAgICAgLy9sZW4gPSBfTWF0aC5zcXJ0KCBoICk7XG4gICAgICAgIG4uY29weShwbi5ub3JtYWwpLm5lZ2F0ZSgpO1xuICAgICAgICAvL24uc2NhbGVFcXVhbCggMS9sZW4gKTtcblxuICAgICAgICAvLygwLCAtMSwgMClcblxuICAgICAgICAvL24ubm9ybWFsaXplKCk7XG4gICAgICAgIHAuY29weShzLnBvc2l0aW9uKS5hZGRTY2FsZWRWZWN0b3IobiwgcmFkKTtcbiAgICAgICAgbWFuaWZvbGQuYWRkUG9pbnRWZWMocCwgbiwgbGVuIC0gcmFkLCB0aGlzLmZsaXApO1xuXG4gICAgICB9XG5cbiAgICB9XG5cbiAgfSk7XG5cbiAgLyoqXG4gICAqIEEgY29sbGlzaW9uIGRldGVjdG9yIHdoaWNoIGRldGVjdHMgY29sbGlzaW9ucyBiZXR3ZWVuIHR3byBzcGhlcmVzLlxuICAgKiBAYXV0aG9yIHNhaGFyYW4gXG4gICAqIEBhdXRob3IgbG8tdGhcbiAgICovXG5cbiAgZnVuY3Rpb24gQm94UGxhbmVDb2xsaXNpb25EZXRlY3RvcihmbGlwKSB7XG5cbiAgICBDb2xsaXNpb25EZXRlY3Rvci5jYWxsKHRoaXMpO1xuXG4gICAgdGhpcy5mbGlwID0gZmxpcDtcblxuICAgIHRoaXMubiA9IG5ldyBWZWMzKCk7XG4gICAgdGhpcy5wID0gbmV3IFZlYzMoKTtcblxuICAgIHRoaXMuZGl4ID0gbmV3IFZlYzMoKTtcbiAgICB0aGlzLmRpeSA9IG5ldyBWZWMzKCk7XG4gICAgdGhpcy5kaXogPSBuZXcgVmVjMygpO1xuXG4gICAgdGhpcy5jYyA9IG5ldyBWZWMzKCk7XG4gICAgdGhpcy5jYzIgPSBuZXcgVmVjMygpO1xuXG4gIH1cbiAgQm94UGxhbmVDb2xsaXNpb25EZXRlY3Rvci5wcm90b3R5cGUgPSBPYmplY3QuYXNzaWduKE9iamVjdC5jcmVhdGUoQ29sbGlzaW9uRGV0ZWN0b3IucHJvdG90eXBlKSwge1xuXG4gICAgY29uc3RydWN0b3I6IEJveFBsYW5lQ29sbGlzaW9uRGV0ZWN0b3IsXG5cbiAgICBkZXRlY3RDb2xsaXNpb246IGZ1bmN0aW9uIChzaGFwZTEsIHNoYXBlMiwgbWFuaWZvbGQpIHtcblxuICAgICAgdmFyIG4gPSB0aGlzLm47XG4gICAgICB2YXIgcCA9IHRoaXMucDtcbiAgICAgIHZhciBjYyA9IHRoaXMuY2M7XG5cbiAgICAgIHZhciBiID0gdGhpcy5mbGlwID8gc2hhcGUyIDogc2hhcGUxO1xuICAgICAgdmFyIHBuID0gdGhpcy5mbGlwID8gc2hhcGUxIDogc2hhcGUyO1xuXG4gICAgICB2YXIgRCA9IGIuZGltZW50aW9ucztcbiAgICAgIHZhciBodyA9IGIuaGFsZldpZHRoO1xuICAgICAgdmFyIGhoID0gYi5oYWxmSGVpZ2h0O1xuICAgICAgdmFyIGhkID0gYi5oYWxmRGVwdGg7XG4gICAgICB2YXIgbGVuO1xuICAgICAgdmFyIG92ZXJsYXAgPSAwO1xuXG4gICAgICB0aGlzLmRpeC5zZXQoRFswXSwgRFsxXSwgRFsyXSk7XG4gICAgICB0aGlzLmRpeS5zZXQoRFszXSwgRFs0XSwgRFs1XSk7XG4gICAgICB0aGlzLmRpei5zZXQoRFs2XSwgRFs3XSwgRFs4XSk7XG5cbiAgICAgIG4uc3ViKGIucG9zaXRpb24sIHBuLnBvc2l0aW9uKTtcblxuICAgICAgbi54ICo9IHBuLm5vcm1hbC54Oy8vKyByYWQ7XG4gICAgICBuLnkgKj0gcG4ubm9ybWFsLnk7XG4gICAgICBuLnogKj0gcG4ubm9ybWFsLno7Ly8rIHJhZDtcblxuICAgICAgY2Muc2V0KFxuICAgICAgICBfTWF0aC5kb3RWZWN0b3JzKHRoaXMuZGl4LCBuKSxcbiAgICAgICAgX01hdGguZG90VmVjdG9ycyh0aGlzLmRpeSwgbiksXG4gICAgICAgIF9NYXRoLmRvdFZlY3RvcnModGhpcy5kaXosIG4pXG4gICAgICApO1xuXG5cbiAgICAgIGlmIChjYy54ID4gaHcpIGNjLnggPSBodztcbiAgICAgIGVsc2UgaWYgKGNjLnggPCAtaHcpIGNjLnggPSAtaHc7XG4gICAgICBlbHNlIG92ZXJsYXAgPSAxO1xuXG4gICAgICBpZiAoY2MueSA+IGhoKSBjYy55ID0gaGg7XG4gICAgICBlbHNlIGlmIChjYy55IDwgLWhoKSBjYy55ID0gLWhoO1xuICAgICAgZWxzZSBvdmVybGFwIHw9IDI7XG5cbiAgICAgIGlmIChjYy56ID4gaGQpIGNjLnogPSBoZDtcbiAgICAgIGVsc2UgaWYgKGNjLnogPCAtaGQpIGNjLnogPSAtaGQ7XG4gICAgICBlbHNlIG92ZXJsYXAgfD0gNDtcblxuXG5cbiAgICAgIGlmIChvdmVybGFwID09PSA3KSB7XG5cbiAgICAgICAgLy8gY2VudGVyIG9mIHNwaGVyZSBpcyBpbiB0aGUgYm94XG5cbiAgICAgICAgbi5zZXQoXG4gICAgICAgICAgY2MueCA8IDAgPyBodyArIGNjLnggOiBodyAtIGNjLngsXG4gICAgICAgICAgY2MueSA8IDAgPyBoaCArIGNjLnkgOiBoaCAtIGNjLnksXG4gICAgICAgICAgY2MueiA8IDAgPyBoZCArIGNjLnogOiBoZCAtIGNjLnpcbiAgICAgICAgKTtcblxuICAgICAgICBpZiAobi54IDwgbi55KSB7XG4gICAgICAgICAgaWYgKG4ueCA8IG4ueikge1xuICAgICAgICAgICAgbGVuID0gbi54IC0gaHc7XG4gICAgICAgICAgICBpZiAoY2MueCA8IDApIHtcbiAgICAgICAgICAgICAgY2MueCA9IC1odztcbiAgICAgICAgICAgICAgbi5jb3B5KHRoaXMuZGl4KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGNjLnggPSBodztcbiAgICAgICAgICAgICAgbi5zdWJFcXVhbCh0aGlzLmRpeCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxlbiA9IG4ueiAtIGhkO1xuICAgICAgICAgICAgaWYgKGNjLnogPCAwKSB7XG4gICAgICAgICAgICAgIGNjLnogPSAtaGQ7XG4gICAgICAgICAgICAgIG4uY29weSh0aGlzLmRpeik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBjYy56ID0gaGQ7XG4gICAgICAgICAgICAgIG4uc3ViRXF1YWwodGhpcy5kaXopO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAobi55IDwgbi56KSB7XG4gICAgICAgICAgICBsZW4gPSBuLnkgLSBoaDtcbiAgICAgICAgICAgIGlmIChjYy55IDwgMCkge1xuICAgICAgICAgICAgICBjYy55ID0gLWhoO1xuICAgICAgICAgICAgICBuLmNvcHkodGhpcy5kaXkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgY2MueSA9IGhoO1xuICAgICAgICAgICAgICBuLnN1YkVxdWFsKHRoaXMuZGl5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGVuID0gbi56IC0gaGQ7XG4gICAgICAgICAgICBpZiAoY2MueiA8IDApIHtcbiAgICAgICAgICAgICAgY2MueiA9IC1oZDtcbiAgICAgICAgICAgICAgbi5jb3B5KHRoaXMuZGl6KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGNjLnogPSBoZDtcbiAgICAgICAgICAgICAgbi5zdWJFcXVhbCh0aGlzLmRpeik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcC5jb3B5KHBuLnBvc2l0aW9uKS5hZGRTY2FsZWRWZWN0b3IobiwgMSk7XG4gICAgICAgIG1hbmlmb2xkLmFkZFBvaW50VmVjKHAsIG4sIGxlbiwgdGhpcy5mbGlwKTtcblxuICAgICAgfVxuXG4gICAgfVxuXG4gIH0pO1xuXG4gIC8qKlxuICAgKiBUaGUgY2xhc3Mgb2YgcGh5c2ljYWwgY29tcHV0aW5nIHdvcmxkLlxuICAgKiBZb3UgbXVzdCBiZSBhZGRlZCB0byB0aGUgd29ybGQgcGh5c2ljYWwgYWxsIGNvbXB1dGluZyBvYmplY3RzXG4gICAqXG4gICAqIEBhdXRob3Igc2FoYXJhblxuICAgKiBAYXV0aG9yIGxvLXRoXG4gICAqL1xuXG4gIC8vIHRpbWVzdGVwLCBicm9hZHBoYXNlLCBpdGVyYXRpb25zLCB3b3JsZHNjYWxlLCByYW5kb20sIHN0YXRcblxuICBmdW5jdGlvbiBXb3JsZChvKSB7XG5cbiAgICBpZiAoIShvIGluc3RhbmNlb2YgT2JqZWN0KSkgbyA9IHt9O1xuXG4gICAgLy8gdGhpcyB3b3JsZCBzY2FsZSBkZWZhdXQgaXMgMC4xIHRvIDEwIG1ldGVycyBtYXggZm9yIGR5bmFtaXF1ZSBib2R5XG4gICAgdGhpcy5zY2FsZSA9IG8ud29ybGRzY2FsZSB8fCAxO1xuICAgIHRoaXMuaW52U2NhbGUgPSAxIC8gdGhpcy5zY2FsZTtcblxuICAgIC8vIFRoZSB0aW1lIGJldHdlZW4gZWFjaCBzdGVwXG4gICAgdGhpcy50aW1lU3RlcCA9IG8udGltZXN0ZXAgfHwgMC4wMTY2NjsgLy8gMS82MDtcbiAgICB0aGlzLnRpbWVyYXRlID0gdGhpcy50aW1lU3RlcCAqIDEwMDA7XG4gICAgdGhpcy50aW1lciA9IG51bGw7XG5cbiAgICB0aGlzLnByZUxvb3AgPSBudWxsOy8vZnVuY3Rpb24oKXt9O1xuICAgIHRoaXMucG9zdExvb3AgPSBudWxsOy8vZnVuY3Rpb24oKXt9O1xuXG4gICAgLy8gVGhlIG51bWJlciBvZiBpdGVyYXRpb25zIGZvciBjb25zdHJhaW50IHNvbHZlcnMuXG4gICAgdGhpcy5udW1JdGVyYXRpb25zID0gby5pdGVyYXRpb25zIHx8IDg7XG5cbiAgICAvLyBJdCBpcyBhIHdpZGUtYXJlYSBjb2xsaXNpb24ganVkZ21lbnQgdGhhdCBpcyB1c2VkIGluIG9yZGVyIHRvIHJlZHVjZSBhcyBtdWNoIGFzIHBvc3NpYmxlIGEgZGV0YWlsZWQgY29sbGlzaW9uIGp1ZGdtZW50LlxuICAgIHN3aXRjaCAoby5icm9hZHBoYXNlIHx8IDIpIHtcbiAgICAgIGNhc2UgMTogdGhpcy5icm9hZFBoYXNlID0gbmV3IEJydXRlRm9yY2VCcm9hZFBoYXNlKCk7IGJyZWFrO1xuICAgICAgY2FzZSAyOiBkZWZhdWx0OiB0aGlzLmJyb2FkUGhhc2UgPSBuZXcgU0FQQnJvYWRQaGFzZSgpOyBicmVhaztcbiAgICAgIGNhc2UgMzogdGhpcy5icm9hZFBoYXNlID0gbmV3IERCVlRCcm9hZFBoYXNlKCk7IGJyZWFrO1xuICAgIH1cblxuICAgIHRoaXMuQnR5cGVzID0gWydOb25lJywgJ0JydXRlRm9yY2UnLCAnU3dlZXAgJiBQcnVuZScsICdCb3VuZGluZyBWb2x1bWUgVHJlZSddO1xuICAgIHRoaXMuYnJvYWRQaGFzZVR5cGUgPSB0aGlzLkJ0eXBlc1tvLmJyb2FkcGhhc2UgfHwgMl07XG5cbiAgICAvLyBUaGlzIGlzIHRoZSBkZXRhaWxlZCBpbmZvcm1hdGlvbiBvZiB0aGUgcGVyZm9ybWFuY2UuXG4gICAgdGhpcy5wZXJmb3JtYW5jZSA9IG51bGw7XG4gICAgdGhpcy5pc1N0YXQgPSBvLmluZm8gPT09IHVuZGVmaW5lZCA/IGZhbHNlIDogby5pbmZvO1xuICAgIGlmICh0aGlzLmlzU3RhdCkgdGhpcy5wZXJmb3JtYW5jZSA9IG5ldyBJbmZvRGlzcGxheSh0aGlzKTtcblxuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgdGhlIGNvbnN0cmFpbnRzIHJhbmRvbWl6ZXIgaXMgZW5hYmxlZCBvciBub3QuXG4gICAgICpcbiAgICAgKiBAcHJvcGVydHkgZW5hYmxlUmFuZG9taXplclxuICAgICAqIEB0eXBlIHtCb29sZWFufVxuICAgICAqL1xuICAgIHRoaXMuZW5hYmxlUmFuZG9taXplciA9IG8ucmFuZG9tICE9PSB1bmRlZmluZWQgPyBvLnJhbmRvbSA6IHRydWU7XG5cbiAgICAvLyBUaGUgcmlnaWQgYm9keSBsaXN0XG4gICAgdGhpcy5yaWdpZEJvZGllcyA9IG51bGw7XG4gICAgLy8gbnVtYmVyIG9mIHJpZ2lkIGJvZHlcbiAgICB0aGlzLm51bVJpZ2lkQm9kaWVzID0gMDtcbiAgICAvLyBUaGUgY29udGFjdCBsaXN0XG4gICAgdGhpcy5jb250YWN0cyA9IG51bGw7XG4gICAgdGhpcy51bnVzZWRDb250YWN0cyA9IG51bGw7XG4gICAgLy8gVGhlIG51bWJlciBvZiBjb250YWN0XG4gICAgdGhpcy5udW1Db250YWN0cyA9IDA7XG4gICAgLy8gVGhlIG51bWJlciBvZiBjb250YWN0IHBvaW50c1xuICAgIHRoaXMubnVtQ29udGFjdFBvaW50cyA9IDA7XG4gICAgLy8gIFRoZSBqb2ludCBsaXN0XG4gICAgdGhpcy5qb2ludHMgPSBudWxsO1xuICAgIC8vIFRoZSBudW1iZXIgb2Ygam9pbnRzLlxuICAgIHRoaXMubnVtSm9pbnRzID0gMDtcbiAgICAvLyBUaGUgbnVtYmVyIG9mIHNpbXVsYXRpb24gaXNsYW5kcy5cbiAgICB0aGlzLm51bUlzbGFuZHMgPSAwO1xuXG5cbiAgICAvLyBUaGUgZ3Jhdml0eSBpbiB0aGUgd29ybGQuXG4gICAgdGhpcy5ncmF2aXR5ID0gbmV3IFZlYzMoMCwgLTkuOCwgMCk7XG4gICAgaWYgKG8uZ3Jhdml0eSAhPT0gdW5kZWZpbmVkKSB0aGlzLmdyYXZpdHkuZnJvbUFycmF5KG8uZ3Jhdml0eSk7XG5cblxuXG4gICAgdmFyIG51bVNoYXBlVHlwZXMgPSA1Oy8vNDsvLzM7XG4gICAgdGhpcy5kZXRlY3RvcnMgPSBbXTtcbiAgICB0aGlzLmRldGVjdG9ycy5sZW5ndGggPSBudW1TaGFwZVR5cGVzO1xuICAgIHZhciBpID0gbnVtU2hhcGVUeXBlcztcbiAgICB3aGlsZSAoaS0tKSB7XG4gICAgICB0aGlzLmRldGVjdG9yc1tpXSA9IFtdO1xuICAgICAgdGhpcy5kZXRlY3RvcnNbaV0ubGVuZ3RoID0gbnVtU2hhcGVUeXBlcztcbiAgICB9XG5cbiAgICB0aGlzLmRldGVjdG9yc1tTSEFQRV9TUEhFUkVdW1NIQVBFX1NQSEVSRV0gPSBuZXcgU3BoZXJlU3BoZXJlQ29sbGlzaW9uRGV0ZWN0b3IoKTtcbiAgICB0aGlzLmRldGVjdG9yc1tTSEFQRV9TUEhFUkVdW1NIQVBFX0JPWF0gPSBuZXcgU3BoZXJlQm94Q29sbGlzaW9uRGV0ZWN0b3IoZmFsc2UpO1xuICAgIHRoaXMuZGV0ZWN0b3JzW1NIQVBFX0JPWF1bU0hBUEVfU1BIRVJFXSA9IG5ldyBTcGhlcmVCb3hDb2xsaXNpb25EZXRlY3Rvcih0cnVlKTtcbiAgICB0aGlzLmRldGVjdG9yc1tTSEFQRV9CT1hdW1NIQVBFX0JPWF0gPSBuZXcgQm94Qm94Q29sbGlzaW9uRGV0ZWN0b3IoKTtcblxuICAgIC8vIENZTElOREVSIGFkZFxuICAgIHRoaXMuZGV0ZWN0b3JzW1NIQVBFX0NZTElOREVSXVtTSEFQRV9DWUxJTkRFUl0gPSBuZXcgQ3lsaW5kZXJDeWxpbmRlckNvbGxpc2lvbkRldGVjdG9yKCk7XG5cbiAgICB0aGlzLmRldGVjdG9yc1tTSEFQRV9DWUxJTkRFUl1bU0hBUEVfQk9YXSA9IG5ldyBCb3hDeWxpbmRlckNvbGxpc2lvbkRldGVjdG9yKHRydWUpO1xuICAgIHRoaXMuZGV0ZWN0b3JzW1NIQVBFX0JPWF1bU0hBUEVfQ1lMSU5ERVJdID0gbmV3IEJveEN5bGluZGVyQ29sbGlzaW9uRGV0ZWN0b3IoZmFsc2UpO1xuXG4gICAgdGhpcy5kZXRlY3RvcnNbU0hBUEVfQ1lMSU5ERVJdW1NIQVBFX1NQSEVSRV0gPSBuZXcgU3BoZXJlQ3lsaW5kZXJDb2xsaXNpb25EZXRlY3Rvcih0cnVlKTtcbiAgICB0aGlzLmRldGVjdG9yc1tTSEFQRV9TUEhFUkVdW1NIQVBFX0NZTElOREVSXSA9IG5ldyBTcGhlcmVDeWxpbmRlckNvbGxpc2lvbkRldGVjdG9yKGZhbHNlKTtcblxuICAgIC8vIFBMQU5FIGFkZFxuXG4gICAgdGhpcy5kZXRlY3RvcnNbU0hBUEVfUExBTkVdW1NIQVBFX1NQSEVSRV0gPSBuZXcgU3BoZXJlUGxhbmVDb2xsaXNpb25EZXRlY3Rvcih0cnVlKTtcbiAgICB0aGlzLmRldGVjdG9yc1tTSEFQRV9TUEhFUkVdW1NIQVBFX1BMQU5FXSA9IG5ldyBTcGhlcmVQbGFuZUNvbGxpc2lvbkRldGVjdG9yKGZhbHNlKTtcblxuICAgIHRoaXMuZGV0ZWN0b3JzW1NIQVBFX1BMQU5FXVtTSEFQRV9CT1hdID0gbmV3IEJveFBsYW5lQ29sbGlzaW9uRGV0ZWN0b3IodHJ1ZSk7XG4gICAgdGhpcy5kZXRlY3RvcnNbU0hBUEVfQk9YXVtTSEFQRV9QTEFORV0gPSBuZXcgQm94UGxhbmVDb2xsaXNpb25EZXRlY3RvcihmYWxzZSk7XG5cbiAgICAvLyBURVRSQSBhZGRcbiAgICAvL3RoaXMuZGV0ZWN0b3JzW1NIQVBFX1RFVFJBXVtTSEFQRV9URVRSQV0gPSBuZXcgVGV0cmFUZXRyYUNvbGxpc2lvbkRldGVjdG9yKCk7XG5cblxuICAgIHRoaXMucmFuZFggPSA2NTUzNTtcbiAgICB0aGlzLnJhbmRBID0gOTg3NjU7XG4gICAgdGhpcy5yYW5kQiA9IDEyMzQ1Njc4OTtcblxuICAgIHRoaXMuaXNsYW5kUmlnaWRCb2RpZXMgPSBbXTtcbiAgICB0aGlzLmlzbGFuZFN0YWNrID0gW107XG4gICAgdGhpcy5pc2xhbmRDb25zdHJhaW50cyA9IFtdO1xuXG4gIH1cblxuICBPYmplY3QuYXNzaWduKFdvcmxkLnByb3RvdHlwZSwge1xuXG4gICAgV29ybGQ6IHRydWUsXG5cbiAgICBwbGF5OiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIGlmICh0aGlzLnRpbWVyICE9PSBudWxsKSByZXR1cm47XG5cbiAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICB0aGlzLnRpbWVyID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24gKCkgeyBfdGhpcy5zdGVwKCk7IH0sIHRoaXMudGltZXJhdGUpO1xuICAgICAgLy90aGlzLnRpbWVyID0gc2V0SW50ZXJ2YWwoIHRoaXMubG9vcC5iaW5kKHRoaXMpICwgdGhpcy50aW1lcmF0ZSApO1xuXG4gICAgfSxcblxuICAgIHN0b3A6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgaWYgKHRoaXMudGltZXIgPT09IG51bGwpIHJldHVybjtcblxuICAgICAgY2xlYXJJbnRlcnZhbCh0aGlzLnRpbWVyKTtcbiAgICAgIHRoaXMudGltZXIgPSBudWxsO1xuXG4gICAgfSxcblxuICAgIHNldEdyYXZpdHk6IGZ1bmN0aW9uIChhcikge1xuXG4gICAgICB0aGlzLmdyYXZpdHkuZnJvbUFycmF5KGFyKTtcblxuICAgIH0sXG5cbiAgICBnZXRJbmZvOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHJldHVybiB0aGlzLmlzU3RhdCA/IHRoaXMucGVyZm9ybWFuY2Uuc2hvdygpIDogJyc7XG5cbiAgICB9LFxuXG4gICAgLy8gUmVzZXQgdGhlIHdvcmxkIGFuZCByZW1vdmUgYWxsIHJpZ2lkIGJvZGllcywgc2hhcGVzLCBqb2ludHMgYW5kIGFueSBvYmplY3QgZnJvbSB0aGUgd29ybGQuXG4gICAgY2xlYXI6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgdGhpcy5zdG9wKCk7XG4gICAgICB0aGlzLnByZUxvb3AgPSBudWxsO1xuICAgICAgdGhpcy5wb3N0TG9vcCA9IG51bGw7XG5cbiAgICAgIHRoaXMucmFuZFggPSA2NTUzNTtcblxuICAgICAgd2hpbGUgKHRoaXMuam9pbnRzICE9PSBudWxsKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlSm9pbnQodGhpcy5qb2ludHMpO1xuICAgICAgfVxuICAgICAgd2hpbGUgKHRoaXMuY29udGFjdHMgIT09IG51bGwpIHtcbiAgICAgICAgdGhpcy5yZW1vdmVDb250YWN0KHRoaXMuY29udGFjdHMpO1xuICAgICAgfVxuICAgICAgd2hpbGUgKHRoaXMucmlnaWRCb2RpZXMgIT09IG51bGwpIHtcbiAgICAgICAgdGhpcy5yZW1vdmVSaWdpZEJvZHkodGhpcy5yaWdpZEJvZGllcyk7XG4gICAgICB9XG5cbiAgICB9LFxuICAgIC8qKlxuICAgICogSSdsbCBhZGQgYSByaWdpZCBib2R5IHRvIHRoZSB3b3JsZC5cbiAgICAqIFJpZ2lkIGJvZHkgdGhhdCBoYXMgYmVlbiBhZGRlZCB3aWxsIGJlIHRoZSBvcGVyYW5kcyBvZiBlYWNoIHN0ZXAuXG4gICAgKiBAcGFyYW0gIHJpZ2lkQm9keSAgUmlnaWQgYm9keSB0aGF0IHlvdSB3YW50IHRvIGFkZFxuICAgICovXG4gICAgYWRkUmlnaWRCb2R5OiBmdW5jdGlvbiAocmlnaWRCb2R5KSB7XG5cbiAgICAgIGlmIChyaWdpZEJvZHkucGFyZW50KSB7XG4gICAgICAgIHByaW50RXJyb3IoXCJXb3JsZFwiLCBcIkl0IGlzIG5vdCBwb3NzaWJsZSB0byBiZSBhZGRlZCB0byBtb3JlIHRoYW4gb25lIHdvcmxkIG9uZSBvZiB0aGUgcmlnaWQgYm9keVwiKTtcbiAgICAgIH1cblxuICAgICAgcmlnaWRCb2R5LnNldFBhcmVudCh0aGlzKTtcbiAgICAgIC8vcmlnaWRCb2R5LmF3YWtlKCk7XG5cbiAgICAgIGZvciAodmFyIHNoYXBlID0gcmlnaWRCb2R5LnNoYXBlczsgc2hhcGUgIT09IG51bGw7IHNoYXBlID0gc2hhcGUubmV4dCkge1xuICAgICAgICB0aGlzLmFkZFNoYXBlKHNoYXBlKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLnJpZ2lkQm9kaWVzICE9PSBudWxsKSAodGhpcy5yaWdpZEJvZGllcy5wcmV2ID0gcmlnaWRCb2R5KS5uZXh0ID0gdGhpcy5yaWdpZEJvZGllcztcbiAgICAgIHRoaXMucmlnaWRCb2RpZXMgPSByaWdpZEJvZHk7XG4gICAgICB0aGlzLm51bVJpZ2lkQm9kaWVzKys7XG5cbiAgICB9LFxuICAgIC8qKlxuICAgICogSSB3aWxsIHJlbW92ZSB0aGUgcmlnaWQgYm9keSBmcm9tIHRoZSB3b3JsZC5cbiAgICAqIFJpZ2lkIGJvZHkgdGhhdCBoYXMgYmVlbiBkZWxldGVkIGlzIGV4Y2x1ZGVkIGZyb20gdGhlIGNhbGN1bGF0aW9uIG9uIGEgc3RlcC1ieS1zdGVwIGJhc2lzLlxuICAgICogQHBhcmFtICByaWdpZEJvZHkgIFJpZ2lkIGJvZHkgdG8gYmUgcmVtb3ZlZFxuICAgICovXG4gICAgcmVtb3ZlUmlnaWRCb2R5OiBmdW5jdGlvbiAocmlnaWRCb2R5KSB7XG5cbiAgICAgIHZhciByZW1vdmUgPSByaWdpZEJvZHk7XG4gICAgICBpZiAocmVtb3ZlLnBhcmVudCAhPT0gdGhpcykgcmV0dXJuO1xuICAgICAgcmVtb3ZlLmF3YWtlKCk7XG4gICAgICB2YXIganMgPSByZW1vdmUuam9pbnRMaW5rO1xuICAgICAgd2hpbGUgKGpzICE9IG51bGwpIHtcbiAgICAgICAgdmFyIGpvaW50ID0ganMuam9pbnQ7XG4gICAgICAgIGpzID0ganMubmV4dDtcbiAgICAgICAgdGhpcy5yZW1vdmVKb2ludChqb2ludCk7XG4gICAgICB9XG4gICAgICBmb3IgKHZhciBzaGFwZSA9IHJpZ2lkQm9keS5zaGFwZXM7IHNoYXBlICE9PSBudWxsOyBzaGFwZSA9IHNoYXBlLm5leHQpIHtcbiAgICAgICAgdGhpcy5yZW1vdmVTaGFwZShzaGFwZSk7XG4gICAgICB9XG4gICAgICB2YXIgcHJldiA9IHJlbW92ZS5wcmV2O1xuICAgICAgdmFyIG5leHQgPSByZW1vdmUubmV4dDtcbiAgICAgIGlmIChwcmV2ICE9PSBudWxsKSBwcmV2Lm5leHQgPSBuZXh0O1xuICAgICAgaWYgKG5leHQgIT09IG51bGwpIG5leHQucHJldiA9IHByZXY7XG4gICAgICBpZiAodGhpcy5yaWdpZEJvZGllcyA9PSByZW1vdmUpIHRoaXMucmlnaWRCb2RpZXMgPSBuZXh0O1xuICAgICAgcmVtb3ZlLnByZXYgPSBudWxsO1xuICAgICAgcmVtb3ZlLm5leHQgPSBudWxsO1xuICAgICAgcmVtb3ZlLnBhcmVudCA9IG51bGw7XG4gICAgICB0aGlzLm51bVJpZ2lkQm9kaWVzLS07XG5cbiAgICB9LFxuXG4gICAgZ2V0QnlOYW1lOiBmdW5jdGlvbiAobmFtZSkge1xuXG4gICAgICB2YXIgYm9keSA9IHRoaXMucmlnaWRCb2RpZXM7XG4gICAgICB3aGlsZSAoYm9keSAhPT0gbnVsbCkge1xuICAgICAgICBpZiAoYm9keS5uYW1lID09PSBuYW1lKSByZXR1cm4gYm9keTtcbiAgICAgICAgYm9keSA9IGJvZHkubmV4dDtcbiAgICAgIH1cblxuICAgICAgdmFyIGpvaW50ID0gdGhpcy5qb2ludHM7XG4gICAgICB3aGlsZSAoam9pbnQgIT09IG51bGwpIHtcbiAgICAgICAgaWYgKGpvaW50Lm5hbWUgPT09IG5hbWUpIHJldHVybiBqb2ludDtcbiAgICAgICAgam9pbnQgPSBqb2ludC5uZXh0O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbnVsbDtcblxuICAgIH0sXG5cbiAgICAvKipcbiAgICAqIEknbGwgYWRkIGEgc2hhcGUgdG8gdGhlIHdvcmxkLi5cbiAgICAqIEFkZCB0byB0aGUgcmlnaWQgd29ybGQsIGFuZCBpZiB5b3UgYWRkIGEgc2hhcGUgdG8gYSByaWdpZCBib2R5IHRoYXQgaGFzIGJlZW4gYWRkZWQgdG8gdGhlIHdvcmxkLFxuICAgICogU2hhcGUgd2lsbCBiZSBhZGRlZCB0byB0aGUgd29ybGQgYXV0b21hdGljYWxseSwgcGxlYXNlIGRvIG5vdCBjYWxsIGZyb20gb3V0c2lkZSB0aGlzIG1ldGhvZC5cbiAgICAqIEBwYXJhbSAgc2hhcGUgIFNoYXBlIHlvdSB3YW50IHRvIGFkZFxuICAgICovXG4gICAgYWRkU2hhcGU6IGZ1bmN0aW9uIChzaGFwZSkge1xuXG4gICAgICBpZiAoIXNoYXBlLnBhcmVudCB8fCAhc2hhcGUucGFyZW50LnBhcmVudCkge1xuICAgICAgICBwcmludEVycm9yKFwiV29ybGRcIiwgXCJJdCBpcyBub3QgcG9zc2libGUgdG8gYmUgYWRkZWQgYWxvbmUgdG8gc2hhcGUgd29ybGRcIik7XG4gICAgICB9XG5cbiAgICAgIHNoYXBlLnByb3h5ID0gdGhpcy5icm9hZFBoYXNlLmNyZWF0ZVByb3h5KHNoYXBlKTtcbiAgICAgIHNoYXBlLnVwZGF0ZVByb3h5KCk7XG4gICAgICB0aGlzLmJyb2FkUGhhc2UuYWRkUHJveHkoc2hhcGUucHJveHkpO1xuXG4gICAgfSxcblxuICAgIC8qKlxuICAgICogSSB3aWxsIHJlbW92ZSB0aGUgc2hhcGUgZnJvbSB0aGUgd29ybGQuXG4gICAgKiBBZGQgdG8gdGhlIHJpZ2lkIHdvcmxkLCBhbmQgaWYgeW91IGFkZCBhIHNoYXBlIHRvIGEgcmlnaWQgYm9keSB0aGF0IGhhcyBiZWVuIGFkZGVkIHRvIHRoZSB3b3JsZCxcbiAgICAqIFNoYXBlIHdpbGwgYmUgYWRkZWQgdG8gdGhlIHdvcmxkIGF1dG9tYXRpY2FsbHksIHBsZWFzZSBkbyBub3QgY2FsbCBmcm9tIG91dHNpZGUgdGhpcyBtZXRob2QuXG4gICAgKiBAcGFyYW0gIHNoYXBlICBTaGFwZSB5b3Ugd2FudCB0byBkZWxldGVcbiAgICAqL1xuICAgIHJlbW92ZVNoYXBlOiBmdW5jdGlvbiAoc2hhcGUpIHtcblxuICAgICAgdGhpcy5icm9hZFBoYXNlLnJlbW92ZVByb3h5KHNoYXBlLnByb3h5KTtcbiAgICAgIHNoYXBlLnByb3h5ID0gbnVsbDtcblxuICAgIH0sXG5cbiAgICAvKipcbiAgICAqIEknbGwgYWRkIGEgam9pbnQgdG8gdGhlIHdvcmxkLlxuICAgICogSm9pbnQgdGhhdCBoYXMgYmVlbiBhZGRlZCB3aWxsIGJlIHRoZSBvcGVyYW5kcyBvZiBlYWNoIHN0ZXAuXG4gICAgKiBAcGFyYW0gIHNoYXBlIEpvaW50IHRvIGJlIGFkZGVkXG4gICAgKi9cbiAgICBhZGRKb2ludDogZnVuY3Rpb24gKGpvaW50KSB7XG5cbiAgICAgIGlmIChqb2ludC5wYXJlbnQpIHtcbiAgICAgICAgcHJpbnRFcnJvcihcIldvcmxkXCIsIFwiSXQgaXMgbm90IHBvc3NpYmxlIHRvIGJlIGFkZGVkIHRvIG1vcmUgdGhhbiBvbmUgd29ybGQgb25lIG9mIHRoZSBqb2ludFwiKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmpvaW50cyAhPSBudWxsKSAodGhpcy5qb2ludHMucHJldiA9IGpvaW50KS5uZXh0ID0gdGhpcy5qb2ludHM7XG4gICAgICB0aGlzLmpvaW50cyA9IGpvaW50O1xuICAgICAgam9pbnQuc2V0UGFyZW50KHRoaXMpO1xuICAgICAgdGhpcy5udW1Kb2ludHMrKztcbiAgICAgIGpvaW50LmF3YWtlKCk7XG4gICAgICBqb2ludC5hdHRhY2goKTtcblxuICAgIH0sXG5cbiAgICAvKipcbiAgICAqIEkgd2lsbCByZW1vdmUgdGhlIGpvaW50IGZyb20gdGhlIHdvcmxkLlxuICAgICogSm9pbnQgdGhhdCBoYXMgYmVlbiBhZGRlZCB3aWxsIGJlIHRoZSBvcGVyYW5kcyBvZiBlYWNoIHN0ZXAuXG4gICAgKiBAcGFyYW0gIHNoYXBlIEpvaW50IHRvIGJlIGRlbGV0ZWRcbiAgICAqL1xuICAgIHJlbW92ZUpvaW50OiBmdW5jdGlvbiAoam9pbnQpIHtcblxuICAgICAgdmFyIHJlbW92ZSA9IGpvaW50O1xuICAgICAgdmFyIHByZXYgPSByZW1vdmUucHJldjtcbiAgICAgIHZhciBuZXh0ID0gcmVtb3ZlLm5leHQ7XG4gICAgICBpZiAocHJldiAhPT0gbnVsbCkgcHJldi5uZXh0ID0gbmV4dDtcbiAgICAgIGlmIChuZXh0ICE9PSBudWxsKSBuZXh0LnByZXYgPSBwcmV2O1xuICAgICAgaWYgKHRoaXMuam9pbnRzID09IHJlbW92ZSkgdGhpcy5qb2ludHMgPSBuZXh0O1xuICAgICAgcmVtb3ZlLnByZXYgPSBudWxsO1xuICAgICAgcmVtb3ZlLm5leHQgPSBudWxsO1xuICAgICAgdGhpcy5udW1Kb2ludHMtLTtcbiAgICAgIHJlbW92ZS5hd2FrZSgpO1xuICAgICAgcmVtb3ZlLmRldGFjaCgpO1xuICAgICAgcmVtb3ZlLnBhcmVudCA9IG51bGw7XG5cbiAgICB9LFxuXG4gICAgYWRkQ29udGFjdDogZnVuY3Rpb24gKHMxLCBzMikge1xuXG4gICAgICB2YXIgbmV3Q29udGFjdDtcbiAgICAgIGlmICh0aGlzLnVudXNlZENvbnRhY3RzICE9PSBudWxsKSB7XG4gICAgICAgIG5ld0NvbnRhY3QgPSB0aGlzLnVudXNlZENvbnRhY3RzO1xuICAgICAgICB0aGlzLnVudXNlZENvbnRhY3RzID0gdGhpcy51bnVzZWRDb250YWN0cy5uZXh0O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbmV3Q29udGFjdCA9IG5ldyBDb250YWN0KCk7XG4gICAgICB9XG4gICAgICBuZXdDb250YWN0LmF0dGFjaChzMSwgczIpO1xuICAgICAgbmV3Q29udGFjdC5kZXRlY3RvciA9IHRoaXMuZGV0ZWN0b3JzW3MxLnR5cGVdW3MyLnR5cGVdO1xuICAgICAgaWYgKHRoaXMuY29udGFjdHMpICh0aGlzLmNvbnRhY3RzLnByZXYgPSBuZXdDb250YWN0KS5uZXh0ID0gdGhpcy5jb250YWN0cztcbiAgICAgIHRoaXMuY29udGFjdHMgPSBuZXdDb250YWN0O1xuICAgICAgdGhpcy5udW1Db250YWN0cysrO1xuXG4gICAgfSxcblxuICAgIHJlbW92ZUNvbnRhY3Q6IGZ1bmN0aW9uIChjb250YWN0KSB7XG5cbiAgICAgIHZhciBwcmV2ID0gY29udGFjdC5wcmV2O1xuICAgICAgdmFyIG5leHQgPSBjb250YWN0Lm5leHQ7XG4gICAgICBpZiAobmV4dCkgbmV4dC5wcmV2ID0gcHJldjtcbiAgICAgIGlmIChwcmV2KSBwcmV2Lm5leHQgPSBuZXh0O1xuICAgICAgaWYgKHRoaXMuY29udGFjdHMgPT0gY29udGFjdCkgdGhpcy5jb250YWN0cyA9IG5leHQ7XG4gICAgICBjb250YWN0LnByZXYgPSBudWxsO1xuICAgICAgY29udGFjdC5uZXh0ID0gbnVsbDtcbiAgICAgIGNvbnRhY3QuZGV0YWNoKCk7XG4gICAgICBjb250YWN0Lm5leHQgPSB0aGlzLnVudXNlZENvbnRhY3RzO1xuICAgICAgdGhpcy51bnVzZWRDb250YWN0cyA9IGNvbnRhY3Q7XG4gICAgICB0aGlzLm51bUNvbnRhY3RzLS07XG5cbiAgICB9LFxuXG4gICAgZ2V0Q29udGFjdDogZnVuY3Rpb24gKGIxLCBiMikge1xuXG4gICAgICBiMSA9IGIxLmNvbnN0cnVjdG9yID09PSBSaWdpZEJvZHkgPyBiMS5uYW1lIDogYjE7XG4gICAgICBiMiA9IGIyLmNvbnN0cnVjdG9yID09PSBSaWdpZEJvZHkgPyBiMi5uYW1lIDogYjI7XG5cbiAgICAgIHZhciBuMSwgbjI7XG4gICAgICB2YXIgY29udGFjdCA9IHRoaXMuY29udGFjdHM7XG4gICAgICB3aGlsZSAoY29udGFjdCAhPT0gbnVsbCkge1xuICAgICAgICBuMSA9IGNvbnRhY3QuYm9keTEubmFtZTtcbiAgICAgICAgbjIgPSBjb250YWN0LmJvZHkyLm5hbWU7XG4gICAgICAgIGlmICgobjEgPT09IGIxICYmIG4yID09PSBiMikgfHwgKG4yID09PSBiMSAmJiBuMSA9PT0gYjIpKSB7IGlmIChjb250YWN0LnRvdWNoaW5nKSByZXR1cm4gY29udGFjdDsgZWxzZSByZXR1cm4gbnVsbDsgfVxuICAgICAgICBlbHNlIGNvbnRhY3QgPSBjb250YWN0Lm5leHQ7XG4gICAgICB9XG4gICAgICByZXR1cm4gbnVsbDtcblxuICAgIH0sXG5cbiAgICBjaGVja0NvbnRhY3Q6IGZ1bmN0aW9uIChuYW1lMSwgbmFtZTIpIHtcblxuICAgICAgdmFyIG4xLCBuMjtcbiAgICAgIHZhciBjb250YWN0ID0gdGhpcy5jb250YWN0cztcbiAgICAgIHdoaWxlIChjb250YWN0ICE9PSBudWxsKSB7XG4gICAgICAgIG4xID0gY29udGFjdC5ib2R5MS5uYW1lIHx8ICcgJztcbiAgICAgICAgbjIgPSBjb250YWN0LmJvZHkyLm5hbWUgfHwgJyAnO1xuICAgICAgICBpZiAoKG4xID09IG5hbWUxICYmIG4yID09IG5hbWUyKSB8fCAobjIgPT0gbmFtZTEgJiYgbjEgPT0gbmFtZTIpKSB7IGlmIChjb250YWN0LnRvdWNoaW5nKSByZXR1cm4gdHJ1ZTsgZWxzZSByZXR1cm4gZmFsc2U7IH1cbiAgICAgICAgZWxzZSBjb250YWN0ID0gY29udGFjdC5uZXh0O1xuICAgICAgfVxuICAgICAgLy9yZXR1cm4gZmFsc2U7XG5cbiAgICB9LFxuXG4gICAgY2FsbFNsZWVwOiBmdW5jdGlvbiAoYm9keSkge1xuXG4gICAgICBpZiAoIWJvZHkuYWxsb3dTbGVlcCkgcmV0dXJuIGZhbHNlO1xuICAgICAgaWYgKGJvZHkubGluZWFyVmVsb2NpdHkubGVuZ3RoU3EoKSA+IDAuMDQpIHJldHVybiBmYWxzZTtcbiAgICAgIGlmIChib2R5LmFuZ3VsYXJWZWxvY2l0eS5sZW5ndGhTcSgpID4gMC4yNSkgcmV0dXJuIGZhbHNlO1xuICAgICAgcmV0dXJuIHRydWU7XG5cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgKiBJIHdpbGwgcHJvY2VlZCBvbmx5IHRpbWUgc3RlcCBzZWNvbmRzIHRpbWUgb2YgV29ybGQuXG4gICAgKi9cbiAgICBzdGVwOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHZhciBzdGF0ID0gdGhpcy5pc1N0YXQ7XG5cbiAgICAgIGlmIChzdGF0KSB0aGlzLnBlcmZvcm1hbmNlLnNldFRpbWUoMCk7XG5cbiAgICAgIHZhciBib2R5ID0gdGhpcy5yaWdpZEJvZGllcztcblxuICAgICAgd2hpbGUgKGJvZHkgIT09IG51bGwpIHtcblxuICAgICAgICBib2R5LmFkZGVkVG9Jc2xhbmQgPSBmYWxzZTtcblxuICAgICAgICBpZiAoYm9keS5zbGVlcGluZykgYm9keS50ZXN0V2FrZVVwKCk7XG5cbiAgICAgICAgYm9keSA9IGJvZHkubmV4dDtcblxuICAgICAgfVxuXG5cblxuICAgICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgIC8vICAgVVBEQVRFIEJST0FEUEhBU0UgQ09OVEFDVFxuICAgICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAgICAgaWYgKHN0YXQpIHRoaXMucGVyZm9ybWFuY2Uuc2V0VGltZSgxKTtcblxuICAgICAgdGhpcy5icm9hZFBoYXNlLmRldGVjdFBhaXJzKCk7XG5cbiAgICAgIHZhciBwYWlycyA9IHRoaXMuYnJvYWRQaGFzZS5wYWlycztcblxuICAgICAgdmFyIGkgPSB0aGlzLmJyb2FkUGhhc2UubnVtUGFpcnM7XG4gICAgICAvL2Rve1xuICAgICAgd2hpbGUgKGktLSkge1xuICAgICAgICAvL2Zvcih2YXIgaT0wLCBsPW51bVBhaXJzOyBpPGw7IGkrKyl7XG4gICAgICAgIHZhciBwYWlyID0gcGFpcnNbaV07XG4gICAgICAgIHZhciBzMTtcbiAgICAgICAgdmFyIHMyO1xuICAgICAgICBpZiAocGFpci5zaGFwZTEuaWQgPCBwYWlyLnNoYXBlMi5pZCkge1xuICAgICAgICAgIHMxID0gcGFpci5zaGFwZTE7XG4gICAgICAgICAgczIgPSBwYWlyLnNoYXBlMjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzMSA9IHBhaXIuc2hhcGUyO1xuICAgICAgICAgIHMyID0gcGFpci5zaGFwZTE7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgbGluaztcbiAgICAgICAgaWYgKHMxLm51bUNvbnRhY3RzIDwgczIubnVtQ29udGFjdHMpIGxpbmsgPSBzMS5jb250YWN0TGluaztcbiAgICAgICAgZWxzZSBsaW5rID0gczIuY29udGFjdExpbms7XG5cbiAgICAgICAgdmFyIGV4aXN0cyA9IGZhbHNlO1xuICAgICAgICB3aGlsZSAobGluaykge1xuICAgICAgICAgIHZhciBjb250YWN0ID0gbGluay5jb250YWN0O1xuICAgICAgICAgIGlmIChjb250YWN0LnNoYXBlMSA9PSBzMSAmJiBjb250YWN0LnNoYXBlMiA9PSBzMikge1xuICAgICAgICAgICAgY29udGFjdC5wZXJzaXN0aW5nID0gdHJ1ZTtcbiAgICAgICAgICAgIGV4aXN0cyA9IHRydWU7Ly8gY29udGFjdCBhbHJlYWR5IGV4aXN0c1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICAgIGxpbmsgPSBsaW5rLm5leHQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFleGlzdHMpIHtcbiAgICAgICAgICB0aGlzLmFkZENvbnRhY3QoczEsIHMyKTtcbiAgICAgICAgfVxuICAgICAgfS8vIHdoaWxlKGktLSA+MCk7XG5cbiAgICAgIGlmIChzdGF0KSB0aGlzLnBlcmZvcm1hbmNlLmNhbGNCcm9hZFBoYXNlKCk7XG5cbiAgICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAvLyAgIFVQREFURSBOQVJST1dQSEFTRSBDT05UQUNUXG4gICAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICAgICAvLyB1cGRhdGUgJiBuYXJyb3cgcGhhc2VcbiAgICAgIHRoaXMubnVtQ29udGFjdFBvaW50cyA9IDA7XG4gICAgICBjb250YWN0ID0gdGhpcy5jb250YWN0cztcbiAgICAgIHdoaWxlIChjb250YWN0ICE9PSBudWxsKSB7XG4gICAgICAgIGlmICghY29udGFjdC5wZXJzaXN0aW5nKSB7XG4gICAgICAgICAgaWYgKGNvbnRhY3Quc2hhcGUxLmFhYmIuaW50ZXJzZWN0VGVzdChjb250YWN0LnNoYXBlMi5hYWJiKSkge1xuICAgICAgICAgICAgLyp2YXIgYWFiYjE9Y29udGFjdC5zaGFwZTEuYWFiYjtcbiAgICAgICAgICAgIHZhciBhYWJiMj1jb250YWN0LnNoYXBlMi5hYWJiO1xuICAgICAgICAgICAgaWYoXG4gICAgICAgICAgICAgIGFhYmIxLm1pblg+YWFiYjIubWF4WCB8fCBhYWJiMS5tYXhYPGFhYmIyLm1pblggfHxcbiAgICAgICAgICAgICAgYWFiYjEubWluWT5hYWJiMi5tYXhZIHx8IGFhYmIxLm1heFk8YWFiYjIubWluWSB8fFxuICAgICAgICAgICAgICBhYWJiMS5taW5aPmFhYmIyLm1heFogfHwgYWFiYjEubWF4WjxhYWJiMi5taW5aXG4gICAgICAgICAgICApeyovXG4gICAgICAgICAgICB2YXIgbmV4dCA9IGNvbnRhY3QubmV4dDtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlQ29udGFjdChjb250YWN0KTtcbiAgICAgICAgICAgIGNvbnRhY3QgPSBuZXh0O1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHZhciBiMSA9IGNvbnRhY3QuYm9keTE7XG4gICAgICAgIHZhciBiMiA9IGNvbnRhY3QuYm9keTI7XG5cbiAgICAgICAgaWYgKGIxLmlzRHluYW1pYyAmJiAhYjEuc2xlZXBpbmcgfHwgYjIuaXNEeW5hbWljICYmICFiMi5zbGVlcGluZykgY29udGFjdC51cGRhdGVNYW5pZm9sZCgpO1xuXG4gICAgICAgIHRoaXMubnVtQ29udGFjdFBvaW50cyArPSBjb250YWN0Lm1hbmlmb2xkLm51bVBvaW50cztcbiAgICAgICAgY29udGFjdC5wZXJzaXN0aW5nID0gZmFsc2U7XG4gICAgICAgIGNvbnRhY3QuY29uc3RyYWludC5hZGRlZFRvSXNsYW5kID0gZmFsc2U7XG4gICAgICAgIGNvbnRhY3QgPSBjb250YWN0Lm5leHQ7XG5cbiAgICAgIH1cblxuICAgICAgaWYgKHN0YXQpIHRoaXMucGVyZm9ybWFuY2UuY2FsY05hcnJvd1BoYXNlKCk7XG5cbiAgICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAvLyAgIFNPTFZFIElTTEFORFNcbiAgICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgICAgIHZhciBpbnZUaW1lU3RlcCA9IDEgLyB0aGlzLnRpbWVTdGVwO1xuICAgICAgdmFyIGpvaW50O1xuICAgICAgdmFyIGNvbnN0cmFpbnQ7XG5cbiAgICAgIGZvciAoam9pbnQgPSB0aGlzLmpvaW50czsgam9pbnQgIT09IG51bGw7IGpvaW50ID0gam9pbnQubmV4dCkge1xuICAgICAgICBqb2ludC5hZGRlZFRvSXNsYW5kID0gZmFsc2U7XG4gICAgICB9XG5cblxuICAgICAgLy8gY2xlYXIgb2xkIGlzbGFuZCBhcnJheVxuICAgICAgdGhpcy5pc2xhbmRSaWdpZEJvZGllcyA9IFtdO1xuICAgICAgdGhpcy5pc2xhbmRDb25zdHJhaW50cyA9IFtdO1xuICAgICAgdGhpcy5pc2xhbmRTdGFjayA9IFtdO1xuXG4gICAgICBpZiAoc3RhdCkgdGhpcy5wZXJmb3JtYW5jZS5zZXRUaW1lKDEpO1xuXG4gICAgICB0aGlzLm51bUlzbGFuZHMgPSAwO1xuXG4gICAgICAvLyBidWlsZCBhbmQgc29sdmUgc2ltdWxhdGlvbiBpc2xhbmRzXG5cbiAgICAgIGZvciAodmFyIGJhc2UgPSB0aGlzLnJpZ2lkQm9kaWVzOyBiYXNlICE9PSBudWxsOyBiYXNlID0gYmFzZS5uZXh0KSB7XG5cbiAgICAgICAgaWYgKGJhc2UuYWRkZWRUb0lzbGFuZCB8fCBiYXNlLmlzU3RhdGljIHx8IGJhc2Uuc2xlZXBpbmcpIGNvbnRpbnVlOy8vIGlnbm9yZVxuXG4gICAgICAgIGlmIChiYXNlLmlzTG9uZWx5KCkpIHsvLyB1cGRhdGUgc2luZ2xlIGJvZHlcbiAgICAgICAgICBpZiAoYmFzZS5pc0R5bmFtaWMpIHtcbiAgICAgICAgICAgIGJhc2UubGluZWFyVmVsb2NpdHkuYWRkU2NhbGVkVmVjdG9yKHRoaXMuZ3Jhdml0eSwgdGhpcy50aW1lU3RlcCk7XG4gICAgICAgICAgICAvKmJhc2UubGluZWFyVmVsb2NpdHkueCs9dGhpcy5ncmF2aXR5LngqdGhpcy50aW1lU3RlcDtcbiAgICAgICAgICAgIGJhc2UubGluZWFyVmVsb2NpdHkueSs9dGhpcy5ncmF2aXR5LnkqdGhpcy50aW1lU3RlcDtcbiAgICAgICAgICAgIGJhc2UubGluZWFyVmVsb2NpdHkueis9dGhpcy5ncmF2aXR5LnoqdGhpcy50aW1lU3RlcDsqL1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAodGhpcy5jYWxsU2xlZXAoYmFzZSkpIHtcbiAgICAgICAgICAgIGJhc2Uuc2xlZXBUaW1lICs9IHRoaXMudGltZVN0ZXA7XG4gICAgICAgICAgICBpZiAoYmFzZS5zbGVlcFRpbWUgPiAwLjUpIGJhc2Uuc2xlZXAoKTtcbiAgICAgICAgICAgIGVsc2UgYmFzZS51cGRhdGVQb3NpdGlvbih0aGlzLnRpbWVTdGVwKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYmFzZS5zbGVlcFRpbWUgPSAwO1xuICAgICAgICAgICAgYmFzZS51cGRhdGVQb3NpdGlvbih0aGlzLnRpbWVTdGVwKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5udW1Jc2xhbmRzKys7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgaXNsYW5kTnVtUmlnaWRCb2RpZXMgPSAwO1xuICAgICAgICB2YXIgaXNsYW5kTnVtQ29uc3RyYWludHMgPSAwO1xuICAgICAgICB2YXIgc3RhY2tDb3VudCA9IDE7XG4gICAgICAgIC8vIGFkZCByaWdpZCBib2R5IHRvIHN0YWNrXG4gICAgICAgIHRoaXMuaXNsYW5kU3RhY2tbMF0gPSBiYXNlO1xuICAgICAgICBiYXNlLmFkZGVkVG9Jc2xhbmQgPSB0cnVlO1xuXG4gICAgICAgIC8vIGJ1aWxkIGFuIGlzbGFuZFxuICAgICAgICBkbyB7XG4gICAgICAgICAgLy8gZ2V0IHJpZ2lkIGJvZHkgZnJvbSBzdGFja1xuICAgICAgICAgIGJvZHkgPSB0aGlzLmlzbGFuZFN0YWNrWy0tc3RhY2tDb3VudF07XG4gICAgICAgICAgdGhpcy5pc2xhbmRTdGFja1tzdGFja0NvdW50XSA9IG51bGw7XG4gICAgICAgICAgYm9keS5zbGVlcGluZyA9IGZhbHNlO1xuICAgICAgICAgIC8vIGFkZCByaWdpZCBib2R5IHRvIHRoZSBpc2xhbmRcbiAgICAgICAgICB0aGlzLmlzbGFuZFJpZ2lkQm9kaWVzW2lzbGFuZE51bVJpZ2lkQm9kaWVzKytdID0gYm9keTtcbiAgICAgICAgICBpZiAoYm9keS5pc1N0YXRpYykgY29udGludWU7XG5cbiAgICAgICAgICAvLyBzZWFyY2ggY29ubmVjdGlvbnNcbiAgICAgICAgICBmb3IgKHZhciBjcyA9IGJvZHkuY29udGFjdExpbms7IGNzICE9PSBudWxsOyBjcyA9IGNzLm5leHQpIHtcbiAgICAgICAgICAgIHZhciBjb250YWN0ID0gY3MuY29udGFjdDtcbiAgICAgICAgICAgIGNvbnN0cmFpbnQgPSBjb250YWN0LmNvbnN0cmFpbnQ7XG4gICAgICAgICAgICBpZiAoY29uc3RyYWludC5hZGRlZFRvSXNsYW5kIHx8ICFjb250YWN0LnRvdWNoaW5nKSBjb250aW51ZTsvLyBpZ25vcmVcblxuICAgICAgICAgICAgLy8gYWRkIGNvbnN0cmFpbnQgdG8gdGhlIGlzbGFuZFxuICAgICAgICAgICAgdGhpcy5pc2xhbmRDb25zdHJhaW50c1tpc2xhbmROdW1Db25zdHJhaW50cysrXSA9IGNvbnN0cmFpbnQ7XG4gICAgICAgICAgICBjb25zdHJhaW50LmFkZGVkVG9Jc2xhbmQgPSB0cnVlO1xuICAgICAgICAgICAgdmFyIG5leHQgPSBjcy5ib2R5O1xuXG4gICAgICAgICAgICBpZiAobmV4dC5hZGRlZFRvSXNsYW5kKSBjb250aW51ZTtcblxuICAgICAgICAgICAgLy8gYWRkIHJpZ2lkIGJvZHkgdG8gc3RhY2tcbiAgICAgICAgICAgIHRoaXMuaXNsYW5kU3RhY2tbc3RhY2tDb3VudCsrXSA9IG5leHQ7XG4gICAgICAgICAgICBuZXh0LmFkZGVkVG9Jc2xhbmQgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBmb3IgKHZhciBqcyA9IGJvZHkuam9pbnRMaW5rOyBqcyAhPT0gbnVsbDsganMgPSBqcy5uZXh0KSB7XG4gICAgICAgICAgICBjb25zdHJhaW50ID0ganMuam9pbnQ7XG5cbiAgICAgICAgICAgIGlmIChjb25zdHJhaW50LmFkZGVkVG9Jc2xhbmQpIGNvbnRpbnVlOy8vIGlnbm9yZVxuXG4gICAgICAgICAgICAvLyBhZGQgY29uc3RyYWludCB0byB0aGUgaXNsYW5kXG4gICAgICAgICAgICB0aGlzLmlzbGFuZENvbnN0cmFpbnRzW2lzbGFuZE51bUNvbnN0cmFpbnRzKytdID0gY29uc3RyYWludDtcbiAgICAgICAgICAgIGNvbnN0cmFpbnQuYWRkZWRUb0lzbGFuZCA9IHRydWU7XG4gICAgICAgICAgICBuZXh0ID0ganMuYm9keTtcbiAgICAgICAgICAgIGlmIChuZXh0LmFkZGVkVG9Jc2xhbmQgfHwgIW5leHQuaXNEeW5hbWljKSBjb250aW51ZTtcblxuICAgICAgICAgICAgLy8gYWRkIHJpZ2lkIGJvZHkgdG8gc3RhY2tcbiAgICAgICAgICAgIHRoaXMuaXNsYW5kU3RhY2tbc3RhY2tDb3VudCsrXSA9IG5leHQ7XG4gICAgICAgICAgICBuZXh0LmFkZGVkVG9Jc2xhbmQgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSB3aGlsZSAoc3RhY2tDb3VudCAhPSAwKTtcblxuICAgICAgICAvLyB1cGRhdGUgdmVsb2NpdGllc1xuICAgICAgICB2YXIgZ1ZlbCA9IG5ldyBWZWMzKCkuYWRkU2NhbGVkVmVjdG9yKHRoaXMuZ3Jhdml0eSwgdGhpcy50aW1lU3RlcCk7XG4gICAgICAgIC8qdmFyIGd4PXRoaXMuZ3Jhdml0eS54KnRoaXMudGltZVN0ZXA7XG4gICAgICAgIHZhciBneT10aGlzLmdyYXZpdHkueSp0aGlzLnRpbWVTdGVwO1xuICAgICAgICB2YXIgZ3o9dGhpcy5ncmF2aXR5LnoqdGhpcy50aW1lU3RlcDsqL1xuICAgICAgICB2YXIgaiA9IGlzbGFuZE51bVJpZ2lkQm9kaWVzO1xuICAgICAgICB3aGlsZSAoai0tKSB7XG4gICAgICAgICAgLy9vcih2YXIgaj0wLCBsPWlzbGFuZE51bVJpZ2lkQm9kaWVzOyBqPGw7IGorKyl7XG4gICAgICAgICAgYm9keSA9IHRoaXMuaXNsYW5kUmlnaWRCb2RpZXNbal07XG4gICAgICAgICAgaWYgKGJvZHkuaXNEeW5hbWljKSB7XG4gICAgICAgICAgICBib2R5LmxpbmVhclZlbG9jaXR5LmFkZEVxdWFsKGdWZWwpO1xuICAgICAgICAgICAgLypib2R5LmxpbmVhclZlbG9jaXR5LngrPWd4O1xuICAgICAgICAgICAgYm9keS5saW5lYXJWZWxvY2l0eS55Kz1neTtcbiAgICAgICAgICAgIGJvZHkubGluZWFyVmVsb2NpdHkueis9Z3o7Ki9cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyByYW5kb21pemluZyBvcmRlclxuICAgICAgICBpZiAodGhpcy5lbmFibGVSYW5kb21pemVyKSB7XG4gICAgICAgICAgLy9mb3IodmFyIGo9MSwgbD1pc2xhbmROdW1Db25zdHJhaW50czsgajxsOyBqKyspe1xuICAgICAgICAgIGogPSBpc2xhbmROdW1Db25zdHJhaW50cztcbiAgICAgICAgICB3aGlsZSAoai0tKSB7XG4gICAgICAgICAgICBpZiAoaiAhPT0gMCkge1xuICAgICAgICAgICAgICB2YXIgc3dhcCA9ICh0aGlzLnJhbmRYID0gKHRoaXMucmFuZFggKiB0aGlzLnJhbmRBICsgdGhpcy5yYW5kQiAmIDB4N2ZmZmZmZmYpKSAvIDIxNDc0ODM2NDguMCAqIGogfCAwO1xuICAgICAgICAgICAgICBjb25zdHJhaW50ID0gdGhpcy5pc2xhbmRDb25zdHJhaW50c1tqXTtcbiAgICAgICAgICAgICAgdGhpcy5pc2xhbmRDb25zdHJhaW50c1tqXSA9IHRoaXMuaXNsYW5kQ29uc3RyYWludHNbc3dhcF07XG4gICAgICAgICAgICAgIHRoaXMuaXNsYW5kQ29uc3RyYWludHNbc3dhcF0gPSBjb25zdHJhaW50O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHNvbHZlIGNvbnRyYWludHNcblxuICAgICAgICBqID0gaXNsYW5kTnVtQ29uc3RyYWludHM7XG4gICAgICAgIHdoaWxlIChqLS0pIHtcbiAgICAgICAgICAvL2ZvcihqPTAsIGw9aXNsYW5kTnVtQ29uc3RyYWludHM7IGo8bDsgaisrKXtcbiAgICAgICAgICB0aGlzLmlzbGFuZENvbnN0cmFpbnRzW2pdLnByZVNvbHZlKHRoaXMudGltZVN0ZXAsIGludlRpbWVTdGVwKTsvLyBwcmUtc29sdmVcbiAgICAgICAgfVxuICAgICAgICB2YXIgayA9IHRoaXMubnVtSXRlcmF0aW9ucztcbiAgICAgICAgd2hpbGUgKGstLSkge1xuICAgICAgICAgIC8vZm9yKHZhciBrPTAsIGw9dGhpcy5udW1JdGVyYXRpb25zOyBrPGw7IGsrKyl7XG4gICAgICAgICAgaiA9IGlzbGFuZE51bUNvbnN0cmFpbnRzO1xuICAgICAgICAgIHdoaWxlIChqLS0pIHtcbiAgICAgICAgICAgIC8vZm9yKGo9MCwgbT1pc2xhbmROdW1Db25zdHJhaW50czsgajxtOyBqKyspe1xuICAgICAgICAgICAgdGhpcy5pc2xhbmRDb25zdHJhaW50c1tqXS5zb2x2ZSgpOy8vIG1haW4tc29sdmVcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaiA9IGlzbGFuZE51bUNvbnN0cmFpbnRzO1xuICAgICAgICB3aGlsZSAoai0tKSB7XG4gICAgICAgICAgLy9mb3Ioaj0wLCBsPWlzbGFuZE51bUNvbnN0cmFpbnRzOyBqPGw7IGorKyl7XG4gICAgICAgICAgdGhpcy5pc2xhbmRDb25zdHJhaW50c1tqXS5wb3N0U29sdmUoKTsvLyBwb3N0LXNvbHZlXG4gICAgICAgICAgdGhpcy5pc2xhbmRDb25zdHJhaW50c1tqXSA9IG51bGw7Ly8gZ2NcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHNsZWVwaW5nIGNoZWNrXG5cbiAgICAgICAgdmFyIHNsZWVwVGltZSA9IDEwO1xuICAgICAgICBqID0gaXNsYW5kTnVtUmlnaWRCb2RpZXM7XG4gICAgICAgIHdoaWxlIChqLS0pIHtcbiAgICAgICAgICAvL2ZvcihqPTAsIGw9aXNsYW5kTnVtUmlnaWRCb2RpZXM7ajxsO2orKyl7XG4gICAgICAgICAgYm9keSA9IHRoaXMuaXNsYW5kUmlnaWRCb2RpZXNbal07XG4gICAgICAgICAgaWYgKHRoaXMuY2FsbFNsZWVwKGJvZHkpKSB7XG4gICAgICAgICAgICBib2R5LnNsZWVwVGltZSArPSB0aGlzLnRpbWVTdGVwO1xuICAgICAgICAgICAgaWYgKGJvZHkuc2xlZXBUaW1lIDwgc2xlZXBUaW1lKSBzbGVlcFRpbWUgPSBib2R5LnNsZWVwVGltZTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYm9keS5zbGVlcFRpbWUgPSAwO1xuICAgICAgICAgICAgc2xlZXBUaW1lID0gMDtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoc2xlZXBUaW1lID4gMC41KSB7XG4gICAgICAgICAgLy8gc2xlZXAgdGhlIGlzbGFuZFxuICAgICAgICAgIGogPSBpc2xhbmROdW1SaWdpZEJvZGllcztcbiAgICAgICAgICB3aGlsZSAoai0tKSB7XG4gICAgICAgICAgICAvL2ZvcihqPTAsIGw9aXNsYW5kTnVtUmlnaWRCb2RpZXM7ajxsO2orKyl7XG4gICAgICAgICAgICB0aGlzLmlzbGFuZFJpZ2lkQm9kaWVzW2pdLnNsZWVwKCk7XG4gICAgICAgICAgICB0aGlzLmlzbGFuZFJpZ2lkQm9kaWVzW2pdID0gbnVsbDsvLyBnY1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyB1cGRhdGUgcG9zaXRpb25zXG4gICAgICAgICAgaiA9IGlzbGFuZE51bVJpZ2lkQm9kaWVzO1xuICAgICAgICAgIHdoaWxlIChqLS0pIHtcbiAgICAgICAgICAgIC8vZm9yKGo9MCwgbD1pc2xhbmROdW1SaWdpZEJvZGllcztqPGw7aisrKXtcbiAgICAgICAgICAgIHRoaXMuaXNsYW5kUmlnaWRCb2RpZXNbal0udXBkYXRlUG9zaXRpb24odGhpcy50aW1lU3RlcCk7XG4gICAgICAgICAgICB0aGlzLmlzbGFuZFJpZ2lkQm9kaWVzW2pdID0gbnVsbDsvLyBnY1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLm51bUlzbGFuZHMrKztcbiAgICAgIH1cblxuICAgICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgIC8vICAgRU5EIFNJTVVMQVRJT05cbiAgICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgICAgIGlmIChzdGF0KSB0aGlzLnBlcmZvcm1hbmNlLmNhbGNFbmQoKTtcblxuICAgICAgaWYgKHRoaXMucG9zdExvb3AgIT09IG51bGwpIHRoaXMucG9zdExvb3AoKTtcblxuICAgIH0sXG5cbiAgICAvLyByZW1vdmUgc29tZXRpbmcgdG8gd29ybGRcblxuICAgIHJlbW92ZTogZnVuY3Rpb24gKG9iaikge1xuXG4gICAgfSxcblxuICAgIC8vIGFkZCBzb21ldGluZyB0byB3b3JsZFxuXG4gICAgYWRkOiBmdW5jdGlvbiAobykge1xuXG4gICAgICBvID0gbyB8fCB7fTtcblxuICAgICAgdmFyIHR5cGUgPSBvLnR5cGUgfHwgXCJib3hcIjtcbiAgICAgIGlmICh0eXBlLmNvbnN0cnVjdG9yID09PSBTdHJpbmcpIHR5cGUgPSBbdHlwZV07XG4gICAgICB2YXIgaXNKb2ludCA9IHR5cGVbMF0uc3Vic3RyaW5nKDAsIDUpID09PSAnam9pbnQnID8gdHJ1ZSA6IGZhbHNlO1xuXG4gICAgICBpZiAoaXNKb2ludCkgcmV0dXJuIHRoaXMuaW5pdEpvaW50KHR5cGVbMF0sIG8pO1xuICAgICAgZWxzZSByZXR1cm4gdGhpcy5pbml0Qm9keSh0eXBlLCBvKTtcblxuICAgIH0sXG5cbiAgICBpbml0Qm9keTogZnVuY3Rpb24gKHR5cGUsIG8pIHtcblxuICAgICAgdmFyIGludlNjYWxlID0gdGhpcy5pbnZTY2FsZTtcblxuICAgICAgLy8gYm9keSBkeW5hbWljIG9yIHN0YXRpY1xuICAgICAgdmFyIG1vdmUgPSBvLm1vdmUgfHwgZmFsc2U7XG4gICAgICB2YXIga2luZW1hdGljID0gby5raW5lbWF0aWMgfHwgZmFsc2U7XG5cbiAgICAgIC8vIFBPU0lUSU9OXG5cbiAgICAgIC8vIGJvZHkgcG9zaXRpb25cbiAgICAgIHZhciBwID0gby5wb3MgfHwgWzAsIDAsIDBdO1xuICAgICAgcCA9IHAubWFwKGZ1bmN0aW9uICh4KSB7IHJldHVybiB4ICogaW52U2NhbGU7IH0pO1xuXG4gICAgICAvLyBzaGFwZSBwb3NpdGlvblxuICAgICAgdmFyIHAyID0gby5wb3NTaGFwZSB8fCBbMCwgMCwgMF07XG4gICAgICBwMiA9IHAyLm1hcChmdW5jdGlvbiAoeCkgeyByZXR1cm4geCAqIGludlNjYWxlOyB9KTtcblxuICAgICAgLy8gUk9UQVRJT05cblxuICAgICAgLy8gYm9keSByb3RhdGlvbiBpbiBkZWdyZWVcbiAgICAgIHZhciByID0gby5yb3QgfHwgWzAsIDAsIDBdO1xuICAgICAgciA9IHIubWFwKGZ1bmN0aW9uICh4KSB7IHJldHVybiB4ICogX01hdGguZGVndG9yYWQ7IH0pO1xuXG4gICAgICAvLyBzaGFwZSByb3RhdGlvbiBpbiBkZWdyZWVcbiAgICAgIHZhciByMiA9IG8ucm90U2hhcGUgfHwgWzAsIDAsIDBdO1xuICAgICAgcjIgPSByLm1hcChmdW5jdGlvbiAoeCkgeyByZXR1cm4geCAqIF9NYXRoLmRlZ3RvcmFkOyB9KTtcblxuICAgICAgLy8gU0laRVxuXG4gICAgICAvLyBzaGFwZSBzaXplXG4gICAgICB2YXIgcyA9IG8uc2l6ZSA9PT0gdW5kZWZpbmVkID8gWzEsIDEsIDFdIDogby5zaXplO1xuICAgICAgaWYgKHMubGVuZ3RoID09PSAxKSB7IHNbMV0gPSBzWzBdOyB9XG4gICAgICBpZiAocy5sZW5ndGggPT09IDIpIHsgc1syXSA9IHNbMF07IH1cbiAgICAgIHMgPSBzLm1hcChmdW5jdGlvbiAoeCkgeyByZXR1cm4geCAqIGludlNjYWxlOyB9KTtcblxuXG5cbiAgICAgIC8vIGJvZHkgcGh5c2ljcyBzZXR0aW5nc1xuICAgICAgdmFyIHNjID0gbmV3IFNoYXBlQ29uZmlnKCk7XG4gICAgICAvLyBUaGUgZGVuc2l0eSBvZiB0aGUgc2hhcGUuXG4gICAgICBpZiAoby5kZW5zaXR5ICE9PSB1bmRlZmluZWQpIHNjLmRlbnNpdHkgPSBvLmRlbnNpdHk7XG4gICAgICAvLyBUaGUgY29lZmZpY2llbnQgb2YgZnJpY3Rpb24gb2YgdGhlIHNoYXBlLlxuICAgICAgaWYgKG8uZnJpY3Rpb24gIT09IHVuZGVmaW5lZCkgc2MuZnJpY3Rpb24gPSBvLmZyaWN0aW9uO1xuICAgICAgLy8gVGhlIGNvZWZmaWNpZW50IG9mIHJlc3RpdHV0aW9uIG9mIHRoZSBzaGFwZS5cbiAgICAgIGlmIChvLnJlc3RpdHV0aW9uICE9PSB1bmRlZmluZWQpIHNjLnJlc3RpdHV0aW9uID0gby5yZXN0aXR1dGlvbjtcbiAgICAgIC8vIFRoZSBiaXRzIG9mIHRoZSBjb2xsaXNpb24gZ3JvdXBzIHRvIHdoaWNoIHRoZSBzaGFwZSBiZWxvbmdzLlxuICAgICAgaWYgKG8uYmVsb25nc1RvICE9PSB1bmRlZmluZWQpIHNjLmJlbG9uZ3NUbyA9IG8uYmVsb25nc1RvO1xuICAgICAgLy8gVGhlIGJpdHMgb2YgdGhlIGNvbGxpc2lvbiBncm91cHMgd2l0aCB3aGljaCB0aGUgc2hhcGUgY29sbGlkZXMuXG4gICAgICBpZiAoby5jb2xsaWRlc1dpdGggIT09IHVuZGVmaW5lZCkgc2MuY29sbGlkZXNXaXRoID0gby5jb2xsaWRlc1dpdGg7XG5cbiAgICAgIGlmIChvLmNvbmZpZyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGlmIChvLmNvbmZpZ1swXSAhPT0gdW5kZWZpbmVkKSBzYy5kZW5zaXR5ID0gby5jb25maWdbMF07XG4gICAgICAgIGlmIChvLmNvbmZpZ1sxXSAhPT0gdW5kZWZpbmVkKSBzYy5mcmljdGlvbiA9IG8uY29uZmlnWzFdO1xuICAgICAgICBpZiAoby5jb25maWdbMl0gIT09IHVuZGVmaW5lZCkgc2MucmVzdGl0dXRpb24gPSBvLmNvbmZpZ1syXTtcbiAgICAgICAgaWYgKG8uY29uZmlnWzNdICE9PSB1bmRlZmluZWQpIHNjLmJlbG9uZ3NUbyA9IG8uY29uZmlnWzNdO1xuICAgICAgICBpZiAoby5jb25maWdbNF0gIT09IHVuZGVmaW5lZCkgc2MuY29sbGlkZXNXaXRoID0gby5jb25maWdbNF07XG4gICAgICB9XG5cblxuICAgICAgLyogaWYoby5tYXNzUG9zKXtcbiAgICAgICAgICAgby5tYXNzUG9zID0gby5tYXNzUG9zLm1hcChmdW5jdGlvbih4KSB7IHJldHVybiB4ICogaW52U2NhbGU7IH0pO1xuICAgICAgICAgICBzYy5yZWxhdGl2ZVBvc2l0aW9uLnNldCggby5tYXNzUG9zWzBdLCBvLm1hc3NQb3NbMV0sIG8ubWFzc1Bvc1syXSApO1xuICAgICAgIH1cbiAgICAgICBpZihvLm1hc3NSb3Qpe1xuICAgICAgICAgICBvLm1hc3NSb3QgPSBvLm1hc3NSb3QubWFwKGZ1bmN0aW9uKHgpIHsgcmV0dXJuIHggKiBfTWF0aC5kZWd0b3JhZDsgfSk7XG4gICAgICAgICAgIHZhciBxID0gbmV3IFF1YXQoKS5zZXRGcm9tRXVsZXIoIG8ubWFzc1JvdFswXSwgby5tYXNzUm90WzFdLCBvLm1hc3NSb3RbMl0gKTtcbiAgICAgICAgICAgc2MucmVsYXRpdmVSb3RhdGlvbiA9IG5ldyBNYXQzMygpLnNldFF1YXQoIHEgKTsvL19NYXRoLkV1bGVyVG9NYXRyaXgoIG8ubWFzc1JvdFswXSwgby5tYXNzUm90WzFdLCBvLm1hc3NSb3RbMl0gKTtcbiAgICAgICB9Ki9cblxuICAgICAgdmFyIHBvc2l0aW9uID0gbmV3IFZlYzMocFswXSwgcFsxXSwgcFsyXSk7XG4gICAgICB2YXIgcm90YXRpb24gPSBuZXcgUXVhdCgpLnNldEZyb21FdWxlcihyWzBdLCByWzFdLCByWzJdKTtcblxuICAgICAgLy8gcmlnaWRib2R5XG4gICAgICB2YXIgYm9keSA9IG5ldyBSaWdpZEJvZHkocG9zaXRpb24sIHJvdGF0aW9uKTtcbiAgICAgIC8vdmFyIGJvZHkgPSBuZXcgUmlnaWRCb2R5KCBwWzBdLCBwWzFdLCBwWzJdLCByWzBdLCByWzFdLCByWzJdLCByWzNdLCB0aGlzLnNjYWxlLCB0aGlzLmludlNjYWxlICk7XG5cbiAgICAgIC8vIFNIQVBFU1xuXG4gICAgICB2YXIgc2hhcGUsIG47XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdHlwZS5sZW5ndGg7IGkrKykge1xuXG4gICAgICAgIG4gPSBpICogMztcblxuICAgICAgICBpZiAocDJbbl0gIT09IHVuZGVmaW5lZCkgc2MucmVsYXRpdmVQb3NpdGlvbi5zZXQocDJbbl0sIHAyW24gKyAxXSwgcDJbbiArIDJdKTtcbiAgICAgICAgaWYgKHIyW25dICE9PSB1bmRlZmluZWQpIHNjLnJlbGF0aXZlUm90YXRpb24uc2V0UXVhdChuZXcgUXVhdCgpLnNldEZyb21FdWxlcihyMltuXSwgcjJbbiArIDFdLCByMltuICsgMl0pKTtcblxuICAgICAgICBzd2l0Y2ggKHR5cGVbaV0pIHtcbiAgICAgICAgICBjYXNlIFwic3BoZXJlXCI6IHNoYXBlID0gbmV3IFNwaGVyZShzYywgc1tuXSk7IGJyZWFrO1xuICAgICAgICAgIGNhc2UgXCJjeWxpbmRlclwiOiBzaGFwZSA9IG5ldyBDeWxpbmRlcihzYywgc1tuXSwgc1tuICsgMV0pOyBicmVhaztcbiAgICAgICAgICBjYXNlIFwiYm94XCI6IHNoYXBlID0gbmV3IEJveChzYywgc1tuXSwgc1tuICsgMV0sIHNbbiArIDJdKTsgYnJlYWs7XG4gICAgICAgICAgY2FzZSBcInBsYW5lXCI6IHNoYXBlID0gbmV3IFBsYW5lKHNjKTsgYnJlYWtcbiAgICAgICAgfVxuXG4gICAgICAgIGJvZHkuYWRkU2hhcGUoc2hhcGUpO1xuXG4gICAgICB9XG5cbiAgICAgIC8vIGJvZHkgY2FuIHNsZWVwIG9yIG5vdFxuICAgICAgaWYgKG8ubmV2ZXJTbGVlcCB8fCBraW5lbWF0aWMpIGJvZHkuYWxsb3dTbGVlcCA9IGZhbHNlO1xuICAgICAgZWxzZSBib2R5LmFsbG93U2xlZXAgPSB0cnVlO1xuXG4gICAgICBib2R5LmlzS2luZW1hdGljID0ga2luZW1hdGljO1xuXG4gICAgICAvLyBib2R5IHN0YXRpYyBvciBkeW5hbWljXG4gICAgICBpZiAobW92ZSkge1xuXG4gICAgICAgIGlmIChvLm1hc3NQb3MgfHwgby5tYXNzUm90KSBib2R5LnNldHVwTWFzcyhCT0RZX0RZTkFNSUMsIGZhbHNlKTtcbiAgICAgICAgZWxzZSBib2R5LnNldHVwTWFzcyhCT0RZX0RZTkFNSUMsIHRydWUpO1xuXG4gICAgICAgIC8vIGJvZHkgY2FuIHNsZWVwIG9yIG5vdFxuICAgICAgICAvL2lmKCBvLm5ldmVyU2xlZXAgKSBib2R5LmFsbG93U2xlZXAgPSBmYWxzZTtcbiAgICAgICAgLy9lbHNlIGJvZHkuYWxsb3dTbGVlcCA9IHRydWU7XG5cbiAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgYm9keS5zZXR1cE1hc3MoQk9EWV9TVEFUSUMpO1xuXG4gICAgICB9XG5cbiAgICAgIGlmIChvLm5hbWUgIT09IHVuZGVmaW5lZCkgYm9keS5uYW1lID0gby5uYW1lO1xuICAgICAgLy9lbHNlIGlmKCBtb3ZlICkgYm9keS5uYW1lID0gdGhpcy5udW1SaWdpZEJvZGllcztcblxuICAgICAgLy8gZmluYWx5IGFkZCB0byBwaHlzaWNzIHdvcmxkXG4gICAgICB0aGlzLmFkZFJpZ2lkQm9keShib2R5KTtcblxuICAgICAgLy8gZm9yY2Ugc2xlZXAgb24gbm90XG4gICAgICBpZiAobW92ZSkge1xuICAgICAgICBpZiAoby5zbGVlcCkgYm9keS5zbGVlcCgpO1xuICAgICAgICBlbHNlIGJvZHkuYXdha2UoKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGJvZHk7XG5cblxuICAgIH0sXG5cbiAgICBpbml0Sm9pbnQ6IGZ1bmN0aW9uICh0eXBlLCBvKSB7XG5cbiAgICAgIC8vdmFyIHR5cGUgPSB0eXBlO1xuICAgICAgdmFyIGludlNjYWxlID0gdGhpcy5pbnZTY2FsZTtcblxuICAgICAgdmFyIGF4ZTEgPSBvLmF4ZTEgfHwgWzEsIDAsIDBdO1xuICAgICAgdmFyIGF4ZTIgPSBvLmF4ZTIgfHwgWzEsIDAsIDBdO1xuICAgICAgdmFyIHBvczEgPSBvLnBvczEgfHwgWzAsIDAsIDBdO1xuICAgICAgdmFyIHBvczIgPSBvLnBvczIgfHwgWzAsIDAsIDBdO1xuXG4gICAgICBwb3MxID0gcG9zMS5tYXAoZnVuY3Rpb24gKHgpIHsgcmV0dXJuIHggKiBpbnZTY2FsZTsgfSk7XG4gICAgICBwb3MyID0gcG9zMi5tYXAoZnVuY3Rpb24gKHgpIHsgcmV0dXJuIHggKiBpbnZTY2FsZTsgfSk7XG5cbiAgICAgIHZhciBtaW4sIG1heDtcbiAgICAgIGlmICh0eXBlID09PSBcImpvaW50RGlzdGFuY2VcIikge1xuICAgICAgICBtaW4gPSBvLm1pbiB8fCAwO1xuICAgICAgICBtYXggPSBvLm1heCB8fCAxMDtcbiAgICAgICAgbWluID0gbWluICogaW52U2NhbGU7XG4gICAgICAgIG1heCA9IG1heCAqIGludlNjYWxlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbWluID0gby5taW4gfHwgNTcuMjk1Nzg7XG4gICAgICAgIG1heCA9IG8ubWF4IHx8IDA7XG4gICAgICAgIG1pbiA9IG1pbiAqIF9NYXRoLmRlZ3RvcmFkO1xuICAgICAgICBtYXggPSBtYXggKiBfTWF0aC5kZWd0b3JhZDtcbiAgICAgIH1cblxuICAgICAgdmFyIGxpbWl0ID0gby5saW1pdCB8fCBudWxsO1xuICAgICAgdmFyIHNwcmluZyA9IG8uc3ByaW5nIHx8IG51bGw7XG4gICAgICB2YXIgbW90b3IgPSBvLm1vdG9yIHx8IG51bGw7XG5cbiAgICAgIC8vIGpvaW50IHNldHRpbmdcbiAgICAgIHZhciBqYyA9IG5ldyBKb2ludENvbmZpZygpO1xuICAgICAgamMuc2NhbGUgPSB0aGlzLnNjYWxlO1xuICAgICAgamMuaW52U2NhbGUgPSB0aGlzLmludlNjYWxlO1xuICAgICAgamMuYWxsb3dDb2xsaXNpb24gPSBvLmNvbGxpc2lvbiB8fCBmYWxzZTtcbiAgICAgIGpjLmxvY2FsQXhpczEuc2V0KGF4ZTFbMF0sIGF4ZTFbMV0sIGF4ZTFbMl0pO1xuICAgICAgamMubG9jYWxBeGlzMi5zZXQoYXhlMlswXSwgYXhlMlsxXSwgYXhlMlsyXSk7XG4gICAgICBqYy5sb2NhbEFuY2hvclBvaW50MS5zZXQocG9zMVswXSwgcG9zMVsxXSwgcG9zMVsyXSk7XG4gICAgICBqYy5sb2NhbEFuY2hvclBvaW50Mi5zZXQocG9zMlswXSwgcG9zMlsxXSwgcG9zMlsyXSk7XG5cbiAgICAgIHZhciBiMSA9IG51bGw7XG4gICAgICB2YXIgYjIgPSBudWxsO1xuXG4gICAgICBpZiAoby5ib2R5MSA9PT0gdW5kZWZpbmVkIHx8IG8uYm9keTIgPT09IHVuZGVmaW5lZCkgcmV0dXJuIHByaW50RXJyb3IoJ1dvcmxkJywgXCJDYW4ndCBhZGQgam9pbnQgaWYgYXR0YWNoIHJpZ2lkYm9keXMgbm90IGRlZmluZSAhXCIpO1xuXG4gICAgICBpZiAoby5ib2R5MS5jb25zdHJ1Y3RvciA9PT0gU3RyaW5nKSB7IGIxID0gdGhpcy5nZXRCeU5hbWUoby5ib2R5MSk7IH1cbiAgICAgIGVsc2UgaWYgKG8uYm9keTEuY29uc3RydWN0b3IgPT09IE51bWJlcikgeyBiMSA9IHRoaXMuZ2V0QnlOYW1lKG8uYm9keTEpOyB9XG4gICAgICBlbHNlIGlmIChvLmJvZHkxLmNvbnN0cnVjdG9yID09PSBSaWdpZEJvZHkpIHsgYjEgPSBvLmJvZHkxOyB9XG5cbiAgICAgIGlmIChvLmJvZHkyLmNvbnN0cnVjdG9yID09PSBTdHJpbmcpIHsgYjIgPSB0aGlzLmdldEJ5TmFtZShvLmJvZHkyKTsgfVxuICAgICAgZWxzZSBpZiAoby5ib2R5Mi5jb25zdHJ1Y3RvciA9PT0gTnVtYmVyKSB7IGIyID0gdGhpcy5nZXRCeU5hbWUoby5ib2R5Mik7IH1cbiAgICAgIGVsc2UgaWYgKG8uYm9keTIuY29uc3RydWN0b3IgPT09IFJpZ2lkQm9keSkgeyBiMiA9IG8uYm9keTI7IH1cblxuICAgICAgaWYgKGIxID09PSBudWxsIHx8IGIyID09PSBudWxsKSByZXR1cm4gcHJpbnRFcnJvcignV29ybGQnLCBcIkNhbid0IGFkZCBqb2ludCBhdHRhY2ggcmlnaWRib2R5cyBub3QgZmluZCAhXCIpO1xuXG4gICAgICBqYy5ib2R5MSA9IGIxO1xuICAgICAgamMuYm9keTIgPSBiMjtcblxuICAgICAgdmFyIGpvaW50O1xuICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgIGNhc2UgXCJqb2ludERpc3RhbmNlXCI6IGpvaW50ID0gbmV3IERpc3RhbmNlSm9pbnQoamMsIG1pbiwgbWF4KTtcbiAgICAgICAgICBpZiAoc3ByaW5nICE9PSBudWxsKSBqb2ludC5saW1pdE1vdG9yLnNldFNwcmluZyhzcHJpbmdbMF0sIHNwcmluZ1sxXSk7XG4gICAgICAgICAgaWYgKG1vdG9yICE9PSBudWxsKSBqb2ludC5saW1pdE1vdG9yLnNldE1vdG9yKG1vdG9yWzBdLCBtb3RvclsxXSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJqb2ludEhpbmdlXCI6IGNhc2UgXCJqb2ludFwiOiBqb2ludCA9IG5ldyBIaW5nZUpvaW50KGpjLCBtaW4sIG1heCk7XG4gICAgICAgICAgaWYgKHNwcmluZyAhPT0gbnVsbCkgam9pbnQubGltaXRNb3Rvci5zZXRTcHJpbmcoc3ByaW5nWzBdLCBzcHJpbmdbMV0pOy8vIHNvZnRlbiB0aGUgam9pbnQgZXg6IDEwMCwgMC4yXG4gICAgICAgICAgaWYgKG1vdG9yICE9PSBudWxsKSBqb2ludC5saW1pdE1vdG9yLnNldE1vdG9yKG1vdG9yWzBdLCBtb3RvclsxXSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJqb2ludFByaXNtZVwiOiBqb2ludCA9IG5ldyBQcmlzbWF0aWNKb2ludChqYywgbWluLCBtYXgpOyBicmVhaztcbiAgICAgICAgY2FzZSBcImpvaW50U2xpZGVcIjogam9pbnQgPSBuZXcgU2xpZGVySm9pbnQoamMsIG1pbiwgbWF4KTsgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJqb2ludEJhbGxcIjogam9pbnQgPSBuZXcgQmFsbEFuZFNvY2tldEpvaW50KGpjKTsgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJqb2ludFdoZWVsXCI6IGpvaW50ID0gbmV3IFdoZWVsSm9pbnQoamMpO1xuICAgICAgICAgIGlmIChsaW1pdCAhPT0gbnVsbCkgam9pbnQucm90YXRpb25hbExpbWl0TW90b3IxLnNldExpbWl0KGxpbWl0WzBdLCBsaW1pdFsxXSk7XG4gICAgICAgICAgaWYgKHNwcmluZyAhPT0gbnVsbCkgam9pbnQucm90YXRpb25hbExpbWl0TW90b3IxLnNldFNwcmluZyhzcHJpbmdbMF0sIHNwcmluZ1sxXSk7XG4gICAgICAgICAgaWYgKG1vdG9yICE9PSBudWxsKSBqb2ludC5yb3RhdGlvbmFsTGltaXRNb3RvcjEuc2V0TW90b3IobW90b3JbMF0sIG1vdG9yWzFdKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgam9pbnQubmFtZSA9IG8ubmFtZSB8fCAnJztcbiAgICAgIC8vIGZpbmFseSBhZGQgdG8gcGh5c2ljcyB3b3JsZFxuICAgICAgdGhpcy5hZGRKb2ludChqb2ludCk7XG5cbiAgICAgIHJldHVybiBqb2ludDtcblxuICAgIH0sXG5cblxuICB9KTtcblxuICAvLyB0ZXN0IHZlcnNpb25cblxuICAvL2V4cG9ydCB7IFJpZ2lkQm9keSB9IGZyb20gJy4vY29yZS9SaWdpZEJvZHlfWC5qcyc7XG4gIC8vZXhwb3J0IHsgV29ybGQgfSBmcm9tICcuL2NvcmUvV29ybGRfWC5qcyc7XG5cbiAgZXhwb3J0cy5NYXRoID0gX01hdGg7XG4gIGV4cG9ydHMuVmVjMyA9IFZlYzM7XG4gIGV4cG9ydHMuUXVhdCA9IFF1YXQ7XG4gIGV4cG9ydHMuTWF0MzMgPSBNYXQzMztcbiAgZXhwb3J0cy5TaGFwZSA9IFNoYXBlO1xuICBleHBvcnRzLkJveCA9IEJveDtcbiAgZXhwb3J0cy5TcGhlcmUgPSBTcGhlcmU7XG4gIGV4cG9ydHMuQ3lsaW5kZXIgPSBDeWxpbmRlcjtcbiAgZXhwb3J0cy5QbGFuZSA9IFBsYW5lO1xuICBleHBvcnRzLlBhcnRpY2xlID0gUGFydGljbGU7XG4gIGV4cG9ydHMuU2hhcGVDb25maWcgPSBTaGFwZUNvbmZpZztcbiAgZXhwb3J0cy5MaW1pdE1vdG9yID0gTGltaXRNb3RvcjtcbiAgZXhwb3J0cy5IaW5nZUpvaW50ID0gSGluZ2VKb2ludDtcbiAgZXhwb3J0cy5CYWxsQW5kU29ja2V0Sm9pbnQgPSBCYWxsQW5kU29ja2V0Sm9pbnQ7XG4gIGV4cG9ydHMuRGlzdGFuY2VKb2ludCA9IERpc3RhbmNlSm9pbnQ7XG4gIGV4cG9ydHMuUHJpc21hdGljSm9pbnQgPSBQcmlzbWF0aWNKb2ludDtcbiAgZXhwb3J0cy5TbGlkZXJKb2ludCA9IFNsaWRlckpvaW50O1xuICBleHBvcnRzLldoZWVsSm9pbnQgPSBXaGVlbEpvaW50O1xuICBleHBvcnRzLkpvaW50Q29uZmlnID0gSm9pbnRDb25maWc7XG4gIGV4cG9ydHMuUmlnaWRCb2R5ID0gUmlnaWRCb2R5O1xuICBleHBvcnRzLldvcmxkID0gV29ybGQ7XG4gIGV4cG9ydHMuUkVWSVNJT04gPSBSRVZJU0lPTjtcbiAgZXhwb3J0cy5CUl9OVUxMID0gQlJfTlVMTDtcbiAgZXhwb3J0cy5CUl9CUlVURV9GT1JDRSA9IEJSX0JSVVRFX0ZPUkNFO1xuICBleHBvcnRzLkJSX1NXRUVQX0FORF9QUlVORSA9IEJSX1NXRUVQX0FORF9QUlVORTtcbiAgZXhwb3J0cy5CUl9CT1VORElOR19WT0xVTUVfVFJFRSA9IEJSX0JPVU5ESU5HX1ZPTFVNRV9UUkVFO1xuICBleHBvcnRzLkJPRFlfTlVMTCA9IEJPRFlfTlVMTDtcbiAgZXhwb3J0cy5CT0RZX0RZTkFNSUMgPSBCT0RZX0RZTkFNSUM7XG4gIGV4cG9ydHMuQk9EWV9TVEFUSUMgPSBCT0RZX1NUQVRJQztcbiAgZXhwb3J0cy5CT0RZX0tJTkVNQVRJQyA9IEJPRFlfS0lORU1BVElDO1xuICBleHBvcnRzLkJPRFlfR0hPU1QgPSBCT0RZX0dIT1NUO1xuICBleHBvcnRzLlNIQVBFX05VTEwgPSBTSEFQRV9OVUxMO1xuICBleHBvcnRzLlNIQVBFX1NQSEVSRSA9IFNIQVBFX1NQSEVSRTtcbiAgZXhwb3J0cy5TSEFQRV9CT1ggPSBTSEFQRV9CT1g7XG4gIGV4cG9ydHMuU0hBUEVfQ1lMSU5ERVIgPSBTSEFQRV9DWUxJTkRFUjtcbiAgZXhwb3J0cy5TSEFQRV9QTEFORSA9IFNIQVBFX1BMQU5FO1xuICBleHBvcnRzLlNIQVBFX1BBUlRJQ0xFID0gU0hBUEVfUEFSVElDTEU7XG4gIGV4cG9ydHMuU0hBUEVfVEVUUkEgPSBTSEFQRV9URVRSQTtcbiAgZXhwb3J0cy5KT0lOVF9OVUxMID0gSk9JTlRfTlVMTDtcbiAgZXhwb3J0cy5KT0lOVF9ESVNUQU5DRSA9IEpPSU5UX0RJU1RBTkNFO1xuICBleHBvcnRzLkpPSU5UX0JBTExfQU5EX1NPQ0tFVCA9IEpPSU5UX0JBTExfQU5EX1NPQ0tFVDtcbiAgZXhwb3J0cy5KT0lOVF9ISU5HRSA9IEpPSU5UX0hJTkdFO1xuICBleHBvcnRzLkpPSU5UX1dIRUVMID0gSk9JTlRfV0hFRUw7XG4gIGV4cG9ydHMuSk9JTlRfU0xJREVSID0gSk9JTlRfU0xJREVSO1xuICBleHBvcnRzLkpPSU5UX1BSSVNNQVRJQyA9IEpPSU5UX1BSSVNNQVRJQztcbiAgZXhwb3J0cy5BQUJCX1BST1ggPSBBQUJCX1BST1g7XG4gIGV4cG9ydHMucHJpbnRFcnJvciA9IHByaW50RXJyb3I7XG4gIGV4cG9ydHMuSW5mb0Rpc3BsYXkgPSBJbmZvRGlzcGxheTtcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuXG59KSk7IiwiLyogZ2xvYmFsIEFGUkFNRSwgVEhSRUUsIE9JTU8gKi9cblxuY29uc3QgY21kID0gcmVxdWlyZShcIi4vbGlicy9jbWRDb2RlY1wiKVxuXG5nbG9iYWwuT0lNTyA9IHJlcXVpcmUoXCIuL2xpYnMvb2ltb1wiKVxuZ2xvYmFsLndvcmxkID0gbmV3IE9JTU8uV29ybGQoKVxuZ2xvYmFsLmJvZGllcyA9IFtdXG5nbG9iYWwubW92aW5nQm9kaWVzID0gW11cbmdsb2JhbC5qb2ludHMgPSBbXVxuXG5sZXQgdmVjID0gbmV3IE9JTU8uVmVjMygpXG5sZXQgcXVhdCA9IG5ldyBPSU1PLlF1YXQoKVxubGV0IGxhc3RTdGVwID0gMFxubGV0IG5leHRTdGVwID0gRGF0ZS5ub3coKVxuXG5mdW5jdGlvbiBpbml0KCkge1xuICBhZGRFdmVudExpc3RlbmVyKFwibWVzc2FnZVwiLCBvbk1lc3NhZ2UpXG59XG5cbmZ1bmN0aW9uIG9uTWVzc2FnZShlKSB7XG4gIGlmICh0eXBlb2YgZS5kYXRhID09PSBcInN0cmluZ1wiKSB7XG4gICAgbGV0IGNvbW1hbmQgPSBjbWQucGFyc2UoZS5kYXRhKVxuICAgIHN3aXRjaCAoY29tbWFuZC5zaGlmdCgpKSB7XG4gICAgICBjYXNlIFwid29ybGRcIjpcbiAgICAgICAgd29ybGRDb21tYW5kKGNvbW1hbmQpXG4gICAgICAgIGJyZWFrXG4gICAgfVxuICB9XG4gIGVsc2UgaWYgKGUuZGF0YSBpbnN0YW5jZW9mIEZsb2F0NjRBcnJheSkge1xuICAgIGxldCBidWZmZXIgPSBlLmRhdGFcbiAgICBsZXQgbm93ID0gRGF0ZS5ub3coKVxuICAgIGZvciAobGV0IG1pZCA9IDA7IG1pZCA8IG1vdmluZ0JvZGllcy5sZW5ndGg7IG1pZCsrKSB7XG4gICAgICBsZXQgYm9keSA9IG1vdmluZ0JvZGllc1ttaWRdXG4gICAgICBsZXQgcCA9IG1pZCAqIDhcbiAgICAgIGlmICghYm9keSkgY29udGludWVcbiAgICAgIGlmIChib2R5LmlzS2luZW1hdGljKSB7XG4gICAgICAgIHZlYy5zZXQoYnVmZmVyW3ArK10sIGJ1ZmZlcltwKytdLCBidWZmZXJbcCsrXSlcbiAgICAgICAgYm9keS5zZXRQb3NpdGlvbih2ZWMpXG4gICAgICAgIGJ1ZmZlcltwKytdID0gYm9keS5zbGVlcGluZ1xuICAgICAgICBxdWF0LnNldChidWZmZXJbcCsrXSwgYnVmZmVyW3ArK10sIGJ1ZmZlcltwKytdLCBidWZmZXJbcCsrXSlcbiAgICAgICAgYm9keS5zZXRRdWF0ZXJuaW9uKHF1YXQpXG4gICAgICB9XG4gICAgfVxuICAgIGlmIChub3cgLSBsYXN0U3RlcCA+IDEwMjQpIG5leHRTdGVwID0gbm93XG4gICAgbGV0IGRlYWRsaW5lID0gRGF0ZS5ub3coKSArIDI1NlxuICAgIHdoaWxlIChub3cgPiBuZXh0U3RlcCAmJiBEYXRlLm5vdygpIDwgZGVhZGxpbmUpIHtcbiAgICAgIHdvcmxkLnN0ZXAoKVxuICAgICAgZm9yIChsZXQgbWlkID0gMDsgbWlkIDwgbW92aW5nQm9kaWVzLmxlbmd0aDsgbWlkKyspIHtcbiAgICAgICAgbGV0IGJvZHkgPSBtb3ZpbmdCb2RpZXNbbWlkXVxuICAgICAgICBpZiAoIWJvZHkpIGNvbnRpbnVlXG4gICAgICAgIGVtaXRDb2xsaXNpb25zKGJvZHkpXG4gICAgICB9XG4gICAgICBuZXh0U3RlcCArPSB3b3JsZC50aW1lcmF0ZVxuICAgIH1cbiAgICBmb3IgKGxldCBtaWQgPSAwOyBtaWQgPCBtb3ZpbmdCb2RpZXMubGVuZ3RoOyBtaWQrKykge1xuICAgICAgbGV0IGJvZHkgPSBtb3ZpbmdCb2RpZXNbbWlkXVxuICAgICAgbGV0IHAgPSBtaWQgKiA4XG4gICAgICBpZiAoIWJvZHkpIGNvbnRpbnVlXG4gICAgICBpZiAoIWJvZHkuaXNLaW5lbWF0aWMpIHtcbiAgICAgICAgYnVmZmVyW3ArK10gPSBib2R5LnBvcy54XG4gICAgICAgIGJ1ZmZlcltwKytdID0gYm9keS5wb3MueVxuICAgICAgICBidWZmZXJbcCsrXSA9IGJvZHkucG9zLnpcbiAgICAgICAgYnVmZmVyW3ArK10gPSBib2R5LnNsZWVwaW5nXG4gICAgICAgIGJ1ZmZlcltwKytdID0gYm9keS5xdWF0ZXJuaW9uLnhcbiAgICAgICAgYnVmZmVyW3ArK10gPSBib2R5LnF1YXRlcm5pb24ueVxuICAgICAgICBidWZmZXJbcCsrXSA9IGJvZHkucXVhdGVybmlvbi56XG4gICAgICAgIGJ1ZmZlcltwKytdID0gYm9keS5xdWF0ZXJuaW9uLndcbiAgICAgIH1cbiAgICB9XG4gICAgcG9zdE1lc3NhZ2UoYnVmZmVyLCBbYnVmZmVyLmJ1ZmZlcl0pXG4gICAgbGFzdFN0ZXAgPSBub3dcbiAgfVxufVxuXG5mdW5jdGlvbiB3b3JsZENvbW1hbmQocGFyYW1zKSB7XG4gIGlmICh0eXBlb2YgcGFyYW1zWzBdID09PSBcIm51bWJlclwiKSB7XG4gICAgcGFyYW1zLnNoaWZ0KClcbiAgfVxuICBzd2l0Y2ggKHBhcmFtcy5zaGlmdCgpKSB7XG4gICAgY2FzZSBcImJvZHlcIjpcbiAgICAgIGJvZHlDb21tYW5kKHBhcmFtcylcbiAgICAgIGJyZWFrXG4gICAgY2FzZSBcImpvaW50XCI6XG4gICAgICBqb2ludENvbW1hbmQocGFyYW1zKVxuICAgICAgYnJlYWtcbiAgICBjYXNlIFwiZ3Jhdml0eVwiOlxuICAgICAgd29ybGQuZ3Jhdml0eS5jb3B5KHBhcmFtc1swXSlcbiAgICAgIGJyZWFrXG4gIH1cbn1cblxuZnVuY3Rpb24gYm9keUNvbW1hbmQocGFyYW1zKSB7XG4gIGxldCBpZCA9IHBhcmFtcy5zaGlmdCgpXG4gIGxldCBib2R5ID0gYm9kaWVzW2lkXVxuICBzd2l0Y2ggKHBhcmFtcy5zaGlmdCgpKSB7XG4gICAgY2FzZSBcInNoYXBlXCI6XG4gICAgICBzaGFwZUNvbW1hbmQoYm9keSwgcGFyYW1zKVxuICAgICAgYnJlYWtcbiAgICBjYXNlIFwiY3JlYXRlXCI6XG4gICAgICBpZiAoYm9keSkge1xuICAgICAgICB3b3JsZC5yZW1vdmVSaWdpZEJvZHkoYm9keSlcbiAgICAgICAgaWYgKGJvZHkuX21pZF8gIT09IG51bGwpXG4gICAgICAgICAgbW92aW5nQm9kaWVzW2JvZHkuX21pZF9dID0gbnVsbFxuICAgICAgfVxuICAgICAgYm9kaWVzW2lkXSA9IGJvZHkgPSB3b3JsZC5hZGQoe1xuICAgICAgICBtb3ZlOiBwYXJhbXNbMF0udHlwZSAhPT0gXCJzdGF0aWNcIixcbiAgICAgICAga2luZW1hdGljOiBwYXJhbXNbMF0udHlwZSA9PT0gXCJraW5lbWF0aWNcIixcbiAgICAgIH0pXG4gICAgICBib2R5LnJlc2V0UG9zaXRpb24ocGFyYW1zWzBdLnBvc2l0aW9uLngsIHBhcmFtc1swXS5wb3NpdGlvbi55LCBwYXJhbXNbMF0ucG9zaXRpb24ueilcbiAgICAgIGJvZHkucmVzZXRRdWF0ZXJuaW9uKHBhcmFtc1swXS5xdWF0ZXJuaW9uKVxuICAgICAgYm9keS5faWRfID0gaWRcbiAgICAgIGJvZHkuX21pZF8gPSBwYXJhbXNbMF0ubWlkXG4gICAgICBpZiAoYm9keS5fbWlkXyAhPT0gbnVsbClcbiAgICAgICAgbW92aW5nQm9kaWVzW2JvZHkuX21pZF9dID0gYm9keVxuICAgICAgYm9keS5fc2hhcGVzXyA9IFtib2R5LnNoYXBlc11cbiAgICAgIGJyZWFrXG4gICAgY2FzZSBcInJlbW92ZVwiOlxuICAgICAgd29ybGQucmVtb3ZlUmlnaWRCb2R5KGJvZHkpXG4gICAgICBib2RpZXNbaWRdID0gbnVsbFxuICAgICAgaWYgKGJvZHkuX21pZF8gIT09IG51bGwpXG4gICAgICAgIG1vdmluZ0JvZGllc1tib2R5Ll9taWRfXSA9IG51bGxcbiAgICAgIGJyZWFrXG4gICAgY2FzZSBcInBvc2l0aW9uXCI6XG4gICAgICBib2R5LnJlc2V0UG9zaXRpb24ocGFyYW1zWzBdLngsIHBhcmFtc1swXS55LCBwYXJhbXNbMF0ueilcbiAgICAgIGJyZWFrXG4gICAgY2FzZSBcInF1YXRlcm5pb25cIjpcbiAgICAgIGJvZHkucmVzZXRRdWF0ZXJuaW9uKHBhcmFtc1swXSlcbiAgICAgIGJyZWFrXG4gICAgY2FzZSBcInR5cGVcIjpcbiAgICAgIGJvZHkubW92ZSA9IHBhcmFtc1swXSAhPT0gXCJzdGF0aWNcIlxuICAgICAgYm9keS5pc0tpbmVtYXRpYyA9IHBhcmFtc1swXSA9PT0gXCJraW5lbWF0aWNcIlxuXG4gICAgICAvLyBib2R5IGNhbiBzbGVlcCBvciBub3RcbiAgICAgIGlmIChib2R5LmlzS2luZW1hdGljKSBib2R5LmFsbG93U2xlZXAgPSBmYWxzZVxuICAgICAgZWxzZSBib2R5LmFsbG93U2xlZXAgPSB0cnVlXG5cbiAgICAgIC8vIGJvZHkgc3RhdGljIG9yIGR5bmFtaWNcbiAgICAgIGlmIChib2R5Lm1vdmUpIHtcbiAgICAgICAgYm9keS5zZXR1cE1hc3MoT0lNTy5CT0RZX0RZTkFNSUMpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBib2R5LnNldHVwTWFzcyhPSU1PLkJPRFlfU1RBVElDKVxuICAgICAgfVxuXG4gICAgICAvLyBmb3JjZSBzbGVlcCBvbiBub3RcbiAgICAgIGlmIChib2R5Lm1vdmUpIHtcbiAgICAgICAgYm9keS5hd2FrZSgpXG4gICAgICB9XG4gICAgICBicmVha1xuICAgIGNhc2UgXCJiZWxvbmdzVG9cIjpcbiAgICAgIGJvZHkuX2JlbG9uZ3NUb18gPSBwYXJhbXNbMF1cbiAgICAgIGJvZHkuX3NoYXBlc18uZm9yRWFjaChzaGFwZSA9PiB7IHNoYXBlLmJlbG9uZ3NUbyA9IHBhcmFtc1swXSB9KVxuICAgICAgYnJlYWtcbiAgICBjYXNlIFwiY29sbGlkZXNXaXRoXCI6XG4gICAgICBib2R5Ll9jb2xsaWRlc1dpdGhfID0gcGFyYW1zWzBdXG4gICAgICBib2R5Ll9zaGFwZXNfLmZvckVhY2goc2hhcGUgPT4geyBzaGFwZS5jb2xsaWRlc1dpdGggPSBwYXJhbXNbMF0gfSlcbiAgICAgIGJyZWFrXG4gICAgY2FzZSBcImVtaXRzV2l0aFwiOlxuICAgICAgYm9keS5fZW1pdHNXaXRoXyA9IHBhcmFtc1swXVxuICAgICAgYnJlYWtcbiAgICBjYXNlIFwic2xlZXBpbmdcIjpcbiAgICAgIGlmIChwYXJhbXNbMF0pIGJvZHkuc2xlZXAoKVxuICAgICAgZWxzZSBib2R5LmF3YWtlKClcbiAgICAgIGJyZWFrXG4gIH1cbn1cblxuZnVuY3Rpb24gam9pbnRDb21tYW5kKHBhcmFtcykge1xuICBsZXQgaWQgPSBwYXJhbXMuc2hpZnQoKVxuICBsZXQgam9pbnQgPSBqb2ludHNbaWRdXG4gIHN3aXRjaCAocGFyYW1zLnNoaWZ0KCkpIHtcbiAgICBjYXNlIFwiY3JlYXRlXCI6XG4gICAgICBpZiAoam9pbnQpIHtcbiAgICAgICAgd29ybGQucmVtb3ZlSm9pbnQoam9pbnQpXG4gICAgICB9XG4gICAgICBqb2ludHNbaWRdID0gam9pbnQgPSB3b3JsZC5hZGQoe1xuICAgICAgICBtb3ZlOiBwYXJhbXNbMF0udHlwZSAhPT0gXCJzdGF0aWNcIixcbiAgICAgICAga2luZW1hdGljOiBwYXJhbXNbMF0udHlwZSA9PT0gXCJraW5lbWF0aWNcIixcbiAgICAgIH0pXG4gICAgICBqb2ludC5yZXNldFBvc2l0aW9uKHBhcmFtc1swXS5wb3NpdGlvbi54LCBwYXJhbXNbMF0ucG9zaXRpb24ueSwgcGFyYW1zWzBdLnBvc2l0aW9uLnopXG4gICAgICBqb2ludC5yZXNldFF1YXRlcm5pb24ocGFyYW1zWzBdLnF1YXRlcm5pb24pXG4gICAgICBqb2ludC5faWRfID0gaWRcbiAgICAgIGJyZWFrXG4gICAgY2FzZSBcInJlbW92ZVwiOlxuICAgICAgd29ybGQucmVtb3ZlSm9pbnQoam9pbnQpXG4gICAgICBqb2ludHNbaWRdID0gbnVsbFxuICAgICAgYnJlYWtcbiAgfVxufVxuXG5mdW5jdGlvbiBzaGFwZUNvbW1hbmQoYm9keSwgcGFyYW1zKSB7XG4gIGlmICghYm9keSkgcmV0dXJuXG4gIGxldCBpZCA9IHBhcmFtcy5zaGlmdCgpXG4gIGxldCBzaGFwZSA9IGJvZHkuX3NoYXBlc19baWRdXG4gIHN3aXRjaCAocGFyYW1zLnNoaWZ0KCkpIHtcbiAgICBjYXNlIFwiY3JlYXRlXCI6XG4gICAgICBpZiAoc2hhcGUpXG4gICAgICAgIGJvZHkucmVtb3ZlU2hhcGUoc2hhcGUpXG4gICAgICBsZXQgc2MgPSBuZXcgT0lNTy5TaGFwZUNvbmZpZygpXG4gICAgICBzYy5yZWxhdGl2ZVBvc2l0aW9uLmNvcHkocGFyYW1zWzBdLnBvc2l0aW9uKVxuICAgICAgc2MucmVsYXRpdmVSb3RhdGlvbi5zZXRRdWF0KHF1YXQuY29weShwYXJhbXNbMF0ucXVhdGVybmlvbikpXG4gICAgICBzd2l0Y2ggKHBhcmFtc1swXS50eXBlKSB7XG4gICAgICAgIGNhc2UgXCJzcGhlcmVcIjogc2hhcGUgPSBuZXcgT0lNTy5TcGhlcmUoc2MsIHBhcmFtc1swXS5zaXplLnggLyAyKTsgYnJlYWtcbiAgICAgICAgY2FzZSBcImN5bGluZGVyXCI6IHNoYXBlID0gbmV3IE9JTU8uQ3lsaW5kZXIoc2MsIHBhcmFtc1swXS5zaXplLnggLyAyLCBwYXJhbXNbMF0uc2l6ZS55KTsgYnJlYWtcbiAgICAgICAgLy8gY2FzZSBcInBsYW5lXCI6IHNoYXBlID0gbmV3IE9JTU8uUGxhbmUoc2MpOyBicmVha1xuICAgICAgICBkZWZhdWx0OiBzaGFwZSA9IG5ldyBPSU1PLkJveChzYywgcGFyYW1zWzBdLnNpemUueCwgcGFyYW1zWzBdLnNpemUueSwgcGFyYW1zWzBdLnNpemUueilcbiAgICAgIH1cbiAgICAgIHNoYXBlLl9pZF8gPSBpZFxuICAgICAgc2hhcGUuYmVsb25nc1RvID0gYm9keS5fYmVsb25nc1RvX1xuICAgICAgc2hhcGUuY29sbGlkZXNXaXRoID0gYm9keS5fY29sbGlkZXNXaXRoX1xuICAgICAgLy8gc2hhcGUuX2VtaXRzV2l0aF8gPSBib2R5Ll9lbWl0c1dpdGhfXG4gICAgICBib2R5LmFkZFNoYXBlKGJvZHkuX3NoYXBlc19baWRdID0gc2hhcGUpXG4gICAgICBicmVha1xuICAgIGNhc2UgXCJyZW1vdmVcIjpcbiAgICAgIGJvZHkucmVtb3ZlU2hhcGUoc2hhcGUpXG4gICAgICBib2R5Ll9zaGFwZXNfW2lkXSA9IG51bGxcbiAgICAgIGJyZWFrXG4gIH1cbn1cblxuXG5mdW5jdGlvbiBlbWl0Q29sbGlzaW9ucyhib2R5KSB7XG4gIGlmICghYm9keS5fZW1pdHNXaXRoXykgcmV0dXJuXG4gIGxldCBiMSwgYjJcbiAgbGV0IGNvbnRhY3QgPSB3b3JsZC5jb250YWN0c1xuICB3aGlsZSAoY29udGFjdCAhPT0gbnVsbCkge1xuICAgIGIxID0gY29udGFjdC5ib2R5MVxuICAgIGIyID0gY29udGFjdC5ib2R5MlxuICAgIGlmICgoYjEgPT09IGJvZHkgJiYgKGIyLl9iZWxvbmdzVG9fICYgYjEuX2VtaXRzV2l0aF8pKSB8fCAoYjIgPT09IGJvZHkgJiYgKGIxLl9iZWxvbmdzVG9fICYgYjIuX2VtaXRzV2l0aF8pKSkge1xuICAgICAgaWYgKGNvbnRhY3QudG91Y2hpbmcgJiYgIWNvbnRhY3QuY2xvc2UpIHtcbiAgICAgICAgbGV0IG90aGVyID0gYjEgPT09IGJvZHkgPyBiMiA6IGIxXG4gICAgICAgIGxldCBzaGFwZTEgPSBiMSA9PT0gYm9keSA/IGNvbnRhY3Quc2hhcGUxIDogY29udGFjdC5zaGFwZTJcbiAgICAgICAgbGV0IHNoYXBlMiA9IGIxID09PSBib2R5ID8gY29udGFjdC5zaGFwZTIgOiBjb250YWN0LnNoYXBlMVxuICAgICAgICBsZXQgZXZlbnQgPSB7XG4gICAgICAgICAgZXZlbnQ6IFwiY29sbGlzaW9uXCIsXG4gICAgICAgICAgYm9keTE6IGJvZHkuX2lkXyxcbiAgICAgICAgICBib2R5Mjogb3RoZXIuX2lkXyxcbiAgICAgICAgICBzaGFwZTE6IHNoYXBlMS5faWRfLFxuICAgICAgICAgIHNoYXBlMjogc2hhcGUyLl9pZF9cbiAgICAgICAgfVxuICAgICAgICBwb3N0TWVzc2FnZShcIndvcmxkIGJvZHkgXCIgKyBib2R5Ll9pZF8gKyBcIiBlbWl0cyBcIiArIGNtZC5zdHJpbmdpZnlQYXJhbShldmVudCkpXG4gICAgICB9XG4gICAgfVxuICAgIGNvbnRhY3QgPSBjb250YWN0Lm5leHRcbiAgfVxufVxuXG5pbml0KCkiXX0=
