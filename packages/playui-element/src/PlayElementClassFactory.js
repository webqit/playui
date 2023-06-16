
/**
 * @imports
 */
import { _isFunction, _isTypeObject, _isObject } from '@webqit/util/js/index.js';

/**
 * @PlayElementClassFactory
 */
export const PlayElementClassFactory = ( HTMLElement, ReflexFunction, Observer ) => class extends HTMLElement {

    static get reflexFunctions() {
        return [];
    }

    static get reflexFunctionsEnv() {
        return {};
    }

    constructor() {
        super();
        const _static = this.constructor;
        Object.defineProperty( this, 'reflexFunctionsInternals', { value: new Map } );
        this._init = _static.reflexFunctions.map( methodName => {
            if ( !_isFunction( this[ methodName ] ) ) throw new Error( `[PLAY_ELEMENT]: ${ methodName } is not a method.` );
            if ( methodName === 'constructor' ) throw new Error( `[PLAY_ELEMENT]: Class constructors cannot be reflex methods.` );
            return _await( _static.reflexCompile( this[ methodName ] ), ( [ reflexFunction, properties ] ) => {
                Object.defineProperty( this, methodName, { value: reflexFunction } );
                this.reflexFunctionsInternals.set( methodName, properties );
            } );
        } );
        if ( ( this._init = this._init.filter( x => x instanceof Promise ) ).length ) {
            this._init = Promise.all( this._init );
        }
    }

    connectedCallback() {
        super.connectedCallback && super.connectedCallback();
        const _static = this.constructor;
        _await( this._init, () => {
            _static.reflexFunctions.forEach( methodName => {
                const returnValue = this[ methodName ]();
                _await( returnValue, ( [ , rerenderCallback ] ) => {
                    _static.reflexBind( this.reflexFunctionsInternals.get( methodName ), rerenderCallback, this );
                } );
            } );
        } );
    }

    disconnectedCallback() {
        super.disconnectedCallback && super.disconnectedCallback();
        const _static = this.constructor;
        _await( this._init, () => {
            _static.reflexFunctions.forEach( methodName => {
                _static.reflexUnbind( this.reflexFunctionsInternals.get( methodName ) );
            } );
        } );
    }

    // ----------------------------------------------------------

    static reflexCompile( _function ) {
        let source = _function.toString();
        if ( _isFunction( _function ) ) {
            if ( !source.startsWith( 'function ' ) && !source.startsWith( 'function(' ) ) {
                source = source.startsWith( 'async ' ) ? source.replace( 'async ', 'async function ' ) : `function ${ source }`;
            };
            source = `\nreturn ${ source.replace( 'function', 'function **' ) }`;
        }
        let parameters = [];
        if ( _isObject( this.reflexFunctionsEnv ) ) {
            parameters = [ `{ ${ Object.keys( this.reflexFunctionsEnv ).join( ', ' ) } }` ];
        }
        let __function = ReflexFunction( parameters, source, {
            compilerParams: this.compilerParams,
            runtimeParams: this.runtimeParams,
        } );
        if ( _isObject( this.reflexFunctionsEnv ) ) {
            return _await( __function( this.reflexFunctionsEnv ), ( [ __function ] ) => {
                return [ __function, ReflexFunction.inspect( __function, 'properties' ) ];
            } );
        }
        return [ __function, ReflexFunction.inspect( __function, 'properties' ) ];
    }

    static reflexBind( properties, rerenderCallback, thisContext = undefined ) {
        _await( properties, properties => {
            const _env = { ...( this.reflexFunctionsEnv || {} ), 'this': thisContext };
            const getPaths = ( base, record_s ) => ( Array.isArray( record_s ) ? record_s : [ record_s ] ).map( record => [ ...base, ...( record.path || [ record.key ] ) ] );
            properties.processes = properties.dependencies.map( path => {
                if ( _isTypeObject( _env[ path[ 0 ] ] ) ) {
                    if ( path.length === 1 ) return;
                    return Observer.reduce( _env[ path[ 0 ] ], path.slice( 1 ), Observer.observe, record_s => {
                        rerenderCallback( ...getPaths( [ path[ 0 ] ], record_s ) );
                    } );
                }
                return Observer.reduce( globalThis, path, Observer.observe, record_s => {
                    rerenderCallback( ...getPaths( [], record_s ) );
                } );
            } );
        } );
    }
    
    static reflexUnbind( properties ) {
        _await( properties, properties => {
            properties?.processes.forEach( process => process?.abort() );
        } );
    }

    // ----------------------------------------------------------

    static get runtimeParams() {
        return { apiVersion: 2, };
    }

    static get compilerParams() {
        return {};
    }

}

export const _await = ( maybePromise, callback ) => (
    maybePromise instanceof Promise ? maybePromise.then( callback ) : callback( maybePromise )
);