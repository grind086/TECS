import { ComponentCollection } from './ComponentCollection';
import { CollectionFromConstructor, Component, Constructor, Resource } from './types';
import { World } from './World';

export class WorldBuilder<
    C extends { [name: string]: Constructor<Component> } = {},
    R extends { [name: string]: Resource } = {}
> {
    private _components: C;
    private _resources: R;

    constructor() {
        this._components = <any>{};
        this._resources = <any>{};
    }

    public registerComponent<N extends string, T extends Constructor<Component>>(
        name: N,
        component: T
    ): WorldBuilder<C & { [K in N]: T }, R> {
        this._components[name] = component;
        return <any>this;
    }

    public registerResource<N extends string, T extends Resource>(
        name: N,
        resource: T
    ): WorldBuilder<C, R & { [K in N]: T }> {
        this._resources[name] = resource;
        return <any>this;
    }

    public build(): World<{ [K in keyof C]: CollectionFromConstructor<C[K]> }, { [K in keyof R]: R[K] }> {
        const components = this._components;
        const names = <Array<keyof C>>Object.keys(components);

        const collections: any = {};
        for (const name of names) {
            collections[name] = new ComponentCollection(components[name]);
        }

        return new World(collections, this._resources);
    }
}
