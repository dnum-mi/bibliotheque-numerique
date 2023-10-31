<script lang="ts" setup>
import iconRoundMarianne from '@/assets/icone-ronde-marianne.png'

type Message = {
    id: number
    date: Date
    from: string
    body: string
    attachments: {
        name: string
        size: string
    }[]
}
type DossierMessagerieProps = {
  messages?: Array<Message>
}
defineProps<DossierMessagerieProps>()

const extensions = {
  pdf: 'fa-regular-file-pdf',
  'doc docx odt ods': 'fa-regular-file-word',
  'xsl xslx csv': 'fa-regular-file-excel',
  'jpg jpeg png gif': 'fa-regular-file-image',
  default: 'ri-attachment-line',
}

const getIconNameFromExtension = (ext?: string) => {
  if (ext == null) {
    return extensions.default
  }
  if (getIconNameFromExtension.memo[ext]) {
    return getIconNameFromExtension.memo[ext]
  }
  const icon = Object.entries(extensions).find(([extensions]) => extensions.split(' ').includes(ext))
  const iconName = getIconNameFromExtension.memo[ext ?? ''] = (icon?.[1] ?? extensions.default)
  return iconName
}
getIconNameFromExtension.memo = {} as Record<string, string>

const getIconNameFromFilename = (filename: string) => {
  const ext = filename.split('.').at(-1)
  console.log({ ext })
  return getIconNameFromExtension(ext)
}
</script>

<template>
  <section class="bg-[var(--background-default-grey)]">
    <header class="flex  justify-between  items-center  gap-2  h-24">
      <div class="flex items-center gap-2">
        <div class="flex  justify-center  items-center  rounded-[50%]  h-[2rem]  w-[2rem]  bg-[var(--blue-france-sun-113-625)]">
          <VIcon
            name="ri-chat-3-line"
            color="white"
          />
        </div>
        <strong>Messagerie</strong>
        <DsfrTag
          :label="messages.length"
        />
      </div>
      <div>
        <DsfrButton
          type="button"
          label="Accéder à la TLD"
          secondary
        />
      </div>
    </header>
    <article
      v-for="(message, idx) of messages"
      :key="idx"
    >
      <div
        class="flex gap-2"
      >
        <div class="flex  flex-shrink-0  justify-center  items-center  rounded-[50%]  h-[2rem]  w-[2rem]  bg-[var(--blue-france-sun-113-625)]">
          <img
            role="presentation"
            alt=""
            :src="iconRoundMarianne"
          >
        </div>
        <div>
          <header class="text-sm  mb-1">
            <span class="font-bold  text-[var(--blue-france-sun-113-625)]">
              {{ message.from }}
            </span>
            -
            <span class="text-[var(--grey-625-425)]">
              {{ message.date }}
            </span>
          </header>
          <div class="text-sm">
            {{ message.body }}
          </div>
          <footer class="fr-my-2v  text-sm  flex  gap-2  flex-wrap">
            <div
              v-for="(file, j) of message.attachments"
              :key="j"
              class="fr-py-1v  fr-px-2v flex  items-center  bg-[#e8edff]"
            >
              <VIcon
                class="fr-mr-1v"
                :name="getIconNameFromFilename(file.name)"
                color="var(--blue-france-sun-113-625)"
              />
              <span>{{ file.name }}</span>
              <em class="text-[var(--grey-625-425)]"> - {{ file.size }}</em>
            </div>
          </footer>
        </div>
      </div>
      <hr class="fr-my-2w">
    </article>
  </section>
</template>
