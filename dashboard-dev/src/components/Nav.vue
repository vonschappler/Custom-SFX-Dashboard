<template>
    <div class="nav">
        <router-link to="/">
            <div class="appName">
                Twooter
            </div>
        </router-link>
        
        <div class="userName" v-if="user">
            {{ user.username }}
        </div>
    </div>
</template>

<script>
import { useStore } from 'vuex'
import { computed } from 'vue'
export default {
    name: "Nav",
    setup() {
        const store = useStore()
        const user = computed(() => store.state.User.user)

        return {
            user
        }
    }
}

</script>


<style lang="scss" scoped>
.nav {
    background-color: #16b2ab;
    grid-template-columns: 3fr 1fr;
    display: grid;
    flex-direction: column;
    padding-right: 2rem;
    padding-left: 2rem;
    padding-top: 1rem;
    padding-bottom: 1rem;
    a {
            color: #ffffff;
            text-decoration: none;
            
    }
    
    .appName {
        font-family: "Sansation";
        font-size: 2em;
        font-weight: bold;
        
    }
    .userName {
        font-family: "Sansation";
        font-size: 2em;
        font-weight: bold;
        color: #ffffff;
        text-align: right;
    }
}
</style>