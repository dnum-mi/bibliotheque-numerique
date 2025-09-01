import { registerAs } from '@nestjs/config'

export default registerAs('sudo-user', () => ({
  email: process.env.DEFAULT_SUDO_EMAIL || 'admin@localhost.fr',
  forceUpsert: process.env.DEFAULT_SUDO_FORCE_UPSERT === 'true' || false,
  hashedPassword:
    process.env.DEFAULT_SUDO_HASHED_PASSWORD ||
    '$2b$10$o77FBF.T/4BCMfTpdFJXm.lfLXoGlpfIUnpUsbeMu1GontR.pfPf6',
}))
