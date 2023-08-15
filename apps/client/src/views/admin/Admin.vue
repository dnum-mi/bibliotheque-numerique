<template>
  <div class="fr-container">
    <h2 class="mb-20">
      Espace administration
    </h2>
    <div
      v-if="canManageRole"
      class="role-form"
    >
      <DsfrInputGroup
        :is-valid="roleNameError"
        :error-message="roleNameError"
      >
        <DsfrInput
          id="roleName"
          v-model="roleNameValue"
          label="Nom du rôle"
          placeholder="Nom du rôle"
          type="text"
          required
        />
      </DsfrInputGroup>
      <DsfrInputGroup
        :is-valid="roleDescriptionError"
        :error-message="roleDescriptionError"
      >
        <DsfrInput
          id="roleDescription"
          v-model="roleDescriptionValue"
          label="Description du rôle"
          placeholder="Description du rôle"
          type="text"
          required
        />
      </DsfrInputGroup>
      <DsfrButton
        type="button"
        @click="createRole"
      >
        Ajouter un rôle
      </DsfrButton>
    </div>
  </div>
  <div
    style="display: flex"
  >
    <div
      :class="canManageRole?'fr-col-6':'fr-col-12'"
      data-cy="user-list"
    >
      <BiblioNumDataTableAgGrid
        title="Utilisateurs"
        :headers="usersHeadersJson"
        :row-data="usersRowData"
        with-action="{{ true }}"
        @get-elt="getUser"
      />
    </div>
    <div
      v-if="canManageRole"
      class="fr-col-6"
      data-cy="role-list"
    >
      <AdminRoles />
    </div>
  </div>
</template>

<script setup lang="ts">
import BiblioNumDataTableAgGrid from '@/components/BiblioNumDataTableAgGrid.vue'
import { useUserStore, useRoleStore } from '@/stores'
import { dateToStringFr } from '@/utils'
import { computed, onMounted } from 'vue'
import { DsfrInputGroup, DsfrInput, DsfrButton } from '@gouvminint/vue-dsfr'
import type { IRoleForm, User } from '@/shared/interfaces'
import { toFormValidator } from '@vee-validate/zod'
import { z } from 'zod'
import { useField, useForm } from 'vee-validate'
import router from '@/router'
import AdminRoles from './AdminRoles.vue'

const userStore = useUserStore()
const roleStore = useRoleStore()

const usersHeadersJson = [
  {
    text: 'Id',
    value: 'id',
    width: 65,
  },
  {
    text: 'Email',
    value: 'email',
    width: 250,
  },
  {
    text: 'Roles',
    value: 'roles',
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

const usersRowData = computed(() => {
  return [...userStore.users.values()].map((user: User) => ({
    ...user,
    roles: user.roles.map((role) => role.name).join(', '),
  }))
})
const canManageRole = computed(() => userStore.canManageRoles)

const validationSchema = toFormValidator(z.object({
  name: z.string({ required_error: 'Vous devez renseigner ce champ' }),
  description: z.string({ required_error: 'Vous devez renseigner ce champ' }),
}))

const { setErrors } = useForm<IRoleForm>({
  validationSchema,
})

const { value: roleNameValue, errorMessage: roleNameError } = useField<string>('roleName')
const { value: roleDescriptionValue, errorMessage: roleDescriptionError } = useField<string>('roleDescription')

const createRole = async () => {
  try {
    await roleStore.createRole({ name: roleNameValue.value, description: roleDescriptionValue.value })
    roleNameValue.value = ''
    roleDescriptionValue.value = ''
  } catch (e) {
    setErrors({ name: e as string })
  }
}

const getUser = (data: { id: number }) => {
  router.push({ name: 'User', params: { id: data.id } })
}

onMounted(async () => {
  await Promise.all([userStore.loadUsers()])
})

</script>

<style lang="scss">
  .role-form {
    display: flex;
    .fr-input-group {
      .fr-input {
        margin: 0;
      }
      min-width: 160px;
      margin: 10px;
      flex: 1;
      &:nth-child(2) {
        flex: 3;
      }
    }
    .fr-btn {
      margin: 10px;
      flex: 1;
      min-width: 160px;
    }
  }
</style>
@/utils/date-to-string
