<template>
  <div class="home">
    <h1>Home</h1>
    <div class="user-list">
      <router-link v-for="(user, index) in users" :key="index" :to="{ name: 'UserProfile', params: {userId: user.id}}">
        {{ user.username}}
      </router-link>
    </div>
  </div>
</template>

<script>
import { users } from '@/assets/users'
export default {
  name: 'Home',
  setup() {
    return {
      users
    }
  }
}
</script>

<style lang="scss" scoped>
.home {
  padding-left: 50px;
  padding-right: 50px;
  font-family: "Sansation";

  .user-list {
  display: flex;
  flex-direction: column;

    a {
      text-decoration: none;
      color: inherit;
    }
  }
}
</style>
