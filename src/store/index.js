import Vue from 'vue'
import Vuex from 'vuex'
import {state} from './states'
import {mutations} from './mutations'
import {actions} from './actions'
import {getters} from './getters'
import {moduleA} from './modules'

Vue.use(Vuex);

const store = new Vuex.Store({
    state,
    mutations,
    actions,
    getters,
    modules:{
        moduleA
    }
});

export default store