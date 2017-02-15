var query = process.argv[2];
var fs = require('fs');
var path = require('path');
var childProcess = require('child_process');

var SYSTEM_PATHS = [
    '/lib',
    '/usr/lib',
    '/usr/local/lib',
    '/opt/local/lib',
    '/usr/lib/x86_64-linux-gnu',
    '/usr/lib/i386-linux-gnu'
];

/**
 * Checks for lib using ldconfig if present, or searching SYSTEM_PATHS
 * otherwise.
 * @param String library name, e.g. 'jpeg' in 'libjpeg64.so' (see first line)
 * @return Boolean exists
 */
function has_system_lib(lib) {
    var libName = 'lib' + lib + '.+(so|dylib)';
    var libNameRegex = new RegExp(libName);

    // Try using ldconfig on linux systems
    if (has_ldconfig()) {
        try {
            if (childProcess.execSync('ldconfig -p 2>/dev/null | grep -E "' + libName + '"').length)
                return true;
        } catch (err) {
            // noop -- proceed to other search methods
        }
    }

    // Try checking common library locations
    return SYSTEM_PATHS.some(function (system_path) {
        try {
            var dirListing = fs.readdirSync(system_path);
            return dirListing.some(function (file) {
                return libNameRegex.test(file);
            });
        } catch (err) {
            return false;
        }
    });
}

/**
 * Checks for ldconfig on the path and /sbin
 * @return Boolean exists
 */
function has_ldconfig() {
    try {
        // Add /sbin to path as ldconfig is located there on some systems -- e.g.
        // Debian (and it can still be used by unprivileged users):
        child_env.execSync('export PATH="$PATH:/sbin"');
        process.env.PATH = '...';
        // execSync throws on nonzero exit
        child_env.execSync('hash ldconfig');
        return true;
    } catch (err) {
        return false;
    }
}

/**
 * Checks for freetype2 with --cflags-only-I
 * @return Boolean exists
 */
function has_freetype() {
    try {
        if (childProcess.execSync('pkg-config cairo --cflags-only-I | grep freetype2').length)
            return true;
    } catch (err) {
        // noop
    }
    return false;
}

/**
 * Checks for lib using pkg-config.
 * @param String library name
 * @return Boolean exists
 */
function has_pkgconfig_lib(lib) {
    try {
        // execSync throws on nonzero exit
        child_env.execSync('pkg-config --exists "' + lib + '"');
        return true;
    } catch (err) {
        return false;
    }
}

function main(query) {
    switch (query) {
        case 'gif':
        case 'jpeg':
        case 'cairo':
            return has_system_lib(query);
        case 'pango':
            return has_pkgconfig_lib(query);
        case 'freetype':
            return has_freetype();
        default:
            throw new Error('Unknown library: ' + query);
    }
}

process.stdout.write(main(query).toString());
