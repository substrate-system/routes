// @ts-check
import assert from 'assert'
import Router from '../src/index.js'
const router = new Router()

assert.equal(1, 1)

const noop = function () {}

const cases = [
    {
        path: '/lang',
        testMatch: {
            '/lang': {
                action: noop,
                params: {},
                splats: []
            },
            '/lang/': {
                action: noop,
                params: {},
                splats: []
            }
        }
    },
    {
        path: '/lang/:lang([a-z]{2})',
        testMatch: {
            '/lang/de': {
                action: noop,
                params: {
                    lang: 'de'
                },
                splats: []
            }
        },
        testNoMatch: ['/lang/who', '/lang/toolong', '/lang/1']
    },
    {
        path: '/normal/:id',
        testMatch: {
            '/normal/1': {
                action: noop,
                params: {
                    id: '1'
                },
                splats: []
            }
        },
        testNoMatch: ['/normal/1/updates']
    },
    {
        path: '/optional/:id?',
        testMatch: {
            '/optional/1': {
                action: noop,
                params: {
                    id: '1'
                },
                splats: []
            },
            '/optional/': {
                action: noop,
                params: {
                    id: undefined
                },
                splats: []
            }
        },
        testNoMatch: ['/optional/1/blah']
    },
    {
        path: '/empty/*',
        testMatch: {
            '/empty/': {
                action: noop,
                params: { },
                splats: ['']
            }
        },
        testNomatch: ['/empty']
    },
    {
        path: '/whatever/*.*',
        testMatch: {
            '/whatever/1/2/3.js': {
                action: noop,
                params: { },
                splats: ['1/2/3', 'js']
            }
        },
        testNomatch: ['/whatever/']
    },
    {
        path: '/files/*.*',
        testMatch: {
            '/files/hi.json': {
                action: noop,
                params: {},
                splats: ['hi', 'json']
            },
            '/files/blah/blah.js': {
                action: noop,
                params: {},
                splats: ['blah/blah', 'js']
            }
        },
        testNoMatch: ['/files/', '/files/blah']
    },
    {
        path: '/transitive/:kind/:id/:method?.:format?',
        testMatch: {
            '/transitive/users/ekjnekjnfkej': {
                action: noop,
                params: {
                    kind: 'users',
                    id: 'ekjnekjnfkej',
                    method: undefined,
                    format: undefined
                },
                splats: []
            },
            '/transitive/users/ekjnekjnfkej/update': {
                action: noop,
                params: {
                    kind: 'users',
                    id: 'ekjnekjnfkej',
                    method: 'update',
                    format: undefined
                },
                splats: []
            },
            '/transitive/users/ekjnekjnfkej/update.json': {
                action: noop,
                params: {
                    kind: 'users',
                    id: 'ekjnekjnfkej',
                    method: 'update',
                    format: 'json'
                },
                splats: []
            }
        },
        testNoMatch: ['/transitive/kind/', '/transitive/']
    },
    {
        path: /^\/(\d{2,3}-\d{2,3}-\d{4})\.(\w*)$/,
        testMatch: {
            '/123-22-1234.json': {
                action: noop,
                params: {},
                splats: ['123-22-1234', 'json']
            }
        },
        testNoMatch: ['/123-1-1234.png', '/123-22-1234', '/123.png']
    },
    {
        path: '/cat/*',
        testMatch: {
            '/cat/foo': {
                action: noop,
                params: {},
                splats: ['foo']
            }
        }
    },
    {
        path: '*://*example.com/:foo/*/:bar',
        testMatch: {
            'http://www.example.com/the/best/test': {
                action: noop,
                params: {
                    foo: 'the',
                    bar: 'test'
                },
                splats: ['http', 'www.', 'best']
            }
        }
    },
    {
        path: '*://*example.com/:foo/*/:bar',
        testMatch: {
            'http://example.com/the/best/test': {
                action: noop,
                params: {
                    foo: 'the',
                    bar: 'test'
                },
                splats: ['http', '', 'best']
            }
        }
    },
    {
        path: '/:id([1-9]\\d*)d',
        testMatch: {
            '/1d': {
                action: noop,
                params: {
                    id: '1'
                },
                splats: []
            },
            '/123d': {
                action: noop,
                params: {
                    id: '123'
                },
                splats: []
            }
        },
        testNoMatch: ['/0d', '/0123d', '/d1d', '/123asd']
    },
    {
        path: '/a:test(a.*z)z',
        testMatch: {
            '/aabcdzz': {
                action: noop,
                params: {
                    test: 'abcdz'
                },
                splats: []
            }
        },
        testNoMatch: ['/abcdz', '/aaaz', '/azzz', '/az']
    }
]

// load routes
for (const caseIdx in cases) {
    const test = cases[caseIdx]
    router.addRoute(test.path, noop)
}

let assertCount = 0

// run tests
for (const caseIdx in cases) {
    const test = cases[caseIdx]

    for (const path in test.testMatch) {
        const match = router.match(path)
        const fixture = test.testMatch[path]

        // save typing in fixtures
        // match gets string, so ensure same type
        fixture.route = test.path.toString()
        if (match) {
            delete match.next  // next shouldn't be compared
            delete match.index
        }
        assert.deepEqual(match, fixture)
        assertCount++
    }

    let noMatchIdx
    for (noMatchIdx in test.testNoMatch) {
        const match = router.match((test.testNoMatch || {})[noMatchIdx])
        assert.strictEqual(match, null)
        assertCount++
    }
}

// test next
router.addRoute('/*?', noop)
router.addRoute('/next/x', noop)
const match = router.match('/next/x')
assert.equal(typeof match!.next, 'function')
assert.strictEqual(match!.route, '/*?')
assertCount++
const next = (match as { next }).next()
assert.strictEqual(next.route, '/next/x')
assertCount++

console.log(assertCount.toString() + ' assertions made succesfully')
