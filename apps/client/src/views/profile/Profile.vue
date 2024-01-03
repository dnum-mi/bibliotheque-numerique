<script setup lang="ts">
import type { MyProfileOutputDto } from '@biblio-num/shared'

import LayoutBanner from '@/components/Layout/LayoutBanner.vue'
import { useUserStore } from '@/stores'
import { dateToStringFr } from '@/utils'
import RoleBadge from '@/components/Badges/RoleBadge.vue'
import type { ResetPasswordInputDto } from '@biblio-num/shared/types/dto/user/reset-password-input.dto'
import apiClient from '@/api/api-client'
import { ASK_RESET_PWD_SUCCESS } from '@/messages'
import type { DsfrAlertType } from '@gouvminint/vue-dsfr/types/components/DsfrAlert/DsfrAlert.vue'
import EditableField from './EditableField.vue'

const store = useUserStore()
const user = computed<MyProfileOutputDto | null>(() => store.myProfile)

type Field = {
  title: string;
  userKey: keyof MyProfileOutputDto;
  parseFct?: (v: string) => string;
  editable?: boolean;
};

const fields = reactive<Field[]>([
  {
    title: 'Nom',
    userKey: 'lastname',
    editable: true,
  },
  {
    title: 'Prénom',
    userKey: 'firstname',
    editable: true,
  },
  {
    title: 'Création',
    userKey: 'createdAt',
    parseFct: dateToStringFr,
  },
  {
    title: 'Dernière modification',
    userKey: 'updatedAt',
    parseFct: dateToStringFr,
  },
  {
    title: 'Courriel',
    userKey: 'email',
  },
  {
    title: 'Intitulé de la fonction',
    userKey: 'job',
    editable: true,
  },
])

const alertTitle = ref('')
const alertDescription = ref('')
const openAlert = ref(false)
const alertType = ref<DsfrAlertType>('info')

const onClick = async () => {
  await apiClient.resetPassword({ email: user.value?.email } as ResetPasswordInputDto)
  alertType.value = 'info'
  openAlert.value = true
  alertDescription.value = ASK_RESET_PWD_SUCCESS
}

onMounted(() => {
  store.loadMyProfile()
})

const printField = (field: Field): string => {
  const value = `${user.value?.[field.userKey]}`
  return field.parseFct ? field.parseFct(value) : value
}

const updateProfile = async (field: Field, newText: string) => {
  if (!newText) return
  await store.changeMyProfile({
    [field.userKey]: newText,
  })
}
</script>

<template>
  <div class="flex flex-col">
    <LayoutBanner
      title="Mon profile"
      title-bg-color="var(--border-plain-green-bourgeon)"
      title-icon="fr-icon-profil-line"
    />
    <div class="flex  fr-pb-4w">
      <div class="max-width-container fr-mt-md-20v flex flex-row gap-20">
        <!-- Information utilisateur -->
        <div class="flex-1">
          <h4>Mes informations de connexion</h4>
          <hr>
          <!-- EACH FIELDSS -->
          <div
            v-for="field in fields"
            :key="field.userKey"
          >
            <div class="flex flex-col one-col-height">
              <div class="flex-1">
                <strong>{{ field.title }}</strong>
              </div>
              <div v-if="field.editable">
                <EditableField
                  :text="printField(field)"
                  @update-new-value="updateProfile(field, $event)"
                />
              </div>
              <div
                v-else
                class="flex-1"
              >
                {{ printField(field) }}
              </div>
            </div>
            <hr class="fr-mt-1v">
          </div>
          <!-- CHANGE PASSWORD -->
          <div class="flex flex-col one-col-height">
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
              @close="() => (openAlert = false)"
            />
          </div>
        </div>
        <!-- Role de l'utilisateur -->
        <div class="flex-1">
          <h4>Mon role</h4>
          <hr>
          <div class="flex flex-col one-col-height">
            <role-badge
              class="mb-5"
              :role="user?.role?.label"
              :small="false"
            />
          </div>
          <hr class="fr-mt-1v">
          <div
            v-for="option in user?.role?.options"
            :key="option.demarche?.id"
          >
            <div class="flex flex-col one-col-height">
              <div class="flex-1">
                <strong>{{ option.demarche.title }}</strong>
              </div>
              <div
                v-if="option.national"
                class="flex-1"
              >
                NATIONAL
              </div>
              <div
                v-else
                class="flex-1"
              >
                {{ option.prefectures.map(p => p.substring(1)).join(", ") }}
              </div>
            </div>
            <hr class="fr-mt-1v">
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.max-width-container {
  width: 1000px;
  margin: 0 auto;
}

.one-col-height {
  height: 50px;
}
</style>
