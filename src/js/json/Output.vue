<template>
<div>
    <div id="output-container">
        <div class="header">
            <div class="pure-g">
                <div class="pure-u-1-3">
                    <div class="btn-group">
                        <button class="btn btn-sm" disabled>Indent</button>
                        <button class="btn btn-sm" @click="tabSize = 0">Compact</button>
                        <button class="btn btn-sm" 
                            v-for="i in 5" 
                            :key="i" 
                            v-text="i"
                            :class="{active: i == tabSize}"
                            @click="tabSize = i"></button>
                    </div>
                </div>
                <div class="pure-u-1-3 text-center">
                    <span v-show="output">
                        <div class="btn-group">
                            <button class="btn btn-sm">JSON</button>
                            <button class="btn btn-sm" v-text="valid ? 'valid' : 'invalid'" :class="{success: valid, danger: !valid}"></button>
                        </div>
                    </span>
                </div>
                <div class="pure-u-1-3 text-right">
                    <transition name="fade">
                        <button class="btn btn-sm btn-success" v-show="copied">Copied</button>
                    </transition>
                    <button :disabled="!output || output == ''" class="btn btn-default btn-sm" @click="copy">Copy to clipboard</button>
                </div>
            </div>
        </div>
        <div id="output-wrapper">
            <pre><code id="output-code" v-html="output"></code></pre>
        </div>
    </div>
</div>
</template>



<script>

let computed = {};

computed.output = function() {
    let data = this.input;
    
    try {
        data = JSON.parse(data);
        data = JSON.stringify(data, '', this.tabSize);
        data = Prism.highlight(data, Prism.languages.json);
        this.valid = true;
    } catch(err) {
        this.valid = false;
    }

    return data;
}

let data = function() {
    return {
        tabSize: 2,
        valid: true,
        copied: false
    }
};

let methods = {};

methods.copy = function() {
    let self = this;
    Str.copyToClipboard('output-code');
    self.copied = true;

    setTimeout(() => {
        self.copied = false;
    }, 1000);
};

let mounted = function() {
    // Prism.highlight(code, Prism.languages.javascript);
    // setTimeout(() => {
    //     Prism.highlightElement()
    // }, 4000)
}

let props = {
    input: null
}

class Str {
    static copyToClipboard(id) {
        let elem = document.getElementById(id);
        // create hidden text element, if it doesn't already exist
        let targetId = '_hiddenCopyText_';
        let isInput = elem.tagName === 'INPUT' || elem.tagName === 'TEXTAREA';
        let origSelectionStart, origSelectionEnd;
        let target = null;
        if (isInput && elem.offsetParent) {
            // can just use the original source element for the selection and copy
            target = elem;
            origSelectionStart = elem.selectionStart;
            origSelectionEnd = elem.selectionEnd;
        } else {
            // must use a temporary form element for the selection and copy
            target = document.getElementById(targetId);
            if (!target) {
                target = document.createElement('textarea');
                target.style.position = 'absolute';
                target.style.left = '-9999px';
                target.style.top = '0';
                target.id = targetId;
                document.body.appendChild(target);
            }
            target.textContent = elem.textContent.trim();
        }
        // select the content
        let currentFocus = document.activeElement;
        target.focus();
        target.setSelectionRange(0, target.value.length);
        // copy the selection
        let succeed;
        try {
            succeed = document.execCommand('copy');
        } catch(e) {
            succeed = false;
        }
        // restore original focus
        if (currentFocus && typeof currentFocus.focus === 'function') {
            currentFocus.focus();
        }
        if (isInput && elem.offsetParent) {
            // restore prior selection
            elem.setSelectionRange(origSelectionStart, origSelectionEnd);
        } else {
            // clear temporary content
            target.textContent = '';
        }
        return succeed;
    }
}


export default {
    data, 
    computed,
    props,
    methods
}
</script>