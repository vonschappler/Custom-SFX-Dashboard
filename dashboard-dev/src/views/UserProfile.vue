<template>
  <div class='user-profile'>
    <div class="user-profile__user-panel">
        <h1 class="user-profile__username">@{{state.user.username}}</h1>
        <div class="user-profile__admin" v-if="state.user.isAdmin">
          <b>Admin</b>
        </div>
        <div class="user-profile__follower-count">
            <strong>Followers:</strong> {{ state.followers }}
        </div>
        <CreateNewTwoot @add-twoot="addTwoot"/>
    </div>
    <div class="user-profile__twoots-wrapper">
      <TwootItem 
        v-for="twoot in state.user.twoots"
        :key="twoot.id"
        :username="state.user.username"
        :twoot="twoot"
      />
    </div>
  </div>
</template>

<script>
import { reactive, computed } from "vue"
import { useRoute } from "vue-router"
import { users } from "@/assets/users"
import TwootItem from "@/components/TwootItem"
import CreateNewTwoot from "@/components/CreateNewTwoot"

export default {
  name: 'UserProfile',
  components: {
    TwootItem,
    CreateNewTwoot
  },
  setup() {
    const route = useRoute()
    const userId = computed(() => route.params.userId)

    const state = reactive({
      followers: 0,
      user: users[userId.value -1] || users[0]
    })

    function addTwoot(twoot) {
      state.user.twoots.unshift( {
        id: state.user.twoots.length + 1,
        content: twoot
      })
    }

    return {
      state,
      addTwoot,
      userId
    }
  }
}
</script>

<style lang="scss" scoped>
.user-profile {
  display: grid;
  grid-template-columns: 1fr 3fr;
  width: 100%;
  padding-top: 1.5em;
  padding-bottom: 1.5em;
  margin-right: 1.5rem;
  margin-left: 1rem;

  .user-profile__user-panel {
    display: flex;
    flex-direction: column;
    margin-right: 50px;
    padding: 0px 20px 20px 20px;
    background-color: #1b1c1d;
    border-radius: 5px;
    border: 1px solid #ffffff;
    font-family: "Sansation";
    min-width: 20rem;
    color: #ffffff;
    max-height: 16.5em;
  }

  .user-profile__admin {
    background-color: #16b2ab;
    margin-top: -1.2rem;
    margin-bottom: 0.3rem;
    padding: 0.3rem 0.3rem 0.3rem 0.3rem;
    font-size: 0.85em;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #1b1c1d;
    border-radius: 3px;
    max-width: 3.5rem;
    margin-right: auto;
  }
}
</style>