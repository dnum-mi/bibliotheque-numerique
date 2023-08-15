<template>
  <BiblioNumDataTableAgGrid
    title="Roles"
    component-action=""
    :headers="rolesHeadersJson"
    :row-data="rolesRowData"
    with-action="{{ true }}"
    row-selection="single"
    @get-elt="getRole"
    @selection-changed="onSelectionChanged"
  />
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import BiblioNumDataTableAgGrid from '@/components/BiblioNumDataTableAgGrid.vue'
import { useRoleStore, useUserStore } from '@/stores'
import { dateToStringFr } from '@/utils'
import type { IRole } from '@/shared/interfaces'
import router from '@/router'
import { RoleName } from '@/shared/types/Permission.type'

const userStore = useUserStore()
const roleStore = useRoleStore()

const rolesHeadersJson = [
  {
    value: 'id',
    action: { condition: (role: IRole) => canManageRoles.value && (role.name !== RoleName.ADMIN) },
  },
  {
    text: 'Id',
    value: 'id',
    width: 65,
  },
  {
    text: 'Name',
    value: 'name',
    width: 200,
  },
  {
    text: 'Description',
    value: 'description',
    width: 250,
  },
  {
    text: 'Permissions',
    value: 'permissions',
    width: 250,
  },
  {
    text: 'Created At',
    value: 'createAt',
    parseFn: dateToStringFr,
    type: 'date',
    width: 130,
  },
  {
    text: 'Updated At',
    value: 'updateAt',
    parseFn: dateToStringFr,
    type: 'date',
    width: 130,
  },
]

const rolesRowData = computed(() => {
  return [...roleStore.roles.values()].map((role: IRole) => ({
    ...role,
    permissions: role.permissions.map((permission) => permission.name).join(', '),
  }))
})

const canManageRoles = computed(() => userStore.canManageRoles)

const getRole = async (data: IRole) => {
  router.push({ name: 'Role', params: { id: data.id } })
}

onMounted(async () => {
  try {
    await roleStore.fetchRoles()
  } catch (error) {
    console.error(error)
  }
})

</script>
@/utils/date-to-string
