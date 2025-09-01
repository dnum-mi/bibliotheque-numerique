<script lang="ts" setup>
import sanitizeHtml from 'sanitize-html'

import iconRoundMarianne from '@/assets/icone-ronde-marianne.png'
import type { File } from '@dnum-mi/ds-api-client'

type Message = {
  id: number
  date: Date
  email: string
  body: string
  attachments: File[]
}

type DossierMessagerieProps = {
  messages?: Array<Message>
  demandeurEmail?: string
}

defineProps<DossierMessagerieProps>()
</script>

<template>
  <section
    class="bg-[var(--background-default-grey)]  flex  flex-col  overflow-y-auto  h-full p-4"
  >
    <div
      class="flex  flex-col  overflow-y-auto  h-full"
    >
      <header class="flex  justify-between  items-center  gap-2  h-24">
        <div class="flex  items-center  gap-2  fr-pb-4w">
          <div class="flex  justify-center  items-center  rounded-[50%]  h-[2rem]  w-[2rem]  bg-[var(--blue-france-sun-113-625)]">
            <VIcon
              name="ri-chat-3-line"
              color="white"
            />
          </div>
          <strong>Messagerie</strong>
        </div>
      </header>
      <article
        v-for="(message, idx) of messages"
        :key="idx"
      >
        <div
          class="flex  gap-2"
        >
          <div class="flex  flex-shrink-0  justify-center  items-center  rounded-[50%]  h-[2rem]  w-[2rem]  bg-[var(--blue-france-sun-113-625)]">
            <span
              v-if="demandeurEmail === message.email"
              class="fr-icon-account-line color-white"
              aria-hidden="true"
              role="presentation"
            />
            <img
              v-else
              role="presentation"
              alt=""
              :src="iconRoundMarianne"
            >
          </div>
          <div>
            <header class="text-sm  mb-1">
              <span class="font-bold  text-[var(--blue-france-sun-113-625)]">
                {{ message.email }}
              </span>
              <span
                class="text-[var(--grey-625-425)]"
              >
                -
                {{ message.date }}
              </span>
            </header>
            <div
              class="text-sm"
              v-html="sanitizeHtml(message.body)"
            />
            <footer class="fr-my-2v  text-sm  flex  gap-2  flex-wrap">
              <div
                v-for="(file, j) of message.attachments"
                :key="j"
                class="fr-py-1v  fr-px-2v flex  items-center  bg-[#e8edff]"
              >
                <DownloadFile
                  :file="file"
                />
              </div>
            </footer>
          </div>
        </div>
        <hr class="fr-my-2w">
      </article>
    </div>
  </section>
</template>

<style scoped>
.footer {
  transition: all 0.3s ease-in-out;
}
</style>
