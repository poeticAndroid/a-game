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

let vec = new OIMO.Vec3()
let quat = new OIMO.Quat()
let nextStep = 0

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
    if (now > nextStep) {
      for (let mid = 0; mid < movingBodies.length; mid++) {
        let body = movingBodies[mid]
        let p = mid * 8
        if (!body) continue
        if (body.isKinematic) {
          vec.set(buffer[p++], buffer[p++], buffer[p++])
          body.setPosition(vec)
          p++
          quat.set(buffer[p++], buffer[p++], buffer[p++], buffer[p++])
          body.setQuaternion(quat)
        }
      }
      world.step()
      nextStep += world.timerate
      if (now > nextStep)
        nextStep = now + world.timerate / 2
    }
    for (let mid = 0; mid < movingBodies.length; mid++) {
      let body = movingBodies[mid]
      let p = mid * 8
      if (!body) continue
      if (!body.isKinematic) {
        buffer[p++] = body.pos.x
        buffer[p++] = body.pos.y
        buffer[p++] = body.pos.z
        p++
        buffer[p++] = body.quaternion.x
        buffer[p++] = body.quaternion.y
        buffer[p++] = body.quaternion.z
        buffer[p++] = body.quaternion.w
      }
      emitCollisions(body)
    }
    postMessage(buffer, [buffer.buffer])
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
      // body._shapes_.forEach(shape => { shape._emitsWith_ = params[0] })
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvbGlicy9jbWRDb2RlYy5qcyIsInNyYy9saWJzL29pbW8uanMiLCJzcmMvb2ltb1dvcmtlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDMStYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJtb2R1bGUuZXhwb3J0cyA9IHtcclxuICBwYXJzZTogZnVuY3Rpb24gKGNtZCkge1xyXG4gICAgbGV0IHdvcmRzID0gY21kLnNwbGl0KFwiIFwiKVxyXG4gICAgbGV0IGFyZ3MgPSBbXVxyXG4gICAgZm9yIChsZXQgd29yZCBvZiB3b3Jkcykge1xyXG4gICAgICBpZiAod29yZCkge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICBhcmdzLnB1c2goSlNPTi5wYXJzZSh3b3JkKSlcclxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgaWYgKHdvcmQgIT09IFwiPVwiKVxyXG4gICAgICAgICAgICBhcmdzLnB1c2god29yZClcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBhcmdzXHJcbiAgfSxcclxuICBzdHJpbmdpZnlQYXJhbTogZnVuY3Rpb24gKHZhbCkge1xyXG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHZhbCkucmVwbGFjZUFsbChcIiBcIiwgXCJcXFxcdTAwMjBcIikucmVwbGFjZUFsbChcIlxcXCJfXCIsIFwiXFxcIlwiKVxyXG4gIH1cclxufSIsIihmdW5jdGlvbiAoZ2xvYmFsLCBmYWN0b3J5KSB7XG4gIHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyA/IGZhY3RvcnkoZXhwb3J0cykgOlxuICAgIHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCA/IGRlZmluZShbJ2V4cG9ydHMnXSwgZmFjdG9yeSkgOlxuICAgICAgKGdsb2JhbCA9IGdsb2JhbCB8fCBzZWxmLCBmYWN0b3J5KGdsb2JhbC5PSU1PID0ge30pKTtcbn0odGhpcywgZnVuY3Rpb24gKGV4cG9ydHMpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIC8vIFBvbHlmaWxsc1xuXG4gIGlmIChOdW1iZXIuRVBTSUxPTiA9PT0gdW5kZWZpbmVkKSB7XG5cbiAgICBOdW1iZXIuRVBTSUxPTiA9IE1hdGgucG93KDIsIC0gNTIpO1xuXG4gIH1cblxuICAvL1xuXG4gIGlmIChNYXRoLnNpZ24gPT09IHVuZGVmaW5lZCkge1xuXG4gICAgLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvTWF0aC9zaWduXG5cbiAgICBNYXRoLnNpZ24gPSBmdW5jdGlvbiAoeCkge1xuXG4gICAgICByZXR1cm4gKHggPCAwKSA/IC0gMSA6ICh4ID4gMCkgPyAxIDogKyB4O1xuXG4gICAgfTtcblxuICB9XG5cbiAgaWYgKEZ1bmN0aW9uLnByb3RvdHlwZS5uYW1lID09PSB1bmRlZmluZWQpIHtcblxuICAgIC8vIE1pc3NpbmcgaW4gSUU5LTExLlxuICAgIC8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0Z1bmN0aW9uL25hbWVcblxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShGdW5jdGlvbi5wcm90b3R5cGUsICduYW1lJywge1xuXG4gICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICByZXR1cm4gdGhpcy50b1N0cmluZygpLm1hdGNoKC9eXFxzKmZ1bmN0aW9uXFxzKihbXlxcKFxcc10qKS8pWzFdO1xuXG4gICAgICB9XG5cbiAgICB9KTtcblxuICB9XG5cbiAgaWYgKE9iamVjdC5hc3NpZ24gPT09IHVuZGVmaW5lZCkge1xuXG4gICAgLy8gTWlzc2luZyBpbiBJRS5cbiAgICAvLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9PYmplY3QvYXNzaWduXG5cbiAgICAoZnVuY3Rpb24gKCkge1xuXG4gICAgICBPYmplY3QuYXNzaWduID0gZnVuY3Rpb24gKHRhcmdldCkge1xuXG4gICAgICAgIGlmICh0YXJnZXQgPT09IHVuZGVmaW5lZCB8fCB0YXJnZXQgPT09IG51bGwpIHtcblxuICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjb252ZXJ0IHVuZGVmaW5lZCBvciBudWxsIHRvIG9iamVjdCcpO1xuXG4gICAgICAgIH1cblxuICAgICAgICB2YXIgb3V0cHV0ID0gT2JqZWN0KHRhcmdldCk7XG5cbiAgICAgICAgZm9yICh2YXIgaW5kZXggPSAxOyBpbmRleCA8IGFyZ3VtZW50cy5sZW5ndGg7IGluZGV4KyspIHtcblxuICAgICAgICAgIHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaW5kZXhdO1xuXG4gICAgICAgICAgaWYgKHNvdXJjZSAhPT0gdW5kZWZpbmVkICYmIHNvdXJjZSAhPT0gbnVsbCkge1xuXG4gICAgICAgICAgICBmb3IgKHZhciBuZXh0S2V5IGluIHNvdXJjZSkge1xuXG4gICAgICAgICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBuZXh0S2V5KSkge1xuXG4gICAgICAgICAgICAgICAgb3V0cHV0W25leHRLZXldID0gc291cmNlW25leHRLZXldO1xuXG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gb3V0cHV0O1xuXG4gICAgICB9O1xuXG4gICAgfSkoKTtcblxuICB9XG5cbiAgLypcbiAgICogQSBsaXN0IG9mIGNvbnN0YW50cyBidWlsdC1pbiBmb3JcbiAgICogdGhlIHBoeXNpY3MgZW5naW5lLlxuICAgKi9cblxuICB2YXIgUkVWSVNJT04gPSAnMS4wLjknO1xuXG4gIC8vIEJyb2FkUGhhc2VcbiAgdmFyIEJSX05VTEwgPSAwO1xuICB2YXIgQlJfQlJVVEVfRk9SQ0UgPSAxO1xuICB2YXIgQlJfU1dFRVBfQU5EX1BSVU5FID0gMjtcbiAgdmFyIEJSX0JPVU5ESU5HX1ZPTFVNRV9UUkVFID0gMztcblxuICAvLyBCb2R5IHR5cGVcbiAgdmFyIEJPRFlfTlVMTCA9IDA7XG4gIHZhciBCT0RZX0RZTkFNSUMgPSAxO1xuICB2YXIgQk9EWV9TVEFUSUMgPSAyO1xuICB2YXIgQk9EWV9LSU5FTUFUSUMgPSAzO1xuICB2YXIgQk9EWV9HSE9TVCA9IDQ7XG5cbiAgLy8gU2hhcGUgdHlwZVxuICB2YXIgU0hBUEVfTlVMTCA9IDA7XG4gIHZhciBTSEFQRV9TUEhFUkUgPSAxO1xuICB2YXIgU0hBUEVfQk9YID0gMjtcbiAgdmFyIFNIQVBFX0NZTElOREVSID0gMztcbiAgdmFyIFNIQVBFX1BMQU5FID0gNDtcbiAgdmFyIFNIQVBFX1BBUlRJQ0xFID0gNTtcbiAgdmFyIFNIQVBFX1RFVFJBID0gNjtcblxuICAvLyBKb2ludCB0eXBlXG4gIHZhciBKT0lOVF9OVUxMID0gMDtcbiAgdmFyIEpPSU5UX0RJU1RBTkNFID0gMTtcbiAgdmFyIEpPSU5UX0JBTExfQU5EX1NPQ0tFVCA9IDI7XG4gIHZhciBKT0lOVF9ISU5HRSA9IDM7XG4gIHZhciBKT0lOVF9XSEVFTCA9IDQ7XG4gIHZhciBKT0lOVF9TTElERVIgPSA1O1xuICB2YXIgSk9JTlRfUFJJU01BVElDID0gNjtcblxuICAvLyBBQUJCIGFwcm94aW1hdGlvblxuICB2YXIgQUFCQl9QUk9YID0gMC4wMDU7XG5cbiAgdmFyIF9NYXRoID0ge1xuXG4gICAgc3FydDogTWF0aC5zcXJ0LFxuICAgIGFiczogTWF0aC5hYnMsXG4gICAgZmxvb3I6IE1hdGguZmxvb3IsXG4gICAgY29zOiBNYXRoLmNvcyxcbiAgICBzaW46IE1hdGguc2luLFxuICAgIGFjb3M6IE1hdGguYWNvcyxcbiAgICBhc2luOiBNYXRoLmFzaW4sXG4gICAgYXRhbjI6IE1hdGguYXRhbjIsXG4gICAgcm91bmQ6IE1hdGgucm91bmQsXG4gICAgcG93OiBNYXRoLnBvdyxcbiAgICBtYXg6IE1hdGgubWF4LFxuICAgIG1pbjogTWF0aC5taW4sXG4gICAgcmFuZG9tOiBNYXRoLnJhbmRvbSxcblxuICAgIGRlZ3RvcmFkOiAwLjAxNzQ1MzI5MjUxOTk0MzI5NTcsXG4gICAgcmFkdG9kZWc6IDU3LjI5NTc3OTUxMzA4MjMyMDg3NixcbiAgICBQSTogMy4xNDE1OTI2NTM1ODk3OTMsXG4gICAgVHdvUEk6IDYuMjgzMTg1MzA3MTc5NTg2LFxuICAgIFBJOTA6IDEuNTcwNzk2MzI2Nzk0ODk2LFxuICAgIFBJMjcwOiA0LjcxMjM4ODk4MDM4NDY4OSxcblxuICAgIElORjogSW5maW5pdHksXG4gICAgRVBaOiAwLjAwMDAxLFxuICAgIEVQWjI6IDAuMDAwMDAxLFxuXG4gICAgbGVycDogZnVuY3Rpb24gKHgsIHksIHQpIHtcblxuICAgICAgcmV0dXJuICgxIC0gdCkgKiB4ICsgdCAqIHk7XG5cbiAgICB9LFxuXG4gICAgcmFuZEludDogZnVuY3Rpb24gKGxvdywgaGlnaCkge1xuXG4gICAgICByZXR1cm4gbG93ICsgX01hdGguZmxvb3IoX01hdGgucmFuZG9tKCkgKiAoaGlnaCAtIGxvdyArIDEpKTtcblxuICAgIH0sXG5cbiAgICByYW5kOiBmdW5jdGlvbiAobG93LCBoaWdoKSB7XG5cbiAgICAgIHJldHVybiBsb3cgKyBfTWF0aC5yYW5kb20oKSAqIChoaWdoIC0gbG93KTtcblxuICAgIH0sXG5cbiAgICBnZW5lcmF0ZVVVSUQ6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgLy8gaHR0cDovL3d3dy5icm9vZmEuY29tL1Rvb2xzL01hdGgudXVpZC5odG1cblxuICAgICAgdmFyIGNoYXJzID0gJzAxMjM0NTY3ODlBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6Jy5zcGxpdCgnJyk7XG4gICAgICB2YXIgdXVpZCA9IG5ldyBBcnJheSgzNik7XG4gICAgICB2YXIgcm5kID0gMCwgcjtcblxuICAgICAgcmV0dXJuIGZ1bmN0aW9uIGdlbmVyYXRlVVVJRCgpIHtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDM2OyBpKyspIHtcblxuICAgICAgICAgIGlmIChpID09PSA4IHx8IGkgPT09IDEzIHx8IGkgPT09IDE4IHx8IGkgPT09IDIzKSB7XG5cbiAgICAgICAgICAgIHV1aWRbaV0gPSAnLSc7XG5cbiAgICAgICAgICB9IGVsc2UgaWYgKGkgPT09IDE0KSB7XG5cbiAgICAgICAgICAgIHV1aWRbaV0gPSAnNCc7XG5cbiAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICBpZiAocm5kIDw9IDB4MDIpIHJuZCA9IDB4MjAwMDAwMCArIChNYXRoLnJhbmRvbSgpICogMHgxMDAwMDAwKSB8IDA7XG4gICAgICAgICAgICByID0gcm5kICYgMHhmO1xuICAgICAgICAgICAgcm5kID0gcm5kID4+IDQ7XG4gICAgICAgICAgICB1dWlkW2ldID0gY2hhcnNbKGkgPT09IDE5KSA/IChyICYgMHgzKSB8IDB4OCA6IHJdO1xuXG4gICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdXVpZC5qb2luKCcnKTtcblxuICAgICAgfTtcblxuICAgIH0oKSxcblxuICAgIGludDogZnVuY3Rpb24gKHgpIHtcblxuICAgICAgcmV0dXJuIF9NYXRoLmZsb29yKHgpO1xuXG4gICAgfSxcblxuICAgIGZpeDogZnVuY3Rpb24gKHgsIG4pIHtcblxuICAgICAgcmV0dXJuIHgudG9GaXhlZChuIHx8IDMsIDEwKTtcblxuICAgIH0sXG5cbiAgICBjbGFtcDogZnVuY3Rpb24gKHZhbHVlLCBtaW4sIG1heCkge1xuXG4gICAgICByZXR1cm4gX01hdGgubWF4KG1pbiwgX01hdGgubWluKG1heCwgdmFsdWUpKTtcblxuICAgIH0sXG5cbiAgICAvL2NsYW1wOiBmdW5jdGlvbiAoIHgsIGEsIGIgKSB7IHJldHVybiAoIHggPCBhICkgPyBhIDogKCAoIHggPiBiICkgPyBiIDogeCApOyB9LFxuXG5cblxuICAgIGRpc3RhbmNlOiBmdW5jdGlvbiAocDEsIHAyKSB7XG5cbiAgICAgIHZhciB4ZCA9IHAyWzBdIC0gcDFbMF07XG4gICAgICB2YXIgeWQgPSBwMlsxXSAtIHAxWzFdO1xuICAgICAgdmFyIHpkID0gcDJbMl0gLSBwMVsyXTtcbiAgICAgIHJldHVybiBfTWF0aC5zcXJ0KHhkICogeGQgKyB5ZCAqIHlkICsgemQgKiB6ZCk7XG5cbiAgICB9LFxuXG4gICAgLyp1bndyYXBEZWdyZWVzOiBmdW5jdGlvbiAoIHIgKSB7XG5cbiAgICAgICAgciA9IHIgJSAzNjA7XG4gICAgICAgIGlmIChyID4gMTgwKSByIC09IDM2MDtcbiAgICAgICAgaWYgKHIgPCAtMTgwKSByICs9IDM2MDtcbiAgICAgICAgcmV0dXJuIHI7XG5cbiAgICB9LFxuXG4gICAgdW53cmFwUmFkaWFuOiBmdW5jdGlvbiggciApe1xuXG4gICAgICAgIHIgPSByICUgX01hdGguVHdvUEk7XG4gICAgICAgIGlmIChyID4gX01hdGguUEkpIHIgLT0gX01hdGguVHdvUEk7XG4gICAgICAgIGlmIChyIDwgLV9NYXRoLlBJKSByICs9IF9NYXRoLlR3b1BJO1xuICAgICAgICByZXR1cm4gcjtcblxuICAgIH0sKi9cblxuICAgIGFjb3NDbGFtcDogZnVuY3Rpb24gKGNvcykge1xuXG4gICAgICBpZiAoY29zID4gMSkgcmV0dXJuIDA7XG4gICAgICBlbHNlIGlmIChjb3MgPCAtMSkgcmV0dXJuIF9NYXRoLlBJO1xuICAgICAgZWxzZSByZXR1cm4gX01hdGguYWNvcyhjb3MpO1xuXG4gICAgfSxcblxuICAgIGRpc3RhbmNlVmVjdG9yOiBmdW5jdGlvbiAodjEsIHYyKSB7XG5cbiAgICAgIHZhciB4ZCA9IHYxLnggLSB2Mi54O1xuICAgICAgdmFyIHlkID0gdjEueSAtIHYyLnk7XG4gICAgICB2YXIgemQgPSB2MS56IC0gdjIuejtcbiAgICAgIHJldHVybiB4ZCAqIHhkICsgeWQgKiB5ZCArIHpkICogemQ7XG5cbiAgICB9LFxuXG4gICAgZG90VmVjdG9yczogZnVuY3Rpb24gKGEsIGIpIHtcblxuICAgICAgcmV0dXJuIGEueCAqIGIueCArIGEueSAqIGIueSArIGEueiAqIGIuejtcblxuICAgIH0sXG5cbiAgfTtcblxuICBmdW5jdGlvbiBwcmludEVycm9yKGNsYXp6LCBtc2cpIHtcbiAgICBjb25zb2xlLmVycm9yKFwiW09JTU9dIFwiICsgY2xhenogKyBcIjogXCIgKyBtc2cpO1xuICB9XG5cbiAgLy8gQSBwZXJmb3JtYW5jZSBldmFsdWF0b3JcblxuICBmdW5jdGlvbiBJbmZvRGlzcGxheSh3b3JsZCkge1xuXG4gICAgdGhpcy5wYXJlbnQgPSB3b3JsZDtcblxuICAgIHRoaXMuaW5mb3MgPSBuZXcgRmxvYXQzMkFycmF5KDEzKTtcbiAgICB0aGlzLmYgPSBbMCwgMCwgMF07XG5cbiAgICB0aGlzLnRpbWVzID0gWzAsIDAsIDAsIDBdO1xuXG4gICAgdGhpcy5icm9hZFBoYXNlID0gdGhpcy5wYXJlbnQuYnJvYWRQaGFzZVR5cGU7XG5cbiAgICB0aGlzLnZlcnNpb24gPSBSRVZJU0lPTjtcblxuICAgIHRoaXMuZnBzID0gMDtcblxuICAgIHRoaXMudHQgPSAwO1xuXG4gICAgdGhpcy5icm9hZFBoYXNlVGltZSA9IDA7XG4gICAgdGhpcy5uYXJyb3dQaGFzZVRpbWUgPSAwO1xuICAgIHRoaXMuc29sdmluZ1RpbWUgPSAwO1xuICAgIHRoaXMudG90YWxUaW1lID0gMDtcbiAgICB0aGlzLnVwZGF0ZVRpbWUgPSAwO1xuXG4gICAgdGhpcy5NYXhCcm9hZFBoYXNlVGltZSA9IDA7XG4gICAgdGhpcy5NYXhOYXJyb3dQaGFzZVRpbWUgPSAwO1xuICAgIHRoaXMuTWF4U29sdmluZ1RpbWUgPSAwO1xuICAgIHRoaXMuTWF4VG90YWxUaW1lID0gMDtcbiAgICB0aGlzLk1heFVwZGF0ZVRpbWUgPSAwO1xuICB9XG4gIE9iamVjdC5hc3NpZ24oSW5mb0Rpc3BsYXkucHJvdG90eXBlLCB7XG5cbiAgICBzZXRUaW1lOiBmdW5jdGlvbiAobikge1xuICAgICAgdGhpcy50aW1lc1tuIHx8IDBdID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgfSxcblxuICAgIHJlc2V0TWF4OiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHRoaXMuTWF4QnJvYWRQaGFzZVRpbWUgPSAwO1xuICAgICAgdGhpcy5NYXhOYXJyb3dQaGFzZVRpbWUgPSAwO1xuICAgICAgdGhpcy5NYXhTb2x2aW5nVGltZSA9IDA7XG4gICAgICB0aGlzLk1heFRvdGFsVGltZSA9IDA7XG4gICAgICB0aGlzLk1heFVwZGF0ZVRpbWUgPSAwO1xuXG4gICAgfSxcblxuICAgIGNhbGNCcm9hZFBoYXNlOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHRoaXMuc2V0VGltZSgyKTtcbiAgICAgIHRoaXMuYnJvYWRQaGFzZVRpbWUgPSB0aGlzLnRpbWVzWzJdIC0gdGhpcy50aW1lc1sxXTtcblxuICAgIH0sXG5cbiAgICBjYWxjTmFycm93UGhhc2U6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgdGhpcy5zZXRUaW1lKDMpO1xuICAgICAgdGhpcy5uYXJyb3dQaGFzZVRpbWUgPSB0aGlzLnRpbWVzWzNdIC0gdGhpcy50aW1lc1syXTtcblxuICAgIH0sXG5cbiAgICBjYWxjRW5kOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHRoaXMuc2V0VGltZSgyKTtcbiAgICAgIHRoaXMuc29sdmluZ1RpbWUgPSB0aGlzLnRpbWVzWzJdIC0gdGhpcy50aW1lc1sxXTtcbiAgICAgIHRoaXMudG90YWxUaW1lID0gdGhpcy50aW1lc1syXSAtIHRoaXMudGltZXNbMF07XG4gICAgICB0aGlzLnVwZGF0ZVRpbWUgPSB0aGlzLnRvdGFsVGltZSAtICh0aGlzLmJyb2FkUGhhc2VUaW1lICsgdGhpcy5uYXJyb3dQaGFzZVRpbWUgKyB0aGlzLnNvbHZpbmdUaW1lKTtcblxuICAgICAgaWYgKHRoaXMudHQgPT09IDEwMCkgdGhpcy5yZXNldE1heCgpO1xuXG4gICAgICBpZiAodGhpcy50dCA+IDEwMCkge1xuICAgICAgICBpZiAodGhpcy5icm9hZFBoYXNlVGltZSA+IHRoaXMuTWF4QnJvYWRQaGFzZVRpbWUpIHRoaXMuTWF4QnJvYWRQaGFzZVRpbWUgPSB0aGlzLmJyb2FkUGhhc2VUaW1lO1xuICAgICAgICBpZiAodGhpcy5uYXJyb3dQaGFzZVRpbWUgPiB0aGlzLk1heE5hcnJvd1BoYXNlVGltZSkgdGhpcy5NYXhOYXJyb3dQaGFzZVRpbWUgPSB0aGlzLm5hcnJvd1BoYXNlVGltZTtcbiAgICAgICAgaWYgKHRoaXMuc29sdmluZ1RpbWUgPiB0aGlzLk1heFNvbHZpbmdUaW1lKSB0aGlzLk1heFNvbHZpbmdUaW1lID0gdGhpcy5zb2x2aW5nVGltZTtcbiAgICAgICAgaWYgKHRoaXMudG90YWxUaW1lID4gdGhpcy5NYXhUb3RhbFRpbWUpIHRoaXMuTWF4VG90YWxUaW1lID0gdGhpcy50b3RhbFRpbWU7XG4gICAgICAgIGlmICh0aGlzLnVwZGF0ZVRpbWUgPiB0aGlzLk1heFVwZGF0ZVRpbWUpIHRoaXMuTWF4VXBkYXRlVGltZSA9IHRoaXMudXBkYXRlVGltZTtcbiAgICAgIH1cblxuXG4gICAgICB0aGlzLnVwZnBzKCk7XG5cbiAgICAgIHRoaXMudHQrKztcbiAgICAgIGlmICh0aGlzLnR0ID4gNTAwKSB0aGlzLnR0ID0gMDtcblxuICAgIH0sXG5cblxuICAgIHVwZnBzOiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLmZbMV0gPSBEYXRlLm5vdygpO1xuICAgICAgaWYgKHRoaXMuZlsxXSAtIDEwMDAgPiB0aGlzLmZbMF0pIHsgdGhpcy5mWzBdID0gdGhpcy5mWzFdOyB0aGlzLmZwcyA9IHRoaXMuZlsyXTsgdGhpcy5mWzJdID0gMDsgfSB0aGlzLmZbMl0rKztcbiAgICB9LFxuXG4gICAgc2hvdzogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGluZm8gPSBbXG4gICAgICAgIFwiT2ltby5qcyBcIiArIHRoaXMudmVyc2lvbiArIFwiPGJyPlwiLFxuICAgICAgICB0aGlzLmJyb2FkUGhhc2UgKyBcIjxicj48YnI+XCIsXG4gICAgICAgIFwiRlBTOiBcIiArIHRoaXMuZnBzICsgXCIgZnBzPGJyPjxicj5cIixcbiAgICAgICAgXCJyaWdpZGJvZHkgXCIgKyB0aGlzLnBhcmVudC5udW1SaWdpZEJvZGllcyArIFwiPGJyPlwiLFxuICAgICAgICBcImNvbnRhY3QgJm5ic3A7Jm5ic3A7XCIgKyB0aGlzLnBhcmVudC5udW1Db250YWN0cyArIFwiPGJyPlwiLFxuICAgICAgICBcImN0LXBvaW50ICZuYnNwO1wiICsgdGhpcy5wYXJlbnQubnVtQ29udGFjdFBvaW50cyArIFwiPGJyPlwiLFxuICAgICAgICBcInBhaXJjaGVjayBcIiArIHRoaXMucGFyZW50LmJyb2FkUGhhc2UubnVtUGFpckNoZWNrcyArIFwiPGJyPlwiLFxuICAgICAgICBcImlzbGFuZCAmbmJzcDsmbmJzcDsmbmJzcDtcIiArIHRoaXMucGFyZW50Lm51bUlzbGFuZHMgKyBcIjxicj48YnI+XCIsXG4gICAgICAgIFwiVGltZSBpbiBtaWxsaXNlY29uZHM8YnI+PGJyPlwiLFxuICAgICAgICBcImJyb2FkcGhhc2UgJm5ic3A7XCIgKyBfTWF0aC5maXgodGhpcy5icm9hZFBoYXNlVGltZSkgKyBcIiB8IFwiICsgX01hdGguZml4KHRoaXMuTWF4QnJvYWRQaGFzZVRpbWUpICsgXCI8YnI+XCIsXG4gICAgICAgIFwibmFycm93cGhhc2UgXCIgKyBfTWF0aC5maXgodGhpcy5uYXJyb3dQaGFzZVRpbWUpICsgXCIgfCBcIiArIF9NYXRoLmZpeCh0aGlzLk1heE5hcnJvd1BoYXNlVGltZSkgKyBcIjxicj5cIixcbiAgICAgICAgXCJzb2x2aW5nICZuYnNwOyZuYnNwOyZuYnNwOyZuYnNwO1wiICsgX01hdGguZml4KHRoaXMuc29sdmluZ1RpbWUpICsgXCIgfCBcIiArIF9NYXRoLmZpeCh0aGlzLk1heFNvbHZpbmdUaW1lKSArIFwiPGJyPlwiLFxuICAgICAgICBcInRvdGFsICZuYnNwOyZuYnNwOyZuYnNwOyZuYnNwOyZuYnNwOyZuYnNwO1wiICsgX01hdGguZml4KHRoaXMudG90YWxUaW1lKSArIFwiIHwgXCIgKyBfTWF0aC5maXgodGhpcy5NYXhUb3RhbFRpbWUpICsgXCI8YnI+XCIsXG4gICAgICAgIFwidXBkYXRpbmcgJm5ic3A7Jm5ic3A7Jm5ic3A7XCIgKyBfTWF0aC5maXgodGhpcy51cGRhdGVUaW1lKSArIFwiIHwgXCIgKyBfTWF0aC5maXgodGhpcy5NYXhVcGRhdGVUaW1lKSArIFwiPGJyPlwiXG4gICAgICBdLmpvaW4oXCJcXG5cIik7XG4gICAgICByZXR1cm4gaW5mbztcbiAgICB9LFxuXG4gICAgdG9BcnJheTogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5pbmZvc1swXSA9IHRoaXMucGFyZW50LmJyb2FkUGhhc2UudHlwZXM7XG4gICAgICB0aGlzLmluZm9zWzFdID0gdGhpcy5wYXJlbnQubnVtUmlnaWRCb2RpZXM7XG4gICAgICB0aGlzLmluZm9zWzJdID0gdGhpcy5wYXJlbnQubnVtQ29udGFjdHM7XG4gICAgICB0aGlzLmluZm9zWzNdID0gdGhpcy5wYXJlbnQuYnJvYWRQaGFzZS5udW1QYWlyQ2hlY2tzO1xuICAgICAgdGhpcy5pbmZvc1s0XSA9IHRoaXMucGFyZW50Lm51bUNvbnRhY3RQb2ludHM7XG4gICAgICB0aGlzLmluZm9zWzVdID0gdGhpcy5wYXJlbnQubnVtSXNsYW5kcztcbiAgICAgIHRoaXMuaW5mb3NbNl0gPSB0aGlzLmJyb2FkUGhhc2VUaW1lO1xuICAgICAgdGhpcy5pbmZvc1s3XSA9IHRoaXMubmFycm93UGhhc2VUaW1lO1xuICAgICAgdGhpcy5pbmZvc1s4XSA9IHRoaXMuc29sdmluZ1RpbWU7XG4gICAgICB0aGlzLmluZm9zWzldID0gdGhpcy51cGRhdGVUaW1lO1xuICAgICAgdGhpcy5pbmZvc1sxMF0gPSB0aGlzLnRvdGFsVGltZTtcbiAgICAgIHRoaXMuaW5mb3NbMTFdID0gdGhpcy5mcHM7XG4gICAgICByZXR1cm4gdGhpcy5pbmZvcztcbiAgICB9XG5cbiAgfSk7XG5cbiAgZnVuY3Rpb24gVmVjMyh4LCB5LCB6KSB7XG5cbiAgICB0aGlzLnggPSB4IHx8IDA7XG4gICAgdGhpcy55ID0geSB8fCAwO1xuICAgIHRoaXMueiA9IHogfHwgMDtcblxuICB9XG5cbiAgT2JqZWN0LmFzc2lnbihWZWMzLnByb3RvdHlwZSwge1xuXG4gICAgVmVjMzogdHJ1ZSxcblxuICAgIHNldDogZnVuY3Rpb24gKHgsIHksIHopIHtcblxuICAgICAgdGhpcy54ID0geDtcbiAgICAgIHRoaXMueSA9IHk7XG4gICAgICB0aGlzLnogPSB6O1xuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICB9LFxuXG4gICAgYWRkOiBmdW5jdGlvbiAoYSwgYikge1xuXG4gICAgICBpZiAoYiAhPT0gdW5kZWZpbmVkKSByZXR1cm4gdGhpcy5hZGRWZWN0b3JzKGEsIGIpO1xuXG4gICAgICB0aGlzLnggKz0gYS54O1xuICAgICAgdGhpcy55ICs9IGEueTtcbiAgICAgIHRoaXMueiArPSBhLno7XG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIH0sXG5cbiAgICBhZGRWZWN0b3JzOiBmdW5jdGlvbiAoYSwgYikge1xuXG4gICAgICB0aGlzLnggPSBhLnggKyBiLng7XG4gICAgICB0aGlzLnkgPSBhLnkgKyBiLnk7XG4gICAgICB0aGlzLnogPSBhLnogKyBiLno7XG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIH0sXG5cbiAgICBhZGRFcXVhbDogZnVuY3Rpb24gKHYpIHtcblxuICAgICAgdGhpcy54ICs9IHYueDtcbiAgICAgIHRoaXMueSArPSB2Lnk7XG4gICAgICB0aGlzLnogKz0gdi56O1xuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICB9LFxuXG4gICAgc3ViOiBmdW5jdGlvbiAoYSwgYikge1xuXG4gICAgICBpZiAoYiAhPT0gdW5kZWZpbmVkKSByZXR1cm4gdGhpcy5zdWJWZWN0b3JzKGEsIGIpO1xuXG4gICAgICB0aGlzLnggLT0gYS54O1xuICAgICAgdGhpcy55IC09IGEueTtcbiAgICAgIHRoaXMueiAtPSBhLno7XG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIH0sXG5cbiAgICBzdWJWZWN0b3JzOiBmdW5jdGlvbiAoYSwgYikge1xuXG4gICAgICB0aGlzLnggPSBhLnggLSBiLng7XG4gICAgICB0aGlzLnkgPSBhLnkgLSBiLnk7XG4gICAgICB0aGlzLnogPSBhLnogLSBiLno7XG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIH0sXG5cbiAgICBzdWJFcXVhbDogZnVuY3Rpb24gKHYpIHtcblxuICAgICAgdGhpcy54IC09IHYueDtcbiAgICAgIHRoaXMueSAtPSB2Lnk7XG4gICAgICB0aGlzLnogLT0gdi56O1xuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICB9LFxuXG4gICAgc2NhbGU6IGZ1bmN0aW9uICh2LCBzKSB7XG5cbiAgICAgIHRoaXMueCA9IHYueCAqIHM7XG4gICAgICB0aGlzLnkgPSB2LnkgKiBzO1xuICAgICAgdGhpcy56ID0gdi56ICogcztcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfSxcblxuICAgIHNjYWxlRXF1YWw6IGZ1bmN0aW9uIChzKSB7XG5cbiAgICAgIHRoaXMueCAqPSBzO1xuICAgICAgdGhpcy55ICo9IHM7XG4gICAgICB0aGlzLnogKj0gcztcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfSxcblxuICAgIG11bHRpcGx5OiBmdW5jdGlvbiAodikge1xuXG4gICAgICB0aGlzLnggKj0gdi54O1xuICAgICAgdGhpcy55ICo9IHYueTtcbiAgICAgIHRoaXMueiAqPSB2Lno7XG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIH0sXG5cbiAgICAvKnNjYWxlVjogZnVuY3Rpb24oIHYgKXtcblxuICAgICAgICB0aGlzLnggKj0gdi54O1xuICAgICAgICB0aGlzLnkgKj0gdi55O1xuICAgICAgICB0aGlzLnogKj0gdi56O1xuICAgICAgICByZXR1cm4gdGhpcztcblxuICAgIH0sXG5cbiAgICBzY2FsZVZlY3RvckVxdWFsOiBmdW5jdGlvbiggdiApe1xuXG4gICAgICAgIHRoaXMueCAqPSB2Lng7XG4gICAgICAgIHRoaXMueSAqPSB2Lnk7XG4gICAgICAgIHRoaXMueiAqPSB2Lno7XG4gICAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfSwqL1xuXG4gICAgYWRkU2NhbGVkVmVjdG9yOiBmdW5jdGlvbiAodiwgcykge1xuXG4gICAgICB0aGlzLnggKz0gdi54ICogcztcbiAgICAgIHRoaXMueSArPSB2LnkgKiBzO1xuICAgICAgdGhpcy56ICs9IHYueiAqIHM7XG5cbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfSxcblxuICAgIHN1YlNjYWxlZFZlY3RvcjogZnVuY3Rpb24gKHYsIHMpIHtcblxuICAgICAgdGhpcy54IC09IHYueCAqIHM7XG4gICAgICB0aGlzLnkgLT0gdi55ICogcztcbiAgICAgIHRoaXMueiAtPSB2LnogKiBzO1xuXG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIH0sXG5cbiAgICAvKmFkZFRpbWU6IGZ1bmN0aW9uICggdiwgdCApIHtcblxuICAgICAgICB0aGlzLnggKz0gdi54ICogdDtcbiAgICAgICAgdGhpcy55ICs9IHYueSAqIHQ7XG4gICAgICAgIHRoaXMueiArPSB2LnogKiB0O1xuICAgICAgICByZXR1cm4gdGhpcztcblxuICAgIH0sXG4gICAgXG4gICAgYWRkU2NhbGU6IGZ1bmN0aW9uICggdiwgcyApIHtcblxuICAgICAgICB0aGlzLnggKz0gdi54ICogcztcbiAgICAgICAgdGhpcy55ICs9IHYueSAqIHM7XG4gICAgICAgIHRoaXMueiArPSB2LnogKiBzO1xuICAgICAgICByZXR1cm4gdGhpcztcblxuICAgIH0sXG5cbiAgICBzdWJTY2FsZTogZnVuY3Rpb24gKCB2LCBzICkge1xuXG4gICAgICAgIHRoaXMueCAtPSB2LnggKiBzO1xuICAgICAgICB0aGlzLnkgLT0gdi55ICogcztcbiAgICAgICAgdGhpcy56IC09IHYueiAqIHM7XG4gICAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfSwqL1xuXG4gICAgY3Jvc3M6IGZ1bmN0aW9uIChhLCBiKSB7XG5cbiAgICAgIGlmIChiICE9PSB1bmRlZmluZWQpIHJldHVybiB0aGlzLmNyb3NzVmVjdG9ycyhhLCBiKTtcblxuICAgICAgdmFyIHggPSB0aGlzLngsIHkgPSB0aGlzLnksIHogPSB0aGlzLno7XG5cbiAgICAgIHRoaXMueCA9IHkgKiBhLnogLSB6ICogYS55O1xuICAgICAgdGhpcy55ID0geiAqIGEueCAtIHggKiBhLno7XG4gICAgICB0aGlzLnogPSB4ICogYS55IC0geSAqIGEueDtcblxuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICB9LFxuXG4gICAgY3Jvc3NWZWN0b3JzOiBmdW5jdGlvbiAoYSwgYikge1xuXG4gICAgICB2YXIgYXggPSBhLngsIGF5ID0gYS55LCBheiA9IGEuejtcbiAgICAgIHZhciBieCA9IGIueCwgYnkgPSBiLnksIGJ6ID0gYi56O1xuXG4gICAgICB0aGlzLnggPSBheSAqIGJ6IC0gYXogKiBieTtcbiAgICAgIHRoaXMueSA9IGF6ICogYnggLSBheCAqIGJ6O1xuICAgICAgdGhpcy56ID0gYXggKiBieSAtIGF5ICogYng7XG5cbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfSxcblxuICAgIHRhbmdlbnQ6IGZ1bmN0aW9uIChhKSB7XG5cbiAgICAgIHZhciBheCA9IGEueCwgYXkgPSBhLnksIGF6ID0gYS56O1xuXG4gICAgICB0aGlzLnggPSBheSAqIGF4IC0gYXogKiBhejtcbiAgICAgIHRoaXMueSA9IC0gYXogKiBheSAtIGF4ICogYXg7XG4gICAgICB0aGlzLnogPSBheCAqIGF6ICsgYXkgKiBheTtcblxuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICB9LFxuXG5cblxuXG5cbiAgICBpbnZlcnQ6IGZ1bmN0aW9uICh2KSB7XG5cbiAgICAgIHRoaXMueCA9IC12Lng7XG4gICAgICB0aGlzLnkgPSAtdi55O1xuICAgICAgdGhpcy56ID0gLXYuejtcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfSxcblxuICAgIG5lZ2F0ZTogZnVuY3Rpb24gKCkge1xuXG4gICAgICB0aGlzLnggPSAtIHRoaXMueDtcbiAgICAgIHRoaXMueSA9IC0gdGhpcy55O1xuICAgICAgdGhpcy56ID0gLSB0aGlzLno7XG5cbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfSxcblxuICAgIGRvdDogZnVuY3Rpb24gKHYpIHtcblxuICAgICAgcmV0dXJuIHRoaXMueCAqIHYueCArIHRoaXMueSAqIHYueSArIHRoaXMueiAqIHYuejtcblxuICAgIH0sXG5cbiAgICBhZGRpdGlvbjogZnVuY3Rpb24gKCkge1xuXG4gICAgICByZXR1cm4gdGhpcy54ICsgdGhpcy55ICsgdGhpcy56O1xuXG4gICAgfSxcblxuICAgIGxlbmd0aFNxOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHJldHVybiB0aGlzLnggKiB0aGlzLnggKyB0aGlzLnkgKiB0aGlzLnkgKyB0aGlzLnogKiB0aGlzLno7XG5cbiAgICB9LFxuXG4gICAgbGVuZ3RoOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHJldHVybiBfTWF0aC5zcXJ0KHRoaXMueCAqIHRoaXMueCArIHRoaXMueSAqIHRoaXMueSArIHRoaXMueiAqIHRoaXMueik7XG5cbiAgICB9LFxuXG4gICAgY29weTogZnVuY3Rpb24gKHYpIHtcblxuICAgICAgdGhpcy54ID0gdi54O1xuICAgICAgdGhpcy55ID0gdi55O1xuICAgICAgdGhpcy56ID0gdi56O1xuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICB9LFxuXG4gICAgLyptdWw6IGZ1bmN0aW9uKCBiLCBhLCBtICl7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMubXVsTWF0KCBtLCBhICkuYWRkKCBiICk7XG5cbiAgICB9LFxuXG4gICAgbXVsTWF0OiBmdW5jdGlvbiggbSwgYSApe1xuXG4gICAgICAgIHZhciBlID0gbS5lbGVtZW50cztcbiAgICAgICAgdmFyIHggPSBhLngsIHkgPSBhLnksIHogPSBhLno7XG5cbiAgICAgICAgdGhpcy54ID0gZVsgMCBdICogeCArIGVbIDEgXSAqIHkgKyBlWyAyIF0gKiB6O1xuICAgICAgICB0aGlzLnkgPSBlWyAzIF0gKiB4ICsgZVsgNCBdICogeSArIGVbIDUgXSAqIHo7XG4gICAgICAgIHRoaXMueiA9IGVbIDYgXSAqIHggKyBlWyA3IF0gKiB5ICsgZVsgOCBdICogejtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICB9LCovXG5cbiAgICBhcHBseU1hdHJpeDM6IGZ1bmN0aW9uIChtLCB0cmFuc3Bvc2UpIHtcblxuICAgICAgLy9pZiggdHJhbnNwb3NlICkgbSA9IG0uY2xvbmUoKS50cmFuc3Bvc2UoKTtcbiAgICAgIHZhciB4ID0gdGhpcy54LCB5ID0gdGhpcy55LCB6ID0gdGhpcy56O1xuICAgICAgdmFyIGUgPSBtLmVsZW1lbnRzO1xuXG4gICAgICBpZiAodHJhbnNwb3NlKSB7XG5cbiAgICAgICAgdGhpcy54ID0gZVswXSAqIHggKyBlWzFdICogeSArIGVbMl0gKiB6O1xuICAgICAgICB0aGlzLnkgPSBlWzNdICogeCArIGVbNF0gKiB5ICsgZVs1XSAqIHo7XG4gICAgICAgIHRoaXMueiA9IGVbNl0gKiB4ICsgZVs3XSAqIHkgKyBlWzhdICogejtcblxuICAgICAgfSBlbHNlIHtcblxuICAgICAgICB0aGlzLnggPSBlWzBdICogeCArIGVbM10gKiB5ICsgZVs2XSAqIHo7XG4gICAgICAgIHRoaXMueSA9IGVbMV0gKiB4ICsgZVs0XSAqIHkgKyBlWzddICogejtcbiAgICAgICAgdGhpcy56ID0gZVsyXSAqIHggKyBlWzVdICogeSArIGVbOF0gKiB6O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIH0sXG5cbiAgICBhcHBseVF1YXRlcm5pb246IGZ1bmN0aW9uIChxKSB7XG5cbiAgICAgIHZhciB4ID0gdGhpcy54O1xuICAgICAgdmFyIHkgPSB0aGlzLnk7XG4gICAgICB2YXIgeiA9IHRoaXMuejtcblxuICAgICAgdmFyIHF4ID0gcS54O1xuICAgICAgdmFyIHF5ID0gcS55O1xuICAgICAgdmFyIHF6ID0gcS56O1xuICAgICAgdmFyIHF3ID0gcS53O1xuXG4gICAgICAvLyBjYWxjdWxhdGUgcXVhdCAqIHZlY3RvclxuXG4gICAgICB2YXIgaXggPSBxdyAqIHggKyBxeSAqIHogLSBxeiAqIHk7XG4gICAgICB2YXIgaXkgPSBxdyAqIHkgKyBxeiAqIHggLSBxeCAqIHo7XG4gICAgICB2YXIgaXogPSBxdyAqIHogKyBxeCAqIHkgLSBxeSAqIHg7XG4gICAgICB2YXIgaXcgPSAtIHF4ICogeCAtIHF5ICogeSAtIHF6ICogejtcblxuICAgICAgLy8gY2FsY3VsYXRlIHJlc3VsdCAqIGludmVyc2UgcXVhdFxuXG4gICAgICB0aGlzLnggPSBpeCAqIHF3ICsgaXcgKiAtIHF4ICsgaXkgKiAtIHF6IC0gaXogKiAtIHF5O1xuICAgICAgdGhpcy55ID0gaXkgKiBxdyArIGl3ICogLSBxeSArIGl6ICogLSBxeCAtIGl4ICogLSBxejtcbiAgICAgIHRoaXMueiA9IGl6ICogcXcgKyBpdyAqIC0gcXogKyBpeCAqIC0gcXkgLSBpeSAqIC0gcXg7XG5cbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfSxcblxuICAgIHRlc3RaZXJvOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIGlmICh0aGlzLnggIT09IDAgfHwgdGhpcy55ICE9PSAwIHx8IHRoaXMueiAhPT0gMCkgcmV0dXJuIHRydWU7XG4gICAgICBlbHNlIHJldHVybiBmYWxzZTtcblxuICAgIH0sXG5cbiAgICB0ZXN0RGlmZjogZnVuY3Rpb24gKHYpIHtcblxuICAgICAgcmV0dXJuIHRoaXMuZXF1YWxzKHYpID8gZmFsc2UgOiB0cnVlO1xuXG4gICAgfSxcblxuICAgIGVxdWFsczogZnVuY3Rpb24gKHYpIHtcblxuICAgICAgcmV0dXJuIHYueCA9PT0gdGhpcy54ICYmIHYueSA9PT0gdGhpcy55ICYmIHYueiA9PT0gdGhpcy56O1xuXG4gICAgfSxcblxuICAgIGNsb25lOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHJldHVybiBuZXcgdGhpcy5jb25zdHJ1Y3Rvcih0aGlzLngsIHRoaXMueSwgdGhpcy56KTtcblxuICAgIH0sXG5cbiAgICB0b1N0cmluZzogZnVuY3Rpb24gKCkge1xuXG4gICAgICByZXR1cm4gXCJWZWMzW1wiICsgdGhpcy54LnRvRml4ZWQoNCkgKyBcIiwgXCIgKyB0aGlzLnkudG9GaXhlZCg0KSArIFwiLCBcIiArIHRoaXMuei50b0ZpeGVkKDQpICsgXCJdXCI7XG5cbiAgICB9LFxuXG4gICAgbXVsdGlwbHlTY2FsYXI6IGZ1bmN0aW9uIChzY2FsYXIpIHtcblxuICAgICAgaWYgKGlzRmluaXRlKHNjYWxhcikpIHtcbiAgICAgICAgdGhpcy54ICo9IHNjYWxhcjtcbiAgICAgICAgdGhpcy55ICo9IHNjYWxhcjtcbiAgICAgICAgdGhpcy56ICo9IHNjYWxhcjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMueCA9IDA7XG4gICAgICAgIHRoaXMueSA9IDA7XG4gICAgICAgIHRoaXMueiA9IDA7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfSxcblxuICAgIGRpdmlkZVNjYWxhcjogZnVuY3Rpb24gKHNjYWxhcikge1xuXG4gICAgICByZXR1cm4gdGhpcy5tdWx0aXBseVNjYWxhcigxIC8gc2NhbGFyKTtcblxuICAgIH0sXG5cbiAgICBub3JtYWxpemU6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgcmV0dXJuIHRoaXMuZGl2aWRlU2NhbGFyKHRoaXMubGVuZ3RoKCkpO1xuXG4gICAgfSxcblxuICAgIHRvQXJyYXk6IGZ1bmN0aW9uIChhcnJheSwgb2Zmc2V0KSB7XG5cbiAgICAgIGlmIChvZmZzZXQgPT09IHVuZGVmaW5lZCkgb2Zmc2V0ID0gMDtcblxuICAgICAgYXJyYXlbb2Zmc2V0XSA9IHRoaXMueDtcbiAgICAgIGFycmF5W29mZnNldCArIDFdID0gdGhpcy55O1xuICAgICAgYXJyYXlbb2Zmc2V0ICsgMl0gPSB0aGlzLno7XG5cbiAgICB9LFxuXG4gICAgZnJvbUFycmF5OiBmdW5jdGlvbiAoYXJyYXksIG9mZnNldCkge1xuXG4gICAgICBpZiAob2Zmc2V0ID09PSB1bmRlZmluZWQpIG9mZnNldCA9IDA7XG5cbiAgICAgIHRoaXMueCA9IGFycmF5W29mZnNldF07XG4gICAgICB0aGlzLnkgPSBhcnJheVtvZmZzZXQgKyAxXTtcbiAgICAgIHRoaXMueiA9IGFycmF5W29mZnNldCArIDJdO1xuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICB9LFxuXG5cbiAgfSk7XG5cbiAgZnVuY3Rpb24gUXVhdCh4LCB5LCB6LCB3KSB7XG5cbiAgICB0aGlzLnggPSB4IHx8IDA7XG4gICAgdGhpcy55ID0geSB8fCAwO1xuICAgIHRoaXMueiA9IHogfHwgMDtcbiAgICB0aGlzLncgPSAodyAhPT0gdW5kZWZpbmVkKSA/IHcgOiAxO1xuXG4gIH1cblxuICBPYmplY3QuYXNzaWduKFF1YXQucHJvdG90eXBlLCB7XG5cbiAgICBRdWF0OiB0cnVlLFxuXG4gICAgc2V0OiBmdW5jdGlvbiAoeCwgeSwgeiwgdykge1xuXG5cbiAgICAgIHRoaXMueCA9IHg7XG4gICAgICB0aGlzLnkgPSB5O1xuICAgICAgdGhpcy56ID0gejtcbiAgICAgIHRoaXMudyA9IHc7XG5cbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfSxcblxuICAgIGFkZFRpbWU6IGZ1bmN0aW9uICh2LCB0KSB7XG5cbiAgICAgIHZhciBheCA9IHYueCwgYXkgPSB2LnksIGF6ID0gdi56O1xuICAgICAgdmFyIHF3ID0gdGhpcy53LCBxeCA9IHRoaXMueCwgcXkgPSB0aGlzLnksIHF6ID0gdGhpcy56O1xuICAgICAgdCAqPSAwLjU7XG4gICAgICB0aGlzLnggKz0gdCAqIChheCAqIHF3ICsgYXkgKiBxeiAtIGF6ICogcXkpO1xuICAgICAgdGhpcy55ICs9IHQgKiAoYXkgKiBxdyArIGF6ICogcXggLSBheCAqIHF6KTtcbiAgICAgIHRoaXMueiArPSB0ICogKGF6ICogcXcgKyBheCAqIHF5IC0gYXkgKiBxeCk7XG4gICAgICB0aGlzLncgKz0gdCAqICgtYXggKiBxeCAtIGF5ICogcXkgLSBheiAqIHF6KTtcbiAgICAgIHRoaXMubm9ybWFsaXplKCk7XG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIH0sXG5cbiAgICAvKm11bDogZnVuY3Rpb24oIHExLCBxMiApe1xuXG4gICAgICAgIHZhciBheCA9IHExLngsIGF5ID0gcTEueSwgYXogPSBxMS56LCBhcyA9IHExLncsXG4gICAgICAgIGJ4ID0gcTIueCwgYnkgPSBxMi55LCBieiA9IHEyLnosIGJzID0gcTIudztcbiAgICAgICAgdGhpcy54ID0gYXggKiBicyArIGFzICogYnggKyBheSAqIGJ6IC0gYXogKiBieTtcbiAgICAgICAgdGhpcy55ID0gYXkgKiBicyArIGFzICogYnkgKyBheiAqIGJ4IC0gYXggKiBiejtcbiAgICAgICAgdGhpcy56ID0gYXogKiBicyArIGFzICogYnogKyBheCAqIGJ5IC0gYXkgKiBieDtcbiAgICAgICAgdGhpcy53ID0gYXMgKiBicyAtIGF4ICogYnggLSBheSAqIGJ5IC0gYXogKiBiejtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICB9LCovXG5cbiAgICBtdWx0aXBseTogZnVuY3Rpb24gKHEsIHApIHtcblxuICAgICAgaWYgKHAgIT09IHVuZGVmaW5lZCkgcmV0dXJuIHRoaXMubXVsdGlwbHlRdWF0ZXJuaW9ucyhxLCBwKTtcbiAgICAgIHJldHVybiB0aGlzLm11bHRpcGx5UXVhdGVybmlvbnModGhpcywgcSk7XG5cbiAgICB9LFxuXG4gICAgbXVsdGlwbHlRdWF0ZXJuaW9uczogZnVuY3Rpb24gKGEsIGIpIHtcblxuICAgICAgdmFyIHFheCA9IGEueCwgcWF5ID0gYS55LCBxYXogPSBhLnosIHFhdyA9IGEudztcbiAgICAgIHZhciBxYnggPSBiLngsIHFieSA9IGIueSwgcWJ6ID0gYi56LCBxYncgPSBiLnc7XG5cbiAgICAgIHRoaXMueCA9IHFheCAqIHFidyArIHFhdyAqIHFieCArIHFheSAqIHFieiAtIHFheiAqIHFieTtcbiAgICAgIHRoaXMueSA9IHFheSAqIHFidyArIHFhdyAqIHFieSArIHFheiAqIHFieCAtIHFheCAqIHFiejtcbiAgICAgIHRoaXMueiA9IHFheiAqIHFidyArIHFhdyAqIHFieiArIHFheCAqIHFieSAtIHFheSAqIHFieDtcbiAgICAgIHRoaXMudyA9IHFhdyAqIHFidyAtIHFheCAqIHFieCAtIHFheSAqIHFieSAtIHFheiAqIHFiejtcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfSxcblxuICAgIHNldEZyb21Vbml0VmVjdG9yczogZnVuY3Rpb24gKHYxLCB2Mikge1xuXG4gICAgICB2YXIgdnggPSBuZXcgVmVjMygpO1xuICAgICAgdmFyIHIgPSB2MS5kb3QodjIpICsgMTtcblxuICAgICAgaWYgKHIgPCBfTWF0aC5FUFMyKSB7XG5cbiAgICAgICAgciA9IDA7XG4gICAgICAgIGlmIChfTWF0aC5hYnModjEueCkgPiBfTWF0aC5hYnModjEueikpIHZ4LnNldCgtIHYxLnksIHYxLngsIDApO1xuICAgICAgICBlbHNlIHZ4LnNldCgwLCAtIHYxLnosIHYxLnkpO1xuXG4gICAgICB9IGVsc2Uge1xuXG4gICAgICAgIHZ4LmNyb3NzVmVjdG9ycyh2MSwgdjIpO1xuXG4gICAgICB9XG5cbiAgICAgIHRoaXMuX3ggPSB2eC54O1xuICAgICAgdGhpcy5feSA9IHZ4Lnk7XG4gICAgICB0aGlzLl96ID0gdnguejtcbiAgICAgIHRoaXMuX3cgPSByO1xuXG4gICAgICByZXR1cm4gdGhpcy5ub3JtYWxpemUoKTtcblxuICAgIH0sXG5cbiAgICBhcmM6IGZ1bmN0aW9uICh2MSwgdjIpIHtcblxuICAgICAgdmFyIHgxID0gdjEueDtcbiAgICAgIHZhciB5MSA9IHYxLnk7XG4gICAgICB2YXIgejEgPSB2MS56O1xuICAgICAgdmFyIHgyID0gdjIueDtcbiAgICAgIHZhciB5MiA9IHYyLnk7XG4gICAgICB2YXIgejIgPSB2Mi56O1xuICAgICAgdmFyIGQgPSB4MSAqIHgyICsgeTEgKiB5MiArIHoxICogejI7XG4gICAgICBpZiAoZCA9PSAtMSkge1xuICAgICAgICB4MiA9IHkxICogeDEgLSB6MSAqIHoxO1xuICAgICAgICB5MiA9IC16MSAqIHkxIC0geDEgKiB4MTtcbiAgICAgICAgejIgPSB4MSAqIHoxICsgeTEgKiB5MTtcbiAgICAgICAgZCA9IDEgLyBfTWF0aC5zcXJ0KHgyICogeDIgKyB5MiAqIHkyICsgejIgKiB6Mik7XG4gICAgICAgIHRoaXMudyA9IDA7XG4gICAgICAgIHRoaXMueCA9IHgyICogZDtcbiAgICAgICAgdGhpcy55ID0geTIgKiBkO1xuICAgICAgICB0aGlzLnogPSB6MiAqIGQ7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuICAgICAgdmFyIGN4ID0geTEgKiB6MiAtIHoxICogeTI7XG4gICAgICB2YXIgY3kgPSB6MSAqIHgyIC0geDEgKiB6MjtcbiAgICAgIHZhciBjeiA9IHgxICogeTIgLSB5MSAqIHgyO1xuICAgICAgdGhpcy53ID0gX01hdGguc3FydCgoMSArIGQpICogMC41KTtcbiAgICAgIGQgPSAwLjUgLyB0aGlzLnc7XG4gICAgICB0aGlzLnggPSBjeCAqIGQ7XG4gICAgICB0aGlzLnkgPSBjeSAqIGQ7XG4gICAgICB0aGlzLnogPSBjeiAqIGQ7XG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIH0sXG5cbiAgICBub3JtYWxpemU6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgdmFyIGwgPSB0aGlzLmxlbmd0aCgpO1xuICAgICAgaWYgKGwgPT09IDApIHtcbiAgICAgICAgdGhpcy5zZXQoMCwgMCwgMCwgMSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsID0gMSAvIGw7XG4gICAgICAgIHRoaXMueCA9IHRoaXMueCAqIGw7XG4gICAgICAgIHRoaXMueSA9IHRoaXMueSAqIGw7XG4gICAgICAgIHRoaXMueiA9IHRoaXMueiAqIGw7XG4gICAgICAgIHRoaXMudyA9IHRoaXMudyAqIGw7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIH0sXG5cbiAgICBpbnZlcnNlOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHJldHVybiB0aGlzLmNvbmp1Z2F0ZSgpLm5vcm1hbGl6ZSgpO1xuXG4gICAgfSxcblxuICAgIGludmVydDogZnVuY3Rpb24gKHEpIHtcblxuICAgICAgdGhpcy54ID0gcS54O1xuICAgICAgdGhpcy55ID0gcS55O1xuICAgICAgdGhpcy56ID0gcS56O1xuICAgICAgdGhpcy53ID0gcS53O1xuICAgICAgdGhpcy5jb25qdWdhdGUoKS5ub3JtYWxpemUoKTtcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfSxcblxuICAgIGNvbmp1Z2F0ZTogZnVuY3Rpb24gKCkge1xuXG4gICAgICB0aGlzLnggKj0gLSAxO1xuICAgICAgdGhpcy55ICo9IC0gMTtcbiAgICAgIHRoaXMueiAqPSAtIDE7XG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIH0sXG5cbiAgICBsZW5ndGg6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgcmV0dXJuIF9NYXRoLnNxcnQodGhpcy54ICogdGhpcy54ICsgdGhpcy55ICogdGhpcy55ICsgdGhpcy56ICogdGhpcy56ICsgdGhpcy53ICogdGhpcy53KTtcblxuICAgIH0sXG5cbiAgICBsZW5ndGhTcTogZnVuY3Rpb24gKCkge1xuXG4gICAgICByZXR1cm4gdGhpcy54ICogdGhpcy54ICsgdGhpcy55ICogdGhpcy55ICsgdGhpcy56ICogdGhpcy56ICsgdGhpcy53ICogdGhpcy53O1xuXG4gICAgfSxcblxuICAgIGNvcHk6IGZ1bmN0aW9uIChxKSB7XG5cbiAgICAgIHRoaXMueCA9IHEueDtcbiAgICAgIHRoaXMueSA9IHEueTtcbiAgICAgIHRoaXMueiA9IHEuejtcbiAgICAgIHRoaXMudyA9IHEudztcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfSxcblxuICAgIGNsb25lOiBmdW5jdGlvbiAocSkge1xuXG4gICAgICByZXR1cm4gbmV3IFF1YXQodGhpcy54LCB0aGlzLnksIHRoaXMueiwgdGhpcy53KTtcblxuICAgIH0sXG5cbiAgICB0ZXN0RGlmZjogZnVuY3Rpb24gKHEpIHtcblxuICAgICAgcmV0dXJuIHRoaXMuZXF1YWxzKHEpID8gZmFsc2UgOiB0cnVlO1xuXG4gICAgfSxcblxuICAgIGVxdWFsczogZnVuY3Rpb24gKHEpIHtcblxuICAgICAgcmV0dXJuIHRoaXMueCA9PT0gcS54ICYmIHRoaXMueSA9PT0gcS55ICYmIHRoaXMueiA9PT0gcS56ICYmIHRoaXMudyA9PT0gcS53O1xuXG4gICAgfSxcblxuICAgIHRvU3RyaW5nOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHJldHVybiBcIlF1YXRbXCIgKyB0aGlzLngudG9GaXhlZCg0KSArIFwiLCAoXCIgKyB0aGlzLnkudG9GaXhlZCg0KSArIFwiLCBcIiArIHRoaXMuei50b0ZpeGVkKDQpICsgXCIsIFwiICsgdGhpcy53LnRvRml4ZWQoNCkgKyBcIildXCI7XG5cbiAgICB9LFxuXG4gICAgc2V0RnJvbUV1bGVyOiBmdW5jdGlvbiAoeCwgeSwgeikge1xuXG4gICAgICB2YXIgYzEgPSBNYXRoLmNvcyh4ICogMC41KTtcbiAgICAgIHZhciBjMiA9IE1hdGguY29zKHkgKiAwLjUpO1xuICAgICAgdmFyIGMzID0gTWF0aC5jb3MoeiAqIDAuNSk7XG4gICAgICB2YXIgczEgPSBNYXRoLnNpbih4ICogMC41KTtcbiAgICAgIHZhciBzMiA9IE1hdGguc2luKHkgKiAwLjUpO1xuICAgICAgdmFyIHMzID0gTWF0aC5zaW4oeiAqIDAuNSk7XG5cbiAgICAgIC8vIFhZWlxuICAgICAgdGhpcy54ID0gczEgKiBjMiAqIGMzICsgYzEgKiBzMiAqIHMzO1xuICAgICAgdGhpcy55ID0gYzEgKiBzMiAqIGMzIC0gczEgKiBjMiAqIHMzO1xuICAgICAgdGhpcy56ID0gYzEgKiBjMiAqIHMzICsgczEgKiBzMiAqIGMzO1xuICAgICAgdGhpcy53ID0gYzEgKiBjMiAqIGMzIC0gczEgKiBzMiAqIHMzO1xuXG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIH0sXG5cbiAgICBzZXRGcm9tQXhpczogZnVuY3Rpb24gKGF4aXMsIHJhZCkge1xuXG4gICAgICBheGlzLm5vcm1hbGl6ZSgpO1xuICAgICAgcmFkID0gcmFkICogMC41O1xuICAgICAgdmFyIHMgPSBfTWF0aC5zaW4ocmFkKTtcbiAgICAgIHRoaXMueCA9IHMgKiBheGlzLng7XG4gICAgICB0aGlzLnkgPSBzICogYXhpcy55O1xuICAgICAgdGhpcy56ID0gcyAqIGF4aXMuejtcbiAgICAgIHRoaXMudyA9IF9NYXRoLmNvcyhyYWQpO1xuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICB9LFxuXG4gICAgc2V0RnJvbU1hdDMzOiBmdW5jdGlvbiAobSkge1xuXG4gICAgICB2YXIgdHJhY2UgPSBtWzBdICsgbVs0XSArIG1bOF07XG4gICAgICB2YXIgcztcblxuICAgICAgaWYgKHRyYWNlID4gMCkge1xuXG4gICAgICAgIHMgPSBfTWF0aC5zcXJ0KHRyYWNlICsgMS4wKTtcbiAgICAgICAgdGhpcy53ID0gMC41IC8gcztcbiAgICAgICAgcyA9IDAuNSAvIHM7XG4gICAgICAgIHRoaXMueCA9IChtWzVdIC0gbVs3XSkgKiBzO1xuICAgICAgICB0aGlzLnkgPSAobVs2XSAtIG1bMl0pICogcztcbiAgICAgICAgdGhpcy56ID0gKG1bMV0gLSBtWzNdKSAqIHM7XG5cbiAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgdmFyIG91dCA9IFtdO1xuICAgICAgICB2YXIgaSA9IDA7XG4gICAgICAgIGlmIChtWzRdID4gbVswXSkgaSA9IDE7XG4gICAgICAgIGlmIChtWzhdID4gbVtpICogMyArIGldKSBpID0gMjtcblxuICAgICAgICB2YXIgaiA9IChpICsgMSkgJSAzO1xuICAgICAgICB2YXIgayA9IChpICsgMikgJSAzO1xuXG4gICAgICAgIHMgPSBfTWF0aC5zcXJ0KG1baSAqIDMgKyBpXSAtIG1baiAqIDMgKyBqXSAtIG1bayAqIDMgKyBrXSArIDEuMCk7XG4gICAgICAgIG91dFtpXSA9IDAuNSAqIGZSb290O1xuICAgICAgICBzID0gMC41IC8gZlJvb3Q7XG4gICAgICAgIHRoaXMudyA9IChtW2ogKiAzICsga10gLSBtW2sgKiAzICsgal0pICogcztcbiAgICAgICAgb3V0W2pdID0gKG1baiAqIDMgKyBpXSArIG1baSAqIDMgKyBqXSkgKiBzO1xuICAgICAgICBvdXRba10gPSAobVtrICogMyArIGldICsgbVtpICogMyArIGtdKSAqIHM7XG5cbiAgICAgICAgdGhpcy54ID0gb3V0WzFdO1xuICAgICAgICB0aGlzLnkgPSBvdXRbMl07XG4gICAgICAgIHRoaXMueiA9IG91dFszXTtcblxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIH0sXG5cbiAgICB0b0FycmF5OiBmdW5jdGlvbiAoYXJyYXksIG9mZnNldCkge1xuXG4gICAgICBvZmZzZXQgPSBvZmZzZXQgfHwgMDtcblxuICAgICAgYXJyYXlbb2Zmc2V0XSA9IHRoaXMueDtcbiAgICAgIGFycmF5W29mZnNldCArIDFdID0gdGhpcy55O1xuICAgICAgYXJyYXlbb2Zmc2V0ICsgMl0gPSB0aGlzLno7XG4gICAgICBhcnJheVtvZmZzZXQgKyAzXSA9IHRoaXMudztcblxuICAgIH0sXG5cbiAgICBmcm9tQXJyYXk6IGZ1bmN0aW9uIChhcnJheSwgb2Zmc2V0KSB7XG5cbiAgICAgIG9mZnNldCA9IG9mZnNldCB8fCAwO1xuICAgICAgdGhpcy5zZXQoYXJyYXlbb2Zmc2V0XSwgYXJyYXlbb2Zmc2V0ICsgMV0sIGFycmF5W29mZnNldCArIDJdLCBhcnJheVtvZmZzZXQgKyAzXSk7XG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIH1cblxuICB9KTtcblxuICBmdW5jdGlvbiBNYXQzMyhlMDAsIGUwMSwgZTAyLCBlMTAsIGUxMSwgZTEyLCBlMjAsIGUyMSwgZTIyKSB7XG5cbiAgICB0aGlzLmVsZW1lbnRzID0gW1xuICAgICAgMSwgMCwgMCxcbiAgICAgIDAsIDEsIDAsXG4gICAgICAwLCAwLCAxXG4gICAgXTtcblxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMCkge1xuXG4gICAgICBjb25zb2xlLmVycm9yKCdPSU1PLk1hdDMzOiB0aGUgY29uc3RydWN0b3Igbm8gbG9uZ2VyIHJlYWRzIGFyZ3VtZW50cy4gdXNlIC5zZXQoKSBpbnN0ZWFkLicpO1xuXG4gICAgfVxuXG4gIH1cblxuICBPYmplY3QuYXNzaWduKE1hdDMzLnByb3RvdHlwZSwge1xuXG4gICAgTWF0MzM6IHRydWUsXG5cbiAgICBzZXQ6IGZ1bmN0aW9uIChlMDAsIGUwMSwgZTAyLCBlMTAsIGUxMSwgZTEyLCBlMjAsIGUyMSwgZTIyKSB7XG5cbiAgICAgIHZhciB0ZSA9IHRoaXMuZWxlbWVudHM7XG4gICAgICB0ZVswXSA9IGUwMDsgdGVbMV0gPSBlMDE7IHRlWzJdID0gZTAyO1xuICAgICAgdGVbM10gPSBlMTA7IHRlWzRdID0gZTExOyB0ZVs1XSA9IGUxMjtcbiAgICAgIHRlWzZdID0gZTIwOyB0ZVs3XSA9IGUyMTsgdGVbOF0gPSBlMjI7XG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIH0sXG5cbiAgICBhZGQ6IGZ1bmN0aW9uIChhLCBiKSB7XG5cbiAgICAgIGlmIChiICE9PSB1bmRlZmluZWQpIHJldHVybiB0aGlzLmFkZE1hdHJpeHMoYSwgYik7XG5cbiAgICAgIHZhciBlID0gdGhpcy5lbGVtZW50cywgdGUgPSBhLmVsZW1lbnRzO1xuICAgICAgZVswXSArPSB0ZVswXTsgZVsxXSArPSB0ZVsxXTsgZVsyXSArPSB0ZVsyXTtcbiAgICAgIGVbM10gKz0gdGVbM107IGVbNF0gKz0gdGVbNF07IGVbNV0gKz0gdGVbNV07XG4gICAgICBlWzZdICs9IHRlWzZdOyBlWzddICs9IHRlWzddOyBlWzhdICs9IHRlWzhdO1xuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICB9LFxuXG4gICAgYWRkTWF0cml4czogZnVuY3Rpb24gKGEsIGIpIHtcblxuICAgICAgdmFyIHRlID0gdGhpcy5lbGVtZW50cywgdGVtMSA9IGEuZWxlbWVudHMsIHRlbTIgPSBiLmVsZW1lbnRzO1xuICAgICAgdGVbMF0gPSB0ZW0xWzBdICsgdGVtMlswXTsgdGVbMV0gPSB0ZW0xWzFdICsgdGVtMlsxXTsgdGVbMl0gPSB0ZW0xWzJdICsgdGVtMlsyXTtcbiAgICAgIHRlWzNdID0gdGVtMVszXSArIHRlbTJbM107IHRlWzRdID0gdGVtMVs0XSArIHRlbTJbNF07IHRlWzVdID0gdGVtMVs1XSArIHRlbTJbNV07XG4gICAgICB0ZVs2XSA9IHRlbTFbNl0gKyB0ZW0yWzZdOyB0ZVs3XSA9IHRlbTFbN10gKyB0ZW0yWzddOyB0ZVs4XSA9IHRlbTFbOF0gKyB0ZW0yWzhdO1xuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICB9LFxuXG4gICAgYWRkRXF1YWw6IGZ1bmN0aW9uIChtKSB7XG5cbiAgICAgIHZhciB0ZSA9IHRoaXMuZWxlbWVudHMsIHRlbSA9IG0uZWxlbWVudHM7XG4gICAgICB0ZVswXSArPSB0ZW1bMF07IHRlWzFdICs9IHRlbVsxXTsgdGVbMl0gKz0gdGVtWzJdO1xuICAgICAgdGVbM10gKz0gdGVtWzNdOyB0ZVs0XSArPSB0ZW1bNF07IHRlWzVdICs9IHRlbVs1XTtcbiAgICAgIHRlWzZdICs9IHRlbVs2XTsgdGVbN10gKz0gdGVtWzddOyB0ZVs4XSArPSB0ZW1bOF07XG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIH0sXG5cbiAgICBzdWI6IGZ1bmN0aW9uIChhLCBiKSB7XG5cbiAgICAgIGlmIChiICE9PSB1bmRlZmluZWQpIHJldHVybiB0aGlzLnN1Yk1hdHJpeHMoYSwgYik7XG5cbiAgICAgIHZhciBlID0gdGhpcy5lbGVtZW50cywgdGUgPSBhLmVsZW1lbnRzO1xuICAgICAgZVswXSAtPSB0ZVswXTsgZVsxXSAtPSB0ZVsxXTsgZVsyXSAtPSB0ZVsyXTtcbiAgICAgIGVbM10gLT0gdGVbM107IGVbNF0gLT0gdGVbNF07IGVbNV0gLT0gdGVbNV07XG4gICAgICBlWzZdIC09IHRlWzZdOyBlWzddIC09IHRlWzddOyBlWzhdIC09IHRlWzhdO1xuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICB9LFxuXG4gICAgc3ViTWF0cml4czogZnVuY3Rpb24gKGEsIGIpIHtcblxuICAgICAgdmFyIHRlID0gdGhpcy5lbGVtZW50cywgdGVtMSA9IGEuZWxlbWVudHMsIHRlbTIgPSBiLmVsZW1lbnRzO1xuICAgICAgdGVbMF0gPSB0ZW0xWzBdIC0gdGVtMlswXTsgdGVbMV0gPSB0ZW0xWzFdIC0gdGVtMlsxXTsgdGVbMl0gPSB0ZW0xWzJdIC0gdGVtMlsyXTtcbiAgICAgIHRlWzNdID0gdGVtMVszXSAtIHRlbTJbM107IHRlWzRdID0gdGVtMVs0XSAtIHRlbTJbNF07IHRlWzVdID0gdGVtMVs1XSAtIHRlbTJbNV07XG4gICAgICB0ZVs2XSA9IHRlbTFbNl0gLSB0ZW0yWzZdOyB0ZVs3XSA9IHRlbTFbN10gLSB0ZW0yWzddOyB0ZVs4XSA9IHRlbTFbOF0gLSB0ZW0yWzhdO1xuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICB9LFxuXG4gICAgc3ViRXF1YWw6IGZ1bmN0aW9uIChtKSB7XG5cbiAgICAgIHZhciB0ZSA9IHRoaXMuZWxlbWVudHMsIHRlbSA9IG0uZWxlbWVudHM7XG4gICAgICB0ZVswXSAtPSB0ZW1bMF07IHRlWzFdIC09IHRlbVsxXTsgdGVbMl0gLT0gdGVtWzJdO1xuICAgICAgdGVbM10gLT0gdGVtWzNdOyB0ZVs0XSAtPSB0ZW1bNF07IHRlWzVdIC09IHRlbVs1XTtcbiAgICAgIHRlWzZdIC09IHRlbVs2XTsgdGVbN10gLT0gdGVtWzddOyB0ZVs4XSAtPSB0ZW1bOF07XG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIH0sXG5cbiAgICBzY2FsZTogZnVuY3Rpb24gKG0sIHMpIHtcblxuICAgICAgdmFyIHRlID0gdGhpcy5lbGVtZW50cywgdG0gPSBtLmVsZW1lbnRzO1xuICAgICAgdGVbMF0gPSB0bVswXSAqIHM7IHRlWzFdID0gdG1bMV0gKiBzOyB0ZVsyXSA9IHRtWzJdICogcztcbiAgICAgIHRlWzNdID0gdG1bM10gKiBzOyB0ZVs0XSA9IHRtWzRdICogczsgdGVbNV0gPSB0bVs1XSAqIHM7XG4gICAgICB0ZVs2XSA9IHRtWzZdICogczsgdGVbN10gPSB0bVs3XSAqIHM7IHRlWzhdID0gdG1bOF0gKiBzO1xuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICB9LFxuXG4gICAgc2NhbGVFcXVhbDogZnVuY3Rpb24gKHMpIHsvLyBtdWx0aXBseVNjYWxhclxuXG4gICAgICB2YXIgdGUgPSB0aGlzLmVsZW1lbnRzO1xuICAgICAgdGVbMF0gKj0gczsgdGVbMV0gKj0gczsgdGVbMl0gKj0gcztcbiAgICAgIHRlWzNdICo9IHM7IHRlWzRdICo9IHM7IHRlWzVdICo9IHM7XG4gICAgICB0ZVs2XSAqPSBzOyB0ZVs3XSAqPSBzOyB0ZVs4XSAqPSBzO1xuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICB9LFxuXG4gICAgbXVsdGlwbHlNYXRyaWNlczogZnVuY3Rpb24gKG0xLCBtMiwgdHJhbnNwb3NlKSB7XG5cbiAgICAgIGlmICh0cmFuc3Bvc2UpIG0yID0gbTIuY2xvbmUoKS50cmFuc3Bvc2UoKTtcblxuICAgICAgdmFyIHRlID0gdGhpcy5lbGVtZW50cztcbiAgICAgIHZhciB0bTEgPSBtMS5lbGVtZW50cztcbiAgICAgIHZhciB0bTIgPSBtMi5lbGVtZW50cztcblxuICAgICAgdmFyIGEwID0gdG0xWzBdLCBhMyA9IHRtMVszXSwgYTYgPSB0bTFbNl07XG4gICAgICB2YXIgYTEgPSB0bTFbMV0sIGE0ID0gdG0xWzRdLCBhNyA9IHRtMVs3XTtcbiAgICAgIHZhciBhMiA9IHRtMVsyXSwgYTUgPSB0bTFbNV0sIGE4ID0gdG0xWzhdO1xuXG4gICAgICB2YXIgYjAgPSB0bTJbMF0sIGIzID0gdG0yWzNdLCBiNiA9IHRtMls2XTtcbiAgICAgIHZhciBiMSA9IHRtMlsxXSwgYjQgPSB0bTJbNF0sIGI3ID0gdG0yWzddO1xuICAgICAgdmFyIGIyID0gdG0yWzJdLCBiNSA9IHRtMls1XSwgYjggPSB0bTJbOF07XG5cbiAgICAgIHRlWzBdID0gYTAgKiBiMCArIGExICogYjMgKyBhMiAqIGI2O1xuICAgICAgdGVbMV0gPSBhMCAqIGIxICsgYTEgKiBiNCArIGEyICogYjc7XG4gICAgICB0ZVsyXSA9IGEwICogYjIgKyBhMSAqIGI1ICsgYTIgKiBiODtcbiAgICAgIHRlWzNdID0gYTMgKiBiMCArIGE0ICogYjMgKyBhNSAqIGI2O1xuICAgICAgdGVbNF0gPSBhMyAqIGIxICsgYTQgKiBiNCArIGE1ICogYjc7XG4gICAgICB0ZVs1XSA9IGEzICogYjIgKyBhNCAqIGI1ICsgYTUgKiBiODtcbiAgICAgIHRlWzZdID0gYTYgKiBiMCArIGE3ICogYjMgKyBhOCAqIGI2O1xuICAgICAgdGVbN10gPSBhNiAqIGIxICsgYTcgKiBiNCArIGE4ICogYjc7XG4gICAgICB0ZVs4XSA9IGE2ICogYjIgKyBhNyAqIGI1ICsgYTggKiBiODtcblxuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICB9LFxuXG4gICAgLyptdWw6IGZ1bmN0aW9uICggbTEsIG0yLCB0cmFuc3Bvc2UgKSB7XG5cbiAgICAgICAgaWYoIHRyYW5zcG9zZSApIG0yID0gbTIuY2xvbmUoKS50cmFuc3Bvc2UoKTtcblxuICAgICAgICB2YXIgdGUgPSB0aGlzLmVsZW1lbnRzO1xuICAgICAgICB2YXIgdG0xID0gbTEuZWxlbWVudHM7XG4gICAgICAgIHZhciB0bTIgPSBtMi5lbGVtZW50cztcbiAgICAgICAgLy92YXIgdG1wO1xuXG4gICAgICAgIHZhciBhMCA9IHRtMVswXSwgYTMgPSB0bTFbM10sIGE2ID0gdG0xWzZdO1xuICAgICAgICB2YXIgYTEgPSB0bTFbMV0sIGE0ID0gdG0xWzRdLCBhNyA9IHRtMVs3XTtcbiAgICAgICAgdmFyIGEyID0gdG0xWzJdLCBhNSA9IHRtMVs1XSwgYTggPSB0bTFbOF07XG5cbiAgICAgICAgdmFyIGIwID0gdG0yWzBdLCBiMyA9IHRtMlszXSwgYjYgPSB0bTJbNl07XG4gICAgICAgIHZhciBiMSA9IHRtMlsxXSwgYjQgPSB0bTJbNF0sIGI3ID0gdG0yWzddO1xuICAgICAgICB2YXIgYjIgPSB0bTJbMl0sIGI1ID0gdG0yWzVdLCBiOCA9IHRtMls4XTtcblxuICAgICAgICAvKmlmKCB0cmFuc3Bvc2UgKXtcblxuICAgICAgICAgICAgdG1wID0gYjE7IGIxID0gYjM7IGIzID0gdG1wO1xuICAgICAgICAgICAgdG1wID0gYjI7IGIyID0gYjY7IGI2ID0gdG1wO1xuICAgICAgICAgICAgdG1wID0gYjU7IGI1ID0gYjc7IGI3ID0gdG1wO1xuXG4gICAgICAgIH1cblxuICAgICAgICB0ZVswXSA9IGEwKmIwICsgYTEqYjMgKyBhMipiNjtcbiAgICAgICAgdGVbMV0gPSBhMCpiMSArIGExKmI0ICsgYTIqYjc7XG4gICAgICAgIHRlWzJdID0gYTAqYjIgKyBhMSpiNSArIGEyKmI4O1xuICAgICAgICB0ZVszXSA9IGEzKmIwICsgYTQqYjMgKyBhNSpiNjtcbiAgICAgICAgdGVbNF0gPSBhMypiMSArIGE0KmI0ICsgYTUqYjc7XG4gICAgICAgIHRlWzVdID0gYTMqYjIgKyBhNCpiNSArIGE1KmI4O1xuICAgICAgICB0ZVs2XSA9IGE2KmIwICsgYTcqYjMgKyBhOCpiNjtcbiAgICAgICAgdGVbN10gPSBhNipiMSArIGE3KmI0ICsgYTgqYjc7XG4gICAgICAgIHRlWzhdID0gYTYqYjIgKyBhNypiNSArIGE4KmI4O1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfSwqL1xuXG4gICAgdHJhbnNwb3NlOiBmdW5jdGlvbiAobSkge1xuXG4gICAgICBpZiAobSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHZhciBhID0gbS5lbGVtZW50cztcbiAgICAgICAgdGhpcy5zZXQoYVswXSwgYVszXSwgYVs2XSwgYVsxXSwgYVs0XSwgYVs3XSwgYVsyXSwgYVs1XSwgYVs4XSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuXG4gICAgICB2YXIgdGUgPSB0aGlzLmVsZW1lbnRzO1xuICAgICAgdmFyIGEwMSA9IHRlWzFdLCBhMDIgPSB0ZVsyXSwgYTEyID0gdGVbNV07XG4gICAgICB0ZVsxXSA9IHRlWzNdO1xuICAgICAgdGVbMl0gPSB0ZVs2XTtcbiAgICAgIHRlWzNdID0gYTAxO1xuICAgICAgdGVbNV0gPSB0ZVs3XTtcbiAgICAgIHRlWzZdID0gYTAyO1xuICAgICAgdGVbN10gPSBhMTI7XG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIH0sXG5cblxuXG4gICAgLyptdWxTY2FsZTogZnVuY3Rpb24gKCBtLCBzeCwgc3ksIHN6LCBQcmVwZW5kICkge1xuXG4gICAgICAgIHZhciBwcmVwZW5kID0gUHJlcGVuZCB8fCBmYWxzZTtcbiAgICAgICAgdmFyIHRlID0gdGhpcy5lbGVtZW50cywgdG0gPSBtLmVsZW1lbnRzO1xuICAgICAgICBpZihwcmVwZW5kKXtcbiAgICAgICAgICAgIHRlWzBdID0gc3gqdG1bMF07IHRlWzFdID0gc3gqdG1bMV07IHRlWzJdID0gc3gqdG1bMl07XG4gICAgICAgICAgICB0ZVszXSA9IHN5KnRtWzNdOyB0ZVs0XSA9IHN5KnRtWzRdOyB0ZVs1XSA9IHN5KnRtWzVdO1xuICAgICAgICAgICAgdGVbNl0gPSBzeip0bVs2XTsgdGVbN10gPSBzeip0bVs3XTsgdGVbOF0gPSBzeip0bVs4XTtcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICB0ZVswXSA9IHRtWzBdKnN4OyB0ZVsxXSA9IHRtWzFdKnN5OyB0ZVsyXSA9IHRtWzJdKnN6O1xuICAgICAgICAgICAgdGVbM10gPSB0bVszXSpzeDsgdGVbNF0gPSB0bVs0XSpzeTsgdGVbNV0gPSB0bVs1XSpzejtcbiAgICAgICAgICAgIHRlWzZdID0gdG1bNl0qc3g7IHRlWzddID0gdG1bN10qc3k7IHRlWzhdID0gdG1bOF0qc3o7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICB9LFxuXG4gICAgdHJhbnNwb3NlOiBmdW5jdGlvbiAoIG0gKSB7XG5cbiAgICAgICAgdmFyIHRlID0gdGhpcy5lbGVtZW50cywgdG0gPSBtLmVsZW1lbnRzO1xuICAgICAgICB0ZVswXSA9IHRtWzBdOyB0ZVsxXSA9IHRtWzNdOyB0ZVsyXSA9IHRtWzZdO1xuICAgICAgICB0ZVszXSA9IHRtWzFdOyB0ZVs0XSA9IHRtWzRdOyB0ZVs1XSA9IHRtWzddO1xuICAgICAgICB0ZVs2XSA9IHRtWzJdOyB0ZVs3XSA9IHRtWzVdOyB0ZVs4XSA9IHRtWzhdO1xuICAgICAgICByZXR1cm4gdGhpcztcblxuICAgIH0sKi9cblxuICAgIHNldFF1YXQ6IGZ1bmN0aW9uIChxKSB7XG5cbiAgICAgIHZhciB0ZSA9IHRoaXMuZWxlbWVudHM7XG4gICAgICB2YXIgeCA9IHEueCwgeSA9IHEueSwgeiA9IHEueiwgdyA9IHEudztcbiAgICAgIHZhciB4MiA9IHggKyB4LCB5MiA9IHkgKyB5LCB6MiA9IHogKyB6O1xuICAgICAgdmFyIHh4ID0geCAqIHgyLCB4eSA9IHggKiB5MiwgeHogPSB4ICogejI7XG4gICAgICB2YXIgeXkgPSB5ICogeTIsIHl6ID0geSAqIHoyLCB6eiA9IHogKiB6MjtcbiAgICAgIHZhciB3eCA9IHcgKiB4Miwgd3kgPSB3ICogeTIsIHd6ID0gdyAqIHoyO1xuXG4gICAgICB0ZVswXSA9IDEgLSAoeXkgKyB6eik7XG4gICAgICB0ZVsxXSA9IHh5IC0gd3o7XG4gICAgICB0ZVsyXSA9IHh6ICsgd3k7XG5cbiAgICAgIHRlWzNdID0geHkgKyB3ejtcbiAgICAgIHRlWzRdID0gMSAtICh4eCArIHp6KTtcbiAgICAgIHRlWzVdID0geXogLSB3eDtcblxuICAgICAgdGVbNl0gPSB4eiAtIHd5O1xuICAgICAgdGVbN10gPSB5eiArIHd4O1xuICAgICAgdGVbOF0gPSAxIC0gKHh4ICsgeXkpO1xuXG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIH0sXG5cbiAgICBpbnZlcnQ6IGZ1bmN0aW9uIChtKSB7XG5cbiAgICAgIHZhciB0ZSA9IHRoaXMuZWxlbWVudHMsIHRtID0gbS5lbGVtZW50cyxcbiAgICAgICAgYTAwID0gdG1bMF0sIGExMCA9IHRtWzNdLCBhMjAgPSB0bVs2XSxcbiAgICAgICAgYTAxID0gdG1bMV0sIGExMSA9IHRtWzRdLCBhMjEgPSB0bVs3XSxcbiAgICAgICAgYTAyID0gdG1bMl0sIGExMiA9IHRtWzVdLCBhMjIgPSB0bVs4XSxcbiAgICAgICAgYjAxID0gYTIyICogYTExIC0gYTEyICogYTIxLFxuICAgICAgICBiMTEgPSAtYTIyICogYTEwICsgYTEyICogYTIwLFxuICAgICAgICBiMjEgPSBhMjEgKiBhMTAgLSBhMTEgKiBhMjAsXG4gICAgICAgIGRldCA9IGEwMCAqIGIwMSArIGEwMSAqIGIxMSArIGEwMiAqIGIyMTtcblxuICAgICAgaWYgKGRldCA9PT0gMCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcImNhbid0IGludmVydCBtYXRyaXgsIGRldGVybWluYW50IGlzIDBcIik7XG4gICAgICAgIHJldHVybiB0aGlzLmlkZW50aXR5KCk7XG4gICAgICB9XG5cbiAgICAgIGRldCA9IDEuMCAvIGRldDtcbiAgICAgIHRlWzBdID0gYjAxICogZGV0O1xuICAgICAgdGVbMV0gPSAoLWEyMiAqIGEwMSArIGEwMiAqIGEyMSkgKiBkZXQ7XG4gICAgICB0ZVsyXSA9IChhMTIgKiBhMDEgLSBhMDIgKiBhMTEpICogZGV0O1xuICAgICAgdGVbM10gPSBiMTEgKiBkZXQ7XG4gICAgICB0ZVs0XSA9IChhMjIgKiBhMDAgLSBhMDIgKiBhMjApICogZGV0O1xuICAgICAgdGVbNV0gPSAoLWExMiAqIGEwMCArIGEwMiAqIGExMCkgKiBkZXQ7XG4gICAgICB0ZVs2XSA9IGIyMSAqIGRldDtcbiAgICAgIHRlWzddID0gKC1hMjEgKiBhMDAgKyBhMDEgKiBhMjApICogZGV0O1xuICAgICAgdGVbOF0gPSAoYTExICogYTAwIC0gYTAxICogYTEwKSAqIGRldDtcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfSxcblxuICAgIGFkZE9mZnNldDogZnVuY3Rpb24gKG0sIHYpIHtcblxuICAgICAgdmFyIHJlbFggPSB2Lng7XG4gICAgICB2YXIgcmVsWSA9IHYueTtcbiAgICAgIHZhciByZWxaID0gdi56O1xuXG4gICAgICB2YXIgdGUgPSB0aGlzLmVsZW1lbnRzO1xuICAgICAgdGVbMF0gKz0gbSAqIChyZWxZICogcmVsWSArIHJlbFogKiByZWxaKTtcbiAgICAgIHRlWzRdICs9IG0gKiAocmVsWCAqIHJlbFggKyByZWxaICogcmVsWik7XG4gICAgICB0ZVs4XSArPSBtICogKHJlbFggKiByZWxYICsgcmVsWSAqIHJlbFkpO1xuICAgICAgdmFyIHh5ID0gbSAqIHJlbFggKiByZWxZO1xuICAgICAgdmFyIHl6ID0gbSAqIHJlbFkgKiByZWxaO1xuICAgICAgdmFyIHp4ID0gbSAqIHJlbFogKiByZWxYO1xuICAgICAgdGVbMV0gLT0geHk7XG4gICAgICB0ZVszXSAtPSB4eTtcbiAgICAgIHRlWzJdIC09IHl6O1xuICAgICAgdGVbNl0gLT0geXo7XG4gICAgICB0ZVs1XSAtPSB6eDtcbiAgICAgIHRlWzddIC09IHp4O1xuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICB9LFxuXG4gICAgc3ViT2Zmc2V0OiBmdW5jdGlvbiAobSwgdikge1xuXG4gICAgICB2YXIgcmVsWCA9IHYueDtcbiAgICAgIHZhciByZWxZID0gdi55O1xuICAgICAgdmFyIHJlbFogPSB2Lno7XG5cbiAgICAgIHZhciB0ZSA9IHRoaXMuZWxlbWVudHM7XG4gICAgICB0ZVswXSAtPSBtICogKHJlbFkgKiByZWxZICsgcmVsWiAqIHJlbFopO1xuICAgICAgdGVbNF0gLT0gbSAqIChyZWxYICogcmVsWCArIHJlbFogKiByZWxaKTtcbiAgICAgIHRlWzhdIC09IG0gKiAocmVsWCAqIHJlbFggKyByZWxZICogcmVsWSk7XG4gICAgICB2YXIgeHkgPSBtICogcmVsWCAqIHJlbFk7XG4gICAgICB2YXIgeXogPSBtICogcmVsWSAqIHJlbFo7XG4gICAgICB2YXIgenggPSBtICogcmVsWiAqIHJlbFg7XG4gICAgICB0ZVsxXSArPSB4eTtcbiAgICAgIHRlWzNdICs9IHh5O1xuICAgICAgdGVbMl0gKz0geXo7XG4gICAgICB0ZVs2XSArPSB5ejtcbiAgICAgIHRlWzVdICs9IHp4O1xuICAgICAgdGVbN10gKz0geng7XG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIH0sXG5cbiAgICAvLyBPSyBcblxuICAgIG11bHRpcGx5U2NhbGFyOiBmdW5jdGlvbiAocykge1xuXG4gICAgICB2YXIgdGUgPSB0aGlzLmVsZW1lbnRzO1xuXG4gICAgICB0ZVswXSAqPSBzOyB0ZVszXSAqPSBzOyB0ZVs2XSAqPSBzO1xuICAgICAgdGVbMV0gKj0gczsgdGVbNF0gKj0gczsgdGVbN10gKj0gcztcbiAgICAgIHRlWzJdICo9IHM7IHRlWzVdICo9IHM7IHRlWzhdICo9IHM7XG5cbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfSxcblxuICAgIGlkZW50aXR5OiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHRoaXMuc2V0KDEsIDAsIDAsIDAsIDEsIDAsIDAsIDAsIDEpO1xuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICB9LFxuXG5cbiAgICBjbG9uZTogZnVuY3Rpb24gKCkge1xuXG4gICAgICByZXR1cm4gbmV3IE1hdDMzKCkuZnJvbUFycmF5KHRoaXMuZWxlbWVudHMpO1xuXG4gICAgfSxcblxuICAgIGNvcHk6IGZ1bmN0aW9uIChtKSB7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgOTsgaSsrKSB0aGlzLmVsZW1lbnRzW2ldID0gbS5lbGVtZW50c1tpXTtcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfSxcblxuICAgIGRldGVybWluYW50OiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHZhciB0ZSA9IHRoaXMuZWxlbWVudHM7XG4gICAgICB2YXIgYSA9IHRlWzBdLCBiID0gdGVbMV0sIGMgPSB0ZVsyXSxcbiAgICAgICAgZCA9IHRlWzNdLCBlID0gdGVbNF0sIGYgPSB0ZVs1XSxcbiAgICAgICAgZyA9IHRlWzZdLCBoID0gdGVbN10sIGkgPSB0ZVs4XTtcblxuICAgICAgcmV0dXJuIGEgKiBlICogaSAtIGEgKiBmICogaCAtIGIgKiBkICogaSArIGIgKiBmICogZyArIGMgKiBkICogaCAtIGMgKiBlICogZztcblxuICAgIH0sXG5cbiAgICBmcm9tQXJyYXk6IGZ1bmN0aW9uIChhcnJheSwgb2Zmc2V0KSB7XG5cbiAgICAgIGlmIChvZmZzZXQgPT09IHVuZGVmaW5lZCkgb2Zmc2V0ID0gMDtcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCA5OyBpKyspIHtcblxuICAgICAgICB0aGlzLmVsZW1lbnRzW2ldID0gYXJyYXlbaSArIG9mZnNldF07XG5cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICB9LFxuXG4gICAgdG9BcnJheTogZnVuY3Rpb24gKGFycmF5LCBvZmZzZXQpIHtcblxuICAgICAgaWYgKGFycmF5ID09PSB1bmRlZmluZWQpIGFycmF5ID0gW107XG4gICAgICBpZiAob2Zmc2V0ID09PSB1bmRlZmluZWQpIG9mZnNldCA9IDA7XG5cbiAgICAgIHZhciB0ZSA9IHRoaXMuZWxlbWVudHM7XG5cbiAgICAgIGFycmF5W29mZnNldF0gPSB0ZVswXTtcbiAgICAgIGFycmF5W29mZnNldCArIDFdID0gdGVbMV07XG4gICAgICBhcnJheVtvZmZzZXQgKyAyXSA9IHRlWzJdO1xuXG4gICAgICBhcnJheVtvZmZzZXQgKyAzXSA9IHRlWzNdO1xuICAgICAgYXJyYXlbb2Zmc2V0ICsgNF0gPSB0ZVs0XTtcbiAgICAgIGFycmF5W29mZnNldCArIDVdID0gdGVbNV07XG5cbiAgICAgIGFycmF5W29mZnNldCArIDZdID0gdGVbNl07XG4gICAgICBhcnJheVtvZmZzZXQgKyA3XSA9IHRlWzddO1xuICAgICAgYXJyYXlbb2Zmc2V0ICsgOF0gPSB0ZVs4XTtcblxuICAgICAgcmV0dXJuIGFycmF5O1xuXG4gICAgfVxuXG5cbiAgfSk7XG5cbiAgLyoqXG4gICAqIEFuIGF4aXMtYWxpZ25lZCBib3VuZGluZyBib3guXG4gICAqXG4gICAqIEBhdXRob3Igc2FoYXJhblxuICAgKiBAYXV0aG9yIGxvLXRoXG4gICAqL1xuXG4gIGZ1bmN0aW9uIEFBQkIobWluWCwgbWF4WCwgbWluWSwgbWF4WSwgbWluWiwgbWF4Wikge1xuXG4gICAgdGhpcy5lbGVtZW50cyA9IG5ldyBGbG9hdDMyQXJyYXkoNik7XG4gICAgdmFyIHRlID0gdGhpcy5lbGVtZW50cztcblxuICAgIHRlWzBdID0gbWluWCB8fCAwOyB0ZVsxXSA9IG1pblkgfHwgMDsgdGVbMl0gPSBtaW5aIHx8IDA7XG4gICAgdGVbM10gPSBtYXhYIHx8IDA7IHRlWzRdID0gbWF4WSB8fCAwOyB0ZVs1XSA9IG1heFogfHwgMDtcblxuICB9XG4gIE9iamVjdC5hc3NpZ24oQUFCQi5wcm90b3R5cGUsIHtcblxuICAgIEFBQkI6IHRydWUsXG5cbiAgICBzZXQ6IGZ1bmN0aW9uIChtaW5YLCBtYXhYLCBtaW5ZLCBtYXhZLCBtaW5aLCBtYXhaKSB7XG5cbiAgICAgIHZhciB0ZSA9IHRoaXMuZWxlbWVudHM7XG4gICAgICB0ZVswXSA9IG1pblg7XG4gICAgICB0ZVszXSA9IG1heFg7XG4gICAgICB0ZVsxXSA9IG1pblk7XG4gICAgICB0ZVs0XSA9IG1heFk7XG4gICAgICB0ZVsyXSA9IG1pblo7XG4gICAgICB0ZVs1XSA9IG1heFo7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgaW50ZXJzZWN0VGVzdDogZnVuY3Rpb24gKGFhYmIpIHtcblxuICAgICAgdmFyIHRlID0gdGhpcy5lbGVtZW50cztcbiAgICAgIHZhciB1ZSA9IGFhYmIuZWxlbWVudHM7XG4gICAgICByZXR1cm4gdGVbMF0gPiB1ZVszXSB8fCB0ZVsxXSA+IHVlWzRdIHx8IHRlWzJdID4gdWVbNV0gfHwgdGVbM10gPCB1ZVswXSB8fCB0ZVs0XSA8IHVlWzFdIHx8IHRlWzVdIDwgdWVbMl0gPyB0cnVlIDogZmFsc2U7XG5cbiAgICB9LFxuXG4gICAgaW50ZXJzZWN0VGVzdFR3bzogZnVuY3Rpb24gKGFhYmIpIHtcblxuICAgICAgdmFyIHRlID0gdGhpcy5lbGVtZW50cztcbiAgICAgIHZhciB1ZSA9IGFhYmIuZWxlbWVudHM7XG4gICAgICByZXR1cm4gdGVbMF0gPCB1ZVswXSB8fCB0ZVsxXSA8IHVlWzFdIHx8IHRlWzJdIDwgdWVbMl0gfHwgdGVbM10gPiB1ZVszXSB8fCB0ZVs0XSA+IHVlWzRdIHx8IHRlWzVdID4gdWVbNV0gPyB0cnVlIDogZmFsc2U7XG5cbiAgICB9LFxuXG4gICAgY2xvbmU6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgcmV0dXJuIG5ldyB0aGlzLmNvbnN0cnVjdG9yKCkuZnJvbUFycmF5KHRoaXMuZWxlbWVudHMpO1xuXG4gICAgfSxcblxuICAgIGNvcHk6IGZ1bmN0aW9uIChhYWJiLCBtYXJnaW4pIHtcblxuICAgICAgdmFyIG0gPSBtYXJnaW4gfHwgMDtcbiAgICAgIHZhciBtZSA9IGFhYmIuZWxlbWVudHM7XG4gICAgICB0aGlzLnNldChtZVswXSAtIG0sIG1lWzNdICsgbSwgbWVbMV0gLSBtLCBtZVs0XSArIG0sIG1lWzJdIC0gbSwgbWVbNV0gKyBtKTtcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfSxcblxuICAgIGZyb21BcnJheTogZnVuY3Rpb24gKGFycmF5KSB7XG5cbiAgICAgIHRoaXMuZWxlbWVudHMuc2V0KGFycmF5KTtcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfSxcblxuICAgIC8vIFNldCB0aGlzIEFBQkIgdG8gdGhlIGNvbWJpbmVkIEFBQkIgb2YgYWFiYjEgYW5kIGFhYmIyLlxuXG4gICAgY29tYmluZTogZnVuY3Rpb24gKGFhYmIxLCBhYWJiMikge1xuXG4gICAgICB2YXIgYSA9IGFhYmIxLmVsZW1lbnRzO1xuICAgICAgdmFyIGIgPSBhYWJiMi5lbGVtZW50cztcbiAgICAgIHZhciB0ZSA9IHRoaXMuZWxlbWVudHM7XG5cbiAgICAgIHRlWzBdID0gYVswXSA8IGJbMF0gPyBhWzBdIDogYlswXTtcbiAgICAgIHRlWzFdID0gYVsxXSA8IGJbMV0gPyBhWzFdIDogYlsxXTtcbiAgICAgIHRlWzJdID0gYVsyXSA8IGJbMl0gPyBhWzJdIDogYlsyXTtcblxuICAgICAgdGVbM10gPSBhWzNdID4gYlszXSA/IGFbM10gOiBiWzNdO1xuICAgICAgdGVbNF0gPSBhWzRdID4gYls0XSA/IGFbNF0gOiBiWzRdO1xuICAgICAgdGVbNV0gPSBhWzVdID4gYls1XSA/IGFbNV0gOiBiWzVdO1xuXG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIH0sXG5cblxuICAgIC8vIEdldCB0aGUgc3VyZmFjZSBhcmVhLlxuXG4gICAgc3VyZmFjZUFyZWE6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgdmFyIHRlID0gdGhpcy5lbGVtZW50cztcbiAgICAgIHZhciBhID0gdGVbM10gLSB0ZVswXTtcbiAgICAgIHZhciBoID0gdGVbNF0gLSB0ZVsxXTtcbiAgICAgIHZhciBkID0gdGVbNV0gLSB0ZVsyXTtcbiAgICAgIHJldHVybiAyICogKGEgKiAoaCArIGQpICsgaCAqIGQpO1xuXG4gICAgfSxcblxuXG4gICAgLy8gR2V0IHdoZXRoZXIgdGhlIEFBQkIgaW50ZXJzZWN0cyB3aXRoIHRoZSBwb2ludCBvciBub3QuXG5cbiAgICBpbnRlcnNlY3RzV2l0aFBvaW50OiBmdW5jdGlvbiAoeCwgeSwgeikge1xuXG4gICAgICB2YXIgdGUgPSB0aGlzLmVsZW1lbnRzO1xuICAgICAgcmV0dXJuIHggPj0gdGVbMF0gJiYgeCA8PSB0ZVszXSAmJiB5ID49IHRlWzFdICYmIHkgPD0gdGVbNF0gJiYgeiA+PSB0ZVsyXSAmJiB6IDw9IHRlWzVdO1xuXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCB0aGUgQUFCQiBmcm9tIGFuIGFycmF5XG4gICAgICogb2YgdmVydGljZXMuIEZyb20gVEhSRUUuXG4gICAgICogQGF1dGhvciBXZXN0TGFuZ2xleVxuICAgICAqIEBhdXRob3IgeHByb2dyYW1cbiAgICAgKi9cblxuICAgIHNldEZyb21Qb2ludHM6IGZ1bmN0aW9uIChhcnIpIHtcbiAgICAgIHRoaXMubWFrZUVtcHR5KCk7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKykge1xuICAgICAgICB0aGlzLmV4cGFuZEJ5UG9pbnQoYXJyW2ldKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgbWFrZUVtcHR5OiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLnNldCgtSW5maW5pdHksIC1JbmZpbml0eSwgLUluZmluaXR5LCBJbmZpbml0eSwgSW5maW5pdHksIEluZmluaXR5KTtcbiAgICB9LFxuXG4gICAgZXhwYW5kQnlQb2ludDogZnVuY3Rpb24gKHB0KSB7XG4gICAgICB2YXIgdGUgPSB0aGlzLmVsZW1lbnRzO1xuICAgICAgdGhpcy5zZXQoXG4gICAgICAgIF9NYXRoLm1pbih0ZVswXSwgcHQueCksIF9NYXRoLm1pbih0ZVsxXSwgcHQueSksIF9NYXRoLm1pbih0ZVsyXSwgcHQueiksXG4gICAgICAgIF9NYXRoLm1heCh0ZVszXSwgcHQueCksIF9NYXRoLm1heCh0ZVs0XSwgcHQueSksIF9NYXRoLm1heCh0ZVs1XSwgcHQueilcbiAgICAgICk7XG4gICAgfSxcblxuICAgIGV4cGFuZEJ5U2NhbGFyOiBmdW5jdGlvbiAocykge1xuXG4gICAgICB2YXIgdGUgPSB0aGlzLmVsZW1lbnRzO1xuICAgICAgdGVbMF0gKz0gLXM7XG4gICAgICB0ZVsxXSArPSAtcztcbiAgICAgIHRlWzJdICs9IC1zO1xuICAgICAgdGVbM10gKz0gcztcbiAgICAgIHRlWzRdICs9IHM7XG4gICAgICB0ZVs1XSArPSBzO1xuICAgIH1cblxuICB9KTtcblxuICB2YXIgY291bnQgPSAwO1xuICBmdW5jdGlvbiBTaGFwZUlkQ291bnQoKSB7IHJldHVybiBjb3VudCsrOyB9XG5cbiAgLyoqXG4gICAqIEEgc2hhcGUgaXMgdXNlZCB0byBkZXRlY3QgY29sbGlzaW9ucyBvZiByaWdpZCBib2RpZXMuXG4gICAqXG4gICAqIEBhdXRob3Igc2FoYXJhblxuICAgKiBAYXV0aG9yIGxvLXRoXG4gICAqL1xuXG4gIGZ1bmN0aW9uIFNoYXBlKGNvbmZpZykge1xuXG4gICAgdGhpcy50eXBlID0gU0hBUEVfTlVMTDtcblxuICAgIC8vIGdsb2JhbCBpZGVudGlmaWNhdGlvbiBvZiB0aGUgc2hhcGUgc2hvdWxkIGJlIHVuaXF1ZSB0byB0aGUgc2hhcGUuXG4gICAgdGhpcy5pZCA9IFNoYXBlSWRDb3VudCgpO1xuXG4gICAgLy8gcHJldmlvdXMgc2hhcGUgaW4gcGFyZW50IHJpZ2lkIGJvZHkuIFVzZWQgZm9yIGZhc3QgaW50ZXJhdGlvbnMuXG4gICAgdGhpcy5wcmV2ID0gbnVsbDtcblxuICAgIC8vIG5leHQgc2hhcGUgaW4gcGFyZW50IHJpZ2lkIGJvZHkuIFVzZWQgZm9yIGZhc3QgaW50ZXJhdGlvbnMuXG4gICAgdGhpcy5uZXh0ID0gbnVsbDtcblxuICAgIC8vIHByb3h5IG9mIHRoZSBzaGFwZSB1c2VkIGZvciBicm9hZC1waGFzZSBjb2xsaXNpb24gZGV0ZWN0aW9uLlxuICAgIHRoaXMucHJveHkgPSBudWxsO1xuXG4gICAgLy8gcGFyZW50IHJpZ2lkIGJvZHkgb2YgdGhlIHNoYXBlLlxuICAgIHRoaXMucGFyZW50ID0gbnVsbDtcblxuICAgIC8vIGxpbmtlZCBsaXN0IG9mIHRoZSBjb250YWN0cyB3aXRoIHRoZSBzaGFwZS5cbiAgICB0aGlzLmNvbnRhY3RMaW5rID0gbnVsbDtcblxuICAgIC8vIG51bWJlciBvZiB0aGUgY29udGFjdHMgd2l0aCB0aGUgc2hhcGUuXG4gICAgdGhpcy5udW1Db250YWN0cyA9IDA7XG5cbiAgICAvLyBjZW50ZXIgb2YgZ3Jhdml0eSBvZiB0aGUgc2hhcGUgaW4gd29ybGQgY29vcmRpbmF0ZSBzeXN0ZW0uXG4gICAgdGhpcy5wb3NpdGlvbiA9IG5ldyBWZWMzKCk7XG5cbiAgICAvLyByb3RhdGlvbiBtYXRyaXggb2YgdGhlIHNoYXBlIGluIHdvcmxkIGNvb3JkaW5hdGUgc3lzdGVtLlxuICAgIHRoaXMucm90YXRpb24gPSBuZXcgTWF0MzMoKTtcblxuICAgIC8vIHBvc2l0aW9uIG9mIHRoZSBzaGFwZSBpbiBwYXJlbnQncyBjb29yZGluYXRlIHN5c3RlbS5cbiAgICB0aGlzLnJlbGF0aXZlUG9zaXRpb24gPSBuZXcgVmVjMygpLmNvcHkoY29uZmlnLnJlbGF0aXZlUG9zaXRpb24pO1xuXG4gICAgLy8gcm90YXRpb24gbWF0cml4IG9mIHRoZSBzaGFwZSBpbiBwYXJlbnQncyBjb29yZGluYXRlIHN5c3RlbS5cbiAgICB0aGlzLnJlbGF0aXZlUm90YXRpb24gPSBuZXcgTWF0MzMoKS5jb3B5KGNvbmZpZy5yZWxhdGl2ZVJvdGF0aW9uKTtcblxuICAgIC8vIGF4aXMtYWxpZ25lZCBib3VuZGluZyBib3ggb2YgdGhlIHNoYXBlLlxuICAgIHRoaXMuYWFiYiA9IG5ldyBBQUJCKCk7XG5cbiAgICAvLyBkZW5zaXR5IG9mIHRoZSBzaGFwZS5cbiAgICB0aGlzLmRlbnNpdHkgPSBjb25maWcuZGVuc2l0eTtcblxuICAgIC8vIGNvZWZmaWNpZW50IG9mIGZyaWN0aW9uIG9mIHRoZSBzaGFwZS5cbiAgICB0aGlzLmZyaWN0aW9uID0gY29uZmlnLmZyaWN0aW9uO1xuXG4gICAgLy8gY29lZmZpY2llbnQgb2YgcmVzdGl0dXRpb24gb2YgdGhlIHNoYXBlLlxuICAgIHRoaXMucmVzdGl0dXRpb24gPSBjb25maWcucmVzdGl0dXRpb247XG5cbiAgICAvLyBiaXRzIG9mIHRoZSBjb2xsaXNpb24gZ3JvdXBzIHRvIHdoaWNoIHRoZSBzaGFwZSBiZWxvbmdzLlxuICAgIHRoaXMuYmVsb25nc1RvID0gY29uZmlnLmJlbG9uZ3NUbztcblxuICAgIC8vIGJpdHMgb2YgdGhlIGNvbGxpc2lvbiBncm91cHMgd2l0aCB3aGljaCB0aGUgc2hhcGUgY29sbGlkZXMuXG4gICAgdGhpcy5jb2xsaWRlc1dpdGggPSBjb25maWcuY29sbGlkZXNXaXRoO1xuXG4gIH1cbiAgT2JqZWN0LmFzc2lnbihTaGFwZS5wcm90b3R5cGUsIHtcblxuICAgIFNoYXBlOiB0cnVlLFxuXG4gICAgLy8gQ2FsY3VsYXRlIHRoZSBtYXNzIGluZm9ybWF0aW9uIG9mIHRoZSBzaGFwZS5cblxuICAgIGNhbGN1bGF0ZU1hc3NJbmZvOiBmdW5jdGlvbiAob3V0KSB7XG5cbiAgICAgIHByaW50RXJyb3IoXCJTaGFwZVwiLCBcIkluaGVyaXRhbmNlIGVycm9yLlwiKTtcblxuICAgIH0sXG5cbiAgICAvLyBVcGRhdGUgdGhlIHByb3h5IG9mIHRoZSBzaGFwZS5cblxuICAgIHVwZGF0ZVByb3h5OiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHByaW50RXJyb3IoXCJTaGFwZVwiLCBcIkluaGVyaXRhbmNlIGVycm9yLlwiKTtcblxuICAgIH1cblxuICB9KTtcblxuICAvKipcbiAgICogQm94IHNoYXBlLlxuICAgKiBAYXV0aG9yIHNhaGFyYW5cbiAgICogQGF1dGhvciBsby10aFxuICAgKi9cblxuICBmdW5jdGlvbiBCb3goY29uZmlnLCBXaWR0aCwgSGVpZ2h0LCBEZXB0aCkge1xuXG4gICAgU2hhcGUuY2FsbCh0aGlzLCBjb25maWcpO1xuXG4gICAgdGhpcy50eXBlID0gU0hBUEVfQk9YO1xuXG4gICAgdGhpcy53aWR0aCA9IFdpZHRoO1xuICAgIHRoaXMuaGVpZ2h0ID0gSGVpZ2h0O1xuICAgIHRoaXMuZGVwdGggPSBEZXB0aDtcblxuICAgIHRoaXMuaGFsZldpZHRoID0gV2lkdGggKiAwLjU7XG4gICAgdGhpcy5oYWxmSGVpZ2h0ID0gSGVpZ2h0ICogMC41O1xuICAgIHRoaXMuaGFsZkRlcHRoID0gRGVwdGggKiAwLjU7XG5cbiAgICB0aGlzLmRpbWVudGlvbnMgPSBuZXcgRmxvYXQzMkFycmF5KDE4KTtcbiAgICB0aGlzLmVsZW1lbnRzID0gbmV3IEZsb2F0MzJBcnJheSgyNCk7XG5cbiAgfVxuICBCb3gucHJvdG90eXBlID0gT2JqZWN0LmFzc2lnbihPYmplY3QuY3JlYXRlKFNoYXBlLnByb3RvdHlwZSksIHtcblxuICAgIGNvbnN0cnVjdG9yOiBCb3gsXG5cbiAgICBjYWxjdWxhdGVNYXNzSW5mbzogZnVuY3Rpb24gKG91dCkge1xuXG4gICAgICB2YXIgbWFzcyA9IHRoaXMud2lkdGggKiB0aGlzLmhlaWdodCAqIHRoaXMuZGVwdGggKiB0aGlzLmRlbnNpdHk7XG4gICAgICB2YXIgZGl2aWQgPSAxIC8gMTI7XG4gICAgICBvdXQubWFzcyA9IG1hc3M7XG4gICAgICBvdXQuaW5lcnRpYS5zZXQoXG4gICAgICAgIG1hc3MgKiAodGhpcy5oZWlnaHQgKiB0aGlzLmhlaWdodCArIHRoaXMuZGVwdGggKiB0aGlzLmRlcHRoKSAqIGRpdmlkLCAwLCAwLFxuICAgICAgICAwLCBtYXNzICogKHRoaXMud2lkdGggKiB0aGlzLndpZHRoICsgdGhpcy5kZXB0aCAqIHRoaXMuZGVwdGgpICogZGl2aWQsIDAsXG4gICAgICAgIDAsIDAsIG1hc3MgKiAodGhpcy53aWR0aCAqIHRoaXMud2lkdGggKyB0aGlzLmhlaWdodCAqIHRoaXMuaGVpZ2h0KSAqIGRpdmlkXG4gICAgICApO1xuXG4gICAgfSxcblxuICAgIHVwZGF0ZVByb3h5OiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHZhciB0ZSA9IHRoaXMucm90YXRpb24uZWxlbWVudHM7XG4gICAgICB2YXIgZGkgPSB0aGlzLmRpbWVudGlvbnM7XG4gICAgICAvLyBXaWR0aFxuICAgICAgZGlbMF0gPSB0ZVswXTtcbiAgICAgIGRpWzFdID0gdGVbM107XG4gICAgICBkaVsyXSA9IHRlWzZdO1xuICAgICAgLy8gSGVpZ2h0XG4gICAgICBkaVszXSA9IHRlWzFdO1xuICAgICAgZGlbNF0gPSB0ZVs0XTtcbiAgICAgIGRpWzVdID0gdGVbN107XG4gICAgICAvLyBEZXB0aFxuICAgICAgZGlbNl0gPSB0ZVsyXTtcbiAgICAgIGRpWzddID0gdGVbNV07XG4gICAgICBkaVs4XSA9IHRlWzhdO1xuICAgICAgLy8gaGFsZiBXaWR0aFxuICAgICAgZGlbOV0gPSB0ZVswXSAqIHRoaXMuaGFsZldpZHRoO1xuICAgICAgZGlbMTBdID0gdGVbM10gKiB0aGlzLmhhbGZXaWR0aDtcbiAgICAgIGRpWzExXSA9IHRlWzZdICogdGhpcy5oYWxmV2lkdGg7XG4gICAgICAvLyBoYWxmIEhlaWdodFxuICAgICAgZGlbMTJdID0gdGVbMV0gKiB0aGlzLmhhbGZIZWlnaHQ7XG4gICAgICBkaVsxM10gPSB0ZVs0XSAqIHRoaXMuaGFsZkhlaWdodDtcbiAgICAgIGRpWzE0XSA9IHRlWzddICogdGhpcy5oYWxmSGVpZ2h0O1xuICAgICAgLy8gaGFsZiBEZXB0aFxuICAgICAgZGlbMTVdID0gdGVbMl0gKiB0aGlzLmhhbGZEZXB0aDtcbiAgICAgIGRpWzE2XSA9IHRlWzVdICogdGhpcy5oYWxmRGVwdGg7XG4gICAgICBkaVsxN10gPSB0ZVs4XSAqIHRoaXMuaGFsZkRlcHRoO1xuXG4gICAgICB2YXIgd3ggPSBkaVs5XTtcbiAgICAgIHZhciB3eSA9IGRpWzEwXTtcbiAgICAgIHZhciB3eiA9IGRpWzExXTtcbiAgICAgIHZhciBoeCA9IGRpWzEyXTtcbiAgICAgIHZhciBoeSA9IGRpWzEzXTtcbiAgICAgIHZhciBoeiA9IGRpWzE0XTtcbiAgICAgIHZhciBkeCA9IGRpWzE1XTtcbiAgICAgIHZhciBkeSA9IGRpWzE2XTtcbiAgICAgIHZhciBkeiA9IGRpWzE3XTtcblxuICAgICAgdmFyIHggPSB0aGlzLnBvc2l0aW9uLng7XG4gICAgICB2YXIgeSA9IHRoaXMucG9zaXRpb24ueTtcbiAgICAgIHZhciB6ID0gdGhpcy5wb3NpdGlvbi56O1xuXG4gICAgICB2YXIgdiA9IHRoaXMuZWxlbWVudHM7XG4gICAgICAvL3YxXG4gICAgICB2WzBdID0geCArIHd4ICsgaHggKyBkeDtcbiAgICAgIHZbMV0gPSB5ICsgd3kgKyBoeSArIGR5O1xuICAgICAgdlsyXSA9IHogKyB3eiArIGh6ICsgZHo7XG4gICAgICAvL3YyXG4gICAgICB2WzNdID0geCArIHd4ICsgaHggLSBkeDtcbiAgICAgIHZbNF0gPSB5ICsgd3kgKyBoeSAtIGR5O1xuICAgICAgdls1XSA9IHogKyB3eiArIGh6IC0gZHo7XG4gICAgICAvL3YzXG4gICAgICB2WzZdID0geCArIHd4IC0gaHggKyBkeDtcbiAgICAgIHZbN10gPSB5ICsgd3kgLSBoeSArIGR5O1xuICAgICAgdls4XSA9IHogKyB3eiAtIGh6ICsgZHo7XG4gICAgICAvL3Y0XG4gICAgICB2WzldID0geCArIHd4IC0gaHggLSBkeDtcbiAgICAgIHZbMTBdID0geSArIHd5IC0gaHkgLSBkeTtcbiAgICAgIHZbMTFdID0geiArIHd6IC0gaHogLSBkejtcbiAgICAgIC8vdjVcbiAgICAgIHZbMTJdID0geCAtIHd4ICsgaHggKyBkeDtcbiAgICAgIHZbMTNdID0geSAtIHd5ICsgaHkgKyBkeTtcbiAgICAgIHZbMTRdID0geiAtIHd6ICsgaHogKyBkejtcbiAgICAgIC8vdjZcbiAgICAgIHZbMTVdID0geCAtIHd4ICsgaHggLSBkeDtcbiAgICAgIHZbMTZdID0geSAtIHd5ICsgaHkgLSBkeTtcbiAgICAgIHZbMTddID0geiAtIHd6ICsgaHogLSBkejtcbiAgICAgIC8vdjdcbiAgICAgIHZbMThdID0geCAtIHd4IC0gaHggKyBkeDtcbiAgICAgIHZbMTldID0geSAtIHd5IC0gaHkgKyBkeTtcbiAgICAgIHZbMjBdID0geiAtIHd6IC0gaHogKyBkejtcbiAgICAgIC8vdjhcbiAgICAgIHZbMjFdID0geCAtIHd4IC0gaHggLSBkeDtcbiAgICAgIHZbMjJdID0geSAtIHd5IC0gaHkgLSBkeTtcbiAgICAgIHZbMjNdID0geiAtIHd6IC0gaHogLSBkejtcblxuICAgICAgdmFyIHcgPSBkaVs5XSA8IDAgPyAtZGlbOV0gOiBkaVs5XTtcbiAgICAgIHZhciBoID0gZGlbMTBdIDwgMCA/IC1kaVsxMF0gOiBkaVsxMF07XG4gICAgICB2YXIgZCA9IGRpWzExXSA8IDAgPyAtZGlbMTFdIDogZGlbMTFdO1xuXG4gICAgICB3ID0gZGlbMTJdIDwgMCA/IHcgLSBkaVsxMl0gOiB3ICsgZGlbMTJdO1xuICAgICAgaCA9IGRpWzEzXSA8IDAgPyBoIC0gZGlbMTNdIDogaCArIGRpWzEzXTtcbiAgICAgIGQgPSBkaVsxNF0gPCAwID8gZCAtIGRpWzE0XSA6IGQgKyBkaVsxNF07XG5cbiAgICAgIHcgPSBkaVsxNV0gPCAwID8gdyAtIGRpWzE1XSA6IHcgKyBkaVsxNV07XG4gICAgICBoID0gZGlbMTZdIDwgMCA/IGggLSBkaVsxNl0gOiBoICsgZGlbMTZdO1xuICAgICAgZCA9IGRpWzE3XSA8IDAgPyBkIC0gZGlbMTddIDogZCArIGRpWzE3XTtcblxuICAgICAgdmFyIHAgPSBBQUJCX1BST1g7XG5cbiAgICAgIHRoaXMuYWFiYi5zZXQoXG4gICAgICAgIHRoaXMucG9zaXRpb24ueCAtIHcgLSBwLCB0aGlzLnBvc2l0aW9uLnggKyB3ICsgcCxcbiAgICAgICAgdGhpcy5wb3NpdGlvbi55IC0gaCAtIHAsIHRoaXMucG9zaXRpb24ueSArIGggKyBwLFxuICAgICAgICB0aGlzLnBvc2l0aW9uLnogLSBkIC0gcCwgdGhpcy5wb3NpdGlvbi56ICsgZCArIHBcbiAgICAgICk7XG5cbiAgICAgIGlmICh0aGlzLnByb3h5ICE9IG51bGwpIHRoaXMucHJveHkudXBkYXRlKCk7XG5cbiAgICB9XG4gIH0pO1xuXG4gIC8qKlxuICAgKiBTcGhlcmUgc2hhcGVcbiAgICogQGF1dGhvciBzYWhhcmFuXG4gICAqIEBhdXRob3IgbG8tdGhcbiAgICovXG5cbiAgZnVuY3Rpb24gU3BoZXJlKGNvbmZpZywgcmFkaXVzKSB7XG5cbiAgICBTaGFwZS5jYWxsKHRoaXMsIGNvbmZpZyk7XG5cbiAgICB0aGlzLnR5cGUgPSBTSEFQRV9TUEhFUkU7XG5cbiAgICAvLyByYWRpdXMgb2YgdGhlIHNoYXBlLlxuICAgIHRoaXMucmFkaXVzID0gcmFkaXVzO1xuXG4gIH1cbiAgU3BoZXJlLnByb3RvdHlwZSA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmNyZWF0ZShTaGFwZS5wcm90b3R5cGUpLCB7XG5cbiAgICBjb25zdHJ1Y3RvcjogU3BoZXJlLFxuXG4gICAgdm9sdW1lOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHJldHVybiBfTWF0aC5QSSAqIHRoaXMucmFkaXVzICogMS4zMzMzMzM7XG5cbiAgICB9LFxuXG4gICAgY2FsY3VsYXRlTWFzc0luZm86IGZ1bmN0aW9uIChvdXQpIHtcblxuICAgICAgdmFyIG1hc3MgPSB0aGlzLnZvbHVtZSgpICogdGhpcy5yYWRpdXMgKiB0aGlzLnJhZGl1cyAqIHRoaXMuZGVuc2l0eTsgLy8xLjMzMyAqIF9NYXRoLlBJICogdGhpcy5yYWRpdXMgKiB0aGlzLnJhZGl1cyAqIHRoaXMucmFkaXVzICogdGhpcy5kZW5zaXR5O1xuICAgICAgb3V0Lm1hc3MgPSBtYXNzO1xuICAgICAgdmFyIGluZXJ0aWEgPSBtYXNzICogdGhpcy5yYWRpdXMgKiB0aGlzLnJhZGl1cyAqIDAuNDtcbiAgICAgIG91dC5pbmVydGlhLnNldChpbmVydGlhLCAwLCAwLCAwLCBpbmVydGlhLCAwLCAwLCAwLCBpbmVydGlhKTtcblxuICAgIH0sXG5cbiAgICB1cGRhdGVQcm94eTogZnVuY3Rpb24gKCkge1xuXG4gICAgICB2YXIgcCA9IEFBQkJfUFJPWDtcblxuICAgICAgdGhpcy5hYWJiLnNldChcbiAgICAgICAgdGhpcy5wb3NpdGlvbi54IC0gdGhpcy5yYWRpdXMgLSBwLCB0aGlzLnBvc2l0aW9uLnggKyB0aGlzLnJhZGl1cyArIHAsXG4gICAgICAgIHRoaXMucG9zaXRpb24ueSAtIHRoaXMucmFkaXVzIC0gcCwgdGhpcy5wb3NpdGlvbi55ICsgdGhpcy5yYWRpdXMgKyBwLFxuICAgICAgICB0aGlzLnBvc2l0aW9uLnogLSB0aGlzLnJhZGl1cyAtIHAsIHRoaXMucG9zaXRpb24ueiArIHRoaXMucmFkaXVzICsgcFxuICAgICAgKTtcblxuICAgICAgaWYgKHRoaXMucHJveHkgIT0gbnVsbCkgdGhpcy5wcm94eS51cGRhdGUoKTtcblxuICAgIH1cblxuICB9KTtcblxuICAvKipcbiAgICogQ3lsaW5kZXIgc2hhcGVcbiAgICogQGF1dGhvciBzYWhhcmFuXG4gICAqIEBhdXRob3IgbG8tdGhcbiAgICovXG5cbiAgZnVuY3Rpb24gQ3lsaW5kZXIoY29uZmlnLCByYWRpdXMsIGhlaWdodCkge1xuXG4gICAgU2hhcGUuY2FsbCh0aGlzLCBjb25maWcpO1xuXG4gICAgdGhpcy50eXBlID0gU0hBUEVfQ1lMSU5ERVI7XG5cbiAgICB0aGlzLnJhZGl1cyA9IHJhZGl1cztcbiAgICB0aGlzLmhlaWdodCA9IGhlaWdodDtcbiAgICB0aGlzLmhhbGZIZWlnaHQgPSBoZWlnaHQgKiAwLjU7XG5cbiAgICB0aGlzLm5vcm1hbERpcmVjdGlvbiA9IG5ldyBWZWMzKCk7XG4gICAgdGhpcy5oYWxmRGlyZWN0aW9uID0gbmV3IFZlYzMoKTtcblxuICB9XG4gIEN5bGluZGVyLnByb3RvdHlwZSA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmNyZWF0ZShTaGFwZS5wcm90b3R5cGUpLCB7XG5cbiAgICBjb25zdHJ1Y3RvcjogQ3lsaW5kZXIsXG5cbiAgICBjYWxjdWxhdGVNYXNzSW5mbzogZnVuY3Rpb24gKG91dCkge1xuXG4gICAgICB2YXIgcnNxID0gdGhpcy5yYWRpdXMgKiB0aGlzLnJhZGl1cztcbiAgICAgIHZhciBtYXNzID0gX01hdGguUEkgKiByc3EgKiB0aGlzLmhlaWdodCAqIHRoaXMuZGVuc2l0eTtcbiAgICAgIHZhciBpbmVydGlhWFogPSAoKDAuMjUgKiByc3EpICsgKDAuMDgzMyAqIHRoaXMuaGVpZ2h0ICogdGhpcy5oZWlnaHQpKSAqIG1hc3M7XG4gICAgICB2YXIgaW5lcnRpYVkgPSAwLjUgKiByc3E7XG4gICAgICBvdXQubWFzcyA9IG1hc3M7XG4gICAgICBvdXQuaW5lcnRpYS5zZXQoaW5lcnRpYVhaLCAwLCAwLCAwLCBpbmVydGlhWSwgMCwgMCwgMCwgaW5lcnRpYVhaKTtcblxuICAgIH0sXG5cbiAgICB1cGRhdGVQcm94eTogZnVuY3Rpb24gKCkge1xuXG4gICAgICB2YXIgdGUgPSB0aGlzLnJvdGF0aW9uLmVsZW1lbnRzO1xuICAgICAgdmFyIGxlbiwgd3gsIGh5LCBkeiwgeHgsIHl5LCB6eiwgdywgaCwgZCwgcDtcblxuICAgICAgeHggPSB0ZVsxXSAqIHRlWzFdO1xuICAgICAgeXkgPSB0ZVs0XSAqIHRlWzRdO1xuICAgICAgenogPSB0ZVs3XSAqIHRlWzddO1xuXG4gICAgICB0aGlzLm5vcm1hbERpcmVjdGlvbi5zZXQodGVbMV0sIHRlWzRdLCB0ZVs3XSk7XG4gICAgICB0aGlzLmhhbGZEaXJlY3Rpb24uc2NhbGUodGhpcy5ub3JtYWxEaXJlY3Rpb24sIHRoaXMuaGFsZkhlaWdodCk7XG5cbiAgICAgIHd4ID0gMSAtIHh4O1xuICAgICAgbGVuID0gX01hdGguc3FydCh3eCAqIHd4ICsgeHggKiB5eSArIHh4ICogenopO1xuICAgICAgaWYgKGxlbiA+IDApIGxlbiA9IHRoaXMucmFkaXVzIC8gbGVuO1xuICAgICAgd3ggKj0gbGVuO1xuICAgICAgaHkgPSAxIC0geXk7XG4gICAgICBsZW4gPSBfTWF0aC5zcXJ0KHl5ICogeHggKyBoeSAqIGh5ICsgeXkgKiB6eik7XG4gICAgICBpZiAobGVuID4gMCkgbGVuID0gdGhpcy5yYWRpdXMgLyBsZW47XG4gICAgICBoeSAqPSBsZW47XG4gICAgICBkeiA9IDEgLSB6ejtcbiAgICAgIGxlbiA9IF9NYXRoLnNxcnQoenogKiB4eCArIHp6ICogeXkgKyBkeiAqIGR6KTtcbiAgICAgIGlmIChsZW4gPiAwKSBsZW4gPSB0aGlzLnJhZGl1cyAvIGxlbjtcbiAgICAgIGR6ICo9IGxlbjtcblxuICAgICAgdyA9IHRoaXMuaGFsZkRpcmVjdGlvbi54IDwgMCA/IC10aGlzLmhhbGZEaXJlY3Rpb24ueCA6IHRoaXMuaGFsZkRpcmVjdGlvbi54O1xuICAgICAgaCA9IHRoaXMuaGFsZkRpcmVjdGlvbi55IDwgMCA/IC10aGlzLmhhbGZEaXJlY3Rpb24ueSA6IHRoaXMuaGFsZkRpcmVjdGlvbi55O1xuICAgICAgZCA9IHRoaXMuaGFsZkRpcmVjdGlvbi56IDwgMCA/IC10aGlzLmhhbGZEaXJlY3Rpb24ueiA6IHRoaXMuaGFsZkRpcmVjdGlvbi56O1xuXG4gICAgICB3ID0gd3ggPCAwID8gdyAtIHd4IDogdyArIHd4O1xuICAgICAgaCA9IGh5IDwgMCA/IGggLSBoeSA6IGggKyBoeTtcbiAgICAgIGQgPSBkeiA8IDAgPyBkIC0gZHogOiBkICsgZHo7XG5cbiAgICAgIHAgPSBBQUJCX1BST1g7XG5cbiAgICAgIHRoaXMuYWFiYi5zZXQoXG4gICAgICAgIHRoaXMucG9zaXRpb24ueCAtIHcgLSBwLCB0aGlzLnBvc2l0aW9uLnggKyB3ICsgcCxcbiAgICAgICAgdGhpcy5wb3NpdGlvbi55IC0gaCAtIHAsIHRoaXMucG9zaXRpb24ueSArIGggKyBwLFxuICAgICAgICB0aGlzLnBvc2l0aW9uLnogLSBkIC0gcCwgdGhpcy5wb3NpdGlvbi56ICsgZCArIHBcbiAgICAgICk7XG5cbiAgICAgIGlmICh0aGlzLnByb3h5ICE9IG51bGwpIHRoaXMucHJveHkudXBkYXRlKCk7XG5cbiAgICB9XG5cbiAgfSk7XG5cbiAgLyoqXG4gICAqIFBsYW5lIHNoYXBlLlxuICAgKiBAYXV0aG9yIGxvLXRoXG4gICAqL1xuXG4gIGZ1bmN0aW9uIFBsYW5lKGNvbmZpZywgbm9ybWFsKSB7XG5cbiAgICBTaGFwZS5jYWxsKHRoaXMsIGNvbmZpZyk7XG5cbiAgICB0aGlzLnR5cGUgPSBTSEFQRV9QTEFORTtcblxuICAgIC8vIHJhZGl1cyBvZiB0aGUgc2hhcGUuXG4gICAgdGhpcy5ub3JtYWwgPSBuZXcgVmVjMygwLCAxLCAwKTtcblxuICB9XG4gIFBsYW5lLnByb3RvdHlwZSA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmNyZWF0ZShTaGFwZS5wcm90b3R5cGUpLCB7XG5cbiAgICBjb25zdHJ1Y3RvcjogUGxhbmUsXG5cbiAgICB2b2x1bWU6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgcmV0dXJuIE51bWJlci5NQVhfVkFMVUU7XG5cbiAgICB9LFxuXG4gICAgY2FsY3VsYXRlTWFzc0luZm86IGZ1bmN0aW9uIChvdXQpIHtcblxuICAgICAgb3V0Lm1hc3MgPSB0aGlzLmRlbnNpdHk7Ly8wLjAwMDE7XG4gICAgICB2YXIgaW5lcnRpYSA9IDE7XG4gICAgICBvdXQuaW5lcnRpYS5zZXQoaW5lcnRpYSwgMCwgMCwgMCwgaW5lcnRpYSwgMCwgMCwgMCwgaW5lcnRpYSk7XG5cbiAgICB9LFxuXG4gICAgdXBkYXRlUHJveHk6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgdmFyIHAgPSBBQUJCX1BST1g7XG5cbiAgICAgIHZhciBtaW4gPSAtX01hdGguSU5GO1xuICAgICAgdmFyIG1heCA9IF9NYXRoLklORjtcbiAgICAgIHZhciBuID0gdGhpcy5ub3JtYWw7XG4gICAgICAvLyBUaGUgcGxhbmUgQUFCQiBpcyBpbmZpbml0ZSwgZXhjZXB0IGlmIHRoZSBub3JtYWwgaXMgcG9pbnRpbmcgYWxvbmcgYW55IGF4aXNcbiAgICAgIHRoaXMuYWFiYi5zZXQoXG4gICAgICAgIG4ueCA9PT0gLTEgPyB0aGlzLnBvc2l0aW9uLnggLSBwIDogbWluLCBuLnggPT09IDEgPyB0aGlzLnBvc2l0aW9uLnggKyBwIDogbWF4LFxuICAgICAgICBuLnkgPT09IC0xID8gdGhpcy5wb3NpdGlvbi55IC0gcCA6IG1pbiwgbi55ID09PSAxID8gdGhpcy5wb3NpdGlvbi55ICsgcCA6IG1heCxcbiAgICAgICAgbi56ID09PSAtMSA/IHRoaXMucG9zaXRpb24ueiAtIHAgOiBtaW4sIG4ueiA9PT0gMSA/IHRoaXMucG9zaXRpb24ueiArIHAgOiBtYXhcbiAgICAgICk7XG5cbiAgICAgIGlmICh0aGlzLnByb3h5ICE9IG51bGwpIHRoaXMucHJveHkudXBkYXRlKCk7XG5cbiAgICB9XG5cbiAgfSk7XG5cbiAgLyoqXG4gICAqIEEgUGFydGljdWxlIHNoYXBlXG4gICAqIEBhdXRob3IgbG8tdGhcbiAgICovXG5cbiAgZnVuY3Rpb24gUGFydGljbGUoY29uZmlnLCBub3JtYWwpIHtcblxuICAgIFNoYXBlLmNhbGwodGhpcywgY29uZmlnKTtcblxuICAgIHRoaXMudHlwZSA9IFNIQVBFX1BBUlRJQ0xFO1xuXG4gIH1cbiAgUGFydGljbGUucHJvdG90eXBlID0gT2JqZWN0LmFzc2lnbihPYmplY3QuY3JlYXRlKFNoYXBlLnByb3RvdHlwZSksIHtcblxuICAgIGNvbnN0cnVjdG9yOiBQYXJ0aWNsZSxcblxuICAgIHZvbHVtZTogZnVuY3Rpb24gKCkge1xuXG4gICAgICByZXR1cm4gTnVtYmVyLk1BWF9WQUxVRTtcblxuICAgIH0sXG5cbiAgICBjYWxjdWxhdGVNYXNzSW5mbzogZnVuY3Rpb24gKG91dCkge1xuXG4gICAgICB2YXIgaW5lcnRpYSA9IDA7XG4gICAgICBvdXQuaW5lcnRpYS5zZXQoaW5lcnRpYSwgMCwgMCwgMCwgaW5lcnRpYSwgMCwgMCwgMCwgaW5lcnRpYSk7XG5cbiAgICB9LFxuXG4gICAgdXBkYXRlUHJveHk6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgdmFyIHAgPSAwOy8vQUFCQl9QUk9YO1xuXG4gICAgICB0aGlzLmFhYmIuc2V0KFxuICAgICAgICB0aGlzLnBvc2l0aW9uLnggLSBwLCB0aGlzLnBvc2l0aW9uLnggKyBwLFxuICAgICAgICB0aGlzLnBvc2l0aW9uLnkgLSBwLCB0aGlzLnBvc2l0aW9uLnkgKyBwLFxuICAgICAgICB0aGlzLnBvc2l0aW9uLnogLSBwLCB0aGlzLnBvc2l0aW9uLnogKyBwXG4gICAgICApO1xuXG4gICAgICBpZiAodGhpcy5wcm94eSAhPSBudWxsKSB0aGlzLnByb3h5LnVwZGF0ZSgpO1xuXG4gICAgfVxuXG4gIH0pO1xuXG4gIC8qKlxuICAgKiBBIHNoYXBlIGNvbmZpZ3VyYXRpb24gaG9sZHMgY29tbW9uIGNvbmZpZ3VyYXRpb24gZGF0YSBmb3IgY29uc3RydWN0aW5nIGEgc2hhcGUuXG4gICAqIFRoZXNlIGNvbmZpZ3VyYXRpb25zIGNhbiBiZSByZXVzZWQgc2FmZWx5LlxuICAgKlxuICAgKiBAYXV0aG9yIHNhaGFyYW5cbiAgICogQGF1dGhvciBsby10aFxuICAgKi9cblxuICBmdW5jdGlvbiBTaGFwZUNvbmZpZygpIHtcblxuICAgIC8vIHBvc2l0aW9uIG9mIHRoZSBzaGFwZSBpbiBwYXJlbnQncyBjb29yZGluYXRlIHN5c3RlbS5cbiAgICB0aGlzLnJlbGF0aXZlUG9zaXRpb24gPSBuZXcgVmVjMygpO1xuICAgIC8vIHJvdGF0aW9uIG1hdHJpeCBvZiB0aGUgc2hhcGUgaW4gcGFyZW50J3MgY29vcmRpbmF0ZSBzeXN0ZW0uXG4gICAgdGhpcy5yZWxhdGl2ZVJvdGF0aW9uID0gbmV3IE1hdDMzKCk7XG4gICAgLy8gY29lZmZpY2llbnQgb2YgZnJpY3Rpb24gb2YgdGhlIHNoYXBlLlxuICAgIHRoaXMuZnJpY3Rpb24gPSAwLjI7IC8vIDAuNFxuICAgIC8vIGNvZWZmaWNpZW50IG9mIHJlc3RpdHV0aW9uIG9mIHRoZSBzaGFwZS5cbiAgICB0aGlzLnJlc3RpdHV0aW9uID0gMC4yO1xuICAgIC8vIGRlbnNpdHkgb2YgdGhlIHNoYXBlLlxuICAgIHRoaXMuZGVuc2l0eSA9IDE7XG4gICAgLy8gYml0cyBvZiB0aGUgY29sbGlzaW9uIGdyb3VwcyB0byB3aGljaCB0aGUgc2hhcGUgYmVsb25ncy5cbiAgICB0aGlzLmJlbG9uZ3NUbyA9IDE7XG4gICAgLy8gYml0cyBvZiB0aGUgY29sbGlzaW9uIGdyb3VwcyB3aXRoIHdoaWNoIHRoZSBzaGFwZSBjb2xsaWRlcy5cbiAgICB0aGlzLmNvbGxpZGVzV2l0aCA9IDB4ZmZmZmZmZmY7XG5cbiAgfVxuXG4gIC8qKlxuICAqIEFuIGluZm9ybWF0aW9uIG9mIGxpbWl0IGFuZCBtb3Rvci5cbiAgKlxuICAqIEBhdXRob3Igc2FoYXJhblxuICAqL1xuXG4gIGZ1bmN0aW9uIExpbWl0TW90b3IoYXhpcywgZml4ZWQpIHtcblxuICAgIGZpeGVkID0gZml4ZWQgfHwgZmFsc2U7XG4gICAgLy8gVGhlIGF4aXMgb2YgdGhlIGNvbnN0cmFpbnQuXG4gICAgdGhpcy5heGlzID0gYXhpcztcbiAgICAvLyBUaGUgY3VycmVudCBhbmdsZSBmb3Igcm90YXRpb25hbCBjb25zdHJhaW50cy5cbiAgICB0aGlzLmFuZ2xlID0gMDtcbiAgICAvLyBUaGUgbG93ZXIgbGltaXQuIFNldCBsb3dlciA+IHVwcGVyIHRvIGRpc2FibGVcbiAgICB0aGlzLmxvd2VyTGltaXQgPSBmaXhlZCA/IDAgOiAxO1xuXG4gICAgLy8gIFRoZSB1cHBlciBsaW1pdC4gU2V0IGxvd2VyID4gdXBwZXIgdG8gZGlzYWJsZS5cbiAgICB0aGlzLnVwcGVyTGltaXQgPSAwO1xuICAgIC8vIFRoZSB0YXJnZXQgbW90b3Igc3BlZWQuXG4gICAgdGhpcy5tb3RvclNwZWVkID0gMDtcbiAgICAvLyBUaGUgbWF4aW11bSBtb3RvciBmb3JjZSBvciB0b3JxdWUuIFNldCAwIHRvIGRpc2FibGUuXG4gICAgdGhpcy5tYXhNb3RvckZvcmNlID0gMDtcbiAgICAvLyBUaGUgZnJlcXVlbmN5IG9mIHRoZSBzcHJpbmcuIFNldCAwIHRvIGRpc2FibGUuXG4gICAgdGhpcy5mcmVxdWVuY3kgPSAwO1xuICAgIC8vIFRoZSBkYW1waW5nIHJhdGlvIG9mIHRoZSBzcHJpbmcuIFNldCAwIGZvciBubyBkYW1waW5nLCAxIGZvciBjcml0aWNhbCBkYW1waW5nLlxuICAgIHRoaXMuZGFtcGluZ1JhdGlvID0gMDtcblxuICB9XG4gIE9iamVjdC5hc3NpZ24oTGltaXRNb3Rvci5wcm90b3R5cGUsIHtcblxuICAgIExpbWl0TW90b3I6IHRydWUsXG5cbiAgICAvLyBTZXQgbGltaXQgZGF0YSBpbnRvIHRoaXMgY29uc3RyYWludC5cbiAgICBzZXRMaW1pdDogZnVuY3Rpb24gKGxvd2VyTGltaXQsIHVwcGVyTGltaXQpIHtcblxuICAgICAgdGhpcy5sb3dlckxpbWl0ID0gbG93ZXJMaW1pdDtcbiAgICAgIHRoaXMudXBwZXJMaW1pdCA9IHVwcGVyTGltaXQ7XG5cbiAgICB9LFxuXG4gICAgLy8gU2V0IG1vdG9yIGRhdGEgaW50byB0aGlzIGNvbnN0cmFpbnQuXG4gICAgc2V0TW90b3I6IGZ1bmN0aW9uIChtb3RvclNwZWVkLCBtYXhNb3RvckZvcmNlKSB7XG5cbiAgICAgIHRoaXMubW90b3JTcGVlZCA9IG1vdG9yU3BlZWQ7XG4gICAgICB0aGlzLm1heE1vdG9yRm9yY2UgPSBtYXhNb3RvckZvcmNlO1xuXG4gICAgfSxcblxuICAgIC8vIFNldCBzcHJpbmcgZGF0YSBpbnRvIHRoaXMgY29uc3RyYWludC5cbiAgICBzZXRTcHJpbmc6IGZ1bmN0aW9uIChmcmVxdWVuY3ksIGRhbXBpbmdSYXRpbykge1xuXG4gICAgICB0aGlzLmZyZXF1ZW5jeSA9IGZyZXF1ZW5jeTtcbiAgICAgIHRoaXMuZGFtcGluZ1JhdGlvID0gZGFtcGluZ1JhdGlvO1xuXG4gICAgfVxuXG4gIH0pO1xuXG4gIC8qKlxuICAgKiBUaGUgYmFzZSBjbGFzcyBvZiBhbGwgdHlwZSBvZiB0aGUgY29uc3RyYWludHMuXG4gICAqXG4gICAqIEBhdXRob3Igc2FoYXJhblxuICAgKiBAYXV0aG9yIGxvLXRoXG4gICAqL1xuXG4gIGZ1bmN0aW9uIENvbnN0cmFpbnQoKSB7XG5cbiAgICAvLyBwYXJlbnQgd29ybGQgb2YgdGhlIGNvbnN0cmFpbnQuXG4gICAgdGhpcy5wYXJlbnQgPSBudWxsO1xuXG4gICAgLy8gZmlyc3QgYm9keSBvZiB0aGUgY29uc3RyYWludC5cbiAgICB0aGlzLmJvZHkxID0gbnVsbDtcblxuICAgIC8vIHNlY29uZCBib2R5IG9mIHRoZSBjb25zdHJhaW50LlxuICAgIHRoaXMuYm9keTIgPSBudWxsO1xuXG4gICAgLy8gSW50ZXJuYWxcbiAgICB0aGlzLmFkZGVkVG9Jc2xhbmQgPSBmYWxzZTtcblxuICB9XG5cbiAgT2JqZWN0LmFzc2lnbihDb25zdHJhaW50LnByb3RvdHlwZSwge1xuXG4gICAgQ29uc3RyYWludDogdHJ1ZSxcblxuICAgIC8vIFByZXBhcmUgZm9yIHNvbHZpbmcgdGhlIGNvbnN0cmFpbnRcbiAgICBwcmVTb2x2ZTogZnVuY3Rpb24gKHRpbWVTdGVwLCBpbnZUaW1lU3RlcCkge1xuXG4gICAgICBwcmludEVycm9yKFwiQ29uc3RyYWludFwiLCBcIkluaGVyaXRhbmNlIGVycm9yLlwiKTtcblxuICAgIH0sXG5cbiAgICAvLyBTb2x2ZSB0aGUgY29uc3RyYWludC4gVGhpcyBpcyB1c3VhbGx5IGNhbGxlZCBpdGVyYXRpdmVseS5cbiAgICBzb2x2ZTogZnVuY3Rpb24gKCkge1xuXG4gICAgICBwcmludEVycm9yKFwiQ29uc3RyYWludFwiLCBcIkluaGVyaXRhbmNlIGVycm9yLlwiKTtcblxuICAgIH0sXG5cbiAgICAvLyBEbyB0aGUgcG9zdC1wcm9jZXNzaW5nLlxuICAgIHBvc3RTb2x2ZTogZnVuY3Rpb24gKCkge1xuXG4gICAgICBwcmludEVycm9yKFwiQ29uc3RyYWludFwiLCBcIkluaGVyaXRhbmNlIGVycm9yLlwiKTtcblxuICAgIH1cblxuICB9KTtcblxuICBmdW5jdGlvbiBKb2ludExpbmsoam9pbnQpIHtcblxuICAgIC8vIFRoZSBwcmV2aW91cyBqb2ludCBsaW5rLlxuICAgIHRoaXMucHJldiA9IG51bGw7XG4gICAgLy8gVGhlIG5leHQgam9pbnQgbGluay5cbiAgICB0aGlzLm5leHQgPSBudWxsO1xuICAgIC8vIFRoZSBvdGhlciByaWdpZCBib2R5IGNvbm5lY3RlZCB0byB0aGUgam9pbnQuXG4gICAgdGhpcy5ib2R5ID0gbnVsbDtcbiAgICAvLyBUaGUgam9pbnQgb2YgdGhlIGxpbmsuXG4gICAgdGhpcy5qb2ludCA9IGpvaW50O1xuXG4gIH1cblxuICAvKipcbiAgICogSm9pbnRzIGFyZSB1c2VkIHRvIGNvbnN0cmFpbiB0aGUgbW90aW9uIGJldHdlZW4gdHdvIHJpZ2lkIGJvZGllcy5cbiAgICpcbiAgICogQGF1dGhvciBzYWhhcmFuXG4gICAqIEBhdXRob3IgbG8tdGhcbiAgICovXG5cbiAgZnVuY3Rpb24gSm9pbnQoY29uZmlnKSB7XG5cbiAgICBDb25zdHJhaW50LmNhbGwodGhpcyk7XG5cbiAgICB0aGlzLnNjYWxlID0gMTtcbiAgICB0aGlzLmludlNjYWxlID0gMTtcblxuICAgIC8vIGpvaW50IG5hbWVcbiAgICB0aGlzLm5hbWUgPSBcIlwiO1xuICAgIHRoaXMuaWQgPSBOYU47XG5cbiAgICAvLyBUaGUgdHlwZSBvZiB0aGUgam9pbnQuXG4gICAgdGhpcy50eXBlID0gSk9JTlRfTlVMTDtcbiAgICAvLyAgVGhlIHByZXZpb3VzIGpvaW50IGluIHRoZSB3b3JsZC5cbiAgICB0aGlzLnByZXYgPSBudWxsO1xuICAgIC8vIFRoZSBuZXh0IGpvaW50IGluIHRoZSB3b3JsZC5cbiAgICB0aGlzLm5leHQgPSBudWxsO1xuXG4gICAgdGhpcy5ib2R5MSA9IGNvbmZpZy5ib2R5MTtcbiAgICB0aGlzLmJvZHkyID0gY29uZmlnLmJvZHkyO1xuXG4gICAgLy8gYW5jaG9yIHBvaW50IG9uIHRoZSBmaXJzdCByaWdpZCBib2R5IGluIGxvY2FsIGNvb3JkaW5hdGUgc3lzdGVtLlxuICAgIHRoaXMubG9jYWxBbmNob3JQb2ludDEgPSBuZXcgVmVjMygpLmNvcHkoY29uZmlnLmxvY2FsQW5jaG9yUG9pbnQxKTtcbiAgICAvLyBhbmNob3IgcG9pbnQgb24gdGhlIHNlY29uZCByaWdpZCBib2R5IGluIGxvY2FsIGNvb3JkaW5hdGUgc3lzdGVtLlxuICAgIHRoaXMubG9jYWxBbmNob3JQb2ludDIgPSBuZXcgVmVjMygpLmNvcHkoY29uZmlnLmxvY2FsQW5jaG9yUG9pbnQyKTtcbiAgICAvLyBhbmNob3IgcG9pbnQgb24gdGhlIGZpcnN0IHJpZ2lkIGJvZHkgaW4gd29ybGQgY29vcmRpbmF0ZSBzeXN0ZW0gcmVsYXRpdmUgdG8gdGhlIGJvZHkncyBvcmlnaW4uXG4gICAgdGhpcy5yZWxhdGl2ZUFuY2hvclBvaW50MSA9IG5ldyBWZWMzKCk7XG4gICAgLy8gYW5jaG9yIHBvaW50IG9uIHRoZSBzZWNvbmQgcmlnaWQgYm9keSBpbiB3b3JsZCBjb29yZGluYXRlIHN5c3RlbSByZWxhdGl2ZSB0byB0aGUgYm9keSdzIG9yaWdpbi5cbiAgICB0aGlzLnJlbGF0aXZlQW5jaG9yUG9pbnQyID0gbmV3IFZlYzMoKTtcbiAgICAvLyAgYW5jaG9yIHBvaW50IG9uIHRoZSBmaXJzdCByaWdpZCBib2R5IGluIHdvcmxkIGNvb3JkaW5hdGUgc3lzdGVtLlxuICAgIHRoaXMuYW5jaG9yUG9pbnQxID0gbmV3IFZlYzMoKTtcbiAgICAvLyBhbmNob3IgcG9pbnQgb24gdGhlIHNlY29uZCByaWdpZCBib2R5IGluIHdvcmxkIGNvb3JkaW5hdGUgc3lzdGVtLlxuICAgIHRoaXMuYW5jaG9yUG9pbnQyID0gbmV3IFZlYzMoKTtcbiAgICAvLyBXaGV0aGVyIGFsbG93IGNvbGxpc2lvbiBiZXR3ZWVuIGNvbm5lY3RlZCByaWdpZCBib2RpZXMgb3Igbm90LlxuICAgIHRoaXMuYWxsb3dDb2xsaXNpb24gPSBjb25maWcuYWxsb3dDb2xsaXNpb247XG5cbiAgICB0aGlzLmIxTGluayA9IG5ldyBKb2ludExpbmsodGhpcyk7XG4gICAgdGhpcy5iMkxpbmsgPSBuZXcgSm9pbnRMaW5rKHRoaXMpO1xuXG4gIH1cbiAgSm9pbnQucHJvdG90eXBlID0gT2JqZWN0LmFzc2lnbihPYmplY3QuY3JlYXRlKENvbnN0cmFpbnQucHJvdG90eXBlKSwge1xuXG4gICAgY29uc3RydWN0b3I6IEpvaW50LFxuXG4gICAgc2V0SWQ6IGZ1bmN0aW9uIChuKSB7XG5cbiAgICAgIHRoaXMuaWQgPSBpO1xuXG4gICAgfSxcblxuICAgIHNldFBhcmVudDogZnVuY3Rpb24gKHdvcmxkKSB7XG5cbiAgICAgIHRoaXMucGFyZW50ID0gd29ybGQ7XG4gICAgICB0aGlzLnNjYWxlID0gdGhpcy5wYXJlbnQuc2NhbGU7XG4gICAgICB0aGlzLmludlNjYWxlID0gdGhpcy5wYXJlbnQuaW52U2NhbGU7XG4gICAgICB0aGlzLmlkID0gdGhpcy5wYXJlbnQubnVtSm9pbnRzO1xuICAgICAgaWYgKCF0aGlzLm5hbWUpIHRoaXMubmFtZSA9ICdKJyArIHRoaXMuaWQ7XG5cbiAgICB9LFxuXG4gICAgLy8gVXBkYXRlIGFsbCB0aGUgYW5jaG9yIHBvaW50cy5cblxuICAgIHVwZGF0ZUFuY2hvclBvaW50czogZnVuY3Rpb24gKCkge1xuXG4gICAgICB0aGlzLnJlbGF0aXZlQW5jaG9yUG9pbnQxLmNvcHkodGhpcy5sb2NhbEFuY2hvclBvaW50MSkuYXBwbHlNYXRyaXgzKHRoaXMuYm9keTEucm90YXRpb24sIHRydWUpO1xuICAgICAgdGhpcy5yZWxhdGl2ZUFuY2hvclBvaW50Mi5jb3B5KHRoaXMubG9jYWxBbmNob3JQb2ludDIpLmFwcGx5TWF0cml4Myh0aGlzLmJvZHkyLnJvdGF0aW9uLCB0cnVlKTtcblxuICAgICAgdGhpcy5hbmNob3JQb2ludDEuYWRkKHRoaXMucmVsYXRpdmVBbmNob3JQb2ludDEsIHRoaXMuYm9keTEucG9zaXRpb24pO1xuICAgICAgdGhpcy5hbmNob3JQb2ludDIuYWRkKHRoaXMucmVsYXRpdmVBbmNob3JQb2ludDIsIHRoaXMuYm9keTIucG9zaXRpb24pO1xuXG4gICAgfSxcblxuICAgIC8vIEF0dGFjaCB0aGUgam9pbnQgZnJvbSB0aGUgYm9kaWVzLlxuXG4gICAgYXR0YWNoOiBmdW5jdGlvbiAoaXNYKSB7XG5cbiAgICAgIHRoaXMuYjFMaW5rLmJvZHkgPSB0aGlzLmJvZHkyO1xuICAgICAgdGhpcy5iMkxpbmsuYm9keSA9IHRoaXMuYm9keTE7XG5cbiAgICAgIGlmIChpc1gpIHtcblxuICAgICAgICB0aGlzLmJvZHkxLmpvaW50TGluay5wdXNoKHRoaXMuYjFMaW5rKTtcbiAgICAgICAgdGhpcy5ib2R5Mi5qb2ludExpbmsucHVzaCh0aGlzLmIyTGluayk7XG4gICAgICB9IGVsc2Uge1xuXG4gICAgICAgIGlmICh0aGlzLmJvZHkxLmpvaW50TGluayAhPSBudWxsKSAodGhpcy5iMUxpbmsubmV4dCA9IHRoaXMuYm9keTEuam9pbnRMaW5rKS5wcmV2ID0gdGhpcy5iMUxpbms7XG4gICAgICAgIGVsc2UgdGhpcy5iMUxpbmsubmV4dCA9IG51bGw7XG4gICAgICAgIHRoaXMuYm9keTEuam9pbnRMaW5rID0gdGhpcy5iMUxpbms7XG4gICAgICAgIHRoaXMuYm9keTEubnVtSm9pbnRzKys7XG4gICAgICAgIGlmICh0aGlzLmJvZHkyLmpvaW50TGluayAhPSBudWxsKSAodGhpcy5iMkxpbmsubmV4dCA9IHRoaXMuYm9keTIuam9pbnRMaW5rKS5wcmV2ID0gdGhpcy5iMkxpbms7XG4gICAgICAgIGVsc2UgdGhpcy5iMkxpbmsubmV4dCA9IG51bGw7XG4gICAgICAgIHRoaXMuYm9keTIuam9pbnRMaW5rID0gdGhpcy5iMkxpbms7XG4gICAgICAgIHRoaXMuYm9keTIubnVtSm9pbnRzKys7XG5cbiAgICAgIH1cblxuICAgIH0sXG5cbiAgICAvLyBEZXRhY2ggdGhlIGpvaW50IGZyb20gdGhlIGJvZGllcy5cblxuICAgIGRldGFjaDogZnVuY3Rpb24gKGlzWCkge1xuXG4gICAgICBpZiAoaXNYKSB7XG5cbiAgICAgICAgdGhpcy5ib2R5MS5qb2ludExpbmsuc3BsaWNlKHRoaXMuYm9keTEuam9pbnRMaW5rLmluZGV4T2YodGhpcy5iMUxpbmspLCAxKTtcbiAgICAgICAgdGhpcy5ib2R5Mi5qb2ludExpbmsuc3BsaWNlKHRoaXMuYm9keTIuam9pbnRMaW5rLmluZGV4T2YodGhpcy5iMkxpbmspLCAxKTtcblxuICAgICAgfSBlbHNlIHtcblxuICAgICAgICB2YXIgcHJldiA9IHRoaXMuYjFMaW5rLnByZXY7XG4gICAgICAgIHZhciBuZXh0ID0gdGhpcy5iMUxpbmsubmV4dDtcbiAgICAgICAgaWYgKHByZXYgIT0gbnVsbCkgcHJldi5uZXh0ID0gbmV4dDtcbiAgICAgICAgaWYgKG5leHQgIT0gbnVsbCkgbmV4dC5wcmV2ID0gcHJldjtcbiAgICAgICAgaWYgKHRoaXMuYm9keTEuam9pbnRMaW5rID09IHRoaXMuYjFMaW5rKSB0aGlzLmJvZHkxLmpvaW50TGluayA9IG5leHQ7XG4gICAgICAgIHRoaXMuYjFMaW5rLnByZXYgPSBudWxsO1xuICAgICAgICB0aGlzLmIxTGluay5uZXh0ID0gbnVsbDtcbiAgICAgICAgdGhpcy5iMUxpbmsuYm9keSA9IG51bGw7XG4gICAgICAgIHRoaXMuYm9keTEubnVtSm9pbnRzLS07XG5cbiAgICAgICAgcHJldiA9IHRoaXMuYjJMaW5rLnByZXY7XG4gICAgICAgIG5leHQgPSB0aGlzLmIyTGluay5uZXh0O1xuICAgICAgICBpZiAocHJldiAhPSBudWxsKSBwcmV2Lm5leHQgPSBuZXh0O1xuICAgICAgICBpZiAobmV4dCAhPSBudWxsKSBuZXh0LnByZXYgPSBwcmV2O1xuICAgICAgICBpZiAodGhpcy5ib2R5Mi5qb2ludExpbmsgPT0gdGhpcy5iMkxpbmspIHRoaXMuYm9keTIuam9pbnRMaW5rID0gbmV4dDtcbiAgICAgICAgdGhpcy5iMkxpbmsucHJldiA9IG51bGw7XG4gICAgICAgIHRoaXMuYjJMaW5rLm5leHQgPSBudWxsO1xuICAgICAgICB0aGlzLmIyTGluay5ib2R5ID0gbnVsbDtcbiAgICAgICAgdGhpcy5ib2R5Mi5udW1Kb2ludHMtLTtcblxuICAgICAgfVxuXG4gICAgICB0aGlzLmIxTGluay5ib2R5ID0gbnVsbDtcbiAgICAgIHRoaXMuYjJMaW5rLmJvZHkgPSBudWxsO1xuXG4gICAgfSxcblxuXG4gICAgLy8gQXdha2UgdGhlIGJvZGllcy5cblxuICAgIGF3YWtlOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHRoaXMuYm9keTEuYXdha2UoKTtcbiAgICAgIHRoaXMuYm9keTIuYXdha2UoKTtcblxuICAgIH0sXG5cbiAgICAvLyBjYWxjdWxhdGlvbiBmdW5jdGlvblxuXG4gICAgcHJlU29sdmU6IGZ1bmN0aW9uICh0aW1lU3RlcCwgaW52VGltZVN0ZXApIHtcblxuICAgIH0sXG5cbiAgICBzb2x2ZTogZnVuY3Rpb24gKCkge1xuXG4gICAgfSxcblxuICAgIHBvc3RTb2x2ZTogZnVuY3Rpb24gKCkge1xuXG4gICAgfSxcblxuICAgIC8vIERlbGV0ZSBwcm9jZXNzXG5cbiAgICByZW1vdmU6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgdGhpcy5kaXNwb3NlKCk7XG5cbiAgICB9LFxuXG4gICAgZGlzcG9zZTogZnVuY3Rpb24gKCkge1xuXG4gICAgICB0aGlzLnBhcmVudC5yZW1vdmVKb2ludCh0aGlzKTtcblxuICAgIH0sXG5cblxuICAgIC8vIFRocmVlIGpzIGFkZFxuXG4gICAgZ2V0UG9zaXRpb246IGZ1bmN0aW9uICgpIHtcblxuICAgICAgdmFyIHAxID0gbmV3IFZlYzMoKS5zY2FsZSh0aGlzLmFuY2hvclBvaW50MSwgdGhpcy5zY2FsZSk7XG4gICAgICB2YXIgcDIgPSBuZXcgVmVjMygpLnNjYWxlKHRoaXMuYW5jaG9yUG9pbnQyLCB0aGlzLnNjYWxlKTtcbiAgICAgIHJldHVybiBbcDEsIHAyXTtcblxuICAgIH1cblxuICB9KTtcblxuICAvKipcbiAgKiBBIGxpbmVhciBjb25zdHJhaW50IGZvciBhbGwgYXhlcyBmb3IgdmFyaW91cyBqb2ludHMuXG4gICogQGF1dGhvciBzYWhhcmFuXG4gICovXG4gIGZ1bmN0aW9uIExpbmVhckNvbnN0cmFpbnQoam9pbnQpIHtcblxuICAgIHRoaXMubTEgPSBOYU47XG4gICAgdGhpcy5tMiA9IE5hTjtcblxuICAgIHRoaXMuaWkxID0gbnVsbDtcbiAgICB0aGlzLmlpMiA9IG51bGw7XG4gICAgdGhpcy5kZCA9IG51bGw7XG5cbiAgICB0aGlzLnIxeCA9IE5hTjtcbiAgICB0aGlzLnIxeSA9IE5hTjtcbiAgICB0aGlzLnIxeiA9IE5hTjtcblxuICAgIHRoaXMucjJ4ID0gTmFOO1xuICAgIHRoaXMucjJ5ID0gTmFOO1xuICAgIHRoaXMucjJ6ID0gTmFOO1xuXG4gICAgdGhpcy5heDF4ID0gTmFOO1xuICAgIHRoaXMuYXgxeSA9IE5hTjtcbiAgICB0aGlzLmF4MXogPSBOYU47XG4gICAgdGhpcy5heTF4ID0gTmFOO1xuICAgIHRoaXMuYXkxeSA9IE5hTjtcbiAgICB0aGlzLmF5MXogPSBOYU47XG4gICAgdGhpcy5hejF4ID0gTmFOO1xuICAgIHRoaXMuYXoxeSA9IE5hTjtcbiAgICB0aGlzLmF6MXogPSBOYU47XG5cbiAgICB0aGlzLmF4MnggPSBOYU47XG4gICAgdGhpcy5heDJ5ID0gTmFOO1xuICAgIHRoaXMuYXgyeiA9IE5hTjtcbiAgICB0aGlzLmF5MnggPSBOYU47XG4gICAgdGhpcy5heTJ5ID0gTmFOO1xuICAgIHRoaXMuYXkyeiA9IE5hTjtcbiAgICB0aGlzLmF6MnggPSBOYU47XG4gICAgdGhpcy5hejJ5ID0gTmFOO1xuICAgIHRoaXMuYXoyeiA9IE5hTjtcblxuICAgIHRoaXMudmVsID0gTmFOO1xuICAgIHRoaXMudmVseCA9IE5hTjtcbiAgICB0aGlzLnZlbHkgPSBOYU47XG4gICAgdGhpcy52ZWx6ID0gTmFOO1xuXG5cbiAgICB0aGlzLmpvaW50ID0gam9pbnQ7XG4gICAgdGhpcy5yMSA9IGpvaW50LnJlbGF0aXZlQW5jaG9yUG9pbnQxO1xuICAgIHRoaXMucjIgPSBqb2ludC5yZWxhdGl2ZUFuY2hvclBvaW50MjtcbiAgICB0aGlzLnAxID0gam9pbnQuYW5jaG9yUG9pbnQxO1xuICAgIHRoaXMucDIgPSBqb2ludC5hbmNob3JQb2ludDI7XG4gICAgdGhpcy5iMSA9IGpvaW50LmJvZHkxO1xuICAgIHRoaXMuYjIgPSBqb2ludC5ib2R5MjtcbiAgICB0aGlzLmwxID0gdGhpcy5iMS5saW5lYXJWZWxvY2l0eTtcbiAgICB0aGlzLmwyID0gdGhpcy5iMi5saW5lYXJWZWxvY2l0eTtcbiAgICB0aGlzLmExID0gdGhpcy5iMS5hbmd1bGFyVmVsb2NpdHk7XG4gICAgdGhpcy5hMiA9IHRoaXMuYjIuYW5ndWxhclZlbG9jaXR5O1xuICAgIHRoaXMuaTEgPSB0aGlzLmIxLmludmVyc2VJbmVydGlhO1xuICAgIHRoaXMuaTIgPSB0aGlzLmIyLmludmVyc2VJbmVydGlhO1xuICAgIHRoaXMuaW1weCA9IDA7XG4gICAgdGhpcy5pbXB5ID0gMDtcbiAgICB0aGlzLmltcHogPSAwO1xuXG4gIH1cblxuICBPYmplY3QuYXNzaWduKExpbmVhckNvbnN0cmFpbnQucHJvdG90eXBlLCB7XG5cbiAgICBMaW5lYXJDb25zdHJhaW50OiB0cnVlLFxuXG4gICAgcHJlU29sdmU6IGZ1bmN0aW9uICh0aW1lU3RlcCwgaW52VGltZVN0ZXApIHtcblxuICAgICAgdGhpcy5yMXggPSB0aGlzLnIxLng7XG4gICAgICB0aGlzLnIxeSA9IHRoaXMucjEueTtcbiAgICAgIHRoaXMucjF6ID0gdGhpcy5yMS56O1xuXG4gICAgICB0aGlzLnIyeCA9IHRoaXMucjIueDtcbiAgICAgIHRoaXMucjJ5ID0gdGhpcy5yMi55O1xuICAgICAgdGhpcy5yMnogPSB0aGlzLnIyLno7XG5cbiAgICAgIHRoaXMubTEgPSB0aGlzLmIxLmludmVyc2VNYXNzO1xuICAgICAgdGhpcy5tMiA9IHRoaXMuYjIuaW52ZXJzZU1hc3M7XG5cbiAgICAgIHRoaXMuaWkxID0gdGhpcy5pMS5jbG9uZSgpO1xuICAgICAgdGhpcy5paTIgPSB0aGlzLmkyLmNsb25lKCk7XG5cbiAgICAgIHZhciBpaTEgPSB0aGlzLmlpMS5lbGVtZW50cztcbiAgICAgIHZhciBpaTIgPSB0aGlzLmlpMi5lbGVtZW50cztcblxuICAgICAgdGhpcy5heDF4ID0gdGhpcy5yMXogKiBpaTFbMV0gKyAtdGhpcy5yMXkgKiBpaTFbMl07XG4gICAgICB0aGlzLmF4MXkgPSB0aGlzLnIxeiAqIGlpMVs0XSArIC10aGlzLnIxeSAqIGlpMVs1XTtcbiAgICAgIHRoaXMuYXgxeiA9IHRoaXMucjF6ICogaWkxWzddICsgLXRoaXMucjF5ICogaWkxWzhdO1xuICAgICAgdGhpcy5heTF4ID0gLXRoaXMucjF6ICogaWkxWzBdICsgdGhpcy5yMXggKiBpaTFbMl07XG4gICAgICB0aGlzLmF5MXkgPSAtdGhpcy5yMXogKiBpaTFbM10gKyB0aGlzLnIxeCAqIGlpMVs1XTtcbiAgICAgIHRoaXMuYXkxeiA9IC10aGlzLnIxeiAqIGlpMVs2XSArIHRoaXMucjF4ICogaWkxWzhdO1xuICAgICAgdGhpcy5hejF4ID0gdGhpcy5yMXkgKiBpaTFbMF0gKyAtdGhpcy5yMXggKiBpaTFbMV07XG4gICAgICB0aGlzLmF6MXkgPSB0aGlzLnIxeSAqIGlpMVszXSArIC10aGlzLnIxeCAqIGlpMVs0XTtcbiAgICAgIHRoaXMuYXoxeiA9IHRoaXMucjF5ICogaWkxWzZdICsgLXRoaXMucjF4ICogaWkxWzddO1xuICAgICAgdGhpcy5heDJ4ID0gdGhpcy5yMnogKiBpaTJbMV0gKyAtdGhpcy5yMnkgKiBpaTJbMl07XG4gICAgICB0aGlzLmF4MnkgPSB0aGlzLnIyeiAqIGlpMls0XSArIC10aGlzLnIyeSAqIGlpMls1XTtcbiAgICAgIHRoaXMuYXgyeiA9IHRoaXMucjJ6ICogaWkyWzddICsgLXRoaXMucjJ5ICogaWkyWzhdO1xuICAgICAgdGhpcy5heTJ4ID0gLXRoaXMucjJ6ICogaWkyWzBdICsgdGhpcy5yMnggKiBpaTJbMl07XG4gICAgICB0aGlzLmF5MnkgPSAtdGhpcy5yMnogKiBpaTJbM10gKyB0aGlzLnIyeCAqIGlpMls1XTtcbiAgICAgIHRoaXMuYXkyeiA9IC10aGlzLnIyeiAqIGlpMls2XSArIHRoaXMucjJ4ICogaWkyWzhdO1xuICAgICAgdGhpcy5hejJ4ID0gdGhpcy5yMnkgKiBpaTJbMF0gKyAtdGhpcy5yMnggKiBpaTJbMV07XG4gICAgICB0aGlzLmF6MnkgPSB0aGlzLnIyeSAqIGlpMlszXSArIC10aGlzLnIyeCAqIGlpMls0XTtcbiAgICAgIHRoaXMuYXoyeiA9IHRoaXMucjJ5ICogaWkyWzZdICsgLXRoaXMucjJ4ICogaWkyWzddO1xuXG4gICAgICAvLyBjYWxjdWxhdGUgcG9pbnQtdG8tcG9pbnQgbWFzcyBtYXRyaXhcbiAgICAgIC8vIGZyb20gaW1wdWxzZSBlcXVhdGlvblxuICAgICAgLy8gXG4gICAgICAvLyBNID0gKFsvbV0gLSBbcl5dWy9JXVtyXl0pIF4gLTFcbiAgICAgIC8vIFxuICAgICAgLy8gd2hlcmVcbiAgICAgIC8vIFxuICAgICAgLy8gWy9tXSA9IHwxL20sIDAsIDB8XG4gICAgICAvLyAgICAgICAgfDAsIDEvbSwgMHxcbiAgICAgIC8vICAgICAgICB8MCwgMCwgMS9tfFxuICAgICAgLy8gXG4gICAgICAvLyBbcl5dID0gfDAsIC1yeiwgcnl8XG4gICAgICAvLyAgICAgICAgfHJ6LCAwLCAtcnh8XG4gICAgICAvLyAgICAgICAgfC1yeSwgcngsIDB8XG4gICAgICAvLyBcbiAgICAgIC8vIFsvSV0gPSBJbnZlcnRlZCBtb21lbnQgaW5lcnRpYVxuXG4gICAgICB2YXIgcnh4ID0gdGhpcy5tMSArIHRoaXMubTI7XG5cbiAgICAgIHZhciBrayA9IG5ldyBNYXQzMygpLnNldChyeHgsIDAsIDAsIDAsIHJ4eCwgMCwgMCwgMCwgcnh4KTtcbiAgICAgIHZhciBrID0ga2suZWxlbWVudHM7XG5cbiAgICAgIGtbMF0gKz0gaWkxWzRdICogdGhpcy5yMXogKiB0aGlzLnIxeiAtIChpaTFbN10gKyBpaTFbNV0pICogdGhpcy5yMXkgKiB0aGlzLnIxeiArIGlpMVs4XSAqIHRoaXMucjF5ICogdGhpcy5yMXk7XG4gICAgICBrWzFdICs9IChpaTFbNl0gKiB0aGlzLnIxeSArIGlpMVs1XSAqIHRoaXMucjF4KSAqIHRoaXMucjF6IC0gaWkxWzNdICogdGhpcy5yMXogKiB0aGlzLnIxeiAtIGlpMVs4XSAqIHRoaXMucjF4ICogdGhpcy5yMXk7XG4gICAgICBrWzJdICs9IChpaTFbM10gKiB0aGlzLnIxeSAtIGlpMVs0XSAqIHRoaXMucjF4KSAqIHRoaXMucjF6IC0gaWkxWzZdICogdGhpcy5yMXkgKiB0aGlzLnIxeSArIGlpMVs3XSAqIHRoaXMucjF4ICogdGhpcy5yMXk7XG4gICAgICBrWzNdICs9IChpaTFbMl0gKiB0aGlzLnIxeSArIGlpMVs3XSAqIHRoaXMucjF4KSAqIHRoaXMucjF6IC0gaWkxWzFdICogdGhpcy5yMXogKiB0aGlzLnIxeiAtIGlpMVs4XSAqIHRoaXMucjF4ICogdGhpcy5yMXk7XG4gICAgICBrWzRdICs9IGlpMVswXSAqIHRoaXMucjF6ICogdGhpcy5yMXogLSAoaWkxWzZdICsgaWkxWzJdKSAqIHRoaXMucjF4ICogdGhpcy5yMXogKyBpaTFbOF0gKiB0aGlzLnIxeCAqIHRoaXMucjF4O1xuICAgICAga1s1XSArPSAoaWkxWzFdICogdGhpcy5yMXggLSBpaTFbMF0gKiB0aGlzLnIxeSkgKiB0aGlzLnIxeiAtIGlpMVs3XSAqIHRoaXMucjF4ICogdGhpcy5yMXggKyBpaTFbNl0gKiB0aGlzLnIxeCAqIHRoaXMucjF5O1xuICAgICAga1s2XSArPSAoaWkxWzFdICogdGhpcy5yMXkgLSBpaTFbNF0gKiB0aGlzLnIxeCkgKiB0aGlzLnIxeiAtIGlpMVsyXSAqIHRoaXMucjF5ICogdGhpcy5yMXkgKyBpaTFbNV0gKiB0aGlzLnIxeCAqIHRoaXMucjF5O1xuICAgICAga1s3XSArPSAoaWkxWzNdICogdGhpcy5yMXggLSBpaTFbMF0gKiB0aGlzLnIxeSkgKiB0aGlzLnIxeiAtIGlpMVs1XSAqIHRoaXMucjF4ICogdGhpcy5yMXggKyBpaTFbMl0gKiB0aGlzLnIxeCAqIHRoaXMucjF5O1xuICAgICAga1s4XSArPSBpaTFbMF0gKiB0aGlzLnIxeSAqIHRoaXMucjF5IC0gKGlpMVszXSArIGlpMVsxXSkgKiB0aGlzLnIxeCAqIHRoaXMucjF5ICsgaWkxWzRdICogdGhpcy5yMXggKiB0aGlzLnIxeDtcblxuICAgICAga1swXSArPSBpaTJbNF0gKiB0aGlzLnIyeiAqIHRoaXMucjJ6IC0gKGlpMls3XSArIGlpMls1XSkgKiB0aGlzLnIyeSAqIHRoaXMucjJ6ICsgaWkyWzhdICogdGhpcy5yMnkgKiB0aGlzLnIyeTtcbiAgICAgIGtbMV0gKz0gKGlpMls2XSAqIHRoaXMucjJ5ICsgaWkyWzVdICogdGhpcy5yMngpICogdGhpcy5yMnogLSBpaTJbM10gKiB0aGlzLnIyeiAqIHRoaXMucjJ6IC0gaWkyWzhdICogdGhpcy5yMnggKiB0aGlzLnIyeTtcbiAgICAgIGtbMl0gKz0gKGlpMlszXSAqIHRoaXMucjJ5IC0gaWkyWzRdICogdGhpcy5yMngpICogdGhpcy5yMnogLSBpaTJbNl0gKiB0aGlzLnIyeSAqIHRoaXMucjJ5ICsgaWkyWzddICogdGhpcy5yMnggKiB0aGlzLnIyeTtcbiAgICAgIGtbM10gKz0gKGlpMlsyXSAqIHRoaXMucjJ5ICsgaWkyWzddICogdGhpcy5yMngpICogdGhpcy5yMnogLSBpaTJbMV0gKiB0aGlzLnIyeiAqIHRoaXMucjJ6IC0gaWkyWzhdICogdGhpcy5yMnggKiB0aGlzLnIyeTtcbiAgICAgIGtbNF0gKz0gaWkyWzBdICogdGhpcy5yMnogKiB0aGlzLnIyeiAtIChpaTJbNl0gKyBpaTJbMl0pICogdGhpcy5yMnggKiB0aGlzLnIyeiArIGlpMls4XSAqIHRoaXMucjJ4ICogdGhpcy5yMng7XG4gICAgICBrWzVdICs9IChpaTJbMV0gKiB0aGlzLnIyeCAtIGlpMlswXSAqIHRoaXMucjJ5KSAqIHRoaXMucjJ6IC0gaWkyWzddICogdGhpcy5yMnggKiB0aGlzLnIyeCArIGlpMls2XSAqIHRoaXMucjJ4ICogdGhpcy5yMnk7XG4gICAgICBrWzZdICs9IChpaTJbMV0gKiB0aGlzLnIyeSAtIGlpMls0XSAqIHRoaXMucjJ4KSAqIHRoaXMucjJ6IC0gaWkyWzJdICogdGhpcy5yMnkgKiB0aGlzLnIyeSArIGlpMls1XSAqIHRoaXMucjJ4ICogdGhpcy5yMnk7XG4gICAgICBrWzddICs9IChpaTJbM10gKiB0aGlzLnIyeCAtIGlpMlswXSAqIHRoaXMucjJ5KSAqIHRoaXMucjJ6IC0gaWkyWzVdICogdGhpcy5yMnggKiB0aGlzLnIyeCArIGlpMlsyXSAqIHRoaXMucjJ4ICogdGhpcy5yMnk7XG4gICAgICBrWzhdICs9IGlpMlswXSAqIHRoaXMucjJ5ICogdGhpcy5yMnkgLSAoaWkyWzNdICsgaWkyWzFdKSAqIHRoaXMucjJ4ICogdGhpcy5yMnkgKyBpaTJbNF0gKiB0aGlzLnIyeCAqIHRoaXMucjJ4O1xuXG4gICAgICB2YXIgaW52ID0gMSAvIChrWzBdICogKGtbNF0gKiBrWzhdIC0ga1s3XSAqIGtbNV0pICsga1szXSAqIChrWzddICoga1syXSAtIGtbMV0gKiBrWzhdKSArIGtbNl0gKiAoa1sxXSAqIGtbNV0gLSBrWzRdICoga1syXSkpO1xuICAgICAgdGhpcy5kZCA9IG5ldyBNYXQzMygpLnNldChcbiAgICAgICAga1s0XSAqIGtbOF0gLSBrWzVdICoga1s3XSwga1syXSAqIGtbN10gLSBrWzFdICoga1s4XSwga1sxXSAqIGtbNV0gLSBrWzJdICoga1s0XSxcbiAgICAgICAga1s1XSAqIGtbNl0gLSBrWzNdICoga1s4XSwga1swXSAqIGtbOF0gLSBrWzJdICoga1s2XSwga1syXSAqIGtbM10gLSBrWzBdICoga1s1XSxcbiAgICAgICAga1szXSAqIGtbN10gLSBrWzRdICoga1s2XSwga1sxXSAqIGtbNl0gLSBrWzBdICoga1s3XSwga1swXSAqIGtbNF0gLSBrWzFdICoga1szXVxuICAgICAgKS5zY2FsZUVxdWFsKGludik7XG5cbiAgICAgIHRoaXMudmVseCA9IHRoaXMucDIueCAtIHRoaXMucDEueDtcbiAgICAgIHRoaXMudmVseSA9IHRoaXMucDIueSAtIHRoaXMucDEueTtcbiAgICAgIHRoaXMudmVseiA9IHRoaXMucDIueiAtIHRoaXMucDEuejtcbiAgICAgIHZhciBsZW4gPSBfTWF0aC5zcXJ0KHRoaXMudmVseCAqIHRoaXMudmVseCArIHRoaXMudmVseSAqIHRoaXMudmVseSArIHRoaXMudmVseiAqIHRoaXMudmVseik7XG4gICAgICBpZiAobGVuID4gMC4wMDUpIHtcbiAgICAgICAgbGVuID0gKDAuMDA1IC0gbGVuKSAvIGxlbiAqIGludlRpbWVTdGVwICogMC4wNTtcbiAgICAgICAgdGhpcy52ZWx4ICo9IGxlbjtcbiAgICAgICAgdGhpcy52ZWx5ICo9IGxlbjtcbiAgICAgICAgdGhpcy52ZWx6ICo9IGxlbjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMudmVseCA9IDA7XG4gICAgICAgIHRoaXMudmVseSA9IDA7XG4gICAgICAgIHRoaXMudmVseiA9IDA7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuaW1weCAqPSAwLjk1O1xuICAgICAgdGhpcy5pbXB5ICo9IDAuOTU7XG4gICAgICB0aGlzLmltcHogKj0gMC45NTtcblxuICAgICAgdGhpcy5sMS54ICs9IHRoaXMuaW1weCAqIHRoaXMubTE7XG4gICAgICB0aGlzLmwxLnkgKz0gdGhpcy5pbXB5ICogdGhpcy5tMTtcbiAgICAgIHRoaXMubDEueiArPSB0aGlzLmltcHogKiB0aGlzLm0xO1xuICAgICAgdGhpcy5hMS54ICs9IHRoaXMuaW1weCAqIHRoaXMuYXgxeCArIHRoaXMuaW1weSAqIHRoaXMuYXkxeCArIHRoaXMuaW1weiAqIHRoaXMuYXoxeDtcbiAgICAgIHRoaXMuYTEueSArPSB0aGlzLmltcHggKiB0aGlzLmF4MXkgKyB0aGlzLmltcHkgKiB0aGlzLmF5MXkgKyB0aGlzLmltcHogKiB0aGlzLmF6MXk7XG4gICAgICB0aGlzLmExLnogKz0gdGhpcy5pbXB4ICogdGhpcy5heDF6ICsgdGhpcy5pbXB5ICogdGhpcy5heTF6ICsgdGhpcy5pbXB6ICogdGhpcy5hejF6O1xuICAgICAgdGhpcy5sMi54IC09IHRoaXMuaW1weCAqIHRoaXMubTI7XG4gICAgICB0aGlzLmwyLnkgLT0gdGhpcy5pbXB5ICogdGhpcy5tMjtcbiAgICAgIHRoaXMubDIueiAtPSB0aGlzLmltcHogKiB0aGlzLm0yO1xuICAgICAgdGhpcy5hMi54IC09IHRoaXMuaW1weCAqIHRoaXMuYXgyeCArIHRoaXMuaW1weSAqIHRoaXMuYXkyeCArIHRoaXMuaW1weiAqIHRoaXMuYXoyeDtcbiAgICAgIHRoaXMuYTIueSAtPSB0aGlzLmltcHggKiB0aGlzLmF4MnkgKyB0aGlzLmltcHkgKiB0aGlzLmF5MnkgKyB0aGlzLmltcHogKiB0aGlzLmF6Mnk7XG4gICAgICB0aGlzLmEyLnogLT0gdGhpcy5pbXB4ICogdGhpcy5heDJ6ICsgdGhpcy5pbXB5ICogdGhpcy5heTJ6ICsgdGhpcy5pbXB6ICogdGhpcy5hejJ6O1xuICAgIH0sXG5cbiAgICBzb2x2ZTogZnVuY3Rpb24gKCkge1xuXG4gICAgICB2YXIgZCA9IHRoaXMuZGQuZWxlbWVudHM7XG4gICAgICB2YXIgcnZ4ID0gdGhpcy5sMi54IC0gdGhpcy5sMS54ICsgdGhpcy5hMi55ICogdGhpcy5yMnogLSB0aGlzLmEyLnogKiB0aGlzLnIyeSAtIHRoaXMuYTEueSAqIHRoaXMucjF6ICsgdGhpcy5hMS56ICogdGhpcy5yMXkgLSB0aGlzLnZlbHg7XG4gICAgICB2YXIgcnZ5ID0gdGhpcy5sMi55IC0gdGhpcy5sMS55ICsgdGhpcy5hMi56ICogdGhpcy5yMnggLSB0aGlzLmEyLnggKiB0aGlzLnIyeiAtIHRoaXMuYTEueiAqIHRoaXMucjF4ICsgdGhpcy5hMS54ICogdGhpcy5yMXogLSB0aGlzLnZlbHk7XG4gICAgICB2YXIgcnZ6ID0gdGhpcy5sMi56IC0gdGhpcy5sMS56ICsgdGhpcy5hMi54ICogdGhpcy5yMnkgLSB0aGlzLmEyLnkgKiB0aGlzLnIyeCAtIHRoaXMuYTEueCAqIHRoaXMucjF5ICsgdGhpcy5hMS55ICogdGhpcy5yMXggLSB0aGlzLnZlbHo7XG4gICAgICB2YXIgbmltcHggPSBydnggKiBkWzBdICsgcnZ5ICogZFsxXSArIHJ2eiAqIGRbMl07XG4gICAgICB2YXIgbmltcHkgPSBydnggKiBkWzNdICsgcnZ5ICogZFs0XSArIHJ2eiAqIGRbNV07XG4gICAgICB2YXIgbmltcHogPSBydnggKiBkWzZdICsgcnZ5ICogZFs3XSArIHJ2eiAqIGRbOF07XG4gICAgICB0aGlzLmltcHggKz0gbmltcHg7XG4gICAgICB0aGlzLmltcHkgKz0gbmltcHk7XG4gICAgICB0aGlzLmltcHogKz0gbmltcHo7XG4gICAgICB0aGlzLmwxLnggKz0gbmltcHggKiB0aGlzLm0xO1xuICAgICAgdGhpcy5sMS55ICs9IG5pbXB5ICogdGhpcy5tMTtcbiAgICAgIHRoaXMubDEueiArPSBuaW1weiAqIHRoaXMubTE7XG4gICAgICB0aGlzLmExLnggKz0gbmltcHggKiB0aGlzLmF4MXggKyBuaW1weSAqIHRoaXMuYXkxeCArIG5pbXB6ICogdGhpcy5hejF4O1xuICAgICAgdGhpcy5hMS55ICs9IG5pbXB4ICogdGhpcy5heDF5ICsgbmltcHkgKiB0aGlzLmF5MXkgKyBuaW1weiAqIHRoaXMuYXoxeTtcbiAgICAgIHRoaXMuYTEueiArPSBuaW1weCAqIHRoaXMuYXgxeiArIG5pbXB5ICogdGhpcy5heTF6ICsgbmltcHogKiB0aGlzLmF6MXo7XG4gICAgICB0aGlzLmwyLnggLT0gbmltcHggKiB0aGlzLm0yO1xuICAgICAgdGhpcy5sMi55IC09IG5pbXB5ICogdGhpcy5tMjtcbiAgICAgIHRoaXMubDIueiAtPSBuaW1weiAqIHRoaXMubTI7XG4gICAgICB0aGlzLmEyLnggLT0gbmltcHggKiB0aGlzLmF4MnggKyBuaW1weSAqIHRoaXMuYXkyeCArIG5pbXB6ICogdGhpcy5hejJ4O1xuICAgICAgdGhpcy5hMi55IC09IG5pbXB4ICogdGhpcy5heDJ5ICsgbmltcHkgKiB0aGlzLmF5MnkgKyBuaW1weiAqIHRoaXMuYXoyeTtcbiAgICAgIHRoaXMuYTIueiAtPSBuaW1weCAqIHRoaXMuYXgyeiArIG5pbXB5ICogdGhpcy5heTJ6ICsgbmltcHogKiB0aGlzLmF6Mno7XG5cbiAgICB9XG5cbiAgfSk7XG5cbiAgLyoqXG4gICogQSB0aHJlZS1heGlzIHJvdGF0aW9uYWwgY29uc3RyYWludCBmb3IgdmFyaW91cyBqb2ludHMuXG4gICogQGF1dGhvciBzYWhhcmFuXG4gICovXG5cbiAgZnVuY3Rpb24gUm90YXRpb25hbDNDb25zdHJhaW50KGpvaW50LCBsaW1pdE1vdG9yMSwgbGltaXRNb3RvcjIsIGxpbWl0TW90b3IzKSB7XG5cbiAgICB0aGlzLmNmbTEgPSBOYU47XG4gICAgdGhpcy5jZm0yID0gTmFOO1xuICAgIHRoaXMuY2ZtMyA9IE5hTjtcbiAgICB0aGlzLmkxZTAwID0gTmFOO1xuICAgIHRoaXMuaTFlMDEgPSBOYU47XG4gICAgdGhpcy5pMWUwMiA9IE5hTjtcbiAgICB0aGlzLmkxZTEwID0gTmFOO1xuICAgIHRoaXMuaTFlMTEgPSBOYU47XG4gICAgdGhpcy5pMWUxMiA9IE5hTjtcbiAgICB0aGlzLmkxZTIwID0gTmFOO1xuICAgIHRoaXMuaTFlMjEgPSBOYU47XG4gICAgdGhpcy5pMWUyMiA9IE5hTjtcbiAgICB0aGlzLmkyZTAwID0gTmFOO1xuICAgIHRoaXMuaTJlMDEgPSBOYU47XG4gICAgdGhpcy5pMmUwMiA9IE5hTjtcbiAgICB0aGlzLmkyZTEwID0gTmFOO1xuICAgIHRoaXMuaTJlMTEgPSBOYU47XG4gICAgdGhpcy5pMmUxMiA9IE5hTjtcbiAgICB0aGlzLmkyZTIwID0gTmFOO1xuICAgIHRoaXMuaTJlMjEgPSBOYU47XG4gICAgdGhpcy5pMmUyMiA9IE5hTjtcbiAgICB0aGlzLmF4MSA9IE5hTjtcbiAgICB0aGlzLmF5MSA9IE5hTjtcbiAgICB0aGlzLmF6MSA9IE5hTjtcbiAgICB0aGlzLmF4MiA9IE5hTjtcbiAgICB0aGlzLmF5MiA9IE5hTjtcbiAgICB0aGlzLmF6MiA9IE5hTjtcbiAgICB0aGlzLmF4MyA9IE5hTjtcbiAgICB0aGlzLmF5MyA9IE5hTjtcbiAgICB0aGlzLmF6MyA9IE5hTjtcblxuICAgIHRoaXMuYTF4MSA9IE5hTjsgLy8gamFjb2lhbnNcbiAgICB0aGlzLmExeTEgPSBOYU47XG4gICAgdGhpcy5hMXoxID0gTmFOO1xuICAgIHRoaXMuYTJ4MSA9IE5hTjtcbiAgICB0aGlzLmEyeTEgPSBOYU47XG4gICAgdGhpcy5hMnoxID0gTmFOO1xuICAgIHRoaXMuYTF4MiA9IE5hTjtcbiAgICB0aGlzLmExeTIgPSBOYU47XG4gICAgdGhpcy5hMXoyID0gTmFOO1xuICAgIHRoaXMuYTJ4MiA9IE5hTjtcbiAgICB0aGlzLmEyeTIgPSBOYU47XG4gICAgdGhpcy5hMnoyID0gTmFOO1xuICAgIHRoaXMuYTF4MyA9IE5hTjtcbiAgICB0aGlzLmExeTMgPSBOYU47XG4gICAgdGhpcy5hMXozID0gTmFOO1xuICAgIHRoaXMuYTJ4MyA9IE5hTjtcbiAgICB0aGlzLmEyeTMgPSBOYU47XG4gICAgdGhpcy5hMnozID0gTmFOO1xuXG4gICAgdGhpcy5sb3dlckxpbWl0MSA9IE5hTjtcbiAgICB0aGlzLnVwcGVyTGltaXQxID0gTmFOO1xuICAgIHRoaXMubGltaXRWZWxvY2l0eTEgPSBOYU47XG4gICAgdGhpcy5saW1pdFN0YXRlMSA9IDA7IC8vIC0xOiBhdCBsb3dlciwgMDogbG9ja2VkLCAxOiBhdCB1cHBlciwgMjogZnJlZVxuICAgIHRoaXMuZW5hYmxlTW90b3IxID0gZmFsc2U7XG4gICAgdGhpcy5tb3RvclNwZWVkMSA9IE5hTjtcbiAgICB0aGlzLm1heE1vdG9yRm9yY2UxID0gTmFOO1xuICAgIHRoaXMubWF4TW90b3JJbXB1bHNlMSA9IE5hTjtcbiAgICB0aGlzLmxvd2VyTGltaXQyID0gTmFOO1xuICAgIHRoaXMudXBwZXJMaW1pdDIgPSBOYU47XG4gICAgdGhpcy5saW1pdFZlbG9jaXR5MiA9IE5hTjtcbiAgICB0aGlzLmxpbWl0U3RhdGUyID0gMDsgLy8gLTE6IGF0IGxvd2VyLCAwOiBsb2NrZWQsIDE6IGF0IHVwcGVyLCAyOiBmcmVlXG4gICAgdGhpcy5lbmFibGVNb3RvcjIgPSBmYWxzZTtcbiAgICB0aGlzLm1vdG9yU3BlZWQyID0gTmFOO1xuICAgIHRoaXMubWF4TW90b3JGb3JjZTIgPSBOYU47XG4gICAgdGhpcy5tYXhNb3RvckltcHVsc2UyID0gTmFOO1xuICAgIHRoaXMubG93ZXJMaW1pdDMgPSBOYU47XG4gICAgdGhpcy51cHBlckxpbWl0MyA9IE5hTjtcbiAgICB0aGlzLmxpbWl0VmVsb2NpdHkzID0gTmFOO1xuICAgIHRoaXMubGltaXRTdGF0ZTMgPSAwOyAvLyAtMTogYXQgbG93ZXIsIDA6IGxvY2tlZCwgMTogYXQgdXBwZXIsIDI6IGZyZWVcbiAgICB0aGlzLmVuYWJsZU1vdG9yMyA9IGZhbHNlO1xuICAgIHRoaXMubW90b3JTcGVlZDMgPSBOYU47XG4gICAgdGhpcy5tYXhNb3RvckZvcmNlMyA9IE5hTjtcbiAgICB0aGlzLm1heE1vdG9ySW1wdWxzZTMgPSBOYU47XG5cbiAgICB0aGlzLmswMCA9IE5hTjsgLy8gSyA9IEoqTSpKVFxuICAgIHRoaXMuazAxID0gTmFOO1xuICAgIHRoaXMuazAyID0gTmFOO1xuICAgIHRoaXMuazEwID0gTmFOO1xuICAgIHRoaXMuazExID0gTmFOO1xuICAgIHRoaXMuazEyID0gTmFOO1xuICAgIHRoaXMuazIwID0gTmFOO1xuICAgIHRoaXMuazIxID0gTmFOO1xuICAgIHRoaXMuazIyID0gTmFOO1xuXG4gICAgdGhpcy5rdjAwID0gTmFOOyAvLyBkaWFnb25hbHMgd2l0aG91dCBDRk1zXG4gICAgdGhpcy5rdjExID0gTmFOO1xuICAgIHRoaXMua3YyMiA9IE5hTjtcblxuICAgIHRoaXMuZHYwMCA9IE5hTjsgLy8gLi4uaW52ZXJ0ZWRcbiAgICB0aGlzLmR2MTEgPSBOYU47XG4gICAgdGhpcy5kdjIyID0gTmFOO1xuXG4gICAgdGhpcy5kMDAgPSBOYU47ICAvLyBLXi0xXG4gICAgdGhpcy5kMDEgPSBOYU47XG4gICAgdGhpcy5kMDIgPSBOYU47XG4gICAgdGhpcy5kMTAgPSBOYU47XG4gICAgdGhpcy5kMTEgPSBOYU47XG4gICAgdGhpcy5kMTIgPSBOYU47XG4gICAgdGhpcy5kMjAgPSBOYU47XG4gICAgdGhpcy5kMjEgPSBOYU47XG4gICAgdGhpcy5kMjIgPSBOYU47XG5cbiAgICB0aGlzLmxpbWl0TW90b3IxID0gbGltaXRNb3RvcjE7XG4gICAgdGhpcy5saW1pdE1vdG9yMiA9IGxpbWl0TW90b3IyO1xuICAgIHRoaXMubGltaXRNb3RvcjMgPSBsaW1pdE1vdG9yMztcbiAgICB0aGlzLmIxID0gam9pbnQuYm9keTE7XG4gICAgdGhpcy5iMiA9IGpvaW50LmJvZHkyO1xuICAgIHRoaXMuYTEgPSB0aGlzLmIxLmFuZ3VsYXJWZWxvY2l0eTtcbiAgICB0aGlzLmEyID0gdGhpcy5iMi5hbmd1bGFyVmVsb2NpdHk7XG4gICAgdGhpcy5pMSA9IHRoaXMuYjEuaW52ZXJzZUluZXJ0aWE7XG4gICAgdGhpcy5pMiA9IHRoaXMuYjIuaW52ZXJzZUluZXJ0aWE7XG4gICAgdGhpcy5saW1pdEltcHVsc2UxID0gMDtcbiAgICB0aGlzLm1vdG9ySW1wdWxzZTEgPSAwO1xuICAgIHRoaXMubGltaXRJbXB1bHNlMiA9IDA7XG4gICAgdGhpcy5tb3RvckltcHVsc2UyID0gMDtcbiAgICB0aGlzLmxpbWl0SW1wdWxzZTMgPSAwO1xuICAgIHRoaXMubW90b3JJbXB1bHNlMyA9IDA7XG5cbiAgfVxuXG4gIE9iamVjdC5hc3NpZ24oUm90YXRpb25hbDNDb25zdHJhaW50LnByb3RvdHlwZSwge1xuXG4gICAgUm90YXRpb25hbDNDb25zdHJhaW50OiB0cnVlLFxuXG4gICAgcHJlU29sdmU6IGZ1bmN0aW9uICh0aW1lU3RlcCwgaW52VGltZVN0ZXApIHtcblxuICAgICAgdGhpcy5heDEgPSB0aGlzLmxpbWl0TW90b3IxLmF4aXMueDtcbiAgICAgIHRoaXMuYXkxID0gdGhpcy5saW1pdE1vdG9yMS5heGlzLnk7XG4gICAgICB0aGlzLmF6MSA9IHRoaXMubGltaXRNb3RvcjEuYXhpcy56O1xuICAgICAgdGhpcy5heDIgPSB0aGlzLmxpbWl0TW90b3IyLmF4aXMueDtcbiAgICAgIHRoaXMuYXkyID0gdGhpcy5saW1pdE1vdG9yMi5heGlzLnk7XG4gICAgICB0aGlzLmF6MiA9IHRoaXMubGltaXRNb3RvcjIuYXhpcy56O1xuICAgICAgdGhpcy5heDMgPSB0aGlzLmxpbWl0TW90b3IzLmF4aXMueDtcbiAgICAgIHRoaXMuYXkzID0gdGhpcy5saW1pdE1vdG9yMy5heGlzLnk7XG4gICAgICB0aGlzLmF6MyA9IHRoaXMubGltaXRNb3RvcjMuYXhpcy56O1xuICAgICAgdGhpcy5sb3dlckxpbWl0MSA9IHRoaXMubGltaXRNb3RvcjEubG93ZXJMaW1pdDtcbiAgICAgIHRoaXMudXBwZXJMaW1pdDEgPSB0aGlzLmxpbWl0TW90b3IxLnVwcGVyTGltaXQ7XG4gICAgICB0aGlzLm1vdG9yU3BlZWQxID0gdGhpcy5saW1pdE1vdG9yMS5tb3RvclNwZWVkO1xuICAgICAgdGhpcy5tYXhNb3RvckZvcmNlMSA9IHRoaXMubGltaXRNb3RvcjEubWF4TW90b3JGb3JjZTtcbiAgICAgIHRoaXMuZW5hYmxlTW90b3IxID0gdGhpcy5tYXhNb3RvckZvcmNlMSA+IDA7XG4gICAgICB0aGlzLmxvd2VyTGltaXQyID0gdGhpcy5saW1pdE1vdG9yMi5sb3dlckxpbWl0O1xuICAgICAgdGhpcy51cHBlckxpbWl0MiA9IHRoaXMubGltaXRNb3RvcjIudXBwZXJMaW1pdDtcbiAgICAgIHRoaXMubW90b3JTcGVlZDIgPSB0aGlzLmxpbWl0TW90b3IyLm1vdG9yU3BlZWQ7XG4gICAgICB0aGlzLm1heE1vdG9yRm9yY2UyID0gdGhpcy5saW1pdE1vdG9yMi5tYXhNb3RvckZvcmNlO1xuICAgICAgdGhpcy5lbmFibGVNb3RvcjIgPSB0aGlzLm1heE1vdG9yRm9yY2UyID4gMDtcbiAgICAgIHRoaXMubG93ZXJMaW1pdDMgPSB0aGlzLmxpbWl0TW90b3IzLmxvd2VyTGltaXQ7XG4gICAgICB0aGlzLnVwcGVyTGltaXQzID0gdGhpcy5saW1pdE1vdG9yMy51cHBlckxpbWl0O1xuICAgICAgdGhpcy5tb3RvclNwZWVkMyA9IHRoaXMubGltaXRNb3RvcjMubW90b3JTcGVlZDtcbiAgICAgIHRoaXMubWF4TW90b3JGb3JjZTMgPSB0aGlzLmxpbWl0TW90b3IzLm1heE1vdG9yRm9yY2U7XG4gICAgICB0aGlzLmVuYWJsZU1vdG9yMyA9IHRoaXMubWF4TW90b3JGb3JjZTMgPiAwO1xuXG4gICAgICB2YXIgdGkxID0gdGhpcy5pMS5lbGVtZW50cztcbiAgICAgIHZhciB0aTIgPSB0aGlzLmkyLmVsZW1lbnRzO1xuICAgICAgdGhpcy5pMWUwMCA9IHRpMVswXTtcbiAgICAgIHRoaXMuaTFlMDEgPSB0aTFbMV07XG4gICAgICB0aGlzLmkxZTAyID0gdGkxWzJdO1xuICAgICAgdGhpcy5pMWUxMCA9IHRpMVszXTtcbiAgICAgIHRoaXMuaTFlMTEgPSB0aTFbNF07XG4gICAgICB0aGlzLmkxZTEyID0gdGkxWzVdO1xuICAgICAgdGhpcy5pMWUyMCA9IHRpMVs2XTtcbiAgICAgIHRoaXMuaTFlMjEgPSB0aTFbN107XG4gICAgICB0aGlzLmkxZTIyID0gdGkxWzhdO1xuXG4gICAgICB0aGlzLmkyZTAwID0gdGkyWzBdO1xuICAgICAgdGhpcy5pMmUwMSA9IHRpMlsxXTtcbiAgICAgIHRoaXMuaTJlMDIgPSB0aTJbMl07XG4gICAgICB0aGlzLmkyZTEwID0gdGkyWzNdO1xuICAgICAgdGhpcy5pMmUxMSA9IHRpMls0XTtcbiAgICAgIHRoaXMuaTJlMTIgPSB0aTJbNV07XG4gICAgICB0aGlzLmkyZTIwID0gdGkyWzZdO1xuICAgICAgdGhpcy5pMmUyMSA9IHRpMls3XTtcbiAgICAgIHRoaXMuaTJlMjIgPSB0aTJbOF07XG5cbiAgICAgIHZhciBmcmVxdWVuY3kxID0gdGhpcy5saW1pdE1vdG9yMS5mcmVxdWVuY3k7XG4gICAgICB2YXIgZnJlcXVlbmN5MiA9IHRoaXMubGltaXRNb3RvcjIuZnJlcXVlbmN5O1xuICAgICAgdmFyIGZyZXF1ZW5jeTMgPSB0aGlzLmxpbWl0TW90b3IzLmZyZXF1ZW5jeTtcbiAgICAgIHZhciBlbmFibGVTcHJpbmcxID0gZnJlcXVlbmN5MSA+IDA7XG4gICAgICB2YXIgZW5hYmxlU3ByaW5nMiA9IGZyZXF1ZW5jeTIgPiAwO1xuICAgICAgdmFyIGVuYWJsZVNwcmluZzMgPSBmcmVxdWVuY3kzID4gMDtcbiAgICAgIHZhciBlbmFibGVMaW1pdDEgPSB0aGlzLmxvd2VyTGltaXQxIDw9IHRoaXMudXBwZXJMaW1pdDE7XG4gICAgICB2YXIgZW5hYmxlTGltaXQyID0gdGhpcy5sb3dlckxpbWl0MiA8PSB0aGlzLnVwcGVyTGltaXQyO1xuICAgICAgdmFyIGVuYWJsZUxpbWl0MyA9IHRoaXMubG93ZXJMaW1pdDMgPD0gdGhpcy51cHBlckxpbWl0MztcbiAgICAgIHZhciBhbmdsZTEgPSB0aGlzLmxpbWl0TW90b3IxLmFuZ2xlO1xuICAgICAgaWYgKGVuYWJsZUxpbWl0MSkge1xuICAgICAgICBpZiAodGhpcy5sb3dlckxpbWl0MSA9PSB0aGlzLnVwcGVyTGltaXQxKSB7XG4gICAgICAgICAgaWYgKHRoaXMubGltaXRTdGF0ZTEgIT0gMCkge1xuICAgICAgICAgICAgdGhpcy5saW1pdFN0YXRlMSA9IDA7XG4gICAgICAgICAgICB0aGlzLmxpbWl0SW1wdWxzZTEgPSAwO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLmxpbWl0VmVsb2NpdHkxID0gdGhpcy5sb3dlckxpbWl0MSAtIGFuZ2xlMTtcbiAgICAgICAgfSBlbHNlIGlmIChhbmdsZTEgPCB0aGlzLmxvd2VyTGltaXQxKSB7XG4gICAgICAgICAgaWYgKHRoaXMubGltaXRTdGF0ZTEgIT0gLTEpIHtcbiAgICAgICAgICAgIHRoaXMubGltaXRTdGF0ZTEgPSAtMTtcbiAgICAgICAgICAgIHRoaXMubGltaXRJbXB1bHNlMSA9IDA7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMubGltaXRWZWxvY2l0eTEgPSB0aGlzLmxvd2VyTGltaXQxIC0gYW5nbGUxO1xuICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlMSA+IHRoaXMudXBwZXJMaW1pdDEpIHtcbiAgICAgICAgICBpZiAodGhpcy5saW1pdFN0YXRlMSAhPSAxKSB7XG4gICAgICAgICAgICB0aGlzLmxpbWl0U3RhdGUxID0gMTtcbiAgICAgICAgICAgIHRoaXMubGltaXRJbXB1bHNlMSA9IDA7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMubGltaXRWZWxvY2l0eTEgPSB0aGlzLnVwcGVyTGltaXQxIC0gYW5nbGUxO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMubGltaXRTdGF0ZTEgPSAyO1xuICAgICAgICAgIHRoaXMubGltaXRJbXB1bHNlMSA9IDA7XG4gICAgICAgICAgdGhpcy5saW1pdFZlbG9jaXR5MSA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFlbmFibGVTcHJpbmcxKSB7XG4gICAgICAgICAgaWYgKHRoaXMubGltaXRWZWxvY2l0eTEgPiAwLjAyKSB0aGlzLmxpbWl0VmVsb2NpdHkxIC09IDAuMDI7XG4gICAgICAgICAgZWxzZSBpZiAodGhpcy5saW1pdFZlbG9jaXR5MSA8IC0wLjAyKSB0aGlzLmxpbWl0VmVsb2NpdHkxICs9IDAuMDI7XG4gICAgICAgICAgZWxzZSB0aGlzLmxpbWl0VmVsb2NpdHkxID0gMDtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5saW1pdFN0YXRlMSA9IDI7XG4gICAgICAgIHRoaXMubGltaXRJbXB1bHNlMSA9IDA7XG4gICAgICB9XG5cbiAgICAgIHZhciBhbmdsZTIgPSB0aGlzLmxpbWl0TW90b3IyLmFuZ2xlO1xuICAgICAgaWYgKGVuYWJsZUxpbWl0Mikge1xuICAgICAgICBpZiAodGhpcy5sb3dlckxpbWl0MiA9PSB0aGlzLnVwcGVyTGltaXQyKSB7XG4gICAgICAgICAgaWYgKHRoaXMubGltaXRTdGF0ZTIgIT0gMCkge1xuICAgICAgICAgICAgdGhpcy5saW1pdFN0YXRlMiA9IDA7XG4gICAgICAgICAgICB0aGlzLmxpbWl0SW1wdWxzZTIgPSAwO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLmxpbWl0VmVsb2NpdHkyID0gdGhpcy5sb3dlckxpbWl0MiAtIGFuZ2xlMjtcbiAgICAgICAgfSBlbHNlIGlmIChhbmdsZTIgPCB0aGlzLmxvd2VyTGltaXQyKSB7XG4gICAgICAgICAgaWYgKHRoaXMubGltaXRTdGF0ZTIgIT0gLTEpIHtcbiAgICAgICAgICAgIHRoaXMubGltaXRTdGF0ZTIgPSAtMTtcbiAgICAgICAgICAgIHRoaXMubGltaXRJbXB1bHNlMiA9IDA7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMubGltaXRWZWxvY2l0eTIgPSB0aGlzLmxvd2VyTGltaXQyIC0gYW5nbGUyO1xuICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlMiA+IHRoaXMudXBwZXJMaW1pdDIpIHtcbiAgICAgICAgICBpZiAodGhpcy5saW1pdFN0YXRlMiAhPSAxKSB7XG4gICAgICAgICAgICB0aGlzLmxpbWl0U3RhdGUyID0gMTtcbiAgICAgICAgICAgIHRoaXMubGltaXRJbXB1bHNlMiA9IDA7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMubGltaXRWZWxvY2l0eTIgPSB0aGlzLnVwcGVyTGltaXQyIC0gYW5nbGUyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMubGltaXRTdGF0ZTIgPSAyO1xuICAgICAgICAgIHRoaXMubGltaXRJbXB1bHNlMiA9IDA7XG4gICAgICAgICAgdGhpcy5saW1pdFZlbG9jaXR5MiA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFlbmFibGVTcHJpbmcyKSB7XG4gICAgICAgICAgaWYgKHRoaXMubGltaXRWZWxvY2l0eTIgPiAwLjAyKSB0aGlzLmxpbWl0VmVsb2NpdHkyIC09IDAuMDI7XG4gICAgICAgICAgZWxzZSBpZiAodGhpcy5saW1pdFZlbG9jaXR5MiA8IC0wLjAyKSB0aGlzLmxpbWl0VmVsb2NpdHkyICs9IDAuMDI7XG4gICAgICAgICAgZWxzZSB0aGlzLmxpbWl0VmVsb2NpdHkyID0gMDtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5saW1pdFN0YXRlMiA9IDI7XG4gICAgICAgIHRoaXMubGltaXRJbXB1bHNlMiA9IDA7XG4gICAgICB9XG5cbiAgICAgIHZhciBhbmdsZTMgPSB0aGlzLmxpbWl0TW90b3IzLmFuZ2xlO1xuICAgICAgaWYgKGVuYWJsZUxpbWl0Mykge1xuICAgICAgICBpZiAodGhpcy5sb3dlckxpbWl0MyA9PSB0aGlzLnVwcGVyTGltaXQzKSB7XG4gICAgICAgICAgaWYgKHRoaXMubGltaXRTdGF0ZTMgIT0gMCkge1xuICAgICAgICAgICAgdGhpcy5saW1pdFN0YXRlMyA9IDA7XG4gICAgICAgICAgICB0aGlzLmxpbWl0SW1wdWxzZTMgPSAwO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLmxpbWl0VmVsb2NpdHkzID0gdGhpcy5sb3dlckxpbWl0MyAtIGFuZ2xlMztcbiAgICAgICAgfSBlbHNlIGlmIChhbmdsZTMgPCB0aGlzLmxvd2VyTGltaXQzKSB7XG4gICAgICAgICAgaWYgKHRoaXMubGltaXRTdGF0ZTMgIT0gLTEpIHtcbiAgICAgICAgICAgIHRoaXMubGltaXRTdGF0ZTMgPSAtMTtcbiAgICAgICAgICAgIHRoaXMubGltaXRJbXB1bHNlMyA9IDA7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMubGltaXRWZWxvY2l0eTMgPSB0aGlzLmxvd2VyTGltaXQzIC0gYW5nbGUzO1xuICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlMyA+IHRoaXMudXBwZXJMaW1pdDMpIHtcbiAgICAgICAgICBpZiAodGhpcy5saW1pdFN0YXRlMyAhPSAxKSB7XG4gICAgICAgICAgICB0aGlzLmxpbWl0U3RhdGUzID0gMTtcbiAgICAgICAgICAgIHRoaXMubGltaXRJbXB1bHNlMyA9IDA7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMubGltaXRWZWxvY2l0eTMgPSB0aGlzLnVwcGVyTGltaXQzIC0gYW5nbGUzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMubGltaXRTdGF0ZTMgPSAyO1xuICAgICAgICAgIHRoaXMubGltaXRJbXB1bHNlMyA9IDA7XG4gICAgICAgICAgdGhpcy5saW1pdFZlbG9jaXR5MyA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFlbmFibGVTcHJpbmczKSB7XG4gICAgICAgICAgaWYgKHRoaXMubGltaXRWZWxvY2l0eTMgPiAwLjAyKSB0aGlzLmxpbWl0VmVsb2NpdHkzIC09IDAuMDI7XG4gICAgICAgICAgZWxzZSBpZiAodGhpcy5saW1pdFZlbG9jaXR5MyA8IC0wLjAyKSB0aGlzLmxpbWl0VmVsb2NpdHkzICs9IDAuMDI7XG4gICAgICAgICAgZWxzZSB0aGlzLmxpbWl0VmVsb2NpdHkzID0gMDtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5saW1pdFN0YXRlMyA9IDI7XG4gICAgICAgIHRoaXMubGltaXRJbXB1bHNlMyA9IDA7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLmVuYWJsZU1vdG9yMSAmJiAodGhpcy5saW1pdFN0YXRlMSAhPSAwIHx8IGVuYWJsZVNwcmluZzEpKSB7XG4gICAgICAgIHRoaXMubWF4TW90b3JJbXB1bHNlMSA9IHRoaXMubWF4TW90b3JGb3JjZTEgKiB0aW1lU3RlcDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMubW90b3JJbXB1bHNlMSA9IDA7XG4gICAgICAgIHRoaXMubWF4TW90b3JJbXB1bHNlMSA9IDA7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5lbmFibGVNb3RvcjIgJiYgKHRoaXMubGltaXRTdGF0ZTIgIT0gMCB8fCBlbmFibGVTcHJpbmcyKSkge1xuICAgICAgICB0aGlzLm1heE1vdG9ySW1wdWxzZTIgPSB0aGlzLm1heE1vdG9yRm9yY2UyICogdGltZVN0ZXA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLm1vdG9ySW1wdWxzZTIgPSAwO1xuICAgICAgICB0aGlzLm1heE1vdG9ySW1wdWxzZTIgPSAwO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuZW5hYmxlTW90b3IzICYmICh0aGlzLmxpbWl0U3RhdGUzICE9IDAgfHwgZW5hYmxlU3ByaW5nMykpIHtcbiAgICAgICAgdGhpcy5tYXhNb3RvckltcHVsc2UzID0gdGhpcy5tYXhNb3RvckZvcmNlMyAqIHRpbWVTdGVwO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5tb3RvckltcHVsc2UzID0gMDtcbiAgICAgICAgdGhpcy5tYXhNb3RvckltcHVsc2UzID0gMDtcbiAgICAgIH1cblxuICAgICAgLy8gYnVpbGQgamFjb2JpYW5zXG4gICAgICB0aGlzLmExeDEgPSB0aGlzLmF4MSAqIHRoaXMuaTFlMDAgKyB0aGlzLmF5MSAqIHRoaXMuaTFlMDEgKyB0aGlzLmF6MSAqIHRoaXMuaTFlMDI7XG4gICAgICB0aGlzLmExeTEgPSB0aGlzLmF4MSAqIHRoaXMuaTFlMTAgKyB0aGlzLmF5MSAqIHRoaXMuaTFlMTEgKyB0aGlzLmF6MSAqIHRoaXMuaTFlMTI7XG4gICAgICB0aGlzLmExejEgPSB0aGlzLmF4MSAqIHRoaXMuaTFlMjAgKyB0aGlzLmF5MSAqIHRoaXMuaTFlMjEgKyB0aGlzLmF6MSAqIHRoaXMuaTFlMjI7XG4gICAgICB0aGlzLmEyeDEgPSB0aGlzLmF4MSAqIHRoaXMuaTJlMDAgKyB0aGlzLmF5MSAqIHRoaXMuaTJlMDEgKyB0aGlzLmF6MSAqIHRoaXMuaTJlMDI7XG4gICAgICB0aGlzLmEyeTEgPSB0aGlzLmF4MSAqIHRoaXMuaTJlMTAgKyB0aGlzLmF5MSAqIHRoaXMuaTJlMTEgKyB0aGlzLmF6MSAqIHRoaXMuaTJlMTI7XG4gICAgICB0aGlzLmEyejEgPSB0aGlzLmF4MSAqIHRoaXMuaTJlMjAgKyB0aGlzLmF5MSAqIHRoaXMuaTJlMjEgKyB0aGlzLmF6MSAqIHRoaXMuaTJlMjI7XG5cbiAgICAgIHRoaXMuYTF4MiA9IHRoaXMuYXgyICogdGhpcy5pMWUwMCArIHRoaXMuYXkyICogdGhpcy5pMWUwMSArIHRoaXMuYXoyICogdGhpcy5pMWUwMjtcbiAgICAgIHRoaXMuYTF5MiA9IHRoaXMuYXgyICogdGhpcy5pMWUxMCArIHRoaXMuYXkyICogdGhpcy5pMWUxMSArIHRoaXMuYXoyICogdGhpcy5pMWUxMjtcbiAgICAgIHRoaXMuYTF6MiA9IHRoaXMuYXgyICogdGhpcy5pMWUyMCArIHRoaXMuYXkyICogdGhpcy5pMWUyMSArIHRoaXMuYXoyICogdGhpcy5pMWUyMjtcbiAgICAgIHRoaXMuYTJ4MiA9IHRoaXMuYXgyICogdGhpcy5pMmUwMCArIHRoaXMuYXkyICogdGhpcy5pMmUwMSArIHRoaXMuYXoyICogdGhpcy5pMmUwMjtcbiAgICAgIHRoaXMuYTJ5MiA9IHRoaXMuYXgyICogdGhpcy5pMmUxMCArIHRoaXMuYXkyICogdGhpcy5pMmUxMSArIHRoaXMuYXoyICogdGhpcy5pMmUxMjtcbiAgICAgIHRoaXMuYTJ6MiA9IHRoaXMuYXgyICogdGhpcy5pMmUyMCArIHRoaXMuYXkyICogdGhpcy5pMmUyMSArIHRoaXMuYXoyICogdGhpcy5pMmUyMjtcblxuICAgICAgdGhpcy5hMXgzID0gdGhpcy5heDMgKiB0aGlzLmkxZTAwICsgdGhpcy5heTMgKiB0aGlzLmkxZTAxICsgdGhpcy5hejMgKiB0aGlzLmkxZTAyO1xuICAgICAgdGhpcy5hMXkzID0gdGhpcy5heDMgKiB0aGlzLmkxZTEwICsgdGhpcy5heTMgKiB0aGlzLmkxZTExICsgdGhpcy5hejMgKiB0aGlzLmkxZTEyO1xuICAgICAgdGhpcy5hMXozID0gdGhpcy5heDMgKiB0aGlzLmkxZTIwICsgdGhpcy5heTMgKiB0aGlzLmkxZTIxICsgdGhpcy5hejMgKiB0aGlzLmkxZTIyO1xuICAgICAgdGhpcy5hMngzID0gdGhpcy5heDMgKiB0aGlzLmkyZTAwICsgdGhpcy5heTMgKiB0aGlzLmkyZTAxICsgdGhpcy5hejMgKiB0aGlzLmkyZTAyO1xuICAgICAgdGhpcy5hMnkzID0gdGhpcy5heDMgKiB0aGlzLmkyZTEwICsgdGhpcy5heTMgKiB0aGlzLmkyZTExICsgdGhpcy5hejMgKiB0aGlzLmkyZTEyO1xuICAgICAgdGhpcy5hMnozID0gdGhpcy5heDMgKiB0aGlzLmkyZTIwICsgdGhpcy5heTMgKiB0aGlzLmkyZTIxICsgdGhpcy5hejMgKiB0aGlzLmkyZTIyO1xuXG4gICAgICAvLyBidWlsZCBhbiBpbXB1bHNlIG1hdHJpeFxuICAgICAgdGhpcy5rMDAgPSB0aGlzLmF4MSAqICh0aGlzLmExeDEgKyB0aGlzLmEyeDEpICsgdGhpcy5heTEgKiAodGhpcy5hMXkxICsgdGhpcy5hMnkxKSArIHRoaXMuYXoxICogKHRoaXMuYTF6MSArIHRoaXMuYTJ6MSk7XG4gICAgICB0aGlzLmswMSA9IHRoaXMuYXgxICogKHRoaXMuYTF4MiArIHRoaXMuYTJ4MikgKyB0aGlzLmF5MSAqICh0aGlzLmExeTIgKyB0aGlzLmEyeTIpICsgdGhpcy5hejEgKiAodGhpcy5hMXoyICsgdGhpcy5hMnoyKTtcbiAgICAgIHRoaXMuazAyID0gdGhpcy5heDEgKiAodGhpcy5hMXgzICsgdGhpcy5hMngzKSArIHRoaXMuYXkxICogKHRoaXMuYTF5MyArIHRoaXMuYTJ5MykgKyB0aGlzLmF6MSAqICh0aGlzLmExejMgKyB0aGlzLmEyejMpO1xuICAgICAgdGhpcy5rMTAgPSB0aGlzLmF4MiAqICh0aGlzLmExeDEgKyB0aGlzLmEyeDEpICsgdGhpcy5heTIgKiAodGhpcy5hMXkxICsgdGhpcy5hMnkxKSArIHRoaXMuYXoyICogKHRoaXMuYTF6MSArIHRoaXMuYTJ6MSk7XG4gICAgICB0aGlzLmsxMSA9IHRoaXMuYXgyICogKHRoaXMuYTF4MiArIHRoaXMuYTJ4MikgKyB0aGlzLmF5MiAqICh0aGlzLmExeTIgKyB0aGlzLmEyeTIpICsgdGhpcy5hejIgKiAodGhpcy5hMXoyICsgdGhpcy5hMnoyKTtcbiAgICAgIHRoaXMuazEyID0gdGhpcy5heDIgKiAodGhpcy5hMXgzICsgdGhpcy5hMngzKSArIHRoaXMuYXkyICogKHRoaXMuYTF5MyArIHRoaXMuYTJ5MykgKyB0aGlzLmF6MiAqICh0aGlzLmExejMgKyB0aGlzLmEyejMpO1xuICAgICAgdGhpcy5rMjAgPSB0aGlzLmF4MyAqICh0aGlzLmExeDEgKyB0aGlzLmEyeDEpICsgdGhpcy5heTMgKiAodGhpcy5hMXkxICsgdGhpcy5hMnkxKSArIHRoaXMuYXozICogKHRoaXMuYTF6MSArIHRoaXMuYTJ6MSk7XG4gICAgICB0aGlzLmsyMSA9IHRoaXMuYXgzICogKHRoaXMuYTF4MiArIHRoaXMuYTJ4MikgKyB0aGlzLmF5MyAqICh0aGlzLmExeTIgKyB0aGlzLmEyeTIpICsgdGhpcy5hejMgKiAodGhpcy5hMXoyICsgdGhpcy5hMnoyKTtcbiAgICAgIHRoaXMuazIyID0gdGhpcy5heDMgKiAodGhpcy5hMXgzICsgdGhpcy5hMngzKSArIHRoaXMuYXkzICogKHRoaXMuYTF5MyArIHRoaXMuYTJ5MykgKyB0aGlzLmF6MyAqICh0aGlzLmExejMgKyB0aGlzLmEyejMpO1xuXG4gICAgICB0aGlzLmt2MDAgPSB0aGlzLmswMDtcbiAgICAgIHRoaXMua3YxMSA9IHRoaXMuazExO1xuICAgICAgdGhpcy5rdjIyID0gdGhpcy5rMjI7XG4gICAgICB0aGlzLmR2MDAgPSAxIC8gdGhpcy5rdjAwO1xuICAgICAgdGhpcy5kdjExID0gMSAvIHRoaXMua3YxMTtcbiAgICAgIHRoaXMuZHYyMiA9IDEgLyB0aGlzLmt2MjI7XG5cbiAgICAgIGlmIChlbmFibGVTcHJpbmcxICYmIHRoaXMubGltaXRTdGF0ZTEgIT0gMikge1xuICAgICAgICB2YXIgb21lZ2EgPSA2LjI4MzE4NTMgKiBmcmVxdWVuY3kxO1xuICAgICAgICB2YXIgayA9IG9tZWdhICogb21lZ2EgKiB0aW1lU3RlcDtcbiAgICAgICAgdmFyIGRtcCA9IGludlRpbWVTdGVwIC8gKGsgKyAyICogdGhpcy5saW1pdE1vdG9yMS5kYW1waW5nUmF0aW8gKiBvbWVnYSk7XG4gICAgICAgIHRoaXMuY2ZtMSA9IHRoaXMua3YwMCAqIGRtcDtcbiAgICAgICAgdGhpcy5saW1pdFZlbG9jaXR5MSAqPSBrICogZG1wO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5jZm0xID0gMDtcbiAgICAgICAgdGhpcy5saW1pdFZlbG9jaXR5MSAqPSBpbnZUaW1lU3RlcCAqIDAuMDU7XG4gICAgICB9XG5cbiAgICAgIGlmIChlbmFibGVTcHJpbmcyICYmIHRoaXMubGltaXRTdGF0ZTIgIT0gMikge1xuICAgICAgICBvbWVnYSA9IDYuMjgzMTg1MyAqIGZyZXF1ZW5jeTI7XG4gICAgICAgIGsgPSBvbWVnYSAqIG9tZWdhICogdGltZVN0ZXA7XG4gICAgICAgIGRtcCA9IGludlRpbWVTdGVwIC8gKGsgKyAyICogdGhpcy5saW1pdE1vdG9yMi5kYW1waW5nUmF0aW8gKiBvbWVnYSk7XG4gICAgICAgIHRoaXMuY2ZtMiA9IHRoaXMua3YxMSAqIGRtcDtcbiAgICAgICAgdGhpcy5saW1pdFZlbG9jaXR5MiAqPSBrICogZG1wO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5jZm0yID0gMDtcbiAgICAgICAgdGhpcy5saW1pdFZlbG9jaXR5MiAqPSBpbnZUaW1lU3RlcCAqIDAuMDU7XG4gICAgICB9XG5cbiAgICAgIGlmIChlbmFibGVTcHJpbmczICYmIHRoaXMubGltaXRTdGF0ZTMgIT0gMikge1xuICAgICAgICBvbWVnYSA9IDYuMjgzMTg1MyAqIGZyZXF1ZW5jeTM7XG4gICAgICAgIGsgPSBvbWVnYSAqIG9tZWdhICogdGltZVN0ZXA7XG4gICAgICAgIGRtcCA9IGludlRpbWVTdGVwIC8gKGsgKyAyICogdGhpcy5saW1pdE1vdG9yMy5kYW1waW5nUmF0aW8gKiBvbWVnYSk7XG4gICAgICAgIHRoaXMuY2ZtMyA9IHRoaXMua3YyMiAqIGRtcDtcbiAgICAgICAgdGhpcy5saW1pdFZlbG9jaXR5MyAqPSBrICogZG1wO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5jZm0zID0gMDtcbiAgICAgICAgdGhpcy5saW1pdFZlbG9jaXR5MyAqPSBpbnZUaW1lU3RlcCAqIDAuMDU7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuazAwICs9IHRoaXMuY2ZtMTtcbiAgICAgIHRoaXMuazExICs9IHRoaXMuY2ZtMjtcbiAgICAgIHRoaXMuazIyICs9IHRoaXMuY2ZtMztcblxuICAgICAgdmFyIGludiA9IDEgLyAoXG4gICAgICAgIHRoaXMuazAwICogKHRoaXMuazExICogdGhpcy5rMjIgLSB0aGlzLmsyMSAqIHRoaXMuazEyKSArXG4gICAgICAgIHRoaXMuazEwICogKHRoaXMuazIxICogdGhpcy5rMDIgLSB0aGlzLmswMSAqIHRoaXMuazIyKSArXG4gICAgICAgIHRoaXMuazIwICogKHRoaXMuazAxICogdGhpcy5rMTIgLSB0aGlzLmsxMSAqIHRoaXMuazAyKVxuICAgICAgKTtcbiAgICAgIHRoaXMuZDAwID0gKHRoaXMuazExICogdGhpcy5rMjIgLSB0aGlzLmsxMiAqIHRoaXMuazIxKSAqIGludjtcbiAgICAgIHRoaXMuZDAxID0gKHRoaXMuazAyICogdGhpcy5rMjEgLSB0aGlzLmswMSAqIHRoaXMuazIyKSAqIGludjtcbiAgICAgIHRoaXMuZDAyID0gKHRoaXMuazAxICogdGhpcy5rMTIgLSB0aGlzLmswMiAqIHRoaXMuazExKSAqIGludjtcbiAgICAgIHRoaXMuZDEwID0gKHRoaXMuazEyICogdGhpcy5rMjAgLSB0aGlzLmsxMCAqIHRoaXMuazIyKSAqIGludjtcbiAgICAgIHRoaXMuZDExID0gKHRoaXMuazAwICogdGhpcy5rMjIgLSB0aGlzLmswMiAqIHRoaXMuazIwKSAqIGludjtcbiAgICAgIHRoaXMuZDEyID0gKHRoaXMuazAyICogdGhpcy5rMTAgLSB0aGlzLmswMCAqIHRoaXMuazEyKSAqIGludjtcbiAgICAgIHRoaXMuZDIwID0gKHRoaXMuazEwICogdGhpcy5rMjEgLSB0aGlzLmsxMSAqIHRoaXMuazIwKSAqIGludjtcbiAgICAgIHRoaXMuZDIxID0gKHRoaXMuazAxICogdGhpcy5rMjAgLSB0aGlzLmswMCAqIHRoaXMuazIxKSAqIGludjtcbiAgICAgIHRoaXMuZDIyID0gKHRoaXMuazAwICogdGhpcy5rMTEgLSB0aGlzLmswMSAqIHRoaXMuazEwKSAqIGludjtcblxuICAgICAgdGhpcy5saW1pdEltcHVsc2UxICo9IDAuOTU7XG4gICAgICB0aGlzLm1vdG9ySW1wdWxzZTEgKj0gMC45NTtcbiAgICAgIHRoaXMubGltaXRJbXB1bHNlMiAqPSAwLjk1O1xuICAgICAgdGhpcy5tb3RvckltcHVsc2UyICo9IDAuOTU7XG4gICAgICB0aGlzLmxpbWl0SW1wdWxzZTMgKj0gMC45NTtcbiAgICAgIHRoaXMubW90b3JJbXB1bHNlMyAqPSAwLjk1O1xuICAgICAgdmFyIHRvdGFsSW1wdWxzZTEgPSB0aGlzLmxpbWl0SW1wdWxzZTEgKyB0aGlzLm1vdG9ySW1wdWxzZTE7XG4gICAgICB2YXIgdG90YWxJbXB1bHNlMiA9IHRoaXMubGltaXRJbXB1bHNlMiArIHRoaXMubW90b3JJbXB1bHNlMjtcbiAgICAgIHZhciB0b3RhbEltcHVsc2UzID0gdGhpcy5saW1pdEltcHVsc2UzICsgdGhpcy5tb3RvckltcHVsc2UzO1xuICAgICAgdGhpcy5hMS54ICs9IHRvdGFsSW1wdWxzZTEgKiB0aGlzLmExeDEgKyB0b3RhbEltcHVsc2UyICogdGhpcy5hMXgyICsgdG90YWxJbXB1bHNlMyAqIHRoaXMuYTF4MztcbiAgICAgIHRoaXMuYTEueSArPSB0b3RhbEltcHVsc2UxICogdGhpcy5hMXkxICsgdG90YWxJbXB1bHNlMiAqIHRoaXMuYTF5MiArIHRvdGFsSW1wdWxzZTMgKiB0aGlzLmExeTM7XG4gICAgICB0aGlzLmExLnogKz0gdG90YWxJbXB1bHNlMSAqIHRoaXMuYTF6MSArIHRvdGFsSW1wdWxzZTIgKiB0aGlzLmExejIgKyB0b3RhbEltcHVsc2UzICogdGhpcy5hMXozO1xuICAgICAgdGhpcy5hMi54IC09IHRvdGFsSW1wdWxzZTEgKiB0aGlzLmEyeDEgKyB0b3RhbEltcHVsc2UyICogdGhpcy5hMngyICsgdG90YWxJbXB1bHNlMyAqIHRoaXMuYTJ4MztcbiAgICAgIHRoaXMuYTIueSAtPSB0b3RhbEltcHVsc2UxICogdGhpcy5hMnkxICsgdG90YWxJbXB1bHNlMiAqIHRoaXMuYTJ5MiArIHRvdGFsSW1wdWxzZTMgKiB0aGlzLmEyeTM7XG4gICAgICB0aGlzLmEyLnogLT0gdG90YWxJbXB1bHNlMSAqIHRoaXMuYTJ6MSArIHRvdGFsSW1wdWxzZTIgKiB0aGlzLmEyejIgKyB0b3RhbEltcHVsc2UzICogdGhpcy5hMnozO1xuICAgIH0sXG4gICAgc29sdmVfOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHZhciBydnggPSB0aGlzLmEyLnggLSB0aGlzLmExLng7XG4gICAgICB2YXIgcnZ5ID0gdGhpcy5hMi55IC0gdGhpcy5hMS55O1xuICAgICAgdmFyIHJ2eiA9IHRoaXMuYTIueiAtIHRoaXMuYTEuejtcblxuICAgICAgdGhpcy5saW1pdFZlbG9jaXR5MyA9IDMwO1xuICAgICAgdmFyIHJ2bjEgPSBydnggKiB0aGlzLmF4MSArIHJ2eSAqIHRoaXMuYXkxICsgcnZ6ICogdGhpcy5hejEgLSB0aGlzLmxpbWl0VmVsb2NpdHkxO1xuICAgICAgdmFyIHJ2bjIgPSBydnggKiB0aGlzLmF4MiArIHJ2eSAqIHRoaXMuYXkyICsgcnZ6ICogdGhpcy5hejIgLSB0aGlzLmxpbWl0VmVsb2NpdHkyO1xuICAgICAgdmFyIHJ2bjMgPSBydnggKiB0aGlzLmF4MyArIHJ2eSAqIHRoaXMuYXkzICsgcnZ6ICogdGhpcy5hejMgLSB0aGlzLmxpbWl0VmVsb2NpdHkzO1xuXG4gICAgICB2YXIgZExpbWl0SW1wdWxzZTEgPSBydm4xICogdGhpcy5kMDAgKyBydm4yICogdGhpcy5kMDEgKyBydm4zICogdGhpcy5kMDI7XG4gICAgICB2YXIgZExpbWl0SW1wdWxzZTIgPSBydm4xICogdGhpcy5kMTAgKyBydm4yICogdGhpcy5kMTEgKyBydm4zICogdGhpcy5kMTI7XG4gICAgICB2YXIgZExpbWl0SW1wdWxzZTMgPSBydm4xICogdGhpcy5kMjAgKyBydm4yICogdGhpcy5kMjEgKyBydm4zICogdGhpcy5kMjI7XG5cbiAgICAgIHRoaXMubGltaXRJbXB1bHNlMSArPSBkTGltaXRJbXB1bHNlMTtcbiAgICAgIHRoaXMubGltaXRJbXB1bHNlMiArPSBkTGltaXRJbXB1bHNlMjtcbiAgICAgIHRoaXMubGltaXRJbXB1bHNlMyArPSBkTGltaXRJbXB1bHNlMztcblxuICAgICAgdGhpcy5hMS54ICs9IGRMaW1pdEltcHVsc2UxICogdGhpcy5hMXgxICsgZExpbWl0SW1wdWxzZTIgKiB0aGlzLmExeDIgKyBkTGltaXRJbXB1bHNlMyAqIHRoaXMuYTF4MztcbiAgICAgIHRoaXMuYTEueSArPSBkTGltaXRJbXB1bHNlMSAqIHRoaXMuYTF5MSArIGRMaW1pdEltcHVsc2UyICogdGhpcy5hMXkyICsgZExpbWl0SW1wdWxzZTMgKiB0aGlzLmExeTM7XG4gICAgICB0aGlzLmExLnogKz0gZExpbWl0SW1wdWxzZTEgKiB0aGlzLmExejEgKyBkTGltaXRJbXB1bHNlMiAqIHRoaXMuYTF6MiArIGRMaW1pdEltcHVsc2UzICogdGhpcy5hMXozO1xuICAgICAgdGhpcy5hMi54IC09IGRMaW1pdEltcHVsc2UxICogdGhpcy5hMngxICsgZExpbWl0SW1wdWxzZTIgKiB0aGlzLmEyeDIgKyBkTGltaXRJbXB1bHNlMyAqIHRoaXMuYTJ4MztcbiAgICAgIHRoaXMuYTIueSAtPSBkTGltaXRJbXB1bHNlMSAqIHRoaXMuYTJ5MSArIGRMaW1pdEltcHVsc2UyICogdGhpcy5hMnkyICsgZExpbWl0SW1wdWxzZTMgKiB0aGlzLmEyeTM7XG4gICAgICB0aGlzLmEyLnogLT0gZExpbWl0SW1wdWxzZTEgKiB0aGlzLmEyejEgKyBkTGltaXRJbXB1bHNlMiAqIHRoaXMuYTJ6MiArIGRMaW1pdEltcHVsc2UzICogdGhpcy5hMnozO1xuICAgIH0sXG4gICAgc29sdmU6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgdmFyIHJ2eCA9IHRoaXMuYTIueCAtIHRoaXMuYTEueDtcbiAgICAgIHZhciBydnkgPSB0aGlzLmEyLnkgLSB0aGlzLmExLnk7XG4gICAgICB2YXIgcnZ6ID0gdGhpcy5hMi56IC0gdGhpcy5hMS56O1xuXG4gICAgICB2YXIgcnZuMSA9IHJ2eCAqIHRoaXMuYXgxICsgcnZ5ICogdGhpcy5heTEgKyBydnogKiB0aGlzLmF6MTtcbiAgICAgIHZhciBydm4yID0gcnZ4ICogdGhpcy5heDIgKyBydnkgKiB0aGlzLmF5MiArIHJ2eiAqIHRoaXMuYXoyO1xuICAgICAgdmFyIHJ2bjMgPSBydnggKiB0aGlzLmF4MyArIHJ2eSAqIHRoaXMuYXkzICsgcnZ6ICogdGhpcy5hejM7XG5cbiAgICAgIHZhciBvbGRNb3RvckltcHVsc2UxID0gdGhpcy5tb3RvckltcHVsc2UxO1xuICAgICAgdmFyIG9sZE1vdG9ySW1wdWxzZTIgPSB0aGlzLm1vdG9ySW1wdWxzZTI7XG4gICAgICB2YXIgb2xkTW90b3JJbXB1bHNlMyA9IHRoaXMubW90b3JJbXB1bHNlMztcblxuICAgICAgdmFyIGRNb3RvckltcHVsc2UxID0gMDtcbiAgICAgIHZhciBkTW90b3JJbXB1bHNlMiA9IDA7XG4gICAgICB2YXIgZE1vdG9ySW1wdWxzZTMgPSAwO1xuXG4gICAgICBpZiAodGhpcy5lbmFibGVNb3RvcjEpIHtcbiAgICAgICAgZE1vdG9ySW1wdWxzZTEgPSAocnZuMSAtIHRoaXMubW90b3JTcGVlZDEpICogdGhpcy5kdjAwO1xuICAgICAgICB0aGlzLm1vdG9ySW1wdWxzZTEgKz0gZE1vdG9ySW1wdWxzZTE7XG4gICAgICAgIGlmICh0aGlzLm1vdG9ySW1wdWxzZTEgPiB0aGlzLm1heE1vdG9ySW1wdWxzZTEpIHsgLy8gY2xhbXAgbW90b3IgaW1wdWxzZVxuICAgICAgICAgIHRoaXMubW90b3JJbXB1bHNlMSA9IHRoaXMubWF4TW90b3JJbXB1bHNlMTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLm1vdG9ySW1wdWxzZTEgPCAtdGhpcy5tYXhNb3RvckltcHVsc2UxKSB7XG4gICAgICAgICAgdGhpcy5tb3RvckltcHVsc2UxID0gLXRoaXMubWF4TW90b3JJbXB1bHNlMTtcbiAgICAgICAgfVxuICAgICAgICBkTW90b3JJbXB1bHNlMSA9IHRoaXMubW90b3JJbXB1bHNlMSAtIG9sZE1vdG9ySW1wdWxzZTE7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5lbmFibGVNb3RvcjIpIHtcbiAgICAgICAgZE1vdG9ySW1wdWxzZTIgPSAocnZuMiAtIHRoaXMubW90b3JTcGVlZDIpICogdGhpcy5kdjExO1xuICAgICAgICB0aGlzLm1vdG9ySW1wdWxzZTIgKz0gZE1vdG9ySW1wdWxzZTI7XG4gICAgICAgIGlmICh0aGlzLm1vdG9ySW1wdWxzZTIgPiB0aGlzLm1heE1vdG9ySW1wdWxzZTIpIHsgLy8gY2xhbXAgbW90b3IgaW1wdWxzZVxuICAgICAgICAgIHRoaXMubW90b3JJbXB1bHNlMiA9IHRoaXMubWF4TW90b3JJbXB1bHNlMjtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLm1vdG9ySW1wdWxzZTIgPCAtdGhpcy5tYXhNb3RvckltcHVsc2UyKSB7XG4gICAgICAgICAgdGhpcy5tb3RvckltcHVsc2UyID0gLXRoaXMubWF4TW90b3JJbXB1bHNlMjtcbiAgICAgICAgfVxuICAgICAgICBkTW90b3JJbXB1bHNlMiA9IHRoaXMubW90b3JJbXB1bHNlMiAtIG9sZE1vdG9ySW1wdWxzZTI7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5lbmFibGVNb3RvcjMpIHtcbiAgICAgICAgZE1vdG9ySW1wdWxzZTMgPSAocnZuMyAtIHRoaXMubW90b3JTcGVlZDMpICogdGhpcy5kdjIyO1xuICAgICAgICB0aGlzLm1vdG9ySW1wdWxzZTMgKz0gZE1vdG9ySW1wdWxzZTM7XG4gICAgICAgIGlmICh0aGlzLm1vdG9ySW1wdWxzZTMgPiB0aGlzLm1heE1vdG9ySW1wdWxzZTMpIHsgLy8gY2xhbXAgbW90b3IgaW1wdWxzZVxuICAgICAgICAgIHRoaXMubW90b3JJbXB1bHNlMyA9IHRoaXMubWF4TW90b3JJbXB1bHNlMztcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLm1vdG9ySW1wdWxzZTMgPCAtdGhpcy5tYXhNb3RvckltcHVsc2UzKSB7XG4gICAgICAgICAgdGhpcy5tb3RvckltcHVsc2UzID0gLXRoaXMubWF4TW90b3JJbXB1bHNlMztcbiAgICAgICAgfVxuICAgICAgICBkTW90b3JJbXB1bHNlMyA9IHRoaXMubW90b3JJbXB1bHNlMyAtIG9sZE1vdG9ySW1wdWxzZTM7XG4gICAgICB9XG5cbiAgICAgIC8vIGFwcGx5IG1vdG9yIGltcHVsc2UgdG8gcmVsYXRpdmUgdmVsb2NpdHlcbiAgICAgIHJ2bjEgKz0gZE1vdG9ySW1wdWxzZTEgKiB0aGlzLmt2MDAgKyBkTW90b3JJbXB1bHNlMiAqIHRoaXMuazAxICsgZE1vdG9ySW1wdWxzZTMgKiB0aGlzLmswMjtcbiAgICAgIHJ2bjIgKz0gZE1vdG9ySW1wdWxzZTEgKiB0aGlzLmsxMCArIGRNb3RvckltcHVsc2UyICogdGhpcy5rdjExICsgZE1vdG9ySW1wdWxzZTMgKiB0aGlzLmsxMjtcbiAgICAgIHJ2bjMgKz0gZE1vdG9ySW1wdWxzZTEgKiB0aGlzLmsyMCArIGRNb3RvckltcHVsc2UyICogdGhpcy5rMjEgKyBkTW90b3JJbXB1bHNlMyAqIHRoaXMua3YyMjtcblxuICAgICAgLy8gc3VidHJhY3QgdGFyZ2V0IHZlbG9jaXR5IGFuZCBhcHBsaWVkIGltcHVsc2VcbiAgICAgIHJ2bjEgLT0gdGhpcy5saW1pdFZlbG9jaXR5MSArIHRoaXMubGltaXRJbXB1bHNlMSAqIHRoaXMuY2ZtMTtcbiAgICAgIHJ2bjIgLT0gdGhpcy5saW1pdFZlbG9jaXR5MiArIHRoaXMubGltaXRJbXB1bHNlMiAqIHRoaXMuY2ZtMjtcbiAgICAgIHJ2bjMgLT0gdGhpcy5saW1pdFZlbG9jaXR5MyArIHRoaXMubGltaXRJbXB1bHNlMyAqIHRoaXMuY2ZtMztcblxuICAgICAgdmFyIG9sZExpbWl0SW1wdWxzZTEgPSB0aGlzLmxpbWl0SW1wdWxzZTE7XG4gICAgICB2YXIgb2xkTGltaXRJbXB1bHNlMiA9IHRoaXMubGltaXRJbXB1bHNlMjtcbiAgICAgIHZhciBvbGRMaW1pdEltcHVsc2UzID0gdGhpcy5saW1pdEltcHVsc2UzO1xuXG4gICAgICB2YXIgZExpbWl0SW1wdWxzZTEgPSBydm4xICogdGhpcy5kMDAgKyBydm4yICogdGhpcy5kMDEgKyBydm4zICogdGhpcy5kMDI7XG4gICAgICB2YXIgZExpbWl0SW1wdWxzZTIgPSBydm4xICogdGhpcy5kMTAgKyBydm4yICogdGhpcy5kMTEgKyBydm4zICogdGhpcy5kMTI7XG4gICAgICB2YXIgZExpbWl0SW1wdWxzZTMgPSBydm4xICogdGhpcy5kMjAgKyBydm4yICogdGhpcy5kMjEgKyBydm4zICogdGhpcy5kMjI7XG5cbiAgICAgIHRoaXMubGltaXRJbXB1bHNlMSArPSBkTGltaXRJbXB1bHNlMTtcbiAgICAgIHRoaXMubGltaXRJbXB1bHNlMiArPSBkTGltaXRJbXB1bHNlMjtcbiAgICAgIHRoaXMubGltaXRJbXB1bHNlMyArPSBkTGltaXRJbXB1bHNlMztcblxuICAgICAgLy8gY2xhbXBcbiAgICAgIHZhciBjbGFtcFN0YXRlID0gMDtcbiAgICAgIGlmICh0aGlzLmxpbWl0U3RhdGUxID09IDIgfHwgdGhpcy5saW1pdEltcHVsc2UxICogdGhpcy5saW1pdFN0YXRlMSA8IDApIHtcbiAgICAgICAgZExpbWl0SW1wdWxzZTEgPSAtb2xkTGltaXRJbXB1bHNlMTtcbiAgICAgICAgcnZuMiArPSBkTGltaXRJbXB1bHNlMSAqIHRoaXMuazEwO1xuICAgICAgICBydm4zICs9IGRMaW1pdEltcHVsc2UxICogdGhpcy5rMjA7XG4gICAgICAgIGNsYW1wU3RhdGUgfD0gMTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmxpbWl0U3RhdGUyID09IDIgfHwgdGhpcy5saW1pdEltcHVsc2UyICogdGhpcy5saW1pdFN0YXRlMiA8IDApIHtcbiAgICAgICAgZExpbWl0SW1wdWxzZTIgPSAtb2xkTGltaXRJbXB1bHNlMjtcbiAgICAgICAgcnZuMSArPSBkTGltaXRJbXB1bHNlMiAqIHRoaXMuazAxO1xuICAgICAgICBydm4zICs9IGRMaW1pdEltcHVsc2UyICogdGhpcy5rMjE7XG4gICAgICAgIGNsYW1wU3RhdGUgfD0gMjtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmxpbWl0U3RhdGUzID09IDIgfHwgdGhpcy5saW1pdEltcHVsc2UzICogdGhpcy5saW1pdFN0YXRlMyA8IDApIHtcbiAgICAgICAgZExpbWl0SW1wdWxzZTMgPSAtb2xkTGltaXRJbXB1bHNlMztcbiAgICAgICAgcnZuMSArPSBkTGltaXRJbXB1bHNlMyAqIHRoaXMuazAyO1xuICAgICAgICBydm4yICs9IGRMaW1pdEltcHVsc2UzICogdGhpcy5rMTI7XG4gICAgICAgIGNsYW1wU3RhdGUgfD0gNDtcbiAgICAgIH1cblxuICAgICAgLy8gdXBkYXRlIHVuLWNsYW1wZWQgaW1wdWxzZVxuICAgICAgLy8gVE9ETzogaXNvbGF0ZSBkaXZpc2lvblxuICAgICAgdmFyIGRldDtcbiAgICAgIHN3aXRjaCAoY2xhbXBTdGF0ZSkge1xuICAgICAgICBjYXNlIDE6IC8vIHVwZGF0ZSAyIDNcbiAgICAgICAgICBkZXQgPSAxIC8gKHRoaXMuazExICogdGhpcy5rMjIgLSB0aGlzLmsxMiAqIHRoaXMuazIxKTtcbiAgICAgICAgICBkTGltaXRJbXB1bHNlMiA9ICh0aGlzLmsyMiAqIHJ2bjIgKyAtdGhpcy5rMTIgKiBydm4zKSAqIGRldDtcbiAgICAgICAgICBkTGltaXRJbXB1bHNlMyA9ICgtdGhpcy5rMjEgKiBydm4yICsgdGhpcy5rMTEgKiBydm4zKSAqIGRldDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAyOiAvLyB1cGRhdGUgMSAzXG4gICAgICAgICAgZGV0ID0gMSAvICh0aGlzLmswMCAqIHRoaXMuazIyIC0gdGhpcy5rMDIgKiB0aGlzLmsyMCk7XG4gICAgICAgICAgZExpbWl0SW1wdWxzZTEgPSAodGhpcy5rMjIgKiBydm4xICsgLXRoaXMuazAyICogcnZuMykgKiBkZXQ7XG4gICAgICAgICAgZExpbWl0SW1wdWxzZTMgPSAoLXRoaXMuazIwICogcnZuMSArIHRoaXMuazAwICogcnZuMykgKiBkZXQ7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMzogLy8gdXBkYXRlIDNcbiAgICAgICAgICBkTGltaXRJbXB1bHNlMyA9IHJ2bjMgLyB0aGlzLmsyMjtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA0OiAvLyB1cGRhdGUgMSAyXG4gICAgICAgICAgZGV0ID0gMSAvICh0aGlzLmswMCAqIHRoaXMuazExIC0gdGhpcy5rMDEgKiB0aGlzLmsxMCk7XG4gICAgICAgICAgZExpbWl0SW1wdWxzZTEgPSAodGhpcy5rMTEgKiBydm4xICsgLXRoaXMuazAxICogcnZuMikgKiBkZXQ7XG4gICAgICAgICAgZExpbWl0SW1wdWxzZTIgPSAoLXRoaXMuazEwICogcnZuMSArIHRoaXMuazAwICogcnZuMikgKiBkZXQ7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNTogLy8gdXBkYXRlIDJcbiAgICAgICAgICBkTGltaXRJbXB1bHNlMiA9IHJ2bjIgLyB0aGlzLmsxMTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA2OiAvLyB1cGRhdGUgMVxuICAgICAgICAgIGRMaW1pdEltcHVsc2UxID0gcnZuMSAvIHRoaXMuazAwO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmxpbWl0SW1wdWxzZTEgPSBkTGltaXRJbXB1bHNlMSArIG9sZExpbWl0SW1wdWxzZTE7XG4gICAgICB0aGlzLmxpbWl0SW1wdWxzZTIgPSBkTGltaXRJbXB1bHNlMiArIG9sZExpbWl0SW1wdWxzZTI7XG4gICAgICB0aGlzLmxpbWl0SW1wdWxzZTMgPSBkTGltaXRJbXB1bHNlMyArIG9sZExpbWl0SW1wdWxzZTM7XG5cbiAgICAgIHZhciBkSW1wdWxzZTEgPSBkTW90b3JJbXB1bHNlMSArIGRMaW1pdEltcHVsc2UxO1xuICAgICAgdmFyIGRJbXB1bHNlMiA9IGRNb3RvckltcHVsc2UyICsgZExpbWl0SW1wdWxzZTI7XG4gICAgICB2YXIgZEltcHVsc2UzID0gZE1vdG9ySW1wdWxzZTMgKyBkTGltaXRJbXB1bHNlMztcblxuICAgICAgLy8gYXBwbHkgaW1wdWxzZVxuICAgICAgdGhpcy5hMS54ICs9IGRJbXB1bHNlMSAqIHRoaXMuYTF4MSArIGRJbXB1bHNlMiAqIHRoaXMuYTF4MiArIGRJbXB1bHNlMyAqIHRoaXMuYTF4MztcbiAgICAgIHRoaXMuYTEueSArPSBkSW1wdWxzZTEgKiB0aGlzLmExeTEgKyBkSW1wdWxzZTIgKiB0aGlzLmExeTIgKyBkSW1wdWxzZTMgKiB0aGlzLmExeTM7XG4gICAgICB0aGlzLmExLnogKz0gZEltcHVsc2UxICogdGhpcy5hMXoxICsgZEltcHVsc2UyICogdGhpcy5hMXoyICsgZEltcHVsc2UzICogdGhpcy5hMXozO1xuICAgICAgdGhpcy5hMi54IC09IGRJbXB1bHNlMSAqIHRoaXMuYTJ4MSArIGRJbXB1bHNlMiAqIHRoaXMuYTJ4MiArIGRJbXB1bHNlMyAqIHRoaXMuYTJ4MztcbiAgICAgIHRoaXMuYTIueSAtPSBkSW1wdWxzZTEgKiB0aGlzLmEyeTEgKyBkSW1wdWxzZTIgKiB0aGlzLmEyeTIgKyBkSW1wdWxzZTMgKiB0aGlzLmEyeTM7XG4gICAgICB0aGlzLmEyLnogLT0gZEltcHVsc2UxICogdGhpcy5hMnoxICsgZEltcHVsc2UyICogdGhpcy5hMnoyICsgZEltcHVsc2UzICogdGhpcy5hMnozO1xuICAgICAgcnZ4ID0gdGhpcy5hMi54IC0gdGhpcy5hMS54O1xuICAgICAgcnZ5ID0gdGhpcy5hMi55IC0gdGhpcy5hMS55O1xuICAgICAgcnZ6ID0gdGhpcy5hMi56IC0gdGhpcy5hMS56O1xuXG4gICAgICBydm4yID0gcnZ4ICogdGhpcy5heDIgKyBydnkgKiB0aGlzLmF5MiArIHJ2eiAqIHRoaXMuYXoyO1xuICAgIH1cblxuICB9KTtcblxuICAvKipcbiAgICogQSBoaW5nZSBqb2ludCBhbGxvd3Mgb25seSBmb3IgcmVsYXRpdmUgcm90YXRpb24gb2YgcmlnaWQgYm9kaWVzIGFsb25nIHRoZSBheGlzLlxuICAgKlxuICAgKiBAYXV0aG9yIHNhaGFyYW5cbiAgICogQGF1dGhvciBsby10aFxuICAgKi9cblxuICBmdW5jdGlvbiBIaW5nZUpvaW50KGNvbmZpZywgbG93ZXJBbmdsZUxpbWl0LCB1cHBlckFuZ2xlTGltaXQpIHtcblxuICAgIEpvaW50LmNhbGwodGhpcywgY29uZmlnKTtcblxuICAgIHRoaXMudHlwZSA9IEpPSU5UX0hJTkdFO1xuXG4gICAgLy8gVGhlIGF4aXMgaW4gdGhlIGZpcnN0IGJvZHkncyBjb29yZGluYXRlIHN5c3RlbS5cbiAgICB0aGlzLmxvY2FsQXhpczEgPSBjb25maWcubG9jYWxBeGlzMS5jbG9uZSgpLm5vcm1hbGl6ZSgpO1xuICAgIC8vIFRoZSBheGlzIGluIHRoZSBzZWNvbmQgYm9keSdzIGNvb3JkaW5hdGUgc3lzdGVtLlxuICAgIHRoaXMubG9jYWxBeGlzMiA9IGNvbmZpZy5sb2NhbEF4aXMyLmNsb25lKCkubm9ybWFsaXplKCk7XG5cbiAgICAvLyBtYWtlIGFuZ2xlIGF4aXNcbiAgICB2YXIgYXJjID0gbmV3IE1hdDMzKCkuc2V0UXVhdChuZXcgUXVhdCgpLnNldEZyb21Vbml0VmVjdG9ycyh0aGlzLmxvY2FsQXhpczEsIHRoaXMubG9jYWxBeGlzMikpO1xuICAgIHRoaXMubG9jYWxBbmdsZTEgPSBuZXcgVmVjMygpLnRhbmdlbnQodGhpcy5sb2NhbEF4aXMxKS5ub3JtYWxpemUoKTtcbiAgICB0aGlzLmxvY2FsQW5nbGUyID0gdGhpcy5sb2NhbEFuZ2xlMS5jbG9uZSgpLmFwcGx5TWF0cml4MyhhcmMsIHRydWUpO1xuXG4gICAgdGhpcy5heDEgPSBuZXcgVmVjMygpO1xuICAgIHRoaXMuYXgyID0gbmV3IFZlYzMoKTtcbiAgICB0aGlzLmFuMSA9IG5ldyBWZWMzKCk7XG4gICAgdGhpcy5hbjIgPSBuZXcgVmVjMygpO1xuXG4gICAgdGhpcy50bXAgPSBuZXcgVmVjMygpO1xuXG4gICAgdGhpcy5ub3IgPSBuZXcgVmVjMygpO1xuICAgIHRoaXMudGFuID0gbmV3IFZlYzMoKTtcbiAgICB0aGlzLmJpbiA9IG5ldyBWZWMzKCk7XG5cbiAgICAvLyBUaGUgcm90YXRpb25hbCBsaW1pdCBhbmQgbW90b3IgaW5mb3JtYXRpb24gb2YgdGhlIGpvaW50LlxuICAgIHRoaXMubGltaXRNb3RvciA9IG5ldyBMaW1pdE1vdG9yKHRoaXMubm9yLCBmYWxzZSk7XG4gICAgdGhpcy5saW1pdE1vdG9yLmxvd2VyTGltaXQgPSBsb3dlckFuZ2xlTGltaXQ7XG4gICAgdGhpcy5saW1pdE1vdG9yLnVwcGVyTGltaXQgPSB1cHBlckFuZ2xlTGltaXQ7XG5cbiAgICB0aGlzLmxjID0gbmV3IExpbmVhckNvbnN0cmFpbnQodGhpcyk7XG4gICAgdGhpcy5yMyA9IG5ldyBSb3RhdGlvbmFsM0NvbnN0cmFpbnQodGhpcywgdGhpcy5saW1pdE1vdG9yLCBuZXcgTGltaXRNb3Rvcih0aGlzLnRhbiwgdHJ1ZSksIG5ldyBMaW1pdE1vdG9yKHRoaXMuYmluLCB0cnVlKSk7XG4gIH1cbiAgSGluZ2VKb2ludC5wcm90b3R5cGUgPSBPYmplY3QuYXNzaWduKE9iamVjdC5jcmVhdGUoSm9pbnQucHJvdG90eXBlKSwge1xuXG4gICAgY29uc3RydWN0b3I6IEhpbmdlSm9pbnQsXG5cblxuICAgIHByZVNvbHZlOiBmdW5jdGlvbiAodGltZVN0ZXAsIGludlRpbWVTdGVwKSB7XG5cbiAgICAgIHRoaXMudXBkYXRlQW5jaG9yUG9pbnRzKCk7XG5cbiAgICAgIHRoaXMuYXgxLmNvcHkodGhpcy5sb2NhbEF4aXMxKS5hcHBseU1hdHJpeDModGhpcy5ib2R5MS5yb3RhdGlvbiwgdHJ1ZSk7XG4gICAgICB0aGlzLmF4Mi5jb3B5KHRoaXMubG9jYWxBeGlzMikuYXBwbHlNYXRyaXgzKHRoaXMuYm9keTIucm90YXRpb24sIHRydWUpO1xuXG4gICAgICB0aGlzLmFuMS5jb3B5KHRoaXMubG9jYWxBbmdsZTEpLmFwcGx5TWF0cml4Myh0aGlzLmJvZHkxLnJvdGF0aW9uLCB0cnVlKTtcbiAgICAgIHRoaXMuYW4yLmNvcHkodGhpcy5sb2NhbEFuZ2xlMikuYXBwbHlNYXRyaXgzKHRoaXMuYm9keTIucm90YXRpb24sIHRydWUpO1xuXG4gICAgICAvLyBub3JtYWwgdGFuZ2VudCBiaW5vcm1hbFxuXG4gICAgICB0aGlzLm5vci5zZXQoXG4gICAgICAgIHRoaXMuYXgxLnggKiB0aGlzLmJvZHkyLmludmVyc2VNYXNzICsgdGhpcy5heDIueCAqIHRoaXMuYm9keTEuaW52ZXJzZU1hc3MsXG4gICAgICAgIHRoaXMuYXgxLnkgKiB0aGlzLmJvZHkyLmludmVyc2VNYXNzICsgdGhpcy5heDIueSAqIHRoaXMuYm9keTEuaW52ZXJzZU1hc3MsXG4gICAgICAgIHRoaXMuYXgxLnogKiB0aGlzLmJvZHkyLmludmVyc2VNYXNzICsgdGhpcy5heDIueiAqIHRoaXMuYm9keTEuaW52ZXJzZU1hc3NcbiAgICAgICkubm9ybWFsaXplKCk7XG5cbiAgICAgIHRoaXMudGFuLnRhbmdlbnQodGhpcy5ub3IpLm5vcm1hbGl6ZSgpO1xuXG4gICAgICB0aGlzLmJpbi5jcm9zc1ZlY3RvcnModGhpcy5ub3IsIHRoaXMudGFuKTtcblxuICAgICAgLy8gY2FsY3VsYXRlIGhpbmdlIGFuZ2xlXG5cbiAgICAgIHZhciBsaW1pdGUgPSBfTWF0aC5hY29zQ2xhbXAoX01hdGguZG90VmVjdG9ycyh0aGlzLmFuMSwgdGhpcy5hbjIpKTtcblxuICAgICAgdGhpcy50bXAuY3Jvc3NWZWN0b3JzKHRoaXMuYW4xLCB0aGlzLmFuMik7XG5cbiAgICAgIGlmIChfTWF0aC5kb3RWZWN0b3JzKHRoaXMubm9yLCB0aGlzLnRtcCkgPCAwKSB0aGlzLmxpbWl0TW90b3IuYW5nbGUgPSAtbGltaXRlO1xuICAgICAgZWxzZSB0aGlzLmxpbWl0TW90b3IuYW5nbGUgPSBsaW1pdGU7XG5cbiAgICAgIHRoaXMudG1wLmNyb3NzVmVjdG9ycyh0aGlzLmF4MSwgdGhpcy5heDIpO1xuXG4gICAgICB0aGlzLnIzLmxpbWl0TW90b3IyLmFuZ2xlID0gX01hdGguZG90VmVjdG9ycyh0aGlzLnRhbiwgdGhpcy50bXApO1xuICAgICAgdGhpcy5yMy5saW1pdE1vdG9yMy5hbmdsZSA9IF9NYXRoLmRvdFZlY3RvcnModGhpcy5iaW4sIHRoaXMudG1wKTtcblxuICAgICAgLy8gcHJlU29sdmVcblxuICAgICAgdGhpcy5yMy5wcmVTb2x2ZSh0aW1lU3RlcCwgaW52VGltZVN0ZXApO1xuICAgICAgdGhpcy5sYy5wcmVTb2x2ZSh0aW1lU3RlcCwgaW52VGltZVN0ZXApO1xuXG4gICAgfSxcblxuICAgIHNvbHZlOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHRoaXMucjMuc29sdmUoKTtcbiAgICAgIHRoaXMubGMuc29sdmUoKTtcblxuICAgIH0sXG5cbiAgICBwb3N0U29sdmU6IGZ1bmN0aW9uICgpIHtcblxuICAgIH1cblxuICB9KTtcblxuICAvKipcbiAgICogQSBiYWxsLWFuZC1zb2NrZXQgam9pbnQgbGltaXRzIHJlbGF0aXZlIHRyYW5zbGF0aW9uIG9uIHR3byBhbmNob3IgcG9pbnRzIG9uIHJpZ2lkIGJvZGllcy5cbiAgICpcbiAgICogQGF1dGhvciBzYWhhcmFuXG4gICAqIEBhdXRob3IgbG8tdGhcbiAgICovXG5cbiAgZnVuY3Rpb24gQmFsbEFuZFNvY2tldEpvaW50KGNvbmZpZykge1xuXG4gICAgSm9pbnQuY2FsbCh0aGlzLCBjb25maWcpO1xuXG4gICAgdGhpcy50eXBlID0gSk9JTlRfQkFMTF9BTkRfU09DS0VUO1xuXG4gICAgdGhpcy5sYyA9IG5ldyBMaW5lYXJDb25zdHJhaW50KHRoaXMpO1xuXG4gIH1cbiAgQmFsbEFuZFNvY2tldEpvaW50LnByb3RvdHlwZSA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmNyZWF0ZShKb2ludC5wcm90b3R5cGUpLCB7XG5cbiAgICBjb25zdHJ1Y3RvcjogQmFsbEFuZFNvY2tldEpvaW50LFxuXG4gICAgcHJlU29sdmU6IGZ1bmN0aW9uICh0aW1lU3RlcCwgaW52VGltZVN0ZXApIHtcblxuICAgICAgdGhpcy51cGRhdGVBbmNob3JQb2ludHMoKTtcblxuICAgICAgLy8gcHJlU29sdmVcblxuICAgICAgdGhpcy5sYy5wcmVTb2x2ZSh0aW1lU3RlcCwgaW52VGltZVN0ZXApO1xuXG4gICAgfSxcblxuICAgIHNvbHZlOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHRoaXMubGMuc29sdmUoKTtcblxuICAgIH0sXG5cbiAgICBwb3N0U29sdmU6IGZ1bmN0aW9uICgpIHtcblxuICAgIH1cblxuICB9KTtcblxuICAvKipcbiAgKiBBIHRyYW5zbGF0aW9uYWwgY29uc3RyYWludCBmb3IgdmFyaW91cyBqb2ludHMuXG4gICogQGF1dGhvciBzYWhhcmFuXG4gICovXG4gIGZ1bmN0aW9uIFRyYW5zbGF0aW9uYWxDb25zdHJhaW50KGpvaW50LCBsaW1pdE1vdG9yKSB7XG4gICAgdGhpcy5jZm0gPSBOYU47XG4gICAgdGhpcy5tMSA9IE5hTjtcbiAgICB0aGlzLm0yID0gTmFOO1xuICAgIHRoaXMuaTFlMDAgPSBOYU47XG4gICAgdGhpcy5pMWUwMSA9IE5hTjtcbiAgICB0aGlzLmkxZTAyID0gTmFOO1xuICAgIHRoaXMuaTFlMTAgPSBOYU47XG4gICAgdGhpcy5pMWUxMSA9IE5hTjtcbiAgICB0aGlzLmkxZTEyID0gTmFOO1xuICAgIHRoaXMuaTFlMjAgPSBOYU47XG4gICAgdGhpcy5pMWUyMSA9IE5hTjtcbiAgICB0aGlzLmkxZTIyID0gTmFOO1xuICAgIHRoaXMuaTJlMDAgPSBOYU47XG4gICAgdGhpcy5pMmUwMSA9IE5hTjtcbiAgICB0aGlzLmkyZTAyID0gTmFOO1xuICAgIHRoaXMuaTJlMTAgPSBOYU47XG4gICAgdGhpcy5pMmUxMSA9IE5hTjtcbiAgICB0aGlzLmkyZTEyID0gTmFOO1xuICAgIHRoaXMuaTJlMjAgPSBOYU47XG4gICAgdGhpcy5pMmUyMSA9IE5hTjtcbiAgICB0aGlzLmkyZTIyID0gTmFOO1xuICAgIHRoaXMubW90b3JEZW5vbSA9IE5hTjtcbiAgICB0aGlzLmludk1vdG9yRGVub20gPSBOYU47XG4gICAgdGhpcy5pbnZEZW5vbSA9IE5hTjtcbiAgICB0aGlzLmF4ID0gTmFOO1xuICAgIHRoaXMuYXkgPSBOYU47XG4gICAgdGhpcy5heiA9IE5hTjtcbiAgICB0aGlzLnIxeCA9IE5hTjtcbiAgICB0aGlzLnIxeSA9IE5hTjtcbiAgICB0aGlzLnIxeiA9IE5hTjtcbiAgICB0aGlzLnIyeCA9IE5hTjtcbiAgICB0aGlzLnIyeSA9IE5hTjtcbiAgICB0aGlzLnIyeiA9IE5hTjtcbiAgICB0aGlzLnQxeCA9IE5hTjtcbiAgICB0aGlzLnQxeSA9IE5hTjtcbiAgICB0aGlzLnQxeiA9IE5hTjtcbiAgICB0aGlzLnQyeCA9IE5hTjtcbiAgICB0aGlzLnQyeSA9IE5hTjtcbiAgICB0aGlzLnQyeiA9IE5hTjtcbiAgICB0aGlzLmwxeCA9IE5hTjtcbiAgICB0aGlzLmwxeSA9IE5hTjtcbiAgICB0aGlzLmwxeiA9IE5hTjtcbiAgICB0aGlzLmwyeCA9IE5hTjtcbiAgICB0aGlzLmwyeSA9IE5hTjtcbiAgICB0aGlzLmwyeiA9IE5hTjtcbiAgICB0aGlzLmExeCA9IE5hTjtcbiAgICB0aGlzLmExeSA9IE5hTjtcbiAgICB0aGlzLmExeiA9IE5hTjtcbiAgICB0aGlzLmEyeCA9IE5hTjtcbiAgICB0aGlzLmEyeSA9IE5hTjtcbiAgICB0aGlzLmEyeiA9IE5hTjtcbiAgICB0aGlzLmxvd2VyTGltaXQgPSBOYU47XG4gICAgdGhpcy51cHBlckxpbWl0ID0gTmFOO1xuICAgIHRoaXMubGltaXRWZWxvY2l0eSA9IE5hTjtcbiAgICB0aGlzLmxpbWl0U3RhdGUgPSAwOyAvLyAtMTogYXQgbG93ZXIsIDA6IGxvY2tlZCwgMTogYXQgdXBwZXIsIDI6IGZyZWVcbiAgICB0aGlzLmVuYWJsZU1vdG9yID0gZmFsc2U7XG4gICAgdGhpcy5tb3RvclNwZWVkID0gTmFOO1xuICAgIHRoaXMubWF4TW90b3JGb3JjZSA9IE5hTjtcbiAgICB0aGlzLm1heE1vdG9ySW1wdWxzZSA9IE5hTjtcblxuICAgIHRoaXMubGltaXRNb3RvciA9IGxpbWl0TW90b3I7XG4gICAgdGhpcy5iMSA9IGpvaW50LmJvZHkxO1xuICAgIHRoaXMuYjIgPSBqb2ludC5ib2R5MjtcbiAgICB0aGlzLnAxID0gam9pbnQuYW5jaG9yUG9pbnQxO1xuICAgIHRoaXMucDIgPSBqb2ludC5hbmNob3JQb2ludDI7XG4gICAgdGhpcy5yMSA9IGpvaW50LnJlbGF0aXZlQW5jaG9yUG9pbnQxO1xuICAgIHRoaXMucjIgPSBqb2ludC5yZWxhdGl2ZUFuY2hvclBvaW50MjtcbiAgICB0aGlzLmwxID0gdGhpcy5iMS5saW5lYXJWZWxvY2l0eTtcbiAgICB0aGlzLmwyID0gdGhpcy5iMi5saW5lYXJWZWxvY2l0eTtcbiAgICB0aGlzLmExID0gdGhpcy5iMS5hbmd1bGFyVmVsb2NpdHk7XG4gICAgdGhpcy5hMiA9IHRoaXMuYjIuYW5ndWxhclZlbG9jaXR5O1xuICAgIHRoaXMuaTEgPSB0aGlzLmIxLmludmVyc2VJbmVydGlhO1xuICAgIHRoaXMuaTIgPSB0aGlzLmIyLmludmVyc2VJbmVydGlhO1xuICAgIHRoaXMubGltaXRJbXB1bHNlID0gMDtcbiAgICB0aGlzLm1vdG9ySW1wdWxzZSA9IDA7XG4gIH1cblxuICBPYmplY3QuYXNzaWduKFRyYW5zbGF0aW9uYWxDb25zdHJhaW50LnByb3RvdHlwZSwge1xuXG4gICAgVHJhbnNsYXRpb25hbENvbnN0cmFpbnQ6IHRydWUsXG5cbiAgICBwcmVTb2x2ZTogZnVuY3Rpb24gKHRpbWVTdGVwLCBpbnZUaW1lU3RlcCkge1xuICAgICAgdGhpcy5heCA9IHRoaXMubGltaXRNb3Rvci5heGlzLng7XG4gICAgICB0aGlzLmF5ID0gdGhpcy5saW1pdE1vdG9yLmF4aXMueTtcbiAgICAgIHRoaXMuYXogPSB0aGlzLmxpbWl0TW90b3IuYXhpcy56O1xuICAgICAgdGhpcy5sb3dlckxpbWl0ID0gdGhpcy5saW1pdE1vdG9yLmxvd2VyTGltaXQ7XG4gICAgICB0aGlzLnVwcGVyTGltaXQgPSB0aGlzLmxpbWl0TW90b3IudXBwZXJMaW1pdDtcbiAgICAgIHRoaXMubW90b3JTcGVlZCA9IHRoaXMubGltaXRNb3Rvci5tb3RvclNwZWVkO1xuICAgICAgdGhpcy5tYXhNb3RvckZvcmNlID0gdGhpcy5saW1pdE1vdG9yLm1heE1vdG9yRm9yY2U7XG4gICAgICB0aGlzLmVuYWJsZU1vdG9yID0gdGhpcy5tYXhNb3RvckZvcmNlID4gMDtcbiAgICAgIHRoaXMubTEgPSB0aGlzLmIxLmludmVyc2VNYXNzO1xuICAgICAgdGhpcy5tMiA9IHRoaXMuYjIuaW52ZXJzZU1hc3M7XG5cbiAgICAgIHZhciB0aTEgPSB0aGlzLmkxLmVsZW1lbnRzO1xuICAgICAgdmFyIHRpMiA9IHRoaXMuaTIuZWxlbWVudHM7XG4gICAgICB0aGlzLmkxZTAwID0gdGkxWzBdO1xuICAgICAgdGhpcy5pMWUwMSA9IHRpMVsxXTtcbiAgICAgIHRoaXMuaTFlMDIgPSB0aTFbMl07XG4gICAgICB0aGlzLmkxZTEwID0gdGkxWzNdO1xuICAgICAgdGhpcy5pMWUxMSA9IHRpMVs0XTtcbiAgICAgIHRoaXMuaTFlMTIgPSB0aTFbNV07XG4gICAgICB0aGlzLmkxZTIwID0gdGkxWzZdO1xuICAgICAgdGhpcy5pMWUyMSA9IHRpMVs3XTtcbiAgICAgIHRoaXMuaTFlMjIgPSB0aTFbOF07XG5cbiAgICAgIHRoaXMuaTJlMDAgPSB0aTJbMF07XG4gICAgICB0aGlzLmkyZTAxID0gdGkyWzFdO1xuICAgICAgdGhpcy5pMmUwMiA9IHRpMlsyXTtcbiAgICAgIHRoaXMuaTJlMTAgPSB0aTJbM107XG4gICAgICB0aGlzLmkyZTExID0gdGkyWzRdO1xuICAgICAgdGhpcy5pMmUxMiA9IHRpMls1XTtcbiAgICAgIHRoaXMuaTJlMjAgPSB0aTJbNl07XG4gICAgICB0aGlzLmkyZTIxID0gdGkyWzddO1xuICAgICAgdGhpcy5pMmUyMiA9IHRpMls4XTtcblxuICAgICAgdmFyIGR4ID0gdGhpcy5wMi54IC0gdGhpcy5wMS54O1xuICAgICAgdmFyIGR5ID0gdGhpcy5wMi55IC0gdGhpcy5wMS55O1xuICAgICAgdmFyIGR6ID0gdGhpcy5wMi56IC0gdGhpcy5wMS56O1xuICAgICAgdmFyIGQgPSBkeCAqIHRoaXMuYXggKyBkeSAqIHRoaXMuYXkgKyBkeiAqIHRoaXMuYXo7XG4gICAgICB2YXIgZnJlcXVlbmN5ID0gdGhpcy5saW1pdE1vdG9yLmZyZXF1ZW5jeTtcbiAgICAgIHZhciBlbmFibGVTcHJpbmcgPSBmcmVxdWVuY3kgPiAwO1xuICAgICAgdmFyIGVuYWJsZUxpbWl0ID0gdGhpcy5sb3dlckxpbWl0IDw9IHRoaXMudXBwZXJMaW1pdDtcbiAgICAgIGlmIChlbmFibGVTcHJpbmcgJiYgZCA+IDIwIHx8IGQgPCAtMjApIHtcbiAgICAgICAgZW5hYmxlU3ByaW5nID0gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIGlmIChlbmFibGVMaW1pdCkge1xuICAgICAgICBpZiAodGhpcy5sb3dlckxpbWl0ID09IHRoaXMudXBwZXJMaW1pdCkge1xuICAgICAgICAgIGlmICh0aGlzLmxpbWl0U3RhdGUgIT0gMCkge1xuICAgICAgICAgICAgdGhpcy5saW1pdFN0YXRlID0gMDtcbiAgICAgICAgICAgIHRoaXMubGltaXRJbXB1bHNlID0gMDtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5saW1pdFZlbG9jaXR5ID0gdGhpcy5sb3dlckxpbWl0IC0gZDtcbiAgICAgICAgICBpZiAoIWVuYWJsZVNwcmluZykgZCA9IHRoaXMubG93ZXJMaW1pdDtcbiAgICAgICAgfSBlbHNlIGlmIChkIDwgdGhpcy5sb3dlckxpbWl0KSB7XG4gICAgICAgICAgaWYgKHRoaXMubGltaXRTdGF0ZSAhPSAtMSkge1xuICAgICAgICAgICAgdGhpcy5saW1pdFN0YXRlID0gLTE7XG4gICAgICAgICAgICB0aGlzLmxpbWl0SW1wdWxzZSA9IDA7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMubGltaXRWZWxvY2l0eSA9IHRoaXMubG93ZXJMaW1pdCAtIGQ7XG4gICAgICAgICAgaWYgKCFlbmFibGVTcHJpbmcpIGQgPSB0aGlzLmxvd2VyTGltaXQ7XG4gICAgICAgIH0gZWxzZSBpZiAoZCA+IHRoaXMudXBwZXJMaW1pdCkge1xuICAgICAgICAgIGlmICh0aGlzLmxpbWl0U3RhdGUgIT0gMSkge1xuICAgICAgICAgICAgdGhpcy5saW1pdFN0YXRlID0gMTtcbiAgICAgICAgICAgIHRoaXMubGltaXRJbXB1bHNlID0gMDtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5saW1pdFZlbG9jaXR5ID0gdGhpcy51cHBlckxpbWl0IC0gZDtcbiAgICAgICAgICBpZiAoIWVuYWJsZVNwcmluZykgZCA9IHRoaXMudXBwZXJMaW1pdDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLmxpbWl0U3RhdGUgPSAyO1xuICAgICAgICAgIHRoaXMubGltaXRJbXB1bHNlID0gMDtcbiAgICAgICAgICB0aGlzLmxpbWl0VmVsb2NpdHkgPSAwO1xuICAgICAgICB9XG4gICAgICAgIGlmICghZW5hYmxlU3ByaW5nKSB7XG4gICAgICAgICAgaWYgKHRoaXMubGltaXRWZWxvY2l0eSA+IDAuMDA1KSB0aGlzLmxpbWl0VmVsb2NpdHkgLT0gMC4wMDU7XG4gICAgICAgICAgZWxzZSBpZiAodGhpcy5saW1pdFZlbG9jaXR5IDwgLTAuMDA1KSB0aGlzLmxpbWl0VmVsb2NpdHkgKz0gMC4wMDU7XG4gICAgICAgICAgZWxzZSB0aGlzLmxpbWl0VmVsb2NpdHkgPSAwO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmxpbWl0U3RhdGUgPSAyO1xuICAgICAgICB0aGlzLmxpbWl0SW1wdWxzZSA9IDA7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLmVuYWJsZU1vdG9yICYmICh0aGlzLmxpbWl0U3RhdGUgIT0gMCB8fCBlbmFibGVTcHJpbmcpKSB7XG4gICAgICAgIHRoaXMubWF4TW90b3JJbXB1bHNlID0gdGhpcy5tYXhNb3RvckZvcmNlICogdGltZVN0ZXA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLm1vdG9ySW1wdWxzZSA9IDA7XG4gICAgICAgIHRoaXMubWF4TW90b3JJbXB1bHNlID0gMDtcbiAgICAgIH1cblxuICAgICAgdmFyIHJkeCA9IGQgKiB0aGlzLmF4O1xuICAgICAgdmFyIHJkeSA9IGQgKiB0aGlzLmF5O1xuICAgICAgdmFyIHJkeiA9IGQgKiB0aGlzLmF6O1xuICAgICAgdmFyIHcxID0gdGhpcy5tMSAvICh0aGlzLm0xICsgdGhpcy5tMik7XG4gICAgICB2YXIgdzIgPSAxIC0gdzE7XG4gICAgICB0aGlzLnIxeCA9IHRoaXMucjEueCArIHJkeCAqIHcxO1xuICAgICAgdGhpcy5yMXkgPSB0aGlzLnIxLnkgKyByZHkgKiB3MTtcbiAgICAgIHRoaXMucjF6ID0gdGhpcy5yMS56ICsgcmR6ICogdzE7XG4gICAgICB0aGlzLnIyeCA9IHRoaXMucjIueCAtIHJkeCAqIHcyO1xuICAgICAgdGhpcy5yMnkgPSB0aGlzLnIyLnkgLSByZHkgKiB3MjtcbiAgICAgIHRoaXMucjJ6ID0gdGhpcy5yMi56IC0gcmR6ICogdzI7XG5cbiAgICAgIHRoaXMudDF4ID0gdGhpcy5yMXkgKiB0aGlzLmF6IC0gdGhpcy5yMXogKiB0aGlzLmF5O1xuICAgICAgdGhpcy50MXkgPSB0aGlzLnIxeiAqIHRoaXMuYXggLSB0aGlzLnIxeCAqIHRoaXMuYXo7XG4gICAgICB0aGlzLnQxeiA9IHRoaXMucjF4ICogdGhpcy5heSAtIHRoaXMucjF5ICogdGhpcy5heDtcbiAgICAgIHRoaXMudDJ4ID0gdGhpcy5yMnkgKiB0aGlzLmF6IC0gdGhpcy5yMnogKiB0aGlzLmF5O1xuICAgICAgdGhpcy50MnkgPSB0aGlzLnIyeiAqIHRoaXMuYXggLSB0aGlzLnIyeCAqIHRoaXMuYXo7XG4gICAgICB0aGlzLnQyeiA9IHRoaXMucjJ4ICogdGhpcy5heSAtIHRoaXMucjJ5ICogdGhpcy5heDtcbiAgICAgIHRoaXMubDF4ID0gdGhpcy5heCAqIHRoaXMubTE7XG4gICAgICB0aGlzLmwxeSA9IHRoaXMuYXkgKiB0aGlzLm0xO1xuICAgICAgdGhpcy5sMXogPSB0aGlzLmF6ICogdGhpcy5tMTtcbiAgICAgIHRoaXMubDJ4ID0gdGhpcy5heCAqIHRoaXMubTI7XG4gICAgICB0aGlzLmwyeSA9IHRoaXMuYXkgKiB0aGlzLm0yO1xuICAgICAgdGhpcy5sMnogPSB0aGlzLmF6ICogdGhpcy5tMjtcbiAgICAgIHRoaXMuYTF4ID0gdGhpcy50MXggKiB0aGlzLmkxZTAwICsgdGhpcy50MXkgKiB0aGlzLmkxZTAxICsgdGhpcy50MXogKiB0aGlzLmkxZTAyO1xuICAgICAgdGhpcy5hMXkgPSB0aGlzLnQxeCAqIHRoaXMuaTFlMTAgKyB0aGlzLnQxeSAqIHRoaXMuaTFlMTEgKyB0aGlzLnQxeiAqIHRoaXMuaTFlMTI7XG4gICAgICB0aGlzLmExeiA9IHRoaXMudDF4ICogdGhpcy5pMWUyMCArIHRoaXMudDF5ICogdGhpcy5pMWUyMSArIHRoaXMudDF6ICogdGhpcy5pMWUyMjtcbiAgICAgIHRoaXMuYTJ4ID0gdGhpcy50MnggKiB0aGlzLmkyZTAwICsgdGhpcy50MnkgKiB0aGlzLmkyZTAxICsgdGhpcy50MnogKiB0aGlzLmkyZTAyO1xuICAgICAgdGhpcy5hMnkgPSB0aGlzLnQyeCAqIHRoaXMuaTJlMTAgKyB0aGlzLnQyeSAqIHRoaXMuaTJlMTEgKyB0aGlzLnQyeiAqIHRoaXMuaTJlMTI7XG4gICAgICB0aGlzLmEyeiA9IHRoaXMudDJ4ICogdGhpcy5pMmUyMCArIHRoaXMudDJ5ICogdGhpcy5pMmUyMSArIHRoaXMudDJ6ICogdGhpcy5pMmUyMjtcbiAgICAgIHRoaXMubW90b3JEZW5vbSA9XG4gICAgICAgIHRoaXMubTEgKyB0aGlzLm0yICtcbiAgICAgICAgdGhpcy5heCAqICh0aGlzLmExeSAqIHRoaXMucjF6IC0gdGhpcy5hMXogKiB0aGlzLnIxeSArIHRoaXMuYTJ5ICogdGhpcy5yMnogLSB0aGlzLmEyeiAqIHRoaXMucjJ5KSArXG4gICAgICAgIHRoaXMuYXkgKiAodGhpcy5hMXogKiB0aGlzLnIxeCAtIHRoaXMuYTF4ICogdGhpcy5yMXogKyB0aGlzLmEyeiAqIHRoaXMucjJ4IC0gdGhpcy5hMnggKiB0aGlzLnIyeikgK1xuICAgICAgICB0aGlzLmF6ICogKHRoaXMuYTF4ICogdGhpcy5yMXkgLSB0aGlzLmExeSAqIHRoaXMucjF4ICsgdGhpcy5hMnggKiB0aGlzLnIyeSAtIHRoaXMuYTJ5ICogdGhpcy5yMngpO1xuXG4gICAgICB0aGlzLmludk1vdG9yRGVub20gPSAxIC8gdGhpcy5tb3RvckRlbm9tO1xuXG4gICAgICBpZiAoZW5hYmxlU3ByaW5nICYmIHRoaXMubGltaXRTdGF0ZSAhPSAyKSB7XG4gICAgICAgIHZhciBvbWVnYSA9IDYuMjgzMTg1MyAqIGZyZXF1ZW5jeTtcbiAgICAgICAgdmFyIGsgPSBvbWVnYSAqIG9tZWdhICogdGltZVN0ZXA7XG4gICAgICAgIHZhciBkbXAgPSBpbnZUaW1lU3RlcCAvIChrICsgMiAqIHRoaXMubGltaXRNb3Rvci5kYW1waW5nUmF0aW8gKiBvbWVnYSk7XG4gICAgICAgIHRoaXMuY2ZtID0gdGhpcy5tb3RvckRlbm9tICogZG1wO1xuICAgICAgICB0aGlzLmxpbWl0VmVsb2NpdHkgKj0gayAqIGRtcDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuY2ZtID0gMDtcbiAgICAgICAgdGhpcy5saW1pdFZlbG9jaXR5ICo9IGludlRpbWVTdGVwICogMC4wNTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5pbnZEZW5vbSA9IDEgLyAodGhpcy5tb3RvckRlbm9tICsgdGhpcy5jZm0pO1xuXG4gICAgICB2YXIgdG90YWxJbXB1bHNlID0gdGhpcy5saW1pdEltcHVsc2UgKyB0aGlzLm1vdG9ySW1wdWxzZTtcbiAgICAgIHRoaXMubDEueCArPSB0b3RhbEltcHVsc2UgKiB0aGlzLmwxeDtcbiAgICAgIHRoaXMubDEueSArPSB0b3RhbEltcHVsc2UgKiB0aGlzLmwxeTtcbiAgICAgIHRoaXMubDEueiArPSB0b3RhbEltcHVsc2UgKiB0aGlzLmwxejtcbiAgICAgIHRoaXMuYTEueCArPSB0b3RhbEltcHVsc2UgKiB0aGlzLmExeDtcbiAgICAgIHRoaXMuYTEueSArPSB0b3RhbEltcHVsc2UgKiB0aGlzLmExeTtcbiAgICAgIHRoaXMuYTEueiArPSB0b3RhbEltcHVsc2UgKiB0aGlzLmExejtcbiAgICAgIHRoaXMubDIueCAtPSB0b3RhbEltcHVsc2UgKiB0aGlzLmwyeDtcbiAgICAgIHRoaXMubDIueSAtPSB0b3RhbEltcHVsc2UgKiB0aGlzLmwyeTtcbiAgICAgIHRoaXMubDIueiAtPSB0b3RhbEltcHVsc2UgKiB0aGlzLmwyejtcbiAgICAgIHRoaXMuYTIueCAtPSB0b3RhbEltcHVsc2UgKiB0aGlzLmEyeDtcbiAgICAgIHRoaXMuYTIueSAtPSB0b3RhbEltcHVsc2UgKiB0aGlzLmEyeTtcbiAgICAgIHRoaXMuYTIueiAtPSB0b3RhbEltcHVsc2UgKiB0aGlzLmEyejtcbiAgICB9LFxuICAgIHNvbHZlOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgcnZuID1cbiAgICAgICAgdGhpcy5heCAqICh0aGlzLmwyLnggLSB0aGlzLmwxLngpICsgdGhpcy5heSAqICh0aGlzLmwyLnkgLSB0aGlzLmwxLnkpICsgdGhpcy5heiAqICh0aGlzLmwyLnogLSB0aGlzLmwxLnopICtcbiAgICAgICAgdGhpcy50MnggKiB0aGlzLmEyLnggLSB0aGlzLnQxeCAqIHRoaXMuYTEueCArIHRoaXMudDJ5ICogdGhpcy5hMi55IC0gdGhpcy50MXkgKiB0aGlzLmExLnkgKyB0aGlzLnQyeiAqIHRoaXMuYTIueiAtIHRoaXMudDF6ICogdGhpcy5hMS56O1xuXG4gICAgICAvLyBtb3RvciBwYXJ0XG4gICAgICB2YXIgbmV3TW90b3JJbXB1bHNlO1xuICAgICAgaWYgKHRoaXMuZW5hYmxlTW90b3IpIHtcbiAgICAgICAgbmV3TW90b3JJbXB1bHNlID0gKHJ2biAtIHRoaXMubW90b3JTcGVlZCkgKiB0aGlzLmludk1vdG9yRGVub207XG4gICAgICAgIHZhciBvbGRNb3RvckltcHVsc2UgPSB0aGlzLm1vdG9ySW1wdWxzZTtcbiAgICAgICAgdGhpcy5tb3RvckltcHVsc2UgKz0gbmV3TW90b3JJbXB1bHNlO1xuICAgICAgICBpZiAodGhpcy5tb3RvckltcHVsc2UgPiB0aGlzLm1heE1vdG9ySW1wdWxzZSkgdGhpcy5tb3RvckltcHVsc2UgPSB0aGlzLm1heE1vdG9ySW1wdWxzZTtcbiAgICAgICAgZWxzZSBpZiAodGhpcy5tb3RvckltcHVsc2UgPCAtdGhpcy5tYXhNb3RvckltcHVsc2UpIHRoaXMubW90b3JJbXB1bHNlID0gLXRoaXMubWF4TW90b3JJbXB1bHNlO1xuICAgICAgICBuZXdNb3RvckltcHVsc2UgPSB0aGlzLm1vdG9ySW1wdWxzZSAtIG9sZE1vdG9ySW1wdWxzZTtcbiAgICAgICAgcnZuIC09IG5ld01vdG9ySW1wdWxzZSAqIHRoaXMubW90b3JEZW5vbTtcbiAgICAgIH0gZWxzZSBuZXdNb3RvckltcHVsc2UgPSAwO1xuXG4gICAgICAvLyBsaW1pdCBwYXJ0XG4gICAgICB2YXIgbmV3TGltaXRJbXB1bHNlO1xuICAgICAgaWYgKHRoaXMubGltaXRTdGF0ZSAhPSAyKSB7XG4gICAgICAgIG5ld0xpbWl0SW1wdWxzZSA9IChydm4gLSB0aGlzLmxpbWl0VmVsb2NpdHkgLSB0aGlzLmxpbWl0SW1wdWxzZSAqIHRoaXMuY2ZtKSAqIHRoaXMuaW52RGVub207XG4gICAgICAgIHZhciBvbGRMaW1pdEltcHVsc2UgPSB0aGlzLmxpbWl0SW1wdWxzZTtcbiAgICAgICAgdGhpcy5saW1pdEltcHVsc2UgKz0gbmV3TGltaXRJbXB1bHNlO1xuICAgICAgICBpZiAodGhpcy5saW1pdEltcHVsc2UgKiB0aGlzLmxpbWl0U3RhdGUgPCAwKSB0aGlzLmxpbWl0SW1wdWxzZSA9IDA7XG4gICAgICAgIG5ld0xpbWl0SW1wdWxzZSA9IHRoaXMubGltaXRJbXB1bHNlIC0gb2xkTGltaXRJbXB1bHNlO1xuICAgICAgfSBlbHNlIG5ld0xpbWl0SW1wdWxzZSA9IDA7XG5cbiAgICAgIHZhciB0b3RhbEltcHVsc2UgPSBuZXdMaW1pdEltcHVsc2UgKyBuZXdNb3RvckltcHVsc2U7XG4gICAgICB0aGlzLmwxLnggKz0gdG90YWxJbXB1bHNlICogdGhpcy5sMXg7XG4gICAgICB0aGlzLmwxLnkgKz0gdG90YWxJbXB1bHNlICogdGhpcy5sMXk7XG4gICAgICB0aGlzLmwxLnogKz0gdG90YWxJbXB1bHNlICogdGhpcy5sMXo7XG4gICAgICB0aGlzLmExLnggKz0gdG90YWxJbXB1bHNlICogdGhpcy5hMXg7XG4gICAgICB0aGlzLmExLnkgKz0gdG90YWxJbXB1bHNlICogdGhpcy5hMXk7XG4gICAgICB0aGlzLmExLnogKz0gdG90YWxJbXB1bHNlICogdGhpcy5hMXo7XG4gICAgICB0aGlzLmwyLnggLT0gdG90YWxJbXB1bHNlICogdGhpcy5sMng7XG4gICAgICB0aGlzLmwyLnkgLT0gdG90YWxJbXB1bHNlICogdGhpcy5sMnk7XG4gICAgICB0aGlzLmwyLnogLT0gdG90YWxJbXB1bHNlICogdGhpcy5sMno7XG4gICAgICB0aGlzLmEyLnggLT0gdG90YWxJbXB1bHNlICogdGhpcy5hMng7XG4gICAgICB0aGlzLmEyLnkgLT0gdG90YWxJbXB1bHNlICogdGhpcy5hMnk7XG4gICAgICB0aGlzLmEyLnogLT0gdG90YWxJbXB1bHNlICogdGhpcy5hMno7XG4gICAgfVxuICB9KTtcblxuICAvKipcbiAgICogQSBkaXN0YW5jZSBqb2ludCBsaW1pdHMgdGhlIGRpc3RhbmNlIGJldHdlZW4gdHdvIGFuY2hvciBwb2ludHMgb24gcmlnaWQgYm9kaWVzLlxuICAgKlxuICAgKiBAYXV0aG9yIHNhaGFyYW5cbiAgICogQGF1dGhvciBsby10aFxuICAgKi9cblxuICBmdW5jdGlvbiBEaXN0YW5jZUpvaW50KGNvbmZpZywgbWluRGlzdGFuY2UsIG1heERpc3RhbmNlKSB7XG5cbiAgICBKb2ludC5jYWxsKHRoaXMsIGNvbmZpZyk7XG5cbiAgICB0aGlzLnR5cGUgPSBKT0lOVF9ESVNUQU5DRTtcblxuICAgIHRoaXMubm9yID0gbmV3IFZlYzMoKTtcblxuICAgIC8vIFRoZSBsaW1pdCBhbmQgbW90b3IgaW5mb3JtYXRpb24gb2YgdGhlIGpvaW50LlxuICAgIHRoaXMubGltaXRNb3RvciA9IG5ldyBMaW1pdE1vdG9yKHRoaXMubm9yLCB0cnVlKTtcbiAgICB0aGlzLmxpbWl0TW90b3IubG93ZXJMaW1pdCA9IG1pbkRpc3RhbmNlO1xuICAgIHRoaXMubGltaXRNb3Rvci51cHBlckxpbWl0ID0gbWF4RGlzdGFuY2U7XG5cbiAgICB0aGlzLnQgPSBuZXcgVHJhbnNsYXRpb25hbENvbnN0cmFpbnQodGhpcywgdGhpcy5saW1pdE1vdG9yKTtcblxuICB9XG4gIERpc3RhbmNlSm9pbnQucHJvdG90eXBlID0gT2JqZWN0LmFzc2lnbihPYmplY3QuY3JlYXRlKEpvaW50LnByb3RvdHlwZSksIHtcblxuICAgIGNvbnN0cnVjdG9yOiBEaXN0YW5jZUpvaW50LFxuXG4gICAgcHJlU29sdmU6IGZ1bmN0aW9uICh0aW1lU3RlcCwgaW52VGltZVN0ZXApIHtcblxuICAgICAgdGhpcy51cGRhdGVBbmNob3JQb2ludHMoKTtcblxuICAgICAgdGhpcy5ub3Iuc3ViKHRoaXMuYW5jaG9yUG9pbnQyLCB0aGlzLmFuY2hvclBvaW50MSkubm9ybWFsaXplKCk7XG5cbiAgICAgIC8vIHByZVNvbHZlXG5cbiAgICAgIHRoaXMudC5wcmVTb2x2ZSh0aW1lU3RlcCwgaW52VGltZVN0ZXApO1xuXG4gICAgfSxcblxuICAgIHNvbHZlOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHRoaXMudC5zb2x2ZSgpO1xuXG4gICAgfSxcblxuICAgIHBvc3RTb2x2ZTogZnVuY3Rpb24gKCkge1xuXG4gICAgfVxuXG4gIH0pO1xuXG4gIC8qKlxuICAqIEFuIGFuZ3VsYXIgY29uc3RyYWludCBmb3IgYWxsIGF4ZXMgZm9yIHZhcmlvdXMgam9pbnRzLlxuICAqIEBhdXRob3Igc2FoYXJhblxuICAqL1xuXG4gIGZ1bmN0aW9uIEFuZ3VsYXJDb25zdHJhaW50KGpvaW50LCB0YXJnZXRPcmllbnRhdGlvbikge1xuXG4gICAgdGhpcy5qb2ludCA9IGpvaW50O1xuXG4gICAgdGhpcy50YXJnZXRPcmllbnRhdGlvbiA9IG5ldyBRdWF0KCkuaW52ZXJ0KHRhcmdldE9yaWVudGF0aW9uKTtcblxuICAgIHRoaXMucmVsYXRpdmVPcmllbnRhdGlvbiA9IG5ldyBRdWF0KCk7XG5cbiAgICB0aGlzLmlpMSA9IG51bGw7XG4gICAgdGhpcy5paTIgPSBudWxsO1xuICAgIHRoaXMuZGQgPSBudWxsO1xuXG4gICAgdGhpcy52ZWwgPSBuZXcgVmVjMygpO1xuICAgIHRoaXMuaW1wID0gbmV3IFZlYzMoKTtcblxuICAgIHRoaXMucm4wID0gbmV3IFZlYzMoKTtcbiAgICB0aGlzLnJuMSA9IG5ldyBWZWMzKCk7XG4gICAgdGhpcy5ybjIgPSBuZXcgVmVjMygpO1xuXG4gICAgdGhpcy5iMSA9IGpvaW50LmJvZHkxO1xuICAgIHRoaXMuYjIgPSBqb2ludC5ib2R5MjtcbiAgICB0aGlzLmExID0gdGhpcy5iMS5hbmd1bGFyVmVsb2NpdHk7XG4gICAgdGhpcy5hMiA9IHRoaXMuYjIuYW5ndWxhclZlbG9jaXR5O1xuICAgIHRoaXMuaTEgPSB0aGlzLmIxLmludmVyc2VJbmVydGlhO1xuICAgIHRoaXMuaTIgPSB0aGlzLmIyLmludmVyc2VJbmVydGlhO1xuXG4gIH1cbiAgT2JqZWN0LmFzc2lnbihBbmd1bGFyQ29uc3RyYWludC5wcm90b3R5cGUsIHtcblxuICAgIEFuZ3VsYXJDb25zdHJhaW50OiB0cnVlLFxuXG4gICAgcHJlU29sdmU6IGZ1bmN0aW9uICh0aW1lU3RlcCwgaW52VGltZVN0ZXApIHtcblxuICAgICAgdmFyIGludiwgbGVuLCB2O1xuXG4gICAgICB0aGlzLmlpMSA9IHRoaXMuaTEuY2xvbmUoKTtcbiAgICAgIHRoaXMuaWkyID0gdGhpcy5pMi5jbG9uZSgpO1xuXG4gICAgICB2ID0gbmV3IE1hdDMzKCkuYWRkKHRoaXMuaWkxLCB0aGlzLmlpMikuZWxlbWVudHM7XG4gICAgICBpbnYgPSAxIC8gKHZbMF0gKiAodls0XSAqIHZbOF0gLSB2WzddICogdls1XSkgKyB2WzNdICogKHZbN10gKiB2WzJdIC0gdlsxXSAqIHZbOF0pICsgdls2XSAqICh2WzFdICogdls1XSAtIHZbNF0gKiB2WzJdKSk7XG4gICAgICB0aGlzLmRkID0gbmV3IE1hdDMzKCkuc2V0KFxuICAgICAgICB2WzRdICogdls4XSAtIHZbNV0gKiB2WzddLCB2WzJdICogdls3XSAtIHZbMV0gKiB2WzhdLCB2WzFdICogdls1XSAtIHZbMl0gKiB2WzRdLFxuICAgICAgICB2WzVdICogdls2XSAtIHZbM10gKiB2WzhdLCB2WzBdICogdls4XSAtIHZbMl0gKiB2WzZdLCB2WzJdICogdlszXSAtIHZbMF0gKiB2WzVdLFxuICAgICAgICB2WzNdICogdls3XSAtIHZbNF0gKiB2WzZdLCB2WzFdICogdls2XSAtIHZbMF0gKiB2WzddLCB2WzBdICogdls0XSAtIHZbMV0gKiB2WzNdXG4gICAgICApLm11bHRpcGx5U2NhbGFyKGludik7XG5cbiAgICAgIHRoaXMucmVsYXRpdmVPcmllbnRhdGlvbi5pbnZlcnQodGhpcy5iMS5vcmllbnRhdGlvbikubXVsdGlwbHkodGhpcy50YXJnZXRPcmllbnRhdGlvbikubXVsdGlwbHkodGhpcy5iMi5vcmllbnRhdGlvbik7XG5cbiAgICAgIGludiA9IHRoaXMucmVsYXRpdmVPcmllbnRhdGlvbi53ICogMjtcblxuICAgICAgdGhpcy52ZWwuY29weSh0aGlzLnJlbGF0aXZlT3JpZW50YXRpb24pLm11bHRpcGx5U2NhbGFyKGludik7XG5cbiAgICAgIGxlbiA9IHRoaXMudmVsLmxlbmd0aCgpO1xuXG4gICAgICBpZiAobGVuID4gMC4wMikge1xuICAgICAgICBsZW4gPSAoMC4wMiAtIGxlbikgLyBsZW4gKiBpbnZUaW1lU3RlcCAqIDAuMDU7XG4gICAgICAgIHRoaXMudmVsLm11bHRpcGx5U2NhbGFyKGxlbik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnZlbC5zZXQoMCwgMCwgMCk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMucm4xLmNvcHkodGhpcy5pbXApLmFwcGx5TWF0cml4Myh0aGlzLmlpMSwgdHJ1ZSk7XG4gICAgICB0aGlzLnJuMi5jb3B5KHRoaXMuaW1wKS5hcHBseU1hdHJpeDModGhpcy5paTIsIHRydWUpO1xuXG4gICAgICB0aGlzLmExLmFkZCh0aGlzLnJuMSk7XG4gICAgICB0aGlzLmEyLnN1Yih0aGlzLnJuMik7XG5cbiAgICB9LFxuXG4gICAgc29sdmU6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgdmFyIHIgPSB0aGlzLmEyLmNsb25lKCkuc3ViKHRoaXMuYTEpLnN1Yih0aGlzLnZlbCk7XG5cbiAgICAgIHRoaXMucm4wLmNvcHkocikuYXBwbHlNYXRyaXgzKHRoaXMuZGQsIHRydWUpO1xuICAgICAgdGhpcy5ybjEuY29weSh0aGlzLnJuMCkuYXBwbHlNYXRyaXgzKHRoaXMuaWkxLCB0cnVlKTtcbiAgICAgIHRoaXMucm4yLmNvcHkodGhpcy5ybjApLmFwcGx5TWF0cml4Myh0aGlzLmlpMiwgdHJ1ZSk7XG5cbiAgICAgIHRoaXMuaW1wLmFkZCh0aGlzLnJuMCk7XG4gICAgICB0aGlzLmExLmFkZCh0aGlzLnJuMSk7XG4gICAgICB0aGlzLmEyLnN1Yih0aGlzLnJuMik7XG5cbiAgICB9XG5cbiAgfSk7XG5cbiAgLyoqXG4gICogQSB0aHJlZS1heGlzIHRyYW5zbGF0aW9uYWwgY29uc3RyYWludCBmb3IgdmFyaW91cyBqb2ludHMuXG4gICogQGF1dGhvciBzYWhhcmFuXG4gICovXG4gIGZ1bmN0aW9uIFRyYW5zbGF0aW9uYWwzQ29uc3RyYWludChqb2ludCwgbGltaXRNb3RvcjEsIGxpbWl0TW90b3IyLCBsaW1pdE1vdG9yMykge1xuXG4gICAgdGhpcy5tMSA9IE5hTjtcbiAgICB0aGlzLm0yID0gTmFOO1xuICAgIHRoaXMuaTFlMDAgPSBOYU47XG4gICAgdGhpcy5pMWUwMSA9IE5hTjtcbiAgICB0aGlzLmkxZTAyID0gTmFOO1xuICAgIHRoaXMuaTFlMTAgPSBOYU47XG4gICAgdGhpcy5pMWUxMSA9IE5hTjtcbiAgICB0aGlzLmkxZTEyID0gTmFOO1xuICAgIHRoaXMuaTFlMjAgPSBOYU47XG4gICAgdGhpcy5pMWUyMSA9IE5hTjtcbiAgICB0aGlzLmkxZTIyID0gTmFOO1xuICAgIHRoaXMuaTJlMDAgPSBOYU47XG4gICAgdGhpcy5pMmUwMSA9IE5hTjtcbiAgICB0aGlzLmkyZTAyID0gTmFOO1xuICAgIHRoaXMuaTJlMTAgPSBOYU47XG4gICAgdGhpcy5pMmUxMSA9IE5hTjtcbiAgICB0aGlzLmkyZTEyID0gTmFOO1xuICAgIHRoaXMuaTJlMjAgPSBOYU47XG4gICAgdGhpcy5pMmUyMSA9IE5hTjtcbiAgICB0aGlzLmkyZTIyID0gTmFOO1xuICAgIHRoaXMuYXgxID0gTmFOO1xuICAgIHRoaXMuYXkxID0gTmFOO1xuICAgIHRoaXMuYXoxID0gTmFOO1xuICAgIHRoaXMuYXgyID0gTmFOO1xuICAgIHRoaXMuYXkyID0gTmFOO1xuICAgIHRoaXMuYXoyID0gTmFOO1xuICAgIHRoaXMuYXgzID0gTmFOO1xuICAgIHRoaXMuYXkzID0gTmFOO1xuICAgIHRoaXMuYXozID0gTmFOO1xuICAgIHRoaXMucjF4ID0gTmFOO1xuICAgIHRoaXMucjF5ID0gTmFOO1xuICAgIHRoaXMucjF6ID0gTmFOO1xuICAgIHRoaXMucjJ4ID0gTmFOO1xuICAgIHRoaXMucjJ5ID0gTmFOO1xuICAgIHRoaXMucjJ6ID0gTmFOO1xuICAgIHRoaXMudDF4MSA9IE5hTjsvLyBqYWNvYmlhbnNcbiAgICB0aGlzLnQxeTEgPSBOYU47XG4gICAgdGhpcy50MXoxID0gTmFOO1xuICAgIHRoaXMudDJ4MSA9IE5hTjtcbiAgICB0aGlzLnQyeTEgPSBOYU47XG4gICAgdGhpcy50MnoxID0gTmFOO1xuICAgIHRoaXMubDF4MSA9IE5hTjtcbiAgICB0aGlzLmwxeTEgPSBOYU47XG4gICAgdGhpcy5sMXoxID0gTmFOO1xuICAgIHRoaXMubDJ4MSA9IE5hTjtcbiAgICB0aGlzLmwyeTEgPSBOYU47XG4gICAgdGhpcy5sMnoxID0gTmFOO1xuICAgIHRoaXMuYTF4MSA9IE5hTjtcbiAgICB0aGlzLmExeTEgPSBOYU47XG4gICAgdGhpcy5hMXoxID0gTmFOO1xuICAgIHRoaXMuYTJ4MSA9IE5hTjtcbiAgICB0aGlzLmEyeTEgPSBOYU47XG4gICAgdGhpcy5hMnoxID0gTmFOO1xuICAgIHRoaXMudDF4MiA9IE5hTjtcbiAgICB0aGlzLnQxeTIgPSBOYU47XG4gICAgdGhpcy50MXoyID0gTmFOO1xuICAgIHRoaXMudDJ4MiA9IE5hTjtcbiAgICB0aGlzLnQyeTIgPSBOYU47XG4gICAgdGhpcy50MnoyID0gTmFOO1xuICAgIHRoaXMubDF4MiA9IE5hTjtcbiAgICB0aGlzLmwxeTIgPSBOYU47XG4gICAgdGhpcy5sMXoyID0gTmFOO1xuICAgIHRoaXMubDJ4MiA9IE5hTjtcbiAgICB0aGlzLmwyeTIgPSBOYU47XG4gICAgdGhpcy5sMnoyID0gTmFOO1xuICAgIHRoaXMuYTF4MiA9IE5hTjtcbiAgICB0aGlzLmExeTIgPSBOYU47XG4gICAgdGhpcy5hMXoyID0gTmFOO1xuICAgIHRoaXMuYTJ4MiA9IE5hTjtcbiAgICB0aGlzLmEyeTIgPSBOYU47XG4gICAgdGhpcy5hMnoyID0gTmFOO1xuICAgIHRoaXMudDF4MyA9IE5hTjtcbiAgICB0aGlzLnQxeTMgPSBOYU47XG4gICAgdGhpcy50MXozID0gTmFOO1xuICAgIHRoaXMudDJ4MyA9IE5hTjtcbiAgICB0aGlzLnQyeTMgPSBOYU47XG4gICAgdGhpcy50MnozID0gTmFOO1xuICAgIHRoaXMubDF4MyA9IE5hTjtcbiAgICB0aGlzLmwxeTMgPSBOYU47XG4gICAgdGhpcy5sMXozID0gTmFOO1xuICAgIHRoaXMubDJ4MyA9IE5hTjtcbiAgICB0aGlzLmwyeTMgPSBOYU47XG4gICAgdGhpcy5sMnozID0gTmFOO1xuICAgIHRoaXMuYTF4MyA9IE5hTjtcbiAgICB0aGlzLmExeTMgPSBOYU47XG4gICAgdGhpcy5hMXozID0gTmFOO1xuICAgIHRoaXMuYTJ4MyA9IE5hTjtcbiAgICB0aGlzLmEyeTMgPSBOYU47XG4gICAgdGhpcy5hMnozID0gTmFOO1xuICAgIHRoaXMubG93ZXJMaW1pdDEgPSBOYU47XG4gICAgdGhpcy51cHBlckxpbWl0MSA9IE5hTjtcbiAgICB0aGlzLmxpbWl0VmVsb2NpdHkxID0gTmFOO1xuICAgIHRoaXMubGltaXRTdGF0ZTEgPSAwOyAvLyAtMTogYXQgbG93ZXIsIDA6IGxvY2tlZCwgMTogYXQgdXBwZXIsIDI6IHVubGltaXRlZFxuICAgIHRoaXMuZW5hYmxlTW90b3IxID0gZmFsc2U7XG4gICAgdGhpcy5tb3RvclNwZWVkMSA9IE5hTjtcbiAgICB0aGlzLm1heE1vdG9yRm9yY2UxID0gTmFOO1xuICAgIHRoaXMubWF4TW90b3JJbXB1bHNlMSA9IE5hTjtcbiAgICB0aGlzLmxvd2VyTGltaXQyID0gTmFOO1xuICAgIHRoaXMudXBwZXJMaW1pdDIgPSBOYU47XG4gICAgdGhpcy5saW1pdFZlbG9jaXR5MiA9IE5hTjtcbiAgICB0aGlzLmxpbWl0U3RhdGUyID0gMDsgLy8gLTE6IGF0IGxvd2VyLCAwOiBsb2NrZWQsIDE6IGF0IHVwcGVyLCAyOiB1bmxpbWl0ZWRcbiAgICB0aGlzLmVuYWJsZU1vdG9yMiA9IGZhbHNlO1xuICAgIHRoaXMubW90b3JTcGVlZDIgPSBOYU47XG4gICAgdGhpcy5tYXhNb3RvckZvcmNlMiA9IE5hTjtcbiAgICB0aGlzLm1heE1vdG9ySW1wdWxzZTIgPSBOYU47XG4gICAgdGhpcy5sb3dlckxpbWl0MyA9IE5hTjtcbiAgICB0aGlzLnVwcGVyTGltaXQzID0gTmFOO1xuICAgIHRoaXMubGltaXRWZWxvY2l0eTMgPSBOYU47XG4gICAgdGhpcy5saW1pdFN0YXRlMyA9IDA7IC8vIC0xOiBhdCBsb3dlciwgMDogbG9ja2VkLCAxOiBhdCB1cHBlciwgMjogdW5saW1pdGVkXG4gICAgdGhpcy5lbmFibGVNb3RvcjMgPSBmYWxzZTtcbiAgICB0aGlzLm1vdG9yU3BlZWQzID0gTmFOO1xuICAgIHRoaXMubWF4TW90b3JGb3JjZTMgPSBOYU47XG4gICAgdGhpcy5tYXhNb3RvckltcHVsc2UzID0gTmFOO1xuICAgIHRoaXMuazAwID0gTmFOOyAvLyBLID0gSipNKkpUXG4gICAgdGhpcy5rMDEgPSBOYU47XG4gICAgdGhpcy5rMDIgPSBOYU47XG4gICAgdGhpcy5rMTAgPSBOYU47XG4gICAgdGhpcy5rMTEgPSBOYU47XG4gICAgdGhpcy5rMTIgPSBOYU47XG4gICAgdGhpcy5rMjAgPSBOYU47XG4gICAgdGhpcy5rMjEgPSBOYU47XG4gICAgdGhpcy5rMjIgPSBOYU47XG4gICAgdGhpcy5rdjAwID0gTmFOOyAvLyBkaWFnb25hbHMgd2l0aG91dCBDRk1zXG4gICAgdGhpcy5rdjExID0gTmFOO1xuICAgIHRoaXMua3YyMiA9IE5hTjtcbiAgICB0aGlzLmR2MDAgPSBOYU47IC8vIC4uLmludmVydGVkXG4gICAgdGhpcy5kdjExID0gTmFOO1xuICAgIHRoaXMuZHYyMiA9IE5hTjtcbiAgICB0aGlzLmQwMCA9IE5hTjsgLy8gS14tMVxuICAgIHRoaXMuZDAxID0gTmFOO1xuICAgIHRoaXMuZDAyID0gTmFOO1xuICAgIHRoaXMuZDEwID0gTmFOO1xuICAgIHRoaXMuZDExID0gTmFOO1xuICAgIHRoaXMuZDEyID0gTmFOO1xuICAgIHRoaXMuZDIwID0gTmFOO1xuICAgIHRoaXMuZDIxID0gTmFOO1xuICAgIHRoaXMuZDIyID0gTmFOO1xuXG4gICAgdGhpcy5saW1pdE1vdG9yMSA9IGxpbWl0TW90b3IxO1xuICAgIHRoaXMubGltaXRNb3RvcjIgPSBsaW1pdE1vdG9yMjtcbiAgICB0aGlzLmxpbWl0TW90b3IzID0gbGltaXRNb3RvcjM7XG4gICAgdGhpcy5iMSA9IGpvaW50LmJvZHkxO1xuICAgIHRoaXMuYjIgPSBqb2ludC5ib2R5MjtcbiAgICB0aGlzLnAxID0gam9pbnQuYW5jaG9yUG9pbnQxO1xuICAgIHRoaXMucDIgPSBqb2ludC5hbmNob3JQb2ludDI7XG4gICAgdGhpcy5yMSA9IGpvaW50LnJlbGF0aXZlQW5jaG9yUG9pbnQxO1xuICAgIHRoaXMucjIgPSBqb2ludC5yZWxhdGl2ZUFuY2hvclBvaW50MjtcbiAgICB0aGlzLmwxID0gdGhpcy5iMS5saW5lYXJWZWxvY2l0eTtcbiAgICB0aGlzLmwyID0gdGhpcy5iMi5saW5lYXJWZWxvY2l0eTtcbiAgICB0aGlzLmExID0gdGhpcy5iMS5hbmd1bGFyVmVsb2NpdHk7XG4gICAgdGhpcy5hMiA9IHRoaXMuYjIuYW5ndWxhclZlbG9jaXR5O1xuICAgIHRoaXMuaTEgPSB0aGlzLmIxLmludmVyc2VJbmVydGlhO1xuICAgIHRoaXMuaTIgPSB0aGlzLmIyLmludmVyc2VJbmVydGlhO1xuICAgIHRoaXMubGltaXRJbXB1bHNlMSA9IDA7XG4gICAgdGhpcy5tb3RvckltcHVsc2UxID0gMDtcbiAgICB0aGlzLmxpbWl0SW1wdWxzZTIgPSAwO1xuICAgIHRoaXMubW90b3JJbXB1bHNlMiA9IDA7XG4gICAgdGhpcy5saW1pdEltcHVsc2UzID0gMDtcbiAgICB0aGlzLm1vdG9ySW1wdWxzZTMgPSAwO1xuICAgIHRoaXMuY2ZtMSA9IDA7Ly8gQ29uc3RyYWludCBGb3JjZSBNaXhpbmdcbiAgICB0aGlzLmNmbTIgPSAwO1xuICAgIHRoaXMuY2ZtMyA9IDA7XG4gICAgdGhpcy53ZWlnaHQgPSAtMTtcbiAgfVxuXG4gIE9iamVjdC5hc3NpZ24oVHJhbnNsYXRpb25hbDNDb25zdHJhaW50LnByb3RvdHlwZSwge1xuXG4gICAgVHJhbnNsYXRpb25hbDNDb25zdHJhaW50OiB0cnVlLFxuXG4gICAgcHJlU29sdmU6IGZ1bmN0aW9uICh0aW1lU3RlcCwgaW52VGltZVN0ZXApIHtcbiAgICAgIHRoaXMuYXgxID0gdGhpcy5saW1pdE1vdG9yMS5heGlzLng7XG4gICAgICB0aGlzLmF5MSA9IHRoaXMubGltaXRNb3RvcjEuYXhpcy55O1xuICAgICAgdGhpcy5hejEgPSB0aGlzLmxpbWl0TW90b3IxLmF4aXMuejtcbiAgICAgIHRoaXMuYXgyID0gdGhpcy5saW1pdE1vdG9yMi5heGlzLng7XG4gICAgICB0aGlzLmF5MiA9IHRoaXMubGltaXRNb3RvcjIuYXhpcy55O1xuICAgICAgdGhpcy5hejIgPSB0aGlzLmxpbWl0TW90b3IyLmF4aXMuejtcbiAgICAgIHRoaXMuYXgzID0gdGhpcy5saW1pdE1vdG9yMy5heGlzLng7XG4gICAgICB0aGlzLmF5MyA9IHRoaXMubGltaXRNb3RvcjMuYXhpcy55O1xuICAgICAgdGhpcy5hejMgPSB0aGlzLmxpbWl0TW90b3IzLmF4aXMuejtcbiAgICAgIHRoaXMubG93ZXJMaW1pdDEgPSB0aGlzLmxpbWl0TW90b3IxLmxvd2VyTGltaXQ7XG4gICAgICB0aGlzLnVwcGVyTGltaXQxID0gdGhpcy5saW1pdE1vdG9yMS51cHBlckxpbWl0O1xuICAgICAgdGhpcy5tb3RvclNwZWVkMSA9IHRoaXMubGltaXRNb3RvcjEubW90b3JTcGVlZDtcbiAgICAgIHRoaXMubWF4TW90b3JGb3JjZTEgPSB0aGlzLmxpbWl0TW90b3IxLm1heE1vdG9yRm9yY2U7XG4gICAgICB0aGlzLmVuYWJsZU1vdG9yMSA9IHRoaXMubWF4TW90b3JGb3JjZTEgPiAwO1xuICAgICAgdGhpcy5sb3dlckxpbWl0MiA9IHRoaXMubGltaXRNb3RvcjIubG93ZXJMaW1pdDtcbiAgICAgIHRoaXMudXBwZXJMaW1pdDIgPSB0aGlzLmxpbWl0TW90b3IyLnVwcGVyTGltaXQ7XG4gICAgICB0aGlzLm1vdG9yU3BlZWQyID0gdGhpcy5saW1pdE1vdG9yMi5tb3RvclNwZWVkO1xuICAgICAgdGhpcy5tYXhNb3RvckZvcmNlMiA9IHRoaXMubGltaXRNb3RvcjIubWF4TW90b3JGb3JjZTtcbiAgICAgIHRoaXMuZW5hYmxlTW90b3IyID0gdGhpcy5tYXhNb3RvckZvcmNlMiA+IDA7XG4gICAgICB0aGlzLmxvd2VyTGltaXQzID0gdGhpcy5saW1pdE1vdG9yMy5sb3dlckxpbWl0O1xuICAgICAgdGhpcy51cHBlckxpbWl0MyA9IHRoaXMubGltaXRNb3RvcjMudXBwZXJMaW1pdDtcbiAgICAgIHRoaXMubW90b3JTcGVlZDMgPSB0aGlzLmxpbWl0TW90b3IzLm1vdG9yU3BlZWQ7XG4gICAgICB0aGlzLm1heE1vdG9yRm9yY2UzID0gdGhpcy5saW1pdE1vdG9yMy5tYXhNb3RvckZvcmNlO1xuICAgICAgdGhpcy5lbmFibGVNb3RvcjMgPSB0aGlzLm1heE1vdG9yRm9yY2UzID4gMDtcbiAgICAgIHRoaXMubTEgPSB0aGlzLmIxLmludmVyc2VNYXNzO1xuICAgICAgdGhpcy5tMiA9IHRoaXMuYjIuaW52ZXJzZU1hc3M7XG5cbiAgICAgIHZhciB0aTEgPSB0aGlzLmkxLmVsZW1lbnRzO1xuICAgICAgdmFyIHRpMiA9IHRoaXMuaTIuZWxlbWVudHM7XG4gICAgICB0aGlzLmkxZTAwID0gdGkxWzBdO1xuICAgICAgdGhpcy5pMWUwMSA9IHRpMVsxXTtcbiAgICAgIHRoaXMuaTFlMDIgPSB0aTFbMl07XG4gICAgICB0aGlzLmkxZTEwID0gdGkxWzNdO1xuICAgICAgdGhpcy5pMWUxMSA9IHRpMVs0XTtcbiAgICAgIHRoaXMuaTFlMTIgPSB0aTFbNV07XG4gICAgICB0aGlzLmkxZTIwID0gdGkxWzZdO1xuICAgICAgdGhpcy5pMWUyMSA9IHRpMVs3XTtcbiAgICAgIHRoaXMuaTFlMjIgPSB0aTFbOF07XG5cbiAgICAgIHRoaXMuaTJlMDAgPSB0aTJbMF07XG4gICAgICB0aGlzLmkyZTAxID0gdGkyWzFdO1xuICAgICAgdGhpcy5pMmUwMiA9IHRpMlsyXTtcbiAgICAgIHRoaXMuaTJlMTAgPSB0aTJbM107XG4gICAgICB0aGlzLmkyZTExID0gdGkyWzRdO1xuICAgICAgdGhpcy5pMmUxMiA9IHRpMls1XTtcbiAgICAgIHRoaXMuaTJlMjAgPSB0aTJbNl07XG4gICAgICB0aGlzLmkyZTIxID0gdGkyWzddO1xuICAgICAgdGhpcy5pMmUyMiA9IHRpMls4XTtcblxuICAgICAgdmFyIGR4ID0gdGhpcy5wMi54IC0gdGhpcy5wMS54O1xuICAgICAgdmFyIGR5ID0gdGhpcy5wMi55IC0gdGhpcy5wMS55O1xuICAgICAgdmFyIGR6ID0gdGhpcy5wMi56IC0gdGhpcy5wMS56O1xuICAgICAgdmFyIGQxID0gZHggKiB0aGlzLmF4MSArIGR5ICogdGhpcy5heTEgKyBkeiAqIHRoaXMuYXoxO1xuICAgICAgdmFyIGQyID0gZHggKiB0aGlzLmF4MiArIGR5ICogdGhpcy5heTIgKyBkeiAqIHRoaXMuYXoyO1xuICAgICAgdmFyIGQzID0gZHggKiB0aGlzLmF4MyArIGR5ICogdGhpcy5heTMgKyBkeiAqIHRoaXMuYXozO1xuICAgICAgdmFyIGZyZXF1ZW5jeTEgPSB0aGlzLmxpbWl0TW90b3IxLmZyZXF1ZW5jeTtcbiAgICAgIHZhciBmcmVxdWVuY3kyID0gdGhpcy5saW1pdE1vdG9yMi5mcmVxdWVuY3k7XG4gICAgICB2YXIgZnJlcXVlbmN5MyA9IHRoaXMubGltaXRNb3RvcjMuZnJlcXVlbmN5O1xuICAgICAgdmFyIGVuYWJsZVNwcmluZzEgPSBmcmVxdWVuY3kxID4gMDtcbiAgICAgIHZhciBlbmFibGVTcHJpbmcyID0gZnJlcXVlbmN5MiA+IDA7XG4gICAgICB2YXIgZW5hYmxlU3ByaW5nMyA9IGZyZXF1ZW5jeTMgPiAwO1xuICAgICAgdmFyIGVuYWJsZUxpbWl0MSA9IHRoaXMubG93ZXJMaW1pdDEgPD0gdGhpcy51cHBlckxpbWl0MTtcbiAgICAgIHZhciBlbmFibGVMaW1pdDIgPSB0aGlzLmxvd2VyTGltaXQyIDw9IHRoaXMudXBwZXJMaW1pdDI7XG4gICAgICB2YXIgZW5hYmxlTGltaXQzID0gdGhpcy5sb3dlckxpbWl0MyA8PSB0aGlzLnVwcGVyTGltaXQzO1xuXG4gICAgICAvLyBmb3Igc3RhYmlsaXR5XG4gICAgICBpZiAoZW5hYmxlU3ByaW5nMSAmJiBkMSA+IDIwIHx8IGQxIDwgLTIwKSB7XG4gICAgICAgIGVuYWJsZVNwcmluZzEgPSBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGlmIChlbmFibGVTcHJpbmcyICYmIGQyID4gMjAgfHwgZDIgPCAtMjApIHtcbiAgICAgICAgZW5hYmxlU3ByaW5nMiA9IGZhbHNlO1xuICAgICAgfVxuICAgICAgaWYgKGVuYWJsZVNwcmluZzMgJiYgZDMgPiAyMCB8fCBkMyA8IC0yMCkge1xuICAgICAgICBlbmFibGVTcHJpbmczID0gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIGlmIChlbmFibGVMaW1pdDEpIHtcbiAgICAgICAgaWYgKHRoaXMubG93ZXJMaW1pdDEgPT0gdGhpcy51cHBlckxpbWl0MSkge1xuICAgICAgICAgIGlmICh0aGlzLmxpbWl0U3RhdGUxICE9IDApIHtcbiAgICAgICAgICAgIHRoaXMubGltaXRTdGF0ZTEgPSAwO1xuICAgICAgICAgICAgdGhpcy5saW1pdEltcHVsc2UxID0gMDtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5saW1pdFZlbG9jaXR5MSA9IHRoaXMubG93ZXJMaW1pdDEgLSBkMTtcbiAgICAgICAgICBpZiAoIWVuYWJsZVNwcmluZzEpIGQxID0gdGhpcy5sb3dlckxpbWl0MTtcbiAgICAgICAgfSBlbHNlIGlmIChkMSA8IHRoaXMubG93ZXJMaW1pdDEpIHtcbiAgICAgICAgICBpZiAodGhpcy5saW1pdFN0YXRlMSAhPSAtMSkge1xuICAgICAgICAgICAgdGhpcy5saW1pdFN0YXRlMSA9IC0xO1xuICAgICAgICAgICAgdGhpcy5saW1pdEltcHVsc2UxID0gMDtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5saW1pdFZlbG9jaXR5MSA9IHRoaXMubG93ZXJMaW1pdDEgLSBkMTtcbiAgICAgICAgICBpZiAoIWVuYWJsZVNwcmluZzEpIGQxID0gdGhpcy5sb3dlckxpbWl0MTtcbiAgICAgICAgfSBlbHNlIGlmIChkMSA+IHRoaXMudXBwZXJMaW1pdDEpIHtcbiAgICAgICAgICBpZiAodGhpcy5saW1pdFN0YXRlMSAhPSAxKSB7XG4gICAgICAgICAgICB0aGlzLmxpbWl0U3RhdGUxID0gMTtcbiAgICAgICAgICAgIHRoaXMubGltaXRJbXB1bHNlMSA9IDA7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMubGltaXRWZWxvY2l0eTEgPSB0aGlzLnVwcGVyTGltaXQxIC0gZDE7XG4gICAgICAgICAgaWYgKCFlbmFibGVTcHJpbmcxKSBkMSA9IHRoaXMudXBwZXJMaW1pdDE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5saW1pdFN0YXRlMSA9IDI7XG4gICAgICAgICAgdGhpcy5saW1pdEltcHVsc2UxID0gMDtcbiAgICAgICAgICB0aGlzLmxpbWl0VmVsb2NpdHkxID0gMDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWVuYWJsZVNwcmluZzEpIHtcbiAgICAgICAgICBpZiAodGhpcy5saW1pdFZlbG9jaXR5MSA+IDAuMDA1KSB0aGlzLmxpbWl0VmVsb2NpdHkxIC09IDAuMDA1O1xuICAgICAgICAgIGVsc2UgaWYgKHRoaXMubGltaXRWZWxvY2l0eTEgPCAtMC4wMDUpIHRoaXMubGltaXRWZWxvY2l0eTEgKz0gMC4wMDU7XG4gICAgICAgICAgZWxzZSB0aGlzLmxpbWl0VmVsb2NpdHkxID0gMDtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5saW1pdFN0YXRlMSA9IDI7XG4gICAgICAgIHRoaXMubGltaXRJbXB1bHNlMSA9IDA7XG4gICAgICB9XG5cbiAgICAgIGlmIChlbmFibGVMaW1pdDIpIHtcbiAgICAgICAgaWYgKHRoaXMubG93ZXJMaW1pdDIgPT0gdGhpcy51cHBlckxpbWl0Mikge1xuICAgICAgICAgIGlmICh0aGlzLmxpbWl0U3RhdGUyICE9IDApIHtcbiAgICAgICAgICAgIHRoaXMubGltaXRTdGF0ZTIgPSAwO1xuICAgICAgICAgICAgdGhpcy5saW1pdEltcHVsc2UyID0gMDtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5saW1pdFZlbG9jaXR5MiA9IHRoaXMubG93ZXJMaW1pdDIgLSBkMjtcbiAgICAgICAgICBpZiAoIWVuYWJsZVNwcmluZzIpIGQyID0gdGhpcy5sb3dlckxpbWl0MjtcbiAgICAgICAgfSBlbHNlIGlmIChkMiA8IHRoaXMubG93ZXJMaW1pdDIpIHtcbiAgICAgICAgICBpZiAodGhpcy5saW1pdFN0YXRlMiAhPSAtMSkge1xuICAgICAgICAgICAgdGhpcy5saW1pdFN0YXRlMiA9IC0xO1xuICAgICAgICAgICAgdGhpcy5saW1pdEltcHVsc2UyID0gMDtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5saW1pdFZlbG9jaXR5MiA9IHRoaXMubG93ZXJMaW1pdDIgLSBkMjtcbiAgICAgICAgICBpZiAoIWVuYWJsZVNwcmluZzIpIGQyID0gdGhpcy5sb3dlckxpbWl0MjtcbiAgICAgICAgfSBlbHNlIGlmIChkMiA+IHRoaXMudXBwZXJMaW1pdDIpIHtcbiAgICAgICAgICBpZiAodGhpcy5saW1pdFN0YXRlMiAhPSAxKSB7XG4gICAgICAgICAgICB0aGlzLmxpbWl0U3RhdGUyID0gMTtcbiAgICAgICAgICAgIHRoaXMubGltaXRJbXB1bHNlMiA9IDA7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMubGltaXRWZWxvY2l0eTIgPSB0aGlzLnVwcGVyTGltaXQyIC0gZDI7XG4gICAgICAgICAgaWYgKCFlbmFibGVTcHJpbmcyKSBkMiA9IHRoaXMudXBwZXJMaW1pdDI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5saW1pdFN0YXRlMiA9IDI7XG4gICAgICAgICAgdGhpcy5saW1pdEltcHVsc2UyID0gMDtcbiAgICAgICAgICB0aGlzLmxpbWl0VmVsb2NpdHkyID0gMDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWVuYWJsZVNwcmluZzIpIHtcbiAgICAgICAgICBpZiAodGhpcy5saW1pdFZlbG9jaXR5MiA+IDAuMDA1KSB0aGlzLmxpbWl0VmVsb2NpdHkyIC09IDAuMDA1O1xuICAgICAgICAgIGVsc2UgaWYgKHRoaXMubGltaXRWZWxvY2l0eTIgPCAtMC4wMDUpIHRoaXMubGltaXRWZWxvY2l0eTIgKz0gMC4wMDU7XG4gICAgICAgICAgZWxzZSB0aGlzLmxpbWl0VmVsb2NpdHkyID0gMDtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5saW1pdFN0YXRlMiA9IDI7XG4gICAgICAgIHRoaXMubGltaXRJbXB1bHNlMiA9IDA7XG4gICAgICB9XG5cbiAgICAgIGlmIChlbmFibGVMaW1pdDMpIHtcbiAgICAgICAgaWYgKHRoaXMubG93ZXJMaW1pdDMgPT0gdGhpcy51cHBlckxpbWl0Mykge1xuICAgICAgICAgIGlmICh0aGlzLmxpbWl0U3RhdGUzICE9IDApIHtcbiAgICAgICAgICAgIHRoaXMubGltaXRTdGF0ZTMgPSAwO1xuICAgICAgICAgICAgdGhpcy5saW1pdEltcHVsc2UzID0gMDtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5saW1pdFZlbG9jaXR5MyA9IHRoaXMubG93ZXJMaW1pdDMgLSBkMztcbiAgICAgICAgICBpZiAoIWVuYWJsZVNwcmluZzMpIGQzID0gdGhpcy5sb3dlckxpbWl0MztcbiAgICAgICAgfSBlbHNlIGlmIChkMyA8IHRoaXMubG93ZXJMaW1pdDMpIHtcbiAgICAgICAgICBpZiAodGhpcy5saW1pdFN0YXRlMyAhPSAtMSkge1xuICAgICAgICAgICAgdGhpcy5saW1pdFN0YXRlMyA9IC0xO1xuICAgICAgICAgICAgdGhpcy5saW1pdEltcHVsc2UzID0gMDtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5saW1pdFZlbG9jaXR5MyA9IHRoaXMubG93ZXJMaW1pdDMgLSBkMztcbiAgICAgICAgICBpZiAoIWVuYWJsZVNwcmluZzMpIGQzID0gdGhpcy5sb3dlckxpbWl0MztcbiAgICAgICAgfSBlbHNlIGlmIChkMyA+IHRoaXMudXBwZXJMaW1pdDMpIHtcbiAgICAgICAgICBpZiAodGhpcy5saW1pdFN0YXRlMyAhPSAxKSB7XG4gICAgICAgICAgICB0aGlzLmxpbWl0U3RhdGUzID0gMTtcbiAgICAgICAgICAgIHRoaXMubGltaXRJbXB1bHNlMyA9IDA7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMubGltaXRWZWxvY2l0eTMgPSB0aGlzLnVwcGVyTGltaXQzIC0gZDM7XG4gICAgICAgICAgaWYgKCFlbmFibGVTcHJpbmczKSBkMyA9IHRoaXMudXBwZXJMaW1pdDM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5saW1pdFN0YXRlMyA9IDI7XG4gICAgICAgICAgdGhpcy5saW1pdEltcHVsc2UzID0gMDtcbiAgICAgICAgICB0aGlzLmxpbWl0VmVsb2NpdHkzID0gMDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWVuYWJsZVNwcmluZzMpIHtcbiAgICAgICAgICBpZiAodGhpcy5saW1pdFZlbG9jaXR5MyA+IDAuMDA1KSB0aGlzLmxpbWl0VmVsb2NpdHkzIC09IDAuMDA1O1xuICAgICAgICAgIGVsc2UgaWYgKHRoaXMubGltaXRWZWxvY2l0eTMgPCAtMC4wMDUpIHRoaXMubGltaXRWZWxvY2l0eTMgKz0gMC4wMDU7XG4gICAgICAgICAgZWxzZSB0aGlzLmxpbWl0VmVsb2NpdHkzID0gMDtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5saW1pdFN0YXRlMyA9IDI7XG4gICAgICAgIHRoaXMubGltaXRJbXB1bHNlMyA9IDA7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLmVuYWJsZU1vdG9yMSAmJiAodGhpcy5saW1pdFN0YXRlMSAhPSAwIHx8IGVuYWJsZVNwcmluZzEpKSB7XG4gICAgICAgIHRoaXMubWF4TW90b3JJbXB1bHNlMSA9IHRoaXMubWF4TW90b3JGb3JjZTEgKiB0aW1lU3RlcDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMubW90b3JJbXB1bHNlMSA9IDA7XG4gICAgICAgIHRoaXMubWF4TW90b3JJbXB1bHNlMSA9IDA7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLmVuYWJsZU1vdG9yMiAmJiAodGhpcy5saW1pdFN0YXRlMiAhPSAwIHx8IGVuYWJsZVNwcmluZzIpKSB7XG4gICAgICAgIHRoaXMubWF4TW90b3JJbXB1bHNlMiA9IHRoaXMubWF4TW90b3JGb3JjZTIgKiB0aW1lU3RlcDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMubW90b3JJbXB1bHNlMiA9IDA7XG4gICAgICAgIHRoaXMubWF4TW90b3JJbXB1bHNlMiA9IDA7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLmVuYWJsZU1vdG9yMyAmJiAodGhpcy5saW1pdFN0YXRlMyAhPSAwIHx8IGVuYWJsZVNwcmluZzMpKSB7XG4gICAgICAgIHRoaXMubWF4TW90b3JJbXB1bHNlMyA9IHRoaXMubWF4TW90b3JGb3JjZTMgKiB0aW1lU3RlcDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMubW90b3JJbXB1bHNlMyA9IDA7XG4gICAgICAgIHRoaXMubWF4TW90b3JJbXB1bHNlMyA9IDA7XG4gICAgICB9XG5cbiAgICAgIHZhciByZHggPSBkMSAqIHRoaXMuYXgxICsgZDIgKiB0aGlzLmF4MiArIGQzICogdGhpcy5heDI7XG4gICAgICB2YXIgcmR5ID0gZDEgKiB0aGlzLmF5MSArIGQyICogdGhpcy5heTIgKyBkMyAqIHRoaXMuYXkyO1xuICAgICAgdmFyIHJkeiA9IGQxICogdGhpcy5hejEgKyBkMiAqIHRoaXMuYXoyICsgZDMgKiB0aGlzLmF6MjtcbiAgICAgIHZhciB3MSA9IHRoaXMubTIgLyAodGhpcy5tMSArIHRoaXMubTIpO1xuICAgICAgaWYgKHRoaXMud2VpZ2h0ID49IDApIHcxID0gdGhpcy53ZWlnaHQ7IC8vIHVzZSBnaXZlbiB3ZWlnaHRcbiAgICAgIHZhciB3MiA9IDEgLSB3MTtcbiAgICAgIHRoaXMucjF4ID0gdGhpcy5yMS54ICsgcmR4ICogdzE7XG4gICAgICB0aGlzLnIxeSA9IHRoaXMucjEueSArIHJkeSAqIHcxO1xuICAgICAgdGhpcy5yMXogPSB0aGlzLnIxLnogKyByZHogKiB3MTtcbiAgICAgIHRoaXMucjJ4ID0gdGhpcy5yMi54IC0gcmR4ICogdzI7XG4gICAgICB0aGlzLnIyeSA9IHRoaXMucjIueSAtIHJkeSAqIHcyO1xuICAgICAgdGhpcy5yMnogPSB0aGlzLnIyLnogLSByZHogKiB3MjtcblxuICAgICAgLy8gYnVpbGQgamFjb2JpYW5zXG4gICAgICB0aGlzLnQxeDEgPSB0aGlzLnIxeSAqIHRoaXMuYXoxIC0gdGhpcy5yMXogKiB0aGlzLmF5MTtcbiAgICAgIHRoaXMudDF5MSA9IHRoaXMucjF6ICogdGhpcy5heDEgLSB0aGlzLnIxeCAqIHRoaXMuYXoxO1xuICAgICAgdGhpcy50MXoxID0gdGhpcy5yMXggKiB0aGlzLmF5MSAtIHRoaXMucjF5ICogdGhpcy5heDE7XG4gICAgICB0aGlzLnQyeDEgPSB0aGlzLnIyeSAqIHRoaXMuYXoxIC0gdGhpcy5yMnogKiB0aGlzLmF5MTtcbiAgICAgIHRoaXMudDJ5MSA9IHRoaXMucjJ6ICogdGhpcy5heDEgLSB0aGlzLnIyeCAqIHRoaXMuYXoxO1xuICAgICAgdGhpcy50MnoxID0gdGhpcy5yMnggKiB0aGlzLmF5MSAtIHRoaXMucjJ5ICogdGhpcy5heDE7XG4gICAgICB0aGlzLmwxeDEgPSB0aGlzLmF4MSAqIHRoaXMubTE7XG4gICAgICB0aGlzLmwxeTEgPSB0aGlzLmF5MSAqIHRoaXMubTE7XG4gICAgICB0aGlzLmwxejEgPSB0aGlzLmF6MSAqIHRoaXMubTE7XG4gICAgICB0aGlzLmwyeDEgPSB0aGlzLmF4MSAqIHRoaXMubTI7XG4gICAgICB0aGlzLmwyeTEgPSB0aGlzLmF5MSAqIHRoaXMubTI7XG4gICAgICB0aGlzLmwyejEgPSB0aGlzLmF6MSAqIHRoaXMubTI7XG4gICAgICB0aGlzLmExeDEgPSB0aGlzLnQxeDEgKiB0aGlzLmkxZTAwICsgdGhpcy50MXkxICogdGhpcy5pMWUwMSArIHRoaXMudDF6MSAqIHRoaXMuaTFlMDI7XG4gICAgICB0aGlzLmExeTEgPSB0aGlzLnQxeDEgKiB0aGlzLmkxZTEwICsgdGhpcy50MXkxICogdGhpcy5pMWUxMSArIHRoaXMudDF6MSAqIHRoaXMuaTFlMTI7XG4gICAgICB0aGlzLmExejEgPSB0aGlzLnQxeDEgKiB0aGlzLmkxZTIwICsgdGhpcy50MXkxICogdGhpcy5pMWUyMSArIHRoaXMudDF6MSAqIHRoaXMuaTFlMjI7XG4gICAgICB0aGlzLmEyeDEgPSB0aGlzLnQyeDEgKiB0aGlzLmkyZTAwICsgdGhpcy50MnkxICogdGhpcy5pMmUwMSArIHRoaXMudDJ6MSAqIHRoaXMuaTJlMDI7XG4gICAgICB0aGlzLmEyeTEgPSB0aGlzLnQyeDEgKiB0aGlzLmkyZTEwICsgdGhpcy50MnkxICogdGhpcy5pMmUxMSArIHRoaXMudDJ6MSAqIHRoaXMuaTJlMTI7XG4gICAgICB0aGlzLmEyejEgPSB0aGlzLnQyeDEgKiB0aGlzLmkyZTIwICsgdGhpcy50MnkxICogdGhpcy5pMmUyMSArIHRoaXMudDJ6MSAqIHRoaXMuaTJlMjI7XG5cbiAgICAgIHRoaXMudDF4MiA9IHRoaXMucjF5ICogdGhpcy5hejIgLSB0aGlzLnIxeiAqIHRoaXMuYXkyO1xuICAgICAgdGhpcy50MXkyID0gdGhpcy5yMXogKiB0aGlzLmF4MiAtIHRoaXMucjF4ICogdGhpcy5hejI7XG4gICAgICB0aGlzLnQxejIgPSB0aGlzLnIxeCAqIHRoaXMuYXkyIC0gdGhpcy5yMXkgKiB0aGlzLmF4MjtcbiAgICAgIHRoaXMudDJ4MiA9IHRoaXMucjJ5ICogdGhpcy5hejIgLSB0aGlzLnIyeiAqIHRoaXMuYXkyO1xuICAgICAgdGhpcy50MnkyID0gdGhpcy5yMnogKiB0aGlzLmF4MiAtIHRoaXMucjJ4ICogdGhpcy5hejI7XG4gICAgICB0aGlzLnQyejIgPSB0aGlzLnIyeCAqIHRoaXMuYXkyIC0gdGhpcy5yMnkgKiB0aGlzLmF4MjtcbiAgICAgIHRoaXMubDF4MiA9IHRoaXMuYXgyICogdGhpcy5tMTtcbiAgICAgIHRoaXMubDF5MiA9IHRoaXMuYXkyICogdGhpcy5tMTtcbiAgICAgIHRoaXMubDF6MiA9IHRoaXMuYXoyICogdGhpcy5tMTtcbiAgICAgIHRoaXMubDJ4MiA9IHRoaXMuYXgyICogdGhpcy5tMjtcbiAgICAgIHRoaXMubDJ5MiA9IHRoaXMuYXkyICogdGhpcy5tMjtcbiAgICAgIHRoaXMubDJ6MiA9IHRoaXMuYXoyICogdGhpcy5tMjtcbiAgICAgIHRoaXMuYTF4MiA9IHRoaXMudDF4MiAqIHRoaXMuaTFlMDAgKyB0aGlzLnQxeTIgKiB0aGlzLmkxZTAxICsgdGhpcy50MXoyICogdGhpcy5pMWUwMjtcbiAgICAgIHRoaXMuYTF5MiA9IHRoaXMudDF4MiAqIHRoaXMuaTFlMTAgKyB0aGlzLnQxeTIgKiB0aGlzLmkxZTExICsgdGhpcy50MXoyICogdGhpcy5pMWUxMjtcbiAgICAgIHRoaXMuYTF6MiA9IHRoaXMudDF4MiAqIHRoaXMuaTFlMjAgKyB0aGlzLnQxeTIgKiB0aGlzLmkxZTIxICsgdGhpcy50MXoyICogdGhpcy5pMWUyMjtcbiAgICAgIHRoaXMuYTJ4MiA9IHRoaXMudDJ4MiAqIHRoaXMuaTJlMDAgKyB0aGlzLnQyeTIgKiB0aGlzLmkyZTAxICsgdGhpcy50MnoyICogdGhpcy5pMmUwMjtcbiAgICAgIHRoaXMuYTJ5MiA9IHRoaXMudDJ4MiAqIHRoaXMuaTJlMTAgKyB0aGlzLnQyeTIgKiB0aGlzLmkyZTExICsgdGhpcy50MnoyICogdGhpcy5pMmUxMjtcbiAgICAgIHRoaXMuYTJ6MiA9IHRoaXMudDJ4MiAqIHRoaXMuaTJlMjAgKyB0aGlzLnQyeTIgKiB0aGlzLmkyZTIxICsgdGhpcy50MnoyICogdGhpcy5pMmUyMjtcblxuICAgICAgdGhpcy50MXgzID0gdGhpcy5yMXkgKiB0aGlzLmF6MyAtIHRoaXMucjF6ICogdGhpcy5heTM7XG4gICAgICB0aGlzLnQxeTMgPSB0aGlzLnIxeiAqIHRoaXMuYXgzIC0gdGhpcy5yMXggKiB0aGlzLmF6MztcbiAgICAgIHRoaXMudDF6MyA9IHRoaXMucjF4ICogdGhpcy5heTMgLSB0aGlzLnIxeSAqIHRoaXMuYXgzO1xuICAgICAgdGhpcy50MngzID0gdGhpcy5yMnkgKiB0aGlzLmF6MyAtIHRoaXMucjJ6ICogdGhpcy5heTM7XG4gICAgICB0aGlzLnQyeTMgPSB0aGlzLnIyeiAqIHRoaXMuYXgzIC0gdGhpcy5yMnggKiB0aGlzLmF6MztcbiAgICAgIHRoaXMudDJ6MyA9IHRoaXMucjJ4ICogdGhpcy5heTMgLSB0aGlzLnIyeSAqIHRoaXMuYXgzO1xuICAgICAgdGhpcy5sMXgzID0gdGhpcy5heDMgKiB0aGlzLm0xO1xuICAgICAgdGhpcy5sMXkzID0gdGhpcy5heTMgKiB0aGlzLm0xO1xuICAgICAgdGhpcy5sMXozID0gdGhpcy5hejMgKiB0aGlzLm0xO1xuICAgICAgdGhpcy5sMngzID0gdGhpcy5heDMgKiB0aGlzLm0yO1xuICAgICAgdGhpcy5sMnkzID0gdGhpcy5heTMgKiB0aGlzLm0yO1xuICAgICAgdGhpcy5sMnozID0gdGhpcy5hejMgKiB0aGlzLm0yO1xuICAgICAgdGhpcy5hMXgzID0gdGhpcy50MXgzICogdGhpcy5pMWUwMCArIHRoaXMudDF5MyAqIHRoaXMuaTFlMDEgKyB0aGlzLnQxejMgKiB0aGlzLmkxZTAyO1xuICAgICAgdGhpcy5hMXkzID0gdGhpcy50MXgzICogdGhpcy5pMWUxMCArIHRoaXMudDF5MyAqIHRoaXMuaTFlMTEgKyB0aGlzLnQxejMgKiB0aGlzLmkxZTEyO1xuICAgICAgdGhpcy5hMXozID0gdGhpcy50MXgzICogdGhpcy5pMWUyMCArIHRoaXMudDF5MyAqIHRoaXMuaTFlMjEgKyB0aGlzLnQxejMgKiB0aGlzLmkxZTIyO1xuICAgICAgdGhpcy5hMngzID0gdGhpcy50MngzICogdGhpcy5pMmUwMCArIHRoaXMudDJ5MyAqIHRoaXMuaTJlMDEgKyB0aGlzLnQyejMgKiB0aGlzLmkyZTAyO1xuICAgICAgdGhpcy5hMnkzID0gdGhpcy50MngzICogdGhpcy5pMmUxMCArIHRoaXMudDJ5MyAqIHRoaXMuaTJlMTEgKyB0aGlzLnQyejMgKiB0aGlzLmkyZTEyO1xuICAgICAgdGhpcy5hMnozID0gdGhpcy50MngzICogdGhpcy5pMmUyMCArIHRoaXMudDJ5MyAqIHRoaXMuaTJlMjEgKyB0aGlzLnQyejMgKiB0aGlzLmkyZTIyO1xuXG4gICAgICAvLyBidWlsZCBhbiBpbXB1bHNlIG1hdHJpeFxuICAgICAgdmFyIG0xMiA9IHRoaXMubTEgKyB0aGlzLm0yO1xuICAgICAgdGhpcy5rMDAgPSAodGhpcy5heDEgKiB0aGlzLmF4MSArIHRoaXMuYXkxICogdGhpcy5heTEgKyB0aGlzLmF6MSAqIHRoaXMuYXoxKSAqIG0xMjtcbiAgICAgIHRoaXMuazAxID0gKHRoaXMuYXgxICogdGhpcy5heDIgKyB0aGlzLmF5MSAqIHRoaXMuYXkyICsgdGhpcy5hejEgKiB0aGlzLmF6MikgKiBtMTI7XG4gICAgICB0aGlzLmswMiA9ICh0aGlzLmF4MSAqIHRoaXMuYXgzICsgdGhpcy5heTEgKiB0aGlzLmF5MyArIHRoaXMuYXoxICogdGhpcy5hejMpICogbTEyO1xuICAgICAgdGhpcy5rMTAgPSAodGhpcy5heDIgKiB0aGlzLmF4MSArIHRoaXMuYXkyICogdGhpcy5heTEgKyB0aGlzLmF6MiAqIHRoaXMuYXoxKSAqIG0xMjtcbiAgICAgIHRoaXMuazExID0gKHRoaXMuYXgyICogdGhpcy5heDIgKyB0aGlzLmF5MiAqIHRoaXMuYXkyICsgdGhpcy5hejIgKiB0aGlzLmF6MikgKiBtMTI7XG4gICAgICB0aGlzLmsxMiA9ICh0aGlzLmF4MiAqIHRoaXMuYXgzICsgdGhpcy5heTIgKiB0aGlzLmF5MyArIHRoaXMuYXoyICogdGhpcy5hejMpICogbTEyO1xuICAgICAgdGhpcy5rMjAgPSAodGhpcy5heDMgKiB0aGlzLmF4MSArIHRoaXMuYXkzICogdGhpcy5heTEgKyB0aGlzLmF6MyAqIHRoaXMuYXoxKSAqIG0xMjtcbiAgICAgIHRoaXMuazIxID0gKHRoaXMuYXgzICogdGhpcy5heDIgKyB0aGlzLmF5MyAqIHRoaXMuYXkyICsgdGhpcy5hejMgKiB0aGlzLmF6MikgKiBtMTI7XG4gICAgICB0aGlzLmsyMiA9ICh0aGlzLmF4MyAqIHRoaXMuYXgzICsgdGhpcy5heTMgKiB0aGlzLmF5MyArIHRoaXMuYXozICogdGhpcy5hejMpICogbTEyO1xuXG4gICAgICB0aGlzLmswMCArPSB0aGlzLnQxeDEgKiB0aGlzLmExeDEgKyB0aGlzLnQxeTEgKiB0aGlzLmExeTEgKyB0aGlzLnQxejEgKiB0aGlzLmExejE7XG4gICAgICB0aGlzLmswMSArPSB0aGlzLnQxeDEgKiB0aGlzLmExeDIgKyB0aGlzLnQxeTEgKiB0aGlzLmExeTIgKyB0aGlzLnQxejEgKiB0aGlzLmExejI7XG4gICAgICB0aGlzLmswMiArPSB0aGlzLnQxeDEgKiB0aGlzLmExeDMgKyB0aGlzLnQxeTEgKiB0aGlzLmExeTMgKyB0aGlzLnQxejEgKiB0aGlzLmExejM7XG4gICAgICB0aGlzLmsxMCArPSB0aGlzLnQxeDIgKiB0aGlzLmExeDEgKyB0aGlzLnQxeTIgKiB0aGlzLmExeTEgKyB0aGlzLnQxejIgKiB0aGlzLmExejE7XG4gICAgICB0aGlzLmsxMSArPSB0aGlzLnQxeDIgKiB0aGlzLmExeDIgKyB0aGlzLnQxeTIgKiB0aGlzLmExeTIgKyB0aGlzLnQxejIgKiB0aGlzLmExejI7XG4gICAgICB0aGlzLmsxMiArPSB0aGlzLnQxeDIgKiB0aGlzLmExeDMgKyB0aGlzLnQxeTIgKiB0aGlzLmExeTMgKyB0aGlzLnQxejIgKiB0aGlzLmExejM7XG4gICAgICB0aGlzLmsyMCArPSB0aGlzLnQxeDMgKiB0aGlzLmExeDEgKyB0aGlzLnQxeTMgKiB0aGlzLmExeTEgKyB0aGlzLnQxejMgKiB0aGlzLmExejE7XG4gICAgICB0aGlzLmsyMSArPSB0aGlzLnQxeDMgKiB0aGlzLmExeDIgKyB0aGlzLnQxeTMgKiB0aGlzLmExeTIgKyB0aGlzLnQxejMgKiB0aGlzLmExejI7XG4gICAgICB0aGlzLmsyMiArPSB0aGlzLnQxeDMgKiB0aGlzLmExeDMgKyB0aGlzLnQxeTMgKiB0aGlzLmExeTMgKyB0aGlzLnQxejMgKiB0aGlzLmExejM7XG5cbiAgICAgIHRoaXMuazAwICs9IHRoaXMudDJ4MSAqIHRoaXMuYTJ4MSArIHRoaXMudDJ5MSAqIHRoaXMuYTJ5MSArIHRoaXMudDJ6MSAqIHRoaXMuYTJ6MTtcbiAgICAgIHRoaXMuazAxICs9IHRoaXMudDJ4MSAqIHRoaXMuYTJ4MiArIHRoaXMudDJ5MSAqIHRoaXMuYTJ5MiArIHRoaXMudDJ6MSAqIHRoaXMuYTJ6MjtcbiAgICAgIHRoaXMuazAyICs9IHRoaXMudDJ4MSAqIHRoaXMuYTJ4MyArIHRoaXMudDJ5MSAqIHRoaXMuYTJ5MyArIHRoaXMudDJ6MSAqIHRoaXMuYTJ6MztcbiAgICAgIHRoaXMuazEwICs9IHRoaXMudDJ4MiAqIHRoaXMuYTJ4MSArIHRoaXMudDJ5MiAqIHRoaXMuYTJ5MSArIHRoaXMudDJ6MiAqIHRoaXMuYTJ6MTtcbiAgICAgIHRoaXMuazExICs9IHRoaXMudDJ4MiAqIHRoaXMuYTJ4MiArIHRoaXMudDJ5MiAqIHRoaXMuYTJ5MiArIHRoaXMudDJ6MiAqIHRoaXMuYTJ6MjtcbiAgICAgIHRoaXMuazEyICs9IHRoaXMudDJ4MiAqIHRoaXMuYTJ4MyArIHRoaXMudDJ5MiAqIHRoaXMuYTJ5MyArIHRoaXMudDJ6MiAqIHRoaXMuYTJ6MztcbiAgICAgIHRoaXMuazIwICs9IHRoaXMudDJ4MyAqIHRoaXMuYTJ4MSArIHRoaXMudDJ5MyAqIHRoaXMuYTJ5MSArIHRoaXMudDJ6MyAqIHRoaXMuYTJ6MTtcbiAgICAgIHRoaXMuazIxICs9IHRoaXMudDJ4MyAqIHRoaXMuYTJ4MiArIHRoaXMudDJ5MyAqIHRoaXMuYTJ5MiArIHRoaXMudDJ6MyAqIHRoaXMuYTJ6MjtcbiAgICAgIHRoaXMuazIyICs9IHRoaXMudDJ4MyAqIHRoaXMuYTJ4MyArIHRoaXMudDJ5MyAqIHRoaXMuYTJ5MyArIHRoaXMudDJ6MyAqIHRoaXMuYTJ6MztcblxuICAgICAgdGhpcy5rdjAwID0gdGhpcy5rMDA7XG4gICAgICB0aGlzLmt2MTEgPSB0aGlzLmsxMTtcbiAgICAgIHRoaXMua3YyMiA9IHRoaXMuazIyO1xuXG4gICAgICB0aGlzLmR2MDAgPSAxIC8gdGhpcy5rdjAwO1xuICAgICAgdGhpcy5kdjExID0gMSAvIHRoaXMua3YxMTtcbiAgICAgIHRoaXMuZHYyMiA9IDEgLyB0aGlzLmt2MjI7XG5cbiAgICAgIGlmIChlbmFibGVTcHJpbmcxICYmIHRoaXMubGltaXRTdGF0ZTEgIT0gMikge1xuICAgICAgICB2YXIgb21lZ2EgPSA2LjI4MzE4NTMgKiBmcmVxdWVuY3kxO1xuICAgICAgICB2YXIgayA9IG9tZWdhICogb21lZ2EgKiB0aW1lU3RlcDtcbiAgICAgICAgdmFyIGRtcCA9IGludlRpbWVTdGVwIC8gKGsgKyAyICogdGhpcy5saW1pdE1vdG9yMS5kYW1waW5nUmF0aW8gKiBvbWVnYSk7XG4gICAgICAgIHRoaXMuY2ZtMSA9IHRoaXMua3YwMCAqIGRtcDtcbiAgICAgICAgdGhpcy5saW1pdFZlbG9jaXR5MSAqPSBrICogZG1wO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5jZm0xID0gMDtcbiAgICAgICAgdGhpcy5saW1pdFZlbG9jaXR5MSAqPSBpbnZUaW1lU3RlcCAqIDAuMDU7XG4gICAgICB9XG4gICAgICBpZiAoZW5hYmxlU3ByaW5nMiAmJiB0aGlzLmxpbWl0U3RhdGUyICE9IDIpIHtcbiAgICAgICAgb21lZ2EgPSA2LjI4MzE4NTMgKiBmcmVxdWVuY3kyO1xuICAgICAgICBrID0gb21lZ2EgKiBvbWVnYSAqIHRpbWVTdGVwO1xuICAgICAgICBkbXAgPSBpbnZUaW1lU3RlcCAvIChrICsgMiAqIHRoaXMubGltaXRNb3RvcjIuZGFtcGluZ1JhdGlvICogb21lZ2EpO1xuICAgICAgICB0aGlzLmNmbTIgPSB0aGlzLmt2MTEgKiBkbXA7XG4gICAgICAgIHRoaXMubGltaXRWZWxvY2l0eTIgKj0gayAqIGRtcDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuY2ZtMiA9IDA7XG4gICAgICAgIHRoaXMubGltaXRWZWxvY2l0eTIgKj0gaW52VGltZVN0ZXAgKiAwLjA1O1xuICAgICAgfVxuICAgICAgaWYgKGVuYWJsZVNwcmluZzMgJiYgdGhpcy5saW1pdFN0YXRlMyAhPSAyKSB7XG4gICAgICAgIG9tZWdhID0gNi4yODMxODUzICogZnJlcXVlbmN5MztcbiAgICAgICAgayA9IG9tZWdhICogb21lZ2EgKiB0aW1lU3RlcDtcbiAgICAgICAgZG1wID0gaW52VGltZVN0ZXAgLyAoayArIDIgKiB0aGlzLmxpbWl0TW90b3IzLmRhbXBpbmdSYXRpbyAqIG9tZWdhKTtcbiAgICAgICAgdGhpcy5jZm0zID0gdGhpcy5rdjIyICogZG1wO1xuICAgICAgICB0aGlzLmxpbWl0VmVsb2NpdHkzICo9IGsgKiBkbXA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmNmbTMgPSAwO1xuICAgICAgICB0aGlzLmxpbWl0VmVsb2NpdHkzICo9IGludlRpbWVTdGVwICogMC4wNTtcbiAgICAgIH1cbiAgICAgIHRoaXMuazAwICs9IHRoaXMuY2ZtMTtcbiAgICAgIHRoaXMuazExICs9IHRoaXMuY2ZtMjtcbiAgICAgIHRoaXMuazIyICs9IHRoaXMuY2ZtMztcblxuICAgICAgdmFyIGludiA9IDEgLyAoXG4gICAgICAgIHRoaXMuazAwICogKHRoaXMuazExICogdGhpcy5rMjIgLSB0aGlzLmsyMSAqIHRoaXMuazEyKSArXG4gICAgICAgIHRoaXMuazEwICogKHRoaXMuazIxICogdGhpcy5rMDIgLSB0aGlzLmswMSAqIHRoaXMuazIyKSArXG4gICAgICAgIHRoaXMuazIwICogKHRoaXMuazAxICogdGhpcy5rMTIgLSB0aGlzLmsxMSAqIHRoaXMuazAyKVxuICAgICAgKTtcbiAgICAgIHRoaXMuZDAwID0gKHRoaXMuazExICogdGhpcy5rMjIgLSB0aGlzLmsxMiAqIHRoaXMuazIxKSAqIGludjtcbiAgICAgIHRoaXMuZDAxID0gKHRoaXMuazAyICogdGhpcy5rMjEgLSB0aGlzLmswMSAqIHRoaXMuazIyKSAqIGludjtcbiAgICAgIHRoaXMuZDAyID0gKHRoaXMuazAxICogdGhpcy5rMTIgLSB0aGlzLmswMiAqIHRoaXMuazExKSAqIGludjtcbiAgICAgIHRoaXMuZDEwID0gKHRoaXMuazEyICogdGhpcy5rMjAgLSB0aGlzLmsxMCAqIHRoaXMuazIyKSAqIGludjtcbiAgICAgIHRoaXMuZDExID0gKHRoaXMuazAwICogdGhpcy5rMjIgLSB0aGlzLmswMiAqIHRoaXMuazIwKSAqIGludjtcbiAgICAgIHRoaXMuZDEyID0gKHRoaXMuazAyICogdGhpcy5rMTAgLSB0aGlzLmswMCAqIHRoaXMuazEyKSAqIGludjtcbiAgICAgIHRoaXMuZDIwID0gKHRoaXMuazEwICogdGhpcy5rMjEgLSB0aGlzLmsxMSAqIHRoaXMuazIwKSAqIGludjtcbiAgICAgIHRoaXMuZDIxID0gKHRoaXMuazAxICogdGhpcy5rMjAgLSB0aGlzLmswMCAqIHRoaXMuazIxKSAqIGludjtcbiAgICAgIHRoaXMuZDIyID0gKHRoaXMuazAwICogdGhpcy5rMTEgLSB0aGlzLmswMSAqIHRoaXMuazEwKSAqIGludjtcblxuICAgICAgLy8gd2FybSBzdGFydGluZ1xuICAgICAgdmFyIHRvdGFsSW1wdWxzZTEgPSB0aGlzLmxpbWl0SW1wdWxzZTEgKyB0aGlzLm1vdG9ySW1wdWxzZTE7XG4gICAgICB2YXIgdG90YWxJbXB1bHNlMiA9IHRoaXMubGltaXRJbXB1bHNlMiArIHRoaXMubW90b3JJbXB1bHNlMjtcbiAgICAgIHZhciB0b3RhbEltcHVsc2UzID0gdGhpcy5saW1pdEltcHVsc2UzICsgdGhpcy5tb3RvckltcHVsc2UzO1xuICAgICAgdGhpcy5sMS54ICs9IHRvdGFsSW1wdWxzZTEgKiB0aGlzLmwxeDEgKyB0b3RhbEltcHVsc2UyICogdGhpcy5sMXgyICsgdG90YWxJbXB1bHNlMyAqIHRoaXMubDF4MztcbiAgICAgIHRoaXMubDEueSArPSB0b3RhbEltcHVsc2UxICogdGhpcy5sMXkxICsgdG90YWxJbXB1bHNlMiAqIHRoaXMubDF5MiArIHRvdGFsSW1wdWxzZTMgKiB0aGlzLmwxeTM7XG4gICAgICB0aGlzLmwxLnogKz0gdG90YWxJbXB1bHNlMSAqIHRoaXMubDF6MSArIHRvdGFsSW1wdWxzZTIgKiB0aGlzLmwxejIgKyB0b3RhbEltcHVsc2UzICogdGhpcy5sMXozO1xuICAgICAgdGhpcy5hMS54ICs9IHRvdGFsSW1wdWxzZTEgKiB0aGlzLmExeDEgKyB0b3RhbEltcHVsc2UyICogdGhpcy5hMXgyICsgdG90YWxJbXB1bHNlMyAqIHRoaXMuYTF4MztcbiAgICAgIHRoaXMuYTEueSArPSB0b3RhbEltcHVsc2UxICogdGhpcy5hMXkxICsgdG90YWxJbXB1bHNlMiAqIHRoaXMuYTF5MiArIHRvdGFsSW1wdWxzZTMgKiB0aGlzLmExeTM7XG4gICAgICB0aGlzLmExLnogKz0gdG90YWxJbXB1bHNlMSAqIHRoaXMuYTF6MSArIHRvdGFsSW1wdWxzZTIgKiB0aGlzLmExejIgKyB0b3RhbEltcHVsc2UzICogdGhpcy5hMXozO1xuICAgICAgdGhpcy5sMi54IC09IHRvdGFsSW1wdWxzZTEgKiB0aGlzLmwyeDEgKyB0b3RhbEltcHVsc2UyICogdGhpcy5sMngyICsgdG90YWxJbXB1bHNlMyAqIHRoaXMubDJ4MztcbiAgICAgIHRoaXMubDIueSAtPSB0b3RhbEltcHVsc2UxICogdGhpcy5sMnkxICsgdG90YWxJbXB1bHNlMiAqIHRoaXMubDJ5MiArIHRvdGFsSW1wdWxzZTMgKiB0aGlzLmwyeTM7XG4gICAgICB0aGlzLmwyLnogLT0gdG90YWxJbXB1bHNlMSAqIHRoaXMubDJ6MSArIHRvdGFsSW1wdWxzZTIgKiB0aGlzLmwyejIgKyB0b3RhbEltcHVsc2UzICogdGhpcy5sMnozO1xuICAgICAgdGhpcy5hMi54IC09IHRvdGFsSW1wdWxzZTEgKiB0aGlzLmEyeDEgKyB0b3RhbEltcHVsc2UyICogdGhpcy5hMngyICsgdG90YWxJbXB1bHNlMyAqIHRoaXMuYTJ4MztcbiAgICAgIHRoaXMuYTIueSAtPSB0b3RhbEltcHVsc2UxICogdGhpcy5hMnkxICsgdG90YWxJbXB1bHNlMiAqIHRoaXMuYTJ5MiArIHRvdGFsSW1wdWxzZTMgKiB0aGlzLmEyeTM7XG4gICAgICB0aGlzLmEyLnogLT0gdG90YWxJbXB1bHNlMSAqIHRoaXMuYTJ6MSArIHRvdGFsSW1wdWxzZTIgKiB0aGlzLmEyejIgKyB0b3RhbEltcHVsc2UzICogdGhpcy5hMnozO1xuICAgIH0sXG5cbiAgICBzb2x2ZTogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIHJ2eCA9IHRoaXMubDIueCAtIHRoaXMubDEueCArIHRoaXMuYTIueSAqIHRoaXMucjJ6IC0gdGhpcy5hMi56ICogdGhpcy5yMnkgLSB0aGlzLmExLnkgKiB0aGlzLnIxeiArIHRoaXMuYTEueiAqIHRoaXMucjF5O1xuICAgICAgdmFyIHJ2eSA9IHRoaXMubDIueSAtIHRoaXMubDEueSArIHRoaXMuYTIueiAqIHRoaXMucjJ4IC0gdGhpcy5hMi54ICogdGhpcy5yMnogLSB0aGlzLmExLnogKiB0aGlzLnIxeCArIHRoaXMuYTEueCAqIHRoaXMucjF6O1xuICAgICAgdmFyIHJ2eiA9IHRoaXMubDIueiAtIHRoaXMubDEueiArIHRoaXMuYTIueCAqIHRoaXMucjJ5IC0gdGhpcy5hMi55ICogdGhpcy5yMnggLSB0aGlzLmExLnggKiB0aGlzLnIxeSArIHRoaXMuYTEueSAqIHRoaXMucjF4O1xuICAgICAgdmFyIHJ2bjEgPSBydnggKiB0aGlzLmF4MSArIHJ2eSAqIHRoaXMuYXkxICsgcnZ6ICogdGhpcy5hejE7XG4gICAgICB2YXIgcnZuMiA9IHJ2eCAqIHRoaXMuYXgyICsgcnZ5ICogdGhpcy5heTIgKyBydnogKiB0aGlzLmF6MjtcbiAgICAgIHZhciBydm4zID0gcnZ4ICogdGhpcy5heDMgKyBydnkgKiB0aGlzLmF5MyArIHJ2eiAqIHRoaXMuYXozO1xuICAgICAgdmFyIG9sZE1vdG9ySW1wdWxzZTEgPSB0aGlzLm1vdG9ySW1wdWxzZTE7XG4gICAgICB2YXIgb2xkTW90b3JJbXB1bHNlMiA9IHRoaXMubW90b3JJbXB1bHNlMjtcbiAgICAgIHZhciBvbGRNb3RvckltcHVsc2UzID0gdGhpcy5tb3RvckltcHVsc2UzO1xuICAgICAgdmFyIGRNb3RvckltcHVsc2UxID0gMDtcbiAgICAgIHZhciBkTW90b3JJbXB1bHNlMiA9IDA7XG4gICAgICB2YXIgZE1vdG9ySW1wdWxzZTMgPSAwO1xuICAgICAgaWYgKHRoaXMuZW5hYmxlTW90b3IxKSB7XG4gICAgICAgIGRNb3RvckltcHVsc2UxID0gKHJ2bjEgLSB0aGlzLm1vdG9yU3BlZWQxKSAqIHRoaXMuZHYwMDtcbiAgICAgICAgdGhpcy5tb3RvckltcHVsc2UxICs9IGRNb3RvckltcHVsc2UxO1xuICAgICAgICBpZiAodGhpcy5tb3RvckltcHVsc2UxID4gdGhpcy5tYXhNb3RvckltcHVsc2UxKSB7IC8vIGNsYW1wIG1vdG9yIGltcHVsc2VcbiAgICAgICAgICB0aGlzLm1vdG9ySW1wdWxzZTEgPSB0aGlzLm1heE1vdG9ySW1wdWxzZTE7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5tb3RvckltcHVsc2UxIDwgLXRoaXMubWF4TW90b3JJbXB1bHNlMSkge1xuICAgICAgICAgIHRoaXMubW90b3JJbXB1bHNlMSA9IC10aGlzLm1heE1vdG9ySW1wdWxzZTE7XG4gICAgICAgIH1cbiAgICAgICAgZE1vdG9ySW1wdWxzZTEgPSB0aGlzLm1vdG9ySW1wdWxzZTEgLSBvbGRNb3RvckltcHVsc2UxO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuZW5hYmxlTW90b3IyKSB7XG4gICAgICAgIGRNb3RvckltcHVsc2UyID0gKHJ2bjIgLSB0aGlzLm1vdG9yU3BlZWQyKSAqIHRoaXMuZHYxMTtcbiAgICAgICAgdGhpcy5tb3RvckltcHVsc2UyICs9IGRNb3RvckltcHVsc2UyO1xuICAgICAgICBpZiAodGhpcy5tb3RvckltcHVsc2UyID4gdGhpcy5tYXhNb3RvckltcHVsc2UyKSB7IC8vIGNsYW1wIG1vdG9yIGltcHVsc2VcbiAgICAgICAgICB0aGlzLm1vdG9ySW1wdWxzZTIgPSB0aGlzLm1heE1vdG9ySW1wdWxzZTI7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5tb3RvckltcHVsc2UyIDwgLXRoaXMubWF4TW90b3JJbXB1bHNlMikge1xuICAgICAgICAgIHRoaXMubW90b3JJbXB1bHNlMiA9IC10aGlzLm1heE1vdG9ySW1wdWxzZTI7XG4gICAgICAgIH1cbiAgICAgICAgZE1vdG9ySW1wdWxzZTIgPSB0aGlzLm1vdG9ySW1wdWxzZTIgLSBvbGRNb3RvckltcHVsc2UyO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuZW5hYmxlTW90b3IzKSB7XG4gICAgICAgIGRNb3RvckltcHVsc2UzID0gKHJ2bjMgLSB0aGlzLm1vdG9yU3BlZWQzKSAqIHRoaXMuZHYyMjtcbiAgICAgICAgdGhpcy5tb3RvckltcHVsc2UzICs9IGRNb3RvckltcHVsc2UzO1xuICAgICAgICBpZiAodGhpcy5tb3RvckltcHVsc2UzID4gdGhpcy5tYXhNb3RvckltcHVsc2UzKSB7IC8vIGNsYW1wIG1vdG9yIGltcHVsc2VcbiAgICAgICAgICB0aGlzLm1vdG9ySW1wdWxzZTMgPSB0aGlzLm1heE1vdG9ySW1wdWxzZTM7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5tb3RvckltcHVsc2UzIDwgLXRoaXMubWF4TW90b3JJbXB1bHNlMykge1xuICAgICAgICAgIHRoaXMubW90b3JJbXB1bHNlMyA9IC10aGlzLm1heE1vdG9ySW1wdWxzZTM7XG4gICAgICAgIH1cbiAgICAgICAgZE1vdG9ySW1wdWxzZTMgPSB0aGlzLm1vdG9ySW1wdWxzZTMgLSBvbGRNb3RvckltcHVsc2UzO1xuICAgICAgfVxuXG4gICAgICAvLyBhcHBseSBtb3RvciBpbXB1bHNlIHRvIHJlbGF0aXZlIHZlbG9jaXR5XG4gICAgICBydm4xICs9IGRNb3RvckltcHVsc2UxICogdGhpcy5rdjAwICsgZE1vdG9ySW1wdWxzZTIgKiB0aGlzLmswMSArIGRNb3RvckltcHVsc2UzICogdGhpcy5rMDI7XG4gICAgICBydm4yICs9IGRNb3RvckltcHVsc2UxICogdGhpcy5rMTAgKyBkTW90b3JJbXB1bHNlMiAqIHRoaXMua3YxMSArIGRNb3RvckltcHVsc2UzICogdGhpcy5rMTI7XG4gICAgICBydm4zICs9IGRNb3RvckltcHVsc2UxICogdGhpcy5rMjAgKyBkTW90b3JJbXB1bHNlMiAqIHRoaXMuazIxICsgZE1vdG9ySW1wdWxzZTMgKiB0aGlzLmt2MjI7XG5cbiAgICAgIC8vIHN1YnRyYWN0IHRhcmdldCB2ZWxvY2l0eSBhbmQgYXBwbGllZCBpbXB1bHNlXG4gICAgICBydm4xIC09IHRoaXMubGltaXRWZWxvY2l0eTEgKyB0aGlzLmxpbWl0SW1wdWxzZTEgKiB0aGlzLmNmbTE7XG4gICAgICBydm4yIC09IHRoaXMubGltaXRWZWxvY2l0eTIgKyB0aGlzLmxpbWl0SW1wdWxzZTIgKiB0aGlzLmNmbTI7XG4gICAgICBydm4zIC09IHRoaXMubGltaXRWZWxvY2l0eTMgKyB0aGlzLmxpbWl0SW1wdWxzZTMgKiB0aGlzLmNmbTM7XG5cbiAgICAgIHZhciBvbGRMaW1pdEltcHVsc2UxID0gdGhpcy5saW1pdEltcHVsc2UxO1xuICAgICAgdmFyIG9sZExpbWl0SW1wdWxzZTIgPSB0aGlzLmxpbWl0SW1wdWxzZTI7XG4gICAgICB2YXIgb2xkTGltaXRJbXB1bHNlMyA9IHRoaXMubGltaXRJbXB1bHNlMztcblxuICAgICAgdmFyIGRMaW1pdEltcHVsc2UxID0gcnZuMSAqIHRoaXMuZDAwICsgcnZuMiAqIHRoaXMuZDAxICsgcnZuMyAqIHRoaXMuZDAyO1xuICAgICAgdmFyIGRMaW1pdEltcHVsc2UyID0gcnZuMSAqIHRoaXMuZDEwICsgcnZuMiAqIHRoaXMuZDExICsgcnZuMyAqIHRoaXMuZDEyO1xuICAgICAgdmFyIGRMaW1pdEltcHVsc2UzID0gcnZuMSAqIHRoaXMuZDIwICsgcnZuMiAqIHRoaXMuZDIxICsgcnZuMyAqIHRoaXMuZDIyO1xuXG4gICAgICB0aGlzLmxpbWl0SW1wdWxzZTEgKz0gZExpbWl0SW1wdWxzZTE7XG4gICAgICB0aGlzLmxpbWl0SW1wdWxzZTIgKz0gZExpbWl0SW1wdWxzZTI7XG4gICAgICB0aGlzLmxpbWl0SW1wdWxzZTMgKz0gZExpbWl0SW1wdWxzZTM7XG5cbiAgICAgIC8vIGNsYW1wXG4gICAgICB2YXIgY2xhbXBTdGF0ZSA9IDA7XG4gICAgICBpZiAodGhpcy5saW1pdFN0YXRlMSA9PSAyIHx8IHRoaXMubGltaXRJbXB1bHNlMSAqIHRoaXMubGltaXRTdGF0ZTEgPCAwKSB7XG4gICAgICAgIGRMaW1pdEltcHVsc2UxID0gLW9sZExpbWl0SW1wdWxzZTE7XG4gICAgICAgIHJ2bjIgKz0gZExpbWl0SW1wdWxzZTEgKiB0aGlzLmsxMDtcbiAgICAgICAgcnZuMyArPSBkTGltaXRJbXB1bHNlMSAqIHRoaXMuazIwO1xuICAgICAgICBjbGFtcFN0YXRlIHw9IDE7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5saW1pdFN0YXRlMiA9PSAyIHx8IHRoaXMubGltaXRJbXB1bHNlMiAqIHRoaXMubGltaXRTdGF0ZTIgPCAwKSB7XG4gICAgICAgIGRMaW1pdEltcHVsc2UyID0gLW9sZExpbWl0SW1wdWxzZTI7XG4gICAgICAgIHJ2bjEgKz0gZExpbWl0SW1wdWxzZTIgKiB0aGlzLmswMTtcbiAgICAgICAgcnZuMyArPSBkTGltaXRJbXB1bHNlMiAqIHRoaXMuazIxO1xuICAgICAgICBjbGFtcFN0YXRlIHw9IDI7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5saW1pdFN0YXRlMyA9PSAyIHx8IHRoaXMubGltaXRJbXB1bHNlMyAqIHRoaXMubGltaXRTdGF0ZTMgPCAwKSB7XG4gICAgICAgIGRMaW1pdEltcHVsc2UzID0gLW9sZExpbWl0SW1wdWxzZTM7XG4gICAgICAgIHJ2bjEgKz0gZExpbWl0SW1wdWxzZTMgKiB0aGlzLmswMjtcbiAgICAgICAgcnZuMiArPSBkTGltaXRJbXB1bHNlMyAqIHRoaXMuazEyO1xuICAgICAgICBjbGFtcFN0YXRlIHw9IDQ7XG4gICAgICB9XG5cbiAgICAgIC8vIHVwZGF0ZSB1bi1jbGFtcGVkIGltcHVsc2VcbiAgICAgIC8vIFRPRE86IGlzb2xhdGUgZGl2aXNpb25cbiAgICAgIHZhciBkZXQ7XG4gICAgICBzd2l0Y2ggKGNsYW1wU3RhdGUpIHtcbiAgICAgICAgY2FzZSAxOi8vIHVwZGF0ZSAyIDNcbiAgICAgICAgICBkZXQgPSAxIC8gKHRoaXMuazExICogdGhpcy5rMjIgLSB0aGlzLmsxMiAqIHRoaXMuazIxKTtcbiAgICAgICAgICBkTGltaXRJbXB1bHNlMiA9ICh0aGlzLmsyMiAqIHJ2bjIgKyAtdGhpcy5rMTIgKiBydm4zKSAqIGRldDtcbiAgICAgICAgICBkTGltaXRJbXB1bHNlMyA9ICgtdGhpcy5rMjEgKiBydm4yICsgdGhpcy5rMTEgKiBydm4zKSAqIGRldDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAyOi8vIHVwZGF0ZSAxIDNcbiAgICAgICAgICBkZXQgPSAxIC8gKHRoaXMuazAwICogdGhpcy5rMjIgLSB0aGlzLmswMiAqIHRoaXMuazIwKTtcbiAgICAgICAgICBkTGltaXRJbXB1bHNlMSA9ICh0aGlzLmsyMiAqIHJ2bjEgKyAtdGhpcy5rMDIgKiBydm4zKSAqIGRldDtcbiAgICAgICAgICBkTGltaXRJbXB1bHNlMyA9ICgtdGhpcy5rMjAgKiBydm4xICsgdGhpcy5rMDAgKiBydm4zKSAqIGRldDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAzOi8vIHVwZGF0ZSAzXG4gICAgICAgICAgZExpbWl0SW1wdWxzZTMgPSBydm4zIC8gdGhpcy5rMjI7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNDovLyB1cGRhdGUgMSAyXG4gICAgICAgICAgZGV0ID0gMSAvICh0aGlzLmswMCAqIHRoaXMuazExIC0gdGhpcy5rMDEgKiB0aGlzLmsxMCk7XG4gICAgICAgICAgZExpbWl0SW1wdWxzZTEgPSAodGhpcy5rMTEgKiBydm4xICsgLXRoaXMuazAxICogcnZuMikgKiBkZXQ7XG4gICAgICAgICAgZExpbWl0SW1wdWxzZTIgPSAoLXRoaXMuazEwICogcnZuMSArIHRoaXMuazAwICogcnZuMikgKiBkZXQ7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNTovLyB1cGRhdGUgMlxuICAgICAgICAgIGRMaW1pdEltcHVsc2UyID0gcnZuMiAvIHRoaXMuazExO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDY6Ly8gdXBkYXRlIDFcbiAgICAgICAgICBkTGltaXRJbXB1bHNlMSA9IHJ2bjEgLyB0aGlzLmswMDtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgdGhpcy5saW1pdEltcHVsc2UxID0gb2xkTGltaXRJbXB1bHNlMSArIGRMaW1pdEltcHVsc2UxO1xuICAgICAgdGhpcy5saW1pdEltcHVsc2UyID0gb2xkTGltaXRJbXB1bHNlMiArIGRMaW1pdEltcHVsc2UyO1xuICAgICAgdGhpcy5saW1pdEltcHVsc2UzID0gb2xkTGltaXRJbXB1bHNlMyArIGRMaW1pdEltcHVsc2UzO1xuXG4gICAgICB2YXIgZEltcHVsc2UxID0gZE1vdG9ySW1wdWxzZTEgKyBkTGltaXRJbXB1bHNlMTtcbiAgICAgIHZhciBkSW1wdWxzZTIgPSBkTW90b3JJbXB1bHNlMiArIGRMaW1pdEltcHVsc2UyO1xuICAgICAgdmFyIGRJbXB1bHNlMyA9IGRNb3RvckltcHVsc2UzICsgZExpbWl0SW1wdWxzZTM7XG5cbiAgICAgIC8vIGFwcGx5IGltcHVsc2VcbiAgICAgIHRoaXMubDEueCArPSBkSW1wdWxzZTEgKiB0aGlzLmwxeDEgKyBkSW1wdWxzZTIgKiB0aGlzLmwxeDIgKyBkSW1wdWxzZTMgKiB0aGlzLmwxeDM7XG4gICAgICB0aGlzLmwxLnkgKz0gZEltcHVsc2UxICogdGhpcy5sMXkxICsgZEltcHVsc2UyICogdGhpcy5sMXkyICsgZEltcHVsc2UzICogdGhpcy5sMXkzO1xuICAgICAgdGhpcy5sMS56ICs9IGRJbXB1bHNlMSAqIHRoaXMubDF6MSArIGRJbXB1bHNlMiAqIHRoaXMubDF6MiArIGRJbXB1bHNlMyAqIHRoaXMubDF6MztcbiAgICAgIHRoaXMuYTEueCArPSBkSW1wdWxzZTEgKiB0aGlzLmExeDEgKyBkSW1wdWxzZTIgKiB0aGlzLmExeDIgKyBkSW1wdWxzZTMgKiB0aGlzLmExeDM7XG4gICAgICB0aGlzLmExLnkgKz0gZEltcHVsc2UxICogdGhpcy5hMXkxICsgZEltcHVsc2UyICogdGhpcy5hMXkyICsgZEltcHVsc2UzICogdGhpcy5hMXkzO1xuICAgICAgdGhpcy5hMS56ICs9IGRJbXB1bHNlMSAqIHRoaXMuYTF6MSArIGRJbXB1bHNlMiAqIHRoaXMuYTF6MiArIGRJbXB1bHNlMyAqIHRoaXMuYTF6MztcbiAgICAgIHRoaXMubDIueCAtPSBkSW1wdWxzZTEgKiB0aGlzLmwyeDEgKyBkSW1wdWxzZTIgKiB0aGlzLmwyeDIgKyBkSW1wdWxzZTMgKiB0aGlzLmwyeDM7XG4gICAgICB0aGlzLmwyLnkgLT0gZEltcHVsc2UxICogdGhpcy5sMnkxICsgZEltcHVsc2UyICogdGhpcy5sMnkyICsgZEltcHVsc2UzICogdGhpcy5sMnkzO1xuICAgICAgdGhpcy5sMi56IC09IGRJbXB1bHNlMSAqIHRoaXMubDJ6MSArIGRJbXB1bHNlMiAqIHRoaXMubDJ6MiArIGRJbXB1bHNlMyAqIHRoaXMubDJ6MztcbiAgICAgIHRoaXMuYTIueCAtPSBkSW1wdWxzZTEgKiB0aGlzLmEyeDEgKyBkSW1wdWxzZTIgKiB0aGlzLmEyeDIgKyBkSW1wdWxzZTMgKiB0aGlzLmEyeDM7XG4gICAgICB0aGlzLmEyLnkgLT0gZEltcHVsc2UxICogdGhpcy5hMnkxICsgZEltcHVsc2UyICogdGhpcy5hMnkyICsgZEltcHVsc2UzICogdGhpcy5hMnkzO1xuICAgICAgdGhpcy5hMi56IC09IGRJbXB1bHNlMSAqIHRoaXMuYTJ6MSArIGRJbXB1bHNlMiAqIHRoaXMuYTJ6MiArIGRJbXB1bHNlMyAqIHRoaXMuYTJ6MztcbiAgICB9XG5cbiAgfSk7XG5cbiAgLyoqXG4gICAqIEEgcHJpc21hdGljIGpvaW50IGFsbG93cyBvbmx5IGZvciByZWxhdGl2ZSB0cmFuc2xhdGlvbiBvZiByaWdpZCBib2RpZXMgYWxvbmcgdGhlIGF4aXMuXG4gICAqXG4gICAqIEBhdXRob3Igc2FoYXJhblxuICAgKiBAYXV0aG9yIGxvLXRoXG4gICAqL1xuXG4gIGZ1bmN0aW9uIFByaXNtYXRpY0pvaW50KGNvbmZpZywgbG93ZXJUcmFuc2xhdGlvbiwgdXBwZXJUcmFuc2xhdGlvbikge1xuXG4gICAgSm9pbnQuY2FsbCh0aGlzLCBjb25maWcpO1xuXG4gICAgdGhpcy50eXBlID0gSk9JTlRfUFJJU01BVElDO1xuXG4gICAgLy8gVGhlIGF4aXMgaW4gdGhlIGZpcnN0IGJvZHkncyBjb29yZGluYXRlIHN5c3RlbS5cbiAgICB0aGlzLmxvY2FsQXhpczEgPSBjb25maWcubG9jYWxBeGlzMS5jbG9uZSgpLm5vcm1hbGl6ZSgpO1xuICAgIC8vIFRoZSBheGlzIGluIHRoZSBzZWNvbmQgYm9keSdzIGNvb3JkaW5hdGUgc3lzdGVtLlxuICAgIHRoaXMubG9jYWxBeGlzMiA9IGNvbmZpZy5sb2NhbEF4aXMyLmNsb25lKCkubm9ybWFsaXplKCk7XG5cbiAgICB0aGlzLmF4MSA9IG5ldyBWZWMzKCk7XG4gICAgdGhpcy5heDIgPSBuZXcgVmVjMygpO1xuXG4gICAgdGhpcy5ub3IgPSBuZXcgVmVjMygpO1xuICAgIHRoaXMudGFuID0gbmV3IFZlYzMoKTtcbiAgICB0aGlzLmJpbiA9IG5ldyBWZWMzKCk7XG5cbiAgICB0aGlzLmFjID0gbmV3IEFuZ3VsYXJDb25zdHJhaW50KHRoaXMsIG5ldyBRdWF0KCkuc2V0RnJvbVVuaXRWZWN0b3JzKHRoaXMubG9jYWxBeGlzMSwgdGhpcy5sb2NhbEF4aXMyKSk7XG5cbiAgICAvLyBUaGUgdHJhbnNsYXRpb25hbCBsaW1pdCBhbmQgbW90b3IgaW5mb3JtYXRpb24gb2YgdGhlIGpvaW50LlxuICAgIHRoaXMubGltaXRNb3RvciA9IG5ldyBMaW1pdE1vdG9yKHRoaXMubm9yLCB0cnVlKTtcbiAgICB0aGlzLmxpbWl0TW90b3IubG93ZXJMaW1pdCA9IGxvd2VyVHJhbnNsYXRpb247XG4gICAgdGhpcy5saW1pdE1vdG9yLnVwcGVyTGltaXQgPSB1cHBlclRyYW5zbGF0aW9uO1xuICAgIHRoaXMudDMgPSBuZXcgVHJhbnNsYXRpb25hbDNDb25zdHJhaW50KHRoaXMsIHRoaXMubGltaXRNb3RvciwgbmV3IExpbWl0TW90b3IodGhpcy50YW4sIHRydWUpLCBuZXcgTGltaXRNb3Rvcih0aGlzLmJpbiwgdHJ1ZSkpO1xuXG4gIH1cbiAgUHJpc21hdGljSm9pbnQucHJvdG90eXBlID0gT2JqZWN0LmFzc2lnbihPYmplY3QuY3JlYXRlKEpvaW50LnByb3RvdHlwZSksIHtcblxuICAgIGNvbnN0cnVjdG9yOiBQcmlzbWF0aWNKb2ludCxcblxuICAgIHByZVNvbHZlOiBmdW5jdGlvbiAodGltZVN0ZXAsIGludlRpbWVTdGVwKSB7XG5cbiAgICAgIHRoaXMudXBkYXRlQW5jaG9yUG9pbnRzKCk7XG5cbiAgICAgIHRoaXMuYXgxLmNvcHkodGhpcy5sb2NhbEF4aXMxKS5hcHBseU1hdHJpeDModGhpcy5ib2R5MS5yb3RhdGlvbiwgdHJ1ZSk7XG4gICAgICB0aGlzLmF4Mi5jb3B5KHRoaXMubG9jYWxBeGlzMikuYXBwbHlNYXRyaXgzKHRoaXMuYm9keTIucm90YXRpb24sIHRydWUpO1xuXG4gICAgICAvLyBub3JtYWwgdGFuZ2VudCBiaW5vcm1hbFxuXG4gICAgICB0aGlzLm5vci5zZXQoXG4gICAgICAgIHRoaXMuYXgxLnggKiB0aGlzLmJvZHkyLmludmVyc2VNYXNzICsgdGhpcy5heDIueCAqIHRoaXMuYm9keTEuaW52ZXJzZU1hc3MsXG4gICAgICAgIHRoaXMuYXgxLnkgKiB0aGlzLmJvZHkyLmludmVyc2VNYXNzICsgdGhpcy5heDIueSAqIHRoaXMuYm9keTEuaW52ZXJzZU1hc3MsXG4gICAgICAgIHRoaXMuYXgxLnogKiB0aGlzLmJvZHkyLmludmVyc2VNYXNzICsgdGhpcy5heDIueiAqIHRoaXMuYm9keTEuaW52ZXJzZU1hc3NcbiAgICAgICkubm9ybWFsaXplKCk7XG4gICAgICB0aGlzLnRhbi50YW5nZW50KHRoaXMubm9yKS5ub3JtYWxpemUoKTtcbiAgICAgIHRoaXMuYmluLmNyb3NzVmVjdG9ycyh0aGlzLm5vciwgdGhpcy50YW4pO1xuXG4gICAgICAvLyBwcmVTb2x2ZVxuXG4gICAgICB0aGlzLmFjLnByZVNvbHZlKHRpbWVTdGVwLCBpbnZUaW1lU3RlcCk7XG4gICAgICB0aGlzLnQzLnByZVNvbHZlKHRpbWVTdGVwLCBpbnZUaW1lU3RlcCk7XG5cbiAgICB9LFxuXG4gICAgc29sdmU6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgdGhpcy5hYy5zb2x2ZSgpO1xuICAgICAgdGhpcy50My5zb2x2ZSgpO1xuXG4gICAgfSxcblxuICAgIHBvc3RTb2x2ZTogZnVuY3Rpb24gKCkge1xuXG4gICAgfVxuXG4gIH0pO1xuXG4gIC8qKlxuICAgKiBBIHNsaWRlciBqb2ludCBhbGxvd3MgZm9yIHJlbGF0aXZlIHRyYW5zbGF0aW9uIGFuZCByZWxhdGl2ZSByb3RhdGlvbiBiZXR3ZWVuIHR3byByaWdpZCBib2RpZXMgYWxvbmcgdGhlIGF4aXMuXG4gICAqXG4gICAqIEBhdXRob3Igc2FoYXJhblxuICAgKiBAYXV0aG9yIGxvLXRoXG4gICAqL1xuXG4gIGZ1bmN0aW9uIFNsaWRlckpvaW50KGNvbmZpZywgbG93ZXJUcmFuc2xhdGlvbiwgdXBwZXJUcmFuc2xhdGlvbikge1xuXG4gICAgSm9pbnQuY2FsbCh0aGlzLCBjb25maWcpO1xuXG4gICAgdGhpcy50eXBlID0gSk9JTlRfU0xJREVSO1xuXG4gICAgLy8gVGhlIGF4aXMgaW4gdGhlIGZpcnN0IGJvZHkncyBjb29yZGluYXRlIHN5c3RlbS5cbiAgICB0aGlzLmxvY2FsQXhpczEgPSBjb25maWcubG9jYWxBeGlzMS5jbG9uZSgpLm5vcm1hbGl6ZSgpO1xuICAgIC8vIFRoZSBheGlzIGluIHRoZSBzZWNvbmQgYm9keSdzIGNvb3JkaW5hdGUgc3lzdGVtLlxuICAgIHRoaXMubG9jYWxBeGlzMiA9IGNvbmZpZy5sb2NhbEF4aXMyLmNsb25lKCkubm9ybWFsaXplKCk7XG5cbiAgICAvLyBtYWtlIGFuZ2xlIGF4aXNcbiAgICB2YXIgYXJjID0gbmV3IE1hdDMzKCkuc2V0UXVhdChuZXcgUXVhdCgpLnNldEZyb21Vbml0VmVjdG9ycyh0aGlzLmxvY2FsQXhpczEsIHRoaXMubG9jYWxBeGlzMikpO1xuICAgIHRoaXMubG9jYWxBbmdsZTEgPSBuZXcgVmVjMygpLnRhbmdlbnQodGhpcy5sb2NhbEF4aXMxKS5ub3JtYWxpemUoKTtcbiAgICB0aGlzLmxvY2FsQW5nbGUyID0gdGhpcy5sb2NhbEFuZ2xlMS5jbG9uZSgpLmFwcGx5TWF0cml4MyhhcmMsIHRydWUpO1xuXG4gICAgdGhpcy5heDEgPSBuZXcgVmVjMygpO1xuICAgIHRoaXMuYXgyID0gbmV3IFZlYzMoKTtcbiAgICB0aGlzLmFuMSA9IG5ldyBWZWMzKCk7XG4gICAgdGhpcy5hbjIgPSBuZXcgVmVjMygpO1xuXG4gICAgdGhpcy50bXAgPSBuZXcgVmVjMygpO1xuXG4gICAgdGhpcy5ub3IgPSBuZXcgVmVjMygpO1xuICAgIHRoaXMudGFuID0gbmV3IFZlYzMoKTtcbiAgICB0aGlzLmJpbiA9IG5ldyBWZWMzKCk7XG5cbiAgICAvLyBUaGUgbGltaXQgYW5kIG1vdG9yIGZvciB0aGUgcm90YXRpb25cbiAgICB0aGlzLnJvdGF0aW9uYWxMaW1pdE1vdG9yID0gbmV3IExpbWl0TW90b3IodGhpcy5ub3IsIGZhbHNlKTtcbiAgICB0aGlzLnIzID0gbmV3IFJvdGF0aW9uYWwzQ29uc3RyYWludCh0aGlzLCB0aGlzLnJvdGF0aW9uYWxMaW1pdE1vdG9yLCBuZXcgTGltaXRNb3Rvcih0aGlzLnRhbiwgdHJ1ZSksIG5ldyBMaW1pdE1vdG9yKHRoaXMuYmluLCB0cnVlKSk7XG5cbiAgICAvLyBUaGUgbGltaXQgYW5kIG1vdG9yIGZvciB0aGUgdHJhbnNsYXRpb24uXG4gICAgdGhpcy50cmFuc2xhdGlvbmFsTGltaXRNb3RvciA9IG5ldyBMaW1pdE1vdG9yKHRoaXMubm9yLCB0cnVlKTtcbiAgICB0aGlzLnRyYW5zbGF0aW9uYWxMaW1pdE1vdG9yLmxvd2VyTGltaXQgPSBsb3dlclRyYW5zbGF0aW9uO1xuICAgIHRoaXMudHJhbnNsYXRpb25hbExpbWl0TW90b3IudXBwZXJMaW1pdCA9IHVwcGVyVHJhbnNsYXRpb247XG4gICAgdGhpcy50MyA9IG5ldyBUcmFuc2xhdGlvbmFsM0NvbnN0cmFpbnQodGhpcywgdGhpcy50cmFuc2xhdGlvbmFsTGltaXRNb3RvciwgbmV3IExpbWl0TW90b3IodGhpcy50YW4sIHRydWUpLCBuZXcgTGltaXRNb3Rvcih0aGlzLmJpbiwgdHJ1ZSkpO1xuXG4gIH1cbiAgU2xpZGVySm9pbnQucHJvdG90eXBlID0gT2JqZWN0LmFzc2lnbihPYmplY3QuY3JlYXRlKEpvaW50LnByb3RvdHlwZSksIHtcblxuICAgIGNvbnN0cnVjdG9yOiBTbGlkZXJKb2ludCxcblxuICAgIHByZVNvbHZlOiBmdW5jdGlvbiAodGltZVN0ZXAsIGludlRpbWVTdGVwKSB7XG5cbiAgICAgIHRoaXMudXBkYXRlQW5jaG9yUG9pbnRzKCk7XG5cbiAgICAgIHRoaXMuYXgxLmNvcHkodGhpcy5sb2NhbEF4aXMxKS5hcHBseU1hdHJpeDModGhpcy5ib2R5MS5yb3RhdGlvbiwgdHJ1ZSk7XG4gICAgICB0aGlzLmFuMS5jb3B5KHRoaXMubG9jYWxBbmdsZTEpLmFwcGx5TWF0cml4Myh0aGlzLmJvZHkxLnJvdGF0aW9uLCB0cnVlKTtcblxuICAgICAgdGhpcy5heDIuY29weSh0aGlzLmxvY2FsQXhpczIpLmFwcGx5TWF0cml4Myh0aGlzLmJvZHkyLnJvdGF0aW9uLCB0cnVlKTtcbiAgICAgIHRoaXMuYW4yLmNvcHkodGhpcy5sb2NhbEFuZ2xlMikuYXBwbHlNYXRyaXgzKHRoaXMuYm9keTIucm90YXRpb24sIHRydWUpO1xuXG4gICAgICAvLyBub3JtYWwgdGFuZ2VudCBiaW5vcm1hbFxuXG4gICAgICB0aGlzLm5vci5zZXQoXG4gICAgICAgIHRoaXMuYXgxLnggKiB0aGlzLmJvZHkyLmludmVyc2VNYXNzICsgdGhpcy5heDIueCAqIHRoaXMuYm9keTEuaW52ZXJzZU1hc3MsXG4gICAgICAgIHRoaXMuYXgxLnkgKiB0aGlzLmJvZHkyLmludmVyc2VNYXNzICsgdGhpcy5heDIueSAqIHRoaXMuYm9keTEuaW52ZXJzZU1hc3MsXG4gICAgICAgIHRoaXMuYXgxLnogKiB0aGlzLmJvZHkyLmludmVyc2VNYXNzICsgdGhpcy5heDIueiAqIHRoaXMuYm9keTEuaW52ZXJzZU1hc3NcbiAgICAgICkubm9ybWFsaXplKCk7XG4gICAgICB0aGlzLnRhbi50YW5nZW50KHRoaXMubm9yKS5ub3JtYWxpemUoKTtcbiAgICAgIHRoaXMuYmluLmNyb3NzVmVjdG9ycyh0aGlzLm5vciwgdGhpcy50YW4pO1xuXG4gICAgICAvLyBjYWxjdWxhdGUgaGluZ2UgYW5nbGVcblxuICAgICAgdGhpcy50bXAuY3Jvc3NWZWN0b3JzKHRoaXMuYW4xLCB0aGlzLmFuMik7XG5cbiAgICAgIHZhciBsaW1pdGUgPSBfTWF0aC5hY29zQ2xhbXAoX01hdGguZG90VmVjdG9ycyh0aGlzLmFuMSwgdGhpcy5hbjIpKTtcblxuICAgICAgaWYgKF9NYXRoLmRvdFZlY3RvcnModGhpcy5ub3IsIHRoaXMudG1wKSA8IDApIHRoaXMucm90YXRpb25hbExpbWl0TW90b3IuYW5nbGUgPSAtbGltaXRlO1xuICAgICAgZWxzZSB0aGlzLnJvdGF0aW9uYWxMaW1pdE1vdG9yLmFuZ2xlID0gbGltaXRlO1xuXG4gICAgICAvLyBhbmd1bGFyIGVycm9yXG5cbiAgICAgIHRoaXMudG1wLmNyb3NzVmVjdG9ycyh0aGlzLmF4MSwgdGhpcy5heDIpO1xuICAgICAgdGhpcy5yMy5saW1pdE1vdG9yMi5hbmdsZSA9IF9NYXRoLmRvdFZlY3RvcnModGhpcy50YW4sIHRoaXMudG1wKTtcbiAgICAgIHRoaXMucjMubGltaXRNb3RvcjMuYW5nbGUgPSBfTWF0aC5kb3RWZWN0b3JzKHRoaXMuYmluLCB0aGlzLnRtcCk7XG5cbiAgICAgIC8vIHByZVNvbHZlXG5cbiAgICAgIHRoaXMucjMucHJlU29sdmUodGltZVN0ZXAsIGludlRpbWVTdGVwKTtcbiAgICAgIHRoaXMudDMucHJlU29sdmUodGltZVN0ZXAsIGludlRpbWVTdGVwKTtcblxuICAgIH0sXG5cbiAgICBzb2x2ZTogZnVuY3Rpb24gKCkge1xuXG4gICAgICB0aGlzLnIzLnNvbHZlKCk7XG4gICAgICB0aGlzLnQzLnNvbHZlKCk7XG5cbiAgICB9LFxuXG4gICAgcG9zdFNvbHZlOiBmdW5jdGlvbiAoKSB7XG5cbiAgICB9XG5cbiAgfSk7XG5cbiAgLyoqXG4gICAqIEEgd2hlZWwgam9pbnQgYWxsb3dzIGZvciByZWxhdGl2ZSByb3RhdGlvbiBiZXR3ZWVuIHR3byByaWdpZCBib2RpZXMgYWxvbmcgdHdvIGF4ZXMuXG4gICAqIFRoZSB3aGVlbCBqb2ludCBhbHNvIGFsbG93cyBmb3IgcmVsYXRpdmUgdHJhbnNsYXRpb24gZm9yIHRoZSBzdXNwZW5zaW9uLlxuICAgKlxuICAgKiBAYXV0aG9yIHNhaGFyYW5cbiAgICogQGF1dGhvciBsby10aFxuICAgKi9cblxuICBmdW5jdGlvbiBXaGVlbEpvaW50KGNvbmZpZykge1xuXG4gICAgSm9pbnQuY2FsbCh0aGlzLCBjb25maWcpO1xuXG4gICAgdGhpcy50eXBlID0gSk9JTlRfV0hFRUw7XG5cbiAgICAvLyBUaGUgYXhpcyBpbiB0aGUgZmlyc3QgYm9keSdzIGNvb3JkaW5hdGUgc3lzdGVtLlxuICAgIHRoaXMubG9jYWxBeGlzMSA9IGNvbmZpZy5sb2NhbEF4aXMxLmNsb25lKCkubm9ybWFsaXplKCk7XG4gICAgLy8gVGhlIGF4aXMgaW4gdGhlIHNlY29uZCBib2R5J3MgY29vcmRpbmF0ZSBzeXN0ZW0uXG4gICAgdGhpcy5sb2NhbEF4aXMyID0gY29uZmlnLmxvY2FsQXhpczIuY2xvbmUoKS5ub3JtYWxpemUoKTtcblxuICAgIHRoaXMubG9jYWxBbmdsZTEgPSBuZXcgVmVjMygpO1xuICAgIHRoaXMubG9jYWxBbmdsZTIgPSBuZXcgVmVjMygpO1xuXG4gICAgdmFyIGRvdCA9IF9NYXRoLmRvdFZlY3RvcnModGhpcy5sb2NhbEF4aXMxLCB0aGlzLmxvY2FsQXhpczIpO1xuXG4gICAgaWYgKGRvdCA+IC0xICYmIGRvdCA8IDEpIHtcblxuICAgICAgdGhpcy5sb2NhbEFuZ2xlMS5zZXQoXG4gICAgICAgIHRoaXMubG9jYWxBeGlzMi54IC0gZG90ICogdGhpcy5sb2NhbEF4aXMxLngsXG4gICAgICAgIHRoaXMubG9jYWxBeGlzMi55IC0gZG90ICogdGhpcy5sb2NhbEF4aXMxLnksXG4gICAgICAgIHRoaXMubG9jYWxBeGlzMi56IC0gZG90ICogdGhpcy5sb2NhbEF4aXMxLnpcbiAgICAgICkubm9ybWFsaXplKCk7XG5cbiAgICAgIHRoaXMubG9jYWxBbmdsZTIuc2V0KFxuICAgICAgICB0aGlzLmxvY2FsQXhpczEueCAtIGRvdCAqIHRoaXMubG9jYWxBeGlzMi54LFxuICAgICAgICB0aGlzLmxvY2FsQXhpczEueSAtIGRvdCAqIHRoaXMubG9jYWxBeGlzMi55LFxuICAgICAgICB0aGlzLmxvY2FsQXhpczEueiAtIGRvdCAqIHRoaXMubG9jYWxBeGlzMi56XG4gICAgICApLm5vcm1hbGl6ZSgpO1xuXG4gICAgfSBlbHNlIHtcblxuICAgICAgdmFyIGFyYyA9IG5ldyBNYXQzMygpLnNldFF1YXQobmV3IFF1YXQoKS5zZXRGcm9tVW5pdFZlY3RvcnModGhpcy5sb2NhbEF4aXMxLCB0aGlzLmxvY2FsQXhpczIpKTtcbiAgICAgIHRoaXMubG9jYWxBbmdsZTEudGFuZ2VudCh0aGlzLmxvY2FsQXhpczEpLm5vcm1hbGl6ZSgpO1xuICAgICAgdGhpcy5sb2NhbEFuZ2xlMiA9IHRoaXMubG9jYWxBbmdsZTEuY2xvbmUoKS5hcHBseU1hdHJpeDMoYXJjLCB0cnVlKTtcblxuICAgIH1cblxuICAgIHRoaXMuYXgxID0gbmV3IFZlYzMoKTtcbiAgICB0aGlzLmF4MiA9IG5ldyBWZWMzKCk7XG4gICAgdGhpcy5hbjEgPSBuZXcgVmVjMygpO1xuICAgIHRoaXMuYW4yID0gbmV3IFZlYzMoKTtcblxuICAgIHRoaXMudG1wID0gbmV3IFZlYzMoKTtcblxuICAgIHRoaXMubm9yID0gbmV3IFZlYzMoKTtcbiAgICB0aGlzLnRhbiA9IG5ldyBWZWMzKCk7XG4gICAgdGhpcy5iaW4gPSBuZXcgVmVjMygpO1xuXG4gICAgLy8gVGhlIHRyYW5zbGF0aW9uYWwgbGltaXQgYW5kIG1vdG9yIGluZm9ybWF0aW9uIG9mIHRoZSBqb2ludC5cbiAgICB0aGlzLnRyYW5zbGF0aW9uYWxMaW1pdE1vdG9yID0gbmV3IExpbWl0TW90b3IodGhpcy50YW4sIHRydWUpO1xuICAgIHRoaXMudHJhbnNsYXRpb25hbExpbWl0TW90b3IuZnJlcXVlbmN5ID0gODtcbiAgICB0aGlzLnRyYW5zbGF0aW9uYWxMaW1pdE1vdG9yLmRhbXBpbmdSYXRpbyA9IDE7XG4gICAgLy8gVGhlIGZpcnN0IHJvdGF0aW9uYWwgbGltaXQgYW5kIG1vdG9yIGluZm9ybWF0aW9uIG9mIHRoZSBqb2ludC5cbiAgICB0aGlzLnJvdGF0aW9uYWxMaW1pdE1vdG9yMSA9IG5ldyBMaW1pdE1vdG9yKHRoaXMudGFuLCBmYWxzZSk7XG4gICAgLy8gVGhlIHNlY29uZCByb3RhdGlvbmFsIGxpbWl0IGFuZCBtb3RvciBpbmZvcm1hdGlvbiBvZiB0aGUgam9pbnQuXG4gICAgdGhpcy5yb3RhdGlvbmFsTGltaXRNb3RvcjIgPSBuZXcgTGltaXRNb3Rvcih0aGlzLmJpbiwgZmFsc2UpO1xuXG4gICAgdGhpcy50MyA9IG5ldyBUcmFuc2xhdGlvbmFsM0NvbnN0cmFpbnQodGhpcywgbmV3IExpbWl0TW90b3IodGhpcy5ub3IsIHRydWUpLCB0aGlzLnRyYW5zbGF0aW9uYWxMaW1pdE1vdG9yLCBuZXcgTGltaXRNb3Rvcih0aGlzLmJpbiwgdHJ1ZSkpO1xuICAgIHRoaXMudDMud2VpZ2h0ID0gMTtcbiAgICB0aGlzLnIzID0gbmV3IFJvdGF0aW9uYWwzQ29uc3RyYWludCh0aGlzLCBuZXcgTGltaXRNb3Rvcih0aGlzLm5vciwgdHJ1ZSksIHRoaXMucm90YXRpb25hbExpbWl0TW90b3IxLCB0aGlzLnJvdGF0aW9uYWxMaW1pdE1vdG9yMik7XG5cbiAgfVxuICBXaGVlbEpvaW50LnByb3RvdHlwZSA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmNyZWF0ZShKb2ludC5wcm90b3R5cGUpLCB7XG5cbiAgICBjb25zdHJ1Y3RvcjogV2hlZWxKb2ludCxcblxuICAgIHByZVNvbHZlOiBmdW5jdGlvbiAodGltZVN0ZXAsIGludlRpbWVTdGVwKSB7XG5cbiAgICAgIHRoaXMudXBkYXRlQW5jaG9yUG9pbnRzKCk7XG5cbiAgICAgIHRoaXMuYXgxLmNvcHkodGhpcy5sb2NhbEF4aXMxKS5hcHBseU1hdHJpeDModGhpcy5ib2R5MS5yb3RhdGlvbiwgdHJ1ZSk7XG4gICAgICB0aGlzLmFuMS5jb3B5KHRoaXMubG9jYWxBbmdsZTEpLmFwcGx5TWF0cml4Myh0aGlzLmJvZHkxLnJvdGF0aW9uLCB0cnVlKTtcblxuICAgICAgdGhpcy5heDIuY29weSh0aGlzLmxvY2FsQXhpczIpLmFwcGx5TWF0cml4Myh0aGlzLmJvZHkyLnJvdGF0aW9uLCB0cnVlKTtcbiAgICAgIHRoaXMuYW4yLmNvcHkodGhpcy5sb2NhbEFuZ2xlMikuYXBwbHlNYXRyaXgzKHRoaXMuYm9keTIucm90YXRpb24sIHRydWUpO1xuXG4gICAgICB0aGlzLnIzLmxpbWl0TW90b3IxLmFuZ2xlID0gX01hdGguZG90VmVjdG9ycyh0aGlzLmF4MSwgdGhpcy5heDIpO1xuXG4gICAgICB2YXIgbGltaXRlID0gX01hdGguZG90VmVjdG9ycyh0aGlzLmFuMSwgdGhpcy5heDIpO1xuXG4gICAgICBpZiAoX01hdGguZG90VmVjdG9ycyh0aGlzLmF4MSwgdGhpcy50bXAuY3Jvc3NWZWN0b3JzKHRoaXMuYW4xLCB0aGlzLmF4MikpIDwgMCkgdGhpcy5yb3RhdGlvbmFsTGltaXRNb3RvcjEuYW5nbGUgPSAtbGltaXRlO1xuICAgICAgZWxzZSB0aGlzLnJvdGF0aW9uYWxMaW1pdE1vdG9yMS5hbmdsZSA9IGxpbWl0ZTtcblxuICAgICAgbGltaXRlID0gX01hdGguZG90VmVjdG9ycyh0aGlzLmFuMiwgdGhpcy5heDEpO1xuXG4gICAgICBpZiAoX01hdGguZG90VmVjdG9ycyh0aGlzLmF4MiwgdGhpcy50bXAuY3Jvc3NWZWN0b3JzKHRoaXMuYW4yLCB0aGlzLmF4MSkpIDwgMCkgdGhpcy5yb3RhdGlvbmFsTGltaXRNb3RvcjIuYW5nbGUgPSAtbGltaXRlO1xuICAgICAgZWxzZSB0aGlzLnJvdGF0aW9uYWxMaW1pdE1vdG9yMi5hbmdsZSA9IGxpbWl0ZTtcblxuICAgICAgdGhpcy5ub3IuY3Jvc3NWZWN0b3JzKHRoaXMuYXgxLCB0aGlzLmF4Mikubm9ybWFsaXplKCk7XG4gICAgICB0aGlzLnRhbi5jcm9zc1ZlY3RvcnModGhpcy5ub3IsIHRoaXMuYXgyKS5ub3JtYWxpemUoKTtcbiAgICAgIHRoaXMuYmluLmNyb3NzVmVjdG9ycyh0aGlzLm5vciwgdGhpcy5heDEpLm5vcm1hbGl6ZSgpO1xuXG4gICAgICB0aGlzLnIzLnByZVNvbHZlKHRpbWVTdGVwLCBpbnZUaW1lU3RlcCk7XG4gICAgICB0aGlzLnQzLnByZVNvbHZlKHRpbWVTdGVwLCBpbnZUaW1lU3RlcCk7XG5cbiAgICB9LFxuXG4gICAgc29sdmU6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgdGhpcy5yMy5zb2x2ZSgpO1xuICAgICAgdGhpcy50My5zb2x2ZSgpO1xuXG4gICAgfSxcblxuICAgIHBvc3RTb2x2ZTogZnVuY3Rpb24gKCkge1xuXG4gICAgfVxuXG4gIH0pO1xuXG4gIGZ1bmN0aW9uIEpvaW50Q29uZmlnKCkge1xuXG4gICAgdGhpcy5zY2FsZSA9IDE7XG4gICAgdGhpcy5pbnZTY2FsZSA9IDE7XG5cbiAgICAvLyBUaGUgZmlyc3QgcmlnaWQgYm9keSBvZiB0aGUgam9pbnQuXG4gICAgdGhpcy5ib2R5MSA9IG51bGw7XG4gICAgLy8gVGhlIHNlY29uZCByaWdpZCBib2R5IG9mIHRoZSBqb2ludC5cbiAgICB0aGlzLmJvZHkyID0gbnVsbDtcbiAgICAvLyBUaGUgYW5jaG9yIHBvaW50IG9uIHRoZSBmaXJzdCByaWdpZCBib2R5IGluIGxvY2FsIGNvb3JkaW5hdGUgc3lzdGVtLlxuICAgIHRoaXMubG9jYWxBbmNob3JQb2ludDEgPSBuZXcgVmVjMygpO1xuICAgIC8vICBUaGUgYW5jaG9yIHBvaW50IG9uIHRoZSBzZWNvbmQgcmlnaWQgYm9keSBpbiBsb2NhbCBjb29yZGluYXRlIHN5c3RlbS5cbiAgICB0aGlzLmxvY2FsQW5jaG9yUG9pbnQyID0gbmV3IFZlYzMoKTtcbiAgICAvLyBUaGUgYXhpcyBpbiB0aGUgZmlyc3QgYm9keSdzIGNvb3JkaW5hdGUgc3lzdGVtLlxuICAgIC8vIGhpcyBwcm9wZXJ0eSBpcyBhdmFpbGFibGUgaW4gc29tZSBqb2ludHMuXG4gICAgdGhpcy5sb2NhbEF4aXMxID0gbmV3IFZlYzMoKTtcbiAgICAvLyBUaGUgYXhpcyBpbiB0aGUgc2Vjb25kIGJvZHkncyBjb29yZGluYXRlIHN5c3RlbS5cbiAgICAvLyBUaGlzIHByb3BlcnR5IGlzIGF2YWlsYWJsZSBpbiBzb21lIGpvaW50cy5cbiAgICB0aGlzLmxvY2FsQXhpczIgPSBuZXcgVmVjMygpO1xuICAgIC8vICBXaGV0aGVyIGFsbG93IGNvbGxpc2lvbiBiZXR3ZWVuIGNvbm5lY3RlZCByaWdpZCBib2RpZXMgb3Igbm90LlxuICAgIHRoaXMuYWxsb3dDb2xsaXNpb24gPSBmYWxzZTtcblxuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgY2xhc3MgaG9sZHMgbWFzcyBpbmZvcm1hdGlvbiBvZiBhIHNoYXBlLlxuICAgKiBAYXV0aG9yIGxvLXRoXG4gICAqIEBhdXRob3Igc2FoYXJhblxuICAgKi9cblxuICBmdW5jdGlvbiBNYXNzSW5mbygpIHtcblxuICAgIC8vIE1hc3Mgb2YgdGhlIHNoYXBlLlxuICAgIHRoaXMubWFzcyA9IDA7XG5cbiAgICAvLyBUaGUgbW9tZW50IGluZXJ0aWEgb2YgdGhlIHNoYXBlLlxuICAgIHRoaXMuaW5lcnRpYSA9IG5ldyBNYXQzMygpO1xuXG4gIH1cblxuICAvKipcbiAgKiBBIGxpbmsgbGlzdCBvZiBjb250YWN0cy5cbiAgKiBAYXV0aG9yIHNhaGFyYW5cbiAgKi9cbiAgZnVuY3Rpb24gQ29udGFjdExpbmsoY29udGFjdCkge1xuXG4gICAgLy8gVGhlIHByZXZpb3VzIGNvbnRhY3QgbGluay5cbiAgICB0aGlzLnByZXYgPSBudWxsO1xuICAgIC8vIFRoZSBuZXh0IGNvbnRhY3QgbGluay5cbiAgICB0aGlzLm5leHQgPSBudWxsO1xuICAgIC8vIFRoZSBzaGFwZSBvZiB0aGUgY29udGFjdC5cbiAgICB0aGlzLnNoYXBlID0gbnVsbDtcbiAgICAvLyBUaGUgb3RoZXIgcmlnaWQgYm9keS5cbiAgICB0aGlzLmJvZHkgPSBudWxsO1xuICAgIC8vIFRoZSBjb250YWN0IG9mIHRoZSBsaW5rLlxuICAgIHRoaXMuY29udGFjdCA9IGNvbnRhY3Q7XG5cbiAgfVxuXG4gIGZ1bmN0aW9uIEltcHVsc2VEYXRhQnVmZmVyKCkge1xuXG4gICAgdGhpcy5scDFYID0gTmFOO1xuICAgIHRoaXMubHAxWSA9IE5hTjtcbiAgICB0aGlzLmxwMVogPSBOYU47XG4gICAgdGhpcy5scDJYID0gTmFOO1xuICAgIHRoaXMubHAyWSA9IE5hTjtcbiAgICB0aGlzLmxwMlogPSBOYU47XG4gICAgdGhpcy5pbXB1bHNlID0gTmFOO1xuXG4gIH1cblxuICAvKipcbiAgKiBUaGUgY2xhc3MgaG9sZHMgZGV0YWlscyBvZiB0aGUgY29udGFjdCBwb2ludC5cbiAgKiBAYXV0aG9yIHNhaGFyYW5cbiAgKi9cblxuICBmdW5jdGlvbiBNYW5pZm9sZFBvaW50KCkge1xuXG4gICAgLy8gV2hldGhlciB0aGlzIG1hbmlmb2xkIHBvaW50IGlzIHBlcnNpc3Rpbmcgb3Igbm90LlxuICAgIHRoaXMud2FybVN0YXJ0ZWQgPSBmYWxzZTtcbiAgICAvLyAgVGhlIHBvc2l0aW9uIG9mIHRoaXMgbWFuaWZvbGQgcG9pbnQuXG4gICAgdGhpcy5wb3NpdGlvbiA9IG5ldyBWZWMzKCk7XG4gICAgLy8gVGhlIHBvc2l0aW9uIGluIHRoZSBmaXJzdCBzaGFwZSdzIGNvb3JkaW5hdGUuXG4gICAgdGhpcy5sb2NhbFBvaW50MSA9IG5ldyBWZWMzKCk7XG4gICAgLy8gIFRoZSBwb3NpdGlvbiBpbiB0aGUgc2Vjb25kIHNoYXBlJ3MgY29vcmRpbmF0ZS5cbiAgICB0aGlzLmxvY2FsUG9pbnQyID0gbmV3IFZlYzMoKTtcbiAgICAvLyBUaGUgbm9ybWFsIHZlY3RvciBvZiB0aGlzIG1hbmlmb2xkIHBvaW50LlxuICAgIHRoaXMubm9ybWFsID0gbmV3IFZlYzMoKTtcbiAgICAvLyBUaGUgdGFuZ2VudCB2ZWN0b3Igb2YgdGhpcyBtYW5pZm9sZCBwb2ludC5cbiAgICB0aGlzLnRhbmdlbnQgPSBuZXcgVmVjMygpO1xuICAgIC8vIFRoZSBiaW5vcm1hbCB2ZWN0b3Igb2YgdGhpcyBtYW5pZm9sZCBwb2ludC5cbiAgICB0aGlzLmJpbm9ybWFsID0gbmV3IFZlYzMoKTtcbiAgICAvLyBUaGUgaW1wdWxzZSBpbiBub3JtYWwgZGlyZWN0aW9uLlxuICAgIHRoaXMubm9ybWFsSW1wdWxzZSA9IDA7XG4gICAgLy8gVGhlIGltcHVsc2UgaW4gdGFuZ2VudCBkaXJlY3Rpb24uXG4gICAgdGhpcy50YW5nZW50SW1wdWxzZSA9IDA7XG4gICAgLy8gVGhlIGltcHVsc2UgaW4gYmlub3JtYWwgZGlyZWN0aW9uLlxuICAgIHRoaXMuYmlub3JtYWxJbXB1bHNlID0gMDtcbiAgICAvLyBUaGUgZGVub21pbmF0b3IgaW4gbm9ybWFsIGRpcmVjdGlvbi5cbiAgICB0aGlzLm5vcm1hbERlbm9taW5hdG9yID0gMDtcbiAgICAvLyBUaGUgZGVub21pbmF0b3IgaW4gdGFuZ2VudCBkaXJlY3Rpb24uXG4gICAgdGhpcy50YW5nZW50RGVub21pbmF0b3IgPSAwO1xuICAgIC8vIFRoZSBkZW5vbWluYXRvciBpbiBiaW5vcm1hbCBkaXJlY3Rpb24uXG4gICAgdGhpcy5iaW5vcm1hbERlbm9taW5hdG9yID0gMDtcbiAgICAvLyBUaGUgZGVwdGggb2YgcGVuZXRyYXRpb24uXG4gICAgdGhpcy5wZW5ldHJhdGlvbiA9IDA7XG5cbiAgfVxuXG4gIC8qKlxuICAqIEEgY29udGFjdCBtYW5pZm9sZCBiZXR3ZWVuIHR3byBzaGFwZXMuXG4gICogQGF1dGhvciBzYWhhcmFuXG4gICogQGF1dGhvciBsby10aFxuICAqL1xuXG4gIGZ1bmN0aW9uIENvbnRhY3RNYW5pZm9sZCgpIHtcblxuICAgIC8vIFRoZSBmaXJzdCByaWdpZCBib2R5LlxuICAgIHRoaXMuYm9keTEgPSBudWxsO1xuICAgIC8vIFRoZSBzZWNvbmQgcmlnaWQgYm9keS5cbiAgICB0aGlzLmJvZHkyID0gbnVsbDtcbiAgICAvLyBUaGUgbnVtYmVyIG9mIG1hbmlmb2xkIHBvaW50cy5cbiAgICB0aGlzLm51bVBvaW50cyA9IDA7XG4gICAgLy8gVGhlIG1hbmlmb2xkIHBvaW50cy5cbiAgICB0aGlzLnBvaW50cyA9IFtcbiAgICAgIG5ldyBNYW5pZm9sZFBvaW50KCksXG4gICAgICBuZXcgTWFuaWZvbGRQb2ludCgpLFxuICAgICAgbmV3IE1hbmlmb2xkUG9pbnQoKSxcbiAgICAgIG5ldyBNYW5pZm9sZFBvaW50KClcbiAgICBdO1xuXG4gIH1cblxuICBDb250YWN0TWFuaWZvbGQucHJvdG90eXBlID0ge1xuXG4gICAgY29uc3RydWN0b3I6IENvbnRhY3RNYW5pZm9sZCxcblxuICAgIC8vUmVzZXQgdGhlIG1hbmlmb2xkLlxuICAgIHJlc2V0OiBmdW5jdGlvbiAoc2hhcGUxLCBzaGFwZTIpIHtcblxuICAgICAgdGhpcy5ib2R5MSA9IHNoYXBlMS5wYXJlbnQ7XG4gICAgICB0aGlzLmJvZHkyID0gc2hhcGUyLnBhcmVudDtcbiAgICAgIHRoaXMubnVtUG9pbnRzID0gMDtcblxuICAgIH0sXG5cbiAgICAvLyAgQWRkIGEgcG9pbnQgaW50byB0aGlzIG1hbmlmb2xkLlxuICAgIGFkZFBvaW50VmVjOiBmdW5jdGlvbiAocG9zLCBub3JtLCBwZW5ldHJhdGlvbiwgZmxpcCkge1xuXG4gICAgICB2YXIgcCA9IHRoaXMucG9pbnRzW3RoaXMubnVtUG9pbnRzKytdO1xuXG4gICAgICBwLnBvc2l0aW9uLmNvcHkocG9zKTtcbiAgICAgIHAubG9jYWxQb2ludDEuc3ViKHBvcywgdGhpcy5ib2R5MS5wb3NpdGlvbikuYXBwbHlNYXRyaXgzKHRoaXMuYm9keTEucm90YXRpb24pO1xuICAgICAgcC5sb2NhbFBvaW50Mi5zdWIocG9zLCB0aGlzLmJvZHkyLnBvc2l0aW9uKS5hcHBseU1hdHJpeDModGhpcy5ib2R5Mi5yb3RhdGlvbik7XG5cbiAgICAgIHAubm9ybWFsLmNvcHkobm9ybSk7XG4gICAgICBpZiAoZmxpcCkgcC5ub3JtYWwubmVnYXRlKCk7XG5cbiAgICAgIHAubm9ybWFsSW1wdWxzZSA9IDA7XG4gICAgICBwLnBlbmV0cmF0aW9uID0gcGVuZXRyYXRpb247XG4gICAgICBwLndhcm1TdGFydGVkID0gZmFsc2U7XG5cbiAgICB9LFxuXG4gICAgLy8gIEFkZCBhIHBvaW50IGludG8gdGhpcyBtYW5pZm9sZC5cbiAgICBhZGRQb2ludDogZnVuY3Rpb24gKHgsIHksIHosIG54LCBueSwgbnosIHBlbmV0cmF0aW9uLCBmbGlwKSB7XG5cbiAgICAgIHZhciBwID0gdGhpcy5wb2ludHNbdGhpcy5udW1Qb2ludHMrK107XG5cbiAgICAgIHAucG9zaXRpb24uc2V0KHgsIHksIHopO1xuICAgICAgcC5sb2NhbFBvaW50MS5zdWIocC5wb3NpdGlvbiwgdGhpcy5ib2R5MS5wb3NpdGlvbikuYXBwbHlNYXRyaXgzKHRoaXMuYm9keTEucm90YXRpb24pO1xuICAgICAgcC5sb2NhbFBvaW50Mi5zdWIocC5wb3NpdGlvbiwgdGhpcy5ib2R5Mi5wb3NpdGlvbikuYXBwbHlNYXRyaXgzKHRoaXMuYm9keTIucm90YXRpb24pO1xuXG4gICAgICBwLm5vcm1hbEltcHVsc2UgPSAwO1xuXG4gICAgICBwLm5vcm1hbC5zZXQobngsIG55LCBueik7XG4gICAgICBpZiAoZmxpcCkgcC5ub3JtYWwubmVnYXRlKCk7XG5cbiAgICAgIHAucGVuZXRyYXRpb24gPSBwZW5ldHJhdGlvbjtcbiAgICAgIHAud2FybVN0YXJ0ZWQgPSBmYWxzZTtcblxuICAgIH1cbiAgfTtcblxuICBmdW5jdGlvbiBDb250YWN0UG9pbnREYXRhQnVmZmVyKCkge1xuXG4gICAgdGhpcy5ub3IgPSBuZXcgVmVjMygpO1xuICAgIHRoaXMudGFuID0gbmV3IFZlYzMoKTtcbiAgICB0aGlzLmJpbiA9IG5ldyBWZWMzKCk7XG5cbiAgICB0aGlzLm5vclUxID0gbmV3IFZlYzMoKTtcbiAgICB0aGlzLnRhblUxID0gbmV3IFZlYzMoKTtcbiAgICB0aGlzLmJpblUxID0gbmV3IFZlYzMoKTtcblxuICAgIHRoaXMubm9yVTIgPSBuZXcgVmVjMygpO1xuICAgIHRoaXMudGFuVTIgPSBuZXcgVmVjMygpO1xuICAgIHRoaXMuYmluVTIgPSBuZXcgVmVjMygpO1xuXG4gICAgdGhpcy5ub3JUMSA9IG5ldyBWZWMzKCk7XG4gICAgdGhpcy50YW5UMSA9IG5ldyBWZWMzKCk7XG4gICAgdGhpcy5iaW5UMSA9IG5ldyBWZWMzKCk7XG5cbiAgICB0aGlzLm5vclQyID0gbmV3IFZlYzMoKTtcbiAgICB0aGlzLnRhblQyID0gbmV3IFZlYzMoKTtcbiAgICB0aGlzLmJpblQyID0gbmV3IFZlYzMoKTtcblxuICAgIHRoaXMubm9yVFUxID0gbmV3IFZlYzMoKTtcbiAgICB0aGlzLnRhblRVMSA9IG5ldyBWZWMzKCk7XG4gICAgdGhpcy5iaW5UVTEgPSBuZXcgVmVjMygpO1xuXG4gICAgdGhpcy5ub3JUVTIgPSBuZXcgVmVjMygpO1xuICAgIHRoaXMudGFuVFUyID0gbmV3IFZlYzMoKTtcbiAgICB0aGlzLmJpblRVMiA9IG5ldyBWZWMzKCk7XG5cbiAgICB0aGlzLm5vckltcCA9IDA7XG4gICAgdGhpcy50YW5JbXAgPSAwO1xuICAgIHRoaXMuYmluSW1wID0gMDtcblxuICAgIHRoaXMubm9yRGVuID0gMDtcbiAgICB0aGlzLnRhbkRlbiA9IDA7XG4gICAgdGhpcy5iaW5EZW4gPSAwO1xuXG4gICAgdGhpcy5ub3JUYXIgPSAwO1xuXG4gICAgdGhpcy5uZXh0ID0gbnVsbDtcbiAgICB0aGlzLmxhc3QgPSBmYWxzZTtcblxuICB9XG5cbiAgLyoqXG4gICogLi4uXG4gICogQGF1dGhvciBzYWhhcmFuXG4gICovXG4gIGZ1bmN0aW9uIENvbnRhY3RDb25zdHJhaW50KG1hbmlmb2xkKSB7XG5cbiAgICBDb25zdHJhaW50LmNhbGwodGhpcyk7XG4gICAgLy8gVGhlIGNvbnRhY3QgbWFuaWZvbGQgb2YgdGhlIGNvbnN0cmFpbnQuXG4gICAgdGhpcy5tYW5pZm9sZCA9IG1hbmlmb2xkO1xuICAgIC8vIFRoZSBjb2VmZmljaWVudCBvZiByZXN0aXR1dGlvbiBvZiB0aGUgY29uc3RyYWludC5cbiAgICB0aGlzLnJlc3RpdHV0aW9uID0gTmFOO1xuICAgIC8vIFRoZSBjb2VmZmljaWVudCBvZiBmcmljdGlvbiBvZiB0aGUgY29uc3RyYWludC5cbiAgICB0aGlzLmZyaWN0aW9uID0gTmFOO1xuICAgIHRoaXMucDEgPSBudWxsO1xuICAgIHRoaXMucDIgPSBudWxsO1xuICAgIHRoaXMubHYxID0gbnVsbDtcbiAgICB0aGlzLmx2MiA9IG51bGw7XG4gICAgdGhpcy5hdjEgPSBudWxsO1xuICAgIHRoaXMuYXYyID0gbnVsbDtcbiAgICB0aGlzLmkxID0gbnVsbDtcbiAgICB0aGlzLmkyID0gbnVsbDtcblxuICAgIC8vdGhpcy5paTEgPSBudWxsO1xuICAgIC8vdGhpcy5paTIgPSBudWxsO1xuXG4gICAgdGhpcy50bXAgPSBuZXcgVmVjMygpO1xuICAgIHRoaXMudG1wQzEgPSBuZXcgVmVjMygpO1xuICAgIHRoaXMudG1wQzIgPSBuZXcgVmVjMygpO1xuXG4gICAgdGhpcy50bXBQMSA9IG5ldyBWZWMzKCk7XG4gICAgdGhpcy50bXBQMiA9IG5ldyBWZWMzKCk7XG5cbiAgICB0aGlzLnRtcGx2MSA9IG5ldyBWZWMzKCk7XG4gICAgdGhpcy50bXBsdjIgPSBuZXcgVmVjMygpO1xuICAgIHRoaXMudG1wYXYxID0gbmV3IFZlYzMoKTtcbiAgICB0aGlzLnRtcGF2MiA9IG5ldyBWZWMzKCk7XG5cbiAgICB0aGlzLm0xID0gTmFOO1xuICAgIHRoaXMubTIgPSBOYU47XG4gICAgdGhpcy5udW0gPSAwO1xuXG4gICAgdGhpcy5wcyA9IG1hbmlmb2xkLnBvaW50cztcbiAgICB0aGlzLmNzID0gbmV3IENvbnRhY3RQb2ludERhdGFCdWZmZXIoKTtcbiAgICB0aGlzLmNzLm5leHQgPSBuZXcgQ29udGFjdFBvaW50RGF0YUJ1ZmZlcigpO1xuICAgIHRoaXMuY3MubmV4dC5uZXh0ID0gbmV3IENvbnRhY3RQb2ludERhdGFCdWZmZXIoKTtcbiAgICB0aGlzLmNzLm5leHQubmV4dC5uZXh0ID0gbmV3IENvbnRhY3RQb2ludERhdGFCdWZmZXIoKTtcbiAgfVxuXG4gIENvbnRhY3RDb25zdHJhaW50LnByb3RvdHlwZSA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmNyZWF0ZShDb25zdHJhaW50LnByb3RvdHlwZSksIHtcblxuICAgIGNvbnN0cnVjdG9yOiBDb250YWN0Q29uc3RyYWludCxcblxuICAgIC8vIEF0dGFjaCB0aGUgY29uc3RyYWludCB0byB0aGUgYm9kaWVzLlxuICAgIGF0dGFjaDogZnVuY3Rpb24gKCkge1xuXG4gICAgICB0aGlzLnAxID0gdGhpcy5ib2R5MS5wb3NpdGlvbjtcbiAgICAgIHRoaXMucDIgPSB0aGlzLmJvZHkyLnBvc2l0aW9uO1xuICAgICAgdGhpcy5sdjEgPSB0aGlzLmJvZHkxLmxpbmVhclZlbG9jaXR5O1xuICAgICAgdGhpcy5hdjEgPSB0aGlzLmJvZHkxLmFuZ3VsYXJWZWxvY2l0eTtcbiAgICAgIHRoaXMubHYyID0gdGhpcy5ib2R5Mi5saW5lYXJWZWxvY2l0eTtcbiAgICAgIHRoaXMuYXYyID0gdGhpcy5ib2R5Mi5hbmd1bGFyVmVsb2NpdHk7XG4gICAgICB0aGlzLmkxID0gdGhpcy5ib2R5MS5pbnZlcnNlSW5lcnRpYTtcbiAgICAgIHRoaXMuaTIgPSB0aGlzLmJvZHkyLmludmVyc2VJbmVydGlhO1xuXG4gICAgfSxcblxuICAgIC8vIERldGFjaCB0aGUgY29uc3RyYWludCBmcm9tIHRoZSBib2RpZXMuXG4gICAgZGV0YWNoOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHRoaXMucDEgPSBudWxsO1xuICAgICAgdGhpcy5wMiA9IG51bGw7XG4gICAgICB0aGlzLmx2MSA9IG51bGw7XG4gICAgICB0aGlzLmx2MiA9IG51bGw7XG4gICAgICB0aGlzLmF2MSA9IG51bGw7XG4gICAgICB0aGlzLmF2MiA9IG51bGw7XG4gICAgICB0aGlzLmkxID0gbnVsbDtcbiAgICAgIHRoaXMuaTIgPSBudWxsO1xuXG4gICAgfSxcblxuICAgIHByZVNvbHZlOiBmdW5jdGlvbiAodGltZVN0ZXAsIGludlRpbWVTdGVwKSB7XG5cbiAgICAgIHRoaXMubTEgPSB0aGlzLmJvZHkxLmludmVyc2VNYXNzO1xuICAgICAgdGhpcy5tMiA9IHRoaXMuYm9keTIuaW52ZXJzZU1hc3M7XG5cbiAgICAgIHZhciBtMW0yID0gdGhpcy5tMSArIHRoaXMubTI7XG5cbiAgICAgIHRoaXMubnVtID0gdGhpcy5tYW5pZm9sZC5udW1Qb2ludHM7XG5cbiAgICAgIHZhciBjID0gdGhpcy5jcztcbiAgICAgIHZhciBwLCBydm4sIGxlbiwgbm9ySW1wLCBub3JUYXIsIHNlcFYsIGkxLCBpMjtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5udW07IGkrKykge1xuXG4gICAgICAgIHAgPSB0aGlzLnBzW2ldO1xuXG4gICAgICAgIHRoaXMudG1wUDEuc3ViKHAucG9zaXRpb24sIHRoaXMucDEpO1xuICAgICAgICB0aGlzLnRtcFAyLnN1YihwLnBvc2l0aW9uLCB0aGlzLnAyKTtcblxuICAgICAgICB0aGlzLnRtcEMxLmNyb3NzVmVjdG9ycyh0aGlzLmF2MSwgdGhpcy50bXBQMSk7XG4gICAgICAgIHRoaXMudG1wQzIuY3Jvc3NWZWN0b3JzKHRoaXMuYXYyLCB0aGlzLnRtcFAyKTtcblxuICAgICAgICBjLm5vckltcCA9IHAubm9ybWFsSW1wdWxzZTtcbiAgICAgICAgYy50YW5JbXAgPSBwLnRhbmdlbnRJbXB1bHNlO1xuICAgICAgICBjLmJpbkltcCA9IHAuYmlub3JtYWxJbXB1bHNlO1xuXG4gICAgICAgIGMubm9yLmNvcHkocC5ub3JtYWwpO1xuXG4gICAgICAgIHRoaXMudG1wLnNldChcblxuICAgICAgICAgICh0aGlzLmx2Mi54ICsgdGhpcy50bXBDMi54KSAtICh0aGlzLmx2MS54ICsgdGhpcy50bXBDMS54KSxcbiAgICAgICAgICAodGhpcy5sdjIueSArIHRoaXMudG1wQzIueSkgLSAodGhpcy5sdjEueSArIHRoaXMudG1wQzEueSksXG4gICAgICAgICAgKHRoaXMubHYyLnogKyB0aGlzLnRtcEMyLnopIC0gKHRoaXMubHYxLnogKyB0aGlzLnRtcEMxLnopXG5cbiAgICAgICAgKTtcblxuICAgICAgICBydm4gPSBfTWF0aC5kb3RWZWN0b3JzKGMubm9yLCB0aGlzLnRtcCk7XG5cbiAgICAgICAgYy50YW4uc2V0KFxuICAgICAgICAgIHRoaXMudG1wLnggLSBydm4gKiBjLm5vci54LFxuICAgICAgICAgIHRoaXMudG1wLnkgLSBydm4gKiBjLm5vci55LFxuICAgICAgICAgIHRoaXMudG1wLnogLSBydm4gKiBjLm5vci56XG4gICAgICAgICk7XG5cbiAgICAgICAgbGVuID0gX01hdGguZG90VmVjdG9ycyhjLnRhbiwgYy50YW4pO1xuXG4gICAgICAgIGlmIChsZW4gPD0gMC4wNCkge1xuICAgICAgICAgIGMudGFuLnRhbmdlbnQoYy5ub3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgYy50YW4ubm9ybWFsaXplKCk7XG5cbiAgICAgICAgYy5iaW4uY3Jvc3NWZWN0b3JzKGMubm9yLCBjLnRhbik7XG5cbiAgICAgICAgYy5ub3JVMS5zY2FsZShjLm5vciwgdGhpcy5tMSk7XG4gICAgICAgIGMubm9yVTIuc2NhbGUoYy5ub3IsIHRoaXMubTIpO1xuXG4gICAgICAgIGMudGFuVTEuc2NhbGUoYy50YW4sIHRoaXMubTEpO1xuICAgICAgICBjLnRhblUyLnNjYWxlKGMudGFuLCB0aGlzLm0yKTtcblxuICAgICAgICBjLmJpblUxLnNjYWxlKGMuYmluLCB0aGlzLm0xKTtcbiAgICAgICAgYy5iaW5VMi5zY2FsZShjLmJpbiwgdGhpcy5tMik7XG5cbiAgICAgICAgYy5ub3JUMS5jcm9zc1ZlY3RvcnModGhpcy50bXBQMSwgYy5ub3IpO1xuICAgICAgICBjLnRhblQxLmNyb3NzVmVjdG9ycyh0aGlzLnRtcFAxLCBjLnRhbik7XG4gICAgICAgIGMuYmluVDEuY3Jvc3NWZWN0b3JzKHRoaXMudG1wUDEsIGMuYmluKTtcblxuICAgICAgICBjLm5vclQyLmNyb3NzVmVjdG9ycyh0aGlzLnRtcFAyLCBjLm5vcik7XG4gICAgICAgIGMudGFuVDIuY3Jvc3NWZWN0b3JzKHRoaXMudG1wUDIsIGMudGFuKTtcbiAgICAgICAgYy5iaW5UMi5jcm9zc1ZlY3RvcnModGhpcy50bXBQMiwgYy5iaW4pO1xuXG4gICAgICAgIGkxID0gdGhpcy5pMTtcbiAgICAgICAgaTIgPSB0aGlzLmkyO1xuXG4gICAgICAgIGMubm9yVFUxLmNvcHkoYy5ub3JUMSkuYXBwbHlNYXRyaXgzKGkxLCB0cnVlKTtcbiAgICAgICAgYy50YW5UVTEuY29weShjLnRhblQxKS5hcHBseU1hdHJpeDMoaTEsIHRydWUpO1xuICAgICAgICBjLmJpblRVMS5jb3B5KGMuYmluVDEpLmFwcGx5TWF0cml4MyhpMSwgdHJ1ZSk7XG5cbiAgICAgICAgYy5ub3JUVTIuY29weShjLm5vclQyKS5hcHBseU1hdHJpeDMoaTIsIHRydWUpO1xuICAgICAgICBjLnRhblRVMi5jb3B5KGMudGFuVDIpLmFwcGx5TWF0cml4MyhpMiwgdHJ1ZSk7XG4gICAgICAgIGMuYmluVFUyLmNvcHkoYy5iaW5UMikuYXBwbHlNYXRyaXgzKGkyLCB0cnVlKTtcblxuICAgICAgICAvKmMubm9yVFUxLm11bE1hdCggdGhpcy5pMSwgYy5ub3JUMSApO1xuICAgICAgICBjLnRhblRVMS5tdWxNYXQoIHRoaXMuaTEsIGMudGFuVDEgKTtcbiAgICAgICAgYy5iaW5UVTEubXVsTWF0KCB0aGlzLmkxLCBjLmJpblQxICk7XG5cbiAgICAgICAgYy5ub3JUVTIubXVsTWF0KCB0aGlzLmkyLCBjLm5vclQyICk7XG4gICAgICAgIGMudGFuVFUyLm11bE1hdCggdGhpcy5pMiwgYy50YW5UMiApO1xuICAgICAgICBjLmJpblRVMi5tdWxNYXQoIHRoaXMuaTIsIGMuYmluVDIgKTsqL1xuXG4gICAgICAgIHRoaXMudG1wQzEuY3Jvc3NWZWN0b3JzKGMubm9yVFUxLCB0aGlzLnRtcFAxKTtcbiAgICAgICAgdGhpcy50bXBDMi5jcm9zc1ZlY3RvcnMoYy5ub3JUVTIsIHRoaXMudG1wUDIpO1xuICAgICAgICB0aGlzLnRtcC5hZGQodGhpcy50bXBDMSwgdGhpcy50bXBDMik7XG4gICAgICAgIGMubm9yRGVuID0gMSAvIChtMW0yICsgX01hdGguZG90VmVjdG9ycyhjLm5vciwgdGhpcy50bXApKTtcblxuICAgICAgICB0aGlzLnRtcEMxLmNyb3NzVmVjdG9ycyhjLnRhblRVMSwgdGhpcy50bXBQMSk7XG4gICAgICAgIHRoaXMudG1wQzIuY3Jvc3NWZWN0b3JzKGMudGFuVFUyLCB0aGlzLnRtcFAyKTtcbiAgICAgICAgdGhpcy50bXAuYWRkKHRoaXMudG1wQzEsIHRoaXMudG1wQzIpO1xuICAgICAgICBjLnRhbkRlbiA9IDEgLyAobTFtMiArIF9NYXRoLmRvdFZlY3RvcnMoYy50YW4sIHRoaXMudG1wKSk7XG5cbiAgICAgICAgdGhpcy50bXBDMS5jcm9zc1ZlY3RvcnMoYy5iaW5UVTEsIHRoaXMudG1wUDEpO1xuICAgICAgICB0aGlzLnRtcEMyLmNyb3NzVmVjdG9ycyhjLmJpblRVMiwgdGhpcy50bXBQMik7XG4gICAgICAgIHRoaXMudG1wLmFkZCh0aGlzLnRtcEMxLCB0aGlzLnRtcEMyKTtcbiAgICAgICAgYy5iaW5EZW4gPSAxIC8gKG0xbTIgKyBfTWF0aC5kb3RWZWN0b3JzKGMuYmluLCB0aGlzLnRtcCkpO1xuXG4gICAgICAgIGlmIChwLndhcm1TdGFydGVkKSB7XG5cbiAgICAgICAgICBub3JJbXAgPSBwLm5vcm1hbEltcHVsc2U7XG5cbiAgICAgICAgICB0aGlzLmx2MS5hZGRTY2FsZWRWZWN0b3IoYy5ub3JVMSwgbm9ySW1wKTtcbiAgICAgICAgICB0aGlzLmF2MS5hZGRTY2FsZWRWZWN0b3IoYy5ub3JUVTEsIG5vckltcCk7XG5cbiAgICAgICAgICB0aGlzLmx2Mi5zdWJTY2FsZWRWZWN0b3IoYy5ub3JVMiwgbm9ySW1wKTtcbiAgICAgICAgICB0aGlzLmF2Mi5zdWJTY2FsZWRWZWN0b3IoYy5ub3JUVTIsIG5vckltcCk7XG5cbiAgICAgICAgICBjLm5vckltcCA9IG5vckltcDtcbiAgICAgICAgICBjLnRhbkltcCA9IDA7XG4gICAgICAgICAgYy5iaW5JbXAgPSAwO1xuICAgICAgICAgIHJ2biA9IDA7IC8vIGRpc2FibGUgYm91bmNpbmdcblxuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgYy5ub3JJbXAgPSAwO1xuICAgICAgICAgIGMudGFuSW1wID0gMDtcbiAgICAgICAgICBjLmJpbkltcCA9IDA7XG5cbiAgICAgICAgfVxuXG5cbiAgICAgICAgaWYgKHJ2biA+IC0xKSBydm4gPSAwOyAvLyBkaXNhYmxlIGJvdW5jaW5nXG5cbiAgICAgICAgbm9yVGFyID0gdGhpcy5yZXN0aXR1dGlvbiAqIC1ydm47XG4gICAgICAgIHNlcFYgPSAtKHAucGVuZXRyYXRpb24gKyAwLjAwNSkgKiBpbnZUaW1lU3RlcCAqIDAuMDU7IC8vIGFsbG93IDAuNWNtIGVycm9yXG4gICAgICAgIGlmIChub3JUYXIgPCBzZXBWKSBub3JUYXIgPSBzZXBWO1xuICAgICAgICBjLm5vclRhciA9IG5vclRhcjtcbiAgICAgICAgYy5sYXN0ID0gaSA9PSB0aGlzLm51bSAtIDE7XG4gICAgICAgIGMgPSBjLm5leHQ7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHNvbHZlOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHRoaXMudG1wbHYxLmNvcHkodGhpcy5sdjEpO1xuICAgICAgdGhpcy50bXBsdjIuY29weSh0aGlzLmx2Mik7XG4gICAgICB0aGlzLnRtcGF2MS5jb3B5KHRoaXMuYXYxKTtcbiAgICAgIHRoaXMudG1wYXYyLmNvcHkodGhpcy5hdjIpO1xuXG4gICAgICB2YXIgb2xkSW1wMSwgbmV3SW1wMSwgb2xkSW1wMiwgbmV3SW1wMiwgcnZuLCBub3JJbXAsIHRhbkltcCwgYmluSW1wLCBtYXgsIGxlbjtcblxuICAgICAgdmFyIGMgPSB0aGlzLmNzO1xuXG4gICAgICB3aGlsZSAodHJ1ZSkge1xuXG4gICAgICAgIG5vckltcCA9IGMubm9ySW1wO1xuICAgICAgICB0YW5JbXAgPSBjLnRhbkltcDtcbiAgICAgICAgYmluSW1wID0gYy5iaW5JbXA7XG4gICAgICAgIG1heCA9IC1ub3JJbXAgKiB0aGlzLmZyaWN0aW9uO1xuXG4gICAgICAgIHRoaXMudG1wLnN1Yih0aGlzLnRtcGx2MiwgdGhpcy50bXBsdjEpO1xuXG4gICAgICAgIHJ2biA9IF9NYXRoLmRvdFZlY3RvcnModGhpcy50bXAsIGMudGFuKSArIF9NYXRoLmRvdFZlY3RvcnModGhpcy50bXBhdjIsIGMudGFuVDIpIC0gX01hdGguZG90VmVjdG9ycyh0aGlzLnRtcGF2MSwgYy50YW5UMSk7XG5cbiAgICAgICAgb2xkSW1wMSA9IHRhbkltcDtcbiAgICAgICAgbmV3SW1wMSA9IHJ2biAqIGMudGFuRGVuO1xuICAgICAgICB0YW5JbXAgKz0gbmV3SW1wMTtcblxuICAgICAgICBydm4gPSBfTWF0aC5kb3RWZWN0b3JzKHRoaXMudG1wLCBjLmJpbikgKyBfTWF0aC5kb3RWZWN0b3JzKHRoaXMudG1wYXYyLCBjLmJpblQyKSAtIF9NYXRoLmRvdFZlY3RvcnModGhpcy50bXBhdjEsIGMuYmluVDEpO1xuXG4gICAgICAgIG9sZEltcDIgPSBiaW5JbXA7XG4gICAgICAgIG5ld0ltcDIgPSBydm4gKiBjLmJpbkRlbjtcbiAgICAgICAgYmluSW1wICs9IG5ld0ltcDI7XG5cbiAgICAgICAgLy8gY29uZSBmcmljdGlvbiBjbGFtcFxuICAgICAgICBsZW4gPSB0YW5JbXAgKiB0YW5JbXAgKyBiaW5JbXAgKiBiaW5JbXA7XG4gICAgICAgIGlmIChsZW4gPiBtYXggKiBtYXgpIHtcbiAgICAgICAgICBsZW4gPSBtYXggLyBfTWF0aC5zcXJ0KGxlbik7XG4gICAgICAgICAgdGFuSW1wICo9IGxlbjtcbiAgICAgICAgICBiaW5JbXAgKj0gbGVuO1xuICAgICAgICB9XG5cbiAgICAgICAgbmV3SW1wMSA9IHRhbkltcCAtIG9sZEltcDE7XG4gICAgICAgIG5ld0ltcDIgPSBiaW5JbXAgLSBvbGRJbXAyO1xuXG4gICAgICAgIC8vXG5cbiAgICAgICAgdGhpcy50bXAuc2V0KFxuICAgICAgICAgIGMudGFuVTEueCAqIG5ld0ltcDEgKyBjLmJpblUxLnggKiBuZXdJbXAyLFxuICAgICAgICAgIGMudGFuVTEueSAqIG5ld0ltcDEgKyBjLmJpblUxLnkgKiBuZXdJbXAyLFxuICAgICAgICAgIGMudGFuVTEueiAqIG5ld0ltcDEgKyBjLmJpblUxLnogKiBuZXdJbXAyXG4gICAgICAgICk7XG5cbiAgICAgICAgdGhpcy50bXBsdjEuYWRkRXF1YWwodGhpcy50bXApO1xuXG4gICAgICAgIHRoaXMudG1wLnNldChcbiAgICAgICAgICBjLnRhblRVMS54ICogbmV3SW1wMSArIGMuYmluVFUxLnggKiBuZXdJbXAyLFxuICAgICAgICAgIGMudGFuVFUxLnkgKiBuZXdJbXAxICsgYy5iaW5UVTEueSAqIG5ld0ltcDIsXG4gICAgICAgICAgYy50YW5UVTEueiAqIG5ld0ltcDEgKyBjLmJpblRVMS56ICogbmV3SW1wMlxuICAgICAgICApO1xuXG4gICAgICAgIHRoaXMudG1wYXYxLmFkZEVxdWFsKHRoaXMudG1wKTtcblxuICAgICAgICB0aGlzLnRtcC5zZXQoXG4gICAgICAgICAgYy50YW5VMi54ICogbmV3SW1wMSArIGMuYmluVTIueCAqIG5ld0ltcDIsXG4gICAgICAgICAgYy50YW5VMi55ICogbmV3SW1wMSArIGMuYmluVTIueSAqIG5ld0ltcDIsXG4gICAgICAgICAgYy50YW5VMi56ICogbmV3SW1wMSArIGMuYmluVTIueiAqIG5ld0ltcDJcbiAgICAgICAgKTtcblxuICAgICAgICB0aGlzLnRtcGx2Mi5zdWJFcXVhbCh0aGlzLnRtcCk7XG5cbiAgICAgICAgdGhpcy50bXAuc2V0KFxuICAgICAgICAgIGMudGFuVFUyLnggKiBuZXdJbXAxICsgYy5iaW5UVTIueCAqIG5ld0ltcDIsXG4gICAgICAgICAgYy50YW5UVTIueSAqIG5ld0ltcDEgKyBjLmJpblRVMi55ICogbmV3SW1wMixcbiAgICAgICAgICBjLnRhblRVMi56ICogbmV3SW1wMSArIGMuYmluVFUyLnogKiBuZXdJbXAyXG4gICAgICAgICk7XG5cbiAgICAgICAgdGhpcy50bXBhdjIuc3ViRXF1YWwodGhpcy50bXApO1xuXG4gICAgICAgIC8vIHJlc3RpdHV0aW9uIHBhcnRcblxuICAgICAgICB0aGlzLnRtcC5zdWIodGhpcy50bXBsdjIsIHRoaXMudG1wbHYxKTtcblxuICAgICAgICBydm4gPSBfTWF0aC5kb3RWZWN0b3JzKHRoaXMudG1wLCBjLm5vcikgKyBfTWF0aC5kb3RWZWN0b3JzKHRoaXMudG1wYXYyLCBjLm5vclQyKSAtIF9NYXRoLmRvdFZlY3RvcnModGhpcy50bXBhdjEsIGMubm9yVDEpO1xuXG4gICAgICAgIG9sZEltcDEgPSBub3JJbXA7XG4gICAgICAgIG5ld0ltcDEgPSAocnZuIC0gYy5ub3JUYXIpICogYy5ub3JEZW47XG4gICAgICAgIG5vckltcCArPSBuZXdJbXAxO1xuICAgICAgICBpZiAobm9ySW1wID4gMCkgbm9ySW1wID0gMDtcblxuICAgICAgICBuZXdJbXAxID0gbm9ySW1wIC0gb2xkSW1wMTtcblxuICAgICAgICB0aGlzLnRtcGx2MS5hZGRTY2FsZWRWZWN0b3IoYy5ub3JVMSwgbmV3SW1wMSk7XG4gICAgICAgIHRoaXMudG1wYXYxLmFkZFNjYWxlZFZlY3RvcihjLm5vclRVMSwgbmV3SW1wMSk7XG4gICAgICAgIHRoaXMudG1wbHYyLnN1YlNjYWxlZFZlY3RvcihjLm5vclUyLCBuZXdJbXAxKTtcbiAgICAgICAgdGhpcy50bXBhdjIuc3ViU2NhbGVkVmVjdG9yKGMubm9yVFUyLCBuZXdJbXAxKTtcblxuICAgICAgICBjLm5vckltcCA9IG5vckltcDtcbiAgICAgICAgYy50YW5JbXAgPSB0YW5JbXA7XG4gICAgICAgIGMuYmluSW1wID0gYmluSW1wO1xuXG4gICAgICAgIGlmIChjLmxhc3QpIGJyZWFrO1xuICAgICAgICBjID0gYy5uZXh0O1xuICAgICAgfVxuXG4gICAgICB0aGlzLmx2MS5jb3B5KHRoaXMudG1wbHYxKTtcbiAgICAgIHRoaXMubHYyLmNvcHkodGhpcy50bXBsdjIpO1xuICAgICAgdGhpcy5hdjEuY29weSh0aGlzLnRtcGF2MSk7XG4gICAgICB0aGlzLmF2Mi5jb3B5KHRoaXMudG1wYXYyKTtcblxuICAgIH0sXG5cbiAgICBwb3N0U29sdmU6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgdmFyIGMgPSB0aGlzLmNzLCBwO1xuICAgICAgdmFyIGkgPSB0aGlzLm51bTtcbiAgICAgIHdoaWxlIChpLS0pIHtcbiAgICAgICAgLy9mb3IodmFyIGk9MDtpPHRoaXMubnVtO2krKyl7XG4gICAgICAgIHAgPSB0aGlzLnBzW2ldO1xuICAgICAgICBwLm5vcm1hbC5jb3B5KGMubm9yKTtcbiAgICAgICAgcC50YW5nZW50LmNvcHkoYy50YW4pO1xuICAgICAgICBwLmJpbm9ybWFsLmNvcHkoYy5iaW4pO1xuXG4gICAgICAgIHAubm9ybWFsSW1wdWxzZSA9IGMubm9ySW1wO1xuICAgICAgICBwLnRhbmdlbnRJbXB1bHNlID0gYy50YW5JbXA7XG4gICAgICAgIHAuYmlub3JtYWxJbXB1bHNlID0gYy5iaW5JbXA7XG4gICAgICAgIHAubm9ybWFsRGVub21pbmF0b3IgPSBjLm5vckRlbjtcbiAgICAgICAgcC50YW5nZW50RGVub21pbmF0b3IgPSBjLnRhbkRlbjtcbiAgICAgICAgcC5iaW5vcm1hbERlbm9taW5hdG9yID0gYy5iaW5EZW47XG4gICAgICAgIGMgPSBjLm5leHQ7XG4gICAgICB9XG4gICAgfVxuXG4gIH0pO1xuXG4gIC8qKlxuICAqIEEgY29udGFjdCBpcyBhIHBhaXIgb2Ygc2hhcGVzIHdob3NlIGF4aXMtYWxpZ25lZCBib3VuZGluZyBib3hlcyBhcmUgb3ZlcmxhcHBpbmcuXG4gICogQGF1dGhvciBzYWhhcmFuXG4gICovXG5cbiAgZnVuY3Rpb24gQ29udGFjdCgpIHtcblxuICAgIC8vIFRoZSBmaXJzdCBzaGFwZS5cbiAgICB0aGlzLnNoYXBlMSA9IG51bGw7XG4gICAgLy8gVGhlIHNlY29uZCBzaGFwZS5cbiAgICB0aGlzLnNoYXBlMiA9IG51bGw7XG4gICAgLy8gVGhlIGZpcnN0IHJpZ2lkIGJvZHkuXG4gICAgdGhpcy5ib2R5MSA9IG51bGw7XG4gICAgLy8gVGhlIHNlY29uZCByaWdpZCBib2R5LlxuICAgIHRoaXMuYm9keTIgPSBudWxsO1xuICAgIC8vIFRoZSBwcmV2aW91cyBjb250YWN0IGluIHRoZSB3b3JsZC5cbiAgICB0aGlzLnByZXYgPSBudWxsO1xuICAgIC8vIFRoZSBuZXh0IGNvbnRhY3QgaW4gdGhlIHdvcmxkLlxuICAgIHRoaXMubmV4dCA9IG51bGw7XG4gICAgLy8gSW50ZXJuYWxcbiAgICB0aGlzLnBlcnNpc3RpbmcgPSBmYWxzZTtcbiAgICAvLyBXaGV0aGVyIGJvdGggdGhlIHJpZ2lkIGJvZGllcyBhcmUgc2xlZXBpbmcgb3Igbm90LlxuICAgIHRoaXMuc2xlZXBpbmcgPSBmYWxzZTtcbiAgICAvLyBUaGUgY29sbGlzaW9uIGRldGVjdG9yIGJldHdlZW4gdHdvIHNoYXBlcy5cbiAgICB0aGlzLmRldGVjdG9yID0gbnVsbDtcbiAgICAvLyBUaGUgY29udGFjdCBjb25zdHJhaW50IG9mIHRoZSBjb250YWN0LlxuICAgIHRoaXMuY29uc3RyYWludCA9IG51bGw7XG4gICAgLy8gV2hldGhlciB0aGUgc2hhcGVzIGFyZSB0b3VjaGluZyBvciBub3QuXG4gICAgdGhpcy50b3VjaGluZyA9IGZhbHNlO1xuICAgIC8vIHNoYXBlcyBpcyB2ZXJ5IGNsb3NlIGFuZCB0b3VjaGluZyBcbiAgICB0aGlzLmNsb3NlID0gZmFsc2U7XG5cbiAgICB0aGlzLmRpc3QgPSBfTWF0aC5JTkY7XG5cbiAgICB0aGlzLmIxTGluayA9IG5ldyBDb250YWN0TGluayh0aGlzKTtcbiAgICB0aGlzLmIyTGluayA9IG5ldyBDb250YWN0TGluayh0aGlzKTtcbiAgICB0aGlzLnMxTGluayA9IG5ldyBDb250YWN0TGluayh0aGlzKTtcbiAgICB0aGlzLnMyTGluayA9IG5ldyBDb250YWN0TGluayh0aGlzKTtcblxuICAgIC8vIFRoZSBjb250YWN0IG1hbmlmb2xkIG9mIHRoZSBjb250YWN0LlxuICAgIHRoaXMubWFuaWZvbGQgPSBuZXcgQ29udGFjdE1hbmlmb2xkKCk7XG5cbiAgICB0aGlzLmJ1ZmZlciA9IFtcblxuICAgICAgbmV3IEltcHVsc2VEYXRhQnVmZmVyKCksXG4gICAgICBuZXcgSW1wdWxzZURhdGFCdWZmZXIoKSxcbiAgICAgIG5ldyBJbXB1bHNlRGF0YUJ1ZmZlcigpLFxuICAgICAgbmV3IEltcHVsc2VEYXRhQnVmZmVyKClcblxuICAgIF07XG5cbiAgICB0aGlzLnBvaW50cyA9IHRoaXMubWFuaWZvbGQucG9pbnRzO1xuICAgIHRoaXMuY29uc3RyYWludCA9IG5ldyBDb250YWN0Q29uc3RyYWludCh0aGlzLm1hbmlmb2xkKTtcblxuICB9XG5cbiAgT2JqZWN0LmFzc2lnbihDb250YWN0LnByb3RvdHlwZSwge1xuXG4gICAgQ29udGFjdDogdHJ1ZSxcblxuICAgIG1peFJlc3RpdHV0aW9uOiBmdW5jdGlvbiAocmVzdGl0dXRpb24xLCByZXN0aXR1dGlvbjIpIHtcblxuICAgICAgcmV0dXJuIF9NYXRoLnNxcnQocmVzdGl0dXRpb24xICogcmVzdGl0dXRpb24yKTtcblxuICAgIH0sXG4gICAgbWl4RnJpY3Rpb246IGZ1bmN0aW9uIChmcmljdGlvbjEsIGZyaWN0aW9uMikge1xuXG4gICAgICByZXR1cm4gX01hdGguc3FydChmcmljdGlvbjEgKiBmcmljdGlvbjIpO1xuXG4gICAgfSxcblxuICAgIC8qKlxuICAgICogVXBkYXRlIHRoZSBjb250YWN0IG1hbmlmb2xkLlxuICAgICovXG4gICAgdXBkYXRlTWFuaWZvbGQ6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgdGhpcy5jb25zdHJhaW50LnJlc3RpdHV0aW9uID0gdGhpcy5taXhSZXN0aXR1dGlvbih0aGlzLnNoYXBlMS5yZXN0aXR1dGlvbiwgdGhpcy5zaGFwZTIucmVzdGl0dXRpb24pO1xuICAgICAgdGhpcy5jb25zdHJhaW50LmZyaWN0aW9uID0gdGhpcy5taXhGcmljdGlvbih0aGlzLnNoYXBlMS5mcmljdGlvbiwgdGhpcy5zaGFwZTIuZnJpY3Rpb24pO1xuICAgICAgdmFyIG51bUJ1ZmZlcnMgPSB0aGlzLm1hbmlmb2xkLm51bVBvaW50cztcbiAgICAgIHZhciBpID0gbnVtQnVmZmVycztcbiAgICAgIHdoaWxlIChpLS0pIHtcbiAgICAgICAgLy9mb3IodmFyIGk9MDtpPG51bUJ1ZmZlcnM7aSsrKXtcbiAgICAgICAgdmFyIGIgPSB0aGlzLmJ1ZmZlcltpXTtcbiAgICAgICAgdmFyIHAgPSB0aGlzLnBvaW50c1tpXTtcbiAgICAgICAgYi5scDFYID0gcC5sb2NhbFBvaW50MS54O1xuICAgICAgICBiLmxwMVkgPSBwLmxvY2FsUG9pbnQxLnk7XG4gICAgICAgIGIubHAxWiA9IHAubG9jYWxQb2ludDEuejtcbiAgICAgICAgYi5scDJYID0gcC5sb2NhbFBvaW50Mi54O1xuICAgICAgICBiLmxwMlkgPSBwLmxvY2FsUG9pbnQyLnk7XG4gICAgICAgIGIubHAyWiA9IHAubG9jYWxQb2ludDIuejtcbiAgICAgICAgYi5pbXB1bHNlID0gcC5ub3JtYWxJbXB1bHNlO1xuICAgICAgfVxuICAgICAgdGhpcy5tYW5pZm9sZC5udW1Qb2ludHMgPSAwO1xuICAgICAgdGhpcy5kZXRlY3Rvci5kZXRlY3RDb2xsaXNpb24odGhpcy5zaGFwZTEsIHRoaXMuc2hhcGUyLCB0aGlzLm1hbmlmb2xkKTtcbiAgICAgIHZhciBudW0gPSB0aGlzLm1hbmlmb2xkLm51bVBvaW50cztcbiAgICAgIGlmIChudW0gPT0gMCkge1xuICAgICAgICB0aGlzLnRvdWNoaW5nID0gZmFsc2U7XG4gICAgICAgIHRoaXMuY2xvc2UgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5kaXN0ID0gX01hdGguSU5GO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLnRvdWNoaW5nIHx8IHRoaXMuZGlzdCA8IDAuMDAxKSB0aGlzLmNsb3NlID0gdHJ1ZTtcbiAgICAgIHRoaXMudG91Y2hpbmcgPSB0cnVlO1xuICAgICAgaSA9IG51bTtcbiAgICAgIHdoaWxlIChpLS0pIHtcbiAgICAgICAgLy9mb3IoaT0wOyBpPG51bTsgaSsrKXtcbiAgICAgICAgcCA9IHRoaXMucG9pbnRzW2ldO1xuICAgICAgICB2YXIgbHAxeCA9IHAubG9jYWxQb2ludDEueDtcbiAgICAgICAgdmFyIGxwMXkgPSBwLmxvY2FsUG9pbnQxLnk7XG4gICAgICAgIHZhciBscDF6ID0gcC5sb2NhbFBvaW50MS56O1xuICAgICAgICB2YXIgbHAyeCA9IHAubG9jYWxQb2ludDIueDtcbiAgICAgICAgdmFyIGxwMnkgPSBwLmxvY2FsUG9pbnQyLnk7XG4gICAgICAgIHZhciBscDJ6ID0gcC5sb2NhbFBvaW50Mi56O1xuICAgICAgICB2YXIgaW5kZXggPSAtMTtcbiAgICAgICAgdmFyIG1pbkRpc3RhbmNlID0gMC4wMDA0O1xuICAgICAgICB2YXIgaiA9IG51bUJ1ZmZlcnM7XG4gICAgICAgIHdoaWxlIChqLS0pIHtcbiAgICAgICAgICAvL2Zvcih2YXIgaj0wO2o8bnVtQnVmZmVycztqKyspe1xuICAgICAgICAgIGIgPSB0aGlzLmJ1ZmZlcltqXTtcbiAgICAgICAgICB2YXIgZHggPSBiLmxwMVggLSBscDF4O1xuICAgICAgICAgIHZhciBkeSA9IGIubHAxWSAtIGxwMXk7XG4gICAgICAgICAgdmFyIGR6ID0gYi5scDFaIC0gbHAxejtcbiAgICAgICAgICB2YXIgZGlzdGFuY2UxID0gZHggKiBkeCArIGR5ICogZHkgKyBkeiAqIGR6O1xuICAgICAgICAgIGR4ID0gYi5scDJYIC0gbHAyeDtcbiAgICAgICAgICBkeSA9IGIubHAyWSAtIGxwMnk7XG4gICAgICAgICAgZHogPSBiLmxwMlogLSBscDJ6O1xuICAgICAgICAgIHZhciBkaXN0YW5jZTIgPSBkeCAqIGR4ICsgZHkgKiBkeSArIGR6ICogZHo7XG4gICAgICAgICAgaWYgKGRpc3RhbmNlMSA8IGRpc3RhbmNlMikge1xuICAgICAgICAgICAgaWYgKGRpc3RhbmNlMSA8IG1pbkRpc3RhbmNlKSB7XG4gICAgICAgICAgICAgIG1pbkRpc3RhbmNlID0gZGlzdGFuY2UxO1xuICAgICAgICAgICAgICBpbmRleCA9IGo7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChkaXN0YW5jZTIgPCBtaW5EaXN0YW5jZSkge1xuICAgICAgICAgICAgICBtaW5EaXN0YW5jZSA9IGRpc3RhbmNlMjtcbiAgICAgICAgICAgICAgaW5kZXggPSBqO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChtaW5EaXN0YW5jZSA8IHRoaXMuZGlzdCkgdGhpcy5kaXN0ID0gbWluRGlzdGFuY2U7XG5cbiAgICAgICAgfVxuICAgICAgICBpZiAoaW5kZXggIT0gLTEpIHtcbiAgICAgICAgICB2YXIgdG1wID0gdGhpcy5idWZmZXJbaW5kZXhdO1xuICAgICAgICAgIHRoaXMuYnVmZmVyW2luZGV4XSA9IHRoaXMuYnVmZmVyWy0tbnVtQnVmZmVyc107XG4gICAgICAgICAgdGhpcy5idWZmZXJbbnVtQnVmZmVyc10gPSB0bXA7XG4gICAgICAgICAgcC5ub3JtYWxJbXB1bHNlID0gdG1wLmltcHVsc2U7XG4gICAgICAgICAgcC53YXJtU3RhcnRlZCA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcC5ub3JtYWxJbXB1bHNlID0gMDtcbiAgICAgICAgICBwLndhcm1TdGFydGVkID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIC8qKlxuICAgICogQXR0YWNoIHRoZSBjb250YWN0IHRvIHRoZSBzaGFwZXMuXG4gICAgKiBAcGFyYW0gICBzaGFwZTFcbiAgICAqIEBwYXJhbSAgIHNoYXBlMlxuICAgICovXG4gICAgYXR0YWNoOiBmdW5jdGlvbiAoc2hhcGUxLCBzaGFwZTIpIHtcbiAgICAgIHRoaXMuc2hhcGUxID0gc2hhcGUxO1xuICAgICAgdGhpcy5zaGFwZTIgPSBzaGFwZTI7XG4gICAgICB0aGlzLmJvZHkxID0gc2hhcGUxLnBhcmVudDtcbiAgICAgIHRoaXMuYm9keTIgPSBzaGFwZTIucGFyZW50O1xuXG4gICAgICB0aGlzLm1hbmlmb2xkLmJvZHkxID0gdGhpcy5ib2R5MTtcbiAgICAgIHRoaXMubWFuaWZvbGQuYm9keTIgPSB0aGlzLmJvZHkyO1xuICAgICAgdGhpcy5jb25zdHJhaW50LmJvZHkxID0gdGhpcy5ib2R5MTtcbiAgICAgIHRoaXMuY29uc3RyYWludC5ib2R5MiA9IHRoaXMuYm9keTI7XG4gICAgICB0aGlzLmNvbnN0cmFpbnQuYXR0YWNoKCk7XG5cbiAgICAgIHRoaXMuczFMaW5rLnNoYXBlID0gc2hhcGUyO1xuICAgICAgdGhpcy5zMUxpbmsuYm9keSA9IHRoaXMuYm9keTI7XG4gICAgICB0aGlzLnMyTGluay5zaGFwZSA9IHNoYXBlMTtcbiAgICAgIHRoaXMuczJMaW5rLmJvZHkgPSB0aGlzLmJvZHkxO1xuXG4gICAgICBpZiAoc2hhcGUxLmNvbnRhY3RMaW5rICE9IG51bGwpICh0aGlzLnMxTGluay5uZXh0ID0gc2hhcGUxLmNvbnRhY3RMaW5rKS5wcmV2ID0gdGhpcy5zMUxpbms7XG4gICAgICBlbHNlIHRoaXMuczFMaW5rLm5leHQgPSBudWxsO1xuICAgICAgc2hhcGUxLmNvbnRhY3RMaW5rID0gdGhpcy5zMUxpbms7XG4gICAgICBzaGFwZTEubnVtQ29udGFjdHMrKztcblxuICAgICAgaWYgKHNoYXBlMi5jb250YWN0TGluayAhPSBudWxsKSAodGhpcy5zMkxpbmsubmV4dCA9IHNoYXBlMi5jb250YWN0TGluaykucHJldiA9IHRoaXMuczJMaW5rO1xuICAgICAgZWxzZSB0aGlzLnMyTGluay5uZXh0ID0gbnVsbDtcbiAgICAgIHNoYXBlMi5jb250YWN0TGluayA9IHRoaXMuczJMaW5rO1xuICAgICAgc2hhcGUyLm51bUNvbnRhY3RzKys7XG5cbiAgICAgIHRoaXMuYjFMaW5rLnNoYXBlID0gc2hhcGUyO1xuICAgICAgdGhpcy5iMUxpbmsuYm9keSA9IHRoaXMuYm9keTI7XG4gICAgICB0aGlzLmIyTGluay5zaGFwZSA9IHNoYXBlMTtcbiAgICAgIHRoaXMuYjJMaW5rLmJvZHkgPSB0aGlzLmJvZHkxO1xuXG4gICAgICBpZiAodGhpcy5ib2R5MS5jb250YWN0TGluayAhPSBudWxsKSAodGhpcy5iMUxpbmsubmV4dCA9IHRoaXMuYm9keTEuY29udGFjdExpbmspLnByZXYgPSB0aGlzLmIxTGluaztcbiAgICAgIGVsc2UgdGhpcy5iMUxpbmsubmV4dCA9IG51bGw7XG4gICAgICB0aGlzLmJvZHkxLmNvbnRhY3RMaW5rID0gdGhpcy5iMUxpbms7XG4gICAgICB0aGlzLmJvZHkxLm51bUNvbnRhY3RzKys7XG5cbiAgICAgIGlmICh0aGlzLmJvZHkyLmNvbnRhY3RMaW5rICE9IG51bGwpICh0aGlzLmIyTGluay5uZXh0ID0gdGhpcy5ib2R5Mi5jb250YWN0TGluaykucHJldiA9IHRoaXMuYjJMaW5rO1xuICAgICAgZWxzZSB0aGlzLmIyTGluay5uZXh0ID0gbnVsbDtcbiAgICAgIHRoaXMuYm9keTIuY29udGFjdExpbmsgPSB0aGlzLmIyTGluaztcbiAgICAgIHRoaXMuYm9keTIubnVtQ29udGFjdHMrKztcblxuICAgICAgdGhpcy5wcmV2ID0gbnVsbDtcbiAgICAgIHRoaXMubmV4dCA9IG51bGw7XG5cbiAgICAgIHRoaXMucGVyc2lzdGluZyA9IHRydWU7XG4gICAgICB0aGlzLnNsZWVwaW5nID0gdGhpcy5ib2R5MS5zbGVlcGluZyAmJiB0aGlzLmJvZHkyLnNsZWVwaW5nO1xuICAgICAgdGhpcy5tYW5pZm9sZC5udW1Qb2ludHMgPSAwO1xuICAgIH0sXG4gICAgLyoqXG4gICAgKiBEZXRhY2ggdGhlIGNvbnRhY3QgZnJvbSB0aGUgc2hhcGVzLlxuICAgICovXG4gICAgZGV0YWNoOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgcHJldiA9IHRoaXMuczFMaW5rLnByZXY7XG4gICAgICB2YXIgbmV4dCA9IHRoaXMuczFMaW5rLm5leHQ7XG4gICAgICBpZiAocHJldiAhPT0gbnVsbCkgcHJldi5uZXh0ID0gbmV4dDtcbiAgICAgIGlmIChuZXh0ICE9PSBudWxsKSBuZXh0LnByZXYgPSBwcmV2O1xuICAgICAgaWYgKHRoaXMuc2hhcGUxLmNvbnRhY3RMaW5rID09IHRoaXMuczFMaW5rKSB0aGlzLnNoYXBlMS5jb250YWN0TGluayA9IG5leHQ7XG4gICAgICB0aGlzLnMxTGluay5wcmV2ID0gbnVsbDtcbiAgICAgIHRoaXMuczFMaW5rLm5leHQgPSBudWxsO1xuICAgICAgdGhpcy5zMUxpbmsuc2hhcGUgPSBudWxsO1xuICAgICAgdGhpcy5zMUxpbmsuYm9keSA9IG51bGw7XG4gICAgICB0aGlzLnNoYXBlMS5udW1Db250YWN0cy0tO1xuXG4gICAgICBwcmV2ID0gdGhpcy5zMkxpbmsucHJldjtcbiAgICAgIG5leHQgPSB0aGlzLnMyTGluay5uZXh0O1xuICAgICAgaWYgKHByZXYgIT09IG51bGwpIHByZXYubmV4dCA9IG5leHQ7XG4gICAgICBpZiAobmV4dCAhPT0gbnVsbCkgbmV4dC5wcmV2ID0gcHJldjtcbiAgICAgIGlmICh0aGlzLnNoYXBlMi5jb250YWN0TGluayA9PSB0aGlzLnMyTGluaykgdGhpcy5zaGFwZTIuY29udGFjdExpbmsgPSBuZXh0O1xuICAgICAgdGhpcy5zMkxpbmsucHJldiA9IG51bGw7XG4gICAgICB0aGlzLnMyTGluay5uZXh0ID0gbnVsbDtcbiAgICAgIHRoaXMuczJMaW5rLnNoYXBlID0gbnVsbDtcbiAgICAgIHRoaXMuczJMaW5rLmJvZHkgPSBudWxsO1xuICAgICAgdGhpcy5zaGFwZTIubnVtQ29udGFjdHMtLTtcblxuICAgICAgcHJldiA9IHRoaXMuYjFMaW5rLnByZXY7XG4gICAgICBuZXh0ID0gdGhpcy5iMUxpbmsubmV4dDtcbiAgICAgIGlmIChwcmV2ICE9PSBudWxsKSBwcmV2Lm5leHQgPSBuZXh0O1xuICAgICAgaWYgKG5leHQgIT09IG51bGwpIG5leHQucHJldiA9IHByZXY7XG4gICAgICBpZiAodGhpcy5ib2R5MS5jb250YWN0TGluayA9PSB0aGlzLmIxTGluaykgdGhpcy5ib2R5MS5jb250YWN0TGluayA9IG5leHQ7XG4gICAgICB0aGlzLmIxTGluay5wcmV2ID0gbnVsbDtcbiAgICAgIHRoaXMuYjFMaW5rLm5leHQgPSBudWxsO1xuICAgICAgdGhpcy5iMUxpbmsuc2hhcGUgPSBudWxsO1xuICAgICAgdGhpcy5iMUxpbmsuYm9keSA9IG51bGw7XG4gICAgICB0aGlzLmJvZHkxLm51bUNvbnRhY3RzLS07XG5cbiAgICAgIHByZXYgPSB0aGlzLmIyTGluay5wcmV2O1xuICAgICAgbmV4dCA9IHRoaXMuYjJMaW5rLm5leHQ7XG4gICAgICBpZiAocHJldiAhPT0gbnVsbCkgcHJldi5uZXh0ID0gbmV4dDtcbiAgICAgIGlmIChuZXh0ICE9PSBudWxsKSBuZXh0LnByZXYgPSBwcmV2O1xuICAgICAgaWYgKHRoaXMuYm9keTIuY29udGFjdExpbmsgPT0gdGhpcy5iMkxpbmspIHRoaXMuYm9keTIuY29udGFjdExpbmsgPSBuZXh0O1xuICAgICAgdGhpcy5iMkxpbmsucHJldiA9IG51bGw7XG4gICAgICB0aGlzLmIyTGluay5uZXh0ID0gbnVsbDtcbiAgICAgIHRoaXMuYjJMaW5rLnNoYXBlID0gbnVsbDtcbiAgICAgIHRoaXMuYjJMaW5rLmJvZHkgPSBudWxsO1xuICAgICAgdGhpcy5ib2R5Mi5udW1Db250YWN0cy0tO1xuXG4gICAgICB0aGlzLm1hbmlmb2xkLmJvZHkxID0gbnVsbDtcbiAgICAgIHRoaXMubWFuaWZvbGQuYm9keTIgPSBudWxsO1xuICAgICAgdGhpcy5jb25zdHJhaW50LmJvZHkxID0gbnVsbDtcbiAgICAgIHRoaXMuY29uc3RyYWludC5ib2R5MiA9IG51bGw7XG4gICAgICB0aGlzLmNvbnN0cmFpbnQuZGV0YWNoKCk7XG5cbiAgICAgIHRoaXMuc2hhcGUxID0gbnVsbDtcbiAgICAgIHRoaXMuc2hhcGUyID0gbnVsbDtcbiAgICAgIHRoaXMuYm9keTEgPSBudWxsO1xuICAgICAgdGhpcy5ib2R5MiA9IG51bGw7XG4gICAgfVxuXG4gIH0pO1xuXG4gIC8qKlxuICAqIFRoZSBjbGFzcyBvZiByaWdpZCBib2R5LlxuICAqIFJpZ2lkIGJvZHkgaGFzIHRoZSBzaGFwZSBvZiBhIHNpbmdsZSBvciBtdWx0aXBsZSBjb2xsaXNpb24gcHJvY2Vzc2luZyxcbiAgKiBJIGNhbiBzZXQgdGhlIHBhcmFtZXRlcnMgaW5kaXZpZHVhbGx5LlxuICAqIEBhdXRob3Igc2FoYXJhblxuICAqIEBhdXRob3IgbG8tdGhcbiAgKi9cblxuICBmdW5jdGlvbiBSaWdpZEJvZHkoUG9zaXRpb24sIFJvdGF0aW9uKSB7XG5cbiAgICB0aGlzLnBvc2l0aW9uID0gUG9zaXRpb24gfHwgbmV3IFZlYzMoKTtcbiAgICB0aGlzLm9yaWVudGF0aW9uID0gUm90YXRpb24gfHwgbmV3IFF1YXQoKTtcblxuICAgIHRoaXMuc2NhbGUgPSAxO1xuICAgIHRoaXMuaW52U2NhbGUgPSAxO1xuXG4gICAgLy8gcG9zc2libGUgbGluayB0byB0aHJlZSBNZXNoO1xuICAgIHRoaXMubWVzaCA9IG51bGw7XG5cbiAgICB0aGlzLmlkID0gTmFOO1xuICAgIHRoaXMubmFtZSA9IFwiXCI7XG4gICAgLy8gVGhlIG1heGltdW0gbnVtYmVyIG9mIHNoYXBlcyB0aGF0IGNhbiBiZSBhZGRlZCB0byBhIG9uZSByaWdpZC5cbiAgICAvL3RoaXMuTUFYX1NIQVBFUyA9IDY0Oy8vNjQ7XG5cbiAgICB0aGlzLnByZXYgPSBudWxsO1xuICAgIHRoaXMubmV4dCA9IG51bGw7XG5cbiAgICAvLyBJIHJlcHJlc2VudCB0aGUga2luZCBvZiByaWdpZCBib2R5LlxuICAgIC8vIFBsZWFzZSBkbyBub3QgY2hhbmdlIGZyb20gdGhlIG91dHNpZGUgdGhpcyB2YXJpYWJsZS5cbiAgICAvLyBJZiB5b3Ugd2FudCB0byBjaGFuZ2UgdGhlIHR5cGUgb2YgcmlnaWQgYm9keSwgYWx3YXlzXG4gICAgLy8gUGxlYXNlIHNwZWNpZnkgdGhlIHR5cGUgeW91IHdhbnQgdG8gc2V0IHRoZSBhcmd1bWVudHMgb2Ygc2V0dXBNYXNzIG1ldGhvZC5cbiAgICB0aGlzLnR5cGUgPSBCT0RZX05VTEw7XG5cbiAgICB0aGlzLm1hc3NJbmZvID0gbmV3IE1hc3NJbmZvKCk7XG5cbiAgICB0aGlzLm5ld1Bvc2l0aW9uID0gbmV3IFZlYzMoKTtcbiAgICB0aGlzLmNvbnRyb2xQb3MgPSBmYWxzZTtcbiAgICB0aGlzLm5ld09yaWVudGF0aW9uID0gbmV3IFF1YXQoKTtcbiAgICB0aGlzLm5ld1JvdGF0aW9uID0gbmV3IFZlYzMoKTtcbiAgICB0aGlzLmN1cnJlbnRSb3RhdGlvbiA9IG5ldyBWZWMzKCk7XG4gICAgdGhpcy5jb250cm9sUm90ID0gZmFsc2U7XG4gICAgdGhpcy5jb250cm9sUm90SW5UaW1lID0gZmFsc2U7XG5cbiAgICB0aGlzLnF1YXRlcm5pb24gPSBuZXcgUXVhdCgpO1xuICAgIHRoaXMucG9zID0gbmV3IFZlYzMoKTtcblxuXG5cbiAgICAvLyBJcyB0aGUgdHJhbnNsYXRpb25hbCB2ZWxvY2l0eS5cbiAgICB0aGlzLmxpbmVhclZlbG9jaXR5ID0gbmV3IFZlYzMoKTtcbiAgICAvLyBJcyB0aGUgYW5ndWxhciB2ZWxvY2l0eS5cbiAgICB0aGlzLmFuZ3VsYXJWZWxvY2l0eSA9IG5ldyBWZWMzKCk7XG5cbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gIFBsZWFzZSBkbyBub3QgY2hhbmdlIGZyb20gdGhlIG91dHNpZGUgdGhpcyB2YXJpYWJsZXMuXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICAgLy8gSXQgaXMgYSB3b3JsZCB0aGF0IHJpZ2lkIGJvZHkgaGFzIGJlZW4gYWRkZWQuXG4gICAgdGhpcy5wYXJlbnQgPSBudWxsO1xuICAgIHRoaXMuY29udGFjdExpbmsgPSBudWxsO1xuICAgIHRoaXMubnVtQ29udGFjdHMgPSAwO1xuXG4gICAgLy8gQW4gYXJyYXkgb2Ygc2hhcGVzIHRoYXQgYXJlIGluY2x1ZGVkIGluIHRoZSByaWdpZCBib2R5LlxuICAgIHRoaXMuc2hhcGVzID0gbnVsbDtcbiAgICAvLyBUaGUgbnVtYmVyIG9mIHNoYXBlcyB0aGF0IGFyZSBpbmNsdWRlZCBpbiB0aGUgcmlnaWQgYm9keS5cbiAgICB0aGlzLm51bVNoYXBlcyA9IDA7XG5cbiAgICAvLyBJdCBpcyB0aGUgbGluayBhcnJheSBvZiBqb2ludCB0aGF0IGlzIGNvbm5lY3RlZCB0byB0aGUgcmlnaWQgYm9keS5cbiAgICB0aGlzLmpvaW50TGluayA9IG51bGw7XG4gICAgLy8gVGhlIG51bWJlciBvZiBqb2ludHMgdGhhdCBhcmUgY29ubmVjdGVkIHRvIHRoZSByaWdpZCBib2R5LlxuICAgIHRoaXMubnVtSm9pbnRzID0gMDtcblxuICAgIC8vIEl0IGlzIHRoZSB3b3JsZCBjb29yZGluYXRlIG9mIHRoZSBjZW50ZXIgb2YgZ3Jhdml0eSBpbiB0aGUgc2xlZXAganVzdCBiZWZvcmUuXG4gICAgdGhpcy5zbGVlcFBvc2l0aW9uID0gbmV3IFZlYzMoKTtcbiAgICAvLyBJdCBpcyBhIHF1YXRlcm5pb24gdGhhdCByZXByZXNlbnRzIHRoZSBhdHRpdHVkZSBvZiBzbGVlcCBqdXN0IGJlZm9yZS5cbiAgICB0aGlzLnNsZWVwT3JpZW50YXRpb24gPSBuZXcgUXVhdCgpO1xuICAgIC8vIEkgd2lsbCBzaG93IHRoaXMgcmlnaWQgYm9keSB0byBkZXRlcm1pbmUgd2hldGhlciBpdCBpcyBhIHJpZ2lkIGJvZHkgc3RhdGljLlxuICAgIHRoaXMuaXNTdGF0aWMgPSBmYWxzZTtcbiAgICAvLyBJIGluZGljYXRlcyB0aGF0IHRoaXMgcmlnaWQgYm9keSB0byBkZXRlcm1pbmUgd2hldGhlciBpdCBpcyBhIHJpZ2lkIGJvZHkgZHluYW1pYy5cbiAgICB0aGlzLmlzRHluYW1pYyA9IGZhbHNlO1xuXG4gICAgdGhpcy5pc0tpbmVtYXRpYyA9IGZhbHNlO1xuXG4gICAgLy8gSXQgaXMgYSByb3RhdGlvbiBtYXRyaXggcmVwcmVzZW50aW5nIHRoZSBvcmllbnRhdGlvbi5cbiAgICB0aGlzLnJvdGF0aW9uID0gbmV3IE1hdDMzKCk7XG5cbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gSXQgd2lsbCBiZSByZWNhbGN1bGF0ZWQgYXV0b21hdGljYWxseSBmcm9tIHRoZSBzaGFwZSwgd2hpY2ggaXMgaW5jbHVkZWQuXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICAgLy8gVGhpcyBpcyB0aGUgd2VpZ2h0LlxuICAgIHRoaXMubWFzcyA9IDA7XG4gICAgLy8gSXQgaXMgdGhlIHJlY2lwcm9jYWwgb2YgdGhlIG1hc3MuXG4gICAgdGhpcy5pbnZlcnNlTWFzcyA9IDA7XG4gICAgLy8gSXQgaXMgdGhlIGludmVyc2Ugb2YgdGhlIGluZXJ0aWEgdGVuc29yIGluIHRoZSB3b3JsZCBzeXN0ZW0uXG4gICAgdGhpcy5pbnZlcnNlSW5lcnRpYSA9IG5ldyBNYXQzMygpO1xuICAgIC8vIEl0IGlzIHRoZSBpbmVydGlhIHRlbnNvciBpbiB0aGUgaW5pdGlhbCBzdGF0ZS5cbiAgICB0aGlzLmxvY2FsSW5lcnRpYSA9IG5ldyBNYXQzMygpO1xuICAgIC8vIEl0IGlzIHRoZSBpbnZlcnNlIG9mIHRoZSBpbmVydGlhIHRlbnNvciBpbiB0aGUgaW5pdGlhbCBzdGF0ZS5cbiAgICB0aGlzLmludmVyc2VMb2NhbEluZXJ0aWEgPSBuZXcgTWF0MzMoKTtcblxuICAgIHRoaXMudG1wSW5lcnRpYSA9IG5ldyBNYXQzMygpO1xuXG5cbiAgICAvLyBJIGluZGljYXRlcyByaWdpZCBib2R5IHdoZXRoZXIgaXQgaGFzIGJlZW4gYWRkZWQgdG8gdGhlIHNpbXVsYXRpb24gSXNsYW5kLlxuICAgIHRoaXMuYWRkZWRUb0lzbGFuZCA9IGZhbHNlO1xuICAgIC8vIEl0IHNob3dzIGhvdyB0byBzbGVlcCByaWdpZCBib2R5LlxuICAgIHRoaXMuYWxsb3dTbGVlcCA9IHRydWU7XG4gICAgLy8gVGhpcyBpcyB0aGUgdGltZSBmcm9tIHdoZW4gdGhlIHJpZ2lkIGJvZHkgYXQgcmVzdC5cbiAgICB0aGlzLnNsZWVwVGltZSA9IDA7XG4gICAgLy8gSSBzaG93cyByaWdpZCBib2R5IHRvIGRldGVybWluZSB3aGV0aGVyIGl0IGlzIGEgc2xlZXAgc3RhdGUuXG4gICAgdGhpcy5zbGVlcGluZyA9IGZhbHNlO1xuXG4gIH1cblxuICBPYmplY3QuYXNzaWduKFJpZ2lkQm9keS5wcm90b3R5cGUsIHtcblxuICAgIHNldFBhcmVudDogZnVuY3Rpb24gKHdvcmxkKSB7XG5cbiAgICAgIHRoaXMucGFyZW50ID0gd29ybGQ7XG4gICAgICB0aGlzLnNjYWxlID0gdGhpcy5wYXJlbnQuc2NhbGU7XG4gICAgICB0aGlzLmludlNjYWxlID0gdGhpcy5wYXJlbnQuaW52U2NhbGU7XG4gICAgICB0aGlzLmlkID0gdGhpcy5wYXJlbnQubnVtUmlnaWRCb2RpZXM7XG4gICAgICBpZiAoIXRoaXMubmFtZSkgdGhpcy5uYW1lID0gdGhpcy5pZDtcblxuICAgICAgdGhpcy51cGRhdGVNZXNoKCk7XG5cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSSdsbCBhZGQgYSBzaGFwZSB0byByaWdpZCBib2R5LlxuICAgICAqIElmIHlvdSBhZGQgYSBzaGFwZSwgcGxlYXNlIGNhbGwgdGhlIHNldHVwTWFzcyBtZXRob2QgdG8gc3RlcCB1cCB0byB0aGUgc3RhcnQgb2YgdGhlIG5leHQuXG4gICAgICogQHBhcmFtICAgc2hhcGUgc2hhcGUgdG8gQWRkXG4gICAgICovXG4gICAgYWRkU2hhcGU6IGZ1bmN0aW9uIChzaGFwZSkge1xuXG4gICAgICBpZiAoc2hhcGUucGFyZW50KSB7XG4gICAgICAgIHByaW50RXJyb3IoXCJSaWdpZEJvZHlcIiwgXCJJdCBpcyBub3QgcG9zc2libGUgdGhhdCB5b3UgYWRkIGEgc2hhcGUgd2hpY2ggYWxyZWFkeSBoYXMgYW4gYXNzb2NpYXRlZCBib2R5LlwiKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuc2hhcGVzICE9IG51bGwpICh0aGlzLnNoYXBlcy5wcmV2ID0gc2hhcGUpLm5leHQgPSB0aGlzLnNoYXBlcztcbiAgICAgIHRoaXMuc2hhcGVzID0gc2hhcGU7XG4gICAgICBzaGFwZS5wYXJlbnQgPSB0aGlzO1xuICAgICAgaWYgKHRoaXMucGFyZW50KSB0aGlzLnBhcmVudC5hZGRTaGFwZShzaGFwZSk7XG4gICAgICB0aGlzLm51bVNoYXBlcysrO1xuXG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBJIHdpbGwgZGVsZXRlIHRoZSBzaGFwZSBmcm9tIHRoZSByaWdpZCBib2R5LlxuICAgICAqIElmIHlvdSBkZWxldGUgYSBzaGFwZSwgcGxlYXNlIGNhbGwgdGhlIHNldHVwTWFzcyBtZXRob2QgdG8gc3RlcCB1cCB0byB0aGUgc3RhcnQgb2YgdGhlIG5leHQuXG4gICAgICogQHBhcmFtIHNoYXBlIHtTaGFwZX0gdG8gZGVsZXRlXG4gICAgICogQHJldHVybiB2b2lkXG4gICAgICovXG4gICAgcmVtb3ZlU2hhcGU6IGZ1bmN0aW9uIChzaGFwZSkge1xuXG4gICAgICB2YXIgcmVtb3ZlID0gc2hhcGU7XG4gICAgICBpZiAocmVtb3ZlLnBhcmVudCAhPSB0aGlzKSByZXR1cm47XG4gICAgICB2YXIgcHJldiA9IHJlbW92ZS5wcmV2O1xuICAgICAgdmFyIG5leHQgPSByZW1vdmUubmV4dDtcbiAgICAgIGlmIChwcmV2ICE9IG51bGwpIHByZXYubmV4dCA9IG5leHQ7XG4gICAgICBpZiAobmV4dCAhPSBudWxsKSBuZXh0LnByZXYgPSBwcmV2O1xuICAgICAgaWYgKHRoaXMuc2hhcGVzID09IHJlbW92ZSkgdGhpcy5zaGFwZXMgPSBuZXh0O1xuICAgICAgcmVtb3ZlLnByZXYgPSBudWxsO1xuICAgICAgcmVtb3ZlLm5leHQgPSBudWxsO1xuICAgICAgcmVtb3ZlLnBhcmVudCA9IG51bGw7XG4gICAgICBpZiAodGhpcy5wYXJlbnQpIHRoaXMucGFyZW50LnJlbW92ZVNoYXBlKHJlbW92ZSk7XG4gICAgICB0aGlzLm51bVNoYXBlcy0tO1xuXG4gICAgfSxcblxuICAgIHJlbW92ZTogZnVuY3Rpb24gKCkge1xuXG4gICAgICB0aGlzLmRpc3Bvc2UoKTtcblxuICAgIH0sXG5cbiAgICBkaXNwb3NlOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHRoaXMucGFyZW50LnJlbW92ZVJpZ2lkQm9keSh0aGlzKTtcblxuICAgIH0sXG5cbiAgICBjaGVja0NvbnRhY3Q6IGZ1bmN0aW9uIChuYW1lKSB7XG5cbiAgICAgIHRoaXMucGFyZW50LmNoZWNrQ29udGFjdCh0aGlzLm5hbWUsIG5hbWUpO1xuXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENhbHVsYXRlcyBtYXNzIGRhdGFzKGNlbnRlciBvZiBncmF2aXR5LCBtYXNzLCBtb21lbnQgaW5lcnRpYSwgZXRjLi4uKS5cbiAgICAgKiBJZiB0aGUgcGFyYW1ldGVyIHR5cGUgaXMgc2V0IHRvIEJPRFlfU1RBVElDLCB0aGUgcmlnaWQgYm9keSB3aWxsIGJlIGZpeGVkIHRvIHRoZSBzcGFjZS5cbiAgICAgKiBJZiB0aGUgcGFyYW1ldGVyIGFkanVzdFBvc2l0aW9uIGlzIHNldCB0byB0cnVlLCB0aGUgc2hhcGVzJyByZWxhdGl2ZSBwb3NpdGlvbnMgYW5kXG4gICAgICogdGhlIHJpZ2lkIGJvZHkncyBwb3NpdGlvbiB3aWxsIGJlIGFkanVzdGVkIHRvIHRoZSBjZW50ZXIgb2YgZ3Jhdml0eS5cbiAgICAgKiBAcGFyYW0gdHlwZVxuICAgICAqIEBwYXJhbSBhZGp1c3RQb3NpdGlvblxuICAgICAqIEByZXR1cm4gdm9pZFxuICAgICAqL1xuICAgIHNldHVwTWFzczogZnVuY3Rpb24gKHR5cGUsIEFkanVzdFBvc2l0aW9uKSB7XG5cbiAgICAgIHZhciBhZGp1c3RQb3NpdGlvbiA9IChBZGp1c3RQb3NpdGlvbiAhPT0gdW5kZWZpbmVkKSA/IEFkanVzdFBvc2l0aW9uIDogdHJ1ZTtcblxuICAgICAgdGhpcy50eXBlID0gdHlwZSB8fCBCT0RZX1NUQVRJQztcbiAgICAgIHRoaXMuaXNEeW5hbWljID0gdGhpcy50eXBlID09PSBCT0RZX0RZTkFNSUM7XG4gICAgICB0aGlzLmlzU3RhdGljID0gdGhpcy50eXBlID09PSBCT0RZX1NUQVRJQztcblxuICAgICAgdGhpcy5tYXNzID0gMDtcbiAgICAgIHRoaXMubG9jYWxJbmVydGlhLnNldCgwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwKTtcblxuXG4gICAgICB2YXIgdG1wTSA9IG5ldyBNYXQzMygpO1xuICAgICAgdmFyIHRtcFYgPSBuZXcgVmVjMygpO1xuXG4gICAgICBmb3IgKHZhciBzaGFwZSA9IHRoaXMuc2hhcGVzOyBzaGFwZSAhPT0gbnVsbDsgc2hhcGUgPSBzaGFwZS5uZXh0KSB7XG5cbiAgICAgICAgc2hhcGUuY2FsY3VsYXRlTWFzc0luZm8odGhpcy5tYXNzSW5mbyk7XG4gICAgICAgIHZhciBzaGFwZU1hc3MgPSB0aGlzLm1hc3NJbmZvLm1hc3M7XG4gICAgICAgIHRtcFYuYWRkU2NhbGVkVmVjdG9yKHNoYXBlLnJlbGF0aXZlUG9zaXRpb24sIHNoYXBlTWFzcyk7XG4gICAgICAgIHRoaXMubWFzcyArPSBzaGFwZU1hc3M7XG4gICAgICAgIHRoaXMucm90YXRlSW5lcnRpYShzaGFwZS5yZWxhdGl2ZVJvdGF0aW9uLCB0aGlzLm1hc3NJbmZvLmluZXJ0aWEsIHRtcE0pO1xuICAgICAgICB0aGlzLmxvY2FsSW5lcnRpYS5hZGQodG1wTSk7XG5cbiAgICAgICAgLy8gYWRkIG9mZnNldCBpbmVydGlhXG4gICAgICAgIHRoaXMubG9jYWxJbmVydGlhLmFkZE9mZnNldChzaGFwZU1hc3MsIHNoYXBlLnJlbGF0aXZlUG9zaXRpb24pO1xuXG4gICAgICB9XG5cbiAgICAgIHRoaXMuaW52ZXJzZU1hc3MgPSAxIC8gdGhpcy5tYXNzO1xuICAgICAgdG1wVi5zY2FsZUVxdWFsKHRoaXMuaW52ZXJzZU1hc3MpO1xuXG4gICAgICBpZiAoYWRqdXN0UG9zaXRpb24pIHtcbiAgICAgICAgdGhpcy5wb3NpdGlvbi5hZGQodG1wVik7XG4gICAgICAgIGZvciAoc2hhcGUgPSB0aGlzLnNoYXBlczsgc2hhcGUgIT09IG51bGw7IHNoYXBlID0gc2hhcGUubmV4dCkge1xuICAgICAgICAgIHNoYXBlLnJlbGF0aXZlUG9zaXRpb24uc3ViRXF1YWwodG1wVik7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBzdWJ0cmFjdCBvZmZzZXQgaW5lcnRpYVxuICAgICAgICB0aGlzLmxvY2FsSW5lcnRpYS5zdWJPZmZzZXQodGhpcy5tYXNzLCB0bXBWKTtcblxuICAgICAgfVxuXG4gICAgICB0aGlzLmludmVyc2VMb2NhbEluZXJ0aWEuaW52ZXJ0KHRoaXMubG9jYWxJbmVydGlhKTtcblxuICAgICAgLy99XG5cbiAgICAgIGlmICh0aGlzLnR5cGUgPT09IEJPRFlfU1RBVElDKSB7XG4gICAgICAgIHRoaXMuaW52ZXJzZU1hc3MgPSAwO1xuICAgICAgICB0aGlzLmludmVyc2VMb2NhbEluZXJ0aWEuc2V0KDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDApO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnN5bmNTaGFwZXMoKTtcbiAgICAgIHRoaXMuYXdha2UoKTtcblxuICAgIH0sXG4gICAgLyoqXG4gICAgICogQXdha2UgdGhlIHJpZ2lkIGJvZHkuXG4gICAgICovXG4gICAgYXdha2U6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgaWYgKCF0aGlzLmFsbG93U2xlZXAgfHwgIXRoaXMuc2xlZXBpbmcpIHJldHVybjtcbiAgICAgIHRoaXMuc2xlZXBpbmcgPSBmYWxzZTtcbiAgICAgIHRoaXMuc2xlZXBUaW1lID0gMDtcbiAgICAgIC8vIGF3YWtlIGNvbm5lY3RlZCBjb25zdHJhaW50c1xuICAgICAgdmFyIGNzID0gdGhpcy5jb250YWN0TGluaztcbiAgICAgIHdoaWxlIChjcyAhPSBudWxsKSB7XG4gICAgICAgIGNzLmJvZHkuc2xlZXBUaW1lID0gMDtcbiAgICAgICAgY3MuYm9keS5zbGVlcGluZyA9IGZhbHNlO1xuICAgICAgICBjcyA9IGNzLm5leHQ7XG4gICAgICB9XG4gICAgICB2YXIganMgPSB0aGlzLmpvaW50TGluaztcbiAgICAgIHdoaWxlIChqcyAhPSBudWxsKSB7XG4gICAgICAgIGpzLmJvZHkuc2xlZXBUaW1lID0gMDtcbiAgICAgICAganMuYm9keS5zbGVlcGluZyA9IGZhbHNlO1xuICAgICAgICBqcyA9IGpzLm5leHQ7XG4gICAgICB9XG4gICAgICBmb3IgKHZhciBzaGFwZSA9IHRoaXMuc2hhcGVzOyBzaGFwZSAhPSBudWxsOyBzaGFwZSA9IHNoYXBlLm5leHQpIHtcbiAgICAgICAgc2hhcGUudXBkYXRlUHJveHkoKTtcbiAgICAgIH1cblxuICAgIH0sXG4gICAgLyoqXG4gICAgICogU2xlZXAgdGhlIHJpZ2lkIGJvZHkuXG4gICAgICovXG4gICAgc2xlZXA6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgaWYgKCF0aGlzLmFsbG93U2xlZXAgfHwgdGhpcy5zbGVlcGluZykgcmV0dXJuO1xuXG4gICAgICB0aGlzLmxpbmVhclZlbG9jaXR5LnNldCgwLCAwLCAwKTtcbiAgICAgIHRoaXMuYW5ndWxhclZlbG9jaXR5LnNldCgwLCAwLCAwKTtcbiAgICAgIHRoaXMuc2xlZXBQb3NpdGlvbi5jb3B5KHRoaXMucG9zaXRpb24pO1xuICAgICAgdGhpcy5zbGVlcE9yaWVudGF0aW9uLmNvcHkodGhpcy5vcmllbnRhdGlvbik7XG5cbiAgICAgIHRoaXMuc2xlZXBUaW1lID0gMDtcbiAgICAgIHRoaXMuc2xlZXBpbmcgPSB0cnVlO1xuICAgICAgZm9yICh2YXIgc2hhcGUgPSB0aGlzLnNoYXBlczsgc2hhcGUgIT0gbnVsbDsgc2hhcGUgPSBzaGFwZS5uZXh0KSB7XG4gICAgICAgIHNoYXBlLnVwZGF0ZVByb3h5KCk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHRlc3RXYWtlVXA6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgaWYgKHRoaXMubGluZWFyVmVsb2NpdHkudGVzdFplcm8oKSB8fCB0aGlzLmFuZ3VsYXJWZWxvY2l0eS50ZXN0WmVybygpIHx8IHRoaXMucG9zaXRpb24udGVzdERpZmYodGhpcy5zbGVlcFBvc2l0aW9uKSB8fCB0aGlzLm9yaWVudGF0aW9uLnRlc3REaWZmKHRoaXMuc2xlZXBPcmllbnRhdGlvbikpIHRoaXMuYXdha2UoKTsgLy8gYXdha2UgdGhlIGJvZHlcblxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgd2hldGhlciB0aGUgcmlnaWQgYm9keSBoYXMgbm90IGFueSBjb25uZWN0aW9uIHdpdGggb3RoZXJzLlxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgaXNMb25lbHk6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB0aGlzLm51bUpvaW50cyA9PSAwICYmIHRoaXMubnVtQ29udGFjdHMgPT0gMDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVGhlIHRpbWUgaW50ZWdyYXRpb24gb2YgdGhlIG1vdGlvbiBvZiBhIHJpZ2lkIGJvZHksIHlvdSBjYW4gdXBkYXRlIHRoZSBpbmZvcm1hdGlvbiBzdWNoIGFzIHRoZSBzaGFwZS5cbiAgICAgKiBUaGlzIG1ldGhvZCBpcyBpbnZva2VkIGF1dG9tYXRpY2FsbHkgd2hlbiBjYWxsaW5nIHRoZSBzdGVwIG9mIHRoZSBXb3JsZCxcbiAgICAgKiBUaGVyZSBpcyBubyBuZWVkIHRvIGNhbGwgZnJvbSBvdXRzaWRlIHVzdWFsbHkuXG4gICAgICogQHBhcmFtICB0aW1lU3RlcCB0aW1lXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cblxuICAgIHVwZGF0ZVBvc2l0aW9uOiBmdW5jdGlvbiAodGltZVN0ZXApIHtcbiAgICAgIHN3aXRjaCAodGhpcy50eXBlKSB7XG4gICAgICAgIGNhc2UgQk9EWV9TVEFUSUM6XG4gICAgICAgICAgdGhpcy5saW5lYXJWZWxvY2l0eS5zZXQoMCwgMCwgMCk7XG4gICAgICAgICAgdGhpcy5hbmd1bGFyVmVsb2NpdHkuc2V0KDAsIDAsIDApO1xuXG4gICAgICAgICAgLy8gT05MWSBGT1IgVEVTVFxuICAgICAgICAgIGlmICh0aGlzLmNvbnRyb2xQb3MpIHtcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24uY29weSh0aGlzLm5ld1Bvc2l0aW9uKTtcbiAgICAgICAgICAgIHRoaXMuY29udHJvbFBvcyA9IGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAodGhpcy5jb250cm9sUm90KSB7XG4gICAgICAgICAgICB0aGlzLm9yaWVudGF0aW9uLmNvcHkodGhpcy5uZXdPcmllbnRhdGlvbik7XG4gICAgICAgICAgICB0aGlzLmNvbnRyb2xSb3QgPSBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLyp0aGlzLmxpbmVhclZlbG9jaXR5Lng9MDtcbiAgICAgICAgICB0aGlzLmxpbmVhclZlbG9jaXR5Lnk9MDtcbiAgICAgICAgICB0aGlzLmxpbmVhclZlbG9jaXR5Lno9MDtcbiAgICAgICAgICB0aGlzLmFuZ3VsYXJWZWxvY2l0eS54PTA7XG4gICAgICAgICAgdGhpcy5hbmd1bGFyVmVsb2NpdHkueT0wO1xuICAgICAgICAgIHRoaXMuYW5ndWxhclZlbG9jaXR5Lno9MDsqL1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEJPRFlfRFlOQU1JQzpcblxuICAgICAgICAgIGlmICh0aGlzLmlzS2luZW1hdGljKSB7XG5cbiAgICAgICAgICAgIHRoaXMubGluZWFyVmVsb2NpdHkuc2V0KDAsIDAsIDApO1xuICAgICAgICAgICAgdGhpcy5hbmd1bGFyVmVsb2NpdHkuc2V0KDAsIDAsIDApO1xuXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHRoaXMuY29udHJvbFBvcykge1xuXG4gICAgICAgICAgICB0aGlzLmxpbmVhclZlbG9jaXR5LnN1YlZlY3RvcnModGhpcy5uZXdQb3NpdGlvbiwgdGhpcy5wb3NpdGlvbikubXVsdGlwbHlTY2FsYXIoMSAvIHRpbWVTdGVwKTtcbiAgICAgICAgICAgIHRoaXMuY29udHJvbFBvcyA9IGZhbHNlO1xuXG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICh0aGlzLmNvbnRyb2xSb3QpIHtcblxuICAgICAgICAgICAgdGhpcy5hbmd1bGFyVmVsb2NpdHkuY29weSh0aGlzLmdldEF4aXMoKSk7XG4gICAgICAgICAgICB0aGlzLm9yaWVudGF0aW9uLmNvcHkodGhpcy5uZXdPcmllbnRhdGlvbik7XG4gICAgICAgICAgICB0aGlzLmNvbnRyb2xSb3QgPSBmYWxzZTtcblxuICAgICAgICAgIH1cblxuICAgICAgICAgIHRoaXMucG9zaXRpb24uYWRkU2NhbGVkVmVjdG9yKHRoaXMubGluZWFyVmVsb2NpdHksIHRpbWVTdGVwKTtcbiAgICAgICAgICB0aGlzLm9yaWVudGF0aW9uLmFkZFRpbWUodGhpcy5hbmd1bGFyVmVsb2NpdHksIHRpbWVTdGVwKTtcblxuICAgICAgICAgIHRoaXMudXBkYXRlTWVzaCgpO1xuXG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6IHByaW50RXJyb3IoXCJSaWdpZEJvZHlcIiwgXCJJbnZhbGlkIHR5cGUuXCIpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnN5bmNTaGFwZXMoKTtcbiAgICAgIHRoaXMudXBkYXRlTWVzaCgpO1xuXG4gICAgfSxcblxuICAgIGdldEF4aXM6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgcmV0dXJuIG5ldyBWZWMzKDAsIDEsIDApLmFwcGx5TWF0cml4Myh0aGlzLmludmVyc2VMb2NhbEluZXJ0aWEsIHRydWUpLm5vcm1hbGl6ZSgpO1xuXG4gICAgfSxcblxuICAgIHJvdGF0ZUluZXJ0aWE6IGZ1bmN0aW9uIChyb3QsIGluZXJ0aWEsIG91dCkge1xuXG4gICAgICB0aGlzLnRtcEluZXJ0aWEubXVsdGlwbHlNYXRyaWNlcyhyb3QsIGluZXJ0aWEpO1xuICAgICAgb3V0Lm11bHRpcGx5TWF0cmljZXModGhpcy50bXBJbmVydGlhLCByb3QsIHRydWUpO1xuXG4gICAgfSxcblxuICAgIHN5bmNTaGFwZXM6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgdGhpcy5yb3RhdGlvbi5zZXRRdWF0KHRoaXMub3JpZW50YXRpb24pO1xuICAgICAgdGhpcy5yb3RhdGVJbmVydGlhKHRoaXMucm90YXRpb24sIHRoaXMuaW52ZXJzZUxvY2FsSW5lcnRpYSwgdGhpcy5pbnZlcnNlSW5lcnRpYSk7XG5cbiAgICAgIGZvciAodmFyIHNoYXBlID0gdGhpcy5zaGFwZXM7IHNoYXBlICE9IG51bGw7IHNoYXBlID0gc2hhcGUubmV4dCkge1xuXG4gICAgICAgIHNoYXBlLnBvc2l0aW9uLmNvcHkoc2hhcGUucmVsYXRpdmVQb3NpdGlvbikuYXBwbHlNYXRyaXgzKHRoaXMucm90YXRpb24sIHRydWUpLmFkZCh0aGlzLnBvc2l0aW9uKTtcbiAgICAgICAgLy8gYWRkIGJ5IFF1YXppS2JcbiAgICAgICAgc2hhcGUucm90YXRpb24ubXVsdGlwbHlNYXRyaWNlcyh0aGlzLnJvdGF0aW9uLCBzaGFwZS5yZWxhdGl2ZVJvdGF0aW9uKTtcbiAgICAgICAgc2hhcGUudXBkYXRlUHJveHkoKTtcbiAgICAgIH1cbiAgICB9LFxuXG5cbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIC8vIEFQUExZIElNUFVMU0UgRk9SQ0VcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICAgYXBwbHlJbXB1bHNlOiBmdW5jdGlvbiAocG9zaXRpb24sIGZvcmNlKSB7XG4gICAgICB0aGlzLmxpbmVhclZlbG9jaXR5LmFkZFNjYWxlZFZlY3Rvcihmb3JjZSwgdGhpcy5pbnZlcnNlTWFzcyk7XG4gICAgICB2YXIgcmVsID0gbmV3IFZlYzMoKS5jb3B5KHBvc2l0aW9uKS5zdWIodGhpcy5wb3NpdGlvbikuY3Jvc3MoZm9yY2UpLmFwcGx5TWF0cml4Myh0aGlzLmludmVyc2VJbmVydGlhLCB0cnVlKTtcbiAgICAgIHRoaXMuYW5ndWxhclZlbG9jaXR5LmFkZChyZWwpO1xuICAgIH0sXG5cblxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gU0VUIERZTkFNSVFVRSBQT1NJVElPTiBBTkQgUk9UQVRJT05cbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICAgc2V0UG9zaXRpb246IGZ1bmN0aW9uIChwb3MpIHtcbiAgICAgIHRoaXMubmV3UG9zaXRpb24uY29weShwb3MpLm11bHRpcGx5U2NhbGFyKHRoaXMuaW52U2NhbGUpO1xuICAgICAgdGhpcy5jb250cm9sUG9zID0gdHJ1ZTtcbiAgICAgIGlmICghdGhpcy5pc0tpbmVtYXRpYykgdGhpcy5pc0tpbmVtYXRpYyA9IHRydWU7XG4gICAgfSxcblxuICAgIHNldFF1YXRlcm5pb246IGZ1bmN0aW9uIChxKSB7XG4gICAgICB0aGlzLm5ld09yaWVudGF0aW9uLnNldChxLngsIHEueSwgcS56LCBxLncpO1xuICAgICAgdGhpcy5jb250cm9sUm90ID0gdHJ1ZTtcbiAgICAgIGlmICghdGhpcy5pc0tpbmVtYXRpYykgdGhpcy5pc0tpbmVtYXRpYyA9IHRydWU7XG4gICAgfSxcblxuICAgIHNldFJvdGF0aW9uOiBmdW5jdGlvbiAocm90KSB7XG5cbiAgICAgIHRoaXMubmV3T3JpZW50YXRpb24gPSBuZXcgUXVhdCgpLnNldEZyb21FdWxlcihyb3QueCAqIF9NYXRoLmRlZ3RvcmFkLCByb3QueSAqIF9NYXRoLmRlZ3RvcmFkLCByb3QueiAqIF9NYXRoLmRlZ3RvcmFkKTsvL3RoaXMucm90YXRpb25WZWN0VG9RdWFkKCByb3QgKTtcbiAgICAgIHRoaXMuY29udHJvbFJvdCA9IHRydWU7XG5cbiAgICB9LFxuXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAvLyBSRVNFVCBEWU5BTUlRVUUgUE9TSVRJT04gQU5EIFJPVEFUSU9OXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAgIHJlc2V0UG9zaXRpb246IGZ1bmN0aW9uICh4LCB5LCB6KSB7XG5cbiAgICAgIHRoaXMubGluZWFyVmVsb2NpdHkuc2V0KDAsIDAsIDApO1xuICAgICAgdGhpcy5hbmd1bGFyVmVsb2NpdHkuc2V0KDAsIDAsIDApO1xuICAgICAgdGhpcy5wb3NpdGlvbi5zZXQoeCwgeSwgeikubXVsdGlwbHlTY2FsYXIodGhpcy5pbnZTY2FsZSk7XG4gICAgICAvL3RoaXMucG9zaXRpb24uc2V0KCB4Kk9JTU8uV29ybGRTY2FsZS5pbnZTY2FsZSwgeSpPSU1PLldvcmxkU2NhbGUuaW52U2NhbGUsIHoqT0lNTy5Xb3JsZFNjYWxlLmludlNjYWxlICk7XG4gICAgICB0aGlzLmF3YWtlKCk7XG4gICAgfSxcblxuICAgIHJlc2V0UXVhdGVybmlvbjogZnVuY3Rpb24gKHEpIHtcblxuICAgICAgdGhpcy5hbmd1bGFyVmVsb2NpdHkuc2V0KDAsIDAsIDApO1xuICAgICAgdGhpcy5vcmllbnRhdGlvbiA9IG5ldyBRdWF0KHEueCwgcS55LCBxLnosIHEudyk7XG4gICAgICB0aGlzLmF3YWtlKCk7XG5cbiAgICB9LFxuXG4gICAgcmVzZXRSb3RhdGlvbjogZnVuY3Rpb24gKHgsIHksIHopIHtcblxuICAgICAgdGhpcy5hbmd1bGFyVmVsb2NpdHkuc2V0KDAsIDAsIDApO1xuICAgICAgdGhpcy5vcmllbnRhdGlvbiA9IG5ldyBRdWF0KCkuc2V0RnJvbUV1bGVyKHggKiBfTWF0aC5kZWd0b3JhZCwgeSAqIF9NYXRoLmRlZ3RvcmFkLCB6ICogX01hdGguZGVndG9yYWQpOy8vdGhpcy5yb3RhdGlvblZlY3RUb1F1YWQoIG5ldyBWZWMzKHgseSx6KSApO1xuICAgICAgdGhpcy5hd2FrZSgpO1xuXG4gICAgfSxcblxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gR0VUIFBPU0lUSU9OIEFORCBST1RBVElPTlxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgICBnZXRQb3NpdGlvbjogZnVuY3Rpb24gKCkge1xuXG4gICAgICByZXR1cm4gdGhpcy5wb3M7XG5cbiAgICB9LFxuXG4gICAgZ2V0UXVhdGVybmlvbjogZnVuY3Rpb24gKCkge1xuXG4gICAgICByZXR1cm4gdGhpcy5xdWF0ZXJuaW9uO1xuXG4gICAgfSxcblxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gQVVUTyBVUERBVEUgVEhSRUUgTUVTSFxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgICBjb25uZWN0TWVzaDogZnVuY3Rpb24gKG1lc2gpIHtcblxuICAgICAgdGhpcy5tZXNoID0gbWVzaDtcbiAgICAgIHRoaXMudXBkYXRlTWVzaCgpO1xuXG4gICAgfSxcblxuICAgIHVwZGF0ZU1lc2g6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgdGhpcy5wb3Muc2NhbGUodGhpcy5wb3NpdGlvbiwgdGhpcy5zY2FsZSk7XG4gICAgICB0aGlzLnF1YXRlcm5pb24uY29weSh0aGlzLm9yaWVudGF0aW9uKTtcblxuICAgICAgaWYgKHRoaXMubWVzaCA9PT0gbnVsbCkgcmV0dXJuO1xuXG4gICAgICB0aGlzLm1lc2gucG9zaXRpb24uY29weSh0aGlzLmdldFBvc2l0aW9uKCkpO1xuICAgICAgdGhpcy5tZXNoLnF1YXRlcm5pb24uY29weSh0aGlzLmdldFF1YXRlcm5pb24oKSk7XG5cbiAgICB9LFxuXG4gIH0pO1xuXG4gIC8qKlxuICAqIEEgcGFpciBvZiBzaGFwZXMgdGhhdCBtYXkgY29sbGlkZS5cbiAgKiBAYXV0aG9yIHNhaGFyYW5cbiAgKi9cbiAgZnVuY3Rpb24gUGFpcihzMSwgczIpIHtcblxuICAgIC8vIFRoZSBmaXJzdCBzaGFwZS5cbiAgICB0aGlzLnNoYXBlMSA9IHMxIHx8IG51bGw7XG4gICAgLy8gVGhlIHNlY29uZCBzaGFwZS5cbiAgICB0aGlzLnNoYXBlMiA9IHMyIHx8IG51bGw7XG5cbiAgfVxuXG4gIC8qKlxuICAqIFRoZSBicm9hZC1waGFzZSBpcyB1c2VkIGZvciBjb2xsZWN0aW5nIGFsbCBwb3NzaWJsZSBwYWlycyBmb3IgY29sbGlzaW9uLlxuICAqL1xuXG4gIGZ1bmN0aW9uIEJyb2FkUGhhc2UoKSB7XG5cbiAgICB0aGlzLnR5cGVzID0gQlJfTlVMTDtcbiAgICB0aGlzLm51bVBhaXJDaGVja3MgPSAwO1xuICAgIHRoaXMubnVtUGFpcnMgPSAwO1xuICAgIHRoaXMucGFpcnMgPSBbXTtcblxuICB9XG4gIE9iamVjdC5hc3NpZ24oQnJvYWRQaGFzZS5wcm90b3R5cGUsIHtcblxuICAgIEJyb2FkUGhhc2U6IHRydWUsXG5cbiAgICAvLyBDcmVhdGUgYSBuZXcgcHJveHkuXG4gICAgY3JlYXRlUHJveHk6IGZ1bmN0aW9uIChzaGFwZSkge1xuXG4gICAgICBwcmludEVycm9yKFwiQnJvYWRQaGFzZVwiLCBcIkluaGVyaXRhbmNlIGVycm9yLlwiKTtcblxuICAgIH0sXG5cbiAgICAvLyBBZGQgdGhlIHByb3h5IGludG8gdGhlIGJyb2FkLXBoYXNlLlxuICAgIGFkZFByb3h5OiBmdW5jdGlvbiAocHJveHkpIHtcblxuICAgICAgcHJpbnRFcnJvcihcIkJyb2FkUGhhc2VcIiwgXCJJbmhlcml0YW5jZSBlcnJvci5cIik7XG4gICAgfSxcblxuICAgIC8vIFJlbW92ZSB0aGUgcHJveHkgZnJvbSB0aGUgYnJvYWQtcGhhc2UuXG4gICAgcmVtb3ZlUHJveHk6IGZ1bmN0aW9uIChwcm94eSkge1xuXG4gICAgICBwcmludEVycm9yKFwiQnJvYWRQaGFzZVwiLCBcIkluaGVyaXRhbmNlIGVycm9yLlwiKTtcblxuICAgIH0sXG5cbiAgICAvLyBSZXR1cm5zIHdoZXRoZXIgdGhlIHBhaXIgaXMgYXZhaWxhYmxlIG9yIG5vdC5cbiAgICBpc0F2YWlsYWJsZVBhaXI6IGZ1bmN0aW9uIChzMSwgczIpIHtcblxuICAgICAgdmFyIGIxID0gczEucGFyZW50O1xuICAgICAgdmFyIGIyID0gczIucGFyZW50O1xuICAgICAgaWYgKGIxID09IGIyIHx8IC8vIHNhbWUgcGFyZW50c1xuICAgICAgICAoIWIxLmlzRHluYW1pYyAmJiAhYjIuaXNEeW5hbWljKSB8fCAvLyBzdGF0aWMgb3Iga2luZW1hdGljIG9iamVjdFxuICAgICAgICAoczEuYmVsb25nc1RvICYgczIuY29sbGlkZXNXaXRoKSA9PSAwIHx8XG4gICAgICAgIChzMi5iZWxvbmdzVG8gJiBzMS5jb2xsaWRlc1dpdGgpID09IDAgLy8gY29sbGlzaW9uIGZpbHRlcmluZ1xuICAgICAgKSB7IHJldHVybiBmYWxzZTsgfVxuICAgICAgdmFyIGpzO1xuICAgICAgaWYgKGIxLm51bUpvaW50cyA8IGIyLm51bUpvaW50cykganMgPSBiMS5qb2ludExpbms7XG4gICAgICBlbHNlIGpzID0gYjIuam9pbnRMaW5rO1xuICAgICAgd2hpbGUgKGpzICE9PSBudWxsKSB7XG4gICAgICAgIHZhciBqb2ludCA9IGpzLmpvaW50O1xuICAgICAgICBpZiAoIWpvaW50LmFsbG93Q29sbGlzaW9uICYmICgoam9pbnQuYm9keTEgPT0gYjEgJiYgam9pbnQuYm9keTIgPT0gYjIpIHx8IChqb2ludC5ib2R5MSA9PSBiMiAmJiBqb2ludC5ib2R5MiA9PSBiMSkpKSB7IHJldHVybiBmYWxzZTsgfVxuICAgICAgICBqcyA9IGpzLm5leHQ7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0cnVlO1xuXG4gICAgfSxcblxuICAgIC8vIERldGVjdCBvdmVybGFwcGluZyBwYWlycy5cbiAgICBkZXRlY3RQYWlyczogZnVuY3Rpb24gKCkge1xuXG4gICAgICAvLyBjbGVhciBvbGRcbiAgICAgIHRoaXMucGFpcnMgPSBbXTtcbiAgICAgIHRoaXMubnVtUGFpcnMgPSAwO1xuICAgICAgdGhpcy5udW1QYWlyQ2hlY2tzID0gMDtcbiAgICAgIHRoaXMuY29sbGVjdFBhaXJzKCk7XG5cbiAgICB9LFxuXG4gICAgY29sbGVjdFBhaXJzOiBmdW5jdGlvbiAoKSB7XG5cbiAgICB9LFxuXG4gICAgYWRkUGFpcjogZnVuY3Rpb24gKHMxLCBzMikge1xuXG4gICAgICB2YXIgcGFpciA9IG5ldyBQYWlyKHMxLCBzMik7XG4gICAgICB0aGlzLnBhaXJzLnB1c2gocGFpcik7XG4gICAgICB0aGlzLm51bVBhaXJzKys7XG5cbiAgICB9XG5cbiAgfSk7XG5cbiAgdmFyIGNvdW50JDEgPSAwO1xuICBmdW5jdGlvbiBQcm94eUlkQ291bnQoKSB7IHJldHVybiBjb3VudCQxKys7IH1cblxuICAvKipcbiAgICogQSBwcm94eSBpcyB1c2VkIGZvciBicm9hZC1waGFzZSBjb2xsZWN0aW5nIHBhaXJzIHRoYXQgY2FuIGJlIGNvbGxpZGluZy5cbiAgICpcbiAgICogQGF1dGhvciBsby10aFxuICAgKi9cblxuICBmdW5jdGlvbiBQcm94eShzaGFwZSkge1xuXG4gICAgLy9UaGUgcGFyZW50IHNoYXBlLlxuICAgIHRoaXMuc2hhcGUgPSBzaGFwZTtcblxuICAgIC8vVGhlIGF4aXMtYWxpZ25lZCBib3VuZGluZyBib3guXG4gICAgdGhpcy5hYWJiID0gc2hhcGUuYWFiYjtcblxuICB9XG4gIE9iamVjdC5hc3NpZ24oUHJveHkucHJvdG90eXBlLCB7XG5cbiAgICBQcm94eTogdHJ1ZSxcblxuICAgIC8vIFVwZGF0ZSB0aGUgcHJveHkuIE11c3QgYmUgaW5oZXJpdGVkIGJ5IGEgY2hpbGQuXG5cbiAgICB1cGRhdGU6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgcHJpbnRFcnJvcihcIlByb3h5XCIsIFwiSW5oZXJpdGFuY2UgZXJyb3IuXCIpO1xuXG4gICAgfVxuXG4gIH0pO1xuXG4gIC8qKlxuICAqIEEgYmFzaWMgaW1wbGVtZW50YXRpb24gb2YgcHJveGllcy5cbiAgKlxuICAqIEBhdXRob3Igc2FoYXJhblxuICAqL1xuXG4gIGZ1bmN0aW9uIEJhc2ljUHJveHkoc2hhcGUpIHtcblxuICAgIFByb3h5LmNhbGwodGhpcywgc2hhcGUpO1xuXG4gICAgdGhpcy5pZCA9IFByb3h5SWRDb3VudCgpO1xuXG4gIH1cbiAgQmFzaWNQcm94eS5wcm90b3R5cGUgPSBPYmplY3QuYXNzaWduKE9iamVjdC5jcmVhdGUoUHJveHkucHJvdG90eXBlKSwge1xuXG4gICAgY29uc3RydWN0b3I6IEJhc2ljUHJveHksXG5cbiAgICB1cGRhdGU6IGZ1bmN0aW9uICgpIHtcblxuICAgIH1cblxuICB9KTtcblxuICAvKipcbiAgKiBBIGJyb2FkLXBoYXNlIGFsZ29yaXRobSB3aXRoIGJydXRlLWZvcmNlIHNlYXJjaC5cbiAgKiBUaGlzIGFsd2F5cyBjaGVja3MgZm9yIGFsbCBwb3NzaWJsZSBwYWlycy5cbiAgKi9cblxuICBmdW5jdGlvbiBCcnV0ZUZvcmNlQnJvYWRQaGFzZSgpIHtcblxuICAgIEJyb2FkUGhhc2UuY2FsbCh0aGlzKTtcbiAgICB0aGlzLnR5cGVzID0gQlJfQlJVVEVfRk9SQ0U7XG4gICAgLy90aGlzLm51bVByb3hpZXM9MDtcbiAgICAvLy90aGlzLm1heFByb3hpZXMgPSAyNTY7XG4gICAgdGhpcy5wcm94aWVzID0gW107XG4gICAgLy90aGlzLnByb3hpZXMubGVuZ3RoID0gMjU2O1xuXG4gIH1cblxuICBCcnV0ZUZvcmNlQnJvYWRQaGFzZS5wcm90b3R5cGUgPSBPYmplY3QuYXNzaWduKE9iamVjdC5jcmVhdGUoQnJvYWRQaGFzZS5wcm90b3R5cGUpLCB7XG5cbiAgICBjb25zdHJ1Y3RvcjogQnJ1dGVGb3JjZUJyb2FkUGhhc2UsXG5cbiAgICBjcmVhdGVQcm94eTogZnVuY3Rpb24gKHNoYXBlKSB7XG5cbiAgICAgIHJldHVybiBuZXcgQmFzaWNQcm94eShzaGFwZSk7XG5cbiAgICB9LFxuXG4gICAgYWRkUHJveHk6IGZ1bmN0aW9uIChwcm94eSkge1xuXG4gICAgICAvKmlmKHRoaXMubnVtUHJveGllcz09dGhpcy5tYXhQcm94aWVzKXtcbiAgICAgICAgICAvL3RoaXMubWF4UHJveGllczw8PTE7XG4gICAgICAgICAgdGhpcy5tYXhQcm94aWVzKj0yO1xuICAgICAgICAgIHZhciBuZXdQcm94aWVzPVtdO1xuICAgICAgICAgIG5ld1Byb3hpZXMubGVuZ3RoID0gdGhpcy5tYXhQcm94aWVzO1xuICAgICAgICAgIHZhciBpID0gdGhpcy5udW1Qcm94aWVzO1xuICAgICAgICAgIHdoaWxlKGktLSl7XG4gICAgICAgICAgLy9mb3IodmFyIGk9MCwgbD10aGlzLm51bVByb3hpZXM7aTxsO2krKyl7XG4gICAgICAgICAgICAgIG5ld1Byb3hpZXNbaV09dGhpcy5wcm94aWVzW2ldO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLnByb3hpZXM9bmV3UHJveGllcztcbiAgICAgIH0qL1xuICAgICAgLy90aGlzLnByb3hpZXNbdGhpcy5udW1Qcm94aWVzKytdID0gcHJveHk7XG4gICAgICB0aGlzLnByb3hpZXMucHVzaChwcm94eSk7XG4gICAgICAvL3RoaXMubnVtUHJveGllcysrO1xuXG4gICAgfSxcblxuICAgIHJlbW92ZVByb3h5OiBmdW5jdGlvbiAocHJveHkpIHtcblxuICAgICAgdmFyIG4gPSB0aGlzLnByb3hpZXMuaW5kZXhPZihwcm94eSk7XG4gICAgICBpZiAobiA+IC0xKSB7XG4gICAgICAgIHRoaXMucHJveGllcy5zcGxpY2UobiwgMSk7XG4gICAgICAgIC8vdGhpcy5udW1Qcm94aWVzLS07XG4gICAgICB9XG5cbiAgICAgIC8qdmFyIGkgPSB0aGlzLm51bVByb3hpZXM7XG4gICAgICB3aGlsZShpLS0pe1xuICAgICAgLy9mb3IodmFyIGk9MCwgbD10aGlzLm51bVByb3hpZXM7aTxsO2krKyl7XG4gICAgICAgICAgaWYodGhpcy5wcm94aWVzW2ldID09IHByb3h5KXtcbiAgICAgICAgICAgICAgdGhpcy5wcm94aWVzW2ldID0gdGhpcy5wcm94aWVzWy0tdGhpcy5udW1Qcm94aWVzXTtcbiAgICAgICAgICAgICAgdGhpcy5wcm94aWVzW3RoaXMubnVtUHJveGllc10gPSBudWxsO1xuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgfSovXG5cbiAgICB9LFxuXG4gICAgY29sbGVjdFBhaXJzOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHZhciBpID0gMCwgaiwgcDEsIHAyO1xuXG4gICAgICB2YXIgcHggPSB0aGlzLnByb3hpZXM7XG4gICAgICB2YXIgbCA9IHB4Lmxlbmd0aDsvL3RoaXMubnVtUHJveGllcztcbiAgICAgIC8vdmFyIGFyMSA9IFtdO1xuICAgICAgLy92YXIgYXIyID0gW107XG5cbiAgICAgIC8vZm9yKCBpID0gcHgubGVuZ3RoIDsgaS0tIDsgYXIxWyBpIF0gPSBweFsgaSBdICl7fTtcbiAgICAgIC8vZm9yKCBpID0gcHgubGVuZ3RoIDsgaS0tIDsgYXIyWyBpIF0gPSBweFsgaSBdICl7fTtcblxuICAgICAgLy92YXIgYXIxID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGlzLnByb3hpZXMpKVxuICAgICAgLy92YXIgYXIyID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGlzLnByb3hpZXMpKVxuXG4gICAgICB0aGlzLm51bVBhaXJDaGVja3MgPSBsICogKGwgLSAxKSA+PiAxO1xuICAgICAgLy90aGlzLm51bVBhaXJDaGVja3M9dGhpcy5udW1Qcm94aWVzKih0aGlzLm51bVByb3hpZXMtMSkqMC41O1xuXG4gICAgICB3aGlsZSAoaSA8IGwpIHtcbiAgICAgICAgcDEgPSBweFtpKytdO1xuICAgICAgICBqID0gaSArIDE7XG4gICAgICAgIHdoaWxlIChqIDwgbCkge1xuICAgICAgICAgIHAyID0gcHhbaisrXTtcbiAgICAgICAgICBpZiAocDEuYWFiYi5pbnRlcnNlY3RUZXN0KHAyLmFhYmIpIHx8ICF0aGlzLmlzQXZhaWxhYmxlUGFpcihwMS5zaGFwZSwgcDIuc2hhcGUpKSBjb250aW51ZTtcbiAgICAgICAgICB0aGlzLmFkZFBhaXIocDEuc2hhcGUsIHAyLnNoYXBlKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgfVxuXG4gIH0pO1xuXG4gIC8qKlxuICAgKiBBIHByb2plY3Rpb24gYXhpcyBmb3Igc3dlZXAgYW5kIHBydW5lIGJyb2FkLXBoYXNlLlxuICAgKiBAYXV0aG9yIHNhaGFyYW5cbiAgICovXG5cbiAgZnVuY3Rpb24gU0FQQXhpcygpIHtcblxuICAgIHRoaXMubnVtRWxlbWVudHMgPSAwO1xuICAgIHRoaXMuYnVmZmVyU2l6ZSA9IDI1NjtcbiAgICB0aGlzLmVsZW1lbnRzID0gW107XG4gICAgdGhpcy5lbGVtZW50cy5sZW5ndGggPSB0aGlzLmJ1ZmZlclNpemU7XG4gICAgdGhpcy5zdGFjayA9IG5ldyBGbG9hdDMyQXJyYXkoNjQpO1xuXG4gIH1cblxuICBPYmplY3QuYXNzaWduKFNBUEF4aXMucHJvdG90eXBlLCB7XG5cbiAgICBTQVBBeGlzOiB0cnVlLFxuXG4gICAgYWRkRWxlbWVudHM6IGZ1bmN0aW9uIChtaW4sIG1heCkge1xuXG4gICAgICBpZiAodGhpcy5udW1FbGVtZW50cyArIDIgPj0gdGhpcy5idWZmZXJTaXplKSB7XG4gICAgICAgIC8vdGhpcy5idWZmZXJTaXplPDw9MTtcbiAgICAgICAgdGhpcy5idWZmZXJTaXplICo9IDI7XG4gICAgICAgIHZhciBuZXdFbGVtZW50cyA9IFtdO1xuICAgICAgICB2YXIgaSA9IHRoaXMubnVtRWxlbWVudHM7XG4gICAgICAgIHdoaWxlIChpLS0pIHtcbiAgICAgICAgICAvL2Zvcih2YXIgaT0wLCBsPXRoaXMubnVtRWxlbWVudHM7IGk8bDsgaSsrKXtcbiAgICAgICAgICBuZXdFbGVtZW50c1tpXSA9IHRoaXMuZWxlbWVudHNbaV07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRoaXMuZWxlbWVudHNbdGhpcy5udW1FbGVtZW50cysrXSA9IG1pbjtcbiAgICAgIHRoaXMuZWxlbWVudHNbdGhpcy5udW1FbGVtZW50cysrXSA9IG1heDtcblxuICAgIH0sXG5cbiAgICByZW1vdmVFbGVtZW50czogZnVuY3Rpb24gKG1pbiwgbWF4KSB7XG5cbiAgICAgIHZhciBtaW5JbmRleCA9IC0xO1xuICAgICAgdmFyIG1heEluZGV4ID0gLTE7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbCA9IHRoaXMubnVtRWxlbWVudHM7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgdmFyIGUgPSB0aGlzLmVsZW1lbnRzW2ldO1xuICAgICAgICBpZiAoZSA9PSBtaW4gfHwgZSA9PSBtYXgpIHtcbiAgICAgICAgICBpZiAobWluSW5kZXggPT0gLTEpIHtcbiAgICAgICAgICAgIG1pbkluZGV4ID0gaTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbWF4SW5kZXggPSBpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBmb3IgKGkgPSBtaW5JbmRleCArIDEsIGwgPSBtYXhJbmRleDsgaSA8IGw7IGkrKykge1xuICAgICAgICB0aGlzLmVsZW1lbnRzW2kgLSAxXSA9IHRoaXMuZWxlbWVudHNbaV07XG4gICAgICB9XG4gICAgICBmb3IgKGkgPSBtYXhJbmRleCArIDEsIGwgPSB0aGlzLm51bUVsZW1lbnRzOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIHRoaXMuZWxlbWVudHNbaSAtIDJdID0gdGhpcy5lbGVtZW50c1tpXTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5lbGVtZW50c1stLXRoaXMubnVtRWxlbWVudHNdID0gbnVsbDtcbiAgICAgIHRoaXMuZWxlbWVudHNbLS10aGlzLm51bUVsZW1lbnRzXSA9IG51bGw7XG5cbiAgICB9LFxuXG4gICAgc29ydDogZnVuY3Rpb24gKCkge1xuXG4gICAgICB2YXIgY291bnQgPSAwO1xuICAgICAgdmFyIHRocmVzaG9sZCA9IDE7XG4gICAgICB3aGlsZSAoKHRoaXMubnVtRWxlbWVudHMgPj4gdGhyZXNob2xkKSAhPSAwKSB0aHJlc2hvbGQrKztcbiAgICAgIHRocmVzaG9sZCA9IHRocmVzaG9sZCAqIHRoaXMubnVtRWxlbWVudHMgPj4gMjtcbiAgICAgIGNvdW50ID0gMDtcblxuICAgICAgdmFyIGdpdmV1cCA9IGZhbHNlO1xuICAgICAgdmFyIGVsZW1lbnRzID0gdGhpcy5lbGVtZW50cztcbiAgICAgIGZvciAodmFyIGkgPSAxLCBsID0gdGhpcy5udW1FbGVtZW50czsgaSA8IGw7IGkrKykgeyAvLyB0cnkgaW5zZXJ0aW9uIHNvcnRcbiAgICAgICAgdmFyIHRtcCA9IGVsZW1lbnRzW2ldO1xuICAgICAgICB2YXIgcGl2b3QgPSB0bXAudmFsdWU7XG4gICAgICAgIHZhciB0bXAyID0gZWxlbWVudHNbaSAtIDFdO1xuICAgICAgICBpZiAodG1wMi52YWx1ZSA+IHBpdm90KSB7XG4gICAgICAgICAgdmFyIGogPSBpO1xuICAgICAgICAgIGRvIHtcbiAgICAgICAgICAgIGVsZW1lbnRzW2pdID0gdG1wMjtcbiAgICAgICAgICAgIGlmICgtLWogPT0gMCkgYnJlYWs7XG4gICAgICAgICAgICB0bXAyID0gZWxlbWVudHNbaiAtIDFdO1xuICAgICAgICAgIH0gd2hpbGUgKHRtcDIudmFsdWUgPiBwaXZvdCk7XG4gICAgICAgICAgZWxlbWVudHNbal0gPSB0bXA7XG4gICAgICAgICAgY291bnQgKz0gaSAtIGo7XG4gICAgICAgICAgaWYgKGNvdW50ID4gdGhyZXNob2xkKSB7XG4gICAgICAgICAgICBnaXZldXAgPSB0cnVlOyAvLyBzdG9wIGFuZCB1c2UgcXVpY2sgc29ydFxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoIWdpdmV1cCkgcmV0dXJuO1xuICAgICAgY291bnQgPSAyOyB2YXIgc3RhY2sgPSB0aGlzLnN0YWNrO1xuICAgICAgc3RhY2tbMF0gPSAwO1xuICAgICAgc3RhY2tbMV0gPSB0aGlzLm51bUVsZW1lbnRzIC0gMTtcbiAgICAgIHdoaWxlIChjb3VudCA+IDApIHtcbiAgICAgICAgdmFyIHJpZ2h0ID0gc3RhY2tbLS1jb3VudF07XG4gICAgICAgIHZhciBsZWZ0ID0gc3RhY2tbLS1jb3VudF07XG4gICAgICAgIHZhciBkaWZmID0gcmlnaHQgLSBsZWZ0O1xuICAgICAgICBpZiAoZGlmZiA+IDE2KSB7ICAvLyBxdWljayBzb3J0XG4gICAgICAgICAgLy92YXIgbWlkPWxlZnQrKGRpZmY+PjEpO1xuICAgICAgICAgIHZhciBtaWQgPSBsZWZ0ICsgKF9NYXRoLmZsb29yKGRpZmYgKiAwLjUpKTtcbiAgICAgICAgICB0bXAgPSBlbGVtZW50c1ttaWRdO1xuICAgICAgICAgIGVsZW1lbnRzW21pZF0gPSBlbGVtZW50c1tyaWdodF07XG4gICAgICAgICAgZWxlbWVudHNbcmlnaHRdID0gdG1wO1xuICAgICAgICAgIHBpdm90ID0gdG1wLnZhbHVlO1xuICAgICAgICAgIGkgPSBsZWZ0IC0gMTtcbiAgICAgICAgICBqID0gcmlnaHQ7XG4gICAgICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgICAgIHZhciBlaTtcbiAgICAgICAgICAgIHZhciBlajtcbiAgICAgICAgICAgIGRvIHsgZWkgPSBlbGVtZW50c1srK2ldOyB9IHdoaWxlIChlaS52YWx1ZSA8IHBpdm90KTtcbiAgICAgICAgICAgIGRvIHsgZWogPSBlbGVtZW50c1stLWpdOyB9IHdoaWxlIChwaXZvdCA8IGVqLnZhbHVlICYmIGogIT0gbGVmdCk7XG4gICAgICAgICAgICBpZiAoaSA+PSBqKSBicmVhaztcbiAgICAgICAgICAgIGVsZW1lbnRzW2ldID0gZWo7XG4gICAgICAgICAgICBlbGVtZW50c1tqXSA9IGVpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGVsZW1lbnRzW3JpZ2h0XSA9IGVsZW1lbnRzW2ldO1xuICAgICAgICAgIGVsZW1lbnRzW2ldID0gdG1wO1xuICAgICAgICAgIGlmIChpIC0gbGVmdCA+IHJpZ2h0IC0gaSkge1xuICAgICAgICAgICAgc3RhY2tbY291bnQrK10gPSBsZWZ0O1xuICAgICAgICAgICAgc3RhY2tbY291bnQrK10gPSBpIC0gMTtcbiAgICAgICAgICAgIHN0YWNrW2NvdW50KytdID0gaSArIDE7XG4gICAgICAgICAgICBzdGFja1tjb3VudCsrXSA9IHJpZ2h0O1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdGFja1tjb3VudCsrXSA9IGkgKyAxO1xuICAgICAgICAgICAgc3RhY2tbY291bnQrK10gPSByaWdodDtcbiAgICAgICAgICAgIHN0YWNrW2NvdW50KytdID0gbGVmdDtcbiAgICAgICAgICAgIHN0YWNrW2NvdW50KytdID0gaSAtIDE7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGZvciAoaSA9IGxlZnQgKyAxOyBpIDw9IHJpZ2h0OyBpKyspIHtcbiAgICAgICAgICAgIHRtcCA9IGVsZW1lbnRzW2ldO1xuICAgICAgICAgICAgcGl2b3QgPSB0bXAudmFsdWU7XG4gICAgICAgICAgICB0bXAyID0gZWxlbWVudHNbaSAtIDFdO1xuICAgICAgICAgICAgaWYgKHRtcDIudmFsdWUgPiBwaXZvdCkge1xuICAgICAgICAgICAgICBqID0gaTtcbiAgICAgICAgICAgICAgZG8ge1xuICAgICAgICAgICAgICAgIGVsZW1lbnRzW2pdID0gdG1wMjtcbiAgICAgICAgICAgICAgICBpZiAoLS1qID09IDApIGJyZWFrO1xuICAgICAgICAgICAgICAgIHRtcDIgPSBlbGVtZW50c1tqIC0gMV07XG4gICAgICAgICAgICAgIH0gd2hpbGUgKHRtcDIudmFsdWUgPiBwaXZvdCk7XG4gICAgICAgICAgICAgIGVsZW1lbnRzW2pdID0gdG1wO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgfSxcblxuICAgIGNhbGN1bGF0ZVRlc3RDb3VudDogZnVuY3Rpb24gKCkge1xuXG4gICAgICB2YXIgbnVtID0gMTtcbiAgICAgIHZhciBzdW0gPSAwO1xuICAgICAgZm9yICh2YXIgaSA9IDEsIGwgPSB0aGlzLm51bUVsZW1lbnRzOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIGlmICh0aGlzLmVsZW1lbnRzW2ldLm1heCkge1xuICAgICAgICAgIG51bS0tO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN1bSArPSBudW07XG4gICAgICAgICAgbnVtKys7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBzdW07XG5cbiAgICB9XG5cbiAgfSk7XG5cbiAgLyoqXG4gICAqIEFuIGVsZW1lbnQgb2YgcHJveGllcy5cbiAgICogQGF1dGhvciBzYWhhcmFuXG4gICAqL1xuXG4gIGZ1bmN0aW9uIFNBUEVsZW1lbnQocHJveHksIG1heCkge1xuXG4gICAgLy8gVGhlIHBhcmVudCBwcm94eVxuICAgIHRoaXMucHJveHkgPSBwcm94eTtcbiAgICAvLyBUaGUgcGFpciBlbGVtZW50LlxuICAgIHRoaXMucGFpciA9IG51bGw7XG4gICAgLy8gVGhlIG1pbmltdW0gZWxlbWVudCBvbiBvdGhlciBheGlzLlxuICAgIHRoaXMubWluMSA9IG51bGw7XG4gICAgLy8gVGhlIG1heGltdW0gZWxlbWVudCBvbiBvdGhlciBheGlzLlxuICAgIHRoaXMubWF4MSA9IG51bGw7XG4gICAgLy8gVGhlIG1pbmltdW0gZWxlbWVudCBvbiBvdGhlciBheGlzLlxuICAgIHRoaXMubWluMiA9IG51bGw7XG4gICAgLy8gVGhlIG1heGltdW0gZWxlbWVudCBvbiBvdGhlciBheGlzLlxuICAgIHRoaXMubWF4MiA9IG51bGw7XG4gICAgLy8gV2hldGhlciB0aGUgZWxlbWVudCBoYXMgbWF4aW11bSB2YWx1ZSBvciBub3QuXG4gICAgdGhpcy5tYXggPSBtYXg7XG4gICAgLy8gVGhlIHZhbHVlIG9mIHRoZSBlbGVtZW50LlxuICAgIHRoaXMudmFsdWUgPSAwO1xuXG4gIH1cblxuICAvKipcbiAgICogQSBwcm94eSBmb3Igc3dlZXAgYW5kIHBydW5lIGJyb2FkLXBoYXNlLlxuICAgKiBAYXV0aG9yIHNhaGFyYW5cbiAgICogQGF1dGhvciBsby10aFxuICAgKi9cblxuICBmdW5jdGlvbiBTQVBQcm94eShzYXAsIHNoYXBlKSB7XG5cbiAgICBQcm94eS5jYWxsKHRoaXMsIHNoYXBlKTtcbiAgICAvLyBUeXBlIG9mIHRoZSBheGlzIHRvIHdoaWNoIHRoZSBwcm94eSBiZWxvbmdzIHRvLiBbMDpub25lLCAxOmR5bmFtaWMsIDI6c3RhdGljXVxuICAgIHRoaXMuYmVsb25nc1RvID0gMDtcbiAgICAvLyBUaGUgbWF4aW11bSBlbGVtZW50cyBvbiBlYWNoIGF4aXMuXG4gICAgdGhpcy5tYXggPSBbXTtcbiAgICAvLyBUaGUgbWluaW11bSBlbGVtZW50cyBvbiBlYWNoIGF4aXMuXG4gICAgdGhpcy5taW4gPSBbXTtcblxuICAgIHRoaXMuc2FwID0gc2FwO1xuICAgIHRoaXMubWluWzBdID0gbmV3IFNBUEVsZW1lbnQodGhpcywgZmFsc2UpO1xuICAgIHRoaXMubWF4WzBdID0gbmV3IFNBUEVsZW1lbnQodGhpcywgdHJ1ZSk7XG4gICAgdGhpcy5taW5bMV0gPSBuZXcgU0FQRWxlbWVudCh0aGlzLCBmYWxzZSk7XG4gICAgdGhpcy5tYXhbMV0gPSBuZXcgU0FQRWxlbWVudCh0aGlzLCB0cnVlKTtcbiAgICB0aGlzLm1pblsyXSA9IG5ldyBTQVBFbGVtZW50KHRoaXMsIGZhbHNlKTtcbiAgICB0aGlzLm1heFsyXSA9IG5ldyBTQVBFbGVtZW50KHRoaXMsIHRydWUpO1xuICAgIHRoaXMubWF4WzBdLnBhaXIgPSB0aGlzLm1pblswXTtcbiAgICB0aGlzLm1heFsxXS5wYWlyID0gdGhpcy5taW5bMV07XG4gICAgdGhpcy5tYXhbMl0ucGFpciA9IHRoaXMubWluWzJdO1xuICAgIHRoaXMubWluWzBdLm1pbjEgPSB0aGlzLm1pblsxXTtcbiAgICB0aGlzLm1pblswXS5tYXgxID0gdGhpcy5tYXhbMV07XG4gICAgdGhpcy5taW5bMF0ubWluMiA9IHRoaXMubWluWzJdO1xuICAgIHRoaXMubWluWzBdLm1heDIgPSB0aGlzLm1heFsyXTtcbiAgICB0aGlzLm1pblsxXS5taW4xID0gdGhpcy5taW5bMF07XG4gICAgdGhpcy5taW5bMV0ubWF4MSA9IHRoaXMubWF4WzBdO1xuICAgIHRoaXMubWluWzFdLm1pbjIgPSB0aGlzLm1pblsyXTtcbiAgICB0aGlzLm1pblsxXS5tYXgyID0gdGhpcy5tYXhbMl07XG4gICAgdGhpcy5taW5bMl0ubWluMSA9IHRoaXMubWluWzBdO1xuICAgIHRoaXMubWluWzJdLm1heDEgPSB0aGlzLm1heFswXTtcbiAgICB0aGlzLm1pblsyXS5taW4yID0gdGhpcy5taW5bMV07XG4gICAgdGhpcy5taW5bMl0ubWF4MiA9IHRoaXMubWF4WzFdO1xuXG4gIH1cbiAgU0FQUHJveHkucHJvdG90eXBlID0gT2JqZWN0LmFzc2lnbihPYmplY3QuY3JlYXRlKFByb3h5LnByb3RvdHlwZSksIHtcblxuICAgIGNvbnN0cnVjdG9yOiBTQVBQcm94eSxcblxuXG4gICAgLy8gUmV0dXJucyB3aGV0aGVyIHRoZSBwcm94eSBpcyBkeW5hbWljIG9yIG5vdC5cbiAgICBpc0R5bmFtaWM6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgdmFyIGJvZHkgPSB0aGlzLnNoYXBlLnBhcmVudDtcbiAgICAgIHJldHVybiBib2R5LmlzRHluYW1pYyAmJiAhYm9keS5zbGVlcGluZztcblxuICAgIH0sXG5cbiAgICB1cGRhdGU6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgdmFyIHRlID0gdGhpcy5hYWJiLmVsZW1lbnRzO1xuICAgICAgdGhpcy5taW5bMF0udmFsdWUgPSB0ZVswXTtcbiAgICAgIHRoaXMubWluWzFdLnZhbHVlID0gdGVbMV07XG4gICAgICB0aGlzLm1pblsyXS52YWx1ZSA9IHRlWzJdO1xuICAgICAgdGhpcy5tYXhbMF0udmFsdWUgPSB0ZVszXTtcbiAgICAgIHRoaXMubWF4WzFdLnZhbHVlID0gdGVbNF07XG4gICAgICB0aGlzLm1heFsyXS52YWx1ZSA9IHRlWzVdO1xuXG4gICAgICBpZiAodGhpcy5iZWxvbmdzVG8gPT0gMSAmJiAhdGhpcy5pc0R5bmFtaWMoKSB8fCB0aGlzLmJlbG9uZ3NUbyA9PSAyICYmIHRoaXMuaXNEeW5hbWljKCkpIHtcbiAgICAgICAgdGhpcy5zYXAucmVtb3ZlUHJveHkodGhpcyk7XG4gICAgICAgIHRoaXMuc2FwLmFkZFByb3h5KHRoaXMpO1xuICAgICAgfVxuXG4gICAgfVxuXG4gIH0pO1xuXG4gIC8qKlxuICAgKiBBIGJyb2FkLXBoYXNlIGNvbGxpc2lvbiBkZXRlY3Rpb24gYWxnb3JpdGhtIHVzaW5nIHN3ZWVwIGFuZCBwcnVuZS5cbiAgICogQGF1dGhvciBzYWhhcmFuXG4gICAqIEBhdXRob3IgbG8tdGhcbiAgICovXG5cbiAgZnVuY3Rpb24gU0FQQnJvYWRQaGFzZSgpIHtcblxuICAgIEJyb2FkUGhhc2UuY2FsbCh0aGlzKTtcbiAgICB0aGlzLnR5cGVzID0gQlJfU1dFRVBfQU5EX1BSVU5FO1xuXG4gICAgdGhpcy5udW1FbGVtZW50c0QgPSAwO1xuICAgIHRoaXMubnVtRWxlbWVudHNTID0gMDtcbiAgICAvLyBkeW5hbWljIHByb3hpZXNcbiAgICB0aGlzLmF4ZXNEID0gW1xuICAgICAgbmV3IFNBUEF4aXMoKSxcbiAgICAgIG5ldyBTQVBBeGlzKCksXG4gICAgICBuZXcgU0FQQXhpcygpXG4gICAgXTtcbiAgICAvLyBzdGF0aWMgb3Igc2xlZXBpbmcgcHJveGllc1xuICAgIHRoaXMuYXhlc1MgPSBbXG4gICAgICBuZXcgU0FQQXhpcygpLFxuICAgICAgbmV3IFNBUEF4aXMoKSxcbiAgICAgIG5ldyBTQVBBeGlzKClcbiAgICBdO1xuXG4gICAgdGhpcy5pbmRleDEgPSAwO1xuICAgIHRoaXMuaW5kZXgyID0gMTtcblxuICB9XG4gIFNBUEJyb2FkUGhhc2UucHJvdG90eXBlID0gT2JqZWN0LmFzc2lnbihPYmplY3QuY3JlYXRlKEJyb2FkUGhhc2UucHJvdG90eXBlKSwge1xuXG4gICAgY29uc3RydWN0b3I6IFNBUEJyb2FkUGhhc2UsXG5cbiAgICBjcmVhdGVQcm94eTogZnVuY3Rpb24gKHNoYXBlKSB7XG5cbiAgICAgIHJldHVybiBuZXcgU0FQUHJveHkodGhpcywgc2hhcGUpO1xuXG4gICAgfSxcblxuICAgIGFkZFByb3h5OiBmdW5jdGlvbiAocHJveHkpIHtcblxuICAgICAgdmFyIHAgPSBwcm94eTtcbiAgICAgIGlmIChwLmlzRHluYW1pYygpKSB7XG4gICAgICAgIHRoaXMuYXhlc0RbMF0uYWRkRWxlbWVudHMocC5taW5bMF0sIHAubWF4WzBdKTtcbiAgICAgICAgdGhpcy5heGVzRFsxXS5hZGRFbGVtZW50cyhwLm1pblsxXSwgcC5tYXhbMV0pO1xuICAgICAgICB0aGlzLmF4ZXNEWzJdLmFkZEVsZW1lbnRzKHAubWluWzJdLCBwLm1heFsyXSk7XG4gICAgICAgIHAuYmVsb25nc1RvID0gMTtcbiAgICAgICAgdGhpcy5udW1FbGVtZW50c0QgKz0gMjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuYXhlc1NbMF0uYWRkRWxlbWVudHMocC5taW5bMF0sIHAubWF4WzBdKTtcbiAgICAgICAgdGhpcy5heGVzU1sxXS5hZGRFbGVtZW50cyhwLm1pblsxXSwgcC5tYXhbMV0pO1xuICAgICAgICB0aGlzLmF4ZXNTWzJdLmFkZEVsZW1lbnRzKHAubWluWzJdLCBwLm1heFsyXSk7XG4gICAgICAgIHAuYmVsb25nc1RvID0gMjtcbiAgICAgICAgdGhpcy5udW1FbGVtZW50c1MgKz0gMjtcbiAgICAgIH1cblxuICAgIH0sXG5cbiAgICByZW1vdmVQcm94eTogZnVuY3Rpb24gKHByb3h5KSB7XG5cbiAgICAgIHZhciBwID0gcHJveHk7XG4gICAgICBpZiAocC5iZWxvbmdzVG8gPT0gMCkgcmV0dXJuO1xuXG4gICAgICAvKmVsc2UgaWYgKCBwLmJlbG9uZ3NUbyA9PSAxICkge1xuICAgICAgICAgIHRoaXMuYXhlc0RbMF0ucmVtb3ZlRWxlbWVudHMoIHAubWluWzBdLCBwLm1heFswXSApO1xuICAgICAgICAgIHRoaXMuYXhlc0RbMV0ucmVtb3ZlRWxlbWVudHMoIHAubWluWzFdLCBwLm1heFsxXSApO1xuICAgICAgICAgIHRoaXMuYXhlc0RbMl0ucmVtb3ZlRWxlbWVudHMoIHAubWluWzJdLCBwLm1heFsyXSApO1xuICAgICAgICAgIHRoaXMubnVtRWxlbWVudHNEIC09IDI7XG4gICAgICB9IGVsc2UgaWYgKCBwLmJlbG9uZ3NUbyA9PSAyICkge1xuICAgICAgICAgIHRoaXMuYXhlc1NbMF0ucmVtb3ZlRWxlbWVudHMoIHAubWluWzBdLCBwLm1heFswXSApO1xuICAgICAgICAgIHRoaXMuYXhlc1NbMV0ucmVtb3ZlRWxlbWVudHMoIHAubWluWzFdLCBwLm1heFsxXSApO1xuICAgICAgICAgIHRoaXMuYXhlc1NbMl0ucmVtb3ZlRWxlbWVudHMoIHAubWluWzJdLCBwLm1heFsyXSApO1xuICAgICAgICAgIHRoaXMubnVtRWxlbWVudHNTIC09IDI7XG4gICAgICB9Ki9cblxuICAgICAgc3dpdGNoIChwLmJlbG9uZ3NUbykge1xuICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgdGhpcy5heGVzRFswXS5yZW1vdmVFbGVtZW50cyhwLm1pblswXSwgcC5tYXhbMF0pO1xuICAgICAgICAgIHRoaXMuYXhlc0RbMV0ucmVtb3ZlRWxlbWVudHMocC5taW5bMV0sIHAubWF4WzFdKTtcbiAgICAgICAgICB0aGlzLmF4ZXNEWzJdLnJlbW92ZUVsZW1lbnRzKHAubWluWzJdLCBwLm1heFsyXSk7XG4gICAgICAgICAgdGhpcy5udW1FbGVtZW50c0QgLT0gMjtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgIHRoaXMuYXhlc1NbMF0ucmVtb3ZlRWxlbWVudHMocC5taW5bMF0sIHAubWF4WzBdKTtcbiAgICAgICAgICB0aGlzLmF4ZXNTWzFdLnJlbW92ZUVsZW1lbnRzKHAubWluWzFdLCBwLm1heFsxXSk7XG4gICAgICAgICAgdGhpcy5heGVzU1syXS5yZW1vdmVFbGVtZW50cyhwLm1pblsyXSwgcC5tYXhbMl0pO1xuICAgICAgICAgIHRoaXMubnVtRWxlbWVudHNTIC09IDI7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIHAuYmVsb25nc1RvID0gMDtcblxuICAgIH0sXG5cbiAgICBjb2xsZWN0UGFpcnM6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgaWYgKHRoaXMubnVtRWxlbWVudHNEID09IDApIHJldHVybjtcblxuICAgICAgdmFyIGF4aXMxID0gdGhpcy5heGVzRFt0aGlzLmluZGV4MV07XG4gICAgICB2YXIgYXhpczIgPSB0aGlzLmF4ZXNEW3RoaXMuaW5kZXgyXTtcblxuICAgICAgYXhpczEuc29ydCgpO1xuICAgICAgYXhpczIuc29ydCgpO1xuXG4gICAgICB2YXIgY291bnQxID0gYXhpczEuY2FsY3VsYXRlVGVzdENvdW50KCk7XG4gICAgICB2YXIgY291bnQyID0gYXhpczIuY2FsY3VsYXRlVGVzdENvdW50KCk7XG4gICAgICB2YXIgZWxlbWVudHNEO1xuICAgICAgdmFyIGVsZW1lbnRzUztcbiAgICAgIGlmIChjb3VudDEgPD0gY291bnQyKSB7Ly8gc2VsZWN0IHRoZSBiZXN0IGF4aXNcbiAgICAgICAgYXhpczIgPSB0aGlzLmF4ZXNTW3RoaXMuaW5kZXgxXTtcbiAgICAgICAgYXhpczIuc29ydCgpO1xuICAgICAgICBlbGVtZW50c0QgPSBheGlzMS5lbGVtZW50cztcbiAgICAgICAgZWxlbWVudHNTID0gYXhpczIuZWxlbWVudHM7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBheGlzMSA9IHRoaXMuYXhlc1NbdGhpcy5pbmRleDJdO1xuICAgICAgICBheGlzMS5zb3J0KCk7XG4gICAgICAgIGVsZW1lbnRzRCA9IGF4aXMyLmVsZW1lbnRzO1xuICAgICAgICBlbGVtZW50c1MgPSBheGlzMS5lbGVtZW50cztcbiAgICAgICAgdGhpcy5pbmRleDEgXj0gdGhpcy5pbmRleDI7XG4gICAgICAgIHRoaXMuaW5kZXgyIF49IHRoaXMuaW5kZXgxO1xuICAgICAgICB0aGlzLmluZGV4MSBePSB0aGlzLmluZGV4MjtcbiAgICAgIH1cbiAgICAgIHZhciBhY3RpdmVEO1xuICAgICAgdmFyIGFjdGl2ZVM7XG4gICAgICB2YXIgcCA9IDA7XG4gICAgICB2YXIgcSA9IDA7XG4gICAgICB3aGlsZSAocCA8IHRoaXMubnVtRWxlbWVudHNEKSB7XG4gICAgICAgIHZhciBlMTtcbiAgICAgICAgdmFyIGR5bjtcbiAgICAgICAgaWYgKHEgPT0gdGhpcy5udW1FbGVtZW50c1MpIHtcbiAgICAgICAgICBlMSA9IGVsZW1lbnRzRFtwXTtcbiAgICAgICAgICBkeW4gPSB0cnVlO1xuICAgICAgICAgIHArKztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YXIgZCA9IGVsZW1lbnRzRFtwXTtcbiAgICAgICAgICB2YXIgcyA9IGVsZW1lbnRzU1txXTtcbiAgICAgICAgICBpZiAoZC52YWx1ZSA8IHMudmFsdWUpIHtcbiAgICAgICAgICAgIGUxID0gZDtcbiAgICAgICAgICAgIGR5biA9IHRydWU7XG4gICAgICAgICAgICBwKys7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGUxID0gcztcbiAgICAgICAgICAgIGR5biA9IGZhbHNlO1xuICAgICAgICAgICAgcSsrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoIWUxLm1heCkge1xuICAgICAgICAgIHZhciBzMSA9IGUxLnByb3h5LnNoYXBlO1xuICAgICAgICAgIHZhciBtaW4xID0gZTEubWluMS52YWx1ZTtcbiAgICAgICAgICB2YXIgbWF4MSA9IGUxLm1heDEudmFsdWU7XG4gICAgICAgICAgdmFyIG1pbjIgPSBlMS5taW4yLnZhbHVlO1xuICAgICAgICAgIHZhciBtYXgyID0gZTEubWF4Mi52YWx1ZTtcblxuICAgICAgICAgIGZvciAodmFyIGUyID0gYWN0aXZlRDsgZTIgIT0gbnVsbDsgZTIgPSBlMi5wYWlyKSB7Ly8gdGVzdCBmb3IgZHluYW1pY1xuICAgICAgICAgICAgdmFyIHMyID0gZTIucHJveHkuc2hhcGU7XG5cbiAgICAgICAgICAgIHRoaXMubnVtUGFpckNoZWNrcysrO1xuICAgICAgICAgICAgaWYgKG1pbjEgPiBlMi5tYXgxLnZhbHVlIHx8IG1heDEgPCBlMi5taW4xLnZhbHVlIHx8IG1pbjIgPiBlMi5tYXgyLnZhbHVlIHx8IG1heDIgPCBlMi5taW4yLnZhbHVlIHx8ICF0aGlzLmlzQXZhaWxhYmxlUGFpcihzMSwgczIpKSBjb250aW51ZTtcbiAgICAgICAgICAgIHRoaXMuYWRkUGFpcihzMSwgczIpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoZHluKSB7XG4gICAgICAgICAgICBmb3IgKGUyID0gYWN0aXZlUzsgZTIgIT0gbnVsbDsgZTIgPSBlMi5wYWlyKSB7Ly8gdGVzdCBmb3Igc3RhdGljXG4gICAgICAgICAgICAgIHMyID0gZTIucHJveHkuc2hhcGU7XG5cbiAgICAgICAgICAgICAgdGhpcy5udW1QYWlyQ2hlY2tzKys7XG5cbiAgICAgICAgICAgICAgaWYgKG1pbjEgPiBlMi5tYXgxLnZhbHVlIHx8IG1heDEgPCBlMi5taW4xLnZhbHVlIHx8IG1pbjIgPiBlMi5tYXgyLnZhbHVlIHx8IG1heDIgPCBlMi5taW4yLnZhbHVlIHx8ICF0aGlzLmlzQXZhaWxhYmxlUGFpcihzMSwgczIpKSBjb250aW51ZTtcbiAgICAgICAgICAgICAgdGhpcy5hZGRQYWlyKHMxLCBzMik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlMS5wYWlyID0gYWN0aXZlRDtcbiAgICAgICAgICAgIGFjdGl2ZUQgPSBlMTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZTEucGFpciA9IGFjdGl2ZVM7XG4gICAgICAgICAgICBhY3RpdmVTID0gZTE7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhciBtaW4gPSBlMS5wYWlyO1xuICAgICAgICAgIGlmIChkeW4pIHtcbiAgICAgICAgICAgIGlmIChtaW4gPT0gYWN0aXZlRCkge1xuICAgICAgICAgICAgICBhY3RpdmVEID0gYWN0aXZlRC5wYWlyO1xuICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGUxID0gYWN0aXZlRDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKG1pbiA9PSBhY3RpdmVTKSB7XG4gICAgICAgICAgICAgIGFjdGl2ZVMgPSBhY3RpdmVTLnBhaXI7XG4gICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgZTEgPSBhY3RpdmVTO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICB3aGlsZSAoZTEpIHtcbiAgICAgICAgICAgIGUyID0gZTEucGFpcjtcbiAgICAgICAgICAgIGlmIChlMiA9PSBtaW4pIHtcbiAgICAgICAgICAgICAgZTEucGFpciA9IGUyLnBhaXI7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZTEgPSBlMjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRoaXMuaW5kZXgyID0gKHRoaXMuaW5kZXgxIHwgdGhpcy5pbmRleDIpIF4gMztcblxuICAgIH1cblxuICB9KTtcblxuICAvKipcbiAgKiBBIG5vZGUgb2YgdGhlIGR5bmFtaWMgYm91bmRpbmcgdm9sdW1lIHRyZWUuXG4gICogQGF1dGhvciBzYWhhcmFuXG4gICovXG5cbiAgZnVuY3Rpb24gREJWVE5vZGUoKSB7XG5cbiAgICAvLyBUaGUgZmlyc3QgY2hpbGQgbm9kZSBvZiB0aGlzIG5vZGUuXG4gICAgdGhpcy5jaGlsZDEgPSBudWxsO1xuICAgIC8vIFRoZSBzZWNvbmQgY2hpbGQgbm9kZSBvZiB0aGlzIG5vZGUuXG4gICAgdGhpcy5jaGlsZDIgPSBudWxsO1xuICAgIC8vICBUaGUgcGFyZW50IG5vZGUgb2YgdGhpcyB0cmVlLlxuICAgIHRoaXMucGFyZW50ID0gbnVsbDtcbiAgICAvLyBUaGUgcHJveHkgb2YgdGhpcyBub2RlLiBUaGlzIGhhcyBubyB2YWx1ZSBpZiB0aGlzIG5vZGUgaXMgbm90IGxlYWYuXG4gICAgdGhpcy5wcm94eSA9IG51bGw7XG4gICAgLy8gVGhlIG1heGltdW0gZGlzdGFuY2UgZnJvbSBsZWFmIG5vZGVzLlxuICAgIHRoaXMuaGVpZ2h0ID0gMDtcbiAgICAvLyBUaGUgQUFCQiBvZiB0aGlzIG5vZGUuXG4gICAgdGhpcy5hYWJiID0gbmV3IEFBQkIoKTtcblxuICB9XG5cbiAgLyoqXG4gICAqIEEgZHluYW1pYyBib3VuZGluZyB2b2x1bWUgdHJlZSBmb3IgdGhlIGJyb2FkLXBoYXNlIGFsZ29yaXRobS5cbiAgICpcbiAgICogQGF1dGhvciBzYWhhcmFuXG4gICAqIEBhdXRob3IgbG8tdGhcbiAgICovXG5cbiAgZnVuY3Rpb24gREJWVCgpIHtcblxuICAgIC8vIFRoZSByb290IG9mIHRoZSB0cmVlLlxuICAgIHRoaXMucm9vdCA9IG51bGw7XG4gICAgdGhpcy5mcmVlTm9kZXMgPSBbXTtcbiAgICB0aGlzLmZyZWVOb2Rlcy5sZW5ndGggPSAxNjM4NDtcbiAgICB0aGlzLm51bUZyZWVOb2RlcyA9IDA7XG4gICAgdGhpcy5hYWJiID0gbmV3IEFBQkIoKTtcblxuICB9XG4gIE9iamVjdC5hc3NpZ24oREJWVC5wcm90b3R5cGUsIHtcblxuICAgIERCVlQ6IHRydWUsXG5cbiAgICBtb3ZlTGVhZjogZnVuY3Rpb24gKGxlYWYpIHtcblxuICAgICAgdGhpcy5kZWxldGVMZWFmKGxlYWYpO1xuICAgICAgdGhpcy5pbnNlcnRMZWFmKGxlYWYpO1xuXG4gICAgfSxcblxuICAgIGluc2VydExlYWY6IGZ1bmN0aW9uIChsZWFmKSB7XG5cbiAgICAgIGlmICh0aGlzLnJvb3QgPT0gbnVsbCkge1xuICAgICAgICB0aGlzLnJvb3QgPSBsZWFmO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB2YXIgbGIgPSBsZWFmLmFhYmI7XG4gICAgICB2YXIgc2libGluZyA9IHRoaXMucm9vdDtcbiAgICAgIHZhciBvbGRBcmVhO1xuICAgICAgdmFyIG5ld0FyZWE7XG4gICAgICB3aGlsZSAoc2libGluZy5wcm94eSA9PSBudWxsKSB7IC8vIGRlc2NlbmQgdGhlIG5vZGUgdG8gc2VhcmNoIHRoZSBiZXN0IHBhaXJcbiAgICAgICAgdmFyIGMxID0gc2libGluZy5jaGlsZDE7XG4gICAgICAgIHZhciBjMiA9IHNpYmxpbmcuY2hpbGQyO1xuICAgICAgICB2YXIgYiA9IHNpYmxpbmcuYWFiYjtcbiAgICAgICAgdmFyIGMxYiA9IGMxLmFhYmI7XG4gICAgICAgIHZhciBjMmIgPSBjMi5hYWJiO1xuICAgICAgICBvbGRBcmVhID0gYi5zdXJmYWNlQXJlYSgpO1xuICAgICAgICB0aGlzLmFhYmIuY29tYmluZShsYiwgYik7XG4gICAgICAgIG5ld0FyZWEgPSB0aGlzLmFhYmIuc3VyZmFjZUFyZWEoKTtcbiAgICAgICAgdmFyIGNyZWF0aW5nQ29zdCA9IG5ld0FyZWEgKiAyO1xuICAgICAgICB2YXIgaW5jcmVtZW50YWxDb3N0ID0gKG5ld0FyZWEgLSBvbGRBcmVhKSAqIDI7IC8vIGNvc3Qgb2YgY3JlYXRpbmcgYSBuZXcgcGFpciB3aXRoIHRoZSBub2RlXG4gICAgICAgIHZhciBkaXNjZW5kaW5nQ29zdDEgPSBpbmNyZW1lbnRhbENvc3Q7XG4gICAgICAgIHRoaXMuYWFiYi5jb21iaW5lKGxiLCBjMWIpO1xuICAgICAgICBpZiAoYzEucHJveHkgIT0gbnVsbCkge1xuICAgICAgICAgIC8vIGxlYWYgY29zdCA9IGFyZWEoY29tYmluZWQgYWFiYilcbiAgICAgICAgICBkaXNjZW5kaW5nQ29zdDEgKz0gdGhpcy5hYWJiLnN1cmZhY2VBcmVhKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gbm9kZSBjb3N0ID0gYXJlYShjb21iaW5lZCBhYWJiKSAtIGFyZWEob2xkIGFhYmIpXG4gICAgICAgICAgZGlzY2VuZGluZ0Nvc3QxICs9IHRoaXMuYWFiYi5zdXJmYWNlQXJlYSgpIC0gYzFiLnN1cmZhY2VBcmVhKCk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGRpc2NlbmRpbmdDb3N0MiA9IGluY3JlbWVudGFsQ29zdDtcbiAgICAgICAgdGhpcy5hYWJiLmNvbWJpbmUobGIsIGMyYik7XG4gICAgICAgIGlmIChjMi5wcm94eSAhPSBudWxsKSB7XG4gICAgICAgICAgLy8gbGVhZiBjb3N0ID0gYXJlYShjb21iaW5lZCBhYWJiKVxuICAgICAgICAgIGRpc2NlbmRpbmdDb3N0MiArPSB0aGlzLmFhYmIuc3VyZmFjZUFyZWEoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBub2RlIGNvc3QgPSBhcmVhKGNvbWJpbmVkIGFhYmIpIC0gYXJlYShvbGQgYWFiYilcbiAgICAgICAgICBkaXNjZW5kaW5nQ29zdDIgKz0gdGhpcy5hYWJiLnN1cmZhY2VBcmVhKCkgLSBjMmIuc3VyZmFjZUFyZWEoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZGlzY2VuZGluZ0Nvc3QxIDwgZGlzY2VuZGluZ0Nvc3QyKSB7XG4gICAgICAgICAgaWYgKGNyZWF0aW5nQ29zdCA8IGRpc2NlbmRpbmdDb3N0MSkge1xuICAgICAgICAgICAgYnJlYWs7Ly8gc3RvcCBkZXNjZW5kaW5nXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNpYmxpbmcgPSBjMTsvLyBkZXNjZW5kIGludG8gZmlyc3QgY2hpbGRcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKGNyZWF0aW5nQ29zdCA8IGRpc2NlbmRpbmdDb3N0Mikge1xuICAgICAgICAgICAgYnJlYWs7Ly8gc3RvcCBkZXNjZW5kaW5nXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNpYmxpbmcgPSBjMjsvLyBkZXNjZW5kIGludG8gc2Vjb25kIGNoaWxkXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICB2YXIgb2xkUGFyZW50ID0gc2libGluZy5wYXJlbnQ7XG4gICAgICB2YXIgbmV3UGFyZW50O1xuICAgICAgaWYgKHRoaXMubnVtRnJlZU5vZGVzID4gMCkge1xuICAgICAgICBuZXdQYXJlbnQgPSB0aGlzLmZyZWVOb2Rlc1stLXRoaXMubnVtRnJlZU5vZGVzXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5ld1BhcmVudCA9IG5ldyBEQlZUTm9kZSgpO1xuICAgICAgfVxuXG4gICAgICBuZXdQYXJlbnQucGFyZW50ID0gb2xkUGFyZW50O1xuICAgICAgbmV3UGFyZW50LmNoaWxkMSA9IGxlYWY7XG4gICAgICBuZXdQYXJlbnQuY2hpbGQyID0gc2libGluZztcbiAgICAgIG5ld1BhcmVudC5hYWJiLmNvbWJpbmUobGVhZi5hYWJiLCBzaWJsaW5nLmFhYmIpO1xuICAgICAgbmV3UGFyZW50LmhlaWdodCA9IHNpYmxpbmcuaGVpZ2h0ICsgMTtcbiAgICAgIHNpYmxpbmcucGFyZW50ID0gbmV3UGFyZW50O1xuICAgICAgbGVhZi5wYXJlbnQgPSBuZXdQYXJlbnQ7XG4gICAgICBpZiAoc2libGluZyA9PSB0aGlzLnJvb3QpIHtcbiAgICAgICAgLy8gcmVwbGFjZSByb290XG4gICAgICAgIHRoaXMucm9vdCA9IG5ld1BhcmVudDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIHJlcGxhY2UgY2hpbGRcbiAgICAgICAgaWYgKG9sZFBhcmVudC5jaGlsZDEgPT0gc2libGluZykge1xuICAgICAgICAgIG9sZFBhcmVudC5jaGlsZDEgPSBuZXdQYXJlbnQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgb2xkUGFyZW50LmNoaWxkMiA9IG5ld1BhcmVudDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy8gdXBkYXRlIHdob2xlIHRyZWVcbiAgICAgIGRvIHtcbiAgICAgICAgbmV3UGFyZW50ID0gdGhpcy5iYWxhbmNlKG5ld1BhcmVudCk7XG4gICAgICAgIHRoaXMuZml4KG5ld1BhcmVudCk7XG4gICAgICAgIG5ld1BhcmVudCA9IG5ld1BhcmVudC5wYXJlbnQ7XG4gICAgICB9IHdoaWxlIChuZXdQYXJlbnQgIT0gbnVsbCk7XG4gICAgfSxcblxuICAgIGdldEJhbGFuY2U6IGZ1bmN0aW9uIChub2RlKSB7XG5cbiAgICAgIGlmIChub2RlLnByb3h5ICE9IG51bGwpIHJldHVybiAwO1xuICAgICAgcmV0dXJuIG5vZGUuY2hpbGQxLmhlaWdodCAtIG5vZGUuY2hpbGQyLmhlaWdodDtcblxuICAgIH0sXG5cbiAgICBkZWxldGVMZWFmOiBmdW5jdGlvbiAobGVhZikge1xuXG4gICAgICBpZiAobGVhZiA9PSB0aGlzLnJvb3QpIHtcbiAgICAgICAgdGhpcy5yb290ID0gbnVsbDtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdmFyIHBhcmVudCA9IGxlYWYucGFyZW50O1xuICAgICAgdmFyIHNpYmxpbmc7XG4gICAgICBpZiAocGFyZW50LmNoaWxkMSA9PSBsZWFmKSB7XG4gICAgICAgIHNpYmxpbmcgPSBwYXJlbnQuY2hpbGQyO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2libGluZyA9IHBhcmVudC5jaGlsZDE7XG4gICAgICB9XG4gICAgICBpZiAocGFyZW50ID09IHRoaXMucm9vdCkge1xuICAgICAgICB0aGlzLnJvb3QgPSBzaWJsaW5nO1xuICAgICAgICBzaWJsaW5nLnBhcmVudCA9IG51bGw7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHZhciBncmFuZFBhcmVudCA9IHBhcmVudC5wYXJlbnQ7XG4gICAgICBzaWJsaW5nLnBhcmVudCA9IGdyYW5kUGFyZW50O1xuICAgICAgaWYgKGdyYW5kUGFyZW50LmNoaWxkMSA9PSBwYXJlbnQpIHtcbiAgICAgICAgZ3JhbmRQYXJlbnQuY2hpbGQxID0gc2libGluZztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGdyYW5kUGFyZW50LmNoaWxkMiA9IHNpYmxpbmc7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5udW1GcmVlTm9kZXMgPCAxNjM4NCkge1xuICAgICAgICB0aGlzLmZyZWVOb2Rlc1t0aGlzLm51bUZyZWVOb2RlcysrXSA9IHBhcmVudDtcbiAgICAgIH1cbiAgICAgIGRvIHtcbiAgICAgICAgZ3JhbmRQYXJlbnQgPSB0aGlzLmJhbGFuY2UoZ3JhbmRQYXJlbnQpO1xuICAgICAgICB0aGlzLmZpeChncmFuZFBhcmVudCk7XG4gICAgICAgIGdyYW5kUGFyZW50ID0gZ3JhbmRQYXJlbnQucGFyZW50O1xuICAgICAgfSB3aGlsZSAoZ3JhbmRQYXJlbnQgIT0gbnVsbCk7XG5cbiAgICB9LFxuXG4gICAgYmFsYW5jZTogZnVuY3Rpb24gKG5vZGUpIHtcblxuICAgICAgdmFyIG5oID0gbm9kZS5oZWlnaHQ7XG4gICAgICBpZiAobmggPCAyKSB7XG4gICAgICAgIHJldHVybiBub2RlO1xuICAgICAgfVxuICAgICAgdmFyIHAgPSBub2RlLnBhcmVudDtcbiAgICAgIHZhciBsID0gbm9kZS5jaGlsZDE7XG4gICAgICB2YXIgciA9IG5vZGUuY2hpbGQyO1xuICAgICAgdmFyIGxoID0gbC5oZWlnaHQ7XG4gICAgICB2YXIgcmggPSByLmhlaWdodDtcbiAgICAgIHZhciBiYWxhbmNlID0gbGggLSByaDtcbiAgICAgIHZhciB0Oy8vIGZvciBiaXQgb3BlcmF0aW9uXG5cbiAgICAgIC8vICAgICAgICAgIFsgTiBdXG4gICAgICAvLyAgICAgICAgIC8gICAgIFxcXG4gICAgICAvLyAgICBbIEwgXSAgICAgICBbIFIgXVxuICAgICAgLy8gICAgIC8gXFwgICAgICAgICAvIFxcXG4gICAgICAvLyBbTC1MXSBbTC1SXSBbUi1MXSBbUi1SXVxuXG4gICAgICAvLyBJcyB0aGUgdHJlZSBiYWxhbmNlZD9cbiAgICAgIGlmIChiYWxhbmNlID4gMSkge1xuICAgICAgICB2YXIgbGwgPSBsLmNoaWxkMTtcbiAgICAgICAgdmFyIGxyID0gbC5jaGlsZDI7XG4gICAgICAgIHZhciBsbGggPSBsbC5oZWlnaHQ7XG4gICAgICAgIHZhciBscmggPSBsci5oZWlnaHQ7XG5cbiAgICAgICAgLy8gSXMgTC1MIGhpZ2hlciB0aGFuIEwtUj9cbiAgICAgICAgaWYgKGxsaCA+IGxyaCkge1xuICAgICAgICAgIC8vIHNldCBOIHRvIEwtUlxuICAgICAgICAgIGwuY2hpbGQyID0gbm9kZTtcbiAgICAgICAgICBub2RlLnBhcmVudCA9IGw7XG5cbiAgICAgICAgICAvLyAgICAgICAgICBbIEwgXVxuICAgICAgICAgIC8vICAgICAgICAgLyAgICAgXFxcbiAgICAgICAgICAvLyAgICBbTC1MXSAgICAgICBbIE4gXVxuICAgICAgICAgIC8vICAgICAvIFxcICAgICAgICAgLyBcXFxuICAgICAgICAgIC8vIFsuLi5dIFsuLi5dIFsgTCBdIFsgUiBdXG5cbiAgICAgICAgICAvLyBzZXQgTC1SXG4gICAgICAgICAgbm9kZS5jaGlsZDEgPSBscjtcbiAgICAgICAgICBsci5wYXJlbnQgPSBub2RlO1xuXG4gICAgICAgICAgLy8gICAgICAgICAgWyBMIF1cbiAgICAgICAgICAvLyAgICAgICAgIC8gICAgIFxcXG4gICAgICAgICAgLy8gICAgW0wtTF0gICAgICAgWyBOIF1cbiAgICAgICAgICAvLyAgICAgLyBcXCAgICAgICAgIC8gXFxcbiAgICAgICAgICAvLyBbLi4uXSBbLi4uXSBbTC1SXSBbIFIgXVxuXG4gICAgICAgICAgLy8gZml4IGJvdW5kcyBhbmQgaGVpZ2h0c1xuICAgICAgICAgIG5vZGUuYWFiYi5jb21iaW5lKGxyLmFhYmIsIHIuYWFiYik7XG4gICAgICAgICAgdCA9IGxyaCAtIHJoO1xuICAgICAgICAgIG5vZGUuaGVpZ2h0ID0gbHJoIC0gKHQgJiB0ID4+IDMxKSArIDE7XG4gICAgICAgICAgbC5hYWJiLmNvbWJpbmUobGwuYWFiYiwgbm9kZS5hYWJiKTtcbiAgICAgICAgICB0ID0gbGxoIC0gbmg7XG4gICAgICAgICAgbC5oZWlnaHQgPSBsbGggLSAodCAmIHQgPj4gMzEpICsgMTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBzZXQgTiB0byBMLUxcbiAgICAgICAgICBsLmNoaWxkMSA9IG5vZGU7XG4gICAgICAgICAgbm9kZS5wYXJlbnQgPSBsO1xuXG4gICAgICAgICAgLy8gICAgICAgICAgWyBMIF1cbiAgICAgICAgICAvLyAgICAgICAgIC8gICAgIFxcXG4gICAgICAgICAgLy8gICAgWyBOIF0gICAgICAgW0wtUl1cbiAgICAgICAgICAvLyAgICAgLyBcXCAgICAgICAgIC8gXFxcbiAgICAgICAgICAvLyBbIEwgXSBbIFIgXSBbLi4uXSBbLi4uXVxuXG4gICAgICAgICAgLy8gc2V0IEwtTFxuICAgICAgICAgIG5vZGUuY2hpbGQxID0gbGw7XG4gICAgICAgICAgbGwucGFyZW50ID0gbm9kZTtcblxuICAgICAgICAgIC8vICAgICAgICAgIFsgTCBdXG4gICAgICAgICAgLy8gICAgICAgICAvICAgICBcXFxuICAgICAgICAgIC8vICAgIFsgTiBdICAgICAgIFtMLVJdXG4gICAgICAgICAgLy8gICAgIC8gXFwgICAgICAgICAvIFxcXG4gICAgICAgICAgLy8gW0wtTF0gWyBSIF0gWy4uLl0gWy4uLl1cblxuICAgICAgICAgIC8vIGZpeCBib3VuZHMgYW5kIGhlaWdodHNcbiAgICAgICAgICBub2RlLmFhYmIuY29tYmluZShsbC5hYWJiLCByLmFhYmIpO1xuICAgICAgICAgIHQgPSBsbGggLSByaDtcbiAgICAgICAgICBub2RlLmhlaWdodCA9IGxsaCAtICh0ICYgdCA+PiAzMSkgKyAxO1xuXG4gICAgICAgICAgbC5hYWJiLmNvbWJpbmUobm9kZS5hYWJiLCBsci5hYWJiKTtcbiAgICAgICAgICB0ID0gbmggLSBscmg7XG4gICAgICAgICAgbC5oZWlnaHQgPSBuaCAtICh0ICYgdCA+PiAzMSkgKyAxO1xuICAgICAgICB9XG4gICAgICAgIC8vIHNldCBuZXcgcGFyZW50IG9mIExcbiAgICAgICAgaWYgKHAgIT0gbnVsbCkge1xuICAgICAgICAgIGlmIChwLmNoaWxkMSA9PSBub2RlKSB7XG4gICAgICAgICAgICBwLmNoaWxkMSA9IGw7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHAuY2hpbGQyID0gbDtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5yb290ID0gbDtcbiAgICAgICAgfVxuICAgICAgICBsLnBhcmVudCA9IHA7XG4gICAgICAgIHJldHVybiBsO1xuICAgICAgfSBlbHNlIGlmIChiYWxhbmNlIDwgLTEpIHtcbiAgICAgICAgdmFyIHJsID0gci5jaGlsZDE7XG4gICAgICAgIHZhciByciA9IHIuY2hpbGQyO1xuICAgICAgICB2YXIgcmxoID0gcmwuaGVpZ2h0O1xuICAgICAgICB2YXIgcnJoID0gcnIuaGVpZ2h0O1xuXG4gICAgICAgIC8vIElzIFItTCBoaWdoZXIgdGhhbiBSLVI/XG4gICAgICAgIGlmIChybGggPiBycmgpIHtcbiAgICAgICAgICAvLyBzZXQgTiB0byBSLVJcbiAgICAgICAgICByLmNoaWxkMiA9IG5vZGU7XG4gICAgICAgICAgbm9kZS5wYXJlbnQgPSByO1xuXG4gICAgICAgICAgLy8gICAgICAgICAgWyBSIF1cbiAgICAgICAgICAvLyAgICAgICAgIC8gICAgIFxcXG4gICAgICAgICAgLy8gICAgW1ItTF0gICAgICAgWyBOIF1cbiAgICAgICAgICAvLyAgICAgLyBcXCAgICAgICAgIC8gXFxcbiAgICAgICAgICAvLyBbLi4uXSBbLi4uXSBbIEwgXSBbIFIgXVxuXG4gICAgICAgICAgLy8gc2V0IFItUlxuICAgICAgICAgIG5vZGUuY2hpbGQyID0gcnI7XG4gICAgICAgICAgcnIucGFyZW50ID0gbm9kZTtcblxuICAgICAgICAgIC8vICAgICAgICAgIFsgUiBdXG4gICAgICAgICAgLy8gICAgICAgICAvICAgICBcXFxuICAgICAgICAgIC8vICAgIFtSLUxdICAgICAgIFsgTiBdXG4gICAgICAgICAgLy8gICAgIC8gXFwgICAgICAgICAvIFxcXG4gICAgICAgICAgLy8gWy4uLl0gWy4uLl0gWyBMIF0gW1ItUl1cblxuICAgICAgICAgIC8vIGZpeCBib3VuZHMgYW5kIGhlaWdodHNcbiAgICAgICAgICBub2RlLmFhYmIuY29tYmluZShsLmFhYmIsIHJyLmFhYmIpO1xuICAgICAgICAgIHQgPSBsaCAtIHJyaDtcbiAgICAgICAgICBub2RlLmhlaWdodCA9IGxoIC0gKHQgJiB0ID4+IDMxKSArIDE7XG4gICAgICAgICAgci5hYWJiLmNvbWJpbmUocmwuYWFiYiwgbm9kZS5hYWJiKTtcbiAgICAgICAgICB0ID0gcmxoIC0gbmg7XG4gICAgICAgICAgci5oZWlnaHQgPSBybGggLSAodCAmIHQgPj4gMzEpICsgMTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBzZXQgTiB0byBSLUxcbiAgICAgICAgICByLmNoaWxkMSA9IG5vZGU7XG4gICAgICAgICAgbm9kZS5wYXJlbnQgPSByO1xuICAgICAgICAgIC8vICAgICAgICAgIFsgUiBdXG4gICAgICAgICAgLy8gICAgICAgICAvICAgICBcXFxuICAgICAgICAgIC8vICAgIFsgTiBdICAgICAgIFtSLVJdXG4gICAgICAgICAgLy8gICAgIC8gXFwgICAgICAgICAvIFxcXG4gICAgICAgICAgLy8gWyBMIF0gWyBSIF0gWy4uLl0gWy4uLl1cblxuICAgICAgICAgIC8vIHNldCBSLUxcbiAgICAgICAgICBub2RlLmNoaWxkMiA9IHJsO1xuICAgICAgICAgIHJsLnBhcmVudCA9IG5vZGU7XG5cbiAgICAgICAgICAvLyAgICAgICAgICBbIFIgXVxuICAgICAgICAgIC8vICAgICAgICAgLyAgICAgXFxcbiAgICAgICAgICAvLyAgICBbIE4gXSAgICAgICBbUi1SXVxuICAgICAgICAgIC8vICAgICAvIFxcICAgICAgICAgLyBcXFxuICAgICAgICAgIC8vIFsgTCBdIFtSLUxdIFsuLi5dIFsuLi5dXG5cbiAgICAgICAgICAvLyBmaXggYm91bmRzIGFuZCBoZWlnaHRzXG4gICAgICAgICAgbm9kZS5hYWJiLmNvbWJpbmUobC5hYWJiLCBybC5hYWJiKTtcbiAgICAgICAgICB0ID0gbGggLSBybGg7XG4gICAgICAgICAgbm9kZS5oZWlnaHQgPSBsaCAtICh0ICYgdCA+PiAzMSkgKyAxO1xuICAgICAgICAgIHIuYWFiYi5jb21iaW5lKG5vZGUuYWFiYiwgcnIuYWFiYik7XG4gICAgICAgICAgdCA9IG5oIC0gcnJoO1xuICAgICAgICAgIHIuaGVpZ2h0ID0gbmggLSAodCAmIHQgPj4gMzEpICsgMTtcbiAgICAgICAgfVxuICAgICAgICAvLyBzZXQgbmV3IHBhcmVudCBvZiBSXG4gICAgICAgIGlmIChwICE9IG51bGwpIHtcbiAgICAgICAgICBpZiAocC5jaGlsZDEgPT0gbm9kZSkge1xuICAgICAgICAgICAgcC5jaGlsZDEgPSByO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwLmNoaWxkMiA9IHI7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMucm9vdCA9IHI7XG4gICAgICAgIH1cbiAgICAgICAgci5wYXJlbnQgPSBwO1xuICAgICAgICByZXR1cm4gcjtcbiAgICAgIH1cbiAgICAgIHJldHVybiBub2RlO1xuICAgIH0sXG5cbiAgICBmaXg6IGZ1bmN0aW9uIChub2RlKSB7XG5cbiAgICAgIHZhciBjMSA9IG5vZGUuY2hpbGQxO1xuICAgICAgdmFyIGMyID0gbm9kZS5jaGlsZDI7XG4gICAgICBub2RlLmFhYmIuY29tYmluZShjMS5hYWJiLCBjMi5hYWJiKTtcbiAgICAgIG5vZGUuaGVpZ2h0ID0gYzEuaGVpZ2h0IDwgYzIuaGVpZ2h0ID8gYzIuaGVpZ2h0ICsgMSA6IGMxLmhlaWdodCArIDE7XG5cbiAgICB9XG5cbiAgfSk7XG5cbiAgLyoqXG4gICogQSBwcm94eSBmb3IgZHluYW1pYyBib3VuZGluZyB2b2x1bWUgdHJlZSBicm9hZC1waGFzZS5cbiAgKiBAYXV0aG9yIHNhaGFyYW5cbiAgKi9cblxuICBmdW5jdGlvbiBEQlZUUHJveHkoc2hhcGUpIHtcblxuICAgIFByb3h5LmNhbGwodGhpcywgc2hhcGUpO1xuICAgIC8vIFRoZSBsZWFmIG9mIHRoZSBwcm94eS5cbiAgICB0aGlzLmxlYWYgPSBuZXcgREJWVE5vZGUoKTtcbiAgICB0aGlzLmxlYWYucHJveHkgPSB0aGlzO1xuXG4gIH1cbiAgREJWVFByb3h5LnByb3RvdHlwZSA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmNyZWF0ZShQcm94eS5wcm90b3R5cGUpLCB7XG5cbiAgICBjb25zdHJ1Y3RvcjogREJWVFByb3h5LFxuXG4gICAgdXBkYXRlOiBmdW5jdGlvbiAoKSB7XG5cbiAgICB9XG5cbiAgfSk7XG5cbiAgLyoqXG4gICAqIEEgYnJvYWQtcGhhc2UgYWxnb3JpdGhtIHVzaW5nIGR5bmFtaWMgYm91bmRpbmcgdm9sdW1lIHRyZWUuXG4gICAqXG4gICAqIEBhdXRob3Igc2FoYXJhblxuICAgKiBAYXV0aG9yIGxvLXRoXG4gICAqL1xuXG4gIGZ1bmN0aW9uIERCVlRCcm9hZFBoYXNlKCkge1xuXG4gICAgQnJvYWRQaGFzZS5jYWxsKHRoaXMpO1xuXG4gICAgdGhpcy50eXBlcyA9IEJSX0JPVU5ESU5HX1ZPTFVNRV9UUkVFO1xuXG4gICAgdGhpcy50cmVlID0gbmV3IERCVlQoKTtcbiAgICB0aGlzLnN0YWNrID0gW107XG4gICAgdGhpcy5sZWF2ZXMgPSBbXTtcbiAgICB0aGlzLm51bUxlYXZlcyA9IDA7XG5cbiAgfVxuICBEQlZUQnJvYWRQaGFzZS5wcm90b3R5cGUgPSBPYmplY3QuYXNzaWduKE9iamVjdC5jcmVhdGUoQnJvYWRQaGFzZS5wcm90b3R5cGUpLCB7XG5cbiAgICBjb25zdHJ1Y3RvcjogREJWVEJyb2FkUGhhc2UsXG5cbiAgICBjcmVhdGVQcm94eTogZnVuY3Rpb24gKHNoYXBlKSB7XG5cbiAgICAgIHJldHVybiBuZXcgREJWVFByb3h5KHNoYXBlKTtcblxuICAgIH0sXG5cbiAgICBhZGRQcm94eTogZnVuY3Rpb24gKHByb3h5KSB7XG5cbiAgICAgIHRoaXMudHJlZS5pbnNlcnRMZWFmKHByb3h5LmxlYWYpO1xuICAgICAgdGhpcy5sZWF2ZXMucHVzaChwcm94eS5sZWFmKTtcbiAgICAgIHRoaXMubnVtTGVhdmVzKys7XG5cbiAgICB9LFxuXG4gICAgcmVtb3ZlUHJveHk6IGZ1bmN0aW9uIChwcm94eSkge1xuXG4gICAgICB0aGlzLnRyZWUuZGVsZXRlTGVhZihwcm94eS5sZWFmKTtcbiAgICAgIHZhciBuID0gdGhpcy5sZWF2ZXMuaW5kZXhPZihwcm94eS5sZWFmKTtcbiAgICAgIGlmIChuID4gLTEpIHtcbiAgICAgICAgdGhpcy5sZWF2ZXMuc3BsaWNlKG4sIDEpO1xuICAgICAgICB0aGlzLm51bUxlYXZlcy0tO1xuICAgICAgfVxuXG4gICAgfSxcblxuICAgIGNvbGxlY3RQYWlyczogZnVuY3Rpb24gKCkge1xuXG4gICAgICBpZiAodGhpcy5udW1MZWF2ZXMgPCAyKSByZXR1cm47XG5cbiAgICAgIHZhciBsZWFmLCBtYXJnaW4gPSAwLjEsIGkgPSB0aGlzLm51bUxlYXZlcztcblxuICAgICAgd2hpbGUgKGktLSkge1xuXG4gICAgICAgIGxlYWYgPSB0aGlzLmxlYXZlc1tpXTtcblxuICAgICAgICBpZiAobGVhZi5wcm94eS5hYWJiLmludGVyc2VjdFRlc3RUd28obGVhZi5hYWJiKSkge1xuXG4gICAgICAgICAgbGVhZi5hYWJiLmNvcHkobGVhZi5wcm94eS5hYWJiLCBtYXJnaW4pO1xuICAgICAgICAgIHRoaXMudHJlZS5kZWxldGVMZWFmKGxlYWYpO1xuICAgICAgICAgIHRoaXMudHJlZS5pbnNlcnRMZWFmKGxlYWYpO1xuICAgICAgICAgIHRoaXMuY29sbGlkZShsZWFmLCB0aGlzLnRyZWUucm9vdCk7XG5cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgfSxcblxuICAgIGNvbGxpZGU6IGZ1bmN0aW9uIChub2RlMSwgbm9kZTIpIHtcblxuICAgICAgdmFyIHN0YWNrQ291bnQgPSAyO1xuICAgICAgdmFyIHMxLCBzMiwgbjEsIG4yLCBsMSwgbDI7XG4gICAgICB0aGlzLnN0YWNrWzBdID0gbm9kZTE7XG4gICAgICB0aGlzLnN0YWNrWzFdID0gbm9kZTI7XG5cbiAgICAgIHdoaWxlIChzdGFja0NvdW50ID4gMCkge1xuXG4gICAgICAgIG4xID0gdGhpcy5zdGFja1stLXN0YWNrQ291bnRdO1xuICAgICAgICBuMiA9IHRoaXMuc3RhY2tbLS1zdGFja0NvdW50XTtcbiAgICAgICAgbDEgPSBuMS5wcm94eSAhPSBudWxsO1xuICAgICAgICBsMiA9IG4yLnByb3h5ICE9IG51bGw7XG5cbiAgICAgICAgdGhpcy5udW1QYWlyQ2hlY2tzKys7XG5cbiAgICAgICAgaWYgKGwxICYmIGwyKSB7XG4gICAgICAgICAgczEgPSBuMS5wcm94eS5zaGFwZTtcbiAgICAgICAgICBzMiA9IG4yLnByb3h5LnNoYXBlO1xuICAgICAgICAgIGlmIChzMSA9PSBzMiB8fCBzMS5hYWJiLmludGVyc2VjdFRlc3QoczIuYWFiYikgfHwgIXRoaXMuaXNBdmFpbGFibGVQYWlyKHMxLCBzMikpIGNvbnRpbnVlO1xuXG4gICAgICAgICAgdGhpcy5hZGRQYWlyKHMxLCBzMik7XG5cbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgIGlmIChuMS5hYWJiLmludGVyc2VjdFRlc3QobjIuYWFiYikpIGNvbnRpbnVlO1xuXG4gICAgICAgICAgLyppZihzdGFja0NvdW50KzQ+PXRoaXMubWF4U3RhY2spey8vIGV4cGFuZCB0aGUgc3RhY2tcbiAgICAgICAgICAgICAgLy90aGlzLm1heFN0YWNrPDw9MTtcbiAgICAgICAgICAgICAgdGhpcy5tYXhTdGFjayo9MjtcbiAgICAgICAgICAgICAgdmFyIG5ld1N0YWNrID0gW107Ly8gdmVjdG9yXG4gICAgICAgICAgICAgIG5ld1N0YWNrLmxlbmd0aCA9IHRoaXMubWF4U3RhY2s7XG4gICAgICAgICAgICAgIGZvcih2YXIgaT0wO2k8c3RhY2tDb3VudDtpKyspe1xuICAgICAgICAgICAgICAgICAgbmV3U3RhY2tbaV0gPSB0aGlzLnN0YWNrW2ldO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHRoaXMuc3RhY2sgPSBuZXdTdGFjaztcbiAgICAgICAgICB9Ki9cblxuICAgICAgICAgIGlmIChsMiB8fCAhbDEgJiYgKG4xLmFhYmIuc3VyZmFjZUFyZWEoKSA+IG4yLmFhYmIuc3VyZmFjZUFyZWEoKSkpIHtcbiAgICAgICAgICAgIHRoaXMuc3RhY2tbc3RhY2tDb3VudCsrXSA9IG4xLmNoaWxkMTtcbiAgICAgICAgICAgIHRoaXMuc3RhY2tbc3RhY2tDb3VudCsrXSA9IG4yO1xuICAgICAgICAgICAgdGhpcy5zdGFja1tzdGFja0NvdW50KytdID0gbjEuY2hpbGQyO1xuICAgICAgICAgICAgdGhpcy5zdGFja1tzdGFja0NvdW50KytdID0gbjI7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc3RhY2tbc3RhY2tDb3VudCsrXSA9IG4xO1xuICAgICAgICAgICAgdGhpcy5zdGFja1tzdGFja0NvdW50KytdID0gbjIuY2hpbGQxO1xuICAgICAgICAgICAgdGhpcy5zdGFja1tzdGFja0NvdW50KytdID0gbjE7XG4gICAgICAgICAgICB0aGlzLnN0YWNrW3N0YWNrQ291bnQrK10gPSBuMi5jaGlsZDI7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICB9XG5cbiAgfSk7XG5cbiAgZnVuY3Rpb24gQ29sbGlzaW9uRGV0ZWN0b3IoKSB7XG5cbiAgICB0aGlzLmZsaXAgPSBmYWxzZTtcblxuICB9XG4gIE9iamVjdC5hc3NpZ24oQ29sbGlzaW9uRGV0ZWN0b3IucHJvdG90eXBlLCB7XG5cbiAgICBDb2xsaXNpb25EZXRlY3RvcjogdHJ1ZSxcblxuICAgIGRldGVjdENvbGxpc2lvbjogZnVuY3Rpb24gKHNoYXBlMSwgc2hhcGUyLCBtYW5pZm9sZCkge1xuXG4gICAgICBwcmludEVycm9yKFwiQ29sbGlzaW9uRGV0ZWN0b3JcIiwgXCJJbmhlcml0YW5jZSBlcnJvci5cIik7XG5cbiAgICB9XG5cbiAgfSk7XG5cbiAgLyoqXG4gICAqIEEgY29sbGlzaW9uIGRldGVjdG9yIHdoaWNoIGRldGVjdHMgY29sbGlzaW9ucyBiZXR3ZWVuIHR3byBib3hlcy5cbiAgICogQGF1dGhvciBzYWhhcmFuXG4gICAqL1xuICBmdW5jdGlvbiBCb3hCb3hDb2xsaXNpb25EZXRlY3RvcigpIHtcblxuICAgIENvbGxpc2lvbkRldGVjdG9yLmNhbGwodGhpcyk7XG4gICAgdGhpcy5jbGlwVmVydGljZXMxID0gbmV3IEZsb2F0MzJBcnJheSgyNCk7IC8vIDggdmVydGljZXMgeCx5LHpcbiAgICB0aGlzLmNsaXBWZXJ0aWNlczIgPSBuZXcgRmxvYXQzMkFycmF5KDI0KTtcbiAgICB0aGlzLnVzZWQgPSBuZXcgRmxvYXQzMkFycmF5KDgpO1xuXG4gICAgdGhpcy5JTkYgPSAxIC8gMDtcblxuICB9XG4gIEJveEJveENvbGxpc2lvbkRldGVjdG9yLnByb3RvdHlwZSA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmNyZWF0ZShDb2xsaXNpb25EZXRlY3Rvci5wcm90b3R5cGUpLCB7XG5cbiAgICBjb25zdHJ1Y3RvcjogQm94Qm94Q29sbGlzaW9uRGV0ZWN0b3IsXG5cbiAgICBkZXRlY3RDb2xsaXNpb246IGZ1bmN0aW9uIChzaGFwZTEsIHNoYXBlMiwgbWFuaWZvbGQpIHtcbiAgICAgIC8vIFdoYXQgeW91IGFyZSBkb2luZyBcbiAgICAgIC8vIMK3IEkgdG8gcHJlcGFyZSBhIHNlcGFyYXRlIGF4aXMgb2YgdGhlIGZpZnRlZW4gXG4gICAgICAvLy1TaXggaW4gZWFjaCBvZiB0aHJlZSBub3JtYWwgdmVjdG9ycyBvZiB0aGUgeHl6IGRpcmVjdGlvbiBvZiB0aGUgYm94IGJvdGggXG4gICAgICAvLyDCtyBSZW1haW5pbmcgbmluZSAzeDMgYSB2ZWN0b3IgcGVycGVuZGljdWxhciB0byB0aGUgc2lkZSBvZiB0aGUgYm94IDIgYW5kIHRoZSBzaWRlIG9mIHRoZSBib3ggMSBcbiAgICAgIC8vIMK3IENhbGN1bGF0ZSB0aGUgZGVwdGggdG8gdGhlIHNlcGFyYXRpb24gYXhpcyBcblxuICAgICAgLy8gQ2FsY3VsYXRlcyB0aGUgZGlzdGFuY2UgdXNpbmcgdGhlIGlubmVyIHByb2R1Y3QgYW5kIHB1dCB0aGUgYW1vdW50IG9mIGVtYmVkbWVudCBcbiAgICAgIC8vIMK3IEhvd2V2ZXIgYSB2ZXJ0aWNhbCBzZXBhcmF0aW9uIGF4aXMgYW5kIHNpZGUgdG8gd2VpZ2h0IGEgbGl0dGxlIHRvIGF2b2lkIHZpYnJhdGlvbiBcbiAgICAgIC8vIEFuZCBlbmQgd2hlbiB0aGVyZSBpcyBhIHNlcGFyYXRlIGF4aXMgdGhhdCBpcyByZW1vdGUgZXZlbiBvbmUgXG4gICAgICAvLyDCtyBJIGxvb2sgZm9yIHNlcGFyYXRpb24gYXhpcyB3aXRoIGxpdHRsZSB0byBkZW50IG1vc3QgXG4gICAgICAvLyBNZW4gYW5kIGlmIHNlcGFyYXRpb24gYXhpcyBvZiB0aGUgZmlyc3Qgc2l4IC0gZW5kIGNvbGxpc2lvbiBcbiAgICAgIC8vIEhlbmcgSWYgaXQgc2VwYXJhdGUgYXhpcyBvZiBuaW5lIG90aGVyIC0gc2lkZSBjb2xsaXNpb24gXG4gICAgICAvLyBIZW5nIC0gY2FzZSBvZiBhIHNpZGUgY29sbGlzaW9uIFxuICAgICAgLy8gwrcgRmluZCBwb2ludHMgb2YgdHdvIHNpZGVzIG9uIHdoaWNoIHlvdSBtYWRlIOKAi+KAi3RoZSBzZXBhcmF0aW9uIGF4aXMgXG5cbiAgICAgIC8vIENhbGN1bGF0ZXMgdGhlIHBvaW50IG9mIGNsb3Nlc3QgYXBwcm9hY2ggb2YgYSBzdHJhaWdodCBsaW5lIGNvbnNpc3Rpbmcgb2Ygc2VwYXJhdGUgYXhpcyBwb2ludHMgb2J0YWluZWQsIGFuZCB0aGUgY29sbGlzaW9uIHBvaW50IFxuICAgICAgLy8tU3VyZmFjZSAtIHRoZSBjYXNlIG9mIHRoZSBwbGFuZSBjcmFzaCBcbiAgICAgIC8vLUJveCBBLCBib3ggQiBhbmQgdGhlIG90aGVyIGEgYm94IG9mIGJldHRlciBtYWRlIOKAi+KAi2Egc2VwYXJhdGUgYXhpcyBcbiAgICAgIC8vIOKAoiBUaGUgc3VyZmFjZSBBIGFuZCB0aGUgcGxhbmUgdGhhdCBtYWRlIHRoZSBzZXBhcmF0aW9uIGF4aXMgb2YgdGhlIGJveCBBLCBhbmQgQiB0byB0aGUgc3VyZmFjZSB0aGUgZmFjZSBvZiB0aGUgYm94IEIgY2xvc2UgaW4gdGhlIG9wcG9zaXRlIGRpcmVjdGlvbiB0byB0aGUgbW9zdCBpc29sYXRlZCBheGlzIFxuXG4gICAgICAvLyBXaGVuIHZpZXdlZCBmcm9tIHRoZSBmcm9udCBzdXJmYWNlIEEsIGFuZCB0aGUgY3V0IHBhcnQgZXhjZWVkaW5nIHRoZSBhcmVhIG9mIHRoZSBzdXJmYWNlIEEgaXMgYSBzdXJmYWNlIEIgXG4gICAgICAvLy1QbGFuZSBCIGJlY29tZXMgdGhlIDMtOCB0cmlhbmdsZSwgSSBhIGNhbmRpZGF0ZSBmb3IgdGhlIGNvbGxpc2lvbiBwb2ludCB0aGUgdmVydGV4IG9mIHN1cmZhY2UgQiBcbiAgICAgIC8vIOKAoiBJZiBtb3JlIHRoYW4gb25lIGNhbmRpZGF0ZSA1IGV4aXN0cywgc2NyYXBpbmcgdXAgdG8gZm91ciBcblxuICAgICAgLy8gRm9yIHBvdGVudGlhbCBjb2xsaXNpb24gcG9pbnRzIG9mIGFsbCwgdG8gZXhhbWluZSB0aGUgZGlzdGFuY2UgYmV0d2VlbiB0aGUgc3VyZmFjZSBBIFxuICAgICAgLy8g4oCiIElmIHlvdSB3ZXJlIG9uIHRoZSBpbnNpZGUgc3VyZmFjZSBvZiBBLCBhbmQgdGhlIGNvbGxpc2lvbiBwb2ludFxuXG4gICAgICB2YXIgYjE7XG4gICAgICB2YXIgYjI7XG4gICAgICBpZiAoc2hhcGUxLmlkIDwgc2hhcGUyLmlkKSB7XG4gICAgICAgIGIxID0gKHNoYXBlMSk7XG4gICAgICAgIGIyID0gKHNoYXBlMik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBiMSA9IChzaGFwZTIpO1xuICAgICAgICBiMiA9IChzaGFwZTEpO1xuICAgICAgfVxuICAgICAgdmFyIFYxID0gYjEuZWxlbWVudHM7XG4gICAgICB2YXIgVjIgPSBiMi5lbGVtZW50cztcblxuICAgICAgdmFyIEQxID0gYjEuZGltZW50aW9ucztcbiAgICAgIHZhciBEMiA9IGIyLmRpbWVudGlvbnM7XG5cbiAgICAgIHZhciBwMSA9IGIxLnBvc2l0aW9uO1xuICAgICAgdmFyIHAyID0gYjIucG9zaXRpb247XG4gICAgICB2YXIgcDF4ID0gcDEueDtcbiAgICAgIHZhciBwMXkgPSBwMS55O1xuICAgICAgdmFyIHAxeiA9IHAxLno7XG4gICAgICB2YXIgcDJ4ID0gcDIueDtcbiAgICAgIHZhciBwMnkgPSBwMi55O1xuICAgICAgdmFyIHAyeiA9IHAyLno7XG4gICAgICAvLyBkaWZmXG4gICAgICB2YXIgZHggPSBwMnggLSBwMXg7XG4gICAgICB2YXIgZHkgPSBwMnkgLSBwMXk7XG4gICAgICB2YXIgZHogPSBwMnogLSBwMXo7XG4gICAgICAvLyBkaXN0YW5jZVxuICAgICAgdmFyIHcxID0gYjEuaGFsZldpZHRoO1xuICAgICAgdmFyIGgxID0gYjEuaGFsZkhlaWdodDtcbiAgICAgIHZhciBkMSA9IGIxLmhhbGZEZXB0aDtcbiAgICAgIHZhciB3MiA9IGIyLmhhbGZXaWR0aDtcbiAgICAgIHZhciBoMiA9IGIyLmhhbGZIZWlnaHQ7XG4gICAgICB2YXIgZDIgPSBiMi5oYWxmRGVwdGg7XG4gICAgICAvLyBkaXJlY3Rpb25cblxuICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgLy8gMTUgc2VwYXJhdGluZyBheGVzXG4gICAgICAvLyAxfjY6IGZhY2VcbiAgICAgIC8vIDd+ZjogZWRnZVxuICAgICAgLy8gaHR0cDovL21hcnVwZWtlMjk2LmNvbS9DT0xfM0RfTm8xM19PQkJ2c09CQi5odG1sXG4gICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgICAgIHZhciBhMXggPSBEMVswXTtcbiAgICAgIHZhciBhMXkgPSBEMVsxXTtcbiAgICAgIHZhciBhMXogPSBEMVsyXTtcbiAgICAgIHZhciBhMnggPSBEMVszXTtcbiAgICAgIHZhciBhMnkgPSBEMVs0XTtcbiAgICAgIHZhciBhMnogPSBEMVs1XTtcbiAgICAgIHZhciBhM3ggPSBEMVs2XTtcbiAgICAgIHZhciBhM3kgPSBEMVs3XTtcbiAgICAgIHZhciBhM3ogPSBEMVs4XTtcbiAgICAgIHZhciBkMXggPSBEMVs5XTtcbiAgICAgIHZhciBkMXkgPSBEMVsxMF07XG4gICAgICB2YXIgZDF6ID0gRDFbMTFdO1xuICAgICAgdmFyIGQyeCA9IEQxWzEyXTtcbiAgICAgIHZhciBkMnkgPSBEMVsxM107XG4gICAgICB2YXIgZDJ6ID0gRDFbMTRdO1xuICAgICAgdmFyIGQzeCA9IEQxWzE1XTtcbiAgICAgIHZhciBkM3kgPSBEMVsxNl07XG4gICAgICB2YXIgZDN6ID0gRDFbMTddO1xuXG4gICAgICB2YXIgYTR4ID0gRDJbMF07XG4gICAgICB2YXIgYTR5ID0gRDJbMV07XG4gICAgICB2YXIgYTR6ID0gRDJbMl07XG4gICAgICB2YXIgYTV4ID0gRDJbM107XG4gICAgICB2YXIgYTV5ID0gRDJbNF07XG4gICAgICB2YXIgYTV6ID0gRDJbNV07XG4gICAgICB2YXIgYTZ4ID0gRDJbNl07XG4gICAgICB2YXIgYTZ5ID0gRDJbN107XG4gICAgICB2YXIgYTZ6ID0gRDJbOF07XG4gICAgICB2YXIgZDR4ID0gRDJbOV07XG4gICAgICB2YXIgZDR5ID0gRDJbMTBdO1xuICAgICAgdmFyIGQ0eiA9IEQyWzExXTtcbiAgICAgIHZhciBkNXggPSBEMlsxMl07XG4gICAgICB2YXIgZDV5ID0gRDJbMTNdO1xuICAgICAgdmFyIGQ1eiA9IEQyWzE0XTtcbiAgICAgIHZhciBkNnggPSBEMlsxNV07XG4gICAgICB2YXIgZDZ5ID0gRDJbMTZdO1xuICAgICAgdmFyIGQ2eiA9IEQyWzE3XTtcblxuICAgICAgdmFyIGE3eCA9IGExeSAqIGE0eiAtIGExeiAqIGE0eTtcbiAgICAgIHZhciBhN3kgPSBhMXogKiBhNHggLSBhMXggKiBhNHo7XG4gICAgICB2YXIgYTd6ID0gYTF4ICogYTR5IC0gYTF5ICogYTR4O1xuICAgICAgdmFyIGE4eCA9IGExeSAqIGE1eiAtIGExeiAqIGE1eTtcbiAgICAgIHZhciBhOHkgPSBhMXogKiBhNXggLSBhMXggKiBhNXo7XG4gICAgICB2YXIgYTh6ID0gYTF4ICogYTV5IC0gYTF5ICogYTV4O1xuICAgICAgdmFyIGE5eCA9IGExeSAqIGE2eiAtIGExeiAqIGE2eTtcbiAgICAgIHZhciBhOXkgPSBhMXogKiBhNnggLSBhMXggKiBhNno7XG4gICAgICB2YXIgYTl6ID0gYTF4ICogYTZ5IC0gYTF5ICogYTZ4O1xuICAgICAgdmFyIGFheCA9IGEyeSAqIGE0eiAtIGEyeiAqIGE0eTtcbiAgICAgIHZhciBhYXkgPSBhMnogKiBhNHggLSBhMnggKiBhNHo7XG4gICAgICB2YXIgYWF6ID0gYTJ4ICogYTR5IC0gYTJ5ICogYTR4O1xuICAgICAgdmFyIGFieCA9IGEyeSAqIGE1eiAtIGEyeiAqIGE1eTtcbiAgICAgIHZhciBhYnkgPSBhMnogKiBhNXggLSBhMnggKiBhNXo7XG4gICAgICB2YXIgYWJ6ID0gYTJ4ICogYTV5IC0gYTJ5ICogYTV4O1xuICAgICAgdmFyIGFjeCA9IGEyeSAqIGE2eiAtIGEyeiAqIGE2eTtcbiAgICAgIHZhciBhY3kgPSBhMnogKiBhNnggLSBhMnggKiBhNno7XG4gICAgICB2YXIgYWN6ID0gYTJ4ICogYTZ5IC0gYTJ5ICogYTZ4O1xuICAgICAgdmFyIGFkeCA9IGEzeSAqIGE0eiAtIGEzeiAqIGE0eTtcbiAgICAgIHZhciBhZHkgPSBhM3ogKiBhNHggLSBhM3ggKiBhNHo7XG4gICAgICB2YXIgYWR6ID0gYTN4ICogYTR5IC0gYTN5ICogYTR4O1xuICAgICAgdmFyIGFleCA9IGEzeSAqIGE1eiAtIGEzeiAqIGE1eTtcbiAgICAgIHZhciBhZXkgPSBhM3ogKiBhNXggLSBhM3ggKiBhNXo7XG4gICAgICB2YXIgYWV6ID0gYTN4ICogYTV5IC0gYTN5ICogYTV4O1xuICAgICAgdmFyIGFmeCA9IGEzeSAqIGE2eiAtIGEzeiAqIGE2eTtcbiAgICAgIHZhciBhZnkgPSBhM3ogKiBhNnggLSBhM3ggKiBhNno7XG4gICAgICB2YXIgYWZ6ID0gYTN4ICogYTZ5IC0gYTN5ICogYTZ4O1xuICAgICAgLy8gcmlnaHQgb3IgbGVmdCBmbGFnc1xuICAgICAgdmFyIHJpZ2h0MTtcbiAgICAgIHZhciByaWdodDI7XG4gICAgICB2YXIgcmlnaHQzO1xuICAgICAgdmFyIHJpZ2h0NDtcbiAgICAgIHZhciByaWdodDU7XG4gICAgICB2YXIgcmlnaHQ2O1xuICAgICAgdmFyIHJpZ2h0NztcbiAgICAgIHZhciByaWdodDg7XG4gICAgICB2YXIgcmlnaHQ5O1xuICAgICAgdmFyIHJpZ2h0YTtcbiAgICAgIHZhciByaWdodGI7XG4gICAgICB2YXIgcmlnaHRjO1xuICAgICAgdmFyIHJpZ2h0ZDtcbiAgICAgIHZhciByaWdodGU7XG4gICAgICB2YXIgcmlnaHRmO1xuICAgICAgLy8gb3ZlcmxhcHBpbmcgZGlzdGFuY2VzXG4gICAgICB2YXIgb3ZlcmxhcDE7XG4gICAgICB2YXIgb3ZlcmxhcDI7XG4gICAgICB2YXIgb3ZlcmxhcDM7XG4gICAgICB2YXIgb3ZlcmxhcDQ7XG4gICAgICB2YXIgb3ZlcmxhcDU7XG4gICAgICB2YXIgb3ZlcmxhcDY7XG4gICAgICB2YXIgb3ZlcmxhcDc7XG4gICAgICB2YXIgb3ZlcmxhcDg7XG4gICAgICB2YXIgb3ZlcmxhcDk7XG4gICAgICB2YXIgb3ZlcmxhcGE7XG4gICAgICB2YXIgb3ZlcmxhcGI7XG4gICAgICB2YXIgb3ZlcmxhcGM7XG4gICAgICB2YXIgb3ZlcmxhcGQ7XG4gICAgICB2YXIgb3ZlcmxhcGU7XG4gICAgICB2YXIgb3ZlcmxhcGY7XG4gICAgICAvLyBpbnZhbGlkIGZsYWdzXG4gICAgICB2YXIgaW52YWxpZDcgPSBmYWxzZTtcbiAgICAgIHZhciBpbnZhbGlkOCA9IGZhbHNlO1xuICAgICAgdmFyIGludmFsaWQ5ID0gZmFsc2U7XG4gICAgICB2YXIgaW52YWxpZGEgPSBmYWxzZTtcbiAgICAgIHZhciBpbnZhbGlkYiA9IGZhbHNlO1xuICAgICAgdmFyIGludmFsaWRjID0gZmFsc2U7XG4gICAgICB2YXIgaW52YWxpZGQgPSBmYWxzZTtcbiAgICAgIHZhciBpbnZhbGlkZSA9IGZhbHNlO1xuICAgICAgdmFyIGludmFsaWRmID0gZmFsc2U7XG4gICAgICAvLyB0ZW1wb3JhcnkgdmFyaWFibGVzXG4gICAgICB2YXIgbGVuO1xuICAgICAgdmFyIGxlbjE7XG4gICAgICB2YXIgbGVuMjtcbiAgICAgIHZhciBkb3QxO1xuICAgICAgdmFyIGRvdDI7XG4gICAgICB2YXIgZG90MztcbiAgICAgIC8vIHRyeSBheGlzIDFcbiAgICAgIGxlbiA9IGExeCAqIGR4ICsgYTF5ICogZHkgKyBhMXogKiBkejtcbiAgICAgIHJpZ2h0MSA9IGxlbiA+IDA7XG4gICAgICBpZiAoIXJpZ2h0MSkgbGVuID0gLWxlbjtcbiAgICAgIGxlbjEgPSB3MTtcbiAgICAgIGRvdDEgPSBhMXggKiBhNHggKyBhMXkgKiBhNHkgKyBhMXogKiBhNHo7XG4gICAgICBkb3QyID0gYTF4ICogYTV4ICsgYTF5ICogYTV5ICsgYTF6ICogYTV6O1xuICAgICAgZG90MyA9IGExeCAqIGE2eCArIGExeSAqIGE2eSArIGExeiAqIGE2ejtcbiAgICAgIGlmIChkb3QxIDwgMCkgZG90MSA9IC1kb3QxO1xuICAgICAgaWYgKGRvdDIgPCAwKSBkb3QyID0gLWRvdDI7XG4gICAgICBpZiAoZG90MyA8IDApIGRvdDMgPSAtZG90MztcbiAgICAgIGxlbjIgPSBkb3QxICogdzIgKyBkb3QyICogaDIgKyBkb3QzICogZDI7XG4gICAgICBvdmVybGFwMSA9IGxlbiAtIGxlbjEgLSBsZW4yO1xuICAgICAgaWYgKG92ZXJsYXAxID4gMCkgcmV0dXJuO1xuICAgICAgLy8gdHJ5IGF4aXMgMlxuICAgICAgbGVuID0gYTJ4ICogZHggKyBhMnkgKiBkeSArIGEyeiAqIGR6O1xuICAgICAgcmlnaHQyID0gbGVuID4gMDtcbiAgICAgIGlmICghcmlnaHQyKSBsZW4gPSAtbGVuO1xuICAgICAgbGVuMSA9IGgxO1xuICAgICAgZG90MSA9IGEyeCAqIGE0eCArIGEyeSAqIGE0eSArIGEyeiAqIGE0ejtcbiAgICAgIGRvdDIgPSBhMnggKiBhNXggKyBhMnkgKiBhNXkgKyBhMnogKiBhNXo7XG4gICAgICBkb3QzID0gYTJ4ICogYTZ4ICsgYTJ5ICogYTZ5ICsgYTJ6ICogYTZ6O1xuICAgICAgaWYgKGRvdDEgPCAwKSBkb3QxID0gLWRvdDE7XG4gICAgICBpZiAoZG90MiA8IDApIGRvdDIgPSAtZG90MjtcbiAgICAgIGlmIChkb3QzIDwgMCkgZG90MyA9IC1kb3QzO1xuICAgICAgbGVuMiA9IGRvdDEgKiB3MiArIGRvdDIgKiBoMiArIGRvdDMgKiBkMjtcbiAgICAgIG92ZXJsYXAyID0gbGVuIC0gbGVuMSAtIGxlbjI7XG4gICAgICBpZiAob3ZlcmxhcDIgPiAwKSByZXR1cm47XG4gICAgICAvLyB0cnkgYXhpcyAzXG4gICAgICBsZW4gPSBhM3ggKiBkeCArIGEzeSAqIGR5ICsgYTN6ICogZHo7XG4gICAgICByaWdodDMgPSBsZW4gPiAwO1xuICAgICAgaWYgKCFyaWdodDMpIGxlbiA9IC1sZW47XG4gICAgICBsZW4xID0gZDE7XG4gICAgICBkb3QxID0gYTN4ICogYTR4ICsgYTN5ICogYTR5ICsgYTN6ICogYTR6O1xuICAgICAgZG90MiA9IGEzeCAqIGE1eCArIGEzeSAqIGE1eSArIGEzeiAqIGE1ejtcbiAgICAgIGRvdDMgPSBhM3ggKiBhNnggKyBhM3kgKiBhNnkgKyBhM3ogKiBhNno7XG4gICAgICBpZiAoZG90MSA8IDApIGRvdDEgPSAtZG90MTtcbiAgICAgIGlmIChkb3QyIDwgMCkgZG90MiA9IC1kb3QyO1xuICAgICAgaWYgKGRvdDMgPCAwKSBkb3QzID0gLWRvdDM7XG4gICAgICBsZW4yID0gZG90MSAqIHcyICsgZG90MiAqIGgyICsgZG90MyAqIGQyO1xuICAgICAgb3ZlcmxhcDMgPSBsZW4gLSBsZW4xIC0gbGVuMjtcbiAgICAgIGlmIChvdmVybGFwMyA+IDApIHJldHVybjtcbiAgICAgIC8vIHRyeSBheGlzIDRcbiAgICAgIGxlbiA9IGE0eCAqIGR4ICsgYTR5ICogZHkgKyBhNHogKiBkejtcbiAgICAgIHJpZ2h0NCA9IGxlbiA+IDA7XG4gICAgICBpZiAoIXJpZ2h0NCkgbGVuID0gLWxlbjtcbiAgICAgIGRvdDEgPSBhNHggKiBhMXggKyBhNHkgKiBhMXkgKyBhNHogKiBhMXo7XG4gICAgICBkb3QyID0gYTR4ICogYTJ4ICsgYTR5ICogYTJ5ICsgYTR6ICogYTJ6O1xuICAgICAgZG90MyA9IGE0eCAqIGEzeCArIGE0eSAqIGEzeSArIGE0eiAqIGEzejtcbiAgICAgIGlmIChkb3QxIDwgMCkgZG90MSA9IC1kb3QxO1xuICAgICAgaWYgKGRvdDIgPCAwKSBkb3QyID0gLWRvdDI7XG4gICAgICBpZiAoZG90MyA8IDApIGRvdDMgPSAtZG90MztcbiAgICAgIGxlbjEgPSBkb3QxICogdzEgKyBkb3QyICogaDEgKyBkb3QzICogZDE7XG4gICAgICBsZW4yID0gdzI7XG4gICAgICBvdmVybGFwNCA9IChsZW4gLSBsZW4xIC0gbGVuMikgKiAxLjA7XG4gICAgICBpZiAob3ZlcmxhcDQgPiAwKSByZXR1cm47XG4gICAgICAvLyB0cnkgYXhpcyA1XG4gICAgICBsZW4gPSBhNXggKiBkeCArIGE1eSAqIGR5ICsgYTV6ICogZHo7XG4gICAgICByaWdodDUgPSBsZW4gPiAwO1xuICAgICAgaWYgKCFyaWdodDUpIGxlbiA9IC1sZW47XG4gICAgICBkb3QxID0gYTV4ICogYTF4ICsgYTV5ICogYTF5ICsgYTV6ICogYTF6O1xuICAgICAgZG90MiA9IGE1eCAqIGEyeCArIGE1eSAqIGEyeSArIGE1eiAqIGEyejtcbiAgICAgIGRvdDMgPSBhNXggKiBhM3ggKyBhNXkgKiBhM3kgKyBhNXogKiBhM3o7XG4gICAgICBpZiAoZG90MSA8IDApIGRvdDEgPSAtZG90MTtcbiAgICAgIGlmIChkb3QyIDwgMCkgZG90MiA9IC1kb3QyO1xuICAgICAgaWYgKGRvdDMgPCAwKSBkb3QzID0gLWRvdDM7XG4gICAgICBsZW4xID0gZG90MSAqIHcxICsgZG90MiAqIGgxICsgZG90MyAqIGQxO1xuICAgICAgbGVuMiA9IGgyO1xuICAgICAgb3ZlcmxhcDUgPSAobGVuIC0gbGVuMSAtIGxlbjIpICogMS4wO1xuICAgICAgaWYgKG92ZXJsYXA1ID4gMCkgcmV0dXJuO1xuICAgICAgLy8gdHJ5IGF4aXMgNlxuICAgICAgbGVuID0gYTZ4ICogZHggKyBhNnkgKiBkeSArIGE2eiAqIGR6O1xuICAgICAgcmlnaHQ2ID0gbGVuID4gMDtcbiAgICAgIGlmICghcmlnaHQ2KSBsZW4gPSAtbGVuO1xuICAgICAgZG90MSA9IGE2eCAqIGExeCArIGE2eSAqIGExeSArIGE2eiAqIGExejtcbiAgICAgIGRvdDIgPSBhNnggKiBhMnggKyBhNnkgKiBhMnkgKyBhNnogKiBhMno7XG4gICAgICBkb3QzID0gYTZ4ICogYTN4ICsgYTZ5ICogYTN5ICsgYTZ6ICogYTN6O1xuICAgICAgaWYgKGRvdDEgPCAwKSBkb3QxID0gLWRvdDE7XG4gICAgICBpZiAoZG90MiA8IDApIGRvdDIgPSAtZG90MjtcbiAgICAgIGlmIChkb3QzIDwgMCkgZG90MyA9IC1kb3QzO1xuICAgICAgbGVuMSA9IGRvdDEgKiB3MSArIGRvdDIgKiBoMSArIGRvdDMgKiBkMTtcbiAgICAgIGxlbjIgPSBkMjtcbiAgICAgIG92ZXJsYXA2ID0gKGxlbiAtIGxlbjEgLSBsZW4yKSAqIDEuMDtcbiAgICAgIGlmIChvdmVybGFwNiA+IDApIHJldHVybjtcbiAgICAgIC8vIHRyeSBheGlzIDdcbiAgICAgIGxlbiA9IGE3eCAqIGE3eCArIGE3eSAqIGE3eSArIGE3eiAqIGE3ejtcbiAgICAgIGlmIChsZW4gPiAxZS01KSB7XG4gICAgICAgIGxlbiA9IDEgLyBfTWF0aC5zcXJ0KGxlbik7XG4gICAgICAgIGE3eCAqPSBsZW47XG4gICAgICAgIGE3eSAqPSBsZW47XG4gICAgICAgIGE3eiAqPSBsZW47XG4gICAgICAgIGxlbiA9IGE3eCAqIGR4ICsgYTd5ICogZHkgKyBhN3ogKiBkejtcbiAgICAgICAgcmlnaHQ3ID0gbGVuID4gMDtcbiAgICAgICAgaWYgKCFyaWdodDcpIGxlbiA9IC1sZW47XG4gICAgICAgIGRvdDEgPSBhN3ggKiBhMnggKyBhN3kgKiBhMnkgKyBhN3ogKiBhMno7XG4gICAgICAgIGRvdDIgPSBhN3ggKiBhM3ggKyBhN3kgKiBhM3kgKyBhN3ogKiBhM3o7XG4gICAgICAgIGlmIChkb3QxIDwgMCkgZG90MSA9IC1kb3QxO1xuICAgICAgICBpZiAoZG90MiA8IDApIGRvdDIgPSAtZG90MjtcbiAgICAgICAgbGVuMSA9IGRvdDEgKiBoMSArIGRvdDIgKiBkMTtcbiAgICAgICAgZG90MSA9IGE3eCAqIGE1eCArIGE3eSAqIGE1eSArIGE3eiAqIGE1ejtcbiAgICAgICAgZG90MiA9IGE3eCAqIGE2eCArIGE3eSAqIGE2eSArIGE3eiAqIGE2ejtcbiAgICAgICAgaWYgKGRvdDEgPCAwKSBkb3QxID0gLWRvdDE7XG4gICAgICAgIGlmIChkb3QyIDwgMCkgZG90MiA9IC1kb3QyO1xuICAgICAgICBsZW4yID0gZG90MSAqIGgyICsgZG90MiAqIGQyO1xuICAgICAgICBvdmVybGFwNyA9IGxlbiAtIGxlbjEgLSBsZW4yO1xuICAgICAgICBpZiAob3ZlcmxhcDcgPiAwKSByZXR1cm47XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByaWdodDcgPSBmYWxzZTtcbiAgICAgICAgb3ZlcmxhcDcgPSAwO1xuICAgICAgICBpbnZhbGlkNyA9IHRydWU7XG4gICAgICB9XG4gICAgICAvLyB0cnkgYXhpcyA4XG4gICAgICBsZW4gPSBhOHggKiBhOHggKyBhOHkgKiBhOHkgKyBhOHogKiBhOHo7XG4gICAgICBpZiAobGVuID4gMWUtNSkge1xuICAgICAgICBsZW4gPSAxIC8gX01hdGguc3FydChsZW4pO1xuICAgICAgICBhOHggKj0gbGVuO1xuICAgICAgICBhOHkgKj0gbGVuO1xuICAgICAgICBhOHogKj0gbGVuO1xuICAgICAgICBsZW4gPSBhOHggKiBkeCArIGE4eSAqIGR5ICsgYTh6ICogZHo7XG4gICAgICAgIHJpZ2h0OCA9IGxlbiA+IDA7XG4gICAgICAgIGlmICghcmlnaHQ4KSBsZW4gPSAtbGVuO1xuICAgICAgICBkb3QxID0gYTh4ICogYTJ4ICsgYTh5ICogYTJ5ICsgYTh6ICogYTJ6O1xuICAgICAgICBkb3QyID0gYTh4ICogYTN4ICsgYTh5ICogYTN5ICsgYTh6ICogYTN6O1xuICAgICAgICBpZiAoZG90MSA8IDApIGRvdDEgPSAtZG90MTtcbiAgICAgICAgaWYgKGRvdDIgPCAwKSBkb3QyID0gLWRvdDI7XG4gICAgICAgIGxlbjEgPSBkb3QxICogaDEgKyBkb3QyICogZDE7XG4gICAgICAgIGRvdDEgPSBhOHggKiBhNHggKyBhOHkgKiBhNHkgKyBhOHogKiBhNHo7XG4gICAgICAgIGRvdDIgPSBhOHggKiBhNnggKyBhOHkgKiBhNnkgKyBhOHogKiBhNno7XG4gICAgICAgIGlmIChkb3QxIDwgMCkgZG90MSA9IC1kb3QxO1xuICAgICAgICBpZiAoZG90MiA8IDApIGRvdDIgPSAtZG90MjtcbiAgICAgICAgbGVuMiA9IGRvdDEgKiB3MiArIGRvdDIgKiBkMjtcbiAgICAgICAgb3ZlcmxhcDggPSBsZW4gLSBsZW4xIC0gbGVuMjtcbiAgICAgICAgaWYgKG92ZXJsYXA4ID4gMCkgcmV0dXJuO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmlnaHQ4ID0gZmFsc2U7XG4gICAgICAgIG92ZXJsYXA4ID0gMDtcbiAgICAgICAgaW52YWxpZDggPSB0cnVlO1xuICAgICAgfVxuICAgICAgLy8gdHJ5IGF4aXMgOVxuICAgICAgbGVuID0gYTl4ICogYTl4ICsgYTl5ICogYTl5ICsgYTl6ICogYTl6O1xuICAgICAgaWYgKGxlbiA+IDFlLTUpIHtcbiAgICAgICAgbGVuID0gMSAvIF9NYXRoLnNxcnQobGVuKTtcbiAgICAgICAgYTl4ICo9IGxlbjtcbiAgICAgICAgYTl5ICo9IGxlbjtcbiAgICAgICAgYTl6ICo9IGxlbjtcbiAgICAgICAgbGVuID0gYTl4ICogZHggKyBhOXkgKiBkeSArIGE5eiAqIGR6O1xuICAgICAgICByaWdodDkgPSBsZW4gPiAwO1xuICAgICAgICBpZiAoIXJpZ2h0OSkgbGVuID0gLWxlbjtcbiAgICAgICAgZG90MSA9IGE5eCAqIGEyeCArIGE5eSAqIGEyeSArIGE5eiAqIGEyejtcbiAgICAgICAgZG90MiA9IGE5eCAqIGEzeCArIGE5eSAqIGEzeSArIGE5eiAqIGEzejtcbiAgICAgICAgaWYgKGRvdDEgPCAwKSBkb3QxID0gLWRvdDE7XG4gICAgICAgIGlmIChkb3QyIDwgMCkgZG90MiA9IC1kb3QyO1xuICAgICAgICBsZW4xID0gZG90MSAqIGgxICsgZG90MiAqIGQxO1xuICAgICAgICBkb3QxID0gYTl4ICogYTR4ICsgYTl5ICogYTR5ICsgYTl6ICogYTR6O1xuICAgICAgICBkb3QyID0gYTl4ICogYTV4ICsgYTl5ICogYTV5ICsgYTl6ICogYTV6O1xuICAgICAgICBpZiAoZG90MSA8IDApIGRvdDEgPSAtZG90MTtcbiAgICAgICAgaWYgKGRvdDIgPCAwKSBkb3QyID0gLWRvdDI7XG4gICAgICAgIGxlbjIgPSBkb3QxICogdzIgKyBkb3QyICogaDI7XG4gICAgICAgIG92ZXJsYXA5ID0gbGVuIC0gbGVuMSAtIGxlbjI7XG4gICAgICAgIGlmIChvdmVybGFwOSA+IDApIHJldHVybjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJpZ2h0OSA9IGZhbHNlO1xuICAgICAgICBvdmVybGFwOSA9IDA7XG4gICAgICAgIGludmFsaWQ5ID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIC8vIHRyeSBheGlzIDEwXG4gICAgICBsZW4gPSBhYXggKiBhYXggKyBhYXkgKiBhYXkgKyBhYXogKiBhYXo7XG4gICAgICBpZiAobGVuID4gMWUtNSkge1xuICAgICAgICBsZW4gPSAxIC8gX01hdGguc3FydChsZW4pO1xuICAgICAgICBhYXggKj0gbGVuO1xuICAgICAgICBhYXkgKj0gbGVuO1xuICAgICAgICBhYXogKj0gbGVuO1xuICAgICAgICBsZW4gPSBhYXggKiBkeCArIGFheSAqIGR5ICsgYWF6ICogZHo7XG4gICAgICAgIHJpZ2h0YSA9IGxlbiA+IDA7XG4gICAgICAgIGlmICghcmlnaHRhKSBsZW4gPSAtbGVuO1xuICAgICAgICBkb3QxID0gYWF4ICogYTF4ICsgYWF5ICogYTF5ICsgYWF6ICogYTF6O1xuICAgICAgICBkb3QyID0gYWF4ICogYTN4ICsgYWF5ICogYTN5ICsgYWF6ICogYTN6O1xuICAgICAgICBpZiAoZG90MSA8IDApIGRvdDEgPSAtZG90MTtcbiAgICAgICAgaWYgKGRvdDIgPCAwKSBkb3QyID0gLWRvdDI7XG4gICAgICAgIGxlbjEgPSBkb3QxICogdzEgKyBkb3QyICogZDE7XG4gICAgICAgIGRvdDEgPSBhYXggKiBhNXggKyBhYXkgKiBhNXkgKyBhYXogKiBhNXo7XG4gICAgICAgIGRvdDIgPSBhYXggKiBhNnggKyBhYXkgKiBhNnkgKyBhYXogKiBhNno7XG4gICAgICAgIGlmIChkb3QxIDwgMCkgZG90MSA9IC1kb3QxO1xuICAgICAgICBpZiAoZG90MiA8IDApIGRvdDIgPSAtZG90MjtcbiAgICAgICAgbGVuMiA9IGRvdDEgKiBoMiArIGRvdDIgKiBkMjtcbiAgICAgICAgb3ZlcmxhcGEgPSBsZW4gLSBsZW4xIC0gbGVuMjtcbiAgICAgICAgaWYgKG92ZXJsYXBhID4gMCkgcmV0dXJuO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmlnaHRhID0gZmFsc2U7XG4gICAgICAgIG92ZXJsYXBhID0gMDtcbiAgICAgICAgaW52YWxpZGEgPSB0cnVlO1xuICAgICAgfVxuICAgICAgLy8gdHJ5IGF4aXMgMTFcbiAgICAgIGxlbiA9IGFieCAqIGFieCArIGFieSAqIGFieSArIGFieiAqIGFiejtcbiAgICAgIGlmIChsZW4gPiAxZS01KSB7XG4gICAgICAgIGxlbiA9IDEgLyBfTWF0aC5zcXJ0KGxlbik7XG4gICAgICAgIGFieCAqPSBsZW47XG4gICAgICAgIGFieSAqPSBsZW47XG4gICAgICAgIGFieiAqPSBsZW47XG4gICAgICAgIGxlbiA9IGFieCAqIGR4ICsgYWJ5ICogZHkgKyBhYnogKiBkejtcbiAgICAgICAgcmlnaHRiID0gbGVuID4gMDtcbiAgICAgICAgaWYgKCFyaWdodGIpIGxlbiA9IC1sZW47XG4gICAgICAgIGRvdDEgPSBhYnggKiBhMXggKyBhYnkgKiBhMXkgKyBhYnogKiBhMXo7XG4gICAgICAgIGRvdDIgPSBhYnggKiBhM3ggKyBhYnkgKiBhM3kgKyBhYnogKiBhM3o7XG4gICAgICAgIGlmIChkb3QxIDwgMCkgZG90MSA9IC1kb3QxO1xuICAgICAgICBpZiAoZG90MiA8IDApIGRvdDIgPSAtZG90MjtcbiAgICAgICAgbGVuMSA9IGRvdDEgKiB3MSArIGRvdDIgKiBkMTtcbiAgICAgICAgZG90MSA9IGFieCAqIGE0eCArIGFieSAqIGE0eSArIGFieiAqIGE0ejtcbiAgICAgICAgZG90MiA9IGFieCAqIGE2eCArIGFieSAqIGE2eSArIGFieiAqIGE2ejtcbiAgICAgICAgaWYgKGRvdDEgPCAwKSBkb3QxID0gLWRvdDE7XG4gICAgICAgIGlmIChkb3QyIDwgMCkgZG90MiA9IC1kb3QyO1xuICAgICAgICBsZW4yID0gZG90MSAqIHcyICsgZG90MiAqIGQyO1xuICAgICAgICBvdmVybGFwYiA9IGxlbiAtIGxlbjEgLSBsZW4yO1xuICAgICAgICBpZiAob3ZlcmxhcGIgPiAwKSByZXR1cm47XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByaWdodGIgPSBmYWxzZTtcbiAgICAgICAgb3ZlcmxhcGIgPSAwO1xuICAgICAgICBpbnZhbGlkYiA9IHRydWU7XG4gICAgICB9XG4gICAgICAvLyB0cnkgYXhpcyAxMlxuICAgICAgbGVuID0gYWN4ICogYWN4ICsgYWN5ICogYWN5ICsgYWN6ICogYWN6O1xuICAgICAgaWYgKGxlbiA+IDFlLTUpIHtcbiAgICAgICAgbGVuID0gMSAvIF9NYXRoLnNxcnQobGVuKTtcbiAgICAgICAgYWN4ICo9IGxlbjtcbiAgICAgICAgYWN5ICo9IGxlbjtcbiAgICAgICAgYWN6ICo9IGxlbjtcbiAgICAgICAgbGVuID0gYWN4ICogZHggKyBhY3kgKiBkeSArIGFjeiAqIGR6O1xuICAgICAgICByaWdodGMgPSBsZW4gPiAwO1xuICAgICAgICBpZiAoIXJpZ2h0YykgbGVuID0gLWxlbjtcbiAgICAgICAgZG90MSA9IGFjeCAqIGExeCArIGFjeSAqIGExeSArIGFjeiAqIGExejtcbiAgICAgICAgZG90MiA9IGFjeCAqIGEzeCArIGFjeSAqIGEzeSArIGFjeiAqIGEzejtcbiAgICAgICAgaWYgKGRvdDEgPCAwKSBkb3QxID0gLWRvdDE7XG4gICAgICAgIGlmIChkb3QyIDwgMCkgZG90MiA9IC1kb3QyO1xuICAgICAgICBsZW4xID0gZG90MSAqIHcxICsgZG90MiAqIGQxO1xuICAgICAgICBkb3QxID0gYWN4ICogYTR4ICsgYWN5ICogYTR5ICsgYWN6ICogYTR6O1xuICAgICAgICBkb3QyID0gYWN4ICogYTV4ICsgYWN5ICogYTV5ICsgYWN6ICogYTV6O1xuICAgICAgICBpZiAoZG90MSA8IDApIGRvdDEgPSAtZG90MTtcbiAgICAgICAgaWYgKGRvdDIgPCAwKSBkb3QyID0gLWRvdDI7XG4gICAgICAgIGxlbjIgPSBkb3QxICogdzIgKyBkb3QyICogaDI7XG4gICAgICAgIG92ZXJsYXBjID0gbGVuIC0gbGVuMSAtIGxlbjI7XG4gICAgICAgIGlmIChvdmVybGFwYyA+IDApIHJldHVybjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJpZ2h0YyA9IGZhbHNlO1xuICAgICAgICBvdmVybGFwYyA9IDA7XG4gICAgICAgIGludmFsaWRjID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIC8vIHRyeSBheGlzIDEzXG4gICAgICBsZW4gPSBhZHggKiBhZHggKyBhZHkgKiBhZHkgKyBhZHogKiBhZHo7XG4gICAgICBpZiAobGVuID4gMWUtNSkge1xuICAgICAgICBsZW4gPSAxIC8gX01hdGguc3FydChsZW4pO1xuICAgICAgICBhZHggKj0gbGVuO1xuICAgICAgICBhZHkgKj0gbGVuO1xuICAgICAgICBhZHogKj0gbGVuO1xuICAgICAgICBsZW4gPSBhZHggKiBkeCArIGFkeSAqIGR5ICsgYWR6ICogZHo7XG4gICAgICAgIHJpZ2h0ZCA9IGxlbiA+IDA7XG4gICAgICAgIGlmICghcmlnaHRkKSBsZW4gPSAtbGVuO1xuICAgICAgICBkb3QxID0gYWR4ICogYTF4ICsgYWR5ICogYTF5ICsgYWR6ICogYTF6O1xuICAgICAgICBkb3QyID0gYWR4ICogYTJ4ICsgYWR5ICogYTJ5ICsgYWR6ICogYTJ6O1xuICAgICAgICBpZiAoZG90MSA8IDApIGRvdDEgPSAtZG90MTtcbiAgICAgICAgaWYgKGRvdDIgPCAwKSBkb3QyID0gLWRvdDI7XG4gICAgICAgIGxlbjEgPSBkb3QxICogdzEgKyBkb3QyICogaDE7XG4gICAgICAgIGRvdDEgPSBhZHggKiBhNXggKyBhZHkgKiBhNXkgKyBhZHogKiBhNXo7XG4gICAgICAgIGRvdDIgPSBhZHggKiBhNnggKyBhZHkgKiBhNnkgKyBhZHogKiBhNno7XG4gICAgICAgIGlmIChkb3QxIDwgMCkgZG90MSA9IC1kb3QxO1xuICAgICAgICBpZiAoZG90MiA8IDApIGRvdDIgPSAtZG90MjtcbiAgICAgICAgbGVuMiA9IGRvdDEgKiBoMiArIGRvdDIgKiBkMjtcbiAgICAgICAgb3ZlcmxhcGQgPSBsZW4gLSBsZW4xIC0gbGVuMjtcbiAgICAgICAgaWYgKG92ZXJsYXBkID4gMCkgcmV0dXJuO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmlnaHRkID0gZmFsc2U7XG4gICAgICAgIG92ZXJsYXBkID0gMDtcbiAgICAgICAgaW52YWxpZGQgPSB0cnVlO1xuICAgICAgfVxuICAgICAgLy8gdHJ5IGF4aXMgMTRcbiAgICAgIGxlbiA9IGFleCAqIGFleCArIGFleSAqIGFleSArIGFleiAqIGFlejtcbiAgICAgIGlmIChsZW4gPiAxZS01KSB7XG4gICAgICAgIGxlbiA9IDEgLyBfTWF0aC5zcXJ0KGxlbik7XG4gICAgICAgIGFleCAqPSBsZW47XG4gICAgICAgIGFleSAqPSBsZW47XG4gICAgICAgIGFleiAqPSBsZW47XG4gICAgICAgIGxlbiA9IGFleCAqIGR4ICsgYWV5ICogZHkgKyBhZXogKiBkejtcbiAgICAgICAgcmlnaHRlID0gbGVuID4gMDtcbiAgICAgICAgaWYgKCFyaWdodGUpIGxlbiA9IC1sZW47XG4gICAgICAgIGRvdDEgPSBhZXggKiBhMXggKyBhZXkgKiBhMXkgKyBhZXogKiBhMXo7XG4gICAgICAgIGRvdDIgPSBhZXggKiBhMnggKyBhZXkgKiBhMnkgKyBhZXogKiBhMno7XG4gICAgICAgIGlmIChkb3QxIDwgMCkgZG90MSA9IC1kb3QxO1xuICAgICAgICBpZiAoZG90MiA8IDApIGRvdDIgPSAtZG90MjtcbiAgICAgICAgbGVuMSA9IGRvdDEgKiB3MSArIGRvdDIgKiBoMTtcbiAgICAgICAgZG90MSA9IGFleCAqIGE0eCArIGFleSAqIGE0eSArIGFleiAqIGE0ejtcbiAgICAgICAgZG90MiA9IGFleCAqIGE2eCArIGFleSAqIGE2eSArIGFleiAqIGE2ejtcbiAgICAgICAgaWYgKGRvdDEgPCAwKSBkb3QxID0gLWRvdDE7XG4gICAgICAgIGlmIChkb3QyIDwgMCkgZG90MiA9IC1kb3QyO1xuICAgICAgICBsZW4yID0gZG90MSAqIHcyICsgZG90MiAqIGQyO1xuICAgICAgICBvdmVybGFwZSA9IGxlbiAtIGxlbjEgLSBsZW4yO1xuICAgICAgICBpZiAob3ZlcmxhcGUgPiAwKSByZXR1cm47XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByaWdodGUgPSBmYWxzZTtcbiAgICAgICAgb3ZlcmxhcGUgPSAwO1xuICAgICAgICBpbnZhbGlkZSA9IHRydWU7XG4gICAgICB9XG4gICAgICAvLyB0cnkgYXhpcyAxNVxuICAgICAgbGVuID0gYWZ4ICogYWZ4ICsgYWZ5ICogYWZ5ICsgYWZ6ICogYWZ6O1xuICAgICAgaWYgKGxlbiA+IDFlLTUpIHtcbiAgICAgICAgbGVuID0gMSAvIF9NYXRoLnNxcnQobGVuKTtcbiAgICAgICAgYWZ4ICo9IGxlbjtcbiAgICAgICAgYWZ5ICo9IGxlbjtcbiAgICAgICAgYWZ6ICo9IGxlbjtcbiAgICAgICAgbGVuID0gYWZ4ICogZHggKyBhZnkgKiBkeSArIGFmeiAqIGR6O1xuICAgICAgICByaWdodGYgPSBsZW4gPiAwO1xuICAgICAgICBpZiAoIXJpZ2h0ZikgbGVuID0gLWxlbjtcbiAgICAgICAgZG90MSA9IGFmeCAqIGExeCArIGFmeSAqIGExeSArIGFmeiAqIGExejtcbiAgICAgICAgZG90MiA9IGFmeCAqIGEyeCArIGFmeSAqIGEyeSArIGFmeiAqIGEyejtcbiAgICAgICAgaWYgKGRvdDEgPCAwKSBkb3QxID0gLWRvdDE7XG4gICAgICAgIGlmIChkb3QyIDwgMCkgZG90MiA9IC1kb3QyO1xuICAgICAgICBsZW4xID0gZG90MSAqIHcxICsgZG90MiAqIGgxO1xuICAgICAgICBkb3QxID0gYWZ4ICogYTR4ICsgYWZ5ICogYTR5ICsgYWZ6ICogYTR6O1xuICAgICAgICBkb3QyID0gYWZ4ICogYTV4ICsgYWZ5ICogYTV5ICsgYWZ6ICogYTV6O1xuICAgICAgICBpZiAoZG90MSA8IDApIGRvdDEgPSAtZG90MTtcbiAgICAgICAgaWYgKGRvdDIgPCAwKSBkb3QyID0gLWRvdDI7XG4gICAgICAgIGxlbjIgPSBkb3QxICogdzIgKyBkb3QyICogaDI7XG4gICAgICAgIG92ZXJsYXBmID0gbGVuIC0gbGVuMSAtIGxlbjI7XG4gICAgICAgIGlmIChvdmVybGFwZiA+IDApIHJldHVybjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJpZ2h0ZiA9IGZhbHNlO1xuICAgICAgICBvdmVybGFwZiA9IDA7XG4gICAgICAgIGludmFsaWRmID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIC8vIGJveGVzIGFyZSBvdmVybGFwcGluZ1xuICAgICAgdmFyIGRlcHRoID0gb3ZlcmxhcDE7XG4gICAgICB2YXIgZGVwdGgyID0gb3ZlcmxhcDE7XG4gICAgICB2YXIgbWluSW5kZXggPSAwO1xuICAgICAgdmFyIHJpZ2h0ID0gcmlnaHQxO1xuICAgICAgaWYgKG92ZXJsYXAyID4gZGVwdGgyKSB7XG4gICAgICAgIGRlcHRoID0gb3ZlcmxhcDI7XG4gICAgICAgIGRlcHRoMiA9IG92ZXJsYXAyO1xuICAgICAgICBtaW5JbmRleCA9IDE7XG4gICAgICAgIHJpZ2h0ID0gcmlnaHQyO1xuICAgICAgfVxuICAgICAgaWYgKG92ZXJsYXAzID4gZGVwdGgyKSB7XG4gICAgICAgIGRlcHRoID0gb3ZlcmxhcDM7XG4gICAgICAgIGRlcHRoMiA9IG92ZXJsYXAzO1xuICAgICAgICBtaW5JbmRleCA9IDI7XG4gICAgICAgIHJpZ2h0ID0gcmlnaHQzO1xuICAgICAgfVxuICAgICAgaWYgKG92ZXJsYXA0ID4gZGVwdGgyKSB7XG4gICAgICAgIGRlcHRoID0gb3ZlcmxhcDQ7XG4gICAgICAgIGRlcHRoMiA9IG92ZXJsYXA0O1xuICAgICAgICBtaW5JbmRleCA9IDM7XG4gICAgICAgIHJpZ2h0ID0gcmlnaHQ0O1xuICAgICAgfVxuICAgICAgaWYgKG92ZXJsYXA1ID4gZGVwdGgyKSB7XG4gICAgICAgIGRlcHRoID0gb3ZlcmxhcDU7XG4gICAgICAgIGRlcHRoMiA9IG92ZXJsYXA1O1xuICAgICAgICBtaW5JbmRleCA9IDQ7XG4gICAgICAgIHJpZ2h0ID0gcmlnaHQ1O1xuICAgICAgfVxuICAgICAgaWYgKG92ZXJsYXA2ID4gZGVwdGgyKSB7XG4gICAgICAgIGRlcHRoID0gb3ZlcmxhcDY7XG4gICAgICAgIGRlcHRoMiA9IG92ZXJsYXA2O1xuICAgICAgICBtaW5JbmRleCA9IDU7XG4gICAgICAgIHJpZ2h0ID0gcmlnaHQ2O1xuICAgICAgfVxuICAgICAgaWYgKG92ZXJsYXA3IC0gMC4wMSA+IGRlcHRoMiAmJiAhaW52YWxpZDcpIHtcbiAgICAgICAgZGVwdGggPSBvdmVybGFwNztcbiAgICAgICAgZGVwdGgyID0gb3ZlcmxhcDcgLSAwLjAxO1xuICAgICAgICBtaW5JbmRleCA9IDY7XG4gICAgICAgIHJpZ2h0ID0gcmlnaHQ3O1xuICAgICAgfVxuICAgICAgaWYgKG92ZXJsYXA4IC0gMC4wMSA+IGRlcHRoMiAmJiAhaW52YWxpZDgpIHtcbiAgICAgICAgZGVwdGggPSBvdmVybGFwODtcbiAgICAgICAgZGVwdGgyID0gb3ZlcmxhcDggLSAwLjAxO1xuICAgICAgICBtaW5JbmRleCA9IDc7XG4gICAgICAgIHJpZ2h0ID0gcmlnaHQ4O1xuICAgICAgfVxuICAgICAgaWYgKG92ZXJsYXA5IC0gMC4wMSA+IGRlcHRoMiAmJiAhaW52YWxpZDkpIHtcbiAgICAgICAgZGVwdGggPSBvdmVybGFwOTtcbiAgICAgICAgZGVwdGgyID0gb3ZlcmxhcDkgLSAwLjAxO1xuICAgICAgICBtaW5JbmRleCA9IDg7XG4gICAgICAgIHJpZ2h0ID0gcmlnaHQ5O1xuICAgICAgfVxuICAgICAgaWYgKG92ZXJsYXBhIC0gMC4wMSA+IGRlcHRoMiAmJiAhaW52YWxpZGEpIHtcbiAgICAgICAgZGVwdGggPSBvdmVybGFwYTtcbiAgICAgICAgZGVwdGgyID0gb3ZlcmxhcGEgLSAwLjAxO1xuICAgICAgICBtaW5JbmRleCA9IDk7XG4gICAgICAgIHJpZ2h0ID0gcmlnaHRhO1xuICAgICAgfVxuICAgICAgaWYgKG92ZXJsYXBiIC0gMC4wMSA+IGRlcHRoMiAmJiAhaW52YWxpZGIpIHtcbiAgICAgICAgZGVwdGggPSBvdmVybGFwYjtcbiAgICAgICAgZGVwdGgyID0gb3ZlcmxhcGIgLSAwLjAxO1xuICAgICAgICBtaW5JbmRleCA9IDEwO1xuICAgICAgICByaWdodCA9IHJpZ2h0YjtcbiAgICAgIH1cbiAgICAgIGlmIChvdmVybGFwYyAtIDAuMDEgPiBkZXB0aDIgJiYgIWludmFsaWRjKSB7XG4gICAgICAgIGRlcHRoID0gb3ZlcmxhcGM7XG4gICAgICAgIGRlcHRoMiA9IG92ZXJsYXBjIC0gMC4wMTtcbiAgICAgICAgbWluSW5kZXggPSAxMTtcbiAgICAgICAgcmlnaHQgPSByaWdodGM7XG4gICAgICB9XG4gICAgICBpZiAob3ZlcmxhcGQgLSAwLjAxID4gZGVwdGgyICYmICFpbnZhbGlkZCkge1xuICAgICAgICBkZXB0aCA9IG92ZXJsYXBkO1xuICAgICAgICBkZXB0aDIgPSBvdmVybGFwZCAtIDAuMDE7XG4gICAgICAgIG1pbkluZGV4ID0gMTI7XG4gICAgICAgIHJpZ2h0ID0gcmlnaHRkO1xuICAgICAgfVxuICAgICAgaWYgKG92ZXJsYXBlIC0gMC4wMSA+IGRlcHRoMiAmJiAhaW52YWxpZGUpIHtcbiAgICAgICAgZGVwdGggPSBvdmVybGFwZTtcbiAgICAgICAgZGVwdGgyID0gb3ZlcmxhcGUgLSAwLjAxO1xuICAgICAgICBtaW5JbmRleCA9IDEzO1xuICAgICAgICByaWdodCA9IHJpZ2h0ZTtcbiAgICAgIH1cbiAgICAgIGlmIChvdmVybGFwZiAtIDAuMDEgPiBkZXB0aDIgJiYgIWludmFsaWRmKSB7XG4gICAgICAgIGRlcHRoID0gb3ZlcmxhcGY7XG4gICAgICAgIG1pbkluZGV4ID0gMTQ7XG4gICAgICAgIHJpZ2h0ID0gcmlnaHRmO1xuICAgICAgfVxuICAgICAgLy8gbm9ybWFsXG4gICAgICB2YXIgbnggPSAwO1xuICAgICAgdmFyIG55ID0gMDtcbiAgICAgIHZhciBueiA9IDA7XG4gICAgICAvLyBlZGdlIGxpbmUgb3IgZmFjZSBzaWRlIG5vcm1hbFxuICAgICAgdmFyIG4xeCA9IDA7XG4gICAgICB2YXIgbjF5ID0gMDtcbiAgICAgIHZhciBuMXogPSAwO1xuICAgICAgdmFyIG4yeCA9IDA7XG4gICAgICB2YXIgbjJ5ID0gMDtcbiAgICAgIHZhciBuMnogPSAwO1xuICAgICAgLy8gY2VudGVyIG9mIGN1cnJlbnQgZmFjZVxuICAgICAgdmFyIGN4ID0gMDtcbiAgICAgIHZhciBjeSA9IDA7XG4gICAgICB2YXIgY3ogPSAwO1xuICAgICAgLy8gZmFjZSBzaWRlXG4gICAgICB2YXIgczF4ID0gMDtcbiAgICAgIHZhciBzMXkgPSAwO1xuICAgICAgdmFyIHMxeiA9IDA7XG4gICAgICB2YXIgczJ4ID0gMDtcbiAgICAgIHZhciBzMnkgPSAwO1xuICAgICAgdmFyIHMyeiA9IDA7XG4gICAgICAvLyBzd2FwIGIxIGIyXG4gICAgICB2YXIgc3dhcCA9IGZhbHNlO1xuXG4gICAgICAvL19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX1xuXG4gICAgICBpZiAobWluSW5kZXggPT0gMCkgey8vIGIxLnggKiBiMlxuICAgICAgICBpZiAocmlnaHQpIHtcbiAgICAgICAgICBjeCA9IHAxeCArIGQxeDsgY3kgPSBwMXkgKyBkMXk7IGN6ID0gcDF6ICsgZDF6O1xuICAgICAgICAgIG54ID0gYTF4OyBueSA9IGExeTsgbnogPSBhMXo7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY3ggPSBwMXggLSBkMXg7IGN5ID0gcDF5IC0gZDF5OyBjeiA9IHAxeiAtIGQxejtcbiAgICAgICAgICBueCA9IC1hMXg7IG55ID0gLWExeTsgbnogPSAtYTF6O1xuICAgICAgICB9XG4gICAgICAgIHMxeCA9IGQyeDsgczF5ID0gZDJ5OyBzMXogPSBkMno7XG4gICAgICAgIG4xeCA9IC1hMng7IG4xeSA9IC1hMnk7IG4xeiA9IC1hMno7XG4gICAgICAgIHMyeCA9IGQzeDsgczJ5ID0gZDN5OyBzMnogPSBkM3o7XG4gICAgICAgIG4yeCA9IC1hM3g7IG4yeSA9IC1hM3k7IG4yeiA9IC1hM3o7XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChtaW5JbmRleCA9PSAxKSB7Ly8gYjEueSAqIGIyXG4gICAgICAgIGlmIChyaWdodCkge1xuICAgICAgICAgIGN4ID0gcDF4ICsgZDJ4OyBjeSA9IHAxeSArIGQyeTsgY3ogPSBwMXogKyBkMno7XG4gICAgICAgICAgbnggPSBhMng7IG55ID0gYTJ5OyBueiA9IGEyejtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjeCA9IHAxeCAtIGQyeDsgY3kgPSBwMXkgLSBkMnk7IGN6ID0gcDF6IC0gZDJ6O1xuICAgICAgICAgIG54ID0gLWEyeDsgbnkgPSAtYTJ5OyBueiA9IC1hMno7XG4gICAgICAgIH1cbiAgICAgICAgczF4ID0gZDF4OyBzMXkgPSBkMXk7IHMxeiA9IGQxejtcbiAgICAgICAgbjF4ID0gLWExeDsgbjF5ID0gLWExeTsgbjF6ID0gLWExejtcbiAgICAgICAgczJ4ID0gZDN4OyBzMnkgPSBkM3k7IHMyeiA9IGQzejtcbiAgICAgICAgbjJ4ID0gLWEzeDsgbjJ5ID0gLWEzeTsgbjJ6ID0gLWEzejtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKG1pbkluZGV4ID09IDIpIHsvLyBiMS56ICogYjJcbiAgICAgICAgaWYgKHJpZ2h0KSB7XG4gICAgICAgICAgY3ggPSBwMXggKyBkM3g7IGN5ID0gcDF5ICsgZDN5OyBjeiA9IHAxeiArIGQzejtcbiAgICAgICAgICBueCA9IGEzeDsgbnkgPSBhM3k7IG56ID0gYTN6O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGN4ID0gcDF4IC0gZDN4OyBjeSA9IHAxeSAtIGQzeTsgY3ogPSBwMXogLSBkM3o7XG4gICAgICAgICAgbnggPSAtYTN4OyBueSA9IC1hM3k7IG56ID0gLWEzejtcbiAgICAgICAgfVxuICAgICAgICBzMXggPSBkMXg7IHMxeSA9IGQxeTsgczF6ID0gZDF6O1xuICAgICAgICBuMXggPSAtYTF4OyBuMXkgPSAtYTF5OyBuMXogPSAtYTF6O1xuICAgICAgICBzMnggPSBkMng7IHMyeSA9IGQyeTsgczJ6ID0gZDJ6O1xuICAgICAgICBuMnggPSAtYTJ4OyBuMnkgPSAtYTJ5OyBuMnogPSAtYTJ6O1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAobWluSW5kZXggPT0gMykgey8vIGIyLnggKiBiMVxuICAgICAgICBzd2FwID0gdHJ1ZTtcbiAgICAgICAgaWYgKCFyaWdodCkge1xuICAgICAgICAgIGN4ID0gcDJ4ICsgZDR4OyBjeSA9IHAyeSArIGQ0eTsgY3ogPSBwMnogKyBkNHo7XG4gICAgICAgICAgbnggPSBhNHg7IG55ID0gYTR5OyBueiA9IGE0ejtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjeCA9IHAyeCAtIGQ0eDsgY3kgPSBwMnkgLSBkNHk7IGN6ID0gcDJ6IC0gZDR6O1xuICAgICAgICAgIG54ID0gLWE0eDsgbnkgPSAtYTR5OyBueiA9IC1hNHo7XG4gICAgICAgIH1cbiAgICAgICAgczF4ID0gZDV4OyBzMXkgPSBkNXk7IHMxeiA9IGQ1ejtcbiAgICAgICAgbjF4ID0gLWE1eDsgbjF5ID0gLWE1eTsgbjF6ID0gLWE1ejtcbiAgICAgICAgczJ4ID0gZDZ4OyBzMnkgPSBkNnk7IHMyeiA9IGQ2ejtcbiAgICAgICAgbjJ4ID0gLWE2eDsgbjJ5ID0gLWE2eTsgbjJ6ID0gLWE2ejtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKG1pbkluZGV4ID09IDQpIHsvLyBiMi55ICogYjFcbiAgICAgICAgc3dhcCA9IHRydWU7XG4gICAgICAgIGlmICghcmlnaHQpIHtcbiAgICAgICAgICBjeCA9IHAyeCArIGQ1eDsgY3kgPSBwMnkgKyBkNXk7IGN6ID0gcDJ6ICsgZDV6O1xuICAgICAgICAgIG54ID0gYTV4OyBueSA9IGE1eTsgbnogPSBhNXo7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY3ggPSBwMnggLSBkNXg7IGN5ID0gcDJ5IC0gZDV5OyBjeiA9IHAyeiAtIGQ1ejtcbiAgICAgICAgICBueCA9IC1hNXg7IG55ID0gLWE1eTsgbnogPSAtYTV6O1xuICAgICAgICB9XG4gICAgICAgIHMxeCA9IGQ0eDsgczF5ID0gZDR5OyBzMXogPSBkNHo7XG4gICAgICAgIG4xeCA9IC1hNHg7IG4xeSA9IC1hNHk7IG4xeiA9IC1hNHo7XG4gICAgICAgIHMyeCA9IGQ2eDsgczJ5ID0gZDZ5OyBzMnogPSBkNno7XG4gICAgICAgIG4yeCA9IC1hNng7IG4yeSA9IC1hNnk7IG4yeiA9IC1hNno7XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChtaW5JbmRleCA9PSA1KSB7Ly8gYjIueiAqIGIxXG4gICAgICAgIHN3YXAgPSB0cnVlO1xuICAgICAgICBpZiAoIXJpZ2h0KSB7XG4gICAgICAgICAgY3ggPSBwMnggKyBkNng7IGN5ID0gcDJ5ICsgZDZ5OyBjeiA9IHAyeiArIGQ2ejtcbiAgICAgICAgICBueCA9IGE2eDsgbnkgPSBhNnk7IG56ID0gYTZ6O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGN4ID0gcDJ4IC0gZDZ4OyBjeSA9IHAyeSAtIGQ2eTsgY3ogPSBwMnogLSBkNno7XG4gICAgICAgICAgbnggPSAtYTZ4OyBueSA9IC1hNnk7IG56ID0gLWE2ejtcbiAgICAgICAgfVxuICAgICAgICBzMXggPSBkNHg7IHMxeSA9IGQ0eTsgczF6ID0gZDR6O1xuICAgICAgICBuMXggPSAtYTR4OyBuMXkgPSAtYTR5OyBuMXogPSAtYTR6O1xuICAgICAgICBzMnggPSBkNXg7IHMyeSA9IGQ1eTsgczJ6ID0gZDV6O1xuICAgICAgICBuMnggPSAtYTV4OyBuMnkgPSAtYTV5OyBuMnogPSAtYTV6O1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAobWluSW5kZXggPT0gNikgey8vIGIxLnggKiBiMi54XG4gICAgICAgIG54ID0gYTd4OyBueSA9IGE3eTsgbnogPSBhN3o7XG4gICAgICAgIG4xeCA9IGExeDsgbjF5ID0gYTF5OyBuMXogPSBhMXo7XG4gICAgICAgIG4yeCA9IGE0eDsgbjJ5ID0gYTR5OyBuMnogPSBhNHo7XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChtaW5JbmRleCA9PSA3KSB7Ly8gYjEueCAqIGIyLnlcbiAgICAgICAgbnggPSBhOHg7IG55ID0gYTh5OyBueiA9IGE4ejtcbiAgICAgICAgbjF4ID0gYTF4OyBuMXkgPSBhMXk7IG4xeiA9IGExejtcbiAgICAgICAgbjJ4ID0gYTV4OyBuMnkgPSBhNXk7IG4yeiA9IGE1ejtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKG1pbkluZGV4ID09IDgpIHsvLyBiMS54ICogYjIuelxuICAgICAgICBueCA9IGE5eDsgbnkgPSBhOXk7IG56ID0gYTl6O1xuICAgICAgICBuMXggPSBhMXg7IG4xeSA9IGExeTsgbjF6ID0gYTF6O1xuICAgICAgICBuMnggPSBhNng7IG4yeSA9IGE2eTsgbjJ6ID0gYTZ6O1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAobWluSW5kZXggPT0gOSkgey8vIGIxLnkgKiBiMi54XG4gICAgICAgIG54ID0gYWF4OyBueSA9IGFheTsgbnogPSBhYXo7XG4gICAgICAgIG4xeCA9IGEyeDsgbjF5ID0gYTJ5OyBuMXogPSBhMno7XG4gICAgICAgIG4yeCA9IGE0eDsgbjJ5ID0gYTR5OyBuMnogPSBhNHo7XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChtaW5JbmRleCA9PSAxMCkgey8vIGIxLnkgKiBiMi55XG4gICAgICAgIG54ID0gYWJ4OyBueSA9IGFieTsgbnogPSBhYno7XG4gICAgICAgIG4xeCA9IGEyeDsgbjF5ID0gYTJ5OyBuMXogPSBhMno7XG4gICAgICAgIG4yeCA9IGE1eDsgbjJ5ID0gYTV5OyBuMnogPSBhNXo7XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChtaW5JbmRleCA9PSAxMSkgey8vIGIxLnkgKiBiMi56XG4gICAgICAgIG54ID0gYWN4OyBueSA9IGFjeTsgbnogPSBhY3o7XG4gICAgICAgIG4xeCA9IGEyeDsgbjF5ID0gYTJ5OyBuMXogPSBhMno7XG4gICAgICAgIG4yeCA9IGE2eDsgbjJ5ID0gYTZ5OyBuMnogPSBhNno7XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChtaW5JbmRleCA9PSAxMikgey8vIGIxLnogKiBiMi54XG4gICAgICAgIG54ID0gYWR4OyBueSA9IGFkeTsgbnogPSBhZHo7XG4gICAgICAgIG4xeCA9IGEzeDsgbjF5ID0gYTN5OyBuMXogPSBhM3o7XG4gICAgICAgIG4yeCA9IGE0eDsgbjJ5ID0gYTR5OyBuMnogPSBhNHo7XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChtaW5JbmRleCA9PSAxMykgey8vIGIxLnogKiBiMi55XG4gICAgICAgIG54ID0gYWV4OyBueSA9IGFleTsgbnogPSBhZXo7XG4gICAgICAgIG4xeCA9IGEzeDsgbjF5ID0gYTN5OyBuMXogPSBhM3o7XG4gICAgICAgIG4yeCA9IGE1eDsgbjJ5ID0gYTV5OyBuMnogPSBhNXo7XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChtaW5JbmRleCA9PSAxNCkgey8vIGIxLnogKiBiMi56XG4gICAgICAgIG54ID0gYWZ4OyBueSA9IGFmeTsgbnogPSBhZno7XG4gICAgICAgIG4xeCA9IGEzeDsgbjF5ID0gYTN5OyBuMXogPSBhM3o7XG4gICAgICAgIG4yeCA9IGE2eDsgbjJ5ID0gYTZ5OyBuMnogPSBhNno7XG4gICAgICB9XG5cbiAgICAgIC8vX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fXG5cbiAgICAgIC8vdmFyIHY7XG4gICAgICBpZiAobWluSW5kZXggPiA1KSB7XG4gICAgICAgIGlmICghcmlnaHQpIHtcbiAgICAgICAgICBueCA9IC1ueDsgbnkgPSAtbnk7IG56ID0gLW56O1xuICAgICAgICB9XG4gICAgICAgIHZhciBkaXN0YW5jZTtcbiAgICAgICAgdmFyIG1heERpc3RhbmNlO1xuICAgICAgICB2YXIgdng7XG4gICAgICAgIHZhciB2eTtcbiAgICAgICAgdmFyIHZ6O1xuICAgICAgICB2YXIgdjF4O1xuICAgICAgICB2YXIgdjF5O1xuICAgICAgICB2YXIgdjF6O1xuICAgICAgICB2YXIgdjJ4O1xuICAgICAgICB2YXIgdjJ5O1xuICAgICAgICB2YXIgdjJ6O1xuICAgICAgICAvL3ZlcnRleDE7XG4gICAgICAgIHYxeCA9IFYxWzBdOyB2MXkgPSBWMVsxXTsgdjF6ID0gVjFbMl07XG4gICAgICAgIG1heERpc3RhbmNlID0gbnggKiB2MXggKyBueSAqIHYxeSArIG56ICogdjF6O1xuICAgICAgICAvL3ZlcnRleDI7XG4gICAgICAgIHZ4ID0gVjFbM107IHZ5ID0gVjFbNF07IHZ6ID0gVjFbNV07XG4gICAgICAgIGRpc3RhbmNlID0gbnggKiB2eCArIG55ICogdnkgKyBueiAqIHZ6O1xuICAgICAgICBpZiAoZGlzdGFuY2UgPiBtYXhEaXN0YW5jZSkge1xuICAgICAgICAgIG1heERpc3RhbmNlID0gZGlzdGFuY2U7XG4gICAgICAgICAgdjF4ID0gdng7IHYxeSA9IHZ5OyB2MXogPSB2ejtcbiAgICAgICAgfVxuICAgICAgICAvL3ZlcnRleDM7XG4gICAgICAgIHZ4ID0gVjFbNl07IHZ5ID0gVjFbN107IHZ6ID0gVjFbOF07XG4gICAgICAgIGRpc3RhbmNlID0gbnggKiB2eCArIG55ICogdnkgKyBueiAqIHZ6O1xuICAgICAgICBpZiAoZGlzdGFuY2UgPiBtYXhEaXN0YW5jZSkge1xuICAgICAgICAgIG1heERpc3RhbmNlID0gZGlzdGFuY2U7XG4gICAgICAgICAgdjF4ID0gdng7IHYxeSA9IHZ5OyB2MXogPSB2ejtcbiAgICAgICAgfVxuICAgICAgICAvL3ZlcnRleDQ7XG4gICAgICAgIHZ4ID0gVjFbOV07IHZ5ID0gVjFbMTBdOyB2eiA9IFYxWzExXTtcbiAgICAgICAgZGlzdGFuY2UgPSBueCAqIHZ4ICsgbnkgKiB2eSArIG56ICogdno7XG4gICAgICAgIGlmIChkaXN0YW5jZSA+IG1heERpc3RhbmNlKSB7XG4gICAgICAgICAgbWF4RGlzdGFuY2UgPSBkaXN0YW5jZTtcbiAgICAgICAgICB2MXggPSB2eDsgdjF5ID0gdnk7IHYxeiA9IHZ6O1xuICAgICAgICB9XG4gICAgICAgIC8vdmVydGV4NTtcbiAgICAgICAgdnggPSBWMVsxMl07IHZ5ID0gVjFbMTNdOyB2eiA9IFYxWzE0XTtcbiAgICAgICAgZGlzdGFuY2UgPSBueCAqIHZ4ICsgbnkgKiB2eSArIG56ICogdno7XG4gICAgICAgIGlmIChkaXN0YW5jZSA+IG1heERpc3RhbmNlKSB7XG4gICAgICAgICAgbWF4RGlzdGFuY2UgPSBkaXN0YW5jZTtcbiAgICAgICAgICB2MXggPSB2eDsgdjF5ID0gdnk7IHYxeiA9IHZ6O1xuICAgICAgICB9XG4gICAgICAgIC8vdmVydGV4NjtcbiAgICAgICAgdnggPSBWMVsxNV07IHZ5ID0gVjFbMTZdOyB2eiA9IFYxWzE3XTtcbiAgICAgICAgZGlzdGFuY2UgPSBueCAqIHZ4ICsgbnkgKiB2eSArIG56ICogdno7XG4gICAgICAgIGlmIChkaXN0YW5jZSA+IG1heERpc3RhbmNlKSB7XG4gICAgICAgICAgbWF4RGlzdGFuY2UgPSBkaXN0YW5jZTtcbiAgICAgICAgICB2MXggPSB2eDsgdjF5ID0gdnk7IHYxeiA9IHZ6O1xuICAgICAgICB9XG4gICAgICAgIC8vdmVydGV4NztcbiAgICAgICAgdnggPSBWMVsxOF07IHZ5ID0gVjFbMTldOyB2eiA9IFYxWzIwXTtcbiAgICAgICAgZGlzdGFuY2UgPSBueCAqIHZ4ICsgbnkgKiB2eSArIG56ICogdno7XG4gICAgICAgIGlmIChkaXN0YW5jZSA+IG1heERpc3RhbmNlKSB7XG4gICAgICAgICAgbWF4RGlzdGFuY2UgPSBkaXN0YW5jZTtcbiAgICAgICAgICB2MXggPSB2eDsgdjF5ID0gdnk7IHYxeiA9IHZ6O1xuICAgICAgICB9XG4gICAgICAgIC8vdmVydGV4ODtcbiAgICAgICAgdnggPSBWMVsyMV07IHZ5ID0gVjFbMjJdOyB2eiA9IFYxWzIzXTtcbiAgICAgICAgZGlzdGFuY2UgPSBueCAqIHZ4ICsgbnkgKiB2eSArIG56ICogdno7XG4gICAgICAgIGlmIChkaXN0YW5jZSA+IG1heERpc3RhbmNlKSB7XG4gICAgICAgICAgbWF4RGlzdGFuY2UgPSBkaXN0YW5jZTtcbiAgICAgICAgICB2MXggPSB2eDsgdjF5ID0gdnk7IHYxeiA9IHZ6O1xuICAgICAgICB9XG4gICAgICAgIC8vdmVydGV4MTtcbiAgICAgICAgdjJ4ID0gVjJbMF07IHYyeSA9IFYyWzFdOyB2MnogPSBWMlsyXTtcbiAgICAgICAgbWF4RGlzdGFuY2UgPSBueCAqIHYyeCArIG55ICogdjJ5ICsgbnogKiB2Mno7XG4gICAgICAgIC8vdmVydGV4MjtcbiAgICAgICAgdnggPSBWMlszXTsgdnkgPSBWMls0XTsgdnogPSBWMls1XTtcbiAgICAgICAgZGlzdGFuY2UgPSBueCAqIHZ4ICsgbnkgKiB2eSArIG56ICogdno7XG4gICAgICAgIGlmIChkaXN0YW5jZSA8IG1heERpc3RhbmNlKSB7XG4gICAgICAgICAgbWF4RGlzdGFuY2UgPSBkaXN0YW5jZTtcbiAgICAgICAgICB2MnggPSB2eDsgdjJ5ID0gdnk7IHYyeiA9IHZ6O1xuICAgICAgICB9XG4gICAgICAgIC8vdmVydGV4MztcbiAgICAgICAgdnggPSBWMls2XTsgdnkgPSBWMls3XTsgdnogPSBWMls4XTtcbiAgICAgICAgZGlzdGFuY2UgPSBueCAqIHZ4ICsgbnkgKiB2eSArIG56ICogdno7XG4gICAgICAgIGlmIChkaXN0YW5jZSA8IG1heERpc3RhbmNlKSB7XG4gICAgICAgICAgbWF4RGlzdGFuY2UgPSBkaXN0YW5jZTtcbiAgICAgICAgICB2MnggPSB2eDsgdjJ5ID0gdnk7IHYyeiA9IHZ6O1xuICAgICAgICB9XG4gICAgICAgIC8vdmVydGV4NDtcbiAgICAgICAgdnggPSBWMls5XTsgdnkgPSBWMlsxMF07IHZ6ID0gVjJbMTFdO1xuICAgICAgICBkaXN0YW5jZSA9IG54ICogdnggKyBueSAqIHZ5ICsgbnogKiB2ejtcbiAgICAgICAgaWYgKGRpc3RhbmNlIDwgbWF4RGlzdGFuY2UpIHtcbiAgICAgICAgICBtYXhEaXN0YW5jZSA9IGRpc3RhbmNlO1xuICAgICAgICAgIHYyeCA9IHZ4OyB2MnkgPSB2eTsgdjJ6ID0gdno7XG4gICAgICAgIH1cbiAgICAgICAgLy92ZXJ0ZXg1O1xuICAgICAgICB2eCA9IFYyWzEyXTsgdnkgPSBWMlsxM107IHZ6ID0gVjJbMTRdO1xuICAgICAgICBkaXN0YW5jZSA9IG54ICogdnggKyBueSAqIHZ5ICsgbnogKiB2ejtcbiAgICAgICAgaWYgKGRpc3RhbmNlIDwgbWF4RGlzdGFuY2UpIHtcbiAgICAgICAgICBtYXhEaXN0YW5jZSA9IGRpc3RhbmNlO1xuICAgICAgICAgIHYyeCA9IHZ4OyB2MnkgPSB2eTsgdjJ6ID0gdno7XG4gICAgICAgIH1cbiAgICAgICAgLy92ZXJ0ZXg2O1xuICAgICAgICB2eCA9IFYyWzE1XTsgdnkgPSBWMlsxNl07IHZ6ID0gVjJbMTddO1xuICAgICAgICBkaXN0YW5jZSA9IG54ICogdnggKyBueSAqIHZ5ICsgbnogKiB2ejtcbiAgICAgICAgaWYgKGRpc3RhbmNlIDwgbWF4RGlzdGFuY2UpIHtcbiAgICAgICAgICBtYXhEaXN0YW5jZSA9IGRpc3RhbmNlO1xuICAgICAgICAgIHYyeCA9IHZ4OyB2MnkgPSB2eTsgdjJ6ID0gdno7XG4gICAgICAgIH1cbiAgICAgICAgLy92ZXJ0ZXg3O1xuICAgICAgICB2eCA9IFYyWzE4XTsgdnkgPSBWMlsxOV07IHZ6ID0gVjJbMjBdO1xuICAgICAgICBkaXN0YW5jZSA9IG54ICogdnggKyBueSAqIHZ5ICsgbnogKiB2ejtcbiAgICAgICAgaWYgKGRpc3RhbmNlIDwgbWF4RGlzdGFuY2UpIHtcbiAgICAgICAgICBtYXhEaXN0YW5jZSA9IGRpc3RhbmNlO1xuICAgICAgICAgIHYyeCA9IHZ4OyB2MnkgPSB2eTsgdjJ6ID0gdno7XG4gICAgICAgIH1cbiAgICAgICAgLy92ZXJ0ZXg4O1xuICAgICAgICB2eCA9IFYyWzIxXTsgdnkgPSBWMlsyMl07IHZ6ID0gVjJbMjNdO1xuICAgICAgICBkaXN0YW5jZSA9IG54ICogdnggKyBueSAqIHZ5ICsgbnogKiB2ejtcbiAgICAgICAgaWYgKGRpc3RhbmNlIDwgbWF4RGlzdGFuY2UpIHtcbiAgICAgICAgICBtYXhEaXN0YW5jZSA9IGRpc3RhbmNlO1xuICAgICAgICAgIHYyeCA9IHZ4OyB2MnkgPSB2eTsgdjJ6ID0gdno7XG4gICAgICAgIH1cbiAgICAgICAgdnggPSB2MnggLSB2MXg7IHZ5ID0gdjJ5IC0gdjF5OyB2eiA9IHYyeiAtIHYxejtcbiAgICAgICAgZG90MSA9IG4xeCAqIG4yeCArIG4xeSAqIG4yeSArIG4xeiAqIG4yejtcbiAgICAgICAgdmFyIHQgPSAodnggKiAobjF4IC0gbjJ4ICogZG90MSkgKyB2eSAqIChuMXkgLSBuMnkgKiBkb3QxKSArIHZ6ICogKG4xeiAtIG4yeiAqIGRvdDEpKSAvICgxIC0gZG90MSAqIGRvdDEpO1xuICAgICAgICBtYW5pZm9sZC5hZGRQb2ludCh2MXggKyBuMXggKiB0ICsgbnggKiBkZXB0aCAqIDAuNSwgdjF5ICsgbjF5ICogdCArIG55ICogZGVwdGggKiAwLjUsIHYxeiArIG4xeiAqIHQgKyBueiAqIGRlcHRoICogMC41LCBueCwgbnksIG56LCBkZXB0aCwgZmFsc2UpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICAvLyBub3cgZGV0ZWN0IGZhY2UtZmFjZSBjb2xsaXNpb24uLi5cbiAgICAgIC8vIHRhcmdldCBxdWFkXG4gICAgICB2YXIgcTF4O1xuICAgICAgdmFyIHExeTtcbiAgICAgIHZhciBxMXo7XG4gICAgICB2YXIgcTJ4O1xuICAgICAgdmFyIHEyeTtcbiAgICAgIHZhciBxMno7XG4gICAgICB2YXIgcTN4O1xuICAgICAgdmFyIHEzeTtcbiAgICAgIHZhciBxM3o7XG4gICAgICB2YXIgcTR4O1xuICAgICAgdmFyIHE0eTtcbiAgICAgIHZhciBxNHo7XG4gICAgICAvLyBzZWFyY2ggc3VwcG9ydCBmYWNlIGFuZCB2ZXJ0ZXhcbiAgICAgIHZhciBtaW5Eb3QgPSAxO1xuICAgICAgdmFyIGRvdCA9IDA7XG4gICAgICB2YXIgbWluRG90SW5kZXggPSAwO1xuICAgICAgaWYgKHN3YXApIHtcbiAgICAgICAgZG90ID0gYTF4ICogbnggKyBhMXkgKiBueSArIGExeiAqIG56O1xuICAgICAgICBpZiAoZG90IDwgbWluRG90KSB7XG4gICAgICAgICAgbWluRG90ID0gZG90O1xuICAgICAgICAgIG1pbkRvdEluZGV4ID0gMDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoLWRvdCA8IG1pbkRvdCkge1xuICAgICAgICAgIG1pbkRvdCA9IC1kb3Q7XG4gICAgICAgICAgbWluRG90SW5kZXggPSAxO1xuICAgICAgICB9XG4gICAgICAgIGRvdCA9IGEyeCAqIG54ICsgYTJ5ICogbnkgKyBhMnogKiBuejtcbiAgICAgICAgaWYgKGRvdCA8IG1pbkRvdCkge1xuICAgICAgICAgIG1pbkRvdCA9IGRvdDtcbiAgICAgICAgICBtaW5Eb3RJbmRleCA9IDI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKC1kb3QgPCBtaW5Eb3QpIHtcbiAgICAgICAgICBtaW5Eb3QgPSAtZG90O1xuICAgICAgICAgIG1pbkRvdEluZGV4ID0gMztcbiAgICAgICAgfVxuICAgICAgICBkb3QgPSBhM3ggKiBueCArIGEzeSAqIG55ICsgYTN6ICogbno7XG4gICAgICAgIGlmIChkb3QgPCBtaW5Eb3QpIHtcbiAgICAgICAgICBtaW5Eb3QgPSBkb3Q7XG4gICAgICAgICAgbWluRG90SW5kZXggPSA0O1xuICAgICAgICB9XG4gICAgICAgIGlmICgtZG90IDwgbWluRG90KSB7XG4gICAgICAgICAgbWluRG90ID0gLWRvdDtcbiAgICAgICAgICBtaW5Eb3RJbmRleCA9IDU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobWluRG90SW5kZXggPT0gMCkgey8vIHgrIGZhY2VcbiAgICAgICAgICBxMXggPSBWMVswXTsgcTF5ID0gVjFbMV07IHExeiA9IFYxWzJdOy8vdmVydGV4MVxuICAgICAgICAgIHEyeCA9IFYxWzZdOyBxMnkgPSBWMVs3XTsgcTJ6ID0gVjFbOF07Ly92ZXJ0ZXgzXG4gICAgICAgICAgcTN4ID0gVjFbOV07IHEzeSA9IFYxWzEwXTsgcTN6ID0gVjFbMTFdOy8vdmVydGV4NFxuICAgICAgICAgIHE0eCA9IFYxWzNdOyBxNHkgPSBWMVs0XTsgcTR6ID0gVjFbNV07Ly92ZXJ0ZXgyXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAobWluRG90SW5kZXggPT0gMSkgey8vIHgtIGZhY2VcbiAgICAgICAgICBxMXggPSBWMVsxNV07IHExeSA9IFYxWzE2XTsgcTF6ID0gVjFbMTddOy8vdmVydGV4NlxuICAgICAgICAgIHEyeCA9IFYxWzIxXTsgcTJ5ID0gVjFbMjJdOyBxMnogPSBWMVsyM107Ly92ZXJ0ZXg4XG4gICAgICAgICAgcTN4ID0gVjFbMThdOyBxM3kgPSBWMVsxOV07IHEzeiA9IFYxWzIwXTsvL3ZlcnRleDdcbiAgICAgICAgICBxNHggPSBWMVsxMl07IHE0eSA9IFYxWzEzXTsgcTR6ID0gVjFbMTRdOy8vdmVydGV4NVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG1pbkRvdEluZGV4ID09IDIpIHsvLyB5KyBmYWNlXG4gICAgICAgICAgcTF4ID0gVjFbMTJdOyBxMXkgPSBWMVsxM107IHExeiA9IFYxWzE0XTsvL3ZlcnRleDVcbiAgICAgICAgICBxMnggPSBWMVswXTsgcTJ5ID0gVjFbMV07IHEyeiA9IFYxWzJdOy8vdmVydGV4MVxuICAgICAgICAgIHEzeCA9IFYxWzNdOyBxM3kgPSBWMVs0XTsgcTN6ID0gVjFbNV07Ly92ZXJ0ZXgyXG4gICAgICAgICAgcTR4ID0gVjFbMTVdOyBxNHkgPSBWMVsxNl07IHE0eiA9IFYxWzE3XTsvL3ZlcnRleDZcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChtaW5Eb3RJbmRleCA9PSAzKSB7Ly8geS0gZmFjZVxuICAgICAgICAgIHExeCA9IFYxWzIxXTsgcTF5ID0gVjFbMjJdOyBxMXogPSBWMVsyM107Ly92ZXJ0ZXg4XG4gICAgICAgICAgcTJ4ID0gVjFbOV07IHEyeSA9IFYxWzEwXTsgcTJ6ID0gVjFbMTFdOy8vdmVydGV4NFxuICAgICAgICAgIHEzeCA9IFYxWzZdOyBxM3kgPSBWMVs3XTsgcTN6ID0gVjFbOF07Ly92ZXJ0ZXgzXG4gICAgICAgICAgcTR4ID0gVjFbMThdOyBxNHkgPSBWMVsxOV07IHE0eiA9IFYxWzIwXTsvL3ZlcnRleDdcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChtaW5Eb3RJbmRleCA9PSA0KSB7Ly8geisgZmFjZVxuICAgICAgICAgIHExeCA9IFYxWzEyXTsgcTF5ID0gVjFbMTNdOyBxMXogPSBWMVsxNF07Ly92ZXJ0ZXg1XG4gICAgICAgICAgcTJ4ID0gVjFbMThdOyBxMnkgPSBWMVsxOV07IHEyeiA9IFYxWzIwXTsvL3ZlcnRleDdcbiAgICAgICAgICBxM3ggPSBWMVs2XTsgcTN5ID0gVjFbN107IHEzeiA9IFYxWzhdOy8vdmVydGV4M1xuICAgICAgICAgIHE0eCA9IFYxWzBdOyBxNHkgPSBWMVsxXTsgcTR6ID0gVjFbMl07Ly92ZXJ0ZXgxXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAobWluRG90SW5kZXggPT0gNSkgey8vIHotIGZhY2VcbiAgICAgICAgICBxMXggPSBWMVszXTsgcTF5ID0gVjFbNF07IHExeiA9IFYxWzVdOy8vdmVydGV4MlxuICAgICAgICAgIC8vMng9VjFbNl07IHEyeT1WMVs3XTsgcTJ6PVYxWzhdOy8vdmVydGV4NCAhISFcbiAgICAgICAgICBxMnggPSBWMls5XTsgcTJ5ID0gVjJbMTBdOyBxMnogPSBWMlsxMV07Ly92ZXJ0ZXg0XG4gICAgICAgICAgcTN4ID0gVjFbMjFdOyBxM3kgPSBWMVsyMl07IHEzeiA9IFYxWzIzXTsvL3ZlcnRleDhcbiAgICAgICAgICBxNHggPSBWMVsxNV07IHE0eSA9IFYxWzE2XTsgcTR6ID0gVjFbMTddOy8vdmVydGV4NlxuICAgICAgICB9XG5cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRvdCA9IGE0eCAqIG54ICsgYTR5ICogbnkgKyBhNHogKiBuejtcbiAgICAgICAgaWYgKGRvdCA8IG1pbkRvdCkge1xuICAgICAgICAgIG1pbkRvdCA9IGRvdDtcbiAgICAgICAgICBtaW5Eb3RJbmRleCA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKC1kb3QgPCBtaW5Eb3QpIHtcbiAgICAgICAgICBtaW5Eb3QgPSAtZG90O1xuICAgICAgICAgIG1pbkRvdEluZGV4ID0gMTtcbiAgICAgICAgfVxuICAgICAgICBkb3QgPSBhNXggKiBueCArIGE1eSAqIG55ICsgYTV6ICogbno7XG4gICAgICAgIGlmIChkb3QgPCBtaW5Eb3QpIHtcbiAgICAgICAgICBtaW5Eb3QgPSBkb3Q7XG4gICAgICAgICAgbWluRG90SW5kZXggPSAyO1xuICAgICAgICB9XG4gICAgICAgIGlmICgtZG90IDwgbWluRG90KSB7XG4gICAgICAgICAgbWluRG90ID0gLWRvdDtcbiAgICAgICAgICBtaW5Eb3RJbmRleCA9IDM7XG4gICAgICAgIH1cbiAgICAgICAgZG90ID0gYTZ4ICogbnggKyBhNnkgKiBueSArIGE2eiAqIG56O1xuICAgICAgICBpZiAoZG90IDwgbWluRG90KSB7XG4gICAgICAgICAgbWluRG90ID0gZG90O1xuICAgICAgICAgIG1pbkRvdEluZGV4ID0gNDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoLWRvdCA8IG1pbkRvdCkge1xuICAgICAgICAgIG1pbkRvdCA9IC1kb3Q7XG4gICAgICAgICAgbWluRG90SW5kZXggPSA1O1xuICAgICAgICB9XG5cbiAgICAgICAgLy9fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19cblxuICAgICAgICBpZiAobWluRG90SW5kZXggPT0gMCkgey8vIHgrIGZhY2VcbiAgICAgICAgICBxMXggPSBWMlswXTsgcTF5ID0gVjJbMV07IHExeiA9IFYyWzJdOy8vdmVydGV4MVxuICAgICAgICAgIHEyeCA9IFYyWzZdOyBxMnkgPSBWMls3XTsgcTJ6ID0gVjJbOF07Ly92ZXJ0ZXgzXG4gICAgICAgICAgcTN4ID0gVjJbOV07IHEzeSA9IFYyWzEwXTsgcTN6ID0gVjJbMTFdOy8vdmVydGV4NFxuICAgICAgICAgIHE0eCA9IFYyWzNdOyBxNHkgPSBWMls0XTsgcTR6ID0gVjJbNV07Ly92ZXJ0ZXgyXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAobWluRG90SW5kZXggPT0gMSkgey8vIHgtIGZhY2VcbiAgICAgICAgICBxMXggPSBWMlsxNV07IHExeSA9IFYyWzE2XTsgcTF6ID0gVjJbMTddOy8vdmVydGV4NlxuICAgICAgICAgIHEyeCA9IFYyWzIxXTsgcTJ5ID0gVjJbMjJdOyBxMnogPSBWMlsyM107IC8vdmVydGV4OFxuICAgICAgICAgIHEzeCA9IFYyWzE4XTsgcTN5ID0gVjJbMTldOyBxM3ogPSBWMlsyMF07Ly92ZXJ0ZXg3XG4gICAgICAgICAgcTR4ID0gVjJbMTJdOyBxNHkgPSBWMlsxM107IHE0eiA9IFYyWzE0XTsvL3ZlcnRleDVcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChtaW5Eb3RJbmRleCA9PSAyKSB7Ly8geSsgZmFjZVxuICAgICAgICAgIHExeCA9IFYyWzEyXTsgcTF5ID0gVjJbMTNdOyBxMXogPSBWMlsxNF07Ly92ZXJ0ZXg1XG4gICAgICAgICAgcTJ4ID0gVjJbMF07IHEyeSA9IFYyWzFdOyBxMnogPSBWMlsyXTsvL3ZlcnRleDFcbiAgICAgICAgICBxM3ggPSBWMlszXTsgcTN5ID0gVjJbNF07IHEzeiA9IFYyWzVdOy8vdmVydGV4MlxuICAgICAgICAgIHE0eCA9IFYyWzE1XTsgcTR5ID0gVjJbMTZdOyBxNHogPSBWMlsxN107Ly92ZXJ0ZXg2XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAobWluRG90SW5kZXggPT0gMykgey8vIHktIGZhY2VcbiAgICAgICAgICBxMXggPSBWMlsyMV07IHExeSA9IFYyWzIyXTsgcTF6ID0gVjJbMjNdOy8vdmVydGV4OFxuICAgICAgICAgIHEyeCA9IFYyWzldOyBxMnkgPSBWMlsxMF07IHEyeiA9IFYyWzExXTsvL3ZlcnRleDRcbiAgICAgICAgICBxM3ggPSBWMls2XTsgcTN5ID0gVjJbN107IHEzeiA9IFYyWzhdOy8vdmVydGV4M1xuICAgICAgICAgIHE0eCA9IFYyWzE4XTsgcTR5ID0gVjJbMTldOyBxNHogPSBWMlsyMF07Ly92ZXJ0ZXg3XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAobWluRG90SW5kZXggPT0gNCkgey8vIHorIGZhY2VcbiAgICAgICAgICBxMXggPSBWMlsxMl07IHExeSA9IFYyWzEzXTsgcTF6ID0gVjJbMTRdOy8vdmVydGV4NVxuICAgICAgICAgIHEyeCA9IFYyWzE4XTsgcTJ5ID0gVjJbMTldOyBxMnogPSBWMlsyMF07Ly92ZXJ0ZXg3XG4gICAgICAgICAgcTN4ID0gVjJbNl07IHEzeSA9IFYyWzddOyBxM3ogPSBWMls4XTsvL3ZlcnRleDNcbiAgICAgICAgICBxNHggPSBWMlswXTsgcTR5ID0gVjJbMV07IHE0eiA9IFYyWzJdOy8vdmVydGV4MVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG1pbkRvdEluZGV4ID09IDUpIHsvLyB6LSBmYWNlXG4gICAgICAgICAgcTF4ID0gVjJbM107IHExeSA9IFYyWzRdOyBxMXogPSBWMls1XTsvL3ZlcnRleDJcbiAgICAgICAgICBxMnggPSBWMls5XTsgcTJ5ID0gVjJbMTBdOyBxMnogPSBWMlsxMV07Ly92ZXJ0ZXg0XG4gICAgICAgICAgcTN4ID0gVjJbMjFdOyBxM3kgPSBWMlsyMl07IHEzeiA9IFYyWzIzXTsvL3ZlcnRleDhcbiAgICAgICAgICBxNHggPSBWMlsxNV07IHE0eSA9IFYyWzE2XTsgcTR6ID0gVjJbMTddOy8vdmVydGV4NlxuICAgICAgICB9XG5cbiAgICAgIH1cbiAgICAgIC8vIGNsaXAgdmVydGljZXNcbiAgICAgIHZhciBudW1DbGlwVmVydGljZXM7XG4gICAgICB2YXIgbnVtQWRkZWRDbGlwVmVydGljZXM7XG4gICAgICB2YXIgaW5kZXg7XG4gICAgICB2YXIgeDE7XG4gICAgICB2YXIgeTE7XG4gICAgICB2YXIgejE7XG4gICAgICB2YXIgeDI7XG4gICAgICB2YXIgeTI7XG4gICAgICB2YXIgejI7XG4gICAgICB0aGlzLmNsaXBWZXJ0aWNlczFbMF0gPSBxMXg7XG4gICAgICB0aGlzLmNsaXBWZXJ0aWNlczFbMV0gPSBxMXk7XG4gICAgICB0aGlzLmNsaXBWZXJ0aWNlczFbMl0gPSBxMXo7XG4gICAgICB0aGlzLmNsaXBWZXJ0aWNlczFbM10gPSBxMng7XG4gICAgICB0aGlzLmNsaXBWZXJ0aWNlczFbNF0gPSBxMnk7XG4gICAgICB0aGlzLmNsaXBWZXJ0aWNlczFbNV0gPSBxMno7XG4gICAgICB0aGlzLmNsaXBWZXJ0aWNlczFbNl0gPSBxM3g7XG4gICAgICB0aGlzLmNsaXBWZXJ0aWNlczFbN10gPSBxM3k7XG4gICAgICB0aGlzLmNsaXBWZXJ0aWNlczFbOF0gPSBxM3o7XG4gICAgICB0aGlzLmNsaXBWZXJ0aWNlczFbOV0gPSBxNHg7XG4gICAgICB0aGlzLmNsaXBWZXJ0aWNlczFbMTBdID0gcTR5O1xuICAgICAgdGhpcy5jbGlwVmVydGljZXMxWzExXSA9IHE0ejtcbiAgICAgIG51bUFkZGVkQ2xpcFZlcnRpY2VzID0gMDtcbiAgICAgIHgxID0gdGhpcy5jbGlwVmVydGljZXMxWzldO1xuICAgICAgeTEgPSB0aGlzLmNsaXBWZXJ0aWNlczFbMTBdO1xuICAgICAgejEgPSB0aGlzLmNsaXBWZXJ0aWNlczFbMTFdO1xuICAgICAgZG90MSA9ICh4MSAtIGN4IC0gczF4KSAqIG4xeCArICh5MSAtIGN5IC0gczF5KSAqIG4xeSArICh6MSAtIGN6IC0gczF6KSAqIG4xejtcblxuICAgICAgLy92YXIgaSA9IDQ7XG4gICAgICAvL3doaWxlKGktLSl7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDQ7IGkrKykge1xuICAgICAgICBpbmRleCA9IGkgKiAzO1xuICAgICAgICB4MiA9IHRoaXMuY2xpcFZlcnRpY2VzMVtpbmRleF07XG4gICAgICAgIHkyID0gdGhpcy5jbGlwVmVydGljZXMxW2luZGV4ICsgMV07XG4gICAgICAgIHoyID0gdGhpcy5jbGlwVmVydGljZXMxW2luZGV4ICsgMl07XG4gICAgICAgIGRvdDIgPSAoeDIgLSBjeCAtIHMxeCkgKiBuMXggKyAoeTIgLSBjeSAtIHMxeSkgKiBuMXkgKyAoejIgLSBjeiAtIHMxeikgKiBuMXo7XG4gICAgICAgIGlmIChkb3QxID4gMCkge1xuICAgICAgICAgIGlmIChkb3QyID4gMCkge1xuICAgICAgICAgICAgaW5kZXggPSBudW1BZGRlZENsaXBWZXJ0aWNlcyAqIDM7XG4gICAgICAgICAgICBudW1BZGRlZENsaXBWZXJ0aWNlcysrO1xuICAgICAgICAgICAgdGhpcy5jbGlwVmVydGljZXMyW2luZGV4XSA9IHgyO1xuICAgICAgICAgICAgdGhpcy5jbGlwVmVydGljZXMyW2luZGV4ICsgMV0gPSB5MjtcbiAgICAgICAgICAgIHRoaXMuY2xpcFZlcnRpY2VzMltpbmRleCArIDJdID0gejI7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGluZGV4ID0gbnVtQWRkZWRDbGlwVmVydGljZXMgKiAzO1xuICAgICAgICAgICAgbnVtQWRkZWRDbGlwVmVydGljZXMrKztcbiAgICAgICAgICAgIHQgPSBkb3QxIC8gKGRvdDEgLSBkb3QyKTtcbiAgICAgICAgICAgIHRoaXMuY2xpcFZlcnRpY2VzMltpbmRleF0gPSB4MSArICh4MiAtIHgxKSAqIHQ7XG4gICAgICAgICAgICB0aGlzLmNsaXBWZXJ0aWNlczJbaW5kZXggKyAxXSA9IHkxICsgKHkyIC0geTEpICogdDtcbiAgICAgICAgICAgIHRoaXMuY2xpcFZlcnRpY2VzMltpbmRleCArIDJdID0gejEgKyAoejIgLSB6MSkgKiB0O1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoZG90MiA+IDApIHtcbiAgICAgICAgICAgIGluZGV4ID0gbnVtQWRkZWRDbGlwVmVydGljZXMgKiAzO1xuICAgICAgICAgICAgbnVtQWRkZWRDbGlwVmVydGljZXMrKztcbiAgICAgICAgICAgIHQgPSBkb3QxIC8gKGRvdDEgLSBkb3QyKTtcbiAgICAgICAgICAgIHRoaXMuY2xpcFZlcnRpY2VzMltpbmRleF0gPSB4MSArICh4MiAtIHgxKSAqIHQ7XG4gICAgICAgICAgICB0aGlzLmNsaXBWZXJ0aWNlczJbaW5kZXggKyAxXSA9IHkxICsgKHkyIC0geTEpICogdDtcbiAgICAgICAgICAgIHRoaXMuY2xpcFZlcnRpY2VzMltpbmRleCArIDJdID0gejEgKyAoejIgLSB6MSkgKiB0O1xuICAgICAgICAgICAgaW5kZXggPSBudW1BZGRlZENsaXBWZXJ0aWNlcyAqIDM7XG4gICAgICAgICAgICBudW1BZGRlZENsaXBWZXJ0aWNlcysrO1xuICAgICAgICAgICAgdGhpcy5jbGlwVmVydGljZXMyW2luZGV4XSA9IHgyO1xuICAgICAgICAgICAgdGhpcy5jbGlwVmVydGljZXMyW2luZGV4ICsgMV0gPSB5MjtcbiAgICAgICAgICAgIHRoaXMuY2xpcFZlcnRpY2VzMltpbmRleCArIDJdID0gejI7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHgxID0geDI7XG4gICAgICAgIHkxID0geTI7XG4gICAgICAgIHoxID0gejI7XG4gICAgICAgIGRvdDEgPSBkb3QyO1xuICAgICAgfVxuXG4gICAgICBudW1DbGlwVmVydGljZXMgPSBudW1BZGRlZENsaXBWZXJ0aWNlcztcbiAgICAgIGlmIChudW1DbGlwVmVydGljZXMgPT0gMCkgcmV0dXJuO1xuICAgICAgbnVtQWRkZWRDbGlwVmVydGljZXMgPSAwO1xuICAgICAgaW5kZXggPSAobnVtQ2xpcFZlcnRpY2VzIC0gMSkgKiAzO1xuICAgICAgeDEgPSB0aGlzLmNsaXBWZXJ0aWNlczJbaW5kZXhdO1xuICAgICAgeTEgPSB0aGlzLmNsaXBWZXJ0aWNlczJbaW5kZXggKyAxXTtcbiAgICAgIHoxID0gdGhpcy5jbGlwVmVydGljZXMyW2luZGV4ICsgMl07XG4gICAgICBkb3QxID0gKHgxIC0gY3ggLSBzMngpICogbjJ4ICsgKHkxIC0gY3kgLSBzMnkpICogbjJ5ICsgKHoxIC0gY3ogLSBzMnopICogbjJ6O1xuXG4gICAgICAvL2kgPSBudW1DbGlwVmVydGljZXM7XG4gICAgICAvL3doaWxlKGktLSl7XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgbnVtQ2xpcFZlcnRpY2VzOyBpKyspIHtcbiAgICAgICAgaW5kZXggPSBpICogMztcbiAgICAgICAgeDIgPSB0aGlzLmNsaXBWZXJ0aWNlczJbaW5kZXhdO1xuICAgICAgICB5MiA9IHRoaXMuY2xpcFZlcnRpY2VzMltpbmRleCArIDFdO1xuICAgICAgICB6MiA9IHRoaXMuY2xpcFZlcnRpY2VzMltpbmRleCArIDJdO1xuICAgICAgICBkb3QyID0gKHgyIC0gY3ggLSBzMngpICogbjJ4ICsgKHkyIC0gY3kgLSBzMnkpICogbjJ5ICsgKHoyIC0gY3ogLSBzMnopICogbjJ6O1xuICAgICAgICBpZiAoZG90MSA+IDApIHtcbiAgICAgICAgICBpZiAoZG90MiA+IDApIHtcbiAgICAgICAgICAgIGluZGV4ID0gbnVtQWRkZWRDbGlwVmVydGljZXMgKiAzO1xuICAgICAgICAgICAgbnVtQWRkZWRDbGlwVmVydGljZXMrKztcbiAgICAgICAgICAgIHRoaXMuY2xpcFZlcnRpY2VzMVtpbmRleF0gPSB4MjtcbiAgICAgICAgICAgIHRoaXMuY2xpcFZlcnRpY2VzMVtpbmRleCArIDFdID0geTI7XG4gICAgICAgICAgICB0aGlzLmNsaXBWZXJ0aWNlczFbaW5kZXggKyAyXSA9IHoyO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpbmRleCA9IG51bUFkZGVkQ2xpcFZlcnRpY2VzICogMztcbiAgICAgICAgICAgIG51bUFkZGVkQ2xpcFZlcnRpY2VzKys7XG4gICAgICAgICAgICB0ID0gZG90MSAvIChkb3QxIC0gZG90Mik7XG4gICAgICAgICAgICB0aGlzLmNsaXBWZXJ0aWNlczFbaW5kZXhdID0geDEgKyAoeDIgLSB4MSkgKiB0O1xuICAgICAgICAgICAgdGhpcy5jbGlwVmVydGljZXMxW2luZGV4ICsgMV0gPSB5MSArICh5MiAtIHkxKSAqIHQ7XG4gICAgICAgICAgICB0aGlzLmNsaXBWZXJ0aWNlczFbaW5kZXggKyAyXSA9IHoxICsgKHoyIC0gejEpICogdDtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKGRvdDIgPiAwKSB7XG4gICAgICAgICAgICBpbmRleCA9IG51bUFkZGVkQ2xpcFZlcnRpY2VzICogMztcbiAgICAgICAgICAgIG51bUFkZGVkQ2xpcFZlcnRpY2VzKys7XG4gICAgICAgICAgICB0ID0gZG90MSAvIChkb3QxIC0gZG90Mik7XG4gICAgICAgICAgICB0aGlzLmNsaXBWZXJ0aWNlczFbaW5kZXhdID0geDEgKyAoeDIgLSB4MSkgKiB0O1xuICAgICAgICAgICAgdGhpcy5jbGlwVmVydGljZXMxW2luZGV4ICsgMV0gPSB5MSArICh5MiAtIHkxKSAqIHQ7XG4gICAgICAgICAgICB0aGlzLmNsaXBWZXJ0aWNlczFbaW5kZXggKyAyXSA9IHoxICsgKHoyIC0gejEpICogdDtcbiAgICAgICAgICAgIGluZGV4ID0gbnVtQWRkZWRDbGlwVmVydGljZXMgKiAzO1xuICAgICAgICAgICAgbnVtQWRkZWRDbGlwVmVydGljZXMrKztcbiAgICAgICAgICAgIHRoaXMuY2xpcFZlcnRpY2VzMVtpbmRleF0gPSB4MjtcbiAgICAgICAgICAgIHRoaXMuY2xpcFZlcnRpY2VzMVtpbmRleCArIDFdID0geTI7XG4gICAgICAgICAgICB0aGlzLmNsaXBWZXJ0aWNlczFbaW5kZXggKyAyXSA9IHoyO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB4MSA9IHgyO1xuICAgICAgICB5MSA9IHkyO1xuICAgICAgICB6MSA9IHoyO1xuICAgICAgICBkb3QxID0gZG90MjtcbiAgICAgIH1cblxuICAgICAgbnVtQ2xpcFZlcnRpY2VzID0gbnVtQWRkZWRDbGlwVmVydGljZXM7XG4gICAgICBpZiAobnVtQ2xpcFZlcnRpY2VzID09IDApIHJldHVybjtcbiAgICAgIG51bUFkZGVkQ2xpcFZlcnRpY2VzID0gMDtcbiAgICAgIGluZGV4ID0gKG51bUNsaXBWZXJ0aWNlcyAtIDEpICogMztcbiAgICAgIHgxID0gdGhpcy5jbGlwVmVydGljZXMxW2luZGV4XTtcbiAgICAgIHkxID0gdGhpcy5jbGlwVmVydGljZXMxW2luZGV4ICsgMV07XG4gICAgICB6MSA9IHRoaXMuY2xpcFZlcnRpY2VzMVtpbmRleCArIDJdO1xuICAgICAgZG90MSA9ICh4MSAtIGN4ICsgczF4KSAqIC1uMXggKyAoeTEgLSBjeSArIHMxeSkgKiAtbjF5ICsgKHoxIC0gY3ogKyBzMXopICogLW4xejtcblxuICAgICAgLy9pID0gbnVtQ2xpcFZlcnRpY2VzO1xuICAgICAgLy93aGlsZShpLS0pe1xuICAgICAgZm9yIChpID0gMDsgaSA8IG51bUNsaXBWZXJ0aWNlczsgaSsrKSB7XG4gICAgICAgIGluZGV4ID0gaSAqIDM7XG4gICAgICAgIHgyID0gdGhpcy5jbGlwVmVydGljZXMxW2luZGV4XTtcbiAgICAgICAgeTIgPSB0aGlzLmNsaXBWZXJ0aWNlczFbaW5kZXggKyAxXTtcbiAgICAgICAgejIgPSB0aGlzLmNsaXBWZXJ0aWNlczFbaW5kZXggKyAyXTtcbiAgICAgICAgZG90MiA9ICh4MiAtIGN4ICsgczF4KSAqIC1uMXggKyAoeTIgLSBjeSArIHMxeSkgKiAtbjF5ICsgKHoyIC0gY3ogKyBzMXopICogLW4xejtcbiAgICAgICAgaWYgKGRvdDEgPiAwKSB7XG4gICAgICAgICAgaWYgKGRvdDIgPiAwKSB7XG4gICAgICAgICAgICBpbmRleCA9IG51bUFkZGVkQ2xpcFZlcnRpY2VzICogMztcbiAgICAgICAgICAgIG51bUFkZGVkQ2xpcFZlcnRpY2VzKys7XG4gICAgICAgICAgICB0aGlzLmNsaXBWZXJ0aWNlczJbaW5kZXhdID0geDI7XG4gICAgICAgICAgICB0aGlzLmNsaXBWZXJ0aWNlczJbaW5kZXggKyAxXSA9IHkyO1xuICAgICAgICAgICAgdGhpcy5jbGlwVmVydGljZXMyW2luZGV4ICsgMl0gPSB6MjtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaW5kZXggPSBudW1BZGRlZENsaXBWZXJ0aWNlcyAqIDM7XG4gICAgICAgICAgICBudW1BZGRlZENsaXBWZXJ0aWNlcysrO1xuICAgICAgICAgICAgdCA9IGRvdDEgLyAoZG90MSAtIGRvdDIpO1xuICAgICAgICAgICAgdGhpcy5jbGlwVmVydGljZXMyW2luZGV4XSA9IHgxICsgKHgyIC0geDEpICogdDtcbiAgICAgICAgICAgIHRoaXMuY2xpcFZlcnRpY2VzMltpbmRleCArIDFdID0geTEgKyAoeTIgLSB5MSkgKiB0O1xuICAgICAgICAgICAgdGhpcy5jbGlwVmVydGljZXMyW2luZGV4ICsgMl0gPSB6MSArICh6MiAtIHoxKSAqIHQ7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChkb3QyID4gMCkge1xuICAgICAgICAgICAgaW5kZXggPSBudW1BZGRlZENsaXBWZXJ0aWNlcyAqIDM7XG4gICAgICAgICAgICBudW1BZGRlZENsaXBWZXJ0aWNlcysrO1xuICAgICAgICAgICAgdCA9IGRvdDEgLyAoZG90MSAtIGRvdDIpO1xuICAgICAgICAgICAgdGhpcy5jbGlwVmVydGljZXMyW2luZGV4XSA9IHgxICsgKHgyIC0geDEpICogdDtcbiAgICAgICAgICAgIHRoaXMuY2xpcFZlcnRpY2VzMltpbmRleCArIDFdID0geTEgKyAoeTIgLSB5MSkgKiB0O1xuICAgICAgICAgICAgdGhpcy5jbGlwVmVydGljZXMyW2luZGV4ICsgMl0gPSB6MSArICh6MiAtIHoxKSAqIHQ7XG4gICAgICAgICAgICBpbmRleCA9IG51bUFkZGVkQ2xpcFZlcnRpY2VzICogMztcbiAgICAgICAgICAgIG51bUFkZGVkQ2xpcFZlcnRpY2VzKys7XG4gICAgICAgICAgICB0aGlzLmNsaXBWZXJ0aWNlczJbaW5kZXhdID0geDI7XG4gICAgICAgICAgICB0aGlzLmNsaXBWZXJ0aWNlczJbaW5kZXggKyAxXSA9IHkyO1xuICAgICAgICAgICAgdGhpcy5jbGlwVmVydGljZXMyW2luZGV4ICsgMl0gPSB6MjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgeDEgPSB4MjtcbiAgICAgICAgeTEgPSB5MjtcbiAgICAgICAgejEgPSB6MjtcbiAgICAgICAgZG90MSA9IGRvdDI7XG4gICAgICB9XG5cbiAgICAgIG51bUNsaXBWZXJ0aWNlcyA9IG51bUFkZGVkQ2xpcFZlcnRpY2VzO1xuICAgICAgaWYgKG51bUNsaXBWZXJ0aWNlcyA9PSAwKSByZXR1cm47XG4gICAgICBudW1BZGRlZENsaXBWZXJ0aWNlcyA9IDA7XG4gICAgICBpbmRleCA9IChudW1DbGlwVmVydGljZXMgLSAxKSAqIDM7XG4gICAgICB4MSA9IHRoaXMuY2xpcFZlcnRpY2VzMltpbmRleF07XG4gICAgICB5MSA9IHRoaXMuY2xpcFZlcnRpY2VzMltpbmRleCArIDFdO1xuICAgICAgejEgPSB0aGlzLmNsaXBWZXJ0aWNlczJbaW5kZXggKyAyXTtcbiAgICAgIGRvdDEgPSAoeDEgLSBjeCArIHMyeCkgKiAtbjJ4ICsgKHkxIC0gY3kgKyBzMnkpICogLW4yeSArICh6MSAtIGN6ICsgczJ6KSAqIC1uMno7XG5cbiAgICAgIC8vaSA9IG51bUNsaXBWZXJ0aWNlcztcbiAgICAgIC8vd2hpbGUoaS0tKXtcbiAgICAgIGZvciAoaSA9IDA7IGkgPCBudW1DbGlwVmVydGljZXM7IGkrKykge1xuICAgICAgICBpbmRleCA9IGkgKiAzO1xuICAgICAgICB4MiA9IHRoaXMuY2xpcFZlcnRpY2VzMltpbmRleF07XG4gICAgICAgIHkyID0gdGhpcy5jbGlwVmVydGljZXMyW2luZGV4ICsgMV07XG4gICAgICAgIHoyID0gdGhpcy5jbGlwVmVydGljZXMyW2luZGV4ICsgMl07XG4gICAgICAgIGRvdDIgPSAoeDIgLSBjeCArIHMyeCkgKiAtbjJ4ICsgKHkyIC0gY3kgKyBzMnkpICogLW4yeSArICh6MiAtIGN6ICsgczJ6KSAqIC1uMno7XG4gICAgICAgIGlmIChkb3QxID4gMCkge1xuICAgICAgICAgIGlmIChkb3QyID4gMCkge1xuICAgICAgICAgICAgaW5kZXggPSBudW1BZGRlZENsaXBWZXJ0aWNlcyAqIDM7XG4gICAgICAgICAgICBudW1BZGRlZENsaXBWZXJ0aWNlcysrO1xuICAgICAgICAgICAgdGhpcy5jbGlwVmVydGljZXMxW2luZGV4XSA9IHgyO1xuICAgICAgICAgICAgdGhpcy5jbGlwVmVydGljZXMxW2luZGV4ICsgMV0gPSB5MjtcbiAgICAgICAgICAgIHRoaXMuY2xpcFZlcnRpY2VzMVtpbmRleCArIDJdID0gejI7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGluZGV4ID0gbnVtQWRkZWRDbGlwVmVydGljZXMgKiAzO1xuICAgICAgICAgICAgbnVtQWRkZWRDbGlwVmVydGljZXMrKztcbiAgICAgICAgICAgIHQgPSBkb3QxIC8gKGRvdDEgLSBkb3QyKTtcbiAgICAgICAgICAgIHRoaXMuY2xpcFZlcnRpY2VzMVtpbmRleF0gPSB4MSArICh4MiAtIHgxKSAqIHQ7XG4gICAgICAgICAgICB0aGlzLmNsaXBWZXJ0aWNlczFbaW5kZXggKyAxXSA9IHkxICsgKHkyIC0geTEpICogdDtcbiAgICAgICAgICAgIHRoaXMuY2xpcFZlcnRpY2VzMVtpbmRleCArIDJdID0gejEgKyAoejIgLSB6MSkgKiB0O1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoZG90MiA+IDApIHtcbiAgICAgICAgICAgIGluZGV4ID0gbnVtQWRkZWRDbGlwVmVydGljZXMgKiAzO1xuICAgICAgICAgICAgbnVtQWRkZWRDbGlwVmVydGljZXMrKztcbiAgICAgICAgICAgIHQgPSBkb3QxIC8gKGRvdDEgLSBkb3QyKTtcbiAgICAgICAgICAgIHRoaXMuY2xpcFZlcnRpY2VzMVtpbmRleF0gPSB4MSArICh4MiAtIHgxKSAqIHQ7XG4gICAgICAgICAgICB0aGlzLmNsaXBWZXJ0aWNlczFbaW5kZXggKyAxXSA9IHkxICsgKHkyIC0geTEpICogdDtcbiAgICAgICAgICAgIHRoaXMuY2xpcFZlcnRpY2VzMVtpbmRleCArIDJdID0gejEgKyAoejIgLSB6MSkgKiB0O1xuICAgICAgICAgICAgaW5kZXggPSBudW1BZGRlZENsaXBWZXJ0aWNlcyAqIDM7XG4gICAgICAgICAgICBudW1BZGRlZENsaXBWZXJ0aWNlcysrO1xuICAgICAgICAgICAgdGhpcy5jbGlwVmVydGljZXMxW2luZGV4XSA9IHgyO1xuICAgICAgICAgICAgdGhpcy5jbGlwVmVydGljZXMxW2luZGV4ICsgMV0gPSB5MjtcbiAgICAgICAgICAgIHRoaXMuY2xpcFZlcnRpY2VzMVtpbmRleCArIDJdID0gejI7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHgxID0geDI7XG4gICAgICAgIHkxID0geTI7XG4gICAgICAgIHoxID0gejI7XG4gICAgICAgIGRvdDEgPSBkb3QyO1xuICAgICAgfVxuXG4gICAgICBudW1DbGlwVmVydGljZXMgPSBudW1BZGRlZENsaXBWZXJ0aWNlcztcbiAgICAgIGlmIChzd2FwKSB7XG4gICAgICAgIHZhciB0YiA9IGIxO1xuICAgICAgICBiMSA9IGIyO1xuICAgICAgICBiMiA9IHRiO1xuICAgICAgfVxuICAgICAgaWYgKG51bUNsaXBWZXJ0aWNlcyA9PSAwKSByZXR1cm47XG4gICAgICB2YXIgZmxpcHBlZCA9IGIxICE9IHNoYXBlMTtcbiAgICAgIGlmIChudW1DbGlwVmVydGljZXMgPiA0KSB7XG4gICAgICAgIHgxID0gKHExeCArIHEyeCArIHEzeCArIHE0eCkgKiAwLjI1O1xuICAgICAgICB5MSA9IChxMXkgKyBxMnkgKyBxM3kgKyBxNHkpICogMC4yNTtcbiAgICAgICAgejEgPSAocTF6ICsgcTJ6ICsgcTN6ICsgcTR6KSAqIDAuMjU7XG4gICAgICAgIG4xeCA9IHExeCAtIHgxO1xuICAgICAgICBuMXkgPSBxMXkgLSB5MTtcbiAgICAgICAgbjF6ID0gcTF6IC0gejE7XG4gICAgICAgIG4yeCA9IHEyeCAtIHgxO1xuICAgICAgICBuMnkgPSBxMnkgLSB5MTtcbiAgICAgICAgbjJ6ID0gcTJ6IC0gejE7XG4gICAgICAgIHZhciBpbmRleDEgPSAwO1xuICAgICAgICB2YXIgaW5kZXgyID0gMDtcbiAgICAgICAgdmFyIGluZGV4MyA9IDA7XG4gICAgICAgIHZhciBpbmRleDQgPSAwO1xuICAgICAgICB2YXIgbWF4RG90ID0gLXRoaXMuSU5GO1xuICAgICAgICBtaW5Eb3QgPSB0aGlzLklORjtcblxuICAgICAgICAvL2kgPSBudW1DbGlwVmVydGljZXM7XG4gICAgICAgIC8vd2hpbGUoaS0tKXtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IG51bUNsaXBWZXJ0aWNlczsgaSsrKSB7XG4gICAgICAgICAgdGhpcy51c2VkW2ldID0gZmFsc2U7XG4gICAgICAgICAgaW5kZXggPSBpICogMztcbiAgICAgICAgICB4MSA9IHRoaXMuY2xpcFZlcnRpY2VzMVtpbmRleF07XG4gICAgICAgICAgeTEgPSB0aGlzLmNsaXBWZXJ0aWNlczFbaW5kZXggKyAxXTtcbiAgICAgICAgICB6MSA9IHRoaXMuY2xpcFZlcnRpY2VzMVtpbmRleCArIDJdO1xuICAgICAgICAgIGRvdCA9IHgxICogbjF4ICsgeTEgKiBuMXkgKyB6MSAqIG4xejtcbiAgICAgICAgICBpZiAoZG90IDwgbWluRG90KSB7XG4gICAgICAgICAgICBtaW5Eb3QgPSBkb3Q7XG4gICAgICAgICAgICBpbmRleDEgPSBpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoZG90ID4gbWF4RG90KSB7XG4gICAgICAgICAgICBtYXhEb3QgPSBkb3Q7XG4gICAgICAgICAgICBpbmRleDMgPSBpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMudXNlZFtpbmRleDFdID0gdHJ1ZTtcbiAgICAgICAgdGhpcy51c2VkW2luZGV4M10gPSB0cnVlO1xuICAgICAgICBtYXhEb3QgPSAtdGhpcy5JTkY7XG4gICAgICAgIG1pbkRvdCA9IHRoaXMuSU5GO1xuXG4gICAgICAgIC8vaSA9IG51bUNsaXBWZXJ0aWNlcztcbiAgICAgICAgLy93aGlsZShpLS0pe1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbnVtQ2xpcFZlcnRpY2VzOyBpKyspIHtcbiAgICAgICAgICBpZiAodGhpcy51c2VkW2ldKSBjb250aW51ZTtcbiAgICAgICAgICBpbmRleCA9IGkgKiAzO1xuICAgICAgICAgIHgxID0gdGhpcy5jbGlwVmVydGljZXMxW2luZGV4XTtcbiAgICAgICAgICB5MSA9IHRoaXMuY2xpcFZlcnRpY2VzMVtpbmRleCArIDFdO1xuICAgICAgICAgIHoxID0gdGhpcy5jbGlwVmVydGljZXMxW2luZGV4ICsgMl07XG4gICAgICAgICAgZG90ID0geDEgKiBuMnggKyB5MSAqIG4yeSArIHoxICogbjJ6O1xuICAgICAgICAgIGlmIChkb3QgPCBtaW5Eb3QpIHtcbiAgICAgICAgICAgIG1pbkRvdCA9IGRvdDtcbiAgICAgICAgICAgIGluZGV4MiA9IGk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChkb3QgPiBtYXhEb3QpIHtcbiAgICAgICAgICAgIG1heERvdCA9IGRvdDtcbiAgICAgICAgICAgIGluZGV4NCA9IGk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaW5kZXggPSBpbmRleDEgKiAzO1xuICAgICAgICB4MSA9IHRoaXMuY2xpcFZlcnRpY2VzMVtpbmRleF07XG4gICAgICAgIHkxID0gdGhpcy5jbGlwVmVydGljZXMxW2luZGV4ICsgMV07XG4gICAgICAgIHoxID0gdGhpcy5jbGlwVmVydGljZXMxW2luZGV4ICsgMl07XG4gICAgICAgIGRvdCA9ICh4MSAtIGN4KSAqIG54ICsgKHkxIC0gY3kpICogbnkgKyAoejEgLSBjeikgKiBuejtcbiAgICAgICAgaWYgKGRvdCA8IDApIG1hbmlmb2xkLmFkZFBvaW50KHgxLCB5MSwgejEsIG54LCBueSwgbnosIGRvdCwgZmxpcHBlZCk7XG5cbiAgICAgICAgaW5kZXggPSBpbmRleDIgKiAzO1xuICAgICAgICB4MSA9IHRoaXMuY2xpcFZlcnRpY2VzMVtpbmRleF07XG4gICAgICAgIHkxID0gdGhpcy5jbGlwVmVydGljZXMxW2luZGV4ICsgMV07XG4gICAgICAgIHoxID0gdGhpcy5jbGlwVmVydGljZXMxW2luZGV4ICsgMl07XG4gICAgICAgIGRvdCA9ICh4MSAtIGN4KSAqIG54ICsgKHkxIC0gY3kpICogbnkgKyAoejEgLSBjeikgKiBuejtcbiAgICAgICAgaWYgKGRvdCA8IDApIG1hbmlmb2xkLmFkZFBvaW50KHgxLCB5MSwgejEsIG54LCBueSwgbnosIGRvdCwgZmxpcHBlZCk7XG5cbiAgICAgICAgaW5kZXggPSBpbmRleDMgKiAzO1xuICAgICAgICB4MSA9IHRoaXMuY2xpcFZlcnRpY2VzMVtpbmRleF07XG4gICAgICAgIHkxID0gdGhpcy5jbGlwVmVydGljZXMxW2luZGV4ICsgMV07XG4gICAgICAgIHoxID0gdGhpcy5jbGlwVmVydGljZXMxW2luZGV4ICsgMl07XG4gICAgICAgIGRvdCA9ICh4MSAtIGN4KSAqIG54ICsgKHkxIC0gY3kpICogbnkgKyAoejEgLSBjeikgKiBuejtcbiAgICAgICAgaWYgKGRvdCA8IDApIG1hbmlmb2xkLmFkZFBvaW50KHgxLCB5MSwgejEsIG54LCBueSwgbnosIGRvdCwgZmxpcHBlZCk7XG5cbiAgICAgICAgaW5kZXggPSBpbmRleDQgKiAzO1xuICAgICAgICB4MSA9IHRoaXMuY2xpcFZlcnRpY2VzMVtpbmRleF07XG4gICAgICAgIHkxID0gdGhpcy5jbGlwVmVydGljZXMxW2luZGV4ICsgMV07XG4gICAgICAgIHoxID0gdGhpcy5jbGlwVmVydGljZXMxW2luZGV4ICsgMl07XG4gICAgICAgIGRvdCA9ICh4MSAtIGN4KSAqIG54ICsgKHkxIC0gY3kpICogbnkgKyAoejEgLSBjeikgKiBuejtcbiAgICAgICAgaWYgKGRvdCA8IDApIG1hbmlmb2xkLmFkZFBvaW50KHgxLCB5MSwgejEsIG54LCBueSwgbnosIGRvdCwgZmxpcHBlZCk7XG5cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vaSA9IG51bUNsaXBWZXJ0aWNlcztcbiAgICAgICAgLy93aGlsZShpLS0pe1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbnVtQ2xpcFZlcnRpY2VzOyBpKyspIHtcbiAgICAgICAgICBpbmRleCA9IGkgKiAzO1xuICAgICAgICAgIHgxID0gdGhpcy5jbGlwVmVydGljZXMxW2luZGV4XTtcbiAgICAgICAgICB5MSA9IHRoaXMuY2xpcFZlcnRpY2VzMVtpbmRleCArIDFdO1xuICAgICAgICAgIHoxID0gdGhpcy5jbGlwVmVydGljZXMxW2luZGV4ICsgMl07XG4gICAgICAgICAgZG90ID0gKHgxIC0gY3gpICogbnggKyAoeTEgLSBjeSkgKiBueSArICh6MSAtIGN6KSAqIG56O1xuICAgICAgICAgIGlmIChkb3QgPCAwKSBtYW5pZm9sZC5hZGRQb2ludCh4MSwgeTEsIHoxLCBueCwgbnksIG56LCBkb3QsIGZsaXBwZWQpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICB9XG5cbiAgfSk7XG5cbiAgZnVuY3Rpb24gQm94Q3lsaW5kZXJDb2xsaXNpb25EZXRlY3RvcihmbGlwKSB7XG5cbiAgICBDb2xsaXNpb25EZXRlY3Rvci5jYWxsKHRoaXMpO1xuICAgIHRoaXMuZmxpcCA9IGZsaXA7XG5cbiAgfVxuICBCb3hDeWxpbmRlckNvbGxpc2lvbkRldGVjdG9yLnByb3RvdHlwZSA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmNyZWF0ZShDb2xsaXNpb25EZXRlY3Rvci5wcm90b3R5cGUpLCB7XG5cbiAgICBjb25zdHJ1Y3RvcjogQm94Q3lsaW5kZXJDb2xsaXNpb25EZXRlY3RvcixcblxuICAgIGdldFNlcDogZnVuY3Rpb24gKGMxLCBjMiwgc2VwLCBwb3MsIGRlcCkge1xuXG4gICAgICB2YXIgdDF4O1xuICAgICAgdmFyIHQxeTtcbiAgICAgIHZhciB0MXo7XG4gICAgICB2YXIgdDJ4O1xuICAgICAgdmFyIHQyeTtcbiAgICAgIHZhciB0Mno7XG4gICAgICB2YXIgc3VwID0gbmV3IFZlYzMoKTtcbiAgICAgIHZhciBsZW47XG4gICAgICB2YXIgcDF4O1xuICAgICAgdmFyIHAxeTtcbiAgICAgIHZhciBwMXo7XG4gICAgICB2YXIgcDJ4O1xuICAgICAgdmFyIHAyeTtcbiAgICAgIHZhciBwMno7XG4gICAgICB2YXIgdjAxeCA9IGMxLnBvc2l0aW9uLng7XG4gICAgICB2YXIgdjAxeSA9IGMxLnBvc2l0aW9uLnk7XG4gICAgICB2YXIgdjAxeiA9IGMxLnBvc2l0aW9uLno7XG4gICAgICB2YXIgdjAyeCA9IGMyLnBvc2l0aW9uLng7XG4gICAgICB2YXIgdjAyeSA9IGMyLnBvc2l0aW9uLnk7XG4gICAgICB2YXIgdjAyeiA9IGMyLnBvc2l0aW9uLno7XG4gICAgICB2YXIgdjB4ID0gdjAyeCAtIHYwMXg7XG4gICAgICB2YXIgdjB5ID0gdjAyeSAtIHYwMXk7XG4gICAgICB2YXIgdjB6ID0gdjAyeiAtIHYwMXo7XG4gICAgICBpZiAodjB4ICogdjB4ICsgdjB5ICogdjB5ICsgdjB6ICogdjB6ID09IDApIHYweSA9IDAuMDAxO1xuICAgICAgdmFyIG54ID0gLXYweDtcbiAgICAgIHZhciBueSA9IC12MHk7XG4gICAgICB2YXIgbnogPSAtdjB6O1xuICAgICAgdGhpcy5zdXBwb3J0UG9pbnRCKGMxLCAtbngsIC1ueSwgLW56LCBzdXApO1xuICAgICAgdmFyIHYxMXggPSBzdXAueDtcbiAgICAgIHZhciB2MTF5ID0gc3VwLnk7XG4gICAgICB2YXIgdjExeiA9IHN1cC56O1xuICAgICAgdGhpcy5zdXBwb3J0UG9pbnRDKGMyLCBueCwgbnksIG56LCBzdXApO1xuICAgICAgdmFyIHYxMnggPSBzdXAueDtcbiAgICAgIHZhciB2MTJ5ID0gc3VwLnk7XG4gICAgICB2YXIgdjEyeiA9IHN1cC56O1xuICAgICAgdmFyIHYxeCA9IHYxMnggLSB2MTF4O1xuICAgICAgdmFyIHYxeSA9IHYxMnkgLSB2MTF5O1xuICAgICAgdmFyIHYxeiA9IHYxMnogLSB2MTF6O1xuICAgICAgaWYgKHYxeCAqIG54ICsgdjF5ICogbnkgKyB2MXogKiBueiA8PSAwKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIG54ID0gdjF5ICogdjB6IC0gdjF6ICogdjB5O1xuICAgICAgbnkgPSB2MXogKiB2MHggLSB2MXggKiB2MHo7XG4gICAgICBueiA9IHYxeCAqIHYweSAtIHYxeSAqIHYweDtcbiAgICAgIGlmIChueCAqIG54ICsgbnkgKiBueSArIG56ICogbnogPT0gMCkge1xuICAgICAgICBzZXAuc2V0KHYxeCAtIHYweCwgdjF5IC0gdjB5LCB2MXogLSB2MHopLm5vcm1hbGl6ZSgpO1xuICAgICAgICBwb3Muc2V0KCh2MTF4ICsgdjEyeCkgKiAwLjUsICh2MTF5ICsgdjEyeSkgKiAwLjUsICh2MTF6ICsgdjEyeikgKiAwLjUpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIHRoaXMuc3VwcG9ydFBvaW50QihjMSwgLW54LCAtbnksIC1ueiwgc3VwKTtcbiAgICAgIHZhciB2MjF4ID0gc3VwLng7XG4gICAgICB2YXIgdjIxeSA9IHN1cC55O1xuICAgICAgdmFyIHYyMXogPSBzdXAuejtcbiAgICAgIHRoaXMuc3VwcG9ydFBvaW50QyhjMiwgbngsIG55LCBueiwgc3VwKTtcbiAgICAgIHZhciB2MjJ4ID0gc3VwLng7XG4gICAgICB2YXIgdjIyeSA9IHN1cC55O1xuICAgICAgdmFyIHYyMnogPSBzdXAuejtcbiAgICAgIHZhciB2MnggPSB2MjJ4IC0gdjIxeDtcbiAgICAgIHZhciB2MnkgPSB2MjJ5IC0gdjIxeTtcbiAgICAgIHZhciB2MnogPSB2MjJ6IC0gdjIxejtcbiAgICAgIGlmICh2MnggKiBueCArIHYyeSAqIG55ICsgdjJ6ICogbnogPD0gMCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICB0MXggPSB2MXggLSB2MHg7XG4gICAgICB0MXkgPSB2MXkgLSB2MHk7XG4gICAgICB0MXogPSB2MXogLSB2MHo7XG4gICAgICB0MnggPSB2MnggLSB2MHg7XG4gICAgICB0MnkgPSB2MnkgLSB2MHk7XG4gICAgICB0MnogPSB2MnogLSB2MHo7XG4gICAgICBueCA9IHQxeSAqIHQyeiAtIHQxeiAqIHQyeTtcbiAgICAgIG55ID0gdDF6ICogdDJ4IC0gdDF4ICogdDJ6O1xuICAgICAgbnogPSB0MXggKiB0MnkgLSB0MXkgKiB0Mng7XG4gICAgICBpZiAobnggKiB2MHggKyBueSAqIHYweSArIG56ICogdjB6ID4gMCkge1xuICAgICAgICB0MXggPSB2MXg7XG4gICAgICAgIHQxeSA9IHYxeTtcbiAgICAgICAgdDF6ID0gdjF6O1xuICAgICAgICB2MXggPSB2Mng7XG4gICAgICAgIHYxeSA9IHYyeTtcbiAgICAgICAgdjF6ID0gdjJ6O1xuICAgICAgICB2MnggPSB0MXg7XG4gICAgICAgIHYyeSA9IHQxeTtcbiAgICAgICAgdjJ6ID0gdDF6O1xuICAgICAgICB0MXggPSB2MTF4O1xuICAgICAgICB0MXkgPSB2MTF5O1xuICAgICAgICB0MXogPSB2MTF6O1xuICAgICAgICB2MTF4ID0gdjIxeDtcbiAgICAgICAgdjExeSA9IHYyMXk7XG4gICAgICAgIHYxMXogPSB2MjF6O1xuICAgICAgICB2MjF4ID0gdDF4O1xuICAgICAgICB2MjF5ID0gdDF5O1xuICAgICAgICB2MjF6ID0gdDF6O1xuICAgICAgICB0MXggPSB2MTJ4O1xuICAgICAgICB0MXkgPSB2MTJ5O1xuICAgICAgICB0MXogPSB2MTJ6O1xuICAgICAgICB2MTJ4ID0gdjIyeDtcbiAgICAgICAgdjEyeSA9IHYyMnk7XG4gICAgICAgIHYxMnogPSB2MjJ6O1xuICAgICAgICB2MjJ4ID0gdDF4O1xuICAgICAgICB2MjJ5ID0gdDF5O1xuICAgICAgICB2MjJ6ID0gdDF6O1xuICAgICAgICBueCA9IC1ueDtcbiAgICAgICAgbnkgPSAtbnk7XG4gICAgICAgIG56ID0gLW56O1xuICAgICAgfVxuICAgICAgdmFyIGl0ZXJhdGlvbnMgPSAwO1xuICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgaWYgKCsraXRlcmF0aW9ucyA+IDEwMCkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnN1cHBvcnRQb2ludEIoYzEsIC1ueCwgLW55LCAtbnosIHN1cCk7XG4gICAgICAgIHZhciB2MzF4ID0gc3VwLng7XG4gICAgICAgIHZhciB2MzF5ID0gc3VwLnk7XG4gICAgICAgIHZhciB2MzF6ID0gc3VwLno7XG4gICAgICAgIHRoaXMuc3VwcG9ydFBvaW50QyhjMiwgbngsIG55LCBueiwgc3VwKTtcbiAgICAgICAgdmFyIHYzMnggPSBzdXAueDtcbiAgICAgICAgdmFyIHYzMnkgPSBzdXAueTtcbiAgICAgICAgdmFyIHYzMnogPSBzdXAuejtcbiAgICAgICAgdmFyIHYzeCA9IHYzMnggLSB2MzF4O1xuICAgICAgICB2YXIgdjN5ID0gdjMyeSAtIHYzMXk7XG4gICAgICAgIHZhciB2M3ogPSB2MzJ6IC0gdjMxejtcbiAgICAgICAgaWYgKHYzeCAqIG54ICsgdjN5ICogbnkgKyB2M3ogKiBueiA8PSAwKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICgodjF5ICogdjN6IC0gdjF6ICogdjN5KSAqIHYweCArICh2MXogKiB2M3ggLSB2MXggKiB2M3opICogdjB5ICsgKHYxeCAqIHYzeSAtIHYxeSAqIHYzeCkgKiB2MHogPCAwKSB7XG4gICAgICAgICAgdjJ4ID0gdjN4O1xuICAgICAgICAgIHYyeSA9IHYzeTtcbiAgICAgICAgICB2MnogPSB2M3o7XG4gICAgICAgICAgdjIxeCA9IHYzMXg7XG4gICAgICAgICAgdjIxeSA9IHYzMXk7XG4gICAgICAgICAgdjIxeiA9IHYzMXo7XG4gICAgICAgICAgdjIyeCA9IHYzMng7XG4gICAgICAgICAgdjIyeSA9IHYzMnk7XG4gICAgICAgICAgdjIyeiA9IHYzMno7XG4gICAgICAgICAgdDF4ID0gdjF4IC0gdjB4O1xuICAgICAgICAgIHQxeSA9IHYxeSAtIHYweTtcbiAgICAgICAgICB0MXogPSB2MXogLSB2MHo7XG4gICAgICAgICAgdDJ4ID0gdjN4IC0gdjB4O1xuICAgICAgICAgIHQyeSA9IHYzeSAtIHYweTtcbiAgICAgICAgICB0MnogPSB2M3ogLSB2MHo7XG4gICAgICAgICAgbnggPSB0MXkgKiB0MnogLSB0MXogKiB0Mnk7XG4gICAgICAgICAgbnkgPSB0MXogKiB0MnggLSB0MXggKiB0Mno7XG4gICAgICAgICAgbnogPSB0MXggKiB0MnkgLSB0MXkgKiB0Mng7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCh2M3kgKiB2MnogLSB2M3ogKiB2MnkpICogdjB4ICsgKHYzeiAqIHYyeCAtIHYzeCAqIHYyeikgKiB2MHkgKyAodjN4ICogdjJ5IC0gdjN5ICogdjJ4KSAqIHYweiA8IDApIHtcbiAgICAgICAgICB2MXggPSB2M3g7XG4gICAgICAgICAgdjF5ID0gdjN5O1xuICAgICAgICAgIHYxeiA9IHYzejtcbiAgICAgICAgICB2MTF4ID0gdjMxeDtcbiAgICAgICAgICB2MTF5ID0gdjMxeTtcbiAgICAgICAgICB2MTF6ID0gdjMxejtcbiAgICAgICAgICB2MTJ4ID0gdjMyeDtcbiAgICAgICAgICB2MTJ5ID0gdjMyeTtcbiAgICAgICAgICB2MTJ6ID0gdjMyejtcbiAgICAgICAgICB0MXggPSB2M3ggLSB2MHg7XG4gICAgICAgICAgdDF5ID0gdjN5IC0gdjB5O1xuICAgICAgICAgIHQxeiA9IHYzeiAtIHYwejtcbiAgICAgICAgICB0MnggPSB2MnggLSB2MHg7XG4gICAgICAgICAgdDJ5ID0gdjJ5IC0gdjB5O1xuICAgICAgICAgIHQyeiA9IHYyeiAtIHYwejtcbiAgICAgICAgICBueCA9IHQxeSAqIHQyeiAtIHQxeiAqIHQyeTtcbiAgICAgICAgICBueSA9IHQxeiAqIHQyeCAtIHQxeCAqIHQyejtcbiAgICAgICAgICBueiA9IHQxeCAqIHQyeSAtIHQxeSAqIHQyeDtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgaGl0ID0gZmFsc2U7XG4gICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgdDF4ID0gdjJ4IC0gdjF4O1xuICAgICAgICAgIHQxeSA9IHYyeSAtIHYxeTtcbiAgICAgICAgICB0MXogPSB2MnogLSB2MXo7XG4gICAgICAgICAgdDJ4ID0gdjN4IC0gdjF4O1xuICAgICAgICAgIHQyeSA9IHYzeSAtIHYxeTtcbiAgICAgICAgICB0MnogPSB2M3ogLSB2MXo7XG4gICAgICAgICAgbnggPSB0MXkgKiB0MnogLSB0MXogKiB0Mnk7XG4gICAgICAgICAgbnkgPSB0MXogKiB0MnggLSB0MXggKiB0Mno7XG4gICAgICAgICAgbnogPSB0MXggKiB0MnkgLSB0MXkgKiB0Mng7XG4gICAgICAgICAgbGVuID0gMSAvIF9NYXRoLnNxcnQobnggKiBueCArIG55ICogbnkgKyBueiAqIG56KTtcbiAgICAgICAgICBueCAqPSBsZW47XG4gICAgICAgICAgbnkgKj0gbGVuO1xuICAgICAgICAgIG56ICo9IGxlbjtcbiAgICAgICAgICBpZiAobnggKiB2MXggKyBueSAqIHYxeSArIG56ICogdjF6ID49IDAgJiYgIWhpdCkge1xuICAgICAgICAgICAgdmFyIGIwID0gKHYxeSAqIHYyeiAtIHYxeiAqIHYyeSkgKiB2M3ggKyAodjF6ICogdjJ4IC0gdjF4ICogdjJ6KSAqIHYzeSArICh2MXggKiB2MnkgLSB2MXkgKiB2MngpICogdjN6O1xuICAgICAgICAgICAgdmFyIGIxID0gKHYzeSAqIHYyeiAtIHYzeiAqIHYyeSkgKiB2MHggKyAodjN6ICogdjJ4IC0gdjN4ICogdjJ6KSAqIHYweSArICh2M3ggKiB2MnkgLSB2M3kgKiB2MngpICogdjB6O1xuICAgICAgICAgICAgdmFyIGIyID0gKHYweSAqIHYxeiAtIHYweiAqIHYxeSkgKiB2M3ggKyAodjB6ICogdjF4IC0gdjB4ICogdjF6KSAqIHYzeSArICh2MHggKiB2MXkgLSB2MHkgKiB2MXgpICogdjN6O1xuICAgICAgICAgICAgdmFyIGIzID0gKHYyeSAqIHYxeiAtIHYyeiAqIHYxeSkgKiB2MHggKyAodjJ6ICogdjF4IC0gdjJ4ICogdjF6KSAqIHYweSArICh2MnggKiB2MXkgLSB2MnkgKiB2MXgpICogdjB6O1xuICAgICAgICAgICAgdmFyIHN1bSA9IGIwICsgYjEgKyBiMiArIGIzO1xuICAgICAgICAgICAgaWYgKHN1bSA8PSAwKSB7XG4gICAgICAgICAgICAgIGIwID0gMDtcbiAgICAgICAgICAgICAgYjEgPSAodjJ5ICogdjN6IC0gdjJ6ICogdjN5KSAqIG54ICsgKHYyeiAqIHYzeCAtIHYyeCAqIHYzeikgKiBueSArICh2MnggKiB2M3kgLSB2MnkgKiB2M3gpICogbno7XG4gICAgICAgICAgICAgIGIyID0gKHYzeSAqIHYyeiAtIHYzeiAqIHYyeSkgKiBueCArICh2M3ogKiB2MnggLSB2M3ggKiB2MnopICogbnkgKyAodjN4ICogdjJ5IC0gdjN5ICogdjJ4KSAqIG56O1xuICAgICAgICAgICAgICBiMyA9ICh2MXkgKiB2MnogLSB2MXogKiB2MnkpICogbnggKyAodjF6ICogdjJ4IC0gdjF4ICogdjJ6KSAqIG55ICsgKHYxeCAqIHYyeSAtIHYxeSAqIHYyeCkgKiBuejtcbiAgICAgICAgICAgICAgc3VtID0gYjEgKyBiMiArIGIzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGludiA9IDEgLyBzdW07XG4gICAgICAgICAgICBwMXggPSAodjAxeCAqIGIwICsgdjExeCAqIGIxICsgdjIxeCAqIGIyICsgdjMxeCAqIGIzKSAqIGludjtcbiAgICAgICAgICAgIHAxeSA9ICh2MDF5ICogYjAgKyB2MTF5ICogYjEgKyB2MjF5ICogYjIgKyB2MzF5ICogYjMpICogaW52O1xuICAgICAgICAgICAgcDF6ID0gKHYwMXogKiBiMCArIHYxMXogKiBiMSArIHYyMXogKiBiMiArIHYzMXogKiBiMykgKiBpbnY7XG4gICAgICAgICAgICBwMnggPSAodjAyeCAqIGIwICsgdjEyeCAqIGIxICsgdjIyeCAqIGIyICsgdjMyeCAqIGIzKSAqIGludjtcbiAgICAgICAgICAgIHAyeSA9ICh2MDJ5ICogYjAgKyB2MTJ5ICogYjEgKyB2MjJ5ICogYjIgKyB2MzJ5ICogYjMpICogaW52O1xuICAgICAgICAgICAgcDJ6ID0gKHYwMnogKiBiMCArIHYxMnogKiBiMSArIHYyMnogKiBiMiArIHYzMnogKiBiMykgKiBpbnY7XG4gICAgICAgICAgICBoaXQgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLnN1cHBvcnRQb2ludEIoYzEsIC1ueCwgLW55LCAtbnosIHN1cCk7XG4gICAgICAgICAgdmFyIHY0MXggPSBzdXAueDtcbiAgICAgICAgICB2YXIgdjQxeSA9IHN1cC55O1xuICAgICAgICAgIHZhciB2NDF6ID0gc3VwLno7XG4gICAgICAgICAgdGhpcy5zdXBwb3J0UG9pbnRDKGMyLCBueCwgbnksIG56LCBzdXApO1xuICAgICAgICAgIHZhciB2NDJ4ID0gc3VwLng7XG4gICAgICAgICAgdmFyIHY0MnkgPSBzdXAueTtcbiAgICAgICAgICB2YXIgdjQyeiA9IHN1cC56O1xuICAgICAgICAgIHZhciB2NHggPSB2NDJ4IC0gdjQxeDtcbiAgICAgICAgICB2YXIgdjR5ID0gdjQyeSAtIHY0MXk7XG4gICAgICAgICAgdmFyIHY0eiA9IHY0MnogLSB2NDF6O1xuICAgICAgICAgIHZhciBzZXBhcmF0aW9uID0gLSh2NHggKiBueCArIHY0eSAqIG55ICsgdjR6ICogbnopO1xuICAgICAgICAgIGlmICgodjR4IC0gdjN4KSAqIG54ICsgKHY0eSAtIHYzeSkgKiBueSArICh2NHogLSB2M3opICogbnogPD0gMC4wMSB8fCBzZXBhcmF0aW9uID49IDApIHtcbiAgICAgICAgICAgIGlmIChoaXQpIHtcbiAgICAgICAgICAgICAgc2VwLnNldCgtbngsIC1ueSwgLW56KTtcbiAgICAgICAgICAgICAgcG9zLnNldCgocDF4ICsgcDJ4KSAqIDAuNSwgKHAxeSArIHAyeSkgKiAwLjUsIChwMXogKyBwMnopICogMC41KTtcbiAgICAgICAgICAgICAgZGVwLnggPSBzZXBhcmF0aW9uO1xuICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgKHY0eSAqIHYxeiAtIHY0eiAqIHYxeSkgKiB2MHggK1xuICAgICAgICAgICAgKHY0eiAqIHYxeCAtIHY0eCAqIHYxeikgKiB2MHkgK1xuICAgICAgICAgICAgKHY0eCAqIHYxeSAtIHY0eSAqIHYxeCkgKiB2MHogPCAwXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICh2NHkgKiB2MnogLSB2NHogKiB2MnkpICogdjB4ICtcbiAgICAgICAgICAgICAgKHY0eiAqIHYyeCAtIHY0eCAqIHYyeikgKiB2MHkgK1xuICAgICAgICAgICAgICAodjR4ICogdjJ5IC0gdjR5ICogdjJ4KSAqIHYweiA8IDBcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICB2MXggPSB2NHg7XG4gICAgICAgICAgICAgIHYxeSA9IHY0eTtcbiAgICAgICAgICAgICAgdjF6ID0gdjR6O1xuICAgICAgICAgICAgICB2MTF4ID0gdjQxeDtcbiAgICAgICAgICAgICAgdjExeSA9IHY0MXk7XG4gICAgICAgICAgICAgIHYxMXogPSB2NDF6O1xuICAgICAgICAgICAgICB2MTJ4ID0gdjQyeDtcbiAgICAgICAgICAgICAgdjEyeSA9IHY0Mnk7XG4gICAgICAgICAgICAgIHYxMnogPSB2NDJ6O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdjN4ID0gdjR4O1xuICAgICAgICAgICAgICB2M3kgPSB2NHk7XG4gICAgICAgICAgICAgIHYzeiA9IHY0ejtcbiAgICAgICAgICAgICAgdjMxeCA9IHY0MXg7XG4gICAgICAgICAgICAgIHYzMXkgPSB2NDF5O1xuICAgICAgICAgICAgICB2MzF6ID0gdjQxejtcbiAgICAgICAgICAgICAgdjMyeCA9IHY0Mng7XG4gICAgICAgICAgICAgIHYzMnkgPSB2NDJ5O1xuICAgICAgICAgICAgICB2MzJ6ID0gdjQyejtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAodjR5ICogdjN6IC0gdjR6ICogdjN5KSAqIHYweCArXG4gICAgICAgICAgICAgICh2NHogKiB2M3ggLSB2NHggKiB2M3opICogdjB5ICtcbiAgICAgICAgICAgICAgKHY0eCAqIHYzeSAtIHY0eSAqIHYzeCkgKiB2MHogPCAwXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgdjJ4ID0gdjR4O1xuICAgICAgICAgICAgICB2MnkgPSB2NHk7XG4gICAgICAgICAgICAgIHYyeiA9IHY0ejtcbiAgICAgICAgICAgICAgdjIxeCA9IHY0MXg7XG4gICAgICAgICAgICAgIHYyMXkgPSB2NDF5O1xuICAgICAgICAgICAgICB2MjF6ID0gdjQxejtcbiAgICAgICAgICAgICAgdjIyeCA9IHY0Mng7XG4gICAgICAgICAgICAgIHYyMnkgPSB2NDJ5O1xuICAgICAgICAgICAgICB2MjJ6ID0gdjQyejtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHYxeCA9IHY0eDtcbiAgICAgICAgICAgICAgdjF5ID0gdjR5O1xuICAgICAgICAgICAgICB2MXogPSB2NHo7XG4gICAgICAgICAgICAgIHYxMXggPSB2NDF4O1xuICAgICAgICAgICAgICB2MTF5ID0gdjQxeTtcbiAgICAgICAgICAgICAgdjExeiA9IHY0MXo7XG4gICAgICAgICAgICAgIHYxMnggPSB2NDJ4O1xuICAgICAgICAgICAgICB2MTJ5ID0gdjQyeTtcbiAgICAgICAgICAgICAgdjEyeiA9IHY0Mno7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvL3JldHVybiBmYWxzZTtcbiAgICB9LFxuXG4gICAgc3VwcG9ydFBvaW50QjogZnVuY3Rpb24gKGMsIGR4LCBkeSwgZHosIG91dCkge1xuXG4gICAgICB2YXIgcm90ID0gYy5yb3RhdGlvbi5lbGVtZW50cztcbiAgICAgIHZhciBsZHggPSByb3RbMF0gKiBkeCArIHJvdFszXSAqIGR5ICsgcm90WzZdICogZHo7XG4gICAgICB2YXIgbGR5ID0gcm90WzFdICogZHggKyByb3RbNF0gKiBkeSArIHJvdFs3XSAqIGR6O1xuICAgICAgdmFyIGxkeiA9IHJvdFsyXSAqIGR4ICsgcm90WzVdICogZHkgKyByb3RbOF0gKiBkejtcbiAgICAgIHZhciB3ID0gYy5oYWxmV2lkdGg7XG4gICAgICB2YXIgaCA9IGMuaGFsZkhlaWdodDtcbiAgICAgIHZhciBkID0gYy5oYWxmRGVwdGg7XG4gICAgICB2YXIgb3g7XG4gICAgICB2YXIgb3k7XG4gICAgICB2YXIgb3o7XG4gICAgICBpZiAobGR4IDwgMCkgb3ggPSAtdztcbiAgICAgIGVsc2Ugb3ggPSB3O1xuICAgICAgaWYgKGxkeSA8IDApIG95ID0gLWg7XG4gICAgICBlbHNlIG95ID0gaDtcbiAgICAgIGlmIChsZHogPCAwKSBveiA9IC1kO1xuICAgICAgZWxzZSBveiA9IGQ7XG4gICAgICBsZHggPSByb3RbMF0gKiBveCArIHJvdFsxXSAqIG95ICsgcm90WzJdICogb3ogKyBjLnBvc2l0aW9uLng7XG4gICAgICBsZHkgPSByb3RbM10gKiBveCArIHJvdFs0XSAqIG95ICsgcm90WzVdICogb3ogKyBjLnBvc2l0aW9uLnk7XG4gICAgICBsZHogPSByb3RbNl0gKiBveCArIHJvdFs3XSAqIG95ICsgcm90WzhdICogb3ogKyBjLnBvc2l0aW9uLno7XG4gICAgICBvdXQuc2V0KGxkeCwgbGR5LCBsZHopO1xuXG4gICAgfSxcblxuICAgIHN1cHBvcnRQb2ludEM6IGZ1bmN0aW9uIChjLCBkeCwgZHksIGR6LCBvdXQpIHtcblxuICAgICAgdmFyIHJvdCA9IGMucm90YXRpb24uZWxlbWVudHM7XG4gICAgICB2YXIgbGR4ID0gcm90WzBdICogZHggKyByb3RbM10gKiBkeSArIHJvdFs2XSAqIGR6O1xuICAgICAgdmFyIGxkeSA9IHJvdFsxXSAqIGR4ICsgcm90WzRdICogZHkgKyByb3RbN10gKiBkejtcbiAgICAgIHZhciBsZHogPSByb3RbMl0gKiBkeCArIHJvdFs1XSAqIGR5ICsgcm90WzhdICogZHo7XG4gICAgICB2YXIgcmFkeCA9IGxkeDtcbiAgICAgIHZhciByYWR6ID0gbGR6O1xuICAgICAgdmFyIGxlbiA9IHJhZHggKiByYWR4ICsgcmFkeiAqIHJhZHo7XG4gICAgICB2YXIgcmFkID0gYy5yYWRpdXM7XG4gICAgICB2YXIgaGggPSBjLmhhbGZIZWlnaHQ7XG4gICAgICB2YXIgb3g7XG4gICAgICB2YXIgb3k7XG4gICAgICB2YXIgb3o7XG4gICAgICBpZiAobGVuID09IDApIHtcbiAgICAgICAgaWYgKGxkeSA8IDApIHtcbiAgICAgICAgICBveCA9IHJhZDtcbiAgICAgICAgICBveSA9IC1oaDtcbiAgICAgICAgICBveiA9IDA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgb3ggPSByYWQ7XG4gICAgICAgICAgb3kgPSBoaDtcbiAgICAgICAgICBveiA9IDA7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxlbiA9IGMucmFkaXVzIC8gX01hdGguc3FydChsZW4pO1xuICAgICAgICBpZiAobGR5IDwgMCkge1xuICAgICAgICAgIG94ID0gcmFkeCAqIGxlbjtcbiAgICAgICAgICBveSA9IC1oaDtcbiAgICAgICAgICBveiA9IHJhZHogKiBsZW47XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgb3ggPSByYWR4ICogbGVuO1xuICAgICAgICAgIG95ID0gaGg7XG4gICAgICAgICAgb3ogPSByYWR6ICogbGVuO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBsZHggPSByb3RbMF0gKiBveCArIHJvdFsxXSAqIG95ICsgcm90WzJdICogb3ogKyBjLnBvc2l0aW9uLng7XG4gICAgICBsZHkgPSByb3RbM10gKiBveCArIHJvdFs0XSAqIG95ICsgcm90WzVdICogb3ogKyBjLnBvc2l0aW9uLnk7XG4gICAgICBsZHogPSByb3RbNl0gKiBveCArIHJvdFs3XSAqIG95ICsgcm90WzhdICogb3ogKyBjLnBvc2l0aW9uLno7XG4gICAgICBvdXQuc2V0KGxkeCwgbGR5LCBsZHopO1xuXG4gICAgfSxcblxuICAgIGRldGVjdENvbGxpc2lvbjogZnVuY3Rpb24gKHNoYXBlMSwgc2hhcGUyLCBtYW5pZm9sZCkge1xuXG4gICAgICB2YXIgYjtcbiAgICAgIHZhciBjO1xuICAgICAgaWYgKHRoaXMuZmxpcCkge1xuICAgICAgICBiID0gc2hhcGUyO1xuICAgICAgICBjID0gc2hhcGUxO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYiA9IHNoYXBlMTtcbiAgICAgICAgYyA9IHNoYXBlMjtcbiAgICAgIH1cbiAgICAgIHZhciBzZXAgPSBuZXcgVmVjMygpO1xuICAgICAgdmFyIHBvcyA9IG5ldyBWZWMzKCk7XG4gICAgICB2YXIgZGVwID0gbmV3IFZlYzMoKTtcblxuICAgICAgaWYgKCF0aGlzLmdldFNlcChiLCBjLCBzZXAsIHBvcywgZGVwKSkgcmV0dXJuO1xuICAgICAgdmFyIHBieCA9IGIucG9zaXRpb24ueDtcbiAgICAgIHZhciBwYnkgPSBiLnBvc2l0aW9uLnk7XG4gICAgICB2YXIgcGJ6ID0gYi5wb3NpdGlvbi56O1xuICAgICAgdmFyIHBjeCA9IGMucG9zaXRpb24ueDtcbiAgICAgIHZhciBwY3kgPSBjLnBvc2l0aW9uLnk7XG4gICAgICB2YXIgcGN6ID0gYy5wb3NpdGlvbi56O1xuICAgICAgdmFyIGJ3ID0gYi5oYWxmV2lkdGg7XG4gICAgICB2YXIgYmggPSBiLmhhbGZIZWlnaHQ7XG4gICAgICB2YXIgYmQgPSBiLmhhbGZEZXB0aDtcbiAgICAgIHZhciBjaCA9IGMuaGFsZkhlaWdodDtcbiAgICAgIHZhciByID0gYy5yYWRpdXM7XG5cbiAgICAgIHZhciBEID0gYi5kaW1lbnRpb25zO1xuXG4gICAgICB2YXIgbnd4ID0gRFswXTsvL2Iubm9ybWFsRGlyZWN0aW9uV2lkdGgueDtcbiAgICAgIHZhciBud3kgPSBEWzFdOy8vYi5ub3JtYWxEaXJlY3Rpb25XaWR0aC55O1xuICAgICAgdmFyIG53eiA9IERbMl07Ly9iLm5vcm1hbERpcmVjdGlvbldpZHRoLno7XG4gICAgICB2YXIgbmh4ID0gRFszXTsvL2Iubm9ybWFsRGlyZWN0aW9uSGVpZ2h0Lng7XG4gICAgICB2YXIgbmh5ID0gRFs0XTsvL2Iubm9ybWFsRGlyZWN0aW9uSGVpZ2h0Lnk7XG4gICAgICB2YXIgbmh6ID0gRFs1XTsvL2Iubm9ybWFsRGlyZWN0aW9uSGVpZ2h0Lno7XG4gICAgICB2YXIgbmR4ID0gRFs2XTsvL2Iubm9ybWFsRGlyZWN0aW9uRGVwdGgueDtcbiAgICAgIHZhciBuZHkgPSBEWzddOy8vYi5ub3JtYWxEaXJlY3Rpb25EZXB0aC55O1xuICAgICAgdmFyIG5keiA9IERbOF07Ly9iLm5vcm1hbERpcmVjdGlvbkRlcHRoLno7XG5cbiAgICAgIHZhciBkd3ggPSBEWzldOy8vYi5oYWxmRGlyZWN0aW9uV2lkdGgueDtcbiAgICAgIHZhciBkd3kgPSBEWzEwXTsvL2IuaGFsZkRpcmVjdGlvbldpZHRoLnk7XG4gICAgICB2YXIgZHd6ID0gRFsxMV07Ly9iLmhhbGZEaXJlY3Rpb25XaWR0aC56O1xuICAgICAgdmFyIGRoeCA9IERbMTJdOy8vYi5oYWxmRGlyZWN0aW9uSGVpZ2h0Lng7XG4gICAgICB2YXIgZGh5ID0gRFsxM107Ly9iLmhhbGZEaXJlY3Rpb25IZWlnaHQueTtcbiAgICAgIHZhciBkaHogPSBEWzE0XTsvL2IuaGFsZkRpcmVjdGlvbkhlaWdodC56O1xuICAgICAgdmFyIGRkeCA9IERbMTVdOy8vYi5oYWxmRGlyZWN0aW9uRGVwdGgueDtcbiAgICAgIHZhciBkZHkgPSBEWzE2XTsvL2IuaGFsZkRpcmVjdGlvbkRlcHRoLnk7XG4gICAgICB2YXIgZGR6ID0gRFsxN107Ly9iLmhhbGZEaXJlY3Rpb25EZXB0aC56O1xuXG4gICAgICB2YXIgbmN4ID0gYy5ub3JtYWxEaXJlY3Rpb24ueDtcbiAgICAgIHZhciBuY3kgPSBjLm5vcm1hbERpcmVjdGlvbi55O1xuICAgICAgdmFyIG5jeiA9IGMubm9ybWFsRGlyZWN0aW9uLno7XG4gICAgICB2YXIgZGN4ID0gYy5oYWxmRGlyZWN0aW9uLng7XG4gICAgICB2YXIgZGN5ID0gYy5oYWxmRGlyZWN0aW9uLnk7XG4gICAgICB2YXIgZGN6ID0gYy5oYWxmRGlyZWN0aW9uLno7XG4gICAgICB2YXIgbnggPSBzZXAueDtcbiAgICAgIHZhciBueSA9IHNlcC55O1xuICAgICAgdmFyIG56ID0gc2VwLno7XG4gICAgICB2YXIgZG90dyA9IG54ICogbnd4ICsgbnkgKiBud3kgKyBueiAqIG53ejtcbiAgICAgIHZhciBkb3RoID0gbnggKiBuaHggKyBueSAqIG5oeSArIG56ICogbmh6O1xuICAgICAgdmFyIGRvdGQgPSBueCAqIG5keCArIG55ICogbmR5ICsgbnogKiBuZHo7XG4gICAgICB2YXIgZG90YyA9IG54ICogbmN4ICsgbnkgKiBuY3kgKyBueiAqIG5jejtcbiAgICAgIHZhciByaWdodDEgPSBkb3R3ID4gMDtcbiAgICAgIHZhciByaWdodDIgPSBkb3RoID4gMDtcbiAgICAgIHZhciByaWdodDMgPSBkb3RkID4gMDtcbiAgICAgIHZhciByaWdodDQgPSBkb3RjID4gMDtcbiAgICAgIGlmICghcmlnaHQxKSBkb3R3ID0gLWRvdHc7XG4gICAgICBpZiAoIXJpZ2h0MikgZG90aCA9IC1kb3RoO1xuICAgICAgaWYgKCFyaWdodDMpIGRvdGQgPSAtZG90ZDtcbiAgICAgIGlmICghcmlnaHQ0KSBkb3RjID0gLWRvdGM7XG4gICAgICB2YXIgc3RhdGUgPSAwO1xuICAgICAgaWYgKGRvdGMgPiAwLjk5OSkge1xuICAgICAgICBpZiAoZG90dyA+IDAuOTk5KSB7XG4gICAgICAgICAgaWYgKGRvdHcgPiBkb3RjKSBzdGF0ZSA9IDE7XG4gICAgICAgICAgZWxzZSBzdGF0ZSA9IDQ7XG4gICAgICAgIH0gZWxzZSBpZiAoZG90aCA+IDAuOTk5KSB7XG4gICAgICAgICAgaWYgKGRvdGggPiBkb3RjKSBzdGF0ZSA9IDI7XG4gICAgICAgICAgZWxzZSBzdGF0ZSA9IDQ7XG4gICAgICAgIH0gZWxzZSBpZiAoZG90ZCA+IDAuOTk5KSB7XG4gICAgICAgICAgaWYgKGRvdGQgPiBkb3RjKSBzdGF0ZSA9IDM7XG4gICAgICAgICAgZWxzZSBzdGF0ZSA9IDQ7XG4gICAgICAgIH0gZWxzZSBzdGF0ZSA9IDQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoZG90dyA+IDAuOTk5KSBzdGF0ZSA9IDE7XG4gICAgICAgIGVsc2UgaWYgKGRvdGggPiAwLjk5OSkgc3RhdGUgPSAyO1xuICAgICAgICBlbHNlIGlmIChkb3RkID4gMC45OTkpIHN0YXRlID0gMztcbiAgICAgIH1cbiAgICAgIHZhciBjYng7XG4gICAgICB2YXIgY2J5O1xuICAgICAgdmFyIGNiejtcbiAgICAgIHZhciBjY3g7XG4gICAgICB2YXIgY2N5O1xuICAgICAgdmFyIGNjejtcbiAgICAgIHZhciByMDA7XG4gICAgICB2YXIgcjAxO1xuICAgICAgdmFyIHIwMjtcbiAgICAgIHZhciByMTA7XG4gICAgICB2YXIgcjExO1xuICAgICAgdmFyIHIxMjtcbiAgICAgIHZhciByMjA7XG4gICAgICB2YXIgcjIxO1xuICAgICAgdmFyIHIyMjtcbiAgICAgIHZhciBweDtcbiAgICAgIHZhciBweTtcbiAgICAgIHZhciBwejtcbiAgICAgIHZhciBwZDtcbiAgICAgIHZhciBkb3Q7XG4gICAgICB2YXIgbGVuO1xuICAgICAgdmFyIHR4O1xuICAgICAgdmFyIHR5O1xuICAgICAgdmFyIHR6O1xuICAgICAgdmFyIHRkO1xuICAgICAgdmFyIGR4O1xuICAgICAgdmFyIGR5O1xuICAgICAgdmFyIGR6O1xuICAgICAgdmFyIGQxeDtcbiAgICAgIHZhciBkMXk7XG4gICAgICB2YXIgZDF6O1xuICAgICAgdmFyIGQyeDtcbiAgICAgIHZhciBkMnk7XG4gICAgICB2YXIgZDJ6O1xuICAgICAgdmFyIHN4O1xuICAgICAgdmFyIHN5O1xuICAgICAgdmFyIHN6O1xuICAgICAgdmFyIHNkO1xuICAgICAgdmFyIGV4O1xuICAgICAgdmFyIGV5O1xuICAgICAgdmFyIGV6O1xuICAgICAgdmFyIGVkO1xuICAgICAgdmFyIGRvdDE7XG4gICAgICB2YXIgZG90MjtcbiAgICAgIHZhciB0MTtcbiAgICAgIHZhciBkaXIxeDtcbiAgICAgIHZhciBkaXIxeTtcbiAgICAgIHZhciBkaXIxejtcbiAgICAgIHZhciBkaXIyeDtcbiAgICAgIHZhciBkaXIyeTtcbiAgICAgIHZhciBkaXIyejtcbiAgICAgIHZhciBkaXIxbDtcbiAgICAgIHZhciBkaXIybDtcbiAgICAgIGlmIChzdGF0ZSA9PSAwKSB7XG4gICAgICAgIC8vbWFuaWZvbGQuYWRkUG9pbnQocG9zLngscG9zLnkscG9zLnosbngsbnksbnosZGVwLngsYixjLDAsMCxmYWxzZSk7XG4gICAgICAgIG1hbmlmb2xkLmFkZFBvaW50KHBvcy54LCBwb3MueSwgcG9zLnosIG54LCBueSwgbnosIGRlcC54LCB0aGlzLmZsaXApO1xuICAgICAgfSBlbHNlIGlmIChzdGF0ZSA9PSA0KSB7XG4gICAgICAgIGlmIChyaWdodDQpIHtcbiAgICAgICAgICBjY3ggPSBwY3ggLSBkY3g7XG4gICAgICAgICAgY2N5ID0gcGN5IC0gZGN5O1xuICAgICAgICAgIGNjeiA9IHBjeiAtIGRjejtcbiAgICAgICAgICBueCA9IC1uY3g7XG4gICAgICAgICAgbnkgPSAtbmN5O1xuICAgICAgICAgIG56ID0gLW5jejtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjY3ggPSBwY3ggKyBkY3g7XG4gICAgICAgICAgY2N5ID0gcGN5ICsgZGN5O1xuICAgICAgICAgIGNjeiA9IHBjeiArIGRjejtcbiAgICAgICAgICBueCA9IG5jeDtcbiAgICAgICAgICBueSA9IG5jeTtcbiAgICAgICAgICBueiA9IG5jejtcbiAgICAgICAgfVxuICAgICAgICB2YXIgdjF4O1xuICAgICAgICB2YXIgdjF5O1xuICAgICAgICB2YXIgdjF6O1xuICAgICAgICB2YXIgdjJ4O1xuICAgICAgICB2YXIgdjJ5O1xuICAgICAgICB2YXIgdjJ6O1xuICAgICAgICB2YXIgdjN4O1xuICAgICAgICB2YXIgdjN5O1xuICAgICAgICB2YXIgdjN6O1xuICAgICAgICB2YXIgdjR4O1xuICAgICAgICB2YXIgdjR5O1xuICAgICAgICB2YXIgdjR6O1xuXG4gICAgICAgIGRvdCA9IDE7XG4gICAgICAgIHN0YXRlID0gMDtcbiAgICAgICAgZG90MSA9IG53eCAqIG54ICsgbnd5ICogbnkgKyBud3ogKiBuejtcbiAgICAgICAgaWYgKGRvdDEgPCBkb3QpIHtcbiAgICAgICAgICBkb3QgPSBkb3QxO1xuICAgICAgICAgIHN0YXRlID0gMDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoLWRvdDEgPCBkb3QpIHtcbiAgICAgICAgICBkb3QgPSAtZG90MTtcbiAgICAgICAgICBzdGF0ZSA9IDE7XG4gICAgICAgIH1cbiAgICAgICAgZG90MSA9IG5oeCAqIG54ICsgbmh5ICogbnkgKyBuaHogKiBuejtcbiAgICAgICAgaWYgKGRvdDEgPCBkb3QpIHtcbiAgICAgICAgICBkb3QgPSBkb3QxO1xuICAgICAgICAgIHN0YXRlID0gMjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoLWRvdDEgPCBkb3QpIHtcbiAgICAgICAgICBkb3QgPSAtZG90MTtcbiAgICAgICAgICBzdGF0ZSA9IDM7XG4gICAgICAgIH1cbiAgICAgICAgZG90MSA9IG5keCAqIG54ICsgbmR5ICogbnkgKyBuZHogKiBuejtcbiAgICAgICAgaWYgKGRvdDEgPCBkb3QpIHtcbiAgICAgICAgICBkb3QgPSBkb3QxO1xuICAgICAgICAgIHN0YXRlID0gNDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoLWRvdDEgPCBkb3QpIHtcbiAgICAgICAgICBkb3QgPSAtZG90MTtcbiAgICAgICAgICBzdGF0ZSA9IDU7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHYgPSBiLmVsZW1lbnRzO1xuICAgICAgICBzd2l0Y2ggKHN0YXRlKSB7XG4gICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgLy92PWIudmVydGV4MTtcbiAgICAgICAgICAgIHYxeCA9IHZbMF07Ly92Lng7XG4gICAgICAgICAgICB2MXkgPSB2WzFdOy8vdi55O1xuICAgICAgICAgICAgdjF6ID0gdlsyXTsvL3YuejtcbiAgICAgICAgICAgIC8vdj1iLnZlcnRleDM7XG4gICAgICAgICAgICB2MnggPSB2WzZdOy8vdi54O1xuICAgICAgICAgICAgdjJ5ID0gdls3XTsvL3YueTtcbiAgICAgICAgICAgIHYyeiA9IHZbOF07Ly92Lno7XG4gICAgICAgICAgICAvL3Y9Yi52ZXJ0ZXg0O1xuICAgICAgICAgICAgdjN4ID0gdls5XTsvL3YueDtcbiAgICAgICAgICAgIHYzeSA9IHZbMTBdOy8vdi55O1xuICAgICAgICAgICAgdjN6ID0gdlsxMV07Ly92Lno7XG4gICAgICAgICAgICAvL3Y9Yi52ZXJ0ZXgyO1xuICAgICAgICAgICAgdjR4ID0gdlszXTsvL3YueDtcbiAgICAgICAgICAgIHY0eSA9IHZbNF07Ly92Lnk7XG4gICAgICAgICAgICB2NHogPSB2WzVdOy8vdi56O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgLy92PWIudmVydGV4NjtcbiAgICAgICAgICAgIHYxeCA9IHZbMTVdOy8vdi54O1xuICAgICAgICAgICAgdjF5ID0gdlsxNl07Ly92Lnk7XG4gICAgICAgICAgICB2MXogPSB2WzE3XTsvL3YuejtcbiAgICAgICAgICAgIC8vdj1iLnZlcnRleDg7XG4gICAgICAgICAgICB2MnggPSB2WzIxXTsvL3YueDtcbiAgICAgICAgICAgIHYyeSA9IHZbMjJdOy8vdi55O1xuICAgICAgICAgICAgdjJ6ID0gdlsyM107Ly92Lno7XG4gICAgICAgICAgICAvL3Y9Yi52ZXJ0ZXg3O1xuICAgICAgICAgICAgdjN4ID0gdlsxOF07Ly92Lng7XG4gICAgICAgICAgICB2M3kgPSB2WzE5XTsvL3YueTtcbiAgICAgICAgICAgIHYzeiA9IHZbMjBdOy8vdi56O1xuICAgICAgICAgICAgLy92PWIudmVydGV4NTtcbiAgICAgICAgICAgIHY0eCA9IHZbMTJdOy8vdi54O1xuICAgICAgICAgICAgdjR5ID0gdlsxM107Ly92Lnk7XG4gICAgICAgICAgICB2NHogPSB2WzE0XTsvL3YuejtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIC8vdj1iLnZlcnRleDU7XG4gICAgICAgICAgICB2MXggPSB2WzEyXTsvL3YueDtcbiAgICAgICAgICAgIHYxeSA9IHZbMTNdOy8vdi55O1xuICAgICAgICAgICAgdjF6ID0gdlsxNF07Ly92Lno7XG4gICAgICAgICAgICAvL3Y9Yi52ZXJ0ZXgxO1xuICAgICAgICAgICAgdjJ4ID0gdlswXTsvL3YueDtcbiAgICAgICAgICAgIHYyeSA9IHZbMV07Ly92Lnk7XG4gICAgICAgICAgICB2MnogPSB2WzJdOy8vdi56O1xuICAgICAgICAgICAgLy92PWIudmVydGV4MjtcbiAgICAgICAgICAgIHYzeCA9IHZbM107Ly92Lng7XG4gICAgICAgICAgICB2M3kgPSB2WzRdOy8vdi55O1xuICAgICAgICAgICAgdjN6ID0gdls1XTsvL3YuejtcbiAgICAgICAgICAgIC8vdj1iLnZlcnRleDY7XG4gICAgICAgICAgICB2NHggPSB2WzE1XTsvL3YueDtcbiAgICAgICAgICAgIHY0eSA9IHZbMTZdOy8vdi55O1xuICAgICAgICAgICAgdjR6ID0gdlsxN107Ly92Lno7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICAvL3Y9Yi52ZXJ0ZXg4O1xuICAgICAgICAgICAgdjF4ID0gdlsyMV07Ly92Lng7XG4gICAgICAgICAgICB2MXkgPSB2WzIyXTsvL3YueTtcbiAgICAgICAgICAgIHYxeiA9IHZbMjNdOy8vdi56O1xuICAgICAgICAgICAgLy92PWIudmVydGV4NDtcbiAgICAgICAgICAgIHYyeCA9IHZbOV07Ly92Lng7XG4gICAgICAgICAgICB2MnkgPSB2WzEwXTsvL3YueTtcbiAgICAgICAgICAgIHYyeiA9IHZbMTFdOy8vdi56O1xuICAgICAgICAgICAgLy92PWIudmVydGV4MztcbiAgICAgICAgICAgIHYzeCA9IHZbNl07Ly92Lng7XG4gICAgICAgICAgICB2M3kgPSB2WzddOy8vdi55O1xuICAgICAgICAgICAgdjN6ID0gdls4XTsvL3YuejtcbiAgICAgICAgICAgIC8vdj1iLnZlcnRleDc7XG4gICAgICAgICAgICB2NHggPSB2WzE4XTsvL3YueDtcbiAgICAgICAgICAgIHY0eSA9IHZbMTldOy8vdi55O1xuICAgICAgICAgICAgdjR6ID0gdlsyMF07Ly92Lno7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICAvL3Y9Yi52ZXJ0ZXg1O1xuICAgICAgICAgICAgdjF4ID0gdlsxMl07Ly92Lng7XG4gICAgICAgICAgICB2MXkgPSB2WzEzXTsvL3YueTtcbiAgICAgICAgICAgIHYxeiA9IHZbMTRdOy8vdi56O1xuICAgICAgICAgICAgLy92PWIudmVydGV4NztcbiAgICAgICAgICAgIHYyeCA9IHZbMThdOy8vdi54O1xuICAgICAgICAgICAgdjJ5ID0gdlsxOV07Ly92Lnk7XG4gICAgICAgICAgICB2MnogPSB2WzIwXTsvL3YuejtcbiAgICAgICAgICAgIC8vdj1iLnZlcnRleDM7XG4gICAgICAgICAgICB2M3ggPSB2WzZdOy8vdi54O1xuICAgICAgICAgICAgdjN5ID0gdls3XTsvL3YueTtcbiAgICAgICAgICAgIHYzeiA9IHZbOF07Ly92Lno7XG4gICAgICAgICAgICAvL3Y9Yi52ZXJ0ZXgxO1xuICAgICAgICAgICAgdjR4ID0gdlswXTsvL3YueDtcbiAgICAgICAgICAgIHY0eSA9IHZbMV07Ly92Lnk7XG4gICAgICAgICAgICB2NHogPSB2WzJdOy8vdi56O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA1OlxuICAgICAgICAgICAgLy92PWIudmVydGV4MjtcbiAgICAgICAgICAgIHYxeCA9IHZbM107Ly92Lng7XG4gICAgICAgICAgICB2MXkgPSB2WzRdOy8vdi55O1xuICAgICAgICAgICAgdjF6ID0gdls1XTsvL3YuejtcbiAgICAgICAgICAgIC8vdj1iLnZlcnRleDQ7XG4gICAgICAgICAgICB2MnggPSB2WzldOy8vdi54O1xuICAgICAgICAgICAgdjJ5ID0gdlsxMF07Ly92Lnk7XG4gICAgICAgICAgICB2MnogPSB2WzExXTsvL3YuejtcbiAgICAgICAgICAgIC8vdj1iLnZlcnRleDg7XG4gICAgICAgICAgICB2M3ggPSB2WzIxXTsvL3YueDtcbiAgICAgICAgICAgIHYzeSA9IHZbMjJdOy8vdi55O1xuICAgICAgICAgICAgdjN6ID0gdlsyM107Ly92Lno7XG4gICAgICAgICAgICAvL3Y9Yi52ZXJ0ZXg2O1xuICAgICAgICAgICAgdjR4ID0gdlsxNV07Ly92Lng7XG4gICAgICAgICAgICB2NHkgPSB2WzE2XTsvL3YueTtcbiAgICAgICAgICAgIHY0eiA9IHZbMTddOy8vdi56O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgcGQgPSBueCAqICh2MXggLSBjY3gpICsgbnkgKiAodjF5IC0gY2N5KSArIG56ICogKHYxeiAtIGNjeik7XG4gICAgICAgIGlmIChwZCA8PSAwKSBtYW5pZm9sZC5hZGRQb2ludCh2MXgsIHYxeSwgdjF6LCAtbngsIC1ueSwgLW56LCBwZCwgdGhpcy5mbGlwKTtcbiAgICAgICAgcGQgPSBueCAqICh2MnggLSBjY3gpICsgbnkgKiAodjJ5IC0gY2N5KSArIG56ICogKHYyeiAtIGNjeik7XG4gICAgICAgIGlmIChwZCA8PSAwKSBtYW5pZm9sZC5hZGRQb2ludCh2MngsIHYyeSwgdjJ6LCAtbngsIC1ueSwgLW56LCBwZCwgdGhpcy5mbGlwKTtcbiAgICAgICAgcGQgPSBueCAqICh2M3ggLSBjY3gpICsgbnkgKiAodjN5IC0gY2N5KSArIG56ICogKHYzeiAtIGNjeik7XG4gICAgICAgIGlmIChwZCA8PSAwKSBtYW5pZm9sZC5hZGRQb2ludCh2M3gsIHYzeSwgdjN6LCAtbngsIC1ueSwgLW56LCBwZCwgdGhpcy5mbGlwKTtcbiAgICAgICAgcGQgPSBueCAqICh2NHggLSBjY3gpICsgbnkgKiAodjR5IC0gY2N5KSArIG56ICogKHY0eiAtIGNjeik7XG4gICAgICAgIGlmIChwZCA8PSAwKSBtYW5pZm9sZC5hZGRQb2ludCh2NHgsIHY0eSwgdjR6LCAtbngsIC1ueSwgLW56LCBwZCwgdGhpcy5mbGlwKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHN3aXRjaCAoc3RhdGUpIHtcbiAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICBpZiAocmlnaHQxKSB7XG4gICAgICAgICAgICAgIGNieCA9IHBieCArIGR3eDtcbiAgICAgICAgICAgICAgY2J5ID0gcGJ5ICsgZHd5O1xuICAgICAgICAgICAgICBjYnogPSBwYnogKyBkd3o7XG4gICAgICAgICAgICAgIG54ID0gbnd4O1xuICAgICAgICAgICAgICBueSA9IG53eTtcbiAgICAgICAgICAgICAgbnogPSBud3o7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBjYnggPSBwYnggLSBkd3g7XG4gICAgICAgICAgICAgIGNieSA9IHBieSAtIGR3eTtcbiAgICAgICAgICAgICAgY2J6ID0gcGJ6IC0gZHd6O1xuICAgICAgICAgICAgICBueCA9IC1ud3g7XG4gICAgICAgICAgICAgIG55ID0gLW53eTtcbiAgICAgICAgICAgICAgbnogPSAtbnd6O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGlyMXggPSBuaHg7XG4gICAgICAgICAgICBkaXIxeSA9IG5oeTtcbiAgICAgICAgICAgIGRpcjF6ID0gbmh6O1xuICAgICAgICAgICAgZGlyMWwgPSBiaDtcbiAgICAgICAgICAgIGRpcjJ4ID0gbmR4O1xuICAgICAgICAgICAgZGlyMnkgPSBuZHk7XG4gICAgICAgICAgICBkaXIyeiA9IG5kejtcbiAgICAgICAgICAgIGRpcjJsID0gYmQ7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICBpZiAocmlnaHQyKSB7XG4gICAgICAgICAgICAgIGNieCA9IHBieCArIGRoeDtcbiAgICAgICAgICAgICAgY2J5ID0gcGJ5ICsgZGh5O1xuICAgICAgICAgICAgICBjYnogPSBwYnogKyBkaHo7XG4gICAgICAgICAgICAgIG54ID0gbmh4O1xuICAgICAgICAgICAgICBueSA9IG5oeTtcbiAgICAgICAgICAgICAgbnogPSBuaHo7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBjYnggPSBwYnggLSBkaHg7XG4gICAgICAgICAgICAgIGNieSA9IHBieSAtIGRoeTtcbiAgICAgICAgICAgICAgY2J6ID0gcGJ6IC0gZGh6O1xuICAgICAgICAgICAgICBueCA9IC1uaHg7XG4gICAgICAgICAgICAgIG55ID0gLW5oeTtcbiAgICAgICAgICAgICAgbnogPSAtbmh6O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGlyMXggPSBud3g7XG4gICAgICAgICAgICBkaXIxeSA9IG53eTtcbiAgICAgICAgICAgIGRpcjF6ID0gbnd6O1xuICAgICAgICAgICAgZGlyMWwgPSBidztcbiAgICAgICAgICAgIGRpcjJ4ID0gbmR4O1xuICAgICAgICAgICAgZGlyMnkgPSBuZHk7XG4gICAgICAgICAgICBkaXIyeiA9IG5kejtcbiAgICAgICAgICAgIGRpcjJsID0gYmQ7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICBpZiAocmlnaHQzKSB7XG4gICAgICAgICAgICAgIGNieCA9IHBieCArIGRkeDtcbiAgICAgICAgICAgICAgY2J5ID0gcGJ5ICsgZGR5O1xuICAgICAgICAgICAgICBjYnogPSBwYnogKyBkZHo7XG4gICAgICAgICAgICAgIG54ID0gbmR4O1xuICAgICAgICAgICAgICBueSA9IG5keTtcbiAgICAgICAgICAgICAgbnogPSBuZHo7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBjYnggPSBwYnggLSBkZHg7XG4gICAgICAgICAgICAgIGNieSA9IHBieSAtIGRkeTtcbiAgICAgICAgICAgICAgY2J6ID0gcGJ6IC0gZGR6O1xuICAgICAgICAgICAgICBueCA9IC1uZHg7XG4gICAgICAgICAgICAgIG55ID0gLW5keTtcbiAgICAgICAgICAgICAgbnogPSAtbmR6O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGlyMXggPSBud3g7XG4gICAgICAgICAgICBkaXIxeSA9IG53eTtcbiAgICAgICAgICAgIGRpcjF6ID0gbnd6O1xuICAgICAgICAgICAgZGlyMWwgPSBidztcbiAgICAgICAgICAgIGRpcjJ4ID0gbmh4O1xuICAgICAgICAgICAgZGlyMnkgPSBuaHk7XG4gICAgICAgICAgICBkaXIyeiA9IG5oejtcbiAgICAgICAgICAgIGRpcjJsID0gYmg7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBkb3QgPSBueCAqIG5jeCArIG55ICogbmN5ICsgbnogKiBuY3o7XG4gICAgICAgIGlmIChkb3QgPCAwKSBsZW4gPSBjaDtcbiAgICAgICAgZWxzZSBsZW4gPSAtY2g7XG4gICAgICAgIGNjeCA9IHBjeCArIGxlbiAqIG5jeDtcbiAgICAgICAgY2N5ID0gcGN5ICsgbGVuICogbmN5O1xuICAgICAgICBjY3ogPSBwY3ogKyBsZW4gKiBuY3o7XG4gICAgICAgIGlmIChkb3RjID49IDAuOTk5OTk5KSB7XG4gICAgICAgICAgdHggPSAtbnk7XG4gICAgICAgICAgdHkgPSBuejtcbiAgICAgICAgICB0eiA9IG54O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHR4ID0gbng7XG4gICAgICAgICAgdHkgPSBueTtcbiAgICAgICAgICB0eiA9IG56O1xuICAgICAgICB9XG4gICAgICAgIGxlbiA9IHR4ICogbmN4ICsgdHkgKiBuY3kgKyB0eiAqIG5jejtcbiAgICAgICAgZHggPSBsZW4gKiBuY3ggLSB0eDtcbiAgICAgICAgZHkgPSBsZW4gKiBuY3kgLSB0eTtcbiAgICAgICAgZHogPSBsZW4gKiBuY3ogLSB0ejtcbiAgICAgICAgbGVuID0gX01hdGguc3FydChkeCAqIGR4ICsgZHkgKiBkeSArIGR6ICogZHopO1xuICAgICAgICBpZiAobGVuID09IDApIHJldHVybjtcbiAgICAgICAgbGVuID0gciAvIGxlbjtcbiAgICAgICAgZHggKj0gbGVuO1xuICAgICAgICBkeSAqPSBsZW47XG4gICAgICAgIGR6ICo9IGxlbjtcbiAgICAgICAgdHggPSBjY3ggKyBkeDtcbiAgICAgICAgdHkgPSBjY3kgKyBkeTtcbiAgICAgICAgdHogPSBjY3ogKyBkejtcbiAgICAgICAgaWYgKGRvdCA8IC0wLjk2IHx8IGRvdCA+IDAuOTYpIHtcbiAgICAgICAgICByMDAgPSBuY3ggKiBuY3ggKiAxLjUgLSAwLjU7XG4gICAgICAgICAgcjAxID0gbmN4ICogbmN5ICogMS41IC0gbmN6ICogMC44NjYwMjU0MDM7XG4gICAgICAgICAgcjAyID0gbmN4ICogbmN6ICogMS41ICsgbmN5ICogMC44NjYwMjU0MDM7XG4gICAgICAgICAgcjEwID0gbmN5ICogbmN4ICogMS41ICsgbmN6ICogMC44NjYwMjU0MDM7XG4gICAgICAgICAgcjExID0gbmN5ICogbmN5ICogMS41IC0gMC41O1xuICAgICAgICAgIHIxMiA9IG5jeSAqIG5jeiAqIDEuNSAtIG5jeCAqIDAuODY2MDI1NDAzO1xuICAgICAgICAgIHIyMCA9IG5jeiAqIG5jeCAqIDEuNSAtIG5jeSAqIDAuODY2MDI1NDAzO1xuICAgICAgICAgIHIyMSA9IG5jeiAqIG5jeSAqIDEuNSArIG5jeCAqIDAuODY2MDI1NDAzO1xuICAgICAgICAgIHIyMiA9IG5jeiAqIG5jeiAqIDEuNSAtIDAuNTtcbiAgICAgICAgICBweCA9IHR4O1xuICAgICAgICAgIHB5ID0gdHk7XG4gICAgICAgICAgcHogPSB0ejtcbiAgICAgICAgICBwZCA9IG54ICogKHB4IC0gY2J4KSArIG55ICogKHB5IC0gY2J5KSArIG56ICogKHB6IC0gY2J6KTtcbiAgICAgICAgICB0eCA9IHB4IC0gcGQgKiBueCAtIGNieDtcbiAgICAgICAgICB0eSA9IHB5IC0gcGQgKiBueSAtIGNieTtcbiAgICAgICAgICB0eiA9IHB6IC0gcGQgKiBueiAtIGNiejtcbiAgICAgICAgICBzZCA9IGRpcjF4ICogdHggKyBkaXIxeSAqIHR5ICsgZGlyMXogKiB0ejtcbiAgICAgICAgICBlZCA9IGRpcjJ4ICogdHggKyBkaXIyeSAqIHR5ICsgZGlyMnogKiB0ejtcbiAgICAgICAgICBpZiAoc2QgPCAtZGlyMWwpIHNkID0gLWRpcjFsO1xuICAgICAgICAgIGVsc2UgaWYgKHNkID4gZGlyMWwpIHNkID0gZGlyMWw7XG4gICAgICAgICAgaWYgKGVkIDwgLWRpcjJsKSBlZCA9IC1kaXIybDtcbiAgICAgICAgICBlbHNlIGlmIChlZCA+IGRpcjJsKSBlZCA9IGRpcjJsO1xuICAgICAgICAgIHR4ID0gc2QgKiBkaXIxeCArIGVkICogZGlyMng7XG4gICAgICAgICAgdHkgPSBzZCAqIGRpcjF5ICsgZWQgKiBkaXIyeTtcbiAgICAgICAgICB0eiA9IHNkICogZGlyMXogKyBlZCAqIGRpcjJ6O1xuICAgICAgICAgIHB4ID0gY2J4ICsgdHg7XG4gICAgICAgICAgcHkgPSBjYnkgKyB0eTtcbiAgICAgICAgICBweiA9IGNieiArIHR6O1xuICAgICAgICAgIG1hbmlmb2xkLmFkZFBvaW50KHB4LCBweSwgcHosIG54LCBueSwgbnosIHBkLCB0aGlzLmZsaXApO1xuICAgICAgICAgIHB4ID0gZHggKiByMDAgKyBkeSAqIHIwMSArIGR6ICogcjAyO1xuICAgICAgICAgIHB5ID0gZHggKiByMTAgKyBkeSAqIHIxMSArIGR6ICogcjEyO1xuICAgICAgICAgIHB6ID0gZHggKiByMjAgKyBkeSAqIHIyMSArIGR6ICogcjIyO1xuICAgICAgICAgIHB4ID0gKGR4ID0gcHgpICsgY2N4O1xuICAgICAgICAgIHB5ID0gKGR5ID0gcHkpICsgY2N5O1xuICAgICAgICAgIHB6ID0gKGR6ID0gcHopICsgY2N6O1xuICAgICAgICAgIHBkID0gbnggKiAocHggLSBjYngpICsgbnkgKiAocHkgLSBjYnkpICsgbnogKiAocHogLSBjYnopO1xuICAgICAgICAgIGlmIChwZCA8PSAwKSB7XG4gICAgICAgICAgICB0eCA9IHB4IC0gcGQgKiBueCAtIGNieDtcbiAgICAgICAgICAgIHR5ID0gcHkgLSBwZCAqIG55IC0gY2J5O1xuICAgICAgICAgICAgdHogPSBweiAtIHBkICogbnogLSBjYno7XG4gICAgICAgICAgICBzZCA9IGRpcjF4ICogdHggKyBkaXIxeSAqIHR5ICsgZGlyMXogKiB0ejtcbiAgICAgICAgICAgIGVkID0gZGlyMnggKiB0eCArIGRpcjJ5ICogdHkgKyBkaXIyeiAqIHR6O1xuICAgICAgICAgICAgaWYgKHNkIDwgLWRpcjFsKSBzZCA9IC1kaXIxbDtcbiAgICAgICAgICAgIGVsc2UgaWYgKHNkID4gZGlyMWwpIHNkID0gZGlyMWw7XG4gICAgICAgICAgICBpZiAoZWQgPCAtZGlyMmwpIGVkID0gLWRpcjJsO1xuICAgICAgICAgICAgZWxzZSBpZiAoZWQgPiBkaXIybCkgZWQgPSBkaXIybDtcbiAgICAgICAgICAgIHR4ID0gc2QgKiBkaXIxeCArIGVkICogZGlyMng7XG4gICAgICAgICAgICB0eSA9IHNkICogZGlyMXkgKyBlZCAqIGRpcjJ5O1xuICAgICAgICAgICAgdHogPSBzZCAqIGRpcjF6ICsgZWQgKiBkaXIyejtcbiAgICAgICAgICAgIHB4ID0gY2J4ICsgdHg7XG4gICAgICAgICAgICBweSA9IGNieSArIHR5O1xuICAgICAgICAgICAgcHogPSBjYnogKyB0ejtcbiAgICAgICAgICAgIC8vbWFuaWZvbGQuYWRkUG9pbnQocHgscHkscHosbngsbnksbnoscGQsYixjLDIsMCxmYWxzZSk7XG4gICAgICAgICAgICBtYW5pZm9sZC5hZGRQb2ludChweCwgcHksIHB6LCBueCwgbnksIG56LCBwZCwgdGhpcy5mbGlwKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcHggPSBkeCAqIHIwMCArIGR5ICogcjAxICsgZHogKiByMDI7XG4gICAgICAgICAgcHkgPSBkeCAqIHIxMCArIGR5ICogcjExICsgZHogKiByMTI7XG4gICAgICAgICAgcHogPSBkeCAqIHIyMCArIGR5ICogcjIxICsgZHogKiByMjI7XG4gICAgICAgICAgcHggPSAoZHggPSBweCkgKyBjY3g7XG4gICAgICAgICAgcHkgPSAoZHkgPSBweSkgKyBjY3k7XG4gICAgICAgICAgcHogPSAoZHogPSBweikgKyBjY3o7XG4gICAgICAgICAgcGQgPSBueCAqIChweCAtIGNieCkgKyBueSAqIChweSAtIGNieSkgKyBueiAqIChweiAtIGNieik7XG4gICAgICAgICAgaWYgKHBkIDw9IDApIHtcbiAgICAgICAgICAgIHR4ID0gcHggLSBwZCAqIG54IC0gY2J4O1xuICAgICAgICAgICAgdHkgPSBweSAtIHBkICogbnkgLSBjYnk7XG4gICAgICAgICAgICB0eiA9IHB6IC0gcGQgKiBueiAtIGNiejtcbiAgICAgICAgICAgIHNkID0gZGlyMXggKiB0eCArIGRpcjF5ICogdHkgKyBkaXIxeiAqIHR6O1xuICAgICAgICAgICAgZWQgPSBkaXIyeCAqIHR4ICsgZGlyMnkgKiB0eSArIGRpcjJ6ICogdHo7XG4gICAgICAgICAgICBpZiAoc2QgPCAtZGlyMWwpIHNkID0gLWRpcjFsO1xuICAgICAgICAgICAgZWxzZSBpZiAoc2QgPiBkaXIxbCkgc2QgPSBkaXIxbDtcbiAgICAgICAgICAgIGlmIChlZCA8IC1kaXIybCkgZWQgPSAtZGlyMmw7XG4gICAgICAgICAgICBlbHNlIGlmIChlZCA+IGRpcjJsKSBlZCA9IGRpcjJsO1xuICAgICAgICAgICAgdHggPSBzZCAqIGRpcjF4ICsgZWQgKiBkaXIyeDtcbiAgICAgICAgICAgIHR5ID0gc2QgKiBkaXIxeSArIGVkICogZGlyMnk7XG4gICAgICAgICAgICB0eiA9IHNkICogZGlyMXogKyBlZCAqIGRpcjJ6O1xuICAgICAgICAgICAgcHggPSBjYnggKyB0eDtcbiAgICAgICAgICAgIHB5ID0gY2J5ICsgdHk7XG4gICAgICAgICAgICBweiA9IGNieiArIHR6O1xuICAgICAgICAgICAgLy9tYW5pZm9sZC5hZGRQb2ludChweCxweSxweixueCxueSxueixwZCxiLGMsMywwLGZhbHNlKTtcbiAgICAgICAgICAgIG1hbmlmb2xkLmFkZFBvaW50KHB4LCBweSwgcHosIG54LCBueSwgbnosIHBkLCB0aGlzLmZsaXApO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzeCA9IHR4O1xuICAgICAgICAgIHN5ID0gdHk7XG4gICAgICAgICAgc3ogPSB0ejtcbiAgICAgICAgICBzZCA9IG54ICogKHN4IC0gY2J4KSArIG55ICogKHN5IC0gY2J5KSArIG56ICogKHN6IC0gY2J6KTtcbiAgICAgICAgICBzeCAtPSBzZCAqIG54O1xuICAgICAgICAgIHN5IC09IHNkICogbnk7XG4gICAgICAgICAgc3ogLT0gc2QgKiBuejtcbiAgICAgICAgICBpZiAoZG90ID4gMCkge1xuICAgICAgICAgICAgZXggPSB0eCArIGRjeCAqIDI7XG4gICAgICAgICAgICBleSA9IHR5ICsgZGN5ICogMjtcbiAgICAgICAgICAgIGV6ID0gdHogKyBkY3ogKiAyO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBleCA9IHR4IC0gZGN4ICogMjtcbiAgICAgICAgICAgIGV5ID0gdHkgLSBkY3kgKiAyO1xuICAgICAgICAgICAgZXogPSB0eiAtIGRjeiAqIDI7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVkID0gbnggKiAoZXggLSBjYngpICsgbnkgKiAoZXkgLSBjYnkpICsgbnogKiAoZXogLSBjYnopO1xuICAgICAgICAgIGV4IC09IGVkICogbng7XG4gICAgICAgICAgZXkgLT0gZWQgKiBueTtcbiAgICAgICAgICBleiAtPSBlZCAqIG56O1xuICAgICAgICAgIGQxeCA9IHN4IC0gY2J4O1xuICAgICAgICAgIGQxeSA9IHN5IC0gY2J5O1xuICAgICAgICAgIGQxeiA9IHN6IC0gY2J6O1xuICAgICAgICAgIGQyeCA9IGV4IC0gY2J4O1xuICAgICAgICAgIGQyeSA9IGV5IC0gY2J5O1xuICAgICAgICAgIGQyeiA9IGV6IC0gY2J6O1xuICAgICAgICAgIHR4ID0gZXggLSBzeDtcbiAgICAgICAgICB0eSA9IGV5IC0gc3k7XG4gICAgICAgICAgdHogPSBleiAtIHN6O1xuICAgICAgICAgIHRkID0gZWQgLSBzZDtcbiAgICAgICAgICBkb3R3ID0gZDF4ICogZGlyMXggKyBkMXkgKiBkaXIxeSArIGQxeiAqIGRpcjF6O1xuICAgICAgICAgIGRvdGggPSBkMnggKiBkaXIxeCArIGQyeSAqIGRpcjF5ICsgZDJ6ICogZGlyMXo7XG4gICAgICAgICAgZG90MSA9IGRvdHcgLSBkaXIxbDtcbiAgICAgICAgICBkb3QyID0gZG90aCAtIGRpcjFsO1xuICAgICAgICAgIGlmIChkb3QxID4gMCkge1xuICAgICAgICAgICAgaWYgKGRvdDIgPiAwKSByZXR1cm47XG4gICAgICAgICAgICB0MSA9IGRvdDEgLyAoZG90MSAtIGRvdDIpO1xuICAgICAgICAgICAgc3ggPSBzeCArIHR4ICogdDE7XG4gICAgICAgICAgICBzeSA9IHN5ICsgdHkgKiB0MTtcbiAgICAgICAgICAgIHN6ID0gc3ogKyB0eiAqIHQxO1xuICAgICAgICAgICAgc2QgPSBzZCArIHRkICogdDE7XG4gICAgICAgICAgICBkMXggPSBzeCAtIGNieDtcbiAgICAgICAgICAgIGQxeSA9IHN5IC0gY2J5O1xuICAgICAgICAgICAgZDF6ID0gc3ogLSBjYno7XG4gICAgICAgICAgICBkb3R3ID0gZDF4ICogZGlyMXggKyBkMXkgKiBkaXIxeSArIGQxeiAqIGRpcjF6O1xuICAgICAgICAgICAgdHggPSBleCAtIHN4O1xuICAgICAgICAgICAgdHkgPSBleSAtIHN5O1xuICAgICAgICAgICAgdHogPSBleiAtIHN6O1xuICAgICAgICAgICAgdGQgPSBlZCAtIHNkO1xuICAgICAgICAgIH0gZWxzZSBpZiAoZG90MiA+IDApIHtcbiAgICAgICAgICAgIHQxID0gZG90MSAvIChkb3QxIC0gZG90Mik7XG4gICAgICAgICAgICBleCA9IHN4ICsgdHggKiB0MTtcbiAgICAgICAgICAgIGV5ID0gc3kgKyB0eSAqIHQxO1xuICAgICAgICAgICAgZXogPSBzeiArIHR6ICogdDE7XG4gICAgICAgICAgICBlZCA9IHNkICsgdGQgKiB0MTtcbiAgICAgICAgICAgIGQyeCA9IGV4IC0gY2J4O1xuICAgICAgICAgICAgZDJ5ID0gZXkgLSBjYnk7XG4gICAgICAgICAgICBkMnogPSBleiAtIGNiejtcbiAgICAgICAgICAgIGRvdGggPSBkMnggKiBkaXIxeCArIGQyeSAqIGRpcjF5ICsgZDJ6ICogZGlyMXo7XG4gICAgICAgICAgICB0eCA9IGV4IC0gc3g7XG4gICAgICAgICAgICB0eSA9IGV5IC0gc3k7XG4gICAgICAgICAgICB0eiA9IGV6IC0gc3o7XG4gICAgICAgICAgICB0ZCA9IGVkIC0gc2Q7XG4gICAgICAgICAgfVxuICAgICAgICAgIGRvdDEgPSBkb3R3ICsgZGlyMWw7XG4gICAgICAgICAgZG90MiA9IGRvdGggKyBkaXIxbDtcbiAgICAgICAgICBpZiAoZG90MSA8IDApIHtcbiAgICAgICAgICAgIGlmIChkb3QyIDwgMCkgcmV0dXJuO1xuICAgICAgICAgICAgdDEgPSBkb3QxIC8gKGRvdDEgLSBkb3QyKTtcbiAgICAgICAgICAgIHN4ID0gc3ggKyB0eCAqIHQxO1xuICAgICAgICAgICAgc3kgPSBzeSArIHR5ICogdDE7XG4gICAgICAgICAgICBzeiA9IHN6ICsgdHogKiB0MTtcbiAgICAgICAgICAgIHNkID0gc2QgKyB0ZCAqIHQxO1xuICAgICAgICAgICAgZDF4ID0gc3ggLSBjYng7XG4gICAgICAgICAgICBkMXkgPSBzeSAtIGNieTtcbiAgICAgICAgICAgIGQxeiA9IHN6IC0gY2J6O1xuICAgICAgICAgICAgdHggPSBleCAtIHN4O1xuICAgICAgICAgICAgdHkgPSBleSAtIHN5O1xuICAgICAgICAgICAgdHogPSBleiAtIHN6O1xuICAgICAgICAgICAgdGQgPSBlZCAtIHNkO1xuICAgICAgICAgIH0gZWxzZSBpZiAoZG90MiA8IDApIHtcbiAgICAgICAgICAgIHQxID0gZG90MSAvIChkb3QxIC0gZG90Mik7XG4gICAgICAgICAgICBleCA9IHN4ICsgdHggKiB0MTtcbiAgICAgICAgICAgIGV5ID0gc3kgKyB0eSAqIHQxO1xuICAgICAgICAgICAgZXogPSBzeiArIHR6ICogdDE7XG4gICAgICAgICAgICBlZCA9IHNkICsgdGQgKiB0MTtcbiAgICAgICAgICAgIGQyeCA9IGV4IC0gY2J4O1xuICAgICAgICAgICAgZDJ5ID0gZXkgLSBjYnk7XG4gICAgICAgICAgICBkMnogPSBleiAtIGNiejtcbiAgICAgICAgICAgIHR4ID0gZXggLSBzeDtcbiAgICAgICAgICAgIHR5ID0gZXkgLSBzeTtcbiAgICAgICAgICAgIHR6ID0gZXogLSBzejtcbiAgICAgICAgICAgIHRkID0gZWQgLSBzZDtcbiAgICAgICAgICB9XG4gICAgICAgICAgZG90dyA9IGQxeCAqIGRpcjJ4ICsgZDF5ICogZGlyMnkgKyBkMXogKiBkaXIyejtcbiAgICAgICAgICBkb3RoID0gZDJ4ICogZGlyMnggKyBkMnkgKiBkaXIyeSArIGQyeiAqIGRpcjJ6O1xuICAgICAgICAgIGRvdDEgPSBkb3R3IC0gZGlyMmw7XG4gICAgICAgICAgZG90MiA9IGRvdGggLSBkaXIybDtcbiAgICAgICAgICBpZiAoZG90MSA+IDApIHtcbiAgICAgICAgICAgIGlmIChkb3QyID4gMCkgcmV0dXJuO1xuICAgICAgICAgICAgdDEgPSBkb3QxIC8gKGRvdDEgLSBkb3QyKTtcbiAgICAgICAgICAgIHN4ID0gc3ggKyB0eCAqIHQxO1xuICAgICAgICAgICAgc3kgPSBzeSArIHR5ICogdDE7XG4gICAgICAgICAgICBzeiA9IHN6ICsgdHogKiB0MTtcbiAgICAgICAgICAgIHNkID0gc2QgKyB0ZCAqIHQxO1xuICAgICAgICAgICAgZDF4ID0gc3ggLSBjYng7XG4gICAgICAgICAgICBkMXkgPSBzeSAtIGNieTtcbiAgICAgICAgICAgIGQxeiA9IHN6IC0gY2J6O1xuICAgICAgICAgICAgZG90dyA9IGQxeCAqIGRpcjJ4ICsgZDF5ICogZGlyMnkgKyBkMXogKiBkaXIyejtcbiAgICAgICAgICAgIHR4ID0gZXggLSBzeDtcbiAgICAgICAgICAgIHR5ID0gZXkgLSBzeTtcbiAgICAgICAgICAgIHR6ID0gZXogLSBzejtcbiAgICAgICAgICAgIHRkID0gZWQgLSBzZDtcbiAgICAgICAgICB9IGVsc2UgaWYgKGRvdDIgPiAwKSB7XG4gICAgICAgICAgICB0MSA9IGRvdDEgLyAoZG90MSAtIGRvdDIpO1xuICAgICAgICAgICAgZXggPSBzeCArIHR4ICogdDE7XG4gICAgICAgICAgICBleSA9IHN5ICsgdHkgKiB0MTtcbiAgICAgICAgICAgIGV6ID0gc3ogKyB0eiAqIHQxO1xuICAgICAgICAgICAgZWQgPSBzZCArIHRkICogdDE7XG4gICAgICAgICAgICBkMnggPSBleCAtIGNieDtcbiAgICAgICAgICAgIGQyeSA9IGV5IC0gY2J5O1xuICAgICAgICAgICAgZDJ6ID0gZXogLSBjYno7XG4gICAgICAgICAgICBkb3RoID0gZDJ4ICogZGlyMnggKyBkMnkgKiBkaXIyeSArIGQyeiAqIGRpcjJ6O1xuICAgICAgICAgICAgdHggPSBleCAtIHN4O1xuICAgICAgICAgICAgdHkgPSBleSAtIHN5O1xuICAgICAgICAgICAgdHogPSBleiAtIHN6O1xuICAgICAgICAgICAgdGQgPSBlZCAtIHNkO1xuICAgICAgICAgIH1cbiAgICAgICAgICBkb3QxID0gZG90dyArIGRpcjJsO1xuICAgICAgICAgIGRvdDIgPSBkb3RoICsgZGlyMmw7XG4gICAgICAgICAgaWYgKGRvdDEgPCAwKSB7XG4gICAgICAgICAgICBpZiAoZG90MiA8IDApIHJldHVybjtcbiAgICAgICAgICAgIHQxID0gZG90MSAvIChkb3QxIC0gZG90Mik7XG4gICAgICAgICAgICBzeCA9IHN4ICsgdHggKiB0MTtcbiAgICAgICAgICAgIHN5ID0gc3kgKyB0eSAqIHQxO1xuICAgICAgICAgICAgc3ogPSBzeiArIHR6ICogdDE7XG4gICAgICAgICAgICBzZCA9IHNkICsgdGQgKiB0MTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGRvdDIgPCAwKSB7XG4gICAgICAgICAgICB0MSA9IGRvdDEgLyAoZG90MSAtIGRvdDIpO1xuICAgICAgICAgICAgZXggPSBzeCArIHR4ICogdDE7XG4gICAgICAgICAgICBleSA9IHN5ICsgdHkgKiB0MTtcbiAgICAgICAgICAgIGV6ID0gc3ogKyB0eiAqIHQxO1xuICAgICAgICAgICAgZWQgPSBzZCArIHRkICogdDE7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChzZCA8IDApIHtcbiAgICAgICAgICAgIC8vbWFuaWZvbGQuYWRkUG9pbnQoc3gsc3ksc3osbngsbnksbnosc2QsYixjLDEsMCxmYWxzZSk7XG4gICAgICAgICAgICBtYW5pZm9sZC5hZGRQb2ludChzeCwgc3ksIHN6LCBueCwgbnksIG56LCBzZCwgdGhpcy5mbGlwKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGVkIDwgMCkge1xuICAgICAgICAgICAgLy9tYW5pZm9sZC5hZGRQb2ludChleCxleSxleixueCxueSxueixlZCxiLGMsNCwwLGZhbHNlKTtcbiAgICAgICAgICAgIG1hbmlmb2xkLmFkZFBvaW50KGV4LCBleSwgZXosIG54LCBueSwgbnosIGVkLCB0aGlzLmZsaXApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgfVxuXG4gIH0pO1xuXG4gIGZ1bmN0aW9uIEN5bGluZGVyQ3lsaW5kZXJDb2xsaXNpb25EZXRlY3RvcigpIHtcblxuICAgIENvbGxpc2lvbkRldGVjdG9yLmNhbGwodGhpcyk7XG5cbiAgfVxuICBDeWxpbmRlckN5bGluZGVyQ29sbGlzaW9uRGV0ZWN0b3IucHJvdG90eXBlID0gT2JqZWN0LmFzc2lnbihPYmplY3QuY3JlYXRlKENvbGxpc2lvbkRldGVjdG9yLnByb3RvdHlwZSksIHtcblxuICAgIGNvbnN0cnVjdG9yOiBDeWxpbmRlckN5bGluZGVyQ29sbGlzaW9uRGV0ZWN0b3IsXG5cblxuICAgIGdldFNlcDogZnVuY3Rpb24gKGMxLCBjMiwgc2VwLCBwb3MsIGRlcCkge1xuXG4gICAgICB2YXIgdDF4O1xuICAgICAgdmFyIHQxeTtcbiAgICAgIHZhciB0MXo7XG4gICAgICB2YXIgdDJ4O1xuICAgICAgdmFyIHQyeTtcbiAgICAgIHZhciB0Mno7XG4gICAgICB2YXIgc3VwID0gbmV3IFZlYzMoKTtcbiAgICAgIHZhciBsZW47XG4gICAgICB2YXIgcDF4O1xuICAgICAgdmFyIHAxeTtcbiAgICAgIHZhciBwMXo7XG4gICAgICB2YXIgcDJ4O1xuICAgICAgdmFyIHAyeTtcbiAgICAgIHZhciBwMno7XG4gICAgICB2YXIgdjAxeCA9IGMxLnBvc2l0aW9uLng7XG4gICAgICB2YXIgdjAxeSA9IGMxLnBvc2l0aW9uLnk7XG4gICAgICB2YXIgdjAxeiA9IGMxLnBvc2l0aW9uLno7XG4gICAgICB2YXIgdjAyeCA9IGMyLnBvc2l0aW9uLng7XG4gICAgICB2YXIgdjAyeSA9IGMyLnBvc2l0aW9uLnk7XG4gICAgICB2YXIgdjAyeiA9IGMyLnBvc2l0aW9uLno7XG4gICAgICB2YXIgdjB4ID0gdjAyeCAtIHYwMXg7XG4gICAgICB2YXIgdjB5ID0gdjAyeSAtIHYwMXk7XG4gICAgICB2YXIgdjB6ID0gdjAyeiAtIHYwMXo7XG4gICAgICBpZiAodjB4ICogdjB4ICsgdjB5ICogdjB5ICsgdjB6ICogdjB6ID09IDApIHYweSA9IDAuMDAxO1xuICAgICAgdmFyIG54ID0gLXYweDtcbiAgICAgIHZhciBueSA9IC12MHk7XG4gICAgICB2YXIgbnogPSAtdjB6O1xuICAgICAgdGhpcy5zdXBwb3J0UG9pbnQoYzEsIC1ueCwgLW55LCAtbnosIHN1cCk7XG4gICAgICB2YXIgdjExeCA9IHN1cC54O1xuICAgICAgdmFyIHYxMXkgPSBzdXAueTtcbiAgICAgIHZhciB2MTF6ID0gc3VwLno7XG4gICAgICB0aGlzLnN1cHBvcnRQb2ludChjMiwgbngsIG55LCBueiwgc3VwKTtcbiAgICAgIHZhciB2MTJ4ID0gc3VwLng7XG4gICAgICB2YXIgdjEyeSA9IHN1cC55O1xuICAgICAgdmFyIHYxMnogPSBzdXAuejtcbiAgICAgIHZhciB2MXggPSB2MTJ4IC0gdjExeDtcbiAgICAgIHZhciB2MXkgPSB2MTJ5IC0gdjExeTtcbiAgICAgIHZhciB2MXogPSB2MTJ6IC0gdjExejtcbiAgICAgIGlmICh2MXggKiBueCArIHYxeSAqIG55ICsgdjF6ICogbnogPD0gMCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICBueCA9IHYxeSAqIHYweiAtIHYxeiAqIHYweTtcbiAgICAgIG55ID0gdjF6ICogdjB4IC0gdjF4ICogdjB6O1xuICAgICAgbnogPSB2MXggKiB2MHkgLSB2MXkgKiB2MHg7XG4gICAgICBpZiAobnggKiBueCArIG55ICogbnkgKyBueiAqIG56ID09IDApIHtcbiAgICAgICAgc2VwLnNldCh2MXggLSB2MHgsIHYxeSAtIHYweSwgdjF6IC0gdjB6KS5ub3JtYWxpemUoKTtcbiAgICAgICAgcG9zLnNldCgodjExeCArIHYxMngpICogMC41LCAodjExeSArIHYxMnkpICogMC41LCAodjExeiArIHYxMnopICogMC41KTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICB0aGlzLnN1cHBvcnRQb2ludChjMSwgLW54LCAtbnksIC1ueiwgc3VwKTtcbiAgICAgIHZhciB2MjF4ID0gc3VwLng7XG4gICAgICB2YXIgdjIxeSA9IHN1cC55O1xuICAgICAgdmFyIHYyMXogPSBzdXAuejtcbiAgICAgIHRoaXMuc3VwcG9ydFBvaW50KGMyLCBueCwgbnksIG56LCBzdXApO1xuICAgICAgdmFyIHYyMnggPSBzdXAueDtcbiAgICAgIHZhciB2MjJ5ID0gc3VwLnk7XG4gICAgICB2YXIgdjIyeiA9IHN1cC56O1xuICAgICAgdmFyIHYyeCA9IHYyMnggLSB2MjF4O1xuICAgICAgdmFyIHYyeSA9IHYyMnkgLSB2MjF5O1xuICAgICAgdmFyIHYyeiA9IHYyMnogLSB2MjF6O1xuICAgICAgaWYgKHYyeCAqIG54ICsgdjJ5ICogbnkgKyB2MnogKiBueiA8PSAwKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHQxeCA9IHYxeCAtIHYweDtcbiAgICAgIHQxeSA9IHYxeSAtIHYweTtcbiAgICAgIHQxeiA9IHYxeiAtIHYwejtcbiAgICAgIHQyeCA9IHYyeCAtIHYweDtcbiAgICAgIHQyeSA9IHYyeSAtIHYweTtcbiAgICAgIHQyeiA9IHYyeiAtIHYwejtcbiAgICAgIG54ID0gdDF5ICogdDJ6IC0gdDF6ICogdDJ5O1xuICAgICAgbnkgPSB0MXogKiB0MnggLSB0MXggKiB0Mno7XG4gICAgICBueiA9IHQxeCAqIHQyeSAtIHQxeSAqIHQyeDtcbiAgICAgIGlmIChueCAqIHYweCArIG55ICogdjB5ICsgbnogKiB2MHogPiAwKSB7XG4gICAgICAgIHQxeCA9IHYxeDtcbiAgICAgICAgdDF5ID0gdjF5O1xuICAgICAgICB0MXogPSB2MXo7XG4gICAgICAgIHYxeCA9IHYyeDtcbiAgICAgICAgdjF5ID0gdjJ5O1xuICAgICAgICB2MXogPSB2Mno7XG4gICAgICAgIHYyeCA9IHQxeDtcbiAgICAgICAgdjJ5ID0gdDF5O1xuICAgICAgICB2MnogPSB0MXo7XG4gICAgICAgIHQxeCA9IHYxMXg7XG4gICAgICAgIHQxeSA9IHYxMXk7XG4gICAgICAgIHQxeiA9IHYxMXo7XG4gICAgICAgIHYxMXggPSB2MjF4O1xuICAgICAgICB2MTF5ID0gdjIxeTtcbiAgICAgICAgdjExeiA9IHYyMXo7XG4gICAgICAgIHYyMXggPSB0MXg7XG4gICAgICAgIHYyMXkgPSB0MXk7XG4gICAgICAgIHYyMXogPSB0MXo7XG4gICAgICAgIHQxeCA9IHYxMng7XG4gICAgICAgIHQxeSA9IHYxMnk7XG4gICAgICAgIHQxeiA9IHYxMno7XG4gICAgICAgIHYxMnggPSB2MjJ4O1xuICAgICAgICB2MTJ5ID0gdjIyeTtcbiAgICAgICAgdjEyeiA9IHYyMno7XG4gICAgICAgIHYyMnggPSB0MXg7XG4gICAgICAgIHYyMnkgPSB0MXk7XG4gICAgICAgIHYyMnogPSB0MXo7XG4gICAgICAgIG54ID0gLW54O1xuICAgICAgICBueSA9IC1ueTtcbiAgICAgICAgbnogPSAtbno7XG4gICAgICB9XG4gICAgICB2YXIgaXRlcmF0aW9ucyA9IDA7XG4gICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICBpZiAoKytpdGVyYXRpb25zID4gMTAwKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc3VwcG9ydFBvaW50KGMxLCAtbngsIC1ueSwgLW56LCBzdXApO1xuICAgICAgICB2YXIgdjMxeCA9IHN1cC54O1xuICAgICAgICB2YXIgdjMxeSA9IHN1cC55O1xuICAgICAgICB2YXIgdjMxeiA9IHN1cC56O1xuICAgICAgICB0aGlzLnN1cHBvcnRQb2ludChjMiwgbngsIG55LCBueiwgc3VwKTtcbiAgICAgICAgdmFyIHYzMnggPSBzdXAueDtcbiAgICAgICAgdmFyIHYzMnkgPSBzdXAueTtcbiAgICAgICAgdmFyIHYzMnogPSBzdXAuejtcbiAgICAgICAgdmFyIHYzeCA9IHYzMnggLSB2MzF4O1xuICAgICAgICB2YXIgdjN5ID0gdjMyeSAtIHYzMXk7XG4gICAgICAgIHZhciB2M3ogPSB2MzJ6IC0gdjMxejtcbiAgICAgICAgaWYgKHYzeCAqIG54ICsgdjN5ICogbnkgKyB2M3ogKiBueiA8PSAwKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICgodjF5ICogdjN6IC0gdjF6ICogdjN5KSAqIHYweCArICh2MXogKiB2M3ggLSB2MXggKiB2M3opICogdjB5ICsgKHYxeCAqIHYzeSAtIHYxeSAqIHYzeCkgKiB2MHogPCAwKSB7XG4gICAgICAgICAgdjJ4ID0gdjN4O1xuICAgICAgICAgIHYyeSA9IHYzeTtcbiAgICAgICAgICB2MnogPSB2M3o7XG4gICAgICAgICAgdjIxeCA9IHYzMXg7XG4gICAgICAgICAgdjIxeSA9IHYzMXk7XG4gICAgICAgICAgdjIxeiA9IHYzMXo7XG4gICAgICAgICAgdjIyeCA9IHYzMng7XG4gICAgICAgICAgdjIyeSA9IHYzMnk7XG4gICAgICAgICAgdjIyeiA9IHYzMno7XG4gICAgICAgICAgdDF4ID0gdjF4IC0gdjB4O1xuICAgICAgICAgIHQxeSA9IHYxeSAtIHYweTtcbiAgICAgICAgICB0MXogPSB2MXogLSB2MHo7XG4gICAgICAgICAgdDJ4ID0gdjN4IC0gdjB4O1xuICAgICAgICAgIHQyeSA9IHYzeSAtIHYweTtcbiAgICAgICAgICB0MnogPSB2M3ogLSB2MHo7XG4gICAgICAgICAgbnggPSB0MXkgKiB0MnogLSB0MXogKiB0Mnk7XG4gICAgICAgICAgbnkgPSB0MXogKiB0MnggLSB0MXggKiB0Mno7XG4gICAgICAgICAgbnogPSB0MXggKiB0MnkgLSB0MXkgKiB0Mng7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCh2M3kgKiB2MnogLSB2M3ogKiB2MnkpICogdjB4ICsgKHYzeiAqIHYyeCAtIHYzeCAqIHYyeikgKiB2MHkgKyAodjN4ICogdjJ5IC0gdjN5ICogdjJ4KSAqIHYweiA8IDApIHtcbiAgICAgICAgICB2MXggPSB2M3g7XG4gICAgICAgICAgdjF5ID0gdjN5O1xuICAgICAgICAgIHYxeiA9IHYzejtcbiAgICAgICAgICB2MTF4ID0gdjMxeDtcbiAgICAgICAgICB2MTF5ID0gdjMxeTtcbiAgICAgICAgICB2MTF6ID0gdjMxejtcbiAgICAgICAgICB2MTJ4ID0gdjMyeDtcbiAgICAgICAgICB2MTJ5ID0gdjMyeTtcbiAgICAgICAgICB2MTJ6ID0gdjMyejtcbiAgICAgICAgICB0MXggPSB2M3ggLSB2MHg7XG4gICAgICAgICAgdDF5ID0gdjN5IC0gdjB5O1xuICAgICAgICAgIHQxeiA9IHYzeiAtIHYwejtcbiAgICAgICAgICB0MnggPSB2MnggLSB2MHg7XG4gICAgICAgICAgdDJ5ID0gdjJ5IC0gdjB5O1xuICAgICAgICAgIHQyeiA9IHYyeiAtIHYwejtcbiAgICAgICAgICBueCA9IHQxeSAqIHQyeiAtIHQxeiAqIHQyeTtcbiAgICAgICAgICBueSA9IHQxeiAqIHQyeCAtIHQxeCAqIHQyejtcbiAgICAgICAgICBueiA9IHQxeCAqIHQyeSAtIHQxeSAqIHQyeDtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgaGl0ID0gZmFsc2U7XG4gICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgdDF4ID0gdjJ4IC0gdjF4O1xuICAgICAgICAgIHQxeSA9IHYyeSAtIHYxeTtcbiAgICAgICAgICB0MXogPSB2MnogLSB2MXo7XG4gICAgICAgICAgdDJ4ID0gdjN4IC0gdjF4O1xuICAgICAgICAgIHQyeSA9IHYzeSAtIHYxeTtcbiAgICAgICAgICB0MnogPSB2M3ogLSB2MXo7XG4gICAgICAgICAgbnggPSB0MXkgKiB0MnogLSB0MXogKiB0Mnk7XG4gICAgICAgICAgbnkgPSB0MXogKiB0MnggLSB0MXggKiB0Mno7XG4gICAgICAgICAgbnogPSB0MXggKiB0MnkgLSB0MXkgKiB0Mng7XG4gICAgICAgICAgbGVuID0gMSAvIF9NYXRoLnNxcnQobnggKiBueCArIG55ICogbnkgKyBueiAqIG56KTtcbiAgICAgICAgICBueCAqPSBsZW47XG4gICAgICAgICAgbnkgKj0gbGVuO1xuICAgICAgICAgIG56ICo9IGxlbjtcbiAgICAgICAgICBpZiAobnggKiB2MXggKyBueSAqIHYxeSArIG56ICogdjF6ID49IDAgJiYgIWhpdCkge1xuICAgICAgICAgICAgdmFyIGIwID0gKHYxeSAqIHYyeiAtIHYxeiAqIHYyeSkgKiB2M3ggKyAodjF6ICogdjJ4IC0gdjF4ICogdjJ6KSAqIHYzeSArICh2MXggKiB2MnkgLSB2MXkgKiB2MngpICogdjN6O1xuICAgICAgICAgICAgdmFyIGIxID0gKHYzeSAqIHYyeiAtIHYzeiAqIHYyeSkgKiB2MHggKyAodjN6ICogdjJ4IC0gdjN4ICogdjJ6KSAqIHYweSArICh2M3ggKiB2MnkgLSB2M3kgKiB2MngpICogdjB6O1xuICAgICAgICAgICAgdmFyIGIyID0gKHYweSAqIHYxeiAtIHYweiAqIHYxeSkgKiB2M3ggKyAodjB6ICogdjF4IC0gdjB4ICogdjF6KSAqIHYzeSArICh2MHggKiB2MXkgLSB2MHkgKiB2MXgpICogdjN6O1xuICAgICAgICAgICAgdmFyIGIzID0gKHYyeSAqIHYxeiAtIHYyeiAqIHYxeSkgKiB2MHggKyAodjJ6ICogdjF4IC0gdjJ4ICogdjF6KSAqIHYweSArICh2MnggKiB2MXkgLSB2MnkgKiB2MXgpICogdjB6O1xuICAgICAgICAgICAgdmFyIHN1bSA9IGIwICsgYjEgKyBiMiArIGIzO1xuICAgICAgICAgICAgaWYgKHN1bSA8PSAwKSB7XG4gICAgICAgICAgICAgIGIwID0gMDtcbiAgICAgICAgICAgICAgYjEgPSAodjJ5ICogdjN6IC0gdjJ6ICogdjN5KSAqIG54ICsgKHYyeiAqIHYzeCAtIHYyeCAqIHYzeikgKiBueSArICh2MnggKiB2M3kgLSB2MnkgKiB2M3gpICogbno7XG4gICAgICAgICAgICAgIGIyID0gKHYzeSAqIHYyeiAtIHYzeiAqIHYyeSkgKiBueCArICh2M3ogKiB2MnggLSB2M3ggKiB2MnopICogbnkgKyAodjN4ICogdjJ5IC0gdjN5ICogdjJ4KSAqIG56O1xuICAgICAgICAgICAgICBiMyA9ICh2MXkgKiB2MnogLSB2MXogKiB2MnkpICogbnggKyAodjF6ICogdjJ4IC0gdjF4ICogdjJ6KSAqIG55ICsgKHYxeCAqIHYyeSAtIHYxeSAqIHYyeCkgKiBuejtcbiAgICAgICAgICAgICAgc3VtID0gYjEgKyBiMiArIGIzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGludiA9IDEgLyBzdW07XG4gICAgICAgICAgICBwMXggPSAodjAxeCAqIGIwICsgdjExeCAqIGIxICsgdjIxeCAqIGIyICsgdjMxeCAqIGIzKSAqIGludjtcbiAgICAgICAgICAgIHAxeSA9ICh2MDF5ICogYjAgKyB2MTF5ICogYjEgKyB2MjF5ICogYjIgKyB2MzF5ICogYjMpICogaW52O1xuICAgICAgICAgICAgcDF6ID0gKHYwMXogKiBiMCArIHYxMXogKiBiMSArIHYyMXogKiBiMiArIHYzMXogKiBiMykgKiBpbnY7XG4gICAgICAgICAgICBwMnggPSAodjAyeCAqIGIwICsgdjEyeCAqIGIxICsgdjIyeCAqIGIyICsgdjMyeCAqIGIzKSAqIGludjtcbiAgICAgICAgICAgIHAyeSA9ICh2MDJ5ICogYjAgKyB2MTJ5ICogYjEgKyB2MjJ5ICogYjIgKyB2MzJ5ICogYjMpICogaW52O1xuICAgICAgICAgICAgcDJ6ID0gKHYwMnogKiBiMCArIHYxMnogKiBiMSArIHYyMnogKiBiMiArIHYzMnogKiBiMykgKiBpbnY7XG4gICAgICAgICAgICBoaXQgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLnN1cHBvcnRQb2ludChjMSwgLW54LCAtbnksIC1ueiwgc3VwKTtcbiAgICAgICAgICB2YXIgdjQxeCA9IHN1cC54O1xuICAgICAgICAgIHZhciB2NDF5ID0gc3VwLnk7XG4gICAgICAgICAgdmFyIHY0MXogPSBzdXAuejtcbiAgICAgICAgICB0aGlzLnN1cHBvcnRQb2ludChjMiwgbngsIG55LCBueiwgc3VwKTtcbiAgICAgICAgICB2YXIgdjQyeCA9IHN1cC54O1xuICAgICAgICAgIHZhciB2NDJ5ID0gc3VwLnk7XG4gICAgICAgICAgdmFyIHY0MnogPSBzdXAuejtcbiAgICAgICAgICB2YXIgdjR4ID0gdjQyeCAtIHY0MXg7XG4gICAgICAgICAgdmFyIHY0eSA9IHY0MnkgLSB2NDF5O1xuICAgICAgICAgIHZhciB2NHogPSB2NDJ6IC0gdjQxejtcbiAgICAgICAgICB2YXIgc2VwYXJhdGlvbiA9IC0odjR4ICogbnggKyB2NHkgKiBueSArIHY0eiAqIG56KTtcbiAgICAgICAgICBpZiAoKHY0eCAtIHYzeCkgKiBueCArICh2NHkgLSB2M3kpICogbnkgKyAodjR6IC0gdjN6KSAqIG56IDw9IDAuMDEgfHwgc2VwYXJhdGlvbiA+PSAwKSB7XG4gICAgICAgICAgICBpZiAoaGl0KSB7XG4gICAgICAgICAgICAgIHNlcC5zZXQoLW54LCAtbnksIC1ueik7XG4gICAgICAgICAgICAgIHBvcy5zZXQoKHAxeCArIHAyeCkgKiAwLjUsIChwMXkgKyBwMnkpICogMC41LCAocDF6ICsgcDJ6KSAqIDAuNSk7XG4gICAgICAgICAgICAgIGRlcC54ID0gc2VwYXJhdGlvbjtcbiAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICh2NHkgKiB2MXogLSB2NHogKiB2MXkpICogdjB4ICtcbiAgICAgICAgICAgICh2NHogKiB2MXggLSB2NHggKiB2MXopICogdjB5ICtcbiAgICAgICAgICAgICh2NHggKiB2MXkgLSB2NHkgKiB2MXgpICogdjB6IDwgMFxuICAgICAgICAgICkge1xuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAodjR5ICogdjJ6IC0gdjR6ICogdjJ5KSAqIHYweCArXG4gICAgICAgICAgICAgICh2NHogKiB2MnggLSB2NHggKiB2MnopICogdjB5ICtcbiAgICAgICAgICAgICAgKHY0eCAqIHYyeSAtIHY0eSAqIHYyeCkgKiB2MHogPCAwXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgdjF4ID0gdjR4O1xuICAgICAgICAgICAgICB2MXkgPSB2NHk7XG4gICAgICAgICAgICAgIHYxeiA9IHY0ejtcbiAgICAgICAgICAgICAgdjExeCA9IHY0MXg7XG4gICAgICAgICAgICAgIHYxMXkgPSB2NDF5O1xuICAgICAgICAgICAgICB2MTF6ID0gdjQxejtcbiAgICAgICAgICAgICAgdjEyeCA9IHY0Mng7XG4gICAgICAgICAgICAgIHYxMnkgPSB2NDJ5O1xuICAgICAgICAgICAgICB2MTJ6ID0gdjQyejtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHYzeCA9IHY0eDtcbiAgICAgICAgICAgICAgdjN5ID0gdjR5O1xuICAgICAgICAgICAgICB2M3ogPSB2NHo7XG4gICAgICAgICAgICAgIHYzMXggPSB2NDF4O1xuICAgICAgICAgICAgICB2MzF5ID0gdjQxeTtcbiAgICAgICAgICAgICAgdjMxeiA9IHY0MXo7XG4gICAgICAgICAgICAgIHYzMnggPSB2NDJ4O1xuICAgICAgICAgICAgICB2MzJ5ID0gdjQyeTtcbiAgICAgICAgICAgICAgdjMyeiA9IHY0Mno7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgKHY0eSAqIHYzeiAtIHY0eiAqIHYzeSkgKiB2MHggK1xuICAgICAgICAgICAgICAodjR6ICogdjN4IC0gdjR4ICogdjN6KSAqIHYweSArXG4gICAgICAgICAgICAgICh2NHggKiB2M3kgLSB2NHkgKiB2M3gpICogdjB6IDwgMFxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgIHYyeCA9IHY0eDtcbiAgICAgICAgICAgICAgdjJ5ID0gdjR5O1xuICAgICAgICAgICAgICB2MnogPSB2NHo7XG4gICAgICAgICAgICAgIHYyMXggPSB2NDF4O1xuICAgICAgICAgICAgICB2MjF5ID0gdjQxeTtcbiAgICAgICAgICAgICAgdjIxeiA9IHY0MXo7XG4gICAgICAgICAgICAgIHYyMnggPSB2NDJ4O1xuICAgICAgICAgICAgICB2MjJ5ID0gdjQyeTtcbiAgICAgICAgICAgICAgdjIyeiA9IHY0Mno7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB2MXggPSB2NHg7XG4gICAgICAgICAgICAgIHYxeSA9IHY0eTtcbiAgICAgICAgICAgICAgdjF6ID0gdjR6O1xuICAgICAgICAgICAgICB2MTF4ID0gdjQxeDtcbiAgICAgICAgICAgICAgdjExeSA9IHY0MXk7XG4gICAgICAgICAgICAgIHYxMXogPSB2NDF6O1xuICAgICAgICAgICAgICB2MTJ4ID0gdjQyeDtcbiAgICAgICAgICAgICAgdjEyeSA9IHY0Mnk7XG4gICAgICAgICAgICAgIHYxMnogPSB2NDJ6O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy9yZXR1cm4gZmFsc2U7XG4gICAgfSxcblxuICAgIHN1cHBvcnRQb2ludDogZnVuY3Rpb24gKGMsIGR4LCBkeSwgZHosIG91dCkge1xuXG4gICAgICB2YXIgcm90ID0gYy5yb3RhdGlvbi5lbGVtZW50cztcbiAgICAgIHZhciBsZHggPSByb3RbMF0gKiBkeCArIHJvdFszXSAqIGR5ICsgcm90WzZdICogZHo7XG4gICAgICB2YXIgbGR5ID0gcm90WzFdICogZHggKyByb3RbNF0gKiBkeSArIHJvdFs3XSAqIGR6O1xuICAgICAgdmFyIGxkeiA9IHJvdFsyXSAqIGR4ICsgcm90WzVdICogZHkgKyByb3RbOF0gKiBkejtcbiAgICAgIHZhciByYWR4ID0gbGR4O1xuICAgICAgdmFyIHJhZHogPSBsZHo7XG4gICAgICB2YXIgbGVuID0gcmFkeCAqIHJhZHggKyByYWR6ICogcmFkejtcbiAgICAgIHZhciByYWQgPSBjLnJhZGl1cztcbiAgICAgIHZhciBoaCA9IGMuaGFsZkhlaWdodDtcbiAgICAgIHZhciBveDtcbiAgICAgIHZhciBveTtcbiAgICAgIHZhciBvejtcbiAgICAgIGlmIChsZW4gPT0gMCkge1xuICAgICAgICBpZiAobGR5IDwgMCkge1xuICAgICAgICAgIG94ID0gcmFkO1xuICAgICAgICAgIG95ID0gLWhoO1xuICAgICAgICAgIG96ID0gMDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBveCA9IHJhZDtcbiAgICAgICAgICBveSA9IGhoO1xuICAgICAgICAgIG96ID0gMDtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGVuID0gYy5yYWRpdXMgLyBfTWF0aC5zcXJ0KGxlbik7XG4gICAgICAgIGlmIChsZHkgPCAwKSB7XG4gICAgICAgICAgb3ggPSByYWR4ICogbGVuO1xuICAgICAgICAgIG95ID0gLWhoO1xuICAgICAgICAgIG96ID0gcmFkeiAqIGxlbjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBveCA9IHJhZHggKiBsZW47XG4gICAgICAgICAgb3kgPSBoaDtcbiAgICAgICAgICBveiA9IHJhZHogKiBsZW47XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGxkeCA9IHJvdFswXSAqIG94ICsgcm90WzFdICogb3kgKyByb3RbMl0gKiBveiArIGMucG9zaXRpb24ueDtcbiAgICAgIGxkeSA9IHJvdFszXSAqIG94ICsgcm90WzRdICogb3kgKyByb3RbNV0gKiBveiArIGMucG9zaXRpb24ueTtcbiAgICAgIGxkeiA9IHJvdFs2XSAqIG94ICsgcm90WzddICogb3kgKyByb3RbOF0gKiBveiArIGMucG9zaXRpb24uejtcbiAgICAgIG91dC5zZXQobGR4LCBsZHksIGxkeik7XG5cbiAgICB9LFxuXG4gICAgZGV0ZWN0Q29sbGlzaW9uOiBmdW5jdGlvbiAoc2hhcGUxLCBzaGFwZTIsIG1hbmlmb2xkKSB7XG5cbiAgICAgIHZhciBjMTtcbiAgICAgIHZhciBjMjtcbiAgICAgIGlmIChzaGFwZTEuaWQgPCBzaGFwZTIuaWQpIHtcbiAgICAgICAgYzEgPSBzaGFwZTE7XG4gICAgICAgIGMyID0gc2hhcGUyO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYzEgPSBzaGFwZTI7XG4gICAgICAgIGMyID0gc2hhcGUxO1xuICAgICAgfVxuICAgICAgdmFyIHAxID0gYzEucG9zaXRpb247XG4gICAgICB2YXIgcDIgPSBjMi5wb3NpdGlvbjtcbiAgICAgIHZhciBwMXggPSBwMS54O1xuICAgICAgdmFyIHAxeSA9IHAxLnk7XG4gICAgICB2YXIgcDF6ID0gcDEuejtcbiAgICAgIHZhciBwMnggPSBwMi54O1xuICAgICAgdmFyIHAyeSA9IHAyLnk7XG4gICAgICB2YXIgcDJ6ID0gcDIuejtcbiAgICAgIHZhciBoMSA9IGMxLmhhbGZIZWlnaHQ7XG4gICAgICB2YXIgaDIgPSBjMi5oYWxmSGVpZ2h0O1xuICAgICAgdmFyIG4xID0gYzEubm9ybWFsRGlyZWN0aW9uO1xuICAgICAgdmFyIG4yID0gYzIubm9ybWFsRGlyZWN0aW9uO1xuICAgICAgdmFyIGQxID0gYzEuaGFsZkRpcmVjdGlvbjtcbiAgICAgIHZhciBkMiA9IGMyLmhhbGZEaXJlY3Rpb247XG4gICAgICB2YXIgcjEgPSBjMS5yYWRpdXM7XG4gICAgICB2YXIgcjIgPSBjMi5yYWRpdXM7XG4gICAgICB2YXIgbjF4ID0gbjEueDtcbiAgICAgIHZhciBuMXkgPSBuMS55O1xuICAgICAgdmFyIG4xeiA9IG4xLno7XG4gICAgICB2YXIgbjJ4ID0gbjIueDtcbiAgICAgIHZhciBuMnkgPSBuMi55O1xuICAgICAgdmFyIG4yeiA9IG4yLno7XG4gICAgICB2YXIgZDF4ID0gZDEueDtcbiAgICAgIHZhciBkMXkgPSBkMS55O1xuICAgICAgdmFyIGQxeiA9IGQxLno7XG4gICAgICB2YXIgZDJ4ID0gZDIueDtcbiAgICAgIHZhciBkMnkgPSBkMi55O1xuICAgICAgdmFyIGQyeiA9IGQyLno7XG4gICAgICB2YXIgZHggPSBwMXggLSBwMng7XG4gICAgICB2YXIgZHkgPSBwMXkgLSBwMnk7XG4gICAgICB2YXIgZHogPSBwMXogLSBwMno7XG4gICAgICB2YXIgbGVuO1xuICAgICAgdmFyIGMxeDtcbiAgICAgIHZhciBjMXk7XG4gICAgICB2YXIgYzF6O1xuICAgICAgdmFyIGMyeDtcbiAgICAgIHZhciBjMnk7XG4gICAgICB2YXIgYzJ6O1xuICAgICAgdmFyIHR4O1xuICAgICAgdmFyIHR5O1xuICAgICAgdmFyIHR6O1xuICAgICAgdmFyIHN4O1xuICAgICAgdmFyIHN5O1xuICAgICAgdmFyIHN6O1xuICAgICAgdmFyIGV4O1xuICAgICAgdmFyIGV5O1xuICAgICAgdmFyIGV6O1xuICAgICAgdmFyIGRlcHRoMTtcbiAgICAgIHZhciBkZXB0aDI7XG4gICAgICB2YXIgZG90O1xuICAgICAgdmFyIHQxO1xuICAgICAgdmFyIHQyO1xuICAgICAgdmFyIHNlcCA9IG5ldyBWZWMzKCk7XG4gICAgICB2YXIgcG9zID0gbmV3IFZlYzMoKTtcbiAgICAgIHZhciBkZXAgPSBuZXcgVmVjMygpO1xuICAgICAgaWYgKCF0aGlzLmdldFNlcChjMSwgYzIsIHNlcCwgcG9zLCBkZXApKSByZXR1cm47XG4gICAgICB2YXIgZG90MSA9IHNlcC54ICogbjF4ICsgc2VwLnkgKiBuMXkgKyBzZXAueiAqIG4xejtcbiAgICAgIHZhciBkb3QyID0gc2VwLnggKiBuMnggKyBzZXAueSAqIG4yeSArIHNlcC56ICogbjJ6O1xuICAgICAgdmFyIHJpZ2h0MSA9IGRvdDEgPiAwO1xuICAgICAgdmFyIHJpZ2h0MiA9IGRvdDIgPiAwO1xuICAgICAgaWYgKCFyaWdodDEpIGRvdDEgPSAtZG90MTtcbiAgICAgIGlmICghcmlnaHQyKSBkb3QyID0gLWRvdDI7XG4gICAgICB2YXIgc3RhdGUgPSAwO1xuICAgICAgaWYgKGRvdDEgPiAwLjk5OSB8fCBkb3QyID4gMC45OTkpIHtcbiAgICAgICAgaWYgKGRvdDEgPiBkb3QyKSBzdGF0ZSA9IDE7XG4gICAgICAgIGVsc2Ugc3RhdGUgPSAyO1xuICAgICAgfVxuICAgICAgdmFyIG54O1xuICAgICAgdmFyIG55O1xuICAgICAgdmFyIG56O1xuICAgICAgdmFyIGRlcHRoID0gZGVwLng7XG4gICAgICB2YXIgcjAwO1xuICAgICAgdmFyIHIwMTtcbiAgICAgIHZhciByMDI7XG4gICAgICB2YXIgcjEwO1xuICAgICAgdmFyIHIxMTtcbiAgICAgIHZhciByMTI7XG4gICAgICB2YXIgcjIwO1xuICAgICAgdmFyIHIyMTtcbiAgICAgIHZhciByMjI7XG4gICAgICB2YXIgcHg7XG4gICAgICB2YXIgcHk7XG4gICAgICB2YXIgcHo7XG4gICAgICB2YXIgcGQ7XG4gICAgICB2YXIgYTtcbiAgICAgIHZhciBiO1xuICAgICAgdmFyIGU7XG4gICAgICB2YXIgZjtcbiAgICAgIG54ID0gc2VwLng7XG4gICAgICBueSA9IHNlcC55O1xuICAgICAgbnogPSBzZXAuejtcbiAgICAgIHN3aXRjaCAoc3RhdGUpIHtcbiAgICAgICAgY2FzZSAwOlxuICAgICAgICAgIG1hbmlmb2xkLmFkZFBvaW50KHBvcy54LCBwb3MueSwgcG9zLnosIG54LCBueSwgbnosIGRlcHRoLCBmYWxzZSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTpcbiAgICAgICAgICBpZiAocmlnaHQxKSB7XG4gICAgICAgICAgICBjMXggPSBwMXggKyBkMXg7XG4gICAgICAgICAgICBjMXkgPSBwMXkgKyBkMXk7XG4gICAgICAgICAgICBjMXogPSBwMXogKyBkMXo7XG4gICAgICAgICAgICBueCA9IG4xeDtcbiAgICAgICAgICAgIG55ID0gbjF5O1xuICAgICAgICAgICAgbnogPSBuMXo7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGMxeCA9IHAxeCAtIGQxeDtcbiAgICAgICAgICAgIGMxeSA9IHAxeSAtIGQxeTtcbiAgICAgICAgICAgIGMxeiA9IHAxeiAtIGQxejtcbiAgICAgICAgICAgIG54ID0gLW4xeDtcbiAgICAgICAgICAgIG55ID0gLW4xeTtcbiAgICAgICAgICAgIG56ID0gLW4xejtcbiAgICAgICAgICB9XG4gICAgICAgICAgZG90ID0gbnggKiBuMnggKyBueSAqIG4yeSArIG56ICogbjJ6O1xuICAgICAgICAgIGlmIChkb3QgPCAwKSBsZW4gPSBoMjtcbiAgICAgICAgICBlbHNlIGxlbiA9IC1oMjtcbiAgICAgICAgICBjMnggPSBwMnggKyBsZW4gKiBuMng7XG4gICAgICAgICAgYzJ5ID0gcDJ5ICsgbGVuICogbjJ5O1xuICAgICAgICAgIGMyeiA9IHAyeiArIGxlbiAqIG4yejtcbiAgICAgICAgICBpZiAoZG90MiA+PSAwLjk5OTk5OSkge1xuICAgICAgICAgICAgdHggPSAtbnk7XG4gICAgICAgICAgICB0eSA9IG56O1xuICAgICAgICAgICAgdHogPSBueDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdHggPSBueDtcbiAgICAgICAgICAgIHR5ID0gbnk7XG4gICAgICAgICAgICB0eiA9IG56O1xuICAgICAgICAgIH1cbiAgICAgICAgICBsZW4gPSB0eCAqIG4yeCArIHR5ICogbjJ5ICsgdHogKiBuMno7XG4gICAgICAgICAgZHggPSBsZW4gKiBuMnggLSB0eDtcbiAgICAgICAgICBkeSA9IGxlbiAqIG4yeSAtIHR5O1xuICAgICAgICAgIGR6ID0gbGVuICogbjJ6IC0gdHo7XG4gICAgICAgICAgbGVuID0gX01hdGguc3FydChkeCAqIGR4ICsgZHkgKiBkeSArIGR6ICogZHopO1xuICAgICAgICAgIGlmIChsZW4gPT0gMCkgYnJlYWs7XG4gICAgICAgICAgbGVuID0gcjIgLyBsZW47XG4gICAgICAgICAgZHggKj0gbGVuO1xuICAgICAgICAgIGR5ICo9IGxlbjtcbiAgICAgICAgICBkeiAqPSBsZW47XG4gICAgICAgICAgdHggPSBjMnggKyBkeDtcbiAgICAgICAgICB0eSA9IGMyeSArIGR5O1xuICAgICAgICAgIHR6ID0gYzJ6ICsgZHo7XG4gICAgICAgICAgaWYgKGRvdCA8IC0wLjk2IHx8IGRvdCA+IDAuOTYpIHtcbiAgICAgICAgICAgIHIwMCA9IG4yeCAqIG4yeCAqIDEuNSAtIDAuNTtcbiAgICAgICAgICAgIHIwMSA9IG4yeCAqIG4yeSAqIDEuNSAtIG4yeiAqIDAuODY2MDI1NDAzO1xuICAgICAgICAgICAgcjAyID0gbjJ4ICogbjJ6ICogMS41ICsgbjJ5ICogMC44NjYwMjU0MDM7XG4gICAgICAgICAgICByMTAgPSBuMnkgKiBuMnggKiAxLjUgKyBuMnogKiAwLjg2NjAyNTQwMztcbiAgICAgICAgICAgIHIxMSA9IG4yeSAqIG4yeSAqIDEuNSAtIDAuNTtcbiAgICAgICAgICAgIHIxMiA9IG4yeSAqIG4yeiAqIDEuNSAtIG4yeCAqIDAuODY2MDI1NDAzO1xuICAgICAgICAgICAgcjIwID0gbjJ6ICogbjJ4ICogMS41IC0gbjJ5ICogMC44NjYwMjU0MDM7XG4gICAgICAgICAgICByMjEgPSBuMnogKiBuMnkgKiAxLjUgKyBuMnggKiAwLjg2NjAyNTQwMztcbiAgICAgICAgICAgIHIyMiA9IG4yeiAqIG4yeiAqIDEuNSAtIDAuNTtcbiAgICAgICAgICAgIHB4ID0gdHg7XG4gICAgICAgICAgICBweSA9IHR5O1xuICAgICAgICAgICAgcHogPSB0ejtcbiAgICAgICAgICAgIHBkID0gbnggKiAocHggLSBjMXgpICsgbnkgKiAocHkgLSBjMXkpICsgbnogKiAocHogLSBjMXopO1xuICAgICAgICAgICAgdHggPSBweCAtIHBkICogbnggLSBjMXg7XG4gICAgICAgICAgICB0eSA9IHB5IC0gcGQgKiBueSAtIGMxeTtcbiAgICAgICAgICAgIHR6ID0gcHogLSBwZCAqIG56IC0gYzF6O1xuICAgICAgICAgICAgbGVuID0gdHggKiB0eCArIHR5ICogdHkgKyB0eiAqIHR6O1xuICAgICAgICAgICAgaWYgKGxlbiA+IHIxICogcjEpIHtcbiAgICAgICAgICAgICAgbGVuID0gcjEgLyBfTWF0aC5zcXJ0KGxlbik7XG4gICAgICAgICAgICAgIHR4ICo9IGxlbjtcbiAgICAgICAgICAgICAgdHkgKj0gbGVuO1xuICAgICAgICAgICAgICB0eiAqPSBsZW47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBweCA9IGMxeCArIHR4O1xuICAgICAgICAgICAgcHkgPSBjMXkgKyB0eTtcbiAgICAgICAgICAgIHB6ID0gYzF6ICsgdHo7XG4gICAgICAgICAgICBtYW5pZm9sZC5hZGRQb2ludChweCwgcHksIHB6LCBueCwgbnksIG56LCBwZCwgZmFsc2UpO1xuICAgICAgICAgICAgcHggPSBkeCAqIHIwMCArIGR5ICogcjAxICsgZHogKiByMDI7XG4gICAgICAgICAgICBweSA9IGR4ICogcjEwICsgZHkgKiByMTEgKyBkeiAqIHIxMjtcbiAgICAgICAgICAgIHB6ID0gZHggKiByMjAgKyBkeSAqIHIyMSArIGR6ICogcjIyO1xuICAgICAgICAgICAgcHggPSAoZHggPSBweCkgKyBjMng7XG4gICAgICAgICAgICBweSA9IChkeSA9IHB5KSArIGMyeTtcbiAgICAgICAgICAgIHB6ID0gKGR6ID0gcHopICsgYzJ6O1xuICAgICAgICAgICAgcGQgPSBueCAqIChweCAtIGMxeCkgKyBueSAqIChweSAtIGMxeSkgKyBueiAqIChweiAtIGMxeik7XG4gICAgICAgICAgICBpZiAocGQgPD0gMCkge1xuICAgICAgICAgICAgICB0eCA9IHB4IC0gcGQgKiBueCAtIGMxeDtcbiAgICAgICAgICAgICAgdHkgPSBweSAtIHBkICogbnkgLSBjMXk7XG4gICAgICAgICAgICAgIHR6ID0gcHogLSBwZCAqIG56IC0gYzF6O1xuICAgICAgICAgICAgICBsZW4gPSB0eCAqIHR4ICsgdHkgKiB0eSArIHR6ICogdHo7XG4gICAgICAgICAgICAgIGlmIChsZW4gPiByMSAqIHIxKSB7XG4gICAgICAgICAgICAgICAgbGVuID0gcjEgLyBfTWF0aC5zcXJ0KGxlbik7XG4gICAgICAgICAgICAgICAgdHggKj0gbGVuO1xuICAgICAgICAgICAgICAgIHR5ICo9IGxlbjtcbiAgICAgICAgICAgICAgICB0eiAqPSBsZW47XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcHggPSBjMXggKyB0eDtcbiAgICAgICAgICAgICAgcHkgPSBjMXkgKyB0eTtcbiAgICAgICAgICAgICAgcHogPSBjMXogKyB0ejtcbiAgICAgICAgICAgICAgbWFuaWZvbGQuYWRkUG9pbnQocHgsIHB5LCBweiwgbngsIG55LCBueiwgcGQsIGZhbHNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHB4ID0gZHggKiByMDAgKyBkeSAqIHIwMSArIGR6ICogcjAyO1xuICAgICAgICAgICAgcHkgPSBkeCAqIHIxMCArIGR5ICogcjExICsgZHogKiByMTI7XG4gICAgICAgICAgICBweiA9IGR4ICogcjIwICsgZHkgKiByMjEgKyBkeiAqIHIyMjtcbiAgICAgICAgICAgIHB4ID0gKGR4ID0gcHgpICsgYzJ4O1xuICAgICAgICAgICAgcHkgPSAoZHkgPSBweSkgKyBjMnk7XG4gICAgICAgICAgICBweiA9IChkeiA9IHB6KSArIGMyejtcbiAgICAgICAgICAgIHBkID0gbnggKiAocHggLSBjMXgpICsgbnkgKiAocHkgLSBjMXkpICsgbnogKiAocHogLSBjMXopO1xuICAgICAgICAgICAgaWYgKHBkIDw9IDApIHtcbiAgICAgICAgICAgICAgdHggPSBweCAtIHBkICogbnggLSBjMXg7XG4gICAgICAgICAgICAgIHR5ID0gcHkgLSBwZCAqIG55IC0gYzF5O1xuICAgICAgICAgICAgICB0eiA9IHB6IC0gcGQgKiBueiAtIGMxejtcbiAgICAgICAgICAgICAgbGVuID0gdHggKiB0eCArIHR5ICogdHkgKyB0eiAqIHR6O1xuICAgICAgICAgICAgICBpZiAobGVuID4gcjEgKiByMSkge1xuICAgICAgICAgICAgICAgIGxlbiA9IHIxIC8gX01hdGguc3FydChsZW4pO1xuICAgICAgICAgICAgICAgIHR4ICo9IGxlbjtcbiAgICAgICAgICAgICAgICB0eSAqPSBsZW47XG4gICAgICAgICAgICAgICAgdHogKj0gbGVuO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHB4ID0gYzF4ICsgdHg7XG4gICAgICAgICAgICAgIHB5ID0gYzF5ICsgdHk7XG4gICAgICAgICAgICAgIHB6ID0gYzF6ICsgdHo7XG4gICAgICAgICAgICAgIG1hbmlmb2xkLmFkZFBvaW50KHB4LCBweSwgcHosIG54LCBueSwgbnosIHBkLCBmYWxzZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN4ID0gdHg7XG4gICAgICAgICAgICBzeSA9IHR5O1xuICAgICAgICAgICAgc3ogPSB0ejtcbiAgICAgICAgICAgIGRlcHRoMSA9IG54ICogKHN4IC0gYzF4KSArIG55ICogKHN5IC0gYzF5KSArIG56ICogKHN6IC0gYzF6KTtcbiAgICAgICAgICAgIHN4IC09IGRlcHRoMSAqIG54O1xuICAgICAgICAgICAgc3kgLT0gZGVwdGgxICogbnk7XG4gICAgICAgICAgICBzeiAtPSBkZXB0aDEgKiBuejtcbiAgICAgICAgICAgIGlmIChkb3QgPiAwKSB7XG4gICAgICAgICAgICAgIGV4ID0gdHggKyBuMnggKiBoMiAqIDI7XG4gICAgICAgICAgICAgIGV5ID0gdHkgKyBuMnkgKiBoMiAqIDI7XG4gICAgICAgICAgICAgIGV6ID0gdHogKyBuMnogKiBoMiAqIDI7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBleCA9IHR4IC0gbjJ4ICogaDIgKiAyO1xuICAgICAgICAgICAgICBleSA9IHR5IC0gbjJ5ICogaDIgKiAyO1xuICAgICAgICAgICAgICBleiA9IHR6IC0gbjJ6ICogaDIgKiAyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGVwdGgyID0gbnggKiAoZXggLSBjMXgpICsgbnkgKiAoZXkgLSBjMXkpICsgbnogKiAoZXogLSBjMXopO1xuICAgICAgICAgICAgZXggLT0gZGVwdGgyICogbng7XG4gICAgICAgICAgICBleSAtPSBkZXB0aDIgKiBueTtcbiAgICAgICAgICAgIGV6IC09IGRlcHRoMiAqIG56O1xuICAgICAgICAgICAgZHggPSBjMXggLSBzeDtcbiAgICAgICAgICAgIGR5ID0gYzF5IC0gc3k7XG4gICAgICAgICAgICBkeiA9IGMxeiAtIHN6O1xuICAgICAgICAgICAgdHggPSBleCAtIHN4O1xuICAgICAgICAgICAgdHkgPSBleSAtIHN5O1xuICAgICAgICAgICAgdHogPSBleiAtIHN6O1xuICAgICAgICAgICAgYSA9IGR4ICogZHggKyBkeSAqIGR5ICsgZHogKiBkejtcbiAgICAgICAgICAgIGIgPSBkeCAqIHR4ICsgZHkgKiB0eSArIGR6ICogdHo7XG4gICAgICAgICAgICBlID0gdHggKiB0eCArIHR5ICogdHkgKyB0eiAqIHR6O1xuICAgICAgICAgICAgZiA9IGIgKiBiIC0gZSAqIChhIC0gcjEgKiByMSk7XG4gICAgICAgICAgICBpZiAoZiA8IDApIGJyZWFrO1xuICAgICAgICAgICAgZiA9IF9NYXRoLnNxcnQoZik7XG4gICAgICAgICAgICB0MSA9IChiICsgZikgLyBlO1xuICAgICAgICAgICAgdDIgPSAoYiAtIGYpIC8gZTtcbiAgICAgICAgICAgIGlmICh0MiA8IHQxKSB7XG4gICAgICAgICAgICAgIGxlbiA9IHQxO1xuICAgICAgICAgICAgICB0MSA9IHQyO1xuICAgICAgICAgICAgICB0MiA9IGxlbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0MiA+IDEpIHQyID0gMTtcbiAgICAgICAgICAgIGlmICh0MSA8IDApIHQxID0gMDtcbiAgICAgICAgICAgIHR4ID0gc3ggKyAoZXggLSBzeCkgKiB0MTtcbiAgICAgICAgICAgIHR5ID0gc3kgKyAoZXkgLSBzeSkgKiB0MTtcbiAgICAgICAgICAgIHR6ID0gc3ogKyAoZXogLSBzeikgKiB0MTtcbiAgICAgICAgICAgIGV4ID0gc3ggKyAoZXggLSBzeCkgKiB0MjtcbiAgICAgICAgICAgIGV5ID0gc3kgKyAoZXkgLSBzeSkgKiB0MjtcbiAgICAgICAgICAgIGV6ID0gc3ogKyAoZXogLSBzeikgKiB0MjtcbiAgICAgICAgICAgIHN4ID0gdHg7XG4gICAgICAgICAgICBzeSA9IHR5O1xuICAgICAgICAgICAgc3ogPSB0ejtcbiAgICAgICAgICAgIGxlbiA9IGRlcHRoMSArIChkZXB0aDIgLSBkZXB0aDEpICogdDE7XG4gICAgICAgICAgICBkZXB0aDIgPSBkZXB0aDEgKyAoZGVwdGgyIC0gZGVwdGgxKSAqIHQyO1xuICAgICAgICAgICAgZGVwdGgxID0gbGVuO1xuICAgICAgICAgICAgaWYgKGRlcHRoMSA8IDApIG1hbmlmb2xkLmFkZFBvaW50KHN4LCBzeSwgc3osIG54LCBueSwgbnosIHBkLCBmYWxzZSk7XG4gICAgICAgICAgICBpZiAoZGVwdGgyIDwgMCkgbWFuaWZvbGQuYWRkUG9pbnQoZXgsIGV5LCBleiwgbngsIG55LCBueiwgcGQsIGZhbHNlKTtcblxuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgIGlmIChyaWdodDIpIHtcbiAgICAgICAgICAgIGMyeCA9IHAyeCAtIGQyeDtcbiAgICAgICAgICAgIGMyeSA9IHAyeSAtIGQyeTtcbiAgICAgICAgICAgIGMyeiA9IHAyeiAtIGQyejtcbiAgICAgICAgICAgIG54ID0gLW4yeDtcbiAgICAgICAgICAgIG55ID0gLW4yeTtcbiAgICAgICAgICAgIG56ID0gLW4yejtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYzJ4ID0gcDJ4ICsgZDJ4O1xuICAgICAgICAgICAgYzJ5ID0gcDJ5ICsgZDJ5O1xuICAgICAgICAgICAgYzJ6ID0gcDJ6ICsgZDJ6O1xuICAgICAgICAgICAgbnggPSBuMng7XG4gICAgICAgICAgICBueSA9IG4yeTtcbiAgICAgICAgICAgIG56ID0gbjJ6O1xuICAgICAgICAgIH1cbiAgICAgICAgICBkb3QgPSBueCAqIG4xeCArIG55ICogbjF5ICsgbnogKiBuMXo7XG4gICAgICAgICAgaWYgKGRvdCA8IDApIGxlbiA9IGgxO1xuICAgICAgICAgIGVsc2UgbGVuID0gLWgxO1xuICAgICAgICAgIGMxeCA9IHAxeCArIGxlbiAqIG4xeDtcbiAgICAgICAgICBjMXkgPSBwMXkgKyBsZW4gKiBuMXk7XG4gICAgICAgICAgYzF6ID0gcDF6ICsgbGVuICogbjF6O1xuICAgICAgICAgIGlmIChkb3QxID49IDAuOTk5OTk5KSB7XG4gICAgICAgICAgICB0eCA9IC1ueTtcbiAgICAgICAgICAgIHR5ID0gbno7XG4gICAgICAgICAgICB0eiA9IG54O1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0eCA9IG54O1xuICAgICAgICAgICAgdHkgPSBueTtcbiAgICAgICAgICAgIHR6ID0gbno7XG4gICAgICAgICAgfVxuICAgICAgICAgIGxlbiA9IHR4ICogbjF4ICsgdHkgKiBuMXkgKyB0eiAqIG4xejtcbiAgICAgICAgICBkeCA9IGxlbiAqIG4xeCAtIHR4O1xuICAgICAgICAgIGR5ID0gbGVuICogbjF5IC0gdHk7XG4gICAgICAgICAgZHogPSBsZW4gKiBuMXogLSB0ejtcbiAgICAgICAgICBsZW4gPSBfTWF0aC5zcXJ0KGR4ICogZHggKyBkeSAqIGR5ICsgZHogKiBkeik7XG4gICAgICAgICAgaWYgKGxlbiA9PSAwKSBicmVhaztcbiAgICAgICAgICBsZW4gPSByMSAvIGxlbjtcbiAgICAgICAgICBkeCAqPSBsZW47XG4gICAgICAgICAgZHkgKj0gbGVuO1xuICAgICAgICAgIGR6ICo9IGxlbjtcbiAgICAgICAgICB0eCA9IGMxeCArIGR4O1xuICAgICAgICAgIHR5ID0gYzF5ICsgZHk7XG4gICAgICAgICAgdHogPSBjMXogKyBkejtcbiAgICAgICAgICBpZiAoZG90IDwgLTAuOTYgfHwgZG90ID4gMC45Nikge1xuICAgICAgICAgICAgcjAwID0gbjF4ICogbjF4ICogMS41IC0gMC41O1xuICAgICAgICAgICAgcjAxID0gbjF4ICogbjF5ICogMS41IC0gbjF6ICogMC44NjYwMjU0MDM7XG4gICAgICAgICAgICByMDIgPSBuMXggKiBuMXogKiAxLjUgKyBuMXkgKiAwLjg2NjAyNTQwMztcbiAgICAgICAgICAgIHIxMCA9IG4xeSAqIG4xeCAqIDEuNSArIG4xeiAqIDAuODY2MDI1NDAzO1xuICAgICAgICAgICAgcjExID0gbjF5ICogbjF5ICogMS41IC0gMC41O1xuICAgICAgICAgICAgcjEyID0gbjF5ICogbjF6ICogMS41IC0gbjF4ICogMC44NjYwMjU0MDM7XG4gICAgICAgICAgICByMjAgPSBuMXogKiBuMXggKiAxLjUgLSBuMXkgKiAwLjg2NjAyNTQwMztcbiAgICAgICAgICAgIHIyMSA9IG4xeiAqIG4xeSAqIDEuNSArIG4xeCAqIDAuODY2MDI1NDAzO1xuICAgICAgICAgICAgcjIyID0gbjF6ICogbjF6ICogMS41IC0gMC41O1xuICAgICAgICAgICAgcHggPSB0eDtcbiAgICAgICAgICAgIHB5ID0gdHk7XG4gICAgICAgICAgICBweiA9IHR6O1xuICAgICAgICAgICAgcGQgPSBueCAqIChweCAtIGMyeCkgKyBueSAqIChweSAtIGMyeSkgKyBueiAqIChweiAtIGMyeik7XG4gICAgICAgICAgICB0eCA9IHB4IC0gcGQgKiBueCAtIGMyeDtcbiAgICAgICAgICAgIHR5ID0gcHkgLSBwZCAqIG55IC0gYzJ5O1xuICAgICAgICAgICAgdHogPSBweiAtIHBkICogbnogLSBjMno7XG4gICAgICAgICAgICBsZW4gPSB0eCAqIHR4ICsgdHkgKiB0eSArIHR6ICogdHo7XG4gICAgICAgICAgICBpZiAobGVuID4gcjIgKiByMikge1xuICAgICAgICAgICAgICBsZW4gPSByMiAvIF9NYXRoLnNxcnQobGVuKTtcbiAgICAgICAgICAgICAgdHggKj0gbGVuO1xuICAgICAgICAgICAgICB0eSAqPSBsZW47XG4gICAgICAgICAgICAgIHR6ICo9IGxlbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHB4ID0gYzJ4ICsgdHg7XG4gICAgICAgICAgICBweSA9IGMyeSArIHR5O1xuICAgICAgICAgICAgcHogPSBjMnogKyB0ejtcbiAgICAgICAgICAgIG1hbmlmb2xkLmFkZFBvaW50KHB4LCBweSwgcHosIC1ueCwgLW55LCAtbnosIHBkLCBmYWxzZSk7XG4gICAgICAgICAgICBweCA9IGR4ICogcjAwICsgZHkgKiByMDEgKyBkeiAqIHIwMjtcbiAgICAgICAgICAgIHB5ID0gZHggKiByMTAgKyBkeSAqIHIxMSArIGR6ICogcjEyO1xuICAgICAgICAgICAgcHogPSBkeCAqIHIyMCArIGR5ICogcjIxICsgZHogKiByMjI7XG4gICAgICAgICAgICBweCA9IChkeCA9IHB4KSArIGMxeDtcbiAgICAgICAgICAgIHB5ID0gKGR5ID0gcHkpICsgYzF5O1xuICAgICAgICAgICAgcHogPSAoZHogPSBweikgKyBjMXo7XG4gICAgICAgICAgICBwZCA9IG54ICogKHB4IC0gYzJ4KSArIG55ICogKHB5IC0gYzJ5KSArIG56ICogKHB6IC0gYzJ6KTtcbiAgICAgICAgICAgIGlmIChwZCA8PSAwKSB7XG4gICAgICAgICAgICAgIHR4ID0gcHggLSBwZCAqIG54IC0gYzJ4O1xuICAgICAgICAgICAgICB0eSA9IHB5IC0gcGQgKiBueSAtIGMyeTtcbiAgICAgICAgICAgICAgdHogPSBweiAtIHBkICogbnogLSBjMno7XG4gICAgICAgICAgICAgIGxlbiA9IHR4ICogdHggKyB0eSAqIHR5ICsgdHogKiB0ejtcbiAgICAgICAgICAgICAgaWYgKGxlbiA+IHIyICogcjIpIHtcbiAgICAgICAgICAgICAgICBsZW4gPSByMiAvIF9NYXRoLnNxcnQobGVuKTtcbiAgICAgICAgICAgICAgICB0eCAqPSBsZW47XG4gICAgICAgICAgICAgICAgdHkgKj0gbGVuO1xuICAgICAgICAgICAgICAgIHR6ICo9IGxlbjtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBweCA9IGMyeCArIHR4O1xuICAgICAgICAgICAgICBweSA9IGMyeSArIHR5O1xuICAgICAgICAgICAgICBweiA9IGMyeiArIHR6O1xuICAgICAgICAgICAgICBtYW5pZm9sZC5hZGRQb2ludChweCwgcHksIHB6LCAtbngsIC1ueSwgLW56LCBwZCwgZmFsc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcHggPSBkeCAqIHIwMCArIGR5ICogcjAxICsgZHogKiByMDI7XG4gICAgICAgICAgICBweSA9IGR4ICogcjEwICsgZHkgKiByMTEgKyBkeiAqIHIxMjtcbiAgICAgICAgICAgIHB6ID0gZHggKiByMjAgKyBkeSAqIHIyMSArIGR6ICogcjIyO1xuICAgICAgICAgICAgcHggPSAoZHggPSBweCkgKyBjMXg7XG4gICAgICAgICAgICBweSA9IChkeSA9IHB5KSArIGMxeTtcbiAgICAgICAgICAgIHB6ID0gKGR6ID0gcHopICsgYzF6O1xuICAgICAgICAgICAgcGQgPSBueCAqIChweCAtIGMyeCkgKyBueSAqIChweSAtIGMyeSkgKyBueiAqIChweiAtIGMyeik7XG4gICAgICAgICAgICBpZiAocGQgPD0gMCkge1xuICAgICAgICAgICAgICB0eCA9IHB4IC0gcGQgKiBueCAtIGMyeDtcbiAgICAgICAgICAgICAgdHkgPSBweSAtIHBkICogbnkgLSBjMnk7XG4gICAgICAgICAgICAgIHR6ID0gcHogLSBwZCAqIG56IC0gYzJ6O1xuICAgICAgICAgICAgICBsZW4gPSB0eCAqIHR4ICsgdHkgKiB0eSArIHR6ICogdHo7XG4gICAgICAgICAgICAgIGlmIChsZW4gPiByMiAqIHIyKSB7XG4gICAgICAgICAgICAgICAgbGVuID0gcjIgLyBfTWF0aC5zcXJ0KGxlbik7XG4gICAgICAgICAgICAgICAgdHggKj0gbGVuO1xuICAgICAgICAgICAgICAgIHR5ICo9IGxlbjtcbiAgICAgICAgICAgICAgICB0eiAqPSBsZW47XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcHggPSBjMnggKyB0eDtcbiAgICAgICAgICAgICAgcHkgPSBjMnkgKyB0eTtcbiAgICAgICAgICAgICAgcHogPSBjMnogKyB0ejtcbiAgICAgICAgICAgICAgbWFuaWZvbGQuYWRkUG9pbnQocHgsIHB5LCBweiwgLW54LCAtbnksIC1ueiwgcGQsIGZhbHNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3ggPSB0eDtcbiAgICAgICAgICAgIHN5ID0gdHk7XG4gICAgICAgICAgICBzeiA9IHR6O1xuICAgICAgICAgICAgZGVwdGgxID0gbnggKiAoc3ggLSBjMngpICsgbnkgKiAoc3kgLSBjMnkpICsgbnogKiAoc3ogLSBjMnopO1xuICAgICAgICAgICAgc3ggLT0gZGVwdGgxICogbng7XG4gICAgICAgICAgICBzeSAtPSBkZXB0aDEgKiBueTtcbiAgICAgICAgICAgIHN6IC09IGRlcHRoMSAqIG56O1xuICAgICAgICAgICAgaWYgKGRvdCA+IDApIHtcbiAgICAgICAgICAgICAgZXggPSB0eCArIG4xeCAqIGgxICogMjtcbiAgICAgICAgICAgICAgZXkgPSB0eSArIG4xeSAqIGgxICogMjtcbiAgICAgICAgICAgICAgZXogPSB0eiArIG4xeiAqIGgxICogMjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGV4ID0gdHggLSBuMXggKiBoMSAqIDI7XG4gICAgICAgICAgICAgIGV5ID0gdHkgLSBuMXkgKiBoMSAqIDI7XG4gICAgICAgICAgICAgIGV6ID0gdHogLSBuMXogKiBoMSAqIDI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkZXB0aDIgPSBueCAqIChleCAtIGMyeCkgKyBueSAqIChleSAtIGMyeSkgKyBueiAqIChleiAtIGMyeik7XG4gICAgICAgICAgICBleCAtPSBkZXB0aDIgKiBueDtcbiAgICAgICAgICAgIGV5IC09IGRlcHRoMiAqIG55O1xuICAgICAgICAgICAgZXogLT0gZGVwdGgyICogbno7XG4gICAgICAgICAgICBkeCA9IGMyeCAtIHN4O1xuICAgICAgICAgICAgZHkgPSBjMnkgLSBzeTtcbiAgICAgICAgICAgIGR6ID0gYzJ6IC0gc3o7XG4gICAgICAgICAgICB0eCA9IGV4IC0gc3g7XG4gICAgICAgICAgICB0eSA9IGV5IC0gc3k7XG4gICAgICAgICAgICB0eiA9IGV6IC0gc3o7XG4gICAgICAgICAgICBhID0gZHggKiBkeCArIGR5ICogZHkgKyBkeiAqIGR6O1xuICAgICAgICAgICAgYiA9IGR4ICogdHggKyBkeSAqIHR5ICsgZHogKiB0ejtcbiAgICAgICAgICAgIGUgPSB0eCAqIHR4ICsgdHkgKiB0eSArIHR6ICogdHo7XG4gICAgICAgICAgICBmID0gYiAqIGIgLSBlICogKGEgLSByMiAqIHIyKTtcbiAgICAgICAgICAgIGlmIChmIDwgMCkgYnJlYWs7XG4gICAgICAgICAgICBmID0gX01hdGguc3FydChmKTtcbiAgICAgICAgICAgIHQxID0gKGIgKyBmKSAvIGU7XG4gICAgICAgICAgICB0MiA9IChiIC0gZikgLyBlO1xuICAgICAgICAgICAgaWYgKHQyIDwgdDEpIHtcbiAgICAgICAgICAgICAgbGVuID0gdDE7XG4gICAgICAgICAgICAgIHQxID0gdDI7XG4gICAgICAgICAgICAgIHQyID0gbGVuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHQyID4gMSkgdDIgPSAxO1xuICAgICAgICAgICAgaWYgKHQxIDwgMCkgdDEgPSAwO1xuICAgICAgICAgICAgdHggPSBzeCArIChleCAtIHN4KSAqIHQxO1xuICAgICAgICAgICAgdHkgPSBzeSArIChleSAtIHN5KSAqIHQxO1xuICAgICAgICAgICAgdHogPSBzeiArIChleiAtIHN6KSAqIHQxO1xuICAgICAgICAgICAgZXggPSBzeCArIChleCAtIHN4KSAqIHQyO1xuICAgICAgICAgICAgZXkgPSBzeSArIChleSAtIHN5KSAqIHQyO1xuICAgICAgICAgICAgZXogPSBzeiArIChleiAtIHN6KSAqIHQyO1xuICAgICAgICAgICAgc3ggPSB0eDtcbiAgICAgICAgICAgIHN5ID0gdHk7XG4gICAgICAgICAgICBzeiA9IHR6O1xuICAgICAgICAgICAgbGVuID0gZGVwdGgxICsgKGRlcHRoMiAtIGRlcHRoMSkgKiB0MTtcbiAgICAgICAgICAgIGRlcHRoMiA9IGRlcHRoMSArIChkZXB0aDIgLSBkZXB0aDEpICogdDI7XG4gICAgICAgICAgICBkZXB0aDEgPSBsZW47XG4gICAgICAgICAgICBpZiAoZGVwdGgxIDwgMCkge1xuICAgICAgICAgICAgICBtYW5pZm9sZC5hZGRQb2ludChzeCwgc3ksIHN6LCAtbngsIC1ueSwgLW56LCBkZXB0aDEsIGZhbHNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChkZXB0aDIgPCAwKSB7XG4gICAgICAgICAgICAgIG1hbmlmb2xkLmFkZFBvaW50KGV4LCBleSwgZXosIC1ueCwgLW55LCAtbnosIGRlcHRoMiwgZmFsc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgIH1cblxuICB9KTtcblxuICAvKipcbiAgICogQSBjb2xsaXNpb24gZGV0ZWN0b3Igd2hpY2ggZGV0ZWN0cyBjb2xsaXNpb25zIGJldHdlZW4gc3BoZXJlIGFuZCBib3guXG4gICAqIEBhdXRob3Igc2FoYXJhblxuICAgKi9cbiAgZnVuY3Rpb24gU3BoZXJlQm94Q29sbGlzaW9uRGV0ZWN0b3IoZmxpcCkge1xuXG4gICAgQ29sbGlzaW9uRGV0ZWN0b3IuY2FsbCh0aGlzKTtcbiAgICB0aGlzLmZsaXAgPSBmbGlwO1xuXG4gIH1cbiAgU3BoZXJlQm94Q29sbGlzaW9uRGV0ZWN0b3IucHJvdG90eXBlID0gT2JqZWN0LmFzc2lnbihPYmplY3QuY3JlYXRlKENvbGxpc2lvbkRldGVjdG9yLnByb3RvdHlwZSksIHtcblxuICAgIGNvbnN0cnVjdG9yOiBTcGhlcmVCb3hDb2xsaXNpb25EZXRlY3RvcixcblxuICAgIGRldGVjdENvbGxpc2lvbjogZnVuY3Rpb24gKHNoYXBlMSwgc2hhcGUyLCBtYW5pZm9sZCkge1xuXG4gICAgICB2YXIgcztcbiAgICAgIHZhciBiO1xuICAgICAgaWYgKHRoaXMuZmxpcCkge1xuICAgICAgICBzID0gKHNoYXBlMik7XG4gICAgICAgIGIgPSAoc2hhcGUxKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHMgPSAoc2hhcGUxKTtcbiAgICAgICAgYiA9IChzaGFwZTIpO1xuICAgICAgfVxuXG4gICAgICB2YXIgRCA9IGIuZGltZW50aW9ucztcblxuICAgICAgdmFyIHBzID0gcy5wb3NpdGlvbjtcbiAgICAgIHZhciBwc3ggPSBwcy54O1xuICAgICAgdmFyIHBzeSA9IHBzLnk7XG4gICAgICB2YXIgcHN6ID0gcHMuejtcbiAgICAgIHZhciBwYiA9IGIucG9zaXRpb247XG4gICAgICB2YXIgcGJ4ID0gcGIueDtcbiAgICAgIHZhciBwYnkgPSBwYi55O1xuICAgICAgdmFyIHBieiA9IHBiLno7XG4gICAgICB2YXIgcmFkID0gcy5yYWRpdXM7XG5cbiAgICAgIHZhciBodyA9IGIuaGFsZldpZHRoO1xuICAgICAgdmFyIGhoID0gYi5oYWxmSGVpZ2h0O1xuICAgICAgdmFyIGhkID0gYi5oYWxmRGVwdGg7XG5cbiAgICAgIHZhciBkeCA9IHBzeCAtIHBieDtcbiAgICAgIHZhciBkeSA9IHBzeSAtIHBieTtcbiAgICAgIHZhciBkeiA9IHBzeiAtIHBiejtcbiAgICAgIHZhciBzeCA9IERbMF0gKiBkeCArIERbMV0gKiBkeSArIERbMl0gKiBkejtcbiAgICAgIHZhciBzeSA9IERbM10gKiBkeCArIERbNF0gKiBkeSArIERbNV0gKiBkejtcbiAgICAgIHZhciBzeiA9IERbNl0gKiBkeCArIERbN10gKiBkeSArIERbOF0gKiBkejtcbiAgICAgIHZhciBjeDtcbiAgICAgIHZhciBjeTtcbiAgICAgIHZhciBjejtcbiAgICAgIHZhciBsZW47XG4gICAgICB2YXIgaW52TGVuO1xuICAgICAgdmFyIG92ZXJsYXAgPSAwO1xuICAgICAgaWYgKHN4ID4gaHcpIHtcbiAgICAgICAgc3ggPSBodztcbiAgICAgIH0gZWxzZSBpZiAoc3ggPCAtaHcpIHtcbiAgICAgICAgc3ggPSAtaHc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvdmVybGFwID0gMTtcbiAgICAgIH1cbiAgICAgIGlmIChzeSA+IGhoKSB7XG4gICAgICAgIHN5ID0gaGg7XG4gICAgICB9IGVsc2UgaWYgKHN5IDwgLWhoKSB7XG4gICAgICAgIHN5ID0gLWhoO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb3ZlcmxhcCB8PSAyO1xuICAgICAgfVxuICAgICAgaWYgKHN6ID4gaGQpIHtcbiAgICAgICAgc3ogPSBoZDtcbiAgICAgIH0gZWxzZSBpZiAoc3ogPCAtaGQpIHtcbiAgICAgICAgc3ogPSAtaGQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvdmVybGFwIHw9IDQ7XG4gICAgICB9XG4gICAgICBpZiAob3ZlcmxhcCA9PSA3KSB7XG4gICAgICAgIC8vIGNlbnRlciBvZiBzcGhlcmUgaXMgaW4gdGhlIGJveFxuICAgICAgICBpZiAoc3ggPCAwKSB7XG4gICAgICAgICAgZHggPSBodyArIHN4O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGR4ID0gaHcgLSBzeDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc3kgPCAwKSB7XG4gICAgICAgICAgZHkgPSBoaCArIHN5O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGR5ID0gaGggLSBzeTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc3ogPCAwKSB7XG4gICAgICAgICAgZHogPSBoZCArIHN6O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGR6ID0gaGQgLSBzejtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZHggPCBkeSkge1xuICAgICAgICAgIGlmIChkeCA8IGR6KSB7XG4gICAgICAgICAgICBsZW4gPSBkeCAtIGh3O1xuICAgICAgICAgICAgaWYgKHN4IDwgMCkge1xuICAgICAgICAgICAgICBzeCA9IC1odztcbiAgICAgICAgICAgICAgZHggPSBEWzBdO1xuICAgICAgICAgICAgICBkeSA9IERbMV07XG4gICAgICAgICAgICAgIGR6ID0gRFsyXTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHN4ID0gaHc7XG4gICAgICAgICAgICAgIGR4ID0gLURbMF07XG4gICAgICAgICAgICAgIGR5ID0gLURbMV07XG4gICAgICAgICAgICAgIGR6ID0gLURbMl07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxlbiA9IGR6IC0gaGQ7XG4gICAgICAgICAgICBpZiAoc3ogPCAwKSB7XG4gICAgICAgICAgICAgIHN6ID0gLWhkO1xuICAgICAgICAgICAgICBkeCA9IERbNl07XG4gICAgICAgICAgICAgIGR5ID0gRFs3XTtcbiAgICAgICAgICAgICAgZHogPSBEWzhdO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgc3ogPSBoZDtcbiAgICAgICAgICAgICAgZHggPSAtRFs2XTtcbiAgICAgICAgICAgICAgZHkgPSAtRFs3XTtcbiAgICAgICAgICAgICAgZHogPSAtRFs4XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKGR5IDwgZHopIHtcbiAgICAgICAgICAgIGxlbiA9IGR5IC0gaGg7XG4gICAgICAgICAgICBpZiAoc3kgPCAwKSB7XG4gICAgICAgICAgICAgIHN5ID0gLWhoO1xuICAgICAgICAgICAgICBkeCA9IERbM107XG4gICAgICAgICAgICAgIGR5ID0gRFs0XTtcbiAgICAgICAgICAgICAgZHogPSBEWzVdO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgc3kgPSBoaDtcbiAgICAgICAgICAgICAgZHggPSAtRFszXTtcbiAgICAgICAgICAgICAgZHkgPSAtRFs0XTtcbiAgICAgICAgICAgICAgZHogPSAtRFs1XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGVuID0gZHogLSBoZDtcbiAgICAgICAgICAgIGlmIChzeiA8IDApIHtcbiAgICAgICAgICAgICAgc3ogPSAtaGQ7XG4gICAgICAgICAgICAgIGR4ID0gRFs2XTtcbiAgICAgICAgICAgICAgZHkgPSBEWzddO1xuICAgICAgICAgICAgICBkeiA9IERbOF07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBzeiA9IGhkO1xuICAgICAgICAgICAgICBkeCA9IC1EWzZdO1xuICAgICAgICAgICAgICBkeSA9IC1EWzddO1xuICAgICAgICAgICAgICBkeiA9IC1EWzhdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjeCA9IHBieCArIHN4ICogRFswXSArIHN5ICogRFszXSArIHN6ICogRFs2XTtcbiAgICAgICAgY3kgPSBwYnkgKyBzeCAqIERbMV0gKyBzeSAqIERbNF0gKyBzeiAqIERbN107XG4gICAgICAgIGN6ID0gcGJ6ICsgc3ggKiBEWzJdICsgc3kgKiBEWzVdICsgc3ogKiBEWzhdO1xuICAgICAgICBtYW5pZm9sZC5hZGRQb2ludChwc3ggKyByYWQgKiBkeCwgcHN5ICsgcmFkICogZHksIHBzeiArIHJhZCAqIGR6LCBkeCwgZHksIGR6LCBsZW4gLSByYWQsIHRoaXMuZmxpcCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjeCA9IHBieCArIHN4ICogRFswXSArIHN5ICogRFszXSArIHN6ICogRFs2XTtcbiAgICAgICAgY3kgPSBwYnkgKyBzeCAqIERbMV0gKyBzeSAqIERbNF0gKyBzeiAqIERbN107XG4gICAgICAgIGN6ID0gcGJ6ICsgc3ggKiBEWzJdICsgc3kgKiBEWzVdICsgc3ogKiBEWzhdO1xuICAgICAgICBkeCA9IGN4IC0gcHMueDtcbiAgICAgICAgZHkgPSBjeSAtIHBzLnk7XG4gICAgICAgIGR6ID0gY3ogLSBwcy56O1xuICAgICAgICBsZW4gPSBkeCAqIGR4ICsgZHkgKiBkeSArIGR6ICogZHo7XG4gICAgICAgIGlmIChsZW4gPiAwICYmIGxlbiA8IHJhZCAqIHJhZCkge1xuICAgICAgICAgIGxlbiA9IF9NYXRoLnNxcnQobGVuKTtcbiAgICAgICAgICBpbnZMZW4gPSAxIC8gbGVuO1xuICAgICAgICAgIGR4ICo9IGludkxlbjtcbiAgICAgICAgICBkeSAqPSBpbnZMZW47XG4gICAgICAgICAgZHogKj0gaW52TGVuO1xuICAgICAgICAgIG1hbmlmb2xkLmFkZFBvaW50KHBzeCArIHJhZCAqIGR4LCBwc3kgKyByYWQgKiBkeSwgcHN6ICsgcmFkICogZHosIGR4LCBkeSwgZHosIGxlbiAtIHJhZCwgdGhpcy5mbGlwKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgfVxuXG4gIH0pO1xuXG4gIGZ1bmN0aW9uIFNwaGVyZUN5bGluZGVyQ29sbGlzaW9uRGV0ZWN0b3IoZmxpcCkge1xuXG4gICAgQ29sbGlzaW9uRGV0ZWN0b3IuY2FsbCh0aGlzKTtcbiAgICB0aGlzLmZsaXAgPSBmbGlwO1xuXG4gIH1cbiAgU3BoZXJlQ3lsaW5kZXJDb2xsaXNpb25EZXRlY3Rvci5wcm90b3R5cGUgPSBPYmplY3QuYXNzaWduKE9iamVjdC5jcmVhdGUoQ29sbGlzaW9uRGV0ZWN0b3IucHJvdG90eXBlKSwge1xuXG4gICAgY29uc3RydWN0b3I6IFNwaGVyZUN5bGluZGVyQ29sbGlzaW9uRGV0ZWN0b3IsXG5cbiAgICBkZXRlY3RDb2xsaXNpb246IGZ1bmN0aW9uIChzaGFwZTEsIHNoYXBlMiwgbWFuaWZvbGQpIHtcblxuICAgICAgdmFyIHM7XG4gICAgICB2YXIgYztcbiAgICAgIGlmICh0aGlzLmZsaXApIHtcbiAgICAgICAgcyA9IHNoYXBlMjtcbiAgICAgICAgYyA9IHNoYXBlMTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHMgPSBzaGFwZTE7XG4gICAgICAgIGMgPSBzaGFwZTI7XG4gICAgICB9XG4gICAgICB2YXIgcHMgPSBzLnBvc2l0aW9uO1xuICAgICAgdmFyIHBzeCA9IHBzLng7XG4gICAgICB2YXIgcHN5ID0gcHMueTtcbiAgICAgIHZhciBwc3ogPSBwcy56O1xuICAgICAgdmFyIHBjID0gYy5wb3NpdGlvbjtcbiAgICAgIHZhciBwY3ggPSBwYy54O1xuICAgICAgdmFyIHBjeSA9IHBjLnk7XG4gICAgICB2YXIgcGN6ID0gcGMuejtcbiAgICAgIHZhciBkaXJ4ID0gYy5ub3JtYWxEaXJlY3Rpb24ueDtcbiAgICAgIHZhciBkaXJ5ID0gYy5ub3JtYWxEaXJlY3Rpb24ueTtcbiAgICAgIHZhciBkaXJ6ID0gYy5ub3JtYWxEaXJlY3Rpb24uejtcbiAgICAgIHZhciByYWRzID0gcy5yYWRpdXM7XG4gICAgICB2YXIgcmFkYyA9IGMucmFkaXVzO1xuICAgICAgdmFyIHJhZDIgPSByYWRzICsgcmFkYztcbiAgICAgIHZhciBoYWxmaCA9IGMuaGFsZkhlaWdodDtcbiAgICAgIHZhciBkeCA9IHBzeCAtIHBjeDtcbiAgICAgIHZhciBkeSA9IHBzeSAtIHBjeTtcbiAgICAgIHZhciBkeiA9IHBzeiAtIHBjejtcbiAgICAgIHZhciBkb3QgPSBkeCAqIGRpcnggKyBkeSAqIGRpcnkgKyBkeiAqIGRpcno7XG4gICAgICBpZiAoZG90IDwgLWhhbGZoIC0gcmFkcyB8fCBkb3QgPiBoYWxmaCArIHJhZHMpIHJldHVybjtcbiAgICAgIHZhciBjeCA9IHBjeCArIGRvdCAqIGRpcng7XG4gICAgICB2YXIgY3kgPSBwY3kgKyBkb3QgKiBkaXJ5O1xuICAgICAgdmFyIGN6ID0gcGN6ICsgZG90ICogZGlyejtcbiAgICAgIHZhciBkMnggPSBwc3ggLSBjeDtcbiAgICAgIHZhciBkMnkgPSBwc3kgLSBjeTtcbiAgICAgIHZhciBkMnogPSBwc3ogLSBjejtcbiAgICAgIHZhciBsZW4gPSBkMnggKiBkMnggKyBkMnkgKiBkMnkgKyBkMnogKiBkMno7XG4gICAgICBpZiAobGVuID4gcmFkMiAqIHJhZDIpIHJldHVybjtcbiAgICAgIGlmIChsZW4gPiByYWRjICogcmFkYykge1xuICAgICAgICBsZW4gPSByYWRjIC8gX01hdGguc3FydChsZW4pO1xuICAgICAgICBkMnggKj0gbGVuO1xuICAgICAgICBkMnkgKj0gbGVuO1xuICAgICAgICBkMnogKj0gbGVuO1xuICAgICAgfVxuICAgICAgaWYgKGRvdCA8IC1oYWxmaCkgZG90ID0gLWhhbGZoO1xuICAgICAgZWxzZSBpZiAoZG90ID4gaGFsZmgpIGRvdCA9IGhhbGZoO1xuICAgICAgY3ggPSBwY3ggKyBkb3QgKiBkaXJ4ICsgZDJ4O1xuICAgICAgY3kgPSBwY3kgKyBkb3QgKiBkaXJ5ICsgZDJ5O1xuICAgICAgY3ogPSBwY3ogKyBkb3QgKiBkaXJ6ICsgZDJ6O1xuICAgICAgZHggPSBjeCAtIHBzeDtcbiAgICAgIGR5ID0gY3kgLSBwc3k7XG4gICAgICBkeiA9IGN6IC0gcHN6O1xuICAgICAgbGVuID0gZHggKiBkeCArIGR5ICogZHkgKyBkeiAqIGR6O1xuICAgICAgdmFyIGludkxlbjtcbiAgICAgIGlmIChsZW4gPiAwICYmIGxlbiA8IHJhZHMgKiByYWRzKSB7XG4gICAgICAgIGxlbiA9IF9NYXRoLnNxcnQobGVuKTtcbiAgICAgICAgaW52TGVuID0gMSAvIGxlbjtcbiAgICAgICAgZHggKj0gaW52TGVuO1xuICAgICAgICBkeSAqPSBpbnZMZW47XG4gICAgICAgIGR6ICo9IGludkxlbjtcbiAgICAgICAgLy8vcmVzdWx0LmFkZENvbnRhY3RJbmZvKHBzeCtkeCpyYWRzLHBzeStkeSpyYWRzLHBzeitkeipyYWRzLGR4LGR5LGR6LGxlbi1yYWRzLHMsYywwLDAsZmFsc2UpO1xuICAgICAgICBtYW5pZm9sZC5hZGRQb2ludChwc3ggKyBkeCAqIHJhZHMsIHBzeSArIGR5ICogcmFkcywgcHN6ICsgZHogKiByYWRzLCBkeCwgZHksIGR6LCBsZW4gLSByYWRzLCB0aGlzLmZsaXApO1xuICAgICAgfVxuXG4gICAgfVxuXG5cbiAgfSk7XG5cbiAgLyoqXG4gICAqIEEgY29sbGlzaW9uIGRldGVjdG9yIHdoaWNoIGRldGVjdHMgY29sbGlzaW9ucyBiZXR3ZWVuIHR3byBzcGhlcmVzLlxuICAgKiBAYXV0aG9yIHNhaGFyYW5cbiAgICovXG5cbiAgZnVuY3Rpb24gU3BoZXJlU3BoZXJlQ29sbGlzaW9uRGV0ZWN0b3IoKSB7XG5cbiAgICBDb2xsaXNpb25EZXRlY3Rvci5jYWxsKHRoaXMpO1xuXG4gIH1cbiAgU3BoZXJlU3BoZXJlQ29sbGlzaW9uRGV0ZWN0b3IucHJvdG90eXBlID0gT2JqZWN0LmFzc2lnbihPYmplY3QuY3JlYXRlKENvbGxpc2lvbkRldGVjdG9yLnByb3RvdHlwZSksIHtcblxuICAgIGNvbnN0cnVjdG9yOiBTcGhlcmVTcGhlcmVDb2xsaXNpb25EZXRlY3RvcixcblxuICAgIGRldGVjdENvbGxpc2lvbjogZnVuY3Rpb24gKHNoYXBlMSwgc2hhcGUyLCBtYW5pZm9sZCkge1xuXG4gICAgICB2YXIgczEgPSBzaGFwZTE7XG4gICAgICB2YXIgczIgPSBzaGFwZTI7XG4gICAgICB2YXIgcDEgPSBzMS5wb3NpdGlvbjtcbiAgICAgIHZhciBwMiA9IHMyLnBvc2l0aW9uO1xuICAgICAgdmFyIGR4ID0gcDIueCAtIHAxLng7XG4gICAgICB2YXIgZHkgPSBwMi55IC0gcDEueTtcbiAgICAgIHZhciBkeiA9IHAyLnogLSBwMS56O1xuICAgICAgdmFyIGxlbiA9IGR4ICogZHggKyBkeSAqIGR5ICsgZHogKiBkejtcbiAgICAgIHZhciByMSA9IHMxLnJhZGl1cztcbiAgICAgIHZhciByMiA9IHMyLnJhZGl1cztcbiAgICAgIHZhciByYWQgPSByMSArIHIyO1xuICAgICAgaWYgKGxlbiA+IDAgJiYgbGVuIDwgcmFkICogcmFkKSB7XG4gICAgICAgIGxlbiA9IF9NYXRoLnNxcnQobGVuKTtcbiAgICAgICAgdmFyIGludkxlbiA9IDEgLyBsZW47XG4gICAgICAgIGR4ICo9IGludkxlbjtcbiAgICAgICAgZHkgKj0gaW52TGVuO1xuICAgICAgICBkeiAqPSBpbnZMZW47XG4gICAgICAgIG1hbmlmb2xkLmFkZFBvaW50KHAxLnggKyBkeCAqIHIxLCBwMS55ICsgZHkgKiByMSwgcDEueiArIGR6ICogcjEsIGR4LCBkeSwgZHosIGxlbiAtIHJhZCwgZmFsc2UpO1xuICAgICAgfVxuXG4gICAgfVxuXG4gIH0pO1xuXG4gIC8qKlxuICAgKiBBIGNvbGxpc2lvbiBkZXRlY3RvciB3aGljaCBkZXRlY3RzIGNvbGxpc2lvbnMgYmV0d2VlbiB0d28gc3BoZXJlcy5cbiAgICogQGF1dGhvciBzYWhhcmFuIFxuICAgKiBAYXV0aG9yIGxvLXRoXG4gICAqL1xuXG4gIGZ1bmN0aW9uIFNwaGVyZVBsYW5lQ29sbGlzaW9uRGV0ZWN0b3IoZmxpcCkge1xuXG4gICAgQ29sbGlzaW9uRGV0ZWN0b3IuY2FsbCh0aGlzKTtcblxuICAgIHRoaXMuZmxpcCA9IGZsaXA7XG5cbiAgICB0aGlzLm4gPSBuZXcgVmVjMygpO1xuICAgIHRoaXMucCA9IG5ldyBWZWMzKCk7XG5cbiAgfVxuICBTcGhlcmVQbGFuZUNvbGxpc2lvbkRldGVjdG9yLnByb3RvdHlwZSA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmNyZWF0ZShDb2xsaXNpb25EZXRlY3Rvci5wcm90b3R5cGUpLCB7XG5cbiAgICBjb25zdHJ1Y3RvcjogU3BoZXJlUGxhbmVDb2xsaXNpb25EZXRlY3RvcixcblxuICAgIGRldGVjdENvbGxpc2lvbjogZnVuY3Rpb24gKHNoYXBlMSwgc2hhcGUyLCBtYW5pZm9sZCkge1xuXG4gICAgICB2YXIgbiA9IHRoaXMubjtcbiAgICAgIHZhciBwID0gdGhpcy5wO1xuXG4gICAgICB2YXIgcyA9IHRoaXMuZmxpcCA/IHNoYXBlMiA6IHNoYXBlMTtcbiAgICAgIHZhciBwbiA9IHRoaXMuZmxpcCA/IHNoYXBlMSA6IHNoYXBlMjtcbiAgICAgIHZhciByYWQgPSBzLnJhZGl1cztcbiAgICAgIHZhciBsZW47XG5cbiAgICAgIG4uc3ViKHMucG9zaXRpb24sIHBuLnBvc2l0aW9uKTtcbiAgICAgIC8vdmFyIGggPSBfTWF0aC5kb3RWZWN0b3JzKCBwbi5ub3JtYWwsIG4gKTtcblxuICAgICAgbi54ICo9IHBuLm5vcm1hbC54Oy8vKyByYWQ7XG4gICAgICBuLnkgKj0gcG4ubm9ybWFsLnk7XG4gICAgICBuLnogKj0gcG4ubm9ybWFsLno7Ly8rIHJhZDtcblxuXG4gICAgICB2YXIgbGVuID0gbi5sZW5ndGhTcSgpO1xuXG4gICAgICBpZiAobGVuID4gMCAmJiBsZW4gPCByYWQgKiByYWQpIHsvLyYmIGggPiByYWQqcmFkICl7XG5cblxuICAgICAgICBsZW4gPSBfTWF0aC5zcXJ0KGxlbik7XG4gICAgICAgIC8vbGVuID0gX01hdGguc3FydCggaCApO1xuICAgICAgICBuLmNvcHkocG4ubm9ybWFsKS5uZWdhdGUoKTtcbiAgICAgICAgLy9uLnNjYWxlRXF1YWwoIDEvbGVuICk7XG5cbiAgICAgICAgLy8oMCwgLTEsIDApXG5cbiAgICAgICAgLy9uLm5vcm1hbGl6ZSgpO1xuICAgICAgICBwLmNvcHkocy5wb3NpdGlvbikuYWRkU2NhbGVkVmVjdG9yKG4sIHJhZCk7XG4gICAgICAgIG1hbmlmb2xkLmFkZFBvaW50VmVjKHAsIG4sIGxlbiAtIHJhZCwgdGhpcy5mbGlwKTtcblxuICAgICAgfVxuXG4gICAgfVxuXG4gIH0pO1xuXG4gIC8qKlxuICAgKiBBIGNvbGxpc2lvbiBkZXRlY3RvciB3aGljaCBkZXRlY3RzIGNvbGxpc2lvbnMgYmV0d2VlbiB0d28gc3BoZXJlcy5cbiAgICogQGF1dGhvciBzYWhhcmFuIFxuICAgKiBAYXV0aG9yIGxvLXRoXG4gICAqL1xuXG4gIGZ1bmN0aW9uIEJveFBsYW5lQ29sbGlzaW9uRGV0ZWN0b3IoZmxpcCkge1xuXG4gICAgQ29sbGlzaW9uRGV0ZWN0b3IuY2FsbCh0aGlzKTtcblxuICAgIHRoaXMuZmxpcCA9IGZsaXA7XG5cbiAgICB0aGlzLm4gPSBuZXcgVmVjMygpO1xuICAgIHRoaXMucCA9IG5ldyBWZWMzKCk7XG5cbiAgICB0aGlzLmRpeCA9IG5ldyBWZWMzKCk7XG4gICAgdGhpcy5kaXkgPSBuZXcgVmVjMygpO1xuICAgIHRoaXMuZGl6ID0gbmV3IFZlYzMoKTtcblxuICAgIHRoaXMuY2MgPSBuZXcgVmVjMygpO1xuICAgIHRoaXMuY2MyID0gbmV3IFZlYzMoKTtcblxuICB9XG4gIEJveFBsYW5lQ29sbGlzaW9uRGV0ZWN0b3IucHJvdG90eXBlID0gT2JqZWN0LmFzc2lnbihPYmplY3QuY3JlYXRlKENvbGxpc2lvbkRldGVjdG9yLnByb3RvdHlwZSksIHtcblxuICAgIGNvbnN0cnVjdG9yOiBCb3hQbGFuZUNvbGxpc2lvbkRldGVjdG9yLFxuXG4gICAgZGV0ZWN0Q29sbGlzaW9uOiBmdW5jdGlvbiAoc2hhcGUxLCBzaGFwZTIsIG1hbmlmb2xkKSB7XG5cbiAgICAgIHZhciBuID0gdGhpcy5uO1xuICAgICAgdmFyIHAgPSB0aGlzLnA7XG4gICAgICB2YXIgY2MgPSB0aGlzLmNjO1xuXG4gICAgICB2YXIgYiA9IHRoaXMuZmxpcCA/IHNoYXBlMiA6IHNoYXBlMTtcbiAgICAgIHZhciBwbiA9IHRoaXMuZmxpcCA/IHNoYXBlMSA6IHNoYXBlMjtcblxuICAgICAgdmFyIEQgPSBiLmRpbWVudGlvbnM7XG4gICAgICB2YXIgaHcgPSBiLmhhbGZXaWR0aDtcbiAgICAgIHZhciBoaCA9IGIuaGFsZkhlaWdodDtcbiAgICAgIHZhciBoZCA9IGIuaGFsZkRlcHRoO1xuICAgICAgdmFyIGxlbjtcbiAgICAgIHZhciBvdmVybGFwID0gMDtcblxuICAgICAgdGhpcy5kaXguc2V0KERbMF0sIERbMV0sIERbMl0pO1xuICAgICAgdGhpcy5kaXkuc2V0KERbM10sIERbNF0sIERbNV0pO1xuICAgICAgdGhpcy5kaXouc2V0KERbNl0sIERbN10sIERbOF0pO1xuXG4gICAgICBuLnN1YihiLnBvc2l0aW9uLCBwbi5wb3NpdGlvbik7XG5cbiAgICAgIG4ueCAqPSBwbi5ub3JtYWwueDsvLysgcmFkO1xuICAgICAgbi55ICo9IHBuLm5vcm1hbC55O1xuICAgICAgbi56ICo9IHBuLm5vcm1hbC56Oy8vKyByYWQ7XG5cbiAgICAgIGNjLnNldChcbiAgICAgICAgX01hdGguZG90VmVjdG9ycyh0aGlzLmRpeCwgbiksXG4gICAgICAgIF9NYXRoLmRvdFZlY3RvcnModGhpcy5kaXksIG4pLFxuICAgICAgICBfTWF0aC5kb3RWZWN0b3JzKHRoaXMuZGl6LCBuKVxuICAgICAgKTtcblxuXG4gICAgICBpZiAoY2MueCA+IGh3KSBjYy54ID0gaHc7XG4gICAgICBlbHNlIGlmIChjYy54IDwgLWh3KSBjYy54ID0gLWh3O1xuICAgICAgZWxzZSBvdmVybGFwID0gMTtcblxuICAgICAgaWYgKGNjLnkgPiBoaCkgY2MueSA9IGhoO1xuICAgICAgZWxzZSBpZiAoY2MueSA8IC1oaCkgY2MueSA9IC1oaDtcbiAgICAgIGVsc2Ugb3ZlcmxhcCB8PSAyO1xuXG4gICAgICBpZiAoY2MueiA+IGhkKSBjYy56ID0gaGQ7XG4gICAgICBlbHNlIGlmIChjYy56IDwgLWhkKSBjYy56ID0gLWhkO1xuICAgICAgZWxzZSBvdmVybGFwIHw9IDQ7XG5cblxuXG4gICAgICBpZiAob3ZlcmxhcCA9PT0gNykge1xuXG4gICAgICAgIC8vIGNlbnRlciBvZiBzcGhlcmUgaXMgaW4gdGhlIGJveFxuXG4gICAgICAgIG4uc2V0KFxuICAgICAgICAgIGNjLnggPCAwID8gaHcgKyBjYy54IDogaHcgLSBjYy54LFxuICAgICAgICAgIGNjLnkgPCAwID8gaGggKyBjYy55IDogaGggLSBjYy55LFxuICAgICAgICAgIGNjLnogPCAwID8gaGQgKyBjYy56IDogaGQgLSBjYy56XG4gICAgICAgICk7XG5cbiAgICAgICAgaWYgKG4ueCA8IG4ueSkge1xuICAgICAgICAgIGlmIChuLnggPCBuLnopIHtcbiAgICAgICAgICAgIGxlbiA9IG4ueCAtIGh3O1xuICAgICAgICAgICAgaWYgKGNjLnggPCAwKSB7XG4gICAgICAgICAgICAgIGNjLnggPSAtaHc7XG4gICAgICAgICAgICAgIG4uY29weSh0aGlzLmRpeCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBjYy54ID0gaHc7XG4gICAgICAgICAgICAgIG4uc3ViRXF1YWwodGhpcy5kaXgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZW4gPSBuLnogLSBoZDtcbiAgICAgICAgICAgIGlmIChjYy56IDwgMCkge1xuICAgICAgICAgICAgICBjYy56ID0gLWhkO1xuICAgICAgICAgICAgICBuLmNvcHkodGhpcy5kaXopO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgY2MueiA9IGhkO1xuICAgICAgICAgICAgICBuLnN1YkVxdWFsKHRoaXMuZGl6KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKG4ueSA8IG4ueikge1xuICAgICAgICAgICAgbGVuID0gbi55IC0gaGg7XG4gICAgICAgICAgICBpZiAoY2MueSA8IDApIHtcbiAgICAgICAgICAgICAgY2MueSA9IC1oaDtcbiAgICAgICAgICAgICAgbi5jb3B5KHRoaXMuZGl5KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGNjLnkgPSBoaDtcbiAgICAgICAgICAgICAgbi5zdWJFcXVhbCh0aGlzLmRpeSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxlbiA9IG4ueiAtIGhkO1xuICAgICAgICAgICAgaWYgKGNjLnogPCAwKSB7XG4gICAgICAgICAgICAgIGNjLnogPSAtaGQ7XG4gICAgICAgICAgICAgIG4uY29weSh0aGlzLmRpeik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBjYy56ID0gaGQ7XG4gICAgICAgICAgICAgIG4uc3ViRXF1YWwodGhpcy5kaXopO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHAuY29weShwbi5wb3NpdGlvbikuYWRkU2NhbGVkVmVjdG9yKG4sIDEpO1xuICAgICAgICBtYW5pZm9sZC5hZGRQb2ludFZlYyhwLCBuLCBsZW4sIHRoaXMuZmxpcCk7XG5cbiAgICAgIH1cblxuICAgIH1cblxuICB9KTtcblxuICAvKipcbiAgICogVGhlIGNsYXNzIG9mIHBoeXNpY2FsIGNvbXB1dGluZyB3b3JsZC5cbiAgICogWW91IG11c3QgYmUgYWRkZWQgdG8gdGhlIHdvcmxkIHBoeXNpY2FsIGFsbCBjb21wdXRpbmcgb2JqZWN0c1xuICAgKlxuICAgKiBAYXV0aG9yIHNhaGFyYW5cbiAgICogQGF1dGhvciBsby10aFxuICAgKi9cblxuICAvLyB0aW1lc3RlcCwgYnJvYWRwaGFzZSwgaXRlcmF0aW9ucywgd29ybGRzY2FsZSwgcmFuZG9tLCBzdGF0XG5cbiAgZnVuY3Rpb24gV29ybGQobykge1xuXG4gICAgaWYgKCEobyBpbnN0YW5jZW9mIE9iamVjdCkpIG8gPSB7fTtcblxuICAgIC8vIHRoaXMgd29ybGQgc2NhbGUgZGVmYXV0IGlzIDAuMSB0byAxMCBtZXRlcnMgbWF4IGZvciBkeW5hbWlxdWUgYm9keVxuICAgIHRoaXMuc2NhbGUgPSBvLndvcmxkc2NhbGUgfHwgMTtcbiAgICB0aGlzLmludlNjYWxlID0gMSAvIHRoaXMuc2NhbGU7XG5cbiAgICAvLyBUaGUgdGltZSBiZXR3ZWVuIGVhY2ggc3RlcFxuICAgIHRoaXMudGltZVN0ZXAgPSBvLnRpbWVzdGVwIHx8IDAuMDE2NjY7IC8vIDEvNjA7XG4gICAgdGhpcy50aW1lcmF0ZSA9IHRoaXMudGltZVN0ZXAgKiAxMDAwO1xuICAgIHRoaXMudGltZXIgPSBudWxsO1xuXG4gICAgdGhpcy5wcmVMb29wID0gbnVsbDsvL2Z1bmN0aW9uKCl7fTtcbiAgICB0aGlzLnBvc3RMb29wID0gbnVsbDsvL2Z1bmN0aW9uKCl7fTtcblxuICAgIC8vIFRoZSBudW1iZXIgb2YgaXRlcmF0aW9ucyBmb3IgY29uc3RyYWludCBzb2x2ZXJzLlxuICAgIHRoaXMubnVtSXRlcmF0aW9ucyA9IG8uaXRlcmF0aW9ucyB8fCA4O1xuXG4gICAgLy8gSXQgaXMgYSB3aWRlLWFyZWEgY29sbGlzaW9uIGp1ZGdtZW50IHRoYXQgaXMgdXNlZCBpbiBvcmRlciB0byByZWR1Y2UgYXMgbXVjaCBhcyBwb3NzaWJsZSBhIGRldGFpbGVkIGNvbGxpc2lvbiBqdWRnbWVudC5cbiAgICBzd2l0Y2ggKG8uYnJvYWRwaGFzZSB8fCAyKSB7XG4gICAgICBjYXNlIDE6IHRoaXMuYnJvYWRQaGFzZSA9IG5ldyBCcnV0ZUZvcmNlQnJvYWRQaGFzZSgpOyBicmVhaztcbiAgICAgIGNhc2UgMjogZGVmYXVsdDogdGhpcy5icm9hZFBoYXNlID0gbmV3IFNBUEJyb2FkUGhhc2UoKTsgYnJlYWs7XG4gICAgICBjYXNlIDM6IHRoaXMuYnJvYWRQaGFzZSA9IG5ldyBEQlZUQnJvYWRQaGFzZSgpOyBicmVhaztcbiAgICB9XG5cbiAgICB0aGlzLkJ0eXBlcyA9IFsnTm9uZScsICdCcnV0ZUZvcmNlJywgJ1N3ZWVwICYgUHJ1bmUnLCAnQm91bmRpbmcgVm9sdW1lIFRyZWUnXTtcbiAgICB0aGlzLmJyb2FkUGhhc2VUeXBlID0gdGhpcy5CdHlwZXNbby5icm9hZHBoYXNlIHx8IDJdO1xuXG4gICAgLy8gVGhpcyBpcyB0aGUgZGV0YWlsZWQgaW5mb3JtYXRpb24gb2YgdGhlIHBlcmZvcm1hbmNlLlxuICAgIHRoaXMucGVyZm9ybWFuY2UgPSBudWxsO1xuICAgIHRoaXMuaXNTdGF0ID0gby5pbmZvID09PSB1bmRlZmluZWQgPyBmYWxzZSA6IG8uaW5mbztcbiAgICBpZiAodGhpcy5pc1N0YXQpIHRoaXMucGVyZm9ybWFuY2UgPSBuZXcgSW5mb0Rpc3BsYXkodGhpcyk7XG5cbiAgICAvKipcbiAgICAgKiBXaGV0aGVyIHRoZSBjb25zdHJhaW50cyByYW5kb21pemVyIGlzIGVuYWJsZWQgb3Igbm90LlxuICAgICAqXG4gICAgICogQHByb3BlcnR5IGVuYWJsZVJhbmRvbWl6ZXJcbiAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICAgKi9cbiAgICB0aGlzLmVuYWJsZVJhbmRvbWl6ZXIgPSBvLnJhbmRvbSAhPT0gdW5kZWZpbmVkID8gby5yYW5kb20gOiB0cnVlO1xuXG4gICAgLy8gVGhlIHJpZ2lkIGJvZHkgbGlzdFxuICAgIHRoaXMucmlnaWRCb2RpZXMgPSBudWxsO1xuICAgIC8vIG51bWJlciBvZiByaWdpZCBib2R5XG4gICAgdGhpcy5udW1SaWdpZEJvZGllcyA9IDA7XG4gICAgLy8gVGhlIGNvbnRhY3QgbGlzdFxuICAgIHRoaXMuY29udGFjdHMgPSBudWxsO1xuICAgIHRoaXMudW51c2VkQ29udGFjdHMgPSBudWxsO1xuICAgIC8vIFRoZSBudW1iZXIgb2YgY29udGFjdFxuICAgIHRoaXMubnVtQ29udGFjdHMgPSAwO1xuICAgIC8vIFRoZSBudW1iZXIgb2YgY29udGFjdCBwb2ludHNcbiAgICB0aGlzLm51bUNvbnRhY3RQb2ludHMgPSAwO1xuICAgIC8vICBUaGUgam9pbnQgbGlzdFxuICAgIHRoaXMuam9pbnRzID0gbnVsbDtcbiAgICAvLyBUaGUgbnVtYmVyIG9mIGpvaW50cy5cbiAgICB0aGlzLm51bUpvaW50cyA9IDA7XG4gICAgLy8gVGhlIG51bWJlciBvZiBzaW11bGF0aW9uIGlzbGFuZHMuXG4gICAgdGhpcy5udW1Jc2xhbmRzID0gMDtcblxuXG4gICAgLy8gVGhlIGdyYXZpdHkgaW4gdGhlIHdvcmxkLlxuICAgIHRoaXMuZ3Jhdml0eSA9IG5ldyBWZWMzKDAsIC05LjgsIDApO1xuICAgIGlmIChvLmdyYXZpdHkgIT09IHVuZGVmaW5lZCkgdGhpcy5ncmF2aXR5LmZyb21BcnJheShvLmdyYXZpdHkpO1xuXG5cblxuICAgIHZhciBudW1TaGFwZVR5cGVzID0gNTsvLzQ7Ly8zO1xuICAgIHRoaXMuZGV0ZWN0b3JzID0gW107XG4gICAgdGhpcy5kZXRlY3RvcnMubGVuZ3RoID0gbnVtU2hhcGVUeXBlcztcbiAgICB2YXIgaSA9IG51bVNoYXBlVHlwZXM7XG4gICAgd2hpbGUgKGktLSkge1xuICAgICAgdGhpcy5kZXRlY3RvcnNbaV0gPSBbXTtcbiAgICAgIHRoaXMuZGV0ZWN0b3JzW2ldLmxlbmd0aCA9IG51bVNoYXBlVHlwZXM7XG4gICAgfVxuXG4gICAgdGhpcy5kZXRlY3RvcnNbU0hBUEVfU1BIRVJFXVtTSEFQRV9TUEhFUkVdID0gbmV3IFNwaGVyZVNwaGVyZUNvbGxpc2lvbkRldGVjdG9yKCk7XG4gICAgdGhpcy5kZXRlY3RvcnNbU0hBUEVfU1BIRVJFXVtTSEFQRV9CT1hdID0gbmV3IFNwaGVyZUJveENvbGxpc2lvbkRldGVjdG9yKGZhbHNlKTtcbiAgICB0aGlzLmRldGVjdG9yc1tTSEFQRV9CT1hdW1NIQVBFX1NQSEVSRV0gPSBuZXcgU3BoZXJlQm94Q29sbGlzaW9uRGV0ZWN0b3IodHJ1ZSk7XG4gICAgdGhpcy5kZXRlY3RvcnNbU0hBUEVfQk9YXVtTSEFQRV9CT1hdID0gbmV3IEJveEJveENvbGxpc2lvbkRldGVjdG9yKCk7XG5cbiAgICAvLyBDWUxJTkRFUiBhZGRcbiAgICB0aGlzLmRldGVjdG9yc1tTSEFQRV9DWUxJTkRFUl1bU0hBUEVfQ1lMSU5ERVJdID0gbmV3IEN5bGluZGVyQ3lsaW5kZXJDb2xsaXNpb25EZXRlY3RvcigpO1xuXG4gICAgdGhpcy5kZXRlY3RvcnNbU0hBUEVfQ1lMSU5ERVJdW1NIQVBFX0JPWF0gPSBuZXcgQm94Q3lsaW5kZXJDb2xsaXNpb25EZXRlY3Rvcih0cnVlKTtcbiAgICB0aGlzLmRldGVjdG9yc1tTSEFQRV9CT1hdW1NIQVBFX0NZTElOREVSXSA9IG5ldyBCb3hDeWxpbmRlckNvbGxpc2lvbkRldGVjdG9yKGZhbHNlKTtcblxuICAgIHRoaXMuZGV0ZWN0b3JzW1NIQVBFX0NZTElOREVSXVtTSEFQRV9TUEhFUkVdID0gbmV3IFNwaGVyZUN5bGluZGVyQ29sbGlzaW9uRGV0ZWN0b3IodHJ1ZSk7XG4gICAgdGhpcy5kZXRlY3RvcnNbU0hBUEVfU1BIRVJFXVtTSEFQRV9DWUxJTkRFUl0gPSBuZXcgU3BoZXJlQ3lsaW5kZXJDb2xsaXNpb25EZXRlY3RvcihmYWxzZSk7XG5cbiAgICAvLyBQTEFORSBhZGRcblxuICAgIHRoaXMuZGV0ZWN0b3JzW1NIQVBFX1BMQU5FXVtTSEFQRV9TUEhFUkVdID0gbmV3IFNwaGVyZVBsYW5lQ29sbGlzaW9uRGV0ZWN0b3IodHJ1ZSk7XG4gICAgdGhpcy5kZXRlY3RvcnNbU0hBUEVfU1BIRVJFXVtTSEFQRV9QTEFORV0gPSBuZXcgU3BoZXJlUGxhbmVDb2xsaXNpb25EZXRlY3RvcihmYWxzZSk7XG5cbiAgICB0aGlzLmRldGVjdG9yc1tTSEFQRV9QTEFORV1bU0hBUEVfQk9YXSA9IG5ldyBCb3hQbGFuZUNvbGxpc2lvbkRldGVjdG9yKHRydWUpO1xuICAgIHRoaXMuZGV0ZWN0b3JzW1NIQVBFX0JPWF1bU0hBUEVfUExBTkVdID0gbmV3IEJveFBsYW5lQ29sbGlzaW9uRGV0ZWN0b3IoZmFsc2UpO1xuXG4gICAgLy8gVEVUUkEgYWRkXG4gICAgLy90aGlzLmRldGVjdG9yc1tTSEFQRV9URVRSQV1bU0hBUEVfVEVUUkFdID0gbmV3IFRldHJhVGV0cmFDb2xsaXNpb25EZXRlY3RvcigpO1xuXG5cbiAgICB0aGlzLnJhbmRYID0gNjU1MzU7XG4gICAgdGhpcy5yYW5kQSA9IDk4NzY1O1xuICAgIHRoaXMucmFuZEIgPSAxMjM0NTY3ODk7XG5cbiAgICB0aGlzLmlzbGFuZFJpZ2lkQm9kaWVzID0gW107XG4gICAgdGhpcy5pc2xhbmRTdGFjayA9IFtdO1xuICAgIHRoaXMuaXNsYW5kQ29uc3RyYWludHMgPSBbXTtcblxuICB9XG5cbiAgT2JqZWN0LmFzc2lnbihXb3JsZC5wcm90b3R5cGUsIHtcblxuICAgIFdvcmxkOiB0cnVlLFxuXG4gICAgcGxheTogZnVuY3Rpb24gKCkge1xuXG4gICAgICBpZiAodGhpcy50aW1lciAhPT0gbnVsbCkgcmV0dXJuO1xuXG4gICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgdGhpcy50aW1lciA9IHNldEludGVydmFsKGZ1bmN0aW9uICgpIHsgX3RoaXMuc3RlcCgpOyB9LCB0aGlzLnRpbWVyYXRlKTtcbiAgICAgIC8vdGhpcy50aW1lciA9IHNldEludGVydmFsKCB0aGlzLmxvb3AuYmluZCh0aGlzKSAsIHRoaXMudGltZXJhdGUgKTtcblxuICAgIH0sXG5cbiAgICBzdG9wOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIGlmICh0aGlzLnRpbWVyID09PSBudWxsKSByZXR1cm47XG5cbiAgICAgIGNsZWFySW50ZXJ2YWwodGhpcy50aW1lcik7XG4gICAgICB0aGlzLnRpbWVyID0gbnVsbDtcblxuICAgIH0sXG5cbiAgICBzZXRHcmF2aXR5OiBmdW5jdGlvbiAoYXIpIHtcblxuICAgICAgdGhpcy5ncmF2aXR5LmZyb21BcnJheShhcik7XG5cbiAgICB9LFxuXG4gICAgZ2V0SW5mbzogZnVuY3Rpb24gKCkge1xuXG4gICAgICByZXR1cm4gdGhpcy5pc1N0YXQgPyB0aGlzLnBlcmZvcm1hbmNlLnNob3coKSA6ICcnO1xuXG4gICAgfSxcblxuICAgIC8vIFJlc2V0IHRoZSB3b3JsZCBhbmQgcmVtb3ZlIGFsbCByaWdpZCBib2RpZXMsIHNoYXBlcywgam9pbnRzIGFuZCBhbnkgb2JqZWN0IGZyb20gdGhlIHdvcmxkLlxuICAgIGNsZWFyOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHRoaXMuc3RvcCgpO1xuICAgICAgdGhpcy5wcmVMb29wID0gbnVsbDtcbiAgICAgIHRoaXMucG9zdExvb3AgPSBudWxsO1xuXG4gICAgICB0aGlzLnJhbmRYID0gNjU1MzU7XG5cbiAgICAgIHdoaWxlICh0aGlzLmpvaW50cyAhPT0gbnVsbCkge1xuICAgICAgICB0aGlzLnJlbW92ZUpvaW50KHRoaXMuam9pbnRzKTtcbiAgICAgIH1cbiAgICAgIHdoaWxlICh0aGlzLmNvbnRhY3RzICE9PSBudWxsKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlQ29udGFjdCh0aGlzLmNvbnRhY3RzKTtcbiAgICAgIH1cbiAgICAgIHdoaWxlICh0aGlzLnJpZ2lkQm9kaWVzICE9PSBudWxsKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlUmlnaWRCb2R5KHRoaXMucmlnaWRCb2RpZXMpO1xuICAgICAgfVxuXG4gICAgfSxcbiAgICAvKipcbiAgICAqIEknbGwgYWRkIGEgcmlnaWQgYm9keSB0byB0aGUgd29ybGQuXG4gICAgKiBSaWdpZCBib2R5IHRoYXQgaGFzIGJlZW4gYWRkZWQgd2lsbCBiZSB0aGUgb3BlcmFuZHMgb2YgZWFjaCBzdGVwLlxuICAgICogQHBhcmFtICByaWdpZEJvZHkgIFJpZ2lkIGJvZHkgdGhhdCB5b3Ugd2FudCB0byBhZGRcbiAgICAqL1xuICAgIGFkZFJpZ2lkQm9keTogZnVuY3Rpb24gKHJpZ2lkQm9keSkge1xuXG4gICAgICBpZiAocmlnaWRCb2R5LnBhcmVudCkge1xuICAgICAgICBwcmludEVycm9yKFwiV29ybGRcIiwgXCJJdCBpcyBub3QgcG9zc2libGUgdG8gYmUgYWRkZWQgdG8gbW9yZSB0aGFuIG9uZSB3b3JsZCBvbmUgb2YgdGhlIHJpZ2lkIGJvZHlcIik7XG4gICAgICB9XG5cbiAgICAgIHJpZ2lkQm9keS5zZXRQYXJlbnQodGhpcyk7XG4gICAgICAvL3JpZ2lkQm9keS5hd2FrZSgpO1xuXG4gICAgICBmb3IgKHZhciBzaGFwZSA9IHJpZ2lkQm9keS5zaGFwZXM7IHNoYXBlICE9PSBudWxsOyBzaGFwZSA9IHNoYXBlLm5leHQpIHtcbiAgICAgICAgdGhpcy5hZGRTaGFwZShzaGFwZSk7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5yaWdpZEJvZGllcyAhPT0gbnVsbCkgKHRoaXMucmlnaWRCb2RpZXMucHJldiA9IHJpZ2lkQm9keSkubmV4dCA9IHRoaXMucmlnaWRCb2RpZXM7XG4gICAgICB0aGlzLnJpZ2lkQm9kaWVzID0gcmlnaWRCb2R5O1xuICAgICAgdGhpcy5udW1SaWdpZEJvZGllcysrO1xuXG4gICAgfSxcbiAgICAvKipcbiAgICAqIEkgd2lsbCByZW1vdmUgdGhlIHJpZ2lkIGJvZHkgZnJvbSB0aGUgd29ybGQuXG4gICAgKiBSaWdpZCBib2R5IHRoYXQgaGFzIGJlZW4gZGVsZXRlZCBpcyBleGNsdWRlZCBmcm9tIHRoZSBjYWxjdWxhdGlvbiBvbiBhIHN0ZXAtYnktc3RlcCBiYXNpcy5cbiAgICAqIEBwYXJhbSAgcmlnaWRCb2R5ICBSaWdpZCBib2R5IHRvIGJlIHJlbW92ZWRcbiAgICAqL1xuICAgIHJlbW92ZVJpZ2lkQm9keTogZnVuY3Rpb24gKHJpZ2lkQm9keSkge1xuXG4gICAgICB2YXIgcmVtb3ZlID0gcmlnaWRCb2R5O1xuICAgICAgaWYgKHJlbW92ZS5wYXJlbnQgIT09IHRoaXMpIHJldHVybjtcbiAgICAgIHJlbW92ZS5hd2FrZSgpO1xuICAgICAgdmFyIGpzID0gcmVtb3ZlLmpvaW50TGluaztcbiAgICAgIHdoaWxlIChqcyAhPSBudWxsKSB7XG4gICAgICAgIHZhciBqb2ludCA9IGpzLmpvaW50O1xuICAgICAgICBqcyA9IGpzLm5leHQ7XG4gICAgICAgIHRoaXMucmVtb3ZlSm9pbnQoam9pbnQpO1xuICAgICAgfVxuICAgICAgZm9yICh2YXIgc2hhcGUgPSByaWdpZEJvZHkuc2hhcGVzOyBzaGFwZSAhPT0gbnVsbDsgc2hhcGUgPSBzaGFwZS5uZXh0KSB7XG4gICAgICAgIHRoaXMucmVtb3ZlU2hhcGUoc2hhcGUpO1xuICAgICAgfVxuICAgICAgdmFyIHByZXYgPSByZW1vdmUucHJldjtcbiAgICAgIHZhciBuZXh0ID0gcmVtb3ZlLm5leHQ7XG4gICAgICBpZiAocHJldiAhPT0gbnVsbCkgcHJldi5uZXh0ID0gbmV4dDtcbiAgICAgIGlmIChuZXh0ICE9PSBudWxsKSBuZXh0LnByZXYgPSBwcmV2O1xuICAgICAgaWYgKHRoaXMucmlnaWRCb2RpZXMgPT0gcmVtb3ZlKSB0aGlzLnJpZ2lkQm9kaWVzID0gbmV4dDtcbiAgICAgIHJlbW92ZS5wcmV2ID0gbnVsbDtcbiAgICAgIHJlbW92ZS5uZXh0ID0gbnVsbDtcbiAgICAgIHJlbW92ZS5wYXJlbnQgPSBudWxsO1xuICAgICAgdGhpcy5udW1SaWdpZEJvZGllcy0tO1xuXG4gICAgfSxcblxuICAgIGdldEJ5TmFtZTogZnVuY3Rpb24gKG5hbWUpIHtcblxuICAgICAgdmFyIGJvZHkgPSB0aGlzLnJpZ2lkQm9kaWVzO1xuICAgICAgd2hpbGUgKGJvZHkgIT09IG51bGwpIHtcbiAgICAgICAgaWYgKGJvZHkubmFtZSA9PT0gbmFtZSkgcmV0dXJuIGJvZHk7XG4gICAgICAgIGJvZHkgPSBib2R5Lm5leHQ7XG4gICAgICB9XG5cbiAgICAgIHZhciBqb2ludCA9IHRoaXMuam9pbnRzO1xuICAgICAgd2hpbGUgKGpvaW50ICE9PSBudWxsKSB7XG4gICAgICAgIGlmIChqb2ludC5uYW1lID09PSBuYW1lKSByZXR1cm4gam9pbnQ7XG4gICAgICAgIGpvaW50ID0gam9pbnQubmV4dDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG51bGw7XG5cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgKiBJJ2xsIGFkZCBhIHNoYXBlIHRvIHRoZSB3b3JsZC4uXG4gICAgKiBBZGQgdG8gdGhlIHJpZ2lkIHdvcmxkLCBhbmQgaWYgeW91IGFkZCBhIHNoYXBlIHRvIGEgcmlnaWQgYm9keSB0aGF0IGhhcyBiZWVuIGFkZGVkIHRvIHRoZSB3b3JsZCxcbiAgICAqIFNoYXBlIHdpbGwgYmUgYWRkZWQgdG8gdGhlIHdvcmxkIGF1dG9tYXRpY2FsbHksIHBsZWFzZSBkbyBub3QgY2FsbCBmcm9tIG91dHNpZGUgdGhpcyBtZXRob2QuXG4gICAgKiBAcGFyYW0gIHNoYXBlICBTaGFwZSB5b3Ugd2FudCB0byBhZGRcbiAgICAqL1xuICAgIGFkZFNoYXBlOiBmdW5jdGlvbiAoc2hhcGUpIHtcblxuICAgICAgaWYgKCFzaGFwZS5wYXJlbnQgfHwgIXNoYXBlLnBhcmVudC5wYXJlbnQpIHtcbiAgICAgICAgcHJpbnRFcnJvcihcIldvcmxkXCIsIFwiSXQgaXMgbm90IHBvc3NpYmxlIHRvIGJlIGFkZGVkIGFsb25lIHRvIHNoYXBlIHdvcmxkXCIpO1xuICAgICAgfVxuXG4gICAgICBzaGFwZS5wcm94eSA9IHRoaXMuYnJvYWRQaGFzZS5jcmVhdGVQcm94eShzaGFwZSk7XG4gICAgICBzaGFwZS51cGRhdGVQcm94eSgpO1xuICAgICAgdGhpcy5icm9hZFBoYXNlLmFkZFByb3h5KHNoYXBlLnByb3h5KTtcblxuICAgIH0sXG5cbiAgICAvKipcbiAgICAqIEkgd2lsbCByZW1vdmUgdGhlIHNoYXBlIGZyb20gdGhlIHdvcmxkLlxuICAgICogQWRkIHRvIHRoZSByaWdpZCB3b3JsZCwgYW5kIGlmIHlvdSBhZGQgYSBzaGFwZSB0byBhIHJpZ2lkIGJvZHkgdGhhdCBoYXMgYmVlbiBhZGRlZCB0byB0aGUgd29ybGQsXG4gICAgKiBTaGFwZSB3aWxsIGJlIGFkZGVkIHRvIHRoZSB3b3JsZCBhdXRvbWF0aWNhbGx5LCBwbGVhc2UgZG8gbm90IGNhbGwgZnJvbSBvdXRzaWRlIHRoaXMgbWV0aG9kLlxuICAgICogQHBhcmFtICBzaGFwZSAgU2hhcGUgeW91IHdhbnQgdG8gZGVsZXRlXG4gICAgKi9cbiAgICByZW1vdmVTaGFwZTogZnVuY3Rpb24gKHNoYXBlKSB7XG5cbiAgICAgIHRoaXMuYnJvYWRQaGFzZS5yZW1vdmVQcm94eShzaGFwZS5wcm94eSk7XG4gICAgICBzaGFwZS5wcm94eSA9IG51bGw7XG5cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgKiBJJ2xsIGFkZCBhIGpvaW50IHRvIHRoZSB3b3JsZC5cbiAgICAqIEpvaW50IHRoYXQgaGFzIGJlZW4gYWRkZWQgd2lsbCBiZSB0aGUgb3BlcmFuZHMgb2YgZWFjaCBzdGVwLlxuICAgICogQHBhcmFtICBzaGFwZSBKb2ludCB0byBiZSBhZGRlZFxuICAgICovXG4gICAgYWRkSm9pbnQ6IGZ1bmN0aW9uIChqb2ludCkge1xuXG4gICAgICBpZiAoam9pbnQucGFyZW50KSB7XG4gICAgICAgIHByaW50RXJyb3IoXCJXb3JsZFwiLCBcIkl0IGlzIG5vdCBwb3NzaWJsZSB0byBiZSBhZGRlZCB0byBtb3JlIHRoYW4gb25lIHdvcmxkIG9uZSBvZiB0aGUgam9pbnRcIik7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5qb2ludHMgIT0gbnVsbCkgKHRoaXMuam9pbnRzLnByZXYgPSBqb2ludCkubmV4dCA9IHRoaXMuam9pbnRzO1xuICAgICAgdGhpcy5qb2ludHMgPSBqb2ludDtcbiAgICAgIGpvaW50LnNldFBhcmVudCh0aGlzKTtcbiAgICAgIHRoaXMubnVtSm9pbnRzKys7XG4gICAgICBqb2ludC5hd2FrZSgpO1xuICAgICAgam9pbnQuYXR0YWNoKCk7XG5cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgKiBJIHdpbGwgcmVtb3ZlIHRoZSBqb2ludCBmcm9tIHRoZSB3b3JsZC5cbiAgICAqIEpvaW50IHRoYXQgaGFzIGJlZW4gYWRkZWQgd2lsbCBiZSB0aGUgb3BlcmFuZHMgb2YgZWFjaCBzdGVwLlxuICAgICogQHBhcmFtICBzaGFwZSBKb2ludCB0byBiZSBkZWxldGVkXG4gICAgKi9cbiAgICByZW1vdmVKb2ludDogZnVuY3Rpb24gKGpvaW50KSB7XG5cbiAgICAgIHZhciByZW1vdmUgPSBqb2ludDtcbiAgICAgIHZhciBwcmV2ID0gcmVtb3ZlLnByZXY7XG4gICAgICB2YXIgbmV4dCA9IHJlbW92ZS5uZXh0O1xuICAgICAgaWYgKHByZXYgIT09IG51bGwpIHByZXYubmV4dCA9IG5leHQ7XG4gICAgICBpZiAobmV4dCAhPT0gbnVsbCkgbmV4dC5wcmV2ID0gcHJldjtcbiAgICAgIGlmICh0aGlzLmpvaW50cyA9PSByZW1vdmUpIHRoaXMuam9pbnRzID0gbmV4dDtcbiAgICAgIHJlbW92ZS5wcmV2ID0gbnVsbDtcbiAgICAgIHJlbW92ZS5uZXh0ID0gbnVsbDtcbiAgICAgIHRoaXMubnVtSm9pbnRzLS07XG4gICAgICByZW1vdmUuYXdha2UoKTtcbiAgICAgIHJlbW92ZS5kZXRhY2goKTtcbiAgICAgIHJlbW92ZS5wYXJlbnQgPSBudWxsO1xuXG4gICAgfSxcblxuICAgIGFkZENvbnRhY3Q6IGZ1bmN0aW9uIChzMSwgczIpIHtcblxuICAgICAgdmFyIG5ld0NvbnRhY3Q7XG4gICAgICBpZiAodGhpcy51bnVzZWRDb250YWN0cyAhPT0gbnVsbCkge1xuICAgICAgICBuZXdDb250YWN0ID0gdGhpcy51bnVzZWRDb250YWN0cztcbiAgICAgICAgdGhpcy51bnVzZWRDb250YWN0cyA9IHRoaXMudW51c2VkQ29udGFjdHMubmV4dDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5ld0NvbnRhY3QgPSBuZXcgQ29udGFjdCgpO1xuICAgICAgfVxuICAgICAgbmV3Q29udGFjdC5hdHRhY2goczEsIHMyKTtcbiAgICAgIG5ld0NvbnRhY3QuZGV0ZWN0b3IgPSB0aGlzLmRldGVjdG9yc1tzMS50eXBlXVtzMi50eXBlXTtcbiAgICAgIGlmICh0aGlzLmNvbnRhY3RzKSAodGhpcy5jb250YWN0cy5wcmV2ID0gbmV3Q29udGFjdCkubmV4dCA9IHRoaXMuY29udGFjdHM7XG4gICAgICB0aGlzLmNvbnRhY3RzID0gbmV3Q29udGFjdDtcbiAgICAgIHRoaXMubnVtQ29udGFjdHMrKztcblxuICAgIH0sXG5cbiAgICByZW1vdmVDb250YWN0OiBmdW5jdGlvbiAoY29udGFjdCkge1xuXG4gICAgICB2YXIgcHJldiA9IGNvbnRhY3QucHJldjtcbiAgICAgIHZhciBuZXh0ID0gY29udGFjdC5uZXh0O1xuICAgICAgaWYgKG5leHQpIG5leHQucHJldiA9IHByZXY7XG4gICAgICBpZiAocHJldikgcHJldi5uZXh0ID0gbmV4dDtcbiAgICAgIGlmICh0aGlzLmNvbnRhY3RzID09IGNvbnRhY3QpIHRoaXMuY29udGFjdHMgPSBuZXh0O1xuICAgICAgY29udGFjdC5wcmV2ID0gbnVsbDtcbiAgICAgIGNvbnRhY3QubmV4dCA9IG51bGw7XG4gICAgICBjb250YWN0LmRldGFjaCgpO1xuICAgICAgY29udGFjdC5uZXh0ID0gdGhpcy51bnVzZWRDb250YWN0cztcbiAgICAgIHRoaXMudW51c2VkQ29udGFjdHMgPSBjb250YWN0O1xuICAgICAgdGhpcy5udW1Db250YWN0cy0tO1xuXG4gICAgfSxcblxuICAgIGdldENvbnRhY3Q6IGZ1bmN0aW9uIChiMSwgYjIpIHtcblxuICAgICAgYjEgPSBiMS5jb25zdHJ1Y3RvciA9PT0gUmlnaWRCb2R5ID8gYjEubmFtZSA6IGIxO1xuICAgICAgYjIgPSBiMi5jb25zdHJ1Y3RvciA9PT0gUmlnaWRCb2R5ID8gYjIubmFtZSA6IGIyO1xuXG4gICAgICB2YXIgbjEsIG4yO1xuICAgICAgdmFyIGNvbnRhY3QgPSB0aGlzLmNvbnRhY3RzO1xuICAgICAgd2hpbGUgKGNvbnRhY3QgIT09IG51bGwpIHtcbiAgICAgICAgbjEgPSBjb250YWN0LmJvZHkxLm5hbWU7XG4gICAgICAgIG4yID0gY29udGFjdC5ib2R5Mi5uYW1lO1xuICAgICAgICBpZiAoKG4xID09PSBiMSAmJiBuMiA9PT0gYjIpIHx8IChuMiA9PT0gYjEgJiYgbjEgPT09IGIyKSkgeyBpZiAoY29udGFjdC50b3VjaGluZykgcmV0dXJuIGNvbnRhY3Q7IGVsc2UgcmV0dXJuIG51bGw7IH1cbiAgICAgICAgZWxzZSBjb250YWN0ID0gY29udGFjdC5uZXh0O1xuICAgICAgfVxuICAgICAgcmV0dXJuIG51bGw7XG5cbiAgICB9LFxuXG4gICAgY2hlY2tDb250YWN0OiBmdW5jdGlvbiAobmFtZTEsIG5hbWUyKSB7XG5cbiAgICAgIHZhciBuMSwgbjI7XG4gICAgICB2YXIgY29udGFjdCA9IHRoaXMuY29udGFjdHM7XG4gICAgICB3aGlsZSAoY29udGFjdCAhPT0gbnVsbCkge1xuICAgICAgICBuMSA9IGNvbnRhY3QuYm9keTEubmFtZSB8fCAnICc7XG4gICAgICAgIG4yID0gY29udGFjdC5ib2R5Mi5uYW1lIHx8ICcgJztcbiAgICAgICAgaWYgKChuMSA9PSBuYW1lMSAmJiBuMiA9PSBuYW1lMikgfHwgKG4yID09IG5hbWUxICYmIG4xID09IG5hbWUyKSkgeyBpZiAoY29udGFjdC50b3VjaGluZykgcmV0dXJuIHRydWU7IGVsc2UgcmV0dXJuIGZhbHNlOyB9XG4gICAgICAgIGVsc2UgY29udGFjdCA9IGNvbnRhY3QubmV4dDtcbiAgICAgIH1cbiAgICAgIC8vcmV0dXJuIGZhbHNlO1xuXG4gICAgfSxcblxuICAgIGNhbGxTbGVlcDogZnVuY3Rpb24gKGJvZHkpIHtcblxuICAgICAgaWYgKCFib2R5LmFsbG93U2xlZXApIHJldHVybiBmYWxzZTtcbiAgICAgIGlmIChib2R5LmxpbmVhclZlbG9jaXR5Lmxlbmd0aFNxKCkgPiAwLjA0KSByZXR1cm4gZmFsc2U7XG4gICAgICBpZiAoYm9keS5hbmd1bGFyVmVsb2NpdHkubGVuZ3RoU3EoKSA+IDAuMjUpIHJldHVybiBmYWxzZTtcbiAgICAgIHJldHVybiB0cnVlO1xuXG4gICAgfSxcblxuICAgIC8qKlxuICAgICogSSB3aWxsIHByb2NlZWQgb25seSB0aW1lIHN0ZXAgc2Vjb25kcyB0aW1lIG9mIFdvcmxkLlxuICAgICovXG4gICAgc3RlcDogZnVuY3Rpb24gKCkge1xuXG4gICAgICB2YXIgc3RhdCA9IHRoaXMuaXNTdGF0O1xuXG4gICAgICBpZiAoc3RhdCkgdGhpcy5wZXJmb3JtYW5jZS5zZXRUaW1lKDApO1xuXG4gICAgICB2YXIgYm9keSA9IHRoaXMucmlnaWRCb2RpZXM7XG5cbiAgICAgIHdoaWxlIChib2R5ICE9PSBudWxsKSB7XG5cbiAgICAgICAgYm9keS5hZGRlZFRvSXNsYW5kID0gZmFsc2U7XG5cbiAgICAgICAgaWYgKGJvZHkuc2xlZXBpbmcpIGJvZHkudGVzdFdha2VVcCgpO1xuXG4gICAgICAgIGJvZHkgPSBib2R5Lm5leHQ7XG5cbiAgICAgIH1cblxuXG5cbiAgICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAvLyAgIFVQREFURSBCUk9BRFBIQVNFIENPTlRBQ1RcbiAgICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgICAgIGlmIChzdGF0KSB0aGlzLnBlcmZvcm1hbmNlLnNldFRpbWUoMSk7XG5cbiAgICAgIHRoaXMuYnJvYWRQaGFzZS5kZXRlY3RQYWlycygpO1xuXG4gICAgICB2YXIgcGFpcnMgPSB0aGlzLmJyb2FkUGhhc2UucGFpcnM7XG5cbiAgICAgIHZhciBpID0gdGhpcy5icm9hZFBoYXNlLm51bVBhaXJzO1xuICAgICAgLy9kb3tcbiAgICAgIHdoaWxlIChpLS0pIHtcbiAgICAgICAgLy9mb3IodmFyIGk9MCwgbD1udW1QYWlyczsgaTxsOyBpKyspe1xuICAgICAgICB2YXIgcGFpciA9IHBhaXJzW2ldO1xuICAgICAgICB2YXIgczE7XG4gICAgICAgIHZhciBzMjtcbiAgICAgICAgaWYgKHBhaXIuc2hhcGUxLmlkIDwgcGFpci5zaGFwZTIuaWQpIHtcbiAgICAgICAgICBzMSA9IHBhaXIuc2hhcGUxO1xuICAgICAgICAgIHMyID0gcGFpci5zaGFwZTI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgczEgPSBwYWlyLnNoYXBlMjtcbiAgICAgICAgICBzMiA9IHBhaXIuc2hhcGUxO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGxpbms7XG4gICAgICAgIGlmIChzMS5udW1Db250YWN0cyA8IHMyLm51bUNvbnRhY3RzKSBsaW5rID0gczEuY29udGFjdExpbms7XG4gICAgICAgIGVsc2UgbGluayA9IHMyLmNvbnRhY3RMaW5rO1xuXG4gICAgICAgIHZhciBleGlzdHMgPSBmYWxzZTtcbiAgICAgICAgd2hpbGUgKGxpbmspIHtcbiAgICAgICAgICB2YXIgY29udGFjdCA9IGxpbmsuY29udGFjdDtcbiAgICAgICAgICBpZiAoY29udGFjdC5zaGFwZTEgPT0gczEgJiYgY29udGFjdC5zaGFwZTIgPT0gczIpIHtcbiAgICAgICAgICAgIGNvbnRhY3QucGVyc2lzdGluZyA9IHRydWU7XG4gICAgICAgICAgICBleGlzdHMgPSB0cnVlOy8vIGNvbnRhY3QgYWxyZWFkeSBleGlzdHNcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgICBsaW5rID0gbGluay5uZXh0O1xuICAgICAgICB9XG4gICAgICAgIGlmICghZXhpc3RzKSB7XG4gICAgICAgICAgdGhpcy5hZGRDb250YWN0KHMxLCBzMik7XG4gICAgICAgIH1cbiAgICAgIH0vLyB3aGlsZShpLS0gPjApO1xuXG4gICAgICBpZiAoc3RhdCkgdGhpcy5wZXJmb3JtYW5jZS5jYWxjQnJvYWRQaGFzZSgpO1xuXG4gICAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgLy8gICBVUERBVEUgTkFSUk9XUEhBU0UgQ09OVEFDVFxuICAgICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAgICAgLy8gdXBkYXRlICYgbmFycm93IHBoYXNlXG4gICAgICB0aGlzLm51bUNvbnRhY3RQb2ludHMgPSAwO1xuICAgICAgY29udGFjdCA9IHRoaXMuY29udGFjdHM7XG4gICAgICB3aGlsZSAoY29udGFjdCAhPT0gbnVsbCkge1xuICAgICAgICBpZiAoIWNvbnRhY3QucGVyc2lzdGluZykge1xuICAgICAgICAgIGlmIChjb250YWN0LnNoYXBlMS5hYWJiLmludGVyc2VjdFRlc3QoY29udGFjdC5zaGFwZTIuYWFiYikpIHtcbiAgICAgICAgICAgIC8qdmFyIGFhYmIxPWNvbnRhY3Quc2hhcGUxLmFhYmI7XG4gICAgICAgICAgICB2YXIgYWFiYjI9Y29udGFjdC5zaGFwZTIuYWFiYjtcbiAgICAgICAgICAgIGlmKFxuICAgICAgICAgICAgICBhYWJiMS5taW5YPmFhYmIyLm1heFggfHwgYWFiYjEubWF4WDxhYWJiMi5taW5YIHx8XG4gICAgICAgICAgICAgIGFhYmIxLm1pblk+YWFiYjIubWF4WSB8fCBhYWJiMS5tYXhZPGFhYmIyLm1pblkgfHxcbiAgICAgICAgICAgICAgYWFiYjEubWluWj5hYWJiMi5tYXhaIHx8IGFhYmIxLm1heFo8YWFiYjIubWluWlxuICAgICAgICAgICAgKXsqL1xuICAgICAgICAgICAgdmFyIG5leHQgPSBjb250YWN0Lm5leHQ7XG4gICAgICAgICAgICB0aGlzLnJlbW92ZUNvbnRhY3QoY29udGFjdCk7XG4gICAgICAgICAgICBjb250YWN0ID0gbmV4dDtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB2YXIgYjEgPSBjb250YWN0LmJvZHkxO1xuICAgICAgICB2YXIgYjIgPSBjb250YWN0LmJvZHkyO1xuXG4gICAgICAgIGlmIChiMS5pc0R5bmFtaWMgJiYgIWIxLnNsZWVwaW5nIHx8IGIyLmlzRHluYW1pYyAmJiAhYjIuc2xlZXBpbmcpIGNvbnRhY3QudXBkYXRlTWFuaWZvbGQoKTtcblxuICAgICAgICB0aGlzLm51bUNvbnRhY3RQb2ludHMgKz0gY29udGFjdC5tYW5pZm9sZC5udW1Qb2ludHM7XG4gICAgICAgIGNvbnRhY3QucGVyc2lzdGluZyA9IGZhbHNlO1xuICAgICAgICBjb250YWN0LmNvbnN0cmFpbnQuYWRkZWRUb0lzbGFuZCA9IGZhbHNlO1xuICAgICAgICBjb250YWN0ID0gY29udGFjdC5uZXh0O1xuXG4gICAgICB9XG5cbiAgICAgIGlmIChzdGF0KSB0aGlzLnBlcmZvcm1hbmNlLmNhbGNOYXJyb3dQaGFzZSgpO1xuXG4gICAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgLy8gICBTT0xWRSBJU0xBTkRTXG4gICAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICAgICB2YXIgaW52VGltZVN0ZXAgPSAxIC8gdGhpcy50aW1lU3RlcDtcbiAgICAgIHZhciBqb2ludDtcbiAgICAgIHZhciBjb25zdHJhaW50O1xuXG4gICAgICBmb3IgKGpvaW50ID0gdGhpcy5qb2ludHM7IGpvaW50ICE9PSBudWxsOyBqb2ludCA9IGpvaW50Lm5leHQpIHtcbiAgICAgICAgam9pbnQuYWRkZWRUb0lzbGFuZCA9IGZhbHNlO1xuICAgICAgfVxuXG5cbiAgICAgIC8vIGNsZWFyIG9sZCBpc2xhbmQgYXJyYXlcbiAgICAgIHRoaXMuaXNsYW5kUmlnaWRCb2RpZXMgPSBbXTtcbiAgICAgIHRoaXMuaXNsYW5kQ29uc3RyYWludHMgPSBbXTtcbiAgICAgIHRoaXMuaXNsYW5kU3RhY2sgPSBbXTtcblxuICAgICAgaWYgKHN0YXQpIHRoaXMucGVyZm9ybWFuY2Uuc2V0VGltZSgxKTtcblxuICAgICAgdGhpcy5udW1Jc2xhbmRzID0gMDtcblxuICAgICAgLy8gYnVpbGQgYW5kIHNvbHZlIHNpbXVsYXRpb24gaXNsYW5kc1xuXG4gICAgICBmb3IgKHZhciBiYXNlID0gdGhpcy5yaWdpZEJvZGllczsgYmFzZSAhPT0gbnVsbDsgYmFzZSA9IGJhc2UubmV4dCkge1xuXG4gICAgICAgIGlmIChiYXNlLmFkZGVkVG9Jc2xhbmQgfHwgYmFzZS5pc1N0YXRpYyB8fCBiYXNlLnNsZWVwaW5nKSBjb250aW51ZTsvLyBpZ25vcmVcblxuICAgICAgICBpZiAoYmFzZS5pc0xvbmVseSgpKSB7Ly8gdXBkYXRlIHNpbmdsZSBib2R5XG4gICAgICAgICAgaWYgKGJhc2UuaXNEeW5hbWljKSB7XG4gICAgICAgICAgICBiYXNlLmxpbmVhclZlbG9jaXR5LmFkZFNjYWxlZFZlY3Rvcih0aGlzLmdyYXZpdHksIHRoaXMudGltZVN0ZXApO1xuICAgICAgICAgICAgLypiYXNlLmxpbmVhclZlbG9jaXR5LngrPXRoaXMuZ3Jhdml0eS54KnRoaXMudGltZVN0ZXA7XG4gICAgICAgICAgICBiYXNlLmxpbmVhclZlbG9jaXR5LnkrPXRoaXMuZ3Jhdml0eS55KnRoaXMudGltZVN0ZXA7XG4gICAgICAgICAgICBiYXNlLmxpbmVhclZlbG9jaXR5LnorPXRoaXMuZ3Jhdml0eS56KnRoaXMudGltZVN0ZXA7Ki9cbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHRoaXMuY2FsbFNsZWVwKGJhc2UpKSB7XG4gICAgICAgICAgICBiYXNlLnNsZWVwVGltZSArPSB0aGlzLnRpbWVTdGVwO1xuICAgICAgICAgICAgaWYgKGJhc2Uuc2xlZXBUaW1lID4gMC41KSBiYXNlLnNsZWVwKCk7XG4gICAgICAgICAgICBlbHNlIGJhc2UudXBkYXRlUG9zaXRpb24odGhpcy50aW1lU3RlcCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJhc2Uuc2xlZXBUaW1lID0gMDtcbiAgICAgICAgICAgIGJhc2UudXBkYXRlUG9zaXRpb24odGhpcy50aW1lU3RlcCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMubnVtSXNsYW5kcysrO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGlzbGFuZE51bVJpZ2lkQm9kaWVzID0gMDtcbiAgICAgICAgdmFyIGlzbGFuZE51bUNvbnN0cmFpbnRzID0gMDtcbiAgICAgICAgdmFyIHN0YWNrQ291bnQgPSAxO1xuICAgICAgICAvLyBhZGQgcmlnaWQgYm9keSB0byBzdGFja1xuICAgICAgICB0aGlzLmlzbGFuZFN0YWNrWzBdID0gYmFzZTtcbiAgICAgICAgYmFzZS5hZGRlZFRvSXNsYW5kID0gdHJ1ZTtcblxuICAgICAgICAvLyBidWlsZCBhbiBpc2xhbmRcbiAgICAgICAgZG8ge1xuICAgICAgICAgIC8vIGdldCByaWdpZCBib2R5IGZyb20gc3RhY2tcbiAgICAgICAgICBib2R5ID0gdGhpcy5pc2xhbmRTdGFja1stLXN0YWNrQ291bnRdO1xuICAgICAgICAgIHRoaXMuaXNsYW5kU3RhY2tbc3RhY2tDb3VudF0gPSBudWxsO1xuICAgICAgICAgIGJvZHkuc2xlZXBpbmcgPSBmYWxzZTtcbiAgICAgICAgICAvLyBhZGQgcmlnaWQgYm9keSB0byB0aGUgaXNsYW5kXG4gICAgICAgICAgdGhpcy5pc2xhbmRSaWdpZEJvZGllc1tpc2xhbmROdW1SaWdpZEJvZGllcysrXSA9IGJvZHk7XG4gICAgICAgICAgaWYgKGJvZHkuaXNTdGF0aWMpIGNvbnRpbnVlO1xuXG4gICAgICAgICAgLy8gc2VhcmNoIGNvbm5lY3Rpb25zXG4gICAgICAgICAgZm9yICh2YXIgY3MgPSBib2R5LmNvbnRhY3RMaW5rOyBjcyAhPT0gbnVsbDsgY3MgPSBjcy5uZXh0KSB7XG4gICAgICAgICAgICB2YXIgY29udGFjdCA9IGNzLmNvbnRhY3Q7XG4gICAgICAgICAgICBjb25zdHJhaW50ID0gY29udGFjdC5jb25zdHJhaW50O1xuICAgICAgICAgICAgaWYgKGNvbnN0cmFpbnQuYWRkZWRUb0lzbGFuZCB8fCAhY29udGFjdC50b3VjaGluZykgY29udGludWU7Ly8gaWdub3JlXG5cbiAgICAgICAgICAgIC8vIGFkZCBjb25zdHJhaW50IHRvIHRoZSBpc2xhbmRcbiAgICAgICAgICAgIHRoaXMuaXNsYW5kQ29uc3RyYWludHNbaXNsYW5kTnVtQ29uc3RyYWludHMrK10gPSBjb25zdHJhaW50O1xuICAgICAgICAgICAgY29uc3RyYWludC5hZGRlZFRvSXNsYW5kID0gdHJ1ZTtcbiAgICAgICAgICAgIHZhciBuZXh0ID0gY3MuYm9keTtcblxuICAgICAgICAgICAgaWYgKG5leHQuYWRkZWRUb0lzbGFuZCkgY29udGludWU7XG5cbiAgICAgICAgICAgIC8vIGFkZCByaWdpZCBib2R5IHRvIHN0YWNrXG4gICAgICAgICAgICB0aGlzLmlzbGFuZFN0YWNrW3N0YWNrQ291bnQrK10gPSBuZXh0O1xuICAgICAgICAgICAgbmV4dC5hZGRlZFRvSXNsYW5kID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZm9yICh2YXIganMgPSBib2R5LmpvaW50TGluazsganMgIT09IG51bGw7IGpzID0ganMubmV4dCkge1xuICAgICAgICAgICAgY29uc3RyYWludCA9IGpzLmpvaW50O1xuXG4gICAgICAgICAgICBpZiAoY29uc3RyYWludC5hZGRlZFRvSXNsYW5kKSBjb250aW51ZTsvLyBpZ25vcmVcblxuICAgICAgICAgICAgLy8gYWRkIGNvbnN0cmFpbnQgdG8gdGhlIGlzbGFuZFxuICAgICAgICAgICAgdGhpcy5pc2xhbmRDb25zdHJhaW50c1tpc2xhbmROdW1Db25zdHJhaW50cysrXSA9IGNvbnN0cmFpbnQ7XG4gICAgICAgICAgICBjb25zdHJhaW50LmFkZGVkVG9Jc2xhbmQgPSB0cnVlO1xuICAgICAgICAgICAgbmV4dCA9IGpzLmJvZHk7XG4gICAgICAgICAgICBpZiAobmV4dC5hZGRlZFRvSXNsYW5kIHx8ICFuZXh0LmlzRHluYW1pYykgY29udGludWU7XG5cbiAgICAgICAgICAgIC8vIGFkZCByaWdpZCBib2R5IHRvIHN0YWNrXG4gICAgICAgICAgICB0aGlzLmlzbGFuZFN0YWNrW3N0YWNrQ291bnQrK10gPSBuZXh0O1xuICAgICAgICAgICAgbmV4dC5hZGRlZFRvSXNsYW5kID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gd2hpbGUgKHN0YWNrQ291bnQgIT0gMCk7XG5cbiAgICAgICAgLy8gdXBkYXRlIHZlbG9jaXRpZXNcbiAgICAgICAgdmFyIGdWZWwgPSBuZXcgVmVjMygpLmFkZFNjYWxlZFZlY3Rvcih0aGlzLmdyYXZpdHksIHRoaXMudGltZVN0ZXApO1xuICAgICAgICAvKnZhciBneD10aGlzLmdyYXZpdHkueCp0aGlzLnRpbWVTdGVwO1xuICAgICAgICB2YXIgZ3k9dGhpcy5ncmF2aXR5LnkqdGhpcy50aW1lU3RlcDtcbiAgICAgICAgdmFyIGd6PXRoaXMuZ3Jhdml0eS56KnRoaXMudGltZVN0ZXA7Ki9cbiAgICAgICAgdmFyIGogPSBpc2xhbmROdW1SaWdpZEJvZGllcztcbiAgICAgICAgd2hpbGUgKGotLSkge1xuICAgICAgICAgIC8vb3IodmFyIGo9MCwgbD1pc2xhbmROdW1SaWdpZEJvZGllczsgajxsOyBqKyspe1xuICAgICAgICAgIGJvZHkgPSB0aGlzLmlzbGFuZFJpZ2lkQm9kaWVzW2pdO1xuICAgICAgICAgIGlmIChib2R5LmlzRHluYW1pYykge1xuICAgICAgICAgICAgYm9keS5saW5lYXJWZWxvY2l0eS5hZGRFcXVhbChnVmVsKTtcbiAgICAgICAgICAgIC8qYm9keS5saW5lYXJWZWxvY2l0eS54Kz1neDtcbiAgICAgICAgICAgIGJvZHkubGluZWFyVmVsb2NpdHkueSs9Z3k7XG4gICAgICAgICAgICBib2R5LmxpbmVhclZlbG9jaXR5LnorPWd6OyovXG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gcmFuZG9taXppbmcgb3JkZXJcbiAgICAgICAgaWYgKHRoaXMuZW5hYmxlUmFuZG9taXplcikge1xuICAgICAgICAgIC8vZm9yKHZhciBqPTEsIGw9aXNsYW5kTnVtQ29uc3RyYWludHM7IGo8bDsgaisrKXtcbiAgICAgICAgICBqID0gaXNsYW5kTnVtQ29uc3RyYWludHM7XG4gICAgICAgICAgd2hpbGUgKGotLSkge1xuICAgICAgICAgICAgaWYgKGogIT09IDApIHtcbiAgICAgICAgICAgICAgdmFyIHN3YXAgPSAodGhpcy5yYW5kWCA9ICh0aGlzLnJhbmRYICogdGhpcy5yYW5kQSArIHRoaXMucmFuZEIgJiAweDdmZmZmZmZmKSkgLyAyMTQ3NDgzNjQ4LjAgKiBqIHwgMDtcbiAgICAgICAgICAgICAgY29uc3RyYWludCA9IHRoaXMuaXNsYW5kQ29uc3RyYWludHNbal07XG4gICAgICAgICAgICAgIHRoaXMuaXNsYW5kQ29uc3RyYWludHNbal0gPSB0aGlzLmlzbGFuZENvbnN0cmFpbnRzW3N3YXBdO1xuICAgICAgICAgICAgICB0aGlzLmlzbGFuZENvbnN0cmFpbnRzW3N3YXBdID0gY29uc3RyYWludDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBzb2x2ZSBjb250cmFpbnRzXG5cbiAgICAgICAgaiA9IGlzbGFuZE51bUNvbnN0cmFpbnRzO1xuICAgICAgICB3aGlsZSAoai0tKSB7XG4gICAgICAgICAgLy9mb3Ioaj0wLCBsPWlzbGFuZE51bUNvbnN0cmFpbnRzOyBqPGw7IGorKyl7XG4gICAgICAgICAgdGhpcy5pc2xhbmRDb25zdHJhaW50c1tqXS5wcmVTb2x2ZSh0aGlzLnRpbWVTdGVwLCBpbnZUaW1lU3RlcCk7Ly8gcHJlLXNvbHZlXG4gICAgICAgIH1cbiAgICAgICAgdmFyIGsgPSB0aGlzLm51bUl0ZXJhdGlvbnM7XG4gICAgICAgIHdoaWxlIChrLS0pIHtcbiAgICAgICAgICAvL2Zvcih2YXIgaz0wLCBsPXRoaXMubnVtSXRlcmF0aW9uczsgazxsOyBrKyspe1xuICAgICAgICAgIGogPSBpc2xhbmROdW1Db25zdHJhaW50cztcbiAgICAgICAgICB3aGlsZSAoai0tKSB7XG4gICAgICAgICAgICAvL2ZvcihqPTAsIG09aXNsYW5kTnVtQ29uc3RyYWludHM7IGo8bTsgaisrKXtcbiAgICAgICAgICAgIHRoaXMuaXNsYW5kQ29uc3RyYWludHNbal0uc29sdmUoKTsvLyBtYWluLXNvbHZlXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGogPSBpc2xhbmROdW1Db25zdHJhaW50cztcbiAgICAgICAgd2hpbGUgKGotLSkge1xuICAgICAgICAgIC8vZm9yKGo9MCwgbD1pc2xhbmROdW1Db25zdHJhaW50czsgajxsOyBqKyspe1xuICAgICAgICAgIHRoaXMuaXNsYW5kQ29uc3RyYWludHNbal0ucG9zdFNvbHZlKCk7Ly8gcG9zdC1zb2x2ZVxuICAgICAgICAgIHRoaXMuaXNsYW5kQ29uc3RyYWludHNbal0gPSBudWxsOy8vIGdjXG4gICAgICAgIH1cblxuICAgICAgICAvLyBzbGVlcGluZyBjaGVja1xuXG4gICAgICAgIHZhciBzbGVlcFRpbWUgPSAxMDtcbiAgICAgICAgaiA9IGlzbGFuZE51bVJpZ2lkQm9kaWVzO1xuICAgICAgICB3aGlsZSAoai0tKSB7XG4gICAgICAgICAgLy9mb3Ioaj0wLCBsPWlzbGFuZE51bVJpZ2lkQm9kaWVzO2o8bDtqKyspe1xuICAgICAgICAgIGJvZHkgPSB0aGlzLmlzbGFuZFJpZ2lkQm9kaWVzW2pdO1xuICAgICAgICAgIGlmICh0aGlzLmNhbGxTbGVlcChib2R5KSkge1xuICAgICAgICAgICAgYm9keS5zbGVlcFRpbWUgKz0gdGhpcy50aW1lU3RlcDtcbiAgICAgICAgICAgIGlmIChib2R5LnNsZWVwVGltZSA8IHNsZWVwVGltZSkgc2xlZXBUaW1lID0gYm9keS5zbGVlcFRpbWU7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJvZHkuc2xlZXBUaW1lID0gMDtcbiAgICAgICAgICAgIHNsZWVwVGltZSA9IDA7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNsZWVwVGltZSA+IDAuNSkge1xuICAgICAgICAgIC8vIHNsZWVwIHRoZSBpc2xhbmRcbiAgICAgICAgICBqID0gaXNsYW5kTnVtUmlnaWRCb2RpZXM7XG4gICAgICAgICAgd2hpbGUgKGotLSkge1xuICAgICAgICAgICAgLy9mb3Ioaj0wLCBsPWlzbGFuZE51bVJpZ2lkQm9kaWVzO2o8bDtqKyspe1xuICAgICAgICAgICAgdGhpcy5pc2xhbmRSaWdpZEJvZGllc1tqXS5zbGVlcCgpO1xuICAgICAgICAgICAgdGhpcy5pc2xhbmRSaWdpZEJvZGllc1tqXSA9IG51bGw7Ly8gZ2NcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gdXBkYXRlIHBvc2l0aW9uc1xuICAgICAgICAgIGogPSBpc2xhbmROdW1SaWdpZEJvZGllcztcbiAgICAgICAgICB3aGlsZSAoai0tKSB7XG4gICAgICAgICAgICAvL2ZvcihqPTAsIGw9aXNsYW5kTnVtUmlnaWRCb2RpZXM7ajxsO2orKyl7XG4gICAgICAgICAgICB0aGlzLmlzbGFuZFJpZ2lkQm9kaWVzW2pdLnVwZGF0ZVBvc2l0aW9uKHRoaXMudGltZVN0ZXApO1xuICAgICAgICAgICAgdGhpcy5pc2xhbmRSaWdpZEJvZGllc1tqXSA9IG51bGw7Ly8gZ2NcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5udW1Jc2xhbmRzKys7XG4gICAgICB9XG5cbiAgICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAvLyAgIEVORCBTSU1VTEFUSU9OXG4gICAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICAgICBpZiAoc3RhdCkgdGhpcy5wZXJmb3JtYW5jZS5jYWxjRW5kKCk7XG5cbiAgICAgIGlmICh0aGlzLnBvc3RMb29wICE9PSBudWxsKSB0aGlzLnBvc3RMb29wKCk7XG5cbiAgICB9LFxuXG4gICAgLy8gcmVtb3ZlIHNvbWV0aW5nIHRvIHdvcmxkXG5cbiAgICByZW1vdmU6IGZ1bmN0aW9uIChvYmopIHtcblxuICAgIH0sXG5cbiAgICAvLyBhZGQgc29tZXRpbmcgdG8gd29ybGRcblxuICAgIGFkZDogZnVuY3Rpb24gKG8pIHtcblxuICAgICAgbyA9IG8gfHwge307XG5cbiAgICAgIHZhciB0eXBlID0gby50eXBlIHx8IFwiYm94XCI7XG4gICAgICBpZiAodHlwZS5jb25zdHJ1Y3RvciA9PT0gU3RyaW5nKSB0eXBlID0gW3R5cGVdO1xuICAgICAgdmFyIGlzSm9pbnQgPSB0eXBlWzBdLnN1YnN0cmluZygwLCA1KSA9PT0gJ2pvaW50JyA/IHRydWUgOiBmYWxzZTtcblxuICAgICAgaWYgKGlzSm9pbnQpIHJldHVybiB0aGlzLmluaXRKb2ludCh0eXBlWzBdLCBvKTtcbiAgICAgIGVsc2UgcmV0dXJuIHRoaXMuaW5pdEJvZHkodHlwZSwgbyk7XG5cbiAgICB9LFxuXG4gICAgaW5pdEJvZHk6IGZ1bmN0aW9uICh0eXBlLCBvKSB7XG5cbiAgICAgIHZhciBpbnZTY2FsZSA9IHRoaXMuaW52U2NhbGU7XG5cbiAgICAgIC8vIGJvZHkgZHluYW1pYyBvciBzdGF0aWNcbiAgICAgIHZhciBtb3ZlID0gby5tb3ZlIHx8IGZhbHNlO1xuICAgICAgdmFyIGtpbmVtYXRpYyA9IG8ua2luZW1hdGljIHx8IGZhbHNlO1xuXG4gICAgICAvLyBQT1NJVElPTlxuXG4gICAgICAvLyBib2R5IHBvc2l0aW9uXG4gICAgICB2YXIgcCA9IG8ucG9zIHx8IFswLCAwLCAwXTtcbiAgICAgIHAgPSBwLm1hcChmdW5jdGlvbiAoeCkgeyByZXR1cm4geCAqIGludlNjYWxlOyB9KTtcblxuICAgICAgLy8gc2hhcGUgcG9zaXRpb25cbiAgICAgIHZhciBwMiA9IG8ucG9zU2hhcGUgfHwgWzAsIDAsIDBdO1xuICAgICAgcDIgPSBwMi5tYXAoZnVuY3Rpb24gKHgpIHsgcmV0dXJuIHggKiBpbnZTY2FsZTsgfSk7XG5cbiAgICAgIC8vIFJPVEFUSU9OXG5cbiAgICAgIC8vIGJvZHkgcm90YXRpb24gaW4gZGVncmVlXG4gICAgICB2YXIgciA9IG8ucm90IHx8IFswLCAwLCAwXTtcbiAgICAgIHIgPSByLm1hcChmdW5jdGlvbiAoeCkgeyByZXR1cm4geCAqIF9NYXRoLmRlZ3RvcmFkOyB9KTtcblxuICAgICAgLy8gc2hhcGUgcm90YXRpb24gaW4gZGVncmVlXG4gICAgICB2YXIgcjIgPSBvLnJvdFNoYXBlIHx8IFswLCAwLCAwXTtcbiAgICAgIHIyID0gci5tYXAoZnVuY3Rpb24gKHgpIHsgcmV0dXJuIHggKiBfTWF0aC5kZWd0b3JhZDsgfSk7XG5cbiAgICAgIC8vIFNJWkVcblxuICAgICAgLy8gc2hhcGUgc2l6ZVxuICAgICAgdmFyIHMgPSBvLnNpemUgPT09IHVuZGVmaW5lZCA/IFsxLCAxLCAxXSA6IG8uc2l6ZTtcbiAgICAgIGlmIChzLmxlbmd0aCA9PT0gMSkgeyBzWzFdID0gc1swXTsgfVxuICAgICAgaWYgKHMubGVuZ3RoID09PSAyKSB7IHNbMl0gPSBzWzBdOyB9XG4gICAgICBzID0gcy5tYXAoZnVuY3Rpb24gKHgpIHsgcmV0dXJuIHggKiBpbnZTY2FsZTsgfSk7XG5cblxuXG4gICAgICAvLyBib2R5IHBoeXNpY3Mgc2V0dGluZ3NcbiAgICAgIHZhciBzYyA9IG5ldyBTaGFwZUNvbmZpZygpO1xuICAgICAgLy8gVGhlIGRlbnNpdHkgb2YgdGhlIHNoYXBlLlxuICAgICAgaWYgKG8uZGVuc2l0eSAhPT0gdW5kZWZpbmVkKSBzYy5kZW5zaXR5ID0gby5kZW5zaXR5O1xuICAgICAgLy8gVGhlIGNvZWZmaWNpZW50IG9mIGZyaWN0aW9uIG9mIHRoZSBzaGFwZS5cbiAgICAgIGlmIChvLmZyaWN0aW9uICE9PSB1bmRlZmluZWQpIHNjLmZyaWN0aW9uID0gby5mcmljdGlvbjtcbiAgICAgIC8vIFRoZSBjb2VmZmljaWVudCBvZiByZXN0aXR1dGlvbiBvZiB0aGUgc2hhcGUuXG4gICAgICBpZiAoby5yZXN0aXR1dGlvbiAhPT0gdW5kZWZpbmVkKSBzYy5yZXN0aXR1dGlvbiA9IG8ucmVzdGl0dXRpb247XG4gICAgICAvLyBUaGUgYml0cyBvZiB0aGUgY29sbGlzaW9uIGdyb3VwcyB0byB3aGljaCB0aGUgc2hhcGUgYmVsb25ncy5cbiAgICAgIGlmIChvLmJlbG9uZ3NUbyAhPT0gdW5kZWZpbmVkKSBzYy5iZWxvbmdzVG8gPSBvLmJlbG9uZ3NUbztcbiAgICAgIC8vIFRoZSBiaXRzIG9mIHRoZSBjb2xsaXNpb24gZ3JvdXBzIHdpdGggd2hpY2ggdGhlIHNoYXBlIGNvbGxpZGVzLlxuICAgICAgaWYgKG8uY29sbGlkZXNXaXRoICE9PSB1bmRlZmluZWQpIHNjLmNvbGxpZGVzV2l0aCA9IG8uY29sbGlkZXNXaXRoO1xuXG4gICAgICBpZiAoby5jb25maWcgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBpZiAoby5jb25maWdbMF0gIT09IHVuZGVmaW5lZCkgc2MuZGVuc2l0eSA9IG8uY29uZmlnWzBdO1xuICAgICAgICBpZiAoby5jb25maWdbMV0gIT09IHVuZGVmaW5lZCkgc2MuZnJpY3Rpb24gPSBvLmNvbmZpZ1sxXTtcbiAgICAgICAgaWYgKG8uY29uZmlnWzJdICE9PSB1bmRlZmluZWQpIHNjLnJlc3RpdHV0aW9uID0gby5jb25maWdbMl07XG4gICAgICAgIGlmIChvLmNvbmZpZ1szXSAhPT0gdW5kZWZpbmVkKSBzYy5iZWxvbmdzVG8gPSBvLmNvbmZpZ1szXTtcbiAgICAgICAgaWYgKG8uY29uZmlnWzRdICE9PSB1bmRlZmluZWQpIHNjLmNvbGxpZGVzV2l0aCA9IG8uY29uZmlnWzRdO1xuICAgICAgfVxuXG5cbiAgICAgIC8qIGlmKG8ubWFzc1Bvcyl7XG4gICAgICAgICAgIG8ubWFzc1BvcyA9IG8ubWFzc1Bvcy5tYXAoZnVuY3Rpb24oeCkgeyByZXR1cm4geCAqIGludlNjYWxlOyB9KTtcbiAgICAgICAgICAgc2MucmVsYXRpdmVQb3NpdGlvbi5zZXQoIG8ubWFzc1Bvc1swXSwgby5tYXNzUG9zWzFdLCBvLm1hc3NQb3NbMl0gKTtcbiAgICAgICB9XG4gICAgICAgaWYoby5tYXNzUm90KXtcbiAgICAgICAgICAgby5tYXNzUm90ID0gby5tYXNzUm90Lm1hcChmdW5jdGlvbih4KSB7IHJldHVybiB4ICogX01hdGguZGVndG9yYWQ7IH0pO1xuICAgICAgICAgICB2YXIgcSA9IG5ldyBRdWF0KCkuc2V0RnJvbUV1bGVyKCBvLm1hc3NSb3RbMF0sIG8ubWFzc1JvdFsxXSwgby5tYXNzUm90WzJdICk7XG4gICAgICAgICAgIHNjLnJlbGF0aXZlUm90YXRpb24gPSBuZXcgTWF0MzMoKS5zZXRRdWF0KCBxICk7Ly9fTWF0aC5FdWxlclRvTWF0cml4KCBvLm1hc3NSb3RbMF0sIG8ubWFzc1JvdFsxXSwgby5tYXNzUm90WzJdICk7XG4gICAgICAgfSovXG5cbiAgICAgIHZhciBwb3NpdGlvbiA9IG5ldyBWZWMzKHBbMF0sIHBbMV0sIHBbMl0pO1xuICAgICAgdmFyIHJvdGF0aW9uID0gbmV3IFF1YXQoKS5zZXRGcm9tRXVsZXIoclswXSwgclsxXSwgclsyXSk7XG5cbiAgICAgIC8vIHJpZ2lkYm9keVxuICAgICAgdmFyIGJvZHkgPSBuZXcgUmlnaWRCb2R5KHBvc2l0aW9uLCByb3RhdGlvbik7XG4gICAgICAvL3ZhciBib2R5ID0gbmV3IFJpZ2lkQm9keSggcFswXSwgcFsxXSwgcFsyXSwgclswXSwgclsxXSwgclsyXSwgclszXSwgdGhpcy5zY2FsZSwgdGhpcy5pbnZTY2FsZSApO1xuXG4gICAgICAvLyBTSEFQRVNcblxuICAgICAgdmFyIHNoYXBlLCBuO1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHR5cGUubGVuZ3RoOyBpKyspIHtcblxuICAgICAgICBuID0gaSAqIDM7XG5cbiAgICAgICAgaWYgKHAyW25dICE9PSB1bmRlZmluZWQpIHNjLnJlbGF0aXZlUG9zaXRpb24uc2V0KHAyW25dLCBwMltuICsgMV0sIHAyW24gKyAyXSk7XG4gICAgICAgIGlmIChyMltuXSAhPT0gdW5kZWZpbmVkKSBzYy5yZWxhdGl2ZVJvdGF0aW9uLnNldFF1YXQobmV3IFF1YXQoKS5zZXRGcm9tRXVsZXIocjJbbl0sIHIyW24gKyAxXSwgcjJbbiArIDJdKSk7XG5cbiAgICAgICAgc3dpdGNoICh0eXBlW2ldKSB7XG4gICAgICAgICAgY2FzZSBcInNwaGVyZVwiOiBzaGFwZSA9IG5ldyBTcGhlcmUoc2MsIHNbbl0pOyBicmVhaztcbiAgICAgICAgICBjYXNlIFwiY3lsaW5kZXJcIjogc2hhcGUgPSBuZXcgQ3lsaW5kZXIoc2MsIHNbbl0sIHNbbiArIDFdKTsgYnJlYWs7XG4gICAgICAgICAgY2FzZSBcImJveFwiOiBzaGFwZSA9IG5ldyBCb3goc2MsIHNbbl0sIHNbbiArIDFdLCBzW24gKyAyXSk7IGJyZWFrO1xuICAgICAgICAgIGNhc2UgXCJwbGFuZVwiOiBzaGFwZSA9IG5ldyBQbGFuZShzYyk7IGJyZWFrXG4gICAgICAgIH1cblxuICAgICAgICBib2R5LmFkZFNoYXBlKHNoYXBlKTtcblxuICAgICAgfVxuXG4gICAgICAvLyBib2R5IGNhbiBzbGVlcCBvciBub3RcbiAgICAgIGlmIChvLm5ldmVyU2xlZXAgfHwga2luZW1hdGljKSBib2R5LmFsbG93U2xlZXAgPSBmYWxzZTtcbiAgICAgIGVsc2UgYm9keS5hbGxvd1NsZWVwID0gdHJ1ZTtcblxuICAgICAgYm9keS5pc0tpbmVtYXRpYyA9IGtpbmVtYXRpYztcblxuICAgICAgLy8gYm9keSBzdGF0aWMgb3IgZHluYW1pY1xuICAgICAgaWYgKG1vdmUpIHtcblxuICAgICAgICBpZiAoby5tYXNzUG9zIHx8IG8ubWFzc1JvdCkgYm9keS5zZXR1cE1hc3MoQk9EWV9EWU5BTUlDLCBmYWxzZSk7XG4gICAgICAgIGVsc2UgYm9keS5zZXR1cE1hc3MoQk9EWV9EWU5BTUlDLCB0cnVlKTtcblxuICAgICAgICAvLyBib2R5IGNhbiBzbGVlcCBvciBub3RcbiAgICAgICAgLy9pZiggby5uZXZlclNsZWVwICkgYm9keS5hbGxvd1NsZWVwID0gZmFsc2U7XG4gICAgICAgIC8vZWxzZSBib2R5LmFsbG93U2xlZXAgPSB0cnVlO1xuXG4gICAgICB9IGVsc2Uge1xuXG4gICAgICAgIGJvZHkuc2V0dXBNYXNzKEJPRFlfU1RBVElDKTtcblxuICAgICAgfVxuXG4gICAgICBpZiAoby5uYW1lICE9PSB1bmRlZmluZWQpIGJvZHkubmFtZSA9IG8ubmFtZTtcbiAgICAgIC8vZWxzZSBpZiggbW92ZSApIGJvZHkubmFtZSA9IHRoaXMubnVtUmlnaWRCb2RpZXM7XG5cbiAgICAgIC8vIGZpbmFseSBhZGQgdG8gcGh5c2ljcyB3b3JsZFxuICAgICAgdGhpcy5hZGRSaWdpZEJvZHkoYm9keSk7XG5cbiAgICAgIC8vIGZvcmNlIHNsZWVwIG9uIG5vdFxuICAgICAgaWYgKG1vdmUpIHtcbiAgICAgICAgaWYgKG8uc2xlZXApIGJvZHkuc2xlZXAoKTtcbiAgICAgICAgZWxzZSBib2R5LmF3YWtlKCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBib2R5O1xuXG5cbiAgICB9LFxuXG4gICAgaW5pdEpvaW50OiBmdW5jdGlvbiAodHlwZSwgbykge1xuXG4gICAgICAvL3ZhciB0eXBlID0gdHlwZTtcbiAgICAgIHZhciBpbnZTY2FsZSA9IHRoaXMuaW52U2NhbGU7XG5cbiAgICAgIHZhciBheGUxID0gby5heGUxIHx8IFsxLCAwLCAwXTtcbiAgICAgIHZhciBheGUyID0gby5heGUyIHx8IFsxLCAwLCAwXTtcbiAgICAgIHZhciBwb3MxID0gby5wb3MxIHx8IFswLCAwLCAwXTtcbiAgICAgIHZhciBwb3MyID0gby5wb3MyIHx8IFswLCAwLCAwXTtcblxuICAgICAgcG9zMSA9IHBvczEubWFwKGZ1bmN0aW9uICh4KSB7IHJldHVybiB4ICogaW52U2NhbGU7IH0pO1xuICAgICAgcG9zMiA9IHBvczIubWFwKGZ1bmN0aW9uICh4KSB7IHJldHVybiB4ICogaW52U2NhbGU7IH0pO1xuXG4gICAgICB2YXIgbWluLCBtYXg7XG4gICAgICBpZiAodHlwZSA9PT0gXCJqb2ludERpc3RhbmNlXCIpIHtcbiAgICAgICAgbWluID0gby5taW4gfHwgMDtcbiAgICAgICAgbWF4ID0gby5tYXggfHwgMTA7XG4gICAgICAgIG1pbiA9IG1pbiAqIGludlNjYWxlO1xuICAgICAgICBtYXggPSBtYXggKiBpbnZTY2FsZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG1pbiA9IG8ubWluIHx8IDU3LjI5NTc4O1xuICAgICAgICBtYXggPSBvLm1heCB8fCAwO1xuICAgICAgICBtaW4gPSBtaW4gKiBfTWF0aC5kZWd0b3JhZDtcbiAgICAgICAgbWF4ID0gbWF4ICogX01hdGguZGVndG9yYWQ7XG4gICAgICB9XG5cbiAgICAgIHZhciBsaW1pdCA9IG8ubGltaXQgfHwgbnVsbDtcbiAgICAgIHZhciBzcHJpbmcgPSBvLnNwcmluZyB8fCBudWxsO1xuICAgICAgdmFyIG1vdG9yID0gby5tb3RvciB8fCBudWxsO1xuXG4gICAgICAvLyBqb2ludCBzZXR0aW5nXG4gICAgICB2YXIgamMgPSBuZXcgSm9pbnRDb25maWcoKTtcbiAgICAgIGpjLnNjYWxlID0gdGhpcy5zY2FsZTtcbiAgICAgIGpjLmludlNjYWxlID0gdGhpcy5pbnZTY2FsZTtcbiAgICAgIGpjLmFsbG93Q29sbGlzaW9uID0gby5jb2xsaXNpb24gfHwgZmFsc2U7XG4gICAgICBqYy5sb2NhbEF4aXMxLnNldChheGUxWzBdLCBheGUxWzFdLCBheGUxWzJdKTtcbiAgICAgIGpjLmxvY2FsQXhpczIuc2V0KGF4ZTJbMF0sIGF4ZTJbMV0sIGF4ZTJbMl0pO1xuICAgICAgamMubG9jYWxBbmNob3JQb2ludDEuc2V0KHBvczFbMF0sIHBvczFbMV0sIHBvczFbMl0pO1xuICAgICAgamMubG9jYWxBbmNob3JQb2ludDIuc2V0KHBvczJbMF0sIHBvczJbMV0sIHBvczJbMl0pO1xuXG4gICAgICB2YXIgYjEgPSBudWxsO1xuICAgICAgdmFyIGIyID0gbnVsbDtcblxuICAgICAgaWYgKG8uYm9keTEgPT09IHVuZGVmaW5lZCB8fCBvLmJvZHkyID09PSB1bmRlZmluZWQpIHJldHVybiBwcmludEVycm9yKCdXb3JsZCcsIFwiQ2FuJ3QgYWRkIGpvaW50IGlmIGF0dGFjaCByaWdpZGJvZHlzIG5vdCBkZWZpbmUgIVwiKTtcblxuICAgICAgaWYgKG8uYm9keTEuY29uc3RydWN0b3IgPT09IFN0cmluZykgeyBiMSA9IHRoaXMuZ2V0QnlOYW1lKG8uYm9keTEpOyB9XG4gICAgICBlbHNlIGlmIChvLmJvZHkxLmNvbnN0cnVjdG9yID09PSBOdW1iZXIpIHsgYjEgPSB0aGlzLmdldEJ5TmFtZShvLmJvZHkxKTsgfVxuICAgICAgZWxzZSBpZiAoby5ib2R5MS5jb25zdHJ1Y3RvciA9PT0gUmlnaWRCb2R5KSB7IGIxID0gby5ib2R5MTsgfVxuXG4gICAgICBpZiAoby5ib2R5Mi5jb25zdHJ1Y3RvciA9PT0gU3RyaW5nKSB7IGIyID0gdGhpcy5nZXRCeU5hbWUoby5ib2R5Mik7IH1cbiAgICAgIGVsc2UgaWYgKG8uYm9keTIuY29uc3RydWN0b3IgPT09IE51bWJlcikgeyBiMiA9IHRoaXMuZ2V0QnlOYW1lKG8uYm9keTIpOyB9XG4gICAgICBlbHNlIGlmIChvLmJvZHkyLmNvbnN0cnVjdG9yID09PSBSaWdpZEJvZHkpIHsgYjIgPSBvLmJvZHkyOyB9XG5cbiAgICAgIGlmIChiMSA9PT0gbnVsbCB8fCBiMiA9PT0gbnVsbCkgcmV0dXJuIHByaW50RXJyb3IoJ1dvcmxkJywgXCJDYW4ndCBhZGQgam9pbnQgYXR0YWNoIHJpZ2lkYm9keXMgbm90IGZpbmQgIVwiKTtcblxuICAgICAgamMuYm9keTEgPSBiMTtcbiAgICAgIGpjLmJvZHkyID0gYjI7XG5cbiAgICAgIHZhciBqb2ludDtcbiAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICBjYXNlIFwiam9pbnREaXN0YW5jZVwiOiBqb2ludCA9IG5ldyBEaXN0YW5jZUpvaW50KGpjLCBtaW4sIG1heCk7XG4gICAgICAgICAgaWYgKHNwcmluZyAhPT0gbnVsbCkgam9pbnQubGltaXRNb3Rvci5zZXRTcHJpbmcoc3ByaW5nWzBdLCBzcHJpbmdbMV0pO1xuICAgICAgICAgIGlmIChtb3RvciAhPT0gbnVsbCkgam9pbnQubGltaXRNb3Rvci5zZXRNb3Rvcihtb3RvclswXSwgbW90b3JbMV0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwiam9pbnRIaW5nZVwiOiBjYXNlIFwiam9pbnRcIjogam9pbnQgPSBuZXcgSGluZ2VKb2ludChqYywgbWluLCBtYXgpO1xuICAgICAgICAgIGlmIChzcHJpbmcgIT09IG51bGwpIGpvaW50LmxpbWl0TW90b3Iuc2V0U3ByaW5nKHNwcmluZ1swXSwgc3ByaW5nWzFdKTsvLyBzb2Z0ZW4gdGhlIGpvaW50IGV4OiAxMDAsIDAuMlxuICAgICAgICAgIGlmIChtb3RvciAhPT0gbnVsbCkgam9pbnQubGltaXRNb3Rvci5zZXRNb3Rvcihtb3RvclswXSwgbW90b3JbMV0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwiam9pbnRQcmlzbWVcIjogam9pbnQgPSBuZXcgUHJpc21hdGljSm9pbnQoamMsIG1pbiwgbWF4KTsgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJqb2ludFNsaWRlXCI6IGpvaW50ID0gbmV3IFNsaWRlckpvaW50KGpjLCBtaW4sIG1heCk7IGJyZWFrO1xuICAgICAgICBjYXNlIFwiam9pbnRCYWxsXCI6IGpvaW50ID0gbmV3IEJhbGxBbmRTb2NrZXRKb2ludChqYyk7IGJyZWFrO1xuICAgICAgICBjYXNlIFwiam9pbnRXaGVlbFwiOiBqb2ludCA9IG5ldyBXaGVlbEpvaW50KGpjKTtcbiAgICAgICAgICBpZiAobGltaXQgIT09IG51bGwpIGpvaW50LnJvdGF0aW9uYWxMaW1pdE1vdG9yMS5zZXRMaW1pdChsaW1pdFswXSwgbGltaXRbMV0pO1xuICAgICAgICAgIGlmIChzcHJpbmcgIT09IG51bGwpIGpvaW50LnJvdGF0aW9uYWxMaW1pdE1vdG9yMS5zZXRTcHJpbmcoc3ByaW5nWzBdLCBzcHJpbmdbMV0pO1xuICAgICAgICAgIGlmIChtb3RvciAhPT0gbnVsbCkgam9pbnQucm90YXRpb25hbExpbWl0TW90b3IxLnNldE1vdG9yKG1vdG9yWzBdLCBtb3RvclsxXSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIGpvaW50Lm5hbWUgPSBvLm5hbWUgfHwgJyc7XG4gICAgICAvLyBmaW5hbHkgYWRkIHRvIHBoeXNpY3Mgd29ybGRcbiAgICAgIHRoaXMuYWRkSm9pbnQoam9pbnQpO1xuXG4gICAgICByZXR1cm4gam9pbnQ7XG5cbiAgICB9LFxuXG5cbiAgfSk7XG5cbiAgLy8gdGVzdCB2ZXJzaW9uXG5cbiAgLy9leHBvcnQgeyBSaWdpZEJvZHkgfSBmcm9tICcuL2NvcmUvUmlnaWRCb2R5X1guanMnO1xuICAvL2V4cG9ydCB7IFdvcmxkIH0gZnJvbSAnLi9jb3JlL1dvcmxkX1guanMnO1xuXG4gIGV4cG9ydHMuTWF0aCA9IF9NYXRoO1xuICBleHBvcnRzLlZlYzMgPSBWZWMzO1xuICBleHBvcnRzLlF1YXQgPSBRdWF0O1xuICBleHBvcnRzLk1hdDMzID0gTWF0MzM7XG4gIGV4cG9ydHMuU2hhcGUgPSBTaGFwZTtcbiAgZXhwb3J0cy5Cb3ggPSBCb3g7XG4gIGV4cG9ydHMuU3BoZXJlID0gU3BoZXJlO1xuICBleHBvcnRzLkN5bGluZGVyID0gQ3lsaW5kZXI7XG4gIGV4cG9ydHMuUGxhbmUgPSBQbGFuZTtcbiAgZXhwb3J0cy5QYXJ0aWNsZSA9IFBhcnRpY2xlO1xuICBleHBvcnRzLlNoYXBlQ29uZmlnID0gU2hhcGVDb25maWc7XG4gIGV4cG9ydHMuTGltaXRNb3RvciA9IExpbWl0TW90b3I7XG4gIGV4cG9ydHMuSGluZ2VKb2ludCA9IEhpbmdlSm9pbnQ7XG4gIGV4cG9ydHMuQmFsbEFuZFNvY2tldEpvaW50ID0gQmFsbEFuZFNvY2tldEpvaW50O1xuICBleHBvcnRzLkRpc3RhbmNlSm9pbnQgPSBEaXN0YW5jZUpvaW50O1xuICBleHBvcnRzLlByaXNtYXRpY0pvaW50ID0gUHJpc21hdGljSm9pbnQ7XG4gIGV4cG9ydHMuU2xpZGVySm9pbnQgPSBTbGlkZXJKb2ludDtcbiAgZXhwb3J0cy5XaGVlbEpvaW50ID0gV2hlZWxKb2ludDtcbiAgZXhwb3J0cy5Kb2ludENvbmZpZyA9IEpvaW50Q29uZmlnO1xuICBleHBvcnRzLlJpZ2lkQm9keSA9IFJpZ2lkQm9keTtcbiAgZXhwb3J0cy5Xb3JsZCA9IFdvcmxkO1xuICBleHBvcnRzLlJFVklTSU9OID0gUkVWSVNJT047XG4gIGV4cG9ydHMuQlJfTlVMTCA9IEJSX05VTEw7XG4gIGV4cG9ydHMuQlJfQlJVVEVfRk9SQ0UgPSBCUl9CUlVURV9GT1JDRTtcbiAgZXhwb3J0cy5CUl9TV0VFUF9BTkRfUFJVTkUgPSBCUl9TV0VFUF9BTkRfUFJVTkU7XG4gIGV4cG9ydHMuQlJfQk9VTkRJTkdfVk9MVU1FX1RSRUUgPSBCUl9CT1VORElOR19WT0xVTUVfVFJFRTtcbiAgZXhwb3J0cy5CT0RZX05VTEwgPSBCT0RZX05VTEw7XG4gIGV4cG9ydHMuQk9EWV9EWU5BTUlDID0gQk9EWV9EWU5BTUlDO1xuICBleHBvcnRzLkJPRFlfU1RBVElDID0gQk9EWV9TVEFUSUM7XG4gIGV4cG9ydHMuQk9EWV9LSU5FTUFUSUMgPSBCT0RZX0tJTkVNQVRJQztcbiAgZXhwb3J0cy5CT0RZX0dIT1NUID0gQk9EWV9HSE9TVDtcbiAgZXhwb3J0cy5TSEFQRV9OVUxMID0gU0hBUEVfTlVMTDtcbiAgZXhwb3J0cy5TSEFQRV9TUEhFUkUgPSBTSEFQRV9TUEhFUkU7XG4gIGV4cG9ydHMuU0hBUEVfQk9YID0gU0hBUEVfQk9YO1xuICBleHBvcnRzLlNIQVBFX0NZTElOREVSID0gU0hBUEVfQ1lMSU5ERVI7XG4gIGV4cG9ydHMuU0hBUEVfUExBTkUgPSBTSEFQRV9QTEFORTtcbiAgZXhwb3J0cy5TSEFQRV9QQVJUSUNMRSA9IFNIQVBFX1BBUlRJQ0xFO1xuICBleHBvcnRzLlNIQVBFX1RFVFJBID0gU0hBUEVfVEVUUkE7XG4gIGV4cG9ydHMuSk9JTlRfTlVMTCA9IEpPSU5UX05VTEw7XG4gIGV4cG9ydHMuSk9JTlRfRElTVEFOQ0UgPSBKT0lOVF9ESVNUQU5DRTtcbiAgZXhwb3J0cy5KT0lOVF9CQUxMX0FORF9TT0NLRVQgPSBKT0lOVF9CQUxMX0FORF9TT0NLRVQ7XG4gIGV4cG9ydHMuSk9JTlRfSElOR0UgPSBKT0lOVF9ISU5HRTtcbiAgZXhwb3J0cy5KT0lOVF9XSEVFTCA9IEpPSU5UX1dIRUVMO1xuICBleHBvcnRzLkpPSU5UX1NMSURFUiA9IEpPSU5UX1NMSURFUjtcbiAgZXhwb3J0cy5KT0lOVF9QUklTTUFUSUMgPSBKT0lOVF9QUklTTUFUSUM7XG4gIGV4cG9ydHMuQUFCQl9QUk9YID0gQUFCQl9QUk9YO1xuICBleHBvcnRzLnByaW50RXJyb3IgPSBwcmludEVycm9yO1xuICBleHBvcnRzLkluZm9EaXNwbGF5ID0gSW5mb0Rpc3BsYXk7XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcblxufSkpOyIsIi8qIGdsb2JhbCBBRlJBTUUsIFRIUkVFLCBPSU1PICovXHJcblxyXG5jb25zdCBjbWQgPSByZXF1aXJlKFwiLi9saWJzL2NtZENvZGVjXCIpXHJcblxyXG5nbG9iYWwuT0lNTyA9IHJlcXVpcmUoXCIuL2xpYnMvb2ltb1wiKVxyXG5nbG9iYWwud29ybGQgPSBuZXcgT0lNTy5Xb3JsZCgpXHJcbmdsb2JhbC5ib2RpZXMgPSBbXVxyXG5nbG9iYWwubW92aW5nQm9kaWVzID0gW11cclxuXHJcbmxldCB2ZWMgPSBuZXcgT0lNTy5WZWMzKClcclxubGV0IHF1YXQgPSBuZXcgT0lNTy5RdWF0KClcclxubGV0IG5leHRTdGVwID0gMFxyXG5cclxuZnVuY3Rpb24gaW5pdCgpIHtcclxuICBhZGRFdmVudExpc3RlbmVyKFwibWVzc2FnZVwiLCBvbk1lc3NhZ2UpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIG9uTWVzc2FnZShlKSB7XHJcbiAgaWYgKHR5cGVvZiBlLmRhdGEgPT09IFwic3RyaW5nXCIpIHtcclxuICAgIGxldCBjb21tYW5kID0gY21kLnBhcnNlKGUuZGF0YSlcclxuICAgIHN3aXRjaCAoY29tbWFuZC5zaGlmdCgpKSB7XHJcbiAgICAgIGNhc2UgXCJ3b3JsZFwiOlxyXG4gICAgICAgIHdvcmxkQ29tbWFuZChjb21tYW5kKVxyXG4gICAgICAgIGJyZWFrXHJcbiAgICB9XHJcbiAgfVxyXG4gIGVsc2UgaWYgKGUuZGF0YSBpbnN0YW5jZW9mIEZsb2F0NjRBcnJheSkge1xyXG4gICAgbGV0IGJ1ZmZlciA9IGUuZGF0YVxyXG4gICAgbGV0IG5vdyA9IERhdGUubm93KClcclxuICAgIGlmIChub3cgPiBuZXh0U3RlcCkge1xyXG4gICAgICBmb3IgKGxldCBtaWQgPSAwOyBtaWQgPCBtb3ZpbmdCb2RpZXMubGVuZ3RoOyBtaWQrKykge1xyXG4gICAgICAgIGxldCBib2R5ID0gbW92aW5nQm9kaWVzW21pZF1cclxuICAgICAgICBsZXQgcCA9IG1pZCAqIDhcclxuICAgICAgICBpZiAoIWJvZHkpIGNvbnRpbnVlXHJcbiAgICAgICAgaWYgKGJvZHkuaXNLaW5lbWF0aWMpIHtcclxuICAgICAgICAgIHZlYy5zZXQoYnVmZmVyW3ArK10sIGJ1ZmZlcltwKytdLCBidWZmZXJbcCsrXSlcclxuICAgICAgICAgIGJvZHkuc2V0UG9zaXRpb24odmVjKVxyXG4gICAgICAgICAgcCsrXHJcbiAgICAgICAgICBxdWF0LnNldChidWZmZXJbcCsrXSwgYnVmZmVyW3ArK10sIGJ1ZmZlcltwKytdLCBidWZmZXJbcCsrXSlcclxuICAgICAgICAgIGJvZHkuc2V0UXVhdGVybmlvbihxdWF0KVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICB3b3JsZC5zdGVwKClcclxuICAgICAgbmV4dFN0ZXAgKz0gd29ybGQudGltZXJhdGVcclxuICAgICAgaWYgKG5vdyA+IG5leHRTdGVwKVxyXG4gICAgICAgIG5leHRTdGVwID0gbm93ICsgd29ybGQudGltZXJhdGUgLyAyXHJcbiAgICB9XHJcbiAgICBmb3IgKGxldCBtaWQgPSAwOyBtaWQgPCBtb3ZpbmdCb2RpZXMubGVuZ3RoOyBtaWQrKykge1xyXG4gICAgICBsZXQgYm9keSA9IG1vdmluZ0JvZGllc1ttaWRdXHJcbiAgICAgIGxldCBwID0gbWlkICogOFxyXG4gICAgICBpZiAoIWJvZHkpIGNvbnRpbnVlXHJcbiAgICAgIGlmICghYm9keS5pc0tpbmVtYXRpYykge1xyXG4gICAgICAgIGJ1ZmZlcltwKytdID0gYm9keS5wb3MueFxyXG4gICAgICAgIGJ1ZmZlcltwKytdID0gYm9keS5wb3MueVxyXG4gICAgICAgIGJ1ZmZlcltwKytdID0gYm9keS5wb3MuelxyXG4gICAgICAgIHArK1xyXG4gICAgICAgIGJ1ZmZlcltwKytdID0gYm9keS5xdWF0ZXJuaW9uLnhcclxuICAgICAgICBidWZmZXJbcCsrXSA9IGJvZHkucXVhdGVybmlvbi55XHJcbiAgICAgICAgYnVmZmVyW3ArK10gPSBib2R5LnF1YXRlcm5pb24uelxyXG4gICAgICAgIGJ1ZmZlcltwKytdID0gYm9keS5xdWF0ZXJuaW9uLndcclxuICAgICAgfVxyXG4gICAgICBlbWl0Q29sbGlzaW9ucyhib2R5KVxyXG4gICAgfVxyXG4gICAgcG9zdE1lc3NhZ2UoYnVmZmVyLCBbYnVmZmVyLmJ1ZmZlcl0pXHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiB3b3JsZENvbW1hbmQocGFyYW1zKSB7XHJcbiAgaWYgKHR5cGVvZiBwYXJhbXNbMF0gPT09IFwibnVtYmVyXCIpIHtcclxuICAgIHBhcmFtcy5zaGlmdCgpXHJcbiAgfVxyXG4gIHN3aXRjaCAocGFyYW1zLnNoaWZ0KCkpIHtcclxuICAgIGNhc2UgXCJib2R5XCI6XHJcbiAgICAgIGJvZHlDb21tYW5kKHBhcmFtcylcclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgXCJncmF2aXR5XCI6XHJcbiAgICAgIHdvcmxkLmdyYXZpdHkuY29weShwYXJhbXNbMF0pXHJcbiAgICAgIGJyZWFrXHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBib2R5Q29tbWFuZChwYXJhbXMpIHtcclxuICBsZXQgaWQgPSBwYXJhbXMuc2hpZnQoKVxyXG4gIGxldCBib2R5ID0gYm9kaWVzW2lkXVxyXG4gIHN3aXRjaCAocGFyYW1zLnNoaWZ0KCkpIHtcclxuICAgIGNhc2UgXCJzaGFwZVwiOlxyXG4gICAgICBzaGFwZUNvbW1hbmQoYm9keSwgcGFyYW1zKVxyXG4gICAgICBicmVha1xyXG4gICAgY2FzZSBcImNyZWF0ZVwiOlxyXG4gICAgICBpZiAoYm9keSkge1xyXG4gICAgICAgIHdvcmxkLnJlbW92ZVJpZ2lkQm9keShib2R5KVxyXG4gICAgICAgIGlmIChib2R5Ll9taWRfICE9PSBudWxsKVxyXG4gICAgICAgICAgbW92aW5nQm9kaWVzW2JvZHkuX21pZF9dID0gbnVsbFxyXG4gICAgICB9XHJcbiAgICAgIGJvZGllc1tpZF0gPSBib2R5ID0gd29ybGQuYWRkKHtcclxuICAgICAgICBtb3ZlOiBwYXJhbXNbMF0udHlwZSAhPT0gXCJzdGF0aWNcIixcclxuICAgICAgICBraW5lbWF0aWM6IHBhcmFtc1swXS50eXBlID09PSBcImtpbmVtYXRpY1wiLFxyXG4gICAgICB9KVxyXG4gICAgICBib2R5LnJlc2V0UG9zaXRpb24ocGFyYW1zWzBdLnBvc2l0aW9uLngsIHBhcmFtc1swXS5wb3NpdGlvbi55LCBwYXJhbXNbMF0ucG9zaXRpb24ueilcclxuICAgICAgYm9keS5yZXNldFF1YXRlcm5pb24ocGFyYW1zWzBdLnF1YXRlcm5pb24pXHJcbiAgICAgIGJvZHkuX2lkXyA9IGlkXHJcbiAgICAgIGJvZHkuX21pZF8gPSBwYXJhbXNbMF0ubWlkXHJcbiAgICAgIGlmIChib2R5Ll9taWRfICE9PSBudWxsKVxyXG4gICAgICAgIG1vdmluZ0JvZGllc1tib2R5Ll9taWRfXSA9IGJvZHlcclxuICAgICAgYm9keS5fc2hhcGVzXyA9IFtib2R5LnNoYXBlc11cclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgXCJyZW1vdmVcIjpcclxuICAgICAgd29ybGQucmVtb3ZlUmlnaWRCb2R5KGJvZHkpXHJcbiAgICAgIGJvZGllc1tpZF0gPSBudWxsXHJcbiAgICAgIGlmIChib2R5Ll9taWRfICE9PSBudWxsKVxyXG4gICAgICAgIG1vdmluZ0JvZGllc1tib2R5Ll9taWRfXSA9IG51bGxcclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgXCJ0eXBlXCI6XHJcbiAgICAgIGJvZHkubW92ZSA9IHBhcmFtc1swXSAhPT0gXCJzdGF0aWNcIlxyXG4gICAgICBib2R5LmlzS2luZW1hdGljID0gcGFyYW1zWzBdID09PSBcImtpbmVtYXRpY1wiXHJcblxyXG4gICAgICAvLyBib2R5IGNhbiBzbGVlcCBvciBub3RcclxuICAgICAgaWYgKGJvZHkuaXNLaW5lbWF0aWMpIGJvZHkuYWxsb3dTbGVlcCA9IGZhbHNlXHJcbiAgICAgIGVsc2UgYm9keS5hbGxvd1NsZWVwID0gdHJ1ZVxyXG5cclxuICAgICAgLy8gYm9keSBzdGF0aWMgb3IgZHluYW1pY1xyXG4gICAgICBpZiAoYm9keS5tb3ZlKSB7XHJcbiAgICAgICAgYm9keS5zZXR1cE1hc3MoT0lNTy5CT0RZX0RZTkFNSUMpXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgYm9keS5zZXR1cE1hc3MoT0lNTy5CT0RZX1NUQVRJQylcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gZm9yY2Ugc2xlZXAgb24gbm90XHJcbiAgICAgIGlmIChib2R5Lm1vdmUpIHtcclxuICAgICAgICBib2R5LmF3YWtlKClcclxuICAgICAgfVxyXG4gICAgICBicmVha1xyXG4gICAgY2FzZSBcImJlbG9uZ3NUb1wiOlxyXG4gICAgICBib2R5Ll9iZWxvbmdzVG9fID0gcGFyYW1zWzBdXHJcbiAgICAgIGJvZHkuX3NoYXBlc18uZm9yRWFjaChzaGFwZSA9PiB7IHNoYXBlLmJlbG9uZ3NUbyA9IHBhcmFtc1swXSB9KVxyXG4gICAgICBicmVha1xyXG4gICAgY2FzZSBcImNvbGxpZGVzV2l0aFwiOlxyXG4gICAgICBib2R5Ll9jb2xsaWRlc1dpdGhfID0gcGFyYW1zWzBdXHJcbiAgICAgIGJvZHkuX3NoYXBlc18uZm9yRWFjaChzaGFwZSA9PiB7IHNoYXBlLmNvbGxpZGVzV2l0aCA9IHBhcmFtc1swXSB9KVxyXG4gICAgICBicmVha1xyXG4gICAgY2FzZSBcImVtaXRzV2l0aFwiOlxyXG4gICAgICBib2R5Ll9lbWl0c1dpdGhfID0gcGFyYW1zWzBdXHJcbiAgICAgIC8vIGJvZHkuX3NoYXBlc18uZm9yRWFjaChzaGFwZSA9PiB7IHNoYXBlLl9lbWl0c1dpdGhfID0gcGFyYW1zWzBdIH0pXHJcbiAgICAgIGJyZWFrXHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBzaGFwZUNvbW1hbmQoYm9keSwgcGFyYW1zKSB7XHJcbiAgaWYgKCFib2R5KSByZXR1cm5cclxuICBsZXQgaWQgPSBwYXJhbXMuc2hpZnQoKVxyXG4gIGxldCBzaGFwZSA9IGJvZHkuX3NoYXBlc19baWRdXHJcbiAgc3dpdGNoIChwYXJhbXMuc2hpZnQoKSkge1xyXG4gICAgY2FzZSBcImNyZWF0ZVwiOlxyXG4gICAgICBpZiAoc2hhcGUpXHJcbiAgICAgICAgYm9keS5yZW1vdmVTaGFwZShzaGFwZSlcclxuICAgICAgbGV0IHNjID0gbmV3IE9JTU8uU2hhcGVDb25maWcoKVxyXG4gICAgICBzYy5yZWxhdGl2ZVBvc2l0aW9uLmNvcHkocGFyYW1zWzBdLnBvc2l0aW9uKVxyXG4gICAgICBzYy5yZWxhdGl2ZVJvdGF0aW9uLnNldFF1YXQocXVhdC5jb3B5KHBhcmFtc1swXS5xdWF0ZXJuaW9uKSlcclxuICAgICAgc3dpdGNoIChwYXJhbXNbMF0udHlwZSkge1xyXG4gICAgICAgIGNhc2UgXCJzcGhlcmVcIjogc2hhcGUgPSBuZXcgT0lNTy5TcGhlcmUoc2MsIHBhcmFtc1swXS5zaXplLnggLyAyKTsgYnJlYWtcclxuICAgICAgICBjYXNlIFwiY3lsaW5kZXJcIjogc2hhcGUgPSBuZXcgT0lNTy5DeWxpbmRlcihzYywgcGFyYW1zWzBdLnNpemUueCAvIDIsIHBhcmFtc1swXS5zaXplLnkpOyBicmVha1xyXG4gICAgICAgIC8vIGNhc2UgXCJwbGFuZVwiOiBzaGFwZSA9IG5ldyBPSU1PLlBsYW5lKHNjKTsgYnJlYWtcclxuICAgICAgICBkZWZhdWx0OiBzaGFwZSA9IG5ldyBPSU1PLkJveChzYywgcGFyYW1zWzBdLnNpemUueCwgcGFyYW1zWzBdLnNpemUueSwgcGFyYW1zWzBdLnNpemUueilcclxuICAgICAgfVxyXG4gICAgICBzaGFwZS5faWRfID0gaWRcclxuICAgICAgc2hhcGUuYmVsb25nc1RvID0gYm9keS5fYmVsb25nc1RvX1xyXG4gICAgICBzaGFwZS5jb2xsaWRlc1dpdGggPSBib2R5Ll9jb2xsaWRlc1dpdGhfXHJcbiAgICAgIC8vIHNoYXBlLl9lbWl0c1dpdGhfID0gYm9keS5fZW1pdHNXaXRoX1xyXG4gICAgICBib2R5LmFkZFNoYXBlKGJvZHkuX3NoYXBlc19baWRdID0gc2hhcGUpXHJcbiAgICAgIGJyZWFrXHJcbiAgICBjYXNlIFwicmVtb3ZlXCI6XHJcbiAgICAgIGJvZHkucmVtb3ZlU2hhcGUoc2hhcGUpXHJcbiAgICAgIGJvZHkuX3NoYXBlc19baWRdID0gbnVsbFxyXG4gICAgICBicmVha1xyXG4gIH1cclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIGVtaXRDb2xsaXNpb25zKGJvZHkpIHtcclxuICBsZXQgYjEsIGIyXHJcbiAgbGV0IGNvbnRhY3QgPSB3b3JsZC5jb250YWN0c1xyXG4gIHdoaWxlIChjb250YWN0ICE9PSBudWxsKSB7XHJcbiAgICBiMSA9IGNvbnRhY3QuYm9keTFcclxuICAgIGIyID0gY29udGFjdC5ib2R5MlxyXG4gICAgaWYgKChiMSA9PT0gYm9keSAmJiAoYjIuX2JlbG9uZ3NUb18gJiBiMS5fZW1pdHNXaXRoXykpIHx8IChiMiA9PT0gYm9keSAmJiAoYjEuX2JlbG9uZ3NUb18gJiBiMi5fZW1pdHNXaXRoXykpKSB7XHJcbiAgICAgIGlmIChjb250YWN0LnRvdWNoaW5nICYmICFjb250YWN0LmNsb3NlKSB7XHJcbiAgICAgICAgbGV0IG90aGVyID0gYjEgPT09IGJvZHkgPyBiMiA6IGIxXHJcbiAgICAgICAgbGV0IHNoYXBlMSA9IGIxID09PSBib2R5ID8gY29udGFjdC5zaGFwZTEgOiBjb250YWN0LnNoYXBlMlxyXG4gICAgICAgIGxldCBzaGFwZTIgPSBiMSA9PT0gYm9keSA/IGNvbnRhY3Quc2hhcGUyIDogY29udGFjdC5zaGFwZTFcclxuICAgICAgICBsZXQgZXZlbnQgPSB7XHJcbiAgICAgICAgICBldmVudDogXCJjb2xsaXNpb25cIixcclxuICAgICAgICAgIGJvZHkxOiBib2R5Ll9pZF8sXHJcbiAgICAgICAgICBib2R5Mjogb3RoZXIuX2lkXyxcclxuICAgICAgICAgIHNoYXBlMTogc2hhcGUxLl9pZF8sXHJcbiAgICAgICAgICBzaGFwZTI6IHNoYXBlMi5faWRfXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHBvc3RNZXNzYWdlKFwid29ybGQgYm9keSBcIiArIGJvZHkuX2lkXyArIFwiIGVtaXRzIFwiICsgY21kLnN0cmluZ2lmeVBhcmFtKGV2ZW50KSlcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgY29udGFjdCA9IGNvbnRhY3QubmV4dFxyXG4gIH1cclxufVxyXG5cclxuaW5pdCgpIl19
