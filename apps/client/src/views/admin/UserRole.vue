<script lang="ts" setup>
import type { RolesKeys, UserWithEditableRole } from '@biblio-num/shared'
import { Roles } from '@/biblio-num/shared'
import { useUserStore } from '@/stores'
import { computed } from 'vue'

const userStore = useUserStore()
const selectedUser = computed<UserWithEditableRole | null>(() => userStore.selectedUser)
const role = computed<RolesKeys|''>(() => selectedUser.value?.originalUser.role.label || '')

const roleOptions = [
  {
    label: 'Administrateur',
    value: Roles.admin,
  },
  {
    label: 'Instructeur',
    value: Roles.instructor,
  },
]
const updateRole = async (event: string) => {
  await userStore.updateRole(event)
}

</script>

<template>
  <DsfrRadioButtonSet
    v-model="role"
    name="role"
    :options="roleOptions"
    @update:model-value="updateRole($event as string)"
  />
</template>
