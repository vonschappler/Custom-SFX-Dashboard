<template>
    <div class="twoot-item">
        <div class="user-profile_twoot">
            <div class="twoot-item__user">
                @{{ username }} posted:
            </div>
            <div class="twoot-item__content">
                {{ twoot.content }}
            </div>
        </div>
    </div>
    
</template>

<script>
export default {
    name: "TwootItem",
    props: {
        username: {
            type: String,
            required: true
        },
        twoot: {
            type: Object,
            required: true
        }
    },
    setup(props) {
        return {
            props
        }
    }
}
</script>

<style lang="scss" scoped>
.twoot-item {
    margin-right: 1rem;
    padding: 20px;
    margin-bottom: 1.0rem;
    margin-right: 2.0rem;
    background-color: #1b1c1d;
    border-radius: 5px;
    border: 1px solid #dfe3e8;
    font-family: "Sansation";
    width: auto;
    color: #ffffff;
    transition: all 0.25s, ease;
    cursor: pointer;

    &:hover {
        transform: scale(1.02, 1.02)
    }
}
</style>