<template>
<div class="pure-g">
    <json-input class="pure-u-1-3" v-model="input" />
    <json-output class="pure-u-2-3" :input="input" />

</div>
</template>



<script>

let data = function() {
    return {
        input: ``
    }
}

let components = {
    jsonInput: require('./Input.vue'),
    jsonOutput: require('./Output.vue'),
}


export default {
    data,
    components
}
</script>