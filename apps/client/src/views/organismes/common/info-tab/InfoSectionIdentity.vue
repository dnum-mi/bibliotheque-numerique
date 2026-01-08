<script setup lang="ts">
import { dateToStringFr, getPrefecture } from '@/utils'
import type {
  IDsEventItem,
  IFile,
  IRafEvent,
  IRnaEventOutput,
  OrganismeStatusKey,
  organismeCategoryKey,
} from '@biblio-num/shared'
import { eTypeFile } from '@biblio-num/shared'

export type tInfoIdentity = {
  siret: string | null
  state: OrganismeStatusKey
  serviceInstructeur: string
  socialObject: string | null
  department: string
  dueDate: Date | null
  files: IFile[]
  id: string,
  type: organismeCategoryKey,
  events: (IRafEvent | IDsEventItem | IRnaEventOutput)[],
}

const props = defineProps<{
  identity: tInfoIdentity
}>()

const lastStatus = computed(() => {
  const file = props.identity?.files
    ?.filter((f) => f.typeFile === eTypeFile.Statuts)
    .sort((a, b) => {
      const aDate = new Date(a.uploadedAt || a.effectiveAt || a.createdAt)
      const bDate = new Date(b.uploadedAt || b.effectiveAt || b.createdAt)
      return bDate.getTime() - aDate.getTime()
    })[0]
  if (!file) {
    return null
  }
  return file
})

const lastJoPublishedAt = computed(() => {
  const lastEvent = props.identity?.events?.filter(e => !!e.joPublishedAt)
    .sort((a, b) => {
      const aDate = new Date(a.joPublishedAt)
      const bDate = new Date(b.joPublishedAt)
      return bDate.getTime() - aDate.getTime()
    })[0]
  return lastEvent?.joPublishedAt
})
</script>

<template>
  <div>
    <div class="px-4 sm:px-0">
      <h3 class="text-base/7 font-semibold text-gray-900 mb-0 fr-background-alt--grey fr-py-3v fr-px-2w">
        Identité
      </h3>
    </div>
    <div class="mt-6 border-t border-gray-100">
      <dl class="divide-y p-0">
        <div class="py-2 md:grid md:grid-cols-4">
          <dt class="bn-fiche-sub-title--label uppercase">
            SIRET du siège social
          </dt>
          <dd class="md:col-span-3 bn-fiche-sub-title--text">
            {{ identity.siret || 'Non renseigné' }}
          </dd>
        </div>

        <div class="py-2 md:grid md:grid-cols-4">
          <dt class="bn-fiche-sub-title--label uppercase">
            État
          </dt>
          <dd
            class="bn-fiche-sub-title--text md:col-span-3"
            :class="identity.state"
          >
            {{ identity.state }}
          </dd>
        </div>

        <div class="py-2 md:grid md:grid-cols-4">
          <dt class="bn-fiche-sub-title--label uppercase">
            Publiée au JOAFE
          </dt>
          <!-- TODO: A compléter -->
          <dd
            class="bn-fiche-sub-title--text md:col-span-3"
          >
            {{ dateToStringFr(lastJoPublishedAt) || 'Non renseigné' }}
          </dd>
        </div>

        <div class="py-2 md:grid md:grid-cols-4">
          <dt class="bn-fiche-sub-title--label uppercase">
            Service instructeur du dossier
          </dt>
          <dd class="bn-fiche-sub-title--text md:col-span-3">
            {{ identity.serviceInstructeur }}
          </dd>
        </div>

        <div class="py-2 md:grid md:grid-cols-4">
          <dt class="bn-fiche-sub-title--label uppercase">
            Préfecture
          </dt>
          <dd class="bn-fiche-sub-title--text md:col-span-3">
            {{ getPrefecture(identity.department) }}
          </dd>
        </div>

        <div class="py-2 md:grid md:grid-cols-4">
          <dt class="bn-fiche-sub-title--label uppercase">
            Objet social
          </dt>
          <dd class="bn-fiche-sub-title--text md:col-span-3 max-h-50 overflow-auto whitespace-pre-wrap block">
            {{ identity.socialObject }}
          </dd>
        </div>

        <div class="py-2 md:grid md:grid-cols-4">
          <dt class="bn-fiche-sub-title--label uppercase">
            Date du terme
          </dt>
          <dd class="bn-fiche-sub-title--text md:col-span-3">
            {{ dateToStringFr(identity?.dueDate) || 'Non renseigné' }}
          </dd>
        </div>

        <div class="py-2 md:grid md:grid-cols-4">
          <dt class="bn-fiche-sub-title--label uppercase">
            Dernier status déposé
          </dt>
          <dd class="flex flex-col md:col-span-3">
            <DownloadHubFile
              v-if="lastStatus"
              :file="lastStatus"
              :organisme-id="identity.id"
              :organisme-type="identity.type"
            />
            <span class="bn-fiche-sub-title--text md:col-span-3">
              Déposé le {{ lastStatus?.uploadedAt ? dateToStringFr(lastStatus.uploadedAt) : 'Non renseigné' }}
            </span>
          </dd>
        </div>
      </dl>
    </div>
  </div>
</template>
