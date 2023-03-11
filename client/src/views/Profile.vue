<template>
  <LayoutList>
    <template #title>
      <div class="bn-list-search bn-list-search-profile">
        <span
          class="fr-icon-account-circle-line fr-p-1w"
          aria-hidden="true"
        />
        <h6 class="bn-list-search-title-profile fr-p-1w fr-m-0">
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
    <BiblioNumDataTableAgGrid
      title="La liste des vos rôles"
      :headers="rolesHeadersJson"
      :row-data="rolesRowData"
      :with-action="false"
      @selection-changed="onSelectionChanged"
    />
  </LayoutList>
</template>

<script setup lang="ts">

import { useUserStore } from '@/stores'
import { dateTimeToStringFr, dateToStringFr } from '@/utils/dateToString'
import LayoutList from '@/components/LayoutList.vue'
import DisplayLabelsValues from '@/components/DisplayLabelsValues.vue'
import { computed } from 'vue'
import BiblioNumDataTableAgGrid from '@/components/BiblioNumDataTableAgGrid.vue'
import { IRole } from '@/shared/interfaces'

const userStore = useUserStore()
const datas = userStore.currentUser
const title = 'profile'

const labelsDate = [
  {
    text: 'Date de création',
    value: 'createAt',
    parseFn: dateTimeToStringFr,
  },
  {
    text: 'Date de derniére modification',
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
  return [...datas.roles.values()].map((role: IRole) => ({
    ...role,
    permissions: role.permissions.map((permission) => permission.name).join(', '),
  }))
})

</script>
