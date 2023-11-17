<template>
  <LayoutList>
    <template #title>
      <div class="bn-banner  bn-banner--profile">
        <span
          class="fr-icon-account-circle-line  fr-p-1w"
          aria-hidden="true"
        />
        <h6 class="bn-banner-title  fr-p-1w  fr-m-0">
          Mon profil
        </h6>
      </div>
    </template>
    <DisplayLabelsValues
      :title="title"
      prefix-id="profile"
      :datas="datas"
      :labels="labelsDate"
      class="fr-pb-3v fr-m-5w"
    />

    <div
      class="fr-container fr-grid-row fr-mb-2w"
    >
      <DsfrButton
        class="fr-mb-2w"
        type="buttonType"
        label="Modifier mon mot de passe"
        secondary
        no-outline
        @click="onClick()"
      />

      <DsfrAlert
        class="fr-col-12 fr-pm-2w"
        :title="alertTitle"
        :description="alertDescription"
        :type="alertType"
        :closed="!openAlert"
        closeable
        @close="() => openAlert=false"
      />
    </div>

    <BiblioNumDataTableAgGrid
      title="La liste des vos rôles"
      action-title=""
      :headers="rolesHeadersJson"
      :row-data="rolesRowData"
    />
  </LayoutList>
</template>

<script setup lang="ts">

import { useUserStore } from '@/stores'
import { dateTimeToStringFr, dateToStringFr } from '@/utils'
import LayoutList from '@/components/Layout/LayoutList.vue'
import DisplayLabelsValues from '@/components/DisplayLabelsValues.vue'
import { computed, ref } from 'vue'
import BiblioNumDataTableAgGrid from '@/components/BiblioNumDataTableAgGrid.vue'
import type { IRole } from '@/shared/interfaces'
import apiClient from '@/api/api-client'
import type { ResetPasswordInputDto } from '@biblio-num/shared'
import { ASK_RESET_PWD_SUCCESS } from '../../messages'

const userStore = useUserStore()
const datas = userStore.currentUser
const title = 'profile'

const alertTitle = ref('')
const alertDescription = ref('')
const openAlert = ref(false)
const alertType = ref('info')

const labelsDate = [
  {
    text: 'Date de création',
    value: 'createAt',
    parseFn: dateTimeToStringFr,
  },
  {
    text: 'Date de dernière modification',
    value: 'updateAt',
    parseFn: dateTimeToStringFr,
  },
  {
    text: 'Email',
    value: 'email',
  },
]

const rolesHeadersJson = [
  {
    text: 'le nom du rôle',
    value: 'name',
  },
  {
    text: 'Description',
    value: 'description',
  },
  {
    text: 'Permissions',
    value: 'permissions',
  },
  {
    text: 'Created At',
    value: 'createAt',
    parseFn: dateToStringFr,
    type: 'date',
  },
  {
    text: 'Updated At',
    value: 'updateAt',
    parseFn: dateToStringFr,
    type: 'date',
  },
]

const rolesRowData = computed(() => {
  return [] // TODO: role refacto
})

const onClick = async () => {
  await apiClient.resetPassword({ email: datas?.email } as ResetPasswordInputDto)
  alertType.value = 'info'
  openAlert.value = true
  alertDescription.value = ASK_RESET_PWD_SUCCESS
}

</script>
