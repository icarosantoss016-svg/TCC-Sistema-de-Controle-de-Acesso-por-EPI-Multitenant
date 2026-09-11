<script setup>
import{ref, computed} from 'vue'
import {Eye, EyeOff} from 'lucide-vue-next'

const props = defineProps({
    modelValue:String,
    label:String,
    type:{
        type:String,
        default:'text'
    },
    placeholder:String,
    icon:[Object,Function]
})
 const emit = defineEmits(['update:modelValue'])

 const mostrarSenha= ref(false)

const tipoReal = computed(()=>{
    if(props.type !=='password'){
        return props.type
    }
return mostrarSenha.value ? 'text' : 'password'
})
</script>

<template>
    <label v-if="label" class="block text-caption font-medium text-text-2 mb-1.5">
        {{ label }}
    </label>

    <div class="relative">
        <component
            :is="icon"
            v-if="icon"
            class="w-4 h-4 text-text-3 absolute left-3 top-1/2 -translate-y-1/2"
        />

        <input
            :value="modelValue"
            @input="emit('update:modelValue',$event.target.value)"
            :type="tipoReal"
            :placeholder="placeholder"
            :class="icon ? 'pl-9' : 'pl-3'"
            class="w-full h-11 pr-3 rounded-md bg-bg-2 border border-transparent text-body text-text-0 focus:border-accent focus:bg-bg-0 outline-none transition-colors"
        />

        <button
            v-if="type==='password'"
            type="button"
            @click="mostrarSenha=!mostrarSenha"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-text-3 hover:text-text-1"
        >
            <component :is="mostrarSenha ? EyeOff:Eye" class="w-4 h-4"/>
    </button>
    </div>
</template>

