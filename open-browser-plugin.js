var open = require('open');

class OpenBrowserPlugin {
    constructor(options = {}) {
        options || (options = {});
        this.url = options.url || 'http://localhost:8080';
        this.delay = options.delay || 0;
        this.browser = options.browser;
        this.ignoreErrors = options.ignoreErrors;
    }

    apply(compiler) {
        var isWatching = false;
        var url = this.url;
        var delay = this.delay;
        var browser = this.browser;
        var ignoreErrors = this.ignoreErrors;
        var executeOpen = this.once(function() {
          setTimeout(function () {
            open(url, browser, function(err) {
              if (err) throw err;
            });
          }, delay);
        })

      
        compiler.hooks.done.tap('open-brower-plugin', (stats) => {
            executeOpen();
        });
      };

    once(fn) {
        var called = false;
        return function() {
          if (!called) {
            called = true;
            fn.apply(this, arguments);
          }
        }
    }
}

module.exports = OpenBrowserPlugin;
