import copy from 'rollup-plugin-copy';

export default [
    {
      input: "./src/index.js",
      output: {
        file: "./dist/index.js",
        format: "umd",
        name: "mistreevous"
      },
      plugins: [
        copy({
          targets: [
            { src: 'src/index.d.ts', dest: 'dist' }
          ]
        })
      ]
    }
  ];