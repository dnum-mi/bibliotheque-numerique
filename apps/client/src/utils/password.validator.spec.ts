import { passwordValidator } from './password.validator'

describe('passwordValidator', () => {
  it('should return a valid password', () => {
    const password = 'MyPassword123!@#'
    expect(() => passwordValidator.parse(password)).not.toThrow()
  })

  it('should throw an error if password is empty', () => {
    const password = ''
    expect(() => passwordValidator.parse(password)).toThrow('Veuillez saisir un mot de passe')
  })

  it('should throw an error if password is less than 15 characters', () => {
    const password = 'MyPassword123!'
    expect(() => passwordValidator.parse(password)).toThrow('Le mot de passe doit contenir au moins 15 caractères')
  })

  it('should throw an error if password does not contain lowercase letters', () => {
    const password = 'MYPASSWORD123!@#'
    expect(() => passwordValidator.parse(password)).toThrow('une lettre minuscule')
  })

  it('should throw an error if password does not contain uppercase letters', () => {
    const password = 'mypassword123!@#'
    expect(() => passwordValidator.parse(password)).toThrow('une lettre majuscule')
  })

  it('should throw an error if password does not contain numbers', () => {
    const password = 'MyPasswordonetwo!@#'
    expect(() => passwordValidator.parse(password)).toThrow('un chiffre')
  })

  it('should throw an error if password does not contain special characters', () => {
    const password = 'MyPassword123otherchars'
    expect(() => passwordValidator.parse(password)).toThrow('un caractère spécial')
  })
})
