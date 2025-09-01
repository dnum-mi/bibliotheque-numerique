import { applyDecorators, Type } from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { RolesKeys } from '@biblio-num/shared'

type DecoratorList = (ClassDecorator | MethodDecorator | PropertyDecorator)[]

interface iUsualApiOperation {
  summary: string
  minimumRole: RolesKeys
  method: 'POST' | 'GET' | 'PUT' | 'DELETE' | 'PATCH'
  responseType: Type<unknown> | null
  isArray?: boolean
  isPagination?: boolean
  supplement?: string
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function UsualApiOperation(...options: iUsualApiOperation[]) {
  const elements = []
  if (options[0].method === 'POST') {
    elements.push(
      ApiConflictResponse({
        description:
          'Une clef unique de validation a été violée. La ressource existe déjà.',
      }),
      ApiCreatedResponse({
        description: 'La ressource a été créée avec succès.',
        type: options[0].responseType,
        isArray: options[0].isArray,
      }),
      ApiBadRequestResponse({
        description:
          "La requête n'a pas été correctement formatée. Vérifiez les paramètres.",
      }),
    )
  } else if (options[0].method === 'GET') {
    elements.push(
      ApiOkResponse({
        description: 'La ressource a été correctement retournée.',
        type: options[0].responseType,
        isArray: options[0].isArray,
      }),
      ApiNotFoundResponse({
        description: 'Aucune ressource ne correspond à cet identifiant.',
      }),
    )
  } else {
    elements.push(
      ApiBadRequestResponse({
        description:
          "La requête n'a pas été correctement formatée. Vérifiez les paramètres.",
      }),
      ApiOkResponse({
        description: "L'opération s'est correctement déroulée.",
        type: options[0].responseType,
        isArray: options[0].isArray,
      }),
      ApiNotFoundResponse({
        description: 'Aucune ressource ne correspond à cet identifiant.',
      }),
    )
  }
  const list: DecoratorList = [
    ApiOperation({
      summary: options[0].summary,
      description: `${options[0].summary}\n${
        options[0].supplement ? options[0].supplement + '\n' : ''
      }${
        options[0].isPagination
          ? 'Cette route supporte la pagination. Comme toutes les routes de pagination,' +
            ' elle est en POST et attend un PaginationDto en argument et retourne un Paginated. Voir les modèles.\n'
          : ''
      }Le role minimum pour cette route est: ${options[0].minimumRole}`,
    }),
    ...elements,
    ApiForbiddenResponse({
      description:
        "Vous n'avez pas les droits suffisants pour accéder à cette ressource.",
    }),
    ApiUnauthorizedResponse({
      description: 'Vous devez être identifié pour accéder à cette ressource.',
    }),
    ApiInternalServerErrorResponse({
      description:
        "Une erreur interne est survenue. Contactez l'administrateur de l'application.",
    }),
  ]

  return applyDecorators(...list)
}
