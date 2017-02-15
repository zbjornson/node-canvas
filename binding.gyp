{
    'variables':
    {
        'has_cairo%': '<!(node ./util/has_lib.js cairo)'
    },
    'conditions':
    [
        ['has_cairo=="true" or OS=="win"',
        {
            'includes': ['shared.gyp']
        },
        {
            'includes': ['static.gyp']
        }]
    ]
}
