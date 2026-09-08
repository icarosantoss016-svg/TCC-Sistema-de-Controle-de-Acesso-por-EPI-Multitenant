<script setup>
import { computed } from 'vue'

const props=defineProps({
    variant:{
        type:String,
        default:'primary'
    },
    iconOnly:{
        type:Boolean,
        default:false
    }
})
const classeForma = computed(()=>{
    return props.iconOnly ? 'w-8 h/ rounded-icon flex items-center justify-center' : 'h-11 px-4 rounded-md'
})

const classesCor = computed(() => {
  if (props.variant === 'primary') {
    return 'bg-accent hover:bg-accent-hover active:bg-accent-press text-white'
  }
  if (props.variant === 'danger') {
    return props.iconOnly
      ? 'bg-danger/12 hover:bg-danger/20 text-danger'
      : 'bg-danger hover:bg-danger/90 active:bg-danger/80 text-white'
  }
  return 'bg-bg-2 hover:bg-bg-3 text-text-1'
})

</script>
<template>
    <button 
    :class="[classeForma, classesCor,'font-medium transition-colors']">
    <slot />
    </button>

</template>