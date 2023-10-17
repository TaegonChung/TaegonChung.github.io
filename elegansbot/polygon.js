
let wasm;
export let memory;

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

let cachegetUint8Memory0 = null;
function getUint8Memory0() {
    if (cachegetUint8Memory0 === null || cachegetUint8Memory0.buffer !== wasm.memory.buffer) {
        cachegetUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachegetUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}
/**
*/
export class Universe {

    static __wrap(ptr) {
        const obj = Object.create(Universe.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_universe_free(ptr);
    }
    /**
    * @param {number} dt_camera
    * @param {number} behavior
    * @returns {Universe}
    */
    static new(dt_camera, behavior) {
        var ret = wasm.universe_new(dt_camera, behavior);
        return Universe.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    n_point() {
        var ret = wasm.universe_n_point(this.ptr);
        return ret >>> 0;
    }
    /**
    * @returns {number}
    */
    x_skin() {
        var ret = wasm.universe_x_skin(this.ptr);
        return ret;
    }
    /**
    * @returns {number}
    */
    y_skin() {
        var ret = wasm.universe_y_skin(this.ptr);
        return ret;
    }
    /**
    * @returns {number}
    */
    t() {
        var ret = wasm.universe_t(this.ptr);
        return ret;
    }
    /**
    * @returns {number}
    */
    number_worms() {
        var ret = wasm.universe_number_worms(this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} val
    */
    set_worms_r_b(val) {
        wasm.universe_set_worms_r_b(this.ptr, val);
    }
    /**
    * @param {number} val
    */
    set_worms_behavior(val) {
        wasm.universe_set_worms_behavior(this.ptr, val);
    }
    /**
    * @param {number} wormtype
    * @param {number} direction
    * @param {number} xc
    * @param {number} yc
    */
    add_worm(wormtype, direction, xc, yc) {
        wasm.universe_add_worm(this.ptr, wormtype, direction, xc, yc);
    }
    /**
    */
    update() {
        wasm.universe_update(this.ptr);
    }
}
/**
*/
export class Worm {

    static __wrap(ptr) {
        const obj = Object.create(Worm.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_worm_free(ptr);
    }
    /**
    * @param {number} direction
    * @param {number} xc
    * @param {number} yc
    * @returns {Worm}
    */
    static new_crawl(direction, xc, yc) {
        var ret = wasm.worm_new_crawl(direction, xc, yc);
        return Worm.__wrap(ret);
    }
    /**
    * @param {number} direction
    * @param {number} xc
    * @param {number} yc
    * @returns {Worm}
    */
    static new_swim(direction, xc, yc) {
        var ret = wasm.worm_new_swim(direction, xc, yc);
        return Worm.__wrap(ret);
    }
    /**
    * @param {number} n
    * @param {number} mass
    * @param {number} length
    * @param {number} b_t
    * @param {number} b_ii
    * @param {number} kappa
    * @param {number} damp
    * @param {number} dt
    * @param {number} wavenumber
    * @param {number} period
    * @param {number} amplitude
    * @param {boolean} is_swimming
    * @param {number} direction
    * @param {number} xc
    * @param {number} yc
    * @returns {Worm}
    */
    static new(n, mass, length, b_t, b_ii, kappa, damp, dt, wavenumber, period, amplitude, is_swimming, direction, xc, yc) {
        var ret = wasm.worm_new(n, mass, length, b_t, b_ii, kappa, damp, dt, wavenumber, period, amplitude, is_swimming, direction, xc, yc);
        return Worm.__wrap(ret);
    }
    /**
    * @param {number} camera_dt
    * @param {number} t0
    */
    one_step(camera_dt, t0) {
        wasm.worm_one_step(this.ptr, camera_dt, t0);
    }
}

async function load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);

            } catch (e) {
                if (module.headers.get('Content-Type') != 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else {
                    throw e;
                }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);

    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };

        } else {
            return instance;
        }
    }
}

async function init(input) {
    if (typeof input === 'undefined') {
        input = new URL('polygon_bg.wasm', import.meta.url);
    }
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbindgen_throw = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };

    if (typeof input === 'string' || (typeof Request === 'function' && input instanceof Request) || (typeof URL === 'function' && input instanceof URL)) {
        input = fetch(input);
    }



    const { instance, module } = await load(await input, imports);

    wasm = instance.exports;
    memory = wasm.memory;
    init.__wbindgen_wasm_module = module;

    return wasm;
}

export default init;

