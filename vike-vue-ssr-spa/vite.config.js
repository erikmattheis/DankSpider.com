import vue from '@vitejs/plugin-vue';
import vike from 'vike/plugin';
const config = {
    plugins: [
        vike({ prerender: true }),
        vue({
            include: [/\.vue$/, /\.md$/]
        })
    ]
};
export default config;
