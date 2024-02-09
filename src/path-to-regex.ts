function pathToRegExp (path, keys) {
    path = path
        .concat('/?')
        .replace(/\/\(/g, '(?:/')
        .replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?|\*/g, tweak)
        .replace(/([/.])/g, '\\$1')
        .replace(/\*/g, '(.*)')

    return new RegExp('^' + path + '$', 'i')

    function tweak (match, slash, format, key, capture, optional) {
        if (match === '*') {
            keys.push(undefined)
            return match
        }

        keys.push(key)

        slash = slash || ''

        return '' +
      (optional ? '' : slash) +
      '(?:' +
      (optional ? slash : '') +
      (format || '') +
      (capture ? capture.replace(/\*/g, '{0,}').replace(/\./g, '[\\s\\S]') : '([^/]+?)') +
      ')' +
      (optional || '')
    }
}

export { pathToRegExp }
export default pathToRegExp
