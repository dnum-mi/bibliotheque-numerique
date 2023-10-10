<script setup lang="ts">
import { useRoleStore, useUserStore } from '@/stores'
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import BiblioNumDataTableAgGrid from '@/components/BiblioNumDataTableAgGrid.vue'
import { dateToStringFr } from '@/utils'
import type { IRole, User } from '@/shared/interfaces'

const idUser = ref(0)

const userStore = useUserStore()
const roleStore = useRoleStore()
const dataCy = 'user'

const userData = computed<User | undefined>(() => {
  return userStore.users.get(idUser.value)
})

const hasRoleId = (id: number) =>
  userData.value?.roles
    ?.map((r: IRole) => r.id)
    .includes(id)

const rolesRowData = computed(() => Array.from(roleStore.roles.values()))

const assignRole = async (roleId: number) => {
  await roleStore.assignRole(idUser.value, roleId)
}

const unassignRole = async (roleId: number) => {
  await roleStore.unassignRole(idUser.value, roleId)
}

const getElt = async (data: { id: number }) => {
  try {
    hasRoleId(data.id) ? await unassignRole(data.id) : await assignRole(data.id)
    await userStore.loadUserById(idUser.value)
    idUser.value = Number(idUser.value)
  } catch (error) {
    import.meta.env.DEV && console.error(error)
  }
}

onMounted(async () => {
  const params = useRoute()?.params
  if (params && params.id) { idUser.value = Number(params.id) }
  try {
    await Promise.all([
      userStore.loadUserById(idUser.value),
      roleStore.fetchRoles(),
    ])
  } catch (error) {
    import.meta.env.DEV && console.error(error)
  }
})

const rolesHeadersJson = [
  {
    value: 'id',
    action: {
      icon: ({ id }: {id: number}) => {
        return hasRoleId(id)
          ? 'ri-indeterminate-circle-line'
          : 'ri-add-circle-line'
      },
    },
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

</script>

<template>
  <div class="fr-container">
    <h2 class="mb-20">
      Utilisateur
    </h2>
  </div>
  <div
    v-if="userData"
    :data-cy="dataCy"
    class="flex"
  >
    <div class="user-info">
      <div class="fr-col-12 fr-grid-row">
        <label class="fr-text--bold">Id :</label>
        <span class="fr-text"> {{ userData.id }}</span>
      </div>
      <div class="fr-col-12 fr-grid-row">
        <label class="fr-text--bold">Email :</label>
        <span class="fr-text"> {{ userData.email }}</span>
      </div>
      <div class="fr-col-12 fr-grid-row">
        <label class="fr-text--bold">Roles :</label>
        <span class="fr-text"> {{ userData.roles?.map((r: IRole) => r.name).join(', ') }}</span>
      </div>
    </div>
    <div
      class="role-list"
      data-cy="user-role-list"
    >
      <BiblioNumDataTableAgGrid
        title="Roles"
        action-title=""
        component-action=""
        with-action
        :headers="rolesHeadersJson"
        :row-data="rolesRowData"
        @get-elt="getElt($event)"
      />
    </div>
  </div>
</template>

<style scoped>
.user-info {
  flex: 1;
  padding: 50px 50px;
}
.fr-text--bold {
  padding-right: 10px;
}
.role-list {
  flex: 2;
}
</style>
