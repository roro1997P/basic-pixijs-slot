module.exports = function(env) {
  return require(`./webpack.${env.webpackFile}.js`)
}