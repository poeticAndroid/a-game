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
        nextStep = now
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
      body.resetPosition(params[0])
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
      body.addShape(body._shapes_[id] = shape)
      break
    case "remove":
      body.removeShape(shape)
      body._shapes_[id] = null
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvbGlicy9vaW1vLmpzIiwic3JjL29pbW9Xb3JrZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQzErWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIoZnVuY3Rpb24gKGdsb2JhbCwgZmFjdG9yeSkge1xuICB0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgPyBmYWN0b3J5KGV4cG9ydHMpIDpcbiAgICB0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgPyBkZWZpbmUoWydleHBvcnRzJ10sIGZhY3RvcnkpIDpcbiAgICAgIChnbG9iYWwgPSBnbG9iYWwgfHwgc2VsZiwgZmFjdG9yeShnbG9iYWwuT0lNTyA9IHt9KSk7XG59KHRoaXMsIGZ1bmN0aW9uIChleHBvcnRzKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICAvLyBQb2x5ZmlsbHNcblxuICBpZiAoTnVtYmVyLkVQU0lMT04gPT09IHVuZGVmaW5lZCkge1xuXG4gICAgTnVtYmVyLkVQU0lMT04gPSBNYXRoLnBvdygyLCAtIDUyKTtcblxuICB9XG5cbiAgLy9cblxuICBpZiAoTWF0aC5zaWduID09PSB1bmRlZmluZWQpIHtcblxuICAgIC8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL01hdGgvc2lnblxuXG4gICAgTWF0aC5zaWduID0gZnVuY3Rpb24gKHgpIHtcblxuICAgICAgcmV0dXJuICh4IDwgMCkgPyAtIDEgOiAoeCA+IDApID8gMSA6ICsgeDtcblxuICAgIH07XG5cbiAgfVxuXG4gIGlmIChGdW5jdGlvbi5wcm90b3R5cGUubmFtZSA9PT0gdW5kZWZpbmVkKSB7XG5cbiAgICAvLyBNaXNzaW5nIGluIElFOS0xMS5cbiAgICAvLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9GdW5jdGlvbi9uYW1lXG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRnVuY3Rpb24ucHJvdG90eXBlLCAnbmFtZScsIHtcblxuICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMudG9TdHJpbmcoKS5tYXRjaCgvXlxccypmdW5jdGlvblxccyooW15cXChcXHNdKikvKVsxXTtcblxuICAgICAgfVxuXG4gICAgfSk7XG5cbiAgfVxuXG4gIGlmIChPYmplY3QuYXNzaWduID09PSB1bmRlZmluZWQpIHtcblxuICAgIC8vIE1pc3NpbmcgaW4gSUUuXG4gICAgLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvT2JqZWN0L2Fzc2lnblxuXG4gICAgKGZ1bmN0aW9uICgpIHtcblxuICAgICAgT2JqZWN0LmFzc2lnbiA9IGZ1bmN0aW9uICh0YXJnZXQpIHtcblxuICAgICAgICBpZiAodGFyZ2V0ID09PSB1bmRlZmluZWQgfHwgdGFyZ2V0ID09PSBudWxsKSB7XG5cbiAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY29udmVydCB1bmRlZmluZWQgb3IgbnVsbCB0byBvYmplY3QnKTtcblxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIG91dHB1dCA9IE9iamVjdCh0YXJnZXQpO1xuXG4gICAgICAgIGZvciAodmFyIGluZGV4ID0gMTsgaW5kZXggPCBhcmd1bWVudHMubGVuZ3RoOyBpbmRleCsrKSB7XG5cbiAgICAgICAgICB2YXIgc291cmNlID0gYXJndW1lbnRzW2luZGV4XTtcblxuICAgICAgICAgIGlmIChzb3VyY2UgIT09IHVuZGVmaW5lZCAmJiBzb3VyY2UgIT09IG51bGwpIHtcblxuICAgICAgICAgICAgZm9yICh2YXIgbmV4dEtleSBpbiBzb3VyY2UpIHtcblxuICAgICAgICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwgbmV4dEtleSkpIHtcblxuICAgICAgICAgICAgICAgIG91dHB1dFtuZXh0S2V5XSA9IHNvdXJjZVtuZXh0S2V5XTtcblxuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG91dHB1dDtcblxuICAgICAgfTtcblxuICAgIH0pKCk7XG5cbiAgfVxuXG4gIC8qXG4gICAqIEEgbGlzdCBvZiBjb25zdGFudHMgYnVpbHQtaW4gZm9yXG4gICAqIHRoZSBwaHlzaWNzIGVuZ2luZS5cbiAgICovXG5cbiAgdmFyIFJFVklTSU9OID0gJzEuMC45JztcblxuICAvLyBCcm9hZFBoYXNlXG4gIHZhciBCUl9OVUxMID0gMDtcbiAgdmFyIEJSX0JSVVRFX0ZPUkNFID0gMTtcbiAgdmFyIEJSX1NXRUVQX0FORF9QUlVORSA9IDI7XG4gIHZhciBCUl9CT1VORElOR19WT0xVTUVfVFJFRSA9IDM7XG5cbiAgLy8gQm9keSB0eXBlXG4gIHZhciBCT0RZX05VTEwgPSAwO1xuICB2YXIgQk9EWV9EWU5BTUlDID0gMTtcbiAgdmFyIEJPRFlfU1RBVElDID0gMjtcbiAgdmFyIEJPRFlfS0lORU1BVElDID0gMztcbiAgdmFyIEJPRFlfR0hPU1QgPSA0O1xuXG4gIC8vIFNoYXBlIHR5cGVcbiAgdmFyIFNIQVBFX05VTEwgPSAwO1xuICB2YXIgU0hBUEVfU1BIRVJFID0gMTtcbiAgdmFyIFNIQVBFX0JPWCA9IDI7XG4gIHZhciBTSEFQRV9DWUxJTkRFUiA9IDM7XG4gIHZhciBTSEFQRV9QTEFORSA9IDQ7XG4gIHZhciBTSEFQRV9QQVJUSUNMRSA9IDU7XG4gIHZhciBTSEFQRV9URVRSQSA9IDY7XG5cbiAgLy8gSm9pbnQgdHlwZVxuICB2YXIgSk9JTlRfTlVMTCA9IDA7XG4gIHZhciBKT0lOVF9ESVNUQU5DRSA9IDE7XG4gIHZhciBKT0lOVF9CQUxMX0FORF9TT0NLRVQgPSAyO1xuICB2YXIgSk9JTlRfSElOR0UgPSAzO1xuICB2YXIgSk9JTlRfV0hFRUwgPSA0O1xuICB2YXIgSk9JTlRfU0xJREVSID0gNTtcbiAgdmFyIEpPSU5UX1BSSVNNQVRJQyA9IDY7XG5cbiAgLy8gQUFCQiBhcHJveGltYXRpb25cbiAgdmFyIEFBQkJfUFJPWCA9IDAuMDA1O1xuXG4gIHZhciBfTWF0aCA9IHtcblxuICAgIHNxcnQ6IE1hdGguc3FydCxcbiAgICBhYnM6IE1hdGguYWJzLFxuICAgIGZsb29yOiBNYXRoLmZsb29yLFxuICAgIGNvczogTWF0aC5jb3MsXG4gICAgc2luOiBNYXRoLnNpbixcbiAgICBhY29zOiBNYXRoLmFjb3MsXG4gICAgYXNpbjogTWF0aC5hc2luLFxuICAgIGF0YW4yOiBNYXRoLmF0YW4yLFxuICAgIHJvdW5kOiBNYXRoLnJvdW5kLFxuICAgIHBvdzogTWF0aC5wb3csXG4gICAgbWF4OiBNYXRoLm1heCxcbiAgICBtaW46IE1hdGgubWluLFxuICAgIHJhbmRvbTogTWF0aC5yYW5kb20sXG5cbiAgICBkZWd0b3JhZDogMC4wMTc0NTMyOTI1MTk5NDMyOTU3LFxuICAgIHJhZHRvZGVnOiA1Ny4yOTU3Nzk1MTMwODIzMjA4NzYsXG4gICAgUEk6IDMuMTQxNTkyNjUzNTg5NzkzLFxuICAgIFR3b1BJOiA2LjI4MzE4NTMwNzE3OTU4NixcbiAgICBQSTkwOiAxLjU3MDc5NjMyNjc5NDg5NixcbiAgICBQSTI3MDogNC43MTIzODg5ODAzODQ2ODksXG5cbiAgICBJTkY6IEluZmluaXR5LFxuICAgIEVQWjogMC4wMDAwMSxcbiAgICBFUFoyOiAwLjAwMDAwMSxcblxuICAgIGxlcnA6IGZ1bmN0aW9uICh4LCB5LCB0KSB7XG5cbiAgICAgIHJldHVybiAoMSAtIHQpICogeCArIHQgKiB5O1xuXG4gICAgfSxcblxuICAgIHJhbmRJbnQ6IGZ1bmN0aW9uIChsb3csIGhpZ2gpIHtcblxuICAgICAgcmV0dXJuIGxvdyArIF9NYXRoLmZsb29yKF9NYXRoLnJhbmRvbSgpICogKGhpZ2ggLSBsb3cgKyAxKSk7XG5cbiAgICB9LFxuXG4gICAgcmFuZDogZnVuY3Rpb24gKGxvdywgaGlnaCkge1xuXG4gICAgICByZXR1cm4gbG93ICsgX01hdGgucmFuZG9tKCkgKiAoaGlnaCAtIGxvdyk7XG5cbiAgICB9LFxuXG4gICAgZ2VuZXJhdGVVVUlEOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIC8vIGh0dHA6Ly93d3cuYnJvb2ZhLmNvbS9Ub29scy9NYXRoLnV1aWQuaHRtXG5cbiAgICAgIHZhciBjaGFycyA9ICcwMTIzNDU2Nzg5QUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5eicuc3BsaXQoJycpO1xuICAgICAgdmFyIHV1aWQgPSBuZXcgQXJyYXkoMzYpO1xuICAgICAgdmFyIHJuZCA9IDAsIHI7XG5cbiAgICAgIHJldHVybiBmdW5jdGlvbiBnZW5lcmF0ZVVVSUQoKSB7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCAzNjsgaSsrKSB7XG5cbiAgICAgICAgICBpZiAoaSA9PT0gOCB8fCBpID09PSAxMyB8fCBpID09PSAxOCB8fCBpID09PSAyMykge1xuXG4gICAgICAgICAgICB1dWlkW2ldID0gJy0nO1xuXG4gICAgICAgICAgfSBlbHNlIGlmIChpID09PSAxNCkge1xuXG4gICAgICAgICAgICB1dWlkW2ldID0gJzQnO1xuXG4gICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgaWYgKHJuZCA8PSAweDAyKSBybmQgPSAweDIwMDAwMDAgKyAoTWF0aC5yYW5kb20oKSAqIDB4MTAwMDAwMCkgfCAwO1xuICAgICAgICAgICAgciA9IHJuZCAmIDB4ZjtcbiAgICAgICAgICAgIHJuZCA9IHJuZCA+PiA0O1xuICAgICAgICAgICAgdXVpZFtpXSA9IGNoYXJzWyhpID09PSAxOSkgPyAociAmIDB4MykgfCAweDggOiByXTtcblxuICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHV1aWQuam9pbignJyk7XG5cbiAgICAgIH07XG5cbiAgICB9KCksXG5cbiAgICBpbnQ6IGZ1bmN0aW9uICh4KSB7XG5cbiAgICAgIHJldHVybiBfTWF0aC5mbG9vcih4KTtcblxuICAgIH0sXG5cbiAgICBmaXg6IGZ1bmN0aW9uICh4LCBuKSB7XG5cbiAgICAgIHJldHVybiB4LnRvRml4ZWQobiB8fCAzLCAxMCk7XG5cbiAgICB9LFxuXG4gICAgY2xhbXA6IGZ1bmN0aW9uICh2YWx1ZSwgbWluLCBtYXgpIHtcblxuICAgICAgcmV0dXJuIF9NYXRoLm1heChtaW4sIF9NYXRoLm1pbihtYXgsIHZhbHVlKSk7XG5cbiAgICB9LFxuXG4gICAgLy9jbGFtcDogZnVuY3Rpb24gKCB4LCBhLCBiICkgeyByZXR1cm4gKCB4IDwgYSApID8gYSA6ICggKCB4ID4gYiApID8gYiA6IHggKTsgfSxcblxuXG5cbiAgICBkaXN0YW5jZTogZnVuY3Rpb24gKHAxLCBwMikge1xuXG4gICAgICB2YXIgeGQgPSBwMlswXSAtIHAxWzBdO1xuICAgICAgdmFyIHlkID0gcDJbMV0gLSBwMVsxXTtcbiAgICAgIHZhciB6ZCA9IHAyWzJdIC0gcDFbMl07XG4gICAgICByZXR1cm4gX01hdGguc3FydCh4ZCAqIHhkICsgeWQgKiB5ZCArIHpkICogemQpO1xuXG4gICAgfSxcblxuICAgIC8qdW53cmFwRGVncmVlczogZnVuY3Rpb24gKCByICkge1xuXG4gICAgICAgIHIgPSByICUgMzYwO1xuICAgICAgICBpZiAociA+IDE4MCkgciAtPSAzNjA7XG4gICAgICAgIGlmIChyIDwgLTE4MCkgciArPSAzNjA7XG4gICAgICAgIHJldHVybiByO1xuXG4gICAgfSxcblxuICAgIHVud3JhcFJhZGlhbjogZnVuY3Rpb24oIHIgKXtcblxuICAgICAgICByID0gciAlIF9NYXRoLlR3b1BJO1xuICAgICAgICBpZiAociA+IF9NYXRoLlBJKSByIC09IF9NYXRoLlR3b1BJO1xuICAgICAgICBpZiAociA8IC1fTWF0aC5QSSkgciArPSBfTWF0aC5Ud29QSTtcbiAgICAgICAgcmV0dXJuIHI7XG5cbiAgICB9LCovXG5cbiAgICBhY29zQ2xhbXA6IGZ1bmN0aW9uIChjb3MpIHtcblxuICAgICAgaWYgKGNvcyA+IDEpIHJldHVybiAwO1xuICAgICAgZWxzZSBpZiAoY29zIDwgLTEpIHJldHVybiBfTWF0aC5QSTtcbiAgICAgIGVsc2UgcmV0dXJuIF9NYXRoLmFjb3MoY29zKTtcblxuICAgIH0sXG5cbiAgICBkaXN0YW5jZVZlY3RvcjogZnVuY3Rpb24gKHYxLCB2Mikge1xuXG4gICAgICB2YXIgeGQgPSB2MS54IC0gdjIueDtcbiAgICAgIHZhciB5ZCA9IHYxLnkgLSB2Mi55O1xuICAgICAgdmFyIHpkID0gdjEueiAtIHYyLno7XG4gICAgICByZXR1cm4geGQgKiB4ZCArIHlkICogeWQgKyB6ZCAqIHpkO1xuXG4gICAgfSxcblxuICAgIGRvdFZlY3RvcnM6IGZ1bmN0aW9uIChhLCBiKSB7XG5cbiAgICAgIHJldHVybiBhLnggKiBiLnggKyBhLnkgKiBiLnkgKyBhLnogKiBiLno7XG5cbiAgICB9LFxuXG4gIH07XG5cbiAgZnVuY3Rpb24gcHJpbnRFcnJvcihjbGF6eiwgbXNnKSB7XG4gICAgY29uc29sZS5lcnJvcihcIltPSU1PXSBcIiArIGNsYXp6ICsgXCI6IFwiICsgbXNnKTtcbiAgfVxuXG4gIC8vIEEgcGVyZm9ybWFuY2UgZXZhbHVhdG9yXG5cbiAgZnVuY3Rpb24gSW5mb0Rpc3BsYXkod29ybGQpIHtcblxuICAgIHRoaXMucGFyZW50ID0gd29ybGQ7XG5cbiAgICB0aGlzLmluZm9zID0gbmV3IEZsb2F0MzJBcnJheSgxMyk7XG4gICAgdGhpcy5mID0gWzAsIDAsIDBdO1xuXG4gICAgdGhpcy50aW1lcyA9IFswLCAwLCAwLCAwXTtcblxuICAgIHRoaXMuYnJvYWRQaGFzZSA9IHRoaXMucGFyZW50LmJyb2FkUGhhc2VUeXBlO1xuXG4gICAgdGhpcy52ZXJzaW9uID0gUkVWSVNJT047XG5cbiAgICB0aGlzLmZwcyA9IDA7XG5cbiAgICB0aGlzLnR0ID0gMDtcblxuICAgIHRoaXMuYnJvYWRQaGFzZVRpbWUgPSAwO1xuICAgIHRoaXMubmFycm93UGhhc2VUaW1lID0gMDtcbiAgICB0aGlzLnNvbHZpbmdUaW1lID0gMDtcbiAgICB0aGlzLnRvdGFsVGltZSA9IDA7XG4gICAgdGhpcy51cGRhdGVUaW1lID0gMDtcblxuICAgIHRoaXMuTWF4QnJvYWRQaGFzZVRpbWUgPSAwO1xuICAgIHRoaXMuTWF4TmFycm93UGhhc2VUaW1lID0gMDtcbiAgICB0aGlzLk1heFNvbHZpbmdUaW1lID0gMDtcbiAgICB0aGlzLk1heFRvdGFsVGltZSA9IDA7XG4gICAgdGhpcy5NYXhVcGRhdGVUaW1lID0gMDtcbiAgfVxuICBPYmplY3QuYXNzaWduKEluZm9EaXNwbGF5LnByb3RvdHlwZSwge1xuXG4gICAgc2V0VGltZTogZnVuY3Rpb24gKG4pIHtcbiAgICAgIHRoaXMudGltZXNbbiB8fCAwXSA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgIH0sXG5cbiAgICByZXNldE1heDogZnVuY3Rpb24gKCkge1xuXG4gICAgICB0aGlzLk1heEJyb2FkUGhhc2VUaW1lID0gMDtcbiAgICAgIHRoaXMuTWF4TmFycm93UGhhc2VUaW1lID0gMDtcbiAgICAgIHRoaXMuTWF4U29sdmluZ1RpbWUgPSAwO1xuICAgICAgdGhpcy5NYXhUb3RhbFRpbWUgPSAwO1xuICAgICAgdGhpcy5NYXhVcGRhdGVUaW1lID0gMDtcblxuICAgIH0sXG5cbiAgICBjYWxjQnJvYWRQaGFzZTogZnVuY3Rpb24gKCkge1xuXG4gICAgICB0aGlzLnNldFRpbWUoMik7XG4gICAgICB0aGlzLmJyb2FkUGhhc2VUaW1lID0gdGhpcy50aW1lc1syXSAtIHRoaXMudGltZXNbMV07XG5cbiAgICB9LFxuXG4gICAgY2FsY05hcnJvd1BoYXNlOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHRoaXMuc2V0VGltZSgzKTtcbiAgICAgIHRoaXMubmFycm93UGhhc2VUaW1lID0gdGhpcy50aW1lc1szXSAtIHRoaXMudGltZXNbMl07XG5cbiAgICB9LFxuXG4gICAgY2FsY0VuZDogZnVuY3Rpb24gKCkge1xuXG4gICAgICB0aGlzLnNldFRpbWUoMik7XG4gICAgICB0aGlzLnNvbHZpbmdUaW1lID0gdGhpcy50aW1lc1syXSAtIHRoaXMudGltZXNbMV07XG4gICAgICB0aGlzLnRvdGFsVGltZSA9IHRoaXMudGltZXNbMl0gLSB0aGlzLnRpbWVzWzBdO1xuICAgICAgdGhpcy51cGRhdGVUaW1lID0gdGhpcy50b3RhbFRpbWUgLSAodGhpcy5icm9hZFBoYXNlVGltZSArIHRoaXMubmFycm93UGhhc2VUaW1lICsgdGhpcy5zb2x2aW5nVGltZSk7XG5cbiAgICAgIGlmICh0aGlzLnR0ID09PSAxMDApIHRoaXMucmVzZXRNYXgoKTtcblxuICAgICAgaWYgKHRoaXMudHQgPiAxMDApIHtcbiAgICAgICAgaWYgKHRoaXMuYnJvYWRQaGFzZVRpbWUgPiB0aGlzLk1heEJyb2FkUGhhc2VUaW1lKSB0aGlzLk1heEJyb2FkUGhhc2VUaW1lID0gdGhpcy5icm9hZFBoYXNlVGltZTtcbiAgICAgICAgaWYgKHRoaXMubmFycm93UGhhc2VUaW1lID4gdGhpcy5NYXhOYXJyb3dQaGFzZVRpbWUpIHRoaXMuTWF4TmFycm93UGhhc2VUaW1lID0gdGhpcy5uYXJyb3dQaGFzZVRpbWU7XG4gICAgICAgIGlmICh0aGlzLnNvbHZpbmdUaW1lID4gdGhpcy5NYXhTb2x2aW5nVGltZSkgdGhpcy5NYXhTb2x2aW5nVGltZSA9IHRoaXMuc29sdmluZ1RpbWU7XG4gICAgICAgIGlmICh0aGlzLnRvdGFsVGltZSA+IHRoaXMuTWF4VG90YWxUaW1lKSB0aGlzLk1heFRvdGFsVGltZSA9IHRoaXMudG90YWxUaW1lO1xuICAgICAgICBpZiAodGhpcy51cGRhdGVUaW1lID4gdGhpcy5NYXhVcGRhdGVUaW1lKSB0aGlzLk1heFVwZGF0ZVRpbWUgPSB0aGlzLnVwZGF0ZVRpbWU7XG4gICAgICB9XG5cblxuICAgICAgdGhpcy51cGZwcygpO1xuXG4gICAgICB0aGlzLnR0Kys7XG4gICAgICBpZiAodGhpcy50dCA+IDUwMCkgdGhpcy50dCA9IDA7XG5cbiAgICB9LFxuXG5cbiAgICB1cGZwczogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5mWzFdID0gRGF0ZS5ub3coKTtcbiAgICAgIGlmICh0aGlzLmZbMV0gLSAxMDAwID4gdGhpcy5mWzBdKSB7IHRoaXMuZlswXSA9IHRoaXMuZlsxXTsgdGhpcy5mcHMgPSB0aGlzLmZbMl07IHRoaXMuZlsyXSA9IDA7IH0gdGhpcy5mWzJdKys7XG4gICAgfSxcblxuICAgIHNob3c6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBpbmZvID0gW1xuICAgICAgICBcIk9pbW8uanMgXCIgKyB0aGlzLnZlcnNpb24gKyBcIjxicj5cIixcbiAgICAgICAgdGhpcy5icm9hZFBoYXNlICsgXCI8YnI+PGJyPlwiLFxuICAgICAgICBcIkZQUzogXCIgKyB0aGlzLmZwcyArIFwiIGZwczxicj48YnI+XCIsXG4gICAgICAgIFwicmlnaWRib2R5IFwiICsgdGhpcy5wYXJlbnQubnVtUmlnaWRCb2RpZXMgKyBcIjxicj5cIixcbiAgICAgICAgXCJjb250YWN0ICZuYnNwOyZuYnNwO1wiICsgdGhpcy5wYXJlbnQubnVtQ29udGFjdHMgKyBcIjxicj5cIixcbiAgICAgICAgXCJjdC1wb2ludCAmbmJzcDtcIiArIHRoaXMucGFyZW50Lm51bUNvbnRhY3RQb2ludHMgKyBcIjxicj5cIixcbiAgICAgICAgXCJwYWlyY2hlY2sgXCIgKyB0aGlzLnBhcmVudC5icm9hZFBoYXNlLm51bVBhaXJDaGVja3MgKyBcIjxicj5cIixcbiAgICAgICAgXCJpc2xhbmQgJm5ic3A7Jm5ic3A7Jm5ic3A7XCIgKyB0aGlzLnBhcmVudC5udW1Jc2xhbmRzICsgXCI8YnI+PGJyPlwiLFxuICAgICAgICBcIlRpbWUgaW4gbWlsbGlzZWNvbmRzPGJyPjxicj5cIixcbiAgICAgICAgXCJicm9hZHBoYXNlICZuYnNwO1wiICsgX01hdGguZml4KHRoaXMuYnJvYWRQaGFzZVRpbWUpICsgXCIgfCBcIiArIF9NYXRoLmZpeCh0aGlzLk1heEJyb2FkUGhhc2VUaW1lKSArIFwiPGJyPlwiLFxuICAgICAgICBcIm5hcnJvd3BoYXNlIFwiICsgX01hdGguZml4KHRoaXMubmFycm93UGhhc2VUaW1lKSArIFwiIHwgXCIgKyBfTWF0aC5maXgodGhpcy5NYXhOYXJyb3dQaGFzZVRpbWUpICsgXCI8YnI+XCIsXG4gICAgICAgIFwic29sdmluZyAmbmJzcDsmbmJzcDsmbmJzcDsmbmJzcDtcIiArIF9NYXRoLmZpeCh0aGlzLnNvbHZpbmdUaW1lKSArIFwiIHwgXCIgKyBfTWF0aC5maXgodGhpcy5NYXhTb2x2aW5nVGltZSkgKyBcIjxicj5cIixcbiAgICAgICAgXCJ0b3RhbCAmbmJzcDsmbmJzcDsmbmJzcDsmbmJzcDsmbmJzcDsmbmJzcDtcIiArIF9NYXRoLmZpeCh0aGlzLnRvdGFsVGltZSkgKyBcIiB8IFwiICsgX01hdGguZml4KHRoaXMuTWF4VG90YWxUaW1lKSArIFwiPGJyPlwiLFxuICAgICAgICBcInVwZGF0aW5nICZuYnNwOyZuYnNwOyZuYnNwO1wiICsgX01hdGguZml4KHRoaXMudXBkYXRlVGltZSkgKyBcIiB8IFwiICsgX01hdGguZml4KHRoaXMuTWF4VXBkYXRlVGltZSkgKyBcIjxicj5cIlxuICAgICAgXS5qb2luKFwiXFxuXCIpO1xuICAgICAgcmV0dXJuIGluZm87XG4gICAgfSxcblxuICAgIHRvQXJyYXk6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuaW5mb3NbMF0gPSB0aGlzLnBhcmVudC5icm9hZFBoYXNlLnR5cGVzO1xuICAgICAgdGhpcy5pbmZvc1sxXSA9IHRoaXMucGFyZW50Lm51bVJpZ2lkQm9kaWVzO1xuICAgICAgdGhpcy5pbmZvc1syXSA9IHRoaXMucGFyZW50Lm51bUNvbnRhY3RzO1xuICAgICAgdGhpcy5pbmZvc1szXSA9IHRoaXMucGFyZW50LmJyb2FkUGhhc2UubnVtUGFpckNoZWNrcztcbiAgICAgIHRoaXMuaW5mb3NbNF0gPSB0aGlzLnBhcmVudC5udW1Db250YWN0UG9pbnRzO1xuICAgICAgdGhpcy5pbmZvc1s1XSA9IHRoaXMucGFyZW50Lm51bUlzbGFuZHM7XG4gICAgICB0aGlzLmluZm9zWzZdID0gdGhpcy5icm9hZFBoYXNlVGltZTtcbiAgICAgIHRoaXMuaW5mb3NbN10gPSB0aGlzLm5hcnJvd1BoYXNlVGltZTtcbiAgICAgIHRoaXMuaW5mb3NbOF0gPSB0aGlzLnNvbHZpbmdUaW1lO1xuICAgICAgdGhpcy5pbmZvc1s5XSA9IHRoaXMudXBkYXRlVGltZTtcbiAgICAgIHRoaXMuaW5mb3NbMTBdID0gdGhpcy50b3RhbFRpbWU7XG4gICAgICB0aGlzLmluZm9zWzExXSA9IHRoaXMuZnBzO1xuICAgICAgcmV0dXJuIHRoaXMuaW5mb3M7XG4gICAgfVxuXG4gIH0pO1xuXG4gIGZ1bmN0aW9uIFZlYzMoeCwgeSwgeikge1xuXG4gICAgdGhpcy54ID0geCB8fCAwO1xuICAgIHRoaXMueSA9IHkgfHwgMDtcbiAgICB0aGlzLnogPSB6IHx8IDA7XG5cbiAgfVxuXG4gIE9iamVjdC5hc3NpZ24oVmVjMy5wcm90b3R5cGUsIHtcblxuICAgIFZlYzM6IHRydWUsXG5cbiAgICBzZXQ6IGZ1bmN0aW9uICh4LCB5LCB6KSB7XG5cbiAgICAgIHRoaXMueCA9IHg7XG4gICAgICB0aGlzLnkgPSB5O1xuICAgICAgdGhpcy56ID0gejtcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfSxcblxuICAgIGFkZDogZnVuY3Rpb24gKGEsIGIpIHtcblxuICAgICAgaWYgKGIgIT09IHVuZGVmaW5lZCkgcmV0dXJuIHRoaXMuYWRkVmVjdG9ycyhhLCBiKTtcblxuICAgICAgdGhpcy54ICs9IGEueDtcbiAgICAgIHRoaXMueSArPSBhLnk7XG4gICAgICB0aGlzLnogKz0gYS56O1xuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICB9LFxuXG4gICAgYWRkVmVjdG9yczogZnVuY3Rpb24gKGEsIGIpIHtcblxuICAgICAgdGhpcy54ID0gYS54ICsgYi54O1xuICAgICAgdGhpcy55ID0gYS55ICsgYi55O1xuICAgICAgdGhpcy56ID0gYS56ICsgYi56O1xuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICB9LFxuXG4gICAgYWRkRXF1YWw6IGZ1bmN0aW9uICh2KSB7XG5cbiAgICAgIHRoaXMueCArPSB2Lng7XG4gICAgICB0aGlzLnkgKz0gdi55O1xuICAgICAgdGhpcy56ICs9IHYuejtcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfSxcblxuICAgIHN1YjogZnVuY3Rpb24gKGEsIGIpIHtcblxuICAgICAgaWYgKGIgIT09IHVuZGVmaW5lZCkgcmV0dXJuIHRoaXMuc3ViVmVjdG9ycyhhLCBiKTtcblxuICAgICAgdGhpcy54IC09IGEueDtcbiAgICAgIHRoaXMueSAtPSBhLnk7XG4gICAgICB0aGlzLnogLT0gYS56O1xuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICB9LFxuXG4gICAgc3ViVmVjdG9yczogZnVuY3Rpb24gKGEsIGIpIHtcblxuICAgICAgdGhpcy54ID0gYS54IC0gYi54O1xuICAgICAgdGhpcy55ID0gYS55IC0gYi55O1xuICAgICAgdGhpcy56ID0gYS56IC0gYi56O1xuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICB9LFxuXG4gICAgc3ViRXF1YWw6IGZ1bmN0aW9uICh2KSB7XG5cbiAgICAgIHRoaXMueCAtPSB2Lng7XG4gICAgICB0aGlzLnkgLT0gdi55O1xuICAgICAgdGhpcy56IC09IHYuejtcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfSxcblxuICAgIHNjYWxlOiBmdW5jdGlvbiAodiwgcykge1xuXG4gICAgICB0aGlzLnggPSB2LnggKiBzO1xuICAgICAgdGhpcy55ID0gdi55ICogcztcbiAgICAgIHRoaXMueiA9IHYueiAqIHM7XG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIH0sXG5cbiAgICBzY2FsZUVxdWFsOiBmdW5jdGlvbiAocykge1xuXG4gICAgICB0aGlzLnggKj0gcztcbiAgICAgIHRoaXMueSAqPSBzO1xuICAgICAgdGhpcy56ICo9IHM7XG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIH0sXG5cbiAgICBtdWx0aXBseTogZnVuY3Rpb24gKHYpIHtcblxuICAgICAgdGhpcy54ICo9IHYueDtcbiAgICAgIHRoaXMueSAqPSB2Lnk7XG4gICAgICB0aGlzLnogKj0gdi56O1xuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICB9LFxuXG4gICAgLypzY2FsZVY6IGZ1bmN0aW9uKCB2ICl7XG5cbiAgICAgICAgdGhpcy54ICo9IHYueDtcbiAgICAgICAgdGhpcy55ICo9IHYueTtcbiAgICAgICAgdGhpcy56ICo9IHYuejtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICB9LFxuXG4gICAgc2NhbGVWZWN0b3JFcXVhbDogZnVuY3Rpb24oIHYgKXtcblxuICAgICAgICB0aGlzLnggKj0gdi54O1xuICAgICAgICB0aGlzLnkgKj0gdi55O1xuICAgICAgICB0aGlzLnogKj0gdi56O1xuICAgICAgICByZXR1cm4gdGhpcztcblxuICAgIH0sKi9cblxuICAgIGFkZFNjYWxlZFZlY3RvcjogZnVuY3Rpb24gKHYsIHMpIHtcblxuICAgICAgdGhpcy54ICs9IHYueCAqIHM7XG4gICAgICB0aGlzLnkgKz0gdi55ICogcztcbiAgICAgIHRoaXMueiArPSB2LnogKiBzO1xuXG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIH0sXG5cbiAgICBzdWJTY2FsZWRWZWN0b3I6IGZ1bmN0aW9uICh2LCBzKSB7XG5cbiAgICAgIHRoaXMueCAtPSB2LnggKiBzO1xuICAgICAgdGhpcy55IC09IHYueSAqIHM7XG4gICAgICB0aGlzLnogLT0gdi56ICogcztcblxuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICB9LFxuXG4gICAgLyphZGRUaW1lOiBmdW5jdGlvbiAoIHYsIHQgKSB7XG5cbiAgICAgICAgdGhpcy54ICs9IHYueCAqIHQ7XG4gICAgICAgIHRoaXMueSArPSB2LnkgKiB0O1xuICAgICAgICB0aGlzLnogKz0gdi56ICogdDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICB9LFxuICAgIFxuICAgIGFkZFNjYWxlOiBmdW5jdGlvbiAoIHYsIHMgKSB7XG5cbiAgICAgICAgdGhpcy54ICs9IHYueCAqIHM7XG4gICAgICAgIHRoaXMueSArPSB2LnkgKiBzO1xuICAgICAgICB0aGlzLnogKz0gdi56ICogcztcbiAgICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICB9LFxuXG4gICAgc3ViU2NhbGU6IGZ1bmN0aW9uICggdiwgcyApIHtcblxuICAgICAgICB0aGlzLnggLT0gdi54ICogcztcbiAgICAgICAgdGhpcy55IC09IHYueSAqIHM7XG4gICAgICAgIHRoaXMueiAtPSB2LnogKiBzO1xuICAgICAgICByZXR1cm4gdGhpcztcblxuICAgIH0sKi9cblxuICAgIGNyb3NzOiBmdW5jdGlvbiAoYSwgYikge1xuXG4gICAgICBpZiAoYiAhPT0gdW5kZWZpbmVkKSByZXR1cm4gdGhpcy5jcm9zc1ZlY3RvcnMoYSwgYik7XG5cbiAgICAgIHZhciB4ID0gdGhpcy54LCB5ID0gdGhpcy55LCB6ID0gdGhpcy56O1xuXG4gICAgICB0aGlzLnggPSB5ICogYS56IC0geiAqIGEueTtcbiAgICAgIHRoaXMueSA9IHogKiBhLnggLSB4ICogYS56O1xuICAgICAgdGhpcy56ID0geCAqIGEueSAtIHkgKiBhLng7XG5cbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfSxcblxuICAgIGNyb3NzVmVjdG9yczogZnVuY3Rpb24gKGEsIGIpIHtcblxuICAgICAgdmFyIGF4ID0gYS54LCBheSA9IGEueSwgYXogPSBhLno7XG4gICAgICB2YXIgYnggPSBiLngsIGJ5ID0gYi55LCBieiA9IGIuejtcblxuICAgICAgdGhpcy54ID0gYXkgKiBieiAtIGF6ICogYnk7XG4gICAgICB0aGlzLnkgPSBheiAqIGJ4IC0gYXggKiBiejtcbiAgICAgIHRoaXMueiA9IGF4ICogYnkgLSBheSAqIGJ4O1xuXG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIH0sXG5cbiAgICB0YW5nZW50OiBmdW5jdGlvbiAoYSkge1xuXG4gICAgICB2YXIgYXggPSBhLngsIGF5ID0gYS55LCBheiA9IGEuejtcblxuICAgICAgdGhpcy54ID0gYXkgKiBheCAtIGF6ICogYXo7XG4gICAgICB0aGlzLnkgPSAtIGF6ICogYXkgLSBheCAqIGF4O1xuICAgICAgdGhpcy56ID0gYXggKiBheiArIGF5ICogYXk7XG5cbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfSxcblxuXG5cblxuXG4gICAgaW52ZXJ0OiBmdW5jdGlvbiAodikge1xuXG4gICAgICB0aGlzLnggPSAtdi54O1xuICAgICAgdGhpcy55ID0gLXYueTtcbiAgICAgIHRoaXMueiA9IC12Lno7XG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIH0sXG5cbiAgICBuZWdhdGU6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgdGhpcy54ID0gLSB0aGlzLng7XG4gICAgICB0aGlzLnkgPSAtIHRoaXMueTtcbiAgICAgIHRoaXMueiA9IC0gdGhpcy56O1xuXG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIH0sXG5cbiAgICBkb3Q6IGZ1bmN0aW9uICh2KSB7XG5cbiAgICAgIHJldHVybiB0aGlzLnggKiB2LnggKyB0aGlzLnkgKiB2LnkgKyB0aGlzLnogKiB2Lno7XG5cbiAgICB9LFxuXG4gICAgYWRkaXRpb246IGZ1bmN0aW9uICgpIHtcblxuICAgICAgcmV0dXJuIHRoaXMueCArIHRoaXMueSArIHRoaXMuejtcblxuICAgIH0sXG5cbiAgICBsZW5ndGhTcTogZnVuY3Rpb24gKCkge1xuXG4gICAgICByZXR1cm4gdGhpcy54ICogdGhpcy54ICsgdGhpcy55ICogdGhpcy55ICsgdGhpcy56ICogdGhpcy56O1xuXG4gICAgfSxcblxuICAgIGxlbmd0aDogZnVuY3Rpb24gKCkge1xuXG4gICAgICByZXR1cm4gX01hdGguc3FydCh0aGlzLnggKiB0aGlzLnggKyB0aGlzLnkgKiB0aGlzLnkgKyB0aGlzLnogKiB0aGlzLnopO1xuXG4gICAgfSxcblxuICAgIGNvcHk6IGZ1bmN0aW9uICh2KSB7XG5cbiAgICAgIHRoaXMueCA9IHYueDtcbiAgICAgIHRoaXMueSA9IHYueTtcbiAgICAgIHRoaXMueiA9IHYuejtcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfSxcblxuICAgIC8qbXVsOiBmdW5jdGlvbiggYiwgYSwgbSApe1xuXG4gICAgICAgIHJldHVybiB0aGlzLm11bE1hdCggbSwgYSApLmFkZCggYiApO1xuXG4gICAgfSxcblxuICAgIG11bE1hdDogZnVuY3Rpb24oIG0sIGEgKXtcblxuICAgICAgICB2YXIgZSA9IG0uZWxlbWVudHM7XG4gICAgICAgIHZhciB4ID0gYS54LCB5ID0gYS55LCB6ID0gYS56O1xuXG4gICAgICAgIHRoaXMueCA9IGVbIDAgXSAqIHggKyBlWyAxIF0gKiB5ICsgZVsgMiBdICogejtcbiAgICAgICAgdGhpcy55ID0gZVsgMyBdICogeCArIGVbIDQgXSAqIHkgKyBlWyA1IF0gKiB6O1xuICAgICAgICB0aGlzLnogPSBlWyA2IF0gKiB4ICsgZVsgNyBdICogeSArIGVbIDggXSAqIHo7XG4gICAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfSwqL1xuXG4gICAgYXBwbHlNYXRyaXgzOiBmdW5jdGlvbiAobSwgdHJhbnNwb3NlKSB7XG5cbiAgICAgIC8vaWYoIHRyYW5zcG9zZSApIG0gPSBtLmNsb25lKCkudHJhbnNwb3NlKCk7XG4gICAgICB2YXIgeCA9IHRoaXMueCwgeSA9IHRoaXMueSwgeiA9IHRoaXMuejtcbiAgICAgIHZhciBlID0gbS5lbGVtZW50cztcblxuICAgICAgaWYgKHRyYW5zcG9zZSkge1xuXG4gICAgICAgIHRoaXMueCA9IGVbMF0gKiB4ICsgZVsxXSAqIHkgKyBlWzJdICogejtcbiAgICAgICAgdGhpcy55ID0gZVszXSAqIHggKyBlWzRdICogeSArIGVbNV0gKiB6O1xuICAgICAgICB0aGlzLnogPSBlWzZdICogeCArIGVbN10gKiB5ICsgZVs4XSAqIHo7XG5cbiAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgdGhpcy54ID0gZVswXSAqIHggKyBlWzNdICogeSArIGVbNl0gKiB6O1xuICAgICAgICB0aGlzLnkgPSBlWzFdICogeCArIGVbNF0gKiB5ICsgZVs3XSAqIHo7XG4gICAgICAgIHRoaXMueiA9IGVbMl0gKiB4ICsgZVs1XSAqIHkgKyBlWzhdICogejtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICB9LFxuXG4gICAgYXBwbHlRdWF0ZXJuaW9uOiBmdW5jdGlvbiAocSkge1xuXG4gICAgICB2YXIgeCA9IHRoaXMueDtcbiAgICAgIHZhciB5ID0gdGhpcy55O1xuICAgICAgdmFyIHogPSB0aGlzLno7XG5cbiAgICAgIHZhciBxeCA9IHEueDtcbiAgICAgIHZhciBxeSA9IHEueTtcbiAgICAgIHZhciBxeiA9IHEuejtcbiAgICAgIHZhciBxdyA9IHEudztcblxuICAgICAgLy8gY2FsY3VsYXRlIHF1YXQgKiB2ZWN0b3JcblxuICAgICAgdmFyIGl4ID0gcXcgKiB4ICsgcXkgKiB6IC0gcXogKiB5O1xuICAgICAgdmFyIGl5ID0gcXcgKiB5ICsgcXogKiB4IC0gcXggKiB6O1xuICAgICAgdmFyIGl6ID0gcXcgKiB6ICsgcXggKiB5IC0gcXkgKiB4O1xuICAgICAgdmFyIGl3ID0gLSBxeCAqIHggLSBxeSAqIHkgLSBxeiAqIHo7XG5cbiAgICAgIC8vIGNhbGN1bGF0ZSByZXN1bHQgKiBpbnZlcnNlIHF1YXRcblxuICAgICAgdGhpcy54ID0gaXggKiBxdyArIGl3ICogLSBxeCArIGl5ICogLSBxeiAtIGl6ICogLSBxeTtcbiAgICAgIHRoaXMueSA9IGl5ICogcXcgKyBpdyAqIC0gcXkgKyBpeiAqIC0gcXggLSBpeCAqIC0gcXo7XG4gICAgICB0aGlzLnogPSBpeiAqIHF3ICsgaXcgKiAtIHF6ICsgaXggKiAtIHF5IC0gaXkgKiAtIHF4O1xuXG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIH0sXG5cbiAgICB0ZXN0WmVybzogZnVuY3Rpb24gKCkge1xuXG4gICAgICBpZiAodGhpcy54ICE9PSAwIHx8IHRoaXMueSAhPT0gMCB8fCB0aGlzLnogIT09IDApIHJldHVybiB0cnVlO1xuICAgICAgZWxzZSByZXR1cm4gZmFsc2U7XG5cbiAgICB9LFxuXG4gICAgdGVzdERpZmY6IGZ1bmN0aW9uICh2KSB7XG5cbiAgICAgIHJldHVybiB0aGlzLmVxdWFscyh2KSA/IGZhbHNlIDogdHJ1ZTtcblxuICAgIH0sXG5cbiAgICBlcXVhbHM6IGZ1bmN0aW9uICh2KSB7XG5cbiAgICAgIHJldHVybiB2LnggPT09IHRoaXMueCAmJiB2LnkgPT09IHRoaXMueSAmJiB2LnogPT09IHRoaXMuejtcblxuICAgIH0sXG5cbiAgICBjbG9uZTogZnVuY3Rpb24gKCkge1xuXG4gICAgICByZXR1cm4gbmV3IHRoaXMuY29uc3RydWN0b3IodGhpcy54LCB0aGlzLnksIHRoaXMueik7XG5cbiAgICB9LFxuXG4gICAgdG9TdHJpbmc6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgcmV0dXJuIFwiVmVjM1tcIiArIHRoaXMueC50b0ZpeGVkKDQpICsgXCIsIFwiICsgdGhpcy55LnRvRml4ZWQoNCkgKyBcIiwgXCIgKyB0aGlzLnoudG9GaXhlZCg0KSArIFwiXVwiO1xuXG4gICAgfSxcblxuICAgIG11bHRpcGx5U2NhbGFyOiBmdW5jdGlvbiAoc2NhbGFyKSB7XG5cbiAgICAgIGlmIChpc0Zpbml0ZShzY2FsYXIpKSB7XG4gICAgICAgIHRoaXMueCAqPSBzY2FsYXI7XG4gICAgICAgIHRoaXMueSAqPSBzY2FsYXI7XG4gICAgICAgIHRoaXMueiAqPSBzY2FsYXI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnggPSAwO1xuICAgICAgICB0aGlzLnkgPSAwO1xuICAgICAgICB0aGlzLnogPSAwO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIH0sXG5cbiAgICBkaXZpZGVTY2FsYXI6IGZ1bmN0aW9uIChzY2FsYXIpIHtcblxuICAgICAgcmV0dXJuIHRoaXMubXVsdGlwbHlTY2FsYXIoMSAvIHNjYWxhcik7XG5cbiAgICB9LFxuXG4gICAgbm9ybWFsaXplOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHJldHVybiB0aGlzLmRpdmlkZVNjYWxhcih0aGlzLmxlbmd0aCgpKTtcblxuICAgIH0sXG5cbiAgICB0b0FycmF5OiBmdW5jdGlvbiAoYXJyYXksIG9mZnNldCkge1xuXG4gICAgICBpZiAob2Zmc2V0ID09PSB1bmRlZmluZWQpIG9mZnNldCA9IDA7XG5cbiAgICAgIGFycmF5W29mZnNldF0gPSB0aGlzLng7XG4gICAgICBhcnJheVtvZmZzZXQgKyAxXSA9IHRoaXMueTtcbiAgICAgIGFycmF5W29mZnNldCArIDJdID0gdGhpcy56O1xuXG4gICAgfSxcblxuICAgIGZyb21BcnJheTogZnVuY3Rpb24gKGFycmF5LCBvZmZzZXQpIHtcblxuICAgICAgaWYgKG9mZnNldCA9PT0gdW5kZWZpbmVkKSBvZmZzZXQgPSAwO1xuXG4gICAgICB0aGlzLnggPSBhcnJheVtvZmZzZXRdO1xuICAgICAgdGhpcy55ID0gYXJyYXlbb2Zmc2V0ICsgMV07XG4gICAgICB0aGlzLnogPSBhcnJheVtvZmZzZXQgKyAyXTtcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfSxcblxuXG4gIH0pO1xuXG4gIGZ1bmN0aW9uIFF1YXQoeCwgeSwgeiwgdykge1xuXG4gICAgdGhpcy54ID0geCB8fCAwO1xuICAgIHRoaXMueSA9IHkgfHwgMDtcbiAgICB0aGlzLnogPSB6IHx8IDA7XG4gICAgdGhpcy53ID0gKHcgIT09IHVuZGVmaW5lZCkgPyB3IDogMTtcblxuICB9XG5cbiAgT2JqZWN0LmFzc2lnbihRdWF0LnByb3RvdHlwZSwge1xuXG4gICAgUXVhdDogdHJ1ZSxcblxuICAgIHNldDogZnVuY3Rpb24gKHgsIHksIHosIHcpIHtcblxuXG4gICAgICB0aGlzLnggPSB4O1xuICAgICAgdGhpcy55ID0geTtcbiAgICAgIHRoaXMueiA9IHo7XG4gICAgICB0aGlzLncgPSB3O1xuXG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIH0sXG5cbiAgICBhZGRUaW1lOiBmdW5jdGlvbiAodiwgdCkge1xuXG4gICAgICB2YXIgYXggPSB2LngsIGF5ID0gdi55LCBheiA9IHYuejtcbiAgICAgIHZhciBxdyA9IHRoaXMudywgcXggPSB0aGlzLngsIHF5ID0gdGhpcy55LCBxeiA9IHRoaXMuejtcbiAgICAgIHQgKj0gMC41O1xuICAgICAgdGhpcy54ICs9IHQgKiAoYXggKiBxdyArIGF5ICogcXogLSBheiAqIHF5KTtcbiAgICAgIHRoaXMueSArPSB0ICogKGF5ICogcXcgKyBheiAqIHF4IC0gYXggKiBxeik7XG4gICAgICB0aGlzLnogKz0gdCAqIChheiAqIHF3ICsgYXggKiBxeSAtIGF5ICogcXgpO1xuICAgICAgdGhpcy53ICs9IHQgKiAoLWF4ICogcXggLSBheSAqIHF5IC0gYXogKiBxeik7XG4gICAgICB0aGlzLm5vcm1hbGl6ZSgpO1xuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICB9LFxuXG4gICAgLyptdWw6IGZ1bmN0aW9uKCBxMSwgcTIgKXtcblxuICAgICAgICB2YXIgYXggPSBxMS54LCBheSA9IHExLnksIGF6ID0gcTEueiwgYXMgPSBxMS53LFxuICAgICAgICBieCA9IHEyLngsIGJ5ID0gcTIueSwgYnogPSBxMi56LCBicyA9IHEyLnc7XG4gICAgICAgIHRoaXMueCA9IGF4ICogYnMgKyBhcyAqIGJ4ICsgYXkgKiBieiAtIGF6ICogYnk7XG4gICAgICAgIHRoaXMueSA9IGF5ICogYnMgKyBhcyAqIGJ5ICsgYXogKiBieCAtIGF4ICogYno7XG4gICAgICAgIHRoaXMueiA9IGF6ICogYnMgKyBhcyAqIGJ6ICsgYXggKiBieSAtIGF5ICogYng7XG4gICAgICAgIHRoaXMudyA9IGFzICogYnMgLSBheCAqIGJ4IC0gYXkgKiBieSAtIGF6ICogYno7XG4gICAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfSwqL1xuXG4gICAgbXVsdGlwbHk6IGZ1bmN0aW9uIChxLCBwKSB7XG5cbiAgICAgIGlmIChwICE9PSB1bmRlZmluZWQpIHJldHVybiB0aGlzLm11bHRpcGx5UXVhdGVybmlvbnMocSwgcCk7XG4gICAgICByZXR1cm4gdGhpcy5tdWx0aXBseVF1YXRlcm5pb25zKHRoaXMsIHEpO1xuXG4gICAgfSxcblxuICAgIG11bHRpcGx5UXVhdGVybmlvbnM6IGZ1bmN0aW9uIChhLCBiKSB7XG5cbiAgICAgIHZhciBxYXggPSBhLngsIHFheSA9IGEueSwgcWF6ID0gYS56LCBxYXcgPSBhLnc7XG4gICAgICB2YXIgcWJ4ID0gYi54LCBxYnkgPSBiLnksIHFieiA9IGIueiwgcWJ3ID0gYi53O1xuXG4gICAgICB0aGlzLnggPSBxYXggKiBxYncgKyBxYXcgKiBxYnggKyBxYXkgKiBxYnogLSBxYXogKiBxYnk7XG4gICAgICB0aGlzLnkgPSBxYXkgKiBxYncgKyBxYXcgKiBxYnkgKyBxYXogKiBxYnggLSBxYXggKiBxYno7XG4gICAgICB0aGlzLnogPSBxYXogKiBxYncgKyBxYXcgKiBxYnogKyBxYXggKiBxYnkgLSBxYXkgKiBxYng7XG4gICAgICB0aGlzLncgPSBxYXcgKiBxYncgLSBxYXggKiBxYnggLSBxYXkgKiBxYnkgLSBxYXogKiBxYno7XG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIH0sXG5cbiAgICBzZXRGcm9tVW5pdFZlY3RvcnM6IGZ1bmN0aW9uICh2MSwgdjIpIHtcblxuICAgICAgdmFyIHZ4ID0gbmV3IFZlYzMoKTtcbiAgICAgIHZhciByID0gdjEuZG90KHYyKSArIDE7XG5cbiAgICAgIGlmIChyIDwgX01hdGguRVBTMikge1xuXG4gICAgICAgIHIgPSAwO1xuICAgICAgICBpZiAoX01hdGguYWJzKHYxLngpID4gX01hdGguYWJzKHYxLnopKSB2eC5zZXQoLSB2MS55LCB2MS54LCAwKTtcbiAgICAgICAgZWxzZSB2eC5zZXQoMCwgLSB2MS56LCB2MS55KTtcblxuICAgICAgfSBlbHNlIHtcblxuICAgICAgICB2eC5jcm9zc1ZlY3RvcnModjEsIHYyKTtcblxuICAgICAgfVxuXG4gICAgICB0aGlzLl94ID0gdngueDtcbiAgICAgIHRoaXMuX3kgPSB2eC55O1xuICAgICAgdGhpcy5feiA9IHZ4Lno7XG4gICAgICB0aGlzLl93ID0gcjtcblxuICAgICAgcmV0dXJuIHRoaXMubm9ybWFsaXplKCk7XG5cbiAgICB9LFxuXG4gICAgYXJjOiBmdW5jdGlvbiAodjEsIHYyKSB7XG5cbiAgICAgIHZhciB4MSA9IHYxLng7XG4gICAgICB2YXIgeTEgPSB2MS55O1xuICAgICAgdmFyIHoxID0gdjEuejtcbiAgICAgIHZhciB4MiA9IHYyLng7XG4gICAgICB2YXIgeTIgPSB2Mi55O1xuICAgICAgdmFyIHoyID0gdjIuejtcbiAgICAgIHZhciBkID0geDEgKiB4MiArIHkxICogeTIgKyB6MSAqIHoyO1xuICAgICAgaWYgKGQgPT0gLTEpIHtcbiAgICAgICAgeDIgPSB5MSAqIHgxIC0gejEgKiB6MTtcbiAgICAgICAgeTIgPSAtejEgKiB5MSAtIHgxICogeDE7XG4gICAgICAgIHoyID0geDEgKiB6MSArIHkxICogeTE7XG4gICAgICAgIGQgPSAxIC8gX01hdGguc3FydCh4MiAqIHgyICsgeTIgKiB5MiArIHoyICogejIpO1xuICAgICAgICB0aGlzLncgPSAwO1xuICAgICAgICB0aGlzLnggPSB4MiAqIGQ7XG4gICAgICAgIHRoaXMueSA9IHkyICogZDtcbiAgICAgICAgdGhpcy56ID0gejIgKiBkO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cbiAgICAgIHZhciBjeCA9IHkxICogejIgLSB6MSAqIHkyO1xuICAgICAgdmFyIGN5ID0gejEgKiB4MiAtIHgxICogejI7XG4gICAgICB2YXIgY3ogPSB4MSAqIHkyIC0geTEgKiB4MjtcbiAgICAgIHRoaXMudyA9IF9NYXRoLnNxcnQoKDEgKyBkKSAqIDAuNSk7XG4gICAgICBkID0gMC41IC8gdGhpcy53O1xuICAgICAgdGhpcy54ID0gY3ggKiBkO1xuICAgICAgdGhpcy55ID0gY3kgKiBkO1xuICAgICAgdGhpcy56ID0gY3ogKiBkO1xuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICB9LFxuXG4gICAgbm9ybWFsaXplOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHZhciBsID0gdGhpcy5sZW5ndGgoKTtcbiAgICAgIGlmIChsID09PSAwKSB7XG4gICAgICAgIHRoaXMuc2V0KDAsIDAsIDAsIDEpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbCA9IDEgLyBsO1xuICAgICAgICB0aGlzLnggPSB0aGlzLnggKiBsO1xuICAgICAgICB0aGlzLnkgPSB0aGlzLnkgKiBsO1xuICAgICAgICB0aGlzLnogPSB0aGlzLnogKiBsO1xuICAgICAgICB0aGlzLncgPSB0aGlzLncgKiBsO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICB9LFxuXG4gICAgaW52ZXJzZTogZnVuY3Rpb24gKCkge1xuXG4gICAgICByZXR1cm4gdGhpcy5jb25qdWdhdGUoKS5ub3JtYWxpemUoKTtcblxuICAgIH0sXG5cbiAgICBpbnZlcnQ6IGZ1bmN0aW9uIChxKSB7XG5cbiAgICAgIHRoaXMueCA9IHEueDtcbiAgICAgIHRoaXMueSA9IHEueTtcbiAgICAgIHRoaXMueiA9IHEuejtcbiAgICAgIHRoaXMudyA9IHEudztcbiAgICAgIHRoaXMuY29uanVnYXRlKCkubm9ybWFsaXplKCk7XG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIH0sXG5cbiAgICBjb25qdWdhdGU6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgdGhpcy54ICo9IC0gMTtcbiAgICAgIHRoaXMueSAqPSAtIDE7XG4gICAgICB0aGlzLnogKj0gLSAxO1xuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICB9LFxuXG4gICAgbGVuZ3RoOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHJldHVybiBfTWF0aC5zcXJ0KHRoaXMueCAqIHRoaXMueCArIHRoaXMueSAqIHRoaXMueSArIHRoaXMueiAqIHRoaXMueiArIHRoaXMudyAqIHRoaXMudyk7XG5cbiAgICB9LFxuXG4gICAgbGVuZ3RoU3E6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgcmV0dXJuIHRoaXMueCAqIHRoaXMueCArIHRoaXMueSAqIHRoaXMueSArIHRoaXMueiAqIHRoaXMueiArIHRoaXMudyAqIHRoaXMudztcblxuICAgIH0sXG5cbiAgICBjb3B5OiBmdW5jdGlvbiAocSkge1xuXG4gICAgICB0aGlzLnggPSBxLng7XG4gICAgICB0aGlzLnkgPSBxLnk7XG4gICAgICB0aGlzLnogPSBxLno7XG4gICAgICB0aGlzLncgPSBxLnc7XG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIH0sXG5cbiAgICBjbG9uZTogZnVuY3Rpb24gKHEpIHtcblxuICAgICAgcmV0dXJuIG5ldyBRdWF0KHRoaXMueCwgdGhpcy55LCB0aGlzLnosIHRoaXMudyk7XG5cbiAgICB9LFxuXG4gICAgdGVzdERpZmY6IGZ1bmN0aW9uIChxKSB7XG5cbiAgICAgIHJldHVybiB0aGlzLmVxdWFscyhxKSA/IGZhbHNlIDogdHJ1ZTtcblxuICAgIH0sXG5cbiAgICBlcXVhbHM6IGZ1bmN0aW9uIChxKSB7XG5cbiAgICAgIHJldHVybiB0aGlzLnggPT09IHEueCAmJiB0aGlzLnkgPT09IHEueSAmJiB0aGlzLnogPT09IHEueiAmJiB0aGlzLncgPT09IHEudztcblxuICAgIH0sXG5cbiAgICB0b1N0cmluZzogZnVuY3Rpb24gKCkge1xuXG4gICAgICByZXR1cm4gXCJRdWF0W1wiICsgdGhpcy54LnRvRml4ZWQoNCkgKyBcIiwgKFwiICsgdGhpcy55LnRvRml4ZWQoNCkgKyBcIiwgXCIgKyB0aGlzLnoudG9GaXhlZCg0KSArIFwiLCBcIiArIHRoaXMudy50b0ZpeGVkKDQpICsgXCIpXVwiO1xuXG4gICAgfSxcblxuICAgIHNldEZyb21FdWxlcjogZnVuY3Rpb24gKHgsIHksIHopIHtcblxuICAgICAgdmFyIGMxID0gTWF0aC5jb3MoeCAqIDAuNSk7XG4gICAgICB2YXIgYzIgPSBNYXRoLmNvcyh5ICogMC41KTtcbiAgICAgIHZhciBjMyA9IE1hdGguY29zKHogKiAwLjUpO1xuICAgICAgdmFyIHMxID0gTWF0aC5zaW4oeCAqIDAuNSk7XG4gICAgICB2YXIgczIgPSBNYXRoLnNpbih5ICogMC41KTtcbiAgICAgIHZhciBzMyA9IE1hdGguc2luKHogKiAwLjUpO1xuXG4gICAgICAvLyBYWVpcbiAgICAgIHRoaXMueCA9IHMxICogYzIgKiBjMyArIGMxICogczIgKiBzMztcbiAgICAgIHRoaXMueSA9IGMxICogczIgKiBjMyAtIHMxICogYzIgKiBzMztcbiAgICAgIHRoaXMueiA9IGMxICogYzIgKiBzMyArIHMxICogczIgKiBjMztcbiAgICAgIHRoaXMudyA9IGMxICogYzIgKiBjMyAtIHMxICogczIgKiBzMztcblxuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICB9LFxuXG4gICAgc2V0RnJvbUF4aXM6IGZ1bmN0aW9uIChheGlzLCByYWQpIHtcblxuICAgICAgYXhpcy5ub3JtYWxpemUoKTtcbiAgICAgIHJhZCA9IHJhZCAqIDAuNTtcbiAgICAgIHZhciBzID0gX01hdGguc2luKHJhZCk7XG4gICAgICB0aGlzLnggPSBzICogYXhpcy54O1xuICAgICAgdGhpcy55ID0gcyAqIGF4aXMueTtcbiAgICAgIHRoaXMueiA9IHMgKiBheGlzLno7XG4gICAgICB0aGlzLncgPSBfTWF0aC5jb3MocmFkKTtcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfSxcblxuICAgIHNldEZyb21NYXQzMzogZnVuY3Rpb24gKG0pIHtcblxuICAgICAgdmFyIHRyYWNlID0gbVswXSArIG1bNF0gKyBtWzhdO1xuICAgICAgdmFyIHM7XG5cbiAgICAgIGlmICh0cmFjZSA+IDApIHtcblxuICAgICAgICBzID0gX01hdGguc3FydCh0cmFjZSArIDEuMCk7XG4gICAgICAgIHRoaXMudyA9IDAuNSAvIHM7XG4gICAgICAgIHMgPSAwLjUgLyBzO1xuICAgICAgICB0aGlzLnggPSAobVs1XSAtIG1bN10pICogcztcbiAgICAgICAgdGhpcy55ID0gKG1bNl0gLSBtWzJdKSAqIHM7XG4gICAgICAgIHRoaXMueiA9IChtWzFdIC0gbVszXSkgKiBzO1xuXG4gICAgICB9IGVsc2Uge1xuXG4gICAgICAgIHZhciBvdXQgPSBbXTtcbiAgICAgICAgdmFyIGkgPSAwO1xuICAgICAgICBpZiAobVs0XSA+IG1bMF0pIGkgPSAxO1xuICAgICAgICBpZiAobVs4XSA+IG1baSAqIDMgKyBpXSkgaSA9IDI7XG5cbiAgICAgICAgdmFyIGogPSAoaSArIDEpICUgMztcbiAgICAgICAgdmFyIGsgPSAoaSArIDIpICUgMztcblxuICAgICAgICBzID0gX01hdGguc3FydChtW2kgKiAzICsgaV0gLSBtW2ogKiAzICsgal0gLSBtW2sgKiAzICsga10gKyAxLjApO1xuICAgICAgICBvdXRbaV0gPSAwLjUgKiBmUm9vdDtcbiAgICAgICAgcyA9IDAuNSAvIGZSb290O1xuICAgICAgICB0aGlzLncgPSAobVtqICogMyArIGtdIC0gbVtrICogMyArIGpdKSAqIHM7XG4gICAgICAgIG91dFtqXSA9IChtW2ogKiAzICsgaV0gKyBtW2kgKiAzICsgal0pICogcztcbiAgICAgICAgb3V0W2tdID0gKG1bayAqIDMgKyBpXSArIG1baSAqIDMgKyBrXSkgKiBzO1xuXG4gICAgICAgIHRoaXMueCA9IG91dFsxXTtcbiAgICAgICAgdGhpcy55ID0gb3V0WzJdO1xuICAgICAgICB0aGlzLnogPSBvdXRbM107XG5cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICB9LFxuXG4gICAgdG9BcnJheTogZnVuY3Rpb24gKGFycmF5LCBvZmZzZXQpIHtcblxuICAgICAgb2Zmc2V0ID0gb2Zmc2V0IHx8IDA7XG5cbiAgICAgIGFycmF5W29mZnNldF0gPSB0aGlzLng7XG4gICAgICBhcnJheVtvZmZzZXQgKyAxXSA9IHRoaXMueTtcbiAgICAgIGFycmF5W29mZnNldCArIDJdID0gdGhpcy56O1xuICAgICAgYXJyYXlbb2Zmc2V0ICsgM10gPSB0aGlzLnc7XG5cbiAgICB9LFxuXG4gICAgZnJvbUFycmF5OiBmdW5jdGlvbiAoYXJyYXksIG9mZnNldCkge1xuXG4gICAgICBvZmZzZXQgPSBvZmZzZXQgfHwgMDtcbiAgICAgIHRoaXMuc2V0KGFycmF5W29mZnNldF0sIGFycmF5W29mZnNldCArIDFdLCBhcnJheVtvZmZzZXQgKyAyXSwgYXJyYXlbb2Zmc2V0ICsgM10pO1xuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICB9XG5cbiAgfSk7XG5cbiAgZnVuY3Rpb24gTWF0MzMoZTAwLCBlMDEsIGUwMiwgZTEwLCBlMTEsIGUxMiwgZTIwLCBlMjEsIGUyMikge1xuXG4gICAgdGhpcy5lbGVtZW50cyA9IFtcbiAgICAgIDEsIDAsIDAsXG4gICAgICAwLCAxLCAwLFxuICAgICAgMCwgMCwgMVxuICAgIF07XG5cbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDApIHtcblxuICAgICAgY29uc29sZS5lcnJvcignT0lNTy5NYXQzMzogdGhlIGNvbnN0cnVjdG9yIG5vIGxvbmdlciByZWFkcyBhcmd1bWVudHMuIHVzZSAuc2V0KCkgaW5zdGVhZC4nKTtcblxuICAgIH1cblxuICB9XG5cbiAgT2JqZWN0LmFzc2lnbihNYXQzMy5wcm90b3R5cGUsIHtcblxuICAgIE1hdDMzOiB0cnVlLFxuXG4gICAgc2V0OiBmdW5jdGlvbiAoZTAwLCBlMDEsIGUwMiwgZTEwLCBlMTEsIGUxMiwgZTIwLCBlMjEsIGUyMikge1xuXG4gICAgICB2YXIgdGUgPSB0aGlzLmVsZW1lbnRzO1xuICAgICAgdGVbMF0gPSBlMDA7IHRlWzFdID0gZTAxOyB0ZVsyXSA9IGUwMjtcbiAgICAgIHRlWzNdID0gZTEwOyB0ZVs0XSA9IGUxMTsgdGVbNV0gPSBlMTI7XG4gICAgICB0ZVs2XSA9IGUyMDsgdGVbN10gPSBlMjE7IHRlWzhdID0gZTIyO1xuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICB9LFxuXG4gICAgYWRkOiBmdW5jdGlvbiAoYSwgYikge1xuXG4gICAgICBpZiAoYiAhPT0gdW5kZWZpbmVkKSByZXR1cm4gdGhpcy5hZGRNYXRyaXhzKGEsIGIpO1xuXG4gICAgICB2YXIgZSA9IHRoaXMuZWxlbWVudHMsIHRlID0gYS5lbGVtZW50cztcbiAgICAgIGVbMF0gKz0gdGVbMF07IGVbMV0gKz0gdGVbMV07IGVbMl0gKz0gdGVbMl07XG4gICAgICBlWzNdICs9IHRlWzNdOyBlWzRdICs9IHRlWzRdOyBlWzVdICs9IHRlWzVdO1xuICAgICAgZVs2XSArPSB0ZVs2XTsgZVs3XSArPSB0ZVs3XTsgZVs4XSArPSB0ZVs4XTtcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfSxcblxuICAgIGFkZE1hdHJpeHM6IGZ1bmN0aW9uIChhLCBiKSB7XG5cbiAgICAgIHZhciB0ZSA9IHRoaXMuZWxlbWVudHMsIHRlbTEgPSBhLmVsZW1lbnRzLCB0ZW0yID0gYi5lbGVtZW50cztcbiAgICAgIHRlWzBdID0gdGVtMVswXSArIHRlbTJbMF07IHRlWzFdID0gdGVtMVsxXSArIHRlbTJbMV07IHRlWzJdID0gdGVtMVsyXSArIHRlbTJbMl07XG4gICAgICB0ZVszXSA9IHRlbTFbM10gKyB0ZW0yWzNdOyB0ZVs0XSA9IHRlbTFbNF0gKyB0ZW0yWzRdOyB0ZVs1XSA9IHRlbTFbNV0gKyB0ZW0yWzVdO1xuICAgICAgdGVbNl0gPSB0ZW0xWzZdICsgdGVtMls2XTsgdGVbN10gPSB0ZW0xWzddICsgdGVtMls3XTsgdGVbOF0gPSB0ZW0xWzhdICsgdGVtMls4XTtcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfSxcblxuICAgIGFkZEVxdWFsOiBmdW5jdGlvbiAobSkge1xuXG4gICAgICB2YXIgdGUgPSB0aGlzLmVsZW1lbnRzLCB0ZW0gPSBtLmVsZW1lbnRzO1xuICAgICAgdGVbMF0gKz0gdGVtWzBdOyB0ZVsxXSArPSB0ZW1bMV07IHRlWzJdICs9IHRlbVsyXTtcbiAgICAgIHRlWzNdICs9IHRlbVszXTsgdGVbNF0gKz0gdGVtWzRdOyB0ZVs1XSArPSB0ZW1bNV07XG4gICAgICB0ZVs2XSArPSB0ZW1bNl07IHRlWzddICs9IHRlbVs3XTsgdGVbOF0gKz0gdGVtWzhdO1xuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICB9LFxuXG4gICAgc3ViOiBmdW5jdGlvbiAoYSwgYikge1xuXG4gICAgICBpZiAoYiAhPT0gdW5kZWZpbmVkKSByZXR1cm4gdGhpcy5zdWJNYXRyaXhzKGEsIGIpO1xuXG4gICAgICB2YXIgZSA9IHRoaXMuZWxlbWVudHMsIHRlID0gYS5lbGVtZW50cztcbiAgICAgIGVbMF0gLT0gdGVbMF07IGVbMV0gLT0gdGVbMV07IGVbMl0gLT0gdGVbMl07XG4gICAgICBlWzNdIC09IHRlWzNdOyBlWzRdIC09IHRlWzRdOyBlWzVdIC09IHRlWzVdO1xuICAgICAgZVs2XSAtPSB0ZVs2XTsgZVs3XSAtPSB0ZVs3XTsgZVs4XSAtPSB0ZVs4XTtcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfSxcblxuICAgIHN1Yk1hdHJpeHM6IGZ1bmN0aW9uIChhLCBiKSB7XG5cbiAgICAgIHZhciB0ZSA9IHRoaXMuZWxlbWVudHMsIHRlbTEgPSBhLmVsZW1lbnRzLCB0ZW0yID0gYi5lbGVtZW50cztcbiAgICAgIHRlWzBdID0gdGVtMVswXSAtIHRlbTJbMF07IHRlWzFdID0gdGVtMVsxXSAtIHRlbTJbMV07IHRlWzJdID0gdGVtMVsyXSAtIHRlbTJbMl07XG4gICAgICB0ZVszXSA9IHRlbTFbM10gLSB0ZW0yWzNdOyB0ZVs0XSA9IHRlbTFbNF0gLSB0ZW0yWzRdOyB0ZVs1XSA9IHRlbTFbNV0gLSB0ZW0yWzVdO1xuICAgICAgdGVbNl0gPSB0ZW0xWzZdIC0gdGVtMls2XTsgdGVbN10gPSB0ZW0xWzddIC0gdGVtMls3XTsgdGVbOF0gPSB0ZW0xWzhdIC0gdGVtMls4XTtcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfSxcblxuICAgIHN1YkVxdWFsOiBmdW5jdGlvbiAobSkge1xuXG4gICAgICB2YXIgdGUgPSB0aGlzLmVsZW1lbnRzLCB0ZW0gPSBtLmVsZW1lbnRzO1xuICAgICAgdGVbMF0gLT0gdGVtWzBdOyB0ZVsxXSAtPSB0ZW1bMV07IHRlWzJdIC09IHRlbVsyXTtcbiAgICAgIHRlWzNdIC09IHRlbVszXTsgdGVbNF0gLT0gdGVtWzRdOyB0ZVs1XSAtPSB0ZW1bNV07XG4gICAgICB0ZVs2XSAtPSB0ZW1bNl07IHRlWzddIC09IHRlbVs3XTsgdGVbOF0gLT0gdGVtWzhdO1xuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICB9LFxuXG4gICAgc2NhbGU6IGZ1bmN0aW9uIChtLCBzKSB7XG5cbiAgICAgIHZhciB0ZSA9IHRoaXMuZWxlbWVudHMsIHRtID0gbS5lbGVtZW50cztcbiAgICAgIHRlWzBdID0gdG1bMF0gKiBzOyB0ZVsxXSA9IHRtWzFdICogczsgdGVbMl0gPSB0bVsyXSAqIHM7XG4gICAgICB0ZVszXSA9IHRtWzNdICogczsgdGVbNF0gPSB0bVs0XSAqIHM7IHRlWzVdID0gdG1bNV0gKiBzO1xuICAgICAgdGVbNl0gPSB0bVs2XSAqIHM7IHRlWzddID0gdG1bN10gKiBzOyB0ZVs4XSA9IHRtWzhdICogcztcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfSxcblxuICAgIHNjYWxlRXF1YWw6IGZ1bmN0aW9uIChzKSB7Ly8gbXVsdGlwbHlTY2FsYXJcblxuICAgICAgdmFyIHRlID0gdGhpcy5lbGVtZW50cztcbiAgICAgIHRlWzBdICo9IHM7IHRlWzFdICo9IHM7IHRlWzJdICo9IHM7XG4gICAgICB0ZVszXSAqPSBzOyB0ZVs0XSAqPSBzOyB0ZVs1XSAqPSBzO1xuICAgICAgdGVbNl0gKj0gczsgdGVbN10gKj0gczsgdGVbOF0gKj0gcztcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfSxcblxuICAgIG11bHRpcGx5TWF0cmljZXM6IGZ1bmN0aW9uIChtMSwgbTIsIHRyYW5zcG9zZSkge1xuXG4gICAgICBpZiAodHJhbnNwb3NlKSBtMiA9IG0yLmNsb25lKCkudHJhbnNwb3NlKCk7XG5cbiAgICAgIHZhciB0ZSA9IHRoaXMuZWxlbWVudHM7XG4gICAgICB2YXIgdG0xID0gbTEuZWxlbWVudHM7XG4gICAgICB2YXIgdG0yID0gbTIuZWxlbWVudHM7XG5cbiAgICAgIHZhciBhMCA9IHRtMVswXSwgYTMgPSB0bTFbM10sIGE2ID0gdG0xWzZdO1xuICAgICAgdmFyIGExID0gdG0xWzFdLCBhNCA9IHRtMVs0XSwgYTcgPSB0bTFbN107XG4gICAgICB2YXIgYTIgPSB0bTFbMl0sIGE1ID0gdG0xWzVdLCBhOCA9IHRtMVs4XTtcblxuICAgICAgdmFyIGIwID0gdG0yWzBdLCBiMyA9IHRtMlszXSwgYjYgPSB0bTJbNl07XG4gICAgICB2YXIgYjEgPSB0bTJbMV0sIGI0ID0gdG0yWzRdLCBiNyA9IHRtMls3XTtcbiAgICAgIHZhciBiMiA9IHRtMlsyXSwgYjUgPSB0bTJbNV0sIGI4ID0gdG0yWzhdO1xuXG4gICAgICB0ZVswXSA9IGEwICogYjAgKyBhMSAqIGIzICsgYTIgKiBiNjtcbiAgICAgIHRlWzFdID0gYTAgKiBiMSArIGExICogYjQgKyBhMiAqIGI3O1xuICAgICAgdGVbMl0gPSBhMCAqIGIyICsgYTEgKiBiNSArIGEyICogYjg7XG4gICAgICB0ZVszXSA9IGEzICogYjAgKyBhNCAqIGIzICsgYTUgKiBiNjtcbiAgICAgIHRlWzRdID0gYTMgKiBiMSArIGE0ICogYjQgKyBhNSAqIGI3O1xuICAgICAgdGVbNV0gPSBhMyAqIGIyICsgYTQgKiBiNSArIGE1ICogYjg7XG4gICAgICB0ZVs2XSA9IGE2ICogYjAgKyBhNyAqIGIzICsgYTggKiBiNjtcbiAgICAgIHRlWzddID0gYTYgKiBiMSArIGE3ICogYjQgKyBhOCAqIGI3O1xuICAgICAgdGVbOF0gPSBhNiAqIGIyICsgYTcgKiBiNSArIGE4ICogYjg7XG5cbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfSxcblxuICAgIC8qbXVsOiBmdW5jdGlvbiAoIG0xLCBtMiwgdHJhbnNwb3NlICkge1xuXG4gICAgICAgIGlmKCB0cmFuc3Bvc2UgKSBtMiA9IG0yLmNsb25lKCkudHJhbnNwb3NlKCk7XG5cbiAgICAgICAgdmFyIHRlID0gdGhpcy5lbGVtZW50cztcbiAgICAgICAgdmFyIHRtMSA9IG0xLmVsZW1lbnRzO1xuICAgICAgICB2YXIgdG0yID0gbTIuZWxlbWVudHM7XG4gICAgICAgIC8vdmFyIHRtcDtcblxuICAgICAgICB2YXIgYTAgPSB0bTFbMF0sIGEzID0gdG0xWzNdLCBhNiA9IHRtMVs2XTtcbiAgICAgICAgdmFyIGExID0gdG0xWzFdLCBhNCA9IHRtMVs0XSwgYTcgPSB0bTFbN107XG4gICAgICAgIHZhciBhMiA9IHRtMVsyXSwgYTUgPSB0bTFbNV0sIGE4ID0gdG0xWzhdO1xuXG4gICAgICAgIHZhciBiMCA9IHRtMlswXSwgYjMgPSB0bTJbM10sIGI2ID0gdG0yWzZdO1xuICAgICAgICB2YXIgYjEgPSB0bTJbMV0sIGI0ID0gdG0yWzRdLCBiNyA9IHRtMls3XTtcbiAgICAgICAgdmFyIGIyID0gdG0yWzJdLCBiNSA9IHRtMls1XSwgYjggPSB0bTJbOF07XG5cbiAgICAgICAgLyppZiggdHJhbnNwb3NlICl7XG5cbiAgICAgICAgICAgIHRtcCA9IGIxOyBiMSA9IGIzOyBiMyA9IHRtcDtcbiAgICAgICAgICAgIHRtcCA9IGIyOyBiMiA9IGI2OyBiNiA9IHRtcDtcbiAgICAgICAgICAgIHRtcCA9IGI1OyBiNSA9IGI3OyBiNyA9IHRtcDtcblxuICAgICAgICB9XG5cbiAgICAgICAgdGVbMF0gPSBhMCpiMCArIGExKmIzICsgYTIqYjY7XG4gICAgICAgIHRlWzFdID0gYTAqYjEgKyBhMSpiNCArIGEyKmI3O1xuICAgICAgICB0ZVsyXSA9IGEwKmIyICsgYTEqYjUgKyBhMipiODtcbiAgICAgICAgdGVbM10gPSBhMypiMCArIGE0KmIzICsgYTUqYjY7XG4gICAgICAgIHRlWzRdID0gYTMqYjEgKyBhNCpiNCArIGE1KmI3O1xuICAgICAgICB0ZVs1XSA9IGEzKmIyICsgYTQqYjUgKyBhNSpiODtcbiAgICAgICAgdGVbNl0gPSBhNipiMCArIGE3KmIzICsgYTgqYjY7XG4gICAgICAgIHRlWzddID0gYTYqYjEgKyBhNypiNCArIGE4KmI3O1xuICAgICAgICB0ZVs4XSA9IGE2KmIyICsgYTcqYjUgKyBhOCpiODtcblxuICAgICAgICByZXR1cm4gdGhpcztcblxuICAgIH0sKi9cblxuICAgIHRyYW5zcG9zZTogZnVuY3Rpb24gKG0pIHtcblxuICAgICAgaWYgKG0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICB2YXIgYSA9IG0uZWxlbWVudHM7XG4gICAgICAgIHRoaXMuc2V0KGFbMF0sIGFbM10sIGFbNl0sIGFbMV0sIGFbNF0sIGFbN10sIGFbMl0sIGFbNV0sIGFbOF0pO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cblxuICAgICAgdmFyIHRlID0gdGhpcy5lbGVtZW50cztcbiAgICAgIHZhciBhMDEgPSB0ZVsxXSwgYTAyID0gdGVbMl0sIGExMiA9IHRlWzVdO1xuICAgICAgdGVbMV0gPSB0ZVszXTtcbiAgICAgIHRlWzJdID0gdGVbNl07XG4gICAgICB0ZVszXSA9IGEwMTtcbiAgICAgIHRlWzVdID0gdGVbN107XG4gICAgICB0ZVs2XSA9IGEwMjtcbiAgICAgIHRlWzddID0gYTEyO1xuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICB9LFxuXG5cblxuICAgIC8qbXVsU2NhbGU6IGZ1bmN0aW9uICggbSwgc3gsIHN5LCBzeiwgUHJlcGVuZCApIHtcblxuICAgICAgICB2YXIgcHJlcGVuZCA9IFByZXBlbmQgfHwgZmFsc2U7XG4gICAgICAgIHZhciB0ZSA9IHRoaXMuZWxlbWVudHMsIHRtID0gbS5lbGVtZW50cztcbiAgICAgICAgaWYocHJlcGVuZCl7XG4gICAgICAgICAgICB0ZVswXSA9IHN4KnRtWzBdOyB0ZVsxXSA9IHN4KnRtWzFdOyB0ZVsyXSA9IHN4KnRtWzJdO1xuICAgICAgICAgICAgdGVbM10gPSBzeSp0bVszXTsgdGVbNF0gPSBzeSp0bVs0XTsgdGVbNV0gPSBzeSp0bVs1XTtcbiAgICAgICAgICAgIHRlWzZdID0gc3oqdG1bNl07IHRlWzddID0gc3oqdG1bN107IHRlWzhdID0gc3oqdG1bOF07XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgICAgdGVbMF0gPSB0bVswXSpzeDsgdGVbMV0gPSB0bVsxXSpzeTsgdGVbMl0gPSB0bVsyXSpzejtcbiAgICAgICAgICAgIHRlWzNdID0gdG1bM10qc3g7IHRlWzRdID0gdG1bNF0qc3k7IHRlWzVdID0gdG1bNV0qc3o7XG4gICAgICAgICAgICB0ZVs2XSA9IHRtWzZdKnN4OyB0ZVs3XSA9IHRtWzddKnN5OyB0ZVs4XSA9IHRtWzhdKnN6O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfSxcblxuICAgIHRyYW5zcG9zZTogZnVuY3Rpb24gKCBtICkge1xuXG4gICAgICAgIHZhciB0ZSA9IHRoaXMuZWxlbWVudHMsIHRtID0gbS5lbGVtZW50cztcbiAgICAgICAgdGVbMF0gPSB0bVswXTsgdGVbMV0gPSB0bVszXTsgdGVbMl0gPSB0bVs2XTtcbiAgICAgICAgdGVbM10gPSB0bVsxXTsgdGVbNF0gPSB0bVs0XTsgdGVbNV0gPSB0bVs3XTtcbiAgICAgICAgdGVbNl0gPSB0bVsyXTsgdGVbN10gPSB0bVs1XTsgdGVbOF0gPSB0bVs4XTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICB9LCovXG5cbiAgICBzZXRRdWF0OiBmdW5jdGlvbiAocSkge1xuXG4gICAgICB2YXIgdGUgPSB0aGlzLmVsZW1lbnRzO1xuICAgICAgdmFyIHggPSBxLngsIHkgPSBxLnksIHogPSBxLnosIHcgPSBxLnc7XG4gICAgICB2YXIgeDIgPSB4ICsgeCwgeTIgPSB5ICsgeSwgejIgPSB6ICsgejtcbiAgICAgIHZhciB4eCA9IHggKiB4MiwgeHkgPSB4ICogeTIsIHh6ID0geCAqIHoyO1xuICAgICAgdmFyIHl5ID0geSAqIHkyLCB5eiA9IHkgKiB6MiwgenogPSB6ICogejI7XG4gICAgICB2YXIgd3ggPSB3ICogeDIsIHd5ID0gdyAqIHkyLCB3eiA9IHcgKiB6MjtcblxuICAgICAgdGVbMF0gPSAxIC0gKHl5ICsgenopO1xuICAgICAgdGVbMV0gPSB4eSAtIHd6O1xuICAgICAgdGVbMl0gPSB4eiArIHd5O1xuXG4gICAgICB0ZVszXSA9IHh5ICsgd3o7XG4gICAgICB0ZVs0XSA9IDEgLSAoeHggKyB6eik7XG4gICAgICB0ZVs1XSA9IHl6IC0gd3g7XG5cbiAgICAgIHRlWzZdID0geHogLSB3eTtcbiAgICAgIHRlWzddID0geXogKyB3eDtcbiAgICAgIHRlWzhdID0gMSAtICh4eCArIHl5KTtcblxuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICB9LFxuXG4gICAgaW52ZXJ0OiBmdW5jdGlvbiAobSkge1xuXG4gICAgICB2YXIgdGUgPSB0aGlzLmVsZW1lbnRzLCB0bSA9IG0uZWxlbWVudHMsXG4gICAgICAgIGEwMCA9IHRtWzBdLCBhMTAgPSB0bVszXSwgYTIwID0gdG1bNl0sXG4gICAgICAgIGEwMSA9IHRtWzFdLCBhMTEgPSB0bVs0XSwgYTIxID0gdG1bN10sXG4gICAgICAgIGEwMiA9IHRtWzJdLCBhMTIgPSB0bVs1XSwgYTIyID0gdG1bOF0sXG4gICAgICAgIGIwMSA9IGEyMiAqIGExMSAtIGExMiAqIGEyMSxcbiAgICAgICAgYjExID0gLWEyMiAqIGExMCArIGExMiAqIGEyMCxcbiAgICAgICAgYjIxID0gYTIxICogYTEwIC0gYTExICogYTIwLFxuICAgICAgICBkZXQgPSBhMDAgKiBiMDEgKyBhMDEgKiBiMTEgKyBhMDIgKiBiMjE7XG5cbiAgICAgIGlmIChkZXQgPT09IDApIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJjYW4ndCBpbnZlcnQgbWF0cml4LCBkZXRlcm1pbmFudCBpcyAwXCIpO1xuICAgICAgICByZXR1cm4gdGhpcy5pZGVudGl0eSgpO1xuICAgICAgfVxuXG4gICAgICBkZXQgPSAxLjAgLyBkZXQ7XG4gICAgICB0ZVswXSA9IGIwMSAqIGRldDtcbiAgICAgIHRlWzFdID0gKC1hMjIgKiBhMDEgKyBhMDIgKiBhMjEpICogZGV0O1xuICAgICAgdGVbMl0gPSAoYTEyICogYTAxIC0gYTAyICogYTExKSAqIGRldDtcbiAgICAgIHRlWzNdID0gYjExICogZGV0O1xuICAgICAgdGVbNF0gPSAoYTIyICogYTAwIC0gYTAyICogYTIwKSAqIGRldDtcbiAgICAgIHRlWzVdID0gKC1hMTIgKiBhMDAgKyBhMDIgKiBhMTApICogZGV0O1xuICAgICAgdGVbNl0gPSBiMjEgKiBkZXQ7XG4gICAgICB0ZVs3XSA9ICgtYTIxICogYTAwICsgYTAxICogYTIwKSAqIGRldDtcbiAgICAgIHRlWzhdID0gKGExMSAqIGEwMCAtIGEwMSAqIGExMCkgKiBkZXQ7XG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIH0sXG5cbiAgICBhZGRPZmZzZXQ6IGZ1bmN0aW9uIChtLCB2KSB7XG5cbiAgICAgIHZhciByZWxYID0gdi54O1xuICAgICAgdmFyIHJlbFkgPSB2Lnk7XG4gICAgICB2YXIgcmVsWiA9IHYuejtcblxuICAgICAgdmFyIHRlID0gdGhpcy5lbGVtZW50cztcbiAgICAgIHRlWzBdICs9IG0gKiAocmVsWSAqIHJlbFkgKyByZWxaICogcmVsWik7XG4gICAgICB0ZVs0XSArPSBtICogKHJlbFggKiByZWxYICsgcmVsWiAqIHJlbFopO1xuICAgICAgdGVbOF0gKz0gbSAqIChyZWxYICogcmVsWCArIHJlbFkgKiByZWxZKTtcbiAgICAgIHZhciB4eSA9IG0gKiByZWxYICogcmVsWTtcbiAgICAgIHZhciB5eiA9IG0gKiByZWxZICogcmVsWjtcbiAgICAgIHZhciB6eCA9IG0gKiByZWxaICogcmVsWDtcbiAgICAgIHRlWzFdIC09IHh5O1xuICAgICAgdGVbM10gLT0geHk7XG4gICAgICB0ZVsyXSAtPSB5ejtcbiAgICAgIHRlWzZdIC09IHl6O1xuICAgICAgdGVbNV0gLT0geng7XG4gICAgICB0ZVs3XSAtPSB6eDtcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfSxcblxuICAgIHN1Yk9mZnNldDogZnVuY3Rpb24gKG0sIHYpIHtcblxuICAgICAgdmFyIHJlbFggPSB2Lng7XG4gICAgICB2YXIgcmVsWSA9IHYueTtcbiAgICAgIHZhciByZWxaID0gdi56O1xuXG4gICAgICB2YXIgdGUgPSB0aGlzLmVsZW1lbnRzO1xuICAgICAgdGVbMF0gLT0gbSAqIChyZWxZICogcmVsWSArIHJlbFogKiByZWxaKTtcbiAgICAgIHRlWzRdIC09IG0gKiAocmVsWCAqIHJlbFggKyByZWxaICogcmVsWik7XG4gICAgICB0ZVs4XSAtPSBtICogKHJlbFggKiByZWxYICsgcmVsWSAqIHJlbFkpO1xuICAgICAgdmFyIHh5ID0gbSAqIHJlbFggKiByZWxZO1xuICAgICAgdmFyIHl6ID0gbSAqIHJlbFkgKiByZWxaO1xuICAgICAgdmFyIHp4ID0gbSAqIHJlbFogKiByZWxYO1xuICAgICAgdGVbMV0gKz0geHk7XG4gICAgICB0ZVszXSArPSB4eTtcbiAgICAgIHRlWzJdICs9IHl6O1xuICAgICAgdGVbNl0gKz0geXo7XG4gICAgICB0ZVs1XSArPSB6eDtcbiAgICAgIHRlWzddICs9IHp4O1xuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICB9LFxuXG4gICAgLy8gT0sgXG5cbiAgICBtdWx0aXBseVNjYWxhcjogZnVuY3Rpb24gKHMpIHtcblxuICAgICAgdmFyIHRlID0gdGhpcy5lbGVtZW50cztcblxuICAgICAgdGVbMF0gKj0gczsgdGVbM10gKj0gczsgdGVbNl0gKj0gcztcbiAgICAgIHRlWzFdICo9IHM7IHRlWzRdICo9IHM7IHRlWzddICo9IHM7XG4gICAgICB0ZVsyXSAqPSBzOyB0ZVs1XSAqPSBzOyB0ZVs4XSAqPSBzO1xuXG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIH0sXG5cbiAgICBpZGVudGl0eTogZnVuY3Rpb24gKCkge1xuXG4gICAgICB0aGlzLnNldCgxLCAwLCAwLCAwLCAxLCAwLCAwLCAwLCAxKTtcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfSxcblxuXG4gICAgY2xvbmU6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgcmV0dXJuIG5ldyBNYXQzMygpLmZyb21BcnJheSh0aGlzLmVsZW1lbnRzKTtcblxuICAgIH0sXG5cbiAgICBjb3B5OiBmdW5jdGlvbiAobSkge1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDk7IGkrKykgdGhpcy5lbGVtZW50c1tpXSA9IG0uZWxlbWVudHNbaV07XG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIH0sXG5cbiAgICBkZXRlcm1pbmFudDogZnVuY3Rpb24gKCkge1xuXG4gICAgICB2YXIgdGUgPSB0aGlzLmVsZW1lbnRzO1xuICAgICAgdmFyIGEgPSB0ZVswXSwgYiA9IHRlWzFdLCBjID0gdGVbMl0sXG4gICAgICAgIGQgPSB0ZVszXSwgZSA9IHRlWzRdLCBmID0gdGVbNV0sXG4gICAgICAgIGcgPSB0ZVs2XSwgaCA9IHRlWzddLCBpID0gdGVbOF07XG5cbiAgICAgIHJldHVybiBhICogZSAqIGkgLSBhICogZiAqIGggLSBiICogZCAqIGkgKyBiICogZiAqIGcgKyBjICogZCAqIGggLSBjICogZSAqIGc7XG5cbiAgICB9LFxuXG4gICAgZnJvbUFycmF5OiBmdW5jdGlvbiAoYXJyYXksIG9mZnNldCkge1xuXG4gICAgICBpZiAob2Zmc2V0ID09PSB1bmRlZmluZWQpIG9mZnNldCA9IDA7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgOTsgaSsrKSB7XG5cbiAgICAgICAgdGhpcy5lbGVtZW50c1tpXSA9IGFycmF5W2kgKyBvZmZzZXRdO1xuXG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfSxcblxuICAgIHRvQXJyYXk6IGZ1bmN0aW9uIChhcnJheSwgb2Zmc2V0KSB7XG5cbiAgICAgIGlmIChhcnJheSA9PT0gdW5kZWZpbmVkKSBhcnJheSA9IFtdO1xuICAgICAgaWYgKG9mZnNldCA9PT0gdW5kZWZpbmVkKSBvZmZzZXQgPSAwO1xuXG4gICAgICB2YXIgdGUgPSB0aGlzLmVsZW1lbnRzO1xuXG4gICAgICBhcnJheVtvZmZzZXRdID0gdGVbMF07XG4gICAgICBhcnJheVtvZmZzZXQgKyAxXSA9IHRlWzFdO1xuICAgICAgYXJyYXlbb2Zmc2V0ICsgMl0gPSB0ZVsyXTtcblxuICAgICAgYXJyYXlbb2Zmc2V0ICsgM10gPSB0ZVszXTtcbiAgICAgIGFycmF5W29mZnNldCArIDRdID0gdGVbNF07XG4gICAgICBhcnJheVtvZmZzZXQgKyA1XSA9IHRlWzVdO1xuXG4gICAgICBhcnJheVtvZmZzZXQgKyA2XSA9IHRlWzZdO1xuICAgICAgYXJyYXlbb2Zmc2V0ICsgN10gPSB0ZVs3XTtcbiAgICAgIGFycmF5W29mZnNldCArIDhdID0gdGVbOF07XG5cbiAgICAgIHJldHVybiBhcnJheTtcblxuICAgIH1cblxuXG4gIH0pO1xuXG4gIC8qKlxuICAgKiBBbiBheGlzLWFsaWduZWQgYm91bmRpbmcgYm94LlxuICAgKlxuICAgKiBAYXV0aG9yIHNhaGFyYW5cbiAgICogQGF1dGhvciBsby10aFxuICAgKi9cblxuICBmdW5jdGlvbiBBQUJCKG1pblgsIG1heFgsIG1pblksIG1heFksIG1pblosIG1heFopIHtcblxuICAgIHRoaXMuZWxlbWVudHMgPSBuZXcgRmxvYXQzMkFycmF5KDYpO1xuICAgIHZhciB0ZSA9IHRoaXMuZWxlbWVudHM7XG5cbiAgICB0ZVswXSA9IG1pblggfHwgMDsgdGVbMV0gPSBtaW5ZIHx8IDA7IHRlWzJdID0gbWluWiB8fCAwO1xuICAgIHRlWzNdID0gbWF4WCB8fCAwOyB0ZVs0XSA9IG1heFkgfHwgMDsgdGVbNV0gPSBtYXhaIHx8IDA7XG5cbiAgfVxuICBPYmplY3QuYXNzaWduKEFBQkIucHJvdG90eXBlLCB7XG5cbiAgICBBQUJCOiB0cnVlLFxuXG4gICAgc2V0OiBmdW5jdGlvbiAobWluWCwgbWF4WCwgbWluWSwgbWF4WSwgbWluWiwgbWF4Wikge1xuXG4gICAgICB2YXIgdGUgPSB0aGlzLmVsZW1lbnRzO1xuICAgICAgdGVbMF0gPSBtaW5YO1xuICAgICAgdGVbM10gPSBtYXhYO1xuICAgICAgdGVbMV0gPSBtaW5ZO1xuICAgICAgdGVbNF0gPSBtYXhZO1xuICAgICAgdGVbMl0gPSBtaW5aO1xuICAgICAgdGVbNV0gPSBtYXhaO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIGludGVyc2VjdFRlc3Q6IGZ1bmN0aW9uIChhYWJiKSB7XG5cbiAgICAgIHZhciB0ZSA9IHRoaXMuZWxlbWVudHM7XG4gICAgICB2YXIgdWUgPSBhYWJiLmVsZW1lbnRzO1xuICAgICAgcmV0dXJuIHRlWzBdID4gdWVbM10gfHwgdGVbMV0gPiB1ZVs0XSB8fCB0ZVsyXSA+IHVlWzVdIHx8IHRlWzNdIDwgdWVbMF0gfHwgdGVbNF0gPCB1ZVsxXSB8fCB0ZVs1XSA8IHVlWzJdID8gdHJ1ZSA6IGZhbHNlO1xuXG4gICAgfSxcblxuICAgIGludGVyc2VjdFRlc3RUd286IGZ1bmN0aW9uIChhYWJiKSB7XG5cbiAgICAgIHZhciB0ZSA9IHRoaXMuZWxlbWVudHM7XG4gICAgICB2YXIgdWUgPSBhYWJiLmVsZW1lbnRzO1xuICAgICAgcmV0dXJuIHRlWzBdIDwgdWVbMF0gfHwgdGVbMV0gPCB1ZVsxXSB8fCB0ZVsyXSA8IHVlWzJdIHx8IHRlWzNdID4gdWVbM10gfHwgdGVbNF0gPiB1ZVs0XSB8fCB0ZVs1XSA+IHVlWzVdID8gdHJ1ZSA6IGZhbHNlO1xuXG4gICAgfSxcblxuICAgIGNsb25lOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHJldHVybiBuZXcgdGhpcy5jb25zdHJ1Y3RvcigpLmZyb21BcnJheSh0aGlzLmVsZW1lbnRzKTtcblxuICAgIH0sXG5cbiAgICBjb3B5OiBmdW5jdGlvbiAoYWFiYiwgbWFyZ2luKSB7XG5cbiAgICAgIHZhciBtID0gbWFyZ2luIHx8IDA7XG4gICAgICB2YXIgbWUgPSBhYWJiLmVsZW1lbnRzO1xuICAgICAgdGhpcy5zZXQobWVbMF0gLSBtLCBtZVszXSArIG0sIG1lWzFdIC0gbSwgbWVbNF0gKyBtLCBtZVsyXSAtIG0sIG1lWzVdICsgbSk7XG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIH0sXG5cbiAgICBmcm9tQXJyYXk6IGZ1bmN0aW9uIChhcnJheSkge1xuXG4gICAgICB0aGlzLmVsZW1lbnRzLnNldChhcnJheSk7XG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIH0sXG5cbiAgICAvLyBTZXQgdGhpcyBBQUJCIHRvIHRoZSBjb21iaW5lZCBBQUJCIG9mIGFhYmIxIGFuZCBhYWJiMi5cblxuICAgIGNvbWJpbmU6IGZ1bmN0aW9uIChhYWJiMSwgYWFiYjIpIHtcblxuICAgICAgdmFyIGEgPSBhYWJiMS5lbGVtZW50cztcbiAgICAgIHZhciBiID0gYWFiYjIuZWxlbWVudHM7XG4gICAgICB2YXIgdGUgPSB0aGlzLmVsZW1lbnRzO1xuXG4gICAgICB0ZVswXSA9IGFbMF0gPCBiWzBdID8gYVswXSA6IGJbMF07XG4gICAgICB0ZVsxXSA9IGFbMV0gPCBiWzFdID8gYVsxXSA6IGJbMV07XG4gICAgICB0ZVsyXSA9IGFbMl0gPCBiWzJdID8gYVsyXSA6IGJbMl07XG5cbiAgICAgIHRlWzNdID0gYVszXSA+IGJbM10gPyBhWzNdIDogYlszXTtcbiAgICAgIHRlWzRdID0gYVs0XSA+IGJbNF0gPyBhWzRdIDogYls0XTtcbiAgICAgIHRlWzVdID0gYVs1XSA+IGJbNV0gPyBhWzVdIDogYls1XTtcblxuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICB9LFxuXG5cbiAgICAvLyBHZXQgdGhlIHN1cmZhY2UgYXJlYS5cblxuICAgIHN1cmZhY2VBcmVhOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHZhciB0ZSA9IHRoaXMuZWxlbWVudHM7XG4gICAgICB2YXIgYSA9IHRlWzNdIC0gdGVbMF07XG4gICAgICB2YXIgaCA9IHRlWzRdIC0gdGVbMV07XG4gICAgICB2YXIgZCA9IHRlWzVdIC0gdGVbMl07XG4gICAgICByZXR1cm4gMiAqIChhICogKGggKyBkKSArIGggKiBkKTtcblxuICAgIH0sXG5cblxuICAgIC8vIEdldCB3aGV0aGVyIHRoZSBBQUJCIGludGVyc2VjdHMgd2l0aCB0aGUgcG9pbnQgb3Igbm90LlxuXG4gICAgaW50ZXJzZWN0c1dpdGhQb2ludDogZnVuY3Rpb24gKHgsIHksIHopIHtcblxuICAgICAgdmFyIHRlID0gdGhpcy5lbGVtZW50cztcbiAgICAgIHJldHVybiB4ID49IHRlWzBdICYmIHggPD0gdGVbM10gJiYgeSA+PSB0ZVsxXSAmJiB5IDw9IHRlWzRdICYmIHogPj0gdGVbMl0gJiYgeiA8PSB0ZVs1XTtcblxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgdGhlIEFBQkIgZnJvbSBhbiBhcnJheVxuICAgICAqIG9mIHZlcnRpY2VzLiBGcm9tIFRIUkVFLlxuICAgICAqIEBhdXRob3IgV2VzdExhbmdsZXlcbiAgICAgKiBAYXV0aG9yIHhwcm9ncmFtXG4gICAgICovXG5cbiAgICBzZXRGcm9tUG9pbnRzOiBmdW5jdGlvbiAoYXJyKSB7XG4gICAgICB0aGlzLm1ha2VFbXB0eSgpO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdGhpcy5leHBhbmRCeVBvaW50KGFycltpXSk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIG1ha2VFbXB0eTogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5zZXQoLUluZmluaXR5LCAtSW5maW5pdHksIC1JbmZpbml0eSwgSW5maW5pdHksIEluZmluaXR5LCBJbmZpbml0eSk7XG4gICAgfSxcblxuICAgIGV4cGFuZEJ5UG9pbnQ6IGZ1bmN0aW9uIChwdCkge1xuICAgICAgdmFyIHRlID0gdGhpcy5lbGVtZW50cztcbiAgICAgIHRoaXMuc2V0KFxuICAgICAgICBfTWF0aC5taW4odGVbMF0sIHB0LngpLCBfTWF0aC5taW4odGVbMV0sIHB0LnkpLCBfTWF0aC5taW4odGVbMl0sIHB0LnopLFxuICAgICAgICBfTWF0aC5tYXgodGVbM10sIHB0LngpLCBfTWF0aC5tYXgodGVbNF0sIHB0LnkpLCBfTWF0aC5tYXgodGVbNV0sIHB0LnopXG4gICAgICApO1xuICAgIH0sXG5cbiAgICBleHBhbmRCeVNjYWxhcjogZnVuY3Rpb24gKHMpIHtcblxuICAgICAgdmFyIHRlID0gdGhpcy5lbGVtZW50cztcbiAgICAgIHRlWzBdICs9IC1zO1xuICAgICAgdGVbMV0gKz0gLXM7XG4gICAgICB0ZVsyXSArPSAtcztcbiAgICAgIHRlWzNdICs9IHM7XG4gICAgICB0ZVs0XSArPSBzO1xuICAgICAgdGVbNV0gKz0gcztcbiAgICB9XG5cbiAgfSk7XG5cbiAgdmFyIGNvdW50ID0gMDtcbiAgZnVuY3Rpb24gU2hhcGVJZENvdW50KCkgeyByZXR1cm4gY291bnQrKzsgfVxuXG4gIC8qKlxuICAgKiBBIHNoYXBlIGlzIHVzZWQgdG8gZGV0ZWN0IGNvbGxpc2lvbnMgb2YgcmlnaWQgYm9kaWVzLlxuICAgKlxuICAgKiBAYXV0aG9yIHNhaGFyYW5cbiAgICogQGF1dGhvciBsby10aFxuICAgKi9cblxuICBmdW5jdGlvbiBTaGFwZShjb25maWcpIHtcblxuICAgIHRoaXMudHlwZSA9IFNIQVBFX05VTEw7XG5cbiAgICAvLyBnbG9iYWwgaWRlbnRpZmljYXRpb24gb2YgdGhlIHNoYXBlIHNob3VsZCBiZSB1bmlxdWUgdG8gdGhlIHNoYXBlLlxuICAgIHRoaXMuaWQgPSBTaGFwZUlkQ291bnQoKTtcblxuICAgIC8vIHByZXZpb3VzIHNoYXBlIGluIHBhcmVudCByaWdpZCBib2R5LiBVc2VkIGZvciBmYXN0IGludGVyYXRpb25zLlxuICAgIHRoaXMucHJldiA9IG51bGw7XG5cbiAgICAvLyBuZXh0IHNoYXBlIGluIHBhcmVudCByaWdpZCBib2R5LiBVc2VkIGZvciBmYXN0IGludGVyYXRpb25zLlxuICAgIHRoaXMubmV4dCA9IG51bGw7XG5cbiAgICAvLyBwcm94eSBvZiB0aGUgc2hhcGUgdXNlZCBmb3IgYnJvYWQtcGhhc2UgY29sbGlzaW9uIGRldGVjdGlvbi5cbiAgICB0aGlzLnByb3h5ID0gbnVsbDtcblxuICAgIC8vIHBhcmVudCByaWdpZCBib2R5IG9mIHRoZSBzaGFwZS5cbiAgICB0aGlzLnBhcmVudCA9IG51bGw7XG5cbiAgICAvLyBsaW5rZWQgbGlzdCBvZiB0aGUgY29udGFjdHMgd2l0aCB0aGUgc2hhcGUuXG4gICAgdGhpcy5jb250YWN0TGluayA9IG51bGw7XG5cbiAgICAvLyBudW1iZXIgb2YgdGhlIGNvbnRhY3RzIHdpdGggdGhlIHNoYXBlLlxuICAgIHRoaXMubnVtQ29udGFjdHMgPSAwO1xuXG4gICAgLy8gY2VudGVyIG9mIGdyYXZpdHkgb2YgdGhlIHNoYXBlIGluIHdvcmxkIGNvb3JkaW5hdGUgc3lzdGVtLlxuICAgIHRoaXMucG9zaXRpb24gPSBuZXcgVmVjMygpO1xuXG4gICAgLy8gcm90YXRpb24gbWF0cml4IG9mIHRoZSBzaGFwZSBpbiB3b3JsZCBjb29yZGluYXRlIHN5c3RlbS5cbiAgICB0aGlzLnJvdGF0aW9uID0gbmV3IE1hdDMzKCk7XG5cbiAgICAvLyBwb3NpdGlvbiBvZiB0aGUgc2hhcGUgaW4gcGFyZW50J3MgY29vcmRpbmF0ZSBzeXN0ZW0uXG4gICAgdGhpcy5yZWxhdGl2ZVBvc2l0aW9uID0gbmV3IFZlYzMoKS5jb3B5KGNvbmZpZy5yZWxhdGl2ZVBvc2l0aW9uKTtcblxuICAgIC8vIHJvdGF0aW9uIG1hdHJpeCBvZiB0aGUgc2hhcGUgaW4gcGFyZW50J3MgY29vcmRpbmF0ZSBzeXN0ZW0uXG4gICAgdGhpcy5yZWxhdGl2ZVJvdGF0aW9uID0gbmV3IE1hdDMzKCkuY29weShjb25maWcucmVsYXRpdmVSb3RhdGlvbik7XG5cbiAgICAvLyBheGlzLWFsaWduZWQgYm91bmRpbmcgYm94IG9mIHRoZSBzaGFwZS5cbiAgICB0aGlzLmFhYmIgPSBuZXcgQUFCQigpO1xuXG4gICAgLy8gZGVuc2l0eSBvZiB0aGUgc2hhcGUuXG4gICAgdGhpcy5kZW5zaXR5ID0gY29uZmlnLmRlbnNpdHk7XG5cbiAgICAvLyBjb2VmZmljaWVudCBvZiBmcmljdGlvbiBvZiB0aGUgc2hhcGUuXG4gICAgdGhpcy5mcmljdGlvbiA9IGNvbmZpZy5mcmljdGlvbjtcblxuICAgIC8vIGNvZWZmaWNpZW50IG9mIHJlc3RpdHV0aW9uIG9mIHRoZSBzaGFwZS5cbiAgICB0aGlzLnJlc3RpdHV0aW9uID0gY29uZmlnLnJlc3RpdHV0aW9uO1xuXG4gICAgLy8gYml0cyBvZiB0aGUgY29sbGlzaW9uIGdyb3VwcyB0byB3aGljaCB0aGUgc2hhcGUgYmVsb25ncy5cbiAgICB0aGlzLmJlbG9uZ3NUbyA9IGNvbmZpZy5iZWxvbmdzVG87XG5cbiAgICAvLyBiaXRzIG9mIHRoZSBjb2xsaXNpb24gZ3JvdXBzIHdpdGggd2hpY2ggdGhlIHNoYXBlIGNvbGxpZGVzLlxuICAgIHRoaXMuY29sbGlkZXNXaXRoID0gY29uZmlnLmNvbGxpZGVzV2l0aDtcblxuICB9XG4gIE9iamVjdC5hc3NpZ24oU2hhcGUucHJvdG90eXBlLCB7XG5cbiAgICBTaGFwZTogdHJ1ZSxcblxuICAgIC8vIENhbGN1bGF0ZSB0aGUgbWFzcyBpbmZvcm1hdGlvbiBvZiB0aGUgc2hhcGUuXG5cbiAgICBjYWxjdWxhdGVNYXNzSW5mbzogZnVuY3Rpb24gKG91dCkge1xuXG4gICAgICBwcmludEVycm9yKFwiU2hhcGVcIiwgXCJJbmhlcml0YW5jZSBlcnJvci5cIik7XG5cbiAgICB9LFxuXG4gICAgLy8gVXBkYXRlIHRoZSBwcm94eSBvZiB0aGUgc2hhcGUuXG5cbiAgICB1cGRhdGVQcm94eTogZnVuY3Rpb24gKCkge1xuXG4gICAgICBwcmludEVycm9yKFwiU2hhcGVcIiwgXCJJbmhlcml0YW5jZSBlcnJvci5cIik7XG5cbiAgICB9XG5cbiAgfSk7XG5cbiAgLyoqXG4gICAqIEJveCBzaGFwZS5cbiAgICogQGF1dGhvciBzYWhhcmFuXG4gICAqIEBhdXRob3IgbG8tdGhcbiAgICovXG5cbiAgZnVuY3Rpb24gQm94KGNvbmZpZywgV2lkdGgsIEhlaWdodCwgRGVwdGgpIHtcblxuICAgIFNoYXBlLmNhbGwodGhpcywgY29uZmlnKTtcblxuICAgIHRoaXMudHlwZSA9IFNIQVBFX0JPWDtcblxuICAgIHRoaXMud2lkdGggPSBXaWR0aDtcbiAgICB0aGlzLmhlaWdodCA9IEhlaWdodDtcbiAgICB0aGlzLmRlcHRoID0gRGVwdGg7XG5cbiAgICB0aGlzLmhhbGZXaWR0aCA9IFdpZHRoICogMC41O1xuICAgIHRoaXMuaGFsZkhlaWdodCA9IEhlaWdodCAqIDAuNTtcbiAgICB0aGlzLmhhbGZEZXB0aCA9IERlcHRoICogMC41O1xuXG4gICAgdGhpcy5kaW1lbnRpb25zID0gbmV3IEZsb2F0MzJBcnJheSgxOCk7XG4gICAgdGhpcy5lbGVtZW50cyA9IG5ldyBGbG9hdDMyQXJyYXkoMjQpO1xuXG4gIH1cbiAgQm94LnByb3RvdHlwZSA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmNyZWF0ZShTaGFwZS5wcm90b3R5cGUpLCB7XG5cbiAgICBjb25zdHJ1Y3RvcjogQm94LFxuXG4gICAgY2FsY3VsYXRlTWFzc0luZm86IGZ1bmN0aW9uIChvdXQpIHtcblxuICAgICAgdmFyIG1hc3MgPSB0aGlzLndpZHRoICogdGhpcy5oZWlnaHQgKiB0aGlzLmRlcHRoICogdGhpcy5kZW5zaXR5O1xuICAgICAgdmFyIGRpdmlkID0gMSAvIDEyO1xuICAgICAgb3V0Lm1hc3MgPSBtYXNzO1xuICAgICAgb3V0LmluZXJ0aWEuc2V0KFxuICAgICAgICBtYXNzICogKHRoaXMuaGVpZ2h0ICogdGhpcy5oZWlnaHQgKyB0aGlzLmRlcHRoICogdGhpcy5kZXB0aCkgKiBkaXZpZCwgMCwgMCxcbiAgICAgICAgMCwgbWFzcyAqICh0aGlzLndpZHRoICogdGhpcy53aWR0aCArIHRoaXMuZGVwdGggKiB0aGlzLmRlcHRoKSAqIGRpdmlkLCAwLFxuICAgICAgICAwLCAwLCBtYXNzICogKHRoaXMud2lkdGggKiB0aGlzLndpZHRoICsgdGhpcy5oZWlnaHQgKiB0aGlzLmhlaWdodCkgKiBkaXZpZFxuICAgICAgKTtcblxuICAgIH0sXG5cbiAgICB1cGRhdGVQcm94eTogZnVuY3Rpb24gKCkge1xuXG4gICAgICB2YXIgdGUgPSB0aGlzLnJvdGF0aW9uLmVsZW1lbnRzO1xuICAgICAgdmFyIGRpID0gdGhpcy5kaW1lbnRpb25zO1xuICAgICAgLy8gV2lkdGhcbiAgICAgIGRpWzBdID0gdGVbMF07XG4gICAgICBkaVsxXSA9IHRlWzNdO1xuICAgICAgZGlbMl0gPSB0ZVs2XTtcbiAgICAgIC8vIEhlaWdodFxuICAgICAgZGlbM10gPSB0ZVsxXTtcbiAgICAgIGRpWzRdID0gdGVbNF07XG4gICAgICBkaVs1XSA9IHRlWzddO1xuICAgICAgLy8gRGVwdGhcbiAgICAgIGRpWzZdID0gdGVbMl07XG4gICAgICBkaVs3XSA9IHRlWzVdO1xuICAgICAgZGlbOF0gPSB0ZVs4XTtcbiAgICAgIC8vIGhhbGYgV2lkdGhcbiAgICAgIGRpWzldID0gdGVbMF0gKiB0aGlzLmhhbGZXaWR0aDtcbiAgICAgIGRpWzEwXSA9IHRlWzNdICogdGhpcy5oYWxmV2lkdGg7XG4gICAgICBkaVsxMV0gPSB0ZVs2XSAqIHRoaXMuaGFsZldpZHRoO1xuICAgICAgLy8gaGFsZiBIZWlnaHRcbiAgICAgIGRpWzEyXSA9IHRlWzFdICogdGhpcy5oYWxmSGVpZ2h0O1xuICAgICAgZGlbMTNdID0gdGVbNF0gKiB0aGlzLmhhbGZIZWlnaHQ7XG4gICAgICBkaVsxNF0gPSB0ZVs3XSAqIHRoaXMuaGFsZkhlaWdodDtcbiAgICAgIC8vIGhhbGYgRGVwdGhcbiAgICAgIGRpWzE1XSA9IHRlWzJdICogdGhpcy5oYWxmRGVwdGg7XG4gICAgICBkaVsxNl0gPSB0ZVs1XSAqIHRoaXMuaGFsZkRlcHRoO1xuICAgICAgZGlbMTddID0gdGVbOF0gKiB0aGlzLmhhbGZEZXB0aDtcblxuICAgICAgdmFyIHd4ID0gZGlbOV07XG4gICAgICB2YXIgd3kgPSBkaVsxMF07XG4gICAgICB2YXIgd3ogPSBkaVsxMV07XG4gICAgICB2YXIgaHggPSBkaVsxMl07XG4gICAgICB2YXIgaHkgPSBkaVsxM107XG4gICAgICB2YXIgaHogPSBkaVsxNF07XG4gICAgICB2YXIgZHggPSBkaVsxNV07XG4gICAgICB2YXIgZHkgPSBkaVsxNl07XG4gICAgICB2YXIgZHogPSBkaVsxN107XG5cbiAgICAgIHZhciB4ID0gdGhpcy5wb3NpdGlvbi54O1xuICAgICAgdmFyIHkgPSB0aGlzLnBvc2l0aW9uLnk7XG4gICAgICB2YXIgeiA9IHRoaXMucG9zaXRpb24uejtcblxuICAgICAgdmFyIHYgPSB0aGlzLmVsZW1lbnRzO1xuICAgICAgLy92MVxuICAgICAgdlswXSA9IHggKyB3eCArIGh4ICsgZHg7XG4gICAgICB2WzFdID0geSArIHd5ICsgaHkgKyBkeTtcbiAgICAgIHZbMl0gPSB6ICsgd3ogKyBoeiArIGR6O1xuICAgICAgLy92MlxuICAgICAgdlszXSA9IHggKyB3eCArIGh4IC0gZHg7XG4gICAgICB2WzRdID0geSArIHd5ICsgaHkgLSBkeTtcbiAgICAgIHZbNV0gPSB6ICsgd3ogKyBoeiAtIGR6O1xuICAgICAgLy92M1xuICAgICAgdls2XSA9IHggKyB3eCAtIGh4ICsgZHg7XG4gICAgICB2WzddID0geSArIHd5IC0gaHkgKyBkeTtcbiAgICAgIHZbOF0gPSB6ICsgd3ogLSBoeiArIGR6O1xuICAgICAgLy92NFxuICAgICAgdls5XSA9IHggKyB3eCAtIGh4IC0gZHg7XG4gICAgICB2WzEwXSA9IHkgKyB3eSAtIGh5IC0gZHk7XG4gICAgICB2WzExXSA9IHogKyB3eiAtIGh6IC0gZHo7XG4gICAgICAvL3Y1XG4gICAgICB2WzEyXSA9IHggLSB3eCArIGh4ICsgZHg7XG4gICAgICB2WzEzXSA9IHkgLSB3eSArIGh5ICsgZHk7XG4gICAgICB2WzE0XSA9IHogLSB3eiArIGh6ICsgZHo7XG4gICAgICAvL3Y2XG4gICAgICB2WzE1XSA9IHggLSB3eCArIGh4IC0gZHg7XG4gICAgICB2WzE2XSA9IHkgLSB3eSArIGh5IC0gZHk7XG4gICAgICB2WzE3XSA9IHogLSB3eiArIGh6IC0gZHo7XG4gICAgICAvL3Y3XG4gICAgICB2WzE4XSA9IHggLSB3eCAtIGh4ICsgZHg7XG4gICAgICB2WzE5XSA9IHkgLSB3eSAtIGh5ICsgZHk7XG4gICAgICB2WzIwXSA9IHogLSB3eiAtIGh6ICsgZHo7XG4gICAgICAvL3Y4XG4gICAgICB2WzIxXSA9IHggLSB3eCAtIGh4IC0gZHg7XG4gICAgICB2WzIyXSA9IHkgLSB3eSAtIGh5IC0gZHk7XG4gICAgICB2WzIzXSA9IHogLSB3eiAtIGh6IC0gZHo7XG5cbiAgICAgIHZhciB3ID0gZGlbOV0gPCAwID8gLWRpWzldIDogZGlbOV07XG4gICAgICB2YXIgaCA9IGRpWzEwXSA8IDAgPyAtZGlbMTBdIDogZGlbMTBdO1xuICAgICAgdmFyIGQgPSBkaVsxMV0gPCAwID8gLWRpWzExXSA6IGRpWzExXTtcblxuICAgICAgdyA9IGRpWzEyXSA8IDAgPyB3IC0gZGlbMTJdIDogdyArIGRpWzEyXTtcbiAgICAgIGggPSBkaVsxM10gPCAwID8gaCAtIGRpWzEzXSA6IGggKyBkaVsxM107XG4gICAgICBkID0gZGlbMTRdIDwgMCA/IGQgLSBkaVsxNF0gOiBkICsgZGlbMTRdO1xuXG4gICAgICB3ID0gZGlbMTVdIDwgMCA/IHcgLSBkaVsxNV0gOiB3ICsgZGlbMTVdO1xuICAgICAgaCA9IGRpWzE2XSA8IDAgPyBoIC0gZGlbMTZdIDogaCArIGRpWzE2XTtcbiAgICAgIGQgPSBkaVsxN10gPCAwID8gZCAtIGRpWzE3XSA6IGQgKyBkaVsxN107XG5cbiAgICAgIHZhciBwID0gQUFCQl9QUk9YO1xuXG4gICAgICB0aGlzLmFhYmIuc2V0KFxuICAgICAgICB0aGlzLnBvc2l0aW9uLnggLSB3IC0gcCwgdGhpcy5wb3NpdGlvbi54ICsgdyArIHAsXG4gICAgICAgIHRoaXMucG9zaXRpb24ueSAtIGggLSBwLCB0aGlzLnBvc2l0aW9uLnkgKyBoICsgcCxcbiAgICAgICAgdGhpcy5wb3NpdGlvbi56IC0gZCAtIHAsIHRoaXMucG9zaXRpb24ueiArIGQgKyBwXG4gICAgICApO1xuXG4gICAgICBpZiAodGhpcy5wcm94eSAhPSBudWxsKSB0aGlzLnByb3h5LnVwZGF0ZSgpO1xuXG4gICAgfVxuICB9KTtcblxuICAvKipcbiAgICogU3BoZXJlIHNoYXBlXG4gICAqIEBhdXRob3Igc2FoYXJhblxuICAgKiBAYXV0aG9yIGxvLXRoXG4gICAqL1xuXG4gIGZ1bmN0aW9uIFNwaGVyZShjb25maWcsIHJhZGl1cykge1xuXG4gICAgU2hhcGUuY2FsbCh0aGlzLCBjb25maWcpO1xuXG4gICAgdGhpcy50eXBlID0gU0hBUEVfU1BIRVJFO1xuXG4gICAgLy8gcmFkaXVzIG9mIHRoZSBzaGFwZS5cbiAgICB0aGlzLnJhZGl1cyA9IHJhZGl1cztcblxuICB9XG4gIFNwaGVyZS5wcm90b3R5cGUgPSBPYmplY3QuYXNzaWduKE9iamVjdC5jcmVhdGUoU2hhcGUucHJvdG90eXBlKSwge1xuXG4gICAgY29uc3RydWN0b3I6IFNwaGVyZSxcblxuICAgIHZvbHVtZTogZnVuY3Rpb24gKCkge1xuXG4gICAgICByZXR1cm4gX01hdGguUEkgKiB0aGlzLnJhZGl1cyAqIDEuMzMzMzMzO1xuXG4gICAgfSxcblxuICAgIGNhbGN1bGF0ZU1hc3NJbmZvOiBmdW5jdGlvbiAob3V0KSB7XG5cbiAgICAgIHZhciBtYXNzID0gdGhpcy52b2x1bWUoKSAqIHRoaXMucmFkaXVzICogdGhpcy5yYWRpdXMgKiB0aGlzLmRlbnNpdHk7IC8vMS4zMzMgKiBfTWF0aC5QSSAqIHRoaXMucmFkaXVzICogdGhpcy5yYWRpdXMgKiB0aGlzLnJhZGl1cyAqIHRoaXMuZGVuc2l0eTtcbiAgICAgIG91dC5tYXNzID0gbWFzcztcbiAgICAgIHZhciBpbmVydGlhID0gbWFzcyAqIHRoaXMucmFkaXVzICogdGhpcy5yYWRpdXMgKiAwLjQ7XG4gICAgICBvdXQuaW5lcnRpYS5zZXQoaW5lcnRpYSwgMCwgMCwgMCwgaW5lcnRpYSwgMCwgMCwgMCwgaW5lcnRpYSk7XG5cbiAgICB9LFxuXG4gICAgdXBkYXRlUHJveHk6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgdmFyIHAgPSBBQUJCX1BST1g7XG5cbiAgICAgIHRoaXMuYWFiYi5zZXQoXG4gICAgICAgIHRoaXMucG9zaXRpb24ueCAtIHRoaXMucmFkaXVzIC0gcCwgdGhpcy5wb3NpdGlvbi54ICsgdGhpcy5yYWRpdXMgKyBwLFxuICAgICAgICB0aGlzLnBvc2l0aW9uLnkgLSB0aGlzLnJhZGl1cyAtIHAsIHRoaXMucG9zaXRpb24ueSArIHRoaXMucmFkaXVzICsgcCxcbiAgICAgICAgdGhpcy5wb3NpdGlvbi56IC0gdGhpcy5yYWRpdXMgLSBwLCB0aGlzLnBvc2l0aW9uLnogKyB0aGlzLnJhZGl1cyArIHBcbiAgICAgICk7XG5cbiAgICAgIGlmICh0aGlzLnByb3h5ICE9IG51bGwpIHRoaXMucHJveHkudXBkYXRlKCk7XG5cbiAgICB9XG5cbiAgfSk7XG5cbiAgLyoqXG4gICAqIEN5bGluZGVyIHNoYXBlXG4gICAqIEBhdXRob3Igc2FoYXJhblxuICAgKiBAYXV0aG9yIGxvLXRoXG4gICAqL1xuXG4gIGZ1bmN0aW9uIEN5bGluZGVyKGNvbmZpZywgcmFkaXVzLCBoZWlnaHQpIHtcblxuICAgIFNoYXBlLmNhbGwodGhpcywgY29uZmlnKTtcblxuICAgIHRoaXMudHlwZSA9IFNIQVBFX0NZTElOREVSO1xuXG4gICAgdGhpcy5yYWRpdXMgPSByYWRpdXM7XG4gICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgdGhpcy5oYWxmSGVpZ2h0ID0gaGVpZ2h0ICogMC41O1xuXG4gICAgdGhpcy5ub3JtYWxEaXJlY3Rpb24gPSBuZXcgVmVjMygpO1xuICAgIHRoaXMuaGFsZkRpcmVjdGlvbiA9IG5ldyBWZWMzKCk7XG5cbiAgfVxuICBDeWxpbmRlci5wcm90b3R5cGUgPSBPYmplY3QuYXNzaWduKE9iamVjdC5jcmVhdGUoU2hhcGUucHJvdG90eXBlKSwge1xuXG4gICAgY29uc3RydWN0b3I6IEN5bGluZGVyLFxuXG4gICAgY2FsY3VsYXRlTWFzc0luZm86IGZ1bmN0aW9uIChvdXQpIHtcblxuICAgICAgdmFyIHJzcSA9IHRoaXMucmFkaXVzICogdGhpcy5yYWRpdXM7XG4gICAgICB2YXIgbWFzcyA9IF9NYXRoLlBJICogcnNxICogdGhpcy5oZWlnaHQgKiB0aGlzLmRlbnNpdHk7XG4gICAgICB2YXIgaW5lcnRpYVhaID0gKCgwLjI1ICogcnNxKSArICgwLjA4MzMgKiB0aGlzLmhlaWdodCAqIHRoaXMuaGVpZ2h0KSkgKiBtYXNzO1xuICAgICAgdmFyIGluZXJ0aWFZID0gMC41ICogcnNxO1xuICAgICAgb3V0Lm1hc3MgPSBtYXNzO1xuICAgICAgb3V0LmluZXJ0aWEuc2V0KGluZXJ0aWFYWiwgMCwgMCwgMCwgaW5lcnRpYVksIDAsIDAsIDAsIGluZXJ0aWFYWik7XG5cbiAgICB9LFxuXG4gICAgdXBkYXRlUHJveHk6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgdmFyIHRlID0gdGhpcy5yb3RhdGlvbi5lbGVtZW50cztcbiAgICAgIHZhciBsZW4sIHd4LCBoeSwgZHosIHh4LCB5eSwgenosIHcsIGgsIGQsIHA7XG5cbiAgICAgIHh4ID0gdGVbMV0gKiB0ZVsxXTtcbiAgICAgIHl5ID0gdGVbNF0gKiB0ZVs0XTtcbiAgICAgIHp6ID0gdGVbN10gKiB0ZVs3XTtcblxuICAgICAgdGhpcy5ub3JtYWxEaXJlY3Rpb24uc2V0KHRlWzFdLCB0ZVs0XSwgdGVbN10pO1xuICAgICAgdGhpcy5oYWxmRGlyZWN0aW9uLnNjYWxlKHRoaXMubm9ybWFsRGlyZWN0aW9uLCB0aGlzLmhhbGZIZWlnaHQpO1xuXG4gICAgICB3eCA9IDEgLSB4eDtcbiAgICAgIGxlbiA9IF9NYXRoLnNxcnQod3ggKiB3eCArIHh4ICogeXkgKyB4eCAqIHp6KTtcbiAgICAgIGlmIChsZW4gPiAwKSBsZW4gPSB0aGlzLnJhZGl1cyAvIGxlbjtcbiAgICAgIHd4ICo9IGxlbjtcbiAgICAgIGh5ID0gMSAtIHl5O1xuICAgICAgbGVuID0gX01hdGguc3FydCh5eSAqIHh4ICsgaHkgKiBoeSArIHl5ICogenopO1xuICAgICAgaWYgKGxlbiA+IDApIGxlbiA9IHRoaXMucmFkaXVzIC8gbGVuO1xuICAgICAgaHkgKj0gbGVuO1xuICAgICAgZHogPSAxIC0geno7XG4gICAgICBsZW4gPSBfTWF0aC5zcXJ0KHp6ICogeHggKyB6eiAqIHl5ICsgZHogKiBkeik7XG4gICAgICBpZiAobGVuID4gMCkgbGVuID0gdGhpcy5yYWRpdXMgLyBsZW47XG4gICAgICBkeiAqPSBsZW47XG5cbiAgICAgIHcgPSB0aGlzLmhhbGZEaXJlY3Rpb24ueCA8IDAgPyAtdGhpcy5oYWxmRGlyZWN0aW9uLnggOiB0aGlzLmhhbGZEaXJlY3Rpb24ueDtcbiAgICAgIGggPSB0aGlzLmhhbGZEaXJlY3Rpb24ueSA8IDAgPyAtdGhpcy5oYWxmRGlyZWN0aW9uLnkgOiB0aGlzLmhhbGZEaXJlY3Rpb24ueTtcbiAgICAgIGQgPSB0aGlzLmhhbGZEaXJlY3Rpb24ueiA8IDAgPyAtdGhpcy5oYWxmRGlyZWN0aW9uLnogOiB0aGlzLmhhbGZEaXJlY3Rpb24uejtcblxuICAgICAgdyA9IHd4IDwgMCA/IHcgLSB3eCA6IHcgKyB3eDtcbiAgICAgIGggPSBoeSA8IDAgPyBoIC0gaHkgOiBoICsgaHk7XG4gICAgICBkID0gZHogPCAwID8gZCAtIGR6IDogZCArIGR6O1xuXG4gICAgICBwID0gQUFCQl9QUk9YO1xuXG4gICAgICB0aGlzLmFhYmIuc2V0KFxuICAgICAgICB0aGlzLnBvc2l0aW9uLnggLSB3IC0gcCwgdGhpcy5wb3NpdGlvbi54ICsgdyArIHAsXG4gICAgICAgIHRoaXMucG9zaXRpb24ueSAtIGggLSBwLCB0aGlzLnBvc2l0aW9uLnkgKyBoICsgcCxcbiAgICAgICAgdGhpcy5wb3NpdGlvbi56IC0gZCAtIHAsIHRoaXMucG9zaXRpb24ueiArIGQgKyBwXG4gICAgICApO1xuXG4gICAgICBpZiAodGhpcy5wcm94eSAhPSBudWxsKSB0aGlzLnByb3h5LnVwZGF0ZSgpO1xuXG4gICAgfVxuXG4gIH0pO1xuXG4gIC8qKlxuICAgKiBQbGFuZSBzaGFwZS5cbiAgICogQGF1dGhvciBsby10aFxuICAgKi9cblxuICBmdW5jdGlvbiBQbGFuZShjb25maWcsIG5vcm1hbCkge1xuXG4gICAgU2hhcGUuY2FsbCh0aGlzLCBjb25maWcpO1xuXG4gICAgdGhpcy50eXBlID0gU0hBUEVfUExBTkU7XG5cbiAgICAvLyByYWRpdXMgb2YgdGhlIHNoYXBlLlxuICAgIHRoaXMubm9ybWFsID0gbmV3IFZlYzMoMCwgMSwgMCk7XG5cbiAgfVxuICBQbGFuZS5wcm90b3R5cGUgPSBPYmplY3QuYXNzaWduKE9iamVjdC5jcmVhdGUoU2hhcGUucHJvdG90eXBlKSwge1xuXG4gICAgY29uc3RydWN0b3I6IFBsYW5lLFxuXG4gICAgdm9sdW1lOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHJldHVybiBOdW1iZXIuTUFYX1ZBTFVFO1xuXG4gICAgfSxcblxuICAgIGNhbGN1bGF0ZU1hc3NJbmZvOiBmdW5jdGlvbiAob3V0KSB7XG5cbiAgICAgIG91dC5tYXNzID0gdGhpcy5kZW5zaXR5Oy8vMC4wMDAxO1xuICAgICAgdmFyIGluZXJ0aWEgPSAxO1xuICAgICAgb3V0LmluZXJ0aWEuc2V0KGluZXJ0aWEsIDAsIDAsIDAsIGluZXJ0aWEsIDAsIDAsIDAsIGluZXJ0aWEpO1xuXG4gICAgfSxcblxuICAgIHVwZGF0ZVByb3h5OiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHZhciBwID0gQUFCQl9QUk9YO1xuXG4gICAgICB2YXIgbWluID0gLV9NYXRoLklORjtcbiAgICAgIHZhciBtYXggPSBfTWF0aC5JTkY7XG4gICAgICB2YXIgbiA9IHRoaXMubm9ybWFsO1xuICAgICAgLy8gVGhlIHBsYW5lIEFBQkIgaXMgaW5maW5pdGUsIGV4Y2VwdCBpZiB0aGUgbm9ybWFsIGlzIHBvaW50aW5nIGFsb25nIGFueSBheGlzXG4gICAgICB0aGlzLmFhYmIuc2V0KFxuICAgICAgICBuLnggPT09IC0xID8gdGhpcy5wb3NpdGlvbi54IC0gcCA6IG1pbiwgbi54ID09PSAxID8gdGhpcy5wb3NpdGlvbi54ICsgcCA6IG1heCxcbiAgICAgICAgbi55ID09PSAtMSA/IHRoaXMucG9zaXRpb24ueSAtIHAgOiBtaW4sIG4ueSA9PT0gMSA/IHRoaXMucG9zaXRpb24ueSArIHAgOiBtYXgsXG4gICAgICAgIG4ueiA9PT0gLTEgPyB0aGlzLnBvc2l0aW9uLnogLSBwIDogbWluLCBuLnogPT09IDEgPyB0aGlzLnBvc2l0aW9uLnogKyBwIDogbWF4XG4gICAgICApO1xuXG4gICAgICBpZiAodGhpcy5wcm94eSAhPSBudWxsKSB0aGlzLnByb3h5LnVwZGF0ZSgpO1xuXG4gICAgfVxuXG4gIH0pO1xuXG4gIC8qKlxuICAgKiBBIFBhcnRpY3VsZSBzaGFwZVxuICAgKiBAYXV0aG9yIGxvLXRoXG4gICAqL1xuXG4gIGZ1bmN0aW9uIFBhcnRpY2xlKGNvbmZpZywgbm9ybWFsKSB7XG5cbiAgICBTaGFwZS5jYWxsKHRoaXMsIGNvbmZpZyk7XG5cbiAgICB0aGlzLnR5cGUgPSBTSEFQRV9QQVJUSUNMRTtcblxuICB9XG4gIFBhcnRpY2xlLnByb3RvdHlwZSA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmNyZWF0ZShTaGFwZS5wcm90b3R5cGUpLCB7XG5cbiAgICBjb25zdHJ1Y3RvcjogUGFydGljbGUsXG5cbiAgICB2b2x1bWU6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgcmV0dXJuIE51bWJlci5NQVhfVkFMVUU7XG5cbiAgICB9LFxuXG4gICAgY2FsY3VsYXRlTWFzc0luZm86IGZ1bmN0aW9uIChvdXQpIHtcblxuICAgICAgdmFyIGluZXJ0aWEgPSAwO1xuICAgICAgb3V0LmluZXJ0aWEuc2V0KGluZXJ0aWEsIDAsIDAsIDAsIGluZXJ0aWEsIDAsIDAsIDAsIGluZXJ0aWEpO1xuXG4gICAgfSxcblxuICAgIHVwZGF0ZVByb3h5OiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHZhciBwID0gMDsvL0FBQkJfUFJPWDtcblxuICAgICAgdGhpcy5hYWJiLnNldChcbiAgICAgICAgdGhpcy5wb3NpdGlvbi54IC0gcCwgdGhpcy5wb3NpdGlvbi54ICsgcCxcbiAgICAgICAgdGhpcy5wb3NpdGlvbi55IC0gcCwgdGhpcy5wb3NpdGlvbi55ICsgcCxcbiAgICAgICAgdGhpcy5wb3NpdGlvbi56IC0gcCwgdGhpcy5wb3NpdGlvbi56ICsgcFxuICAgICAgKTtcblxuICAgICAgaWYgKHRoaXMucHJveHkgIT0gbnVsbCkgdGhpcy5wcm94eS51cGRhdGUoKTtcblxuICAgIH1cblxuICB9KTtcblxuICAvKipcbiAgICogQSBzaGFwZSBjb25maWd1cmF0aW9uIGhvbGRzIGNvbW1vbiBjb25maWd1cmF0aW9uIGRhdGEgZm9yIGNvbnN0cnVjdGluZyBhIHNoYXBlLlxuICAgKiBUaGVzZSBjb25maWd1cmF0aW9ucyBjYW4gYmUgcmV1c2VkIHNhZmVseS5cbiAgICpcbiAgICogQGF1dGhvciBzYWhhcmFuXG4gICAqIEBhdXRob3IgbG8tdGhcbiAgICovXG5cbiAgZnVuY3Rpb24gU2hhcGVDb25maWcoKSB7XG5cbiAgICAvLyBwb3NpdGlvbiBvZiB0aGUgc2hhcGUgaW4gcGFyZW50J3MgY29vcmRpbmF0ZSBzeXN0ZW0uXG4gICAgdGhpcy5yZWxhdGl2ZVBvc2l0aW9uID0gbmV3IFZlYzMoKTtcbiAgICAvLyByb3RhdGlvbiBtYXRyaXggb2YgdGhlIHNoYXBlIGluIHBhcmVudCdzIGNvb3JkaW5hdGUgc3lzdGVtLlxuICAgIHRoaXMucmVsYXRpdmVSb3RhdGlvbiA9IG5ldyBNYXQzMygpO1xuICAgIC8vIGNvZWZmaWNpZW50IG9mIGZyaWN0aW9uIG9mIHRoZSBzaGFwZS5cbiAgICB0aGlzLmZyaWN0aW9uID0gMC4yOyAvLyAwLjRcbiAgICAvLyBjb2VmZmljaWVudCBvZiByZXN0aXR1dGlvbiBvZiB0aGUgc2hhcGUuXG4gICAgdGhpcy5yZXN0aXR1dGlvbiA9IDAuMjtcbiAgICAvLyBkZW5zaXR5IG9mIHRoZSBzaGFwZS5cbiAgICB0aGlzLmRlbnNpdHkgPSAxO1xuICAgIC8vIGJpdHMgb2YgdGhlIGNvbGxpc2lvbiBncm91cHMgdG8gd2hpY2ggdGhlIHNoYXBlIGJlbG9uZ3MuXG4gICAgdGhpcy5iZWxvbmdzVG8gPSAxO1xuICAgIC8vIGJpdHMgb2YgdGhlIGNvbGxpc2lvbiBncm91cHMgd2l0aCB3aGljaCB0aGUgc2hhcGUgY29sbGlkZXMuXG4gICAgdGhpcy5jb2xsaWRlc1dpdGggPSAweGZmZmZmZmZmO1xuXG4gIH1cblxuICAvKipcbiAgKiBBbiBpbmZvcm1hdGlvbiBvZiBsaW1pdCBhbmQgbW90b3IuXG4gICpcbiAgKiBAYXV0aG9yIHNhaGFyYW5cbiAgKi9cblxuICBmdW5jdGlvbiBMaW1pdE1vdG9yKGF4aXMsIGZpeGVkKSB7XG5cbiAgICBmaXhlZCA9IGZpeGVkIHx8IGZhbHNlO1xuICAgIC8vIFRoZSBheGlzIG9mIHRoZSBjb25zdHJhaW50LlxuICAgIHRoaXMuYXhpcyA9IGF4aXM7XG4gICAgLy8gVGhlIGN1cnJlbnQgYW5nbGUgZm9yIHJvdGF0aW9uYWwgY29uc3RyYWludHMuXG4gICAgdGhpcy5hbmdsZSA9IDA7XG4gICAgLy8gVGhlIGxvd2VyIGxpbWl0LiBTZXQgbG93ZXIgPiB1cHBlciB0byBkaXNhYmxlXG4gICAgdGhpcy5sb3dlckxpbWl0ID0gZml4ZWQgPyAwIDogMTtcblxuICAgIC8vICBUaGUgdXBwZXIgbGltaXQuIFNldCBsb3dlciA+IHVwcGVyIHRvIGRpc2FibGUuXG4gICAgdGhpcy51cHBlckxpbWl0ID0gMDtcbiAgICAvLyBUaGUgdGFyZ2V0IG1vdG9yIHNwZWVkLlxuICAgIHRoaXMubW90b3JTcGVlZCA9IDA7XG4gICAgLy8gVGhlIG1heGltdW0gbW90b3IgZm9yY2Ugb3IgdG9ycXVlLiBTZXQgMCB0byBkaXNhYmxlLlxuICAgIHRoaXMubWF4TW90b3JGb3JjZSA9IDA7XG4gICAgLy8gVGhlIGZyZXF1ZW5jeSBvZiB0aGUgc3ByaW5nLiBTZXQgMCB0byBkaXNhYmxlLlxuICAgIHRoaXMuZnJlcXVlbmN5ID0gMDtcbiAgICAvLyBUaGUgZGFtcGluZyByYXRpbyBvZiB0aGUgc3ByaW5nLiBTZXQgMCBmb3Igbm8gZGFtcGluZywgMSBmb3IgY3JpdGljYWwgZGFtcGluZy5cbiAgICB0aGlzLmRhbXBpbmdSYXRpbyA9IDA7XG5cbiAgfVxuICBPYmplY3QuYXNzaWduKExpbWl0TW90b3IucHJvdG90eXBlLCB7XG5cbiAgICBMaW1pdE1vdG9yOiB0cnVlLFxuXG4gICAgLy8gU2V0IGxpbWl0IGRhdGEgaW50byB0aGlzIGNvbnN0cmFpbnQuXG4gICAgc2V0TGltaXQ6IGZ1bmN0aW9uIChsb3dlckxpbWl0LCB1cHBlckxpbWl0KSB7XG5cbiAgICAgIHRoaXMubG93ZXJMaW1pdCA9IGxvd2VyTGltaXQ7XG4gICAgICB0aGlzLnVwcGVyTGltaXQgPSB1cHBlckxpbWl0O1xuXG4gICAgfSxcblxuICAgIC8vIFNldCBtb3RvciBkYXRhIGludG8gdGhpcyBjb25zdHJhaW50LlxuICAgIHNldE1vdG9yOiBmdW5jdGlvbiAobW90b3JTcGVlZCwgbWF4TW90b3JGb3JjZSkge1xuXG4gICAgICB0aGlzLm1vdG9yU3BlZWQgPSBtb3RvclNwZWVkO1xuICAgICAgdGhpcy5tYXhNb3RvckZvcmNlID0gbWF4TW90b3JGb3JjZTtcblxuICAgIH0sXG5cbiAgICAvLyBTZXQgc3ByaW5nIGRhdGEgaW50byB0aGlzIGNvbnN0cmFpbnQuXG4gICAgc2V0U3ByaW5nOiBmdW5jdGlvbiAoZnJlcXVlbmN5LCBkYW1waW5nUmF0aW8pIHtcblxuICAgICAgdGhpcy5mcmVxdWVuY3kgPSBmcmVxdWVuY3k7XG4gICAgICB0aGlzLmRhbXBpbmdSYXRpbyA9IGRhbXBpbmdSYXRpbztcblxuICAgIH1cblxuICB9KTtcblxuICAvKipcbiAgICogVGhlIGJhc2UgY2xhc3Mgb2YgYWxsIHR5cGUgb2YgdGhlIGNvbnN0cmFpbnRzLlxuICAgKlxuICAgKiBAYXV0aG9yIHNhaGFyYW5cbiAgICogQGF1dGhvciBsby10aFxuICAgKi9cblxuICBmdW5jdGlvbiBDb25zdHJhaW50KCkge1xuXG4gICAgLy8gcGFyZW50IHdvcmxkIG9mIHRoZSBjb25zdHJhaW50LlxuICAgIHRoaXMucGFyZW50ID0gbnVsbDtcblxuICAgIC8vIGZpcnN0IGJvZHkgb2YgdGhlIGNvbnN0cmFpbnQuXG4gICAgdGhpcy5ib2R5MSA9IG51bGw7XG5cbiAgICAvLyBzZWNvbmQgYm9keSBvZiB0aGUgY29uc3RyYWludC5cbiAgICB0aGlzLmJvZHkyID0gbnVsbDtcblxuICAgIC8vIEludGVybmFsXG4gICAgdGhpcy5hZGRlZFRvSXNsYW5kID0gZmFsc2U7XG5cbiAgfVxuXG4gIE9iamVjdC5hc3NpZ24oQ29uc3RyYWludC5wcm90b3R5cGUsIHtcblxuICAgIENvbnN0cmFpbnQ6IHRydWUsXG5cbiAgICAvLyBQcmVwYXJlIGZvciBzb2x2aW5nIHRoZSBjb25zdHJhaW50XG4gICAgcHJlU29sdmU6IGZ1bmN0aW9uICh0aW1lU3RlcCwgaW52VGltZVN0ZXApIHtcblxuICAgICAgcHJpbnRFcnJvcihcIkNvbnN0cmFpbnRcIiwgXCJJbmhlcml0YW5jZSBlcnJvci5cIik7XG5cbiAgICB9LFxuXG4gICAgLy8gU29sdmUgdGhlIGNvbnN0cmFpbnQuIFRoaXMgaXMgdXN1YWxseSBjYWxsZWQgaXRlcmF0aXZlbHkuXG4gICAgc29sdmU6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgcHJpbnRFcnJvcihcIkNvbnN0cmFpbnRcIiwgXCJJbmhlcml0YW5jZSBlcnJvci5cIik7XG5cbiAgICB9LFxuXG4gICAgLy8gRG8gdGhlIHBvc3QtcHJvY2Vzc2luZy5cbiAgICBwb3N0U29sdmU6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgcHJpbnRFcnJvcihcIkNvbnN0cmFpbnRcIiwgXCJJbmhlcml0YW5jZSBlcnJvci5cIik7XG5cbiAgICB9XG5cbiAgfSk7XG5cbiAgZnVuY3Rpb24gSm9pbnRMaW5rKGpvaW50KSB7XG5cbiAgICAvLyBUaGUgcHJldmlvdXMgam9pbnQgbGluay5cbiAgICB0aGlzLnByZXYgPSBudWxsO1xuICAgIC8vIFRoZSBuZXh0IGpvaW50IGxpbmsuXG4gICAgdGhpcy5uZXh0ID0gbnVsbDtcbiAgICAvLyBUaGUgb3RoZXIgcmlnaWQgYm9keSBjb25uZWN0ZWQgdG8gdGhlIGpvaW50LlxuICAgIHRoaXMuYm9keSA9IG51bGw7XG4gICAgLy8gVGhlIGpvaW50IG9mIHRoZSBsaW5rLlxuICAgIHRoaXMuam9pbnQgPSBqb2ludDtcblxuICB9XG5cbiAgLyoqXG4gICAqIEpvaW50cyBhcmUgdXNlZCB0byBjb25zdHJhaW4gdGhlIG1vdGlvbiBiZXR3ZWVuIHR3byByaWdpZCBib2RpZXMuXG4gICAqXG4gICAqIEBhdXRob3Igc2FoYXJhblxuICAgKiBAYXV0aG9yIGxvLXRoXG4gICAqL1xuXG4gIGZ1bmN0aW9uIEpvaW50KGNvbmZpZykge1xuXG4gICAgQ29uc3RyYWludC5jYWxsKHRoaXMpO1xuXG4gICAgdGhpcy5zY2FsZSA9IDE7XG4gICAgdGhpcy5pbnZTY2FsZSA9IDE7XG5cbiAgICAvLyBqb2ludCBuYW1lXG4gICAgdGhpcy5uYW1lID0gXCJcIjtcbiAgICB0aGlzLmlkID0gTmFOO1xuXG4gICAgLy8gVGhlIHR5cGUgb2YgdGhlIGpvaW50LlxuICAgIHRoaXMudHlwZSA9IEpPSU5UX05VTEw7XG4gICAgLy8gIFRoZSBwcmV2aW91cyBqb2ludCBpbiB0aGUgd29ybGQuXG4gICAgdGhpcy5wcmV2ID0gbnVsbDtcbiAgICAvLyBUaGUgbmV4dCBqb2ludCBpbiB0aGUgd29ybGQuXG4gICAgdGhpcy5uZXh0ID0gbnVsbDtcblxuICAgIHRoaXMuYm9keTEgPSBjb25maWcuYm9keTE7XG4gICAgdGhpcy5ib2R5MiA9IGNvbmZpZy5ib2R5MjtcblxuICAgIC8vIGFuY2hvciBwb2ludCBvbiB0aGUgZmlyc3QgcmlnaWQgYm9keSBpbiBsb2NhbCBjb29yZGluYXRlIHN5c3RlbS5cbiAgICB0aGlzLmxvY2FsQW5jaG9yUG9pbnQxID0gbmV3IFZlYzMoKS5jb3B5KGNvbmZpZy5sb2NhbEFuY2hvclBvaW50MSk7XG4gICAgLy8gYW5jaG9yIHBvaW50IG9uIHRoZSBzZWNvbmQgcmlnaWQgYm9keSBpbiBsb2NhbCBjb29yZGluYXRlIHN5c3RlbS5cbiAgICB0aGlzLmxvY2FsQW5jaG9yUG9pbnQyID0gbmV3IFZlYzMoKS5jb3B5KGNvbmZpZy5sb2NhbEFuY2hvclBvaW50Mik7XG4gICAgLy8gYW5jaG9yIHBvaW50IG9uIHRoZSBmaXJzdCByaWdpZCBib2R5IGluIHdvcmxkIGNvb3JkaW5hdGUgc3lzdGVtIHJlbGF0aXZlIHRvIHRoZSBib2R5J3Mgb3JpZ2luLlxuICAgIHRoaXMucmVsYXRpdmVBbmNob3JQb2ludDEgPSBuZXcgVmVjMygpO1xuICAgIC8vIGFuY2hvciBwb2ludCBvbiB0aGUgc2Vjb25kIHJpZ2lkIGJvZHkgaW4gd29ybGQgY29vcmRpbmF0ZSBzeXN0ZW0gcmVsYXRpdmUgdG8gdGhlIGJvZHkncyBvcmlnaW4uXG4gICAgdGhpcy5yZWxhdGl2ZUFuY2hvclBvaW50MiA9IG5ldyBWZWMzKCk7XG4gICAgLy8gIGFuY2hvciBwb2ludCBvbiB0aGUgZmlyc3QgcmlnaWQgYm9keSBpbiB3b3JsZCBjb29yZGluYXRlIHN5c3RlbS5cbiAgICB0aGlzLmFuY2hvclBvaW50MSA9IG5ldyBWZWMzKCk7XG4gICAgLy8gYW5jaG9yIHBvaW50IG9uIHRoZSBzZWNvbmQgcmlnaWQgYm9keSBpbiB3b3JsZCBjb29yZGluYXRlIHN5c3RlbS5cbiAgICB0aGlzLmFuY2hvclBvaW50MiA9IG5ldyBWZWMzKCk7XG4gICAgLy8gV2hldGhlciBhbGxvdyBjb2xsaXNpb24gYmV0d2VlbiBjb25uZWN0ZWQgcmlnaWQgYm9kaWVzIG9yIG5vdC5cbiAgICB0aGlzLmFsbG93Q29sbGlzaW9uID0gY29uZmlnLmFsbG93Q29sbGlzaW9uO1xuXG4gICAgdGhpcy5iMUxpbmsgPSBuZXcgSm9pbnRMaW5rKHRoaXMpO1xuICAgIHRoaXMuYjJMaW5rID0gbmV3IEpvaW50TGluayh0aGlzKTtcblxuICB9XG4gIEpvaW50LnByb3RvdHlwZSA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmNyZWF0ZShDb25zdHJhaW50LnByb3RvdHlwZSksIHtcblxuICAgIGNvbnN0cnVjdG9yOiBKb2ludCxcblxuICAgIHNldElkOiBmdW5jdGlvbiAobikge1xuXG4gICAgICB0aGlzLmlkID0gaTtcblxuICAgIH0sXG5cbiAgICBzZXRQYXJlbnQ6IGZ1bmN0aW9uICh3b3JsZCkge1xuXG4gICAgICB0aGlzLnBhcmVudCA9IHdvcmxkO1xuICAgICAgdGhpcy5zY2FsZSA9IHRoaXMucGFyZW50LnNjYWxlO1xuICAgICAgdGhpcy5pbnZTY2FsZSA9IHRoaXMucGFyZW50LmludlNjYWxlO1xuICAgICAgdGhpcy5pZCA9IHRoaXMucGFyZW50Lm51bUpvaW50cztcbiAgICAgIGlmICghdGhpcy5uYW1lKSB0aGlzLm5hbWUgPSAnSicgKyB0aGlzLmlkO1xuXG4gICAgfSxcblxuICAgIC8vIFVwZGF0ZSBhbGwgdGhlIGFuY2hvciBwb2ludHMuXG5cbiAgICB1cGRhdGVBbmNob3JQb2ludHM6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgdGhpcy5yZWxhdGl2ZUFuY2hvclBvaW50MS5jb3B5KHRoaXMubG9jYWxBbmNob3JQb2ludDEpLmFwcGx5TWF0cml4Myh0aGlzLmJvZHkxLnJvdGF0aW9uLCB0cnVlKTtcbiAgICAgIHRoaXMucmVsYXRpdmVBbmNob3JQb2ludDIuY29weSh0aGlzLmxvY2FsQW5jaG9yUG9pbnQyKS5hcHBseU1hdHJpeDModGhpcy5ib2R5Mi5yb3RhdGlvbiwgdHJ1ZSk7XG5cbiAgICAgIHRoaXMuYW5jaG9yUG9pbnQxLmFkZCh0aGlzLnJlbGF0aXZlQW5jaG9yUG9pbnQxLCB0aGlzLmJvZHkxLnBvc2l0aW9uKTtcbiAgICAgIHRoaXMuYW5jaG9yUG9pbnQyLmFkZCh0aGlzLnJlbGF0aXZlQW5jaG9yUG9pbnQyLCB0aGlzLmJvZHkyLnBvc2l0aW9uKTtcblxuICAgIH0sXG5cbiAgICAvLyBBdHRhY2ggdGhlIGpvaW50IGZyb20gdGhlIGJvZGllcy5cblxuICAgIGF0dGFjaDogZnVuY3Rpb24gKGlzWCkge1xuXG4gICAgICB0aGlzLmIxTGluay5ib2R5ID0gdGhpcy5ib2R5MjtcbiAgICAgIHRoaXMuYjJMaW5rLmJvZHkgPSB0aGlzLmJvZHkxO1xuXG4gICAgICBpZiAoaXNYKSB7XG5cbiAgICAgICAgdGhpcy5ib2R5MS5qb2ludExpbmsucHVzaCh0aGlzLmIxTGluayk7XG4gICAgICAgIHRoaXMuYm9keTIuam9pbnRMaW5rLnB1c2godGhpcy5iMkxpbmspO1xuICAgICAgfSBlbHNlIHtcblxuICAgICAgICBpZiAodGhpcy5ib2R5MS5qb2ludExpbmsgIT0gbnVsbCkgKHRoaXMuYjFMaW5rLm5leHQgPSB0aGlzLmJvZHkxLmpvaW50TGluaykucHJldiA9IHRoaXMuYjFMaW5rO1xuICAgICAgICBlbHNlIHRoaXMuYjFMaW5rLm5leHQgPSBudWxsO1xuICAgICAgICB0aGlzLmJvZHkxLmpvaW50TGluayA9IHRoaXMuYjFMaW5rO1xuICAgICAgICB0aGlzLmJvZHkxLm51bUpvaW50cysrO1xuICAgICAgICBpZiAodGhpcy5ib2R5Mi5qb2ludExpbmsgIT0gbnVsbCkgKHRoaXMuYjJMaW5rLm5leHQgPSB0aGlzLmJvZHkyLmpvaW50TGluaykucHJldiA9IHRoaXMuYjJMaW5rO1xuICAgICAgICBlbHNlIHRoaXMuYjJMaW5rLm5leHQgPSBudWxsO1xuICAgICAgICB0aGlzLmJvZHkyLmpvaW50TGluayA9IHRoaXMuYjJMaW5rO1xuICAgICAgICB0aGlzLmJvZHkyLm51bUpvaW50cysrO1xuXG4gICAgICB9XG5cbiAgICB9LFxuXG4gICAgLy8gRGV0YWNoIHRoZSBqb2ludCBmcm9tIHRoZSBib2RpZXMuXG5cbiAgICBkZXRhY2g6IGZ1bmN0aW9uIChpc1gpIHtcblxuICAgICAgaWYgKGlzWCkge1xuXG4gICAgICAgIHRoaXMuYm9keTEuam9pbnRMaW5rLnNwbGljZSh0aGlzLmJvZHkxLmpvaW50TGluay5pbmRleE9mKHRoaXMuYjFMaW5rKSwgMSk7XG4gICAgICAgIHRoaXMuYm9keTIuam9pbnRMaW5rLnNwbGljZSh0aGlzLmJvZHkyLmpvaW50TGluay5pbmRleE9mKHRoaXMuYjJMaW5rKSwgMSk7XG5cbiAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgdmFyIHByZXYgPSB0aGlzLmIxTGluay5wcmV2O1xuICAgICAgICB2YXIgbmV4dCA9IHRoaXMuYjFMaW5rLm5leHQ7XG4gICAgICAgIGlmIChwcmV2ICE9IG51bGwpIHByZXYubmV4dCA9IG5leHQ7XG4gICAgICAgIGlmIChuZXh0ICE9IG51bGwpIG5leHQucHJldiA9IHByZXY7XG4gICAgICAgIGlmICh0aGlzLmJvZHkxLmpvaW50TGluayA9PSB0aGlzLmIxTGluaykgdGhpcy5ib2R5MS5qb2ludExpbmsgPSBuZXh0O1xuICAgICAgICB0aGlzLmIxTGluay5wcmV2ID0gbnVsbDtcbiAgICAgICAgdGhpcy5iMUxpbmsubmV4dCA9IG51bGw7XG4gICAgICAgIHRoaXMuYjFMaW5rLmJvZHkgPSBudWxsO1xuICAgICAgICB0aGlzLmJvZHkxLm51bUpvaW50cy0tO1xuXG4gICAgICAgIHByZXYgPSB0aGlzLmIyTGluay5wcmV2O1xuICAgICAgICBuZXh0ID0gdGhpcy5iMkxpbmsubmV4dDtcbiAgICAgICAgaWYgKHByZXYgIT0gbnVsbCkgcHJldi5uZXh0ID0gbmV4dDtcbiAgICAgICAgaWYgKG5leHQgIT0gbnVsbCkgbmV4dC5wcmV2ID0gcHJldjtcbiAgICAgICAgaWYgKHRoaXMuYm9keTIuam9pbnRMaW5rID09IHRoaXMuYjJMaW5rKSB0aGlzLmJvZHkyLmpvaW50TGluayA9IG5leHQ7XG4gICAgICAgIHRoaXMuYjJMaW5rLnByZXYgPSBudWxsO1xuICAgICAgICB0aGlzLmIyTGluay5uZXh0ID0gbnVsbDtcbiAgICAgICAgdGhpcy5iMkxpbmsuYm9keSA9IG51bGw7XG4gICAgICAgIHRoaXMuYm9keTIubnVtSm9pbnRzLS07XG5cbiAgICAgIH1cblxuICAgICAgdGhpcy5iMUxpbmsuYm9keSA9IG51bGw7XG4gICAgICB0aGlzLmIyTGluay5ib2R5ID0gbnVsbDtcblxuICAgIH0sXG5cblxuICAgIC8vIEF3YWtlIHRoZSBib2RpZXMuXG5cbiAgICBhd2FrZTogZnVuY3Rpb24gKCkge1xuXG4gICAgICB0aGlzLmJvZHkxLmF3YWtlKCk7XG4gICAgICB0aGlzLmJvZHkyLmF3YWtlKCk7XG5cbiAgICB9LFxuXG4gICAgLy8gY2FsY3VsYXRpb24gZnVuY3Rpb25cblxuICAgIHByZVNvbHZlOiBmdW5jdGlvbiAodGltZVN0ZXAsIGludlRpbWVTdGVwKSB7XG5cbiAgICB9LFxuXG4gICAgc29sdmU6IGZ1bmN0aW9uICgpIHtcblxuICAgIH0sXG5cbiAgICBwb3N0U29sdmU6IGZ1bmN0aW9uICgpIHtcblxuICAgIH0sXG5cbiAgICAvLyBEZWxldGUgcHJvY2Vzc1xuXG4gICAgcmVtb3ZlOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHRoaXMuZGlzcG9zZSgpO1xuXG4gICAgfSxcblxuICAgIGRpc3Bvc2U6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgdGhpcy5wYXJlbnQucmVtb3ZlSm9pbnQodGhpcyk7XG5cbiAgICB9LFxuXG5cbiAgICAvLyBUaHJlZSBqcyBhZGRcblxuICAgIGdldFBvc2l0aW9uOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHZhciBwMSA9IG5ldyBWZWMzKCkuc2NhbGUodGhpcy5hbmNob3JQb2ludDEsIHRoaXMuc2NhbGUpO1xuICAgICAgdmFyIHAyID0gbmV3IFZlYzMoKS5zY2FsZSh0aGlzLmFuY2hvclBvaW50MiwgdGhpcy5zY2FsZSk7XG4gICAgICByZXR1cm4gW3AxLCBwMl07XG5cbiAgICB9XG5cbiAgfSk7XG5cbiAgLyoqXG4gICogQSBsaW5lYXIgY29uc3RyYWludCBmb3IgYWxsIGF4ZXMgZm9yIHZhcmlvdXMgam9pbnRzLlxuICAqIEBhdXRob3Igc2FoYXJhblxuICAqL1xuICBmdW5jdGlvbiBMaW5lYXJDb25zdHJhaW50KGpvaW50KSB7XG5cbiAgICB0aGlzLm0xID0gTmFOO1xuICAgIHRoaXMubTIgPSBOYU47XG5cbiAgICB0aGlzLmlpMSA9IG51bGw7XG4gICAgdGhpcy5paTIgPSBudWxsO1xuICAgIHRoaXMuZGQgPSBudWxsO1xuXG4gICAgdGhpcy5yMXggPSBOYU47XG4gICAgdGhpcy5yMXkgPSBOYU47XG4gICAgdGhpcy5yMXogPSBOYU47XG5cbiAgICB0aGlzLnIyeCA9IE5hTjtcbiAgICB0aGlzLnIyeSA9IE5hTjtcbiAgICB0aGlzLnIyeiA9IE5hTjtcblxuICAgIHRoaXMuYXgxeCA9IE5hTjtcbiAgICB0aGlzLmF4MXkgPSBOYU47XG4gICAgdGhpcy5heDF6ID0gTmFOO1xuICAgIHRoaXMuYXkxeCA9IE5hTjtcbiAgICB0aGlzLmF5MXkgPSBOYU47XG4gICAgdGhpcy5heTF6ID0gTmFOO1xuICAgIHRoaXMuYXoxeCA9IE5hTjtcbiAgICB0aGlzLmF6MXkgPSBOYU47XG4gICAgdGhpcy5hejF6ID0gTmFOO1xuXG4gICAgdGhpcy5heDJ4ID0gTmFOO1xuICAgIHRoaXMuYXgyeSA9IE5hTjtcbiAgICB0aGlzLmF4MnogPSBOYU47XG4gICAgdGhpcy5heTJ4ID0gTmFOO1xuICAgIHRoaXMuYXkyeSA9IE5hTjtcbiAgICB0aGlzLmF5MnogPSBOYU47XG4gICAgdGhpcy5hejJ4ID0gTmFOO1xuICAgIHRoaXMuYXoyeSA9IE5hTjtcbiAgICB0aGlzLmF6MnogPSBOYU47XG5cbiAgICB0aGlzLnZlbCA9IE5hTjtcbiAgICB0aGlzLnZlbHggPSBOYU47XG4gICAgdGhpcy52ZWx5ID0gTmFOO1xuICAgIHRoaXMudmVseiA9IE5hTjtcblxuXG4gICAgdGhpcy5qb2ludCA9IGpvaW50O1xuICAgIHRoaXMucjEgPSBqb2ludC5yZWxhdGl2ZUFuY2hvclBvaW50MTtcbiAgICB0aGlzLnIyID0gam9pbnQucmVsYXRpdmVBbmNob3JQb2ludDI7XG4gICAgdGhpcy5wMSA9IGpvaW50LmFuY2hvclBvaW50MTtcbiAgICB0aGlzLnAyID0gam9pbnQuYW5jaG9yUG9pbnQyO1xuICAgIHRoaXMuYjEgPSBqb2ludC5ib2R5MTtcbiAgICB0aGlzLmIyID0gam9pbnQuYm9keTI7XG4gICAgdGhpcy5sMSA9IHRoaXMuYjEubGluZWFyVmVsb2NpdHk7XG4gICAgdGhpcy5sMiA9IHRoaXMuYjIubGluZWFyVmVsb2NpdHk7XG4gICAgdGhpcy5hMSA9IHRoaXMuYjEuYW5ndWxhclZlbG9jaXR5O1xuICAgIHRoaXMuYTIgPSB0aGlzLmIyLmFuZ3VsYXJWZWxvY2l0eTtcbiAgICB0aGlzLmkxID0gdGhpcy5iMS5pbnZlcnNlSW5lcnRpYTtcbiAgICB0aGlzLmkyID0gdGhpcy5iMi5pbnZlcnNlSW5lcnRpYTtcbiAgICB0aGlzLmltcHggPSAwO1xuICAgIHRoaXMuaW1weSA9IDA7XG4gICAgdGhpcy5pbXB6ID0gMDtcblxuICB9XG5cbiAgT2JqZWN0LmFzc2lnbihMaW5lYXJDb25zdHJhaW50LnByb3RvdHlwZSwge1xuXG4gICAgTGluZWFyQ29uc3RyYWludDogdHJ1ZSxcblxuICAgIHByZVNvbHZlOiBmdW5jdGlvbiAodGltZVN0ZXAsIGludlRpbWVTdGVwKSB7XG5cbiAgICAgIHRoaXMucjF4ID0gdGhpcy5yMS54O1xuICAgICAgdGhpcy5yMXkgPSB0aGlzLnIxLnk7XG4gICAgICB0aGlzLnIxeiA9IHRoaXMucjEuejtcblxuICAgICAgdGhpcy5yMnggPSB0aGlzLnIyLng7XG4gICAgICB0aGlzLnIyeSA9IHRoaXMucjIueTtcbiAgICAgIHRoaXMucjJ6ID0gdGhpcy5yMi56O1xuXG4gICAgICB0aGlzLm0xID0gdGhpcy5iMS5pbnZlcnNlTWFzcztcbiAgICAgIHRoaXMubTIgPSB0aGlzLmIyLmludmVyc2VNYXNzO1xuXG4gICAgICB0aGlzLmlpMSA9IHRoaXMuaTEuY2xvbmUoKTtcbiAgICAgIHRoaXMuaWkyID0gdGhpcy5pMi5jbG9uZSgpO1xuXG4gICAgICB2YXIgaWkxID0gdGhpcy5paTEuZWxlbWVudHM7XG4gICAgICB2YXIgaWkyID0gdGhpcy5paTIuZWxlbWVudHM7XG5cbiAgICAgIHRoaXMuYXgxeCA9IHRoaXMucjF6ICogaWkxWzFdICsgLXRoaXMucjF5ICogaWkxWzJdO1xuICAgICAgdGhpcy5heDF5ID0gdGhpcy5yMXogKiBpaTFbNF0gKyAtdGhpcy5yMXkgKiBpaTFbNV07XG4gICAgICB0aGlzLmF4MXogPSB0aGlzLnIxeiAqIGlpMVs3XSArIC10aGlzLnIxeSAqIGlpMVs4XTtcbiAgICAgIHRoaXMuYXkxeCA9IC10aGlzLnIxeiAqIGlpMVswXSArIHRoaXMucjF4ICogaWkxWzJdO1xuICAgICAgdGhpcy5heTF5ID0gLXRoaXMucjF6ICogaWkxWzNdICsgdGhpcy5yMXggKiBpaTFbNV07XG4gICAgICB0aGlzLmF5MXogPSAtdGhpcy5yMXogKiBpaTFbNl0gKyB0aGlzLnIxeCAqIGlpMVs4XTtcbiAgICAgIHRoaXMuYXoxeCA9IHRoaXMucjF5ICogaWkxWzBdICsgLXRoaXMucjF4ICogaWkxWzFdO1xuICAgICAgdGhpcy5hejF5ID0gdGhpcy5yMXkgKiBpaTFbM10gKyAtdGhpcy5yMXggKiBpaTFbNF07XG4gICAgICB0aGlzLmF6MXogPSB0aGlzLnIxeSAqIGlpMVs2XSArIC10aGlzLnIxeCAqIGlpMVs3XTtcbiAgICAgIHRoaXMuYXgyeCA9IHRoaXMucjJ6ICogaWkyWzFdICsgLXRoaXMucjJ5ICogaWkyWzJdO1xuICAgICAgdGhpcy5heDJ5ID0gdGhpcy5yMnogKiBpaTJbNF0gKyAtdGhpcy5yMnkgKiBpaTJbNV07XG4gICAgICB0aGlzLmF4MnogPSB0aGlzLnIyeiAqIGlpMls3XSArIC10aGlzLnIyeSAqIGlpMls4XTtcbiAgICAgIHRoaXMuYXkyeCA9IC10aGlzLnIyeiAqIGlpMlswXSArIHRoaXMucjJ4ICogaWkyWzJdO1xuICAgICAgdGhpcy5heTJ5ID0gLXRoaXMucjJ6ICogaWkyWzNdICsgdGhpcy5yMnggKiBpaTJbNV07XG4gICAgICB0aGlzLmF5MnogPSAtdGhpcy5yMnogKiBpaTJbNl0gKyB0aGlzLnIyeCAqIGlpMls4XTtcbiAgICAgIHRoaXMuYXoyeCA9IHRoaXMucjJ5ICogaWkyWzBdICsgLXRoaXMucjJ4ICogaWkyWzFdO1xuICAgICAgdGhpcy5hejJ5ID0gdGhpcy5yMnkgKiBpaTJbM10gKyAtdGhpcy5yMnggKiBpaTJbNF07XG4gICAgICB0aGlzLmF6MnogPSB0aGlzLnIyeSAqIGlpMls2XSArIC10aGlzLnIyeCAqIGlpMls3XTtcblxuICAgICAgLy8gY2FsY3VsYXRlIHBvaW50LXRvLXBvaW50IG1hc3MgbWF0cml4XG4gICAgICAvLyBmcm9tIGltcHVsc2UgZXF1YXRpb25cbiAgICAgIC8vIFxuICAgICAgLy8gTSA9IChbL21dIC0gW3JeXVsvSV1bcl5dKSBeIC0xXG4gICAgICAvLyBcbiAgICAgIC8vIHdoZXJlXG4gICAgICAvLyBcbiAgICAgIC8vIFsvbV0gPSB8MS9tLCAwLCAwfFxuICAgICAgLy8gICAgICAgIHwwLCAxL20sIDB8XG4gICAgICAvLyAgICAgICAgfDAsIDAsIDEvbXxcbiAgICAgIC8vIFxuICAgICAgLy8gW3JeXSA9IHwwLCAtcnosIHJ5fFxuICAgICAgLy8gICAgICAgIHxyeiwgMCwgLXJ4fFxuICAgICAgLy8gICAgICAgIHwtcnksIHJ4LCAwfFxuICAgICAgLy8gXG4gICAgICAvLyBbL0ldID0gSW52ZXJ0ZWQgbW9tZW50IGluZXJ0aWFcblxuICAgICAgdmFyIHJ4eCA9IHRoaXMubTEgKyB0aGlzLm0yO1xuXG4gICAgICB2YXIga2sgPSBuZXcgTWF0MzMoKS5zZXQocnh4LCAwLCAwLCAwLCByeHgsIDAsIDAsIDAsIHJ4eCk7XG4gICAgICB2YXIgayA9IGtrLmVsZW1lbnRzO1xuXG4gICAgICBrWzBdICs9IGlpMVs0XSAqIHRoaXMucjF6ICogdGhpcy5yMXogLSAoaWkxWzddICsgaWkxWzVdKSAqIHRoaXMucjF5ICogdGhpcy5yMXogKyBpaTFbOF0gKiB0aGlzLnIxeSAqIHRoaXMucjF5O1xuICAgICAga1sxXSArPSAoaWkxWzZdICogdGhpcy5yMXkgKyBpaTFbNV0gKiB0aGlzLnIxeCkgKiB0aGlzLnIxeiAtIGlpMVszXSAqIHRoaXMucjF6ICogdGhpcy5yMXogLSBpaTFbOF0gKiB0aGlzLnIxeCAqIHRoaXMucjF5O1xuICAgICAga1syXSArPSAoaWkxWzNdICogdGhpcy5yMXkgLSBpaTFbNF0gKiB0aGlzLnIxeCkgKiB0aGlzLnIxeiAtIGlpMVs2XSAqIHRoaXMucjF5ICogdGhpcy5yMXkgKyBpaTFbN10gKiB0aGlzLnIxeCAqIHRoaXMucjF5O1xuICAgICAga1szXSArPSAoaWkxWzJdICogdGhpcy5yMXkgKyBpaTFbN10gKiB0aGlzLnIxeCkgKiB0aGlzLnIxeiAtIGlpMVsxXSAqIHRoaXMucjF6ICogdGhpcy5yMXogLSBpaTFbOF0gKiB0aGlzLnIxeCAqIHRoaXMucjF5O1xuICAgICAga1s0XSArPSBpaTFbMF0gKiB0aGlzLnIxeiAqIHRoaXMucjF6IC0gKGlpMVs2XSArIGlpMVsyXSkgKiB0aGlzLnIxeCAqIHRoaXMucjF6ICsgaWkxWzhdICogdGhpcy5yMXggKiB0aGlzLnIxeDtcbiAgICAgIGtbNV0gKz0gKGlpMVsxXSAqIHRoaXMucjF4IC0gaWkxWzBdICogdGhpcy5yMXkpICogdGhpcy5yMXogLSBpaTFbN10gKiB0aGlzLnIxeCAqIHRoaXMucjF4ICsgaWkxWzZdICogdGhpcy5yMXggKiB0aGlzLnIxeTtcbiAgICAgIGtbNl0gKz0gKGlpMVsxXSAqIHRoaXMucjF5IC0gaWkxWzRdICogdGhpcy5yMXgpICogdGhpcy5yMXogLSBpaTFbMl0gKiB0aGlzLnIxeSAqIHRoaXMucjF5ICsgaWkxWzVdICogdGhpcy5yMXggKiB0aGlzLnIxeTtcbiAgICAgIGtbN10gKz0gKGlpMVszXSAqIHRoaXMucjF4IC0gaWkxWzBdICogdGhpcy5yMXkpICogdGhpcy5yMXogLSBpaTFbNV0gKiB0aGlzLnIxeCAqIHRoaXMucjF4ICsgaWkxWzJdICogdGhpcy5yMXggKiB0aGlzLnIxeTtcbiAgICAgIGtbOF0gKz0gaWkxWzBdICogdGhpcy5yMXkgKiB0aGlzLnIxeSAtIChpaTFbM10gKyBpaTFbMV0pICogdGhpcy5yMXggKiB0aGlzLnIxeSArIGlpMVs0XSAqIHRoaXMucjF4ICogdGhpcy5yMXg7XG5cbiAgICAgIGtbMF0gKz0gaWkyWzRdICogdGhpcy5yMnogKiB0aGlzLnIyeiAtIChpaTJbN10gKyBpaTJbNV0pICogdGhpcy5yMnkgKiB0aGlzLnIyeiArIGlpMls4XSAqIHRoaXMucjJ5ICogdGhpcy5yMnk7XG4gICAgICBrWzFdICs9IChpaTJbNl0gKiB0aGlzLnIyeSArIGlpMls1XSAqIHRoaXMucjJ4KSAqIHRoaXMucjJ6IC0gaWkyWzNdICogdGhpcy5yMnogKiB0aGlzLnIyeiAtIGlpMls4XSAqIHRoaXMucjJ4ICogdGhpcy5yMnk7XG4gICAgICBrWzJdICs9IChpaTJbM10gKiB0aGlzLnIyeSAtIGlpMls0XSAqIHRoaXMucjJ4KSAqIHRoaXMucjJ6IC0gaWkyWzZdICogdGhpcy5yMnkgKiB0aGlzLnIyeSArIGlpMls3XSAqIHRoaXMucjJ4ICogdGhpcy5yMnk7XG4gICAgICBrWzNdICs9IChpaTJbMl0gKiB0aGlzLnIyeSArIGlpMls3XSAqIHRoaXMucjJ4KSAqIHRoaXMucjJ6IC0gaWkyWzFdICogdGhpcy5yMnogKiB0aGlzLnIyeiAtIGlpMls4XSAqIHRoaXMucjJ4ICogdGhpcy5yMnk7XG4gICAgICBrWzRdICs9IGlpMlswXSAqIHRoaXMucjJ6ICogdGhpcy5yMnogLSAoaWkyWzZdICsgaWkyWzJdKSAqIHRoaXMucjJ4ICogdGhpcy5yMnogKyBpaTJbOF0gKiB0aGlzLnIyeCAqIHRoaXMucjJ4O1xuICAgICAga1s1XSArPSAoaWkyWzFdICogdGhpcy5yMnggLSBpaTJbMF0gKiB0aGlzLnIyeSkgKiB0aGlzLnIyeiAtIGlpMls3XSAqIHRoaXMucjJ4ICogdGhpcy5yMnggKyBpaTJbNl0gKiB0aGlzLnIyeCAqIHRoaXMucjJ5O1xuICAgICAga1s2XSArPSAoaWkyWzFdICogdGhpcy5yMnkgLSBpaTJbNF0gKiB0aGlzLnIyeCkgKiB0aGlzLnIyeiAtIGlpMlsyXSAqIHRoaXMucjJ5ICogdGhpcy5yMnkgKyBpaTJbNV0gKiB0aGlzLnIyeCAqIHRoaXMucjJ5O1xuICAgICAga1s3XSArPSAoaWkyWzNdICogdGhpcy5yMnggLSBpaTJbMF0gKiB0aGlzLnIyeSkgKiB0aGlzLnIyeiAtIGlpMls1XSAqIHRoaXMucjJ4ICogdGhpcy5yMnggKyBpaTJbMl0gKiB0aGlzLnIyeCAqIHRoaXMucjJ5O1xuICAgICAga1s4XSArPSBpaTJbMF0gKiB0aGlzLnIyeSAqIHRoaXMucjJ5IC0gKGlpMlszXSArIGlpMlsxXSkgKiB0aGlzLnIyeCAqIHRoaXMucjJ5ICsgaWkyWzRdICogdGhpcy5yMnggKiB0aGlzLnIyeDtcblxuICAgICAgdmFyIGludiA9IDEgLyAoa1swXSAqIChrWzRdICoga1s4XSAtIGtbN10gKiBrWzVdKSArIGtbM10gKiAoa1s3XSAqIGtbMl0gLSBrWzFdICoga1s4XSkgKyBrWzZdICogKGtbMV0gKiBrWzVdIC0ga1s0XSAqIGtbMl0pKTtcbiAgICAgIHRoaXMuZGQgPSBuZXcgTWF0MzMoKS5zZXQoXG4gICAgICAgIGtbNF0gKiBrWzhdIC0ga1s1XSAqIGtbN10sIGtbMl0gKiBrWzddIC0ga1sxXSAqIGtbOF0sIGtbMV0gKiBrWzVdIC0ga1syXSAqIGtbNF0sXG4gICAgICAgIGtbNV0gKiBrWzZdIC0ga1szXSAqIGtbOF0sIGtbMF0gKiBrWzhdIC0ga1syXSAqIGtbNl0sIGtbMl0gKiBrWzNdIC0ga1swXSAqIGtbNV0sXG4gICAgICAgIGtbM10gKiBrWzddIC0ga1s0XSAqIGtbNl0sIGtbMV0gKiBrWzZdIC0ga1swXSAqIGtbN10sIGtbMF0gKiBrWzRdIC0ga1sxXSAqIGtbM11cbiAgICAgICkuc2NhbGVFcXVhbChpbnYpO1xuXG4gICAgICB0aGlzLnZlbHggPSB0aGlzLnAyLnggLSB0aGlzLnAxLng7XG4gICAgICB0aGlzLnZlbHkgPSB0aGlzLnAyLnkgLSB0aGlzLnAxLnk7XG4gICAgICB0aGlzLnZlbHogPSB0aGlzLnAyLnogLSB0aGlzLnAxLno7XG4gICAgICB2YXIgbGVuID0gX01hdGguc3FydCh0aGlzLnZlbHggKiB0aGlzLnZlbHggKyB0aGlzLnZlbHkgKiB0aGlzLnZlbHkgKyB0aGlzLnZlbHogKiB0aGlzLnZlbHopO1xuICAgICAgaWYgKGxlbiA+IDAuMDA1KSB7XG4gICAgICAgIGxlbiA9ICgwLjAwNSAtIGxlbikgLyBsZW4gKiBpbnZUaW1lU3RlcCAqIDAuMDU7XG4gICAgICAgIHRoaXMudmVseCAqPSBsZW47XG4gICAgICAgIHRoaXMudmVseSAqPSBsZW47XG4gICAgICAgIHRoaXMudmVseiAqPSBsZW47XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnZlbHggPSAwO1xuICAgICAgICB0aGlzLnZlbHkgPSAwO1xuICAgICAgICB0aGlzLnZlbHogPSAwO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmltcHggKj0gMC45NTtcbiAgICAgIHRoaXMuaW1weSAqPSAwLjk1O1xuICAgICAgdGhpcy5pbXB6ICo9IDAuOTU7XG5cbiAgICAgIHRoaXMubDEueCArPSB0aGlzLmltcHggKiB0aGlzLm0xO1xuICAgICAgdGhpcy5sMS55ICs9IHRoaXMuaW1weSAqIHRoaXMubTE7XG4gICAgICB0aGlzLmwxLnogKz0gdGhpcy5pbXB6ICogdGhpcy5tMTtcbiAgICAgIHRoaXMuYTEueCArPSB0aGlzLmltcHggKiB0aGlzLmF4MXggKyB0aGlzLmltcHkgKiB0aGlzLmF5MXggKyB0aGlzLmltcHogKiB0aGlzLmF6MXg7XG4gICAgICB0aGlzLmExLnkgKz0gdGhpcy5pbXB4ICogdGhpcy5heDF5ICsgdGhpcy5pbXB5ICogdGhpcy5heTF5ICsgdGhpcy5pbXB6ICogdGhpcy5hejF5O1xuICAgICAgdGhpcy5hMS56ICs9IHRoaXMuaW1weCAqIHRoaXMuYXgxeiArIHRoaXMuaW1weSAqIHRoaXMuYXkxeiArIHRoaXMuaW1weiAqIHRoaXMuYXoxejtcbiAgICAgIHRoaXMubDIueCAtPSB0aGlzLmltcHggKiB0aGlzLm0yO1xuICAgICAgdGhpcy5sMi55IC09IHRoaXMuaW1weSAqIHRoaXMubTI7XG4gICAgICB0aGlzLmwyLnogLT0gdGhpcy5pbXB6ICogdGhpcy5tMjtcbiAgICAgIHRoaXMuYTIueCAtPSB0aGlzLmltcHggKiB0aGlzLmF4MnggKyB0aGlzLmltcHkgKiB0aGlzLmF5MnggKyB0aGlzLmltcHogKiB0aGlzLmF6Mng7XG4gICAgICB0aGlzLmEyLnkgLT0gdGhpcy5pbXB4ICogdGhpcy5heDJ5ICsgdGhpcy5pbXB5ICogdGhpcy5heTJ5ICsgdGhpcy5pbXB6ICogdGhpcy5hejJ5O1xuICAgICAgdGhpcy5hMi56IC09IHRoaXMuaW1weCAqIHRoaXMuYXgyeiArIHRoaXMuaW1weSAqIHRoaXMuYXkyeiArIHRoaXMuaW1weiAqIHRoaXMuYXoyejtcbiAgICB9LFxuXG4gICAgc29sdmU6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgdmFyIGQgPSB0aGlzLmRkLmVsZW1lbnRzO1xuICAgICAgdmFyIHJ2eCA9IHRoaXMubDIueCAtIHRoaXMubDEueCArIHRoaXMuYTIueSAqIHRoaXMucjJ6IC0gdGhpcy5hMi56ICogdGhpcy5yMnkgLSB0aGlzLmExLnkgKiB0aGlzLnIxeiArIHRoaXMuYTEueiAqIHRoaXMucjF5IC0gdGhpcy52ZWx4O1xuICAgICAgdmFyIHJ2eSA9IHRoaXMubDIueSAtIHRoaXMubDEueSArIHRoaXMuYTIueiAqIHRoaXMucjJ4IC0gdGhpcy5hMi54ICogdGhpcy5yMnogLSB0aGlzLmExLnogKiB0aGlzLnIxeCArIHRoaXMuYTEueCAqIHRoaXMucjF6IC0gdGhpcy52ZWx5O1xuICAgICAgdmFyIHJ2eiA9IHRoaXMubDIueiAtIHRoaXMubDEueiArIHRoaXMuYTIueCAqIHRoaXMucjJ5IC0gdGhpcy5hMi55ICogdGhpcy5yMnggLSB0aGlzLmExLnggKiB0aGlzLnIxeSArIHRoaXMuYTEueSAqIHRoaXMucjF4IC0gdGhpcy52ZWx6O1xuICAgICAgdmFyIG5pbXB4ID0gcnZ4ICogZFswXSArIHJ2eSAqIGRbMV0gKyBydnogKiBkWzJdO1xuICAgICAgdmFyIG5pbXB5ID0gcnZ4ICogZFszXSArIHJ2eSAqIGRbNF0gKyBydnogKiBkWzVdO1xuICAgICAgdmFyIG5pbXB6ID0gcnZ4ICogZFs2XSArIHJ2eSAqIGRbN10gKyBydnogKiBkWzhdO1xuICAgICAgdGhpcy5pbXB4ICs9IG5pbXB4O1xuICAgICAgdGhpcy5pbXB5ICs9IG5pbXB5O1xuICAgICAgdGhpcy5pbXB6ICs9IG5pbXB6O1xuICAgICAgdGhpcy5sMS54ICs9IG5pbXB4ICogdGhpcy5tMTtcbiAgICAgIHRoaXMubDEueSArPSBuaW1weSAqIHRoaXMubTE7XG4gICAgICB0aGlzLmwxLnogKz0gbmltcHogKiB0aGlzLm0xO1xuICAgICAgdGhpcy5hMS54ICs9IG5pbXB4ICogdGhpcy5heDF4ICsgbmltcHkgKiB0aGlzLmF5MXggKyBuaW1weiAqIHRoaXMuYXoxeDtcbiAgICAgIHRoaXMuYTEueSArPSBuaW1weCAqIHRoaXMuYXgxeSArIG5pbXB5ICogdGhpcy5heTF5ICsgbmltcHogKiB0aGlzLmF6MXk7XG4gICAgICB0aGlzLmExLnogKz0gbmltcHggKiB0aGlzLmF4MXogKyBuaW1weSAqIHRoaXMuYXkxeiArIG5pbXB6ICogdGhpcy5hejF6O1xuICAgICAgdGhpcy5sMi54IC09IG5pbXB4ICogdGhpcy5tMjtcbiAgICAgIHRoaXMubDIueSAtPSBuaW1weSAqIHRoaXMubTI7XG4gICAgICB0aGlzLmwyLnogLT0gbmltcHogKiB0aGlzLm0yO1xuICAgICAgdGhpcy5hMi54IC09IG5pbXB4ICogdGhpcy5heDJ4ICsgbmltcHkgKiB0aGlzLmF5MnggKyBuaW1weiAqIHRoaXMuYXoyeDtcbiAgICAgIHRoaXMuYTIueSAtPSBuaW1weCAqIHRoaXMuYXgyeSArIG5pbXB5ICogdGhpcy5heTJ5ICsgbmltcHogKiB0aGlzLmF6Mnk7XG4gICAgICB0aGlzLmEyLnogLT0gbmltcHggKiB0aGlzLmF4MnogKyBuaW1weSAqIHRoaXMuYXkyeiArIG5pbXB6ICogdGhpcy5hejJ6O1xuXG4gICAgfVxuXG4gIH0pO1xuXG4gIC8qKlxuICAqIEEgdGhyZWUtYXhpcyByb3RhdGlvbmFsIGNvbnN0cmFpbnQgZm9yIHZhcmlvdXMgam9pbnRzLlxuICAqIEBhdXRob3Igc2FoYXJhblxuICAqL1xuXG4gIGZ1bmN0aW9uIFJvdGF0aW9uYWwzQ29uc3RyYWludChqb2ludCwgbGltaXRNb3RvcjEsIGxpbWl0TW90b3IyLCBsaW1pdE1vdG9yMykge1xuXG4gICAgdGhpcy5jZm0xID0gTmFOO1xuICAgIHRoaXMuY2ZtMiA9IE5hTjtcbiAgICB0aGlzLmNmbTMgPSBOYU47XG4gICAgdGhpcy5pMWUwMCA9IE5hTjtcbiAgICB0aGlzLmkxZTAxID0gTmFOO1xuICAgIHRoaXMuaTFlMDIgPSBOYU47XG4gICAgdGhpcy5pMWUxMCA9IE5hTjtcbiAgICB0aGlzLmkxZTExID0gTmFOO1xuICAgIHRoaXMuaTFlMTIgPSBOYU47XG4gICAgdGhpcy5pMWUyMCA9IE5hTjtcbiAgICB0aGlzLmkxZTIxID0gTmFOO1xuICAgIHRoaXMuaTFlMjIgPSBOYU47XG4gICAgdGhpcy5pMmUwMCA9IE5hTjtcbiAgICB0aGlzLmkyZTAxID0gTmFOO1xuICAgIHRoaXMuaTJlMDIgPSBOYU47XG4gICAgdGhpcy5pMmUxMCA9IE5hTjtcbiAgICB0aGlzLmkyZTExID0gTmFOO1xuICAgIHRoaXMuaTJlMTIgPSBOYU47XG4gICAgdGhpcy5pMmUyMCA9IE5hTjtcbiAgICB0aGlzLmkyZTIxID0gTmFOO1xuICAgIHRoaXMuaTJlMjIgPSBOYU47XG4gICAgdGhpcy5heDEgPSBOYU47XG4gICAgdGhpcy5heTEgPSBOYU47XG4gICAgdGhpcy5hejEgPSBOYU47XG4gICAgdGhpcy5heDIgPSBOYU47XG4gICAgdGhpcy5heTIgPSBOYU47XG4gICAgdGhpcy5hejIgPSBOYU47XG4gICAgdGhpcy5heDMgPSBOYU47XG4gICAgdGhpcy5heTMgPSBOYU47XG4gICAgdGhpcy5hejMgPSBOYU47XG5cbiAgICB0aGlzLmExeDEgPSBOYU47IC8vIGphY29pYW5zXG4gICAgdGhpcy5hMXkxID0gTmFOO1xuICAgIHRoaXMuYTF6MSA9IE5hTjtcbiAgICB0aGlzLmEyeDEgPSBOYU47XG4gICAgdGhpcy5hMnkxID0gTmFOO1xuICAgIHRoaXMuYTJ6MSA9IE5hTjtcbiAgICB0aGlzLmExeDIgPSBOYU47XG4gICAgdGhpcy5hMXkyID0gTmFOO1xuICAgIHRoaXMuYTF6MiA9IE5hTjtcbiAgICB0aGlzLmEyeDIgPSBOYU47XG4gICAgdGhpcy5hMnkyID0gTmFOO1xuICAgIHRoaXMuYTJ6MiA9IE5hTjtcbiAgICB0aGlzLmExeDMgPSBOYU47XG4gICAgdGhpcy5hMXkzID0gTmFOO1xuICAgIHRoaXMuYTF6MyA9IE5hTjtcbiAgICB0aGlzLmEyeDMgPSBOYU47XG4gICAgdGhpcy5hMnkzID0gTmFOO1xuICAgIHRoaXMuYTJ6MyA9IE5hTjtcblxuICAgIHRoaXMubG93ZXJMaW1pdDEgPSBOYU47XG4gICAgdGhpcy51cHBlckxpbWl0MSA9IE5hTjtcbiAgICB0aGlzLmxpbWl0VmVsb2NpdHkxID0gTmFOO1xuICAgIHRoaXMubGltaXRTdGF0ZTEgPSAwOyAvLyAtMTogYXQgbG93ZXIsIDA6IGxvY2tlZCwgMTogYXQgdXBwZXIsIDI6IGZyZWVcbiAgICB0aGlzLmVuYWJsZU1vdG9yMSA9IGZhbHNlO1xuICAgIHRoaXMubW90b3JTcGVlZDEgPSBOYU47XG4gICAgdGhpcy5tYXhNb3RvckZvcmNlMSA9IE5hTjtcbiAgICB0aGlzLm1heE1vdG9ySW1wdWxzZTEgPSBOYU47XG4gICAgdGhpcy5sb3dlckxpbWl0MiA9IE5hTjtcbiAgICB0aGlzLnVwcGVyTGltaXQyID0gTmFOO1xuICAgIHRoaXMubGltaXRWZWxvY2l0eTIgPSBOYU47XG4gICAgdGhpcy5saW1pdFN0YXRlMiA9IDA7IC8vIC0xOiBhdCBsb3dlciwgMDogbG9ja2VkLCAxOiBhdCB1cHBlciwgMjogZnJlZVxuICAgIHRoaXMuZW5hYmxlTW90b3IyID0gZmFsc2U7XG4gICAgdGhpcy5tb3RvclNwZWVkMiA9IE5hTjtcbiAgICB0aGlzLm1heE1vdG9yRm9yY2UyID0gTmFOO1xuICAgIHRoaXMubWF4TW90b3JJbXB1bHNlMiA9IE5hTjtcbiAgICB0aGlzLmxvd2VyTGltaXQzID0gTmFOO1xuICAgIHRoaXMudXBwZXJMaW1pdDMgPSBOYU47XG4gICAgdGhpcy5saW1pdFZlbG9jaXR5MyA9IE5hTjtcbiAgICB0aGlzLmxpbWl0U3RhdGUzID0gMDsgLy8gLTE6IGF0IGxvd2VyLCAwOiBsb2NrZWQsIDE6IGF0IHVwcGVyLCAyOiBmcmVlXG4gICAgdGhpcy5lbmFibGVNb3RvcjMgPSBmYWxzZTtcbiAgICB0aGlzLm1vdG9yU3BlZWQzID0gTmFOO1xuICAgIHRoaXMubWF4TW90b3JGb3JjZTMgPSBOYU47XG4gICAgdGhpcy5tYXhNb3RvckltcHVsc2UzID0gTmFOO1xuXG4gICAgdGhpcy5rMDAgPSBOYU47IC8vIEsgPSBKKk0qSlRcbiAgICB0aGlzLmswMSA9IE5hTjtcbiAgICB0aGlzLmswMiA9IE5hTjtcbiAgICB0aGlzLmsxMCA9IE5hTjtcbiAgICB0aGlzLmsxMSA9IE5hTjtcbiAgICB0aGlzLmsxMiA9IE5hTjtcbiAgICB0aGlzLmsyMCA9IE5hTjtcbiAgICB0aGlzLmsyMSA9IE5hTjtcbiAgICB0aGlzLmsyMiA9IE5hTjtcblxuICAgIHRoaXMua3YwMCA9IE5hTjsgLy8gZGlhZ29uYWxzIHdpdGhvdXQgQ0ZNc1xuICAgIHRoaXMua3YxMSA9IE5hTjtcbiAgICB0aGlzLmt2MjIgPSBOYU47XG5cbiAgICB0aGlzLmR2MDAgPSBOYU47IC8vIC4uLmludmVydGVkXG4gICAgdGhpcy5kdjExID0gTmFOO1xuICAgIHRoaXMuZHYyMiA9IE5hTjtcblxuICAgIHRoaXMuZDAwID0gTmFOOyAgLy8gS14tMVxuICAgIHRoaXMuZDAxID0gTmFOO1xuICAgIHRoaXMuZDAyID0gTmFOO1xuICAgIHRoaXMuZDEwID0gTmFOO1xuICAgIHRoaXMuZDExID0gTmFOO1xuICAgIHRoaXMuZDEyID0gTmFOO1xuICAgIHRoaXMuZDIwID0gTmFOO1xuICAgIHRoaXMuZDIxID0gTmFOO1xuICAgIHRoaXMuZDIyID0gTmFOO1xuXG4gICAgdGhpcy5saW1pdE1vdG9yMSA9IGxpbWl0TW90b3IxO1xuICAgIHRoaXMubGltaXRNb3RvcjIgPSBsaW1pdE1vdG9yMjtcbiAgICB0aGlzLmxpbWl0TW90b3IzID0gbGltaXRNb3RvcjM7XG4gICAgdGhpcy5iMSA9IGpvaW50LmJvZHkxO1xuICAgIHRoaXMuYjIgPSBqb2ludC5ib2R5MjtcbiAgICB0aGlzLmExID0gdGhpcy5iMS5hbmd1bGFyVmVsb2NpdHk7XG4gICAgdGhpcy5hMiA9IHRoaXMuYjIuYW5ndWxhclZlbG9jaXR5O1xuICAgIHRoaXMuaTEgPSB0aGlzLmIxLmludmVyc2VJbmVydGlhO1xuICAgIHRoaXMuaTIgPSB0aGlzLmIyLmludmVyc2VJbmVydGlhO1xuICAgIHRoaXMubGltaXRJbXB1bHNlMSA9IDA7XG4gICAgdGhpcy5tb3RvckltcHVsc2UxID0gMDtcbiAgICB0aGlzLmxpbWl0SW1wdWxzZTIgPSAwO1xuICAgIHRoaXMubW90b3JJbXB1bHNlMiA9IDA7XG4gICAgdGhpcy5saW1pdEltcHVsc2UzID0gMDtcbiAgICB0aGlzLm1vdG9ySW1wdWxzZTMgPSAwO1xuXG4gIH1cblxuICBPYmplY3QuYXNzaWduKFJvdGF0aW9uYWwzQ29uc3RyYWludC5wcm90b3R5cGUsIHtcblxuICAgIFJvdGF0aW9uYWwzQ29uc3RyYWludDogdHJ1ZSxcblxuICAgIHByZVNvbHZlOiBmdW5jdGlvbiAodGltZVN0ZXAsIGludlRpbWVTdGVwKSB7XG5cbiAgICAgIHRoaXMuYXgxID0gdGhpcy5saW1pdE1vdG9yMS5heGlzLng7XG4gICAgICB0aGlzLmF5MSA9IHRoaXMubGltaXRNb3RvcjEuYXhpcy55O1xuICAgICAgdGhpcy5hejEgPSB0aGlzLmxpbWl0TW90b3IxLmF4aXMuejtcbiAgICAgIHRoaXMuYXgyID0gdGhpcy5saW1pdE1vdG9yMi5heGlzLng7XG4gICAgICB0aGlzLmF5MiA9IHRoaXMubGltaXRNb3RvcjIuYXhpcy55O1xuICAgICAgdGhpcy5hejIgPSB0aGlzLmxpbWl0TW90b3IyLmF4aXMuejtcbiAgICAgIHRoaXMuYXgzID0gdGhpcy5saW1pdE1vdG9yMy5heGlzLng7XG4gICAgICB0aGlzLmF5MyA9IHRoaXMubGltaXRNb3RvcjMuYXhpcy55O1xuICAgICAgdGhpcy5hejMgPSB0aGlzLmxpbWl0TW90b3IzLmF4aXMuejtcbiAgICAgIHRoaXMubG93ZXJMaW1pdDEgPSB0aGlzLmxpbWl0TW90b3IxLmxvd2VyTGltaXQ7XG4gICAgICB0aGlzLnVwcGVyTGltaXQxID0gdGhpcy5saW1pdE1vdG9yMS51cHBlckxpbWl0O1xuICAgICAgdGhpcy5tb3RvclNwZWVkMSA9IHRoaXMubGltaXRNb3RvcjEubW90b3JTcGVlZDtcbiAgICAgIHRoaXMubWF4TW90b3JGb3JjZTEgPSB0aGlzLmxpbWl0TW90b3IxLm1heE1vdG9yRm9yY2U7XG4gICAgICB0aGlzLmVuYWJsZU1vdG9yMSA9IHRoaXMubWF4TW90b3JGb3JjZTEgPiAwO1xuICAgICAgdGhpcy5sb3dlckxpbWl0MiA9IHRoaXMubGltaXRNb3RvcjIubG93ZXJMaW1pdDtcbiAgICAgIHRoaXMudXBwZXJMaW1pdDIgPSB0aGlzLmxpbWl0TW90b3IyLnVwcGVyTGltaXQ7XG4gICAgICB0aGlzLm1vdG9yU3BlZWQyID0gdGhpcy5saW1pdE1vdG9yMi5tb3RvclNwZWVkO1xuICAgICAgdGhpcy5tYXhNb3RvckZvcmNlMiA9IHRoaXMubGltaXRNb3RvcjIubWF4TW90b3JGb3JjZTtcbiAgICAgIHRoaXMuZW5hYmxlTW90b3IyID0gdGhpcy5tYXhNb3RvckZvcmNlMiA+IDA7XG4gICAgICB0aGlzLmxvd2VyTGltaXQzID0gdGhpcy5saW1pdE1vdG9yMy5sb3dlckxpbWl0O1xuICAgICAgdGhpcy51cHBlckxpbWl0MyA9IHRoaXMubGltaXRNb3RvcjMudXBwZXJMaW1pdDtcbiAgICAgIHRoaXMubW90b3JTcGVlZDMgPSB0aGlzLmxpbWl0TW90b3IzLm1vdG9yU3BlZWQ7XG4gICAgICB0aGlzLm1heE1vdG9yRm9yY2UzID0gdGhpcy5saW1pdE1vdG9yMy5tYXhNb3RvckZvcmNlO1xuICAgICAgdGhpcy5lbmFibGVNb3RvcjMgPSB0aGlzLm1heE1vdG9yRm9yY2UzID4gMDtcblxuICAgICAgdmFyIHRpMSA9IHRoaXMuaTEuZWxlbWVudHM7XG4gICAgICB2YXIgdGkyID0gdGhpcy5pMi5lbGVtZW50cztcbiAgICAgIHRoaXMuaTFlMDAgPSB0aTFbMF07XG4gICAgICB0aGlzLmkxZTAxID0gdGkxWzFdO1xuICAgICAgdGhpcy5pMWUwMiA9IHRpMVsyXTtcbiAgICAgIHRoaXMuaTFlMTAgPSB0aTFbM107XG4gICAgICB0aGlzLmkxZTExID0gdGkxWzRdO1xuICAgICAgdGhpcy5pMWUxMiA9IHRpMVs1XTtcbiAgICAgIHRoaXMuaTFlMjAgPSB0aTFbNl07XG4gICAgICB0aGlzLmkxZTIxID0gdGkxWzddO1xuICAgICAgdGhpcy5pMWUyMiA9IHRpMVs4XTtcblxuICAgICAgdGhpcy5pMmUwMCA9IHRpMlswXTtcbiAgICAgIHRoaXMuaTJlMDEgPSB0aTJbMV07XG4gICAgICB0aGlzLmkyZTAyID0gdGkyWzJdO1xuICAgICAgdGhpcy5pMmUxMCA9IHRpMlszXTtcbiAgICAgIHRoaXMuaTJlMTEgPSB0aTJbNF07XG4gICAgICB0aGlzLmkyZTEyID0gdGkyWzVdO1xuICAgICAgdGhpcy5pMmUyMCA9IHRpMls2XTtcbiAgICAgIHRoaXMuaTJlMjEgPSB0aTJbN107XG4gICAgICB0aGlzLmkyZTIyID0gdGkyWzhdO1xuXG4gICAgICB2YXIgZnJlcXVlbmN5MSA9IHRoaXMubGltaXRNb3RvcjEuZnJlcXVlbmN5O1xuICAgICAgdmFyIGZyZXF1ZW5jeTIgPSB0aGlzLmxpbWl0TW90b3IyLmZyZXF1ZW5jeTtcbiAgICAgIHZhciBmcmVxdWVuY3kzID0gdGhpcy5saW1pdE1vdG9yMy5mcmVxdWVuY3k7XG4gICAgICB2YXIgZW5hYmxlU3ByaW5nMSA9IGZyZXF1ZW5jeTEgPiAwO1xuICAgICAgdmFyIGVuYWJsZVNwcmluZzIgPSBmcmVxdWVuY3kyID4gMDtcbiAgICAgIHZhciBlbmFibGVTcHJpbmczID0gZnJlcXVlbmN5MyA+IDA7XG4gICAgICB2YXIgZW5hYmxlTGltaXQxID0gdGhpcy5sb3dlckxpbWl0MSA8PSB0aGlzLnVwcGVyTGltaXQxO1xuICAgICAgdmFyIGVuYWJsZUxpbWl0MiA9IHRoaXMubG93ZXJMaW1pdDIgPD0gdGhpcy51cHBlckxpbWl0MjtcbiAgICAgIHZhciBlbmFibGVMaW1pdDMgPSB0aGlzLmxvd2VyTGltaXQzIDw9IHRoaXMudXBwZXJMaW1pdDM7XG4gICAgICB2YXIgYW5nbGUxID0gdGhpcy5saW1pdE1vdG9yMS5hbmdsZTtcbiAgICAgIGlmIChlbmFibGVMaW1pdDEpIHtcbiAgICAgICAgaWYgKHRoaXMubG93ZXJMaW1pdDEgPT0gdGhpcy51cHBlckxpbWl0MSkge1xuICAgICAgICAgIGlmICh0aGlzLmxpbWl0U3RhdGUxICE9IDApIHtcbiAgICAgICAgICAgIHRoaXMubGltaXRTdGF0ZTEgPSAwO1xuICAgICAgICAgICAgdGhpcy5saW1pdEltcHVsc2UxID0gMDtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5saW1pdFZlbG9jaXR5MSA9IHRoaXMubG93ZXJMaW1pdDEgLSBhbmdsZTE7XG4gICAgICAgIH0gZWxzZSBpZiAoYW5nbGUxIDwgdGhpcy5sb3dlckxpbWl0MSkge1xuICAgICAgICAgIGlmICh0aGlzLmxpbWl0U3RhdGUxICE9IC0xKSB7XG4gICAgICAgICAgICB0aGlzLmxpbWl0U3RhdGUxID0gLTE7XG4gICAgICAgICAgICB0aGlzLmxpbWl0SW1wdWxzZTEgPSAwO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLmxpbWl0VmVsb2NpdHkxID0gdGhpcy5sb3dlckxpbWl0MSAtIGFuZ2xlMTtcbiAgICAgICAgfSBlbHNlIGlmIChhbmdsZTEgPiB0aGlzLnVwcGVyTGltaXQxKSB7XG4gICAgICAgICAgaWYgKHRoaXMubGltaXRTdGF0ZTEgIT0gMSkge1xuICAgICAgICAgICAgdGhpcy5saW1pdFN0YXRlMSA9IDE7XG4gICAgICAgICAgICB0aGlzLmxpbWl0SW1wdWxzZTEgPSAwO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLmxpbWl0VmVsb2NpdHkxID0gdGhpcy51cHBlckxpbWl0MSAtIGFuZ2xlMTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLmxpbWl0U3RhdGUxID0gMjtcbiAgICAgICAgICB0aGlzLmxpbWl0SW1wdWxzZTEgPSAwO1xuICAgICAgICAgIHRoaXMubGltaXRWZWxvY2l0eTEgPSAwO1xuICAgICAgICB9XG4gICAgICAgIGlmICghZW5hYmxlU3ByaW5nMSkge1xuICAgICAgICAgIGlmICh0aGlzLmxpbWl0VmVsb2NpdHkxID4gMC4wMikgdGhpcy5saW1pdFZlbG9jaXR5MSAtPSAwLjAyO1xuICAgICAgICAgIGVsc2UgaWYgKHRoaXMubGltaXRWZWxvY2l0eTEgPCAtMC4wMikgdGhpcy5saW1pdFZlbG9jaXR5MSArPSAwLjAyO1xuICAgICAgICAgIGVsc2UgdGhpcy5saW1pdFZlbG9jaXR5MSA9IDA7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMubGltaXRTdGF0ZTEgPSAyO1xuICAgICAgICB0aGlzLmxpbWl0SW1wdWxzZTEgPSAwO1xuICAgICAgfVxuXG4gICAgICB2YXIgYW5nbGUyID0gdGhpcy5saW1pdE1vdG9yMi5hbmdsZTtcbiAgICAgIGlmIChlbmFibGVMaW1pdDIpIHtcbiAgICAgICAgaWYgKHRoaXMubG93ZXJMaW1pdDIgPT0gdGhpcy51cHBlckxpbWl0Mikge1xuICAgICAgICAgIGlmICh0aGlzLmxpbWl0U3RhdGUyICE9IDApIHtcbiAgICAgICAgICAgIHRoaXMubGltaXRTdGF0ZTIgPSAwO1xuICAgICAgICAgICAgdGhpcy5saW1pdEltcHVsc2UyID0gMDtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5saW1pdFZlbG9jaXR5MiA9IHRoaXMubG93ZXJMaW1pdDIgLSBhbmdsZTI7XG4gICAgICAgIH0gZWxzZSBpZiAoYW5nbGUyIDwgdGhpcy5sb3dlckxpbWl0Mikge1xuICAgICAgICAgIGlmICh0aGlzLmxpbWl0U3RhdGUyICE9IC0xKSB7XG4gICAgICAgICAgICB0aGlzLmxpbWl0U3RhdGUyID0gLTE7XG4gICAgICAgICAgICB0aGlzLmxpbWl0SW1wdWxzZTIgPSAwO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLmxpbWl0VmVsb2NpdHkyID0gdGhpcy5sb3dlckxpbWl0MiAtIGFuZ2xlMjtcbiAgICAgICAgfSBlbHNlIGlmIChhbmdsZTIgPiB0aGlzLnVwcGVyTGltaXQyKSB7XG4gICAgICAgICAgaWYgKHRoaXMubGltaXRTdGF0ZTIgIT0gMSkge1xuICAgICAgICAgICAgdGhpcy5saW1pdFN0YXRlMiA9IDE7XG4gICAgICAgICAgICB0aGlzLmxpbWl0SW1wdWxzZTIgPSAwO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLmxpbWl0VmVsb2NpdHkyID0gdGhpcy51cHBlckxpbWl0MiAtIGFuZ2xlMjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLmxpbWl0U3RhdGUyID0gMjtcbiAgICAgICAgICB0aGlzLmxpbWl0SW1wdWxzZTIgPSAwO1xuICAgICAgICAgIHRoaXMubGltaXRWZWxvY2l0eTIgPSAwO1xuICAgICAgICB9XG4gICAgICAgIGlmICghZW5hYmxlU3ByaW5nMikge1xuICAgICAgICAgIGlmICh0aGlzLmxpbWl0VmVsb2NpdHkyID4gMC4wMikgdGhpcy5saW1pdFZlbG9jaXR5MiAtPSAwLjAyO1xuICAgICAgICAgIGVsc2UgaWYgKHRoaXMubGltaXRWZWxvY2l0eTIgPCAtMC4wMikgdGhpcy5saW1pdFZlbG9jaXR5MiArPSAwLjAyO1xuICAgICAgICAgIGVsc2UgdGhpcy5saW1pdFZlbG9jaXR5MiA9IDA7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMubGltaXRTdGF0ZTIgPSAyO1xuICAgICAgICB0aGlzLmxpbWl0SW1wdWxzZTIgPSAwO1xuICAgICAgfVxuXG4gICAgICB2YXIgYW5nbGUzID0gdGhpcy5saW1pdE1vdG9yMy5hbmdsZTtcbiAgICAgIGlmIChlbmFibGVMaW1pdDMpIHtcbiAgICAgICAgaWYgKHRoaXMubG93ZXJMaW1pdDMgPT0gdGhpcy51cHBlckxpbWl0Mykge1xuICAgICAgICAgIGlmICh0aGlzLmxpbWl0U3RhdGUzICE9IDApIHtcbiAgICAgICAgICAgIHRoaXMubGltaXRTdGF0ZTMgPSAwO1xuICAgICAgICAgICAgdGhpcy5saW1pdEltcHVsc2UzID0gMDtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5saW1pdFZlbG9jaXR5MyA9IHRoaXMubG93ZXJMaW1pdDMgLSBhbmdsZTM7XG4gICAgICAgIH0gZWxzZSBpZiAoYW5nbGUzIDwgdGhpcy5sb3dlckxpbWl0Mykge1xuICAgICAgICAgIGlmICh0aGlzLmxpbWl0U3RhdGUzICE9IC0xKSB7XG4gICAgICAgICAgICB0aGlzLmxpbWl0U3RhdGUzID0gLTE7XG4gICAgICAgICAgICB0aGlzLmxpbWl0SW1wdWxzZTMgPSAwO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLmxpbWl0VmVsb2NpdHkzID0gdGhpcy5sb3dlckxpbWl0MyAtIGFuZ2xlMztcbiAgICAgICAgfSBlbHNlIGlmIChhbmdsZTMgPiB0aGlzLnVwcGVyTGltaXQzKSB7XG4gICAgICAgICAgaWYgKHRoaXMubGltaXRTdGF0ZTMgIT0gMSkge1xuICAgICAgICAgICAgdGhpcy5saW1pdFN0YXRlMyA9IDE7XG4gICAgICAgICAgICB0aGlzLmxpbWl0SW1wdWxzZTMgPSAwO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLmxpbWl0VmVsb2NpdHkzID0gdGhpcy51cHBlckxpbWl0MyAtIGFuZ2xlMztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLmxpbWl0U3RhdGUzID0gMjtcbiAgICAgICAgICB0aGlzLmxpbWl0SW1wdWxzZTMgPSAwO1xuICAgICAgICAgIHRoaXMubGltaXRWZWxvY2l0eTMgPSAwO1xuICAgICAgICB9XG4gICAgICAgIGlmICghZW5hYmxlU3ByaW5nMykge1xuICAgICAgICAgIGlmICh0aGlzLmxpbWl0VmVsb2NpdHkzID4gMC4wMikgdGhpcy5saW1pdFZlbG9jaXR5MyAtPSAwLjAyO1xuICAgICAgICAgIGVsc2UgaWYgKHRoaXMubGltaXRWZWxvY2l0eTMgPCAtMC4wMikgdGhpcy5saW1pdFZlbG9jaXR5MyArPSAwLjAyO1xuICAgICAgICAgIGVsc2UgdGhpcy5saW1pdFZlbG9jaXR5MyA9IDA7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMubGltaXRTdGF0ZTMgPSAyO1xuICAgICAgICB0aGlzLmxpbWl0SW1wdWxzZTMgPSAwO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5lbmFibGVNb3RvcjEgJiYgKHRoaXMubGltaXRTdGF0ZTEgIT0gMCB8fCBlbmFibGVTcHJpbmcxKSkge1xuICAgICAgICB0aGlzLm1heE1vdG9ySW1wdWxzZTEgPSB0aGlzLm1heE1vdG9yRm9yY2UxICogdGltZVN0ZXA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLm1vdG9ySW1wdWxzZTEgPSAwO1xuICAgICAgICB0aGlzLm1heE1vdG9ySW1wdWxzZTEgPSAwO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuZW5hYmxlTW90b3IyICYmICh0aGlzLmxpbWl0U3RhdGUyICE9IDAgfHwgZW5hYmxlU3ByaW5nMikpIHtcbiAgICAgICAgdGhpcy5tYXhNb3RvckltcHVsc2UyID0gdGhpcy5tYXhNb3RvckZvcmNlMiAqIHRpbWVTdGVwO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5tb3RvckltcHVsc2UyID0gMDtcbiAgICAgICAgdGhpcy5tYXhNb3RvckltcHVsc2UyID0gMDtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmVuYWJsZU1vdG9yMyAmJiAodGhpcy5saW1pdFN0YXRlMyAhPSAwIHx8IGVuYWJsZVNwcmluZzMpKSB7XG4gICAgICAgIHRoaXMubWF4TW90b3JJbXB1bHNlMyA9IHRoaXMubWF4TW90b3JGb3JjZTMgKiB0aW1lU3RlcDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMubW90b3JJbXB1bHNlMyA9IDA7XG4gICAgICAgIHRoaXMubWF4TW90b3JJbXB1bHNlMyA9IDA7XG4gICAgICB9XG5cbiAgICAgIC8vIGJ1aWxkIGphY29iaWFuc1xuICAgICAgdGhpcy5hMXgxID0gdGhpcy5heDEgKiB0aGlzLmkxZTAwICsgdGhpcy5heTEgKiB0aGlzLmkxZTAxICsgdGhpcy5hejEgKiB0aGlzLmkxZTAyO1xuICAgICAgdGhpcy5hMXkxID0gdGhpcy5heDEgKiB0aGlzLmkxZTEwICsgdGhpcy5heTEgKiB0aGlzLmkxZTExICsgdGhpcy5hejEgKiB0aGlzLmkxZTEyO1xuICAgICAgdGhpcy5hMXoxID0gdGhpcy5heDEgKiB0aGlzLmkxZTIwICsgdGhpcy5heTEgKiB0aGlzLmkxZTIxICsgdGhpcy5hejEgKiB0aGlzLmkxZTIyO1xuICAgICAgdGhpcy5hMngxID0gdGhpcy5heDEgKiB0aGlzLmkyZTAwICsgdGhpcy5heTEgKiB0aGlzLmkyZTAxICsgdGhpcy5hejEgKiB0aGlzLmkyZTAyO1xuICAgICAgdGhpcy5hMnkxID0gdGhpcy5heDEgKiB0aGlzLmkyZTEwICsgdGhpcy5heTEgKiB0aGlzLmkyZTExICsgdGhpcy5hejEgKiB0aGlzLmkyZTEyO1xuICAgICAgdGhpcy5hMnoxID0gdGhpcy5heDEgKiB0aGlzLmkyZTIwICsgdGhpcy5heTEgKiB0aGlzLmkyZTIxICsgdGhpcy5hejEgKiB0aGlzLmkyZTIyO1xuXG4gICAgICB0aGlzLmExeDIgPSB0aGlzLmF4MiAqIHRoaXMuaTFlMDAgKyB0aGlzLmF5MiAqIHRoaXMuaTFlMDEgKyB0aGlzLmF6MiAqIHRoaXMuaTFlMDI7XG4gICAgICB0aGlzLmExeTIgPSB0aGlzLmF4MiAqIHRoaXMuaTFlMTAgKyB0aGlzLmF5MiAqIHRoaXMuaTFlMTEgKyB0aGlzLmF6MiAqIHRoaXMuaTFlMTI7XG4gICAgICB0aGlzLmExejIgPSB0aGlzLmF4MiAqIHRoaXMuaTFlMjAgKyB0aGlzLmF5MiAqIHRoaXMuaTFlMjEgKyB0aGlzLmF6MiAqIHRoaXMuaTFlMjI7XG4gICAgICB0aGlzLmEyeDIgPSB0aGlzLmF4MiAqIHRoaXMuaTJlMDAgKyB0aGlzLmF5MiAqIHRoaXMuaTJlMDEgKyB0aGlzLmF6MiAqIHRoaXMuaTJlMDI7XG4gICAgICB0aGlzLmEyeTIgPSB0aGlzLmF4MiAqIHRoaXMuaTJlMTAgKyB0aGlzLmF5MiAqIHRoaXMuaTJlMTEgKyB0aGlzLmF6MiAqIHRoaXMuaTJlMTI7XG4gICAgICB0aGlzLmEyejIgPSB0aGlzLmF4MiAqIHRoaXMuaTJlMjAgKyB0aGlzLmF5MiAqIHRoaXMuaTJlMjEgKyB0aGlzLmF6MiAqIHRoaXMuaTJlMjI7XG5cbiAgICAgIHRoaXMuYTF4MyA9IHRoaXMuYXgzICogdGhpcy5pMWUwMCArIHRoaXMuYXkzICogdGhpcy5pMWUwMSArIHRoaXMuYXozICogdGhpcy5pMWUwMjtcbiAgICAgIHRoaXMuYTF5MyA9IHRoaXMuYXgzICogdGhpcy5pMWUxMCArIHRoaXMuYXkzICogdGhpcy5pMWUxMSArIHRoaXMuYXozICogdGhpcy5pMWUxMjtcbiAgICAgIHRoaXMuYTF6MyA9IHRoaXMuYXgzICogdGhpcy5pMWUyMCArIHRoaXMuYXkzICogdGhpcy5pMWUyMSArIHRoaXMuYXozICogdGhpcy5pMWUyMjtcbiAgICAgIHRoaXMuYTJ4MyA9IHRoaXMuYXgzICogdGhpcy5pMmUwMCArIHRoaXMuYXkzICogdGhpcy5pMmUwMSArIHRoaXMuYXozICogdGhpcy5pMmUwMjtcbiAgICAgIHRoaXMuYTJ5MyA9IHRoaXMuYXgzICogdGhpcy5pMmUxMCArIHRoaXMuYXkzICogdGhpcy5pMmUxMSArIHRoaXMuYXozICogdGhpcy5pMmUxMjtcbiAgICAgIHRoaXMuYTJ6MyA9IHRoaXMuYXgzICogdGhpcy5pMmUyMCArIHRoaXMuYXkzICogdGhpcy5pMmUyMSArIHRoaXMuYXozICogdGhpcy5pMmUyMjtcblxuICAgICAgLy8gYnVpbGQgYW4gaW1wdWxzZSBtYXRyaXhcbiAgICAgIHRoaXMuazAwID0gdGhpcy5heDEgKiAodGhpcy5hMXgxICsgdGhpcy5hMngxKSArIHRoaXMuYXkxICogKHRoaXMuYTF5MSArIHRoaXMuYTJ5MSkgKyB0aGlzLmF6MSAqICh0aGlzLmExejEgKyB0aGlzLmEyejEpO1xuICAgICAgdGhpcy5rMDEgPSB0aGlzLmF4MSAqICh0aGlzLmExeDIgKyB0aGlzLmEyeDIpICsgdGhpcy5heTEgKiAodGhpcy5hMXkyICsgdGhpcy5hMnkyKSArIHRoaXMuYXoxICogKHRoaXMuYTF6MiArIHRoaXMuYTJ6Mik7XG4gICAgICB0aGlzLmswMiA9IHRoaXMuYXgxICogKHRoaXMuYTF4MyArIHRoaXMuYTJ4MykgKyB0aGlzLmF5MSAqICh0aGlzLmExeTMgKyB0aGlzLmEyeTMpICsgdGhpcy5hejEgKiAodGhpcy5hMXozICsgdGhpcy5hMnozKTtcbiAgICAgIHRoaXMuazEwID0gdGhpcy5heDIgKiAodGhpcy5hMXgxICsgdGhpcy5hMngxKSArIHRoaXMuYXkyICogKHRoaXMuYTF5MSArIHRoaXMuYTJ5MSkgKyB0aGlzLmF6MiAqICh0aGlzLmExejEgKyB0aGlzLmEyejEpO1xuICAgICAgdGhpcy5rMTEgPSB0aGlzLmF4MiAqICh0aGlzLmExeDIgKyB0aGlzLmEyeDIpICsgdGhpcy5heTIgKiAodGhpcy5hMXkyICsgdGhpcy5hMnkyKSArIHRoaXMuYXoyICogKHRoaXMuYTF6MiArIHRoaXMuYTJ6Mik7XG4gICAgICB0aGlzLmsxMiA9IHRoaXMuYXgyICogKHRoaXMuYTF4MyArIHRoaXMuYTJ4MykgKyB0aGlzLmF5MiAqICh0aGlzLmExeTMgKyB0aGlzLmEyeTMpICsgdGhpcy5hejIgKiAodGhpcy5hMXozICsgdGhpcy5hMnozKTtcbiAgICAgIHRoaXMuazIwID0gdGhpcy5heDMgKiAodGhpcy5hMXgxICsgdGhpcy5hMngxKSArIHRoaXMuYXkzICogKHRoaXMuYTF5MSArIHRoaXMuYTJ5MSkgKyB0aGlzLmF6MyAqICh0aGlzLmExejEgKyB0aGlzLmEyejEpO1xuICAgICAgdGhpcy5rMjEgPSB0aGlzLmF4MyAqICh0aGlzLmExeDIgKyB0aGlzLmEyeDIpICsgdGhpcy5heTMgKiAodGhpcy5hMXkyICsgdGhpcy5hMnkyKSArIHRoaXMuYXozICogKHRoaXMuYTF6MiArIHRoaXMuYTJ6Mik7XG4gICAgICB0aGlzLmsyMiA9IHRoaXMuYXgzICogKHRoaXMuYTF4MyArIHRoaXMuYTJ4MykgKyB0aGlzLmF5MyAqICh0aGlzLmExeTMgKyB0aGlzLmEyeTMpICsgdGhpcy5hejMgKiAodGhpcy5hMXozICsgdGhpcy5hMnozKTtcblxuICAgICAgdGhpcy5rdjAwID0gdGhpcy5rMDA7XG4gICAgICB0aGlzLmt2MTEgPSB0aGlzLmsxMTtcbiAgICAgIHRoaXMua3YyMiA9IHRoaXMuazIyO1xuICAgICAgdGhpcy5kdjAwID0gMSAvIHRoaXMua3YwMDtcbiAgICAgIHRoaXMuZHYxMSA9IDEgLyB0aGlzLmt2MTE7XG4gICAgICB0aGlzLmR2MjIgPSAxIC8gdGhpcy5rdjIyO1xuXG4gICAgICBpZiAoZW5hYmxlU3ByaW5nMSAmJiB0aGlzLmxpbWl0U3RhdGUxICE9IDIpIHtcbiAgICAgICAgdmFyIG9tZWdhID0gNi4yODMxODUzICogZnJlcXVlbmN5MTtcbiAgICAgICAgdmFyIGsgPSBvbWVnYSAqIG9tZWdhICogdGltZVN0ZXA7XG4gICAgICAgIHZhciBkbXAgPSBpbnZUaW1lU3RlcCAvIChrICsgMiAqIHRoaXMubGltaXRNb3RvcjEuZGFtcGluZ1JhdGlvICogb21lZ2EpO1xuICAgICAgICB0aGlzLmNmbTEgPSB0aGlzLmt2MDAgKiBkbXA7XG4gICAgICAgIHRoaXMubGltaXRWZWxvY2l0eTEgKj0gayAqIGRtcDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuY2ZtMSA9IDA7XG4gICAgICAgIHRoaXMubGltaXRWZWxvY2l0eTEgKj0gaW52VGltZVN0ZXAgKiAwLjA1O1xuICAgICAgfVxuXG4gICAgICBpZiAoZW5hYmxlU3ByaW5nMiAmJiB0aGlzLmxpbWl0U3RhdGUyICE9IDIpIHtcbiAgICAgICAgb21lZ2EgPSA2LjI4MzE4NTMgKiBmcmVxdWVuY3kyO1xuICAgICAgICBrID0gb21lZ2EgKiBvbWVnYSAqIHRpbWVTdGVwO1xuICAgICAgICBkbXAgPSBpbnZUaW1lU3RlcCAvIChrICsgMiAqIHRoaXMubGltaXRNb3RvcjIuZGFtcGluZ1JhdGlvICogb21lZ2EpO1xuICAgICAgICB0aGlzLmNmbTIgPSB0aGlzLmt2MTEgKiBkbXA7XG4gICAgICAgIHRoaXMubGltaXRWZWxvY2l0eTIgKj0gayAqIGRtcDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuY2ZtMiA9IDA7XG4gICAgICAgIHRoaXMubGltaXRWZWxvY2l0eTIgKj0gaW52VGltZVN0ZXAgKiAwLjA1O1xuICAgICAgfVxuXG4gICAgICBpZiAoZW5hYmxlU3ByaW5nMyAmJiB0aGlzLmxpbWl0U3RhdGUzICE9IDIpIHtcbiAgICAgICAgb21lZ2EgPSA2LjI4MzE4NTMgKiBmcmVxdWVuY3kzO1xuICAgICAgICBrID0gb21lZ2EgKiBvbWVnYSAqIHRpbWVTdGVwO1xuICAgICAgICBkbXAgPSBpbnZUaW1lU3RlcCAvIChrICsgMiAqIHRoaXMubGltaXRNb3RvcjMuZGFtcGluZ1JhdGlvICogb21lZ2EpO1xuICAgICAgICB0aGlzLmNmbTMgPSB0aGlzLmt2MjIgKiBkbXA7XG4gICAgICAgIHRoaXMubGltaXRWZWxvY2l0eTMgKj0gayAqIGRtcDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuY2ZtMyA9IDA7XG4gICAgICAgIHRoaXMubGltaXRWZWxvY2l0eTMgKj0gaW52VGltZVN0ZXAgKiAwLjA1O1xuICAgICAgfVxuXG4gICAgICB0aGlzLmswMCArPSB0aGlzLmNmbTE7XG4gICAgICB0aGlzLmsxMSArPSB0aGlzLmNmbTI7XG4gICAgICB0aGlzLmsyMiArPSB0aGlzLmNmbTM7XG5cbiAgICAgIHZhciBpbnYgPSAxIC8gKFxuICAgICAgICB0aGlzLmswMCAqICh0aGlzLmsxMSAqIHRoaXMuazIyIC0gdGhpcy5rMjEgKiB0aGlzLmsxMikgK1xuICAgICAgICB0aGlzLmsxMCAqICh0aGlzLmsyMSAqIHRoaXMuazAyIC0gdGhpcy5rMDEgKiB0aGlzLmsyMikgK1xuICAgICAgICB0aGlzLmsyMCAqICh0aGlzLmswMSAqIHRoaXMuazEyIC0gdGhpcy5rMTEgKiB0aGlzLmswMilcbiAgICAgICk7XG4gICAgICB0aGlzLmQwMCA9ICh0aGlzLmsxMSAqIHRoaXMuazIyIC0gdGhpcy5rMTIgKiB0aGlzLmsyMSkgKiBpbnY7XG4gICAgICB0aGlzLmQwMSA9ICh0aGlzLmswMiAqIHRoaXMuazIxIC0gdGhpcy5rMDEgKiB0aGlzLmsyMikgKiBpbnY7XG4gICAgICB0aGlzLmQwMiA9ICh0aGlzLmswMSAqIHRoaXMuazEyIC0gdGhpcy5rMDIgKiB0aGlzLmsxMSkgKiBpbnY7XG4gICAgICB0aGlzLmQxMCA9ICh0aGlzLmsxMiAqIHRoaXMuazIwIC0gdGhpcy5rMTAgKiB0aGlzLmsyMikgKiBpbnY7XG4gICAgICB0aGlzLmQxMSA9ICh0aGlzLmswMCAqIHRoaXMuazIyIC0gdGhpcy5rMDIgKiB0aGlzLmsyMCkgKiBpbnY7XG4gICAgICB0aGlzLmQxMiA9ICh0aGlzLmswMiAqIHRoaXMuazEwIC0gdGhpcy5rMDAgKiB0aGlzLmsxMikgKiBpbnY7XG4gICAgICB0aGlzLmQyMCA9ICh0aGlzLmsxMCAqIHRoaXMuazIxIC0gdGhpcy5rMTEgKiB0aGlzLmsyMCkgKiBpbnY7XG4gICAgICB0aGlzLmQyMSA9ICh0aGlzLmswMSAqIHRoaXMuazIwIC0gdGhpcy5rMDAgKiB0aGlzLmsyMSkgKiBpbnY7XG4gICAgICB0aGlzLmQyMiA9ICh0aGlzLmswMCAqIHRoaXMuazExIC0gdGhpcy5rMDEgKiB0aGlzLmsxMCkgKiBpbnY7XG5cbiAgICAgIHRoaXMubGltaXRJbXB1bHNlMSAqPSAwLjk1O1xuICAgICAgdGhpcy5tb3RvckltcHVsc2UxICo9IDAuOTU7XG4gICAgICB0aGlzLmxpbWl0SW1wdWxzZTIgKj0gMC45NTtcbiAgICAgIHRoaXMubW90b3JJbXB1bHNlMiAqPSAwLjk1O1xuICAgICAgdGhpcy5saW1pdEltcHVsc2UzICo9IDAuOTU7XG4gICAgICB0aGlzLm1vdG9ySW1wdWxzZTMgKj0gMC45NTtcbiAgICAgIHZhciB0b3RhbEltcHVsc2UxID0gdGhpcy5saW1pdEltcHVsc2UxICsgdGhpcy5tb3RvckltcHVsc2UxO1xuICAgICAgdmFyIHRvdGFsSW1wdWxzZTIgPSB0aGlzLmxpbWl0SW1wdWxzZTIgKyB0aGlzLm1vdG9ySW1wdWxzZTI7XG4gICAgICB2YXIgdG90YWxJbXB1bHNlMyA9IHRoaXMubGltaXRJbXB1bHNlMyArIHRoaXMubW90b3JJbXB1bHNlMztcbiAgICAgIHRoaXMuYTEueCArPSB0b3RhbEltcHVsc2UxICogdGhpcy5hMXgxICsgdG90YWxJbXB1bHNlMiAqIHRoaXMuYTF4MiArIHRvdGFsSW1wdWxzZTMgKiB0aGlzLmExeDM7XG4gICAgICB0aGlzLmExLnkgKz0gdG90YWxJbXB1bHNlMSAqIHRoaXMuYTF5MSArIHRvdGFsSW1wdWxzZTIgKiB0aGlzLmExeTIgKyB0b3RhbEltcHVsc2UzICogdGhpcy5hMXkzO1xuICAgICAgdGhpcy5hMS56ICs9IHRvdGFsSW1wdWxzZTEgKiB0aGlzLmExejEgKyB0b3RhbEltcHVsc2UyICogdGhpcy5hMXoyICsgdG90YWxJbXB1bHNlMyAqIHRoaXMuYTF6MztcbiAgICAgIHRoaXMuYTIueCAtPSB0b3RhbEltcHVsc2UxICogdGhpcy5hMngxICsgdG90YWxJbXB1bHNlMiAqIHRoaXMuYTJ4MiArIHRvdGFsSW1wdWxzZTMgKiB0aGlzLmEyeDM7XG4gICAgICB0aGlzLmEyLnkgLT0gdG90YWxJbXB1bHNlMSAqIHRoaXMuYTJ5MSArIHRvdGFsSW1wdWxzZTIgKiB0aGlzLmEyeTIgKyB0b3RhbEltcHVsc2UzICogdGhpcy5hMnkzO1xuICAgICAgdGhpcy5hMi56IC09IHRvdGFsSW1wdWxzZTEgKiB0aGlzLmEyejEgKyB0b3RhbEltcHVsc2UyICogdGhpcy5hMnoyICsgdG90YWxJbXB1bHNlMyAqIHRoaXMuYTJ6MztcbiAgICB9LFxuICAgIHNvbHZlXzogZnVuY3Rpb24gKCkge1xuXG4gICAgICB2YXIgcnZ4ID0gdGhpcy5hMi54IC0gdGhpcy5hMS54O1xuICAgICAgdmFyIHJ2eSA9IHRoaXMuYTIueSAtIHRoaXMuYTEueTtcbiAgICAgIHZhciBydnogPSB0aGlzLmEyLnogLSB0aGlzLmExLno7XG5cbiAgICAgIHRoaXMubGltaXRWZWxvY2l0eTMgPSAzMDtcbiAgICAgIHZhciBydm4xID0gcnZ4ICogdGhpcy5heDEgKyBydnkgKiB0aGlzLmF5MSArIHJ2eiAqIHRoaXMuYXoxIC0gdGhpcy5saW1pdFZlbG9jaXR5MTtcbiAgICAgIHZhciBydm4yID0gcnZ4ICogdGhpcy5heDIgKyBydnkgKiB0aGlzLmF5MiArIHJ2eiAqIHRoaXMuYXoyIC0gdGhpcy5saW1pdFZlbG9jaXR5MjtcbiAgICAgIHZhciBydm4zID0gcnZ4ICogdGhpcy5heDMgKyBydnkgKiB0aGlzLmF5MyArIHJ2eiAqIHRoaXMuYXozIC0gdGhpcy5saW1pdFZlbG9jaXR5MztcblxuICAgICAgdmFyIGRMaW1pdEltcHVsc2UxID0gcnZuMSAqIHRoaXMuZDAwICsgcnZuMiAqIHRoaXMuZDAxICsgcnZuMyAqIHRoaXMuZDAyO1xuICAgICAgdmFyIGRMaW1pdEltcHVsc2UyID0gcnZuMSAqIHRoaXMuZDEwICsgcnZuMiAqIHRoaXMuZDExICsgcnZuMyAqIHRoaXMuZDEyO1xuICAgICAgdmFyIGRMaW1pdEltcHVsc2UzID0gcnZuMSAqIHRoaXMuZDIwICsgcnZuMiAqIHRoaXMuZDIxICsgcnZuMyAqIHRoaXMuZDIyO1xuXG4gICAgICB0aGlzLmxpbWl0SW1wdWxzZTEgKz0gZExpbWl0SW1wdWxzZTE7XG4gICAgICB0aGlzLmxpbWl0SW1wdWxzZTIgKz0gZExpbWl0SW1wdWxzZTI7XG4gICAgICB0aGlzLmxpbWl0SW1wdWxzZTMgKz0gZExpbWl0SW1wdWxzZTM7XG5cbiAgICAgIHRoaXMuYTEueCArPSBkTGltaXRJbXB1bHNlMSAqIHRoaXMuYTF4MSArIGRMaW1pdEltcHVsc2UyICogdGhpcy5hMXgyICsgZExpbWl0SW1wdWxzZTMgKiB0aGlzLmExeDM7XG4gICAgICB0aGlzLmExLnkgKz0gZExpbWl0SW1wdWxzZTEgKiB0aGlzLmExeTEgKyBkTGltaXRJbXB1bHNlMiAqIHRoaXMuYTF5MiArIGRMaW1pdEltcHVsc2UzICogdGhpcy5hMXkzO1xuICAgICAgdGhpcy5hMS56ICs9IGRMaW1pdEltcHVsc2UxICogdGhpcy5hMXoxICsgZExpbWl0SW1wdWxzZTIgKiB0aGlzLmExejIgKyBkTGltaXRJbXB1bHNlMyAqIHRoaXMuYTF6MztcbiAgICAgIHRoaXMuYTIueCAtPSBkTGltaXRJbXB1bHNlMSAqIHRoaXMuYTJ4MSArIGRMaW1pdEltcHVsc2UyICogdGhpcy5hMngyICsgZExpbWl0SW1wdWxzZTMgKiB0aGlzLmEyeDM7XG4gICAgICB0aGlzLmEyLnkgLT0gZExpbWl0SW1wdWxzZTEgKiB0aGlzLmEyeTEgKyBkTGltaXRJbXB1bHNlMiAqIHRoaXMuYTJ5MiArIGRMaW1pdEltcHVsc2UzICogdGhpcy5hMnkzO1xuICAgICAgdGhpcy5hMi56IC09IGRMaW1pdEltcHVsc2UxICogdGhpcy5hMnoxICsgZExpbWl0SW1wdWxzZTIgKiB0aGlzLmEyejIgKyBkTGltaXRJbXB1bHNlMyAqIHRoaXMuYTJ6MztcbiAgICB9LFxuICAgIHNvbHZlOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHZhciBydnggPSB0aGlzLmEyLnggLSB0aGlzLmExLng7XG4gICAgICB2YXIgcnZ5ID0gdGhpcy5hMi55IC0gdGhpcy5hMS55O1xuICAgICAgdmFyIHJ2eiA9IHRoaXMuYTIueiAtIHRoaXMuYTEuejtcblxuICAgICAgdmFyIHJ2bjEgPSBydnggKiB0aGlzLmF4MSArIHJ2eSAqIHRoaXMuYXkxICsgcnZ6ICogdGhpcy5hejE7XG4gICAgICB2YXIgcnZuMiA9IHJ2eCAqIHRoaXMuYXgyICsgcnZ5ICogdGhpcy5heTIgKyBydnogKiB0aGlzLmF6MjtcbiAgICAgIHZhciBydm4zID0gcnZ4ICogdGhpcy5heDMgKyBydnkgKiB0aGlzLmF5MyArIHJ2eiAqIHRoaXMuYXozO1xuXG4gICAgICB2YXIgb2xkTW90b3JJbXB1bHNlMSA9IHRoaXMubW90b3JJbXB1bHNlMTtcbiAgICAgIHZhciBvbGRNb3RvckltcHVsc2UyID0gdGhpcy5tb3RvckltcHVsc2UyO1xuICAgICAgdmFyIG9sZE1vdG9ySW1wdWxzZTMgPSB0aGlzLm1vdG9ySW1wdWxzZTM7XG5cbiAgICAgIHZhciBkTW90b3JJbXB1bHNlMSA9IDA7XG4gICAgICB2YXIgZE1vdG9ySW1wdWxzZTIgPSAwO1xuICAgICAgdmFyIGRNb3RvckltcHVsc2UzID0gMDtcblxuICAgICAgaWYgKHRoaXMuZW5hYmxlTW90b3IxKSB7XG4gICAgICAgIGRNb3RvckltcHVsc2UxID0gKHJ2bjEgLSB0aGlzLm1vdG9yU3BlZWQxKSAqIHRoaXMuZHYwMDtcbiAgICAgICAgdGhpcy5tb3RvckltcHVsc2UxICs9IGRNb3RvckltcHVsc2UxO1xuICAgICAgICBpZiAodGhpcy5tb3RvckltcHVsc2UxID4gdGhpcy5tYXhNb3RvckltcHVsc2UxKSB7IC8vIGNsYW1wIG1vdG9yIGltcHVsc2VcbiAgICAgICAgICB0aGlzLm1vdG9ySW1wdWxzZTEgPSB0aGlzLm1heE1vdG9ySW1wdWxzZTE7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5tb3RvckltcHVsc2UxIDwgLXRoaXMubWF4TW90b3JJbXB1bHNlMSkge1xuICAgICAgICAgIHRoaXMubW90b3JJbXB1bHNlMSA9IC10aGlzLm1heE1vdG9ySW1wdWxzZTE7XG4gICAgICAgIH1cbiAgICAgICAgZE1vdG9ySW1wdWxzZTEgPSB0aGlzLm1vdG9ySW1wdWxzZTEgLSBvbGRNb3RvckltcHVsc2UxO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuZW5hYmxlTW90b3IyKSB7XG4gICAgICAgIGRNb3RvckltcHVsc2UyID0gKHJ2bjIgLSB0aGlzLm1vdG9yU3BlZWQyKSAqIHRoaXMuZHYxMTtcbiAgICAgICAgdGhpcy5tb3RvckltcHVsc2UyICs9IGRNb3RvckltcHVsc2UyO1xuICAgICAgICBpZiAodGhpcy5tb3RvckltcHVsc2UyID4gdGhpcy5tYXhNb3RvckltcHVsc2UyKSB7IC8vIGNsYW1wIG1vdG9yIGltcHVsc2VcbiAgICAgICAgICB0aGlzLm1vdG9ySW1wdWxzZTIgPSB0aGlzLm1heE1vdG9ySW1wdWxzZTI7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5tb3RvckltcHVsc2UyIDwgLXRoaXMubWF4TW90b3JJbXB1bHNlMikge1xuICAgICAgICAgIHRoaXMubW90b3JJbXB1bHNlMiA9IC10aGlzLm1heE1vdG9ySW1wdWxzZTI7XG4gICAgICAgIH1cbiAgICAgICAgZE1vdG9ySW1wdWxzZTIgPSB0aGlzLm1vdG9ySW1wdWxzZTIgLSBvbGRNb3RvckltcHVsc2UyO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuZW5hYmxlTW90b3IzKSB7XG4gICAgICAgIGRNb3RvckltcHVsc2UzID0gKHJ2bjMgLSB0aGlzLm1vdG9yU3BlZWQzKSAqIHRoaXMuZHYyMjtcbiAgICAgICAgdGhpcy5tb3RvckltcHVsc2UzICs9IGRNb3RvckltcHVsc2UzO1xuICAgICAgICBpZiAodGhpcy5tb3RvckltcHVsc2UzID4gdGhpcy5tYXhNb3RvckltcHVsc2UzKSB7IC8vIGNsYW1wIG1vdG9yIGltcHVsc2VcbiAgICAgICAgICB0aGlzLm1vdG9ySW1wdWxzZTMgPSB0aGlzLm1heE1vdG9ySW1wdWxzZTM7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5tb3RvckltcHVsc2UzIDwgLXRoaXMubWF4TW90b3JJbXB1bHNlMykge1xuICAgICAgICAgIHRoaXMubW90b3JJbXB1bHNlMyA9IC10aGlzLm1heE1vdG9ySW1wdWxzZTM7XG4gICAgICAgIH1cbiAgICAgICAgZE1vdG9ySW1wdWxzZTMgPSB0aGlzLm1vdG9ySW1wdWxzZTMgLSBvbGRNb3RvckltcHVsc2UzO1xuICAgICAgfVxuXG4gICAgICAvLyBhcHBseSBtb3RvciBpbXB1bHNlIHRvIHJlbGF0aXZlIHZlbG9jaXR5XG4gICAgICBydm4xICs9IGRNb3RvckltcHVsc2UxICogdGhpcy5rdjAwICsgZE1vdG9ySW1wdWxzZTIgKiB0aGlzLmswMSArIGRNb3RvckltcHVsc2UzICogdGhpcy5rMDI7XG4gICAgICBydm4yICs9IGRNb3RvckltcHVsc2UxICogdGhpcy5rMTAgKyBkTW90b3JJbXB1bHNlMiAqIHRoaXMua3YxMSArIGRNb3RvckltcHVsc2UzICogdGhpcy5rMTI7XG4gICAgICBydm4zICs9IGRNb3RvckltcHVsc2UxICogdGhpcy5rMjAgKyBkTW90b3JJbXB1bHNlMiAqIHRoaXMuazIxICsgZE1vdG9ySW1wdWxzZTMgKiB0aGlzLmt2MjI7XG5cbiAgICAgIC8vIHN1YnRyYWN0IHRhcmdldCB2ZWxvY2l0eSBhbmQgYXBwbGllZCBpbXB1bHNlXG4gICAgICBydm4xIC09IHRoaXMubGltaXRWZWxvY2l0eTEgKyB0aGlzLmxpbWl0SW1wdWxzZTEgKiB0aGlzLmNmbTE7XG4gICAgICBydm4yIC09IHRoaXMubGltaXRWZWxvY2l0eTIgKyB0aGlzLmxpbWl0SW1wdWxzZTIgKiB0aGlzLmNmbTI7XG4gICAgICBydm4zIC09IHRoaXMubGltaXRWZWxvY2l0eTMgKyB0aGlzLmxpbWl0SW1wdWxzZTMgKiB0aGlzLmNmbTM7XG5cbiAgICAgIHZhciBvbGRMaW1pdEltcHVsc2UxID0gdGhpcy5saW1pdEltcHVsc2UxO1xuICAgICAgdmFyIG9sZExpbWl0SW1wdWxzZTIgPSB0aGlzLmxpbWl0SW1wdWxzZTI7XG4gICAgICB2YXIgb2xkTGltaXRJbXB1bHNlMyA9IHRoaXMubGltaXRJbXB1bHNlMztcblxuICAgICAgdmFyIGRMaW1pdEltcHVsc2UxID0gcnZuMSAqIHRoaXMuZDAwICsgcnZuMiAqIHRoaXMuZDAxICsgcnZuMyAqIHRoaXMuZDAyO1xuICAgICAgdmFyIGRMaW1pdEltcHVsc2UyID0gcnZuMSAqIHRoaXMuZDEwICsgcnZuMiAqIHRoaXMuZDExICsgcnZuMyAqIHRoaXMuZDEyO1xuICAgICAgdmFyIGRMaW1pdEltcHVsc2UzID0gcnZuMSAqIHRoaXMuZDIwICsgcnZuMiAqIHRoaXMuZDIxICsgcnZuMyAqIHRoaXMuZDIyO1xuXG4gICAgICB0aGlzLmxpbWl0SW1wdWxzZTEgKz0gZExpbWl0SW1wdWxzZTE7XG4gICAgICB0aGlzLmxpbWl0SW1wdWxzZTIgKz0gZExpbWl0SW1wdWxzZTI7XG4gICAgICB0aGlzLmxpbWl0SW1wdWxzZTMgKz0gZExpbWl0SW1wdWxzZTM7XG5cbiAgICAgIC8vIGNsYW1wXG4gICAgICB2YXIgY2xhbXBTdGF0ZSA9IDA7XG4gICAgICBpZiAodGhpcy5saW1pdFN0YXRlMSA9PSAyIHx8IHRoaXMubGltaXRJbXB1bHNlMSAqIHRoaXMubGltaXRTdGF0ZTEgPCAwKSB7XG4gICAgICAgIGRMaW1pdEltcHVsc2UxID0gLW9sZExpbWl0SW1wdWxzZTE7XG4gICAgICAgIHJ2bjIgKz0gZExpbWl0SW1wdWxzZTEgKiB0aGlzLmsxMDtcbiAgICAgICAgcnZuMyArPSBkTGltaXRJbXB1bHNlMSAqIHRoaXMuazIwO1xuICAgICAgICBjbGFtcFN0YXRlIHw9IDE7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5saW1pdFN0YXRlMiA9PSAyIHx8IHRoaXMubGltaXRJbXB1bHNlMiAqIHRoaXMubGltaXRTdGF0ZTIgPCAwKSB7XG4gICAgICAgIGRMaW1pdEltcHVsc2UyID0gLW9sZExpbWl0SW1wdWxzZTI7XG4gICAgICAgIHJ2bjEgKz0gZExpbWl0SW1wdWxzZTIgKiB0aGlzLmswMTtcbiAgICAgICAgcnZuMyArPSBkTGltaXRJbXB1bHNlMiAqIHRoaXMuazIxO1xuICAgICAgICBjbGFtcFN0YXRlIHw9IDI7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5saW1pdFN0YXRlMyA9PSAyIHx8IHRoaXMubGltaXRJbXB1bHNlMyAqIHRoaXMubGltaXRTdGF0ZTMgPCAwKSB7XG4gICAgICAgIGRMaW1pdEltcHVsc2UzID0gLW9sZExpbWl0SW1wdWxzZTM7XG4gICAgICAgIHJ2bjEgKz0gZExpbWl0SW1wdWxzZTMgKiB0aGlzLmswMjtcbiAgICAgICAgcnZuMiArPSBkTGltaXRJbXB1bHNlMyAqIHRoaXMuazEyO1xuICAgICAgICBjbGFtcFN0YXRlIHw9IDQ7XG4gICAgICB9XG5cbiAgICAgIC8vIHVwZGF0ZSB1bi1jbGFtcGVkIGltcHVsc2VcbiAgICAgIC8vIFRPRE86IGlzb2xhdGUgZGl2aXNpb25cbiAgICAgIHZhciBkZXQ7XG4gICAgICBzd2l0Y2ggKGNsYW1wU3RhdGUpIHtcbiAgICAgICAgY2FzZSAxOiAvLyB1cGRhdGUgMiAzXG4gICAgICAgICAgZGV0ID0gMSAvICh0aGlzLmsxMSAqIHRoaXMuazIyIC0gdGhpcy5rMTIgKiB0aGlzLmsyMSk7XG4gICAgICAgICAgZExpbWl0SW1wdWxzZTIgPSAodGhpcy5rMjIgKiBydm4yICsgLXRoaXMuazEyICogcnZuMykgKiBkZXQ7XG4gICAgICAgICAgZExpbWl0SW1wdWxzZTMgPSAoLXRoaXMuazIxICogcnZuMiArIHRoaXMuazExICogcnZuMykgKiBkZXQ7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMjogLy8gdXBkYXRlIDEgM1xuICAgICAgICAgIGRldCA9IDEgLyAodGhpcy5rMDAgKiB0aGlzLmsyMiAtIHRoaXMuazAyICogdGhpcy5rMjApO1xuICAgICAgICAgIGRMaW1pdEltcHVsc2UxID0gKHRoaXMuazIyICogcnZuMSArIC10aGlzLmswMiAqIHJ2bjMpICogZGV0O1xuICAgICAgICAgIGRMaW1pdEltcHVsc2UzID0gKC10aGlzLmsyMCAqIHJ2bjEgKyB0aGlzLmswMCAqIHJ2bjMpICogZGV0O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDM6IC8vIHVwZGF0ZSAzXG4gICAgICAgICAgZExpbWl0SW1wdWxzZTMgPSBydm4zIC8gdGhpcy5rMjI7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNDogLy8gdXBkYXRlIDEgMlxuICAgICAgICAgIGRldCA9IDEgLyAodGhpcy5rMDAgKiB0aGlzLmsxMSAtIHRoaXMuazAxICogdGhpcy5rMTApO1xuICAgICAgICAgIGRMaW1pdEltcHVsc2UxID0gKHRoaXMuazExICogcnZuMSArIC10aGlzLmswMSAqIHJ2bjIpICogZGV0O1xuICAgICAgICAgIGRMaW1pdEltcHVsc2UyID0gKC10aGlzLmsxMCAqIHJ2bjEgKyB0aGlzLmswMCAqIHJ2bjIpICogZGV0O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDU6IC8vIHVwZGF0ZSAyXG4gICAgICAgICAgZExpbWl0SW1wdWxzZTIgPSBydm4yIC8gdGhpcy5rMTE7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNjogLy8gdXBkYXRlIDFcbiAgICAgICAgICBkTGltaXRJbXB1bHNlMSA9IHJ2bjEgLyB0aGlzLmswMDtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgdGhpcy5saW1pdEltcHVsc2UxID0gZExpbWl0SW1wdWxzZTEgKyBvbGRMaW1pdEltcHVsc2UxO1xuICAgICAgdGhpcy5saW1pdEltcHVsc2UyID0gZExpbWl0SW1wdWxzZTIgKyBvbGRMaW1pdEltcHVsc2UyO1xuICAgICAgdGhpcy5saW1pdEltcHVsc2UzID0gZExpbWl0SW1wdWxzZTMgKyBvbGRMaW1pdEltcHVsc2UzO1xuXG4gICAgICB2YXIgZEltcHVsc2UxID0gZE1vdG9ySW1wdWxzZTEgKyBkTGltaXRJbXB1bHNlMTtcbiAgICAgIHZhciBkSW1wdWxzZTIgPSBkTW90b3JJbXB1bHNlMiArIGRMaW1pdEltcHVsc2UyO1xuICAgICAgdmFyIGRJbXB1bHNlMyA9IGRNb3RvckltcHVsc2UzICsgZExpbWl0SW1wdWxzZTM7XG5cbiAgICAgIC8vIGFwcGx5IGltcHVsc2VcbiAgICAgIHRoaXMuYTEueCArPSBkSW1wdWxzZTEgKiB0aGlzLmExeDEgKyBkSW1wdWxzZTIgKiB0aGlzLmExeDIgKyBkSW1wdWxzZTMgKiB0aGlzLmExeDM7XG4gICAgICB0aGlzLmExLnkgKz0gZEltcHVsc2UxICogdGhpcy5hMXkxICsgZEltcHVsc2UyICogdGhpcy5hMXkyICsgZEltcHVsc2UzICogdGhpcy5hMXkzO1xuICAgICAgdGhpcy5hMS56ICs9IGRJbXB1bHNlMSAqIHRoaXMuYTF6MSArIGRJbXB1bHNlMiAqIHRoaXMuYTF6MiArIGRJbXB1bHNlMyAqIHRoaXMuYTF6MztcbiAgICAgIHRoaXMuYTIueCAtPSBkSW1wdWxzZTEgKiB0aGlzLmEyeDEgKyBkSW1wdWxzZTIgKiB0aGlzLmEyeDIgKyBkSW1wdWxzZTMgKiB0aGlzLmEyeDM7XG4gICAgICB0aGlzLmEyLnkgLT0gZEltcHVsc2UxICogdGhpcy5hMnkxICsgZEltcHVsc2UyICogdGhpcy5hMnkyICsgZEltcHVsc2UzICogdGhpcy5hMnkzO1xuICAgICAgdGhpcy5hMi56IC09IGRJbXB1bHNlMSAqIHRoaXMuYTJ6MSArIGRJbXB1bHNlMiAqIHRoaXMuYTJ6MiArIGRJbXB1bHNlMyAqIHRoaXMuYTJ6MztcbiAgICAgIHJ2eCA9IHRoaXMuYTIueCAtIHRoaXMuYTEueDtcbiAgICAgIHJ2eSA9IHRoaXMuYTIueSAtIHRoaXMuYTEueTtcbiAgICAgIHJ2eiA9IHRoaXMuYTIueiAtIHRoaXMuYTEuejtcblxuICAgICAgcnZuMiA9IHJ2eCAqIHRoaXMuYXgyICsgcnZ5ICogdGhpcy5heTIgKyBydnogKiB0aGlzLmF6MjtcbiAgICB9XG5cbiAgfSk7XG5cbiAgLyoqXG4gICAqIEEgaGluZ2Ugam9pbnQgYWxsb3dzIG9ubHkgZm9yIHJlbGF0aXZlIHJvdGF0aW9uIG9mIHJpZ2lkIGJvZGllcyBhbG9uZyB0aGUgYXhpcy5cbiAgICpcbiAgICogQGF1dGhvciBzYWhhcmFuXG4gICAqIEBhdXRob3IgbG8tdGhcbiAgICovXG5cbiAgZnVuY3Rpb24gSGluZ2VKb2ludChjb25maWcsIGxvd2VyQW5nbGVMaW1pdCwgdXBwZXJBbmdsZUxpbWl0KSB7XG5cbiAgICBKb2ludC5jYWxsKHRoaXMsIGNvbmZpZyk7XG5cbiAgICB0aGlzLnR5cGUgPSBKT0lOVF9ISU5HRTtcblxuICAgIC8vIFRoZSBheGlzIGluIHRoZSBmaXJzdCBib2R5J3MgY29vcmRpbmF0ZSBzeXN0ZW0uXG4gICAgdGhpcy5sb2NhbEF4aXMxID0gY29uZmlnLmxvY2FsQXhpczEuY2xvbmUoKS5ub3JtYWxpemUoKTtcbiAgICAvLyBUaGUgYXhpcyBpbiB0aGUgc2Vjb25kIGJvZHkncyBjb29yZGluYXRlIHN5c3RlbS5cbiAgICB0aGlzLmxvY2FsQXhpczIgPSBjb25maWcubG9jYWxBeGlzMi5jbG9uZSgpLm5vcm1hbGl6ZSgpO1xuXG4gICAgLy8gbWFrZSBhbmdsZSBheGlzXG4gICAgdmFyIGFyYyA9IG5ldyBNYXQzMygpLnNldFF1YXQobmV3IFF1YXQoKS5zZXRGcm9tVW5pdFZlY3RvcnModGhpcy5sb2NhbEF4aXMxLCB0aGlzLmxvY2FsQXhpczIpKTtcbiAgICB0aGlzLmxvY2FsQW5nbGUxID0gbmV3IFZlYzMoKS50YW5nZW50KHRoaXMubG9jYWxBeGlzMSkubm9ybWFsaXplKCk7XG4gICAgdGhpcy5sb2NhbEFuZ2xlMiA9IHRoaXMubG9jYWxBbmdsZTEuY2xvbmUoKS5hcHBseU1hdHJpeDMoYXJjLCB0cnVlKTtcblxuICAgIHRoaXMuYXgxID0gbmV3IFZlYzMoKTtcbiAgICB0aGlzLmF4MiA9IG5ldyBWZWMzKCk7XG4gICAgdGhpcy5hbjEgPSBuZXcgVmVjMygpO1xuICAgIHRoaXMuYW4yID0gbmV3IFZlYzMoKTtcblxuICAgIHRoaXMudG1wID0gbmV3IFZlYzMoKTtcblxuICAgIHRoaXMubm9yID0gbmV3IFZlYzMoKTtcbiAgICB0aGlzLnRhbiA9IG5ldyBWZWMzKCk7XG4gICAgdGhpcy5iaW4gPSBuZXcgVmVjMygpO1xuXG4gICAgLy8gVGhlIHJvdGF0aW9uYWwgbGltaXQgYW5kIG1vdG9yIGluZm9ybWF0aW9uIG9mIHRoZSBqb2ludC5cbiAgICB0aGlzLmxpbWl0TW90b3IgPSBuZXcgTGltaXRNb3Rvcih0aGlzLm5vciwgZmFsc2UpO1xuICAgIHRoaXMubGltaXRNb3Rvci5sb3dlckxpbWl0ID0gbG93ZXJBbmdsZUxpbWl0O1xuICAgIHRoaXMubGltaXRNb3Rvci51cHBlckxpbWl0ID0gdXBwZXJBbmdsZUxpbWl0O1xuXG4gICAgdGhpcy5sYyA9IG5ldyBMaW5lYXJDb25zdHJhaW50KHRoaXMpO1xuICAgIHRoaXMucjMgPSBuZXcgUm90YXRpb25hbDNDb25zdHJhaW50KHRoaXMsIHRoaXMubGltaXRNb3RvciwgbmV3IExpbWl0TW90b3IodGhpcy50YW4sIHRydWUpLCBuZXcgTGltaXRNb3Rvcih0aGlzLmJpbiwgdHJ1ZSkpO1xuICB9XG4gIEhpbmdlSm9pbnQucHJvdG90eXBlID0gT2JqZWN0LmFzc2lnbihPYmplY3QuY3JlYXRlKEpvaW50LnByb3RvdHlwZSksIHtcblxuICAgIGNvbnN0cnVjdG9yOiBIaW5nZUpvaW50LFxuXG5cbiAgICBwcmVTb2x2ZTogZnVuY3Rpb24gKHRpbWVTdGVwLCBpbnZUaW1lU3RlcCkge1xuXG4gICAgICB0aGlzLnVwZGF0ZUFuY2hvclBvaW50cygpO1xuXG4gICAgICB0aGlzLmF4MS5jb3B5KHRoaXMubG9jYWxBeGlzMSkuYXBwbHlNYXRyaXgzKHRoaXMuYm9keTEucm90YXRpb24sIHRydWUpO1xuICAgICAgdGhpcy5heDIuY29weSh0aGlzLmxvY2FsQXhpczIpLmFwcGx5TWF0cml4Myh0aGlzLmJvZHkyLnJvdGF0aW9uLCB0cnVlKTtcblxuICAgICAgdGhpcy5hbjEuY29weSh0aGlzLmxvY2FsQW5nbGUxKS5hcHBseU1hdHJpeDModGhpcy5ib2R5MS5yb3RhdGlvbiwgdHJ1ZSk7XG4gICAgICB0aGlzLmFuMi5jb3B5KHRoaXMubG9jYWxBbmdsZTIpLmFwcGx5TWF0cml4Myh0aGlzLmJvZHkyLnJvdGF0aW9uLCB0cnVlKTtcblxuICAgICAgLy8gbm9ybWFsIHRhbmdlbnQgYmlub3JtYWxcblxuICAgICAgdGhpcy5ub3Iuc2V0KFxuICAgICAgICB0aGlzLmF4MS54ICogdGhpcy5ib2R5Mi5pbnZlcnNlTWFzcyArIHRoaXMuYXgyLnggKiB0aGlzLmJvZHkxLmludmVyc2VNYXNzLFxuICAgICAgICB0aGlzLmF4MS55ICogdGhpcy5ib2R5Mi5pbnZlcnNlTWFzcyArIHRoaXMuYXgyLnkgKiB0aGlzLmJvZHkxLmludmVyc2VNYXNzLFxuICAgICAgICB0aGlzLmF4MS56ICogdGhpcy5ib2R5Mi5pbnZlcnNlTWFzcyArIHRoaXMuYXgyLnogKiB0aGlzLmJvZHkxLmludmVyc2VNYXNzXG4gICAgICApLm5vcm1hbGl6ZSgpO1xuXG4gICAgICB0aGlzLnRhbi50YW5nZW50KHRoaXMubm9yKS5ub3JtYWxpemUoKTtcblxuICAgICAgdGhpcy5iaW4uY3Jvc3NWZWN0b3JzKHRoaXMubm9yLCB0aGlzLnRhbik7XG5cbiAgICAgIC8vIGNhbGN1bGF0ZSBoaW5nZSBhbmdsZVxuXG4gICAgICB2YXIgbGltaXRlID0gX01hdGguYWNvc0NsYW1wKF9NYXRoLmRvdFZlY3RvcnModGhpcy5hbjEsIHRoaXMuYW4yKSk7XG5cbiAgICAgIHRoaXMudG1wLmNyb3NzVmVjdG9ycyh0aGlzLmFuMSwgdGhpcy5hbjIpO1xuXG4gICAgICBpZiAoX01hdGguZG90VmVjdG9ycyh0aGlzLm5vciwgdGhpcy50bXApIDwgMCkgdGhpcy5saW1pdE1vdG9yLmFuZ2xlID0gLWxpbWl0ZTtcbiAgICAgIGVsc2UgdGhpcy5saW1pdE1vdG9yLmFuZ2xlID0gbGltaXRlO1xuXG4gICAgICB0aGlzLnRtcC5jcm9zc1ZlY3RvcnModGhpcy5heDEsIHRoaXMuYXgyKTtcblxuICAgICAgdGhpcy5yMy5saW1pdE1vdG9yMi5hbmdsZSA9IF9NYXRoLmRvdFZlY3RvcnModGhpcy50YW4sIHRoaXMudG1wKTtcbiAgICAgIHRoaXMucjMubGltaXRNb3RvcjMuYW5nbGUgPSBfTWF0aC5kb3RWZWN0b3JzKHRoaXMuYmluLCB0aGlzLnRtcCk7XG5cbiAgICAgIC8vIHByZVNvbHZlXG5cbiAgICAgIHRoaXMucjMucHJlU29sdmUodGltZVN0ZXAsIGludlRpbWVTdGVwKTtcbiAgICAgIHRoaXMubGMucHJlU29sdmUodGltZVN0ZXAsIGludlRpbWVTdGVwKTtcblxuICAgIH0sXG5cbiAgICBzb2x2ZTogZnVuY3Rpb24gKCkge1xuXG4gICAgICB0aGlzLnIzLnNvbHZlKCk7XG4gICAgICB0aGlzLmxjLnNvbHZlKCk7XG5cbiAgICB9LFxuXG4gICAgcG9zdFNvbHZlOiBmdW5jdGlvbiAoKSB7XG5cbiAgICB9XG5cbiAgfSk7XG5cbiAgLyoqXG4gICAqIEEgYmFsbC1hbmQtc29ja2V0IGpvaW50IGxpbWl0cyByZWxhdGl2ZSB0cmFuc2xhdGlvbiBvbiB0d28gYW5jaG9yIHBvaW50cyBvbiByaWdpZCBib2RpZXMuXG4gICAqXG4gICAqIEBhdXRob3Igc2FoYXJhblxuICAgKiBAYXV0aG9yIGxvLXRoXG4gICAqL1xuXG4gIGZ1bmN0aW9uIEJhbGxBbmRTb2NrZXRKb2ludChjb25maWcpIHtcblxuICAgIEpvaW50LmNhbGwodGhpcywgY29uZmlnKTtcblxuICAgIHRoaXMudHlwZSA9IEpPSU5UX0JBTExfQU5EX1NPQ0tFVDtcblxuICAgIHRoaXMubGMgPSBuZXcgTGluZWFyQ29uc3RyYWludCh0aGlzKTtcblxuICB9XG4gIEJhbGxBbmRTb2NrZXRKb2ludC5wcm90b3R5cGUgPSBPYmplY3QuYXNzaWduKE9iamVjdC5jcmVhdGUoSm9pbnQucHJvdG90eXBlKSwge1xuXG4gICAgY29uc3RydWN0b3I6IEJhbGxBbmRTb2NrZXRKb2ludCxcblxuICAgIHByZVNvbHZlOiBmdW5jdGlvbiAodGltZVN0ZXAsIGludlRpbWVTdGVwKSB7XG5cbiAgICAgIHRoaXMudXBkYXRlQW5jaG9yUG9pbnRzKCk7XG5cbiAgICAgIC8vIHByZVNvbHZlXG5cbiAgICAgIHRoaXMubGMucHJlU29sdmUodGltZVN0ZXAsIGludlRpbWVTdGVwKTtcblxuICAgIH0sXG5cbiAgICBzb2x2ZTogZnVuY3Rpb24gKCkge1xuXG4gICAgICB0aGlzLmxjLnNvbHZlKCk7XG5cbiAgICB9LFxuXG4gICAgcG9zdFNvbHZlOiBmdW5jdGlvbiAoKSB7XG5cbiAgICB9XG5cbiAgfSk7XG5cbiAgLyoqXG4gICogQSB0cmFuc2xhdGlvbmFsIGNvbnN0cmFpbnQgZm9yIHZhcmlvdXMgam9pbnRzLlxuICAqIEBhdXRob3Igc2FoYXJhblxuICAqL1xuICBmdW5jdGlvbiBUcmFuc2xhdGlvbmFsQ29uc3RyYWludChqb2ludCwgbGltaXRNb3Rvcikge1xuICAgIHRoaXMuY2ZtID0gTmFOO1xuICAgIHRoaXMubTEgPSBOYU47XG4gICAgdGhpcy5tMiA9IE5hTjtcbiAgICB0aGlzLmkxZTAwID0gTmFOO1xuICAgIHRoaXMuaTFlMDEgPSBOYU47XG4gICAgdGhpcy5pMWUwMiA9IE5hTjtcbiAgICB0aGlzLmkxZTEwID0gTmFOO1xuICAgIHRoaXMuaTFlMTEgPSBOYU47XG4gICAgdGhpcy5pMWUxMiA9IE5hTjtcbiAgICB0aGlzLmkxZTIwID0gTmFOO1xuICAgIHRoaXMuaTFlMjEgPSBOYU47XG4gICAgdGhpcy5pMWUyMiA9IE5hTjtcbiAgICB0aGlzLmkyZTAwID0gTmFOO1xuICAgIHRoaXMuaTJlMDEgPSBOYU47XG4gICAgdGhpcy5pMmUwMiA9IE5hTjtcbiAgICB0aGlzLmkyZTEwID0gTmFOO1xuICAgIHRoaXMuaTJlMTEgPSBOYU47XG4gICAgdGhpcy5pMmUxMiA9IE5hTjtcbiAgICB0aGlzLmkyZTIwID0gTmFOO1xuICAgIHRoaXMuaTJlMjEgPSBOYU47XG4gICAgdGhpcy5pMmUyMiA9IE5hTjtcbiAgICB0aGlzLm1vdG9yRGVub20gPSBOYU47XG4gICAgdGhpcy5pbnZNb3RvckRlbm9tID0gTmFOO1xuICAgIHRoaXMuaW52RGVub20gPSBOYU47XG4gICAgdGhpcy5heCA9IE5hTjtcbiAgICB0aGlzLmF5ID0gTmFOO1xuICAgIHRoaXMuYXogPSBOYU47XG4gICAgdGhpcy5yMXggPSBOYU47XG4gICAgdGhpcy5yMXkgPSBOYU47XG4gICAgdGhpcy5yMXogPSBOYU47XG4gICAgdGhpcy5yMnggPSBOYU47XG4gICAgdGhpcy5yMnkgPSBOYU47XG4gICAgdGhpcy5yMnogPSBOYU47XG4gICAgdGhpcy50MXggPSBOYU47XG4gICAgdGhpcy50MXkgPSBOYU47XG4gICAgdGhpcy50MXogPSBOYU47XG4gICAgdGhpcy50MnggPSBOYU47XG4gICAgdGhpcy50MnkgPSBOYU47XG4gICAgdGhpcy50MnogPSBOYU47XG4gICAgdGhpcy5sMXggPSBOYU47XG4gICAgdGhpcy5sMXkgPSBOYU47XG4gICAgdGhpcy5sMXogPSBOYU47XG4gICAgdGhpcy5sMnggPSBOYU47XG4gICAgdGhpcy5sMnkgPSBOYU47XG4gICAgdGhpcy5sMnogPSBOYU47XG4gICAgdGhpcy5hMXggPSBOYU47XG4gICAgdGhpcy5hMXkgPSBOYU47XG4gICAgdGhpcy5hMXogPSBOYU47XG4gICAgdGhpcy5hMnggPSBOYU47XG4gICAgdGhpcy5hMnkgPSBOYU47XG4gICAgdGhpcy5hMnogPSBOYU47XG4gICAgdGhpcy5sb3dlckxpbWl0ID0gTmFOO1xuICAgIHRoaXMudXBwZXJMaW1pdCA9IE5hTjtcbiAgICB0aGlzLmxpbWl0VmVsb2NpdHkgPSBOYU47XG4gICAgdGhpcy5saW1pdFN0YXRlID0gMDsgLy8gLTE6IGF0IGxvd2VyLCAwOiBsb2NrZWQsIDE6IGF0IHVwcGVyLCAyOiBmcmVlXG4gICAgdGhpcy5lbmFibGVNb3RvciA9IGZhbHNlO1xuICAgIHRoaXMubW90b3JTcGVlZCA9IE5hTjtcbiAgICB0aGlzLm1heE1vdG9yRm9yY2UgPSBOYU47XG4gICAgdGhpcy5tYXhNb3RvckltcHVsc2UgPSBOYU47XG5cbiAgICB0aGlzLmxpbWl0TW90b3IgPSBsaW1pdE1vdG9yO1xuICAgIHRoaXMuYjEgPSBqb2ludC5ib2R5MTtcbiAgICB0aGlzLmIyID0gam9pbnQuYm9keTI7XG4gICAgdGhpcy5wMSA9IGpvaW50LmFuY2hvclBvaW50MTtcbiAgICB0aGlzLnAyID0gam9pbnQuYW5jaG9yUG9pbnQyO1xuICAgIHRoaXMucjEgPSBqb2ludC5yZWxhdGl2ZUFuY2hvclBvaW50MTtcbiAgICB0aGlzLnIyID0gam9pbnQucmVsYXRpdmVBbmNob3JQb2ludDI7XG4gICAgdGhpcy5sMSA9IHRoaXMuYjEubGluZWFyVmVsb2NpdHk7XG4gICAgdGhpcy5sMiA9IHRoaXMuYjIubGluZWFyVmVsb2NpdHk7XG4gICAgdGhpcy5hMSA9IHRoaXMuYjEuYW5ndWxhclZlbG9jaXR5O1xuICAgIHRoaXMuYTIgPSB0aGlzLmIyLmFuZ3VsYXJWZWxvY2l0eTtcbiAgICB0aGlzLmkxID0gdGhpcy5iMS5pbnZlcnNlSW5lcnRpYTtcbiAgICB0aGlzLmkyID0gdGhpcy5iMi5pbnZlcnNlSW5lcnRpYTtcbiAgICB0aGlzLmxpbWl0SW1wdWxzZSA9IDA7XG4gICAgdGhpcy5tb3RvckltcHVsc2UgPSAwO1xuICB9XG5cbiAgT2JqZWN0LmFzc2lnbihUcmFuc2xhdGlvbmFsQ29uc3RyYWludC5wcm90b3R5cGUsIHtcblxuICAgIFRyYW5zbGF0aW9uYWxDb25zdHJhaW50OiB0cnVlLFxuXG4gICAgcHJlU29sdmU6IGZ1bmN0aW9uICh0aW1lU3RlcCwgaW52VGltZVN0ZXApIHtcbiAgICAgIHRoaXMuYXggPSB0aGlzLmxpbWl0TW90b3IuYXhpcy54O1xuICAgICAgdGhpcy5heSA9IHRoaXMubGltaXRNb3Rvci5heGlzLnk7XG4gICAgICB0aGlzLmF6ID0gdGhpcy5saW1pdE1vdG9yLmF4aXMuejtcbiAgICAgIHRoaXMubG93ZXJMaW1pdCA9IHRoaXMubGltaXRNb3Rvci5sb3dlckxpbWl0O1xuICAgICAgdGhpcy51cHBlckxpbWl0ID0gdGhpcy5saW1pdE1vdG9yLnVwcGVyTGltaXQ7XG4gICAgICB0aGlzLm1vdG9yU3BlZWQgPSB0aGlzLmxpbWl0TW90b3IubW90b3JTcGVlZDtcbiAgICAgIHRoaXMubWF4TW90b3JGb3JjZSA9IHRoaXMubGltaXRNb3Rvci5tYXhNb3RvckZvcmNlO1xuICAgICAgdGhpcy5lbmFibGVNb3RvciA9IHRoaXMubWF4TW90b3JGb3JjZSA+IDA7XG4gICAgICB0aGlzLm0xID0gdGhpcy5iMS5pbnZlcnNlTWFzcztcbiAgICAgIHRoaXMubTIgPSB0aGlzLmIyLmludmVyc2VNYXNzO1xuXG4gICAgICB2YXIgdGkxID0gdGhpcy5pMS5lbGVtZW50cztcbiAgICAgIHZhciB0aTIgPSB0aGlzLmkyLmVsZW1lbnRzO1xuICAgICAgdGhpcy5pMWUwMCA9IHRpMVswXTtcbiAgICAgIHRoaXMuaTFlMDEgPSB0aTFbMV07XG4gICAgICB0aGlzLmkxZTAyID0gdGkxWzJdO1xuICAgICAgdGhpcy5pMWUxMCA9IHRpMVszXTtcbiAgICAgIHRoaXMuaTFlMTEgPSB0aTFbNF07XG4gICAgICB0aGlzLmkxZTEyID0gdGkxWzVdO1xuICAgICAgdGhpcy5pMWUyMCA9IHRpMVs2XTtcbiAgICAgIHRoaXMuaTFlMjEgPSB0aTFbN107XG4gICAgICB0aGlzLmkxZTIyID0gdGkxWzhdO1xuXG4gICAgICB0aGlzLmkyZTAwID0gdGkyWzBdO1xuICAgICAgdGhpcy5pMmUwMSA9IHRpMlsxXTtcbiAgICAgIHRoaXMuaTJlMDIgPSB0aTJbMl07XG4gICAgICB0aGlzLmkyZTEwID0gdGkyWzNdO1xuICAgICAgdGhpcy5pMmUxMSA9IHRpMls0XTtcbiAgICAgIHRoaXMuaTJlMTIgPSB0aTJbNV07XG4gICAgICB0aGlzLmkyZTIwID0gdGkyWzZdO1xuICAgICAgdGhpcy5pMmUyMSA9IHRpMls3XTtcbiAgICAgIHRoaXMuaTJlMjIgPSB0aTJbOF07XG5cbiAgICAgIHZhciBkeCA9IHRoaXMucDIueCAtIHRoaXMucDEueDtcbiAgICAgIHZhciBkeSA9IHRoaXMucDIueSAtIHRoaXMucDEueTtcbiAgICAgIHZhciBkeiA9IHRoaXMucDIueiAtIHRoaXMucDEuejtcbiAgICAgIHZhciBkID0gZHggKiB0aGlzLmF4ICsgZHkgKiB0aGlzLmF5ICsgZHogKiB0aGlzLmF6O1xuICAgICAgdmFyIGZyZXF1ZW5jeSA9IHRoaXMubGltaXRNb3Rvci5mcmVxdWVuY3k7XG4gICAgICB2YXIgZW5hYmxlU3ByaW5nID0gZnJlcXVlbmN5ID4gMDtcbiAgICAgIHZhciBlbmFibGVMaW1pdCA9IHRoaXMubG93ZXJMaW1pdCA8PSB0aGlzLnVwcGVyTGltaXQ7XG4gICAgICBpZiAoZW5hYmxlU3ByaW5nICYmIGQgPiAyMCB8fCBkIDwgLTIwKSB7XG4gICAgICAgIGVuYWJsZVNwcmluZyA9IGZhbHNlO1xuICAgICAgfVxuXG4gICAgICBpZiAoZW5hYmxlTGltaXQpIHtcbiAgICAgICAgaWYgKHRoaXMubG93ZXJMaW1pdCA9PSB0aGlzLnVwcGVyTGltaXQpIHtcbiAgICAgICAgICBpZiAodGhpcy5saW1pdFN0YXRlICE9IDApIHtcbiAgICAgICAgICAgIHRoaXMubGltaXRTdGF0ZSA9IDA7XG4gICAgICAgICAgICB0aGlzLmxpbWl0SW1wdWxzZSA9IDA7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMubGltaXRWZWxvY2l0eSA9IHRoaXMubG93ZXJMaW1pdCAtIGQ7XG4gICAgICAgICAgaWYgKCFlbmFibGVTcHJpbmcpIGQgPSB0aGlzLmxvd2VyTGltaXQ7XG4gICAgICAgIH0gZWxzZSBpZiAoZCA8IHRoaXMubG93ZXJMaW1pdCkge1xuICAgICAgICAgIGlmICh0aGlzLmxpbWl0U3RhdGUgIT0gLTEpIHtcbiAgICAgICAgICAgIHRoaXMubGltaXRTdGF0ZSA9IC0xO1xuICAgICAgICAgICAgdGhpcy5saW1pdEltcHVsc2UgPSAwO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLmxpbWl0VmVsb2NpdHkgPSB0aGlzLmxvd2VyTGltaXQgLSBkO1xuICAgICAgICAgIGlmICghZW5hYmxlU3ByaW5nKSBkID0gdGhpcy5sb3dlckxpbWl0O1xuICAgICAgICB9IGVsc2UgaWYgKGQgPiB0aGlzLnVwcGVyTGltaXQpIHtcbiAgICAgICAgICBpZiAodGhpcy5saW1pdFN0YXRlICE9IDEpIHtcbiAgICAgICAgICAgIHRoaXMubGltaXRTdGF0ZSA9IDE7XG4gICAgICAgICAgICB0aGlzLmxpbWl0SW1wdWxzZSA9IDA7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMubGltaXRWZWxvY2l0eSA9IHRoaXMudXBwZXJMaW1pdCAtIGQ7XG4gICAgICAgICAgaWYgKCFlbmFibGVTcHJpbmcpIGQgPSB0aGlzLnVwcGVyTGltaXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5saW1pdFN0YXRlID0gMjtcbiAgICAgICAgICB0aGlzLmxpbWl0SW1wdWxzZSA9IDA7XG4gICAgICAgICAgdGhpcy5saW1pdFZlbG9jaXR5ID0gMDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWVuYWJsZVNwcmluZykge1xuICAgICAgICAgIGlmICh0aGlzLmxpbWl0VmVsb2NpdHkgPiAwLjAwNSkgdGhpcy5saW1pdFZlbG9jaXR5IC09IDAuMDA1O1xuICAgICAgICAgIGVsc2UgaWYgKHRoaXMubGltaXRWZWxvY2l0eSA8IC0wLjAwNSkgdGhpcy5saW1pdFZlbG9jaXR5ICs9IDAuMDA1O1xuICAgICAgICAgIGVsc2UgdGhpcy5saW1pdFZlbG9jaXR5ID0gMDtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5saW1pdFN0YXRlID0gMjtcbiAgICAgICAgdGhpcy5saW1pdEltcHVsc2UgPSAwO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5lbmFibGVNb3RvciAmJiAodGhpcy5saW1pdFN0YXRlICE9IDAgfHwgZW5hYmxlU3ByaW5nKSkge1xuICAgICAgICB0aGlzLm1heE1vdG9ySW1wdWxzZSA9IHRoaXMubWF4TW90b3JGb3JjZSAqIHRpbWVTdGVwO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5tb3RvckltcHVsc2UgPSAwO1xuICAgICAgICB0aGlzLm1heE1vdG9ySW1wdWxzZSA9IDA7XG4gICAgICB9XG5cbiAgICAgIHZhciByZHggPSBkICogdGhpcy5heDtcbiAgICAgIHZhciByZHkgPSBkICogdGhpcy5heTtcbiAgICAgIHZhciByZHogPSBkICogdGhpcy5hejtcbiAgICAgIHZhciB3MSA9IHRoaXMubTEgLyAodGhpcy5tMSArIHRoaXMubTIpO1xuICAgICAgdmFyIHcyID0gMSAtIHcxO1xuICAgICAgdGhpcy5yMXggPSB0aGlzLnIxLnggKyByZHggKiB3MTtcbiAgICAgIHRoaXMucjF5ID0gdGhpcy5yMS55ICsgcmR5ICogdzE7XG4gICAgICB0aGlzLnIxeiA9IHRoaXMucjEueiArIHJkeiAqIHcxO1xuICAgICAgdGhpcy5yMnggPSB0aGlzLnIyLnggLSByZHggKiB3MjtcbiAgICAgIHRoaXMucjJ5ID0gdGhpcy5yMi55IC0gcmR5ICogdzI7XG4gICAgICB0aGlzLnIyeiA9IHRoaXMucjIueiAtIHJkeiAqIHcyO1xuXG4gICAgICB0aGlzLnQxeCA9IHRoaXMucjF5ICogdGhpcy5heiAtIHRoaXMucjF6ICogdGhpcy5heTtcbiAgICAgIHRoaXMudDF5ID0gdGhpcy5yMXogKiB0aGlzLmF4IC0gdGhpcy5yMXggKiB0aGlzLmF6O1xuICAgICAgdGhpcy50MXogPSB0aGlzLnIxeCAqIHRoaXMuYXkgLSB0aGlzLnIxeSAqIHRoaXMuYXg7XG4gICAgICB0aGlzLnQyeCA9IHRoaXMucjJ5ICogdGhpcy5heiAtIHRoaXMucjJ6ICogdGhpcy5heTtcbiAgICAgIHRoaXMudDJ5ID0gdGhpcy5yMnogKiB0aGlzLmF4IC0gdGhpcy5yMnggKiB0aGlzLmF6O1xuICAgICAgdGhpcy50MnogPSB0aGlzLnIyeCAqIHRoaXMuYXkgLSB0aGlzLnIyeSAqIHRoaXMuYXg7XG4gICAgICB0aGlzLmwxeCA9IHRoaXMuYXggKiB0aGlzLm0xO1xuICAgICAgdGhpcy5sMXkgPSB0aGlzLmF5ICogdGhpcy5tMTtcbiAgICAgIHRoaXMubDF6ID0gdGhpcy5heiAqIHRoaXMubTE7XG4gICAgICB0aGlzLmwyeCA9IHRoaXMuYXggKiB0aGlzLm0yO1xuICAgICAgdGhpcy5sMnkgPSB0aGlzLmF5ICogdGhpcy5tMjtcbiAgICAgIHRoaXMubDJ6ID0gdGhpcy5heiAqIHRoaXMubTI7XG4gICAgICB0aGlzLmExeCA9IHRoaXMudDF4ICogdGhpcy5pMWUwMCArIHRoaXMudDF5ICogdGhpcy5pMWUwMSArIHRoaXMudDF6ICogdGhpcy5pMWUwMjtcbiAgICAgIHRoaXMuYTF5ID0gdGhpcy50MXggKiB0aGlzLmkxZTEwICsgdGhpcy50MXkgKiB0aGlzLmkxZTExICsgdGhpcy50MXogKiB0aGlzLmkxZTEyO1xuICAgICAgdGhpcy5hMXogPSB0aGlzLnQxeCAqIHRoaXMuaTFlMjAgKyB0aGlzLnQxeSAqIHRoaXMuaTFlMjEgKyB0aGlzLnQxeiAqIHRoaXMuaTFlMjI7XG4gICAgICB0aGlzLmEyeCA9IHRoaXMudDJ4ICogdGhpcy5pMmUwMCArIHRoaXMudDJ5ICogdGhpcy5pMmUwMSArIHRoaXMudDJ6ICogdGhpcy5pMmUwMjtcbiAgICAgIHRoaXMuYTJ5ID0gdGhpcy50MnggKiB0aGlzLmkyZTEwICsgdGhpcy50MnkgKiB0aGlzLmkyZTExICsgdGhpcy50MnogKiB0aGlzLmkyZTEyO1xuICAgICAgdGhpcy5hMnogPSB0aGlzLnQyeCAqIHRoaXMuaTJlMjAgKyB0aGlzLnQyeSAqIHRoaXMuaTJlMjEgKyB0aGlzLnQyeiAqIHRoaXMuaTJlMjI7XG4gICAgICB0aGlzLm1vdG9yRGVub20gPVxuICAgICAgICB0aGlzLm0xICsgdGhpcy5tMiArXG4gICAgICAgIHRoaXMuYXggKiAodGhpcy5hMXkgKiB0aGlzLnIxeiAtIHRoaXMuYTF6ICogdGhpcy5yMXkgKyB0aGlzLmEyeSAqIHRoaXMucjJ6IC0gdGhpcy5hMnogKiB0aGlzLnIyeSkgK1xuICAgICAgICB0aGlzLmF5ICogKHRoaXMuYTF6ICogdGhpcy5yMXggLSB0aGlzLmExeCAqIHRoaXMucjF6ICsgdGhpcy5hMnogKiB0aGlzLnIyeCAtIHRoaXMuYTJ4ICogdGhpcy5yMnopICtcbiAgICAgICAgdGhpcy5heiAqICh0aGlzLmExeCAqIHRoaXMucjF5IC0gdGhpcy5hMXkgKiB0aGlzLnIxeCArIHRoaXMuYTJ4ICogdGhpcy5yMnkgLSB0aGlzLmEyeSAqIHRoaXMucjJ4KTtcblxuICAgICAgdGhpcy5pbnZNb3RvckRlbm9tID0gMSAvIHRoaXMubW90b3JEZW5vbTtcblxuICAgICAgaWYgKGVuYWJsZVNwcmluZyAmJiB0aGlzLmxpbWl0U3RhdGUgIT0gMikge1xuICAgICAgICB2YXIgb21lZ2EgPSA2LjI4MzE4NTMgKiBmcmVxdWVuY3k7XG4gICAgICAgIHZhciBrID0gb21lZ2EgKiBvbWVnYSAqIHRpbWVTdGVwO1xuICAgICAgICB2YXIgZG1wID0gaW52VGltZVN0ZXAgLyAoayArIDIgKiB0aGlzLmxpbWl0TW90b3IuZGFtcGluZ1JhdGlvICogb21lZ2EpO1xuICAgICAgICB0aGlzLmNmbSA9IHRoaXMubW90b3JEZW5vbSAqIGRtcDtcbiAgICAgICAgdGhpcy5saW1pdFZlbG9jaXR5ICo9IGsgKiBkbXA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmNmbSA9IDA7XG4gICAgICAgIHRoaXMubGltaXRWZWxvY2l0eSAqPSBpbnZUaW1lU3RlcCAqIDAuMDU7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuaW52RGVub20gPSAxIC8gKHRoaXMubW90b3JEZW5vbSArIHRoaXMuY2ZtKTtcblxuICAgICAgdmFyIHRvdGFsSW1wdWxzZSA9IHRoaXMubGltaXRJbXB1bHNlICsgdGhpcy5tb3RvckltcHVsc2U7XG4gICAgICB0aGlzLmwxLnggKz0gdG90YWxJbXB1bHNlICogdGhpcy5sMXg7XG4gICAgICB0aGlzLmwxLnkgKz0gdG90YWxJbXB1bHNlICogdGhpcy5sMXk7XG4gICAgICB0aGlzLmwxLnogKz0gdG90YWxJbXB1bHNlICogdGhpcy5sMXo7XG4gICAgICB0aGlzLmExLnggKz0gdG90YWxJbXB1bHNlICogdGhpcy5hMXg7XG4gICAgICB0aGlzLmExLnkgKz0gdG90YWxJbXB1bHNlICogdGhpcy5hMXk7XG4gICAgICB0aGlzLmExLnogKz0gdG90YWxJbXB1bHNlICogdGhpcy5hMXo7XG4gICAgICB0aGlzLmwyLnggLT0gdG90YWxJbXB1bHNlICogdGhpcy5sMng7XG4gICAgICB0aGlzLmwyLnkgLT0gdG90YWxJbXB1bHNlICogdGhpcy5sMnk7XG4gICAgICB0aGlzLmwyLnogLT0gdG90YWxJbXB1bHNlICogdGhpcy5sMno7XG4gICAgICB0aGlzLmEyLnggLT0gdG90YWxJbXB1bHNlICogdGhpcy5hMng7XG4gICAgICB0aGlzLmEyLnkgLT0gdG90YWxJbXB1bHNlICogdGhpcy5hMnk7XG4gICAgICB0aGlzLmEyLnogLT0gdG90YWxJbXB1bHNlICogdGhpcy5hMno7XG4gICAgfSxcbiAgICBzb2x2ZTogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIHJ2biA9XG4gICAgICAgIHRoaXMuYXggKiAodGhpcy5sMi54IC0gdGhpcy5sMS54KSArIHRoaXMuYXkgKiAodGhpcy5sMi55IC0gdGhpcy5sMS55KSArIHRoaXMuYXogKiAodGhpcy5sMi56IC0gdGhpcy5sMS56KSArXG4gICAgICAgIHRoaXMudDJ4ICogdGhpcy5hMi54IC0gdGhpcy50MXggKiB0aGlzLmExLnggKyB0aGlzLnQyeSAqIHRoaXMuYTIueSAtIHRoaXMudDF5ICogdGhpcy5hMS55ICsgdGhpcy50MnogKiB0aGlzLmEyLnogLSB0aGlzLnQxeiAqIHRoaXMuYTEuejtcblxuICAgICAgLy8gbW90b3IgcGFydFxuICAgICAgdmFyIG5ld01vdG9ySW1wdWxzZTtcbiAgICAgIGlmICh0aGlzLmVuYWJsZU1vdG9yKSB7XG4gICAgICAgIG5ld01vdG9ySW1wdWxzZSA9IChydm4gLSB0aGlzLm1vdG9yU3BlZWQpICogdGhpcy5pbnZNb3RvckRlbm9tO1xuICAgICAgICB2YXIgb2xkTW90b3JJbXB1bHNlID0gdGhpcy5tb3RvckltcHVsc2U7XG4gICAgICAgIHRoaXMubW90b3JJbXB1bHNlICs9IG5ld01vdG9ySW1wdWxzZTtcbiAgICAgICAgaWYgKHRoaXMubW90b3JJbXB1bHNlID4gdGhpcy5tYXhNb3RvckltcHVsc2UpIHRoaXMubW90b3JJbXB1bHNlID0gdGhpcy5tYXhNb3RvckltcHVsc2U7XG4gICAgICAgIGVsc2UgaWYgKHRoaXMubW90b3JJbXB1bHNlIDwgLXRoaXMubWF4TW90b3JJbXB1bHNlKSB0aGlzLm1vdG9ySW1wdWxzZSA9IC10aGlzLm1heE1vdG9ySW1wdWxzZTtcbiAgICAgICAgbmV3TW90b3JJbXB1bHNlID0gdGhpcy5tb3RvckltcHVsc2UgLSBvbGRNb3RvckltcHVsc2U7XG4gICAgICAgIHJ2biAtPSBuZXdNb3RvckltcHVsc2UgKiB0aGlzLm1vdG9yRGVub207XG4gICAgICB9IGVsc2UgbmV3TW90b3JJbXB1bHNlID0gMDtcblxuICAgICAgLy8gbGltaXQgcGFydFxuICAgICAgdmFyIG5ld0xpbWl0SW1wdWxzZTtcbiAgICAgIGlmICh0aGlzLmxpbWl0U3RhdGUgIT0gMikge1xuICAgICAgICBuZXdMaW1pdEltcHVsc2UgPSAocnZuIC0gdGhpcy5saW1pdFZlbG9jaXR5IC0gdGhpcy5saW1pdEltcHVsc2UgKiB0aGlzLmNmbSkgKiB0aGlzLmludkRlbm9tO1xuICAgICAgICB2YXIgb2xkTGltaXRJbXB1bHNlID0gdGhpcy5saW1pdEltcHVsc2U7XG4gICAgICAgIHRoaXMubGltaXRJbXB1bHNlICs9IG5ld0xpbWl0SW1wdWxzZTtcbiAgICAgICAgaWYgKHRoaXMubGltaXRJbXB1bHNlICogdGhpcy5saW1pdFN0YXRlIDwgMCkgdGhpcy5saW1pdEltcHVsc2UgPSAwO1xuICAgICAgICBuZXdMaW1pdEltcHVsc2UgPSB0aGlzLmxpbWl0SW1wdWxzZSAtIG9sZExpbWl0SW1wdWxzZTtcbiAgICAgIH0gZWxzZSBuZXdMaW1pdEltcHVsc2UgPSAwO1xuXG4gICAgICB2YXIgdG90YWxJbXB1bHNlID0gbmV3TGltaXRJbXB1bHNlICsgbmV3TW90b3JJbXB1bHNlO1xuICAgICAgdGhpcy5sMS54ICs9IHRvdGFsSW1wdWxzZSAqIHRoaXMubDF4O1xuICAgICAgdGhpcy5sMS55ICs9IHRvdGFsSW1wdWxzZSAqIHRoaXMubDF5O1xuICAgICAgdGhpcy5sMS56ICs9IHRvdGFsSW1wdWxzZSAqIHRoaXMubDF6O1xuICAgICAgdGhpcy5hMS54ICs9IHRvdGFsSW1wdWxzZSAqIHRoaXMuYTF4O1xuICAgICAgdGhpcy5hMS55ICs9IHRvdGFsSW1wdWxzZSAqIHRoaXMuYTF5O1xuICAgICAgdGhpcy5hMS56ICs9IHRvdGFsSW1wdWxzZSAqIHRoaXMuYTF6O1xuICAgICAgdGhpcy5sMi54IC09IHRvdGFsSW1wdWxzZSAqIHRoaXMubDJ4O1xuICAgICAgdGhpcy5sMi55IC09IHRvdGFsSW1wdWxzZSAqIHRoaXMubDJ5O1xuICAgICAgdGhpcy5sMi56IC09IHRvdGFsSW1wdWxzZSAqIHRoaXMubDJ6O1xuICAgICAgdGhpcy5hMi54IC09IHRvdGFsSW1wdWxzZSAqIHRoaXMuYTJ4O1xuICAgICAgdGhpcy5hMi55IC09IHRvdGFsSW1wdWxzZSAqIHRoaXMuYTJ5O1xuICAgICAgdGhpcy5hMi56IC09IHRvdGFsSW1wdWxzZSAqIHRoaXMuYTJ6O1xuICAgIH1cbiAgfSk7XG5cbiAgLyoqXG4gICAqIEEgZGlzdGFuY2Ugam9pbnQgbGltaXRzIHRoZSBkaXN0YW5jZSBiZXR3ZWVuIHR3byBhbmNob3IgcG9pbnRzIG9uIHJpZ2lkIGJvZGllcy5cbiAgICpcbiAgICogQGF1dGhvciBzYWhhcmFuXG4gICAqIEBhdXRob3IgbG8tdGhcbiAgICovXG5cbiAgZnVuY3Rpb24gRGlzdGFuY2VKb2ludChjb25maWcsIG1pbkRpc3RhbmNlLCBtYXhEaXN0YW5jZSkge1xuXG4gICAgSm9pbnQuY2FsbCh0aGlzLCBjb25maWcpO1xuXG4gICAgdGhpcy50eXBlID0gSk9JTlRfRElTVEFOQ0U7XG5cbiAgICB0aGlzLm5vciA9IG5ldyBWZWMzKCk7XG5cbiAgICAvLyBUaGUgbGltaXQgYW5kIG1vdG9yIGluZm9ybWF0aW9uIG9mIHRoZSBqb2ludC5cbiAgICB0aGlzLmxpbWl0TW90b3IgPSBuZXcgTGltaXRNb3Rvcih0aGlzLm5vciwgdHJ1ZSk7XG4gICAgdGhpcy5saW1pdE1vdG9yLmxvd2VyTGltaXQgPSBtaW5EaXN0YW5jZTtcbiAgICB0aGlzLmxpbWl0TW90b3IudXBwZXJMaW1pdCA9IG1heERpc3RhbmNlO1xuXG4gICAgdGhpcy50ID0gbmV3IFRyYW5zbGF0aW9uYWxDb25zdHJhaW50KHRoaXMsIHRoaXMubGltaXRNb3Rvcik7XG5cbiAgfVxuICBEaXN0YW5jZUpvaW50LnByb3RvdHlwZSA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmNyZWF0ZShKb2ludC5wcm90b3R5cGUpLCB7XG5cbiAgICBjb25zdHJ1Y3RvcjogRGlzdGFuY2VKb2ludCxcblxuICAgIHByZVNvbHZlOiBmdW5jdGlvbiAodGltZVN0ZXAsIGludlRpbWVTdGVwKSB7XG5cbiAgICAgIHRoaXMudXBkYXRlQW5jaG9yUG9pbnRzKCk7XG5cbiAgICAgIHRoaXMubm9yLnN1Yih0aGlzLmFuY2hvclBvaW50MiwgdGhpcy5hbmNob3JQb2ludDEpLm5vcm1hbGl6ZSgpO1xuXG4gICAgICAvLyBwcmVTb2x2ZVxuXG4gICAgICB0aGlzLnQucHJlU29sdmUodGltZVN0ZXAsIGludlRpbWVTdGVwKTtcblxuICAgIH0sXG5cbiAgICBzb2x2ZTogZnVuY3Rpb24gKCkge1xuXG4gICAgICB0aGlzLnQuc29sdmUoKTtcblxuICAgIH0sXG5cbiAgICBwb3N0U29sdmU6IGZ1bmN0aW9uICgpIHtcblxuICAgIH1cblxuICB9KTtcblxuICAvKipcbiAgKiBBbiBhbmd1bGFyIGNvbnN0cmFpbnQgZm9yIGFsbCBheGVzIGZvciB2YXJpb3VzIGpvaW50cy5cbiAgKiBAYXV0aG9yIHNhaGFyYW5cbiAgKi9cblxuICBmdW5jdGlvbiBBbmd1bGFyQ29uc3RyYWludChqb2ludCwgdGFyZ2V0T3JpZW50YXRpb24pIHtcblxuICAgIHRoaXMuam9pbnQgPSBqb2ludDtcblxuICAgIHRoaXMudGFyZ2V0T3JpZW50YXRpb24gPSBuZXcgUXVhdCgpLmludmVydCh0YXJnZXRPcmllbnRhdGlvbik7XG5cbiAgICB0aGlzLnJlbGF0aXZlT3JpZW50YXRpb24gPSBuZXcgUXVhdCgpO1xuXG4gICAgdGhpcy5paTEgPSBudWxsO1xuICAgIHRoaXMuaWkyID0gbnVsbDtcbiAgICB0aGlzLmRkID0gbnVsbDtcblxuICAgIHRoaXMudmVsID0gbmV3IFZlYzMoKTtcbiAgICB0aGlzLmltcCA9IG5ldyBWZWMzKCk7XG5cbiAgICB0aGlzLnJuMCA9IG5ldyBWZWMzKCk7XG4gICAgdGhpcy5ybjEgPSBuZXcgVmVjMygpO1xuICAgIHRoaXMucm4yID0gbmV3IFZlYzMoKTtcblxuICAgIHRoaXMuYjEgPSBqb2ludC5ib2R5MTtcbiAgICB0aGlzLmIyID0gam9pbnQuYm9keTI7XG4gICAgdGhpcy5hMSA9IHRoaXMuYjEuYW5ndWxhclZlbG9jaXR5O1xuICAgIHRoaXMuYTIgPSB0aGlzLmIyLmFuZ3VsYXJWZWxvY2l0eTtcbiAgICB0aGlzLmkxID0gdGhpcy5iMS5pbnZlcnNlSW5lcnRpYTtcbiAgICB0aGlzLmkyID0gdGhpcy5iMi5pbnZlcnNlSW5lcnRpYTtcblxuICB9XG4gIE9iamVjdC5hc3NpZ24oQW5ndWxhckNvbnN0cmFpbnQucHJvdG90eXBlLCB7XG5cbiAgICBBbmd1bGFyQ29uc3RyYWludDogdHJ1ZSxcblxuICAgIHByZVNvbHZlOiBmdW5jdGlvbiAodGltZVN0ZXAsIGludlRpbWVTdGVwKSB7XG5cbiAgICAgIHZhciBpbnYsIGxlbiwgdjtcblxuICAgICAgdGhpcy5paTEgPSB0aGlzLmkxLmNsb25lKCk7XG4gICAgICB0aGlzLmlpMiA9IHRoaXMuaTIuY2xvbmUoKTtcblxuICAgICAgdiA9IG5ldyBNYXQzMygpLmFkZCh0aGlzLmlpMSwgdGhpcy5paTIpLmVsZW1lbnRzO1xuICAgICAgaW52ID0gMSAvICh2WzBdICogKHZbNF0gKiB2WzhdIC0gdls3XSAqIHZbNV0pICsgdlszXSAqICh2WzddICogdlsyXSAtIHZbMV0gKiB2WzhdKSArIHZbNl0gKiAodlsxXSAqIHZbNV0gLSB2WzRdICogdlsyXSkpO1xuICAgICAgdGhpcy5kZCA9IG5ldyBNYXQzMygpLnNldChcbiAgICAgICAgdls0XSAqIHZbOF0gLSB2WzVdICogdls3XSwgdlsyXSAqIHZbN10gLSB2WzFdICogdls4XSwgdlsxXSAqIHZbNV0gLSB2WzJdICogdls0XSxcbiAgICAgICAgdls1XSAqIHZbNl0gLSB2WzNdICogdls4XSwgdlswXSAqIHZbOF0gLSB2WzJdICogdls2XSwgdlsyXSAqIHZbM10gLSB2WzBdICogdls1XSxcbiAgICAgICAgdlszXSAqIHZbN10gLSB2WzRdICogdls2XSwgdlsxXSAqIHZbNl0gLSB2WzBdICogdls3XSwgdlswXSAqIHZbNF0gLSB2WzFdICogdlszXVxuICAgICAgKS5tdWx0aXBseVNjYWxhcihpbnYpO1xuXG4gICAgICB0aGlzLnJlbGF0aXZlT3JpZW50YXRpb24uaW52ZXJ0KHRoaXMuYjEub3JpZW50YXRpb24pLm11bHRpcGx5KHRoaXMudGFyZ2V0T3JpZW50YXRpb24pLm11bHRpcGx5KHRoaXMuYjIub3JpZW50YXRpb24pO1xuXG4gICAgICBpbnYgPSB0aGlzLnJlbGF0aXZlT3JpZW50YXRpb24udyAqIDI7XG5cbiAgICAgIHRoaXMudmVsLmNvcHkodGhpcy5yZWxhdGl2ZU9yaWVudGF0aW9uKS5tdWx0aXBseVNjYWxhcihpbnYpO1xuXG4gICAgICBsZW4gPSB0aGlzLnZlbC5sZW5ndGgoKTtcblxuICAgICAgaWYgKGxlbiA+IDAuMDIpIHtcbiAgICAgICAgbGVuID0gKDAuMDIgLSBsZW4pIC8gbGVuICogaW52VGltZVN0ZXAgKiAwLjA1O1xuICAgICAgICB0aGlzLnZlbC5tdWx0aXBseVNjYWxhcihsZW4pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy52ZWwuc2V0KDAsIDAsIDApO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnJuMS5jb3B5KHRoaXMuaW1wKS5hcHBseU1hdHJpeDModGhpcy5paTEsIHRydWUpO1xuICAgICAgdGhpcy5ybjIuY29weSh0aGlzLmltcCkuYXBwbHlNYXRyaXgzKHRoaXMuaWkyLCB0cnVlKTtcblxuICAgICAgdGhpcy5hMS5hZGQodGhpcy5ybjEpO1xuICAgICAgdGhpcy5hMi5zdWIodGhpcy5ybjIpO1xuXG4gICAgfSxcblxuICAgIHNvbHZlOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHZhciByID0gdGhpcy5hMi5jbG9uZSgpLnN1Yih0aGlzLmExKS5zdWIodGhpcy52ZWwpO1xuXG4gICAgICB0aGlzLnJuMC5jb3B5KHIpLmFwcGx5TWF0cml4Myh0aGlzLmRkLCB0cnVlKTtcbiAgICAgIHRoaXMucm4xLmNvcHkodGhpcy5ybjApLmFwcGx5TWF0cml4Myh0aGlzLmlpMSwgdHJ1ZSk7XG4gICAgICB0aGlzLnJuMi5jb3B5KHRoaXMucm4wKS5hcHBseU1hdHJpeDModGhpcy5paTIsIHRydWUpO1xuXG4gICAgICB0aGlzLmltcC5hZGQodGhpcy5ybjApO1xuICAgICAgdGhpcy5hMS5hZGQodGhpcy5ybjEpO1xuICAgICAgdGhpcy5hMi5zdWIodGhpcy5ybjIpO1xuXG4gICAgfVxuXG4gIH0pO1xuXG4gIC8qKlxuICAqIEEgdGhyZWUtYXhpcyB0cmFuc2xhdGlvbmFsIGNvbnN0cmFpbnQgZm9yIHZhcmlvdXMgam9pbnRzLlxuICAqIEBhdXRob3Igc2FoYXJhblxuICAqL1xuICBmdW5jdGlvbiBUcmFuc2xhdGlvbmFsM0NvbnN0cmFpbnQoam9pbnQsIGxpbWl0TW90b3IxLCBsaW1pdE1vdG9yMiwgbGltaXRNb3RvcjMpIHtcblxuICAgIHRoaXMubTEgPSBOYU47XG4gICAgdGhpcy5tMiA9IE5hTjtcbiAgICB0aGlzLmkxZTAwID0gTmFOO1xuICAgIHRoaXMuaTFlMDEgPSBOYU47XG4gICAgdGhpcy5pMWUwMiA9IE5hTjtcbiAgICB0aGlzLmkxZTEwID0gTmFOO1xuICAgIHRoaXMuaTFlMTEgPSBOYU47XG4gICAgdGhpcy5pMWUxMiA9IE5hTjtcbiAgICB0aGlzLmkxZTIwID0gTmFOO1xuICAgIHRoaXMuaTFlMjEgPSBOYU47XG4gICAgdGhpcy5pMWUyMiA9IE5hTjtcbiAgICB0aGlzLmkyZTAwID0gTmFOO1xuICAgIHRoaXMuaTJlMDEgPSBOYU47XG4gICAgdGhpcy5pMmUwMiA9IE5hTjtcbiAgICB0aGlzLmkyZTEwID0gTmFOO1xuICAgIHRoaXMuaTJlMTEgPSBOYU47XG4gICAgdGhpcy5pMmUxMiA9IE5hTjtcbiAgICB0aGlzLmkyZTIwID0gTmFOO1xuICAgIHRoaXMuaTJlMjEgPSBOYU47XG4gICAgdGhpcy5pMmUyMiA9IE5hTjtcbiAgICB0aGlzLmF4MSA9IE5hTjtcbiAgICB0aGlzLmF5MSA9IE5hTjtcbiAgICB0aGlzLmF6MSA9IE5hTjtcbiAgICB0aGlzLmF4MiA9IE5hTjtcbiAgICB0aGlzLmF5MiA9IE5hTjtcbiAgICB0aGlzLmF6MiA9IE5hTjtcbiAgICB0aGlzLmF4MyA9IE5hTjtcbiAgICB0aGlzLmF5MyA9IE5hTjtcbiAgICB0aGlzLmF6MyA9IE5hTjtcbiAgICB0aGlzLnIxeCA9IE5hTjtcbiAgICB0aGlzLnIxeSA9IE5hTjtcbiAgICB0aGlzLnIxeiA9IE5hTjtcbiAgICB0aGlzLnIyeCA9IE5hTjtcbiAgICB0aGlzLnIyeSA9IE5hTjtcbiAgICB0aGlzLnIyeiA9IE5hTjtcbiAgICB0aGlzLnQxeDEgPSBOYU47Ly8gamFjb2JpYW5zXG4gICAgdGhpcy50MXkxID0gTmFOO1xuICAgIHRoaXMudDF6MSA9IE5hTjtcbiAgICB0aGlzLnQyeDEgPSBOYU47XG4gICAgdGhpcy50MnkxID0gTmFOO1xuICAgIHRoaXMudDJ6MSA9IE5hTjtcbiAgICB0aGlzLmwxeDEgPSBOYU47XG4gICAgdGhpcy5sMXkxID0gTmFOO1xuICAgIHRoaXMubDF6MSA9IE5hTjtcbiAgICB0aGlzLmwyeDEgPSBOYU47XG4gICAgdGhpcy5sMnkxID0gTmFOO1xuICAgIHRoaXMubDJ6MSA9IE5hTjtcbiAgICB0aGlzLmExeDEgPSBOYU47XG4gICAgdGhpcy5hMXkxID0gTmFOO1xuICAgIHRoaXMuYTF6MSA9IE5hTjtcbiAgICB0aGlzLmEyeDEgPSBOYU47XG4gICAgdGhpcy5hMnkxID0gTmFOO1xuICAgIHRoaXMuYTJ6MSA9IE5hTjtcbiAgICB0aGlzLnQxeDIgPSBOYU47XG4gICAgdGhpcy50MXkyID0gTmFOO1xuICAgIHRoaXMudDF6MiA9IE5hTjtcbiAgICB0aGlzLnQyeDIgPSBOYU47XG4gICAgdGhpcy50MnkyID0gTmFOO1xuICAgIHRoaXMudDJ6MiA9IE5hTjtcbiAgICB0aGlzLmwxeDIgPSBOYU47XG4gICAgdGhpcy5sMXkyID0gTmFOO1xuICAgIHRoaXMubDF6MiA9IE5hTjtcbiAgICB0aGlzLmwyeDIgPSBOYU47XG4gICAgdGhpcy5sMnkyID0gTmFOO1xuICAgIHRoaXMubDJ6MiA9IE5hTjtcbiAgICB0aGlzLmExeDIgPSBOYU47XG4gICAgdGhpcy5hMXkyID0gTmFOO1xuICAgIHRoaXMuYTF6MiA9IE5hTjtcbiAgICB0aGlzLmEyeDIgPSBOYU47XG4gICAgdGhpcy5hMnkyID0gTmFOO1xuICAgIHRoaXMuYTJ6MiA9IE5hTjtcbiAgICB0aGlzLnQxeDMgPSBOYU47XG4gICAgdGhpcy50MXkzID0gTmFOO1xuICAgIHRoaXMudDF6MyA9IE5hTjtcbiAgICB0aGlzLnQyeDMgPSBOYU47XG4gICAgdGhpcy50MnkzID0gTmFOO1xuICAgIHRoaXMudDJ6MyA9IE5hTjtcbiAgICB0aGlzLmwxeDMgPSBOYU47XG4gICAgdGhpcy5sMXkzID0gTmFOO1xuICAgIHRoaXMubDF6MyA9IE5hTjtcbiAgICB0aGlzLmwyeDMgPSBOYU47XG4gICAgdGhpcy5sMnkzID0gTmFOO1xuICAgIHRoaXMubDJ6MyA9IE5hTjtcbiAgICB0aGlzLmExeDMgPSBOYU47XG4gICAgdGhpcy5hMXkzID0gTmFOO1xuICAgIHRoaXMuYTF6MyA9IE5hTjtcbiAgICB0aGlzLmEyeDMgPSBOYU47XG4gICAgdGhpcy5hMnkzID0gTmFOO1xuICAgIHRoaXMuYTJ6MyA9IE5hTjtcbiAgICB0aGlzLmxvd2VyTGltaXQxID0gTmFOO1xuICAgIHRoaXMudXBwZXJMaW1pdDEgPSBOYU47XG4gICAgdGhpcy5saW1pdFZlbG9jaXR5MSA9IE5hTjtcbiAgICB0aGlzLmxpbWl0U3RhdGUxID0gMDsgLy8gLTE6IGF0IGxvd2VyLCAwOiBsb2NrZWQsIDE6IGF0IHVwcGVyLCAyOiB1bmxpbWl0ZWRcbiAgICB0aGlzLmVuYWJsZU1vdG9yMSA9IGZhbHNlO1xuICAgIHRoaXMubW90b3JTcGVlZDEgPSBOYU47XG4gICAgdGhpcy5tYXhNb3RvckZvcmNlMSA9IE5hTjtcbiAgICB0aGlzLm1heE1vdG9ySW1wdWxzZTEgPSBOYU47XG4gICAgdGhpcy5sb3dlckxpbWl0MiA9IE5hTjtcbiAgICB0aGlzLnVwcGVyTGltaXQyID0gTmFOO1xuICAgIHRoaXMubGltaXRWZWxvY2l0eTIgPSBOYU47XG4gICAgdGhpcy5saW1pdFN0YXRlMiA9IDA7IC8vIC0xOiBhdCBsb3dlciwgMDogbG9ja2VkLCAxOiBhdCB1cHBlciwgMjogdW5saW1pdGVkXG4gICAgdGhpcy5lbmFibGVNb3RvcjIgPSBmYWxzZTtcbiAgICB0aGlzLm1vdG9yU3BlZWQyID0gTmFOO1xuICAgIHRoaXMubWF4TW90b3JGb3JjZTIgPSBOYU47XG4gICAgdGhpcy5tYXhNb3RvckltcHVsc2UyID0gTmFOO1xuICAgIHRoaXMubG93ZXJMaW1pdDMgPSBOYU47XG4gICAgdGhpcy51cHBlckxpbWl0MyA9IE5hTjtcbiAgICB0aGlzLmxpbWl0VmVsb2NpdHkzID0gTmFOO1xuICAgIHRoaXMubGltaXRTdGF0ZTMgPSAwOyAvLyAtMTogYXQgbG93ZXIsIDA6IGxvY2tlZCwgMTogYXQgdXBwZXIsIDI6IHVubGltaXRlZFxuICAgIHRoaXMuZW5hYmxlTW90b3IzID0gZmFsc2U7XG4gICAgdGhpcy5tb3RvclNwZWVkMyA9IE5hTjtcbiAgICB0aGlzLm1heE1vdG9yRm9yY2UzID0gTmFOO1xuICAgIHRoaXMubWF4TW90b3JJbXB1bHNlMyA9IE5hTjtcbiAgICB0aGlzLmswMCA9IE5hTjsgLy8gSyA9IEoqTSpKVFxuICAgIHRoaXMuazAxID0gTmFOO1xuICAgIHRoaXMuazAyID0gTmFOO1xuICAgIHRoaXMuazEwID0gTmFOO1xuICAgIHRoaXMuazExID0gTmFOO1xuICAgIHRoaXMuazEyID0gTmFOO1xuICAgIHRoaXMuazIwID0gTmFOO1xuICAgIHRoaXMuazIxID0gTmFOO1xuICAgIHRoaXMuazIyID0gTmFOO1xuICAgIHRoaXMua3YwMCA9IE5hTjsgLy8gZGlhZ29uYWxzIHdpdGhvdXQgQ0ZNc1xuICAgIHRoaXMua3YxMSA9IE5hTjtcbiAgICB0aGlzLmt2MjIgPSBOYU47XG4gICAgdGhpcy5kdjAwID0gTmFOOyAvLyAuLi5pbnZlcnRlZFxuICAgIHRoaXMuZHYxMSA9IE5hTjtcbiAgICB0aGlzLmR2MjIgPSBOYU47XG4gICAgdGhpcy5kMDAgPSBOYU47IC8vIEteLTFcbiAgICB0aGlzLmQwMSA9IE5hTjtcbiAgICB0aGlzLmQwMiA9IE5hTjtcbiAgICB0aGlzLmQxMCA9IE5hTjtcbiAgICB0aGlzLmQxMSA9IE5hTjtcbiAgICB0aGlzLmQxMiA9IE5hTjtcbiAgICB0aGlzLmQyMCA9IE5hTjtcbiAgICB0aGlzLmQyMSA9IE5hTjtcbiAgICB0aGlzLmQyMiA9IE5hTjtcblxuICAgIHRoaXMubGltaXRNb3RvcjEgPSBsaW1pdE1vdG9yMTtcbiAgICB0aGlzLmxpbWl0TW90b3IyID0gbGltaXRNb3RvcjI7XG4gICAgdGhpcy5saW1pdE1vdG9yMyA9IGxpbWl0TW90b3IzO1xuICAgIHRoaXMuYjEgPSBqb2ludC5ib2R5MTtcbiAgICB0aGlzLmIyID0gam9pbnQuYm9keTI7XG4gICAgdGhpcy5wMSA9IGpvaW50LmFuY2hvclBvaW50MTtcbiAgICB0aGlzLnAyID0gam9pbnQuYW5jaG9yUG9pbnQyO1xuICAgIHRoaXMucjEgPSBqb2ludC5yZWxhdGl2ZUFuY2hvclBvaW50MTtcbiAgICB0aGlzLnIyID0gam9pbnQucmVsYXRpdmVBbmNob3JQb2ludDI7XG4gICAgdGhpcy5sMSA9IHRoaXMuYjEubGluZWFyVmVsb2NpdHk7XG4gICAgdGhpcy5sMiA9IHRoaXMuYjIubGluZWFyVmVsb2NpdHk7XG4gICAgdGhpcy5hMSA9IHRoaXMuYjEuYW5ndWxhclZlbG9jaXR5O1xuICAgIHRoaXMuYTIgPSB0aGlzLmIyLmFuZ3VsYXJWZWxvY2l0eTtcbiAgICB0aGlzLmkxID0gdGhpcy5iMS5pbnZlcnNlSW5lcnRpYTtcbiAgICB0aGlzLmkyID0gdGhpcy5iMi5pbnZlcnNlSW5lcnRpYTtcbiAgICB0aGlzLmxpbWl0SW1wdWxzZTEgPSAwO1xuICAgIHRoaXMubW90b3JJbXB1bHNlMSA9IDA7XG4gICAgdGhpcy5saW1pdEltcHVsc2UyID0gMDtcbiAgICB0aGlzLm1vdG9ySW1wdWxzZTIgPSAwO1xuICAgIHRoaXMubGltaXRJbXB1bHNlMyA9IDA7XG4gICAgdGhpcy5tb3RvckltcHVsc2UzID0gMDtcbiAgICB0aGlzLmNmbTEgPSAwOy8vIENvbnN0cmFpbnQgRm9yY2UgTWl4aW5nXG4gICAgdGhpcy5jZm0yID0gMDtcbiAgICB0aGlzLmNmbTMgPSAwO1xuICAgIHRoaXMud2VpZ2h0ID0gLTE7XG4gIH1cblxuICBPYmplY3QuYXNzaWduKFRyYW5zbGF0aW9uYWwzQ29uc3RyYWludC5wcm90b3R5cGUsIHtcblxuICAgIFRyYW5zbGF0aW9uYWwzQ29uc3RyYWludDogdHJ1ZSxcblxuICAgIHByZVNvbHZlOiBmdW5jdGlvbiAodGltZVN0ZXAsIGludlRpbWVTdGVwKSB7XG4gICAgICB0aGlzLmF4MSA9IHRoaXMubGltaXRNb3RvcjEuYXhpcy54O1xuICAgICAgdGhpcy5heTEgPSB0aGlzLmxpbWl0TW90b3IxLmF4aXMueTtcbiAgICAgIHRoaXMuYXoxID0gdGhpcy5saW1pdE1vdG9yMS5heGlzLno7XG4gICAgICB0aGlzLmF4MiA9IHRoaXMubGltaXRNb3RvcjIuYXhpcy54O1xuICAgICAgdGhpcy5heTIgPSB0aGlzLmxpbWl0TW90b3IyLmF4aXMueTtcbiAgICAgIHRoaXMuYXoyID0gdGhpcy5saW1pdE1vdG9yMi5heGlzLno7XG4gICAgICB0aGlzLmF4MyA9IHRoaXMubGltaXRNb3RvcjMuYXhpcy54O1xuICAgICAgdGhpcy5heTMgPSB0aGlzLmxpbWl0TW90b3IzLmF4aXMueTtcbiAgICAgIHRoaXMuYXozID0gdGhpcy5saW1pdE1vdG9yMy5heGlzLno7XG4gICAgICB0aGlzLmxvd2VyTGltaXQxID0gdGhpcy5saW1pdE1vdG9yMS5sb3dlckxpbWl0O1xuICAgICAgdGhpcy51cHBlckxpbWl0MSA9IHRoaXMubGltaXRNb3RvcjEudXBwZXJMaW1pdDtcbiAgICAgIHRoaXMubW90b3JTcGVlZDEgPSB0aGlzLmxpbWl0TW90b3IxLm1vdG9yU3BlZWQ7XG4gICAgICB0aGlzLm1heE1vdG9yRm9yY2UxID0gdGhpcy5saW1pdE1vdG9yMS5tYXhNb3RvckZvcmNlO1xuICAgICAgdGhpcy5lbmFibGVNb3RvcjEgPSB0aGlzLm1heE1vdG9yRm9yY2UxID4gMDtcbiAgICAgIHRoaXMubG93ZXJMaW1pdDIgPSB0aGlzLmxpbWl0TW90b3IyLmxvd2VyTGltaXQ7XG4gICAgICB0aGlzLnVwcGVyTGltaXQyID0gdGhpcy5saW1pdE1vdG9yMi51cHBlckxpbWl0O1xuICAgICAgdGhpcy5tb3RvclNwZWVkMiA9IHRoaXMubGltaXRNb3RvcjIubW90b3JTcGVlZDtcbiAgICAgIHRoaXMubWF4TW90b3JGb3JjZTIgPSB0aGlzLmxpbWl0TW90b3IyLm1heE1vdG9yRm9yY2U7XG4gICAgICB0aGlzLmVuYWJsZU1vdG9yMiA9IHRoaXMubWF4TW90b3JGb3JjZTIgPiAwO1xuICAgICAgdGhpcy5sb3dlckxpbWl0MyA9IHRoaXMubGltaXRNb3RvcjMubG93ZXJMaW1pdDtcbiAgICAgIHRoaXMudXBwZXJMaW1pdDMgPSB0aGlzLmxpbWl0TW90b3IzLnVwcGVyTGltaXQ7XG4gICAgICB0aGlzLm1vdG9yU3BlZWQzID0gdGhpcy5saW1pdE1vdG9yMy5tb3RvclNwZWVkO1xuICAgICAgdGhpcy5tYXhNb3RvckZvcmNlMyA9IHRoaXMubGltaXRNb3RvcjMubWF4TW90b3JGb3JjZTtcbiAgICAgIHRoaXMuZW5hYmxlTW90b3IzID0gdGhpcy5tYXhNb3RvckZvcmNlMyA+IDA7XG4gICAgICB0aGlzLm0xID0gdGhpcy5iMS5pbnZlcnNlTWFzcztcbiAgICAgIHRoaXMubTIgPSB0aGlzLmIyLmludmVyc2VNYXNzO1xuXG4gICAgICB2YXIgdGkxID0gdGhpcy5pMS5lbGVtZW50cztcbiAgICAgIHZhciB0aTIgPSB0aGlzLmkyLmVsZW1lbnRzO1xuICAgICAgdGhpcy5pMWUwMCA9IHRpMVswXTtcbiAgICAgIHRoaXMuaTFlMDEgPSB0aTFbMV07XG4gICAgICB0aGlzLmkxZTAyID0gdGkxWzJdO1xuICAgICAgdGhpcy5pMWUxMCA9IHRpMVszXTtcbiAgICAgIHRoaXMuaTFlMTEgPSB0aTFbNF07XG4gICAgICB0aGlzLmkxZTEyID0gdGkxWzVdO1xuICAgICAgdGhpcy5pMWUyMCA9IHRpMVs2XTtcbiAgICAgIHRoaXMuaTFlMjEgPSB0aTFbN107XG4gICAgICB0aGlzLmkxZTIyID0gdGkxWzhdO1xuXG4gICAgICB0aGlzLmkyZTAwID0gdGkyWzBdO1xuICAgICAgdGhpcy5pMmUwMSA9IHRpMlsxXTtcbiAgICAgIHRoaXMuaTJlMDIgPSB0aTJbMl07XG4gICAgICB0aGlzLmkyZTEwID0gdGkyWzNdO1xuICAgICAgdGhpcy5pMmUxMSA9IHRpMls0XTtcbiAgICAgIHRoaXMuaTJlMTIgPSB0aTJbNV07XG4gICAgICB0aGlzLmkyZTIwID0gdGkyWzZdO1xuICAgICAgdGhpcy5pMmUyMSA9IHRpMls3XTtcbiAgICAgIHRoaXMuaTJlMjIgPSB0aTJbOF07XG5cbiAgICAgIHZhciBkeCA9IHRoaXMucDIueCAtIHRoaXMucDEueDtcbiAgICAgIHZhciBkeSA9IHRoaXMucDIueSAtIHRoaXMucDEueTtcbiAgICAgIHZhciBkeiA9IHRoaXMucDIueiAtIHRoaXMucDEuejtcbiAgICAgIHZhciBkMSA9IGR4ICogdGhpcy5heDEgKyBkeSAqIHRoaXMuYXkxICsgZHogKiB0aGlzLmF6MTtcbiAgICAgIHZhciBkMiA9IGR4ICogdGhpcy5heDIgKyBkeSAqIHRoaXMuYXkyICsgZHogKiB0aGlzLmF6MjtcbiAgICAgIHZhciBkMyA9IGR4ICogdGhpcy5heDMgKyBkeSAqIHRoaXMuYXkzICsgZHogKiB0aGlzLmF6MztcbiAgICAgIHZhciBmcmVxdWVuY3kxID0gdGhpcy5saW1pdE1vdG9yMS5mcmVxdWVuY3k7XG4gICAgICB2YXIgZnJlcXVlbmN5MiA9IHRoaXMubGltaXRNb3RvcjIuZnJlcXVlbmN5O1xuICAgICAgdmFyIGZyZXF1ZW5jeTMgPSB0aGlzLmxpbWl0TW90b3IzLmZyZXF1ZW5jeTtcbiAgICAgIHZhciBlbmFibGVTcHJpbmcxID0gZnJlcXVlbmN5MSA+IDA7XG4gICAgICB2YXIgZW5hYmxlU3ByaW5nMiA9IGZyZXF1ZW5jeTIgPiAwO1xuICAgICAgdmFyIGVuYWJsZVNwcmluZzMgPSBmcmVxdWVuY3kzID4gMDtcbiAgICAgIHZhciBlbmFibGVMaW1pdDEgPSB0aGlzLmxvd2VyTGltaXQxIDw9IHRoaXMudXBwZXJMaW1pdDE7XG4gICAgICB2YXIgZW5hYmxlTGltaXQyID0gdGhpcy5sb3dlckxpbWl0MiA8PSB0aGlzLnVwcGVyTGltaXQyO1xuICAgICAgdmFyIGVuYWJsZUxpbWl0MyA9IHRoaXMubG93ZXJMaW1pdDMgPD0gdGhpcy51cHBlckxpbWl0MztcblxuICAgICAgLy8gZm9yIHN0YWJpbGl0eVxuICAgICAgaWYgKGVuYWJsZVNwcmluZzEgJiYgZDEgPiAyMCB8fCBkMSA8IC0yMCkge1xuICAgICAgICBlbmFibGVTcHJpbmcxID0gZmFsc2U7XG4gICAgICB9XG4gICAgICBpZiAoZW5hYmxlU3ByaW5nMiAmJiBkMiA+IDIwIHx8IGQyIDwgLTIwKSB7XG4gICAgICAgIGVuYWJsZVNwcmluZzIgPSBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGlmIChlbmFibGVTcHJpbmczICYmIGQzID4gMjAgfHwgZDMgPCAtMjApIHtcbiAgICAgICAgZW5hYmxlU3ByaW5nMyA9IGZhbHNlO1xuICAgICAgfVxuXG4gICAgICBpZiAoZW5hYmxlTGltaXQxKSB7XG4gICAgICAgIGlmICh0aGlzLmxvd2VyTGltaXQxID09IHRoaXMudXBwZXJMaW1pdDEpIHtcbiAgICAgICAgICBpZiAodGhpcy5saW1pdFN0YXRlMSAhPSAwKSB7XG4gICAgICAgICAgICB0aGlzLmxpbWl0U3RhdGUxID0gMDtcbiAgICAgICAgICAgIHRoaXMubGltaXRJbXB1bHNlMSA9IDA7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMubGltaXRWZWxvY2l0eTEgPSB0aGlzLmxvd2VyTGltaXQxIC0gZDE7XG4gICAgICAgICAgaWYgKCFlbmFibGVTcHJpbmcxKSBkMSA9IHRoaXMubG93ZXJMaW1pdDE7XG4gICAgICAgIH0gZWxzZSBpZiAoZDEgPCB0aGlzLmxvd2VyTGltaXQxKSB7XG4gICAgICAgICAgaWYgKHRoaXMubGltaXRTdGF0ZTEgIT0gLTEpIHtcbiAgICAgICAgICAgIHRoaXMubGltaXRTdGF0ZTEgPSAtMTtcbiAgICAgICAgICAgIHRoaXMubGltaXRJbXB1bHNlMSA9IDA7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMubGltaXRWZWxvY2l0eTEgPSB0aGlzLmxvd2VyTGltaXQxIC0gZDE7XG4gICAgICAgICAgaWYgKCFlbmFibGVTcHJpbmcxKSBkMSA9IHRoaXMubG93ZXJMaW1pdDE7XG4gICAgICAgIH0gZWxzZSBpZiAoZDEgPiB0aGlzLnVwcGVyTGltaXQxKSB7XG4gICAgICAgICAgaWYgKHRoaXMubGltaXRTdGF0ZTEgIT0gMSkge1xuICAgICAgICAgICAgdGhpcy5saW1pdFN0YXRlMSA9IDE7XG4gICAgICAgICAgICB0aGlzLmxpbWl0SW1wdWxzZTEgPSAwO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLmxpbWl0VmVsb2NpdHkxID0gdGhpcy51cHBlckxpbWl0MSAtIGQxO1xuICAgICAgICAgIGlmICghZW5hYmxlU3ByaW5nMSkgZDEgPSB0aGlzLnVwcGVyTGltaXQxO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMubGltaXRTdGF0ZTEgPSAyO1xuICAgICAgICAgIHRoaXMubGltaXRJbXB1bHNlMSA9IDA7XG4gICAgICAgICAgdGhpcy5saW1pdFZlbG9jaXR5MSA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFlbmFibGVTcHJpbmcxKSB7XG4gICAgICAgICAgaWYgKHRoaXMubGltaXRWZWxvY2l0eTEgPiAwLjAwNSkgdGhpcy5saW1pdFZlbG9jaXR5MSAtPSAwLjAwNTtcbiAgICAgICAgICBlbHNlIGlmICh0aGlzLmxpbWl0VmVsb2NpdHkxIDwgLTAuMDA1KSB0aGlzLmxpbWl0VmVsb2NpdHkxICs9IDAuMDA1O1xuICAgICAgICAgIGVsc2UgdGhpcy5saW1pdFZlbG9jaXR5MSA9IDA7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMubGltaXRTdGF0ZTEgPSAyO1xuICAgICAgICB0aGlzLmxpbWl0SW1wdWxzZTEgPSAwO1xuICAgICAgfVxuXG4gICAgICBpZiAoZW5hYmxlTGltaXQyKSB7XG4gICAgICAgIGlmICh0aGlzLmxvd2VyTGltaXQyID09IHRoaXMudXBwZXJMaW1pdDIpIHtcbiAgICAgICAgICBpZiAodGhpcy5saW1pdFN0YXRlMiAhPSAwKSB7XG4gICAgICAgICAgICB0aGlzLmxpbWl0U3RhdGUyID0gMDtcbiAgICAgICAgICAgIHRoaXMubGltaXRJbXB1bHNlMiA9IDA7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMubGltaXRWZWxvY2l0eTIgPSB0aGlzLmxvd2VyTGltaXQyIC0gZDI7XG4gICAgICAgICAgaWYgKCFlbmFibGVTcHJpbmcyKSBkMiA9IHRoaXMubG93ZXJMaW1pdDI7XG4gICAgICAgIH0gZWxzZSBpZiAoZDIgPCB0aGlzLmxvd2VyTGltaXQyKSB7XG4gICAgICAgICAgaWYgKHRoaXMubGltaXRTdGF0ZTIgIT0gLTEpIHtcbiAgICAgICAgICAgIHRoaXMubGltaXRTdGF0ZTIgPSAtMTtcbiAgICAgICAgICAgIHRoaXMubGltaXRJbXB1bHNlMiA9IDA7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMubGltaXRWZWxvY2l0eTIgPSB0aGlzLmxvd2VyTGltaXQyIC0gZDI7XG4gICAgICAgICAgaWYgKCFlbmFibGVTcHJpbmcyKSBkMiA9IHRoaXMubG93ZXJMaW1pdDI7XG4gICAgICAgIH0gZWxzZSBpZiAoZDIgPiB0aGlzLnVwcGVyTGltaXQyKSB7XG4gICAgICAgICAgaWYgKHRoaXMubGltaXRTdGF0ZTIgIT0gMSkge1xuICAgICAgICAgICAgdGhpcy5saW1pdFN0YXRlMiA9IDE7XG4gICAgICAgICAgICB0aGlzLmxpbWl0SW1wdWxzZTIgPSAwO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLmxpbWl0VmVsb2NpdHkyID0gdGhpcy51cHBlckxpbWl0MiAtIGQyO1xuICAgICAgICAgIGlmICghZW5hYmxlU3ByaW5nMikgZDIgPSB0aGlzLnVwcGVyTGltaXQyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMubGltaXRTdGF0ZTIgPSAyO1xuICAgICAgICAgIHRoaXMubGltaXRJbXB1bHNlMiA9IDA7XG4gICAgICAgICAgdGhpcy5saW1pdFZlbG9jaXR5MiA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFlbmFibGVTcHJpbmcyKSB7XG4gICAgICAgICAgaWYgKHRoaXMubGltaXRWZWxvY2l0eTIgPiAwLjAwNSkgdGhpcy5saW1pdFZlbG9jaXR5MiAtPSAwLjAwNTtcbiAgICAgICAgICBlbHNlIGlmICh0aGlzLmxpbWl0VmVsb2NpdHkyIDwgLTAuMDA1KSB0aGlzLmxpbWl0VmVsb2NpdHkyICs9IDAuMDA1O1xuICAgICAgICAgIGVsc2UgdGhpcy5saW1pdFZlbG9jaXR5MiA9IDA7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMubGltaXRTdGF0ZTIgPSAyO1xuICAgICAgICB0aGlzLmxpbWl0SW1wdWxzZTIgPSAwO1xuICAgICAgfVxuXG4gICAgICBpZiAoZW5hYmxlTGltaXQzKSB7XG4gICAgICAgIGlmICh0aGlzLmxvd2VyTGltaXQzID09IHRoaXMudXBwZXJMaW1pdDMpIHtcbiAgICAgICAgICBpZiAodGhpcy5saW1pdFN0YXRlMyAhPSAwKSB7XG4gICAgICAgICAgICB0aGlzLmxpbWl0U3RhdGUzID0gMDtcbiAgICAgICAgICAgIHRoaXMubGltaXRJbXB1bHNlMyA9IDA7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMubGltaXRWZWxvY2l0eTMgPSB0aGlzLmxvd2VyTGltaXQzIC0gZDM7XG4gICAgICAgICAgaWYgKCFlbmFibGVTcHJpbmczKSBkMyA9IHRoaXMubG93ZXJMaW1pdDM7XG4gICAgICAgIH0gZWxzZSBpZiAoZDMgPCB0aGlzLmxvd2VyTGltaXQzKSB7XG4gICAgICAgICAgaWYgKHRoaXMubGltaXRTdGF0ZTMgIT0gLTEpIHtcbiAgICAgICAgICAgIHRoaXMubGltaXRTdGF0ZTMgPSAtMTtcbiAgICAgICAgICAgIHRoaXMubGltaXRJbXB1bHNlMyA9IDA7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMubGltaXRWZWxvY2l0eTMgPSB0aGlzLmxvd2VyTGltaXQzIC0gZDM7XG4gICAgICAgICAgaWYgKCFlbmFibGVTcHJpbmczKSBkMyA9IHRoaXMubG93ZXJMaW1pdDM7XG4gICAgICAgIH0gZWxzZSBpZiAoZDMgPiB0aGlzLnVwcGVyTGltaXQzKSB7XG4gICAgICAgICAgaWYgKHRoaXMubGltaXRTdGF0ZTMgIT0gMSkge1xuICAgICAgICAgICAgdGhpcy5saW1pdFN0YXRlMyA9IDE7XG4gICAgICAgICAgICB0aGlzLmxpbWl0SW1wdWxzZTMgPSAwO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLmxpbWl0VmVsb2NpdHkzID0gdGhpcy51cHBlckxpbWl0MyAtIGQzO1xuICAgICAgICAgIGlmICghZW5hYmxlU3ByaW5nMykgZDMgPSB0aGlzLnVwcGVyTGltaXQzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMubGltaXRTdGF0ZTMgPSAyO1xuICAgICAgICAgIHRoaXMubGltaXRJbXB1bHNlMyA9IDA7XG4gICAgICAgICAgdGhpcy5saW1pdFZlbG9jaXR5MyA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFlbmFibGVTcHJpbmczKSB7XG4gICAgICAgICAgaWYgKHRoaXMubGltaXRWZWxvY2l0eTMgPiAwLjAwNSkgdGhpcy5saW1pdFZlbG9jaXR5MyAtPSAwLjAwNTtcbiAgICAgICAgICBlbHNlIGlmICh0aGlzLmxpbWl0VmVsb2NpdHkzIDwgLTAuMDA1KSB0aGlzLmxpbWl0VmVsb2NpdHkzICs9IDAuMDA1O1xuICAgICAgICAgIGVsc2UgdGhpcy5saW1pdFZlbG9jaXR5MyA9IDA7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMubGltaXRTdGF0ZTMgPSAyO1xuICAgICAgICB0aGlzLmxpbWl0SW1wdWxzZTMgPSAwO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5lbmFibGVNb3RvcjEgJiYgKHRoaXMubGltaXRTdGF0ZTEgIT0gMCB8fCBlbmFibGVTcHJpbmcxKSkge1xuICAgICAgICB0aGlzLm1heE1vdG9ySW1wdWxzZTEgPSB0aGlzLm1heE1vdG9yRm9yY2UxICogdGltZVN0ZXA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLm1vdG9ySW1wdWxzZTEgPSAwO1xuICAgICAgICB0aGlzLm1heE1vdG9ySW1wdWxzZTEgPSAwO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5lbmFibGVNb3RvcjIgJiYgKHRoaXMubGltaXRTdGF0ZTIgIT0gMCB8fCBlbmFibGVTcHJpbmcyKSkge1xuICAgICAgICB0aGlzLm1heE1vdG9ySW1wdWxzZTIgPSB0aGlzLm1heE1vdG9yRm9yY2UyICogdGltZVN0ZXA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLm1vdG9ySW1wdWxzZTIgPSAwO1xuICAgICAgICB0aGlzLm1heE1vdG9ySW1wdWxzZTIgPSAwO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5lbmFibGVNb3RvcjMgJiYgKHRoaXMubGltaXRTdGF0ZTMgIT0gMCB8fCBlbmFibGVTcHJpbmczKSkge1xuICAgICAgICB0aGlzLm1heE1vdG9ySW1wdWxzZTMgPSB0aGlzLm1heE1vdG9yRm9yY2UzICogdGltZVN0ZXA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLm1vdG9ySW1wdWxzZTMgPSAwO1xuICAgICAgICB0aGlzLm1heE1vdG9ySW1wdWxzZTMgPSAwO1xuICAgICAgfVxuXG4gICAgICB2YXIgcmR4ID0gZDEgKiB0aGlzLmF4MSArIGQyICogdGhpcy5heDIgKyBkMyAqIHRoaXMuYXgyO1xuICAgICAgdmFyIHJkeSA9IGQxICogdGhpcy5heTEgKyBkMiAqIHRoaXMuYXkyICsgZDMgKiB0aGlzLmF5MjtcbiAgICAgIHZhciByZHogPSBkMSAqIHRoaXMuYXoxICsgZDIgKiB0aGlzLmF6MiArIGQzICogdGhpcy5hejI7XG4gICAgICB2YXIgdzEgPSB0aGlzLm0yIC8gKHRoaXMubTEgKyB0aGlzLm0yKTtcbiAgICAgIGlmICh0aGlzLndlaWdodCA+PSAwKSB3MSA9IHRoaXMud2VpZ2h0OyAvLyB1c2UgZ2l2ZW4gd2VpZ2h0XG4gICAgICB2YXIgdzIgPSAxIC0gdzE7XG4gICAgICB0aGlzLnIxeCA9IHRoaXMucjEueCArIHJkeCAqIHcxO1xuICAgICAgdGhpcy5yMXkgPSB0aGlzLnIxLnkgKyByZHkgKiB3MTtcbiAgICAgIHRoaXMucjF6ID0gdGhpcy5yMS56ICsgcmR6ICogdzE7XG4gICAgICB0aGlzLnIyeCA9IHRoaXMucjIueCAtIHJkeCAqIHcyO1xuICAgICAgdGhpcy5yMnkgPSB0aGlzLnIyLnkgLSByZHkgKiB3MjtcbiAgICAgIHRoaXMucjJ6ID0gdGhpcy5yMi56IC0gcmR6ICogdzI7XG5cbiAgICAgIC8vIGJ1aWxkIGphY29iaWFuc1xuICAgICAgdGhpcy50MXgxID0gdGhpcy5yMXkgKiB0aGlzLmF6MSAtIHRoaXMucjF6ICogdGhpcy5heTE7XG4gICAgICB0aGlzLnQxeTEgPSB0aGlzLnIxeiAqIHRoaXMuYXgxIC0gdGhpcy5yMXggKiB0aGlzLmF6MTtcbiAgICAgIHRoaXMudDF6MSA9IHRoaXMucjF4ICogdGhpcy5heTEgLSB0aGlzLnIxeSAqIHRoaXMuYXgxO1xuICAgICAgdGhpcy50MngxID0gdGhpcy5yMnkgKiB0aGlzLmF6MSAtIHRoaXMucjJ6ICogdGhpcy5heTE7XG4gICAgICB0aGlzLnQyeTEgPSB0aGlzLnIyeiAqIHRoaXMuYXgxIC0gdGhpcy5yMnggKiB0aGlzLmF6MTtcbiAgICAgIHRoaXMudDJ6MSA9IHRoaXMucjJ4ICogdGhpcy5heTEgLSB0aGlzLnIyeSAqIHRoaXMuYXgxO1xuICAgICAgdGhpcy5sMXgxID0gdGhpcy5heDEgKiB0aGlzLm0xO1xuICAgICAgdGhpcy5sMXkxID0gdGhpcy5heTEgKiB0aGlzLm0xO1xuICAgICAgdGhpcy5sMXoxID0gdGhpcy5hejEgKiB0aGlzLm0xO1xuICAgICAgdGhpcy5sMngxID0gdGhpcy5heDEgKiB0aGlzLm0yO1xuICAgICAgdGhpcy5sMnkxID0gdGhpcy5heTEgKiB0aGlzLm0yO1xuICAgICAgdGhpcy5sMnoxID0gdGhpcy5hejEgKiB0aGlzLm0yO1xuICAgICAgdGhpcy5hMXgxID0gdGhpcy50MXgxICogdGhpcy5pMWUwMCArIHRoaXMudDF5MSAqIHRoaXMuaTFlMDEgKyB0aGlzLnQxejEgKiB0aGlzLmkxZTAyO1xuICAgICAgdGhpcy5hMXkxID0gdGhpcy50MXgxICogdGhpcy5pMWUxMCArIHRoaXMudDF5MSAqIHRoaXMuaTFlMTEgKyB0aGlzLnQxejEgKiB0aGlzLmkxZTEyO1xuICAgICAgdGhpcy5hMXoxID0gdGhpcy50MXgxICogdGhpcy5pMWUyMCArIHRoaXMudDF5MSAqIHRoaXMuaTFlMjEgKyB0aGlzLnQxejEgKiB0aGlzLmkxZTIyO1xuICAgICAgdGhpcy5hMngxID0gdGhpcy50MngxICogdGhpcy5pMmUwMCArIHRoaXMudDJ5MSAqIHRoaXMuaTJlMDEgKyB0aGlzLnQyejEgKiB0aGlzLmkyZTAyO1xuICAgICAgdGhpcy5hMnkxID0gdGhpcy50MngxICogdGhpcy5pMmUxMCArIHRoaXMudDJ5MSAqIHRoaXMuaTJlMTEgKyB0aGlzLnQyejEgKiB0aGlzLmkyZTEyO1xuICAgICAgdGhpcy5hMnoxID0gdGhpcy50MngxICogdGhpcy5pMmUyMCArIHRoaXMudDJ5MSAqIHRoaXMuaTJlMjEgKyB0aGlzLnQyejEgKiB0aGlzLmkyZTIyO1xuXG4gICAgICB0aGlzLnQxeDIgPSB0aGlzLnIxeSAqIHRoaXMuYXoyIC0gdGhpcy5yMXogKiB0aGlzLmF5MjtcbiAgICAgIHRoaXMudDF5MiA9IHRoaXMucjF6ICogdGhpcy5heDIgLSB0aGlzLnIxeCAqIHRoaXMuYXoyO1xuICAgICAgdGhpcy50MXoyID0gdGhpcy5yMXggKiB0aGlzLmF5MiAtIHRoaXMucjF5ICogdGhpcy5heDI7XG4gICAgICB0aGlzLnQyeDIgPSB0aGlzLnIyeSAqIHRoaXMuYXoyIC0gdGhpcy5yMnogKiB0aGlzLmF5MjtcbiAgICAgIHRoaXMudDJ5MiA9IHRoaXMucjJ6ICogdGhpcy5heDIgLSB0aGlzLnIyeCAqIHRoaXMuYXoyO1xuICAgICAgdGhpcy50MnoyID0gdGhpcy5yMnggKiB0aGlzLmF5MiAtIHRoaXMucjJ5ICogdGhpcy5heDI7XG4gICAgICB0aGlzLmwxeDIgPSB0aGlzLmF4MiAqIHRoaXMubTE7XG4gICAgICB0aGlzLmwxeTIgPSB0aGlzLmF5MiAqIHRoaXMubTE7XG4gICAgICB0aGlzLmwxejIgPSB0aGlzLmF6MiAqIHRoaXMubTE7XG4gICAgICB0aGlzLmwyeDIgPSB0aGlzLmF4MiAqIHRoaXMubTI7XG4gICAgICB0aGlzLmwyeTIgPSB0aGlzLmF5MiAqIHRoaXMubTI7XG4gICAgICB0aGlzLmwyejIgPSB0aGlzLmF6MiAqIHRoaXMubTI7XG4gICAgICB0aGlzLmExeDIgPSB0aGlzLnQxeDIgKiB0aGlzLmkxZTAwICsgdGhpcy50MXkyICogdGhpcy5pMWUwMSArIHRoaXMudDF6MiAqIHRoaXMuaTFlMDI7XG4gICAgICB0aGlzLmExeTIgPSB0aGlzLnQxeDIgKiB0aGlzLmkxZTEwICsgdGhpcy50MXkyICogdGhpcy5pMWUxMSArIHRoaXMudDF6MiAqIHRoaXMuaTFlMTI7XG4gICAgICB0aGlzLmExejIgPSB0aGlzLnQxeDIgKiB0aGlzLmkxZTIwICsgdGhpcy50MXkyICogdGhpcy5pMWUyMSArIHRoaXMudDF6MiAqIHRoaXMuaTFlMjI7XG4gICAgICB0aGlzLmEyeDIgPSB0aGlzLnQyeDIgKiB0aGlzLmkyZTAwICsgdGhpcy50MnkyICogdGhpcy5pMmUwMSArIHRoaXMudDJ6MiAqIHRoaXMuaTJlMDI7XG4gICAgICB0aGlzLmEyeTIgPSB0aGlzLnQyeDIgKiB0aGlzLmkyZTEwICsgdGhpcy50MnkyICogdGhpcy5pMmUxMSArIHRoaXMudDJ6MiAqIHRoaXMuaTJlMTI7XG4gICAgICB0aGlzLmEyejIgPSB0aGlzLnQyeDIgKiB0aGlzLmkyZTIwICsgdGhpcy50MnkyICogdGhpcy5pMmUyMSArIHRoaXMudDJ6MiAqIHRoaXMuaTJlMjI7XG5cbiAgICAgIHRoaXMudDF4MyA9IHRoaXMucjF5ICogdGhpcy5hejMgLSB0aGlzLnIxeiAqIHRoaXMuYXkzO1xuICAgICAgdGhpcy50MXkzID0gdGhpcy5yMXogKiB0aGlzLmF4MyAtIHRoaXMucjF4ICogdGhpcy5hejM7XG4gICAgICB0aGlzLnQxejMgPSB0aGlzLnIxeCAqIHRoaXMuYXkzIC0gdGhpcy5yMXkgKiB0aGlzLmF4MztcbiAgICAgIHRoaXMudDJ4MyA9IHRoaXMucjJ5ICogdGhpcy5hejMgLSB0aGlzLnIyeiAqIHRoaXMuYXkzO1xuICAgICAgdGhpcy50MnkzID0gdGhpcy5yMnogKiB0aGlzLmF4MyAtIHRoaXMucjJ4ICogdGhpcy5hejM7XG4gICAgICB0aGlzLnQyejMgPSB0aGlzLnIyeCAqIHRoaXMuYXkzIC0gdGhpcy5yMnkgKiB0aGlzLmF4MztcbiAgICAgIHRoaXMubDF4MyA9IHRoaXMuYXgzICogdGhpcy5tMTtcbiAgICAgIHRoaXMubDF5MyA9IHRoaXMuYXkzICogdGhpcy5tMTtcbiAgICAgIHRoaXMubDF6MyA9IHRoaXMuYXozICogdGhpcy5tMTtcbiAgICAgIHRoaXMubDJ4MyA9IHRoaXMuYXgzICogdGhpcy5tMjtcbiAgICAgIHRoaXMubDJ5MyA9IHRoaXMuYXkzICogdGhpcy5tMjtcbiAgICAgIHRoaXMubDJ6MyA9IHRoaXMuYXozICogdGhpcy5tMjtcbiAgICAgIHRoaXMuYTF4MyA9IHRoaXMudDF4MyAqIHRoaXMuaTFlMDAgKyB0aGlzLnQxeTMgKiB0aGlzLmkxZTAxICsgdGhpcy50MXozICogdGhpcy5pMWUwMjtcbiAgICAgIHRoaXMuYTF5MyA9IHRoaXMudDF4MyAqIHRoaXMuaTFlMTAgKyB0aGlzLnQxeTMgKiB0aGlzLmkxZTExICsgdGhpcy50MXozICogdGhpcy5pMWUxMjtcbiAgICAgIHRoaXMuYTF6MyA9IHRoaXMudDF4MyAqIHRoaXMuaTFlMjAgKyB0aGlzLnQxeTMgKiB0aGlzLmkxZTIxICsgdGhpcy50MXozICogdGhpcy5pMWUyMjtcbiAgICAgIHRoaXMuYTJ4MyA9IHRoaXMudDJ4MyAqIHRoaXMuaTJlMDAgKyB0aGlzLnQyeTMgKiB0aGlzLmkyZTAxICsgdGhpcy50MnozICogdGhpcy5pMmUwMjtcbiAgICAgIHRoaXMuYTJ5MyA9IHRoaXMudDJ4MyAqIHRoaXMuaTJlMTAgKyB0aGlzLnQyeTMgKiB0aGlzLmkyZTExICsgdGhpcy50MnozICogdGhpcy5pMmUxMjtcbiAgICAgIHRoaXMuYTJ6MyA9IHRoaXMudDJ4MyAqIHRoaXMuaTJlMjAgKyB0aGlzLnQyeTMgKiB0aGlzLmkyZTIxICsgdGhpcy50MnozICogdGhpcy5pMmUyMjtcblxuICAgICAgLy8gYnVpbGQgYW4gaW1wdWxzZSBtYXRyaXhcbiAgICAgIHZhciBtMTIgPSB0aGlzLm0xICsgdGhpcy5tMjtcbiAgICAgIHRoaXMuazAwID0gKHRoaXMuYXgxICogdGhpcy5heDEgKyB0aGlzLmF5MSAqIHRoaXMuYXkxICsgdGhpcy5hejEgKiB0aGlzLmF6MSkgKiBtMTI7XG4gICAgICB0aGlzLmswMSA9ICh0aGlzLmF4MSAqIHRoaXMuYXgyICsgdGhpcy5heTEgKiB0aGlzLmF5MiArIHRoaXMuYXoxICogdGhpcy5hejIpICogbTEyO1xuICAgICAgdGhpcy5rMDIgPSAodGhpcy5heDEgKiB0aGlzLmF4MyArIHRoaXMuYXkxICogdGhpcy5heTMgKyB0aGlzLmF6MSAqIHRoaXMuYXozKSAqIG0xMjtcbiAgICAgIHRoaXMuazEwID0gKHRoaXMuYXgyICogdGhpcy5heDEgKyB0aGlzLmF5MiAqIHRoaXMuYXkxICsgdGhpcy5hejIgKiB0aGlzLmF6MSkgKiBtMTI7XG4gICAgICB0aGlzLmsxMSA9ICh0aGlzLmF4MiAqIHRoaXMuYXgyICsgdGhpcy5heTIgKiB0aGlzLmF5MiArIHRoaXMuYXoyICogdGhpcy5hejIpICogbTEyO1xuICAgICAgdGhpcy5rMTIgPSAodGhpcy5heDIgKiB0aGlzLmF4MyArIHRoaXMuYXkyICogdGhpcy5heTMgKyB0aGlzLmF6MiAqIHRoaXMuYXozKSAqIG0xMjtcbiAgICAgIHRoaXMuazIwID0gKHRoaXMuYXgzICogdGhpcy5heDEgKyB0aGlzLmF5MyAqIHRoaXMuYXkxICsgdGhpcy5hejMgKiB0aGlzLmF6MSkgKiBtMTI7XG4gICAgICB0aGlzLmsyMSA9ICh0aGlzLmF4MyAqIHRoaXMuYXgyICsgdGhpcy5heTMgKiB0aGlzLmF5MiArIHRoaXMuYXozICogdGhpcy5hejIpICogbTEyO1xuICAgICAgdGhpcy5rMjIgPSAodGhpcy5heDMgKiB0aGlzLmF4MyArIHRoaXMuYXkzICogdGhpcy5heTMgKyB0aGlzLmF6MyAqIHRoaXMuYXozKSAqIG0xMjtcblxuICAgICAgdGhpcy5rMDAgKz0gdGhpcy50MXgxICogdGhpcy5hMXgxICsgdGhpcy50MXkxICogdGhpcy5hMXkxICsgdGhpcy50MXoxICogdGhpcy5hMXoxO1xuICAgICAgdGhpcy5rMDEgKz0gdGhpcy50MXgxICogdGhpcy5hMXgyICsgdGhpcy50MXkxICogdGhpcy5hMXkyICsgdGhpcy50MXoxICogdGhpcy5hMXoyO1xuICAgICAgdGhpcy5rMDIgKz0gdGhpcy50MXgxICogdGhpcy5hMXgzICsgdGhpcy50MXkxICogdGhpcy5hMXkzICsgdGhpcy50MXoxICogdGhpcy5hMXozO1xuICAgICAgdGhpcy5rMTAgKz0gdGhpcy50MXgyICogdGhpcy5hMXgxICsgdGhpcy50MXkyICogdGhpcy5hMXkxICsgdGhpcy50MXoyICogdGhpcy5hMXoxO1xuICAgICAgdGhpcy5rMTEgKz0gdGhpcy50MXgyICogdGhpcy5hMXgyICsgdGhpcy50MXkyICogdGhpcy5hMXkyICsgdGhpcy50MXoyICogdGhpcy5hMXoyO1xuICAgICAgdGhpcy5rMTIgKz0gdGhpcy50MXgyICogdGhpcy5hMXgzICsgdGhpcy50MXkyICogdGhpcy5hMXkzICsgdGhpcy50MXoyICogdGhpcy5hMXozO1xuICAgICAgdGhpcy5rMjAgKz0gdGhpcy50MXgzICogdGhpcy5hMXgxICsgdGhpcy50MXkzICogdGhpcy5hMXkxICsgdGhpcy50MXozICogdGhpcy5hMXoxO1xuICAgICAgdGhpcy5rMjEgKz0gdGhpcy50MXgzICogdGhpcy5hMXgyICsgdGhpcy50MXkzICogdGhpcy5hMXkyICsgdGhpcy50MXozICogdGhpcy5hMXoyO1xuICAgICAgdGhpcy5rMjIgKz0gdGhpcy50MXgzICogdGhpcy5hMXgzICsgdGhpcy50MXkzICogdGhpcy5hMXkzICsgdGhpcy50MXozICogdGhpcy5hMXozO1xuXG4gICAgICB0aGlzLmswMCArPSB0aGlzLnQyeDEgKiB0aGlzLmEyeDEgKyB0aGlzLnQyeTEgKiB0aGlzLmEyeTEgKyB0aGlzLnQyejEgKiB0aGlzLmEyejE7XG4gICAgICB0aGlzLmswMSArPSB0aGlzLnQyeDEgKiB0aGlzLmEyeDIgKyB0aGlzLnQyeTEgKiB0aGlzLmEyeTIgKyB0aGlzLnQyejEgKiB0aGlzLmEyejI7XG4gICAgICB0aGlzLmswMiArPSB0aGlzLnQyeDEgKiB0aGlzLmEyeDMgKyB0aGlzLnQyeTEgKiB0aGlzLmEyeTMgKyB0aGlzLnQyejEgKiB0aGlzLmEyejM7XG4gICAgICB0aGlzLmsxMCArPSB0aGlzLnQyeDIgKiB0aGlzLmEyeDEgKyB0aGlzLnQyeTIgKiB0aGlzLmEyeTEgKyB0aGlzLnQyejIgKiB0aGlzLmEyejE7XG4gICAgICB0aGlzLmsxMSArPSB0aGlzLnQyeDIgKiB0aGlzLmEyeDIgKyB0aGlzLnQyeTIgKiB0aGlzLmEyeTIgKyB0aGlzLnQyejIgKiB0aGlzLmEyejI7XG4gICAgICB0aGlzLmsxMiArPSB0aGlzLnQyeDIgKiB0aGlzLmEyeDMgKyB0aGlzLnQyeTIgKiB0aGlzLmEyeTMgKyB0aGlzLnQyejIgKiB0aGlzLmEyejM7XG4gICAgICB0aGlzLmsyMCArPSB0aGlzLnQyeDMgKiB0aGlzLmEyeDEgKyB0aGlzLnQyeTMgKiB0aGlzLmEyeTEgKyB0aGlzLnQyejMgKiB0aGlzLmEyejE7XG4gICAgICB0aGlzLmsyMSArPSB0aGlzLnQyeDMgKiB0aGlzLmEyeDIgKyB0aGlzLnQyeTMgKiB0aGlzLmEyeTIgKyB0aGlzLnQyejMgKiB0aGlzLmEyejI7XG4gICAgICB0aGlzLmsyMiArPSB0aGlzLnQyeDMgKiB0aGlzLmEyeDMgKyB0aGlzLnQyeTMgKiB0aGlzLmEyeTMgKyB0aGlzLnQyejMgKiB0aGlzLmEyejM7XG5cbiAgICAgIHRoaXMua3YwMCA9IHRoaXMuazAwO1xuICAgICAgdGhpcy5rdjExID0gdGhpcy5rMTE7XG4gICAgICB0aGlzLmt2MjIgPSB0aGlzLmsyMjtcblxuICAgICAgdGhpcy5kdjAwID0gMSAvIHRoaXMua3YwMDtcbiAgICAgIHRoaXMuZHYxMSA9IDEgLyB0aGlzLmt2MTE7XG4gICAgICB0aGlzLmR2MjIgPSAxIC8gdGhpcy5rdjIyO1xuXG4gICAgICBpZiAoZW5hYmxlU3ByaW5nMSAmJiB0aGlzLmxpbWl0U3RhdGUxICE9IDIpIHtcbiAgICAgICAgdmFyIG9tZWdhID0gNi4yODMxODUzICogZnJlcXVlbmN5MTtcbiAgICAgICAgdmFyIGsgPSBvbWVnYSAqIG9tZWdhICogdGltZVN0ZXA7XG4gICAgICAgIHZhciBkbXAgPSBpbnZUaW1lU3RlcCAvIChrICsgMiAqIHRoaXMubGltaXRNb3RvcjEuZGFtcGluZ1JhdGlvICogb21lZ2EpO1xuICAgICAgICB0aGlzLmNmbTEgPSB0aGlzLmt2MDAgKiBkbXA7XG4gICAgICAgIHRoaXMubGltaXRWZWxvY2l0eTEgKj0gayAqIGRtcDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuY2ZtMSA9IDA7XG4gICAgICAgIHRoaXMubGltaXRWZWxvY2l0eTEgKj0gaW52VGltZVN0ZXAgKiAwLjA1O1xuICAgICAgfVxuICAgICAgaWYgKGVuYWJsZVNwcmluZzIgJiYgdGhpcy5saW1pdFN0YXRlMiAhPSAyKSB7XG4gICAgICAgIG9tZWdhID0gNi4yODMxODUzICogZnJlcXVlbmN5MjtcbiAgICAgICAgayA9IG9tZWdhICogb21lZ2EgKiB0aW1lU3RlcDtcbiAgICAgICAgZG1wID0gaW52VGltZVN0ZXAgLyAoayArIDIgKiB0aGlzLmxpbWl0TW90b3IyLmRhbXBpbmdSYXRpbyAqIG9tZWdhKTtcbiAgICAgICAgdGhpcy5jZm0yID0gdGhpcy5rdjExICogZG1wO1xuICAgICAgICB0aGlzLmxpbWl0VmVsb2NpdHkyICo9IGsgKiBkbXA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmNmbTIgPSAwO1xuICAgICAgICB0aGlzLmxpbWl0VmVsb2NpdHkyICo9IGludlRpbWVTdGVwICogMC4wNTtcbiAgICAgIH1cbiAgICAgIGlmIChlbmFibGVTcHJpbmczICYmIHRoaXMubGltaXRTdGF0ZTMgIT0gMikge1xuICAgICAgICBvbWVnYSA9IDYuMjgzMTg1MyAqIGZyZXF1ZW5jeTM7XG4gICAgICAgIGsgPSBvbWVnYSAqIG9tZWdhICogdGltZVN0ZXA7XG4gICAgICAgIGRtcCA9IGludlRpbWVTdGVwIC8gKGsgKyAyICogdGhpcy5saW1pdE1vdG9yMy5kYW1waW5nUmF0aW8gKiBvbWVnYSk7XG4gICAgICAgIHRoaXMuY2ZtMyA9IHRoaXMua3YyMiAqIGRtcDtcbiAgICAgICAgdGhpcy5saW1pdFZlbG9jaXR5MyAqPSBrICogZG1wO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5jZm0zID0gMDtcbiAgICAgICAgdGhpcy5saW1pdFZlbG9jaXR5MyAqPSBpbnZUaW1lU3RlcCAqIDAuMDU7XG4gICAgICB9XG4gICAgICB0aGlzLmswMCArPSB0aGlzLmNmbTE7XG4gICAgICB0aGlzLmsxMSArPSB0aGlzLmNmbTI7XG4gICAgICB0aGlzLmsyMiArPSB0aGlzLmNmbTM7XG5cbiAgICAgIHZhciBpbnYgPSAxIC8gKFxuICAgICAgICB0aGlzLmswMCAqICh0aGlzLmsxMSAqIHRoaXMuazIyIC0gdGhpcy5rMjEgKiB0aGlzLmsxMikgK1xuICAgICAgICB0aGlzLmsxMCAqICh0aGlzLmsyMSAqIHRoaXMuazAyIC0gdGhpcy5rMDEgKiB0aGlzLmsyMikgK1xuICAgICAgICB0aGlzLmsyMCAqICh0aGlzLmswMSAqIHRoaXMuazEyIC0gdGhpcy5rMTEgKiB0aGlzLmswMilcbiAgICAgICk7XG4gICAgICB0aGlzLmQwMCA9ICh0aGlzLmsxMSAqIHRoaXMuazIyIC0gdGhpcy5rMTIgKiB0aGlzLmsyMSkgKiBpbnY7XG4gICAgICB0aGlzLmQwMSA9ICh0aGlzLmswMiAqIHRoaXMuazIxIC0gdGhpcy5rMDEgKiB0aGlzLmsyMikgKiBpbnY7XG4gICAgICB0aGlzLmQwMiA9ICh0aGlzLmswMSAqIHRoaXMuazEyIC0gdGhpcy5rMDIgKiB0aGlzLmsxMSkgKiBpbnY7XG4gICAgICB0aGlzLmQxMCA9ICh0aGlzLmsxMiAqIHRoaXMuazIwIC0gdGhpcy5rMTAgKiB0aGlzLmsyMikgKiBpbnY7XG4gICAgICB0aGlzLmQxMSA9ICh0aGlzLmswMCAqIHRoaXMuazIyIC0gdGhpcy5rMDIgKiB0aGlzLmsyMCkgKiBpbnY7XG4gICAgICB0aGlzLmQxMiA9ICh0aGlzLmswMiAqIHRoaXMuazEwIC0gdGhpcy5rMDAgKiB0aGlzLmsxMikgKiBpbnY7XG4gICAgICB0aGlzLmQyMCA9ICh0aGlzLmsxMCAqIHRoaXMuazIxIC0gdGhpcy5rMTEgKiB0aGlzLmsyMCkgKiBpbnY7XG4gICAgICB0aGlzLmQyMSA9ICh0aGlzLmswMSAqIHRoaXMuazIwIC0gdGhpcy5rMDAgKiB0aGlzLmsyMSkgKiBpbnY7XG4gICAgICB0aGlzLmQyMiA9ICh0aGlzLmswMCAqIHRoaXMuazExIC0gdGhpcy5rMDEgKiB0aGlzLmsxMCkgKiBpbnY7XG5cbiAgICAgIC8vIHdhcm0gc3RhcnRpbmdcbiAgICAgIHZhciB0b3RhbEltcHVsc2UxID0gdGhpcy5saW1pdEltcHVsc2UxICsgdGhpcy5tb3RvckltcHVsc2UxO1xuICAgICAgdmFyIHRvdGFsSW1wdWxzZTIgPSB0aGlzLmxpbWl0SW1wdWxzZTIgKyB0aGlzLm1vdG9ySW1wdWxzZTI7XG4gICAgICB2YXIgdG90YWxJbXB1bHNlMyA9IHRoaXMubGltaXRJbXB1bHNlMyArIHRoaXMubW90b3JJbXB1bHNlMztcbiAgICAgIHRoaXMubDEueCArPSB0b3RhbEltcHVsc2UxICogdGhpcy5sMXgxICsgdG90YWxJbXB1bHNlMiAqIHRoaXMubDF4MiArIHRvdGFsSW1wdWxzZTMgKiB0aGlzLmwxeDM7XG4gICAgICB0aGlzLmwxLnkgKz0gdG90YWxJbXB1bHNlMSAqIHRoaXMubDF5MSArIHRvdGFsSW1wdWxzZTIgKiB0aGlzLmwxeTIgKyB0b3RhbEltcHVsc2UzICogdGhpcy5sMXkzO1xuICAgICAgdGhpcy5sMS56ICs9IHRvdGFsSW1wdWxzZTEgKiB0aGlzLmwxejEgKyB0b3RhbEltcHVsc2UyICogdGhpcy5sMXoyICsgdG90YWxJbXB1bHNlMyAqIHRoaXMubDF6MztcbiAgICAgIHRoaXMuYTEueCArPSB0b3RhbEltcHVsc2UxICogdGhpcy5hMXgxICsgdG90YWxJbXB1bHNlMiAqIHRoaXMuYTF4MiArIHRvdGFsSW1wdWxzZTMgKiB0aGlzLmExeDM7XG4gICAgICB0aGlzLmExLnkgKz0gdG90YWxJbXB1bHNlMSAqIHRoaXMuYTF5MSArIHRvdGFsSW1wdWxzZTIgKiB0aGlzLmExeTIgKyB0b3RhbEltcHVsc2UzICogdGhpcy5hMXkzO1xuICAgICAgdGhpcy5hMS56ICs9IHRvdGFsSW1wdWxzZTEgKiB0aGlzLmExejEgKyB0b3RhbEltcHVsc2UyICogdGhpcy5hMXoyICsgdG90YWxJbXB1bHNlMyAqIHRoaXMuYTF6MztcbiAgICAgIHRoaXMubDIueCAtPSB0b3RhbEltcHVsc2UxICogdGhpcy5sMngxICsgdG90YWxJbXB1bHNlMiAqIHRoaXMubDJ4MiArIHRvdGFsSW1wdWxzZTMgKiB0aGlzLmwyeDM7XG4gICAgICB0aGlzLmwyLnkgLT0gdG90YWxJbXB1bHNlMSAqIHRoaXMubDJ5MSArIHRvdGFsSW1wdWxzZTIgKiB0aGlzLmwyeTIgKyB0b3RhbEltcHVsc2UzICogdGhpcy5sMnkzO1xuICAgICAgdGhpcy5sMi56IC09IHRvdGFsSW1wdWxzZTEgKiB0aGlzLmwyejEgKyB0b3RhbEltcHVsc2UyICogdGhpcy5sMnoyICsgdG90YWxJbXB1bHNlMyAqIHRoaXMubDJ6MztcbiAgICAgIHRoaXMuYTIueCAtPSB0b3RhbEltcHVsc2UxICogdGhpcy5hMngxICsgdG90YWxJbXB1bHNlMiAqIHRoaXMuYTJ4MiArIHRvdGFsSW1wdWxzZTMgKiB0aGlzLmEyeDM7XG4gICAgICB0aGlzLmEyLnkgLT0gdG90YWxJbXB1bHNlMSAqIHRoaXMuYTJ5MSArIHRvdGFsSW1wdWxzZTIgKiB0aGlzLmEyeTIgKyB0b3RhbEltcHVsc2UzICogdGhpcy5hMnkzO1xuICAgICAgdGhpcy5hMi56IC09IHRvdGFsSW1wdWxzZTEgKiB0aGlzLmEyejEgKyB0b3RhbEltcHVsc2UyICogdGhpcy5hMnoyICsgdG90YWxJbXB1bHNlMyAqIHRoaXMuYTJ6MztcbiAgICB9LFxuXG4gICAgc29sdmU6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBydnggPSB0aGlzLmwyLnggLSB0aGlzLmwxLnggKyB0aGlzLmEyLnkgKiB0aGlzLnIyeiAtIHRoaXMuYTIueiAqIHRoaXMucjJ5IC0gdGhpcy5hMS55ICogdGhpcy5yMXogKyB0aGlzLmExLnogKiB0aGlzLnIxeTtcbiAgICAgIHZhciBydnkgPSB0aGlzLmwyLnkgLSB0aGlzLmwxLnkgKyB0aGlzLmEyLnogKiB0aGlzLnIyeCAtIHRoaXMuYTIueCAqIHRoaXMucjJ6IC0gdGhpcy5hMS56ICogdGhpcy5yMXggKyB0aGlzLmExLnggKiB0aGlzLnIxejtcbiAgICAgIHZhciBydnogPSB0aGlzLmwyLnogLSB0aGlzLmwxLnogKyB0aGlzLmEyLnggKiB0aGlzLnIyeSAtIHRoaXMuYTIueSAqIHRoaXMucjJ4IC0gdGhpcy5hMS54ICogdGhpcy5yMXkgKyB0aGlzLmExLnkgKiB0aGlzLnIxeDtcbiAgICAgIHZhciBydm4xID0gcnZ4ICogdGhpcy5heDEgKyBydnkgKiB0aGlzLmF5MSArIHJ2eiAqIHRoaXMuYXoxO1xuICAgICAgdmFyIHJ2bjIgPSBydnggKiB0aGlzLmF4MiArIHJ2eSAqIHRoaXMuYXkyICsgcnZ6ICogdGhpcy5hejI7XG4gICAgICB2YXIgcnZuMyA9IHJ2eCAqIHRoaXMuYXgzICsgcnZ5ICogdGhpcy5heTMgKyBydnogKiB0aGlzLmF6MztcbiAgICAgIHZhciBvbGRNb3RvckltcHVsc2UxID0gdGhpcy5tb3RvckltcHVsc2UxO1xuICAgICAgdmFyIG9sZE1vdG9ySW1wdWxzZTIgPSB0aGlzLm1vdG9ySW1wdWxzZTI7XG4gICAgICB2YXIgb2xkTW90b3JJbXB1bHNlMyA9IHRoaXMubW90b3JJbXB1bHNlMztcbiAgICAgIHZhciBkTW90b3JJbXB1bHNlMSA9IDA7XG4gICAgICB2YXIgZE1vdG9ySW1wdWxzZTIgPSAwO1xuICAgICAgdmFyIGRNb3RvckltcHVsc2UzID0gMDtcbiAgICAgIGlmICh0aGlzLmVuYWJsZU1vdG9yMSkge1xuICAgICAgICBkTW90b3JJbXB1bHNlMSA9IChydm4xIC0gdGhpcy5tb3RvclNwZWVkMSkgKiB0aGlzLmR2MDA7XG4gICAgICAgIHRoaXMubW90b3JJbXB1bHNlMSArPSBkTW90b3JJbXB1bHNlMTtcbiAgICAgICAgaWYgKHRoaXMubW90b3JJbXB1bHNlMSA+IHRoaXMubWF4TW90b3JJbXB1bHNlMSkgeyAvLyBjbGFtcCBtb3RvciBpbXB1bHNlXG4gICAgICAgICAgdGhpcy5tb3RvckltcHVsc2UxID0gdGhpcy5tYXhNb3RvckltcHVsc2UxO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMubW90b3JJbXB1bHNlMSA8IC10aGlzLm1heE1vdG9ySW1wdWxzZTEpIHtcbiAgICAgICAgICB0aGlzLm1vdG9ySW1wdWxzZTEgPSAtdGhpcy5tYXhNb3RvckltcHVsc2UxO1xuICAgICAgICB9XG4gICAgICAgIGRNb3RvckltcHVsc2UxID0gdGhpcy5tb3RvckltcHVsc2UxIC0gb2xkTW90b3JJbXB1bHNlMTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmVuYWJsZU1vdG9yMikge1xuICAgICAgICBkTW90b3JJbXB1bHNlMiA9IChydm4yIC0gdGhpcy5tb3RvclNwZWVkMikgKiB0aGlzLmR2MTE7XG4gICAgICAgIHRoaXMubW90b3JJbXB1bHNlMiArPSBkTW90b3JJbXB1bHNlMjtcbiAgICAgICAgaWYgKHRoaXMubW90b3JJbXB1bHNlMiA+IHRoaXMubWF4TW90b3JJbXB1bHNlMikgeyAvLyBjbGFtcCBtb3RvciBpbXB1bHNlXG4gICAgICAgICAgdGhpcy5tb3RvckltcHVsc2UyID0gdGhpcy5tYXhNb3RvckltcHVsc2UyO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMubW90b3JJbXB1bHNlMiA8IC10aGlzLm1heE1vdG9ySW1wdWxzZTIpIHtcbiAgICAgICAgICB0aGlzLm1vdG9ySW1wdWxzZTIgPSAtdGhpcy5tYXhNb3RvckltcHVsc2UyO1xuICAgICAgICB9XG4gICAgICAgIGRNb3RvckltcHVsc2UyID0gdGhpcy5tb3RvckltcHVsc2UyIC0gb2xkTW90b3JJbXB1bHNlMjtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmVuYWJsZU1vdG9yMykge1xuICAgICAgICBkTW90b3JJbXB1bHNlMyA9IChydm4zIC0gdGhpcy5tb3RvclNwZWVkMykgKiB0aGlzLmR2MjI7XG4gICAgICAgIHRoaXMubW90b3JJbXB1bHNlMyArPSBkTW90b3JJbXB1bHNlMztcbiAgICAgICAgaWYgKHRoaXMubW90b3JJbXB1bHNlMyA+IHRoaXMubWF4TW90b3JJbXB1bHNlMykgeyAvLyBjbGFtcCBtb3RvciBpbXB1bHNlXG4gICAgICAgICAgdGhpcy5tb3RvckltcHVsc2UzID0gdGhpcy5tYXhNb3RvckltcHVsc2UzO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMubW90b3JJbXB1bHNlMyA8IC10aGlzLm1heE1vdG9ySW1wdWxzZTMpIHtcbiAgICAgICAgICB0aGlzLm1vdG9ySW1wdWxzZTMgPSAtdGhpcy5tYXhNb3RvckltcHVsc2UzO1xuICAgICAgICB9XG4gICAgICAgIGRNb3RvckltcHVsc2UzID0gdGhpcy5tb3RvckltcHVsc2UzIC0gb2xkTW90b3JJbXB1bHNlMztcbiAgICAgIH1cblxuICAgICAgLy8gYXBwbHkgbW90b3IgaW1wdWxzZSB0byByZWxhdGl2ZSB2ZWxvY2l0eVxuICAgICAgcnZuMSArPSBkTW90b3JJbXB1bHNlMSAqIHRoaXMua3YwMCArIGRNb3RvckltcHVsc2UyICogdGhpcy5rMDEgKyBkTW90b3JJbXB1bHNlMyAqIHRoaXMuazAyO1xuICAgICAgcnZuMiArPSBkTW90b3JJbXB1bHNlMSAqIHRoaXMuazEwICsgZE1vdG9ySW1wdWxzZTIgKiB0aGlzLmt2MTEgKyBkTW90b3JJbXB1bHNlMyAqIHRoaXMuazEyO1xuICAgICAgcnZuMyArPSBkTW90b3JJbXB1bHNlMSAqIHRoaXMuazIwICsgZE1vdG9ySW1wdWxzZTIgKiB0aGlzLmsyMSArIGRNb3RvckltcHVsc2UzICogdGhpcy5rdjIyO1xuXG4gICAgICAvLyBzdWJ0cmFjdCB0YXJnZXQgdmVsb2NpdHkgYW5kIGFwcGxpZWQgaW1wdWxzZVxuICAgICAgcnZuMSAtPSB0aGlzLmxpbWl0VmVsb2NpdHkxICsgdGhpcy5saW1pdEltcHVsc2UxICogdGhpcy5jZm0xO1xuICAgICAgcnZuMiAtPSB0aGlzLmxpbWl0VmVsb2NpdHkyICsgdGhpcy5saW1pdEltcHVsc2UyICogdGhpcy5jZm0yO1xuICAgICAgcnZuMyAtPSB0aGlzLmxpbWl0VmVsb2NpdHkzICsgdGhpcy5saW1pdEltcHVsc2UzICogdGhpcy5jZm0zO1xuXG4gICAgICB2YXIgb2xkTGltaXRJbXB1bHNlMSA9IHRoaXMubGltaXRJbXB1bHNlMTtcbiAgICAgIHZhciBvbGRMaW1pdEltcHVsc2UyID0gdGhpcy5saW1pdEltcHVsc2UyO1xuICAgICAgdmFyIG9sZExpbWl0SW1wdWxzZTMgPSB0aGlzLmxpbWl0SW1wdWxzZTM7XG5cbiAgICAgIHZhciBkTGltaXRJbXB1bHNlMSA9IHJ2bjEgKiB0aGlzLmQwMCArIHJ2bjIgKiB0aGlzLmQwMSArIHJ2bjMgKiB0aGlzLmQwMjtcbiAgICAgIHZhciBkTGltaXRJbXB1bHNlMiA9IHJ2bjEgKiB0aGlzLmQxMCArIHJ2bjIgKiB0aGlzLmQxMSArIHJ2bjMgKiB0aGlzLmQxMjtcbiAgICAgIHZhciBkTGltaXRJbXB1bHNlMyA9IHJ2bjEgKiB0aGlzLmQyMCArIHJ2bjIgKiB0aGlzLmQyMSArIHJ2bjMgKiB0aGlzLmQyMjtcblxuICAgICAgdGhpcy5saW1pdEltcHVsc2UxICs9IGRMaW1pdEltcHVsc2UxO1xuICAgICAgdGhpcy5saW1pdEltcHVsc2UyICs9IGRMaW1pdEltcHVsc2UyO1xuICAgICAgdGhpcy5saW1pdEltcHVsc2UzICs9IGRMaW1pdEltcHVsc2UzO1xuXG4gICAgICAvLyBjbGFtcFxuICAgICAgdmFyIGNsYW1wU3RhdGUgPSAwO1xuICAgICAgaWYgKHRoaXMubGltaXRTdGF0ZTEgPT0gMiB8fCB0aGlzLmxpbWl0SW1wdWxzZTEgKiB0aGlzLmxpbWl0U3RhdGUxIDwgMCkge1xuICAgICAgICBkTGltaXRJbXB1bHNlMSA9IC1vbGRMaW1pdEltcHVsc2UxO1xuICAgICAgICBydm4yICs9IGRMaW1pdEltcHVsc2UxICogdGhpcy5rMTA7XG4gICAgICAgIHJ2bjMgKz0gZExpbWl0SW1wdWxzZTEgKiB0aGlzLmsyMDtcbiAgICAgICAgY2xhbXBTdGF0ZSB8PSAxO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMubGltaXRTdGF0ZTIgPT0gMiB8fCB0aGlzLmxpbWl0SW1wdWxzZTIgKiB0aGlzLmxpbWl0U3RhdGUyIDwgMCkge1xuICAgICAgICBkTGltaXRJbXB1bHNlMiA9IC1vbGRMaW1pdEltcHVsc2UyO1xuICAgICAgICBydm4xICs9IGRMaW1pdEltcHVsc2UyICogdGhpcy5rMDE7XG4gICAgICAgIHJ2bjMgKz0gZExpbWl0SW1wdWxzZTIgKiB0aGlzLmsyMTtcbiAgICAgICAgY2xhbXBTdGF0ZSB8PSAyO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMubGltaXRTdGF0ZTMgPT0gMiB8fCB0aGlzLmxpbWl0SW1wdWxzZTMgKiB0aGlzLmxpbWl0U3RhdGUzIDwgMCkge1xuICAgICAgICBkTGltaXRJbXB1bHNlMyA9IC1vbGRMaW1pdEltcHVsc2UzO1xuICAgICAgICBydm4xICs9IGRMaW1pdEltcHVsc2UzICogdGhpcy5rMDI7XG4gICAgICAgIHJ2bjIgKz0gZExpbWl0SW1wdWxzZTMgKiB0aGlzLmsxMjtcbiAgICAgICAgY2xhbXBTdGF0ZSB8PSA0O1xuICAgICAgfVxuXG4gICAgICAvLyB1cGRhdGUgdW4tY2xhbXBlZCBpbXB1bHNlXG4gICAgICAvLyBUT0RPOiBpc29sYXRlIGRpdmlzaW9uXG4gICAgICB2YXIgZGV0O1xuICAgICAgc3dpdGNoIChjbGFtcFN0YXRlKSB7XG4gICAgICAgIGNhc2UgMTovLyB1cGRhdGUgMiAzXG4gICAgICAgICAgZGV0ID0gMSAvICh0aGlzLmsxMSAqIHRoaXMuazIyIC0gdGhpcy5rMTIgKiB0aGlzLmsyMSk7XG4gICAgICAgICAgZExpbWl0SW1wdWxzZTIgPSAodGhpcy5rMjIgKiBydm4yICsgLXRoaXMuazEyICogcnZuMykgKiBkZXQ7XG4gICAgICAgICAgZExpbWl0SW1wdWxzZTMgPSAoLXRoaXMuazIxICogcnZuMiArIHRoaXMuazExICogcnZuMykgKiBkZXQ7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMjovLyB1cGRhdGUgMSAzXG4gICAgICAgICAgZGV0ID0gMSAvICh0aGlzLmswMCAqIHRoaXMuazIyIC0gdGhpcy5rMDIgKiB0aGlzLmsyMCk7XG4gICAgICAgICAgZExpbWl0SW1wdWxzZTEgPSAodGhpcy5rMjIgKiBydm4xICsgLXRoaXMuazAyICogcnZuMykgKiBkZXQ7XG4gICAgICAgICAgZExpbWl0SW1wdWxzZTMgPSAoLXRoaXMuazIwICogcnZuMSArIHRoaXMuazAwICogcnZuMykgKiBkZXQ7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMzovLyB1cGRhdGUgM1xuICAgICAgICAgIGRMaW1pdEltcHVsc2UzID0gcnZuMyAvIHRoaXMuazIyO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDQ6Ly8gdXBkYXRlIDEgMlxuICAgICAgICAgIGRldCA9IDEgLyAodGhpcy5rMDAgKiB0aGlzLmsxMSAtIHRoaXMuazAxICogdGhpcy5rMTApO1xuICAgICAgICAgIGRMaW1pdEltcHVsc2UxID0gKHRoaXMuazExICogcnZuMSArIC10aGlzLmswMSAqIHJ2bjIpICogZGV0O1xuICAgICAgICAgIGRMaW1pdEltcHVsc2UyID0gKC10aGlzLmsxMCAqIHJ2bjEgKyB0aGlzLmswMCAqIHJ2bjIpICogZGV0O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDU6Ly8gdXBkYXRlIDJcbiAgICAgICAgICBkTGltaXRJbXB1bHNlMiA9IHJ2bjIgLyB0aGlzLmsxMTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA2Oi8vIHVwZGF0ZSAxXG4gICAgICAgICAgZExpbWl0SW1wdWxzZTEgPSBydm4xIC8gdGhpcy5rMDA7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIHRoaXMubGltaXRJbXB1bHNlMSA9IG9sZExpbWl0SW1wdWxzZTEgKyBkTGltaXRJbXB1bHNlMTtcbiAgICAgIHRoaXMubGltaXRJbXB1bHNlMiA9IG9sZExpbWl0SW1wdWxzZTIgKyBkTGltaXRJbXB1bHNlMjtcbiAgICAgIHRoaXMubGltaXRJbXB1bHNlMyA9IG9sZExpbWl0SW1wdWxzZTMgKyBkTGltaXRJbXB1bHNlMztcblxuICAgICAgdmFyIGRJbXB1bHNlMSA9IGRNb3RvckltcHVsc2UxICsgZExpbWl0SW1wdWxzZTE7XG4gICAgICB2YXIgZEltcHVsc2UyID0gZE1vdG9ySW1wdWxzZTIgKyBkTGltaXRJbXB1bHNlMjtcbiAgICAgIHZhciBkSW1wdWxzZTMgPSBkTW90b3JJbXB1bHNlMyArIGRMaW1pdEltcHVsc2UzO1xuXG4gICAgICAvLyBhcHBseSBpbXB1bHNlXG4gICAgICB0aGlzLmwxLnggKz0gZEltcHVsc2UxICogdGhpcy5sMXgxICsgZEltcHVsc2UyICogdGhpcy5sMXgyICsgZEltcHVsc2UzICogdGhpcy5sMXgzO1xuICAgICAgdGhpcy5sMS55ICs9IGRJbXB1bHNlMSAqIHRoaXMubDF5MSArIGRJbXB1bHNlMiAqIHRoaXMubDF5MiArIGRJbXB1bHNlMyAqIHRoaXMubDF5MztcbiAgICAgIHRoaXMubDEueiArPSBkSW1wdWxzZTEgKiB0aGlzLmwxejEgKyBkSW1wdWxzZTIgKiB0aGlzLmwxejIgKyBkSW1wdWxzZTMgKiB0aGlzLmwxejM7XG4gICAgICB0aGlzLmExLnggKz0gZEltcHVsc2UxICogdGhpcy5hMXgxICsgZEltcHVsc2UyICogdGhpcy5hMXgyICsgZEltcHVsc2UzICogdGhpcy5hMXgzO1xuICAgICAgdGhpcy5hMS55ICs9IGRJbXB1bHNlMSAqIHRoaXMuYTF5MSArIGRJbXB1bHNlMiAqIHRoaXMuYTF5MiArIGRJbXB1bHNlMyAqIHRoaXMuYTF5MztcbiAgICAgIHRoaXMuYTEueiArPSBkSW1wdWxzZTEgKiB0aGlzLmExejEgKyBkSW1wdWxzZTIgKiB0aGlzLmExejIgKyBkSW1wdWxzZTMgKiB0aGlzLmExejM7XG4gICAgICB0aGlzLmwyLnggLT0gZEltcHVsc2UxICogdGhpcy5sMngxICsgZEltcHVsc2UyICogdGhpcy5sMngyICsgZEltcHVsc2UzICogdGhpcy5sMngzO1xuICAgICAgdGhpcy5sMi55IC09IGRJbXB1bHNlMSAqIHRoaXMubDJ5MSArIGRJbXB1bHNlMiAqIHRoaXMubDJ5MiArIGRJbXB1bHNlMyAqIHRoaXMubDJ5MztcbiAgICAgIHRoaXMubDIueiAtPSBkSW1wdWxzZTEgKiB0aGlzLmwyejEgKyBkSW1wdWxzZTIgKiB0aGlzLmwyejIgKyBkSW1wdWxzZTMgKiB0aGlzLmwyejM7XG4gICAgICB0aGlzLmEyLnggLT0gZEltcHVsc2UxICogdGhpcy5hMngxICsgZEltcHVsc2UyICogdGhpcy5hMngyICsgZEltcHVsc2UzICogdGhpcy5hMngzO1xuICAgICAgdGhpcy5hMi55IC09IGRJbXB1bHNlMSAqIHRoaXMuYTJ5MSArIGRJbXB1bHNlMiAqIHRoaXMuYTJ5MiArIGRJbXB1bHNlMyAqIHRoaXMuYTJ5MztcbiAgICAgIHRoaXMuYTIueiAtPSBkSW1wdWxzZTEgKiB0aGlzLmEyejEgKyBkSW1wdWxzZTIgKiB0aGlzLmEyejIgKyBkSW1wdWxzZTMgKiB0aGlzLmEyejM7XG4gICAgfVxuXG4gIH0pO1xuXG4gIC8qKlxuICAgKiBBIHByaXNtYXRpYyBqb2ludCBhbGxvd3Mgb25seSBmb3IgcmVsYXRpdmUgdHJhbnNsYXRpb24gb2YgcmlnaWQgYm9kaWVzIGFsb25nIHRoZSBheGlzLlxuICAgKlxuICAgKiBAYXV0aG9yIHNhaGFyYW5cbiAgICogQGF1dGhvciBsby10aFxuICAgKi9cblxuICBmdW5jdGlvbiBQcmlzbWF0aWNKb2ludChjb25maWcsIGxvd2VyVHJhbnNsYXRpb24sIHVwcGVyVHJhbnNsYXRpb24pIHtcblxuICAgIEpvaW50LmNhbGwodGhpcywgY29uZmlnKTtcblxuICAgIHRoaXMudHlwZSA9IEpPSU5UX1BSSVNNQVRJQztcblxuICAgIC8vIFRoZSBheGlzIGluIHRoZSBmaXJzdCBib2R5J3MgY29vcmRpbmF0ZSBzeXN0ZW0uXG4gICAgdGhpcy5sb2NhbEF4aXMxID0gY29uZmlnLmxvY2FsQXhpczEuY2xvbmUoKS5ub3JtYWxpemUoKTtcbiAgICAvLyBUaGUgYXhpcyBpbiB0aGUgc2Vjb25kIGJvZHkncyBjb29yZGluYXRlIHN5c3RlbS5cbiAgICB0aGlzLmxvY2FsQXhpczIgPSBjb25maWcubG9jYWxBeGlzMi5jbG9uZSgpLm5vcm1hbGl6ZSgpO1xuXG4gICAgdGhpcy5heDEgPSBuZXcgVmVjMygpO1xuICAgIHRoaXMuYXgyID0gbmV3IFZlYzMoKTtcblxuICAgIHRoaXMubm9yID0gbmV3IFZlYzMoKTtcbiAgICB0aGlzLnRhbiA9IG5ldyBWZWMzKCk7XG4gICAgdGhpcy5iaW4gPSBuZXcgVmVjMygpO1xuXG4gICAgdGhpcy5hYyA9IG5ldyBBbmd1bGFyQ29uc3RyYWludCh0aGlzLCBuZXcgUXVhdCgpLnNldEZyb21Vbml0VmVjdG9ycyh0aGlzLmxvY2FsQXhpczEsIHRoaXMubG9jYWxBeGlzMikpO1xuXG4gICAgLy8gVGhlIHRyYW5zbGF0aW9uYWwgbGltaXQgYW5kIG1vdG9yIGluZm9ybWF0aW9uIG9mIHRoZSBqb2ludC5cbiAgICB0aGlzLmxpbWl0TW90b3IgPSBuZXcgTGltaXRNb3Rvcih0aGlzLm5vciwgdHJ1ZSk7XG4gICAgdGhpcy5saW1pdE1vdG9yLmxvd2VyTGltaXQgPSBsb3dlclRyYW5zbGF0aW9uO1xuICAgIHRoaXMubGltaXRNb3Rvci51cHBlckxpbWl0ID0gdXBwZXJUcmFuc2xhdGlvbjtcbiAgICB0aGlzLnQzID0gbmV3IFRyYW5zbGF0aW9uYWwzQ29uc3RyYWludCh0aGlzLCB0aGlzLmxpbWl0TW90b3IsIG5ldyBMaW1pdE1vdG9yKHRoaXMudGFuLCB0cnVlKSwgbmV3IExpbWl0TW90b3IodGhpcy5iaW4sIHRydWUpKTtcblxuICB9XG4gIFByaXNtYXRpY0pvaW50LnByb3RvdHlwZSA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmNyZWF0ZShKb2ludC5wcm90b3R5cGUpLCB7XG5cbiAgICBjb25zdHJ1Y3RvcjogUHJpc21hdGljSm9pbnQsXG5cbiAgICBwcmVTb2x2ZTogZnVuY3Rpb24gKHRpbWVTdGVwLCBpbnZUaW1lU3RlcCkge1xuXG4gICAgICB0aGlzLnVwZGF0ZUFuY2hvclBvaW50cygpO1xuXG4gICAgICB0aGlzLmF4MS5jb3B5KHRoaXMubG9jYWxBeGlzMSkuYXBwbHlNYXRyaXgzKHRoaXMuYm9keTEucm90YXRpb24sIHRydWUpO1xuICAgICAgdGhpcy5heDIuY29weSh0aGlzLmxvY2FsQXhpczIpLmFwcGx5TWF0cml4Myh0aGlzLmJvZHkyLnJvdGF0aW9uLCB0cnVlKTtcblxuICAgICAgLy8gbm9ybWFsIHRhbmdlbnQgYmlub3JtYWxcblxuICAgICAgdGhpcy5ub3Iuc2V0KFxuICAgICAgICB0aGlzLmF4MS54ICogdGhpcy5ib2R5Mi5pbnZlcnNlTWFzcyArIHRoaXMuYXgyLnggKiB0aGlzLmJvZHkxLmludmVyc2VNYXNzLFxuICAgICAgICB0aGlzLmF4MS55ICogdGhpcy5ib2R5Mi5pbnZlcnNlTWFzcyArIHRoaXMuYXgyLnkgKiB0aGlzLmJvZHkxLmludmVyc2VNYXNzLFxuICAgICAgICB0aGlzLmF4MS56ICogdGhpcy5ib2R5Mi5pbnZlcnNlTWFzcyArIHRoaXMuYXgyLnogKiB0aGlzLmJvZHkxLmludmVyc2VNYXNzXG4gICAgICApLm5vcm1hbGl6ZSgpO1xuICAgICAgdGhpcy50YW4udGFuZ2VudCh0aGlzLm5vcikubm9ybWFsaXplKCk7XG4gICAgICB0aGlzLmJpbi5jcm9zc1ZlY3RvcnModGhpcy5ub3IsIHRoaXMudGFuKTtcblxuICAgICAgLy8gcHJlU29sdmVcblxuICAgICAgdGhpcy5hYy5wcmVTb2x2ZSh0aW1lU3RlcCwgaW52VGltZVN0ZXApO1xuICAgICAgdGhpcy50My5wcmVTb2x2ZSh0aW1lU3RlcCwgaW52VGltZVN0ZXApO1xuXG4gICAgfSxcblxuICAgIHNvbHZlOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHRoaXMuYWMuc29sdmUoKTtcbiAgICAgIHRoaXMudDMuc29sdmUoKTtcblxuICAgIH0sXG5cbiAgICBwb3N0U29sdmU6IGZ1bmN0aW9uICgpIHtcblxuICAgIH1cblxuICB9KTtcblxuICAvKipcbiAgICogQSBzbGlkZXIgam9pbnQgYWxsb3dzIGZvciByZWxhdGl2ZSB0cmFuc2xhdGlvbiBhbmQgcmVsYXRpdmUgcm90YXRpb24gYmV0d2VlbiB0d28gcmlnaWQgYm9kaWVzIGFsb25nIHRoZSBheGlzLlxuICAgKlxuICAgKiBAYXV0aG9yIHNhaGFyYW5cbiAgICogQGF1dGhvciBsby10aFxuICAgKi9cblxuICBmdW5jdGlvbiBTbGlkZXJKb2ludChjb25maWcsIGxvd2VyVHJhbnNsYXRpb24sIHVwcGVyVHJhbnNsYXRpb24pIHtcblxuICAgIEpvaW50LmNhbGwodGhpcywgY29uZmlnKTtcblxuICAgIHRoaXMudHlwZSA9IEpPSU5UX1NMSURFUjtcblxuICAgIC8vIFRoZSBheGlzIGluIHRoZSBmaXJzdCBib2R5J3MgY29vcmRpbmF0ZSBzeXN0ZW0uXG4gICAgdGhpcy5sb2NhbEF4aXMxID0gY29uZmlnLmxvY2FsQXhpczEuY2xvbmUoKS5ub3JtYWxpemUoKTtcbiAgICAvLyBUaGUgYXhpcyBpbiB0aGUgc2Vjb25kIGJvZHkncyBjb29yZGluYXRlIHN5c3RlbS5cbiAgICB0aGlzLmxvY2FsQXhpczIgPSBjb25maWcubG9jYWxBeGlzMi5jbG9uZSgpLm5vcm1hbGl6ZSgpO1xuXG4gICAgLy8gbWFrZSBhbmdsZSBheGlzXG4gICAgdmFyIGFyYyA9IG5ldyBNYXQzMygpLnNldFF1YXQobmV3IFF1YXQoKS5zZXRGcm9tVW5pdFZlY3RvcnModGhpcy5sb2NhbEF4aXMxLCB0aGlzLmxvY2FsQXhpczIpKTtcbiAgICB0aGlzLmxvY2FsQW5nbGUxID0gbmV3IFZlYzMoKS50YW5nZW50KHRoaXMubG9jYWxBeGlzMSkubm9ybWFsaXplKCk7XG4gICAgdGhpcy5sb2NhbEFuZ2xlMiA9IHRoaXMubG9jYWxBbmdsZTEuY2xvbmUoKS5hcHBseU1hdHJpeDMoYXJjLCB0cnVlKTtcblxuICAgIHRoaXMuYXgxID0gbmV3IFZlYzMoKTtcbiAgICB0aGlzLmF4MiA9IG5ldyBWZWMzKCk7XG4gICAgdGhpcy5hbjEgPSBuZXcgVmVjMygpO1xuICAgIHRoaXMuYW4yID0gbmV3IFZlYzMoKTtcblxuICAgIHRoaXMudG1wID0gbmV3IFZlYzMoKTtcblxuICAgIHRoaXMubm9yID0gbmV3IFZlYzMoKTtcbiAgICB0aGlzLnRhbiA9IG5ldyBWZWMzKCk7XG4gICAgdGhpcy5iaW4gPSBuZXcgVmVjMygpO1xuXG4gICAgLy8gVGhlIGxpbWl0IGFuZCBtb3RvciBmb3IgdGhlIHJvdGF0aW9uXG4gICAgdGhpcy5yb3RhdGlvbmFsTGltaXRNb3RvciA9IG5ldyBMaW1pdE1vdG9yKHRoaXMubm9yLCBmYWxzZSk7XG4gICAgdGhpcy5yMyA9IG5ldyBSb3RhdGlvbmFsM0NvbnN0cmFpbnQodGhpcywgdGhpcy5yb3RhdGlvbmFsTGltaXRNb3RvciwgbmV3IExpbWl0TW90b3IodGhpcy50YW4sIHRydWUpLCBuZXcgTGltaXRNb3Rvcih0aGlzLmJpbiwgdHJ1ZSkpO1xuXG4gICAgLy8gVGhlIGxpbWl0IGFuZCBtb3RvciBmb3IgdGhlIHRyYW5zbGF0aW9uLlxuICAgIHRoaXMudHJhbnNsYXRpb25hbExpbWl0TW90b3IgPSBuZXcgTGltaXRNb3Rvcih0aGlzLm5vciwgdHJ1ZSk7XG4gICAgdGhpcy50cmFuc2xhdGlvbmFsTGltaXRNb3Rvci5sb3dlckxpbWl0ID0gbG93ZXJUcmFuc2xhdGlvbjtcbiAgICB0aGlzLnRyYW5zbGF0aW9uYWxMaW1pdE1vdG9yLnVwcGVyTGltaXQgPSB1cHBlclRyYW5zbGF0aW9uO1xuICAgIHRoaXMudDMgPSBuZXcgVHJhbnNsYXRpb25hbDNDb25zdHJhaW50KHRoaXMsIHRoaXMudHJhbnNsYXRpb25hbExpbWl0TW90b3IsIG5ldyBMaW1pdE1vdG9yKHRoaXMudGFuLCB0cnVlKSwgbmV3IExpbWl0TW90b3IodGhpcy5iaW4sIHRydWUpKTtcblxuICB9XG4gIFNsaWRlckpvaW50LnByb3RvdHlwZSA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmNyZWF0ZShKb2ludC5wcm90b3R5cGUpLCB7XG5cbiAgICBjb25zdHJ1Y3RvcjogU2xpZGVySm9pbnQsXG5cbiAgICBwcmVTb2x2ZTogZnVuY3Rpb24gKHRpbWVTdGVwLCBpbnZUaW1lU3RlcCkge1xuXG4gICAgICB0aGlzLnVwZGF0ZUFuY2hvclBvaW50cygpO1xuXG4gICAgICB0aGlzLmF4MS5jb3B5KHRoaXMubG9jYWxBeGlzMSkuYXBwbHlNYXRyaXgzKHRoaXMuYm9keTEucm90YXRpb24sIHRydWUpO1xuICAgICAgdGhpcy5hbjEuY29weSh0aGlzLmxvY2FsQW5nbGUxKS5hcHBseU1hdHJpeDModGhpcy5ib2R5MS5yb3RhdGlvbiwgdHJ1ZSk7XG5cbiAgICAgIHRoaXMuYXgyLmNvcHkodGhpcy5sb2NhbEF4aXMyKS5hcHBseU1hdHJpeDModGhpcy5ib2R5Mi5yb3RhdGlvbiwgdHJ1ZSk7XG4gICAgICB0aGlzLmFuMi5jb3B5KHRoaXMubG9jYWxBbmdsZTIpLmFwcGx5TWF0cml4Myh0aGlzLmJvZHkyLnJvdGF0aW9uLCB0cnVlKTtcblxuICAgICAgLy8gbm9ybWFsIHRhbmdlbnQgYmlub3JtYWxcblxuICAgICAgdGhpcy5ub3Iuc2V0KFxuICAgICAgICB0aGlzLmF4MS54ICogdGhpcy5ib2R5Mi5pbnZlcnNlTWFzcyArIHRoaXMuYXgyLnggKiB0aGlzLmJvZHkxLmludmVyc2VNYXNzLFxuICAgICAgICB0aGlzLmF4MS55ICogdGhpcy5ib2R5Mi5pbnZlcnNlTWFzcyArIHRoaXMuYXgyLnkgKiB0aGlzLmJvZHkxLmludmVyc2VNYXNzLFxuICAgICAgICB0aGlzLmF4MS56ICogdGhpcy5ib2R5Mi5pbnZlcnNlTWFzcyArIHRoaXMuYXgyLnogKiB0aGlzLmJvZHkxLmludmVyc2VNYXNzXG4gICAgICApLm5vcm1hbGl6ZSgpO1xuICAgICAgdGhpcy50YW4udGFuZ2VudCh0aGlzLm5vcikubm9ybWFsaXplKCk7XG4gICAgICB0aGlzLmJpbi5jcm9zc1ZlY3RvcnModGhpcy5ub3IsIHRoaXMudGFuKTtcblxuICAgICAgLy8gY2FsY3VsYXRlIGhpbmdlIGFuZ2xlXG5cbiAgICAgIHRoaXMudG1wLmNyb3NzVmVjdG9ycyh0aGlzLmFuMSwgdGhpcy5hbjIpO1xuXG4gICAgICB2YXIgbGltaXRlID0gX01hdGguYWNvc0NsYW1wKF9NYXRoLmRvdFZlY3RvcnModGhpcy5hbjEsIHRoaXMuYW4yKSk7XG5cbiAgICAgIGlmIChfTWF0aC5kb3RWZWN0b3JzKHRoaXMubm9yLCB0aGlzLnRtcCkgPCAwKSB0aGlzLnJvdGF0aW9uYWxMaW1pdE1vdG9yLmFuZ2xlID0gLWxpbWl0ZTtcbiAgICAgIGVsc2UgdGhpcy5yb3RhdGlvbmFsTGltaXRNb3Rvci5hbmdsZSA9IGxpbWl0ZTtcblxuICAgICAgLy8gYW5ndWxhciBlcnJvclxuXG4gICAgICB0aGlzLnRtcC5jcm9zc1ZlY3RvcnModGhpcy5heDEsIHRoaXMuYXgyKTtcbiAgICAgIHRoaXMucjMubGltaXRNb3RvcjIuYW5nbGUgPSBfTWF0aC5kb3RWZWN0b3JzKHRoaXMudGFuLCB0aGlzLnRtcCk7XG4gICAgICB0aGlzLnIzLmxpbWl0TW90b3IzLmFuZ2xlID0gX01hdGguZG90VmVjdG9ycyh0aGlzLmJpbiwgdGhpcy50bXApO1xuXG4gICAgICAvLyBwcmVTb2x2ZVxuXG4gICAgICB0aGlzLnIzLnByZVNvbHZlKHRpbWVTdGVwLCBpbnZUaW1lU3RlcCk7XG4gICAgICB0aGlzLnQzLnByZVNvbHZlKHRpbWVTdGVwLCBpbnZUaW1lU3RlcCk7XG5cbiAgICB9LFxuXG4gICAgc29sdmU6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgdGhpcy5yMy5zb2x2ZSgpO1xuICAgICAgdGhpcy50My5zb2x2ZSgpO1xuXG4gICAgfSxcblxuICAgIHBvc3RTb2x2ZTogZnVuY3Rpb24gKCkge1xuXG4gICAgfVxuXG4gIH0pO1xuXG4gIC8qKlxuICAgKiBBIHdoZWVsIGpvaW50IGFsbG93cyBmb3IgcmVsYXRpdmUgcm90YXRpb24gYmV0d2VlbiB0d28gcmlnaWQgYm9kaWVzIGFsb25nIHR3byBheGVzLlxuICAgKiBUaGUgd2hlZWwgam9pbnQgYWxzbyBhbGxvd3MgZm9yIHJlbGF0aXZlIHRyYW5zbGF0aW9uIGZvciB0aGUgc3VzcGVuc2lvbi5cbiAgICpcbiAgICogQGF1dGhvciBzYWhhcmFuXG4gICAqIEBhdXRob3IgbG8tdGhcbiAgICovXG5cbiAgZnVuY3Rpb24gV2hlZWxKb2ludChjb25maWcpIHtcblxuICAgIEpvaW50LmNhbGwodGhpcywgY29uZmlnKTtcblxuICAgIHRoaXMudHlwZSA9IEpPSU5UX1dIRUVMO1xuXG4gICAgLy8gVGhlIGF4aXMgaW4gdGhlIGZpcnN0IGJvZHkncyBjb29yZGluYXRlIHN5c3RlbS5cbiAgICB0aGlzLmxvY2FsQXhpczEgPSBjb25maWcubG9jYWxBeGlzMS5jbG9uZSgpLm5vcm1hbGl6ZSgpO1xuICAgIC8vIFRoZSBheGlzIGluIHRoZSBzZWNvbmQgYm9keSdzIGNvb3JkaW5hdGUgc3lzdGVtLlxuICAgIHRoaXMubG9jYWxBeGlzMiA9IGNvbmZpZy5sb2NhbEF4aXMyLmNsb25lKCkubm9ybWFsaXplKCk7XG5cbiAgICB0aGlzLmxvY2FsQW5nbGUxID0gbmV3IFZlYzMoKTtcbiAgICB0aGlzLmxvY2FsQW5nbGUyID0gbmV3IFZlYzMoKTtcblxuICAgIHZhciBkb3QgPSBfTWF0aC5kb3RWZWN0b3JzKHRoaXMubG9jYWxBeGlzMSwgdGhpcy5sb2NhbEF4aXMyKTtcblxuICAgIGlmIChkb3QgPiAtMSAmJiBkb3QgPCAxKSB7XG5cbiAgICAgIHRoaXMubG9jYWxBbmdsZTEuc2V0KFxuICAgICAgICB0aGlzLmxvY2FsQXhpczIueCAtIGRvdCAqIHRoaXMubG9jYWxBeGlzMS54LFxuICAgICAgICB0aGlzLmxvY2FsQXhpczIueSAtIGRvdCAqIHRoaXMubG9jYWxBeGlzMS55LFxuICAgICAgICB0aGlzLmxvY2FsQXhpczIueiAtIGRvdCAqIHRoaXMubG9jYWxBeGlzMS56XG4gICAgICApLm5vcm1hbGl6ZSgpO1xuXG4gICAgICB0aGlzLmxvY2FsQW5nbGUyLnNldChcbiAgICAgICAgdGhpcy5sb2NhbEF4aXMxLnggLSBkb3QgKiB0aGlzLmxvY2FsQXhpczIueCxcbiAgICAgICAgdGhpcy5sb2NhbEF4aXMxLnkgLSBkb3QgKiB0aGlzLmxvY2FsQXhpczIueSxcbiAgICAgICAgdGhpcy5sb2NhbEF4aXMxLnogLSBkb3QgKiB0aGlzLmxvY2FsQXhpczIuelxuICAgICAgKS5ub3JtYWxpemUoKTtcblxuICAgIH0gZWxzZSB7XG5cbiAgICAgIHZhciBhcmMgPSBuZXcgTWF0MzMoKS5zZXRRdWF0KG5ldyBRdWF0KCkuc2V0RnJvbVVuaXRWZWN0b3JzKHRoaXMubG9jYWxBeGlzMSwgdGhpcy5sb2NhbEF4aXMyKSk7XG4gICAgICB0aGlzLmxvY2FsQW5nbGUxLnRhbmdlbnQodGhpcy5sb2NhbEF4aXMxKS5ub3JtYWxpemUoKTtcbiAgICAgIHRoaXMubG9jYWxBbmdsZTIgPSB0aGlzLmxvY2FsQW5nbGUxLmNsb25lKCkuYXBwbHlNYXRyaXgzKGFyYywgdHJ1ZSk7XG5cbiAgICB9XG5cbiAgICB0aGlzLmF4MSA9IG5ldyBWZWMzKCk7XG4gICAgdGhpcy5heDIgPSBuZXcgVmVjMygpO1xuICAgIHRoaXMuYW4xID0gbmV3IFZlYzMoKTtcbiAgICB0aGlzLmFuMiA9IG5ldyBWZWMzKCk7XG5cbiAgICB0aGlzLnRtcCA9IG5ldyBWZWMzKCk7XG5cbiAgICB0aGlzLm5vciA9IG5ldyBWZWMzKCk7XG4gICAgdGhpcy50YW4gPSBuZXcgVmVjMygpO1xuICAgIHRoaXMuYmluID0gbmV3IFZlYzMoKTtcblxuICAgIC8vIFRoZSB0cmFuc2xhdGlvbmFsIGxpbWl0IGFuZCBtb3RvciBpbmZvcm1hdGlvbiBvZiB0aGUgam9pbnQuXG4gICAgdGhpcy50cmFuc2xhdGlvbmFsTGltaXRNb3RvciA9IG5ldyBMaW1pdE1vdG9yKHRoaXMudGFuLCB0cnVlKTtcbiAgICB0aGlzLnRyYW5zbGF0aW9uYWxMaW1pdE1vdG9yLmZyZXF1ZW5jeSA9IDg7XG4gICAgdGhpcy50cmFuc2xhdGlvbmFsTGltaXRNb3Rvci5kYW1waW5nUmF0aW8gPSAxO1xuICAgIC8vIFRoZSBmaXJzdCByb3RhdGlvbmFsIGxpbWl0IGFuZCBtb3RvciBpbmZvcm1hdGlvbiBvZiB0aGUgam9pbnQuXG4gICAgdGhpcy5yb3RhdGlvbmFsTGltaXRNb3RvcjEgPSBuZXcgTGltaXRNb3Rvcih0aGlzLnRhbiwgZmFsc2UpO1xuICAgIC8vIFRoZSBzZWNvbmQgcm90YXRpb25hbCBsaW1pdCBhbmQgbW90b3IgaW5mb3JtYXRpb24gb2YgdGhlIGpvaW50LlxuICAgIHRoaXMucm90YXRpb25hbExpbWl0TW90b3IyID0gbmV3IExpbWl0TW90b3IodGhpcy5iaW4sIGZhbHNlKTtcblxuICAgIHRoaXMudDMgPSBuZXcgVHJhbnNsYXRpb25hbDNDb25zdHJhaW50KHRoaXMsIG5ldyBMaW1pdE1vdG9yKHRoaXMubm9yLCB0cnVlKSwgdGhpcy50cmFuc2xhdGlvbmFsTGltaXRNb3RvciwgbmV3IExpbWl0TW90b3IodGhpcy5iaW4sIHRydWUpKTtcbiAgICB0aGlzLnQzLndlaWdodCA9IDE7XG4gICAgdGhpcy5yMyA9IG5ldyBSb3RhdGlvbmFsM0NvbnN0cmFpbnQodGhpcywgbmV3IExpbWl0TW90b3IodGhpcy5ub3IsIHRydWUpLCB0aGlzLnJvdGF0aW9uYWxMaW1pdE1vdG9yMSwgdGhpcy5yb3RhdGlvbmFsTGltaXRNb3RvcjIpO1xuXG4gIH1cbiAgV2hlZWxKb2ludC5wcm90b3R5cGUgPSBPYmplY3QuYXNzaWduKE9iamVjdC5jcmVhdGUoSm9pbnQucHJvdG90eXBlKSwge1xuXG4gICAgY29uc3RydWN0b3I6IFdoZWVsSm9pbnQsXG5cbiAgICBwcmVTb2x2ZTogZnVuY3Rpb24gKHRpbWVTdGVwLCBpbnZUaW1lU3RlcCkge1xuXG4gICAgICB0aGlzLnVwZGF0ZUFuY2hvclBvaW50cygpO1xuXG4gICAgICB0aGlzLmF4MS5jb3B5KHRoaXMubG9jYWxBeGlzMSkuYXBwbHlNYXRyaXgzKHRoaXMuYm9keTEucm90YXRpb24sIHRydWUpO1xuICAgICAgdGhpcy5hbjEuY29weSh0aGlzLmxvY2FsQW5nbGUxKS5hcHBseU1hdHJpeDModGhpcy5ib2R5MS5yb3RhdGlvbiwgdHJ1ZSk7XG5cbiAgICAgIHRoaXMuYXgyLmNvcHkodGhpcy5sb2NhbEF4aXMyKS5hcHBseU1hdHJpeDModGhpcy5ib2R5Mi5yb3RhdGlvbiwgdHJ1ZSk7XG4gICAgICB0aGlzLmFuMi5jb3B5KHRoaXMubG9jYWxBbmdsZTIpLmFwcGx5TWF0cml4Myh0aGlzLmJvZHkyLnJvdGF0aW9uLCB0cnVlKTtcblxuICAgICAgdGhpcy5yMy5saW1pdE1vdG9yMS5hbmdsZSA9IF9NYXRoLmRvdFZlY3RvcnModGhpcy5heDEsIHRoaXMuYXgyKTtcblxuICAgICAgdmFyIGxpbWl0ZSA9IF9NYXRoLmRvdFZlY3RvcnModGhpcy5hbjEsIHRoaXMuYXgyKTtcblxuICAgICAgaWYgKF9NYXRoLmRvdFZlY3RvcnModGhpcy5heDEsIHRoaXMudG1wLmNyb3NzVmVjdG9ycyh0aGlzLmFuMSwgdGhpcy5heDIpKSA8IDApIHRoaXMucm90YXRpb25hbExpbWl0TW90b3IxLmFuZ2xlID0gLWxpbWl0ZTtcbiAgICAgIGVsc2UgdGhpcy5yb3RhdGlvbmFsTGltaXRNb3RvcjEuYW5nbGUgPSBsaW1pdGU7XG5cbiAgICAgIGxpbWl0ZSA9IF9NYXRoLmRvdFZlY3RvcnModGhpcy5hbjIsIHRoaXMuYXgxKTtcblxuICAgICAgaWYgKF9NYXRoLmRvdFZlY3RvcnModGhpcy5heDIsIHRoaXMudG1wLmNyb3NzVmVjdG9ycyh0aGlzLmFuMiwgdGhpcy5heDEpKSA8IDApIHRoaXMucm90YXRpb25hbExpbWl0TW90b3IyLmFuZ2xlID0gLWxpbWl0ZTtcbiAgICAgIGVsc2UgdGhpcy5yb3RhdGlvbmFsTGltaXRNb3RvcjIuYW5nbGUgPSBsaW1pdGU7XG5cbiAgICAgIHRoaXMubm9yLmNyb3NzVmVjdG9ycyh0aGlzLmF4MSwgdGhpcy5heDIpLm5vcm1hbGl6ZSgpO1xuICAgICAgdGhpcy50YW4uY3Jvc3NWZWN0b3JzKHRoaXMubm9yLCB0aGlzLmF4Mikubm9ybWFsaXplKCk7XG4gICAgICB0aGlzLmJpbi5jcm9zc1ZlY3RvcnModGhpcy5ub3IsIHRoaXMuYXgxKS5ub3JtYWxpemUoKTtcblxuICAgICAgdGhpcy5yMy5wcmVTb2x2ZSh0aW1lU3RlcCwgaW52VGltZVN0ZXApO1xuICAgICAgdGhpcy50My5wcmVTb2x2ZSh0aW1lU3RlcCwgaW52VGltZVN0ZXApO1xuXG4gICAgfSxcblxuICAgIHNvbHZlOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHRoaXMucjMuc29sdmUoKTtcbiAgICAgIHRoaXMudDMuc29sdmUoKTtcblxuICAgIH0sXG5cbiAgICBwb3N0U29sdmU6IGZ1bmN0aW9uICgpIHtcblxuICAgIH1cblxuICB9KTtcblxuICBmdW5jdGlvbiBKb2ludENvbmZpZygpIHtcblxuICAgIHRoaXMuc2NhbGUgPSAxO1xuICAgIHRoaXMuaW52U2NhbGUgPSAxO1xuXG4gICAgLy8gVGhlIGZpcnN0IHJpZ2lkIGJvZHkgb2YgdGhlIGpvaW50LlxuICAgIHRoaXMuYm9keTEgPSBudWxsO1xuICAgIC8vIFRoZSBzZWNvbmQgcmlnaWQgYm9keSBvZiB0aGUgam9pbnQuXG4gICAgdGhpcy5ib2R5MiA9IG51bGw7XG4gICAgLy8gVGhlIGFuY2hvciBwb2ludCBvbiB0aGUgZmlyc3QgcmlnaWQgYm9keSBpbiBsb2NhbCBjb29yZGluYXRlIHN5c3RlbS5cbiAgICB0aGlzLmxvY2FsQW5jaG9yUG9pbnQxID0gbmV3IFZlYzMoKTtcbiAgICAvLyAgVGhlIGFuY2hvciBwb2ludCBvbiB0aGUgc2Vjb25kIHJpZ2lkIGJvZHkgaW4gbG9jYWwgY29vcmRpbmF0ZSBzeXN0ZW0uXG4gICAgdGhpcy5sb2NhbEFuY2hvclBvaW50MiA9IG5ldyBWZWMzKCk7XG4gICAgLy8gVGhlIGF4aXMgaW4gdGhlIGZpcnN0IGJvZHkncyBjb29yZGluYXRlIHN5c3RlbS5cbiAgICAvLyBoaXMgcHJvcGVydHkgaXMgYXZhaWxhYmxlIGluIHNvbWUgam9pbnRzLlxuICAgIHRoaXMubG9jYWxBeGlzMSA9IG5ldyBWZWMzKCk7XG4gICAgLy8gVGhlIGF4aXMgaW4gdGhlIHNlY29uZCBib2R5J3MgY29vcmRpbmF0ZSBzeXN0ZW0uXG4gICAgLy8gVGhpcyBwcm9wZXJ0eSBpcyBhdmFpbGFibGUgaW4gc29tZSBqb2ludHMuXG4gICAgdGhpcy5sb2NhbEF4aXMyID0gbmV3IFZlYzMoKTtcbiAgICAvLyAgV2hldGhlciBhbGxvdyBjb2xsaXNpb24gYmV0d2VlbiBjb25uZWN0ZWQgcmlnaWQgYm9kaWVzIG9yIG5vdC5cbiAgICB0aGlzLmFsbG93Q29sbGlzaW9uID0gZmFsc2U7XG5cbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIGNsYXNzIGhvbGRzIG1hc3MgaW5mb3JtYXRpb24gb2YgYSBzaGFwZS5cbiAgICogQGF1dGhvciBsby10aFxuICAgKiBAYXV0aG9yIHNhaGFyYW5cbiAgICovXG5cbiAgZnVuY3Rpb24gTWFzc0luZm8oKSB7XG5cbiAgICAvLyBNYXNzIG9mIHRoZSBzaGFwZS5cbiAgICB0aGlzLm1hc3MgPSAwO1xuXG4gICAgLy8gVGhlIG1vbWVudCBpbmVydGlhIG9mIHRoZSBzaGFwZS5cbiAgICB0aGlzLmluZXJ0aWEgPSBuZXcgTWF0MzMoKTtcblxuICB9XG5cbiAgLyoqXG4gICogQSBsaW5rIGxpc3Qgb2YgY29udGFjdHMuXG4gICogQGF1dGhvciBzYWhhcmFuXG4gICovXG4gIGZ1bmN0aW9uIENvbnRhY3RMaW5rKGNvbnRhY3QpIHtcblxuICAgIC8vIFRoZSBwcmV2aW91cyBjb250YWN0IGxpbmsuXG4gICAgdGhpcy5wcmV2ID0gbnVsbDtcbiAgICAvLyBUaGUgbmV4dCBjb250YWN0IGxpbmsuXG4gICAgdGhpcy5uZXh0ID0gbnVsbDtcbiAgICAvLyBUaGUgc2hhcGUgb2YgdGhlIGNvbnRhY3QuXG4gICAgdGhpcy5zaGFwZSA9IG51bGw7XG4gICAgLy8gVGhlIG90aGVyIHJpZ2lkIGJvZHkuXG4gICAgdGhpcy5ib2R5ID0gbnVsbDtcbiAgICAvLyBUaGUgY29udGFjdCBvZiB0aGUgbGluay5cbiAgICB0aGlzLmNvbnRhY3QgPSBjb250YWN0O1xuXG4gIH1cblxuICBmdW5jdGlvbiBJbXB1bHNlRGF0YUJ1ZmZlcigpIHtcblxuICAgIHRoaXMubHAxWCA9IE5hTjtcbiAgICB0aGlzLmxwMVkgPSBOYU47XG4gICAgdGhpcy5scDFaID0gTmFOO1xuICAgIHRoaXMubHAyWCA9IE5hTjtcbiAgICB0aGlzLmxwMlkgPSBOYU47XG4gICAgdGhpcy5scDJaID0gTmFOO1xuICAgIHRoaXMuaW1wdWxzZSA9IE5hTjtcblxuICB9XG5cbiAgLyoqXG4gICogVGhlIGNsYXNzIGhvbGRzIGRldGFpbHMgb2YgdGhlIGNvbnRhY3QgcG9pbnQuXG4gICogQGF1dGhvciBzYWhhcmFuXG4gICovXG5cbiAgZnVuY3Rpb24gTWFuaWZvbGRQb2ludCgpIHtcblxuICAgIC8vIFdoZXRoZXIgdGhpcyBtYW5pZm9sZCBwb2ludCBpcyBwZXJzaXN0aW5nIG9yIG5vdC5cbiAgICB0aGlzLndhcm1TdGFydGVkID0gZmFsc2U7XG4gICAgLy8gIFRoZSBwb3NpdGlvbiBvZiB0aGlzIG1hbmlmb2xkIHBvaW50LlxuICAgIHRoaXMucG9zaXRpb24gPSBuZXcgVmVjMygpO1xuICAgIC8vIFRoZSBwb3NpdGlvbiBpbiB0aGUgZmlyc3Qgc2hhcGUncyBjb29yZGluYXRlLlxuICAgIHRoaXMubG9jYWxQb2ludDEgPSBuZXcgVmVjMygpO1xuICAgIC8vICBUaGUgcG9zaXRpb24gaW4gdGhlIHNlY29uZCBzaGFwZSdzIGNvb3JkaW5hdGUuXG4gICAgdGhpcy5sb2NhbFBvaW50MiA9IG5ldyBWZWMzKCk7XG4gICAgLy8gVGhlIG5vcm1hbCB2ZWN0b3Igb2YgdGhpcyBtYW5pZm9sZCBwb2ludC5cbiAgICB0aGlzLm5vcm1hbCA9IG5ldyBWZWMzKCk7XG4gICAgLy8gVGhlIHRhbmdlbnQgdmVjdG9yIG9mIHRoaXMgbWFuaWZvbGQgcG9pbnQuXG4gICAgdGhpcy50YW5nZW50ID0gbmV3IFZlYzMoKTtcbiAgICAvLyBUaGUgYmlub3JtYWwgdmVjdG9yIG9mIHRoaXMgbWFuaWZvbGQgcG9pbnQuXG4gICAgdGhpcy5iaW5vcm1hbCA9IG5ldyBWZWMzKCk7XG4gICAgLy8gVGhlIGltcHVsc2UgaW4gbm9ybWFsIGRpcmVjdGlvbi5cbiAgICB0aGlzLm5vcm1hbEltcHVsc2UgPSAwO1xuICAgIC8vIFRoZSBpbXB1bHNlIGluIHRhbmdlbnQgZGlyZWN0aW9uLlxuICAgIHRoaXMudGFuZ2VudEltcHVsc2UgPSAwO1xuICAgIC8vIFRoZSBpbXB1bHNlIGluIGJpbm9ybWFsIGRpcmVjdGlvbi5cbiAgICB0aGlzLmJpbm9ybWFsSW1wdWxzZSA9IDA7XG4gICAgLy8gVGhlIGRlbm9taW5hdG9yIGluIG5vcm1hbCBkaXJlY3Rpb24uXG4gICAgdGhpcy5ub3JtYWxEZW5vbWluYXRvciA9IDA7XG4gICAgLy8gVGhlIGRlbm9taW5hdG9yIGluIHRhbmdlbnQgZGlyZWN0aW9uLlxuICAgIHRoaXMudGFuZ2VudERlbm9taW5hdG9yID0gMDtcbiAgICAvLyBUaGUgZGVub21pbmF0b3IgaW4gYmlub3JtYWwgZGlyZWN0aW9uLlxuICAgIHRoaXMuYmlub3JtYWxEZW5vbWluYXRvciA9IDA7XG4gICAgLy8gVGhlIGRlcHRoIG9mIHBlbmV0cmF0aW9uLlxuICAgIHRoaXMucGVuZXRyYXRpb24gPSAwO1xuXG4gIH1cblxuICAvKipcbiAgKiBBIGNvbnRhY3QgbWFuaWZvbGQgYmV0d2VlbiB0d28gc2hhcGVzLlxuICAqIEBhdXRob3Igc2FoYXJhblxuICAqIEBhdXRob3IgbG8tdGhcbiAgKi9cblxuICBmdW5jdGlvbiBDb250YWN0TWFuaWZvbGQoKSB7XG5cbiAgICAvLyBUaGUgZmlyc3QgcmlnaWQgYm9keS5cbiAgICB0aGlzLmJvZHkxID0gbnVsbDtcbiAgICAvLyBUaGUgc2Vjb25kIHJpZ2lkIGJvZHkuXG4gICAgdGhpcy5ib2R5MiA9IG51bGw7XG4gICAgLy8gVGhlIG51bWJlciBvZiBtYW5pZm9sZCBwb2ludHMuXG4gICAgdGhpcy5udW1Qb2ludHMgPSAwO1xuICAgIC8vIFRoZSBtYW5pZm9sZCBwb2ludHMuXG4gICAgdGhpcy5wb2ludHMgPSBbXG4gICAgICBuZXcgTWFuaWZvbGRQb2ludCgpLFxuICAgICAgbmV3IE1hbmlmb2xkUG9pbnQoKSxcbiAgICAgIG5ldyBNYW5pZm9sZFBvaW50KCksXG4gICAgICBuZXcgTWFuaWZvbGRQb2ludCgpXG4gICAgXTtcblxuICB9XG5cbiAgQ29udGFjdE1hbmlmb2xkLnByb3RvdHlwZSA9IHtcblxuICAgIGNvbnN0cnVjdG9yOiBDb250YWN0TWFuaWZvbGQsXG5cbiAgICAvL1Jlc2V0IHRoZSBtYW5pZm9sZC5cbiAgICByZXNldDogZnVuY3Rpb24gKHNoYXBlMSwgc2hhcGUyKSB7XG5cbiAgICAgIHRoaXMuYm9keTEgPSBzaGFwZTEucGFyZW50O1xuICAgICAgdGhpcy5ib2R5MiA9IHNoYXBlMi5wYXJlbnQ7XG4gICAgICB0aGlzLm51bVBvaW50cyA9IDA7XG5cbiAgICB9LFxuXG4gICAgLy8gIEFkZCBhIHBvaW50IGludG8gdGhpcyBtYW5pZm9sZC5cbiAgICBhZGRQb2ludFZlYzogZnVuY3Rpb24gKHBvcywgbm9ybSwgcGVuZXRyYXRpb24sIGZsaXApIHtcblxuICAgICAgdmFyIHAgPSB0aGlzLnBvaW50c1t0aGlzLm51bVBvaW50cysrXTtcblxuICAgICAgcC5wb3NpdGlvbi5jb3B5KHBvcyk7XG4gICAgICBwLmxvY2FsUG9pbnQxLnN1Yihwb3MsIHRoaXMuYm9keTEucG9zaXRpb24pLmFwcGx5TWF0cml4Myh0aGlzLmJvZHkxLnJvdGF0aW9uKTtcbiAgICAgIHAubG9jYWxQb2ludDIuc3ViKHBvcywgdGhpcy5ib2R5Mi5wb3NpdGlvbikuYXBwbHlNYXRyaXgzKHRoaXMuYm9keTIucm90YXRpb24pO1xuXG4gICAgICBwLm5vcm1hbC5jb3B5KG5vcm0pO1xuICAgICAgaWYgKGZsaXApIHAubm9ybWFsLm5lZ2F0ZSgpO1xuXG4gICAgICBwLm5vcm1hbEltcHVsc2UgPSAwO1xuICAgICAgcC5wZW5ldHJhdGlvbiA9IHBlbmV0cmF0aW9uO1xuICAgICAgcC53YXJtU3RhcnRlZCA9IGZhbHNlO1xuXG4gICAgfSxcblxuICAgIC8vICBBZGQgYSBwb2ludCBpbnRvIHRoaXMgbWFuaWZvbGQuXG4gICAgYWRkUG9pbnQ6IGZ1bmN0aW9uICh4LCB5LCB6LCBueCwgbnksIG56LCBwZW5ldHJhdGlvbiwgZmxpcCkge1xuXG4gICAgICB2YXIgcCA9IHRoaXMucG9pbnRzW3RoaXMubnVtUG9pbnRzKytdO1xuXG4gICAgICBwLnBvc2l0aW9uLnNldCh4LCB5LCB6KTtcbiAgICAgIHAubG9jYWxQb2ludDEuc3ViKHAucG9zaXRpb24sIHRoaXMuYm9keTEucG9zaXRpb24pLmFwcGx5TWF0cml4Myh0aGlzLmJvZHkxLnJvdGF0aW9uKTtcbiAgICAgIHAubG9jYWxQb2ludDIuc3ViKHAucG9zaXRpb24sIHRoaXMuYm9keTIucG9zaXRpb24pLmFwcGx5TWF0cml4Myh0aGlzLmJvZHkyLnJvdGF0aW9uKTtcblxuICAgICAgcC5ub3JtYWxJbXB1bHNlID0gMDtcblxuICAgICAgcC5ub3JtYWwuc2V0KG54LCBueSwgbnopO1xuICAgICAgaWYgKGZsaXApIHAubm9ybWFsLm5lZ2F0ZSgpO1xuXG4gICAgICBwLnBlbmV0cmF0aW9uID0gcGVuZXRyYXRpb247XG4gICAgICBwLndhcm1TdGFydGVkID0gZmFsc2U7XG5cbiAgICB9XG4gIH07XG5cbiAgZnVuY3Rpb24gQ29udGFjdFBvaW50RGF0YUJ1ZmZlcigpIHtcblxuICAgIHRoaXMubm9yID0gbmV3IFZlYzMoKTtcbiAgICB0aGlzLnRhbiA9IG5ldyBWZWMzKCk7XG4gICAgdGhpcy5iaW4gPSBuZXcgVmVjMygpO1xuXG4gICAgdGhpcy5ub3JVMSA9IG5ldyBWZWMzKCk7XG4gICAgdGhpcy50YW5VMSA9IG5ldyBWZWMzKCk7XG4gICAgdGhpcy5iaW5VMSA9IG5ldyBWZWMzKCk7XG5cbiAgICB0aGlzLm5vclUyID0gbmV3IFZlYzMoKTtcbiAgICB0aGlzLnRhblUyID0gbmV3IFZlYzMoKTtcbiAgICB0aGlzLmJpblUyID0gbmV3IFZlYzMoKTtcblxuICAgIHRoaXMubm9yVDEgPSBuZXcgVmVjMygpO1xuICAgIHRoaXMudGFuVDEgPSBuZXcgVmVjMygpO1xuICAgIHRoaXMuYmluVDEgPSBuZXcgVmVjMygpO1xuXG4gICAgdGhpcy5ub3JUMiA9IG5ldyBWZWMzKCk7XG4gICAgdGhpcy50YW5UMiA9IG5ldyBWZWMzKCk7XG4gICAgdGhpcy5iaW5UMiA9IG5ldyBWZWMzKCk7XG5cbiAgICB0aGlzLm5vclRVMSA9IG5ldyBWZWMzKCk7XG4gICAgdGhpcy50YW5UVTEgPSBuZXcgVmVjMygpO1xuICAgIHRoaXMuYmluVFUxID0gbmV3IFZlYzMoKTtcblxuICAgIHRoaXMubm9yVFUyID0gbmV3IFZlYzMoKTtcbiAgICB0aGlzLnRhblRVMiA9IG5ldyBWZWMzKCk7XG4gICAgdGhpcy5iaW5UVTIgPSBuZXcgVmVjMygpO1xuXG4gICAgdGhpcy5ub3JJbXAgPSAwO1xuICAgIHRoaXMudGFuSW1wID0gMDtcbiAgICB0aGlzLmJpbkltcCA9IDA7XG5cbiAgICB0aGlzLm5vckRlbiA9IDA7XG4gICAgdGhpcy50YW5EZW4gPSAwO1xuICAgIHRoaXMuYmluRGVuID0gMDtcblxuICAgIHRoaXMubm9yVGFyID0gMDtcblxuICAgIHRoaXMubmV4dCA9IG51bGw7XG4gICAgdGhpcy5sYXN0ID0gZmFsc2U7XG5cbiAgfVxuXG4gIC8qKlxuICAqIC4uLlxuICAqIEBhdXRob3Igc2FoYXJhblxuICAqL1xuICBmdW5jdGlvbiBDb250YWN0Q29uc3RyYWludChtYW5pZm9sZCkge1xuXG4gICAgQ29uc3RyYWludC5jYWxsKHRoaXMpO1xuICAgIC8vIFRoZSBjb250YWN0IG1hbmlmb2xkIG9mIHRoZSBjb25zdHJhaW50LlxuICAgIHRoaXMubWFuaWZvbGQgPSBtYW5pZm9sZDtcbiAgICAvLyBUaGUgY29lZmZpY2llbnQgb2YgcmVzdGl0dXRpb24gb2YgdGhlIGNvbnN0cmFpbnQuXG4gICAgdGhpcy5yZXN0aXR1dGlvbiA9IE5hTjtcbiAgICAvLyBUaGUgY29lZmZpY2llbnQgb2YgZnJpY3Rpb24gb2YgdGhlIGNvbnN0cmFpbnQuXG4gICAgdGhpcy5mcmljdGlvbiA9IE5hTjtcbiAgICB0aGlzLnAxID0gbnVsbDtcbiAgICB0aGlzLnAyID0gbnVsbDtcbiAgICB0aGlzLmx2MSA9IG51bGw7XG4gICAgdGhpcy5sdjIgPSBudWxsO1xuICAgIHRoaXMuYXYxID0gbnVsbDtcbiAgICB0aGlzLmF2MiA9IG51bGw7XG4gICAgdGhpcy5pMSA9IG51bGw7XG4gICAgdGhpcy5pMiA9IG51bGw7XG5cbiAgICAvL3RoaXMuaWkxID0gbnVsbDtcbiAgICAvL3RoaXMuaWkyID0gbnVsbDtcblxuICAgIHRoaXMudG1wID0gbmV3IFZlYzMoKTtcbiAgICB0aGlzLnRtcEMxID0gbmV3IFZlYzMoKTtcbiAgICB0aGlzLnRtcEMyID0gbmV3IFZlYzMoKTtcblxuICAgIHRoaXMudG1wUDEgPSBuZXcgVmVjMygpO1xuICAgIHRoaXMudG1wUDIgPSBuZXcgVmVjMygpO1xuXG4gICAgdGhpcy50bXBsdjEgPSBuZXcgVmVjMygpO1xuICAgIHRoaXMudG1wbHYyID0gbmV3IFZlYzMoKTtcbiAgICB0aGlzLnRtcGF2MSA9IG5ldyBWZWMzKCk7XG4gICAgdGhpcy50bXBhdjIgPSBuZXcgVmVjMygpO1xuXG4gICAgdGhpcy5tMSA9IE5hTjtcbiAgICB0aGlzLm0yID0gTmFOO1xuICAgIHRoaXMubnVtID0gMDtcblxuICAgIHRoaXMucHMgPSBtYW5pZm9sZC5wb2ludHM7XG4gICAgdGhpcy5jcyA9IG5ldyBDb250YWN0UG9pbnREYXRhQnVmZmVyKCk7XG4gICAgdGhpcy5jcy5uZXh0ID0gbmV3IENvbnRhY3RQb2ludERhdGFCdWZmZXIoKTtcbiAgICB0aGlzLmNzLm5leHQubmV4dCA9IG5ldyBDb250YWN0UG9pbnREYXRhQnVmZmVyKCk7XG4gICAgdGhpcy5jcy5uZXh0Lm5leHQubmV4dCA9IG5ldyBDb250YWN0UG9pbnREYXRhQnVmZmVyKCk7XG4gIH1cblxuICBDb250YWN0Q29uc3RyYWludC5wcm90b3R5cGUgPSBPYmplY3QuYXNzaWduKE9iamVjdC5jcmVhdGUoQ29uc3RyYWludC5wcm90b3R5cGUpLCB7XG5cbiAgICBjb25zdHJ1Y3RvcjogQ29udGFjdENvbnN0cmFpbnQsXG5cbiAgICAvLyBBdHRhY2ggdGhlIGNvbnN0cmFpbnQgdG8gdGhlIGJvZGllcy5cbiAgICBhdHRhY2g6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgdGhpcy5wMSA9IHRoaXMuYm9keTEucG9zaXRpb247XG4gICAgICB0aGlzLnAyID0gdGhpcy5ib2R5Mi5wb3NpdGlvbjtcbiAgICAgIHRoaXMubHYxID0gdGhpcy5ib2R5MS5saW5lYXJWZWxvY2l0eTtcbiAgICAgIHRoaXMuYXYxID0gdGhpcy5ib2R5MS5hbmd1bGFyVmVsb2NpdHk7XG4gICAgICB0aGlzLmx2MiA9IHRoaXMuYm9keTIubGluZWFyVmVsb2NpdHk7XG4gICAgICB0aGlzLmF2MiA9IHRoaXMuYm9keTIuYW5ndWxhclZlbG9jaXR5O1xuICAgICAgdGhpcy5pMSA9IHRoaXMuYm9keTEuaW52ZXJzZUluZXJ0aWE7XG4gICAgICB0aGlzLmkyID0gdGhpcy5ib2R5Mi5pbnZlcnNlSW5lcnRpYTtcblxuICAgIH0sXG5cbiAgICAvLyBEZXRhY2ggdGhlIGNvbnN0cmFpbnQgZnJvbSB0aGUgYm9kaWVzLlxuICAgIGRldGFjaDogZnVuY3Rpb24gKCkge1xuXG4gICAgICB0aGlzLnAxID0gbnVsbDtcbiAgICAgIHRoaXMucDIgPSBudWxsO1xuICAgICAgdGhpcy5sdjEgPSBudWxsO1xuICAgICAgdGhpcy5sdjIgPSBudWxsO1xuICAgICAgdGhpcy5hdjEgPSBudWxsO1xuICAgICAgdGhpcy5hdjIgPSBudWxsO1xuICAgICAgdGhpcy5pMSA9IG51bGw7XG4gICAgICB0aGlzLmkyID0gbnVsbDtcblxuICAgIH0sXG5cbiAgICBwcmVTb2x2ZTogZnVuY3Rpb24gKHRpbWVTdGVwLCBpbnZUaW1lU3RlcCkge1xuXG4gICAgICB0aGlzLm0xID0gdGhpcy5ib2R5MS5pbnZlcnNlTWFzcztcbiAgICAgIHRoaXMubTIgPSB0aGlzLmJvZHkyLmludmVyc2VNYXNzO1xuXG4gICAgICB2YXIgbTFtMiA9IHRoaXMubTEgKyB0aGlzLm0yO1xuXG4gICAgICB0aGlzLm51bSA9IHRoaXMubWFuaWZvbGQubnVtUG9pbnRzO1xuXG4gICAgICB2YXIgYyA9IHRoaXMuY3M7XG4gICAgICB2YXIgcCwgcnZuLCBsZW4sIG5vckltcCwgbm9yVGFyLCBzZXBWLCBpMSwgaTI7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubnVtOyBpKyspIHtcblxuICAgICAgICBwID0gdGhpcy5wc1tpXTtcblxuICAgICAgICB0aGlzLnRtcFAxLnN1YihwLnBvc2l0aW9uLCB0aGlzLnAxKTtcbiAgICAgICAgdGhpcy50bXBQMi5zdWIocC5wb3NpdGlvbiwgdGhpcy5wMik7XG5cbiAgICAgICAgdGhpcy50bXBDMS5jcm9zc1ZlY3RvcnModGhpcy5hdjEsIHRoaXMudG1wUDEpO1xuICAgICAgICB0aGlzLnRtcEMyLmNyb3NzVmVjdG9ycyh0aGlzLmF2MiwgdGhpcy50bXBQMik7XG5cbiAgICAgICAgYy5ub3JJbXAgPSBwLm5vcm1hbEltcHVsc2U7XG4gICAgICAgIGMudGFuSW1wID0gcC50YW5nZW50SW1wdWxzZTtcbiAgICAgICAgYy5iaW5JbXAgPSBwLmJpbm9ybWFsSW1wdWxzZTtcblxuICAgICAgICBjLm5vci5jb3B5KHAubm9ybWFsKTtcblxuICAgICAgICB0aGlzLnRtcC5zZXQoXG5cbiAgICAgICAgICAodGhpcy5sdjIueCArIHRoaXMudG1wQzIueCkgLSAodGhpcy5sdjEueCArIHRoaXMudG1wQzEueCksXG4gICAgICAgICAgKHRoaXMubHYyLnkgKyB0aGlzLnRtcEMyLnkpIC0gKHRoaXMubHYxLnkgKyB0aGlzLnRtcEMxLnkpLFxuICAgICAgICAgICh0aGlzLmx2Mi56ICsgdGhpcy50bXBDMi56KSAtICh0aGlzLmx2MS56ICsgdGhpcy50bXBDMS56KVxuXG4gICAgICAgICk7XG5cbiAgICAgICAgcnZuID0gX01hdGguZG90VmVjdG9ycyhjLm5vciwgdGhpcy50bXApO1xuXG4gICAgICAgIGMudGFuLnNldChcbiAgICAgICAgICB0aGlzLnRtcC54IC0gcnZuICogYy5ub3IueCxcbiAgICAgICAgICB0aGlzLnRtcC55IC0gcnZuICogYy5ub3IueSxcbiAgICAgICAgICB0aGlzLnRtcC56IC0gcnZuICogYy5ub3IuelxuICAgICAgICApO1xuXG4gICAgICAgIGxlbiA9IF9NYXRoLmRvdFZlY3RvcnMoYy50YW4sIGMudGFuKTtcblxuICAgICAgICBpZiAobGVuIDw9IDAuMDQpIHtcbiAgICAgICAgICBjLnRhbi50YW5nZW50KGMubm9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGMudGFuLm5vcm1hbGl6ZSgpO1xuXG4gICAgICAgIGMuYmluLmNyb3NzVmVjdG9ycyhjLm5vciwgYy50YW4pO1xuXG4gICAgICAgIGMubm9yVTEuc2NhbGUoYy5ub3IsIHRoaXMubTEpO1xuICAgICAgICBjLm5vclUyLnNjYWxlKGMubm9yLCB0aGlzLm0yKTtcblxuICAgICAgICBjLnRhblUxLnNjYWxlKGMudGFuLCB0aGlzLm0xKTtcbiAgICAgICAgYy50YW5VMi5zY2FsZShjLnRhbiwgdGhpcy5tMik7XG5cbiAgICAgICAgYy5iaW5VMS5zY2FsZShjLmJpbiwgdGhpcy5tMSk7XG4gICAgICAgIGMuYmluVTIuc2NhbGUoYy5iaW4sIHRoaXMubTIpO1xuXG4gICAgICAgIGMubm9yVDEuY3Jvc3NWZWN0b3JzKHRoaXMudG1wUDEsIGMubm9yKTtcbiAgICAgICAgYy50YW5UMS5jcm9zc1ZlY3RvcnModGhpcy50bXBQMSwgYy50YW4pO1xuICAgICAgICBjLmJpblQxLmNyb3NzVmVjdG9ycyh0aGlzLnRtcFAxLCBjLmJpbik7XG5cbiAgICAgICAgYy5ub3JUMi5jcm9zc1ZlY3RvcnModGhpcy50bXBQMiwgYy5ub3IpO1xuICAgICAgICBjLnRhblQyLmNyb3NzVmVjdG9ycyh0aGlzLnRtcFAyLCBjLnRhbik7XG4gICAgICAgIGMuYmluVDIuY3Jvc3NWZWN0b3JzKHRoaXMudG1wUDIsIGMuYmluKTtcblxuICAgICAgICBpMSA9IHRoaXMuaTE7XG4gICAgICAgIGkyID0gdGhpcy5pMjtcblxuICAgICAgICBjLm5vclRVMS5jb3B5KGMubm9yVDEpLmFwcGx5TWF0cml4MyhpMSwgdHJ1ZSk7XG4gICAgICAgIGMudGFuVFUxLmNvcHkoYy50YW5UMSkuYXBwbHlNYXRyaXgzKGkxLCB0cnVlKTtcbiAgICAgICAgYy5iaW5UVTEuY29weShjLmJpblQxKS5hcHBseU1hdHJpeDMoaTEsIHRydWUpO1xuXG4gICAgICAgIGMubm9yVFUyLmNvcHkoYy5ub3JUMikuYXBwbHlNYXRyaXgzKGkyLCB0cnVlKTtcbiAgICAgICAgYy50YW5UVTIuY29weShjLnRhblQyKS5hcHBseU1hdHJpeDMoaTIsIHRydWUpO1xuICAgICAgICBjLmJpblRVMi5jb3B5KGMuYmluVDIpLmFwcGx5TWF0cml4MyhpMiwgdHJ1ZSk7XG5cbiAgICAgICAgLypjLm5vclRVMS5tdWxNYXQoIHRoaXMuaTEsIGMubm9yVDEgKTtcbiAgICAgICAgYy50YW5UVTEubXVsTWF0KCB0aGlzLmkxLCBjLnRhblQxICk7XG4gICAgICAgIGMuYmluVFUxLm11bE1hdCggdGhpcy5pMSwgYy5iaW5UMSApO1xuXG4gICAgICAgIGMubm9yVFUyLm11bE1hdCggdGhpcy5pMiwgYy5ub3JUMiApO1xuICAgICAgICBjLnRhblRVMi5tdWxNYXQoIHRoaXMuaTIsIGMudGFuVDIgKTtcbiAgICAgICAgYy5iaW5UVTIubXVsTWF0KCB0aGlzLmkyLCBjLmJpblQyICk7Ki9cblxuICAgICAgICB0aGlzLnRtcEMxLmNyb3NzVmVjdG9ycyhjLm5vclRVMSwgdGhpcy50bXBQMSk7XG4gICAgICAgIHRoaXMudG1wQzIuY3Jvc3NWZWN0b3JzKGMubm9yVFUyLCB0aGlzLnRtcFAyKTtcbiAgICAgICAgdGhpcy50bXAuYWRkKHRoaXMudG1wQzEsIHRoaXMudG1wQzIpO1xuICAgICAgICBjLm5vckRlbiA9IDEgLyAobTFtMiArIF9NYXRoLmRvdFZlY3RvcnMoYy5ub3IsIHRoaXMudG1wKSk7XG5cbiAgICAgICAgdGhpcy50bXBDMS5jcm9zc1ZlY3RvcnMoYy50YW5UVTEsIHRoaXMudG1wUDEpO1xuICAgICAgICB0aGlzLnRtcEMyLmNyb3NzVmVjdG9ycyhjLnRhblRVMiwgdGhpcy50bXBQMik7XG4gICAgICAgIHRoaXMudG1wLmFkZCh0aGlzLnRtcEMxLCB0aGlzLnRtcEMyKTtcbiAgICAgICAgYy50YW5EZW4gPSAxIC8gKG0xbTIgKyBfTWF0aC5kb3RWZWN0b3JzKGMudGFuLCB0aGlzLnRtcCkpO1xuXG4gICAgICAgIHRoaXMudG1wQzEuY3Jvc3NWZWN0b3JzKGMuYmluVFUxLCB0aGlzLnRtcFAxKTtcbiAgICAgICAgdGhpcy50bXBDMi5jcm9zc1ZlY3RvcnMoYy5iaW5UVTIsIHRoaXMudG1wUDIpO1xuICAgICAgICB0aGlzLnRtcC5hZGQodGhpcy50bXBDMSwgdGhpcy50bXBDMik7XG4gICAgICAgIGMuYmluRGVuID0gMSAvIChtMW0yICsgX01hdGguZG90VmVjdG9ycyhjLmJpbiwgdGhpcy50bXApKTtcblxuICAgICAgICBpZiAocC53YXJtU3RhcnRlZCkge1xuXG4gICAgICAgICAgbm9ySW1wID0gcC5ub3JtYWxJbXB1bHNlO1xuXG4gICAgICAgICAgdGhpcy5sdjEuYWRkU2NhbGVkVmVjdG9yKGMubm9yVTEsIG5vckltcCk7XG4gICAgICAgICAgdGhpcy5hdjEuYWRkU2NhbGVkVmVjdG9yKGMubm9yVFUxLCBub3JJbXApO1xuXG4gICAgICAgICAgdGhpcy5sdjIuc3ViU2NhbGVkVmVjdG9yKGMubm9yVTIsIG5vckltcCk7XG4gICAgICAgICAgdGhpcy5hdjIuc3ViU2NhbGVkVmVjdG9yKGMubm9yVFUyLCBub3JJbXApO1xuXG4gICAgICAgICAgYy5ub3JJbXAgPSBub3JJbXA7XG4gICAgICAgICAgYy50YW5JbXAgPSAwO1xuICAgICAgICAgIGMuYmluSW1wID0gMDtcbiAgICAgICAgICBydm4gPSAwOyAvLyBkaXNhYmxlIGJvdW5jaW5nXG5cbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgIGMubm9ySW1wID0gMDtcbiAgICAgICAgICBjLnRhbkltcCA9IDA7XG4gICAgICAgICAgYy5iaW5JbXAgPSAwO1xuXG4gICAgICAgIH1cblxuXG4gICAgICAgIGlmIChydm4gPiAtMSkgcnZuID0gMDsgLy8gZGlzYWJsZSBib3VuY2luZ1xuXG4gICAgICAgIG5vclRhciA9IHRoaXMucmVzdGl0dXRpb24gKiAtcnZuO1xuICAgICAgICBzZXBWID0gLShwLnBlbmV0cmF0aW9uICsgMC4wMDUpICogaW52VGltZVN0ZXAgKiAwLjA1OyAvLyBhbGxvdyAwLjVjbSBlcnJvclxuICAgICAgICBpZiAobm9yVGFyIDwgc2VwVikgbm9yVGFyID0gc2VwVjtcbiAgICAgICAgYy5ub3JUYXIgPSBub3JUYXI7XG4gICAgICAgIGMubGFzdCA9IGkgPT0gdGhpcy5udW0gLSAxO1xuICAgICAgICBjID0gYy5uZXh0O1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBzb2x2ZTogZnVuY3Rpb24gKCkge1xuXG4gICAgICB0aGlzLnRtcGx2MS5jb3B5KHRoaXMubHYxKTtcbiAgICAgIHRoaXMudG1wbHYyLmNvcHkodGhpcy5sdjIpO1xuICAgICAgdGhpcy50bXBhdjEuY29weSh0aGlzLmF2MSk7XG4gICAgICB0aGlzLnRtcGF2Mi5jb3B5KHRoaXMuYXYyKTtcblxuICAgICAgdmFyIG9sZEltcDEsIG5ld0ltcDEsIG9sZEltcDIsIG5ld0ltcDIsIHJ2biwgbm9ySW1wLCB0YW5JbXAsIGJpbkltcCwgbWF4LCBsZW47XG5cbiAgICAgIHZhciBjID0gdGhpcy5jcztcblxuICAgICAgd2hpbGUgKHRydWUpIHtcblxuICAgICAgICBub3JJbXAgPSBjLm5vckltcDtcbiAgICAgICAgdGFuSW1wID0gYy50YW5JbXA7XG4gICAgICAgIGJpbkltcCA9IGMuYmluSW1wO1xuICAgICAgICBtYXggPSAtbm9ySW1wICogdGhpcy5mcmljdGlvbjtcblxuICAgICAgICB0aGlzLnRtcC5zdWIodGhpcy50bXBsdjIsIHRoaXMudG1wbHYxKTtcblxuICAgICAgICBydm4gPSBfTWF0aC5kb3RWZWN0b3JzKHRoaXMudG1wLCBjLnRhbikgKyBfTWF0aC5kb3RWZWN0b3JzKHRoaXMudG1wYXYyLCBjLnRhblQyKSAtIF9NYXRoLmRvdFZlY3RvcnModGhpcy50bXBhdjEsIGMudGFuVDEpO1xuXG4gICAgICAgIG9sZEltcDEgPSB0YW5JbXA7XG4gICAgICAgIG5ld0ltcDEgPSBydm4gKiBjLnRhbkRlbjtcbiAgICAgICAgdGFuSW1wICs9IG5ld0ltcDE7XG5cbiAgICAgICAgcnZuID0gX01hdGguZG90VmVjdG9ycyh0aGlzLnRtcCwgYy5iaW4pICsgX01hdGguZG90VmVjdG9ycyh0aGlzLnRtcGF2MiwgYy5iaW5UMikgLSBfTWF0aC5kb3RWZWN0b3JzKHRoaXMudG1wYXYxLCBjLmJpblQxKTtcblxuICAgICAgICBvbGRJbXAyID0gYmluSW1wO1xuICAgICAgICBuZXdJbXAyID0gcnZuICogYy5iaW5EZW47XG4gICAgICAgIGJpbkltcCArPSBuZXdJbXAyO1xuXG4gICAgICAgIC8vIGNvbmUgZnJpY3Rpb24gY2xhbXBcbiAgICAgICAgbGVuID0gdGFuSW1wICogdGFuSW1wICsgYmluSW1wICogYmluSW1wO1xuICAgICAgICBpZiAobGVuID4gbWF4ICogbWF4KSB7XG4gICAgICAgICAgbGVuID0gbWF4IC8gX01hdGguc3FydChsZW4pO1xuICAgICAgICAgIHRhbkltcCAqPSBsZW47XG4gICAgICAgICAgYmluSW1wICo9IGxlbjtcbiAgICAgICAgfVxuXG4gICAgICAgIG5ld0ltcDEgPSB0YW5JbXAgLSBvbGRJbXAxO1xuICAgICAgICBuZXdJbXAyID0gYmluSW1wIC0gb2xkSW1wMjtcblxuICAgICAgICAvL1xuXG4gICAgICAgIHRoaXMudG1wLnNldChcbiAgICAgICAgICBjLnRhblUxLnggKiBuZXdJbXAxICsgYy5iaW5VMS54ICogbmV3SW1wMixcbiAgICAgICAgICBjLnRhblUxLnkgKiBuZXdJbXAxICsgYy5iaW5VMS55ICogbmV3SW1wMixcbiAgICAgICAgICBjLnRhblUxLnogKiBuZXdJbXAxICsgYy5iaW5VMS56ICogbmV3SW1wMlxuICAgICAgICApO1xuXG4gICAgICAgIHRoaXMudG1wbHYxLmFkZEVxdWFsKHRoaXMudG1wKTtcblxuICAgICAgICB0aGlzLnRtcC5zZXQoXG4gICAgICAgICAgYy50YW5UVTEueCAqIG5ld0ltcDEgKyBjLmJpblRVMS54ICogbmV3SW1wMixcbiAgICAgICAgICBjLnRhblRVMS55ICogbmV3SW1wMSArIGMuYmluVFUxLnkgKiBuZXdJbXAyLFxuICAgICAgICAgIGMudGFuVFUxLnogKiBuZXdJbXAxICsgYy5iaW5UVTEueiAqIG5ld0ltcDJcbiAgICAgICAgKTtcblxuICAgICAgICB0aGlzLnRtcGF2MS5hZGRFcXVhbCh0aGlzLnRtcCk7XG5cbiAgICAgICAgdGhpcy50bXAuc2V0KFxuICAgICAgICAgIGMudGFuVTIueCAqIG5ld0ltcDEgKyBjLmJpblUyLnggKiBuZXdJbXAyLFxuICAgICAgICAgIGMudGFuVTIueSAqIG5ld0ltcDEgKyBjLmJpblUyLnkgKiBuZXdJbXAyLFxuICAgICAgICAgIGMudGFuVTIueiAqIG5ld0ltcDEgKyBjLmJpblUyLnogKiBuZXdJbXAyXG4gICAgICAgICk7XG5cbiAgICAgICAgdGhpcy50bXBsdjIuc3ViRXF1YWwodGhpcy50bXApO1xuXG4gICAgICAgIHRoaXMudG1wLnNldChcbiAgICAgICAgICBjLnRhblRVMi54ICogbmV3SW1wMSArIGMuYmluVFUyLnggKiBuZXdJbXAyLFxuICAgICAgICAgIGMudGFuVFUyLnkgKiBuZXdJbXAxICsgYy5iaW5UVTIueSAqIG5ld0ltcDIsXG4gICAgICAgICAgYy50YW5UVTIueiAqIG5ld0ltcDEgKyBjLmJpblRVMi56ICogbmV3SW1wMlxuICAgICAgICApO1xuXG4gICAgICAgIHRoaXMudG1wYXYyLnN1YkVxdWFsKHRoaXMudG1wKTtcblxuICAgICAgICAvLyByZXN0aXR1dGlvbiBwYXJ0XG5cbiAgICAgICAgdGhpcy50bXAuc3ViKHRoaXMudG1wbHYyLCB0aGlzLnRtcGx2MSk7XG5cbiAgICAgICAgcnZuID0gX01hdGguZG90VmVjdG9ycyh0aGlzLnRtcCwgYy5ub3IpICsgX01hdGguZG90VmVjdG9ycyh0aGlzLnRtcGF2MiwgYy5ub3JUMikgLSBfTWF0aC5kb3RWZWN0b3JzKHRoaXMudG1wYXYxLCBjLm5vclQxKTtcblxuICAgICAgICBvbGRJbXAxID0gbm9ySW1wO1xuICAgICAgICBuZXdJbXAxID0gKHJ2biAtIGMubm9yVGFyKSAqIGMubm9yRGVuO1xuICAgICAgICBub3JJbXAgKz0gbmV3SW1wMTtcbiAgICAgICAgaWYgKG5vckltcCA+IDApIG5vckltcCA9IDA7XG5cbiAgICAgICAgbmV3SW1wMSA9IG5vckltcCAtIG9sZEltcDE7XG5cbiAgICAgICAgdGhpcy50bXBsdjEuYWRkU2NhbGVkVmVjdG9yKGMubm9yVTEsIG5ld0ltcDEpO1xuICAgICAgICB0aGlzLnRtcGF2MS5hZGRTY2FsZWRWZWN0b3IoYy5ub3JUVTEsIG5ld0ltcDEpO1xuICAgICAgICB0aGlzLnRtcGx2Mi5zdWJTY2FsZWRWZWN0b3IoYy5ub3JVMiwgbmV3SW1wMSk7XG4gICAgICAgIHRoaXMudG1wYXYyLnN1YlNjYWxlZFZlY3RvcihjLm5vclRVMiwgbmV3SW1wMSk7XG5cbiAgICAgICAgYy5ub3JJbXAgPSBub3JJbXA7XG4gICAgICAgIGMudGFuSW1wID0gdGFuSW1wO1xuICAgICAgICBjLmJpbkltcCA9IGJpbkltcDtcblxuICAgICAgICBpZiAoYy5sYXN0KSBicmVhaztcbiAgICAgICAgYyA9IGMubmV4dDtcbiAgICAgIH1cblxuICAgICAgdGhpcy5sdjEuY29weSh0aGlzLnRtcGx2MSk7XG4gICAgICB0aGlzLmx2Mi5jb3B5KHRoaXMudG1wbHYyKTtcbiAgICAgIHRoaXMuYXYxLmNvcHkodGhpcy50bXBhdjEpO1xuICAgICAgdGhpcy5hdjIuY29weSh0aGlzLnRtcGF2Mik7XG5cbiAgICB9LFxuXG4gICAgcG9zdFNvbHZlOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHZhciBjID0gdGhpcy5jcywgcDtcbiAgICAgIHZhciBpID0gdGhpcy5udW07XG4gICAgICB3aGlsZSAoaS0tKSB7XG4gICAgICAgIC8vZm9yKHZhciBpPTA7aTx0aGlzLm51bTtpKyspe1xuICAgICAgICBwID0gdGhpcy5wc1tpXTtcbiAgICAgICAgcC5ub3JtYWwuY29weShjLm5vcik7XG4gICAgICAgIHAudGFuZ2VudC5jb3B5KGMudGFuKTtcbiAgICAgICAgcC5iaW5vcm1hbC5jb3B5KGMuYmluKTtcblxuICAgICAgICBwLm5vcm1hbEltcHVsc2UgPSBjLm5vckltcDtcbiAgICAgICAgcC50YW5nZW50SW1wdWxzZSA9IGMudGFuSW1wO1xuICAgICAgICBwLmJpbm9ybWFsSW1wdWxzZSA9IGMuYmluSW1wO1xuICAgICAgICBwLm5vcm1hbERlbm9taW5hdG9yID0gYy5ub3JEZW47XG4gICAgICAgIHAudGFuZ2VudERlbm9taW5hdG9yID0gYy50YW5EZW47XG4gICAgICAgIHAuYmlub3JtYWxEZW5vbWluYXRvciA9IGMuYmluRGVuO1xuICAgICAgICBjID0gYy5uZXh0O1xuICAgICAgfVxuICAgIH1cblxuICB9KTtcblxuICAvKipcbiAgKiBBIGNvbnRhY3QgaXMgYSBwYWlyIG9mIHNoYXBlcyB3aG9zZSBheGlzLWFsaWduZWQgYm91bmRpbmcgYm94ZXMgYXJlIG92ZXJsYXBwaW5nLlxuICAqIEBhdXRob3Igc2FoYXJhblxuICAqL1xuXG4gIGZ1bmN0aW9uIENvbnRhY3QoKSB7XG5cbiAgICAvLyBUaGUgZmlyc3Qgc2hhcGUuXG4gICAgdGhpcy5zaGFwZTEgPSBudWxsO1xuICAgIC8vIFRoZSBzZWNvbmQgc2hhcGUuXG4gICAgdGhpcy5zaGFwZTIgPSBudWxsO1xuICAgIC8vIFRoZSBmaXJzdCByaWdpZCBib2R5LlxuICAgIHRoaXMuYm9keTEgPSBudWxsO1xuICAgIC8vIFRoZSBzZWNvbmQgcmlnaWQgYm9keS5cbiAgICB0aGlzLmJvZHkyID0gbnVsbDtcbiAgICAvLyBUaGUgcHJldmlvdXMgY29udGFjdCBpbiB0aGUgd29ybGQuXG4gICAgdGhpcy5wcmV2ID0gbnVsbDtcbiAgICAvLyBUaGUgbmV4dCBjb250YWN0IGluIHRoZSB3b3JsZC5cbiAgICB0aGlzLm5leHQgPSBudWxsO1xuICAgIC8vIEludGVybmFsXG4gICAgdGhpcy5wZXJzaXN0aW5nID0gZmFsc2U7XG4gICAgLy8gV2hldGhlciBib3RoIHRoZSByaWdpZCBib2RpZXMgYXJlIHNsZWVwaW5nIG9yIG5vdC5cbiAgICB0aGlzLnNsZWVwaW5nID0gZmFsc2U7XG4gICAgLy8gVGhlIGNvbGxpc2lvbiBkZXRlY3RvciBiZXR3ZWVuIHR3byBzaGFwZXMuXG4gICAgdGhpcy5kZXRlY3RvciA9IG51bGw7XG4gICAgLy8gVGhlIGNvbnRhY3QgY29uc3RyYWludCBvZiB0aGUgY29udGFjdC5cbiAgICB0aGlzLmNvbnN0cmFpbnQgPSBudWxsO1xuICAgIC8vIFdoZXRoZXIgdGhlIHNoYXBlcyBhcmUgdG91Y2hpbmcgb3Igbm90LlxuICAgIHRoaXMudG91Y2hpbmcgPSBmYWxzZTtcbiAgICAvLyBzaGFwZXMgaXMgdmVyeSBjbG9zZSBhbmQgdG91Y2hpbmcgXG4gICAgdGhpcy5jbG9zZSA9IGZhbHNlO1xuXG4gICAgdGhpcy5kaXN0ID0gX01hdGguSU5GO1xuXG4gICAgdGhpcy5iMUxpbmsgPSBuZXcgQ29udGFjdExpbmsodGhpcyk7XG4gICAgdGhpcy5iMkxpbmsgPSBuZXcgQ29udGFjdExpbmsodGhpcyk7XG4gICAgdGhpcy5zMUxpbmsgPSBuZXcgQ29udGFjdExpbmsodGhpcyk7XG4gICAgdGhpcy5zMkxpbmsgPSBuZXcgQ29udGFjdExpbmsodGhpcyk7XG5cbiAgICAvLyBUaGUgY29udGFjdCBtYW5pZm9sZCBvZiB0aGUgY29udGFjdC5cbiAgICB0aGlzLm1hbmlmb2xkID0gbmV3IENvbnRhY3RNYW5pZm9sZCgpO1xuXG4gICAgdGhpcy5idWZmZXIgPSBbXG5cbiAgICAgIG5ldyBJbXB1bHNlRGF0YUJ1ZmZlcigpLFxuICAgICAgbmV3IEltcHVsc2VEYXRhQnVmZmVyKCksXG4gICAgICBuZXcgSW1wdWxzZURhdGFCdWZmZXIoKSxcbiAgICAgIG5ldyBJbXB1bHNlRGF0YUJ1ZmZlcigpXG5cbiAgICBdO1xuXG4gICAgdGhpcy5wb2ludHMgPSB0aGlzLm1hbmlmb2xkLnBvaW50cztcbiAgICB0aGlzLmNvbnN0cmFpbnQgPSBuZXcgQ29udGFjdENvbnN0cmFpbnQodGhpcy5tYW5pZm9sZCk7XG5cbiAgfVxuXG4gIE9iamVjdC5hc3NpZ24oQ29udGFjdC5wcm90b3R5cGUsIHtcblxuICAgIENvbnRhY3Q6IHRydWUsXG5cbiAgICBtaXhSZXN0aXR1dGlvbjogZnVuY3Rpb24gKHJlc3RpdHV0aW9uMSwgcmVzdGl0dXRpb24yKSB7XG5cbiAgICAgIHJldHVybiBfTWF0aC5zcXJ0KHJlc3RpdHV0aW9uMSAqIHJlc3RpdHV0aW9uMik7XG5cbiAgICB9LFxuICAgIG1peEZyaWN0aW9uOiBmdW5jdGlvbiAoZnJpY3Rpb24xLCBmcmljdGlvbjIpIHtcblxuICAgICAgcmV0dXJuIF9NYXRoLnNxcnQoZnJpY3Rpb24xICogZnJpY3Rpb24yKTtcblxuICAgIH0sXG5cbiAgICAvKipcbiAgICAqIFVwZGF0ZSB0aGUgY29udGFjdCBtYW5pZm9sZC5cbiAgICAqL1xuICAgIHVwZGF0ZU1hbmlmb2xkOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHRoaXMuY29uc3RyYWludC5yZXN0aXR1dGlvbiA9IHRoaXMubWl4UmVzdGl0dXRpb24odGhpcy5zaGFwZTEucmVzdGl0dXRpb24sIHRoaXMuc2hhcGUyLnJlc3RpdHV0aW9uKTtcbiAgICAgIHRoaXMuY29uc3RyYWludC5mcmljdGlvbiA9IHRoaXMubWl4RnJpY3Rpb24odGhpcy5zaGFwZTEuZnJpY3Rpb24sIHRoaXMuc2hhcGUyLmZyaWN0aW9uKTtcbiAgICAgIHZhciBudW1CdWZmZXJzID0gdGhpcy5tYW5pZm9sZC5udW1Qb2ludHM7XG4gICAgICB2YXIgaSA9IG51bUJ1ZmZlcnM7XG4gICAgICB3aGlsZSAoaS0tKSB7XG4gICAgICAgIC8vZm9yKHZhciBpPTA7aTxudW1CdWZmZXJzO2krKyl7XG4gICAgICAgIHZhciBiID0gdGhpcy5idWZmZXJbaV07XG4gICAgICAgIHZhciBwID0gdGhpcy5wb2ludHNbaV07XG4gICAgICAgIGIubHAxWCA9IHAubG9jYWxQb2ludDEueDtcbiAgICAgICAgYi5scDFZID0gcC5sb2NhbFBvaW50MS55O1xuICAgICAgICBiLmxwMVogPSBwLmxvY2FsUG9pbnQxLno7XG4gICAgICAgIGIubHAyWCA9IHAubG9jYWxQb2ludDIueDtcbiAgICAgICAgYi5scDJZID0gcC5sb2NhbFBvaW50Mi55O1xuICAgICAgICBiLmxwMlogPSBwLmxvY2FsUG9pbnQyLno7XG4gICAgICAgIGIuaW1wdWxzZSA9IHAubm9ybWFsSW1wdWxzZTtcbiAgICAgIH1cbiAgICAgIHRoaXMubWFuaWZvbGQubnVtUG9pbnRzID0gMDtcbiAgICAgIHRoaXMuZGV0ZWN0b3IuZGV0ZWN0Q29sbGlzaW9uKHRoaXMuc2hhcGUxLCB0aGlzLnNoYXBlMiwgdGhpcy5tYW5pZm9sZCk7XG4gICAgICB2YXIgbnVtID0gdGhpcy5tYW5pZm9sZC5udW1Qb2ludHM7XG4gICAgICBpZiAobnVtID09IDApIHtcbiAgICAgICAgdGhpcy50b3VjaGluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLmNsb3NlID0gZmFsc2U7XG4gICAgICAgIHRoaXMuZGlzdCA9IF9NYXRoLklORjtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy50b3VjaGluZyB8fCB0aGlzLmRpc3QgPCAwLjAwMSkgdGhpcy5jbG9zZSA9IHRydWU7XG4gICAgICB0aGlzLnRvdWNoaW5nID0gdHJ1ZTtcbiAgICAgIGkgPSBudW07XG4gICAgICB3aGlsZSAoaS0tKSB7XG4gICAgICAgIC8vZm9yKGk9MDsgaTxudW07IGkrKyl7XG4gICAgICAgIHAgPSB0aGlzLnBvaW50c1tpXTtcbiAgICAgICAgdmFyIGxwMXggPSBwLmxvY2FsUG9pbnQxLng7XG4gICAgICAgIHZhciBscDF5ID0gcC5sb2NhbFBvaW50MS55O1xuICAgICAgICB2YXIgbHAxeiA9IHAubG9jYWxQb2ludDEuejtcbiAgICAgICAgdmFyIGxwMnggPSBwLmxvY2FsUG9pbnQyLng7XG4gICAgICAgIHZhciBscDJ5ID0gcC5sb2NhbFBvaW50Mi55O1xuICAgICAgICB2YXIgbHAyeiA9IHAubG9jYWxQb2ludDIuejtcbiAgICAgICAgdmFyIGluZGV4ID0gLTE7XG4gICAgICAgIHZhciBtaW5EaXN0YW5jZSA9IDAuMDAwNDtcbiAgICAgICAgdmFyIGogPSBudW1CdWZmZXJzO1xuICAgICAgICB3aGlsZSAoai0tKSB7XG4gICAgICAgICAgLy9mb3IodmFyIGo9MDtqPG51bUJ1ZmZlcnM7aisrKXtcbiAgICAgICAgICBiID0gdGhpcy5idWZmZXJbal07XG4gICAgICAgICAgdmFyIGR4ID0gYi5scDFYIC0gbHAxeDtcbiAgICAgICAgICB2YXIgZHkgPSBiLmxwMVkgLSBscDF5O1xuICAgICAgICAgIHZhciBkeiA9IGIubHAxWiAtIGxwMXo7XG4gICAgICAgICAgdmFyIGRpc3RhbmNlMSA9IGR4ICogZHggKyBkeSAqIGR5ICsgZHogKiBkejtcbiAgICAgICAgICBkeCA9IGIubHAyWCAtIGxwMng7XG4gICAgICAgICAgZHkgPSBiLmxwMlkgLSBscDJ5O1xuICAgICAgICAgIGR6ID0gYi5scDJaIC0gbHAyejtcbiAgICAgICAgICB2YXIgZGlzdGFuY2UyID0gZHggKiBkeCArIGR5ICogZHkgKyBkeiAqIGR6O1xuICAgICAgICAgIGlmIChkaXN0YW5jZTEgPCBkaXN0YW5jZTIpIHtcbiAgICAgICAgICAgIGlmIChkaXN0YW5jZTEgPCBtaW5EaXN0YW5jZSkge1xuICAgICAgICAgICAgICBtaW5EaXN0YW5jZSA9IGRpc3RhbmNlMTtcbiAgICAgICAgICAgICAgaW5kZXggPSBqO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoZGlzdGFuY2UyIDwgbWluRGlzdGFuY2UpIHtcbiAgICAgICAgICAgICAgbWluRGlzdGFuY2UgPSBkaXN0YW5jZTI7XG4gICAgICAgICAgICAgIGluZGV4ID0gajtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAobWluRGlzdGFuY2UgPCB0aGlzLmRpc3QpIHRoaXMuZGlzdCA9IG1pbkRpc3RhbmNlO1xuXG4gICAgICAgIH1cbiAgICAgICAgaWYgKGluZGV4ICE9IC0xKSB7XG4gICAgICAgICAgdmFyIHRtcCA9IHRoaXMuYnVmZmVyW2luZGV4XTtcbiAgICAgICAgICB0aGlzLmJ1ZmZlcltpbmRleF0gPSB0aGlzLmJ1ZmZlclstLW51bUJ1ZmZlcnNdO1xuICAgICAgICAgIHRoaXMuYnVmZmVyW251bUJ1ZmZlcnNdID0gdG1wO1xuICAgICAgICAgIHAubm9ybWFsSW1wdWxzZSA9IHRtcC5pbXB1bHNlO1xuICAgICAgICAgIHAud2FybVN0YXJ0ZWQgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHAubm9ybWFsSW1wdWxzZSA9IDA7XG4gICAgICAgICAgcC53YXJtU3RhcnRlZCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICAvKipcbiAgICAqIEF0dGFjaCB0aGUgY29udGFjdCB0byB0aGUgc2hhcGVzLlxuICAgICogQHBhcmFtICAgc2hhcGUxXG4gICAgKiBAcGFyYW0gICBzaGFwZTJcbiAgICAqL1xuICAgIGF0dGFjaDogZnVuY3Rpb24gKHNoYXBlMSwgc2hhcGUyKSB7XG4gICAgICB0aGlzLnNoYXBlMSA9IHNoYXBlMTtcbiAgICAgIHRoaXMuc2hhcGUyID0gc2hhcGUyO1xuICAgICAgdGhpcy5ib2R5MSA9IHNoYXBlMS5wYXJlbnQ7XG4gICAgICB0aGlzLmJvZHkyID0gc2hhcGUyLnBhcmVudDtcblxuICAgICAgdGhpcy5tYW5pZm9sZC5ib2R5MSA9IHRoaXMuYm9keTE7XG4gICAgICB0aGlzLm1hbmlmb2xkLmJvZHkyID0gdGhpcy5ib2R5MjtcbiAgICAgIHRoaXMuY29uc3RyYWludC5ib2R5MSA9IHRoaXMuYm9keTE7XG4gICAgICB0aGlzLmNvbnN0cmFpbnQuYm9keTIgPSB0aGlzLmJvZHkyO1xuICAgICAgdGhpcy5jb25zdHJhaW50LmF0dGFjaCgpO1xuXG4gICAgICB0aGlzLnMxTGluay5zaGFwZSA9IHNoYXBlMjtcbiAgICAgIHRoaXMuczFMaW5rLmJvZHkgPSB0aGlzLmJvZHkyO1xuICAgICAgdGhpcy5zMkxpbmsuc2hhcGUgPSBzaGFwZTE7XG4gICAgICB0aGlzLnMyTGluay5ib2R5ID0gdGhpcy5ib2R5MTtcblxuICAgICAgaWYgKHNoYXBlMS5jb250YWN0TGluayAhPSBudWxsKSAodGhpcy5zMUxpbmsubmV4dCA9IHNoYXBlMS5jb250YWN0TGluaykucHJldiA9IHRoaXMuczFMaW5rO1xuICAgICAgZWxzZSB0aGlzLnMxTGluay5uZXh0ID0gbnVsbDtcbiAgICAgIHNoYXBlMS5jb250YWN0TGluayA9IHRoaXMuczFMaW5rO1xuICAgICAgc2hhcGUxLm51bUNvbnRhY3RzKys7XG5cbiAgICAgIGlmIChzaGFwZTIuY29udGFjdExpbmsgIT0gbnVsbCkgKHRoaXMuczJMaW5rLm5leHQgPSBzaGFwZTIuY29udGFjdExpbmspLnByZXYgPSB0aGlzLnMyTGluaztcbiAgICAgIGVsc2UgdGhpcy5zMkxpbmsubmV4dCA9IG51bGw7XG4gICAgICBzaGFwZTIuY29udGFjdExpbmsgPSB0aGlzLnMyTGluaztcbiAgICAgIHNoYXBlMi5udW1Db250YWN0cysrO1xuXG4gICAgICB0aGlzLmIxTGluay5zaGFwZSA9IHNoYXBlMjtcbiAgICAgIHRoaXMuYjFMaW5rLmJvZHkgPSB0aGlzLmJvZHkyO1xuICAgICAgdGhpcy5iMkxpbmsuc2hhcGUgPSBzaGFwZTE7XG4gICAgICB0aGlzLmIyTGluay5ib2R5ID0gdGhpcy5ib2R5MTtcblxuICAgICAgaWYgKHRoaXMuYm9keTEuY29udGFjdExpbmsgIT0gbnVsbCkgKHRoaXMuYjFMaW5rLm5leHQgPSB0aGlzLmJvZHkxLmNvbnRhY3RMaW5rKS5wcmV2ID0gdGhpcy5iMUxpbms7XG4gICAgICBlbHNlIHRoaXMuYjFMaW5rLm5leHQgPSBudWxsO1xuICAgICAgdGhpcy5ib2R5MS5jb250YWN0TGluayA9IHRoaXMuYjFMaW5rO1xuICAgICAgdGhpcy5ib2R5MS5udW1Db250YWN0cysrO1xuXG4gICAgICBpZiAodGhpcy5ib2R5Mi5jb250YWN0TGluayAhPSBudWxsKSAodGhpcy5iMkxpbmsubmV4dCA9IHRoaXMuYm9keTIuY29udGFjdExpbmspLnByZXYgPSB0aGlzLmIyTGluaztcbiAgICAgIGVsc2UgdGhpcy5iMkxpbmsubmV4dCA9IG51bGw7XG4gICAgICB0aGlzLmJvZHkyLmNvbnRhY3RMaW5rID0gdGhpcy5iMkxpbms7XG4gICAgICB0aGlzLmJvZHkyLm51bUNvbnRhY3RzKys7XG5cbiAgICAgIHRoaXMucHJldiA9IG51bGw7XG4gICAgICB0aGlzLm5leHQgPSBudWxsO1xuXG4gICAgICB0aGlzLnBlcnNpc3RpbmcgPSB0cnVlO1xuICAgICAgdGhpcy5zbGVlcGluZyA9IHRoaXMuYm9keTEuc2xlZXBpbmcgJiYgdGhpcy5ib2R5Mi5zbGVlcGluZztcbiAgICAgIHRoaXMubWFuaWZvbGQubnVtUG9pbnRzID0gMDtcbiAgICB9LFxuICAgIC8qKlxuICAgICogRGV0YWNoIHRoZSBjb250YWN0IGZyb20gdGhlIHNoYXBlcy5cbiAgICAqL1xuICAgIGRldGFjaDogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIHByZXYgPSB0aGlzLnMxTGluay5wcmV2O1xuICAgICAgdmFyIG5leHQgPSB0aGlzLnMxTGluay5uZXh0O1xuICAgICAgaWYgKHByZXYgIT09IG51bGwpIHByZXYubmV4dCA9IG5leHQ7XG4gICAgICBpZiAobmV4dCAhPT0gbnVsbCkgbmV4dC5wcmV2ID0gcHJldjtcbiAgICAgIGlmICh0aGlzLnNoYXBlMS5jb250YWN0TGluayA9PSB0aGlzLnMxTGluaykgdGhpcy5zaGFwZTEuY29udGFjdExpbmsgPSBuZXh0O1xuICAgICAgdGhpcy5zMUxpbmsucHJldiA9IG51bGw7XG4gICAgICB0aGlzLnMxTGluay5uZXh0ID0gbnVsbDtcbiAgICAgIHRoaXMuczFMaW5rLnNoYXBlID0gbnVsbDtcbiAgICAgIHRoaXMuczFMaW5rLmJvZHkgPSBudWxsO1xuICAgICAgdGhpcy5zaGFwZTEubnVtQ29udGFjdHMtLTtcblxuICAgICAgcHJldiA9IHRoaXMuczJMaW5rLnByZXY7XG4gICAgICBuZXh0ID0gdGhpcy5zMkxpbmsubmV4dDtcbiAgICAgIGlmIChwcmV2ICE9PSBudWxsKSBwcmV2Lm5leHQgPSBuZXh0O1xuICAgICAgaWYgKG5leHQgIT09IG51bGwpIG5leHQucHJldiA9IHByZXY7XG4gICAgICBpZiAodGhpcy5zaGFwZTIuY29udGFjdExpbmsgPT0gdGhpcy5zMkxpbmspIHRoaXMuc2hhcGUyLmNvbnRhY3RMaW5rID0gbmV4dDtcbiAgICAgIHRoaXMuczJMaW5rLnByZXYgPSBudWxsO1xuICAgICAgdGhpcy5zMkxpbmsubmV4dCA9IG51bGw7XG4gICAgICB0aGlzLnMyTGluay5zaGFwZSA9IG51bGw7XG4gICAgICB0aGlzLnMyTGluay5ib2R5ID0gbnVsbDtcbiAgICAgIHRoaXMuc2hhcGUyLm51bUNvbnRhY3RzLS07XG5cbiAgICAgIHByZXYgPSB0aGlzLmIxTGluay5wcmV2O1xuICAgICAgbmV4dCA9IHRoaXMuYjFMaW5rLm5leHQ7XG4gICAgICBpZiAocHJldiAhPT0gbnVsbCkgcHJldi5uZXh0ID0gbmV4dDtcbiAgICAgIGlmIChuZXh0ICE9PSBudWxsKSBuZXh0LnByZXYgPSBwcmV2O1xuICAgICAgaWYgKHRoaXMuYm9keTEuY29udGFjdExpbmsgPT0gdGhpcy5iMUxpbmspIHRoaXMuYm9keTEuY29udGFjdExpbmsgPSBuZXh0O1xuICAgICAgdGhpcy5iMUxpbmsucHJldiA9IG51bGw7XG4gICAgICB0aGlzLmIxTGluay5uZXh0ID0gbnVsbDtcbiAgICAgIHRoaXMuYjFMaW5rLnNoYXBlID0gbnVsbDtcbiAgICAgIHRoaXMuYjFMaW5rLmJvZHkgPSBudWxsO1xuICAgICAgdGhpcy5ib2R5MS5udW1Db250YWN0cy0tO1xuXG4gICAgICBwcmV2ID0gdGhpcy5iMkxpbmsucHJldjtcbiAgICAgIG5leHQgPSB0aGlzLmIyTGluay5uZXh0O1xuICAgICAgaWYgKHByZXYgIT09IG51bGwpIHByZXYubmV4dCA9IG5leHQ7XG4gICAgICBpZiAobmV4dCAhPT0gbnVsbCkgbmV4dC5wcmV2ID0gcHJldjtcbiAgICAgIGlmICh0aGlzLmJvZHkyLmNvbnRhY3RMaW5rID09IHRoaXMuYjJMaW5rKSB0aGlzLmJvZHkyLmNvbnRhY3RMaW5rID0gbmV4dDtcbiAgICAgIHRoaXMuYjJMaW5rLnByZXYgPSBudWxsO1xuICAgICAgdGhpcy5iMkxpbmsubmV4dCA9IG51bGw7XG4gICAgICB0aGlzLmIyTGluay5zaGFwZSA9IG51bGw7XG4gICAgICB0aGlzLmIyTGluay5ib2R5ID0gbnVsbDtcbiAgICAgIHRoaXMuYm9keTIubnVtQ29udGFjdHMtLTtcblxuICAgICAgdGhpcy5tYW5pZm9sZC5ib2R5MSA9IG51bGw7XG4gICAgICB0aGlzLm1hbmlmb2xkLmJvZHkyID0gbnVsbDtcbiAgICAgIHRoaXMuY29uc3RyYWludC5ib2R5MSA9IG51bGw7XG4gICAgICB0aGlzLmNvbnN0cmFpbnQuYm9keTIgPSBudWxsO1xuICAgICAgdGhpcy5jb25zdHJhaW50LmRldGFjaCgpO1xuXG4gICAgICB0aGlzLnNoYXBlMSA9IG51bGw7XG4gICAgICB0aGlzLnNoYXBlMiA9IG51bGw7XG4gICAgICB0aGlzLmJvZHkxID0gbnVsbDtcbiAgICAgIHRoaXMuYm9keTIgPSBudWxsO1xuICAgIH1cblxuICB9KTtcblxuICAvKipcbiAgKiBUaGUgY2xhc3Mgb2YgcmlnaWQgYm9keS5cbiAgKiBSaWdpZCBib2R5IGhhcyB0aGUgc2hhcGUgb2YgYSBzaW5nbGUgb3IgbXVsdGlwbGUgY29sbGlzaW9uIHByb2Nlc3NpbmcsXG4gICogSSBjYW4gc2V0IHRoZSBwYXJhbWV0ZXJzIGluZGl2aWR1YWxseS5cbiAgKiBAYXV0aG9yIHNhaGFyYW5cbiAgKiBAYXV0aG9yIGxvLXRoXG4gICovXG5cbiAgZnVuY3Rpb24gUmlnaWRCb2R5KFBvc2l0aW9uLCBSb3RhdGlvbikge1xuXG4gICAgdGhpcy5wb3NpdGlvbiA9IFBvc2l0aW9uIHx8IG5ldyBWZWMzKCk7XG4gICAgdGhpcy5vcmllbnRhdGlvbiA9IFJvdGF0aW9uIHx8IG5ldyBRdWF0KCk7XG5cbiAgICB0aGlzLnNjYWxlID0gMTtcbiAgICB0aGlzLmludlNjYWxlID0gMTtcblxuICAgIC8vIHBvc3NpYmxlIGxpbmsgdG8gdGhyZWUgTWVzaDtcbiAgICB0aGlzLm1lc2ggPSBudWxsO1xuXG4gICAgdGhpcy5pZCA9IE5hTjtcbiAgICB0aGlzLm5hbWUgPSBcIlwiO1xuICAgIC8vIFRoZSBtYXhpbXVtIG51bWJlciBvZiBzaGFwZXMgdGhhdCBjYW4gYmUgYWRkZWQgdG8gYSBvbmUgcmlnaWQuXG4gICAgLy90aGlzLk1BWF9TSEFQRVMgPSA2NDsvLzY0O1xuXG4gICAgdGhpcy5wcmV2ID0gbnVsbDtcbiAgICB0aGlzLm5leHQgPSBudWxsO1xuXG4gICAgLy8gSSByZXByZXNlbnQgdGhlIGtpbmQgb2YgcmlnaWQgYm9keS5cbiAgICAvLyBQbGVhc2UgZG8gbm90IGNoYW5nZSBmcm9tIHRoZSBvdXRzaWRlIHRoaXMgdmFyaWFibGUuXG4gICAgLy8gSWYgeW91IHdhbnQgdG8gY2hhbmdlIHRoZSB0eXBlIG9mIHJpZ2lkIGJvZHksIGFsd2F5c1xuICAgIC8vIFBsZWFzZSBzcGVjaWZ5IHRoZSB0eXBlIHlvdSB3YW50IHRvIHNldCB0aGUgYXJndW1lbnRzIG9mIHNldHVwTWFzcyBtZXRob2QuXG4gICAgdGhpcy50eXBlID0gQk9EWV9OVUxMO1xuXG4gICAgdGhpcy5tYXNzSW5mbyA9IG5ldyBNYXNzSW5mbygpO1xuXG4gICAgdGhpcy5uZXdQb3NpdGlvbiA9IG5ldyBWZWMzKCk7XG4gICAgdGhpcy5jb250cm9sUG9zID0gZmFsc2U7XG4gICAgdGhpcy5uZXdPcmllbnRhdGlvbiA9IG5ldyBRdWF0KCk7XG4gICAgdGhpcy5uZXdSb3RhdGlvbiA9IG5ldyBWZWMzKCk7XG4gICAgdGhpcy5jdXJyZW50Um90YXRpb24gPSBuZXcgVmVjMygpO1xuICAgIHRoaXMuY29udHJvbFJvdCA9IGZhbHNlO1xuICAgIHRoaXMuY29udHJvbFJvdEluVGltZSA9IGZhbHNlO1xuXG4gICAgdGhpcy5xdWF0ZXJuaW9uID0gbmV3IFF1YXQoKTtcbiAgICB0aGlzLnBvcyA9IG5ldyBWZWMzKCk7XG5cblxuXG4gICAgLy8gSXMgdGhlIHRyYW5zbGF0aW9uYWwgdmVsb2NpdHkuXG4gICAgdGhpcy5saW5lYXJWZWxvY2l0eSA9IG5ldyBWZWMzKCk7XG4gICAgLy8gSXMgdGhlIGFuZ3VsYXIgdmVsb2NpdHkuXG4gICAgdGhpcy5hbmd1bGFyVmVsb2NpdHkgPSBuZXcgVmVjMygpO1xuXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIC8vICBQbGVhc2UgZG8gbm90IGNoYW5nZSBmcm9tIHRoZSBvdXRzaWRlIHRoaXMgdmFyaWFibGVzLlxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAgIC8vIEl0IGlzIGEgd29ybGQgdGhhdCByaWdpZCBib2R5IGhhcyBiZWVuIGFkZGVkLlxuICAgIHRoaXMucGFyZW50ID0gbnVsbDtcbiAgICB0aGlzLmNvbnRhY3RMaW5rID0gbnVsbDtcbiAgICB0aGlzLm51bUNvbnRhY3RzID0gMDtcblxuICAgIC8vIEFuIGFycmF5IG9mIHNoYXBlcyB0aGF0IGFyZSBpbmNsdWRlZCBpbiB0aGUgcmlnaWQgYm9keS5cbiAgICB0aGlzLnNoYXBlcyA9IG51bGw7XG4gICAgLy8gVGhlIG51bWJlciBvZiBzaGFwZXMgdGhhdCBhcmUgaW5jbHVkZWQgaW4gdGhlIHJpZ2lkIGJvZHkuXG4gICAgdGhpcy5udW1TaGFwZXMgPSAwO1xuXG4gICAgLy8gSXQgaXMgdGhlIGxpbmsgYXJyYXkgb2Ygam9pbnQgdGhhdCBpcyBjb25uZWN0ZWQgdG8gdGhlIHJpZ2lkIGJvZHkuXG4gICAgdGhpcy5qb2ludExpbmsgPSBudWxsO1xuICAgIC8vIFRoZSBudW1iZXIgb2Ygam9pbnRzIHRoYXQgYXJlIGNvbm5lY3RlZCB0byB0aGUgcmlnaWQgYm9keS5cbiAgICB0aGlzLm51bUpvaW50cyA9IDA7XG5cbiAgICAvLyBJdCBpcyB0aGUgd29ybGQgY29vcmRpbmF0ZSBvZiB0aGUgY2VudGVyIG9mIGdyYXZpdHkgaW4gdGhlIHNsZWVwIGp1c3QgYmVmb3JlLlxuICAgIHRoaXMuc2xlZXBQb3NpdGlvbiA9IG5ldyBWZWMzKCk7XG4gICAgLy8gSXQgaXMgYSBxdWF0ZXJuaW9uIHRoYXQgcmVwcmVzZW50cyB0aGUgYXR0aXR1ZGUgb2Ygc2xlZXAganVzdCBiZWZvcmUuXG4gICAgdGhpcy5zbGVlcE9yaWVudGF0aW9uID0gbmV3IFF1YXQoKTtcbiAgICAvLyBJIHdpbGwgc2hvdyB0aGlzIHJpZ2lkIGJvZHkgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgaXQgaXMgYSByaWdpZCBib2R5IHN0YXRpYy5cbiAgICB0aGlzLmlzU3RhdGljID0gZmFsc2U7XG4gICAgLy8gSSBpbmRpY2F0ZXMgdGhhdCB0aGlzIHJpZ2lkIGJvZHkgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgaXQgaXMgYSByaWdpZCBib2R5IGR5bmFtaWMuXG4gICAgdGhpcy5pc0R5bmFtaWMgPSBmYWxzZTtcblxuICAgIHRoaXMuaXNLaW5lbWF0aWMgPSBmYWxzZTtcblxuICAgIC8vIEl0IGlzIGEgcm90YXRpb24gbWF0cml4IHJlcHJlc2VudGluZyB0aGUgb3JpZW50YXRpb24uXG4gICAgdGhpcy5yb3RhdGlvbiA9IG5ldyBNYXQzMygpO1xuXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIC8vIEl0IHdpbGwgYmUgcmVjYWxjdWxhdGVkIGF1dG9tYXRpY2FsbHkgZnJvbSB0aGUgc2hhcGUsIHdoaWNoIGlzIGluY2x1ZGVkLlxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAgIC8vIFRoaXMgaXMgdGhlIHdlaWdodC5cbiAgICB0aGlzLm1hc3MgPSAwO1xuICAgIC8vIEl0IGlzIHRoZSByZWNpcHJvY2FsIG9mIHRoZSBtYXNzLlxuICAgIHRoaXMuaW52ZXJzZU1hc3MgPSAwO1xuICAgIC8vIEl0IGlzIHRoZSBpbnZlcnNlIG9mIHRoZSBpbmVydGlhIHRlbnNvciBpbiB0aGUgd29ybGQgc3lzdGVtLlxuICAgIHRoaXMuaW52ZXJzZUluZXJ0aWEgPSBuZXcgTWF0MzMoKTtcbiAgICAvLyBJdCBpcyB0aGUgaW5lcnRpYSB0ZW5zb3IgaW4gdGhlIGluaXRpYWwgc3RhdGUuXG4gICAgdGhpcy5sb2NhbEluZXJ0aWEgPSBuZXcgTWF0MzMoKTtcbiAgICAvLyBJdCBpcyB0aGUgaW52ZXJzZSBvZiB0aGUgaW5lcnRpYSB0ZW5zb3IgaW4gdGhlIGluaXRpYWwgc3RhdGUuXG4gICAgdGhpcy5pbnZlcnNlTG9jYWxJbmVydGlhID0gbmV3IE1hdDMzKCk7XG5cbiAgICB0aGlzLnRtcEluZXJ0aWEgPSBuZXcgTWF0MzMoKTtcblxuXG4gICAgLy8gSSBpbmRpY2F0ZXMgcmlnaWQgYm9keSB3aGV0aGVyIGl0IGhhcyBiZWVuIGFkZGVkIHRvIHRoZSBzaW11bGF0aW9uIElzbGFuZC5cbiAgICB0aGlzLmFkZGVkVG9Jc2xhbmQgPSBmYWxzZTtcbiAgICAvLyBJdCBzaG93cyBob3cgdG8gc2xlZXAgcmlnaWQgYm9keS5cbiAgICB0aGlzLmFsbG93U2xlZXAgPSB0cnVlO1xuICAgIC8vIFRoaXMgaXMgdGhlIHRpbWUgZnJvbSB3aGVuIHRoZSByaWdpZCBib2R5IGF0IHJlc3QuXG4gICAgdGhpcy5zbGVlcFRpbWUgPSAwO1xuICAgIC8vIEkgc2hvd3MgcmlnaWQgYm9keSB0byBkZXRlcm1pbmUgd2hldGhlciBpdCBpcyBhIHNsZWVwIHN0YXRlLlxuICAgIHRoaXMuc2xlZXBpbmcgPSBmYWxzZTtcblxuICB9XG5cbiAgT2JqZWN0LmFzc2lnbihSaWdpZEJvZHkucHJvdG90eXBlLCB7XG5cbiAgICBzZXRQYXJlbnQ6IGZ1bmN0aW9uICh3b3JsZCkge1xuXG4gICAgICB0aGlzLnBhcmVudCA9IHdvcmxkO1xuICAgICAgdGhpcy5zY2FsZSA9IHRoaXMucGFyZW50LnNjYWxlO1xuICAgICAgdGhpcy5pbnZTY2FsZSA9IHRoaXMucGFyZW50LmludlNjYWxlO1xuICAgICAgdGhpcy5pZCA9IHRoaXMucGFyZW50Lm51bVJpZ2lkQm9kaWVzO1xuICAgICAgaWYgKCF0aGlzLm5hbWUpIHRoaXMubmFtZSA9IHRoaXMuaWQ7XG5cbiAgICAgIHRoaXMudXBkYXRlTWVzaCgpO1xuXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEknbGwgYWRkIGEgc2hhcGUgdG8gcmlnaWQgYm9keS5cbiAgICAgKiBJZiB5b3UgYWRkIGEgc2hhcGUsIHBsZWFzZSBjYWxsIHRoZSBzZXR1cE1hc3MgbWV0aG9kIHRvIHN0ZXAgdXAgdG8gdGhlIHN0YXJ0IG9mIHRoZSBuZXh0LlxuICAgICAqIEBwYXJhbSAgIHNoYXBlIHNoYXBlIHRvIEFkZFxuICAgICAqL1xuICAgIGFkZFNoYXBlOiBmdW5jdGlvbiAoc2hhcGUpIHtcblxuICAgICAgaWYgKHNoYXBlLnBhcmVudCkge1xuICAgICAgICBwcmludEVycm9yKFwiUmlnaWRCb2R5XCIsIFwiSXQgaXMgbm90IHBvc3NpYmxlIHRoYXQgeW91IGFkZCBhIHNoYXBlIHdoaWNoIGFscmVhZHkgaGFzIGFuIGFzc29jaWF0ZWQgYm9keS5cIik7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLnNoYXBlcyAhPSBudWxsKSAodGhpcy5zaGFwZXMucHJldiA9IHNoYXBlKS5uZXh0ID0gdGhpcy5zaGFwZXM7XG4gICAgICB0aGlzLnNoYXBlcyA9IHNoYXBlO1xuICAgICAgc2hhcGUucGFyZW50ID0gdGhpcztcbiAgICAgIGlmICh0aGlzLnBhcmVudCkgdGhpcy5wYXJlbnQuYWRkU2hhcGUoc2hhcGUpO1xuICAgICAgdGhpcy5udW1TaGFwZXMrKztcblxuICAgIH0sXG4gICAgLyoqXG4gICAgICogSSB3aWxsIGRlbGV0ZSB0aGUgc2hhcGUgZnJvbSB0aGUgcmlnaWQgYm9keS5cbiAgICAgKiBJZiB5b3UgZGVsZXRlIGEgc2hhcGUsIHBsZWFzZSBjYWxsIHRoZSBzZXR1cE1hc3MgbWV0aG9kIHRvIHN0ZXAgdXAgdG8gdGhlIHN0YXJ0IG9mIHRoZSBuZXh0LlxuICAgICAqIEBwYXJhbSBzaGFwZSB7U2hhcGV9IHRvIGRlbGV0ZVxuICAgICAqIEByZXR1cm4gdm9pZFxuICAgICAqL1xuICAgIHJlbW92ZVNoYXBlOiBmdW5jdGlvbiAoc2hhcGUpIHtcblxuICAgICAgdmFyIHJlbW92ZSA9IHNoYXBlO1xuICAgICAgaWYgKHJlbW92ZS5wYXJlbnQgIT0gdGhpcykgcmV0dXJuO1xuICAgICAgdmFyIHByZXYgPSByZW1vdmUucHJldjtcbiAgICAgIHZhciBuZXh0ID0gcmVtb3ZlLm5leHQ7XG4gICAgICBpZiAocHJldiAhPSBudWxsKSBwcmV2Lm5leHQgPSBuZXh0O1xuICAgICAgaWYgKG5leHQgIT0gbnVsbCkgbmV4dC5wcmV2ID0gcHJldjtcbiAgICAgIGlmICh0aGlzLnNoYXBlcyA9PSByZW1vdmUpIHRoaXMuc2hhcGVzID0gbmV4dDtcbiAgICAgIHJlbW92ZS5wcmV2ID0gbnVsbDtcbiAgICAgIHJlbW92ZS5uZXh0ID0gbnVsbDtcbiAgICAgIHJlbW92ZS5wYXJlbnQgPSBudWxsO1xuICAgICAgaWYgKHRoaXMucGFyZW50KSB0aGlzLnBhcmVudC5yZW1vdmVTaGFwZShyZW1vdmUpO1xuICAgICAgdGhpcy5udW1TaGFwZXMtLTtcblxuICAgIH0sXG5cbiAgICByZW1vdmU6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgdGhpcy5kaXNwb3NlKCk7XG5cbiAgICB9LFxuXG4gICAgZGlzcG9zZTogZnVuY3Rpb24gKCkge1xuXG4gICAgICB0aGlzLnBhcmVudC5yZW1vdmVSaWdpZEJvZHkodGhpcyk7XG5cbiAgICB9LFxuXG4gICAgY2hlY2tDb250YWN0OiBmdW5jdGlvbiAobmFtZSkge1xuXG4gICAgICB0aGlzLnBhcmVudC5jaGVja0NvbnRhY3QodGhpcy5uYW1lLCBuYW1lKTtcblxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDYWx1bGF0ZXMgbWFzcyBkYXRhcyhjZW50ZXIgb2YgZ3Jhdml0eSwgbWFzcywgbW9tZW50IGluZXJ0aWEsIGV0Yy4uLikuXG4gICAgICogSWYgdGhlIHBhcmFtZXRlciB0eXBlIGlzIHNldCB0byBCT0RZX1NUQVRJQywgdGhlIHJpZ2lkIGJvZHkgd2lsbCBiZSBmaXhlZCB0byB0aGUgc3BhY2UuXG4gICAgICogSWYgdGhlIHBhcmFtZXRlciBhZGp1c3RQb3NpdGlvbiBpcyBzZXQgdG8gdHJ1ZSwgdGhlIHNoYXBlcycgcmVsYXRpdmUgcG9zaXRpb25zIGFuZFxuICAgICAqIHRoZSByaWdpZCBib2R5J3MgcG9zaXRpb24gd2lsbCBiZSBhZGp1c3RlZCB0byB0aGUgY2VudGVyIG9mIGdyYXZpdHkuXG4gICAgICogQHBhcmFtIHR5cGVcbiAgICAgKiBAcGFyYW0gYWRqdXN0UG9zaXRpb25cbiAgICAgKiBAcmV0dXJuIHZvaWRcbiAgICAgKi9cbiAgICBzZXR1cE1hc3M6IGZ1bmN0aW9uICh0eXBlLCBBZGp1c3RQb3NpdGlvbikge1xuXG4gICAgICB2YXIgYWRqdXN0UG9zaXRpb24gPSAoQWRqdXN0UG9zaXRpb24gIT09IHVuZGVmaW5lZCkgPyBBZGp1c3RQb3NpdGlvbiA6IHRydWU7XG5cbiAgICAgIHRoaXMudHlwZSA9IHR5cGUgfHwgQk9EWV9TVEFUSUM7XG4gICAgICB0aGlzLmlzRHluYW1pYyA9IHRoaXMudHlwZSA9PT0gQk9EWV9EWU5BTUlDO1xuICAgICAgdGhpcy5pc1N0YXRpYyA9IHRoaXMudHlwZSA9PT0gQk9EWV9TVEFUSUM7XG5cbiAgICAgIHRoaXMubWFzcyA9IDA7XG4gICAgICB0aGlzLmxvY2FsSW5lcnRpYS5zZXQoMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCk7XG5cblxuICAgICAgdmFyIHRtcE0gPSBuZXcgTWF0MzMoKTtcbiAgICAgIHZhciB0bXBWID0gbmV3IFZlYzMoKTtcblxuICAgICAgZm9yICh2YXIgc2hhcGUgPSB0aGlzLnNoYXBlczsgc2hhcGUgIT09IG51bGw7IHNoYXBlID0gc2hhcGUubmV4dCkge1xuXG4gICAgICAgIHNoYXBlLmNhbGN1bGF0ZU1hc3NJbmZvKHRoaXMubWFzc0luZm8pO1xuICAgICAgICB2YXIgc2hhcGVNYXNzID0gdGhpcy5tYXNzSW5mby5tYXNzO1xuICAgICAgICB0bXBWLmFkZFNjYWxlZFZlY3RvcihzaGFwZS5yZWxhdGl2ZVBvc2l0aW9uLCBzaGFwZU1hc3MpO1xuICAgICAgICB0aGlzLm1hc3MgKz0gc2hhcGVNYXNzO1xuICAgICAgICB0aGlzLnJvdGF0ZUluZXJ0aWEoc2hhcGUucmVsYXRpdmVSb3RhdGlvbiwgdGhpcy5tYXNzSW5mby5pbmVydGlhLCB0bXBNKTtcbiAgICAgICAgdGhpcy5sb2NhbEluZXJ0aWEuYWRkKHRtcE0pO1xuXG4gICAgICAgIC8vIGFkZCBvZmZzZXQgaW5lcnRpYVxuICAgICAgICB0aGlzLmxvY2FsSW5lcnRpYS5hZGRPZmZzZXQoc2hhcGVNYXNzLCBzaGFwZS5yZWxhdGl2ZVBvc2l0aW9uKTtcblxuICAgICAgfVxuXG4gICAgICB0aGlzLmludmVyc2VNYXNzID0gMSAvIHRoaXMubWFzcztcbiAgICAgIHRtcFYuc2NhbGVFcXVhbCh0aGlzLmludmVyc2VNYXNzKTtcblxuICAgICAgaWYgKGFkanVzdFBvc2l0aW9uKSB7XG4gICAgICAgIHRoaXMucG9zaXRpb24uYWRkKHRtcFYpO1xuICAgICAgICBmb3IgKHNoYXBlID0gdGhpcy5zaGFwZXM7IHNoYXBlICE9PSBudWxsOyBzaGFwZSA9IHNoYXBlLm5leHQpIHtcbiAgICAgICAgICBzaGFwZS5yZWxhdGl2ZVBvc2l0aW9uLnN1YkVxdWFsKHRtcFYpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gc3VidHJhY3Qgb2Zmc2V0IGluZXJ0aWFcbiAgICAgICAgdGhpcy5sb2NhbEluZXJ0aWEuc3ViT2Zmc2V0KHRoaXMubWFzcywgdG1wVik7XG5cbiAgICAgIH1cblxuICAgICAgdGhpcy5pbnZlcnNlTG9jYWxJbmVydGlhLmludmVydCh0aGlzLmxvY2FsSW5lcnRpYSk7XG5cbiAgICAgIC8vfVxuXG4gICAgICBpZiAodGhpcy50eXBlID09PSBCT0RZX1NUQVRJQykge1xuICAgICAgICB0aGlzLmludmVyc2VNYXNzID0gMDtcbiAgICAgICAgdGhpcy5pbnZlcnNlTG9jYWxJbmVydGlhLnNldCgwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5zeW5jU2hhcGVzKCk7XG4gICAgICB0aGlzLmF3YWtlKCk7XG5cbiAgICB9LFxuICAgIC8qKlxuICAgICAqIEF3YWtlIHRoZSByaWdpZCBib2R5LlxuICAgICAqL1xuICAgIGF3YWtlOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIGlmICghdGhpcy5hbGxvd1NsZWVwIHx8ICF0aGlzLnNsZWVwaW5nKSByZXR1cm47XG4gICAgICB0aGlzLnNsZWVwaW5nID0gZmFsc2U7XG4gICAgICB0aGlzLnNsZWVwVGltZSA9IDA7XG4gICAgICAvLyBhd2FrZSBjb25uZWN0ZWQgY29uc3RyYWludHNcbiAgICAgIHZhciBjcyA9IHRoaXMuY29udGFjdExpbms7XG4gICAgICB3aGlsZSAoY3MgIT0gbnVsbCkge1xuICAgICAgICBjcy5ib2R5LnNsZWVwVGltZSA9IDA7XG4gICAgICAgIGNzLmJvZHkuc2xlZXBpbmcgPSBmYWxzZTtcbiAgICAgICAgY3MgPSBjcy5uZXh0O1xuICAgICAgfVxuICAgICAgdmFyIGpzID0gdGhpcy5qb2ludExpbms7XG4gICAgICB3aGlsZSAoanMgIT0gbnVsbCkge1xuICAgICAgICBqcy5ib2R5LnNsZWVwVGltZSA9IDA7XG4gICAgICAgIGpzLmJvZHkuc2xlZXBpbmcgPSBmYWxzZTtcbiAgICAgICAganMgPSBqcy5uZXh0O1xuICAgICAgfVxuICAgICAgZm9yICh2YXIgc2hhcGUgPSB0aGlzLnNoYXBlczsgc2hhcGUgIT0gbnVsbDsgc2hhcGUgPSBzaGFwZS5uZXh0KSB7XG4gICAgICAgIHNoYXBlLnVwZGF0ZVByb3h5KCk7XG4gICAgICB9XG5cbiAgICB9LFxuICAgIC8qKlxuICAgICAqIFNsZWVwIHRoZSByaWdpZCBib2R5LlxuICAgICAqL1xuICAgIHNsZWVwOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIGlmICghdGhpcy5hbGxvd1NsZWVwIHx8IHRoaXMuc2xlZXBpbmcpIHJldHVybjtcblxuICAgICAgdGhpcy5saW5lYXJWZWxvY2l0eS5zZXQoMCwgMCwgMCk7XG4gICAgICB0aGlzLmFuZ3VsYXJWZWxvY2l0eS5zZXQoMCwgMCwgMCk7XG4gICAgICB0aGlzLnNsZWVwUG9zaXRpb24uY29weSh0aGlzLnBvc2l0aW9uKTtcbiAgICAgIHRoaXMuc2xlZXBPcmllbnRhdGlvbi5jb3B5KHRoaXMub3JpZW50YXRpb24pO1xuXG4gICAgICB0aGlzLnNsZWVwVGltZSA9IDA7XG4gICAgICB0aGlzLnNsZWVwaW5nID0gdHJ1ZTtcbiAgICAgIGZvciAodmFyIHNoYXBlID0gdGhpcy5zaGFwZXM7IHNoYXBlICE9IG51bGw7IHNoYXBlID0gc2hhcGUubmV4dCkge1xuICAgICAgICBzaGFwZS51cGRhdGVQcm94eSgpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICB0ZXN0V2FrZVVwOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIGlmICh0aGlzLmxpbmVhclZlbG9jaXR5LnRlc3RaZXJvKCkgfHwgdGhpcy5hbmd1bGFyVmVsb2NpdHkudGVzdFplcm8oKSB8fCB0aGlzLnBvc2l0aW9uLnRlc3REaWZmKHRoaXMuc2xlZXBQb3NpdGlvbikgfHwgdGhpcy5vcmllbnRhdGlvbi50ZXN0RGlmZih0aGlzLnNsZWVwT3JpZW50YXRpb24pKSB0aGlzLmF3YWtlKCk7IC8vIGF3YWtlIHRoZSBib2R5XG5cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHdoZXRoZXIgdGhlIHJpZ2lkIGJvZHkgaGFzIG5vdCBhbnkgY29ubmVjdGlvbiB3aXRoIG90aGVycy5cbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIGlzTG9uZWx5OiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gdGhpcy5udW1Kb2ludHMgPT0gMCAmJiB0aGlzLm51bUNvbnRhY3RzID09IDA7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRoZSB0aW1lIGludGVncmF0aW9uIG9mIHRoZSBtb3Rpb24gb2YgYSByaWdpZCBib2R5LCB5b3UgY2FuIHVwZGF0ZSB0aGUgaW5mb3JtYXRpb24gc3VjaCBhcyB0aGUgc2hhcGUuXG4gICAgICogVGhpcyBtZXRob2QgaXMgaW52b2tlZCBhdXRvbWF0aWNhbGx5IHdoZW4gY2FsbGluZyB0aGUgc3RlcCBvZiB0aGUgV29ybGQsXG4gICAgICogVGhlcmUgaXMgbm8gbmVlZCB0byBjYWxsIGZyb20gb3V0c2lkZSB1c3VhbGx5LlxuICAgICAqIEBwYXJhbSAgdGltZVN0ZXAgdGltZVxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG5cbiAgICB1cGRhdGVQb3NpdGlvbjogZnVuY3Rpb24gKHRpbWVTdGVwKSB7XG4gICAgICBzd2l0Y2ggKHRoaXMudHlwZSkge1xuICAgICAgICBjYXNlIEJPRFlfU1RBVElDOlxuICAgICAgICAgIHRoaXMubGluZWFyVmVsb2NpdHkuc2V0KDAsIDAsIDApO1xuICAgICAgICAgIHRoaXMuYW5ndWxhclZlbG9jaXR5LnNldCgwLCAwLCAwKTtcblxuICAgICAgICAgIC8vIE9OTFkgRk9SIFRFU1RcbiAgICAgICAgICBpZiAodGhpcy5jb250cm9sUG9zKSB7XG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uLmNvcHkodGhpcy5uZXdQb3NpdGlvbik7XG4gICAgICAgICAgICB0aGlzLmNvbnRyb2xQb3MgPSBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHRoaXMuY29udHJvbFJvdCkge1xuICAgICAgICAgICAgdGhpcy5vcmllbnRhdGlvbi5jb3B5KHRoaXMubmV3T3JpZW50YXRpb24pO1xuICAgICAgICAgICAgdGhpcy5jb250cm9sUm90ID0gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8qdGhpcy5saW5lYXJWZWxvY2l0eS54PTA7XG4gICAgICAgICAgdGhpcy5saW5lYXJWZWxvY2l0eS55PTA7XG4gICAgICAgICAgdGhpcy5saW5lYXJWZWxvY2l0eS56PTA7XG4gICAgICAgICAgdGhpcy5hbmd1bGFyVmVsb2NpdHkueD0wO1xuICAgICAgICAgIHRoaXMuYW5ndWxhclZlbG9jaXR5Lnk9MDtcbiAgICAgICAgICB0aGlzLmFuZ3VsYXJWZWxvY2l0eS56PTA7Ki9cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBCT0RZX0RZTkFNSUM6XG5cbiAgICAgICAgICBpZiAodGhpcy5pc0tpbmVtYXRpYykge1xuXG4gICAgICAgICAgICB0aGlzLmxpbmVhclZlbG9jaXR5LnNldCgwLCAwLCAwKTtcbiAgICAgICAgICAgIHRoaXMuYW5ndWxhclZlbG9jaXR5LnNldCgwLCAwLCAwKTtcblxuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICh0aGlzLmNvbnRyb2xQb3MpIHtcblxuICAgICAgICAgICAgdGhpcy5saW5lYXJWZWxvY2l0eS5zdWJWZWN0b3JzKHRoaXMubmV3UG9zaXRpb24sIHRoaXMucG9zaXRpb24pLm11bHRpcGx5U2NhbGFyKDEgLyB0aW1lU3RlcCk7XG4gICAgICAgICAgICB0aGlzLmNvbnRyb2xQb3MgPSBmYWxzZTtcblxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAodGhpcy5jb250cm9sUm90KSB7XG5cbiAgICAgICAgICAgIHRoaXMuYW5ndWxhclZlbG9jaXR5LmNvcHkodGhpcy5nZXRBeGlzKCkpO1xuICAgICAgICAgICAgdGhpcy5vcmllbnRhdGlvbi5jb3B5KHRoaXMubmV3T3JpZW50YXRpb24pO1xuICAgICAgICAgICAgdGhpcy5jb250cm9sUm90ID0gZmFsc2U7XG5cbiAgICAgICAgICB9XG5cbiAgICAgICAgICB0aGlzLnBvc2l0aW9uLmFkZFNjYWxlZFZlY3Rvcih0aGlzLmxpbmVhclZlbG9jaXR5LCB0aW1lU3RlcCk7XG4gICAgICAgICAgdGhpcy5vcmllbnRhdGlvbi5hZGRUaW1lKHRoaXMuYW5ndWxhclZlbG9jaXR5LCB0aW1lU3RlcCk7XG5cbiAgICAgICAgICB0aGlzLnVwZGF0ZU1lc2goKTtcblxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OiBwcmludEVycm9yKFwiUmlnaWRCb2R5XCIsIFwiSW52YWxpZCB0eXBlLlwiKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5zeW5jU2hhcGVzKCk7XG4gICAgICB0aGlzLnVwZGF0ZU1lc2goKTtcblxuICAgIH0sXG5cbiAgICBnZXRBeGlzOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHJldHVybiBuZXcgVmVjMygwLCAxLCAwKS5hcHBseU1hdHJpeDModGhpcy5pbnZlcnNlTG9jYWxJbmVydGlhLCB0cnVlKS5ub3JtYWxpemUoKTtcblxuICAgIH0sXG5cbiAgICByb3RhdGVJbmVydGlhOiBmdW5jdGlvbiAocm90LCBpbmVydGlhLCBvdXQpIHtcblxuICAgICAgdGhpcy50bXBJbmVydGlhLm11bHRpcGx5TWF0cmljZXMocm90LCBpbmVydGlhKTtcbiAgICAgIG91dC5tdWx0aXBseU1hdHJpY2VzKHRoaXMudG1wSW5lcnRpYSwgcm90LCB0cnVlKTtcblxuICAgIH0sXG5cbiAgICBzeW5jU2hhcGVzOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHRoaXMucm90YXRpb24uc2V0UXVhdCh0aGlzLm9yaWVudGF0aW9uKTtcbiAgICAgIHRoaXMucm90YXRlSW5lcnRpYSh0aGlzLnJvdGF0aW9uLCB0aGlzLmludmVyc2VMb2NhbEluZXJ0aWEsIHRoaXMuaW52ZXJzZUluZXJ0aWEpO1xuXG4gICAgICBmb3IgKHZhciBzaGFwZSA9IHRoaXMuc2hhcGVzOyBzaGFwZSAhPSBudWxsOyBzaGFwZSA9IHNoYXBlLm5leHQpIHtcblxuICAgICAgICBzaGFwZS5wb3NpdGlvbi5jb3B5KHNoYXBlLnJlbGF0aXZlUG9zaXRpb24pLmFwcGx5TWF0cml4Myh0aGlzLnJvdGF0aW9uLCB0cnVlKS5hZGQodGhpcy5wb3NpdGlvbik7XG4gICAgICAgIC8vIGFkZCBieSBRdWF6aUtiXG4gICAgICAgIHNoYXBlLnJvdGF0aW9uLm11bHRpcGx5TWF0cmljZXModGhpcy5yb3RhdGlvbiwgc2hhcGUucmVsYXRpdmVSb3RhdGlvbik7XG4gICAgICAgIHNoYXBlLnVwZGF0ZVByb3h5KCk7XG4gICAgICB9XG4gICAgfSxcblxuXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAvLyBBUFBMWSBJTVBVTFNFIEZPUkNFXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAgIGFwcGx5SW1wdWxzZTogZnVuY3Rpb24gKHBvc2l0aW9uLCBmb3JjZSkge1xuICAgICAgdGhpcy5saW5lYXJWZWxvY2l0eS5hZGRTY2FsZWRWZWN0b3IoZm9yY2UsIHRoaXMuaW52ZXJzZU1hc3MpO1xuICAgICAgdmFyIHJlbCA9IG5ldyBWZWMzKCkuY29weShwb3NpdGlvbikuc3ViKHRoaXMucG9zaXRpb24pLmNyb3NzKGZvcmNlKS5hcHBseU1hdHJpeDModGhpcy5pbnZlcnNlSW5lcnRpYSwgdHJ1ZSk7XG4gICAgICB0aGlzLmFuZ3VsYXJWZWxvY2l0eS5hZGQocmVsKTtcbiAgICB9LFxuXG5cbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIC8vIFNFVCBEWU5BTUlRVUUgUE9TSVRJT04gQU5EIFJPVEFUSU9OXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAgIHNldFBvc2l0aW9uOiBmdW5jdGlvbiAocG9zKSB7XG4gICAgICB0aGlzLm5ld1Bvc2l0aW9uLmNvcHkocG9zKS5tdWx0aXBseVNjYWxhcih0aGlzLmludlNjYWxlKTtcbiAgICAgIHRoaXMuY29udHJvbFBvcyA9IHRydWU7XG4gICAgICBpZiAoIXRoaXMuaXNLaW5lbWF0aWMpIHRoaXMuaXNLaW5lbWF0aWMgPSB0cnVlO1xuICAgIH0sXG5cbiAgICBzZXRRdWF0ZXJuaW9uOiBmdW5jdGlvbiAocSkge1xuICAgICAgdGhpcy5uZXdPcmllbnRhdGlvbi5zZXQocS54LCBxLnksIHEueiwgcS53KTtcbiAgICAgIHRoaXMuY29udHJvbFJvdCA9IHRydWU7XG4gICAgICBpZiAoIXRoaXMuaXNLaW5lbWF0aWMpIHRoaXMuaXNLaW5lbWF0aWMgPSB0cnVlO1xuICAgIH0sXG5cbiAgICBzZXRSb3RhdGlvbjogZnVuY3Rpb24gKHJvdCkge1xuXG4gICAgICB0aGlzLm5ld09yaWVudGF0aW9uID0gbmV3IFF1YXQoKS5zZXRGcm9tRXVsZXIocm90LnggKiBfTWF0aC5kZWd0b3JhZCwgcm90LnkgKiBfTWF0aC5kZWd0b3JhZCwgcm90LnogKiBfTWF0aC5kZWd0b3JhZCk7Ly90aGlzLnJvdGF0aW9uVmVjdFRvUXVhZCggcm90ICk7XG4gICAgICB0aGlzLmNvbnRyb2xSb3QgPSB0cnVlO1xuXG4gICAgfSxcblxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gUkVTRVQgRFlOQU1JUVVFIFBPU0lUSU9OIEFORCBST1RBVElPTlxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgICByZXNldFBvc2l0aW9uOiBmdW5jdGlvbiAoeCwgeSwgeikge1xuXG4gICAgICB0aGlzLmxpbmVhclZlbG9jaXR5LnNldCgwLCAwLCAwKTtcbiAgICAgIHRoaXMuYW5ndWxhclZlbG9jaXR5LnNldCgwLCAwLCAwKTtcbiAgICAgIHRoaXMucG9zaXRpb24uc2V0KHgsIHksIHopLm11bHRpcGx5U2NhbGFyKHRoaXMuaW52U2NhbGUpO1xuICAgICAgLy90aGlzLnBvc2l0aW9uLnNldCggeCpPSU1PLldvcmxkU2NhbGUuaW52U2NhbGUsIHkqT0lNTy5Xb3JsZFNjYWxlLmludlNjYWxlLCB6Kk9JTU8uV29ybGRTY2FsZS5pbnZTY2FsZSApO1xuICAgICAgdGhpcy5hd2FrZSgpO1xuICAgIH0sXG5cbiAgICByZXNldFF1YXRlcm5pb246IGZ1bmN0aW9uIChxKSB7XG5cbiAgICAgIHRoaXMuYW5ndWxhclZlbG9jaXR5LnNldCgwLCAwLCAwKTtcbiAgICAgIHRoaXMub3JpZW50YXRpb24gPSBuZXcgUXVhdChxLngsIHEueSwgcS56LCBxLncpO1xuICAgICAgdGhpcy5hd2FrZSgpO1xuXG4gICAgfSxcblxuICAgIHJlc2V0Um90YXRpb246IGZ1bmN0aW9uICh4LCB5LCB6KSB7XG5cbiAgICAgIHRoaXMuYW5ndWxhclZlbG9jaXR5LnNldCgwLCAwLCAwKTtcbiAgICAgIHRoaXMub3JpZW50YXRpb24gPSBuZXcgUXVhdCgpLnNldEZyb21FdWxlcih4ICogX01hdGguZGVndG9yYWQsIHkgKiBfTWF0aC5kZWd0b3JhZCwgeiAqIF9NYXRoLmRlZ3RvcmFkKTsvL3RoaXMucm90YXRpb25WZWN0VG9RdWFkKCBuZXcgVmVjMyh4LHkseikgKTtcbiAgICAgIHRoaXMuYXdha2UoKTtcblxuICAgIH0sXG5cbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIC8vIEdFVCBQT1NJVElPTiBBTkQgUk9UQVRJT05cbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICAgZ2V0UG9zaXRpb246IGZ1bmN0aW9uICgpIHtcblxuICAgICAgcmV0dXJuIHRoaXMucG9zO1xuXG4gICAgfSxcblxuICAgIGdldFF1YXRlcm5pb246IGZ1bmN0aW9uICgpIHtcblxuICAgICAgcmV0dXJuIHRoaXMucXVhdGVybmlvbjtcblxuICAgIH0sXG5cbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIC8vIEFVVE8gVVBEQVRFIFRIUkVFIE1FU0hcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICAgY29ubmVjdE1lc2g6IGZ1bmN0aW9uIChtZXNoKSB7XG5cbiAgICAgIHRoaXMubWVzaCA9IG1lc2g7XG4gICAgICB0aGlzLnVwZGF0ZU1lc2goKTtcblxuICAgIH0sXG5cbiAgICB1cGRhdGVNZXNoOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHRoaXMucG9zLnNjYWxlKHRoaXMucG9zaXRpb24sIHRoaXMuc2NhbGUpO1xuICAgICAgdGhpcy5xdWF0ZXJuaW9uLmNvcHkodGhpcy5vcmllbnRhdGlvbik7XG5cbiAgICAgIGlmICh0aGlzLm1lc2ggPT09IG51bGwpIHJldHVybjtcblxuICAgICAgdGhpcy5tZXNoLnBvc2l0aW9uLmNvcHkodGhpcy5nZXRQb3NpdGlvbigpKTtcbiAgICAgIHRoaXMubWVzaC5xdWF0ZXJuaW9uLmNvcHkodGhpcy5nZXRRdWF0ZXJuaW9uKCkpO1xuXG4gICAgfSxcblxuICB9KTtcblxuICAvKipcbiAgKiBBIHBhaXIgb2Ygc2hhcGVzIHRoYXQgbWF5IGNvbGxpZGUuXG4gICogQGF1dGhvciBzYWhhcmFuXG4gICovXG4gIGZ1bmN0aW9uIFBhaXIoczEsIHMyKSB7XG5cbiAgICAvLyBUaGUgZmlyc3Qgc2hhcGUuXG4gICAgdGhpcy5zaGFwZTEgPSBzMSB8fCBudWxsO1xuICAgIC8vIFRoZSBzZWNvbmQgc2hhcGUuXG4gICAgdGhpcy5zaGFwZTIgPSBzMiB8fCBudWxsO1xuXG4gIH1cblxuICAvKipcbiAgKiBUaGUgYnJvYWQtcGhhc2UgaXMgdXNlZCBmb3IgY29sbGVjdGluZyBhbGwgcG9zc2libGUgcGFpcnMgZm9yIGNvbGxpc2lvbi5cbiAgKi9cblxuICBmdW5jdGlvbiBCcm9hZFBoYXNlKCkge1xuXG4gICAgdGhpcy50eXBlcyA9IEJSX05VTEw7XG4gICAgdGhpcy5udW1QYWlyQ2hlY2tzID0gMDtcbiAgICB0aGlzLm51bVBhaXJzID0gMDtcbiAgICB0aGlzLnBhaXJzID0gW107XG5cbiAgfVxuICBPYmplY3QuYXNzaWduKEJyb2FkUGhhc2UucHJvdG90eXBlLCB7XG5cbiAgICBCcm9hZFBoYXNlOiB0cnVlLFxuXG4gICAgLy8gQ3JlYXRlIGEgbmV3IHByb3h5LlxuICAgIGNyZWF0ZVByb3h5OiBmdW5jdGlvbiAoc2hhcGUpIHtcblxuICAgICAgcHJpbnRFcnJvcihcIkJyb2FkUGhhc2VcIiwgXCJJbmhlcml0YW5jZSBlcnJvci5cIik7XG5cbiAgICB9LFxuXG4gICAgLy8gQWRkIHRoZSBwcm94eSBpbnRvIHRoZSBicm9hZC1waGFzZS5cbiAgICBhZGRQcm94eTogZnVuY3Rpb24gKHByb3h5KSB7XG5cbiAgICAgIHByaW50RXJyb3IoXCJCcm9hZFBoYXNlXCIsIFwiSW5oZXJpdGFuY2UgZXJyb3IuXCIpO1xuICAgIH0sXG5cbiAgICAvLyBSZW1vdmUgdGhlIHByb3h5IGZyb20gdGhlIGJyb2FkLXBoYXNlLlxuICAgIHJlbW92ZVByb3h5OiBmdW5jdGlvbiAocHJveHkpIHtcblxuICAgICAgcHJpbnRFcnJvcihcIkJyb2FkUGhhc2VcIiwgXCJJbmhlcml0YW5jZSBlcnJvci5cIik7XG5cbiAgICB9LFxuXG4gICAgLy8gUmV0dXJucyB3aGV0aGVyIHRoZSBwYWlyIGlzIGF2YWlsYWJsZSBvciBub3QuXG4gICAgaXNBdmFpbGFibGVQYWlyOiBmdW5jdGlvbiAoczEsIHMyKSB7XG5cbiAgICAgIHZhciBiMSA9IHMxLnBhcmVudDtcbiAgICAgIHZhciBiMiA9IHMyLnBhcmVudDtcbiAgICAgIGlmIChiMSA9PSBiMiB8fCAvLyBzYW1lIHBhcmVudHNcbiAgICAgICAgKCFiMS5pc0R5bmFtaWMgJiYgIWIyLmlzRHluYW1pYykgfHwgLy8gc3RhdGljIG9yIGtpbmVtYXRpYyBvYmplY3RcbiAgICAgICAgKHMxLmJlbG9uZ3NUbyAmIHMyLmNvbGxpZGVzV2l0aCkgPT0gMCB8fFxuICAgICAgICAoczIuYmVsb25nc1RvICYgczEuY29sbGlkZXNXaXRoKSA9PSAwIC8vIGNvbGxpc2lvbiBmaWx0ZXJpbmdcbiAgICAgICkgeyByZXR1cm4gZmFsc2U7IH1cbiAgICAgIHZhciBqcztcbiAgICAgIGlmIChiMS5udW1Kb2ludHMgPCBiMi5udW1Kb2ludHMpIGpzID0gYjEuam9pbnRMaW5rO1xuICAgICAgZWxzZSBqcyA9IGIyLmpvaW50TGluaztcbiAgICAgIHdoaWxlIChqcyAhPT0gbnVsbCkge1xuICAgICAgICB2YXIgam9pbnQgPSBqcy5qb2ludDtcbiAgICAgICAgaWYgKCFqb2ludC5hbGxvd0NvbGxpc2lvbiAmJiAoKGpvaW50LmJvZHkxID09IGIxICYmIGpvaW50LmJvZHkyID09IGIyKSB8fCAoam9pbnQuYm9keTEgPT0gYjIgJiYgam9pbnQuYm9keTIgPT0gYjEpKSkgeyByZXR1cm4gZmFsc2U7IH1cbiAgICAgICAganMgPSBqcy5uZXh0O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdHJ1ZTtcblxuICAgIH0sXG5cbiAgICAvLyBEZXRlY3Qgb3ZlcmxhcHBpbmcgcGFpcnMuXG4gICAgZGV0ZWN0UGFpcnM6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgLy8gY2xlYXIgb2xkXG4gICAgICB0aGlzLnBhaXJzID0gW107XG4gICAgICB0aGlzLm51bVBhaXJzID0gMDtcbiAgICAgIHRoaXMubnVtUGFpckNoZWNrcyA9IDA7XG4gICAgICB0aGlzLmNvbGxlY3RQYWlycygpO1xuXG4gICAgfSxcblxuICAgIGNvbGxlY3RQYWlyczogZnVuY3Rpb24gKCkge1xuXG4gICAgfSxcblxuICAgIGFkZFBhaXI6IGZ1bmN0aW9uIChzMSwgczIpIHtcblxuICAgICAgdmFyIHBhaXIgPSBuZXcgUGFpcihzMSwgczIpO1xuICAgICAgdGhpcy5wYWlycy5wdXNoKHBhaXIpO1xuICAgICAgdGhpcy5udW1QYWlycysrO1xuXG4gICAgfVxuXG4gIH0pO1xuXG4gIHZhciBjb3VudCQxID0gMDtcbiAgZnVuY3Rpb24gUHJveHlJZENvdW50KCkgeyByZXR1cm4gY291bnQkMSsrOyB9XG5cbiAgLyoqXG4gICAqIEEgcHJveHkgaXMgdXNlZCBmb3IgYnJvYWQtcGhhc2UgY29sbGVjdGluZyBwYWlycyB0aGF0IGNhbiBiZSBjb2xsaWRpbmcuXG4gICAqXG4gICAqIEBhdXRob3IgbG8tdGhcbiAgICovXG5cbiAgZnVuY3Rpb24gUHJveHkoc2hhcGUpIHtcblxuICAgIC8vVGhlIHBhcmVudCBzaGFwZS5cbiAgICB0aGlzLnNoYXBlID0gc2hhcGU7XG5cbiAgICAvL1RoZSBheGlzLWFsaWduZWQgYm91bmRpbmcgYm94LlxuICAgIHRoaXMuYWFiYiA9IHNoYXBlLmFhYmI7XG5cbiAgfVxuICBPYmplY3QuYXNzaWduKFByb3h5LnByb3RvdHlwZSwge1xuXG4gICAgUHJveHk6IHRydWUsXG5cbiAgICAvLyBVcGRhdGUgdGhlIHByb3h5LiBNdXN0IGJlIGluaGVyaXRlZCBieSBhIGNoaWxkLlxuXG4gICAgdXBkYXRlOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHByaW50RXJyb3IoXCJQcm94eVwiLCBcIkluaGVyaXRhbmNlIGVycm9yLlwiKTtcblxuICAgIH1cblxuICB9KTtcblxuICAvKipcbiAgKiBBIGJhc2ljIGltcGxlbWVudGF0aW9uIG9mIHByb3hpZXMuXG4gICpcbiAgKiBAYXV0aG9yIHNhaGFyYW5cbiAgKi9cblxuICBmdW5jdGlvbiBCYXNpY1Byb3h5KHNoYXBlKSB7XG5cbiAgICBQcm94eS5jYWxsKHRoaXMsIHNoYXBlKTtcblxuICAgIHRoaXMuaWQgPSBQcm94eUlkQ291bnQoKTtcblxuICB9XG4gIEJhc2ljUHJveHkucHJvdG90eXBlID0gT2JqZWN0LmFzc2lnbihPYmplY3QuY3JlYXRlKFByb3h5LnByb3RvdHlwZSksIHtcblxuICAgIGNvbnN0cnVjdG9yOiBCYXNpY1Byb3h5LFxuXG4gICAgdXBkYXRlOiBmdW5jdGlvbiAoKSB7XG5cbiAgICB9XG5cbiAgfSk7XG5cbiAgLyoqXG4gICogQSBicm9hZC1waGFzZSBhbGdvcml0aG0gd2l0aCBicnV0ZS1mb3JjZSBzZWFyY2guXG4gICogVGhpcyBhbHdheXMgY2hlY2tzIGZvciBhbGwgcG9zc2libGUgcGFpcnMuXG4gICovXG5cbiAgZnVuY3Rpb24gQnJ1dGVGb3JjZUJyb2FkUGhhc2UoKSB7XG5cbiAgICBCcm9hZFBoYXNlLmNhbGwodGhpcyk7XG4gICAgdGhpcy50eXBlcyA9IEJSX0JSVVRFX0ZPUkNFO1xuICAgIC8vdGhpcy5udW1Qcm94aWVzPTA7XG4gICAgLy8vdGhpcy5tYXhQcm94aWVzID0gMjU2O1xuICAgIHRoaXMucHJveGllcyA9IFtdO1xuICAgIC8vdGhpcy5wcm94aWVzLmxlbmd0aCA9IDI1NjtcblxuICB9XG5cbiAgQnJ1dGVGb3JjZUJyb2FkUGhhc2UucHJvdG90eXBlID0gT2JqZWN0LmFzc2lnbihPYmplY3QuY3JlYXRlKEJyb2FkUGhhc2UucHJvdG90eXBlKSwge1xuXG4gICAgY29uc3RydWN0b3I6IEJydXRlRm9yY2VCcm9hZFBoYXNlLFxuXG4gICAgY3JlYXRlUHJveHk6IGZ1bmN0aW9uIChzaGFwZSkge1xuXG4gICAgICByZXR1cm4gbmV3IEJhc2ljUHJveHkoc2hhcGUpO1xuXG4gICAgfSxcblxuICAgIGFkZFByb3h5OiBmdW5jdGlvbiAocHJveHkpIHtcblxuICAgICAgLyppZih0aGlzLm51bVByb3hpZXM9PXRoaXMubWF4UHJveGllcyl7XG4gICAgICAgICAgLy90aGlzLm1heFByb3hpZXM8PD0xO1xuICAgICAgICAgIHRoaXMubWF4UHJveGllcyo9MjtcbiAgICAgICAgICB2YXIgbmV3UHJveGllcz1bXTtcbiAgICAgICAgICBuZXdQcm94aWVzLmxlbmd0aCA9IHRoaXMubWF4UHJveGllcztcbiAgICAgICAgICB2YXIgaSA9IHRoaXMubnVtUHJveGllcztcbiAgICAgICAgICB3aGlsZShpLS0pe1xuICAgICAgICAgIC8vZm9yKHZhciBpPTAsIGw9dGhpcy5udW1Qcm94aWVzO2k8bDtpKyspe1xuICAgICAgICAgICAgICBuZXdQcm94aWVzW2ldPXRoaXMucHJveGllc1tpXTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5wcm94aWVzPW5ld1Byb3hpZXM7XG4gICAgICB9Ki9cbiAgICAgIC8vdGhpcy5wcm94aWVzW3RoaXMubnVtUHJveGllcysrXSA9IHByb3h5O1xuICAgICAgdGhpcy5wcm94aWVzLnB1c2gocHJveHkpO1xuICAgICAgLy90aGlzLm51bVByb3hpZXMrKztcblxuICAgIH0sXG5cbiAgICByZW1vdmVQcm94eTogZnVuY3Rpb24gKHByb3h5KSB7XG5cbiAgICAgIHZhciBuID0gdGhpcy5wcm94aWVzLmluZGV4T2YocHJveHkpO1xuICAgICAgaWYgKG4gPiAtMSkge1xuICAgICAgICB0aGlzLnByb3hpZXMuc3BsaWNlKG4sIDEpO1xuICAgICAgICAvL3RoaXMubnVtUHJveGllcy0tO1xuICAgICAgfVxuXG4gICAgICAvKnZhciBpID0gdGhpcy5udW1Qcm94aWVzO1xuICAgICAgd2hpbGUoaS0tKXtcbiAgICAgIC8vZm9yKHZhciBpPTAsIGw9dGhpcy5udW1Qcm94aWVzO2k8bDtpKyspe1xuICAgICAgICAgIGlmKHRoaXMucHJveGllc1tpXSA9PSBwcm94eSl7XG4gICAgICAgICAgICAgIHRoaXMucHJveGllc1tpXSA9IHRoaXMucHJveGllc1stLXRoaXMubnVtUHJveGllc107XG4gICAgICAgICAgICAgIHRoaXMucHJveGllc1t0aGlzLm51bVByb3hpZXNdID0gbnVsbDtcbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgIH0qL1xuXG4gICAgfSxcblxuICAgIGNvbGxlY3RQYWlyczogZnVuY3Rpb24gKCkge1xuXG4gICAgICB2YXIgaSA9IDAsIGosIHAxLCBwMjtcblxuICAgICAgdmFyIHB4ID0gdGhpcy5wcm94aWVzO1xuICAgICAgdmFyIGwgPSBweC5sZW5ndGg7Ly90aGlzLm51bVByb3hpZXM7XG4gICAgICAvL3ZhciBhcjEgPSBbXTtcbiAgICAgIC8vdmFyIGFyMiA9IFtdO1xuXG4gICAgICAvL2ZvciggaSA9IHB4Lmxlbmd0aCA7IGktLSA7IGFyMVsgaSBdID0gcHhbIGkgXSApe307XG4gICAgICAvL2ZvciggaSA9IHB4Lmxlbmd0aCA7IGktLSA7IGFyMlsgaSBdID0gcHhbIGkgXSApe307XG5cbiAgICAgIC8vdmFyIGFyMSA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5wcm94aWVzKSlcbiAgICAgIC8vdmFyIGFyMiA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5wcm94aWVzKSlcblxuICAgICAgdGhpcy5udW1QYWlyQ2hlY2tzID0gbCAqIChsIC0gMSkgPj4gMTtcbiAgICAgIC8vdGhpcy5udW1QYWlyQ2hlY2tzPXRoaXMubnVtUHJveGllcyoodGhpcy5udW1Qcm94aWVzLTEpKjAuNTtcblxuICAgICAgd2hpbGUgKGkgPCBsKSB7XG4gICAgICAgIHAxID0gcHhbaSsrXTtcbiAgICAgICAgaiA9IGkgKyAxO1xuICAgICAgICB3aGlsZSAoaiA8IGwpIHtcbiAgICAgICAgICBwMiA9IHB4W2orK107XG4gICAgICAgICAgaWYgKHAxLmFhYmIuaW50ZXJzZWN0VGVzdChwMi5hYWJiKSB8fCAhdGhpcy5pc0F2YWlsYWJsZVBhaXIocDEuc2hhcGUsIHAyLnNoYXBlKSkgY29udGludWU7XG4gICAgICAgICAgdGhpcy5hZGRQYWlyKHAxLnNoYXBlLCBwMi5zaGFwZSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgIH1cblxuICB9KTtcblxuICAvKipcbiAgICogQSBwcm9qZWN0aW9uIGF4aXMgZm9yIHN3ZWVwIGFuZCBwcnVuZSBicm9hZC1waGFzZS5cbiAgICogQGF1dGhvciBzYWhhcmFuXG4gICAqL1xuXG4gIGZ1bmN0aW9uIFNBUEF4aXMoKSB7XG5cbiAgICB0aGlzLm51bUVsZW1lbnRzID0gMDtcbiAgICB0aGlzLmJ1ZmZlclNpemUgPSAyNTY7XG4gICAgdGhpcy5lbGVtZW50cyA9IFtdO1xuICAgIHRoaXMuZWxlbWVudHMubGVuZ3RoID0gdGhpcy5idWZmZXJTaXplO1xuICAgIHRoaXMuc3RhY2sgPSBuZXcgRmxvYXQzMkFycmF5KDY0KTtcblxuICB9XG5cbiAgT2JqZWN0LmFzc2lnbihTQVBBeGlzLnByb3RvdHlwZSwge1xuXG4gICAgU0FQQXhpczogdHJ1ZSxcblxuICAgIGFkZEVsZW1lbnRzOiBmdW5jdGlvbiAobWluLCBtYXgpIHtcblxuICAgICAgaWYgKHRoaXMubnVtRWxlbWVudHMgKyAyID49IHRoaXMuYnVmZmVyU2l6ZSkge1xuICAgICAgICAvL3RoaXMuYnVmZmVyU2l6ZTw8PTE7XG4gICAgICAgIHRoaXMuYnVmZmVyU2l6ZSAqPSAyO1xuICAgICAgICB2YXIgbmV3RWxlbWVudHMgPSBbXTtcbiAgICAgICAgdmFyIGkgPSB0aGlzLm51bUVsZW1lbnRzO1xuICAgICAgICB3aGlsZSAoaS0tKSB7XG4gICAgICAgICAgLy9mb3IodmFyIGk9MCwgbD10aGlzLm51bUVsZW1lbnRzOyBpPGw7IGkrKyl7XG4gICAgICAgICAgbmV3RWxlbWVudHNbaV0gPSB0aGlzLmVsZW1lbnRzW2ldO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLmVsZW1lbnRzW3RoaXMubnVtRWxlbWVudHMrK10gPSBtaW47XG4gICAgICB0aGlzLmVsZW1lbnRzW3RoaXMubnVtRWxlbWVudHMrK10gPSBtYXg7XG5cbiAgICB9LFxuXG4gICAgcmVtb3ZlRWxlbWVudHM6IGZ1bmN0aW9uIChtaW4sIG1heCkge1xuXG4gICAgICB2YXIgbWluSW5kZXggPSAtMTtcbiAgICAgIHZhciBtYXhJbmRleCA9IC0xO1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSB0aGlzLm51bUVsZW1lbnRzOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIHZhciBlID0gdGhpcy5lbGVtZW50c1tpXTtcbiAgICAgICAgaWYgKGUgPT0gbWluIHx8IGUgPT0gbWF4KSB7XG4gICAgICAgICAgaWYgKG1pbkluZGV4ID09IC0xKSB7XG4gICAgICAgICAgICBtaW5JbmRleCA9IGk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG1heEluZGV4ID0gaTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZm9yIChpID0gbWluSW5kZXggKyAxLCBsID0gbWF4SW5kZXg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgdGhpcy5lbGVtZW50c1tpIC0gMV0gPSB0aGlzLmVsZW1lbnRzW2ldO1xuICAgICAgfVxuICAgICAgZm9yIChpID0gbWF4SW5kZXggKyAxLCBsID0gdGhpcy5udW1FbGVtZW50czsgaSA8IGw7IGkrKykge1xuICAgICAgICB0aGlzLmVsZW1lbnRzW2kgLSAyXSA9IHRoaXMuZWxlbWVudHNbaV07XG4gICAgICB9XG5cbiAgICAgIHRoaXMuZWxlbWVudHNbLS10aGlzLm51bUVsZW1lbnRzXSA9IG51bGw7XG4gICAgICB0aGlzLmVsZW1lbnRzWy0tdGhpcy5udW1FbGVtZW50c10gPSBudWxsO1xuXG4gICAgfSxcblxuICAgIHNvcnQ6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgdmFyIGNvdW50ID0gMDtcbiAgICAgIHZhciB0aHJlc2hvbGQgPSAxO1xuICAgICAgd2hpbGUgKCh0aGlzLm51bUVsZW1lbnRzID4+IHRocmVzaG9sZCkgIT0gMCkgdGhyZXNob2xkKys7XG4gICAgICB0aHJlc2hvbGQgPSB0aHJlc2hvbGQgKiB0aGlzLm51bUVsZW1lbnRzID4+IDI7XG4gICAgICBjb3VudCA9IDA7XG5cbiAgICAgIHZhciBnaXZldXAgPSBmYWxzZTtcbiAgICAgIHZhciBlbGVtZW50cyA9IHRoaXMuZWxlbWVudHM7XG4gICAgICBmb3IgKHZhciBpID0gMSwgbCA9IHRoaXMubnVtRWxlbWVudHM7IGkgPCBsOyBpKyspIHsgLy8gdHJ5IGluc2VydGlvbiBzb3J0XG4gICAgICAgIHZhciB0bXAgPSBlbGVtZW50c1tpXTtcbiAgICAgICAgdmFyIHBpdm90ID0gdG1wLnZhbHVlO1xuICAgICAgICB2YXIgdG1wMiA9IGVsZW1lbnRzW2kgLSAxXTtcbiAgICAgICAgaWYgKHRtcDIudmFsdWUgPiBwaXZvdCkge1xuICAgICAgICAgIHZhciBqID0gaTtcbiAgICAgICAgICBkbyB7XG4gICAgICAgICAgICBlbGVtZW50c1tqXSA9IHRtcDI7XG4gICAgICAgICAgICBpZiAoLS1qID09IDApIGJyZWFrO1xuICAgICAgICAgICAgdG1wMiA9IGVsZW1lbnRzW2ogLSAxXTtcbiAgICAgICAgICB9IHdoaWxlICh0bXAyLnZhbHVlID4gcGl2b3QpO1xuICAgICAgICAgIGVsZW1lbnRzW2pdID0gdG1wO1xuICAgICAgICAgIGNvdW50ICs9IGkgLSBqO1xuICAgICAgICAgIGlmIChjb3VudCA+IHRocmVzaG9sZCkge1xuICAgICAgICAgICAgZ2l2ZXVwID0gdHJ1ZTsgLy8gc3RvcCBhbmQgdXNlIHF1aWNrIHNvcnRcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKCFnaXZldXApIHJldHVybjtcbiAgICAgIGNvdW50ID0gMjsgdmFyIHN0YWNrID0gdGhpcy5zdGFjaztcbiAgICAgIHN0YWNrWzBdID0gMDtcbiAgICAgIHN0YWNrWzFdID0gdGhpcy5udW1FbGVtZW50cyAtIDE7XG4gICAgICB3aGlsZSAoY291bnQgPiAwKSB7XG4gICAgICAgIHZhciByaWdodCA9IHN0YWNrWy0tY291bnRdO1xuICAgICAgICB2YXIgbGVmdCA9IHN0YWNrWy0tY291bnRdO1xuICAgICAgICB2YXIgZGlmZiA9IHJpZ2h0IC0gbGVmdDtcbiAgICAgICAgaWYgKGRpZmYgPiAxNikgeyAgLy8gcXVpY2sgc29ydFxuICAgICAgICAgIC8vdmFyIG1pZD1sZWZ0KyhkaWZmPj4xKTtcbiAgICAgICAgICB2YXIgbWlkID0gbGVmdCArIChfTWF0aC5mbG9vcihkaWZmICogMC41KSk7XG4gICAgICAgICAgdG1wID0gZWxlbWVudHNbbWlkXTtcbiAgICAgICAgICBlbGVtZW50c1ttaWRdID0gZWxlbWVudHNbcmlnaHRdO1xuICAgICAgICAgIGVsZW1lbnRzW3JpZ2h0XSA9IHRtcDtcbiAgICAgICAgICBwaXZvdCA9IHRtcC52YWx1ZTtcbiAgICAgICAgICBpID0gbGVmdCAtIDE7XG4gICAgICAgICAgaiA9IHJpZ2h0O1xuICAgICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgICB2YXIgZWk7XG4gICAgICAgICAgICB2YXIgZWo7XG4gICAgICAgICAgICBkbyB7IGVpID0gZWxlbWVudHNbKytpXTsgfSB3aGlsZSAoZWkudmFsdWUgPCBwaXZvdCk7XG4gICAgICAgICAgICBkbyB7IGVqID0gZWxlbWVudHNbLS1qXTsgfSB3aGlsZSAocGl2b3QgPCBlai52YWx1ZSAmJiBqICE9IGxlZnQpO1xuICAgICAgICAgICAgaWYgKGkgPj0gaikgYnJlYWs7XG4gICAgICAgICAgICBlbGVtZW50c1tpXSA9IGVqO1xuICAgICAgICAgICAgZWxlbWVudHNbal0gPSBlaTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBlbGVtZW50c1tyaWdodF0gPSBlbGVtZW50c1tpXTtcbiAgICAgICAgICBlbGVtZW50c1tpXSA9IHRtcDtcbiAgICAgICAgICBpZiAoaSAtIGxlZnQgPiByaWdodCAtIGkpIHtcbiAgICAgICAgICAgIHN0YWNrW2NvdW50KytdID0gbGVmdDtcbiAgICAgICAgICAgIHN0YWNrW2NvdW50KytdID0gaSAtIDE7XG4gICAgICAgICAgICBzdGFja1tjb3VudCsrXSA9IGkgKyAxO1xuICAgICAgICAgICAgc3RhY2tbY291bnQrK10gPSByaWdodDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3RhY2tbY291bnQrK10gPSBpICsgMTtcbiAgICAgICAgICAgIHN0YWNrW2NvdW50KytdID0gcmlnaHQ7XG4gICAgICAgICAgICBzdGFja1tjb3VudCsrXSA9IGxlZnQ7XG4gICAgICAgICAgICBzdGFja1tjb3VudCsrXSA9IGkgLSAxO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBmb3IgKGkgPSBsZWZ0ICsgMTsgaSA8PSByaWdodDsgaSsrKSB7XG4gICAgICAgICAgICB0bXAgPSBlbGVtZW50c1tpXTtcbiAgICAgICAgICAgIHBpdm90ID0gdG1wLnZhbHVlO1xuICAgICAgICAgICAgdG1wMiA9IGVsZW1lbnRzW2kgLSAxXTtcbiAgICAgICAgICAgIGlmICh0bXAyLnZhbHVlID4gcGl2b3QpIHtcbiAgICAgICAgICAgICAgaiA9IGk7XG4gICAgICAgICAgICAgIGRvIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50c1tqXSA9IHRtcDI7XG4gICAgICAgICAgICAgICAgaWYgKC0taiA9PSAwKSBicmVhaztcbiAgICAgICAgICAgICAgICB0bXAyID0gZWxlbWVudHNbaiAtIDFdO1xuICAgICAgICAgICAgICB9IHdoaWxlICh0bXAyLnZhbHVlID4gcGl2b3QpO1xuICAgICAgICAgICAgICBlbGVtZW50c1tqXSA9IHRtcDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgIH0sXG5cbiAgICBjYWxjdWxhdGVUZXN0Q291bnQ6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgdmFyIG51bSA9IDE7XG4gICAgICB2YXIgc3VtID0gMDtcbiAgICAgIGZvciAodmFyIGkgPSAxLCBsID0gdGhpcy5udW1FbGVtZW50czsgaSA8IGw7IGkrKykge1xuICAgICAgICBpZiAodGhpcy5lbGVtZW50c1tpXS5tYXgpIHtcbiAgICAgICAgICBudW0tLTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdW0gKz0gbnVtO1xuICAgICAgICAgIG51bSsrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gc3VtO1xuXG4gICAgfVxuXG4gIH0pO1xuXG4gIC8qKlxuICAgKiBBbiBlbGVtZW50IG9mIHByb3hpZXMuXG4gICAqIEBhdXRob3Igc2FoYXJhblxuICAgKi9cblxuICBmdW5jdGlvbiBTQVBFbGVtZW50KHByb3h5LCBtYXgpIHtcblxuICAgIC8vIFRoZSBwYXJlbnQgcHJveHlcbiAgICB0aGlzLnByb3h5ID0gcHJveHk7XG4gICAgLy8gVGhlIHBhaXIgZWxlbWVudC5cbiAgICB0aGlzLnBhaXIgPSBudWxsO1xuICAgIC8vIFRoZSBtaW5pbXVtIGVsZW1lbnQgb24gb3RoZXIgYXhpcy5cbiAgICB0aGlzLm1pbjEgPSBudWxsO1xuICAgIC8vIFRoZSBtYXhpbXVtIGVsZW1lbnQgb24gb3RoZXIgYXhpcy5cbiAgICB0aGlzLm1heDEgPSBudWxsO1xuICAgIC8vIFRoZSBtaW5pbXVtIGVsZW1lbnQgb24gb3RoZXIgYXhpcy5cbiAgICB0aGlzLm1pbjIgPSBudWxsO1xuICAgIC8vIFRoZSBtYXhpbXVtIGVsZW1lbnQgb24gb3RoZXIgYXhpcy5cbiAgICB0aGlzLm1heDIgPSBudWxsO1xuICAgIC8vIFdoZXRoZXIgdGhlIGVsZW1lbnQgaGFzIG1heGltdW0gdmFsdWUgb3Igbm90LlxuICAgIHRoaXMubWF4ID0gbWF4O1xuICAgIC8vIFRoZSB2YWx1ZSBvZiB0aGUgZWxlbWVudC5cbiAgICB0aGlzLnZhbHVlID0gMDtcblxuICB9XG5cbiAgLyoqXG4gICAqIEEgcHJveHkgZm9yIHN3ZWVwIGFuZCBwcnVuZSBicm9hZC1waGFzZS5cbiAgICogQGF1dGhvciBzYWhhcmFuXG4gICAqIEBhdXRob3IgbG8tdGhcbiAgICovXG5cbiAgZnVuY3Rpb24gU0FQUHJveHkoc2FwLCBzaGFwZSkge1xuXG4gICAgUHJveHkuY2FsbCh0aGlzLCBzaGFwZSk7XG4gICAgLy8gVHlwZSBvZiB0aGUgYXhpcyB0byB3aGljaCB0aGUgcHJveHkgYmVsb25ncyB0by4gWzA6bm9uZSwgMTpkeW5hbWljLCAyOnN0YXRpY11cbiAgICB0aGlzLmJlbG9uZ3NUbyA9IDA7XG4gICAgLy8gVGhlIG1heGltdW0gZWxlbWVudHMgb24gZWFjaCBheGlzLlxuICAgIHRoaXMubWF4ID0gW107XG4gICAgLy8gVGhlIG1pbmltdW0gZWxlbWVudHMgb24gZWFjaCBheGlzLlxuICAgIHRoaXMubWluID0gW107XG5cbiAgICB0aGlzLnNhcCA9IHNhcDtcbiAgICB0aGlzLm1pblswXSA9IG5ldyBTQVBFbGVtZW50KHRoaXMsIGZhbHNlKTtcbiAgICB0aGlzLm1heFswXSA9IG5ldyBTQVBFbGVtZW50KHRoaXMsIHRydWUpO1xuICAgIHRoaXMubWluWzFdID0gbmV3IFNBUEVsZW1lbnQodGhpcywgZmFsc2UpO1xuICAgIHRoaXMubWF4WzFdID0gbmV3IFNBUEVsZW1lbnQodGhpcywgdHJ1ZSk7XG4gICAgdGhpcy5taW5bMl0gPSBuZXcgU0FQRWxlbWVudCh0aGlzLCBmYWxzZSk7XG4gICAgdGhpcy5tYXhbMl0gPSBuZXcgU0FQRWxlbWVudCh0aGlzLCB0cnVlKTtcbiAgICB0aGlzLm1heFswXS5wYWlyID0gdGhpcy5taW5bMF07XG4gICAgdGhpcy5tYXhbMV0ucGFpciA9IHRoaXMubWluWzFdO1xuICAgIHRoaXMubWF4WzJdLnBhaXIgPSB0aGlzLm1pblsyXTtcbiAgICB0aGlzLm1pblswXS5taW4xID0gdGhpcy5taW5bMV07XG4gICAgdGhpcy5taW5bMF0ubWF4MSA9IHRoaXMubWF4WzFdO1xuICAgIHRoaXMubWluWzBdLm1pbjIgPSB0aGlzLm1pblsyXTtcbiAgICB0aGlzLm1pblswXS5tYXgyID0gdGhpcy5tYXhbMl07XG4gICAgdGhpcy5taW5bMV0ubWluMSA9IHRoaXMubWluWzBdO1xuICAgIHRoaXMubWluWzFdLm1heDEgPSB0aGlzLm1heFswXTtcbiAgICB0aGlzLm1pblsxXS5taW4yID0gdGhpcy5taW5bMl07XG4gICAgdGhpcy5taW5bMV0ubWF4MiA9IHRoaXMubWF4WzJdO1xuICAgIHRoaXMubWluWzJdLm1pbjEgPSB0aGlzLm1pblswXTtcbiAgICB0aGlzLm1pblsyXS5tYXgxID0gdGhpcy5tYXhbMF07XG4gICAgdGhpcy5taW5bMl0ubWluMiA9IHRoaXMubWluWzFdO1xuICAgIHRoaXMubWluWzJdLm1heDIgPSB0aGlzLm1heFsxXTtcblxuICB9XG4gIFNBUFByb3h5LnByb3RvdHlwZSA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmNyZWF0ZShQcm94eS5wcm90b3R5cGUpLCB7XG5cbiAgICBjb25zdHJ1Y3RvcjogU0FQUHJveHksXG5cblxuICAgIC8vIFJldHVybnMgd2hldGhlciB0aGUgcHJveHkgaXMgZHluYW1pYyBvciBub3QuXG4gICAgaXNEeW5hbWljOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHZhciBib2R5ID0gdGhpcy5zaGFwZS5wYXJlbnQ7XG4gICAgICByZXR1cm4gYm9keS5pc0R5bmFtaWMgJiYgIWJvZHkuc2xlZXBpbmc7XG5cbiAgICB9LFxuXG4gICAgdXBkYXRlOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHZhciB0ZSA9IHRoaXMuYWFiYi5lbGVtZW50cztcbiAgICAgIHRoaXMubWluWzBdLnZhbHVlID0gdGVbMF07XG4gICAgICB0aGlzLm1pblsxXS52YWx1ZSA9IHRlWzFdO1xuICAgICAgdGhpcy5taW5bMl0udmFsdWUgPSB0ZVsyXTtcbiAgICAgIHRoaXMubWF4WzBdLnZhbHVlID0gdGVbM107XG4gICAgICB0aGlzLm1heFsxXS52YWx1ZSA9IHRlWzRdO1xuICAgICAgdGhpcy5tYXhbMl0udmFsdWUgPSB0ZVs1XTtcblxuICAgICAgaWYgKHRoaXMuYmVsb25nc1RvID09IDEgJiYgIXRoaXMuaXNEeW5hbWljKCkgfHwgdGhpcy5iZWxvbmdzVG8gPT0gMiAmJiB0aGlzLmlzRHluYW1pYygpKSB7XG4gICAgICAgIHRoaXMuc2FwLnJlbW92ZVByb3h5KHRoaXMpO1xuICAgICAgICB0aGlzLnNhcC5hZGRQcm94eSh0aGlzKTtcbiAgICAgIH1cblxuICAgIH1cblxuICB9KTtcblxuICAvKipcbiAgICogQSBicm9hZC1waGFzZSBjb2xsaXNpb24gZGV0ZWN0aW9uIGFsZ29yaXRobSB1c2luZyBzd2VlcCBhbmQgcHJ1bmUuXG4gICAqIEBhdXRob3Igc2FoYXJhblxuICAgKiBAYXV0aG9yIGxvLXRoXG4gICAqL1xuXG4gIGZ1bmN0aW9uIFNBUEJyb2FkUGhhc2UoKSB7XG5cbiAgICBCcm9hZFBoYXNlLmNhbGwodGhpcyk7XG4gICAgdGhpcy50eXBlcyA9IEJSX1NXRUVQX0FORF9QUlVORTtcblxuICAgIHRoaXMubnVtRWxlbWVudHNEID0gMDtcbiAgICB0aGlzLm51bUVsZW1lbnRzUyA9IDA7XG4gICAgLy8gZHluYW1pYyBwcm94aWVzXG4gICAgdGhpcy5heGVzRCA9IFtcbiAgICAgIG5ldyBTQVBBeGlzKCksXG4gICAgICBuZXcgU0FQQXhpcygpLFxuICAgICAgbmV3IFNBUEF4aXMoKVxuICAgIF07XG4gICAgLy8gc3RhdGljIG9yIHNsZWVwaW5nIHByb3hpZXNcbiAgICB0aGlzLmF4ZXNTID0gW1xuICAgICAgbmV3IFNBUEF4aXMoKSxcbiAgICAgIG5ldyBTQVBBeGlzKCksXG4gICAgICBuZXcgU0FQQXhpcygpXG4gICAgXTtcblxuICAgIHRoaXMuaW5kZXgxID0gMDtcbiAgICB0aGlzLmluZGV4MiA9IDE7XG5cbiAgfVxuICBTQVBCcm9hZFBoYXNlLnByb3RvdHlwZSA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmNyZWF0ZShCcm9hZFBoYXNlLnByb3RvdHlwZSksIHtcblxuICAgIGNvbnN0cnVjdG9yOiBTQVBCcm9hZFBoYXNlLFxuXG4gICAgY3JlYXRlUHJveHk6IGZ1bmN0aW9uIChzaGFwZSkge1xuXG4gICAgICByZXR1cm4gbmV3IFNBUFByb3h5KHRoaXMsIHNoYXBlKTtcblxuICAgIH0sXG5cbiAgICBhZGRQcm94eTogZnVuY3Rpb24gKHByb3h5KSB7XG5cbiAgICAgIHZhciBwID0gcHJveHk7XG4gICAgICBpZiAocC5pc0R5bmFtaWMoKSkge1xuICAgICAgICB0aGlzLmF4ZXNEWzBdLmFkZEVsZW1lbnRzKHAubWluWzBdLCBwLm1heFswXSk7XG4gICAgICAgIHRoaXMuYXhlc0RbMV0uYWRkRWxlbWVudHMocC5taW5bMV0sIHAubWF4WzFdKTtcbiAgICAgICAgdGhpcy5heGVzRFsyXS5hZGRFbGVtZW50cyhwLm1pblsyXSwgcC5tYXhbMl0pO1xuICAgICAgICBwLmJlbG9uZ3NUbyA9IDE7XG4gICAgICAgIHRoaXMubnVtRWxlbWVudHNEICs9IDI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmF4ZXNTWzBdLmFkZEVsZW1lbnRzKHAubWluWzBdLCBwLm1heFswXSk7XG4gICAgICAgIHRoaXMuYXhlc1NbMV0uYWRkRWxlbWVudHMocC5taW5bMV0sIHAubWF4WzFdKTtcbiAgICAgICAgdGhpcy5heGVzU1syXS5hZGRFbGVtZW50cyhwLm1pblsyXSwgcC5tYXhbMl0pO1xuICAgICAgICBwLmJlbG9uZ3NUbyA9IDI7XG4gICAgICAgIHRoaXMubnVtRWxlbWVudHNTICs9IDI7XG4gICAgICB9XG5cbiAgICB9LFxuXG4gICAgcmVtb3ZlUHJveHk6IGZ1bmN0aW9uIChwcm94eSkge1xuXG4gICAgICB2YXIgcCA9IHByb3h5O1xuICAgICAgaWYgKHAuYmVsb25nc1RvID09IDApIHJldHVybjtcblxuICAgICAgLyplbHNlIGlmICggcC5iZWxvbmdzVG8gPT0gMSApIHtcbiAgICAgICAgICB0aGlzLmF4ZXNEWzBdLnJlbW92ZUVsZW1lbnRzKCBwLm1pblswXSwgcC5tYXhbMF0gKTtcbiAgICAgICAgICB0aGlzLmF4ZXNEWzFdLnJlbW92ZUVsZW1lbnRzKCBwLm1pblsxXSwgcC5tYXhbMV0gKTtcbiAgICAgICAgICB0aGlzLmF4ZXNEWzJdLnJlbW92ZUVsZW1lbnRzKCBwLm1pblsyXSwgcC5tYXhbMl0gKTtcbiAgICAgICAgICB0aGlzLm51bUVsZW1lbnRzRCAtPSAyO1xuICAgICAgfSBlbHNlIGlmICggcC5iZWxvbmdzVG8gPT0gMiApIHtcbiAgICAgICAgICB0aGlzLmF4ZXNTWzBdLnJlbW92ZUVsZW1lbnRzKCBwLm1pblswXSwgcC5tYXhbMF0gKTtcbiAgICAgICAgICB0aGlzLmF4ZXNTWzFdLnJlbW92ZUVsZW1lbnRzKCBwLm1pblsxXSwgcC5tYXhbMV0gKTtcbiAgICAgICAgICB0aGlzLmF4ZXNTWzJdLnJlbW92ZUVsZW1lbnRzKCBwLm1pblsyXSwgcC5tYXhbMl0gKTtcbiAgICAgICAgICB0aGlzLm51bUVsZW1lbnRzUyAtPSAyO1xuICAgICAgfSovXG5cbiAgICAgIHN3aXRjaCAocC5iZWxvbmdzVG8pIHtcbiAgICAgICAgY2FzZSAxOlxuICAgICAgICAgIHRoaXMuYXhlc0RbMF0ucmVtb3ZlRWxlbWVudHMocC5taW5bMF0sIHAubWF4WzBdKTtcbiAgICAgICAgICB0aGlzLmF4ZXNEWzFdLnJlbW92ZUVsZW1lbnRzKHAubWluWzFdLCBwLm1heFsxXSk7XG4gICAgICAgICAgdGhpcy5heGVzRFsyXS5yZW1vdmVFbGVtZW50cyhwLm1pblsyXSwgcC5tYXhbMl0pO1xuICAgICAgICAgIHRoaXMubnVtRWxlbWVudHNEIC09IDI7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICB0aGlzLmF4ZXNTWzBdLnJlbW92ZUVsZW1lbnRzKHAubWluWzBdLCBwLm1heFswXSk7XG4gICAgICAgICAgdGhpcy5heGVzU1sxXS5yZW1vdmVFbGVtZW50cyhwLm1pblsxXSwgcC5tYXhbMV0pO1xuICAgICAgICAgIHRoaXMuYXhlc1NbMl0ucmVtb3ZlRWxlbWVudHMocC5taW5bMl0sIHAubWF4WzJdKTtcbiAgICAgICAgICB0aGlzLm51bUVsZW1lbnRzUyAtPSAyO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICBwLmJlbG9uZ3NUbyA9IDA7XG5cbiAgICB9LFxuXG4gICAgY29sbGVjdFBhaXJzOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIGlmICh0aGlzLm51bUVsZW1lbnRzRCA9PSAwKSByZXR1cm47XG5cbiAgICAgIHZhciBheGlzMSA9IHRoaXMuYXhlc0RbdGhpcy5pbmRleDFdO1xuICAgICAgdmFyIGF4aXMyID0gdGhpcy5heGVzRFt0aGlzLmluZGV4Ml07XG5cbiAgICAgIGF4aXMxLnNvcnQoKTtcbiAgICAgIGF4aXMyLnNvcnQoKTtcblxuICAgICAgdmFyIGNvdW50MSA9IGF4aXMxLmNhbGN1bGF0ZVRlc3RDb3VudCgpO1xuICAgICAgdmFyIGNvdW50MiA9IGF4aXMyLmNhbGN1bGF0ZVRlc3RDb3VudCgpO1xuICAgICAgdmFyIGVsZW1lbnRzRDtcbiAgICAgIHZhciBlbGVtZW50c1M7XG4gICAgICBpZiAoY291bnQxIDw9IGNvdW50Mikgey8vIHNlbGVjdCB0aGUgYmVzdCBheGlzXG4gICAgICAgIGF4aXMyID0gdGhpcy5heGVzU1t0aGlzLmluZGV4MV07XG4gICAgICAgIGF4aXMyLnNvcnQoKTtcbiAgICAgICAgZWxlbWVudHNEID0gYXhpczEuZWxlbWVudHM7XG4gICAgICAgIGVsZW1lbnRzUyA9IGF4aXMyLmVsZW1lbnRzO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYXhpczEgPSB0aGlzLmF4ZXNTW3RoaXMuaW5kZXgyXTtcbiAgICAgICAgYXhpczEuc29ydCgpO1xuICAgICAgICBlbGVtZW50c0QgPSBheGlzMi5lbGVtZW50cztcbiAgICAgICAgZWxlbWVudHNTID0gYXhpczEuZWxlbWVudHM7XG4gICAgICAgIHRoaXMuaW5kZXgxIF49IHRoaXMuaW5kZXgyO1xuICAgICAgICB0aGlzLmluZGV4MiBePSB0aGlzLmluZGV4MTtcbiAgICAgICAgdGhpcy5pbmRleDEgXj0gdGhpcy5pbmRleDI7XG4gICAgICB9XG4gICAgICB2YXIgYWN0aXZlRDtcbiAgICAgIHZhciBhY3RpdmVTO1xuICAgICAgdmFyIHAgPSAwO1xuICAgICAgdmFyIHEgPSAwO1xuICAgICAgd2hpbGUgKHAgPCB0aGlzLm51bUVsZW1lbnRzRCkge1xuICAgICAgICB2YXIgZTE7XG4gICAgICAgIHZhciBkeW47XG4gICAgICAgIGlmIChxID09IHRoaXMubnVtRWxlbWVudHNTKSB7XG4gICAgICAgICAgZTEgPSBlbGVtZW50c0RbcF07XG4gICAgICAgICAgZHluID0gdHJ1ZTtcbiAgICAgICAgICBwKys7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFyIGQgPSBlbGVtZW50c0RbcF07XG4gICAgICAgICAgdmFyIHMgPSBlbGVtZW50c1NbcV07XG4gICAgICAgICAgaWYgKGQudmFsdWUgPCBzLnZhbHVlKSB7XG4gICAgICAgICAgICBlMSA9IGQ7XG4gICAgICAgICAgICBkeW4gPSB0cnVlO1xuICAgICAgICAgICAgcCsrO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBlMSA9IHM7XG4gICAgICAgICAgICBkeW4gPSBmYWxzZTtcbiAgICAgICAgICAgIHErKztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFlMS5tYXgpIHtcbiAgICAgICAgICB2YXIgczEgPSBlMS5wcm94eS5zaGFwZTtcbiAgICAgICAgICB2YXIgbWluMSA9IGUxLm1pbjEudmFsdWU7XG4gICAgICAgICAgdmFyIG1heDEgPSBlMS5tYXgxLnZhbHVlO1xuICAgICAgICAgIHZhciBtaW4yID0gZTEubWluMi52YWx1ZTtcbiAgICAgICAgICB2YXIgbWF4MiA9IGUxLm1heDIudmFsdWU7XG5cbiAgICAgICAgICBmb3IgKHZhciBlMiA9IGFjdGl2ZUQ7IGUyICE9IG51bGw7IGUyID0gZTIucGFpcikgey8vIHRlc3QgZm9yIGR5bmFtaWNcbiAgICAgICAgICAgIHZhciBzMiA9IGUyLnByb3h5LnNoYXBlO1xuXG4gICAgICAgICAgICB0aGlzLm51bVBhaXJDaGVja3MrKztcbiAgICAgICAgICAgIGlmIChtaW4xID4gZTIubWF4MS52YWx1ZSB8fCBtYXgxIDwgZTIubWluMS52YWx1ZSB8fCBtaW4yID4gZTIubWF4Mi52YWx1ZSB8fCBtYXgyIDwgZTIubWluMi52YWx1ZSB8fCAhdGhpcy5pc0F2YWlsYWJsZVBhaXIoczEsIHMyKSkgY29udGludWU7XG4gICAgICAgICAgICB0aGlzLmFkZFBhaXIoczEsIHMyKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGR5bikge1xuICAgICAgICAgICAgZm9yIChlMiA9IGFjdGl2ZVM7IGUyICE9IG51bGw7IGUyID0gZTIucGFpcikgey8vIHRlc3QgZm9yIHN0YXRpY1xuICAgICAgICAgICAgICBzMiA9IGUyLnByb3h5LnNoYXBlO1xuXG4gICAgICAgICAgICAgIHRoaXMubnVtUGFpckNoZWNrcysrO1xuXG4gICAgICAgICAgICAgIGlmIChtaW4xID4gZTIubWF4MS52YWx1ZSB8fCBtYXgxIDwgZTIubWluMS52YWx1ZSB8fCBtaW4yID4gZTIubWF4Mi52YWx1ZSB8fCBtYXgyIDwgZTIubWluMi52YWx1ZSB8fCAhdGhpcy5pc0F2YWlsYWJsZVBhaXIoczEsIHMyKSkgY29udGludWU7XG4gICAgICAgICAgICAgIHRoaXMuYWRkUGFpcihzMSwgczIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZTEucGFpciA9IGFjdGl2ZUQ7XG4gICAgICAgICAgICBhY3RpdmVEID0gZTE7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGUxLnBhaXIgPSBhY3RpdmVTO1xuICAgICAgICAgICAgYWN0aXZlUyA9IGUxO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YXIgbWluID0gZTEucGFpcjtcbiAgICAgICAgICBpZiAoZHluKSB7XG4gICAgICAgICAgICBpZiAobWluID09IGFjdGl2ZUQpIHtcbiAgICAgICAgICAgICAgYWN0aXZlRCA9IGFjdGl2ZUQucGFpcjtcbiAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBlMSA9IGFjdGl2ZUQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChtaW4gPT0gYWN0aXZlUykge1xuICAgICAgICAgICAgICBhY3RpdmVTID0gYWN0aXZlUy5wYWlyO1xuICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGUxID0gYWN0aXZlUztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgd2hpbGUgKGUxKSB7XG4gICAgICAgICAgICBlMiA9IGUxLnBhaXI7XG4gICAgICAgICAgICBpZiAoZTIgPT0gbWluKSB7XG4gICAgICAgICAgICAgIGUxLnBhaXIgPSBlMi5wYWlyO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGUxID0gZTI7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLmluZGV4MiA9ICh0aGlzLmluZGV4MSB8IHRoaXMuaW5kZXgyKSBeIDM7XG5cbiAgICB9XG5cbiAgfSk7XG5cbiAgLyoqXG4gICogQSBub2RlIG9mIHRoZSBkeW5hbWljIGJvdW5kaW5nIHZvbHVtZSB0cmVlLlxuICAqIEBhdXRob3Igc2FoYXJhblxuICAqL1xuXG4gIGZ1bmN0aW9uIERCVlROb2RlKCkge1xuXG4gICAgLy8gVGhlIGZpcnN0IGNoaWxkIG5vZGUgb2YgdGhpcyBub2RlLlxuICAgIHRoaXMuY2hpbGQxID0gbnVsbDtcbiAgICAvLyBUaGUgc2Vjb25kIGNoaWxkIG5vZGUgb2YgdGhpcyBub2RlLlxuICAgIHRoaXMuY2hpbGQyID0gbnVsbDtcbiAgICAvLyAgVGhlIHBhcmVudCBub2RlIG9mIHRoaXMgdHJlZS5cbiAgICB0aGlzLnBhcmVudCA9IG51bGw7XG4gICAgLy8gVGhlIHByb3h5IG9mIHRoaXMgbm9kZS4gVGhpcyBoYXMgbm8gdmFsdWUgaWYgdGhpcyBub2RlIGlzIG5vdCBsZWFmLlxuICAgIHRoaXMucHJveHkgPSBudWxsO1xuICAgIC8vIFRoZSBtYXhpbXVtIGRpc3RhbmNlIGZyb20gbGVhZiBub2Rlcy5cbiAgICB0aGlzLmhlaWdodCA9IDA7XG4gICAgLy8gVGhlIEFBQkIgb2YgdGhpcyBub2RlLlxuICAgIHRoaXMuYWFiYiA9IG5ldyBBQUJCKCk7XG5cbiAgfVxuXG4gIC8qKlxuICAgKiBBIGR5bmFtaWMgYm91bmRpbmcgdm9sdW1lIHRyZWUgZm9yIHRoZSBicm9hZC1waGFzZSBhbGdvcml0aG0uXG4gICAqXG4gICAqIEBhdXRob3Igc2FoYXJhblxuICAgKiBAYXV0aG9yIGxvLXRoXG4gICAqL1xuXG4gIGZ1bmN0aW9uIERCVlQoKSB7XG5cbiAgICAvLyBUaGUgcm9vdCBvZiB0aGUgdHJlZS5cbiAgICB0aGlzLnJvb3QgPSBudWxsO1xuICAgIHRoaXMuZnJlZU5vZGVzID0gW107XG4gICAgdGhpcy5mcmVlTm9kZXMubGVuZ3RoID0gMTYzODQ7XG4gICAgdGhpcy5udW1GcmVlTm9kZXMgPSAwO1xuICAgIHRoaXMuYWFiYiA9IG5ldyBBQUJCKCk7XG5cbiAgfVxuICBPYmplY3QuYXNzaWduKERCVlQucHJvdG90eXBlLCB7XG5cbiAgICBEQlZUOiB0cnVlLFxuXG4gICAgbW92ZUxlYWY6IGZ1bmN0aW9uIChsZWFmKSB7XG5cbiAgICAgIHRoaXMuZGVsZXRlTGVhZihsZWFmKTtcbiAgICAgIHRoaXMuaW5zZXJ0TGVhZihsZWFmKTtcblxuICAgIH0sXG5cbiAgICBpbnNlcnRMZWFmOiBmdW5jdGlvbiAobGVhZikge1xuXG4gICAgICBpZiAodGhpcy5yb290ID09IG51bGwpIHtcbiAgICAgICAgdGhpcy5yb290ID0gbGVhZjtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdmFyIGxiID0gbGVhZi5hYWJiO1xuICAgICAgdmFyIHNpYmxpbmcgPSB0aGlzLnJvb3Q7XG4gICAgICB2YXIgb2xkQXJlYTtcbiAgICAgIHZhciBuZXdBcmVhO1xuICAgICAgd2hpbGUgKHNpYmxpbmcucHJveHkgPT0gbnVsbCkgeyAvLyBkZXNjZW5kIHRoZSBub2RlIHRvIHNlYXJjaCB0aGUgYmVzdCBwYWlyXG4gICAgICAgIHZhciBjMSA9IHNpYmxpbmcuY2hpbGQxO1xuICAgICAgICB2YXIgYzIgPSBzaWJsaW5nLmNoaWxkMjtcbiAgICAgICAgdmFyIGIgPSBzaWJsaW5nLmFhYmI7XG4gICAgICAgIHZhciBjMWIgPSBjMS5hYWJiO1xuICAgICAgICB2YXIgYzJiID0gYzIuYWFiYjtcbiAgICAgICAgb2xkQXJlYSA9IGIuc3VyZmFjZUFyZWEoKTtcbiAgICAgICAgdGhpcy5hYWJiLmNvbWJpbmUobGIsIGIpO1xuICAgICAgICBuZXdBcmVhID0gdGhpcy5hYWJiLnN1cmZhY2VBcmVhKCk7XG4gICAgICAgIHZhciBjcmVhdGluZ0Nvc3QgPSBuZXdBcmVhICogMjtcbiAgICAgICAgdmFyIGluY3JlbWVudGFsQ29zdCA9IChuZXdBcmVhIC0gb2xkQXJlYSkgKiAyOyAvLyBjb3N0IG9mIGNyZWF0aW5nIGEgbmV3IHBhaXIgd2l0aCB0aGUgbm9kZVxuICAgICAgICB2YXIgZGlzY2VuZGluZ0Nvc3QxID0gaW5jcmVtZW50YWxDb3N0O1xuICAgICAgICB0aGlzLmFhYmIuY29tYmluZShsYiwgYzFiKTtcbiAgICAgICAgaWYgKGMxLnByb3h5ICE9IG51bGwpIHtcbiAgICAgICAgICAvLyBsZWFmIGNvc3QgPSBhcmVhKGNvbWJpbmVkIGFhYmIpXG4gICAgICAgICAgZGlzY2VuZGluZ0Nvc3QxICs9IHRoaXMuYWFiYi5zdXJmYWNlQXJlYSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIG5vZGUgY29zdCA9IGFyZWEoY29tYmluZWQgYWFiYikgLSBhcmVhKG9sZCBhYWJiKVxuICAgICAgICAgIGRpc2NlbmRpbmdDb3N0MSArPSB0aGlzLmFhYmIuc3VyZmFjZUFyZWEoKSAtIGMxYi5zdXJmYWNlQXJlYSgpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBkaXNjZW5kaW5nQ29zdDIgPSBpbmNyZW1lbnRhbENvc3Q7XG4gICAgICAgIHRoaXMuYWFiYi5jb21iaW5lKGxiLCBjMmIpO1xuICAgICAgICBpZiAoYzIucHJveHkgIT0gbnVsbCkge1xuICAgICAgICAgIC8vIGxlYWYgY29zdCA9IGFyZWEoY29tYmluZWQgYWFiYilcbiAgICAgICAgICBkaXNjZW5kaW5nQ29zdDIgKz0gdGhpcy5hYWJiLnN1cmZhY2VBcmVhKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gbm9kZSBjb3N0ID0gYXJlYShjb21iaW5lZCBhYWJiKSAtIGFyZWEob2xkIGFhYmIpXG4gICAgICAgICAgZGlzY2VuZGluZ0Nvc3QyICs9IHRoaXMuYWFiYi5zdXJmYWNlQXJlYSgpIC0gYzJiLnN1cmZhY2VBcmVhKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRpc2NlbmRpbmdDb3N0MSA8IGRpc2NlbmRpbmdDb3N0Mikge1xuICAgICAgICAgIGlmIChjcmVhdGluZ0Nvc3QgPCBkaXNjZW5kaW5nQ29zdDEpIHtcbiAgICAgICAgICAgIGJyZWFrOy8vIHN0b3AgZGVzY2VuZGluZ1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzaWJsaW5nID0gYzE7Ly8gZGVzY2VuZCBpbnRvIGZpcnN0IGNoaWxkXG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChjcmVhdGluZ0Nvc3QgPCBkaXNjZW5kaW5nQ29zdDIpIHtcbiAgICAgICAgICAgIGJyZWFrOy8vIHN0b3AgZGVzY2VuZGluZ1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzaWJsaW5nID0gYzI7Ly8gZGVzY2VuZCBpbnRvIHNlY29uZCBjaGlsZFxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdmFyIG9sZFBhcmVudCA9IHNpYmxpbmcucGFyZW50O1xuICAgICAgdmFyIG5ld1BhcmVudDtcbiAgICAgIGlmICh0aGlzLm51bUZyZWVOb2RlcyA+IDApIHtcbiAgICAgICAgbmV3UGFyZW50ID0gdGhpcy5mcmVlTm9kZXNbLS10aGlzLm51bUZyZWVOb2Rlc107XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuZXdQYXJlbnQgPSBuZXcgREJWVE5vZGUoKTtcbiAgICAgIH1cblxuICAgICAgbmV3UGFyZW50LnBhcmVudCA9IG9sZFBhcmVudDtcbiAgICAgIG5ld1BhcmVudC5jaGlsZDEgPSBsZWFmO1xuICAgICAgbmV3UGFyZW50LmNoaWxkMiA9IHNpYmxpbmc7XG4gICAgICBuZXdQYXJlbnQuYWFiYi5jb21iaW5lKGxlYWYuYWFiYiwgc2libGluZy5hYWJiKTtcbiAgICAgIG5ld1BhcmVudC5oZWlnaHQgPSBzaWJsaW5nLmhlaWdodCArIDE7XG4gICAgICBzaWJsaW5nLnBhcmVudCA9IG5ld1BhcmVudDtcbiAgICAgIGxlYWYucGFyZW50ID0gbmV3UGFyZW50O1xuICAgICAgaWYgKHNpYmxpbmcgPT0gdGhpcy5yb290KSB7XG4gICAgICAgIC8vIHJlcGxhY2Ugcm9vdFxuICAgICAgICB0aGlzLnJvb3QgPSBuZXdQYXJlbnQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyByZXBsYWNlIGNoaWxkXG4gICAgICAgIGlmIChvbGRQYXJlbnQuY2hpbGQxID09IHNpYmxpbmcpIHtcbiAgICAgICAgICBvbGRQYXJlbnQuY2hpbGQxID0gbmV3UGFyZW50O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG9sZFBhcmVudC5jaGlsZDIgPSBuZXdQYXJlbnQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vIHVwZGF0ZSB3aG9sZSB0cmVlXG4gICAgICBkbyB7XG4gICAgICAgIG5ld1BhcmVudCA9IHRoaXMuYmFsYW5jZShuZXdQYXJlbnQpO1xuICAgICAgICB0aGlzLmZpeChuZXdQYXJlbnQpO1xuICAgICAgICBuZXdQYXJlbnQgPSBuZXdQYXJlbnQucGFyZW50O1xuICAgICAgfSB3aGlsZSAobmV3UGFyZW50ICE9IG51bGwpO1xuICAgIH0sXG5cbiAgICBnZXRCYWxhbmNlOiBmdW5jdGlvbiAobm9kZSkge1xuXG4gICAgICBpZiAobm9kZS5wcm94eSAhPSBudWxsKSByZXR1cm4gMDtcbiAgICAgIHJldHVybiBub2RlLmNoaWxkMS5oZWlnaHQgLSBub2RlLmNoaWxkMi5oZWlnaHQ7XG5cbiAgICB9LFxuXG4gICAgZGVsZXRlTGVhZjogZnVuY3Rpb24gKGxlYWYpIHtcblxuICAgICAgaWYgKGxlYWYgPT0gdGhpcy5yb290KSB7XG4gICAgICAgIHRoaXMucm9vdCA9IG51bGw7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHZhciBwYXJlbnQgPSBsZWFmLnBhcmVudDtcbiAgICAgIHZhciBzaWJsaW5nO1xuICAgICAgaWYgKHBhcmVudC5jaGlsZDEgPT0gbGVhZikge1xuICAgICAgICBzaWJsaW5nID0gcGFyZW50LmNoaWxkMjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNpYmxpbmcgPSBwYXJlbnQuY2hpbGQxO1xuICAgICAgfVxuICAgICAgaWYgKHBhcmVudCA9PSB0aGlzLnJvb3QpIHtcbiAgICAgICAgdGhpcy5yb290ID0gc2libGluZztcbiAgICAgICAgc2libGluZy5wYXJlbnQgPSBudWxsO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB2YXIgZ3JhbmRQYXJlbnQgPSBwYXJlbnQucGFyZW50O1xuICAgICAgc2libGluZy5wYXJlbnQgPSBncmFuZFBhcmVudDtcbiAgICAgIGlmIChncmFuZFBhcmVudC5jaGlsZDEgPT0gcGFyZW50KSB7XG4gICAgICAgIGdyYW5kUGFyZW50LmNoaWxkMSA9IHNpYmxpbmc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBncmFuZFBhcmVudC5jaGlsZDIgPSBzaWJsaW5nO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMubnVtRnJlZU5vZGVzIDwgMTYzODQpIHtcbiAgICAgICAgdGhpcy5mcmVlTm9kZXNbdGhpcy5udW1GcmVlTm9kZXMrK10gPSBwYXJlbnQ7XG4gICAgICB9XG4gICAgICBkbyB7XG4gICAgICAgIGdyYW5kUGFyZW50ID0gdGhpcy5iYWxhbmNlKGdyYW5kUGFyZW50KTtcbiAgICAgICAgdGhpcy5maXgoZ3JhbmRQYXJlbnQpO1xuICAgICAgICBncmFuZFBhcmVudCA9IGdyYW5kUGFyZW50LnBhcmVudDtcbiAgICAgIH0gd2hpbGUgKGdyYW5kUGFyZW50ICE9IG51bGwpO1xuXG4gICAgfSxcblxuICAgIGJhbGFuY2U6IGZ1bmN0aW9uIChub2RlKSB7XG5cbiAgICAgIHZhciBuaCA9IG5vZGUuaGVpZ2h0O1xuICAgICAgaWYgKG5oIDwgMikge1xuICAgICAgICByZXR1cm4gbm9kZTtcbiAgICAgIH1cbiAgICAgIHZhciBwID0gbm9kZS5wYXJlbnQ7XG4gICAgICB2YXIgbCA9IG5vZGUuY2hpbGQxO1xuICAgICAgdmFyIHIgPSBub2RlLmNoaWxkMjtcbiAgICAgIHZhciBsaCA9IGwuaGVpZ2h0O1xuICAgICAgdmFyIHJoID0gci5oZWlnaHQ7XG4gICAgICB2YXIgYmFsYW5jZSA9IGxoIC0gcmg7XG4gICAgICB2YXIgdDsvLyBmb3IgYml0IG9wZXJhdGlvblxuXG4gICAgICAvLyAgICAgICAgICBbIE4gXVxuICAgICAgLy8gICAgICAgICAvICAgICBcXFxuICAgICAgLy8gICAgWyBMIF0gICAgICAgWyBSIF1cbiAgICAgIC8vICAgICAvIFxcICAgICAgICAgLyBcXFxuICAgICAgLy8gW0wtTF0gW0wtUl0gW1ItTF0gW1ItUl1cblxuICAgICAgLy8gSXMgdGhlIHRyZWUgYmFsYW5jZWQ/XG4gICAgICBpZiAoYmFsYW5jZSA+IDEpIHtcbiAgICAgICAgdmFyIGxsID0gbC5jaGlsZDE7XG4gICAgICAgIHZhciBsciA9IGwuY2hpbGQyO1xuICAgICAgICB2YXIgbGxoID0gbGwuaGVpZ2h0O1xuICAgICAgICB2YXIgbHJoID0gbHIuaGVpZ2h0O1xuXG4gICAgICAgIC8vIElzIEwtTCBoaWdoZXIgdGhhbiBMLVI/XG4gICAgICAgIGlmIChsbGggPiBscmgpIHtcbiAgICAgICAgICAvLyBzZXQgTiB0byBMLVJcbiAgICAgICAgICBsLmNoaWxkMiA9IG5vZGU7XG4gICAgICAgICAgbm9kZS5wYXJlbnQgPSBsO1xuXG4gICAgICAgICAgLy8gICAgICAgICAgWyBMIF1cbiAgICAgICAgICAvLyAgICAgICAgIC8gICAgIFxcXG4gICAgICAgICAgLy8gICAgW0wtTF0gICAgICAgWyBOIF1cbiAgICAgICAgICAvLyAgICAgLyBcXCAgICAgICAgIC8gXFxcbiAgICAgICAgICAvLyBbLi4uXSBbLi4uXSBbIEwgXSBbIFIgXVxuXG4gICAgICAgICAgLy8gc2V0IEwtUlxuICAgICAgICAgIG5vZGUuY2hpbGQxID0gbHI7XG4gICAgICAgICAgbHIucGFyZW50ID0gbm9kZTtcblxuICAgICAgICAgIC8vICAgICAgICAgIFsgTCBdXG4gICAgICAgICAgLy8gICAgICAgICAvICAgICBcXFxuICAgICAgICAgIC8vICAgIFtMLUxdICAgICAgIFsgTiBdXG4gICAgICAgICAgLy8gICAgIC8gXFwgICAgICAgICAvIFxcXG4gICAgICAgICAgLy8gWy4uLl0gWy4uLl0gW0wtUl0gWyBSIF1cblxuICAgICAgICAgIC8vIGZpeCBib3VuZHMgYW5kIGhlaWdodHNcbiAgICAgICAgICBub2RlLmFhYmIuY29tYmluZShsci5hYWJiLCByLmFhYmIpO1xuICAgICAgICAgIHQgPSBscmggLSByaDtcbiAgICAgICAgICBub2RlLmhlaWdodCA9IGxyaCAtICh0ICYgdCA+PiAzMSkgKyAxO1xuICAgICAgICAgIGwuYWFiYi5jb21iaW5lKGxsLmFhYmIsIG5vZGUuYWFiYik7XG4gICAgICAgICAgdCA9IGxsaCAtIG5oO1xuICAgICAgICAgIGwuaGVpZ2h0ID0gbGxoIC0gKHQgJiB0ID4+IDMxKSArIDE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gc2V0IE4gdG8gTC1MXG4gICAgICAgICAgbC5jaGlsZDEgPSBub2RlO1xuICAgICAgICAgIG5vZGUucGFyZW50ID0gbDtcblxuICAgICAgICAgIC8vICAgICAgICAgIFsgTCBdXG4gICAgICAgICAgLy8gICAgICAgICAvICAgICBcXFxuICAgICAgICAgIC8vICAgIFsgTiBdICAgICAgIFtMLVJdXG4gICAgICAgICAgLy8gICAgIC8gXFwgICAgICAgICAvIFxcXG4gICAgICAgICAgLy8gWyBMIF0gWyBSIF0gWy4uLl0gWy4uLl1cblxuICAgICAgICAgIC8vIHNldCBMLUxcbiAgICAgICAgICBub2RlLmNoaWxkMSA9IGxsO1xuICAgICAgICAgIGxsLnBhcmVudCA9IG5vZGU7XG5cbiAgICAgICAgICAvLyAgICAgICAgICBbIEwgXVxuICAgICAgICAgIC8vICAgICAgICAgLyAgICAgXFxcbiAgICAgICAgICAvLyAgICBbIE4gXSAgICAgICBbTC1SXVxuICAgICAgICAgIC8vICAgICAvIFxcICAgICAgICAgLyBcXFxuICAgICAgICAgIC8vIFtMLUxdIFsgUiBdIFsuLi5dIFsuLi5dXG5cbiAgICAgICAgICAvLyBmaXggYm91bmRzIGFuZCBoZWlnaHRzXG4gICAgICAgICAgbm9kZS5hYWJiLmNvbWJpbmUobGwuYWFiYiwgci5hYWJiKTtcbiAgICAgICAgICB0ID0gbGxoIC0gcmg7XG4gICAgICAgICAgbm9kZS5oZWlnaHQgPSBsbGggLSAodCAmIHQgPj4gMzEpICsgMTtcblxuICAgICAgICAgIGwuYWFiYi5jb21iaW5lKG5vZGUuYWFiYiwgbHIuYWFiYik7XG4gICAgICAgICAgdCA9IG5oIC0gbHJoO1xuICAgICAgICAgIGwuaGVpZ2h0ID0gbmggLSAodCAmIHQgPj4gMzEpICsgMTtcbiAgICAgICAgfVxuICAgICAgICAvLyBzZXQgbmV3IHBhcmVudCBvZiBMXG4gICAgICAgIGlmIChwICE9IG51bGwpIHtcbiAgICAgICAgICBpZiAocC5jaGlsZDEgPT0gbm9kZSkge1xuICAgICAgICAgICAgcC5jaGlsZDEgPSBsO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwLmNoaWxkMiA9IGw7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMucm9vdCA9IGw7XG4gICAgICAgIH1cbiAgICAgICAgbC5wYXJlbnQgPSBwO1xuICAgICAgICByZXR1cm4gbDtcbiAgICAgIH0gZWxzZSBpZiAoYmFsYW5jZSA8IC0xKSB7XG4gICAgICAgIHZhciBybCA9IHIuY2hpbGQxO1xuICAgICAgICB2YXIgcnIgPSByLmNoaWxkMjtcbiAgICAgICAgdmFyIHJsaCA9IHJsLmhlaWdodDtcbiAgICAgICAgdmFyIHJyaCA9IHJyLmhlaWdodDtcblxuICAgICAgICAvLyBJcyBSLUwgaGlnaGVyIHRoYW4gUi1SP1xuICAgICAgICBpZiAocmxoID4gcnJoKSB7XG4gICAgICAgICAgLy8gc2V0IE4gdG8gUi1SXG4gICAgICAgICAgci5jaGlsZDIgPSBub2RlO1xuICAgICAgICAgIG5vZGUucGFyZW50ID0gcjtcblxuICAgICAgICAgIC8vICAgICAgICAgIFsgUiBdXG4gICAgICAgICAgLy8gICAgICAgICAvICAgICBcXFxuICAgICAgICAgIC8vICAgIFtSLUxdICAgICAgIFsgTiBdXG4gICAgICAgICAgLy8gICAgIC8gXFwgICAgICAgICAvIFxcXG4gICAgICAgICAgLy8gWy4uLl0gWy4uLl0gWyBMIF0gWyBSIF1cblxuICAgICAgICAgIC8vIHNldCBSLVJcbiAgICAgICAgICBub2RlLmNoaWxkMiA9IHJyO1xuICAgICAgICAgIHJyLnBhcmVudCA9IG5vZGU7XG5cbiAgICAgICAgICAvLyAgICAgICAgICBbIFIgXVxuICAgICAgICAgIC8vICAgICAgICAgLyAgICAgXFxcbiAgICAgICAgICAvLyAgICBbUi1MXSAgICAgICBbIE4gXVxuICAgICAgICAgIC8vICAgICAvIFxcICAgICAgICAgLyBcXFxuICAgICAgICAgIC8vIFsuLi5dIFsuLi5dIFsgTCBdIFtSLVJdXG5cbiAgICAgICAgICAvLyBmaXggYm91bmRzIGFuZCBoZWlnaHRzXG4gICAgICAgICAgbm9kZS5hYWJiLmNvbWJpbmUobC5hYWJiLCByci5hYWJiKTtcbiAgICAgICAgICB0ID0gbGggLSBycmg7XG4gICAgICAgICAgbm9kZS5oZWlnaHQgPSBsaCAtICh0ICYgdCA+PiAzMSkgKyAxO1xuICAgICAgICAgIHIuYWFiYi5jb21iaW5lKHJsLmFhYmIsIG5vZGUuYWFiYik7XG4gICAgICAgICAgdCA9IHJsaCAtIG5oO1xuICAgICAgICAgIHIuaGVpZ2h0ID0gcmxoIC0gKHQgJiB0ID4+IDMxKSArIDE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gc2V0IE4gdG8gUi1MXG4gICAgICAgICAgci5jaGlsZDEgPSBub2RlO1xuICAgICAgICAgIG5vZGUucGFyZW50ID0gcjtcbiAgICAgICAgICAvLyAgICAgICAgICBbIFIgXVxuICAgICAgICAgIC8vICAgICAgICAgLyAgICAgXFxcbiAgICAgICAgICAvLyAgICBbIE4gXSAgICAgICBbUi1SXVxuICAgICAgICAgIC8vICAgICAvIFxcICAgICAgICAgLyBcXFxuICAgICAgICAgIC8vIFsgTCBdIFsgUiBdIFsuLi5dIFsuLi5dXG5cbiAgICAgICAgICAvLyBzZXQgUi1MXG4gICAgICAgICAgbm9kZS5jaGlsZDIgPSBybDtcbiAgICAgICAgICBybC5wYXJlbnQgPSBub2RlO1xuXG4gICAgICAgICAgLy8gICAgICAgICAgWyBSIF1cbiAgICAgICAgICAvLyAgICAgICAgIC8gICAgIFxcXG4gICAgICAgICAgLy8gICAgWyBOIF0gICAgICAgW1ItUl1cbiAgICAgICAgICAvLyAgICAgLyBcXCAgICAgICAgIC8gXFxcbiAgICAgICAgICAvLyBbIEwgXSBbUi1MXSBbLi4uXSBbLi4uXVxuXG4gICAgICAgICAgLy8gZml4IGJvdW5kcyBhbmQgaGVpZ2h0c1xuICAgICAgICAgIG5vZGUuYWFiYi5jb21iaW5lKGwuYWFiYiwgcmwuYWFiYik7XG4gICAgICAgICAgdCA9IGxoIC0gcmxoO1xuICAgICAgICAgIG5vZGUuaGVpZ2h0ID0gbGggLSAodCAmIHQgPj4gMzEpICsgMTtcbiAgICAgICAgICByLmFhYmIuY29tYmluZShub2RlLmFhYmIsIHJyLmFhYmIpO1xuICAgICAgICAgIHQgPSBuaCAtIHJyaDtcbiAgICAgICAgICByLmhlaWdodCA9IG5oIC0gKHQgJiB0ID4+IDMxKSArIDE7XG4gICAgICAgIH1cbiAgICAgICAgLy8gc2V0IG5ldyBwYXJlbnQgb2YgUlxuICAgICAgICBpZiAocCAhPSBudWxsKSB7XG4gICAgICAgICAgaWYgKHAuY2hpbGQxID09IG5vZGUpIHtcbiAgICAgICAgICAgIHAuY2hpbGQxID0gcjtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcC5jaGlsZDIgPSByO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnJvb3QgPSByO1xuICAgICAgICB9XG4gICAgICAgIHIucGFyZW50ID0gcDtcbiAgICAgICAgcmV0dXJuIHI7XG4gICAgICB9XG4gICAgICByZXR1cm4gbm9kZTtcbiAgICB9LFxuXG4gICAgZml4OiBmdW5jdGlvbiAobm9kZSkge1xuXG4gICAgICB2YXIgYzEgPSBub2RlLmNoaWxkMTtcbiAgICAgIHZhciBjMiA9IG5vZGUuY2hpbGQyO1xuICAgICAgbm9kZS5hYWJiLmNvbWJpbmUoYzEuYWFiYiwgYzIuYWFiYik7XG4gICAgICBub2RlLmhlaWdodCA9IGMxLmhlaWdodCA8IGMyLmhlaWdodCA/IGMyLmhlaWdodCArIDEgOiBjMS5oZWlnaHQgKyAxO1xuXG4gICAgfVxuXG4gIH0pO1xuXG4gIC8qKlxuICAqIEEgcHJveHkgZm9yIGR5bmFtaWMgYm91bmRpbmcgdm9sdW1lIHRyZWUgYnJvYWQtcGhhc2UuXG4gICogQGF1dGhvciBzYWhhcmFuXG4gICovXG5cbiAgZnVuY3Rpb24gREJWVFByb3h5KHNoYXBlKSB7XG5cbiAgICBQcm94eS5jYWxsKHRoaXMsIHNoYXBlKTtcbiAgICAvLyBUaGUgbGVhZiBvZiB0aGUgcHJveHkuXG4gICAgdGhpcy5sZWFmID0gbmV3IERCVlROb2RlKCk7XG4gICAgdGhpcy5sZWFmLnByb3h5ID0gdGhpcztcblxuICB9XG4gIERCVlRQcm94eS5wcm90b3R5cGUgPSBPYmplY3QuYXNzaWduKE9iamVjdC5jcmVhdGUoUHJveHkucHJvdG90eXBlKSwge1xuXG4gICAgY29uc3RydWN0b3I6IERCVlRQcm94eSxcblxuICAgIHVwZGF0ZTogZnVuY3Rpb24gKCkge1xuXG4gICAgfVxuXG4gIH0pO1xuXG4gIC8qKlxuICAgKiBBIGJyb2FkLXBoYXNlIGFsZ29yaXRobSB1c2luZyBkeW5hbWljIGJvdW5kaW5nIHZvbHVtZSB0cmVlLlxuICAgKlxuICAgKiBAYXV0aG9yIHNhaGFyYW5cbiAgICogQGF1dGhvciBsby10aFxuICAgKi9cblxuICBmdW5jdGlvbiBEQlZUQnJvYWRQaGFzZSgpIHtcblxuICAgIEJyb2FkUGhhc2UuY2FsbCh0aGlzKTtcblxuICAgIHRoaXMudHlwZXMgPSBCUl9CT1VORElOR19WT0xVTUVfVFJFRTtcblxuICAgIHRoaXMudHJlZSA9IG5ldyBEQlZUKCk7XG4gICAgdGhpcy5zdGFjayA9IFtdO1xuICAgIHRoaXMubGVhdmVzID0gW107XG4gICAgdGhpcy5udW1MZWF2ZXMgPSAwO1xuXG4gIH1cbiAgREJWVEJyb2FkUGhhc2UucHJvdG90eXBlID0gT2JqZWN0LmFzc2lnbihPYmplY3QuY3JlYXRlKEJyb2FkUGhhc2UucHJvdG90eXBlKSwge1xuXG4gICAgY29uc3RydWN0b3I6IERCVlRCcm9hZFBoYXNlLFxuXG4gICAgY3JlYXRlUHJveHk6IGZ1bmN0aW9uIChzaGFwZSkge1xuXG4gICAgICByZXR1cm4gbmV3IERCVlRQcm94eShzaGFwZSk7XG5cbiAgICB9LFxuXG4gICAgYWRkUHJveHk6IGZ1bmN0aW9uIChwcm94eSkge1xuXG4gICAgICB0aGlzLnRyZWUuaW5zZXJ0TGVhZihwcm94eS5sZWFmKTtcbiAgICAgIHRoaXMubGVhdmVzLnB1c2gocHJveHkubGVhZik7XG4gICAgICB0aGlzLm51bUxlYXZlcysrO1xuXG4gICAgfSxcblxuICAgIHJlbW92ZVByb3h5OiBmdW5jdGlvbiAocHJveHkpIHtcblxuICAgICAgdGhpcy50cmVlLmRlbGV0ZUxlYWYocHJveHkubGVhZik7XG4gICAgICB2YXIgbiA9IHRoaXMubGVhdmVzLmluZGV4T2YocHJveHkubGVhZik7XG4gICAgICBpZiAobiA+IC0xKSB7XG4gICAgICAgIHRoaXMubGVhdmVzLnNwbGljZShuLCAxKTtcbiAgICAgICAgdGhpcy5udW1MZWF2ZXMtLTtcbiAgICAgIH1cblxuICAgIH0sXG5cbiAgICBjb2xsZWN0UGFpcnM6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgaWYgKHRoaXMubnVtTGVhdmVzIDwgMikgcmV0dXJuO1xuXG4gICAgICB2YXIgbGVhZiwgbWFyZ2luID0gMC4xLCBpID0gdGhpcy5udW1MZWF2ZXM7XG5cbiAgICAgIHdoaWxlIChpLS0pIHtcblxuICAgICAgICBsZWFmID0gdGhpcy5sZWF2ZXNbaV07XG5cbiAgICAgICAgaWYgKGxlYWYucHJveHkuYWFiYi5pbnRlcnNlY3RUZXN0VHdvKGxlYWYuYWFiYikpIHtcblxuICAgICAgICAgIGxlYWYuYWFiYi5jb3B5KGxlYWYucHJveHkuYWFiYiwgbWFyZ2luKTtcbiAgICAgICAgICB0aGlzLnRyZWUuZGVsZXRlTGVhZihsZWFmKTtcbiAgICAgICAgICB0aGlzLnRyZWUuaW5zZXJ0TGVhZihsZWFmKTtcbiAgICAgICAgICB0aGlzLmNvbGxpZGUobGVhZiwgdGhpcy50cmVlLnJvb3QpO1xuXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgIH0sXG5cbiAgICBjb2xsaWRlOiBmdW5jdGlvbiAobm9kZTEsIG5vZGUyKSB7XG5cbiAgICAgIHZhciBzdGFja0NvdW50ID0gMjtcbiAgICAgIHZhciBzMSwgczIsIG4xLCBuMiwgbDEsIGwyO1xuICAgICAgdGhpcy5zdGFja1swXSA9IG5vZGUxO1xuICAgICAgdGhpcy5zdGFja1sxXSA9IG5vZGUyO1xuXG4gICAgICB3aGlsZSAoc3RhY2tDb3VudCA+IDApIHtcblxuICAgICAgICBuMSA9IHRoaXMuc3RhY2tbLS1zdGFja0NvdW50XTtcbiAgICAgICAgbjIgPSB0aGlzLnN0YWNrWy0tc3RhY2tDb3VudF07XG4gICAgICAgIGwxID0gbjEucHJveHkgIT0gbnVsbDtcbiAgICAgICAgbDIgPSBuMi5wcm94eSAhPSBudWxsO1xuXG4gICAgICAgIHRoaXMubnVtUGFpckNoZWNrcysrO1xuXG4gICAgICAgIGlmIChsMSAmJiBsMikge1xuICAgICAgICAgIHMxID0gbjEucHJveHkuc2hhcGU7XG4gICAgICAgICAgczIgPSBuMi5wcm94eS5zaGFwZTtcbiAgICAgICAgICBpZiAoczEgPT0gczIgfHwgczEuYWFiYi5pbnRlcnNlY3RUZXN0KHMyLmFhYmIpIHx8ICF0aGlzLmlzQXZhaWxhYmxlUGFpcihzMSwgczIpKSBjb250aW51ZTtcblxuICAgICAgICAgIHRoaXMuYWRkUGFpcihzMSwgczIpO1xuXG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICBpZiAobjEuYWFiYi5pbnRlcnNlY3RUZXN0KG4yLmFhYmIpKSBjb250aW51ZTtcblxuICAgICAgICAgIC8qaWYoc3RhY2tDb3VudCs0Pj10aGlzLm1heFN0YWNrKXsvLyBleHBhbmQgdGhlIHN0YWNrXG4gICAgICAgICAgICAgIC8vdGhpcy5tYXhTdGFjazw8PTE7XG4gICAgICAgICAgICAgIHRoaXMubWF4U3RhY2sqPTI7XG4gICAgICAgICAgICAgIHZhciBuZXdTdGFjayA9IFtdOy8vIHZlY3RvclxuICAgICAgICAgICAgICBuZXdTdGFjay5sZW5ndGggPSB0aGlzLm1heFN0YWNrO1xuICAgICAgICAgICAgICBmb3IodmFyIGk9MDtpPHN0YWNrQ291bnQ7aSsrKXtcbiAgICAgICAgICAgICAgICAgIG5ld1N0YWNrW2ldID0gdGhpcy5zdGFja1tpXTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB0aGlzLnN0YWNrID0gbmV3U3RhY2s7XG4gICAgICAgICAgfSovXG5cbiAgICAgICAgICBpZiAobDIgfHwgIWwxICYmIChuMS5hYWJiLnN1cmZhY2VBcmVhKCkgPiBuMi5hYWJiLnN1cmZhY2VBcmVhKCkpKSB7XG4gICAgICAgICAgICB0aGlzLnN0YWNrW3N0YWNrQ291bnQrK10gPSBuMS5jaGlsZDE7XG4gICAgICAgICAgICB0aGlzLnN0YWNrW3N0YWNrQ291bnQrK10gPSBuMjtcbiAgICAgICAgICAgIHRoaXMuc3RhY2tbc3RhY2tDb3VudCsrXSA9IG4xLmNoaWxkMjtcbiAgICAgICAgICAgIHRoaXMuc3RhY2tbc3RhY2tDb3VudCsrXSA9IG4yO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnN0YWNrW3N0YWNrQ291bnQrK10gPSBuMTtcbiAgICAgICAgICAgIHRoaXMuc3RhY2tbc3RhY2tDb3VudCsrXSA9IG4yLmNoaWxkMTtcbiAgICAgICAgICAgIHRoaXMuc3RhY2tbc3RhY2tDb3VudCsrXSA9IG4xO1xuICAgICAgICAgICAgdGhpcy5zdGFja1tzdGFja0NvdW50KytdID0gbjIuY2hpbGQyO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgfVxuXG4gIH0pO1xuXG4gIGZ1bmN0aW9uIENvbGxpc2lvbkRldGVjdG9yKCkge1xuXG4gICAgdGhpcy5mbGlwID0gZmFsc2U7XG5cbiAgfVxuICBPYmplY3QuYXNzaWduKENvbGxpc2lvbkRldGVjdG9yLnByb3RvdHlwZSwge1xuXG4gICAgQ29sbGlzaW9uRGV0ZWN0b3I6IHRydWUsXG5cbiAgICBkZXRlY3RDb2xsaXNpb246IGZ1bmN0aW9uIChzaGFwZTEsIHNoYXBlMiwgbWFuaWZvbGQpIHtcblxuICAgICAgcHJpbnRFcnJvcihcIkNvbGxpc2lvbkRldGVjdG9yXCIsIFwiSW5oZXJpdGFuY2UgZXJyb3IuXCIpO1xuXG4gICAgfVxuXG4gIH0pO1xuXG4gIC8qKlxuICAgKiBBIGNvbGxpc2lvbiBkZXRlY3RvciB3aGljaCBkZXRlY3RzIGNvbGxpc2lvbnMgYmV0d2VlbiB0d28gYm94ZXMuXG4gICAqIEBhdXRob3Igc2FoYXJhblxuICAgKi9cbiAgZnVuY3Rpb24gQm94Qm94Q29sbGlzaW9uRGV0ZWN0b3IoKSB7XG5cbiAgICBDb2xsaXNpb25EZXRlY3Rvci5jYWxsKHRoaXMpO1xuICAgIHRoaXMuY2xpcFZlcnRpY2VzMSA9IG5ldyBGbG9hdDMyQXJyYXkoMjQpOyAvLyA4IHZlcnRpY2VzIHgseSx6XG4gICAgdGhpcy5jbGlwVmVydGljZXMyID0gbmV3IEZsb2F0MzJBcnJheSgyNCk7XG4gICAgdGhpcy51c2VkID0gbmV3IEZsb2F0MzJBcnJheSg4KTtcblxuICAgIHRoaXMuSU5GID0gMSAvIDA7XG5cbiAgfVxuICBCb3hCb3hDb2xsaXNpb25EZXRlY3Rvci5wcm90b3R5cGUgPSBPYmplY3QuYXNzaWduKE9iamVjdC5jcmVhdGUoQ29sbGlzaW9uRGV0ZWN0b3IucHJvdG90eXBlKSwge1xuXG4gICAgY29uc3RydWN0b3I6IEJveEJveENvbGxpc2lvbkRldGVjdG9yLFxuXG4gICAgZGV0ZWN0Q29sbGlzaW9uOiBmdW5jdGlvbiAoc2hhcGUxLCBzaGFwZTIsIG1hbmlmb2xkKSB7XG4gICAgICAvLyBXaGF0IHlvdSBhcmUgZG9pbmcgXG4gICAgICAvLyDCtyBJIHRvIHByZXBhcmUgYSBzZXBhcmF0ZSBheGlzIG9mIHRoZSBmaWZ0ZWVuIFxuICAgICAgLy8tU2l4IGluIGVhY2ggb2YgdGhyZWUgbm9ybWFsIHZlY3RvcnMgb2YgdGhlIHh5eiBkaXJlY3Rpb24gb2YgdGhlIGJveCBib3RoIFxuICAgICAgLy8gwrcgUmVtYWluaW5nIG5pbmUgM3gzIGEgdmVjdG9yIHBlcnBlbmRpY3VsYXIgdG8gdGhlIHNpZGUgb2YgdGhlIGJveCAyIGFuZCB0aGUgc2lkZSBvZiB0aGUgYm94IDEgXG4gICAgICAvLyDCtyBDYWxjdWxhdGUgdGhlIGRlcHRoIHRvIHRoZSBzZXBhcmF0aW9uIGF4aXMgXG5cbiAgICAgIC8vIENhbGN1bGF0ZXMgdGhlIGRpc3RhbmNlIHVzaW5nIHRoZSBpbm5lciBwcm9kdWN0IGFuZCBwdXQgdGhlIGFtb3VudCBvZiBlbWJlZG1lbnQgXG4gICAgICAvLyDCtyBIb3dldmVyIGEgdmVydGljYWwgc2VwYXJhdGlvbiBheGlzIGFuZCBzaWRlIHRvIHdlaWdodCBhIGxpdHRsZSB0byBhdm9pZCB2aWJyYXRpb24gXG4gICAgICAvLyBBbmQgZW5kIHdoZW4gdGhlcmUgaXMgYSBzZXBhcmF0ZSBheGlzIHRoYXQgaXMgcmVtb3RlIGV2ZW4gb25lIFxuICAgICAgLy8gwrcgSSBsb29rIGZvciBzZXBhcmF0aW9uIGF4aXMgd2l0aCBsaXR0bGUgdG8gZGVudCBtb3N0IFxuICAgICAgLy8gTWVuIGFuZCBpZiBzZXBhcmF0aW9uIGF4aXMgb2YgdGhlIGZpcnN0IHNpeCAtIGVuZCBjb2xsaXNpb24gXG4gICAgICAvLyBIZW5nIElmIGl0IHNlcGFyYXRlIGF4aXMgb2YgbmluZSBvdGhlciAtIHNpZGUgY29sbGlzaW9uIFxuICAgICAgLy8gSGVuZyAtIGNhc2Ugb2YgYSBzaWRlIGNvbGxpc2lvbiBcbiAgICAgIC8vIMK3IEZpbmQgcG9pbnRzIG9mIHR3byBzaWRlcyBvbiB3aGljaCB5b3UgbWFkZSDigIvigIt0aGUgc2VwYXJhdGlvbiBheGlzIFxuXG4gICAgICAvLyBDYWxjdWxhdGVzIHRoZSBwb2ludCBvZiBjbG9zZXN0IGFwcHJvYWNoIG9mIGEgc3RyYWlnaHQgbGluZSBjb25zaXN0aW5nIG9mIHNlcGFyYXRlIGF4aXMgcG9pbnRzIG9idGFpbmVkLCBhbmQgdGhlIGNvbGxpc2lvbiBwb2ludCBcbiAgICAgIC8vLVN1cmZhY2UgLSB0aGUgY2FzZSBvZiB0aGUgcGxhbmUgY3Jhc2ggXG4gICAgICAvLy1Cb3ggQSwgYm94IEIgYW5kIHRoZSBvdGhlciBhIGJveCBvZiBiZXR0ZXIgbWFkZSDigIvigIthIHNlcGFyYXRlIGF4aXMgXG4gICAgICAvLyDigKIgVGhlIHN1cmZhY2UgQSBhbmQgdGhlIHBsYW5lIHRoYXQgbWFkZSB0aGUgc2VwYXJhdGlvbiBheGlzIG9mIHRoZSBib3ggQSwgYW5kIEIgdG8gdGhlIHN1cmZhY2UgdGhlIGZhY2Ugb2YgdGhlIGJveCBCIGNsb3NlIGluIHRoZSBvcHBvc2l0ZSBkaXJlY3Rpb24gdG8gdGhlIG1vc3QgaXNvbGF0ZWQgYXhpcyBcblxuICAgICAgLy8gV2hlbiB2aWV3ZWQgZnJvbSB0aGUgZnJvbnQgc3VyZmFjZSBBLCBhbmQgdGhlIGN1dCBwYXJ0IGV4Y2VlZGluZyB0aGUgYXJlYSBvZiB0aGUgc3VyZmFjZSBBIGlzIGEgc3VyZmFjZSBCIFxuICAgICAgLy8tUGxhbmUgQiBiZWNvbWVzIHRoZSAzLTggdHJpYW5nbGUsIEkgYSBjYW5kaWRhdGUgZm9yIHRoZSBjb2xsaXNpb24gcG9pbnQgdGhlIHZlcnRleCBvZiBzdXJmYWNlIEIgXG4gICAgICAvLyDigKIgSWYgbW9yZSB0aGFuIG9uZSBjYW5kaWRhdGUgNSBleGlzdHMsIHNjcmFwaW5nIHVwIHRvIGZvdXIgXG5cbiAgICAgIC8vIEZvciBwb3RlbnRpYWwgY29sbGlzaW9uIHBvaW50cyBvZiBhbGwsIHRvIGV4YW1pbmUgdGhlIGRpc3RhbmNlIGJldHdlZW4gdGhlIHN1cmZhY2UgQSBcbiAgICAgIC8vIOKAoiBJZiB5b3Ugd2VyZSBvbiB0aGUgaW5zaWRlIHN1cmZhY2Ugb2YgQSwgYW5kIHRoZSBjb2xsaXNpb24gcG9pbnRcblxuICAgICAgdmFyIGIxO1xuICAgICAgdmFyIGIyO1xuICAgICAgaWYgKHNoYXBlMS5pZCA8IHNoYXBlMi5pZCkge1xuICAgICAgICBiMSA9IChzaGFwZTEpO1xuICAgICAgICBiMiA9IChzaGFwZTIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYjEgPSAoc2hhcGUyKTtcbiAgICAgICAgYjIgPSAoc2hhcGUxKTtcbiAgICAgIH1cbiAgICAgIHZhciBWMSA9IGIxLmVsZW1lbnRzO1xuICAgICAgdmFyIFYyID0gYjIuZWxlbWVudHM7XG5cbiAgICAgIHZhciBEMSA9IGIxLmRpbWVudGlvbnM7XG4gICAgICB2YXIgRDIgPSBiMi5kaW1lbnRpb25zO1xuXG4gICAgICB2YXIgcDEgPSBiMS5wb3NpdGlvbjtcbiAgICAgIHZhciBwMiA9IGIyLnBvc2l0aW9uO1xuICAgICAgdmFyIHAxeCA9IHAxLng7XG4gICAgICB2YXIgcDF5ID0gcDEueTtcbiAgICAgIHZhciBwMXogPSBwMS56O1xuICAgICAgdmFyIHAyeCA9IHAyLng7XG4gICAgICB2YXIgcDJ5ID0gcDIueTtcbiAgICAgIHZhciBwMnogPSBwMi56O1xuICAgICAgLy8gZGlmZlxuICAgICAgdmFyIGR4ID0gcDJ4IC0gcDF4O1xuICAgICAgdmFyIGR5ID0gcDJ5IC0gcDF5O1xuICAgICAgdmFyIGR6ID0gcDJ6IC0gcDF6O1xuICAgICAgLy8gZGlzdGFuY2VcbiAgICAgIHZhciB3MSA9IGIxLmhhbGZXaWR0aDtcbiAgICAgIHZhciBoMSA9IGIxLmhhbGZIZWlnaHQ7XG4gICAgICB2YXIgZDEgPSBiMS5oYWxmRGVwdGg7XG4gICAgICB2YXIgdzIgPSBiMi5oYWxmV2lkdGg7XG4gICAgICB2YXIgaDIgPSBiMi5oYWxmSGVpZ2h0O1xuICAgICAgdmFyIGQyID0gYjIuaGFsZkRlcHRoO1xuICAgICAgLy8gZGlyZWN0aW9uXG5cbiAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgIC8vIDE1IHNlcGFyYXRpbmcgYXhlc1xuICAgICAgLy8gMX42OiBmYWNlXG4gICAgICAvLyA3fmY6IGVkZ2VcbiAgICAgIC8vIGh0dHA6Ly9tYXJ1cGVrZTI5Ni5jb20vQ09MXzNEX05vMTNfT0JCdnNPQkIuaHRtbFxuICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICAgICB2YXIgYTF4ID0gRDFbMF07XG4gICAgICB2YXIgYTF5ID0gRDFbMV07XG4gICAgICB2YXIgYTF6ID0gRDFbMl07XG4gICAgICB2YXIgYTJ4ID0gRDFbM107XG4gICAgICB2YXIgYTJ5ID0gRDFbNF07XG4gICAgICB2YXIgYTJ6ID0gRDFbNV07XG4gICAgICB2YXIgYTN4ID0gRDFbNl07XG4gICAgICB2YXIgYTN5ID0gRDFbN107XG4gICAgICB2YXIgYTN6ID0gRDFbOF07XG4gICAgICB2YXIgZDF4ID0gRDFbOV07XG4gICAgICB2YXIgZDF5ID0gRDFbMTBdO1xuICAgICAgdmFyIGQxeiA9IEQxWzExXTtcbiAgICAgIHZhciBkMnggPSBEMVsxMl07XG4gICAgICB2YXIgZDJ5ID0gRDFbMTNdO1xuICAgICAgdmFyIGQyeiA9IEQxWzE0XTtcbiAgICAgIHZhciBkM3ggPSBEMVsxNV07XG4gICAgICB2YXIgZDN5ID0gRDFbMTZdO1xuICAgICAgdmFyIGQzeiA9IEQxWzE3XTtcblxuICAgICAgdmFyIGE0eCA9IEQyWzBdO1xuICAgICAgdmFyIGE0eSA9IEQyWzFdO1xuICAgICAgdmFyIGE0eiA9IEQyWzJdO1xuICAgICAgdmFyIGE1eCA9IEQyWzNdO1xuICAgICAgdmFyIGE1eSA9IEQyWzRdO1xuICAgICAgdmFyIGE1eiA9IEQyWzVdO1xuICAgICAgdmFyIGE2eCA9IEQyWzZdO1xuICAgICAgdmFyIGE2eSA9IEQyWzddO1xuICAgICAgdmFyIGE2eiA9IEQyWzhdO1xuICAgICAgdmFyIGQ0eCA9IEQyWzldO1xuICAgICAgdmFyIGQ0eSA9IEQyWzEwXTtcbiAgICAgIHZhciBkNHogPSBEMlsxMV07XG4gICAgICB2YXIgZDV4ID0gRDJbMTJdO1xuICAgICAgdmFyIGQ1eSA9IEQyWzEzXTtcbiAgICAgIHZhciBkNXogPSBEMlsxNF07XG4gICAgICB2YXIgZDZ4ID0gRDJbMTVdO1xuICAgICAgdmFyIGQ2eSA9IEQyWzE2XTtcbiAgICAgIHZhciBkNnogPSBEMlsxN107XG5cbiAgICAgIHZhciBhN3ggPSBhMXkgKiBhNHogLSBhMXogKiBhNHk7XG4gICAgICB2YXIgYTd5ID0gYTF6ICogYTR4IC0gYTF4ICogYTR6O1xuICAgICAgdmFyIGE3eiA9IGExeCAqIGE0eSAtIGExeSAqIGE0eDtcbiAgICAgIHZhciBhOHggPSBhMXkgKiBhNXogLSBhMXogKiBhNXk7XG4gICAgICB2YXIgYTh5ID0gYTF6ICogYTV4IC0gYTF4ICogYTV6O1xuICAgICAgdmFyIGE4eiA9IGExeCAqIGE1eSAtIGExeSAqIGE1eDtcbiAgICAgIHZhciBhOXggPSBhMXkgKiBhNnogLSBhMXogKiBhNnk7XG4gICAgICB2YXIgYTl5ID0gYTF6ICogYTZ4IC0gYTF4ICogYTZ6O1xuICAgICAgdmFyIGE5eiA9IGExeCAqIGE2eSAtIGExeSAqIGE2eDtcbiAgICAgIHZhciBhYXggPSBhMnkgKiBhNHogLSBhMnogKiBhNHk7XG4gICAgICB2YXIgYWF5ID0gYTJ6ICogYTR4IC0gYTJ4ICogYTR6O1xuICAgICAgdmFyIGFheiA9IGEyeCAqIGE0eSAtIGEyeSAqIGE0eDtcbiAgICAgIHZhciBhYnggPSBhMnkgKiBhNXogLSBhMnogKiBhNXk7XG4gICAgICB2YXIgYWJ5ID0gYTJ6ICogYTV4IC0gYTJ4ICogYTV6O1xuICAgICAgdmFyIGFieiA9IGEyeCAqIGE1eSAtIGEyeSAqIGE1eDtcbiAgICAgIHZhciBhY3ggPSBhMnkgKiBhNnogLSBhMnogKiBhNnk7XG4gICAgICB2YXIgYWN5ID0gYTJ6ICogYTZ4IC0gYTJ4ICogYTZ6O1xuICAgICAgdmFyIGFjeiA9IGEyeCAqIGE2eSAtIGEyeSAqIGE2eDtcbiAgICAgIHZhciBhZHggPSBhM3kgKiBhNHogLSBhM3ogKiBhNHk7XG4gICAgICB2YXIgYWR5ID0gYTN6ICogYTR4IC0gYTN4ICogYTR6O1xuICAgICAgdmFyIGFkeiA9IGEzeCAqIGE0eSAtIGEzeSAqIGE0eDtcbiAgICAgIHZhciBhZXggPSBhM3kgKiBhNXogLSBhM3ogKiBhNXk7XG4gICAgICB2YXIgYWV5ID0gYTN6ICogYTV4IC0gYTN4ICogYTV6O1xuICAgICAgdmFyIGFleiA9IGEzeCAqIGE1eSAtIGEzeSAqIGE1eDtcbiAgICAgIHZhciBhZnggPSBhM3kgKiBhNnogLSBhM3ogKiBhNnk7XG4gICAgICB2YXIgYWZ5ID0gYTN6ICogYTZ4IC0gYTN4ICogYTZ6O1xuICAgICAgdmFyIGFmeiA9IGEzeCAqIGE2eSAtIGEzeSAqIGE2eDtcbiAgICAgIC8vIHJpZ2h0IG9yIGxlZnQgZmxhZ3NcbiAgICAgIHZhciByaWdodDE7XG4gICAgICB2YXIgcmlnaHQyO1xuICAgICAgdmFyIHJpZ2h0MztcbiAgICAgIHZhciByaWdodDQ7XG4gICAgICB2YXIgcmlnaHQ1O1xuICAgICAgdmFyIHJpZ2h0NjtcbiAgICAgIHZhciByaWdodDc7XG4gICAgICB2YXIgcmlnaHQ4O1xuICAgICAgdmFyIHJpZ2h0OTtcbiAgICAgIHZhciByaWdodGE7XG4gICAgICB2YXIgcmlnaHRiO1xuICAgICAgdmFyIHJpZ2h0YztcbiAgICAgIHZhciByaWdodGQ7XG4gICAgICB2YXIgcmlnaHRlO1xuICAgICAgdmFyIHJpZ2h0ZjtcbiAgICAgIC8vIG92ZXJsYXBwaW5nIGRpc3RhbmNlc1xuICAgICAgdmFyIG92ZXJsYXAxO1xuICAgICAgdmFyIG92ZXJsYXAyO1xuICAgICAgdmFyIG92ZXJsYXAzO1xuICAgICAgdmFyIG92ZXJsYXA0O1xuICAgICAgdmFyIG92ZXJsYXA1O1xuICAgICAgdmFyIG92ZXJsYXA2O1xuICAgICAgdmFyIG92ZXJsYXA3O1xuICAgICAgdmFyIG92ZXJsYXA4O1xuICAgICAgdmFyIG92ZXJsYXA5O1xuICAgICAgdmFyIG92ZXJsYXBhO1xuICAgICAgdmFyIG92ZXJsYXBiO1xuICAgICAgdmFyIG92ZXJsYXBjO1xuICAgICAgdmFyIG92ZXJsYXBkO1xuICAgICAgdmFyIG92ZXJsYXBlO1xuICAgICAgdmFyIG92ZXJsYXBmO1xuICAgICAgLy8gaW52YWxpZCBmbGFnc1xuICAgICAgdmFyIGludmFsaWQ3ID0gZmFsc2U7XG4gICAgICB2YXIgaW52YWxpZDggPSBmYWxzZTtcbiAgICAgIHZhciBpbnZhbGlkOSA9IGZhbHNlO1xuICAgICAgdmFyIGludmFsaWRhID0gZmFsc2U7XG4gICAgICB2YXIgaW52YWxpZGIgPSBmYWxzZTtcbiAgICAgIHZhciBpbnZhbGlkYyA9IGZhbHNlO1xuICAgICAgdmFyIGludmFsaWRkID0gZmFsc2U7XG4gICAgICB2YXIgaW52YWxpZGUgPSBmYWxzZTtcbiAgICAgIHZhciBpbnZhbGlkZiA9IGZhbHNlO1xuICAgICAgLy8gdGVtcG9yYXJ5IHZhcmlhYmxlc1xuICAgICAgdmFyIGxlbjtcbiAgICAgIHZhciBsZW4xO1xuICAgICAgdmFyIGxlbjI7XG4gICAgICB2YXIgZG90MTtcbiAgICAgIHZhciBkb3QyO1xuICAgICAgdmFyIGRvdDM7XG4gICAgICAvLyB0cnkgYXhpcyAxXG4gICAgICBsZW4gPSBhMXggKiBkeCArIGExeSAqIGR5ICsgYTF6ICogZHo7XG4gICAgICByaWdodDEgPSBsZW4gPiAwO1xuICAgICAgaWYgKCFyaWdodDEpIGxlbiA9IC1sZW47XG4gICAgICBsZW4xID0gdzE7XG4gICAgICBkb3QxID0gYTF4ICogYTR4ICsgYTF5ICogYTR5ICsgYTF6ICogYTR6O1xuICAgICAgZG90MiA9IGExeCAqIGE1eCArIGExeSAqIGE1eSArIGExeiAqIGE1ejtcbiAgICAgIGRvdDMgPSBhMXggKiBhNnggKyBhMXkgKiBhNnkgKyBhMXogKiBhNno7XG4gICAgICBpZiAoZG90MSA8IDApIGRvdDEgPSAtZG90MTtcbiAgICAgIGlmIChkb3QyIDwgMCkgZG90MiA9IC1kb3QyO1xuICAgICAgaWYgKGRvdDMgPCAwKSBkb3QzID0gLWRvdDM7XG4gICAgICBsZW4yID0gZG90MSAqIHcyICsgZG90MiAqIGgyICsgZG90MyAqIGQyO1xuICAgICAgb3ZlcmxhcDEgPSBsZW4gLSBsZW4xIC0gbGVuMjtcbiAgICAgIGlmIChvdmVybGFwMSA+IDApIHJldHVybjtcbiAgICAgIC8vIHRyeSBheGlzIDJcbiAgICAgIGxlbiA9IGEyeCAqIGR4ICsgYTJ5ICogZHkgKyBhMnogKiBkejtcbiAgICAgIHJpZ2h0MiA9IGxlbiA+IDA7XG4gICAgICBpZiAoIXJpZ2h0MikgbGVuID0gLWxlbjtcbiAgICAgIGxlbjEgPSBoMTtcbiAgICAgIGRvdDEgPSBhMnggKiBhNHggKyBhMnkgKiBhNHkgKyBhMnogKiBhNHo7XG4gICAgICBkb3QyID0gYTJ4ICogYTV4ICsgYTJ5ICogYTV5ICsgYTJ6ICogYTV6O1xuICAgICAgZG90MyA9IGEyeCAqIGE2eCArIGEyeSAqIGE2eSArIGEyeiAqIGE2ejtcbiAgICAgIGlmIChkb3QxIDwgMCkgZG90MSA9IC1kb3QxO1xuICAgICAgaWYgKGRvdDIgPCAwKSBkb3QyID0gLWRvdDI7XG4gICAgICBpZiAoZG90MyA8IDApIGRvdDMgPSAtZG90MztcbiAgICAgIGxlbjIgPSBkb3QxICogdzIgKyBkb3QyICogaDIgKyBkb3QzICogZDI7XG4gICAgICBvdmVybGFwMiA9IGxlbiAtIGxlbjEgLSBsZW4yO1xuICAgICAgaWYgKG92ZXJsYXAyID4gMCkgcmV0dXJuO1xuICAgICAgLy8gdHJ5IGF4aXMgM1xuICAgICAgbGVuID0gYTN4ICogZHggKyBhM3kgKiBkeSArIGEzeiAqIGR6O1xuICAgICAgcmlnaHQzID0gbGVuID4gMDtcbiAgICAgIGlmICghcmlnaHQzKSBsZW4gPSAtbGVuO1xuICAgICAgbGVuMSA9IGQxO1xuICAgICAgZG90MSA9IGEzeCAqIGE0eCArIGEzeSAqIGE0eSArIGEzeiAqIGE0ejtcbiAgICAgIGRvdDIgPSBhM3ggKiBhNXggKyBhM3kgKiBhNXkgKyBhM3ogKiBhNXo7XG4gICAgICBkb3QzID0gYTN4ICogYTZ4ICsgYTN5ICogYTZ5ICsgYTN6ICogYTZ6O1xuICAgICAgaWYgKGRvdDEgPCAwKSBkb3QxID0gLWRvdDE7XG4gICAgICBpZiAoZG90MiA8IDApIGRvdDIgPSAtZG90MjtcbiAgICAgIGlmIChkb3QzIDwgMCkgZG90MyA9IC1kb3QzO1xuICAgICAgbGVuMiA9IGRvdDEgKiB3MiArIGRvdDIgKiBoMiArIGRvdDMgKiBkMjtcbiAgICAgIG92ZXJsYXAzID0gbGVuIC0gbGVuMSAtIGxlbjI7XG4gICAgICBpZiAob3ZlcmxhcDMgPiAwKSByZXR1cm47XG4gICAgICAvLyB0cnkgYXhpcyA0XG4gICAgICBsZW4gPSBhNHggKiBkeCArIGE0eSAqIGR5ICsgYTR6ICogZHo7XG4gICAgICByaWdodDQgPSBsZW4gPiAwO1xuICAgICAgaWYgKCFyaWdodDQpIGxlbiA9IC1sZW47XG4gICAgICBkb3QxID0gYTR4ICogYTF4ICsgYTR5ICogYTF5ICsgYTR6ICogYTF6O1xuICAgICAgZG90MiA9IGE0eCAqIGEyeCArIGE0eSAqIGEyeSArIGE0eiAqIGEyejtcbiAgICAgIGRvdDMgPSBhNHggKiBhM3ggKyBhNHkgKiBhM3kgKyBhNHogKiBhM3o7XG4gICAgICBpZiAoZG90MSA8IDApIGRvdDEgPSAtZG90MTtcbiAgICAgIGlmIChkb3QyIDwgMCkgZG90MiA9IC1kb3QyO1xuICAgICAgaWYgKGRvdDMgPCAwKSBkb3QzID0gLWRvdDM7XG4gICAgICBsZW4xID0gZG90MSAqIHcxICsgZG90MiAqIGgxICsgZG90MyAqIGQxO1xuICAgICAgbGVuMiA9IHcyO1xuICAgICAgb3ZlcmxhcDQgPSAobGVuIC0gbGVuMSAtIGxlbjIpICogMS4wO1xuICAgICAgaWYgKG92ZXJsYXA0ID4gMCkgcmV0dXJuO1xuICAgICAgLy8gdHJ5IGF4aXMgNVxuICAgICAgbGVuID0gYTV4ICogZHggKyBhNXkgKiBkeSArIGE1eiAqIGR6O1xuICAgICAgcmlnaHQ1ID0gbGVuID4gMDtcbiAgICAgIGlmICghcmlnaHQ1KSBsZW4gPSAtbGVuO1xuICAgICAgZG90MSA9IGE1eCAqIGExeCArIGE1eSAqIGExeSArIGE1eiAqIGExejtcbiAgICAgIGRvdDIgPSBhNXggKiBhMnggKyBhNXkgKiBhMnkgKyBhNXogKiBhMno7XG4gICAgICBkb3QzID0gYTV4ICogYTN4ICsgYTV5ICogYTN5ICsgYTV6ICogYTN6O1xuICAgICAgaWYgKGRvdDEgPCAwKSBkb3QxID0gLWRvdDE7XG4gICAgICBpZiAoZG90MiA8IDApIGRvdDIgPSAtZG90MjtcbiAgICAgIGlmIChkb3QzIDwgMCkgZG90MyA9IC1kb3QzO1xuICAgICAgbGVuMSA9IGRvdDEgKiB3MSArIGRvdDIgKiBoMSArIGRvdDMgKiBkMTtcbiAgICAgIGxlbjIgPSBoMjtcbiAgICAgIG92ZXJsYXA1ID0gKGxlbiAtIGxlbjEgLSBsZW4yKSAqIDEuMDtcbiAgICAgIGlmIChvdmVybGFwNSA+IDApIHJldHVybjtcbiAgICAgIC8vIHRyeSBheGlzIDZcbiAgICAgIGxlbiA9IGE2eCAqIGR4ICsgYTZ5ICogZHkgKyBhNnogKiBkejtcbiAgICAgIHJpZ2h0NiA9IGxlbiA+IDA7XG4gICAgICBpZiAoIXJpZ2h0NikgbGVuID0gLWxlbjtcbiAgICAgIGRvdDEgPSBhNnggKiBhMXggKyBhNnkgKiBhMXkgKyBhNnogKiBhMXo7XG4gICAgICBkb3QyID0gYTZ4ICogYTJ4ICsgYTZ5ICogYTJ5ICsgYTZ6ICogYTJ6O1xuICAgICAgZG90MyA9IGE2eCAqIGEzeCArIGE2eSAqIGEzeSArIGE2eiAqIGEzejtcbiAgICAgIGlmIChkb3QxIDwgMCkgZG90MSA9IC1kb3QxO1xuICAgICAgaWYgKGRvdDIgPCAwKSBkb3QyID0gLWRvdDI7XG4gICAgICBpZiAoZG90MyA8IDApIGRvdDMgPSAtZG90MztcbiAgICAgIGxlbjEgPSBkb3QxICogdzEgKyBkb3QyICogaDEgKyBkb3QzICogZDE7XG4gICAgICBsZW4yID0gZDI7XG4gICAgICBvdmVybGFwNiA9IChsZW4gLSBsZW4xIC0gbGVuMikgKiAxLjA7XG4gICAgICBpZiAob3ZlcmxhcDYgPiAwKSByZXR1cm47XG4gICAgICAvLyB0cnkgYXhpcyA3XG4gICAgICBsZW4gPSBhN3ggKiBhN3ggKyBhN3kgKiBhN3kgKyBhN3ogKiBhN3o7XG4gICAgICBpZiAobGVuID4gMWUtNSkge1xuICAgICAgICBsZW4gPSAxIC8gX01hdGguc3FydChsZW4pO1xuICAgICAgICBhN3ggKj0gbGVuO1xuICAgICAgICBhN3kgKj0gbGVuO1xuICAgICAgICBhN3ogKj0gbGVuO1xuICAgICAgICBsZW4gPSBhN3ggKiBkeCArIGE3eSAqIGR5ICsgYTd6ICogZHo7XG4gICAgICAgIHJpZ2h0NyA9IGxlbiA+IDA7XG4gICAgICAgIGlmICghcmlnaHQ3KSBsZW4gPSAtbGVuO1xuICAgICAgICBkb3QxID0gYTd4ICogYTJ4ICsgYTd5ICogYTJ5ICsgYTd6ICogYTJ6O1xuICAgICAgICBkb3QyID0gYTd4ICogYTN4ICsgYTd5ICogYTN5ICsgYTd6ICogYTN6O1xuICAgICAgICBpZiAoZG90MSA8IDApIGRvdDEgPSAtZG90MTtcbiAgICAgICAgaWYgKGRvdDIgPCAwKSBkb3QyID0gLWRvdDI7XG4gICAgICAgIGxlbjEgPSBkb3QxICogaDEgKyBkb3QyICogZDE7XG4gICAgICAgIGRvdDEgPSBhN3ggKiBhNXggKyBhN3kgKiBhNXkgKyBhN3ogKiBhNXo7XG4gICAgICAgIGRvdDIgPSBhN3ggKiBhNnggKyBhN3kgKiBhNnkgKyBhN3ogKiBhNno7XG4gICAgICAgIGlmIChkb3QxIDwgMCkgZG90MSA9IC1kb3QxO1xuICAgICAgICBpZiAoZG90MiA8IDApIGRvdDIgPSAtZG90MjtcbiAgICAgICAgbGVuMiA9IGRvdDEgKiBoMiArIGRvdDIgKiBkMjtcbiAgICAgICAgb3ZlcmxhcDcgPSBsZW4gLSBsZW4xIC0gbGVuMjtcbiAgICAgICAgaWYgKG92ZXJsYXA3ID4gMCkgcmV0dXJuO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmlnaHQ3ID0gZmFsc2U7XG4gICAgICAgIG92ZXJsYXA3ID0gMDtcbiAgICAgICAgaW52YWxpZDcgPSB0cnVlO1xuICAgICAgfVxuICAgICAgLy8gdHJ5IGF4aXMgOFxuICAgICAgbGVuID0gYTh4ICogYTh4ICsgYTh5ICogYTh5ICsgYTh6ICogYTh6O1xuICAgICAgaWYgKGxlbiA+IDFlLTUpIHtcbiAgICAgICAgbGVuID0gMSAvIF9NYXRoLnNxcnQobGVuKTtcbiAgICAgICAgYTh4ICo9IGxlbjtcbiAgICAgICAgYTh5ICo9IGxlbjtcbiAgICAgICAgYTh6ICo9IGxlbjtcbiAgICAgICAgbGVuID0gYTh4ICogZHggKyBhOHkgKiBkeSArIGE4eiAqIGR6O1xuICAgICAgICByaWdodDggPSBsZW4gPiAwO1xuICAgICAgICBpZiAoIXJpZ2h0OCkgbGVuID0gLWxlbjtcbiAgICAgICAgZG90MSA9IGE4eCAqIGEyeCArIGE4eSAqIGEyeSArIGE4eiAqIGEyejtcbiAgICAgICAgZG90MiA9IGE4eCAqIGEzeCArIGE4eSAqIGEzeSArIGE4eiAqIGEzejtcbiAgICAgICAgaWYgKGRvdDEgPCAwKSBkb3QxID0gLWRvdDE7XG4gICAgICAgIGlmIChkb3QyIDwgMCkgZG90MiA9IC1kb3QyO1xuICAgICAgICBsZW4xID0gZG90MSAqIGgxICsgZG90MiAqIGQxO1xuICAgICAgICBkb3QxID0gYTh4ICogYTR4ICsgYTh5ICogYTR5ICsgYTh6ICogYTR6O1xuICAgICAgICBkb3QyID0gYTh4ICogYTZ4ICsgYTh5ICogYTZ5ICsgYTh6ICogYTZ6O1xuICAgICAgICBpZiAoZG90MSA8IDApIGRvdDEgPSAtZG90MTtcbiAgICAgICAgaWYgKGRvdDIgPCAwKSBkb3QyID0gLWRvdDI7XG4gICAgICAgIGxlbjIgPSBkb3QxICogdzIgKyBkb3QyICogZDI7XG4gICAgICAgIG92ZXJsYXA4ID0gbGVuIC0gbGVuMSAtIGxlbjI7XG4gICAgICAgIGlmIChvdmVybGFwOCA+IDApIHJldHVybjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJpZ2h0OCA9IGZhbHNlO1xuICAgICAgICBvdmVybGFwOCA9IDA7XG4gICAgICAgIGludmFsaWQ4ID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIC8vIHRyeSBheGlzIDlcbiAgICAgIGxlbiA9IGE5eCAqIGE5eCArIGE5eSAqIGE5eSArIGE5eiAqIGE5ejtcbiAgICAgIGlmIChsZW4gPiAxZS01KSB7XG4gICAgICAgIGxlbiA9IDEgLyBfTWF0aC5zcXJ0KGxlbik7XG4gICAgICAgIGE5eCAqPSBsZW47XG4gICAgICAgIGE5eSAqPSBsZW47XG4gICAgICAgIGE5eiAqPSBsZW47XG4gICAgICAgIGxlbiA9IGE5eCAqIGR4ICsgYTl5ICogZHkgKyBhOXogKiBkejtcbiAgICAgICAgcmlnaHQ5ID0gbGVuID4gMDtcbiAgICAgICAgaWYgKCFyaWdodDkpIGxlbiA9IC1sZW47XG4gICAgICAgIGRvdDEgPSBhOXggKiBhMnggKyBhOXkgKiBhMnkgKyBhOXogKiBhMno7XG4gICAgICAgIGRvdDIgPSBhOXggKiBhM3ggKyBhOXkgKiBhM3kgKyBhOXogKiBhM3o7XG4gICAgICAgIGlmIChkb3QxIDwgMCkgZG90MSA9IC1kb3QxO1xuICAgICAgICBpZiAoZG90MiA8IDApIGRvdDIgPSAtZG90MjtcbiAgICAgICAgbGVuMSA9IGRvdDEgKiBoMSArIGRvdDIgKiBkMTtcbiAgICAgICAgZG90MSA9IGE5eCAqIGE0eCArIGE5eSAqIGE0eSArIGE5eiAqIGE0ejtcbiAgICAgICAgZG90MiA9IGE5eCAqIGE1eCArIGE5eSAqIGE1eSArIGE5eiAqIGE1ejtcbiAgICAgICAgaWYgKGRvdDEgPCAwKSBkb3QxID0gLWRvdDE7XG4gICAgICAgIGlmIChkb3QyIDwgMCkgZG90MiA9IC1kb3QyO1xuICAgICAgICBsZW4yID0gZG90MSAqIHcyICsgZG90MiAqIGgyO1xuICAgICAgICBvdmVybGFwOSA9IGxlbiAtIGxlbjEgLSBsZW4yO1xuICAgICAgICBpZiAob3ZlcmxhcDkgPiAwKSByZXR1cm47XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByaWdodDkgPSBmYWxzZTtcbiAgICAgICAgb3ZlcmxhcDkgPSAwO1xuICAgICAgICBpbnZhbGlkOSA9IHRydWU7XG4gICAgICB9XG4gICAgICAvLyB0cnkgYXhpcyAxMFxuICAgICAgbGVuID0gYWF4ICogYWF4ICsgYWF5ICogYWF5ICsgYWF6ICogYWF6O1xuICAgICAgaWYgKGxlbiA+IDFlLTUpIHtcbiAgICAgICAgbGVuID0gMSAvIF9NYXRoLnNxcnQobGVuKTtcbiAgICAgICAgYWF4ICo9IGxlbjtcbiAgICAgICAgYWF5ICo9IGxlbjtcbiAgICAgICAgYWF6ICo9IGxlbjtcbiAgICAgICAgbGVuID0gYWF4ICogZHggKyBhYXkgKiBkeSArIGFheiAqIGR6O1xuICAgICAgICByaWdodGEgPSBsZW4gPiAwO1xuICAgICAgICBpZiAoIXJpZ2h0YSkgbGVuID0gLWxlbjtcbiAgICAgICAgZG90MSA9IGFheCAqIGExeCArIGFheSAqIGExeSArIGFheiAqIGExejtcbiAgICAgICAgZG90MiA9IGFheCAqIGEzeCArIGFheSAqIGEzeSArIGFheiAqIGEzejtcbiAgICAgICAgaWYgKGRvdDEgPCAwKSBkb3QxID0gLWRvdDE7XG4gICAgICAgIGlmIChkb3QyIDwgMCkgZG90MiA9IC1kb3QyO1xuICAgICAgICBsZW4xID0gZG90MSAqIHcxICsgZG90MiAqIGQxO1xuICAgICAgICBkb3QxID0gYWF4ICogYTV4ICsgYWF5ICogYTV5ICsgYWF6ICogYTV6O1xuICAgICAgICBkb3QyID0gYWF4ICogYTZ4ICsgYWF5ICogYTZ5ICsgYWF6ICogYTZ6O1xuICAgICAgICBpZiAoZG90MSA8IDApIGRvdDEgPSAtZG90MTtcbiAgICAgICAgaWYgKGRvdDIgPCAwKSBkb3QyID0gLWRvdDI7XG4gICAgICAgIGxlbjIgPSBkb3QxICogaDIgKyBkb3QyICogZDI7XG4gICAgICAgIG92ZXJsYXBhID0gbGVuIC0gbGVuMSAtIGxlbjI7XG4gICAgICAgIGlmIChvdmVybGFwYSA+IDApIHJldHVybjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJpZ2h0YSA9IGZhbHNlO1xuICAgICAgICBvdmVybGFwYSA9IDA7XG4gICAgICAgIGludmFsaWRhID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIC8vIHRyeSBheGlzIDExXG4gICAgICBsZW4gPSBhYnggKiBhYnggKyBhYnkgKiBhYnkgKyBhYnogKiBhYno7XG4gICAgICBpZiAobGVuID4gMWUtNSkge1xuICAgICAgICBsZW4gPSAxIC8gX01hdGguc3FydChsZW4pO1xuICAgICAgICBhYnggKj0gbGVuO1xuICAgICAgICBhYnkgKj0gbGVuO1xuICAgICAgICBhYnogKj0gbGVuO1xuICAgICAgICBsZW4gPSBhYnggKiBkeCArIGFieSAqIGR5ICsgYWJ6ICogZHo7XG4gICAgICAgIHJpZ2h0YiA9IGxlbiA+IDA7XG4gICAgICAgIGlmICghcmlnaHRiKSBsZW4gPSAtbGVuO1xuICAgICAgICBkb3QxID0gYWJ4ICogYTF4ICsgYWJ5ICogYTF5ICsgYWJ6ICogYTF6O1xuICAgICAgICBkb3QyID0gYWJ4ICogYTN4ICsgYWJ5ICogYTN5ICsgYWJ6ICogYTN6O1xuICAgICAgICBpZiAoZG90MSA8IDApIGRvdDEgPSAtZG90MTtcbiAgICAgICAgaWYgKGRvdDIgPCAwKSBkb3QyID0gLWRvdDI7XG4gICAgICAgIGxlbjEgPSBkb3QxICogdzEgKyBkb3QyICogZDE7XG4gICAgICAgIGRvdDEgPSBhYnggKiBhNHggKyBhYnkgKiBhNHkgKyBhYnogKiBhNHo7XG4gICAgICAgIGRvdDIgPSBhYnggKiBhNnggKyBhYnkgKiBhNnkgKyBhYnogKiBhNno7XG4gICAgICAgIGlmIChkb3QxIDwgMCkgZG90MSA9IC1kb3QxO1xuICAgICAgICBpZiAoZG90MiA8IDApIGRvdDIgPSAtZG90MjtcbiAgICAgICAgbGVuMiA9IGRvdDEgKiB3MiArIGRvdDIgKiBkMjtcbiAgICAgICAgb3ZlcmxhcGIgPSBsZW4gLSBsZW4xIC0gbGVuMjtcbiAgICAgICAgaWYgKG92ZXJsYXBiID4gMCkgcmV0dXJuO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmlnaHRiID0gZmFsc2U7XG4gICAgICAgIG92ZXJsYXBiID0gMDtcbiAgICAgICAgaW52YWxpZGIgPSB0cnVlO1xuICAgICAgfVxuICAgICAgLy8gdHJ5IGF4aXMgMTJcbiAgICAgIGxlbiA9IGFjeCAqIGFjeCArIGFjeSAqIGFjeSArIGFjeiAqIGFjejtcbiAgICAgIGlmIChsZW4gPiAxZS01KSB7XG4gICAgICAgIGxlbiA9IDEgLyBfTWF0aC5zcXJ0KGxlbik7XG4gICAgICAgIGFjeCAqPSBsZW47XG4gICAgICAgIGFjeSAqPSBsZW47XG4gICAgICAgIGFjeiAqPSBsZW47XG4gICAgICAgIGxlbiA9IGFjeCAqIGR4ICsgYWN5ICogZHkgKyBhY3ogKiBkejtcbiAgICAgICAgcmlnaHRjID0gbGVuID4gMDtcbiAgICAgICAgaWYgKCFyaWdodGMpIGxlbiA9IC1sZW47XG4gICAgICAgIGRvdDEgPSBhY3ggKiBhMXggKyBhY3kgKiBhMXkgKyBhY3ogKiBhMXo7XG4gICAgICAgIGRvdDIgPSBhY3ggKiBhM3ggKyBhY3kgKiBhM3kgKyBhY3ogKiBhM3o7XG4gICAgICAgIGlmIChkb3QxIDwgMCkgZG90MSA9IC1kb3QxO1xuICAgICAgICBpZiAoZG90MiA8IDApIGRvdDIgPSAtZG90MjtcbiAgICAgICAgbGVuMSA9IGRvdDEgKiB3MSArIGRvdDIgKiBkMTtcbiAgICAgICAgZG90MSA9IGFjeCAqIGE0eCArIGFjeSAqIGE0eSArIGFjeiAqIGE0ejtcbiAgICAgICAgZG90MiA9IGFjeCAqIGE1eCArIGFjeSAqIGE1eSArIGFjeiAqIGE1ejtcbiAgICAgICAgaWYgKGRvdDEgPCAwKSBkb3QxID0gLWRvdDE7XG4gICAgICAgIGlmIChkb3QyIDwgMCkgZG90MiA9IC1kb3QyO1xuICAgICAgICBsZW4yID0gZG90MSAqIHcyICsgZG90MiAqIGgyO1xuICAgICAgICBvdmVybGFwYyA9IGxlbiAtIGxlbjEgLSBsZW4yO1xuICAgICAgICBpZiAob3ZlcmxhcGMgPiAwKSByZXR1cm47XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByaWdodGMgPSBmYWxzZTtcbiAgICAgICAgb3ZlcmxhcGMgPSAwO1xuICAgICAgICBpbnZhbGlkYyA9IHRydWU7XG4gICAgICB9XG4gICAgICAvLyB0cnkgYXhpcyAxM1xuICAgICAgbGVuID0gYWR4ICogYWR4ICsgYWR5ICogYWR5ICsgYWR6ICogYWR6O1xuICAgICAgaWYgKGxlbiA+IDFlLTUpIHtcbiAgICAgICAgbGVuID0gMSAvIF9NYXRoLnNxcnQobGVuKTtcbiAgICAgICAgYWR4ICo9IGxlbjtcbiAgICAgICAgYWR5ICo9IGxlbjtcbiAgICAgICAgYWR6ICo9IGxlbjtcbiAgICAgICAgbGVuID0gYWR4ICogZHggKyBhZHkgKiBkeSArIGFkeiAqIGR6O1xuICAgICAgICByaWdodGQgPSBsZW4gPiAwO1xuICAgICAgICBpZiAoIXJpZ2h0ZCkgbGVuID0gLWxlbjtcbiAgICAgICAgZG90MSA9IGFkeCAqIGExeCArIGFkeSAqIGExeSArIGFkeiAqIGExejtcbiAgICAgICAgZG90MiA9IGFkeCAqIGEyeCArIGFkeSAqIGEyeSArIGFkeiAqIGEyejtcbiAgICAgICAgaWYgKGRvdDEgPCAwKSBkb3QxID0gLWRvdDE7XG4gICAgICAgIGlmIChkb3QyIDwgMCkgZG90MiA9IC1kb3QyO1xuICAgICAgICBsZW4xID0gZG90MSAqIHcxICsgZG90MiAqIGgxO1xuICAgICAgICBkb3QxID0gYWR4ICogYTV4ICsgYWR5ICogYTV5ICsgYWR6ICogYTV6O1xuICAgICAgICBkb3QyID0gYWR4ICogYTZ4ICsgYWR5ICogYTZ5ICsgYWR6ICogYTZ6O1xuICAgICAgICBpZiAoZG90MSA8IDApIGRvdDEgPSAtZG90MTtcbiAgICAgICAgaWYgKGRvdDIgPCAwKSBkb3QyID0gLWRvdDI7XG4gICAgICAgIGxlbjIgPSBkb3QxICogaDIgKyBkb3QyICogZDI7XG4gICAgICAgIG92ZXJsYXBkID0gbGVuIC0gbGVuMSAtIGxlbjI7XG4gICAgICAgIGlmIChvdmVybGFwZCA+IDApIHJldHVybjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJpZ2h0ZCA9IGZhbHNlO1xuICAgICAgICBvdmVybGFwZCA9IDA7XG4gICAgICAgIGludmFsaWRkID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIC8vIHRyeSBheGlzIDE0XG4gICAgICBsZW4gPSBhZXggKiBhZXggKyBhZXkgKiBhZXkgKyBhZXogKiBhZXo7XG4gICAgICBpZiAobGVuID4gMWUtNSkge1xuICAgICAgICBsZW4gPSAxIC8gX01hdGguc3FydChsZW4pO1xuICAgICAgICBhZXggKj0gbGVuO1xuICAgICAgICBhZXkgKj0gbGVuO1xuICAgICAgICBhZXogKj0gbGVuO1xuICAgICAgICBsZW4gPSBhZXggKiBkeCArIGFleSAqIGR5ICsgYWV6ICogZHo7XG4gICAgICAgIHJpZ2h0ZSA9IGxlbiA+IDA7XG4gICAgICAgIGlmICghcmlnaHRlKSBsZW4gPSAtbGVuO1xuICAgICAgICBkb3QxID0gYWV4ICogYTF4ICsgYWV5ICogYTF5ICsgYWV6ICogYTF6O1xuICAgICAgICBkb3QyID0gYWV4ICogYTJ4ICsgYWV5ICogYTJ5ICsgYWV6ICogYTJ6O1xuICAgICAgICBpZiAoZG90MSA8IDApIGRvdDEgPSAtZG90MTtcbiAgICAgICAgaWYgKGRvdDIgPCAwKSBkb3QyID0gLWRvdDI7XG4gICAgICAgIGxlbjEgPSBkb3QxICogdzEgKyBkb3QyICogaDE7XG4gICAgICAgIGRvdDEgPSBhZXggKiBhNHggKyBhZXkgKiBhNHkgKyBhZXogKiBhNHo7XG4gICAgICAgIGRvdDIgPSBhZXggKiBhNnggKyBhZXkgKiBhNnkgKyBhZXogKiBhNno7XG4gICAgICAgIGlmIChkb3QxIDwgMCkgZG90MSA9IC1kb3QxO1xuICAgICAgICBpZiAoZG90MiA8IDApIGRvdDIgPSAtZG90MjtcbiAgICAgICAgbGVuMiA9IGRvdDEgKiB3MiArIGRvdDIgKiBkMjtcbiAgICAgICAgb3ZlcmxhcGUgPSBsZW4gLSBsZW4xIC0gbGVuMjtcbiAgICAgICAgaWYgKG92ZXJsYXBlID4gMCkgcmV0dXJuO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmlnaHRlID0gZmFsc2U7XG4gICAgICAgIG92ZXJsYXBlID0gMDtcbiAgICAgICAgaW52YWxpZGUgPSB0cnVlO1xuICAgICAgfVxuICAgICAgLy8gdHJ5IGF4aXMgMTVcbiAgICAgIGxlbiA9IGFmeCAqIGFmeCArIGFmeSAqIGFmeSArIGFmeiAqIGFmejtcbiAgICAgIGlmIChsZW4gPiAxZS01KSB7XG4gICAgICAgIGxlbiA9IDEgLyBfTWF0aC5zcXJ0KGxlbik7XG4gICAgICAgIGFmeCAqPSBsZW47XG4gICAgICAgIGFmeSAqPSBsZW47XG4gICAgICAgIGFmeiAqPSBsZW47XG4gICAgICAgIGxlbiA9IGFmeCAqIGR4ICsgYWZ5ICogZHkgKyBhZnogKiBkejtcbiAgICAgICAgcmlnaHRmID0gbGVuID4gMDtcbiAgICAgICAgaWYgKCFyaWdodGYpIGxlbiA9IC1sZW47XG4gICAgICAgIGRvdDEgPSBhZnggKiBhMXggKyBhZnkgKiBhMXkgKyBhZnogKiBhMXo7XG4gICAgICAgIGRvdDIgPSBhZnggKiBhMnggKyBhZnkgKiBhMnkgKyBhZnogKiBhMno7XG4gICAgICAgIGlmIChkb3QxIDwgMCkgZG90MSA9IC1kb3QxO1xuICAgICAgICBpZiAoZG90MiA8IDApIGRvdDIgPSAtZG90MjtcbiAgICAgICAgbGVuMSA9IGRvdDEgKiB3MSArIGRvdDIgKiBoMTtcbiAgICAgICAgZG90MSA9IGFmeCAqIGE0eCArIGFmeSAqIGE0eSArIGFmeiAqIGE0ejtcbiAgICAgICAgZG90MiA9IGFmeCAqIGE1eCArIGFmeSAqIGE1eSArIGFmeiAqIGE1ejtcbiAgICAgICAgaWYgKGRvdDEgPCAwKSBkb3QxID0gLWRvdDE7XG4gICAgICAgIGlmIChkb3QyIDwgMCkgZG90MiA9IC1kb3QyO1xuICAgICAgICBsZW4yID0gZG90MSAqIHcyICsgZG90MiAqIGgyO1xuICAgICAgICBvdmVybGFwZiA9IGxlbiAtIGxlbjEgLSBsZW4yO1xuICAgICAgICBpZiAob3ZlcmxhcGYgPiAwKSByZXR1cm47XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByaWdodGYgPSBmYWxzZTtcbiAgICAgICAgb3ZlcmxhcGYgPSAwO1xuICAgICAgICBpbnZhbGlkZiA9IHRydWU7XG4gICAgICB9XG4gICAgICAvLyBib3hlcyBhcmUgb3ZlcmxhcHBpbmdcbiAgICAgIHZhciBkZXB0aCA9IG92ZXJsYXAxO1xuICAgICAgdmFyIGRlcHRoMiA9IG92ZXJsYXAxO1xuICAgICAgdmFyIG1pbkluZGV4ID0gMDtcbiAgICAgIHZhciByaWdodCA9IHJpZ2h0MTtcbiAgICAgIGlmIChvdmVybGFwMiA+IGRlcHRoMikge1xuICAgICAgICBkZXB0aCA9IG92ZXJsYXAyO1xuICAgICAgICBkZXB0aDIgPSBvdmVybGFwMjtcbiAgICAgICAgbWluSW5kZXggPSAxO1xuICAgICAgICByaWdodCA9IHJpZ2h0MjtcbiAgICAgIH1cbiAgICAgIGlmIChvdmVybGFwMyA+IGRlcHRoMikge1xuICAgICAgICBkZXB0aCA9IG92ZXJsYXAzO1xuICAgICAgICBkZXB0aDIgPSBvdmVybGFwMztcbiAgICAgICAgbWluSW5kZXggPSAyO1xuICAgICAgICByaWdodCA9IHJpZ2h0MztcbiAgICAgIH1cbiAgICAgIGlmIChvdmVybGFwNCA+IGRlcHRoMikge1xuICAgICAgICBkZXB0aCA9IG92ZXJsYXA0O1xuICAgICAgICBkZXB0aDIgPSBvdmVybGFwNDtcbiAgICAgICAgbWluSW5kZXggPSAzO1xuICAgICAgICByaWdodCA9IHJpZ2h0NDtcbiAgICAgIH1cbiAgICAgIGlmIChvdmVybGFwNSA+IGRlcHRoMikge1xuICAgICAgICBkZXB0aCA9IG92ZXJsYXA1O1xuICAgICAgICBkZXB0aDIgPSBvdmVybGFwNTtcbiAgICAgICAgbWluSW5kZXggPSA0O1xuICAgICAgICByaWdodCA9IHJpZ2h0NTtcbiAgICAgIH1cbiAgICAgIGlmIChvdmVybGFwNiA+IGRlcHRoMikge1xuICAgICAgICBkZXB0aCA9IG92ZXJsYXA2O1xuICAgICAgICBkZXB0aDIgPSBvdmVybGFwNjtcbiAgICAgICAgbWluSW5kZXggPSA1O1xuICAgICAgICByaWdodCA9IHJpZ2h0NjtcbiAgICAgIH1cbiAgICAgIGlmIChvdmVybGFwNyAtIDAuMDEgPiBkZXB0aDIgJiYgIWludmFsaWQ3KSB7XG4gICAgICAgIGRlcHRoID0gb3ZlcmxhcDc7XG4gICAgICAgIGRlcHRoMiA9IG92ZXJsYXA3IC0gMC4wMTtcbiAgICAgICAgbWluSW5kZXggPSA2O1xuICAgICAgICByaWdodCA9IHJpZ2h0NztcbiAgICAgIH1cbiAgICAgIGlmIChvdmVybGFwOCAtIDAuMDEgPiBkZXB0aDIgJiYgIWludmFsaWQ4KSB7XG4gICAgICAgIGRlcHRoID0gb3ZlcmxhcDg7XG4gICAgICAgIGRlcHRoMiA9IG92ZXJsYXA4IC0gMC4wMTtcbiAgICAgICAgbWluSW5kZXggPSA3O1xuICAgICAgICByaWdodCA9IHJpZ2h0ODtcbiAgICAgIH1cbiAgICAgIGlmIChvdmVybGFwOSAtIDAuMDEgPiBkZXB0aDIgJiYgIWludmFsaWQ5KSB7XG4gICAgICAgIGRlcHRoID0gb3ZlcmxhcDk7XG4gICAgICAgIGRlcHRoMiA9IG92ZXJsYXA5IC0gMC4wMTtcbiAgICAgICAgbWluSW5kZXggPSA4O1xuICAgICAgICByaWdodCA9IHJpZ2h0OTtcbiAgICAgIH1cbiAgICAgIGlmIChvdmVybGFwYSAtIDAuMDEgPiBkZXB0aDIgJiYgIWludmFsaWRhKSB7XG4gICAgICAgIGRlcHRoID0gb3ZlcmxhcGE7XG4gICAgICAgIGRlcHRoMiA9IG92ZXJsYXBhIC0gMC4wMTtcbiAgICAgICAgbWluSW5kZXggPSA5O1xuICAgICAgICByaWdodCA9IHJpZ2h0YTtcbiAgICAgIH1cbiAgICAgIGlmIChvdmVybGFwYiAtIDAuMDEgPiBkZXB0aDIgJiYgIWludmFsaWRiKSB7XG4gICAgICAgIGRlcHRoID0gb3ZlcmxhcGI7XG4gICAgICAgIGRlcHRoMiA9IG92ZXJsYXBiIC0gMC4wMTtcbiAgICAgICAgbWluSW5kZXggPSAxMDtcbiAgICAgICAgcmlnaHQgPSByaWdodGI7XG4gICAgICB9XG4gICAgICBpZiAob3ZlcmxhcGMgLSAwLjAxID4gZGVwdGgyICYmICFpbnZhbGlkYykge1xuICAgICAgICBkZXB0aCA9IG92ZXJsYXBjO1xuICAgICAgICBkZXB0aDIgPSBvdmVybGFwYyAtIDAuMDE7XG4gICAgICAgIG1pbkluZGV4ID0gMTE7XG4gICAgICAgIHJpZ2h0ID0gcmlnaHRjO1xuICAgICAgfVxuICAgICAgaWYgKG92ZXJsYXBkIC0gMC4wMSA+IGRlcHRoMiAmJiAhaW52YWxpZGQpIHtcbiAgICAgICAgZGVwdGggPSBvdmVybGFwZDtcbiAgICAgICAgZGVwdGgyID0gb3ZlcmxhcGQgLSAwLjAxO1xuICAgICAgICBtaW5JbmRleCA9IDEyO1xuICAgICAgICByaWdodCA9IHJpZ2h0ZDtcbiAgICAgIH1cbiAgICAgIGlmIChvdmVybGFwZSAtIDAuMDEgPiBkZXB0aDIgJiYgIWludmFsaWRlKSB7XG4gICAgICAgIGRlcHRoID0gb3ZlcmxhcGU7XG4gICAgICAgIGRlcHRoMiA9IG92ZXJsYXBlIC0gMC4wMTtcbiAgICAgICAgbWluSW5kZXggPSAxMztcbiAgICAgICAgcmlnaHQgPSByaWdodGU7XG4gICAgICB9XG4gICAgICBpZiAob3ZlcmxhcGYgLSAwLjAxID4gZGVwdGgyICYmICFpbnZhbGlkZikge1xuICAgICAgICBkZXB0aCA9IG92ZXJsYXBmO1xuICAgICAgICBtaW5JbmRleCA9IDE0O1xuICAgICAgICByaWdodCA9IHJpZ2h0ZjtcbiAgICAgIH1cbiAgICAgIC8vIG5vcm1hbFxuICAgICAgdmFyIG54ID0gMDtcbiAgICAgIHZhciBueSA9IDA7XG4gICAgICB2YXIgbnogPSAwO1xuICAgICAgLy8gZWRnZSBsaW5lIG9yIGZhY2Ugc2lkZSBub3JtYWxcbiAgICAgIHZhciBuMXggPSAwO1xuICAgICAgdmFyIG4xeSA9IDA7XG4gICAgICB2YXIgbjF6ID0gMDtcbiAgICAgIHZhciBuMnggPSAwO1xuICAgICAgdmFyIG4yeSA9IDA7XG4gICAgICB2YXIgbjJ6ID0gMDtcbiAgICAgIC8vIGNlbnRlciBvZiBjdXJyZW50IGZhY2VcbiAgICAgIHZhciBjeCA9IDA7XG4gICAgICB2YXIgY3kgPSAwO1xuICAgICAgdmFyIGN6ID0gMDtcbiAgICAgIC8vIGZhY2Ugc2lkZVxuICAgICAgdmFyIHMxeCA9IDA7XG4gICAgICB2YXIgczF5ID0gMDtcbiAgICAgIHZhciBzMXogPSAwO1xuICAgICAgdmFyIHMyeCA9IDA7XG4gICAgICB2YXIgczJ5ID0gMDtcbiAgICAgIHZhciBzMnogPSAwO1xuICAgICAgLy8gc3dhcCBiMSBiMlxuICAgICAgdmFyIHN3YXAgPSBmYWxzZTtcblxuICAgICAgLy9fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19cblxuICAgICAgaWYgKG1pbkluZGV4ID09IDApIHsvLyBiMS54ICogYjJcbiAgICAgICAgaWYgKHJpZ2h0KSB7XG4gICAgICAgICAgY3ggPSBwMXggKyBkMXg7IGN5ID0gcDF5ICsgZDF5OyBjeiA9IHAxeiArIGQxejtcbiAgICAgICAgICBueCA9IGExeDsgbnkgPSBhMXk7IG56ID0gYTF6O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGN4ID0gcDF4IC0gZDF4OyBjeSA9IHAxeSAtIGQxeTsgY3ogPSBwMXogLSBkMXo7XG4gICAgICAgICAgbnggPSAtYTF4OyBueSA9IC1hMXk7IG56ID0gLWExejtcbiAgICAgICAgfVxuICAgICAgICBzMXggPSBkMng7IHMxeSA9IGQyeTsgczF6ID0gZDJ6O1xuICAgICAgICBuMXggPSAtYTJ4OyBuMXkgPSAtYTJ5OyBuMXogPSAtYTJ6O1xuICAgICAgICBzMnggPSBkM3g7IHMyeSA9IGQzeTsgczJ6ID0gZDN6O1xuICAgICAgICBuMnggPSAtYTN4OyBuMnkgPSAtYTN5OyBuMnogPSAtYTN6O1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAobWluSW5kZXggPT0gMSkgey8vIGIxLnkgKiBiMlxuICAgICAgICBpZiAocmlnaHQpIHtcbiAgICAgICAgICBjeCA9IHAxeCArIGQyeDsgY3kgPSBwMXkgKyBkMnk7IGN6ID0gcDF6ICsgZDJ6O1xuICAgICAgICAgIG54ID0gYTJ4OyBueSA9IGEyeTsgbnogPSBhMno7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY3ggPSBwMXggLSBkMng7IGN5ID0gcDF5IC0gZDJ5OyBjeiA9IHAxeiAtIGQyejtcbiAgICAgICAgICBueCA9IC1hMng7IG55ID0gLWEyeTsgbnogPSAtYTJ6O1xuICAgICAgICB9XG4gICAgICAgIHMxeCA9IGQxeDsgczF5ID0gZDF5OyBzMXogPSBkMXo7XG4gICAgICAgIG4xeCA9IC1hMXg7IG4xeSA9IC1hMXk7IG4xeiA9IC1hMXo7XG4gICAgICAgIHMyeCA9IGQzeDsgczJ5ID0gZDN5OyBzMnogPSBkM3o7XG4gICAgICAgIG4yeCA9IC1hM3g7IG4yeSA9IC1hM3k7IG4yeiA9IC1hM3o7XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChtaW5JbmRleCA9PSAyKSB7Ly8gYjEueiAqIGIyXG4gICAgICAgIGlmIChyaWdodCkge1xuICAgICAgICAgIGN4ID0gcDF4ICsgZDN4OyBjeSA9IHAxeSArIGQzeTsgY3ogPSBwMXogKyBkM3o7XG4gICAgICAgICAgbnggPSBhM3g7IG55ID0gYTN5OyBueiA9IGEzejtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjeCA9IHAxeCAtIGQzeDsgY3kgPSBwMXkgLSBkM3k7IGN6ID0gcDF6IC0gZDN6O1xuICAgICAgICAgIG54ID0gLWEzeDsgbnkgPSAtYTN5OyBueiA9IC1hM3o7XG4gICAgICAgIH1cbiAgICAgICAgczF4ID0gZDF4OyBzMXkgPSBkMXk7IHMxeiA9IGQxejtcbiAgICAgICAgbjF4ID0gLWExeDsgbjF5ID0gLWExeTsgbjF6ID0gLWExejtcbiAgICAgICAgczJ4ID0gZDJ4OyBzMnkgPSBkMnk7IHMyeiA9IGQyejtcbiAgICAgICAgbjJ4ID0gLWEyeDsgbjJ5ID0gLWEyeTsgbjJ6ID0gLWEyejtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKG1pbkluZGV4ID09IDMpIHsvLyBiMi54ICogYjFcbiAgICAgICAgc3dhcCA9IHRydWU7XG4gICAgICAgIGlmICghcmlnaHQpIHtcbiAgICAgICAgICBjeCA9IHAyeCArIGQ0eDsgY3kgPSBwMnkgKyBkNHk7IGN6ID0gcDJ6ICsgZDR6O1xuICAgICAgICAgIG54ID0gYTR4OyBueSA9IGE0eTsgbnogPSBhNHo7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY3ggPSBwMnggLSBkNHg7IGN5ID0gcDJ5IC0gZDR5OyBjeiA9IHAyeiAtIGQ0ejtcbiAgICAgICAgICBueCA9IC1hNHg7IG55ID0gLWE0eTsgbnogPSAtYTR6O1xuICAgICAgICB9XG4gICAgICAgIHMxeCA9IGQ1eDsgczF5ID0gZDV5OyBzMXogPSBkNXo7XG4gICAgICAgIG4xeCA9IC1hNXg7IG4xeSA9IC1hNXk7IG4xeiA9IC1hNXo7XG4gICAgICAgIHMyeCA9IGQ2eDsgczJ5ID0gZDZ5OyBzMnogPSBkNno7XG4gICAgICAgIG4yeCA9IC1hNng7IG4yeSA9IC1hNnk7IG4yeiA9IC1hNno7XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChtaW5JbmRleCA9PSA0KSB7Ly8gYjIueSAqIGIxXG4gICAgICAgIHN3YXAgPSB0cnVlO1xuICAgICAgICBpZiAoIXJpZ2h0KSB7XG4gICAgICAgICAgY3ggPSBwMnggKyBkNXg7IGN5ID0gcDJ5ICsgZDV5OyBjeiA9IHAyeiArIGQ1ejtcbiAgICAgICAgICBueCA9IGE1eDsgbnkgPSBhNXk7IG56ID0gYTV6O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGN4ID0gcDJ4IC0gZDV4OyBjeSA9IHAyeSAtIGQ1eTsgY3ogPSBwMnogLSBkNXo7XG4gICAgICAgICAgbnggPSAtYTV4OyBueSA9IC1hNXk7IG56ID0gLWE1ejtcbiAgICAgICAgfVxuICAgICAgICBzMXggPSBkNHg7IHMxeSA9IGQ0eTsgczF6ID0gZDR6O1xuICAgICAgICBuMXggPSAtYTR4OyBuMXkgPSAtYTR5OyBuMXogPSAtYTR6O1xuICAgICAgICBzMnggPSBkNng7IHMyeSA9IGQ2eTsgczJ6ID0gZDZ6O1xuICAgICAgICBuMnggPSAtYTZ4OyBuMnkgPSAtYTZ5OyBuMnogPSAtYTZ6O1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAobWluSW5kZXggPT0gNSkgey8vIGIyLnogKiBiMVxuICAgICAgICBzd2FwID0gdHJ1ZTtcbiAgICAgICAgaWYgKCFyaWdodCkge1xuICAgICAgICAgIGN4ID0gcDJ4ICsgZDZ4OyBjeSA9IHAyeSArIGQ2eTsgY3ogPSBwMnogKyBkNno7XG4gICAgICAgICAgbnggPSBhNng7IG55ID0gYTZ5OyBueiA9IGE2ejtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjeCA9IHAyeCAtIGQ2eDsgY3kgPSBwMnkgLSBkNnk7IGN6ID0gcDJ6IC0gZDZ6O1xuICAgICAgICAgIG54ID0gLWE2eDsgbnkgPSAtYTZ5OyBueiA9IC1hNno7XG4gICAgICAgIH1cbiAgICAgICAgczF4ID0gZDR4OyBzMXkgPSBkNHk7IHMxeiA9IGQ0ejtcbiAgICAgICAgbjF4ID0gLWE0eDsgbjF5ID0gLWE0eTsgbjF6ID0gLWE0ejtcbiAgICAgICAgczJ4ID0gZDV4OyBzMnkgPSBkNXk7IHMyeiA9IGQ1ejtcbiAgICAgICAgbjJ4ID0gLWE1eDsgbjJ5ID0gLWE1eTsgbjJ6ID0gLWE1ejtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKG1pbkluZGV4ID09IDYpIHsvLyBiMS54ICogYjIueFxuICAgICAgICBueCA9IGE3eDsgbnkgPSBhN3k7IG56ID0gYTd6O1xuICAgICAgICBuMXggPSBhMXg7IG4xeSA9IGExeTsgbjF6ID0gYTF6O1xuICAgICAgICBuMnggPSBhNHg7IG4yeSA9IGE0eTsgbjJ6ID0gYTR6O1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAobWluSW5kZXggPT0gNykgey8vIGIxLnggKiBiMi55XG4gICAgICAgIG54ID0gYTh4OyBueSA9IGE4eTsgbnogPSBhOHo7XG4gICAgICAgIG4xeCA9IGExeDsgbjF5ID0gYTF5OyBuMXogPSBhMXo7XG4gICAgICAgIG4yeCA9IGE1eDsgbjJ5ID0gYTV5OyBuMnogPSBhNXo7XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChtaW5JbmRleCA9PSA4KSB7Ly8gYjEueCAqIGIyLnpcbiAgICAgICAgbnggPSBhOXg7IG55ID0gYTl5OyBueiA9IGE5ejtcbiAgICAgICAgbjF4ID0gYTF4OyBuMXkgPSBhMXk7IG4xeiA9IGExejtcbiAgICAgICAgbjJ4ID0gYTZ4OyBuMnkgPSBhNnk7IG4yeiA9IGE2ejtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKG1pbkluZGV4ID09IDkpIHsvLyBiMS55ICogYjIueFxuICAgICAgICBueCA9IGFheDsgbnkgPSBhYXk7IG56ID0gYWF6O1xuICAgICAgICBuMXggPSBhMng7IG4xeSA9IGEyeTsgbjF6ID0gYTJ6O1xuICAgICAgICBuMnggPSBhNHg7IG4yeSA9IGE0eTsgbjJ6ID0gYTR6O1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAobWluSW5kZXggPT0gMTApIHsvLyBiMS55ICogYjIueVxuICAgICAgICBueCA9IGFieDsgbnkgPSBhYnk7IG56ID0gYWJ6O1xuICAgICAgICBuMXggPSBhMng7IG4xeSA9IGEyeTsgbjF6ID0gYTJ6O1xuICAgICAgICBuMnggPSBhNXg7IG4yeSA9IGE1eTsgbjJ6ID0gYTV6O1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAobWluSW5kZXggPT0gMTEpIHsvLyBiMS55ICogYjIuelxuICAgICAgICBueCA9IGFjeDsgbnkgPSBhY3k7IG56ID0gYWN6O1xuICAgICAgICBuMXggPSBhMng7IG4xeSA9IGEyeTsgbjF6ID0gYTJ6O1xuICAgICAgICBuMnggPSBhNng7IG4yeSA9IGE2eTsgbjJ6ID0gYTZ6O1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAobWluSW5kZXggPT0gMTIpIHsvLyBiMS56ICogYjIueFxuICAgICAgICBueCA9IGFkeDsgbnkgPSBhZHk7IG56ID0gYWR6O1xuICAgICAgICBuMXggPSBhM3g7IG4xeSA9IGEzeTsgbjF6ID0gYTN6O1xuICAgICAgICBuMnggPSBhNHg7IG4yeSA9IGE0eTsgbjJ6ID0gYTR6O1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAobWluSW5kZXggPT0gMTMpIHsvLyBiMS56ICogYjIueVxuICAgICAgICBueCA9IGFleDsgbnkgPSBhZXk7IG56ID0gYWV6O1xuICAgICAgICBuMXggPSBhM3g7IG4xeSA9IGEzeTsgbjF6ID0gYTN6O1xuICAgICAgICBuMnggPSBhNXg7IG4yeSA9IGE1eTsgbjJ6ID0gYTV6O1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAobWluSW5kZXggPT0gMTQpIHsvLyBiMS56ICogYjIuelxuICAgICAgICBueCA9IGFmeDsgbnkgPSBhZnk7IG56ID0gYWZ6O1xuICAgICAgICBuMXggPSBhM3g7IG4xeSA9IGEzeTsgbjF6ID0gYTN6O1xuICAgICAgICBuMnggPSBhNng7IG4yeSA9IGE2eTsgbjJ6ID0gYTZ6O1xuICAgICAgfVxuXG4gICAgICAvL19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX1xuXG4gICAgICAvL3ZhciB2O1xuICAgICAgaWYgKG1pbkluZGV4ID4gNSkge1xuICAgICAgICBpZiAoIXJpZ2h0KSB7XG4gICAgICAgICAgbnggPSAtbng7IG55ID0gLW55OyBueiA9IC1uejtcbiAgICAgICAgfVxuICAgICAgICB2YXIgZGlzdGFuY2U7XG4gICAgICAgIHZhciBtYXhEaXN0YW5jZTtcbiAgICAgICAgdmFyIHZ4O1xuICAgICAgICB2YXIgdnk7XG4gICAgICAgIHZhciB2ejtcbiAgICAgICAgdmFyIHYxeDtcbiAgICAgICAgdmFyIHYxeTtcbiAgICAgICAgdmFyIHYxejtcbiAgICAgICAgdmFyIHYyeDtcbiAgICAgICAgdmFyIHYyeTtcbiAgICAgICAgdmFyIHYyejtcbiAgICAgICAgLy92ZXJ0ZXgxO1xuICAgICAgICB2MXggPSBWMVswXTsgdjF5ID0gVjFbMV07IHYxeiA9IFYxWzJdO1xuICAgICAgICBtYXhEaXN0YW5jZSA9IG54ICogdjF4ICsgbnkgKiB2MXkgKyBueiAqIHYxejtcbiAgICAgICAgLy92ZXJ0ZXgyO1xuICAgICAgICB2eCA9IFYxWzNdOyB2eSA9IFYxWzRdOyB2eiA9IFYxWzVdO1xuICAgICAgICBkaXN0YW5jZSA9IG54ICogdnggKyBueSAqIHZ5ICsgbnogKiB2ejtcbiAgICAgICAgaWYgKGRpc3RhbmNlID4gbWF4RGlzdGFuY2UpIHtcbiAgICAgICAgICBtYXhEaXN0YW5jZSA9IGRpc3RhbmNlO1xuICAgICAgICAgIHYxeCA9IHZ4OyB2MXkgPSB2eTsgdjF6ID0gdno7XG4gICAgICAgIH1cbiAgICAgICAgLy92ZXJ0ZXgzO1xuICAgICAgICB2eCA9IFYxWzZdOyB2eSA9IFYxWzddOyB2eiA9IFYxWzhdO1xuICAgICAgICBkaXN0YW5jZSA9IG54ICogdnggKyBueSAqIHZ5ICsgbnogKiB2ejtcbiAgICAgICAgaWYgKGRpc3RhbmNlID4gbWF4RGlzdGFuY2UpIHtcbiAgICAgICAgICBtYXhEaXN0YW5jZSA9IGRpc3RhbmNlO1xuICAgICAgICAgIHYxeCA9IHZ4OyB2MXkgPSB2eTsgdjF6ID0gdno7XG4gICAgICAgIH1cbiAgICAgICAgLy92ZXJ0ZXg0O1xuICAgICAgICB2eCA9IFYxWzldOyB2eSA9IFYxWzEwXTsgdnogPSBWMVsxMV07XG4gICAgICAgIGRpc3RhbmNlID0gbnggKiB2eCArIG55ICogdnkgKyBueiAqIHZ6O1xuICAgICAgICBpZiAoZGlzdGFuY2UgPiBtYXhEaXN0YW5jZSkge1xuICAgICAgICAgIG1heERpc3RhbmNlID0gZGlzdGFuY2U7XG4gICAgICAgICAgdjF4ID0gdng7IHYxeSA9IHZ5OyB2MXogPSB2ejtcbiAgICAgICAgfVxuICAgICAgICAvL3ZlcnRleDU7XG4gICAgICAgIHZ4ID0gVjFbMTJdOyB2eSA9IFYxWzEzXTsgdnogPSBWMVsxNF07XG4gICAgICAgIGRpc3RhbmNlID0gbnggKiB2eCArIG55ICogdnkgKyBueiAqIHZ6O1xuICAgICAgICBpZiAoZGlzdGFuY2UgPiBtYXhEaXN0YW5jZSkge1xuICAgICAgICAgIG1heERpc3RhbmNlID0gZGlzdGFuY2U7XG4gICAgICAgICAgdjF4ID0gdng7IHYxeSA9IHZ5OyB2MXogPSB2ejtcbiAgICAgICAgfVxuICAgICAgICAvL3ZlcnRleDY7XG4gICAgICAgIHZ4ID0gVjFbMTVdOyB2eSA9IFYxWzE2XTsgdnogPSBWMVsxN107XG4gICAgICAgIGRpc3RhbmNlID0gbnggKiB2eCArIG55ICogdnkgKyBueiAqIHZ6O1xuICAgICAgICBpZiAoZGlzdGFuY2UgPiBtYXhEaXN0YW5jZSkge1xuICAgICAgICAgIG1heERpc3RhbmNlID0gZGlzdGFuY2U7XG4gICAgICAgICAgdjF4ID0gdng7IHYxeSA9IHZ5OyB2MXogPSB2ejtcbiAgICAgICAgfVxuICAgICAgICAvL3ZlcnRleDc7XG4gICAgICAgIHZ4ID0gVjFbMThdOyB2eSA9IFYxWzE5XTsgdnogPSBWMVsyMF07XG4gICAgICAgIGRpc3RhbmNlID0gbnggKiB2eCArIG55ICogdnkgKyBueiAqIHZ6O1xuICAgICAgICBpZiAoZGlzdGFuY2UgPiBtYXhEaXN0YW5jZSkge1xuICAgICAgICAgIG1heERpc3RhbmNlID0gZGlzdGFuY2U7XG4gICAgICAgICAgdjF4ID0gdng7IHYxeSA9IHZ5OyB2MXogPSB2ejtcbiAgICAgICAgfVxuICAgICAgICAvL3ZlcnRleDg7XG4gICAgICAgIHZ4ID0gVjFbMjFdOyB2eSA9IFYxWzIyXTsgdnogPSBWMVsyM107XG4gICAgICAgIGRpc3RhbmNlID0gbnggKiB2eCArIG55ICogdnkgKyBueiAqIHZ6O1xuICAgICAgICBpZiAoZGlzdGFuY2UgPiBtYXhEaXN0YW5jZSkge1xuICAgICAgICAgIG1heERpc3RhbmNlID0gZGlzdGFuY2U7XG4gICAgICAgICAgdjF4ID0gdng7IHYxeSA9IHZ5OyB2MXogPSB2ejtcbiAgICAgICAgfVxuICAgICAgICAvL3ZlcnRleDE7XG4gICAgICAgIHYyeCA9IFYyWzBdOyB2MnkgPSBWMlsxXTsgdjJ6ID0gVjJbMl07XG4gICAgICAgIG1heERpc3RhbmNlID0gbnggKiB2MnggKyBueSAqIHYyeSArIG56ICogdjJ6O1xuICAgICAgICAvL3ZlcnRleDI7XG4gICAgICAgIHZ4ID0gVjJbM107IHZ5ID0gVjJbNF07IHZ6ID0gVjJbNV07XG4gICAgICAgIGRpc3RhbmNlID0gbnggKiB2eCArIG55ICogdnkgKyBueiAqIHZ6O1xuICAgICAgICBpZiAoZGlzdGFuY2UgPCBtYXhEaXN0YW5jZSkge1xuICAgICAgICAgIG1heERpc3RhbmNlID0gZGlzdGFuY2U7XG4gICAgICAgICAgdjJ4ID0gdng7IHYyeSA9IHZ5OyB2MnogPSB2ejtcbiAgICAgICAgfVxuICAgICAgICAvL3ZlcnRleDM7XG4gICAgICAgIHZ4ID0gVjJbNl07IHZ5ID0gVjJbN107IHZ6ID0gVjJbOF07XG4gICAgICAgIGRpc3RhbmNlID0gbnggKiB2eCArIG55ICogdnkgKyBueiAqIHZ6O1xuICAgICAgICBpZiAoZGlzdGFuY2UgPCBtYXhEaXN0YW5jZSkge1xuICAgICAgICAgIG1heERpc3RhbmNlID0gZGlzdGFuY2U7XG4gICAgICAgICAgdjJ4ID0gdng7IHYyeSA9IHZ5OyB2MnogPSB2ejtcbiAgICAgICAgfVxuICAgICAgICAvL3ZlcnRleDQ7XG4gICAgICAgIHZ4ID0gVjJbOV07IHZ5ID0gVjJbMTBdOyB2eiA9IFYyWzExXTtcbiAgICAgICAgZGlzdGFuY2UgPSBueCAqIHZ4ICsgbnkgKiB2eSArIG56ICogdno7XG4gICAgICAgIGlmIChkaXN0YW5jZSA8IG1heERpc3RhbmNlKSB7XG4gICAgICAgICAgbWF4RGlzdGFuY2UgPSBkaXN0YW5jZTtcbiAgICAgICAgICB2MnggPSB2eDsgdjJ5ID0gdnk7IHYyeiA9IHZ6O1xuICAgICAgICB9XG4gICAgICAgIC8vdmVydGV4NTtcbiAgICAgICAgdnggPSBWMlsxMl07IHZ5ID0gVjJbMTNdOyB2eiA9IFYyWzE0XTtcbiAgICAgICAgZGlzdGFuY2UgPSBueCAqIHZ4ICsgbnkgKiB2eSArIG56ICogdno7XG4gICAgICAgIGlmIChkaXN0YW5jZSA8IG1heERpc3RhbmNlKSB7XG4gICAgICAgICAgbWF4RGlzdGFuY2UgPSBkaXN0YW5jZTtcbiAgICAgICAgICB2MnggPSB2eDsgdjJ5ID0gdnk7IHYyeiA9IHZ6O1xuICAgICAgICB9XG4gICAgICAgIC8vdmVydGV4NjtcbiAgICAgICAgdnggPSBWMlsxNV07IHZ5ID0gVjJbMTZdOyB2eiA9IFYyWzE3XTtcbiAgICAgICAgZGlzdGFuY2UgPSBueCAqIHZ4ICsgbnkgKiB2eSArIG56ICogdno7XG4gICAgICAgIGlmIChkaXN0YW5jZSA8IG1heERpc3RhbmNlKSB7XG4gICAgICAgICAgbWF4RGlzdGFuY2UgPSBkaXN0YW5jZTtcbiAgICAgICAgICB2MnggPSB2eDsgdjJ5ID0gdnk7IHYyeiA9IHZ6O1xuICAgICAgICB9XG4gICAgICAgIC8vdmVydGV4NztcbiAgICAgICAgdnggPSBWMlsxOF07IHZ5ID0gVjJbMTldOyB2eiA9IFYyWzIwXTtcbiAgICAgICAgZGlzdGFuY2UgPSBueCAqIHZ4ICsgbnkgKiB2eSArIG56ICogdno7XG4gICAgICAgIGlmIChkaXN0YW5jZSA8IG1heERpc3RhbmNlKSB7XG4gICAgICAgICAgbWF4RGlzdGFuY2UgPSBkaXN0YW5jZTtcbiAgICAgICAgICB2MnggPSB2eDsgdjJ5ID0gdnk7IHYyeiA9IHZ6O1xuICAgICAgICB9XG4gICAgICAgIC8vdmVydGV4ODtcbiAgICAgICAgdnggPSBWMlsyMV07IHZ5ID0gVjJbMjJdOyB2eiA9IFYyWzIzXTtcbiAgICAgICAgZGlzdGFuY2UgPSBueCAqIHZ4ICsgbnkgKiB2eSArIG56ICogdno7XG4gICAgICAgIGlmIChkaXN0YW5jZSA8IG1heERpc3RhbmNlKSB7XG4gICAgICAgICAgbWF4RGlzdGFuY2UgPSBkaXN0YW5jZTtcbiAgICAgICAgICB2MnggPSB2eDsgdjJ5ID0gdnk7IHYyeiA9IHZ6O1xuICAgICAgICB9XG4gICAgICAgIHZ4ID0gdjJ4IC0gdjF4OyB2eSA9IHYyeSAtIHYxeTsgdnogPSB2MnogLSB2MXo7XG4gICAgICAgIGRvdDEgPSBuMXggKiBuMnggKyBuMXkgKiBuMnkgKyBuMXogKiBuMno7XG4gICAgICAgIHZhciB0ID0gKHZ4ICogKG4xeCAtIG4yeCAqIGRvdDEpICsgdnkgKiAobjF5IC0gbjJ5ICogZG90MSkgKyB2eiAqIChuMXogLSBuMnogKiBkb3QxKSkgLyAoMSAtIGRvdDEgKiBkb3QxKTtcbiAgICAgICAgbWFuaWZvbGQuYWRkUG9pbnQodjF4ICsgbjF4ICogdCArIG54ICogZGVwdGggKiAwLjUsIHYxeSArIG4xeSAqIHQgKyBueSAqIGRlcHRoICogMC41LCB2MXogKyBuMXogKiB0ICsgbnogKiBkZXB0aCAqIDAuNSwgbngsIG55LCBueiwgZGVwdGgsIGZhbHNlKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgLy8gbm93IGRldGVjdCBmYWNlLWZhY2UgY29sbGlzaW9uLi4uXG4gICAgICAvLyB0YXJnZXQgcXVhZFxuICAgICAgdmFyIHExeDtcbiAgICAgIHZhciBxMXk7XG4gICAgICB2YXIgcTF6O1xuICAgICAgdmFyIHEyeDtcbiAgICAgIHZhciBxMnk7XG4gICAgICB2YXIgcTJ6O1xuICAgICAgdmFyIHEzeDtcbiAgICAgIHZhciBxM3k7XG4gICAgICB2YXIgcTN6O1xuICAgICAgdmFyIHE0eDtcbiAgICAgIHZhciBxNHk7XG4gICAgICB2YXIgcTR6O1xuICAgICAgLy8gc2VhcmNoIHN1cHBvcnQgZmFjZSBhbmQgdmVydGV4XG4gICAgICB2YXIgbWluRG90ID0gMTtcbiAgICAgIHZhciBkb3QgPSAwO1xuICAgICAgdmFyIG1pbkRvdEluZGV4ID0gMDtcbiAgICAgIGlmIChzd2FwKSB7XG4gICAgICAgIGRvdCA9IGExeCAqIG54ICsgYTF5ICogbnkgKyBhMXogKiBuejtcbiAgICAgICAgaWYgKGRvdCA8IG1pbkRvdCkge1xuICAgICAgICAgIG1pbkRvdCA9IGRvdDtcbiAgICAgICAgICBtaW5Eb3RJbmRleCA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKC1kb3QgPCBtaW5Eb3QpIHtcbiAgICAgICAgICBtaW5Eb3QgPSAtZG90O1xuICAgICAgICAgIG1pbkRvdEluZGV4ID0gMTtcbiAgICAgICAgfVxuICAgICAgICBkb3QgPSBhMnggKiBueCArIGEyeSAqIG55ICsgYTJ6ICogbno7XG4gICAgICAgIGlmIChkb3QgPCBtaW5Eb3QpIHtcbiAgICAgICAgICBtaW5Eb3QgPSBkb3Q7XG4gICAgICAgICAgbWluRG90SW5kZXggPSAyO1xuICAgICAgICB9XG4gICAgICAgIGlmICgtZG90IDwgbWluRG90KSB7XG4gICAgICAgICAgbWluRG90ID0gLWRvdDtcbiAgICAgICAgICBtaW5Eb3RJbmRleCA9IDM7XG4gICAgICAgIH1cbiAgICAgICAgZG90ID0gYTN4ICogbnggKyBhM3kgKiBueSArIGEzeiAqIG56O1xuICAgICAgICBpZiAoZG90IDwgbWluRG90KSB7XG4gICAgICAgICAgbWluRG90ID0gZG90O1xuICAgICAgICAgIG1pbkRvdEluZGV4ID0gNDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoLWRvdCA8IG1pbkRvdCkge1xuICAgICAgICAgIG1pbkRvdCA9IC1kb3Q7XG4gICAgICAgICAgbWluRG90SW5kZXggPSA1O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG1pbkRvdEluZGV4ID09IDApIHsvLyB4KyBmYWNlXG4gICAgICAgICAgcTF4ID0gVjFbMF07IHExeSA9IFYxWzFdOyBxMXogPSBWMVsyXTsvL3ZlcnRleDFcbiAgICAgICAgICBxMnggPSBWMVs2XTsgcTJ5ID0gVjFbN107IHEyeiA9IFYxWzhdOy8vdmVydGV4M1xuICAgICAgICAgIHEzeCA9IFYxWzldOyBxM3kgPSBWMVsxMF07IHEzeiA9IFYxWzExXTsvL3ZlcnRleDRcbiAgICAgICAgICBxNHggPSBWMVszXTsgcTR5ID0gVjFbNF07IHE0eiA9IFYxWzVdOy8vdmVydGV4MlxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG1pbkRvdEluZGV4ID09IDEpIHsvLyB4LSBmYWNlXG4gICAgICAgICAgcTF4ID0gVjFbMTVdOyBxMXkgPSBWMVsxNl07IHExeiA9IFYxWzE3XTsvL3ZlcnRleDZcbiAgICAgICAgICBxMnggPSBWMVsyMV07IHEyeSA9IFYxWzIyXTsgcTJ6ID0gVjFbMjNdOy8vdmVydGV4OFxuICAgICAgICAgIHEzeCA9IFYxWzE4XTsgcTN5ID0gVjFbMTldOyBxM3ogPSBWMVsyMF07Ly92ZXJ0ZXg3XG4gICAgICAgICAgcTR4ID0gVjFbMTJdOyBxNHkgPSBWMVsxM107IHE0eiA9IFYxWzE0XTsvL3ZlcnRleDVcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChtaW5Eb3RJbmRleCA9PSAyKSB7Ly8geSsgZmFjZVxuICAgICAgICAgIHExeCA9IFYxWzEyXTsgcTF5ID0gVjFbMTNdOyBxMXogPSBWMVsxNF07Ly92ZXJ0ZXg1XG4gICAgICAgICAgcTJ4ID0gVjFbMF07IHEyeSA9IFYxWzFdOyBxMnogPSBWMVsyXTsvL3ZlcnRleDFcbiAgICAgICAgICBxM3ggPSBWMVszXTsgcTN5ID0gVjFbNF07IHEzeiA9IFYxWzVdOy8vdmVydGV4MlxuICAgICAgICAgIHE0eCA9IFYxWzE1XTsgcTR5ID0gVjFbMTZdOyBxNHogPSBWMVsxN107Ly92ZXJ0ZXg2XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAobWluRG90SW5kZXggPT0gMykgey8vIHktIGZhY2VcbiAgICAgICAgICBxMXggPSBWMVsyMV07IHExeSA9IFYxWzIyXTsgcTF6ID0gVjFbMjNdOy8vdmVydGV4OFxuICAgICAgICAgIHEyeCA9IFYxWzldOyBxMnkgPSBWMVsxMF07IHEyeiA9IFYxWzExXTsvL3ZlcnRleDRcbiAgICAgICAgICBxM3ggPSBWMVs2XTsgcTN5ID0gVjFbN107IHEzeiA9IFYxWzhdOy8vdmVydGV4M1xuICAgICAgICAgIHE0eCA9IFYxWzE4XTsgcTR5ID0gVjFbMTldOyBxNHogPSBWMVsyMF07Ly92ZXJ0ZXg3XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAobWluRG90SW5kZXggPT0gNCkgey8vIHorIGZhY2VcbiAgICAgICAgICBxMXggPSBWMVsxMl07IHExeSA9IFYxWzEzXTsgcTF6ID0gVjFbMTRdOy8vdmVydGV4NVxuICAgICAgICAgIHEyeCA9IFYxWzE4XTsgcTJ5ID0gVjFbMTldOyBxMnogPSBWMVsyMF07Ly92ZXJ0ZXg3XG4gICAgICAgICAgcTN4ID0gVjFbNl07IHEzeSA9IFYxWzddOyBxM3ogPSBWMVs4XTsvL3ZlcnRleDNcbiAgICAgICAgICBxNHggPSBWMVswXTsgcTR5ID0gVjFbMV07IHE0eiA9IFYxWzJdOy8vdmVydGV4MVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG1pbkRvdEluZGV4ID09IDUpIHsvLyB6LSBmYWNlXG4gICAgICAgICAgcTF4ID0gVjFbM107IHExeSA9IFYxWzRdOyBxMXogPSBWMVs1XTsvL3ZlcnRleDJcbiAgICAgICAgICAvLzJ4PVYxWzZdOyBxMnk9VjFbN107IHEyej1WMVs4XTsvL3ZlcnRleDQgISEhXG4gICAgICAgICAgcTJ4ID0gVjJbOV07IHEyeSA9IFYyWzEwXTsgcTJ6ID0gVjJbMTFdOy8vdmVydGV4NFxuICAgICAgICAgIHEzeCA9IFYxWzIxXTsgcTN5ID0gVjFbMjJdOyBxM3ogPSBWMVsyM107Ly92ZXJ0ZXg4XG4gICAgICAgICAgcTR4ID0gVjFbMTVdOyBxNHkgPSBWMVsxNl07IHE0eiA9IFYxWzE3XTsvL3ZlcnRleDZcbiAgICAgICAgfVxuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkb3QgPSBhNHggKiBueCArIGE0eSAqIG55ICsgYTR6ICogbno7XG4gICAgICAgIGlmIChkb3QgPCBtaW5Eb3QpIHtcbiAgICAgICAgICBtaW5Eb3QgPSBkb3Q7XG4gICAgICAgICAgbWluRG90SW5kZXggPSAwO1xuICAgICAgICB9XG4gICAgICAgIGlmICgtZG90IDwgbWluRG90KSB7XG4gICAgICAgICAgbWluRG90ID0gLWRvdDtcbiAgICAgICAgICBtaW5Eb3RJbmRleCA9IDE7XG4gICAgICAgIH1cbiAgICAgICAgZG90ID0gYTV4ICogbnggKyBhNXkgKiBueSArIGE1eiAqIG56O1xuICAgICAgICBpZiAoZG90IDwgbWluRG90KSB7XG4gICAgICAgICAgbWluRG90ID0gZG90O1xuICAgICAgICAgIG1pbkRvdEluZGV4ID0gMjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoLWRvdCA8IG1pbkRvdCkge1xuICAgICAgICAgIG1pbkRvdCA9IC1kb3Q7XG4gICAgICAgICAgbWluRG90SW5kZXggPSAzO1xuICAgICAgICB9XG4gICAgICAgIGRvdCA9IGE2eCAqIG54ICsgYTZ5ICogbnkgKyBhNnogKiBuejtcbiAgICAgICAgaWYgKGRvdCA8IG1pbkRvdCkge1xuICAgICAgICAgIG1pbkRvdCA9IGRvdDtcbiAgICAgICAgICBtaW5Eb3RJbmRleCA9IDQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKC1kb3QgPCBtaW5Eb3QpIHtcbiAgICAgICAgICBtaW5Eb3QgPSAtZG90O1xuICAgICAgICAgIG1pbkRvdEluZGV4ID0gNTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fXG5cbiAgICAgICAgaWYgKG1pbkRvdEluZGV4ID09IDApIHsvLyB4KyBmYWNlXG4gICAgICAgICAgcTF4ID0gVjJbMF07IHExeSA9IFYyWzFdOyBxMXogPSBWMlsyXTsvL3ZlcnRleDFcbiAgICAgICAgICBxMnggPSBWMls2XTsgcTJ5ID0gVjJbN107IHEyeiA9IFYyWzhdOy8vdmVydGV4M1xuICAgICAgICAgIHEzeCA9IFYyWzldOyBxM3kgPSBWMlsxMF07IHEzeiA9IFYyWzExXTsvL3ZlcnRleDRcbiAgICAgICAgICBxNHggPSBWMlszXTsgcTR5ID0gVjJbNF07IHE0eiA9IFYyWzVdOy8vdmVydGV4MlxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG1pbkRvdEluZGV4ID09IDEpIHsvLyB4LSBmYWNlXG4gICAgICAgICAgcTF4ID0gVjJbMTVdOyBxMXkgPSBWMlsxNl07IHExeiA9IFYyWzE3XTsvL3ZlcnRleDZcbiAgICAgICAgICBxMnggPSBWMlsyMV07IHEyeSA9IFYyWzIyXTsgcTJ6ID0gVjJbMjNdOyAvL3ZlcnRleDhcbiAgICAgICAgICBxM3ggPSBWMlsxOF07IHEzeSA9IFYyWzE5XTsgcTN6ID0gVjJbMjBdOy8vdmVydGV4N1xuICAgICAgICAgIHE0eCA9IFYyWzEyXTsgcTR5ID0gVjJbMTNdOyBxNHogPSBWMlsxNF07Ly92ZXJ0ZXg1XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAobWluRG90SW5kZXggPT0gMikgey8vIHkrIGZhY2VcbiAgICAgICAgICBxMXggPSBWMlsxMl07IHExeSA9IFYyWzEzXTsgcTF6ID0gVjJbMTRdOy8vdmVydGV4NVxuICAgICAgICAgIHEyeCA9IFYyWzBdOyBxMnkgPSBWMlsxXTsgcTJ6ID0gVjJbMl07Ly92ZXJ0ZXgxXG4gICAgICAgICAgcTN4ID0gVjJbM107IHEzeSA9IFYyWzRdOyBxM3ogPSBWMls1XTsvL3ZlcnRleDJcbiAgICAgICAgICBxNHggPSBWMlsxNV07IHE0eSA9IFYyWzE2XTsgcTR6ID0gVjJbMTddOy8vdmVydGV4NlxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG1pbkRvdEluZGV4ID09IDMpIHsvLyB5LSBmYWNlXG4gICAgICAgICAgcTF4ID0gVjJbMjFdOyBxMXkgPSBWMlsyMl07IHExeiA9IFYyWzIzXTsvL3ZlcnRleDhcbiAgICAgICAgICBxMnggPSBWMls5XTsgcTJ5ID0gVjJbMTBdOyBxMnogPSBWMlsxMV07Ly92ZXJ0ZXg0XG4gICAgICAgICAgcTN4ID0gVjJbNl07IHEzeSA9IFYyWzddOyBxM3ogPSBWMls4XTsvL3ZlcnRleDNcbiAgICAgICAgICBxNHggPSBWMlsxOF07IHE0eSA9IFYyWzE5XTsgcTR6ID0gVjJbMjBdOy8vdmVydGV4N1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG1pbkRvdEluZGV4ID09IDQpIHsvLyB6KyBmYWNlXG4gICAgICAgICAgcTF4ID0gVjJbMTJdOyBxMXkgPSBWMlsxM107IHExeiA9IFYyWzE0XTsvL3ZlcnRleDVcbiAgICAgICAgICBxMnggPSBWMlsxOF07IHEyeSA9IFYyWzE5XTsgcTJ6ID0gVjJbMjBdOy8vdmVydGV4N1xuICAgICAgICAgIHEzeCA9IFYyWzZdOyBxM3kgPSBWMls3XTsgcTN6ID0gVjJbOF07Ly92ZXJ0ZXgzXG4gICAgICAgICAgcTR4ID0gVjJbMF07IHE0eSA9IFYyWzFdOyBxNHogPSBWMlsyXTsvL3ZlcnRleDFcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChtaW5Eb3RJbmRleCA9PSA1KSB7Ly8gei0gZmFjZVxuICAgICAgICAgIHExeCA9IFYyWzNdOyBxMXkgPSBWMls0XTsgcTF6ID0gVjJbNV07Ly92ZXJ0ZXgyXG4gICAgICAgICAgcTJ4ID0gVjJbOV07IHEyeSA9IFYyWzEwXTsgcTJ6ID0gVjJbMTFdOy8vdmVydGV4NFxuICAgICAgICAgIHEzeCA9IFYyWzIxXTsgcTN5ID0gVjJbMjJdOyBxM3ogPSBWMlsyM107Ly92ZXJ0ZXg4XG4gICAgICAgICAgcTR4ID0gVjJbMTVdOyBxNHkgPSBWMlsxNl07IHE0eiA9IFYyWzE3XTsvL3ZlcnRleDZcbiAgICAgICAgfVxuXG4gICAgICB9XG4gICAgICAvLyBjbGlwIHZlcnRpY2VzXG4gICAgICB2YXIgbnVtQ2xpcFZlcnRpY2VzO1xuICAgICAgdmFyIG51bUFkZGVkQ2xpcFZlcnRpY2VzO1xuICAgICAgdmFyIGluZGV4O1xuICAgICAgdmFyIHgxO1xuICAgICAgdmFyIHkxO1xuICAgICAgdmFyIHoxO1xuICAgICAgdmFyIHgyO1xuICAgICAgdmFyIHkyO1xuICAgICAgdmFyIHoyO1xuICAgICAgdGhpcy5jbGlwVmVydGljZXMxWzBdID0gcTF4O1xuICAgICAgdGhpcy5jbGlwVmVydGljZXMxWzFdID0gcTF5O1xuICAgICAgdGhpcy5jbGlwVmVydGljZXMxWzJdID0gcTF6O1xuICAgICAgdGhpcy5jbGlwVmVydGljZXMxWzNdID0gcTJ4O1xuICAgICAgdGhpcy5jbGlwVmVydGljZXMxWzRdID0gcTJ5O1xuICAgICAgdGhpcy5jbGlwVmVydGljZXMxWzVdID0gcTJ6O1xuICAgICAgdGhpcy5jbGlwVmVydGljZXMxWzZdID0gcTN4O1xuICAgICAgdGhpcy5jbGlwVmVydGljZXMxWzddID0gcTN5O1xuICAgICAgdGhpcy5jbGlwVmVydGljZXMxWzhdID0gcTN6O1xuICAgICAgdGhpcy5jbGlwVmVydGljZXMxWzldID0gcTR4O1xuICAgICAgdGhpcy5jbGlwVmVydGljZXMxWzEwXSA9IHE0eTtcbiAgICAgIHRoaXMuY2xpcFZlcnRpY2VzMVsxMV0gPSBxNHo7XG4gICAgICBudW1BZGRlZENsaXBWZXJ0aWNlcyA9IDA7XG4gICAgICB4MSA9IHRoaXMuY2xpcFZlcnRpY2VzMVs5XTtcbiAgICAgIHkxID0gdGhpcy5jbGlwVmVydGljZXMxWzEwXTtcbiAgICAgIHoxID0gdGhpcy5jbGlwVmVydGljZXMxWzExXTtcbiAgICAgIGRvdDEgPSAoeDEgLSBjeCAtIHMxeCkgKiBuMXggKyAoeTEgLSBjeSAtIHMxeSkgKiBuMXkgKyAoejEgLSBjeiAtIHMxeikgKiBuMXo7XG5cbiAgICAgIC8vdmFyIGkgPSA0O1xuICAgICAgLy93aGlsZShpLS0pe1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCA0OyBpKyspIHtcbiAgICAgICAgaW5kZXggPSBpICogMztcbiAgICAgICAgeDIgPSB0aGlzLmNsaXBWZXJ0aWNlczFbaW5kZXhdO1xuICAgICAgICB5MiA9IHRoaXMuY2xpcFZlcnRpY2VzMVtpbmRleCArIDFdO1xuICAgICAgICB6MiA9IHRoaXMuY2xpcFZlcnRpY2VzMVtpbmRleCArIDJdO1xuICAgICAgICBkb3QyID0gKHgyIC0gY3ggLSBzMXgpICogbjF4ICsgKHkyIC0gY3kgLSBzMXkpICogbjF5ICsgKHoyIC0gY3ogLSBzMXopICogbjF6O1xuICAgICAgICBpZiAoZG90MSA+IDApIHtcbiAgICAgICAgICBpZiAoZG90MiA+IDApIHtcbiAgICAgICAgICAgIGluZGV4ID0gbnVtQWRkZWRDbGlwVmVydGljZXMgKiAzO1xuICAgICAgICAgICAgbnVtQWRkZWRDbGlwVmVydGljZXMrKztcbiAgICAgICAgICAgIHRoaXMuY2xpcFZlcnRpY2VzMltpbmRleF0gPSB4MjtcbiAgICAgICAgICAgIHRoaXMuY2xpcFZlcnRpY2VzMltpbmRleCArIDFdID0geTI7XG4gICAgICAgICAgICB0aGlzLmNsaXBWZXJ0aWNlczJbaW5kZXggKyAyXSA9IHoyO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpbmRleCA9IG51bUFkZGVkQ2xpcFZlcnRpY2VzICogMztcbiAgICAgICAgICAgIG51bUFkZGVkQ2xpcFZlcnRpY2VzKys7XG4gICAgICAgICAgICB0ID0gZG90MSAvIChkb3QxIC0gZG90Mik7XG4gICAgICAgICAgICB0aGlzLmNsaXBWZXJ0aWNlczJbaW5kZXhdID0geDEgKyAoeDIgLSB4MSkgKiB0O1xuICAgICAgICAgICAgdGhpcy5jbGlwVmVydGljZXMyW2luZGV4ICsgMV0gPSB5MSArICh5MiAtIHkxKSAqIHQ7XG4gICAgICAgICAgICB0aGlzLmNsaXBWZXJ0aWNlczJbaW5kZXggKyAyXSA9IHoxICsgKHoyIC0gejEpICogdDtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKGRvdDIgPiAwKSB7XG4gICAgICAgICAgICBpbmRleCA9IG51bUFkZGVkQ2xpcFZlcnRpY2VzICogMztcbiAgICAgICAgICAgIG51bUFkZGVkQ2xpcFZlcnRpY2VzKys7XG4gICAgICAgICAgICB0ID0gZG90MSAvIChkb3QxIC0gZG90Mik7XG4gICAgICAgICAgICB0aGlzLmNsaXBWZXJ0aWNlczJbaW5kZXhdID0geDEgKyAoeDIgLSB4MSkgKiB0O1xuICAgICAgICAgICAgdGhpcy5jbGlwVmVydGljZXMyW2luZGV4ICsgMV0gPSB5MSArICh5MiAtIHkxKSAqIHQ7XG4gICAgICAgICAgICB0aGlzLmNsaXBWZXJ0aWNlczJbaW5kZXggKyAyXSA9IHoxICsgKHoyIC0gejEpICogdDtcbiAgICAgICAgICAgIGluZGV4ID0gbnVtQWRkZWRDbGlwVmVydGljZXMgKiAzO1xuICAgICAgICAgICAgbnVtQWRkZWRDbGlwVmVydGljZXMrKztcbiAgICAgICAgICAgIHRoaXMuY2xpcFZlcnRpY2VzMltpbmRleF0gPSB4MjtcbiAgICAgICAgICAgIHRoaXMuY2xpcFZlcnRpY2VzMltpbmRleCArIDFdID0geTI7XG4gICAgICAgICAgICB0aGlzLmNsaXBWZXJ0aWNlczJbaW5kZXggKyAyXSA9IHoyO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB4MSA9IHgyO1xuICAgICAgICB5MSA9IHkyO1xuICAgICAgICB6MSA9IHoyO1xuICAgICAgICBkb3QxID0gZG90MjtcbiAgICAgIH1cblxuICAgICAgbnVtQ2xpcFZlcnRpY2VzID0gbnVtQWRkZWRDbGlwVmVydGljZXM7XG4gICAgICBpZiAobnVtQ2xpcFZlcnRpY2VzID09IDApIHJldHVybjtcbiAgICAgIG51bUFkZGVkQ2xpcFZlcnRpY2VzID0gMDtcbiAgICAgIGluZGV4ID0gKG51bUNsaXBWZXJ0aWNlcyAtIDEpICogMztcbiAgICAgIHgxID0gdGhpcy5jbGlwVmVydGljZXMyW2luZGV4XTtcbiAgICAgIHkxID0gdGhpcy5jbGlwVmVydGljZXMyW2luZGV4ICsgMV07XG4gICAgICB6MSA9IHRoaXMuY2xpcFZlcnRpY2VzMltpbmRleCArIDJdO1xuICAgICAgZG90MSA9ICh4MSAtIGN4IC0gczJ4KSAqIG4yeCArICh5MSAtIGN5IC0gczJ5KSAqIG4yeSArICh6MSAtIGN6IC0gczJ6KSAqIG4yejtcblxuICAgICAgLy9pID0gbnVtQ2xpcFZlcnRpY2VzO1xuICAgICAgLy93aGlsZShpLS0pe1xuICAgICAgZm9yIChpID0gMDsgaSA8IG51bUNsaXBWZXJ0aWNlczsgaSsrKSB7XG4gICAgICAgIGluZGV4ID0gaSAqIDM7XG4gICAgICAgIHgyID0gdGhpcy5jbGlwVmVydGljZXMyW2luZGV4XTtcbiAgICAgICAgeTIgPSB0aGlzLmNsaXBWZXJ0aWNlczJbaW5kZXggKyAxXTtcbiAgICAgICAgejIgPSB0aGlzLmNsaXBWZXJ0aWNlczJbaW5kZXggKyAyXTtcbiAgICAgICAgZG90MiA9ICh4MiAtIGN4IC0gczJ4KSAqIG4yeCArICh5MiAtIGN5IC0gczJ5KSAqIG4yeSArICh6MiAtIGN6IC0gczJ6KSAqIG4yejtcbiAgICAgICAgaWYgKGRvdDEgPiAwKSB7XG4gICAgICAgICAgaWYgKGRvdDIgPiAwKSB7XG4gICAgICAgICAgICBpbmRleCA9IG51bUFkZGVkQ2xpcFZlcnRpY2VzICogMztcbiAgICAgICAgICAgIG51bUFkZGVkQ2xpcFZlcnRpY2VzKys7XG4gICAgICAgICAgICB0aGlzLmNsaXBWZXJ0aWNlczFbaW5kZXhdID0geDI7XG4gICAgICAgICAgICB0aGlzLmNsaXBWZXJ0aWNlczFbaW5kZXggKyAxXSA9IHkyO1xuICAgICAgICAgICAgdGhpcy5jbGlwVmVydGljZXMxW2luZGV4ICsgMl0gPSB6MjtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaW5kZXggPSBudW1BZGRlZENsaXBWZXJ0aWNlcyAqIDM7XG4gICAgICAgICAgICBudW1BZGRlZENsaXBWZXJ0aWNlcysrO1xuICAgICAgICAgICAgdCA9IGRvdDEgLyAoZG90MSAtIGRvdDIpO1xuICAgICAgICAgICAgdGhpcy5jbGlwVmVydGljZXMxW2luZGV4XSA9IHgxICsgKHgyIC0geDEpICogdDtcbiAgICAgICAgICAgIHRoaXMuY2xpcFZlcnRpY2VzMVtpbmRleCArIDFdID0geTEgKyAoeTIgLSB5MSkgKiB0O1xuICAgICAgICAgICAgdGhpcy5jbGlwVmVydGljZXMxW2luZGV4ICsgMl0gPSB6MSArICh6MiAtIHoxKSAqIHQ7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChkb3QyID4gMCkge1xuICAgICAgICAgICAgaW5kZXggPSBudW1BZGRlZENsaXBWZXJ0aWNlcyAqIDM7XG4gICAgICAgICAgICBudW1BZGRlZENsaXBWZXJ0aWNlcysrO1xuICAgICAgICAgICAgdCA9IGRvdDEgLyAoZG90MSAtIGRvdDIpO1xuICAgICAgICAgICAgdGhpcy5jbGlwVmVydGljZXMxW2luZGV4XSA9IHgxICsgKHgyIC0geDEpICogdDtcbiAgICAgICAgICAgIHRoaXMuY2xpcFZlcnRpY2VzMVtpbmRleCArIDFdID0geTEgKyAoeTIgLSB5MSkgKiB0O1xuICAgICAgICAgICAgdGhpcy5jbGlwVmVydGljZXMxW2luZGV4ICsgMl0gPSB6MSArICh6MiAtIHoxKSAqIHQ7XG4gICAgICAgICAgICBpbmRleCA9IG51bUFkZGVkQ2xpcFZlcnRpY2VzICogMztcbiAgICAgICAgICAgIG51bUFkZGVkQ2xpcFZlcnRpY2VzKys7XG4gICAgICAgICAgICB0aGlzLmNsaXBWZXJ0aWNlczFbaW5kZXhdID0geDI7XG4gICAgICAgICAgICB0aGlzLmNsaXBWZXJ0aWNlczFbaW5kZXggKyAxXSA9IHkyO1xuICAgICAgICAgICAgdGhpcy5jbGlwVmVydGljZXMxW2luZGV4ICsgMl0gPSB6MjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgeDEgPSB4MjtcbiAgICAgICAgeTEgPSB5MjtcbiAgICAgICAgejEgPSB6MjtcbiAgICAgICAgZG90MSA9IGRvdDI7XG4gICAgICB9XG5cbiAgICAgIG51bUNsaXBWZXJ0aWNlcyA9IG51bUFkZGVkQ2xpcFZlcnRpY2VzO1xuICAgICAgaWYgKG51bUNsaXBWZXJ0aWNlcyA9PSAwKSByZXR1cm47XG4gICAgICBudW1BZGRlZENsaXBWZXJ0aWNlcyA9IDA7XG4gICAgICBpbmRleCA9IChudW1DbGlwVmVydGljZXMgLSAxKSAqIDM7XG4gICAgICB4MSA9IHRoaXMuY2xpcFZlcnRpY2VzMVtpbmRleF07XG4gICAgICB5MSA9IHRoaXMuY2xpcFZlcnRpY2VzMVtpbmRleCArIDFdO1xuICAgICAgejEgPSB0aGlzLmNsaXBWZXJ0aWNlczFbaW5kZXggKyAyXTtcbiAgICAgIGRvdDEgPSAoeDEgLSBjeCArIHMxeCkgKiAtbjF4ICsgKHkxIC0gY3kgKyBzMXkpICogLW4xeSArICh6MSAtIGN6ICsgczF6KSAqIC1uMXo7XG5cbiAgICAgIC8vaSA9IG51bUNsaXBWZXJ0aWNlcztcbiAgICAgIC8vd2hpbGUoaS0tKXtcbiAgICAgIGZvciAoaSA9IDA7IGkgPCBudW1DbGlwVmVydGljZXM7IGkrKykge1xuICAgICAgICBpbmRleCA9IGkgKiAzO1xuICAgICAgICB4MiA9IHRoaXMuY2xpcFZlcnRpY2VzMVtpbmRleF07XG4gICAgICAgIHkyID0gdGhpcy5jbGlwVmVydGljZXMxW2luZGV4ICsgMV07XG4gICAgICAgIHoyID0gdGhpcy5jbGlwVmVydGljZXMxW2luZGV4ICsgMl07XG4gICAgICAgIGRvdDIgPSAoeDIgLSBjeCArIHMxeCkgKiAtbjF4ICsgKHkyIC0gY3kgKyBzMXkpICogLW4xeSArICh6MiAtIGN6ICsgczF6KSAqIC1uMXo7XG4gICAgICAgIGlmIChkb3QxID4gMCkge1xuICAgICAgICAgIGlmIChkb3QyID4gMCkge1xuICAgICAgICAgICAgaW5kZXggPSBudW1BZGRlZENsaXBWZXJ0aWNlcyAqIDM7XG4gICAgICAgICAgICBudW1BZGRlZENsaXBWZXJ0aWNlcysrO1xuICAgICAgICAgICAgdGhpcy5jbGlwVmVydGljZXMyW2luZGV4XSA9IHgyO1xuICAgICAgICAgICAgdGhpcy5jbGlwVmVydGljZXMyW2luZGV4ICsgMV0gPSB5MjtcbiAgICAgICAgICAgIHRoaXMuY2xpcFZlcnRpY2VzMltpbmRleCArIDJdID0gejI7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGluZGV4ID0gbnVtQWRkZWRDbGlwVmVydGljZXMgKiAzO1xuICAgICAgICAgICAgbnVtQWRkZWRDbGlwVmVydGljZXMrKztcbiAgICAgICAgICAgIHQgPSBkb3QxIC8gKGRvdDEgLSBkb3QyKTtcbiAgICAgICAgICAgIHRoaXMuY2xpcFZlcnRpY2VzMltpbmRleF0gPSB4MSArICh4MiAtIHgxKSAqIHQ7XG4gICAgICAgICAgICB0aGlzLmNsaXBWZXJ0aWNlczJbaW5kZXggKyAxXSA9IHkxICsgKHkyIC0geTEpICogdDtcbiAgICAgICAgICAgIHRoaXMuY2xpcFZlcnRpY2VzMltpbmRleCArIDJdID0gejEgKyAoejIgLSB6MSkgKiB0O1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoZG90MiA+IDApIHtcbiAgICAgICAgICAgIGluZGV4ID0gbnVtQWRkZWRDbGlwVmVydGljZXMgKiAzO1xuICAgICAgICAgICAgbnVtQWRkZWRDbGlwVmVydGljZXMrKztcbiAgICAgICAgICAgIHQgPSBkb3QxIC8gKGRvdDEgLSBkb3QyKTtcbiAgICAgICAgICAgIHRoaXMuY2xpcFZlcnRpY2VzMltpbmRleF0gPSB4MSArICh4MiAtIHgxKSAqIHQ7XG4gICAgICAgICAgICB0aGlzLmNsaXBWZXJ0aWNlczJbaW5kZXggKyAxXSA9IHkxICsgKHkyIC0geTEpICogdDtcbiAgICAgICAgICAgIHRoaXMuY2xpcFZlcnRpY2VzMltpbmRleCArIDJdID0gejEgKyAoejIgLSB6MSkgKiB0O1xuICAgICAgICAgICAgaW5kZXggPSBudW1BZGRlZENsaXBWZXJ0aWNlcyAqIDM7XG4gICAgICAgICAgICBudW1BZGRlZENsaXBWZXJ0aWNlcysrO1xuICAgICAgICAgICAgdGhpcy5jbGlwVmVydGljZXMyW2luZGV4XSA9IHgyO1xuICAgICAgICAgICAgdGhpcy5jbGlwVmVydGljZXMyW2luZGV4ICsgMV0gPSB5MjtcbiAgICAgICAgICAgIHRoaXMuY2xpcFZlcnRpY2VzMltpbmRleCArIDJdID0gejI7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHgxID0geDI7XG4gICAgICAgIHkxID0geTI7XG4gICAgICAgIHoxID0gejI7XG4gICAgICAgIGRvdDEgPSBkb3QyO1xuICAgICAgfVxuXG4gICAgICBudW1DbGlwVmVydGljZXMgPSBudW1BZGRlZENsaXBWZXJ0aWNlcztcbiAgICAgIGlmIChudW1DbGlwVmVydGljZXMgPT0gMCkgcmV0dXJuO1xuICAgICAgbnVtQWRkZWRDbGlwVmVydGljZXMgPSAwO1xuICAgICAgaW5kZXggPSAobnVtQ2xpcFZlcnRpY2VzIC0gMSkgKiAzO1xuICAgICAgeDEgPSB0aGlzLmNsaXBWZXJ0aWNlczJbaW5kZXhdO1xuICAgICAgeTEgPSB0aGlzLmNsaXBWZXJ0aWNlczJbaW5kZXggKyAxXTtcbiAgICAgIHoxID0gdGhpcy5jbGlwVmVydGljZXMyW2luZGV4ICsgMl07XG4gICAgICBkb3QxID0gKHgxIC0gY3ggKyBzMngpICogLW4yeCArICh5MSAtIGN5ICsgczJ5KSAqIC1uMnkgKyAoejEgLSBjeiArIHMyeikgKiAtbjJ6O1xuXG4gICAgICAvL2kgPSBudW1DbGlwVmVydGljZXM7XG4gICAgICAvL3doaWxlKGktLSl7XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgbnVtQ2xpcFZlcnRpY2VzOyBpKyspIHtcbiAgICAgICAgaW5kZXggPSBpICogMztcbiAgICAgICAgeDIgPSB0aGlzLmNsaXBWZXJ0aWNlczJbaW5kZXhdO1xuICAgICAgICB5MiA9IHRoaXMuY2xpcFZlcnRpY2VzMltpbmRleCArIDFdO1xuICAgICAgICB6MiA9IHRoaXMuY2xpcFZlcnRpY2VzMltpbmRleCArIDJdO1xuICAgICAgICBkb3QyID0gKHgyIC0gY3ggKyBzMngpICogLW4yeCArICh5MiAtIGN5ICsgczJ5KSAqIC1uMnkgKyAoejIgLSBjeiArIHMyeikgKiAtbjJ6O1xuICAgICAgICBpZiAoZG90MSA+IDApIHtcbiAgICAgICAgICBpZiAoZG90MiA+IDApIHtcbiAgICAgICAgICAgIGluZGV4ID0gbnVtQWRkZWRDbGlwVmVydGljZXMgKiAzO1xuICAgICAgICAgICAgbnVtQWRkZWRDbGlwVmVydGljZXMrKztcbiAgICAgICAgICAgIHRoaXMuY2xpcFZlcnRpY2VzMVtpbmRleF0gPSB4MjtcbiAgICAgICAgICAgIHRoaXMuY2xpcFZlcnRpY2VzMVtpbmRleCArIDFdID0geTI7XG4gICAgICAgICAgICB0aGlzLmNsaXBWZXJ0aWNlczFbaW5kZXggKyAyXSA9IHoyO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpbmRleCA9IG51bUFkZGVkQ2xpcFZlcnRpY2VzICogMztcbiAgICAgICAgICAgIG51bUFkZGVkQ2xpcFZlcnRpY2VzKys7XG4gICAgICAgICAgICB0ID0gZG90MSAvIChkb3QxIC0gZG90Mik7XG4gICAgICAgICAgICB0aGlzLmNsaXBWZXJ0aWNlczFbaW5kZXhdID0geDEgKyAoeDIgLSB4MSkgKiB0O1xuICAgICAgICAgICAgdGhpcy5jbGlwVmVydGljZXMxW2luZGV4ICsgMV0gPSB5MSArICh5MiAtIHkxKSAqIHQ7XG4gICAgICAgICAgICB0aGlzLmNsaXBWZXJ0aWNlczFbaW5kZXggKyAyXSA9IHoxICsgKHoyIC0gejEpICogdDtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKGRvdDIgPiAwKSB7XG4gICAgICAgICAgICBpbmRleCA9IG51bUFkZGVkQ2xpcFZlcnRpY2VzICogMztcbiAgICAgICAgICAgIG51bUFkZGVkQ2xpcFZlcnRpY2VzKys7XG4gICAgICAgICAgICB0ID0gZG90MSAvIChkb3QxIC0gZG90Mik7XG4gICAgICAgICAgICB0aGlzLmNsaXBWZXJ0aWNlczFbaW5kZXhdID0geDEgKyAoeDIgLSB4MSkgKiB0O1xuICAgICAgICAgICAgdGhpcy5jbGlwVmVydGljZXMxW2luZGV4ICsgMV0gPSB5MSArICh5MiAtIHkxKSAqIHQ7XG4gICAgICAgICAgICB0aGlzLmNsaXBWZXJ0aWNlczFbaW5kZXggKyAyXSA9IHoxICsgKHoyIC0gejEpICogdDtcbiAgICAgICAgICAgIGluZGV4ID0gbnVtQWRkZWRDbGlwVmVydGljZXMgKiAzO1xuICAgICAgICAgICAgbnVtQWRkZWRDbGlwVmVydGljZXMrKztcbiAgICAgICAgICAgIHRoaXMuY2xpcFZlcnRpY2VzMVtpbmRleF0gPSB4MjtcbiAgICAgICAgICAgIHRoaXMuY2xpcFZlcnRpY2VzMVtpbmRleCArIDFdID0geTI7XG4gICAgICAgICAgICB0aGlzLmNsaXBWZXJ0aWNlczFbaW5kZXggKyAyXSA9IHoyO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB4MSA9IHgyO1xuICAgICAgICB5MSA9IHkyO1xuICAgICAgICB6MSA9IHoyO1xuICAgICAgICBkb3QxID0gZG90MjtcbiAgICAgIH1cblxuICAgICAgbnVtQ2xpcFZlcnRpY2VzID0gbnVtQWRkZWRDbGlwVmVydGljZXM7XG4gICAgICBpZiAoc3dhcCkge1xuICAgICAgICB2YXIgdGIgPSBiMTtcbiAgICAgICAgYjEgPSBiMjtcbiAgICAgICAgYjIgPSB0YjtcbiAgICAgIH1cbiAgICAgIGlmIChudW1DbGlwVmVydGljZXMgPT0gMCkgcmV0dXJuO1xuICAgICAgdmFyIGZsaXBwZWQgPSBiMSAhPSBzaGFwZTE7XG4gICAgICBpZiAobnVtQ2xpcFZlcnRpY2VzID4gNCkge1xuICAgICAgICB4MSA9IChxMXggKyBxMnggKyBxM3ggKyBxNHgpICogMC4yNTtcbiAgICAgICAgeTEgPSAocTF5ICsgcTJ5ICsgcTN5ICsgcTR5KSAqIDAuMjU7XG4gICAgICAgIHoxID0gKHExeiArIHEyeiArIHEzeiArIHE0eikgKiAwLjI1O1xuICAgICAgICBuMXggPSBxMXggLSB4MTtcbiAgICAgICAgbjF5ID0gcTF5IC0geTE7XG4gICAgICAgIG4xeiA9IHExeiAtIHoxO1xuICAgICAgICBuMnggPSBxMnggLSB4MTtcbiAgICAgICAgbjJ5ID0gcTJ5IC0geTE7XG4gICAgICAgIG4yeiA9IHEyeiAtIHoxO1xuICAgICAgICB2YXIgaW5kZXgxID0gMDtcbiAgICAgICAgdmFyIGluZGV4MiA9IDA7XG4gICAgICAgIHZhciBpbmRleDMgPSAwO1xuICAgICAgICB2YXIgaW5kZXg0ID0gMDtcbiAgICAgICAgdmFyIG1heERvdCA9IC10aGlzLklORjtcbiAgICAgICAgbWluRG90ID0gdGhpcy5JTkY7XG5cbiAgICAgICAgLy9pID0gbnVtQ2xpcFZlcnRpY2VzO1xuICAgICAgICAvL3doaWxlKGktLSl7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBudW1DbGlwVmVydGljZXM7IGkrKykge1xuICAgICAgICAgIHRoaXMudXNlZFtpXSA9IGZhbHNlO1xuICAgICAgICAgIGluZGV4ID0gaSAqIDM7XG4gICAgICAgICAgeDEgPSB0aGlzLmNsaXBWZXJ0aWNlczFbaW5kZXhdO1xuICAgICAgICAgIHkxID0gdGhpcy5jbGlwVmVydGljZXMxW2luZGV4ICsgMV07XG4gICAgICAgICAgejEgPSB0aGlzLmNsaXBWZXJ0aWNlczFbaW5kZXggKyAyXTtcbiAgICAgICAgICBkb3QgPSB4MSAqIG4xeCArIHkxICogbjF5ICsgejEgKiBuMXo7XG4gICAgICAgICAgaWYgKGRvdCA8IG1pbkRvdCkge1xuICAgICAgICAgICAgbWluRG90ID0gZG90O1xuICAgICAgICAgICAgaW5kZXgxID0gaTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGRvdCA+IG1heERvdCkge1xuICAgICAgICAgICAgbWF4RG90ID0gZG90O1xuICAgICAgICAgICAgaW5kZXgzID0gaTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnVzZWRbaW5kZXgxXSA9IHRydWU7XG4gICAgICAgIHRoaXMudXNlZFtpbmRleDNdID0gdHJ1ZTtcbiAgICAgICAgbWF4RG90ID0gLXRoaXMuSU5GO1xuICAgICAgICBtaW5Eb3QgPSB0aGlzLklORjtcblxuICAgICAgICAvL2kgPSBudW1DbGlwVmVydGljZXM7XG4gICAgICAgIC8vd2hpbGUoaS0tKXtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IG51bUNsaXBWZXJ0aWNlczsgaSsrKSB7XG4gICAgICAgICAgaWYgKHRoaXMudXNlZFtpXSkgY29udGludWU7XG4gICAgICAgICAgaW5kZXggPSBpICogMztcbiAgICAgICAgICB4MSA9IHRoaXMuY2xpcFZlcnRpY2VzMVtpbmRleF07XG4gICAgICAgICAgeTEgPSB0aGlzLmNsaXBWZXJ0aWNlczFbaW5kZXggKyAxXTtcbiAgICAgICAgICB6MSA9IHRoaXMuY2xpcFZlcnRpY2VzMVtpbmRleCArIDJdO1xuICAgICAgICAgIGRvdCA9IHgxICogbjJ4ICsgeTEgKiBuMnkgKyB6MSAqIG4yejtcbiAgICAgICAgICBpZiAoZG90IDwgbWluRG90KSB7XG4gICAgICAgICAgICBtaW5Eb3QgPSBkb3Q7XG4gICAgICAgICAgICBpbmRleDIgPSBpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoZG90ID4gbWF4RG90KSB7XG4gICAgICAgICAgICBtYXhEb3QgPSBkb3Q7XG4gICAgICAgICAgICBpbmRleDQgPSBpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGluZGV4ID0gaW5kZXgxICogMztcbiAgICAgICAgeDEgPSB0aGlzLmNsaXBWZXJ0aWNlczFbaW5kZXhdO1xuICAgICAgICB5MSA9IHRoaXMuY2xpcFZlcnRpY2VzMVtpbmRleCArIDFdO1xuICAgICAgICB6MSA9IHRoaXMuY2xpcFZlcnRpY2VzMVtpbmRleCArIDJdO1xuICAgICAgICBkb3QgPSAoeDEgLSBjeCkgKiBueCArICh5MSAtIGN5KSAqIG55ICsgKHoxIC0gY3opICogbno7XG4gICAgICAgIGlmIChkb3QgPCAwKSBtYW5pZm9sZC5hZGRQb2ludCh4MSwgeTEsIHoxLCBueCwgbnksIG56LCBkb3QsIGZsaXBwZWQpO1xuXG4gICAgICAgIGluZGV4ID0gaW5kZXgyICogMztcbiAgICAgICAgeDEgPSB0aGlzLmNsaXBWZXJ0aWNlczFbaW5kZXhdO1xuICAgICAgICB5MSA9IHRoaXMuY2xpcFZlcnRpY2VzMVtpbmRleCArIDFdO1xuICAgICAgICB6MSA9IHRoaXMuY2xpcFZlcnRpY2VzMVtpbmRleCArIDJdO1xuICAgICAgICBkb3QgPSAoeDEgLSBjeCkgKiBueCArICh5MSAtIGN5KSAqIG55ICsgKHoxIC0gY3opICogbno7XG4gICAgICAgIGlmIChkb3QgPCAwKSBtYW5pZm9sZC5hZGRQb2ludCh4MSwgeTEsIHoxLCBueCwgbnksIG56LCBkb3QsIGZsaXBwZWQpO1xuXG4gICAgICAgIGluZGV4ID0gaW5kZXgzICogMztcbiAgICAgICAgeDEgPSB0aGlzLmNsaXBWZXJ0aWNlczFbaW5kZXhdO1xuICAgICAgICB5MSA9IHRoaXMuY2xpcFZlcnRpY2VzMVtpbmRleCArIDFdO1xuICAgICAgICB6MSA9IHRoaXMuY2xpcFZlcnRpY2VzMVtpbmRleCArIDJdO1xuICAgICAgICBkb3QgPSAoeDEgLSBjeCkgKiBueCArICh5MSAtIGN5KSAqIG55ICsgKHoxIC0gY3opICogbno7XG4gICAgICAgIGlmIChkb3QgPCAwKSBtYW5pZm9sZC5hZGRQb2ludCh4MSwgeTEsIHoxLCBueCwgbnksIG56LCBkb3QsIGZsaXBwZWQpO1xuXG4gICAgICAgIGluZGV4ID0gaW5kZXg0ICogMztcbiAgICAgICAgeDEgPSB0aGlzLmNsaXBWZXJ0aWNlczFbaW5kZXhdO1xuICAgICAgICB5MSA9IHRoaXMuY2xpcFZlcnRpY2VzMVtpbmRleCArIDFdO1xuICAgICAgICB6MSA9IHRoaXMuY2xpcFZlcnRpY2VzMVtpbmRleCArIDJdO1xuICAgICAgICBkb3QgPSAoeDEgLSBjeCkgKiBueCArICh5MSAtIGN5KSAqIG55ICsgKHoxIC0gY3opICogbno7XG4gICAgICAgIGlmIChkb3QgPCAwKSBtYW5pZm9sZC5hZGRQb2ludCh4MSwgeTEsIHoxLCBueCwgbnksIG56LCBkb3QsIGZsaXBwZWQpO1xuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvL2kgPSBudW1DbGlwVmVydGljZXM7XG4gICAgICAgIC8vd2hpbGUoaS0tKXtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IG51bUNsaXBWZXJ0aWNlczsgaSsrKSB7XG4gICAgICAgICAgaW5kZXggPSBpICogMztcbiAgICAgICAgICB4MSA9IHRoaXMuY2xpcFZlcnRpY2VzMVtpbmRleF07XG4gICAgICAgICAgeTEgPSB0aGlzLmNsaXBWZXJ0aWNlczFbaW5kZXggKyAxXTtcbiAgICAgICAgICB6MSA9IHRoaXMuY2xpcFZlcnRpY2VzMVtpbmRleCArIDJdO1xuICAgICAgICAgIGRvdCA9ICh4MSAtIGN4KSAqIG54ICsgKHkxIC0gY3kpICogbnkgKyAoejEgLSBjeikgKiBuejtcbiAgICAgICAgICBpZiAoZG90IDwgMCkgbWFuaWZvbGQuYWRkUG9pbnQoeDEsIHkxLCB6MSwgbngsIG55LCBueiwgZG90LCBmbGlwcGVkKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgfVxuXG4gIH0pO1xuXG4gIGZ1bmN0aW9uIEJveEN5bGluZGVyQ29sbGlzaW9uRGV0ZWN0b3IoZmxpcCkge1xuXG4gICAgQ29sbGlzaW9uRGV0ZWN0b3IuY2FsbCh0aGlzKTtcbiAgICB0aGlzLmZsaXAgPSBmbGlwO1xuXG4gIH1cbiAgQm94Q3lsaW5kZXJDb2xsaXNpb25EZXRlY3Rvci5wcm90b3R5cGUgPSBPYmplY3QuYXNzaWduKE9iamVjdC5jcmVhdGUoQ29sbGlzaW9uRGV0ZWN0b3IucHJvdG90eXBlKSwge1xuXG4gICAgY29uc3RydWN0b3I6IEJveEN5bGluZGVyQ29sbGlzaW9uRGV0ZWN0b3IsXG5cbiAgICBnZXRTZXA6IGZ1bmN0aW9uIChjMSwgYzIsIHNlcCwgcG9zLCBkZXApIHtcblxuICAgICAgdmFyIHQxeDtcbiAgICAgIHZhciB0MXk7XG4gICAgICB2YXIgdDF6O1xuICAgICAgdmFyIHQyeDtcbiAgICAgIHZhciB0Mnk7XG4gICAgICB2YXIgdDJ6O1xuICAgICAgdmFyIHN1cCA9IG5ldyBWZWMzKCk7XG4gICAgICB2YXIgbGVuO1xuICAgICAgdmFyIHAxeDtcbiAgICAgIHZhciBwMXk7XG4gICAgICB2YXIgcDF6O1xuICAgICAgdmFyIHAyeDtcbiAgICAgIHZhciBwMnk7XG4gICAgICB2YXIgcDJ6O1xuICAgICAgdmFyIHYwMXggPSBjMS5wb3NpdGlvbi54O1xuICAgICAgdmFyIHYwMXkgPSBjMS5wb3NpdGlvbi55O1xuICAgICAgdmFyIHYwMXogPSBjMS5wb3NpdGlvbi56O1xuICAgICAgdmFyIHYwMnggPSBjMi5wb3NpdGlvbi54O1xuICAgICAgdmFyIHYwMnkgPSBjMi5wb3NpdGlvbi55O1xuICAgICAgdmFyIHYwMnogPSBjMi5wb3NpdGlvbi56O1xuICAgICAgdmFyIHYweCA9IHYwMnggLSB2MDF4O1xuICAgICAgdmFyIHYweSA9IHYwMnkgLSB2MDF5O1xuICAgICAgdmFyIHYweiA9IHYwMnogLSB2MDF6O1xuICAgICAgaWYgKHYweCAqIHYweCArIHYweSAqIHYweSArIHYweiAqIHYweiA9PSAwKSB2MHkgPSAwLjAwMTtcbiAgICAgIHZhciBueCA9IC12MHg7XG4gICAgICB2YXIgbnkgPSAtdjB5O1xuICAgICAgdmFyIG56ID0gLXYwejtcbiAgICAgIHRoaXMuc3VwcG9ydFBvaW50QihjMSwgLW54LCAtbnksIC1ueiwgc3VwKTtcbiAgICAgIHZhciB2MTF4ID0gc3VwLng7XG4gICAgICB2YXIgdjExeSA9IHN1cC55O1xuICAgICAgdmFyIHYxMXogPSBzdXAuejtcbiAgICAgIHRoaXMuc3VwcG9ydFBvaW50QyhjMiwgbngsIG55LCBueiwgc3VwKTtcbiAgICAgIHZhciB2MTJ4ID0gc3VwLng7XG4gICAgICB2YXIgdjEyeSA9IHN1cC55O1xuICAgICAgdmFyIHYxMnogPSBzdXAuejtcbiAgICAgIHZhciB2MXggPSB2MTJ4IC0gdjExeDtcbiAgICAgIHZhciB2MXkgPSB2MTJ5IC0gdjExeTtcbiAgICAgIHZhciB2MXogPSB2MTJ6IC0gdjExejtcbiAgICAgIGlmICh2MXggKiBueCArIHYxeSAqIG55ICsgdjF6ICogbnogPD0gMCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICBueCA9IHYxeSAqIHYweiAtIHYxeiAqIHYweTtcbiAgICAgIG55ID0gdjF6ICogdjB4IC0gdjF4ICogdjB6O1xuICAgICAgbnogPSB2MXggKiB2MHkgLSB2MXkgKiB2MHg7XG4gICAgICBpZiAobnggKiBueCArIG55ICogbnkgKyBueiAqIG56ID09IDApIHtcbiAgICAgICAgc2VwLnNldCh2MXggLSB2MHgsIHYxeSAtIHYweSwgdjF6IC0gdjB6KS5ub3JtYWxpemUoKTtcbiAgICAgICAgcG9zLnNldCgodjExeCArIHYxMngpICogMC41LCAodjExeSArIHYxMnkpICogMC41LCAodjExeiArIHYxMnopICogMC41KTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICB0aGlzLnN1cHBvcnRQb2ludEIoYzEsIC1ueCwgLW55LCAtbnosIHN1cCk7XG4gICAgICB2YXIgdjIxeCA9IHN1cC54O1xuICAgICAgdmFyIHYyMXkgPSBzdXAueTtcbiAgICAgIHZhciB2MjF6ID0gc3VwLno7XG4gICAgICB0aGlzLnN1cHBvcnRQb2ludEMoYzIsIG54LCBueSwgbnosIHN1cCk7XG4gICAgICB2YXIgdjIyeCA9IHN1cC54O1xuICAgICAgdmFyIHYyMnkgPSBzdXAueTtcbiAgICAgIHZhciB2MjJ6ID0gc3VwLno7XG4gICAgICB2YXIgdjJ4ID0gdjIyeCAtIHYyMXg7XG4gICAgICB2YXIgdjJ5ID0gdjIyeSAtIHYyMXk7XG4gICAgICB2YXIgdjJ6ID0gdjIyeiAtIHYyMXo7XG4gICAgICBpZiAodjJ4ICogbnggKyB2MnkgKiBueSArIHYyeiAqIG56IDw9IDApIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgdDF4ID0gdjF4IC0gdjB4O1xuICAgICAgdDF5ID0gdjF5IC0gdjB5O1xuICAgICAgdDF6ID0gdjF6IC0gdjB6O1xuICAgICAgdDJ4ID0gdjJ4IC0gdjB4O1xuICAgICAgdDJ5ID0gdjJ5IC0gdjB5O1xuICAgICAgdDJ6ID0gdjJ6IC0gdjB6O1xuICAgICAgbnggPSB0MXkgKiB0MnogLSB0MXogKiB0Mnk7XG4gICAgICBueSA9IHQxeiAqIHQyeCAtIHQxeCAqIHQyejtcbiAgICAgIG56ID0gdDF4ICogdDJ5IC0gdDF5ICogdDJ4O1xuICAgICAgaWYgKG54ICogdjB4ICsgbnkgKiB2MHkgKyBueiAqIHYweiA+IDApIHtcbiAgICAgICAgdDF4ID0gdjF4O1xuICAgICAgICB0MXkgPSB2MXk7XG4gICAgICAgIHQxeiA9IHYxejtcbiAgICAgICAgdjF4ID0gdjJ4O1xuICAgICAgICB2MXkgPSB2Mnk7XG4gICAgICAgIHYxeiA9IHYyejtcbiAgICAgICAgdjJ4ID0gdDF4O1xuICAgICAgICB2MnkgPSB0MXk7XG4gICAgICAgIHYyeiA9IHQxejtcbiAgICAgICAgdDF4ID0gdjExeDtcbiAgICAgICAgdDF5ID0gdjExeTtcbiAgICAgICAgdDF6ID0gdjExejtcbiAgICAgICAgdjExeCA9IHYyMXg7XG4gICAgICAgIHYxMXkgPSB2MjF5O1xuICAgICAgICB2MTF6ID0gdjIxejtcbiAgICAgICAgdjIxeCA9IHQxeDtcbiAgICAgICAgdjIxeSA9IHQxeTtcbiAgICAgICAgdjIxeiA9IHQxejtcbiAgICAgICAgdDF4ID0gdjEyeDtcbiAgICAgICAgdDF5ID0gdjEyeTtcbiAgICAgICAgdDF6ID0gdjEyejtcbiAgICAgICAgdjEyeCA9IHYyMng7XG4gICAgICAgIHYxMnkgPSB2MjJ5O1xuICAgICAgICB2MTJ6ID0gdjIyejtcbiAgICAgICAgdjIyeCA9IHQxeDtcbiAgICAgICAgdjIyeSA9IHQxeTtcbiAgICAgICAgdjIyeiA9IHQxejtcbiAgICAgICAgbnggPSAtbng7XG4gICAgICAgIG55ID0gLW55O1xuICAgICAgICBueiA9IC1uejtcbiAgICAgIH1cbiAgICAgIHZhciBpdGVyYXRpb25zID0gMDtcbiAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgIGlmICgrK2l0ZXJhdGlvbnMgPiAxMDApIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zdXBwb3J0UG9pbnRCKGMxLCAtbngsIC1ueSwgLW56LCBzdXApO1xuICAgICAgICB2YXIgdjMxeCA9IHN1cC54O1xuICAgICAgICB2YXIgdjMxeSA9IHN1cC55O1xuICAgICAgICB2YXIgdjMxeiA9IHN1cC56O1xuICAgICAgICB0aGlzLnN1cHBvcnRQb2ludEMoYzIsIG54LCBueSwgbnosIHN1cCk7XG4gICAgICAgIHZhciB2MzJ4ID0gc3VwLng7XG4gICAgICAgIHZhciB2MzJ5ID0gc3VwLnk7XG4gICAgICAgIHZhciB2MzJ6ID0gc3VwLno7XG4gICAgICAgIHZhciB2M3ggPSB2MzJ4IC0gdjMxeDtcbiAgICAgICAgdmFyIHYzeSA9IHYzMnkgLSB2MzF5O1xuICAgICAgICB2YXIgdjN6ID0gdjMyeiAtIHYzMXo7XG4gICAgICAgIGlmICh2M3ggKiBueCArIHYzeSAqIG55ICsgdjN6ICogbnogPD0gMCkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoKHYxeSAqIHYzeiAtIHYxeiAqIHYzeSkgKiB2MHggKyAodjF6ICogdjN4IC0gdjF4ICogdjN6KSAqIHYweSArICh2MXggKiB2M3kgLSB2MXkgKiB2M3gpICogdjB6IDwgMCkge1xuICAgICAgICAgIHYyeCA9IHYzeDtcbiAgICAgICAgICB2MnkgPSB2M3k7XG4gICAgICAgICAgdjJ6ID0gdjN6O1xuICAgICAgICAgIHYyMXggPSB2MzF4O1xuICAgICAgICAgIHYyMXkgPSB2MzF5O1xuICAgICAgICAgIHYyMXogPSB2MzF6O1xuICAgICAgICAgIHYyMnggPSB2MzJ4O1xuICAgICAgICAgIHYyMnkgPSB2MzJ5O1xuICAgICAgICAgIHYyMnogPSB2MzJ6O1xuICAgICAgICAgIHQxeCA9IHYxeCAtIHYweDtcbiAgICAgICAgICB0MXkgPSB2MXkgLSB2MHk7XG4gICAgICAgICAgdDF6ID0gdjF6IC0gdjB6O1xuICAgICAgICAgIHQyeCA9IHYzeCAtIHYweDtcbiAgICAgICAgICB0MnkgPSB2M3kgLSB2MHk7XG4gICAgICAgICAgdDJ6ID0gdjN6IC0gdjB6O1xuICAgICAgICAgIG54ID0gdDF5ICogdDJ6IC0gdDF6ICogdDJ5O1xuICAgICAgICAgIG55ID0gdDF6ICogdDJ4IC0gdDF4ICogdDJ6O1xuICAgICAgICAgIG56ID0gdDF4ICogdDJ5IC0gdDF5ICogdDJ4O1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGlmICgodjN5ICogdjJ6IC0gdjN6ICogdjJ5KSAqIHYweCArICh2M3ogKiB2MnggLSB2M3ggKiB2MnopICogdjB5ICsgKHYzeCAqIHYyeSAtIHYzeSAqIHYyeCkgKiB2MHogPCAwKSB7XG4gICAgICAgICAgdjF4ID0gdjN4O1xuICAgICAgICAgIHYxeSA9IHYzeTtcbiAgICAgICAgICB2MXogPSB2M3o7XG4gICAgICAgICAgdjExeCA9IHYzMXg7XG4gICAgICAgICAgdjExeSA9IHYzMXk7XG4gICAgICAgICAgdjExeiA9IHYzMXo7XG4gICAgICAgICAgdjEyeCA9IHYzMng7XG4gICAgICAgICAgdjEyeSA9IHYzMnk7XG4gICAgICAgICAgdjEyeiA9IHYzMno7XG4gICAgICAgICAgdDF4ID0gdjN4IC0gdjB4O1xuICAgICAgICAgIHQxeSA9IHYzeSAtIHYweTtcbiAgICAgICAgICB0MXogPSB2M3ogLSB2MHo7XG4gICAgICAgICAgdDJ4ID0gdjJ4IC0gdjB4O1xuICAgICAgICAgIHQyeSA9IHYyeSAtIHYweTtcbiAgICAgICAgICB0MnogPSB2MnogLSB2MHo7XG4gICAgICAgICAgbnggPSB0MXkgKiB0MnogLSB0MXogKiB0Mnk7XG4gICAgICAgICAgbnkgPSB0MXogKiB0MnggLSB0MXggKiB0Mno7XG4gICAgICAgICAgbnogPSB0MXggKiB0MnkgLSB0MXkgKiB0Mng7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGhpdCA9IGZhbHNlO1xuICAgICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICAgIHQxeCA9IHYyeCAtIHYxeDtcbiAgICAgICAgICB0MXkgPSB2MnkgLSB2MXk7XG4gICAgICAgICAgdDF6ID0gdjJ6IC0gdjF6O1xuICAgICAgICAgIHQyeCA9IHYzeCAtIHYxeDtcbiAgICAgICAgICB0MnkgPSB2M3kgLSB2MXk7XG4gICAgICAgICAgdDJ6ID0gdjN6IC0gdjF6O1xuICAgICAgICAgIG54ID0gdDF5ICogdDJ6IC0gdDF6ICogdDJ5O1xuICAgICAgICAgIG55ID0gdDF6ICogdDJ4IC0gdDF4ICogdDJ6O1xuICAgICAgICAgIG56ID0gdDF4ICogdDJ5IC0gdDF5ICogdDJ4O1xuICAgICAgICAgIGxlbiA9IDEgLyBfTWF0aC5zcXJ0KG54ICogbnggKyBueSAqIG55ICsgbnogKiBueik7XG4gICAgICAgICAgbnggKj0gbGVuO1xuICAgICAgICAgIG55ICo9IGxlbjtcbiAgICAgICAgICBueiAqPSBsZW47XG4gICAgICAgICAgaWYgKG54ICogdjF4ICsgbnkgKiB2MXkgKyBueiAqIHYxeiA+PSAwICYmICFoaXQpIHtcbiAgICAgICAgICAgIHZhciBiMCA9ICh2MXkgKiB2MnogLSB2MXogKiB2MnkpICogdjN4ICsgKHYxeiAqIHYyeCAtIHYxeCAqIHYyeikgKiB2M3kgKyAodjF4ICogdjJ5IC0gdjF5ICogdjJ4KSAqIHYzejtcbiAgICAgICAgICAgIHZhciBiMSA9ICh2M3kgKiB2MnogLSB2M3ogKiB2MnkpICogdjB4ICsgKHYzeiAqIHYyeCAtIHYzeCAqIHYyeikgKiB2MHkgKyAodjN4ICogdjJ5IC0gdjN5ICogdjJ4KSAqIHYwejtcbiAgICAgICAgICAgIHZhciBiMiA9ICh2MHkgKiB2MXogLSB2MHogKiB2MXkpICogdjN4ICsgKHYweiAqIHYxeCAtIHYweCAqIHYxeikgKiB2M3kgKyAodjB4ICogdjF5IC0gdjB5ICogdjF4KSAqIHYzejtcbiAgICAgICAgICAgIHZhciBiMyA9ICh2MnkgKiB2MXogLSB2MnogKiB2MXkpICogdjB4ICsgKHYyeiAqIHYxeCAtIHYyeCAqIHYxeikgKiB2MHkgKyAodjJ4ICogdjF5IC0gdjJ5ICogdjF4KSAqIHYwejtcbiAgICAgICAgICAgIHZhciBzdW0gPSBiMCArIGIxICsgYjIgKyBiMztcbiAgICAgICAgICAgIGlmIChzdW0gPD0gMCkge1xuICAgICAgICAgICAgICBiMCA9IDA7XG4gICAgICAgICAgICAgIGIxID0gKHYyeSAqIHYzeiAtIHYyeiAqIHYzeSkgKiBueCArICh2MnogKiB2M3ggLSB2MnggKiB2M3opICogbnkgKyAodjJ4ICogdjN5IC0gdjJ5ICogdjN4KSAqIG56O1xuICAgICAgICAgICAgICBiMiA9ICh2M3kgKiB2MnogLSB2M3ogKiB2MnkpICogbnggKyAodjN6ICogdjJ4IC0gdjN4ICogdjJ6KSAqIG55ICsgKHYzeCAqIHYyeSAtIHYzeSAqIHYyeCkgKiBuejtcbiAgICAgICAgICAgICAgYjMgPSAodjF5ICogdjJ6IC0gdjF6ICogdjJ5KSAqIG54ICsgKHYxeiAqIHYyeCAtIHYxeCAqIHYyeikgKiBueSArICh2MXggKiB2MnkgLSB2MXkgKiB2MngpICogbno7XG4gICAgICAgICAgICAgIHN1bSA9IGIxICsgYjIgKyBiMztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBpbnYgPSAxIC8gc3VtO1xuICAgICAgICAgICAgcDF4ID0gKHYwMXggKiBiMCArIHYxMXggKiBiMSArIHYyMXggKiBiMiArIHYzMXggKiBiMykgKiBpbnY7XG4gICAgICAgICAgICBwMXkgPSAodjAxeSAqIGIwICsgdjExeSAqIGIxICsgdjIxeSAqIGIyICsgdjMxeSAqIGIzKSAqIGludjtcbiAgICAgICAgICAgIHAxeiA9ICh2MDF6ICogYjAgKyB2MTF6ICogYjEgKyB2MjF6ICogYjIgKyB2MzF6ICogYjMpICogaW52O1xuICAgICAgICAgICAgcDJ4ID0gKHYwMnggKiBiMCArIHYxMnggKiBiMSArIHYyMnggKiBiMiArIHYzMnggKiBiMykgKiBpbnY7XG4gICAgICAgICAgICBwMnkgPSAodjAyeSAqIGIwICsgdjEyeSAqIGIxICsgdjIyeSAqIGIyICsgdjMyeSAqIGIzKSAqIGludjtcbiAgICAgICAgICAgIHAyeiA9ICh2MDJ6ICogYjAgKyB2MTJ6ICogYjEgKyB2MjJ6ICogYjIgKyB2MzJ6ICogYjMpICogaW52O1xuICAgICAgICAgICAgaGl0ID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5zdXBwb3J0UG9pbnRCKGMxLCAtbngsIC1ueSwgLW56LCBzdXApO1xuICAgICAgICAgIHZhciB2NDF4ID0gc3VwLng7XG4gICAgICAgICAgdmFyIHY0MXkgPSBzdXAueTtcbiAgICAgICAgICB2YXIgdjQxeiA9IHN1cC56O1xuICAgICAgICAgIHRoaXMuc3VwcG9ydFBvaW50QyhjMiwgbngsIG55LCBueiwgc3VwKTtcbiAgICAgICAgICB2YXIgdjQyeCA9IHN1cC54O1xuICAgICAgICAgIHZhciB2NDJ5ID0gc3VwLnk7XG4gICAgICAgICAgdmFyIHY0MnogPSBzdXAuejtcbiAgICAgICAgICB2YXIgdjR4ID0gdjQyeCAtIHY0MXg7XG4gICAgICAgICAgdmFyIHY0eSA9IHY0MnkgLSB2NDF5O1xuICAgICAgICAgIHZhciB2NHogPSB2NDJ6IC0gdjQxejtcbiAgICAgICAgICB2YXIgc2VwYXJhdGlvbiA9IC0odjR4ICogbnggKyB2NHkgKiBueSArIHY0eiAqIG56KTtcbiAgICAgICAgICBpZiAoKHY0eCAtIHYzeCkgKiBueCArICh2NHkgLSB2M3kpICogbnkgKyAodjR6IC0gdjN6KSAqIG56IDw9IDAuMDEgfHwgc2VwYXJhdGlvbiA+PSAwKSB7XG4gICAgICAgICAgICBpZiAoaGl0KSB7XG4gICAgICAgICAgICAgIHNlcC5zZXQoLW54LCAtbnksIC1ueik7XG4gICAgICAgICAgICAgIHBvcy5zZXQoKHAxeCArIHAyeCkgKiAwLjUsIChwMXkgKyBwMnkpICogMC41LCAocDF6ICsgcDJ6KSAqIDAuNSk7XG4gICAgICAgICAgICAgIGRlcC54ID0gc2VwYXJhdGlvbjtcbiAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICh2NHkgKiB2MXogLSB2NHogKiB2MXkpICogdjB4ICtcbiAgICAgICAgICAgICh2NHogKiB2MXggLSB2NHggKiB2MXopICogdjB5ICtcbiAgICAgICAgICAgICh2NHggKiB2MXkgLSB2NHkgKiB2MXgpICogdjB6IDwgMFxuICAgICAgICAgICkge1xuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAodjR5ICogdjJ6IC0gdjR6ICogdjJ5KSAqIHYweCArXG4gICAgICAgICAgICAgICh2NHogKiB2MnggLSB2NHggKiB2MnopICogdjB5ICtcbiAgICAgICAgICAgICAgKHY0eCAqIHYyeSAtIHY0eSAqIHYyeCkgKiB2MHogPCAwXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgdjF4ID0gdjR4O1xuICAgICAgICAgICAgICB2MXkgPSB2NHk7XG4gICAgICAgICAgICAgIHYxeiA9IHY0ejtcbiAgICAgICAgICAgICAgdjExeCA9IHY0MXg7XG4gICAgICAgICAgICAgIHYxMXkgPSB2NDF5O1xuICAgICAgICAgICAgICB2MTF6ID0gdjQxejtcbiAgICAgICAgICAgICAgdjEyeCA9IHY0Mng7XG4gICAgICAgICAgICAgIHYxMnkgPSB2NDJ5O1xuICAgICAgICAgICAgICB2MTJ6ID0gdjQyejtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHYzeCA9IHY0eDtcbiAgICAgICAgICAgICAgdjN5ID0gdjR5O1xuICAgICAgICAgICAgICB2M3ogPSB2NHo7XG4gICAgICAgICAgICAgIHYzMXggPSB2NDF4O1xuICAgICAgICAgICAgICB2MzF5ID0gdjQxeTtcbiAgICAgICAgICAgICAgdjMxeiA9IHY0MXo7XG4gICAgICAgICAgICAgIHYzMnggPSB2NDJ4O1xuICAgICAgICAgICAgICB2MzJ5ID0gdjQyeTtcbiAgICAgICAgICAgICAgdjMyeiA9IHY0Mno7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgKHY0eSAqIHYzeiAtIHY0eiAqIHYzeSkgKiB2MHggK1xuICAgICAgICAgICAgICAodjR6ICogdjN4IC0gdjR4ICogdjN6KSAqIHYweSArXG4gICAgICAgICAgICAgICh2NHggKiB2M3kgLSB2NHkgKiB2M3gpICogdjB6IDwgMFxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgIHYyeCA9IHY0eDtcbiAgICAgICAgICAgICAgdjJ5ID0gdjR5O1xuICAgICAgICAgICAgICB2MnogPSB2NHo7XG4gICAgICAgICAgICAgIHYyMXggPSB2NDF4O1xuICAgICAgICAgICAgICB2MjF5ID0gdjQxeTtcbiAgICAgICAgICAgICAgdjIxeiA9IHY0MXo7XG4gICAgICAgICAgICAgIHYyMnggPSB2NDJ4O1xuICAgICAgICAgICAgICB2MjJ5ID0gdjQyeTtcbiAgICAgICAgICAgICAgdjIyeiA9IHY0Mno7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB2MXggPSB2NHg7XG4gICAgICAgICAgICAgIHYxeSA9IHY0eTtcbiAgICAgICAgICAgICAgdjF6ID0gdjR6O1xuICAgICAgICAgICAgICB2MTF4ID0gdjQxeDtcbiAgICAgICAgICAgICAgdjExeSA9IHY0MXk7XG4gICAgICAgICAgICAgIHYxMXogPSB2NDF6O1xuICAgICAgICAgICAgICB2MTJ4ID0gdjQyeDtcbiAgICAgICAgICAgICAgdjEyeSA9IHY0Mnk7XG4gICAgICAgICAgICAgIHYxMnogPSB2NDJ6O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy9yZXR1cm4gZmFsc2U7XG4gICAgfSxcblxuICAgIHN1cHBvcnRQb2ludEI6IGZ1bmN0aW9uIChjLCBkeCwgZHksIGR6LCBvdXQpIHtcblxuICAgICAgdmFyIHJvdCA9IGMucm90YXRpb24uZWxlbWVudHM7XG4gICAgICB2YXIgbGR4ID0gcm90WzBdICogZHggKyByb3RbM10gKiBkeSArIHJvdFs2XSAqIGR6O1xuICAgICAgdmFyIGxkeSA9IHJvdFsxXSAqIGR4ICsgcm90WzRdICogZHkgKyByb3RbN10gKiBkejtcbiAgICAgIHZhciBsZHogPSByb3RbMl0gKiBkeCArIHJvdFs1XSAqIGR5ICsgcm90WzhdICogZHo7XG4gICAgICB2YXIgdyA9IGMuaGFsZldpZHRoO1xuICAgICAgdmFyIGggPSBjLmhhbGZIZWlnaHQ7XG4gICAgICB2YXIgZCA9IGMuaGFsZkRlcHRoO1xuICAgICAgdmFyIG94O1xuICAgICAgdmFyIG95O1xuICAgICAgdmFyIG96O1xuICAgICAgaWYgKGxkeCA8IDApIG94ID0gLXc7XG4gICAgICBlbHNlIG94ID0gdztcbiAgICAgIGlmIChsZHkgPCAwKSBveSA9IC1oO1xuICAgICAgZWxzZSBveSA9IGg7XG4gICAgICBpZiAobGR6IDwgMCkgb3ogPSAtZDtcbiAgICAgIGVsc2Ugb3ogPSBkO1xuICAgICAgbGR4ID0gcm90WzBdICogb3ggKyByb3RbMV0gKiBveSArIHJvdFsyXSAqIG96ICsgYy5wb3NpdGlvbi54O1xuICAgICAgbGR5ID0gcm90WzNdICogb3ggKyByb3RbNF0gKiBveSArIHJvdFs1XSAqIG96ICsgYy5wb3NpdGlvbi55O1xuICAgICAgbGR6ID0gcm90WzZdICogb3ggKyByb3RbN10gKiBveSArIHJvdFs4XSAqIG96ICsgYy5wb3NpdGlvbi56O1xuICAgICAgb3V0LnNldChsZHgsIGxkeSwgbGR6KTtcblxuICAgIH0sXG5cbiAgICBzdXBwb3J0UG9pbnRDOiBmdW5jdGlvbiAoYywgZHgsIGR5LCBkeiwgb3V0KSB7XG5cbiAgICAgIHZhciByb3QgPSBjLnJvdGF0aW9uLmVsZW1lbnRzO1xuICAgICAgdmFyIGxkeCA9IHJvdFswXSAqIGR4ICsgcm90WzNdICogZHkgKyByb3RbNl0gKiBkejtcbiAgICAgIHZhciBsZHkgPSByb3RbMV0gKiBkeCArIHJvdFs0XSAqIGR5ICsgcm90WzddICogZHo7XG4gICAgICB2YXIgbGR6ID0gcm90WzJdICogZHggKyByb3RbNV0gKiBkeSArIHJvdFs4XSAqIGR6O1xuICAgICAgdmFyIHJhZHggPSBsZHg7XG4gICAgICB2YXIgcmFkeiA9IGxkejtcbiAgICAgIHZhciBsZW4gPSByYWR4ICogcmFkeCArIHJhZHogKiByYWR6O1xuICAgICAgdmFyIHJhZCA9IGMucmFkaXVzO1xuICAgICAgdmFyIGhoID0gYy5oYWxmSGVpZ2h0O1xuICAgICAgdmFyIG94O1xuICAgICAgdmFyIG95O1xuICAgICAgdmFyIG96O1xuICAgICAgaWYgKGxlbiA9PSAwKSB7XG4gICAgICAgIGlmIChsZHkgPCAwKSB7XG4gICAgICAgICAgb3ggPSByYWQ7XG4gICAgICAgICAgb3kgPSAtaGg7XG4gICAgICAgICAgb3ogPSAwO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG94ID0gcmFkO1xuICAgICAgICAgIG95ID0gaGg7XG4gICAgICAgICAgb3ogPSAwO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsZW4gPSBjLnJhZGl1cyAvIF9NYXRoLnNxcnQobGVuKTtcbiAgICAgICAgaWYgKGxkeSA8IDApIHtcbiAgICAgICAgICBveCA9IHJhZHggKiBsZW47XG4gICAgICAgICAgb3kgPSAtaGg7XG4gICAgICAgICAgb3ogPSByYWR6ICogbGVuO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG94ID0gcmFkeCAqIGxlbjtcbiAgICAgICAgICBveSA9IGhoO1xuICAgICAgICAgIG96ID0gcmFkeiAqIGxlbjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgbGR4ID0gcm90WzBdICogb3ggKyByb3RbMV0gKiBveSArIHJvdFsyXSAqIG96ICsgYy5wb3NpdGlvbi54O1xuICAgICAgbGR5ID0gcm90WzNdICogb3ggKyByb3RbNF0gKiBveSArIHJvdFs1XSAqIG96ICsgYy5wb3NpdGlvbi55O1xuICAgICAgbGR6ID0gcm90WzZdICogb3ggKyByb3RbN10gKiBveSArIHJvdFs4XSAqIG96ICsgYy5wb3NpdGlvbi56O1xuICAgICAgb3V0LnNldChsZHgsIGxkeSwgbGR6KTtcblxuICAgIH0sXG5cbiAgICBkZXRlY3RDb2xsaXNpb246IGZ1bmN0aW9uIChzaGFwZTEsIHNoYXBlMiwgbWFuaWZvbGQpIHtcblxuICAgICAgdmFyIGI7XG4gICAgICB2YXIgYztcbiAgICAgIGlmICh0aGlzLmZsaXApIHtcbiAgICAgICAgYiA9IHNoYXBlMjtcbiAgICAgICAgYyA9IHNoYXBlMTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGIgPSBzaGFwZTE7XG4gICAgICAgIGMgPSBzaGFwZTI7XG4gICAgICB9XG4gICAgICB2YXIgc2VwID0gbmV3IFZlYzMoKTtcbiAgICAgIHZhciBwb3MgPSBuZXcgVmVjMygpO1xuICAgICAgdmFyIGRlcCA9IG5ldyBWZWMzKCk7XG5cbiAgICAgIGlmICghdGhpcy5nZXRTZXAoYiwgYywgc2VwLCBwb3MsIGRlcCkpIHJldHVybjtcbiAgICAgIHZhciBwYnggPSBiLnBvc2l0aW9uLng7XG4gICAgICB2YXIgcGJ5ID0gYi5wb3NpdGlvbi55O1xuICAgICAgdmFyIHBieiA9IGIucG9zaXRpb24uejtcbiAgICAgIHZhciBwY3ggPSBjLnBvc2l0aW9uLng7XG4gICAgICB2YXIgcGN5ID0gYy5wb3NpdGlvbi55O1xuICAgICAgdmFyIHBjeiA9IGMucG9zaXRpb24uejtcbiAgICAgIHZhciBidyA9IGIuaGFsZldpZHRoO1xuICAgICAgdmFyIGJoID0gYi5oYWxmSGVpZ2h0O1xuICAgICAgdmFyIGJkID0gYi5oYWxmRGVwdGg7XG4gICAgICB2YXIgY2ggPSBjLmhhbGZIZWlnaHQ7XG4gICAgICB2YXIgciA9IGMucmFkaXVzO1xuXG4gICAgICB2YXIgRCA9IGIuZGltZW50aW9ucztcblxuICAgICAgdmFyIG53eCA9IERbMF07Ly9iLm5vcm1hbERpcmVjdGlvbldpZHRoLng7XG4gICAgICB2YXIgbnd5ID0gRFsxXTsvL2Iubm9ybWFsRGlyZWN0aW9uV2lkdGgueTtcbiAgICAgIHZhciBud3ogPSBEWzJdOy8vYi5ub3JtYWxEaXJlY3Rpb25XaWR0aC56O1xuICAgICAgdmFyIG5oeCA9IERbM107Ly9iLm5vcm1hbERpcmVjdGlvbkhlaWdodC54O1xuICAgICAgdmFyIG5oeSA9IERbNF07Ly9iLm5vcm1hbERpcmVjdGlvbkhlaWdodC55O1xuICAgICAgdmFyIG5oeiA9IERbNV07Ly9iLm5vcm1hbERpcmVjdGlvbkhlaWdodC56O1xuICAgICAgdmFyIG5keCA9IERbNl07Ly9iLm5vcm1hbERpcmVjdGlvbkRlcHRoLng7XG4gICAgICB2YXIgbmR5ID0gRFs3XTsvL2Iubm9ybWFsRGlyZWN0aW9uRGVwdGgueTtcbiAgICAgIHZhciBuZHogPSBEWzhdOy8vYi5ub3JtYWxEaXJlY3Rpb25EZXB0aC56O1xuXG4gICAgICB2YXIgZHd4ID0gRFs5XTsvL2IuaGFsZkRpcmVjdGlvbldpZHRoLng7XG4gICAgICB2YXIgZHd5ID0gRFsxMF07Ly9iLmhhbGZEaXJlY3Rpb25XaWR0aC55O1xuICAgICAgdmFyIGR3eiA9IERbMTFdOy8vYi5oYWxmRGlyZWN0aW9uV2lkdGguejtcbiAgICAgIHZhciBkaHggPSBEWzEyXTsvL2IuaGFsZkRpcmVjdGlvbkhlaWdodC54O1xuICAgICAgdmFyIGRoeSA9IERbMTNdOy8vYi5oYWxmRGlyZWN0aW9uSGVpZ2h0Lnk7XG4gICAgICB2YXIgZGh6ID0gRFsxNF07Ly9iLmhhbGZEaXJlY3Rpb25IZWlnaHQuejtcbiAgICAgIHZhciBkZHggPSBEWzE1XTsvL2IuaGFsZkRpcmVjdGlvbkRlcHRoLng7XG4gICAgICB2YXIgZGR5ID0gRFsxNl07Ly9iLmhhbGZEaXJlY3Rpb25EZXB0aC55O1xuICAgICAgdmFyIGRkeiA9IERbMTddOy8vYi5oYWxmRGlyZWN0aW9uRGVwdGguejtcblxuICAgICAgdmFyIG5jeCA9IGMubm9ybWFsRGlyZWN0aW9uLng7XG4gICAgICB2YXIgbmN5ID0gYy5ub3JtYWxEaXJlY3Rpb24ueTtcbiAgICAgIHZhciBuY3ogPSBjLm5vcm1hbERpcmVjdGlvbi56O1xuICAgICAgdmFyIGRjeCA9IGMuaGFsZkRpcmVjdGlvbi54O1xuICAgICAgdmFyIGRjeSA9IGMuaGFsZkRpcmVjdGlvbi55O1xuICAgICAgdmFyIGRjeiA9IGMuaGFsZkRpcmVjdGlvbi56O1xuICAgICAgdmFyIG54ID0gc2VwLng7XG4gICAgICB2YXIgbnkgPSBzZXAueTtcbiAgICAgIHZhciBueiA9IHNlcC56O1xuICAgICAgdmFyIGRvdHcgPSBueCAqIG53eCArIG55ICogbnd5ICsgbnogKiBud3o7XG4gICAgICB2YXIgZG90aCA9IG54ICogbmh4ICsgbnkgKiBuaHkgKyBueiAqIG5oejtcbiAgICAgIHZhciBkb3RkID0gbnggKiBuZHggKyBueSAqIG5keSArIG56ICogbmR6O1xuICAgICAgdmFyIGRvdGMgPSBueCAqIG5jeCArIG55ICogbmN5ICsgbnogKiBuY3o7XG4gICAgICB2YXIgcmlnaHQxID0gZG90dyA+IDA7XG4gICAgICB2YXIgcmlnaHQyID0gZG90aCA+IDA7XG4gICAgICB2YXIgcmlnaHQzID0gZG90ZCA+IDA7XG4gICAgICB2YXIgcmlnaHQ0ID0gZG90YyA+IDA7XG4gICAgICBpZiAoIXJpZ2h0MSkgZG90dyA9IC1kb3R3O1xuICAgICAgaWYgKCFyaWdodDIpIGRvdGggPSAtZG90aDtcbiAgICAgIGlmICghcmlnaHQzKSBkb3RkID0gLWRvdGQ7XG4gICAgICBpZiAoIXJpZ2h0NCkgZG90YyA9IC1kb3RjO1xuICAgICAgdmFyIHN0YXRlID0gMDtcbiAgICAgIGlmIChkb3RjID4gMC45OTkpIHtcbiAgICAgICAgaWYgKGRvdHcgPiAwLjk5OSkge1xuICAgICAgICAgIGlmIChkb3R3ID4gZG90Yykgc3RhdGUgPSAxO1xuICAgICAgICAgIGVsc2Ugc3RhdGUgPSA0O1xuICAgICAgICB9IGVsc2UgaWYgKGRvdGggPiAwLjk5OSkge1xuICAgICAgICAgIGlmIChkb3RoID4gZG90Yykgc3RhdGUgPSAyO1xuICAgICAgICAgIGVsc2Ugc3RhdGUgPSA0O1xuICAgICAgICB9IGVsc2UgaWYgKGRvdGQgPiAwLjk5OSkge1xuICAgICAgICAgIGlmIChkb3RkID4gZG90Yykgc3RhdGUgPSAzO1xuICAgICAgICAgIGVsc2Ugc3RhdGUgPSA0O1xuICAgICAgICB9IGVsc2Ugc3RhdGUgPSA0O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGRvdHcgPiAwLjk5OSkgc3RhdGUgPSAxO1xuICAgICAgICBlbHNlIGlmIChkb3RoID4gMC45OTkpIHN0YXRlID0gMjtcbiAgICAgICAgZWxzZSBpZiAoZG90ZCA+IDAuOTk5KSBzdGF0ZSA9IDM7XG4gICAgICB9XG4gICAgICB2YXIgY2J4O1xuICAgICAgdmFyIGNieTtcbiAgICAgIHZhciBjYno7XG4gICAgICB2YXIgY2N4O1xuICAgICAgdmFyIGNjeTtcbiAgICAgIHZhciBjY3o7XG4gICAgICB2YXIgcjAwO1xuICAgICAgdmFyIHIwMTtcbiAgICAgIHZhciByMDI7XG4gICAgICB2YXIgcjEwO1xuICAgICAgdmFyIHIxMTtcbiAgICAgIHZhciByMTI7XG4gICAgICB2YXIgcjIwO1xuICAgICAgdmFyIHIyMTtcbiAgICAgIHZhciByMjI7XG4gICAgICB2YXIgcHg7XG4gICAgICB2YXIgcHk7XG4gICAgICB2YXIgcHo7XG4gICAgICB2YXIgcGQ7XG4gICAgICB2YXIgZG90O1xuICAgICAgdmFyIGxlbjtcbiAgICAgIHZhciB0eDtcbiAgICAgIHZhciB0eTtcbiAgICAgIHZhciB0ejtcbiAgICAgIHZhciB0ZDtcbiAgICAgIHZhciBkeDtcbiAgICAgIHZhciBkeTtcbiAgICAgIHZhciBkejtcbiAgICAgIHZhciBkMXg7XG4gICAgICB2YXIgZDF5O1xuICAgICAgdmFyIGQxejtcbiAgICAgIHZhciBkMng7XG4gICAgICB2YXIgZDJ5O1xuICAgICAgdmFyIGQyejtcbiAgICAgIHZhciBzeDtcbiAgICAgIHZhciBzeTtcbiAgICAgIHZhciBzejtcbiAgICAgIHZhciBzZDtcbiAgICAgIHZhciBleDtcbiAgICAgIHZhciBleTtcbiAgICAgIHZhciBlejtcbiAgICAgIHZhciBlZDtcbiAgICAgIHZhciBkb3QxO1xuICAgICAgdmFyIGRvdDI7XG4gICAgICB2YXIgdDE7XG4gICAgICB2YXIgZGlyMXg7XG4gICAgICB2YXIgZGlyMXk7XG4gICAgICB2YXIgZGlyMXo7XG4gICAgICB2YXIgZGlyMng7XG4gICAgICB2YXIgZGlyMnk7XG4gICAgICB2YXIgZGlyMno7XG4gICAgICB2YXIgZGlyMWw7XG4gICAgICB2YXIgZGlyMmw7XG4gICAgICBpZiAoc3RhdGUgPT0gMCkge1xuICAgICAgICAvL21hbmlmb2xkLmFkZFBvaW50KHBvcy54LHBvcy55LHBvcy56LG54LG55LG56LGRlcC54LGIsYywwLDAsZmFsc2UpO1xuICAgICAgICBtYW5pZm9sZC5hZGRQb2ludChwb3MueCwgcG9zLnksIHBvcy56LCBueCwgbnksIG56LCBkZXAueCwgdGhpcy5mbGlwKTtcbiAgICAgIH0gZWxzZSBpZiAoc3RhdGUgPT0gNCkge1xuICAgICAgICBpZiAocmlnaHQ0KSB7XG4gICAgICAgICAgY2N4ID0gcGN4IC0gZGN4O1xuICAgICAgICAgIGNjeSA9IHBjeSAtIGRjeTtcbiAgICAgICAgICBjY3ogPSBwY3ogLSBkY3o7XG4gICAgICAgICAgbnggPSAtbmN4O1xuICAgICAgICAgIG55ID0gLW5jeTtcbiAgICAgICAgICBueiA9IC1uY3o7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY2N4ID0gcGN4ICsgZGN4O1xuICAgICAgICAgIGNjeSA9IHBjeSArIGRjeTtcbiAgICAgICAgICBjY3ogPSBwY3ogKyBkY3o7XG4gICAgICAgICAgbnggPSBuY3g7XG4gICAgICAgICAgbnkgPSBuY3k7XG4gICAgICAgICAgbnogPSBuY3o7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHYxeDtcbiAgICAgICAgdmFyIHYxeTtcbiAgICAgICAgdmFyIHYxejtcbiAgICAgICAgdmFyIHYyeDtcbiAgICAgICAgdmFyIHYyeTtcbiAgICAgICAgdmFyIHYyejtcbiAgICAgICAgdmFyIHYzeDtcbiAgICAgICAgdmFyIHYzeTtcbiAgICAgICAgdmFyIHYzejtcbiAgICAgICAgdmFyIHY0eDtcbiAgICAgICAgdmFyIHY0eTtcbiAgICAgICAgdmFyIHY0ejtcblxuICAgICAgICBkb3QgPSAxO1xuICAgICAgICBzdGF0ZSA9IDA7XG4gICAgICAgIGRvdDEgPSBud3ggKiBueCArIG53eSAqIG55ICsgbnd6ICogbno7XG4gICAgICAgIGlmIChkb3QxIDwgZG90KSB7XG4gICAgICAgICAgZG90ID0gZG90MTtcbiAgICAgICAgICBzdGF0ZSA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKC1kb3QxIDwgZG90KSB7XG4gICAgICAgICAgZG90ID0gLWRvdDE7XG4gICAgICAgICAgc3RhdGUgPSAxO1xuICAgICAgICB9XG4gICAgICAgIGRvdDEgPSBuaHggKiBueCArIG5oeSAqIG55ICsgbmh6ICogbno7XG4gICAgICAgIGlmIChkb3QxIDwgZG90KSB7XG4gICAgICAgICAgZG90ID0gZG90MTtcbiAgICAgICAgICBzdGF0ZSA9IDI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKC1kb3QxIDwgZG90KSB7XG4gICAgICAgICAgZG90ID0gLWRvdDE7XG4gICAgICAgICAgc3RhdGUgPSAzO1xuICAgICAgICB9XG4gICAgICAgIGRvdDEgPSBuZHggKiBueCArIG5keSAqIG55ICsgbmR6ICogbno7XG4gICAgICAgIGlmIChkb3QxIDwgZG90KSB7XG4gICAgICAgICAgZG90ID0gZG90MTtcbiAgICAgICAgICBzdGF0ZSA9IDQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKC1kb3QxIDwgZG90KSB7XG4gICAgICAgICAgZG90ID0gLWRvdDE7XG4gICAgICAgICAgc3RhdGUgPSA1O1xuICAgICAgICB9XG4gICAgICAgIHZhciB2ID0gYi5lbGVtZW50cztcbiAgICAgICAgc3dpdGNoIChzdGF0ZSkge1xuICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgIC8vdj1iLnZlcnRleDE7XG4gICAgICAgICAgICB2MXggPSB2WzBdOy8vdi54O1xuICAgICAgICAgICAgdjF5ID0gdlsxXTsvL3YueTtcbiAgICAgICAgICAgIHYxeiA9IHZbMl07Ly92Lno7XG4gICAgICAgICAgICAvL3Y9Yi52ZXJ0ZXgzO1xuICAgICAgICAgICAgdjJ4ID0gdls2XTsvL3YueDtcbiAgICAgICAgICAgIHYyeSA9IHZbN107Ly92Lnk7XG4gICAgICAgICAgICB2MnogPSB2WzhdOy8vdi56O1xuICAgICAgICAgICAgLy92PWIudmVydGV4NDtcbiAgICAgICAgICAgIHYzeCA9IHZbOV07Ly92Lng7XG4gICAgICAgICAgICB2M3kgPSB2WzEwXTsvL3YueTtcbiAgICAgICAgICAgIHYzeiA9IHZbMTFdOy8vdi56O1xuICAgICAgICAgICAgLy92PWIudmVydGV4MjtcbiAgICAgICAgICAgIHY0eCA9IHZbM107Ly92Lng7XG4gICAgICAgICAgICB2NHkgPSB2WzRdOy8vdi55O1xuICAgICAgICAgICAgdjR6ID0gdls1XTsvL3YuejtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgIC8vdj1iLnZlcnRleDY7XG4gICAgICAgICAgICB2MXggPSB2WzE1XTsvL3YueDtcbiAgICAgICAgICAgIHYxeSA9IHZbMTZdOy8vdi55O1xuICAgICAgICAgICAgdjF6ID0gdlsxN107Ly92Lno7XG4gICAgICAgICAgICAvL3Y9Yi52ZXJ0ZXg4O1xuICAgICAgICAgICAgdjJ4ID0gdlsyMV07Ly92Lng7XG4gICAgICAgICAgICB2MnkgPSB2WzIyXTsvL3YueTtcbiAgICAgICAgICAgIHYyeiA9IHZbMjNdOy8vdi56O1xuICAgICAgICAgICAgLy92PWIudmVydGV4NztcbiAgICAgICAgICAgIHYzeCA9IHZbMThdOy8vdi54O1xuICAgICAgICAgICAgdjN5ID0gdlsxOV07Ly92Lnk7XG4gICAgICAgICAgICB2M3ogPSB2WzIwXTsvL3YuejtcbiAgICAgICAgICAgIC8vdj1iLnZlcnRleDU7XG4gICAgICAgICAgICB2NHggPSB2WzEyXTsvL3YueDtcbiAgICAgICAgICAgIHY0eSA9IHZbMTNdOy8vdi55O1xuICAgICAgICAgICAgdjR6ID0gdlsxNF07Ly92Lno7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAvL3Y9Yi52ZXJ0ZXg1O1xuICAgICAgICAgICAgdjF4ID0gdlsxMl07Ly92Lng7XG4gICAgICAgICAgICB2MXkgPSB2WzEzXTsvL3YueTtcbiAgICAgICAgICAgIHYxeiA9IHZbMTRdOy8vdi56O1xuICAgICAgICAgICAgLy92PWIudmVydGV4MTtcbiAgICAgICAgICAgIHYyeCA9IHZbMF07Ly92Lng7XG4gICAgICAgICAgICB2MnkgPSB2WzFdOy8vdi55O1xuICAgICAgICAgICAgdjJ6ID0gdlsyXTsvL3YuejtcbiAgICAgICAgICAgIC8vdj1iLnZlcnRleDI7XG4gICAgICAgICAgICB2M3ggPSB2WzNdOy8vdi54O1xuICAgICAgICAgICAgdjN5ID0gdls0XTsvL3YueTtcbiAgICAgICAgICAgIHYzeiA9IHZbNV07Ly92Lno7XG4gICAgICAgICAgICAvL3Y9Yi52ZXJ0ZXg2O1xuICAgICAgICAgICAgdjR4ID0gdlsxNV07Ly92Lng7XG4gICAgICAgICAgICB2NHkgPSB2WzE2XTsvL3YueTtcbiAgICAgICAgICAgIHY0eiA9IHZbMTddOy8vdi56O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgLy92PWIudmVydGV4ODtcbiAgICAgICAgICAgIHYxeCA9IHZbMjFdOy8vdi54O1xuICAgICAgICAgICAgdjF5ID0gdlsyMl07Ly92Lnk7XG4gICAgICAgICAgICB2MXogPSB2WzIzXTsvL3YuejtcbiAgICAgICAgICAgIC8vdj1iLnZlcnRleDQ7XG4gICAgICAgICAgICB2MnggPSB2WzldOy8vdi54O1xuICAgICAgICAgICAgdjJ5ID0gdlsxMF07Ly92Lnk7XG4gICAgICAgICAgICB2MnogPSB2WzExXTsvL3YuejtcbiAgICAgICAgICAgIC8vdj1iLnZlcnRleDM7XG4gICAgICAgICAgICB2M3ggPSB2WzZdOy8vdi54O1xuICAgICAgICAgICAgdjN5ID0gdls3XTsvL3YueTtcbiAgICAgICAgICAgIHYzeiA9IHZbOF07Ly92Lno7XG4gICAgICAgICAgICAvL3Y9Yi52ZXJ0ZXg3O1xuICAgICAgICAgICAgdjR4ID0gdlsxOF07Ly92Lng7XG4gICAgICAgICAgICB2NHkgPSB2WzE5XTsvL3YueTtcbiAgICAgICAgICAgIHY0eiA9IHZbMjBdOy8vdi56O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgLy92PWIudmVydGV4NTtcbiAgICAgICAgICAgIHYxeCA9IHZbMTJdOy8vdi54O1xuICAgICAgICAgICAgdjF5ID0gdlsxM107Ly92Lnk7XG4gICAgICAgICAgICB2MXogPSB2WzE0XTsvL3YuejtcbiAgICAgICAgICAgIC8vdj1iLnZlcnRleDc7XG4gICAgICAgICAgICB2MnggPSB2WzE4XTsvL3YueDtcbiAgICAgICAgICAgIHYyeSA9IHZbMTldOy8vdi55O1xuICAgICAgICAgICAgdjJ6ID0gdlsyMF07Ly92Lno7XG4gICAgICAgICAgICAvL3Y9Yi52ZXJ0ZXgzO1xuICAgICAgICAgICAgdjN4ID0gdls2XTsvL3YueDtcbiAgICAgICAgICAgIHYzeSA9IHZbN107Ly92Lnk7XG4gICAgICAgICAgICB2M3ogPSB2WzhdOy8vdi56O1xuICAgICAgICAgICAgLy92PWIudmVydGV4MTtcbiAgICAgICAgICAgIHY0eCA9IHZbMF07Ly92Lng7XG4gICAgICAgICAgICB2NHkgPSB2WzFdOy8vdi55O1xuICAgICAgICAgICAgdjR6ID0gdlsyXTsvL3YuejtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNTpcbiAgICAgICAgICAgIC8vdj1iLnZlcnRleDI7XG4gICAgICAgICAgICB2MXggPSB2WzNdOy8vdi54O1xuICAgICAgICAgICAgdjF5ID0gdls0XTsvL3YueTtcbiAgICAgICAgICAgIHYxeiA9IHZbNV07Ly92Lno7XG4gICAgICAgICAgICAvL3Y9Yi52ZXJ0ZXg0O1xuICAgICAgICAgICAgdjJ4ID0gdls5XTsvL3YueDtcbiAgICAgICAgICAgIHYyeSA9IHZbMTBdOy8vdi55O1xuICAgICAgICAgICAgdjJ6ID0gdlsxMV07Ly92Lno7XG4gICAgICAgICAgICAvL3Y9Yi52ZXJ0ZXg4O1xuICAgICAgICAgICAgdjN4ID0gdlsyMV07Ly92Lng7XG4gICAgICAgICAgICB2M3kgPSB2WzIyXTsvL3YueTtcbiAgICAgICAgICAgIHYzeiA9IHZbMjNdOy8vdi56O1xuICAgICAgICAgICAgLy92PWIudmVydGV4NjtcbiAgICAgICAgICAgIHY0eCA9IHZbMTVdOy8vdi54O1xuICAgICAgICAgICAgdjR5ID0gdlsxNl07Ly92Lnk7XG4gICAgICAgICAgICB2NHogPSB2WzE3XTsvL3YuejtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIHBkID0gbnggKiAodjF4IC0gY2N4KSArIG55ICogKHYxeSAtIGNjeSkgKyBueiAqICh2MXogLSBjY3opO1xuICAgICAgICBpZiAocGQgPD0gMCkgbWFuaWZvbGQuYWRkUG9pbnQodjF4LCB2MXksIHYxeiwgLW54LCAtbnksIC1ueiwgcGQsIHRoaXMuZmxpcCk7XG4gICAgICAgIHBkID0gbnggKiAodjJ4IC0gY2N4KSArIG55ICogKHYyeSAtIGNjeSkgKyBueiAqICh2MnogLSBjY3opO1xuICAgICAgICBpZiAocGQgPD0gMCkgbWFuaWZvbGQuYWRkUG9pbnQodjJ4LCB2MnksIHYyeiwgLW54LCAtbnksIC1ueiwgcGQsIHRoaXMuZmxpcCk7XG4gICAgICAgIHBkID0gbnggKiAodjN4IC0gY2N4KSArIG55ICogKHYzeSAtIGNjeSkgKyBueiAqICh2M3ogLSBjY3opO1xuICAgICAgICBpZiAocGQgPD0gMCkgbWFuaWZvbGQuYWRkUG9pbnQodjN4LCB2M3ksIHYzeiwgLW54LCAtbnksIC1ueiwgcGQsIHRoaXMuZmxpcCk7XG4gICAgICAgIHBkID0gbnggKiAodjR4IC0gY2N4KSArIG55ICogKHY0eSAtIGNjeSkgKyBueiAqICh2NHogLSBjY3opO1xuICAgICAgICBpZiAocGQgPD0gMCkgbWFuaWZvbGQuYWRkUG9pbnQodjR4LCB2NHksIHY0eiwgLW54LCAtbnksIC1ueiwgcGQsIHRoaXMuZmxpcCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzd2l0Y2ggKHN0YXRlKSB7XG4gICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgaWYgKHJpZ2h0MSkge1xuICAgICAgICAgICAgICBjYnggPSBwYnggKyBkd3g7XG4gICAgICAgICAgICAgIGNieSA9IHBieSArIGR3eTtcbiAgICAgICAgICAgICAgY2J6ID0gcGJ6ICsgZHd6O1xuICAgICAgICAgICAgICBueCA9IG53eDtcbiAgICAgICAgICAgICAgbnkgPSBud3k7XG4gICAgICAgICAgICAgIG56ID0gbnd6O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgY2J4ID0gcGJ4IC0gZHd4O1xuICAgICAgICAgICAgICBjYnkgPSBwYnkgLSBkd3k7XG4gICAgICAgICAgICAgIGNieiA9IHBieiAtIGR3ejtcbiAgICAgICAgICAgICAgbnggPSAtbnd4O1xuICAgICAgICAgICAgICBueSA9IC1ud3k7XG4gICAgICAgICAgICAgIG56ID0gLW53ejtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRpcjF4ID0gbmh4O1xuICAgICAgICAgICAgZGlyMXkgPSBuaHk7XG4gICAgICAgICAgICBkaXIxeiA9IG5oejtcbiAgICAgICAgICAgIGRpcjFsID0gYmg7XG4gICAgICAgICAgICBkaXIyeCA9IG5keDtcbiAgICAgICAgICAgIGRpcjJ5ID0gbmR5O1xuICAgICAgICAgICAgZGlyMnogPSBuZHo7XG4gICAgICAgICAgICBkaXIybCA9IGJkO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgaWYgKHJpZ2h0Mikge1xuICAgICAgICAgICAgICBjYnggPSBwYnggKyBkaHg7XG4gICAgICAgICAgICAgIGNieSA9IHBieSArIGRoeTtcbiAgICAgICAgICAgICAgY2J6ID0gcGJ6ICsgZGh6O1xuICAgICAgICAgICAgICBueCA9IG5oeDtcbiAgICAgICAgICAgICAgbnkgPSBuaHk7XG4gICAgICAgICAgICAgIG56ID0gbmh6O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgY2J4ID0gcGJ4IC0gZGh4O1xuICAgICAgICAgICAgICBjYnkgPSBwYnkgLSBkaHk7XG4gICAgICAgICAgICAgIGNieiA9IHBieiAtIGRoejtcbiAgICAgICAgICAgICAgbnggPSAtbmh4O1xuICAgICAgICAgICAgICBueSA9IC1uaHk7XG4gICAgICAgICAgICAgIG56ID0gLW5oejtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRpcjF4ID0gbnd4O1xuICAgICAgICAgICAgZGlyMXkgPSBud3k7XG4gICAgICAgICAgICBkaXIxeiA9IG53ejtcbiAgICAgICAgICAgIGRpcjFsID0gYnc7XG4gICAgICAgICAgICBkaXIyeCA9IG5keDtcbiAgICAgICAgICAgIGRpcjJ5ID0gbmR5O1xuICAgICAgICAgICAgZGlyMnogPSBuZHo7XG4gICAgICAgICAgICBkaXIybCA9IGJkO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgaWYgKHJpZ2h0Mykge1xuICAgICAgICAgICAgICBjYnggPSBwYnggKyBkZHg7XG4gICAgICAgICAgICAgIGNieSA9IHBieSArIGRkeTtcbiAgICAgICAgICAgICAgY2J6ID0gcGJ6ICsgZGR6O1xuICAgICAgICAgICAgICBueCA9IG5keDtcbiAgICAgICAgICAgICAgbnkgPSBuZHk7XG4gICAgICAgICAgICAgIG56ID0gbmR6O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgY2J4ID0gcGJ4IC0gZGR4O1xuICAgICAgICAgICAgICBjYnkgPSBwYnkgLSBkZHk7XG4gICAgICAgICAgICAgIGNieiA9IHBieiAtIGRkejtcbiAgICAgICAgICAgICAgbnggPSAtbmR4O1xuICAgICAgICAgICAgICBueSA9IC1uZHk7XG4gICAgICAgICAgICAgIG56ID0gLW5kejtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRpcjF4ID0gbnd4O1xuICAgICAgICAgICAgZGlyMXkgPSBud3k7XG4gICAgICAgICAgICBkaXIxeiA9IG53ejtcbiAgICAgICAgICAgIGRpcjFsID0gYnc7XG4gICAgICAgICAgICBkaXIyeCA9IG5oeDtcbiAgICAgICAgICAgIGRpcjJ5ID0gbmh5O1xuICAgICAgICAgICAgZGlyMnogPSBuaHo7XG4gICAgICAgICAgICBkaXIybCA9IGJoO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgZG90ID0gbnggKiBuY3ggKyBueSAqIG5jeSArIG56ICogbmN6O1xuICAgICAgICBpZiAoZG90IDwgMCkgbGVuID0gY2g7XG4gICAgICAgIGVsc2UgbGVuID0gLWNoO1xuICAgICAgICBjY3ggPSBwY3ggKyBsZW4gKiBuY3g7XG4gICAgICAgIGNjeSA9IHBjeSArIGxlbiAqIG5jeTtcbiAgICAgICAgY2N6ID0gcGN6ICsgbGVuICogbmN6O1xuICAgICAgICBpZiAoZG90YyA+PSAwLjk5OTk5OSkge1xuICAgICAgICAgIHR4ID0gLW55O1xuICAgICAgICAgIHR5ID0gbno7XG4gICAgICAgICAgdHogPSBueDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0eCA9IG54O1xuICAgICAgICAgIHR5ID0gbnk7XG4gICAgICAgICAgdHogPSBuejtcbiAgICAgICAgfVxuICAgICAgICBsZW4gPSB0eCAqIG5jeCArIHR5ICogbmN5ICsgdHogKiBuY3o7XG4gICAgICAgIGR4ID0gbGVuICogbmN4IC0gdHg7XG4gICAgICAgIGR5ID0gbGVuICogbmN5IC0gdHk7XG4gICAgICAgIGR6ID0gbGVuICogbmN6IC0gdHo7XG4gICAgICAgIGxlbiA9IF9NYXRoLnNxcnQoZHggKiBkeCArIGR5ICogZHkgKyBkeiAqIGR6KTtcbiAgICAgICAgaWYgKGxlbiA9PSAwKSByZXR1cm47XG4gICAgICAgIGxlbiA9IHIgLyBsZW47XG4gICAgICAgIGR4ICo9IGxlbjtcbiAgICAgICAgZHkgKj0gbGVuO1xuICAgICAgICBkeiAqPSBsZW47XG4gICAgICAgIHR4ID0gY2N4ICsgZHg7XG4gICAgICAgIHR5ID0gY2N5ICsgZHk7XG4gICAgICAgIHR6ID0gY2N6ICsgZHo7XG4gICAgICAgIGlmIChkb3QgPCAtMC45NiB8fCBkb3QgPiAwLjk2KSB7XG4gICAgICAgICAgcjAwID0gbmN4ICogbmN4ICogMS41IC0gMC41O1xuICAgICAgICAgIHIwMSA9IG5jeCAqIG5jeSAqIDEuNSAtIG5jeiAqIDAuODY2MDI1NDAzO1xuICAgICAgICAgIHIwMiA9IG5jeCAqIG5jeiAqIDEuNSArIG5jeSAqIDAuODY2MDI1NDAzO1xuICAgICAgICAgIHIxMCA9IG5jeSAqIG5jeCAqIDEuNSArIG5jeiAqIDAuODY2MDI1NDAzO1xuICAgICAgICAgIHIxMSA9IG5jeSAqIG5jeSAqIDEuNSAtIDAuNTtcbiAgICAgICAgICByMTIgPSBuY3kgKiBuY3ogKiAxLjUgLSBuY3ggKiAwLjg2NjAyNTQwMztcbiAgICAgICAgICByMjAgPSBuY3ogKiBuY3ggKiAxLjUgLSBuY3kgKiAwLjg2NjAyNTQwMztcbiAgICAgICAgICByMjEgPSBuY3ogKiBuY3kgKiAxLjUgKyBuY3ggKiAwLjg2NjAyNTQwMztcbiAgICAgICAgICByMjIgPSBuY3ogKiBuY3ogKiAxLjUgLSAwLjU7XG4gICAgICAgICAgcHggPSB0eDtcbiAgICAgICAgICBweSA9IHR5O1xuICAgICAgICAgIHB6ID0gdHo7XG4gICAgICAgICAgcGQgPSBueCAqIChweCAtIGNieCkgKyBueSAqIChweSAtIGNieSkgKyBueiAqIChweiAtIGNieik7XG4gICAgICAgICAgdHggPSBweCAtIHBkICogbnggLSBjYng7XG4gICAgICAgICAgdHkgPSBweSAtIHBkICogbnkgLSBjYnk7XG4gICAgICAgICAgdHogPSBweiAtIHBkICogbnogLSBjYno7XG4gICAgICAgICAgc2QgPSBkaXIxeCAqIHR4ICsgZGlyMXkgKiB0eSArIGRpcjF6ICogdHo7XG4gICAgICAgICAgZWQgPSBkaXIyeCAqIHR4ICsgZGlyMnkgKiB0eSArIGRpcjJ6ICogdHo7XG4gICAgICAgICAgaWYgKHNkIDwgLWRpcjFsKSBzZCA9IC1kaXIxbDtcbiAgICAgICAgICBlbHNlIGlmIChzZCA+IGRpcjFsKSBzZCA9IGRpcjFsO1xuICAgICAgICAgIGlmIChlZCA8IC1kaXIybCkgZWQgPSAtZGlyMmw7XG4gICAgICAgICAgZWxzZSBpZiAoZWQgPiBkaXIybCkgZWQgPSBkaXIybDtcbiAgICAgICAgICB0eCA9IHNkICogZGlyMXggKyBlZCAqIGRpcjJ4O1xuICAgICAgICAgIHR5ID0gc2QgKiBkaXIxeSArIGVkICogZGlyMnk7XG4gICAgICAgICAgdHogPSBzZCAqIGRpcjF6ICsgZWQgKiBkaXIyejtcbiAgICAgICAgICBweCA9IGNieCArIHR4O1xuICAgICAgICAgIHB5ID0gY2J5ICsgdHk7XG4gICAgICAgICAgcHogPSBjYnogKyB0ejtcbiAgICAgICAgICBtYW5pZm9sZC5hZGRQb2ludChweCwgcHksIHB6LCBueCwgbnksIG56LCBwZCwgdGhpcy5mbGlwKTtcbiAgICAgICAgICBweCA9IGR4ICogcjAwICsgZHkgKiByMDEgKyBkeiAqIHIwMjtcbiAgICAgICAgICBweSA9IGR4ICogcjEwICsgZHkgKiByMTEgKyBkeiAqIHIxMjtcbiAgICAgICAgICBweiA9IGR4ICogcjIwICsgZHkgKiByMjEgKyBkeiAqIHIyMjtcbiAgICAgICAgICBweCA9IChkeCA9IHB4KSArIGNjeDtcbiAgICAgICAgICBweSA9IChkeSA9IHB5KSArIGNjeTtcbiAgICAgICAgICBweiA9IChkeiA9IHB6KSArIGNjejtcbiAgICAgICAgICBwZCA9IG54ICogKHB4IC0gY2J4KSArIG55ICogKHB5IC0gY2J5KSArIG56ICogKHB6IC0gY2J6KTtcbiAgICAgICAgICBpZiAocGQgPD0gMCkge1xuICAgICAgICAgICAgdHggPSBweCAtIHBkICogbnggLSBjYng7XG4gICAgICAgICAgICB0eSA9IHB5IC0gcGQgKiBueSAtIGNieTtcbiAgICAgICAgICAgIHR6ID0gcHogLSBwZCAqIG56IC0gY2J6O1xuICAgICAgICAgICAgc2QgPSBkaXIxeCAqIHR4ICsgZGlyMXkgKiB0eSArIGRpcjF6ICogdHo7XG4gICAgICAgICAgICBlZCA9IGRpcjJ4ICogdHggKyBkaXIyeSAqIHR5ICsgZGlyMnogKiB0ejtcbiAgICAgICAgICAgIGlmIChzZCA8IC1kaXIxbCkgc2QgPSAtZGlyMWw7XG4gICAgICAgICAgICBlbHNlIGlmIChzZCA+IGRpcjFsKSBzZCA9IGRpcjFsO1xuICAgICAgICAgICAgaWYgKGVkIDwgLWRpcjJsKSBlZCA9IC1kaXIybDtcbiAgICAgICAgICAgIGVsc2UgaWYgKGVkID4gZGlyMmwpIGVkID0gZGlyMmw7XG4gICAgICAgICAgICB0eCA9IHNkICogZGlyMXggKyBlZCAqIGRpcjJ4O1xuICAgICAgICAgICAgdHkgPSBzZCAqIGRpcjF5ICsgZWQgKiBkaXIyeTtcbiAgICAgICAgICAgIHR6ID0gc2QgKiBkaXIxeiArIGVkICogZGlyMno7XG4gICAgICAgICAgICBweCA9IGNieCArIHR4O1xuICAgICAgICAgICAgcHkgPSBjYnkgKyB0eTtcbiAgICAgICAgICAgIHB6ID0gY2J6ICsgdHo7XG4gICAgICAgICAgICAvL21hbmlmb2xkLmFkZFBvaW50KHB4LHB5LHB6LG54LG55LG56LHBkLGIsYywyLDAsZmFsc2UpO1xuICAgICAgICAgICAgbWFuaWZvbGQuYWRkUG9pbnQocHgsIHB5LCBweiwgbngsIG55LCBueiwgcGQsIHRoaXMuZmxpcCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHB4ID0gZHggKiByMDAgKyBkeSAqIHIwMSArIGR6ICogcjAyO1xuICAgICAgICAgIHB5ID0gZHggKiByMTAgKyBkeSAqIHIxMSArIGR6ICogcjEyO1xuICAgICAgICAgIHB6ID0gZHggKiByMjAgKyBkeSAqIHIyMSArIGR6ICogcjIyO1xuICAgICAgICAgIHB4ID0gKGR4ID0gcHgpICsgY2N4O1xuICAgICAgICAgIHB5ID0gKGR5ID0gcHkpICsgY2N5O1xuICAgICAgICAgIHB6ID0gKGR6ID0gcHopICsgY2N6O1xuICAgICAgICAgIHBkID0gbnggKiAocHggLSBjYngpICsgbnkgKiAocHkgLSBjYnkpICsgbnogKiAocHogLSBjYnopO1xuICAgICAgICAgIGlmIChwZCA8PSAwKSB7XG4gICAgICAgICAgICB0eCA9IHB4IC0gcGQgKiBueCAtIGNieDtcbiAgICAgICAgICAgIHR5ID0gcHkgLSBwZCAqIG55IC0gY2J5O1xuICAgICAgICAgICAgdHogPSBweiAtIHBkICogbnogLSBjYno7XG4gICAgICAgICAgICBzZCA9IGRpcjF4ICogdHggKyBkaXIxeSAqIHR5ICsgZGlyMXogKiB0ejtcbiAgICAgICAgICAgIGVkID0gZGlyMnggKiB0eCArIGRpcjJ5ICogdHkgKyBkaXIyeiAqIHR6O1xuICAgICAgICAgICAgaWYgKHNkIDwgLWRpcjFsKSBzZCA9IC1kaXIxbDtcbiAgICAgICAgICAgIGVsc2UgaWYgKHNkID4gZGlyMWwpIHNkID0gZGlyMWw7XG4gICAgICAgICAgICBpZiAoZWQgPCAtZGlyMmwpIGVkID0gLWRpcjJsO1xuICAgICAgICAgICAgZWxzZSBpZiAoZWQgPiBkaXIybCkgZWQgPSBkaXIybDtcbiAgICAgICAgICAgIHR4ID0gc2QgKiBkaXIxeCArIGVkICogZGlyMng7XG4gICAgICAgICAgICB0eSA9IHNkICogZGlyMXkgKyBlZCAqIGRpcjJ5O1xuICAgICAgICAgICAgdHogPSBzZCAqIGRpcjF6ICsgZWQgKiBkaXIyejtcbiAgICAgICAgICAgIHB4ID0gY2J4ICsgdHg7XG4gICAgICAgICAgICBweSA9IGNieSArIHR5O1xuICAgICAgICAgICAgcHogPSBjYnogKyB0ejtcbiAgICAgICAgICAgIC8vbWFuaWZvbGQuYWRkUG9pbnQocHgscHkscHosbngsbnksbnoscGQsYixjLDMsMCxmYWxzZSk7XG4gICAgICAgICAgICBtYW5pZm9sZC5hZGRQb2ludChweCwgcHksIHB6LCBueCwgbnksIG56LCBwZCwgdGhpcy5mbGlwKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3ggPSB0eDtcbiAgICAgICAgICBzeSA9IHR5O1xuICAgICAgICAgIHN6ID0gdHo7XG4gICAgICAgICAgc2QgPSBueCAqIChzeCAtIGNieCkgKyBueSAqIChzeSAtIGNieSkgKyBueiAqIChzeiAtIGNieik7XG4gICAgICAgICAgc3ggLT0gc2QgKiBueDtcbiAgICAgICAgICBzeSAtPSBzZCAqIG55O1xuICAgICAgICAgIHN6IC09IHNkICogbno7XG4gICAgICAgICAgaWYgKGRvdCA+IDApIHtcbiAgICAgICAgICAgIGV4ID0gdHggKyBkY3ggKiAyO1xuICAgICAgICAgICAgZXkgPSB0eSArIGRjeSAqIDI7XG4gICAgICAgICAgICBleiA9IHR6ICsgZGN6ICogMjtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZXggPSB0eCAtIGRjeCAqIDI7XG4gICAgICAgICAgICBleSA9IHR5IC0gZGN5ICogMjtcbiAgICAgICAgICAgIGV6ID0gdHogLSBkY3ogKiAyO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlZCA9IG54ICogKGV4IC0gY2J4KSArIG55ICogKGV5IC0gY2J5KSArIG56ICogKGV6IC0gY2J6KTtcbiAgICAgICAgICBleCAtPSBlZCAqIG54O1xuICAgICAgICAgIGV5IC09IGVkICogbnk7XG4gICAgICAgICAgZXogLT0gZWQgKiBuejtcbiAgICAgICAgICBkMXggPSBzeCAtIGNieDtcbiAgICAgICAgICBkMXkgPSBzeSAtIGNieTtcbiAgICAgICAgICBkMXogPSBzeiAtIGNiejtcbiAgICAgICAgICBkMnggPSBleCAtIGNieDtcbiAgICAgICAgICBkMnkgPSBleSAtIGNieTtcbiAgICAgICAgICBkMnogPSBleiAtIGNiejtcbiAgICAgICAgICB0eCA9IGV4IC0gc3g7XG4gICAgICAgICAgdHkgPSBleSAtIHN5O1xuICAgICAgICAgIHR6ID0gZXogLSBzejtcbiAgICAgICAgICB0ZCA9IGVkIC0gc2Q7XG4gICAgICAgICAgZG90dyA9IGQxeCAqIGRpcjF4ICsgZDF5ICogZGlyMXkgKyBkMXogKiBkaXIxejtcbiAgICAgICAgICBkb3RoID0gZDJ4ICogZGlyMXggKyBkMnkgKiBkaXIxeSArIGQyeiAqIGRpcjF6O1xuICAgICAgICAgIGRvdDEgPSBkb3R3IC0gZGlyMWw7XG4gICAgICAgICAgZG90MiA9IGRvdGggLSBkaXIxbDtcbiAgICAgICAgICBpZiAoZG90MSA+IDApIHtcbiAgICAgICAgICAgIGlmIChkb3QyID4gMCkgcmV0dXJuO1xuICAgICAgICAgICAgdDEgPSBkb3QxIC8gKGRvdDEgLSBkb3QyKTtcbiAgICAgICAgICAgIHN4ID0gc3ggKyB0eCAqIHQxO1xuICAgICAgICAgICAgc3kgPSBzeSArIHR5ICogdDE7XG4gICAgICAgICAgICBzeiA9IHN6ICsgdHogKiB0MTtcbiAgICAgICAgICAgIHNkID0gc2QgKyB0ZCAqIHQxO1xuICAgICAgICAgICAgZDF4ID0gc3ggLSBjYng7XG4gICAgICAgICAgICBkMXkgPSBzeSAtIGNieTtcbiAgICAgICAgICAgIGQxeiA9IHN6IC0gY2J6O1xuICAgICAgICAgICAgZG90dyA9IGQxeCAqIGRpcjF4ICsgZDF5ICogZGlyMXkgKyBkMXogKiBkaXIxejtcbiAgICAgICAgICAgIHR4ID0gZXggLSBzeDtcbiAgICAgICAgICAgIHR5ID0gZXkgLSBzeTtcbiAgICAgICAgICAgIHR6ID0gZXogLSBzejtcbiAgICAgICAgICAgIHRkID0gZWQgLSBzZDtcbiAgICAgICAgICB9IGVsc2UgaWYgKGRvdDIgPiAwKSB7XG4gICAgICAgICAgICB0MSA9IGRvdDEgLyAoZG90MSAtIGRvdDIpO1xuICAgICAgICAgICAgZXggPSBzeCArIHR4ICogdDE7XG4gICAgICAgICAgICBleSA9IHN5ICsgdHkgKiB0MTtcbiAgICAgICAgICAgIGV6ID0gc3ogKyB0eiAqIHQxO1xuICAgICAgICAgICAgZWQgPSBzZCArIHRkICogdDE7XG4gICAgICAgICAgICBkMnggPSBleCAtIGNieDtcbiAgICAgICAgICAgIGQyeSA9IGV5IC0gY2J5O1xuICAgICAgICAgICAgZDJ6ID0gZXogLSBjYno7XG4gICAgICAgICAgICBkb3RoID0gZDJ4ICogZGlyMXggKyBkMnkgKiBkaXIxeSArIGQyeiAqIGRpcjF6O1xuICAgICAgICAgICAgdHggPSBleCAtIHN4O1xuICAgICAgICAgICAgdHkgPSBleSAtIHN5O1xuICAgICAgICAgICAgdHogPSBleiAtIHN6O1xuICAgICAgICAgICAgdGQgPSBlZCAtIHNkO1xuICAgICAgICAgIH1cbiAgICAgICAgICBkb3QxID0gZG90dyArIGRpcjFsO1xuICAgICAgICAgIGRvdDIgPSBkb3RoICsgZGlyMWw7XG4gICAgICAgICAgaWYgKGRvdDEgPCAwKSB7XG4gICAgICAgICAgICBpZiAoZG90MiA8IDApIHJldHVybjtcbiAgICAgICAgICAgIHQxID0gZG90MSAvIChkb3QxIC0gZG90Mik7XG4gICAgICAgICAgICBzeCA9IHN4ICsgdHggKiB0MTtcbiAgICAgICAgICAgIHN5ID0gc3kgKyB0eSAqIHQxO1xuICAgICAgICAgICAgc3ogPSBzeiArIHR6ICogdDE7XG4gICAgICAgICAgICBzZCA9IHNkICsgdGQgKiB0MTtcbiAgICAgICAgICAgIGQxeCA9IHN4IC0gY2J4O1xuICAgICAgICAgICAgZDF5ID0gc3kgLSBjYnk7XG4gICAgICAgICAgICBkMXogPSBzeiAtIGNiejtcbiAgICAgICAgICAgIHR4ID0gZXggLSBzeDtcbiAgICAgICAgICAgIHR5ID0gZXkgLSBzeTtcbiAgICAgICAgICAgIHR6ID0gZXogLSBzejtcbiAgICAgICAgICAgIHRkID0gZWQgLSBzZDtcbiAgICAgICAgICB9IGVsc2UgaWYgKGRvdDIgPCAwKSB7XG4gICAgICAgICAgICB0MSA9IGRvdDEgLyAoZG90MSAtIGRvdDIpO1xuICAgICAgICAgICAgZXggPSBzeCArIHR4ICogdDE7XG4gICAgICAgICAgICBleSA9IHN5ICsgdHkgKiB0MTtcbiAgICAgICAgICAgIGV6ID0gc3ogKyB0eiAqIHQxO1xuICAgICAgICAgICAgZWQgPSBzZCArIHRkICogdDE7XG4gICAgICAgICAgICBkMnggPSBleCAtIGNieDtcbiAgICAgICAgICAgIGQyeSA9IGV5IC0gY2J5O1xuICAgICAgICAgICAgZDJ6ID0gZXogLSBjYno7XG4gICAgICAgICAgICB0eCA9IGV4IC0gc3g7XG4gICAgICAgICAgICB0eSA9IGV5IC0gc3k7XG4gICAgICAgICAgICB0eiA9IGV6IC0gc3o7XG4gICAgICAgICAgICB0ZCA9IGVkIC0gc2Q7XG4gICAgICAgICAgfVxuICAgICAgICAgIGRvdHcgPSBkMXggKiBkaXIyeCArIGQxeSAqIGRpcjJ5ICsgZDF6ICogZGlyMno7XG4gICAgICAgICAgZG90aCA9IGQyeCAqIGRpcjJ4ICsgZDJ5ICogZGlyMnkgKyBkMnogKiBkaXIyejtcbiAgICAgICAgICBkb3QxID0gZG90dyAtIGRpcjJsO1xuICAgICAgICAgIGRvdDIgPSBkb3RoIC0gZGlyMmw7XG4gICAgICAgICAgaWYgKGRvdDEgPiAwKSB7XG4gICAgICAgICAgICBpZiAoZG90MiA+IDApIHJldHVybjtcbiAgICAgICAgICAgIHQxID0gZG90MSAvIChkb3QxIC0gZG90Mik7XG4gICAgICAgICAgICBzeCA9IHN4ICsgdHggKiB0MTtcbiAgICAgICAgICAgIHN5ID0gc3kgKyB0eSAqIHQxO1xuICAgICAgICAgICAgc3ogPSBzeiArIHR6ICogdDE7XG4gICAgICAgICAgICBzZCA9IHNkICsgdGQgKiB0MTtcbiAgICAgICAgICAgIGQxeCA9IHN4IC0gY2J4O1xuICAgICAgICAgICAgZDF5ID0gc3kgLSBjYnk7XG4gICAgICAgICAgICBkMXogPSBzeiAtIGNiejtcbiAgICAgICAgICAgIGRvdHcgPSBkMXggKiBkaXIyeCArIGQxeSAqIGRpcjJ5ICsgZDF6ICogZGlyMno7XG4gICAgICAgICAgICB0eCA9IGV4IC0gc3g7XG4gICAgICAgICAgICB0eSA9IGV5IC0gc3k7XG4gICAgICAgICAgICB0eiA9IGV6IC0gc3o7XG4gICAgICAgICAgICB0ZCA9IGVkIC0gc2Q7XG4gICAgICAgICAgfSBlbHNlIGlmIChkb3QyID4gMCkge1xuICAgICAgICAgICAgdDEgPSBkb3QxIC8gKGRvdDEgLSBkb3QyKTtcbiAgICAgICAgICAgIGV4ID0gc3ggKyB0eCAqIHQxO1xuICAgICAgICAgICAgZXkgPSBzeSArIHR5ICogdDE7XG4gICAgICAgICAgICBleiA9IHN6ICsgdHogKiB0MTtcbiAgICAgICAgICAgIGVkID0gc2QgKyB0ZCAqIHQxO1xuICAgICAgICAgICAgZDJ4ID0gZXggLSBjYng7XG4gICAgICAgICAgICBkMnkgPSBleSAtIGNieTtcbiAgICAgICAgICAgIGQyeiA9IGV6IC0gY2J6O1xuICAgICAgICAgICAgZG90aCA9IGQyeCAqIGRpcjJ4ICsgZDJ5ICogZGlyMnkgKyBkMnogKiBkaXIyejtcbiAgICAgICAgICAgIHR4ID0gZXggLSBzeDtcbiAgICAgICAgICAgIHR5ID0gZXkgLSBzeTtcbiAgICAgICAgICAgIHR6ID0gZXogLSBzejtcbiAgICAgICAgICAgIHRkID0gZWQgLSBzZDtcbiAgICAgICAgICB9XG4gICAgICAgICAgZG90MSA9IGRvdHcgKyBkaXIybDtcbiAgICAgICAgICBkb3QyID0gZG90aCArIGRpcjJsO1xuICAgICAgICAgIGlmIChkb3QxIDwgMCkge1xuICAgICAgICAgICAgaWYgKGRvdDIgPCAwKSByZXR1cm47XG4gICAgICAgICAgICB0MSA9IGRvdDEgLyAoZG90MSAtIGRvdDIpO1xuICAgICAgICAgICAgc3ggPSBzeCArIHR4ICogdDE7XG4gICAgICAgICAgICBzeSA9IHN5ICsgdHkgKiB0MTtcbiAgICAgICAgICAgIHN6ID0gc3ogKyB0eiAqIHQxO1xuICAgICAgICAgICAgc2QgPSBzZCArIHRkICogdDE7XG4gICAgICAgICAgfSBlbHNlIGlmIChkb3QyIDwgMCkge1xuICAgICAgICAgICAgdDEgPSBkb3QxIC8gKGRvdDEgLSBkb3QyKTtcbiAgICAgICAgICAgIGV4ID0gc3ggKyB0eCAqIHQxO1xuICAgICAgICAgICAgZXkgPSBzeSArIHR5ICogdDE7XG4gICAgICAgICAgICBleiA9IHN6ICsgdHogKiB0MTtcbiAgICAgICAgICAgIGVkID0gc2QgKyB0ZCAqIHQxO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoc2QgPCAwKSB7XG4gICAgICAgICAgICAvL21hbmlmb2xkLmFkZFBvaW50KHN4LHN5LHN6LG54LG55LG56LHNkLGIsYywxLDAsZmFsc2UpO1xuICAgICAgICAgICAgbWFuaWZvbGQuYWRkUG9pbnQoc3gsIHN5LCBzeiwgbngsIG55LCBueiwgc2QsIHRoaXMuZmxpcCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChlZCA8IDApIHtcbiAgICAgICAgICAgIC8vbWFuaWZvbGQuYWRkUG9pbnQoZXgsZXksZXosbngsbnksbnosZWQsYixjLDQsMCxmYWxzZSk7XG4gICAgICAgICAgICBtYW5pZm9sZC5hZGRQb2ludChleCwgZXksIGV6LCBueCwgbnksIG56LCBlZCwgdGhpcy5mbGlwKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgIH1cblxuICB9KTtcblxuICBmdW5jdGlvbiBDeWxpbmRlckN5bGluZGVyQ29sbGlzaW9uRGV0ZWN0b3IoKSB7XG5cbiAgICBDb2xsaXNpb25EZXRlY3Rvci5jYWxsKHRoaXMpO1xuXG4gIH1cbiAgQ3lsaW5kZXJDeWxpbmRlckNvbGxpc2lvbkRldGVjdG9yLnByb3RvdHlwZSA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmNyZWF0ZShDb2xsaXNpb25EZXRlY3Rvci5wcm90b3R5cGUpLCB7XG5cbiAgICBjb25zdHJ1Y3RvcjogQ3lsaW5kZXJDeWxpbmRlckNvbGxpc2lvbkRldGVjdG9yLFxuXG5cbiAgICBnZXRTZXA6IGZ1bmN0aW9uIChjMSwgYzIsIHNlcCwgcG9zLCBkZXApIHtcblxuICAgICAgdmFyIHQxeDtcbiAgICAgIHZhciB0MXk7XG4gICAgICB2YXIgdDF6O1xuICAgICAgdmFyIHQyeDtcbiAgICAgIHZhciB0Mnk7XG4gICAgICB2YXIgdDJ6O1xuICAgICAgdmFyIHN1cCA9IG5ldyBWZWMzKCk7XG4gICAgICB2YXIgbGVuO1xuICAgICAgdmFyIHAxeDtcbiAgICAgIHZhciBwMXk7XG4gICAgICB2YXIgcDF6O1xuICAgICAgdmFyIHAyeDtcbiAgICAgIHZhciBwMnk7XG4gICAgICB2YXIgcDJ6O1xuICAgICAgdmFyIHYwMXggPSBjMS5wb3NpdGlvbi54O1xuICAgICAgdmFyIHYwMXkgPSBjMS5wb3NpdGlvbi55O1xuICAgICAgdmFyIHYwMXogPSBjMS5wb3NpdGlvbi56O1xuICAgICAgdmFyIHYwMnggPSBjMi5wb3NpdGlvbi54O1xuICAgICAgdmFyIHYwMnkgPSBjMi5wb3NpdGlvbi55O1xuICAgICAgdmFyIHYwMnogPSBjMi5wb3NpdGlvbi56O1xuICAgICAgdmFyIHYweCA9IHYwMnggLSB2MDF4O1xuICAgICAgdmFyIHYweSA9IHYwMnkgLSB2MDF5O1xuICAgICAgdmFyIHYweiA9IHYwMnogLSB2MDF6O1xuICAgICAgaWYgKHYweCAqIHYweCArIHYweSAqIHYweSArIHYweiAqIHYweiA9PSAwKSB2MHkgPSAwLjAwMTtcbiAgICAgIHZhciBueCA9IC12MHg7XG4gICAgICB2YXIgbnkgPSAtdjB5O1xuICAgICAgdmFyIG56ID0gLXYwejtcbiAgICAgIHRoaXMuc3VwcG9ydFBvaW50KGMxLCAtbngsIC1ueSwgLW56LCBzdXApO1xuICAgICAgdmFyIHYxMXggPSBzdXAueDtcbiAgICAgIHZhciB2MTF5ID0gc3VwLnk7XG4gICAgICB2YXIgdjExeiA9IHN1cC56O1xuICAgICAgdGhpcy5zdXBwb3J0UG9pbnQoYzIsIG54LCBueSwgbnosIHN1cCk7XG4gICAgICB2YXIgdjEyeCA9IHN1cC54O1xuICAgICAgdmFyIHYxMnkgPSBzdXAueTtcbiAgICAgIHZhciB2MTJ6ID0gc3VwLno7XG4gICAgICB2YXIgdjF4ID0gdjEyeCAtIHYxMXg7XG4gICAgICB2YXIgdjF5ID0gdjEyeSAtIHYxMXk7XG4gICAgICB2YXIgdjF6ID0gdjEyeiAtIHYxMXo7XG4gICAgICBpZiAodjF4ICogbnggKyB2MXkgKiBueSArIHYxeiAqIG56IDw9IDApIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgbnggPSB2MXkgKiB2MHogLSB2MXogKiB2MHk7XG4gICAgICBueSA9IHYxeiAqIHYweCAtIHYxeCAqIHYwejtcbiAgICAgIG56ID0gdjF4ICogdjB5IC0gdjF5ICogdjB4O1xuICAgICAgaWYgKG54ICogbnggKyBueSAqIG55ICsgbnogKiBueiA9PSAwKSB7XG4gICAgICAgIHNlcC5zZXQodjF4IC0gdjB4LCB2MXkgLSB2MHksIHYxeiAtIHYweikubm9ybWFsaXplKCk7XG4gICAgICAgIHBvcy5zZXQoKHYxMXggKyB2MTJ4KSAqIDAuNSwgKHYxMXkgKyB2MTJ5KSAqIDAuNSwgKHYxMXogKyB2MTJ6KSAqIDAuNSk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgICAgdGhpcy5zdXBwb3J0UG9pbnQoYzEsIC1ueCwgLW55LCAtbnosIHN1cCk7XG4gICAgICB2YXIgdjIxeCA9IHN1cC54O1xuICAgICAgdmFyIHYyMXkgPSBzdXAueTtcbiAgICAgIHZhciB2MjF6ID0gc3VwLno7XG4gICAgICB0aGlzLnN1cHBvcnRQb2ludChjMiwgbngsIG55LCBueiwgc3VwKTtcbiAgICAgIHZhciB2MjJ4ID0gc3VwLng7XG4gICAgICB2YXIgdjIyeSA9IHN1cC55O1xuICAgICAgdmFyIHYyMnogPSBzdXAuejtcbiAgICAgIHZhciB2MnggPSB2MjJ4IC0gdjIxeDtcbiAgICAgIHZhciB2MnkgPSB2MjJ5IC0gdjIxeTtcbiAgICAgIHZhciB2MnogPSB2MjJ6IC0gdjIxejtcbiAgICAgIGlmICh2MnggKiBueCArIHYyeSAqIG55ICsgdjJ6ICogbnogPD0gMCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICB0MXggPSB2MXggLSB2MHg7XG4gICAgICB0MXkgPSB2MXkgLSB2MHk7XG4gICAgICB0MXogPSB2MXogLSB2MHo7XG4gICAgICB0MnggPSB2MnggLSB2MHg7XG4gICAgICB0MnkgPSB2MnkgLSB2MHk7XG4gICAgICB0MnogPSB2MnogLSB2MHo7XG4gICAgICBueCA9IHQxeSAqIHQyeiAtIHQxeiAqIHQyeTtcbiAgICAgIG55ID0gdDF6ICogdDJ4IC0gdDF4ICogdDJ6O1xuICAgICAgbnogPSB0MXggKiB0MnkgLSB0MXkgKiB0Mng7XG4gICAgICBpZiAobnggKiB2MHggKyBueSAqIHYweSArIG56ICogdjB6ID4gMCkge1xuICAgICAgICB0MXggPSB2MXg7XG4gICAgICAgIHQxeSA9IHYxeTtcbiAgICAgICAgdDF6ID0gdjF6O1xuICAgICAgICB2MXggPSB2Mng7XG4gICAgICAgIHYxeSA9IHYyeTtcbiAgICAgICAgdjF6ID0gdjJ6O1xuICAgICAgICB2MnggPSB0MXg7XG4gICAgICAgIHYyeSA9IHQxeTtcbiAgICAgICAgdjJ6ID0gdDF6O1xuICAgICAgICB0MXggPSB2MTF4O1xuICAgICAgICB0MXkgPSB2MTF5O1xuICAgICAgICB0MXogPSB2MTF6O1xuICAgICAgICB2MTF4ID0gdjIxeDtcbiAgICAgICAgdjExeSA9IHYyMXk7XG4gICAgICAgIHYxMXogPSB2MjF6O1xuICAgICAgICB2MjF4ID0gdDF4O1xuICAgICAgICB2MjF5ID0gdDF5O1xuICAgICAgICB2MjF6ID0gdDF6O1xuICAgICAgICB0MXggPSB2MTJ4O1xuICAgICAgICB0MXkgPSB2MTJ5O1xuICAgICAgICB0MXogPSB2MTJ6O1xuICAgICAgICB2MTJ4ID0gdjIyeDtcbiAgICAgICAgdjEyeSA9IHYyMnk7XG4gICAgICAgIHYxMnogPSB2MjJ6O1xuICAgICAgICB2MjJ4ID0gdDF4O1xuICAgICAgICB2MjJ5ID0gdDF5O1xuICAgICAgICB2MjJ6ID0gdDF6O1xuICAgICAgICBueCA9IC1ueDtcbiAgICAgICAgbnkgPSAtbnk7XG4gICAgICAgIG56ID0gLW56O1xuICAgICAgfVxuICAgICAgdmFyIGl0ZXJhdGlvbnMgPSAwO1xuICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgaWYgKCsraXRlcmF0aW9ucyA+IDEwMCkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnN1cHBvcnRQb2ludChjMSwgLW54LCAtbnksIC1ueiwgc3VwKTtcbiAgICAgICAgdmFyIHYzMXggPSBzdXAueDtcbiAgICAgICAgdmFyIHYzMXkgPSBzdXAueTtcbiAgICAgICAgdmFyIHYzMXogPSBzdXAuejtcbiAgICAgICAgdGhpcy5zdXBwb3J0UG9pbnQoYzIsIG54LCBueSwgbnosIHN1cCk7XG4gICAgICAgIHZhciB2MzJ4ID0gc3VwLng7XG4gICAgICAgIHZhciB2MzJ5ID0gc3VwLnk7XG4gICAgICAgIHZhciB2MzJ6ID0gc3VwLno7XG4gICAgICAgIHZhciB2M3ggPSB2MzJ4IC0gdjMxeDtcbiAgICAgICAgdmFyIHYzeSA9IHYzMnkgLSB2MzF5O1xuICAgICAgICB2YXIgdjN6ID0gdjMyeiAtIHYzMXo7XG4gICAgICAgIGlmICh2M3ggKiBueCArIHYzeSAqIG55ICsgdjN6ICogbnogPD0gMCkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoKHYxeSAqIHYzeiAtIHYxeiAqIHYzeSkgKiB2MHggKyAodjF6ICogdjN4IC0gdjF4ICogdjN6KSAqIHYweSArICh2MXggKiB2M3kgLSB2MXkgKiB2M3gpICogdjB6IDwgMCkge1xuICAgICAgICAgIHYyeCA9IHYzeDtcbiAgICAgICAgICB2MnkgPSB2M3k7XG4gICAgICAgICAgdjJ6ID0gdjN6O1xuICAgICAgICAgIHYyMXggPSB2MzF4O1xuICAgICAgICAgIHYyMXkgPSB2MzF5O1xuICAgICAgICAgIHYyMXogPSB2MzF6O1xuICAgICAgICAgIHYyMnggPSB2MzJ4O1xuICAgICAgICAgIHYyMnkgPSB2MzJ5O1xuICAgICAgICAgIHYyMnogPSB2MzJ6O1xuICAgICAgICAgIHQxeCA9IHYxeCAtIHYweDtcbiAgICAgICAgICB0MXkgPSB2MXkgLSB2MHk7XG4gICAgICAgICAgdDF6ID0gdjF6IC0gdjB6O1xuICAgICAgICAgIHQyeCA9IHYzeCAtIHYweDtcbiAgICAgICAgICB0MnkgPSB2M3kgLSB2MHk7XG4gICAgICAgICAgdDJ6ID0gdjN6IC0gdjB6O1xuICAgICAgICAgIG54ID0gdDF5ICogdDJ6IC0gdDF6ICogdDJ5O1xuICAgICAgICAgIG55ID0gdDF6ICogdDJ4IC0gdDF4ICogdDJ6O1xuICAgICAgICAgIG56ID0gdDF4ICogdDJ5IC0gdDF5ICogdDJ4O1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGlmICgodjN5ICogdjJ6IC0gdjN6ICogdjJ5KSAqIHYweCArICh2M3ogKiB2MnggLSB2M3ggKiB2MnopICogdjB5ICsgKHYzeCAqIHYyeSAtIHYzeSAqIHYyeCkgKiB2MHogPCAwKSB7XG4gICAgICAgICAgdjF4ID0gdjN4O1xuICAgICAgICAgIHYxeSA9IHYzeTtcbiAgICAgICAgICB2MXogPSB2M3o7XG4gICAgICAgICAgdjExeCA9IHYzMXg7XG4gICAgICAgICAgdjExeSA9IHYzMXk7XG4gICAgICAgICAgdjExeiA9IHYzMXo7XG4gICAgICAgICAgdjEyeCA9IHYzMng7XG4gICAgICAgICAgdjEyeSA9IHYzMnk7XG4gICAgICAgICAgdjEyeiA9IHYzMno7XG4gICAgICAgICAgdDF4ID0gdjN4IC0gdjB4O1xuICAgICAgICAgIHQxeSA9IHYzeSAtIHYweTtcbiAgICAgICAgICB0MXogPSB2M3ogLSB2MHo7XG4gICAgICAgICAgdDJ4ID0gdjJ4IC0gdjB4O1xuICAgICAgICAgIHQyeSA9IHYyeSAtIHYweTtcbiAgICAgICAgICB0MnogPSB2MnogLSB2MHo7XG4gICAgICAgICAgbnggPSB0MXkgKiB0MnogLSB0MXogKiB0Mnk7XG4gICAgICAgICAgbnkgPSB0MXogKiB0MnggLSB0MXggKiB0Mno7XG4gICAgICAgICAgbnogPSB0MXggKiB0MnkgLSB0MXkgKiB0Mng7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGhpdCA9IGZhbHNlO1xuICAgICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICAgIHQxeCA9IHYyeCAtIHYxeDtcbiAgICAgICAgICB0MXkgPSB2MnkgLSB2MXk7XG4gICAgICAgICAgdDF6ID0gdjJ6IC0gdjF6O1xuICAgICAgICAgIHQyeCA9IHYzeCAtIHYxeDtcbiAgICAgICAgICB0MnkgPSB2M3kgLSB2MXk7XG4gICAgICAgICAgdDJ6ID0gdjN6IC0gdjF6O1xuICAgICAgICAgIG54ID0gdDF5ICogdDJ6IC0gdDF6ICogdDJ5O1xuICAgICAgICAgIG55ID0gdDF6ICogdDJ4IC0gdDF4ICogdDJ6O1xuICAgICAgICAgIG56ID0gdDF4ICogdDJ5IC0gdDF5ICogdDJ4O1xuICAgICAgICAgIGxlbiA9IDEgLyBfTWF0aC5zcXJ0KG54ICogbnggKyBueSAqIG55ICsgbnogKiBueik7XG4gICAgICAgICAgbnggKj0gbGVuO1xuICAgICAgICAgIG55ICo9IGxlbjtcbiAgICAgICAgICBueiAqPSBsZW47XG4gICAgICAgICAgaWYgKG54ICogdjF4ICsgbnkgKiB2MXkgKyBueiAqIHYxeiA+PSAwICYmICFoaXQpIHtcbiAgICAgICAgICAgIHZhciBiMCA9ICh2MXkgKiB2MnogLSB2MXogKiB2MnkpICogdjN4ICsgKHYxeiAqIHYyeCAtIHYxeCAqIHYyeikgKiB2M3kgKyAodjF4ICogdjJ5IC0gdjF5ICogdjJ4KSAqIHYzejtcbiAgICAgICAgICAgIHZhciBiMSA9ICh2M3kgKiB2MnogLSB2M3ogKiB2MnkpICogdjB4ICsgKHYzeiAqIHYyeCAtIHYzeCAqIHYyeikgKiB2MHkgKyAodjN4ICogdjJ5IC0gdjN5ICogdjJ4KSAqIHYwejtcbiAgICAgICAgICAgIHZhciBiMiA9ICh2MHkgKiB2MXogLSB2MHogKiB2MXkpICogdjN4ICsgKHYweiAqIHYxeCAtIHYweCAqIHYxeikgKiB2M3kgKyAodjB4ICogdjF5IC0gdjB5ICogdjF4KSAqIHYzejtcbiAgICAgICAgICAgIHZhciBiMyA9ICh2MnkgKiB2MXogLSB2MnogKiB2MXkpICogdjB4ICsgKHYyeiAqIHYxeCAtIHYyeCAqIHYxeikgKiB2MHkgKyAodjJ4ICogdjF5IC0gdjJ5ICogdjF4KSAqIHYwejtcbiAgICAgICAgICAgIHZhciBzdW0gPSBiMCArIGIxICsgYjIgKyBiMztcbiAgICAgICAgICAgIGlmIChzdW0gPD0gMCkge1xuICAgICAgICAgICAgICBiMCA9IDA7XG4gICAgICAgICAgICAgIGIxID0gKHYyeSAqIHYzeiAtIHYyeiAqIHYzeSkgKiBueCArICh2MnogKiB2M3ggLSB2MnggKiB2M3opICogbnkgKyAodjJ4ICogdjN5IC0gdjJ5ICogdjN4KSAqIG56O1xuICAgICAgICAgICAgICBiMiA9ICh2M3kgKiB2MnogLSB2M3ogKiB2MnkpICogbnggKyAodjN6ICogdjJ4IC0gdjN4ICogdjJ6KSAqIG55ICsgKHYzeCAqIHYyeSAtIHYzeSAqIHYyeCkgKiBuejtcbiAgICAgICAgICAgICAgYjMgPSAodjF5ICogdjJ6IC0gdjF6ICogdjJ5KSAqIG54ICsgKHYxeiAqIHYyeCAtIHYxeCAqIHYyeikgKiBueSArICh2MXggKiB2MnkgLSB2MXkgKiB2MngpICogbno7XG4gICAgICAgICAgICAgIHN1bSA9IGIxICsgYjIgKyBiMztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBpbnYgPSAxIC8gc3VtO1xuICAgICAgICAgICAgcDF4ID0gKHYwMXggKiBiMCArIHYxMXggKiBiMSArIHYyMXggKiBiMiArIHYzMXggKiBiMykgKiBpbnY7XG4gICAgICAgICAgICBwMXkgPSAodjAxeSAqIGIwICsgdjExeSAqIGIxICsgdjIxeSAqIGIyICsgdjMxeSAqIGIzKSAqIGludjtcbiAgICAgICAgICAgIHAxeiA9ICh2MDF6ICogYjAgKyB2MTF6ICogYjEgKyB2MjF6ICogYjIgKyB2MzF6ICogYjMpICogaW52O1xuICAgICAgICAgICAgcDJ4ID0gKHYwMnggKiBiMCArIHYxMnggKiBiMSArIHYyMnggKiBiMiArIHYzMnggKiBiMykgKiBpbnY7XG4gICAgICAgICAgICBwMnkgPSAodjAyeSAqIGIwICsgdjEyeSAqIGIxICsgdjIyeSAqIGIyICsgdjMyeSAqIGIzKSAqIGludjtcbiAgICAgICAgICAgIHAyeiA9ICh2MDJ6ICogYjAgKyB2MTJ6ICogYjEgKyB2MjJ6ICogYjIgKyB2MzJ6ICogYjMpICogaW52O1xuICAgICAgICAgICAgaGl0ID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5zdXBwb3J0UG9pbnQoYzEsIC1ueCwgLW55LCAtbnosIHN1cCk7XG4gICAgICAgICAgdmFyIHY0MXggPSBzdXAueDtcbiAgICAgICAgICB2YXIgdjQxeSA9IHN1cC55O1xuICAgICAgICAgIHZhciB2NDF6ID0gc3VwLno7XG4gICAgICAgICAgdGhpcy5zdXBwb3J0UG9pbnQoYzIsIG54LCBueSwgbnosIHN1cCk7XG4gICAgICAgICAgdmFyIHY0MnggPSBzdXAueDtcbiAgICAgICAgICB2YXIgdjQyeSA9IHN1cC55O1xuICAgICAgICAgIHZhciB2NDJ6ID0gc3VwLno7XG4gICAgICAgICAgdmFyIHY0eCA9IHY0MnggLSB2NDF4O1xuICAgICAgICAgIHZhciB2NHkgPSB2NDJ5IC0gdjQxeTtcbiAgICAgICAgICB2YXIgdjR6ID0gdjQyeiAtIHY0MXo7XG4gICAgICAgICAgdmFyIHNlcGFyYXRpb24gPSAtKHY0eCAqIG54ICsgdjR5ICogbnkgKyB2NHogKiBueik7XG4gICAgICAgICAgaWYgKCh2NHggLSB2M3gpICogbnggKyAodjR5IC0gdjN5KSAqIG55ICsgKHY0eiAtIHYzeikgKiBueiA8PSAwLjAxIHx8IHNlcGFyYXRpb24gPj0gMCkge1xuICAgICAgICAgICAgaWYgKGhpdCkge1xuICAgICAgICAgICAgICBzZXAuc2V0KC1ueCwgLW55LCAtbnopO1xuICAgICAgICAgICAgICBwb3Muc2V0KChwMXggKyBwMngpICogMC41LCAocDF5ICsgcDJ5KSAqIDAuNSwgKHAxeiArIHAyeikgKiAwLjUpO1xuICAgICAgICAgICAgICBkZXAueCA9IHNlcGFyYXRpb247XG4gICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAodjR5ICogdjF6IC0gdjR6ICogdjF5KSAqIHYweCArXG4gICAgICAgICAgICAodjR6ICogdjF4IC0gdjR4ICogdjF6KSAqIHYweSArXG4gICAgICAgICAgICAodjR4ICogdjF5IC0gdjR5ICogdjF4KSAqIHYweiA8IDBcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgKHY0eSAqIHYyeiAtIHY0eiAqIHYyeSkgKiB2MHggK1xuICAgICAgICAgICAgICAodjR6ICogdjJ4IC0gdjR4ICogdjJ6KSAqIHYweSArXG4gICAgICAgICAgICAgICh2NHggKiB2MnkgLSB2NHkgKiB2MngpICogdjB6IDwgMFxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgIHYxeCA9IHY0eDtcbiAgICAgICAgICAgICAgdjF5ID0gdjR5O1xuICAgICAgICAgICAgICB2MXogPSB2NHo7XG4gICAgICAgICAgICAgIHYxMXggPSB2NDF4O1xuICAgICAgICAgICAgICB2MTF5ID0gdjQxeTtcbiAgICAgICAgICAgICAgdjExeiA9IHY0MXo7XG4gICAgICAgICAgICAgIHYxMnggPSB2NDJ4O1xuICAgICAgICAgICAgICB2MTJ5ID0gdjQyeTtcbiAgICAgICAgICAgICAgdjEyeiA9IHY0Mno7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB2M3ggPSB2NHg7XG4gICAgICAgICAgICAgIHYzeSA9IHY0eTtcbiAgICAgICAgICAgICAgdjN6ID0gdjR6O1xuICAgICAgICAgICAgICB2MzF4ID0gdjQxeDtcbiAgICAgICAgICAgICAgdjMxeSA9IHY0MXk7XG4gICAgICAgICAgICAgIHYzMXogPSB2NDF6O1xuICAgICAgICAgICAgICB2MzJ4ID0gdjQyeDtcbiAgICAgICAgICAgICAgdjMyeSA9IHY0Mnk7XG4gICAgICAgICAgICAgIHYzMnogPSB2NDJ6O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICh2NHkgKiB2M3ogLSB2NHogKiB2M3kpICogdjB4ICtcbiAgICAgICAgICAgICAgKHY0eiAqIHYzeCAtIHY0eCAqIHYzeikgKiB2MHkgK1xuICAgICAgICAgICAgICAodjR4ICogdjN5IC0gdjR5ICogdjN4KSAqIHYweiA8IDBcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICB2MnggPSB2NHg7XG4gICAgICAgICAgICAgIHYyeSA9IHY0eTtcbiAgICAgICAgICAgICAgdjJ6ID0gdjR6O1xuICAgICAgICAgICAgICB2MjF4ID0gdjQxeDtcbiAgICAgICAgICAgICAgdjIxeSA9IHY0MXk7XG4gICAgICAgICAgICAgIHYyMXogPSB2NDF6O1xuICAgICAgICAgICAgICB2MjJ4ID0gdjQyeDtcbiAgICAgICAgICAgICAgdjIyeSA9IHY0Mnk7XG4gICAgICAgICAgICAgIHYyMnogPSB2NDJ6O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdjF4ID0gdjR4O1xuICAgICAgICAgICAgICB2MXkgPSB2NHk7XG4gICAgICAgICAgICAgIHYxeiA9IHY0ejtcbiAgICAgICAgICAgICAgdjExeCA9IHY0MXg7XG4gICAgICAgICAgICAgIHYxMXkgPSB2NDF5O1xuICAgICAgICAgICAgICB2MTF6ID0gdjQxejtcbiAgICAgICAgICAgICAgdjEyeCA9IHY0Mng7XG4gICAgICAgICAgICAgIHYxMnkgPSB2NDJ5O1xuICAgICAgICAgICAgICB2MTJ6ID0gdjQyejtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vcmV0dXJuIGZhbHNlO1xuICAgIH0sXG5cbiAgICBzdXBwb3J0UG9pbnQ6IGZ1bmN0aW9uIChjLCBkeCwgZHksIGR6LCBvdXQpIHtcblxuICAgICAgdmFyIHJvdCA9IGMucm90YXRpb24uZWxlbWVudHM7XG4gICAgICB2YXIgbGR4ID0gcm90WzBdICogZHggKyByb3RbM10gKiBkeSArIHJvdFs2XSAqIGR6O1xuICAgICAgdmFyIGxkeSA9IHJvdFsxXSAqIGR4ICsgcm90WzRdICogZHkgKyByb3RbN10gKiBkejtcbiAgICAgIHZhciBsZHogPSByb3RbMl0gKiBkeCArIHJvdFs1XSAqIGR5ICsgcm90WzhdICogZHo7XG4gICAgICB2YXIgcmFkeCA9IGxkeDtcbiAgICAgIHZhciByYWR6ID0gbGR6O1xuICAgICAgdmFyIGxlbiA9IHJhZHggKiByYWR4ICsgcmFkeiAqIHJhZHo7XG4gICAgICB2YXIgcmFkID0gYy5yYWRpdXM7XG4gICAgICB2YXIgaGggPSBjLmhhbGZIZWlnaHQ7XG4gICAgICB2YXIgb3g7XG4gICAgICB2YXIgb3k7XG4gICAgICB2YXIgb3o7XG4gICAgICBpZiAobGVuID09IDApIHtcbiAgICAgICAgaWYgKGxkeSA8IDApIHtcbiAgICAgICAgICBveCA9IHJhZDtcbiAgICAgICAgICBveSA9IC1oaDtcbiAgICAgICAgICBveiA9IDA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgb3ggPSByYWQ7XG4gICAgICAgICAgb3kgPSBoaDtcbiAgICAgICAgICBveiA9IDA7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxlbiA9IGMucmFkaXVzIC8gX01hdGguc3FydChsZW4pO1xuICAgICAgICBpZiAobGR5IDwgMCkge1xuICAgICAgICAgIG94ID0gcmFkeCAqIGxlbjtcbiAgICAgICAgICBveSA9IC1oaDtcbiAgICAgICAgICBveiA9IHJhZHogKiBsZW47XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgb3ggPSByYWR4ICogbGVuO1xuICAgICAgICAgIG95ID0gaGg7XG4gICAgICAgICAgb3ogPSByYWR6ICogbGVuO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBsZHggPSByb3RbMF0gKiBveCArIHJvdFsxXSAqIG95ICsgcm90WzJdICogb3ogKyBjLnBvc2l0aW9uLng7XG4gICAgICBsZHkgPSByb3RbM10gKiBveCArIHJvdFs0XSAqIG95ICsgcm90WzVdICogb3ogKyBjLnBvc2l0aW9uLnk7XG4gICAgICBsZHogPSByb3RbNl0gKiBveCArIHJvdFs3XSAqIG95ICsgcm90WzhdICogb3ogKyBjLnBvc2l0aW9uLno7XG4gICAgICBvdXQuc2V0KGxkeCwgbGR5LCBsZHopO1xuXG4gICAgfSxcblxuICAgIGRldGVjdENvbGxpc2lvbjogZnVuY3Rpb24gKHNoYXBlMSwgc2hhcGUyLCBtYW5pZm9sZCkge1xuXG4gICAgICB2YXIgYzE7XG4gICAgICB2YXIgYzI7XG4gICAgICBpZiAoc2hhcGUxLmlkIDwgc2hhcGUyLmlkKSB7XG4gICAgICAgIGMxID0gc2hhcGUxO1xuICAgICAgICBjMiA9IHNoYXBlMjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGMxID0gc2hhcGUyO1xuICAgICAgICBjMiA9IHNoYXBlMTtcbiAgICAgIH1cbiAgICAgIHZhciBwMSA9IGMxLnBvc2l0aW9uO1xuICAgICAgdmFyIHAyID0gYzIucG9zaXRpb247XG4gICAgICB2YXIgcDF4ID0gcDEueDtcbiAgICAgIHZhciBwMXkgPSBwMS55O1xuICAgICAgdmFyIHAxeiA9IHAxLno7XG4gICAgICB2YXIgcDJ4ID0gcDIueDtcbiAgICAgIHZhciBwMnkgPSBwMi55O1xuICAgICAgdmFyIHAyeiA9IHAyLno7XG4gICAgICB2YXIgaDEgPSBjMS5oYWxmSGVpZ2h0O1xuICAgICAgdmFyIGgyID0gYzIuaGFsZkhlaWdodDtcbiAgICAgIHZhciBuMSA9IGMxLm5vcm1hbERpcmVjdGlvbjtcbiAgICAgIHZhciBuMiA9IGMyLm5vcm1hbERpcmVjdGlvbjtcbiAgICAgIHZhciBkMSA9IGMxLmhhbGZEaXJlY3Rpb247XG4gICAgICB2YXIgZDIgPSBjMi5oYWxmRGlyZWN0aW9uO1xuICAgICAgdmFyIHIxID0gYzEucmFkaXVzO1xuICAgICAgdmFyIHIyID0gYzIucmFkaXVzO1xuICAgICAgdmFyIG4xeCA9IG4xLng7XG4gICAgICB2YXIgbjF5ID0gbjEueTtcbiAgICAgIHZhciBuMXogPSBuMS56O1xuICAgICAgdmFyIG4yeCA9IG4yLng7XG4gICAgICB2YXIgbjJ5ID0gbjIueTtcbiAgICAgIHZhciBuMnogPSBuMi56O1xuICAgICAgdmFyIGQxeCA9IGQxLng7XG4gICAgICB2YXIgZDF5ID0gZDEueTtcbiAgICAgIHZhciBkMXogPSBkMS56O1xuICAgICAgdmFyIGQyeCA9IGQyLng7XG4gICAgICB2YXIgZDJ5ID0gZDIueTtcbiAgICAgIHZhciBkMnogPSBkMi56O1xuICAgICAgdmFyIGR4ID0gcDF4IC0gcDJ4O1xuICAgICAgdmFyIGR5ID0gcDF5IC0gcDJ5O1xuICAgICAgdmFyIGR6ID0gcDF6IC0gcDJ6O1xuICAgICAgdmFyIGxlbjtcbiAgICAgIHZhciBjMXg7XG4gICAgICB2YXIgYzF5O1xuICAgICAgdmFyIGMxejtcbiAgICAgIHZhciBjMng7XG4gICAgICB2YXIgYzJ5O1xuICAgICAgdmFyIGMyejtcbiAgICAgIHZhciB0eDtcbiAgICAgIHZhciB0eTtcbiAgICAgIHZhciB0ejtcbiAgICAgIHZhciBzeDtcbiAgICAgIHZhciBzeTtcbiAgICAgIHZhciBzejtcbiAgICAgIHZhciBleDtcbiAgICAgIHZhciBleTtcbiAgICAgIHZhciBlejtcbiAgICAgIHZhciBkZXB0aDE7XG4gICAgICB2YXIgZGVwdGgyO1xuICAgICAgdmFyIGRvdDtcbiAgICAgIHZhciB0MTtcbiAgICAgIHZhciB0MjtcbiAgICAgIHZhciBzZXAgPSBuZXcgVmVjMygpO1xuICAgICAgdmFyIHBvcyA9IG5ldyBWZWMzKCk7XG4gICAgICB2YXIgZGVwID0gbmV3IFZlYzMoKTtcbiAgICAgIGlmICghdGhpcy5nZXRTZXAoYzEsIGMyLCBzZXAsIHBvcywgZGVwKSkgcmV0dXJuO1xuICAgICAgdmFyIGRvdDEgPSBzZXAueCAqIG4xeCArIHNlcC55ICogbjF5ICsgc2VwLnogKiBuMXo7XG4gICAgICB2YXIgZG90MiA9IHNlcC54ICogbjJ4ICsgc2VwLnkgKiBuMnkgKyBzZXAueiAqIG4yejtcbiAgICAgIHZhciByaWdodDEgPSBkb3QxID4gMDtcbiAgICAgIHZhciByaWdodDIgPSBkb3QyID4gMDtcbiAgICAgIGlmICghcmlnaHQxKSBkb3QxID0gLWRvdDE7XG4gICAgICBpZiAoIXJpZ2h0MikgZG90MiA9IC1kb3QyO1xuICAgICAgdmFyIHN0YXRlID0gMDtcbiAgICAgIGlmIChkb3QxID4gMC45OTkgfHwgZG90MiA+IDAuOTk5KSB7XG4gICAgICAgIGlmIChkb3QxID4gZG90Mikgc3RhdGUgPSAxO1xuICAgICAgICBlbHNlIHN0YXRlID0gMjtcbiAgICAgIH1cbiAgICAgIHZhciBueDtcbiAgICAgIHZhciBueTtcbiAgICAgIHZhciBuejtcbiAgICAgIHZhciBkZXB0aCA9IGRlcC54O1xuICAgICAgdmFyIHIwMDtcbiAgICAgIHZhciByMDE7XG4gICAgICB2YXIgcjAyO1xuICAgICAgdmFyIHIxMDtcbiAgICAgIHZhciByMTE7XG4gICAgICB2YXIgcjEyO1xuICAgICAgdmFyIHIyMDtcbiAgICAgIHZhciByMjE7XG4gICAgICB2YXIgcjIyO1xuICAgICAgdmFyIHB4O1xuICAgICAgdmFyIHB5O1xuICAgICAgdmFyIHB6O1xuICAgICAgdmFyIHBkO1xuICAgICAgdmFyIGE7XG4gICAgICB2YXIgYjtcbiAgICAgIHZhciBlO1xuICAgICAgdmFyIGY7XG4gICAgICBueCA9IHNlcC54O1xuICAgICAgbnkgPSBzZXAueTtcbiAgICAgIG56ID0gc2VwLno7XG4gICAgICBzd2l0Y2ggKHN0YXRlKSB7XG4gICAgICAgIGNhc2UgMDpcbiAgICAgICAgICBtYW5pZm9sZC5hZGRQb2ludChwb3MueCwgcG9zLnksIHBvcy56LCBueCwgbnksIG56LCBkZXB0aCwgZmFsc2UpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgaWYgKHJpZ2h0MSkge1xuICAgICAgICAgICAgYzF4ID0gcDF4ICsgZDF4O1xuICAgICAgICAgICAgYzF5ID0gcDF5ICsgZDF5O1xuICAgICAgICAgICAgYzF6ID0gcDF6ICsgZDF6O1xuICAgICAgICAgICAgbnggPSBuMXg7XG4gICAgICAgICAgICBueSA9IG4xeTtcbiAgICAgICAgICAgIG56ID0gbjF6O1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjMXggPSBwMXggLSBkMXg7XG4gICAgICAgICAgICBjMXkgPSBwMXkgLSBkMXk7XG4gICAgICAgICAgICBjMXogPSBwMXogLSBkMXo7XG4gICAgICAgICAgICBueCA9IC1uMXg7XG4gICAgICAgICAgICBueSA9IC1uMXk7XG4gICAgICAgICAgICBueiA9IC1uMXo7XG4gICAgICAgICAgfVxuICAgICAgICAgIGRvdCA9IG54ICogbjJ4ICsgbnkgKiBuMnkgKyBueiAqIG4yejtcbiAgICAgICAgICBpZiAoZG90IDwgMCkgbGVuID0gaDI7XG4gICAgICAgICAgZWxzZSBsZW4gPSAtaDI7XG4gICAgICAgICAgYzJ4ID0gcDJ4ICsgbGVuICogbjJ4O1xuICAgICAgICAgIGMyeSA9IHAyeSArIGxlbiAqIG4yeTtcbiAgICAgICAgICBjMnogPSBwMnogKyBsZW4gKiBuMno7XG4gICAgICAgICAgaWYgKGRvdDIgPj0gMC45OTk5OTkpIHtcbiAgICAgICAgICAgIHR4ID0gLW55O1xuICAgICAgICAgICAgdHkgPSBuejtcbiAgICAgICAgICAgIHR6ID0gbng7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHR4ID0gbng7XG4gICAgICAgICAgICB0eSA9IG55O1xuICAgICAgICAgICAgdHogPSBuejtcbiAgICAgICAgICB9XG4gICAgICAgICAgbGVuID0gdHggKiBuMnggKyB0eSAqIG4yeSArIHR6ICogbjJ6O1xuICAgICAgICAgIGR4ID0gbGVuICogbjJ4IC0gdHg7XG4gICAgICAgICAgZHkgPSBsZW4gKiBuMnkgLSB0eTtcbiAgICAgICAgICBkeiA9IGxlbiAqIG4yeiAtIHR6O1xuICAgICAgICAgIGxlbiA9IF9NYXRoLnNxcnQoZHggKiBkeCArIGR5ICogZHkgKyBkeiAqIGR6KTtcbiAgICAgICAgICBpZiAobGVuID09IDApIGJyZWFrO1xuICAgICAgICAgIGxlbiA9IHIyIC8gbGVuO1xuICAgICAgICAgIGR4ICo9IGxlbjtcbiAgICAgICAgICBkeSAqPSBsZW47XG4gICAgICAgICAgZHogKj0gbGVuO1xuICAgICAgICAgIHR4ID0gYzJ4ICsgZHg7XG4gICAgICAgICAgdHkgPSBjMnkgKyBkeTtcbiAgICAgICAgICB0eiA9IGMyeiArIGR6O1xuICAgICAgICAgIGlmIChkb3QgPCAtMC45NiB8fCBkb3QgPiAwLjk2KSB7XG4gICAgICAgICAgICByMDAgPSBuMnggKiBuMnggKiAxLjUgLSAwLjU7XG4gICAgICAgICAgICByMDEgPSBuMnggKiBuMnkgKiAxLjUgLSBuMnogKiAwLjg2NjAyNTQwMztcbiAgICAgICAgICAgIHIwMiA9IG4yeCAqIG4yeiAqIDEuNSArIG4yeSAqIDAuODY2MDI1NDAzO1xuICAgICAgICAgICAgcjEwID0gbjJ5ICogbjJ4ICogMS41ICsgbjJ6ICogMC44NjYwMjU0MDM7XG4gICAgICAgICAgICByMTEgPSBuMnkgKiBuMnkgKiAxLjUgLSAwLjU7XG4gICAgICAgICAgICByMTIgPSBuMnkgKiBuMnogKiAxLjUgLSBuMnggKiAwLjg2NjAyNTQwMztcbiAgICAgICAgICAgIHIyMCA9IG4yeiAqIG4yeCAqIDEuNSAtIG4yeSAqIDAuODY2MDI1NDAzO1xuICAgICAgICAgICAgcjIxID0gbjJ6ICogbjJ5ICogMS41ICsgbjJ4ICogMC44NjYwMjU0MDM7XG4gICAgICAgICAgICByMjIgPSBuMnogKiBuMnogKiAxLjUgLSAwLjU7XG4gICAgICAgICAgICBweCA9IHR4O1xuICAgICAgICAgICAgcHkgPSB0eTtcbiAgICAgICAgICAgIHB6ID0gdHo7XG4gICAgICAgICAgICBwZCA9IG54ICogKHB4IC0gYzF4KSArIG55ICogKHB5IC0gYzF5KSArIG56ICogKHB6IC0gYzF6KTtcbiAgICAgICAgICAgIHR4ID0gcHggLSBwZCAqIG54IC0gYzF4O1xuICAgICAgICAgICAgdHkgPSBweSAtIHBkICogbnkgLSBjMXk7XG4gICAgICAgICAgICB0eiA9IHB6IC0gcGQgKiBueiAtIGMxejtcbiAgICAgICAgICAgIGxlbiA9IHR4ICogdHggKyB0eSAqIHR5ICsgdHogKiB0ejtcbiAgICAgICAgICAgIGlmIChsZW4gPiByMSAqIHIxKSB7XG4gICAgICAgICAgICAgIGxlbiA9IHIxIC8gX01hdGguc3FydChsZW4pO1xuICAgICAgICAgICAgICB0eCAqPSBsZW47XG4gICAgICAgICAgICAgIHR5ICo9IGxlbjtcbiAgICAgICAgICAgICAgdHogKj0gbGVuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcHggPSBjMXggKyB0eDtcbiAgICAgICAgICAgIHB5ID0gYzF5ICsgdHk7XG4gICAgICAgICAgICBweiA9IGMxeiArIHR6O1xuICAgICAgICAgICAgbWFuaWZvbGQuYWRkUG9pbnQocHgsIHB5LCBweiwgbngsIG55LCBueiwgcGQsIGZhbHNlKTtcbiAgICAgICAgICAgIHB4ID0gZHggKiByMDAgKyBkeSAqIHIwMSArIGR6ICogcjAyO1xuICAgICAgICAgICAgcHkgPSBkeCAqIHIxMCArIGR5ICogcjExICsgZHogKiByMTI7XG4gICAgICAgICAgICBweiA9IGR4ICogcjIwICsgZHkgKiByMjEgKyBkeiAqIHIyMjtcbiAgICAgICAgICAgIHB4ID0gKGR4ID0gcHgpICsgYzJ4O1xuICAgICAgICAgICAgcHkgPSAoZHkgPSBweSkgKyBjMnk7XG4gICAgICAgICAgICBweiA9IChkeiA9IHB6KSArIGMyejtcbiAgICAgICAgICAgIHBkID0gbnggKiAocHggLSBjMXgpICsgbnkgKiAocHkgLSBjMXkpICsgbnogKiAocHogLSBjMXopO1xuICAgICAgICAgICAgaWYgKHBkIDw9IDApIHtcbiAgICAgICAgICAgICAgdHggPSBweCAtIHBkICogbnggLSBjMXg7XG4gICAgICAgICAgICAgIHR5ID0gcHkgLSBwZCAqIG55IC0gYzF5O1xuICAgICAgICAgICAgICB0eiA9IHB6IC0gcGQgKiBueiAtIGMxejtcbiAgICAgICAgICAgICAgbGVuID0gdHggKiB0eCArIHR5ICogdHkgKyB0eiAqIHR6O1xuICAgICAgICAgICAgICBpZiAobGVuID4gcjEgKiByMSkge1xuICAgICAgICAgICAgICAgIGxlbiA9IHIxIC8gX01hdGguc3FydChsZW4pO1xuICAgICAgICAgICAgICAgIHR4ICo9IGxlbjtcbiAgICAgICAgICAgICAgICB0eSAqPSBsZW47XG4gICAgICAgICAgICAgICAgdHogKj0gbGVuO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHB4ID0gYzF4ICsgdHg7XG4gICAgICAgICAgICAgIHB5ID0gYzF5ICsgdHk7XG4gICAgICAgICAgICAgIHB6ID0gYzF6ICsgdHo7XG4gICAgICAgICAgICAgIG1hbmlmb2xkLmFkZFBvaW50KHB4LCBweSwgcHosIG54LCBueSwgbnosIHBkLCBmYWxzZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBweCA9IGR4ICogcjAwICsgZHkgKiByMDEgKyBkeiAqIHIwMjtcbiAgICAgICAgICAgIHB5ID0gZHggKiByMTAgKyBkeSAqIHIxMSArIGR6ICogcjEyO1xuICAgICAgICAgICAgcHogPSBkeCAqIHIyMCArIGR5ICogcjIxICsgZHogKiByMjI7XG4gICAgICAgICAgICBweCA9IChkeCA9IHB4KSArIGMyeDtcbiAgICAgICAgICAgIHB5ID0gKGR5ID0gcHkpICsgYzJ5O1xuICAgICAgICAgICAgcHogPSAoZHogPSBweikgKyBjMno7XG4gICAgICAgICAgICBwZCA9IG54ICogKHB4IC0gYzF4KSArIG55ICogKHB5IC0gYzF5KSArIG56ICogKHB6IC0gYzF6KTtcbiAgICAgICAgICAgIGlmIChwZCA8PSAwKSB7XG4gICAgICAgICAgICAgIHR4ID0gcHggLSBwZCAqIG54IC0gYzF4O1xuICAgICAgICAgICAgICB0eSA9IHB5IC0gcGQgKiBueSAtIGMxeTtcbiAgICAgICAgICAgICAgdHogPSBweiAtIHBkICogbnogLSBjMXo7XG4gICAgICAgICAgICAgIGxlbiA9IHR4ICogdHggKyB0eSAqIHR5ICsgdHogKiB0ejtcbiAgICAgICAgICAgICAgaWYgKGxlbiA+IHIxICogcjEpIHtcbiAgICAgICAgICAgICAgICBsZW4gPSByMSAvIF9NYXRoLnNxcnQobGVuKTtcbiAgICAgICAgICAgICAgICB0eCAqPSBsZW47XG4gICAgICAgICAgICAgICAgdHkgKj0gbGVuO1xuICAgICAgICAgICAgICAgIHR6ICo9IGxlbjtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBweCA9IGMxeCArIHR4O1xuICAgICAgICAgICAgICBweSA9IGMxeSArIHR5O1xuICAgICAgICAgICAgICBweiA9IGMxeiArIHR6O1xuICAgICAgICAgICAgICBtYW5pZm9sZC5hZGRQb2ludChweCwgcHksIHB6LCBueCwgbnksIG56LCBwZCwgZmFsc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzeCA9IHR4O1xuICAgICAgICAgICAgc3kgPSB0eTtcbiAgICAgICAgICAgIHN6ID0gdHo7XG4gICAgICAgICAgICBkZXB0aDEgPSBueCAqIChzeCAtIGMxeCkgKyBueSAqIChzeSAtIGMxeSkgKyBueiAqIChzeiAtIGMxeik7XG4gICAgICAgICAgICBzeCAtPSBkZXB0aDEgKiBueDtcbiAgICAgICAgICAgIHN5IC09IGRlcHRoMSAqIG55O1xuICAgICAgICAgICAgc3ogLT0gZGVwdGgxICogbno7XG4gICAgICAgICAgICBpZiAoZG90ID4gMCkge1xuICAgICAgICAgICAgICBleCA9IHR4ICsgbjJ4ICogaDIgKiAyO1xuICAgICAgICAgICAgICBleSA9IHR5ICsgbjJ5ICogaDIgKiAyO1xuICAgICAgICAgICAgICBleiA9IHR6ICsgbjJ6ICogaDIgKiAyO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgZXggPSB0eCAtIG4yeCAqIGgyICogMjtcbiAgICAgICAgICAgICAgZXkgPSB0eSAtIG4yeSAqIGgyICogMjtcbiAgICAgICAgICAgICAgZXogPSB0eiAtIG4yeiAqIGgyICogMjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRlcHRoMiA9IG54ICogKGV4IC0gYzF4KSArIG55ICogKGV5IC0gYzF5KSArIG56ICogKGV6IC0gYzF6KTtcbiAgICAgICAgICAgIGV4IC09IGRlcHRoMiAqIG54O1xuICAgICAgICAgICAgZXkgLT0gZGVwdGgyICogbnk7XG4gICAgICAgICAgICBleiAtPSBkZXB0aDIgKiBuejtcbiAgICAgICAgICAgIGR4ID0gYzF4IC0gc3g7XG4gICAgICAgICAgICBkeSA9IGMxeSAtIHN5O1xuICAgICAgICAgICAgZHogPSBjMXogLSBzejtcbiAgICAgICAgICAgIHR4ID0gZXggLSBzeDtcbiAgICAgICAgICAgIHR5ID0gZXkgLSBzeTtcbiAgICAgICAgICAgIHR6ID0gZXogLSBzejtcbiAgICAgICAgICAgIGEgPSBkeCAqIGR4ICsgZHkgKiBkeSArIGR6ICogZHo7XG4gICAgICAgICAgICBiID0gZHggKiB0eCArIGR5ICogdHkgKyBkeiAqIHR6O1xuICAgICAgICAgICAgZSA9IHR4ICogdHggKyB0eSAqIHR5ICsgdHogKiB0ejtcbiAgICAgICAgICAgIGYgPSBiICogYiAtIGUgKiAoYSAtIHIxICogcjEpO1xuICAgICAgICAgICAgaWYgKGYgPCAwKSBicmVhaztcbiAgICAgICAgICAgIGYgPSBfTWF0aC5zcXJ0KGYpO1xuICAgICAgICAgICAgdDEgPSAoYiArIGYpIC8gZTtcbiAgICAgICAgICAgIHQyID0gKGIgLSBmKSAvIGU7XG4gICAgICAgICAgICBpZiAodDIgPCB0MSkge1xuICAgICAgICAgICAgICBsZW4gPSB0MTtcbiAgICAgICAgICAgICAgdDEgPSB0MjtcbiAgICAgICAgICAgICAgdDIgPSBsZW47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodDIgPiAxKSB0MiA9IDE7XG4gICAgICAgICAgICBpZiAodDEgPCAwKSB0MSA9IDA7XG4gICAgICAgICAgICB0eCA9IHN4ICsgKGV4IC0gc3gpICogdDE7XG4gICAgICAgICAgICB0eSA9IHN5ICsgKGV5IC0gc3kpICogdDE7XG4gICAgICAgICAgICB0eiA9IHN6ICsgKGV6IC0gc3opICogdDE7XG4gICAgICAgICAgICBleCA9IHN4ICsgKGV4IC0gc3gpICogdDI7XG4gICAgICAgICAgICBleSA9IHN5ICsgKGV5IC0gc3kpICogdDI7XG4gICAgICAgICAgICBleiA9IHN6ICsgKGV6IC0gc3opICogdDI7XG4gICAgICAgICAgICBzeCA9IHR4O1xuICAgICAgICAgICAgc3kgPSB0eTtcbiAgICAgICAgICAgIHN6ID0gdHo7XG4gICAgICAgICAgICBsZW4gPSBkZXB0aDEgKyAoZGVwdGgyIC0gZGVwdGgxKSAqIHQxO1xuICAgICAgICAgICAgZGVwdGgyID0gZGVwdGgxICsgKGRlcHRoMiAtIGRlcHRoMSkgKiB0MjtcbiAgICAgICAgICAgIGRlcHRoMSA9IGxlbjtcbiAgICAgICAgICAgIGlmIChkZXB0aDEgPCAwKSBtYW5pZm9sZC5hZGRQb2ludChzeCwgc3ksIHN6LCBueCwgbnksIG56LCBwZCwgZmFsc2UpO1xuICAgICAgICAgICAgaWYgKGRlcHRoMiA8IDApIG1hbmlmb2xkLmFkZFBvaW50KGV4LCBleSwgZXosIG54LCBueSwgbnosIHBkLCBmYWxzZSk7XG5cbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICBpZiAocmlnaHQyKSB7XG4gICAgICAgICAgICBjMnggPSBwMnggLSBkMng7XG4gICAgICAgICAgICBjMnkgPSBwMnkgLSBkMnk7XG4gICAgICAgICAgICBjMnogPSBwMnogLSBkMno7XG4gICAgICAgICAgICBueCA9IC1uMng7XG4gICAgICAgICAgICBueSA9IC1uMnk7XG4gICAgICAgICAgICBueiA9IC1uMno7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGMyeCA9IHAyeCArIGQyeDtcbiAgICAgICAgICAgIGMyeSA9IHAyeSArIGQyeTtcbiAgICAgICAgICAgIGMyeiA9IHAyeiArIGQyejtcbiAgICAgICAgICAgIG54ID0gbjJ4O1xuICAgICAgICAgICAgbnkgPSBuMnk7XG4gICAgICAgICAgICBueiA9IG4yejtcbiAgICAgICAgICB9XG4gICAgICAgICAgZG90ID0gbnggKiBuMXggKyBueSAqIG4xeSArIG56ICogbjF6O1xuICAgICAgICAgIGlmIChkb3QgPCAwKSBsZW4gPSBoMTtcbiAgICAgICAgICBlbHNlIGxlbiA9IC1oMTtcbiAgICAgICAgICBjMXggPSBwMXggKyBsZW4gKiBuMXg7XG4gICAgICAgICAgYzF5ID0gcDF5ICsgbGVuICogbjF5O1xuICAgICAgICAgIGMxeiA9IHAxeiArIGxlbiAqIG4xejtcbiAgICAgICAgICBpZiAoZG90MSA+PSAwLjk5OTk5OSkge1xuICAgICAgICAgICAgdHggPSAtbnk7XG4gICAgICAgICAgICB0eSA9IG56O1xuICAgICAgICAgICAgdHogPSBueDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdHggPSBueDtcbiAgICAgICAgICAgIHR5ID0gbnk7XG4gICAgICAgICAgICB0eiA9IG56O1xuICAgICAgICAgIH1cbiAgICAgICAgICBsZW4gPSB0eCAqIG4xeCArIHR5ICogbjF5ICsgdHogKiBuMXo7XG4gICAgICAgICAgZHggPSBsZW4gKiBuMXggLSB0eDtcbiAgICAgICAgICBkeSA9IGxlbiAqIG4xeSAtIHR5O1xuICAgICAgICAgIGR6ID0gbGVuICogbjF6IC0gdHo7XG4gICAgICAgICAgbGVuID0gX01hdGguc3FydChkeCAqIGR4ICsgZHkgKiBkeSArIGR6ICogZHopO1xuICAgICAgICAgIGlmIChsZW4gPT0gMCkgYnJlYWs7XG4gICAgICAgICAgbGVuID0gcjEgLyBsZW47XG4gICAgICAgICAgZHggKj0gbGVuO1xuICAgICAgICAgIGR5ICo9IGxlbjtcbiAgICAgICAgICBkeiAqPSBsZW47XG4gICAgICAgICAgdHggPSBjMXggKyBkeDtcbiAgICAgICAgICB0eSA9IGMxeSArIGR5O1xuICAgICAgICAgIHR6ID0gYzF6ICsgZHo7XG4gICAgICAgICAgaWYgKGRvdCA8IC0wLjk2IHx8IGRvdCA+IDAuOTYpIHtcbiAgICAgICAgICAgIHIwMCA9IG4xeCAqIG4xeCAqIDEuNSAtIDAuNTtcbiAgICAgICAgICAgIHIwMSA9IG4xeCAqIG4xeSAqIDEuNSAtIG4xeiAqIDAuODY2MDI1NDAzO1xuICAgICAgICAgICAgcjAyID0gbjF4ICogbjF6ICogMS41ICsgbjF5ICogMC44NjYwMjU0MDM7XG4gICAgICAgICAgICByMTAgPSBuMXkgKiBuMXggKiAxLjUgKyBuMXogKiAwLjg2NjAyNTQwMztcbiAgICAgICAgICAgIHIxMSA9IG4xeSAqIG4xeSAqIDEuNSAtIDAuNTtcbiAgICAgICAgICAgIHIxMiA9IG4xeSAqIG4xeiAqIDEuNSAtIG4xeCAqIDAuODY2MDI1NDAzO1xuICAgICAgICAgICAgcjIwID0gbjF6ICogbjF4ICogMS41IC0gbjF5ICogMC44NjYwMjU0MDM7XG4gICAgICAgICAgICByMjEgPSBuMXogKiBuMXkgKiAxLjUgKyBuMXggKiAwLjg2NjAyNTQwMztcbiAgICAgICAgICAgIHIyMiA9IG4xeiAqIG4xeiAqIDEuNSAtIDAuNTtcbiAgICAgICAgICAgIHB4ID0gdHg7XG4gICAgICAgICAgICBweSA9IHR5O1xuICAgICAgICAgICAgcHogPSB0ejtcbiAgICAgICAgICAgIHBkID0gbnggKiAocHggLSBjMngpICsgbnkgKiAocHkgLSBjMnkpICsgbnogKiAocHogLSBjMnopO1xuICAgICAgICAgICAgdHggPSBweCAtIHBkICogbnggLSBjMng7XG4gICAgICAgICAgICB0eSA9IHB5IC0gcGQgKiBueSAtIGMyeTtcbiAgICAgICAgICAgIHR6ID0gcHogLSBwZCAqIG56IC0gYzJ6O1xuICAgICAgICAgICAgbGVuID0gdHggKiB0eCArIHR5ICogdHkgKyB0eiAqIHR6O1xuICAgICAgICAgICAgaWYgKGxlbiA+IHIyICogcjIpIHtcbiAgICAgICAgICAgICAgbGVuID0gcjIgLyBfTWF0aC5zcXJ0KGxlbik7XG4gICAgICAgICAgICAgIHR4ICo9IGxlbjtcbiAgICAgICAgICAgICAgdHkgKj0gbGVuO1xuICAgICAgICAgICAgICB0eiAqPSBsZW47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBweCA9IGMyeCArIHR4O1xuICAgICAgICAgICAgcHkgPSBjMnkgKyB0eTtcbiAgICAgICAgICAgIHB6ID0gYzJ6ICsgdHo7XG4gICAgICAgICAgICBtYW5pZm9sZC5hZGRQb2ludChweCwgcHksIHB6LCAtbngsIC1ueSwgLW56LCBwZCwgZmFsc2UpO1xuICAgICAgICAgICAgcHggPSBkeCAqIHIwMCArIGR5ICogcjAxICsgZHogKiByMDI7XG4gICAgICAgICAgICBweSA9IGR4ICogcjEwICsgZHkgKiByMTEgKyBkeiAqIHIxMjtcbiAgICAgICAgICAgIHB6ID0gZHggKiByMjAgKyBkeSAqIHIyMSArIGR6ICogcjIyO1xuICAgICAgICAgICAgcHggPSAoZHggPSBweCkgKyBjMXg7XG4gICAgICAgICAgICBweSA9IChkeSA9IHB5KSArIGMxeTtcbiAgICAgICAgICAgIHB6ID0gKGR6ID0gcHopICsgYzF6O1xuICAgICAgICAgICAgcGQgPSBueCAqIChweCAtIGMyeCkgKyBueSAqIChweSAtIGMyeSkgKyBueiAqIChweiAtIGMyeik7XG4gICAgICAgICAgICBpZiAocGQgPD0gMCkge1xuICAgICAgICAgICAgICB0eCA9IHB4IC0gcGQgKiBueCAtIGMyeDtcbiAgICAgICAgICAgICAgdHkgPSBweSAtIHBkICogbnkgLSBjMnk7XG4gICAgICAgICAgICAgIHR6ID0gcHogLSBwZCAqIG56IC0gYzJ6O1xuICAgICAgICAgICAgICBsZW4gPSB0eCAqIHR4ICsgdHkgKiB0eSArIHR6ICogdHo7XG4gICAgICAgICAgICAgIGlmIChsZW4gPiByMiAqIHIyKSB7XG4gICAgICAgICAgICAgICAgbGVuID0gcjIgLyBfTWF0aC5zcXJ0KGxlbik7XG4gICAgICAgICAgICAgICAgdHggKj0gbGVuO1xuICAgICAgICAgICAgICAgIHR5ICo9IGxlbjtcbiAgICAgICAgICAgICAgICB0eiAqPSBsZW47XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcHggPSBjMnggKyB0eDtcbiAgICAgICAgICAgICAgcHkgPSBjMnkgKyB0eTtcbiAgICAgICAgICAgICAgcHogPSBjMnogKyB0ejtcbiAgICAgICAgICAgICAgbWFuaWZvbGQuYWRkUG9pbnQocHgsIHB5LCBweiwgLW54LCAtbnksIC1ueiwgcGQsIGZhbHNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHB4ID0gZHggKiByMDAgKyBkeSAqIHIwMSArIGR6ICogcjAyO1xuICAgICAgICAgICAgcHkgPSBkeCAqIHIxMCArIGR5ICogcjExICsgZHogKiByMTI7XG4gICAgICAgICAgICBweiA9IGR4ICogcjIwICsgZHkgKiByMjEgKyBkeiAqIHIyMjtcbiAgICAgICAgICAgIHB4ID0gKGR4ID0gcHgpICsgYzF4O1xuICAgICAgICAgICAgcHkgPSAoZHkgPSBweSkgKyBjMXk7XG4gICAgICAgICAgICBweiA9IChkeiA9IHB6KSArIGMxejtcbiAgICAgICAgICAgIHBkID0gbnggKiAocHggLSBjMngpICsgbnkgKiAocHkgLSBjMnkpICsgbnogKiAocHogLSBjMnopO1xuICAgICAgICAgICAgaWYgKHBkIDw9IDApIHtcbiAgICAgICAgICAgICAgdHggPSBweCAtIHBkICogbnggLSBjMng7XG4gICAgICAgICAgICAgIHR5ID0gcHkgLSBwZCAqIG55IC0gYzJ5O1xuICAgICAgICAgICAgICB0eiA9IHB6IC0gcGQgKiBueiAtIGMyejtcbiAgICAgICAgICAgICAgbGVuID0gdHggKiB0eCArIHR5ICogdHkgKyB0eiAqIHR6O1xuICAgICAgICAgICAgICBpZiAobGVuID4gcjIgKiByMikge1xuICAgICAgICAgICAgICAgIGxlbiA9IHIyIC8gX01hdGguc3FydChsZW4pO1xuICAgICAgICAgICAgICAgIHR4ICo9IGxlbjtcbiAgICAgICAgICAgICAgICB0eSAqPSBsZW47XG4gICAgICAgICAgICAgICAgdHogKj0gbGVuO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHB4ID0gYzJ4ICsgdHg7XG4gICAgICAgICAgICAgIHB5ID0gYzJ5ICsgdHk7XG4gICAgICAgICAgICAgIHB6ID0gYzJ6ICsgdHo7XG4gICAgICAgICAgICAgIG1hbmlmb2xkLmFkZFBvaW50KHB4LCBweSwgcHosIC1ueCwgLW55LCAtbnosIHBkLCBmYWxzZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN4ID0gdHg7XG4gICAgICAgICAgICBzeSA9IHR5O1xuICAgICAgICAgICAgc3ogPSB0ejtcbiAgICAgICAgICAgIGRlcHRoMSA9IG54ICogKHN4IC0gYzJ4KSArIG55ICogKHN5IC0gYzJ5KSArIG56ICogKHN6IC0gYzJ6KTtcbiAgICAgICAgICAgIHN4IC09IGRlcHRoMSAqIG54O1xuICAgICAgICAgICAgc3kgLT0gZGVwdGgxICogbnk7XG4gICAgICAgICAgICBzeiAtPSBkZXB0aDEgKiBuejtcbiAgICAgICAgICAgIGlmIChkb3QgPiAwKSB7XG4gICAgICAgICAgICAgIGV4ID0gdHggKyBuMXggKiBoMSAqIDI7XG4gICAgICAgICAgICAgIGV5ID0gdHkgKyBuMXkgKiBoMSAqIDI7XG4gICAgICAgICAgICAgIGV6ID0gdHogKyBuMXogKiBoMSAqIDI7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBleCA9IHR4IC0gbjF4ICogaDEgKiAyO1xuICAgICAgICAgICAgICBleSA9IHR5IC0gbjF5ICogaDEgKiAyO1xuICAgICAgICAgICAgICBleiA9IHR6IC0gbjF6ICogaDEgKiAyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGVwdGgyID0gbnggKiAoZXggLSBjMngpICsgbnkgKiAoZXkgLSBjMnkpICsgbnogKiAoZXogLSBjMnopO1xuICAgICAgICAgICAgZXggLT0gZGVwdGgyICogbng7XG4gICAgICAgICAgICBleSAtPSBkZXB0aDIgKiBueTtcbiAgICAgICAgICAgIGV6IC09IGRlcHRoMiAqIG56O1xuICAgICAgICAgICAgZHggPSBjMnggLSBzeDtcbiAgICAgICAgICAgIGR5ID0gYzJ5IC0gc3k7XG4gICAgICAgICAgICBkeiA9IGMyeiAtIHN6O1xuICAgICAgICAgICAgdHggPSBleCAtIHN4O1xuICAgICAgICAgICAgdHkgPSBleSAtIHN5O1xuICAgICAgICAgICAgdHogPSBleiAtIHN6O1xuICAgICAgICAgICAgYSA9IGR4ICogZHggKyBkeSAqIGR5ICsgZHogKiBkejtcbiAgICAgICAgICAgIGIgPSBkeCAqIHR4ICsgZHkgKiB0eSArIGR6ICogdHo7XG4gICAgICAgICAgICBlID0gdHggKiB0eCArIHR5ICogdHkgKyB0eiAqIHR6O1xuICAgICAgICAgICAgZiA9IGIgKiBiIC0gZSAqIChhIC0gcjIgKiByMik7XG4gICAgICAgICAgICBpZiAoZiA8IDApIGJyZWFrO1xuICAgICAgICAgICAgZiA9IF9NYXRoLnNxcnQoZik7XG4gICAgICAgICAgICB0MSA9IChiICsgZikgLyBlO1xuICAgICAgICAgICAgdDIgPSAoYiAtIGYpIC8gZTtcbiAgICAgICAgICAgIGlmICh0MiA8IHQxKSB7XG4gICAgICAgICAgICAgIGxlbiA9IHQxO1xuICAgICAgICAgICAgICB0MSA9IHQyO1xuICAgICAgICAgICAgICB0MiA9IGxlbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0MiA+IDEpIHQyID0gMTtcbiAgICAgICAgICAgIGlmICh0MSA8IDApIHQxID0gMDtcbiAgICAgICAgICAgIHR4ID0gc3ggKyAoZXggLSBzeCkgKiB0MTtcbiAgICAgICAgICAgIHR5ID0gc3kgKyAoZXkgLSBzeSkgKiB0MTtcbiAgICAgICAgICAgIHR6ID0gc3ogKyAoZXogLSBzeikgKiB0MTtcbiAgICAgICAgICAgIGV4ID0gc3ggKyAoZXggLSBzeCkgKiB0MjtcbiAgICAgICAgICAgIGV5ID0gc3kgKyAoZXkgLSBzeSkgKiB0MjtcbiAgICAgICAgICAgIGV6ID0gc3ogKyAoZXogLSBzeikgKiB0MjtcbiAgICAgICAgICAgIHN4ID0gdHg7XG4gICAgICAgICAgICBzeSA9IHR5O1xuICAgICAgICAgICAgc3ogPSB0ejtcbiAgICAgICAgICAgIGxlbiA9IGRlcHRoMSArIChkZXB0aDIgLSBkZXB0aDEpICogdDE7XG4gICAgICAgICAgICBkZXB0aDIgPSBkZXB0aDEgKyAoZGVwdGgyIC0gZGVwdGgxKSAqIHQyO1xuICAgICAgICAgICAgZGVwdGgxID0gbGVuO1xuICAgICAgICAgICAgaWYgKGRlcHRoMSA8IDApIHtcbiAgICAgICAgICAgICAgbWFuaWZvbGQuYWRkUG9pbnQoc3gsIHN5LCBzeiwgLW54LCAtbnksIC1ueiwgZGVwdGgxLCBmYWxzZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZGVwdGgyIDwgMCkge1xuICAgICAgICAgICAgICBtYW5pZm9sZC5hZGRQb2ludChleCwgZXksIGV6LCAtbngsIC1ueSwgLW56LCBkZXB0aDIsIGZhbHNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICB9XG5cbiAgfSk7XG5cbiAgLyoqXG4gICAqIEEgY29sbGlzaW9uIGRldGVjdG9yIHdoaWNoIGRldGVjdHMgY29sbGlzaW9ucyBiZXR3ZWVuIHNwaGVyZSBhbmQgYm94LlxuICAgKiBAYXV0aG9yIHNhaGFyYW5cbiAgICovXG4gIGZ1bmN0aW9uIFNwaGVyZUJveENvbGxpc2lvbkRldGVjdG9yKGZsaXApIHtcblxuICAgIENvbGxpc2lvbkRldGVjdG9yLmNhbGwodGhpcyk7XG4gICAgdGhpcy5mbGlwID0gZmxpcDtcblxuICB9XG4gIFNwaGVyZUJveENvbGxpc2lvbkRldGVjdG9yLnByb3RvdHlwZSA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmNyZWF0ZShDb2xsaXNpb25EZXRlY3Rvci5wcm90b3R5cGUpLCB7XG5cbiAgICBjb25zdHJ1Y3RvcjogU3BoZXJlQm94Q29sbGlzaW9uRGV0ZWN0b3IsXG5cbiAgICBkZXRlY3RDb2xsaXNpb246IGZ1bmN0aW9uIChzaGFwZTEsIHNoYXBlMiwgbWFuaWZvbGQpIHtcblxuICAgICAgdmFyIHM7XG4gICAgICB2YXIgYjtcbiAgICAgIGlmICh0aGlzLmZsaXApIHtcbiAgICAgICAgcyA9IChzaGFwZTIpO1xuICAgICAgICBiID0gKHNoYXBlMSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzID0gKHNoYXBlMSk7XG4gICAgICAgIGIgPSAoc2hhcGUyKTtcbiAgICAgIH1cblxuICAgICAgdmFyIEQgPSBiLmRpbWVudGlvbnM7XG5cbiAgICAgIHZhciBwcyA9IHMucG9zaXRpb247XG4gICAgICB2YXIgcHN4ID0gcHMueDtcbiAgICAgIHZhciBwc3kgPSBwcy55O1xuICAgICAgdmFyIHBzeiA9IHBzLno7XG4gICAgICB2YXIgcGIgPSBiLnBvc2l0aW9uO1xuICAgICAgdmFyIHBieCA9IHBiLng7XG4gICAgICB2YXIgcGJ5ID0gcGIueTtcbiAgICAgIHZhciBwYnogPSBwYi56O1xuICAgICAgdmFyIHJhZCA9IHMucmFkaXVzO1xuXG4gICAgICB2YXIgaHcgPSBiLmhhbGZXaWR0aDtcbiAgICAgIHZhciBoaCA9IGIuaGFsZkhlaWdodDtcbiAgICAgIHZhciBoZCA9IGIuaGFsZkRlcHRoO1xuXG4gICAgICB2YXIgZHggPSBwc3ggLSBwYng7XG4gICAgICB2YXIgZHkgPSBwc3kgLSBwYnk7XG4gICAgICB2YXIgZHogPSBwc3ogLSBwYno7XG4gICAgICB2YXIgc3ggPSBEWzBdICogZHggKyBEWzFdICogZHkgKyBEWzJdICogZHo7XG4gICAgICB2YXIgc3kgPSBEWzNdICogZHggKyBEWzRdICogZHkgKyBEWzVdICogZHo7XG4gICAgICB2YXIgc3ogPSBEWzZdICogZHggKyBEWzddICogZHkgKyBEWzhdICogZHo7XG4gICAgICB2YXIgY3g7XG4gICAgICB2YXIgY3k7XG4gICAgICB2YXIgY3o7XG4gICAgICB2YXIgbGVuO1xuICAgICAgdmFyIGludkxlbjtcbiAgICAgIHZhciBvdmVybGFwID0gMDtcbiAgICAgIGlmIChzeCA+IGh3KSB7XG4gICAgICAgIHN4ID0gaHc7XG4gICAgICB9IGVsc2UgaWYgKHN4IDwgLWh3KSB7XG4gICAgICAgIHN4ID0gLWh3O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb3ZlcmxhcCA9IDE7XG4gICAgICB9XG4gICAgICBpZiAoc3kgPiBoaCkge1xuICAgICAgICBzeSA9IGhoO1xuICAgICAgfSBlbHNlIGlmIChzeSA8IC1oaCkge1xuICAgICAgICBzeSA9IC1oaDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG92ZXJsYXAgfD0gMjtcbiAgICAgIH1cbiAgICAgIGlmIChzeiA+IGhkKSB7XG4gICAgICAgIHN6ID0gaGQ7XG4gICAgICB9IGVsc2UgaWYgKHN6IDwgLWhkKSB7XG4gICAgICAgIHN6ID0gLWhkO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb3ZlcmxhcCB8PSA0O1xuICAgICAgfVxuICAgICAgaWYgKG92ZXJsYXAgPT0gNykge1xuICAgICAgICAvLyBjZW50ZXIgb2Ygc3BoZXJlIGlzIGluIHRoZSBib3hcbiAgICAgICAgaWYgKHN4IDwgMCkge1xuICAgICAgICAgIGR4ID0gaHcgKyBzeDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkeCA9IGh3IC0gc3g7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHN5IDwgMCkge1xuICAgICAgICAgIGR5ID0gaGggKyBzeTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkeSA9IGhoIC0gc3k7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHN6IDwgMCkge1xuICAgICAgICAgIGR6ID0gaGQgKyBzejtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkeiA9IGhkIC0gc3o7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGR4IDwgZHkpIHtcbiAgICAgICAgICBpZiAoZHggPCBkeikge1xuICAgICAgICAgICAgbGVuID0gZHggLSBodztcbiAgICAgICAgICAgIGlmIChzeCA8IDApIHtcbiAgICAgICAgICAgICAgc3ggPSAtaHc7XG4gICAgICAgICAgICAgIGR4ID0gRFswXTtcbiAgICAgICAgICAgICAgZHkgPSBEWzFdO1xuICAgICAgICAgICAgICBkeiA9IERbMl07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBzeCA9IGh3O1xuICAgICAgICAgICAgICBkeCA9IC1EWzBdO1xuICAgICAgICAgICAgICBkeSA9IC1EWzFdO1xuICAgICAgICAgICAgICBkeiA9IC1EWzJdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZW4gPSBkeiAtIGhkO1xuICAgICAgICAgICAgaWYgKHN6IDwgMCkge1xuICAgICAgICAgICAgICBzeiA9IC1oZDtcbiAgICAgICAgICAgICAgZHggPSBEWzZdO1xuICAgICAgICAgICAgICBkeSA9IERbN107XG4gICAgICAgICAgICAgIGR6ID0gRFs4XTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHN6ID0gaGQ7XG4gICAgICAgICAgICAgIGR4ID0gLURbNl07XG4gICAgICAgICAgICAgIGR5ID0gLURbN107XG4gICAgICAgICAgICAgIGR6ID0gLURbOF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChkeSA8IGR6KSB7XG4gICAgICAgICAgICBsZW4gPSBkeSAtIGhoO1xuICAgICAgICAgICAgaWYgKHN5IDwgMCkge1xuICAgICAgICAgICAgICBzeSA9IC1oaDtcbiAgICAgICAgICAgICAgZHggPSBEWzNdO1xuICAgICAgICAgICAgICBkeSA9IERbNF07XG4gICAgICAgICAgICAgIGR6ID0gRFs1XTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHN5ID0gaGg7XG4gICAgICAgICAgICAgIGR4ID0gLURbM107XG4gICAgICAgICAgICAgIGR5ID0gLURbNF07XG4gICAgICAgICAgICAgIGR6ID0gLURbNV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxlbiA9IGR6IC0gaGQ7XG4gICAgICAgICAgICBpZiAoc3ogPCAwKSB7XG4gICAgICAgICAgICAgIHN6ID0gLWhkO1xuICAgICAgICAgICAgICBkeCA9IERbNl07XG4gICAgICAgICAgICAgIGR5ID0gRFs3XTtcbiAgICAgICAgICAgICAgZHogPSBEWzhdO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgc3ogPSBoZDtcbiAgICAgICAgICAgICAgZHggPSAtRFs2XTtcbiAgICAgICAgICAgICAgZHkgPSAtRFs3XTtcbiAgICAgICAgICAgICAgZHogPSAtRFs4XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY3ggPSBwYnggKyBzeCAqIERbMF0gKyBzeSAqIERbM10gKyBzeiAqIERbNl07XG4gICAgICAgIGN5ID0gcGJ5ICsgc3ggKiBEWzFdICsgc3kgKiBEWzRdICsgc3ogKiBEWzddO1xuICAgICAgICBjeiA9IHBieiArIHN4ICogRFsyXSArIHN5ICogRFs1XSArIHN6ICogRFs4XTtcbiAgICAgICAgbWFuaWZvbGQuYWRkUG9pbnQocHN4ICsgcmFkICogZHgsIHBzeSArIHJhZCAqIGR5LCBwc3ogKyByYWQgKiBkeiwgZHgsIGR5LCBkeiwgbGVuIC0gcmFkLCB0aGlzLmZsaXApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY3ggPSBwYnggKyBzeCAqIERbMF0gKyBzeSAqIERbM10gKyBzeiAqIERbNl07XG4gICAgICAgIGN5ID0gcGJ5ICsgc3ggKiBEWzFdICsgc3kgKiBEWzRdICsgc3ogKiBEWzddO1xuICAgICAgICBjeiA9IHBieiArIHN4ICogRFsyXSArIHN5ICogRFs1XSArIHN6ICogRFs4XTtcbiAgICAgICAgZHggPSBjeCAtIHBzLng7XG4gICAgICAgIGR5ID0gY3kgLSBwcy55O1xuICAgICAgICBkeiA9IGN6IC0gcHMuejtcbiAgICAgICAgbGVuID0gZHggKiBkeCArIGR5ICogZHkgKyBkeiAqIGR6O1xuICAgICAgICBpZiAobGVuID4gMCAmJiBsZW4gPCByYWQgKiByYWQpIHtcbiAgICAgICAgICBsZW4gPSBfTWF0aC5zcXJ0KGxlbik7XG4gICAgICAgICAgaW52TGVuID0gMSAvIGxlbjtcbiAgICAgICAgICBkeCAqPSBpbnZMZW47XG4gICAgICAgICAgZHkgKj0gaW52TGVuO1xuICAgICAgICAgIGR6ICo9IGludkxlbjtcbiAgICAgICAgICBtYW5pZm9sZC5hZGRQb2ludChwc3ggKyByYWQgKiBkeCwgcHN5ICsgcmFkICogZHksIHBzeiArIHJhZCAqIGR6LCBkeCwgZHksIGR6LCBsZW4gLSByYWQsIHRoaXMuZmxpcCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgIH1cblxuICB9KTtcblxuICBmdW5jdGlvbiBTcGhlcmVDeWxpbmRlckNvbGxpc2lvbkRldGVjdG9yKGZsaXApIHtcblxuICAgIENvbGxpc2lvbkRldGVjdG9yLmNhbGwodGhpcyk7XG4gICAgdGhpcy5mbGlwID0gZmxpcDtcblxuICB9XG4gIFNwaGVyZUN5bGluZGVyQ29sbGlzaW9uRGV0ZWN0b3IucHJvdG90eXBlID0gT2JqZWN0LmFzc2lnbihPYmplY3QuY3JlYXRlKENvbGxpc2lvbkRldGVjdG9yLnByb3RvdHlwZSksIHtcblxuICAgIGNvbnN0cnVjdG9yOiBTcGhlcmVDeWxpbmRlckNvbGxpc2lvbkRldGVjdG9yLFxuXG4gICAgZGV0ZWN0Q29sbGlzaW9uOiBmdW5jdGlvbiAoc2hhcGUxLCBzaGFwZTIsIG1hbmlmb2xkKSB7XG5cbiAgICAgIHZhciBzO1xuICAgICAgdmFyIGM7XG4gICAgICBpZiAodGhpcy5mbGlwKSB7XG4gICAgICAgIHMgPSBzaGFwZTI7XG4gICAgICAgIGMgPSBzaGFwZTE7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzID0gc2hhcGUxO1xuICAgICAgICBjID0gc2hhcGUyO1xuICAgICAgfVxuICAgICAgdmFyIHBzID0gcy5wb3NpdGlvbjtcbiAgICAgIHZhciBwc3ggPSBwcy54O1xuICAgICAgdmFyIHBzeSA9IHBzLnk7XG4gICAgICB2YXIgcHN6ID0gcHMuejtcbiAgICAgIHZhciBwYyA9IGMucG9zaXRpb247XG4gICAgICB2YXIgcGN4ID0gcGMueDtcbiAgICAgIHZhciBwY3kgPSBwYy55O1xuICAgICAgdmFyIHBjeiA9IHBjLno7XG4gICAgICB2YXIgZGlyeCA9IGMubm9ybWFsRGlyZWN0aW9uLng7XG4gICAgICB2YXIgZGlyeSA9IGMubm9ybWFsRGlyZWN0aW9uLnk7XG4gICAgICB2YXIgZGlyeiA9IGMubm9ybWFsRGlyZWN0aW9uLno7XG4gICAgICB2YXIgcmFkcyA9IHMucmFkaXVzO1xuICAgICAgdmFyIHJhZGMgPSBjLnJhZGl1cztcbiAgICAgIHZhciByYWQyID0gcmFkcyArIHJhZGM7XG4gICAgICB2YXIgaGFsZmggPSBjLmhhbGZIZWlnaHQ7XG4gICAgICB2YXIgZHggPSBwc3ggLSBwY3g7XG4gICAgICB2YXIgZHkgPSBwc3kgLSBwY3k7XG4gICAgICB2YXIgZHogPSBwc3ogLSBwY3o7XG4gICAgICB2YXIgZG90ID0gZHggKiBkaXJ4ICsgZHkgKiBkaXJ5ICsgZHogKiBkaXJ6O1xuICAgICAgaWYgKGRvdCA8IC1oYWxmaCAtIHJhZHMgfHwgZG90ID4gaGFsZmggKyByYWRzKSByZXR1cm47XG4gICAgICB2YXIgY3ggPSBwY3ggKyBkb3QgKiBkaXJ4O1xuICAgICAgdmFyIGN5ID0gcGN5ICsgZG90ICogZGlyeTtcbiAgICAgIHZhciBjeiA9IHBjeiArIGRvdCAqIGRpcno7XG4gICAgICB2YXIgZDJ4ID0gcHN4IC0gY3g7XG4gICAgICB2YXIgZDJ5ID0gcHN5IC0gY3k7XG4gICAgICB2YXIgZDJ6ID0gcHN6IC0gY3o7XG4gICAgICB2YXIgbGVuID0gZDJ4ICogZDJ4ICsgZDJ5ICogZDJ5ICsgZDJ6ICogZDJ6O1xuICAgICAgaWYgKGxlbiA+IHJhZDIgKiByYWQyKSByZXR1cm47XG4gICAgICBpZiAobGVuID4gcmFkYyAqIHJhZGMpIHtcbiAgICAgICAgbGVuID0gcmFkYyAvIF9NYXRoLnNxcnQobGVuKTtcbiAgICAgICAgZDJ4ICo9IGxlbjtcbiAgICAgICAgZDJ5ICo9IGxlbjtcbiAgICAgICAgZDJ6ICo9IGxlbjtcbiAgICAgIH1cbiAgICAgIGlmIChkb3QgPCAtaGFsZmgpIGRvdCA9IC1oYWxmaDtcbiAgICAgIGVsc2UgaWYgKGRvdCA+IGhhbGZoKSBkb3QgPSBoYWxmaDtcbiAgICAgIGN4ID0gcGN4ICsgZG90ICogZGlyeCArIGQyeDtcbiAgICAgIGN5ID0gcGN5ICsgZG90ICogZGlyeSArIGQyeTtcbiAgICAgIGN6ID0gcGN6ICsgZG90ICogZGlyeiArIGQyejtcbiAgICAgIGR4ID0gY3ggLSBwc3g7XG4gICAgICBkeSA9IGN5IC0gcHN5O1xuICAgICAgZHogPSBjeiAtIHBzejtcbiAgICAgIGxlbiA9IGR4ICogZHggKyBkeSAqIGR5ICsgZHogKiBkejtcbiAgICAgIHZhciBpbnZMZW47XG4gICAgICBpZiAobGVuID4gMCAmJiBsZW4gPCByYWRzICogcmFkcykge1xuICAgICAgICBsZW4gPSBfTWF0aC5zcXJ0KGxlbik7XG4gICAgICAgIGludkxlbiA9IDEgLyBsZW47XG4gICAgICAgIGR4ICo9IGludkxlbjtcbiAgICAgICAgZHkgKj0gaW52TGVuO1xuICAgICAgICBkeiAqPSBpbnZMZW47XG4gICAgICAgIC8vL3Jlc3VsdC5hZGRDb250YWN0SW5mbyhwc3grZHgqcmFkcyxwc3krZHkqcmFkcyxwc3orZHoqcmFkcyxkeCxkeSxkeixsZW4tcmFkcyxzLGMsMCwwLGZhbHNlKTtcbiAgICAgICAgbWFuaWZvbGQuYWRkUG9pbnQocHN4ICsgZHggKiByYWRzLCBwc3kgKyBkeSAqIHJhZHMsIHBzeiArIGR6ICogcmFkcywgZHgsIGR5LCBkeiwgbGVuIC0gcmFkcywgdGhpcy5mbGlwKTtcbiAgICAgIH1cblxuICAgIH1cblxuXG4gIH0pO1xuXG4gIC8qKlxuICAgKiBBIGNvbGxpc2lvbiBkZXRlY3RvciB3aGljaCBkZXRlY3RzIGNvbGxpc2lvbnMgYmV0d2VlbiB0d28gc3BoZXJlcy5cbiAgICogQGF1dGhvciBzYWhhcmFuXG4gICAqL1xuXG4gIGZ1bmN0aW9uIFNwaGVyZVNwaGVyZUNvbGxpc2lvbkRldGVjdG9yKCkge1xuXG4gICAgQ29sbGlzaW9uRGV0ZWN0b3IuY2FsbCh0aGlzKTtcblxuICB9XG4gIFNwaGVyZVNwaGVyZUNvbGxpc2lvbkRldGVjdG9yLnByb3RvdHlwZSA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmNyZWF0ZShDb2xsaXNpb25EZXRlY3Rvci5wcm90b3R5cGUpLCB7XG5cbiAgICBjb25zdHJ1Y3RvcjogU3BoZXJlU3BoZXJlQ29sbGlzaW9uRGV0ZWN0b3IsXG5cbiAgICBkZXRlY3RDb2xsaXNpb246IGZ1bmN0aW9uIChzaGFwZTEsIHNoYXBlMiwgbWFuaWZvbGQpIHtcblxuICAgICAgdmFyIHMxID0gc2hhcGUxO1xuICAgICAgdmFyIHMyID0gc2hhcGUyO1xuICAgICAgdmFyIHAxID0gczEucG9zaXRpb247XG4gICAgICB2YXIgcDIgPSBzMi5wb3NpdGlvbjtcbiAgICAgIHZhciBkeCA9IHAyLnggLSBwMS54O1xuICAgICAgdmFyIGR5ID0gcDIueSAtIHAxLnk7XG4gICAgICB2YXIgZHogPSBwMi56IC0gcDEuejtcbiAgICAgIHZhciBsZW4gPSBkeCAqIGR4ICsgZHkgKiBkeSArIGR6ICogZHo7XG4gICAgICB2YXIgcjEgPSBzMS5yYWRpdXM7XG4gICAgICB2YXIgcjIgPSBzMi5yYWRpdXM7XG4gICAgICB2YXIgcmFkID0gcjEgKyByMjtcbiAgICAgIGlmIChsZW4gPiAwICYmIGxlbiA8IHJhZCAqIHJhZCkge1xuICAgICAgICBsZW4gPSBfTWF0aC5zcXJ0KGxlbik7XG4gICAgICAgIHZhciBpbnZMZW4gPSAxIC8gbGVuO1xuICAgICAgICBkeCAqPSBpbnZMZW47XG4gICAgICAgIGR5ICo9IGludkxlbjtcbiAgICAgICAgZHogKj0gaW52TGVuO1xuICAgICAgICBtYW5pZm9sZC5hZGRQb2ludChwMS54ICsgZHggKiByMSwgcDEueSArIGR5ICogcjEsIHAxLnogKyBkeiAqIHIxLCBkeCwgZHksIGR6LCBsZW4gLSByYWQsIGZhbHNlKTtcbiAgICAgIH1cblxuICAgIH1cblxuICB9KTtcblxuICAvKipcbiAgICogQSBjb2xsaXNpb24gZGV0ZWN0b3Igd2hpY2ggZGV0ZWN0cyBjb2xsaXNpb25zIGJldHdlZW4gdHdvIHNwaGVyZXMuXG4gICAqIEBhdXRob3Igc2FoYXJhbiBcbiAgICogQGF1dGhvciBsby10aFxuICAgKi9cblxuICBmdW5jdGlvbiBTcGhlcmVQbGFuZUNvbGxpc2lvbkRldGVjdG9yKGZsaXApIHtcblxuICAgIENvbGxpc2lvbkRldGVjdG9yLmNhbGwodGhpcyk7XG5cbiAgICB0aGlzLmZsaXAgPSBmbGlwO1xuXG4gICAgdGhpcy5uID0gbmV3IFZlYzMoKTtcbiAgICB0aGlzLnAgPSBuZXcgVmVjMygpO1xuXG4gIH1cbiAgU3BoZXJlUGxhbmVDb2xsaXNpb25EZXRlY3Rvci5wcm90b3R5cGUgPSBPYmplY3QuYXNzaWduKE9iamVjdC5jcmVhdGUoQ29sbGlzaW9uRGV0ZWN0b3IucHJvdG90eXBlKSwge1xuXG4gICAgY29uc3RydWN0b3I6IFNwaGVyZVBsYW5lQ29sbGlzaW9uRGV0ZWN0b3IsXG5cbiAgICBkZXRlY3RDb2xsaXNpb246IGZ1bmN0aW9uIChzaGFwZTEsIHNoYXBlMiwgbWFuaWZvbGQpIHtcblxuICAgICAgdmFyIG4gPSB0aGlzLm47XG4gICAgICB2YXIgcCA9IHRoaXMucDtcblxuICAgICAgdmFyIHMgPSB0aGlzLmZsaXAgPyBzaGFwZTIgOiBzaGFwZTE7XG4gICAgICB2YXIgcG4gPSB0aGlzLmZsaXAgPyBzaGFwZTEgOiBzaGFwZTI7XG4gICAgICB2YXIgcmFkID0gcy5yYWRpdXM7XG4gICAgICB2YXIgbGVuO1xuXG4gICAgICBuLnN1YihzLnBvc2l0aW9uLCBwbi5wb3NpdGlvbik7XG4gICAgICAvL3ZhciBoID0gX01hdGguZG90VmVjdG9ycyggcG4ubm9ybWFsLCBuICk7XG5cbiAgICAgIG4ueCAqPSBwbi5ub3JtYWwueDsvLysgcmFkO1xuICAgICAgbi55ICo9IHBuLm5vcm1hbC55O1xuICAgICAgbi56ICo9IHBuLm5vcm1hbC56Oy8vKyByYWQ7XG5cblxuICAgICAgdmFyIGxlbiA9IG4ubGVuZ3RoU3EoKTtcblxuICAgICAgaWYgKGxlbiA+IDAgJiYgbGVuIDwgcmFkICogcmFkKSB7Ly8mJiBoID4gcmFkKnJhZCApe1xuXG5cbiAgICAgICAgbGVuID0gX01hdGguc3FydChsZW4pO1xuICAgICAgICAvL2xlbiA9IF9NYXRoLnNxcnQoIGggKTtcbiAgICAgICAgbi5jb3B5KHBuLm5vcm1hbCkubmVnYXRlKCk7XG4gICAgICAgIC8vbi5zY2FsZUVxdWFsKCAxL2xlbiApO1xuXG4gICAgICAgIC8vKDAsIC0xLCAwKVxuXG4gICAgICAgIC8vbi5ub3JtYWxpemUoKTtcbiAgICAgICAgcC5jb3B5KHMucG9zaXRpb24pLmFkZFNjYWxlZFZlY3RvcihuLCByYWQpO1xuICAgICAgICBtYW5pZm9sZC5hZGRQb2ludFZlYyhwLCBuLCBsZW4gLSByYWQsIHRoaXMuZmxpcCk7XG5cbiAgICAgIH1cblxuICAgIH1cblxuICB9KTtcblxuICAvKipcbiAgICogQSBjb2xsaXNpb24gZGV0ZWN0b3Igd2hpY2ggZGV0ZWN0cyBjb2xsaXNpb25zIGJldHdlZW4gdHdvIHNwaGVyZXMuXG4gICAqIEBhdXRob3Igc2FoYXJhbiBcbiAgICogQGF1dGhvciBsby10aFxuICAgKi9cblxuICBmdW5jdGlvbiBCb3hQbGFuZUNvbGxpc2lvbkRldGVjdG9yKGZsaXApIHtcblxuICAgIENvbGxpc2lvbkRldGVjdG9yLmNhbGwodGhpcyk7XG5cbiAgICB0aGlzLmZsaXAgPSBmbGlwO1xuXG4gICAgdGhpcy5uID0gbmV3IFZlYzMoKTtcbiAgICB0aGlzLnAgPSBuZXcgVmVjMygpO1xuXG4gICAgdGhpcy5kaXggPSBuZXcgVmVjMygpO1xuICAgIHRoaXMuZGl5ID0gbmV3IFZlYzMoKTtcbiAgICB0aGlzLmRpeiA9IG5ldyBWZWMzKCk7XG5cbiAgICB0aGlzLmNjID0gbmV3IFZlYzMoKTtcbiAgICB0aGlzLmNjMiA9IG5ldyBWZWMzKCk7XG5cbiAgfVxuICBCb3hQbGFuZUNvbGxpc2lvbkRldGVjdG9yLnByb3RvdHlwZSA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmNyZWF0ZShDb2xsaXNpb25EZXRlY3Rvci5wcm90b3R5cGUpLCB7XG5cbiAgICBjb25zdHJ1Y3RvcjogQm94UGxhbmVDb2xsaXNpb25EZXRlY3RvcixcblxuICAgIGRldGVjdENvbGxpc2lvbjogZnVuY3Rpb24gKHNoYXBlMSwgc2hhcGUyLCBtYW5pZm9sZCkge1xuXG4gICAgICB2YXIgbiA9IHRoaXMubjtcbiAgICAgIHZhciBwID0gdGhpcy5wO1xuICAgICAgdmFyIGNjID0gdGhpcy5jYztcblxuICAgICAgdmFyIGIgPSB0aGlzLmZsaXAgPyBzaGFwZTIgOiBzaGFwZTE7XG4gICAgICB2YXIgcG4gPSB0aGlzLmZsaXAgPyBzaGFwZTEgOiBzaGFwZTI7XG5cbiAgICAgIHZhciBEID0gYi5kaW1lbnRpb25zO1xuICAgICAgdmFyIGh3ID0gYi5oYWxmV2lkdGg7XG4gICAgICB2YXIgaGggPSBiLmhhbGZIZWlnaHQ7XG4gICAgICB2YXIgaGQgPSBiLmhhbGZEZXB0aDtcbiAgICAgIHZhciBsZW47XG4gICAgICB2YXIgb3ZlcmxhcCA9IDA7XG5cbiAgICAgIHRoaXMuZGl4LnNldChEWzBdLCBEWzFdLCBEWzJdKTtcbiAgICAgIHRoaXMuZGl5LnNldChEWzNdLCBEWzRdLCBEWzVdKTtcbiAgICAgIHRoaXMuZGl6LnNldChEWzZdLCBEWzddLCBEWzhdKTtcblxuICAgICAgbi5zdWIoYi5wb3NpdGlvbiwgcG4ucG9zaXRpb24pO1xuXG4gICAgICBuLnggKj0gcG4ubm9ybWFsLng7Ly8rIHJhZDtcbiAgICAgIG4ueSAqPSBwbi5ub3JtYWwueTtcbiAgICAgIG4ueiAqPSBwbi5ub3JtYWwuejsvLysgcmFkO1xuXG4gICAgICBjYy5zZXQoXG4gICAgICAgIF9NYXRoLmRvdFZlY3RvcnModGhpcy5kaXgsIG4pLFxuICAgICAgICBfTWF0aC5kb3RWZWN0b3JzKHRoaXMuZGl5LCBuKSxcbiAgICAgICAgX01hdGguZG90VmVjdG9ycyh0aGlzLmRpeiwgbilcbiAgICAgICk7XG5cblxuICAgICAgaWYgKGNjLnggPiBodykgY2MueCA9IGh3O1xuICAgICAgZWxzZSBpZiAoY2MueCA8IC1odykgY2MueCA9IC1odztcbiAgICAgIGVsc2Ugb3ZlcmxhcCA9IDE7XG5cbiAgICAgIGlmIChjYy55ID4gaGgpIGNjLnkgPSBoaDtcbiAgICAgIGVsc2UgaWYgKGNjLnkgPCAtaGgpIGNjLnkgPSAtaGg7XG4gICAgICBlbHNlIG92ZXJsYXAgfD0gMjtcblxuICAgICAgaWYgKGNjLnogPiBoZCkgY2MueiA9IGhkO1xuICAgICAgZWxzZSBpZiAoY2MueiA8IC1oZCkgY2MueiA9IC1oZDtcbiAgICAgIGVsc2Ugb3ZlcmxhcCB8PSA0O1xuXG5cblxuICAgICAgaWYgKG92ZXJsYXAgPT09IDcpIHtcblxuICAgICAgICAvLyBjZW50ZXIgb2Ygc3BoZXJlIGlzIGluIHRoZSBib3hcblxuICAgICAgICBuLnNldChcbiAgICAgICAgICBjYy54IDwgMCA/IGh3ICsgY2MueCA6IGh3IC0gY2MueCxcbiAgICAgICAgICBjYy55IDwgMCA/IGhoICsgY2MueSA6IGhoIC0gY2MueSxcbiAgICAgICAgICBjYy56IDwgMCA/IGhkICsgY2MueiA6IGhkIC0gY2MuelxuICAgICAgICApO1xuXG4gICAgICAgIGlmIChuLnggPCBuLnkpIHtcbiAgICAgICAgICBpZiAobi54IDwgbi56KSB7XG4gICAgICAgICAgICBsZW4gPSBuLnggLSBodztcbiAgICAgICAgICAgIGlmIChjYy54IDwgMCkge1xuICAgICAgICAgICAgICBjYy54ID0gLWh3O1xuICAgICAgICAgICAgICBuLmNvcHkodGhpcy5kaXgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgY2MueCA9IGh3O1xuICAgICAgICAgICAgICBuLnN1YkVxdWFsKHRoaXMuZGl4KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGVuID0gbi56IC0gaGQ7XG4gICAgICAgICAgICBpZiAoY2MueiA8IDApIHtcbiAgICAgICAgICAgICAgY2MueiA9IC1oZDtcbiAgICAgICAgICAgICAgbi5jb3B5KHRoaXMuZGl6KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGNjLnogPSBoZDtcbiAgICAgICAgICAgICAgbi5zdWJFcXVhbCh0aGlzLmRpeik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChuLnkgPCBuLnopIHtcbiAgICAgICAgICAgIGxlbiA9IG4ueSAtIGhoO1xuICAgICAgICAgICAgaWYgKGNjLnkgPCAwKSB7XG4gICAgICAgICAgICAgIGNjLnkgPSAtaGg7XG4gICAgICAgICAgICAgIG4uY29weSh0aGlzLmRpeSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBjYy55ID0gaGg7XG4gICAgICAgICAgICAgIG4uc3ViRXF1YWwodGhpcy5kaXkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZW4gPSBuLnogLSBoZDtcbiAgICAgICAgICAgIGlmIChjYy56IDwgMCkge1xuICAgICAgICAgICAgICBjYy56ID0gLWhkO1xuICAgICAgICAgICAgICBuLmNvcHkodGhpcy5kaXopO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgY2MueiA9IGhkO1xuICAgICAgICAgICAgICBuLnN1YkVxdWFsKHRoaXMuZGl6KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwLmNvcHkocG4ucG9zaXRpb24pLmFkZFNjYWxlZFZlY3RvcihuLCAxKTtcbiAgICAgICAgbWFuaWZvbGQuYWRkUG9pbnRWZWMocCwgbiwgbGVuLCB0aGlzLmZsaXApO1xuXG4gICAgICB9XG5cbiAgICB9XG5cbiAgfSk7XG5cbiAgLyoqXG4gICAqIFRoZSBjbGFzcyBvZiBwaHlzaWNhbCBjb21wdXRpbmcgd29ybGQuXG4gICAqIFlvdSBtdXN0IGJlIGFkZGVkIHRvIHRoZSB3b3JsZCBwaHlzaWNhbCBhbGwgY29tcHV0aW5nIG9iamVjdHNcbiAgICpcbiAgICogQGF1dGhvciBzYWhhcmFuXG4gICAqIEBhdXRob3IgbG8tdGhcbiAgICovXG5cbiAgLy8gdGltZXN0ZXAsIGJyb2FkcGhhc2UsIGl0ZXJhdGlvbnMsIHdvcmxkc2NhbGUsIHJhbmRvbSwgc3RhdFxuXG4gIGZ1bmN0aW9uIFdvcmxkKG8pIHtcblxuICAgIGlmICghKG8gaW5zdGFuY2VvZiBPYmplY3QpKSBvID0ge307XG5cbiAgICAvLyB0aGlzIHdvcmxkIHNjYWxlIGRlZmF1dCBpcyAwLjEgdG8gMTAgbWV0ZXJzIG1heCBmb3IgZHluYW1pcXVlIGJvZHlcbiAgICB0aGlzLnNjYWxlID0gby53b3JsZHNjYWxlIHx8IDE7XG4gICAgdGhpcy5pbnZTY2FsZSA9IDEgLyB0aGlzLnNjYWxlO1xuXG4gICAgLy8gVGhlIHRpbWUgYmV0d2VlbiBlYWNoIHN0ZXBcbiAgICB0aGlzLnRpbWVTdGVwID0gby50aW1lc3RlcCB8fCAwLjAxNjY2OyAvLyAxLzYwO1xuICAgIHRoaXMudGltZXJhdGUgPSB0aGlzLnRpbWVTdGVwICogMTAwMDtcbiAgICB0aGlzLnRpbWVyID0gbnVsbDtcblxuICAgIHRoaXMucHJlTG9vcCA9IG51bGw7Ly9mdW5jdGlvbigpe307XG4gICAgdGhpcy5wb3N0TG9vcCA9IG51bGw7Ly9mdW5jdGlvbigpe307XG5cbiAgICAvLyBUaGUgbnVtYmVyIG9mIGl0ZXJhdGlvbnMgZm9yIGNvbnN0cmFpbnQgc29sdmVycy5cbiAgICB0aGlzLm51bUl0ZXJhdGlvbnMgPSBvLml0ZXJhdGlvbnMgfHwgODtcblxuICAgIC8vIEl0IGlzIGEgd2lkZS1hcmVhIGNvbGxpc2lvbiBqdWRnbWVudCB0aGF0IGlzIHVzZWQgaW4gb3JkZXIgdG8gcmVkdWNlIGFzIG11Y2ggYXMgcG9zc2libGUgYSBkZXRhaWxlZCBjb2xsaXNpb24ganVkZ21lbnQuXG4gICAgc3dpdGNoIChvLmJyb2FkcGhhc2UgfHwgMikge1xuICAgICAgY2FzZSAxOiB0aGlzLmJyb2FkUGhhc2UgPSBuZXcgQnJ1dGVGb3JjZUJyb2FkUGhhc2UoKTsgYnJlYWs7XG4gICAgICBjYXNlIDI6IGRlZmF1bHQ6IHRoaXMuYnJvYWRQaGFzZSA9IG5ldyBTQVBCcm9hZFBoYXNlKCk7IGJyZWFrO1xuICAgICAgY2FzZSAzOiB0aGlzLmJyb2FkUGhhc2UgPSBuZXcgREJWVEJyb2FkUGhhc2UoKTsgYnJlYWs7XG4gICAgfVxuXG4gICAgdGhpcy5CdHlwZXMgPSBbJ05vbmUnLCAnQnJ1dGVGb3JjZScsICdTd2VlcCAmIFBydW5lJywgJ0JvdW5kaW5nIFZvbHVtZSBUcmVlJ107XG4gICAgdGhpcy5icm9hZFBoYXNlVHlwZSA9IHRoaXMuQnR5cGVzW28uYnJvYWRwaGFzZSB8fCAyXTtcblxuICAgIC8vIFRoaXMgaXMgdGhlIGRldGFpbGVkIGluZm9ybWF0aW9uIG9mIHRoZSBwZXJmb3JtYW5jZS5cbiAgICB0aGlzLnBlcmZvcm1hbmNlID0gbnVsbDtcbiAgICB0aGlzLmlzU3RhdCA9IG8uaW5mbyA9PT0gdW5kZWZpbmVkID8gZmFsc2UgOiBvLmluZm87XG4gICAgaWYgKHRoaXMuaXNTdGF0KSB0aGlzLnBlcmZvcm1hbmNlID0gbmV3IEluZm9EaXNwbGF5KHRoaXMpO1xuXG4gICAgLyoqXG4gICAgICogV2hldGhlciB0aGUgY29uc3RyYWludHMgcmFuZG9taXplciBpcyBlbmFibGVkIG9yIG5vdC5cbiAgICAgKlxuICAgICAqIEBwcm9wZXJ0eSBlbmFibGVSYW5kb21pemVyXG4gICAgICogQHR5cGUge0Jvb2xlYW59XG4gICAgICovXG4gICAgdGhpcy5lbmFibGVSYW5kb21pemVyID0gby5yYW5kb20gIT09IHVuZGVmaW5lZCA/IG8ucmFuZG9tIDogdHJ1ZTtcblxuICAgIC8vIFRoZSByaWdpZCBib2R5IGxpc3RcbiAgICB0aGlzLnJpZ2lkQm9kaWVzID0gbnVsbDtcbiAgICAvLyBudW1iZXIgb2YgcmlnaWQgYm9keVxuICAgIHRoaXMubnVtUmlnaWRCb2RpZXMgPSAwO1xuICAgIC8vIFRoZSBjb250YWN0IGxpc3RcbiAgICB0aGlzLmNvbnRhY3RzID0gbnVsbDtcbiAgICB0aGlzLnVudXNlZENvbnRhY3RzID0gbnVsbDtcbiAgICAvLyBUaGUgbnVtYmVyIG9mIGNvbnRhY3RcbiAgICB0aGlzLm51bUNvbnRhY3RzID0gMDtcbiAgICAvLyBUaGUgbnVtYmVyIG9mIGNvbnRhY3QgcG9pbnRzXG4gICAgdGhpcy5udW1Db250YWN0UG9pbnRzID0gMDtcbiAgICAvLyAgVGhlIGpvaW50IGxpc3RcbiAgICB0aGlzLmpvaW50cyA9IG51bGw7XG4gICAgLy8gVGhlIG51bWJlciBvZiBqb2ludHMuXG4gICAgdGhpcy5udW1Kb2ludHMgPSAwO1xuICAgIC8vIFRoZSBudW1iZXIgb2Ygc2ltdWxhdGlvbiBpc2xhbmRzLlxuICAgIHRoaXMubnVtSXNsYW5kcyA9IDA7XG5cblxuICAgIC8vIFRoZSBncmF2aXR5IGluIHRoZSB3b3JsZC5cbiAgICB0aGlzLmdyYXZpdHkgPSBuZXcgVmVjMygwLCAtOS44LCAwKTtcbiAgICBpZiAoby5ncmF2aXR5ICE9PSB1bmRlZmluZWQpIHRoaXMuZ3Jhdml0eS5mcm9tQXJyYXkoby5ncmF2aXR5KTtcblxuXG5cbiAgICB2YXIgbnVtU2hhcGVUeXBlcyA9IDU7Ly80Oy8vMztcbiAgICB0aGlzLmRldGVjdG9ycyA9IFtdO1xuICAgIHRoaXMuZGV0ZWN0b3JzLmxlbmd0aCA9IG51bVNoYXBlVHlwZXM7XG4gICAgdmFyIGkgPSBudW1TaGFwZVR5cGVzO1xuICAgIHdoaWxlIChpLS0pIHtcbiAgICAgIHRoaXMuZGV0ZWN0b3JzW2ldID0gW107XG4gICAgICB0aGlzLmRldGVjdG9yc1tpXS5sZW5ndGggPSBudW1TaGFwZVR5cGVzO1xuICAgIH1cblxuICAgIHRoaXMuZGV0ZWN0b3JzW1NIQVBFX1NQSEVSRV1bU0hBUEVfU1BIRVJFXSA9IG5ldyBTcGhlcmVTcGhlcmVDb2xsaXNpb25EZXRlY3RvcigpO1xuICAgIHRoaXMuZGV0ZWN0b3JzW1NIQVBFX1NQSEVSRV1bU0hBUEVfQk9YXSA9IG5ldyBTcGhlcmVCb3hDb2xsaXNpb25EZXRlY3RvcihmYWxzZSk7XG4gICAgdGhpcy5kZXRlY3RvcnNbU0hBUEVfQk9YXVtTSEFQRV9TUEhFUkVdID0gbmV3IFNwaGVyZUJveENvbGxpc2lvbkRldGVjdG9yKHRydWUpO1xuICAgIHRoaXMuZGV0ZWN0b3JzW1NIQVBFX0JPWF1bU0hBUEVfQk9YXSA9IG5ldyBCb3hCb3hDb2xsaXNpb25EZXRlY3RvcigpO1xuXG4gICAgLy8gQ1lMSU5ERVIgYWRkXG4gICAgdGhpcy5kZXRlY3RvcnNbU0hBUEVfQ1lMSU5ERVJdW1NIQVBFX0NZTElOREVSXSA9IG5ldyBDeWxpbmRlckN5bGluZGVyQ29sbGlzaW9uRGV0ZWN0b3IoKTtcblxuICAgIHRoaXMuZGV0ZWN0b3JzW1NIQVBFX0NZTElOREVSXVtTSEFQRV9CT1hdID0gbmV3IEJveEN5bGluZGVyQ29sbGlzaW9uRGV0ZWN0b3IodHJ1ZSk7XG4gICAgdGhpcy5kZXRlY3RvcnNbU0hBUEVfQk9YXVtTSEFQRV9DWUxJTkRFUl0gPSBuZXcgQm94Q3lsaW5kZXJDb2xsaXNpb25EZXRlY3RvcihmYWxzZSk7XG5cbiAgICB0aGlzLmRldGVjdG9yc1tTSEFQRV9DWUxJTkRFUl1bU0hBUEVfU1BIRVJFXSA9IG5ldyBTcGhlcmVDeWxpbmRlckNvbGxpc2lvbkRldGVjdG9yKHRydWUpO1xuICAgIHRoaXMuZGV0ZWN0b3JzW1NIQVBFX1NQSEVSRV1bU0hBUEVfQ1lMSU5ERVJdID0gbmV3IFNwaGVyZUN5bGluZGVyQ29sbGlzaW9uRGV0ZWN0b3IoZmFsc2UpO1xuXG4gICAgLy8gUExBTkUgYWRkXG5cbiAgICB0aGlzLmRldGVjdG9yc1tTSEFQRV9QTEFORV1bU0hBUEVfU1BIRVJFXSA9IG5ldyBTcGhlcmVQbGFuZUNvbGxpc2lvbkRldGVjdG9yKHRydWUpO1xuICAgIHRoaXMuZGV0ZWN0b3JzW1NIQVBFX1NQSEVSRV1bU0hBUEVfUExBTkVdID0gbmV3IFNwaGVyZVBsYW5lQ29sbGlzaW9uRGV0ZWN0b3IoZmFsc2UpO1xuXG4gICAgdGhpcy5kZXRlY3RvcnNbU0hBUEVfUExBTkVdW1NIQVBFX0JPWF0gPSBuZXcgQm94UGxhbmVDb2xsaXNpb25EZXRlY3Rvcih0cnVlKTtcbiAgICB0aGlzLmRldGVjdG9yc1tTSEFQRV9CT1hdW1NIQVBFX1BMQU5FXSA9IG5ldyBCb3hQbGFuZUNvbGxpc2lvbkRldGVjdG9yKGZhbHNlKTtcblxuICAgIC8vIFRFVFJBIGFkZFxuICAgIC8vdGhpcy5kZXRlY3RvcnNbU0hBUEVfVEVUUkFdW1NIQVBFX1RFVFJBXSA9IG5ldyBUZXRyYVRldHJhQ29sbGlzaW9uRGV0ZWN0b3IoKTtcblxuXG4gICAgdGhpcy5yYW5kWCA9IDY1NTM1O1xuICAgIHRoaXMucmFuZEEgPSA5ODc2NTtcbiAgICB0aGlzLnJhbmRCID0gMTIzNDU2Nzg5O1xuXG4gICAgdGhpcy5pc2xhbmRSaWdpZEJvZGllcyA9IFtdO1xuICAgIHRoaXMuaXNsYW5kU3RhY2sgPSBbXTtcbiAgICB0aGlzLmlzbGFuZENvbnN0cmFpbnRzID0gW107XG5cbiAgfVxuXG4gIE9iamVjdC5hc3NpZ24oV29ybGQucHJvdG90eXBlLCB7XG5cbiAgICBXb3JsZDogdHJ1ZSxcblxuICAgIHBsYXk6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgaWYgKHRoaXMudGltZXIgIT09IG51bGwpIHJldHVybjtcblxuICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgIHRoaXMudGltZXIgPSBzZXRJbnRlcnZhbChmdW5jdGlvbiAoKSB7IF90aGlzLnN0ZXAoKTsgfSwgdGhpcy50aW1lcmF0ZSk7XG4gICAgICAvL3RoaXMudGltZXIgPSBzZXRJbnRlcnZhbCggdGhpcy5sb29wLmJpbmQodGhpcykgLCB0aGlzLnRpbWVyYXRlICk7XG5cbiAgICB9LFxuXG4gICAgc3RvcDogZnVuY3Rpb24gKCkge1xuXG4gICAgICBpZiAodGhpcy50aW1lciA9PT0gbnVsbCkgcmV0dXJuO1xuXG4gICAgICBjbGVhckludGVydmFsKHRoaXMudGltZXIpO1xuICAgICAgdGhpcy50aW1lciA9IG51bGw7XG5cbiAgICB9LFxuXG4gICAgc2V0R3Jhdml0eTogZnVuY3Rpb24gKGFyKSB7XG5cbiAgICAgIHRoaXMuZ3Jhdml0eS5mcm9tQXJyYXkoYXIpO1xuXG4gICAgfSxcblxuICAgIGdldEluZm86IGZ1bmN0aW9uICgpIHtcblxuICAgICAgcmV0dXJuIHRoaXMuaXNTdGF0ID8gdGhpcy5wZXJmb3JtYW5jZS5zaG93KCkgOiAnJztcblxuICAgIH0sXG5cbiAgICAvLyBSZXNldCB0aGUgd29ybGQgYW5kIHJlbW92ZSBhbGwgcmlnaWQgYm9kaWVzLCBzaGFwZXMsIGpvaW50cyBhbmQgYW55IG9iamVjdCBmcm9tIHRoZSB3b3JsZC5cbiAgICBjbGVhcjogZnVuY3Rpb24gKCkge1xuXG4gICAgICB0aGlzLnN0b3AoKTtcbiAgICAgIHRoaXMucHJlTG9vcCA9IG51bGw7XG4gICAgICB0aGlzLnBvc3RMb29wID0gbnVsbDtcblxuICAgICAgdGhpcy5yYW5kWCA9IDY1NTM1O1xuXG4gICAgICB3aGlsZSAodGhpcy5qb2ludHMgIT09IG51bGwpIHtcbiAgICAgICAgdGhpcy5yZW1vdmVKb2ludCh0aGlzLmpvaW50cyk7XG4gICAgICB9XG4gICAgICB3aGlsZSAodGhpcy5jb250YWN0cyAhPT0gbnVsbCkge1xuICAgICAgICB0aGlzLnJlbW92ZUNvbnRhY3QodGhpcy5jb250YWN0cyk7XG4gICAgICB9XG4gICAgICB3aGlsZSAodGhpcy5yaWdpZEJvZGllcyAhPT0gbnVsbCkge1xuICAgICAgICB0aGlzLnJlbW92ZVJpZ2lkQm9keSh0aGlzLnJpZ2lkQm9kaWVzKTtcbiAgICAgIH1cblxuICAgIH0sXG4gICAgLyoqXG4gICAgKiBJJ2xsIGFkZCBhIHJpZ2lkIGJvZHkgdG8gdGhlIHdvcmxkLlxuICAgICogUmlnaWQgYm9keSB0aGF0IGhhcyBiZWVuIGFkZGVkIHdpbGwgYmUgdGhlIG9wZXJhbmRzIG9mIGVhY2ggc3RlcC5cbiAgICAqIEBwYXJhbSAgcmlnaWRCb2R5ICBSaWdpZCBib2R5IHRoYXQgeW91IHdhbnQgdG8gYWRkXG4gICAgKi9cbiAgICBhZGRSaWdpZEJvZHk6IGZ1bmN0aW9uIChyaWdpZEJvZHkpIHtcblxuICAgICAgaWYgKHJpZ2lkQm9keS5wYXJlbnQpIHtcbiAgICAgICAgcHJpbnRFcnJvcihcIldvcmxkXCIsIFwiSXQgaXMgbm90IHBvc3NpYmxlIHRvIGJlIGFkZGVkIHRvIG1vcmUgdGhhbiBvbmUgd29ybGQgb25lIG9mIHRoZSByaWdpZCBib2R5XCIpO1xuICAgICAgfVxuXG4gICAgICByaWdpZEJvZHkuc2V0UGFyZW50KHRoaXMpO1xuICAgICAgLy9yaWdpZEJvZHkuYXdha2UoKTtcblxuICAgICAgZm9yICh2YXIgc2hhcGUgPSByaWdpZEJvZHkuc2hhcGVzOyBzaGFwZSAhPT0gbnVsbDsgc2hhcGUgPSBzaGFwZS5uZXh0KSB7XG4gICAgICAgIHRoaXMuYWRkU2hhcGUoc2hhcGUpO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMucmlnaWRCb2RpZXMgIT09IG51bGwpICh0aGlzLnJpZ2lkQm9kaWVzLnByZXYgPSByaWdpZEJvZHkpLm5leHQgPSB0aGlzLnJpZ2lkQm9kaWVzO1xuICAgICAgdGhpcy5yaWdpZEJvZGllcyA9IHJpZ2lkQm9keTtcbiAgICAgIHRoaXMubnVtUmlnaWRCb2RpZXMrKztcblxuICAgIH0sXG4gICAgLyoqXG4gICAgKiBJIHdpbGwgcmVtb3ZlIHRoZSByaWdpZCBib2R5IGZyb20gdGhlIHdvcmxkLlxuICAgICogUmlnaWQgYm9keSB0aGF0IGhhcyBiZWVuIGRlbGV0ZWQgaXMgZXhjbHVkZWQgZnJvbSB0aGUgY2FsY3VsYXRpb24gb24gYSBzdGVwLWJ5LXN0ZXAgYmFzaXMuXG4gICAgKiBAcGFyYW0gIHJpZ2lkQm9keSAgUmlnaWQgYm9keSB0byBiZSByZW1vdmVkXG4gICAgKi9cbiAgICByZW1vdmVSaWdpZEJvZHk6IGZ1bmN0aW9uIChyaWdpZEJvZHkpIHtcblxuICAgICAgdmFyIHJlbW92ZSA9IHJpZ2lkQm9keTtcbiAgICAgIGlmIChyZW1vdmUucGFyZW50ICE9PSB0aGlzKSByZXR1cm47XG4gICAgICByZW1vdmUuYXdha2UoKTtcbiAgICAgIHZhciBqcyA9IHJlbW92ZS5qb2ludExpbms7XG4gICAgICB3aGlsZSAoanMgIT0gbnVsbCkge1xuICAgICAgICB2YXIgam9pbnQgPSBqcy5qb2ludDtcbiAgICAgICAganMgPSBqcy5uZXh0O1xuICAgICAgICB0aGlzLnJlbW92ZUpvaW50KGpvaW50KTtcbiAgICAgIH1cbiAgICAgIGZvciAodmFyIHNoYXBlID0gcmlnaWRCb2R5LnNoYXBlczsgc2hhcGUgIT09IG51bGw7IHNoYXBlID0gc2hhcGUubmV4dCkge1xuICAgICAgICB0aGlzLnJlbW92ZVNoYXBlKHNoYXBlKTtcbiAgICAgIH1cbiAgICAgIHZhciBwcmV2ID0gcmVtb3ZlLnByZXY7XG4gICAgICB2YXIgbmV4dCA9IHJlbW92ZS5uZXh0O1xuICAgICAgaWYgKHByZXYgIT09IG51bGwpIHByZXYubmV4dCA9IG5leHQ7XG4gICAgICBpZiAobmV4dCAhPT0gbnVsbCkgbmV4dC5wcmV2ID0gcHJldjtcbiAgICAgIGlmICh0aGlzLnJpZ2lkQm9kaWVzID09IHJlbW92ZSkgdGhpcy5yaWdpZEJvZGllcyA9IG5leHQ7XG4gICAgICByZW1vdmUucHJldiA9IG51bGw7XG4gICAgICByZW1vdmUubmV4dCA9IG51bGw7XG4gICAgICByZW1vdmUucGFyZW50ID0gbnVsbDtcbiAgICAgIHRoaXMubnVtUmlnaWRCb2RpZXMtLTtcblxuICAgIH0sXG5cbiAgICBnZXRCeU5hbWU6IGZ1bmN0aW9uIChuYW1lKSB7XG5cbiAgICAgIHZhciBib2R5ID0gdGhpcy5yaWdpZEJvZGllcztcbiAgICAgIHdoaWxlIChib2R5ICE9PSBudWxsKSB7XG4gICAgICAgIGlmIChib2R5Lm5hbWUgPT09IG5hbWUpIHJldHVybiBib2R5O1xuICAgICAgICBib2R5ID0gYm9keS5uZXh0O1xuICAgICAgfVxuXG4gICAgICB2YXIgam9pbnQgPSB0aGlzLmpvaW50cztcbiAgICAgIHdoaWxlIChqb2ludCAhPT0gbnVsbCkge1xuICAgICAgICBpZiAoam9pbnQubmFtZSA9PT0gbmFtZSkgcmV0dXJuIGpvaW50O1xuICAgICAgICBqb2ludCA9IGpvaW50Lm5leHQ7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBudWxsO1xuXG4gICAgfSxcblxuICAgIC8qKlxuICAgICogSSdsbCBhZGQgYSBzaGFwZSB0byB0aGUgd29ybGQuLlxuICAgICogQWRkIHRvIHRoZSByaWdpZCB3b3JsZCwgYW5kIGlmIHlvdSBhZGQgYSBzaGFwZSB0byBhIHJpZ2lkIGJvZHkgdGhhdCBoYXMgYmVlbiBhZGRlZCB0byB0aGUgd29ybGQsXG4gICAgKiBTaGFwZSB3aWxsIGJlIGFkZGVkIHRvIHRoZSB3b3JsZCBhdXRvbWF0aWNhbGx5LCBwbGVhc2UgZG8gbm90IGNhbGwgZnJvbSBvdXRzaWRlIHRoaXMgbWV0aG9kLlxuICAgICogQHBhcmFtICBzaGFwZSAgU2hhcGUgeW91IHdhbnQgdG8gYWRkXG4gICAgKi9cbiAgICBhZGRTaGFwZTogZnVuY3Rpb24gKHNoYXBlKSB7XG5cbiAgICAgIGlmICghc2hhcGUucGFyZW50IHx8ICFzaGFwZS5wYXJlbnQucGFyZW50KSB7XG4gICAgICAgIHByaW50RXJyb3IoXCJXb3JsZFwiLCBcIkl0IGlzIG5vdCBwb3NzaWJsZSB0byBiZSBhZGRlZCBhbG9uZSB0byBzaGFwZSB3b3JsZFwiKTtcbiAgICAgIH1cblxuICAgICAgc2hhcGUucHJveHkgPSB0aGlzLmJyb2FkUGhhc2UuY3JlYXRlUHJveHkoc2hhcGUpO1xuICAgICAgc2hhcGUudXBkYXRlUHJveHkoKTtcbiAgICAgIHRoaXMuYnJvYWRQaGFzZS5hZGRQcm94eShzaGFwZS5wcm94eSk7XG5cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgKiBJIHdpbGwgcmVtb3ZlIHRoZSBzaGFwZSBmcm9tIHRoZSB3b3JsZC5cbiAgICAqIEFkZCB0byB0aGUgcmlnaWQgd29ybGQsIGFuZCBpZiB5b3UgYWRkIGEgc2hhcGUgdG8gYSByaWdpZCBib2R5IHRoYXQgaGFzIGJlZW4gYWRkZWQgdG8gdGhlIHdvcmxkLFxuICAgICogU2hhcGUgd2lsbCBiZSBhZGRlZCB0byB0aGUgd29ybGQgYXV0b21hdGljYWxseSwgcGxlYXNlIGRvIG5vdCBjYWxsIGZyb20gb3V0c2lkZSB0aGlzIG1ldGhvZC5cbiAgICAqIEBwYXJhbSAgc2hhcGUgIFNoYXBlIHlvdSB3YW50IHRvIGRlbGV0ZVxuICAgICovXG4gICAgcmVtb3ZlU2hhcGU6IGZ1bmN0aW9uIChzaGFwZSkge1xuXG4gICAgICB0aGlzLmJyb2FkUGhhc2UucmVtb3ZlUHJveHkoc2hhcGUucHJveHkpO1xuICAgICAgc2hhcGUucHJveHkgPSBudWxsO1xuXG4gICAgfSxcblxuICAgIC8qKlxuICAgICogSSdsbCBhZGQgYSBqb2ludCB0byB0aGUgd29ybGQuXG4gICAgKiBKb2ludCB0aGF0IGhhcyBiZWVuIGFkZGVkIHdpbGwgYmUgdGhlIG9wZXJhbmRzIG9mIGVhY2ggc3RlcC5cbiAgICAqIEBwYXJhbSAgc2hhcGUgSm9pbnQgdG8gYmUgYWRkZWRcbiAgICAqL1xuICAgIGFkZEpvaW50OiBmdW5jdGlvbiAoam9pbnQpIHtcblxuICAgICAgaWYgKGpvaW50LnBhcmVudCkge1xuICAgICAgICBwcmludEVycm9yKFwiV29ybGRcIiwgXCJJdCBpcyBub3QgcG9zc2libGUgdG8gYmUgYWRkZWQgdG8gbW9yZSB0aGFuIG9uZSB3b3JsZCBvbmUgb2YgdGhlIGpvaW50XCIpO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuam9pbnRzICE9IG51bGwpICh0aGlzLmpvaW50cy5wcmV2ID0gam9pbnQpLm5leHQgPSB0aGlzLmpvaW50cztcbiAgICAgIHRoaXMuam9pbnRzID0gam9pbnQ7XG4gICAgICBqb2ludC5zZXRQYXJlbnQodGhpcyk7XG4gICAgICB0aGlzLm51bUpvaW50cysrO1xuICAgICAgam9pbnQuYXdha2UoKTtcbiAgICAgIGpvaW50LmF0dGFjaCgpO1xuXG4gICAgfSxcblxuICAgIC8qKlxuICAgICogSSB3aWxsIHJlbW92ZSB0aGUgam9pbnQgZnJvbSB0aGUgd29ybGQuXG4gICAgKiBKb2ludCB0aGF0IGhhcyBiZWVuIGFkZGVkIHdpbGwgYmUgdGhlIG9wZXJhbmRzIG9mIGVhY2ggc3RlcC5cbiAgICAqIEBwYXJhbSAgc2hhcGUgSm9pbnQgdG8gYmUgZGVsZXRlZFxuICAgICovXG4gICAgcmVtb3ZlSm9pbnQ6IGZ1bmN0aW9uIChqb2ludCkge1xuXG4gICAgICB2YXIgcmVtb3ZlID0gam9pbnQ7XG4gICAgICB2YXIgcHJldiA9IHJlbW92ZS5wcmV2O1xuICAgICAgdmFyIG5leHQgPSByZW1vdmUubmV4dDtcbiAgICAgIGlmIChwcmV2ICE9PSBudWxsKSBwcmV2Lm5leHQgPSBuZXh0O1xuICAgICAgaWYgKG5leHQgIT09IG51bGwpIG5leHQucHJldiA9IHByZXY7XG4gICAgICBpZiAodGhpcy5qb2ludHMgPT0gcmVtb3ZlKSB0aGlzLmpvaW50cyA9IG5leHQ7XG4gICAgICByZW1vdmUucHJldiA9IG51bGw7XG4gICAgICByZW1vdmUubmV4dCA9IG51bGw7XG4gICAgICB0aGlzLm51bUpvaW50cy0tO1xuICAgICAgcmVtb3ZlLmF3YWtlKCk7XG4gICAgICByZW1vdmUuZGV0YWNoKCk7XG4gICAgICByZW1vdmUucGFyZW50ID0gbnVsbDtcblxuICAgIH0sXG5cbiAgICBhZGRDb250YWN0OiBmdW5jdGlvbiAoczEsIHMyKSB7XG5cbiAgICAgIHZhciBuZXdDb250YWN0O1xuICAgICAgaWYgKHRoaXMudW51c2VkQ29udGFjdHMgIT09IG51bGwpIHtcbiAgICAgICAgbmV3Q29udGFjdCA9IHRoaXMudW51c2VkQ29udGFjdHM7XG4gICAgICAgIHRoaXMudW51c2VkQ29udGFjdHMgPSB0aGlzLnVudXNlZENvbnRhY3RzLm5leHQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuZXdDb250YWN0ID0gbmV3IENvbnRhY3QoKTtcbiAgICAgIH1cbiAgICAgIG5ld0NvbnRhY3QuYXR0YWNoKHMxLCBzMik7XG4gICAgICBuZXdDb250YWN0LmRldGVjdG9yID0gdGhpcy5kZXRlY3RvcnNbczEudHlwZV1bczIudHlwZV07XG4gICAgICBpZiAodGhpcy5jb250YWN0cykgKHRoaXMuY29udGFjdHMucHJldiA9IG5ld0NvbnRhY3QpLm5leHQgPSB0aGlzLmNvbnRhY3RzO1xuICAgICAgdGhpcy5jb250YWN0cyA9IG5ld0NvbnRhY3Q7XG4gICAgICB0aGlzLm51bUNvbnRhY3RzKys7XG5cbiAgICB9LFxuXG4gICAgcmVtb3ZlQ29udGFjdDogZnVuY3Rpb24gKGNvbnRhY3QpIHtcblxuICAgICAgdmFyIHByZXYgPSBjb250YWN0LnByZXY7XG4gICAgICB2YXIgbmV4dCA9IGNvbnRhY3QubmV4dDtcbiAgICAgIGlmIChuZXh0KSBuZXh0LnByZXYgPSBwcmV2O1xuICAgICAgaWYgKHByZXYpIHByZXYubmV4dCA9IG5leHQ7XG4gICAgICBpZiAodGhpcy5jb250YWN0cyA9PSBjb250YWN0KSB0aGlzLmNvbnRhY3RzID0gbmV4dDtcbiAgICAgIGNvbnRhY3QucHJldiA9IG51bGw7XG4gICAgICBjb250YWN0Lm5leHQgPSBudWxsO1xuICAgICAgY29udGFjdC5kZXRhY2goKTtcbiAgICAgIGNvbnRhY3QubmV4dCA9IHRoaXMudW51c2VkQ29udGFjdHM7XG4gICAgICB0aGlzLnVudXNlZENvbnRhY3RzID0gY29udGFjdDtcbiAgICAgIHRoaXMubnVtQ29udGFjdHMtLTtcblxuICAgIH0sXG5cbiAgICBnZXRDb250YWN0OiBmdW5jdGlvbiAoYjEsIGIyKSB7XG5cbiAgICAgIGIxID0gYjEuY29uc3RydWN0b3IgPT09IFJpZ2lkQm9keSA/IGIxLm5hbWUgOiBiMTtcbiAgICAgIGIyID0gYjIuY29uc3RydWN0b3IgPT09IFJpZ2lkQm9keSA/IGIyLm5hbWUgOiBiMjtcblxuICAgICAgdmFyIG4xLCBuMjtcbiAgICAgIHZhciBjb250YWN0ID0gdGhpcy5jb250YWN0cztcbiAgICAgIHdoaWxlIChjb250YWN0ICE9PSBudWxsKSB7XG4gICAgICAgIG4xID0gY29udGFjdC5ib2R5MS5uYW1lO1xuICAgICAgICBuMiA9IGNvbnRhY3QuYm9keTIubmFtZTtcbiAgICAgICAgaWYgKChuMSA9PT0gYjEgJiYgbjIgPT09IGIyKSB8fCAobjIgPT09IGIxICYmIG4xID09PSBiMikpIHsgaWYgKGNvbnRhY3QudG91Y2hpbmcpIHJldHVybiBjb250YWN0OyBlbHNlIHJldHVybiBudWxsOyB9XG4gICAgICAgIGVsc2UgY29udGFjdCA9IGNvbnRhY3QubmV4dDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsO1xuXG4gICAgfSxcblxuICAgIGNoZWNrQ29udGFjdDogZnVuY3Rpb24gKG5hbWUxLCBuYW1lMikge1xuXG4gICAgICB2YXIgbjEsIG4yO1xuICAgICAgdmFyIGNvbnRhY3QgPSB0aGlzLmNvbnRhY3RzO1xuICAgICAgd2hpbGUgKGNvbnRhY3QgIT09IG51bGwpIHtcbiAgICAgICAgbjEgPSBjb250YWN0LmJvZHkxLm5hbWUgfHwgJyAnO1xuICAgICAgICBuMiA9IGNvbnRhY3QuYm9keTIubmFtZSB8fCAnICc7XG4gICAgICAgIGlmICgobjEgPT0gbmFtZTEgJiYgbjIgPT0gbmFtZTIpIHx8IChuMiA9PSBuYW1lMSAmJiBuMSA9PSBuYW1lMikpIHsgaWYgKGNvbnRhY3QudG91Y2hpbmcpIHJldHVybiB0cnVlOyBlbHNlIHJldHVybiBmYWxzZTsgfVxuICAgICAgICBlbHNlIGNvbnRhY3QgPSBjb250YWN0Lm5leHQ7XG4gICAgICB9XG4gICAgICAvL3JldHVybiBmYWxzZTtcblxuICAgIH0sXG5cbiAgICBjYWxsU2xlZXA6IGZ1bmN0aW9uIChib2R5KSB7XG5cbiAgICAgIGlmICghYm9keS5hbGxvd1NsZWVwKSByZXR1cm4gZmFsc2U7XG4gICAgICBpZiAoYm9keS5saW5lYXJWZWxvY2l0eS5sZW5ndGhTcSgpID4gMC4wNCkgcmV0dXJuIGZhbHNlO1xuICAgICAgaWYgKGJvZHkuYW5ndWxhclZlbG9jaXR5Lmxlbmd0aFNxKCkgPiAwLjI1KSByZXR1cm4gZmFsc2U7XG4gICAgICByZXR1cm4gdHJ1ZTtcblxuICAgIH0sXG5cbiAgICAvKipcbiAgICAqIEkgd2lsbCBwcm9jZWVkIG9ubHkgdGltZSBzdGVwIHNlY29uZHMgdGltZSBvZiBXb3JsZC5cbiAgICAqL1xuICAgIHN0ZXA6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgdmFyIHN0YXQgPSB0aGlzLmlzU3RhdDtcblxuICAgICAgaWYgKHN0YXQpIHRoaXMucGVyZm9ybWFuY2Uuc2V0VGltZSgwKTtcblxuICAgICAgdmFyIGJvZHkgPSB0aGlzLnJpZ2lkQm9kaWVzO1xuXG4gICAgICB3aGlsZSAoYm9keSAhPT0gbnVsbCkge1xuXG4gICAgICAgIGJvZHkuYWRkZWRUb0lzbGFuZCA9IGZhbHNlO1xuXG4gICAgICAgIGlmIChib2R5LnNsZWVwaW5nKSBib2R5LnRlc3RXYWtlVXAoKTtcblxuICAgICAgICBib2R5ID0gYm9keS5uZXh0O1xuXG4gICAgICB9XG5cblxuXG4gICAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgLy8gICBVUERBVEUgQlJPQURQSEFTRSBDT05UQUNUXG4gICAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICAgICBpZiAoc3RhdCkgdGhpcy5wZXJmb3JtYW5jZS5zZXRUaW1lKDEpO1xuXG4gICAgICB0aGlzLmJyb2FkUGhhc2UuZGV0ZWN0UGFpcnMoKTtcblxuICAgICAgdmFyIHBhaXJzID0gdGhpcy5icm9hZFBoYXNlLnBhaXJzO1xuXG4gICAgICB2YXIgaSA9IHRoaXMuYnJvYWRQaGFzZS5udW1QYWlycztcbiAgICAgIC8vZG97XG4gICAgICB3aGlsZSAoaS0tKSB7XG4gICAgICAgIC8vZm9yKHZhciBpPTAsIGw9bnVtUGFpcnM7IGk8bDsgaSsrKXtcbiAgICAgICAgdmFyIHBhaXIgPSBwYWlyc1tpXTtcbiAgICAgICAgdmFyIHMxO1xuICAgICAgICB2YXIgczI7XG4gICAgICAgIGlmIChwYWlyLnNoYXBlMS5pZCA8IHBhaXIuc2hhcGUyLmlkKSB7XG4gICAgICAgICAgczEgPSBwYWlyLnNoYXBlMTtcbiAgICAgICAgICBzMiA9IHBhaXIuc2hhcGUyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHMxID0gcGFpci5zaGFwZTI7XG4gICAgICAgICAgczIgPSBwYWlyLnNoYXBlMTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBsaW5rO1xuICAgICAgICBpZiAoczEubnVtQ29udGFjdHMgPCBzMi5udW1Db250YWN0cykgbGluayA9IHMxLmNvbnRhY3RMaW5rO1xuICAgICAgICBlbHNlIGxpbmsgPSBzMi5jb250YWN0TGluaztcblxuICAgICAgICB2YXIgZXhpc3RzID0gZmFsc2U7XG4gICAgICAgIHdoaWxlIChsaW5rKSB7XG4gICAgICAgICAgdmFyIGNvbnRhY3QgPSBsaW5rLmNvbnRhY3Q7XG4gICAgICAgICAgaWYgKGNvbnRhY3Quc2hhcGUxID09IHMxICYmIGNvbnRhY3Quc2hhcGUyID09IHMyKSB7XG4gICAgICAgICAgICBjb250YWN0LnBlcnNpc3RpbmcgPSB0cnVlO1xuICAgICAgICAgICAgZXhpc3RzID0gdHJ1ZTsvLyBjb250YWN0IGFscmVhZHkgZXhpc3RzXG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgICAgbGluayA9IGxpbmsubmV4dDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWV4aXN0cykge1xuICAgICAgICAgIHRoaXMuYWRkQ29udGFjdChzMSwgczIpO1xuICAgICAgICB9XG4gICAgICB9Ly8gd2hpbGUoaS0tID4wKTtcblxuICAgICAgaWYgKHN0YXQpIHRoaXMucGVyZm9ybWFuY2UuY2FsY0Jyb2FkUGhhc2UoKTtcblxuICAgICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgIC8vICAgVVBEQVRFIE5BUlJPV1BIQVNFIENPTlRBQ1RcbiAgICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgICAgIC8vIHVwZGF0ZSAmIG5hcnJvdyBwaGFzZVxuICAgICAgdGhpcy5udW1Db250YWN0UG9pbnRzID0gMDtcbiAgICAgIGNvbnRhY3QgPSB0aGlzLmNvbnRhY3RzO1xuICAgICAgd2hpbGUgKGNvbnRhY3QgIT09IG51bGwpIHtcbiAgICAgICAgaWYgKCFjb250YWN0LnBlcnNpc3RpbmcpIHtcbiAgICAgICAgICBpZiAoY29udGFjdC5zaGFwZTEuYWFiYi5pbnRlcnNlY3RUZXN0KGNvbnRhY3Quc2hhcGUyLmFhYmIpKSB7XG4gICAgICAgICAgICAvKnZhciBhYWJiMT1jb250YWN0LnNoYXBlMS5hYWJiO1xuICAgICAgICAgICAgdmFyIGFhYmIyPWNvbnRhY3Quc2hhcGUyLmFhYmI7XG4gICAgICAgICAgICBpZihcbiAgICAgICAgICAgICAgYWFiYjEubWluWD5hYWJiMi5tYXhYIHx8IGFhYmIxLm1heFg8YWFiYjIubWluWCB8fFxuICAgICAgICAgICAgICBhYWJiMS5taW5ZPmFhYmIyLm1heFkgfHwgYWFiYjEubWF4WTxhYWJiMi5taW5ZIHx8XG4gICAgICAgICAgICAgIGFhYmIxLm1pblo+YWFiYjIubWF4WiB8fCBhYWJiMS5tYXhaPGFhYmIyLm1pblpcbiAgICAgICAgICAgICl7Ki9cbiAgICAgICAgICAgIHZhciBuZXh0ID0gY29udGFjdC5uZXh0O1xuICAgICAgICAgICAgdGhpcy5yZW1vdmVDb250YWN0KGNvbnRhY3QpO1xuICAgICAgICAgICAgY29udGFjdCA9IG5leHQ7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGIxID0gY29udGFjdC5ib2R5MTtcbiAgICAgICAgdmFyIGIyID0gY29udGFjdC5ib2R5MjtcblxuICAgICAgICBpZiAoYjEuaXNEeW5hbWljICYmICFiMS5zbGVlcGluZyB8fCBiMi5pc0R5bmFtaWMgJiYgIWIyLnNsZWVwaW5nKSBjb250YWN0LnVwZGF0ZU1hbmlmb2xkKCk7XG5cbiAgICAgICAgdGhpcy5udW1Db250YWN0UG9pbnRzICs9IGNvbnRhY3QubWFuaWZvbGQubnVtUG9pbnRzO1xuICAgICAgICBjb250YWN0LnBlcnNpc3RpbmcgPSBmYWxzZTtcbiAgICAgICAgY29udGFjdC5jb25zdHJhaW50LmFkZGVkVG9Jc2xhbmQgPSBmYWxzZTtcbiAgICAgICAgY29udGFjdCA9IGNvbnRhY3QubmV4dDtcblxuICAgICAgfVxuXG4gICAgICBpZiAoc3RhdCkgdGhpcy5wZXJmb3JtYW5jZS5jYWxjTmFycm93UGhhc2UoKTtcblxuICAgICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgIC8vICAgU09MVkUgSVNMQU5EU1xuICAgICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAgICAgdmFyIGludlRpbWVTdGVwID0gMSAvIHRoaXMudGltZVN0ZXA7XG4gICAgICB2YXIgam9pbnQ7XG4gICAgICB2YXIgY29uc3RyYWludDtcblxuICAgICAgZm9yIChqb2ludCA9IHRoaXMuam9pbnRzOyBqb2ludCAhPT0gbnVsbDsgam9pbnQgPSBqb2ludC5uZXh0KSB7XG4gICAgICAgIGpvaW50LmFkZGVkVG9Jc2xhbmQgPSBmYWxzZTtcbiAgICAgIH1cblxuXG4gICAgICAvLyBjbGVhciBvbGQgaXNsYW5kIGFycmF5XG4gICAgICB0aGlzLmlzbGFuZFJpZ2lkQm9kaWVzID0gW107XG4gICAgICB0aGlzLmlzbGFuZENvbnN0cmFpbnRzID0gW107XG4gICAgICB0aGlzLmlzbGFuZFN0YWNrID0gW107XG5cbiAgICAgIGlmIChzdGF0KSB0aGlzLnBlcmZvcm1hbmNlLnNldFRpbWUoMSk7XG5cbiAgICAgIHRoaXMubnVtSXNsYW5kcyA9IDA7XG5cbiAgICAgIC8vIGJ1aWxkIGFuZCBzb2x2ZSBzaW11bGF0aW9uIGlzbGFuZHNcblxuICAgICAgZm9yICh2YXIgYmFzZSA9IHRoaXMucmlnaWRCb2RpZXM7IGJhc2UgIT09IG51bGw7IGJhc2UgPSBiYXNlLm5leHQpIHtcblxuICAgICAgICBpZiAoYmFzZS5hZGRlZFRvSXNsYW5kIHx8IGJhc2UuaXNTdGF0aWMgfHwgYmFzZS5zbGVlcGluZykgY29udGludWU7Ly8gaWdub3JlXG5cbiAgICAgICAgaWYgKGJhc2UuaXNMb25lbHkoKSkgey8vIHVwZGF0ZSBzaW5nbGUgYm9keVxuICAgICAgICAgIGlmIChiYXNlLmlzRHluYW1pYykge1xuICAgICAgICAgICAgYmFzZS5saW5lYXJWZWxvY2l0eS5hZGRTY2FsZWRWZWN0b3IodGhpcy5ncmF2aXR5LCB0aGlzLnRpbWVTdGVwKTtcbiAgICAgICAgICAgIC8qYmFzZS5saW5lYXJWZWxvY2l0eS54Kz10aGlzLmdyYXZpdHkueCp0aGlzLnRpbWVTdGVwO1xuICAgICAgICAgICAgYmFzZS5saW5lYXJWZWxvY2l0eS55Kz10aGlzLmdyYXZpdHkueSp0aGlzLnRpbWVTdGVwO1xuICAgICAgICAgICAgYmFzZS5saW5lYXJWZWxvY2l0eS56Kz10aGlzLmdyYXZpdHkueip0aGlzLnRpbWVTdGVwOyovXG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICh0aGlzLmNhbGxTbGVlcChiYXNlKSkge1xuICAgICAgICAgICAgYmFzZS5zbGVlcFRpbWUgKz0gdGhpcy50aW1lU3RlcDtcbiAgICAgICAgICAgIGlmIChiYXNlLnNsZWVwVGltZSA+IDAuNSkgYmFzZS5zbGVlcCgpO1xuICAgICAgICAgICAgZWxzZSBiYXNlLnVwZGF0ZVBvc2l0aW9uKHRoaXMudGltZVN0ZXApO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBiYXNlLnNsZWVwVGltZSA9IDA7XG4gICAgICAgICAgICBiYXNlLnVwZGF0ZVBvc2l0aW9uKHRoaXMudGltZVN0ZXApO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLm51bUlzbGFuZHMrKztcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBpc2xhbmROdW1SaWdpZEJvZGllcyA9IDA7XG4gICAgICAgIHZhciBpc2xhbmROdW1Db25zdHJhaW50cyA9IDA7XG4gICAgICAgIHZhciBzdGFja0NvdW50ID0gMTtcbiAgICAgICAgLy8gYWRkIHJpZ2lkIGJvZHkgdG8gc3RhY2tcbiAgICAgICAgdGhpcy5pc2xhbmRTdGFja1swXSA9IGJhc2U7XG4gICAgICAgIGJhc2UuYWRkZWRUb0lzbGFuZCA9IHRydWU7XG5cbiAgICAgICAgLy8gYnVpbGQgYW4gaXNsYW5kXG4gICAgICAgIGRvIHtcbiAgICAgICAgICAvLyBnZXQgcmlnaWQgYm9keSBmcm9tIHN0YWNrXG4gICAgICAgICAgYm9keSA9IHRoaXMuaXNsYW5kU3RhY2tbLS1zdGFja0NvdW50XTtcbiAgICAgICAgICB0aGlzLmlzbGFuZFN0YWNrW3N0YWNrQ291bnRdID0gbnVsbDtcbiAgICAgICAgICBib2R5LnNsZWVwaW5nID0gZmFsc2U7XG4gICAgICAgICAgLy8gYWRkIHJpZ2lkIGJvZHkgdG8gdGhlIGlzbGFuZFxuICAgICAgICAgIHRoaXMuaXNsYW5kUmlnaWRCb2RpZXNbaXNsYW5kTnVtUmlnaWRCb2RpZXMrK10gPSBib2R5O1xuICAgICAgICAgIGlmIChib2R5LmlzU3RhdGljKSBjb250aW51ZTtcblxuICAgICAgICAgIC8vIHNlYXJjaCBjb25uZWN0aW9uc1xuICAgICAgICAgIGZvciAodmFyIGNzID0gYm9keS5jb250YWN0TGluazsgY3MgIT09IG51bGw7IGNzID0gY3MubmV4dCkge1xuICAgICAgICAgICAgdmFyIGNvbnRhY3QgPSBjcy5jb250YWN0O1xuICAgICAgICAgICAgY29uc3RyYWludCA9IGNvbnRhY3QuY29uc3RyYWludDtcbiAgICAgICAgICAgIGlmIChjb25zdHJhaW50LmFkZGVkVG9Jc2xhbmQgfHwgIWNvbnRhY3QudG91Y2hpbmcpIGNvbnRpbnVlOy8vIGlnbm9yZVxuXG4gICAgICAgICAgICAvLyBhZGQgY29uc3RyYWludCB0byB0aGUgaXNsYW5kXG4gICAgICAgICAgICB0aGlzLmlzbGFuZENvbnN0cmFpbnRzW2lzbGFuZE51bUNvbnN0cmFpbnRzKytdID0gY29uc3RyYWludDtcbiAgICAgICAgICAgIGNvbnN0cmFpbnQuYWRkZWRUb0lzbGFuZCA9IHRydWU7XG4gICAgICAgICAgICB2YXIgbmV4dCA9IGNzLmJvZHk7XG5cbiAgICAgICAgICAgIGlmIChuZXh0LmFkZGVkVG9Jc2xhbmQpIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICAvLyBhZGQgcmlnaWQgYm9keSB0byBzdGFja1xuICAgICAgICAgICAgdGhpcy5pc2xhbmRTdGFja1tzdGFja0NvdW50KytdID0gbmV4dDtcbiAgICAgICAgICAgIG5leHQuYWRkZWRUb0lzbGFuZCA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIGZvciAodmFyIGpzID0gYm9keS5qb2ludExpbms7IGpzICE9PSBudWxsOyBqcyA9IGpzLm5leHQpIHtcbiAgICAgICAgICAgIGNvbnN0cmFpbnQgPSBqcy5qb2ludDtcblxuICAgICAgICAgICAgaWYgKGNvbnN0cmFpbnQuYWRkZWRUb0lzbGFuZCkgY29udGludWU7Ly8gaWdub3JlXG5cbiAgICAgICAgICAgIC8vIGFkZCBjb25zdHJhaW50IHRvIHRoZSBpc2xhbmRcbiAgICAgICAgICAgIHRoaXMuaXNsYW5kQ29uc3RyYWludHNbaXNsYW5kTnVtQ29uc3RyYWludHMrK10gPSBjb25zdHJhaW50O1xuICAgICAgICAgICAgY29uc3RyYWludC5hZGRlZFRvSXNsYW5kID0gdHJ1ZTtcbiAgICAgICAgICAgIG5leHQgPSBqcy5ib2R5O1xuICAgICAgICAgICAgaWYgKG5leHQuYWRkZWRUb0lzbGFuZCB8fCAhbmV4dC5pc0R5bmFtaWMpIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICAvLyBhZGQgcmlnaWQgYm9keSB0byBzdGFja1xuICAgICAgICAgICAgdGhpcy5pc2xhbmRTdGFja1tzdGFja0NvdW50KytdID0gbmV4dDtcbiAgICAgICAgICAgIG5leHQuYWRkZWRUb0lzbGFuZCA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9IHdoaWxlIChzdGFja0NvdW50ICE9IDApO1xuXG4gICAgICAgIC8vIHVwZGF0ZSB2ZWxvY2l0aWVzXG4gICAgICAgIHZhciBnVmVsID0gbmV3IFZlYzMoKS5hZGRTY2FsZWRWZWN0b3IodGhpcy5ncmF2aXR5LCB0aGlzLnRpbWVTdGVwKTtcbiAgICAgICAgLyp2YXIgZ3g9dGhpcy5ncmF2aXR5LngqdGhpcy50aW1lU3RlcDtcbiAgICAgICAgdmFyIGd5PXRoaXMuZ3Jhdml0eS55KnRoaXMudGltZVN0ZXA7XG4gICAgICAgIHZhciBnej10aGlzLmdyYXZpdHkueip0aGlzLnRpbWVTdGVwOyovXG4gICAgICAgIHZhciBqID0gaXNsYW5kTnVtUmlnaWRCb2RpZXM7XG4gICAgICAgIHdoaWxlIChqLS0pIHtcbiAgICAgICAgICAvL29yKHZhciBqPTAsIGw9aXNsYW5kTnVtUmlnaWRCb2RpZXM7IGo8bDsgaisrKXtcbiAgICAgICAgICBib2R5ID0gdGhpcy5pc2xhbmRSaWdpZEJvZGllc1tqXTtcbiAgICAgICAgICBpZiAoYm9keS5pc0R5bmFtaWMpIHtcbiAgICAgICAgICAgIGJvZHkubGluZWFyVmVsb2NpdHkuYWRkRXF1YWwoZ1ZlbCk7XG4gICAgICAgICAgICAvKmJvZHkubGluZWFyVmVsb2NpdHkueCs9Z3g7XG4gICAgICAgICAgICBib2R5LmxpbmVhclZlbG9jaXR5LnkrPWd5O1xuICAgICAgICAgICAgYm9keS5saW5lYXJWZWxvY2l0eS56Kz1nejsqL1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHJhbmRvbWl6aW5nIG9yZGVyXG4gICAgICAgIGlmICh0aGlzLmVuYWJsZVJhbmRvbWl6ZXIpIHtcbiAgICAgICAgICAvL2Zvcih2YXIgaj0xLCBsPWlzbGFuZE51bUNvbnN0cmFpbnRzOyBqPGw7IGorKyl7XG4gICAgICAgICAgaiA9IGlzbGFuZE51bUNvbnN0cmFpbnRzO1xuICAgICAgICAgIHdoaWxlIChqLS0pIHtcbiAgICAgICAgICAgIGlmIChqICE9PSAwKSB7XG4gICAgICAgICAgICAgIHZhciBzd2FwID0gKHRoaXMucmFuZFggPSAodGhpcy5yYW5kWCAqIHRoaXMucmFuZEEgKyB0aGlzLnJhbmRCICYgMHg3ZmZmZmZmZikpIC8gMjE0NzQ4MzY0OC4wICogaiB8IDA7XG4gICAgICAgICAgICAgIGNvbnN0cmFpbnQgPSB0aGlzLmlzbGFuZENvbnN0cmFpbnRzW2pdO1xuICAgICAgICAgICAgICB0aGlzLmlzbGFuZENvbnN0cmFpbnRzW2pdID0gdGhpcy5pc2xhbmRDb25zdHJhaW50c1tzd2FwXTtcbiAgICAgICAgICAgICAgdGhpcy5pc2xhbmRDb25zdHJhaW50c1tzd2FwXSA9IGNvbnN0cmFpbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gc29sdmUgY29udHJhaW50c1xuXG4gICAgICAgIGogPSBpc2xhbmROdW1Db25zdHJhaW50cztcbiAgICAgICAgd2hpbGUgKGotLSkge1xuICAgICAgICAgIC8vZm9yKGo9MCwgbD1pc2xhbmROdW1Db25zdHJhaW50czsgajxsOyBqKyspe1xuICAgICAgICAgIHRoaXMuaXNsYW5kQ29uc3RyYWludHNbal0ucHJlU29sdmUodGhpcy50aW1lU3RlcCwgaW52VGltZVN0ZXApOy8vIHByZS1zb2x2ZVxuICAgICAgICB9XG4gICAgICAgIHZhciBrID0gdGhpcy5udW1JdGVyYXRpb25zO1xuICAgICAgICB3aGlsZSAoay0tKSB7XG4gICAgICAgICAgLy9mb3IodmFyIGs9MCwgbD10aGlzLm51bUl0ZXJhdGlvbnM7IGs8bDsgaysrKXtcbiAgICAgICAgICBqID0gaXNsYW5kTnVtQ29uc3RyYWludHM7XG4gICAgICAgICAgd2hpbGUgKGotLSkge1xuICAgICAgICAgICAgLy9mb3Ioaj0wLCBtPWlzbGFuZE51bUNvbnN0cmFpbnRzOyBqPG07IGorKyl7XG4gICAgICAgICAgICB0aGlzLmlzbGFuZENvbnN0cmFpbnRzW2pdLnNvbHZlKCk7Ly8gbWFpbi1zb2x2ZVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBqID0gaXNsYW5kTnVtQ29uc3RyYWludHM7XG4gICAgICAgIHdoaWxlIChqLS0pIHtcbiAgICAgICAgICAvL2ZvcihqPTAsIGw9aXNsYW5kTnVtQ29uc3RyYWludHM7IGo8bDsgaisrKXtcbiAgICAgICAgICB0aGlzLmlzbGFuZENvbnN0cmFpbnRzW2pdLnBvc3RTb2x2ZSgpOy8vIHBvc3Qtc29sdmVcbiAgICAgICAgICB0aGlzLmlzbGFuZENvbnN0cmFpbnRzW2pdID0gbnVsbDsvLyBnY1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gc2xlZXBpbmcgY2hlY2tcblxuICAgICAgICB2YXIgc2xlZXBUaW1lID0gMTA7XG4gICAgICAgIGogPSBpc2xhbmROdW1SaWdpZEJvZGllcztcbiAgICAgICAgd2hpbGUgKGotLSkge1xuICAgICAgICAgIC8vZm9yKGo9MCwgbD1pc2xhbmROdW1SaWdpZEJvZGllcztqPGw7aisrKXtcbiAgICAgICAgICBib2R5ID0gdGhpcy5pc2xhbmRSaWdpZEJvZGllc1tqXTtcbiAgICAgICAgICBpZiAodGhpcy5jYWxsU2xlZXAoYm9keSkpIHtcbiAgICAgICAgICAgIGJvZHkuc2xlZXBUaW1lICs9IHRoaXMudGltZVN0ZXA7XG4gICAgICAgICAgICBpZiAoYm9keS5zbGVlcFRpbWUgPCBzbGVlcFRpbWUpIHNsZWVwVGltZSA9IGJvZHkuc2xlZXBUaW1lO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBib2R5LnNsZWVwVGltZSA9IDA7XG4gICAgICAgICAgICBzbGVlcFRpbWUgPSAwO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChzbGVlcFRpbWUgPiAwLjUpIHtcbiAgICAgICAgICAvLyBzbGVlcCB0aGUgaXNsYW5kXG4gICAgICAgICAgaiA9IGlzbGFuZE51bVJpZ2lkQm9kaWVzO1xuICAgICAgICAgIHdoaWxlIChqLS0pIHtcbiAgICAgICAgICAgIC8vZm9yKGo9MCwgbD1pc2xhbmROdW1SaWdpZEJvZGllcztqPGw7aisrKXtcbiAgICAgICAgICAgIHRoaXMuaXNsYW5kUmlnaWRCb2RpZXNbal0uc2xlZXAoKTtcbiAgICAgICAgICAgIHRoaXMuaXNsYW5kUmlnaWRCb2RpZXNbal0gPSBudWxsOy8vIGdjXG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIHVwZGF0ZSBwb3NpdGlvbnNcbiAgICAgICAgICBqID0gaXNsYW5kTnVtUmlnaWRCb2RpZXM7XG4gICAgICAgICAgd2hpbGUgKGotLSkge1xuICAgICAgICAgICAgLy9mb3Ioaj0wLCBsPWlzbGFuZE51bVJpZ2lkQm9kaWVzO2o8bDtqKyspe1xuICAgICAgICAgICAgdGhpcy5pc2xhbmRSaWdpZEJvZGllc1tqXS51cGRhdGVQb3NpdGlvbih0aGlzLnRpbWVTdGVwKTtcbiAgICAgICAgICAgIHRoaXMuaXNsYW5kUmlnaWRCb2RpZXNbal0gPSBudWxsOy8vIGdjXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMubnVtSXNsYW5kcysrO1xuICAgICAgfVxuXG4gICAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgLy8gICBFTkQgU0lNVUxBVElPTlxuICAgICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAgICAgaWYgKHN0YXQpIHRoaXMucGVyZm9ybWFuY2UuY2FsY0VuZCgpO1xuXG4gICAgICBpZiAodGhpcy5wb3N0TG9vcCAhPT0gbnVsbCkgdGhpcy5wb3N0TG9vcCgpO1xuXG4gICAgfSxcblxuICAgIC8vIHJlbW92ZSBzb21ldGluZyB0byB3b3JsZFxuXG4gICAgcmVtb3ZlOiBmdW5jdGlvbiAob2JqKSB7XG5cbiAgICB9LFxuXG4gICAgLy8gYWRkIHNvbWV0aW5nIHRvIHdvcmxkXG5cbiAgICBhZGQ6IGZ1bmN0aW9uIChvKSB7XG5cbiAgICAgIG8gPSBvIHx8IHt9O1xuXG4gICAgICB2YXIgdHlwZSA9IG8udHlwZSB8fCBcImJveFwiO1xuICAgICAgaWYgKHR5cGUuY29uc3RydWN0b3IgPT09IFN0cmluZykgdHlwZSA9IFt0eXBlXTtcbiAgICAgIHZhciBpc0pvaW50ID0gdHlwZVswXS5zdWJzdHJpbmcoMCwgNSkgPT09ICdqb2ludCcgPyB0cnVlIDogZmFsc2U7XG5cbiAgICAgIGlmIChpc0pvaW50KSByZXR1cm4gdGhpcy5pbml0Sm9pbnQodHlwZVswXSwgbyk7XG4gICAgICBlbHNlIHJldHVybiB0aGlzLmluaXRCb2R5KHR5cGUsIG8pO1xuXG4gICAgfSxcblxuICAgIGluaXRCb2R5OiBmdW5jdGlvbiAodHlwZSwgbykge1xuXG4gICAgICB2YXIgaW52U2NhbGUgPSB0aGlzLmludlNjYWxlO1xuXG4gICAgICAvLyBib2R5IGR5bmFtaWMgb3Igc3RhdGljXG4gICAgICB2YXIgbW92ZSA9IG8ubW92ZSB8fCBmYWxzZTtcbiAgICAgIHZhciBraW5lbWF0aWMgPSBvLmtpbmVtYXRpYyB8fCBmYWxzZTtcblxuICAgICAgLy8gUE9TSVRJT05cblxuICAgICAgLy8gYm9keSBwb3NpdGlvblxuICAgICAgdmFyIHAgPSBvLnBvcyB8fCBbMCwgMCwgMF07XG4gICAgICBwID0gcC5tYXAoZnVuY3Rpb24gKHgpIHsgcmV0dXJuIHggKiBpbnZTY2FsZTsgfSk7XG5cbiAgICAgIC8vIHNoYXBlIHBvc2l0aW9uXG4gICAgICB2YXIgcDIgPSBvLnBvc1NoYXBlIHx8IFswLCAwLCAwXTtcbiAgICAgIHAyID0gcDIubWFwKGZ1bmN0aW9uICh4KSB7IHJldHVybiB4ICogaW52U2NhbGU7IH0pO1xuXG4gICAgICAvLyBST1RBVElPTlxuXG4gICAgICAvLyBib2R5IHJvdGF0aW9uIGluIGRlZ3JlZVxuICAgICAgdmFyIHIgPSBvLnJvdCB8fCBbMCwgMCwgMF07XG4gICAgICByID0gci5tYXAoZnVuY3Rpb24gKHgpIHsgcmV0dXJuIHggKiBfTWF0aC5kZWd0b3JhZDsgfSk7XG5cbiAgICAgIC8vIHNoYXBlIHJvdGF0aW9uIGluIGRlZ3JlZVxuICAgICAgdmFyIHIyID0gby5yb3RTaGFwZSB8fCBbMCwgMCwgMF07XG4gICAgICByMiA9IHIubWFwKGZ1bmN0aW9uICh4KSB7IHJldHVybiB4ICogX01hdGguZGVndG9yYWQ7IH0pO1xuXG4gICAgICAvLyBTSVpFXG5cbiAgICAgIC8vIHNoYXBlIHNpemVcbiAgICAgIHZhciBzID0gby5zaXplID09PSB1bmRlZmluZWQgPyBbMSwgMSwgMV0gOiBvLnNpemU7XG4gICAgICBpZiAocy5sZW5ndGggPT09IDEpIHsgc1sxXSA9IHNbMF07IH1cbiAgICAgIGlmIChzLmxlbmd0aCA9PT0gMikgeyBzWzJdID0gc1swXTsgfVxuICAgICAgcyA9IHMubWFwKGZ1bmN0aW9uICh4KSB7IHJldHVybiB4ICogaW52U2NhbGU7IH0pO1xuXG5cblxuICAgICAgLy8gYm9keSBwaHlzaWNzIHNldHRpbmdzXG4gICAgICB2YXIgc2MgPSBuZXcgU2hhcGVDb25maWcoKTtcbiAgICAgIC8vIFRoZSBkZW5zaXR5IG9mIHRoZSBzaGFwZS5cbiAgICAgIGlmIChvLmRlbnNpdHkgIT09IHVuZGVmaW5lZCkgc2MuZGVuc2l0eSA9IG8uZGVuc2l0eTtcbiAgICAgIC8vIFRoZSBjb2VmZmljaWVudCBvZiBmcmljdGlvbiBvZiB0aGUgc2hhcGUuXG4gICAgICBpZiAoby5mcmljdGlvbiAhPT0gdW5kZWZpbmVkKSBzYy5mcmljdGlvbiA9IG8uZnJpY3Rpb247XG4gICAgICAvLyBUaGUgY29lZmZpY2llbnQgb2YgcmVzdGl0dXRpb24gb2YgdGhlIHNoYXBlLlxuICAgICAgaWYgKG8ucmVzdGl0dXRpb24gIT09IHVuZGVmaW5lZCkgc2MucmVzdGl0dXRpb24gPSBvLnJlc3RpdHV0aW9uO1xuICAgICAgLy8gVGhlIGJpdHMgb2YgdGhlIGNvbGxpc2lvbiBncm91cHMgdG8gd2hpY2ggdGhlIHNoYXBlIGJlbG9uZ3MuXG4gICAgICBpZiAoby5iZWxvbmdzVG8gIT09IHVuZGVmaW5lZCkgc2MuYmVsb25nc1RvID0gby5iZWxvbmdzVG87XG4gICAgICAvLyBUaGUgYml0cyBvZiB0aGUgY29sbGlzaW9uIGdyb3VwcyB3aXRoIHdoaWNoIHRoZSBzaGFwZSBjb2xsaWRlcy5cbiAgICAgIGlmIChvLmNvbGxpZGVzV2l0aCAhPT0gdW5kZWZpbmVkKSBzYy5jb2xsaWRlc1dpdGggPSBvLmNvbGxpZGVzV2l0aDtcblxuICAgICAgaWYgKG8uY29uZmlnICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgaWYgKG8uY29uZmlnWzBdICE9PSB1bmRlZmluZWQpIHNjLmRlbnNpdHkgPSBvLmNvbmZpZ1swXTtcbiAgICAgICAgaWYgKG8uY29uZmlnWzFdICE9PSB1bmRlZmluZWQpIHNjLmZyaWN0aW9uID0gby5jb25maWdbMV07XG4gICAgICAgIGlmIChvLmNvbmZpZ1syXSAhPT0gdW5kZWZpbmVkKSBzYy5yZXN0aXR1dGlvbiA9IG8uY29uZmlnWzJdO1xuICAgICAgICBpZiAoby5jb25maWdbM10gIT09IHVuZGVmaW5lZCkgc2MuYmVsb25nc1RvID0gby5jb25maWdbM107XG4gICAgICAgIGlmIChvLmNvbmZpZ1s0XSAhPT0gdW5kZWZpbmVkKSBzYy5jb2xsaWRlc1dpdGggPSBvLmNvbmZpZ1s0XTtcbiAgICAgIH1cblxuXG4gICAgICAvKiBpZihvLm1hc3NQb3Mpe1xuICAgICAgICAgICBvLm1hc3NQb3MgPSBvLm1hc3NQb3MubWFwKGZ1bmN0aW9uKHgpIHsgcmV0dXJuIHggKiBpbnZTY2FsZTsgfSk7XG4gICAgICAgICAgIHNjLnJlbGF0aXZlUG9zaXRpb24uc2V0KCBvLm1hc3NQb3NbMF0sIG8ubWFzc1Bvc1sxXSwgby5tYXNzUG9zWzJdICk7XG4gICAgICAgfVxuICAgICAgIGlmKG8ubWFzc1JvdCl7XG4gICAgICAgICAgIG8ubWFzc1JvdCA9IG8ubWFzc1JvdC5tYXAoZnVuY3Rpb24oeCkgeyByZXR1cm4geCAqIF9NYXRoLmRlZ3RvcmFkOyB9KTtcbiAgICAgICAgICAgdmFyIHEgPSBuZXcgUXVhdCgpLnNldEZyb21FdWxlciggby5tYXNzUm90WzBdLCBvLm1hc3NSb3RbMV0sIG8ubWFzc1JvdFsyXSApO1xuICAgICAgICAgICBzYy5yZWxhdGl2ZVJvdGF0aW9uID0gbmV3IE1hdDMzKCkuc2V0UXVhdCggcSApOy8vX01hdGguRXVsZXJUb01hdHJpeCggby5tYXNzUm90WzBdLCBvLm1hc3NSb3RbMV0sIG8ubWFzc1JvdFsyXSApO1xuICAgICAgIH0qL1xuXG4gICAgICB2YXIgcG9zaXRpb24gPSBuZXcgVmVjMyhwWzBdLCBwWzFdLCBwWzJdKTtcbiAgICAgIHZhciByb3RhdGlvbiA9IG5ldyBRdWF0KCkuc2V0RnJvbUV1bGVyKHJbMF0sIHJbMV0sIHJbMl0pO1xuXG4gICAgICAvLyByaWdpZGJvZHlcbiAgICAgIHZhciBib2R5ID0gbmV3IFJpZ2lkQm9keShwb3NpdGlvbiwgcm90YXRpb24pO1xuICAgICAgLy92YXIgYm9keSA9IG5ldyBSaWdpZEJvZHkoIHBbMF0sIHBbMV0sIHBbMl0sIHJbMF0sIHJbMV0sIHJbMl0sIHJbM10sIHRoaXMuc2NhbGUsIHRoaXMuaW52U2NhbGUgKTtcblxuICAgICAgLy8gU0hBUEVTXG5cbiAgICAgIHZhciBzaGFwZSwgbjtcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0eXBlLmxlbmd0aDsgaSsrKSB7XG5cbiAgICAgICAgbiA9IGkgKiAzO1xuXG4gICAgICAgIGlmIChwMltuXSAhPT0gdW5kZWZpbmVkKSBzYy5yZWxhdGl2ZVBvc2l0aW9uLnNldChwMltuXSwgcDJbbiArIDFdLCBwMltuICsgMl0pO1xuICAgICAgICBpZiAocjJbbl0gIT09IHVuZGVmaW5lZCkgc2MucmVsYXRpdmVSb3RhdGlvbi5zZXRRdWF0KG5ldyBRdWF0KCkuc2V0RnJvbUV1bGVyKHIyW25dLCByMltuICsgMV0sIHIyW24gKyAyXSkpO1xuXG4gICAgICAgIHN3aXRjaCAodHlwZVtpXSkge1xuICAgICAgICAgIGNhc2UgXCJzcGhlcmVcIjogc2hhcGUgPSBuZXcgU3BoZXJlKHNjLCBzW25dKTsgYnJlYWs7XG4gICAgICAgICAgY2FzZSBcImN5bGluZGVyXCI6IHNoYXBlID0gbmV3IEN5bGluZGVyKHNjLCBzW25dLCBzW24gKyAxXSk7IGJyZWFrO1xuICAgICAgICAgIGNhc2UgXCJib3hcIjogc2hhcGUgPSBuZXcgQm94KHNjLCBzW25dLCBzW24gKyAxXSwgc1tuICsgMl0pOyBicmVhaztcbiAgICAgICAgICBjYXNlIFwicGxhbmVcIjogc2hhcGUgPSBuZXcgUGxhbmUoc2MpOyBicmVha1xuICAgICAgICB9XG5cbiAgICAgICAgYm9keS5hZGRTaGFwZShzaGFwZSk7XG5cbiAgICAgIH1cblxuICAgICAgLy8gYm9keSBjYW4gc2xlZXAgb3Igbm90XG4gICAgICBpZiAoby5uZXZlclNsZWVwIHx8IGtpbmVtYXRpYykgYm9keS5hbGxvd1NsZWVwID0gZmFsc2U7XG4gICAgICBlbHNlIGJvZHkuYWxsb3dTbGVlcCA9IHRydWU7XG5cbiAgICAgIGJvZHkuaXNLaW5lbWF0aWMgPSBraW5lbWF0aWM7XG5cbiAgICAgIC8vIGJvZHkgc3RhdGljIG9yIGR5bmFtaWNcbiAgICAgIGlmIChtb3ZlKSB7XG5cbiAgICAgICAgaWYgKG8ubWFzc1BvcyB8fCBvLm1hc3NSb3QpIGJvZHkuc2V0dXBNYXNzKEJPRFlfRFlOQU1JQywgZmFsc2UpO1xuICAgICAgICBlbHNlIGJvZHkuc2V0dXBNYXNzKEJPRFlfRFlOQU1JQywgdHJ1ZSk7XG5cbiAgICAgICAgLy8gYm9keSBjYW4gc2xlZXAgb3Igbm90XG4gICAgICAgIC8vaWYoIG8ubmV2ZXJTbGVlcCApIGJvZHkuYWxsb3dTbGVlcCA9IGZhbHNlO1xuICAgICAgICAvL2Vsc2UgYm9keS5hbGxvd1NsZWVwID0gdHJ1ZTtcblxuICAgICAgfSBlbHNlIHtcblxuICAgICAgICBib2R5LnNldHVwTWFzcyhCT0RZX1NUQVRJQyk7XG5cbiAgICAgIH1cblxuICAgICAgaWYgKG8ubmFtZSAhPT0gdW5kZWZpbmVkKSBib2R5Lm5hbWUgPSBvLm5hbWU7XG4gICAgICAvL2Vsc2UgaWYoIG1vdmUgKSBib2R5Lm5hbWUgPSB0aGlzLm51bVJpZ2lkQm9kaWVzO1xuXG4gICAgICAvLyBmaW5hbHkgYWRkIHRvIHBoeXNpY3Mgd29ybGRcbiAgICAgIHRoaXMuYWRkUmlnaWRCb2R5KGJvZHkpO1xuXG4gICAgICAvLyBmb3JjZSBzbGVlcCBvbiBub3RcbiAgICAgIGlmIChtb3ZlKSB7XG4gICAgICAgIGlmIChvLnNsZWVwKSBib2R5LnNsZWVwKCk7XG4gICAgICAgIGVsc2UgYm9keS5hd2FrZSgpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gYm9keTtcblxuXG4gICAgfSxcblxuICAgIGluaXRKb2ludDogZnVuY3Rpb24gKHR5cGUsIG8pIHtcblxuICAgICAgLy92YXIgdHlwZSA9IHR5cGU7XG4gICAgICB2YXIgaW52U2NhbGUgPSB0aGlzLmludlNjYWxlO1xuXG4gICAgICB2YXIgYXhlMSA9IG8uYXhlMSB8fCBbMSwgMCwgMF07XG4gICAgICB2YXIgYXhlMiA9IG8uYXhlMiB8fCBbMSwgMCwgMF07XG4gICAgICB2YXIgcG9zMSA9IG8ucG9zMSB8fCBbMCwgMCwgMF07XG4gICAgICB2YXIgcG9zMiA9IG8ucG9zMiB8fCBbMCwgMCwgMF07XG5cbiAgICAgIHBvczEgPSBwb3MxLm1hcChmdW5jdGlvbiAoeCkgeyByZXR1cm4geCAqIGludlNjYWxlOyB9KTtcbiAgICAgIHBvczIgPSBwb3MyLm1hcChmdW5jdGlvbiAoeCkgeyByZXR1cm4geCAqIGludlNjYWxlOyB9KTtcblxuICAgICAgdmFyIG1pbiwgbWF4O1xuICAgICAgaWYgKHR5cGUgPT09IFwiam9pbnREaXN0YW5jZVwiKSB7XG4gICAgICAgIG1pbiA9IG8ubWluIHx8IDA7XG4gICAgICAgIG1heCA9IG8ubWF4IHx8IDEwO1xuICAgICAgICBtaW4gPSBtaW4gKiBpbnZTY2FsZTtcbiAgICAgICAgbWF4ID0gbWF4ICogaW52U2NhbGU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBtaW4gPSBvLm1pbiB8fCA1Ny4yOTU3ODtcbiAgICAgICAgbWF4ID0gby5tYXggfHwgMDtcbiAgICAgICAgbWluID0gbWluICogX01hdGguZGVndG9yYWQ7XG4gICAgICAgIG1heCA9IG1heCAqIF9NYXRoLmRlZ3RvcmFkO1xuICAgICAgfVxuXG4gICAgICB2YXIgbGltaXQgPSBvLmxpbWl0IHx8IG51bGw7XG4gICAgICB2YXIgc3ByaW5nID0gby5zcHJpbmcgfHwgbnVsbDtcbiAgICAgIHZhciBtb3RvciA9IG8ubW90b3IgfHwgbnVsbDtcblxuICAgICAgLy8gam9pbnQgc2V0dGluZ1xuICAgICAgdmFyIGpjID0gbmV3IEpvaW50Q29uZmlnKCk7XG4gICAgICBqYy5zY2FsZSA9IHRoaXMuc2NhbGU7XG4gICAgICBqYy5pbnZTY2FsZSA9IHRoaXMuaW52U2NhbGU7XG4gICAgICBqYy5hbGxvd0NvbGxpc2lvbiA9IG8uY29sbGlzaW9uIHx8IGZhbHNlO1xuICAgICAgamMubG9jYWxBeGlzMS5zZXQoYXhlMVswXSwgYXhlMVsxXSwgYXhlMVsyXSk7XG4gICAgICBqYy5sb2NhbEF4aXMyLnNldChheGUyWzBdLCBheGUyWzFdLCBheGUyWzJdKTtcbiAgICAgIGpjLmxvY2FsQW5jaG9yUG9pbnQxLnNldChwb3MxWzBdLCBwb3MxWzFdLCBwb3MxWzJdKTtcbiAgICAgIGpjLmxvY2FsQW5jaG9yUG9pbnQyLnNldChwb3MyWzBdLCBwb3MyWzFdLCBwb3MyWzJdKTtcblxuICAgICAgdmFyIGIxID0gbnVsbDtcbiAgICAgIHZhciBiMiA9IG51bGw7XG5cbiAgICAgIGlmIChvLmJvZHkxID09PSB1bmRlZmluZWQgfHwgby5ib2R5MiA9PT0gdW5kZWZpbmVkKSByZXR1cm4gcHJpbnRFcnJvcignV29ybGQnLCBcIkNhbid0IGFkZCBqb2ludCBpZiBhdHRhY2ggcmlnaWRib2R5cyBub3QgZGVmaW5lICFcIik7XG5cbiAgICAgIGlmIChvLmJvZHkxLmNvbnN0cnVjdG9yID09PSBTdHJpbmcpIHsgYjEgPSB0aGlzLmdldEJ5TmFtZShvLmJvZHkxKTsgfVxuICAgICAgZWxzZSBpZiAoby5ib2R5MS5jb25zdHJ1Y3RvciA9PT0gTnVtYmVyKSB7IGIxID0gdGhpcy5nZXRCeU5hbWUoby5ib2R5MSk7IH1cbiAgICAgIGVsc2UgaWYgKG8uYm9keTEuY29uc3RydWN0b3IgPT09IFJpZ2lkQm9keSkgeyBiMSA9IG8uYm9keTE7IH1cblxuICAgICAgaWYgKG8uYm9keTIuY29uc3RydWN0b3IgPT09IFN0cmluZykgeyBiMiA9IHRoaXMuZ2V0QnlOYW1lKG8uYm9keTIpOyB9XG4gICAgICBlbHNlIGlmIChvLmJvZHkyLmNvbnN0cnVjdG9yID09PSBOdW1iZXIpIHsgYjIgPSB0aGlzLmdldEJ5TmFtZShvLmJvZHkyKTsgfVxuICAgICAgZWxzZSBpZiAoby5ib2R5Mi5jb25zdHJ1Y3RvciA9PT0gUmlnaWRCb2R5KSB7IGIyID0gby5ib2R5MjsgfVxuXG4gICAgICBpZiAoYjEgPT09IG51bGwgfHwgYjIgPT09IG51bGwpIHJldHVybiBwcmludEVycm9yKCdXb3JsZCcsIFwiQ2FuJ3QgYWRkIGpvaW50IGF0dGFjaCByaWdpZGJvZHlzIG5vdCBmaW5kICFcIik7XG5cbiAgICAgIGpjLmJvZHkxID0gYjE7XG4gICAgICBqYy5ib2R5MiA9IGIyO1xuXG4gICAgICB2YXIgam9pbnQ7XG4gICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgY2FzZSBcImpvaW50RGlzdGFuY2VcIjogam9pbnQgPSBuZXcgRGlzdGFuY2VKb2ludChqYywgbWluLCBtYXgpO1xuICAgICAgICAgIGlmIChzcHJpbmcgIT09IG51bGwpIGpvaW50LmxpbWl0TW90b3Iuc2V0U3ByaW5nKHNwcmluZ1swXSwgc3ByaW5nWzFdKTtcbiAgICAgICAgICBpZiAobW90b3IgIT09IG51bGwpIGpvaW50LmxpbWl0TW90b3Iuc2V0TW90b3IobW90b3JbMF0sIG1vdG9yWzFdKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcImpvaW50SGluZ2VcIjogY2FzZSBcImpvaW50XCI6IGpvaW50ID0gbmV3IEhpbmdlSm9pbnQoamMsIG1pbiwgbWF4KTtcbiAgICAgICAgICBpZiAoc3ByaW5nICE9PSBudWxsKSBqb2ludC5saW1pdE1vdG9yLnNldFNwcmluZyhzcHJpbmdbMF0sIHNwcmluZ1sxXSk7Ly8gc29mdGVuIHRoZSBqb2ludCBleDogMTAwLCAwLjJcbiAgICAgICAgICBpZiAobW90b3IgIT09IG51bGwpIGpvaW50LmxpbWl0TW90b3Iuc2V0TW90b3IobW90b3JbMF0sIG1vdG9yWzFdKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcImpvaW50UHJpc21lXCI6IGpvaW50ID0gbmV3IFByaXNtYXRpY0pvaW50KGpjLCBtaW4sIG1heCk7IGJyZWFrO1xuICAgICAgICBjYXNlIFwiam9pbnRTbGlkZVwiOiBqb2ludCA9IG5ldyBTbGlkZXJKb2ludChqYywgbWluLCBtYXgpOyBicmVhaztcbiAgICAgICAgY2FzZSBcImpvaW50QmFsbFwiOiBqb2ludCA9IG5ldyBCYWxsQW5kU29ja2V0Sm9pbnQoamMpOyBicmVhaztcbiAgICAgICAgY2FzZSBcImpvaW50V2hlZWxcIjogam9pbnQgPSBuZXcgV2hlZWxKb2ludChqYyk7XG4gICAgICAgICAgaWYgKGxpbWl0ICE9PSBudWxsKSBqb2ludC5yb3RhdGlvbmFsTGltaXRNb3RvcjEuc2V0TGltaXQobGltaXRbMF0sIGxpbWl0WzFdKTtcbiAgICAgICAgICBpZiAoc3ByaW5nICE9PSBudWxsKSBqb2ludC5yb3RhdGlvbmFsTGltaXRNb3RvcjEuc2V0U3ByaW5nKHNwcmluZ1swXSwgc3ByaW5nWzFdKTtcbiAgICAgICAgICBpZiAobW90b3IgIT09IG51bGwpIGpvaW50LnJvdGF0aW9uYWxMaW1pdE1vdG9yMS5zZXRNb3Rvcihtb3RvclswXSwgbW90b3JbMV0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICBqb2ludC5uYW1lID0gby5uYW1lIHx8ICcnO1xuICAgICAgLy8gZmluYWx5IGFkZCB0byBwaHlzaWNzIHdvcmxkXG4gICAgICB0aGlzLmFkZEpvaW50KGpvaW50KTtcblxuICAgICAgcmV0dXJuIGpvaW50O1xuXG4gICAgfSxcblxuXG4gIH0pO1xuXG4gIC8vIHRlc3QgdmVyc2lvblxuXG4gIC8vZXhwb3J0IHsgUmlnaWRCb2R5IH0gZnJvbSAnLi9jb3JlL1JpZ2lkQm9keV9YLmpzJztcbiAgLy9leHBvcnQgeyBXb3JsZCB9IGZyb20gJy4vY29yZS9Xb3JsZF9YLmpzJztcblxuICBleHBvcnRzLk1hdGggPSBfTWF0aDtcbiAgZXhwb3J0cy5WZWMzID0gVmVjMztcbiAgZXhwb3J0cy5RdWF0ID0gUXVhdDtcbiAgZXhwb3J0cy5NYXQzMyA9IE1hdDMzO1xuICBleHBvcnRzLlNoYXBlID0gU2hhcGU7XG4gIGV4cG9ydHMuQm94ID0gQm94O1xuICBleHBvcnRzLlNwaGVyZSA9IFNwaGVyZTtcbiAgZXhwb3J0cy5DeWxpbmRlciA9IEN5bGluZGVyO1xuICBleHBvcnRzLlBsYW5lID0gUGxhbmU7XG4gIGV4cG9ydHMuUGFydGljbGUgPSBQYXJ0aWNsZTtcbiAgZXhwb3J0cy5TaGFwZUNvbmZpZyA9IFNoYXBlQ29uZmlnO1xuICBleHBvcnRzLkxpbWl0TW90b3IgPSBMaW1pdE1vdG9yO1xuICBleHBvcnRzLkhpbmdlSm9pbnQgPSBIaW5nZUpvaW50O1xuICBleHBvcnRzLkJhbGxBbmRTb2NrZXRKb2ludCA9IEJhbGxBbmRTb2NrZXRKb2ludDtcbiAgZXhwb3J0cy5EaXN0YW5jZUpvaW50ID0gRGlzdGFuY2VKb2ludDtcbiAgZXhwb3J0cy5QcmlzbWF0aWNKb2ludCA9IFByaXNtYXRpY0pvaW50O1xuICBleHBvcnRzLlNsaWRlckpvaW50ID0gU2xpZGVySm9pbnQ7XG4gIGV4cG9ydHMuV2hlZWxKb2ludCA9IFdoZWVsSm9pbnQ7XG4gIGV4cG9ydHMuSm9pbnRDb25maWcgPSBKb2ludENvbmZpZztcbiAgZXhwb3J0cy5SaWdpZEJvZHkgPSBSaWdpZEJvZHk7XG4gIGV4cG9ydHMuV29ybGQgPSBXb3JsZDtcbiAgZXhwb3J0cy5SRVZJU0lPTiA9IFJFVklTSU9OO1xuICBleHBvcnRzLkJSX05VTEwgPSBCUl9OVUxMO1xuICBleHBvcnRzLkJSX0JSVVRFX0ZPUkNFID0gQlJfQlJVVEVfRk9SQ0U7XG4gIGV4cG9ydHMuQlJfU1dFRVBfQU5EX1BSVU5FID0gQlJfU1dFRVBfQU5EX1BSVU5FO1xuICBleHBvcnRzLkJSX0JPVU5ESU5HX1ZPTFVNRV9UUkVFID0gQlJfQk9VTkRJTkdfVk9MVU1FX1RSRUU7XG4gIGV4cG9ydHMuQk9EWV9OVUxMID0gQk9EWV9OVUxMO1xuICBleHBvcnRzLkJPRFlfRFlOQU1JQyA9IEJPRFlfRFlOQU1JQztcbiAgZXhwb3J0cy5CT0RZX1NUQVRJQyA9IEJPRFlfU1RBVElDO1xuICBleHBvcnRzLkJPRFlfS0lORU1BVElDID0gQk9EWV9LSU5FTUFUSUM7XG4gIGV4cG9ydHMuQk9EWV9HSE9TVCA9IEJPRFlfR0hPU1Q7XG4gIGV4cG9ydHMuU0hBUEVfTlVMTCA9IFNIQVBFX05VTEw7XG4gIGV4cG9ydHMuU0hBUEVfU1BIRVJFID0gU0hBUEVfU1BIRVJFO1xuICBleHBvcnRzLlNIQVBFX0JPWCA9IFNIQVBFX0JPWDtcbiAgZXhwb3J0cy5TSEFQRV9DWUxJTkRFUiA9IFNIQVBFX0NZTElOREVSO1xuICBleHBvcnRzLlNIQVBFX1BMQU5FID0gU0hBUEVfUExBTkU7XG4gIGV4cG9ydHMuU0hBUEVfUEFSVElDTEUgPSBTSEFQRV9QQVJUSUNMRTtcbiAgZXhwb3J0cy5TSEFQRV9URVRSQSA9IFNIQVBFX1RFVFJBO1xuICBleHBvcnRzLkpPSU5UX05VTEwgPSBKT0lOVF9OVUxMO1xuICBleHBvcnRzLkpPSU5UX0RJU1RBTkNFID0gSk9JTlRfRElTVEFOQ0U7XG4gIGV4cG9ydHMuSk9JTlRfQkFMTF9BTkRfU09DS0VUID0gSk9JTlRfQkFMTF9BTkRfU09DS0VUO1xuICBleHBvcnRzLkpPSU5UX0hJTkdFID0gSk9JTlRfSElOR0U7XG4gIGV4cG9ydHMuSk9JTlRfV0hFRUwgPSBKT0lOVF9XSEVFTDtcbiAgZXhwb3J0cy5KT0lOVF9TTElERVIgPSBKT0lOVF9TTElERVI7XG4gIGV4cG9ydHMuSk9JTlRfUFJJU01BVElDID0gSk9JTlRfUFJJU01BVElDO1xuICBleHBvcnRzLkFBQkJfUFJPWCA9IEFBQkJfUFJPWDtcbiAgZXhwb3J0cy5wcmludEVycm9yID0gcHJpbnRFcnJvcjtcbiAgZXhwb3J0cy5JbmZvRGlzcGxheSA9IEluZm9EaXNwbGF5O1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG5cbn0pKTsiLCIvKiBnbG9iYWwgQUZSQU1FLCBUSFJFRSwgT0lNTyAqL1xyXG5cclxuZ2xvYmFsLk9JTU8gPSByZXF1aXJlKFwiLi9saWJzL29pbW9cIilcclxuZ2xvYmFsLndvcmxkID0gbmV3IE9JTU8uV29ybGQoKVxyXG5nbG9iYWwuYm9kaWVzID0gW11cclxuZ2xvYmFsLm1vdmluZ0JvZGllcyA9IFtdXHJcblxyXG5sZXQgdmVjID0gbmV3IE9JTU8uVmVjMygpXHJcbmxldCBxdWF0ID0gbmV3IE9JTU8uUXVhdCgpXHJcbmxldCBuZXh0U3RlcCA9IDBcclxuXHJcbmZ1bmN0aW9uIGluaXQoKSB7XHJcbiAgYWRkRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgb25NZXNzYWdlKVxyXG59XHJcblxyXG5mdW5jdGlvbiBvbk1lc3NhZ2UoZSkge1xyXG4gIGlmICh0eXBlb2YgZS5kYXRhID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICBsZXQgY29tbWFuZCA9IHBhcnNlQ29tbWFuZChlLmRhdGEpXHJcbiAgICBzd2l0Y2ggKGNvbW1hbmQuc2hpZnQoKSkge1xyXG4gICAgICBjYXNlIFwid29ybGRcIjpcclxuICAgICAgICB3b3JsZENvbW1hbmQoY29tbWFuZClcclxuICAgICAgICBicmVha1xyXG4gICAgfVxyXG4gIH1cclxuICBlbHNlIGlmIChlLmRhdGEgaW5zdGFuY2VvZiBGbG9hdDY0QXJyYXkpIHtcclxuICAgIGxldCBidWZmZXIgPSBlLmRhdGFcclxuICAgIGxldCBub3cgPSBEYXRlLm5vdygpXHJcbiAgICBpZiAobm93ID4gbmV4dFN0ZXApIHtcclxuICAgICAgZm9yIChsZXQgbWlkID0gMDsgbWlkIDwgbW92aW5nQm9kaWVzLmxlbmd0aDsgbWlkKyspIHtcclxuICAgICAgICBsZXQgYm9keSA9IG1vdmluZ0JvZGllc1ttaWRdXHJcbiAgICAgICAgbGV0IHAgPSBtaWQgKiA4XHJcbiAgICAgICAgaWYgKCFib2R5KSBjb250aW51ZVxyXG4gICAgICAgIGlmIChib2R5LmlzS2luZW1hdGljKSB7XHJcbiAgICAgICAgICB2ZWMuc2V0KGJ1ZmZlcltwKytdLCBidWZmZXJbcCsrXSwgYnVmZmVyW3ArK10pXHJcbiAgICAgICAgICBib2R5LnNldFBvc2l0aW9uKHZlYylcclxuICAgICAgICAgIHArK1xyXG4gICAgICAgICAgcXVhdC5zZXQoYnVmZmVyW3ArK10sIGJ1ZmZlcltwKytdLCBidWZmZXJbcCsrXSwgYnVmZmVyW3ArK10pXHJcbiAgICAgICAgICBib2R5LnNldFF1YXRlcm5pb24ocXVhdClcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgd29ybGQuc3RlcCgpXHJcbiAgICAgIG5leHRTdGVwICs9IHdvcmxkLnRpbWVyYXRlXHJcbiAgICAgIGlmIChub3cgPiBuZXh0U3RlcClcclxuICAgICAgICBuZXh0U3RlcCA9IG5vd1xyXG4gICAgfVxyXG4gICAgZm9yIChsZXQgbWlkID0gMDsgbWlkIDwgbW92aW5nQm9kaWVzLmxlbmd0aDsgbWlkKyspIHtcclxuICAgICAgbGV0IGJvZHkgPSBtb3ZpbmdCb2RpZXNbbWlkXVxyXG4gICAgICBsZXQgcCA9IG1pZCAqIDhcclxuICAgICAgaWYgKCFib2R5KSBjb250aW51ZVxyXG4gICAgICBpZiAoIWJvZHkuaXNLaW5lbWF0aWMpIHtcclxuICAgICAgICBidWZmZXJbcCsrXSA9IGJvZHkucG9zLnhcclxuICAgICAgICBidWZmZXJbcCsrXSA9IGJvZHkucG9zLnlcclxuICAgICAgICBidWZmZXJbcCsrXSA9IGJvZHkucG9zLnpcclxuICAgICAgICBwKytcclxuICAgICAgICBidWZmZXJbcCsrXSA9IGJvZHkucXVhdGVybmlvbi54XHJcbiAgICAgICAgYnVmZmVyW3ArK10gPSBib2R5LnF1YXRlcm5pb24ueVxyXG4gICAgICAgIGJ1ZmZlcltwKytdID0gYm9keS5xdWF0ZXJuaW9uLnpcclxuICAgICAgICBidWZmZXJbcCsrXSA9IGJvZHkucXVhdGVybmlvbi53XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHBvc3RNZXNzYWdlKGJ1ZmZlciwgW2J1ZmZlci5idWZmZXJdKVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gd29ybGRDb21tYW5kKHBhcmFtcykge1xyXG4gIGlmICh0eXBlb2YgcGFyYW1zWzBdID09PSBcIm51bWJlclwiKSB7XHJcbiAgICBwYXJhbXMuc2hpZnQoKVxyXG4gIH1cclxuICBzd2l0Y2ggKHBhcmFtcy5zaGlmdCgpKSB7XHJcbiAgICBjYXNlIFwiYm9keVwiOlxyXG4gICAgICBib2R5Q29tbWFuZChwYXJhbXMpXHJcbiAgICAgIGJyZWFrXHJcbiAgICBjYXNlIFwiZ3Jhdml0eVwiOlxyXG4gICAgICB3b3JsZC5ncmF2aXR5LmNvcHkocGFyYW1zWzBdKVxyXG4gICAgICBicmVha1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gYm9keUNvbW1hbmQocGFyYW1zKSB7XHJcbiAgbGV0IGlkID0gcGFyYW1zLnNoaWZ0KClcclxuICBsZXQgYm9keSA9IGJvZGllc1tpZF1cclxuICBzd2l0Y2ggKHBhcmFtcy5zaGlmdCgpKSB7XHJcbiAgICBjYXNlIFwic2hhcGVcIjpcclxuICAgICAgc2hhcGVDb21tYW5kKGJvZHksIHBhcmFtcylcclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgXCJjcmVhdGVcIjpcclxuICAgICAgaWYgKGJvZHkpIHtcclxuICAgICAgICB3b3JsZC5yZW1vdmVSaWdpZEJvZHkoYm9keSlcclxuICAgICAgICBpZiAoYm9keS5fbWlkXyAhPT0gbnVsbClcclxuICAgICAgICAgIG1vdmluZ0JvZGllc1tib2R5Ll9taWRfXSA9IG51bGxcclxuICAgICAgfVxyXG4gICAgICBib2RpZXNbaWRdID0gYm9keSA9IHdvcmxkLmFkZCh7XHJcbiAgICAgICAgbW92ZTogcGFyYW1zWzBdLnR5cGUgIT09IFwic3RhdGljXCIsXHJcbiAgICAgICAga2luZW1hdGljOiBwYXJhbXNbMF0udHlwZSA9PT0gXCJraW5lbWF0aWNcIixcclxuICAgICAgfSlcclxuICAgICAgYm9keS5yZXNldFBvc2l0aW9uKHBhcmFtc1swXS5wb3NpdGlvbi54LCBwYXJhbXNbMF0ucG9zaXRpb24ueSwgcGFyYW1zWzBdLnBvc2l0aW9uLnopXHJcbiAgICAgIGJvZHkucmVzZXRRdWF0ZXJuaW9uKHBhcmFtc1swXS5xdWF0ZXJuaW9uKVxyXG4gICAgICBib2R5Ll9taWRfID0gcGFyYW1zWzBdLm1pZFxyXG4gICAgICBpZiAoYm9keS5fbWlkXyAhPT0gbnVsbClcclxuICAgICAgICBtb3ZpbmdCb2RpZXNbYm9keS5fbWlkX10gPSBib2R5XHJcbiAgICAgIGJvZHkuX3NoYXBlc18gPSBbYm9keS5zaGFwZXNdXHJcbiAgICAgIGJyZWFrXHJcbiAgICBjYXNlIFwicmVtb3ZlXCI6XHJcbiAgICAgIHdvcmxkLnJlbW92ZVJpZ2lkQm9keShib2R5KVxyXG4gICAgICBib2RpZXNbaWRdID0gbnVsbFxyXG4gICAgICBpZiAoYm9keS5fbWlkXyAhPT0gbnVsbClcclxuICAgICAgICBtb3ZpbmdCb2RpZXNbYm9keS5fbWlkX10gPSBudWxsXHJcbiAgICAgIGJyZWFrXHJcbiAgICBjYXNlIFwicG9zaXRpb25cIjpcclxuICAgICAgYm9keS5yZXNldFBvc2l0aW9uKHBhcmFtc1swXSlcclxuICAgICAgYnJlYWtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNoYXBlQ29tbWFuZChib2R5LCBwYXJhbXMpIHtcclxuICBpZiAoIWJvZHkpIHJldHVyblxyXG4gIGxldCBpZCA9IHBhcmFtcy5zaGlmdCgpXHJcbiAgbGV0IHNoYXBlID0gYm9keS5fc2hhcGVzX1tpZF1cclxuICBzd2l0Y2ggKHBhcmFtcy5zaGlmdCgpKSB7XHJcbiAgICBjYXNlIFwiY3JlYXRlXCI6XHJcbiAgICAgIGlmIChzaGFwZSlcclxuICAgICAgICBib2R5LnJlbW92ZVNoYXBlKHNoYXBlKVxyXG4gICAgICBsZXQgc2MgPSBuZXcgT0lNTy5TaGFwZUNvbmZpZygpXHJcbiAgICAgIHNjLnJlbGF0aXZlUG9zaXRpb24uY29weShwYXJhbXNbMF0ucG9zaXRpb24pXHJcbiAgICAgIHNjLnJlbGF0aXZlUm90YXRpb24uc2V0UXVhdChxdWF0LmNvcHkocGFyYW1zWzBdLnF1YXRlcm5pb24pKVxyXG4gICAgICBzd2l0Y2ggKHBhcmFtc1swXS50eXBlKSB7XHJcbiAgICAgICAgY2FzZSBcInNwaGVyZVwiOiBzaGFwZSA9IG5ldyBPSU1PLlNwaGVyZShzYywgcGFyYW1zWzBdLnNpemUueCAvIDIpOyBicmVha1xyXG4gICAgICAgIGNhc2UgXCJjeWxpbmRlclwiOiBzaGFwZSA9IG5ldyBPSU1PLkN5bGluZGVyKHNjLCBwYXJhbXNbMF0uc2l6ZS54IC8gMiwgcGFyYW1zWzBdLnNpemUueSk7IGJyZWFrXHJcbiAgICAgICAgLy8gY2FzZSBcInBsYW5lXCI6IHNoYXBlID0gbmV3IE9JTU8uUGxhbmUoc2MpOyBicmVha1xyXG4gICAgICAgIGRlZmF1bHQ6IHNoYXBlID0gbmV3IE9JTU8uQm94KHNjLCBwYXJhbXNbMF0uc2l6ZS54LCBwYXJhbXNbMF0uc2l6ZS55LCBwYXJhbXNbMF0uc2l6ZS56KVxyXG4gICAgICB9XHJcbiAgICAgIGJvZHkuYWRkU2hhcGUoYm9keS5fc2hhcGVzX1tpZF0gPSBzaGFwZSlcclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgXCJyZW1vdmVcIjpcclxuICAgICAgYm9keS5yZW1vdmVTaGFwZShzaGFwZSlcclxuICAgICAgYm9keS5fc2hhcGVzX1tpZF0gPSBudWxsXHJcbiAgICAgIGJyZWFrXHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBwYXJzZUNvbW1hbmQoY21kKSB7XHJcbiAgbGV0IHdvcmRzID0gY21kLnNwbGl0KFwiIFwiKVxyXG4gIGxldCBhcmdzID0gW11cclxuICBmb3IgKGxldCB3b3JkIG9mIHdvcmRzKSB7XHJcbiAgICBpZiAod29yZCkge1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGFyZ3MucHVzaChKU09OLnBhcnNlKHdvcmQpKVxyXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgIGlmICh3b3JkICE9PSBcIj1cIilcclxuICAgICAgICAgIGFyZ3MucHVzaCh3b3JkKVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiBhcmdzXHJcbn1cclxuXHJcbmluaXQoKSJdfQ==
