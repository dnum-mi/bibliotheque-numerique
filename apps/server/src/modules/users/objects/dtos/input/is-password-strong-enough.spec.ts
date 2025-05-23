import { validate } from 'class-validator'
import { IsPasswordStrongEnough } from './is-password-strong-enough'

class DummyDto {
  @IsPasswordStrongEnough({ message: 'Password is too weak' })
  password!: string
}

describe('IsPasswordStrongEnough', () => {
  it('should pass for a strong password', async () => {
    const dto = new DummyDto()
    dto.password = 'Abcdefghijklmn1!'

    const errors = await validate(dto)
    expect(errors).toHaveLength(0)
  })

  it('should fail if password is too short', async () => {
    const dto = new DummyDto()
    dto.password = 'Abc1!'

    const errors = await validate(dto)
    expect(errors).toHaveLength(1)
    expect(errors[0].constraints?.IsPasswordStrongEnough).toBe('Password is too weak')
  })

  it('should fail if missing special char', async () => {
    const dto = new DummyDto()
    dto.password = 'Abcdefghijklmn1'

    const errors = await validate(dto)
    expect(errors).toHaveLength(1)
  })

  it('should fail if missing number', async () => {
    const dto = new DummyDto()
    dto.password = 'Abcdefghijklmno!'

    const errors = await validate(dto)
    expect(errors).toHaveLength(1)
  })

  it('should fail if missing uppercase', async () => {
    const dto = new DummyDto()
    dto.password = 'abcdefghijklm1!'

    const errors = await validate(dto)
    expect(errors).toHaveLength(1)
  })

  it('should fail if missing lowercase', async () => {
    const dto = new DummyDto()
    dto.password = 'ABCDEFGHIJKLM1!'

    const errors = await validate(dto)
    expect(errors).toHaveLength(1)
  })
})
