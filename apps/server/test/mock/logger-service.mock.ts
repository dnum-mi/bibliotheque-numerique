import { LoggerService } from '../../src/shared/modules/logger/logger.service'

/* eslint-disable */
export const loggerServiceMock = jest.createMockFromModule<LoggerService>('../../src/shared/modules/logger/logger.service')
loggerServiceMock.setContext = jest.fn()
loggerServiceMock.verbose = jest.fn()
loggerServiceMock.debug = jest.fn()
loggerServiceMock.log = jest.fn()
loggerServiceMock.warn = jest.fn()
loggerServiceMock.error = jest.fn()
