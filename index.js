const async = require('async')
const semver = require('semver')
const RegistryClient = require('npm-registry-client')
const client = new RegistryClient()

/**
Try to parse `timestamp` as a Date.
Throws if a valid Date cannot be parsed.
*/
function parseDate(timestamp) {
  const date = new Date(timestamp)
  if (isNaN(date)) {
    throw new Error(`Could not parse timestamp: "${timestamp}"`)
  }
  return date
}

/**
Get details from the standard NPM registry for the package named `name`.

name: String
callback: (error: Error, packageData: Object) => void
*/
function getPackage(name, callback) {
  const params = {timeout: 10000, staleOk: true, fullMetadata: true}
  client.get(`https://registry.npmjs.org/${name}`, params, callback)
}

/**
Find the specific version of the best "semver" match for `name`@`versionRange`,
given the versions that were available at `maxTimestamp`

name: String
versionRange: String
maxTimestamp: String - parseable by `new Date(...)`
callback: (error: Error, maxVersion: String) => void
*/
function resolveDependency(name, versionRange, maxTimestamp, callback) {
  const maxDate = parseDate(maxTimestamp)
  getPackage(name, (error, {time}) => {
    if (error) {
      return callback(error)
    }
    // convert object of times
    const times = Object.entries(time).map(([version, timestamp]) => ({version, timestamp}))
    // remove times that did not exist before maxTimestamp
    const extantTimes = times.filter(({timestamp}) => {
      return new Date(timestamp) <= maxDate
    })
    // okay, we can forget about the timestamps, we just need the list of versions
    const extantVersions = extantTimes.map(({version}) => version)
    // filter out the times that aren't actually versions, like "created"
    // semver.valid actually takes two arguments, v and loose, not just one,
    // like the docs say. so we can't just filter over it, because the first
    // item will get a falsey loose, and all the others will get a truthy loose.
    const validExtantVersions = extantVersions.filter(version => semver.valid(version))
    // > semver.maxSatisfying(versions, range):
    // > Return the highest version in the list that satisfies the range,
    // > or null if none of them do.
    callback(null, semver.maxSatisfying(validExtantVersions, versionRange))
  })
}
exports.resolveDependency = resolveDependency

/**
Split each entry in nameSpecs into a (name, versionRange) pair, defaulting the
versionRange to '*', and run it through resolveDependency, printing the
resulting version.

nameSpecs: String[] - each of which is a string like 'pkg', 'pkg@*', 'pkg@1.0.0', etc.
timestamp: String - parseable by `new Date(...)`
callback: (error: Error, lines: String[]) => void
*/
function generateResolutionReports(nameSpecs, timestamp, callback) {
  async.map(nameSpecs, (nameSpec, callback) => {
    const [name, versionRange = '*'] = nameSpec.split('@')
    resolveDependency(name, versionRange, timestamp, (error, maxVersion) => {
      if (error) {
        return callback(error)
      }
      return callback(null, `${name}@${versionRange} resolved to "${maxVersion}" at ${timestamp}`)
    })
  }, callback)
}
exports.generateResolutionReports = generateResolutionReports

function createObject(kvs) {
    let object = Object.create(null)
    for (let [k, v] of kvs) {
      object[k] = v
    }
    return object
}

function pinDependencies(dependenciesObject, timestamp, callback) {
  async.map(Object.entries(dependenciesObject), ([name, versionRange], callback) => {
    resolveDependency(name, versionRange, timestamp, (error, maxVersion) => {
      return callback(error, [name, maxVersion])
    })
  }, (error, dependenciesPairs=[]) => {
    return callback(error, createObject(dependenciesPairs))
  })
}

const dependenciesObjectKeys = [
  'dependencies',
  'devDependencies',
  'peerDependencies',
  'bundledDependencies',
  'optionalDependencies',
]

/**
read all dependencies/devDependencies/peerDependencies from a package.json
*/
function pinConfig(configData, timestamp, callback) {
  async.reduce(dependenciesObjectKeys, configData, (configData, dependenciesObjectKey, callback) => {
    if (dependenciesObjectKey in configData) {
      pinDependencies(configData[dependenciesObjectKey], timestamp, (error, pinnedDependenciesObject) => {
        const partialPinnedConfigData = {[dependenciesObjectKey]: pinnedDependenciesObject}
        const pinnedConfigData = {...configData, ...partialPinnedConfigData}
        callback(error, pinnedConfigData)
      })
    }
    else {
      callback(null, configData)
    }
  }, callback)
}
exports.pinConfig = pinConfig
