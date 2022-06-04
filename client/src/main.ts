import {createApp} from 'vue'
import App from './App.vue'
import GameRoom from './components/pages/GameRoom.vue'
import HelloWorld from './components/pages/Home.vue'
import {createRouter, createWebHistory} from 'vue-router'
import './index.css'
import VueSocketIOExt from 'vue-socket.io-extended'; // -> https://github.com/probil/vue-socket.io-extended
import io from 'socket.io-client';

//FontAwesome
import {library} from '@fortawesome/fontawesome-svg-core'
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'

import {faHand, faHandBackFist, faHandScissors, faHome, faLink} from '@fortawesome/free-solid-svg-icons'

library.add(faLink)
library.add(faHome)
library.add(faHandScissors)
library.add(faHand)
library.add(faHandBackFist)

// VueRouter
const routes = [
    {path: '/game/:room', name: 'Game', component: GameRoom, props: true},
    {path: '/', name: 'Home', component: HelloWorld, props: true},
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

const socket = io('localhost:3001');

createApp(App)
    .component("fa-icon", FontAwesomeIcon)
    .use(router)
    .use(VueSocketIOExt, socket)
    .mount('#app')
