const { getDefaultConfig } = require("expo/metro-config")

const config = getDefaultConfig(__dirname)

config.resolver.unstable_enablePackageExports = true

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "react-async-hook") {
    return {
      type: "sourceFile",
      filePath: require.resolve("react-async-hook/dist/index.js"),
    }
  }

  if (moduleName === "jotai" || moduleName.startsWith("jotai/")) {
    return {
      type: "sourceFile",
      filePath: require.resolve(moduleName),
    }
  }

  return context.resolveRequest(context, moduleName, platform)
}

module.exports = config
