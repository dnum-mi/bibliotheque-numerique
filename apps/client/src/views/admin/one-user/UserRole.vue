<script lang="ts" setup>
import type { HTMLAttributes } from 'vue'
import { computed, ref } from 'vue'
import type { RolesKeys, UserWithEditableRole } from '@biblio-num/shared'

import { Roles } from '@/biblio-num/shared'
import { useUserStore } from '@/stores'
import DsfrWarningButton from '@/components/dsfr-extends/dsfr-warning-button.vue'
import type { DsfrRadioButtonProps } from '@gouvminint/vue-dsfr/types/components/DsfrRadioButton/DsfrRadioButton.vue'

const userStore = useUserStore()
const selectedEditableUser = computed<UserWithEditableRole | null>(() => userStore.selectedEditableUser)

const role = computed<RolesKeys | ''>(() => selectedEditableUser.value?.originalUser.role.label || '')

const allRoleOptions: DsfrRadioButtonProps[] = [
  {
    label: 'Super Administrateur',
    value: Roles.superadmin,
  },
  {
    label: 'Administrateur',
    value: Roles.admin,
  },
  {
    label: 'Instructeur',
    value: Roles.instructor,
  },
]

const roleOptions = computed<Array<DsfrRadioButtonProps & HTMLAttributes>>(() =>
  allRoleOptions.map((roleOption) => ({
    ...roleOption,
    disabled: !selectedEditableUser.value?.possibleRoles.includes('' + roleOption.value),
  })),
)

console.log(roleOptions.value)

const updateRole = async (event: string) => {
  await userStore.updateRole(event)
}

const onRemoveRole = async () => {
  await userStore.removeRole()
  isModalOpen.value = false
}

const isModalOpen = ref(false)
</script>

<template>
  <DsfrRadioButtonSet
    :model-value="role"
    name="role"
    :options="roleOptions"
    @update:model-value="updateRole($event as string)"
  />

  <DsfrWarningButton
    :disabled="!selectedEditableUser?.deletable"
    icon="ri-close-line"
    label="Retirer le rôle"
    @click="isModalOpen = true"
  />

  <DsfrModal
    :opened="isModalOpen"
    title="Retirer le rôle"
    :actions="[
      { label: 'Retirer le rôle', onClick: onRemoveRole },
      { label: 'Annuler', onClick: () => (isModalOpen = false), secondary: true },
    ]"
    @close="isModalOpen = false"
  >
    <p class="m-1">
      Vous vous apprêtez à retirer tous les rôles de
      <strong>{{ selectedEditableUser?.originalUser.firstname }} {{ selectedEditableUser?.originalUser.lastname }}</strong>.
    </p>
    <p class="m-1">
      Cette action est irréversible.
    </p>
    <p class="m-1">
      Êtes-vous sûr de vouloir continuer ?
    </p>
  </DsfrModal>
</template>

<style scoped></style>
