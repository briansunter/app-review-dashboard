import svelte from 'rollup-plugin-svelte';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';
import postcss from 'rollup-plugin-postcss';
// import visualizer from 'rollup-plugin-visualizer';
import serve from 'rollup-plugin-serve';

const production = !process.env.ROLLUP_WATCH;
function onwarn (warning, warn) {
  if (warning.code === 'CIRCULAR_DEPENDENCY') return;
  warn(warning);
}

export default {
  input: 'src/main.js',
  output: {
    sourcemap: true,
    format: 'iife',
    name: 'app',
    file: 'public/bundle.js'
  },
  plugins: [
    svelte({
      dev: !production,
      css: css => {
        css.write('public/bundle.css');
      }
    }),

    postcss({
      extensions: ['.css'],
      extract: 'public/vendor.css',
      minimize: production,
    }),

    resolve(),
    commonjs(),

    // !production && livereload('public'),
    !production && serve({contentBase:'public',   historyApiFallback: true,
}),
    production && terser()
  ],
  watch: {
    clearScreen: false
  }
};
