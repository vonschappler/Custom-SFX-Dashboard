<template>
    <form class="create-twoot" @submit.prevent="createNewTwoot" :class="{'exceeded': newTwootCharacterCount > 180}">
        <label for="newTwoot"><b>New Twoot:</b>  ({{ newTwootCharacterCount }} /180)</label>
        <textarea name="" id="newTwoot" rows="4" v-model="state.newTwootContent"/>
        <div class="create-twoot-functions">
            <div class="create-twoot-type" >
            <label for="newTwootType"><b>Type:</b></label>
            <select id="newTwootType" v-model="state.newTwootType">
                <option :value="option.value" v-for="(option, index) in state.twootTypes" :key='index'>
                {{ option.name }}
                </option>
            </select>
        </div>
    <button>
    Twoot!
    </button>
        </div>
        
</form>
</template>

<script>
import { reactive, computed } from 'vue'
export default {
    name: "CreateNewTwoot",
    setup(props, ctx) {
        const state = reactive( {
            newTwootContent: '',
            newTwootType: 'instant',
            twootTypes: [
                {value: 'draft', name: 'Save as draft'},
                {value: 'instant', name: "Instant Twoot"}
            ]
        })

        const newTwootCharacterCount = computed(() => state.newTwootContent.length)
        
        function createNewTwoot() {
            if (state.newTwootContent && state.newTwootType !== "draft") {
                ctx.emit('add-twoot', state.newTwootContent)
                state.newTwootContent = ""
            }
            
        }

        return {
            state,
            newTwootCharacterCount,
            createNewTwoot
        }
    }
}
</script>

<style lang="scss" scoped>
.create-twoot {
    display: flex;
    flex-direction: column;
    border-top: 1px solid #16b2ab;
    padding-top: 1em;
    color: #ffffff;

    .create-twoot-functions{
        display: grid;
        flex-direction: column;
        grid-template-columns: 1fr 1fr;
        padding-top: 1.0rem;
        
        .create-twoot-type {
           select {
            margin-left: 0.5em
            }
        }

        &.exceeded {
            color: red;
        }

        button {
            margin-left: 5rem;
            max-width: 5rem;
            border-radius: 5px;
            border: none;
            background-color: #16b2ab;
            color: #ffffff;
            transition: all 0.25s, ease;
            font-weight: bold;

            &:hover {
                background-color: #ffffff;
                color: #1b1c1d;
                transform: scale(1.02, 1.02)

                
            }
        }
    }
  }
</style>