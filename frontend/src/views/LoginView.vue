<script setup>
import {ref} from 'vue'
import{User,Lock,ArrowRight} from 'lucide-vue-next'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const login = ref('')
const senha = ref('')
</script>

<template>
    <div class="min-h-screen flex items-center justify-center bg-bg-1 p-8">
        <div class="w-full max-w-md bg-bg-0 rounded-lg shadow-xl p-8">

            <div class="flex items-center gap-3 mb-6">
                <div class="bg-accent w-11 h-11 rounded-md flex items-center justify-center text-white font-bold text-display">
                    SZ
                </div>
                <div class="font-bold text-heading text-text-0">
                    <span>SAFEZONE</span>
                    <p class="text-caption text-text-2">Controle Setorial de EPI</p>
                </div>
            </div>

            <h1 class="text-heading font-bold text-text-0 mb-1">Entrar na sua conta</h1>
            <p class="text-caption text-text-2 mb-6">Acesso restrito a técnicos e engenheiros de segurança do trabalho autorizados.</p>
            <form class="flex flex-col gap-1">
                <BaseInput
                    v-model="login"
                    label="Usuário"
                    placeholder="Insira seu usuário"
                    :icon="User"
                />

                <BaseInput
                    v-model="senha"
                    label="Senha"
                    type="password"
                    placeholder="••••••••"
                    :icon="Lock"
                />

                <BaseButton variant="primary">
                    <span class="flex itemns-center justify-center gap-1 ">Entrar 
                    <ArrowRight class="w-4 h-4"/>  
                    </span>
                </BaseButton>
            </form>
        </div>

    </div>
</template>