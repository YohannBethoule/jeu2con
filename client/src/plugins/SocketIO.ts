import io from 'socket.io-client';
import {App} from "vue";

export default {
    install: (app: App, options: { url: string }) => {
        app.config.globalProperties.$socket = io(options.url);
    }
}
