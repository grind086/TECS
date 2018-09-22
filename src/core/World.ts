import { ComponentCollection } from './ComponentCollection';
import { EntityBuilder } from './EntityBuilder';
import { ComponentFromCollection, Entity, JoinComponentsResult, Resource, TupleKeysToProps } from './types';
import { WorldBuilder } from './WorldBuilder';

export class World<
    C extends { [name: string]: ComponentCollection } = {},
    R extends { [name: string]: Resource } = {}
> {
    public static create(): WorldBuilder {
        return new WorldBuilder();
    }

    private _components: Map<string | number | symbol, ComponentCollection>;
    private _resources: Map<string | number | symbol, Resource>;
    private _nextEntityId: number;

    constructor(components: C, resources: R) {
        this._components = new Map(Object.entries(components));
        this._resources = new Map(Object.entries(resources));
        this._nextEntityId = 0;
    }

    public getComponent<N extends keyof C>(name: N): C[N] {
        if (!this._components.has(name)) {
            throw new Error(`Missing component collection for ${name}`);
        }

        return this._components.get(name)!;
    }

    public getComponents<N extends Array<keyof C>>(...names: N): TupleKeysToProps<C, N> {
        return <any>names.map(name => this.getComponent(name));
    }

    /** Create an iterator that will iterate only the entities that have all given components */
    public joinComponents<N extends Array<keyof C>>(...names: N): Iterable<JoinComponentsResult<C, N>> {
        const colls = this.getComponents(...names);

        // Iterate the collection with the fewest items
        const coll: ComponentCollection = colls.reduce((p, c) => (p.size > c.size ? c : p), <any>{ size: Infinity });
        const iter = coll.entries();

        return {
            [Symbol.iterator]() {
                return {
                    next() {
                        outer: while (1) {
                            const { done, value } = iter.next();

                            if (done) {
                                return {
                                    done: true,
                                    value: <any>null
                                };
                            }

                            const [entity] = value;
                            const result: any = [];

                            for (const c of colls) {
                                const r = c.maybeGet(entity);

                                if (!r) {
                                    continue outer;
                                }

                                result.push(r);
                            }

                            return {
                                done: false,
                                value: <JoinComponentsResult<C, N>>result
                            };
                        }

                        throw new Error(`Unreachable`);
                    }
                };
            }
        };
    }

    public getResource<N extends keyof R>(name: N): R[N] {
        if (!this._resources.has(name)) {
            throw new Error(`Missing resource ${name}`);
        }

        return this._resources.get(name)!;
    }

    public setResource<N extends keyof R>(name: N, value: R[N]): void {
        this._resources.set(name, value);
    }

    public getResources<N extends Array<keyof R>>(...names: N): TupleKeysToProps<R, N> {
        return <any>names.map(name => this.getResource(name));
    }

    public getEntityComponents(entity: Entity): { [K in keyof C]?: ComponentFromCollection<C[K]> } {
        const result: { [K in keyof C]?: ComponentFromCollection<C[K]> } = {};

        for (const [name, coll] of this._components.entries()) {
            result[<keyof C>name] = <any>coll.maybeGet(entity);
        }

        return result;
    }

    public getNextEntityId(): number {
        return this._nextEntityId++;
    }

    public createEntity(): EntityBuilder<C> {
        return new EntityBuilder(this, this.getNextEntityId());
    }

    public deleteEntity(entity: Entity): void {
        for (const coll of this._components.values()) {
            coll.delete(entity);
        }
    }

    public runSystems(systems: Array<{ run(world: World<C, R>): void }>): void {
        for (const sys of systems) {
            sys.run(this);
        }
    }
}
