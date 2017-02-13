# VCR.js [![CircleCI](https://circleci.com/gh/blueberryapps/vcr.js.svg?style=svg)](https://circleci.com/gh/blueberryapps/vcr.js)

Mock server with Proxy and Record support inspired by ruby VCR.

## tl;dr
```
yarn add vcr.js
mkdir fixtures
mkdir fixtures/users
echo '{"users": ["Tim", "Tom"]}' > ./fixtures/users/GET.default.json
yarn vcr -- -f ./fixtures
```
Now You can hit localhost:8100/users and get Your JSON!

## Full terminal usage

run help for getting all possible options:
```
yarn vcr -- --help
```
outputs:
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
When You hit the VCR.js server with some URL (e.g. `GET http://localhost:8100/api/v1/users`),
URL is resolved to path to fixture file, consisting of relative path to directory and file name,
in this case `{fixturesDir}/api/v1/users/GET.default.(json|js)`.

In common form:
```
{fixturesDir}/{endpointPath}/{method}.{variant}.(json|js)
```

### Dynamic route params
To match endpoint with dynamic params, use `{dynamicParam}` as directory name.
If You want to get the same response from `GET /users/1` and `GET /users/42`,
create file `{fixturesDir}/users/{id}/GET.default.json` and You can reuse Your fixture file for all users!
As a bonus You can have these params accessible in fixture and customize response with `.js` fixture (described below).


### Custom responses from single endpoint - Variants
What if You want to customize response from single endpoint?
Just set cookie `variants` to list of desired variants separated by comma, e.g.:
`/api/v1/users/{id}/GET.variantName,/api/v1/projects/POST.otherVariant`
Stub server will find cookie variant matching request path and provide You with correct fixture.

### What types of fixtures can be handeled?
Currently supported are `.json` and `.js` fixtures. JS fixtures are basically handlers as You know them from expressjs/node.
Simple template for `.js` fixture:
```
module.exports = (req, res, next) {
  res.status(400).json({error: 'Bad request :D'});
};
```

## Proxy mode - fixtures recording
If You specify `-p` or `--proxy` url, stub server will look for local fixtures and if no fixture is found,
it will proxy request to 'real API', streaming response back and **optionally** save response as fixture.

### Proxy + record mode
Together with `proxy` option you can add `-r` or `--record`. It will enable saving fixture from proxy on the disc.
e.g. after running `yarn vcr -- -f ./fixtures -p https://ap.io/ -r` with clear fixtures folder and hitting `GET /users`,
response from `https://ap.io/users` is streamed to client and also saved in `fixtures/users/GET.default.json`.

### Custom variants for recording
If You want to save fixtures from proxy under custom variant, just set cookie `record_fixture_variant` to any word You want.
With cookie `record_fixture_variant=blacklistedUser` proxy recorded fixtures will be saved as `{path}/GET.blacklistedUser.json`

## Development

```console
# tests
$ yarn test

# tslint
$ yarn tslint

# start
$ yarn start
```
