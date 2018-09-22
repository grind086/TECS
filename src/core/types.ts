import { ComponentCollection } from './ComponentCollection';
import { World } from './World';

/** A primitive representing an entity id */
export type Entity = number;

/** A simple component structure */
export type Component = {};

/** A simple resource */
export type Resource<T = any> = T;

/** A system that runs on the given world. In general it is a *bad idea* to reuse system instances between worlds. */
export type System<
    C extends { [name: string]: Constructor<Component> } = {},
    R extends { [name: string]: Resource } = {},
    W = World<{ [K in keyof C]: CollectionFromConstructor<C[K]> }, R>
> = {
    run(world: W): void;
};

/** A helper type that returns an appropriate world type for the given system */
export type SystemWorld<T extends System<any, any, any>> = T extends System<any, any, infer W> ? W : never;

/**
 * (internal) Converts a tuple of object keys into a tuple of object property types.
 *
 *     interface Foo {
 *         a: string;
 *         b: number;
 *         c: boolean;
 *     }
 *
 *     // [number, string, boolean];
 *     type FooProps = TupleKeysToProps<Foo, ['b', 'a', 'c']>;
 */
export type TupleKeysToProps<TObj, TKeys extends Array<keyof TObj>> = {
    [K in keyof TKeys]: TKeys[K] extends keyof TObj ? TObj[TKeys[K]] : never
};

/** (internal) A basic constructor type */
export type Constructor<T, A extends any[] = any[]> = { new (...args: A): T };

/** (internal) Extract a component type from a collection type */
export type ComponentFromCollection<T extends ComponentCollection> = T extends ComponentCollection<infer C, any>
    ? C
    : never;

/** (internal) Extract constructor arguments from a collection type */
export type ArgumentsFromCollection<T extends ComponentCollection> = T extends ComponentCollection<any, infer A>
    ? A
    : never;

/** (internal) A single iteration result for the given list of required components */
export type JoinComponentsResult<C extends { [name: string]: ComponentCollection }, N extends Array<keyof C>> = {
    [K in keyof N]: N[K] extends keyof C ? ComponentFromCollection<C[N[K]]> : never
};

/** (internal) Creates a ComponentCollection type from a component constructor */
export type CollectionFromConstructor<T extends Constructor<Component>> = T extends Constructor<infer C, infer A>
    ? C extends Component ? ComponentCollection<C, A> : never
    : never;
