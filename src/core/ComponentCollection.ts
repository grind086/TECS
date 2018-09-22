import { Component, Constructor, Entity } from './types';

/**
 * The collection of all components of a certain type. Primarily just a thin wrapper around a `Map`.
 */
export class ComponentCollection<C extends Component = Component, A extends any[] = any[]> {
    public get size() {
        return this._coll.size;
    }

    private _ctor: Constructor<C, A>;
    private _coll: Map<Entity, C>;

    constructor(ctor: Constructor<C, A>) {
        this._ctor = ctor;
        this._coll = new Map();
    }

    public has(entity: Entity): boolean {
        return this._coll.has(entity);
    }

    public get(entity: Entity): C {
        const c = this._coll.get(entity);

        if (!c) {
            throw new Error(`Component does not exist for entity ${entity}`);
        }

        return c;
    }

    public maybeGet(entity: Entity): C | undefined {
        return this._coll.get(entity);
    }

    public create(entity: Entity, ...params: A): C {
        const c = new this._ctor(...params);
        this._coll.set(entity, c);
        return c;
    }

    public delete(entity: Entity): void {
        this._coll.delete(entity);
    }

    public entities(): IterableIterator<Entity> {
        return this._coll.keys();
    }

    public entries(): IterableIterator<[Entity, C]> {
        return this._coll.entries();
    }

    public values(): IterableIterator<C> {
        return this._coll.values();
    }
}
