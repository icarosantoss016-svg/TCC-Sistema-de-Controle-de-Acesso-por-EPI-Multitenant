<script setup>
import { computed } from 'vue'

const props=defineProps({
    variant:{
        type:String,
        default:'primary'
    }
})
const classesVariante = computed(()=>{
    return props.variant === 'primary' ? 'bg-accent hover:bg-accent-hover active:bg-accent-press text-white' : 'bg-bg-2 hover:bg-bg3 text-text-1'
})
</script>
<template>
    <button 
    :class="classesVariante"
    class="h-11 px-4 rounded-md text-body font-medium transition-colors">
    <slot />
    </button>

</template>