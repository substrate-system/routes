import pathToRegExp from './path-to-regex.js'

export interface RouteMatch {
    params:Record<string, string>;
    splats:string[];
    route:string;
    next?:((...any)=>any)|null;
    action?:(...any)=>any;
    index?:number;
}

interface Route {
    re:RegExp;
    src:string;
    keys:number[];
    action?:(...args:any[])=>any;
    index:number;
}

interface PendingMatch extends Omit<RouteMatch, 'next'> {
    next:number
}

function match (routes:Route[], uri:string, startAt?:number):PendingMatch|null {
    let i = startAt || 0

    for (let len = routes.length; i < len; ++i) {
        const route = routes[i]
        const re = route.re
        const keys = route.keys
        const splats:string[] = []
        const params:Record<string, string> = {}
        const captures = uri.match(re)

        if (captures) {
            for (let j = 1, len = captures.length; j < len; ++j) {
                const value = typeof captures[j] === 'string' ?
                    decodeURIComponent(captures[j]) :
                    captures[j]

                const key = keys[j - 1]
                if (key) {
                    params[key] = value
                } else {
                    splats.push(value)
                }
            }

            return {
                params: params,
                splats: splats,
                route: route.src,
                next: i + 1,
                index: route.index
            }
        }
    }

    return null
}

function routeInfo (path:string|RegExp, index:number):Route {
    let src
    let re:RegExp
    const keys:number[] = []

    if (path instanceof RegExp) {
        re = path
        src = path.toString()
    } else {
        re = pathToRegExp(path, keys)
        src = path
    }

    return { re, src, keys, index }
}

interface RouteHandler {
    (...any:any[]):void
}

export class Router {
    routes:Route[] = []
    routeMap:[string|RegExp, RouteHandler][] = []

    addRoute (
        path:string|RegExp,
        action:RouteHandler
    ):InstanceType<typeof Router> {
        const route = routeInfo(path, this.routeMap?.length)
        route.action = action
        this.routes.push(route)
        this.routeMap?.push([path, action])
        return this
    }

    match (uri:string, startAt?:number):RouteMatch|null {
        const route = match(this.routes, uri, startAt) as unknown as RouteMatch

        if (route) {
            const i = route.next as unknown as number
            route.action = ((this.routeMap || [])[route.index!] || [])[1]
            route.next = this.match.bind(this, uri, i)
        }

        return route
    }
}

export default Router
