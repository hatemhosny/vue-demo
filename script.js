(() => {
let app = document.querySelector("#app") || document.body.appendChild(document.createElement('div'));

/* <!-- */
let content = `<template>
  <div class="container">
    <h1>Hello, Vue!</h1>
    <img class="logo" src="http://127.0.0.1:8080/livecodes/assets/templates/vue.svg" />
    <p>You clicked {{ counter }} times.</p>
    <button v-on:click="increment">Click me</button>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        counter: 0,
        align: 'center',
      };
    },
    methods: {
      increment() {
        this.counter += 1;
      },
    },
  };
<\/script>

<style scoped>
  .container,
  .container button {
    text-align: v-bind('align');
    font: 1em sans-serif;
  }
  .logo {
    width: 150px;
  }
</style>
`;
/* --> */
const options = {
  moduleCache: {
    vue: Vue,
  },
  pathResolve({ refPath, relPath }) {
    if ( relPath === '.' ) {
      return refPath;
    }
    if ( relPath.startsWith('http') || relPath === 'vue' ) {
      return relPath;
    }
    // relPath is a module name ?
    if ( relPath[0] !== '.' && relPath[0] !== '/' ) {
      const importMapScript = document.querySelector('script[type="importmap"]')?.innerHTML.trim();
      if (importMapScript) {
        try {
          const importMap = JSON.parse(importMapScript);
          if (importMap?.imports?.[relPath]) {
            return importMap.imports[relPath];
          }
        } catch {}
      }
      return 'https://cdn.skypack.dev/' + relPath;
    }

    return refPath === undefined || !refPath.startsWith('http') ? relPath : String(new URL(relPath, refPath));
  },
  async getFile(url) {
    if (url === '/component.vue') return content;
    const res = await fetch(url);
    if ( !res.ok )
      throw Object.assign(new Error(res.statusText + ' ' + url), { res });
    return await res.text();
  },
  loadModule(path, options) {
    if ( path === 'vue' ) return Vue;
    if ( path.endsWith('.vue') || path.endsWith('.css') || path.endsWith('.scss') ) return;
    if ( !['http://', 'https://'].some(x => path.startsWith(x)) ) return;
    return import(path).catch(() => import(path + '.js'));
  },
  handleModule: async function (type, getContentData, path, options) {
    switch (type) {
      case '.css':
        options.addStyle(await getContentData(false));
        return null;
    }
  },
  addStyle: (textContent) => {
    const style = Object.assign(document.createElement('style'), { textContent });
    const ref = document.head.getElementsByTagName('style')[0] || null;
    document.head.insertBefore(style, ref);
  },
};

const { loadModule } = window['vue3-sfc-loader'];
const App = Vue.createApp(Vue.defineAsyncComponent(() => loadModule('/component.vue', options)));
App.mount(app)
App.config.devtools = true;
})();
