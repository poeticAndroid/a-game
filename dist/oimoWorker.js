(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
},{}],2:[function(require,module,exports){
(function (global){(function (){
/* global AFRAME, THREE, OIMO */

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
    let command = parseCommand(e.data)
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
      world.step()
      nextStep += world.timerate
    }
    if (now > nextStep) {
      nextStep = now
    }
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
      } else {
        buffer[p++] = body.pos.x
        buffer[p++] = body.pos.y
        buffer[p++] = body.pos.z
        p++
        buffer[p++] = body.quaternion.x
        buffer[p++] = body.quaternion.y
        buffer[p++] = body.quaternion.z
        buffer[p++] = body.quaternion.w
      }
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
    case "create":
      console.log(params)
      bodies[id] = body = world.add({
        move: params[0].type === "dynamic",
        kinematic: params[0].type === "kinematic",
      })
      body.resetQuaternion(params[0].quaternion)
      body.resetPosition(params[0].position.x, params[0].position.y, params[0].position.z)
      body._mid_ = params[0].mid
      if (body._mid_ !== null)
        movingBodies[body._mid_] = body
      break
    case "remove":
      world.removeRigidBody(body)
      bodies[id] = null
      if (body._mid_ !== null)
        movingBodies[body._mid_] = null
      break
    case "position":
      body.position.copy(params[0])
      break
  }
}

function parseCommand(cmd) {
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
}

init()
}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./libs/oimo":1}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvbGlicy9vaW1vLmpzIiwic3JjL29pbW9Xb3JrZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQzErWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIoZnVuY3Rpb24gKGdsb2JhbCwgZmFjdG9yeSkge1xyXG4gIHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyA/IGZhY3RvcnkoZXhwb3J0cykgOlxyXG4gICAgdHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kID8gZGVmaW5lKFsnZXhwb3J0cyddLCBmYWN0b3J5KSA6XHJcbiAgICAgIChnbG9iYWwgPSBnbG9iYWwgfHwgc2VsZiwgZmFjdG9yeShnbG9iYWwuT0lNTyA9IHt9KSk7XHJcbn0odGhpcywgZnVuY3Rpb24gKGV4cG9ydHMpIHtcclxuICAndXNlIHN0cmljdCc7XHJcblxyXG4gIC8vIFBvbHlmaWxsc1xyXG5cclxuICBpZiAoTnVtYmVyLkVQU0lMT04gPT09IHVuZGVmaW5lZCkge1xyXG5cclxuICAgIE51bWJlci5FUFNJTE9OID0gTWF0aC5wb3coMiwgLSA1Mik7XHJcblxyXG4gIH1cclxuXHJcbiAgLy9cclxuXHJcbiAgaWYgKE1hdGguc2lnbiA9PT0gdW5kZWZpbmVkKSB7XHJcblxyXG4gICAgLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvTWF0aC9zaWduXHJcblxyXG4gICAgTWF0aC5zaWduID0gZnVuY3Rpb24gKHgpIHtcclxuXHJcbiAgICAgIHJldHVybiAoeCA8IDApID8gLSAxIDogKHggPiAwKSA/IDEgOiArIHg7XHJcblxyXG4gICAgfTtcclxuXHJcbiAgfVxyXG5cclxuICBpZiAoRnVuY3Rpb24ucHJvdG90eXBlLm5hbWUgPT09IHVuZGVmaW5lZCkge1xyXG5cclxuICAgIC8vIE1pc3NpbmcgaW4gSUU5LTExLlxyXG4gICAgLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvRnVuY3Rpb24vbmFtZVxyXG5cclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShGdW5jdGlvbi5wcm90b3R5cGUsICduYW1lJywge1xyXG5cclxuICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzLnRvU3RyaW5nKCkubWF0Y2goL15cXHMqZnVuY3Rpb25cXHMqKFteXFwoXFxzXSopLylbMV07XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgfSk7XHJcblxyXG4gIH1cclxuXHJcbiAgaWYgKE9iamVjdC5hc3NpZ24gPT09IHVuZGVmaW5lZCkge1xyXG5cclxuICAgIC8vIE1pc3NpbmcgaW4gSUUuXHJcbiAgICAvLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9PYmplY3QvYXNzaWduXHJcblxyXG4gICAgKGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgIE9iamVjdC5hc3NpZ24gPSBmdW5jdGlvbiAodGFyZ2V0KSB7XHJcblxyXG4gICAgICAgIGlmICh0YXJnZXQgPT09IHVuZGVmaW5lZCB8fCB0YXJnZXQgPT09IG51bGwpIHtcclxuXHJcbiAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY29udmVydCB1bmRlZmluZWQgb3IgbnVsbCB0byBvYmplY3QnKTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgb3V0cHV0ID0gT2JqZWN0KHRhcmdldCk7XHJcblxyXG4gICAgICAgIGZvciAodmFyIGluZGV4ID0gMTsgaW5kZXggPCBhcmd1bWVudHMubGVuZ3RoOyBpbmRleCsrKSB7XHJcblxyXG4gICAgICAgICAgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpbmRleF07XHJcblxyXG4gICAgICAgICAgaWYgKHNvdXJjZSAhPT0gdW5kZWZpbmVkICYmIHNvdXJjZSAhPT0gbnVsbCkge1xyXG5cclxuICAgICAgICAgICAgZm9yICh2YXIgbmV4dEtleSBpbiBzb3VyY2UpIHtcclxuXHJcbiAgICAgICAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIG5leHRLZXkpKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgb3V0cHV0W25leHRLZXldID0gc291cmNlW25leHRLZXldO1xyXG5cclxuICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBvdXRwdXQ7XHJcblxyXG4gICAgICB9O1xyXG5cclxuICAgIH0pKCk7XHJcblxyXG4gIH1cclxuXHJcbiAgLypcclxuICAgKiBBIGxpc3Qgb2YgY29uc3RhbnRzIGJ1aWx0LWluIGZvclxyXG4gICAqIHRoZSBwaHlzaWNzIGVuZ2luZS5cclxuICAgKi9cclxuXHJcbiAgdmFyIFJFVklTSU9OID0gJzEuMC45JztcclxuXHJcbiAgLy8gQnJvYWRQaGFzZVxyXG4gIHZhciBCUl9OVUxMID0gMDtcclxuICB2YXIgQlJfQlJVVEVfRk9SQ0UgPSAxO1xyXG4gIHZhciBCUl9TV0VFUF9BTkRfUFJVTkUgPSAyO1xyXG4gIHZhciBCUl9CT1VORElOR19WT0xVTUVfVFJFRSA9IDM7XHJcblxyXG4gIC8vIEJvZHkgdHlwZVxyXG4gIHZhciBCT0RZX05VTEwgPSAwO1xyXG4gIHZhciBCT0RZX0RZTkFNSUMgPSAxO1xyXG4gIHZhciBCT0RZX1NUQVRJQyA9IDI7XHJcbiAgdmFyIEJPRFlfS0lORU1BVElDID0gMztcclxuICB2YXIgQk9EWV9HSE9TVCA9IDQ7XHJcblxyXG4gIC8vIFNoYXBlIHR5cGVcclxuICB2YXIgU0hBUEVfTlVMTCA9IDA7XHJcbiAgdmFyIFNIQVBFX1NQSEVSRSA9IDE7XHJcbiAgdmFyIFNIQVBFX0JPWCA9IDI7XHJcbiAgdmFyIFNIQVBFX0NZTElOREVSID0gMztcclxuICB2YXIgU0hBUEVfUExBTkUgPSA0O1xyXG4gIHZhciBTSEFQRV9QQVJUSUNMRSA9IDU7XHJcbiAgdmFyIFNIQVBFX1RFVFJBID0gNjtcclxuXHJcbiAgLy8gSm9pbnQgdHlwZVxyXG4gIHZhciBKT0lOVF9OVUxMID0gMDtcclxuICB2YXIgSk9JTlRfRElTVEFOQ0UgPSAxO1xyXG4gIHZhciBKT0lOVF9CQUxMX0FORF9TT0NLRVQgPSAyO1xyXG4gIHZhciBKT0lOVF9ISU5HRSA9IDM7XHJcbiAgdmFyIEpPSU5UX1dIRUVMID0gNDtcclxuICB2YXIgSk9JTlRfU0xJREVSID0gNTtcclxuICB2YXIgSk9JTlRfUFJJU01BVElDID0gNjtcclxuXHJcbiAgLy8gQUFCQiBhcHJveGltYXRpb25cclxuICB2YXIgQUFCQl9QUk9YID0gMC4wMDU7XHJcblxyXG4gIHZhciBfTWF0aCA9IHtcclxuXHJcbiAgICBzcXJ0OiBNYXRoLnNxcnQsXHJcbiAgICBhYnM6IE1hdGguYWJzLFxyXG4gICAgZmxvb3I6IE1hdGguZmxvb3IsXHJcbiAgICBjb3M6IE1hdGguY29zLFxyXG4gICAgc2luOiBNYXRoLnNpbixcclxuICAgIGFjb3M6IE1hdGguYWNvcyxcclxuICAgIGFzaW46IE1hdGguYXNpbixcclxuICAgIGF0YW4yOiBNYXRoLmF0YW4yLFxyXG4gICAgcm91bmQ6IE1hdGgucm91bmQsXHJcbiAgICBwb3c6IE1hdGgucG93LFxyXG4gICAgbWF4OiBNYXRoLm1heCxcclxuICAgIG1pbjogTWF0aC5taW4sXHJcbiAgICByYW5kb206IE1hdGgucmFuZG9tLFxyXG5cclxuICAgIGRlZ3RvcmFkOiAwLjAxNzQ1MzI5MjUxOTk0MzI5NTcsXHJcbiAgICByYWR0b2RlZzogNTcuMjk1Nzc5NTEzMDgyMzIwODc2LFxyXG4gICAgUEk6IDMuMTQxNTkyNjUzNTg5NzkzLFxyXG4gICAgVHdvUEk6IDYuMjgzMTg1MzA3MTc5NTg2LFxyXG4gICAgUEk5MDogMS41NzA3OTYzMjY3OTQ4OTYsXHJcbiAgICBQSTI3MDogNC43MTIzODg5ODAzODQ2ODksXHJcblxyXG4gICAgSU5GOiBJbmZpbml0eSxcclxuICAgIEVQWjogMC4wMDAwMSxcclxuICAgIEVQWjI6IDAuMDAwMDAxLFxyXG5cclxuICAgIGxlcnA6IGZ1bmN0aW9uICh4LCB5LCB0KSB7XHJcblxyXG4gICAgICByZXR1cm4gKDEgLSB0KSAqIHggKyB0ICogeTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHJhbmRJbnQ6IGZ1bmN0aW9uIChsb3csIGhpZ2gpIHtcclxuXHJcbiAgICAgIHJldHVybiBsb3cgKyBfTWF0aC5mbG9vcihfTWF0aC5yYW5kb20oKSAqIChoaWdoIC0gbG93ICsgMSkpO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgcmFuZDogZnVuY3Rpb24gKGxvdywgaGlnaCkge1xyXG5cclxuICAgICAgcmV0dXJuIGxvdyArIF9NYXRoLnJhbmRvbSgpICogKGhpZ2ggLSBsb3cpO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgZ2VuZXJhdGVVVUlEOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAvLyBodHRwOi8vd3d3LmJyb29mYS5jb20vVG9vbHMvTWF0aC51dWlkLmh0bVxyXG5cclxuICAgICAgdmFyIGNoYXJzID0gJzAxMjM0NTY3ODlBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6Jy5zcGxpdCgnJyk7XHJcbiAgICAgIHZhciB1dWlkID0gbmV3IEFycmF5KDM2KTtcclxuICAgICAgdmFyIHJuZCA9IDAsIHI7XHJcblxyXG4gICAgICByZXR1cm4gZnVuY3Rpb24gZ2VuZXJhdGVVVUlEKCkge1xyXG5cclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDM2OyBpKyspIHtcclxuXHJcbiAgICAgICAgICBpZiAoaSA9PT0gOCB8fCBpID09PSAxMyB8fCBpID09PSAxOCB8fCBpID09PSAyMykge1xyXG5cclxuICAgICAgICAgICAgdXVpZFtpXSA9ICctJztcclxuXHJcbiAgICAgICAgICB9IGVsc2UgaWYgKGkgPT09IDE0KSB7XHJcblxyXG4gICAgICAgICAgICB1dWlkW2ldID0gJzQnO1xyXG5cclxuICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICBpZiAocm5kIDw9IDB4MDIpIHJuZCA9IDB4MjAwMDAwMCArIChNYXRoLnJhbmRvbSgpICogMHgxMDAwMDAwKSB8IDA7XHJcbiAgICAgICAgICAgIHIgPSBybmQgJiAweGY7XHJcbiAgICAgICAgICAgIHJuZCA9IHJuZCA+PiA0O1xyXG4gICAgICAgICAgICB1dWlkW2ldID0gY2hhcnNbKGkgPT09IDE5KSA/IChyICYgMHgzKSB8IDB4OCA6IHJdO1xyXG5cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdXVpZC5qb2luKCcnKTtcclxuXHJcbiAgICAgIH07XHJcblxyXG4gICAgfSgpLFxyXG5cclxuICAgIGludDogZnVuY3Rpb24gKHgpIHtcclxuXHJcbiAgICAgIHJldHVybiBfTWF0aC5mbG9vcih4KTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGZpeDogZnVuY3Rpb24gKHgsIG4pIHtcclxuXHJcbiAgICAgIHJldHVybiB4LnRvRml4ZWQobiB8fCAzLCAxMCk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBjbGFtcDogZnVuY3Rpb24gKHZhbHVlLCBtaW4sIG1heCkge1xyXG5cclxuICAgICAgcmV0dXJuIF9NYXRoLm1heChtaW4sIF9NYXRoLm1pbihtYXgsIHZhbHVlKSk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICAvL2NsYW1wOiBmdW5jdGlvbiAoIHgsIGEsIGIgKSB7IHJldHVybiAoIHggPCBhICkgPyBhIDogKCAoIHggPiBiICkgPyBiIDogeCApOyB9LFxyXG5cclxuXHJcblxyXG4gICAgZGlzdGFuY2U6IGZ1bmN0aW9uIChwMSwgcDIpIHtcclxuXHJcbiAgICAgIHZhciB4ZCA9IHAyWzBdIC0gcDFbMF07XHJcbiAgICAgIHZhciB5ZCA9IHAyWzFdIC0gcDFbMV07XHJcbiAgICAgIHZhciB6ZCA9IHAyWzJdIC0gcDFbMl07XHJcbiAgICAgIHJldHVybiBfTWF0aC5zcXJ0KHhkICogeGQgKyB5ZCAqIHlkICsgemQgKiB6ZCk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICAvKnVud3JhcERlZ3JlZXM6IGZ1bmN0aW9uICggciApIHtcclxuXHJcbiAgICAgICAgciA9IHIgJSAzNjA7XHJcbiAgICAgICAgaWYgKHIgPiAxODApIHIgLT0gMzYwO1xyXG4gICAgICAgIGlmIChyIDwgLTE4MCkgciArPSAzNjA7XHJcbiAgICAgICAgcmV0dXJuIHI7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICB1bndyYXBSYWRpYW46IGZ1bmN0aW9uKCByICl7XHJcblxyXG4gICAgICAgIHIgPSByICUgX01hdGguVHdvUEk7XHJcbiAgICAgICAgaWYgKHIgPiBfTWF0aC5QSSkgciAtPSBfTWF0aC5Ud29QSTtcclxuICAgICAgICBpZiAociA8IC1fTWF0aC5QSSkgciArPSBfTWF0aC5Ud29QSTtcclxuICAgICAgICByZXR1cm4gcjtcclxuXHJcbiAgICB9LCovXHJcblxyXG4gICAgYWNvc0NsYW1wOiBmdW5jdGlvbiAoY29zKSB7XHJcblxyXG4gICAgICBpZiAoY29zID4gMSkgcmV0dXJuIDA7XHJcbiAgICAgIGVsc2UgaWYgKGNvcyA8IC0xKSByZXR1cm4gX01hdGguUEk7XHJcbiAgICAgIGVsc2UgcmV0dXJuIF9NYXRoLmFjb3MoY29zKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGRpc3RhbmNlVmVjdG9yOiBmdW5jdGlvbiAodjEsIHYyKSB7XHJcblxyXG4gICAgICB2YXIgeGQgPSB2MS54IC0gdjIueDtcclxuICAgICAgdmFyIHlkID0gdjEueSAtIHYyLnk7XHJcbiAgICAgIHZhciB6ZCA9IHYxLnogLSB2Mi56O1xyXG4gICAgICByZXR1cm4geGQgKiB4ZCArIHlkICogeWQgKyB6ZCAqIHpkO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgZG90VmVjdG9yczogZnVuY3Rpb24gKGEsIGIpIHtcclxuXHJcbiAgICAgIHJldHVybiBhLnggKiBiLnggKyBhLnkgKiBiLnkgKyBhLnogKiBiLno7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgfTtcclxuXHJcbiAgZnVuY3Rpb24gcHJpbnRFcnJvcihjbGF6eiwgbXNnKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKFwiW09JTU9dIFwiICsgY2xhenogKyBcIjogXCIgKyBtc2cpO1xyXG4gIH1cclxuXHJcbiAgLy8gQSBwZXJmb3JtYW5jZSBldmFsdWF0b3JcclxuXHJcbiAgZnVuY3Rpb24gSW5mb0Rpc3BsYXkod29ybGQpIHtcclxuXHJcbiAgICB0aGlzLnBhcmVudCA9IHdvcmxkO1xyXG5cclxuICAgIHRoaXMuaW5mb3MgPSBuZXcgRmxvYXQzMkFycmF5KDEzKTtcclxuICAgIHRoaXMuZiA9IFswLCAwLCAwXTtcclxuXHJcbiAgICB0aGlzLnRpbWVzID0gWzAsIDAsIDAsIDBdO1xyXG5cclxuICAgIHRoaXMuYnJvYWRQaGFzZSA9IHRoaXMucGFyZW50LmJyb2FkUGhhc2VUeXBlO1xyXG5cclxuICAgIHRoaXMudmVyc2lvbiA9IFJFVklTSU9OO1xyXG5cclxuICAgIHRoaXMuZnBzID0gMDtcclxuXHJcbiAgICB0aGlzLnR0ID0gMDtcclxuXHJcbiAgICB0aGlzLmJyb2FkUGhhc2VUaW1lID0gMDtcclxuICAgIHRoaXMubmFycm93UGhhc2VUaW1lID0gMDtcclxuICAgIHRoaXMuc29sdmluZ1RpbWUgPSAwO1xyXG4gICAgdGhpcy50b3RhbFRpbWUgPSAwO1xyXG4gICAgdGhpcy51cGRhdGVUaW1lID0gMDtcclxuXHJcbiAgICB0aGlzLk1heEJyb2FkUGhhc2VUaW1lID0gMDtcclxuICAgIHRoaXMuTWF4TmFycm93UGhhc2VUaW1lID0gMDtcclxuICAgIHRoaXMuTWF4U29sdmluZ1RpbWUgPSAwO1xyXG4gICAgdGhpcy5NYXhUb3RhbFRpbWUgPSAwO1xyXG4gICAgdGhpcy5NYXhVcGRhdGVUaW1lID0gMDtcclxuICB9XHJcbiAgT2JqZWN0LmFzc2lnbihJbmZvRGlzcGxheS5wcm90b3R5cGUsIHtcclxuXHJcbiAgICBzZXRUaW1lOiBmdW5jdGlvbiAobikge1xyXG4gICAgICB0aGlzLnRpbWVzW24gfHwgMF0gPSBwZXJmb3JtYW5jZS5ub3coKTtcclxuICAgIH0sXHJcblxyXG4gICAgcmVzZXRNYXg6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgIHRoaXMuTWF4QnJvYWRQaGFzZVRpbWUgPSAwO1xyXG4gICAgICB0aGlzLk1heE5hcnJvd1BoYXNlVGltZSA9IDA7XHJcbiAgICAgIHRoaXMuTWF4U29sdmluZ1RpbWUgPSAwO1xyXG4gICAgICB0aGlzLk1heFRvdGFsVGltZSA9IDA7XHJcbiAgICAgIHRoaXMuTWF4VXBkYXRlVGltZSA9IDA7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBjYWxjQnJvYWRQaGFzZTogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgdGhpcy5zZXRUaW1lKDIpO1xyXG4gICAgICB0aGlzLmJyb2FkUGhhc2VUaW1lID0gdGhpcy50aW1lc1syXSAtIHRoaXMudGltZXNbMV07XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBjYWxjTmFycm93UGhhc2U6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgIHRoaXMuc2V0VGltZSgzKTtcclxuICAgICAgdGhpcy5uYXJyb3dQaGFzZVRpbWUgPSB0aGlzLnRpbWVzWzNdIC0gdGhpcy50aW1lc1syXTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGNhbGNFbmQ6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgIHRoaXMuc2V0VGltZSgyKTtcclxuICAgICAgdGhpcy5zb2x2aW5nVGltZSA9IHRoaXMudGltZXNbMl0gLSB0aGlzLnRpbWVzWzFdO1xyXG4gICAgICB0aGlzLnRvdGFsVGltZSA9IHRoaXMudGltZXNbMl0gLSB0aGlzLnRpbWVzWzBdO1xyXG4gICAgICB0aGlzLnVwZGF0ZVRpbWUgPSB0aGlzLnRvdGFsVGltZSAtICh0aGlzLmJyb2FkUGhhc2VUaW1lICsgdGhpcy5uYXJyb3dQaGFzZVRpbWUgKyB0aGlzLnNvbHZpbmdUaW1lKTtcclxuXHJcbiAgICAgIGlmICh0aGlzLnR0ID09PSAxMDApIHRoaXMucmVzZXRNYXgoKTtcclxuXHJcbiAgICAgIGlmICh0aGlzLnR0ID4gMTAwKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuYnJvYWRQaGFzZVRpbWUgPiB0aGlzLk1heEJyb2FkUGhhc2VUaW1lKSB0aGlzLk1heEJyb2FkUGhhc2VUaW1lID0gdGhpcy5icm9hZFBoYXNlVGltZTtcclxuICAgICAgICBpZiAodGhpcy5uYXJyb3dQaGFzZVRpbWUgPiB0aGlzLk1heE5hcnJvd1BoYXNlVGltZSkgdGhpcy5NYXhOYXJyb3dQaGFzZVRpbWUgPSB0aGlzLm5hcnJvd1BoYXNlVGltZTtcclxuICAgICAgICBpZiAodGhpcy5zb2x2aW5nVGltZSA+IHRoaXMuTWF4U29sdmluZ1RpbWUpIHRoaXMuTWF4U29sdmluZ1RpbWUgPSB0aGlzLnNvbHZpbmdUaW1lO1xyXG4gICAgICAgIGlmICh0aGlzLnRvdGFsVGltZSA+IHRoaXMuTWF4VG90YWxUaW1lKSB0aGlzLk1heFRvdGFsVGltZSA9IHRoaXMudG90YWxUaW1lO1xyXG4gICAgICAgIGlmICh0aGlzLnVwZGF0ZVRpbWUgPiB0aGlzLk1heFVwZGF0ZVRpbWUpIHRoaXMuTWF4VXBkYXRlVGltZSA9IHRoaXMudXBkYXRlVGltZTtcclxuICAgICAgfVxyXG5cclxuXHJcbiAgICAgIHRoaXMudXBmcHMoKTtcclxuXHJcbiAgICAgIHRoaXMudHQrKztcclxuICAgICAgaWYgKHRoaXMudHQgPiA1MDApIHRoaXMudHQgPSAwO1xyXG5cclxuICAgIH0sXHJcblxyXG5cclxuICAgIHVwZnBzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHRoaXMuZlsxXSA9IERhdGUubm93KCk7XHJcbiAgICAgIGlmICh0aGlzLmZbMV0gLSAxMDAwID4gdGhpcy5mWzBdKSB7IHRoaXMuZlswXSA9IHRoaXMuZlsxXTsgdGhpcy5mcHMgPSB0aGlzLmZbMl07IHRoaXMuZlsyXSA9IDA7IH0gdGhpcy5mWzJdKys7XHJcbiAgICB9LFxyXG5cclxuICAgIHNob3c6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgdmFyIGluZm8gPSBbXHJcbiAgICAgICAgXCJPaW1vLmpzIFwiICsgdGhpcy52ZXJzaW9uICsgXCI8YnI+XCIsXHJcbiAgICAgICAgdGhpcy5icm9hZFBoYXNlICsgXCI8YnI+PGJyPlwiLFxyXG4gICAgICAgIFwiRlBTOiBcIiArIHRoaXMuZnBzICsgXCIgZnBzPGJyPjxicj5cIixcclxuICAgICAgICBcInJpZ2lkYm9keSBcIiArIHRoaXMucGFyZW50Lm51bVJpZ2lkQm9kaWVzICsgXCI8YnI+XCIsXHJcbiAgICAgICAgXCJjb250YWN0ICZuYnNwOyZuYnNwO1wiICsgdGhpcy5wYXJlbnQubnVtQ29udGFjdHMgKyBcIjxicj5cIixcclxuICAgICAgICBcImN0LXBvaW50ICZuYnNwO1wiICsgdGhpcy5wYXJlbnQubnVtQ29udGFjdFBvaW50cyArIFwiPGJyPlwiLFxyXG4gICAgICAgIFwicGFpcmNoZWNrIFwiICsgdGhpcy5wYXJlbnQuYnJvYWRQaGFzZS5udW1QYWlyQ2hlY2tzICsgXCI8YnI+XCIsXHJcbiAgICAgICAgXCJpc2xhbmQgJm5ic3A7Jm5ic3A7Jm5ic3A7XCIgKyB0aGlzLnBhcmVudC5udW1Jc2xhbmRzICsgXCI8YnI+PGJyPlwiLFxyXG4gICAgICAgIFwiVGltZSBpbiBtaWxsaXNlY29uZHM8YnI+PGJyPlwiLFxyXG4gICAgICAgIFwiYnJvYWRwaGFzZSAmbmJzcDtcIiArIF9NYXRoLmZpeCh0aGlzLmJyb2FkUGhhc2VUaW1lKSArIFwiIHwgXCIgKyBfTWF0aC5maXgodGhpcy5NYXhCcm9hZFBoYXNlVGltZSkgKyBcIjxicj5cIixcclxuICAgICAgICBcIm5hcnJvd3BoYXNlIFwiICsgX01hdGguZml4KHRoaXMubmFycm93UGhhc2VUaW1lKSArIFwiIHwgXCIgKyBfTWF0aC5maXgodGhpcy5NYXhOYXJyb3dQaGFzZVRpbWUpICsgXCI8YnI+XCIsXHJcbiAgICAgICAgXCJzb2x2aW5nICZuYnNwOyZuYnNwOyZuYnNwOyZuYnNwO1wiICsgX01hdGguZml4KHRoaXMuc29sdmluZ1RpbWUpICsgXCIgfCBcIiArIF9NYXRoLmZpeCh0aGlzLk1heFNvbHZpbmdUaW1lKSArIFwiPGJyPlwiLFxyXG4gICAgICAgIFwidG90YWwgJm5ic3A7Jm5ic3A7Jm5ic3A7Jm5ic3A7Jm5ic3A7Jm5ic3A7XCIgKyBfTWF0aC5maXgodGhpcy50b3RhbFRpbWUpICsgXCIgfCBcIiArIF9NYXRoLmZpeCh0aGlzLk1heFRvdGFsVGltZSkgKyBcIjxicj5cIixcclxuICAgICAgICBcInVwZGF0aW5nICZuYnNwOyZuYnNwOyZuYnNwO1wiICsgX01hdGguZml4KHRoaXMudXBkYXRlVGltZSkgKyBcIiB8IFwiICsgX01hdGguZml4KHRoaXMuTWF4VXBkYXRlVGltZSkgKyBcIjxicj5cIlxyXG4gICAgICBdLmpvaW4oXCJcXG5cIik7XHJcbiAgICAgIHJldHVybiBpbmZvO1xyXG4gICAgfSxcclxuXHJcbiAgICB0b0FycmF5OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHRoaXMuaW5mb3NbMF0gPSB0aGlzLnBhcmVudC5icm9hZFBoYXNlLnR5cGVzO1xyXG4gICAgICB0aGlzLmluZm9zWzFdID0gdGhpcy5wYXJlbnQubnVtUmlnaWRCb2RpZXM7XHJcbiAgICAgIHRoaXMuaW5mb3NbMl0gPSB0aGlzLnBhcmVudC5udW1Db250YWN0cztcclxuICAgICAgdGhpcy5pbmZvc1szXSA9IHRoaXMucGFyZW50LmJyb2FkUGhhc2UubnVtUGFpckNoZWNrcztcclxuICAgICAgdGhpcy5pbmZvc1s0XSA9IHRoaXMucGFyZW50Lm51bUNvbnRhY3RQb2ludHM7XHJcbiAgICAgIHRoaXMuaW5mb3NbNV0gPSB0aGlzLnBhcmVudC5udW1Jc2xhbmRzO1xyXG4gICAgICB0aGlzLmluZm9zWzZdID0gdGhpcy5icm9hZFBoYXNlVGltZTtcclxuICAgICAgdGhpcy5pbmZvc1s3XSA9IHRoaXMubmFycm93UGhhc2VUaW1lO1xyXG4gICAgICB0aGlzLmluZm9zWzhdID0gdGhpcy5zb2x2aW5nVGltZTtcclxuICAgICAgdGhpcy5pbmZvc1s5XSA9IHRoaXMudXBkYXRlVGltZTtcclxuICAgICAgdGhpcy5pbmZvc1sxMF0gPSB0aGlzLnRvdGFsVGltZTtcclxuICAgICAgdGhpcy5pbmZvc1sxMV0gPSB0aGlzLmZwcztcclxuICAgICAgcmV0dXJuIHRoaXMuaW5mb3M7XHJcbiAgICB9XHJcblxyXG4gIH0pO1xyXG5cclxuICBmdW5jdGlvbiBWZWMzKHgsIHksIHopIHtcclxuXHJcbiAgICB0aGlzLnggPSB4IHx8IDA7XHJcbiAgICB0aGlzLnkgPSB5IHx8IDA7XHJcbiAgICB0aGlzLnogPSB6IHx8IDA7XHJcblxyXG4gIH1cclxuXHJcbiAgT2JqZWN0LmFzc2lnbihWZWMzLnByb3RvdHlwZSwge1xyXG5cclxuICAgIFZlYzM6IHRydWUsXHJcblxyXG4gICAgc2V0OiBmdW5jdGlvbiAoeCwgeSwgeikge1xyXG5cclxuICAgICAgdGhpcy54ID0geDtcclxuICAgICAgdGhpcy55ID0geTtcclxuICAgICAgdGhpcy56ID0gejtcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBhZGQ6IGZ1bmN0aW9uIChhLCBiKSB7XHJcblxyXG4gICAgICBpZiAoYiAhPT0gdW5kZWZpbmVkKSByZXR1cm4gdGhpcy5hZGRWZWN0b3JzKGEsIGIpO1xyXG5cclxuICAgICAgdGhpcy54ICs9IGEueDtcclxuICAgICAgdGhpcy55ICs9IGEueTtcclxuICAgICAgdGhpcy56ICs9IGEuejtcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBhZGRWZWN0b3JzOiBmdW5jdGlvbiAoYSwgYikge1xyXG5cclxuICAgICAgdGhpcy54ID0gYS54ICsgYi54O1xyXG4gICAgICB0aGlzLnkgPSBhLnkgKyBiLnk7XHJcbiAgICAgIHRoaXMueiA9IGEueiArIGIuejtcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBhZGRFcXVhbDogZnVuY3Rpb24gKHYpIHtcclxuXHJcbiAgICAgIHRoaXMueCArPSB2Lng7XHJcbiAgICAgIHRoaXMueSArPSB2Lnk7XHJcbiAgICAgIHRoaXMueiArPSB2Lno7XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgc3ViOiBmdW5jdGlvbiAoYSwgYikge1xyXG5cclxuICAgICAgaWYgKGIgIT09IHVuZGVmaW5lZCkgcmV0dXJuIHRoaXMuc3ViVmVjdG9ycyhhLCBiKTtcclxuXHJcbiAgICAgIHRoaXMueCAtPSBhLng7XHJcbiAgICAgIHRoaXMueSAtPSBhLnk7XHJcbiAgICAgIHRoaXMueiAtPSBhLno7XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgc3ViVmVjdG9yczogZnVuY3Rpb24gKGEsIGIpIHtcclxuXHJcbiAgICAgIHRoaXMueCA9IGEueCAtIGIueDtcclxuICAgICAgdGhpcy55ID0gYS55IC0gYi55O1xyXG4gICAgICB0aGlzLnogPSBhLnogLSBiLno7XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgc3ViRXF1YWw6IGZ1bmN0aW9uICh2KSB7XHJcblxyXG4gICAgICB0aGlzLnggLT0gdi54O1xyXG4gICAgICB0aGlzLnkgLT0gdi55O1xyXG4gICAgICB0aGlzLnogLT0gdi56O1xyXG4gICAgICByZXR1cm4gdGhpcztcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHNjYWxlOiBmdW5jdGlvbiAodiwgcykge1xyXG5cclxuICAgICAgdGhpcy54ID0gdi54ICogcztcclxuICAgICAgdGhpcy55ID0gdi55ICogcztcclxuICAgICAgdGhpcy56ID0gdi56ICogcztcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBzY2FsZUVxdWFsOiBmdW5jdGlvbiAocykge1xyXG5cclxuICAgICAgdGhpcy54ICo9IHM7XHJcbiAgICAgIHRoaXMueSAqPSBzO1xyXG4gICAgICB0aGlzLnogKj0gcztcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBtdWx0aXBseTogZnVuY3Rpb24gKHYpIHtcclxuXHJcbiAgICAgIHRoaXMueCAqPSB2Lng7XHJcbiAgICAgIHRoaXMueSAqPSB2Lnk7XHJcbiAgICAgIHRoaXMueiAqPSB2Lno7XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgLypzY2FsZVY6IGZ1bmN0aW9uKCB2ICl7XHJcblxyXG4gICAgICAgIHRoaXMueCAqPSB2Lng7XHJcbiAgICAgICAgdGhpcy55ICo9IHYueTtcclxuICAgICAgICB0aGlzLnogKj0gdi56O1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgc2NhbGVWZWN0b3JFcXVhbDogZnVuY3Rpb24oIHYgKXtcclxuXHJcbiAgICAgICAgdGhpcy54ICo9IHYueDtcclxuICAgICAgICB0aGlzLnkgKj0gdi55O1xyXG4gICAgICAgIHRoaXMueiAqPSB2Lno7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcblxyXG4gICAgfSwqL1xyXG5cclxuICAgIGFkZFNjYWxlZFZlY3RvcjogZnVuY3Rpb24gKHYsIHMpIHtcclxuXHJcbiAgICAgIHRoaXMueCArPSB2LnggKiBzO1xyXG4gICAgICB0aGlzLnkgKz0gdi55ICogcztcclxuICAgICAgdGhpcy56ICs9IHYueiAqIHM7XHJcblxyXG4gICAgICByZXR1cm4gdGhpcztcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHN1YlNjYWxlZFZlY3RvcjogZnVuY3Rpb24gKHYsIHMpIHtcclxuXHJcbiAgICAgIHRoaXMueCAtPSB2LnggKiBzO1xyXG4gICAgICB0aGlzLnkgLT0gdi55ICogcztcclxuICAgICAgdGhpcy56IC09IHYueiAqIHM7XHJcblxyXG4gICAgICByZXR1cm4gdGhpcztcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIC8qYWRkVGltZTogZnVuY3Rpb24gKCB2LCB0ICkge1xyXG5cclxuICAgICAgICB0aGlzLnggKz0gdi54ICogdDtcclxuICAgICAgICB0aGlzLnkgKz0gdi55ICogdDtcclxuICAgICAgICB0aGlzLnogKz0gdi56ICogdDtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuXHJcbiAgICB9LFxyXG4gICAgXHJcbiAgICBhZGRTY2FsZTogZnVuY3Rpb24gKCB2LCBzICkge1xyXG5cclxuICAgICAgICB0aGlzLnggKz0gdi54ICogcztcclxuICAgICAgICB0aGlzLnkgKz0gdi55ICogcztcclxuICAgICAgICB0aGlzLnogKz0gdi56ICogcztcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHN1YlNjYWxlOiBmdW5jdGlvbiAoIHYsIHMgKSB7XHJcblxyXG4gICAgICAgIHRoaXMueCAtPSB2LnggKiBzO1xyXG4gICAgICAgIHRoaXMueSAtPSB2LnkgKiBzO1xyXG4gICAgICAgIHRoaXMueiAtPSB2LnogKiBzO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG5cclxuICAgIH0sKi9cclxuXHJcbiAgICBjcm9zczogZnVuY3Rpb24gKGEsIGIpIHtcclxuXHJcbiAgICAgIGlmIChiICE9PSB1bmRlZmluZWQpIHJldHVybiB0aGlzLmNyb3NzVmVjdG9ycyhhLCBiKTtcclxuXHJcbiAgICAgIHZhciB4ID0gdGhpcy54LCB5ID0gdGhpcy55LCB6ID0gdGhpcy56O1xyXG5cclxuICAgICAgdGhpcy54ID0geSAqIGEueiAtIHogKiBhLnk7XHJcbiAgICAgIHRoaXMueSA9IHogKiBhLnggLSB4ICogYS56O1xyXG4gICAgICB0aGlzLnogPSB4ICogYS55IC0geSAqIGEueDtcclxuXHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgY3Jvc3NWZWN0b3JzOiBmdW5jdGlvbiAoYSwgYikge1xyXG5cclxuICAgICAgdmFyIGF4ID0gYS54LCBheSA9IGEueSwgYXogPSBhLno7XHJcbiAgICAgIHZhciBieCA9IGIueCwgYnkgPSBiLnksIGJ6ID0gYi56O1xyXG5cclxuICAgICAgdGhpcy54ID0gYXkgKiBieiAtIGF6ICogYnk7XHJcbiAgICAgIHRoaXMueSA9IGF6ICogYnggLSBheCAqIGJ6O1xyXG4gICAgICB0aGlzLnogPSBheCAqIGJ5IC0gYXkgKiBieDtcclxuXHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgdGFuZ2VudDogZnVuY3Rpb24gKGEpIHtcclxuXHJcbiAgICAgIHZhciBheCA9IGEueCwgYXkgPSBhLnksIGF6ID0gYS56O1xyXG5cclxuICAgICAgdGhpcy54ID0gYXkgKiBheCAtIGF6ICogYXo7XHJcbiAgICAgIHRoaXMueSA9IC0gYXogKiBheSAtIGF4ICogYXg7XHJcbiAgICAgIHRoaXMueiA9IGF4ICogYXogKyBheSAqIGF5O1xyXG5cclxuICAgICAgcmV0dXJuIHRoaXM7XHJcblxyXG4gICAgfSxcclxuXHJcblxyXG5cclxuXHJcblxyXG4gICAgaW52ZXJ0OiBmdW5jdGlvbiAodikge1xyXG5cclxuICAgICAgdGhpcy54ID0gLXYueDtcclxuICAgICAgdGhpcy55ID0gLXYueTtcclxuICAgICAgdGhpcy56ID0gLXYuejtcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBuZWdhdGU6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgIHRoaXMueCA9IC0gdGhpcy54O1xyXG4gICAgICB0aGlzLnkgPSAtIHRoaXMueTtcclxuICAgICAgdGhpcy56ID0gLSB0aGlzLno7XHJcblxyXG4gICAgICByZXR1cm4gdGhpcztcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGRvdDogZnVuY3Rpb24gKHYpIHtcclxuXHJcbiAgICAgIHJldHVybiB0aGlzLnggKiB2LnggKyB0aGlzLnkgKiB2LnkgKyB0aGlzLnogKiB2Lno7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBhZGRpdGlvbjogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgcmV0dXJuIHRoaXMueCArIHRoaXMueSArIHRoaXMuejtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGxlbmd0aFNxOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICByZXR1cm4gdGhpcy54ICogdGhpcy54ICsgdGhpcy55ICogdGhpcy55ICsgdGhpcy56ICogdGhpcy56O1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgbGVuZ3RoOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICByZXR1cm4gX01hdGguc3FydCh0aGlzLnggKiB0aGlzLnggKyB0aGlzLnkgKiB0aGlzLnkgKyB0aGlzLnogKiB0aGlzLnopO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgY29weTogZnVuY3Rpb24gKHYpIHtcclxuXHJcbiAgICAgIHRoaXMueCA9IHYueDtcclxuICAgICAgdGhpcy55ID0gdi55O1xyXG4gICAgICB0aGlzLnogPSB2Lno7XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgLyptdWw6IGZ1bmN0aW9uKCBiLCBhLCBtICl7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzLm11bE1hdCggbSwgYSApLmFkZCggYiApO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgbXVsTWF0OiBmdW5jdGlvbiggbSwgYSApe1xyXG5cclxuICAgICAgICB2YXIgZSA9IG0uZWxlbWVudHM7XHJcbiAgICAgICAgdmFyIHggPSBhLngsIHkgPSBhLnksIHogPSBhLno7XHJcblxyXG4gICAgICAgIHRoaXMueCA9IGVbIDAgXSAqIHggKyBlWyAxIF0gKiB5ICsgZVsgMiBdICogejtcclxuICAgICAgICB0aGlzLnkgPSBlWyAzIF0gKiB4ICsgZVsgNCBdICogeSArIGVbIDUgXSAqIHo7XHJcbiAgICAgICAgdGhpcy56ID0gZVsgNiBdICogeCArIGVbIDcgXSAqIHkgKyBlWyA4IF0gKiB6O1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG5cclxuICAgIH0sKi9cclxuXHJcbiAgICBhcHBseU1hdHJpeDM6IGZ1bmN0aW9uIChtLCB0cmFuc3Bvc2UpIHtcclxuXHJcbiAgICAgIC8vaWYoIHRyYW5zcG9zZSApIG0gPSBtLmNsb25lKCkudHJhbnNwb3NlKCk7XHJcbiAgICAgIHZhciB4ID0gdGhpcy54LCB5ID0gdGhpcy55LCB6ID0gdGhpcy56O1xyXG4gICAgICB2YXIgZSA9IG0uZWxlbWVudHM7XHJcblxyXG4gICAgICBpZiAodHJhbnNwb3NlKSB7XHJcblxyXG4gICAgICAgIHRoaXMueCA9IGVbMF0gKiB4ICsgZVsxXSAqIHkgKyBlWzJdICogejtcclxuICAgICAgICB0aGlzLnkgPSBlWzNdICogeCArIGVbNF0gKiB5ICsgZVs1XSAqIHo7XHJcbiAgICAgICAgdGhpcy56ID0gZVs2XSAqIHggKyBlWzddICogeSArIGVbOF0gKiB6O1xyXG5cclxuICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgdGhpcy54ID0gZVswXSAqIHggKyBlWzNdICogeSArIGVbNl0gKiB6O1xyXG4gICAgICAgIHRoaXMueSA9IGVbMV0gKiB4ICsgZVs0XSAqIHkgKyBlWzddICogejtcclxuICAgICAgICB0aGlzLnogPSBlWzJdICogeCArIGVbNV0gKiB5ICsgZVs4XSAqIHo7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgYXBwbHlRdWF0ZXJuaW9uOiBmdW5jdGlvbiAocSkge1xyXG5cclxuICAgICAgdmFyIHggPSB0aGlzLng7XHJcbiAgICAgIHZhciB5ID0gdGhpcy55O1xyXG4gICAgICB2YXIgeiA9IHRoaXMuejtcclxuXHJcbiAgICAgIHZhciBxeCA9IHEueDtcclxuICAgICAgdmFyIHF5ID0gcS55O1xyXG4gICAgICB2YXIgcXogPSBxLno7XHJcbiAgICAgIHZhciBxdyA9IHEudztcclxuXHJcbiAgICAgIC8vIGNhbGN1bGF0ZSBxdWF0ICogdmVjdG9yXHJcblxyXG4gICAgICB2YXIgaXggPSBxdyAqIHggKyBxeSAqIHogLSBxeiAqIHk7XHJcbiAgICAgIHZhciBpeSA9IHF3ICogeSArIHF6ICogeCAtIHF4ICogejtcclxuICAgICAgdmFyIGl6ID0gcXcgKiB6ICsgcXggKiB5IC0gcXkgKiB4O1xyXG4gICAgICB2YXIgaXcgPSAtIHF4ICogeCAtIHF5ICogeSAtIHF6ICogejtcclxuXHJcbiAgICAgIC8vIGNhbGN1bGF0ZSByZXN1bHQgKiBpbnZlcnNlIHF1YXRcclxuXHJcbiAgICAgIHRoaXMueCA9IGl4ICogcXcgKyBpdyAqIC0gcXggKyBpeSAqIC0gcXogLSBpeiAqIC0gcXk7XHJcbiAgICAgIHRoaXMueSA9IGl5ICogcXcgKyBpdyAqIC0gcXkgKyBpeiAqIC0gcXggLSBpeCAqIC0gcXo7XHJcbiAgICAgIHRoaXMueiA9IGl6ICogcXcgKyBpdyAqIC0gcXogKyBpeCAqIC0gcXkgLSBpeSAqIC0gcXg7XHJcblxyXG4gICAgICByZXR1cm4gdGhpcztcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHRlc3RaZXJvOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICBpZiAodGhpcy54ICE9PSAwIHx8IHRoaXMueSAhPT0gMCB8fCB0aGlzLnogIT09IDApIHJldHVybiB0cnVlO1xyXG4gICAgICBlbHNlIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHRlc3REaWZmOiBmdW5jdGlvbiAodikge1xyXG5cclxuICAgICAgcmV0dXJuIHRoaXMuZXF1YWxzKHYpID8gZmFsc2UgOiB0cnVlO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgZXF1YWxzOiBmdW5jdGlvbiAodikge1xyXG5cclxuICAgICAgcmV0dXJuIHYueCA9PT0gdGhpcy54ICYmIHYueSA9PT0gdGhpcy55ICYmIHYueiA9PT0gdGhpcy56O1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgY2xvbmU6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgIHJldHVybiBuZXcgdGhpcy5jb25zdHJ1Y3Rvcih0aGlzLngsIHRoaXMueSwgdGhpcy56KTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHRvU3RyaW5nOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICByZXR1cm4gXCJWZWMzW1wiICsgdGhpcy54LnRvRml4ZWQoNCkgKyBcIiwgXCIgKyB0aGlzLnkudG9GaXhlZCg0KSArIFwiLCBcIiArIHRoaXMuei50b0ZpeGVkKDQpICsgXCJdXCI7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBtdWx0aXBseVNjYWxhcjogZnVuY3Rpb24gKHNjYWxhcikge1xyXG5cclxuICAgICAgaWYgKGlzRmluaXRlKHNjYWxhcikpIHtcclxuICAgICAgICB0aGlzLnggKj0gc2NhbGFyO1xyXG4gICAgICAgIHRoaXMueSAqPSBzY2FsYXI7XHJcbiAgICAgICAgdGhpcy56ICo9IHNjYWxhcjtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLnggPSAwO1xyXG4gICAgICAgIHRoaXMueSA9IDA7XHJcbiAgICAgICAgdGhpcy56ID0gMDtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHRoaXM7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBkaXZpZGVTY2FsYXI6IGZ1bmN0aW9uIChzY2FsYXIpIHtcclxuXHJcbiAgICAgIHJldHVybiB0aGlzLm11bHRpcGx5U2NhbGFyKDEgLyBzY2FsYXIpO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgbm9ybWFsaXplOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICByZXR1cm4gdGhpcy5kaXZpZGVTY2FsYXIodGhpcy5sZW5ndGgoKSk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICB0b0FycmF5OiBmdW5jdGlvbiAoYXJyYXksIG9mZnNldCkge1xyXG5cclxuICAgICAgaWYgKG9mZnNldCA9PT0gdW5kZWZpbmVkKSBvZmZzZXQgPSAwO1xyXG5cclxuICAgICAgYXJyYXlbb2Zmc2V0XSA9IHRoaXMueDtcclxuICAgICAgYXJyYXlbb2Zmc2V0ICsgMV0gPSB0aGlzLnk7XHJcbiAgICAgIGFycmF5W29mZnNldCArIDJdID0gdGhpcy56O1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgZnJvbUFycmF5OiBmdW5jdGlvbiAoYXJyYXksIG9mZnNldCkge1xyXG5cclxuICAgICAgaWYgKG9mZnNldCA9PT0gdW5kZWZpbmVkKSBvZmZzZXQgPSAwO1xyXG5cclxuICAgICAgdGhpcy54ID0gYXJyYXlbb2Zmc2V0XTtcclxuICAgICAgdGhpcy55ID0gYXJyYXlbb2Zmc2V0ICsgMV07XHJcbiAgICAgIHRoaXMueiA9IGFycmF5W29mZnNldCArIDJdO1xyXG4gICAgICByZXR1cm4gdGhpcztcclxuXHJcbiAgICB9LFxyXG5cclxuXHJcbiAgfSk7XHJcblxyXG4gIGZ1bmN0aW9uIFF1YXQoeCwgeSwgeiwgdykge1xyXG5cclxuICAgIHRoaXMueCA9IHggfHwgMDtcclxuICAgIHRoaXMueSA9IHkgfHwgMDtcclxuICAgIHRoaXMueiA9IHogfHwgMDtcclxuICAgIHRoaXMudyA9ICh3ICE9PSB1bmRlZmluZWQpID8gdyA6IDE7XHJcblxyXG4gIH1cclxuXHJcbiAgT2JqZWN0LmFzc2lnbihRdWF0LnByb3RvdHlwZSwge1xyXG5cclxuICAgIFF1YXQ6IHRydWUsXHJcblxyXG4gICAgc2V0OiBmdW5jdGlvbiAoeCwgeSwgeiwgdykge1xyXG5cclxuXHJcbiAgICAgIHRoaXMueCA9IHg7XHJcbiAgICAgIHRoaXMueSA9IHk7XHJcbiAgICAgIHRoaXMueiA9IHo7XHJcbiAgICAgIHRoaXMudyA9IHc7XHJcblxyXG4gICAgICByZXR1cm4gdGhpcztcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGFkZFRpbWU6IGZ1bmN0aW9uICh2LCB0KSB7XHJcblxyXG4gICAgICB2YXIgYXggPSB2LngsIGF5ID0gdi55LCBheiA9IHYuejtcclxuICAgICAgdmFyIHF3ID0gdGhpcy53LCBxeCA9IHRoaXMueCwgcXkgPSB0aGlzLnksIHF6ID0gdGhpcy56O1xyXG4gICAgICB0ICo9IDAuNTtcclxuICAgICAgdGhpcy54ICs9IHQgKiAoYXggKiBxdyArIGF5ICogcXogLSBheiAqIHF5KTtcclxuICAgICAgdGhpcy55ICs9IHQgKiAoYXkgKiBxdyArIGF6ICogcXggLSBheCAqIHF6KTtcclxuICAgICAgdGhpcy56ICs9IHQgKiAoYXogKiBxdyArIGF4ICogcXkgLSBheSAqIHF4KTtcclxuICAgICAgdGhpcy53ICs9IHQgKiAoLWF4ICogcXggLSBheSAqIHF5IC0gYXogKiBxeik7XHJcbiAgICAgIHRoaXMubm9ybWFsaXplKCk7XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgLyptdWw6IGZ1bmN0aW9uKCBxMSwgcTIgKXtcclxuXHJcbiAgICAgICAgdmFyIGF4ID0gcTEueCwgYXkgPSBxMS55LCBheiA9IHExLnosIGFzID0gcTEudyxcclxuICAgICAgICBieCA9IHEyLngsIGJ5ID0gcTIueSwgYnogPSBxMi56LCBicyA9IHEyLnc7XHJcbiAgICAgICAgdGhpcy54ID0gYXggKiBicyArIGFzICogYnggKyBheSAqIGJ6IC0gYXogKiBieTtcclxuICAgICAgICB0aGlzLnkgPSBheSAqIGJzICsgYXMgKiBieSArIGF6ICogYnggLSBheCAqIGJ6O1xyXG4gICAgICAgIHRoaXMueiA9IGF6ICogYnMgKyBhcyAqIGJ6ICsgYXggKiBieSAtIGF5ICogYng7XHJcbiAgICAgICAgdGhpcy53ID0gYXMgKiBicyAtIGF4ICogYnggLSBheSAqIGJ5IC0gYXogKiBiejtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuXHJcbiAgICB9LCovXHJcblxyXG4gICAgbXVsdGlwbHk6IGZ1bmN0aW9uIChxLCBwKSB7XHJcblxyXG4gICAgICBpZiAocCAhPT0gdW5kZWZpbmVkKSByZXR1cm4gdGhpcy5tdWx0aXBseVF1YXRlcm5pb25zKHEsIHApO1xyXG4gICAgICByZXR1cm4gdGhpcy5tdWx0aXBseVF1YXRlcm5pb25zKHRoaXMsIHEpO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgbXVsdGlwbHlRdWF0ZXJuaW9uczogZnVuY3Rpb24gKGEsIGIpIHtcclxuXHJcbiAgICAgIHZhciBxYXggPSBhLngsIHFheSA9IGEueSwgcWF6ID0gYS56LCBxYXcgPSBhLnc7XHJcbiAgICAgIHZhciBxYnggPSBiLngsIHFieSA9IGIueSwgcWJ6ID0gYi56LCBxYncgPSBiLnc7XHJcblxyXG4gICAgICB0aGlzLnggPSBxYXggKiBxYncgKyBxYXcgKiBxYnggKyBxYXkgKiBxYnogLSBxYXogKiBxYnk7XHJcbiAgICAgIHRoaXMueSA9IHFheSAqIHFidyArIHFhdyAqIHFieSArIHFheiAqIHFieCAtIHFheCAqIHFiejtcclxuICAgICAgdGhpcy56ID0gcWF6ICogcWJ3ICsgcWF3ICogcWJ6ICsgcWF4ICogcWJ5IC0gcWF5ICogcWJ4O1xyXG4gICAgICB0aGlzLncgPSBxYXcgKiBxYncgLSBxYXggKiBxYnggLSBxYXkgKiBxYnkgLSBxYXogKiBxYno7XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgc2V0RnJvbVVuaXRWZWN0b3JzOiBmdW5jdGlvbiAodjEsIHYyKSB7XHJcblxyXG4gICAgICB2YXIgdnggPSBuZXcgVmVjMygpO1xyXG4gICAgICB2YXIgciA9IHYxLmRvdCh2MikgKyAxO1xyXG5cclxuICAgICAgaWYgKHIgPCBfTWF0aC5FUFMyKSB7XHJcblxyXG4gICAgICAgIHIgPSAwO1xyXG4gICAgICAgIGlmIChfTWF0aC5hYnModjEueCkgPiBfTWF0aC5hYnModjEueikpIHZ4LnNldCgtIHYxLnksIHYxLngsIDApO1xyXG4gICAgICAgIGVsc2Ugdnguc2V0KDAsIC0gdjEueiwgdjEueSk7XHJcblxyXG4gICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICB2eC5jcm9zc1ZlY3RvcnModjEsIHYyKTtcclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMuX3ggPSB2eC54O1xyXG4gICAgICB0aGlzLl95ID0gdngueTtcclxuICAgICAgdGhpcy5feiA9IHZ4Lno7XHJcbiAgICAgIHRoaXMuX3cgPSByO1xyXG5cclxuICAgICAgcmV0dXJuIHRoaXMubm9ybWFsaXplKCk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBhcmM6IGZ1bmN0aW9uICh2MSwgdjIpIHtcclxuXHJcbiAgICAgIHZhciB4MSA9IHYxLng7XHJcbiAgICAgIHZhciB5MSA9IHYxLnk7XHJcbiAgICAgIHZhciB6MSA9IHYxLno7XHJcbiAgICAgIHZhciB4MiA9IHYyLng7XHJcbiAgICAgIHZhciB5MiA9IHYyLnk7XHJcbiAgICAgIHZhciB6MiA9IHYyLno7XHJcbiAgICAgIHZhciBkID0geDEgKiB4MiArIHkxICogeTIgKyB6MSAqIHoyO1xyXG4gICAgICBpZiAoZCA9PSAtMSkge1xyXG4gICAgICAgIHgyID0geTEgKiB4MSAtIHoxICogejE7XHJcbiAgICAgICAgeTIgPSAtejEgKiB5MSAtIHgxICogeDE7XHJcbiAgICAgICAgejIgPSB4MSAqIHoxICsgeTEgKiB5MTtcclxuICAgICAgICBkID0gMSAvIF9NYXRoLnNxcnQoeDIgKiB4MiArIHkyICogeTIgKyB6MiAqIHoyKTtcclxuICAgICAgICB0aGlzLncgPSAwO1xyXG4gICAgICAgIHRoaXMueCA9IHgyICogZDtcclxuICAgICAgICB0aGlzLnkgPSB5MiAqIGQ7XHJcbiAgICAgICAgdGhpcy56ID0gejIgKiBkO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICB9XHJcbiAgICAgIHZhciBjeCA9IHkxICogejIgLSB6MSAqIHkyO1xyXG4gICAgICB2YXIgY3kgPSB6MSAqIHgyIC0geDEgKiB6MjtcclxuICAgICAgdmFyIGN6ID0geDEgKiB5MiAtIHkxICogeDI7XHJcbiAgICAgIHRoaXMudyA9IF9NYXRoLnNxcnQoKDEgKyBkKSAqIDAuNSk7XHJcbiAgICAgIGQgPSAwLjUgLyB0aGlzLnc7XHJcbiAgICAgIHRoaXMueCA9IGN4ICogZDtcclxuICAgICAgdGhpcy55ID0gY3kgKiBkO1xyXG4gICAgICB0aGlzLnogPSBjeiAqIGQ7XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgbm9ybWFsaXplOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICB2YXIgbCA9IHRoaXMubGVuZ3RoKCk7XHJcbiAgICAgIGlmIChsID09PSAwKSB7XHJcbiAgICAgICAgdGhpcy5zZXQoMCwgMCwgMCwgMSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbCA9IDEgLyBsO1xyXG4gICAgICAgIHRoaXMueCA9IHRoaXMueCAqIGw7XHJcbiAgICAgICAgdGhpcy55ID0gdGhpcy55ICogbDtcclxuICAgICAgICB0aGlzLnogPSB0aGlzLnogKiBsO1xyXG4gICAgICAgIHRoaXMudyA9IHRoaXMudyAqIGw7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHRoaXM7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBpbnZlcnNlOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICByZXR1cm4gdGhpcy5jb25qdWdhdGUoKS5ub3JtYWxpemUoKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGludmVydDogZnVuY3Rpb24gKHEpIHtcclxuXHJcbiAgICAgIHRoaXMueCA9IHEueDtcclxuICAgICAgdGhpcy55ID0gcS55O1xyXG4gICAgICB0aGlzLnogPSBxLno7XHJcbiAgICAgIHRoaXMudyA9IHEudztcclxuICAgICAgdGhpcy5jb25qdWdhdGUoKS5ub3JtYWxpemUoKTtcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBjb25qdWdhdGU6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgIHRoaXMueCAqPSAtIDE7XHJcbiAgICAgIHRoaXMueSAqPSAtIDE7XHJcbiAgICAgIHRoaXMueiAqPSAtIDE7XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgbGVuZ3RoOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICByZXR1cm4gX01hdGguc3FydCh0aGlzLnggKiB0aGlzLnggKyB0aGlzLnkgKiB0aGlzLnkgKyB0aGlzLnogKiB0aGlzLnogKyB0aGlzLncgKiB0aGlzLncpO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgbGVuZ3RoU3E6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgIHJldHVybiB0aGlzLnggKiB0aGlzLnggKyB0aGlzLnkgKiB0aGlzLnkgKyB0aGlzLnogKiB0aGlzLnogKyB0aGlzLncgKiB0aGlzLnc7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBjb3B5OiBmdW5jdGlvbiAocSkge1xyXG5cclxuICAgICAgdGhpcy54ID0gcS54O1xyXG4gICAgICB0aGlzLnkgPSBxLnk7XHJcbiAgICAgIHRoaXMueiA9IHEuejtcclxuICAgICAgdGhpcy53ID0gcS53O1xyXG4gICAgICByZXR1cm4gdGhpcztcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGNsb25lOiBmdW5jdGlvbiAocSkge1xyXG5cclxuICAgICAgcmV0dXJuIG5ldyBRdWF0KHRoaXMueCwgdGhpcy55LCB0aGlzLnosIHRoaXMudyk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICB0ZXN0RGlmZjogZnVuY3Rpb24gKHEpIHtcclxuXHJcbiAgICAgIHJldHVybiB0aGlzLmVxdWFscyhxKSA/IGZhbHNlIDogdHJ1ZTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGVxdWFsczogZnVuY3Rpb24gKHEpIHtcclxuXHJcbiAgICAgIHJldHVybiB0aGlzLnggPT09IHEueCAmJiB0aGlzLnkgPT09IHEueSAmJiB0aGlzLnogPT09IHEueiAmJiB0aGlzLncgPT09IHEudztcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHRvU3RyaW5nOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICByZXR1cm4gXCJRdWF0W1wiICsgdGhpcy54LnRvRml4ZWQoNCkgKyBcIiwgKFwiICsgdGhpcy55LnRvRml4ZWQoNCkgKyBcIiwgXCIgKyB0aGlzLnoudG9GaXhlZCg0KSArIFwiLCBcIiArIHRoaXMudy50b0ZpeGVkKDQpICsgXCIpXVwiO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgc2V0RnJvbUV1bGVyOiBmdW5jdGlvbiAoeCwgeSwgeikge1xyXG5cclxuICAgICAgdmFyIGMxID0gTWF0aC5jb3MoeCAqIDAuNSk7XHJcbiAgICAgIHZhciBjMiA9IE1hdGguY29zKHkgKiAwLjUpO1xyXG4gICAgICB2YXIgYzMgPSBNYXRoLmNvcyh6ICogMC41KTtcclxuICAgICAgdmFyIHMxID0gTWF0aC5zaW4oeCAqIDAuNSk7XHJcbiAgICAgIHZhciBzMiA9IE1hdGguc2luKHkgKiAwLjUpO1xyXG4gICAgICB2YXIgczMgPSBNYXRoLnNpbih6ICogMC41KTtcclxuXHJcbiAgICAgIC8vIFhZWlxyXG4gICAgICB0aGlzLnggPSBzMSAqIGMyICogYzMgKyBjMSAqIHMyICogczM7XHJcbiAgICAgIHRoaXMueSA9IGMxICogczIgKiBjMyAtIHMxICogYzIgKiBzMztcclxuICAgICAgdGhpcy56ID0gYzEgKiBjMiAqIHMzICsgczEgKiBzMiAqIGMzO1xyXG4gICAgICB0aGlzLncgPSBjMSAqIGMyICogYzMgLSBzMSAqIHMyICogczM7XHJcblxyXG4gICAgICByZXR1cm4gdGhpcztcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHNldEZyb21BeGlzOiBmdW5jdGlvbiAoYXhpcywgcmFkKSB7XHJcblxyXG4gICAgICBheGlzLm5vcm1hbGl6ZSgpO1xyXG4gICAgICByYWQgPSByYWQgKiAwLjU7XHJcbiAgICAgIHZhciBzID0gX01hdGguc2luKHJhZCk7XHJcbiAgICAgIHRoaXMueCA9IHMgKiBheGlzLng7XHJcbiAgICAgIHRoaXMueSA9IHMgKiBheGlzLnk7XHJcbiAgICAgIHRoaXMueiA9IHMgKiBheGlzLno7XHJcbiAgICAgIHRoaXMudyA9IF9NYXRoLmNvcyhyYWQpO1xyXG4gICAgICByZXR1cm4gdGhpcztcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHNldEZyb21NYXQzMzogZnVuY3Rpb24gKG0pIHtcclxuXHJcbiAgICAgIHZhciB0cmFjZSA9IG1bMF0gKyBtWzRdICsgbVs4XTtcclxuICAgICAgdmFyIHM7XHJcblxyXG4gICAgICBpZiAodHJhY2UgPiAwKSB7XHJcblxyXG4gICAgICAgIHMgPSBfTWF0aC5zcXJ0KHRyYWNlICsgMS4wKTtcclxuICAgICAgICB0aGlzLncgPSAwLjUgLyBzO1xyXG4gICAgICAgIHMgPSAwLjUgLyBzO1xyXG4gICAgICAgIHRoaXMueCA9IChtWzVdIC0gbVs3XSkgKiBzO1xyXG4gICAgICAgIHRoaXMueSA9IChtWzZdIC0gbVsyXSkgKiBzO1xyXG4gICAgICAgIHRoaXMueiA9IChtWzFdIC0gbVszXSkgKiBzO1xyXG5cclxuICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgdmFyIG91dCA9IFtdO1xyXG4gICAgICAgIHZhciBpID0gMDtcclxuICAgICAgICBpZiAobVs0XSA+IG1bMF0pIGkgPSAxO1xyXG4gICAgICAgIGlmIChtWzhdID4gbVtpICogMyArIGldKSBpID0gMjtcclxuXHJcbiAgICAgICAgdmFyIGogPSAoaSArIDEpICUgMztcclxuICAgICAgICB2YXIgayA9IChpICsgMikgJSAzO1xyXG5cclxuICAgICAgICBzID0gX01hdGguc3FydChtW2kgKiAzICsgaV0gLSBtW2ogKiAzICsgal0gLSBtW2sgKiAzICsga10gKyAxLjApO1xyXG4gICAgICAgIG91dFtpXSA9IDAuNSAqIGZSb290O1xyXG4gICAgICAgIHMgPSAwLjUgLyBmUm9vdDtcclxuICAgICAgICB0aGlzLncgPSAobVtqICogMyArIGtdIC0gbVtrICogMyArIGpdKSAqIHM7XHJcbiAgICAgICAgb3V0W2pdID0gKG1baiAqIDMgKyBpXSArIG1baSAqIDMgKyBqXSkgKiBzO1xyXG4gICAgICAgIG91dFtrXSA9IChtW2sgKiAzICsgaV0gKyBtW2kgKiAzICsga10pICogcztcclxuXHJcbiAgICAgICAgdGhpcy54ID0gb3V0WzFdO1xyXG4gICAgICAgIHRoaXMueSA9IG91dFsyXTtcclxuICAgICAgICB0aGlzLnogPSBvdXRbM107XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gdGhpcztcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHRvQXJyYXk6IGZ1bmN0aW9uIChhcnJheSwgb2Zmc2V0KSB7XHJcblxyXG4gICAgICBvZmZzZXQgPSBvZmZzZXQgfHwgMDtcclxuXHJcbiAgICAgIGFycmF5W29mZnNldF0gPSB0aGlzLng7XHJcbiAgICAgIGFycmF5W29mZnNldCArIDFdID0gdGhpcy55O1xyXG4gICAgICBhcnJheVtvZmZzZXQgKyAyXSA9IHRoaXMuejtcclxuICAgICAgYXJyYXlbb2Zmc2V0ICsgM10gPSB0aGlzLnc7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBmcm9tQXJyYXk6IGZ1bmN0aW9uIChhcnJheSwgb2Zmc2V0KSB7XHJcblxyXG4gICAgICBvZmZzZXQgPSBvZmZzZXQgfHwgMDtcclxuICAgICAgdGhpcy5zZXQoYXJyYXlbb2Zmc2V0XSwgYXJyYXlbb2Zmc2V0ICsgMV0sIGFycmF5W29mZnNldCArIDJdLCBhcnJheVtvZmZzZXQgKyAzXSk7XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG5cclxuICAgIH1cclxuXHJcbiAgfSk7XHJcblxyXG4gIGZ1bmN0aW9uIE1hdDMzKGUwMCwgZTAxLCBlMDIsIGUxMCwgZTExLCBlMTIsIGUyMCwgZTIxLCBlMjIpIHtcclxuXHJcbiAgICB0aGlzLmVsZW1lbnRzID0gW1xyXG4gICAgICAxLCAwLCAwLFxyXG4gICAgICAwLCAxLCAwLFxyXG4gICAgICAwLCAwLCAxXHJcbiAgICBdO1xyXG5cclxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMCkge1xyXG5cclxuICAgICAgY29uc29sZS5lcnJvcignT0lNTy5NYXQzMzogdGhlIGNvbnN0cnVjdG9yIG5vIGxvbmdlciByZWFkcyBhcmd1bWVudHMuIHVzZSAuc2V0KCkgaW5zdGVhZC4nKTtcclxuXHJcbiAgICB9XHJcblxyXG4gIH1cclxuXHJcbiAgT2JqZWN0LmFzc2lnbihNYXQzMy5wcm90b3R5cGUsIHtcclxuXHJcbiAgICBNYXQzMzogdHJ1ZSxcclxuXHJcbiAgICBzZXQ6IGZ1bmN0aW9uIChlMDAsIGUwMSwgZTAyLCBlMTAsIGUxMSwgZTEyLCBlMjAsIGUyMSwgZTIyKSB7XHJcblxyXG4gICAgICB2YXIgdGUgPSB0aGlzLmVsZW1lbnRzO1xyXG4gICAgICB0ZVswXSA9IGUwMDsgdGVbMV0gPSBlMDE7IHRlWzJdID0gZTAyO1xyXG4gICAgICB0ZVszXSA9IGUxMDsgdGVbNF0gPSBlMTE7IHRlWzVdID0gZTEyO1xyXG4gICAgICB0ZVs2XSA9IGUyMDsgdGVbN10gPSBlMjE7IHRlWzhdID0gZTIyO1xyXG4gICAgICByZXR1cm4gdGhpcztcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGFkZDogZnVuY3Rpb24gKGEsIGIpIHtcclxuXHJcbiAgICAgIGlmIChiICE9PSB1bmRlZmluZWQpIHJldHVybiB0aGlzLmFkZE1hdHJpeHMoYSwgYik7XHJcblxyXG4gICAgICB2YXIgZSA9IHRoaXMuZWxlbWVudHMsIHRlID0gYS5lbGVtZW50cztcclxuICAgICAgZVswXSArPSB0ZVswXTsgZVsxXSArPSB0ZVsxXTsgZVsyXSArPSB0ZVsyXTtcclxuICAgICAgZVszXSArPSB0ZVszXTsgZVs0XSArPSB0ZVs0XTsgZVs1XSArPSB0ZVs1XTtcclxuICAgICAgZVs2XSArPSB0ZVs2XTsgZVs3XSArPSB0ZVs3XTsgZVs4XSArPSB0ZVs4XTtcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBhZGRNYXRyaXhzOiBmdW5jdGlvbiAoYSwgYikge1xyXG5cclxuICAgICAgdmFyIHRlID0gdGhpcy5lbGVtZW50cywgdGVtMSA9IGEuZWxlbWVudHMsIHRlbTIgPSBiLmVsZW1lbnRzO1xyXG4gICAgICB0ZVswXSA9IHRlbTFbMF0gKyB0ZW0yWzBdOyB0ZVsxXSA9IHRlbTFbMV0gKyB0ZW0yWzFdOyB0ZVsyXSA9IHRlbTFbMl0gKyB0ZW0yWzJdO1xyXG4gICAgICB0ZVszXSA9IHRlbTFbM10gKyB0ZW0yWzNdOyB0ZVs0XSA9IHRlbTFbNF0gKyB0ZW0yWzRdOyB0ZVs1XSA9IHRlbTFbNV0gKyB0ZW0yWzVdO1xyXG4gICAgICB0ZVs2XSA9IHRlbTFbNl0gKyB0ZW0yWzZdOyB0ZVs3XSA9IHRlbTFbN10gKyB0ZW0yWzddOyB0ZVs4XSA9IHRlbTFbOF0gKyB0ZW0yWzhdO1xyXG4gICAgICByZXR1cm4gdGhpcztcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGFkZEVxdWFsOiBmdW5jdGlvbiAobSkge1xyXG5cclxuICAgICAgdmFyIHRlID0gdGhpcy5lbGVtZW50cywgdGVtID0gbS5lbGVtZW50cztcclxuICAgICAgdGVbMF0gKz0gdGVtWzBdOyB0ZVsxXSArPSB0ZW1bMV07IHRlWzJdICs9IHRlbVsyXTtcclxuICAgICAgdGVbM10gKz0gdGVtWzNdOyB0ZVs0XSArPSB0ZW1bNF07IHRlWzVdICs9IHRlbVs1XTtcclxuICAgICAgdGVbNl0gKz0gdGVtWzZdOyB0ZVs3XSArPSB0ZW1bN107IHRlWzhdICs9IHRlbVs4XTtcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBzdWI6IGZ1bmN0aW9uIChhLCBiKSB7XHJcblxyXG4gICAgICBpZiAoYiAhPT0gdW5kZWZpbmVkKSByZXR1cm4gdGhpcy5zdWJNYXRyaXhzKGEsIGIpO1xyXG5cclxuICAgICAgdmFyIGUgPSB0aGlzLmVsZW1lbnRzLCB0ZSA9IGEuZWxlbWVudHM7XHJcbiAgICAgIGVbMF0gLT0gdGVbMF07IGVbMV0gLT0gdGVbMV07IGVbMl0gLT0gdGVbMl07XHJcbiAgICAgIGVbM10gLT0gdGVbM107IGVbNF0gLT0gdGVbNF07IGVbNV0gLT0gdGVbNV07XHJcbiAgICAgIGVbNl0gLT0gdGVbNl07IGVbN10gLT0gdGVbN107IGVbOF0gLT0gdGVbOF07XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgc3ViTWF0cml4czogZnVuY3Rpb24gKGEsIGIpIHtcclxuXHJcbiAgICAgIHZhciB0ZSA9IHRoaXMuZWxlbWVudHMsIHRlbTEgPSBhLmVsZW1lbnRzLCB0ZW0yID0gYi5lbGVtZW50cztcclxuICAgICAgdGVbMF0gPSB0ZW0xWzBdIC0gdGVtMlswXTsgdGVbMV0gPSB0ZW0xWzFdIC0gdGVtMlsxXTsgdGVbMl0gPSB0ZW0xWzJdIC0gdGVtMlsyXTtcclxuICAgICAgdGVbM10gPSB0ZW0xWzNdIC0gdGVtMlszXTsgdGVbNF0gPSB0ZW0xWzRdIC0gdGVtMls0XTsgdGVbNV0gPSB0ZW0xWzVdIC0gdGVtMls1XTtcclxuICAgICAgdGVbNl0gPSB0ZW0xWzZdIC0gdGVtMls2XTsgdGVbN10gPSB0ZW0xWzddIC0gdGVtMls3XTsgdGVbOF0gPSB0ZW0xWzhdIC0gdGVtMls4XTtcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBzdWJFcXVhbDogZnVuY3Rpb24gKG0pIHtcclxuXHJcbiAgICAgIHZhciB0ZSA9IHRoaXMuZWxlbWVudHMsIHRlbSA9IG0uZWxlbWVudHM7XHJcbiAgICAgIHRlWzBdIC09IHRlbVswXTsgdGVbMV0gLT0gdGVtWzFdOyB0ZVsyXSAtPSB0ZW1bMl07XHJcbiAgICAgIHRlWzNdIC09IHRlbVszXTsgdGVbNF0gLT0gdGVtWzRdOyB0ZVs1XSAtPSB0ZW1bNV07XHJcbiAgICAgIHRlWzZdIC09IHRlbVs2XTsgdGVbN10gLT0gdGVtWzddOyB0ZVs4XSAtPSB0ZW1bOF07XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgc2NhbGU6IGZ1bmN0aW9uIChtLCBzKSB7XHJcblxyXG4gICAgICB2YXIgdGUgPSB0aGlzLmVsZW1lbnRzLCB0bSA9IG0uZWxlbWVudHM7XHJcbiAgICAgIHRlWzBdID0gdG1bMF0gKiBzOyB0ZVsxXSA9IHRtWzFdICogczsgdGVbMl0gPSB0bVsyXSAqIHM7XHJcbiAgICAgIHRlWzNdID0gdG1bM10gKiBzOyB0ZVs0XSA9IHRtWzRdICogczsgdGVbNV0gPSB0bVs1XSAqIHM7XHJcbiAgICAgIHRlWzZdID0gdG1bNl0gKiBzOyB0ZVs3XSA9IHRtWzddICogczsgdGVbOF0gPSB0bVs4XSAqIHM7XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgc2NhbGVFcXVhbDogZnVuY3Rpb24gKHMpIHsvLyBtdWx0aXBseVNjYWxhclxyXG5cclxuICAgICAgdmFyIHRlID0gdGhpcy5lbGVtZW50cztcclxuICAgICAgdGVbMF0gKj0gczsgdGVbMV0gKj0gczsgdGVbMl0gKj0gcztcclxuICAgICAgdGVbM10gKj0gczsgdGVbNF0gKj0gczsgdGVbNV0gKj0gcztcclxuICAgICAgdGVbNl0gKj0gczsgdGVbN10gKj0gczsgdGVbOF0gKj0gcztcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBtdWx0aXBseU1hdHJpY2VzOiBmdW5jdGlvbiAobTEsIG0yLCB0cmFuc3Bvc2UpIHtcclxuXHJcbiAgICAgIGlmICh0cmFuc3Bvc2UpIG0yID0gbTIuY2xvbmUoKS50cmFuc3Bvc2UoKTtcclxuXHJcbiAgICAgIHZhciB0ZSA9IHRoaXMuZWxlbWVudHM7XHJcbiAgICAgIHZhciB0bTEgPSBtMS5lbGVtZW50cztcclxuICAgICAgdmFyIHRtMiA9IG0yLmVsZW1lbnRzO1xyXG5cclxuICAgICAgdmFyIGEwID0gdG0xWzBdLCBhMyA9IHRtMVszXSwgYTYgPSB0bTFbNl07XHJcbiAgICAgIHZhciBhMSA9IHRtMVsxXSwgYTQgPSB0bTFbNF0sIGE3ID0gdG0xWzddO1xyXG4gICAgICB2YXIgYTIgPSB0bTFbMl0sIGE1ID0gdG0xWzVdLCBhOCA9IHRtMVs4XTtcclxuXHJcbiAgICAgIHZhciBiMCA9IHRtMlswXSwgYjMgPSB0bTJbM10sIGI2ID0gdG0yWzZdO1xyXG4gICAgICB2YXIgYjEgPSB0bTJbMV0sIGI0ID0gdG0yWzRdLCBiNyA9IHRtMls3XTtcclxuICAgICAgdmFyIGIyID0gdG0yWzJdLCBiNSA9IHRtMls1XSwgYjggPSB0bTJbOF07XHJcblxyXG4gICAgICB0ZVswXSA9IGEwICogYjAgKyBhMSAqIGIzICsgYTIgKiBiNjtcclxuICAgICAgdGVbMV0gPSBhMCAqIGIxICsgYTEgKiBiNCArIGEyICogYjc7XHJcbiAgICAgIHRlWzJdID0gYTAgKiBiMiArIGExICogYjUgKyBhMiAqIGI4O1xyXG4gICAgICB0ZVszXSA9IGEzICogYjAgKyBhNCAqIGIzICsgYTUgKiBiNjtcclxuICAgICAgdGVbNF0gPSBhMyAqIGIxICsgYTQgKiBiNCArIGE1ICogYjc7XHJcbiAgICAgIHRlWzVdID0gYTMgKiBiMiArIGE0ICogYjUgKyBhNSAqIGI4O1xyXG4gICAgICB0ZVs2XSA9IGE2ICogYjAgKyBhNyAqIGIzICsgYTggKiBiNjtcclxuICAgICAgdGVbN10gPSBhNiAqIGIxICsgYTcgKiBiNCArIGE4ICogYjc7XHJcbiAgICAgIHRlWzhdID0gYTYgKiBiMiArIGE3ICogYjUgKyBhOCAqIGI4O1xyXG5cclxuICAgICAgcmV0dXJuIHRoaXM7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICAvKm11bDogZnVuY3Rpb24gKCBtMSwgbTIsIHRyYW5zcG9zZSApIHtcclxuXHJcbiAgICAgICAgaWYoIHRyYW5zcG9zZSApIG0yID0gbTIuY2xvbmUoKS50cmFuc3Bvc2UoKTtcclxuXHJcbiAgICAgICAgdmFyIHRlID0gdGhpcy5lbGVtZW50cztcclxuICAgICAgICB2YXIgdG0xID0gbTEuZWxlbWVudHM7XHJcbiAgICAgICAgdmFyIHRtMiA9IG0yLmVsZW1lbnRzO1xyXG4gICAgICAgIC8vdmFyIHRtcDtcclxuXHJcbiAgICAgICAgdmFyIGEwID0gdG0xWzBdLCBhMyA9IHRtMVszXSwgYTYgPSB0bTFbNl07XHJcbiAgICAgICAgdmFyIGExID0gdG0xWzFdLCBhNCA9IHRtMVs0XSwgYTcgPSB0bTFbN107XHJcbiAgICAgICAgdmFyIGEyID0gdG0xWzJdLCBhNSA9IHRtMVs1XSwgYTggPSB0bTFbOF07XHJcblxyXG4gICAgICAgIHZhciBiMCA9IHRtMlswXSwgYjMgPSB0bTJbM10sIGI2ID0gdG0yWzZdO1xyXG4gICAgICAgIHZhciBiMSA9IHRtMlsxXSwgYjQgPSB0bTJbNF0sIGI3ID0gdG0yWzddO1xyXG4gICAgICAgIHZhciBiMiA9IHRtMlsyXSwgYjUgPSB0bTJbNV0sIGI4ID0gdG0yWzhdO1xyXG5cclxuICAgICAgICAvKmlmKCB0cmFuc3Bvc2UgKXtcclxuXHJcbiAgICAgICAgICAgIHRtcCA9IGIxOyBiMSA9IGIzOyBiMyA9IHRtcDtcclxuICAgICAgICAgICAgdG1wID0gYjI7IGIyID0gYjY7IGI2ID0gdG1wO1xyXG4gICAgICAgICAgICB0bXAgPSBiNTsgYjUgPSBiNzsgYjcgPSB0bXA7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGVbMF0gPSBhMCpiMCArIGExKmIzICsgYTIqYjY7XHJcbiAgICAgICAgdGVbMV0gPSBhMCpiMSArIGExKmI0ICsgYTIqYjc7XHJcbiAgICAgICAgdGVbMl0gPSBhMCpiMiArIGExKmI1ICsgYTIqYjg7XHJcbiAgICAgICAgdGVbM10gPSBhMypiMCArIGE0KmIzICsgYTUqYjY7XHJcbiAgICAgICAgdGVbNF0gPSBhMypiMSArIGE0KmI0ICsgYTUqYjc7XHJcbiAgICAgICAgdGVbNV0gPSBhMypiMiArIGE0KmI1ICsgYTUqYjg7XHJcbiAgICAgICAgdGVbNl0gPSBhNipiMCArIGE3KmIzICsgYTgqYjY7XHJcbiAgICAgICAgdGVbN10gPSBhNipiMSArIGE3KmI0ICsgYTgqYjc7XHJcbiAgICAgICAgdGVbOF0gPSBhNipiMiArIGE3KmI1ICsgYTgqYjg7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG5cclxuICAgIH0sKi9cclxuXHJcbiAgICB0cmFuc3Bvc2U6IGZ1bmN0aW9uIChtKSB7XHJcblxyXG4gICAgICBpZiAobSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgdmFyIGEgPSBtLmVsZW1lbnRzO1xyXG4gICAgICAgIHRoaXMuc2V0KGFbMF0sIGFbM10sIGFbNl0sIGFbMV0sIGFbNF0sIGFbN10sIGFbMl0sIGFbNV0sIGFbOF0pO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB2YXIgdGUgPSB0aGlzLmVsZW1lbnRzO1xyXG4gICAgICB2YXIgYTAxID0gdGVbMV0sIGEwMiA9IHRlWzJdLCBhMTIgPSB0ZVs1XTtcclxuICAgICAgdGVbMV0gPSB0ZVszXTtcclxuICAgICAgdGVbMl0gPSB0ZVs2XTtcclxuICAgICAgdGVbM10gPSBhMDE7XHJcbiAgICAgIHRlWzVdID0gdGVbN107XHJcbiAgICAgIHRlWzZdID0gYTAyO1xyXG4gICAgICB0ZVs3XSA9IGExMjtcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcblxyXG4gICAgfSxcclxuXHJcblxyXG5cclxuICAgIC8qbXVsU2NhbGU6IGZ1bmN0aW9uICggbSwgc3gsIHN5LCBzeiwgUHJlcGVuZCApIHtcclxuXHJcbiAgICAgICAgdmFyIHByZXBlbmQgPSBQcmVwZW5kIHx8IGZhbHNlO1xyXG4gICAgICAgIHZhciB0ZSA9IHRoaXMuZWxlbWVudHMsIHRtID0gbS5lbGVtZW50cztcclxuICAgICAgICBpZihwcmVwZW5kKXtcclxuICAgICAgICAgICAgdGVbMF0gPSBzeCp0bVswXTsgdGVbMV0gPSBzeCp0bVsxXTsgdGVbMl0gPSBzeCp0bVsyXTtcclxuICAgICAgICAgICAgdGVbM10gPSBzeSp0bVszXTsgdGVbNF0gPSBzeSp0bVs0XTsgdGVbNV0gPSBzeSp0bVs1XTtcclxuICAgICAgICAgICAgdGVbNl0gPSBzeip0bVs2XTsgdGVbN10gPSBzeip0bVs3XTsgdGVbOF0gPSBzeip0bVs4XTtcclxuICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgdGVbMF0gPSB0bVswXSpzeDsgdGVbMV0gPSB0bVsxXSpzeTsgdGVbMl0gPSB0bVsyXSpzejtcclxuICAgICAgICAgICAgdGVbM10gPSB0bVszXSpzeDsgdGVbNF0gPSB0bVs0XSpzeTsgdGVbNV0gPSB0bVs1XSpzejtcclxuICAgICAgICAgICAgdGVbNl0gPSB0bVs2XSpzeDsgdGVbN10gPSB0bVs3XSpzeTsgdGVbOF0gPSB0bVs4XSpzejtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICB0cmFuc3Bvc2U6IGZ1bmN0aW9uICggbSApIHtcclxuXHJcbiAgICAgICAgdmFyIHRlID0gdGhpcy5lbGVtZW50cywgdG0gPSBtLmVsZW1lbnRzO1xyXG4gICAgICAgIHRlWzBdID0gdG1bMF07IHRlWzFdID0gdG1bM107IHRlWzJdID0gdG1bNl07XHJcbiAgICAgICAgdGVbM10gPSB0bVsxXTsgdGVbNF0gPSB0bVs0XTsgdGVbNV0gPSB0bVs3XTtcclxuICAgICAgICB0ZVs2XSA9IHRtWzJdOyB0ZVs3XSA9IHRtWzVdOyB0ZVs4XSA9IHRtWzhdO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG5cclxuICAgIH0sKi9cclxuXHJcbiAgICBzZXRRdWF0OiBmdW5jdGlvbiAocSkge1xyXG5cclxuICAgICAgdmFyIHRlID0gdGhpcy5lbGVtZW50cztcclxuICAgICAgdmFyIHggPSBxLngsIHkgPSBxLnksIHogPSBxLnosIHcgPSBxLnc7XHJcbiAgICAgIHZhciB4MiA9IHggKyB4LCB5MiA9IHkgKyB5LCB6MiA9IHogKyB6O1xyXG4gICAgICB2YXIgeHggPSB4ICogeDIsIHh5ID0geCAqIHkyLCB4eiA9IHggKiB6MjtcclxuICAgICAgdmFyIHl5ID0geSAqIHkyLCB5eiA9IHkgKiB6MiwgenogPSB6ICogejI7XHJcbiAgICAgIHZhciB3eCA9IHcgKiB4Miwgd3kgPSB3ICogeTIsIHd6ID0gdyAqIHoyO1xyXG5cclxuICAgICAgdGVbMF0gPSAxIC0gKHl5ICsgenopO1xyXG4gICAgICB0ZVsxXSA9IHh5IC0gd3o7XHJcbiAgICAgIHRlWzJdID0geHogKyB3eTtcclxuXHJcbiAgICAgIHRlWzNdID0geHkgKyB3ejtcclxuICAgICAgdGVbNF0gPSAxIC0gKHh4ICsgenopO1xyXG4gICAgICB0ZVs1XSA9IHl6IC0gd3g7XHJcblxyXG4gICAgICB0ZVs2XSA9IHh6IC0gd3k7XHJcbiAgICAgIHRlWzddID0geXogKyB3eDtcclxuICAgICAgdGVbOF0gPSAxIC0gKHh4ICsgeXkpO1xyXG5cclxuICAgICAgcmV0dXJuIHRoaXM7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBpbnZlcnQ6IGZ1bmN0aW9uIChtKSB7XHJcblxyXG4gICAgICB2YXIgdGUgPSB0aGlzLmVsZW1lbnRzLCB0bSA9IG0uZWxlbWVudHMsXHJcbiAgICAgICAgYTAwID0gdG1bMF0sIGExMCA9IHRtWzNdLCBhMjAgPSB0bVs2XSxcclxuICAgICAgICBhMDEgPSB0bVsxXSwgYTExID0gdG1bNF0sIGEyMSA9IHRtWzddLFxyXG4gICAgICAgIGEwMiA9IHRtWzJdLCBhMTIgPSB0bVs1XSwgYTIyID0gdG1bOF0sXHJcbiAgICAgICAgYjAxID0gYTIyICogYTExIC0gYTEyICogYTIxLFxyXG4gICAgICAgIGIxMSA9IC1hMjIgKiBhMTAgKyBhMTIgKiBhMjAsXHJcbiAgICAgICAgYjIxID0gYTIxICogYTEwIC0gYTExICogYTIwLFxyXG4gICAgICAgIGRldCA9IGEwMCAqIGIwMSArIGEwMSAqIGIxMSArIGEwMiAqIGIyMTtcclxuXHJcbiAgICAgIGlmIChkZXQgPT09IDApIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhcImNhbid0IGludmVydCBtYXRyaXgsIGRldGVybWluYW50IGlzIDBcIik7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuaWRlbnRpdHkoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgZGV0ID0gMS4wIC8gZGV0O1xyXG4gICAgICB0ZVswXSA9IGIwMSAqIGRldDtcclxuICAgICAgdGVbMV0gPSAoLWEyMiAqIGEwMSArIGEwMiAqIGEyMSkgKiBkZXQ7XHJcbiAgICAgIHRlWzJdID0gKGExMiAqIGEwMSAtIGEwMiAqIGExMSkgKiBkZXQ7XHJcbiAgICAgIHRlWzNdID0gYjExICogZGV0O1xyXG4gICAgICB0ZVs0XSA9IChhMjIgKiBhMDAgLSBhMDIgKiBhMjApICogZGV0O1xyXG4gICAgICB0ZVs1XSA9ICgtYTEyICogYTAwICsgYTAyICogYTEwKSAqIGRldDtcclxuICAgICAgdGVbNl0gPSBiMjEgKiBkZXQ7XHJcbiAgICAgIHRlWzddID0gKC1hMjEgKiBhMDAgKyBhMDEgKiBhMjApICogZGV0O1xyXG4gICAgICB0ZVs4XSA9IChhMTEgKiBhMDAgLSBhMDEgKiBhMTApICogZGV0O1xyXG4gICAgICByZXR1cm4gdGhpcztcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGFkZE9mZnNldDogZnVuY3Rpb24gKG0sIHYpIHtcclxuXHJcbiAgICAgIHZhciByZWxYID0gdi54O1xyXG4gICAgICB2YXIgcmVsWSA9IHYueTtcclxuICAgICAgdmFyIHJlbFogPSB2Lno7XHJcblxyXG4gICAgICB2YXIgdGUgPSB0aGlzLmVsZW1lbnRzO1xyXG4gICAgICB0ZVswXSArPSBtICogKHJlbFkgKiByZWxZICsgcmVsWiAqIHJlbFopO1xyXG4gICAgICB0ZVs0XSArPSBtICogKHJlbFggKiByZWxYICsgcmVsWiAqIHJlbFopO1xyXG4gICAgICB0ZVs4XSArPSBtICogKHJlbFggKiByZWxYICsgcmVsWSAqIHJlbFkpO1xyXG4gICAgICB2YXIgeHkgPSBtICogcmVsWCAqIHJlbFk7XHJcbiAgICAgIHZhciB5eiA9IG0gKiByZWxZICogcmVsWjtcclxuICAgICAgdmFyIHp4ID0gbSAqIHJlbFogKiByZWxYO1xyXG4gICAgICB0ZVsxXSAtPSB4eTtcclxuICAgICAgdGVbM10gLT0geHk7XHJcbiAgICAgIHRlWzJdIC09IHl6O1xyXG4gICAgICB0ZVs2XSAtPSB5ejtcclxuICAgICAgdGVbNV0gLT0geng7XHJcbiAgICAgIHRlWzddIC09IHp4O1xyXG4gICAgICByZXR1cm4gdGhpcztcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHN1Yk9mZnNldDogZnVuY3Rpb24gKG0sIHYpIHtcclxuXHJcbiAgICAgIHZhciByZWxYID0gdi54O1xyXG4gICAgICB2YXIgcmVsWSA9IHYueTtcclxuICAgICAgdmFyIHJlbFogPSB2Lno7XHJcblxyXG4gICAgICB2YXIgdGUgPSB0aGlzLmVsZW1lbnRzO1xyXG4gICAgICB0ZVswXSAtPSBtICogKHJlbFkgKiByZWxZICsgcmVsWiAqIHJlbFopO1xyXG4gICAgICB0ZVs0XSAtPSBtICogKHJlbFggKiByZWxYICsgcmVsWiAqIHJlbFopO1xyXG4gICAgICB0ZVs4XSAtPSBtICogKHJlbFggKiByZWxYICsgcmVsWSAqIHJlbFkpO1xyXG4gICAgICB2YXIgeHkgPSBtICogcmVsWCAqIHJlbFk7XHJcbiAgICAgIHZhciB5eiA9IG0gKiByZWxZICogcmVsWjtcclxuICAgICAgdmFyIHp4ID0gbSAqIHJlbFogKiByZWxYO1xyXG4gICAgICB0ZVsxXSArPSB4eTtcclxuICAgICAgdGVbM10gKz0geHk7XHJcbiAgICAgIHRlWzJdICs9IHl6O1xyXG4gICAgICB0ZVs2XSArPSB5ejtcclxuICAgICAgdGVbNV0gKz0geng7XHJcbiAgICAgIHRlWzddICs9IHp4O1xyXG4gICAgICByZXR1cm4gdGhpcztcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIE9LIFxyXG5cclxuICAgIG11bHRpcGx5U2NhbGFyOiBmdW5jdGlvbiAocykge1xyXG5cclxuICAgICAgdmFyIHRlID0gdGhpcy5lbGVtZW50cztcclxuXHJcbiAgICAgIHRlWzBdICo9IHM7IHRlWzNdICo9IHM7IHRlWzZdICo9IHM7XHJcbiAgICAgIHRlWzFdICo9IHM7IHRlWzRdICo9IHM7IHRlWzddICo9IHM7XHJcbiAgICAgIHRlWzJdICo9IHM7IHRlWzVdICo9IHM7IHRlWzhdICo9IHM7XHJcblxyXG4gICAgICByZXR1cm4gdGhpcztcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGlkZW50aXR5OiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICB0aGlzLnNldCgxLCAwLCAwLCAwLCAxLCAwLCAwLCAwLCAxKTtcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcblxyXG4gICAgfSxcclxuXHJcblxyXG4gICAgY2xvbmU6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgIHJldHVybiBuZXcgTWF0MzMoKS5mcm9tQXJyYXkodGhpcy5lbGVtZW50cyk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBjb3B5OiBmdW5jdGlvbiAobSkge1xyXG5cclxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCA5OyBpKyspIHRoaXMuZWxlbWVudHNbaV0gPSBtLmVsZW1lbnRzW2ldO1xyXG4gICAgICByZXR1cm4gdGhpcztcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGRldGVybWluYW50OiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICB2YXIgdGUgPSB0aGlzLmVsZW1lbnRzO1xyXG4gICAgICB2YXIgYSA9IHRlWzBdLCBiID0gdGVbMV0sIGMgPSB0ZVsyXSxcclxuICAgICAgICBkID0gdGVbM10sIGUgPSB0ZVs0XSwgZiA9IHRlWzVdLFxyXG4gICAgICAgIGcgPSB0ZVs2XSwgaCA9IHRlWzddLCBpID0gdGVbOF07XHJcblxyXG4gICAgICByZXR1cm4gYSAqIGUgKiBpIC0gYSAqIGYgKiBoIC0gYiAqIGQgKiBpICsgYiAqIGYgKiBnICsgYyAqIGQgKiBoIC0gYyAqIGUgKiBnO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgZnJvbUFycmF5OiBmdW5jdGlvbiAoYXJyYXksIG9mZnNldCkge1xyXG5cclxuICAgICAgaWYgKG9mZnNldCA9PT0gdW5kZWZpbmVkKSBvZmZzZXQgPSAwO1xyXG5cclxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCA5OyBpKyspIHtcclxuXHJcbiAgICAgICAgdGhpcy5lbGVtZW50c1tpXSA9IGFycmF5W2kgKyBvZmZzZXRdO1xyXG5cclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHRoaXM7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICB0b0FycmF5OiBmdW5jdGlvbiAoYXJyYXksIG9mZnNldCkge1xyXG5cclxuICAgICAgaWYgKGFycmF5ID09PSB1bmRlZmluZWQpIGFycmF5ID0gW107XHJcbiAgICAgIGlmIChvZmZzZXQgPT09IHVuZGVmaW5lZCkgb2Zmc2V0ID0gMDtcclxuXHJcbiAgICAgIHZhciB0ZSA9IHRoaXMuZWxlbWVudHM7XHJcblxyXG4gICAgICBhcnJheVtvZmZzZXRdID0gdGVbMF07XHJcbiAgICAgIGFycmF5W29mZnNldCArIDFdID0gdGVbMV07XHJcbiAgICAgIGFycmF5W29mZnNldCArIDJdID0gdGVbMl07XHJcblxyXG4gICAgICBhcnJheVtvZmZzZXQgKyAzXSA9IHRlWzNdO1xyXG4gICAgICBhcnJheVtvZmZzZXQgKyA0XSA9IHRlWzRdO1xyXG4gICAgICBhcnJheVtvZmZzZXQgKyA1XSA9IHRlWzVdO1xyXG5cclxuICAgICAgYXJyYXlbb2Zmc2V0ICsgNl0gPSB0ZVs2XTtcclxuICAgICAgYXJyYXlbb2Zmc2V0ICsgN10gPSB0ZVs3XTtcclxuICAgICAgYXJyYXlbb2Zmc2V0ICsgOF0gPSB0ZVs4XTtcclxuXHJcbiAgICAgIHJldHVybiBhcnJheTtcclxuXHJcbiAgICB9XHJcblxyXG5cclxuICB9KTtcclxuXHJcbiAgLyoqXHJcbiAgICogQW4gYXhpcy1hbGlnbmVkIGJvdW5kaW5nIGJveC5cclxuICAgKlxyXG4gICAqIEBhdXRob3Igc2FoYXJhblxyXG4gICAqIEBhdXRob3IgbG8tdGhcclxuICAgKi9cclxuXHJcbiAgZnVuY3Rpb24gQUFCQihtaW5YLCBtYXhYLCBtaW5ZLCBtYXhZLCBtaW5aLCBtYXhaKSB7XHJcblxyXG4gICAgdGhpcy5lbGVtZW50cyA9IG5ldyBGbG9hdDMyQXJyYXkoNik7XHJcbiAgICB2YXIgdGUgPSB0aGlzLmVsZW1lbnRzO1xyXG5cclxuICAgIHRlWzBdID0gbWluWCB8fCAwOyB0ZVsxXSA9IG1pblkgfHwgMDsgdGVbMl0gPSBtaW5aIHx8IDA7XHJcbiAgICB0ZVszXSA9IG1heFggfHwgMDsgdGVbNF0gPSBtYXhZIHx8IDA7IHRlWzVdID0gbWF4WiB8fCAwO1xyXG5cclxuICB9XHJcbiAgT2JqZWN0LmFzc2lnbihBQUJCLnByb3RvdHlwZSwge1xyXG5cclxuICAgIEFBQkI6IHRydWUsXHJcblxyXG4gICAgc2V0OiBmdW5jdGlvbiAobWluWCwgbWF4WCwgbWluWSwgbWF4WSwgbWluWiwgbWF4Wikge1xyXG5cclxuICAgICAgdmFyIHRlID0gdGhpcy5lbGVtZW50cztcclxuICAgICAgdGVbMF0gPSBtaW5YO1xyXG4gICAgICB0ZVszXSA9IG1heFg7XHJcbiAgICAgIHRlWzFdID0gbWluWTtcclxuICAgICAgdGVbNF0gPSBtYXhZO1xyXG4gICAgICB0ZVsyXSA9IG1pblo7XHJcbiAgICAgIHRlWzVdID0gbWF4WjtcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9LFxyXG5cclxuICAgIGludGVyc2VjdFRlc3Q6IGZ1bmN0aW9uIChhYWJiKSB7XHJcblxyXG4gICAgICB2YXIgdGUgPSB0aGlzLmVsZW1lbnRzO1xyXG4gICAgICB2YXIgdWUgPSBhYWJiLmVsZW1lbnRzO1xyXG4gICAgICByZXR1cm4gdGVbMF0gPiB1ZVszXSB8fCB0ZVsxXSA+IHVlWzRdIHx8IHRlWzJdID4gdWVbNV0gfHwgdGVbM10gPCB1ZVswXSB8fCB0ZVs0XSA8IHVlWzFdIHx8IHRlWzVdIDwgdWVbMl0gPyB0cnVlIDogZmFsc2U7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBpbnRlcnNlY3RUZXN0VHdvOiBmdW5jdGlvbiAoYWFiYikge1xyXG5cclxuICAgICAgdmFyIHRlID0gdGhpcy5lbGVtZW50cztcclxuICAgICAgdmFyIHVlID0gYWFiYi5lbGVtZW50cztcclxuICAgICAgcmV0dXJuIHRlWzBdIDwgdWVbMF0gfHwgdGVbMV0gPCB1ZVsxXSB8fCB0ZVsyXSA8IHVlWzJdIHx8IHRlWzNdID4gdWVbM10gfHwgdGVbNF0gPiB1ZVs0XSB8fCB0ZVs1XSA+IHVlWzVdID8gdHJ1ZSA6IGZhbHNlO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgY2xvbmU6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgIHJldHVybiBuZXcgdGhpcy5jb25zdHJ1Y3RvcigpLmZyb21BcnJheSh0aGlzLmVsZW1lbnRzKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGNvcHk6IGZ1bmN0aW9uIChhYWJiLCBtYXJnaW4pIHtcclxuXHJcbiAgICAgIHZhciBtID0gbWFyZ2luIHx8IDA7XHJcbiAgICAgIHZhciBtZSA9IGFhYmIuZWxlbWVudHM7XHJcbiAgICAgIHRoaXMuc2V0KG1lWzBdIC0gbSwgbWVbM10gKyBtLCBtZVsxXSAtIG0sIG1lWzRdICsgbSwgbWVbMl0gLSBtLCBtZVs1XSArIG0pO1xyXG4gICAgICByZXR1cm4gdGhpcztcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGZyb21BcnJheTogZnVuY3Rpb24gKGFycmF5KSB7XHJcblxyXG4gICAgICB0aGlzLmVsZW1lbnRzLnNldChhcnJheSk7XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgLy8gU2V0IHRoaXMgQUFCQiB0byB0aGUgY29tYmluZWQgQUFCQiBvZiBhYWJiMSBhbmQgYWFiYjIuXHJcblxyXG4gICAgY29tYmluZTogZnVuY3Rpb24gKGFhYmIxLCBhYWJiMikge1xyXG5cclxuICAgICAgdmFyIGEgPSBhYWJiMS5lbGVtZW50cztcclxuICAgICAgdmFyIGIgPSBhYWJiMi5lbGVtZW50cztcclxuICAgICAgdmFyIHRlID0gdGhpcy5lbGVtZW50cztcclxuXHJcbiAgICAgIHRlWzBdID0gYVswXSA8IGJbMF0gPyBhWzBdIDogYlswXTtcclxuICAgICAgdGVbMV0gPSBhWzFdIDwgYlsxXSA/IGFbMV0gOiBiWzFdO1xyXG4gICAgICB0ZVsyXSA9IGFbMl0gPCBiWzJdID8gYVsyXSA6IGJbMl07XHJcblxyXG4gICAgICB0ZVszXSA9IGFbM10gPiBiWzNdID8gYVszXSA6IGJbM107XHJcbiAgICAgIHRlWzRdID0gYVs0XSA+IGJbNF0gPyBhWzRdIDogYls0XTtcclxuICAgICAgdGVbNV0gPSBhWzVdID4gYls1XSA/IGFbNV0gOiBiWzVdO1xyXG5cclxuICAgICAgcmV0dXJuIHRoaXM7XHJcblxyXG4gICAgfSxcclxuXHJcblxyXG4gICAgLy8gR2V0IHRoZSBzdXJmYWNlIGFyZWEuXHJcblxyXG4gICAgc3VyZmFjZUFyZWE6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgIHZhciB0ZSA9IHRoaXMuZWxlbWVudHM7XHJcbiAgICAgIHZhciBhID0gdGVbM10gLSB0ZVswXTtcclxuICAgICAgdmFyIGggPSB0ZVs0XSAtIHRlWzFdO1xyXG4gICAgICB2YXIgZCA9IHRlWzVdIC0gdGVbMl07XHJcbiAgICAgIHJldHVybiAyICogKGEgKiAoaCArIGQpICsgaCAqIGQpO1xyXG5cclxuICAgIH0sXHJcblxyXG5cclxuICAgIC8vIEdldCB3aGV0aGVyIHRoZSBBQUJCIGludGVyc2VjdHMgd2l0aCB0aGUgcG9pbnQgb3Igbm90LlxyXG5cclxuICAgIGludGVyc2VjdHNXaXRoUG9pbnQ6IGZ1bmN0aW9uICh4LCB5LCB6KSB7XHJcblxyXG4gICAgICB2YXIgdGUgPSB0aGlzLmVsZW1lbnRzO1xyXG4gICAgICByZXR1cm4geCA+PSB0ZVswXSAmJiB4IDw9IHRlWzNdICYmIHkgPj0gdGVbMV0gJiYgeSA8PSB0ZVs0XSAmJiB6ID49IHRlWzJdICYmIHogPD0gdGVbNV07XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldCB0aGUgQUFCQiBmcm9tIGFuIGFycmF5XHJcbiAgICAgKiBvZiB2ZXJ0aWNlcy4gRnJvbSBUSFJFRS5cclxuICAgICAqIEBhdXRob3IgV2VzdExhbmdsZXlcclxuICAgICAqIEBhdXRob3IgeHByb2dyYW1cclxuICAgICAqL1xyXG5cclxuICAgIHNldEZyb21Qb2ludHM6IGZ1bmN0aW9uIChhcnIpIHtcclxuICAgICAgdGhpcy5tYWtlRW1wdHkoKTtcclxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICB0aGlzLmV4cGFuZEJ5UG9pbnQoYXJyW2ldKTtcclxuICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBtYWtlRW1wdHk6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgdGhpcy5zZXQoLUluZmluaXR5LCAtSW5maW5pdHksIC1JbmZpbml0eSwgSW5maW5pdHksIEluZmluaXR5LCBJbmZpbml0eSk7XHJcbiAgICB9LFxyXG5cclxuICAgIGV4cGFuZEJ5UG9pbnQ6IGZ1bmN0aW9uIChwdCkge1xyXG4gICAgICB2YXIgdGUgPSB0aGlzLmVsZW1lbnRzO1xyXG4gICAgICB0aGlzLnNldChcclxuICAgICAgICBfTWF0aC5taW4odGVbMF0sIHB0LngpLCBfTWF0aC5taW4odGVbMV0sIHB0LnkpLCBfTWF0aC5taW4odGVbMl0sIHB0LnopLFxyXG4gICAgICAgIF9NYXRoLm1heCh0ZVszXSwgcHQueCksIF9NYXRoLm1heCh0ZVs0XSwgcHQueSksIF9NYXRoLm1heCh0ZVs1XSwgcHQueilcclxuICAgICAgKTtcclxuICAgIH0sXHJcblxyXG4gICAgZXhwYW5kQnlTY2FsYXI6IGZ1bmN0aW9uIChzKSB7XHJcblxyXG4gICAgICB2YXIgdGUgPSB0aGlzLmVsZW1lbnRzO1xyXG4gICAgICB0ZVswXSArPSAtcztcclxuICAgICAgdGVbMV0gKz0gLXM7XHJcbiAgICAgIHRlWzJdICs9IC1zO1xyXG4gICAgICB0ZVszXSArPSBzO1xyXG4gICAgICB0ZVs0XSArPSBzO1xyXG4gICAgICB0ZVs1XSArPSBzO1xyXG4gICAgfVxyXG5cclxuICB9KTtcclxuXHJcbiAgdmFyIGNvdW50ID0gMDtcclxuICBmdW5jdGlvbiBTaGFwZUlkQ291bnQoKSB7IHJldHVybiBjb3VudCsrOyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEEgc2hhcGUgaXMgdXNlZCB0byBkZXRlY3QgY29sbGlzaW9ucyBvZiByaWdpZCBib2RpZXMuXHJcbiAgICpcclxuICAgKiBAYXV0aG9yIHNhaGFyYW5cclxuICAgKiBAYXV0aG9yIGxvLXRoXHJcbiAgICovXHJcblxyXG4gIGZ1bmN0aW9uIFNoYXBlKGNvbmZpZykge1xyXG5cclxuICAgIHRoaXMudHlwZSA9IFNIQVBFX05VTEw7XHJcblxyXG4gICAgLy8gZ2xvYmFsIGlkZW50aWZpY2F0aW9uIG9mIHRoZSBzaGFwZSBzaG91bGQgYmUgdW5pcXVlIHRvIHRoZSBzaGFwZS5cclxuICAgIHRoaXMuaWQgPSBTaGFwZUlkQ291bnQoKTtcclxuXHJcbiAgICAvLyBwcmV2aW91cyBzaGFwZSBpbiBwYXJlbnQgcmlnaWQgYm9keS4gVXNlZCBmb3IgZmFzdCBpbnRlcmF0aW9ucy5cclxuICAgIHRoaXMucHJldiA9IG51bGw7XHJcblxyXG4gICAgLy8gbmV4dCBzaGFwZSBpbiBwYXJlbnQgcmlnaWQgYm9keS4gVXNlZCBmb3IgZmFzdCBpbnRlcmF0aW9ucy5cclxuICAgIHRoaXMubmV4dCA9IG51bGw7XHJcblxyXG4gICAgLy8gcHJveHkgb2YgdGhlIHNoYXBlIHVzZWQgZm9yIGJyb2FkLXBoYXNlIGNvbGxpc2lvbiBkZXRlY3Rpb24uXHJcbiAgICB0aGlzLnByb3h5ID0gbnVsbDtcclxuXHJcbiAgICAvLyBwYXJlbnQgcmlnaWQgYm9keSBvZiB0aGUgc2hhcGUuXHJcbiAgICB0aGlzLnBhcmVudCA9IG51bGw7XHJcblxyXG4gICAgLy8gbGlua2VkIGxpc3Qgb2YgdGhlIGNvbnRhY3RzIHdpdGggdGhlIHNoYXBlLlxyXG4gICAgdGhpcy5jb250YWN0TGluayA9IG51bGw7XHJcblxyXG4gICAgLy8gbnVtYmVyIG9mIHRoZSBjb250YWN0cyB3aXRoIHRoZSBzaGFwZS5cclxuICAgIHRoaXMubnVtQ29udGFjdHMgPSAwO1xyXG5cclxuICAgIC8vIGNlbnRlciBvZiBncmF2aXR5IG9mIHRoZSBzaGFwZSBpbiB3b3JsZCBjb29yZGluYXRlIHN5c3RlbS5cclxuICAgIHRoaXMucG9zaXRpb24gPSBuZXcgVmVjMygpO1xyXG5cclxuICAgIC8vIHJvdGF0aW9uIG1hdHJpeCBvZiB0aGUgc2hhcGUgaW4gd29ybGQgY29vcmRpbmF0ZSBzeXN0ZW0uXHJcbiAgICB0aGlzLnJvdGF0aW9uID0gbmV3IE1hdDMzKCk7XHJcblxyXG4gICAgLy8gcG9zaXRpb24gb2YgdGhlIHNoYXBlIGluIHBhcmVudCdzIGNvb3JkaW5hdGUgc3lzdGVtLlxyXG4gICAgdGhpcy5yZWxhdGl2ZVBvc2l0aW9uID0gbmV3IFZlYzMoKS5jb3B5KGNvbmZpZy5yZWxhdGl2ZVBvc2l0aW9uKTtcclxuXHJcbiAgICAvLyByb3RhdGlvbiBtYXRyaXggb2YgdGhlIHNoYXBlIGluIHBhcmVudCdzIGNvb3JkaW5hdGUgc3lzdGVtLlxyXG4gICAgdGhpcy5yZWxhdGl2ZVJvdGF0aW9uID0gbmV3IE1hdDMzKCkuY29weShjb25maWcucmVsYXRpdmVSb3RhdGlvbik7XHJcblxyXG4gICAgLy8gYXhpcy1hbGlnbmVkIGJvdW5kaW5nIGJveCBvZiB0aGUgc2hhcGUuXHJcbiAgICB0aGlzLmFhYmIgPSBuZXcgQUFCQigpO1xyXG5cclxuICAgIC8vIGRlbnNpdHkgb2YgdGhlIHNoYXBlLlxyXG4gICAgdGhpcy5kZW5zaXR5ID0gY29uZmlnLmRlbnNpdHk7XHJcblxyXG4gICAgLy8gY29lZmZpY2llbnQgb2YgZnJpY3Rpb24gb2YgdGhlIHNoYXBlLlxyXG4gICAgdGhpcy5mcmljdGlvbiA9IGNvbmZpZy5mcmljdGlvbjtcclxuXHJcbiAgICAvLyBjb2VmZmljaWVudCBvZiByZXN0aXR1dGlvbiBvZiB0aGUgc2hhcGUuXHJcbiAgICB0aGlzLnJlc3RpdHV0aW9uID0gY29uZmlnLnJlc3RpdHV0aW9uO1xyXG5cclxuICAgIC8vIGJpdHMgb2YgdGhlIGNvbGxpc2lvbiBncm91cHMgdG8gd2hpY2ggdGhlIHNoYXBlIGJlbG9uZ3MuXHJcbiAgICB0aGlzLmJlbG9uZ3NUbyA9IGNvbmZpZy5iZWxvbmdzVG87XHJcblxyXG4gICAgLy8gYml0cyBvZiB0aGUgY29sbGlzaW9uIGdyb3VwcyB3aXRoIHdoaWNoIHRoZSBzaGFwZSBjb2xsaWRlcy5cclxuICAgIHRoaXMuY29sbGlkZXNXaXRoID0gY29uZmlnLmNvbGxpZGVzV2l0aDtcclxuXHJcbiAgfVxyXG4gIE9iamVjdC5hc3NpZ24oU2hhcGUucHJvdG90eXBlLCB7XHJcblxyXG4gICAgU2hhcGU6IHRydWUsXHJcblxyXG4gICAgLy8gQ2FsY3VsYXRlIHRoZSBtYXNzIGluZm9ybWF0aW9uIG9mIHRoZSBzaGFwZS5cclxuXHJcbiAgICBjYWxjdWxhdGVNYXNzSW5mbzogZnVuY3Rpb24gKG91dCkge1xyXG5cclxuICAgICAgcHJpbnRFcnJvcihcIlNoYXBlXCIsIFwiSW5oZXJpdGFuY2UgZXJyb3IuXCIpO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgLy8gVXBkYXRlIHRoZSBwcm94eSBvZiB0aGUgc2hhcGUuXHJcblxyXG4gICAgdXBkYXRlUHJveHk6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgIHByaW50RXJyb3IoXCJTaGFwZVwiLCBcIkluaGVyaXRhbmNlIGVycm9yLlwiKTtcclxuXHJcbiAgICB9XHJcblxyXG4gIH0pO1xyXG5cclxuICAvKipcclxuICAgKiBCb3ggc2hhcGUuXHJcbiAgICogQGF1dGhvciBzYWhhcmFuXHJcbiAgICogQGF1dGhvciBsby10aFxyXG4gICAqL1xyXG5cclxuICBmdW5jdGlvbiBCb3goY29uZmlnLCBXaWR0aCwgSGVpZ2h0LCBEZXB0aCkge1xyXG5cclxuICAgIFNoYXBlLmNhbGwodGhpcywgY29uZmlnKTtcclxuXHJcbiAgICB0aGlzLnR5cGUgPSBTSEFQRV9CT1g7XHJcblxyXG4gICAgdGhpcy53aWR0aCA9IFdpZHRoO1xyXG4gICAgdGhpcy5oZWlnaHQgPSBIZWlnaHQ7XHJcbiAgICB0aGlzLmRlcHRoID0gRGVwdGg7XHJcblxyXG4gICAgdGhpcy5oYWxmV2lkdGggPSBXaWR0aCAqIDAuNTtcclxuICAgIHRoaXMuaGFsZkhlaWdodCA9IEhlaWdodCAqIDAuNTtcclxuICAgIHRoaXMuaGFsZkRlcHRoID0gRGVwdGggKiAwLjU7XHJcblxyXG4gICAgdGhpcy5kaW1lbnRpb25zID0gbmV3IEZsb2F0MzJBcnJheSgxOCk7XHJcbiAgICB0aGlzLmVsZW1lbnRzID0gbmV3IEZsb2F0MzJBcnJheSgyNCk7XHJcblxyXG4gIH1cclxuICBCb3gucHJvdG90eXBlID0gT2JqZWN0LmFzc2lnbihPYmplY3QuY3JlYXRlKFNoYXBlLnByb3RvdHlwZSksIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcjogQm94LFxyXG5cclxuICAgIGNhbGN1bGF0ZU1hc3NJbmZvOiBmdW5jdGlvbiAob3V0KSB7XHJcblxyXG4gICAgICB2YXIgbWFzcyA9IHRoaXMud2lkdGggKiB0aGlzLmhlaWdodCAqIHRoaXMuZGVwdGggKiB0aGlzLmRlbnNpdHk7XHJcbiAgICAgIHZhciBkaXZpZCA9IDEgLyAxMjtcclxuICAgICAgb3V0Lm1hc3MgPSBtYXNzO1xyXG4gICAgICBvdXQuaW5lcnRpYS5zZXQoXHJcbiAgICAgICAgbWFzcyAqICh0aGlzLmhlaWdodCAqIHRoaXMuaGVpZ2h0ICsgdGhpcy5kZXB0aCAqIHRoaXMuZGVwdGgpICogZGl2aWQsIDAsIDAsXHJcbiAgICAgICAgMCwgbWFzcyAqICh0aGlzLndpZHRoICogdGhpcy53aWR0aCArIHRoaXMuZGVwdGggKiB0aGlzLmRlcHRoKSAqIGRpdmlkLCAwLFxyXG4gICAgICAgIDAsIDAsIG1hc3MgKiAodGhpcy53aWR0aCAqIHRoaXMud2lkdGggKyB0aGlzLmhlaWdodCAqIHRoaXMuaGVpZ2h0KSAqIGRpdmlkXHJcbiAgICAgICk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICB1cGRhdGVQcm94eTogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgdmFyIHRlID0gdGhpcy5yb3RhdGlvbi5lbGVtZW50cztcclxuICAgICAgdmFyIGRpID0gdGhpcy5kaW1lbnRpb25zO1xyXG4gICAgICAvLyBXaWR0aFxyXG4gICAgICBkaVswXSA9IHRlWzBdO1xyXG4gICAgICBkaVsxXSA9IHRlWzNdO1xyXG4gICAgICBkaVsyXSA9IHRlWzZdO1xyXG4gICAgICAvLyBIZWlnaHRcclxuICAgICAgZGlbM10gPSB0ZVsxXTtcclxuICAgICAgZGlbNF0gPSB0ZVs0XTtcclxuICAgICAgZGlbNV0gPSB0ZVs3XTtcclxuICAgICAgLy8gRGVwdGhcclxuICAgICAgZGlbNl0gPSB0ZVsyXTtcclxuICAgICAgZGlbN10gPSB0ZVs1XTtcclxuICAgICAgZGlbOF0gPSB0ZVs4XTtcclxuICAgICAgLy8gaGFsZiBXaWR0aFxyXG4gICAgICBkaVs5XSA9IHRlWzBdICogdGhpcy5oYWxmV2lkdGg7XHJcbiAgICAgIGRpWzEwXSA9IHRlWzNdICogdGhpcy5oYWxmV2lkdGg7XHJcbiAgICAgIGRpWzExXSA9IHRlWzZdICogdGhpcy5oYWxmV2lkdGg7XHJcbiAgICAgIC8vIGhhbGYgSGVpZ2h0XHJcbiAgICAgIGRpWzEyXSA9IHRlWzFdICogdGhpcy5oYWxmSGVpZ2h0O1xyXG4gICAgICBkaVsxM10gPSB0ZVs0XSAqIHRoaXMuaGFsZkhlaWdodDtcclxuICAgICAgZGlbMTRdID0gdGVbN10gKiB0aGlzLmhhbGZIZWlnaHQ7XHJcbiAgICAgIC8vIGhhbGYgRGVwdGhcclxuICAgICAgZGlbMTVdID0gdGVbMl0gKiB0aGlzLmhhbGZEZXB0aDtcclxuICAgICAgZGlbMTZdID0gdGVbNV0gKiB0aGlzLmhhbGZEZXB0aDtcclxuICAgICAgZGlbMTddID0gdGVbOF0gKiB0aGlzLmhhbGZEZXB0aDtcclxuXHJcbiAgICAgIHZhciB3eCA9IGRpWzldO1xyXG4gICAgICB2YXIgd3kgPSBkaVsxMF07XHJcbiAgICAgIHZhciB3eiA9IGRpWzExXTtcclxuICAgICAgdmFyIGh4ID0gZGlbMTJdO1xyXG4gICAgICB2YXIgaHkgPSBkaVsxM107XHJcbiAgICAgIHZhciBoeiA9IGRpWzE0XTtcclxuICAgICAgdmFyIGR4ID0gZGlbMTVdO1xyXG4gICAgICB2YXIgZHkgPSBkaVsxNl07XHJcbiAgICAgIHZhciBkeiA9IGRpWzE3XTtcclxuXHJcbiAgICAgIHZhciB4ID0gdGhpcy5wb3NpdGlvbi54O1xyXG4gICAgICB2YXIgeSA9IHRoaXMucG9zaXRpb24ueTtcclxuICAgICAgdmFyIHogPSB0aGlzLnBvc2l0aW9uLno7XHJcblxyXG4gICAgICB2YXIgdiA9IHRoaXMuZWxlbWVudHM7XHJcbiAgICAgIC8vdjFcclxuICAgICAgdlswXSA9IHggKyB3eCArIGh4ICsgZHg7XHJcbiAgICAgIHZbMV0gPSB5ICsgd3kgKyBoeSArIGR5O1xyXG4gICAgICB2WzJdID0geiArIHd6ICsgaHogKyBkejtcclxuICAgICAgLy92MlxyXG4gICAgICB2WzNdID0geCArIHd4ICsgaHggLSBkeDtcclxuICAgICAgdls0XSA9IHkgKyB3eSArIGh5IC0gZHk7XHJcbiAgICAgIHZbNV0gPSB6ICsgd3ogKyBoeiAtIGR6O1xyXG4gICAgICAvL3YzXHJcbiAgICAgIHZbNl0gPSB4ICsgd3ggLSBoeCArIGR4O1xyXG4gICAgICB2WzddID0geSArIHd5IC0gaHkgKyBkeTtcclxuICAgICAgdls4XSA9IHogKyB3eiAtIGh6ICsgZHo7XHJcbiAgICAgIC8vdjRcclxuICAgICAgdls5XSA9IHggKyB3eCAtIGh4IC0gZHg7XHJcbiAgICAgIHZbMTBdID0geSArIHd5IC0gaHkgLSBkeTtcclxuICAgICAgdlsxMV0gPSB6ICsgd3ogLSBoeiAtIGR6O1xyXG4gICAgICAvL3Y1XHJcbiAgICAgIHZbMTJdID0geCAtIHd4ICsgaHggKyBkeDtcclxuICAgICAgdlsxM10gPSB5IC0gd3kgKyBoeSArIGR5O1xyXG4gICAgICB2WzE0XSA9IHogLSB3eiArIGh6ICsgZHo7XHJcbiAgICAgIC8vdjZcclxuICAgICAgdlsxNV0gPSB4IC0gd3ggKyBoeCAtIGR4O1xyXG4gICAgICB2WzE2XSA9IHkgLSB3eSArIGh5IC0gZHk7XHJcbiAgICAgIHZbMTddID0geiAtIHd6ICsgaHogLSBkejtcclxuICAgICAgLy92N1xyXG4gICAgICB2WzE4XSA9IHggLSB3eCAtIGh4ICsgZHg7XHJcbiAgICAgIHZbMTldID0geSAtIHd5IC0gaHkgKyBkeTtcclxuICAgICAgdlsyMF0gPSB6IC0gd3ogLSBoeiArIGR6O1xyXG4gICAgICAvL3Y4XHJcbiAgICAgIHZbMjFdID0geCAtIHd4IC0gaHggLSBkeDtcclxuICAgICAgdlsyMl0gPSB5IC0gd3kgLSBoeSAtIGR5O1xyXG4gICAgICB2WzIzXSA9IHogLSB3eiAtIGh6IC0gZHo7XHJcblxyXG4gICAgICB2YXIgdyA9IGRpWzldIDwgMCA/IC1kaVs5XSA6IGRpWzldO1xyXG4gICAgICB2YXIgaCA9IGRpWzEwXSA8IDAgPyAtZGlbMTBdIDogZGlbMTBdO1xyXG4gICAgICB2YXIgZCA9IGRpWzExXSA8IDAgPyAtZGlbMTFdIDogZGlbMTFdO1xyXG5cclxuICAgICAgdyA9IGRpWzEyXSA8IDAgPyB3IC0gZGlbMTJdIDogdyArIGRpWzEyXTtcclxuICAgICAgaCA9IGRpWzEzXSA8IDAgPyBoIC0gZGlbMTNdIDogaCArIGRpWzEzXTtcclxuICAgICAgZCA9IGRpWzE0XSA8IDAgPyBkIC0gZGlbMTRdIDogZCArIGRpWzE0XTtcclxuXHJcbiAgICAgIHcgPSBkaVsxNV0gPCAwID8gdyAtIGRpWzE1XSA6IHcgKyBkaVsxNV07XHJcbiAgICAgIGggPSBkaVsxNl0gPCAwID8gaCAtIGRpWzE2XSA6IGggKyBkaVsxNl07XHJcbiAgICAgIGQgPSBkaVsxN10gPCAwID8gZCAtIGRpWzE3XSA6IGQgKyBkaVsxN107XHJcblxyXG4gICAgICB2YXIgcCA9IEFBQkJfUFJPWDtcclxuXHJcbiAgICAgIHRoaXMuYWFiYi5zZXQoXHJcbiAgICAgICAgdGhpcy5wb3NpdGlvbi54IC0gdyAtIHAsIHRoaXMucG9zaXRpb24ueCArIHcgKyBwLFxyXG4gICAgICAgIHRoaXMucG9zaXRpb24ueSAtIGggLSBwLCB0aGlzLnBvc2l0aW9uLnkgKyBoICsgcCxcclxuICAgICAgICB0aGlzLnBvc2l0aW9uLnogLSBkIC0gcCwgdGhpcy5wb3NpdGlvbi56ICsgZCArIHBcclxuICAgICAgKTtcclxuXHJcbiAgICAgIGlmICh0aGlzLnByb3h5ICE9IG51bGwpIHRoaXMucHJveHkudXBkYXRlKCk7XHJcblxyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICAvKipcclxuICAgKiBTcGhlcmUgc2hhcGVcclxuICAgKiBAYXV0aG9yIHNhaGFyYW5cclxuICAgKiBAYXV0aG9yIGxvLXRoXHJcbiAgICovXHJcblxyXG4gIGZ1bmN0aW9uIFNwaGVyZShjb25maWcsIHJhZGl1cykge1xyXG5cclxuICAgIFNoYXBlLmNhbGwodGhpcywgY29uZmlnKTtcclxuXHJcbiAgICB0aGlzLnR5cGUgPSBTSEFQRV9TUEhFUkU7XHJcblxyXG4gICAgLy8gcmFkaXVzIG9mIHRoZSBzaGFwZS5cclxuICAgIHRoaXMucmFkaXVzID0gcmFkaXVzO1xyXG5cclxuICB9XHJcbiAgU3BoZXJlLnByb3RvdHlwZSA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmNyZWF0ZShTaGFwZS5wcm90b3R5cGUpLCB7XHJcblxyXG4gICAgY29uc3RydWN0b3I6IFNwaGVyZSxcclxuXHJcbiAgICB2b2x1bWU6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgIHJldHVybiBfTWF0aC5QSSAqIHRoaXMucmFkaXVzICogMS4zMzMzMzM7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBjYWxjdWxhdGVNYXNzSW5mbzogZnVuY3Rpb24gKG91dCkge1xyXG5cclxuICAgICAgdmFyIG1hc3MgPSB0aGlzLnZvbHVtZSgpICogdGhpcy5yYWRpdXMgKiB0aGlzLnJhZGl1cyAqIHRoaXMuZGVuc2l0eTsgLy8xLjMzMyAqIF9NYXRoLlBJICogdGhpcy5yYWRpdXMgKiB0aGlzLnJhZGl1cyAqIHRoaXMucmFkaXVzICogdGhpcy5kZW5zaXR5O1xyXG4gICAgICBvdXQubWFzcyA9IG1hc3M7XHJcbiAgICAgIHZhciBpbmVydGlhID0gbWFzcyAqIHRoaXMucmFkaXVzICogdGhpcy5yYWRpdXMgKiAwLjQ7XHJcbiAgICAgIG91dC5pbmVydGlhLnNldChpbmVydGlhLCAwLCAwLCAwLCBpbmVydGlhLCAwLCAwLCAwLCBpbmVydGlhKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHVwZGF0ZVByb3h5OiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICB2YXIgcCA9IEFBQkJfUFJPWDtcclxuXHJcbiAgICAgIHRoaXMuYWFiYi5zZXQoXHJcbiAgICAgICAgdGhpcy5wb3NpdGlvbi54IC0gdGhpcy5yYWRpdXMgLSBwLCB0aGlzLnBvc2l0aW9uLnggKyB0aGlzLnJhZGl1cyArIHAsXHJcbiAgICAgICAgdGhpcy5wb3NpdGlvbi55IC0gdGhpcy5yYWRpdXMgLSBwLCB0aGlzLnBvc2l0aW9uLnkgKyB0aGlzLnJhZGl1cyArIHAsXHJcbiAgICAgICAgdGhpcy5wb3NpdGlvbi56IC0gdGhpcy5yYWRpdXMgLSBwLCB0aGlzLnBvc2l0aW9uLnogKyB0aGlzLnJhZGl1cyArIHBcclxuICAgICAgKTtcclxuXHJcbiAgICAgIGlmICh0aGlzLnByb3h5ICE9IG51bGwpIHRoaXMucHJveHkudXBkYXRlKCk7XHJcblxyXG4gICAgfVxyXG5cclxuICB9KTtcclxuXHJcbiAgLyoqXHJcbiAgICogQ3lsaW5kZXIgc2hhcGVcclxuICAgKiBAYXV0aG9yIHNhaGFyYW5cclxuICAgKiBAYXV0aG9yIGxvLXRoXHJcbiAgICovXHJcblxyXG4gIGZ1bmN0aW9uIEN5bGluZGVyKGNvbmZpZywgcmFkaXVzLCBoZWlnaHQpIHtcclxuXHJcbiAgICBTaGFwZS5jYWxsKHRoaXMsIGNvbmZpZyk7XHJcblxyXG4gICAgdGhpcy50eXBlID0gU0hBUEVfQ1lMSU5ERVI7XHJcblxyXG4gICAgdGhpcy5yYWRpdXMgPSByYWRpdXM7XHJcbiAgICB0aGlzLmhlaWdodCA9IGhlaWdodDtcclxuICAgIHRoaXMuaGFsZkhlaWdodCA9IGhlaWdodCAqIDAuNTtcclxuXHJcbiAgICB0aGlzLm5vcm1hbERpcmVjdGlvbiA9IG5ldyBWZWMzKCk7XHJcbiAgICB0aGlzLmhhbGZEaXJlY3Rpb24gPSBuZXcgVmVjMygpO1xyXG5cclxuICB9XHJcbiAgQ3lsaW5kZXIucHJvdG90eXBlID0gT2JqZWN0LmFzc2lnbihPYmplY3QuY3JlYXRlKFNoYXBlLnByb3RvdHlwZSksIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcjogQ3lsaW5kZXIsXHJcblxyXG4gICAgY2FsY3VsYXRlTWFzc0luZm86IGZ1bmN0aW9uIChvdXQpIHtcclxuXHJcbiAgICAgIHZhciByc3EgPSB0aGlzLnJhZGl1cyAqIHRoaXMucmFkaXVzO1xyXG4gICAgICB2YXIgbWFzcyA9IF9NYXRoLlBJICogcnNxICogdGhpcy5oZWlnaHQgKiB0aGlzLmRlbnNpdHk7XHJcbiAgICAgIHZhciBpbmVydGlhWFogPSAoKDAuMjUgKiByc3EpICsgKDAuMDgzMyAqIHRoaXMuaGVpZ2h0ICogdGhpcy5oZWlnaHQpKSAqIG1hc3M7XHJcbiAgICAgIHZhciBpbmVydGlhWSA9IDAuNSAqIHJzcTtcclxuICAgICAgb3V0Lm1hc3MgPSBtYXNzO1xyXG4gICAgICBvdXQuaW5lcnRpYS5zZXQoaW5lcnRpYVhaLCAwLCAwLCAwLCBpbmVydGlhWSwgMCwgMCwgMCwgaW5lcnRpYVhaKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHVwZGF0ZVByb3h5OiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICB2YXIgdGUgPSB0aGlzLnJvdGF0aW9uLmVsZW1lbnRzO1xyXG4gICAgICB2YXIgbGVuLCB3eCwgaHksIGR6LCB4eCwgeXksIHp6LCB3LCBoLCBkLCBwO1xyXG5cclxuICAgICAgeHggPSB0ZVsxXSAqIHRlWzFdO1xyXG4gICAgICB5eSA9IHRlWzRdICogdGVbNF07XHJcbiAgICAgIHp6ID0gdGVbN10gKiB0ZVs3XTtcclxuXHJcbiAgICAgIHRoaXMubm9ybWFsRGlyZWN0aW9uLnNldCh0ZVsxXSwgdGVbNF0sIHRlWzddKTtcclxuICAgICAgdGhpcy5oYWxmRGlyZWN0aW9uLnNjYWxlKHRoaXMubm9ybWFsRGlyZWN0aW9uLCB0aGlzLmhhbGZIZWlnaHQpO1xyXG5cclxuICAgICAgd3ggPSAxIC0geHg7XHJcbiAgICAgIGxlbiA9IF9NYXRoLnNxcnQod3ggKiB3eCArIHh4ICogeXkgKyB4eCAqIHp6KTtcclxuICAgICAgaWYgKGxlbiA+IDApIGxlbiA9IHRoaXMucmFkaXVzIC8gbGVuO1xyXG4gICAgICB3eCAqPSBsZW47XHJcbiAgICAgIGh5ID0gMSAtIHl5O1xyXG4gICAgICBsZW4gPSBfTWF0aC5zcXJ0KHl5ICogeHggKyBoeSAqIGh5ICsgeXkgKiB6eik7XHJcbiAgICAgIGlmIChsZW4gPiAwKSBsZW4gPSB0aGlzLnJhZGl1cyAvIGxlbjtcclxuICAgICAgaHkgKj0gbGVuO1xyXG4gICAgICBkeiA9IDEgLSB6ejtcclxuICAgICAgbGVuID0gX01hdGguc3FydCh6eiAqIHh4ICsgenogKiB5eSArIGR6ICogZHopO1xyXG4gICAgICBpZiAobGVuID4gMCkgbGVuID0gdGhpcy5yYWRpdXMgLyBsZW47XHJcbiAgICAgIGR6ICo9IGxlbjtcclxuXHJcbiAgICAgIHcgPSB0aGlzLmhhbGZEaXJlY3Rpb24ueCA8IDAgPyAtdGhpcy5oYWxmRGlyZWN0aW9uLnggOiB0aGlzLmhhbGZEaXJlY3Rpb24ueDtcclxuICAgICAgaCA9IHRoaXMuaGFsZkRpcmVjdGlvbi55IDwgMCA/IC10aGlzLmhhbGZEaXJlY3Rpb24ueSA6IHRoaXMuaGFsZkRpcmVjdGlvbi55O1xyXG4gICAgICBkID0gdGhpcy5oYWxmRGlyZWN0aW9uLnogPCAwID8gLXRoaXMuaGFsZkRpcmVjdGlvbi56IDogdGhpcy5oYWxmRGlyZWN0aW9uLno7XHJcblxyXG4gICAgICB3ID0gd3ggPCAwID8gdyAtIHd4IDogdyArIHd4O1xyXG4gICAgICBoID0gaHkgPCAwID8gaCAtIGh5IDogaCArIGh5O1xyXG4gICAgICBkID0gZHogPCAwID8gZCAtIGR6IDogZCArIGR6O1xyXG5cclxuICAgICAgcCA9IEFBQkJfUFJPWDtcclxuXHJcbiAgICAgIHRoaXMuYWFiYi5zZXQoXHJcbiAgICAgICAgdGhpcy5wb3NpdGlvbi54IC0gdyAtIHAsIHRoaXMucG9zaXRpb24ueCArIHcgKyBwLFxyXG4gICAgICAgIHRoaXMucG9zaXRpb24ueSAtIGggLSBwLCB0aGlzLnBvc2l0aW9uLnkgKyBoICsgcCxcclxuICAgICAgICB0aGlzLnBvc2l0aW9uLnogLSBkIC0gcCwgdGhpcy5wb3NpdGlvbi56ICsgZCArIHBcclxuICAgICAgKTtcclxuXHJcbiAgICAgIGlmICh0aGlzLnByb3h5ICE9IG51bGwpIHRoaXMucHJveHkudXBkYXRlKCk7XHJcblxyXG4gICAgfVxyXG5cclxuICB9KTtcclxuXHJcbiAgLyoqXHJcbiAgICogUGxhbmUgc2hhcGUuXHJcbiAgICogQGF1dGhvciBsby10aFxyXG4gICAqL1xyXG5cclxuICBmdW5jdGlvbiBQbGFuZShjb25maWcsIG5vcm1hbCkge1xyXG5cclxuICAgIFNoYXBlLmNhbGwodGhpcywgY29uZmlnKTtcclxuXHJcbiAgICB0aGlzLnR5cGUgPSBTSEFQRV9QTEFORTtcclxuXHJcbiAgICAvLyByYWRpdXMgb2YgdGhlIHNoYXBlLlxyXG4gICAgdGhpcy5ub3JtYWwgPSBuZXcgVmVjMygwLCAxLCAwKTtcclxuXHJcbiAgfVxyXG4gIFBsYW5lLnByb3RvdHlwZSA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmNyZWF0ZShTaGFwZS5wcm90b3R5cGUpLCB7XHJcblxyXG4gICAgY29uc3RydWN0b3I6IFBsYW5lLFxyXG5cclxuICAgIHZvbHVtZTogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgcmV0dXJuIE51bWJlci5NQVhfVkFMVUU7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBjYWxjdWxhdGVNYXNzSW5mbzogZnVuY3Rpb24gKG91dCkge1xyXG5cclxuICAgICAgb3V0Lm1hc3MgPSB0aGlzLmRlbnNpdHk7Ly8wLjAwMDE7XHJcbiAgICAgIHZhciBpbmVydGlhID0gMTtcclxuICAgICAgb3V0LmluZXJ0aWEuc2V0KGluZXJ0aWEsIDAsIDAsIDAsIGluZXJ0aWEsIDAsIDAsIDAsIGluZXJ0aWEpO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgdXBkYXRlUHJveHk6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgIHZhciBwID0gQUFCQl9QUk9YO1xyXG5cclxuICAgICAgdmFyIG1pbiA9IC1fTWF0aC5JTkY7XHJcbiAgICAgIHZhciBtYXggPSBfTWF0aC5JTkY7XHJcbiAgICAgIHZhciBuID0gdGhpcy5ub3JtYWw7XHJcbiAgICAgIC8vIFRoZSBwbGFuZSBBQUJCIGlzIGluZmluaXRlLCBleGNlcHQgaWYgdGhlIG5vcm1hbCBpcyBwb2ludGluZyBhbG9uZyBhbnkgYXhpc1xyXG4gICAgICB0aGlzLmFhYmIuc2V0KFxyXG4gICAgICAgIG4ueCA9PT0gLTEgPyB0aGlzLnBvc2l0aW9uLnggLSBwIDogbWluLCBuLnggPT09IDEgPyB0aGlzLnBvc2l0aW9uLnggKyBwIDogbWF4LFxyXG4gICAgICAgIG4ueSA9PT0gLTEgPyB0aGlzLnBvc2l0aW9uLnkgLSBwIDogbWluLCBuLnkgPT09IDEgPyB0aGlzLnBvc2l0aW9uLnkgKyBwIDogbWF4LFxyXG4gICAgICAgIG4ueiA9PT0gLTEgPyB0aGlzLnBvc2l0aW9uLnogLSBwIDogbWluLCBuLnogPT09IDEgPyB0aGlzLnBvc2l0aW9uLnogKyBwIDogbWF4XHJcbiAgICAgICk7XHJcblxyXG4gICAgICBpZiAodGhpcy5wcm94eSAhPSBudWxsKSB0aGlzLnByb3h5LnVwZGF0ZSgpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgfSk7XHJcblxyXG4gIC8qKlxyXG4gICAqIEEgUGFydGljdWxlIHNoYXBlXHJcbiAgICogQGF1dGhvciBsby10aFxyXG4gICAqL1xyXG5cclxuICBmdW5jdGlvbiBQYXJ0aWNsZShjb25maWcsIG5vcm1hbCkge1xyXG5cclxuICAgIFNoYXBlLmNhbGwodGhpcywgY29uZmlnKTtcclxuXHJcbiAgICB0aGlzLnR5cGUgPSBTSEFQRV9QQVJUSUNMRTtcclxuXHJcbiAgfVxyXG4gIFBhcnRpY2xlLnByb3RvdHlwZSA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmNyZWF0ZShTaGFwZS5wcm90b3R5cGUpLCB7XHJcblxyXG4gICAgY29uc3RydWN0b3I6IFBhcnRpY2xlLFxyXG5cclxuICAgIHZvbHVtZTogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgcmV0dXJuIE51bWJlci5NQVhfVkFMVUU7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBjYWxjdWxhdGVNYXNzSW5mbzogZnVuY3Rpb24gKG91dCkge1xyXG5cclxuICAgICAgdmFyIGluZXJ0aWEgPSAwO1xyXG4gICAgICBvdXQuaW5lcnRpYS5zZXQoaW5lcnRpYSwgMCwgMCwgMCwgaW5lcnRpYSwgMCwgMCwgMCwgaW5lcnRpYSk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICB1cGRhdGVQcm94eTogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgdmFyIHAgPSAwOy8vQUFCQl9QUk9YO1xyXG5cclxuICAgICAgdGhpcy5hYWJiLnNldChcclxuICAgICAgICB0aGlzLnBvc2l0aW9uLnggLSBwLCB0aGlzLnBvc2l0aW9uLnggKyBwLFxyXG4gICAgICAgIHRoaXMucG9zaXRpb24ueSAtIHAsIHRoaXMucG9zaXRpb24ueSArIHAsXHJcbiAgICAgICAgdGhpcy5wb3NpdGlvbi56IC0gcCwgdGhpcy5wb3NpdGlvbi56ICsgcFxyXG4gICAgICApO1xyXG5cclxuICAgICAgaWYgKHRoaXMucHJveHkgIT0gbnVsbCkgdGhpcy5wcm94eS51cGRhdGUoKTtcclxuXHJcbiAgICB9XHJcblxyXG4gIH0pO1xyXG5cclxuICAvKipcclxuICAgKiBBIHNoYXBlIGNvbmZpZ3VyYXRpb24gaG9sZHMgY29tbW9uIGNvbmZpZ3VyYXRpb24gZGF0YSBmb3IgY29uc3RydWN0aW5nIGEgc2hhcGUuXHJcbiAgICogVGhlc2UgY29uZmlndXJhdGlvbnMgY2FuIGJlIHJldXNlZCBzYWZlbHkuXHJcbiAgICpcclxuICAgKiBAYXV0aG9yIHNhaGFyYW5cclxuICAgKiBAYXV0aG9yIGxvLXRoXHJcbiAgICovXHJcblxyXG4gIGZ1bmN0aW9uIFNoYXBlQ29uZmlnKCkge1xyXG5cclxuICAgIC8vIHBvc2l0aW9uIG9mIHRoZSBzaGFwZSBpbiBwYXJlbnQncyBjb29yZGluYXRlIHN5c3RlbS5cclxuICAgIHRoaXMucmVsYXRpdmVQb3NpdGlvbiA9IG5ldyBWZWMzKCk7XHJcbiAgICAvLyByb3RhdGlvbiBtYXRyaXggb2YgdGhlIHNoYXBlIGluIHBhcmVudCdzIGNvb3JkaW5hdGUgc3lzdGVtLlxyXG4gICAgdGhpcy5yZWxhdGl2ZVJvdGF0aW9uID0gbmV3IE1hdDMzKCk7XHJcbiAgICAvLyBjb2VmZmljaWVudCBvZiBmcmljdGlvbiBvZiB0aGUgc2hhcGUuXHJcbiAgICB0aGlzLmZyaWN0aW9uID0gMC4yOyAvLyAwLjRcclxuICAgIC8vIGNvZWZmaWNpZW50IG9mIHJlc3RpdHV0aW9uIG9mIHRoZSBzaGFwZS5cclxuICAgIHRoaXMucmVzdGl0dXRpb24gPSAwLjI7XHJcbiAgICAvLyBkZW5zaXR5IG9mIHRoZSBzaGFwZS5cclxuICAgIHRoaXMuZGVuc2l0eSA9IDE7XHJcbiAgICAvLyBiaXRzIG9mIHRoZSBjb2xsaXNpb24gZ3JvdXBzIHRvIHdoaWNoIHRoZSBzaGFwZSBiZWxvbmdzLlxyXG4gICAgdGhpcy5iZWxvbmdzVG8gPSAxO1xyXG4gICAgLy8gYml0cyBvZiB0aGUgY29sbGlzaW9uIGdyb3VwcyB3aXRoIHdoaWNoIHRoZSBzaGFwZSBjb2xsaWRlcy5cclxuICAgIHRoaXMuY29sbGlkZXNXaXRoID0gMHhmZmZmZmZmZjtcclxuXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAqIEFuIGluZm9ybWF0aW9uIG9mIGxpbWl0IGFuZCBtb3Rvci5cclxuICAqXHJcbiAgKiBAYXV0aG9yIHNhaGFyYW5cclxuICAqL1xyXG5cclxuICBmdW5jdGlvbiBMaW1pdE1vdG9yKGF4aXMsIGZpeGVkKSB7XHJcblxyXG4gICAgZml4ZWQgPSBmaXhlZCB8fCBmYWxzZTtcclxuICAgIC8vIFRoZSBheGlzIG9mIHRoZSBjb25zdHJhaW50LlxyXG4gICAgdGhpcy5heGlzID0gYXhpcztcclxuICAgIC8vIFRoZSBjdXJyZW50IGFuZ2xlIGZvciByb3RhdGlvbmFsIGNvbnN0cmFpbnRzLlxyXG4gICAgdGhpcy5hbmdsZSA9IDA7XHJcbiAgICAvLyBUaGUgbG93ZXIgbGltaXQuIFNldCBsb3dlciA+IHVwcGVyIHRvIGRpc2FibGVcclxuICAgIHRoaXMubG93ZXJMaW1pdCA9IGZpeGVkID8gMCA6IDE7XHJcblxyXG4gICAgLy8gIFRoZSB1cHBlciBsaW1pdC4gU2V0IGxvd2VyID4gdXBwZXIgdG8gZGlzYWJsZS5cclxuICAgIHRoaXMudXBwZXJMaW1pdCA9IDA7XHJcbiAgICAvLyBUaGUgdGFyZ2V0IG1vdG9yIHNwZWVkLlxyXG4gICAgdGhpcy5tb3RvclNwZWVkID0gMDtcclxuICAgIC8vIFRoZSBtYXhpbXVtIG1vdG9yIGZvcmNlIG9yIHRvcnF1ZS4gU2V0IDAgdG8gZGlzYWJsZS5cclxuICAgIHRoaXMubWF4TW90b3JGb3JjZSA9IDA7XHJcbiAgICAvLyBUaGUgZnJlcXVlbmN5IG9mIHRoZSBzcHJpbmcuIFNldCAwIHRvIGRpc2FibGUuXHJcbiAgICB0aGlzLmZyZXF1ZW5jeSA9IDA7XHJcbiAgICAvLyBUaGUgZGFtcGluZyByYXRpbyBvZiB0aGUgc3ByaW5nLiBTZXQgMCBmb3Igbm8gZGFtcGluZywgMSBmb3IgY3JpdGljYWwgZGFtcGluZy5cclxuICAgIHRoaXMuZGFtcGluZ1JhdGlvID0gMDtcclxuXHJcbiAgfVxyXG4gIE9iamVjdC5hc3NpZ24oTGltaXRNb3Rvci5wcm90b3R5cGUsIHtcclxuXHJcbiAgICBMaW1pdE1vdG9yOiB0cnVlLFxyXG5cclxuICAgIC8vIFNldCBsaW1pdCBkYXRhIGludG8gdGhpcyBjb25zdHJhaW50LlxyXG4gICAgc2V0TGltaXQ6IGZ1bmN0aW9uIChsb3dlckxpbWl0LCB1cHBlckxpbWl0KSB7XHJcblxyXG4gICAgICB0aGlzLmxvd2VyTGltaXQgPSBsb3dlckxpbWl0O1xyXG4gICAgICB0aGlzLnVwcGVyTGltaXQgPSB1cHBlckxpbWl0O1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgLy8gU2V0IG1vdG9yIGRhdGEgaW50byB0aGlzIGNvbnN0cmFpbnQuXHJcbiAgICBzZXRNb3RvcjogZnVuY3Rpb24gKG1vdG9yU3BlZWQsIG1heE1vdG9yRm9yY2UpIHtcclxuXHJcbiAgICAgIHRoaXMubW90b3JTcGVlZCA9IG1vdG9yU3BlZWQ7XHJcbiAgICAgIHRoaXMubWF4TW90b3JGb3JjZSA9IG1heE1vdG9yRm9yY2U7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICAvLyBTZXQgc3ByaW5nIGRhdGEgaW50byB0aGlzIGNvbnN0cmFpbnQuXHJcbiAgICBzZXRTcHJpbmc6IGZ1bmN0aW9uIChmcmVxdWVuY3ksIGRhbXBpbmdSYXRpbykge1xyXG5cclxuICAgICAgdGhpcy5mcmVxdWVuY3kgPSBmcmVxdWVuY3k7XHJcbiAgICAgIHRoaXMuZGFtcGluZ1JhdGlvID0gZGFtcGluZ1JhdGlvO1xyXG5cclxuICAgIH1cclxuXHJcbiAgfSk7XHJcblxyXG4gIC8qKlxyXG4gICAqIFRoZSBiYXNlIGNsYXNzIG9mIGFsbCB0eXBlIG9mIHRoZSBjb25zdHJhaW50cy5cclxuICAgKlxyXG4gICAqIEBhdXRob3Igc2FoYXJhblxyXG4gICAqIEBhdXRob3IgbG8tdGhcclxuICAgKi9cclxuXHJcbiAgZnVuY3Rpb24gQ29uc3RyYWludCgpIHtcclxuXHJcbiAgICAvLyBwYXJlbnQgd29ybGQgb2YgdGhlIGNvbnN0cmFpbnQuXHJcbiAgICB0aGlzLnBhcmVudCA9IG51bGw7XHJcblxyXG4gICAgLy8gZmlyc3QgYm9keSBvZiB0aGUgY29uc3RyYWludC5cclxuICAgIHRoaXMuYm9keTEgPSBudWxsO1xyXG5cclxuICAgIC8vIHNlY29uZCBib2R5IG9mIHRoZSBjb25zdHJhaW50LlxyXG4gICAgdGhpcy5ib2R5MiA9IG51bGw7XHJcblxyXG4gICAgLy8gSW50ZXJuYWxcclxuICAgIHRoaXMuYWRkZWRUb0lzbGFuZCA9IGZhbHNlO1xyXG5cclxuICB9XHJcblxyXG4gIE9iamVjdC5hc3NpZ24oQ29uc3RyYWludC5wcm90b3R5cGUsIHtcclxuXHJcbiAgICBDb25zdHJhaW50OiB0cnVlLFxyXG5cclxuICAgIC8vIFByZXBhcmUgZm9yIHNvbHZpbmcgdGhlIGNvbnN0cmFpbnRcclxuICAgIHByZVNvbHZlOiBmdW5jdGlvbiAodGltZVN0ZXAsIGludlRpbWVTdGVwKSB7XHJcblxyXG4gICAgICBwcmludEVycm9yKFwiQ29uc3RyYWludFwiLCBcIkluaGVyaXRhbmNlIGVycm9yLlwiKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIFNvbHZlIHRoZSBjb25zdHJhaW50LiBUaGlzIGlzIHVzdWFsbHkgY2FsbGVkIGl0ZXJhdGl2ZWx5LlxyXG4gICAgc29sdmU6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgIHByaW50RXJyb3IoXCJDb25zdHJhaW50XCIsIFwiSW5oZXJpdGFuY2UgZXJyb3IuXCIpO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgLy8gRG8gdGhlIHBvc3QtcHJvY2Vzc2luZy5cclxuICAgIHBvc3RTb2x2ZTogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgcHJpbnRFcnJvcihcIkNvbnN0cmFpbnRcIiwgXCJJbmhlcml0YW5jZSBlcnJvci5cIik7XHJcblxyXG4gICAgfVxyXG5cclxuICB9KTtcclxuXHJcbiAgZnVuY3Rpb24gSm9pbnRMaW5rKGpvaW50KSB7XHJcblxyXG4gICAgLy8gVGhlIHByZXZpb3VzIGpvaW50IGxpbmsuXHJcbiAgICB0aGlzLnByZXYgPSBudWxsO1xyXG4gICAgLy8gVGhlIG5leHQgam9pbnQgbGluay5cclxuICAgIHRoaXMubmV4dCA9IG51bGw7XHJcbiAgICAvLyBUaGUgb3RoZXIgcmlnaWQgYm9keSBjb25uZWN0ZWQgdG8gdGhlIGpvaW50LlxyXG4gICAgdGhpcy5ib2R5ID0gbnVsbDtcclxuICAgIC8vIFRoZSBqb2ludCBvZiB0aGUgbGluay5cclxuICAgIHRoaXMuam9pbnQgPSBqb2ludDtcclxuXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBKb2ludHMgYXJlIHVzZWQgdG8gY29uc3RyYWluIHRoZSBtb3Rpb24gYmV0d2VlbiB0d28gcmlnaWQgYm9kaWVzLlxyXG4gICAqXHJcbiAgICogQGF1dGhvciBzYWhhcmFuXHJcbiAgICogQGF1dGhvciBsby10aFxyXG4gICAqL1xyXG5cclxuICBmdW5jdGlvbiBKb2ludChjb25maWcpIHtcclxuXHJcbiAgICBDb25zdHJhaW50LmNhbGwodGhpcyk7XHJcblxyXG4gICAgdGhpcy5zY2FsZSA9IDE7XHJcbiAgICB0aGlzLmludlNjYWxlID0gMTtcclxuXHJcbiAgICAvLyBqb2ludCBuYW1lXHJcbiAgICB0aGlzLm5hbWUgPSBcIlwiO1xyXG4gICAgdGhpcy5pZCA9IE5hTjtcclxuXHJcbiAgICAvLyBUaGUgdHlwZSBvZiB0aGUgam9pbnQuXHJcbiAgICB0aGlzLnR5cGUgPSBKT0lOVF9OVUxMO1xyXG4gICAgLy8gIFRoZSBwcmV2aW91cyBqb2ludCBpbiB0aGUgd29ybGQuXHJcbiAgICB0aGlzLnByZXYgPSBudWxsO1xyXG4gICAgLy8gVGhlIG5leHQgam9pbnQgaW4gdGhlIHdvcmxkLlxyXG4gICAgdGhpcy5uZXh0ID0gbnVsbDtcclxuXHJcbiAgICB0aGlzLmJvZHkxID0gY29uZmlnLmJvZHkxO1xyXG4gICAgdGhpcy5ib2R5MiA9IGNvbmZpZy5ib2R5MjtcclxuXHJcbiAgICAvLyBhbmNob3IgcG9pbnQgb24gdGhlIGZpcnN0IHJpZ2lkIGJvZHkgaW4gbG9jYWwgY29vcmRpbmF0ZSBzeXN0ZW0uXHJcbiAgICB0aGlzLmxvY2FsQW5jaG9yUG9pbnQxID0gbmV3IFZlYzMoKS5jb3B5KGNvbmZpZy5sb2NhbEFuY2hvclBvaW50MSk7XHJcbiAgICAvLyBhbmNob3IgcG9pbnQgb24gdGhlIHNlY29uZCByaWdpZCBib2R5IGluIGxvY2FsIGNvb3JkaW5hdGUgc3lzdGVtLlxyXG4gICAgdGhpcy5sb2NhbEFuY2hvclBvaW50MiA9IG5ldyBWZWMzKCkuY29weShjb25maWcubG9jYWxBbmNob3JQb2ludDIpO1xyXG4gICAgLy8gYW5jaG9yIHBvaW50IG9uIHRoZSBmaXJzdCByaWdpZCBib2R5IGluIHdvcmxkIGNvb3JkaW5hdGUgc3lzdGVtIHJlbGF0aXZlIHRvIHRoZSBib2R5J3Mgb3JpZ2luLlxyXG4gICAgdGhpcy5yZWxhdGl2ZUFuY2hvclBvaW50MSA9IG5ldyBWZWMzKCk7XHJcbiAgICAvLyBhbmNob3IgcG9pbnQgb24gdGhlIHNlY29uZCByaWdpZCBib2R5IGluIHdvcmxkIGNvb3JkaW5hdGUgc3lzdGVtIHJlbGF0aXZlIHRvIHRoZSBib2R5J3Mgb3JpZ2luLlxyXG4gICAgdGhpcy5yZWxhdGl2ZUFuY2hvclBvaW50MiA9IG5ldyBWZWMzKCk7XHJcbiAgICAvLyAgYW5jaG9yIHBvaW50IG9uIHRoZSBmaXJzdCByaWdpZCBib2R5IGluIHdvcmxkIGNvb3JkaW5hdGUgc3lzdGVtLlxyXG4gICAgdGhpcy5hbmNob3JQb2ludDEgPSBuZXcgVmVjMygpO1xyXG4gICAgLy8gYW5jaG9yIHBvaW50IG9uIHRoZSBzZWNvbmQgcmlnaWQgYm9keSBpbiB3b3JsZCBjb29yZGluYXRlIHN5c3RlbS5cclxuICAgIHRoaXMuYW5jaG9yUG9pbnQyID0gbmV3IFZlYzMoKTtcclxuICAgIC8vIFdoZXRoZXIgYWxsb3cgY29sbGlzaW9uIGJldHdlZW4gY29ubmVjdGVkIHJpZ2lkIGJvZGllcyBvciBub3QuXHJcbiAgICB0aGlzLmFsbG93Q29sbGlzaW9uID0gY29uZmlnLmFsbG93Q29sbGlzaW9uO1xyXG5cclxuICAgIHRoaXMuYjFMaW5rID0gbmV3IEpvaW50TGluayh0aGlzKTtcclxuICAgIHRoaXMuYjJMaW5rID0gbmV3IEpvaW50TGluayh0aGlzKTtcclxuXHJcbiAgfVxyXG4gIEpvaW50LnByb3RvdHlwZSA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmNyZWF0ZShDb25zdHJhaW50LnByb3RvdHlwZSksIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcjogSm9pbnQsXHJcblxyXG4gICAgc2V0SWQ6IGZ1bmN0aW9uIChuKSB7XHJcblxyXG4gICAgICB0aGlzLmlkID0gaTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHNldFBhcmVudDogZnVuY3Rpb24gKHdvcmxkKSB7XHJcblxyXG4gICAgICB0aGlzLnBhcmVudCA9IHdvcmxkO1xyXG4gICAgICB0aGlzLnNjYWxlID0gdGhpcy5wYXJlbnQuc2NhbGU7XHJcbiAgICAgIHRoaXMuaW52U2NhbGUgPSB0aGlzLnBhcmVudC5pbnZTY2FsZTtcclxuICAgICAgdGhpcy5pZCA9IHRoaXMucGFyZW50Lm51bUpvaW50cztcclxuICAgICAgaWYgKCF0aGlzLm5hbWUpIHRoaXMubmFtZSA9ICdKJyArIHRoaXMuaWQ7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICAvLyBVcGRhdGUgYWxsIHRoZSBhbmNob3IgcG9pbnRzLlxyXG5cclxuICAgIHVwZGF0ZUFuY2hvclBvaW50czogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgdGhpcy5yZWxhdGl2ZUFuY2hvclBvaW50MS5jb3B5KHRoaXMubG9jYWxBbmNob3JQb2ludDEpLmFwcGx5TWF0cml4Myh0aGlzLmJvZHkxLnJvdGF0aW9uLCB0cnVlKTtcclxuICAgICAgdGhpcy5yZWxhdGl2ZUFuY2hvclBvaW50Mi5jb3B5KHRoaXMubG9jYWxBbmNob3JQb2ludDIpLmFwcGx5TWF0cml4Myh0aGlzLmJvZHkyLnJvdGF0aW9uLCB0cnVlKTtcclxuXHJcbiAgICAgIHRoaXMuYW5jaG9yUG9pbnQxLmFkZCh0aGlzLnJlbGF0aXZlQW5jaG9yUG9pbnQxLCB0aGlzLmJvZHkxLnBvc2l0aW9uKTtcclxuICAgICAgdGhpcy5hbmNob3JQb2ludDIuYWRkKHRoaXMucmVsYXRpdmVBbmNob3JQb2ludDIsIHRoaXMuYm9keTIucG9zaXRpb24pO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgLy8gQXR0YWNoIHRoZSBqb2ludCBmcm9tIHRoZSBib2RpZXMuXHJcblxyXG4gICAgYXR0YWNoOiBmdW5jdGlvbiAoaXNYKSB7XHJcblxyXG4gICAgICB0aGlzLmIxTGluay5ib2R5ID0gdGhpcy5ib2R5MjtcclxuICAgICAgdGhpcy5iMkxpbmsuYm9keSA9IHRoaXMuYm9keTE7XHJcblxyXG4gICAgICBpZiAoaXNYKSB7XHJcblxyXG4gICAgICAgIHRoaXMuYm9keTEuam9pbnRMaW5rLnB1c2godGhpcy5iMUxpbmspO1xyXG4gICAgICAgIHRoaXMuYm9keTIuam9pbnRMaW5rLnB1c2godGhpcy5iMkxpbmspO1xyXG4gICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICBpZiAodGhpcy5ib2R5MS5qb2ludExpbmsgIT0gbnVsbCkgKHRoaXMuYjFMaW5rLm5leHQgPSB0aGlzLmJvZHkxLmpvaW50TGluaykucHJldiA9IHRoaXMuYjFMaW5rO1xyXG4gICAgICAgIGVsc2UgdGhpcy5iMUxpbmsubmV4dCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5ib2R5MS5qb2ludExpbmsgPSB0aGlzLmIxTGluaztcclxuICAgICAgICB0aGlzLmJvZHkxLm51bUpvaW50cysrO1xyXG4gICAgICAgIGlmICh0aGlzLmJvZHkyLmpvaW50TGluayAhPSBudWxsKSAodGhpcy5iMkxpbmsubmV4dCA9IHRoaXMuYm9keTIuam9pbnRMaW5rKS5wcmV2ID0gdGhpcy5iMkxpbms7XHJcbiAgICAgICAgZWxzZSB0aGlzLmIyTGluay5uZXh0ID0gbnVsbDtcclxuICAgICAgICB0aGlzLmJvZHkyLmpvaW50TGluayA9IHRoaXMuYjJMaW5rO1xyXG4gICAgICAgIHRoaXMuYm9keTIubnVtSm9pbnRzKys7XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICAvLyBEZXRhY2ggdGhlIGpvaW50IGZyb20gdGhlIGJvZGllcy5cclxuXHJcbiAgICBkZXRhY2g6IGZ1bmN0aW9uIChpc1gpIHtcclxuXHJcbiAgICAgIGlmIChpc1gpIHtcclxuXHJcbiAgICAgICAgdGhpcy5ib2R5MS5qb2ludExpbmsuc3BsaWNlKHRoaXMuYm9keTEuam9pbnRMaW5rLmluZGV4T2YodGhpcy5iMUxpbmspLCAxKTtcclxuICAgICAgICB0aGlzLmJvZHkyLmpvaW50TGluay5zcGxpY2UodGhpcy5ib2R5Mi5qb2ludExpbmsuaW5kZXhPZih0aGlzLmIyTGluayksIDEpO1xyXG5cclxuICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgdmFyIHByZXYgPSB0aGlzLmIxTGluay5wcmV2O1xyXG4gICAgICAgIHZhciBuZXh0ID0gdGhpcy5iMUxpbmsubmV4dDtcclxuICAgICAgICBpZiAocHJldiAhPSBudWxsKSBwcmV2Lm5leHQgPSBuZXh0O1xyXG4gICAgICAgIGlmIChuZXh0ICE9IG51bGwpIG5leHQucHJldiA9IHByZXY7XHJcbiAgICAgICAgaWYgKHRoaXMuYm9keTEuam9pbnRMaW5rID09IHRoaXMuYjFMaW5rKSB0aGlzLmJvZHkxLmpvaW50TGluayA9IG5leHQ7XHJcbiAgICAgICAgdGhpcy5iMUxpbmsucHJldiA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5iMUxpbmsubmV4dCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5iMUxpbmsuYm9keSA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5ib2R5MS5udW1Kb2ludHMtLTtcclxuXHJcbiAgICAgICAgcHJldiA9IHRoaXMuYjJMaW5rLnByZXY7XHJcbiAgICAgICAgbmV4dCA9IHRoaXMuYjJMaW5rLm5leHQ7XHJcbiAgICAgICAgaWYgKHByZXYgIT0gbnVsbCkgcHJldi5uZXh0ID0gbmV4dDtcclxuICAgICAgICBpZiAobmV4dCAhPSBudWxsKSBuZXh0LnByZXYgPSBwcmV2O1xyXG4gICAgICAgIGlmICh0aGlzLmJvZHkyLmpvaW50TGluayA9PSB0aGlzLmIyTGluaykgdGhpcy5ib2R5Mi5qb2ludExpbmsgPSBuZXh0O1xyXG4gICAgICAgIHRoaXMuYjJMaW5rLnByZXYgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuYjJMaW5rLm5leHQgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuYjJMaW5rLmJvZHkgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuYm9keTIubnVtSm9pbnRzLS07XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLmIxTGluay5ib2R5ID0gbnVsbDtcclxuICAgICAgdGhpcy5iMkxpbmsuYm9keSA9IG51bGw7XHJcblxyXG4gICAgfSxcclxuXHJcblxyXG4gICAgLy8gQXdha2UgdGhlIGJvZGllcy5cclxuXHJcbiAgICBhd2FrZTogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgdGhpcy5ib2R5MS5hd2FrZSgpO1xyXG4gICAgICB0aGlzLmJvZHkyLmF3YWtlKCk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICAvLyBjYWxjdWxhdGlvbiBmdW5jdGlvblxyXG5cclxuICAgIHByZVNvbHZlOiBmdW5jdGlvbiAodGltZVN0ZXAsIGludlRpbWVTdGVwKSB7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBzb2x2ZTogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgcG9zdFNvbHZlOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICAvLyBEZWxldGUgcHJvY2Vzc1xyXG5cclxuICAgIHJlbW92ZTogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgdGhpcy5kaXNwb3NlKCk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBkaXNwb3NlOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICB0aGlzLnBhcmVudC5yZW1vdmVKb2ludCh0aGlzKTtcclxuXHJcbiAgICB9LFxyXG5cclxuXHJcbiAgICAvLyBUaHJlZSBqcyBhZGRcclxuXHJcbiAgICBnZXRQb3NpdGlvbjogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgdmFyIHAxID0gbmV3IFZlYzMoKS5zY2FsZSh0aGlzLmFuY2hvclBvaW50MSwgdGhpcy5zY2FsZSk7XHJcbiAgICAgIHZhciBwMiA9IG5ldyBWZWMzKCkuc2NhbGUodGhpcy5hbmNob3JQb2ludDIsIHRoaXMuc2NhbGUpO1xyXG4gICAgICByZXR1cm4gW3AxLCBwMl07XHJcblxyXG4gICAgfVxyXG5cclxuICB9KTtcclxuXHJcbiAgLyoqXHJcbiAgKiBBIGxpbmVhciBjb25zdHJhaW50IGZvciBhbGwgYXhlcyBmb3IgdmFyaW91cyBqb2ludHMuXHJcbiAgKiBAYXV0aG9yIHNhaGFyYW5cclxuICAqL1xyXG4gIGZ1bmN0aW9uIExpbmVhckNvbnN0cmFpbnQoam9pbnQpIHtcclxuXHJcbiAgICB0aGlzLm0xID0gTmFOO1xyXG4gICAgdGhpcy5tMiA9IE5hTjtcclxuXHJcbiAgICB0aGlzLmlpMSA9IG51bGw7XHJcbiAgICB0aGlzLmlpMiA9IG51bGw7XHJcbiAgICB0aGlzLmRkID0gbnVsbDtcclxuXHJcbiAgICB0aGlzLnIxeCA9IE5hTjtcclxuICAgIHRoaXMucjF5ID0gTmFOO1xyXG4gICAgdGhpcy5yMXogPSBOYU47XHJcblxyXG4gICAgdGhpcy5yMnggPSBOYU47XHJcbiAgICB0aGlzLnIyeSA9IE5hTjtcclxuICAgIHRoaXMucjJ6ID0gTmFOO1xyXG5cclxuICAgIHRoaXMuYXgxeCA9IE5hTjtcclxuICAgIHRoaXMuYXgxeSA9IE5hTjtcclxuICAgIHRoaXMuYXgxeiA9IE5hTjtcclxuICAgIHRoaXMuYXkxeCA9IE5hTjtcclxuICAgIHRoaXMuYXkxeSA9IE5hTjtcclxuICAgIHRoaXMuYXkxeiA9IE5hTjtcclxuICAgIHRoaXMuYXoxeCA9IE5hTjtcclxuICAgIHRoaXMuYXoxeSA9IE5hTjtcclxuICAgIHRoaXMuYXoxeiA9IE5hTjtcclxuXHJcbiAgICB0aGlzLmF4MnggPSBOYU47XHJcbiAgICB0aGlzLmF4MnkgPSBOYU47XHJcbiAgICB0aGlzLmF4MnogPSBOYU47XHJcbiAgICB0aGlzLmF5MnggPSBOYU47XHJcbiAgICB0aGlzLmF5MnkgPSBOYU47XHJcbiAgICB0aGlzLmF5MnogPSBOYU47XHJcbiAgICB0aGlzLmF6MnggPSBOYU47XHJcbiAgICB0aGlzLmF6MnkgPSBOYU47XHJcbiAgICB0aGlzLmF6MnogPSBOYU47XHJcblxyXG4gICAgdGhpcy52ZWwgPSBOYU47XHJcbiAgICB0aGlzLnZlbHggPSBOYU47XHJcbiAgICB0aGlzLnZlbHkgPSBOYU47XHJcbiAgICB0aGlzLnZlbHogPSBOYU47XHJcblxyXG5cclxuICAgIHRoaXMuam9pbnQgPSBqb2ludDtcclxuICAgIHRoaXMucjEgPSBqb2ludC5yZWxhdGl2ZUFuY2hvclBvaW50MTtcclxuICAgIHRoaXMucjIgPSBqb2ludC5yZWxhdGl2ZUFuY2hvclBvaW50MjtcclxuICAgIHRoaXMucDEgPSBqb2ludC5hbmNob3JQb2ludDE7XHJcbiAgICB0aGlzLnAyID0gam9pbnQuYW5jaG9yUG9pbnQyO1xyXG4gICAgdGhpcy5iMSA9IGpvaW50LmJvZHkxO1xyXG4gICAgdGhpcy5iMiA9IGpvaW50LmJvZHkyO1xyXG4gICAgdGhpcy5sMSA9IHRoaXMuYjEubGluZWFyVmVsb2NpdHk7XHJcbiAgICB0aGlzLmwyID0gdGhpcy5iMi5saW5lYXJWZWxvY2l0eTtcclxuICAgIHRoaXMuYTEgPSB0aGlzLmIxLmFuZ3VsYXJWZWxvY2l0eTtcclxuICAgIHRoaXMuYTIgPSB0aGlzLmIyLmFuZ3VsYXJWZWxvY2l0eTtcclxuICAgIHRoaXMuaTEgPSB0aGlzLmIxLmludmVyc2VJbmVydGlhO1xyXG4gICAgdGhpcy5pMiA9IHRoaXMuYjIuaW52ZXJzZUluZXJ0aWE7XHJcbiAgICB0aGlzLmltcHggPSAwO1xyXG4gICAgdGhpcy5pbXB5ID0gMDtcclxuICAgIHRoaXMuaW1weiA9IDA7XHJcblxyXG4gIH1cclxuXHJcbiAgT2JqZWN0LmFzc2lnbihMaW5lYXJDb25zdHJhaW50LnByb3RvdHlwZSwge1xyXG5cclxuICAgIExpbmVhckNvbnN0cmFpbnQ6IHRydWUsXHJcblxyXG4gICAgcHJlU29sdmU6IGZ1bmN0aW9uICh0aW1lU3RlcCwgaW52VGltZVN0ZXApIHtcclxuXHJcbiAgICAgIHRoaXMucjF4ID0gdGhpcy5yMS54O1xyXG4gICAgICB0aGlzLnIxeSA9IHRoaXMucjEueTtcclxuICAgICAgdGhpcy5yMXogPSB0aGlzLnIxLno7XHJcblxyXG4gICAgICB0aGlzLnIyeCA9IHRoaXMucjIueDtcclxuICAgICAgdGhpcy5yMnkgPSB0aGlzLnIyLnk7XHJcbiAgICAgIHRoaXMucjJ6ID0gdGhpcy5yMi56O1xyXG5cclxuICAgICAgdGhpcy5tMSA9IHRoaXMuYjEuaW52ZXJzZU1hc3M7XHJcbiAgICAgIHRoaXMubTIgPSB0aGlzLmIyLmludmVyc2VNYXNzO1xyXG5cclxuICAgICAgdGhpcy5paTEgPSB0aGlzLmkxLmNsb25lKCk7XHJcbiAgICAgIHRoaXMuaWkyID0gdGhpcy5pMi5jbG9uZSgpO1xyXG5cclxuICAgICAgdmFyIGlpMSA9IHRoaXMuaWkxLmVsZW1lbnRzO1xyXG4gICAgICB2YXIgaWkyID0gdGhpcy5paTIuZWxlbWVudHM7XHJcblxyXG4gICAgICB0aGlzLmF4MXggPSB0aGlzLnIxeiAqIGlpMVsxXSArIC10aGlzLnIxeSAqIGlpMVsyXTtcclxuICAgICAgdGhpcy5heDF5ID0gdGhpcy5yMXogKiBpaTFbNF0gKyAtdGhpcy5yMXkgKiBpaTFbNV07XHJcbiAgICAgIHRoaXMuYXgxeiA9IHRoaXMucjF6ICogaWkxWzddICsgLXRoaXMucjF5ICogaWkxWzhdO1xyXG4gICAgICB0aGlzLmF5MXggPSAtdGhpcy5yMXogKiBpaTFbMF0gKyB0aGlzLnIxeCAqIGlpMVsyXTtcclxuICAgICAgdGhpcy5heTF5ID0gLXRoaXMucjF6ICogaWkxWzNdICsgdGhpcy5yMXggKiBpaTFbNV07XHJcbiAgICAgIHRoaXMuYXkxeiA9IC10aGlzLnIxeiAqIGlpMVs2XSArIHRoaXMucjF4ICogaWkxWzhdO1xyXG4gICAgICB0aGlzLmF6MXggPSB0aGlzLnIxeSAqIGlpMVswXSArIC10aGlzLnIxeCAqIGlpMVsxXTtcclxuICAgICAgdGhpcy5hejF5ID0gdGhpcy5yMXkgKiBpaTFbM10gKyAtdGhpcy5yMXggKiBpaTFbNF07XHJcbiAgICAgIHRoaXMuYXoxeiA9IHRoaXMucjF5ICogaWkxWzZdICsgLXRoaXMucjF4ICogaWkxWzddO1xyXG4gICAgICB0aGlzLmF4MnggPSB0aGlzLnIyeiAqIGlpMlsxXSArIC10aGlzLnIyeSAqIGlpMlsyXTtcclxuICAgICAgdGhpcy5heDJ5ID0gdGhpcy5yMnogKiBpaTJbNF0gKyAtdGhpcy5yMnkgKiBpaTJbNV07XHJcbiAgICAgIHRoaXMuYXgyeiA9IHRoaXMucjJ6ICogaWkyWzddICsgLXRoaXMucjJ5ICogaWkyWzhdO1xyXG4gICAgICB0aGlzLmF5MnggPSAtdGhpcy5yMnogKiBpaTJbMF0gKyB0aGlzLnIyeCAqIGlpMlsyXTtcclxuICAgICAgdGhpcy5heTJ5ID0gLXRoaXMucjJ6ICogaWkyWzNdICsgdGhpcy5yMnggKiBpaTJbNV07XHJcbiAgICAgIHRoaXMuYXkyeiA9IC10aGlzLnIyeiAqIGlpMls2XSArIHRoaXMucjJ4ICogaWkyWzhdO1xyXG4gICAgICB0aGlzLmF6MnggPSB0aGlzLnIyeSAqIGlpMlswXSArIC10aGlzLnIyeCAqIGlpMlsxXTtcclxuICAgICAgdGhpcy5hejJ5ID0gdGhpcy5yMnkgKiBpaTJbM10gKyAtdGhpcy5yMnggKiBpaTJbNF07XHJcbiAgICAgIHRoaXMuYXoyeiA9IHRoaXMucjJ5ICogaWkyWzZdICsgLXRoaXMucjJ4ICogaWkyWzddO1xyXG5cclxuICAgICAgLy8gY2FsY3VsYXRlIHBvaW50LXRvLXBvaW50IG1hc3MgbWF0cml4XHJcbiAgICAgIC8vIGZyb20gaW1wdWxzZSBlcXVhdGlvblxyXG4gICAgICAvLyBcclxuICAgICAgLy8gTSA9IChbL21dIC0gW3JeXVsvSV1bcl5dKSBeIC0xXHJcbiAgICAgIC8vIFxyXG4gICAgICAvLyB3aGVyZVxyXG4gICAgICAvLyBcclxuICAgICAgLy8gWy9tXSA9IHwxL20sIDAsIDB8XHJcbiAgICAgIC8vICAgICAgICB8MCwgMS9tLCAwfFxyXG4gICAgICAvLyAgICAgICAgfDAsIDAsIDEvbXxcclxuICAgICAgLy8gXHJcbiAgICAgIC8vIFtyXl0gPSB8MCwgLXJ6LCByeXxcclxuICAgICAgLy8gICAgICAgIHxyeiwgMCwgLXJ4fFxyXG4gICAgICAvLyAgICAgICAgfC1yeSwgcngsIDB8XHJcbiAgICAgIC8vIFxyXG4gICAgICAvLyBbL0ldID0gSW52ZXJ0ZWQgbW9tZW50IGluZXJ0aWFcclxuXHJcbiAgICAgIHZhciByeHggPSB0aGlzLm0xICsgdGhpcy5tMjtcclxuXHJcbiAgICAgIHZhciBrayA9IG5ldyBNYXQzMygpLnNldChyeHgsIDAsIDAsIDAsIHJ4eCwgMCwgMCwgMCwgcnh4KTtcclxuICAgICAgdmFyIGsgPSBray5lbGVtZW50cztcclxuXHJcbiAgICAgIGtbMF0gKz0gaWkxWzRdICogdGhpcy5yMXogKiB0aGlzLnIxeiAtIChpaTFbN10gKyBpaTFbNV0pICogdGhpcy5yMXkgKiB0aGlzLnIxeiArIGlpMVs4XSAqIHRoaXMucjF5ICogdGhpcy5yMXk7XHJcbiAgICAgIGtbMV0gKz0gKGlpMVs2XSAqIHRoaXMucjF5ICsgaWkxWzVdICogdGhpcy5yMXgpICogdGhpcy5yMXogLSBpaTFbM10gKiB0aGlzLnIxeiAqIHRoaXMucjF6IC0gaWkxWzhdICogdGhpcy5yMXggKiB0aGlzLnIxeTtcclxuICAgICAga1syXSArPSAoaWkxWzNdICogdGhpcy5yMXkgLSBpaTFbNF0gKiB0aGlzLnIxeCkgKiB0aGlzLnIxeiAtIGlpMVs2XSAqIHRoaXMucjF5ICogdGhpcy5yMXkgKyBpaTFbN10gKiB0aGlzLnIxeCAqIHRoaXMucjF5O1xyXG4gICAgICBrWzNdICs9IChpaTFbMl0gKiB0aGlzLnIxeSArIGlpMVs3XSAqIHRoaXMucjF4KSAqIHRoaXMucjF6IC0gaWkxWzFdICogdGhpcy5yMXogKiB0aGlzLnIxeiAtIGlpMVs4XSAqIHRoaXMucjF4ICogdGhpcy5yMXk7XHJcbiAgICAgIGtbNF0gKz0gaWkxWzBdICogdGhpcy5yMXogKiB0aGlzLnIxeiAtIChpaTFbNl0gKyBpaTFbMl0pICogdGhpcy5yMXggKiB0aGlzLnIxeiArIGlpMVs4XSAqIHRoaXMucjF4ICogdGhpcy5yMXg7XHJcbiAgICAgIGtbNV0gKz0gKGlpMVsxXSAqIHRoaXMucjF4IC0gaWkxWzBdICogdGhpcy5yMXkpICogdGhpcy5yMXogLSBpaTFbN10gKiB0aGlzLnIxeCAqIHRoaXMucjF4ICsgaWkxWzZdICogdGhpcy5yMXggKiB0aGlzLnIxeTtcclxuICAgICAga1s2XSArPSAoaWkxWzFdICogdGhpcy5yMXkgLSBpaTFbNF0gKiB0aGlzLnIxeCkgKiB0aGlzLnIxeiAtIGlpMVsyXSAqIHRoaXMucjF5ICogdGhpcy5yMXkgKyBpaTFbNV0gKiB0aGlzLnIxeCAqIHRoaXMucjF5O1xyXG4gICAgICBrWzddICs9IChpaTFbM10gKiB0aGlzLnIxeCAtIGlpMVswXSAqIHRoaXMucjF5KSAqIHRoaXMucjF6IC0gaWkxWzVdICogdGhpcy5yMXggKiB0aGlzLnIxeCArIGlpMVsyXSAqIHRoaXMucjF4ICogdGhpcy5yMXk7XHJcbiAgICAgIGtbOF0gKz0gaWkxWzBdICogdGhpcy5yMXkgKiB0aGlzLnIxeSAtIChpaTFbM10gKyBpaTFbMV0pICogdGhpcy5yMXggKiB0aGlzLnIxeSArIGlpMVs0XSAqIHRoaXMucjF4ICogdGhpcy5yMXg7XHJcblxyXG4gICAgICBrWzBdICs9IGlpMls0XSAqIHRoaXMucjJ6ICogdGhpcy5yMnogLSAoaWkyWzddICsgaWkyWzVdKSAqIHRoaXMucjJ5ICogdGhpcy5yMnogKyBpaTJbOF0gKiB0aGlzLnIyeSAqIHRoaXMucjJ5O1xyXG4gICAgICBrWzFdICs9IChpaTJbNl0gKiB0aGlzLnIyeSArIGlpMls1XSAqIHRoaXMucjJ4KSAqIHRoaXMucjJ6IC0gaWkyWzNdICogdGhpcy5yMnogKiB0aGlzLnIyeiAtIGlpMls4XSAqIHRoaXMucjJ4ICogdGhpcy5yMnk7XHJcbiAgICAgIGtbMl0gKz0gKGlpMlszXSAqIHRoaXMucjJ5IC0gaWkyWzRdICogdGhpcy5yMngpICogdGhpcy5yMnogLSBpaTJbNl0gKiB0aGlzLnIyeSAqIHRoaXMucjJ5ICsgaWkyWzddICogdGhpcy5yMnggKiB0aGlzLnIyeTtcclxuICAgICAga1szXSArPSAoaWkyWzJdICogdGhpcy5yMnkgKyBpaTJbN10gKiB0aGlzLnIyeCkgKiB0aGlzLnIyeiAtIGlpMlsxXSAqIHRoaXMucjJ6ICogdGhpcy5yMnogLSBpaTJbOF0gKiB0aGlzLnIyeCAqIHRoaXMucjJ5O1xyXG4gICAgICBrWzRdICs9IGlpMlswXSAqIHRoaXMucjJ6ICogdGhpcy5yMnogLSAoaWkyWzZdICsgaWkyWzJdKSAqIHRoaXMucjJ4ICogdGhpcy5yMnogKyBpaTJbOF0gKiB0aGlzLnIyeCAqIHRoaXMucjJ4O1xyXG4gICAgICBrWzVdICs9IChpaTJbMV0gKiB0aGlzLnIyeCAtIGlpMlswXSAqIHRoaXMucjJ5KSAqIHRoaXMucjJ6IC0gaWkyWzddICogdGhpcy5yMnggKiB0aGlzLnIyeCArIGlpMls2XSAqIHRoaXMucjJ4ICogdGhpcy5yMnk7XHJcbiAgICAgIGtbNl0gKz0gKGlpMlsxXSAqIHRoaXMucjJ5IC0gaWkyWzRdICogdGhpcy5yMngpICogdGhpcy5yMnogLSBpaTJbMl0gKiB0aGlzLnIyeSAqIHRoaXMucjJ5ICsgaWkyWzVdICogdGhpcy5yMnggKiB0aGlzLnIyeTtcclxuICAgICAga1s3XSArPSAoaWkyWzNdICogdGhpcy5yMnggLSBpaTJbMF0gKiB0aGlzLnIyeSkgKiB0aGlzLnIyeiAtIGlpMls1XSAqIHRoaXMucjJ4ICogdGhpcy5yMnggKyBpaTJbMl0gKiB0aGlzLnIyeCAqIHRoaXMucjJ5O1xyXG4gICAgICBrWzhdICs9IGlpMlswXSAqIHRoaXMucjJ5ICogdGhpcy5yMnkgLSAoaWkyWzNdICsgaWkyWzFdKSAqIHRoaXMucjJ4ICogdGhpcy5yMnkgKyBpaTJbNF0gKiB0aGlzLnIyeCAqIHRoaXMucjJ4O1xyXG5cclxuICAgICAgdmFyIGludiA9IDEgLyAoa1swXSAqIChrWzRdICoga1s4XSAtIGtbN10gKiBrWzVdKSArIGtbM10gKiAoa1s3XSAqIGtbMl0gLSBrWzFdICoga1s4XSkgKyBrWzZdICogKGtbMV0gKiBrWzVdIC0ga1s0XSAqIGtbMl0pKTtcclxuICAgICAgdGhpcy5kZCA9IG5ldyBNYXQzMygpLnNldChcclxuICAgICAgICBrWzRdICoga1s4XSAtIGtbNV0gKiBrWzddLCBrWzJdICoga1s3XSAtIGtbMV0gKiBrWzhdLCBrWzFdICoga1s1XSAtIGtbMl0gKiBrWzRdLFxyXG4gICAgICAgIGtbNV0gKiBrWzZdIC0ga1szXSAqIGtbOF0sIGtbMF0gKiBrWzhdIC0ga1syXSAqIGtbNl0sIGtbMl0gKiBrWzNdIC0ga1swXSAqIGtbNV0sXHJcbiAgICAgICAga1szXSAqIGtbN10gLSBrWzRdICoga1s2XSwga1sxXSAqIGtbNl0gLSBrWzBdICoga1s3XSwga1swXSAqIGtbNF0gLSBrWzFdICoga1szXVxyXG4gICAgICApLnNjYWxlRXF1YWwoaW52KTtcclxuXHJcbiAgICAgIHRoaXMudmVseCA9IHRoaXMucDIueCAtIHRoaXMucDEueDtcclxuICAgICAgdGhpcy52ZWx5ID0gdGhpcy5wMi55IC0gdGhpcy5wMS55O1xyXG4gICAgICB0aGlzLnZlbHogPSB0aGlzLnAyLnogLSB0aGlzLnAxLno7XHJcbiAgICAgIHZhciBsZW4gPSBfTWF0aC5zcXJ0KHRoaXMudmVseCAqIHRoaXMudmVseCArIHRoaXMudmVseSAqIHRoaXMudmVseSArIHRoaXMudmVseiAqIHRoaXMudmVseik7XHJcbiAgICAgIGlmIChsZW4gPiAwLjAwNSkge1xyXG4gICAgICAgIGxlbiA9ICgwLjAwNSAtIGxlbikgLyBsZW4gKiBpbnZUaW1lU3RlcCAqIDAuMDU7XHJcbiAgICAgICAgdGhpcy52ZWx4ICo9IGxlbjtcclxuICAgICAgICB0aGlzLnZlbHkgKj0gbGVuO1xyXG4gICAgICAgIHRoaXMudmVseiAqPSBsZW47XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy52ZWx4ID0gMDtcclxuICAgICAgICB0aGlzLnZlbHkgPSAwO1xyXG4gICAgICAgIHRoaXMudmVseiA9IDA7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMuaW1weCAqPSAwLjk1O1xyXG4gICAgICB0aGlzLmltcHkgKj0gMC45NTtcclxuICAgICAgdGhpcy5pbXB6ICo9IDAuOTU7XHJcblxyXG4gICAgICB0aGlzLmwxLnggKz0gdGhpcy5pbXB4ICogdGhpcy5tMTtcclxuICAgICAgdGhpcy5sMS55ICs9IHRoaXMuaW1weSAqIHRoaXMubTE7XHJcbiAgICAgIHRoaXMubDEueiArPSB0aGlzLmltcHogKiB0aGlzLm0xO1xyXG4gICAgICB0aGlzLmExLnggKz0gdGhpcy5pbXB4ICogdGhpcy5heDF4ICsgdGhpcy5pbXB5ICogdGhpcy5heTF4ICsgdGhpcy5pbXB6ICogdGhpcy5hejF4O1xyXG4gICAgICB0aGlzLmExLnkgKz0gdGhpcy5pbXB4ICogdGhpcy5heDF5ICsgdGhpcy5pbXB5ICogdGhpcy5heTF5ICsgdGhpcy5pbXB6ICogdGhpcy5hejF5O1xyXG4gICAgICB0aGlzLmExLnogKz0gdGhpcy5pbXB4ICogdGhpcy5heDF6ICsgdGhpcy5pbXB5ICogdGhpcy5heTF6ICsgdGhpcy5pbXB6ICogdGhpcy5hejF6O1xyXG4gICAgICB0aGlzLmwyLnggLT0gdGhpcy5pbXB4ICogdGhpcy5tMjtcclxuICAgICAgdGhpcy5sMi55IC09IHRoaXMuaW1weSAqIHRoaXMubTI7XHJcbiAgICAgIHRoaXMubDIueiAtPSB0aGlzLmltcHogKiB0aGlzLm0yO1xyXG4gICAgICB0aGlzLmEyLnggLT0gdGhpcy5pbXB4ICogdGhpcy5heDJ4ICsgdGhpcy5pbXB5ICogdGhpcy5heTJ4ICsgdGhpcy5pbXB6ICogdGhpcy5hejJ4O1xyXG4gICAgICB0aGlzLmEyLnkgLT0gdGhpcy5pbXB4ICogdGhpcy5heDJ5ICsgdGhpcy5pbXB5ICogdGhpcy5heTJ5ICsgdGhpcy5pbXB6ICogdGhpcy5hejJ5O1xyXG4gICAgICB0aGlzLmEyLnogLT0gdGhpcy5pbXB4ICogdGhpcy5heDJ6ICsgdGhpcy5pbXB5ICogdGhpcy5heTJ6ICsgdGhpcy5pbXB6ICogdGhpcy5hejJ6O1xyXG4gICAgfSxcclxuXHJcbiAgICBzb2x2ZTogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgdmFyIGQgPSB0aGlzLmRkLmVsZW1lbnRzO1xyXG4gICAgICB2YXIgcnZ4ID0gdGhpcy5sMi54IC0gdGhpcy5sMS54ICsgdGhpcy5hMi55ICogdGhpcy5yMnogLSB0aGlzLmEyLnogKiB0aGlzLnIyeSAtIHRoaXMuYTEueSAqIHRoaXMucjF6ICsgdGhpcy5hMS56ICogdGhpcy5yMXkgLSB0aGlzLnZlbHg7XHJcbiAgICAgIHZhciBydnkgPSB0aGlzLmwyLnkgLSB0aGlzLmwxLnkgKyB0aGlzLmEyLnogKiB0aGlzLnIyeCAtIHRoaXMuYTIueCAqIHRoaXMucjJ6IC0gdGhpcy5hMS56ICogdGhpcy5yMXggKyB0aGlzLmExLnggKiB0aGlzLnIxeiAtIHRoaXMudmVseTtcclxuICAgICAgdmFyIHJ2eiA9IHRoaXMubDIueiAtIHRoaXMubDEueiArIHRoaXMuYTIueCAqIHRoaXMucjJ5IC0gdGhpcy5hMi55ICogdGhpcy5yMnggLSB0aGlzLmExLnggKiB0aGlzLnIxeSArIHRoaXMuYTEueSAqIHRoaXMucjF4IC0gdGhpcy52ZWx6O1xyXG4gICAgICB2YXIgbmltcHggPSBydnggKiBkWzBdICsgcnZ5ICogZFsxXSArIHJ2eiAqIGRbMl07XHJcbiAgICAgIHZhciBuaW1weSA9IHJ2eCAqIGRbM10gKyBydnkgKiBkWzRdICsgcnZ6ICogZFs1XTtcclxuICAgICAgdmFyIG5pbXB6ID0gcnZ4ICogZFs2XSArIHJ2eSAqIGRbN10gKyBydnogKiBkWzhdO1xyXG4gICAgICB0aGlzLmltcHggKz0gbmltcHg7XHJcbiAgICAgIHRoaXMuaW1weSArPSBuaW1weTtcclxuICAgICAgdGhpcy5pbXB6ICs9IG5pbXB6O1xyXG4gICAgICB0aGlzLmwxLnggKz0gbmltcHggKiB0aGlzLm0xO1xyXG4gICAgICB0aGlzLmwxLnkgKz0gbmltcHkgKiB0aGlzLm0xO1xyXG4gICAgICB0aGlzLmwxLnogKz0gbmltcHogKiB0aGlzLm0xO1xyXG4gICAgICB0aGlzLmExLnggKz0gbmltcHggKiB0aGlzLmF4MXggKyBuaW1weSAqIHRoaXMuYXkxeCArIG5pbXB6ICogdGhpcy5hejF4O1xyXG4gICAgICB0aGlzLmExLnkgKz0gbmltcHggKiB0aGlzLmF4MXkgKyBuaW1weSAqIHRoaXMuYXkxeSArIG5pbXB6ICogdGhpcy5hejF5O1xyXG4gICAgICB0aGlzLmExLnogKz0gbmltcHggKiB0aGlzLmF4MXogKyBuaW1weSAqIHRoaXMuYXkxeiArIG5pbXB6ICogdGhpcy5hejF6O1xyXG4gICAgICB0aGlzLmwyLnggLT0gbmltcHggKiB0aGlzLm0yO1xyXG4gICAgICB0aGlzLmwyLnkgLT0gbmltcHkgKiB0aGlzLm0yO1xyXG4gICAgICB0aGlzLmwyLnogLT0gbmltcHogKiB0aGlzLm0yO1xyXG4gICAgICB0aGlzLmEyLnggLT0gbmltcHggKiB0aGlzLmF4MnggKyBuaW1weSAqIHRoaXMuYXkyeCArIG5pbXB6ICogdGhpcy5hejJ4O1xyXG4gICAgICB0aGlzLmEyLnkgLT0gbmltcHggKiB0aGlzLmF4MnkgKyBuaW1weSAqIHRoaXMuYXkyeSArIG5pbXB6ICogdGhpcy5hejJ5O1xyXG4gICAgICB0aGlzLmEyLnogLT0gbmltcHggKiB0aGlzLmF4MnogKyBuaW1weSAqIHRoaXMuYXkyeiArIG5pbXB6ICogdGhpcy5hejJ6O1xyXG5cclxuICAgIH1cclxuXHJcbiAgfSk7XHJcblxyXG4gIC8qKlxyXG4gICogQSB0aHJlZS1heGlzIHJvdGF0aW9uYWwgY29uc3RyYWludCBmb3IgdmFyaW91cyBqb2ludHMuXHJcbiAgKiBAYXV0aG9yIHNhaGFyYW5cclxuICAqL1xyXG5cclxuICBmdW5jdGlvbiBSb3RhdGlvbmFsM0NvbnN0cmFpbnQoam9pbnQsIGxpbWl0TW90b3IxLCBsaW1pdE1vdG9yMiwgbGltaXRNb3RvcjMpIHtcclxuXHJcbiAgICB0aGlzLmNmbTEgPSBOYU47XHJcbiAgICB0aGlzLmNmbTIgPSBOYU47XHJcbiAgICB0aGlzLmNmbTMgPSBOYU47XHJcbiAgICB0aGlzLmkxZTAwID0gTmFOO1xyXG4gICAgdGhpcy5pMWUwMSA9IE5hTjtcclxuICAgIHRoaXMuaTFlMDIgPSBOYU47XHJcbiAgICB0aGlzLmkxZTEwID0gTmFOO1xyXG4gICAgdGhpcy5pMWUxMSA9IE5hTjtcclxuICAgIHRoaXMuaTFlMTIgPSBOYU47XHJcbiAgICB0aGlzLmkxZTIwID0gTmFOO1xyXG4gICAgdGhpcy5pMWUyMSA9IE5hTjtcclxuICAgIHRoaXMuaTFlMjIgPSBOYU47XHJcbiAgICB0aGlzLmkyZTAwID0gTmFOO1xyXG4gICAgdGhpcy5pMmUwMSA9IE5hTjtcclxuICAgIHRoaXMuaTJlMDIgPSBOYU47XHJcbiAgICB0aGlzLmkyZTEwID0gTmFOO1xyXG4gICAgdGhpcy5pMmUxMSA9IE5hTjtcclxuICAgIHRoaXMuaTJlMTIgPSBOYU47XHJcbiAgICB0aGlzLmkyZTIwID0gTmFOO1xyXG4gICAgdGhpcy5pMmUyMSA9IE5hTjtcclxuICAgIHRoaXMuaTJlMjIgPSBOYU47XHJcbiAgICB0aGlzLmF4MSA9IE5hTjtcclxuICAgIHRoaXMuYXkxID0gTmFOO1xyXG4gICAgdGhpcy5hejEgPSBOYU47XHJcbiAgICB0aGlzLmF4MiA9IE5hTjtcclxuICAgIHRoaXMuYXkyID0gTmFOO1xyXG4gICAgdGhpcy5hejIgPSBOYU47XHJcbiAgICB0aGlzLmF4MyA9IE5hTjtcclxuICAgIHRoaXMuYXkzID0gTmFOO1xyXG4gICAgdGhpcy5hejMgPSBOYU47XHJcblxyXG4gICAgdGhpcy5hMXgxID0gTmFOOyAvLyBqYWNvaWFuc1xyXG4gICAgdGhpcy5hMXkxID0gTmFOO1xyXG4gICAgdGhpcy5hMXoxID0gTmFOO1xyXG4gICAgdGhpcy5hMngxID0gTmFOO1xyXG4gICAgdGhpcy5hMnkxID0gTmFOO1xyXG4gICAgdGhpcy5hMnoxID0gTmFOO1xyXG4gICAgdGhpcy5hMXgyID0gTmFOO1xyXG4gICAgdGhpcy5hMXkyID0gTmFOO1xyXG4gICAgdGhpcy5hMXoyID0gTmFOO1xyXG4gICAgdGhpcy5hMngyID0gTmFOO1xyXG4gICAgdGhpcy5hMnkyID0gTmFOO1xyXG4gICAgdGhpcy5hMnoyID0gTmFOO1xyXG4gICAgdGhpcy5hMXgzID0gTmFOO1xyXG4gICAgdGhpcy5hMXkzID0gTmFOO1xyXG4gICAgdGhpcy5hMXozID0gTmFOO1xyXG4gICAgdGhpcy5hMngzID0gTmFOO1xyXG4gICAgdGhpcy5hMnkzID0gTmFOO1xyXG4gICAgdGhpcy5hMnozID0gTmFOO1xyXG5cclxuICAgIHRoaXMubG93ZXJMaW1pdDEgPSBOYU47XHJcbiAgICB0aGlzLnVwcGVyTGltaXQxID0gTmFOO1xyXG4gICAgdGhpcy5saW1pdFZlbG9jaXR5MSA9IE5hTjtcclxuICAgIHRoaXMubGltaXRTdGF0ZTEgPSAwOyAvLyAtMTogYXQgbG93ZXIsIDA6IGxvY2tlZCwgMTogYXQgdXBwZXIsIDI6IGZyZWVcclxuICAgIHRoaXMuZW5hYmxlTW90b3IxID0gZmFsc2U7XHJcbiAgICB0aGlzLm1vdG9yU3BlZWQxID0gTmFOO1xyXG4gICAgdGhpcy5tYXhNb3RvckZvcmNlMSA9IE5hTjtcclxuICAgIHRoaXMubWF4TW90b3JJbXB1bHNlMSA9IE5hTjtcclxuICAgIHRoaXMubG93ZXJMaW1pdDIgPSBOYU47XHJcbiAgICB0aGlzLnVwcGVyTGltaXQyID0gTmFOO1xyXG4gICAgdGhpcy5saW1pdFZlbG9jaXR5MiA9IE5hTjtcclxuICAgIHRoaXMubGltaXRTdGF0ZTIgPSAwOyAvLyAtMTogYXQgbG93ZXIsIDA6IGxvY2tlZCwgMTogYXQgdXBwZXIsIDI6IGZyZWVcclxuICAgIHRoaXMuZW5hYmxlTW90b3IyID0gZmFsc2U7XHJcbiAgICB0aGlzLm1vdG9yU3BlZWQyID0gTmFOO1xyXG4gICAgdGhpcy5tYXhNb3RvckZvcmNlMiA9IE5hTjtcclxuICAgIHRoaXMubWF4TW90b3JJbXB1bHNlMiA9IE5hTjtcclxuICAgIHRoaXMubG93ZXJMaW1pdDMgPSBOYU47XHJcbiAgICB0aGlzLnVwcGVyTGltaXQzID0gTmFOO1xyXG4gICAgdGhpcy5saW1pdFZlbG9jaXR5MyA9IE5hTjtcclxuICAgIHRoaXMubGltaXRTdGF0ZTMgPSAwOyAvLyAtMTogYXQgbG93ZXIsIDA6IGxvY2tlZCwgMTogYXQgdXBwZXIsIDI6IGZyZWVcclxuICAgIHRoaXMuZW5hYmxlTW90b3IzID0gZmFsc2U7XHJcbiAgICB0aGlzLm1vdG9yU3BlZWQzID0gTmFOO1xyXG4gICAgdGhpcy5tYXhNb3RvckZvcmNlMyA9IE5hTjtcclxuICAgIHRoaXMubWF4TW90b3JJbXB1bHNlMyA9IE5hTjtcclxuXHJcbiAgICB0aGlzLmswMCA9IE5hTjsgLy8gSyA9IEoqTSpKVFxyXG4gICAgdGhpcy5rMDEgPSBOYU47XHJcbiAgICB0aGlzLmswMiA9IE5hTjtcclxuICAgIHRoaXMuazEwID0gTmFOO1xyXG4gICAgdGhpcy5rMTEgPSBOYU47XHJcbiAgICB0aGlzLmsxMiA9IE5hTjtcclxuICAgIHRoaXMuazIwID0gTmFOO1xyXG4gICAgdGhpcy5rMjEgPSBOYU47XHJcbiAgICB0aGlzLmsyMiA9IE5hTjtcclxuXHJcbiAgICB0aGlzLmt2MDAgPSBOYU47IC8vIGRpYWdvbmFscyB3aXRob3V0IENGTXNcclxuICAgIHRoaXMua3YxMSA9IE5hTjtcclxuICAgIHRoaXMua3YyMiA9IE5hTjtcclxuXHJcbiAgICB0aGlzLmR2MDAgPSBOYU47IC8vIC4uLmludmVydGVkXHJcbiAgICB0aGlzLmR2MTEgPSBOYU47XHJcbiAgICB0aGlzLmR2MjIgPSBOYU47XHJcblxyXG4gICAgdGhpcy5kMDAgPSBOYU47ICAvLyBLXi0xXHJcbiAgICB0aGlzLmQwMSA9IE5hTjtcclxuICAgIHRoaXMuZDAyID0gTmFOO1xyXG4gICAgdGhpcy5kMTAgPSBOYU47XHJcbiAgICB0aGlzLmQxMSA9IE5hTjtcclxuICAgIHRoaXMuZDEyID0gTmFOO1xyXG4gICAgdGhpcy5kMjAgPSBOYU47XHJcbiAgICB0aGlzLmQyMSA9IE5hTjtcclxuICAgIHRoaXMuZDIyID0gTmFOO1xyXG5cclxuICAgIHRoaXMubGltaXRNb3RvcjEgPSBsaW1pdE1vdG9yMTtcclxuICAgIHRoaXMubGltaXRNb3RvcjIgPSBsaW1pdE1vdG9yMjtcclxuICAgIHRoaXMubGltaXRNb3RvcjMgPSBsaW1pdE1vdG9yMztcclxuICAgIHRoaXMuYjEgPSBqb2ludC5ib2R5MTtcclxuICAgIHRoaXMuYjIgPSBqb2ludC5ib2R5MjtcclxuICAgIHRoaXMuYTEgPSB0aGlzLmIxLmFuZ3VsYXJWZWxvY2l0eTtcclxuICAgIHRoaXMuYTIgPSB0aGlzLmIyLmFuZ3VsYXJWZWxvY2l0eTtcclxuICAgIHRoaXMuaTEgPSB0aGlzLmIxLmludmVyc2VJbmVydGlhO1xyXG4gICAgdGhpcy5pMiA9IHRoaXMuYjIuaW52ZXJzZUluZXJ0aWE7XHJcbiAgICB0aGlzLmxpbWl0SW1wdWxzZTEgPSAwO1xyXG4gICAgdGhpcy5tb3RvckltcHVsc2UxID0gMDtcclxuICAgIHRoaXMubGltaXRJbXB1bHNlMiA9IDA7XHJcbiAgICB0aGlzLm1vdG9ySW1wdWxzZTIgPSAwO1xyXG4gICAgdGhpcy5saW1pdEltcHVsc2UzID0gMDtcclxuICAgIHRoaXMubW90b3JJbXB1bHNlMyA9IDA7XHJcblxyXG4gIH1cclxuXHJcbiAgT2JqZWN0LmFzc2lnbihSb3RhdGlvbmFsM0NvbnN0cmFpbnQucHJvdG90eXBlLCB7XHJcblxyXG4gICAgUm90YXRpb25hbDNDb25zdHJhaW50OiB0cnVlLFxyXG5cclxuICAgIHByZVNvbHZlOiBmdW5jdGlvbiAodGltZVN0ZXAsIGludlRpbWVTdGVwKSB7XHJcblxyXG4gICAgICB0aGlzLmF4MSA9IHRoaXMubGltaXRNb3RvcjEuYXhpcy54O1xyXG4gICAgICB0aGlzLmF5MSA9IHRoaXMubGltaXRNb3RvcjEuYXhpcy55O1xyXG4gICAgICB0aGlzLmF6MSA9IHRoaXMubGltaXRNb3RvcjEuYXhpcy56O1xyXG4gICAgICB0aGlzLmF4MiA9IHRoaXMubGltaXRNb3RvcjIuYXhpcy54O1xyXG4gICAgICB0aGlzLmF5MiA9IHRoaXMubGltaXRNb3RvcjIuYXhpcy55O1xyXG4gICAgICB0aGlzLmF6MiA9IHRoaXMubGltaXRNb3RvcjIuYXhpcy56O1xyXG4gICAgICB0aGlzLmF4MyA9IHRoaXMubGltaXRNb3RvcjMuYXhpcy54O1xyXG4gICAgICB0aGlzLmF5MyA9IHRoaXMubGltaXRNb3RvcjMuYXhpcy55O1xyXG4gICAgICB0aGlzLmF6MyA9IHRoaXMubGltaXRNb3RvcjMuYXhpcy56O1xyXG4gICAgICB0aGlzLmxvd2VyTGltaXQxID0gdGhpcy5saW1pdE1vdG9yMS5sb3dlckxpbWl0O1xyXG4gICAgICB0aGlzLnVwcGVyTGltaXQxID0gdGhpcy5saW1pdE1vdG9yMS51cHBlckxpbWl0O1xyXG4gICAgICB0aGlzLm1vdG9yU3BlZWQxID0gdGhpcy5saW1pdE1vdG9yMS5tb3RvclNwZWVkO1xyXG4gICAgICB0aGlzLm1heE1vdG9yRm9yY2UxID0gdGhpcy5saW1pdE1vdG9yMS5tYXhNb3RvckZvcmNlO1xyXG4gICAgICB0aGlzLmVuYWJsZU1vdG9yMSA9IHRoaXMubWF4TW90b3JGb3JjZTEgPiAwO1xyXG4gICAgICB0aGlzLmxvd2VyTGltaXQyID0gdGhpcy5saW1pdE1vdG9yMi5sb3dlckxpbWl0O1xyXG4gICAgICB0aGlzLnVwcGVyTGltaXQyID0gdGhpcy5saW1pdE1vdG9yMi51cHBlckxpbWl0O1xyXG4gICAgICB0aGlzLm1vdG9yU3BlZWQyID0gdGhpcy5saW1pdE1vdG9yMi5tb3RvclNwZWVkO1xyXG4gICAgICB0aGlzLm1heE1vdG9yRm9yY2UyID0gdGhpcy5saW1pdE1vdG9yMi5tYXhNb3RvckZvcmNlO1xyXG4gICAgICB0aGlzLmVuYWJsZU1vdG9yMiA9IHRoaXMubWF4TW90b3JGb3JjZTIgPiAwO1xyXG4gICAgICB0aGlzLmxvd2VyTGltaXQzID0gdGhpcy5saW1pdE1vdG9yMy5sb3dlckxpbWl0O1xyXG4gICAgICB0aGlzLnVwcGVyTGltaXQzID0gdGhpcy5saW1pdE1vdG9yMy51cHBlckxpbWl0O1xyXG4gICAgICB0aGlzLm1vdG9yU3BlZWQzID0gdGhpcy5saW1pdE1vdG9yMy5tb3RvclNwZWVkO1xyXG4gICAgICB0aGlzLm1heE1vdG9yRm9yY2UzID0gdGhpcy5saW1pdE1vdG9yMy5tYXhNb3RvckZvcmNlO1xyXG4gICAgICB0aGlzLmVuYWJsZU1vdG9yMyA9IHRoaXMubWF4TW90b3JGb3JjZTMgPiAwO1xyXG5cclxuICAgICAgdmFyIHRpMSA9IHRoaXMuaTEuZWxlbWVudHM7XHJcbiAgICAgIHZhciB0aTIgPSB0aGlzLmkyLmVsZW1lbnRzO1xyXG4gICAgICB0aGlzLmkxZTAwID0gdGkxWzBdO1xyXG4gICAgICB0aGlzLmkxZTAxID0gdGkxWzFdO1xyXG4gICAgICB0aGlzLmkxZTAyID0gdGkxWzJdO1xyXG4gICAgICB0aGlzLmkxZTEwID0gdGkxWzNdO1xyXG4gICAgICB0aGlzLmkxZTExID0gdGkxWzRdO1xyXG4gICAgICB0aGlzLmkxZTEyID0gdGkxWzVdO1xyXG4gICAgICB0aGlzLmkxZTIwID0gdGkxWzZdO1xyXG4gICAgICB0aGlzLmkxZTIxID0gdGkxWzddO1xyXG4gICAgICB0aGlzLmkxZTIyID0gdGkxWzhdO1xyXG5cclxuICAgICAgdGhpcy5pMmUwMCA9IHRpMlswXTtcclxuICAgICAgdGhpcy5pMmUwMSA9IHRpMlsxXTtcclxuICAgICAgdGhpcy5pMmUwMiA9IHRpMlsyXTtcclxuICAgICAgdGhpcy5pMmUxMCA9IHRpMlszXTtcclxuICAgICAgdGhpcy5pMmUxMSA9IHRpMls0XTtcclxuICAgICAgdGhpcy5pMmUxMiA9IHRpMls1XTtcclxuICAgICAgdGhpcy5pMmUyMCA9IHRpMls2XTtcclxuICAgICAgdGhpcy5pMmUyMSA9IHRpMls3XTtcclxuICAgICAgdGhpcy5pMmUyMiA9IHRpMls4XTtcclxuXHJcbiAgICAgIHZhciBmcmVxdWVuY3kxID0gdGhpcy5saW1pdE1vdG9yMS5mcmVxdWVuY3k7XHJcbiAgICAgIHZhciBmcmVxdWVuY3kyID0gdGhpcy5saW1pdE1vdG9yMi5mcmVxdWVuY3k7XHJcbiAgICAgIHZhciBmcmVxdWVuY3kzID0gdGhpcy5saW1pdE1vdG9yMy5mcmVxdWVuY3k7XHJcbiAgICAgIHZhciBlbmFibGVTcHJpbmcxID0gZnJlcXVlbmN5MSA+IDA7XHJcbiAgICAgIHZhciBlbmFibGVTcHJpbmcyID0gZnJlcXVlbmN5MiA+IDA7XHJcbiAgICAgIHZhciBlbmFibGVTcHJpbmczID0gZnJlcXVlbmN5MyA+IDA7XHJcbiAgICAgIHZhciBlbmFibGVMaW1pdDEgPSB0aGlzLmxvd2VyTGltaXQxIDw9IHRoaXMudXBwZXJMaW1pdDE7XHJcbiAgICAgIHZhciBlbmFibGVMaW1pdDIgPSB0aGlzLmxvd2VyTGltaXQyIDw9IHRoaXMudXBwZXJMaW1pdDI7XHJcbiAgICAgIHZhciBlbmFibGVMaW1pdDMgPSB0aGlzLmxvd2VyTGltaXQzIDw9IHRoaXMudXBwZXJMaW1pdDM7XHJcbiAgICAgIHZhciBhbmdsZTEgPSB0aGlzLmxpbWl0TW90b3IxLmFuZ2xlO1xyXG4gICAgICBpZiAoZW5hYmxlTGltaXQxKSB7XHJcbiAgICAgICAgaWYgKHRoaXMubG93ZXJMaW1pdDEgPT0gdGhpcy51cHBlckxpbWl0MSkge1xyXG4gICAgICAgICAgaWYgKHRoaXMubGltaXRTdGF0ZTEgIT0gMCkge1xyXG4gICAgICAgICAgICB0aGlzLmxpbWl0U3RhdGUxID0gMDtcclxuICAgICAgICAgICAgdGhpcy5saW1pdEltcHVsc2UxID0gMDtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHRoaXMubGltaXRWZWxvY2l0eTEgPSB0aGlzLmxvd2VyTGltaXQxIC0gYW5nbGUxO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoYW5nbGUxIDwgdGhpcy5sb3dlckxpbWl0MSkge1xyXG4gICAgICAgICAgaWYgKHRoaXMubGltaXRTdGF0ZTEgIT0gLTEpIHtcclxuICAgICAgICAgICAgdGhpcy5saW1pdFN0YXRlMSA9IC0xO1xyXG4gICAgICAgICAgICB0aGlzLmxpbWl0SW1wdWxzZTEgPSAwO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgdGhpcy5saW1pdFZlbG9jaXR5MSA9IHRoaXMubG93ZXJMaW1pdDEgLSBhbmdsZTE7XHJcbiAgICAgICAgfSBlbHNlIGlmIChhbmdsZTEgPiB0aGlzLnVwcGVyTGltaXQxKSB7XHJcbiAgICAgICAgICBpZiAodGhpcy5saW1pdFN0YXRlMSAhPSAxKSB7XHJcbiAgICAgICAgICAgIHRoaXMubGltaXRTdGF0ZTEgPSAxO1xyXG4gICAgICAgICAgICB0aGlzLmxpbWl0SW1wdWxzZTEgPSAwO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgdGhpcy5saW1pdFZlbG9jaXR5MSA9IHRoaXMudXBwZXJMaW1pdDEgLSBhbmdsZTE7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHRoaXMubGltaXRTdGF0ZTEgPSAyO1xyXG4gICAgICAgICAgdGhpcy5saW1pdEltcHVsc2UxID0gMDtcclxuICAgICAgICAgIHRoaXMubGltaXRWZWxvY2l0eTEgPSAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIWVuYWJsZVNwcmluZzEpIHtcclxuICAgICAgICAgIGlmICh0aGlzLmxpbWl0VmVsb2NpdHkxID4gMC4wMikgdGhpcy5saW1pdFZlbG9jaXR5MSAtPSAwLjAyO1xyXG4gICAgICAgICAgZWxzZSBpZiAodGhpcy5saW1pdFZlbG9jaXR5MSA8IC0wLjAyKSB0aGlzLmxpbWl0VmVsb2NpdHkxICs9IDAuMDI7XHJcbiAgICAgICAgICBlbHNlIHRoaXMubGltaXRWZWxvY2l0eTEgPSAwO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLmxpbWl0U3RhdGUxID0gMjtcclxuICAgICAgICB0aGlzLmxpbWl0SW1wdWxzZTEgPSAwO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB2YXIgYW5nbGUyID0gdGhpcy5saW1pdE1vdG9yMi5hbmdsZTtcclxuICAgICAgaWYgKGVuYWJsZUxpbWl0Mikge1xyXG4gICAgICAgIGlmICh0aGlzLmxvd2VyTGltaXQyID09IHRoaXMudXBwZXJMaW1pdDIpIHtcclxuICAgICAgICAgIGlmICh0aGlzLmxpbWl0U3RhdGUyICE9IDApIHtcclxuICAgICAgICAgICAgdGhpcy5saW1pdFN0YXRlMiA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMubGltaXRJbXB1bHNlMiA9IDA7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICB0aGlzLmxpbWl0VmVsb2NpdHkyID0gdGhpcy5sb3dlckxpbWl0MiAtIGFuZ2xlMjtcclxuICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlMiA8IHRoaXMubG93ZXJMaW1pdDIpIHtcclxuICAgICAgICAgIGlmICh0aGlzLmxpbWl0U3RhdGUyICE9IC0xKSB7XHJcbiAgICAgICAgICAgIHRoaXMubGltaXRTdGF0ZTIgPSAtMTtcclxuICAgICAgICAgICAgdGhpcy5saW1pdEltcHVsc2UyID0gMDtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHRoaXMubGltaXRWZWxvY2l0eTIgPSB0aGlzLmxvd2VyTGltaXQyIC0gYW5nbGUyO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoYW5nbGUyID4gdGhpcy51cHBlckxpbWl0Mikge1xyXG4gICAgICAgICAgaWYgKHRoaXMubGltaXRTdGF0ZTIgIT0gMSkge1xyXG4gICAgICAgICAgICB0aGlzLmxpbWl0U3RhdGUyID0gMTtcclxuICAgICAgICAgICAgdGhpcy5saW1pdEltcHVsc2UyID0gMDtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHRoaXMubGltaXRWZWxvY2l0eTIgPSB0aGlzLnVwcGVyTGltaXQyIC0gYW5nbGUyO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLmxpbWl0U3RhdGUyID0gMjtcclxuICAgICAgICAgIHRoaXMubGltaXRJbXB1bHNlMiA9IDA7XHJcbiAgICAgICAgICB0aGlzLmxpbWl0VmVsb2NpdHkyID0gMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFlbmFibGVTcHJpbmcyKSB7XHJcbiAgICAgICAgICBpZiAodGhpcy5saW1pdFZlbG9jaXR5MiA+IDAuMDIpIHRoaXMubGltaXRWZWxvY2l0eTIgLT0gMC4wMjtcclxuICAgICAgICAgIGVsc2UgaWYgKHRoaXMubGltaXRWZWxvY2l0eTIgPCAtMC4wMikgdGhpcy5saW1pdFZlbG9jaXR5MiArPSAwLjAyO1xyXG4gICAgICAgICAgZWxzZSB0aGlzLmxpbWl0VmVsb2NpdHkyID0gMDtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5saW1pdFN0YXRlMiA9IDI7XHJcbiAgICAgICAgdGhpcy5saW1pdEltcHVsc2UyID0gMDtcclxuICAgICAgfVxyXG5cclxuICAgICAgdmFyIGFuZ2xlMyA9IHRoaXMubGltaXRNb3RvcjMuYW5nbGU7XHJcbiAgICAgIGlmIChlbmFibGVMaW1pdDMpIHtcclxuICAgICAgICBpZiAodGhpcy5sb3dlckxpbWl0MyA9PSB0aGlzLnVwcGVyTGltaXQzKSB7XHJcbiAgICAgICAgICBpZiAodGhpcy5saW1pdFN0YXRlMyAhPSAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMubGltaXRTdGF0ZTMgPSAwO1xyXG4gICAgICAgICAgICB0aGlzLmxpbWl0SW1wdWxzZTMgPSAwO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgdGhpcy5saW1pdFZlbG9jaXR5MyA9IHRoaXMubG93ZXJMaW1pdDMgLSBhbmdsZTM7XHJcbiAgICAgICAgfSBlbHNlIGlmIChhbmdsZTMgPCB0aGlzLmxvd2VyTGltaXQzKSB7XHJcbiAgICAgICAgICBpZiAodGhpcy5saW1pdFN0YXRlMyAhPSAtMSkge1xyXG4gICAgICAgICAgICB0aGlzLmxpbWl0U3RhdGUzID0gLTE7XHJcbiAgICAgICAgICAgIHRoaXMubGltaXRJbXB1bHNlMyA9IDA7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICB0aGlzLmxpbWl0VmVsb2NpdHkzID0gdGhpcy5sb3dlckxpbWl0MyAtIGFuZ2xlMztcclxuICAgICAgICB9IGVsc2UgaWYgKGFuZ2xlMyA+IHRoaXMudXBwZXJMaW1pdDMpIHtcclxuICAgICAgICAgIGlmICh0aGlzLmxpbWl0U3RhdGUzICE9IDEpIHtcclxuICAgICAgICAgICAgdGhpcy5saW1pdFN0YXRlMyA9IDE7XHJcbiAgICAgICAgICAgIHRoaXMubGltaXRJbXB1bHNlMyA9IDA7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICB0aGlzLmxpbWl0VmVsb2NpdHkzID0gdGhpcy51cHBlckxpbWl0MyAtIGFuZ2xlMztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdGhpcy5saW1pdFN0YXRlMyA9IDI7XHJcbiAgICAgICAgICB0aGlzLmxpbWl0SW1wdWxzZTMgPSAwO1xyXG4gICAgICAgICAgdGhpcy5saW1pdFZlbG9jaXR5MyA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghZW5hYmxlU3ByaW5nMykge1xyXG4gICAgICAgICAgaWYgKHRoaXMubGltaXRWZWxvY2l0eTMgPiAwLjAyKSB0aGlzLmxpbWl0VmVsb2NpdHkzIC09IDAuMDI7XHJcbiAgICAgICAgICBlbHNlIGlmICh0aGlzLmxpbWl0VmVsb2NpdHkzIDwgLTAuMDIpIHRoaXMubGltaXRWZWxvY2l0eTMgKz0gMC4wMjtcclxuICAgICAgICAgIGVsc2UgdGhpcy5saW1pdFZlbG9jaXR5MyA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMubGltaXRTdGF0ZTMgPSAyO1xyXG4gICAgICAgIHRoaXMubGltaXRJbXB1bHNlMyA9IDA7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICh0aGlzLmVuYWJsZU1vdG9yMSAmJiAodGhpcy5saW1pdFN0YXRlMSAhPSAwIHx8IGVuYWJsZVNwcmluZzEpKSB7XHJcbiAgICAgICAgdGhpcy5tYXhNb3RvckltcHVsc2UxID0gdGhpcy5tYXhNb3RvckZvcmNlMSAqIHRpbWVTdGVwO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMubW90b3JJbXB1bHNlMSA9IDA7XHJcbiAgICAgICAgdGhpcy5tYXhNb3RvckltcHVsc2UxID0gMDtcclxuICAgICAgfVxyXG4gICAgICBpZiAodGhpcy5lbmFibGVNb3RvcjIgJiYgKHRoaXMubGltaXRTdGF0ZTIgIT0gMCB8fCBlbmFibGVTcHJpbmcyKSkge1xyXG4gICAgICAgIHRoaXMubWF4TW90b3JJbXB1bHNlMiA9IHRoaXMubWF4TW90b3JGb3JjZTIgKiB0aW1lU3RlcDtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLm1vdG9ySW1wdWxzZTIgPSAwO1xyXG4gICAgICAgIHRoaXMubWF4TW90b3JJbXB1bHNlMiA9IDA7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHRoaXMuZW5hYmxlTW90b3IzICYmICh0aGlzLmxpbWl0U3RhdGUzICE9IDAgfHwgZW5hYmxlU3ByaW5nMykpIHtcclxuICAgICAgICB0aGlzLm1heE1vdG9ySW1wdWxzZTMgPSB0aGlzLm1heE1vdG9yRm9yY2UzICogdGltZVN0ZXA7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5tb3RvckltcHVsc2UzID0gMDtcclxuICAgICAgICB0aGlzLm1heE1vdG9ySW1wdWxzZTMgPSAwO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBidWlsZCBqYWNvYmlhbnNcclxuICAgICAgdGhpcy5hMXgxID0gdGhpcy5heDEgKiB0aGlzLmkxZTAwICsgdGhpcy5heTEgKiB0aGlzLmkxZTAxICsgdGhpcy5hejEgKiB0aGlzLmkxZTAyO1xyXG4gICAgICB0aGlzLmExeTEgPSB0aGlzLmF4MSAqIHRoaXMuaTFlMTAgKyB0aGlzLmF5MSAqIHRoaXMuaTFlMTEgKyB0aGlzLmF6MSAqIHRoaXMuaTFlMTI7XHJcbiAgICAgIHRoaXMuYTF6MSA9IHRoaXMuYXgxICogdGhpcy5pMWUyMCArIHRoaXMuYXkxICogdGhpcy5pMWUyMSArIHRoaXMuYXoxICogdGhpcy5pMWUyMjtcclxuICAgICAgdGhpcy5hMngxID0gdGhpcy5heDEgKiB0aGlzLmkyZTAwICsgdGhpcy5heTEgKiB0aGlzLmkyZTAxICsgdGhpcy5hejEgKiB0aGlzLmkyZTAyO1xyXG4gICAgICB0aGlzLmEyeTEgPSB0aGlzLmF4MSAqIHRoaXMuaTJlMTAgKyB0aGlzLmF5MSAqIHRoaXMuaTJlMTEgKyB0aGlzLmF6MSAqIHRoaXMuaTJlMTI7XHJcbiAgICAgIHRoaXMuYTJ6MSA9IHRoaXMuYXgxICogdGhpcy5pMmUyMCArIHRoaXMuYXkxICogdGhpcy5pMmUyMSArIHRoaXMuYXoxICogdGhpcy5pMmUyMjtcclxuXHJcbiAgICAgIHRoaXMuYTF4MiA9IHRoaXMuYXgyICogdGhpcy5pMWUwMCArIHRoaXMuYXkyICogdGhpcy5pMWUwMSArIHRoaXMuYXoyICogdGhpcy5pMWUwMjtcclxuICAgICAgdGhpcy5hMXkyID0gdGhpcy5heDIgKiB0aGlzLmkxZTEwICsgdGhpcy5heTIgKiB0aGlzLmkxZTExICsgdGhpcy5hejIgKiB0aGlzLmkxZTEyO1xyXG4gICAgICB0aGlzLmExejIgPSB0aGlzLmF4MiAqIHRoaXMuaTFlMjAgKyB0aGlzLmF5MiAqIHRoaXMuaTFlMjEgKyB0aGlzLmF6MiAqIHRoaXMuaTFlMjI7XHJcbiAgICAgIHRoaXMuYTJ4MiA9IHRoaXMuYXgyICogdGhpcy5pMmUwMCArIHRoaXMuYXkyICogdGhpcy5pMmUwMSArIHRoaXMuYXoyICogdGhpcy5pMmUwMjtcclxuICAgICAgdGhpcy5hMnkyID0gdGhpcy5heDIgKiB0aGlzLmkyZTEwICsgdGhpcy5heTIgKiB0aGlzLmkyZTExICsgdGhpcy5hejIgKiB0aGlzLmkyZTEyO1xyXG4gICAgICB0aGlzLmEyejIgPSB0aGlzLmF4MiAqIHRoaXMuaTJlMjAgKyB0aGlzLmF5MiAqIHRoaXMuaTJlMjEgKyB0aGlzLmF6MiAqIHRoaXMuaTJlMjI7XHJcblxyXG4gICAgICB0aGlzLmExeDMgPSB0aGlzLmF4MyAqIHRoaXMuaTFlMDAgKyB0aGlzLmF5MyAqIHRoaXMuaTFlMDEgKyB0aGlzLmF6MyAqIHRoaXMuaTFlMDI7XHJcbiAgICAgIHRoaXMuYTF5MyA9IHRoaXMuYXgzICogdGhpcy5pMWUxMCArIHRoaXMuYXkzICogdGhpcy5pMWUxMSArIHRoaXMuYXozICogdGhpcy5pMWUxMjtcclxuICAgICAgdGhpcy5hMXozID0gdGhpcy5heDMgKiB0aGlzLmkxZTIwICsgdGhpcy5heTMgKiB0aGlzLmkxZTIxICsgdGhpcy5hejMgKiB0aGlzLmkxZTIyO1xyXG4gICAgICB0aGlzLmEyeDMgPSB0aGlzLmF4MyAqIHRoaXMuaTJlMDAgKyB0aGlzLmF5MyAqIHRoaXMuaTJlMDEgKyB0aGlzLmF6MyAqIHRoaXMuaTJlMDI7XHJcbiAgICAgIHRoaXMuYTJ5MyA9IHRoaXMuYXgzICogdGhpcy5pMmUxMCArIHRoaXMuYXkzICogdGhpcy5pMmUxMSArIHRoaXMuYXozICogdGhpcy5pMmUxMjtcclxuICAgICAgdGhpcy5hMnozID0gdGhpcy5heDMgKiB0aGlzLmkyZTIwICsgdGhpcy5heTMgKiB0aGlzLmkyZTIxICsgdGhpcy5hejMgKiB0aGlzLmkyZTIyO1xyXG5cclxuICAgICAgLy8gYnVpbGQgYW4gaW1wdWxzZSBtYXRyaXhcclxuICAgICAgdGhpcy5rMDAgPSB0aGlzLmF4MSAqICh0aGlzLmExeDEgKyB0aGlzLmEyeDEpICsgdGhpcy5heTEgKiAodGhpcy5hMXkxICsgdGhpcy5hMnkxKSArIHRoaXMuYXoxICogKHRoaXMuYTF6MSArIHRoaXMuYTJ6MSk7XHJcbiAgICAgIHRoaXMuazAxID0gdGhpcy5heDEgKiAodGhpcy5hMXgyICsgdGhpcy5hMngyKSArIHRoaXMuYXkxICogKHRoaXMuYTF5MiArIHRoaXMuYTJ5MikgKyB0aGlzLmF6MSAqICh0aGlzLmExejIgKyB0aGlzLmEyejIpO1xyXG4gICAgICB0aGlzLmswMiA9IHRoaXMuYXgxICogKHRoaXMuYTF4MyArIHRoaXMuYTJ4MykgKyB0aGlzLmF5MSAqICh0aGlzLmExeTMgKyB0aGlzLmEyeTMpICsgdGhpcy5hejEgKiAodGhpcy5hMXozICsgdGhpcy5hMnozKTtcclxuICAgICAgdGhpcy5rMTAgPSB0aGlzLmF4MiAqICh0aGlzLmExeDEgKyB0aGlzLmEyeDEpICsgdGhpcy5heTIgKiAodGhpcy5hMXkxICsgdGhpcy5hMnkxKSArIHRoaXMuYXoyICogKHRoaXMuYTF6MSArIHRoaXMuYTJ6MSk7XHJcbiAgICAgIHRoaXMuazExID0gdGhpcy5heDIgKiAodGhpcy5hMXgyICsgdGhpcy5hMngyKSArIHRoaXMuYXkyICogKHRoaXMuYTF5MiArIHRoaXMuYTJ5MikgKyB0aGlzLmF6MiAqICh0aGlzLmExejIgKyB0aGlzLmEyejIpO1xyXG4gICAgICB0aGlzLmsxMiA9IHRoaXMuYXgyICogKHRoaXMuYTF4MyArIHRoaXMuYTJ4MykgKyB0aGlzLmF5MiAqICh0aGlzLmExeTMgKyB0aGlzLmEyeTMpICsgdGhpcy5hejIgKiAodGhpcy5hMXozICsgdGhpcy5hMnozKTtcclxuICAgICAgdGhpcy5rMjAgPSB0aGlzLmF4MyAqICh0aGlzLmExeDEgKyB0aGlzLmEyeDEpICsgdGhpcy5heTMgKiAodGhpcy5hMXkxICsgdGhpcy5hMnkxKSArIHRoaXMuYXozICogKHRoaXMuYTF6MSArIHRoaXMuYTJ6MSk7XHJcbiAgICAgIHRoaXMuazIxID0gdGhpcy5heDMgKiAodGhpcy5hMXgyICsgdGhpcy5hMngyKSArIHRoaXMuYXkzICogKHRoaXMuYTF5MiArIHRoaXMuYTJ5MikgKyB0aGlzLmF6MyAqICh0aGlzLmExejIgKyB0aGlzLmEyejIpO1xyXG4gICAgICB0aGlzLmsyMiA9IHRoaXMuYXgzICogKHRoaXMuYTF4MyArIHRoaXMuYTJ4MykgKyB0aGlzLmF5MyAqICh0aGlzLmExeTMgKyB0aGlzLmEyeTMpICsgdGhpcy5hejMgKiAodGhpcy5hMXozICsgdGhpcy5hMnozKTtcclxuXHJcbiAgICAgIHRoaXMua3YwMCA9IHRoaXMuazAwO1xyXG4gICAgICB0aGlzLmt2MTEgPSB0aGlzLmsxMTtcclxuICAgICAgdGhpcy5rdjIyID0gdGhpcy5rMjI7XHJcbiAgICAgIHRoaXMuZHYwMCA9IDEgLyB0aGlzLmt2MDA7XHJcbiAgICAgIHRoaXMuZHYxMSA9IDEgLyB0aGlzLmt2MTE7XHJcbiAgICAgIHRoaXMuZHYyMiA9IDEgLyB0aGlzLmt2MjI7XHJcblxyXG4gICAgICBpZiAoZW5hYmxlU3ByaW5nMSAmJiB0aGlzLmxpbWl0U3RhdGUxICE9IDIpIHtcclxuICAgICAgICB2YXIgb21lZ2EgPSA2LjI4MzE4NTMgKiBmcmVxdWVuY3kxO1xyXG4gICAgICAgIHZhciBrID0gb21lZ2EgKiBvbWVnYSAqIHRpbWVTdGVwO1xyXG4gICAgICAgIHZhciBkbXAgPSBpbnZUaW1lU3RlcCAvIChrICsgMiAqIHRoaXMubGltaXRNb3RvcjEuZGFtcGluZ1JhdGlvICogb21lZ2EpO1xyXG4gICAgICAgIHRoaXMuY2ZtMSA9IHRoaXMua3YwMCAqIGRtcDtcclxuICAgICAgICB0aGlzLmxpbWl0VmVsb2NpdHkxICo9IGsgKiBkbXA7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5jZm0xID0gMDtcclxuICAgICAgICB0aGlzLmxpbWl0VmVsb2NpdHkxICo9IGludlRpbWVTdGVwICogMC4wNTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGVuYWJsZVNwcmluZzIgJiYgdGhpcy5saW1pdFN0YXRlMiAhPSAyKSB7XHJcbiAgICAgICAgb21lZ2EgPSA2LjI4MzE4NTMgKiBmcmVxdWVuY3kyO1xyXG4gICAgICAgIGsgPSBvbWVnYSAqIG9tZWdhICogdGltZVN0ZXA7XHJcbiAgICAgICAgZG1wID0gaW52VGltZVN0ZXAgLyAoayArIDIgKiB0aGlzLmxpbWl0TW90b3IyLmRhbXBpbmdSYXRpbyAqIG9tZWdhKTtcclxuICAgICAgICB0aGlzLmNmbTIgPSB0aGlzLmt2MTEgKiBkbXA7XHJcbiAgICAgICAgdGhpcy5saW1pdFZlbG9jaXR5MiAqPSBrICogZG1wO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuY2ZtMiA9IDA7XHJcbiAgICAgICAgdGhpcy5saW1pdFZlbG9jaXR5MiAqPSBpbnZUaW1lU3RlcCAqIDAuMDU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChlbmFibGVTcHJpbmczICYmIHRoaXMubGltaXRTdGF0ZTMgIT0gMikge1xyXG4gICAgICAgIG9tZWdhID0gNi4yODMxODUzICogZnJlcXVlbmN5MztcclxuICAgICAgICBrID0gb21lZ2EgKiBvbWVnYSAqIHRpbWVTdGVwO1xyXG4gICAgICAgIGRtcCA9IGludlRpbWVTdGVwIC8gKGsgKyAyICogdGhpcy5saW1pdE1vdG9yMy5kYW1waW5nUmF0aW8gKiBvbWVnYSk7XHJcbiAgICAgICAgdGhpcy5jZm0zID0gdGhpcy5rdjIyICogZG1wO1xyXG4gICAgICAgIHRoaXMubGltaXRWZWxvY2l0eTMgKj0gayAqIGRtcDtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLmNmbTMgPSAwO1xyXG4gICAgICAgIHRoaXMubGltaXRWZWxvY2l0eTMgKj0gaW52VGltZVN0ZXAgKiAwLjA1O1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLmswMCArPSB0aGlzLmNmbTE7XHJcbiAgICAgIHRoaXMuazExICs9IHRoaXMuY2ZtMjtcclxuICAgICAgdGhpcy5rMjIgKz0gdGhpcy5jZm0zO1xyXG5cclxuICAgICAgdmFyIGludiA9IDEgLyAoXHJcbiAgICAgICAgdGhpcy5rMDAgKiAodGhpcy5rMTEgKiB0aGlzLmsyMiAtIHRoaXMuazIxICogdGhpcy5rMTIpICtcclxuICAgICAgICB0aGlzLmsxMCAqICh0aGlzLmsyMSAqIHRoaXMuazAyIC0gdGhpcy5rMDEgKiB0aGlzLmsyMikgK1xyXG4gICAgICAgIHRoaXMuazIwICogKHRoaXMuazAxICogdGhpcy5rMTIgLSB0aGlzLmsxMSAqIHRoaXMuazAyKVxyXG4gICAgICApO1xyXG4gICAgICB0aGlzLmQwMCA9ICh0aGlzLmsxMSAqIHRoaXMuazIyIC0gdGhpcy5rMTIgKiB0aGlzLmsyMSkgKiBpbnY7XHJcbiAgICAgIHRoaXMuZDAxID0gKHRoaXMuazAyICogdGhpcy5rMjEgLSB0aGlzLmswMSAqIHRoaXMuazIyKSAqIGludjtcclxuICAgICAgdGhpcy5kMDIgPSAodGhpcy5rMDEgKiB0aGlzLmsxMiAtIHRoaXMuazAyICogdGhpcy5rMTEpICogaW52O1xyXG4gICAgICB0aGlzLmQxMCA9ICh0aGlzLmsxMiAqIHRoaXMuazIwIC0gdGhpcy5rMTAgKiB0aGlzLmsyMikgKiBpbnY7XHJcbiAgICAgIHRoaXMuZDExID0gKHRoaXMuazAwICogdGhpcy5rMjIgLSB0aGlzLmswMiAqIHRoaXMuazIwKSAqIGludjtcclxuICAgICAgdGhpcy5kMTIgPSAodGhpcy5rMDIgKiB0aGlzLmsxMCAtIHRoaXMuazAwICogdGhpcy5rMTIpICogaW52O1xyXG4gICAgICB0aGlzLmQyMCA9ICh0aGlzLmsxMCAqIHRoaXMuazIxIC0gdGhpcy5rMTEgKiB0aGlzLmsyMCkgKiBpbnY7XHJcbiAgICAgIHRoaXMuZDIxID0gKHRoaXMuazAxICogdGhpcy5rMjAgLSB0aGlzLmswMCAqIHRoaXMuazIxKSAqIGludjtcclxuICAgICAgdGhpcy5kMjIgPSAodGhpcy5rMDAgKiB0aGlzLmsxMSAtIHRoaXMuazAxICogdGhpcy5rMTApICogaW52O1xyXG5cclxuICAgICAgdGhpcy5saW1pdEltcHVsc2UxICo9IDAuOTU7XHJcbiAgICAgIHRoaXMubW90b3JJbXB1bHNlMSAqPSAwLjk1O1xyXG4gICAgICB0aGlzLmxpbWl0SW1wdWxzZTIgKj0gMC45NTtcclxuICAgICAgdGhpcy5tb3RvckltcHVsc2UyICo9IDAuOTU7XHJcbiAgICAgIHRoaXMubGltaXRJbXB1bHNlMyAqPSAwLjk1O1xyXG4gICAgICB0aGlzLm1vdG9ySW1wdWxzZTMgKj0gMC45NTtcclxuICAgICAgdmFyIHRvdGFsSW1wdWxzZTEgPSB0aGlzLmxpbWl0SW1wdWxzZTEgKyB0aGlzLm1vdG9ySW1wdWxzZTE7XHJcbiAgICAgIHZhciB0b3RhbEltcHVsc2UyID0gdGhpcy5saW1pdEltcHVsc2UyICsgdGhpcy5tb3RvckltcHVsc2UyO1xyXG4gICAgICB2YXIgdG90YWxJbXB1bHNlMyA9IHRoaXMubGltaXRJbXB1bHNlMyArIHRoaXMubW90b3JJbXB1bHNlMztcclxuICAgICAgdGhpcy5hMS54ICs9IHRvdGFsSW1wdWxzZTEgKiB0aGlzLmExeDEgKyB0b3RhbEltcHVsc2UyICogdGhpcy5hMXgyICsgdG90YWxJbXB1bHNlMyAqIHRoaXMuYTF4MztcclxuICAgICAgdGhpcy5hMS55ICs9IHRvdGFsSW1wdWxzZTEgKiB0aGlzLmExeTEgKyB0b3RhbEltcHVsc2UyICogdGhpcy5hMXkyICsgdG90YWxJbXB1bHNlMyAqIHRoaXMuYTF5MztcclxuICAgICAgdGhpcy5hMS56ICs9IHRvdGFsSW1wdWxzZTEgKiB0aGlzLmExejEgKyB0b3RhbEltcHVsc2UyICogdGhpcy5hMXoyICsgdG90YWxJbXB1bHNlMyAqIHRoaXMuYTF6MztcclxuICAgICAgdGhpcy5hMi54IC09IHRvdGFsSW1wdWxzZTEgKiB0aGlzLmEyeDEgKyB0b3RhbEltcHVsc2UyICogdGhpcy5hMngyICsgdG90YWxJbXB1bHNlMyAqIHRoaXMuYTJ4MztcclxuICAgICAgdGhpcy5hMi55IC09IHRvdGFsSW1wdWxzZTEgKiB0aGlzLmEyeTEgKyB0b3RhbEltcHVsc2UyICogdGhpcy5hMnkyICsgdG90YWxJbXB1bHNlMyAqIHRoaXMuYTJ5MztcclxuICAgICAgdGhpcy5hMi56IC09IHRvdGFsSW1wdWxzZTEgKiB0aGlzLmEyejEgKyB0b3RhbEltcHVsc2UyICogdGhpcy5hMnoyICsgdG90YWxJbXB1bHNlMyAqIHRoaXMuYTJ6MztcclxuICAgIH0sXHJcbiAgICBzb2x2ZV86IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgIHZhciBydnggPSB0aGlzLmEyLnggLSB0aGlzLmExLng7XHJcbiAgICAgIHZhciBydnkgPSB0aGlzLmEyLnkgLSB0aGlzLmExLnk7XHJcbiAgICAgIHZhciBydnogPSB0aGlzLmEyLnogLSB0aGlzLmExLno7XHJcblxyXG4gICAgICB0aGlzLmxpbWl0VmVsb2NpdHkzID0gMzA7XHJcbiAgICAgIHZhciBydm4xID0gcnZ4ICogdGhpcy5heDEgKyBydnkgKiB0aGlzLmF5MSArIHJ2eiAqIHRoaXMuYXoxIC0gdGhpcy5saW1pdFZlbG9jaXR5MTtcclxuICAgICAgdmFyIHJ2bjIgPSBydnggKiB0aGlzLmF4MiArIHJ2eSAqIHRoaXMuYXkyICsgcnZ6ICogdGhpcy5hejIgLSB0aGlzLmxpbWl0VmVsb2NpdHkyO1xyXG4gICAgICB2YXIgcnZuMyA9IHJ2eCAqIHRoaXMuYXgzICsgcnZ5ICogdGhpcy5heTMgKyBydnogKiB0aGlzLmF6MyAtIHRoaXMubGltaXRWZWxvY2l0eTM7XHJcblxyXG4gICAgICB2YXIgZExpbWl0SW1wdWxzZTEgPSBydm4xICogdGhpcy5kMDAgKyBydm4yICogdGhpcy5kMDEgKyBydm4zICogdGhpcy5kMDI7XHJcbiAgICAgIHZhciBkTGltaXRJbXB1bHNlMiA9IHJ2bjEgKiB0aGlzLmQxMCArIHJ2bjIgKiB0aGlzLmQxMSArIHJ2bjMgKiB0aGlzLmQxMjtcclxuICAgICAgdmFyIGRMaW1pdEltcHVsc2UzID0gcnZuMSAqIHRoaXMuZDIwICsgcnZuMiAqIHRoaXMuZDIxICsgcnZuMyAqIHRoaXMuZDIyO1xyXG5cclxuICAgICAgdGhpcy5saW1pdEltcHVsc2UxICs9IGRMaW1pdEltcHVsc2UxO1xyXG4gICAgICB0aGlzLmxpbWl0SW1wdWxzZTIgKz0gZExpbWl0SW1wdWxzZTI7XHJcbiAgICAgIHRoaXMubGltaXRJbXB1bHNlMyArPSBkTGltaXRJbXB1bHNlMztcclxuXHJcbiAgICAgIHRoaXMuYTEueCArPSBkTGltaXRJbXB1bHNlMSAqIHRoaXMuYTF4MSArIGRMaW1pdEltcHVsc2UyICogdGhpcy5hMXgyICsgZExpbWl0SW1wdWxzZTMgKiB0aGlzLmExeDM7XHJcbiAgICAgIHRoaXMuYTEueSArPSBkTGltaXRJbXB1bHNlMSAqIHRoaXMuYTF5MSArIGRMaW1pdEltcHVsc2UyICogdGhpcy5hMXkyICsgZExpbWl0SW1wdWxzZTMgKiB0aGlzLmExeTM7XHJcbiAgICAgIHRoaXMuYTEueiArPSBkTGltaXRJbXB1bHNlMSAqIHRoaXMuYTF6MSArIGRMaW1pdEltcHVsc2UyICogdGhpcy5hMXoyICsgZExpbWl0SW1wdWxzZTMgKiB0aGlzLmExejM7XHJcbiAgICAgIHRoaXMuYTIueCAtPSBkTGltaXRJbXB1bHNlMSAqIHRoaXMuYTJ4MSArIGRMaW1pdEltcHVsc2UyICogdGhpcy5hMngyICsgZExpbWl0SW1wdWxzZTMgKiB0aGlzLmEyeDM7XHJcbiAgICAgIHRoaXMuYTIueSAtPSBkTGltaXRJbXB1bHNlMSAqIHRoaXMuYTJ5MSArIGRMaW1pdEltcHVsc2UyICogdGhpcy5hMnkyICsgZExpbWl0SW1wdWxzZTMgKiB0aGlzLmEyeTM7XHJcbiAgICAgIHRoaXMuYTIueiAtPSBkTGltaXRJbXB1bHNlMSAqIHRoaXMuYTJ6MSArIGRMaW1pdEltcHVsc2UyICogdGhpcy5hMnoyICsgZExpbWl0SW1wdWxzZTMgKiB0aGlzLmEyejM7XHJcbiAgICB9LFxyXG4gICAgc29sdmU6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgIHZhciBydnggPSB0aGlzLmEyLnggLSB0aGlzLmExLng7XHJcbiAgICAgIHZhciBydnkgPSB0aGlzLmEyLnkgLSB0aGlzLmExLnk7XHJcbiAgICAgIHZhciBydnogPSB0aGlzLmEyLnogLSB0aGlzLmExLno7XHJcblxyXG4gICAgICB2YXIgcnZuMSA9IHJ2eCAqIHRoaXMuYXgxICsgcnZ5ICogdGhpcy5heTEgKyBydnogKiB0aGlzLmF6MTtcclxuICAgICAgdmFyIHJ2bjIgPSBydnggKiB0aGlzLmF4MiArIHJ2eSAqIHRoaXMuYXkyICsgcnZ6ICogdGhpcy5hejI7XHJcbiAgICAgIHZhciBydm4zID0gcnZ4ICogdGhpcy5heDMgKyBydnkgKiB0aGlzLmF5MyArIHJ2eiAqIHRoaXMuYXozO1xyXG5cclxuICAgICAgdmFyIG9sZE1vdG9ySW1wdWxzZTEgPSB0aGlzLm1vdG9ySW1wdWxzZTE7XHJcbiAgICAgIHZhciBvbGRNb3RvckltcHVsc2UyID0gdGhpcy5tb3RvckltcHVsc2UyO1xyXG4gICAgICB2YXIgb2xkTW90b3JJbXB1bHNlMyA9IHRoaXMubW90b3JJbXB1bHNlMztcclxuXHJcbiAgICAgIHZhciBkTW90b3JJbXB1bHNlMSA9IDA7XHJcbiAgICAgIHZhciBkTW90b3JJbXB1bHNlMiA9IDA7XHJcbiAgICAgIHZhciBkTW90b3JJbXB1bHNlMyA9IDA7XHJcblxyXG4gICAgICBpZiAodGhpcy5lbmFibGVNb3RvcjEpIHtcclxuICAgICAgICBkTW90b3JJbXB1bHNlMSA9IChydm4xIC0gdGhpcy5tb3RvclNwZWVkMSkgKiB0aGlzLmR2MDA7XHJcbiAgICAgICAgdGhpcy5tb3RvckltcHVsc2UxICs9IGRNb3RvckltcHVsc2UxO1xyXG4gICAgICAgIGlmICh0aGlzLm1vdG9ySW1wdWxzZTEgPiB0aGlzLm1heE1vdG9ySW1wdWxzZTEpIHsgLy8gY2xhbXAgbW90b3IgaW1wdWxzZVxyXG4gICAgICAgICAgdGhpcy5tb3RvckltcHVsc2UxID0gdGhpcy5tYXhNb3RvckltcHVsc2UxO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5tb3RvckltcHVsc2UxIDwgLXRoaXMubWF4TW90b3JJbXB1bHNlMSkge1xyXG4gICAgICAgICAgdGhpcy5tb3RvckltcHVsc2UxID0gLXRoaXMubWF4TW90b3JJbXB1bHNlMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZE1vdG9ySW1wdWxzZTEgPSB0aGlzLm1vdG9ySW1wdWxzZTEgLSBvbGRNb3RvckltcHVsc2UxO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICh0aGlzLmVuYWJsZU1vdG9yMikge1xyXG4gICAgICAgIGRNb3RvckltcHVsc2UyID0gKHJ2bjIgLSB0aGlzLm1vdG9yU3BlZWQyKSAqIHRoaXMuZHYxMTtcclxuICAgICAgICB0aGlzLm1vdG9ySW1wdWxzZTIgKz0gZE1vdG9ySW1wdWxzZTI7XHJcbiAgICAgICAgaWYgKHRoaXMubW90b3JJbXB1bHNlMiA+IHRoaXMubWF4TW90b3JJbXB1bHNlMikgeyAvLyBjbGFtcCBtb3RvciBpbXB1bHNlXHJcbiAgICAgICAgICB0aGlzLm1vdG9ySW1wdWxzZTIgPSB0aGlzLm1heE1vdG9ySW1wdWxzZTI7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLm1vdG9ySW1wdWxzZTIgPCAtdGhpcy5tYXhNb3RvckltcHVsc2UyKSB7XHJcbiAgICAgICAgICB0aGlzLm1vdG9ySW1wdWxzZTIgPSAtdGhpcy5tYXhNb3RvckltcHVsc2UyO1xyXG4gICAgICAgIH1cclxuICAgICAgICBkTW90b3JJbXB1bHNlMiA9IHRoaXMubW90b3JJbXB1bHNlMiAtIG9sZE1vdG9ySW1wdWxzZTI7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHRoaXMuZW5hYmxlTW90b3IzKSB7XHJcbiAgICAgICAgZE1vdG9ySW1wdWxzZTMgPSAocnZuMyAtIHRoaXMubW90b3JTcGVlZDMpICogdGhpcy5kdjIyO1xyXG4gICAgICAgIHRoaXMubW90b3JJbXB1bHNlMyArPSBkTW90b3JJbXB1bHNlMztcclxuICAgICAgICBpZiAodGhpcy5tb3RvckltcHVsc2UzID4gdGhpcy5tYXhNb3RvckltcHVsc2UzKSB7IC8vIGNsYW1wIG1vdG9yIGltcHVsc2VcclxuICAgICAgICAgIHRoaXMubW90b3JJbXB1bHNlMyA9IHRoaXMubWF4TW90b3JJbXB1bHNlMztcclxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMubW90b3JJbXB1bHNlMyA8IC10aGlzLm1heE1vdG9ySW1wdWxzZTMpIHtcclxuICAgICAgICAgIHRoaXMubW90b3JJbXB1bHNlMyA9IC10aGlzLm1heE1vdG9ySW1wdWxzZTM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGRNb3RvckltcHVsc2UzID0gdGhpcy5tb3RvckltcHVsc2UzIC0gb2xkTW90b3JJbXB1bHNlMztcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gYXBwbHkgbW90b3IgaW1wdWxzZSB0byByZWxhdGl2ZSB2ZWxvY2l0eVxyXG4gICAgICBydm4xICs9IGRNb3RvckltcHVsc2UxICogdGhpcy5rdjAwICsgZE1vdG9ySW1wdWxzZTIgKiB0aGlzLmswMSArIGRNb3RvckltcHVsc2UzICogdGhpcy5rMDI7XHJcbiAgICAgIHJ2bjIgKz0gZE1vdG9ySW1wdWxzZTEgKiB0aGlzLmsxMCArIGRNb3RvckltcHVsc2UyICogdGhpcy5rdjExICsgZE1vdG9ySW1wdWxzZTMgKiB0aGlzLmsxMjtcclxuICAgICAgcnZuMyArPSBkTW90b3JJbXB1bHNlMSAqIHRoaXMuazIwICsgZE1vdG9ySW1wdWxzZTIgKiB0aGlzLmsyMSArIGRNb3RvckltcHVsc2UzICogdGhpcy5rdjIyO1xyXG5cclxuICAgICAgLy8gc3VidHJhY3QgdGFyZ2V0IHZlbG9jaXR5IGFuZCBhcHBsaWVkIGltcHVsc2VcclxuICAgICAgcnZuMSAtPSB0aGlzLmxpbWl0VmVsb2NpdHkxICsgdGhpcy5saW1pdEltcHVsc2UxICogdGhpcy5jZm0xO1xyXG4gICAgICBydm4yIC09IHRoaXMubGltaXRWZWxvY2l0eTIgKyB0aGlzLmxpbWl0SW1wdWxzZTIgKiB0aGlzLmNmbTI7XHJcbiAgICAgIHJ2bjMgLT0gdGhpcy5saW1pdFZlbG9jaXR5MyArIHRoaXMubGltaXRJbXB1bHNlMyAqIHRoaXMuY2ZtMztcclxuXHJcbiAgICAgIHZhciBvbGRMaW1pdEltcHVsc2UxID0gdGhpcy5saW1pdEltcHVsc2UxO1xyXG4gICAgICB2YXIgb2xkTGltaXRJbXB1bHNlMiA9IHRoaXMubGltaXRJbXB1bHNlMjtcclxuICAgICAgdmFyIG9sZExpbWl0SW1wdWxzZTMgPSB0aGlzLmxpbWl0SW1wdWxzZTM7XHJcblxyXG4gICAgICB2YXIgZExpbWl0SW1wdWxzZTEgPSBydm4xICogdGhpcy5kMDAgKyBydm4yICogdGhpcy5kMDEgKyBydm4zICogdGhpcy5kMDI7XHJcbiAgICAgIHZhciBkTGltaXRJbXB1bHNlMiA9IHJ2bjEgKiB0aGlzLmQxMCArIHJ2bjIgKiB0aGlzLmQxMSArIHJ2bjMgKiB0aGlzLmQxMjtcclxuICAgICAgdmFyIGRMaW1pdEltcHVsc2UzID0gcnZuMSAqIHRoaXMuZDIwICsgcnZuMiAqIHRoaXMuZDIxICsgcnZuMyAqIHRoaXMuZDIyO1xyXG5cclxuICAgICAgdGhpcy5saW1pdEltcHVsc2UxICs9IGRMaW1pdEltcHVsc2UxO1xyXG4gICAgICB0aGlzLmxpbWl0SW1wdWxzZTIgKz0gZExpbWl0SW1wdWxzZTI7XHJcbiAgICAgIHRoaXMubGltaXRJbXB1bHNlMyArPSBkTGltaXRJbXB1bHNlMztcclxuXHJcbiAgICAgIC8vIGNsYW1wXHJcbiAgICAgIHZhciBjbGFtcFN0YXRlID0gMDtcclxuICAgICAgaWYgKHRoaXMubGltaXRTdGF0ZTEgPT0gMiB8fCB0aGlzLmxpbWl0SW1wdWxzZTEgKiB0aGlzLmxpbWl0U3RhdGUxIDwgMCkge1xyXG4gICAgICAgIGRMaW1pdEltcHVsc2UxID0gLW9sZExpbWl0SW1wdWxzZTE7XHJcbiAgICAgICAgcnZuMiArPSBkTGltaXRJbXB1bHNlMSAqIHRoaXMuazEwO1xyXG4gICAgICAgIHJ2bjMgKz0gZExpbWl0SW1wdWxzZTEgKiB0aGlzLmsyMDtcclxuICAgICAgICBjbGFtcFN0YXRlIHw9IDE7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHRoaXMubGltaXRTdGF0ZTIgPT0gMiB8fCB0aGlzLmxpbWl0SW1wdWxzZTIgKiB0aGlzLmxpbWl0U3RhdGUyIDwgMCkge1xyXG4gICAgICAgIGRMaW1pdEltcHVsc2UyID0gLW9sZExpbWl0SW1wdWxzZTI7XHJcbiAgICAgICAgcnZuMSArPSBkTGltaXRJbXB1bHNlMiAqIHRoaXMuazAxO1xyXG4gICAgICAgIHJ2bjMgKz0gZExpbWl0SW1wdWxzZTIgKiB0aGlzLmsyMTtcclxuICAgICAgICBjbGFtcFN0YXRlIHw9IDI7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHRoaXMubGltaXRTdGF0ZTMgPT0gMiB8fCB0aGlzLmxpbWl0SW1wdWxzZTMgKiB0aGlzLmxpbWl0U3RhdGUzIDwgMCkge1xyXG4gICAgICAgIGRMaW1pdEltcHVsc2UzID0gLW9sZExpbWl0SW1wdWxzZTM7XHJcbiAgICAgICAgcnZuMSArPSBkTGltaXRJbXB1bHNlMyAqIHRoaXMuazAyO1xyXG4gICAgICAgIHJ2bjIgKz0gZExpbWl0SW1wdWxzZTMgKiB0aGlzLmsxMjtcclxuICAgICAgICBjbGFtcFN0YXRlIHw9IDQ7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIHVwZGF0ZSB1bi1jbGFtcGVkIGltcHVsc2VcclxuICAgICAgLy8gVE9ETzogaXNvbGF0ZSBkaXZpc2lvblxyXG4gICAgICB2YXIgZGV0O1xyXG4gICAgICBzd2l0Y2ggKGNsYW1wU3RhdGUpIHtcclxuICAgICAgICBjYXNlIDE6IC8vIHVwZGF0ZSAyIDNcclxuICAgICAgICAgIGRldCA9IDEgLyAodGhpcy5rMTEgKiB0aGlzLmsyMiAtIHRoaXMuazEyICogdGhpcy5rMjEpO1xyXG4gICAgICAgICAgZExpbWl0SW1wdWxzZTIgPSAodGhpcy5rMjIgKiBydm4yICsgLXRoaXMuazEyICogcnZuMykgKiBkZXQ7XHJcbiAgICAgICAgICBkTGltaXRJbXB1bHNlMyA9ICgtdGhpcy5rMjEgKiBydm4yICsgdGhpcy5rMTEgKiBydm4zKSAqIGRldDtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgMjogLy8gdXBkYXRlIDEgM1xyXG4gICAgICAgICAgZGV0ID0gMSAvICh0aGlzLmswMCAqIHRoaXMuazIyIC0gdGhpcy5rMDIgKiB0aGlzLmsyMCk7XHJcbiAgICAgICAgICBkTGltaXRJbXB1bHNlMSA9ICh0aGlzLmsyMiAqIHJ2bjEgKyAtdGhpcy5rMDIgKiBydm4zKSAqIGRldDtcclxuICAgICAgICAgIGRMaW1pdEltcHVsc2UzID0gKC10aGlzLmsyMCAqIHJ2bjEgKyB0aGlzLmswMCAqIHJ2bjMpICogZGV0O1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAzOiAvLyB1cGRhdGUgM1xyXG4gICAgICAgICAgZExpbWl0SW1wdWxzZTMgPSBydm4zIC8gdGhpcy5rMjI7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIDQ6IC8vIHVwZGF0ZSAxIDJcclxuICAgICAgICAgIGRldCA9IDEgLyAodGhpcy5rMDAgKiB0aGlzLmsxMSAtIHRoaXMuazAxICogdGhpcy5rMTApO1xyXG4gICAgICAgICAgZExpbWl0SW1wdWxzZTEgPSAodGhpcy5rMTEgKiBydm4xICsgLXRoaXMuazAxICogcnZuMikgKiBkZXQ7XHJcbiAgICAgICAgICBkTGltaXRJbXB1bHNlMiA9ICgtdGhpcy5rMTAgKiBydm4xICsgdGhpcy5rMDAgKiBydm4yKSAqIGRldDtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgNTogLy8gdXBkYXRlIDJcclxuICAgICAgICAgIGRMaW1pdEltcHVsc2UyID0gcnZuMiAvIHRoaXMuazExO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSA2OiAvLyB1cGRhdGUgMVxyXG4gICAgICAgICAgZExpbWl0SW1wdWxzZTEgPSBydm4xIC8gdGhpcy5rMDA7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5saW1pdEltcHVsc2UxID0gZExpbWl0SW1wdWxzZTEgKyBvbGRMaW1pdEltcHVsc2UxO1xyXG4gICAgICB0aGlzLmxpbWl0SW1wdWxzZTIgPSBkTGltaXRJbXB1bHNlMiArIG9sZExpbWl0SW1wdWxzZTI7XHJcbiAgICAgIHRoaXMubGltaXRJbXB1bHNlMyA9IGRMaW1pdEltcHVsc2UzICsgb2xkTGltaXRJbXB1bHNlMztcclxuXHJcbiAgICAgIHZhciBkSW1wdWxzZTEgPSBkTW90b3JJbXB1bHNlMSArIGRMaW1pdEltcHVsc2UxO1xyXG4gICAgICB2YXIgZEltcHVsc2UyID0gZE1vdG9ySW1wdWxzZTIgKyBkTGltaXRJbXB1bHNlMjtcclxuICAgICAgdmFyIGRJbXB1bHNlMyA9IGRNb3RvckltcHVsc2UzICsgZExpbWl0SW1wdWxzZTM7XHJcblxyXG4gICAgICAvLyBhcHBseSBpbXB1bHNlXHJcbiAgICAgIHRoaXMuYTEueCArPSBkSW1wdWxzZTEgKiB0aGlzLmExeDEgKyBkSW1wdWxzZTIgKiB0aGlzLmExeDIgKyBkSW1wdWxzZTMgKiB0aGlzLmExeDM7XHJcbiAgICAgIHRoaXMuYTEueSArPSBkSW1wdWxzZTEgKiB0aGlzLmExeTEgKyBkSW1wdWxzZTIgKiB0aGlzLmExeTIgKyBkSW1wdWxzZTMgKiB0aGlzLmExeTM7XHJcbiAgICAgIHRoaXMuYTEueiArPSBkSW1wdWxzZTEgKiB0aGlzLmExejEgKyBkSW1wdWxzZTIgKiB0aGlzLmExejIgKyBkSW1wdWxzZTMgKiB0aGlzLmExejM7XHJcbiAgICAgIHRoaXMuYTIueCAtPSBkSW1wdWxzZTEgKiB0aGlzLmEyeDEgKyBkSW1wdWxzZTIgKiB0aGlzLmEyeDIgKyBkSW1wdWxzZTMgKiB0aGlzLmEyeDM7XHJcbiAgICAgIHRoaXMuYTIueSAtPSBkSW1wdWxzZTEgKiB0aGlzLmEyeTEgKyBkSW1wdWxzZTIgKiB0aGlzLmEyeTIgKyBkSW1wdWxzZTMgKiB0aGlzLmEyeTM7XHJcbiAgICAgIHRoaXMuYTIueiAtPSBkSW1wdWxzZTEgKiB0aGlzLmEyejEgKyBkSW1wdWxzZTIgKiB0aGlzLmEyejIgKyBkSW1wdWxzZTMgKiB0aGlzLmEyejM7XHJcbiAgICAgIHJ2eCA9IHRoaXMuYTIueCAtIHRoaXMuYTEueDtcclxuICAgICAgcnZ5ID0gdGhpcy5hMi55IC0gdGhpcy5hMS55O1xyXG4gICAgICBydnogPSB0aGlzLmEyLnogLSB0aGlzLmExLno7XHJcblxyXG4gICAgICBydm4yID0gcnZ4ICogdGhpcy5heDIgKyBydnkgKiB0aGlzLmF5MiArIHJ2eiAqIHRoaXMuYXoyO1xyXG4gICAgfVxyXG5cclxuICB9KTtcclxuXHJcbiAgLyoqXHJcbiAgICogQSBoaW5nZSBqb2ludCBhbGxvd3Mgb25seSBmb3IgcmVsYXRpdmUgcm90YXRpb24gb2YgcmlnaWQgYm9kaWVzIGFsb25nIHRoZSBheGlzLlxyXG4gICAqXHJcbiAgICogQGF1dGhvciBzYWhhcmFuXHJcbiAgICogQGF1dGhvciBsby10aFxyXG4gICAqL1xyXG5cclxuICBmdW5jdGlvbiBIaW5nZUpvaW50KGNvbmZpZywgbG93ZXJBbmdsZUxpbWl0LCB1cHBlckFuZ2xlTGltaXQpIHtcclxuXHJcbiAgICBKb2ludC5jYWxsKHRoaXMsIGNvbmZpZyk7XHJcblxyXG4gICAgdGhpcy50eXBlID0gSk9JTlRfSElOR0U7XHJcblxyXG4gICAgLy8gVGhlIGF4aXMgaW4gdGhlIGZpcnN0IGJvZHkncyBjb29yZGluYXRlIHN5c3RlbS5cclxuICAgIHRoaXMubG9jYWxBeGlzMSA9IGNvbmZpZy5sb2NhbEF4aXMxLmNsb25lKCkubm9ybWFsaXplKCk7XHJcbiAgICAvLyBUaGUgYXhpcyBpbiB0aGUgc2Vjb25kIGJvZHkncyBjb29yZGluYXRlIHN5c3RlbS5cclxuICAgIHRoaXMubG9jYWxBeGlzMiA9IGNvbmZpZy5sb2NhbEF4aXMyLmNsb25lKCkubm9ybWFsaXplKCk7XHJcblxyXG4gICAgLy8gbWFrZSBhbmdsZSBheGlzXHJcbiAgICB2YXIgYXJjID0gbmV3IE1hdDMzKCkuc2V0UXVhdChuZXcgUXVhdCgpLnNldEZyb21Vbml0VmVjdG9ycyh0aGlzLmxvY2FsQXhpczEsIHRoaXMubG9jYWxBeGlzMikpO1xyXG4gICAgdGhpcy5sb2NhbEFuZ2xlMSA9IG5ldyBWZWMzKCkudGFuZ2VudCh0aGlzLmxvY2FsQXhpczEpLm5vcm1hbGl6ZSgpO1xyXG4gICAgdGhpcy5sb2NhbEFuZ2xlMiA9IHRoaXMubG9jYWxBbmdsZTEuY2xvbmUoKS5hcHBseU1hdHJpeDMoYXJjLCB0cnVlKTtcclxuXHJcbiAgICB0aGlzLmF4MSA9IG5ldyBWZWMzKCk7XHJcbiAgICB0aGlzLmF4MiA9IG5ldyBWZWMzKCk7XHJcbiAgICB0aGlzLmFuMSA9IG5ldyBWZWMzKCk7XHJcbiAgICB0aGlzLmFuMiA9IG5ldyBWZWMzKCk7XHJcblxyXG4gICAgdGhpcy50bXAgPSBuZXcgVmVjMygpO1xyXG5cclxuICAgIHRoaXMubm9yID0gbmV3IFZlYzMoKTtcclxuICAgIHRoaXMudGFuID0gbmV3IFZlYzMoKTtcclxuICAgIHRoaXMuYmluID0gbmV3IFZlYzMoKTtcclxuXHJcbiAgICAvLyBUaGUgcm90YXRpb25hbCBsaW1pdCBhbmQgbW90b3IgaW5mb3JtYXRpb24gb2YgdGhlIGpvaW50LlxyXG4gICAgdGhpcy5saW1pdE1vdG9yID0gbmV3IExpbWl0TW90b3IodGhpcy5ub3IsIGZhbHNlKTtcclxuICAgIHRoaXMubGltaXRNb3Rvci5sb3dlckxpbWl0ID0gbG93ZXJBbmdsZUxpbWl0O1xyXG4gICAgdGhpcy5saW1pdE1vdG9yLnVwcGVyTGltaXQgPSB1cHBlckFuZ2xlTGltaXQ7XHJcblxyXG4gICAgdGhpcy5sYyA9IG5ldyBMaW5lYXJDb25zdHJhaW50KHRoaXMpO1xyXG4gICAgdGhpcy5yMyA9IG5ldyBSb3RhdGlvbmFsM0NvbnN0cmFpbnQodGhpcywgdGhpcy5saW1pdE1vdG9yLCBuZXcgTGltaXRNb3Rvcih0aGlzLnRhbiwgdHJ1ZSksIG5ldyBMaW1pdE1vdG9yKHRoaXMuYmluLCB0cnVlKSk7XHJcbiAgfVxyXG4gIEhpbmdlSm9pbnQucHJvdG90eXBlID0gT2JqZWN0LmFzc2lnbihPYmplY3QuY3JlYXRlKEpvaW50LnByb3RvdHlwZSksIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcjogSGluZ2VKb2ludCxcclxuXHJcblxyXG4gICAgcHJlU29sdmU6IGZ1bmN0aW9uICh0aW1lU3RlcCwgaW52VGltZVN0ZXApIHtcclxuXHJcbiAgICAgIHRoaXMudXBkYXRlQW5jaG9yUG9pbnRzKCk7XHJcblxyXG4gICAgICB0aGlzLmF4MS5jb3B5KHRoaXMubG9jYWxBeGlzMSkuYXBwbHlNYXRyaXgzKHRoaXMuYm9keTEucm90YXRpb24sIHRydWUpO1xyXG4gICAgICB0aGlzLmF4Mi5jb3B5KHRoaXMubG9jYWxBeGlzMikuYXBwbHlNYXRyaXgzKHRoaXMuYm9keTIucm90YXRpb24sIHRydWUpO1xyXG5cclxuICAgICAgdGhpcy5hbjEuY29weSh0aGlzLmxvY2FsQW5nbGUxKS5hcHBseU1hdHJpeDModGhpcy5ib2R5MS5yb3RhdGlvbiwgdHJ1ZSk7XHJcbiAgICAgIHRoaXMuYW4yLmNvcHkodGhpcy5sb2NhbEFuZ2xlMikuYXBwbHlNYXRyaXgzKHRoaXMuYm9keTIucm90YXRpb24sIHRydWUpO1xyXG5cclxuICAgICAgLy8gbm9ybWFsIHRhbmdlbnQgYmlub3JtYWxcclxuXHJcbiAgICAgIHRoaXMubm9yLnNldChcclxuICAgICAgICB0aGlzLmF4MS54ICogdGhpcy5ib2R5Mi5pbnZlcnNlTWFzcyArIHRoaXMuYXgyLnggKiB0aGlzLmJvZHkxLmludmVyc2VNYXNzLFxyXG4gICAgICAgIHRoaXMuYXgxLnkgKiB0aGlzLmJvZHkyLmludmVyc2VNYXNzICsgdGhpcy5heDIueSAqIHRoaXMuYm9keTEuaW52ZXJzZU1hc3MsXHJcbiAgICAgICAgdGhpcy5heDEueiAqIHRoaXMuYm9keTIuaW52ZXJzZU1hc3MgKyB0aGlzLmF4Mi56ICogdGhpcy5ib2R5MS5pbnZlcnNlTWFzc1xyXG4gICAgICApLm5vcm1hbGl6ZSgpO1xyXG5cclxuICAgICAgdGhpcy50YW4udGFuZ2VudCh0aGlzLm5vcikubm9ybWFsaXplKCk7XHJcblxyXG4gICAgICB0aGlzLmJpbi5jcm9zc1ZlY3RvcnModGhpcy5ub3IsIHRoaXMudGFuKTtcclxuXHJcbiAgICAgIC8vIGNhbGN1bGF0ZSBoaW5nZSBhbmdsZVxyXG5cclxuICAgICAgdmFyIGxpbWl0ZSA9IF9NYXRoLmFjb3NDbGFtcChfTWF0aC5kb3RWZWN0b3JzKHRoaXMuYW4xLCB0aGlzLmFuMikpO1xyXG5cclxuICAgICAgdGhpcy50bXAuY3Jvc3NWZWN0b3JzKHRoaXMuYW4xLCB0aGlzLmFuMik7XHJcblxyXG4gICAgICBpZiAoX01hdGguZG90VmVjdG9ycyh0aGlzLm5vciwgdGhpcy50bXApIDwgMCkgdGhpcy5saW1pdE1vdG9yLmFuZ2xlID0gLWxpbWl0ZTtcclxuICAgICAgZWxzZSB0aGlzLmxpbWl0TW90b3IuYW5nbGUgPSBsaW1pdGU7XHJcblxyXG4gICAgICB0aGlzLnRtcC5jcm9zc1ZlY3RvcnModGhpcy5heDEsIHRoaXMuYXgyKTtcclxuXHJcbiAgICAgIHRoaXMucjMubGltaXRNb3RvcjIuYW5nbGUgPSBfTWF0aC5kb3RWZWN0b3JzKHRoaXMudGFuLCB0aGlzLnRtcCk7XHJcbiAgICAgIHRoaXMucjMubGltaXRNb3RvcjMuYW5nbGUgPSBfTWF0aC5kb3RWZWN0b3JzKHRoaXMuYmluLCB0aGlzLnRtcCk7XHJcblxyXG4gICAgICAvLyBwcmVTb2x2ZVxyXG5cclxuICAgICAgdGhpcy5yMy5wcmVTb2x2ZSh0aW1lU3RlcCwgaW52VGltZVN0ZXApO1xyXG4gICAgICB0aGlzLmxjLnByZVNvbHZlKHRpbWVTdGVwLCBpbnZUaW1lU3RlcCk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBzb2x2ZTogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgdGhpcy5yMy5zb2x2ZSgpO1xyXG4gICAgICB0aGlzLmxjLnNvbHZlKCk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBwb3N0U29sdmU6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICB9XHJcblxyXG4gIH0pO1xyXG5cclxuICAvKipcclxuICAgKiBBIGJhbGwtYW5kLXNvY2tldCBqb2ludCBsaW1pdHMgcmVsYXRpdmUgdHJhbnNsYXRpb24gb24gdHdvIGFuY2hvciBwb2ludHMgb24gcmlnaWQgYm9kaWVzLlxyXG4gICAqXHJcbiAgICogQGF1dGhvciBzYWhhcmFuXHJcbiAgICogQGF1dGhvciBsby10aFxyXG4gICAqL1xyXG5cclxuICBmdW5jdGlvbiBCYWxsQW5kU29ja2V0Sm9pbnQoY29uZmlnKSB7XHJcblxyXG4gICAgSm9pbnQuY2FsbCh0aGlzLCBjb25maWcpO1xyXG5cclxuICAgIHRoaXMudHlwZSA9IEpPSU5UX0JBTExfQU5EX1NPQ0tFVDtcclxuXHJcbiAgICB0aGlzLmxjID0gbmV3IExpbmVhckNvbnN0cmFpbnQodGhpcyk7XHJcblxyXG4gIH1cclxuICBCYWxsQW5kU29ja2V0Sm9pbnQucHJvdG90eXBlID0gT2JqZWN0LmFzc2lnbihPYmplY3QuY3JlYXRlKEpvaW50LnByb3RvdHlwZSksIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcjogQmFsbEFuZFNvY2tldEpvaW50LFxyXG5cclxuICAgIHByZVNvbHZlOiBmdW5jdGlvbiAodGltZVN0ZXAsIGludlRpbWVTdGVwKSB7XHJcblxyXG4gICAgICB0aGlzLnVwZGF0ZUFuY2hvclBvaW50cygpO1xyXG5cclxuICAgICAgLy8gcHJlU29sdmVcclxuXHJcbiAgICAgIHRoaXMubGMucHJlU29sdmUodGltZVN0ZXAsIGludlRpbWVTdGVwKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHNvbHZlOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICB0aGlzLmxjLnNvbHZlKCk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBwb3N0U29sdmU6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICB9XHJcblxyXG4gIH0pO1xyXG5cclxuICAvKipcclxuICAqIEEgdHJhbnNsYXRpb25hbCBjb25zdHJhaW50IGZvciB2YXJpb3VzIGpvaW50cy5cclxuICAqIEBhdXRob3Igc2FoYXJhblxyXG4gICovXHJcbiAgZnVuY3Rpb24gVHJhbnNsYXRpb25hbENvbnN0cmFpbnQoam9pbnQsIGxpbWl0TW90b3IpIHtcclxuICAgIHRoaXMuY2ZtID0gTmFOO1xyXG4gICAgdGhpcy5tMSA9IE5hTjtcclxuICAgIHRoaXMubTIgPSBOYU47XHJcbiAgICB0aGlzLmkxZTAwID0gTmFOO1xyXG4gICAgdGhpcy5pMWUwMSA9IE5hTjtcclxuICAgIHRoaXMuaTFlMDIgPSBOYU47XHJcbiAgICB0aGlzLmkxZTEwID0gTmFOO1xyXG4gICAgdGhpcy5pMWUxMSA9IE5hTjtcclxuICAgIHRoaXMuaTFlMTIgPSBOYU47XHJcbiAgICB0aGlzLmkxZTIwID0gTmFOO1xyXG4gICAgdGhpcy5pMWUyMSA9IE5hTjtcclxuICAgIHRoaXMuaTFlMjIgPSBOYU47XHJcbiAgICB0aGlzLmkyZTAwID0gTmFOO1xyXG4gICAgdGhpcy5pMmUwMSA9IE5hTjtcclxuICAgIHRoaXMuaTJlMDIgPSBOYU47XHJcbiAgICB0aGlzLmkyZTEwID0gTmFOO1xyXG4gICAgdGhpcy5pMmUxMSA9IE5hTjtcclxuICAgIHRoaXMuaTJlMTIgPSBOYU47XHJcbiAgICB0aGlzLmkyZTIwID0gTmFOO1xyXG4gICAgdGhpcy5pMmUyMSA9IE5hTjtcclxuICAgIHRoaXMuaTJlMjIgPSBOYU47XHJcbiAgICB0aGlzLm1vdG9yRGVub20gPSBOYU47XHJcbiAgICB0aGlzLmludk1vdG9yRGVub20gPSBOYU47XHJcbiAgICB0aGlzLmludkRlbm9tID0gTmFOO1xyXG4gICAgdGhpcy5heCA9IE5hTjtcclxuICAgIHRoaXMuYXkgPSBOYU47XHJcbiAgICB0aGlzLmF6ID0gTmFOO1xyXG4gICAgdGhpcy5yMXggPSBOYU47XHJcbiAgICB0aGlzLnIxeSA9IE5hTjtcclxuICAgIHRoaXMucjF6ID0gTmFOO1xyXG4gICAgdGhpcy5yMnggPSBOYU47XHJcbiAgICB0aGlzLnIyeSA9IE5hTjtcclxuICAgIHRoaXMucjJ6ID0gTmFOO1xyXG4gICAgdGhpcy50MXggPSBOYU47XHJcbiAgICB0aGlzLnQxeSA9IE5hTjtcclxuICAgIHRoaXMudDF6ID0gTmFOO1xyXG4gICAgdGhpcy50MnggPSBOYU47XHJcbiAgICB0aGlzLnQyeSA9IE5hTjtcclxuICAgIHRoaXMudDJ6ID0gTmFOO1xyXG4gICAgdGhpcy5sMXggPSBOYU47XHJcbiAgICB0aGlzLmwxeSA9IE5hTjtcclxuICAgIHRoaXMubDF6ID0gTmFOO1xyXG4gICAgdGhpcy5sMnggPSBOYU47XHJcbiAgICB0aGlzLmwyeSA9IE5hTjtcclxuICAgIHRoaXMubDJ6ID0gTmFOO1xyXG4gICAgdGhpcy5hMXggPSBOYU47XHJcbiAgICB0aGlzLmExeSA9IE5hTjtcclxuICAgIHRoaXMuYTF6ID0gTmFOO1xyXG4gICAgdGhpcy5hMnggPSBOYU47XHJcbiAgICB0aGlzLmEyeSA9IE5hTjtcclxuICAgIHRoaXMuYTJ6ID0gTmFOO1xyXG4gICAgdGhpcy5sb3dlckxpbWl0ID0gTmFOO1xyXG4gICAgdGhpcy51cHBlckxpbWl0ID0gTmFOO1xyXG4gICAgdGhpcy5saW1pdFZlbG9jaXR5ID0gTmFOO1xyXG4gICAgdGhpcy5saW1pdFN0YXRlID0gMDsgLy8gLTE6IGF0IGxvd2VyLCAwOiBsb2NrZWQsIDE6IGF0IHVwcGVyLCAyOiBmcmVlXHJcbiAgICB0aGlzLmVuYWJsZU1vdG9yID0gZmFsc2U7XHJcbiAgICB0aGlzLm1vdG9yU3BlZWQgPSBOYU47XHJcbiAgICB0aGlzLm1heE1vdG9yRm9yY2UgPSBOYU47XHJcbiAgICB0aGlzLm1heE1vdG9ySW1wdWxzZSA9IE5hTjtcclxuXHJcbiAgICB0aGlzLmxpbWl0TW90b3IgPSBsaW1pdE1vdG9yO1xyXG4gICAgdGhpcy5iMSA9IGpvaW50LmJvZHkxO1xyXG4gICAgdGhpcy5iMiA9IGpvaW50LmJvZHkyO1xyXG4gICAgdGhpcy5wMSA9IGpvaW50LmFuY2hvclBvaW50MTtcclxuICAgIHRoaXMucDIgPSBqb2ludC5hbmNob3JQb2ludDI7XHJcbiAgICB0aGlzLnIxID0gam9pbnQucmVsYXRpdmVBbmNob3JQb2ludDE7XHJcbiAgICB0aGlzLnIyID0gam9pbnQucmVsYXRpdmVBbmNob3JQb2ludDI7XHJcbiAgICB0aGlzLmwxID0gdGhpcy5iMS5saW5lYXJWZWxvY2l0eTtcclxuICAgIHRoaXMubDIgPSB0aGlzLmIyLmxpbmVhclZlbG9jaXR5O1xyXG4gICAgdGhpcy5hMSA9IHRoaXMuYjEuYW5ndWxhclZlbG9jaXR5O1xyXG4gICAgdGhpcy5hMiA9IHRoaXMuYjIuYW5ndWxhclZlbG9jaXR5O1xyXG4gICAgdGhpcy5pMSA9IHRoaXMuYjEuaW52ZXJzZUluZXJ0aWE7XHJcbiAgICB0aGlzLmkyID0gdGhpcy5iMi5pbnZlcnNlSW5lcnRpYTtcclxuICAgIHRoaXMubGltaXRJbXB1bHNlID0gMDtcclxuICAgIHRoaXMubW90b3JJbXB1bHNlID0gMDtcclxuICB9XHJcblxyXG4gIE9iamVjdC5hc3NpZ24oVHJhbnNsYXRpb25hbENvbnN0cmFpbnQucHJvdG90eXBlLCB7XHJcblxyXG4gICAgVHJhbnNsYXRpb25hbENvbnN0cmFpbnQ6IHRydWUsXHJcblxyXG4gICAgcHJlU29sdmU6IGZ1bmN0aW9uICh0aW1lU3RlcCwgaW52VGltZVN0ZXApIHtcclxuICAgICAgdGhpcy5heCA9IHRoaXMubGltaXRNb3Rvci5heGlzLng7XHJcbiAgICAgIHRoaXMuYXkgPSB0aGlzLmxpbWl0TW90b3IuYXhpcy55O1xyXG4gICAgICB0aGlzLmF6ID0gdGhpcy5saW1pdE1vdG9yLmF4aXMuejtcclxuICAgICAgdGhpcy5sb3dlckxpbWl0ID0gdGhpcy5saW1pdE1vdG9yLmxvd2VyTGltaXQ7XHJcbiAgICAgIHRoaXMudXBwZXJMaW1pdCA9IHRoaXMubGltaXRNb3Rvci51cHBlckxpbWl0O1xyXG4gICAgICB0aGlzLm1vdG9yU3BlZWQgPSB0aGlzLmxpbWl0TW90b3IubW90b3JTcGVlZDtcclxuICAgICAgdGhpcy5tYXhNb3RvckZvcmNlID0gdGhpcy5saW1pdE1vdG9yLm1heE1vdG9yRm9yY2U7XHJcbiAgICAgIHRoaXMuZW5hYmxlTW90b3IgPSB0aGlzLm1heE1vdG9yRm9yY2UgPiAwO1xyXG4gICAgICB0aGlzLm0xID0gdGhpcy5iMS5pbnZlcnNlTWFzcztcclxuICAgICAgdGhpcy5tMiA9IHRoaXMuYjIuaW52ZXJzZU1hc3M7XHJcblxyXG4gICAgICB2YXIgdGkxID0gdGhpcy5pMS5lbGVtZW50cztcclxuICAgICAgdmFyIHRpMiA9IHRoaXMuaTIuZWxlbWVudHM7XHJcbiAgICAgIHRoaXMuaTFlMDAgPSB0aTFbMF07XHJcbiAgICAgIHRoaXMuaTFlMDEgPSB0aTFbMV07XHJcbiAgICAgIHRoaXMuaTFlMDIgPSB0aTFbMl07XHJcbiAgICAgIHRoaXMuaTFlMTAgPSB0aTFbM107XHJcbiAgICAgIHRoaXMuaTFlMTEgPSB0aTFbNF07XHJcbiAgICAgIHRoaXMuaTFlMTIgPSB0aTFbNV07XHJcbiAgICAgIHRoaXMuaTFlMjAgPSB0aTFbNl07XHJcbiAgICAgIHRoaXMuaTFlMjEgPSB0aTFbN107XHJcbiAgICAgIHRoaXMuaTFlMjIgPSB0aTFbOF07XHJcblxyXG4gICAgICB0aGlzLmkyZTAwID0gdGkyWzBdO1xyXG4gICAgICB0aGlzLmkyZTAxID0gdGkyWzFdO1xyXG4gICAgICB0aGlzLmkyZTAyID0gdGkyWzJdO1xyXG4gICAgICB0aGlzLmkyZTEwID0gdGkyWzNdO1xyXG4gICAgICB0aGlzLmkyZTExID0gdGkyWzRdO1xyXG4gICAgICB0aGlzLmkyZTEyID0gdGkyWzVdO1xyXG4gICAgICB0aGlzLmkyZTIwID0gdGkyWzZdO1xyXG4gICAgICB0aGlzLmkyZTIxID0gdGkyWzddO1xyXG4gICAgICB0aGlzLmkyZTIyID0gdGkyWzhdO1xyXG5cclxuICAgICAgdmFyIGR4ID0gdGhpcy5wMi54IC0gdGhpcy5wMS54O1xyXG4gICAgICB2YXIgZHkgPSB0aGlzLnAyLnkgLSB0aGlzLnAxLnk7XHJcbiAgICAgIHZhciBkeiA9IHRoaXMucDIueiAtIHRoaXMucDEuejtcclxuICAgICAgdmFyIGQgPSBkeCAqIHRoaXMuYXggKyBkeSAqIHRoaXMuYXkgKyBkeiAqIHRoaXMuYXo7XHJcbiAgICAgIHZhciBmcmVxdWVuY3kgPSB0aGlzLmxpbWl0TW90b3IuZnJlcXVlbmN5O1xyXG4gICAgICB2YXIgZW5hYmxlU3ByaW5nID0gZnJlcXVlbmN5ID4gMDtcclxuICAgICAgdmFyIGVuYWJsZUxpbWl0ID0gdGhpcy5sb3dlckxpbWl0IDw9IHRoaXMudXBwZXJMaW1pdDtcclxuICAgICAgaWYgKGVuYWJsZVNwcmluZyAmJiBkID4gMjAgfHwgZCA8IC0yMCkge1xyXG4gICAgICAgIGVuYWJsZVNwcmluZyA9IGZhbHNlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoZW5hYmxlTGltaXQpIHtcclxuICAgICAgICBpZiAodGhpcy5sb3dlckxpbWl0ID09IHRoaXMudXBwZXJMaW1pdCkge1xyXG4gICAgICAgICAgaWYgKHRoaXMubGltaXRTdGF0ZSAhPSAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMubGltaXRTdGF0ZSA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMubGltaXRJbXB1bHNlID0gMDtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHRoaXMubGltaXRWZWxvY2l0eSA9IHRoaXMubG93ZXJMaW1pdCAtIGQ7XHJcbiAgICAgICAgICBpZiAoIWVuYWJsZVNwcmluZykgZCA9IHRoaXMubG93ZXJMaW1pdDtcclxuICAgICAgICB9IGVsc2UgaWYgKGQgPCB0aGlzLmxvd2VyTGltaXQpIHtcclxuICAgICAgICAgIGlmICh0aGlzLmxpbWl0U3RhdGUgIT0gLTEpIHtcclxuICAgICAgICAgICAgdGhpcy5saW1pdFN0YXRlID0gLTE7XHJcbiAgICAgICAgICAgIHRoaXMubGltaXRJbXB1bHNlID0gMDtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHRoaXMubGltaXRWZWxvY2l0eSA9IHRoaXMubG93ZXJMaW1pdCAtIGQ7XHJcbiAgICAgICAgICBpZiAoIWVuYWJsZVNwcmluZykgZCA9IHRoaXMubG93ZXJMaW1pdDtcclxuICAgICAgICB9IGVsc2UgaWYgKGQgPiB0aGlzLnVwcGVyTGltaXQpIHtcclxuICAgICAgICAgIGlmICh0aGlzLmxpbWl0U3RhdGUgIT0gMSkge1xyXG4gICAgICAgICAgICB0aGlzLmxpbWl0U3RhdGUgPSAxO1xyXG4gICAgICAgICAgICB0aGlzLmxpbWl0SW1wdWxzZSA9IDA7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICB0aGlzLmxpbWl0VmVsb2NpdHkgPSB0aGlzLnVwcGVyTGltaXQgLSBkO1xyXG4gICAgICAgICAgaWYgKCFlbmFibGVTcHJpbmcpIGQgPSB0aGlzLnVwcGVyTGltaXQ7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHRoaXMubGltaXRTdGF0ZSA9IDI7XHJcbiAgICAgICAgICB0aGlzLmxpbWl0SW1wdWxzZSA9IDA7XHJcbiAgICAgICAgICB0aGlzLmxpbWl0VmVsb2NpdHkgPSAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIWVuYWJsZVNwcmluZykge1xyXG4gICAgICAgICAgaWYgKHRoaXMubGltaXRWZWxvY2l0eSA+IDAuMDA1KSB0aGlzLmxpbWl0VmVsb2NpdHkgLT0gMC4wMDU7XHJcbiAgICAgICAgICBlbHNlIGlmICh0aGlzLmxpbWl0VmVsb2NpdHkgPCAtMC4wMDUpIHRoaXMubGltaXRWZWxvY2l0eSArPSAwLjAwNTtcclxuICAgICAgICAgIGVsc2UgdGhpcy5saW1pdFZlbG9jaXR5ID0gMDtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5saW1pdFN0YXRlID0gMjtcclxuICAgICAgICB0aGlzLmxpbWl0SW1wdWxzZSA9IDA7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICh0aGlzLmVuYWJsZU1vdG9yICYmICh0aGlzLmxpbWl0U3RhdGUgIT0gMCB8fCBlbmFibGVTcHJpbmcpKSB7XHJcbiAgICAgICAgdGhpcy5tYXhNb3RvckltcHVsc2UgPSB0aGlzLm1heE1vdG9yRm9yY2UgKiB0aW1lU3RlcDtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLm1vdG9ySW1wdWxzZSA9IDA7XHJcbiAgICAgICAgdGhpcy5tYXhNb3RvckltcHVsc2UgPSAwO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB2YXIgcmR4ID0gZCAqIHRoaXMuYXg7XHJcbiAgICAgIHZhciByZHkgPSBkICogdGhpcy5heTtcclxuICAgICAgdmFyIHJkeiA9IGQgKiB0aGlzLmF6O1xyXG4gICAgICB2YXIgdzEgPSB0aGlzLm0xIC8gKHRoaXMubTEgKyB0aGlzLm0yKTtcclxuICAgICAgdmFyIHcyID0gMSAtIHcxO1xyXG4gICAgICB0aGlzLnIxeCA9IHRoaXMucjEueCArIHJkeCAqIHcxO1xyXG4gICAgICB0aGlzLnIxeSA9IHRoaXMucjEueSArIHJkeSAqIHcxO1xyXG4gICAgICB0aGlzLnIxeiA9IHRoaXMucjEueiArIHJkeiAqIHcxO1xyXG4gICAgICB0aGlzLnIyeCA9IHRoaXMucjIueCAtIHJkeCAqIHcyO1xyXG4gICAgICB0aGlzLnIyeSA9IHRoaXMucjIueSAtIHJkeSAqIHcyO1xyXG4gICAgICB0aGlzLnIyeiA9IHRoaXMucjIueiAtIHJkeiAqIHcyO1xyXG5cclxuICAgICAgdGhpcy50MXggPSB0aGlzLnIxeSAqIHRoaXMuYXogLSB0aGlzLnIxeiAqIHRoaXMuYXk7XHJcbiAgICAgIHRoaXMudDF5ID0gdGhpcy5yMXogKiB0aGlzLmF4IC0gdGhpcy5yMXggKiB0aGlzLmF6O1xyXG4gICAgICB0aGlzLnQxeiA9IHRoaXMucjF4ICogdGhpcy5heSAtIHRoaXMucjF5ICogdGhpcy5heDtcclxuICAgICAgdGhpcy50MnggPSB0aGlzLnIyeSAqIHRoaXMuYXogLSB0aGlzLnIyeiAqIHRoaXMuYXk7XHJcbiAgICAgIHRoaXMudDJ5ID0gdGhpcy5yMnogKiB0aGlzLmF4IC0gdGhpcy5yMnggKiB0aGlzLmF6O1xyXG4gICAgICB0aGlzLnQyeiA9IHRoaXMucjJ4ICogdGhpcy5heSAtIHRoaXMucjJ5ICogdGhpcy5heDtcclxuICAgICAgdGhpcy5sMXggPSB0aGlzLmF4ICogdGhpcy5tMTtcclxuICAgICAgdGhpcy5sMXkgPSB0aGlzLmF5ICogdGhpcy5tMTtcclxuICAgICAgdGhpcy5sMXogPSB0aGlzLmF6ICogdGhpcy5tMTtcclxuICAgICAgdGhpcy5sMnggPSB0aGlzLmF4ICogdGhpcy5tMjtcclxuICAgICAgdGhpcy5sMnkgPSB0aGlzLmF5ICogdGhpcy5tMjtcclxuICAgICAgdGhpcy5sMnogPSB0aGlzLmF6ICogdGhpcy5tMjtcclxuICAgICAgdGhpcy5hMXggPSB0aGlzLnQxeCAqIHRoaXMuaTFlMDAgKyB0aGlzLnQxeSAqIHRoaXMuaTFlMDEgKyB0aGlzLnQxeiAqIHRoaXMuaTFlMDI7XHJcbiAgICAgIHRoaXMuYTF5ID0gdGhpcy50MXggKiB0aGlzLmkxZTEwICsgdGhpcy50MXkgKiB0aGlzLmkxZTExICsgdGhpcy50MXogKiB0aGlzLmkxZTEyO1xyXG4gICAgICB0aGlzLmExeiA9IHRoaXMudDF4ICogdGhpcy5pMWUyMCArIHRoaXMudDF5ICogdGhpcy5pMWUyMSArIHRoaXMudDF6ICogdGhpcy5pMWUyMjtcclxuICAgICAgdGhpcy5hMnggPSB0aGlzLnQyeCAqIHRoaXMuaTJlMDAgKyB0aGlzLnQyeSAqIHRoaXMuaTJlMDEgKyB0aGlzLnQyeiAqIHRoaXMuaTJlMDI7XHJcbiAgICAgIHRoaXMuYTJ5ID0gdGhpcy50MnggKiB0aGlzLmkyZTEwICsgdGhpcy50MnkgKiB0aGlzLmkyZTExICsgdGhpcy50MnogKiB0aGlzLmkyZTEyO1xyXG4gICAgICB0aGlzLmEyeiA9IHRoaXMudDJ4ICogdGhpcy5pMmUyMCArIHRoaXMudDJ5ICogdGhpcy5pMmUyMSArIHRoaXMudDJ6ICogdGhpcy5pMmUyMjtcclxuICAgICAgdGhpcy5tb3RvckRlbm9tID1cclxuICAgICAgICB0aGlzLm0xICsgdGhpcy5tMiArXHJcbiAgICAgICAgdGhpcy5heCAqICh0aGlzLmExeSAqIHRoaXMucjF6IC0gdGhpcy5hMXogKiB0aGlzLnIxeSArIHRoaXMuYTJ5ICogdGhpcy5yMnogLSB0aGlzLmEyeiAqIHRoaXMucjJ5KSArXHJcbiAgICAgICAgdGhpcy5heSAqICh0aGlzLmExeiAqIHRoaXMucjF4IC0gdGhpcy5hMXggKiB0aGlzLnIxeiArIHRoaXMuYTJ6ICogdGhpcy5yMnggLSB0aGlzLmEyeCAqIHRoaXMucjJ6KSArXHJcbiAgICAgICAgdGhpcy5heiAqICh0aGlzLmExeCAqIHRoaXMucjF5IC0gdGhpcy5hMXkgKiB0aGlzLnIxeCArIHRoaXMuYTJ4ICogdGhpcy5yMnkgLSB0aGlzLmEyeSAqIHRoaXMucjJ4KTtcclxuXHJcbiAgICAgIHRoaXMuaW52TW90b3JEZW5vbSA9IDEgLyB0aGlzLm1vdG9yRGVub207XHJcblxyXG4gICAgICBpZiAoZW5hYmxlU3ByaW5nICYmIHRoaXMubGltaXRTdGF0ZSAhPSAyKSB7XHJcbiAgICAgICAgdmFyIG9tZWdhID0gNi4yODMxODUzICogZnJlcXVlbmN5O1xyXG4gICAgICAgIHZhciBrID0gb21lZ2EgKiBvbWVnYSAqIHRpbWVTdGVwO1xyXG4gICAgICAgIHZhciBkbXAgPSBpbnZUaW1lU3RlcCAvIChrICsgMiAqIHRoaXMubGltaXRNb3Rvci5kYW1waW5nUmF0aW8gKiBvbWVnYSk7XHJcbiAgICAgICAgdGhpcy5jZm0gPSB0aGlzLm1vdG9yRGVub20gKiBkbXA7XHJcbiAgICAgICAgdGhpcy5saW1pdFZlbG9jaXR5ICo9IGsgKiBkbXA7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5jZm0gPSAwO1xyXG4gICAgICAgIHRoaXMubGltaXRWZWxvY2l0eSAqPSBpbnZUaW1lU3RlcCAqIDAuMDU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMuaW52RGVub20gPSAxIC8gKHRoaXMubW90b3JEZW5vbSArIHRoaXMuY2ZtKTtcclxuXHJcbiAgICAgIHZhciB0b3RhbEltcHVsc2UgPSB0aGlzLmxpbWl0SW1wdWxzZSArIHRoaXMubW90b3JJbXB1bHNlO1xyXG4gICAgICB0aGlzLmwxLnggKz0gdG90YWxJbXB1bHNlICogdGhpcy5sMXg7XHJcbiAgICAgIHRoaXMubDEueSArPSB0b3RhbEltcHVsc2UgKiB0aGlzLmwxeTtcclxuICAgICAgdGhpcy5sMS56ICs9IHRvdGFsSW1wdWxzZSAqIHRoaXMubDF6O1xyXG4gICAgICB0aGlzLmExLnggKz0gdG90YWxJbXB1bHNlICogdGhpcy5hMXg7XHJcbiAgICAgIHRoaXMuYTEueSArPSB0b3RhbEltcHVsc2UgKiB0aGlzLmExeTtcclxuICAgICAgdGhpcy5hMS56ICs9IHRvdGFsSW1wdWxzZSAqIHRoaXMuYTF6O1xyXG4gICAgICB0aGlzLmwyLnggLT0gdG90YWxJbXB1bHNlICogdGhpcy5sMng7XHJcbiAgICAgIHRoaXMubDIueSAtPSB0b3RhbEltcHVsc2UgKiB0aGlzLmwyeTtcclxuICAgICAgdGhpcy5sMi56IC09IHRvdGFsSW1wdWxzZSAqIHRoaXMubDJ6O1xyXG4gICAgICB0aGlzLmEyLnggLT0gdG90YWxJbXB1bHNlICogdGhpcy5hMng7XHJcbiAgICAgIHRoaXMuYTIueSAtPSB0b3RhbEltcHVsc2UgKiB0aGlzLmEyeTtcclxuICAgICAgdGhpcy5hMi56IC09IHRvdGFsSW1wdWxzZSAqIHRoaXMuYTJ6O1xyXG4gICAgfSxcclxuICAgIHNvbHZlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHZhciBydm4gPVxyXG4gICAgICAgIHRoaXMuYXggKiAodGhpcy5sMi54IC0gdGhpcy5sMS54KSArIHRoaXMuYXkgKiAodGhpcy5sMi55IC0gdGhpcy5sMS55KSArIHRoaXMuYXogKiAodGhpcy5sMi56IC0gdGhpcy5sMS56KSArXHJcbiAgICAgICAgdGhpcy50MnggKiB0aGlzLmEyLnggLSB0aGlzLnQxeCAqIHRoaXMuYTEueCArIHRoaXMudDJ5ICogdGhpcy5hMi55IC0gdGhpcy50MXkgKiB0aGlzLmExLnkgKyB0aGlzLnQyeiAqIHRoaXMuYTIueiAtIHRoaXMudDF6ICogdGhpcy5hMS56O1xyXG5cclxuICAgICAgLy8gbW90b3IgcGFydFxyXG4gICAgICB2YXIgbmV3TW90b3JJbXB1bHNlO1xyXG4gICAgICBpZiAodGhpcy5lbmFibGVNb3Rvcikge1xyXG4gICAgICAgIG5ld01vdG9ySW1wdWxzZSA9IChydm4gLSB0aGlzLm1vdG9yU3BlZWQpICogdGhpcy5pbnZNb3RvckRlbm9tO1xyXG4gICAgICAgIHZhciBvbGRNb3RvckltcHVsc2UgPSB0aGlzLm1vdG9ySW1wdWxzZTtcclxuICAgICAgICB0aGlzLm1vdG9ySW1wdWxzZSArPSBuZXdNb3RvckltcHVsc2U7XHJcbiAgICAgICAgaWYgKHRoaXMubW90b3JJbXB1bHNlID4gdGhpcy5tYXhNb3RvckltcHVsc2UpIHRoaXMubW90b3JJbXB1bHNlID0gdGhpcy5tYXhNb3RvckltcHVsc2U7XHJcbiAgICAgICAgZWxzZSBpZiAodGhpcy5tb3RvckltcHVsc2UgPCAtdGhpcy5tYXhNb3RvckltcHVsc2UpIHRoaXMubW90b3JJbXB1bHNlID0gLXRoaXMubWF4TW90b3JJbXB1bHNlO1xyXG4gICAgICAgIG5ld01vdG9ySW1wdWxzZSA9IHRoaXMubW90b3JJbXB1bHNlIC0gb2xkTW90b3JJbXB1bHNlO1xyXG4gICAgICAgIHJ2biAtPSBuZXdNb3RvckltcHVsc2UgKiB0aGlzLm1vdG9yRGVub207XHJcbiAgICAgIH0gZWxzZSBuZXdNb3RvckltcHVsc2UgPSAwO1xyXG5cclxuICAgICAgLy8gbGltaXQgcGFydFxyXG4gICAgICB2YXIgbmV3TGltaXRJbXB1bHNlO1xyXG4gICAgICBpZiAodGhpcy5saW1pdFN0YXRlICE9IDIpIHtcclxuICAgICAgICBuZXdMaW1pdEltcHVsc2UgPSAocnZuIC0gdGhpcy5saW1pdFZlbG9jaXR5IC0gdGhpcy5saW1pdEltcHVsc2UgKiB0aGlzLmNmbSkgKiB0aGlzLmludkRlbm9tO1xyXG4gICAgICAgIHZhciBvbGRMaW1pdEltcHVsc2UgPSB0aGlzLmxpbWl0SW1wdWxzZTtcclxuICAgICAgICB0aGlzLmxpbWl0SW1wdWxzZSArPSBuZXdMaW1pdEltcHVsc2U7XHJcbiAgICAgICAgaWYgKHRoaXMubGltaXRJbXB1bHNlICogdGhpcy5saW1pdFN0YXRlIDwgMCkgdGhpcy5saW1pdEltcHVsc2UgPSAwO1xyXG4gICAgICAgIG5ld0xpbWl0SW1wdWxzZSA9IHRoaXMubGltaXRJbXB1bHNlIC0gb2xkTGltaXRJbXB1bHNlO1xyXG4gICAgICB9IGVsc2UgbmV3TGltaXRJbXB1bHNlID0gMDtcclxuXHJcbiAgICAgIHZhciB0b3RhbEltcHVsc2UgPSBuZXdMaW1pdEltcHVsc2UgKyBuZXdNb3RvckltcHVsc2U7XHJcbiAgICAgIHRoaXMubDEueCArPSB0b3RhbEltcHVsc2UgKiB0aGlzLmwxeDtcclxuICAgICAgdGhpcy5sMS55ICs9IHRvdGFsSW1wdWxzZSAqIHRoaXMubDF5O1xyXG4gICAgICB0aGlzLmwxLnogKz0gdG90YWxJbXB1bHNlICogdGhpcy5sMXo7XHJcbiAgICAgIHRoaXMuYTEueCArPSB0b3RhbEltcHVsc2UgKiB0aGlzLmExeDtcclxuICAgICAgdGhpcy5hMS55ICs9IHRvdGFsSW1wdWxzZSAqIHRoaXMuYTF5O1xyXG4gICAgICB0aGlzLmExLnogKz0gdG90YWxJbXB1bHNlICogdGhpcy5hMXo7XHJcbiAgICAgIHRoaXMubDIueCAtPSB0b3RhbEltcHVsc2UgKiB0aGlzLmwyeDtcclxuICAgICAgdGhpcy5sMi55IC09IHRvdGFsSW1wdWxzZSAqIHRoaXMubDJ5O1xyXG4gICAgICB0aGlzLmwyLnogLT0gdG90YWxJbXB1bHNlICogdGhpcy5sMno7XHJcbiAgICAgIHRoaXMuYTIueCAtPSB0b3RhbEltcHVsc2UgKiB0aGlzLmEyeDtcclxuICAgICAgdGhpcy5hMi55IC09IHRvdGFsSW1wdWxzZSAqIHRoaXMuYTJ5O1xyXG4gICAgICB0aGlzLmEyLnogLT0gdG90YWxJbXB1bHNlICogdGhpcy5hMno7XHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG4gIC8qKlxyXG4gICAqIEEgZGlzdGFuY2Ugam9pbnQgbGltaXRzIHRoZSBkaXN0YW5jZSBiZXR3ZWVuIHR3byBhbmNob3IgcG9pbnRzIG9uIHJpZ2lkIGJvZGllcy5cclxuICAgKlxyXG4gICAqIEBhdXRob3Igc2FoYXJhblxyXG4gICAqIEBhdXRob3IgbG8tdGhcclxuICAgKi9cclxuXHJcbiAgZnVuY3Rpb24gRGlzdGFuY2VKb2ludChjb25maWcsIG1pbkRpc3RhbmNlLCBtYXhEaXN0YW5jZSkge1xyXG5cclxuICAgIEpvaW50LmNhbGwodGhpcywgY29uZmlnKTtcclxuXHJcbiAgICB0aGlzLnR5cGUgPSBKT0lOVF9ESVNUQU5DRTtcclxuXHJcbiAgICB0aGlzLm5vciA9IG5ldyBWZWMzKCk7XHJcblxyXG4gICAgLy8gVGhlIGxpbWl0IGFuZCBtb3RvciBpbmZvcm1hdGlvbiBvZiB0aGUgam9pbnQuXHJcbiAgICB0aGlzLmxpbWl0TW90b3IgPSBuZXcgTGltaXRNb3Rvcih0aGlzLm5vciwgdHJ1ZSk7XHJcbiAgICB0aGlzLmxpbWl0TW90b3IubG93ZXJMaW1pdCA9IG1pbkRpc3RhbmNlO1xyXG4gICAgdGhpcy5saW1pdE1vdG9yLnVwcGVyTGltaXQgPSBtYXhEaXN0YW5jZTtcclxuXHJcbiAgICB0aGlzLnQgPSBuZXcgVHJhbnNsYXRpb25hbENvbnN0cmFpbnQodGhpcywgdGhpcy5saW1pdE1vdG9yKTtcclxuXHJcbiAgfVxyXG4gIERpc3RhbmNlSm9pbnQucHJvdG90eXBlID0gT2JqZWN0LmFzc2lnbihPYmplY3QuY3JlYXRlKEpvaW50LnByb3RvdHlwZSksIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcjogRGlzdGFuY2VKb2ludCxcclxuXHJcbiAgICBwcmVTb2x2ZTogZnVuY3Rpb24gKHRpbWVTdGVwLCBpbnZUaW1lU3RlcCkge1xyXG5cclxuICAgICAgdGhpcy51cGRhdGVBbmNob3JQb2ludHMoKTtcclxuXHJcbiAgICAgIHRoaXMubm9yLnN1Yih0aGlzLmFuY2hvclBvaW50MiwgdGhpcy5hbmNob3JQb2ludDEpLm5vcm1hbGl6ZSgpO1xyXG5cclxuICAgICAgLy8gcHJlU29sdmVcclxuXHJcbiAgICAgIHRoaXMudC5wcmVTb2x2ZSh0aW1lU3RlcCwgaW52VGltZVN0ZXApO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgc29sdmU6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgIHRoaXMudC5zb2x2ZSgpO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgcG9zdFNvbHZlOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgfVxyXG5cclxuICB9KTtcclxuXHJcbiAgLyoqXHJcbiAgKiBBbiBhbmd1bGFyIGNvbnN0cmFpbnQgZm9yIGFsbCBheGVzIGZvciB2YXJpb3VzIGpvaW50cy5cclxuICAqIEBhdXRob3Igc2FoYXJhblxyXG4gICovXHJcblxyXG4gIGZ1bmN0aW9uIEFuZ3VsYXJDb25zdHJhaW50KGpvaW50LCB0YXJnZXRPcmllbnRhdGlvbikge1xyXG5cclxuICAgIHRoaXMuam9pbnQgPSBqb2ludDtcclxuXHJcbiAgICB0aGlzLnRhcmdldE9yaWVudGF0aW9uID0gbmV3IFF1YXQoKS5pbnZlcnQodGFyZ2V0T3JpZW50YXRpb24pO1xyXG5cclxuICAgIHRoaXMucmVsYXRpdmVPcmllbnRhdGlvbiA9IG5ldyBRdWF0KCk7XHJcblxyXG4gICAgdGhpcy5paTEgPSBudWxsO1xyXG4gICAgdGhpcy5paTIgPSBudWxsO1xyXG4gICAgdGhpcy5kZCA9IG51bGw7XHJcblxyXG4gICAgdGhpcy52ZWwgPSBuZXcgVmVjMygpO1xyXG4gICAgdGhpcy5pbXAgPSBuZXcgVmVjMygpO1xyXG5cclxuICAgIHRoaXMucm4wID0gbmV3IFZlYzMoKTtcclxuICAgIHRoaXMucm4xID0gbmV3IFZlYzMoKTtcclxuICAgIHRoaXMucm4yID0gbmV3IFZlYzMoKTtcclxuXHJcbiAgICB0aGlzLmIxID0gam9pbnQuYm9keTE7XHJcbiAgICB0aGlzLmIyID0gam9pbnQuYm9keTI7XHJcbiAgICB0aGlzLmExID0gdGhpcy5iMS5hbmd1bGFyVmVsb2NpdHk7XHJcbiAgICB0aGlzLmEyID0gdGhpcy5iMi5hbmd1bGFyVmVsb2NpdHk7XHJcbiAgICB0aGlzLmkxID0gdGhpcy5iMS5pbnZlcnNlSW5lcnRpYTtcclxuICAgIHRoaXMuaTIgPSB0aGlzLmIyLmludmVyc2VJbmVydGlhO1xyXG5cclxuICB9XHJcbiAgT2JqZWN0LmFzc2lnbihBbmd1bGFyQ29uc3RyYWludC5wcm90b3R5cGUsIHtcclxuXHJcbiAgICBBbmd1bGFyQ29uc3RyYWludDogdHJ1ZSxcclxuXHJcbiAgICBwcmVTb2x2ZTogZnVuY3Rpb24gKHRpbWVTdGVwLCBpbnZUaW1lU3RlcCkge1xyXG5cclxuICAgICAgdmFyIGludiwgbGVuLCB2O1xyXG5cclxuICAgICAgdGhpcy5paTEgPSB0aGlzLmkxLmNsb25lKCk7XHJcbiAgICAgIHRoaXMuaWkyID0gdGhpcy5pMi5jbG9uZSgpO1xyXG5cclxuICAgICAgdiA9IG5ldyBNYXQzMygpLmFkZCh0aGlzLmlpMSwgdGhpcy5paTIpLmVsZW1lbnRzO1xyXG4gICAgICBpbnYgPSAxIC8gKHZbMF0gKiAodls0XSAqIHZbOF0gLSB2WzddICogdls1XSkgKyB2WzNdICogKHZbN10gKiB2WzJdIC0gdlsxXSAqIHZbOF0pICsgdls2XSAqICh2WzFdICogdls1XSAtIHZbNF0gKiB2WzJdKSk7XHJcbiAgICAgIHRoaXMuZGQgPSBuZXcgTWF0MzMoKS5zZXQoXHJcbiAgICAgICAgdls0XSAqIHZbOF0gLSB2WzVdICogdls3XSwgdlsyXSAqIHZbN10gLSB2WzFdICogdls4XSwgdlsxXSAqIHZbNV0gLSB2WzJdICogdls0XSxcclxuICAgICAgICB2WzVdICogdls2XSAtIHZbM10gKiB2WzhdLCB2WzBdICogdls4XSAtIHZbMl0gKiB2WzZdLCB2WzJdICogdlszXSAtIHZbMF0gKiB2WzVdLFxyXG4gICAgICAgIHZbM10gKiB2WzddIC0gdls0XSAqIHZbNl0sIHZbMV0gKiB2WzZdIC0gdlswXSAqIHZbN10sIHZbMF0gKiB2WzRdIC0gdlsxXSAqIHZbM11cclxuICAgICAgKS5tdWx0aXBseVNjYWxhcihpbnYpO1xyXG5cclxuICAgICAgdGhpcy5yZWxhdGl2ZU9yaWVudGF0aW9uLmludmVydCh0aGlzLmIxLm9yaWVudGF0aW9uKS5tdWx0aXBseSh0aGlzLnRhcmdldE9yaWVudGF0aW9uKS5tdWx0aXBseSh0aGlzLmIyLm9yaWVudGF0aW9uKTtcclxuXHJcbiAgICAgIGludiA9IHRoaXMucmVsYXRpdmVPcmllbnRhdGlvbi53ICogMjtcclxuXHJcbiAgICAgIHRoaXMudmVsLmNvcHkodGhpcy5yZWxhdGl2ZU9yaWVudGF0aW9uKS5tdWx0aXBseVNjYWxhcihpbnYpO1xyXG5cclxuICAgICAgbGVuID0gdGhpcy52ZWwubGVuZ3RoKCk7XHJcblxyXG4gICAgICBpZiAobGVuID4gMC4wMikge1xyXG4gICAgICAgIGxlbiA9ICgwLjAyIC0gbGVuKSAvIGxlbiAqIGludlRpbWVTdGVwICogMC4wNTtcclxuICAgICAgICB0aGlzLnZlbC5tdWx0aXBseVNjYWxhcihsZW4pO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMudmVsLnNldCgwLCAwLCAwKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5ybjEuY29weSh0aGlzLmltcCkuYXBwbHlNYXRyaXgzKHRoaXMuaWkxLCB0cnVlKTtcclxuICAgICAgdGhpcy5ybjIuY29weSh0aGlzLmltcCkuYXBwbHlNYXRyaXgzKHRoaXMuaWkyLCB0cnVlKTtcclxuXHJcbiAgICAgIHRoaXMuYTEuYWRkKHRoaXMucm4xKTtcclxuICAgICAgdGhpcy5hMi5zdWIodGhpcy5ybjIpO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgc29sdmU6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgIHZhciByID0gdGhpcy5hMi5jbG9uZSgpLnN1Yih0aGlzLmExKS5zdWIodGhpcy52ZWwpO1xyXG5cclxuICAgICAgdGhpcy5ybjAuY29weShyKS5hcHBseU1hdHJpeDModGhpcy5kZCwgdHJ1ZSk7XHJcbiAgICAgIHRoaXMucm4xLmNvcHkodGhpcy5ybjApLmFwcGx5TWF0cml4Myh0aGlzLmlpMSwgdHJ1ZSk7XHJcbiAgICAgIHRoaXMucm4yLmNvcHkodGhpcy5ybjApLmFwcGx5TWF0cml4Myh0aGlzLmlpMiwgdHJ1ZSk7XHJcblxyXG4gICAgICB0aGlzLmltcC5hZGQodGhpcy5ybjApO1xyXG4gICAgICB0aGlzLmExLmFkZCh0aGlzLnJuMSk7XHJcbiAgICAgIHRoaXMuYTIuc3ViKHRoaXMucm4yKTtcclxuXHJcbiAgICB9XHJcblxyXG4gIH0pO1xyXG5cclxuICAvKipcclxuICAqIEEgdGhyZWUtYXhpcyB0cmFuc2xhdGlvbmFsIGNvbnN0cmFpbnQgZm9yIHZhcmlvdXMgam9pbnRzLlxyXG4gICogQGF1dGhvciBzYWhhcmFuXHJcbiAgKi9cclxuICBmdW5jdGlvbiBUcmFuc2xhdGlvbmFsM0NvbnN0cmFpbnQoam9pbnQsIGxpbWl0TW90b3IxLCBsaW1pdE1vdG9yMiwgbGltaXRNb3RvcjMpIHtcclxuXHJcbiAgICB0aGlzLm0xID0gTmFOO1xyXG4gICAgdGhpcy5tMiA9IE5hTjtcclxuICAgIHRoaXMuaTFlMDAgPSBOYU47XHJcbiAgICB0aGlzLmkxZTAxID0gTmFOO1xyXG4gICAgdGhpcy5pMWUwMiA9IE5hTjtcclxuICAgIHRoaXMuaTFlMTAgPSBOYU47XHJcbiAgICB0aGlzLmkxZTExID0gTmFOO1xyXG4gICAgdGhpcy5pMWUxMiA9IE5hTjtcclxuICAgIHRoaXMuaTFlMjAgPSBOYU47XHJcbiAgICB0aGlzLmkxZTIxID0gTmFOO1xyXG4gICAgdGhpcy5pMWUyMiA9IE5hTjtcclxuICAgIHRoaXMuaTJlMDAgPSBOYU47XHJcbiAgICB0aGlzLmkyZTAxID0gTmFOO1xyXG4gICAgdGhpcy5pMmUwMiA9IE5hTjtcclxuICAgIHRoaXMuaTJlMTAgPSBOYU47XHJcbiAgICB0aGlzLmkyZTExID0gTmFOO1xyXG4gICAgdGhpcy5pMmUxMiA9IE5hTjtcclxuICAgIHRoaXMuaTJlMjAgPSBOYU47XHJcbiAgICB0aGlzLmkyZTIxID0gTmFOO1xyXG4gICAgdGhpcy5pMmUyMiA9IE5hTjtcclxuICAgIHRoaXMuYXgxID0gTmFOO1xyXG4gICAgdGhpcy5heTEgPSBOYU47XHJcbiAgICB0aGlzLmF6MSA9IE5hTjtcclxuICAgIHRoaXMuYXgyID0gTmFOO1xyXG4gICAgdGhpcy5heTIgPSBOYU47XHJcbiAgICB0aGlzLmF6MiA9IE5hTjtcclxuICAgIHRoaXMuYXgzID0gTmFOO1xyXG4gICAgdGhpcy5heTMgPSBOYU47XHJcbiAgICB0aGlzLmF6MyA9IE5hTjtcclxuICAgIHRoaXMucjF4ID0gTmFOO1xyXG4gICAgdGhpcy5yMXkgPSBOYU47XHJcbiAgICB0aGlzLnIxeiA9IE5hTjtcclxuICAgIHRoaXMucjJ4ID0gTmFOO1xyXG4gICAgdGhpcy5yMnkgPSBOYU47XHJcbiAgICB0aGlzLnIyeiA9IE5hTjtcclxuICAgIHRoaXMudDF4MSA9IE5hTjsvLyBqYWNvYmlhbnNcclxuICAgIHRoaXMudDF5MSA9IE5hTjtcclxuICAgIHRoaXMudDF6MSA9IE5hTjtcclxuICAgIHRoaXMudDJ4MSA9IE5hTjtcclxuICAgIHRoaXMudDJ5MSA9IE5hTjtcclxuICAgIHRoaXMudDJ6MSA9IE5hTjtcclxuICAgIHRoaXMubDF4MSA9IE5hTjtcclxuICAgIHRoaXMubDF5MSA9IE5hTjtcclxuICAgIHRoaXMubDF6MSA9IE5hTjtcclxuICAgIHRoaXMubDJ4MSA9IE5hTjtcclxuICAgIHRoaXMubDJ5MSA9IE5hTjtcclxuICAgIHRoaXMubDJ6MSA9IE5hTjtcclxuICAgIHRoaXMuYTF4MSA9IE5hTjtcclxuICAgIHRoaXMuYTF5MSA9IE5hTjtcclxuICAgIHRoaXMuYTF6MSA9IE5hTjtcclxuICAgIHRoaXMuYTJ4MSA9IE5hTjtcclxuICAgIHRoaXMuYTJ5MSA9IE5hTjtcclxuICAgIHRoaXMuYTJ6MSA9IE5hTjtcclxuICAgIHRoaXMudDF4MiA9IE5hTjtcclxuICAgIHRoaXMudDF5MiA9IE5hTjtcclxuICAgIHRoaXMudDF6MiA9IE5hTjtcclxuICAgIHRoaXMudDJ4MiA9IE5hTjtcclxuICAgIHRoaXMudDJ5MiA9IE5hTjtcclxuICAgIHRoaXMudDJ6MiA9IE5hTjtcclxuICAgIHRoaXMubDF4MiA9IE5hTjtcclxuICAgIHRoaXMubDF5MiA9IE5hTjtcclxuICAgIHRoaXMubDF6MiA9IE5hTjtcclxuICAgIHRoaXMubDJ4MiA9IE5hTjtcclxuICAgIHRoaXMubDJ5MiA9IE5hTjtcclxuICAgIHRoaXMubDJ6MiA9IE5hTjtcclxuICAgIHRoaXMuYTF4MiA9IE5hTjtcclxuICAgIHRoaXMuYTF5MiA9IE5hTjtcclxuICAgIHRoaXMuYTF6MiA9IE5hTjtcclxuICAgIHRoaXMuYTJ4MiA9IE5hTjtcclxuICAgIHRoaXMuYTJ5MiA9IE5hTjtcclxuICAgIHRoaXMuYTJ6MiA9IE5hTjtcclxuICAgIHRoaXMudDF4MyA9IE5hTjtcclxuICAgIHRoaXMudDF5MyA9IE5hTjtcclxuICAgIHRoaXMudDF6MyA9IE5hTjtcclxuICAgIHRoaXMudDJ4MyA9IE5hTjtcclxuICAgIHRoaXMudDJ5MyA9IE5hTjtcclxuICAgIHRoaXMudDJ6MyA9IE5hTjtcclxuICAgIHRoaXMubDF4MyA9IE5hTjtcclxuICAgIHRoaXMubDF5MyA9IE5hTjtcclxuICAgIHRoaXMubDF6MyA9IE5hTjtcclxuICAgIHRoaXMubDJ4MyA9IE5hTjtcclxuICAgIHRoaXMubDJ5MyA9IE5hTjtcclxuICAgIHRoaXMubDJ6MyA9IE5hTjtcclxuICAgIHRoaXMuYTF4MyA9IE5hTjtcclxuICAgIHRoaXMuYTF5MyA9IE5hTjtcclxuICAgIHRoaXMuYTF6MyA9IE5hTjtcclxuICAgIHRoaXMuYTJ4MyA9IE5hTjtcclxuICAgIHRoaXMuYTJ5MyA9IE5hTjtcclxuICAgIHRoaXMuYTJ6MyA9IE5hTjtcclxuICAgIHRoaXMubG93ZXJMaW1pdDEgPSBOYU47XHJcbiAgICB0aGlzLnVwcGVyTGltaXQxID0gTmFOO1xyXG4gICAgdGhpcy5saW1pdFZlbG9jaXR5MSA9IE5hTjtcclxuICAgIHRoaXMubGltaXRTdGF0ZTEgPSAwOyAvLyAtMTogYXQgbG93ZXIsIDA6IGxvY2tlZCwgMTogYXQgdXBwZXIsIDI6IHVubGltaXRlZFxyXG4gICAgdGhpcy5lbmFibGVNb3RvcjEgPSBmYWxzZTtcclxuICAgIHRoaXMubW90b3JTcGVlZDEgPSBOYU47XHJcbiAgICB0aGlzLm1heE1vdG9yRm9yY2UxID0gTmFOO1xyXG4gICAgdGhpcy5tYXhNb3RvckltcHVsc2UxID0gTmFOO1xyXG4gICAgdGhpcy5sb3dlckxpbWl0MiA9IE5hTjtcclxuICAgIHRoaXMudXBwZXJMaW1pdDIgPSBOYU47XHJcbiAgICB0aGlzLmxpbWl0VmVsb2NpdHkyID0gTmFOO1xyXG4gICAgdGhpcy5saW1pdFN0YXRlMiA9IDA7IC8vIC0xOiBhdCBsb3dlciwgMDogbG9ja2VkLCAxOiBhdCB1cHBlciwgMjogdW5saW1pdGVkXHJcbiAgICB0aGlzLmVuYWJsZU1vdG9yMiA9IGZhbHNlO1xyXG4gICAgdGhpcy5tb3RvclNwZWVkMiA9IE5hTjtcclxuICAgIHRoaXMubWF4TW90b3JGb3JjZTIgPSBOYU47XHJcbiAgICB0aGlzLm1heE1vdG9ySW1wdWxzZTIgPSBOYU47XHJcbiAgICB0aGlzLmxvd2VyTGltaXQzID0gTmFOO1xyXG4gICAgdGhpcy51cHBlckxpbWl0MyA9IE5hTjtcclxuICAgIHRoaXMubGltaXRWZWxvY2l0eTMgPSBOYU47XHJcbiAgICB0aGlzLmxpbWl0U3RhdGUzID0gMDsgLy8gLTE6IGF0IGxvd2VyLCAwOiBsb2NrZWQsIDE6IGF0IHVwcGVyLCAyOiB1bmxpbWl0ZWRcclxuICAgIHRoaXMuZW5hYmxlTW90b3IzID0gZmFsc2U7XHJcbiAgICB0aGlzLm1vdG9yU3BlZWQzID0gTmFOO1xyXG4gICAgdGhpcy5tYXhNb3RvckZvcmNlMyA9IE5hTjtcclxuICAgIHRoaXMubWF4TW90b3JJbXB1bHNlMyA9IE5hTjtcclxuICAgIHRoaXMuazAwID0gTmFOOyAvLyBLID0gSipNKkpUXHJcbiAgICB0aGlzLmswMSA9IE5hTjtcclxuICAgIHRoaXMuazAyID0gTmFOO1xyXG4gICAgdGhpcy5rMTAgPSBOYU47XHJcbiAgICB0aGlzLmsxMSA9IE5hTjtcclxuICAgIHRoaXMuazEyID0gTmFOO1xyXG4gICAgdGhpcy5rMjAgPSBOYU47XHJcbiAgICB0aGlzLmsyMSA9IE5hTjtcclxuICAgIHRoaXMuazIyID0gTmFOO1xyXG4gICAgdGhpcy5rdjAwID0gTmFOOyAvLyBkaWFnb25hbHMgd2l0aG91dCBDRk1zXHJcbiAgICB0aGlzLmt2MTEgPSBOYU47XHJcbiAgICB0aGlzLmt2MjIgPSBOYU47XHJcbiAgICB0aGlzLmR2MDAgPSBOYU47IC8vIC4uLmludmVydGVkXHJcbiAgICB0aGlzLmR2MTEgPSBOYU47XHJcbiAgICB0aGlzLmR2MjIgPSBOYU47XHJcbiAgICB0aGlzLmQwMCA9IE5hTjsgLy8gS14tMVxyXG4gICAgdGhpcy5kMDEgPSBOYU47XHJcbiAgICB0aGlzLmQwMiA9IE5hTjtcclxuICAgIHRoaXMuZDEwID0gTmFOO1xyXG4gICAgdGhpcy5kMTEgPSBOYU47XHJcbiAgICB0aGlzLmQxMiA9IE5hTjtcclxuICAgIHRoaXMuZDIwID0gTmFOO1xyXG4gICAgdGhpcy5kMjEgPSBOYU47XHJcbiAgICB0aGlzLmQyMiA9IE5hTjtcclxuXHJcbiAgICB0aGlzLmxpbWl0TW90b3IxID0gbGltaXRNb3RvcjE7XHJcbiAgICB0aGlzLmxpbWl0TW90b3IyID0gbGltaXRNb3RvcjI7XHJcbiAgICB0aGlzLmxpbWl0TW90b3IzID0gbGltaXRNb3RvcjM7XHJcbiAgICB0aGlzLmIxID0gam9pbnQuYm9keTE7XHJcbiAgICB0aGlzLmIyID0gam9pbnQuYm9keTI7XHJcbiAgICB0aGlzLnAxID0gam9pbnQuYW5jaG9yUG9pbnQxO1xyXG4gICAgdGhpcy5wMiA9IGpvaW50LmFuY2hvclBvaW50MjtcclxuICAgIHRoaXMucjEgPSBqb2ludC5yZWxhdGl2ZUFuY2hvclBvaW50MTtcclxuICAgIHRoaXMucjIgPSBqb2ludC5yZWxhdGl2ZUFuY2hvclBvaW50MjtcclxuICAgIHRoaXMubDEgPSB0aGlzLmIxLmxpbmVhclZlbG9jaXR5O1xyXG4gICAgdGhpcy5sMiA9IHRoaXMuYjIubGluZWFyVmVsb2NpdHk7XHJcbiAgICB0aGlzLmExID0gdGhpcy5iMS5hbmd1bGFyVmVsb2NpdHk7XHJcbiAgICB0aGlzLmEyID0gdGhpcy5iMi5hbmd1bGFyVmVsb2NpdHk7XHJcbiAgICB0aGlzLmkxID0gdGhpcy5iMS5pbnZlcnNlSW5lcnRpYTtcclxuICAgIHRoaXMuaTIgPSB0aGlzLmIyLmludmVyc2VJbmVydGlhO1xyXG4gICAgdGhpcy5saW1pdEltcHVsc2UxID0gMDtcclxuICAgIHRoaXMubW90b3JJbXB1bHNlMSA9IDA7XHJcbiAgICB0aGlzLmxpbWl0SW1wdWxzZTIgPSAwO1xyXG4gICAgdGhpcy5tb3RvckltcHVsc2UyID0gMDtcclxuICAgIHRoaXMubGltaXRJbXB1bHNlMyA9IDA7XHJcbiAgICB0aGlzLm1vdG9ySW1wdWxzZTMgPSAwO1xyXG4gICAgdGhpcy5jZm0xID0gMDsvLyBDb25zdHJhaW50IEZvcmNlIE1peGluZ1xyXG4gICAgdGhpcy5jZm0yID0gMDtcclxuICAgIHRoaXMuY2ZtMyA9IDA7XHJcbiAgICB0aGlzLndlaWdodCA9IC0xO1xyXG4gIH1cclxuXHJcbiAgT2JqZWN0LmFzc2lnbihUcmFuc2xhdGlvbmFsM0NvbnN0cmFpbnQucHJvdG90eXBlLCB7XHJcblxyXG4gICAgVHJhbnNsYXRpb25hbDNDb25zdHJhaW50OiB0cnVlLFxyXG5cclxuICAgIHByZVNvbHZlOiBmdW5jdGlvbiAodGltZVN0ZXAsIGludlRpbWVTdGVwKSB7XHJcbiAgICAgIHRoaXMuYXgxID0gdGhpcy5saW1pdE1vdG9yMS5heGlzLng7XHJcbiAgICAgIHRoaXMuYXkxID0gdGhpcy5saW1pdE1vdG9yMS5heGlzLnk7XHJcbiAgICAgIHRoaXMuYXoxID0gdGhpcy5saW1pdE1vdG9yMS5heGlzLno7XHJcbiAgICAgIHRoaXMuYXgyID0gdGhpcy5saW1pdE1vdG9yMi5heGlzLng7XHJcbiAgICAgIHRoaXMuYXkyID0gdGhpcy5saW1pdE1vdG9yMi5heGlzLnk7XHJcbiAgICAgIHRoaXMuYXoyID0gdGhpcy5saW1pdE1vdG9yMi5heGlzLno7XHJcbiAgICAgIHRoaXMuYXgzID0gdGhpcy5saW1pdE1vdG9yMy5heGlzLng7XHJcbiAgICAgIHRoaXMuYXkzID0gdGhpcy5saW1pdE1vdG9yMy5heGlzLnk7XHJcbiAgICAgIHRoaXMuYXozID0gdGhpcy5saW1pdE1vdG9yMy5heGlzLno7XHJcbiAgICAgIHRoaXMubG93ZXJMaW1pdDEgPSB0aGlzLmxpbWl0TW90b3IxLmxvd2VyTGltaXQ7XHJcbiAgICAgIHRoaXMudXBwZXJMaW1pdDEgPSB0aGlzLmxpbWl0TW90b3IxLnVwcGVyTGltaXQ7XHJcbiAgICAgIHRoaXMubW90b3JTcGVlZDEgPSB0aGlzLmxpbWl0TW90b3IxLm1vdG9yU3BlZWQ7XHJcbiAgICAgIHRoaXMubWF4TW90b3JGb3JjZTEgPSB0aGlzLmxpbWl0TW90b3IxLm1heE1vdG9yRm9yY2U7XHJcbiAgICAgIHRoaXMuZW5hYmxlTW90b3IxID0gdGhpcy5tYXhNb3RvckZvcmNlMSA+IDA7XHJcbiAgICAgIHRoaXMubG93ZXJMaW1pdDIgPSB0aGlzLmxpbWl0TW90b3IyLmxvd2VyTGltaXQ7XHJcbiAgICAgIHRoaXMudXBwZXJMaW1pdDIgPSB0aGlzLmxpbWl0TW90b3IyLnVwcGVyTGltaXQ7XHJcbiAgICAgIHRoaXMubW90b3JTcGVlZDIgPSB0aGlzLmxpbWl0TW90b3IyLm1vdG9yU3BlZWQ7XHJcbiAgICAgIHRoaXMubWF4TW90b3JGb3JjZTIgPSB0aGlzLmxpbWl0TW90b3IyLm1heE1vdG9yRm9yY2U7XHJcbiAgICAgIHRoaXMuZW5hYmxlTW90b3IyID0gdGhpcy5tYXhNb3RvckZvcmNlMiA+IDA7XHJcbiAgICAgIHRoaXMubG93ZXJMaW1pdDMgPSB0aGlzLmxpbWl0TW90b3IzLmxvd2VyTGltaXQ7XHJcbiAgICAgIHRoaXMudXBwZXJMaW1pdDMgPSB0aGlzLmxpbWl0TW90b3IzLnVwcGVyTGltaXQ7XHJcbiAgICAgIHRoaXMubW90b3JTcGVlZDMgPSB0aGlzLmxpbWl0TW90b3IzLm1vdG9yU3BlZWQ7XHJcbiAgICAgIHRoaXMubWF4TW90b3JGb3JjZTMgPSB0aGlzLmxpbWl0TW90b3IzLm1heE1vdG9yRm9yY2U7XHJcbiAgICAgIHRoaXMuZW5hYmxlTW90b3IzID0gdGhpcy5tYXhNb3RvckZvcmNlMyA+IDA7XHJcbiAgICAgIHRoaXMubTEgPSB0aGlzLmIxLmludmVyc2VNYXNzO1xyXG4gICAgICB0aGlzLm0yID0gdGhpcy5iMi5pbnZlcnNlTWFzcztcclxuXHJcbiAgICAgIHZhciB0aTEgPSB0aGlzLmkxLmVsZW1lbnRzO1xyXG4gICAgICB2YXIgdGkyID0gdGhpcy5pMi5lbGVtZW50cztcclxuICAgICAgdGhpcy5pMWUwMCA9IHRpMVswXTtcclxuICAgICAgdGhpcy5pMWUwMSA9IHRpMVsxXTtcclxuICAgICAgdGhpcy5pMWUwMiA9IHRpMVsyXTtcclxuICAgICAgdGhpcy5pMWUxMCA9IHRpMVszXTtcclxuICAgICAgdGhpcy5pMWUxMSA9IHRpMVs0XTtcclxuICAgICAgdGhpcy5pMWUxMiA9IHRpMVs1XTtcclxuICAgICAgdGhpcy5pMWUyMCA9IHRpMVs2XTtcclxuICAgICAgdGhpcy5pMWUyMSA9IHRpMVs3XTtcclxuICAgICAgdGhpcy5pMWUyMiA9IHRpMVs4XTtcclxuXHJcbiAgICAgIHRoaXMuaTJlMDAgPSB0aTJbMF07XHJcbiAgICAgIHRoaXMuaTJlMDEgPSB0aTJbMV07XHJcbiAgICAgIHRoaXMuaTJlMDIgPSB0aTJbMl07XHJcbiAgICAgIHRoaXMuaTJlMTAgPSB0aTJbM107XHJcbiAgICAgIHRoaXMuaTJlMTEgPSB0aTJbNF07XHJcbiAgICAgIHRoaXMuaTJlMTIgPSB0aTJbNV07XHJcbiAgICAgIHRoaXMuaTJlMjAgPSB0aTJbNl07XHJcbiAgICAgIHRoaXMuaTJlMjEgPSB0aTJbN107XHJcbiAgICAgIHRoaXMuaTJlMjIgPSB0aTJbOF07XHJcblxyXG4gICAgICB2YXIgZHggPSB0aGlzLnAyLnggLSB0aGlzLnAxLng7XHJcbiAgICAgIHZhciBkeSA9IHRoaXMucDIueSAtIHRoaXMucDEueTtcclxuICAgICAgdmFyIGR6ID0gdGhpcy5wMi56IC0gdGhpcy5wMS56O1xyXG4gICAgICB2YXIgZDEgPSBkeCAqIHRoaXMuYXgxICsgZHkgKiB0aGlzLmF5MSArIGR6ICogdGhpcy5hejE7XHJcbiAgICAgIHZhciBkMiA9IGR4ICogdGhpcy5heDIgKyBkeSAqIHRoaXMuYXkyICsgZHogKiB0aGlzLmF6MjtcclxuICAgICAgdmFyIGQzID0gZHggKiB0aGlzLmF4MyArIGR5ICogdGhpcy5heTMgKyBkeiAqIHRoaXMuYXozO1xyXG4gICAgICB2YXIgZnJlcXVlbmN5MSA9IHRoaXMubGltaXRNb3RvcjEuZnJlcXVlbmN5O1xyXG4gICAgICB2YXIgZnJlcXVlbmN5MiA9IHRoaXMubGltaXRNb3RvcjIuZnJlcXVlbmN5O1xyXG4gICAgICB2YXIgZnJlcXVlbmN5MyA9IHRoaXMubGltaXRNb3RvcjMuZnJlcXVlbmN5O1xyXG4gICAgICB2YXIgZW5hYmxlU3ByaW5nMSA9IGZyZXF1ZW5jeTEgPiAwO1xyXG4gICAgICB2YXIgZW5hYmxlU3ByaW5nMiA9IGZyZXF1ZW5jeTIgPiAwO1xyXG4gICAgICB2YXIgZW5hYmxlU3ByaW5nMyA9IGZyZXF1ZW5jeTMgPiAwO1xyXG4gICAgICB2YXIgZW5hYmxlTGltaXQxID0gdGhpcy5sb3dlckxpbWl0MSA8PSB0aGlzLnVwcGVyTGltaXQxO1xyXG4gICAgICB2YXIgZW5hYmxlTGltaXQyID0gdGhpcy5sb3dlckxpbWl0MiA8PSB0aGlzLnVwcGVyTGltaXQyO1xyXG4gICAgICB2YXIgZW5hYmxlTGltaXQzID0gdGhpcy5sb3dlckxpbWl0MyA8PSB0aGlzLnVwcGVyTGltaXQzO1xyXG5cclxuICAgICAgLy8gZm9yIHN0YWJpbGl0eVxyXG4gICAgICBpZiAoZW5hYmxlU3ByaW5nMSAmJiBkMSA+IDIwIHx8IGQxIDwgLTIwKSB7XHJcbiAgICAgICAgZW5hYmxlU3ByaW5nMSA9IGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChlbmFibGVTcHJpbmcyICYmIGQyID4gMjAgfHwgZDIgPCAtMjApIHtcclxuICAgICAgICBlbmFibGVTcHJpbmcyID0gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGVuYWJsZVNwcmluZzMgJiYgZDMgPiAyMCB8fCBkMyA8IC0yMCkge1xyXG4gICAgICAgIGVuYWJsZVNwcmluZzMgPSBmYWxzZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGVuYWJsZUxpbWl0MSkge1xyXG4gICAgICAgIGlmICh0aGlzLmxvd2VyTGltaXQxID09IHRoaXMudXBwZXJMaW1pdDEpIHtcclxuICAgICAgICAgIGlmICh0aGlzLmxpbWl0U3RhdGUxICE9IDApIHtcclxuICAgICAgICAgICAgdGhpcy5saW1pdFN0YXRlMSA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMubGltaXRJbXB1bHNlMSA9IDA7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICB0aGlzLmxpbWl0VmVsb2NpdHkxID0gdGhpcy5sb3dlckxpbWl0MSAtIGQxO1xyXG4gICAgICAgICAgaWYgKCFlbmFibGVTcHJpbmcxKSBkMSA9IHRoaXMubG93ZXJMaW1pdDE7XHJcbiAgICAgICAgfSBlbHNlIGlmIChkMSA8IHRoaXMubG93ZXJMaW1pdDEpIHtcclxuICAgICAgICAgIGlmICh0aGlzLmxpbWl0U3RhdGUxICE9IC0xKSB7XHJcbiAgICAgICAgICAgIHRoaXMubGltaXRTdGF0ZTEgPSAtMTtcclxuICAgICAgICAgICAgdGhpcy5saW1pdEltcHVsc2UxID0gMDtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHRoaXMubGltaXRWZWxvY2l0eTEgPSB0aGlzLmxvd2VyTGltaXQxIC0gZDE7XHJcbiAgICAgICAgICBpZiAoIWVuYWJsZVNwcmluZzEpIGQxID0gdGhpcy5sb3dlckxpbWl0MTtcclxuICAgICAgICB9IGVsc2UgaWYgKGQxID4gdGhpcy51cHBlckxpbWl0MSkge1xyXG4gICAgICAgICAgaWYgKHRoaXMubGltaXRTdGF0ZTEgIT0gMSkge1xyXG4gICAgICAgICAgICB0aGlzLmxpbWl0U3RhdGUxID0gMTtcclxuICAgICAgICAgICAgdGhpcy5saW1pdEltcHVsc2UxID0gMDtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHRoaXMubGltaXRWZWxvY2l0eTEgPSB0aGlzLnVwcGVyTGltaXQxIC0gZDE7XHJcbiAgICAgICAgICBpZiAoIWVuYWJsZVNwcmluZzEpIGQxID0gdGhpcy51cHBlckxpbWl0MTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdGhpcy5saW1pdFN0YXRlMSA9IDI7XHJcbiAgICAgICAgICB0aGlzLmxpbWl0SW1wdWxzZTEgPSAwO1xyXG4gICAgICAgICAgdGhpcy5saW1pdFZlbG9jaXR5MSA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghZW5hYmxlU3ByaW5nMSkge1xyXG4gICAgICAgICAgaWYgKHRoaXMubGltaXRWZWxvY2l0eTEgPiAwLjAwNSkgdGhpcy5saW1pdFZlbG9jaXR5MSAtPSAwLjAwNTtcclxuICAgICAgICAgIGVsc2UgaWYgKHRoaXMubGltaXRWZWxvY2l0eTEgPCAtMC4wMDUpIHRoaXMubGltaXRWZWxvY2l0eTEgKz0gMC4wMDU7XHJcbiAgICAgICAgICBlbHNlIHRoaXMubGltaXRWZWxvY2l0eTEgPSAwO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLmxpbWl0U3RhdGUxID0gMjtcclxuICAgICAgICB0aGlzLmxpbWl0SW1wdWxzZTEgPSAwO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoZW5hYmxlTGltaXQyKSB7XHJcbiAgICAgICAgaWYgKHRoaXMubG93ZXJMaW1pdDIgPT0gdGhpcy51cHBlckxpbWl0Mikge1xyXG4gICAgICAgICAgaWYgKHRoaXMubGltaXRTdGF0ZTIgIT0gMCkge1xyXG4gICAgICAgICAgICB0aGlzLmxpbWl0U3RhdGUyID0gMDtcclxuICAgICAgICAgICAgdGhpcy5saW1pdEltcHVsc2UyID0gMDtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHRoaXMubGltaXRWZWxvY2l0eTIgPSB0aGlzLmxvd2VyTGltaXQyIC0gZDI7XHJcbiAgICAgICAgICBpZiAoIWVuYWJsZVNwcmluZzIpIGQyID0gdGhpcy5sb3dlckxpbWl0MjtcclxuICAgICAgICB9IGVsc2UgaWYgKGQyIDwgdGhpcy5sb3dlckxpbWl0Mikge1xyXG4gICAgICAgICAgaWYgKHRoaXMubGltaXRTdGF0ZTIgIT0gLTEpIHtcclxuICAgICAgICAgICAgdGhpcy5saW1pdFN0YXRlMiA9IC0xO1xyXG4gICAgICAgICAgICB0aGlzLmxpbWl0SW1wdWxzZTIgPSAwO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgdGhpcy5saW1pdFZlbG9jaXR5MiA9IHRoaXMubG93ZXJMaW1pdDIgLSBkMjtcclxuICAgICAgICAgIGlmICghZW5hYmxlU3ByaW5nMikgZDIgPSB0aGlzLmxvd2VyTGltaXQyO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZDIgPiB0aGlzLnVwcGVyTGltaXQyKSB7XHJcbiAgICAgICAgICBpZiAodGhpcy5saW1pdFN0YXRlMiAhPSAxKSB7XHJcbiAgICAgICAgICAgIHRoaXMubGltaXRTdGF0ZTIgPSAxO1xyXG4gICAgICAgICAgICB0aGlzLmxpbWl0SW1wdWxzZTIgPSAwO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgdGhpcy5saW1pdFZlbG9jaXR5MiA9IHRoaXMudXBwZXJMaW1pdDIgLSBkMjtcclxuICAgICAgICAgIGlmICghZW5hYmxlU3ByaW5nMikgZDIgPSB0aGlzLnVwcGVyTGltaXQyO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLmxpbWl0U3RhdGUyID0gMjtcclxuICAgICAgICAgIHRoaXMubGltaXRJbXB1bHNlMiA9IDA7XHJcbiAgICAgICAgICB0aGlzLmxpbWl0VmVsb2NpdHkyID0gMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFlbmFibGVTcHJpbmcyKSB7XHJcbiAgICAgICAgICBpZiAodGhpcy5saW1pdFZlbG9jaXR5MiA+IDAuMDA1KSB0aGlzLmxpbWl0VmVsb2NpdHkyIC09IDAuMDA1O1xyXG4gICAgICAgICAgZWxzZSBpZiAodGhpcy5saW1pdFZlbG9jaXR5MiA8IC0wLjAwNSkgdGhpcy5saW1pdFZlbG9jaXR5MiArPSAwLjAwNTtcclxuICAgICAgICAgIGVsc2UgdGhpcy5saW1pdFZlbG9jaXR5MiA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMubGltaXRTdGF0ZTIgPSAyO1xyXG4gICAgICAgIHRoaXMubGltaXRJbXB1bHNlMiA9IDA7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChlbmFibGVMaW1pdDMpIHtcclxuICAgICAgICBpZiAodGhpcy5sb3dlckxpbWl0MyA9PSB0aGlzLnVwcGVyTGltaXQzKSB7XHJcbiAgICAgICAgICBpZiAodGhpcy5saW1pdFN0YXRlMyAhPSAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMubGltaXRTdGF0ZTMgPSAwO1xyXG4gICAgICAgICAgICB0aGlzLmxpbWl0SW1wdWxzZTMgPSAwO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgdGhpcy5saW1pdFZlbG9jaXR5MyA9IHRoaXMubG93ZXJMaW1pdDMgLSBkMztcclxuICAgICAgICAgIGlmICghZW5hYmxlU3ByaW5nMykgZDMgPSB0aGlzLmxvd2VyTGltaXQzO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZDMgPCB0aGlzLmxvd2VyTGltaXQzKSB7XHJcbiAgICAgICAgICBpZiAodGhpcy5saW1pdFN0YXRlMyAhPSAtMSkge1xyXG4gICAgICAgICAgICB0aGlzLmxpbWl0U3RhdGUzID0gLTE7XHJcbiAgICAgICAgICAgIHRoaXMubGltaXRJbXB1bHNlMyA9IDA7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICB0aGlzLmxpbWl0VmVsb2NpdHkzID0gdGhpcy5sb3dlckxpbWl0MyAtIGQzO1xyXG4gICAgICAgICAgaWYgKCFlbmFibGVTcHJpbmczKSBkMyA9IHRoaXMubG93ZXJMaW1pdDM7XHJcbiAgICAgICAgfSBlbHNlIGlmIChkMyA+IHRoaXMudXBwZXJMaW1pdDMpIHtcclxuICAgICAgICAgIGlmICh0aGlzLmxpbWl0U3RhdGUzICE9IDEpIHtcclxuICAgICAgICAgICAgdGhpcy5saW1pdFN0YXRlMyA9IDE7XHJcbiAgICAgICAgICAgIHRoaXMubGltaXRJbXB1bHNlMyA9IDA7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICB0aGlzLmxpbWl0VmVsb2NpdHkzID0gdGhpcy51cHBlckxpbWl0MyAtIGQzO1xyXG4gICAgICAgICAgaWYgKCFlbmFibGVTcHJpbmczKSBkMyA9IHRoaXMudXBwZXJMaW1pdDM7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHRoaXMubGltaXRTdGF0ZTMgPSAyO1xyXG4gICAgICAgICAgdGhpcy5saW1pdEltcHVsc2UzID0gMDtcclxuICAgICAgICAgIHRoaXMubGltaXRWZWxvY2l0eTMgPSAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIWVuYWJsZVNwcmluZzMpIHtcclxuICAgICAgICAgIGlmICh0aGlzLmxpbWl0VmVsb2NpdHkzID4gMC4wMDUpIHRoaXMubGltaXRWZWxvY2l0eTMgLT0gMC4wMDU7XHJcbiAgICAgICAgICBlbHNlIGlmICh0aGlzLmxpbWl0VmVsb2NpdHkzIDwgLTAuMDA1KSB0aGlzLmxpbWl0VmVsb2NpdHkzICs9IDAuMDA1O1xyXG4gICAgICAgICAgZWxzZSB0aGlzLmxpbWl0VmVsb2NpdHkzID0gMDtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5saW1pdFN0YXRlMyA9IDI7XHJcbiAgICAgICAgdGhpcy5saW1pdEltcHVsc2UzID0gMDtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKHRoaXMuZW5hYmxlTW90b3IxICYmICh0aGlzLmxpbWl0U3RhdGUxICE9IDAgfHwgZW5hYmxlU3ByaW5nMSkpIHtcclxuICAgICAgICB0aGlzLm1heE1vdG9ySW1wdWxzZTEgPSB0aGlzLm1heE1vdG9yRm9yY2UxICogdGltZVN0ZXA7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5tb3RvckltcHVsc2UxID0gMDtcclxuICAgICAgICB0aGlzLm1heE1vdG9ySW1wdWxzZTEgPSAwO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAodGhpcy5lbmFibGVNb3RvcjIgJiYgKHRoaXMubGltaXRTdGF0ZTIgIT0gMCB8fCBlbmFibGVTcHJpbmcyKSkge1xyXG4gICAgICAgIHRoaXMubWF4TW90b3JJbXB1bHNlMiA9IHRoaXMubWF4TW90b3JGb3JjZTIgKiB0aW1lU3RlcDtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLm1vdG9ySW1wdWxzZTIgPSAwO1xyXG4gICAgICAgIHRoaXMubWF4TW90b3JJbXB1bHNlMiA9IDA7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICh0aGlzLmVuYWJsZU1vdG9yMyAmJiAodGhpcy5saW1pdFN0YXRlMyAhPSAwIHx8IGVuYWJsZVNwcmluZzMpKSB7XHJcbiAgICAgICAgdGhpcy5tYXhNb3RvckltcHVsc2UzID0gdGhpcy5tYXhNb3RvckZvcmNlMyAqIHRpbWVTdGVwO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMubW90b3JJbXB1bHNlMyA9IDA7XHJcbiAgICAgICAgdGhpcy5tYXhNb3RvckltcHVsc2UzID0gMDtcclxuICAgICAgfVxyXG5cclxuICAgICAgdmFyIHJkeCA9IGQxICogdGhpcy5heDEgKyBkMiAqIHRoaXMuYXgyICsgZDMgKiB0aGlzLmF4MjtcclxuICAgICAgdmFyIHJkeSA9IGQxICogdGhpcy5heTEgKyBkMiAqIHRoaXMuYXkyICsgZDMgKiB0aGlzLmF5MjtcclxuICAgICAgdmFyIHJkeiA9IGQxICogdGhpcy5hejEgKyBkMiAqIHRoaXMuYXoyICsgZDMgKiB0aGlzLmF6MjtcclxuICAgICAgdmFyIHcxID0gdGhpcy5tMiAvICh0aGlzLm0xICsgdGhpcy5tMik7XHJcbiAgICAgIGlmICh0aGlzLndlaWdodCA+PSAwKSB3MSA9IHRoaXMud2VpZ2h0OyAvLyB1c2UgZ2l2ZW4gd2VpZ2h0XHJcbiAgICAgIHZhciB3MiA9IDEgLSB3MTtcclxuICAgICAgdGhpcy5yMXggPSB0aGlzLnIxLnggKyByZHggKiB3MTtcclxuICAgICAgdGhpcy5yMXkgPSB0aGlzLnIxLnkgKyByZHkgKiB3MTtcclxuICAgICAgdGhpcy5yMXogPSB0aGlzLnIxLnogKyByZHogKiB3MTtcclxuICAgICAgdGhpcy5yMnggPSB0aGlzLnIyLnggLSByZHggKiB3MjtcclxuICAgICAgdGhpcy5yMnkgPSB0aGlzLnIyLnkgLSByZHkgKiB3MjtcclxuICAgICAgdGhpcy5yMnogPSB0aGlzLnIyLnogLSByZHogKiB3MjtcclxuXHJcbiAgICAgIC8vIGJ1aWxkIGphY29iaWFuc1xyXG4gICAgICB0aGlzLnQxeDEgPSB0aGlzLnIxeSAqIHRoaXMuYXoxIC0gdGhpcy5yMXogKiB0aGlzLmF5MTtcclxuICAgICAgdGhpcy50MXkxID0gdGhpcy5yMXogKiB0aGlzLmF4MSAtIHRoaXMucjF4ICogdGhpcy5hejE7XHJcbiAgICAgIHRoaXMudDF6MSA9IHRoaXMucjF4ICogdGhpcy5heTEgLSB0aGlzLnIxeSAqIHRoaXMuYXgxO1xyXG4gICAgICB0aGlzLnQyeDEgPSB0aGlzLnIyeSAqIHRoaXMuYXoxIC0gdGhpcy5yMnogKiB0aGlzLmF5MTtcclxuICAgICAgdGhpcy50MnkxID0gdGhpcy5yMnogKiB0aGlzLmF4MSAtIHRoaXMucjJ4ICogdGhpcy5hejE7XHJcbiAgICAgIHRoaXMudDJ6MSA9IHRoaXMucjJ4ICogdGhpcy5heTEgLSB0aGlzLnIyeSAqIHRoaXMuYXgxO1xyXG4gICAgICB0aGlzLmwxeDEgPSB0aGlzLmF4MSAqIHRoaXMubTE7XHJcbiAgICAgIHRoaXMubDF5MSA9IHRoaXMuYXkxICogdGhpcy5tMTtcclxuICAgICAgdGhpcy5sMXoxID0gdGhpcy5hejEgKiB0aGlzLm0xO1xyXG4gICAgICB0aGlzLmwyeDEgPSB0aGlzLmF4MSAqIHRoaXMubTI7XHJcbiAgICAgIHRoaXMubDJ5MSA9IHRoaXMuYXkxICogdGhpcy5tMjtcclxuICAgICAgdGhpcy5sMnoxID0gdGhpcy5hejEgKiB0aGlzLm0yO1xyXG4gICAgICB0aGlzLmExeDEgPSB0aGlzLnQxeDEgKiB0aGlzLmkxZTAwICsgdGhpcy50MXkxICogdGhpcy5pMWUwMSArIHRoaXMudDF6MSAqIHRoaXMuaTFlMDI7XHJcbiAgICAgIHRoaXMuYTF5MSA9IHRoaXMudDF4MSAqIHRoaXMuaTFlMTAgKyB0aGlzLnQxeTEgKiB0aGlzLmkxZTExICsgdGhpcy50MXoxICogdGhpcy5pMWUxMjtcclxuICAgICAgdGhpcy5hMXoxID0gdGhpcy50MXgxICogdGhpcy5pMWUyMCArIHRoaXMudDF5MSAqIHRoaXMuaTFlMjEgKyB0aGlzLnQxejEgKiB0aGlzLmkxZTIyO1xyXG4gICAgICB0aGlzLmEyeDEgPSB0aGlzLnQyeDEgKiB0aGlzLmkyZTAwICsgdGhpcy50MnkxICogdGhpcy5pMmUwMSArIHRoaXMudDJ6MSAqIHRoaXMuaTJlMDI7XHJcbiAgICAgIHRoaXMuYTJ5MSA9IHRoaXMudDJ4MSAqIHRoaXMuaTJlMTAgKyB0aGlzLnQyeTEgKiB0aGlzLmkyZTExICsgdGhpcy50MnoxICogdGhpcy5pMmUxMjtcclxuICAgICAgdGhpcy5hMnoxID0gdGhpcy50MngxICogdGhpcy5pMmUyMCArIHRoaXMudDJ5MSAqIHRoaXMuaTJlMjEgKyB0aGlzLnQyejEgKiB0aGlzLmkyZTIyO1xyXG5cclxuICAgICAgdGhpcy50MXgyID0gdGhpcy5yMXkgKiB0aGlzLmF6MiAtIHRoaXMucjF6ICogdGhpcy5heTI7XHJcbiAgICAgIHRoaXMudDF5MiA9IHRoaXMucjF6ICogdGhpcy5heDIgLSB0aGlzLnIxeCAqIHRoaXMuYXoyO1xyXG4gICAgICB0aGlzLnQxejIgPSB0aGlzLnIxeCAqIHRoaXMuYXkyIC0gdGhpcy5yMXkgKiB0aGlzLmF4MjtcclxuICAgICAgdGhpcy50MngyID0gdGhpcy5yMnkgKiB0aGlzLmF6MiAtIHRoaXMucjJ6ICogdGhpcy5heTI7XHJcbiAgICAgIHRoaXMudDJ5MiA9IHRoaXMucjJ6ICogdGhpcy5heDIgLSB0aGlzLnIyeCAqIHRoaXMuYXoyO1xyXG4gICAgICB0aGlzLnQyejIgPSB0aGlzLnIyeCAqIHRoaXMuYXkyIC0gdGhpcy5yMnkgKiB0aGlzLmF4MjtcclxuICAgICAgdGhpcy5sMXgyID0gdGhpcy5heDIgKiB0aGlzLm0xO1xyXG4gICAgICB0aGlzLmwxeTIgPSB0aGlzLmF5MiAqIHRoaXMubTE7XHJcbiAgICAgIHRoaXMubDF6MiA9IHRoaXMuYXoyICogdGhpcy5tMTtcclxuICAgICAgdGhpcy5sMngyID0gdGhpcy5heDIgKiB0aGlzLm0yO1xyXG4gICAgICB0aGlzLmwyeTIgPSB0aGlzLmF5MiAqIHRoaXMubTI7XHJcbiAgICAgIHRoaXMubDJ6MiA9IHRoaXMuYXoyICogdGhpcy5tMjtcclxuICAgICAgdGhpcy5hMXgyID0gdGhpcy50MXgyICogdGhpcy5pMWUwMCArIHRoaXMudDF5MiAqIHRoaXMuaTFlMDEgKyB0aGlzLnQxejIgKiB0aGlzLmkxZTAyO1xyXG4gICAgICB0aGlzLmExeTIgPSB0aGlzLnQxeDIgKiB0aGlzLmkxZTEwICsgdGhpcy50MXkyICogdGhpcy5pMWUxMSArIHRoaXMudDF6MiAqIHRoaXMuaTFlMTI7XHJcbiAgICAgIHRoaXMuYTF6MiA9IHRoaXMudDF4MiAqIHRoaXMuaTFlMjAgKyB0aGlzLnQxeTIgKiB0aGlzLmkxZTIxICsgdGhpcy50MXoyICogdGhpcy5pMWUyMjtcclxuICAgICAgdGhpcy5hMngyID0gdGhpcy50MngyICogdGhpcy5pMmUwMCArIHRoaXMudDJ5MiAqIHRoaXMuaTJlMDEgKyB0aGlzLnQyejIgKiB0aGlzLmkyZTAyO1xyXG4gICAgICB0aGlzLmEyeTIgPSB0aGlzLnQyeDIgKiB0aGlzLmkyZTEwICsgdGhpcy50MnkyICogdGhpcy5pMmUxMSArIHRoaXMudDJ6MiAqIHRoaXMuaTJlMTI7XHJcbiAgICAgIHRoaXMuYTJ6MiA9IHRoaXMudDJ4MiAqIHRoaXMuaTJlMjAgKyB0aGlzLnQyeTIgKiB0aGlzLmkyZTIxICsgdGhpcy50MnoyICogdGhpcy5pMmUyMjtcclxuXHJcbiAgICAgIHRoaXMudDF4MyA9IHRoaXMucjF5ICogdGhpcy5hejMgLSB0aGlzLnIxeiAqIHRoaXMuYXkzO1xyXG4gICAgICB0aGlzLnQxeTMgPSB0aGlzLnIxeiAqIHRoaXMuYXgzIC0gdGhpcy5yMXggKiB0aGlzLmF6MztcclxuICAgICAgdGhpcy50MXozID0gdGhpcy5yMXggKiB0aGlzLmF5MyAtIHRoaXMucjF5ICogdGhpcy5heDM7XHJcbiAgICAgIHRoaXMudDJ4MyA9IHRoaXMucjJ5ICogdGhpcy5hejMgLSB0aGlzLnIyeiAqIHRoaXMuYXkzO1xyXG4gICAgICB0aGlzLnQyeTMgPSB0aGlzLnIyeiAqIHRoaXMuYXgzIC0gdGhpcy5yMnggKiB0aGlzLmF6MztcclxuICAgICAgdGhpcy50MnozID0gdGhpcy5yMnggKiB0aGlzLmF5MyAtIHRoaXMucjJ5ICogdGhpcy5heDM7XHJcbiAgICAgIHRoaXMubDF4MyA9IHRoaXMuYXgzICogdGhpcy5tMTtcclxuICAgICAgdGhpcy5sMXkzID0gdGhpcy5heTMgKiB0aGlzLm0xO1xyXG4gICAgICB0aGlzLmwxejMgPSB0aGlzLmF6MyAqIHRoaXMubTE7XHJcbiAgICAgIHRoaXMubDJ4MyA9IHRoaXMuYXgzICogdGhpcy5tMjtcclxuICAgICAgdGhpcy5sMnkzID0gdGhpcy5heTMgKiB0aGlzLm0yO1xyXG4gICAgICB0aGlzLmwyejMgPSB0aGlzLmF6MyAqIHRoaXMubTI7XHJcbiAgICAgIHRoaXMuYTF4MyA9IHRoaXMudDF4MyAqIHRoaXMuaTFlMDAgKyB0aGlzLnQxeTMgKiB0aGlzLmkxZTAxICsgdGhpcy50MXozICogdGhpcy5pMWUwMjtcclxuICAgICAgdGhpcy5hMXkzID0gdGhpcy50MXgzICogdGhpcy5pMWUxMCArIHRoaXMudDF5MyAqIHRoaXMuaTFlMTEgKyB0aGlzLnQxejMgKiB0aGlzLmkxZTEyO1xyXG4gICAgICB0aGlzLmExejMgPSB0aGlzLnQxeDMgKiB0aGlzLmkxZTIwICsgdGhpcy50MXkzICogdGhpcy5pMWUyMSArIHRoaXMudDF6MyAqIHRoaXMuaTFlMjI7XHJcbiAgICAgIHRoaXMuYTJ4MyA9IHRoaXMudDJ4MyAqIHRoaXMuaTJlMDAgKyB0aGlzLnQyeTMgKiB0aGlzLmkyZTAxICsgdGhpcy50MnozICogdGhpcy5pMmUwMjtcclxuICAgICAgdGhpcy5hMnkzID0gdGhpcy50MngzICogdGhpcy5pMmUxMCArIHRoaXMudDJ5MyAqIHRoaXMuaTJlMTEgKyB0aGlzLnQyejMgKiB0aGlzLmkyZTEyO1xyXG4gICAgICB0aGlzLmEyejMgPSB0aGlzLnQyeDMgKiB0aGlzLmkyZTIwICsgdGhpcy50MnkzICogdGhpcy5pMmUyMSArIHRoaXMudDJ6MyAqIHRoaXMuaTJlMjI7XHJcblxyXG4gICAgICAvLyBidWlsZCBhbiBpbXB1bHNlIG1hdHJpeFxyXG4gICAgICB2YXIgbTEyID0gdGhpcy5tMSArIHRoaXMubTI7XHJcbiAgICAgIHRoaXMuazAwID0gKHRoaXMuYXgxICogdGhpcy5heDEgKyB0aGlzLmF5MSAqIHRoaXMuYXkxICsgdGhpcy5hejEgKiB0aGlzLmF6MSkgKiBtMTI7XHJcbiAgICAgIHRoaXMuazAxID0gKHRoaXMuYXgxICogdGhpcy5heDIgKyB0aGlzLmF5MSAqIHRoaXMuYXkyICsgdGhpcy5hejEgKiB0aGlzLmF6MikgKiBtMTI7XHJcbiAgICAgIHRoaXMuazAyID0gKHRoaXMuYXgxICogdGhpcy5heDMgKyB0aGlzLmF5MSAqIHRoaXMuYXkzICsgdGhpcy5hejEgKiB0aGlzLmF6MykgKiBtMTI7XHJcbiAgICAgIHRoaXMuazEwID0gKHRoaXMuYXgyICogdGhpcy5heDEgKyB0aGlzLmF5MiAqIHRoaXMuYXkxICsgdGhpcy5hejIgKiB0aGlzLmF6MSkgKiBtMTI7XHJcbiAgICAgIHRoaXMuazExID0gKHRoaXMuYXgyICogdGhpcy5heDIgKyB0aGlzLmF5MiAqIHRoaXMuYXkyICsgdGhpcy5hejIgKiB0aGlzLmF6MikgKiBtMTI7XHJcbiAgICAgIHRoaXMuazEyID0gKHRoaXMuYXgyICogdGhpcy5heDMgKyB0aGlzLmF5MiAqIHRoaXMuYXkzICsgdGhpcy5hejIgKiB0aGlzLmF6MykgKiBtMTI7XHJcbiAgICAgIHRoaXMuazIwID0gKHRoaXMuYXgzICogdGhpcy5heDEgKyB0aGlzLmF5MyAqIHRoaXMuYXkxICsgdGhpcy5hejMgKiB0aGlzLmF6MSkgKiBtMTI7XHJcbiAgICAgIHRoaXMuazIxID0gKHRoaXMuYXgzICogdGhpcy5heDIgKyB0aGlzLmF5MyAqIHRoaXMuYXkyICsgdGhpcy5hejMgKiB0aGlzLmF6MikgKiBtMTI7XHJcbiAgICAgIHRoaXMuazIyID0gKHRoaXMuYXgzICogdGhpcy5heDMgKyB0aGlzLmF5MyAqIHRoaXMuYXkzICsgdGhpcy5hejMgKiB0aGlzLmF6MykgKiBtMTI7XHJcblxyXG4gICAgICB0aGlzLmswMCArPSB0aGlzLnQxeDEgKiB0aGlzLmExeDEgKyB0aGlzLnQxeTEgKiB0aGlzLmExeTEgKyB0aGlzLnQxejEgKiB0aGlzLmExejE7XHJcbiAgICAgIHRoaXMuazAxICs9IHRoaXMudDF4MSAqIHRoaXMuYTF4MiArIHRoaXMudDF5MSAqIHRoaXMuYTF5MiArIHRoaXMudDF6MSAqIHRoaXMuYTF6MjtcclxuICAgICAgdGhpcy5rMDIgKz0gdGhpcy50MXgxICogdGhpcy5hMXgzICsgdGhpcy50MXkxICogdGhpcy5hMXkzICsgdGhpcy50MXoxICogdGhpcy5hMXozO1xyXG4gICAgICB0aGlzLmsxMCArPSB0aGlzLnQxeDIgKiB0aGlzLmExeDEgKyB0aGlzLnQxeTIgKiB0aGlzLmExeTEgKyB0aGlzLnQxejIgKiB0aGlzLmExejE7XHJcbiAgICAgIHRoaXMuazExICs9IHRoaXMudDF4MiAqIHRoaXMuYTF4MiArIHRoaXMudDF5MiAqIHRoaXMuYTF5MiArIHRoaXMudDF6MiAqIHRoaXMuYTF6MjtcclxuICAgICAgdGhpcy5rMTIgKz0gdGhpcy50MXgyICogdGhpcy5hMXgzICsgdGhpcy50MXkyICogdGhpcy5hMXkzICsgdGhpcy50MXoyICogdGhpcy5hMXozO1xyXG4gICAgICB0aGlzLmsyMCArPSB0aGlzLnQxeDMgKiB0aGlzLmExeDEgKyB0aGlzLnQxeTMgKiB0aGlzLmExeTEgKyB0aGlzLnQxejMgKiB0aGlzLmExejE7XHJcbiAgICAgIHRoaXMuazIxICs9IHRoaXMudDF4MyAqIHRoaXMuYTF4MiArIHRoaXMudDF5MyAqIHRoaXMuYTF5MiArIHRoaXMudDF6MyAqIHRoaXMuYTF6MjtcclxuICAgICAgdGhpcy5rMjIgKz0gdGhpcy50MXgzICogdGhpcy5hMXgzICsgdGhpcy50MXkzICogdGhpcy5hMXkzICsgdGhpcy50MXozICogdGhpcy5hMXozO1xyXG5cclxuICAgICAgdGhpcy5rMDAgKz0gdGhpcy50MngxICogdGhpcy5hMngxICsgdGhpcy50MnkxICogdGhpcy5hMnkxICsgdGhpcy50MnoxICogdGhpcy5hMnoxO1xyXG4gICAgICB0aGlzLmswMSArPSB0aGlzLnQyeDEgKiB0aGlzLmEyeDIgKyB0aGlzLnQyeTEgKiB0aGlzLmEyeTIgKyB0aGlzLnQyejEgKiB0aGlzLmEyejI7XHJcbiAgICAgIHRoaXMuazAyICs9IHRoaXMudDJ4MSAqIHRoaXMuYTJ4MyArIHRoaXMudDJ5MSAqIHRoaXMuYTJ5MyArIHRoaXMudDJ6MSAqIHRoaXMuYTJ6MztcclxuICAgICAgdGhpcy5rMTAgKz0gdGhpcy50MngyICogdGhpcy5hMngxICsgdGhpcy50MnkyICogdGhpcy5hMnkxICsgdGhpcy50MnoyICogdGhpcy5hMnoxO1xyXG4gICAgICB0aGlzLmsxMSArPSB0aGlzLnQyeDIgKiB0aGlzLmEyeDIgKyB0aGlzLnQyeTIgKiB0aGlzLmEyeTIgKyB0aGlzLnQyejIgKiB0aGlzLmEyejI7XHJcbiAgICAgIHRoaXMuazEyICs9IHRoaXMudDJ4MiAqIHRoaXMuYTJ4MyArIHRoaXMudDJ5MiAqIHRoaXMuYTJ5MyArIHRoaXMudDJ6MiAqIHRoaXMuYTJ6MztcclxuICAgICAgdGhpcy5rMjAgKz0gdGhpcy50MngzICogdGhpcy5hMngxICsgdGhpcy50MnkzICogdGhpcy5hMnkxICsgdGhpcy50MnozICogdGhpcy5hMnoxO1xyXG4gICAgICB0aGlzLmsyMSArPSB0aGlzLnQyeDMgKiB0aGlzLmEyeDIgKyB0aGlzLnQyeTMgKiB0aGlzLmEyeTIgKyB0aGlzLnQyejMgKiB0aGlzLmEyejI7XHJcbiAgICAgIHRoaXMuazIyICs9IHRoaXMudDJ4MyAqIHRoaXMuYTJ4MyArIHRoaXMudDJ5MyAqIHRoaXMuYTJ5MyArIHRoaXMudDJ6MyAqIHRoaXMuYTJ6MztcclxuXHJcbiAgICAgIHRoaXMua3YwMCA9IHRoaXMuazAwO1xyXG4gICAgICB0aGlzLmt2MTEgPSB0aGlzLmsxMTtcclxuICAgICAgdGhpcy5rdjIyID0gdGhpcy5rMjI7XHJcblxyXG4gICAgICB0aGlzLmR2MDAgPSAxIC8gdGhpcy5rdjAwO1xyXG4gICAgICB0aGlzLmR2MTEgPSAxIC8gdGhpcy5rdjExO1xyXG4gICAgICB0aGlzLmR2MjIgPSAxIC8gdGhpcy5rdjIyO1xyXG5cclxuICAgICAgaWYgKGVuYWJsZVNwcmluZzEgJiYgdGhpcy5saW1pdFN0YXRlMSAhPSAyKSB7XHJcbiAgICAgICAgdmFyIG9tZWdhID0gNi4yODMxODUzICogZnJlcXVlbmN5MTtcclxuICAgICAgICB2YXIgayA9IG9tZWdhICogb21lZ2EgKiB0aW1lU3RlcDtcclxuICAgICAgICB2YXIgZG1wID0gaW52VGltZVN0ZXAgLyAoayArIDIgKiB0aGlzLmxpbWl0TW90b3IxLmRhbXBpbmdSYXRpbyAqIG9tZWdhKTtcclxuICAgICAgICB0aGlzLmNmbTEgPSB0aGlzLmt2MDAgKiBkbXA7XHJcbiAgICAgICAgdGhpcy5saW1pdFZlbG9jaXR5MSAqPSBrICogZG1wO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuY2ZtMSA9IDA7XHJcbiAgICAgICAgdGhpcy5saW1pdFZlbG9jaXR5MSAqPSBpbnZUaW1lU3RlcCAqIDAuMDU7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGVuYWJsZVNwcmluZzIgJiYgdGhpcy5saW1pdFN0YXRlMiAhPSAyKSB7XHJcbiAgICAgICAgb21lZ2EgPSA2LjI4MzE4NTMgKiBmcmVxdWVuY3kyO1xyXG4gICAgICAgIGsgPSBvbWVnYSAqIG9tZWdhICogdGltZVN0ZXA7XHJcbiAgICAgICAgZG1wID0gaW52VGltZVN0ZXAgLyAoayArIDIgKiB0aGlzLmxpbWl0TW90b3IyLmRhbXBpbmdSYXRpbyAqIG9tZWdhKTtcclxuICAgICAgICB0aGlzLmNmbTIgPSB0aGlzLmt2MTEgKiBkbXA7XHJcbiAgICAgICAgdGhpcy5saW1pdFZlbG9jaXR5MiAqPSBrICogZG1wO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuY2ZtMiA9IDA7XHJcbiAgICAgICAgdGhpcy5saW1pdFZlbG9jaXR5MiAqPSBpbnZUaW1lU3RlcCAqIDAuMDU7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGVuYWJsZVNwcmluZzMgJiYgdGhpcy5saW1pdFN0YXRlMyAhPSAyKSB7XHJcbiAgICAgICAgb21lZ2EgPSA2LjI4MzE4NTMgKiBmcmVxdWVuY3kzO1xyXG4gICAgICAgIGsgPSBvbWVnYSAqIG9tZWdhICogdGltZVN0ZXA7XHJcbiAgICAgICAgZG1wID0gaW52VGltZVN0ZXAgLyAoayArIDIgKiB0aGlzLmxpbWl0TW90b3IzLmRhbXBpbmdSYXRpbyAqIG9tZWdhKTtcclxuICAgICAgICB0aGlzLmNmbTMgPSB0aGlzLmt2MjIgKiBkbXA7XHJcbiAgICAgICAgdGhpcy5saW1pdFZlbG9jaXR5MyAqPSBrICogZG1wO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuY2ZtMyA9IDA7XHJcbiAgICAgICAgdGhpcy5saW1pdFZlbG9jaXR5MyAqPSBpbnZUaW1lU3RlcCAqIDAuMDU7XHJcbiAgICAgIH1cclxuICAgICAgdGhpcy5rMDAgKz0gdGhpcy5jZm0xO1xyXG4gICAgICB0aGlzLmsxMSArPSB0aGlzLmNmbTI7XHJcbiAgICAgIHRoaXMuazIyICs9IHRoaXMuY2ZtMztcclxuXHJcbiAgICAgIHZhciBpbnYgPSAxIC8gKFxyXG4gICAgICAgIHRoaXMuazAwICogKHRoaXMuazExICogdGhpcy5rMjIgLSB0aGlzLmsyMSAqIHRoaXMuazEyKSArXHJcbiAgICAgICAgdGhpcy5rMTAgKiAodGhpcy5rMjEgKiB0aGlzLmswMiAtIHRoaXMuazAxICogdGhpcy5rMjIpICtcclxuICAgICAgICB0aGlzLmsyMCAqICh0aGlzLmswMSAqIHRoaXMuazEyIC0gdGhpcy5rMTEgKiB0aGlzLmswMilcclxuICAgICAgKTtcclxuICAgICAgdGhpcy5kMDAgPSAodGhpcy5rMTEgKiB0aGlzLmsyMiAtIHRoaXMuazEyICogdGhpcy5rMjEpICogaW52O1xyXG4gICAgICB0aGlzLmQwMSA9ICh0aGlzLmswMiAqIHRoaXMuazIxIC0gdGhpcy5rMDEgKiB0aGlzLmsyMikgKiBpbnY7XHJcbiAgICAgIHRoaXMuZDAyID0gKHRoaXMuazAxICogdGhpcy5rMTIgLSB0aGlzLmswMiAqIHRoaXMuazExKSAqIGludjtcclxuICAgICAgdGhpcy5kMTAgPSAodGhpcy5rMTIgKiB0aGlzLmsyMCAtIHRoaXMuazEwICogdGhpcy5rMjIpICogaW52O1xyXG4gICAgICB0aGlzLmQxMSA9ICh0aGlzLmswMCAqIHRoaXMuazIyIC0gdGhpcy5rMDIgKiB0aGlzLmsyMCkgKiBpbnY7XHJcbiAgICAgIHRoaXMuZDEyID0gKHRoaXMuazAyICogdGhpcy5rMTAgLSB0aGlzLmswMCAqIHRoaXMuazEyKSAqIGludjtcclxuICAgICAgdGhpcy5kMjAgPSAodGhpcy5rMTAgKiB0aGlzLmsyMSAtIHRoaXMuazExICogdGhpcy5rMjApICogaW52O1xyXG4gICAgICB0aGlzLmQyMSA9ICh0aGlzLmswMSAqIHRoaXMuazIwIC0gdGhpcy5rMDAgKiB0aGlzLmsyMSkgKiBpbnY7XHJcbiAgICAgIHRoaXMuZDIyID0gKHRoaXMuazAwICogdGhpcy5rMTEgLSB0aGlzLmswMSAqIHRoaXMuazEwKSAqIGludjtcclxuXHJcbiAgICAgIC8vIHdhcm0gc3RhcnRpbmdcclxuICAgICAgdmFyIHRvdGFsSW1wdWxzZTEgPSB0aGlzLmxpbWl0SW1wdWxzZTEgKyB0aGlzLm1vdG9ySW1wdWxzZTE7XHJcbiAgICAgIHZhciB0b3RhbEltcHVsc2UyID0gdGhpcy5saW1pdEltcHVsc2UyICsgdGhpcy5tb3RvckltcHVsc2UyO1xyXG4gICAgICB2YXIgdG90YWxJbXB1bHNlMyA9IHRoaXMubGltaXRJbXB1bHNlMyArIHRoaXMubW90b3JJbXB1bHNlMztcclxuICAgICAgdGhpcy5sMS54ICs9IHRvdGFsSW1wdWxzZTEgKiB0aGlzLmwxeDEgKyB0b3RhbEltcHVsc2UyICogdGhpcy5sMXgyICsgdG90YWxJbXB1bHNlMyAqIHRoaXMubDF4MztcclxuICAgICAgdGhpcy5sMS55ICs9IHRvdGFsSW1wdWxzZTEgKiB0aGlzLmwxeTEgKyB0b3RhbEltcHVsc2UyICogdGhpcy5sMXkyICsgdG90YWxJbXB1bHNlMyAqIHRoaXMubDF5MztcclxuICAgICAgdGhpcy5sMS56ICs9IHRvdGFsSW1wdWxzZTEgKiB0aGlzLmwxejEgKyB0b3RhbEltcHVsc2UyICogdGhpcy5sMXoyICsgdG90YWxJbXB1bHNlMyAqIHRoaXMubDF6MztcclxuICAgICAgdGhpcy5hMS54ICs9IHRvdGFsSW1wdWxzZTEgKiB0aGlzLmExeDEgKyB0b3RhbEltcHVsc2UyICogdGhpcy5hMXgyICsgdG90YWxJbXB1bHNlMyAqIHRoaXMuYTF4MztcclxuICAgICAgdGhpcy5hMS55ICs9IHRvdGFsSW1wdWxzZTEgKiB0aGlzLmExeTEgKyB0b3RhbEltcHVsc2UyICogdGhpcy5hMXkyICsgdG90YWxJbXB1bHNlMyAqIHRoaXMuYTF5MztcclxuICAgICAgdGhpcy5hMS56ICs9IHRvdGFsSW1wdWxzZTEgKiB0aGlzLmExejEgKyB0b3RhbEltcHVsc2UyICogdGhpcy5hMXoyICsgdG90YWxJbXB1bHNlMyAqIHRoaXMuYTF6MztcclxuICAgICAgdGhpcy5sMi54IC09IHRvdGFsSW1wdWxzZTEgKiB0aGlzLmwyeDEgKyB0b3RhbEltcHVsc2UyICogdGhpcy5sMngyICsgdG90YWxJbXB1bHNlMyAqIHRoaXMubDJ4MztcclxuICAgICAgdGhpcy5sMi55IC09IHRvdGFsSW1wdWxzZTEgKiB0aGlzLmwyeTEgKyB0b3RhbEltcHVsc2UyICogdGhpcy5sMnkyICsgdG90YWxJbXB1bHNlMyAqIHRoaXMubDJ5MztcclxuICAgICAgdGhpcy5sMi56IC09IHRvdGFsSW1wdWxzZTEgKiB0aGlzLmwyejEgKyB0b3RhbEltcHVsc2UyICogdGhpcy5sMnoyICsgdG90YWxJbXB1bHNlMyAqIHRoaXMubDJ6MztcclxuICAgICAgdGhpcy5hMi54IC09IHRvdGFsSW1wdWxzZTEgKiB0aGlzLmEyeDEgKyB0b3RhbEltcHVsc2UyICogdGhpcy5hMngyICsgdG90YWxJbXB1bHNlMyAqIHRoaXMuYTJ4MztcclxuICAgICAgdGhpcy5hMi55IC09IHRvdGFsSW1wdWxzZTEgKiB0aGlzLmEyeTEgKyB0b3RhbEltcHVsc2UyICogdGhpcy5hMnkyICsgdG90YWxJbXB1bHNlMyAqIHRoaXMuYTJ5MztcclxuICAgICAgdGhpcy5hMi56IC09IHRvdGFsSW1wdWxzZTEgKiB0aGlzLmEyejEgKyB0b3RhbEltcHVsc2UyICogdGhpcy5hMnoyICsgdG90YWxJbXB1bHNlMyAqIHRoaXMuYTJ6MztcclxuICAgIH0sXHJcblxyXG4gICAgc29sdmU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgdmFyIHJ2eCA9IHRoaXMubDIueCAtIHRoaXMubDEueCArIHRoaXMuYTIueSAqIHRoaXMucjJ6IC0gdGhpcy5hMi56ICogdGhpcy5yMnkgLSB0aGlzLmExLnkgKiB0aGlzLnIxeiArIHRoaXMuYTEueiAqIHRoaXMucjF5O1xyXG4gICAgICB2YXIgcnZ5ID0gdGhpcy5sMi55IC0gdGhpcy5sMS55ICsgdGhpcy5hMi56ICogdGhpcy5yMnggLSB0aGlzLmEyLnggKiB0aGlzLnIyeiAtIHRoaXMuYTEueiAqIHRoaXMucjF4ICsgdGhpcy5hMS54ICogdGhpcy5yMXo7XHJcbiAgICAgIHZhciBydnogPSB0aGlzLmwyLnogLSB0aGlzLmwxLnogKyB0aGlzLmEyLnggKiB0aGlzLnIyeSAtIHRoaXMuYTIueSAqIHRoaXMucjJ4IC0gdGhpcy5hMS54ICogdGhpcy5yMXkgKyB0aGlzLmExLnkgKiB0aGlzLnIxeDtcclxuICAgICAgdmFyIHJ2bjEgPSBydnggKiB0aGlzLmF4MSArIHJ2eSAqIHRoaXMuYXkxICsgcnZ6ICogdGhpcy5hejE7XHJcbiAgICAgIHZhciBydm4yID0gcnZ4ICogdGhpcy5heDIgKyBydnkgKiB0aGlzLmF5MiArIHJ2eiAqIHRoaXMuYXoyO1xyXG4gICAgICB2YXIgcnZuMyA9IHJ2eCAqIHRoaXMuYXgzICsgcnZ5ICogdGhpcy5heTMgKyBydnogKiB0aGlzLmF6MztcclxuICAgICAgdmFyIG9sZE1vdG9ySW1wdWxzZTEgPSB0aGlzLm1vdG9ySW1wdWxzZTE7XHJcbiAgICAgIHZhciBvbGRNb3RvckltcHVsc2UyID0gdGhpcy5tb3RvckltcHVsc2UyO1xyXG4gICAgICB2YXIgb2xkTW90b3JJbXB1bHNlMyA9IHRoaXMubW90b3JJbXB1bHNlMztcclxuICAgICAgdmFyIGRNb3RvckltcHVsc2UxID0gMDtcclxuICAgICAgdmFyIGRNb3RvckltcHVsc2UyID0gMDtcclxuICAgICAgdmFyIGRNb3RvckltcHVsc2UzID0gMDtcclxuICAgICAgaWYgKHRoaXMuZW5hYmxlTW90b3IxKSB7XHJcbiAgICAgICAgZE1vdG9ySW1wdWxzZTEgPSAocnZuMSAtIHRoaXMubW90b3JTcGVlZDEpICogdGhpcy5kdjAwO1xyXG4gICAgICAgIHRoaXMubW90b3JJbXB1bHNlMSArPSBkTW90b3JJbXB1bHNlMTtcclxuICAgICAgICBpZiAodGhpcy5tb3RvckltcHVsc2UxID4gdGhpcy5tYXhNb3RvckltcHVsc2UxKSB7IC8vIGNsYW1wIG1vdG9yIGltcHVsc2VcclxuICAgICAgICAgIHRoaXMubW90b3JJbXB1bHNlMSA9IHRoaXMubWF4TW90b3JJbXB1bHNlMTtcclxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMubW90b3JJbXB1bHNlMSA8IC10aGlzLm1heE1vdG9ySW1wdWxzZTEpIHtcclxuICAgICAgICAgIHRoaXMubW90b3JJbXB1bHNlMSA9IC10aGlzLm1heE1vdG9ySW1wdWxzZTE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGRNb3RvckltcHVsc2UxID0gdGhpcy5tb3RvckltcHVsc2UxIC0gb2xkTW90b3JJbXB1bHNlMTtcclxuICAgICAgfVxyXG4gICAgICBpZiAodGhpcy5lbmFibGVNb3RvcjIpIHtcclxuICAgICAgICBkTW90b3JJbXB1bHNlMiA9IChydm4yIC0gdGhpcy5tb3RvclNwZWVkMikgKiB0aGlzLmR2MTE7XHJcbiAgICAgICAgdGhpcy5tb3RvckltcHVsc2UyICs9IGRNb3RvckltcHVsc2UyO1xyXG4gICAgICAgIGlmICh0aGlzLm1vdG9ySW1wdWxzZTIgPiB0aGlzLm1heE1vdG9ySW1wdWxzZTIpIHsgLy8gY2xhbXAgbW90b3IgaW1wdWxzZVxyXG4gICAgICAgICAgdGhpcy5tb3RvckltcHVsc2UyID0gdGhpcy5tYXhNb3RvckltcHVsc2UyO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5tb3RvckltcHVsc2UyIDwgLXRoaXMubWF4TW90b3JJbXB1bHNlMikge1xyXG4gICAgICAgICAgdGhpcy5tb3RvckltcHVsc2UyID0gLXRoaXMubWF4TW90b3JJbXB1bHNlMjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZE1vdG9ySW1wdWxzZTIgPSB0aGlzLm1vdG9ySW1wdWxzZTIgLSBvbGRNb3RvckltcHVsc2UyO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICh0aGlzLmVuYWJsZU1vdG9yMykge1xyXG4gICAgICAgIGRNb3RvckltcHVsc2UzID0gKHJ2bjMgLSB0aGlzLm1vdG9yU3BlZWQzKSAqIHRoaXMuZHYyMjtcclxuICAgICAgICB0aGlzLm1vdG9ySW1wdWxzZTMgKz0gZE1vdG9ySW1wdWxzZTM7XHJcbiAgICAgICAgaWYgKHRoaXMubW90b3JJbXB1bHNlMyA+IHRoaXMubWF4TW90b3JJbXB1bHNlMykgeyAvLyBjbGFtcCBtb3RvciBpbXB1bHNlXHJcbiAgICAgICAgICB0aGlzLm1vdG9ySW1wdWxzZTMgPSB0aGlzLm1heE1vdG9ySW1wdWxzZTM7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLm1vdG9ySW1wdWxzZTMgPCAtdGhpcy5tYXhNb3RvckltcHVsc2UzKSB7XHJcbiAgICAgICAgICB0aGlzLm1vdG9ySW1wdWxzZTMgPSAtdGhpcy5tYXhNb3RvckltcHVsc2UzO1xyXG4gICAgICAgIH1cclxuICAgICAgICBkTW90b3JJbXB1bHNlMyA9IHRoaXMubW90b3JJbXB1bHNlMyAtIG9sZE1vdG9ySW1wdWxzZTM7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIGFwcGx5IG1vdG9yIGltcHVsc2UgdG8gcmVsYXRpdmUgdmVsb2NpdHlcclxuICAgICAgcnZuMSArPSBkTW90b3JJbXB1bHNlMSAqIHRoaXMua3YwMCArIGRNb3RvckltcHVsc2UyICogdGhpcy5rMDEgKyBkTW90b3JJbXB1bHNlMyAqIHRoaXMuazAyO1xyXG4gICAgICBydm4yICs9IGRNb3RvckltcHVsc2UxICogdGhpcy5rMTAgKyBkTW90b3JJbXB1bHNlMiAqIHRoaXMua3YxMSArIGRNb3RvckltcHVsc2UzICogdGhpcy5rMTI7XHJcbiAgICAgIHJ2bjMgKz0gZE1vdG9ySW1wdWxzZTEgKiB0aGlzLmsyMCArIGRNb3RvckltcHVsc2UyICogdGhpcy5rMjEgKyBkTW90b3JJbXB1bHNlMyAqIHRoaXMua3YyMjtcclxuXHJcbiAgICAgIC8vIHN1YnRyYWN0IHRhcmdldCB2ZWxvY2l0eSBhbmQgYXBwbGllZCBpbXB1bHNlXHJcbiAgICAgIHJ2bjEgLT0gdGhpcy5saW1pdFZlbG9jaXR5MSArIHRoaXMubGltaXRJbXB1bHNlMSAqIHRoaXMuY2ZtMTtcclxuICAgICAgcnZuMiAtPSB0aGlzLmxpbWl0VmVsb2NpdHkyICsgdGhpcy5saW1pdEltcHVsc2UyICogdGhpcy5jZm0yO1xyXG4gICAgICBydm4zIC09IHRoaXMubGltaXRWZWxvY2l0eTMgKyB0aGlzLmxpbWl0SW1wdWxzZTMgKiB0aGlzLmNmbTM7XHJcblxyXG4gICAgICB2YXIgb2xkTGltaXRJbXB1bHNlMSA9IHRoaXMubGltaXRJbXB1bHNlMTtcclxuICAgICAgdmFyIG9sZExpbWl0SW1wdWxzZTIgPSB0aGlzLmxpbWl0SW1wdWxzZTI7XHJcbiAgICAgIHZhciBvbGRMaW1pdEltcHVsc2UzID0gdGhpcy5saW1pdEltcHVsc2UzO1xyXG5cclxuICAgICAgdmFyIGRMaW1pdEltcHVsc2UxID0gcnZuMSAqIHRoaXMuZDAwICsgcnZuMiAqIHRoaXMuZDAxICsgcnZuMyAqIHRoaXMuZDAyO1xyXG4gICAgICB2YXIgZExpbWl0SW1wdWxzZTIgPSBydm4xICogdGhpcy5kMTAgKyBydm4yICogdGhpcy5kMTEgKyBydm4zICogdGhpcy5kMTI7XHJcbiAgICAgIHZhciBkTGltaXRJbXB1bHNlMyA9IHJ2bjEgKiB0aGlzLmQyMCArIHJ2bjIgKiB0aGlzLmQyMSArIHJ2bjMgKiB0aGlzLmQyMjtcclxuXHJcbiAgICAgIHRoaXMubGltaXRJbXB1bHNlMSArPSBkTGltaXRJbXB1bHNlMTtcclxuICAgICAgdGhpcy5saW1pdEltcHVsc2UyICs9IGRMaW1pdEltcHVsc2UyO1xyXG4gICAgICB0aGlzLmxpbWl0SW1wdWxzZTMgKz0gZExpbWl0SW1wdWxzZTM7XHJcblxyXG4gICAgICAvLyBjbGFtcFxyXG4gICAgICB2YXIgY2xhbXBTdGF0ZSA9IDA7XHJcbiAgICAgIGlmICh0aGlzLmxpbWl0U3RhdGUxID09IDIgfHwgdGhpcy5saW1pdEltcHVsc2UxICogdGhpcy5saW1pdFN0YXRlMSA8IDApIHtcclxuICAgICAgICBkTGltaXRJbXB1bHNlMSA9IC1vbGRMaW1pdEltcHVsc2UxO1xyXG4gICAgICAgIHJ2bjIgKz0gZExpbWl0SW1wdWxzZTEgKiB0aGlzLmsxMDtcclxuICAgICAgICBydm4zICs9IGRMaW1pdEltcHVsc2UxICogdGhpcy5rMjA7XHJcbiAgICAgICAgY2xhbXBTdGF0ZSB8PSAxO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICh0aGlzLmxpbWl0U3RhdGUyID09IDIgfHwgdGhpcy5saW1pdEltcHVsc2UyICogdGhpcy5saW1pdFN0YXRlMiA8IDApIHtcclxuICAgICAgICBkTGltaXRJbXB1bHNlMiA9IC1vbGRMaW1pdEltcHVsc2UyO1xyXG4gICAgICAgIHJ2bjEgKz0gZExpbWl0SW1wdWxzZTIgKiB0aGlzLmswMTtcclxuICAgICAgICBydm4zICs9IGRMaW1pdEltcHVsc2UyICogdGhpcy5rMjE7XHJcbiAgICAgICAgY2xhbXBTdGF0ZSB8PSAyO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICh0aGlzLmxpbWl0U3RhdGUzID09IDIgfHwgdGhpcy5saW1pdEltcHVsc2UzICogdGhpcy5saW1pdFN0YXRlMyA8IDApIHtcclxuICAgICAgICBkTGltaXRJbXB1bHNlMyA9IC1vbGRMaW1pdEltcHVsc2UzO1xyXG4gICAgICAgIHJ2bjEgKz0gZExpbWl0SW1wdWxzZTMgKiB0aGlzLmswMjtcclxuICAgICAgICBydm4yICs9IGRMaW1pdEltcHVsc2UzICogdGhpcy5rMTI7XHJcbiAgICAgICAgY2xhbXBTdGF0ZSB8PSA0O1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyB1cGRhdGUgdW4tY2xhbXBlZCBpbXB1bHNlXHJcbiAgICAgIC8vIFRPRE86IGlzb2xhdGUgZGl2aXNpb25cclxuICAgICAgdmFyIGRldDtcclxuICAgICAgc3dpdGNoIChjbGFtcFN0YXRlKSB7XHJcbiAgICAgICAgY2FzZSAxOi8vIHVwZGF0ZSAyIDNcclxuICAgICAgICAgIGRldCA9IDEgLyAodGhpcy5rMTEgKiB0aGlzLmsyMiAtIHRoaXMuazEyICogdGhpcy5rMjEpO1xyXG4gICAgICAgICAgZExpbWl0SW1wdWxzZTIgPSAodGhpcy5rMjIgKiBydm4yICsgLXRoaXMuazEyICogcnZuMykgKiBkZXQ7XHJcbiAgICAgICAgICBkTGltaXRJbXB1bHNlMyA9ICgtdGhpcy5rMjEgKiBydm4yICsgdGhpcy5rMTEgKiBydm4zKSAqIGRldDtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgMjovLyB1cGRhdGUgMSAzXHJcbiAgICAgICAgICBkZXQgPSAxIC8gKHRoaXMuazAwICogdGhpcy5rMjIgLSB0aGlzLmswMiAqIHRoaXMuazIwKTtcclxuICAgICAgICAgIGRMaW1pdEltcHVsc2UxID0gKHRoaXMuazIyICogcnZuMSArIC10aGlzLmswMiAqIHJ2bjMpICogZGV0O1xyXG4gICAgICAgICAgZExpbWl0SW1wdWxzZTMgPSAoLXRoaXMuazIwICogcnZuMSArIHRoaXMuazAwICogcnZuMykgKiBkZXQ7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIDM6Ly8gdXBkYXRlIDNcclxuICAgICAgICAgIGRMaW1pdEltcHVsc2UzID0gcnZuMyAvIHRoaXMuazIyO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSA0Oi8vIHVwZGF0ZSAxIDJcclxuICAgICAgICAgIGRldCA9IDEgLyAodGhpcy5rMDAgKiB0aGlzLmsxMSAtIHRoaXMuazAxICogdGhpcy5rMTApO1xyXG4gICAgICAgICAgZExpbWl0SW1wdWxzZTEgPSAodGhpcy5rMTEgKiBydm4xICsgLXRoaXMuazAxICogcnZuMikgKiBkZXQ7XHJcbiAgICAgICAgICBkTGltaXRJbXB1bHNlMiA9ICgtdGhpcy5rMTAgKiBydm4xICsgdGhpcy5rMDAgKiBydm4yKSAqIGRldDtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgNTovLyB1cGRhdGUgMlxyXG4gICAgICAgICAgZExpbWl0SW1wdWxzZTIgPSBydm4yIC8gdGhpcy5rMTE7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIDY6Ly8gdXBkYXRlIDFcclxuICAgICAgICAgIGRMaW1pdEltcHVsc2UxID0gcnZuMSAvIHRoaXMuazAwO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMubGltaXRJbXB1bHNlMSA9IG9sZExpbWl0SW1wdWxzZTEgKyBkTGltaXRJbXB1bHNlMTtcclxuICAgICAgdGhpcy5saW1pdEltcHVsc2UyID0gb2xkTGltaXRJbXB1bHNlMiArIGRMaW1pdEltcHVsc2UyO1xyXG4gICAgICB0aGlzLmxpbWl0SW1wdWxzZTMgPSBvbGRMaW1pdEltcHVsc2UzICsgZExpbWl0SW1wdWxzZTM7XHJcblxyXG4gICAgICB2YXIgZEltcHVsc2UxID0gZE1vdG9ySW1wdWxzZTEgKyBkTGltaXRJbXB1bHNlMTtcclxuICAgICAgdmFyIGRJbXB1bHNlMiA9IGRNb3RvckltcHVsc2UyICsgZExpbWl0SW1wdWxzZTI7XHJcbiAgICAgIHZhciBkSW1wdWxzZTMgPSBkTW90b3JJbXB1bHNlMyArIGRMaW1pdEltcHVsc2UzO1xyXG5cclxuICAgICAgLy8gYXBwbHkgaW1wdWxzZVxyXG4gICAgICB0aGlzLmwxLnggKz0gZEltcHVsc2UxICogdGhpcy5sMXgxICsgZEltcHVsc2UyICogdGhpcy5sMXgyICsgZEltcHVsc2UzICogdGhpcy5sMXgzO1xyXG4gICAgICB0aGlzLmwxLnkgKz0gZEltcHVsc2UxICogdGhpcy5sMXkxICsgZEltcHVsc2UyICogdGhpcy5sMXkyICsgZEltcHVsc2UzICogdGhpcy5sMXkzO1xyXG4gICAgICB0aGlzLmwxLnogKz0gZEltcHVsc2UxICogdGhpcy5sMXoxICsgZEltcHVsc2UyICogdGhpcy5sMXoyICsgZEltcHVsc2UzICogdGhpcy5sMXozO1xyXG4gICAgICB0aGlzLmExLnggKz0gZEltcHVsc2UxICogdGhpcy5hMXgxICsgZEltcHVsc2UyICogdGhpcy5hMXgyICsgZEltcHVsc2UzICogdGhpcy5hMXgzO1xyXG4gICAgICB0aGlzLmExLnkgKz0gZEltcHVsc2UxICogdGhpcy5hMXkxICsgZEltcHVsc2UyICogdGhpcy5hMXkyICsgZEltcHVsc2UzICogdGhpcy5hMXkzO1xyXG4gICAgICB0aGlzLmExLnogKz0gZEltcHVsc2UxICogdGhpcy5hMXoxICsgZEltcHVsc2UyICogdGhpcy5hMXoyICsgZEltcHVsc2UzICogdGhpcy5hMXozO1xyXG4gICAgICB0aGlzLmwyLnggLT0gZEltcHVsc2UxICogdGhpcy5sMngxICsgZEltcHVsc2UyICogdGhpcy5sMngyICsgZEltcHVsc2UzICogdGhpcy5sMngzO1xyXG4gICAgICB0aGlzLmwyLnkgLT0gZEltcHVsc2UxICogdGhpcy5sMnkxICsgZEltcHVsc2UyICogdGhpcy5sMnkyICsgZEltcHVsc2UzICogdGhpcy5sMnkzO1xyXG4gICAgICB0aGlzLmwyLnogLT0gZEltcHVsc2UxICogdGhpcy5sMnoxICsgZEltcHVsc2UyICogdGhpcy5sMnoyICsgZEltcHVsc2UzICogdGhpcy5sMnozO1xyXG4gICAgICB0aGlzLmEyLnggLT0gZEltcHVsc2UxICogdGhpcy5hMngxICsgZEltcHVsc2UyICogdGhpcy5hMngyICsgZEltcHVsc2UzICogdGhpcy5hMngzO1xyXG4gICAgICB0aGlzLmEyLnkgLT0gZEltcHVsc2UxICogdGhpcy5hMnkxICsgZEltcHVsc2UyICogdGhpcy5hMnkyICsgZEltcHVsc2UzICogdGhpcy5hMnkzO1xyXG4gICAgICB0aGlzLmEyLnogLT0gZEltcHVsc2UxICogdGhpcy5hMnoxICsgZEltcHVsc2UyICogdGhpcy5hMnoyICsgZEltcHVsc2UzICogdGhpcy5hMnozO1xyXG4gICAgfVxyXG5cclxuICB9KTtcclxuXHJcbiAgLyoqXHJcbiAgICogQSBwcmlzbWF0aWMgam9pbnQgYWxsb3dzIG9ubHkgZm9yIHJlbGF0aXZlIHRyYW5zbGF0aW9uIG9mIHJpZ2lkIGJvZGllcyBhbG9uZyB0aGUgYXhpcy5cclxuICAgKlxyXG4gICAqIEBhdXRob3Igc2FoYXJhblxyXG4gICAqIEBhdXRob3IgbG8tdGhcclxuICAgKi9cclxuXHJcbiAgZnVuY3Rpb24gUHJpc21hdGljSm9pbnQoY29uZmlnLCBsb3dlclRyYW5zbGF0aW9uLCB1cHBlclRyYW5zbGF0aW9uKSB7XHJcblxyXG4gICAgSm9pbnQuY2FsbCh0aGlzLCBjb25maWcpO1xyXG5cclxuICAgIHRoaXMudHlwZSA9IEpPSU5UX1BSSVNNQVRJQztcclxuXHJcbiAgICAvLyBUaGUgYXhpcyBpbiB0aGUgZmlyc3QgYm9keSdzIGNvb3JkaW5hdGUgc3lzdGVtLlxyXG4gICAgdGhpcy5sb2NhbEF4aXMxID0gY29uZmlnLmxvY2FsQXhpczEuY2xvbmUoKS5ub3JtYWxpemUoKTtcclxuICAgIC8vIFRoZSBheGlzIGluIHRoZSBzZWNvbmQgYm9keSdzIGNvb3JkaW5hdGUgc3lzdGVtLlxyXG4gICAgdGhpcy5sb2NhbEF4aXMyID0gY29uZmlnLmxvY2FsQXhpczIuY2xvbmUoKS5ub3JtYWxpemUoKTtcclxuXHJcbiAgICB0aGlzLmF4MSA9IG5ldyBWZWMzKCk7XHJcbiAgICB0aGlzLmF4MiA9IG5ldyBWZWMzKCk7XHJcblxyXG4gICAgdGhpcy5ub3IgPSBuZXcgVmVjMygpO1xyXG4gICAgdGhpcy50YW4gPSBuZXcgVmVjMygpO1xyXG4gICAgdGhpcy5iaW4gPSBuZXcgVmVjMygpO1xyXG5cclxuICAgIHRoaXMuYWMgPSBuZXcgQW5ndWxhckNvbnN0cmFpbnQodGhpcywgbmV3IFF1YXQoKS5zZXRGcm9tVW5pdFZlY3RvcnModGhpcy5sb2NhbEF4aXMxLCB0aGlzLmxvY2FsQXhpczIpKTtcclxuXHJcbiAgICAvLyBUaGUgdHJhbnNsYXRpb25hbCBsaW1pdCBhbmQgbW90b3IgaW5mb3JtYXRpb24gb2YgdGhlIGpvaW50LlxyXG4gICAgdGhpcy5saW1pdE1vdG9yID0gbmV3IExpbWl0TW90b3IodGhpcy5ub3IsIHRydWUpO1xyXG4gICAgdGhpcy5saW1pdE1vdG9yLmxvd2VyTGltaXQgPSBsb3dlclRyYW5zbGF0aW9uO1xyXG4gICAgdGhpcy5saW1pdE1vdG9yLnVwcGVyTGltaXQgPSB1cHBlclRyYW5zbGF0aW9uO1xyXG4gICAgdGhpcy50MyA9IG5ldyBUcmFuc2xhdGlvbmFsM0NvbnN0cmFpbnQodGhpcywgdGhpcy5saW1pdE1vdG9yLCBuZXcgTGltaXRNb3Rvcih0aGlzLnRhbiwgdHJ1ZSksIG5ldyBMaW1pdE1vdG9yKHRoaXMuYmluLCB0cnVlKSk7XHJcblxyXG4gIH1cclxuICBQcmlzbWF0aWNKb2ludC5wcm90b3R5cGUgPSBPYmplY3QuYXNzaWduKE9iamVjdC5jcmVhdGUoSm9pbnQucHJvdG90eXBlKSwge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yOiBQcmlzbWF0aWNKb2ludCxcclxuXHJcbiAgICBwcmVTb2x2ZTogZnVuY3Rpb24gKHRpbWVTdGVwLCBpbnZUaW1lU3RlcCkge1xyXG5cclxuICAgICAgdGhpcy51cGRhdGVBbmNob3JQb2ludHMoKTtcclxuXHJcbiAgICAgIHRoaXMuYXgxLmNvcHkodGhpcy5sb2NhbEF4aXMxKS5hcHBseU1hdHJpeDModGhpcy5ib2R5MS5yb3RhdGlvbiwgdHJ1ZSk7XHJcbiAgICAgIHRoaXMuYXgyLmNvcHkodGhpcy5sb2NhbEF4aXMyKS5hcHBseU1hdHJpeDModGhpcy5ib2R5Mi5yb3RhdGlvbiwgdHJ1ZSk7XHJcblxyXG4gICAgICAvLyBub3JtYWwgdGFuZ2VudCBiaW5vcm1hbFxyXG5cclxuICAgICAgdGhpcy5ub3Iuc2V0KFxyXG4gICAgICAgIHRoaXMuYXgxLnggKiB0aGlzLmJvZHkyLmludmVyc2VNYXNzICsgdGhpcy5heDIueCAqIHRoaXMuYm9keTEuaW52ZXJzZU1hc3MsXHJcbiAgICAgICAgdGhpcy5heDEueSAqIHRoaXMuYm9keTIuaW52ZXJzZU1hc3MgKyB0aGlzLmF4Mi55ICogdGhpcy5ib2R5MS5pbnZlcnNlTWFzcyxcclxuICAgICAgICB0aGlzLmF4MS56ICogdGhpcy5ib2R5Mi5pbnZlcnNlTWFzcyArIHRoaXMuYXgyLnogKiB0aGlzLmJvZHkxLmludmVyc2VNYXNzXHJcbiAgICAgICkubm9ybWFsaXplKCk7XHJcbiAgICAgIHRoaXMudGFuLnRhbmdlbnQodGhpcy5ub3IpLm5vcm1hbGl6ZSgpO1xyXG4gICAgICB0aGlzLmJpbi5jcm9zc1ZlY3RvcnModGhpcy5ub3IsIHRoaXMudGFuKTtcclxuXHJcbiAgICAgIC8vIHByZVNvbHZlXHJcblxyXG4gICAgICB0aGlzLmFjLnByZVNvbHZlKHRpbWVTdGVwLCBpbnZUaW1lU3RlcCk7XHJcbiAgICAgIHRoaXMudDMucHJlU29sdmUodGltZVN0ZXAsIGludlRpbWVTdGVwKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHNvbHZlOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICB0aGlzLmFjLnNvbHZlKCk7XHJcbiAgICAgIHRoaXMudDMuc29sdmUoKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHBvc3RTb2x2ZTogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgIH1cclxuXHJcbiAgfSk7XHJcblxyXG4gIC8qKlxyXG4gICAqIEEgc2xpZGVyIGpvaW50IGFsbG93cyBmb3IgcmVsYXRpdmUgdHJhbnNsYXRpb24gYW5kIHJlbGF0aXZlIHJvdGF0aW9uIGJldHdlZW4gdHdvIHJpZ2lkIGJvZGllcyBhbG9uZyB0aGUgYXhpcy5cclxuICAgKlxyXG4gICAqIEBhdXRob3Igc2FoYXJhblxyXG4gICAqIEBhdXRob3IgbG8tdGhcclxuICAgKi9cclxuXHJcbiAgZnVuY3Rpb24gU2xpZGVySm9pbnQoY29uZmlnLCBsb3dlclRyYW5zbGF0aW9uLCB1cHBlclRyYW5zbGF0aW9uKSB7XHJcblxyXG4gICAgSm9pbnQuY2FsbCh0aGlzLCBjb25maWcpO1xyXG5cclxuICAgIHRoaXMudHlwZSA9IEpPSU5UX1NMSURFUjtcclxuXHJcbiAgICAvLyBUaGUgYXhpcyBpbiB0aGUgZmlyc3QgYm9keSdzIGNvb3JkaW5hdGUgc3lzdGVtLlxyXG4gICAgdGhpcy5sb2NhbEF4aXMxID0gY29uZmlnLmxvY2FsQXhpczEuY2xvbmUoKS5ub3JtYWxpemUoKTtcclxuICAgIC8vIFRoZSBheGlzIGluIHRoZSBzZWNvbmQgYm9keSdzIGNvb3JkaW5hdGUgc3lzdGVtLlxyXG4gICAgdGhpcy5sb2NhbEF4aXMyID0gY29uZmlnLmxvY2FsQXhpczIuY2xvbmUoKS5ub3JtYWxpemUoKTtcclxuXHJcbiAgICAvLyBtYWtlIGFuZ2xlIGF4aXNcclxuICAgIHZhciBhcmMgPSBuZXcgTWF0MzMoKS5zZXRRdWF0KG5ldyBRdWF0KCkuc2V0RnJvbVVuaXRWZWN0b3JzKHRoaXMubG9jYWxBeGlzMSwgdGhpcy5sb2NhbEF4aXMyKSk7XHJcbiAgICB0aGlzLmxvY2FsQW5nbGUxID0gbmV3IFZlYzMoKS50YW5nZW50KHRoaXMubG9jYWxBeGlzMSkubm9ybWFsaXplKCk7XHJcbiAgICB0aGlzLmxvY2FsQW5nbGUyID0gdGhpcy5sb2NhbEFuZ2xlMS5jbG9uZSgpLmFwcGx5TWF0cml4MyhhcmMsIHRydWUpO1xyXG5cclxuICAgIHRoaXMuYXgxID0gbmV3IFZlYzMoKTtcclxuICAgIHRoaXMuYXgyID0gbmV3IFZlYzMoKTtcclxuICAgIHRoaXMuYW4xID0gbmV3IFZlYzMoKTtcclxuICAgIHRoaXMuYW4yID0gbmV3IFZlYzMoKTtcclxuXHJcbiAgICB0aGlzLnRtcCA9IG5ldyBWZWMzKCk7XHJcblxyXG4gICAgdGhpcy5ub3IgPSBuZXcgVmVjMygpO1xyXG4gICAgdGhpcy50YW4gPSBuZXcgVmVjMygpO1xyXG4gICAgdGhpcy5iaW4gPSBuZXcgVmVjMygpO1xyXG5cclxuICAgIC8vIFRoZSBsaW1pdCBhbmQgbW90b3IgZm9yIHRoZSByb3RhdGlvblxyXG4gICAgdGhpcy5yb3RhdGlvbmFsTGltaXRNb3RvciA9IG5ldyBMaW1pdE1vdG9yKHRoaXMubm9yLCBmYWxzZSk7XHJcbiAgICB0aGlzLnIzID0gbmV3IFJvdGF0aW9uYWwzQ29uc3RyYWludCh0aGlzLCB0aGlzLnJvdGF0aW9uYWxMaW1pdE1vdG9yLCBuZXcgTGltaXRNb3Rvcih0aGlzLnRhbiwgdHJ1ZSksIG5ldyBMaW1pdE1vdG9yKHRoaXMuYmluLCB0cnVlKSk7XHJcblxyXG4gICAgLy8gVGhlIGxpbWl0IGFuZCBtb3RvciBmb3IgdGhlIHRyYW5zbGF0aW9uLlxyXG4gICAgdGhpcy50cmFuc2xhdGlvbmFsTGltaXRNb3RvciA9IG5ldyBMaW1pdE1vdG9yKHRoaXMubm9yLCB0cnVlKTtcclxuICAgIHRoaXMudHJhbnNsYXRpb25hbExpbWl0TW90b3IubG93ZXJMaW1pdCA9IGxvd2VyVHJhbnNsYXRpb247XHJcbiAgICB0aGlzLnRyYW5zbGF0aW9uYWxMaW1pdE1vdG9yLnVwcGVyTGltaXQgPSB1cHBlclRyYW5zbGF0aW9uO1xyXG4gICAgdGhpcy50MyA9IG5ldyBUcmFuc2xhdGlvbmFsM0NvbnN0cmFpbnQodGhpcywgdGhpcy50cmFuc2xhdGlvbmFsTGltaXRNb3RvciwgbmV3IExpbWl0TW90b3IodGhpcy50YW4sIHRydWUpLCBuZXcgTGltaXRNb3Rvcih0aGlzLmJpbiwgdHJ1ZSkpO1xyXG5cclxuICB9XHJcbiAgU2xpZGVySm9pbnQucHJvdG90eXBlID0gT2JqZWN0LmFzc2lnbihPYmplY3QuY3JlYXRlKEpvaW50LnByb3RvdHlwZSksIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcjogU2xpZGVySm9pbnQsXHJcblxyXG4gICAgcHJlU29sdmU6IGZ1bmN0aW9uICh0aW1lU3RlcCwgaW52VGltZVN0ZXApIHtcclxuXHJcbiAgICAgIHRoaXMudXBkYXRlQW5jaG9yUG9pbnRzKCk7XHJcblxyXG4gICAgICB0aGlzLmF4MS5jb3B5KHRoaXMubG9jYWxBeGlzMSkuYXBwbHlNYXRyaXgzKHRoaXMuYm9keTEucm90YXRpb24sIHRydWUpO1xyXG4gICAgICB0aGlzLmFuMS5jb3B5KHRoaXMubG9jYWxBbmdsZTEpLmFwcGx5TWF0cml4Myh0aGlzLmJvZHkxLnJvdGF0aW9uLCB0cnVlKTtcclxuXHJcbiAgICAgIHRoaXMuYXgyLmNvcHkodGhpcy5sb2NhbEF4aXMyKS5hcHBseU1hdHJpeDModGhpcy5ib2R5Mi5yb3RhdGlvbiwgdHJ1ZSk7XHJcbiAgICAgIHRoaXMuYW4yLmNvcHkodGhpcy5sb2NhbEFuZ2xlMikuYXBwbHlNYXRyaXgzKHRoaXMuYm9keTIucm90YXRpb24sIHRydWUpO1xyXG5cclxuICAgICAgLy8gbm9ybWFsIHRhbmdlbnQgYmlub3JtYWxcclxuXHJcbiAgICAgIHRoaXMubm9yLnNldChcclxuICAgICAgICB0aGlzLmF4MS54ICogdGhpcy5ib2R5Mi5pbnZlcnNlTWFzcyArIHRoaXMuYXgyLnggKiB0aGlzLmJvZHkxLmludmVyc2VNYXNzLFxyXG4gICAgICAgIHRoaXMuYXgxLnkgKiB0aGlzLmJvZHkyLmludmVyc2VNYXNzICsgdGhpcy5heDIueSAqIHRoaXMuYm9keTEuaW52ZXJzZU1hc3MsXHJcbiAgICAgICAgdGhpcy5heDEueiAqIHRoaXMuYm9keTIuaW52ZXJzZU1hc3MgKyB0aGlzLmF4Mi56ICogdGhpcy5ib2R5MS5pbnZlcnNlTWFzc1xyXG4gICAgICApLm5vcm1hbGl6ZSgpO1xyXG4gICAgICB0aGlzLnRhbi50YW5nZW50KHRoaXMubm9yKS5ub3JtYWxpemUoKTtcclxuICAgICAgdGhpcy5iaW4uY3Jvc3NWZWN0b3JzKHRoaXMubm9yLCB0aGlzLnRhbik7XHJcblxyXG4gICAgICAvLyBjYWxjdWxhdGUgaGluZ2UgYW5nbGVcclxuXHJcbiAgICAgIHRoaXMudG1wLmNyb3NzVmVjdG9ycyh0aGlzLmFuMSwgdGhpcy5hbjIpO1xyXG5cclxuICAgICAgdmFyIGxpbWl0ZSA9IF9NYXRoLmFjb3NDbGFtcChfTWF0aC5kb3RWZWN0b3JzKHRoaXMuYW4xLCB0aGlzLmFuMikpO1xyXG5cclxuICAgICAgaWYgKF9NYXRoLmRvdFZlY3RvcnModGhpcy5ub3IsIHRoaXMudG1wKSA8IDApIHRoaXMucm90YXRpb25hbExpbWl0TW90b3IuYW5nbGUgPSAtbGltaXRlO1xyXG4gICAgICBlbHNlIHRoaXMucm90YXRpb25hbExpbWl0TW90b3IuYW5nbGUgPSBsaW1pdGU7XHJcblxyXG4gICAgICAvLyBhbmd1bGFyIGVycm9yXHJcblxyXG4gICAgICB0aGlzLnRtcC5jcm9zc1ZlY3RvcnModGhpcy5heDEsIHRoaXMuYXgyKTtcclxuICAgICAgdGhpcy5yMy5saW1pdE1vdG9yMi5hbmdsZSA9IF9NYXRoLmRvdFZlY3RvcnModGhpcy50YW4sIHRoaXMudG1wKTtcclxuICAgICAgdGhpcy5yMy5saW1pdE1vdG9yMy5hbmdsZSA9IF9NYXRoLmRvdFZlY3RvcnModGhpcy5iaW4sIHRoaXMudG1wKTtcclxuXHJcbiAgICAgIC8vIHByZVNvbHZlXHJcblxyXG4gICAgICB0aGlzLnIzLnByZVNvbHZlKHRpbWVTdGVwLCBpbnZUaW1lU3RlcCk7XHJcbiAgICAgIHRoaXMudDMucHJlU29sdmUodGltZVN0ZXAsIGludlRpbWVTdGVwKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHNvbHZlOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICB0aGlzLnIzLnNvbHZlKCk7XHJcbiAgICAgIHRoaXMudDMuc29sdmUoKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHBvc3RTb2x2ZTogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgIH1cclxuXHJcbiAgfSk7XHJcblxyXG4gIC8qKlxyXG4gICAqIEEgd2hlZWwgam9pbnQgYWxsb3dzIGZvciByZWxhdGl2ZSByb3RhdGlvbiBiZXR3ZWVuIHR3byByaWdpZCBib2RpZXMgYWxvbmcgdHdvIGF4ZXMuXHJcbiAgICogVGhlIHdoZWVsIGpvaW50IGFsc28gYWxsb3dzIGZvciByZWxhdGl2ZSB0cmFuc2xhdGlvbiBmb3IgdGhlIHN1c3BlbnNpb24uXHJcbiAgICpcclxuICAgKiBAYXV0aG9yIHNhaGFyYW5cclxuICAgKiBAYXV0aG9yIGxvLXRoXHJcbiAgICovXHJcblxyXG4gIGZ1bmN0aW9uIFdoZWVsSm9pbnQoY29uZmlnKSB7XHJcblxyXG4gICAgSm9pbnQuY2FsbCh0aGlzLCBjb25maWcpO1xyXG5cclxuICAgIHRoaXMudHlwZSA9IEpPSU5UX1dIRUVMO1xyXG5cclxuICAgIC8vIFRoZSBheGlzIGluIHRoZSBmaXJzdCBib2R5J3MgY29vcmRpbmF0ZSBzeXN0ZW0uXHJcbiAgICB0aGlzLmxvY2FsQXhpczEgPSBjb25maWcubG9jYWxBeGlzMS5jbG9uZSgpLm5vcm1hbGl6ZSgpO1xyXG4gICAgLy8gVGhlIGF4aXMgaW4gdGhlIHNlY29uZCBib2R5J3MgY29vcmRpbmF0ZSBzeXN0ZW0uXHJcbiAgICB0aGlzLmxvY2FsQXhpczIgPSBjb25maWcubG9jYWxBeGlzMi5jbG9uZSgpLm5vcm1hbGl6ZSgpO1xyXG5cclxuICAgIHRoaXMubG9jYWxBbmdsZTEgPSBuZXcgVmVjMygpO1xyXG4gICAgdGhpcy5sb2NhbEFuZ2xlMiA9IG5ldyBWZWMzKCk7XHJcblxyXG4gICAgdmFyIGRvdCA9IF9NYXRoLmRvdFZlY3RvcnModGhpcy5sb2NhbEF4aXMxLCB0aGlzLmxvY2FsQXhpczIpO1xyXG5cclxuICAgIGlmIChkb3QgPiAtMSAmJiBkb3QgPCAxKSB7XHJcblxyXG4gICAgICB0aGlzLmxvY2FsQW5nbGUxLnNldChcclxuICAgICAgICB0aGlzLmxvY2FsQXhpczIueCAtIGRvdCAqIHRoaXMubG9jYWxBeGlzMS54LFxyXG4gICAgICAgIHRoaXMubG9jYWxBeGlzMi55IC0gZG90ICogdGhpcy5sb2NhbEF4aXMxLnksXHJcbiAgICAgICAgdGhpcy5sb2NhbEF4aXMyLnogLSBkb3QgKiB0aGlzLmxvY2FsQXhpczEuelxyXG4gICAgICApLm5vcm1hbGl6ZSgpO1xyXG5cclxuICAgICAgdGhpcy5sb2NhbEFuZ2xlMi5zZXQoXHJcbiAgICAgICAgdGhpcy5sb2NhbEF4aXMxLnggLSBkb3QgKiB0aGlzLmxvY2FsQXhpczIueCxcclxuICAgICAgICB0aGlzLmxvY2FsQXhpczEueSAtIGRvdCAqIHRoaXMubG9jYWxBeGlzMi55LFxyXG4gICAgICAgIHRoaXMubG9jYWxBeGlzMS56IC0gZG90ICogdGhpcy5sb2NhbEF4aXMyLnpcclxuICAgICAgKS5ub3JtYWxpemUoKTtcclxuXHJcbiAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgdmFyIGFyYyA9IG5ldyBNYXQzMygpLnNldFF1YXQobmV3IFF1YXQoKS5zZXRGcm9tVW5pdFZlY3RvcnModGhpcy5sb2NhbEF4aXMxLCB0aGlzLmxvY2FsQXhpczIpKTtcclxuICAgICAgdGhpcy5sb2NhbEFuZ2xlMS50YW5nZW50KHRoaXMubG9jYWxBeGlzMSkubm9ybWFsaXplKCk7XHJcbiAgICAgIHRoaXMubG9jYWxBbmdsZTIgPSB0aGlzLmxvY2FsQW5nbGUxLmNsb25lKCkuYXBwbHlNYXRyaXgzKGFyYywgdHJ1ZSk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuYXgxID0gbmV3IFZlYzMoKTtcclxuICAgIHRoaXMuYXgyID0gbmV3IFZlYzMoKTtcclxuICAgIHRoaXMuYW4xID0gbmV3IFZlYzMoKTtcclxuICAgIHRoaXMuYW4yID0gbmV3IFZlYzMoKTtcclxuXHJcbiAgICB0aGlzLnRtcCA9IG5ldyBWZWMzKCk7XHJcblxyXG4gICAgdGhpcy5ub3IgPSBuZXcgVmVjMygpO1xyXG4gICAgdGhpcy50YW4gPSBuZXcgVmVjMygpO1xyXG4gICAgdGhpcy5iaW4gPSBuZXcgVmVjMygpO1xyXG5cclxuICAgIC8vIFRoZSB0cmFuc2xhdGlvbmFsIGxpbWl0IGFuZCBtb3RvciBpbmZvcm1hdGlvbiBvZiB0aGUgam9pbnQuXHJcbiAgICB0aGlzLnRyYW5zbGF0aW9uYWxMaW1pdE1vdG9yID0gbmV3IExpbWl0TW90b3IodGhpcy50YW4sIHRydWUpO1xyXG4gICAgdGhpcy50cmFuc2xhdGlvbmFsTGltaXRNb3Rvci5mcmVxdWVuY3kgPSA4O1xyXG4gICAgdGhpcy50cmFuc2xhdGlvbmFsTGltaXRNb3Rvci5kYW1waW5nUmF0aW8gPSAxO1xyXG4gICAgLy8gVGhlIGZpcnN0IHJvdGF0aW9uYWwgbGltaXQgYW5kIG1vdG9yIGluZm9ybWF0aW9uIG9mIHRoZSBqb2ludC5cclxuICAgIHRoaXMucm90YXRpb25hbExpbWl0TW90b3IxID0gbmV3IExpbWl0TW90b3IodGhpcy50YW4sIGZhbHNlKTtcclxuICAgIC8vIFRoZSBzZWNvbmQgcm90YXRpb25hbCBsaW1pdCBhbmQgbW90b3IgaW5mb3JtYXRpb24gb2YgdGhlIGpvaW50LlxyXG4gICAgdGhpcy5yb3RhdGlvbmFsTGltaXRNb3RvcjIgPSBuZXcgTGltaXRNb3Rvcih0aGlzLmJpbiwgZmFsc2UpO1xyXG5cclxuICAgIHRoaXMudDMgPSBuZXcgVHJhbnNsYXRpb25hbDNDb25zdHJhaW50KHRoaXMsIG5ldyBMaW1pdE1vdG9yKHRoaXMubm9yLCB0cnVlKSwgdGhpcy50cmFuc2xhdGlvbmFsTGltaXRNb3RvciwgbmV3IExpbWl0TW90b3IodGhpcy5iaW4sIHRydWUpKTtcclxuICAgIHRoaXMudDMud2VpZ2h0ID0gMTtcclxuICAgIHRoaXMucjMgPSBuZXcgUm90YXRpb25hbDNDb25zdHJhaW50KHRoaXMsIG5ldyBMaW1pdE1vdG9yKHRoaXMubm9yLCB0cnVlKSwgdGhpcy5yb3RhdGlvbmFsTGltaXRNb3RvcjEsIHRoaXMucm90YXRpb25hbExpbWl0TW90b3IyKTtcclxuXHJcbiAgfVxyXG4gIFdoZWVsSm9pbnQucHJvdG90eXBlID0gT2JqZWN0LmFzc2lnbihPYmplY3QuY3JlYXRlKEpvaW50LnByb3RvdHlwZSksIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcjogV2hlZWxKb2ludCxcclxuXHJcbiAgICBwcmVTb2x2ZTogZnVuY3Rpb24gKHRpbWVTdGVwLCBpbnZUaW1lU3RlcCkge1xyXG5cclxuICAgICAgdGhpcy51cGRhdGVBbmNob3JQb2ludHMoKTtcclxuXHJcbiAgICAgIHRoaXMuYXgxLmNvcHkodGhpcy5sb2NhbEF4aXMxKS5hcHBseU1hdHJpeDModGhpcy5ib2R5MS5yb3RhdGlvbiwgdHJ1ZSk7XHJcbiAgICAgIHRoaXMuYW4xLmNvcHkodGhpcy5sb2NhbEFuZ2xlMSkuYXBwbHlNYXRyaXgzKHRoaXMuYm9keTEucm90YXRpb24sIHRydWUpO1xyXG5cclxuICAgICAgdGhpcy5heDIuY29weSh0aGlzLmxvY2FsQXhpczIpLmFwcGx5TWF0cml4Myh0aGlzLmJvZHkyLnJvdGF0aW9uLCB0cnVlKTtcclxuICAgICAgdGhpcy5hbjIuY29weSh0aGlzLmxvY2FsQW5nbGUyKS5hcHBseU1hdHJpeDModGhpcy5ib2R5Mi5yb3RhdGlvbiwgdHJ1ZSk7XHJcblxyXG4gICAgICB0aGlzLnIzLmxpbWl0TW90b3IxLmFuZ2xlID0gX01hdGguZG90VmVjdG9ycyh0aGlzLmF4MSwgdGhpcy5heDIpO1xyXG5cclxuICAgICAgdmFyIGxpbWl0ZSA9IF9NYXRoLmRvdFZlY3RvcnModGhpcy5hbjEsIHRoaXMuYXgyKTtcclxuXHJcbiAgICAgIGlmIChfTWF0aC5kb3RWZWN0b3JzKHRoaXMuYXgxLCB0aGlzLnRtcC5jcm9zc1ZlY3RvcnModGhpcy5hbjEsIHRoaXMuYXgyKSkgPCAwKSB0aGlzLnJvdGF0aW9uYWxMaW1pdE1vdG9yMS5hbmdsZSA9IC1saW1pdGU7XHJcbiAgICAgIGVsc2UgdGhpcy5yb3RhdGlvbmFsTGltaXRNb3RvcjEuYW5nbGUgPSBsaW1pdGU7XHJcblxyXG4gICAgICBsaW1pdGUgPSBfTWF0aC5kb3RWZWN0b3JzKHRoaXMuYW4yLCB0aGlzLmF4MSk7XHJcblxyXG4gICAgICBpZiAoX01hdGguZG90VmVjdG9ycyh0aGlzLmF4MiwgdGhpcy50bXAuY3Jvc3NWZWN0b3JzKHRoaXMuYW4yLCB0aGlzLmF4MSkpIDwgMCkgdGhpcy5yb3RhdGlvbmFsTGltaXRNb3RvcjIuYW5nbGUgPSAtbGltaXRlO1xyXG4gICAgICBlbHNlIHRoaXMucm90YXRpb25hbExpbWl0TW90b3IyLmFuZ2xlID0gbGltaXRlO1xyXG5cclxuICAgICAgdGhpcy5ub3IuY3Jvc3NWZWN0b3JzKHRoaXMuYXgxLCB0aGlzLmF4Mikubm9ybWFsaXplKCk7XHJcbiAgICAgIHRoaXMudGFuLmNyb3NzVmVjdG9ycyh0aGlzLm5vciwgdGhpcy5heDIpLm5vcm1hbGl6ZSgpO1xyXG4gICAgICB0aGlzLmJpbi5jcm9zc1ZlY3RvcnModGhpcy5ub3IsIHRoaXMuYXgxKS5ub3JtYWxpemUoKTtcclxuXHJcbiAgICAgIHRoaXMucjMucHJlU29sdmUodGltZVN0ZXAsIGludlRpbWVTdGVwKTtcclxuICAgICAgdGhpcy50My5wcmVTb2x2ZSh0aW1lU3RlcCwgaW52VGltZVN0ZXApO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgc29sdmU6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgIHRoaXMucjMuc29sdmUoKTtcclxuICAgICAgdGhpcy50My5zb2x2ZSgpO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgcG9zdFNvbHZlOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgfVxyXG5cclxuICB9KTtcclxuXHJcbiAgZnVuY3Rpb24gSm9pbnRDb25maWcoKSB7XHJcblxyXG4gICAgdGhpcy5zY2FsZSA9IDE7XHJcbiAgICB0aGlzLmludlNjYWxlID0gMTtcclxuXHJcbiAgICAvLyBUaGUgZmlyc3QgcmlnaWQgYm9keSBvZiB0aGUgam9pbnQuXHJcbiAgICB0aGlzLmJvZHkxID0gbnVsbDtcclxuICAgIC8vIFRoZSBzZWNvbmQgcmlnaWQgYm9keSBvZiB0aGUgam9pbnQuXHJcbiAgICB0aGlzLmJvZHkyID0gbnVsbDtcclxuICAgIC8vIFRoZSBhbmNob3IgcG9pbnQgb24gdGhlIGZpcnN0IHJpZ2lkIGJvZHkgaW4gbG9jYWwgY29vcmRpbmF0ZSBzeXN0ZW0uXHJcbiAgICB0aGlzLmxvY2FsQW5jaG9yUG9pbnQxID0gbmV3IFZlYzMoKTtcclxuICAgIC8vICBUaGUgYW5jaG9yIHBvaW50IG9uIHRoZSBzZWNvbmQgcmlnaWQgYm9keSBpbiBsb2NhbCBjb29yZGluYXRlIHN5c3RlbS5cclxuICAgIHRoaXMubG9jYWxBbmNob3JQb2ludDIgPSBuZXcgVmVjMygpO1xyXG4gICAgLy8gVGhlIGF4aXMgaW4gdGhlIGZpcnN0IGJvZHkncyBjb29yZGluYXRlIHN5c3RlbS5cclxuICAgIC8vIGhpcyBwcm9wZXJ0eSBpcyBhdmFpbGFibGUgaW4gc29tZSBqb2ludHMuXHJcbiAgICB0aGlzLmxvY2FsQXhpczEgPSBuZXcgVmVjMygpO1xyXG4gICAgLy8gVGhlIGF4aXMgaW4gdGhlIHNlY29uZCBib2R5J3MgY29vcmRpbmF0ZSBzeXN0ZW0uXHJcbiAgICAvLyBUaGlzIHByb3BlcnR5IGlzIGF2YWlsYWJsZSBpbiBzb21lIGpvaW50cy5cclxuICAgIHRoaXMubG9jYWxBeGlzMiA9IG5ldyBWZWMzKCk7XHJcbiAgICAvLyAgV2hldGhlciBhbGxvdyBjb2xsaXNpb24gYmV0d2VlbiBjb25uZWN0ZWQgcmlnaWQgYm9kaWVzIG9yIG5vdC5cclxuICAgIHRoaXMuYWxsb3dDb2xsaXNpb24gPSBmYWxzZTtcclxuXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUaGlzIGNsYXNzIGhvbGRzIG1hc3MgaW5mb3JtYXRpb24gb2YgYSBzaGFwZS5cclxuICAgKiBAYXV0aG9yIGxvLXRoXHJcbiAgICogQGF1dGhvciBzYWhhcmFuXHJcbiAgICovXHJcblxyXG4gIGZ1bmN0aW9uIE1hc3NJbmZvKCkge1xyXG5cclxuICAgIC8vIE1hc3Mgb2YgdGhlIHNoYXBlLlxyXG4gICAgdGhpcy5tYXNzID0gMDtcclxuXHJcbiAgICAvLyBUaGUgbW9tZW50IGluZXJ0aWEgb2YgdGhlIHNoYXBlLlxyXG4gICAgdGhpcy5pbmVydGlhID0gbmV3IE1hdDMzKCk7XHJcblxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgKiBBIGxpbmsgbGlzdCBvZiBjb250YWN0cy5cclxuICAqIEBhdXRob3Igc2FoYXJhblxyXG4gICovXHJcbiAgZnVuY3Rpb24gQ29udGFjdExpbmsoY29udGFjdCkge1xyXG5cclxuICAgIC8vIFRoZSBwcmV2aW91cyBjb250YWN0IGxpbmsuXHJcbiAgICB0aGlzLnByZXYgPSBudWxsO1xyXG4gICAgLy8gVGhlIG5leHQgY29udGFjdCBsaW5rLlxyXG4gICAgdGhpcy5uZXh0ID0gbnVsbDtcclxuICAgIC8vIFRoZSBzaGFwZSBvZiB0aGUgY29udGFjdC5cclxuICAgIHRoaXMuc2hhcGUgPSBudWxsO1xyXG4gICAgLy8gVGhlIG90aGVyIHJpZ2lkIGJvZHkuXHJcbiAgICB0aGlzLmJvZHkgPSBudWxsO1xyXG4gICAgLy8gVGhlIGNvbnRhY3Qgb2YgdGhlIGxpbmsuXHJcbiAgICB0aGlzLmNvbnRhY3QgPSBjb250YWN0O1xyXG5cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIEltcHVsc2VEYXRhQnVmZmVyKCkge1xyXG5cclxuICAgIHRoaXMubHAxWCA9IE5hTjtcclxuICAgIHRoaXMubHAxWSA9IE5hTjtcclxuICAgIHRoaXMubHAxWiA9IE5hTjtcclxuICAgIHRoaXMubHAyWCA9IE5hTjtcclxuICAgIHRoaXMubHAyWSA9IE5hTjtcclxuICAgIHRoaXMubHAyWiA9IE5hTjtcclxuICAgIHRoaXMuaW1wdWxzZSA9IE5hTjtcclxuXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAqIFRoZSBjbGFzcyBob2xkcyBkZXRhaWxzIG9mIHRoZSBjb250YWN0IHBvaW50LlxyXG4gICogQGF1dGhvciBzYWhhcmFuXHJcbiAgKi9cclxuXHJcbiAgZnVuY3Rpb24gTWFuaWZvbGRQb2ludCgpIHtcclxuXHJcbiAgICAvLyBXaGV0aGVyIHRoaXMgbWFuaWZvbGQgcG9pbnQgaXMgcGVyc2lzdGluZyBvciBub3QuXHJcbiAgICB0aGlzLndhcm1TdGFydGVkID0gZmFsc2U7XHJcbiAgICAvLyAgVGhlIHBvc2l0aW9uIG9mIHRoaXMgbWFuaWZvbGQgcG9pbnQuXHJcbiAgICB0aGlzLnBvc2l0aW9uID0gbmV3IFZlYzMoKTtcclxuICAgIC8vIFRoZSBwb3NpdGlvbiBpbiB0aGUgZmlyc3Qgc2hhcGUncyBjb29yZGluYXRlLlxyXG4gICAgdGhpcy5sb2NhbFBvaW50MSA9IG5ldyBWZWMzKCk7XHJcbiAgICAvLyAgVGhlIHBvc2l0aW9uIGluIHRoZSBzZWNvbmQgc2hhcGUncyBjb29yZGluYXRlLlxyXG4gICAgdGhpcy5sb2NhbFBvaW50MiA9IG5ldyBWZWMzKCk7XHJcbiAgICAvLyBUaGUgbm9ybWFsIHZlY3RvciBvZiB0aGlzIG1hbmlmb2xkIHBvaW50LlxyXG4gICAgdGhpcy5ub3JtYWwgPSBuZXcgVmVjMygpO1xyXG4gICAgLy8gVGhlIHRhbmdlbnQgdmVjdG9yIG9mIHRoaXMgbWFuaWZvbGQgcG9pbnQuXHJcbiAgICB0aGlzLnRhbmdlbnQgPSBuZXcgVmVjMygpO1xyXG4gICAgLy8gVGhlIGJpbm9ybWFsIHZlY3RvciBvZiB0aGlzIG1hbmlmb2xkIHBvaW50LlxyXG4gICAgdGhpcy5iaW5vcm1hbCA9IG5ldyBWZWMzKCk7XHJcbiAgICAvLyBUaGUgaW1wdWxzZSBpbiBub3JtYWwgZGlyZWN0aW9uLlxyXG4gICAgdGhpcy5ub3JtYWxJbXB1bHNlID0gMDtcclxuICAgIC8vIFRoZSBpbXB1bHNlIGluIHRhbmdlbnQgZGlyZWN0aW9uLlxyXG4gICAgdGhpcy50YW5nZW50SW1wdWxzZSA9IDA7XHJcbiAgICAvLyBUaGUgaW1wdWxzZSBpbiBiaW5vcm1hbCBkaXJlY3Rpb24uXHJcbiAgICB0aGlzLmJpbm9ybWFsSW1wdWxzZSA9IDA7XHJcbiAgICAvLyBUaGUgZGVub21pbmF0b3IgaW4gbm9ybWFsIGRpcmVjdGlvbi5cclxuICAgIHRoaXMubm9ybWFsRGVub21pbmF0b3IgPSAwO1xyXG4gICAgLy8gVGhlIGRlbm9taW5hdG9yIGluIHRhbmdlbnQgZGlyZWN0aW9uLlxyXG4gICAgdGhpcy50YW5nZW50RGVub21pbmF0b3IgPSAwO1xyXG4gICAgLy8gVGhlIGRlbm9taW5hdG9yIGluIGJpbm9ybWFsIGRpcmVjdGlvbi5cclxuICAgIHRoaXMuYmlub3JtYWxEZW5vbWluYXRvciA9IDA7XHJcbiAgICAvLyBUaGUgZGVwdGggb2YgcGVuZXRyYXRpb24uXHJcbiAgICB0aGlzLnBlbmV0cmF0aW9uID0gMDtcclxuXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAqIEEgY29udGFjdCBtYW5pZm9sZCBiZXR3ZWVuIHR3byBzaGFwZXMuXHJcbiAgKiBAYXV0aG9yIHNhaGFyYW5cclxuICAqIEBhdXRob3IgbG8tdGhcclxuICAqL1xyXG5cclxuICBmdW5jdGlvbiBDb250YWN0TWFuaWZvbGQoKSB7XHJcblxyXG4gICAgLy8gVGhlIGZpcnN0IHJpZ2lkIGJvZHkuXHJcbiAgICB0aGlzLmJvZHkxID0gbnVsbDtcclxuICAgIC8vIFRoZSBzZWNvbmQgcmlnaWQgYm9keS5cclxuICAgIHRoaXMuYm9keTIgPSBudWxsO1xyXG4gICAgLy8gVGhlIG51bWJlciBvZiBtYW5pZm9sZCBwb2ludHMuXHJcbiAgICB0aGlzLm51bVBvaW50cyA9IDA7XHJcbiAgICAvLyBUaGUgbWFuaWZvbGQgcG9pbnRzLlxyXG4gICAgdGhpcy5wb2ludHMgPSBbXHJcbiAgICAgIG5ldyBNYW5pZm9sZFBvaW50KCksXHJcbiAgICAgIG5ldyBNYW5pZm9sZFBvaW50KCksXHJcbiAgICAgIG5ldyBNYW5pZm9sZFBvaW50KCksXHJcbiAgICAgIG5ldyBNYW5pZm9sZFBvaW50KClcclxuICAgIF07XHJcblxyXG4gIH1cclxuXHJcbiAgQ29udGFjdE1hbmlmb2xkLnByb3RvdHlwZSA9IHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcjogQ29udGFjdE1hbmlmb2xkLFxyXG5cclxuICAgIC8vUmVzZXQgdGhlIG1hbmlmb2xkLlxyXG4gICAgcmVzZXQ6IGZ1bmN0aW9uIChzaGFwZTEsIHNoYXBlMikge1xyXG5cclxuICAgICAgdGhpcy5ib2R5MSA9IHNoYXBlMS5wYXJlbnQ7XHJcbiAgICAgIHRoaXMuYm9keTIgPSBzaGFwZTIucGFyZW50O1xyXG4gICAgICB0aGlzLm51bVBvaW50cyA9IDA7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICAvLyAgQWRkIGEgcG9pbnQgaW50byB0aGlzIG1hbmlmb2xkLlxyXG4gICAgYWRkUG9pbnRWZWM6IGZ1bmN0aW9uIChwb3MsIG5vcm0sIHBlbmV0cmF0aW9uLCBmbGlwKSB7XHJcblxyXG4gICAgICB2YXIgcCA9IHRoaXMucG9pbnRzW3RoaXMubnVtUG9pbnRzKytdO1xyXG5cclxuICAgICAgcC5wb3NpdGlvbi5jb3B5KHBvcyk7XHJcbiAgICAgIHAubG9jYWxQb2ludDEuc3ViKHBvcywgdGhpcy5ib2R5MS5wb3NpdGlvbikuYXBwbHlNYXRyaXgzKHRoaXMuYm9keTEucm90YXRpb24pO1xyXG4gICAgICBwLmxvY2FsUG9pbnQyLnN1Yihwb3MsIHRoaXMuYm9keTIucG9zaXRpb24pLmFwcGx5TWF0cml4Myh0aGlzLmJvZHkyLnJvdGF0aW9uKTtcclxuXHJcbiAgICAgIHAubm9ybWFsLmNvcHkobm9ybSk7XHJcbiAgICAgIGlmIChmbGlwKSBwLm5vcm1hbC5uZWdhdGUoKTtcclxuXHJcbiAgICAgIHAubm9ybWFsSW1wdWxzZSA9IDA7XHJcbiAgICAgIHAucGVuZXRyYXRpb24gPSBwZW5ldHJhdGlvbjtcclxuICAgICAgcC53YXJtU3RhcnRlZCA9IGZhbHNlO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgLy8gIEFkZCBhIHBvaW50IGludG8gdGhpcyBtYW5pZm9sZC5cclxuICAgIGFkZFBvaW50OiBmdW5jdGlvbiAoeCwgeSwgeiwgbngsIG55LCBueiwgcGVuZXRyYXRpb24sIGZsaXApIHtcclxuXHJcbiAgICAgIHZhciBwID0gdGhpcy5wb2ludHNbdGhpcy5udW1Qb2ludHMrK107XHJcblxyXG4gICAgICBwLnBvc2l0aW9uLnNldCh4LCB5LCB6KTtcclxuICAgICAgcC5sb2NhbFBvaW50MS5zdWIocC5wb3NpdGlvbiwgdGhpcy5ib2R5MS5wb3NpdGlvbikuYXBwbHlNYXRyaXgzKHRoaXMuYm9keTEucm90YXRpb24pO1xyXG4gICAgICBwLmxvY2FsUG9pbnQyLnN1YihwLnBvc2l0aW9uLCB0aGlzLmJvZHkyLnBvc2l0aW9uKS5hcHBseU1hdHJpeDModGhpcy5ib2R5Mi5yb3RhdGlvbik7XHJcblxyXG4gICAgICBwLm5vcm1hbEltcHVsc2UgPSAwO1xyXG5cclxuICAgICAgcC5ub3JtYWwuc2V0KG54LCBueSwgbnopO1xyXG4gICAgICBpZiAoZmxpcCkgcC5ub3JtYWwubmVnYXRlKCk7XHJcblxyXG4gICAgICBwLnBlbmV0cmF0aW9uID0gcGVuZXRyYXRpb247XHJcbiAgICAgIHAud2FybVN0YXJ0ZWQgPSBmYWxzZTtcclxuXHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgZnVuY3Rpb24gQ29udGFjdFBvaW50RGF0YUJ1ZmZlcigpIHtcclxuXHJcbiAgICB0aGlzLm5vciA9IG5ldyBWZWMzKCk7XHJcbiAgICB0aGlzLnRhbiA9IG5ldyBWZWMzKCk7XHJcbiAgICB0aGlzLmJpbiA9IG5ldyBWZWMzKCk7XHJcblxyXG4gICAgdGhpcy5ub3JVMSA9IG5ldyBWZWMzKCk7XHJcbiAgICB0aGlzLnRhblUxID0gbmV3IFZlYzMoKTtcclxuICAgIHRoaXMuYmluVTEgPSBuZXcgVmVjMygpO1xyXG5cclxuICAgIHRoaXMubm9yVTIgPSBuZXcgVmVjMygpO1xyXG4gICAgdGhpcy50YW5VMiA9IG5ldyBWZWMzKCk7XHJcbiAgICB0aGlzLmJpblUyID0gbmV3IFZlYzMoKTtcclxuXHJcbiAgICB0aGlzLm5vclQxID0gbmV3IFZlYzMoKTtcclxuICAgIHRoaXMudGFuVDEgPSBuZXcgVmVjMygpO1xyXG4gICAgdGhpcy5iaW5UMSA9IG5ldyBWZWMzKCk7XHJcblxyXG4gICAgdGhpcy5ub3JUMiA9IG5ldyBWZWMzKCk7XHJcbiAgICB0aGlzLnRhblQyID0gbmV3IFZlYzMoKTtcclxuICAgIHRoaXMuYmluVDIgPSBuZXcgVmVjMygpO1xyXG5cclxuICAgIHRoaXMubm9yVFUxID0gbmV3IFZlYzMoKTtcclxuICAgIHRoaXMudGFuVFUxID0gbmV3IFZlYzMoKTtcclxuICAgIHRoaXMuYmluVFUxID0gbmV3IFZlYzMoKTtcclxuXHJcbiAgICB0aGlzLm5vclRVMiA9IG5ldyBWZWMzKCk7XHJcbiAgICB0aGlzLnRhblRVMiA9IG5ldyBWZWMzKCk7XHJcbiAgICB0aGlzLmJpblRVMiA9IG5ldyBWZWMzKCk7XHJcblxyXG4gICAgdGhpcy5ub3JJbXAgPSAwO1xyXG4gICAgdGhpcy50YW5JbXAgPSAwO1xyXG4gICAgdGhpcy5iaW5JbXAgPSAwO1xyXG5cclxuICAgIHRoaXMubm9yRGVuID0gMDtcclxuICAgIHRoaXMudGFuRGVuID0gMDtcclxuICAgIHRoaXMuYmluRGVuID0gMDtcclxuXHJcbiAgICB0aGlzLm5vclRhciA9IDA7XHJcblxyXG4gICAgdGhpcy5uZXh0ID0gbnVsbDtcclxuICAgIHRoaXMubGFzdCA9IGZhbHNlO1xyXG5cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICogLi4uXHJcbiAgKiBAYXV0aG9yIHNhaGFyYW5cclxuICAqL1xyXG4gIGZ1bmN0aW9uIENvbnRhY3RDb25zdHJhaW50KG1hbmlmb2xkKSB7XHJcblxyXG4gICAgQ29uc3RyYWludC5jYWxsKHRoaXMpO1xyXG4gICAgLy8gVGhlIGNvbnRhY3QgbWFuaWZvbGQgb2YgdGhlIGNvbnN0cmFpbnQuXHJcbiAgICB0aGlzLm1hbmlmb2xkID0gbWFuaWZvbGQ7XHJcbiAgICAvLyBUaGUgY29lZmZpY2llbnQgb2YgcmVzdGl0dXRpb24gb2YgdGhlIGNvbnN0cmFpbnQuXHJcbiAgICB0aGlzLnJlc3RpdHV0aW9uID0gTmFOO1xyXG4gICAgLy8gVGhlIGNvZWZmaWNpZW50IG9mIGZyaWN0aW9uIG9mIHRoZSBjb25zdHJhaW50LlxyXG4gICAgdGhpcy5mcmljdGlvbiA9IE5hTjtcclxuICAgIHRoaXMucDEgPSBudWxsO1xyXG4gICAgdGhpcy5wMiA9IG51bGw7XHJcbiAgICB0aGlzLmx2MSA9IG51bGw7XHJcbiAgICB0aGlzLmx2MiA9IG51bGw7XHJcbiAgICB0aGlzLmF2MSA9IG51bGw7XHJcbiAgICB0aGlzLmF2MiA9IG51bGw7XHJcbiAgICB0aGlzLmkxID0gbnVsbDtcclxuICAgIHRoaXMuaTIgPSBudWxsO1xyXG5cclxuICAgIC8vdGhpcy5paTEgPSBudWxsO1xyXG4gICAgLy90aGlzLmlpMiA9IG51bGw7XHJcblxyXG4gICAgdGhpcy50bXAgPSBuZXcgVmVjMygpO1xyXG4gICAgdGhpcy50bXBDMSA9IG5ldyBWZWMzKCk7XHJcbiAgICB0aGlzLnRtcEMyID0gbmV3IFZlYzMoKTtcclxuXHJcbiAgICB0aGlzLnRtcFAxID0gbmV3IFZlYzMoKTtcclxuICAgIHRoaXMudG1wUDIgPSBuZXcgVmVjMygpO1xyXG5cclxuICAgIHRoaXMudG1wbHYxID0gbmV3IFZlYzMoKTtcclxuICAgIHRoaXMudG1wbHYyID0gbmV3IFZlYzMoKTtcclxuICAgIHRoaXMudG1wYXYxID0gbmV3IFZlYzMoKTtcclxuICAgIHRoaXMudG1wYXYyID0gbmV3IFZlYzMoKTtcclxuXHJcbiAgICB0aGlzLm0xID0gTmFOO1xyXG4gICAgdGhpcy5tMiA9IE5hTjtcclxuICAgIHRoaXMubnVtID0gMDtcclxuXHJcbiAgICB0aGlzLnBzID0gbWFuaWZvbGQucG9pbnRzO1xyXG4gICAgdGhpcy5jcyA9IG5ldyBDb250YWN0UG9pbnREYXRhQnVmZmVyKCk7XHJcbiAgICB0aGlzLmNzLm5leHQgPSBuZXcgQ29udGFjdFBvaW50RGF0YUJ1ZmZlcigpO1xyXG4gICAgdGhpcy5jcy5uZXh0Lm5leHQgPSBuZXcgQ29udGFjdFBvaW50RGF0YUJ1ZmZlcigpO1xyXG4gICAgdGhpcy5jcy5uZXh0Lm5leHQubmV4dCA9IG5ldyBDb250YWN0UG9pbnREYXRhQnVmZmVyKCk7XHJcbiAgfVxyXG5cclxuICBDb250YWN0Q29uc3RyYWludC5wcm90b3R5cGUgPSBPYmplY3QuYXNzaWduKE9iamVjdC5jcmVhdGUoQ29uc3RyYWludC5wcm90b3R5cGUpLCB7XHJcblxyXG4gICAgY29uc3RydWN0b3I6IENvbnRhY3RDb25zdHJhaW50LFxyXG5cclxuICAgIC8vIEF0dGFjaCB0aGUgY29uc3RyYWludCB0byB0aGUgYm9kaWVzLlxyXG4gICAgYXR0YWNoOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICB0aGlzLnAxID0gdGhpcy5ib2R5MS5wb3NpdGlvbjtcclxuICAgICAgdGhpcy5wMiA9IHRoaXMuYm9keTIucG9zaXRpb247XHJcbiAgICAgIHRoaXMubHYxID0gdGhpcy5ib2R5MS5saW5lYXJWZWxvY2l0eTtcclxuICAgICAgdGhpcy5hdjEgPSB0aGlzLmJvZHkxLmFuZ3VsYXJWZWxvY2l0eTtcclxuICAgICAgdGhpcy5sdjIgPSB0aGlzLmJvZHkyLmxpbmVhclZlbG9jaXR5O1xyXG4gICAgICB0aGlzLmF2MiA9IHRoaXMuYm9keTIuYW5ndWxhclZlbG9jaXR5O1xyXG4gICAgICB0aGlzLmkxID0gdGhpcy5ib2R5MS5pbnZlcnNlSW5lcnRpYTtcclxuICAgICAgdGhpcy5pMiA9IHRoaXMuYm9keTIuaW52ZXJzZUluZXJ0aWE7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICAvLyBEZXRhY2ggdGhlIGNvbnN0cmFpbnQgZnJvbSB0aGUgYm9kaWVzLlxyXG4gICAgZGV0YWNoOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICB0aGlzLnAxID0gbnVsbDtcclxuICAgICAgdGhpcy5wMiA9IG51bGw7XHJcbiAgICAgIHRoaXMubHYxID0gbnVsbDtcclxuICAgICAgdGhpcy5sdjIgPSBudWxsO1xyXG4gICAgICB0aGlzLmF2MSA9IG51bGw7XHJcbiAgICAgIHRoaXMuYXYyID0gbnVsbDtcclxuICAgICAgdGhpcy5pMSA9IG51bGw7XHJcbiAgICAgIHRoaXMuaTIgPSBudWxsO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgcHJlU29sdmU6IGZ1bmN0aW9uICh0aW1lU3RlcCwgaW52VGltZVN0ZXApIHtcclxuXHJcbiAgICAgIHRoaXMubTEgPSB0aGlzLmJvZHkxLmludmVyc2VNYXNzO1xyXG4gICAgICB0aGlzLm0yID0gdGhpcy5ib2R5Mi5pbnZlcnNlTWFzcztcclxuXHJcbiAgICAgIHZhciBtMW0yID0gdGhpcy5tMSArIHRoaXMubTI7XHJcblxyXG4gICAgICB0aGlzLm51bSA9IHRoaXMubWFuaWZvbGQubnVtUG9pbnRzO1xyXG5cclxuICAgICAgdmFyIGMgPSB0aGlzLmNzO1xyXG4gICAgICB2YXIgcCwgcnZuLCBsZW4sIG5vckltcCwgbm9yVGFyLCBzZXBWLCBpMSwgaTI7XHJcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5udW07IGkrKykge1xyXG5cclxuICAgICAgICBwID0gdGhpcy5wc1tpXTtcclxuXHJcbiAgICAgICAgdGhpcy50bXBQMS5zdWIocC5wb3NpdGlvbiwgdGhpcy5wMSk7XHJcbiAgICAgICAgdGhpcy50bXBQMi5zdWIocC5wb3NpdGlvbiwgdGhpcy5wMik7XHJcblxyXG4gICAgICAgIHRoaXMudG1wQzEuY3Jvc3NWZWN0b3JzKHRoaXMuYXYxLCB0aGlzLnRtcFAxKTtcclxuICAgICAgICB0aGlzLnRtcEMyLmNyb3NzVmVjdG9ycyh0aGlzLmF2MiwgdGhpcy50bXBQMik7XHJcblxyXG4gICAgICAgIGMubm9ySW1wID0gcC5ub3JtYWxJbXB1bHNlO1xyXG4gICAgICAgIGMudGFuSW1wID0gcC50YW5nZW50SW1wdWxzZTtcclxuICAgICAgICBjLmJpbkltcCA9IHAuYmlub3JtYWxJbXB1bHNlO1xyXG5cclxuICAgICAgICBjLm5vci5jb3B5KHAubm9ybWFsKTtcclxuXHJcbiAgICAgICAgdGhpcy50bXAuc2V0KFxyXG5cclxuICAgICAgICAgICh0aGlzLmx2Mi54ICsgdGhpcy50bXBDMi54KSAtICh0aGlzLmx2MS54ICsgdGhpcy50bXBDMS54KSxcclxuICAgICAgICAgICh0aGlzLmx2Mi55ICsgdGhpcy50bXBDMi55KSAtICh0aGlzLmx2MS55ICsgdGhpcy50bXBDMS55KSxcclxuICAgICAgICAgICh0aGlzLmx2Mi56ICsgdGhpcy50bXBDMi56KSAtICh0aGlzLmx2MS56ICsgdGhpcy50bXBDMS56KVxyXG5cclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBydm4gPSBfTWF0aC5kb3RWZWN0b3JzKGMubm9yLCB0aGlzLnRtcCk7XHJcblxyXG4gICAgICAgIGMudGFuLnNldChcclxuICAgICAgICAgIHRoaXMudG1wLnggLSBydm4gKiBjLm5vci54LFxyXG4gICAgICAgICAgdGhpcy50bXAueSAtIHJ2biAqIGMubm9yLnksXHJcbiAgICAgICAgICB0aGlzLnRtcC56IC0gcnZuICogYy5ub3IuelxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGxlbiA9IF9NYXRoLmRvdFZlY3RvcnMoYy50YW4sIGMudGFuKTtcclxuXHJcbiAgICAgICAgaWYgKGxlbiA8PSAwLjA0KSB7XHJcbiAgICAgICAgICBjLnRhbi50YW5nZW50KGMubm9yKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGMudGFuLm5vcm1hbGl6ZSgpO1xyXG5cclxuICAgICAgICBjLmJpbi5jcm9zc1ZlY3RvcnMoYy5ub3IsIGMudGFuKTtcclxuXHJcbiAgICAgICAgYy5ub3JVMS5zY2FsZShjLm5vciwgdGhpcy5tMSk7XHJcbiAgICAgICAgYy5ub3JVMi5zY2FsZShjLm5vciwgdGhpcy5tMik7XHJcblxyXG4gICAgICAgIGMudGFuVTEuc2NhbGUoYy50YW4sIHRoaXMubTEpO1xyXG4gICAgICAgIGMudGFuVTIuc2NhbGUoYy50YW4sIHRoaXMubTIpO1xyXG5cclxuICAgICAgICBjLmJpblUxLnNjYWxlKGMuYmluLCB0aGlzLm0xKTtcclxuICAgICAgICBjLmJpblUyLnNjYWxlKGMuYmluLCB0aGlzLm0yKTtcclxuXHJcbiAgICAgICAgYy5ub3JUMS5jcm9zc1ZlY3RvcnModGhpcy50bXBQMSwgYy5ub3IpO1xyXG4gICAgICAgIGMudGFuVDEuY3Jvc3NWZWN0b3JzKHRoaXMudG1wUDEsIGMudGFuKTtcclxuICAgICAgICBjLmJpblQxLmNyb3NzVmVjdG9ycyh0aGlzLnRtcFAxLCBjLmJpbik7XHJcblxyXG4gICAgICAgIGMubm9yVDIuY3Jvc3NWZWN0b3JzKHRoaXMudG1wUDIsIGMubm9yKTtcclxuICAgICAgICBjLnRhblQyLmNyb3NzVmVjdG9ycyh0aGlzLnRtcFAyLCBjLnRhbik7XHJcbiAgICAgICAgYy5iaW5UMi5jcm9zc1ZlY3RvcnModGhpcy50bXBQMiwgYy5iaW4pO1xyXG5cclxuICAgICAgICBpMSA9IHRoaXMuaTE7XHJcbiAgICAgICAgaTIgPSB0aGlzLmkyO1xyXG5cclxuICAgICAgICBjLm5vclRVMS5jb3B5KGMubm9yVDEpLmFwcGx5TWF0cml4MyhpMSwgdHJ1ZSk7XHJcbiAgICAgICAgYy50YW5UVTEuY29weShjLnRhblQxKS5hcHBseU1hdHJpeDMoaTEsIHRydWUpO1xyXG4gICAgICAgIGMuYmluVFUxLmNvcHkoYy5iaW5UMSkuYXBwbHlNYXRyaXgzKGkxLCB0cnVlKTtcclxuXHJcbiAgICAgICAgYy5ub3JUVTIuY29weShjLm5vclQyKS5hcHBseU1hdHJpeDMoaTIsIHRydWUpO1xyXG4gICAgICAgIGMudGFuVFUyLmNvcHkoYy50YW5UMikuYXBwbHlNYXRyaXgzKGkyLCB0cnVlKTtcclxuICAgICAgICBjLmJpblRVMi5jb3B5KGMuYmluVDIpLmFwcGx5TWF0cml4MyhpMiwgdHJ1ZSk7XHJcblxyXG4gICAgICAgIC8qYy5ub3JUVTEubXVsTWF0KCB0aGlzLmkxLCBjLm5vclQxICk7XHJcbiAgICAgICAgYy50YW5UVTEubXVsTWF0KCB0aGlzLmkxLCBjLnRhblQxICk7XHJcbiAgICAgICAgYy5iaW5UVTEubXVsTWF0KCB0aGlzLmkxLCBjLmJpblQxICk7XHJcblxyXG4gICAgICAgIGMubm9yVFUyLm11bE1hdCggdGhpcy5pMiwgYy5ub3JUMiApO1xyXG4gICAgICAgIGMudGFuVFUyLm11bE1hdCggdGhpcy5pMiwgYy50YW5UMiApO1xyXG4gICAgICAgIGMuYmluVFUyLm11bE1hdCggdGhpcy5pMiwgYy5iaW5UMiApOyovXHJcblxyXG4gICAgICAgIHRoaXMudG1wQzEuY3Jvc3NWZWN0b3JzKGMubm9yVFUxLCB0aGlzLnRtcFAxKTtcclxuICAgICAgICB0aGlzLnRtcEMyLmNyb3NzVmVjdG9ycyhjLm5vclRVMiwgdGhpcy50bXBQMik7XHJcbiAgICAgICAgdGhpcy50bXAuYWRkKHRoaXMudG1wQzEsIHRoaXMudG1wQzIpO1xyXG4gICAgICAgIGMubm9yRGVuID0gMSAvIChtMW0yICsgX01hdGguZG90VmVjdG9ycyhjLm5vciwgdGhpcy50bXApKTtcclxuXHJcbiAgICAgICAgdGhpcy50bXBDMS5jcm9zc1ZlY3RvcnMoYy50YW5UVTEsIHRoaXMudG1wUDEpO1xyXG4gICAgICAgIHRoaXMudG1wQzIuY3Jvc3NWZWN0b3JzKGMudGFuVFUyLCB0aGlzLnRtcFAyKTtcclxuICAgICAgICB0aGlzLnRtcC5hZGQodGhpcy50bXBDMSwgdGhpcy50bXBDMik7XHJcbiAgICAgICAgYy50YW5EZW4gPSAxIC8gKG0xbTIgKyBfTWF0aC5kb3RWZWN0b3JzKGMudGFuLCB0aGlzLnRtcCkpO1xyXG5cclxuICAgICAgICB0aGlzLnRtcEMxLmNyb3NzVmVjdG9ycyhjLmJpblRVMSwgdGhpcy50bXBQMSk7XHJcbiAgICAgICAgdGhpcy50bXBDMi5jcm9zc1ZlY3RvcnMoYy5iaW5UVTIsIHRoaXMudG1wUDIpO1xyXG4gICAgICAgIHRoaXMudG1wLmFkZCh0aGlzLnRtcEMxLCB0aGlzLnRtcEMyKTtcclxuICAgICAgICBjLmJpbkRlbiA9IDEgLyAobTFtMiArIF9NYXRoLmRvdFZlY3RvcnMoYy5iaW4sIHRoaXMudG1wKSk7XHJcblxyXG4gICAgICAgIGlmIChwLndhcm1TdGFydGVkKSB7XHJcblxyXG4gICAgICAgICAgbm9ySW1wID0gcC5ub3JtYWxJbXB1bHNlO1xyXG5cclxuICAgICAgICAgIHRoaXMubHYxLmFkZFNjYWxlZFZlY3RvcihjLm5vclUxLCBub3JJbXApO1xyXG4gICAgICAgICAgdGhpcy5hdjEuYWRkU2NhbGVkVmVjdG9yKGMubm9yVFUxLCBub3JJbXApO1xyXG5cclxuICAgICAgICAgIHRoaXMubHYyLnN1YlNjYWxlZFZlY3RvcihjLm5vclUyLCBub3JJbXApO1xyXG4gICAgICAgICAgdGhpcy5hdjIuc3ViU2NhbGVkVmVjdG9yKGMubm9yVFUyLCBub3JJbXApO1xyXG5cclxuICAgICAgICAgIGMubm9ySW1wID0gbm9ySW1wO1xyXG4gICAgICAgICAgYy50YW5JbXAgPSAwO1xyXG4gICAgICAgICAgYy5iaW5JbXAgPSAwO1xyXG4gICAgICAgICAgcnZuID0gMDsgLy8gZGlzYWJsZSBib3VuY2luZ1xyXG5cclxuICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgIGMubm9ySW1wID0gMDtcclxuICAgICAgICAgIGMudGFuSW1wID0gMDtcclxuICAgICAgICAgIGMuYmluSW1wID0gMDtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgaWYgKHJ2biA+IC0xKSBydm4gPSAwOyAvLyBkaXNhYmxlIGJvdW5jaW5nXHJcblxyXG4gICAgICAgIG5vclRhciA9IHRoaXMucmVzdGl0dXRpb24gKiAtcnZuO1xyXG4gICAgICAgIHNlcFYgPSAtKHAucGVuZXRyYXRpb24gKyAwLjAwNSkgKiBpbnZUaW1lU3RlcCAqIDAuMDU7IC8vIGFsbG93IDAuNWNtIGVycm9yXHJcbiAgICAgICAgaWYgKG5vclRhciA8IHNlcFYpIG5vclRhciA9IHNlcFY7XHJcbiAgICAgICAgYy5ub3JUYXIgPSBub3JUYXI7XHJcbiAgICAgICAgYy5sYXN0ID0gaSA9PSB0aGlzLm51bSAtIDE7XHJcbiAgICAgICAgYyA9IGMubmV4dDtcclxuICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBzb2x2ZTogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgdGhpcy50bXBsdjEuY29weSh0aGlzLmx2MSk7XHJcbiAgICAgIHRoaXMudG1wbHYyLmNvcHkodGhpcy5sdjIpO1xyXG4gICAgICB0aGlzLnRtcGF2MS5jb3B5KHRoaXMuYXYxKTtcclxuICAgICAgdGhpcy50bXBhdjIuY29weSh0aGlzLmF2Mik7XHJcblxyXG4gICAgICB2YXIgb2xkSW1wMSwgbmV3SW1wMSwgb2xkSW1wMiwgbmV3SW1wMiwgcnZuLCBub3JJbXAsIHRhbkltcCwgYmluSW1wLCBtYXgsIGxlbjtcclxuXHJcbiAgICAgIHZhciBjID0gdGhpcy5jcztcclxuXHJcbiAgICAgIHdoaWxlICh0cnVlKSB7XHJcblxyXG4gICAgICAgIG5vckltcCA9IGMubm9ySW1wO1xyXG4gICAgICAgIHRhbkltcCA9IGMudGFuSW1wO1xyXG4gICAgICAgIGJpbkltcCA9IGMuYmluSW1wO1xyXG4gICAgICAgIG1heCA9IC1ub3JJbXAgKiB0aGlzLmZyaWN0aW9uO1xyXG5cclxuICAgICAgICB0aGlzLnRtcC5zdWIodGhpcy50bXBsdjIsIHRoaXMudG1wbHYxKTtcclxuXHJcbiAgICAgICAgcnZuID0gX01hdGguZG90VmVjdG9ycyh0aGlzLnRtcCwgYy50YW4pICsgX01hdGguZG90VmVjdG9ycyh0aGlzLnRtcGF2MiwgYy50YW5UMikgLSBfTWF0aC5kb3RWZWN0b3JzKHRoaXMudG1wYXYxLCBjLnRhblQxKTtcclxuXHJcbiAgICAgICAgb2xkSW1wMSA9IHRhbkltcDtcclxuICAgICAgICBuZXdJbXAxID0gcnZuICogYy50YW5EZW47XHJcbiAgICAgICAgdGFuSW1wICs9IG5ld0ltcDE7XHJcblxyXG4gICAgICAgIHJ2biA9IF9NYXRoLmRvdFZlY3RvcnModGhpcy50bXAsIGMuYmluKSArIF9NYXRoLmRvdFZlY3RvcnModGhpcy50bXBhdjIsIGMuYmluVDIpIC0gX01hdGguZG90VmVjdG9ycyh0aGlzLnRtcGF2MSwgYy5iaW5UMSk7XHJcblxyXG4gICAgICAgIG9sZEltcDIgPSBiaW5JbXA7XHJcbiAgICAgICAgbmV3SW1wMiA9IHJ2biAqIGMuYmluRGVuO1xyXG4gICAgICAgIGJpbkltcCArPSBuZXdJbXAyO1xyXG5cclxuICAgICAgICAvLyBjb25lIGZyaWN0aW9uIGNsYW1wXHJcbiAgICAgICAgbGVuID0gdGFuSW1wICogdGFuSW1wICsgYmluSW1wICogYmluSW1wO1xyXG4gICAgICAgIGlmIChsZW4gPiBtYXggKiBtYXgpIHtcclxuICAgICAgICAgIGxlbiA9IG1heCAvIF9NYXRoLnNxcnQobGVuKTtcclxuICAgICAgICAgIHRhbkltcCAqPSBsZW47XHJcbiAgICAgICAgICBiaW5JbXAgKj0gbGVuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbmV3SW1wMSA9IHRhbkltcCAtIG9sZEltcDE7XHJcbiAgICAgICAgbmV3SW1wMiA9IGJpbkltcCAtIG9sZEltcDI7XHJcblxyXG4gICAgICAgIC8vXHJcblxyXG4gICAgICAgIHRoaXMudG1wLnNldChcclxuICAgICAgICAgIGMudGFuVTEueCAqIG5ld0ltcDEgKyBjLmJpblUxLnggKiBuZXdJbXAyLFxyXG4gICAgICAgICAgYy50YW5VMS55ICogbmV3SW1wMSArIGMuYmluVTEueSAqIG5ld0ltcDIsXHJcbiAgICAgICAgICBjLnRhblUxLnogKiBuZXdJbXAxICsgYy5iaW5VMS56ICogbmV3SW1wMlxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIHRoaXMudG1wbHYxLmFkZEVxdWFsKHRoaXMudG1wKTtcclxuXHJcbiAgICAgICAgdGhpcy50bXAuc2V0KFxyXG4gICAgICAgICAgYy50YW5UVTEueCAqIG5ld0ltcDEgKyBjLmJpblRVMS54ICogbmV3SW1wMixcclxuICAgICAgICAgIGMudGFuVFUxLnkgKiBuZXdJbXAxICsgYy5iaW5UVTEueSAqIG5ld0ltcDIsXHJcbiAgICAgICAgICBjLnRhblRVMS56ICogbmV3SW1wMSArIGMuYmluVFUxLnogKiBuZXdJbXAyXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgdGhpcy50bXBhdjEuYWRkRXF1YWwodGhpcy50bXApO1xyXG5cclxuICAgICAgICB0aGlzLnRtcC5zZXQoXHJcbiAgICAgICAgICBjLnRhblUyLnggKiBuZXdJbXAxICsgYy5iaW5VMi54ICogbmV3SW1wMixcclxuICAgICAgICAgIGMudGFuVTIueSAqIG5ld0ltcDEgKyBjLmJpblUyLnkgKiBuZXdJbXAyLFxyXG4gICAgICAgICAgYy50YW5VMi56ICogbmV3SW1wMSArIGMuYmluVTIueiAqIG5ld0ltcDJcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICB0aGlzLnRtcGx2Mi5zdWJFcXVhbCh0aGlzLnRtcCk7XHJcblxyXG4gICAgICAgIHRoaXMudG1wLnNldChcclxuICAgICAgICAgIGMudGFuVFUyLnggKiBuZXdJbXAxICsgYy5iaW5UVTIueCAqIG5ld0ltcDIsXHJcbiAgICAgICAgICBjLnRhblRVMi55ICogbmV3SW1wMSArIGMuYmluVFUyLnkgKiBuZXdJbXAyLFxyXG4gICAgICAgICAgYy50YW5UVTIueiAqIG5ld0ltcDEgKyBjLmJpblRVMi56ICogbmV3SW1wMlxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIHRoaXMudG1wYXYyLnN1YkVxdWFsKHRoaXMudG1wKTtcclxuXHJcbiAgICAgICAgLy8gcmVzdGl0dXRpb24gcGFydFxyXG5cclxuICAgICAgICB0aGlzLnRtcC5zdWIodGhpcy50bXBsdjIsIHRoaXMudG1wbHYxKTtcclxuXHJcbiAgICAgICAgcnZuID0gX01hdGguZG90VmVjdG9ycyh0aGlzLnRtcCwgYy5ub3IpICsgX01hdGguZG90VmVjdG9ycyh0aGlzLnRtcGF2MiwgYy5ub3JUMikgLSBfTWF0aC5kb3RWZWN0b3JzKHRoaXMudG1wYXYxLCBjLm5vclQxKTtcclxuXHJcbiAgICAgICAgb2xkSW1wMSA9IG5vckltcDtcclxuICAgICAgICBuZXdJbXAxID0gKHJ2biAtIGMubm9yVGFyKSAqIGMubm9yRGVuO1xyXG4gICAgICAgIG5vckltcCArPSBuZXdJbXAxO1xyXG4gICAgICAgIGlmIChub3JJbXAgPiAwKSBub3JJbXAgPSAwO1xyXG5cclxuICAgICAgICBuZXdJbXAxID0gbm9ySW1wIC0gb2xkSW1wMTtcclxuXHJcbiAgICAgICAgdGhpcy50bXBsdjEuYWRkU2NhbGVkVmVjdG9yKGMubm9yVTEsIG5ld0ltcDEpO1xyXG4gICAgICAgIHRoaXMudG1wYXYxLmFkZFNjYWxlZFZlY3RvcihjLm5vclRVMSwgbmV3SW1wMSk7XHJcbiAgICAgICAgdGhpcy50bXBsdjIuc3ViU2NhbGVkVmVjdG9yKGMubm9yVTIsIG5ld0ltcDEpO1xyXG4gICAgICAgIHRoaXMudG1wYXYyLnN1YlNjYWxlZFZlY3RvcihjLm5vclRVMiwgbmV3SW1wMSk7XHJcblxyXG4gICAgICAgIGMubm9ySW1wID0gbm9ySW1wO1xyXG4gICAgICAgIGMudGFuSW1wID0gdGFuSW1wO1xyXG4gICAgICAgIGMuYmluSW1wID0gYmluSW1wO1xyXG5cclxuICAgICAgICBpZiAoYy5sYXN0KSBicmVhaztcclxuICAgICAgICBjID0gYy5uZXh0O1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLmx2MS5jb3B5KHRoaXMudG1wbHYxKTtcclxuICAgICAgdGhpcy5sdjIuY29weSh0aGlzLnRtcGx2Mik7XHJcbiAgICAgIHRoaXMuYXYxLmNvcHkodGhpcy50bXBhdjEpO1xyXG4gICAgICB0aGlzLmF2Mi5jb3B5KHRoaXMudG1wYXYyKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHBvc3RTb2x2ZTogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgdmFyIGMgPSB0aGlzLmNzLCBwO1xyXG4gICAgICB2YXIgaSA9IHRoaXMubnVtO1xyXG4gICAgICB3aGlsZSAoaS0tKSB7XHJcbiAgICAgICAgLy9mb3IodmFyIGk9MDtpPHRoaXMubnVtO2krKyl7XHJcbiAgICAgICAgcCA9IHRoaXMucHNbaV07XHJcbiAgICAgICAgcC5ub3JtYWwuY29weShjLm5vcik7XHJcbiAgICAgICAgcC50YW5nZW50LmNvcHkoYy50YW4pO1xyXG4gICAgICAgIHAuYmlub3JtYWwuY29weShjLmJpbik7XHJcblxyXG4gICAgICAgIHAubm9ybWFsSW1wdWxzZSA9IGMubm9ySW1wO1xyXG4gICAgICAgIHAudGFuZ2VudEltcHVsc2UgPSBjLnRhbkltcDtcclxuICAgICAgICBwLmJpbm9ybWFsSW1wdWxzZSA9IGMuYmluSW1wO1xyXG4gICAgICAgIHAubm9ybWFsRGVub21pbmF0b3IgPSBjLm5vckRlbjtcclxuICAgICAgICBwLnRhbmdlbnREZW5vbWluYXRvciA9IGMudGFuRGVuO1xyXG4gICAgICAgIHAuYmlub3JtYWxEZW5vbWluYXRvciA9IGMuYmluRGVuO1xyXG4gICAgICAgIGMgPSBjLm5leHQ7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgfSk7XHJcblxyXG4gIC8qKlxyXG4gICogQSBjb250YWN0IGlzIGEgcGFpciBvZiBzaGFwZXMgd2hvc2UgYXhpcy1hbGlnbmVkIGJvdW5kaW5nIGJveGVzIGFyZSBvdmVybGFwcGluZy5cclxuICAqIEBhdXRob3Igc2FoYXJhblxyXG4gICovXHJcblxyXG4gIGZ1bmN0aW9uIENvbnRhY3QoKSB7XHJcblxyXG4gICAgLy8gVGhlIGZpcnN0IHNoYXBlLlxyXG4gICAgdGhpcy5zaGFwZTEgPSBudWxsO1xyXG4gICAgLy8gVGhlIHNlY29uZCBzaGFwZS5cclxuICAgIHRoaXMuc2hhcGUyID0gbnVsbDtcclxuICAgIC8vIFRoZSBmaXJzdCByaWdpZCBib2R5LlxyXG4gICAgdGhpcy5ib2R5MSA9IG51bGw7XHJcbiAgICAvLyBUaGUgc2Vjb25kIHJpZ2lkIGJvZHkuXHJcbiAgICB0aGlzLmJvZHkyID0gbnVsbDtcclxuICAgIC8vIFRoZSBwcmV2aW91cyBjb250YWN0IGluIHRoZSB3b3JsZC5cclxuICAgIHRoaXMucHJldiA9IG51bGw7XHJcbiAgICAvLyBUaGUgbmV4dCBjb250YWN0IGluIHRoZSB3b3JsZC5cclxuICAgIHRoaXMubmV4dCA9IG51bGw7XHJcbiAgICAvLyBJbnRlcm5hbFxyXG4gICAgdGhpcy5wZXJzaXN0aW5nID0gZmFsc2U7XHJcbiAgICAvLyBXaGV0aGVyIGJvdGggdGhlIHJpZ2lkIGJvZGllcyBhcmUgc2xlZXBpbmcgb3Igbm90LlxyXG4gICAgdGhpcy5zbGVlcGluZyA9IGZhbHNlO1xyXG4gICAgLy8gVGhlIGNvbGxpc2lvbiBkZXRlY3RvciBiZXR3ZWVuIHR3byBzaGFwZXMuXHJcbiAgICB0aGlzLmRldGVjdG9yID0gbnVsbDtcclxuICAgIC8vIFRoZSBjb250YWN0IGNvbnN0cmFpbnQgb2YgdGhlIGNvbnRhY3QuXHJcbiAgICB0aGlzLmNvbnN0cmFpbnQgPSBudWxsO1xyXG4gICAgLy8gV2hldGhlciB0aGUgc2hhcGVzIGFyZSB0b3VjaGluZyBvciBub3QuXHJcbiAgICB0aGlzLnRvdWNoaW5nID0gZmFsc2U7XHJcbiAgICAvLyBzaGFwZXMgaXMgdmVyeSBjbG9zZSBhbmQgdG91Y2hpbmcgXHJcbiAgICB0aGlzLmNsb3NlID0gZmFsc2U7XHJcblxyXG4gICAgdGhpcy5kaXN0ID0gX01hdGguSU5GO1xyXG5cclxuICAgIHRoaXMuYjFMaW5rID0gbmV3IENvbnRhY3RMaW5rKHRoaXMpO1xyXG4gICAgdGhpcy5iMkxpbmsgPSBuZXcgQ29udGFjdExpbmsodGhpcyk7XHJcbiAgICB0aGlzLnMxTGluayA9IG5ldyBDb250YWN0TGluayh0aGlzKTtcclxuICAgIHRoaXMuczJMaW5rID0gbmV3IENvbnRhY3RMaW5rKHRoaXMpO1xyXG5cclxuICAgIC8vIFRoZSBjb250YWN0IG1hbmlmb2xkIG9mIHRoZSBjb250YWN0LlxyXG4gICAgdGhpcy5tYW5pZm9sZCA9IG5ldyBDb250YWN0TWFuaWZvbGQoKTtcclxuXHJcbiAgICB0aGlzLmJ1ZmZlciA9IFtcclxuXHJcbiAgICAgIG5ldyBJbXB1bHNlRGF0YUJ1ZmZlcigpLFxyXG4gICAgICBuZXcgSW1wdWxzZURhdGFCdWZmZXIoKSxcclxuICAgICAgbmV3IEltcHVsc2VEYXRhQnVmZmVyKCksXHJcbiAgICAgIG5ldyBJbXB1bHNlRGF0YUJ1ZmZlcigpXHJcblxyXG4gICAgXTtcclxuXHJcbiAgICB0aGlzLnBvaW50cyA9IHRoaXMubWFuaWZvbGQucG9pbnRzO1xyXG4gICAgdGhpcy5jb25zdHJhaW50ID0gbmV3IENvbnRhY3RDb25zdHJhaW50KHRoaXMubWFuaWZvbGQpO1xyXG5cclxuICB9XHJcblxyXG4gIE9iamVjdC5hc3NpZ24oQ29udGFjdC5wcm90b3R5cGUsIHtcclxuXHJcbiAgICBDb250YWN0OiB0cnVlLFxyXG5cclxuICAgIG1peFJlc3RpdHV0aW9uOiBmdW5jdGlvbiAocmVzdGl0dXRpb24xLCByZXN0aXR1dGlvbjIpIHtcclxuXHJcbiAgICAgIHJldHVybiBfTWF0aC5zcXJ0KHJlc3RpdHV0aW9uMSAqIHJlc3RpdHV0aW9uMik7XHJcblxyXG4gICAgfSxcclxuICAgIG1peEZyaWN0aW9uOiBmdW5jdGlvbiAoZnJpY3Rpb24xLCBmcmljdGlvbjIpIHtcclxuXHJcbiAgICAgIHJldHVybiBfTWF0aC5zcXJ0KGZyaWN0aW9uMSAqIGZyaWN0aW9uMik7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICogVXBkYXRlIHRoZSBjb250YWN0IG1hbmlmb2xkLlxyXG4gICAgKi9cclxuICAgIHVwZGF0ZU1hbmlmb2xkOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICB0aGlzLmNvbnN0cmFpbnQucmVzdGl0dXRpb24gPSB0aGlzLm1peFJlc3RpdHV0aW9uKHRoaXMuc2hhcGUxLnJlc3RpdHV0aW9uLCB0aGlzLnNoYXBlMi5yZXN0aXR1dGlvbik7XHJcbiAgICAgIHRoaXMuY29uc3RyYWludC5mcmljdGlvbiA9IHRoaXMubWl4RnJpY3Rpb24odGhpcy5zaGFwZTEuZnJpY3Rpb24sIHRoaXMuc2hhcGUyLmZyaWN0aW9uKTtcclxuICAgICAgdmFyIG51bUJ1ZmZlcnMgPSB0aGlzLm1hbmlmb2xkLm51bVBvaW50cztcclxuICAgICAgdmFyIGkgPSBudW1CdWZmZXJzO1xyXG4gICAgICB3aGlsZSAoaS0tKSB7XHJcbiAgICAgICAgLy9mb3IodmFyIGk9MDtpPG51bUJ1ZmZlcnM7aSsrKXtcclxuICAgICAgICB2YXIgYiA9IHRoaXMuYnVmZmVyW2ldO1xyXG4gICAgICAgIHZhciBwID0gdGhpcy5wb2ludHNbaV07XHJcbiAgICAgICAgYi5scDFYID0gcC5sb2NhbFBvaW50MS54O1xyXG4gICAgICAgIGIubHAxWSA9IHAubG9jYWxQb2ludDEueTtcclxuICAgICAgICBiLmxwMVogPSBwLmxvY2FsUG9pbnQxLno7XHJcbiAgICAgICAgYi5scDJYID0gcC5sb2NhbFBvaW50Mi54O1xyXG4gICAgICAgIGIubHAyWSA9IHAubG9jYWxQb2ludDIueTtcclxuICAgICAgICBiLmxwMlogPSBwLmxvY2FsUG9pbnQyLno7XHJcbiAgICAgICAgYi5pbXB1bHNlID0gcC5ub3JtYWxJbXB1bHNlO1xyXG4gICAgICB9XHJcbiAgICAgIHRoaXMubWFuaWZvbGQubnVtUG9pbnRzID0gMDtcclxuICAgICAgdGhpcy5kZXRlY3Rvci5kZXRlY3RDb2xsaXNpb24odGhpcy5zaGFwZTEsIHRoaXMuc2hhcGUyLCB0aGlzLm1hbmlmb2xkKTtcclxuICAgICAgdmFyIG51bSA9IHRoaXMubWFuaWZvbGQubnVtUG9pbnRzO1xyXG4gICAgICBpZiAobnVtID09IDApIHtcclxuICAgICAgICB0aGlzLnRvdWNoaW5nID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5jbG9zZSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuZGlzdCA9IF9NYXRoLklORjtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICh0aGlzLnRvdWNoaW5nIHx8IHRoaXMuZGlzdCA8IDAuMDAxKSB0aGlzLmNsb3NlID0gdHJ1ZTtcclxuICAgICAgdGhpcy50b3VjaGluZyA9IHRydWU7XHJcbiAgICAgIGkgPSBudW07XHJcbiAgICAgIHdoaWxlIChpLS0pIHtcclxuICAgICAgICAvL2ZvcihpPTA7IGk8bnVtOyBpKyspe1xyXG4gICAgICAgIHAgPSB0aGlzLnBvaW50c1tpXTtcclxuICAgICAgICB2YXIgbHAxeCA9IHAubG9jYWxQb2ludDEueDtcclxuICAgICAgICB2YXIgbHAxeSA9IHAubG9jYWxQb2ludDEueTtcclxuICAgICAgICB2YXIgbHAxeiA9IHAubG9jYWxQb2ludDEuejtcclxuICAgICAgICB2YXIgbHAyeCA9IHAubG9jYWxQb2ludDIueDtcclxuICAgICAgICB2YXIgbHAyeSA9IHAubG9jYWxQb2ludDIueTtcclxuICAgICAgICB2YXIgbHAyeiA9IHAubG9jYWxQb2ludDIuejtcclxuICAgICAgICB2YXIgaW5kZXggPSAtMTtcclxuICAgICAgICB2YXIgbWluRGlzdGFuY2UgPSAwLjAwMDQ7XHJcbiAgICAgICAgdmFyIGogPSBudW1CdWZmZXJzO1xyXG4gICAgICAgIHdoaWxlIChqLS0pIHtcclxuICAgICAgICAgIC8vZm9yKHZhciBqPTA7ajxudW1CdWZmZXJzO2orKyl7XHJcbiAgICAgICAgICBiID0gdGhpcy5idWZmZXJbal07XHJcbiAgICAgICAgICB2YXIgZHggPSBiLmxwMVggLSBscDF4O1xyXG4gICAgICAgICAgdmFyIGR5ID0gYi5scDFZIC0gbHAxeTtcclxuICAgICAgICAgIHZhciBkeiA9IGIubHAxWiAtIGxwMXo7XHJcbiAgICAgICAgICB2YXIgZGlzdGFuY2UxID0gZHggKiBkeCArIGR5ICogZHkgKyBkeiAqIGR6O1xyXG4gICAgICAgICAgZHggPSBiLmxwMlggLSBscDJ4O1xyXG4gICAgICAgICAgZHkgPSBiLmxwMlkgLSBscDJ5O1xyXG4gICAgICAgICAgZHogPSBiLmxwMlogLSBscDJ6O1xyXG4gICAgICAgICAgdmFyIGRpc3RhbmNlMiA9IGR4ICogZHggKyBkeSAqIGR5ICsgZHogKiBkejtcclxuICAgICAgICAgIGlmIChkaXN0YW5jZTEgPCBkaXN0YW5jZTIpIHtcclxuICAgICAgICAgICAgaWYgKGRpc3RhbmNlMSA8IG1pbkRpc3RhbmNlKSB7XHJcbiAgICAgICAgICAgICAgbWluRGlzdGFuY2UgPSBkaXN0YW5jZTE7XHJcbiAgICAgICAgICAgICAgaW5kZXggPSBqO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAoZGlzdGFuY2UyIDwgbWluRGlzdGFuY2UpIHtcclxuICAgICAgICAgICAgICBtaW5EaXN0YW5jZSA9IGRpc3RhbmNlMjtcclxuICAgICAgICAgICAgICBpbmRleCA9IGo7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBpZiAobWluRGlzdGFuY2UgPCB0aGlzLmRpc3QpIHRoaXMuZGlzdCA9IG1pbkRpc3RhbmNlO1xyXG5cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGluZGV4ICE9IC0xKSB7XHJcbiAgICAgICAgICB2YXIgdG1wID0gdGhpcy5idWZmZXJbaW5kZXhdO1xyXG4gICAgICAgICAgdGhpcy5idWZmZXJbaW5kZXhdID0gdGhpcy5idWZmZXJbLS1udW1CdWZmZXJzXTtcclxuICAgICAgICAgIHRoaXMuYnVmZmVyW251bUJ1ZmZlcnNdID0gdG1wO1xyXG4gICAgICAgICAgcC5ub3JtYWxJbXB1bHNlID0gdG1wLmltcHVsc2U7XHJcbiAgICAgICAgICBwLndhcm1TdGFydGVkID0gdHJ1ZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgcC5ub3JtYWxJbXB1bHNlID0gMDtcclxuICAgICAgICAgIHAud2FybVN0YXJ0ZWQgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvKipcclxuICAgICogQXR0YWNoIHRoZSBjb250YWN0IHRvIHRoZSBzaGFwZXMuXHJcbiAgICAqIEBwYXJhbSAgIHNoYXBlMVxyXG4gICAgKiBAcGFyYW0gICBzaGFwZTJcclxuICAgICovXHJcbiAgICBhdHRhY2g6IGZ1bmN0aW9uIChzaGFwZTEsIHNoYXBlMikge1xyXG4gICAgICB0aGlzLnNoYXBlMSA9IHNoYXBlMTtcclxuICAgICAgdGhpcy5zaGFwZTIgPSBzaGFwZTI7XHJcbiAgICAgIHRoaXMuYm9keTEgPSBzaGFwZTEucGFyZW50O1xyXG4gICAgICB0aGlzLmJvZHkyID0gc2hhcGUyLnBhcmVudDtcclxuXHJcbiAgICAgIHRoaXMubWFuaWZvbGQuYm9keTEgPSB0aGlzLmJvZHkxO1xyXG4gICAgICB0aGlzLm1hbmlmb2xkLmJvZHkyID0gdGhpcy5ib2R5MjtcclxuICAgICAgdGhpcy5jb25zdHJhaW50LmJvZHkxID0gdGhpcy5ib2R5MTtcclxuICAgICAgdGhpcy5jb25zdHJhaW50LmJvZHkyID0gdGhpcy5ib2R5MjtcclxuICAgICAgdGhpcy5jb25zdHJhaW50LmF0dGFjaCgpO1xyXG5cclxuICAgICAgdGhpcy5zMUxpbmsuc2hhcGUgPSBzaGFwZTI7XHJcbiAgICAgIHRoaXMuczFMaW5rLmJvZHkgPSB0aGlzLmJvZHkyO1xyXG4gICAgICB0aGlzLnMyTGluay5zaGFwZSA9IHNoYXBlMTtcclxuICAgICAgdGhpcy5zMkxpbmsuYm9keSA9IHRoaXMuYm9keTE7XHJcblxyXG4gICAgICBpZiAoc2hhcGUxLmNvbnRhY3RMaW5rICE9IG51bGwpICh0aGlzLnMxTGluay5uZXh0ID0gc2hhcGUxLmNvbnRhY3RMaW5rKS5wcmV2ID0gdGhpcy5zMUxpbms7XHJcbiAgICAgIGVsc2UgdGhpcy5zMUxpbmsubmV4dCA9IG51bGw7XHJcbiAgICAgIHNoYXBlMS5jb250YWN0TGluayA9IHRoaXMuczFMaW5rO1xyXG4gICAgICBzaGFwZTEubnVtQ29udGFjdHMrKztcclxuXHJcbiAgICAgIGlmIChzaGFwZTIuY29udGFjdExpbmsgIT0gbnVsbCkgKHRoaXMuczJMaW5rLm5leHQgPSBzaGFwZTIuY29udGFjdExpbmspLnByZXYgPSB0aGlzLnMyTGluaztcclxuICAgICAgZWxzZSB0aGlzLnMyTGluay5uZXh0ID0gbnVsbDtcclxuICAgICAgc2hhcGUyLmNvbnRhY3RMaW5rID0gdGhpcy5zMkxpbms7XHJcbiAgICAgIHNoYXBlMi5udW1Db250YWN0cysrO1xyXG5cclxuICAgICAgdGhpcy5iMUxpbmsuc2hhcGUgPSBzaGFwZTI7XHJcbiAgICAgIHRoaXMuYjFMaW5rLmJvZHkgPSB0aGlzLmJvZHkyO1xyXG4gICAgICB0aGlzLmIyTGluay5zaGFwZSA9IHNoYXBlMTtcclxuICAgICAgdGhpcy5iMkxpbmsuYm9keSA9IHRoaXMuYm9keTE7XHJcblxyXG4gICAgICBpZiAodGhpcy5ib2R5MS5jb250YWN0TGluayAhPSBudWxsKSAodGhpcy5iMUxpbmsubmV4dCA9IHRoaXMuYm9keTEuY29udGFjdExpbmspLnByZXYgPSB0aGlzLmIxTGluaztcclxuICAgICAgZWxzZSB0aGlzLmIxTGluay5uZXh0ID0gbnVsbDtcclxuICAgICAgdGhpcy5ib2R5MS5jb250YWN0TGluayA9IHRoaXMuYjFMaW5rO1xyXG4gICAgICB0aGlzLmJvZHkxLm51bUNvbnRhY3RzKys7XHJcblxyXG4gICAgICBpZiAodGhpcy5ib2R5Mi5jb250YWN0TGluayAhPSBudWxsKSAodGhpcy5iMkxpbmsubmV4dCA9IHRoaXMuYm9keTIuY29udGFjdExpbmspLnByZXYgPSB0aGlzLmIyTGluaztcclxuICAgICAgZWxzZSB0aGlzLmIyTGluay5uZXh0ID0gbnVsbDtcclxuICAgICAgdGhpcy5ib2R5Mi5jb250YWN0TGluayA9IHRoaXMuYjJMaW5rO1xyXG4gICAgICB0aGlzLmJvZHkyLm51bUNvbnRhY3RzKys7XHJcblxyXG4gICAgICB0aGlzLnByZXYgPSBudWxsO1xyXG4gICAgICB0aGlzLm5leHQgPSBudWxsO1xyXG5cclxuICAgICAgdGhpcy5wZXJzaXN0aW5nID0gdHJ1ZTtcclxuICAgICAgdGhpcy5zbGVlcGluZyA9IHRoaXMuYm9keTEuc2xlZXBpbmcgJiYgdGhpcy5ib2R5Mi5zbGVlcGluZztcclxuICAgICAgdGhpcy5tYW5pZm9sZC5udW1Qb2ludHMgPSAwO1xyXG4gICAgfSxcclxuICAgIC8qKlxyXG4gICAgKiBEZXRhY2ggdGhlIGNvbnRhY3QgZnJvbSB0aGUgc2hhcGVzLlxyXG4gICAgKi9cclxuICAgIGRldGFjaDogZnVuY3Rpb24gKCkge1xyXG4gICAgICB2YXIgcHJldiA9IHRoaXMuczFMaW5rLnByZXY7XHJcbiAgICAgIHZhciBuZXh0ID0gdGhpcy5zMUxpbmsubmV4dDtcclxuICAgICAgaWYgKHByZXYgIT09IG51bGwpIHByZXYubmV4dCA9IG5leHQ7XHJcbiAgICAgIGlmIChuZXh0ICE9PSBudWxsKSBuZXh0LnByZXYgPSBwcmV2O1xyXG4gICAgICBpZiAodGhpcy5zaGFwZTEuY29udGFjdExpbmsgPT0gdGhpcy5zMUxpbmspIHRoaXMuc2hhcGUxLmNvbnRhY3RMaW5rID0gbmV4dDtcclxuICAgICAgdGhpcy5zMUxpbmsucHJldiA9IG51bGw7XHJcbiAgICAgIHRoaXMuczFMaW5rLm5leHQgPSBudWxsO1xyXG4gICAgICB0aGlzLnMxTGluay5zaGFwZSA9IG51bGw7XHJcbiAgICAgIHRoaXMuczFMaW5rLmJvZHkgPSBudWxsO1xyXG4gICAgICB0aGlzLnNoYXBlMS5udW1Db250YWN0cy0tO1xyXG5cclxuICAgICAgcHJldiA9IHRoaXMuczJMaW5rLnByZXY7XHJcbiAgICAgIG5leHQgPSB0aGlzLnMyTGluay5uZXh0O1xyXG4gICAgICBpZiAocHJldiAhPT0gbnVsbCkgcHJldi5uZXh0ID0gbmV4dDtcclxuICAgICAgaWYgKG5leHQgIT09IG51bGwpIG5leHQucHJldiA9IHByZXY7XHJcbiAgICAgIGlmICh0aGlzLnNoYXBlMi5jb250YWN0TGluayA9PSB0aGlzLnMyTGluaykgdGhpcy5zaGFwZTIuY29udGFjdExpbmsgPSBuZXh0O1xyXG4gICAgICB0aGlzLnMyTGluay5wcmV2ID0gbnVsbDtcclxuICAgICAgdGhpcy5zMkxpbmsubmV4dCA9IG51bGw7XHJcbiAgICAgIHRoaXMuczJMaW5rLnNoYXBlID0gbnVsbDtcclxuICAgICAgdGhpcy5zMkxpbmsuYm9keSA9IG51bGw7XHJcbiAgICAgIHRoaXMuc2hhcGUyLm51bUNvbnRhY3RzLS07XHJcblxyXG4gICAgICBwcmV2ID0gdGhpcy5iMUxpbmsucHJldjtcclxuICAgICAgbmV4dCA9IHRoaXMuYjFMaW5rLm5leHQ7XHJcbiAgICAgIGlmIChwcmV2ICE9PSBudWxsKSBwcmV2Lm5leHQgPSBuZXh0O1xyXG4gICAgICBpZiAobmV4dCAhPT0gbnVsbCkgbmV4dC5wcmV2ID0gcHJldjtcclxuICAgICAgaWYgKHRoaXMuYm9keTEuY29udGFjdExpbmsgPT0gdGhpcy5iMUxpbmspIHRoaXMuYm9keTEuY29udGFjdExpbmsgPSBuZXh0O1xyXG4gICAgICB0aGlzLmIxTGluay5wcmV2ID0gbnVsbDtcclxuICAgICAgdGhpcy5iMUxpbmsubmV4dCA9IG51bGw7XHJcbiAgICAgIHRoaXMuYjFMaW5rLnNoYXBlID0gbnVsbDtcclxuICAgICAgdGhpcy5iMUxpbmsuYm9keSA9IG51bGw7XHJcbiAgICAgIHRoaXMuYm9keTEubnVtQ29udGFjdHMtLTtcclxuXHJcbiAgICAgIHByZXYgPSB0aGlzLmIyTGluay5wcmV2O1xyXG4gICAgICBuZXh0ID0gdGhpcy5iMkxpbmsubmV4dDtcclxuICAgICAgaWYgKHByZXYgIT09IG51bGwpIHByZXYubmV4dCA9IG5leHQ7XHJcbiAgICAgIGlmIChuZXh0ICE9PSBudWxsKSBuZXh0LnByZXYgPSBwcmV2O1xyXG4gICAgICBpZiAodGhpcy5ib2R5Mi5jb250YWN0TGluayA9PSB0aGlzLmIyTGluaykgdGhpcy5ib2R5Mi5jb250YWN0TGluayA9IG5leHQ7XHJcbiAgICAgIHRoaXMuYjJMaW5rLnByZXYgPSBudWxsO1xyXG4gICAgICB0aGlzLmIyTGluay5uZXh0ID0gbnVsbDtcclxuICAgICAgdGhpcy5iMkxpbmsuc2hhcGUgPSBudWxsO1xyXG4gICAgICB0aGlzLmIyTGluay5ib2R5ID0gbnVsbDtcclxuICAgICAgdGhpcy5ib2R5Mi5udW1Db250YWN0cy0tO1xyXG5cclxuICAgICAgdGhpcy5tYW5pZm9sZC5ib2R5MSA9IG51bGw7XHJcbiAgICAgIHRoaXMubWFuaWZvbGQuYm9keTIgPSBudWxsO1xyXG4gICAgICB0aGlzLmNvbnN0cmFpbnQuYm9keTEgPSBudWxsO1xyXG4gICAgICB0aGlzLmNvbnN0cmFpbnQuYm9keTIgPSBudWxsO1xyXG4gICAgICB0aGlzLmNvbnN0cmFpbnQuZGV0YWNoKCk7XHJcblxyXG4gICAgICB0aGlzLnNoYXBlMSA9IG51bGw7XHJcbiAgICAgIHRoaXMuc2hhcGUyID0gbnVsbDtcclxuICAgICAgdGhpcy5ib2R5MSA9IG51bGw7XHJcbiAgICAgIHRoaXMuYm9keTIgPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICB9KTtcclxuXHJcbiAgLyoqXHJcbiAgKiBUaGUgY2xhc3Mgb2YgcmlnaWQgYm9keS5cclxuICAqIFJpZ2lkIGJvZHkgaGFzIHRoZSBzaGFwZSBvZiBhIHNpbmdsZSBvciBtdWx0aXBsZSBjb2xsaXNpb24gcHJvY2Vzc2luZyxcclxuICAqIEkgY2FuIHNldCB0aGUgcGFyYW1ldGVycyBpbmRpdmlkdWFsbHkuXHJcbiAgKiBAYXV0aG9yIHNhaGFyYW5cclxuICAqIEBhdXRob3IgbG8tdGhcclxuICAqL1xyXG5cclxuICBmdW5jdGlvbiBSaWdpZEJvZHkoUG9zaXRpb24sIFJvdGF0aW9uKSB7XHJcblxyXG4gICAgdGhpcy5wb3NpdGlvbiA9IFBvc2l0aW9uIHx8IG5ldyBWZWMzKCk7XHJcbiAgICB0aGlzLm9yaWVudGF0aW9uID0gUm90YXRpb24gfHwgbmV3IFF1YXQoKTtcclxuXHJcbiAgICB0aGlzLnNjYWxlID0gMTtcclxuICAgIHRoaXMuaW52U2NhbGUgPSAxO1xyXG5cclxuICAgIC8vIHBvc3NpYmxlIGxpbmsgdG8gdGhyZWUgTWVzaDtcclxuICAgIHRoaXMubWVzaCA9IG51bGw7XHJcblxyXG4gICAgdGhpcy5pZCA9IE5hTjtcclxuICAgIHRoaXMubmFtZSA9IFwiXCI7XHJcbiAgICAvLyBUaGUgbWF4aW11bSBudW1iZXIgb2Ygc2hhcGVzIHRoYXQgY2FuIGJlIGFkZGVkIHRvIGEgb25lIHJpZ2lkLlxyXG4gICAgLy90aGlzLk1BWF9TSEFQRVMgPSA2NDsvLzY0O1xyXG5cclxuICAgIHRoaXMucHJldiA9IG51bGw7XHJcbiAgICB0aGlzLm5leHQgPSBudWxsO1xyXG5cclxuICAgIC8vIEkgcmVwcmVzZW50IHRoZSBraW5kIG9mIHJpZ2lkIGJvZHkuXHJcbiAgICAvLyBQbGVhc2UgZG8gbm90IGNoYW5nZSBmcm9tIHRoZSBvdXRzaWRlIHRoaXMgdmFyaWFibGUuXHJcbiAgICAvLyBJZiB5b3Ugd2FudCB0byBjaGFuZ2UgdGhlIHR5cGUgb2YgcmlnaWQgYm9keSwgYWx3YXlzXHJcbiAgICAvLyBQbGVhc2Ugc3BlY2lmeSB0aGUgdHlwZSB5b3Ugd2FudCB0byBzZXQgdGhlIGFyZ3VtZW50cyBvZiBzZXR1cE1hc3MgbWV0aG9kLlxyXG4gICAgdGhpcy50eXBlID0gQk9EWV9OVUxMO1xyXG5cclxuICAgIHRoaXMubWFzc0luZm8gPSBuZXcgTWFzc0luZm8oKTtcclxuXHJcbiAgICB0aGlzLm5ld1Bvc2l0aW9uID0gbmV3IFZlYzMoKTtcclxuICAgIHRoaXMuY29udHJvbFBvcyA9IGZhbHNlO1xyXG4gICAgdGhpcy5uZXdPcmllbnRhdGlvbiA9IG5ldyBRdWF0KCk7XHJcbiAgICB0aGlzLm5ld1JvdGF0aW9uID0gbmV3IFZlYzMoKTtcclxuICAgIHRoaXMuY3VycmVudFJvdGF0aW9uID0gbmV3IFZlYzMoKTtcclxuICAgIHRoaXMuY29udHJvbFJvdCA9IGZhbHNlO1xyXG4gICAgdGhpcy5jb250cm9sUm90SW5UaW1lID0gZmFsc2U7XHJcblxyXG4gICAgdGhpcy5xdWF0ZXJuaW9uID0gbmV3IFF1YXQoKTtcclxuICAgIHRoaXMucG9zID0gbmV3IFZlYzMoKTtcclxuXHJcblxyXG5cclxuICAgIC8vIElzIHRoZSB0cmFuc2xhdGlvbmFsIHZlbG9jaXR5LlxyXG4gICAgdGhpcy5saW5lYXJWZWxvY2l0eSA9IG5ldyBWZWMzKCk7XHJcbiAgICAvLyBJcyB0aGUgYW5ndWxhciB2ZWxvY2l0eS5cclxuICAgIHRoaXMuYW5ndWxhclZlbG9jaXR5ID0gbmV3IFZlYzMoKTtcclxuXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgUGxlYXNlIGRvIG5vdCBjaGFuZ2UgZnJvbSB0aGUgb3V0c2lkZSB0aGlzIHZhcmlhYmxlcy5cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICAvLyBJdCBpcyBhIHdvcmxkIHRoYXQgcmlnaWQgYm9keSBoYXMgYmVlbiBhZGRlZC5cclxuICAgIHRoaXMucGFyZW50ID0gbnVsbDtcclxuICAgIHRoaXMuY29udGFjdExpbmsgPSBudWxsO1xyXG4gICAgdGhpcy5udW1Db250YWN0cyA9IDA7XHJcblxyXG4gICAgLy8gQW4gYXJyYXkgb2Ygc2hhcGVzIHRoYXQgYXJlIGluY2x1ZGVkIGluIHRoZSByaWdpZCBib2R5LlxyXG4gICAgdGhpcy5zaGFwZXMgPSBudWxsO1xyXG4gICAgLy8gVGhlIG51bWJlciBvZiBzaGFwZXMgdGhhdCBhcmUgaW5jbHVkZWQgaW4gdGhlIHJpZ2lkIGJvZHkuXHJcbiAgICB0aGlzLm51bVNoYXBlcyA9IDA7XHJcblxyXG4gICAgLy8gSXQgaXMgdGhlIGxpbmsgYXJyYXkgb2Ygam9pbnQgdGhhdCBpcyBjb25uZWN0ZWQgdG8gdGhlIHJpZ2lkIGJvZHkuXHJcbiAgICB0aGlzLmpvaW50TGluayA9IG51bGw7XHJcbiAgICAvLyBUaGUgbnVtYmVyIG9mIGpvaW50cyB0aGF0IGFyZSBjb25uZWN0ZWQgdG8gdGhlIHJpZ2lkIGJvZHkuXHJcbiAgICB0aGlzLm51bUpvaW50cyA9IDA7XHJcblxyXG4gICAgLy8gSXQgaXMgdGhlIHdvcmxkIGNvb3JkaW5hdGUgb2YgdGhlIGNlbnRlciBvZiBncmF2aXR5IGluIHRoZSBzbGVlcCBqdXN0IGJlZm9yZS5cclxuICAgIHRoaXMuc2xlZXBQb3NpdGlvbiA9IG5ldyBWZWMzKCk7XHJcbiAgICAvLyBJdCBpcyBhIHF1YXRlcm5pb24gdGhhdCByZXByZXNlbnRzIHRoZSBhdHRpdHVkZSBvZiBzbGVlcCBqdXN0IGJlZm9yZS5cclxuICAgIHRoaXMuc2xlZXBPcmllbnRhdGlvbiA9IG5ldyBRdWF0KCk7XHJcbiAgICAvLyBJIHdpbGwgc2hvdyB0aGlzIHJpZ2lkIGJvZHkgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgaXQgaXMgYSByaWdpZCBib2R5IHN0YXRpYy5cclxuICAgIHRoaXMuaXNTdGF0aWMgPSBmYWxzZTtcclxuICAgIC8vIEkgaW5kaWNhdGVzIHRoYXQgdGhpcyByaWdpZCBib2R5IHRvIGRldGVybWluZSB3aGV0aGVyIGl0IGlzIGEgcmlnaWQgYm9keSBkeW5hbWljLlxyXG4gICAgdGhpcy5pc0R5bmFtaWMgPSBmYWxzZTtcclxuXHJcbiAgICB0aGlzLmlzS2luZW1hdGljID0gZmFsc2U7XHJcblxyXG4gICAgLy8gSXQgaXMgYSByb3RhdGlvbiBtYXRyaXggcmVwcmVzZW50aW5nIHRoZSBvcmllbnRhdGlvbi5cclxuICAgIHRoaXMucm90YXRpb24gPSBuZXcgTWF0MzMoKTtcclxuXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyBJdCB3aWxsIGJlIHJlY2FsY3VsYXRlZCBhdXRvbWF0aWNhbGx5IGZyb20gdGhlIHNoYXBlLCB3aGljaCBpcyBpbmNsdWRlZC5cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICAvLyBUaGlzIGlzIHRoZSB3ZWlnaHQuXHJcbiAgICB0aGlzLm1hc3MgPSAwO1xyXG4gICAgLy8gSXQgaXMgdGhlIHJlY2lwcm9jYWwgb2YgdGhlIG1hc3MuXHJcbiAgICB0aGlzLmludmVyc2VNYXNzID0gMDtcclxuICAgIC8vIEl0IGlzIHRoZSBpbnZlcnNlIG9mIHRoZSBpbmVydGlhIHRlbnNvciBpbiB0aGUgd29ybGQgc3lzdGVtLlxyXG4gICAgdGhpcy5pbnZlcnNlSW5lcnRpYSA9IG5ldyBNYXQzMygpO1xyXG4gICAgLy8gSXQgaXMgdGhlIGluZXJ0aWEgdGVuc29yIGluIHRoZSBpbml0aWFsIHN0YXRlLlxyXG4gICAgdGhpcy5sb2NhbEluZXJ0aWEgPSBuZXcgTWF0MzMoKTtcclxuICAgIC8vIEl0IGlzIHRoZSBpbnZlcnNlIG9mIHRoZSBpbmVydGlhIHRlbnNvciBpbiB0aGUgaW5pdGlhbCBzdGF0ZS5cclxuICAgIHRoaXMuaW52ZXJzZUxvY2FsSW5lcnRpYSA9IG5ldyBNYXQzMygpO1xyXG5cclxuICAgIHRoaXMudG1wSW5lcnRpYSA9IG5ldyBNYXQzMygpO1xyXG5cclxuXHJcbiAgICAvLyBJIGluZGljYXRlcyByaWdpZCBib2R5IHdoZXRoZXIgaXQgaGFzIGJlZW4gYWRkZWQgdG8gdGhlIHNpbXVsYXRpb24gSXNsYW5kLlxyXG4gICAgdGhpcy5hZGRlZFRvSXNsYW5kID0gZmFsc2U7XHJcbiAgICAvLyBJdCBzaG93cyBob3cgdG8gc2xlZXAgcmlnaWQgYm9keS5cclxuICAgIHRoaXMuYWxsb3dTbGVlcCA9IHRydWU7XHJcbiAgICAvLyBUaGlzIGlzIHRoZSB0aW1lIGZyb20gd2hlbiB0aGUgcmlnaWQgYm9keSBhdCByZXN0LlxyXG4gICAgdGhpcy5zbGVlcFRpbWUgPSAwO1xyXG4gICAgLy8gSSBzaG93cyByaWdpZCBib2R5IHRvIGRldGVybWluZSB3aGV0aGVyIGl0IGlzIGEgc2xlZXAgc3RhdGUuXHJcbiAgICB0aGlzLnNsZWVwaW5nID0gZmFsc2U7XHJcblxyXG4gIH1cclxuXHJcbiAgT2JqZWN0LmFzc2lnbihSaWdpZEJvZHkucHJvdG90eXBlLCB7XHJcblxyXG4gICAgc2V0UGFyZW50OiBmdW5jdGlvbiAod29ybGQpIHtcclxuXHJcbiAgICAgIHRoaXMucGFyZW50ID0gd29ybGQ7XHJcbiAgICAgIHRoaXMuc2NhbGUgPSB0aGlzLnBhcmVudC5zY2FsZTtcclxuICAgICAgdGhpcy5pbnZTY2FsZSA9IHRoaXMucGFyZW50LmludlNjYWxlO1xyXG4gICAgICB0aGlzLmlkID0gdGhpcy5wYXJlbnQubnVtUmlnaWRCb2RpZXM7XHJcbiAgICAgIGlmICghdGhpcy5uYW1lKSB0aGlzLm5hbWUgPSB0aGlzLmlkO1xyXG5cclxuICAgICAgdGhpcy51cGRhdGVNZXNoKCk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIEknbGwgYWRkIGEgc2hhcGUgdG8gcmlnaWQgYm9keS5cclxuICAgICAqIElmIHlvdSBhZGQgYSBzaGFwZSwgcGxlYXNlIGNhbGwgdGhlIHNldHVwTWFzcyBtZXRob2QgdG8gc3RlcCB1cCB0byB0aGUgc3RhcnQgb2YgdGhlIG5leHQuXHJcbiAgICAgKiBAcGFyYW0gICBzaGFwZSBzaGFwZSB0byBBZGRcclxuICAgICAqL1xyXG4gICAgYWRkU2hhcGU6IGZ1bmN0aW9uIChzaGFwZSkge1xyXG5cclxuICAgICAgaWYgKHNoYXBlLnBhcmVudCkge1xyXG4gICAgICAgIHByaW50RXJyb3IoXCJSaWdpZEJvZHlcIiwgXCJJdCBpcyBub3QgcG9zc2libGUgdGhhdCB5b3UgYWRkIGEgc2hhcGUgd2hpY2ggYWxyZWFkeSBoYXMgYW4gYXNzb2NpYXRlZCBib2R5LlwiKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKHRoaXMuc2hhcGVzICE9IG51bGwpICh0aGlzLnNoYXBlcy5wcmV2ID0gc2hhcGUpLm5leHQgPSB0aGlzLnNoYXBlcztcclxuICAgICAgdGhpcy5zaGFwZXMgPSBzaGFwZTtcclxuICAgICAgc2hhcGUucGFyZW50ID0gdGhpcztcclxuICAgICAgaWYgKHRoaXMucGFyZW50KSB0aGlzLnBhcmVudC5hZGRTaGFwZShzaGFwZSk7XHJcbiAgICAgIHRoaXMubnVtU2hhcGVzKys7XHJcblxyXG4gICAgfSxcclxuICAgIC8qKlxyXG4gICAgICogSSB3aWxsIGRlbGV0ZSB0aGUgc2hhcGUgZnJvbSB0aGUgcmlnaWQgYm9keS5cclxuICAgICAqIElmIHlvdSBkZWxldGUgYSBzaGFwZSwgcGxlYXNlIGNhbGwgdGhlIHNldHVwTWFzcyBtZXRob2QgdG8gc3RlcCB1cCB0byB0aGUgc3RhcnQgb2YgdGhlIG5leHQuXHJcbiAgICAgKiBAcGFyYW0gc2hhcGUge1NoYXBlfSB0byBkZWxldGVcclxuICAgICAqIEByZXR1cm4gdm9pZFxyXG4gICAgICovXHJcbiAgICByZW1vdmVTaGFwZTogZnVuY3Rpb24gKHNoYXBlKSB7XHJcblxyXG4gICAgICB2YXIgcmVtb3ZlID0gc2hhcGU7XHJcbiAgICAgIGlmIChyZW1vdmUucGFyZW50ICE9IHRoaXMpIHJldHVybjtcclxuICAgICAgdmFyIHByZXYgPSByZW1vdmUucHJldjtcclxuICAgICAgdmFyIG5leHQgPSByZW1vdmUubmV4dDtcclxuICAgICAgaWYgKHByZXYgIT0gbnVsbCkgcHJldi5uZXh0ID0gbmV4dDtcclxuICAgICAgaWYgKG5leHQgIT0gbnVsbCkgbmV4dC5wcmV2ID0gcHJldjtcclxuICAgICAgaWYgKHRoaXMuc2hhcGVzID09IHJlbW92ZSkgdGhpcy5zaGFwZXMgPSBuZXh0O1xyXG4gICAgICByZW1vdmUucHJldiA9IG51bGw7XHJcbiAgICAgIHJlbW92ZS5uZXh0ID0gbnVsbDtcclxuICAgICAgcmVtb3ZlLnBhcmVudCA9IG51bGw7XHJcbiAgICAgIGlmICh0aGlzLnBhcmVudCkgdGhpcy5wYXJlbnQucmVtb3ZlU2hhcGUocmVtb3ZlKTtcclxuICAgICAgdGhpcy5udW1TaGFwZXMtLTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHJlbW92ZTogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgdGhpcy5kaXNwb3NlKCk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBkaXNwb3NlOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICB0aGlzLnBhcmVudC5yZW1vdmVSaWdpZEJvZHkodGhpcyk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBjaGVja0NvbnRhY3Q6IGZ1bmN0aW9uIChuYW1lKSB7XHJcblxyXG4gICAgICB0aGlzLnBhcmVudC5jaGVja0NvbnRhY3QodGhpcy5uYW1lLCBuYW1lKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2FsdWxhdGVzIG1hc3MgZGF0YXMoY2VudGVyIG9mIGdyYXZpdHksIG1hc3MsIG1vbWVudCBpbmVydGlhLCBldGMuLi4pLlxyXG4gICAgICogSWYgdGhlIHBhcmFtZXRlciB0eXBlIGlzIHNldCB0byBCT0RZX1NUQVRJQywgdGhlIHJpZ2lkIGJvZHkgd2lsbCBiZSBmaXhlZCB0byB0aGUgc3BhY2UuXHJcbiAgICAgKiBJZiB0aGUgcGFyYW1ldGVyIGFkanVzdFBvc2l0aW9uIGlzIHNldCB0byB0cnVlLCB0aGUgc2hhcGVzJyByZWxhdGl2ZSBwb3NpdGlvbnMgYW5kXHJcbiAgICAgKiB0aGUgcmlnaWQgYm9keSdzIHBvc2l0aW9uIHdpbGwgYmUgYWRqdXN0ZWQgdG8gdGhlIGNlbnRlciBvZiBncmF2aXR5LlxyXG4gICAgICogQHBhcmFtIHR5cGVcclxuICAgICAqIEBwYXJhbSBhZGp1c3RQb3NpdGlvblxyXG4gICAgICogQHJldHVybiB2b2lkXHJcbiAgICAgKi9cclxuICAgIHNldHVwTWFzczogZnVuY3Rpb24gKHR5cGUsIEFkanVzdFBvc2l0aW9uKSB7XHJcblxyXG4gICAgICB2YXIgYWRqdXN0UG9zaXRpb24gPSAoQWRqdXN0UG9zaXRpb24gIT09IHVuZGVmaW5lZCkgPyBBZGp1c3RQb3NpdGlvbiA6IHRydWU7XHJcblxyXG4gICAgICB0aGlzLnR5cGUgPSB0eXBlIHx8IEJPRFlfU1RBVElDO1xyXG4gICAgICB0aGlzLmlzRHluYW1pYyA9IHRoaXMudHlwZSA9PT0gQk9EWV9EWU5BTUlDO1xyXG4gICAgICB0aGlzLmlzU3RhdGljID0gdGhpcy50eXBlID09PSBCT0RZX1NUQVRJQztcclxuXHJcbiAgICAgIHRoaXMubWFzcyA9IDA7XHJcbiAgICAgIHRoaXMubG9jYWxJbmVydGlhLnNldCgwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwKTtcclxuXHJcblxyXG4gICAgICB2YXIgdG1wTSA9IG5ldyBNYXQzMygpO1xyXG4gICAgICB2YXIgdG1wViA9IG5ldyBWZWMzKCk7XHJcblxyXG4gICAgICBmb3IgKHZhciBzaGFwZSA9IHRoaXMuc2hhcGVzOyBzaGFwZSAhPT0gbnVsbDsgc2hhcGUgPSBzaGFwZS5uZXh0KSB7XHJcblxyXG4gICAgICAgIHNoYXBlLmNhbGN1bGF0ZU1hc3NJbmZvKHRoaXMubWFzc0luZm8pO1xyXG4gICAgICAgIHZhciBzaGFwZU1hc3MgPSB0aGlzLm1hc3NJbmZvLm1hc3M7XHJcbiAgICAgICAgdG1wVi5hZGRTY2FsZWRWZWN0b3Ioc2hhcGUucmVsYXRpdmVQb3NpdGlvbiwgc2hhcGVNYXNzKTtcclxuICAgICAgICB0aGlzLm1hc3MgKz0gc2hhcGVNYXNzO1xyXG4gICAgICAgIHRoaXMucm90YXRlSW5lcnRpYShzaGFwZS5yZWxhdGl2ZVJvdGF0aW9uLCB0aGlzLm1hc3NJbmZvLmluZXJ0aWEsIHRtcE0pO1xyXG4gICAgICAgIHRoaXMubG9jYWxJbmVydGlhLmFkZCh0bXBNKTtcclxuXHJcbiAgICAgICAgLy8gYWRkIG9mZnNldCBpbmVydGlhXHJcbiAgICAgICAgdGhpcy5sb2NhbEluZXJ0aWEuYWRkT2Zmc2V0KHNoYXBlTWFzcywgc2hhcGUucmVsYXRpdmVQb3NpdGlvbik7XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLmludmVyc2VNYXNzID0gMSAvIHRoaXMubWFzcztcclxuICAgICAgdG1wVi5zY2FsZUVxdWFsKHRoaXMuaW52ZXJzZU1hc3MpO1xyXG5cclxuICAgICAgaWYgKGFkanVzdFBvc2l0aW9uKSB7XHJcbiAgICAgICAgdGhpcy5wb3NpdGlvbi5hZGQodG1wVik7XHJcbiAgICAgICAgZm9yIChzaGFwZSA9IHRoaXMuc2hhcGVzOyBzaGFwZSAhPT0gbnVsbDsgc2hhcGUgPSBzaGFwZS5uZXh0KSB7XHJcbiAgICAgICAgICBzaGFwZS5yZWxhdGl2ZVBvc2l0aW9uLnN1YkVxdWFsKHRtcFYpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gc3VidHJhY3Qgb2Zmc2V0IGluZXJ0aWFcclxuICAgICAgICB0aGlzLmxvY2FsSW5lcnRpYS5zdWJPZmZzZXQodGhpcy5tYXNzLCB0bXBWKTtcclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMuaW52ZXJzZUxvY2FsSW5lcnRpYS5pbnZlcnQodGhpcy5sb2NhbEluZXJ0aWEpO1xyXG5cclxuICAgICAgLy99XHJcblxyXG4gICAgICBpZiAodGhpcy50eXBlID09PSBCT0RZX1NUQVRJQykge1xyXG4gICAgICAgIHRoaXMuaW52ZXJzZU1hc3MgPSAwO1xyXG4gICAgICAgIHRoaXMuaW52ZXJzZUxvY2FsSW5lcnRpYS5zZXQoMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMuc3luY1NoYXBlcygpO1xyXG4gICAgICB0aGlzLmF3YWtlKCk7XHJcblxyXG4gICAgfSxcclxuICAgIC8qKlxyXG4gICAgICogQXdha2UgdGhlIHJpZ2lkIGJvZHkuXHJcbiAgICAgKi9cclxuICAgIGF3YWtlOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICBpZiAoIXRoaXMuYWxsb3dTbGVlcCB8fCAhdGhpcy5zbGVlcGluZykgcmV0dXJuO1xyXG4gICAgICB0aGlzLnNsZWVwaW5nID0gZmFsc2U7XHJcbiAgICAgIHRoaXMuc2xlZXBUaW1lID0gMDtcclxuICAgICAgLy8gYXdha2UgY29ubmVjdGVkIGNvbnN0cmFpbnRzXHJcbiAgICAgIHZhciBjcyA9IHRoaXMuY29udGFjdExpbms7XHJcbiAgICAgIHdoaWxlIChjcyAhPSBudWxsKSB7XHJcbiAgICAgICAgY3MuYm9keS5zbGVlcFRpbWUgPSAwO1xyXG4gICAgICAgIGNzLmJvZHkuc2xlZXBpbmcgPSBmYWxzZTtcclxuICAgICAgICBjcyA9IGNzLm5leHQ7XHJcbiAgICAgIH1cclxuICAgICAgdmFyIGpzID0gdGhpcy5qb2ludExpbms7XHJcbiAgICAgIHdoaWxlIChqcyAhPSBudWxsKSB7XHJcbiAgICAgICAganMuYm9keS5zbGVlcFRpbWUgPSAwO1xyXG4gICAgICAgIGpzLmJvZHkuc2xlZXBpbmcgPSBmYWxzZTtcclxuICAgICAgICBqcyA9IGpzLm5leHQ7XHJcbiAgICAgIH1cclxuICAgICAgZm9yICh2YXIgc2hhcGUgPSB0aGlzLnNoYXBlczsgc2hhcGUgIT0gbnVsbDsgc2hhcGUgPSBzaGFwZS5uZXh0KSB7XHJcbiAgICAgICAgc2hhcGUudXBkYXRlUHJveHkoKTtcclxuICAgICAgfVxyXG5cclxuICAgIH0sXHJcbiAgICAvKipcclxuICAgICAqIFNsZWVwIHRoZSByaWdpZCBib2R5LlxyXG4gICAgICovXHJcbiAgICBzbGVlcDogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgaWYgKCF0aGlzLmFsbG93U2xlZXAgfHwgdGhpcy5zbGVlcGluZykgcmV0dXJuO1xyXG5cclxuICAgICAgdGhpcy5saW5lYXJWZWxvY2l0eS5zZXQoMCwgMCwgMCk7XHJcbiAgICAgIHRoaXMuYW5ndWxhclZlbG9jaXR5LnNldCgwLCAwLCAwKTtcclxuICAgICAgdGhpcy5zbGVlcFBvc2l0aW9uLmNvcHkodGhpcy5wb3NpdGlvbik7XHJcbiAgICAgIHRoaXMuc2xlZXBPcmllbnRhdGlvbi5jb3B5KHRoaXMub3JpZW50YXRpb24pO1xyXG5cclxuICAgICAgdGhpcy5zbGVlcFRpbWUgPSAwO1xyXG4gICAgICB0aGlzLnNsZWVwaW5nID0gdHJ1ZTtcclxuICAgICAgZm9yICh2YXIgc2hhcGUgPSB0aGlzLnNoYXBlczsgc2hhcGUgIT0gbnVsbDsgc2hhcGUgPSBzaGFwZS5uZXh0KSB7XHJcbiAgICAgICAgc2hhcGUudXBkYXRlUHJveHkoKTtcclxuICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICB0ZXN0V2FrZVVwOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICBpZiAodGhpcy5saW5lYXJWZWxvY2l0eS50ZXN0WmVybygpIHx8IHRoaXMuYW5ndWxhclZlbG9jaXR5LnRlc3RaZXJvKCkgfHwgdGhpcy5wb3NpdGlvbi50ZXN0RGlmZih0aGlzLnNsZWVwUG9zaXRpb24pIHx8IHRoaXMub3JpZW50YXRpb24udGVzdERpZmYodGhpcy5zbGVlcE9yaWVudGF0aW9uKSkgdGhpcy5hd2FrZSgpOyAvLyBhd2FrZSB0aGUgYm9keVxyXG5cclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXQgd2hldGhlciB0aGUgcmlnaWQgYm9keSBoYXMgbm90IGFueSBjb25uZWN0aW9uIHdpdGggb3RoZXJzLlxyXG4gICAgICogQHJldHVybiB7dm9pZH1cclxuICAgICAqL1xyXG4gICAgaXNMb25lbHk6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgcmV0dXJuIHRoaXMubnVtSm9pbnRzID09IDAgJiYgdGhpcy5udW1Db250YWN0cyA9PSAwO1xyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSB0aW1lIGludGVncmF0aW9uIG9mIHRoZSBtb3Rpb24gb2YgYSByaWdpZCBib2R5LCB5b3UgY2FuIHVwZGF0ZSB0aGUgaW5mb3JtYXRpb24gc3VjaCBhcyB0aGUgc2hhcGUuXHJcbiAgICAgKiBUaGlzIG1ldGhvZCBpcyBpbnZva2VkIGF1dG9tYXRpY2FsbHkgd2hlbiBjYWxsaW5nIHRoZSBzdGVwIG9mIHRoZSBXb3JsZCxcclxuICAgICAqIFRoZXJlIGlzIG5vIG5lZWQgdG8gY2FsbCBmcm9tIG91dHNpZGUgdXN1YWxseS5cclxuICAgICAqIEBwYXJhbSAgdGltZVN0ZXAgdGltZVxyXG4gICAgICogQHJldHVybiB7dm9pZH1cclxuICAgICAqL1xyXG5cclxuICAgIHVwZGF0ZVBvc2l0aW9uOiBmdW5jdGlvbiAodGltZVN0ZXApIHtcclxuICAgICAgc3dpdGNoICh0aGlzLnR5cGUpIHtcclxuICAgICAgICBjYXNlIEJPRFlfU1RBVElDOlxyXG4gICAgICAgICAgdGhpcy5saW5lYXJWZWxvY2l0eS5zZXQoMCwgMCwgMCk7XHJcbiAgICAgICAgICB0aGlzLmFuZ3VsYXJWZWxvY2l0eS5zZXQoMCwgMCwgMCk7XHJcblxyXG4gICAgICAgICAgLy8gT05MWSBGT1IgVEVTVFxyXG4gICAgICAgICAgaWYgKHRoaXMuY29udHJvbFBvcykge1xyXG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uLmNvcHkodGhpcy5uZXdQb3NpdGlvbik7XHJcbiAgICAgICAgICAgIHRoaXMuY29udHJvbFBvcyA9IGZhbHNlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaWYgKHRoaXMuY29udHJvbFJvdCkge1xyXG4gICAgICAgICAgICB0aGlzLm9yaWVudGF0aW9uLmNvcHkodGhpcy5uZXdPcmllbnRhdGlvbik7XHJcbiAgICAgICAgICAgIHRoaXMuY29udHJvbFJvdCA9IGZhbHNlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgLyp0aGlzLmxpbmVhclZlbG9jaXR5Lng9MDtcclxuICAgICAgICAgIHRoaXMubGluZWFyVmVsb2NpdHkueT0wO1xyXG4gICAgICAgICAgdGhpcy5saW5lYXJWZWxvY2l0eS56PTA7XHJcbiAgICAgICAgICB0aGlzLmFuZ3VsYXJWZWxvY2l0eS54PTA7XHJcbiAgICAgICAgICB0aGlzLmFuZ3VsYXJWZWxvY2l0eS55PTA7XHJcbiAgICAgICAgICB0aGlzLmFuZ3VsYXJWZWxvY2l0eS56PTA7Ki9cclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgQk9EWV9EWU5BTUlDOlxyXG5cclxuICAgICAgICAgIGlmICh0aGlzLmlzS2luZW1hdGljKSB7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmxpbmVhclZlbG9jaXR5LnNldCgwLCAwLCAwKTtcclxuICAgICAgICAgICAgdGhpcy5hbmd1bGFyVmVsb2NpdHkuc2V0KDAsIDAsIDApO1xyXG5cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBpZiAodGhpcy5jb250cm9sUG9zKSB7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmxpbmVhclZlbG9jaXR5LnN1YlZlY3RvcnModGhpcy5uZXdQb3NpdGlvbiwgdGhpcy5wb3NpdGlvbikubXVsdGlwbHlTY2FsYXIoMSAvIHRpbWVTdGVwKTtcclxuICAgICAgICAgICAgdGhpcy5jb250cm9sUG9zID0gZmFsc2U7XHJcblxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaWYgKHRoaXMuY29udHJvbFJvdCkge1xyXG5cclxuICAgICAgICAgICAgdGhpcy5hbmd1bGFyVmVsb2NpdHkuY29weSh0aGlzLmdldEF4aXMoKSk7XHJcbiAgICAgICAgICAgIHRoaXMub3JpZW50YXRpb24uY29weSh0aGlzLm5ld09yaWVudGF0aW9uKTtcclxuICAgICAgICAgICAgdGhpcy5jb250cm9sUm90ID0gZmFsc2U7XHJcblxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIHRoaXMucG9zaXRpb24uYWRkU2NhbGVkVmVjdG9yKHRoaXMubGluZWFyVmVsb2NpdHksIHRpbWVTdGVwKTtcclxuICAgICAgICAgIHRoaXMub3JpZW50YXRpb24uYWRkVGltZSh0aGlzLmFuZ3VsYXJWZWxvY2l0eSwgdGltZVN0ZXApO1xyXG5cclxuICAgICAgICAgIHRoaXMudXBkYXRlTWVzaCgpO1xyXG5cclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGRlZmF1bHQ6IHByaW50RXJyb3IoXCJSaWdpZEJvZHlcIiwgXCJJbnZhbGlkIHR5cGUuXCIpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLnN5bmNTaGFwZXMoKTtcclxuICAgICAgdGhpcy51cGRhdGVNZXNoKCk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBnZXRBeGlzOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICByZXR1cm4gbmV3IFZlYzMoMCwgMSwgMCkuYXBwbHlNYXRyaXgzKHRoaXMuaW52ZXJzZUxvY2FsSW5lcnRpYSwgdHJ1ZSkubm9ybWFsaXplKCk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICByb3RhdGVJbmVydGlhOiBmdW5jdGlvbiAocm90LCBpbmVydGlhLCBvdXQpIHtcclxuXHJcbiAgICAgIHRoaXMudG1wSW5lcnRpYS5tdWx0aXBseU1hdHJpY2VzKHJvdCwgaW5lcnRpYSk7XHJcbiAgICAgIG91dC5tdWx0aXBseU1hdHJpY2VzKHRoaXMudG1wSW5lcnRpYSwgcm90LCB0cnVlKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHN5bmNTaGFwZXM6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgIHRoaXMucm90YXRpb24uc2V0UXVhdCh0aGlzLm9yaWVudGF0aW9uKTtcclxuICAgICAgdGhpcy5yb3RhdGVJbmVydGlhKHRoaXMucm90YXRpb24sIHRoaXMuaW52ZXJzZUxvY2FsSW5lcnRpYSwgdGhpcy5pbnZlcnNlSW5lcnRpYSk7XHJcblxyXG4gICAgICBmb3IgKHZhciBzaGFwZSA9IHRoaXMuc2hhcGVzOyBzaGFwZSAhPSBudWxsOyBzaGFwZSA9IHNoYXBlLm5leHQpIHtcclxuXHJcbiAgICAgICAgc2hhcGUucG9zaXRpb24uY29weShzaGFwZS5yZWxhdGl2ZVBvc2l0aW9uKS5hcHBseU1hdHJpeDModGhpcy5yb3RhdGlvbiwgdHJ1ZSkuYWRkKHRoaXMucG9zaXRpb24pO1xyXG4gICAgICAgIC8vIGFkZCBieSBRdWF6aUtiXHJcbiAgICAgICAgc2hhcGUucm90YXRpb24ubXVsdGlwbHlNYXRyaWNlcyh0aGlzLnJvdGF0aW9uLCBzaGFwZS5yZWxhdGl2ZVJvdGF0aW9uKTtcclxuICAgICAgICBzaGFwZS51cGRhdGVQcm94eSgpO1xyXG4gICAgICB9XHJcbiAgICB9LFxyXG5cclxuXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gQVBQTFkgSU1QVUxTRSBGT1JDRVxyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBhcHBseUltcHVsc2U6IGZ1bmN0aW9uIChwb3NpdGlvbiwgZm9yY2UpIHtcclxuICAgICAgdGhpcy5saW5lYXJWZWxvY2l0eS5hZGRTY2FsZWRWZWN0b3IoZm9yY2UsIHRoaXMuaW52ZXJzZU1hc3MpO1xyXG4gICAgICB2YXIgcmVsID0gbmV3IFZlYzMoKS5jb3B5KHBvc2l0aW9uKS5zdWIodGhpcy5wb3NpdGlvbikuY3Jvc3MoZm9yY2UpLmFwcGx5TWF0cml4Myh0aGlzLmludmVyc2VJbmVydGlhLCB0cnVlKTtcclxuICAgICAgdGhpcy5hbmd1bGFyVmVsb2NpdHkuYWRkKHJlbCk7XHJcbiAgICB9LFxyXG5cclxuXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gU0VUIERZTkFNSVFVRSBQT1NJVElPTiBBTkQgUk9UQVRJT05cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgc2V0UG9zaXRpb246IGZ1bmN0aW9uIChwb3MpIHtcclxuICAgICAgdGhpcy5uZXdQb3NpdGlvbi5jb3B5KHBvcykubXVsdGlwbHlTY2FsYXIodGhpcy5pbnZTY2FsZSk7XHJcbiAgICAgIHRoaXMuY29udHJvbFBvcyA9IHRydWU7XHJcbiAgICAgIGlmICghdGhpcy5pc0tpbmVtYXRpYykgdGhpcy5pc0tpbmVtYXRpYyA9IHRydWU7XHJcbiAgICB9LFxyXG5cclxuICAgIHNldFF1YXRlcm5pb246IGZ1bmN0aW9uIChxKSB7XHJcbiAgICAgIHRoaXMubmV3T3JpZW50YXRpb24uc2V0KHEueCwgcS55LCBxLnosIHEudyk7XHJcbiAgICAgIHRoaXMuY29udHJvbFJvdCA9IHRydWU7XHJcbiAgICAgIGlmICghdGhpcy5pc0tpbmVtYXRpYykgdGhpcy5pc0tpbmVtYXRpYyA9IHRydWU7XHJcbiAgICB9LFxyXG5cclxuICAgIHNldFJvdGF0aW9uOiBmdW5jdGlvbiAocm90KSB7XHJcblxyXG4gICAgICB0aGlzLm5ld09yaWVudGF0aW9uID0gbmV3IFF1YXQoKS5zZXRGcm9tRXVsZXIocm90LnggKiBfTWF0aC5kZWd0b3JhZCwgcm90LnkgKiBfTWF0aC5kZWd0b3JhZCwgcm90LnogKiBfTWF0aC5kZWd0b3JhZCk7Ly90aGlzLnJvdGF0aW9uVmVjdFRvUXVhZCggcm90ICk7XHJcbiAgICAgIHRoaXMuY29udHJvbFJvdCA9IHRydWU7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gUkVTRVQgRFlOQU1JUVVFIFBPU0lUSU9OIEFORCBST1RBVElPTlxyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICByZXNldFBvc2l0aW9uOiBmdW5jdGlvbiAoeCwgeSwgeikge1xyXG5cclxuICAgICAgdGhpcy5saW5lYXJWZWxvY2l0eS5zZXQoMCwgMCwgMCk7XHJcbiAgICAgIHRoaXMuYW5ndWxhclZlbG9jaXR5LnNldCgwLCAwLCAwKTtcclxuICAgICAgdGhpcy5wb3NpdGlvbi5zZXQoeCwgeSwgeikubXVsdGlwbHlTY2FsYXIodGhpcy5pbnZTY2FsZSk7XHJcbiAgICAgIC8vdGhpcy5wb3NpdGlvbi5zZXQoIHgqT0lNTy5Xb3JsZFNjYWxlLmludlNjYWxlLCB5Kk9JTU8uV29ybGRTY2FsZS5pbnZTY2FsZSwgeipPSU1PLldvcmxkU2NhbGUuaW52U2NhbGUgKTtcclxuICAgICAgdGhpcy5hd2FrZSgpO1xyXG4gICAgfSxcclxuXHJcbiAgICByZXNldFF1YXRlcm5pb246IGZ1bmN0aW9uIChxKSB7XHJcblxyXG4gICAgICB0aGlzLmFuZ3VsYXJWZWxvY2l0eS5zZXQoMCwgMCwgMCk7XHJcbiAgICAgIHRoaXMub3JpZW50YXRpb24gPSBuZXcgUXVhdChxLngsIHEueSwgcS56LCBxLncpO1xyXG4gICAgICB0aGlzLmF3YWtlKCk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICByZXNldFJvdGF0aW9uOiBmdW5jdGlvbiAoeCwgeSwgeikge1xyXG5cclxuICAgICAgdGhpcy5hbmd1bGFyVmVsb2NpdHkuc2V0KDAsIDAsIDApO1xyXG4gICAgICB0aGlzLm9yaWVudGF0aW9uID0gbmV3IFF1YXQoKS5zZXRGcm9tRXVsZXIoeCAqIF9NYXRoLmRlZ3RvcmFkLCB5ICogX01hdGguZGVndG9yYWQsIHogKiBfTWF0aC5kZWd0b3JhZCk7Ly90aGlzLnJvdGF0aW9uVmVjdFRvUXVhZCggbmV3IFZlYzMoeCx5LHopICk7XHJcbiAgICAgIHRoaXMuYXdha2UoKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyBHRVQgUE9TSVRJT04gQU5EIFJPVEFUSU9OXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIGdldFBvc2l0aW9uOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICByZXR1cm4gdGhpcy5wb3M7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBnZXRRdWF0ZXJuaW9uOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICByZXR1cm4gdGhpcy5xdWF0ZXJuaW9uO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vIEFVVE8gVVBEQVRFIFRIUkVFIE1FU0hcclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgY29ubmVjdE1lc2g6IGZ1bmN0aW9uIChtZXNoKSB7XHJcblxyXG4gICAgICB0aGlzLm1lc2ggPSBtZXNoO1xyXG4gICAgICB0aGlzLnVwZGF0ZU1lc2goKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHVwZGF0ZU1lc2g6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgIHRoaXMucG9zLnNjYWxlKHRoaXMucG9zaXRpb24sIHRoaXMuc2NhbGUpO1xyXG4gICAgICB0aGlzLnF1YXRlcm5pb24uY29weSh0aGlzLm9yaWVudGF0aW9uKTtcclxuXHJcbiAgICAgIGlmICh0aGlzLm1lc2ggPT09IG51bGwpIHJldHVybjtcclxuXHJcbiAgICAgIHRoaXMubWVzaC5wb3NpdGlvbi5jb3B5KHRoaXMuZ2V0UG9zaXRpb24oKSk7XHJcbiAgICAgIHRoaXMubWVzaC5xdWF0ZXJuaW9uLmNvcHkodGhpcy5nZXRRdWF0ZXJuaW9uKCkpO1xyXG5cclxuICAgIH0sXHJcblxyXG4gIH0pO1xyXG5cclxuICAvKipcclxuICAqIEEgcGFpciBvZiBzaGFwZXMgdGhhdCBtYXkgY29sbGlkZS5cclxuICAqIEBhdXRob3Igc2FoYXJhblxyXG4gICovXHJcbiAgZnVuY3Rpb24gUGFpcihzMSwgczIpIHtcclxuXHJcbiAgICAvLyBUaGUgZmlyc3Qgc2hhcGUuXHJcbiAgICB0aGlzLnNoYXBlMSA9IHMxIHx8IG51bGw7XHJcbiAgICAvLyBUaGUgc2Vjb25kIHNoYXBlLlxyXG4gICAgdGhpcy5zaGFwZTIgPSBzMiB8fCBudWxsO1xyXG5cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICogVGhlIGJyb2FkLXBoYXNlIGlzIHVzZWQgZm9yIGNvbGxlY3RpbmcgYWxsIHBvc3NpYmxlIHBhaXJzIGZvciBjb2xsaXNpb24uXHJcbiAgKi9cclxuXHJcbiAgZnVuY3Rpb24gQnJvYWRQaGFzZSgpIHtcclxuXHJcbiAgICB0aGlzLnR5cGVzID0gQlJfTlVMTDtcclxuICAgIHRoaXMubnVtUGFpckNoZWNrcyA9IDA7XHJcbiAgICB0aGlzLm51bVBhaXJzID0gMDtcclxuICAgIHRoaXMucGFpcnMgPSBbXTtcclxuXHJcbiAgfVxyXG4gIE9iamVjdC5hc3NpZ24oQnJvYWRQaGFzZS5wcm90b3R5cGUsIHtcclxuXHJcbiAgICBCcm9hZFBoYXNlOiB0cnVlLFxyXG5cclxuICAgIC8vIENyZWF0ZSBhIG5ldyBwcm94eS5cclxuICAgIGNyZWF0ZVByb3h5OiBmdW5jdGlvbiAoc2hhcGUpIHtcclxuXHJcbiAgICAgIHByaW50RXJyb3IoXCJCcm9hZFBoYXNlXCIsIFwiSW5oZXJpdGFuY2UgZXJyb3IuXCIpO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgLy8gQWRkIHRoZSBwcm94eSBpbnRvIHRoZSBicm9hZC1waGFzZS5cclxuICAgIGFkZFByb3h5OiBmdW5jdGlvbiAocHJveHkpIHtcclxuXHJcbiAgICAgIHByaW50RXJyb3IoXCJCcm9hZFBoYXNlXCIsIFwiSW5oZXJpdGFuY2UgZXJyb3IuXCIpO1xyXG4gICAgfSxcclxuXHJcbiAgICAvLyBSZW1vdmUgdGhlIHByb3h5IGZyb20gdGhlIGJyb2FkLXBoYXNlLlxyXG4gICAgcmVtb3ZlUHJveHk6IGZ1bmN0aW9uIChwcm94eSkge1xyXG5cclxuICAgICAgcHJpbnRFcnJvcihcIkJyb2FkUGhhc2VcIiwgXCJJbmhlcml0YW5jZSBlcnJvci5cIik7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICAvLyBSZXR1cm5zIHdoZXRoZXIgdGhlIHBhaXIgaXMgYXZhaWxhYmxlIG9yIG5vdC5cclxuICAgIGlzQXZhaWxhYmxlUGFpcjogZnVuY3Rpb24gKHMxLCBzMikge1xyXG5cclxuICAgICAgdmFyIGIxID0gczEucGFyZW50O1xyXG4gICAgICB2YXIgYjIgPSBzMi5wYXJlbnQ7XHJcbiAgICAgIGlmIChiMSA9PSBiMiB8fCAvLyBzYW1lIHBhcmVudHNcclxuICAgICAgICAoIWIxLmlzRHluYW1pYyAmJiAhYjIuaXNEeW5hbWljKSB8fCAvLyBzdGF0aWMgb3Iga2luZW1hdGljIG9iamVjdFxyXG4gICAgICAgIChzMS5iZWxvbmdzVG8gJiBzMi5jb2xsaWRlc1dpdGgpID09IDAgfHxcclxuICAgICAgICAoczIuYmVsb25nc1RvICYgczEuY29sbGlkZXNXaXRoKSA9PSAwIC8vIGNvbGxpc2lvbiBmaWx0ZXJpbmdcclxuICAgICAgKSB7IHJldHVybiBmYWxzZTsgfVxyXG4gICAgICB2YXIganM7XHJcbiAgICAgIGlmIChiMS5udW1Kb2ludHMgPCBiMi5udW1Kb2ludHMpIGpzID0gYjEuam9pbnRMaW5rO1xyXG4gICAgICBlbHNlIGpzID0gYjIuam9pbnRMaW5rO1xyXG4gICAgICB3aGlsZSAoanMgIT09IG51bGwpIHtcclxuICAgICAgICB2YXIgam9pbnQgPSBqcy5qb2ludDtcclxuICAgICAgICBpZiAoIWpvaW50LmFsbG93Q29sbGlzaW9uICYmICgoam9pbnQuYm9keTEgPT0gYjEgJiYgam9pbnQuYm9keTIgPT0gYjIpIHx8IChqb2ludC5ib2R5MSA9PSBiMiAmJiBqb2ludC5ib2R5MiA9PSBiMSkpKSB7IHJldHVybiBmYWxzZTsgfVxyXG4gICAgICAgIGpzID0ganMubmV4dDtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHRydWU7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICAvLyBEZXRlY3Qgb3ZlcmxhcHBpbmcgcGFpcnMuXHJcbiAgICBkZXRlY3RQYWlyczogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgLy8gY2xlYXIgb2xkXHJcbiAgICAgIHRoaXMucGFpcnMgPSBbXTtcclxuICAgICAgdGhpcy5udW1QYWlycyA9IDA7XHJcbiAgICAgIHRoaXMubnVtUGFpckNoZWNrcyA9IDA7XHJcbiAgICAgIHRoaXMuY29sbGVjdFBhaXJzKCk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBjb2xsZWN0UGFpcnM6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGFkZFBhaXI6IGZ1bmN0aW9uIChzMSwgczIpIHtcclxuXHJcbiAgICAgIHZhciBwYWlyID0gbmV3IFBhaXIoczEsIHMyKTtcclxuICAgICAgdGhpcy5wYWlycy5wdXNoKHBhaXIpO1xyXG4gICAgICB0aGlzLm51bVBhaXJzKys7XHJcblxyXG4gICAgfVxyXG5cclxuICB9KTtcclxuXHJcbiAgdmFyIGNvdW50JDEgPSAwO1xyXG4gIGZ1bmN0aW9uIFByb3h5SWRDb3VudCgpIHsgcmV0dXJuIGNvdW50JDErKzsgfVxyXG5cclxuICAvKipcclxuICAgKiBBIHByb3h5IGlzIHVzZWQgZm9yIGJyb2FkLXBoYXNlIGNvbGxlY3RpbmcgcGFpcnMgdGhhdCBjYW4gYmUgY29sbGlkaW5nLlxyXG4gICAqXHJcbiAgICogQGF1dGhvciBsby10aFxyXG4gICAqL1xyXG5cclxuICBmdW5jdGlvbiBQcm94eShzaGFwZSkge1xyXG5cclxuICAgIC8vVGhlIHBhcmVudCBzaGFwZS5cclxuICAgIHRoaXMuc2hhcGUgPSBzaGFwZTtcclxuXHJcbiAgICAvL1RoZSBheGlzLWFsaWduZWQgYm91bmRpbmcgYm94LlxyXG4gICAgdGhpcy5hYWJiID0gc2hhcGUuYWFiYjtcclxuXHJcbiAgfVxyXG4gIE9iamVjdC5hc3NpZ24oUHJveHkucHJvdG90eXBlLCB7XHJcblxyXG4gICAgUHJveHk6IHRydWUsXHJcblxyXG4gICAgLy8gVXBkYXRlIHRoZSBwcm94eS4gTXVzdCBiZSBpbmhlcml0ZWQgYnkgYSBjaGlsZC5cclxuXHJcbiAgICB1cGRhdGU6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgIHByaW50RXJyb3IoXCJQcm94eVwiLCBcIkluaGVyaXRhbmNlIGVycm9yLlwiKTtcclxuXHJcbiAgICB9XHJcblxyXG4gIH0pO1xyXG5cclxuICAvKipcclxuICAqIEEgYmFzaWMgaW1wbGVtZW50YXRpb24gb2YgcHJveGllcy5cclxuICAqXHJcbiAgKiBAYXV0aG9yIHNhaGFyYW5cclxuICAqL1xyXG5cclxuICBmdW5jdGlvbiBCYXNpY1Byb3h5KHNoYXBlKSB7XHJcblxyXG4gICAgUHJveHkuY2FsbCh0aGlzLCBzaGFwZSk7XHJcblxyXG4gICAgdGhpcy5pZCA9IFByb3h5SWRDb3VudCgpO1xyXG5cclxuICB9XHJcbiAgQmFzaWNQcm94eS5wcm90b3R5cGUgPSBPYmplY3QuYXNzaWduKE9iamVjdC5jcmVhdGUoUHJveHkucHJvdG90eXBlKSwge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yOiBCYXNpY1Byb3h5LFxyXG5cclxuICAgIHVwZGF0ZTogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgIH1cclxuXHJcbiAgfSk7XHJcblxyXG4gIC8qKlxyXG4gICogQSBicm9hZC1waGFzZSBhbGdvcml0aG0gd2l0aCBicnV0ZS1mb3JjZSBzZWFyY2guXHJcbiAgKiBUaGlzIGFsd2F5cyBjaGVja3MgZm9yIGFsbCBwb3NzaWJsZSBwYWlycy5cclxuICAqL1xyXG5cclxuICBmdW5jdGlvbiBCcnV0ZUZvcmNlQnJvYWRQaGFzZSgpIHtcclxuXHJcbiAgICBCcm9hZFBoYXNlLmNhbGwodGhpcyk7XHJcbiAgICB0aGlzLnR5cGVzID0gQlJfQlJVVEVfRk9SQ0U7XHJcbiAgICAvL3RoaXMubnVtUHJveGllcz0wO1xyXG4gICAgLy8vdGhpcy5tYXhQcm94aWVzID0gMjU2O1xyXG4gICAgdGhpcy5wcm94aWVzID0gW107XHJcbiAgICAvL3RoaXMucHJveGllcy5sZW5ndGggPSAyNTY7XHJcblxyXG4gIH1cclxuXHJcbiAgQnJ1dGVGb3JjZUJyb2FkUGhhc2UucHJvdG90eXBlID0gT2JqZWN0LmFzc2lnbihPYmplY3QuY3JlYXRlKEJyb2FkUGhhc2UucHJvdG90eXBlKSwge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yOiBCcnV0ZUZvcmNlQnJvYWRQaGFzZSxcclxuXHJcbiAgICBjcmVhdGVQcm94eTogZnVuY3Rpb24gKHNoYXBlKSB7XHJcblxyXG4gICAgICByZXR1cm4gbmV3IEJhc2ljUHJveHkoc2hhcGUpO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgYWRkUHJveHk6IGZ1bmN0aW9uIChwcm94eSkge1xyXG5cclxuICAgICAgLyppZih0aGlzLm51bVByb3hpZXM9PXRoaXMubWF4UHJveGllcyl7XHJcbiAgICAgICAgICAvL3RoaXMubWF4UHJveGllczw8PTE7XHJcbiAgICAgICAgICB0aGlzLm1heFByb3hpZXMqPTI7XHJcbiAgICAgICAgICB2YXIgbmV3UHJveGllcz1bXTtcclxuICAgICAgICAgIG5ld1Byb3hpZXMubGVuZ3RoID0gdGhpcy5tYXhQcm94aWVzO1xyXG4gICAgICAgICAgdmFyIGkgPSB0aGlzLm51bVByb3hpZXM7XHJcbiAgICAgICAgICB3aGlsZShpLS0pe1xyXG4gICAgICAgICAgLy9mb3IodmFyIGk9MCwgbD10aGlzLm51bVByb3hpZXM7aTxsO2krKyl7XHJcbiAgICAgICAgICAgICAgbmV3UHJveGllc1tpXT10aGlzLnByb3hpZXNbaV07XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICB0aGlzLnByb3hpZXM9bmV3UHJveGllcztcclxuICAgICAgfSovXHJcbiAgICAgIC8vdGhpcy5wcm94aWVzW3RoaXMubnVtUHJveGllcysrXSA9IHByb3h5O1xyXG4gICAgICB0aGlzLnByb3hpZXMucHVzaChwcm94eSk7XHJcbiAgICAgIC8vdGhpcy5udW1Qcm94aWVzKys7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICByZW1vdmVQcm94eTogZnVuY3Rpb24gKHByb3h5KSB7XHJcblxyXG4gICAgICB2YXIgbiA9IHRoaXMucHJveGllcy5pbmRleE9mKHByb3h5KTtcclxuICAgICAgaWYgKG4gPiAtMSkge1xyXG4gICAgICAgIHRoaXMucHJveGllcy5zcGxpY2UobiwgMSk7XHJcbiAgICAgICAgLy90aGlzLm51bVByb3hpZXMtLTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLyp2YXIgaSA9IHRoaXMubnVtUHJveGllcztcclxuICAgICAgd2hpbGUoaS0tKXtcclxuICAgICAgLy9mb3IodmFyIGk9MCwgbD10aGlzLm51bVByb3hpZXM7aTxsO2krKyl7XHJcbiAgICAgICAgICBpZih0aGlzLnByb3hpZXNbaV0gPT0gcHJveHkpe1xyXG4gICAgICAgICAgICAgIHRoaXMucHJveGllc1tpXSA9IHRoaXMucHJveGllc1stLXRoaXMubnVtUHJveGllc107XHJcbiAgICAgICAgICAgICAgdGhpcy5wcm94aWVzW3RoaXMubnVtUHJveGllc10gPSBudWxsO1xyXG4gICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgIH1cclxuICAgICAgfSovXHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBjb2xsZWN0UGFpcnM6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgIHZhciBpID0gMCwgaiwgcDEsIHAyO1xyXG5cclxuICAgICAgdmFyIHB4ID0gdGhpcy5wcm94aWVzO1xyXG4gICAgICB2YXIgbCA9IHB4Lmxlbmd0aDsvL3RoaXMubnVtUHJveGllcztcclxuICAgICAgLy92YXIgYXIxID0gW107XHJcbiAgICAgIC8vdmFyIGFyMiA9IFtdO1xyXG5cclxuICAgICAgLy9mb3IoIGkgPSBweC5sZW5ndGggOyBpLS0gOyBhcjFbIGkgXSA9IHB4WyBpIF0gKXt9O1xyXG4gICAgICAvL2ZvciggaSA9IHB4Lmxlbmd0aCA7IGktLSA7IGFyMlsgaSBdID0gcHhbIGkgXSApe307XHJcblxyXG4gICAgICAvL3ZhciBhcjEgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoaXMucHJveGllcykpXHJcbiAgICAgIC8vdmFyIGFyMiA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5wcm94aWVzKSlcclxuXHJcbiAgICAgIHRoaXMubnVtUGFpckNoZWNrcyA9IGwgKiAobCAtIDEpID4+IDE7XHJcbiAgICAgIC8vdGhpcy5udW1QYWlyQ2hlY2tzPXRoaXMubnVtUHJveGllcyoodGhpcy5udW1Qcm94aWVzLTEpKjAuNTtcclxuXHJcbiAgICAgIHdoaWxlIChpIDwgbCkge1xyXG4gICAgICAgIHAxID0gcHhbaSsrXTtcclxuICAgICAgICBqID0gaSArIDE7XHJcbiAgICAgICAgd2hpbGUgKGogPCBsKSB7XHJcbiAgICAgICAgICBwMiA9IHB4W2orK107XHJcbiAgICAgICAgICBpZiAocDEuYWFiYi5pbnRlcnNlY3RUZXN0KHAyLmFhYmIpIHx8ICF0aGlzLmlzQXZhaWxhYmxlUGFpcihwMS5zaGFwZSwgcDIuc2hhcGUpKSBjb250aW51ZTtcclxuICAgICAgICAgIHRoaXMuYWRkUGFpcihwMS5zaGFwZSwgcDIuc2hhcGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgfSk7XHJcblxyXG4gIC8qKlxyXG4gICAqIEEgcHJvamVjdGlvbiBheGlzIGZvciBzd2VlcCBhbmQgcHJ1bmUgYnJvYWQtcGhhc2UuXHJcbiAgICogQGF1dGhvciBzYWhhcmFuXHJcbiAgICovXHJcblxyXG4gIGZ1bmN0aW9uIFNBUEF4aXMoKSB7XHJcblxyXG4gICAgdGhpcy5udW1FbGVtZW50cyA9IDA7XHJcbiAgICB0aGlzLmJ1ZmZlclNpemUgPSAyNTY7XHJcbiAgICB0aGlzLmVsZW1lbnRzID0gW107XHJcbiAgICB0aGlzLmVsZW1lbnRzLmxlbmd0aCA9IHRoaXMuYnVmZmVyU2l6ZTtcclxuICAgIHRoaXMuc3RhY2sgPSBuZXcgRmxvYXQzMkFycmF5KDY0KTtcclxuXHJcbiAgfVxyXG5cclxuICBPYmplY3QuYXNzaWduKFNBUEF4aXMucHJvdG90eXBlLCB7XHJcblxyXG4gICAgU0FQQXhpczogdHJ1ZSxcclxuXHJcbiAgICBhZGRFbGVtZW50czogZnVuY3Rpb24gKG1pbiwgbWF4KSB7XHJcblxyXG4gICAgICBpZiAodGhpcy5udW1FbGVtZW50cyArIDIgPj0gdGhpcy5idWZmZXJTaXplKSB7XHJcbiAgICAgICAgLy90aGlzLmJ1ZmZlclNpemU8PD0xO1xyXG4gICAgICAgIHRoaXMuYnVmZmVyU2l6ZSAqPSAyO1xyXG4gICAgICAgIHZhciBuZXdFbGVtZW50cyA9IFtdO1xyXG4gICAgICAgIHZhciBpID0gdGhpcy5udW1FbGVtZW50cztcclxuICAgICAgICB3aGlsZSAoaS0tKSB7XHJcbiAgICAgICAgICAvL2Zvcih2YXIgaT0wLCBsPXRoaXMubnVtRWxlbWVudHM7IGk8bDsgaSsrKXtcclxuICAgICAgICAgIG5ld0VsZW1lbnRzW2ldID0gdGhpcy5lbGVtZW50c1tpXTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgdGhpcy5lbGVtZW50c1t0aGlzLm51bUVsZW1lbnRzKytdID0gbWluO1xyXG4gICAgICB0aGlzLmVsZW1lbnRzW3RoaXMubnVtRWxlbWVudHMrK10gPSBtYXg7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICByZW1vdmVFbGVtZW50czogZnVuY3Rpb24gKG1pbiwgbWF4KSB7XHJcblxyXG4gICAgICB2YXIgbWluSW5kZXggPSAtMTtcclxuICAgICAgdmFyIG1heEluZGV4ID0gLTE7XHJcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gdGhpcy5udW1FbGVtZW50czsgaSA8IGw7IGkrKykge1xyXG4gICAgICAgIHZhciBlID0gdGhpcy5lbGVtZW50c1tpXTtcclxuICAgICAgICBpZiAoZSA9PSBtaW4gfHwgZSA9PSBtYXgpIHtcclxuICAgICAgICAgIGlmIChtaW5JbmRleCA9PSAtMSkge1xyXG4gICAgICAgICAgICBtaW5JbmRleCA9IGk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBtYXhJbmRleCA9IGk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBmb3IgKGkgPSBtaW5JbmRleCArIDEsIGwgPSBtYXhJbmRleDsgaSA8IGw7IGkrKykge1xyXG4gICAgICAgIHRoaXMuZWxlbWVudHNbaSAtIDFdID0gdGhpcy5lbGVtZW50c1tpXTtcclxuICAgICAgfVxyXG4gICAgICBmb3IgKGkgPSBtYXhJbmRleCArIDEsIGwgPSB0aGlzLm51bUVsZW1lbnRzOyBpIDwgbDsgaSsrKSB7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50c1tpIC0gMl0gPSB0aGlzLmVsZW1lbnRzW2ldO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLmVsZW1lbnRzWy0tdGhpcy5udW1FbGVtZW50c10gPSBudWxsO1xyXG4gICAgICB0aGlzLmVsZW1lbnRzWy0tdGhpcy5udW1FbGVtZW50c10gPSBudWxsO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgc29ydDogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgdmFyIGNvdW50ID0gMDtcclxuICAgICAgdmFyIHRocmVzaG9sZCA9IDE7XHJcbiAgICAgIHdoaWxlICgodGhpcy5udW1FbGVtZW50cyA+PiB0aHJlc2hvbGQpICE9IDApIHRocmVzaG9sZCsrO1xyXG4gICAgICB0aHJlc2hvbGQgPSB0aHJlc2hvbGQgKiB0aGlzLm51bUVsZW1lbnRzID4+IDI7XHJcbiAgICAgIGNvdW50ID0gMDtcclxuXHJcbiAgICAgIHZhciBnaXZldXAgPSBmYWxzZTtcclxuICAgICAgdmFyIGVsZW1lbnRzID0gdGhpcy5lbGVtZW50cztcclxuICAgICAgZm9yICh2YXIgaSA9IDEsIGwgPSB0aGlzLm51bUVsZW1lbnRzOyBpIDwgbDsgaSsrKSB7IC8vIHRyeSBpbnNlcnRpb24gc29ydFxyXG4gICAgICAgIHZhciB0bXAgPSBlbGVtZW50c1tpXTtcclxuICAgICAgICB2YXIgcGl2b3QgPSB0bXAudmFsdWU7XHJcbiAgICAgICAgdmFyIHRtcDIgPSBlbGVtZW50c1tpIC0gMV07XHJcbiAgICAgICAgaWYgKHRtcDIudmFsdWUgPiBwaXZvdCkge1xyXG4gICAgICAgICAgdmFyIGogPSBpO1xyXG4gICAgICAgICAgZG8ge1xyXG4gICAgICAgICAgICBlbGVtZW50c1tqXSA9IHRtcDI7XHJcbiAgICAgICAgICAgIGlmICgtLWogPT0gMCkgYnJlYWs7XHJcbiAgICAgICAgICAgIHRtcDIgPSBlbGVtZW50c1tqIC0gMV07XHJcbiAgICAgICAgICB9IHdoaWxlICh0bXAyLnZhbHVlID4gcGl2b3QpO1xyXG4gICAgICAgICAgZWxlbWVudHNbal0gPSB0bXA7XHJcbiAgICAgICAgICBjb3VudCArPSBpIC0gajtcclxuICAgICAgICAgIGlmIChjb3VudCA+IHRocmVzaG9sZCkge1xyXG4gICAgICAgICAgICBnaXZldXAgPSB0cnVlOyAvLyBzdG9wIGFuZCB1c2UgcXVpY2sgc29ydFxyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCFnaXZldXApIHJldHVybjtcclxuICAgICAgY291bnQgPSAyOyB2YXIgc3RhY2sgPSB0aGlzLnN0YWNrO1xyXG4gICAgICBzdGFja1swXSA9IDA7XHJcbiAgICAgIHN0YWNrWzFdID0gdGhpcy5udW1FbGVtZW50cyAtIDE7XHJcbiAgICAgIHdoaWxlIChjb3VudCA+IDApIHtcclxuICAgICAgICB2YXIgcmlnaHQgPSBzdGFja1stLWNvdW50XTtcclxuICAgICAgICB2YXIgbGVmdCA9IHN0YWNrWy0tY291bnRdO1xyXG4gICAgICAgIHZhciBkaWZmID0gcmlnaHQgLSBsZWZ0O1xyXG4gICAgICAgIGlmIChkaWZmID4gMTYpIHsgIC8vIHF1aWNrIHNvcnRcclxuICAgICAgICAgIC8vdmFyIG1pZD1sZWZ0KyhkaWZmPj4xKTtcclxuICAgICAgICAgIHZhciBtaWQgPSBsZWZ0ICsgKF9NYXRoLmZsb29yKGRpZmYgKiAwLjUpKTtcclxuICAgICAgICAgIHRtcCA9IGVsZW1lbnRzW21pZF07XHJcbiAgICAgICAgICBlbGVtZW50c1ttaWRdID0gZWxlbWVudHNbcmlnaHRdO1xyXG4gICAgICAgICAgZWxlbWVudHNbcmlnaHRdID0gdG1wO1xyXG4gICAgICAgICAgcGl2b3QgPSB0bXAudmFsdWU7XHJcbiAgICAgICAgICBpID0gbGVmdCAtIDE7XHJcbiAgICAgICAgICBqID0gcmlnaHQ7XHJcbiAgICAgICAgICB3aGlsZSAodHJ1ZSkge1xyXG4gICAgICAgICAgICB2YXIgZWk7XHJcbiAgICAgICAgICAgIHZhciBlajtcclxuICAgICAgICAgICAgZG8geyBlaSA9IGVsZW1lbnRzWysraV07IH0gd2hpbGUgKGVpLnZhbHVlIDwgcGl2b3QpO1xyXG4gICAgICAgICAgICBkbyB7IGVqID0gZWxlbWVudHNbLS1qXTsgfSB3aGlsZSAocGl2b3QgPCBlai52YWx1ZSAmJiBqICE9IGxlZnQpO1xyXG4gICAgICAgICAgICBpZiAoaSA+PSBqKSBicmVhaztcclxuICAgICAgICAgICAgZWxlbWVudHNbaV0gPSBlajtcclxuICAgICAgICAgICAgZWxlbWVudHNbal0gPSBlaTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBlbGVtZW50c1tyaWdodF0gPSBlbGVtZW50c1tpXTtcclxuICAgICAgICAgIGVsZW1lbnRzW2ldID0gdG1wO1xyXG4gICAgICAgICAgaWYgKGkgLSBsZWZ0ID4gcmlnaHQgLSBpKSB7XHJcbiAgICAgICAgICAgIHN0YWNrW2NvdW50KytdID0gbGVmdDtcclxuICAgICAgICAgICAgc3RhY2tbY291bnQrK10gPSBpIC0gMTtcclxuICAgICAgICAgICAgc3RhY2tbY291bnQrK10gPSBpICsgMTtcclxuICAgICAgICAgICAgc3RhY2tbY291bnQrK10gPSByaWdodDtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHN0YWNrW2NvdW50KytdID0gaSArIDE7XHJcbiAgICAgICAgICAgIHN0YWNrW2NvdW50KytdID0gcmlnaHQ7XHJcbiAgICAgICAgICAgIHN0YWNrW2NvdW50KytdID0gbGVmdDtcclxuICAgICAgICAgICAgc3RhY2tbY291bnQrK10gPSBpIC0gMTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgZm9yIChpID0gbGVmdCArIDE7IGkgPD0gcmlnaHQ7IGkrKykge1xyXG4gICAgICAgICAgICB0bXAgPSBlbGVtZW50c1tpXTtcclxuICAgICAgICAgICAgcGl2b3QgPSB0bXAudmFsdWU7XHJcbiAgICAgICAgICAgIHRtcDIgPSBlbGVtZW50c1tpIC0gMV07XHJcbiAgICAgICAgICAgIGlmICh0bXAyLnZhbHVlID4gcGl2b3QpIHtcclxuICAgICAgICAgICAgICBqID0gaTtcclxuICAgICAgICAgICAgICBkbyB7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50c1tqXSA9IHRtcDI7XHJcbiAgICAgICAgICAgICAgICBpZiAoLS1qID09IDApIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgdG1wMiA9IGVsZW1lbnRzW2ogLSAxXTtcclxuICAgICAgICAgICAgICB9IHdoaWxlICh0bXAyLnZhbHVlID4gcGl2b3QpO1xyXG4gICAgICAgICAgICAgIGVsZW1lbnRzW2pdID0gdG1wO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBjYWxjdWxhdGVUZXN0Q291bnQ6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgIHZhciBudW0gPSAxO1xyXG4gICAgICB2YXIgc3VtID0gMDtcclxuICAgICAgZm9yICh2YXIgaSA9IDEsIGwgPSB0aGlzLm51bUVsZW1lbnRzOyBpIDwgbDsgaSsrKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuZWxlbWVudHNbaV0ubWF4KSB7XHJcbiAgICAgICAgICBudW0tLTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgc3VtICs9IG51bTtcclxuICAgICAgICAgIG51bSsrO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gc3VtO1xyXG5cclxuICAgIH1cclxuXHJcbiAgfSk7XHJcblxyXG4gIC8qKlxyXG4gICAqIEFuIGVsZW1lbnQgb2YgcHJveGllcy5cclxuICAgKiBAYXV0aG9yIHNhaGFyYW5cclxuICAgKi9cclxuXHJcbiAgZnVuY3Rpb24gU0FQRWxlbWVudChwcm94eSwgbWF4KSB7XHJcblxyXG4gICAgLy8gVGhlIHBhcmVudCBwcm94eVxyXG4gICAgdGhpcy5wcm94eSA9IHByb3h5O1xyXG4gICAgLy8gVGhlIHBhaXIgZWxlbWVudC5cclxuICAgIHRoaXMucGFpciA9IG51bGw7XHJcbiAgICAvLyBUaGUgbWluaW11bSBlbGVtZW50IG9uIG90aGVyIGF4aXMuXHJcbiAgICB0aGlzLm1pbjEgPSBudWxsO1xyXG4gICAgLy8gVGhlIG1heGltdW0gZWxlbWVudCBvbiBvdGhlciBheGlzLlxyXG4gICAgdGhpcy5tYXgxID0gbnVsbDtcclxuICAgIC8vIFRoZSBtaW5pbXVtIGVsZW1lbnQgb24gb3RoZXIgYXhpcy5cclxuICAgIHRoaXMubWluMiA9IG51bGw7XHJcbiAgICAvLyBUaGUgbWF4aW11bSBlbGVtZW50IG9uIG90aGVyIGF4aXMuXHJcbiAgICB0aGlzLm1heDIgPSBudWxsO1xyXG4gICAgLy8gV2hldGhlciB0aGUgZWxlbWVudCBoYXMgbWF4aW11bSB2YWx1ZSBvciBub3QuXHJcbiAgICB0aGlzLm1heCA9IG1heDtcclxuICAgIC8vIFRoZSB2YWx1ZSBvZiB0aGUgZWxlbWVudC5cclxuICAgIHRoaXMudmFsdWUgPSAwO1xyXG5cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEEgcHJveHkgZm9yIHN3ZWVwIGFuZCBwcnVuZSBicm9hZC1waGFzZS5cclxuICAgKiBAYXV0aG9yIHNhaGFyYW5cclxuICAgKiBAYXV0aG9yIGxvLXRoXHJcbiAgICovXHJcblxyXG4gIGZ1bmN0aW9uIFNBUFByb3h5KHNhcCwgc2hhcGUpIHtcclxuXHJcbiAgICBQcm94eS5jYWxsKHRoaXMsIHNoYXBlKTtcclxuICAgIC8vIFR5cGUgb2YgdGhlIGF4aXMgdG8gd2hpY2ggdGhlIHByb3h5IGJlbG9uZ3MgdG8uIFswOm5vbmUsIDE6ZHluYW1pYywgMjpzdGF0aWNdXHJcbiAgICB0aGlzLmJlbG9uZ3NUbyA9IDA7XHJcbiAgICAvLyBUaGUgbWF4aW11bSBlbGVtZW50cyBvbiBlYWNoIGF4aXMuXHJcbiAgICB0aGlzLm1heCA9IFtdO1xyXG4gICAgLy8gVGhlIG1pbmltdW0gZWxlbWVudHMgb24gZWFjaCBheGlzLlxyXG4gICAgdGhpcy5taW4gPSBbXTtcclxuXHJcbiAgICB0aGlzLnNhcCA9IHNhcDtcclxuICAgIHRoaXMubWluWzBdID0gbmV3IFNBUEVsZW1lbnQodGhpcywgZmFsc2UpO1xyXG4gICAgdGhpcy5tYXhbMF0gPSBuZXcgU0FQRWxlbWVudCh0aGlzLCB0cnVlKTtcclxuICAgIHRoaXMubWluWzFdID0gbmV3IFNBUEVsZW1lbnQodGhpcywgZmFsc2UpO1xyXG4gICAgdGhpcy5tYXhbMV0gPSBuZXcgU0FQRWxlbWVudCh0aGlzLCB0cnVlKTtcclxuICAgIHRoaXMubWluWzJdID0gbmV3IFNBUEVsZW1lbnQodGhpcywgZmFsc2UpO1xyXG4gICAgdGhpcy5tYXhbMl0gPSBuZXcgU0FQRWxlbWVudCh0aGlzLCB0cnVlKTtcclxuICAgIHRoaXMubWF4WzBdLnBhaXIgPSB0aGlzLm1pblswXTtcclxuICAgIHRoaXMubWF4WzFdLnBhaXIgPSB0aGlzLm1pblsxXTtcclxuICAgIHRoaXMubWF4WzJdLnBhaXIgPSB0aGlzLm1pblsyXTtcclxuICAgIHRoaXMubWluWzBdLm1pbjEgPSB0aGlzLm1pblsxXTtcclxuICAgIHRoaXMubWluWzBdLm1heDEgPSB0aGlzLm1heFsxXTtcclxuICAgIHRoaXMubWluWzBdLm1pbjIgPSB0aGlzLm1pblsyXTtcclxuICAgIHRoaXMubWluWzBdLm1heDIgPSB0aGlzLm1heFsyXTtcclxuICAgIHRoaXMubWluWzFdLm1pbjEgPSB0aGlzLm1pblswXTtcclxuICAgIHRoaXMubWluWzFdLm1heDEgPSB0aGlzLm1heFswXTtcclxuICAgIHRoaXMubWluWzFdLm1pbjIgPSB0aGlzLm1pblsyXTtcclxuICAgIHRoaXMubWluWzFdLm1heDIgPSB0aGlzLm1heFsyXTtcclxuICAgIHRoaXMubWluWzJdLm1pbjEgPSB0aGlzLm1pblswXTtcclxuICAgIHRoaXMubWluWzJdLm1heDEgPSB0aGlzLm1heFswXTtcclxuICAgIHRoaXMubWluWzJdLm1pbjIgPSB0aGlzLm1pblsxXTtcclxuICAgIHRoaXMubWluWzJdLm1heDIgPSB0aGlzLm1heFsxXTtcclxuXHJcbiAgfVxyXG4gIFNBUFByb3h5LnByb3RvdHlwZSA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmNyZWF0ZShQcm94eS5wcm90b3R5cGUpLCB7XHJcblxyXG4gICAgY29uc3RydWN0b3I6IFNBUFByb3h5LFxyXG5cclxuXHJcbiAgICAvLyBSZXR1cm5zIHdoZXRoZXIgdGhlIHByb3h5IGlzIGR5bmFtaWMgb3Igbm90LlxyXG4gICAgaXNEeW5hbWljOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICB2YXIgYm9keSA9IHRoaXMuc2hhcGUucGFyZW50O1xyXG4gICAgICByZXR1cm4gYm9keS5pc0R5bmFtaWMgJiYgIWJvZHkuc2xlZXBpbmc7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICB1cGRhdGU6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgIHZhciB0ZSA9IHRoaXMuYWFiYi5lbGVtZW50cztcclxuICAgICAgdGhpcy5taW5bMF0udmFsdWUgPSB0ZVswXTtcclxuICAgICAgdGhpcy5taW5bMV0udmFsdWUgPSB0ZVsxXTtcclxuICAgICAgdGhpcy5taW5bMl0udmFsdWUgPSB0ZVsyXTtcclxuICAgICAgdGhpcy5tYXhbMF0udmFsdWUgPSB0ZVszXTtcclxuICAgICAgdGhpcy5tYXhbMV0udmFsdWUgPSB0ZVs0XTtcclxuICAgICAgdGhpcy5tYXhbMl0udmFsdWUgPSB0ZVs1XTtcclxuXHJcbiAgICAgIGlmICh0aGlzLmJlbG9uZ3NUbyA9PSAxICYmICF0aGlzLmlzRHluYW1pYygpIHx8IHRoaXMuYmVsb25nc1RvID09IDIgJiYgdGhpcy5pc0R5bmFtaWMoKSkge1xyXG4gICAgICAgIHRoaXMuc2FwLnJlbW92ZVByb3h5KHRoaXMpO1xyXG4gICAgICAgIHRoaXMuc2FwLmFkZFByb3h5KHRoaXMpO1xyXG4gICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICB9KTtcclxuXHJcbiAgLyoqXHJcbiAgICogQSBicm9hZC1waGFzZSBjb2xsaXNpb24gZGV0ZWN0aW9uIGFsZ29yaXRobSB1c2luZyBzd2VlcCBhbmQgcHJ1bmUuXHJcbiAgICogQGF1dGhvciBzYWhhcmFuXHJcbiAgICogQGF1dGhvciBsby10aFxyXG4gICAqL1xyXG5cclxuICBmdW5jdGlvbiBTQVBCcm9hZFBoYXNlKCkge1xyXG5cclxuICAgIEJyb2FkUGhhc2UuY2FsbCh0aGlzKTtcclxuICAgIHRoaXMudHlwZXMgPSBCUl9TV0VFUF9BTkRfUFJVTkU7XHJcblxyXG4gICAgdGhpcy5udW1FbGVtZW50c0QgPSAwO1xyXG4gICAgdGhpcy5udW1FbGVtZW50c1MgPSAwO1xyXG4gICAgLy8gZHluYW1pYyBwcm94aWVzXHJcbiAgICB0aGlzLmF4ZXNEID0gW1xyXG4gICAgICBuZXcgU0FQQXhpcygpLFxyXG4gICAgICBuZXcgU0FQQXhpcygpLFxyXG4gICAgICBuZXcgU0FQQXhpcygpXHJcbiAgICBdO1xyXG4gICAgLy8gc3RhdGljIG9yIHNsZWVwaW5nIHByb3hpZXNcclxuICAgIHRoaXMuYXhlc1MgPSBbXHJcbiAgICAgIG5ldyBTQVBBeGlzKCksXHJcbiAgICAgIG5ldyBTQVBBeGlzKCksXHJcbiAgICAgIG5ldyBTQVBBeGlzKClcclxuICAgIF07XHJcblxyXG4gICAgdGhpcy5pbmRleDEgPSAwO1xyXG4gICAgdGhpcy5pbmRleDIgPSAxO1xyXG5cclxuICB9XHJcbiAgU0FQQnJvYWRQaGFzZS5wcm90b3R5cGUgPSBPYmplY3QuYXNzaWduKE9iamVjdC5jcmVhdGUoQnJvYWRQaGFzZS5wcm90b3R5cGUpLCB7XHJcblxyXG4gICAgY29uc3RydWN0b3I6IFNBUEJyb2FkUGhhc2UsXHJcblxyXG4gICAgY3JlYXRlUHJveHk6IGZ1bmN0aW9uIChzaGFwZSkge1xyXG5cclxuICAgICAgcmV0dXJuIG5ldyBTQVBQcm94eSh0aGlzLCBzaGFwZSk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBhZGRQcm94eTogZnVuY3Rpb24gKHByb3h5KSB7XHJcblxyXG4gICAgICB2YXIgcCA9IHByb3h5O1xyXG4gICAgICBpZiAocC5pc0R5bmFtaWMoKSkge1xyXG4gICAgICAgIHRoaXMuYXhlc0RbMF0uYWRkRWxlbWVudHMocC5taW5bMF0sIHAubWF4WzBdKTtcclxuICAgICAgICB0aGlzLmF4ZXNEWzFdLmFkZEVsZW1lbnRzKHAubWluWzFdLCBwLm1heFsxXSk7XHJcbiAgICAgICAgdGhpcy5heGVzRFsyXS5hZGRFbGVtZW50cyhwLm1pblsyXSwgcC5tYXhbMl0pO1xyXG4gICAgICAgIHAuYmVsb25nc1RvID0gMTtcclxuICAgICAgICB0aGlzLm51bUVsZW1lbnRzRCArPSAyO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuYXhlc1NbMF0uYWRkRWxlbWVudHMocC5taW5bMF0sIHAubWF4WzBdKTtcclxuICAgICAgICB0aGlzLmF4ZXNTWzFdLmFkZEVsZW1lbnRzKHAubWluWzFdLCBwLm1heFsxXSk7XHJcbiAgICAgICAgdGhpcy5heGVzU1syXS5hZGRFbGVtZW50cyhwLm1pblsyXSwgcC5tYXhbMl0pO1xyXG4gICAgICAgIHAuYmVsb25nc1RvID0gMjtcclxuICAgICAgICB0aGlzLm51bUVsZW1lbnRzUyArPSAyO1xyXG4gICAgICB9XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICByZW1vdmVQcm94eTogZnVuY3Rpb24gKHByb3h5KSB7XHJcblxyXG4gICAgICB2YXIgcCA9IHByb3h5O1xyXG4gICAgICBpZiAocC5iZWxvbmdzVG8gPT0gMCkgcmV0dXJuO1xyXG5cclxuICAgICAgLyplbHNlIGlmICggcC5iZWxvbmdzVG8gPT0gMSApIHtcclxuICAgICAgICAgIHRoaXMuYXhlc0RbMF0ucmVtb3ZlRWxlbWVudHMoIHAubWluWzBdLCBwLm1heFswXSApO1xyXG4gICAgICAgICAgdGhpcy5heGVzRFsxXS5yZW1vdmVFbGVtZW50cyggcC5taW5bMV0sIHAubWF4WzFdICk7XHJcbiAgICAgICAgICB0aGlzLmF4ZXNEWzJdLnJlbW92ZUVsZW1lbnRzKCBwLm1pblsyXSwgcC5tYXhbMl0gKTtcclxuICAgICAgICAgIHRoaXMubnVtRWxlbWVudHNEIC09IDI7XHJcbiAgICAgIH0gZWxzZSBpZiAoIHAuYmVsb25nc1RvID09IDIgKSB7XHJcbiAgICAgICAgICB0aGlzLmF4ZXNTWzBdLnJlbW92ZUVsZW1lbnRzKCBwLm1pblswXSwgcC5tYXhbMF0gKTtcclxuICAgICAgICAgIHRoaXMuYXhlc1NbMV0ucmVtb3ZlRWxlbWVudHMoIHAubWluWzFdLCBwLm1heFsxXSApO1xyXG4gICAgICAgICAgdGhpcy5heGVzU1syXS5yZW1vdmVFbGVtZW50cyggcC5taW5bMl0sIHAubWF4WzJdICk7XHJcbiAgICAgICAgICB0aGlzLm51bUVsZW1lbnRzUyAtPSAyO1xyXG4gICAgICB9Ki9cclxuXHJcbiAgICAgIHN3aXRjaCAocC5iZWxvbmdzVG8pIHtcclxuICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICB0aGlzLmF4ZXNEWzBdLnJlbW92ZUVsZW1lbnRzKHAubWluWzBdLCBwLm1heFswXSk7XHJcbiAgICAgICAgICB0aGlzLmF4ZXNEWzFdLnJlbW92ZUVsZW1lbnRzKHAubWluWzFdLCBwLm1heFsxXSk7XHJcbiAgICAgICAgICB0aGlzLmF4ZXNEWzJdLnJlbW92ZUVsZW1lbnRzKHAubWluWzJdLCBwLm1heFsyXSk7XHJcbiAgICAgICAgICB0aGlzLm51bUVsZW1lbnRzRCAtPSAyO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAyOlxyXG4gICAgICAgICAgdGhpcy5heGVzU1swXS5yZW1vdmVFbGVtZW50cyhwLm1pblswXSwgcC5tYXhbMF0pO1xyXG4gICAgICAgICAgdGhpcy5heGVzU1sxXS5yZW1vdmVFbGVtZW50cyhwLm1pblsxXSwgcC5tYXhbMV0pO1xyXG4gICAgICAgICAgdGhpcy5heGVzU1syXS5yZW1vdmVFbGVtZW50cyhwLm1pblsyXSwgcC5tYXhbMl0pO1xyXG4gICAgICAgICAgdGhpcy5udW1FbGVtZW50c1MgLT0gMjtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBwLmJlbG9uZ3NUbyA9IDA7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBjb2xsZWN0UGFpcnM6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgIGlmICh0aGlzLm51bUVsZW1lbnRzRCA9PSAwKSByZXR1cm47XHJcblxyXG4gICAgICB2YXIgYXhpczEgPSB0aGlzLmF4ZXNEW3RoaXMuaW5kZXgxXTtcclxuICAgICAgdmFyIGF4aXMyID0gdGhpcy5heGVzRFt0aGlzLmluZGV4Ml07XHJcblxyXG4gICAgICBheGlzMS5zb3J0KCk7XHJcbiAgICAgIGF4aXMyLnNvcnQoKTtcclxuXHJcbiAgICAgIHZhciBjb3VudDEgPSBheGlzMS5jYWxjdWxhdGVUZXN0Q291bnQoKTtcclxuICAgICAgdmFyIGNvdW50MiA9IGF4aXMyLmNhbGN1bGF0ZVRlc3RDb3VudCgpO1xyXG4gICAgICB2YXIgZWxlbWVudHNEO1xyXG4gICAgICB2YXIgZWxlbWVudHNTO1xyXG4gICAgICBpZiAoY291bnQxIDw9IGNvdW50Mikgey8vIHNlbGVjdCB0aGUgYmVzdCBheGlzXHJcbiAgICAgICAgYXhpczIgPSB0aGlzLmF4ZXNTW3RoaXMuaW5kZXgxXTtcclxuICAgICAgICBheGlzMi5zb3J0KCk7XHJcbiAgICAgICAgZWxlbWVudHNEID0gYXhpczEuZWxlbWVudHM7XHJcbiAgICAgICAgZWxlbWVudHNTID0gYXhpczIuZWxlbWVudHM7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgYXhpczEgPSB0aGlzLmF4ZXNTW3RoaXMuaW5kZXgyXTtcclxuICAgICAgICBheGlzMS5zb3J0KCk7XHJcbiAgICAgICAgZWxlbWVudHNEID0gYXhpczIuZWxlbWVudHM7XHJcbiAgICAgICAgZWxlbWVudHNTID0gYXhpczEuZWxlbWVudHM7XHJcbiAgICAgICAgdGhpcy5pbmRleDEgXj0gdGhpcy5pbmRleDI7XHJcbiAgICAgICAgdGhpcy5pbmRleDIgXj0gdGhpcy5pbmRleDE7XHJcbiAgICAgICAgdGhpcy5pbmRleDEgXj0gdGhpcy5pbmRleDI7XHJcbiAgICAgIH1cclxuICAgICAgdmFyIGFjdGl2ZUQ7XHJcbiAgICAgIHZhciBhY3RpdmVTO1xyXG4gICAgICB2YXIgcCA9IDA7XHJcbiAgICAgIHZhciBxID0gMDtcclxuICAgICAgd2hpbGUgKHAgPCB0aGlzLm51bUVsZW1lbnRzRCkge1xyXG4gICAgICAgIHZhciBlMTtcclxuICAgICAgICB2YXIgZHluO1xyXG4gICAgICAgIGlmIChxID09IHRoaXMubnVtRWxlbWVudHNTKSB7XHJcbiAgICAgICAgICBlMSA9IGVsZW1lbnRzRFtwXTtcclxuICAgICAgICAgIGR5biA9IHRydWU7XHJcbiAgICAgICAgICBwKys7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHZhciBkID0gZWxlbWVudHNEW3BdO1xyXG4gICAgICAgICAgdmFyIHMgPSBlbGVtZW50c1NbcV07XHJcbiAgICAgICAgICBpZiAoZC52YWx1ZSA8IHMudmFsdWUpIHtcclxuICAgICAgICAgICAgZTEgPSBkO1xyXG4gICAgICAgICAgICBkeW4gPSB0cnVlO1xyXG4gICAgICAgICAgICBwKys7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBlMSA9IHM7XHJcbiAgICAgICAgICAgIGR5biA9IGZhbHNlO1xyXG4gICAgICAgICAgICBxKys7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghZTEubWF4KSB7XHJcbiAgICAgICAgICB2YXIgczEgPSBlMS5wcm94eS5zaGFwZTtcclxuICAgICAgICAgIHZhciBtaW4xID0gZTEubWluMS52YWx1ZTtcclxuICAgICAgICAgIHZhciBtYXgxID0gZTEubWF4MS52YWx1ZTtcclxuICAgICAgICAgIHZhciBtaW4yID0gZTEubWluMi52YWx1ZTtcclxuICAgICAgICAgIHZhciBtYXgyID0gZTEubWF4Mi52YWx1ZTtcclxuXHJcbiAgICAgICAgICBmb3IgKHZhciBlMiA9IGFjdGl2ZUQ7IGUyICE9IG51bGw7IGUyID0gZTIucGFpcikgey8vIHRlc3QgZm9yIGR5bmFtaWNcclxuICAgICAgICAgICAgdmFyIHMyID0gZTIucHJveHkuc2hhcGU7XHJcblxyXG4gICAgICAgICAgICB0aGlzLm51bVBhaXJDaGVja3MrKztcclxuICAgICAgICAgICAgaWYgKG1pbjEgPiBlMi5tYXgxLnZhbHVlIHx8IG1heDEgPCBlMi5taW4xLnZhbHVlIHx8IG1pbjIgPiBlMi5tYXgyLnZhbHVlIHx8IG1heDIgPCBlMi5taW4yLnZhbHVlIHx8ICF0aGlzLmlzQXZhaWxhYmxlUGFpcihzMSwgczIpKSBjb250aW51ZTtcclxuICAgICAgICAgICAgdGhpcy5hZGRQYWlyKHMxLCBzMik7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBpZiAoZHluKSB7XHJcbiAgICAgICAgICAgIGZvciAoZTIgPSBhY3RpdmVTOyBlMiAhPSBudWxsOyBlMiA9IGUyLnBhaXIpIHsvLyB0ZXN0IGZvciBzdGF0aWNcclxuICAgICAgICAgICAgICBzMiA9IGUyLnByb3h5LnNoYXBlO1xyXG5cclxuICAgICAgICAgICAgICB0aGlzLm51bVBhaXJDaGVja3MrKztcclxuXHJcbiAgICAgICAgICAgICAgaWYgKG1pbjEgPiBlMi5tYXgxLnZhbHVlIHx8IG1heDEgPCBlMi5taW4xLnZhbHVlIHx8IG1pbjIgPiBlMi5tYXgyLnZhbHVlIHx8IG1heDIgPCBlMi5taW4yLnZhbHVlIHx8ICF0aGlzLmlzQXZhaWxhYmxlUGFpcihzMSwgczIpKSBjb250aW51ZTtcclxuICAgICAgICAgICAgICB0aGlzLmFkZFBhaXIoczEsIHMyKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlMS5wYWlyID0gYWN0aXZlRDtcclxuICAgICAgICAgICAgYWN0aXZlRCA9IGUxO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZTEucGFpciA9IGFjdGl2ZVM7XHJcbiAgICAgICAgICAgIGFjdGl2ZVMgPSBlMTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdmFyIG1pbiA9IGUxLnBhaXI7XHJcbiAgICAgICAgICBpZiAoZHluKSB7XHJcbiAgICAgICAgICAgIGlmIChtaW4gPT0gYWN0aXZlRCkge1xyXG4gICAgICAgICAgICAgIGFjdGl2ZUQgPSBhY3RpdmVELnBhaXI7XHJcbiAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgZTEgPSBhY3RpdmVEO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAobWluID09IGFjdGl2ZVMpIHtcclxuICAgICAgICAgICAgICBhY3RpdmVTID0gYWN0aXZlUy5wYWlyO1xyXG4gICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIGUxID0gYWN0aXZlUztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgd2hpbGUgKGUxKSB7XHJcbiAgICAgICAgICAgIGUyID0gZTEucGFpcjtcclxuICAgICAgICAgICAgaWYgKGUyID09IG1pbikge1xyXG4gICAgICAgICAgICAgIGUxLnBhaXIgPSBlMi5wYWlyO1xyXG4gICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGUxID0gZTI7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHRoaXMuaW5kZXgyID0gKHRoaXMuaW5kZXgxIHwgdGhpcy5pbmRleDIpIF4gMztcclxuXHJcbiAgICB9XHJcblxyXG4gIH0pO1xyXG5cclxuICAvKipcclxuICAqIEEgbm9kZSBvZiB0aGUgZHluYW1pYyBib3VuZGluZyB2b2x1bWUgdHJlZS5cclxuICAqIEBhdXRob3Igc2FoYXJhblxyXG4gICovXHJcblxyXG4gIGZ1bmN0aW9uIERCVlROb2RlKCkge1xyXG5cclxuICAgIC8vIFRoZSBmaXJzdCBjaGlsZCBub2RlIG9mIHRoaXMgbm9kZS5cclxuICAgIHRoaXMuY2hpbGQxID0gbnVsbDtcclxuICAgIC8vIFRoZSBzZWNvbmQgY2hpbGQgbm9kZSBvZiB0aGlzIG5vZGUuXHJcbiAgICB0aGlzLmNoaWxkMiA9IG51bGw7XHJcbiAgICAvLyAgVGhlIHBhcmVudCBub2RlIG9mIHRoaXMgdHJlZS5cclxuICAgIHRoaXMucGFyZW50ID0gbnVsbDtcclxuICAgIC8vIFRoZSBwcm94eSBvZiB0aGlzIG5vZGUuIFRoaXMgaGFzIG5vIHZhbHVlIGlmIHRoaXMgbm9kZSBpcyBub3QgbGVhZi5cclxuICAgIHRoaXMucHJveHkgPSBudWxsO1xyXG4gICAgLy8gVGhlIG1heGltdW0gZGlzdGFuY2UgZnJvbSBsZWFmIG5vZGVzLlxyXG4gICAgdGhpcy5oZWlnaHQgPSAwO1xyXG4gICAgLy8gVGhlIEFBQkIgb2YgdGhpcyBub2RlLlxyXG4gICAgdGhpcy5hYWJiID0gbmV3IEFBQkIoKTtcclxuXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBIGR5bmFtaWMgYm91bmRpbmcgdm9sdW1lIHRyZWUgZm9yIHRoZSBicm9hZC1waGFzZSBhbGdvcml0aG0uXHJcbiAgICpcclxuICAgKiBAYXV0aG9yIHNhaGFyYW5cclxuICAgKiBAYXV0aG9yIGxvLXRoXHJcbiAgICovXHJcblxyXG4gIGZ1bmN0aW9uIERCVlQoKSB7XHJcblxyXG4gICAgLy8gVGhlIHJvb3Qgb2YgdGhlIHRyZWUuXHJcbiAgICB0aGlzLnJvb3QgPSBudWxsO1xyXG4gICAgdGhpcy5mcmVlTm9kZXMgPSBbXTtcclxuICAgIHRoaXMuZnJlZU5vZGVzLmxlbmd0aCA9IDE2Mzg0O1xyXG4gICAgdGhpcy5udW1GcmVlTm9kZXMgPSAwO1xyXG4gICAgdGhpcy5hYWJiID0gbmV3IEFBQkIoKTtcclxuXHJcbiAgfVxyXG4gIE9iamVjdC5hc3NpZ24oREJWVC5wcm90b3R5cGUsIHtcclxuXHJcbiAgICBEQlZUOiB0cnVlLFxyXG5cclxuICAgIG1vdmVMZWFmOiBmdW5jdGlvbiAobGVhZikge1xyXG5cclxuICAgICAgdGhpcy5kZWxldGVMZWFmKGxlYWYpO1xyXG4gICAgICB0aGlzLmluc2VydExlYWYobGVhZik7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBpbnNlcnRMZWFmOiBmdW5jdGlvbiAobGVhZikge1xyXG5cclxuICAgICAgaWYgKHRoaXMucm9vdCA9PSBudWxsKSB7XHJcbiAgICAgICAgdGhpcy5yb290ID0gbGVhZjtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgICAgdmFyIGxiID0gbGVhZi5hYWJiO1xyXG4gICAgICB2YXIgc2libGluZyA9IHRoaXMucm9vdDtcclxuICAgICAgdmFyIG9sZEFyZWE7XHJcbiAgICAgIHZhciBuZXdBcmVhO1xyXG4gICAgICB3aGlsZSAoc2libGluZy5wcm94eSA9PSBudWxsKSB7IC8vIGRlc2NlbmQgdGhlIG5vZGUgdG8gc2VhcmNoIHRoZSBiZXN0IHBhaXJcclxuICAgICAgICB2YXIgYzEgPSBzaWJsaW5nLmNoaWxkMTtcclxuICAgICAgICB2YXIgYzIgPSBzaWJsaW5nLmNoaWxkMjtcclxuICAgICAgICB2YXIgYiA9IHNpYmxpbmcuYWFiYjtcclxuICAgICAgICB2YXIgYzFiID0gYzEuYWFiYjtcclxuICAgICAgICB2YXIgYzJiID0gYzIuYWFiYjtcclxuICAgICAgICBvbGRBcmVhID0gYi5zdXJmYWNlQXJlYSgpO1xyXG4gICAgICAgIHRoaXMuYWFiYi5jb21iaW5lKGxiLCBiKTtcclxuICAgICAgICBuZXdBcmVhID0gdGhpcy5hYWJiLnN1cmZhY2VBcmVhKCk7XHJcbiAgICAgICAgdmFyIGNyZWF0aW5nQ29zdCA9IG5ld0FyZWEgKiAyO1xyXG4gICAgICAgIHZhciBpbmNyZW1lbnRhbENvc3QgPSAobmV3QXJlYSAtIG9sZEFyZWEpICogMjsgLy8gY29zdCBvZiBjcmVhdGluZyBhIG5ldyBwYWlyIHdpdGggdGhlIG5vZGVcclxuICAgICAgICB2YXIgZGlzY2VuZGluZ0Nvc3QxID0gaW5jcmVtZW50YWxDb3N0O1xyXG4gICAgICAgIHRoaXMuYWFiYi5jb21iaW5lKGxiLCBjMWIpO1xyXG4gICAgICAgIGlmIChjMS5wcm94eSAhPSBudWxsKSB7XHJcbiAgICAgICAgICAvLyBsZWFmIGNvc3QgPSBhcmVhKGNvbWJpbmVkIGFhYmIpXHJcbiAgICAgICAgICBkaXNjZW5kaW5nQ29zdDEgKz0gdGhpcy5hYWJiLnN1cmZhY2VBcmVhKCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIC8vIG5vZGUgY29zdCA9IGFyZWEoY29tYmluZWQgYWFiYikgLSBhcmVhKG9sZCBhYWJiKVxyXG4gICAgICAgICAgZGlzY2VuZGluZ0Nvc3QxICs9IHRoaXMuYWFiYi5zdXJmYWNlQXJlYSgpIC0gYzFiLnN1cmZhY2VBcmVhKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBkaXNjZW5kaW5nQ29zdDIgPSBpbmNyZW1lbnRhbENvc3Q7XHJcbiAgICAgICAgdGhpcy5hYWJiLmNvbWJpbmUobGIsIGMyYik7XHJcbiAgICAgICAgaWYgKGMyLnByb3h5ICE9IG51bGwpIHtcclxuICAgICAgICAgIC8vIGxlYWYgY29zdCA9IGFyZWEoY29tYmluZWQgYWFiYilcclxuICAgICAgICAgIGRpc2NlbmRpbmdDb3N0MiArPSB0aGlzLmFhYmIuc3VyZmFjZUFyZWEoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgLy8gbm9kZSBjb3N0ID0gYXJlYShjb21iaW5lZCBhYWJiKSAtIGFyZWEob2xkIGFhYmIpXHJcbiAgICAgICAgICBkaXNjZW5kaW5nQ29zdDIgKz0gdGhpcy5hYWJiLnN1cmZhY2VBcmVhKCkgLSBjMmIuc3VyZmFjZUFyZWEoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGRpc2NlbmRpbmdDb3N0MSA8IGRpc2NlbmRpbmdDb3N0Mikge1xyXG4gICAgICAgICAgaWYgKGNyZWF0aW5nQ29zdCA8IGRpc2NlbmRpbmdDb3N0MSkge1xyXG4gICAgICAgICAgICBicmVhazsvLyBzdG9wIGRlc2NlbmRpbmdcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHNpYmxpbmcgPSBjMTsvLyBkZXNjZW5kIGludG8gZmlyc3QgY2hpbGRcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgaWYgKGNyZWF0aW5nQ29zdCA8IGRpc2NlbmRpbmdDb3N0Mikge1xyXG4gICAgICAgICAgICBicmVhazsvLyBzdG9wIGRlc2NlbmRpbmdcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHNpYmxpbmcgPSBjMjsvLyBkZXNjZW5kIGludG8gc2Vjb25kIGNoaWxkXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHZhciBvbGRQYXJlbnQgPSBzaWJsaW5nLnBhcmVudDtcclxuICAgICAgdmFyIG5ld1BhcmVudDtcclxuICAgICAgaWYgKHRoaXMubnVtRnJlZU5vZGVzID4gMCkge1xyXG4gICAgICAgIG5ld1BhcmVudCA9IHRoaXMuZnJlZU5vZGVzWy0tdGhpcy5udW1GcmVlTm9kZXNdO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIG5ld1BhcmVudCA9IG5ldyBEQlZUTm9kZSgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBuZXdQYXJlbnQucGFyZW50ID0gb2xkUGFyZW50O1xyXG4gICAgICBuZXdQYXJlbnQuY2hpbGQxID0gbGVhZjtcclxuICAgICAgbmV3UGFyZW50LmNoaWxkMiA9IHNpYmxpbmc7XHJcbiAgICAgIG5ld1BhcmVudC5hYWJiLmNvbWJpbmUobGVhZi5hYWJiLCBzaWJsaW5nLmFhYmIpO1xyXG4gICAgICBuZXdQYXJlbnQuaGVpZ2h0ID0gc2libGluZy5oZWlnaHQgKyAxO1xyXG4gICAgICBzaWJsaW5nLnBhcmVudCA9IG5ld1BhcmVudDtcclxuICAgICAgbGVhZi5wYXJlbnQgPSBuZXdQYXJlbnQ7XHJcbiAgICAgIGlmIChzaWJsaW5nID09IHRoaXMucm9vdCkge1xyXG4gICAgICAgIC8vIHJlcGxhY2Ugcm9vdFxyXG4gICAgICAgIHRoaXMucm9vdCA9IG5ld1BhcmVudDtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAvLyByZXBsYWNlIGNoaWxkXHJcbiAgICAgICAgaWYgKG9sZFBhcmVudC5jaGlsZDEgPT0gc2libGluZykge1xyXG4gICAgICAgICAgb2xkUGFyZW50LmNoaWxkMSA9IG5ld1BhcmVudDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgb2xkUGFyZW50LmNoaWxkMiA9IG5ld1BhcmVudDtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgLy8gdXBkYXRlIHdob2xlIHRyZWVcclxuICAgICAgZG8ge1xyXG4gICAgICAgIG5ld1BhcmVudCA9IHRoaXMuYmFsYW5jZShuZXdQYXJlbnQpO1xyXG4gICAgICAgIHRoaXMuZml4KG5ld1BhcmVudCk7XHJcbiAgICAgICAgbmV3UGFyZW50ID0gbmV3UGFyZW50LnBhcmVudDtcclxuICAgICAgfSB3aGlsZSAobmV3UGFyZW50ICE9IG51bGwpO1xyXG4gICAgfSxcclxuXHJcbiAgICBnZXRCYWxhbmNlOiBmdW5jdGlvbiAobm9kZSkge1xyXG5cclxuICAgICAgaWYgKG5vZGUucHJveHkgIT0gbnVsbCkgcmV0dXJuIDA7XHJcbiAgICAgIHJldHVybiBub2RlLmNoaWxkMS5oZWlnaHQgLSBub2RlLmNoaWxkMi5oZWlnaHQ7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBkZWxldGVMZWFmOiBmdW5jdGlvbiAobGVhZikge1xyXG5cclxuICAgICAgaWYgKGxlYWYgPT0gdGhpcy5yb290KSB7XHJcbiAgICAgICAgdGhpcy5yb290ID0gbnVsbDtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgICAgdmFyIHBhcmVudCA9IGxlYWYucGFyZW50O1xyXG4gICAgICB2YXIgc2libGluZztcclxuICAgICAgaWYgKHBhcmVudC5jaGlsZDEgPT0gbGVhZikge1xyXG4gICAgICAgIHNpYmxpbmcgPSBwYXJlbnQuY2hpbGQyO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHNpYmxpbmcgPSBwYXJlbnQuY2hpbGQxO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChwYXJlbnQgPT0gdGhpcy5yb290KSB7XHJcbiAgICAgICAgdGhpcy5yb290ID0gc2libGluZztcclxuICAgICAgICBzaWJsaW5nLnBhcmVudCA9IG51bGw7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICAgIHZhciBncmFuZFBhcmVudCA9IHBhcmVudC5wYXJlbnQ7XHJcbiAgICAgIHNpYmxpbmcucGFyZW50ID0gZ3JhbmRQYXJlbnQ7XHJcbiAgICAgIGlmIChncmFuZFBhcmVudC5jaGlsZDEgPT0gcGFyZW50KSB7XHJcbiAgICAgICAgZ3JhbmRQYXJlbnQuY2hpbGQxID0gc2libGluZztcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBncmFuZFBhcmVudC5jaGlsZDIgPSBzaWJsaW5nO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICh0aGlzLm51bUZyZWVOb2RlcyA8IDE2Mzg0KSB7XHJcbiAgICAgICAgdGhpcy5mcmVlTm9kZXNbdGhpcy5udW1GcmVlTm9kZXMrK10gPSBwYXJlbnQ7XHJcbiAgICAgIH1cclxuICAgICAgZG8ge1xyXG4gICAgICAgIGdyYW5kUGFyZW50ID0gdGhpcy5iYWxhbmNlKGdyYW5kUGFyZW50KTtcclxuICAgICAgICB0aGlzLmZpeChncmFuZFBhcmVudCk7XHJcbiAgICAgICAgZ3JhbmRQYXJlbnQgPSBncmFuZFBhcmVudC5wYXJlbnQ7XHJcbiAgICAgIH0gd2hpbGUgKGdyYW5kUGFyZW50ICE9IG51bGwpO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgYmFsYW5jZTogZnVuY3Rpb24gKG5vZGUpIHtcclxuXHJcbiAgICAgIHZhciBuaCA9IG5vZGUuaGVpZ2h0O1xyXG4gICAgICBpZiAobmggPCAyKSB7XHJcbiAgICAgICAgcmV0dXJuIG5vZGU7XHJcbiAgICAgIH1cclxuICAgICAgdmFyIHAgPSBub2RlLnBhcmVudDtcclxuICAgICAgdmFyIGwgPSBub2RlLmNoaWxkMTtcclxuICAgICAgdmFyIHIgPSBub2RlLmNoaWxkMjtcclxuICAgICAgdmFyIGxoID0gbC5oZWlnaHQ7XHJcbiAgICAgIHZhciByaCA9IHIuaGVpZ2h0O1xyXG4gICAgICB2YXIgYmFsYW5jZSA9IGxoIC0gcmg7XHJcbiAgICAgIHZhciB0Oy8vIGZvciBiaXQgb3BlcmF0aW9uXHJcblxyXG4gICAgICAvLyAgICAgICAgICBbIE4gXVxyXG4gICAgICAvLyAgICAgICAgIC8gICAgIFxcXHJcbiAgICAgIC8vICAgIFsgTCBdICAgICAgIFsgUiBdXHJcbiAgICAgIC8vICAgICAvIFxcICAgICAgICAgLyBcXFxyXG4gICAgICAvLyBbTC1MXSBbTC1SXSBbUi1MXSBbUi1SXVxyXG5cclxuICAgICAgLy8gSXMgdGhlIHRyZWUgYmFsYW5jZWQ/XHJcbiAgICAgIGlmIChiYWxhbmNlID4gMSkge1xyXG4gICAgICAgIHZhciBsbCA9IGwuY2hpbGQxO1xyXG4gICAgICAgIHZhciBsciA9IGwuY2hpbGQyO1xyXG4gICAgICAgIHZhciBsbGggPSBsbC5oZWlnaHQ7XHJcbiAgICAgICAgdmFyIGxyaCA9IGxyLmhlaWdodDtcclxuXHJcbiAgICAgICAgLy8gSXMgTC1MIGhpZ2hlciB0aGFuIEwtUj9cclxuICAgICAgICBpZiAobGxoID4gbHJoKSB7XHJcbiAgICAgICAgICAvLyBzZXQgTiB0byBMLVJcclxuICAgICAgICAgIGwuY2hpbGQyID0gbm9kZTtcclxuICAgICAgICAgIG5vZGUucGFyZW50ID0gbDtcclxuXHJcbiAgICAgICAgICAvLyAgICAgICAgICBbIEwgXVxyXG4gICAgICAgICAgLy8gICAgICAgICAvICAgICBcXFxyXG4gICAgICAgICAgLy8gICAgW0wtTF0gICAgICAgWyBOIF1cclxuICAgICAgICAgIC8vICAgICAvIFxcICAgICAgICAgLyBcXFxyXG4gICAgICAgICAgLy8gWy4uLl0gWy4uLl0gWyBMIF0gWyBSIF1cclxuXHJcbiAgICAgICAgICAvLyBzZXQgTC1SXHJcbiAgICAgICAgICBub2RlLmNoaWxkMSA9IGxyO1xyXG4gICAgICAgICAgbHIucGFyZW50ID0gbm9kZTtcclxuXHJcbiAgICAgICAgICAvLyAgICAgICAgICBbIEwgXVxyXG4gICAgICAgICAgLy8gICAgICAgICAvICAgICBcXFxyXG4gICAgICAgICAgLy8gICAgW0wtTF0gICAgICAgWyBOIF1cclxuICAgICAgICAgIC8vICAgICAvIFxcICAgICAgICAgLyBcXFxyXG4gICAgICAgICAgLy8gWy4uLl0gWy4uLl0gW0wtUl0gWyBSIF1cclxuXHJcbiAgICAgICAgICAvLyBmaXggYm91bmRzIGFuZCBoZWlnaHRzXHJcbiAgICAgICAgICBub2RlLmFhYmIuY29tYmluZShsci5hYWJiLCByLmFhYmIpO1xyXG4gICAgICAgICAgdCA9IGxyaCAtIHJoO1xyXG4gICAgICAgICAgbm9kZS5oZWlnaHQgPSBscmggLSAodCAmIHQgPj4gMzEpICsgMTtcclxuICAgICAgICAgIGwuYWFiYi5jb21iaW5lKGxsLmFhYmIsIG5vZGUuYWFiYik7XHJcbiAgICAgICAgICB0ID0gbGxoIC0gbmg7XHJcbiAgICAgICAgICBsLmhlaWdodCA9IGxsaCAtICh0ICYgdCA+PiAzMSkgKyAxO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAvLyBzZXQgTiB0byBMLUxcclxuICAgICAgICAgIGwuY2hpbGQxID0gbm9kZTtcclxuICAgICAgICAgIG5vZGUucGFyZW50ID0gbDtcclxuXHJcbiAgICAgICAgICAvLyAgICAgICAgICBbIEwgXVxyXG4gICAgICAgICAgLy8gICAgICAgICAvICAgICBcXFxyXG4gICAgICAgICAgLy8gICAgWyBOIF0gICAgICAgW0wtUl1cclxuICAgICAgICAgIC8vICAgICAvIFxcICAgICAgICAgLyBcXFxyXG4gICAgICAgICAgLy8gWyBMIF0gWyBSIF0gWy4uLl0gWy4uLl1cclxuXHJcbiAgICAgICAgICAvLyBzZXQgTC1MXHJcbiAgICAgICAgICBub2RlLmNoaWxkMSA9IGxsO1xyXG4gICAgICAgICAgbGwucGFyZW50ID0gbm9kZTtcclxuXHJcbiAgICAgICAgICAvLyAgICAgICAgICBbIEwgXVxyXG4gICAgICAgICAgLy8gICAgICAgICAvICAgICBcXFxyXG4gICAgICAgICAgLy8gICAgWyBOIF0gICAgICAgW0wtUl1cclxuICAgICAgICAgIC8vICAgICAvIFxcICAgICAgICAgLyBcXFxyXG4gICAgICAgICAgLy8gW0wtTF0gWyBSIF0gWy4uLl0gWy4uLl1cclxuXHJcbiAgICAgICAgICAvLyBmaXggYm91bmRzIGFuZCBoZWlnaHRzXHJcbiAgICAgICAgICBub2RlLmFhYmIuY29tYmluZShsbC5hYWJiLCByLmFhYmIpO1xyXG4gICAgICAgICAgdCA9IGxsaCAtIHJoO1xyXG4gICAgICAgICAgbm9kZS5oZWlnaHQgPSBsbGggLSAodCAmIHQgPj4gMzEpICsgMTtcclxuXHJcbiAgICAgICAgICBsLmFhYmIuY29tYmluZShub2RlLmFhYmIsIGxyLmFhYmIpO1xyXG4gICAgICAgICAgdCA9IG5oIC0gbHJoO1xyXG4gICAgICAgICAgbC5oZWlnaHQgPSBuaCAtICh0ICYgdCA+PiAzMSkgKyAxO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBzZXQgbmV3IHBhcmVudCBvZiBMXHJcbiAgICAgICAgaWYgKHAgIT0gbnVsbCkge1xyXG4gICAgICAgICAgaWYgKHAuY2hpbGQxID09IG5vZGUpIHtcclxuICAgICAgICAgICAgcC5jaGlsZDEgPSBsO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcC5jaGlsZDIgPSBsO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLnJvb3QgPSBsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsLnBhcmVudCA9IHA7XHJcbiAgICAgICAgcmV0dXJuIGw7XHJcbiAgICAgIH0gZWxzZSBpZiAoYmFsYW5jZSA8IC0xKSB7XHJcbiAgICAgICAgdmFyIHJsID0gci5jaGlsZDE7XHJcbiAgICAgICAgdmFyIHJyID0gci5jaGlsZDI7XHJcbiAgICAgICAgdmFyIHJsaCA9IHJsLmhlaWdodDtcclxuICAgICAgICB2YXIgcnJoID0gcnIuaGVpZ2h0O1xyXG5cclxuICAgICAgICAvLyBJcyBSLUwgaGlnaGVyIHRoYW4gUi1SP1xyXG4gICAgICAgIGlmIChybGggPiBycmgpIHtcclxuICAgICAgICAgIC8vIHNldCBOIHRvIFItUlxyXG4gICAgICAgICAgci5jaGlsZDIgPSBub2RlO1xyXG4gICAgICAgICAgbm9kZS5wYXJlbnQgPSByO1xyXG5cclxuICAgICAgICAgIC8vICAgICAgICAgIFsgUiBdXHJcbiAgICAgICAgICAvLyAgICAgICAgIC8gICAgIFxcXHJcbiAgICAgICAgICAvLyAgICBbUi1MXSAgICAgICBbIE4gXVxyXG4gICAgICAgICAgLy8gICAgIC8gXFwgICAgICAgICAvIFxcXHJcbiAgICAgICAgICAvLyBbLi4uXSBbLi4uXSBbIEwgXSBbIFIgXVxyXG5cclxuICAgICAgICAgIC8vIHNldCBSLVJcclxuICAgICAgICAgIG5vZGUuY2hpbGQyID0gcnI7XHJcbiAgICAgICAgICByci5wYXJlbnQgPSBub2RlO1xyXG5cclxuICAgICAgICAgIC8vICAgICAgICAgIFsgUiBdXHJcbiAgICAgICAgICAvLyAgICAgICAgIC8gICAgIFxcXHJcbiAgICAgICAgICAvLyAgICBbUi1MXSAgICAgICBbIE4gXVxyXG4gICAgICAgICAgLy8gICAgIC8gXFwgICAgICAgICAvIFxcXHJcbiAgICAgICAgICAvLyBbLi4uXSBbLi4uXSBbIEwgXSBbUi1SXVxyXG5cclxuICAgICAgICAgIC8vIGZpeCBib3VuZHMgYW5kIGhlaWdodHNcclxuICAgICAgICAgIG5vZGUuYWFiYi5jb21iaW5lKGwuYWFiYiwgcnIuYWFiYik7XHJcbiAgICAgICAgICB0ID0gbGggLSBycmg7XHJcbiAgICAgICAgICBub2RlLmhlaWdodCA9IGxoIC0gKHQgJiB0ID4+IDMxKSArIDE7XHJcbiAgICAgICAgICByLmFhYmIuY29tYmluZShybC5hYWJiLCBub2RlLmFhYmIpO1xyXG4gICAgICAgICAgdCA9IHJsaCAtIG5oO1xyXG4gICAgICAgICAgci5oZWlnaHQgPSBybGggLSAodCAmIHQgPj4gMzEpICsgMTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgLy8gc2V0IE4gdG8gUi1MXHJcbiAgICAgICAgICByLmNoaWxkMSA9IG5vZGU7XHJcbiAgICAgICAgICBub2RlLnBhcmVudCA9IHI7XHJcbiAgICAgICAgICAvLyAgICAgICAgICBbIFIgXVxyXG4gICAgICAgICAgLy8gICAgICAgICAvICAgICBcXFxyXG4gICAgICAgICAgLy8gICAgWyBOIF0gICAgICAgW1ItUl1cclxuICAgICAgICAgIC8vICAgICAvIFxcICAgICAgICAgLyBcXFxyXG4gICAgICAgICAgLy8gWyBMIF0gWyBSIF0gWy4uLl0gWy4uLl1cclxuXHJcbiAgICAgICAgICAvLyBzZXQgUi1MXHJcbiAgICAgICAgICBub2RlLmNoaWxkMiA9IHJsO1xyXG4gICAgICAgICAgcmwucGFyZW50ID0gbm9kZTtcclxuXHJcbiAgICAgICAgICAvLyAgICAgICAgICBbIFIgXVxyXG4gICAgICAgICAgLy8gICAgICAgICAvICAgICBcXFxyXG4gICAgICAgICAgLy8gICAgWyBOIF0gICAgICAgW1ItUl1cclxuICAgICAgICAgIC8vICAgICAvIFxcICAgICAgICAgLyBcXFxyXG4gICAgICAgICAgLy8gWyBMIF0gW1ItTF0gWy4uLl0gWy4uLl1cclxuXHJcbiAgICAgICAgICAvLyBmaXggYm91bmRzIGFuZCBoZWlnaHRzXHJcbiAgICAgICAgICBub2RlLmFhYmIuY29tYmluZShsLmFhYmIsIHJsLmFhYmIpO1xyXG4gICAgICAgICAgdCA9IGxoIC0gcmxoO1xyXG4gICAgICAgICAgbm9kZS5oZWlnaHQgPSBsaCAtICh0ICYgdCA+PiAzMSkgKyAxO1xyXG4gICAgICAgICAgci5hYWJiLmNvbWJpbmUobm9kZS5hYWJiLCByci5hYWJiKTtcclxuICAgICAgICAgIHQgPSBuaCAtIHJyaDtcclxuICAgICAgICAgIHIuaGVpZ2h0ID0gbmggLSAodCAmIHQgPj4gMzEpICsgMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gc2V0IG5ldyBwYXJlbnQgb2YgUlxyXG4gICAgICAgIGlmIChwICE9IG51bGwpIHtcclxuICAgICAgICAgIGlmIChwLmNoaWxkMSA9PSBub2RlKSB7XHJcbiAgICAgICAgICAgIHAuY2hpbGQxID0gcjtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHAuY2hpbGQyID0gcjtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdGhpcy5yb290ID0gcjtcclxuICAgICAgICB9XHJcbiAgICAgICAgci5wYXJlbnQgPSBwO1xyXG4gICAgICAgIHJldHVybiByO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBub2RlO1xyXG4gICAgfSxcclxuXHJcbiAgICBmaXg6IGZ1bmN0aW9uIChub2RlKSB7XHJcblxyXG4gICAgICB2YXIgYzEgPSBub2RlLmNoaWxkMTtcclxuICAgICAgdmFyIGMyID0gbm9kZS5jaGlsZDI7XHJcbiAgICAgIG5vZGUuYWFiYi5jb21iaW5lKGMxLmFhYmIsIGMyLmFhYmIpO1xyXG4gICAgICBub2RlLmhlaWdodCA9IGMxLmhlaWdodCA8IGMyLmhlaWdodCA/IGMyLmhlaWdodCArIDEgOiBjMS5oZWlnaHQgKyAxO1xyXG5cclxuICAgIH1cclxuXHJcbiAgfSk7XHJcblxyXG4gIC8qKlxyXG4gICogQSBwcm94eSBmb3IgZHluYW1pYyBib3VuZGluZyB2b2x1bWUgdHJlZSBicm9hZC1waGFzZS5cclxuICAqIEBhdXRob3Igc2FoYXJhblxyXG4gICovXHJcblxyXG4gIGZ1bmN0aW9uIERCVlRQcm94eShzaGFwZSkge1xyXG5cclxuICAgIFByb3h5LmNhbGwodGhpcywgc2hhcGUpO1xyXG4gICAgLy8gVGhlIGxlYWYgb2YgdGhlIHByb3h5LlxyXG4gICAgdGhpcy5sZWFmID0gbmV3IERCVlROb2RlKCk7XHJcbiAgICB0aGlzLmxlYWYucHJveHkgPSB0aGlzO1xyXG5cclxuICB9XHJcbiAgREJWVFByb3h5LnByb3RvdHlwZSA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmNyZWF0ZShQcm94eS5wcm90b3R5cGUpLCB7XHJcblxyXG4gICAgY29uc3RydWN0b3I6IERCVlRQcm94eSxcclxuXHJcbiAgICB1cGRhdGU6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICB9XHJcblxyXG4gIH0pO1xyXG5cclxuICAvKipcclxuICAgKiBBIGJyb2FkLXBoYXNlIGFsZ29yaXRobSB1c2luZyBkeW5hbWljIGJvdW5kaW5nIHZvbHVtZSB0cmVlLlxyXG4gICAqXHJcbiAgICogQGF1dGhvciBzYWhhcmFuXHJcbiAgICogQGF1dGhvciBsby10aFxyXG4gICAqL1xyXG5cclxuICBmdW5jdGlvbiBEQlZUQnJvYWRQaGFzZSgpIHtcclxuXHJcbiAgICBCcm9hZFBoYXNlLmNhbGwodGhpcyk7XHJcblxyXG4gICAgdGhpcy50eXBlcyA9IEJSX0JPVU5ESU5HX1ZPTFVNRV9UUkVFO1xyXG5cclxuICAgIHRoaXMudHJlZSA9IG5ldyBEQlZUKCk7XHJcbiAgICB0aGlzLnN0YWNrID0gW107XHJcbiAgICB0aGlzLmxlYXZlcyA9IFtdO1xyXG4gICAgdGhpcy5udW1MZWF2ZXMgPSAwO1xyXG5cclxuICB9XHJcbiAgREJWVEJyb2FkUGhhc2UucHJvdG90eXBlID0gT2JqZWN0LmFzc2lnbihPYmplY3QuY3JlYXRlKEJyb2FkUGhhc2UucHJvdG90eXBlKSwge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yOiBEQlZUQnJvYWRQaGFzZSxcclxuXHJcbiAgICBjcmVhdGVQcm94eTogZnVuY3Rpb24gKHNoYXBlKSB7XHJcblxyXG4gICAgICByZXR1cm4gbmV3IERCVlRQcm94eShzaGFwZSk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBhZGRQcm94eTogZnVuY3Rpb24gKHByb3h5KSB7XHJcblxyXG4gICAgICB0aGlzLnRyZWUuaW5zZXJ0TGVhZihwcm94eS5sZWFmKTtcclxuICAgICAgdGhpcy5sZWF2ZXMucHVzaChwcm94eS5sZWFmKTtcclxuICAgICAgdGhpcy5udW1MZWF2ZXMrKztcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHJlbW92ZVByb3h5OiBmdW5jdGlvbiAocHJveHkpIHtcclxuXHJcbiAgICAgIHRoaXMudHJlZS5kZWxldGVMZWFmKHByb3h5LmxlYWYpO1xyXG4gICAgICB2YXIgbiA9IHRoaXMubGVhdmVzLmluZGV4T2YocHJveHkubGVhZik7XHJcbiAgICAgIGlmIChuID4gLTEpIHtcclxuICAgICAgICB0aGlzLmxlYXZlcy5zcGxpY2UobiwgMSk7XHJcbiAgICAgICAgdGhpcy5udW1MZWF2ZXMtLTtcclxuICAgICAgfVxyXG5cclxuICAgIH0sXHJcblxyXG4gICAgY29sbGVjdFBhaXJzOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICBpZiAodGhpcy5udW1MZWF2ZXMgPCAyKSByZXR1cm47XHJcblxyXG4gICAgICB2YXIgbGVhZiwgbWFyZ2luID0gMC4xLCBpID0gdGhpcy5udW1MZWF2ZXM7XHJcblxyXG4gICAgICB3aGlsZSAoaS0tKSB7XHJcblxyXG4gICAgICAgIGxlYWYgPSB0aGlzLmxlYXZlc1tpXTtcclxuXHJcbiAgICAgICAgaWYgKGxlYWYucHJveHkuYWFiYi5pbnRlcnNlY3RUZXN0VHdvKGxlYWYuYWFiYikpIHtcclxuXHJcbiAgICAgICAgICBsZWFmLmFhYmIuY29weShsZWFmLnByb3h5LmFhYmIsIG1hcmdpbik7XHJcbiAgICAgICAgICB0aGlzLnRyZWUuZGVsZXRlTGVhZihsZWFmKTtcclxuICAgICAgICAgIHRoaXMudHJlZS5pbnNlcnRMZWFmKGxlYWYpO1xyXG4gICAgICAgICAgdGhpcy5jb2xsaWRlKGxlYWYsIHRoaXMudHJlZS5yb290KTtcclxuXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBjb2xsaWRlOiBmdW5jdGlvbiAobm9kZTEsIG5vZGUyKSB7XHJcblxyXG4gICAgICB2YXIgc3RhY2tDb3VudCA9IDI7XHJcbiAgICAgIHZhciBzMSwgczIsIG4xLCBuMiwgbDEsIGwyO1xyXG4gICAgICB0aGlzLnN0YWNrWzBdID0gbm9kZTE7XHJcbiAgICAgIHRoaXMuc3RhY2tbMV0gPSBub2RlMjtcclxuXHJcbiAgICAgIHdoaWxlIChzdGFja0NvdW50ID4gMCkge1xyXG5cclxuICAgICAgICBuMSA9IHRoaXMuc3RhY2tbLS1zdGFja0NvdW50XTtcclxuICAgICAgICBuMiA9IHRoaXMuc3RhY2tbLS1zdGFja0NvdW50XTtcclxuICAgICAgICBsMSA9IG4xLnByb3h5ICE9IG51bGw7XHJcbiAgICAgICAgbDIgPSBuMi5wcm94eSAhPSBudWxsO1xyXG5cclxuICAgICAgICB0aGlzLm51bVBhaXJDaGVja3MrKztcclxuXHJcbiAgICAgICAgaWYgKGwxICYmIGwyKSB7XHJcbiAgICAgICAgICBzMSA9IG4xLnByb3h5LnNoYXBlO1xyXG4gICAgICAgICAgczIgPSBuMi5wcm94eS5zaGFwZTtcclxuICAgICAgICAgIGlmIChzMSA9PSBzMiB8fCBzMS5hYWJiLmludGVyc2VjdFRlc3QoczIuYWFiYikgfHwgIXRoaXMuaXNBdmFpbGFibGVQYWlyKHMxLCBzMikpIGNvbnRpbnVlO1xyXG5cclxuICAgICAgICAgIHRoaXMuYWRkUGFpcihzMSwgczIpO1xyXG5cclxuICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgIGlmIChuMS5hYWJiLmludGVyc2VjdFRlc3QobjIuYWFiYikpIGNvbnRpbnVlO1xyXG5cclxuICAgICAgICAgIC8qaWYoc3RhY2tDb3VudCs0Pj10aGlzLm1heFN0YWNrKXsvLyBleHBhbmQgdGhlIHN0YWNrXHJcbiAgICAgICAgICAgICAgLy90aGlzLm1heFN0YWNrPDw9MTtcclxuICAgICAgICAgICAgICB0aGlzLm1heFN0YWNrKj0yO1xyXG4gICAgICAgICAgICAgIHZhciBuZXdTdGFjayA9IFtdOy8vIHZlY3RvclxyXG4gICAgICAgICAgICAgIG5ld1N0YWNrLmxlbmd0aCA9IHRoaXMubWF4U3RhY2s7XHJcbiAgICAgICAgICAgICAgZm9yKHZhciBpPTA7aTxzdGFja0NvdW50O2krKyl7XHJcbiAgICAgICAgICAgICAgICAgIG5ld1N0YWNrW2ldID0gdGhpcy5zdGFja1tpXTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgdGhpcy5zdGFjayA9IG5ld1N0YWNrO1xyXG4gICAgICAgICAgfSovXHJcblxyXG4gICAgICAgICAgaWYgKGwyIHx8ICFsMSAmJiAobjEuYWFiYi5zdXJmYWNlQXJlYSgpID4gbjIuYWFiYi5zdXJmYWNlQXJlYSgpKSkge1xyXG4gICAgICAgICAgICB0aGlzLnN0YWNrW3N0YWNrQ291bnQrK10gPSBuMS5jaGlsZDE7XHJcbiAgICAgICAgICAgIHRoaXMuc3RhY2tbc3RhY2tDb3VudCsrXSA9IG4yO1xyXG4gICAgICAgICAgICB0aGlzLnN0YWNrW3N0YWNrQ291bnQrK10gPSBuMS5jaGlsZDI7XHJcbiAgICAgICAgICAgIHRoaXMuc3RhY2tbc3RhY2tDb3VudCsrXSA9IG4yO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5zdGFja1tzdGFja0NvdW50KytdID0gbjE7XHJcbiAgICAgICAgICAgIHRoaXMuc3RhY2tbc3RhY2tDb3VudCsrXSA9IG4yLmNoaWxkMTtcclxuICAgICAgICAgICAgdGhpcy5zdGFja1tzdGFja0NvdW50KytdID0gbjE7XHJcbiAgICAgICAgICAgIHRoaXMuc3RhY2tbc3RhY2tDb3VudCsrXSA9IG4yLmNoaWxkMjtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gIH0pO1xyXG5cclxuICBmdW5jdGlvbiBDb2xsaXNpb25EZXRlY3RvcigpIHtcclxuXHJcbiAgICB0aGlzLmZsaXAgPSBmYWxzZTtcclxuXHJcbiAgfVxyXG4gIE9iamVjdC5hc3NpZ24oQ29sbGlzaW9uRGV0ZWN0b3IucHJvdG90eXBlLCB7XHJcblxyXG4gICAgQ29sbGlzaW9uRGV0ZWN0b3I6IHRydWUsXHJcblxyXG4gICAgZGV0ZWN0Q29sbGlzaW9uOiBmdW5jdGlvbiAoc2hhcGUxLCBzaGFwZTIsIG1hbmlmb2xkKSB7XHJcblxyXG4gICAgICBwcmludEVycm9yKFwiQ29sbGlzaW9uRGV0ZWN0b3JcIiwgXCJJbmhlcml0YW5jZSBlcnJvci5cIik7XHJcblxyXG4gICAgfVxyXG5cclxuICB9KTtcclxuXHJcbiAgLyoqXHJcbiAgICogQSBjb2xsaXNpb24gZGV0ZWN0b3Igd2hpY2ggZGV0ZWN0cyBjb2xsaXNpb25zIGJldHdlZW4gdHdvIGJveGVzLlxyXG4gICAqIEBhdXRob3Igc2FoYXJhblxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIEJveEJveENvbGxpc2lvbkRldGVjdG9yKCkge1xyXG5cclxuICAgIENvbGxpc2lvbkRldGVjdG9yLmNhbGwodGhpcyk7XHJcbiAgICB0aGlzLmNsaXBWZXJ0aWNlczEgPSBuZXcgRmxvYXQzMkFycmF5KDI0KTsgLy8gOCB2ZXJ0aWNlcyB4LHkselxyXG4gICAgdGhpcy5jbGlwVmVydGljZXMyID0gbmV3IEZsb2F0MzJBcnJheSgyNCk7XHJcbiAgICB0aGlzLnVzZWQgPSBuZXcgRmxvYXQzMkFycmF5KDgpO1xyXG5cclxuICAgIHRoaXMuSU5GID0gMSAvIDA7XHJcblxyXG4gIH1cclxuICBCb3hCb3hDb2xsaXNpb25EZXRlY3Rvci5wcm90b3R5cGUgPSBPYmplY3QuYXNzaWduKE9iamVjdC5jcmVhdGUoQ29sbGlzaW9uRGV0ZWN0b3IucHJvdG90eXBlKSwge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yOiBCb3hCb3hDb2xsaXNpb25EZXRlY3RvcixcclxuXHJcbiAgICBkZXRlY3RDb2xsaXNpb246IGZ1bmN0aW9uIChzaGFwZTEsIHNoYXBlMiwgbWFuaWZvbGQpIHtcclxuICAgICAgLy8gV2hhdCB5b3UgYXJlIGRvaW5nIFxyXG4gICAgICAvLyDCtyBJIHRvIHByZXBhcmUgYSBzZXBhcmF0ZSBheGlzIG9mIHRoZSBmaWZ0ZWVuIFxyXG4gICAgICAvLy1TaXggaW4gZWFjaCBvZiB0aHJlZSBub3JtYWwgdmVjdG9ycyBvZiB0aGUgeHl6IGRpcmVjdGlvbiBvZiB0aGUgYm94IGJvdGggXHJcbiAgICAgIC8vIMK3IFJlbWFpbmluZyBuaW5lIDN4MyBhIHZlY3RvciBwZXJwZW5kaWN1bGFyIHRvIHRoZSBzaWRlIG9mIHRoZSBib3ggMiBhbmQgdGhlIHNpZGUgb2YgdGhlIGJveCAxIFxyXG4gICAgICAvLyDCtyBDYWxjdWxhdGUgdGhlIGRlcHRoIHRvIHRoZSBzZXBhcmF0aW9uIGF4aXMgXHJcblxyXG4gICAgICAvLyBDYWxjdWxhdGVzIHRoZSBkaXN0YW5jZSB1c2luZyB0aGUgaW5uZXIgcHJvZHVjdCBhbmQgcHV0IHRoZSBhbW91bnQgb2YgZW1iZWRtZW50IFxyXG4gICAgICAvLyDCtyBIb3dldmVyIGEgdmVydGljYWwgc2VwYXJhdGlvbiBheGlzIGFuZCBzaWRlIHRvIHdlaWdodCBhIGxpdHRsZSB0byBhdm9pZCB2aWJyYXRpb24gXHJcbiAgICAgIC8vIEFuZCBlbmQgd2hlbiB0aGVyZSBpcyBhIHNlcGFyYXRlIGF4aXMgdGhhdCBpcyByZW1vdGUgZXZlbiBvbmUgXHJcbiAgICAgIC8vIMK3IEkgbG9vayBmb3Igc2VwYXJhdGlvbiBheGlzIHdpdGggbGl0dGxlIHRvIGRlbnQgbW9zdCBcclxuICAgICAgLy8gTWVuIGFuZCBpZiBzZXBhcmF0aW9uIGF4aXMgb2YgdGhlIGZpcnN0IHNpeCAtIGVuZCBjb2xsaXNpb24gXHJcbiAgICAgIC8vIEhlbmcgSWYgaXQgc2VwYXJhdGUgYXhpcyBvZiBuaW5lIG90aGVyIC0gc2lkZSBjb2xsaXNpb24gXHJcbiAgICAgIC8vIEhlbmcgLSBjYXNlIG9mIGEgc2lkZSBjb2xsaXNpb24gXHJcbiAgICAgIC8vIMK3IEZpbmQgcG9pbnRzIG9mIHR3byBzaWRlcyBvbiB3aGljaCB5b3UgbWFkZSDigIvigIt0aGUgc2VwYXJhdGlvbiBheGlzIFxyXG5cclxuICAgICAgLy8gQ2FsY3VsYXRlcyB0aGUgcG9pbnQgb2YgY2xvc2VzdCBhcHByb2FjaCBvZiBhIHN0cmFpZ2h0IGxpbmUgY29uc2lzdGluZyBvZiBzZXBhcmF0ZSBheGlzIHBvaW50cyBvYnRhaW5lZCwgYW5kIHRoZSBjb2xsaXNpb24gcG9pbnQgXHJcbiAgICAgIC8vLVN1cmZhY2UgLSB0aGUgY2FzZSBvZiB0aGUgcGxhbmUgY3Jhc2ggXHJcbiAgICAgIC8vLUJveCBBLCBib3ggQiBhbmQgdGhlIG90aGVyIGEgYm94IG9mIGJldHRlciBtYWRlIOKAi+KAi2Egc2VwYXJhdGUgYXhpcyBcclxuICAgICAgLy8g4oCiIFRoZSBzdXJmYWNlIEEgYW5kIHRoZSBwbGFuZSB0aGF0IG1hZGUgdGhlIHNlcGFyYXRpb24gYXhpcyBvZiB0aGUgYm94IEEsIGFuZCBCIHRvIHRoZSBzdXJmYWNlIHRoZSBmYWNlIG9mIHRoZSBib3ggQiBjbG9zZSBpbiB0aGUgb3Bwb3NpdGUgZGlyZWN0aW9uIHRvIHRoZSBtb3N0IGlzb2xhdGVkIGF4aXMgXHJcblxyXG4gICAgICAvLyBXaGVuIHZpZXdlZCBmcm9tIHRoZSBmcm9udCBzdXJmYWNlIEEsIGFuZCB0aGUgY3V0IHBhcnQgZXhjZWVkaW5nIHRoZSBhcmVhIG9mIHRoZSBzdXJmYWNlIEEgaXMgYSBzdXJmYWNlIEIgXHJcbiAgICAgIC8vLVBsYW5lIEIgYmVjb21lcyB0aGUgMy04IHRyaWFuZ2xlLCBJIGEgY2FuZGlkYXRlIGZvciB0aGUgY29sbGlzaW9uIHBvaW50IHRoZSB2ZXJ0ZXggb2Ygc3VyZmFjZSBCIFxyXG4gICAgICAvLyDigKIgSWYgbW9yZSB0aGFuIG9uZSBjYW5kaWRhdGUgNSBleGlzdHMsIHNjcmFwaW5nIHVwIHRvIGZvdXIgXHJcblxyXG4gICAgICAvLyBGb3IgcG90ZW50aWFsIGNvbGxpc2lvbiBwb2ludHMgb2YgYWxsLCB0byBleGFtaW5lIHRoZSBkaXN0YW5jZSBiZXR3ZWVuIHRoZSBzdXJmYWNlIEEgXHJcbiAgICAgIC8vIOKAoiBJZiB5b3Ugd2VyZSBvbiB0aGUgaW5zaWRlIHN1cmZhY2Ugb2YgQSwgYW5kIHRoZSBjb2xsaXNpb24gcG9pbnRcclxuXHJcbiAgICAgIHZhciBiMTtcclxuICAgICAgdmFyIGIyO1xyXG4gICAgICBpZiAoc2hhcGUxLmlkIDwgc2hhcGUyLmlkKSB7XHJcbiAgICAgICAgYjEgPSAoc2hhcGUxKTtcclxuICAgICAgICBiMiA9IChzaGFwZTIpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGIxID0gKHNoYXBlMik7XHJcbiAgICAgICAgYjIgPSAoc2hhcGUxKTtcclxuICAgICAgfVxyXG4gICAgICB2YXIgVjEgPSBiMS5lbGVtZW50cztcclxuICAgICAgdmFyIFYyID0gYjIuZWxlbWVudHM7XHJcblxyXG4gICAgICB2YXIgRDEgPSBiMS5kaW1lbnRpb25zO1xyXG4gICAgICB2YXIgRDIgPSBiMi5kaW1lbnRpb25zO1xyXG5cclxuICAgICAgdmFyIHAxID0gYjEucG9zaXRpb247XHJcbiAgICAgIHZhciBwMiA9IGIyLnBvc2l0aW9uO1xyXG4gICAgICB2YXIgcDF4ID0gcDEueDtcclxuICAgICAgdmFyIHAxeSA9IHAxLnk7XHJcbiAgICAgIHZhciBwMXogPSBwMS56O1xyXG4gICAgICB2YXIgcDJ4ID0gcDIueDtcclxuICAgICAgdmFyIHAyeSA9IHAyLnk7XHJcbiAgICAgIHZhciBwMnogPSBwMi56O1xyXG4gICAgICAvLyBkaWZmXHJcbiAgICAgIHZhciBkeCA9IHAyeCAtIHAxeDtcclxuICAgICAgdmFyIGR5ID0gcDJ5IC0gcDF5O1xyXG4gICAgICB2YXIgZHogPSBwMnogLSBwMXo7XHJcbiAgICAgIC8vIGRpc3RhbmNlXHJcbiAgICAgIHZhciB3MSA9IGIxLmhhbGZXaWR0aDtcclxuICAgICAgdmFyIGgxID0gYjEuaGFsZkhlaWdodDtcclxuICAgICAgdmFyIGQxID0gYjEuaGFsZkRlcHRoO1xyXG4gICAgICB2YXIgdzIgPSBiMi5oYWxmV2lkdGg7XHJcbiAgICAgIHZhciBoMiA9IGIyLmhhbGZIZWlnaHQ7XHJcbiAgICAgIHZhciBkMiA9IGIyLmhhbGZEZXB0aDtcclxuICAgICAgLy8gZGlyZWN0aW9uXHJcblxyXG4gICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAgIC8vIDE1IHNlcGFyYXRpbmcgYXhlc1xyXG4gICAgICAvLyAxfjY6IGZhY2VcclxuICAgICAgLy8gN35mOiBlZGdlXHJcbiAgICAgIC8vIGh0dHA6Ly9tYXJ1cGVrZTI5Ni5jb20vQ09MXzNEX05vMTNfT0JCdnNPQkIuaHRtbFxyXG4gICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgICB2YXIgYTF4ID0gRDFbMF07XHJcbiAgICAgIHZhciBhMXkgPSBEMVsxXTtcclxuICAgICAgdmFyIGExeiA9IEQxWzJdO1xyXG4gICAgICB2YXIgYTJ4ID0gRDFbM107XHJcbiAgICAgIHZhciBhMnkgPSBEMVs0XTtcclxuICAgICAgdmFyIGEyeiA9IEQxWzVdO1xyXG4gICAgICB2YXIgYTN4ID0gRDFbNl07XHJcbiAgICAgIHZhciBhM3kgPSBEMVs3XTtcclxuICAgICAgdmFyIGEzeiA9IEQxWzhdO1xyXG4gICAgICB2YXIgZDF4ID0gRDFbOV07XHJcbiAgICAgIHZhciBkMXkgPSBEMVsxMF07XHJcbiAgICAgIHZhciBkMXogPSBEMVsxMV07XHJcbiAgICAgIHZhciBkMnggPSBEMVsxMl07XHJcbiAgICAgIHZhciBkMnkgPSBEMVsxM107XHJcbiAgICAgIHZhciBkMnogPSBEMVsxNF07XHJcbiAgICAgIHZhciBkM3ggPSBEMVsxNV07XHJcbiAgICAgIHZhciBkM3kgPSBEMVsxNl07XHJcbiAgICAgIHZhciBkM3ogPSBEMVsxN107XHJcblxyXG4gICAgICB2YXIgYTR4ID0gRDJbMF07XHJcbiAgICAgIHZhciBhNHkgPSBEMlsxXTtcclxuICAgICAgdmFyIGE0eiA9IEQyWzJdO1xyXG4gICAgICB2YXIgYTV4ID0gRDJbM107XHJcbiAgICAgIHZhciBhNXkgPSBEMls0XTtcclxuICAgICAgdmFyIGE1eiA9IEQyWzVdO1xyXG4gICAgICB2YXIgYTZ4ID0gRDJbNl07XHJcbiAgICAgIHZhciBhNnkgPSBEMls3XTtcclxuICAgICAgdmFyIGE2eiA9IEQyWzhdO1xyXG4gICAgICB2YXIgZDR4ID0gRDJbOV07XHJcbiAgICAgIHZhciBkNHkgPSBEMlsxMF07XHJcbiAgICAgIHZhciBkNHogPSBEMlsxMV07XHJcbiAgICAgIHZhciBkNXggPSBEMlsxMl07XHJcbiAgICAgIHZhciBkNXkgPSBEMlsxM107XHJcbiAgICAgIHZhciBkNXogPSBEMlsxNF07XHJcbiAgICAgIHZhciBkNnggPSBEMlsxNV07XHJcbiAgICAgIHZhciBkNnkgPSBEMlsxNl07XHJcbiAgICAgIHZhciBkNnogPSBEMlsxN107XHJcblxyXG4gICAgICB2YXIgYTd4ID0gYTF5ICogYTR6IC0gYTF6ICogYTR5O1xyXG4gICAgICB2YXIgYTd5ID0gYTF6ICogYTR4IC0gYTF4ICogYTR6O1xyXG4gICAgICB2YXIgYTd6ID0gYTF4ICogYTR5IC0gYTF5ICogYTR4O1xyXG4gICAgICB2YXIgYTh4ID0gYTF5ICogYTV6IC0gYTF6ICogYTV5O1xyXG4gICAgICB2YXIgYTh5ID0gYTF6ICogYTV4IC0gYTF4ICogYTV6O1xyXG4gICAgICB2YXIgYTh6ID0gYTF4ICogYTV5IC0gYTF5ICogYTV4O1xyXG4gICAgICB2YXIgYTl4ID0gYTF5ICogYTZ6IC0gYTF6ICogYTZ5O1xyXG4gICAgICB2YXIgYTl5ID0gYTF6ICogYTZ4IC0gYTF4ICogYTZ6O1xyXG4gICAgICB2YXIgYTl6ID0gYTF4ICogYTZ5IC0gYTF5ICogYTZ4O1xyXG4gICAgICB2YXIgYWF4ID0gYTJ5ICogYTR6IC0gYTJ6ICogYTR5O1xyXG4gICAgICB2YXIgYWF5ID0gYTJ6ICogYTR4IC0gYTJ4ICogYTR6O1xyXG4gICAgICB2YXIgYWF6ID0gYTJ4ICogYTR5IC0gYTJ5ICogYTR4O1xyXG4gICAgICB2YXIgYWJ4ID0gYTJ5ICogYTV6IC0gYTJ6ICogYTV5O1xyXG4gICAgICB2YXIgYWJ5ID0gYTJ6ICogYTV4IC0gYTJ4ICogYTV6O1xyXG4gICAgICB2YXIgYWJ6ID0gYTJ4ICogYTV5IC0gYTJ5ICogYTV4O1xyXG4gICAgICB2YXIgYWN4ID0gYTJ5ICogYTZ6IC0gYTJ6ICogYTZ5O1xyXG4gICAgICB2YXIgYWN5ID0gYTJ6ICogYTZ4IC0gYTJ4ICogYTZ6O1xyXG4gICAgICB2YXIgYWN6ID0gYTJ4ICogYTZ5IC0gYTJ5ICogYTZ4O1xyXG4gICAgICB2YXIgYWR4ID0gYTN5ICogYTR6IC0gYTN6ICogYTR5O1xyXG4gICAgICB2YXIgYWR5ID0gYTN6ICogYTR4IC0gYTN4ICogYTR6O1xyXG4gICAgICB2YXIgYWR6ID0gYTN4ICogYTR5IC0gYTN5ICogYTR4O1xyXG4gICAgICB2YXIgYWV4ID0gYTN5ICogYTV6IC0gYTN6ICogYTV5O1xyXG4gICAgICB2YXIgYWV5ID0gYTN6ICogYTV4IC0gYTN4ICogYTV6O1xyXG4gICAgICB2YXIgYWV6ID0gYTN4ICogYTV5IC0gYTN5ICogYTV4O1xyXG4gICAgICB2YXIgYWZ4ID0gYTN5ICogYTZ6IC0gYTN6ICogYTZ5O1xyXG4gICAgICB2YXIgYWZ5ID0gYTN6ICogYTZ4IC0gYTN4ICogYTZ6O1xyXG4gICAgICB2YXIgYWZ6ID0gYTN4ICogYTZ5IC0gYTN5ICogYTZ4O1xyXG4gICAgICAvLyByaWdodCBvciBsZWZ0IGZsYWdzXHJcbiAgICAgIHZhciByaWdodDE7XHJcbiAgICAgIHZhciByaWdodDI7XHJcbiAgICAgIHZhciByaWdodDM7XHJcbiAgICAgIHZhciByaWdodDQ7XHJcbiAgICAgIHZhciByaWdodDU7XHJcbiAgICAgIHZhciByaWdodDY7XHJcbiAgICAgIHZhciByaWdodDc7XHJcbiAgICAgIHZhciByaWdodDg7XHJcbiAgICAgIHZhciByaWdodDk7XHJcbiAgICAgIHZhciByaWdodGE7XHJcbiAgICAgIHZhciByaWdodGI7XHJcbiAgICAgIHZhciByaWdodGM7XHJcbiAgICAgIHZhciByaWdodGQ7XHJcbiAgICAgIHZhciByaWdodGU7XHJcbiAgICAgIHZhciByaWdodGY7XHJcbiAgICAgIC8vIG92ZXJsYXBwaW5nIGRpc3RhbmNlc1xyXG4gICAgICB2YXIgb3ZlcmxhcDE7XHJcbiAgICAgIHZhciBvdmVybGFwMjtcclxuICAgICAgdmFyIG92ZXJsYXAzO1xyXG4gICAgICB2YXIgb3ZlcmxhcDQ7XHJcbiAgICAgIHZhciBvdmVybGFwNTtcclxuICAgICAgdmFyIG92ZXJsYXA2O1xyXG4gICAgICB2YXIgb3ZlcmxhcDc7XHJcbiAgICAgIHZhciBvdmVybGFwODtcclxuICAgICAgdmFyIG92ZXJsYXA5O1xyXG4gICAgICB2YXIgb3ZlcmxhcGE7XHJcbiAgICAgIHZhciBvdmVybGFwYjtcclxuICAgICAgdmFyIG92ZXJsYXBjO1xyXG4gICAgICB2YXIgb3ZlcmxhcGQ7XHJcbiAgICAgIHZhciBvdmVybGFwZTtcclxuICAgICAgdmFyIG92ZXJsYXBmO1xyXG4gICAgICAvLyBpbnZhbGlkIGZsYWdzXHJcbiAgICAgIHZhciBpbnZhbGlkNyA9IGZhbHNlO1xyXG4gICAgICB2YXIgaW52YWxpZDggPSBmYWxzZTtcclxuICAgICAgdmFyIGludmFsaWQ5ID0gZmFsc2U7XHJcbiAgICAgIHZhciBpbnZhbGlkYSA9IGZhbHNlO1xyXG4gICAgICB2YXIgaW52YWxpZGIgPSBmYWxzZTtcclxuICAgICAgdmFyIGludmFsaWRjID0gZmFsc2U7XHJcbiAgICAgIHZhciBpbnZhbGlkZCA9IGZhbHNlO1xyXG4gICAgICB2YXIgaW52YWxpZGUgPSBmYWxzZTtcclxuICAgICAgdmFyIGludmFsaWRmID0gZmFsc2U7XHJcbiAgICAgIC8vIHRlbXBvcmFyeSB2YXJpYWJsZXNcclxuICAgICAgdmFyIGxlbjtcclxuICAgICAgdmFyIGxlbjE7XHJcbiAgICAgIHZhciBsZW4yO1xyXG4gICAgICB2YXIgZG90MTtcclxuICAgICAgdmFyIGRvdDI7XHJcbiAgICAgIHZhciBkb3QzO1xyXG4gICAgICAvLyB0cnkgYXhpcyAxXHJcbiAgICAgIGxlbiA9IGExeCAqIGR4ICsgYTF5ICogZHkgKyBhMXogKiBkejtcclxuICAgICAgcmlnaHQxID0gbGVuID4gMDtcclxuICAgICAgaWYgKCFyaWdodDEpIGxlbiA9IC1sZW47XHJcbiAgICAgIGxlbjEgPSB3MTtcclxuICAgICAgZG90MSA9IGExeCAqIGE0eCArIGExeSAqIGE0eSArIGExeiAqIGE0ejtcclxuICAgICAgZG90MiA9IGExeCAqIGE1eCArIGExeSAqIGE1eSArIGExeiAqIGE1ejtcclxuICAgICAgZG90MyA9IGExeCAqIGE2eCArIGExeSAqIGE2eSArIGExeiAqIGE2ejtcclxuICAgICAgaWYgKGRvdDEgPCAwKSBkb3QxID0gLWRvdDE7XHJcbiAgICAgIGlmIChkb3QyIDwgMCkgZG90MiA9IC1kb3QyO1xyXG4gICAgICBpZiAoZG90MyA8IDApIGRvdDMgPSAtZG90MztcclxuICAgICAgbGVuMiA9IGRvdDEgKiB3MiArIGRvdDIgKiBoMiArIGRvdDMgKiBkMjtcclxuICAgICAgb3ZlcmxhcDEgPSBsZW4gLSBsZW4xIC0gbGVuMjtcclxuICAgICAgaWYgKG92ZXJsYXAxID4gMCkgcmV0dXJuO1xyXG4gICAgICAvLyB0cnkgYXhpcyAyXHJcbiAgICAgIGxlbiA9IGEyeCAqIGR4ICsgYTJ5ICogZHkgKyBhMnogKiBkejtcclxuICAgICAgcmlnaHQyID0gbGVuID4gMDtcclxuICAgICAgaWYgKCFyaWdodDIpIGxlbiA9IC1sZW47XHJcbiAgICAgIGxlbjEgPSBoMTtcclxuICAgICAgZG90MSA9IGEyeCAqIGE0eCArIGEyeSAqIGE0eSArIGEyeiAqIGE0ejtcclxuICAgICAgZG90MiA9IGEyeCAqIGE1eCArIGEyeSAqIGE1eSArIGEyeiAqIGE1ejtcclxuICAgICAgZG90MyA9IGEyeCAqIGE2eCArIGEyeSAqIGE2eSArIGEyeiAqIGE2ejtcclxuICAgICAgaWYgKGRvdDEgPCAwKSBkb3QxID0gLWRvdDE7XHJcbiAgICAgIGlmIChkb3QyIDwgMCkgZG90MiA9IC1kb3QyO1xyXG4gICAgICBpZiAoZG90MyA8IDApIGRvdDMgPSAtZG90MztcclxuICAgICAgbGVuMiA9IGRvdDEgKiB3MiArIGRvdDIgKiBoMiArIGRvdDMgKiBkMjtcclxuICAgICAgb3ZlcmxhcDIgPSBsZW4gLSBsZW4xIC0gbGVuMjtcclxuICAgICAgaWYgKG92ZXJsYXAyID4gMCkgcmV0dXJuO1xyXG4gICAgICAvLyB0cnkgYXhpcyAzXHJcbiAgICAgIGxlbiA9IGEzeCAqIGR4ICsgYTN5ICogZHkgKyBhM3ogKiBkejtcclxuICAgICAgcmlnaHQzID0gbGVuID4gMDtcclxuICAgICAgaWYgKCFyaWdodDMpIGxlbiA9IC1sZW47XHJcbiAgICAgIGxlbjEgPSBkMTtcclxuICAgICAgZG90MSA9IGEzeCAqIGE0eCArIGEzeSAqIGE0eSArIGEzeiAqIGE0ejtcclxuICAgICAgZG90MiA9IGEzeCAqIGE1eCArIGEzeSAqIGE1eSArIGEzeiAqIGE1ejtcclxuICAgICAgZG90MyA9IGEzeCAqIGE2eCArIGEzeSAqIGE2eSArIGEzeiAqIGE2ejtcclxuICAgICAgaWYgKGRvdDEgPCAwKSBkb3QxID0gLWRvdDE7XHJcbiAgICAgIGlmIChkb3QyIDwgMCkgZG90MiA9IC1kb3QyO1xyXG4gICAgICBpZiAoZG90MyA8IDApIGRvdDMgPSAtZG90MztcclxuICAgICAgbGVuMiA9IGRvdDEgKiB3MiArIGRvdDIgKiBoMiArIGRvdDMgKiBkMjtcclxuICAgICAgb3ZlcmxhcDMgPSBsZW4gLSBsZW4xIC0gbGVuMjtcclxuICAgICAgaWYgKG92ZXJsYXAzID4gMCkgcmV0dXJuO1xyXG4gICAgICAvLyB0cnkgYXhpcyA0XHJcbiAgICAgIGxlbiA9IGE0eCAqIGR4ICsgYTR5ICogZHkgKyBhNHogKiBkejtcclxuICAgICAgcmlnaHQ0ID0gbGVuID4gMDtcclxuICAgICAgaWYgKCFyaWdodDQpIGxlbiA9IC1sZW47XHJcbiAgICAgIGRvdDEgPSBhNHggKiBhMXggKyBhNHkgKiBhMXkgKyBhNHogKiBhMXo7XHJcbiAgICAgIGRvdDIgPSBhNHggKiBhMnggKyBhNHkgKiBhMnkgKyBhNHogKiBhMno7XHJcbiAgICAgIGRvdDMgPSBhNHggKiBhM3ggKyBhNHkgKiBhM3kgKyBhNHogKiBhM3o7XHJcbiAgICAgIGlmIChkb3QxIDwgMCkgZG90MSA9IC1kb3QxO1xyXG4gICAgICBpZiAoZG90MiA8IDApIGRvdDIgPSAtZG90MjtcclxuICAgICAgaWYgKGRvdDMgPCAwKSBkb3QzID0gLWRvdDM7XHJcbiAgICAgIGxlbjEgPSBkb3QxICogdzEgKyBkb3QyICogaDEgKyBkb3QzICogZDE7XHJcbiAgICAgIGxlbjIgPSB3MjtcclxuICAgICAgb3ZlcmxhcDQgPSAobGVuIC0gbGVuMSAtIGxlbjIpICogMS4wO1xyXG4gICAgICBpZiAob3ZlcmxhcDQgPiAwKSByZXR1cm47XHJcbiAgICAgIC8vIHRyeSBheGlzIDVcclxuICAgICAgbGVuID0gYTV4ICogZHggKyBhNXkgKiBkeSArIGE1eiAqIGR6O1xyXG4gICAgICByaWdodDUgPSBsZW4gPiAwO1xyXG4gICAgICBpZiAoIXJpZ2h0NSkgbGVuID0gLWxlbjtcclxuICAgICAgZG90MSA9IGE1eCAqIGExeCArIGE1eSAqIGExeSArIGE1eiAqIGExejtcclxuICAgICAgZG90MiA9IGE1eCAqIGEyeCArIGE1eSAqIGEyeSArIGE1eiAqIGEyejtcclxuICAgICAgZG90MyA9IGE1eCAqIGEzeCArIGE1eSAqIGEzeSArIGE1eiAqIGEzejtcclxuICAgICAgaWYgKGRvdDEgPCAwKSBkb3QxID0gLWRvdDE7XHJcbiAgICAgIGlmIChkb3QyIDwgMCkgZG90MiA9IC1kb3QyO1xyXG4gICAgICBpZiAoZG90MyA8IDApIGRvdDMgPSAtZG90MztcclxuICAgICAgbGVuMSA9IGRvdDEgKiB3MSArIGRvdDIgKiBoMSArIGRvdDMgKiBkMTtcclxuICAgICAgbGVuMiA9IGgyO1xyXG4gICAgICBvdmVybGFwNSA9IChsZW4gLSBsZW4xIC0gbGVuMikgKiAxLjA7XHJcbiAgICAgIGlmIChvdmVybGFwNSA+IDApIHJldHVybjtcclxuICAgICAgLy8gdHJ5IGF4aXMgNlxyXG4gICAgICBsZW4gPSBhNnggKiBkeCArIGE2eSAqIGR5ICsgYTZ6ICogZHo7XHJcbiAgICAgIHJpZ2h0NiA9IGxlbiA+IDA7XHJcbiAgICAgIGlmICghcmlnaHQ2KSBsZW4gPSAtbGVuO1xyXG4gICAgICBkb3QxID0gYTZ4ICogYTF4ICsgYTZ5ICogYTF5ICsgYTZ6ICogYTF6O1xyXG4gICAgICBkb3QyID0gYTZ4ICogYTJ4ICsgYTZ5ICogYTJ5ICsgYTZ6ICogYTJ6O1xyXG4gICAgICBkb3QzID0gYTZ4ICogYTN4ICsgYTZ5ICogYTN5ICsgYTZ6ICogYTN6O1xyXG4gICAgICBpZiAoZG90MSA8IDApIGRvdDEgPSAtZG90MTtcclxuICAgICAgaWYgKGRvdDIgPCAwKSBkb3QyID0gLWRvdDI7XHJcbiAgICAgIGlmIChkb3QzIDwgMCkgZG90MyA9IC1kb3QzO1xyXG4gICAgICBsZW4xID0gZG90MSAqIHcxICsgZG90MiAqIGgxICsgZG90MyAqIGQxO1xyXG4gICAgICBsZW4yID0gZDI7XHJcbiAgICAgIG92ZXJsYXA2ID0gKGxlbiAtIGxlbjEgLSBsZW4yKSAqIDEuMDtcclxuICAgICAgaWYgKG92ZXJsYXA2ID4gMCkgcmV0dXJuO1xyXG4gICAgICAvLyB0cnkgYXhpcyA3XHJcbiAgICAgIGxlbiA9IGE3eCAqIGE3eCArIGE3eSAqIGE3eSArIGE3eiAqIGE3ejtcclxuICAgICAgaWYgKGxlbiA+IDFlLTUpIHtcclxuICAgICAgICBsZW4gPSAxIC8gX01hdGguc3FydChsZW4pO1xyXG4gICAgICAgIGE3eCAqPSBsZW47XHJcbiAgICAgICAgYTd5ICo9IGxlbjtcclxuICAgICAgICBhN3ogKj0gbGVuO1xyXG4gICAgICAgIGxlbiA9IGE3eCAqIGR4ICsgYTd5ICogZHkgKyBhN3ogKiBkejtcclxuICAgICAgICByaWdodDcgPSBsZW4gPiAwO1xyXG4gICAgICAgIGlmICghcmlnaHQ3KSBsZW4gPSAtbGVuO1xyXG4gICAgICAgIGRvdDEgPSBhN3ggKiBhMnggKyBhN3kgKiBhMnkgKyBhN3ogKiBhMno7XHJcbiAgICAgICAgZG90MiA9IGE3eCAqIGEzeCArIGE3eSAqIGEzeSArIGE3eiAqIGEzejtcclxuICAgICAgICBpZiAoZG90MSA8IDApIGRvdDEgPSAtZG90MTtcclxuICAgICAgICBpZiAoZG90MiA8IDApIGRvdDIgPSAtZG90MjtcclxuICAgICAgICBsZW4xID0gZG90MSAqIGgxICsgZG90MiAqIGQxO1xyXG4gICAgICAgIGRvdDEgPSBhN3ggKiBhNXggKyBhN3kgKiBhNXkgKyBhN3ogKiBhNXo7XHJcbiAgICAgICAgZG90MiA9IGE3eCAqIGE2eCArIGE3eSAqIGE2eSArIGE3eiAqIGE2ejtcclxuICAgICAgICBpZiAoZG90MSA8IDApIGRvdDEgPSAtZG90MTtcclxuICAgICAgICBpZiAoZG90MiA8IDApIGRvdDIgPSAtZG90MjtcclxuICAgICAgICBsZW4yID0gZG90MSAqIGgyICsgZG90MiAqIGQyO1xyXG4gICAgICAgIG92ZXJsYXA3ID0gbGVuIC0gbGVuMSAtIGxlbjI7XHJcbiAgICAgICAgaWYgKG92ZXJsYXA3ID4gMCkgcmV0dXJuO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJpZ2h0NyA9IGZhbHNlO1xyXG4gICAgICAgIG92ZXJsYXA3ID0gMDtcclxuICAgICAgICBpbnZhbGlkNyA9IHRydWU7XHJcbiAgICAgIH1cclxuICAgICAgLy8gdHJ5IGF4aXMgOFxyXG4gICAgICBsZW4gPSBhOHggKiBhOHggKyBhOHkgKiBhOHkgKyBhOHogKiBhOHo7XHJcbiAgICAgIGlmIChsZW4gPiAxZS01KSB7XHJcbiAgICAgICAgbGVuID0gMSAvIF9NYXRoLnNxcnQobGVuKTtcclxuICAgICAgICBhOHggKj0gbGVuO1xyXG4gICAgICAgIGE4eSAqPSBsZW47XHJcbiAgICAgICAgYTh6ICo9IGxlbjtcclxuICAgICAgICBsZW4gPSBhOHggKiBkeCArIGE4eSAqIGR5ICsgYTh6ICogZHo7XHJcbiAgICAgICAgcmlnaHQ4ID0gbGVuID4gMDtcclxuICAgICAgICBpZiAoIXJpZ2h0OCkgbGVuID0gLWxlbjtcclxuICAgICAgICBkb3QxID0gYTh4ICogYTJ4ICsgYTh5ICogYTJ5ICsgYTh6ICogYTJ6O1xyXG4gICAgICAgIGRvdDIgPSBhOHggKiBhM3ggKyBhOHkgKiBhM3kgKyBhOHogKiBhM3o7XHJcbiAgICAgICAgaWYgKGRvdDEgPCAwKSBkb3QxID0gLWRvdDE7XHJcbiAgICAgICAgaWYgKGRvdDIgPCAwKSBkb3QyID0gLWRvdDI7XHJcbiAgICAgICAgbGVuMSA9IGRvdDEgKiBoMSArIGRvdDIgKiBkMTtcclxuICAgICAgICBkb3QxID0gYTh4ICogYTR4ICsgYTh5ICogYTR5ICsgYTh6ICogYTR6O1xyXG4gICAgICAgIGRvdDIgPSBhOHggKiBhNnggKyBhOHkgKiBhNnkgKyBhOHogKiBhNno7XHJcbiAgICAgICAgaWYgKGRvdDEgPCAwKSBkb3QxID0gLWRvdDE7XHJcbiAgICAgICAgaWYgKGRvdDIgPCAwKSBkb3QyID0gLWRvdDI7XHJcbiAgICAgICAgbGVuMiA9IGRvdDEgKiB3MiArIGRvdDIgKiBkMjtcclxuICAgICAgICBvdmVybGFwOCA9IGxlbiAtIGxlbjEgLSBsZW4yO1xyXG4gICAgICAgIGlmIChvdmVybGFwOCA+IDApIHJldHVybjtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICByaWdodDggPSBmYWxzZTtcclxuICAgICAgICBvdmVybGFwOCA9IDA7XHJcbiAgICAgICAgaW52YWxpZDggPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICAgIC8vIHRyeSBheGlzIDlcclxuICAgICAgbGVuID0gYTl4ICogYTl4ICsgYTl5ICogYTl5ICsgYTl6ICogYTl6O1xyXG4gICAgICBpZiAobGVuID4gMWUtNSkge1xyXG4gICAgICAgIGxlbiA9IDEgLyBfTWF0aC5zcXJ0KGxlbik7XHJcbiAgICAgICAgYTl4ICo9IGxlbjtcclxuICAgICAgICBhOXkgKj0gbGVuO1xyXG4gICAgICAgIGE5eiAqPSBsZW47XHJcbiAgICAgICAgbGVuID0gYTl4ICogZHggKyBhOXkgKiBkeSArIGE5eiAqIGR6O1xyXG4gICAgICAgIHJpZ2h0OSA9IGxlbiA+IDA7XHJcbiAgICAgICAgaWYgKCFyaWdodDkpIGxlbiA9IC1sZW47XHJcbiAgICAgICAgZG90MSA9IGE5eCAqIGEyeCArIGE5eSAqIGEyeSArIGE5eiAqIGEyejtcclxuICAgICAgICBkb3QyID0gYTl4ICogYTN4ICsgYTl5ICogYTN5ICsgYTl6ICogYTN6O1xyXG4gICAgICAgIGlmIChkb3QxIDwgMCkgZG90MSA9IC1kb3QxO1xyXG4gICAgICAgIGlmIChkb3QyIDwgMCkgZG90MiA9IC1kb3QyO1xyXG4gICAgICAgIGxlbjEgPSBkb3QxICogaDEgKyBkb3QyICogZDE7XHJcbiAgICAgICAgZG90MSA9IGE5eCAqIGE0eCArIGE5eSAqIGE0eSArIGE5eiAqIGE0ejtcclxuICAgICAgICBkb3QyID0gYTl4ICogYTV4ICsgYTl5ICogYTV5ICsgYTl6ICogYTV6O1xyXG4gICAgICAgIGlmIChkb3QxIDwgMCkgZG90MSA9IC1kb3QxO1xyXG4gICAgICAgIGlmIChkb3QyIDwgMCkgZG90MiA9IC1kb3QyO1xyXG4gICAgICAgIGxlbjIgPSBkb3QxICogdzIgKyBkb3QyICogaDI7XHJcbiAgICAgICAgb3ZlcmxhcDkgPSBsZW4gLSBsZW4xIC0gbGVuMjtcclxuICAgICAgICBpZiAob3ZlcmxhcDkgPiAwKSByZXR1cm47XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmlnaHQ5ID0gZmFsc2U7XHJcbiAgICAgICAgb3ZlcmxhcDkgPSAwO1xyXG4gICAgICAgIGludmFsaWQ5ID0gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgICAvLyB0cnkgYXhpcyAxMFxyXG4gICAgICBsZW4gPSBhYXggKiBhYXggKyBhYXkgKiBhYXkgKyBhYXogKiBhYXo7XHJcbiAgICAgIGlmIChsZW4gPiAxZS01KSB7XHJcbiAgICAgICAgbGVuID0gMSAvIF9NYXRoLnNxcnQobGVuKTtcclxuICAgICAgICBhYXggKj0gbGVuO1xyXG4gICAgICAgIGFheSAqPSBsZW47XHJcbiAgICAgICAgYWF6ICo9IGxlbjtcclxuICAgICAgICBsZW4gPSBhYXggKiBkeCArIGFheSAqIGR5ICsgYWF6ICogZHo7XHJcbiAgICAgICAgcmlnaHRhID0gbGVuID4gMDtcclxuICAgICAgICBpZiAoIXJpZ2h0YSkgbGVuID0gLWxlbjtcclxuICAgICAgICBkb3QxID0gYWF4ICogYTF4ICsgYWF5ICogYTF5ICsgYWF6ICogYTF6O1xyXG4gICAgICAgIGRvdDIgPSBhYXggKiBhM3ggKyBhYXkgKiBhM3kgKyBhYXogKiBhM3o7XHJcbiAgICAgICAgaWYgKGRvdDEgPCAwKSBkb3QxID0gLWRvdDE7XHJcbiAgICAgICAgaWYgKGRvdDIgPCAwKSBkb3QyID0gLWRvdDI7XHJcbiAgICAgICAgbGVuMSA9IGRvdDEgKiB3MSArIGRvdDIgKiBkMTtcclxuICAgICAgICBkb3QxID0gYWF4ICogYTV4ICsgYWF5ICogYTV5ICsgYWF6ICogYTV6O1xyXG4gICAgICAgIGRvdDIgPSBhYXggKiBhNnggKyBhYXkgKiBhNnkgKyBhYXogKiBhNno7XHJcbiAgICAgICAgaWYgKGRvdDEgPCAwKSBkb3QxID0gLWRvdDE7XHJcbiAgICAgICAgaWYgKGRvdDIgPCAwKSBkb3QyID0gLWRvdDI7XHJcbiAgICAgICAgbGVuMiA9IGRvdDEgKiBoMiArIGRvdDIgKiBkMjtcclxuICAgICAgICBvdmVybGFwYSA9IGxlbiAtIGxlbjEgLSBsZW4yO1xyXG4gICAgICAgIGlmIChvdmVybGFwYSA+IDApIHJldHVybjtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICByaWdodGEgPSBmYWxzZTtcclxuICAgICAgICBvdmVybGFwYSA9IDA7XHJcbiAgICAgICAgaW52YWxpZGEgPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICAgIC8vIHRyeSBheGlzIDExXHJcbiAgICAgIGxlbiA9IGFieCAqIGFieCArIGFieSAqIGFieSArIGFieiAqIGFiejtcclxuICAgICAgaWYgKGxlbiA+IDFlLTUpIHtcclxuICAgICAgICBsZW4gPSAxIC8gX01hdGguc3FydChsZW4pO1xyXG4gICAgICAgIGFieCAqPSBsZW47XHJcbiAgICAgICAgYWJ5ICo9IGxlbjtcclxuICAgICAgICBhYnogKj0gbGVuO1xyXG4gICAgICAgIGxlbiA9IGFieCAqIGR4ICsgYWJ5ICogZHkgKyBhYnogKiBkejtcclxuICAgICAgICByaWdodGIgPSBsZW4gPiAwO1xyXG4gICAgICAgIGlmICghcmlnaHRiKSBsZW4gPSAtbGVuO1xyXG4gICAgICAgIGRvdDEgPSBhYnggKiBhMXggKyBhYnkgKiBhMXkgKyBhYnogKiBhMXo7XHJcbiAgICAgICAgZG90MiA9IGFieCAqIGEzeCArIGFieSAqIGEzeSArIGFieiAqIGEzejtcclxuICAgICAgICBpZiAoZG90MSA8IDApIGRvdDEgPSAtZG90MTtcclxuICAgICAgICBpZiAoZG90MiA8IDApIGRvdDIgPSAtZG90MjtcclxuICAgICAgICBsZW4xID0gZG90MSAqIHcxICsgZG90MiAqIGQxO1xyXG4gICAgICAgIGRvdDEgPSBhYnggKiBhNHggKyBhYnkgKiBhNHkgKyBhYnogKiBhNHo7XHJcbiAgICAgICAgZG90MiA9IGFieCAqIGE2eCArIGFieSAqIGE2eSArIGFieiAqIGE2ejtcclxuICAgICAgICBpZiAoZG90MSA8IDApIGRvdDEgPSAtZG90MTtcclxuICAgICAgICBpZiAoZG90MiA8IDApIGRvdDIgPSAtZG90MjtcclxuICAgICAgICBsZW4yID0gZG90MSAqIHcyICsgZG90MiAqIGQyO1xyXG4gICAgICAgIG92ZXJsYXBiID0gbGVuIC0gbGVuMSAtIGxlbjI7XHJcbiAgICAgICAgaWYgKG92ZXJsYXBiID4gMCkgcmV0dXJuO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJpZ2h0YiA9IGZhbHNlO1xyXG4gICAgICAgIG92ZXJsYXBiID0gMDtcclxuICAgICAgICBpbnZhbGlkYiA9IHRydWU7XHJcbiAgICAgIH1cclxuICAgICAgLy8gdHJ5IGF4aXMgMTJcclxuICAgICAgbGVuID0gYWN4ICogYWN4ICsgYWN5ICogYWN5ICsgYWN6ICogYWN6O1xyXG4gICAgICBpZiAobGVuID4gMWUtNSkge1xyXG4gICAgICAgIGxlbiA9IDEgLyBfTWF0aC5zcXJ0KGxlbik7XHJcbiAgICAgICAgYWN4ICo9IGxlbjtcclxuICAgICAgICBhY3kgKj0gbGVuO1xyXG4gICAgICAgIGFjeiAqPSBsZW47XHJcbiAgICAgICAgbGVuID0gYWN4ICogZHggKyBhY3kgKiBkeSArIGFjeiAqIGR6O1xyXG4gICAgICAgIHJpZ2h0YyA9IGxlbiA+IDA7XHJcbiAgICAgICAgaWYgKCFyaWdodGMpIGxlbiA9IC1sZW47XHJcbiAgICAgICAgZG90MSA9IGFjeCAqIGExeCArIGFjeSAqIGExeSArIGFjeiAqIGExejtcclxuICAgICAgICBkb3QyID0gYWN4ICogYTN4ICsgYWN5ICogYTN5ICsgYWN6ICogYTN6O1xyXG4gICAgICAgIGlmIChkb3QxIDwgMCkgZG90MSA9IC1kb3QxO1xyXG4gICAgICAgIGlmIChkb3QyIDwgMCkgZG90MiA9IC1kb3QyO1xyXG4gICAgICAgIGxlbjEgPSBkb3QxICogdzEgKyBkb3QyICogZDE7XHJcbiAgICAgICAgZG90MSA9IGFjeCAqIGE0eCArIGFjeSAqIGE0eSArIGFjeiAqIGE0ejtcclxuICAgICAgICBkb3QyID0gYWN4ICogYTV4ICsgYWN5ICogYTV5ICsgYWN6ICogYTV6O1xyXG4gICAgICAgIGlmIChkb3QxIDwgMCkgZG90MSA9IC1kb3QxO1xyXG4gICAgICAgIGlmIChkb3QyIDwgMCkgZG90MiA9IC1kb3QyO1xyXG4gICAgICAgIGxlbjIgPSBkb3QxICogdzIgKyBkb3QyICogaDI7XHJcbiAgICAgICAgb3ZlcmxhcGMgPSBsZW4gLSBsZW4xIC0gbGVuMjtcclxuICAgICAgICBpZiAob3ZlcmxhcGMgPiAwKSByZXR1cm47XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmlnaHRjID0gZmFsc2U7XHJcbiAgICAgICAgb3ZlcmxhcGMgPSAwO1xyXG4gICAgICAgIGludmFsaWRjID0gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgICAvLyB0cnkgYXhpcyAxM1xyXG4gICAgICBsZW4gPSBhZHggKiBhZHggKyBhZHkgKiBhZHkgKyBhZHogKiBhZHo7XHJcbiAgICAgIGlmIChsZW4gPiAxZS01KSB7XHJcbiAgICAgICAgbGVuID0gMSAvIF9NYXRoLnNxcnQobGVuKTtcclxuICAgICAgICBhZHggKj0gbGVuO1xyXG4gICAgICAgIGFkeSAqPSBsZW47XHJcbiAgICAgICAgYWR6ICo9IGxlbjtcclxuICAgICAgICBsZW4gPSBhZHggKiBkeCArIGFkeSAqIGR5ICsgYWR6ICogZHo7XHJcbiAgICAgICAgcmlnaHRkID0gbGVuID4gMDtcclxuICAgICAgICBpZiAoIXJpZ2h0ZCkgbGVuID0gLWxlbjtcclxuICAgICAgICBkb3QxID0gYWR4ICogYTF4ICsgYWR5ICogYTF5ICsgYWR6ICogYTF6O1xyXG4gICAgICAgIGRvdDIgPSBhZHggKiBhMnggKyBhZHkgKiBhMnkgKyBhZHogKiBhMno7XHJcbiAgICAgICAgaWYgKGRvdDEgPCAwKSBkb3QxID0gLWRvdDE7XHJcbiAgICAgICAgaWYgKGRvdDIgPCAwKSBkb3QyID0gLWRvdDI7XHJcbiAgICAgICAgbGVuMSA9IGRvdDEgKiB3MSArIGRvdDIgKiBoMTtcclxuICAgICAgICBkb3QxID0gYWR4ICogYTV4ICsgYWR5ICogYTV5ICsgYWR6ICogYTV6O1xyXG4gICAgICAgIGRvdDIgPSBhZHggKiBhNnggKyBhZHkgKiBhNnkgKyBhZHogKiBhNno7XHJcbiAgICAgICAgaWYgKGRvdDEgPCAwKSBkb3QxID0gLWRvdDE7XHJcbiAgICAgICAgaWYgKGRvdDIgPCAwKSBkb3QyID0gLWRvdDI7XHJcbiAgICAgICAgbGVuMiA9IGRvdDEgKiBoMiArIGRvdDIgKiBkMjtcclxuICAgICAgICBvdmVybGFwZCA9IGxlbiAtIGxlbjEgLSBsZW4yO1xyXG4gICAgICAgIGlmIChvdmVybGFwZCA+IDApIHJldHVybjtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICByaWdodGQgPSBmYWxzZTtcclxuICAgICAgICBvdmVybGFwZCA9IDA7XHJcbiAgICAgICAgaW52YWxpZGQgPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICAgIC8vIHRyeSBheGlzIDE0XHJcbiAgICAgIGxlbiA9IGFleCAqIGFleCArIGFleSAqIGFleSArIGFleiAqIGFlejtcclxuICAgICAgaWYgKGxlbiA+IDFlLTUpIHtcclxuICAgICAgICBsZW4gPSAxIC8gX01hdGguc3FydChsZW4pO1xyXG4gICAgICAgIGFleCAqPSBsZW47XHJcbiAgICAgICAgYWV5ICo9IGxlbjtcclxuICAgICAgICBhZXogKj0gbGVuO1xyXG4gICAgICAgIGxlbiA9IGFleCAqIGR4ICsgYWV5ICogZHkgKyBhZXogKiBkejtcclxuICAgICAgICByaWdodGUgPSBsZW4gPiAwO1xyXG4gICAgICAgIGlmICghcmlnaHRlKSBsZW4gPSAtbGVuO1xyXG4gICAgICAgIGRvdDEgPSBhZXggKiBhMXggKyBhZXkgKiBhMXkgKyBhZXogKiBhMXo7XHJcbiAgICAgICAgZG90MiA9IGFleCAqIGEyeCArIGFleSAqIGEyeSArIGFleiAqIGEyejtcclxuICAgICAgICBpZiAoZG90MSA8IDApIGRvdDEgPSAtZG90MTtcclxuICAgICAgICBpZiAoZG90MiA8IDApIGRvdDIgPSAtZG90MjtcclxuICAgICAgICBsZW4xID0gZG90MSAqIHcxICsgZG90MiAqIGgxO1xyXG4gICAgICAgIGRvdDEgPSBhZXggKiBhNHggKyBhZXkgKiBhNHkgKyBhZXogKiBhNHo7XHJcbiAgICAgICAgZG90MiA9IGFleCAqIGE2eCArIGFleSAqIGE2eSArIGFleiAqIGE2ejtcclxuICAgICAgICBpZiAoZG90MSA8IDApIGRvdDEgPSAtZG90MTtcclxuICAgICAgICBpZiAoZG90MiA8IDApIGRvdDIgPSAtZG90MjtcclxuICAgICAgICBsZW4yID0gZG90MSAqIHcyICsgZG90MiAqIGQyO1xyXG4gICAgICAgIG92ZXJsYXBlID0gbGVuIC0gbGVuMSAtIGxlbjI7XHJcbiAgICAgICAgaWYgKG92ZXJsYXBlID4gMCkgcmV0dXJuO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJpZ2h0ZSA9IGZhbHNlO1xyXG4gICAgICAgIG92ZXJsYXBlID0gMDtcclxuICAgICAgICBpbnZhbGlkZSA9IHRydWU7XHJcbiAgICAgIH1cclxuICAgICAgLy8gdHJ5IGF4aXMgMTVcclxuICAgICAgbGVuID0gYWZ4ICogYWZ4ICsgYWZ5ICogYWZ5ICsgYWZ6ICogYWZ6O1xyXG4gICAgICBpZiAobGVuID4gMWUtNSkge1xyXG4gICAgICAgIGxlbiA9IDEgLyBfTWF0aC5zcXJ0KGxlbik7XHJcbiAgICAgICAgYWZ4ICo9IGxlbjtcclxuICAgICAgICBhZnkgKj0gbGVuO1xyXG4gICAgICAgIGFmeiAqPSBsZW47XHJcbiAgICAgICAgbGVuID0gYWZ4ICogZHggKyBhZnkgKiBkeSArIGFmeiAqIGR6O1xyXG4gICAgICAgIHJpZ2h0ZiA9IGxlbiA+IDA7XHJcbiAgICAgICAgaWYgKCFyaWdodGYpIGxlbiA9IC1sZW47XHJcbiAgICAgICAgZG90MSA9IGFmeCAqIGExeCArIGFmeSAqIGExeSArIGFmeiAqIGExejtcclxuICAgICAgICBkb3QyID0gYWZ4ICogYTJ4ICsgYWZ5ICogYTJ5ICsgYWZ6ICogYTJ6O1xyXG4gICAgICAgIGlmIChkb3QxIDwgMCkgZG90MSA9IC1kb3QxO1xyXG4gICAgICAgIGlmIChkb3QyIDwgMCkgZG90MiA9IC1kb3QyO1xyXG4gICAgICAgIGxlbjEgPSBkb3QxICogdzEgKyBkb3QyICogaDE7XHJcbiAgICAgICAgZG90MSA9IGFmeCAqIGE0eCArIGFmeSAqIGE0eSArIGFmeiAqIGE0ejtcclxuICAgICAgICBkb3QyID0gYWZ4ICogYTV4ICsgYWZ5ICogYTV5ICsgYWZ6ICogYTV6O1xyXG4gICAgICAgIGlmIChkb3QxIDwgMCkgZG90MSA9IC1kb3QxO1xyXG4gICAgICAgIGlmIChkb3QyIDwgMCkgZG90MiA9IC1kb3QyO1xyXG4gICAgICAgIGxlbjIgPSBkb3QxICogdzIgKyBkb3QyICogaDI7XHJcbiAgICAgICAgb3ZlcmxhcGYgPSBsZW4gLSBsZW4xIC0gbGVuMjtcclxuICAgICAgICBpZiAob3ZlcmxhcGYgPiAwKSByZXR1cm47XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmlnaHRmID0gZmFsc2U7XHJcbiAgICAgICAgb3ZlcmxhcGYgPSAwO1xyXG4gICAgICAgIGludmFsaWRmID0gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgICAvLyBib3hlcyBhcmUgb3ZlcmxhcHBpbmdcclxuICAgICAgdmFyIGRlcHRoID0gb3ZlcmxhcDE7XHJcbiAgICAgIHZhciBkZXB0aDIgPSBvdmVybGFwMTtcclxuICAgICAgdmFyIG1pbkluZGV4ID0gMDtcclxuICAgICAgdmFyIHJpZ2h0ID0gcmlnaHQxO1xyXG4gICAgICBpZiAob3ZlcmxhcDIgPiBkZXB0aDIpIHtcclxuICAgICAgICBkZXB0aCA9IG92ZXJsYXAyO1xyXG4gICAgICAgIGRlcHRoMiA9IG92ZXJsYXAyO1xyXG4gICAgICAgIG1pbkluZGV4ID0gMTtcclxuICAgICAgICByaWdodCA9IHJpZ2h0MjtcclxuICAgICAgfVxyXG4gICAgICBpZiAob3ZlcmxhcDMgPiBkZXB0aDIpIHtcclxuICAgICAgICBkZXB0aCA9IG92ZXJsYXAzO1xyXG4gICAgICAgIGRlcHRoMiA9IG92ZXJsYXAzO1xyXG4gICAgICAgIG1pbkluZGV4ID0gMjtcclxuICAgICAgICByaWdodCA9IHJpZ2h0MztcclxuICAgICAgfVxyXG4gICAgICBpZiAob3ZlcmxhcDQgPiBkZXB0aDIpIHtcclxuICAgICAgICBkZXB0aCA9IG92ZXJsYXA0O1xyXG4gICAgICAgIGRlcHRoMiA9IG92ZXJsYXA0O1xyXG4gICAgICAgIG1pbkluZGV4ID0gMztcclxuICAgICAgICByaWdodCA9IHJpZ2h0NDtcclxuICAgICAgfVxyXG4gICAgICBpZiAob3ZlcmxhcDUgPiBkZXB0aDIpIHtcclxuICAgICAgICBkZXB0aCA9IG92ZXJsYXA1O1xyXG4gICAgICAgIGRlcHRoMiA9IG92ZXJsYXA1O1xyXG4gICAgICAgIG1pbkluZGV4ID0gNDtcclxuICAgICAgICByaWdodCA9IHJpZ2h0NTtcclxuICAgICAgfVxyXG4gICAgICBpZiAob3ZlcmxhcDYgPiBkZXB0aDIpIHtcclxuICAgICAgICBkZXB0aCA9IG92ZXJsYXA2O1xyXG4gICAgICAgIGRlcHRoMiA9IG92ZXJsYXA2O1xyXG4gICAgICAgIG1pbkluZGV4ID0gNTtcclxuICAgICAgICByaWdodCA9IHJpZ2h0NjtcclxuICAgICAgfVxyXG4gICAgICBpZiAob3ZlcmxhcDcgLSAwLjAxID4gZGVwdGgyICYmICFpbnZhbGlkNykge1xyXG4gICAgICAgIGRlcHRoID0gb3ZlcmxhcDc7XHJcbiAgICAgICAgZGVwdGgyID0gb3ZlcmxhcDcgLSAwLjAxO1xyXG4gICAgICAgIG1pbkluZGV4ID0gNjtcclxuICAgICAgICByaWdodCA9IHJpZ2h0NztcclxuICAgICAgfVxyXG4gICAgICBpZiAob3ZlcmxhcDggLSAwLjAxID4gZGVwdGgyICYmICFpbnZhbGlkOCkge1xyXG4gICAgICAgIGRlcHRoID0gb3ZlcmxhcDg7XHJcbiAgICAgICAgZGVwdGgyID0gb3ZlcmxhcDggLSAwLjAxO1xyXG4gICAgICAgIG1pbkluZGV4ID0gNztcclxuICAgICAgICByaWdodCA9IHJpZ2h0ODtcclxuICAgICAgfVxyXG4gICAgICBpZiAob3ZlcmxhcDkgLSAwLjAxID4gZGVwdGgyICYmICFpbnZhbGlkOSkge1xyXG4gICAgICAgIGRlcHRoID0gb3ZlcmxhcDk7XHJcbiAgICAgICAgZGVwdGgyID0gb3ZlcmxhcDkgLSAwLjAxO1xyXG4gICAgICAgIG1pbkluZGV4ID0gODtcclxuICAgICAgICByaWdodCA9IHJpZ2h0OTtcclxuICAgICAgfVxyXG4gICAgICBpZiAob3ZlcmxhcGEgLSAwLjAxID4gZGVwdGgyICYmICFpbnZhbGlkYSkge1xyXG4gICAgICAgIGRlcHRoID0gb3ZlcmxhcGE7XHJcbiAgICAgICAgZGVwdGgyID0gb3ZlcmxhcGEgLSAwLjAxO1xyXG4gICAgICAgIG1pbkluZGV4ID0gOTtcclxuICAgICAgICByaWdodCA9IHJpZ2h0YTtcclxuICAgICAgfVxyXG4gICAgICBpZiAob3ZlcmxhcGIgLSAwLjAxID4gZGVwdGgyICYmICFpbnZhbGlkYikge1xyXG4gICAgICAgIGRlcHRoID0gb3ZlcmxhcGI7XHJcbiAgICAgICAgZGVwdGgyID0gb3ZlcmxhcGIgLSAwLjAxO1xyXG4gICAgICAgIG1pbkluZGV4ID0gMTA7XHJcbiAgICAgICAgcmlnaHQgPSByaWdodGI7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKG92ZXJsYXBjIC0gMC4wMSA+IGRlcHRoMiAmJiAhaW52YWxpZGMpIHtcclxuICAgICAgICBkZXB0aCA9IG92ZXJsYXBjO1xyXG4gICAgICAgIGRlcHRoMiA9IG92ZXJsYXBjIC0gMC4wMTtcclxuICAgICAgICBtaW5JbmRleCA9IDExO1xyXG4gICAgICAgIHJpZ2h0ID0gcmlnaHRjO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChvdmVybGFwZCAtIDAuMDEgPiBkZXB0aDIgJiYgIWludmFsaWRkKSB7XHJcbiAgICAgICAgZGVwdGggPSBvdmVybGFwZDtcclxuICAgICAgICBkZXB0aDIgPSBvdmVybGFwZCAtIDAuMDE7XHJcbiAgICAgICAgbWluSW5kZXggPSAxMjtcclxuICAgICAgICByaWdodCA9IHJpZ2h0ZDtcclxuICAgICAgfVxyXG4gICAgICBpZiAob3ZlcmxhcGUgLSAwLjAxID4gZGVwdGgyICYmICFpbnZhbGlkZSkge1xyXG4gICAgICAgIGRlcHRoID0gb3ZlcmxhcGU7XHJcbiAgICAgICAgZGVwdGgyID0gb3ZlcmxhcGUgLSAwLjAxO1xyXG4gICAgICAgIG1pbkluZGV4ID0gMTM7XHJcbiAgICAgICAgcmlnaHQgPSByaWdodGU7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKG92ZXJsYXBmIC0gMC4wMSA+IGRlcHRoMiAmJiAhaW52YWxpZGYpIHtcclxuICAgICAgICBkZXB0aCA9IG92ZXJsYXBmO1xyXG4gICAgICAgIG1pbkluZGV4ID0gMTQ7XHJcbiAgICAgICAgcmlnaHQgPSByaWdodGY7XHJcbiAgICAgIH1cclxuICAgICAgLy8gbm9ybWFsXHJcbiAgICAgIHZhciBueCA9IDA7XHJcbiAgICAgIHZhciBueSA9IDA7XHJcbiAgICAgIHZhciBueiA9IDA7XHJcbiAgICAgIC8vIGVkZ2UgbGluZSBvciBmYWNlIHNpZGUgbm9ybWFsXHJcbiAgICAgIHZhciBuMXggPSAwO1xyXG4gICAgICB2YXIgbjF5ID0gMDtcclxuICAgICAgdmFyIG4xeiA9IDA7XHJcbiAgICAgIHZhciBuMnggPSAwO1xyXG4gICAgICB2YXIgbjJ5ID0gMDtcclxuICAgICAgdmFyIG4yeiA9IDA7XHJcbiAgICAgIC8vIGNlbnRlciBvZiBjdXJyZW50IGZhY2VcclxuICAgICAgdmFyIGN4ID0gMDtcclxuICAgICAgdmFyIGN5ID0gMDtcclxuICAgICAgdmFyIGN6ID0gMDtcclxuICAgICAgLy8gZmFjZSBzaWRlXHJcbiAgICAgIHZhciBzMXggPSAwO1xyXG4gICAgICB2YXIgczF5ID0gMDtcclxuICAgICAgdmFyIHMxeiA9IDA7XHJcbiAgICAgIHZhciBzMnggPSAwO1xyXG4gICAgICB2YXIgczJ5ID0gMDtcclxuICAgICAgdmFyIHMyeiA9IDA7XHJcbiAgICAgIC8vIHN3YXAgYjEgYjJcclxuICAgICAgdmFyIHN3YXAgPSBmYWxzZTtcclxuXHJcbiAgICAgIC8vX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fXHJcblxyXG4gICAgICBpZiAobWluSW5kZXggPT0gMCkgey8vIGIxLnggKiBiMlxyXG4gICAgICAgIGlmIChyaWdodCkge1xyXG4gICAgICAgICAgY3ggPSBwMXggKyBkMXg7IGN5ID0gcDF5ICsgZDF5OyBjeiA9IHAxeiArIGQxejtcclxuICAgICAgICAgIG54ID0gYTF4OyBueSA9IGExeTsgbnogPSBhMXo7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGN4ID0gcDF4IC0gZDF4OyBjeSA9IHAxeSAtIGQxeTsgY3ogPSBwMXogLSBkMXo7XHJcbiAgICAgICAgICBueCA9IC1hMXg7IG55ID0gLWExeTsgbnogPSAtYTF6O1xyXG4gICAgICAgIH1cclxuICAgICAgICBzMXggPSBkMng7IHMxeSA9IGQyeTsgczF6ID0gZDJ6O1xyXG4gICAgICAgIG4xeCA9IC1hMng7IG4xeSA9IC1hMnk7IG4xeiA9IC1hMno7XHJcbiAgICAgICAgczJ4ID0gZDN4OyBzMnkgPSBkM3k7IHMyeiA9IGQzejtcclxuICAgICAgICBuMnggPSAtYTN4OyBuMnkgPSAtYTN5OyBuMnogPSAtYTN6O1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKG1pbkluZGV4ID09IDEpIHsvLyBiMS55ICogYjJcclxuICAgICAgICBpZiAocmlnaHQpIHtcclxuICAgICAgICAgIGN4ID0gcDF4ICsgZDJ4OyBjeSA9IHAxeSArIGQyeTsgY3ogPSBwMXogKyBkMno7XHJcbiAgICAgICAgICBueCA9IGEyeDsgbnkgPSBhMnk7IG56ID0gYTJ6O1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBjeCA9IHAxeCAtIGQyeDsgY3kgPSBwMXkgLSBkMnk7IGN6ID0gcDF6IC0gZDJ6O1xyXG4gICAgICAgICAgbnggPSAtYTJ4OyBueSA9IC1hMnk7IG56ID0gLWEyejtcclxuICAgICAgICB9XHJcbiAgICAgICAgczF4ID0gZDF4OyBzMXkgPSBkMXk7IHMxeiA9IGQxejtcclxuICAgICAgICBuMXggPSAtYTF4OyBuMXkgPSAtYTF5OyBuMXogPSAtYTF6O1xyXG4gICAgICAgIHMyeCA9IGQzeDsgczJ5ID0gZDN5OyBzMnogPSBkM3o7XHJcbiAgICAgICAgbjJ4ID0gLWEzeDsgbjJ5ID0gLWEzeTsgbjJ6ID0gLWEzejtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmIChtaW5JbmRleCA9PSAyKSB7Ly8gYjEueiAqIGIyXHJcbiAgICAgICAgaWYgKHJpZ2h0KSB7XHJcbiAgICAgICAgICBjeCA9IHAxeCArIGQzeDsgY3kgPSBwMXkgKyBkM3k7IGN6ID0gcDF6ICsgZDN6O1xyXG4gICAgICAgICAgbnggPSBhM3g7IG55ID0gYTN5OyBueiA9IGEzejtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgY3ggPSBwMXggLSBkM3g7IGN5ID0gcDF5IC0gZDN5OyBjeiA9IHAxeiAtIGQzejtcclxuICAgICAgICAgIG54ID0gLWEzeDsgbnkgPSAtYTN5OyBueiA9IC1hM3o7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHMxeCA9IGQxeDsgczF5ID0gZDF5OyBzMXogPSBkMXo7XHJcbiAgICAgICAgbjF4ID0gLWExeDsgbjF5ID0gLWExeTsgbjF6ID0gLWExejtcclxuICAgICAgICBzMnggPSBkMng7IHMyeSA9IGQyeTsgczJ6ID0gZDJ6O1xyXG4gICAgICAgIG4yeCA9IC1hMng7IG4yeSA9IC1hMnk7IG4yeiA9IC1hMno7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAobWluSW5kZXggPT0gMykgey8vIGIyLnggKiBiMVxyXG4gICAgICAgIHN3YXAgPSB0cnVlO1xyXG4gICAgICAgIGlmICghcmlnaHQpIHtcclxuICAgICAgICAgIGN4ID0gcDJ4ICsgZDR4OyBjeSA9IHAyeSArIGQ0eTsgY3ogPSBwMnogKyBkNHo7XHJcbiAgICAgICAgICBueCA9IGE0eDsgbnkgPSBhNHk7IG56ID0gYTR6O1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBjeCA9IHAyeCAtIGQ0eDsgY3kgPSBwMnkgLSBkNHk7IGN6ID0gcDJ6IC0gZDR6O1xyXG4gICAgICAgICAgbnggPSAtYTR4OyBueSA9IC1hNHk7IG56ID0gLWE0ejtcclxuICAgICAgICB9XHJcbiAgICAgICAgczF4ID0gZDV4OyBzMXkgPSBkNXk7IHMxeiA9IGQ1ejtcclxuICAgICAgICBuMXggPSAtYTV4OyBuMXkgPSAtYTV5OyBuMXogPSAtYTV6O1xyXG4gICAgICAgIHMyeCA9IGQ2eDsgczJ5ID0gZDZ5OyBzMnogPSBkNno7XHJcbiAgICAgICAgbjJ4ID0gLWE2eDsgbjJ5ID0gLWE2eTsgbjJ6ID0gLWE2ejtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmIChtaW5JbmRleCA9PSA0KSB7Ly8gYjIueSAqIGIxXHJcbiAgICAgICAgc3dhcCA9IHRydWU7XHJcbiAgICAgICAgaWYgKCFyaWdodCkge1xyXG4gICAgICAgICAgY3ggPSBwMnggKyBkNXg7IGN5ID0gcDJ5ICsgZDV5OyBjeiA9IHAyeiArIGQ1ejtcclxuICAgICAgICAgIG54ID0gYTV4OyBueSA9IGE1eTsgbnogPSBhNXo7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGN4ID0gcDJ4IC0gZDV4OyBjeSA9IHAyeSAtIGQ1eTsgY3ogPSBwMnogLSBkNXo7XHJcbiAgICAgICAgICBueCA9IC1hNXg7IG55ID0gLWE1eTsgbnogPSAtYTV6O1xyXG4gICAgICAgIH1cclxuICAgICAgICBzMXggPSBkNHg7IHMxeSA9IGQ0eTsgczF6ID0gZDR6O1xyXG4gICAgICAgIG4xeCA9IC1hNHg7IG4xeSA9IC1hNHk7IG4xeiA9IC1hNHo7XHJcbiAgICAgICAgczJ4ID0gZDZ4OyBzMnkgPSBkNnk7IHMyeiA9IGQ2ejtcclxuICAgICAgICBuMnggPSAtYTZ4OyBuMnkgPSAtYTZ5OyBuMnogPSAtYTZ6O1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKG1pbkluZGV4ID09IDUpIHsvLyBiMi56ICogYjFcclxuICAgICAgICBzd2FwID0gdHJ1ZTtcclxuICAgICAgICBpZiAoIXJpZ2h0KSB7XHJcbiAgICAgICAgICBjeCA9IHAyeCArIGQ2eDsgY3kgPSBwMnkgKyBkNnk7IGN6ID0gcDJ6ICsgZDZ6O1xyXG4gICAgICAgICAgbnggPSBhNng7IG55ID0gYTZ5OyBueiA9IGE2ejtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgY3ggPSBwMnggLSBkNng7IGN5ID0gcDJ5IC0gZDZ5OyBjeiA9IHAyeiAtIGQ2ejtcclxuICAgICAgICAgIG54ID0gLWE2eDsgbnkgPSAtYTZ5OyBueiA9IC1hNno7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHMxeCA9IGQ0eDsgczF5ID0gZDR5OyBzMXogPSBkNHo7XHJcbiAgICAgICAgbjF4ID0gLWE0eDsgbjF5ID0gLWE0eTsgbjF6ID0gLWE0ejtcclxuICAgICAgICBzMnggPSBkNXg7IHMyeSA9IGQ1eTsgczJ6ID0gZDV6O1xyXG4gICAgICAgIG4yeCA9IC1hNXg7IG4yeSA9IC1hNXk7IG4yeiA9IC1hNXo7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAobWluSW5kZXggPT0gNikgey8vIGIxLnggKiBiMi54XHJcbiAgICAgICAgbnggPSBhN3g7IG55ID0gYTd5OyBueiA9IGE3ejtcclxuICAgICAgICBuMXggPSBhMXg7IG4xeSA9IGExeTsgbjF6ID0gYTF6O1xyXG4gICAgICAgIG4yeCA9IGE0eDsgbjJ5ID0gYTR5OyBuMnogPSBhNHo7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAobWluSW5kZXggPT0gNykgey8vIGIxLnggKiBiMi55XHJcbiAgICAgICAgbnggPSBhOHg7IG55ID0gYTh5OyBueiA9IGE4ejtcclxuICAgICAgICBuMXggPSBhMXg7IG4xeSA9IGExeTsgbjF6ID0gYTF6O1xyXG4gICAgICAgIG4yeCA9IGE1eDsgbjJ5ID0gYTV5OyBuMnogPSBhNXo7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAobWluSW5kZXggPT0gOCkgey8vIGIxLnggKiBiMi56XHJcbiAgICAgICAgbnggPSBhOXg7IG55ID0gYTl5OyBueiA9IGE5ejtcclxuICAgICAgICBuMXggPSBhMXg7IG4xeSA9IGExeTsgbjF6ID0gYTF6O1xyXG4gICAgICAgIG4yeCA9IGE2eDsgbjJ5ID0gYTZ5OyBuMnogPSBhNno7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAobWluSW5kZXggPT0gOSkgey8vIGIxLnkgKiBiMi54XHJcbiAgICAgICAgbnggPSBhYXg7IG55ID0gYWF5OyBueiA9IGFhejtcclxuICAgICAgICBuMXggPSBhMng7IG4xeSA9IGEyeTsgbjF6ID0gYTJ6O1xyXG4gICAgICAgIG4yeCA9IGE0eDsgbjJ5ID0gYTR5OyBuMnogPSBhNHo7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAobWluSW5kZXggPT0gMTApIHsvLyBiMS55ICogYjIueVxyXG4gICAgICAgIG54ID0gYWJ4OyBueSA9IGFieTsgbnogPSBhYno7XHJcbiAgICAgICAgbjF4ID0gYTJ4OyBuMXkgPSBhMnk7IG4xeiA9IGEyejtcclxuICAgICAgICBuMnggPSBhNXg7IG4yeSA9IGE1eTsgbjJ6ID0gYTV6O1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKG1pbkluZGV4ID09IDExKSB7Ly8gYjEueSAqIGIyLnpcclxuICAgICAgICBueCA9IGFjeDsgbnkgPSBhY3k7IG56ID0gYWN6O1xyXG4gICAgICAgIG4xeCA9IGEyeDsgbjF5ID0gYTJ5OyBuMXogPSBhMno7XHJcbiAgICAgICAgbjJ4ID0gYTZ4OyBuMnkgPSBhNnk7IG4yeiA9IGE2ejtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmIChtaW5JbmRleCA9PSAxMikgey8vIGIxLnogKiBiMi54XHJcbiAgICAgICAgbnggPSBhZHg7IG55ID0gYWR5OyBueiA9IGFkejtcclxuICAgICAgICBuMXggPSBhM3g7IG4xeSA9IGEzeTsgbjF6ID0gYTN6O1xyXG4gICAgICAgIG4yeCA9IGE0eDsgbjJ5ID0gYTR5OyBuMnogPSBhNHo7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAobWluSW5kZXggPT0gMTMpIHsvLyBiMS56ICogYjIueVxyXG4gICAgICAgIG54ID0gYWV4OyBueSA9IGFleTsgbnogPSBhZXo7XHJcbiAgICAgICAgbjF4ID0gYTN4OyBuMXkgPSBhM3k7IG4xeiA9IGEzejtcclxuICAgICAgICBuMnggPSBhNXg7IG4yeSA9IGE1eTsgbjJ6ID0gYTV6O1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKG1pbkluZGV4ID09IDE0KSB7Ly8gYjEueiAqIGIyLnpcclxuICAgICAgICBueCA9IGFmeDsgbnkgPSBhZnk7IG56ID0gYWZ6O1xyXG4gICAgICAgIG4xeCA9IGEzeDsgbjF5ID0gYTN5OyBuMXogPSBhM3o7XHJcbiAgICAgICAgbjJ4ID0gYTZ4OyBuMnkgPSBhNnk7IG4yeiA9IGE2ejtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy9fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19cclxuXHJcbiAgICAgIC8vdmFyIHY7XHJcbiAgICAgIGlmIChtaW5JbmRleCA+IDUpIHtcclxuICAgICAgICBpZiAoIXJpZ2h0KSB7XHJcbiAgICAgICAgICBueCA9IC1ueDsgbnkgPSAtbnk7IG56ID0gLW56O1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgZGlzdGFuY2U7XHJcbiAgICAgICAgdmFyIG1heERpc3RhbmNlO1xyXG4gICAgICAgIHZhciB2eDtcclxuICAgICAgICB2YXIgdnk7XHJcbiAgICAgICAgdmFyIHZ6O1xyXG4gICAgICAgIHZhciB2MXg7XHJcbiAgICAgICAgdmFyIHYxeTtcclxuICAgICAgICB2YXIgdjF6O1xyXG4gICAgICAgIHZhciB2Mng7XHJcbiAgICAgICAgdmFyIHYyeTtcclxuICAgICAgICB2YXIgdjJ6O1xyXG4gICAgICAgIC8vdmVydGV4MTtcclxuICAgICAgICB2MXggPSBWMVswXTsgdjF5ID0gVjFbMV07IHYxeiA9IFYxWzJdO1xyXG4gICAgICAgIG1heERpc3RhbmNlID0gbnggKiB2MXggKyBueSAqIHYxeSArIG56ICogdjF6O1xyXG4gICAgICAgIC8vdmVydGV4MjtcclxuICAgICAgICB2eCA9IFYxWzNdOyB2eSA9IFYxWzRdOyB2eiA9IFYxWzVdO1xyXG4gICAgICAgIGRpc3RhbmNlID0gbnggKiB2eCArIG55ICogdnkgKyBueiAqIHZ6O1xyXG4gICAgICAgIGlmIChkaXN0YW5jZSA+IG1heERpc3RhbmNlKSB7XHJcbiAgICAgICAgICBtYXhEaXN0YW5jZSA9IGRpc3RhbmNlO1xyXG4gICAgICAgICAgdjF4ID0gdng7IHYxeSA9IHZ5OyB2MXogPSB2ejtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy92ZXJ0ZXgzO1xyXG4gICAgICAgIHZ4ID0gVjFbNl07IHZ5ID0gVjFbN107IHZ6ID0gVjFbOF07XHJcbiAgICAgICAgZGlzdGFuY2UgPSBueCAqIHZ4ICsgbnkgKiB2eSArIG56ICogdno7XHJcbiAgICAgICAgaWYgKGRpc3RhbmNlID4gbWF4RGlzdGFuY2UpIHtcclxuICAgICAgICAgIG1heERpc3RhbmNlID0gZGlzdGFuY2U7XHJcbiAgICAgICAgICB2MXggPSB2eDsgdjF5ID0gdnk7IHYxeiA9IHZ6O1xyXG4gICAgICAgIH1cclxuICAgICAgICAvL3ZlcnRleDQ7XHJcbiAgICAgICAgdnggPSBWMVs5XTsgdnkgPSBWMVsxMF07IHZ6ID0gVjFbMTFdO1xyXG4gICAgICAgIGRpc3RhbmNlID0gbnggKiB2eCArIG55ICogdnkgKyBueiAqIHZ6O1xyXG4gICAgICAgIGlmIChkaXN0YW5jZSA+IG1heERpc3RhbmNlKSB7XHJcbiAgICAgICAgICBtYXhEaXN0YW5jZSA9IGRpc3RhbmNlO1xyXG4gICAgICAgICAgdjF4ID0gdng7IHYxeSA9IHZ5OyB2MXogPSB2ejtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy92ZXJ0ZXg1O1xyXG4gICAgICAgIHZ4ID0gVjFbMTJdOyB2eSA9IFYxWzEzXTsgdnogPSBWMVsxNF07XHJcbiAgICAgICAgZGlzdGFuY2UgPSBueCAqIHZ4ICsgbnkgKiB2eSArIG56ICogdno7XHJcbiAgICAgICAgaWYgKGRpc3RhbmNlID4gbWF4RGlzdGFuY2UpIHtcclxuICAgICAgICAgIG1heERpc3RhbmNlID0gZGlzdGFuY2U7XHJcbiAgICAgICAgICB2MXggPSB2eDsgdjF5ID0gdnk7IHYxeiA9IHZ6O1xyXG4gICAgICAgIH1cclxuICAgICAgICAvL3ZlcnRleDY7XHJcbiAgICAgICAgdnggPSBWMVsxNV07IHZ5ID0gVjFbMTZdOyB2eiA9IFYxWzE3XTtcclxuICAgICAgICBkaXN0YW5jZSA9IG54ICogdnggKyBueSAqIHZ5ICsgbnogKiB2ejtcclxuICAgICAgICBpZiAoZGlzdGFuY2UgPiBtYXhEaXN0YW5jZSkge1xyXG4gICAgICAgICAgbWF4RGlzdGFuY2UgPSBkaXN0YW5jZTtcclxuICAgICAgICAgIHYxeCA9IHZ4OyB2MXkgPSB2eTsgdjF6ID0gdno7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vdmVydGV4NztcclxuICAgICAgICB2eCA9IFYxWzE4XTsgdnkgPSBWMVsxOV07IHZ6ID0gVjFbMjBdO1xyXG4gICAgICAgIGRpc3RhbmNlID0gbnggKiB2eCArIG55ICogdnkgKyBueiAqIHZ6O1xyXG4gICAgICAgIGlmIChkaXN0YW5jZSA+IG1heERpc3RhbmNlKSB7XHJcbiAgICAgICAgICBtYXhEaXN0YW5jZSA9IGRpc3RhbmNlO1xyXG4gICAgICAgICAgdjF4ID0gdng7IHYxeSA9IHZ5OyB2MXogPSB2ejtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy92ZXJ0ZXg4O1xyXG4gICAgICAgIHZ4ID0gVjFbMjFdOyB2eSA9IFYxWzIyXTsgdnogPSBWMVsyM107XHJcbiAgICAgICAgZGlzdGFuY2UgPSBueCAqIHZ4ICsgbnkgKiB2eSArIG56ICogdno7XHJcbiAgICAgICAgaWYgKGRpc3RhbmNlID4gbWF4RGlzdGFuY2UpIHtcclxuICAgICAgICAgIG1heERpc3RhbmNlID0gZGlzdGFuY2U7XHJcbiAgICAgICAgICB2MXggPSB2eDsgdjF5ID0gdnk7IHYxeiA9IHZ6O1xyXG4gICAgICAgIH1cclxuICAgICAgICAvL3ZlcnRleDE7XHJcbiAgICAgICAgdjJ4ID0gVjJbMF07IHYyeSA9IFYyWzFdOyB2MnogPSBWMlsyXTtcclxuICAgICAgICBtYXhEaXN0YW5jZSA9IG54ICogdjJ4ICsgbnkgKiB2MnkgKyBueiAqIHYyejtcclxuICAgICAgICAvL3ZlcnRleDI7XHJcbiAgICAgICAgdnggPSBWMlszXTsgdnkgPSBWMls0XTsgdnogPSBWMls1XTtcclxuICAgICAgICBkaXN0YW5jZSA9IG54ICogdnggKyBueSAqIHZ5ICsgbnogKiB2ejtcclxuICAgICAgICBpZiAoZGlzdGFuY2UgPCBtYXhEaXN0YW5jZSkge1xyXG4gICAgICAgICAgbWF4RGlzdGFuY2UgPSBkaXN0YW5jZTtcclxuICAgICAgICAgIHYyeCA9IHZ4OyB2MnkgPSB2eTsgdjJ6ID0gdno7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vdmVydGV4MztcclxuICAgICAgICB2eCA9IFYyWzZdOyB2eSA9IFYyWzddOyB2eiA9IFYyWzhdO1xyXG4gICAgICAgIGRpc3RhbmNlID0gbnggKiB2eCArIG55ICogdnkgKyBueiAqIHZ6O1xyXG4gICAgICAgIGlmIChkaXN0YW5jZSA8IG1heERpc3RhbmNlKSB7XHJcbiAgICAgICAgICBtYXhEaXN0YW5jZSA9IGRpc3RhbmNlO1xyXG4gICAgICAgICAgdjJ4ID0gdng7IHYyeSA9IHZ5OyB2MnogPSB2ejtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy92ZXJ0ZXg0O1xyXG4gICAgICAgIHZ4ID0gVjJbOV07IHZ5ID0gVjJbMTBdOyB2eiA9IFYyWzExXTtcclxuICAgICAgICBkaXN0YW5jZSA9IG54ICogdnggKyBueSAqIHZ5ICsgbnogKiB2ejtcclxuICAgICAgICBpZiAoZGlzdGFuY2UgPCBtYXhEaXN0YW5jZSkge1xyXG4gICAgICAgICAgbWF4RGlzdGFuY2UgPSBkaXN0YW5jZTtcclxuICAgICAgICAgIHYyeCA9IHZ4OyB2MnkgPSB2eTsgdjJ6ID0gdno7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vdmVydGV4NTtcclxuICAgICAgICB2eCA9IFYyWzEyXTsgdnkgPSBWMlsxM107IHZ6ID0gVjJbMTRdO1xyXG4gICAgICAgIGRpc3RhbmNlID0gbnggKiB2eCArIG55ICogdnkgKyBueiAqIHZ6O1xyXG4gICAgICAgIGlmIChkaXN0YW5jZSA8IG1heERpc3RhbmNlKSB7XHJcbiAgICAgICAgICBtYXhEaXN0YW5jZSA9IGRpc3RhbmNlO1xyXG4gICAgICAgICAgdjJ4ID0gdng7IHYyeSA9IHZ5OyB2MnogPSB2ejtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy92ZXJ0ZXg2O1xyXG4gICAgICAgIHZ4ID0gVjJbMTVdOyB2eSA9IFYyWzE2XTsgdnogPSBWMlsxN107XHJcbiAgICAgICAgZGlzdGFuY2UgPSBueCAqIHZ4ICsgbnkgKiB2eSArIG56ICogdno7XHJcbiAgICAgICAgaWYgKGRpc3RhbmNlIDwgbWF4RGlzdGFuY2UpIHtcclxuICAgICAgICAgIG1heERpc3RhbmNlID0gZGlzdGFuY2U7XHJcbiAgICAgICAgICB2MnggPSB2eDsgdjJ5ID0gdnk7IHYyeiA9IHZ6O1xyXG4gICAgICAgIH1cclxuICAgICAgICAvL3ZlcnRleDc7XHJcbiAgICAgICAgdnggPSBWMlsxOF07IHZ5ID0gVjJbMTldOyB2eiA9IFYyWzIwXTtcclxuICAgICAgICBkaXN0YW5jZSA9IG54ICogdnggKyBueSAqIHZ5ICsgbnogKiB2ejtcclxuICAgICAgICBpZiAoZGlzdGFuY2UgPCBtYXhEaXN0YW5jZSkge1xyXG4gICAgICAgICAgbWF4RGlzdGFuY2UgPSBkaXN0YW5jZTtcclxuICAgICAgICAgIHYyeCA9IHZ4OyB2MnkgPSB2eTsgdjJ6ID0gdno7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vdmVydGV4ODtcclxuICAgICAgICB2eCA9IFYyWzIxXTsgdnkgPSBWMlsyMl07IHZ6ID0gVjJbMjNdO1xyXG4gICAgICAgIGRpc3RhbmNlID0gbnggKiB2eCArIG55ICogdnkgKyBueiAqIHZ6O1xyXG4gICAgICAgIGlmIChkaXN0YW5jZSA8IG1heERpc3RhbmNlKSB7XHJcbiAgICAgICAgICBtYXhEaXN0YW5jZSA9IGRpc3RhbmNlO1xyXG4gICAgICAgICAgdjJ4ID0gdng7IHYyeSA9IHZ5OyB2MnogPSB2ejtcclxuICAgICAgICB9XHJcbiAgICAgICAgdnggPSB2MnggLSB2MXg7IHZ5ID0gdjJ5IC0gdjF5OyB2eiA9IHYyeiAtIHYxejtcclxuICAgICAgICBkb3QxID0gbjF4ICogbjJ4ICsgbjF5ICogbjJ5ICsgbjF6ICogbjJ6O1xyXG4gICAgICAgIHZhciB0ID0gKHZ4ICogKG4xeCAtIG4yeCAqIGRvdDEpICsgdnkgKiAobjF5IC0gbjJ5ICogZG90MSkgKyB2eiAqIChuMXogLSBuMnogKiBkb3QxKSkgLyAoMSAtIGRvdDEgKiBkb3QxKTtcclxuICAgICAgICBtYW5pZm9sZC5hZGRQb2ludCh2MXggKyBuMXggKiB0ICsgbnggKiBkZXB0aCAqIDAuNSwgdjF5ICsgbjF5ICogdCArIG55ICogZGVwdGggKiAwLjUsIHYxeiArIG4xeiAqIHQgKyBueiAqIGRlcHRoICogMC41LCBueCwgbnksIG56LCBkZXB0aCwgZmFsc2UpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG4gICAgICAvLyBub3cgZGV0ZWN0IGZhY2UtZmFjZSBjb2xsaXNpb24uLi5cclxuICAgICAgLy8gdGFyZ2V0IHF1YWRcclxuICAgICAgdmFyIHExeDtcclxuICAgICAgdmFyIHExeTtcclxuICAgICAgdmFyIHExejtcclxuICAgICAgdmFyIHEyeDtcclxuICAgICAgdmFyIHEyeTtcclxuICAgICAgdmFyIHEyejtcclxuICAgICAgdmFyIHEzeDtcclxuICAgICAgdmFyIHEzeTtcclxuICAgICAgdmFyIHEzejtcclxuICAgICAgdmFyIHE0eDtcclxuICAgICAgdmFyIHE0eTtcclxuICAgICAgdmFyIHE0ejtcclxuICAgICAgLy8gc2VhcmNoIHN1cHBvcnQgZmFjZSBhbmQgdmVydGV4XHJcbiAgICAgIHZhciBtaW5Eb3QgPSAxO1xyXG4gICAgICB2YXIgZG90ID0gMDtcclxuICAgICAgdmFyIG1pbkRvdEluZGV4ID0gMDtcclxuICAgICAgaWYgKHN3YXApIHtcclxuICAgICAgICBkb3QgPSBhMXggKiBueCArIGExeSAqIG55ICsgYTF6ICogbno7XHJcbiAgICAgICAgaWYgKGRvdCA8IG1pbkRvdCkge1xyXG4gICAgICAgICAgbWluRG90ID0gZG90O1xyXG4gICAgICAgICAgbWluRG90SW5kZXggPSAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoLWRvdCA8IG1pbkRvdCkge1xyXG4gICAgICAgICAgbWluRG90ID0gLWRvdDtcclxuICAgICAgICAgIG1pbkRvdEluZGV4ID0gMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZG90ID0gYTJ4ICogbnggKyBhMnkgKiBueSArIGEyeiAqIG56O1xyXG4gICAgICAgIGlmIChkb3QgPCBtaW5Eb3QpIHtcclxuICAgICAgICAgIG1pbkRvdCA9IGRvdDtcclxuICAgICAgICAgIG1pbkRvdEluZGV4ID0gMjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKC1kb3QgPCBtaW5Eb3QpIHtcclxuICAgICAgICAgIG1pbkRvdCA9IC1kb3Q7XHJcbiAgICAgICAgICBtaW5Eb3RJbmRleCA9IDM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGRvdCA9IGEzeCAqIG54ICsgYTN5ICogbnkgKyBhM3ogKiBuejtcclxuICAgICAgICBpZiAoZG90IDwgbWluRG90KSB7XHJcbiAgICAgICAgICBtaW5Eb3QgPSBkb3Q7XHJcbiAgICAgICAgICBtaW5Eb3RJbmRleCA9IDQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICgtZG90IDwgbWluRG90KSB7XHJcbiAgICAgICAgICBtaW5Eb3QgPSAtZG90O1xyXG4gICAgICAgICAgbWluRG90SW5kZXggPSA1O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKG1pbkRvdEluZGV4ID09IDApIHsvLyB4KyBmYWNlXHJcbiAgICAgICAgICBxMXggPSBWMVswXTsgcTF5ID0gVjFbMV07IHExeiA9IFYxWzJdOy8vdmVydGV4MVxyXG4gICAgICAgICAgcTJ4ID0gVjFbNl07IHEyeSA9IFYxWzddOyBxMnogPSBWMVs4XTsvL3ZlcnRleDNcclxuICAgICAgICAgIHEzeCA9IFYxWzldOyBxM3kgPSBWMVsxMF07IHEzeiA9IFYxWzExXTsvL3ZlcnRleDRcclxuICAgICAgICAgIHE0eCA9IFYxWzNdOyBxNHkgPSBWMVs0XTsgcTR6ID0gVjFbNV07Ly92ZXJ0ZXgyXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKG1pbkRvdEluZGV4ID09IDEpIHsvLyB4LSBmYWNlXHJcbiAgICAgICAgICBxMXggPSBWMVsxNV07IHExeSA9IFYxWzE2XTsgcTF6ID0gVjFbMTddOy8vdmVydGV4NlxyXG4gICAgICAgICAgcTJ4ID0gVjFbMjFdOyBxMnkgPSBWMVsyMl07IHEyeiA9IFYxWzIzXTsvL3ZlcnRleDhcclxuICAgICAgICAgIHEzeCA9IFYxWzE4XTsgcTN5ID0gVjFbMTldOyBxM3ogPSBWMVsyMF07Ly92ZXJ0ZXg3XHJcbiAgICAgICAgICBxNHggPSBWMVsxMl07IHE0eSA9IFYxWzEzXTsgcTR6ID0gVjFbMTRdOy8vdmVydGV4NVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChtaW5Eb3RJbmRleCA9PSAyKSB7Ly8geSsgZmFjZVxyXG4gICAgICAgICAgcTF4ID0gVjFbMTJdOyBxMXkgPSBWMVsxM107IHExeiA9IFYxWzE0XTsvL3ZlcnRleDVcclxuICAgICAgICAgIHEyeCA9IFYxWzBdOyBxMnkgPSBWMVsxXTsgcTJ6ID0gVjFbMl07Ly92ZXJ0ZXgxXHJcbiAgICAgICAgICBxM3ggPSBWMVszXTsgcTN5ID0gVjFbNF07IHEzeiA9IFYxWzVdOy8vdmVydGV4MlxyXG4gICAgICAgICAgcTR4ID0gVjFbMTVdOyBxNHkgPSBWMVsxNl07IHE0eiA9IFYxWzE3XTsvL3ZlcnRleDZcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAobWluRG90SW5kZXggPT0gMykgey8vIHktIGZhY2VcclxuICAgICAgICAgIHExeCA9IFYxWzIxXTsgcTF5ID0gVjFbMjJdOyBxMXogPSBWMVsyM107Ly92ZXJ0ZXg4XHJcbiAgICAgICAgICBxMnggPSBWMVs5XTsgcTJ5ID0gVjFbMTBdOyBxMnogPSBWMVsxMV07Ly92ZXJ0ZXg0XHJcbiAgICAgICAgICBxM3ggPSBWMVs2XTsgcTN5ID0gVjFbN107IHEzeiA9IFYxWzhdOy8vdmVydGV4M1xyXG4gICAgICAgICAgcTR4ID0gVjFbMThdOyBxNHkgPSBWMVsxOV07IHE0eiA9IFYxWzIwXTsvL3ZlcnRleDdcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAobWluRG90SW5kZXggPT0gNCkgey8vIHorIGZhY2VcclxuICAgICAgICAgIHExeCA9IFYxWzEyXTsgcTF5ID0gVjFbMTNdOyBxMXogPSBWMVsxNF07Ly92ZXJ0ZXg1XHJcbiAgICAgICAgICBxMnggPSBWMVsxOF07IHEyeSA9IFYxWzE5XTsgcTJ6ID0gVjFbMjBdOy8vdmVydGV4N1xyXG4gICAgICAgICAgcTN4ID0gVjFbNl07IHEzeSA9IFYxWzddOyBxM3ogPSBWMVs4XTsvL3ZlcnRleDNcclxuICAgICAgICAgIHE0eCA9IFYxWzBdOyBxNHkgPSBWMVsxXTsgcTR6ID0gVjFbMl07Ly92ZXJ0ZXgxXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKG1pbkRvdEluZGV4ID09IDUpIHsvLyB6LSBmYWNlXHJcbiAgICAgICAgICBxMXggPSBWMVszXTsgcTF5ID0gVjFbNF07IHExeiA9IFYxWzVdOy8vdmVydGV4MlxyXG4gICAgICAgICAgLy8yeD1WMVs2XTsgcTJ5PVYxWzddOyBxMno9VjFbOF07Ly92ZXJ0ZXg0ICEhIVxyXG4gICAgICAgICAgcTJ4ID0gVjJbOV07IHEyeSA9IFYyWzEwXTsgcTJ6ID0gVjJbMTFdOy8vdmVydGV4NFxyXG4gICAgICAgICAgcTN4ID0gVjFbMjFdOyBxM3kgPSBWMVsyMl07IHEzeiA9IFYxWzIzXTsvL3ZlcnRleDhcclxuICAgICAgICAgIHE0eCA9IFYxWzE1XTsgcTR5ID0gVjFbMTZdOyBxNHogPSBWMVsxN107Ly92ZXJ0ZXg2XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBkb3QgPSBhNHggKiBueCArIGE0eSAqIG55ICsgYTR6ICogbno7XHJcbiAgICAgICAgaWYgKGRvdCA8IG1pbkRvdCkge1xyXG4gICAgICAgICAgbWluRG90ID0gZG90O1xyXG4gICAgICAgICAgbWluRG90SW5kZXggPSAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoLWRvdCA8IG1pbkRvdCkge1xyXG4gICAgICAgICAgbWluRG90ID0gLWRvdDtcclxuICAgICAgICAgIG1pbkRvdEluZGV4ID0gMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZG90ID0gYTV4ICogbnggKyBhNXkgKiBueSArIGE1eiAqIG56O1xyXG4gICAgICAgIGlmIChkb3QgPCBtaW5Eb3QpIHtcclxuICAgICAgICAgIG1pbkRvdCA9IGRvdDtcclxuICAgICAgICAgIG1pbkRvdEluZGV4ID0gMjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKC1kb3QgPCBtaW5Eb3QpIHtcclxuICAgICAgICAgIG1pbkRvdCA9IC1kb3Q7XHJcbiAgICAgICAgICBtaW5Eb3RJbmRleCA9IDM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGRvdCA9IGE2eCAqIG54ICsgYTZ5ICogbnkgKyBhNnogKiBuejtcclxuICAgICAgICBpZiAoZG90IDwgbWluRG90KSB7XHJcbiAgICAgICAgICBtaW5Eb3QgPSBkb3Q7XHJcbiAgICAgICAgICBtaW5Eb3RJbmRleCA9IDQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICgtZG90IDwgbWluRG90KSB7XHJcbiAgICAgICAgICBtaW5Eb3QgPSAtZG90O1xyXG4gICAgICAgICAgbWluRG90SW5kZXggPSA1O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy9fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19cclxuXHJcbiAgICAgICAgaWYgKG1pbkRvdEluZGV4ID09IDApIHsvLyB4KyBmYWNlXHJcbiAgICAgICAgICBxMXggPSBWMlswXTsgcTF5ID0gVjJbMV07IHExeiA9IFYyWzJdOy8vdmVydGV4MVxyXG4gICAgICAgICAgcTJ4ID0gVjJbNl07IHEyeSA9IFYyWzddOyBxMnogPSBWMls4XTsvL3ZlcnRleDNcclxuICAgICAgICAgIHEzeCA9IFYyWzldOyBxM3kgPSBWMlsxMF07IHEzeiA9IFYyWzExXTsvL3ZlcnRleDRcclxuICAgICAgICAgIHE0eCA9IFYyWzNdOyBxNHkgPSBWMls0XTsgcTR6ID0gVjJbNV07Ly92ZXJ0ZXgyXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKG1pbkRvdEluZGV4ID09IDEpIHsvLyB4LSBmYWNlXHJcbiAgICAgICAgICBxMXggPSBWMlsxNV07IHExeSA9IFYyWzE2XTsgcTF6ID0gVjJbMTddOy8vdmVydGV4NlxyXG4gICAgICAgICAgcTJ4ID0gVjJbMjFdOyBxMnkgPSBWMlsyMl07IHEyeiA9IFYyWzIzXTsgLy92ZXJ0ZXg4XHJcbiAgICAgICAgICBxM3ggPSBWMlsxOF07IHEzeSA9IFYyWzE5XTsgcTN6ID0gVjJbMjBdOy8vdmVydGV4N1xyXG4gICAgICAgICAgcTR4ID0gVjJbMTJdOyBxNHkgPSBWMlsxM107IHE0eiA9IFYyWzE0XTsvL3ZlcnRleDVcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAobWluRG90SW5kZXggPT0gMikgey8vIHkrIGZhY2VcclxuICAgICAgICAgIHExeCA9IFYyWzEyXTsgcTF5ID0gVjJbMTNdOyBxMXogPSBWMlsxNF07Ly92ZXJ0ZXg1XHJcbiAgICAgICAgICBxMnggPSBWMlswXTsgcTJ5ID0gVjJbMV07IHEyeiA9IFYyWzJdOy8vdmVydGV4MVxyXG4gICAgICAgICAgcTN4ID0gVjJbM107IHEzeSA9IFYyWzRdOyBxM3ogPSBWMls1XTsvL3ZlcnRleDJcclxuICAgICAgICAgIHE0eCA9IFYyWzE1XTsgcTR5ID0gVjJbMTZdOyBxNHogPSBWMlsxN107Ly92ZXJ0ZXg2XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKG1pbkRvdEluZGV4ID09IDMpIHsvLyB5LSBmYWNlXHJcbiAgICAgICAgICBxMXggPSBWMlsyMV07IHExeSA9IFYyWzIyXTsgcTF6ID0gVjJbMjNdOy8vdmVydGV4OFxyXG4gICAgICAgICAgcTJ4ID0gVjJbOV07IHEyeSA9IFYyWzEwXTsgcTJ6ID0gVjJbMTFdOy8vdmVydGV4NFxyXG4gICAgICAgICAgcTN4ID0gVjJbNl07IHEzeSA9IFYyWzddOyBxM3ogPSBWMls4XTsvL3ZlcnRleDNcclxuICAgICAgICAgIHE0eCA9IFYyWzE4XTsgcTR5ID0gVjJbMTldOyBxNHogPSBWMlsyMF07Ly92ZXJ0ZXg3XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKG1pbkRvdEluZGV4ID09IDQpIHsvLyB6KyBmYWNlXHJcbiAgICAgICAgICBxMXggPSBWMlsxMl07IHExeSA9IFYyWzEzXTsgcTF6ID0gVjJbMTRdOy8vdmVydGV4NVxyXG4gICAgICAgICAgcTJ4ID0gVjJbMThdOyBxMnkgPSBWMlsxOV07IHEyeiA9IFYyWzIwXTsvL3ZlcnRleDdcclxuICAgICAgICAgIHEzeCA9IFYyWzZdOyBxM3kgPSBWMls3XTsgcTN6ID0gVjJbOF07Ly92ZXJ0ZXgzXHJcbiAgICAgICAgICBxNHggPSBWMlswXTsgcTR5ID0gVjJbMV07IHE0eiA9IFYyWzJdOy8vdmVydGV4MVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChtaW5Eb3RJbmRleCA9PSA1KSB7Ly8gei0gZmFjZVxyXG4gICAgICAgICAgcTF4ID0gVjJbM107IHExeSA9IFYyWzRdOyBxMXogPSBWMls1XTsvL3ZlcnRleDJcclxuICAgICAgICAgIHEyeCA9IFYyWzldOyBxMnkgPSBWMlsxMF07IHEyeiA9IFYyWzExXTsvL3ZlcnRleDRcclxuICAgICAgICAgIHEzeCA9IFYyWzIxXTsgcTN5ID0gVjJbMjJdOyBxM3ogPSBWMlsyM107Ly92ZXJ0ZXg4XHJcbiAgICAgICAgICBxNHggPSBWMlsxNV07IHE0eSA9IFYyWzE2XTsgcTR6ID0gVjJbMTddOy8vdmVydGV4NlxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIH1cclxuICAgICAgLy8gY2xpcCB2ZXJ0aWNlc1xyXG4gICAgICB2YXIgbnVtQ2xpcFZlcnRpY2VzO1xyXG4gICAgICB2YXIgbnVtQWRkZWRDbGlwVmVydGljZXM7XHJcbiAgICAgIHZhciBpbmRleDtcclxuICAgICAgdmFyIHgxO1xyXG4gICAgICB2YXIgeTE7XHJcbiAgICAgIHZhciB6MTtcclxuICAgICAgdmFyIHgyO1xyXG4gICAgICB2YXIgeTI7XHJcbiAgICAgIHZhciB6MjtcclxuICAgICAgdGhpcy5jbGlwVmVydGljZXMxWzBdID0gcTF4O1xyXG4gICAgICB0aGlzLmNsaXBWZXJ0aWNlczFbMV0gPSBxMXk7XHJcbiAgICAgIHRoaXMuY2xpcFZlcnRpY2VzMVsyXSA9IHExejtcclxuICAgICAgdGhpcy5jbGlwVmVydGljZXMxWzNdID0gcTJ4O1xyXG4gICAgICB0aGlzLmNsaXBWZXJ0aWNlczFbNF0gPSBxMnk7XHJcbiAgICAgIHRoaXMuY2xpcFZlcnRpY2VzMVs1XSA9IHEyejtcclxuICAgICAgdGhpcy5jbGlwVmVydGljZXMxWzZdID0gcTN4O1xyXG4gICAgICB0aGlzLmNsaXBWZXJ0aWNlczFbN10gPSBxM3k7XHJcbiAgICAgIHRoaXMuY2xpcFZlcnRpY2VzMVs4XSA9IHEzejtcclxuICAgICAgdGhpcy5jbGlwVmVydGljZXMxWzldID0gcTR4O1xyXG4gICAgICB0aGlzLmNsaXBWZXJ0aWNlczFbMTBdID0gcTR5O1xyXG4gICAgICB0aGlzLmNsaXBWZXJ0aWNlczFbMTFdID0gcTR6O1xyXG4gICAgICBudW1BZGRlZENsaXBWZXJ0aWNlcyA9IDA7XHJcbiAgICAgIHgxID0gdGhpcy5jbGlwVmVydGljZXMxWzldO1xyXG4gICAgICB5MSA9IHRoaXMuY2xpcFZlcnRpY2VzMVsxMF07XHJcbiAgICAgIHoxID0gdGhpcy5jbGlwVmVydGljZXMxWzExXTtcclxuICAgICAgZG90MSA9ICh4MSAtIGN4IC0gczF4KSAqIG4xeCArICh5MSAtIGN5IC0gczF5KSAqIG4xeSArICh6MSAtIGN6IC0gczF6KSAqIG4xejtcclxuXHJcbiAgICAgIC8vdmFyIGkgPSA0O1xyXG4gICAgICAvL3doaWxlKGktLSl7XHJcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNDsgaSsrKSB7XHJcbiAgICAgICAgaW5kZXggPSBpICogMztcclxuICAgICAgICB4MiA9IHRoaXMuY2xpcFZlcnRpY2VzMVtpbmRleF07XHJcbiAgICAgICAgeTIgPSB0aGlzLmNsaXBWZXJ0aWNlczFbaW5kZXggKyAxXTtcclxuICAgICAgICB6MiA9IHRoaXMuY2xpcFZlcnRpY2VzMVtpbmRleCArIDJdO1xyXG4gICAgICAgIGRvdDIgPSAoeDIgLSBjeCAtIHMxeCkgKiBuMXggKyAoeTIgLSBjeSAtIHMxeSkgKiBuMXkgKyAoejIgLSBjeiAtIHMxeikgKiBuMXo7XHJcbiAgICAgICAgaWYgKGRvdDEgPiAwKSB7XHJcbiAgICAgICAgICBpZiAoZG90MiA+IDApIHtcclxuICAgICAgICAgICAgaW5kZXggPSBudW1BZGRlZENsaXBWZXJ0aWNlcyAqIDM7XHJcbiAgICAgICAgICAgIG51bUFkZGVkQ2xpcFZlcnRpY2VzKys7XHJcbiAgICAgICAgICAgIHRoaXMuY2xpcFZlcnRpY2VzMltpbmRleF0gPSB4MjtcclxuICAgICAgICAgICAgdGhpcy5jbGlwVmVydGljZXMyW2luZGV4ICsgMV0gPSB5MjtcclxuICAgICAgICAgICAgdGhpcy5jbGlwVmVydGljZXMyW2luZGV4ICsgMl0gPSB6MjtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGluZGV4ID0gbnVtQWRkZWRDbGlwVmVydGljZXMgKiAzO1xyXG4gICAgICAgICAgICBudW1BZGRlZENsaXBWZXJ0aWNlcysrO1xyXG4gICAgICAgICAgICB0ID0gZG90MSAvIChkb3QxIC0gZG90Mik7XHJcbiAgICAgICAgICAgIHRoaXMuY2xpcFZlcnRpY2VzMltpbmRleF0gPSB4MSArICh4MiAtIHgxKSAqIHQ7XHJcbiAgICAgICAgICAgIHRoaXMuY2xpcFZlcnRpY2VzMltpbmRleCArIDFdID0geTEgKyAoeTIgLSB5MSkgKiB0O1xyXG4gICAgICAgICAgICB0aGlzLmNsaXBWZXJ0aWNlczJbaW5kZXggKyAyXSA9IHoxICsgKHoyIC0gejEpICogdDtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgaWYgKGRvdDIgPiAwKSB7XHJcbiAgICAgICAgICAgIGluZGV4ID0gbnVtQWRkZWRDbGlwVmVydGljZXMgKiAzO1xyXG4gICAgICAgICAgICBudW1BZGRlZENsaXBWZXJ0aWNlcysrO1xyXG4gICAgICAgICAgICB0ID0gZG90MSAvIChkb3QxIC0gZG90Mik7XHJcbiAgICAgICAgICAgIHRoaXMuY2xpcFZlcnRpY2VzMltpbmRleF0gPSB4MSArICh4MiAtIHgxKSAqIHQ7XHJcbiAgICAgICAgICAgIHRoaXMuY2xpcFZlcnRpY2VzMltpbmRleCArIDFdID0geTEgKyAoeTIgLSB5MSkgKiB0O1xyXG4gICAgICAgICAgICB0aGlzLmNsaXBWZXJ0aWNlczJbaW5kZXggKyAyXSA9IHoxICsgKHoyIC0gejEpICogdDtcclxuICAgICAgICAgICAgaW5kZXggPSBudW1BZGRlZENsaXBWZXJ0aWNlcyAqIDM7XHJcbiAgICAgICAgICAgIG51bUFkZGVkQ2xpcFZlcnRpY2VzKys7XHJcbiAgICAgICAgICAgIHRoaXMuY2xpcFZlcnRpY2VzMltpbmRleF0gPSB4MjtcclxuICAgICAgICAgICAgdGhpcy5jbGlwVmVydGljZXMyW2luZGV4ICsgMV0gPSB5MjtcclxuICAgICAgICAgICAgdGhpcy5jbGlwVmVydGljZXMyW2luZGV4ICsgMl0gPSB6MjtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgeDEgPSB4MjtcclxuICAgICAgICB5MSA9IHkyO1xyXG4gICAgICAgIHoxID0gejI7XHJcbiAgICAgICAgZG90MSA9IGRvdDI7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIG51bUNsaXBWZXJ0aWNlcyA9IG51bUFkZGVkQ2xpcFZlcnRpY2VzO1xyXG4gICAgICBpZiAobnVtQ2xpcFZlcnRpY2VzID09IDApIHJldHVybjtcclxuICAgICAgbnVtQWRkZWRDbGlwVmVydGljZXMgPSAwO1xyXG4gICAgICBpbmRleCA9IChudW1DbGlwVmVydGljZXMgLSAxKSAqIDM7XHJcbiAgICAgIHgxID0gdGhpcy5jbGlwVmVydGljZXMyW2luZGV4XTtcclxuICAgICAgeTEgPSB0aGlzLmNsaXBWZXJ0aWNlczJbaW5kZXggKyAxXTtcclxuICAgICAgejEgPSB0aGlzLmNsaXBWZXJ0aWNlczJbaW5kZXggKyAyXTtcclxuICAgICAgZG90MSA9ICh4MSAtIGN4IC0gczJ4KSAqIG4yeCArICh5MSAtIGN5IC0gczJ5KSAqIG4yeSArICh6MSAtIGN6IC0gczJ6KSAqIG4yejtcclxuXHJcbiAgICAgIC8vaSA9IG51bUNsaXBWZXJ0aWNlcztcclxuICAgICAgLy93aGlsZShpLS0pe1xyXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgbnVtQ2xpcFZlcnRpY2VzOyBpKyspIHtcclxuICAgICAgICBpbmRleCA9IGkgKiAzO1xyXG4gICAgICAgIHgyID0gdGhpcy5jbGlwVmVydGljZXMyW2luZGV4XTtcclxuICAgICAgICB5MiA9IHRoaXMuY2xpcFZlcnRpY2VzMltpbmRleCArIDFdO1xyXG4gICAgICAgIHoyID0gdGhpcy5jbGlwVmVydGljZXMyW2luZGV4ICsgMl07XHJcbiAgICAgICAgZG90MiA9ICh4MiAtIGN4IC0gczJ4KSAqIG4yeCArICh5MiAtIGN5IC0gczJ5KSAqIG4yeSArICh6MiAtIGN6IC0gczJ6KSAqIG4yejtcclxuICAgICAgICBpZiAoZG90MSA+IDApIHtcclxuICAgICAgICAgIGlmIChkb3QyID4gMCkge1xyXG4gICAgICAgICAgICBpbmRleCA9IG51bUFkZGVkQ2xpcFZlcnRpY2VzICogMztcclxuICAgICAgICAgICAgbnVtQWRkZWRDbGlwVmVydGljZXMrKztcclxuICAgICAgICAgICAgdGhpcy5jbGlwVmVydGljZXMxW2luZGV4XSA9IHgyO1xyXG4gICAgICAgICAgICB0aGlzLmNsaXBWZXJ0aWNlczFbaW5kZXggKyAxXSA9IHkyO1xyXG4gICAgICAgICAgICB0aGlzLmNsaXBWZXJ0aWNlczFbaW5kZXggKyAyXSA9IHoyO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaW5kZXggPSBudW1BZGRlZENsaXBWZXJ0aWNlcyAqIDM7XHJcbiAgICAgICAgICAgIG51bUFkZGVkQ2xpcFZlcnRpY2VzKys7XHJcbiAgICAgICAgICAgIHQgPSBkb3QxIC8gKGRvdDEgLSBkb3QyKTtcclxuICAgICAgICAgICAgdGhpcy5jbGlwVmVydGljZXMxW2luZGV4XSA9IHgxICsgKHgyIC0geDEpICogdDtcclxuICAgICAgICAgICAgdGhpcy5jbGlwVmVydGljZXMxW2luZGV4ICsgMV0gPSB5MSArICh5MiAtIHkxKSAqIHQ7XHJcbiAgICAgICAgICAgIHRoaXMuY2xpcFZlcnRpY2VzMVtpbmRleCArIDJdID0gejEgKyAoejIgLSB6MSkgKiB0O1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBpZiAoZG90MiA+IDApIHtcclxuICAgICAgICAgICAgaW5kZXggPSBudW1BZGRlZENsaXBWZXJ0aWNlcyAqIDM7XHJcbiAgICAgICAgICAgIG51bUFkZGVkQ2xpcFZlcnRpY2VzKys7XHJcbiAgICAgICAgICAgIHQgPSBkb3QxIC8gKGRvdDEgLSBkb3QyKTtcclxuICAgICAgICAgICAgdGhpcy5jbGlwVmVydGljZXMxW2luZGV4XSA9IHgxICsgKHgyIC0geDEpICogdDtcclxuICAgICAgICAgICAgdGhpcy5jbGlwVmVydGljZXMxW2luZGV4ICsgMV0gPSB5MSArICh5MiAtIHkxKSAqIHQ7XHJcbiAgICAgICAgICAgIHRoaXMuY2xpcFZlcnRpY2VzMVtpbmRleCArIDJdID0gejEgKyAoejIgLSB6MSkgKiB0O1xyXG4gICAgICAgICAgICBpbmRleCA9IG51bUFkZGVkQ2xpcFZlcnRpY2VzICogMztcclxuICAgICAgICAgICAgbnVtQWRkZWRDbGlwVmVydGljZXMrKztcclxuICAgICAgICAgICAgdGhpcy5jbGlwVmVydGljZXMxW2luZGV4XSA9IHgyO1xyXG4gICAgICAgICAgICB0aGlzLmNsaXBWZXJ0aWNlczFbaW5kZXggKyAxXSA9IHkyO1xyXG4gICAgICAgICAgICB0aGlzLmNsaXBWZXJ0aWNlczFbaW5kZXggKyAyXSA9IHoyO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB4MSA9IHgyO1xyXG4gICAgICAgIHkxID0geTI7XHJcbiAgICAgICAgejEgPSB6MjtcclxuICAgICAgICBkb3QxID0gZG90MjtcclxuICAgICAgfVxyXG5cclxuICAgICAgbnVtQ2xpcFZlcnRpY2VzID0gbnVtQWRkZWRDbGlwVmVydGljZXM7XHJcbiAgICAgIGlmIChudW1DbGlwVmVydGljZXMgPT0gMCkgcmV0dXJuO1xyXG4gICAgICBudW1BZGRlZENsaXBWZXJ0aWNlcyA9IDA7XHJcbiAgICAgIGluZGV4ID0gKG51bUNsaXBWZXJ0aWNlcyAtIDEpICogMztcclxuICAgICAgeDEgPSB0aGlzLmNsaXBWZXJ0aWNlczFbaW5kZXhdO1xyXG4gICAgICB5MSA9IHRoaXMuY2xpcFZlcnRpY2VzMVtpbmRleCArIDFdO1xyXG4gICAgICB6MSA9IHRoaXMuY2xpcFZlcnRpY2VzMVtpbmRleCArIDJdO1xyXG4gICAgICBkb3QxID0gKHgxIC0gY3ggKyBzMXgpICogLW4xeCArICh5MSAtIGN5ICsgczF5KSAqIC1uMXkgKyAoejEgLSBjeiArIHMxeikgKiAtbjF6O1xyXG5cclxuICAgICAgLy9pID0gbnVtQ2xpcFZlcnRpY2VzO1xyXG4gICAgICAvL3doaWxlKGktLSl7XHJcbiAgICAgIGZvciAoaSA9IDA7IGkgPCBudW1DbGlwVmVydGljZXM7IGkrKykge1xyXG4gICAgICAgIGluZGV4ID0gaSAqIDM7XHJcbiAgICAgICAgeDIgPSB0aGlzLmNsaXBWZXJ0aWNlczFbaW5kZXhdO1xyXG4gICAgICAgIHkyID0gdGhpcy5jbGlwVmVydGljZXMxW2luZGV4ICsgMV07XHJcbiAgICAgICAgejIgPSB0aGlzLmNsaXBWZXJ0aWNlczFbaW5kZXggKyAyXTtcclxuICAgICAgICBkb3QyID0gKHgyIC0gY3ggKyBzMXgpICogLW4xeCArICh5MiAtIGN5ICsgczF5KSAqIC1uMXkgKyAoejIgLSBjeiArIHMxeikgKiAtbjF6O1xyXG4gICAgICAgIGlmIChkb3QxID4gMCkge1xyXG4gICAgICAgICAgaWYgKGRvdDIgPiAwKSB7XHJcbiAgICAgICAgICAgIGluZGV4ID0gbnVtQWRkZWRDbGlwVmVydGljZXMgKiAzO1xyXG4gICAgICAgICAgICBudW1BZGRlZENsaXBWZXJ0aWNlcysrO1xyXG4gICAgICAgICAgICB0aGlzLmNsaXBWZXJ0aWNlczJbaW5kZXhdID0geDI7XHJcbiAgICAgICAgICAgIHRoaXMuY2xpcFZlcnRpY2VzMltpbmRleCArIDFdID0geTI7XHJcbiAgICAgICAgICAgIHRoaXMuY2xpcFZlcnRpY2VzMltpbmRleCArIDJdID0gejI7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpbmRleCA9IG51bUFkZGVkQ2xpcFZlcnRpY2VzICogMztcclxuICAgICAgICAgICAgbnVtQWRkZWRDbGlwVmVydGljZXMrKztcclxuICAgICAgICAgICAgdCA9IGRvdDEgLyAoZG90MSAtIGRvdDIpO1xyXG4gICAgICAgICAgICB0aGlzLmNsaXBWZXJ0aWNlczJbaW5kZXhdID0geDEgKyAoeDIgLSB4MSkgKiB0O1xyXG4gICAgICAgICAgICB0aGlzLmNsaXBWZXJ0aWNlczJbaW5kZXggKyAxXSA9IHkxICsgKHkyIC0geTEpICogdDtcclxuICAgICAgICAgICAgdGhpcy5jbGlwVmVydGljZXMyW2luZGV4ICsgMl0gPSB6MSArICh6MiAtIHoxKSAqIHQ7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGlmIChkb3QyID4gMCkge1xyXG4gICAgICAgICAgICBpbmRleCA9IG51bUFkZGVkQ2xpcFZlcnRpY2VzICogMztcclxuICAgICAgICAgICAgbnVtQWRkZWRDbGlwVmVydGljZXMrKztcclxuICAgICAgICAgICAgdCA9IGRvdDEgLyAoZG90MSAtIGRvdDIpO1xyXG4gICAgICAgICAgICB0aGlzLmNsaXBWZXJ0aWNlczJbaW5kZXhdID0geDEgKyAoeDIgLSB4MSkgKiB0O1xyXG4gICAgICAgICAgICB0aGlzLmNsaXBWZXJ0aWNlczJbaW5kZXggKyAxXSA9IHkxICsgKHkyIC0geTEpICogdDtcclxuICAgICAgICAgICAgdGhpcy5jbGlwVmVydGljZXMyW2luZGV4ICsgMl0gPSB6MSArICh6MiAtIHoxKSAqIHQ7XHJcbiAgICAgICAgICAgIGluZGV4ID0gbnVtQWRkZWRDbGlwVmVydGljZXMgKiAzO1xyXG4gICAgICAgICAgICBudW1BZGRlZENsaXBWZXJ0aWNlcysrO1xyXG4gICAgICAgICAgICB0aGlzLmNsaXBWZXJ0aWNlczJbaW5kZXhdID0geDI7XHJcbiAgICAgICAgICAgIHRoaXMuY2xpcFZlcnRpY2VzMltpbmRleCArIDFdID0geTI7XHJcbiAgICAgICAgICAgIHRoaXMuY2xpcFZlcnRpY2VzMltpbmRleCArIDJdID0gejI7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHgxID0geDI7XHJcbiAgICAgICAgeTEgPSB5MjtcclxuICAgICAgICB6MSA9IHoyO1xyXG4gICAgICAgIGRvdDEgPSBkb3QyO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBudW1DbGlwVmVydGljZXMgPSBudW1BZGRlZENsaXBWZXJ0aWNlcztcclxuICAgICAgaWYgKG51bUNsaXBWZXJ0aWNlcyA9PSAwKSByZXR1cm47XHJcbiAgICAgIG51bUFkZGVkQ2xpcFZlcnRpY2VzID0gMDtcclxuICAgICAgaW5kZXggPSAobnVtQ2xpcFZlcnRpY2VzIC0gMSkgKiAzO1xyXG4gICAgICB4MSA9IHRoaXMuY2xpcFZlcnRpY2VzMltpbmRleF07XHJcbiAgICAgIHkxID0gdGhpcy5jbGlwVmVydGljZXMyW2luZGV4ICsgMV07XHJcbiAgICAgIHoxID0gdGhpcy5jbGlwVmVydGljZXMyW2luZGV4ICsgMl07XHJcbiAgICAgIGRvdDEgPSAoeDEgLSBjeCArIHMyeCkgKiAtbjJ4ICsgKHkxIC0gY3kgKyBzMnkpICogLW4yeSArICh6MSAtIGN6ICsgczJ6KSAqIC1uMno7XHJcblxyXG4gICAgICAvL2kgPSBudW1DbGlwVmVydGljZXM7XHJcbiAgICAgIC8vd2hpbGUoaS0tKXtcclxuICAgICAgZm9yIChpID0gMDsgaSA8IG51bUNsaXBWZXJ0aWNlczsgaSsrKSB7XHJcbiAgICAgICAgaW5kZXggPSBpICogMztcclxuICAgICAgICB4MiA9IHRoaXMuY2xpcFZlcnRpY2VzMltpbmRleF07XHJcbiAgICAgICAgeTIgPSB0aGlzLmNsaXBWZXJ0aWNlczJbaW5kZXggKyAxXTtcclxuICAgICAgICB6MiA9IHRoaXMuY2xpcFZlcnRpY2VzMltpbmRleCArIDJdO1xyXG4gICAgICAgIGRvdDIgPSAoeDIgLSBjeCArIHMyeCkgKiAtbjJ4ICsgKHkyIC0gY3kgKyBzMnkpICogLW4yeSArICh6MiAtIGN6ICsgczJ6KSAqIC1uMno7XHJcbiAgICAgICAgaWYgKGRvdDEgPiAwKSB7XHJcbiAgICAgICAgICBpZiAoZG90MiA+IDApIHtcclxuICAgICAgICAgICAgaW5kZXggPSBudW1BZGRlZENsaXBWZXJ0aWNlcyAqIDM7XHJcbiAgICAgICAgICAgIG51bUFkZGVkQ2xpcFZlcnRpY2VzKys7XHJcbiAgICAgICAgICAgIHRoaXMuY2xpcFZlcnRpY2VzMVtpbmRleF0gPSB4MjtcclxuICAgICAgICAgICAgdGhpcy5jbGlwVmVydGljZXMxW2luZGV4ICsgMV0gPSB5MjtcclxuICAgICAgICAgICAgdGhpcy5jbGlwVmVydGljZXMxW2luZGV4ICsgMl0gPSB6MjtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGluZGV4ID0gbnVtQWRkZWRDbGlwVmVydGljZXMgKiAzO1xyXG4gICAgICAgICAgICBudW1BZGRlZENsaXBWZXJ0aWNlcysrO1xyXG4gICAgICAgICAgICB0ID0gZG90MSAvIChkb3QxIC0gZG90Mik7XHJcbiAgICAgICAgICAgIHRoaXMuY2xpcFZlcnRpY2VzMVtpbmRleF0gPSB4MSArICh4MiAtIHgxKSAqIHQ7XHJcbiAgICAgICAgICAgIHRoaXMuY2xpcFZlcnRpY2VzMVtpbmRleCArIDFdID0geTEgKyAoeTIgLSB5MSkgKiB0O1xyXG4gICAgICAgICAgICB0aGlzLmNsaXBWZXJ0aWNlczFbaW5kZXggKyAyXSA9IHoxICsgKHoyIC0gejEpICogdDtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgaWYgKGRvdDIgPiAwKSB7XHJcbiAgICAgICAgICAgIGluZGV4ID0gbnVtQWRkZWRDbGlwVmVydGljZXMgKiAzO1xyXG4gICAgICAgICAgICBudW1BZGRlZENsaXBWZXJ0aWNlcysrO1xyXG4gICAgICAgICAgICB0ID0gZG90MSAvIChkb3QxIC0gZG90Mik7XHJcbiAgICAgICAgICAgIHRoaXMuY2xpcFZlcnRpY2VzMVtpbmRleF0gPSB4MSArICh4MiAtIHgxKSAqIHQ7XHJcbiAgICAgICAgICAgIHRoaXMuY2xpcFZlcnRpY2VzMVtpbmRleCArIDFdID0geTEgKyAoeTIgLSB5MSkgKiB0O1xyXG4gICAgICAgICAgICB0aGlzLmNsaXBWZXJ0aWNlczFbaW5kZXggKyAyXSA9IHoxICsgKHoyIC0gejEpICogdDtcclxuICAgICAgICAgICAgaW5kZXggPSBudW1BZGRlZENsaXBWZXJ0aWNlcyAqIDM7XHJcbiAgICAgICAgICAgIG51bUFkZGVkQ2xpcFZlcnRpY2VzKys7XHJcbiAgICAgICAgICAgIHRoaXMuY2xpcFZlcnRpY2VzMVtpbmRleF0gPSB4MjtcclxuICAgICAgICAgICAgdGhpcy5jbGlwVmVydGljZXMxW2luZGV4ICsgMV0gPSB5MjtcclxuICAgICAgICAgICAgdGhpcy5jbGlwVmVydGljZXMxW2luZGV4ICsgMl0gPSB6MjtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgeDEgPSB4MjtcclxuICAgICAgICB5MSA9IHkyO1xyXG4gICAgICAgIHoxID0gejI7XHJcbiAgICAgICAgZG90MSA9IGRvdDI7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIG51bUNsaXBWZXJ0aWNlcyA9IG51bUFkZGVkQ2xpcFZlcnRpY2VzO1xyXG4gICAgICBpZiAoc3dhcCkge1xyXG4gICAgICAgIHZhciB0YiA9IGIxO1xyXG4gICAgICAgIGIxID0gYjI7XHJcbiAgICAgICAgYjIgPSB0YjtcclxuICAgICAgfVxyXG4gICAgICBpZiAobnVtQ2xpcFZlcnRpY2VzID09IDApIHJldHVybjtcclxuICAgICAgdmFyIGZsaXBwZWQgPSBiMSAhPSBzaGFwZTE7XHJcbiAgICAgIGlmIChudW1DbGlwVmVydGljZXMgPiA0KSB7XHJcbiAgICAgICAgeDEgPSAocTF4ICsgcTJ4ICsgcTN4ICsgcTR4KSAqIDAuMjU7XHJcbiAgICAgICAgeTEgPSAocTF5ICsgcTJ5ICsgcTN5ICsgcTR5KSAqIDAuMjU7XHJcbiAgICAgICAgejEgPSAocTF6ICsgcTJ6ICsgcTN6ICsgcTR6KSAqIDAuMjU7XHJcbiAgICAgICAgbjF4ID0gcTF4IC0geDE7XHJcbiAgICAgICAgbjF5ID0gcTF5IC0geTE7XHJcbiAgICAgICAgbjF6ID0gcTF6IC0gejE7XHJcbiAgICAgICAgbjJ4ID0gcTJ4IC0geDE7XHJcbiAgICAgICAgbjJ5ID0gcTJ5IC0geTE7XHJcbiAgICAgICAgbjJ6ID0gcTJ6IC0gejE7XHJcbiAgICAgICAgdmFyIGluZGV4MSA9IDA7XHJcbiAgICAgICAgdmFyIGluZGV4MiA9IDA7XHJcbiAgICAgICAgdmFyIGluZGV4MyA9IDA7XHJcbiAgICAgICAgdmFyIGluZGV4NCA9IDA7XHJcbiAgICAgICAgdmFyIG1heERvdCA9IC10aGlzLklORjtcclxuICAgICAgICBtaW5Eb3QgPSB0aGlzLklORjtcclxuXHJcbiAgICAgICAgLy9pID0gbnVtQ2xpcFZlcnRpY2VzO1xyXG4gICAgICAgIC8vd2hpbGUoaS0tKXtcclxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbnVtQ2xpcFZlcnRpY2VzOyBpKyspIHtcclxuICAgICAgICAgIHRoaXMudXNlZFtpXSA9IGZhbHNlO1xyXG4gICAgICAgICAgaW5kZXggPSBpICogMztcclxuICAgICAgICAgIHgxID0gdGhpcy5jbGlwVmVydGljZXMxW2luZGV4XTtcclxuICAgICAgICAgIHkxID0gdGhpcy5jbGlwVmVydGljZXMxW2luZGV4ICsgMV07XHJcbiAgICAgICAgICB6MSA9IHRoaXMuY2xpcFZlcnRpY2VzMVtpbmRleCArIDJdO1xyXG4gICAgICAgICAgZG90ID0geDEgKiBuMXggKyB5MSAqIG4xeSArIHoxICogbjF6O1xyXG4gICAgICAgICAgaWYgKGRvdCA8IG1pbkRvdCkge1xyXG4gICAgICAgICAgICBtaW5Eb3QgPSBkb3Q7XHJcbiAgICAgICAgICAgIGluZGV4MSA9IGk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBpZiAoZG90ID4gbWF4RG90KSB7XHJcbiAgICAgICAgICAgIG1heERvdCA9IGRvdDtcclxuICAgICAgICAgICAgaW5kZXgzID0gaTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMudXNlZFtpbmRleDFdID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLnVzZWRbaW5kZXgzXSA9IHRydWU7XHJcbiAgICAgICAgbWF4RG90ID0gLXRoaXMuSU5GO1xyXG4gICAgICAgIG1pbkRvdCA9IHRoaXMuSU5GO1xyXG5cclxuICAgICAgICAvL2kgPSBudW1DbGlwVmVydGljZXM7XHJcbiAgICAgICAgLy93aGlsZShpLS0pe1xyXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBudW1DbGlwVmVydGljZXM7IGkrKykge1xyXG4gICAgICAgICAgaWYgKHRoaXMudXNlZFtpXSkgY29udGludWU7XHJcbiAgICAgICAgICBpbmRleCA9IGkgKiAzO1xyXG4gICAgICAgICAgeDEgPSB0aGlzLmNsaXBWZXJ0aWNlczFbaW5kZXhdO1xyXG4gICAgICAgICAgeTEgPSB0aGlzLmNsaXBWZXJ0aWNlczFbaW5kZXggKyAxXTtcclxuICAgICAgICAgIHoxID0gdGhpcy5jbGlwVmVydGljZXMxW2luZGV4ICsgMl07XHJcbiAgICAgICAgICBkb3QgPSB4MSAqIG4yeCArIHkxICogbjJ5ICsgejEgKiBuMno7XHJcbiAgICAgICAgICBpZiAoZG90IDwgbWluRG90KSB7XHJcbiAgICAgICAgICAgIG1pbkRvdCA9IGRvdDtcclxuICAgICAgICAgICAgaW5kZXgyID0gaTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmIChkb3QgPiBtYXhEb3QpIHtcclxuICAgICAgICAgICAgbWF4RG90ID0gZG90O1xyXG4gICAgICAgICAgICBpbmRleDQgPSBpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaW5kZXggPSBpbmRleDEgKiAzO1xyXG4gICAgICAgIHgxID0gdGhpcy5jbGlwVmVydGljZXMxW2luZGV4XTtcclxuICAgICAgICB5MSA9IHRoaXMuY2xpcFZlcnRpY2VzMVtpbmRleCArIDFdO1xyXG4gICAgICAgIHoxID0gdGhpcy5jbGlwVmVydGljZXMxW2luZGV4ICsgMl07XHJcbiAgICAgICAgZG90ID0gKHgxIC0gY3gpICogbnggKyAoeTEgLSBjeSkgKiBueSArICh6MSAtIGN6KSAqIG56O1xyXG4gICAgICAgIGlmIChkb3QgPCAwKSBtYW5pZm9sZC5hZGRQb2ludCh4MSwgeTEsIHoxLCBueCwgbnksIG56LCBkb3QsIGZsaXBwZWQpO1xyXG5cclxuICAgICAgICBpbmRleCA9IGluZGV4MiAqIDM7XHJcbiAgICAgICAgeDEgPSB0aGlzLmNsaXBWZXJ0aWNlczFbaW5kZXhdO1xyXG4gICAgICAgIHkxID0gdGhpcy5jbGlwVmVydGljZXMxW2luZGV4ICsgMV07XHJcbiAgICAgICAgejEgPSB0aGlzLmNsaXBWZXJ0aWNlczFbaW5kZXggKyAyXTtcclxuICAgICAgICBkb3QgPSAoeDEgLSBjeCkgKiBueCArICh5MSAtIGN5KSAqIG55ICsgKHoxIC0gY3opICogbno7XHJcbiAgICAgICAgaWYgKGRvdCA8IDApIG1hbmlmb2xkLmFkZFBvaW50KHgxLCB5MSwgejEsIG54LCBueSwgbnosIGRvdCwgZmxpcHBlZCk7XHJcblxyXG4gICAgICAgIGluZGV4ID0gaW5kZXgzICogMztcclxuICAgICAgICB4MSA9IHRoaXMuY2xpcFZlcnRpY2VzMVtpbmRleF07XHJcbiAgICAgICAgeTEgPSB0aGlzLmNsaXBWZXJ0aWNlczFbaW5kZXggKyAxXTtcclxuICAgICAgICB6MSA9IHRoaXMuY2xpcFZlcnRpY2VzMVtpbmRleCArIDJdO1xyXG4gICAgICAgIGRvdCA9ICh4MSAtIGN4KSAqIG54ICsgKHkxIC0gY3kpICogbnkgKyAoejEgLSBjeikgKiBuejtcclxuICAgICAgICBpZiAoZG90IDwgMCkgbWFuaWZvbGQuYWRkUG9pbnQoeDEsIHkxLCB6MSwgbngsIG55LCBueiwgZG90LCBmbGlwcGVkKTtcclxuXHJcbiAgICAgICAgaW5kZXggPSBpbmRleDQgKiAzO1xyXG4gICAgICAgIHgxID0gdGhpcy5jbGlwVmVydGljZXMxW2luZGV4XTtcclxuICAgICAgICB5MSA9IHRoaXMuY2xpcFZlcnRpY2VzMVtpbmRleCArIDFdO1xyXG4gICAgICAgIHoxID0gdGhpcy5jbGlwVmVydGljZXMxW2luZGV4ICsgMl07XHJcbiAgICAgICAgZG90ID0gKHgxIC0gY3gpICogbnggKyAoeTEgLSBjeSkgKiBueSArICh6MSAtIGN6KSAqIG56O1xyXG4gICAgICAgIGlmIChkb3QgPCAwKSBtYW5pZm9sZC5hZGRQb2ludCh4MSwgeTEsIHoxLCBueCwgbnksIG56LCBkb3QsIGZsaXBwZWQpO1xyXG5cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAvL2kgPSBudW1DbGlwVmVydGljZXM7XHJcbiAgICAgICAgLy93aGlsZShpLS0pe1xyXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBudW1DbGlwVmVydGljZXM7IGkrKykge1xyXG4gICAgICAgICAgaW5kZXggPSBpICogMztcclxuICAgICAgICAgIHgxID0gdGhpcy5jbGlwVmVydGljZXMxW2luZGV4XTtcclxuICAgICAgICAgIHkxID0gdGhpcy5jbGlwVmVydGljZXMxW2luZGV4ICsgMV07XHJcbiAgICAgICAgICB6MSA9IHRoaXMuY2xpcFZlcnRpY2VzMVtpbmRleCArIDJdO1xyXG4gICAgICAgICAgZG90ID0gKHgxIC0gY3gpICogbnggKyAoeTEgLSBjeSkgKiBueSArICh6MSAtIGN6KSAqIG56O1xyXG4gICAgICAgICAgaWYgKGRvdCA8IDApIG1hbmlmb2xkLmFkZFBvaW50KHgxLCB5MSwgejEsIG54LCBueSwgbnosIGRvdCwgZmxpcHBlZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICB9KTtcclxuXHJcbiAgZnVuY3Rpb24gQm94Q3lsaW5kZXJDb2xsaXNpb25EZXRlY3RvcihmbGlwKSB7XHJcblxyXG4gICAgQ29sbGlzaW9uRGV0ZWN0b3IuY2FsbCh0aGlzKTtcclxuICAgIHRoaXMuZmxpcCA9IGZsaXA7XHJcblxyXG4gIH1cclxuICBCb3hDeWxpbmRlckNvbGxpc2lvbkRldGVjdG9yLnByb3RvdHlwZSA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmNyZWF0ZShDb2xsaXNpb25EZXRlY3Rvci5wcm90b3R5cGUpLCB7XHJcblxyXG4gICAgY29uc3RydWN0b3I6IEJveEN5bGluZGVyQ29sbGlzaW9uRGV0ZWN0b3IsXHJcblxyXG4gICAgZ2V0U2VwOiBmdW5jdGlvbiAoYzEsIGMyLCBzZXAsIHBvcywgZGVwKSB7XHJcblxyXG4gICAgICB2YXIgdDF4O1xyXG4gICAgICB2YXIgdDF5O1xyXG4gICAgICB2YXIgdDF6O1xyXG4gICAgICB2YXIgdDJ4O1xyXG4gICAgICB2YXIgdDJ5O1xyXG4gICAgICB2YXIgdDJ6O1xyXG4gICAgICB2YXIgc3VwID0gbmV3IFZlYzMoKTtcclxuICAgICAgdmFyIGxlbjtcclxuICAgICAgdmFyIHAxeDtcclxuICAgICAgdmFyIHAxeTtcclxuICAgICAgdmFyIHAxejtcclxuICAgICAgdmFyIHAyeDtcclxuICAgICAgdmFyIHAyeTtcclxuICAgICAgdmFyIHAyejtcclxuICAgICAgdmFyIHYwMXggPSBjMS5wb3NpdGlvbi54O1xyXG4gICAgICB2YXIgdjAxeSA9IGMxLnBvc2l0aW9uLnk7XHJcbiAgICAgIHZhciB2MDF6ID0gYzEucG9zaXRpb24uejtcclxuICAgICAgdmFyIHYwMnggPSBjMi5wb3NpdGlvbi54O1xyXG4gICAgICB2YXIgdjAyeSA9IGMyLnBvc2l0aW9uLnk7XHJcbiAgICAgIHZhciB2MDJ6ID0gYzIucG9zaXRpb24uejtcclxuICAgICAgdmFyIHYweCA9IHYwMnggLSB2MDF4O1xyXG4gICAgICB2YXIgdjB5ID0gdjAyeSAtIHYwMXk7XHJcbiAgICAgIHZhciB2MHogPSB2MDJ6IC0gdjAxejtcclxuICAgICAgaWYgKHYweCAqIHYweCArIHYweSAqIHYweSArIHYweiAqIHYweiA9PSAwKSB2MHkgPSAwLjAwMTtcclxuICAgICAgdmFyIG54ID0gLXYweDtcclxuICAgICAgdmFyIG55ID0gLXYweTtcclxuICAgICAgdmFyIG56ID0gLXYwejtcclxuICAgICAgdGhpcy5zdXBwb3J0UG9pbnRCKGMxLCAtbngsIC1ueSwgLW56LCBzdXApO1xyXG4gICAgICB2YXIgdjExeCA9IHN1cC54O1xyXG4gICAgICB2YXIgdjExeSA9IHN1cC55O1xyXG4gICAgICB2YXIgdjExeiA9IHN1cC56O1xyXG4gICAgICB0aGlzLnN1cHBvcnRQb2ludEMoYzIsIG54LCBueSwgbnosIHN1cCk7XHJcbiAgICAgIHZhciB2MTJ4ID0gc3VwLng7XHJcbiAgICAgIHZhciB2MTJ5ID0gc3VwLnk7XHJcbiAgICAgIHZhciB2MTJ6ID0gc3VwLno7XHJcbiAgICAgIHZhciB2MXggPSB2MTJ4IC0gdjExeDtcclxuICAgICAgdmFyIHYxeSA9IHYxMnkgLSB2MTF5O1xyXG4gICAgICB2YXIgdjF6ID0gdjEyeiAtIHYxMXo7XHJcbiAgICAgIGlmICh2MXggKiBueCArIHYxeSAqIG55ICsgdjF6ICogbnogPD0gMCkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgICBueCA9IHYxeSAqIHYweiAtIHYxeiAqIHYweTtcclxuICAgICAgbnkgPSB2MXogKiB2MHggLSB2MXggKiB2MHo7XHJcbiAgICAgIG56ID0gdjF4ICogdjB5IC0gdjF5ICogdjB4O1xyXG4gICAgICBpZiAobnggKiBueCArIG55ICogbnkgKyBueiAqIG56ID09IDApIHtcclxuICAgICAgICBzZXAuc2V0KHYxeCAtIHYweCwgdjF5IC0gdjB5LCB2MXogLSB2MHopLm5vcm1hbGl6ZSgpO1xyXG4gICAgICAgIHBvcy5zZXQoKHYxMXggKyB2MTJ4KSAqIDAuNSwgKHYxMXkgKyB2MTJ5KSAqIDAuNSwgKHYxMXogKyB2MTJ6KSAqIDAuNSk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgIH1cclxuICAgICAgdGhpcy5zdXBwb3J0UG9pbnRCKGMxLCAtbngsIC1ueSwgLW56LCBzdXApO1xyXG4gICAgICB2YXIgdjIxeCA9IHN1cC54O1xyXG4gICAgICB2YXIgdjIxeSA9IHN1cC55O1xyXG4gICAgICB2YXIgdjIxeiA9IHN1cC56O1xyXG4gICAgICB0aGlzLnN1cHBvcnRQb2ludEMoYzIsIG54LCBueSwgbnosIHN1cCk7XHJcbiAgICAgIHZhciB2MjJ4ID0gc3VwLng7XHJcbiAgICAgIHZhciB2MjJ5ID0gc3VwLnk7XHJcbiAgICAgIHZhciB2MjJ6ID0gc3VwLno7XHJcbiAgICAgIHZhciB2MnggPSB2MjJ4IC0gdjIxeDtcclxuICAgICAgdmFyIHYyeSA9IHYyMnkgLSB2MjF5O1xyXG4gICAgICB2YXIgdjJ6ID0gdjIyeiAtIHYyMXo7XHJcbiAgICAgIGlmICh2MnggKiBueCArIHYyeSAqIG55ICsgdjJ6ICogbnogPD0gMCkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgICB0MXggPSB2MXggLSB2MHg7XHJcbiAgICAgIHQxeSA9IHYxeSAtIHYweTtcclxuICAgICAgdDF6ID0gdjF6IC0gdjB6O1xyXG4gICAgICB0MnggPSB2MnggLSB2MHg7XHJcbiAgICAgIHQyeSA9IHYyeSAtIHYweTtcclxuICAgICAgdDJ6ID0gdjJ6IC0gdjB6O1xyXG4gICAgICBueCA9IHQxeSAqIHQyeiAtIHQxeiAqIHQyeTtcclxuICAgICAgbnkgPSB0MXogKiB0MnggLSB0MXggKiB0Mno7XHJcbiAgICAgIG56ID0gdDF4ICogdDJ5IC0gdDF5ICogdDJ4O1xyXG4gICAgICBpZiAobnggKiB2MHggKyBueSAqIHYweSArIG56ICogdjB6ID4gMCkge1xyXG4gICAgICAgIHQxeCA9IHYxeDtcclxuICAgICAgICB0MXkgPSB2MXk7XHJcbiAgICAgICAgdDF6ID0gdjF6O1xyXG4gICAgICAgIHYxeCA9IHYyeDtcclxuICAgICAgICB2MXkgPSB2Mnk7XHJcbiAgICAgICAgdjF6ID0gdjJ6O1xyXG4gICAgICAgIHYyeCA9IHQxeDtcclxuICAgICAgICB2MnkgPSB0MXk7XHJcbiAgICAgICAgdjJ6ID0gdDF6O1xyXG4gICAgICAgIHQxeCA9IHYxMXg7XHJcbiAgICAgICAgdDF5ID0gdjExeTtcclxuICAgICAgICB0MXogPSB2MTF6O1xyXG4gICAgICAgIHYxMXggPSB2MjF4O1xyXG4gICAgICAgIHYxMXkgPSB2MjF5O1xyXG4gICAgICAgIHYxMXogPSB2MjF6O1xyXG4gICAgICAgIHYyMXggPSB0MXg7XHJcbiAgICAgICAgdjIxeSA9IHQxeTtcclxuICAgICAgICB2MjF6ID0gdDF6O1xyXG4gICAgICAgIHQxeCA9IHYxMng7XHJcbiAgICAgICAgdDF5ID0gdjEyeTtcclxuICAgICAgICB0MXogPSB2MTJ6O1xyXG4gICAgICAgIHYxMnggPSB2MjJ4O1xyXG4gICAgICAgIHYxMnkgPSB2MjJ5O1xyXG4gICAgICAgIHYxMnogPSB2MjJ6O1xyXG4gICAgICAgIHYyMnggPSB0MXg7XHJcbiAgICAgICAgdjIyeSA9IHQxeTtcclxuICAgICAgICB2MjJ6ID0gdDF6O1xyXG4gICAgICAgIG54ID0gLW54O1xyXG4gICAgICAgIG55ID0gLW55O1xyXG4gICAgICAgIG56ID0gLW56O1xyXG4gICAgICB9XHJcbiAgICAgIHZhciBpdGVyYXRpb25zID0gMDtcclxuICAgICAgd2hpbGUgKHRydWUpIHtcclxuICAgICAgICBpZiAoKytpdGVyYXRpb25zID4gMTAwKSB7XHJcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc3VwcG9ydFBvaW50QihjMSwgLW54LCAtbnksIC1ueiwgc3VwKTtcclxuICAgICAgICB2YXIgdjMxeCA9IHN1cC54O1xyXG4gICAgICAgIHZhciB2MzF5ID0gc3VwLnk7XHJcbiAgICAgICAgdmFyIHYzMXogPSBzdXAuejtcclxuICAgICAgICB0aGlzLnN1cHBvcnRQb2ludEMoYzIsIG54LCBueSwgbnosIHN1cCk7XHJcbiAgICAgICAgdmFyIHYzMnggPSBzdXAueDtcclxuICAgICAgICB2YXIgdjMyeSA9IHN1cC55O1xyXG4gICAgICAgIHZhciB2MzJ6ID0gc3VwLno7XHJcbiAgICAgICAgdmFyIHYzeCA9IHYzMnggLSB2MzF4O1xyXG4gICAgICAgIHZhciB2M3kgPSB2MzJ5IC0gdjMxeTtcclxuICAgICAgICB2YXIgdjN6ID0gdjMyeiAtIHYzMXo7XHJcbiAgICAgICAgaWYgKHYzeCAqIG54ICsgdjN5ICogbnkgKyB2M3ogKiBueiA8PSAwKSB7XHJcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICgodjF5ICogdjN6IC0gdjF6ICogdjN5KSAqIHYweCArICh2MXogKiB2M3ggLSB2MXggKiB2M3opICogdjB5ICsgKHYxeCAqIHYzeSAtIHYxeSAqIHYzeCkgKiB2MHogPCAwKSB7XHJcbiAgICAgICAgICB2MnggPSB2M3g7XHJcbiAgICAgICAgICB2MnkgPSB2M3k7XHJcbiAgICAgICAgICB2MnogPSB2M3o7XHJcbiAgICAgICAgICB2MjF4ID0gdjMxeDtcclxuICAgICAgICAgIHYyMXkgPSB2MzF5O1xyXG4gICAgICAgICAgdjIxeiA9IHYzMXo7XHJcbiAgICAgICAgICB2MjJ4ID0gdjMyeDtcclxuICAgICAgICAgIHYyMnkgPSB2MzJ5O1xyXG4gICAgICAgICAgdjIyeiA9IHYzMno7XHJcbiAgICAgICAgICB0MXggPSB2MXggLSB2MHg7XHJcbiAgICAgICAgICB0MXkgPSB2MXkgLSB2MHk7XHJcbiAgICAgICAgICB0MXogPSB2MXogLSB2MHo7XHJcbiAgICAgICAgICB0MnggPSB2M3ggLSB2MHg7XHJcbiAgICAgICAgICB0MnkgPSB2M3kgLSB2MHk7XHJcbiAgICAgICAgICB0MnogPSB2M3ogLSB2MHo7XHJcbiAgICAgICAgICBueCA9IHQxeSAqIHQyeiAtIHQxeiAqIHQyeTtcclxuICAgICAgICAgIG55ID0gdDF6ICogdDJ4IC0gdDF4ICogdDJ6O1xyXG4gICAgICAgICAgbnogPSB0MXggKiB0MnkgLSB0MXkgKiB0Mng7XHJcbiAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCh2M3kgKiB2MnogLSB2M3ogKiB2MnkpICogdjB4ICsgKHYzeiAqIHYyeCAtIHYzeCAqIHYyeikgKiB2MHkgKyAodjN4ICogdjJ5IC0gdjN5ICogdjJ4KSAqIHYweiA8IDApIHtcclxuICAgICAgICAgIHYxeCA9IHYzeDtcclxuICAgICAgICAgIHYxeSA9IHYzeTtcclxuICAgICAgICAgIHYxeiA9IHYzejtcclxuICAgICAgICAgIHYxMXggPSB2MzF4O1xyXG4gICAgICAgICAgdjExeSA9IHYzMXk7XHJcbiAgICAgICAgICB2MTF6ID0gdjMxejtcclxuICAgICAgICAgIHYxMnggPSB2MzJ4O1xyXG4gICAgICAgICAgdjEyeSA9IHYzMnk7XHJcbiAgICAgICAgICB2MTJ6ID0gdjMyejtcclxuICAgICAgICAgIHQxeCA9IHYzeCAtIHYweDtcclxuICAgICAgICAgIHQxeSA9IHYzeSAtIHYweTtcclxuICAgICAgICAgIHQxeiA9IHYzeiAtIHYwejtcclxuICAgICAgICAgIHQyeCA9IHYyeCAtIHYweDtcclxuICAgICAgICAgIHQyeSA9IHYyeSAtIHYweTtcclxuICAgICAgICAgIHQyeiA9IHYyeiAtIHYwejtcclxuICAgICAgICAgIG54ID0gdDF5ICogdDJ6IC0gdDF6ICogdDJ5O1xyXG4gICAgICAgICAgbnkgPSB0MXogKiB0MnggLSB0MXggKiB0Mno7XHJcbiAgICAgICAgICBueiA9IHQxeCAqIHQyeSAtIHQxeSAqIHQyeDtcclxuICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgaGl0ID0gZmFsc2U7XHJcbiAgICAgICAgd2hpbGUgKHRydWUpIHtcclxuICAgICAgICAgIHQxeCA9IHYyeCAtIHYxeDtcclxuICAgICAgICAgIHQxeSA9IHYyeSAtIHYxeTtcclxuICAgICAgICAgIHQxeiA9IHYyeiAtIHYxejtcclxuICAgICAgICAgIHQyeCA9IHYzeCAtIHYxeDtcclxuICAgICAgICAgIHQyeSA9IHYzeSAtIHYxeTtcclxuICAgICAgICAgIHQyeiA9IHYzeiAtIHYxejtcclxuICAgICAgICAgIG54ID0gdDF5ICogdDJ6IC0gdDF6ICogdDJ5O1xyXG4gICAgICAgICAgbnkgPSB0MXogKiB0MnggLSB0MXggKiB0Mno7XHJcbiAgICAgICAgICBueiA9IHQxeCAqIHQyeSAtIHQxeSAqIHQyeDtcclxuICAgICAgICAgIGxlbiA9IDEgLyBfTWF0aC5zcXJ0KG54ICogbnggKyBueSAqIG55ICsgbnogKiBueik7XHJcbiAgICAgICAgICBueCAqPSBsZW47XHJcbiAgICAgICAgICBueSAqPSBsZW47XHJcbiAgICAgICAgICBueiAqPSBsZW47XHJcbiAgICAgICAgICBpZiAobnggKiB2MXggKyBueSAqIHYxeSArIG56ICogdjF6ID49IDAgJiYgIWhpdCkge1xyXG4gICAgICAgICAgICB2YXIgYjAgPSAodjF5ICogdjJ6IC0gdjF6ICogdjJ5KSAqIHYzeCArICh2MXogKiB2MnggLSB2MXggKiB2MnopICogdjN5ICsgKHYxeCAqIHYyeSAtIHYxeSAqIHYyeCkgKiB2M3o7XHJcbiAgICAgICAgICAgIHZhciBiMSA9ICh2M3kgKiB2MnogLSB2M3ogKiB2MnkpICogdjB4ICsgKHYzeiAqIHYyeCAtIHYzeCAqIHYyeikgKiB2MHkgKyAodjN4ICogdjJ5IC0gdjN5ICogdjJ4KSAqIHYwejtcclxuICAgICAgICAgICAgdmFyIGIyID0gKHYweSAqIHYxeiAtIHYweiAqIHYxeSkgKiB2M3ggKyAodjB6ICogdjF4IC0gdjB4ICogdjF6KSAqIHYzeSArICh2MHggKiB2MXkgLSB2MHkgKiB2MXgpICogdjN6O1xyXG4gICAgICAgICAgICB2YXIgYjMgPSAodjJ5ICogdjF6IC0gdjJ6ICogdjF5KSAqIHYweCArICh2MnogKiB2MXggLSB2MnggKiB2MXopICogdjB5ICsgKHYyeCAqIHYxeSAtIHYyeSAqIHYxeCkgKiB2MHo7XHJcbiAgICAgICAgICAgIHZhciBzdW0gPSBiMCArIGIxICsgYjIgKyBiMztcclxuICAgICAgICAgICAgaWYgKHN1bSA8PSAwKSB7XHJcbiAgICAgICAgICAgICAgYjAgPSAwO1xyXG4gICAgICAgICAgICAgIGIxID0gKHYyeSAqIHYzeiAtIHYyeiAqIHYzeSkgKiBueCArICh2MnogKiB2M3ggLSB2MnggKiB2M3opICogbnkgKyAodjJ4ICogdjN5IC0gdjJ5ICogdjN4KSAqIG56O1xyXG4gICAgICAgICAgICAgIGIyID0gKHYzeSAqIHYyeiAtIHYzeiAqIHYyeSkgKiBueCArICh2M3ogKiB2MnggLSB2M3ggKiB2MnopICogbnkgKyAodjN4ICogdjJ5IC0gdjN5ICogdjJ4KSAqIG56O1xyXG4gICAgICAgICAgICAgIGIzID0gKHYxeSAqIHYyeiAtIHYxeiAqIHYyeSkgKiBueCArICh2MXogKiB2MnggLSB2MXggKiB2MnopICogbnkgKyAodjF4ICogdjJ5IC0gdjF5ICogdjJ4KSAqIG56O1xyXG4gICAgICAgICAgICAgIHN1bSA9IGIxICsgYjIgKyBiMztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgaW52ID0gMSAvIHN1bTtcclxuICAgICAgICAgICAgcDF4ID0gKHYwMXggKiBiMCArIHYxMXggKiBiMSArIHYyMXggKiBiMiArIHYzMXggKiBiMykgKiBpbnY7XHJcbiAgICAgICAgICAgIHAxeSA9ICh2MDF5ICogYjAgKyB2MTF5ICogYjEgKyB2MjF5ICogYjIgKyB2MzF5ICogYjMpICogaW52O1xyXG4gICAgICAgICAgICBwMXogPSAodjAxeiAqIGIwICsgdjExeiAqIGIxICsgdjIxeiAqIGIyICsgdjMxeiAqIGIzKSAqIGludjtcclxuICAgICAgICAgICAgcDJ4ID0gKHYwMnggKiBiMCArIHYxMnggKiBiMSArIHYyMnggKiBiMiArIHYzMnggKiBiMykgKiBpbnY7XHJcbiAgICAgICAgICAgIHAyeSA9ICh2MDJ5ICogYjAgKyB2MTJ5ICogYjEgKyB2MjJ5ICogYjIgKyB2MzJ5ICogYjMpICogaW52O1xyXG4gICAgICAgICAgICBwMnogPSAodjAyeiAqIGIwICsgdjEyeiAqIGIxICsgdjIyeiAqIGIyICsgdjMyeiAqIGIzKSAqIGludjtcclxuICAgICAgICAgICAgaGl0ID0gdHJ1ZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHRoaXMuc3VwcG9ydFBvaW50QihjMSwgLW54LCAtbnksIC1ueiwgc3VwKTtcclxuICAgICAgICAgIHZhciB2NDF4ID0gc3VwLng7XHJcbiAgICAgICAgICB2YXIgdjQxeSA9IHN1cC55O1xyXG4gICAgICAgICAgdmFyIHY0MXogPSBzdXAuejtcclxuICAgICAgICAgIHRoaXMuc3VwcG9ydFBvaW50QyhjMiwgbngsIG55LCBueiwgc3VwKTtcclxuICAgICAgICAgIHZhciB2NDJ4ID0gc3VwLng7XHJcbiAgICAgICAgICB2YXIgdjQyeSA9IHN1cC55O1xyXG4gICAgICAgICAgdmFyIHY0MnogPSBzdXAuejtcclxuICAgICAgICAgIHZhciB2NHggPSB2NDJ4IC0gdjQxeDtcclxuICAgICAgICAgIHZhciB2NHkgPSB2NDJ5IC0gdjQxeTtcclxuICAgICAgICAgIHZhciB2NHogPSB2NDJ6IC0gdjQxejtcclxuICAgICAgICAgIHZhciBzZXBhcmF0aW9uID0gLSh2NHggKiBueCArIHY0eSAqIG55ICsgdjR6ICogbnopO1xyXG4gICAgICAgICAgaWYgKCh2NHggLSB2M3gpICogbnggKyAodjR5IC0gdjN5KSAqIG55ICsgKHY0eiAtIHYzeikgKiBueiA8PSAwLjAxIHx8IHNlcGFyYXRpb24gPj0gMCkge1xyXG4gICAgICAgICAgICBpZiAoaGl0KSB7XHJcbiAgICAgICAgICAgICAgc2VwLnNldCgtbngsIC1ueSwgLW56KTtcclxuICAgICAgICAgICAgICBwb3Muc2V0KChwMXggKyBwMngpICogMC41LCAocDF5ICsgcDJ5KSAqIDAuNSwgKHAxeiArIHAyeikgKiAwLjUpO1xyXG4gICAgICAgICAgICAgIGRlcC54ID0gc2VwYXJhdGlvbjtcclxuICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgICh2NHkgKiB2MXogLSB2NHogKiB2MXkpICogdjB4ICtcclxuICAgICAgICAgICAgKHY0eiAqIHYxeCAtIHY0eCAqIHYxeikgKiB2MHkgK1xyXG4gICAgICAgICAgICAodjR4ICogdjF5IC0gdjR5ICogdjF4KSAqIHYweiA8IDBcclxuICAgICAgICAgICkge1xyXG4gICAgICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgICAgKHY0eSAqIHYyeiAtIHY0eiAqIHYyeSkgKiB2MHggK1xyXG4gICAgICAgICAgICAgICh2NHogKiB2MnggLSB2NHggKiB2MnopICogdjB5ICtcclxuICAgICAgICAgICAgICAodjR4ICogdjJ5IC0gdjR5ICogdjJ4KSAqIHYweiA8IDBcclxuICAgICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgICAgdjF4ID0gdjR4O1xyXG4gICAgICAgICAgICAgIHYxeSA9IHY0eTtcclxuICAgICAgICAgICAgICB2MXogPSB2NHo7XHJcbiAgICAgICAgICAgICAgdjExeCA9IHY0MXg7XHJcbiAgICAgICAgICAgICAgdjExeSA9IHY0MXk7XHJcbiAgICAgICAgICAgICAgdjExeiA9IHY0MXo7XHJcbiAgICAgICAgICAgICAgdjEyeCA9IHY0Mng7XHJcbiAgICAgICAgICAgICAgdjEyeSA9IHY0Mnk7XHJcbiAgICAgICAgICAgICAgdjEyeiA9IHY0Mno7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgdjN4ID0gdjR4O1xyXG4gICAgICAgICAgICAgIHYzeSA9IHY0eTtcclxuICAgICAgICAgICAgICB2M3ogPSB2NHo7XHJcbiAgICAgICAgICAgICAgdjMxeCA9IHY0MXg7XHJcbiAgICAgICAgICAgICAgdjMxeSA9IHY0MXk7XHJcbiAgICAgICAgICAgICAgdjMxeiA9IHY0MXo7XHJcbiAgICAgICAgICAgICAgdjMyeCA9IHY0Mng7XHJcbiAgICAgICAgICAgICAgdjMyeSA9IHY0Mnk7XHJcbiAgICAgICAgICAgICAgdjMyeiA9IHY0Mno7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmIChcclxuICAgICAgICAgICAgICAodjR5ICogdjN6IC0gdjR6ICogdjN5KSAqIHYweCArXHJcbiAgICAgICAgICAgICAgKHY0eiAqIHYzeCAtIHY0eCAqIHYzeikgKiB2MHkgK1xyXG4gICAgICAgICAgICAgICh2NHggKiB2M3kgLSB2NHkgKiB2M3gpICogdjB6IDwgMFxyXG4gICAgICAgICAgICApIHtcclxuICAgICAgICAgICAgICB2MnggPSB2NHg7XHJcbiAgICAgICAgICAgICAgdjJ5ID0gdjR5O1xyXG4gICAgICAgICAgICAgIHYyeiA9IHY0ejtcclxuICAgICAgICAgICAgICB2MjF4ID0gdjQxeDtcclxuICAgICAgICAgICAgICB2MjF5ID0gdjQxeTtcclxuICAgICAgICAgICAgICB2MjF6ID0gdjQxejtcclxuICAgICAgICAgICAgICB2MjJ4ID0gdjQyeDtcclxuICAgICAgICAgICAgICB2MjJ5ID0gdjQyeTtcclxuICAgICAgICAgICAgICB2MjJ6ID0gdjQyejtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICB2MXggPSB2NHg7XHJcbiAgICAgICAgICAgICAgdjF5ID0gdjR5O1xyXG4gICAgICAgICAgICAgIHYxeiA9IHY0ejtcclxuICAgICAgICAgICAgICB2MTF4ID0gdjQxeDtcclxuICAgICAgICAgICAgICB2MTF5ID0gdjQxeTtcclxuICAgICAgICAgICAgICB2MTF6ID0gdjQxejtcclxuICAgICAgICAgICAgICB2MTJ4ID0gdjQyeDtcclxuICAgICAgICAgICAgICB2MTJ5ID0gdjQyeTtcclxuICAgICAgICAgICAgICB2MTJ6ID0gdjQyejtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICAvL3JldHVybiBmYWxzZTtcclxuICAgIH0sXHJcblxyXG4gICAgc3VwcG9ydFBvaW50QjogZnVuY3Rpb24gKGMsIGR4LCBkeSwgZHosIG91dCkge1xyXG5cclxuICAgICAgdmFyIHJvdCA9IGMucm90YXRpb24uZWxlbWVudHM7XHJcbiAgICAgIHZhciBsZHggPSByb3RbMF0gKiBkeCArIHJvdFszXSAqIGR5ICsgcm90WzZdICogZHo7XHJcbiAgICAgIHZhciBsZHkgPSByb3RbMV0gKiBkeCArIHJvdFs0XSAqIGR5ICsgcm90WzddICogZHo7XHJcbiAgICAgIHZhciBsZHogPSByb3RbMl0gKiBkeCArIHJvdFs1XSAqIGR5ICsgcm90WzhdICogZHo7XHJcbiAgICAgIHZhciB3ID0gYy5oYWxmV2lkdGg7XHJcbiAgICAgIHZhciBoID0gYy5oYWxmSGVpZ2h0O1xyXG4gICAgICB2YXIgZCA9IGMuaGFsZkRlcHRoO1xyXG4gICAgICB2YXIgb3g7XHJcbiAgICAgIHZhciBveTtcclxuICAgICAgdmFyIG96O1xyXG4gICAgICBpZiAobGR4IDwgMCkgb3ggPSAtdztcclxuICAgICAgZWxzZSBveCA9IHc7XHJcbiAgICAgIGlmIChsZHkgPCAwKSBveSA9IC1oO1xyXG4gICAgICBlbHNlIG95ID0gaDtcclxuICAgICAgaWYgKGxkeiA8IDApIG96ID0gLWQ7XHJcbiAgICAgIGVsc2Ugb3ogPSBkO1xyXG4gICAgICBsZHggPSByb3RbMF0gKiBveCArIHJvdFsxXSAqIG95ICsgcm90WzJdICogb3ogKyBjLnBvc2l0aW9uLng7XHJcbiAgICAgIGxkeSA9IHJvdFszXSAqIG94ICsgcm90WzRdICogb3kgKyByb3RbNV0gKiBveiArIGMucG9zaXRpb24ueTtcclxuICAgICAgbGR6ID0gcm90WzZdICogb3ggKyByb3RbN10gKiBveSArIHJvdFs4XSAqIG96ICsgYy5wb3NpdGlvbi56O1xyXG4gICAgICBvdXQuc2V0KGxkeCwgbGR5LCBsZHopO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgc3VwcG9ydFBvaW50QzogZnVuY3Rpb24gKGMsIGR4LCBkeSwgZHosIG91dCkge1xyXG5cclxuICAgICAgdmFyIHJvdCA9IGMucm90YXRpb24uZWxlbWVudHM7XHJcbiAgICAgIHZhciBsZHggPSByb3RbMF0gKiBkeCArIHJvdFszXSAqIGR5ICsgcm90WzZdICogZHo7XHJcbiAgICAgIHZhciBsZHkgPSByb3RbMV0gKiBkeCArIHJvdFs0XSAqIGR5ICsgcm90WzddICogZHo7XHJcbiAgICAgIHZhciBsZHogPSByb3RbMl0gKiBkeCArIHJvdFs1XSAqIGR5ICsgcm90WzhdICogZHo7XHJcbiAgICAgIHZhciByYWR4ID0gbGR4O1xyXG4gICAgICB2YXIgcmFkeiA9IGxkejtcclxuICAgICAgdmFyIGxlbiA9IHJhZHggKiByYWR4ICsgcmFkeiAqIHJhZHo7XHJcbiAgICAgIHZhciByYWQgPSBjLnJhZGl1cztcclxuICAgICAgdmFyIGhoID0gYy5oYWxmSGVpZ2h0O1xyXG4gICAgICB2YXIgb3g7XHJcbiAgICAgIHZhciBveTtcclxuICAgICAgdmFyIG96O1xyXG4gICAgICBpZiAobGVuID09IDApIHtcclxuICAgICAgICBpZiAobGR5IDwgMCkge1xyXG4gICAgICAgICAgb3ggPSByYWQ7XHJcbiAgICAgICAgICBveSA9IC1oaDtcclxuICAgICAgICAgIG96ID0gMDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgb3ggPSByYWQ7XHJcbiAgICAgICAgICBveSA9IGhoO1xyXG4gICAgICAgICAgb3ogPSAwO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBsZW4gPSBjLnJhZGl1cyAvIF9NYXRoLnNxcnQobGVuKTtcclxuICAgICAgICBpZiAobGR5IDwgMCkge1xyXG4gICAgICAgICAgb3ggPSByYWR4ICogbGVuO1xyXG4gICAgICAgICAgb3kgPSAtaGg7XHJcbiAgICAgICAgICBveiA9IHJhZHogKiBsZW47XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIG94ID0gcmFkeCAqIGxlbjtcclxuICAgICAgICAgIG95ID0gaGg7XHJcbiAgICAgICAgICBveiA9IHJhZHogKiBsZW47XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGxkeCA9IHJvdFswXSAqIG94ICsgcm90WzFdICogb3kgKyByb3RbMl0gKiBveiArIGMucG9zaXRpb24ueDtcclxuICAgICAgbGR5ID0gcm90WzNdICogb3ggKyByb3RbNF0gKiBveSArIHJvdFs1XSAqIG96ICsgYy5wb3NpdGlvbi55O1xyXG4gICAgICBsZHogPSByb3RbNl0gKiBveCArIHJvdFs3XSAqIG95ICsgcm90WzhdICogb3ogKyBjLnBvc2l0aW9uLno7XHJcbiAgICAgIG91dC5zZXQobGR4LCBsZHksIGxkeik7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBkZXRlY3RDb2xsaXNpb246IGZ1bmN0aW9uIChzaGFwZTEsIHNoYXBlMiwgbWFuaWZvbGQpIHtcclxuXHJcbiAgICAgIHZhciBiO1xyXG4gICAgICB2YXIgYztcclxuICAgICAgaWYgKHRoaXMuZmxpcCkge1xyXG4gICAgICAgIGIgPSBzaGFwZTI7XHJcbiAgICAgICAgYyA9IHNoYXBlMTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBiID0gc2hhcGUxO1xyXG4gICAgICAgIGMgPSBzaGFwZTI7XHJcbiAgICAgIH1cclxuICAgICAgdmFyIHNlcCA9IG5ldyBWZWMzKCk7XHJcbiAgICAgIHZhciBwb3MgPSBuZXcgVmVjMygpO1xyXG4gICAgICB2YXIgZGVwID0gbmV3IFZlYzMoKTtcclxuXHJcbiAgICAgIGlmICghdGhpcy5nZXRTZXAoYiwgYywgc2VwLCBwb3MsIGRlcCkpIHJldHVybjtcclxuICAgICAgdmFyIHBieCA9IGIucG9zaXRpb24ueDtcclxuICAgICAgdmFyIHBieSA9IGIucG9zaXRpb24ueTtcclxuICAgICAgdmFyIHBieiA9IGIucG9zaXRpb24uejtcclxuICAgICAgdmFyIHBjeCA9IGMucG9zaXRpb24ueDtcclxuICAgICAgdmFyIHBjeSA9IGMucG9zaXRpb24ueTtcclxuICAgICAgdmFyIHBjeiA9IGMucG9zaXRpb24uejtcclxuICAgICAgdmFyIGJ3ID0gYi5oYWxmV2lkdGg7XHJcbiAgICAgIHZhciBiaCA9IGIuaGFsZkhlaWdodDtcclxuICAgICAgdmFyIGJkID0gYi5oYWxmRGVwdGg7XHJcbiAgICAgIHZhciBjaCA9IGMuaGFsZkhlaWdodDtcclxuICAgICAgdmFyIHIgPSBjLnJhZGl1cztcclxuXHJcbiAgICAgIHZhciBEID0gYi5kaW1lbnRpb25zO1xyXG5cclxuICAgICAgdmFyIG53eCA9IERbMF07Ly9iLm5vcm1hbERpcmVjdGlvbldpZHRoLng7XHJcbiAgICAgIHZhciBud3kgPSBEWzFdOy8vYi5ub3JtYWxEaXJlY3Rpb25XaWR0aC55O1xyXG4gICAgICB2YXIgbnd6ID0gRFsyXTsvL2Iubm9ybWFsRGlyZWN0aW9uV2lkdGguejtcclxuICAgICAgdmFyIG5oeCA9IERbM107Ly9iLm5vcm1hbERpcmVjdGlvbkhlaWdodC54O1xyXG4gICAgICB2YXIgbmh5ID0gRFs0XTsvL2Iubm9ybWFsRGlyZWN0aW9uSGVpZ2h0Lnk7XHJcbiAgICAgIHZhciBuaHogPSBEWzVdOy8vYi5ub3JtYWxEaXJlY3Rpb25IZWlnaHQuejtcclxuICAgICAgdmFyIG5keCA9IERbNl07Ly9iLm5vcm1hbERpcmVjdGlvbkRlcHRoLng7XHJcbiAgICAgIHZhciBuZHkgPSBEWzddOy8vYi5ub3JtYWxEaXJlY3Rpb25EZXB0aC55O1xyXG4gICAgICB2YXIgbmR6ID0gRFs4XTsvL2Iubm9ybWFsRGlyZWN0aW9uRGVwdGguejtcclxuXHJcbiAgICAgIHZhciBkd3ggPSBEWzldOy8vYi5oYWxmRGlyZWN0aW9uV2lkdGgueDtcclxuICAgICAgdmFyIGR3eSA9IERbMTBdOy8vYi5oYWxmRGlyZWN0aW9uV2lkdGgueTtcclxuICAgICAgdmFyIGR3eiA9IERbMTFdOy8vYi5oYWxmRGlyZWN0aW9uV2lkdGguejtcclxuICAgICAgdmFyIGRoeCA9IERbMTJdOy8vYi5oYWxmRGlyZWN0aW9uSGVpZ2h0Lng7XHJcbiAgICAgIHZhciBkaHkgPSBEWzEzXTsvL2IuaGFsZkRpcmVjdGlvbkhlaWdodC55O1xyXG4gICAgICB2YXIgZGh6ID0gRFsxNF07Ly9iLmhhbGZEaXJlY3Rpb25IZWlnaHQuejtcclxuICAgICAgdmFyIGRkeCA9IERbMTVdOy8vYi5oYWxmRGlyZWN0aW9uRGVwdGgueDtcclxuICAgICAgdmFyIGRkeSA9IERbMTZdOy8vYi5oYWxmRGlyZWN0aW9uRGVwdGgueTtcclxuICAgICAgdmFyIGRkeiA9IERbMTddOy8vYi5oYWxmRGlyZWN0aW9uRGVwdGguejtcclxuXHJcbiAgICAgIHZhciBuY3ggPSBjLm5vcm1hbERpcmVjdGlvbi54O1xyXG4gICAgICB2YXIgbmN5ID0gYy5ub3JtYWxEaXJlY3Rpb24ueTtcclxuICAgICAgdmFyIG5jeiA9IGMubm9ybWFsRGlyZWN0aW9uLno7XHJcbiAgICAgIHZhciBkY3ggPSBjLmhhbGZEaXJlY3Rpb24ueDtcclxuICAgICAgdmFyIGRjeSA9IGMuaGFsZkRpcmVjdGlvbi55O1xyXG4gICAgICB2YXIgZGN6ID0gYy5oYWxmRGlyZWN0aW9uLno7XHJcbiAgICAgIHZhciBueCA9IHNlcC54O1xyXG4gICAgICB2YXIgbnkgPSBzZXAueTtcclxuICAgICAgdmFyIG56ID0gc2VwLno7XHJcbiAgICAgIHZhciBkb3R3ID0gbnggKiBud3ggKyBueSAqIG53eSArIG56ICogbnd6O1xyXG4gICAgICB2YXIgZG90aCA9IG54ICogbmh4ICsgbnkgKiBuaHkgKyBueiAqIG5oejtcclxuICAgICAgdmFyIGRvdGQgPSBueCAqIG5keCArIG55ICogbmR5ICsgbnogKiBuZHo7XHJcbiAgICAgIHZhciBkb3RjID0gbnggKiBuY3ggKyBueSAqIG5jeSArIG56ICogbmN6O1xyXG4gICAgICB2YXIgcmlnaHQxID0gZG90dyA+IDA7XHJcbiAgICAgIHZhciByaWdodDIgPSBkb3RoID4gMDtcclxuICAgICAgdmFyIHJpZ2h0MyA9IGRvdGQgPiAwO1xyXG4gICAgICB2YXIgcmlnaHQ0ID0gZG90YyA+IDA7XHJcbiAgICAgIGlmICghcmlnaHQxKSBkb3R3ID0gLWRvdHc7XHJcbiAgICAgIGlmICghcmlnaHQyKSBkb3RoID0gLWRvdGg7XHJcbiAgICAgIGlmICghcmlnaHQzKSBkb3RkID0gLWRvdGQ7XHJcbiAgICAgIGlmICghcmlnaHQ0KSBkb3RjID0gLWRvdGM7XHJcbiAgICAgIHZhciBzdGF0ZSA9IDA7XHJcbiAgICAgIGlmIChkb3RjID4gMC45OTkpIHtcclxuICAgICAgICBpZiAoZG90dyA+IDAuOTk5KSB7XHJcbiAgICAgICAgICBpZiAoZG90dyA+IGRvdGMpIHN0YXRlID0gMTtcclxuICAgICAgICAgIGVsc2Ugc3RhdGUgPSA0O1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZG90aCA+IDAuOTk5KSB7XHJcbiAgICAgICAgICBpZiAoZG90aCA+IGRvdGMpIHN0YXRlID0gMjtcclxuICAgICAgICAgIGVsc2Ugc3RhdGUgPSA0O1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZG90ZCA+IDAuOTk5KSB7XHJcbiAgICAgICAgICBpZiAoZG90ZCA+IGRvdGMpIHN0YXRlID0gMztcclxuICAgICAgICAgIGVsc2Ugc3RhdGUgPSA0O1xyXG4gICAgICAgIH0gZWxzZSBzdGF0ZSA9IDQ7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgaWYgKGRvdHcgPiAwLjk5OSkgc3RhdGUgPSAxO1xyXG4gICAgICAgIGVsc2UgaWYgKGRvdGggPiAwLjk5OSkgc3RhdGUgPSAyO1xyXG4gICAgICAgIGVsc2UgaWYgKGRvdGQgPiAwLjk5OSkgc3RhdGUgPSAzO1xyXG4gICAgICB9XHJcbiAgICAgIHZhciBjYng7XHJcbiAgICAgIHZhciBjYnk7XHJcbiAgICAgIHZhciBjYno7XHJcbiAgICAgIHZhciBjY3g7XHJcbiAgICAgIHZhciBjY3k7XHJcbiAgICAgIHZhciBjY3o7XHJcbiAgICAgIHZhciByMDA7XHJcbiAgICAgIHZhciByMDE7XHJcbiAgICAgIHZhciByMDI7XHJcbiAgICAgIHZhciByMTA7XHJcbiAgICAgIHZhciByMTE7XHJcbiAgICAgIHZhciByMTI7XHJcbiAgICAgIHZhciByMjA7XHJcbiAgICAgIHZhciByMjE7XHJcbiAgICAgIHZhciByMjI7XHJcbiAgICAgIHZhciBweDtcclxuICAgICAgdmFyIHB5O1xyXG4gICAgICB2YXIgcHo7XHJcbiAgICAgIHZhciBwZDtcclxuICAgICAgdmFyIGRvdDtcclxuICAgICAgdmFyIGxlbjtcclxuICAgICAgdmFyIHR4O1xyXG4gICAgICB2YXIgdHk7XHJcbiAgICAgIHZhciB0ejtcclxuICAgICAgdmFyIHRkO1xyXG4gICAgICB2YXIgZHg7XHJcbiAgICAgIHZhciBkeTtcclxuICAgICAgdmFyIGR6O1xyXG4gICAgICB2YXIgZDF4O1xyXG4gICAgICB2YXIgZDF5O1xyXG4gICAgICB2YXIgZDF6O1xyXG4gICAgICB2YXIgZDJ4O1xyXG4gICAgICB2YXIgZDJ5O1xyXG4gICAgICB2YXIgZDJ6O1xyXG4gICAgICB2YXIgc3g7XHJcbiAgICAgIHZhciBzeTtcclxuICAgICAgdmFyIHN6O1xyXG4gICAgICB2YXIgc2Q7XHJcbiAgICAgIHZhciBleDtcclxuICAgICAgdmFyIGV5O1xyXG4gICAgICB2YXIgZXo7XHJcbiAgICAgIHZhciBlZDtcclxuICAgICAgdmFyIGRvdDE7XHJcbiAgICAgIHZhciBkb3QyO1xyXG4gICAgICB2YXIgdDE7XHJcbiAgICAgIHZhciBkaXIxeDtcclxuICAgICAgdmFyIGRpcjF5O1xyXG4gICAgICB2YXIgZGlyMXo7XHJcbiAgICAgIHZhciBkaXIyeDtcclxuICAgICAgdmFyIGRpcjJ5O1xyXG4gICAgICB2YXIgZGlyMno7XHJcbiAgICAgIHZhciBkaXIxbDtcclxuICAgICAgdmFyIGRpcjJsO1xyXG4gICAgICBpZiAoc3RhdGUgPT0gMCkge1xyXG4gICAgICAgIC8vbWFuaWZvbGQuYWRkUG9pbnQocG9zLngscG9zLnkscG9zLnosbngsbnksbnosZGVwLngsYixjLDAsMCxmYWxzZSk7XHJcbiAgICAgICAgbWFuaWZvbGQuYWRkUG9pbnQocG9zLngsIHBvcy55LCBwb3MueiwgbngsIG55LCBueiwgZGVwLngsIHRoaXMuZmxpcCk7XHJcbiAgICAgIH0gZWxzZSBpZiAoc3RhdGUgPT0gNCkge1xyXG4gICAgICAgIGlmIChyaWdodDQpIHtcclxuICAgICAgICAgIGNjeCA9IHBjeCAtIGRjeDtcclxuICAgICAgICAgIGNjeSA9IHBjeSAtIGRjeTtcclxuICAgICAgICAgIGNjeiA9IHBjeiAtIGRjejtcclxuICAgICAgICAgIG54ID0gLW5jeDtcclxuICAgICAgICAgIG55ID0gLW5jeTtcclxuICAgICAgICAgIG56ID0gLW5jejtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgY2N4ID0gcGN4ICsgZGN4O1xyXG4gICAgICAgICAgY2N5ID0gcGN5ICsgZGN5O1xyXG4gICAgICAgICAgY2N6ID0gcGN6ICsgZGN6O1xyXG4gICAgICAgICAgbnggPSBuY3g7XHJcbiAgICAgICAgICBueSA9IG5jeTtcclxuICAgICAgICAgIG56ID0gbmN6O1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgdjF4O1xyXG4gICAgICAgIHZhciB2MXk7XHJcbiAgICAgICAgdmFyIHYxejtcclxuICAgICAgICB2YXIgdjJ4O1xyXG4gICAgICAgIHZhciB2Mnk7XHJcbiAgICAgICAgdmFyIHYyejtcclxuICAgICAgICB2YXIgdjN4O1xyXG4gICAgICAgIHZhciB2M3k7XHJcbiAgICAgICAgdmFyIHYzejtcclxuICAgICAgICB2YXIgdjR4O1xyXG4gICAgICAgIHZhciB2NHk7XHJcbiAgICAgICAgdmFyIHY0ejtcclxuXHJcbiAgICAgICAgZG90ID0gMTtcclxuICAgICAgICBzdGF0ZSA9IDA7XHJcbiAgICAgICAgZG90MSA9IG53eCAqIG54ICsgbnd5ICogbnkgKyBud3ogKiBuejtcclxuICAgICAgICBpZiAoZG90MSA8IGRvdCkge1xyXG4gICAgICAgICAgZG90ID0gZG90MTtcclxuICAgICAgICAgIHN0YXRlID0gMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKC1kb3QxIDwgZG90KSB7XHJcbiAgICAgICAgICBkb3QgPSAtZG90MTtcclxuICAgICAgICAgIHN0YXRlID0gMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZG90MSA9IG5oeCAqIG54ICsgbmh5ICogbnkgKyBuaHogKiBuejtcclxuICAgICAgICBpZiAoZG90MSA8IGRvdCkge1xyXG4gICAgICAgICAgZG90ID0gZG90MTtcclxuICAgICAgICAgIHN0YXRlID0gMjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKC1kb3QxIDwgZG90KSB7XHJcbiAgICAgICAgICBkb3QgPSAtZG90MTtcclxuICAgICAgICAgIHN0YXRlID0gMztcclxuICAgICAgICB9XHJcbiAgICAgICAgZG90MSA9IG5keCAqIG54ICsgbmR5ICogbnkgKyBuZHogKiBuejtcclxuICAgICAgICBpZiAoZG90MSA8IGRvdCkge1xyXG4gICAgICAgICAgZG90ID0gZG90MTtcclxuICAgICAgICAgIHN0YXRlID0gNDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKC1kb3QxIDwgZG90KSB7XHJcbiAgICAgICAgICBkb3QgPSAtZG90MTtcclxuICAgICAgICAgIHN0YXRlID0gNTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHYgPSBiLmVsZW1lbnRzO1xyXG4gICAgICAgIHN3aXRjaCAoc3RhdGUpIHtcclxuICAgICAgICAgIGNhc2UgMDpcclxuICAgICAgICAgICAgLy92PWIudmVydGV4MTtcclxuICAgICAgICAgICAgdjF4ID0gdlswXTsvL3YueDtcclxuICAgICAgICAgICAgdjF5ID0gdlsxXTsvL3YueTtcclxuICAgICAgICAgICAgdjF6ID0gdlsyXTsvL3YuejtcclxuICAgICAgICAgICAgLy92PWIudmVydGV4MztcclxuICAgICAgICAgICAgdjJ4ID0gdls2XTsvL3YueDtcclxuICAgICAgICAgICAgdjJ5ID0gdls3XTsvL3YueTtcclxuICAgICAgICAgICAgdjJ6ID0gdls4XTsvL3YuejtcclxuICAgICAgICAgICAgLy92PWIudmVydGV4NDtcclxuICAgICAgICAgICAgdjN4ID0gdls5XTsvL3YueDtcclxuICAgICAgICAgICAgdjN5ID0gdlsxMF07Ly92Lnk7XHJcbiAgICAgICAgICAgIHYzeiA9IHZbMTFdOy8vdi56O1xyXG4gICAgICAgICAgICAvL3Y9Yi52ZXJ0ZXgyO1xyXG4gICAgICAgICAgICB2NHggPSB2WzNdOy8vdi54O1xyXG4gICAgICAgICAgICB2NHkgPSB2WzRdOy8vdi55O1xyXG4gICAgICAgICAgICB2NHogPSB2WzVdOy8vdi56O1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgICAgLy92PWIudmVydGV4NjtcclxuICAgICAgICAgICAgdjF4ID0gdlsxNV07Ly92Lng7XHJcbiAgICAgICAgICAgIHYxeSA9IHZbMTZdOy8vdi55O1xyXG4gICAgICAgICAgICB2MXogPSB2WzE3XTsvL3YuejtcclxuICAgICAgICAgICAgLy92PWIudmVydGV4ODtcclxuICAgICAgICAgICAgdjJ4ID0gdlsyMV07Ly92Lng7XHJcbiAgICAgICAgICAgIHYyeSA9IHZbMjJdOy8vdi55O1xyXG4gICAgICAgICAgICB2MnogPSB2WzIzXTsvL3YuejtcclxuICAgICAgICAgICAgLy92PWIudmVydGV4NztcclxuICAgICAgICAgICAgdjN4ID0gdlsxOF07Ly92Lng7XHJcbiAgICAgICAgICAgIHYzeSA9IHZbMTldOy8vdi55O1xyXG4gICAgICAgICAgICB2M3ogPSB2WzIwXTsvL3YuejtcclxuICAgICAgICAgICAgLy92PWIudmVydGV4NTtcclxuICAgICAgICAgICAgdjR4ID0gdlsxMl07Ly92Lng7XHJcbiAgICAgICAgICAgIHY0eSA9IHZbMTNdOy8vdi55O1xyXG4gICAgICAgICAgICB2NHogPSB2WzE0XTsvL3YuejtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICAgIC8vdj1iLnZlcnRleDU7XHJcbiAgICAgICAgICAgIHYxeCA9IHZbMTJdOy8vdi54O1xyXG4gICAgICAgICAgICB2MXkgPSB2WzEzXTsvL3YueTtcclxuICAgICAgICAgICAgdjF6ID0gdlsxNF07Ly92Lno7XHJcbiAgICAgICAgICAgIC8vdj1iLnZlcnRleDE7XHJcbiAgICAgICAgICAgIHYyeCA9IHZbMF07Ly92Lng7XHJcbiAgICAgICAgICAgIHYyeSA9IHZbMV07Ly92Lnk7XHJcbiAgICAgICAgICAgIHYyeiA9IHZbMl07Ly92Lno7XHJcbiAgICAgICAgICAgIC8vdj1iLnZlcnRleDI7XHJcbiAgICAgICAgICAgIHYzeCA9IHZbM107Ly92Lng7XHJcbiAgICAgICAgICAgIHYzeSA9IHZbNF07Ly92Lnk7XHJcbiAgICAgICAgICAgIHYzeiA9IHZbNV07Ly92Lno7XHJcbiAgICAgICAgICAgIC8vdj1iLnZlcnRleDY7XHJcbiAgICAgICAgICAgIHY0eCA9IHZbMTVdOy8vdi54O1xyXG4gICAgICAgICAgICB2NHkgPSB2WzE2XTsvL3YueTtcclxuICAgICAgICAgICAgdjR6ID0gdlsxN107Ly92Lno7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgY2FzZSAzOlxyXG4gICAgICAgICAgICAvL3Y9Yi52ZXJ0ZXg4O1xyXG4gICAgICAgICAgICB2MXggPSB2WzIxXTsvL3YueDtcclxuICAgICAgICAgICAgdjF5ID0gdlsyMl07Ly92Lnk7XHJcbiAgICAgICAgICAgIHYxeiA9IHZbMjNdOy8vdi56O1xyXG4gICAgICAgICAgICAvL3Y9Yi52ZXJ0ZXg0O1xyXG4gICAgICAgICAgICB2MnggPSB2WzldOy8vdi54O1xyXG4gICAgICAgICAgICB2MnkgPSB2WzEwXTsvL3YueTtcclxuICAgICAgICAgICAgdjJ6ID0gdlsxMV07Ly92Lno7XHJcbiAgICAgICAgICAgIC8vdj1iLnZlcnRleDM7XHJcbiAgICAgICAgICAgIHYzeCA9IHZbNl07Ly92Lng7XHJcbiAgICAgICAgICAgIHYzeSA9IHZbN107Ly92Lnk7XHJcbiAgICAgICAgICAgIHYzeiA9IHZbOF07Ly92Lno7XHJcbiAgICAgICAgICAgIC8vdj1iLnZlcnRleDc7XHJcbiAgICAgICAgICAgIHY0eCA9IHZbMThdOy8vdi54O1xyXG4gICAgICAgICAgICB2NHkgPSB2WzE5XTsvL3YueTtcclxuICAgICAgICAgICAgdjR6ID0gdlsyMF07Ly92Lno7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgY2FzZSA0OlxyXG4gICAgICAgICAgICAvL3Y9Yi52ZXJ0ZXg1O1xyXG4gICAgICAgICAgICB2MXggPSB2WzEyXTsvL3YueDtcclxuICAgICAgICAgICAgdjF5ID0gdlsxM107Ly92Lnk7XHJcbiAgICAgICAgICAgIHYxeiA9IHZbMTRdOy8vdi56O1xyXG4gICAgICAgICAgICAvL3Y9Yi52ZXJ0ZXg3O1xyXG4gICAgICAgICAgICB2MnggPSB2WzE4XTsvL3YueDtcclxuICAgICAgICAgICAgdjJ5ID0gdlsxOV07Ly92Lnk7XHJcbiAgICAgICAgICAgIHYyeiA9IHZbMjBdOy8vdi56O1xyXG4gICAgICAgICAgICAvL3Y9Yi52ZXJ0ZXgzO1xyXG4gICAgICAgICAgICB2M3ggPSB2WzZdOy8vdi54O1xyXG4gICAgICAgICAgICB2M3kgPSB2WzddOy8vdi55O1xyXG4gICAgICAgICAgICB2M3ogPSB2WzhdOy8vdi56O1xyXG4gICAgICAgICAgICAvL3Y9Yi52ZXJ0ZXgxO1xyXG4gICAgICAgICAgICB2NHggPSB2WzBdOy8vdi54O1xyXG4gICAgICAgICAgICB2NHkgPSB2WzFdOy8vdi55O1xyXG4gICAgICAgICAgICB2NHogPSB2WzJdOy8vdi56O1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIGNhc2UgNTpcclxuICAgICAgICAgICAgLy92PWIudmVydGV4MjtcclxuICAgICAgICAgICAgdjF4ID0gdlszXTsvL3YueDtcclxuICAgICAgICAgICAgdjF5ID0gdls0XTsvL3YueTtcclxuICAgICAgICAgICAgdjF6ID0gdls1XTsvL3YuejtcclxuICAgICAgICAgICAgLy92PWIudmVydGV4NDtcclxuICAgICAgICAgICAgdjJ4ID0gdls5XTsvL3YueDtcclxuICAgICAgICAgICAgdjJ5ID0gdlsxMF07Ly92Lnk7XHJcbiAgICAgICAgICAgIHYyeiA9IHZbMTFdOy8vdi56O1xyXG4gICAgICAgICAgICAvL3Y9Yi52ZXJ0ZXg4O1xyXG4gICAgICAgICAgICB2M3ggPSB2WzIxXTsvL3YueDtcclxuICAgICAgICAgICAgdjN5ID0gdlsyMl07Ly92Lnk7XHJcbiAgICAgICAgICAgIHYzeiA9IHZbMjNdOy8vdi56O1xyXG4gICAgICAgICAgICAvL3Y9Yi52ZXJ0ZXg2O1xyXG4gICAgICAgICAgICB2NHggPSB2WzE1XTsvL3YueDtcclxuICAgICAgICAgICAgdjR5ID0gdlsxNl07Ly92Lnk7XHJcbiAgICAgICAgICAgIHY0eiA9IHZbMTddOy8vdi56O1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgICAgcGQgPSBueCAqICh2MXggLSBjY3gpICsgbnkgKiAodjF5IC0gY2N5KSArIG56ICogKHYxeiAtIGNjeik7XHJcbiAgICAgICAgaWYgKHBkIDw9IDApIG1hbmlmb2xkLmFkZFBvaW50KHYxeCwgdjF5LCB2MXosIC1ueCwgLW55LCAtbnosIHBkLCB0aGlzLmZsaXApO1xyXG4gICAgICAgIHBkID0gbnggKiAodjJ4IC0gY2N4KSArIG55ICogKHYyeSAtIGNjeSkgKyBueiAqICh2MnogLSBjY3opO1xyXG4gICAgICAgIGlmIChwZCA8PSAwKSBtYW5pZm9sZC5hZGRQb2ludCh2MngsIHYyeSwgdjJ6LCAtbngsIC1ueSwgLW56LCBwZCwgdGhpcy5mbGlwKTtcclxuICAgICAgICBwZCA9IG54ICogKHYzeCAtIGNjeCkgKyBueSAqICh2M3kgLSBjY3kpICsgbnogKiAodjN6IC0gY2N6KTtcclxuICAgICAgICBpZiAocGQgPD0gMCkgbWFuaWZvbGQuYWRkUG9pbnQodjN4LCB2M3ksIHYzeiwgLW54LCAtbnksIC1ueiwgcGQsIHRoaXMuZmxpcCk7XHJcbiAgICAgICAgcGQgPSBueCAqICh2NHggLSBjY3gpICsgbnkgKiAodjR5IC0gY2N5KSArIG56ICogKHY0eiAtIGNjeik7XHJcbiAgICAgICAgaWYgKHBkIDw9IDApIG1hbmlmb2xkLmFkZFBvaW50KHY0eCwgdjR5LCB2NHosIC1ueCwgLW55LCAtbnosIHBkLCB0aGlzLmZsaXApO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHN3aXRjaCAoc3RhdGUpIHtcclxuICAgICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgICAgaWYgKHJpZ2h0MSkge1xyXG4gICAgICAgICAgICAgIGNieCA9IHBieCArIGR3eDtcclxuICAgICAgICAgICAgICBjYnkgPSBwYnkgKyBkd3k7XHJcbiAgICAgICAgICAgICAgY2J6ID0gcGJ6ICsgZHd6O1xyXG4gICAgICAgICAgICAgIG54ID0gbnd4O1xyXG4gICAgICAgICAgICAgIG55ID0gbnd5O1xyXG4gICAgICAgICAgICAgIG56ID0gbnd6O1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIGNieCA9IHBieCAtIGR3eDtcclxuICAgICAgICAgICAgICBjYnkgPSBwYnkgLSBkd3k7XHJcbiAgICAgICAgICAgICAgY2J6ID0gcGJ6IC0gZHd6O1xyXG4gICAgICAgICAgICAgIG54ID0gLW53eDtcclxuICAgICAgICAgICAgICBueSA9IC1ud3k7XHJcbiAgICAgICAgICAgICAgbnogPSAtbnd6O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGRpcjF4ID0gbmh4O1xyXG4gICAgICAgICAgICBkaXIxeSA9IG5oeTtcclxuICAgICAgICAgICAgZGlyMXogPSBuaHo7XHJcbiAgICAgICAgICAgIGRpcjFsID0gYmg7XHJcbiAgICAgICAgICAgIGRpcjJ4ID0gbmR4O1xyXG4gICAgICAgICAgICBkaXIyeSA9IG5keTtcclxuICAgICAgICAgICAgZGlyMnogPSBuZHo7XHJcbiAgICAgICAgICAgIGRpcjJsID0gYmQ7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgY2FzZSAyOlxyXG4gICAgICAgICAgICBpZiAocmlnaHQyKSB7XHJcbiAgICAgICAgICAgICAgY2J4ID0gcGJ4ICsgZGh4O1xyXG4gICAgICAgICAgICAgIGNieSA9IHBieSArIGRoeTtcclxuICAgICAgICAgICAgICBjYnogPSBwYnogKyBkaHo7XHJcbiAgICAgICAgICAgICAgbnggPSBuaHg7XHJcbiAgICAgICAgICAgICAgbnkgPSBuaHk7XHJcbiAgICAgICAgICAgICAgbnogPSBuaHo7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgY2J4ID0gcGJ4IC0gZGh4O1xyXG4gICAgICAgICAgICAgIGNieSA9IHBieSAtIGRoeTtcclxuICAgICAgICAgICAgICBjYnogPSBwYnogLSBkaHo7XHJcbiAgICAgICAgICAgICAgbnggPSAtbmh4O1xyXG4gICAgICAgICAgICAgIG55ID0gLW5oeTtcclxuICAgICAgICAgICAgICBueiA9IC1uaHo7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZGlyMXggPSBud3g7XHJcbiAgICAgICAgICAgIGRpcjF5ID0gbnd5O1xyXG4gICAgICAgICAgICBkaXIxeiA9IG53ejtcclxuICAgICAgICAgICAgZGlyMWwgPSBidztcclxuICAgICAgICAgICAgZGlyMnggPSBuZHg7XHJcbiAgICAgICAgICAgIGRpcjJ5ID0gbmR5O1xyXG4gICAgICAgICAgICBkaXIyeiA9IG5kejtcclxuICAgICAgICAgICAgZGlyMmwgPSBiZDtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICBjYXNlIDM6XHJcbiAgICAgICAgICAgIGlmIChyaWdodDMpIHtcclxuICAgICAgICAgICAgICBjYnggPSBwYnggKyBkZHg7XHJcbiAgICAgICAgICAgICAgY2J5ID0gcGJ5ICsgZGR5O1xyXG4gICAgICAgICAgICAgIGNieiA9IHBieiArIGRkejtcclxuICAgICAgICAgICAgICBueCA9IG5keDtcclxuICAgICAgICAgICAgICBueSA9IG5keTtcclxuICAgICAgICAgICAgICBueiA9IG5kejtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBjYnggPSBwYnggLSBkZHg7XHJcbiAgICAgICAgICAgICAgY2J5ID0gcGJ5IC0gZGR5O1xyXG4gICAgICAgICAgICAgIGNieiA9IHBieiAtIGRkejtcclxuICAgICAgICAgICAgICBueCA9IC1uZHg7XHJcbiAgICAgICAgICAgICAgbnkgPSAtbmR5O1xyXG4gICAgICAgICAgICAgIG56ID0gLW5kejtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBkaXIxeCA9IG53eDtcclxuICAgICAgICAgICAgZGlyMXkgPSBud3k7XHJcbiAgICAgICAgICAgIGRpcjF6ID0gbnd6O1xyXG4gICAgICAgICAgICBkaXIxbCA9IGJ3O1xyXG4gICAgICAgICAgICBkaXIyeCA9IG5oeDtcclxuICAgICAgICAgICAgZGlyMnkgPSBuaHk7XHJcbiAgICAgICAgICAgIGRpcjJ6ID0gbmh6O1xyXG4gICAgICAgICAgICBkaXIybCA9IGJoO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgICAgZG90ID0gbnggKiBuY3ggKyBueSAqIG5jeSArIG56ICogbmN6O1xyXG4gICAgICAgIGlmIChkb3QgPCAwKSBsZW4gPSBjaDtcclxuICAgICAgICBlbHNlIGxlbiA9IC1jaDtcclxuICAgICAgICBjY3ggPSBwY3ggKyBsZW4gKiBuY3g7XHJcbiAgICAgICAgY2N5ID0gcGN5ICsgbGVuICogbmN5O1xyXG4gICAgICAgIGNjeiA9IHBjeiArIGxlbiAqIG5jejtcclxuICAgICAgICBpZiAoZG90YyA+PSAwLjk5OTk5OSkge1xyXG4gICAgICAgICAgdHggPSAtbnk7XHJcbiAgICAgICAgICB0eSA9IG56O1xyXG4gICAgICAgICAgdHogPSBueDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdHggPSBueDtcclxuICAgICAgICAgIHR5ID0gbnk7XHJcbiAgICAgICAgICB0eiA9IG56O1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZW4gPSB0eCAqIG5jeCArIHR5ICogbmN5ICsgdHogKiBuY3o7XHJcbiAgICAgICAgZHggPSBsZW4gKiBuY3ggLSB0eDtcclxuICAgICAgICBkeSA9IGxlbiAqIG5jeSAtIHR5O1xyXG4gICAgICAgIGR6ID0gbGVuICogbmN6IC0gdHo7XHJcbiAgICAgICAgbGVuID0gX01hdGguc3FydChkeCAqIGR4ICsgZHkgKiBkeSArIGR6ICogZHopO1xyXG4gICAgICAgIGlmIChsZW4gPT0gMCkgcmV0dXJuO1xyXG4gICAgICAgIGxlbiA9IHIgLyBsZW47XHJcbiAgICAgICAgZHggKj0gbGVuO1xyXG4gICAgICAgIGR5ICo9IGxlbjtcclxuICAgICAgICBkeiAqPSBsZW47XHJcbiAgICAgICAgdHggPSBjY3ggKyBkeDtcclxuICAgICAgICB0eSA9IGNjeSArIGR5O1xyXG4gICAgICAgIHR6ID0gY2N6ICsgZHo7XHJcbiAgICAgICAgaWYgKGRvdCA8IC0wLjk2IHx8IGRvdCA+IDAuOTYpIHtcclxuICAgICAgICAgIHIwMCA9IG5jeCAqIG5jeCAqIDEuNSAtIDAuNTtcclxuICAgICAgICAgIHIwMSA9IG5jeCAqIG5jeSAqIDEuNSAtIG5jeiAqIDAuODY2MDI1NDAzO1xyXG4gICAgICAgICAgcjAyID0gbmN4ICogbmN6ICogMS41ICsgbmN5ICogMC44NjYwMjU0MDM7XHJcbiAgICAgICAgICByMTAgPSBuY3kgKiBuY3ggKiAxLjUgKyBuY3ogKiAwLjg2NjAyNTQwMztcclxuICAgICAgICAgIHIxMSA9IG5jeSAqIG5jeSAqIDEuNSAtIDAuNTtcclxuICAgICAgICAgIHIxMiA9IG5jeSAqIG5jeiAqIDEuNSAtIG5jeCAqIDAuODY2MDI1NDAzO1xyXG4gICAgICAgICAgcjIwID0gbmN6ICogbmN4ICogMS41IC0gbmN5ICogMC44NjYwMjU0MDM7XHJcbiAgICAgICAgICByMjEgPSBuY3ogKiBuY3kgKiAxLjUgKyBuY3ggKiAwLjg2NjAyNTQwMztcclxuICAgICAgICAgIHIyMiA9IG5jeiAqIG5jeiAqIDEuNSAtIDAuNTtcclxuICAgICAgICAgIHB4ID0gdHg7XHJcbiAgICAgICAgICBweSA9IHR5O1xyXG4gICAgICAgICAgcHogPSB0ejtcclxuICAgICAgICAgIHBkID0gbnggKiAocHggLSBjYngpICsgbnkgKiAocHkgLSBjYnkpICsgbnogKiAocHogLSBjYnopO1xyXG4gICAgICAgICAgdHggPSBweCAtIHBkICogbnggLSBjYng7XHJcbiAgICAgICAgICB0eSA9IHB5IC0gcGQgKiBueSAtIGNieTtcclxuICAgICAgICAgIHR6ID0gcHogLSBwZCAqIG56IC0gY2J6O1xyXG4gICAgICAgICAgc2QgPSBkaXIxeCAqIHR4ICsgZGlyMXkgKiB0eSArIGRpcjF6ICogdHo7XHJcbiAgICAgICAgICBlZCA9IGRpcjJ4ICogdHggKyBkaXIyeSAqIHR5ICsgZGlyMnogKiB0ejtcclxuICAgICAgICAgIGlmIChzZCA8IC1kaXIxbCkgc2QgPSAtZGlyMWw7XHJcbiAgICAgICAgICBlbHNlIGlmIChzZCA+IGRpcjFsKSBzZCA9IGRpcjFsO1xyXG4gICAgICAgICAgaWYgKGVkIDwgLWRpcjJsKSBlZCA9IC1kaXIybDtcclxuICAgICAgICAgIGVsc2UgaWYgKGVkID4gZGlyMmwpIGVkID0gZGlyMmw7XHJcbiAgICAgICAgICB0eCA9IHNkICogZGlyMXggKyBlZCAqIGRpcjJ4O1xyXG4gICAgICAgICAgdHkgPSBzZCAqIGRpcjF5ICsgZWQgKiBkaXIyeTtcclxuICAgICAgICAgIHR6ID0gc2QgKiBkaXIxeiArIGVkICogZGlyMno7XHJcbiAgICAgICAgICBweCA9IGNieCArIHR4O1xyXG4gICAgICAgICAgcHkgPSBjYnkgKyB0eTtcclxuICAgICAgICAgIHB6ID0gY2J6ICsgdHo7XHJcbiAgICAgICAgICBtYW5pZm9sZC5hZGRQb2ludChweCwgcHksIHB6LCBueCwgbnksIG56LCBwZCwgdGhpcy5mbGlwKTtcclxuICAgICAgICAgIHB4ID0gZHggKiByMDAgKyBkeSAqIHIwMSArIGR6ICogcjAyO1xyXG4gICAgICAgICAgcHkgPSBkeCAqIHIxMCArIGR5ICogcjExICsgZHogKiByMTI7XHJcbiAgICAgICAgICBweiA9IGR4ICogcjIwICsgZHkgKiByMjEgKyBkeiAqIHIyMjtcclxuICAgICAgICAgIHB4ID0gKGR4ID0gcHgpICsgY2N4O1xyXG4gICAgICAgICAgcHkgPSAoZHkgPSBweSkgKyBjY3k7XHJcbiAgICAgICAgICBweiA9IChkeiA9IHB6KSArIGNjejtcclxuICAgICAgICAgIHBkID0gbnggKiAocHggLSBjYngpICsgbnkgKiAocHkgLSBjYnkpICsgbnogKiAocHogLSBjYnopO1xyXG4gICAgICAgICAgaWYgKHBkIDw9IDApIHtcclxuICAgICAgICAgICAgdHggPSBweCAtIHBkICogbnggLSBjYng7XHJcbiAgICAgICAgICAgIHR5ID0gcHkgLSBwZCAqIG55IC0gY2J5O1xyXG4gICAgICAgICAgICB0eiA9IHB6IC0gcGQgKiBueiAtIGNiejtcclxuICAgICAgICAgICAgc2QgPSBkaXIxeCAqIHR4ICsgZGlyMXkgKiB0eSArIGRpcjF6ICogdHo7XHJcbiAgICAgICAgICAgIGVkID0gZGlyMnggKiB0eCArIGRpcjJ5ICogdHkgKyBkaXIyeiAqIHR6O1xyXG4gICAgICAgICAgICBpZiAoc2QgPCAtZGlyMWwpIHNkID0gLWRpcjFsO1xyXG4gICAgICAgICAgICBlbHNlIGlmIChzZCA+IGRpcjFsKSBzZCA9IGRpcjFsO1xyXG4gICAgICAgICAgICBpZiAoZWQgPCAtZGlyMmwpIGVkID0gLWRpcjJsO1xyXG4gICAgICAgICAgICBlbHNlIGlmIChlZCA+IGRpcjJsKSBlZCA9IGRpcjJsO1xyXG4gICAgICAgICAgICB0eCA9IHNkICogZGlyMXggKyBlZCAqIGRpcjJ4O1xyXG4gICAgICAgICAgICB0eSA9IHNkICogZGlyMXkgKyBlZCAqIGRpcjJ5O1xyXG4gICAgICAgICAgICB0eiA9IHNkICogZGlyMXogKyBlZCAqIGRpcjJ6O1xyXG4gICAgICAgICAgICBweCA9IGNieCArIHR4O1xyXG4gICAgICAgICAgICBweSA9IGNieSArIHR5O1xyXG4gICAgICAgICAgICBweiA9IGNieiArIHR6O1xyXG4gICAgICAgICAgICAvL21hbmlmb2xkLmFkZFBvaW50KHB4LHB5LHB6LG54LG55LG56LHBkLGIsYywyLDAsZmFsc2UpO1xyXG4gICAgICAgICAgICBtYW5pZm9sZC5hZGRQb2ludChweCwgcHksIHB6LCBueCwgbnksIG56LCBwZCwgdGhpcy5mbGlwKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHB4ID0gZHggKiByMDAgKyBkeSAqIHIwMSArIGR6ICogcjAyO1xyXG4gICAgICAgICAgcHkgPSBkeCAqIHIxMCArIGR5ICogcjExICsgZHogKiByMTI7XHJcbiAgICAgICAgICBweiA9IGR4ICogcjIwICsgZHkgKiByMjEgKyBkeiAqIHIyMjtcclxuICAgICAgICAgIHB4ID0gKGR4ID0gcHgpICsgY2N4O1xyXG4gICAgICAgICAgcHkgPSAoZHkgPSBweSkgKyBjY3k7XHJcbiAgICAgICAgICBweiA9IChkeiA9IHB6KSArIGNjejtcclxuICAgICAgICAgIHBkID0gbnggKiAocHggLSBjYngpICsgbnkgKiAocHkgLSBjYnkpICsgbnogKiAocHogLSBjYnopO1xyXG4gICAgICAgICAgaWYgKHBkIDw9IDApIHtcclxuICAgICAgICAgICAgdHggPSBweCAtIHBkICogbnggLSBjYng7XHJcbiAgICAgICAgICAgIHR5ID0gcHkgLSBwZCAqIG55IC0gY2J5O1xyXG4gICAgICAgICAgICB0eiA9IHB6IC0gcGQgKiBueiAtIGNiejtcclxuICAgICAgICAgICAgc2QgPSBkaXIxeCAqIHR4ICsgZGlyMXkgKiB0eSArIGRpcjF6ICogdHo7XHJcbiAgICAgICAgICAgIGVkID0gZGlyMnggKiB0eCArIGRpcjJ5ICogdHkgKyBkaXIyeiAqIHR6O1xyXG4gICAgICAgICAgICBpZiAoc2QgPCAtZGlyMWwpIHNkID0gLWRpcjFsO1xyXG4gICAgICAgICAgICBlbHNlIGlmIChzZCA+IGRpcjFsKSBzZCA9IGRpcjFsO1xyXG4gICAgICAgICAgICBpZiAoZWQgPCAtZGlyMmwpIGVkID0gLWRpcjJsO1xyXG4gICAgICAgICAgICBlbHNlIGlmIChlZCA+IGRpcjJsKSBlZCA9IGRpcjJsO1xyXG4gICAgICAgICAgICB0eCA9IHNkICogZGlyMXggKyBlZCAqIGRpcjJ4O1xyXG4gICAgICAgICAgICB0eSA9IHNkICogZGlyMXkgKyBlZCAqIGRpcjJ5O1xyXG4gICAgICAgICAgICB0eiA9IHNkICogZGlyMXogKyBlZCAqIGRpcjJ6O1xyXG4gICAgICAgICAgICBweCA9IGNieCArIHR4O1xyXG4gICAgICAgICAgICBweSA9IGNieSArIHR5O1xyXG4gICAgICAgICAgICBweiA9IGNieiArIHR6O1xyXG4gICAgICAgICAgICAvL21hbmlmb2xkLmFkZFBvaW50KHB4LHB5LHB6LG54LG55LG56LHBkLGIsYywzLDAsZmFsc2UpO1xyXG4gICAgICAgICAgICBtYW5pZm9sZC5hZGRQb2ludChweCwgcHksIHB6LCBueCwgbnksIG56LCBwZCwgdGhpcy5mbGlwKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgc3ggPSB0eDtcclxuICAgICAgICAgIHN5ID0gdHk7XHJcbiAgICAgICAgICBzeiA9IHR6O1xyXG4gICAgICAgICAgc2QgPSBueCAqIChzeCAtIGNieCkgKyBueSAqIChzeSAtIGNieSkgKyBueiAqIChzeiAtIGNieik7XHJcbiAgICAgICAgICBzeCAtPSBzZCAqIG54O1xyXG4gICAgICAgICAgc3kgLT0gc2QgKiBueTtcclxuICAgICAgICAgIHN6IC09IHNkICogbno7XHJcbiAgICAgICAgICBpZiAoZG90ID4gMCkge1xyXG4gICAgICAgICAgICBleCA9IHR4ICsgZGN4ICogMjtcclxuICAgICAgICAgICAgZXkgPSB0eSArIGRjeSAqIDI7XHJcbiAgICAgICAgICAgIGV6ID0gdHogKyBkY3ogKiAyO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZXggPSB0eCAtIGRjeCAqIDI7XHJcbiAgICAgICAgICAgIGV5ID0gdHkgLSBkY3kgKiAyO1xyXG4gICAgICAgICAgICBleiA9IHR6IC0gZGN6ICogMjtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVkID0gbnggKiAoZXggLSBjYngpICsgbnkgKiAoZXkgLSBjYnkpICsgbnogKiAoZXogLSBjYnopO1xyXG4gICAgICAgICAgZXggLT0gZWQgKiBueDtcclxuICAgICAgICAgIGV5IC09IGVkICogbnk7XHJcbiAgICAgICAgICBleiAtPSBlZCAqIG56O1xyXG4gICAgICAgICAgZDF4ID0gc3ggLSBjYng7XHJcbiAgICAgICAgICBkMXkgPSBzeSAtIGNieTtcclxuICAgICAgICAgIGQxeiA9IHN6IC0gY2J6O1xyXG4gICAgICAgICAgZDJ4ID0gZXggLSBjYng7XHJcbiAgICAgICAgICBkMnkgPSBleSAtIGNieTtcclxuICAgICAgICAgIGQyeiA9IGV6IC0gY2J6O1xyXG4gICAgICAgICAgdHggPSBleCAtIHN4O1xyXG4gICAgICAgICAgdHkgPSBleSAtIHN5O1xyXG4gICAgICAgICAgdHogPSBleiAtIHN6O1xyXG4gICAgICAgICAgdGQgPSBlZCAtIHNkO1xyXG4gICAgICAgICAgZG90dyA9IGQxeCAqIGRpcjF4ICsgZDF5ICogZGlyMXkgKyBkMXogKiBkaXIxejtcclxuICAgICAgICAgIGRvdGggPSBkMnggKiBkaXIxeCArIGQyeSAqIGRpcjF5ICsgZDJ6ICogZGlyMXo7XHJcbiAgICAgICAgICBkb3QxID0gZG90dyAtIGRpcjFsO1xyXG4gICAgICAgICAgZG90MiA9IGRvdGggLSBkaXIxbDtcclxuICAgICAgICAgIGlmIChkb3QxID4gMCkge1xyXG4gICAgICAgICAgICBpZiAoZG90MiA+IDApIHJldHVybjtcclxuICAgICAgICAgICAgdDEgPSBkb3QxIC8gKGRvdDEgLSBkb3QyKTtcclxuICAgICAgICAgICAgc3ggPSBzeCArIHR4ICogdDE7XHJcbiAgICAgICAgICAgIHN5ID0gc3kgKyB0eSAqIHQxO1xyXG4gICAgICAgICAgICBzeiA9IHN6ICsgdHogKiB0MTtcclxuICAgICAgICAgICAgc2QgPSBzZCArIHRkICogdDE7XHJcbiAgICAgICAgICAgIGQxeCA9IHN4IC0gY2J4O1xyXG4gICAgICAgICAgICBkMXkgPSBzeSAtIGNieTtcclxuICAgICAgICAgICAgZDF6ID0gc3ogLSBjYno7XHJcbiAgICAgICAgICAgIGRvdHcgPSBkMXggKiBkaXIxeCArIGQxeSAqIGRpcjF5ICsgZDF6ICogZGlyMXo7XHJcbiAgICAgICAgICAgIHR4ID0gZXggLSBzeDtcclxuICAgICAgICAgICAgdHkgPSBleSAtIHN5O1xyXG4gICAgICAgICAgICB0eiA9IGV6IC0gc3o7XHJcbiAgICAgICAgICAgIHRkID0gZWQgLSBzZDtcclxuICAgICAgICAgIH0gZWxzZSBpZiAoZG90MiA+IDApIHtcclxuICAgICAgICAgICAgdDEgPSBkb3QxIC8gKGRvdDEgLSBkb3QyKTtcclxuICAgICAgICAgICAgZXggPSBzeCArIHR4ICogdDE7XHJcbiAgICAgICAgICAgIGV5ID0gc3kgKyB0eSAqIHQxO1xyXG4gICAgICAgICAgICBleiA9IHN6ICsgdHogKiB0MTtcclxuICAgICAgICAgICAgZWQgPSBzZCArIHRkICogdDE7XHJcbiAgICAgICAgICAgIGQyeCA9IGV4IC0gY2J4O1xyXG4gICAgICAgICAgICBkMnkgPSBleSAtIGNieTtcclxuICAgICAgICAgICAgZDJ6ID0gZXogLSBjYno7XHJcbiAgICAgICAgICAgIGRvdGggPSBkMnggKiBkaXIxeCArIGQyeSAqIGRpcjF5ICsgZDJ6ICogZGlyMXo7XHJcbiAgICAgICAgICAgIHR4ID0gZXggLSBzeDtcclxuICAgICAgICAgICAgdHkgPSBleSAtIHN5O1xyXG4gICAgICAgICAgICB0eiA9IGV6IC0gc3o7XHJcbiAgICAgICAgICAgIHRkID0gZWQgLSBzZDtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGRvdDEgPSBkb3R3ICsgZGlyMWw7XHJcbiAgICAgICAgICBkb3QyID0gZG90aCArIGRpcjFsO1xyXG4gICAgICAgICAgaWYgKGRvdDEgPCAwKSB7XHJcbiAgICAgICAgICAgIGlmIChkb3QyIDwgMCkgcmV0dXJuO1xyXG4gICAgICAgICAgICB0MSA9IGRvdDEgLyAoZG90MSAtIGRvdDIpO1xyXG4gICAgICAgICAgICBzeCA9IHN4ICsgdHggKiB0MTtcclxuICAgICAgICAgICAgc3kgPSBzeSArIHR5ICogdDE7XHJcbiAgICAgICAgICAgIHN6ID0gc3ogKyB0eiAqIHQxO1xyXG4gICAgICAgICAgICBzZCA9IHNkICsgdGQgKiB0MTtcclxuICAgICAgICAgICAgZDF4ID0gc3ggLSBjYng7XHJcbiAgICAgICAgICAgIGQxeSA9IHN5IC0gY2J5O1xyXG4gICAgICAgICAgICBkMXogPSBzeiAtIGNiejtcclxuICAgICAgICAgICAgdHggPSBleCAtIHN4O1xyXG4gICAgICAgICAgICB0eSA9IGV5IC0gc3k7XHJcbiAgICAgICAgICAgIHR6ID0gZXogLSBzejtcclxuICAgICAgICAgICAgdGQgPSBlZCAtIHNkO1xyXG4gICAgICAgICAgfSBlbHNlIGlmIChkb3QyIDwgMCkge1xyXG4gICAgICAgICAgICB0MSA9IGRvdDEgLyAoZG90MSAtIGRvdDIpO1xyXG4gICAgICAgICAgICBleCA9IHN4ICsgdHggKiB0MTtcclxuICAgICAgICAgICAgZXkgPSBzeSArIHR5ICogdDE7XHJcbiAgICAgICAgICAgIGV6ID0gc3ogKyB0eiAqIHQxO1xyXG4gICAgICAgICAgICBlZCA9IHNkICsgdGQgKiB0MTtcclxuICAgICAgICAgICAgZDJ4ID0gZXggLSBjYng7XHJcbiAgICAgICAgICAgIGQyeSA9IGV5IC0gY2J5O1xyXG4gICAgICAgICAgICBkMnogPSBleiAtIGNiejtcclxuICAgICAgICAgICAgdHggPSBleCAtIHN4O1xyXG4gICAgICAgICAgICB0eSA9IGV5IC0gc3k7XHJcbiAgICAgICAgICAgIHR6ID0gZXogLSBzejtcclxuICAgICAgICAgICAgdGQgPSBlZCAtIHNkO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZG90dyA9IGQxeCAqIGRpcjJ4ICsgZDF5ICogZGlyMnkgKyBkMXogKiBkaXIyejtcclxuICAgICAgICAgIGRvdGggPSBkMnggKiBkaXIyeCArIGQyeSAqIGRpcjJ5ICsgZDJ6ICogZGlyMno7XHJcbiAgICAgICAgICBkb3QxID0gZG90dyAtIGRpcjJsO1xyXG4gICAgICAgICAgZG90MiA9IGRvdGggLSBkaXIybDtcclxuICAgICAgICAgIGlmIChkb3QxID4gMCkge1xyXG4gICAgICAgICAgICBpZiAoZG90MiA+IDApIHJldHVybjtcclxuICAgICAgICAgICAgdDEgPSBkb3QxIC8gKGRvdDEgLSBkb3QyKTtcclxuICAgICAgICAgICAgc3ggPSBzeCArIHR4ICogdDE7XHJcbiAgICAgICAgICAgIHN5ID0gc3kgKyB0eSAqIHQxO1xyXG4gICAgICAgICAgICBzeiA9IHN6ICsgdHogKiB0MTtcclxuICAgICAgICAgICAgc2QgPSBzZCArIHRkICogdDE7XHJcbiAgICAgICAgICAgIGQxeCA9IHN4IC0gY2J4O1xyXG4gICAgICAgICAgICBkMXkgPSBzeSAtIGNieTtcclxuICAgICAgICAgICAgZDF6ID0gc3ogLSBjYno7XHJcbiAgICAgICAgICAgIGRvdHcgPSBkMXggKiBkaXIyeCArIGQxeSAqIGRpcjJ5ICsgZDF6ICogZGlyMno7XHJcbiAgICAgICAgICAgIHR4ID0gZXggLSBzeDtcclxuICAgICAgICAgICAgdHkgPSBleSAtIHN5O1xyXG4gICAgICAgICAgICB0eiA9IGV6IC0gc3o7XHJcbiAgICAgICAgICAgIHRkID0gZWQgLSBzZDtcclxuICAgICAgICAgIH0gZWxzZSBpZiAoZG90MiA+IDApIHtcclxuICAgICAgICAgICAgdDEgPSBkb3QxIC8gKGRvdDEgLSBkb3QyKTtcclxuICAgICAgICAgICAgZXggPSBzeCArIHR4ICogdDE7XHJcbiAgICAgICAgICAgIGV5ID0gc3kgKyB0eSAqIHQxO1xyXG4gICAgICAgICAgICBleiA9IHN6ICsgdHogKiB0MTtcclxuICAgICAgICAgICAgZWQgPSBzZCArIHRkICogdDE7XHJcbiAgICAgICAgICAgIGQyeCA9IGV4IC0gY2J4O1xyXG4gICAgICAgICAgICBkMnkgPSBleSAtIGNieTtcclxuICAgICAgICAgICAgZDJ6ID0gZXogLSBjYno7XHJcbiAgICAgICAgICAgIGRvdGggPSBkMnggKiBkaXIyeCArIGQyeSAqIGRpcjJ5ICsgZDJ6ICogZGlyMno7XHJcbiAgICAgICAgICAgIHR4ID0gZXggLSBzeDtcclxuICAgICAgICAgICAgdHkgPSBleSAtIHN5O1xyXG4gICAgICAgICAgICB0eiA9IGV6IC0gc3o7XHJcbiAgICAgICAgICAgIHRkID0gZWQgLSBzZDtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGRvdDEgPSBkb3R3ICsgZGlyMmw7XHJcbiAgICAgICAgICBkb3QyID0gZG90aCArIGRpcjJsO1xyXG4gICAgICAgICAgaWYgKGRvdDEgPCAwKSB7XHJcbiAgICAgICAgICAgIGlmIChkb3QyIDwgMCkgcmV0dXJuO1xyXG4gICAgICAgICAgICB0MSA9IGRvdDEgLyAoZG90MSAtIGRvdDIpO1xyXG4gICAgICAgICAgICBzeCA9IHN4ICsgdHggKiB0MTtcclxuICAgICAgICAgICAgc3kgPSBzeSArIHR5ICogdDE7XHJcbiAgICAgICAgICAgIHN6ID0gc3ogKyB0eiAqIHQxO1xyXG4gICAgICAgICAgICBzZCA9IHNkICsgdGQgKiB0MTtcclxuICAgICAgICAgIH0gZWxzZSBpZiAoZG90MiA8IDApIHtcclxuICAgICAgICAgICAgdDEgPSBkb3QxIC8gKGRvdDEgLSBkb3QyKTtcclxuICAgICAgICAgICAgZXggPSBzeCArIHR4ICogdDE7XHJcbiAgICAgICAgICAgIGV5ID0gc3kgKyB0eSAqIHQxO1xyXG4gICAgICAgICAgICBleiA9IHN6ICsgdHogKiB0MTtcclxuICAgICAgICAgICAgZWQgPSBzZCArIHRkICogdDE7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBpZiAoc2QgPCAwKSB7XHJcbiAgICAgICAgICAgIC8vbWFuaWZvbGQuYWRkUG9pbnQoc3gsc3ksc3osbngsbnksbnosc2QsYixjLDEsMCxmYWxzZSk7XHJcbiAgICAgICAgICAgIG1hbmlmb2xkLmFkZFBvaW50KHN4LCBzeSwgc3osIG54LCBueSwgbnosIHNkLCB0aGlzLmZsaXApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaWYgKGVkIDwgMCkge1xyXG4gICAgICAgICAgICAvL21hbmlmb2xkLmFkZFBvaW50KGV4LGV5LGV6LG54LG55LG56LGVkLGIsYyw0LDAsZmFsc2UpO1xyXG4gICAgICAgICAgICBtYW5pZm9sZC5hZGRQb2ludChleCwgZXksIGV6LCBueCwgbnksIG56LCBlZCwgdGhpcy5mbGlwKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gIH0pO1xyXG5cclxuICBmdW5jdGlvbiBDeWxpbmRlckN5bGluZGVyQ29sbGlzaW9uRGV0ZWN0b3IoKSB7XHJcblxyXG4gICAgQ29sbGlzaW9uRGV0ZWN0b3IuY2FsbCh0aGlzKTtcclxuXHJcbiAgfVxyXG4gIEN5bGluZGVyQ3lsaW5kZXJDb2xsaXNpb25EZXRlY3Rvci5wcm90b3R5cGUgPSBPYmplY3QuYXNzaWduKE9iamVjdC5jcmVhdGUoQ29sbGlzaW9uRGV0ZWN0b3IucHJvdG90eXBlKSwge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yOiBDeWxpbmRlckN5bGluZGVyQ29sbGlzaW9uRGV0ZWN0b3IsXHJcblxyXG5cclxuICAgIGdldFNlcDogZnVuY3Rpb24gKGMxLCBjMiwgc2VwLCBwb3MsIGRlcCkge1xyXG5cclxuICAgICAgdmFyIHQxeDtcclxuICAgICAgdmFyIHQxeTtcclxuICAgICAgdmFyIHQxejtcclxuICAgICAgdmFyIHQyeDtcclxuICAgICAgdmFyIHQyeTtcclxuICAgICAgdmFyIHQyejtcclxuICAgICAgdmFyIHN1cCA9IG5ldyBWZWMzKCk7XHJcbiAgICAgIHZhciBsZW47XHJcbiAgICAgIHZhciBwMXg7XHJcbiAgICAgIHZhciBwMXk7XHJcbiAgICAgIHZhciBwMXo7XHJcbiAgICAgIHZhciBwMng7XHJcbiAgICAgIHZhciBwMnk7XHJcbiAgICAgIHZhciBwMno7XHJcbiAgICAgIHZhciB2MDF4ID0gYzEucG9zaXRpb24ueDtcclxuICAgICAgdmFyIHYwMXkgPSBjMS5wb3NpdGlvbi55O1xyXG4gICAgICB2YXIgdjAxeiA9IGMxLnBvc2l0aW9uLno7XHJcbiAgICAgIHZhciB2MDJ4ID0gYzIucG9zaXRpb24ueDtcclxuICAgICAgdmFyIHYwMnkgPSBjMi5wb3NpdGlvbi55O1xyXG4gICAgICB2YXIgdjAyeiA9IGMyLnBvc2l0aW9uLno7XHJcbiAgICAgIHZhciB2MHggPSB2MDJ4IC0gdjAxeDtcclxuICAgICAgdmFyIHYweSA9IHYwMnkgLSB2MDF5O1xyXG4gICAgICB2YXIgdjB6ID0gdjAyeiAtIHYwMXo7XHJcbiAgICAgIGlmICh2MHggKiB2MHggKyB2MHkgKiB2MHkgKyB2MHogKiB2MHogPT0gMCkgdjB5ID0gMC4wMDE7XHJcbiAgICAgIHZhciBueCA9IC12MHg7XHJcbiAgICAgIHZhciBueSA9IC12MHk7XHJcbiAgICAgIHZhciBueiA9IC12MHo7XHJcbiAgICAgIHRoaXMuc3VwcG9ydFBvaW50KGMxLCAtbngsIC1ueSwgLW56LCBzdXApO1xyXG4gICAgICB2YXIgdjExeCA9IHN1cC54O1xyXG4gICAgICB2YXIgdjExeSA9IHN1cC55O1xyXG4gICAgICB2YXIgdjExeiA9IHN1cC56O1xyXG4gICAgICB0aGlzLnN1cHBvcnRQb2ludChjMiwgbngsIG55LCBueiwgc3VwKTtcclxuICAgICAgdmFyIHYxMnggPSBzdXAueDtcclxuICAgICAgdmFyIHYxMnkgPSBzdXAueTtcclxuICAgICAgdmFyIHYxMnogPSBzdXAuejtcclxuICAgICAgdmFyIHYxeCA9IHYxMnggLSB2MTF4O1xyXG4gICAgICB2YXIgdjF5ID0gdjEyeSAtIHYxMXk7XHJcbiAgICAgIHZhciB2MXogPSB2MTJ6IC0gdjExejtcclxuICAgICAgaWYgKHYxeCAqIG54ICsgdjF5ICogbnkgKyB2MXogKiBueiA8PSAwKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICAgIG54ID0gdjF5ICogdjB6IC0gdjF6ICogdjB5O1xyXG4gICAgICBueSA9IHYxeiAqIHYweCAtIHYxeCAqIHYwejtcclxuICAgICAgbnogPSB2MXggKiB2MHkgLSB2MXkgKiB2MHg7XHJcbiAgICAgIGlmIChueCAqIG54ICsgbnkgKiBueSArIG56ICogbnogPT0gMCkge1xyXG4gICAgICAgIHNlcC5zZXQodjF4IC0gdjB4LCB2MXkgLSB2MHksIHYxeiAtIHYweikubm9ybWFsaXplKCk7XHJcbiAgICAgICAgcG9zLnNldCgodjExeCArIHYxMngpICogMC41LCAodjExeSArIHYxMnkpICogMC41LCAodjExeiArIHYxMnopICogMC41KTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLnN1cHBvcnRQb2ludChjMSwgLW54LCAtbnksIC1ueiwgc3VwKTtcclxuICAgICAgdmFyIHYyMXggPSBzdXAueDtcclxuICAgICAgdmFyIHYyMXkgPSBzdXAueTtcclxuICAgICAgdmFyIHYyMXogPSBzdXAuejtcclxuICAgICAgdGhpcy5zdXBwb3J0UG9pbnQoYzIsIG54LCBueSwgbnosIHN1cCk7XHJcbiAgICAgIHZhciB2MjJ4ID0gc3VwLng7XHJcbiAgICAgIHZhciB2MjJ5ID0gc3VwLnk7XHJcbiAgICAgIHZhciB2MjJ6ID0gc3VwLno7XHJcbiAgICAgIHZhciB2MnggPSB2MjJ4IC0gdjIxeDtcclxuICAgICAgdmFyIHYyeSA9IHYyMnkgLSB2MjF5O1xyXG4gICAgICB2YXIgdjJ6ID0gdjIyeiAtIHYyMXo7XHJcbiAgICAgIGlmICh2MnggKiBueCArIHYyeSAqIG55ICsgdjJ6ICogbnogPD0gMCkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgICB0MXggPSB2MXggLSB2MHg7XHJcbiAgICAgIHQxeSA9IHYxeSAtIHYweTtcclxuICAgICAgdDF6ID0gdjF6IC0gdjB6O1xyXG4gICAgICB0MnggPSB2MnggLSB2MHg7XHJcbiAgICAgIHQyeSA9IHYyeSAtIHYweTtcclxuICAgICAgdDJ6ID0gdjJ6IC0gdjB6O1xyXG4gICAgICBueCA9IHQxeSAqIHQyeiAtIHQxeiAqIHQyeTtcclxuICAgICAgbnkgPSB0MXogKiB0MnggLSB0MXggKiB0Mno7XHJcbiAgICAgIG56ID0gdDF4ICogdDJ5IC0gdDF5ICogdDJ4O1xyXG4gICAgICBpZiAobnggKiB2MHggKyBueSAqIHYweSArIG56ICogdjB6ID4gMCkge1xyXG4gICAgICAgIHQxeCA9IHYxeDtcclxuICAgICAgICB0MXkgPSB2MXk7XHJcbiAgICAgICAgdDF6ID0gdjF6O1xyXG4gICAgICAgIHYxeCA9IHYyeDtcclxuICAgICAgICB2MXkgPSB2Mnk7XHJcbiAgICAgICAgdjF6ID0gdjJ6O1xyXG4gICAgICAgIHYyeCA9IHQxeDtcclxuICAgICAgICB2MnkgPSB0MXk7XHJcbiAgICAgICAgdjJ6ID0gdDF6O1xyXG4gICAgICAgIHQxeCA9IHYxMXg7XHJcbiAgICAgICAgdDF5ID0gdjExeTtcclxuICAgICAgICB0MXogPSB2MTF6O1xyXG4gICAgICAgIHYxMXggPSB2MjF4O1xyXG4gICAgICAgIHYxMXkgPSB2MjF5O1xyXG4gICAgICAgIHYxMXogPSB2MjF6O1xyXG4gICAgICAgIHYyMXggPSB0MXg7XHJcbiAgICAgICAgdjIxeSA9IHQxeTtcclxuICAgICAgICB2MjF6ID0gdDF6O1xyXG4gICAgICAgIHQxeCA9IHYxMng7XHJcbiAgICAgICAgdDF5ID0gdjEyeTtcclxuICAgICAgICB0MXogPSB2MTJ6O1xyXG4gICAgICAgIHYxMnggPSB2MjJ4O1xyXG4gICAgICAgIHYxMnkgPSB2MjJ5O1xyXG4gICAgICAgIHYxMnogPSB2MjJ6O1xyXG4gICAgICAgIHYyMnggPSB0MXg7XHJcbiAgICAgICAgdjIyeSA9IHQxeTtcclxuICAgICAgICB2MjJ6ID0gdDF6O1xyXG4gICAgICAgIG54ID0gLW54O1xyXG4gICAgICAgIG55ID0gLW55O1xyXG4gICAgICAgIG56ID0gLW56O1xyXG4gICAgICB9XHJcbiAgICAgIHZhciBpdGVyYXRpb25zID0gMDtcclxuICAgICAgd2hpbGUgKHRydWUpIHtcclxuICAgICAgICBpZiAoKytpdGVyYXRpb25zID4gMTAwKSB7XHJcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc3VwcG9ydFBvaW50KGMxLCAtbngsIC1ueSwgLW56LCBzdXApO1xyXG4gICAgICAgIHZhciB2MzF4ID0gc3VwLng7XHJcbiAgICAgICAgdmFyIHYzMXkgPSBzdXAueTtcclxuICAgICAgICB2YXIgdjMxeiA9IHN1cC56O1xyXG4gICAgICAgIHRoaXMuc3VwcG9ydFBvaW50KGMyLCBueCwgbnksIG56LCBzdXApO1xyXG4gICAgICAgIHZhciB2MzJ4ID0gc3VwLng7XHJcbiAgICAgICAgdmFyIHYzMnkgPSBzdXAueTtcclxuICAgICAgICB2YXIgdjMyeiA9IHN1cC56O1xyXG4gICAgICAgIHZhciB2M3ggPSB2MzJ4IC0gdjMxeDtcclxuICAgICAgICB2YXIgdjN5ID0gdjMyeSAtIHYzMXk7XHJcbiAgICAgICAgdmFyIHYzeiA9IHYzMnogLSB2MzF6O1xyXG4gICAgICAgIGlmICh2M3ggKiBueCArIHYzeSAqIG55ICsgdjN6ICogbnogPD0gMCkge1xyXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoKHYxeSAqIHYzeiAtIHYxeiAqIHYzeSkgKiB2MHggKyAodjF6ICogdjN4IC0gdjF4ICogdjN6KSAqIHYweSArICh2MXggKiB2M3kgLSB2MXkgKiB2M3gpICogdjB6IDwgMCkge1xyXG4gICAgICAgICAgdjJ4ID0gdjN4O1xyXG4gICAgICAgICAgdjJ5ID0gdjN5O1xyXG4gICAgICAgICAgdjJ6ID0gdjN6O1xyXG4gICAgICAgICAgdjIxeCA9IHYzMXg7XHJcbiAgICAgICAgICB2MjF5ID0gdjMxeTtcclxuICAgICAgICAgIHYyMXogPSB2MzF6O1xyXG4gICAgICAgICAgdjIyeCA9IHYzMng7XHJcbiAgICAgICAgICB2MjJ5ID0gdjMyeTtcclxuICAgICAgICAgIHYyMnogPSB2MzJ6O1xyXG4gICAgICAgICAgdDF4ID0gdjF4IC0gdjB4O1xyXG4gICAgICAgICAgdDF5ID0gdjF5IC0gdjB5O1xyXG4gICAgICAgICAgdDF6ID0gdjF6IC0gdjB6O1xyXG4gICAgICAgICAgdDJ4ID0gdjN4IC0gdjB4O1xyXG4gICAgICAgICAgdDJ5ID0gdjN5IC0gdjB5O1xyXG4gICAgICAgICAgdDJ6ID0gdjN6IC0gdjB6O1xyXG4gICAgICAgICAgbnggPSB0MXkgKiB0MnogLSB0MXogKiB0Mnk7XHJcbiAgICAgICAgICBueSA9IHQxeiAqIHQyeCAtIHQxeCAqIHQyejtcclxuICAgICAgICAgIG56ID0gdDF4ICogdDJ5IC0gdDF5ICogdDJ4O1xyXG4gICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICgodjN5ICogdjJ6IC0gdjN6ICogdjJ5KSAqIHYweCArICh2M3ogKiB2MnggLSB2M3ggKiB2MnopICogdjB5ICsgKHYzeCAqIHYyeSAtIHYzeSAqIHYyeCkgKiB2MHogPCAwKSB7XHJcbiAgICAgICAgICB2MXggPSB2M3g7XHJcbiAgICAgICAgICB2MXkgPSB2M3k7XHJcbiAgICAgICAgICB2MXogPSB2M3o7XHJcbiAgICAgICAgICB2MTF4ID0gdjMxeDtcclxuICAgICAgICAgIHYxMXkgPSB2MzF5O1xyXG4gICAgICAgICAgdjExeiA9IHYzMXo7XHJcbiAgICAgICAgICB2MTJ4ID0gdjMyeDtcclxuICAgICAgICAgIHYxMnkgPSB2MzJ5O1xyXG4gICAgICAgICAgdjEyeiA9IHYzMno7XHJcbiAgICAgICAgICB0MXggPSB2M3ggLSB2MHg7XHJcbiAgICAgICAgICB0MXkgPSB2M3kgLSB2MHk7XHJcbiAgICAgICAgICB0MXogPSB2M3ogLSB2MHo7XHJcbiAgICAgICAgICB0MnggPSB2MnggLSB2MHg7XHJcbiAgICAgICAgICB0MnkgPSB2MnkgLSB2MHk7XHJcbiAgICAgICAgICB0MnogPSB2MnogLSB2MHo7XHJcbiAgICAgICAgICBueCA9IHQxeSAqIHQyeiAtIHQxeiAqIHQyeTtcclxuICAgICAgICAgIG55ID0gdDF6ICogdDJ4IC0gdDF4ICogdDJ6O1xyXG4gICAgICAgICAgbnogPSB0MXggKiB0MnkgLSB0MXkgKiB0Mng7XHJcbiAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIGhpdCA9IGZhbHNlO1xyXG4gICAgICAgIHdoaWxlICh0cnVlKSB7XHJcbiAgICAgICAgICB0MXggPSB2MnggLSB2MXg7XHJcbiAgICAgICAgICB0MXkgPSB2MnkgLSB2MXk7XHJcbiAgICAgICAgICB0MXogPSB2MnogLSB2MXo7XHJcbiAgICAgICAgICB0MnggPSB2M3ggLSB2MXg7XHJcbiAgICAgICAgICB0MnkgPSB2M3kgLSB2MXk7XHJcbiAgICAgICAgICB0MnogPSB2M3ogLSB2MXo7XHJcbiAgICAgICAgICBueCA9IHQxeSAqIHQyeiAtIHQxeiAqIHQyeTtcclxuICAgICAgICAgIG55ID0gdDF6ICogdDJ4IC0gdDF4ICogdDJ6O1xyXG4gICAgICAgICAgbnogPSB0MXggKiB0MnkgLSB0MXkgKiB0Mng7XHJcbiAgICAgICAgICBsZW4gPSAxIC8gX01hdGguc3FydChueCAqIG54ICsgbnkgKiBueSArIG56ICogbnopO1xyXG4gICAgICAgICAgbnggKj0gbGVuO1xyXG4gICAgICAgICAgbnkgKj0gbGVuO1xyXG4gICAgICAgICAgbnogKj0gbGVuO1xyXG4gICAgICAgICAgaWYgKG54ICogdjF4ICsgbnkgKiB2MXkgKyBueiAqIHYxeiA+PSAwICYmICFoaXQpIHtcclxuICAgICAgICAgICAgdmFyIGIwID0gKHYxeSAqIHYyeiAtIHYxeiAqIHYyeSkgKiB2M3ggKyAodjF6ICogdjJ4IC0gdjF4ICogdjJ6KSAqIHYzeSArICh2MXggKiB2MnkgLSB2MXkgKiB2MngpICogdjN6O1xyXG4gICAgICAgICAgICB2YXIgYjEgPSAodjN5ICogdjJ6IC0gdjN6ICogdjJ5KSAqIHYweCArICh2M3ogKiB2MnggLSB2M3ggKiB2MnopICogdjB5ICsgKHYzeCAqIHYyeSAtIHYzeSAqIHYyeCkgKiB2MHo7XHJcbiAgICAgICAgICAgIHZhciBiMiA9ICh2MHkgKiB2MXogLSB2MHogKiB2MXkpICogdjN4ICsgKHYweiAqIHYxeCAtIHYweCAqIHYxeikgKiB2M3kgKyAodjB4ICogdjF5IC0gdjB5ICogdjF4KSAqIHYzejtcclxuICAgICAgICAgICAgdmFyIGIzID0gKHYyeSAqIHYxeiAtIHYyeiAqIHYxeSkgKiB2MHggKyAodjJ6ICogdjF4IC0gdjJ4ICogdjF6KSAqIHYweSArICh2MnggKiB2MXkgLSB2MnkgKiB2MXgpICogdjB6O1xyXG4gICAgICAgICAgICB2YXIgc3VtID0gYjAgKyBiMSArIGIyICsgYjM7XHJcbiAgICAgICAgICAgIGlmIChzdW0gPD0gMCkge1xyXG4gICAgICAgICAgICAgIGIwID0gMDtcclxuICAgICAgICAgICAgICBiMSA9ICh2MnkgKiB2M3ogLSB2MnogKiB2M3kpICogbnggKyAodjJ6ICogdjN4IC0gdjJ4ICogdjN6KSAqIG55ICsgKHYyeCAqIHYzeSAtIHYyeSAqIHYzeCkgKiBuejtcclxuICAgICAgICAgICAgICBiMiA9ICh2M3kgKiB2MnogLSB2M3ogKiB2MnkpICogbnggKyAodjN6ICogdjJ4IC0gdjN4ICogdjJ6KSAqIG55ICsgKHYzeCAqIHYyeSAtIHYzeSAqIHYyeCkgKiBuejtcclxuICAgICAgICAgICAgICBiMyA9ICh2MXkgKiB2MnogLSB2MXogKiB2MnkpICogbnggKyAodjF6ICogdjJ4IC0gdjF4ICogdjJ6KSAqIG55ICsgKHYxeCAqIHYyeSAtIHYxeSAqIHYyeCkgKiBuejtcclxuICAgICAgICAgICAgICBzdW0gPSBiMSArIGIyICsgYjM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIGludiA9IDEgLyBzdW07XHJcbiAgICAgICAgICAgIHAxeCA9ICh2MDF4ICogYjAgKyB2MTF4ICogYjEgKyB2MjF4ICogYjIgKyB2MzF4ICogYjMpICogaW52O1xyXG4gICAgICAgICAgICBwMXkgPSAodjAxeSAqIGIwICsgdjExeSAqIGIxICsgdjIxeSAqIGIyICsgdjMxeSAqIGIzKSAqIGludjtcclxuICAgICAgICAgICAgcDF6ID0gKHYwMXogKiBiMCArIHYxMXogKiBiMSArIHYyMXogKiBiMiArIHYzMXogKiBiMykgKiBpbnY7XHJcbiAgICAgICAgICAgIHAyeCA9ICh2MDJ4ICogYjAgKyB2MTJ4ICogYjEgKyB2MjJ4ICogYjIgKyB2MzJ4ICogYjMpICogaW52O1xyXG4gICAgICAgICAgICBwMnkgPSAodjAyeSAqIGIwICsgdjEyeSAqIGIxICsgdjIyeSAqIGIyICsgdjMyeSAqIGIzKSAqIGludjtcclxuICAgICAgICAgICAgcDJ6ID0gKHYwMnogKiBiMCArIHYxMnogKiBiMSArIHYyMnogKiBiMiArIHYzMnogKiBiMykgKiBpbnY7XHJcbiAgICAgICAgICAgIGhpdCA9IHRydWU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICB0aGlzLnN1cHBvcnRQb2ludChjMSwgLW54LCAtbnksIC1ueiwgc3VwKTtcclxuICAgICAgICAgIHZhciB2NDF4ID0gc3VwLng7XHJcbiAgICAgICAgICB2YXIgdjQxeSA9IHN1cC55O1xyXG4gICAgICAgICAgdmFyIHY0MXogPSBzdXAuejtcclxuICAgICAgICAgIHRoaXMuc3VwcG9ydFBvaW50KGMyLCBueCwgbnksIG56LCBzdXApO1xyXG4gICAgICAgICAgdmFyIHY0MnggPSBzdXAueDtcclxuICAgICAgICAgIHZhciB2NDJ5ID0gc3VwLnk7XHJcbiAgICAgICAgICB2YXIgdjQyeiA9IHN1cC56O1xyXG4gICAgICAgICAgdmFyIHY0eCA9IHY0MnggLSB2NDF4O1xyXG4gICAgICAgICAgdmFyIHY0eSA9IHY0MnkgLSB2NDF5O1xyXG4gICAgICAgICAgdmFyIHY0eiA9IHY0MnogLSB2NDF6O1xyXG4gICAgICAgICAgdmFyIHNlcGFyYXRpb24gPSAtKHY0eCAqIG54ICsgdjR5ICogbnkgKyB2NHogKiBueik7XHJcbiAgICAgICAgICBpZiAoKHY0eCAtIHYzeCkgKiBueCArICh2NHkgLSB2M3kpICogbnkgKyAodjR6IC0gdjN6KSAqIG56IDw9IDAuMDEgfHwgc2VwYXJhdGlvbiA+PSAwKSB7XHJcbiAgICAgICAgICAgIGlmIChoaXQpIHtcclxuICAgICAgICAgICAgICBzZXAuc2V0KC1ueCwgLW55LCAtbnopO1xyXG4gICAgICAgICAgICAgIHBvcy5zZXQoKHAxeCArIHAyeCkgKiAwLjUsIChwMXkgKyBwMnkpICogMC41LCAocDF6ICsgcDJ6KSAqIDAuNSk7XHJcbiAgICAgICAgICAgICAgZGVwLnggPSBzZXBhcmF0aW9uO1xyXG4gICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmIChcclxuICAgICAgICAgICAgKHY0eSAqIHYxeiAtIHY0eiAqIHYxeSkgKiB2MHggK1xyXG4gICAgICAgICAgICAodjR6ICogdjF4IC0gdjR4ICogdjF6KSAqIHYweSArXHJcbiAgICAgICAgICAgICh2NHggKiB2MXkgLSB2NHkgKiB2MXgpICogdjB6IDwgMFxyXG4gICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIGlmIChcclxuICAgICAgICAgICAgICAodjR5ICogdjJ6IC0gdjR6ICogdjJ5KSAqIHYweCArXHJcbiAgICAgICAgICAgICAgKHY0eiAqIHYyeCAtIHY0eCAqIHYyeikgKiB2MHkgK1xyXG4gICAgICAgICAgICAgICh2NHggKiB2MnkgLSB2NHkgKiB2MngpICogdjB6IDwgMFxyXG4gICAgICAgICAgICApIHtcclxuICAgICAgICAgICAgICB2MXggPSB2NHg7XHJcbiAgICAgICAgICAgICAgdjF5ID0gdjR5O1xyXG4gICAgICAgICAgICAgIHYxeiA9IHY0ejtcclxuICAgICAgICAgICAgICB2MTF4ID0gdjQxeDtcclxuICAgICAgICAgICAgICB2MTF5ID0gdjQxeTtcclxuICAgICAgICAgICAgICB2MTF6ID0gdjQxejtcclxuICAgICAgICAgICAgICB2MTJ4ID0gdjQyeDtcclxuICAgICAgICAgICAgICB2MTJ5ID0gdjQyeTtcclxuICAgICAgICAgICAgICB2MTJ6ID0gdjQyejtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICB2M3ggPSB2NHg7XHJcbiAgICAgICAgICAgICAgdjN5ID0gdjR5O1xyXG4gICAgICAgICAgICAgIHYzeiA9IHY0ejtcclxuICAgICAgICAgICAgICB2MzF4ID0gdjQxeDtcclxuICAgICAgICAgICAgICB2MzF5ID0gdjQxeTtcclxuICAgICAgICAgICAgICB2MzF6ID0gdjQxejtcclxuICAgICAgICAgICAgICB2MzJ4ID0gdjQyeDtcclxuICAgICAgICAgICAgICB2MzJ5ID0gdjQyeTtcclxuICAgICAgICAgICAgICB2MzJ6ID0gdjQyejtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKFxyXG4gICAgICAgICAgICAgICh2NHkgKiB2M3ogLSB2NHogKiB2M3kpICogdjB4ICtcclxuICAgICAgICAgICAgICAodjR6ICogdjN4IC0gdjR4ICogdjN6KSAqIHYweSArXHJcbiAgICAgICAgICAgICAgKHY0eCAqIHYzeSAtIHY0eSAqIHYzeCkgKiB2MHogPCAwXHJcbiAgICAgICAgICAgICkge1xyXG4gICAgICAgICAgICAgIHYyeCA9IHY0eDtcclxuICAgICAgICAgICAgICB2MnkgPSB2NHk7XHJcbiAgICAgICAgICAgICAgdjJ6ID0gdjR6O1xyXG4gICAgICAgICAgICAgIHYyMXggPSB2NDF4O1xyXG4gICAgICAgICAgICAgIHYyMXkgPSB2NDF5O1xyXG4gICAgICAgICAgICAgIHYyMXogPSB2NDF6O1xyXG4gICAgICAgICAgICAgIHYyMnggPSB2NDJ4O1xyXG4gICAgICAgICAgICAgIHYyMnkgPSB2NDJ5O1xyXG4gICAgICAgICAgICAgIHYyMnogPSB2NDJ6O1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHYxeCA9IHY0eDtcclxuICAgICAgICAgICAgICB2MXkgPSB2NHk7XHJcbiAgICAgICAgICAgICAgdjF6ID0gdjR6O1xyXG4gICAgICAgICAgICAgIHYxMXggPSB2NDF4O1xyXG4gICAgICAgICAgICAgIHYxMXkgPSB2NDF5O1xyXG4gICAgICAgICAgICAgIHYxMXogPSB2NDF6O1xyXG4gICAgICAgICAgICAgIHYxMnggPSB2NDJ4O1xyXG4gICAgICAgICAgICAgIHYxMnkgPSB2NDJ5O1xyXG4gICAgICAgICAgICAgIHYxMnogPSB2NDJ6O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIC8vcmV0dXJuIGZhbHNlO1xyXG4gICAgfSxcclxuXHJcbiAgICBzdXBwb3J0UG9pbnQ6IGZ1bmN0aW9uIChjLCBkeCwgZHksIGR6LCBvdXQpIHtcclxuXHJcbiAgICAgIHZhciByb3QgPSBjLnJvdGF0aW9uLmVsZW1lbnRzO1xyXG4gICAgICB2YXIgbGR4ID0gcm90WzBdICogZHggKyByb3RbM10gKiBkeSArIHJvdFs2XSAqIGR6O1xyXG4gICAgICB2YXIgbGR5ID0gcm90WzFdICogZHggKyByb3RbNF0gKiBkeSArIHJvdFs3XSAqIGR6O1xyXG4gICAgICB2YXIgbGR6ID0gcm90WzJdICogZHggKyByb3RbNV0gKiBkeSArIHJvdFs4XSAqIGR6O1xyXG4gICAgICB2YXIgcmFkeCA9IGxkeDtcclxuICAgICAgdmFyIHJhZHogPSBsZHo7XHJcbiAgICAgIHZhciBsZW4gPSByYWR4ICogcmFkeCArIHJhZHogKiByYWR6O1xyXG4gICAgICB2YXIgcmFkID0gYy5yYWRpdXM7XHJcbiAgICAgIHZhciBoaCA9IGMuaGFsZkhlaWdodDtcclxuICAgICAgdmFyIG94O1xyXG4gICAgICB2YXIgb3k7XHJcbiAgICAgIHZhciBvejtcclxuICAgICAgaWYgKGxlbiA9PSAwKSB7XHJcbiAgICAgICAgaWYgKGxkeSA8IDApIHtcclxuICAgICAgICAgIG94ID0gcmFkO1xyXG4gICAgICAgICAgb3kgPSAtaGg7XHJcbiAgICAgICAgICBveiA9IDA7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIG94ID0gcmFkO1xyXG4gICAgICAgICAgb3kgPSBoaDtcclxuICAgICAgICAgIG96ID0gMDtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbGVuID0gYy5yYWRpdXMgLyBfTWF0aC5zcXJ0KGxlbik7XHJcbiAgICAgICAgaWYgKGxkeSA8IDApIHtcclxuICAgICAgICAgIG94ID0gcmFkeCAqIGxlbjtcclxuICAgICAgICAgIG95ID0gLWhoO1xyXG4gICAgICAgICAgb3ogPSByYWR6ICogbGVuO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBveCA9IHJhZHggKiBsZW47XHJcbiAgICAgICAgICBveSA9IGhoO1xyXG4gICAgICAgICAgb3ogPSByYWR6ICogbGVuO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBsZHggPSByb3RbMF0gKiBveCArIHJvdFsxXSAqIG95ICsgcm90WzJdICogb3ogKyBjLnBvc2l0aW9uLng7XHJcbiAgICAgIGxkeSA9IHJvdFszXSAqIG94ICsgcm90WzRdICogb3kgKyByb3RbNV0gKiBveiArIGMucG9zaXRpb24ueTtcclxuICAgICAgbGR6ID0gcm90WzZdICogb3ggKyByb3RbN10gKiBveSArIHJvdFs4XSAqIG96ICsgYy5wb3NpdGlvbi56O1xyXG4gICAgICBvdXQuc2V0KGxkeCwgbGR5LCBsZHopO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgZGV0ZWN0Q29sbGlzaW9uOiBmdW5jdGlvbiAoc2hhcGUxLCBzaGFwZTIsIG1hbmlmb2xkKSB7XHJcblxyXG4gICAgICB2YXIgYzE7XHJcbiAgICAgIHZhciBjMjtcclxuICAgICAgaWYgKHNoYXBlMS5pZCA8IHNoYXBlMi5pZCkge1xyXG4gICAgICAgIGMxID0gc2hhcGUxO1xyXG4gICAgICAgIGMyID0gc2hhcGUyO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGMxID0gc2hhcGUyO1xyXG4gICAgICAgIGMyID0gc2hhcGUxO1xyXG4gICAgICB9XHJcbiAgICAgIHZhciBwMSA9IGMxLnBvc2l0aW9uO1xyXG4gICAgICB2YXIgcDIgPSBjMi5wb3NpdGlvbjtcclxuICAgICAgdmFyIHAxeCA9IHAxLng7XHJcbiAgICAgIHZhciBwMXkgPSBwMS55O1xyXG4gICAgICB2YXIgcDF6ID0gcDEuejtcclxuICAgICAgdmFyIHAyeCA9IHAyLng7XHJcbiAgICAgIHZhciBwMnkgPSBwMi55O1xyXG4gICAgICB2YXIgcDJ6ID0gcDIuejtcclxuICAgICAgdmFyIGgxID0gYzEuaGFsZkhlaWdodDtcclxuICAgICAgdmFyIGgyID0gYzIuaGFsZkhlaWdodDtcclxuICAgICAgdmFyIG4xID0gYzEubm9ybWFsRGlyZWN0aW9uO1xyXG4gICAgICB2YXIgbjIgPSBjMi5ub3JtYWxEaXJlY3Rpb247XHJcbiAgICAgIHZhciBkMSA9IGMxLmhhbGZEaXJlY3Rpb247XHJcbiAgICAgIHZhciBkMiA9IGMyLmhhbGZEaXJlY3Rpb247XHJcbiAgICAgIHZhciByMSA9IGMxLnJhZGl1cztcclxuICAgICAgdmFyIHIyID0gYzIucmFkaXVzO1xyXG4gICAgICB2YXIgbjF4ID0gbjEueDtcclxuICAgICAgdmFyIG4xeSA9IG4xLnk7XHJcbiAgICAgIHZhciBuMXogPSBuMS56O1xyXG4gICAgICB2YXIgbjJ4ID0gbjIueDtcclxuICAgICAgdmFyIG4yeSA9IG4yLnk7XHJcbiAgICAgIHZhciBuMnogPSBuMi56O1xyXG4gICAgICB2YXIgZDF4ID0gZDEueDtcclxuICAgICAgdmFyIGQxeSA9IGQxLnk7XHJcbiAgICAgIHZhciBkMXogPSBkMS56O1xyXG4gICAgICB2YXIgZDJ4ID0gZDIueDtcclxuICAgICAgdmFyIGQyeSA9IGQyLnk7XHJcbiAgICAgIHZhciBkMnogPSBkMi56O1xyXG4gICAgICB2YXIgZHggPSBwMXggLSBwMng7XHJcbiAgICAgIHZhciBkeSA9IHAxeSAtIHAyeTtcclxuICAgICAgdmFyIGR6ID0gcDF6IC0gcDJ6O1xyXG4gICAgICB2YXIgbGVuO1xyXG4gICAgICB2YXIgYzF4O1xyXG4gICAgICB2YXIgYzF5O1xyXG4gICAgICB2YXIgYzF6O1xyXG4gICAgICB2YXIgYzJ4O1xyXG4gICAgICB2YXIgYzJ5O1xyXG4gICAgICB2YXIgYzJ6O1xyXG4gICAgICB2YXIgdHg7XHJcbiAgICAgIHZhciB0eTtcclxuICAgICAgdmFyIHR6O1xyXG4gICAgICB2YXIgc3g7XHJcbiAgICAgIHZhciBzeTtcclxuICAgICAgdmFyIHN6O1xyXG4gICAgICB2YXIgZXg7XHJcbiAgICAgIHZhciBleTtcclxuICAgICAgdmFyIGV6O1xyXG4gICAgICB2YXIgZGVwdGgxO1xyXG4gICAgICB2YXIgZGVwdGgyO1xyXG4gICAgICB2YXIgZG90O1xyXG4gICAgICB2YXIgdDE7XHJcbiAgICAgIHZhciB0MjtcclxuICAgICAgdmFyIHNlcCA9IG5ldyBWZWMzKCk7XHJcbiAgICAgIHZhciBwb3MgPSBuZXcgVmVjMygpO1xyXG4gICAgICB2YXIgZGVwID0gbmV3IFZlYzMoKTtcclxuICAgICAgaWYgKCF0aGlzLmdldFNlcChjMSwgYzIsIHNlcCwgcG9zLCBkZXApKSByZXR1cm47XHJcbiAgICAgIHZhciBkb3QxID0gc2VwLnggKiBuMXggKyBzZXAueSAqIG4xeSArIHNlcC56ICogbjF6O1xyXG4gICAgICB2YXIgZG90MiA9IHNlcC54ICogbjJ4ICsgc2VwLnkgKiBuMnkgKyBzZXAueiAqIG4yejtcclxuICAgICAgdmFyIHJpZ2h0MSA9IGRvdDEgPiAwO1xyXG4gICAgICB2YXIgcmlnaHQyID0gZG90MiA+IDA7XHJcbiAgICAgIGlmICghcmlnaHQxKSBkb3QxID0gLWRvdDE7XHJcbiAgICAgIGlmICghcmlnaHQyKSBkb3QyID0gLWRvdDI7XHJcbiAgICAgIHZhciBzdGF0ZSA9IDA7XHJcbiAgICAgIGlmIChkb3QxID4gMC45OTkgfHwgZG90MiA+IDAuOTk5KSB7XHJcbiAgICAgICAgaWYgKGRvdDEgPiBkb3QyKSBzdGF0ZSA9IDE7XHJcbiAgICAgICAgZWxzZSBzdGF0ZSA9IDI7XHJcbiAgICAgIH1cclxuICAgICAgdmFyIG54O1xyXG4gICAgICB2YXIgbnk7XHJcbiAgICAgIHZhciBuejtcclxuICAgICAgdmFyIGRlcHRoID0gZGVwLng7XHJcbiAgICAgIHZhciByMDA7XHJcbiAgICAgIHZhciByMDE7XHJcbiAgICAgIHZhciByMDI7XHJcbiAgICAgIHZhciByMTA7XHJcbiAgICAgIHZhciByMTE7XHJcbiAgICAgIHZhciByMTI7XHJcbiAgICAgIHZhciByMjA7XHJcbiAgICAgIHZhciByMjE7XHJcbiAgICAgIHZhciByMjI7XHJcbiAgICAgIHZhciBweDtcclxuICAgICAgdmFyIHB5O1xyXG4gICAgICB2YXIgcHo7XHJcbiAgICAgIHZhciBwZDtcclxuICAgICAgdmFyIGE7XHJcbiAgICAgIHZhciBiO1xyXG4gICAgICB2YXIgZTtcclxuICAgICAgdmFyIGY7XHJcbiAgICAgIG54ID0gc2VwLng7XHJcbiAgICAgIG55ID0gc2VwLnk7XHJcbiAgICAgIG56ID0gc2VwLno7XHJcbiAgICAgIHN3aXRjaCAoc3RhdGUpIHtcclxuICAgICAgICBjYXNlIDA6XHJcbiAgICAgICAgICBtYW5pZm9sZC5hZGRQb2ludChwb3MueCwgcG9zLnksIHBvcy56LCBueCwgbnksIG56LCBkZXB0aCwgZmFsc2UpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgICAgaWYgKHJpZ2h0MSkge1xyXG4gICAgICAgICAgICBjMXggPSBwMXggKyBkMXg7XHJcbiAgICAgICAgICAgIGMxeSA9IHAxeSArIGQxeTtcclxuICAgICAgICAgICAgYzF6ID0gcDF6ICsgZDF6O1xyXG4gICAgICAgICAgICBueCA9IG4xeDtcclxuICAgICAgICAgICAgbnkgPSBuMXk7XHJcbiAgICAgICAgICAgIG56ID0gbjF6O1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgYzF4ID0gcDF4IC0gZDF4O1xyXG4gICAgICAgICAgICBjMXkgPSBwMXkgLSBkMXk7XHJcbiAgICAgICAgICAgIGMxeiA9IHAxeiAtIGQxejtcclxuICAgICAgICAgICAgbnggPSAtbjF4O1xyXG4gICAgICAgICAgICBueSA9IC1uMXk7XHJcbiAgICAgICAgICAgIG56ID0gLW4xejtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGRvdCA9IG54ICogbjJ4ICsgbnkgKiBuMnkgKyBueiAqIG4yejtcclxuICAgICAgICAgIGlmIChkb3QgPCAwKSBsZW4gPSBoMjtcclxuICAgICAgICAgIGVsc2UgbGVuID0gLWgyO1xyXG4gICAgICAgICAgYzJ4ID0gcDJ4ICsgbGVuICogbjJ4O1xyXG4gICAgICAgICAgYzJ5ID0gcDJ5ICsgbGVuICogbjJ5O1xyXG4gICAgICAgICAgYzJ6ID0gcDJ6ICsgbGVuICogbjJ6O1xyXG4gICAgICAgICAgaWYgKGRvdDIgPj0gMC45OTk5OTkpIHtcclxuICAgICAgICAgICAgdHggPSAtbnk7XHJcbiAgICAgICAgICAgIHR5ID0gbno7XHJcbiAgICAgICAgICAgIHR6ID0gbng7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0eCA9IG54O1xyXG4gICAgICAgICAgICB0eSA9IG55O1xyXG4gICAgICAgICAgICB0eiA9IG56O1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgbGVuID0gdHggKiBuMnggKyB0eSAqIG4yeSArIHR6ICogbjJ6O1xyXG4gICAgICAgICAgZHggPSBsZW4gKiBuMnggLSB0eDtcclxuICAgICAgICAgIGR5ID0gbGVuICogbjJ5IC0gdHk7XHJcbiAgICAgICAgICBkeiA9IGxlbiAqIG4yeiAtIHR6O1xyXG4gICAgICAgICAgbGVuID0gX01hdGguc3FydChkeCAqIGR4ICsgZHkgKiBkeSArIGR6ICogZHopO1xyXG4gICAgICAgICAgaWYgKGxlbiA9PSAwKSBicmVhaztcclxuICAgICAgICAgIGxlbiA9IHIyIC8gbGVuO1xyXG4gICAgICAgICAgZHggKj0gbGVuO1xyXG4gICAgICAgICAgZHkgKj0gbGVuO1xyXG4gICAgICAgICAgZHogKj0gbGVuO1xyXG4gICAgICAgICAgdHggPSBjMnggKyBkeDtcclxuICAgICAgICAgIHR5ID0gYzJ5ICsgZHk7XHJcbiAgICAgICAgICB0eiA9IGMyeiArIGR6O1xyXG4gICAgICAgICAgaWYgKGRvdCA8IC0wLjk2IHx8IGRvdCA+IDAuOTYpIHtcclxuICAgICAgICAgICAgcjAwID0gbjJ4ICogbjJ4ICogMS41IC0gMC41O1xyXG4gICAgICAgICAgICByMDEgPSBuMnggKiBuMnkgKiAxLjUgLSBuMnogKiAwLjg2NjAyNTQwMztcclxuICAgICAgICAgICAgcjAyID0gbjJ4ICogbjJ6ICogMS41ICsgbjJ5ICogMC44NjYwMjU0MDM7XHJcbiAgICAgICAgICAgIHIxMCA9IG4yeSAqIG4yeCAqIDEuNSArIG4yeiAqIDAuODY2MDI1NDAzO1xyXG4gICAgICAgICAgICByMTEgPSBuMnkgKiBuMnkgKiAxLjUgLSAwLjU7XHJcbiAgICAgICAgICAgIHIxMiA9IG4yeSAqIG4yeiAqIDEuNSAtIG4yeCAqIDAuODY2MDI1NDAzO1xyXG4gICAgICAgICAgICByMjAgPSBuMnogKiBuMnggKiAxLjUgLSBuMnkgKiAwLjg2NjAyNTQwMztcclxuICAgICAgICAgICAgcjIxID0gbjJ6ICogbjJ5ICogMS41ICsgbjJ4ICogMC44NjYwMjU0MDM7XHJcbiAgICAgICAgICAgIHIyMiA9IG4yeiAqIG4yeiAqIDEuNSAtIDAuNTtcclxuICAgICAgICAgICAgcHggPSB0eDtcclxuICAgICAgICAgICAgcHkgPSB0eTtcclxuICAgICAgICAgICAgcHogPSB0ejtcclxuICAgICAgICAgICAgcGQgPSBueCAqIChweCAtIGMxeCkgKyBueSAqIChweSAtIGMxeSkgKyBueiAqIChweiAtIGMxeik7XHJcbiAgICAgICAgICAgIHR4ID0gcHggLSBwZCAqIG54IC0gYzF4O1xyXG4gICAgICAgICAgICB0eSA9IHB5IC0gcGQgKiBueSAtIGMxeTtcclxuICAgICAgICAgICAgdHogPSBweiAtIHBkICogbnogLSBjMXo7XHJcbiAgICAgICAgICAgIGxlbiA9IHR4ICogdHggKyB0eSAqIHR5ICsgdHogKiB0ejtcclxuICAgICAgICAgICAgaWYgKGxlbiA+IHIxICogcjEpIHtcclxuICAgICAgICAgICAgICBsZW4gPSByMSAvIF9NYXRoLnNxcnQobGVuKTtcclxuICAgICAgICAgICAgICB0eCAqPSBsZW47XHJcbiAgICAgICAgICAgICAgdHkgKj0gbGVuO1xyXG4gICAgICAgICAgICAgIHR6ICo9IGxlbjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBweCA9IGMxeCArIHR4O1xyXG4gICAgICAgICAgICBweSA9IGMxeSArIHR5O1xyXG4gICAgICAgICAgICBweiA9IGMxeiArIHR6O1xyXG4gICAgICAgICAgICBtYW5pZm9sZC5hZGRQb2ludChweCwgcHksIHB6LCBueCwgbnksIG56LCBwZCwgZmFsc2UpO1xyXG4gICAgICAgICAgICBweCA9IGR4ICogcjAwICsgZHkgKiByMDEgKyBkeiAqIHIwMjtcclxuICAgICAgICAgICAgcHkgPSBkeCAqIHIxMCArIGR5ICogcjExICsgZHogKiByMTI7XHJcbiAgICAgICAgICAgIHB6ID0gZHggKiByMjAgKyBkeSAqIHIyMSArIGR6ICogcjIyO1xyXG4gICAgICAgICAgICBweCA9IChkeCA9IHB4KSArIGMyeDtcclxuICAgICAgICAgICAgcHkgPSAoZHkgPSBweSkgKyBjMnk7XHJcbiAgICAgICAgICAgIHB6ID0gKGR6ID0gcHopICsgYzJ6O1xyXG4gICAgICAgICAgICBwZCA9IG54ICogKHB4IC0gYzF4KSArIG55ICogKHB5IC0gYzF5KSArIG56ICogKHB6IC0gYzF6KTtcclxuICAgICAgICAgICAgaWYgKHBkIDw9IDApIHtcclxuICAgICAgICAgICAgICB0eCA9IHB4IC0gcGQgKiBueCAtIGMxeDtcclxuICAgICAgICAgICAgICB0eSA9IHB5IC0gcGQgKiBueSAtIGMxeTtcclxuICAgICAgICAgICAgICB0eiA9IHB6IC0gcGQgKiBueiAtIGMxejtcclxuICAgICAgICAgICAgICBsZW4gPSB0eCAqIHR4ICsgdHkgKiB0eSArIHR6ICogdHo7XHJcbiAgICAgICAgICAgICAgaWYgKGxlbiA+IHIxICogcjEpIHtcclxuICAgICAgICAgICAgICAgIGxlbiA9IHIxIC8gX01hdGguc3FydChsZW4pO1xyXG4gICAgICAgICAgICAgICAgdHggKj0gbGVuO1xyXG4gICAgICAgICAgICAgICAgdHkgKj0gbGVuO1xyXG4gICAgICAgICAgICAgICAgdHogKj0gbGVuO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICBweCA9IGMxeCArIHR4O1xyXG4gICAgICAgICAgICAgIHB5ID0gYzF5ICsgdHk7XHJcbiAgICAgICAgICAgICAgcHogPSBjMXogKyB0ejtcclxuICAgICAgICAgICAgICBtYW5pZm9sZC5hZGRQb2ludChweCwgcHksIHB6LCBueCwgbnksIG56LCBwZCwgZmFsc2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHB4ID0gZHggKiByMDAgKyBkeSAqIHIwMSArIGR6ICogcjAyO1xyXG4gICAgICAgICAgICBweSA9IGR4ICogcjEwICsgZHkgKiByMTEgKyBkeiAqIHIxMjtcclxuICAgICAgICAgICAgcHogPSBkeCAqIHIyMCArIGR5ICogcjIxICsgZHogKiByMjI7XHJcbiAgICAgICAgICAgIHB4ID0gKGR4ID0gcHgpICsgYzJ4O1xyXG4gICAgICAgICAgICBweSA9IChkeSA9IHB5KSArIGMyeTtcclxuICAgICAgICAgICAgcHogPSAoZHogPSBweikgKyBjMno7XHJcbiAgICAgICAgICAgIHBkID0gbnggKiAocHggLSBjMXgpICsgbnkgKiAocHkgLSBjMXkpICsgbnogKiAocHogLSBjMXopO1xyXG4gICAgICAgICAgICBpZiAocGQgPD0gMCkge1xyXG4gICAgICAgICAgICAgIHR4ID0gcHggLSBwZCAqIG54IC0gYzF4O1xyXG4gICAgICAgICAgICAgIHR5ID0gcHkgLSBwZCAqIG55IC0gYzF5O1xyXG4gICAgICAgICAgICAgIHR6ID0gcHogLSBwZCAqIG56IC0gYzF6O1xyXG4gICAgICAgICAgICAgIGxlbiA9IHR4ICogdHggKyB0eSAqIHR5ICsgdHogKiB0ejtcclxuICAgICAgICAgICAgICBpZiAobGVuID4gcjEgKiByMSkge1xyXG4gICAgICAgICAgICAgICAgbGVuID0gcjEgLyBfTWF0aC5zcXJ0KGxlbik7XHJcbiAgICAgICAgICAgICAgICB0eCAqPSBsZW47XHJcbiAgICAgICAgICAgICAgICB0eSAqPSBsZW47XHJcbiAgICAgICAgICAgICAgICB0eiAqPSBsZW47XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIHB4ID0gYzF4ICsgdHg7XHJcbiAgICAgICAgICAgICAgcHkgPSBjMXkgKyB0eTtcclxuICAgICAgICAgICAgICBweiA9IGMxeiArIHR6O1xyXG4gICAgICAgICAgICAgIG1hbmlmb2xkLmFkZFBvaW50KHB4LCBweSwgcHosIG54LCBueSwgbnosIHBkLCBmYWxzZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHN4ID0gdHg7XHJcbiAgICAgICAgICAgIHN5ID0gdHk7XHJcbiAgICAgICAgICAgIHN6ID0gdHo7XHJcbiAgICAgICAgICAgIGRlcHRoMSA9IG54ICogKHN4IC0gYzF4KSArIG55ICogKHN5IC0gYzF5KSArIG56ICogKHN6IC0gYzF6KTtcclxuICAgICAgICAgICAgc3ggLT0gZGVwdGgxICogbng7XHJcbiAgICAgICAgICAgIHN5IC09IGRlcHRoMSAqIG55O1xyXG4gICAgICAgICAgICBzeiAtPSBkZXB0aDEgKiBuejtcclxuICAgICAgICAgICAgaWYgKGRvdCA+IDApIHtcclxuICAgICAgICAgICAgICBleCA9IHR4ICsgbjJ4ICogaDIgKiAyO1xyXG4gICAgICAgICAgICAgIGV5ID0gdHkgKyBuMnkgKiBoMiAqIDI7XHJcbiAgICAgICAgICAgICAgZXogPSB0eiArIG4yeiAqIGgyICogMjtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBleCA9IHR4IC0gbjJ4ICogaDIgKiAyO1xyXG4gICAgICAgICAgICAgIGV5ID0gdHkgLSBuMnkgKiBoMiAqIDI7XHJcbiAgICAgICAgICAgICAgZXogPSB0eiAtIG4yeiAqIGgyICogMjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBkZXB0aDIgPSBueCAqIChleCAtIGMxeCkgKyBueSAqIChleSAtIGMxeSkgKyBueiAqIChleiAtIGMxeik7XHJcbiAgICAgICAgICAgIGV4IC09IGRlcHRoMiAqIG54O1xyXG4gICAgICAgICAgICBleSAtPSBkZXB0aDIgKiBueTtcclxuICAgICAgICAgICAgZXogLT0gZGVwdGgyICogbno7XHJcbiAgICAgICAgICAgIGR4ID0gYzF4IC0gc3g7XHJcbiAgICAgICAgICAgIGR5ID0gYzF5IC0gc3k7XHJcbiAgICAgICAgICAgIGR6ID0gYzF6IC0gc3o7XHJcbiAgICAgICAgICAgIHR4ID0gZXggLSBzeDtcclxuICAgICAgICAgICAgdHkgPSBleSAtIHN5O1xyXG4gICAgICAgICAgICB0eiA9IGV6IC0gc3o7XHJcbiAgICAgICAgICAgIGEgPSBkeCAqIGR4ICsgZHkgKiBkeSArIGR6ICogZHo7XHJcbiAgICAgICAgICAgIGIgPSBkeCAqIHR4ICsgZHkgKiB0eSArIGR6ICogdHo7XHJcbiAgICAgICAgICAgIGUgPSB0eCAqIHR4ICsgdHkgKiB0eSArIHR6ICogdHo7XHJcbiAgICAgICAgICAgIGYgPSBiICogYiAtIGUgKiAoYSAtIHIxICogcjEpO1xyXG4gICAgICAgICAgICBpZiAoZiA8IDApIGJyZWFrO1xyXG4gICAgICAgICAgICBmID0gX01hdGguc3FydChmKTtcclxuICAgICAgICAgICAgdDEgPSAoYiArIGYpIC8gZTtcclxuICAgICAgICAgICAgdDIgPSAoYiAtIGYpIC8gZTtcclxuICAgICAgICAgICAgaWYgKHQyIDwgdDEpIHtcclxuICAgICAgICAgICAgICBsZW4gPSB0MTtcclxuICAgICAgICAgICAgICB0MSA9IHQyO1xyXG4gICAgICAgICAgICAgIHQyID0gbGVuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0MiA+IDEpIHQyID0gMTtcclxuICAgICAgICAgICAgaWYgKHQxIDwgMCkgdDEgPSAwO1xyXG4gICAgICAgICAgICB0eCA9IHN4ICsgKGV4IC0gc3gpICogdDE7XHJcbiAgICAgICAgICAgIHR5ID0gc3kgKyAoZXkgLSBzeSkgKiB0MTtcclxuICAgICAgICAgICAgdHogPSBzeiArIChleiAtIHN6KSAqIHQxO1xyXG4gICAgICAgICAgICBleCA9IHN4ICsgKGV4IC0gc3gpICogdDI7XHJcbiAgICAgICAgICAgIGV5ID0gc3kgKyAoZXkgLSBzeSkgKiB0MjtcclxuICAgICAgICAgICAgZXogPSBzeiArIChleiAtIHN6KSAqIHQyO1xyXG4gICAgICAgICAgICBzeCA9IHR4O1xyXG4gICAgICAgICAgICBzeSA9IHR5O1xyXG4gICAgICAgICAgICBzeiA9IHR6O1xyXG4gICAgICAgICAgICBsZW4gPSBkZXB0aDEgKyAoZGVwdGgyIC0gZGVwdGgxKSAqIHQxO1xyXG4gICAgICAgICAgICBkZXB0aDIgPSBkZXB0aDEgKyAoZGVwdGgyIC0gZGVwdGgxKSAqIHQyO1xyXG4gICAgICAgICAgICBkZXB0aDEgPSBsZW47XHJcbiAgICAgICAgICAgIGlmIChkZXB0aDEgPCAwKSBtYW5pZm9sZC5hZGRQb2ludChzeCwgc3ksIHN6LCBueCwgbnksIG56LCBwZCwgZmFsc2UpO1xyXG4gICAgICAgICAgICBpZiAoZGVwdGgyIDwgMCkgbWFuaWZvbGQuYWRkUG9pbnQoZXgsIGV5LCBleiwgbngsIG55LCBueiwgcGQsIGZhbHNlKTtcclxuXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICBpZiAocmlnaHQyKSB7XHJcbiAgICAgICAgICAgIGMyeCA9IHAyeCAtIGQyeDtcclxuICAgICAgICAgICAgYzJ5ID0gcDJ5IC0gZDJ5O1xyXG4gICAgICAgICAgICBjMnogPSBwMnogLSBkMno7XHJcbiAgICAgICAgICAgIG54ID0gLW4yeDtcclxuICAgICAgICAgICAgbnkgPSAtbjJ5O1xyXG4gICAgICAgICAgICBueiA9IC1uMno7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjMnggPSBwMnggKyBkMng7XHJcbiAgICAgICAgICAgIGMyeSA9IHAyeSArIGQyeTtcclxuICAgICAgICAgICAgYzJ6ID0gcDJ6ICsgZDJ6O1xyXG4gICAgICAgICAgICBueCA9IG4yeDtcclxuICAgICAgICAgICAgbnkgPSBuMnk7XHJcbiAgICAgICAgICAgIG56ID0gbjJ6O1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZG90ID0gbnggKiBuMXggKyBueSAqIG4xeSArIG56ICogbjF6O1xyXG4gICAgICAgICAgaWYgKGRvdCA8IDApIGxlbiA9IGgxO1xyXG4gICAgICAgICAgZWxzZSBsZW4gPSAtaDE7XHJcbiAgICAgICAgICBjMXggPSBwMXggKyBsZW4gKiBuMXg7XHJcbiAgICAgICAgICBjMXkgPSBwMXkgKyBsZW4gKiBuMXk7XHJcbiAgICAgICAgICBjMXogPSBwMXogKyBsZW4gKiBuMXo7XHJcbiAgICAgICAgICBpZiAoZG90MSA+PSAwLjk5OTk5OSkge1xyXG4gICAgICAgICAgICB0eCA9IC1ueTtcclxuICAgICAgICAgICAgdHkgPSBuejtcclxuICAgICAgICAgICAgdHogPSBueDtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHR4ID0gbng7XHJcbiAgICAgICAgICAgIHR5ID0gbnk7XHJcbiAgICAgICAgICAgIHR6ID0gbno7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBsZW4gPSB0eCAqIG4xeCArIHR5ICogbjF5ICsgdHogKiBuMXo7XHJcbiAgICAgICAgICBkeCA9IGxlbiAqIG4xeCAtIHR4O1xyXG4gICAgICAgICAgZHkgPSBsZW4gKiBuMXkgLSB0eTtcclxuICAgICAgICAgIGR6ID0gbGVuICogbjF6IC0gdHo7XHJcbiAgICAgICAgICBsZW4gPSBfTWF0aC5zcXJ0KGR4ICogZHggKyBkeSAqIGR5ICsgZHogKiBkeik7XHJcbiAgICAgICAgICBpZiAobGVuID09IDApIGJyZWFrO1xyXG4gICAgICAgICAgbGVuID0gcjEgLyBsZW47XHJcbiAgICAgICAgICBkeCAqPSBsZW47XHJcbiAgICAgICAgICBkeSAqPSBsZW47XHJcbiAgICAgICAgICBkeiAqPSBsZW47XHJcbiAgICAgICAgICB0eCA9IGMxeCArIGR4O1xyXG4gICAgICAgICAgdHkgPSBjMXkgKyBkeTtcclxuICAgICAgICAgIHR6ID0gYzF6ICsgZHo7XHJcbiAgICAgICAgICBpZiAoZG90IDwgLTAuOTYgfHwgZG90ID4gMC45Nikge1xyXG4gICAgICAgICAgICByMDAgPSBuMXggKiBuMXggKiAxLjUgLSAwLjU7XHJcbiAgICAgICAgICAgIHIwMSA9IG4xeCAqIG4xeSAqIDEuNSAtIG4xeiAqIDAuODY2MDI1NDAzO1xyXG4gICAgICAgICAgICByMDIgPSBuMXggKiBuMXogKiAxLjUgKyBuMXkgKiAwLjg2NjAyNTQwMztcclxuICAgICAgICAgICAgcjEwID0gbjF5ICogbjF4ICogMS41ICsgbjF6ICogMC44NjYwMjU0MDM7XHJcbiAgICAgICAgICAgIHIxMSA9IG4xeSAqIG4xeSAqIDEuNSAtIDAuNTtcclxuICAgICAgICAgICAgcjEyID0gbjF5ICogbjF6ICogMS41IC0gbjF4ICogMC44NjYwMjU0MDM7XHJcbiAgICAgICAgICAgIHIyMCA9IG4xeiAqIG4xeCAqIDEuNSAtIG4xeSAqIDAuODY2MDI1NDAzO1xyXG4gICAgICAgICAgICByMjEgPSBuMXogKiBuMXkgKiAxLjUgKyBuMXggKiAwLjg2NjAyNTQwMztcclxuICAgICAgICAgICAgcjIyID0gbjF6ICogbjF6ICogMS41IC0gMC41O1xyXG4gICAgICAgICAgICBweCA9IHR4O1xyXG4gICAgICAgICAgICBweSA9IHR5O1xyXG4gICAgICAgICAgICBweiA9IHR6O1xyXG4gICAgICAgICAgICBwZCA9IG54ICogKHB4IC0gYzJ4KSArIG55ICogKHB5IC0gYzJ5KSArIG56ICogKHB6IC0gYzJ6KTtcclxuICAgICAgICAgICAgdHggPSBweCAtIHBkICogbnggLSBjMng7XHJcbiAgICAgICAgICAgIHR5ID0gcHkgLSBwZCAqIG55IC0gYzJ5O1xyXG4gICAgICAgICAgICB0eiA9IHB6IC0gcGQgKiBueiAtIGMyejtcclxuICAgICAgICAgICAgbGVuID0gdHggKiB0eCArIHR5ICogdHkgKyB0eiAqIHR6O1xyXG4gICAgICAgICAgICBpZiAobGVuID4gcjIgKiByMikge1xyXG4gICAgICAgICAgICAgIGxlbiA9IHIyIC8gX01hdGguc3FydChsZW4pO1xyXG4gICAgICAgICAgICAgIHR4ICo9IGxlbjtcclxuICAgICAgICAgICAgICB0eSAqPSBsZW47XHJcbiAgICAgICAgICAgICAgdHogKj0gbGVuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHB4ID0gYzJ4ICsgdHg7XHJcbiAgICAgICAgICAgIHB5ID0gYzJ5ICsgdHk7XHJcbiAgICAgICAgICAgIHB6ID0gYzJ6ICsgdHo7XHJcbiAgICAgICAgICAgIG1hbmlmb2xkLmFkZFBvaW50KHB4LCBweSwgcHosIC1ueCwgLW55LCAtbnosIHBkLCBmYWxzZSk7XHJcbiAgICAgICAgICAgIHB4ID0gZHggKiByMDAgKyBkeSAqIHIwMSArIGR6ICogcjAyO1xyXG4gICAgICAgICAgICBweSA9IGR4ICogcjEwICsgZHkgKiByMTEgKyBkeiAqIHIxMjtcclxuICAgICAgICAgICAgcHogPSBkeCAqIHIyMCArIGR5ICogcjIxICsgZHogKiByMjI7XHJcbiAgICAgICAgICAgIHB4ID0gKGR4ID0gcHgpICsgYzF4O1xyXG4gICAgICAgICAgICBweSA9IChkeSA9IHB5KSArIGMxeTtcclxuICAgICAgICAgICAgcHogPSAoZHogPSBweikgKyBjMXo7XHJcbiAgICAgICAgICAgIHBkID0gbnggKiAocHggLSBjMngpICsgbnkgKiAocHkgLSBjMnkpICsgbnogKiAocHogLSBjMnopO1xyXG4gICAgICAgICAgICBpZiAocGQgPD0gMCkge1xyXG4gICAgICAgICAgICAgIHR4ID0gcHggLSBwZCAqIG54IC0gYzJ4O1xyXG4gICAgICAgICAgICAgIHR5ID0gcHkgLSBwZCAqIG55IC0gYzJ5O1xyXG4gICAgICAgICAgICAgIHR6ID0gcHogLSBwZCAqIG56IC0gYzJ6O1xyXG4gICAgICAgICAgICAgIGxlbiA9IHR4ICogdHggKyB0eSAqIHR5ICsgdHogKiB0ejtcclxuICAgICAgICAgICAgICBpZiAobGVuID4gcjIgKiByMikge1xyXG4gICAgICAgICAgICAgICAgbGVuID0gcjIgLyBfTWF0aC5zcXJ0KGxlbik7XHJcbiAgICAgICAgICAgICAgICB0eCAqPSBsZW47XHJcbiAgICAgICAgICAgICAgICB0eSAqPSBsZW47XHJcbiAgICAgICAgICAgICAgICB0eiAqPSBsZW47XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIHB4ID0gYzJ4ICsgdHg7XHJcbiAgICAgICAgICAgICAgcHkgPSBjMnkgKyB0eTtcclxuICAgICAgICAgICAgICBweiA9IGMyeiArIHR6O1xyXG4gICAgICAgICAgICAgIG1hbmlmb2xkLmFkZFBvaW50KHB4LCBweSwgcHosIC1ueCwgLW55LCAtbnosIHBkLCBmYWxzZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcHggPSBkeCAqIHIwMCArIGR5ICogcjAxICsgZHogKiByMDI7XHJcbiAgICAgICAgICAgIHB5ID0gZHggKiByMTAgKyBkeSAqIHIxMSArIGR6ICogcjEyO1xyXG4gICAgICAgICAgICBweiA9IGR4ICogcjIwICsgZHkgKiByMjEgKyBkeiAqIHIyMjtcclxuICAgICAgICAgICAgcHggPSAoZHggPSBweCkgKyBjMXg7XHJcbiAgICAgICAgICAgIHB5ID0gKGR5ID0gcHkpICsgYzF5O1xyXG4gICAgICAgICAgICBweiA9IChkeiA9IHB6KSArIGMxejtcclxuICAgICAgICAgICAgcGQgPSBueCAqIChweCAtIGMyeCkgKyBueSAqIChweSAtIGMyeSkgKyBueiAqIChweiAtIGMyeik7XHJcbiAgICAgICAgICAgIGlmIChwZCA8PSAwKSB7XHJcbiAgICAgICAgICAgICAgdHggPSBweCAtIHBkICogbnggLSBjMng7XHJcbiAgICAgICAgICAgICAgdHkgPSBweSAtIHBkICogbnkgLSBjMnk7XHJcbiAgICAgICAgICAgICAgdHogPSBweiAtIHBkICogbnogLSBjMno7XHJcbiAgICAgICAgICAgICAgbGVuID0gdHggKiB0eCArIHR5ICogdHkgKyB0eiAqIHR6O1xyXG4gICAgICAgICAgICAgIGlmIChsZW4gPiByMiAqIHIyKSB7XHJcbiAgICAgICAgICAgICAgICBsZW4gPSByMiAvIF9NYXRoLnNxcnQobGVuKTtcclxuICAgICAgICAgICAgICAgIHR4ICo9IGxlbjtcclxuICAgICAgICAgICAgICAgIHR5ICo9IGxlbjtcclxuICAgICAgICAgICAgICAgIHR6ICo9IGxlbjtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgcHggPSBjMnggKyB0eDtcclxuICAgICAgICAgICAgICBweSA9IGMyeSArIHR5O1xyXG4gICAgICAgICAgICAgIHB6ID0gYzJ6ICsgdHo7XHJcbiAgICAgICAgICAgICAgbWFuaWZvbGQuYWRkUG9pbnQocHgsIHB5LCBweiwgLW54LCAtbnksIC1ueiwgcGQsIGZhbHNlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgc3ggPSB0eDtcclxuICAgICAgICAgICAgc3kgPSB0eTtcclxuICAgICAgICAgICAgc3ogPSB0ejtcclxuICAgICAgICAgICAgZGVwdGgxID0gbnggKiAoc3ggLSBjMngpICsgbnkgKiAoc3kgLSBjMnkpICsgbnogKiAoc3ogLSBjMnopO1xyXG4gICAgICAgICAgICBzeCAtPSBkZXB0aDEgKiBueDtcclxuICAgICAgICAgICAgc3kgLT0gZGVwdGgxICogbnk7XHJcbiAgICAgICAgICAgIHN6IC09IGRlcHRoMSAqIG56O1xyXG4gICAgICAgICAgICBpZiAoZG90ID4gMCkge1xyXG4gICAgICAgICAgICAgIGV4ID0gdHggKyBuMXggKiBoMSAqIDI7XHJcbiAgICAgICAgICAgICAgZXkgPSB0eSArIG4xeSAqIGgxICogMjtcclxuICAgICAgICAgICAgICBleiA9IHR6ICsgbjF6ICogaDEgKiAyO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIGV4ID0gdHggLSBuMXggKiBoMSAqIDI7XHJcbiAgICAgICAgICAgICAgZXkgPSB0eSAtIG4xeSAqIGgxICogMjtcclxuICAgICAgICAgICAgICBleiA9IHR6IC0gbjF6ICogaDEgKiAyO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGRlcHRoMiA9IG54ICogKGV4IC0gYzJ4KSArIG55ICogKGV5IC0gYzJ5KSArIG56ICogKGV6IC0gYzJ6KTtcclxuICAgICAgICAgICAgZXggLT0gZGVwdGgyICogbng7XHJcbiAgICAgICAgICAgIGV5IC09IGRlcHRoMiAqIG55O1xyXG4gICAgICAgICAgICBleiAtPSBkZXB0aDIgKiBuejtcclxuICAgICAgICAgICAgZHggPSBjMnggLSBzeDtcclxuICAgICAgICAgICAgZHkgPSBjMnkgLSBzeTtcclxuICAgICAgICAgICAgZHogPSBjMnogLSBzejtcclxuICAgICAgICAgICAgdHggPSBleCAtIHN4O1xyXG4gICAgICAgICAgICB0eSA9IGV5IC0gc3k7XHJcbiAgICAgICAgICAgIHR6ID0gZXogLSBzejtcclxuICAgICAgICAgICAgYSA9IGR4ICogZHggKyBkeSAqIGR5ICsgZHogKiBkejtcclxuICAgICAgICAgICAgYiA9IGR4ICogdHggKyBkeSAqIHR5ICsgZHogKiB0ejtcclxuICAgICAgICAgICAgZSA9IHR4ICogdHggKyB0eSAqIHR5ICsgdHogKiB0ejtcclxuICAgICAgICAgICAgZiA9IGIgKiBiIC0gZSAqIChhIC0gcjIgKiByMik7XHJcbiAgICAgICAgICAgIGlmIChmIDwgMCkgYnJlYWs7XHJcbiAgICAgICAgICAgIGYgPSBfTWF0aC5zcXJ0KGYpO1xyXG4gICAgICAgICAgICB0MSA9IChiICsgZikgLyBlO1xyXG4gICAgICAgICAgICB0MiA9IChiIC0gZikgLyBlO1xyXG4gICAgICAgICAgICBpZiAodDIgPCB0MSkge1xyXG4gICAgICAgICAgICAgIGxlbiA9IHQxO1xyXG4gICAgICAgICAgICAgIHQxID0gdDI7XHJcbiAgICAgICAgICAgICAgdDIgPSBsZW47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHQyID4gMSkgdDIgPSAxO1xyXG4gICAgICAgICAgICBpZiAodDEgPCAwKSB0MSA9IDA7XHJcbiAgICAgICAgICAgIHR4ID0gc3ggKyAoZXggLSBzeCkgKiB0MTtcclxuICAgICAgICAgICAgdHkgPSBzeSArIChleSAtIHN5KSAqIHQxO1xyXG4gICAgICAgICAgICB0eiA9IHN6ICsgKGV6IC0gc3opICogdDE7XHJcbiAgICAgICAgICAgIGV4ID0gc3ggKyAoZXggLSBzeCkgKiB0MjtcclxuICAgICAgICAgICAgZXkgPSBzeSArIChleSAtIHN5KSAqIHQyO1xyXG4gICAgICAgICAgICBleiA9IHN6ICsgKGV6IC0gc3opICogdDI7XHJcbiAgICAgICAgICAgIHN4ID0gdHg7XHJcbiAgICAgICAgICAgIHN5ID0gdHk7XHJcbiAgICAgICAgICAgIHN6ID0gdHo7XHJcbiAgICAgICAgICAgIGxlbiA9IGRlcHRoMSArIChkZXB0aDIgLSBkZXB0aDEpICogdDE7XHJcbiAgICAgICAgICAgIGRlcHRoMiA9IGRlcHRoMSArIChkZXB0aDIgLSBkZXB0aDEpICogdDI7XHJcbiAgICAgICAgICAgIGRlcHRoMSA9IGxlbjtcclxuICAgICAgICAgICAgaWYgKGRlcHRoMSA8IDApIHtcclxuICAgICAgICAgICAgICBtYW5pZm9sZC5hZGRQb2ludChzeCwgc3ksIHN6LCAtbngsIC1ueSwgLW56LCBkZXB0aDEsIGZhbHNlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoZGVwdGgyIDwgMCkge1xyXG4gICAgICAgICAgICAgIG1hbmlmb2xkLmFkZFBvaW50KGV4LCBleSwgZXosIC1ueCwgLW55LCAtbnosIGRlcHRoMiwgZmFsc2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgfSk7XHJcblxyXG4gIC8qKlxyXG4gICAqIEEgY29sbGlzaW9uIGRldGVjdG9yIHdoaWNoIGRldGVjdHMgY29sbGlzaW9ucyBiZXR3ZWVuIHNwaGVyZSBhbmQgYm94LlxyXG4gICAqIEBhdXRob3Igc2FoYXJhblxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIFNwaGVyZUJveENvbGxpc2lvbkRldGVjdG9yKGZsaXApIHtcclxuXHJcbiAgICBDb2xsaXNpb25EZXRlY3Rvci5jYWxsKHRoaXMpO1xyXG4gICAgdGhpcy5mbGlwID0gZmxpcDtcclxuXHJcbiAgfVxyXG4gIFNwaGVyZUJveENvbGxpc2lvbkRldGVjdG9yLnByb3RvdHlwZSA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmNyZWF0ZShDb2xsaXNpb25EZXRlY3Rvci5wcm90b3R5cGUpLCB7XHJcblxyXG4gICAgY29uc3RydWN0b3I6IFNwaGVyZUJveENvbGxpc2lvbkRldGVjdG9yLFxyXG5cclxuICAgIGRldGVjdENvbGxpc2lvbjogZnVuY3Rpb24gKHNoYXBlMSwgc2hhcGUyLCBtYW5pZm9sZCkge1xyXG5cclxuICAgICAgdmFyIHM7XHJcbiAgICAgIHZhciBiO1xyXG4gICAgICBpZiAodGhpcy5mbGlwKSB7XHJcbiAgICAgICAgcyA9IChzaGFwZTIpO1xyXG4gICAgICAgIGIgPSAoc2hhcGUxKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBzID0gKHNoYXBlMSk7XHJcbiAgICAgICAgYiA9IChzaGFwZTIpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB2YXIgRCA9IGIuZGltZW50aW9ucztcclxuXHJcbiAgICAgIHZhciBwcyA9IHMucG9zaXRpb247XHJcbiAgICAgIHZhciBwc3ggPSBwcy54O1xyXG4gICAgICB2YXIgcHN5ID0gcHMueTtcclxuICAgICAgdmFyIHBzeiA9IHBzLno7XHJcbiAgICAgIHZhciBwYiA9IGIucG9zaXRpb247XHJcbiAgICAgIHZhciBwYnggPSBwYi54O1xyXG4gICAgICB2YXIgcGJ5ID0gcGIueTtcclxuICAgICAgdmFyIHBieiA9IHBiLno7XHJcbiAgICAgIHZhciByYWQgPSBzLnJhZGl1cztcclxuXHJcbiAgICAgIHZhciBodyA9IGIuaGFsZldpZHRoO1xyXG4gICAgICB2YXIgaGggPSBiLmhhbGZIZWlnaHQ7XHJcbiAgICAgIHZhciBoZCA9IGIuaGFsZkRlcHRoO1xyXG5cclxuICAgICAgdmFyIGR4ID0gcHN4IC0gcGJ4O1xyXG4gICAgICB2YXIgZHkgPSBwc3kgLSBwYnk7XHJcbiAgICAgIHZhciBkeiA9IHBzeiAtIHBiejtcclxuICAgICAgdmFyIHN4ID0gRFswXSAqIGR4ICsgRFsxXSAqIGR5ICsgRFsyXSAqIGR6O1xyXG4gICAgICB2YXIgc3kgPSBEWzNdICogZHggKyBEWzRdICogZHkgKyBEWzVdICogZHo7XHJcbiAgICAgIHZhciBzeiA9IERbNl0gKiBkeCArIERbN10gKiBkeSArIERbOF0gKiBkejtcclxuICAgICAgdmFyIGN4O1xyXG4gICAgICB2YXIgY3k7XHJcbiAgICAgIHZhciBjejtcclxuICAgICAgdmFyIGxlbjtcclxuICAgICAgdmFyIGludkxlbjtcclxuICAgICAgdmFyIG92ZXJsYXAgPSAwO1xyXG4gICAgICBpZiAoc3ggPiBodykge1xyXG4gICAgICAgIHN4ID0gaHc7XHJcbiAgICAgIH0gZWxzZSBpZiAoc3ggPCAtaHcpIHtcclxuICAgICAgICBzeCA9IC1odztcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBvdmVybGFwID0gMTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoc3kgPiBoaCkge1xyXG4gICAgICAgIHN5ID0gaGg7XHJcbiAgICAgIH0gZWxzZSBpZiAoc3kgPCAtaGgpIHtcclxuICAgICAgICBzeSA9IC1oaDtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBvdmVybGFwIHw9IDI7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHN6ID4gaGQpIHtcclxuICAgICAgICBzeiA9IGhkO1xyXG4gICAgICB9IGVsc2UgaWYgKHN6IDwgLWhkKSB7XHJcbiAgICAgICAgc3ogPSAtaGQ7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgb3ZlcmxhcCB8PSA0O1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChvdmVybGFwID09IDcpIHtcclxuICAgICAgICAvLyBjZW50ZXIgb2Ygc3BoZXJlIGlzIGluIHRoZSBib3hcclxuICAgICAgICBpZiAoc3ggPCAwKSB7XHJcbiAgICAgICAgICBkeCA9IGh3ICsgc3g7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGR4ID0gaHcgLSBzeDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHN5IDwgMCkge1xyXG4gICAgICAgICAgZHkgPSBoaCArIHN5O1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBkeSA9IGhoIC0gc3k7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChzeiA8IDApIHtcclxuICAgICAgICAgIGR6ID0gaGQgKyBzejtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgZHogPSBoZCAtIHN6O1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZHggPCBkeSkge1xyXG4gICAgICAgICAgaWYgKGR4IDwgZHopIHtcclxuICAgICAgICAgICAgbGVuID0gZHggLSBodztcclxuICAgICAgICAgICAgaWYgKHN4IDwgMCkge1xyXG4gICAgICAgICAgICAgIHN4ID0gLWh3O1xyXG4gICAgICAgICAgICAgIGR4ID0gRFswXTtcclxuICAgICAgICAgICAgICBkeSA9IERbMV07XHJcbiAgICAgICAgICAgICAgZHogPSBEWzJdO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHN4ID0gaHc7XHJcbiAgICAgICAgICAgICAgZHggPSAtRFswXTtcclxuICAgICAgICAgICAgICBkeSA9IC1EWzFdO1xyXG4gICAgICAgICAgICAgIGR6ID0gLURbMl07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGxlbiA9IGR6IC0gaGQ7XHJcbiAgICAgICAgICAgIGlmIChzeiA8IDApIHtcclxuICAgICAgICAgICAgICBzeiA9IC1oZDtcclxuICAgICAgICAgICAgICBkeCA9IERbNl07XHJcbiAgICAgICAgICAgICAgZHkgPSBEWzddO1xyXG4gICAgICAgICAgICAgIGR6ID0gRFs4XTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBzeiA9IGhkO1xyXG4gICAgICAgICAgICAgIGR4ID0gLURbNl07XHJcbiAgICAgICAgICAgICAgZHkgPSAtRFs3XTtcclxuICAgICAgICAgICAgICBkeiA9IC1EWzhdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGlmIChkeSA8IGR6KSB7XHJcbiAgICAgICAgICAgIGxlbiA9IGR5IC0gaGg7XHJcbiAgICAgICAgICAgIGlmIChzeSA8IDApIHtcclxuICAgICAgICAgICAgICBzeSA9IC1oaDtcclxuICAgICAgICAgICAgICBkeCA9IERbM107XHJcbiAgICAgICAgICAgICAgZHkgPSBEWzRdO1xyXG4gICAgICAgICAgICAgIGR6ID0gRFs1XTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBzeSA9IGhoO1xyXG4gICAgICAgICAgICAgIGR4ID0gLURbM107XHJcbiAgICAgICAgICAgICAgZHkgPSAtRFs0XTtcclxuICAgICAgICAgICAgICBkeiA9IC1EWzVdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBsZW4gPSBkeiAtIGhkO1xyXG4gICAgICAgICAgICBpZiAoc3ogPCAwKSB7XHJcbiAgICAgICAgICAgICAgc3ogPSAtaGQ7XHJcbiAgICAgICAgICAgICAgZHggPSBEWzZdO1xyXG4gICAgICAgICAgICAgIGR5ID0gRFs3XTtcclxuICAgICAgICAgICAgICBkeiA9IERbOF07XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgc3ogPSBoZDtcclxuICAgICAgICAgICAgICBkeCA9IC1EWzZdO1xyXG4gICAgICAgICAgICAgIGR5ID0gLURbN107XHJcbiAgICAgICAgICAgICAgZHogPSAtRFs4XTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBjeCA9IHBieCArIHN4ICogRFswXSArIHN5ICogRFszXSArIHN6ICogRFs2XTtcclxuICAgICAgICBjeSA9IHBieSArIHN4ICogRFsxXSArIHN5ICogRFs0XSArIHN6ICogRFs3XTtcclxuICAgICAgICBjeiA9IHBieiArIHN4ICogRFsyXSArIHN5ICogRFs1XSArIHN6ICogRFs4XTtcclxuICAgICAgICBtYW5pZm9sZC5hZGRQb2ludChwc3ggKyByYWQgKiBkeCwgcHN5ICsgcmFkICogZHksIHBzeiArIHJhZCAqIGR6LCBkeCwgZHksIGR6LCBsZW4gLSByYWQsIHRoaXMuZmxpcCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgY3ggPSBwYnggKyBzeCAqIERbMF0gKyBzeSAqIERbM10gKyBzeiAqIERbNl07XHJcbiAgICAgICAgY3kgPSBwYnkgKyBzeCAqIERbMV0gKyBzeSAqIERbNF0gKyBzeiAqIERbN107XHJcbiAgICAgICAgY3ogPSBwYnogKyBzeCAqIERbMl0gKyBzeSAqIERbNV0gKyBzeiAqIERbOF07XHJcbiAgICAgICAgZHggPSBjeCAtIHBzLng7XHJcbiAgICAgICAgZHkgPSBjeSAtIHBzLnk7XHJcbiAgICAgICAgZHogPSBjeiAtIHBzLno7XHJcbiAgICAgICAgbGVuID0gZHggKiBkeCArIGR5ICogZHkgKyBkeiAqIGR6O1xyXG4gICAgICAgIGlmIChsZW4gPiAwICYmIGxlbiA8IHJhZCAqIHJhZCkge1xyXG4gICAgICAgICAgbGVuID0gX01hdGguc3FydChsZW4pO1xyXG4gICAgICAgICAgaW52TGVuID0gMSAvIGxlbjtcclxuICAgICAgICAgIGR4ICo9IGludkxlbjtcclxuICAgICAgICAgIGR5ICo9IGludkxlbjtcclxuICAgICAgICAgIGR6ICo9IGludkxlbjtcclxuICAgICAgICAgIG1hbmlmb2xkLmFkZFBvaW50KHBzeCArIHJhZCAqIGR4LCBwc3kgKyByYWQgKiBkeSwgcHN6ICsgcmFkICogZHosIGR4LCBkeSwgZHosIGxlbiAtIHJhZCwgdGhpcy5mbGlwKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gIH0pO1xyXG5cclxuICBmdW5jdGlvbiBTcGhlcmVDeWxpbmRlckNvbGxpc2lvbkRldGVjdG9yKGZsaXApIHtcclxuXHJcbiAgICBDb2xsaXNpb25EZXRlY3Rvci5jYWxsKHRoaXMpO1xyXG4gICAgdGhpcy5mbGlwID0gZmxpcDtcclxuXHJcbiAgfVxyXG4gIFNwaGVyZUN5bGluZGVyQ29sbGlzaW9uRGV0ZWN0b3IucHJvdG90eXBlID0gT2JqZWN0LmFzc2lnbihPYmplY3QuY3JlYXRlKENvbGxpc2lvbkRldGVjdG9yLnByb3RvdHlwZSksIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcjogU3BoZXJlQ3lsaW5kZXJDb2xsaXNpb25EZXRlY3RvcixcclxuXHJcbiAgICBkZXRlY3RDb2xsaXNpb246IGZ1bmN0aW9uIChzaGFwZTEsIHNoYXBlMiwgbWFuaWZvbGQpIHtcclxuXHJcbiAgICAgIHZhciBzO1xyXG4gICAgICB2YXIgYztcclxuICAgICAgaWYgKHRoaXMuZmxpcCkge1xyXG4gICAgICAgIHMgPSBzaGFwZTI7XHJcbiAgICAgICAgYyA9IHNoYXBlMTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBzID0gc2hhcGUxO1xyXG4gICAgICAgIGMgPSBzaGFwZTI7XHJcbiAgICAgIH1cclxuICAgICAgdmFyIHBzID0gcy5wb3NpdGlvbjtcclxuICAgICAgdmFyIHBzeCA9IHBzLng7XHJcbiAgICAgIHZhciBwc3kgPSBwcy55O1xyXG4gICAgICB2YXIgcHN6ID0gcHMuejtcclxuICAgICAgdmFyIHBjID0gYy5wb3NpdGlvbjtcclxuICAgICAgdmFyIHBjeCA9IHBjLng7XHJcbiAgICAgIHZhciBwY3kgPSBwYy55O1xyXG4gICAgICB2YXIgcGN6ID0gcGMuejtcclxuICAgICAgdmFyIGRpcnggPSBjLm5vcm1hbERpcmVjdGlvbi54O1xyXG4gICAgICB2YXIgZGlyeSA9IGMubm9ybWFsRGlyZWN0aW9uLnk7XHJcbiAgICAgIHZhciBkaXJ6ID0gYy5ub3JtYWxEaXJlY3Rpb24uejtcclxuICAgICAgdmFyIHJhZHMgPSBzLnJhZGl1cztcclxuICAgICAgdmFyIHJhZGMgPSBjLnJhZGl1cztcclxuICAgICAgdmFyIHJhZDIgPSByYWRzICsgcmFkYztcclxuICAgICAgdmFyIGhhbGZoID0gYy5oYWxmSGVpZ2h0O1xyXG4gICAgICB2YXIgZHggPSBwc3ggLSBwY3g7XHJcbiAgICAgIHZhciBkeSA9IHBzeSAtIHBjeTtcclxuICAgICAgdmFyIGR6ID0gcHN6IC0gcGN6O1xyXG4gICAgICB2YXIgZG90ID0gZHggKiBkaXJ4ICsgZHkgKiBkaXJ5ICsgZHogKiBkaXJ6O1xyXG4gICAgICBpZiAoZG90IDwgLWhhbGZoIC0gcmFkcyB8fCBkb3QgPiBoYWxmaCArIHJhZHMpIHJldHVybjtcclxuICAgICAgdmFyIGN4ID0gcGN4ICsgZG90ICogZGlyeDtcclxuICAgICAgdmFyIGN5ID0gcGN5ICsgZG90ICogZGlyeTtcclxuICAgICAgdmFyIGN6ID0gcGN6ICsgZG90ICogZGlyejtcclxuICAgICAgdmFyIGQyeCA9IHBzeCAtIGN4O1xyXG4gICAgICB2YXIgZDJ5ID0gcHN5IC0gY3k7XHJcbiAgICAgIHZhciBkMnogPSBwc3ogLSBjejtcclxuICAgICAgdmFyIGxlbiA9IGQyeCAqIGQyeCArIGQyeSAqIGQyeSArIGQyeiAqIGQyejtcclxuICAgICAgaWYgKGxlbiA+IHJhZDIgKiByYWQyKSByZXR1cm47XHJcbiAgICAgIGlmIChsZW4gPiByYWRjICogcmFkYykge1xyXG4gICAgICAgIGxlbiA9IHJhZGMgLyBfTWF0aC5zcXJ0KGxlbik7XHJcbiAgICAgICAgZDJ4ICo9IGxlbjtcclxuICAgICAgICBkMnkgKj0gbGVuO1xyXG4gICAgICAgIGQyeiAqPSBsZW47XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGRvdCA8IC1oYWxmaCkgZG90ID0gLWhhbGZoO1xyXG4gICAgICBlbHNlIGlmIChkb3QgPiBoYWxmaCkgZG90ID0gaGFsZmg7XHJcbiAgICAgIGN4ID0gcGN4ICsgZG90ICogZGlyeCArIGQyeDtcclxuICAgICAgY3kgPSBwY3kgKyBkb3QgKiBkaXJ5ICsgZDJ5O1xyXG4gICAgICBjeiA9IHBjeiArIGRvdCAqIGRpcnogKyBkMno7XHJcbiAgICAgIGR4ID0gY3ggLSBwc3g7XHJcbiAgICAgIGR5ID0gY3kgLSBwc3k7XHJcbiAgICAgIGR6ID0gY3ogLSBwc3o7XHJcbiAgICAgIGxlbiA9IGR4ICogZHggKyBkeSAqIGR5ICsgZHogKiBkejtcclxuICAgICAgdmFyIGludkxlbjtcclxuICAgICAgaWYgKGxlbiA+IDAgJiYgbGVuIDwgcmFkcyAqIHJhZHMpIHtcclxuICAgICAgICBsZW4gPSBfTWF0aC5zcXJ0KGxlbik7XHJcbiAgICAgICAgaW52TGVuID0gMSAvIGxlbjtcclxuICAgICAgICBkeCAqPSBpbnZMZW47XHJcbiAgICAgICAgZHkgKj0gaW52TGVuO1xyXG4gICAgICAgIGR6ICo9IGludkxlbjtcclxuICAgICAgICAvLy9yZXN1bHQuYWRkQ29udGFjdEluZm8ocHN4K2R4KnJhZHMscHN5K2R5KnJhZHMscHN6K2R6KnJhZHMsZHgsZHksZHosbGVuLXJhZHMscyxjLDAsMCxmYWxzZSk7XHJcbiAgICAgICAgbWFuaWZvbGQuYWRkUG9pbnQocHN4ICsgZHggKiByYWRzLCBwc3kgKyBkeSAqIHJhZHMsIHBzeiArIGR6ICogcmFkcywgZHgsIGR5LCBkeiwgbGVuIC0gcmFkcywgdGhpcy5mbGlwKTtcclxuICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcblxyXG4gIH0pO1xyXG5cclxuICAvKipcclxuICAgKiBBIGNvbGxpc2lvbiBkZXRlY3RvciB3aGljaCBkZXRlY3RzIGNvbGxpc2lvbnMgYmV0d2VlbiB0d28gc3BoZXJlcy5cclxuICAgKiBAYXV0aG9yIHNhaGFyYW5cclxuICAgKi9cclxuXHJcbiAgZnVuY3Rpb24gU3BoZXJlU3BoZXJlQ29sbGlzaW9uRGV0ZWN0b3IoKSB7XHJcblxyXG4gICAgQ29sbGlzaW9uRGV0ZWN0b3IuY2FsbCh0aGlzKTtcclxuXHJcbiAgfVxyXG4gIFNwaGVyZVNwaGVyZUNvbGxpc2lvbkRldGVjdG9yLnByb3RvdHlwZSA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmNyZWF0ZShDb2xsaXNpb25EZXRlY3Rvci5wcm90b3R5cGUpLCB7XHJcblxyXG4gICAgY29uc3RydWN0b3I6IFNwaGVyZVNwaGVyZUNvbGxpc2lvbkRldGVjdG9yLFxyXG5cclxuICAgIGRldGVjdENvbGxpc2lvbjogZnVuY3Rpb24gKHNoYXBlMSwgc2hhcGUyLCBtYW5pZm9sZCkge1xyXG5cclxuICAgICAgdmFyIHMxID0gc2hhcGUxO1xyXG4gICAgICB2YXIgczIgPSBzaGFwZTI7XHJcbiAgICAgIHZhciBwMSA9IHMxLnBvc2l0aW9uO1xyXG4gICAgICB2YXIgcDIgPSBzMi5wb3NpdGlvbjtcclxuICAgICAgdmFyIGR4ID0gcDIueCAtIHAxLng7XHJcbiAgICAgIHZhciBkeSA9IHAyLnkgLSBwMS55O1xyXG4gICAgICB2YXIgZHogPSBwMi56IC0gcDEuejtcclxuICAgICAgdmFyIGxlbiA9IGR4ICogZHggKyBkeSAqIGR5ICsgZHogKiBkejtcclxuICAgICAgdmFyIHIxID0gczEucmFkaXVzO1xyXG4gICAgICB2YXIgcjIgPSBzMi5yYWRpdXM7XHJcbiAgICAgIHZhciByYWQgPSByMSArIHIyO1xyXG4gICAgICBpZiAobGVuID4gMCAmJiBsZW4gPCByYWQgKiByYWQpIHtcclxuICAgICAgICBsZW4gPSBfTWF0aC5zcXJ0KGxlbik7XHJcbiAgICAgICAgdmFyIGludkxlbiA9IDEgLyBsZW47XHJcbiAgICAgICAgZHggKj0gaW52TGVuO1xyXG4gICAgICAgIGR5ICo9IGludkxlbjtcclxuICAgICAgICBkeiAqPSBpbnZMZW47XHJcbiAgICAgICAgbWFuaWZvbGQuYWRkUG9pbnQocDEueCArIGR4ICogcjEsIHAxLnkgKyBkeSAqIHIxLCBwMS56ICsgZHogKiByMSwgZHgsIGR5LCBkeiwgbGVuIC0gcmFkLCBmYWxzZSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gIH0pO1xyXG5cclxuICAvKipcclxuICAgKiBBIGNvbGxpc2lvbiBkZXRlY3RvciB3aGljaCBkZXRlY3RzIGNvbGxpc2lvbnMgYmV0d2VlbiB0d28gc3BoZXJlcy5cclxuICAgKiBAYXV0aG9yIHNhaGFyYW4gXHJcbiAgICogQGF1dGhvciBsby10aFxyXG4gICAqL1xyXG5cclxuICBmdW5jdGlvbiBTcGhlcmVQbGFuZUNvbGxpc2lvbkRldGVjdG9yKGZsaXApIHtcclxuXHJcbiAgICBDb2xsaXNpb25EZXRlY3Rvci5jYWxsKHRoaXMpO1xyXG5cclxuICAgIHRoaXMuZmxpcCA9IGZsaXA7XHJcblxyXG4gICAgdGhpcy5uID0gbmV3IFZlYzMoKTtcclxuICAgIHRoaXMucCA9IG5ldyBWZWMzKCk7XHJcblxyXG4gIH1cclxuICBTcGhlcmVQbGFuZUNvbGxpc2lvbkRldGVjdG9yLnByb3RvdHlwZSA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmNyZWF0ZShDb2xsaXNpb25EZXRlY3Rvci5wcm90b3R5cGUpLCB7XHJcblxyXG4gICAgY29uc3RydWN0b3I6IFNwaGVyZVBsYW5lQ29sbGlzaW9uRGV0ZWN0b3IsXHJcblxyXG4gICAgZGV0ZWN0Q29sbGlzaW9uOiBmdW5jdGlvbiAoc2hhcGUxLCBzaGFwZTIsIG1hbmlmb2xkKSB7XHJcblxyXG4gICAgICB2YXIgbiA9IHRoaXMubjtcclxuICAgICAgdmFyIHAgPSB0aGlzLnA7XHJcblxyXG4gICAgICB2YXIgcyA9IHRoaXMuZmxpcCA/IHNoYXBlMiA6IHNoYXBlMTtcclxuICAgICAgdmFyIHBuID0gdGhpcy5mbGlwID8gc2hhcGUxIDogc2hhcGUyO1xyXG4gICAgICB2YXIgcmFkID0gcy5yYWRpdXM7XHJcbiAgICAgIHZhciBsZW47XHJcblxyXG4gICAgICBuLnN1YihzLnBvc2l0aW9uLCBwbi5wb3NpdGlvbik7XHJcbiAgICAgIC8vdmFyIGggPSBfTWF0aC5kb3RWZWN0b3JzKCBwbi5ub3JtYWwsIG4gKTtcclxuXHJcbiAgICAgIG4ueCAqPSBwbi5ub3JtYWwueDsvLysgcmFkO1xyXG4gICAgICBuLnkgKj0gcG4ubm9ybWFsLnk7XHJcbiAgICAgIG4ueiAqPSBwbi5ub3JtYWwuejsvLysgcmFkO1xyXG5cclxuXHJcbiAgICAgIHZhciBsZW4gPSBuLmxlbmd0aFNxKCk7XHJcblxyXG4gICAgICBpZiAobGVuID4gMCAmJiBsZW4gPCByYWQgKiByYWQpIHsvLyYmIGggPiByYWQqcmFkICl7XHJcblxyXG5cclxuICAgICAgICBsZW4gPSBfTWF0aC5zcXJ0KGxlbik7XHJcbiAgICAgICAgLy9sZW4gPSBfTWF0aC5zcXJ0KCBoICk7XHJcbiAgICAgICAgbi5jb3B5KHBuLm5vcm1hbCkubmVnYXRlKCk7XHJcbiAgICAgICAgLy9uLnNjYWxlRXF1YWwoIDEvbGVuICk7XHJcblxyXG4gICAgICAgIC8vKDAsIC0xLCAwKVxyXG5cclxuICAgICAgICAvL24ubm9ybWFsaXplKCk7XHJcbiAgICAgICAgcC5jb3B5KHMucG9zaXRpb24pLmFkZFNjYWxlZFZlY3RvcihuLCByYWQpO1xyXG4gICAgICAgIG1hbmlmb2xkLmFkZFBvaW50VmVjKHAsIG4sIGxlbiAtIHJhZCwgdGhpcy5mbGlwKTtcclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gIH0pO1xyXG5cclxuICAvKipcclxuICAgKiBBIGNvbGxpc2lvbiBkZXRlY3RvciB3aGljaCBkZXRlY3RzIGNvbGxpc2lvbnMgYmV0d2VlbiB0d28gc3BoZXJlcy5cclxuICAgKiBAYXV0aG9yIHNhaGFyYW4gXHJcbiAgICogQGF1dGhvciBsby10aFxyXG4gICAqL1xyXG5cclxuICBmdW5jdGlvbiBCb3hQbGFuZUNvbGxpc2lvbkRldGVjdG9yKGZsaXApIHtcclxuXHJcbiAgICBDb2xsaXNpb25EZXRlY3Rvci5jYWxsKHRoaXMpO1xyXG5cclxuICAgIHRoaXMuZmxpcCA9IGZsaXA7XHJcblxyXG4gICAgdGhpcy5uID0gbmV3IFZlYzMoKTtcclxuICAgIHRoaXMucCA9IG5ldyBWZWMzKCk7XHJcblxyXG4gICAgdGhpcy5kaXggPSBuZXcgVmVjMygpO1xyXG4gICAgdGhpcy5kaXkgPSBuZXcgVmVjMygpO1xyXG4gICAgdGhpcy5kaXogPSBuZXcgVmVjMygpO1xyXG5cclxuICAgIHRoaXMuY2MgPSBuZXcgVmVjMygpO1xyXG4gICAgdGhpcy5jYzIgPSBuZXcgVmVjMygpO1xyXG5cclxuICB9XHJcbiAgQm94UGxhbmVDb2xsaXNpb25EZXRlY3Rvci5wcm90b3R5cGUgPSBPYmplY3QuYXNzaWduKE9iamVjdC5jcmVhdGUoQ29sbGlzaW9uRGV0ZWN0b3IucHJvdG90eXBlKSwge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yOiBCb3hQbGFuZUNvbGxpc2lvbkRldGVjdG9yLFxyXG5cclxuICAgIGRldGVjdENvbGxpc2lvbjogZnVuY3Rpb24gKHNoYXBlMSwgc2hhcGUyLCBtYW5pZm9sZCkge1xyXG5cclxuICAgICAgdmFyIG4gPSB0aGlzLm47XHJcbiAgICAgIHZhciBwID0gdGhpcy5wO1xyXG4gICAgICB2YXIgY2MgPSB0aGlzLmNjO1xyXG5cclxuICAgICAgdmFyIGIgPSB0aGlzLmZsaXAgPyBzaGFwZTIgOiBzaGFwZTE7XHJcbiAgICAgIHZhciBwbiA9IHRoaXMuZmxpcCA/IHNoYXBlMSA6IHNoYXBlMjtcclxuXHJcbiAgICAgIHZhciBEID0gYi5kaW1lbnRpb25zO1xyXG4gICAgICB2YXIgaHcgPSBiLmhhbGZXaWR0aDtcclxuICAgICAgdmFyIGhoID0gYi5oYWxmSGVpZ2h0O1xyXG4gICAgICB2YXIgaGQgPSBiLmhhbGZEZXB0aDtcclxuICAgICAgdmFyIGxlbjtcclxuICAgICAgdmFyIG92ZXJsYXAgPSAwO1xyXG5cclxuICAgICAgdGhpcy5kaXguc2V0KERbMF0sIERbMV0sIERbMl0pO1xyXG4gICAgICB0aGlzLmRpeS5zZXQoRFszXSwgRFs0XSwgRFs1XSk7XHJcbiAgICAgIHRoaXMuZGl6LnNldChEWzZdLCBEWzddLCBEWzhdKTtcclxuXHJcbiAgICAgIG4uc3ViKGIucG9zaXRpb24sIHBuLnBvc2l0aW9uKTtcclxuXHJcbiAgICAgIG4ueCAqPSBwbi5ub3JtYWwueDsvLysgcmFkO1xyXG4gICAgICBuLnkgKj0gcG4ubm9ybWFsLnk7XHJcbiAgICAgIG4ueiAqPSBwbi5ub3JtYWwuejsvLysgcmFkO1xyXG5cclxuICAgICAgY2Muc2V0KFxyXG4gICAgICAgIF9NYXRoLmRvdFZlY3RvcnModGhpcy5kaXgsIG4pLFxyXG4gICAgICAgIF9NYXRoLmRvdFZlY3RvcnModGhpcy5kaXksIG4pLFxyXG4gICAgICAgIF9NYXRoLmRvdFZlY3RvcnModGhpcy5kaXosIG4pXHJcbiAgICAgICk7XHJcblxyXG5cclxuICAgICAgaWYgKGNjLnggPiBodykgY2MueCA9IGh3O1xyXG4gICAgICBlbHNlIGlmIChjYy54IDwgLWh3KSBjYy54ID0gLWh3O1xyXG4gICAgICBlbHNlIG92ZXJsYXAgPSAxO1xyXG5cclxuICAgICAgaWYgKGNjLnkgPiBoaCkgY2MueSA9IGhoO1xyXG4gICAgICBlbHNlIGlmIChjYy55IDwgLWhoKSBjYy55ID0gLWhoO1xyXG4gICAgICBlbHNlIG92ZXJsYXAgfD0gMjtcclxuXHJcbiAgICAgIGlmIChjYy56ID4gaGQpIGNjLnogPSBoZDtcclxuICAgICAgZWxzZSBpZiAoY2MueiA8IC1oZCkgY2MueiA9IC1oZDtcclxuICAgICAgZWxzZSBvdmVybGFwIHw9IDQ7XHJcblxyXG5cclxuXHJcbiAgICAgIGlmIChvdmVybGFwID09PSA3KSB7XHJcblxyXG4gICAgICAgIC8vIGNlbnRlciBvZiBzcGhlcmUgaXMgaW4gdGhlIGJveFxyXG5cclxuICAgICAgICBuLnNldChcclxuICAgICAgICAgIGNjLnggPCAwID8gaHcgKyBjYy54IDogaHcgLSBjYy54LFxyXG4gICAgICAgICAgY2MueSA8IDAgPyBoaCArIGNjLnkgOiBoaCAtIGNjLnksXHJcbiAgICAgICAgICBjYy56IDwgMCA/IGhkICsgY2MueiA6IGhkIC0gY2MuelxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGlmIChuLnggPCBuLnkpIHtcclxuICAgICAgICAgIGlmIChuLnggPCBuLnopIHtcclxuICAgICAgICAgICAgbGVuID0gbi54IC0gaHc7XHJcbiAgICAgICAgICAgIGlmIChjYy54IDwgMCkge1xyXG4gICAgICAgICAgICAgIGNjLnggPSAtaHc7XHJcbiAgICAgICAgICAgICAgbi5jb3B5KHRoaXMuZGl4KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBjYy54ID0gaHc7XHJcbiAgICAgICAgICAgICAgbi5zdWJFcXVhbCh0aGlzLmRpeCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGxlbiA9IG4ueiAtIGhkO1xyXG4gICAgICAgICAgICBpZiAoY2MueiA8IDApIHtcclxuICAgICAgICAgICAgICBjYy56ID0gLWhkO1xyXG4gICAgICAgICAgICAgIG4uY29weSh0aGlzLmRpeik7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgY2MueiA9IGhkO1xyXG4gICAgICAgICAgICAgIG4uc3ViRXF1YWwodGhpcy5kaXopO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGlmIChuLnkgPCBuLnopIHtcclxuICAgICAgICAgICAgbGVuID0gbi55IC0gaGg7XHJcbiAgICAgICAgICAgIGlmIChjYy55IDwgMCkge1xyXG4gICAgICAgICAgICAgIGNjLnkgPSAtaGg7XHJcbiAgICAgICAgICAgICAgbi5jb3B5KHRoaXMuZGl5KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBjYy55ID0gaGg7XHJcbiAgICAgICAgICAgICAgbi5zdWJFcXVhbCh0aGlzLmRpeSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGxlbiA9IG4ueiAtIGhkO1xyXG4gICAgICAgICAgICBpZiAoY2MueiA8IDApIHtcclxuICAgICAgICAgICAgICBjYy56ID0gLWhkO1xyXG4gICAgICAgICAgICAgIG4uY29weSh0aGlzLmRpeik7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgY2MueiA9IGhkO1xyXG4gICAgICAgICAgICAgIG4uc3ViRXF1YWwodGhpcy5kaXopO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwLmNvcHkocG4ucG9zaXRpb24pLmFkZFNjYWxlZFZlY3RvcihuLCAxKTtcclxuICAgICAgICBtYW5pZm9sZC5hZGRQb2ludFZlYyhwLCBuLCBsZW4sIHRoaXMuZmxpcCk7XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICB9KTtcclxuXHJcbiAgLyoqXHJcbiAgICogVGhlIGNsYXNzIG9mIHBoeXNpY2FsIGNvbXB1dGluZyB3b3JsZC5cclxuICAgKiBZb3UgbXVzdCBiZSBhZGRlZCB0byB0aGUgd29ybGQgcGh5c2ljYWwgYWxsIGNvbXB1dGluZyBvYmplY3RzXHJcbiAgICpcclxuICAgKiBAYXV0aG9yIHNhaGFyYW5cclxuICAgKiBAYXV0aG9yIGxvLXRoXHJcbiAgICovXHJcblxyXG4gIC8vIHRpbWVzdGVwLCBicm9hZHBoYXNlLCBpdGVyYXRpb25zLCB3b3JsZHNjYWxlLCByYW5kb20sIHN0YXRcclxuXHJcbiAgZnVuY3Rpb24gV29ybGQobykge1xyXG5cclxuICAgIGlmICghKG8gaW5zdGFuY2VvZiBPYmplY3QpKSBvID0ge307XHJcblxyXG4gICAgLy8gdGhpcyB3b3JsZCBzY2FsZSBkZWZhdXQgaXMgMC4xIHRvIDEwIG1ldGVycyBtYXggZm9yIGR5bmFtaXF1ZSBib2R5XHJcbiAgICB0aGlzLnNjYWxlID0gby53b3JsZHNjYWxlIHx8IDE7XHJcbiAgICB0aGlzLmludlNjYWxlID0gMSAvIHRoaXMuc2NhbGU7XHJcblxyXG4gICAgLy8gVGhlIHRpbWUgYmV0d2VlbiBlYWNoIHN0ZXBcclxuICAgIHRoaXMudGltZVN0ZXAgPSBvLnRpbWVzdGVwIHx8IDAuMDE2NjY7IC8vIDEvNjA7XHJcbiAgICB0aGlzLnRpbWVyYXRlID0gdGhpcy50aW1lU3RlcCAqIDEwMDA7XHJcbiAgICB0aGlzLnRpbWVyID0gbnVsbDtcclxuXHJcbiAgICB0aGlzLnByZUxvb3AgPSBudWxsOy8vZnVuY3Rpb24oKXt9O1xyXG4gICAgdGhpcy5wb3N0TG9vcCA9IG51bGw7Ly9mdW5jdGlvbigpe307XHJcblxyXG4gICAgLy8gVGhlIG51bWJlciBvZiBpdGVyYXRpb25zIGZvciBjb25zdHJhaW50IHNvbHZlcnMuXHJcbiAgICB0aGlzLm51bUl0ZXJhdGlvbnMgPSBvLml0ZXJhdGlvbnMgfHwgODtcclxuXHJcbiAgICAvLyBJdCBpcyBhIHdpZGUtYXJlYSBjb2xsaXNpb24ganVkZ21lbnQgdGhhdCBpcyB1c2VkIGluIG9yZGVyIHRvIHJlZHVjZSBhcyBtdWNoIGFzIHBvc3NpYmxlIGEgZGV0YWlsZWQgY29sbGlzaW9uIGp1ZGdtZW50LlxyXG4gICAgc3dpdGNoIChvLmJyb2FkcGhhc2UgfHwgMikge1xyXG4gICAgICBjYXNlIDE6IHRoaXMuYnJvYWRQaGFzZSA9IG5ldyBCcnV0ZUZvcmNlQnJvYWRQaGFzZSgpOyBicmVhaztcclxuICAgICAgY2FzZSAyOiBkZWZhdWx0OiB0aGlzLmJyb2FkUGhhc2UgPSBuZXcgU0FQQnJvYWRQaGFzZSgpOyBicmVhaztcclxuICAgICAgY2FzZSAzOiB0aGlzLmJyb2FkUGhhc2UgPSBuZXcgREJWVEJyb2FkUGhhc2UoKTsgYnJlYWs7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5CdHlwZXMgPSBbJ05vbmUnLCAnQnJ1dGVGb3JjZScsICdTd2VlcCAmIFBydW5lJywgJ0JvdW5kaW5nIFZvbHVtZSBUcmVlJ107XHJcbiAgICB0aGlzLmJyb2FkUGhhc2VUeXBlID0gdGhpcy5CdHlwZXNbby5icm9hZHBoYXNlIHx8IDJdO1xyXG5cclxuICAgIC8vIFRoaXMgaXMgdGhlIGRldGFpbGVkIGluZm9ybWF0aW9uIG9mIHRoZSBwZXJmb3JtYW5jZS5cclxuICAgIHRoaXMucGVyZm9ybWFuY2UgPSBudWxsO1xyXG4gICAgdGhpcy5pc1N0YXQgPSBvLmluZm8gPT09IHVuZGVmaW5lZCA/IGZhbHNlIDogby5pbmZvO1xyXG4gICAgaWYgKHRoaXMuaXNTdGF0KSB0aGlzLnBlcmZvcm1hbmNlID0gbmV3IEluZm9EaXNwbGF5KHRoaXMpO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogV2hldGhlciB0aGUgY29uc3RyYWludHMgcmFuZG9taXplciBpcyBlbmFibGVkIG9yIG5vdC5cclxuICAgICAqXHJcbiAgICAgKiBAcHJvcGVydHkgZW5hYmxlUmFuZG9taXplclxyXG4gICAgICogQHR5cGUge0Jvb2xlYW59XHJcbiAgICAgKi9cclxuICAgIHRoaXMuZW5hYmxlUmFuZG9taXplciA9IG8ucmFuZG9tICE9PSB1bmRlZmluZWQgPyBvLnJhbmRvbSA6IHRydWU7XHJcblxyXG4gICAgLy8gVGhlIHJpZ2lkIGJvZHkgbGlzdFxyXG4gICAgdGhpcy5yaWdpZEJvZGllcyA9IG51bGw7XHJcbiAgICAvLyBudW1iZXIgb2YgcmlnaWQgYm9keVxyXG4gICAgdGhpcy5udW1SaWdpZEJvZGllcyA9IDA7XHJcbiAgICAvLyBUaGUgY29udGFjdCBsaXN0XHJcbiAgICB0aGlzLmNvbnRhY3RzID0gbnVsbDtcclxuICAgIHRoaXMudW51c2VkQ29udGFjdHMgPSBudWxsO1xyXG4gICAgLy8gVGhlIG51bWJlciBvZiBjb250YWN0XHJcbiAgICB0aGlzLm51bUNvbnRhY3RzID0gMDtcclxuICAgIC8vIFRoZSBudW1iZXIgb2YgY29udGFjdCBwb2ludHNcclxuICAgIHRoaXMubnVtQ29udGFjdFBvaW50cyA9IDA7XHJcbiAgICAvLyAgVGhlIGpvaW50IGxpc3RcclxuICAgIHRoaXMuam9pbnRzID0gbnVsbDtcclxuICAgIC8vIFRoZSBudW1iZXIgb2Ygam9pbnRzLlxyXG4gICAgdGhpcy5udW1Kb2ludHMgPSAwO1xyXG4gICAgLy8gVGhlIG51bWJlciBvZiBzaW11bGF0aW9uIGlzbGFuZHMuXHJcbiAgICB0aGlzLm51bUlzbGFuZHMgPSAwO1xyXG5cclxuXHJcbiAgICAvLyBUaGUgZ3Jhdml0eSBpbiB0aGUgd29ybGQuXHJcbiAgICB0aGlzLmdyYXZpdHkgPSBuZXcgVmVjMygwLCAtOS44LCAwKTtcclxuICAgIGlmIChvLmdyYXZpdHkgIT09IHVuZGVmaW5lZCkgdGhpcy5ncmF2aXR5LmZyb21BcnJheShvLmdyYXZpdHkpO1xyXG5cclxuXHJcblxyXG4gICAgdmFyIG51bVNoYXBlVHlwZXMgPSA1Oy8vNDsvLzM7XHJcbiAgICB0aGlzLmRldGVjdG9ycyA9IFtdO1xyXG4gICAgdGhpcy5kZXRlY3RvcnMubGVuZ3RoID0gbnVtU2hhcGVUeXBlcztcclxuICAgIHZhciBpID0gbnVtU2hhcGVUeXBlcztcclxuICAgIHdoaWxlIChpLS0pIHtcclxuICAgICAgdGhpcy5kZXRlY3RvcnNbaV0gPSBbXTtcclxuICAgICAgdGhpcy5kZXRlY3RvcnNbaV0ubGVuZ3RoID0gbnVtU2hhcGVUeXBlcztcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmRldGVjdG9yc1tTSEFQRV9TUEhFUkVdW1NIQVBFX1NQSEVSRV0gPSBuZXcgU3BoZXJlU3BoZXJlQ29sbGlzaW9uRGV0ZWN0b3IoKTtcclxuICAgIHRoaXMuZGV0ZWN0b3JzW1NIQVBFX1NQSEVSRV1bU0hBUEVfQk9YXSA9IG5ldyBTcGhlcmVCb3hDb2xsaXNpb25EZXRlY3RvcihmYWxzZSk7XHJcbiAgICB0aGlzLmRldGVjdG9yc1tTSEFQRV9CT1hdW1NIQVBFX1NQSEVSRV0gPSBuZXcgU3BoZXJlQm94Q29sbGlzaW9uRGV0ZWN0b3IodHJ1ZSk7XHJcbiAgICB0aGlzLmRldGVjdG9yc1tTSEFQRV9CT1hdW1NIQVBFX0JPWF0gPSBuZXcgQm94Qm94Q29sbGlzaW9uRGV0ZWN0b3IoKTtcclxuXHJcbiAgICAvLyBDWUxJTkRFUiBhZGRcclxuICAgIHRoaXMuZGV0ZWN0b3JzW1NIQVBFX0NZTElOREVSXVtTSEFQRV9DWUxJTkRFUl0gPSBuZXcgQ3lsaW5kZXJDeWxpbmRlckNvbGxpc2lvbkRldGVjdG9yKCk7XHJcblxyXG4gICAgdGhpcy5kZXRlY3RvcnNbU0hBUEVfQ1lMSU5ERVJdW1NIQVBFX0JPWF0gPSBuZXcgQm94Q3lsaW5kZXJDb2xsaXNpb25EZXRlY3Rvcih0cnVlKTtcclxuICAgIHRoaXMuZGV0ZWN0b3JzW1NIQVBFX0JPWF1bU0hBUEVfQ1lMSU5ERVJdID0gbmV3IEJveEN5bGluZGVyQ29sbGlzaW9uRGV0ZWN0b3IoZmFsc2UpO1xyXG5cclxuICAgIHRoaXMuZGV0ZWN0b3JzW1NIQVBFX0NZTElOREVSXVtTSEFQRV9TUEhFUkVdID0gbmV3IFNwaGVyZUN5bGluZGVyQ29sbGlzaW9uRGV0ZWN0b3IodHJ1ZSk7XHJcbiAgICB0aGlzLmRldGVjdG9yc1tTSEFQRV9TUEhFUkVdW1NIQVBFX0NZTElOREVSXSA9IG5ldyBTcGhlcmVDeWxpbmRlckNvbGxpc2lvbkRldGVjdG9yKGZhbHNlKTtcclxuXHJcbiAgICAvLyBQTEFORSBhZGRcclxuXHJcbiAgICB0aGlzLmRldGVjdG9yc1tTSEFQRV9QTEFORV1bU0hBUEVfU1BIRVJFXSA9IG5ldyBTcGhlcmVQbGFuZUNvbGxpc2lvbkRldGVjdG9yKHRydWUpO1xyXG4gICAgdGhpcy5kZXRlY3RvcnNbU0hBUEVfU1BIRVJFXVtTSEFQRV9QTEFORV0gPSBuZXcgU3BoZXJlUGxhbmVDb2xsaXNpb25EZXRlY3RvcihmYWxzZSk7XHJcblxyXG4gICAgdGhpcy5kZXRlY3RvcnNbU0hBUEVfUExBTkVdW1NIQVBFX0JPWF0gPSBuZXcgQm94UGxhbmVDb2xsaXNpb25EZXRlY3Rvcih0cnVlKTtcclxuICAgIHRoaXMuZGV0ZWN0b3JzW1NIQVBFX0JPWF1bU0hBUEVfUExBTkVdID0gbmV3IEJveFBsYW5lQ29sbGlzaW9uRGV0ZWN0b3IoZmFsc2UpO1xyXG5cclxuICAgIC8vIFRFVFJBIGFkZFxyXG4gICAgLy90aGlzLmRldGVjdG9yc1tTSEFQRV9URVRSQV1bU0hBUEVfVEVUUkFdID0gbmV3IFRldHJhVGV0cmFDb2xsaXNpb25EZXRlY3RvcigpO1xyXG5cclxuXHJcbiAgICB0aGlzLnJhbmRYID0gNjU1MzU7XHJcbiAgICB0aGlzLnJhbmRBID0gOTg3NjU7XHJcbiAgICB0aGlzLnJhbmRCID0gMTIzNDU2Nzg5O1xyXG5cclxuICAgIHRoaXMuaXNsYW5kUmlnaWRCb2RpZXMgPSBbXTtcclxuICAgIHRoaXMuaXNsYW5kU3RhY2sgPSBbXTtcclxuICAgIHRoaXMuaXNsYW5kQ29uc3RyYWludHMgPSBbXTtcclxuXHJcbiAgfVxyXG5cclxuICBPYmplY3QuYXNzaWduKFdvcmxkLnByb3RvdHlwZSwge1xyXG5cclxuICAgIFdvcmxkOiB0cnVlLFxyXG5cclxuICAgIHBsYXk6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgIGlmICh0aGlzLnRpbWVyICE9PSBudWxsKSByZXR1cm47XHJcblxyXG4gICAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgICB0aGlzLnRpbWVyID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24gKCkgeyBfdGhpcy5zdGVwKCk7IH0sIHRoaXMudGltZXJhdGUpO1xyXG4gICAgICAvL3RoaXMudGltZXIgPSBzZXRJbnRlcnZhbCggdGhpcy5sb29wLmJpbmQodGhpcykgLCB0aGlzLnRpbWVyYXRlICk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBzdG9wOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICBpZiAodGhpcy50aW1lciA9PT0gbnVsbCkgcmV0dXJuO1xyXG5cclxuICAgICAgY2xlYXJJbnRlcnZhbCh0aGlzLnRpbWVyKTtcclxuICAgICAgdGhpcy50aW1lciA9IG51bGw7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBzZXRHcmF2aXR5OiBmdW5jdGlvbiAoYXIpIHtcclxuXHJcbiAgICAgIHRoaXMuZ3Jhdml0eS5mcm9tQXJyYXkoYXIpO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgZ2V0SW5mbzogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgcmV0dXJuIHRoaXMuaXNTdGF0ID8gdGhpcy5wZXJmb3JtYW5jZS5zaG93KCkgOiAnJztcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIFJlc2V0IHRoZSB3b3JsZCBhbmQgcmVtb3ZlIGFsbCByaWdpZCBib2RpZXMsIHNoYXBlcywgam9pbnRzIGFuZCBhbnkgb2JqZWN0IGZyb20gdGhlIHdvcmxkLlxyXG4gICAgY2xlYXI6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgIHRoaXMuc3RvcCgpO1xyXG4gICAgICB0aGlzLnByZUxvb3AgPSBudWxsO1xyXG4gICAgICB0aGlzLnBvc3RMb29wID0gbnVsbDtcclxuXHJcbiAgICAgIHRoaXMucmFuZFggPSA2NTUzNTtcclxuXHJcbiAgICAgIHdoaWxlICh0aGlzLmpvaW50cyAhPT0gbnVsbCkge1xyXG4gICAgICAgIHRoaXMucmVtb3ZlSm9pbnQodGhpcy5qb2ludHMpO1xyXG4gICAgICB9XHJcbiAgICAgIHdoaWxlICh0aGlzLmNvbnRhY3RzICE9PSBudWxsKSB7XHJcbiAgICAgICAgdGhpcy5yZW1vdmVDb250YWN0KHRoaXMuY29udGFjdHMpO1xyXG4gICAgICB9XHJcbiAgICAgIHdoaWxlICh0aGlzLnJpZ2lkQm9kaWVzICE9PSBudWxsKSB7XHJcbiAgICAgICAgdGhpcy5yZW1vdmVSaWdpZEJvZHkodGhpcy5yaWdpZEJvZGllcyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICB9LFxyXG4gICAgLyoqXHJcbiAgICAqIEknbGwgYWRkIGEgcmlnaWQgYm9keSB0byB0aGUgd29ybGQuXHJcbiAgICAqIFJpZ2lkIGJvZHkgdGhhdCBoYXMgYmVlbiBhZGRlZCB3aWxsIGJlIHRoZSBvcGVyYW5kcyBvZiBlYWNoIHN0ZXAuXHJcbiAgICAqIEBwYXJhbSAgcmlnaWRCb2R5ICBSaWdpZCBib2R5IHRoYXQgeW91IHdhbnQgdG8gYWRkXHJcbiAgICAqL1xyXG4gICAgYWRkUmlnaWRCb2R5OiBmdW5jdGlvbiAocmlnaWRCb2R5KSB7XHJcblxyXG4gICAgICBpZiAocmlnaWRCb2R5LnBhcmVudCkge1xyXG4gICAgICAgIHByaW50RXJyb3IoXCJXb3JsZFwiLCBcIkl0IGlzIG5vdCBwb3NzaWJsZSB0byBiZSBhZGRlZCB0byBtb3JlIHRoYW4gb25lIHdvcmxkIG9uZSBvZiB0aGUgcmlnaWQgYm9keVwiKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmlnaWRCb2R5LnNldFBhcmVudCh0aGlzKTtcclxuICAgICAgLy9yaWdpZEJvZHkuYXdha2UoKTtcclxuXHJcbiAgICAgIGZvciAodmFyIHNoYXBlID0gcmlnaWRCb2R5LnNoYXBlczsgc2hhcGUgIT09IG51bGw7IHNoYXBlID0gc2hhcGUubmV4dCkge1xyXG4gICAgICAgIHRoaXMuYWRkU2hhcGUoc2hhcGUpO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICh0aGlzLnJpZ2lkQm9kaWVzICE9PSBudWxsKSAodGhpcy5yaWdpZEJvZGllcy5wcmV2ID0gcmlnaWRCb2R5KS5uZXh0ID0gdGhpcy5yaWdpZEJvZGllcztcclxuICAgICAgdGhpcy5yaWdpZEJvZGllcyA9IHJpZ2lkQm9keTtcclxuICAgICAgdGhpcy5udW1SaWdpZEJvZGllcysrO1xyXG5cclxuICAgIH0sXHJcbiAgICAvKipcclxuICAgICogSSB3aWxsIHJlbW92ZSB0aGUgcmlnaWQgYm9keSBmcm9tIHRoZSB3b3JsZC5cclxuICAgICogUmlnaWQgYm9keSB0aGF0IGhhcyBiZWVuIGRlbGV0ZWQgaXMgZXhjbHVkZWQgZnJvbSB0aGUgY2FsY3VsYXRpb24gb24gYSBzdGVwLWJ5LXN0ZXAgYmFzaXMuXHJcbiAgICAqIEBwYXJhbSAgcmlnaWRCb2R5ICBSaWdpZCBib2R5IHRvIGJlIHJlbW92ZWRcclxuICAgICovXHJcbiAgICByZW1vdmVSaWdpZEJvZHk6IGZ1bmN0aW9uIChyaWdpZEJvZHkpIHtcclxuXHJcbiAgICAgIHZhciByZW1vdmUgPSByaWdpZEJvZHk7XHJcbiAgICAgIGlmIChyZW1vdmUucGFyZW50ICE9PSB0aGlzKSByZXR1cm47XHJcbiAgICAgIHJlbW92ZS5hd2FrZSgpO1xyXG4gICAgICB2YXIganMgPSByZW1vdmUuam9pbnRMaW5rO1xyXG4gICAgICB3aGlsZSAoanMgIT0gbnVsbCkge1xyXG4gICAgICAgIHZhciBqb2ludCA9IGpzLmpvaW50O1xyXG4gICAgICAgIGpzID0ganMubmV4dDtcclxuICAgICAgICB0aGlzLnJlbW92ZUpvaW50KGpvaW50KTtcclxuICAgICAgfVxyXG4gICAgICBmb3IgKHZhciBzaGFwZSA9IHJpZ2lkQm9keS5zaGFwZXM7IHNoYXBlICE9PSBudWxsOyBzaGFwZSA9IHNoYXBlLm5leHQpIHtcclxuICAgICAgICB0aGlzLnJlbW92ZVNoYXBlKHNoYXBlKTtcclxuICAgICAgfVxyXG4gICAgICB2YXIgcHJldiA9IHJlbW92ZS5wcmV2O1xyXG4gICAgICB2YXIgbmV4dCA9IHJlbW92ZS5uZXh0O1xyXG4gICAgICBpZiAocHJldiAhPT0gbnVsbCkgcHJldi5uZXh0ID0gbmV4dDtcclxuICAgICAgaWYgKG5leHQgIT09IG51bGwpIG5leHQucHJldiA9IHByZXY7XHJcbiAgICAgIGlmICh0aGlzLnJpZ2lkQm9kaWVzID09IHJlbW92ZSkgdGhpcy5yaWdpZEJvZGllcyA9IG5leHQ7XHJcbiAgICAgIHJlbW92ZS5wcmV2ID0gbnVsbDtcclxuICAgICAgcmVtb3ZlLm5leHQgPSBudWxsO1xyXG4gICAgICByZW1vdmUucGFyZW50ID0gbnVsbDtcclxuICAgICAgdGhpcy5udW1SaWdpZEJvZGllcy0tO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgZ2V0QnlOYW1lOiBmdW5jdGlvbiAobmFtZSkge1xyXG5cclxuICAgICAgdmFyIGJvZHkgPSB0aGlzLnJpZ2lkQm9kaWVzO1xyXG4gICAgICB3aGlsZSAoYm9keSAhPT0gbnVsbCkge1xyXG4gICAgICAgIGlmIChib2R5Lm5hbWUgPT09IG5hbWUpIHJldHVybiBib2R5O1xyXG4gICAgICAgIGJvZHkgPSBib2R5Lm5leHQ7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHZhciBqb2ludCA9IHRoaXMuam9pbnRzO1xyXG4gICAgICB3aGlsZSAoam9pbnQgIT09IG51bGwpIHtcclxuICAgICAgICBpZiAoam9pbnQubmFtZSA9PT0gbmFtZSkgcmV0dXJuIGpvaW50O1xyXG4gICAgICAgIGpvaW50ID0gam9pbnQubmV4dDtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIG51bGw7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICogSSdsbCBhZGQgYSBzaGFwZSB0byB0aGUgd29ybGQuLlxyXG4gICAgKiBBZGQgdG8gdGhlIHJpZ2lkIHdvcmxkLCBhbmQgaWYgeW91IGFkZCBhIHNoYXBlIHRvIGEgcmlnaWQgYm9keSB0aGF0IGhhcyBiZWVuIGFkZGVkIHRvIHRoZSB3b3JsZCxcclxuICAgICogU2hhcGUgd2lsbCBiZSBhZGRlZCB0byB0aGUgd29ybGQgYXV0b21hdGljYWxseSwgcGxlYXNlIGRvIG5vdCBjYWxsIGZyb20gb3V0c2lkZSB0aGlzIG1ldGhvZC5cclxuICAgICogQHBhcmFtICBzaGFwZSAgU2hhcGUgeW91IHdhbnQgdG8gYWRkXHJcbiAgICAqL1xyXG4gICAgYWRkU2hhcGU6IGZ1bmN0aW9uIChzaGFwZSkge1xyXG5cclxuICAgICAgaWYgKCFzaGFwZS5wYXJlbnQgfHwgIXNoYXBlLnBhcmVudC5wYXJlbnQpIHtcclxuICAgICAgICBwcmludEVycm9yKFwiV29ybGRcIiwgXCJJdCBpcyBub3QgcG9zc2libGUgdG8gYmUgYWRkZWQgYWxvbmUgdG8gc2hhcGUgd29ybGRcIik7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHNoYXBlLnByb3h5ID0gdGhpcy5icm9hZFBoYXNlLmNyZWF0ZVByb3h5KHNoYXBlKTtcclxuICAgICAgc2hhcGUudXBkYXRlUHJveHkoKTtcclxuICAgICAgdGhpcy5icm9hZFBoYXNlLmFkZFByb3h5KHNoYXBlLnByb3h5KTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgKiBJIHdpbGwgcmVtb3ZlIHRoZSBzaGFwZSBmcm9tIHRoZSB3b3JsZC5cclxuICAgICogQWRkIHRvIHRoZSByaWdpZCB3b3JsZCwgYW5kIGlmIHlvdSBhZGQgYSBzaGFwZSB0byBhIHJpZ2lkIGJvZHkgdGhhdCBoYXMgYmVlbiBhZGRlZCB0byB0aGUgd29ybGQsXHJcbiAgICAqIFNoYXBlIHdpbGwgYmUgYWRkZWQgdG8gdGhlIHdvcmxkIGF1dG9tYXRpY2FsbHksIHBsZWFzZSBkbyBub3QgY2FsbCBmcm9tIG91dHNpZGUgdGhpcyBtZXRob2QuXHJcbiAgICAqIEBwYXJhbSAgc2hhcGUgIFNoYXBlIHlvdSB3YW50IHRvIGRlbGV0ZVxyXG4gICAgKi9cclxuICAgIHJlbW92ZVNoYXBlOiBmdW5jdGlvbiAoc2hhcGUpIHtcclxuXHJcbiAgICAgIHRoaXMuYnJvYWRQaGFzZS5yZW1vdmVQcm94eShzaGFwZS5wcm94eSk7XHJcbiAgICAgIHNoYXBlLnByb3h5ID0gbnVsbDtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgKiBJJ2xsIGFkZCBhIGpvaW50IHRvIHRoZSB3b3JsZC5cclxuICAgICogSm9pbnQgdGhhdCBoYXMgYmVlbiBhZGRlZCB3aWxsIGJlIHRoZSBvcGVyYW5kcyBvZiBlYWNoIHN0ZXAuXHJcbiAgICAqIEBwYXJhbSAgc2hhcGUgSm9pbnQgdG8gYmUgYWRkZWRcclxuICAgICovXHJcbiAgICBhZGRKb2ludDogZnVuY3Rpb24gKGpvaW50KSB7XHJcblxyXG4gICAgICBpZiAoam9pbnQucGFyZW50KSB7XHJcbiAgICAgICAgcHJpbnRFcnJvcihcIldvcmxkXCIsIFwiSXQgaXMgbm90IHBvc3NpYmxlIHRvIGJlIGFkZGVkIHRvIG1vcmUgdGhhbiBvbmUgd29ybGQgb25lIG9mIHRoZSBqb2ludFwiKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAodGhpcy5qb2ludHMgIT0gbnVsbCkgKHRoaXMuam9pbnRzLnByZXYgPSBqb2ludCkubmV4dCA9IHRoaXMuam9pbnRzO1xyXG4gICAgICB0aGlzLmpvaW50cyA9IGpvaW50O1xyXG4gICAgICBqb2ludC5zZXRQYXJlbnQodGhpcyk7XHJcbiAgICAgIHRoaXMubnVtSm9pbnRzKys7XHJcbiAgICAgIGpvaW50LmF3YWtlKCk7XHJcbiAgICAgIGpvaW50LmF0dGFjaCgpO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAqIEkgd2lsbCByZW1vdmUgdGhlIGpvaW50IGZyb20gdGhlIHdvcmxkLlxyXG4gICAgKiBKb2ludCB0aGF0IGhhcyBiZWVuIGFkZGVkIHdpbGwgYmUgdGhlIG9wZXJhbmRzIG9mIGVhY2ggc3RlcC5cclxuICAgICogQHBhcmFtICBzaGFwZSBKb2ludCB0byBiZSBkZWxldGVkXHJcbiAgICAqL1xyXG4gICAgcmVtb3ZlSm9pbnQ6IGZ1bmN0aW9uIChqb2ludCkge1xyXG5cclxuICAgICAgdmFyIHJlbW92ZSA9IGpvaW50O1xyXG4gICAgICB2YXIgcHJldiA9IHJlbW92ZS5wcmV2O1xyXG4gICAgICB2YXIgbmV4dCA9IHJlbW92ZS5uZXh0O1xyXG4gICAgICBpZiAocHJldiAhPT0gbnVsbCkgcHJldi5uZXh0ID0gbmV4dDtcclxuICAgICAgaWYgKG5leHQgIT09IG51bGwpIG5leHQucHJldiA9IHByZXY7XHJcbiAgICAgIGlmICh0aGlzLmpvaW50cyA9PSByZW1vdmUpIHRoaXMuam9pbnRzID0gbmV4dDtcclxuICAgICAgcmVtb3ZlLnByZXYgPSBudWxsO1xyXG4gICAgICByZW1vdmUubmV4dCA9IG51bGw7XHJcbiAgICAgIHRoaXMubnVtSm9pbnRzLS07XHJcbiAgICAgIHJlbW92ZS5hd2FrZSgpO1xyXG4gICAgICByZW1vdmUuZGV0YWNoKCk7XHJcbiAgICAgIHJlbW92ZS5wYXJlbnQgPSBudWxsO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgYWRkQ29udGFjdDogZnVuY3Rpb24gKHMxLCBzMikge1xyXG5cclxuICAgICAgdmFyIG5ld0NvbnRhY3Q7XHJcbiAgICAgIGlmICh0aGlzLnVudXNlZENvbnRhY3RzICE9PSBudWxsKSB7XHJcbiAgICAgICAgbmV3Q29udGFjdCA9IHRoaXMudW51c2VkQ29udGFjdHM7XHJcbiAgICAgICAgdGhpcy51bnVzZWRDb250YWN0cyA9IHRoaXMudW51c2VkQ29udGFjdHMubmV4dDtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBuZXdDb250YWN0ID0gbmV3IENvbnRhY3QoKTtcclxuICAgICAgfVxyXG4gICAgICBuZXdDb250YWN0LmF0dGFjaChzMSwgczIpO1xyXG4gICAgICBuZXdDb250YWN0LmRldGVjdG9yID0gdGhpcy5kZXRlY3RvcnNbczEudHlwZV1bczIudHlwZV07XHJcbiAgICAgIGlmICh0aGlzLmNvbnRhY3RzKSAodGhpcy5jb250YWN0cy5wcmV2ID0gbmV3Q29udGFjdCkubmV4dCA9IHRoaXMuY29udGFjdHM7XHJcbiAgICAgIHRoaXMuY29udGFjdHMgPSBuZXdDb250YWN0O1xyXG4gICAgICB0aGlzLm51bUNvbnRhY3RzKys7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICByZW1vdmVDb250YWN0OiBmdW5jdGlvbiAoY29udGFjdCkge1xyXG5cclxuICAgICAgdmFyIHByZXYgPSBjb250YWN0LnByZXY7XHJcbiAgICAgIHZhciBuZXh0ID0gY29udGFjdC5uZXh0O1xyXG4gICAgICBpZiAobmV4dCkgbmV4dC5wcmV2ID0gcHJldjtcclxuICAgICAgaWYgKHByZXYpIHByZXYubmV4dCA9IG5leHQ7XHJcbiAgICAgIGlmICh0aGlzLmNvbnRhY3RzID09IGNvbnRhY3QpIHRoaXMuY29udGFjdHMgPSBuZXh0O1xyXG4gICAgICBjb250YWN0LnByZXYgPSBudWxsO1xyXG4gICAgICBjb250YWN0Lm5leHQgPSBudWxsO1xyXG4gICAgICBjb250YWN0LmRldGFjaCgpO1xyXG4gICAgICBjb250YWN0Lm5leHQgPSB0aGlzLnVudXNlZENvbnRhY3RzO1xyXG4gICAgICB0aGlzLnVudXNlZENvbnRhY3RzID0gY29udGFjdDtcclxuICAgICAgdGhpcy5udW1Db250YWN0cy0tO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgZ2V0Q29udGFjdDogZnVuY3Rpb24gKGIxLCBiMikge1xyXG5cclxuICAgICAgYjEgPSBiMS5jb25zdHJ1Y3RvciA9PT0gUmlnaWRCb2R5ID8gYjEubmFtZSA6IGIxO1xyXG4gICAgICBiMiA9IGIyLmNvbnN0cnVjdG9yID09PSBSaWdpZEJvZHkgPyBiMi5uYW1lIDogYjI7XHJcblxyXG4gICAgICB2YXIgbjEsIG4yO1xyXG4gICAgICB2YXIgY29udGFjdCA9IHRoaXMuY29udGFjdHM7XHJcbiAgICAgIHdoaWxlIChjb250YWN0ICE9PSBudWxsKSB7XHJcbiAgICAgICAgbjEgPSBjb250YWN0LmJvZHkxLm5hbWU7XHJcbiAgICAgICAgbjIgPSBjb250YWN0LmJvZHkyLm5hbWU7XHJcbiAgICAgICAgaWYgKChuMSA9PT0gYjEgJiYgbjIgPT09IGIyKSB8fCAobjIgPT09IGIxICYmIG4xID09PSBiMikpIHsgaWYgKGNvbnRhY3QudG91Y2hpbmcpIHJldHVybiBjb250YWN0OyBlbHNlIHJldHVybiBudWxsOyB9XHJcbiAgICAgICAgZWxzZSBjb250YWN0ID0gY29udGFjdC5uZXh0O1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgY2hlY2tDb250YWN0OiBmdW5jdGlvbiAobmFtZTEsIG5hbWUyKSB7XHJcblxyXG4gICAgICB2YXIgbjEsIG4yO1xyXG4gICAgICB2YXIgY29udGFjdCA9IHRoaXMuY29udGFjdHM7XHJcbiAgICAgIHdoaWxlIChjb250YWN0ICE9PSBudWxsKSB7XHJcbiAgICAgICAgbjEgPSBjb250YWN0LmJvZHkxLm5hbWUgfHwgJyAnO1xyXG4gICAgICAgIG4yID0gY29udGFjdC5ib2R5Mi5uYW1lIHx8ICcgJztcclxuICAgICAgICBpZiAoKG4xID09IG5hbWUxICYmIG4yID09IG5hbWUyKSB8fCAobjIgPT0gbmFtZTEgJiYgbjEgPT0gbmFtZTIpKSB7IGlmIChjb250YWN0LnRvdWNoaW5nKSByZXR1cm4gdHJ1ZTsgZWxzZSByZXR1cm4gZmFsc2U7IH1cclxuICAgICAgICBlbHNlIGNvbnRhY3QgPSBjb250YWN0Lm5leHQ7XHJcbiAgICAgIH1cclxuICAgICAgLy9yZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBjYWxsU2xlZXA6IGZ1bmN0aW9uIChib2R5KSB7XHJcblxyXG4gICAgICBpZiAoIWJvZHkuYWxsb3dTbGVlcCkgcmV0dXJuIGZhbHNlO1xyXG4gICAgICBpZiAoYm9keS5saW5lYXJWZWxvY2l0eS5sZW5ndGhTcSgpID4gMC4wNCkgcmV0dXJuIGZhbHNlO1xyXG4gICAgICBpZiAoYm9keS5hbmd1bGFyVmVsb2NpdHkubGVuZ3RoU3EoKSA+IDAuMjUpIHJldHVybiBmYWxzZTtcclxuICAgICAgcmV0dXJuIHRydWU7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICogSSB3aWxsIHByb2NlZWQgb25seSB0aW1lIHN0ZXAgc2Vjb25kcyB0aW1lIG9mIFdvcmxkLlxyXG4gICAgKi9cclxuICAgIHN0ZXA6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgIHZhciBzdGF0ID0gdGhpcy5pc1N0YXQ7XHJcblxyXG4gICAgICBpZiAoc3RhdCkgdGhpcy5wZXJmb3JtYW5jZS5zZXRUaW1lKDApO1xyXG5cclxuICAgICAgdmFyIGJvZHkgPSB0aGlzLnJpZ2lkQm9kaWVzO1xyXG5cclxuICAgICAgd2hpbGUgKGJvZHkgIT09IG51bGwpIHtcclxuXHJcbiAgICAgICAgYm9keS5hZGRlZFRvSXNsYW5kID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGlmIChib2R5LnNsZWVwaW5nKSBib2R5LnRlc3RXYWtlVXAoKTtcclxuXHJcbiAgICAgICAgYm9keSA9IGJvZHkubmV4dDtcclxuXHJcbiAgICAgIH1cclxuXHJcblxyXG5cclxuICAgICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgICAgLy8gICBVUERBVEUgQlJPQURQSEFTRSBDT05UQUNUXHJcbiAgICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgICBpZiAoc3RhdCkgdGhpcy5wZXJmb3JtYW5jZS5zZXRUaW1lKDEpO1xyXG5cclxuICAgICAgdGhpcy5icm9hZFBoYXNlLmRldGVjdFBhaXJzKCk7XHJcblxyXG4gICAgICB2YXIgcGFpcnMgPSB0aGlzLmJyb2FkUGhhc2UucGFpcnM7XHJcblxyXG4gICAgICB2YXIgaSA9IHRoaXMuYnJvYWRQaGFzZS5udW1QYWlycztcclxuICAgICAgLy9kb3tcclxuICAgICAgd2hpbGUgKGktLSkge1xyXG4gICAgICAgIC8vZm9yKHZhciBpPTAsIGw9bnVtUGFpcnM7IGk8bDsgaSsrKXtcclxuICAgICAgICB2YXIgcGFpciA9IHBhaXJzW2ldO1xyXG4gICAgICAgIHZhciBzMTtcclxuICAgICAgICB2YXIgczI7XHJcbiAgICAgICAgaWYgKHBhaXIuc2hhcGUxLmlkIDwgcGFpci5zaGFwZTIuaWQpIHtcclxuICAgICAgICAgIHMxID0gcGFpci5zaGFwZTE7XHJcbiAgICAgICAgICBzMiA9IHBhaXIuc2hhcGUyO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBzMSA9IHBhaXIuc2hhcGUyO1xyXG4gICAgICAgICAgczIgPSBwYWlyLnNoYXBlMTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBsaW5rO1xyXG4gICAgICAgIGlmIChzMS5udW1Db250YWN0cyA8IHMyLm51bUNvbnRhY3RzKSBsaW5rID0gczEuY29udGFjdExpbms7XHJcbiAgICAgICAgZWxzZSBsaW5rID0gczIuY29udGFjdExpbms7XHJcblxyXG4gICAgICAgIHZhciBleGlzdHMgPSBmYWxzZTtcclxuICAgICAgICB3aGlsZSAobGluaykge1xyXG4gICAgICAgICAgdmFyIGNvbnRhY3QgPSBsaW5rLmNvbnRhY3Q7XHJcbiAgICAgICAgICBpZiAoY29udGFjdC5zaGFwZTEgPT0gczEgJiYgY29udGFjdC5zaGFwZTIgPT0gczIpIHtcclxuICAgICAgICAgICAgY29udGFjdC5wZXJzaXN0aW5nID0gdHJ1ZTtcclxuICAgICAgICAgICAgZXhpc3RzID0gdHJ1ZTsvLyBjb250YWN0IGFscmVhZHkgZXhpc3RzXHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgbGluayA9IGxpbmsubmV4dDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFleGlzdHMpIHtcclxuICAgICAgICAgIHRoaXMuYWRkQ29udGFjdChzMSwgczIpO1xyXG4gICAgICAgIH1cclxuICAgICAgfS8vIHdoaWxlKGktLSA+MCk7XHJcblxyXG4gICAgICBpZiAoc3RhdCkgdGhpcy5wZXJmb3JtYW5jZS5jYWxjQnJvYWRQaGFzZSgpO1xyXG5cclxuICAgICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgICAgLy8gICBVUERBVEUgTkFSUk9XUEhBU0UgQ09OVEFDVFxyXG4gICAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgICAgLy8gdXBkYXRlICYgbmFycm93IHBoYXNlXHJcbiAgICAgIHRoaXMubnVtQ29udGFjdFBvaW50cyA9IDA7XHJcbiAgICAgIGNvbnRhY3QgPSB0aGlzLmNvbnRhY3RzO1xyXG4gICAgICB3aGlsZSAoY29udGFjdCAhPT0gbnVsbCkge1xyXG4gICAgICAgIGlmICghY29udGFjdC5wZXJzaXN0aW5nKSB7XHJcbiAgICAgICAgICBpZiAoY29udGFjdC5zaGFwZTEuYWFiYi5pbnRlcnNlY3RUZXN0KGNvbnRhY3Quc2hhcGUyLmFhYmIpKSB7XHJcbiAgICAgICAgICAgIC8qdmFyIGFhYmIxPWNvbnRhY3Quc2hhcGUxLmFhYmI7XHJcbiAgICAgICAgICAgIHZhciBhYWJiMj1jb250YWN0LnNoYXBlMi5hYWJiO1xyXG4gICAgICAgICAgICBpZihcclxuICAgICAgICAgICAgICBhYWJiMS5taW5YPmFhYmIyLm1heFggfHwgYWFiYjEubWF4WDxhYWJiMi5taW5YIHx8XHJcbiAgICAgICAgICAgICAgYWFiYjEubWluWT5hYWJiMi5tYXhZIHx8IGFhYmIxLm1heFk8YWFiYjIubWluWSB8fFxyXG4gICAgICAgICAgICAgIGFhYmIxLm1pblo+YWFiYjIubWF4WiB8fCBhYWJiMS5tYXhaPGFhYmIyLm1pblpcclxuICAgICAgICAgICAgKXsqL1xyXG4gICAgICAgICAgICB2YXIgbmV4dCA9IGNvbnRhY3QubmV4dDtcclxuICAgICAgICAgICAgdGhpcy5yZW1vdmVDb250YWN0KGNvbnRhY3QpO1xyXG4gICAgICAgICAgICBjb250YWN0ID0gbmV4dDtcclxuICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBiMSA9IGNvbnRhY3QuYm9keTE7XHJcbiAgICAgICAgdmFyIGIyID0gY29udGFjdC5ib2R5MjtcclxuXHJcbiAgICAgICAgaWYgKGIxLmlzRHluYW1pYyAmJiAhYjEuc2xlZXBpbmcgfHwgYjIuaXNEeW5hbWljICYmICFiMi5zbGVlcGluZykgY29udGFjdC51cGRhdGVNYW5pZm9sZCgpO1xyXG5cclxuICAgICAgICB0aGlzLm51bUNvbnRhY3RQb2ludHMgKz0gY29udGFjdC5tYW5pZm9sZC5udW1Qb2ludHM7XHJcbiAgICAgICAgY29udGFjdC5wZXJzaXN0aW5nID0gZmFsc2U7XHJcbiAgICAgICAgY29udGFjdC5jb25zdHJhaW50LmFkZGVkVG9Jc2xhbmQgPSBmYWxzZTtcclxuICAgICAgICBjb250YWN0ID0gY29udGFjdC5uZXh0O1xyXG5cclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKHN0YXQpIHRoaXMucGVyZm9ybWFuY2UuY2FsY05hcnJvd1BoYXNlKCk7XHJcblxyXG4gICAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgICAvLyAgIFNPTFZFIElTTEFORFNcclxuICAgICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICAgIHZhciBpbnZUaW1lU3RlcCA9IDEgLyB0aGlzLnRpbWVTdGVwO1xyXG4gICAgICB2YXIgam9pbnQ7XHJcbiAgICAgIHZhciBjb25zdHJhaW50O1xyXG5cclxuICAgICAgZm9yIChqb2ludCA9IHRoaXMuam9pbnRzOyBqb2ludCAhPT0gbnVsbDsgam9pbnQgPSBqb2ludC5uZXh0KSB7XHJcbiAgICAgICAgam9pbnQuYWRkZWRUb0lzbGFuZCA9IGZhbHNlO1xyXG4gICAgICB9XHJcblxyXG5cclxuICAgICAgLy8gY2xlYXIgb2xkIGlzbGFuZCBhcnJheVxyXG4gICAgICB0aGlzLmlzbGFuZFJpZ2lkQm9kaWVzID0gW107XHJcbiAgICAgIHRoaXMuaXNsYW5kQ29uc3RyYWludHMgPSBbXTtcclxuICAgICAgdGhpcy5pc2xhbmRTdGFjayA9IFtdO1xyXG5cclxuICAgICAgaWYgKHN0YXQpIHRoaXMucGVyZm9ybWFuY2Uuc2V0VGltZSgxKTtcclxuXHJcbiAgICAgIHRoaXMubnVtSXNsYW5kcyA9IDA7XHJcblxyXG4gICAgICAvLyBidWlsZCBhbmQgc29sdmUgc2ltdWxhdGlvbiBpc2xhbmRzXHJcblxyXG4gICAgICBmb3IgKHZhciBiYXNlID0gdGhpcy5yaWdpZEJvZGllczsgYmFzZSAhPT0gbnVsbDsgYmFzZSA9IGJhc2UubmV4dCkge1xyXG5cclxuICAgICAgICBpZiAoYmFzZS5hZGRlZFRvSXNsYW5kIHx8IGJhc2UuaXNTdGF0aWMgfHwgYmFzZS5zbGVlcGluZykgY29udGludWU7Ly8gaWdub3JlXHJcblxyXG4gICAgICAgIGlmIChiYXNlLmlzTG9uZWx5KCkpIHsvLyB1cGRhdGUgc2luZ2xlIGJvZHlcclxuICAgICAgICAgIGlmIChiYXNlLmlzRHluYW1pYykge1xyXG4gICAgICAgICAgICBiYXNlLmxpbmVhclZlbG9jaXR5LmFkZFNjYWxlZFZlY3Rvcih0aGlzLmdyYXZpdHksIHRoaXMudGltZVN0ZXApO1xyXG4gICAgICAgICAgICAvKmJhc2UubGluZWFyVmVsb2NpdHkueCs9dGhpcy5ncmF2aXR5LngqdGhpcy50aW1lU3RlcDtcclxuICAgICAgICAgICAgYmFzZS5saW5lYXJWZWxvY2l0eS55Kz10aGlzLmdyYXZpdHkueSp0aGlzLnRpbWVTdGVwO1xyXG4gICAgICAgICAgICBiYXNlLmxpbmVhclZlbG9jaXR5LnorPXRoaXMuZ3Jhdml0eS56KnRoaXMudGltZVN0ZXA7Ki9cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmICh0aGlzLmNhbGxTbGVlcChiYXNlKSkge1xyXG4gICAgICAgICAgICBiYXNlLnNsZWVwVGltZSArPSB0aGlzLnRpbWVTdGVwO1xyXG4gICAgICAgICAgICBpZiAoYmFzZS5zbGVlcFRpbWUgPiAwLjUpIGJhc2Uuc2xlZXAoKTtcclxuICAgICAgICAgICAgZWxzZSBiYXNlLnVwZGF0ZVBvc2l0aW9uKHRoaXMudGltZVN0ZXApO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgYmFzZS5zbGVlcFRpbWUgPSAwO1xyXG4gICAgICAgICAgICBiYXNlLnVwZGF0ZVBvc2l0aW9uKHRoaXMudGltZVN0ZXApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgdGhpcy5udW1Jc2xhbmRzKys7XHJcbiAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBpc2xhbmROdW1SaWdpZEJvZGllcyA9IDA7XHJcbiAgICAgICAgdmFyIGlzbGFuZE51bUNvbnN0cmFpbnRzID0gMDtcclxuICAgICAgICB2YXIgc3RhY2tDb3VudCA9IDE7XHJcbiAgICAgICAgLy8gYWRkIHJpZ2lkIGJvZHkgdG8gc3RhY2tcclxuICAgICAgICB0aGlzLmlzbGFuZFN0YWNrWzBdID0gYmFzZTtcclxuICAgICAgICBiYXNlLmFkZGVkVG9Jc2xhbmQgPSB0cnVlO1xyXG5cclxuICAgICAgICAvLyBidWlsZCBhbiBpc2xhbmRcclxuICAgICAgICBkbyB7XHJcbiAgICAgICAgICAvLyBnZXQgcmlnaWQgYm9keSBmcm9tIHN0YWNrXHJcbiAgICAgICAgICBib2R5ID0gdGhpcy5pc2xhbmRTdGFja1stLXN0YWNrQ291bnRdO1xyXG4gICAgICAgICAgdGhpcy5pc2xhbmRTdGFja1tzdGFja0NvdW50XSA9IG51bGw7XHJcbiAgICAgICAgICBib2R5LnNsZWVwaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAvLyBhZGQgcmlnaWQgYm9keSB0byB0aGUgaXNsYW5kXHJcbiAgICAgICAgICB0aGlzLmlzbGFuZFJpZ2lkQm9kaWVzW2lzbGFuZE51bVJpZ2lkQm9kaWVzKytdID0gYm9keTtcclxuICAgICAgICAgIGlmIChib2R5LmlzU3RhdGljKSBjb250aW51ZTtcclxuXHJcbiAgICAgICAgICAvLyBzZWFyY2ggY29ubmVjdGlvbnNcclxuICAgICAgICAgIGZvciAodmFyIGNzID0gYm9keS5jb250YWN0TGluazsgY3MgIT09IG51bGw7IGNzID0gY3MubmV4dCkge1xyXG4gICAgICAgICAgICB2YXIgY29udGFjdCA9IGNzLmNvbnRhY3Q7XHJcbiAgICAgICAgICAgIGNvbnN0cmFpbnQgPSBjb250YWN0LmNvbnN0cmFpbnQ7XHJcbiAgICAgICAgICAgIGlmIChjb25zdHJhaW50LmFkZGVkVG9Jc2xhbmQgfHwgIWNvbnRhY3QudG91Y2hpbmcpIGNvbnRpbnVlOy8vIGlnbm9yZVxyXG5cclxuICAgICAgICAgICAgLy8gYWRkIGNvbnN0cmFpbnQgdG8gdGhlIGlzbGFuZFxyXG4gICAgICAgICAgICB0aGlzLmlzbGFuZENvbnN0cmFpbnRzW2lzbGFuZE51bUNvbnN0cmFpbnRzKytdID0gY29uc3RyYWludDtcclxuICAgICAgICAgICAgY29uc3RyYWludC5hZGRlZFRvSXNsYW5kID0gdHJ1ZTtcclxuICAgICAgICAgICAgdmFyIG5leHQgPSBjcy5ib2R5O1xyXG5cclxuICAgICAgICAgICAgaWYgKG5leHQuYWRkZWRUb0lzbGFuZCkgY29udGludWU7XHJcblxyXG4gICAgICAgICAgICAvLyBhZGQgcmlnaWQgYm9keSB0byBzdGFja1xyXG4gICAgICAgICAgICB0aGlzLmlzbGFuZFN0YWNrW3N0YWNrQ291bnQrK10gPSBuZXh0O1xyXG4gICAgICAgICAgICBuZXh0LmFkZGVkVG9Jc2xhbmQgPSB0cnVlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZm9yICh2YXIganMgPSBib2R5LmpvaW50TGluazsganMgIT09IG51bGw7IGpzID0ganMubmV4dCkge1xyXG4gICAgICAgICAgICBjb25zdHJhaW50ID0ganMuam9pbnQ7XHJcblxyXG4gICAgICAgICAgICBpZiAoY29uc3RyYWludC5hZGRlZFRvSXNsYW5kKSBjb250aW51ZTsvLyBpZ25vcmVcclxuXHJcbiAgICAgICAgICAgIC8vIGFkZCBjb25zdHJhaW50IHRvIHRoZSBpc2xhbmRcclxuICAgICAgICAgICAgdGhpcy5pc2xhbmRDb25zdHJhaW50c1tpc2xhbmROdW1Db25zdHJhaW50cysrXSA9IGNvbnN0cmFpbnQ7XHJcbiAgICAgICAgICAgIGNvbnN0cmFpbnQuYWRkZWRUb0lzbGFuZCA9IHRydWU7XHJcbiAgICAgICAgICAgIG5leHQgPSBqcy5ib2R5O1xyXG4gICAgICAgICAgICBpZiAobmV4dC5hZGRlZFRvSXNsYW5kIHx8ICFuZXh0LmlzRHluYW1pYykgY29udGludWU7XHJcblxyXG4gICAgICAgICAgICAvLyBhZGQgcmlnaWQgYm9keSB0byBzdGFja1xyXG4gICAgICAgICAgICB0aGlzLmlzbGFuZFN0YWNrW3N0YWNrQ291bnQrK10gPSBuZXh0O1xyXG4gICAgICAgICAgICBuZXh0LmFkZGVkVG9Jc2xhbmQgPSB0cnVlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gd2hpbGUgKHN0YWNrQ291bnQgIT0gMCk7XHJcblxyXG4gICAgICAgIC8vIHVwZGF0ZSB2ZWxvY2l0aWVzXHJcbiAgICAgICAgdmFyIGdWZWwgPSBuZXcgVmVjMygpLmFkZFNjYWxlZFZlY3Rvcih0aGlzLmdyYXZpdHksIHRoaXMudGltZVN0ZXApO1xyXG4gICAgICAgIC8qdmFyIGd4PXRoaXMuZ3Jhdml0eS54KnRoaXMudGltZVN0ZXA7XHJcbiAgICAgICAgdmFyIGd5PXRoaXMuZ3Jhdml0eS55KnRoaXMudGltZVN0ZXA7XHJcbiAgICAgICAgdmFyIGd6PXRoaXMuZ3Jhdml0eS56KnRoaXMudGltZVN0ZXA7Ki9cclxuICAgICAgICB2YXIgaiA9IGlzbGFuZE51bVJpZ2lkQm9kaWVzO1xyXG4gICAgICAgIHdoaWxlIChqLS0pIHtcclxuICAgICAgICAgIC8vb3IodmFyIGo9MCwgbD1pc2xhbmROdW1SaWdpZEJvZGllczsgajxsOyBqKyspe1xyXG4gICAgICAgICAgYm9keSA9IHRoaXMuaXNsYW5kUmlnaWRCb2RpZXNbal07XHJcbiAgICAgICAgICBpZiAoYm9keS5pc0R5bmFtaWMpIHtcclxuICAgICAgICAgICAgYm9keS5saW5lYXJWZWxvY2l0eS5hZGRFcXVhbChnVmVsKTtcclxuICAgICAgICAgICAgLypib2R5LmxpbmVhclZlbG9jaXR5LngrPWd4O1xyXG4gICAgICAgICAgICBib2R5LmxpbmVhclZlbG9jaXR5LnkrPWd5O1xyXG4gICAgICAgICAgICBib2R5LmxpbmVhclZlbG9jaXR5LnorPWd6OyovXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyByYW5kb21pemluZyBvcmRlclxyXG4gICAgICAgIGlmICh0aGlzLmVuYWJsZVJhbmRvbWl6ZXIpIHtcclxuICAgICAgICAgIC8vZm9yKHZhciBqPTEsIGw9aXNsYW5kTnVtQ29uc3RyYWludHM7IGo8bDsgaisrKXtcclxuICAgICAgICAgIGogPSBpc2xhbmROdW1Db25zdHJhaW50cztcclxuICAgICAgICAgIHdoaWxlIChqLS0pIHtcclxuICAgICAgICAgICAgaWYgKGogIT09IDApIHtcclxuICAgICAgICAgICAgICB2YXIgc3dhcCA9ICh0aGlzLnJhbmRYID0gKHRoaXMucmFuZFggKiB0aGlzLnJhbmRBICsgdGhpcy5yYW5kQiAmIDB4N2ZmZmZmZmYpKSAvIDIxNDc0ODM2NDguMCAqIGogfCAwO1xyXG4gICAgICAgICAgICAgIGNvbnN0cmFpbnQgPSB0aGlzLmlzbGFuZENvbnN0cmFpbnRzW2pdO1xyXG4gICAgICAgICAgICAgIHRoaXMuaXNsYW5kQ29uc3RyYWludHNbal0gPSB0aGlzLmlzbGFuZENvbnN0cmFpbnRzW3N3YXBdO1xyXG4gICAgICAgICAgICAgIHRoaXMuaXNsYW5kQ29uc3RyYWludHNbc3dhcF0gPSBjb25zdHJhaW50O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBzb2x2ZSBjb250cmFpbnRzXHJcblxyXG4gICAgICAgIGogPSBpc2xhbmROdW1Db25zdHJhaW50cztcclxuICAgICAgICB3aGlsZSAoai0tKSB7XHJcbiAgICAgICAgICAvL2ZvcihqPTAsIGw9aXNsYW5kTnVtQ29uc3RyYWludHM7IGo8bDsgaisrKXtcclxuICAgICAgICAgIHRoaXMuaXNsYW5kQ29uc3RyYWludHNbal0ucHJlU29sdmUodGhpcy50aW1lU3RlcCwgaW52VGltZVN0ZXApOy8vIHByZS1zb2x2ZVxyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgayA9IHRoaXMubnVtSXRlcmF0aW9ucztcclxuICAgICAgICB3aGlsZSAoay0tKSB7XHJcbiAgICAgICAgICAvL2Zvcih2YXIgaz0wLCBsPXRoaXMubnVtSXRlcmF0aW9uczsgazxsOyBrKyspe1xyXG4gICAgICAgICAgaiA9IGlzbGFuZE51bUNvbnN0cmFpbnRzO1xyXG4gICAgICAgICAgd2hpbGUgKGotLSkge1xyXG4gICAgICAgICAgICAvL2ZvcihqPTAsIG09aXNsYW5kTnVtQ29uc3RyYWludHM7IGo8bTsgaisrKXtcclxuICAgICAgICAgICAgdGhpcy5pc2xhbmRDb25zdHJhaW50c1tqXS5zb2x2ZSgpOy8vIG1haW4tc29sdmVcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaiA9IGlzbGFuZE51bUNvbnN0cmFpbnRzO1xyXG4gICAgICAgIHdoaWxlIChqLS0pIHtcclxuICAgICAgICAgIC8vZm9yKGo9MCwgbD1pc2xhbmROdW1Db25zdHJhaW50czsgajxsOyBqKyspe1xyXG4gICAgICAgICAgdGhpcy5pc2xhbmRDb25zdHJhaW50c1tqXS5wb3N0U29sdmUoKTsvLyBwb3N0LXNvbHZlXHJcbiAgICAgICAgICB0aGlzLmlzbGFuZENvbnN0cmFpbnRzW2pdID0gbnVsbDsvLyBnY1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gc2xlZXBpbmcgY2hlY2tcclxuXHJcbiAgICAgICAgdmFyIHNsZWVwVGltZSA9IDEwO1xyXG4gICAgICAgIGogPSBpc2xhbmROdW1SaWdpZEJvZGllcztcclxuICAgICAgICB3aGlsZSAoai0tKSB7XHJcbiAgICAgICAgICAvL2ZvcihqPTAsIGw9aXNsYW5kTnVtUmlnaWRCb2RpZXM7ajxsO2orKyl7XHJcbiAgICAgICAgICBib2R5ID0gdGhpcy5pc2xhbmRSaWdpZEJvZGllc1tqXTtcclxuICAgICAgICAgIGlmICh0aGlzLmNhbGxTbGVlcChib2R5KSkge1xyXG4gICAgICAgICAgICBib2R5LnNsZWVwVGltZSArPSB0aGlzLnRpbWVTdGVwO1xyXG4gICAgICAgICAgICBpZiAoYm9keS5zbGVlcFRpbWUgPCBzbGVlcFRpbWUpIHNsZWVwVGltZSA9IGJvZHkuc2xlZXBUaW1lO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgYm9keS5zbGVlcFRpbWUgPSAwO1xyXG4gICAgICAgICAgICBzbGVlcFRpbWUgPSAwO1xyXG4gICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHNsZWVwVGltZSA+IDAuNSkge1xyXG4gICAgICAgICAgLy8gc2xlZXAgdGhlIGlzbGFuZFxyXG4gICAgICAgICAgaiA9IGlzbGFuZE51bVJpZ2lkQm9kaWVzO1xyXG4gICAgICAgICAgd2hpbGUgKGotLSkge1xyXG4gICAgICAgICAgICAvL2ZvcihqPTAsIGw9aXNsYW5kTnVtUmlnaWRCb2RpZXM7ajxsO2orKyl7XHJcbiAgICAgICAgICAgIHRoaXMuaXNsYW5kUmlnaWRCb2RpZXNbal0uc2xlZXAoKTtcclxuICAgICAgICAgICAgdGhpcy5pc2xhbmRSaWdpZEJvZGllc1tqXSA9IG51bGw7Ly8gZ2NcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgLy8gdXBkYXRlIHBvc2l0aW9uc1xyXG4gICAgICAgICAgaiA9IGlzbGFuZE51bVJpZ2lkQm9kaWVzO1xyXG4gICAgICAgICAgd2hpbGUgKGotLSkge1xyXG4gICAgICAgICAgICAvL2ZvcihqPTAsIGw9aXNsYW5kTnVtUmlnaWRCb2RpZXM7ajxsO2orKyl7XHJcbiAgICAgICAgICAgIHRoaXMuaXNsYW5kUmlnaWRCb2RpZXNbal0udXBkYXRlUG9zaXRpb24odGhpcy50aW1lU3RlcCk7XHJcbiAgICAgICAgICAgIHRoaXMuaXNsYW5kUmlnaWRCb2RpZXNbal0gPSBudWxsOy8vIGdjXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMubnVtSXNsYW5kcysrO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgICAvLyAgIEVORCBTSU1VTEFUSU9OXHJcbiAgICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgICBpZiAoc3RhdCkgdGhpcy5wZXJmb3JtYW5jZS5jYWxjRW5kKCk7XHJcblxyXG4gICAgICBpZiAodGhpcy5wb3N0TG9vcCAhPT0gbnVsbCkgdGhpcy5wb3N0TG9vcCgpO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgLy8gcmVtb3ZlIHNvbWV0aW5nIHRvIHdvcmxkXHJcblxyXG4gICAgcmVtb3ZlOiBmdW5jdGlvbiAob2JqKSB7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICAvLyBhZGQgc29tZXRpbmcgdG8gd29ybGRcclxuXHJcbiAgICBhZGQ6IGZ1bmN0aW9uIChvKSB7XHJcblxyXG4gICAgICBvID0gbyB8fCB7fTtcclxuXHJcbiAgICAgIHZhciB0eXBlID0gby50eXBlIHx8IFwiYm94XCI7XHJcbiAgICAgIGlmICh0eXBlLmNvbnN0cnVjdG9yID09PSBTdHJpbmcpIHR5cGUgPSBbdHlwZV07XHJcbiAgICAgIHZhciBpc0pvaW50ID0gdHlwZVswXS5zdWJzdHJpbmcoMCwgNSkgPT09ICdqb2ludCcgPyB0cnVlIDogZmFsc2U7XHJcblxyXG4gICAgICBpZiAoaXNKb2ludCkgcmV0dXJuIHRoaXMuaW5pdEpvaW50KHR5cGVbMF0sIG8pO1xyXG4gICAgICBlbHNlIHJldHVybiB0aGlzLmluaXRCb2R5KHR5cGUsIG8pO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgaW5pdEJvZHk6IGZ1bmN0aW9uICh0eXBlLCBvKSB7XHJcblxyXG4gICAgICB2YXIgaW52U2NhbGUgPSB0aGlzLmludlNjYWxlO1xyXG5cclxuICAgICAgLy8gYm9keSBkeW5hbWljIG9yIHN0YXRpY1xyXG4gICAgICB2YXIgbW92ZSA9IG8ubW92ZSB8fCBmYWxzZTtcclxuICAgICAgdmFyIGtpbmVtYXRpYyA9IG8ua2luZW1hdGljIHx8IGZhbHNlO1xyXG5cclxuICAgICAgLy8gUE9TSVRJT05cclxuXHJcbiAgICAgIC8vIGJvZHkgcG9zaXRpb25cclxuICAgICAgdmFyIHAgPSBvLnBvcyB8fCBbMCwgMCwgMF07XHJcbiAgICAgIHAgPSBwLm1hcChmdW5jdGlvbiAoeCkgeyByZXR1cm4geCAqIGludlNjYWxlOyB9KTtcclxuXHJcbiAgICAgIC8vIHNoYXBlIHBvc2l0aW9uXHJcbiAgICAgIHZhciBwMiA9IG8ucG9zU2hhcGUgfHwgWzAsIDAsIDBdO1xyXG4gICAgICBwMiA9IHAyLm1hcChmdW5jdGlvbiAoeCkgeyByZXR1cm4geCAqIGludlNjYWxlOyB9KTtcclxuXHJcbiAgICAgIC8vIFJPVEFUSU9OXHJcblxyXG4gICAgICAvLyBib2R5IHJvdGF0aW9uIGluIGRlZ3JlZVxyXG4gICAgICB2YXIgciA9IG8ucm90IHx8IFswLCAwLCAwXTtcclxuICAgICAgciA9IHIubWFwKGZ1bmN0aW9uICh4KSB7IHJldHVybiB4ICogX01hdGguZGVndG9yYWQ7IH0pO1xyXG5cclxuICAgICAgLy8gc2hhcGUgcm90YXRpb24gaW4gZGVncmVlXHJcbiAgICAgIHZhciByMiA9IG8ucm90U2hhcGUgfHwgWzAsIDAsIDBdO1xyXG4gICAgICByMiA9IHIubWFwKGZ1bmN0aW9uICh4KSB7IHJldHVybiB4ICogX01hdGguZGVndG9yYWQ7IH0pO1xyXG5cclxuICAgICAgLy8gU0laRVxyXG5cclxuICAgICAgLy8gc2hhcGUgc2l6ZVxyXG4gICAgICB2YXIgcyA9IG8uc2l6ZSA9PT0gdW5kZWZpbmVkID8gWzEsIDEsIDFdIDogby5zaXplO1xyXG4gICAgICBpZiAocy5sZW5ndGggPT09IDEpIHsgc1sxXSA9IHNbMF07IH1cclxuICAgICAgaWYgKHMubGVuZ3RoID09PSAyKSB7IHNbMl0gPSBzWzBdOyB9XHJcbiAgICAgIHMgPSBzLm1hcChmdW5jdGlvbiAoeCkgeyByZXR1cm4geCAqIGludlNjYWxlOyB9KTtcclxuXHJcblxyXG5cclxuICAgICAgLy8gYm9keSBwaHlzaWNzIHNldHRpbmdzXHJcbiAgICAgIHZhciBzYyA9IG5ldyBTaGFwZUNvbmZpZygpO1xyXG4gICAgICAvLyBUaGUgZGVuc2l0eSBvZiB0aGUgc2hhcGUuXHJcbiAgICAgIGlmIChvLmRlbnNpdHkgIT09IHVuZGVmaW5lZCkgc2MuZGVuc2l0eSA9IG8uZGVuc2l0eTtcclxuICAgICAgLy8gVGhlIGNvZWZmaWNpZW50IG9mIGZyaWN0aW9uIG9mIHRoZSBzaGFwZS5cclxuICAgICAgaWYgKG8uZnJpY3Rpb24gIT09IHVuZGVmaW5lZCkgc2MuZnJpY3Rpb24gPSBvLmZyaWN0aW9uO1xyXG4gICAgICAvLyBUaGUgY29lZmZpY2llbnQgb2YgcmVzdGl0dXRpb24gb2YgdGhlIHNoYXBlLlxyXG4gICAgICBpZiAoby5yZXN0aXR1dGlvbiAhPT0gdW5kZWZpbmVkKSBzYy5yZXN0aXR1dGlvbiA9IG8ucmVzdGl0dXRpb247XHJcbiAgICAgIC8vIFRoZSBiaXRzIG9mIHRoZSBjb2xsaXNpb24gZ3JvdXBzIHRvIHdoaWNoIHRoZSBzaGFwZSBiZWxvbmdzLlxyXG4gICAgICBpZiAoby5iZWxvbmdzVG8gIT09IHVuZGVmaW5lZCkgc2MuYmVsb25nc1RvID0gby5iZWxvbmdzVG87XHJcbiAgICAgIC8vIFRoZSBiaXRzIG9mIHRoZSBjb2xsaXNpb24gZ3JvdXBzIHdpdGggd2hpY2ggdGhlIHNoYXBlIGNvbGxpZGVzLlxyXG4gICAgICBpZiAoby5jb2xsaWRlc1dpdGggIT09IHVuZGVmaW5lZCkgc2MuY29sbGlkZXNXaXRoID0gby5jb2xsaWRlc1dpdGg7XHJcblxyXG4gICAgICBpZiAoby5jb25maWcgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIGlmIChvLmNvbmZpZ1swXSAhPT0gdW5kZWZpbmVkKSBzYy5kZW5zaXR5ID0gby5jb25maWdbMF07XHJcbiAgICAgICAgaWYgKG8uY29uZmlnWzFdICE9PSB1bmRlZmluZWQpIHNjLmZyaWN0aW9uID0gby5jb25maWdbMV07XHJcbiAgICAgICAgaWYgKG8uY29uZmlnWzJdICE9PSB1bmRlZmluZWQpIHNjLnJlc3RpdHV0aW9uID0gby5jb25maWdbMl07XHJcbiAgICAgICAgaWYgKG8uY29uZmlnWzNdICE9PSB1bmRlZmluZWQpIHNjLmJlbG9uZ3NUbyA9IG8uY29uZmlnWzNdO1xyXG4gICAgICAgIGlmIChvLmNvbmZpZ1s0XSAhPT0gdW5kZWZpbmVkKSBzYy5jb2xsaWRlc1dpdGggPSBvLmNvbmZpZ1s0XTtcclxuICAgICAgfVxyXG5cclxuXHJcbiAgICAgIC8qIGlmKG8ubWFzc1Bvcyl7XHJcbiAgICAgICAgICAgby5tYXNzUG9zID0gby5tYXNzUG9zLm1hcChmdW5jdGlvbih4KSB7IHJldHVybiB4ICogaW52U2NhbGU7IH0pO1xyXG4gICAgICAgICAgIHNjLnJlbGF0aXZlUG9zaXRpb24uc2V0KCBvLm1hc3NQb3NbMF0sIG8ubWFzc1Bvc1sxXSwgby5tYXNzUG9zWzJdICk7XHJcbiAgICAgICB9XHJcbiAgICAgICBpZihvLm1hc3NSb3Qpe1xyXG4gICAgICAgICAgIG8ubWFzc1JvdCA9IG8ubWFzc1JvdC5tYXAoZnVuY3Rpb24oeCkgeyByZXR1cm4geCAqIF9NYXRoLmRlZ3RvcmFkOyB9KTtcclxuICAgICAgICAgICB2YXIgcSA9IG5ldyBRdWF0KCkuc2V0RnJvbUV1bGVyKCBvLm1hc3NSb3RbMF0sIG8ubWFzc1JvdFsxXSwgby5tYXNzUm90WzJdICk7XHJcbiAgICAgICAgICAgc2MucmVsYXRpdmVSb3RhdGlvbiA9IG5ldyBNYXQzMygpLnNldFF1YXQoIHEgKTsvL19NYXRoLkV1bGVyVG9NYXRyaXgoIG8ubWFzc1JvdFswXSwgby5tYXNzUm90WzFdLCBvLm1hc3NSb3RbMl0gKTtcclxuICAgICAgIH0qL1xyXG5cclxuICAgICAgdmFyIHBvc2l0aW9uID0gbmV3IFZlYzMocFswXSwgcFsxXSwgcFsyXSk7XHJcbiAgICAgIHZhciByb3RhdGlvbiA9IG5ldyBRdWF0KCkuc2V0RnJvbUV1bGVyKHJbMF0sIHJbMV0sIHJbMl0pO1xyXG5cclxuICAgICAgLy8gcmlnaWRib2R5XHJcbiAgICAgIHZhciBib2R5ID0gbmV3IFJpZ2lkQm9keShwb3NpdGlvbiwgcm90YXRpb24pO1xyXG4gICAgICAvL3ZhciBib2R5ID0gbmV3IFJpZ2lkQm9keSggcFswXSwgcFsxXSwgcFsyXSwgclswXSwgclsxXSwgclsyXSwgclszXSwgdGhpcy5zY2FsZSwgdGhpcy5pbnZTY2FsZSApO1xyXG5cclxuICAgICAgLy8gU0hBUEVTXHJcblxyXG4gICAgICB2YXIgc2hhcGUsIG47XHJcblxyXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHR5cGUubGVuZ3RoOyBpKyspIHtcclxuXHJcbiAgICAgICAgbiA9IGkgKiAzO1xyXG5cclxuICAgICAgICBpZiAocDJbbl0gIT09IHVuZGVmaW5lZCkgc2MucmVsYXRpdmVQb3NpdGlvbi5zZXQocDJbbl0sIHAyW24gKyAxXSwgcDJbbiArIDJdKTtcclxuICAgICAgICBpZiAocjJbbl0gIT09IHVuZGVmaW5lZCkgc2MucmVsYXRpdmVSb3RhdGlvbi5zZXRRdWF0KG5ldyBRdWF0KCkuc2V0RnJvbUV1bGVyKHIyW25dLCByMltuICsgMV0sIHIyW24gKyAyXSkpO1xyXG5cclxuICAgICAgICBzd2l0Y2ggKHR5cGVbaV0pIHtcclxuICAgICAgICAgIGNhc2UgXCJzcGhlcmVcIjogc2hhcGUgPSBuZXcgU3BoZXJlKHNjLCBzW25dKTsgYnJlYWs7XHJcbiAgICAgICAgICBjYXNlIFwiY3lsaW5kZXJcIjogc2hhcGUgPSBuZXcgQ3lsaW5kZXIoc2MsIHNbbl0sIHNbbiArIDFdKTsgYnJlYWs7XHJcbiAgICAgICAgICBjYXNlIFwiYm94XCI6IHNoYXBlID0gbmV3IEJveChzYywgc1tuXSwgc1tuICsgMV0sIHNbbiArIDJdKTsgYnJlYWs7XHJcbiAgICAgICAgICBjYXNlIFwicGxhbmVcIjogc2hhcGUgPSBuZXcgUGxhbmUoc2MpOyBicmVha1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgYm9keS5hZGRTaGFwZShzaGFwZSk7XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBib2R5IGNhbiBzbGVlcCBvciBub3RcclxuICAgICAgaWYgKG8ubmV2ZXJTbGVlcCB8fCBraW5lbWF0aWMpIGJvZHkuYWxsb3dTbGVlcCA9IGZhbHNlO1xyXG4gICAgICBlbHNlIGJvZHkuYWxsb3dTbGVlcCA9IHRydWU7XHJcblxyXG4gICAgICBib2R5LmlzS2luZW1hdGljID0ga2luZW1hdGljO1xyXG5cclxuICAgICAgLy8gYm9keSBzdGF0aWMgb3IgZHluYW1pY1xyXG4gICAgICBpZiAobW92ZSkge1xyXG5cclxuICAgICAgICBpZiAoby5tYXNzUG9zIHx8IG8ubWFzc1JvdCkgYm9keS5zZXR1cE1hc3MoQk9EWV9EWU5BTUlDLCBmYWxzZSk7XHJcbiAgICAgICAgZWxzZSBib2R5LnNldHVwTWFzcyhCT0RZX0RZTkFNSUMsIHRydWUpO1xyXG5cclxuICAgICAgICAvLyBib2R5IGNhbiBzbGVlcCBvciBub3RcclxuICAgICAgICAvL2lmKCBvLm5ldmVyU2xlZXAgKSBib2R5LmFsbG93U2xlZXAgPSBmYWxzZTtcclxuICAgICAgICAvL2Vsc2UgYm9keS5hbGxvd1NsZWVwID0gdHJ1ZTtcclxuXHJcbiAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgIGJvZHkuc2V0dXBNYXNzKEJPRFlfU1RBVElDKTtcclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChvLm5hbWUgIT09IHVuZGVmaW5lZCkgYm9keS5uYW1lID0gby5uYW1lO1xyXG4gICAgICAvL2Vsc2UgaWYoIG1vdmUgKSBib2R5Lm5hbWUgPSB0aGlzLm51bVJpZ2lkQm9kaWVzO1xyXG5cclxuICAgICAgLy8gZmluYWx5IGFkZCB0byBwaHlzaWNzIHdvcmxkXHJcbiAgICAgIHRoaXMuYWRkUmlnaWRCb2R5KGJvZHkpO1xyXG5cclxuICAgICAgLy8gZm9yY2Ugc2xlZXAgb24gbm90XHJcbiAgICAgIGlmIChtb3ZlKSB7XHJcbiAgICAgICAgaWYgKG8uc2xlZXApIGJvZHkuc2xlZXAoKTtcclxuICAgICAgICBlbHNlIGJvZHkuYXdha2UoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIGJvZHk7XHJcblxyXG5cclxuICAgIH0sXHJcblxyXG4gICAgaW5pdEpvaW50OiBmdW5jdGlvbiAodHlwZSwgbykge1xyXG5cclxuICAgICAgLy92YXIgdHlwZSA9IHR5cGU7XHJcbiAgICAgIHZhciBpbnZTY2FsZSA9IHRoaXMuaW52U2NhbGU7XHJcblxyXG4gICAgICB2YXIgYXhlMSA9IG8uYXhlMSB8fCBbMSwgMCwgMF07XHJcbiAgICAgIHZhciBheGUyID0gby5heGUyIHx8IFsxLCAwLCAwXTtcclxuICAgICAgdmFyIHBvczEgPSBvLnBvczEgfHwgWzAsIDAsIDBdO1xyXG4gICAgICB2YXIgcG9zMiA9IG8ucG9zMiB8fCBbMCwgMCwgMF07XHJcblxyXG4gICAgICBwb3MxID0gcG9zMS5tYXAoZnVuY3Rpb24gKHgpIHsgcmV0dXJuIHggKiBpbnZTY2FsZTsgfSk7XHJcbiAgICAgIHBvczIgPSBwb3MyLm1hcChmdW5jdGlvbiAoeCkgeyByZXR1cm4geCAqIGludlNjYWxlOyB9KTtcclxuXHJcbiAgICAgIHZhciBtaW4sIG1heDtcclxuICAgICAgaWYgKHR5cGUgPT09IFwiam9pbnREaXN0YW5jZVwiKSB7XHJcbiAgICAgICAgbWluID0gby5taW4gfHwgMDtcclxuICAgICAgICBtYXggPSBvLm1heCB8fCAxMDtcclxuICAgICAgICBtaW4gPSBtaW4gKiBpbnZTY2FsZTtcclxuICAgICAgICBtYXggPSBtYXggKiBpbnZTY2FsZTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBtaW4gPSBvLm1pbiB8fCA1Ny4yOTU3ODtcclxuICAgICAgICBtYXggPSBvLm1heCB8fCAwO1xyXG4gICAgICAgIG1pbiA9IG1pbiAqIF9NYXRoLmRlZ3RvcmFkO1xyXG4gICAgICAgIG1heCA9IG1heCAqIF9NYXRoLmRlZ3RvcmFkO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB2YXIgbGltaXQgPSBvLmxpbWl0IHx8IG51bGw7XHJcbiAgICAgIHZhciBzcHJpbmcgPSBvLnNwcmluZyB8fCBudWxsO1xyXG4gICAgICB2YXIgbW90b3IgPSBvLm1vdG9yIHx8IG51bGw7XHJcblxyXG4gICAgICAvLyBqb2ludCBzZXR0aW5nXHJcbiAgICAgIHZhciBqYyA9IG5ldyBKb2ludENvbmZpZygpO1xyXG4gICAgICBqYy5zY2FsZSA9IHRoaXMuc2NhbGU7XHJcbiAgICAgIGpjLmludlNjYWxlID0gdGhpcy5pbnZTY2FsZTtcclxuICAgICAgamMuYWxsb3dDb2xsaXNpb24gPSBvLmNvbGxpc2lvbiB8fCBmYWxzZTtcclxuICAgICAgamMubG9jYWxBeGlzMS5zZXQoYXhlMVswXSwgYXhlMVsxXSwgYXhlMVsyXSk7XHJcbiAgICAgIGpjLmxvY2FsQXhpczIuc2V0KGF4ZTJbMF0sIGF4ZTJbMV0sIGF4ZTJbMl0pO1xyXG4gICAgICBqYy5sb2NhbEFuY2hvclBvaW50MS5zZXQocG9zMVswXSwgcG9zMVsxXSwgcG9zMVsyXSk7XHJcbiAgICAgIGpjLmxvY2FsQW5jaG9yUG9pbnQyLnNldChwb3MyWzBdLCBwb3MyWzFdLCBwb3MyWzJdKTtcclxuXHJcbiAgICAgIHZhciBiMSA9IG51bGw7XHJcbiAgICAgIHZhciBiMiA9IG51bGw7XHJcblxyXG4gICAgICBpZiAoby5ib2R5MSA9PT0gdW5kZWZpbmVkIHx8IG8uYm9keTIgPT09IHVuZGVmaW5lZCkgcmV0dXJuIHByaW50RXJyb3IoJ1dvcmxkJywgXCJDYW4ndCBhZGQgam9pbnQgaWYgYXR0YWNoIHJpZ2lkYm9keXMgbm90IGRlZmluZSAhXCIpO1xyXG5cclxuICAgICAgaWYgKG8uYm9keTEuY29uc3RydWN0b3IgPT09IFN0cmluZykgeyBiMSA9IHRoaXMuZ2V0QnlOYW1lKG8uYm9keTEpOyB9XHJcbiAgICAgIGVsc2UgaWYgKG8uYm9keTEuY29uc3RydWN0b3IgPT09IE51bWJlcikgeyBiMSA9IHRoaXMuZ2V0QnlOYW1lKG8uYm9keTEpOyB9XHJcbiAgICAgIGVsc2UgaWYgKG8uYm9keTEuY29uc3RydWN0b3IgPT09IFJpZ2lkQm9keSkgeyBiMSA9IG8uYm9keTE7IH1cclxuXHJcbiAgICAgIGlmIChvLmJvZHkyLmNvbnN0cnVjdG9yID09PSBTdHJpbmcpIHsgYjIgPSB0aGlzLmdldEJ5TmFtZShvLmJvZHkyKTsgfVxyXG4gICAgICBlbHNlIGlmIChvLmJvZHkyLmNvbnN0cnVjdG9yID09PSBOdW1iZXIpIHsgYjIgPSB0aGlzLmdldEJ5TmFtZShvLmJvZHkyKTsgfVxyXG4gICAgICBlbHNlIGlmIChvLmJvZHkyLmNvbnN0cnVjdG9yID09PSBSaWdpZEJvZHkpIHsgYjIgPSBvLmJvZHkyOyB9XHJcblxyXG4gICAgICBpZiAoYjEgPT09IG51bGwgfHwgYjIgPT09IG51bGwpIHJldHVybiBwcmludEVycm9yKCdXb3JsZCcsIFwiQ2FuJ3QgYWRkIGpvaW50IGF0dGFjaCByaWdpZGJvZHlzIG5vdCBmaW5kICFcIik7XHJcblxyXG4gICAgICBqYy5ib2R5MSA9IGIxO1xyXG4gICAgICBqYy5ib2R5MiA9IGIyO1xyXG5cclxuICAgICAgdmFyIGpvaW50O1xyXG4gICAgICBzd2l0Y2ggKHR5cGUpIHtcclxuICAgICAgICBjYXNlIFwiam9pbnREaXN0YW5jZVwiOiBqb2ludCA9IG5ldyBEaXN0YW5jZUpvaW50KGpjLCBtaW4sIG1heCk7XHJcbiAgICAgICAgICBpZiAoc3ByaW5nICE9PSBudWxsKSBqb2ludC5saW1pdE1vdG9yLnNldFNwcmluZyhzcHJpbmdbMF0sIHNwcmluZ1sxXSk7XHJcbiAgICAgICAgICBpZiAobW90b3IgIT09IG51bGwpIGpvaW50LmxpbWl0TW90b3Iuc2V0TW90b3IobW90b3JbMF0sIG1vdG9yWzFdKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgXCJqb2ludEhpbmdlXCI6IGNhc2UgXCJqb2ludFwiOiBqb2ludCA9IG5ldyBIaW5nZUpvaW50KGpjLCBtaW4sIG1heCk7XHJcbiAgICAgICAgICBpZiAoc3ByaW5nICE9PSBudWxsKSBqb2ludC5saW1pdE1vdG9yLnNldFNwcmluZyhzcHJpbmdbMF0sIHNwcmluZ1sxXSk7Ly8gc29mdGVuIHRoZSBqb2ludCBleDogMTAwLCAwLjJcclxuICAgICAgICAgIGlmIChtb3RvciAhPT0gbnVsbCkgam9pbnQubGltaXRNb3Rvci5zZXRNb3Rvcihtb3RvclswXSwgbW90b3JbMV0pO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBcImpvaW50UHJpc21lXCI6IGpvaW50ID0gbmV3IFByaXNtYXRpY0pvaW50KGpjLCBtaW4sIG1heCk7IGJyZWFrO1xyXG4gICAgICAgIGNhc2UgXCJqb2ludFNsaWRlXCI6IGpvaW50ID0gbmV3IFNsaWRlckpvaW50KGpjLCBtaW4sIG1heCk7IGJyZWFrO1xyXG4gICAgICAgIGNhc2UgXCJqb2ludEJhbGxcIjogam9pbnQgPSBuZXcgQmFsbEFuZFNvY2tldEpvaW50KGpjKTsgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBcImpvaW50V2hlZWxcIjogam9pbnQgPSBuZXcgV2hlZWxKb2ludChqYyk7XHJcbiAgICAgICAgICBpZiAobGltaXQgIT09IG51bGwpIGpvaW50LnJvdGF0aW9uYWxMaW1pdE1vdG9yMS5zZXRMaW1pdChsaW1pdFswXSwgbGltaXRbMV0pO1xyXG4gICAgICAgICAgaWYgKHNwcmluZyAhPT0gbnVsbCkgam9pbnQucm90YXRpb25hbExpbWl0TW90b3IxLnNldFNwcmluZyhzcHJpbmdbMF0sIHNwcmluZ1sxXSk7XHJcbiAgICAgICAgICBpZiAobW90b3IgIT09IG51bGwpIGpvaW50LnJvdGF0aW9uYWxMaW1pdE1vdG9yMS5zZXRNb3Rvcihtb3RvclswXSwgbW90b3JbMV0pO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGpvaW50Lm5hbWUgPSBvLm5hbWUgfHwgJyc7XHJcbiAgICAgIC8vIGZpbmFseSBhZGQgdG8gcGh5c2ljcyB3b3JsZFxyXG4gICAgICB0aGlzLmFkZEpvaW50KGpvaW50KTtcclxuXHJcbiAgICAgIHJldHVybiBqb2ludDtcclxuXHJcbiAgICB9LFxyXG5cclxuXHJcbiAgfSk7XHJcblxyXG4gIC8vIHRlc3QgdmVyc2lvblxyXG5cclxuICAvL2V4cG9ydCB7IFJpZ2lkQm9keSB9IGZyb20gJy4vY29yZS9SaWdpZEJvZHlfWC5qcyc7XHJcbiAgLy9leHBvcnQgeyBXb3JsZCB9IGZyb20gJy4vY29yZS9Xb3JsZF9YLmpzJztcclxuXHJcbiAgZXhwb3J0cy5NYXRoID0gX01hdGg7XHJcbiAgZXhwb3J0cy5WZWMzID0gVmVjMztcclxuICBleHBvcnRzLlF1YXQgPSBRdWF0O1xyXG4gIGV4cG9ydHMuTWF0MzMgPSBNYXQzMztcclxuICBleHBvcnRzLlNoYXBlID0gU2hhcGU7XHJcbiAgZXhwb3J0cy5Cb3ggPSBCb3g7XHJcbiAgZXhwb3J0cy5TcGhlcmUgPSBTcGhlcmU7XHJcbiAgZXhwb3J0cy5DeWxpbmRlciA9IEN5bGluZGVyO1xyXG4gIGV4cG9ydHMuUGxhbmUgPSBQbGFuZTtcclxuICBleHBvcnRzLlBhcnRpY2xlID0gUGFydGljbGU7XHJcbiAgZXhwb3J0cy5TaGFwZUNvbmZpZyA9IFNoYXBlQ29uZmlnO1xyXG4gIGV4cG9ydHMuTGltaXRNb3RvciA9IExpbWl0TW90b3I7XHJcbiAgZXhwb3J0cy5IaW5nZUpvaW50ID0gSGluZ2VKb2ludDtcclxuICBleHBvcnRzLkJhbGxBbmRTb2NrZXRKb2ludCA9IEJhbGxBbmRTb2NrZXRKb2ludDtcclxuICBleHBvcnRzLkRpc3RhbmNlSm9pbnQgPSBEaXN0YW5jZUpvaW50O1xyXG4gIGV4cG9ydHMuUHJpc21hdGljSm9pbnQgPSBQcmlzbWF0aWNKb2ludDtcclxuICBleHBvcnRzLlNsaWRlckpvaW50ID0gU2xpZGVySm9pbnQ7XHJcbiAgZXhwb3J0cy5XaGVlbEpvaW50ID0gV2hlZWxKb2ludDtcclxuICBleHBvcnRzLkpvaW50Q29uZmlnID0gSm9pbnRDb25maWc7XHJcbiAgZXhwb3J0cy5SaWdpZEJvZHkgPSBSaWdpZEJvZHk7XHJcbiAgZXhwb3J0cy5Xb3JsZCA9IFdvcmxkO1xyXG4gIGV4cG9ydHMuUkVWSVNJT04gPSBSRVZJU0lPTjtcclxuICBleHBvcnRzLkJSX05VTEwgPSBCUl9OVUxMO1xyXG4gIGV4cG9ydHMuQlJfQlJVVEVfRk9SQ0UgPSBCUl9CUlVURV9GT1JDRTtcclxuICBleHBvcnRzLkJSX1NXRUVQX0FORF9QUlVORSA9IEJSX1NXRUVQX0FORF9QUlVORTtcclxuICBleHBvcnRzLkJSX0JPVU5ESU5HX1ZPTFVNRV9UUkVFID0gQlJfQk9VTkRJTkdfVk9MVU1FX1RSRUU7XHJcbiAgZXhwb3J0cy5CT0RZX05VTEwgPSBCT0RZX05VTEw7XHJcbiAgZXhwb3J0cy5CT0RZX0RZTkFNSUMgPSBCT0RZX0RZTkFNSUM7XHJcbiAgZXhwb3J0cy5CT0RZX1NUQVRJQyA9IEJPRFlfU1RBVElDO1xyXG4gIGV4cG9ydHMuQk9EWV9LSU5FTUFUSUMgPSBCT0RZX0tJTkVNQVRJQztcclxuICBleHBvcnRzLkJPRFlfR0hPU1QgPSBCT0RZX0dIT1NUO1xyXG4gIGV4cG9ydHMuU0hBUEVfTlVMTCA9IFNIQVBFX05VTEw7XHJcbiAgZXhwb3J0cy5TSEFQRV9TUEhFUkUgPSBTSEFQRV9TUEhFUkU7XHJcbiAgZXhwb3J0cy5TSEFQRV9CT1ggPSBTSEFQRV9CT1g7XHJcbiAgZXhwb3J0cy5TSEFQRV9DWUxJTkRFUiA9IFNIQVBFX0NZTElOREVSO1xyXG4gIGV4cG9ydHMuU0hBUEVfUExBTkUgPSBTSEFQRV9QTEFORTtcclxuICBleHBvcnRzLlNIQVBFX1BBUlRJQ0xFID0gU0hBUEVfUEFSVElDTEU7XHJcbiAgZXhwb3J0cy5TSEFQRV9URVRSQSA9IFNIQVBFX1RFVFJBO1xyXG4gIGV4cG9ydHMuSk9JTlRfTlVMTCA9IEpPSU5UX05VTEw7XHJcbiAgZXhwb3J0cy5KT0lOVF9ESVNUQU5DRSA9IEpPSU5UX0RJU1RBTkNFO1xyXG4gIGV4cG9ydHMuSk9JTlRfQkFMTF9BTkRfU09DS0VUID0gSk9JTlRfQkFMTF9BTkRfU09DS0VUO1xyXG4gIGV4cG9ydHMuSk9JTlRfSElOR0UgPSBKT0lOVF9ISU5HRTtcclxuICBleHBvcnRzLkpPSU5UX1dIRUVMID0gSk9JTlRfV0hFRUw7XHJcbiAgZXhwb3J0cy5KT0lOVF9TTElERVIgPSBKT0lOVF9TTElERVI7XHJcbiAgZXhwb3J0cy5KT0lOVF9QUklTTUFUSUMgPSBKT0lOVF9QUklTTUFUSUM7XHJcbiAgZXhwb3J0cy5BQUJCX1BST1ggPSBBQUJCX1BST1g7XHJcbiAgZXhwb3J0cy5wcmludEVycm9yID0gcHJpbnRFcnJvcjtcclxuICBleHBvcnRzLkluZm9EaXNwbGF5ID0gSW5mb0Rpc3BsYXk7XHJcblxyXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XHJcblxyXG59KSk7IiwiLyogZ2xvYmFsIEFGUkFNRSwgVEhSRUUsIE9JTU8gKi9cclxuXHJcbmdsb2JhbC5PSU1PID0gcmVxdWlyZShcIi4vbGlicy9vaW1vXCIpXHJcbmdsb2JhbC53b3JsZCA9IG5ldyBPSU1PLldvcmxkKClcclxuZ2xvYmFsLmJvZGllcyA9IFtdXHJcbmdsb2JhbC5tb3ZpbmdCb2RpZXMgPSBbXVxyXG5cclxubGV0IHZlYyA9IG5ldyBPSU1PLlZlYzMoKVxyXG5sZXQgcXVhdCA9IG5ldyBPSU1PLlF1YXQoKVxyXG5sZXQgbmV4dFN0ZXAgPSAwXHJcblxyXG5mdW5jdGlvbiBpbml0KCkge1xyXG4gIGFkZEV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIG9uTWVzc2FnZSlcclxufVxyXG5cclxuZnVuY3Rpb24gb25NZXNzYWdlKGUpIHtcclxuICBpZiAodHlwZW9mIGUuZGF0YSA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgbGV0IGNvbW1hbmQgPSBwYXJzZUNvbW1hbmQoZS5kYXRhKVxyXG4gICAgc3dpdGNoIChjb21tYW5kLnNoaWZ0KCkpIHtcclxuICAgICAgY2FzZSBcIndvcmxkXCI6XHJcbiAgICAgICAgd29ybGRDb21tYW5kKGNvbW1hbmQpXHJcbiAgICAgICAgYnJlYWtcclxuICAgIH1cclxuICB9XHJcbiAgZWxzZSBpZiAoZS5kYXRhIGluc3RhbmNlb2YgRmxvYXQ2NEFycmF5KSB7XHJcbiAgICBsZXQgYnVmZmVyID0gZS5kYXRhXHJcbiAgICBsZXQgbm93ID0gRGF0ZS5ub3coKVxyXG4gICAgaWYgKG5vdyA+IG5leHRTdGVwKSB7XHJcbiAgICAgIHdvcmxkLnN0ZXAoKVxyXG4gICAgICBuZXh0U3RlcCArPSB3b3JsZC50aW1lcmF0ZVxyXG4gICAgfVxyXG4gICAgaWYgKG5vdyA+IG5leHRTdGVwKSB7XHJcbiAgICAgIG5leHRTdGVwID0gbm93XHJcbiAgICB9XHJcbiAgICBmb3IgKGxldCBtaWQgPSAwOyBtaWQgPCBtb3ZpbmdCb2RpZXMubGVuZ3RoOyBtaWQrKykge1xyXG4gICAgICBsZXQgYm9keSA9IG1vdmluZ0JvZGllc1ttaWRdXHJcbiAgICAgIGxldCBwID0gbWlkICogOFxyXG4gICAgICBpZiAoIWJvZHkpIGNvbnRpbnVlXHJcbiAgICAgIGlmIChib2R5LmlzS2luZW1hdGljKSB7XHJcbiAgICAgICAgdmVjLnNldChidWZmZXJbcCsrXSwgYnVmZmVyW3ArK10sIGJ1ZmZlcltwKytdKVxyXG4gICAgICAgIGJvZHkuc2V0UG9zaXRpb24odmVjKVxyXG4gICAgICAgIHArK1xyXG4gICAgICAgIHF1YXQuc2V0KGJ1ZmZlcltwKytdLCBidWZmZXJbcCsrXSwgYnVmZmVyW3ArK10sIGJ1ZmZlcltwKytdKVxyXG4gICAgICAgIGJvZHkuc2V0UXVhdGVybmlvbihxdWF0KVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGJ1ZmZlcltwKytdID0gYm9keS5wb3MueFxyXG4gICAgICAgIGJ1ZmZlcltwKytdID0gYm9keS5wb3MueVxyXG4gICAgICAgIGJ1ZmZlcltwKytdID0gYm9keS5wb3MuelxyXG4gICAgICAgIHArK1xyXG4gICAgICAgIGJ1ZmZlcltwKytdID0gYm9keS5xdWF0ZXJuaW9uLnhcclxuICAgICAgICBidWZmZXJbcCsrXSA9IGJvZHkucXVhdGVybmlvbi55XHJcbiAgICAgICAgYnVmZmVyW3ArK10gPSBib2R5LnF1YXRlcm5pb24uelxyXG4gICAgICAgIGJ1ZmZlcltwKytdID0gYm9keS5xdWF0ZXJuaW9uLndcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcG9zdE1lc3NhZ2UoYnVmZmVyLCBbYnVmZmVyLmJ1ZmZlcl0pXHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiB3b3JsZENvbW1hbmQocGFyYW1zKSB7XHJcbiAgaWYgKHR5cGVvZiBwYXJhbXNbMF0gPT09IFwibnVtYmVyXCIpIHtcclxuICAgIHBhcmFtcy5zaGlmdCgpXHJcbiAgfVxyXG4gIHN3aXRjaCAocGFyYW1zLnNoaWZ0KCkpIHtcclxuICAgIGNhc2UgXCJib2R5XCI6XHJcbiAgICAgIGJvZHlDb21tYW5kKHBhcmFtcylcclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgXCJncmF2aXR5XCI6XHJcbiAgICAgIHdvcmxkLmdyYXZpdHkuY29weShwYXJhbXNbMF0pXHJcbiAgICAgIGJyZWFrXHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBib2R5Q29tbWFuZChwYXJhbXMpIHtcclxuICBsZXQgaWQgPSBwYXJhbXMuc2hpZnQoKVxyXG4gIGxldCBib2R5ID0gYm9kaWVzW2lkXVxyXG4gIHN3aXRjaCAocGFyYW1zLnNoaWZ0KCkpIHtcclxuICAgIGNhc2UgXCJjcmVhdGVcIjpcclxuICAgICAgY29uc29sZS5sb2cocGFyYW1zKVxyXG4gICAgICBib2RpZXNbaWRdID0gYm9keSA9IHdvcmxkLmFkZCh7XHJcbiAgICAgICAgbW92ZTogcGFyYW1zWzBdLnR5cGUgPT09IFwiZHluYW1pY1wiLFxyXG4gICAgICAgIGtpbmVtYXRpYzogcGFyYW1zWzBdLnR5cGUgPT09IFwia2luZW1hdGljXCIsXHJcbiAgICAgIH0pXHJcbiAgICAgIGJvZHkucmVzZXRRdWF0ZXJuaW9uKHBhcmFtc1swXS5xdWF0ZXJuaW9uKVxyXG4gICAgICBib2R5LnJlc2V0UG9zaXRpb24ocGFyYW1zWzBdLnBvc2l0aW9uLngsIHBhcmFtc1swXS5wb3NpdGlvbi55LCBwYXJhbXNbMF0ucG9zaXRpb24ueilcclxuICAgICAgYm9keS5fbWlkXyA9IHBhcmFtc1swXS5taWRcclxuICAgICAgaWYgKGJvZHkuX21pZF8gIT09IG51bGwpXHJcbiAgICAgICAgbW92aW5nQm9kaWVzW2JvZHkuX21pZF9dID0gYm9keVxyXG4gICAgICBicmVha1xyXG4gICAgY2FzZSBcInJlbW92ZVwiOlxyXG4gICAgICB3b3JsZC5yZW1vdmVSaWdpZEJvZHkoYm9keSlcclxuICAgICAgYm9kaWVzW2lkXSA9IG51bGxcclxuICAgICAgaWYgKGJvZHkuX21pZF8gIT09IG51bGwpXHJcbiAgICAgICAgbW92aW5nQm9kaWVzW2JvZHkuX21pZF9dID0gbnVsbFxyXG4gICAgICBicmVha1xyXG4gICAgY2FzZSBcInBvc2l0aW9uXCI6XHJcbiAgICAgIGJvZHkucG9zaXRpb24uY29weShwYXJhbXNbMF0pXHJcbiAgICAgIGJyZWFrXHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBwYXJzZUNvbW1hbmQoY21kKSB7XHJcbiAgbGV0IHdvcmRzID0gY21kLnNwbGl0KFwiIFwiKVxyXG4gIGxldCBhcmdzID0gW11cclxuICBmb3IgKGxldCB3b3JkIG9mIHdvcmRzKSB7XHJcbiAgICBpZiAod29yZCkge1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGFyZ3MucHVzaChKU09OLnBhcnNlKHdvcmQpKVxyXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgIGlmICh3b3JkICE9PSBcIj1cIilcclxuICAgICAgICAgIGFyZ3MucHVzaCh3b3JkKVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiBhcmdzXHJcbn1cclxuXHJcbmluaXQoKSJdfQ==
