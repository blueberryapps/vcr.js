# VCR.js [![CircleCI](https://circleci.com/gh/blueberryapps/vcr.js.svg?style=svg)](https://circleci.com/gh/blueberryapps/vcr.js) [![Dependency Status](https://dependencyci.com/github/blueberryapps/vcr.js/badge)](https://dependencyci.com/github/blueberryapps/vcr.js)

Mock server with Proxy and Record support inspired by ruby VCR.

## tl;dr
```
yarn add vcr.js
mkdir -p fixtures/users
echo '{"users": ["Tim", "Tom"]}' > ./fixtures/users/GET.default.json
yarn vcr -- -f ./fixtures
```
Now you can hit localhost:8100/users and get your JSON!

## Terminal options

Use `--help` to get all the possible options:
```
yarn vcr -- --help
```

Output:
```
yarn vcr -- --fixturesDir [./fixtures]

Options:
  -h, --help         Show help                                         [boolean]
  -f, --fixturesDir  Directory where to load fixtures    [default: "./fixtures"]
  -p, --proxy        URL to real API
  -r, --record       Record proxied responses to fixtures dir          [boolean]
  --port                                                         [default: 8100]

Examples:
  -f ./fixtures -p https://ur.l/base -r  Load fixtures from directory, proxy not
                                         found fixtures to ur.l/base and success
                                         responses record back to fixtures
                                         directory
```

## Resolving fixtures
When you hit the VCR.js server with a URL (e.g. `GET http://localhost:8100/api/v1/users`),
the URL is translated to the path of the fixture file, consisting of a relative path to a directory and a file name,
in this case `{fixturesDir}/api/v1/users/GET.default.(json|js)`.

In general form:
```
{fixturesDir}/{endpointPath}/{method}.{variant}.(json|js)
```

With url query parameters (in variant name params must be sorted alphabetically, also encoded by `encodeURIComponent`):
```
{fixturesDir}/{endpointPath}/{method}.param1=value&param2=value.(json|js)
```

### Example:

When accessing `http://localhost:8100/api/v1/users?page=1&limit=10` it will ty to look for fixture:

```
{fixturesDir}/{endpointPath}/GET.limit=10&page=1.(json|js)
```

### Dynamic route params
To match an endpoint with dynamic params, use `{dynamicParam}` as the directory name.
If you would like to get the same response from both `GET /users/1` and `GET /users/42`,
create a file with the name `{fixturesDir}/users/{id}/GET.default.json` and you can reuse your fixture file for all users!
As a bonus you can access these params in fixtures and customize the response by using a `.js` fixture (described below).

### Custom responses of a single endpoint - Variants
What if you wanted to customize the response of a single endpoint?
Just set a `variants` cookies with a list of desired variants separated by comma as the value, e.g.
`/api/v1/users/{id}/GET.variantName,/api/v1/projects/POST.otherVariant`
Stub server will find the corresponding cookie variant matching the request path and provide you with the correct fixture.

or you can also visit `/variants` in browsers and use `/variants?add=XXX` to add multiple variants to existing setup, `/variants?set=XXX` to override variants and set given values, `/variants?clear=t` to remove all variants from cookie

### What fixture types are handled?
Currently supported fixture types are `.json` and `.js`. JS fixtures are basically handlers as you know them from expressjs/node.
A simple template for a `.js` fixture:
```
module.exports = (req, res, next) => {
  res.status(400).json({error: 'Bad request :D'});
};
```

## Proxy mode - fixture recording
If you specify a `-p` or `--proxy` URL, the stub server will look for local fixtures and if no fixture is found,
it will proxy the request to the 'real API', streaming the response back and **optionally** saving it as a fixture.

### Proxy + record mode
Together with `proxy` option you can add `-r` or `--record`. This will enable saving fixtures from a proxy locally on the disc.
For example after running `yarn vcr -- -f ./fixtures -p https://ap.io/ -r` with an empty fixtures folder and hitting `GET /users`,
response from `https://ap.io/users` is streamed to the client and is also saved in `fixtures/users/GET.default.json`.

### Custom variants for recording
If you want to save fixtures from proxy under a custom variant, just set the `record_fixture_variant` cookie with any word you want as the value.
With the `record_fixture_variant=blacklistedUser` cookie the recorded fixtures will be saved as `{path}/GET.blacklistedUser.json`.

## Development

```console
yarn test
yarn tslint
yarn start
```

## Made with love by
[![](https://camo.githubusercontent.com/d88ee6842f3ff2be96d11488aa0d878793aa67cd/68747470733a2f2f7777772e676f6f676c652e636f6d2f612f626c75656265727279617070732e636f6d2f696d616765732f6c6f676f2e676966)](https://www.blueberry.io)
