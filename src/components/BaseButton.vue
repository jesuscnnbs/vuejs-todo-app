<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?:
    | 'primary'
    | 'secondary'
    | 'accent'
    | 'ghost'
    | 'link'
    | 'error'
    | 'success'
    | 'warning'
    | 'info'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  outline?: boolean
  loading?: boolean
  disabled?: boolean
  block?: boolean
  type?: 'button' | 'submit' | 'reset'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  outline: false,
  loading: false,
  disabled: false,
  block: false,
  type: 'button',
})

const buttonClasses = computed(() => {
  return [
    'btn',
    `btn-${props.variant}`,
    `btn-${props.size}`,
    props.outline && 'btn-outline',
    props.loading && 'loading',
    props.block && 'btn-block',
  ]
    .filter(Boolean)
    .join(' ')
})
</script>

<template>
  <button :type="type" :class="buttonClasses" :disabled="disabled || loading">
    <span v-if="loading" class="loading loading-spinner"></span>
    <slot></slot>
  </button>
</template>
