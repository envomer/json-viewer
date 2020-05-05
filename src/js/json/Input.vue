<template>
<div>
    <div id="input-container">
        <textarea id="input-textarea" v-model="text" @input="onInput" autofocus placeholder="Put your json string here..."></textarea>
    </div>
</div>
</template>



<script>

let computed = {};

computed.output = function() {
    return this.input;
}

let model = {
    prop: 'value',
    event: 'change'
};

let data = function() {
    return {
        text: null
    }
}

let mounted = function() {
    if(this.value) {
        this.text = this.value;
    }
}

let methods = {};

methods.onInput = function() {
    // TODO throttle
    this.$emit('change', this.text);
}

let props = {
    value: null
}


export default {
    data,
    props,
    methods,
    model,
    computed,
    mounted,
}
</script>