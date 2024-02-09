import assert from 'assert'
import http from 'http'
import Routes from '../src/index.js'
const router = new Routes()

router.addRoute('/*?', staticFiles)
router.addRoute('/admin/*?', auth)
router.addRoute('/admin/users?*', adminUsers)
router.addRoute('/*', notFound)

http.createServer(function (req, res) {
    if (!req.url) return
    let path
    try {
        path = new URL(req.url).pathname
    } catch (err) {
        path = req.url
    }
    const match = router.match(path)

    function wrapNext (next) {
        return function () {
            const match = next()
            match.action(req, res, wrapNext(match.next))
        }
    }

    match!.action!(req, res, wrapNext(match!.next))
}).listen(1337, runTests)

// serve the file or pass it on
function staticFiles (req, res, next) {
    let qs
    try {
        qs = new URL(req.url).searchParams
    } catch (err) {
        qs = new URL('http://example.com/' + req.url).searchParams
    }

    if (qs.get('img')) {
        res.statusCode = 304
        res.end()
    } else {
        res.setHeader('x-static', 'next')
        next()
    }
}

// authenticate the user and pass them on
// or 403 them
function auth (req, res, next) {
    let qs
    try {
        qs = new URL(req.url).searchParams
    } catch (err) {
        qs = new URL('http://example.com/' + req.url).searchParams
    }

    if (qs.get('user')) {
        res.setHeader('x-auth', 'next')
        return next()
    }
    res.statusCode = 403
    res.end()
}

// render the admin.users page
function adminUsers (_, res) {
    res.statusCode = 200
    res.end()
}

function notFound (_, res) {
    res.statusCode = 404
    return res.end()
}

function httpError (err) {
    console.error('An error occurred:', err)
    tryClose()
}

function runTests () {
    http.get('http://localhost:1337/?img=1', function (res) {
        console.log('Match /*? and return 304')
        assert.equal(res.statusCode, 304)
        assert.notEqual(res.headers['x-static'], 'next')
        tryClose()
    }).on('error', httpError)

    http.get('http://localhost:1337/admin/users', function (res) {
        console.log('Match /admin/* and return 403')
        assert.equal(res.statusCode, 403)
        assert.equal(res.headers['x-static'], 'next')
        tryClose()
    }).on('error', httpError)

    http.get('http://localhost:1337/admin/users?user=1', function (res) {
        console.log('Match /admin/users and return 200')
        assert.equal(res.statusCode, 200)
        assert.equal(res.headers['x-static'], 'next')
        assert.equal(res.headers['x-auth'], 'next')
        tryClose()
    }).on('error', httpError)

    http.get('http://localhost:1337/something-else', function (res) {
        console.log('Match /*? but not an image and return 404')
        assert.equal(res.statusCode, 404)
        assert.equal(res.headers['x-static'], 'next')
        tryClose()
    }).on('error', httpError)
}

let waitingFor = 4
function tryClose () {
    waitingFor--
    if (!waitingFor) {
        process.exit()
    }
}
